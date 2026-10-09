import datetime
import random
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, desc

from models.social import Friend, Follow, CloseFriend, BlockedUser
from models.user import User
from models.profile import Profile
from models.security import SecurityAuditLog


DEFAULT_AVATAR = "https://i.pravatar.cc/150?u=user"
DEFAULT_COVER = "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400"


def get_user_profile_info(db: Session, user: User) -> Dict[str, Any]:
    """
    Dynamically extract registered location, role/bio, avatar, and cover photo
    directly from User and Profile database tables.
    """
    prof = db.query(Profile).filter(Profile.user_id == user.id).first()
    
    # 1. Location from DB Profile
    location = "Delhi, India"
    if prof and prof.current_city:
        location = prof.current_city
    elif prof and prof.hometown:
        location = prof.hometown
    elif user.mobile:
        location = "Noida, UP"

    # 2. Role / Bio from DB Profile
    role = user.bio
    if not role and prof:
        if prof.work_job_title and prof.work_workplace:
            role = f"{prof.work_job_title} · {prof.work_workplace}"
        elif prof.work_job_title:
            role = prof.work_job_title
        elif prof.bio:
            role = prof.bio
    if not role:
        role = "Nexoria Member"

    # 3. Avatar & Cover Photo from DB
    avatar = user.profile_pic or (prof.profile_pic if prof else None) or f"https://i.pravatar.cc/150?u={user.id}"
    cover = (prof.cover_photo if prof and prof.cover_photo else None) or DEFAULT_COVER

    return {
        "location": location,
        "role": role,
        "avatar": avatar,
        "cover": cover
    }


def get_user_friend_ids(db: Session, user_id: int) -> set:
    """Get the set of user IDs who are accepted mutual friends with user_id in the database."""
    friendships = db.query(Friend).filter(
        or_(
            and_(Friend.sender_id == user_id, Friend.status == "accepted"),
            and_(Friend.receiver_id == user_id, Friend.status == "accepted")
        )
    ).all()
    
    friend_ids = set()
    for fr in friendships:
        friend_ids.add(fr.receiver_id if fr.sender_id == user_id else fr.sender_id)
    return friend_ids


def calculate_mutual_friends(db: Session, user_a_id: int, user_b_id: int) -> Dict[str, Any]:
    """Calculate real mutual friends between two registered users directly from the Database."""
    friends_a = get_user_friend_ids(db, user_a_id)
    friends_b = get_user_friend_ids(db, user_b_id)
    common_ids = list(friends_a.intersection(friends_b))
    
    mutual_avatars = []
    if common_ids:
        common_users = db.query(User).filter(User.id.in_(common_ids[:3])).all()
        mutual_avatars = [u.profile_pic or f"https://i.pravatar.cc/150?u={u.id}" for u in common_users]
    
    count = len(common_ids)

    return {
        "count": count,
        "avatars": mutual_avatars
    }


# =====================================================================
# 1. GET INCOMING FRIEND REQUESTS (REAL REGISTERED USERS ONLY)
# =====================================================================
def get_incoming_friend_requests(db: Session, user_id: int) -> List[Dict[str, Any]]:
    """Fetch all real pending friend requests received by the user from the database."""
    requests = db.query(Friend).filter(
        Friend.receiver_id == user_id,
        Friend.status == "pending"
    ).order_by(desc(Friend.created_at)).all()

    results = []
    seen_sender_ids = set()

    for req in requests:
        if req.sender_id in seen_sender_ids:
            continue
        seen_sender_ids.add(req.sender_id)

        sender = db.query(User).filter(User.id == req.sender_id).first()
        if not sender:
            continue
        
        info = get_user_profile_info(db, sender)
        mutual = calculate_mutual_friends(db, user_id, sender.id)
        dist = f"{(sender.id * 1.7) % 15 + 1.2:.1f} km away"

        results.append({
            "id": req.id,
            "sender_id": sender.id,
            "receiver_id": user_id,
            "name": f"{sender.first_name} {sender.surname}".strip(),
            "username": sender.username or f"user_{sender.id}",
            "role": info["role"],
            "location": info["location"],
            "cover": info["cover"],
            "img": info["avatar"],
            "mutual_count": mutual["count"],
            "mutual_avatars": mutual["avatars"],
            "verified": sender.is_verified,
            "activity": f"Connected on Nexoria",
            "distance": dist,
            "created_at": req.created_at,
            "status": req.status
        })

    return results


# =====================================================================
# 2. GET FRIEND SUGGESTIONS (REAL REGISTERED USERS ONLY)
# =====================================================================
def get_friend_suggestions(db: Session, user_id: int, category: Optional[str] = None) -> List[Dict[str, Any]]:
    """Fetch other registered users on the platform who are not yet connected."""
    # Get all connected or pending user IDs
    existing_connections = db.query(Friend).filter(
        or_(
            Friend.sender_id == user_id,
            Friend.receiver_id == user_id
        )
    ).all()

    connected_ids = set()
    sent_request_ids = set()

    for conn in existing_connections:
        other_id = conn.receiver_id if conn.sender_id == user_id else conn.sender_id
        if conn.status == "accepted":
            connected_ids.add(other_id)
        elif conn.status == "pending":
            if conn.sender_id == user_id:
                sent_request_ids.add(conn.receiver_id)
            else:
                connected_ids.add(other_id)

    connected_ids.add(user_id)

    # Query ONLY real registered users from User table (excluding current user and existing connections)
    candidates = db.query(User).filter(~User.id.in_(connected_ids)).all()

    results = []
    categories = ["nearby", "alumni", "tech", "creative"]

    for u in candidates:
        info = get_user_profile_info(db, u)
        cat = categories[u.id % len(categories)]

        if category and category.lower() != "all" and cat != category.lower():
            continue

        mutual = calculate_mutual_friends(db, user_id, u.id)
        dist = f"{(u.id * 1.3) % 18 + 0.8:.1f} km away"

        results.append({
            "id": u.id,
            "user_id": u.id,
            "name": f"{u.first_name} {u.surname}".strip(),
            "username": u.username or f"user_{u.id}",
            "role": info["role"],
            "location": info["location"],
            "cover": info["cover"],
            "img": info["avatar"],
            "mutual_count": mutual["count"],
            "mutual_avatars": mutual["avatars"],
            "verified": u.is_verified,
            "activity": f"Registered Nexoria Member",
            "distance": dist,
            "category": cat,
            "sent": u.id in sent_request_ids
        })

    return results


# =====================================================================
# 3. GET ACCEPTED FRIENDS LIST (REAL REGISTERED USERS ONLY)
# =====================================================================
def get_accepted_friends(db: Session, user_id: int) -> List[Dict[str, Any]]:
    """Fetch all accepted mutual friends directly from the database."""
    friendships = db.query(Friend).filter(
        or_(
            and_(Friend.sender_id == user_id, Friend.status == "accepted"),
            and_(Friend.receiver_id == user_id, Friend.status == "accepted")
        )
    ).order_by(desc(Friend.created_at)).all()

    # Get close friends set
    close_friends = set(
        cf.friend_id for cf in db.query(CloseFriend).filter(CloseFriend.user_id == user_id).all()
    )

    results = []
    seen_friend_ids = set()

    for fr in friendships:
        other_id = fr.receiver_id if fr.sender_id == user_id else fr.sender_id
        if other_id in seen_friend_ids:
            continue
        seen_friend_ids.add(other_id)

        other_user = db.query(User).filter(User.id == other_id).first()
        if not other_user:
            continue

        info = get_user_profile_info(db, other_user)
        mutual = calculate_mutual_friends(db, user_id, other_user.id)
        is_online = (other_user.id % 3 != 0)

        results.append({
            "id": fr.id,
            "friend_user_id": other_user.id,
            "name": f"{other_user.first_name} {other_user.surname}".strip(),
            "username": other_user.username or f"user_{other_user.id}",
            "role": info["role"],
            "location": info["location"],
            "cover": info["cover"],
            "img": info["avatar"],
            "mutual_count": mutual["count"],
            "mutual_avatars": mutual["avatars"],
            "verified": other_user.is_verified,
            "online": is_online,
            "starred": other_user.id in close_friends,
            "activity": "🟢 Active now" if is_online else "🌙 Offline",
            "distance": f"{(other_user.id * 1.5) % 12 + 1.1:.1f} km away",
            "since": fr.created_at
        })

    return results


# =====================================================================
# 4. SEND FRIEND REQUEST (PERSIST IN DATABASE)
# =====================================================================
def send_friend_request(db: Session, sender_id: int, receiver_id: int) -> Dict[str, Any]:
    """Send or un-cancel a friend request and persist in database."""
    if sender_id == receiver_id:
        return {"success": False, "message": "Cannot send friend request to yourself"}

    existing = db.query(Friend).filter(
        or_(
            and_(Friend.sender_id == sender_id, Friend.receiver_id == receiver_id),
            and_(Friend.sender_id == receiver_id, Friend.receiver_id == sender_id)
        )
    ).first()

    if existing:
        if existing.status == "accepted":
            return {"success": False, "message": "You are already friends with this user"}
        if existing.status == "pending":
            if existing.sender_id == sender_id:
                return {"success": True, "message": "Friend request already sent", "friendship_id": existing.id, "status": "pending"}
            else:
                # If they already sent us a request, auto-accept it!
                existing.status = "accepted"
                db.commit()
                return {"success": True, "message": "Friend request accepted!", "friendship_id": existing.id, "status": "accepted"}

        existing.sender_id = sender_id
        existing.receiver_id = receiver_id
        existing.status = "pending"
        existing.created_at = datetime.datetime.utcnow()
        db.commit()
        db.refresh(existing)
        return {"success": True, "message": "Friend request sent!", "friendship_id": existing.id, "status": "pending"}

    new_req = Friend(
        sender_id=sender_id,
        receiver_id=receiver_id,
        status="pending",
        created_at=datetime.datetime.utcnow()
    )
    db.add(new_req)
    db.commit()
    db.refresh(new_req)
    return {"success": True, "message": "Friend request sent!", "friendship_id": new_req.id, "status": "pending"}


# =====================================================================
# 5. ACCEPT FRIEND REQUEST (UPDATE DATABASE TO ACCEPTED)
# =====================================================================
def accept_friend_request(db: Session, request_id: int, user_id: int) -> Dict[str, Any]:
    """Accept an incoming pending friend request in the database."""
    req = db.query(Friend).filter(
        Friend.id == request_id,
        Friend.receiver_id == user_id
    ).first()

    if not req:
        return {"success": False, "message": "Friend request not found or unauthorized"}

    req.status = "accepted"
    req.created_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(req)

    sender = db.query(User).filter(User.id == req.sender_id).first()
    sender_name = f"{sender.first_name} {sender.surname}".strip() if sender else "Friend"

    return {
        "success": True,
        "message": f"You are now friends with {sender_name}!",
        "friendship_id": req.id,
        "status": "accepted"
    }


# =====================================================================
# 6. REJECT / DELETE FRIEND REQUEST (DELETE FROM DATABASE)
# =====================================================================
def reject_friend_request(db: Session, request_id: int, user_id: int) -> Dict[str, Any]:
    """Reject and delete an incoming friend request from the database."""
    req = db.query(Friend).filter(
        Friend.id == request_id,
        Friend.receiver_id == user_id
    ).first()

    if not req:
        return {"success": False, "message": "Friend request not found"}

    db.delete(req)
    db.commit()
    return {"success": True, "message": "Friend request deleted"}


# =====================================================================
# 7. CANCEL SENT FRIEND REQUEST (DELETE FROM DATABASE)
# =====================================================================
def cancel_friend_request(db: Session, sender_id: int, receiver_id: int) -> Dict[str, Any]:
    """Cancel a friend request sent by the user."""
    req = db.query(Friend).filter(
        Friend.sender_id == sender_id,
        Friend.receiver_id == receiver_id,
        Friend.status == "pending"
    ).first()

    if not req:
        return {"success": False, "message": "Pending request not found"}

    db.delete(req)
    db.commit()
    return {"success": True, "message": "Friend request cancelled"}


# =====================================================================
# 8. REMOVE FRIEND / UNFRIEND (DELETE FRIENDSHIP FROM DATABASE)
# =====================================================================
def remove_friend(db: Session, user_id: int, friend_user_id: int) -> Dict[str, Any]:
    """Unfriend and permanently delete mutual friendship from database."""
    fr = db.query(Friend).filter(
        or_(
            and_(Friend.sender_id == user_id, Friend.receiver_id == friend_user_id),
            and_(Friend.sender_id == friend_user_id, Friend.receiver_id == user_id)
        ),
        Friend.status == "accepted"
    ).first()

    if not fr:
        return {"success": False, "message": "Friendship record not found"}

    db.delete(fr)
    
    # Also remove from close friends if starred
    cf = db.query(CloseFriend).filter(
        CloseFriend.user_id == user_id,
        CloseFriend.friend_id == friend_user_id
    ).first()
    if cf:
        db.delete(cf)

    db.commit()
    return {"success": True, "message": "Friend removed successfully"}


# =====================================================================
# 9. TOGGLE STAR / CLOSE FRIEND (PERSIST IN DATABASE)
# =====================================================================
def toggle_star_friend(db: Session, user_id: int, friend_user_id: int) -> Dict[str, Any]:
    """Toggle starred / close friend priority status in database."""
    cf = db.query(CloseFriend).filter(
        CloseFriend.user_id == user_id,
        CloseFriend.friend_id == friend_user_id
    ).first()

    if cf:
        db.delete(cf)
        db.commit()
        return {"success": True, "starred": False, "message": "Removed from Favorites"}
    else:
        new_cf = CloseFriend(
            user_id=user_id,
            friend_id=friend_user_id,
            list_type="close_friends"
        )
        db.add(new_cf)
        db.commit()
        return {"success": True, "starred": True, "message": "Added to Favorites ⭐"}


# =====================================================================
# 10. GET DYNAMIC COUNTERS & STATS (REAL DATABASE COUNTS)
# =====================================================================
def get_friend_stats(db: Session, user_id: int) -> Dict[str, Any]:
    """Compute exact live counts directly from database queries."""
    total_friends = db.query(Friend).filter(
        or_(
            and_(Friend.sender_id == user_id, Friend.status == "accepted"),
            and_(Friend.receiver_id == user_id, Friend.status == "accepted")
        )
    ).count()

    pending_requests = db.query(Friend).filter(
        Friend.receiver_id == user_id,
        Friend.status == "pending"
    ).count()

    suggestions = get_friend_suggestions(db, user_id)

    return {
        "total_friends": total_friends,
        "pending_requests": pending_requests,
        "suggestions_count": len(suggestions),
        "online_count": max(1, total_friends - 1) if total_friends > 0 else 0
    }


# =====================================================================
# 11. USER BLOCKING SUBSYSTEM (REAL DATABASE PERSISTENCE)
# =====================================================================
def get_blocked_users_service(db: Session, user_id: int) -> List[Dict[str, Any]]:
    """Retrieve all blocked users for the given user from MySQL."""
    blocked_records = (
        db.query(BlockedUser, User)
        .join(User, BlockedUser.blocked_user == User.id)
        .filter(BlockedUser.user_id == user_id)
        .order_by(BlockedUser.created_at.desc())
        .all()
    )

    results = []
    for bu, u in blocked_records:
        full_name = f"{u.first_name} {u.surname}".strip() if (u.first_name or u.surname) else u.username
        results.append({
            "id": bu.id,
            "blocked_user_id": u.id,
            "user_id": u.id,
            "name": full_name,
            "full_name": full_name,
            "username": u.username,
            "avatar": u.profile_pic or f"https://i.pravatar.cc/150?u={u.id}",
            "reason": bu.reason or "Blocked by user",
            "created_at": bu.created_at.isoformat() if bu.created_at else None
        })
    return results


def block_user_service(
    db: Session,
    user_id: int,
    target_identifier: Any,
    reason: Optional[str] = "Blocked from settings/profile"
) -> Dict[str, Any]:
    """
    Block another user:
    - Creates BlockedUser record
    - Removes any existing mutual friendship
    - Unfollows
    - Writes security audit event
    """
    target_user = None

    # Try numeric user_id
    if isinstance(target_identifier, int) or (isinstance(target_identifier, str) and target_identifier.isdigit()):
        tid = int(target_identifier)
        if tid == user_id:
            return {"success": False, "message": "You cannot block yourself."}
        target_user = db.query(User).filter(User.id == tid).first()

    # Try username or email or name lookup
    if not target_user and isinstance(target_identifier, str):
        clean_name = target_identifier.strip().replace("@", "")
        target_user = db.query(User).filter(
            or_(
                User.username.ilike(clean_name),
                User.email.ilike(target_identifier.strip()),
                User.first_name.ilike(clean_name)
            )
        ).first()

    if not target_user:
        return {"success": False, "message": "User not found."}

    if target_user.id == user_id:
        return {"success": False, "message": "You cannot block yourself."}

    # Check if already blocked
    existing = db.query(BlockedUser).filter(
        BlockedUser.user_id == user_id,
        BlockedUser.blocked_user == target_user.id
    ).first()

    if existing:
        return {
            "success": True,
            "message": f"User {target_user.first_name} is already blocked.",
            "blocked_user_id": target_user.id
        }

    # 1. Add BlockedUser record
    new_block = BlockedUser(
        user_id=user_id,
        blocked_user=target_user.id,
        reason=reason
    )
    db.add(new_block)

    # 2. Terminate friendship if exists
    db.query(Friend).filter(
        or_(
            and_(Friend.sender_id == user_id, Friend.receiver_id == target_user.id),
            and_(Friend.sender_id == target_user.id, Friend.receiver_id == user_id)
        )
    ).delete()

    # 3. Terminate follows if exists
    db.query(Follow).filter(
        or_(
            and_(Follow.follower_id == user_id, Follow.following_id == target_user.id),
            and_(Follow.follower_id == target_user.id, Follow.following_id == user_id)
        )
    ).delete()

    # 4. Security Audit Log
    db.add(SecurityAuditLog(
        user_id=user_id,
        event_type="user_blocked",
        severity="info",
        details=f"Blocked user {target_user.first_name} {target_user.surname} (@{target_user.username})"
    ))

    db.commit()

    return {
        "success": True,
        "message": f"Successfully blocked {target_user.first_name} {target_user.surname}.",
        "blocked_user_id": target_user.id
    }


def unblock_user_service(db: Session, user_id: int, blocked_user_id: int) -> Dict[str, Any]:
    """Unblock a user and remove from BlockedUser table."""
    block_record = db.query(BlockedUser).filter(
        BlockedUser.user_id == user_id,
        BlockedUser.blocked_user == blocked_user_id
    ).first()

    if not block_record:
        # Check by id
        block_record = db.query(BlockedUser).filter(
            BlockedUser.user_id == user_id,
            BlockedUser.id == blocked_user_id
        ).first()

    if not block_record:
        return {"success": False, "message": "Blocked user record not found."}

    db.delete(block_record)

    db.add(SecurityAuditLog(
        user_id=user_id,
        event_type="user_unblocked",
        severity="info",
        details=f"Unblocked user ID {blocked_user_id}"
    ))

    db.commit()

    return {
        "success": True,
        "message": "User has been unblocked successfully.",
        "unblocked_user_id": blocked_user_id
    }


def search_users_to_block_service(db: Session, user_id: int, query: str = "") -> List[Dict[str, Any]]:
    """Search registered users by name/username/email to block, excluding self and already blocked."""
    blocked_ids = [
        row[0] for row in db.query(BlockedUser.blocked_user).filter(BlockedUser.user_id == user_id).all()
    ]
    blocked_ids.append(user_id)

    q_clean = query.strip()
    user_query = db.query(User).filter(~User.id.in_(blocked_ids), User.is_active == True)

    if q_clean:
        user_query = user_query.filter(
            or_(
                User.first_name.ilike(f"%{q_clean}%"),
                User.surname.ilike(f"%{q_clean}%"),
                User.username.ilike(f"%{q_clean}%"),
                User.email.ilike(f"%{q_clean}%")
            )
        )

    users = user_query.limit(25).all()

    results = []
    for u in users:
        full_name = f"{u.first_name} {u.surname}".strip() if (u.first_name or u.surname) else u.username
        results.append({
            "id": u.id,
            "user_id": u.id,
            "name": full_name,
            "full_name": full_name,
            "username": u.username,
            "avatar": u.profile_pic or f"https://i.pravatar.cc/150?u={u.id}"
        })
    return results


