from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from database import get_db
from schemas.friends import (
    FriendRequestOut,
    FriendSuggestionOut,
    FriendOut,
    FriendStatsOut,
    FriendRequestCreate,
    FriendActionResponse
)
from services.friend_service import (
    get_incoming_friend_requests,
    get_friend_suggestions,
    get_accepted_friends,
    send_friend_request,
    accept_friend_request,
    reject_friend_request,
    cancel_friend_request,
    remove_friend,
    toggle_star_friend,
    get_friend_stats,
    get_blocked_users_service,
    block_user_service,
    unblock_user_service,
    search_users_to_block_service
)

router = APIRouter(prefix="", tags=["Friends & Social Graph"])


# =====================================================================
# 1. INCOMING FRIEND REQUESTS
# =====================================================================
@router.get("/users/{user_id}/friends/requests", response_model=List[FriendRequestOut])
def list_friend_requests(user_id: int, db: Session = Depends(get_db)):
    """Fetch all pending incoming friend requests for the user."""
    return get_incoming_friend_requests(db, user_id)


# =====================================================================
# 2. FRIEND SUGGESTIONS
# =====================================================================
@router.get("/users/{user_id}/friends/suggestions", response_model=List[FriendSuggestionOut])
def list_friend_suggestions(
    user_id: int,
    category: Optional[str] = Query(None, description="nearby, alumni, tech, creative, all"),
    db: Session = Depends(get_db)
):
    """Fetch algorithmic friend suggestions with proximity and interest matching."""
    return get_friend_suggestions(db, user_id, category=category)


# =====================================================================
# 3. ACCEPTED FRIENDS LIST
# =====================================================================
@router.get("/users/{user_id}/friends", response_model=List[FriendOut])
def list_user_friends(user_id: int, db: Session = Depends(get_db)):
    """Fetch complete list of user's accepted mutual friends."""
    return get_accepted_friends(db, user_id)


# =====================================================================
# 4. FRIEND STATS & COUNTERS
# =====================================================================
@router.get("/users/{user_id}/friends/stats", response_model=FriendStatsOut)
def get_user_friend_stats(user_id: int, db: Session = Depends(get_db)):
    """Get summarized counter badges for friends, requests, and suggestions."""
    return get_friend_stats(db, user_id)


# =====================================================================
# 5. SEND FRIEND REQUEST
# =====================================================================
@router.post("/users/{user_id}/friends/requests", response_model=FriendActionResponse)
def send_request(user_id: int, payload: FriendRequestCreate, db: Session = Depends(get_db)):
    """Send a new friend request."""
    res = send_friend_request(db, sender_id=user_id, receiver_id=payload.receiver_id)
    if not res.get("success"):
        raise HTTPException(status_code=400, detail=res.get("message", "Could not send friend request"))
    return res


# =====================================================================
# 6. ACCEPT FRIEND REQUEST
# =====================================================================
@router.post("/users/{user_id}/friends/requests/{request_id}/accept", response_model=FriendActionResponse)
def accept_request(user_id: int, request_id: int, db: Session = Depends(get_db)):
    """Accept an incoming pending friend request."""
    res = accept_friend_request(db, request_id=request_id, user_id=user_id)
    if not res.get("success"):
        raise HTTPException(status_code=404, detail=res.get("message", "Friend request not found"))
    return res


# =====================================================================
# 7. REJECT FRIEND REQUEST
# =====================================================================
@router.post("/users/{user_id}/friends/requests/{request_id}/reject", response_model=FriendActionResponse)
def reject_request(user_id: int, request_id: int, db: Session = Depends(get_db)):
    """Reject/delete an incoming friend request."""
    res = reject_friend_request(db, request_id=request_id, user_id=user_id)
    if not res.get("success"):
        raise HTTPException(status_code=404, detail=res.get("message", "Friend request not found"))
    return res


# =====================================================================
# 8. CANCEL SENT FRIEND REQUEST
# =====================================================================
@router.delete("/users/{user_id}/friends/requests/{receiver_id}/cancel", response_model=FriendActionResponse)
def cancel_request(user_id: int, receiver_id: int, db: Session = Depends(get_db)):
    """Cancel a sent friend request."""
    res = cancel_friend_request(db, sender_id=user_id, receiver_id=receiver_id)
    if not res.get("success"):
        raise HTTPException(status_code=404, detail=res.get("message", "Pending request not found"))
    return res


# =====================================================================
# 9. REMOVE FRIEND (UNFRIEND)
# =====================================================================
@router.delete("/users/{user_id}/friends/{friend_id}/remove", response_model=FriendActionResponse)
def unfriend_user(user_id: int, friend_id: int, db: Session = Depends(get_db)):
    """Unfriend and remove mutual connection."""
    res = remove_friend(db, user_id=user_id, friend_user_id=friend_id)
    if not res.get("success"):
        raise HTTPException(status_code=404, detail=res.get("message", "Friendship not found"))
    return res


# =====================================================================
# 10. TOGGLE STAR / FAVORITE FRIEND
# =====================================================================
@router.post("/users/{user_id}/friends/{friend_id}/toggle-star")
def toggle_star(user_id: int, friend_id: int, db: Session = Depends(get_db)):
    """Toggle star / favorite status for a close friend."""
    return toggle_star_friend(db, user_id=user_id, friend_user_id=friend_id)


# =====================================================================
# 11. USER BLOCKING ENDPOINTS
# =====================================================================
@router.get("/users/{user_id}/blocked")
def list_blocked_users(user_id: int, db: Session = Depends(get_db)):
    """Fetch all blocked users for the user."""
    return get_blocked_users_service(db, user_id)


@router.post("/users/{user_id}/block")
def block_user_endpoint(
    user_id: int,
    payload: Dict[str, Any],
    db: Session = Depends(get_db)
):
    """
    Block another user by user_id or username with optional reason.
    """
    target = payload.get("blocked_user_id") or payload.get("username") or payload.get("identifier")
    reason = payload.get("reason", "Blocked by user")
    res = block_user_service(db, user_id=user_id, target_identifier=target, reason=reason)
    if not res.get("success"):
        raise HTTPException(status_code=400, detail=res.get("message", "Could not block user"))
    return res


@router.delete("/users/{user_id}/blocked/{blocked_user_id}")
def unblock_user_endpoint(
    user_id: int,
    blocked_user_id: int,
    db: Session = Depends(get_db)
):
    """
    Unblock a user.
    """
    res = unblock_user_service(db, user_id=user_id, blocked_user_id=blocked_user_id)
    if not res.get("success"):
        raise HTTPException(status_code=404, detail=res.get("message", "Blocked record not found"))
    return res


@router.get("/users/{user_id}/search-to-block")
def search_users_to_block_endpoint(
    user_id: int,
    q: str = Query("", description="Search query string"),
    db: Session = Depends(get_db)
):
    """
    Search registered users to block by name, username or email, excluding self and already blocked.
    """
    return search_users_to_block_service(db, user_id=user_id, query=q)


