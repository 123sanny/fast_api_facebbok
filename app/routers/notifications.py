import datetime
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Query, Body
from sqlalchemy.orm import Session
from sqlalchemy import desc, and_, or_

from database import get_db, SessionLocal
from models.user import User
from models.social import Notification, Friend, Message
from models.payment import StarTransaction
from models.session import UserSession
from models.settings import NotificationSettings

router = APIRouter(tags=["Dynamic Activity Notifications"])


def _format_time_relative(dt: Optional[datetime.datetime]) -> str:
    """Format datetime into human-friendly relative time (e.g. 2m ago, 1h ago, Yesterday)."""
    if not dt:
        return "Just now"
    now = datetime.datetime.utcnow()
    diff = now - dt
    total_seconds = int(diff.total_seconds())

    if total_seconds < 60:
        return "Just now"
    elif total_seconds < 3600:
        mins = total_seconds // 60
        return f"{mins}m ago"
    elif total_seconds < 86400:
        hours = total_seconds // 3600
        return f"{hours}h ago"
    elif total_seconds < 172800:
        return "Yesterday"
    else:
        days = total_seconds // 86400
        if days < 7:
            return f"{days}d ago"
        return dt.strftime("%b %d")


def _get_icon_and_bg(notif_type: str) -> tuple[str, str]:
    """Returns tag label and CSS gradient background based on notification type."""
    type_map = {
        "profile_view": ("Profile View", "linear-gradient(135deg, #8B5CF6, #EC4899)"),
        "tip": ("Micro-Tip", "linear-gradient(135deg, #F59E0B, #D97706)"),
        "security": ("Security", "linear-gradient(135deg, #1877f2, #00d2ff)"),
        "comment": ("Comment", "linear-gradient(135deg, #10B981, #059669)"),
        "like": ("Reaction", "linear-gradient(135deg, #EF4444, #F43F5E)"),
        "reaction": ("Reaction", "linear-gradient(135deg, #EF4444, #F43F5E)"),
        "friend": ("Friend Request", "linear-gradient(135deg, #1877f2, #3B82F6)"),
        "friend_request": ("Friend Request", "linear-gradient(135deg, #1877f2, #3B82F6)"),
        "birthday": ("Celebration", "linear-gradient(135deg, #F59E0B, #EAB308)"),
        "message": ("Message", "linear-gradient(135deg, #6366F1, #8B5CF6)"),
    }
    return type_map.get(notif_type.lower(), ("Notification", "linear-gradient(135deg, #1877f2, #3B82F6)"))


def _format_notification(notif: Notification) -> Dict[str, Any]:
    """Format database Notification model into frontend-ready JSON."""
    actor = notif.actor
    actor_name = f"{actor.first_name} {actor.surname}" if actor else "Nexoria Platform"
    actor_img = actor.profile_pic if (actor and actor.profile_pic) else f"https://i.pravatar.cc/150?u={notif.actor_id or notif.user_id}"
    actor_role = actor.bio if (actor and actor.bio) else "Nexoria Member"

    if notif.type == "security":
        actor_name = "Nexoria Security Shield"
        actor_role = "Zero-Trust Guard"
        actor_img = "https://i.pravatar.cc/150?u=security_shield"

    tag, icon_bg = _get_icon_and_bg(notif.type)
    created_iso = notif.created_at.isoformat() + "Z" if notif.created_at else datetime.datetime.utcnow().isoformat() + "Z"

    return {
        "id": notif.id,
        "user_id": notif.user_id,
        "actor_id": notif.actor_id,
        "name": actor_name,
        "role": actor_role,
        "img": actor_img,
        "type": notif.type,
        "text": notif.message or "interacted with you on Nexoria",
        "time": _format_time_relative(notif.created_at),
        "created_at": created_iso,
        "unread": not bool(notif.is_read),
        "is_read": bool(notif.is_read),
        "tag": tag,
        "iconBg": icon_bg,
        "entity_type": notif.entity_type,
        "entity_id": notif.entity_id,
        "post_id": notif.post_id
    }


def _auto_cleanup_expired_notifications(db: Session, user_id: Optional[int] = None):
    """
    Automatically delete/remove notifications older than 24 hours (1 Day)
    to keep the user notification drawer fast, clean, and relevant.
    """
    one_day_ago = datetime.datetime.utcnow() - datetime.timedelta(hours=24)
    try:
        query = db.query(Notification).filter(Notification.created_at < one_day_ago)
        if user_id:
            query = query.filter(Notification.user_id == user_id)
        deleted_count = query.delete(synchronize_session=False)
        db.commit()
        return deleted_count
    except Exception as e:
        db.rollback()
        return 0


def _sync_user_dynamic_notifications(db: Session, user_id: int):
    """
    Ensure the user's notifications table is cleaned up:
    1. Automatically purges notifications older than 24 hours (1 Day auto-expire).
    2. Does NOT resurrect or recreate notifications that the user has dismissed/deleted.
    """
    # Auto-cleanup expired 24h notifications
    _auto_cleanup_expired_notifications(db, user_id)



# ==============================================================================
# REST API ENDPOINTS
# ==============================================================================

@router.get("/notifications")
def get_user_notifications(
    user_id: int,
    filter_type: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """
    Fetch all dynamic notifications for the user from database.
    Automatically syncs live friend requests, tips, and security alerts.
    """
    _sync_user_dynamic_notifications(db, user_id)

    query = db.query(Notification).filter(Notification.user_id == user_id)

    if filter_type and isinstance(filter_type, str):
        f = filter_type.lower()
        if f == "unread":
            query = query.filter(Notification.is_read == False)
        elif f == "profile_view":
            query = query.filter(Notification.type == "profile_view")
        elif f in ["tip", "tips"]:
            query = query.filter(Notification.type == "tip")
        elif f in ["comment", "comments"]:
            query = query.filter(Notification.type.in_(["comment", "mention"]))
        elif f in ["friend", "friends"]:
            query = query.filter(Notification.type.in_(["friend", "friend_request"]))
        elif f == "security":
            query = query.filter(Notification.type == "security")
        elif f == "reaction":
            query = query.filter(Notification.type.in_(["like", "reaction"]))

    clean_limit = limit if isinstance(limit, int) else 50
    notifs = query.order_by(Notification.created_at.desc()).limit(clean_limit).all()
    formatted = [_format_notification(n) for n in notifs]

    return {
        "success": True,
        "data": formatted,
        "count": len(formatted),
        "unread_count": sum(1 for n in notifs if not n.is_read)
    }


@router.get("/notifications/unread-count")
def get_unread_notification_count(
    user_id: int = Query(...),
    db: Session = Depends(get_db)
):
    """
    Get live unread notification count for the Header notification bell badge.
    """
    _sync_user_dynamic_notifications(db, user_id)
    unread_count = db.query(Notification).filter(
        Notification.user_id == user_id,
        Notification.is_read == False
    ).count()

    return {
        "success": True,
        "count": unread_count,
        "unread_count": unread_count
    }


@router.post("/notifications/{notif_id}/read")
def mark_notification_as_read(
    notif_id: int,
    user_id: int = Query(...),
    db: Session = Depends(get_db)
):
    """
    Mark a single notification as read.
    """
    notif = db.query(Notification).filter(
        Notification.id == notif_id,
        Notification.user_id == user_id
    ).first()

    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")

    notif.is_read = True
    db.commit()

    return {"success": True, "message": "Notification marked as read"}


@router.post("/notifications/{notif_id}/toggle-read")
def toggle_notification_read(
    notif_id: int,
    user_id: int = Query(...),
    db: Session = Depends(get_db)
):
    """
    Toggle read/unread status for a notification.
    """
    notif = db.query(Notification).filter(
        Notification.id == notif_id,
        Notification.user_id == user_id
    ).first()

    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")

    notif.is_read = not bool(notif.is_read)
    db.commit()

    return {"success": True, "is_read": notif.is_read, "unread": not notif.is_read}


@router.post("/notifications/mark-all-read")
def mark_all_notifications_as_read(
    user_id: int = Query(...),
    db: Session = Depends(get_db)
):
    """
    Mark all notifications of the user as read.
    """
    db.query(Notification).filter(
        Notification.user_id == user_id,
        Notification.is_read == False
    ).update({"is_read": True})
    db.commit()

    return {"success": True, "message": "All notifications marked as read"}


@router.delete("/notifications/clear-read")
def clear_all_read_notifications(
    user_id: int = Query(...),
    db: Session = Depends(get_db)
):
    """
    Delete all read notifications from database.
    """
    db.query(Notification).filter(
        Notification.user_id == user_id,
        Notification.is_read == True
    ).delete(synchronize_session=False)
    db.commit()

    return {"success": True, "message": "Cleared read notifications"}


@router.delete("/notifications/clear-all")
def clear_all_notifications(
    user_id: int = Query(...),
    db: Session = Depends(get_db)
):
    """
    Delete all notifications for the user from database.
    """
    db.query(Notification).filter(
        Notification.user_id == user_id
    ).delete(synchronize_session=False)
    db.commit()

    return {"success": True, "message": "All notifications cleared", "unread_count": 0}


@router.delete("/notifications/{notif_id}")
def delete_single_notification(
    notif_id: int,
    user_id: int = Query(...),
    db: Session = Depends(get_db)
):
    """
    Delete a specific notification from database.
    """
    notif = db.query(Notification).filter(
        Notification.id == notif_id,
        Notification.user_id == user_id
    ).first()

    if not notif:
        return {"success": True, "message": "Notification already removed", "unread_count": 0}

    db.delete(notif)
    db.commit()

    unread_count = db.query(Notification).filter(
        Notification.user_id == user_id,
        Notification.is_read == False
    ).count()

    return {"success": True, "message": "Notification removed", "unread_count": unread_count}



@router.get("/notifications/settings")
def get_user_notification_settings(
    user_id: int = Query(...),
    db: Session = Depends(get_db)
):
    """
    Get user notification settings from database.
    """
    settings = db.query(NotificationSettings).filter(NotificationSettings.user_id == user_id).first()
    if not settings:
        settings = NotificationSettings(user_id=user_id)
        db.add(settings)
        db.commit()
        db.refresh(settings)

    return {
        "success": True,
        "data": {
            "profileViews": True,
            "tips": bool(settings.push_notifications),
            "comments": bool(settings.comments),
            "friendRequests": bool(settings.friend_requests),
            "securityAlerts": True,
            "likes": bool(settings.likes),
            "messages": bool(settings.messages),
            "sounds": True
        }
    }


@router.put("/notifications/settings")
def update_user_notification_settings(
    user_id: int = Query(...),
    data: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """
    Update user notification preferences in database.
    """
    settings = db.query(NotificationSettings).filter(NotificationSettings.user_id == user_id).first()
    if not settings:
        settings = NotificationSettings(user_id=user_id)
        db.add(settings)

    if "comments" in data:
        settings.comments = bool(data["comments"])
    if "friendRequests" in data:
        settings.friend_requests = bool(data["friendRequests"])
    if "likes" in data:
        settings.likes = bool(data["likes"])
    if "messages" in data:
        settings.messages = bool(data["messages"])
    if "tips" in data:
        settings.push_notifications = bool(data["tips"])

    db.commit()
    return {"success": True, "message": "Notification preferences updated successfully"}


@router.post("/notifications")
def create_dynamic_notification(
    user_id: int,
    actor_id: Optional[int] = None,
    notif_type: str = "profile_view",
    message: Optional[str] = None,
    entity_type: Optional[str] = None,
    entity_id: Optional[int] = None,
    post_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """
    Create a real-time activity notification in database (e.g., profile view, comment, tip, reaction).
    """
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        return {"success": False, "message": "Target user not found"}

    valid_actor_id = None
    if actor_id and isinstance(actor_id, int):
        actor_user = db.query(User).filter(User.id == actor_id).first()
        if actor_user:
            valid_actor_id = actor_user.id

    # Prevent duplicate identical notifications within 1 minute
    one_min_ago = datetime.datetime.utcnow() - datetime.timedelta(minutes=1)
    existing = db.query(Notification).filter(
        Notification.user_id == user_id,
        Notification.actor_id == valid_actor_id,
        Notification.type == notif_type,
        Notification.created_at >= one_min_ago
    ).first()

    if existing:
        return {"success": True, "data": _format_notification(existing), "duplicate": True}

    msg = message if isinstance(message, str) else None
    if not msg:
        if notif_type == "profile_view":
            msg = "viewed your profile 👁️"
        elif notif_type == "like":
            msg = "liked your post ❤️"
        elif notif_type == "comment":
            msg = "commented on your post 💬"
        else:
            msg = "interacted with you on Nexoria"

    clean_entity_type = entity_type if isinstance(entity_type, str) else notif_type
    clean_entity_id = entity_id if isinstance(entity_id, int) else None
    clean_post_id = post_id if isinstance(post_id, int) and post_id > 0 else None

    new_notif = Notification(
        user_id=user_id,
        actor_id=valid_actor_id,
        type=notif_type,
        message=msg,
        entity_type=clean_entity_type,
        entity_id=clean_entity_id,
        post_id=clean_post_id,
        is_read=False,
        created_at=datetime.datetime.utcnow()
    )
    db.add(new_notif)
    db.commit()
    db.refresh(new_notif)

    return {"success": True, "data": _format_notification(new_notif)}

