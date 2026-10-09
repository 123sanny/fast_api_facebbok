import os
import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status, UploadFile, File
from sqlalchemy.orm import Session

from database import get_db
from schemas.content import ReelCreate, ReelReactRequest, ReelCommentRequest, ReelStarsRequest, WatchPartyChatRequest
from services.reel_service import (
    get_reels_feed_service,
    get_user_reels_service,
    create_reel_service,
    react_to_reel_service,
    get_reel_comments_service,
    add_reel_comment_service,
    toggle_save_reel_service,
    get_saved_reels_service,
    send_reel_stars_service,
    increment_reel_view_service,
    increment_reel_share_service,
    delete_reel_service,
    get_watch_feed_service,
    create_watch_video_service,
    send_watch_party_chat_service,
    get_watch_party_state_service
)

router = APIRouter(prefix="/reels", tags=["Reels & Watch Hub"])


@router.get("/watch/feed")
def get_watch_feed(
    user_id: Optional[int] = Query(None, description="Current logged-in viewer ID"),
    category: Optional[str] = Query(None, description="Filter watch videos by category"),
    db: Session = Depends(get_db)
):
    """
    Fetch dynamic 16:9 Watch long-form video feed across all creators from MySQL database.
    """
    return get_watch_feed_service(db=db, viewer_id=user_id, category=category)


@router.post("/watch/create", status_code=status.HTTP_201_CREATED)
def create_watch_video(
    payload: ReelCreate,
    db: Session = Depends(get_db)
):
    """
    Publish a new 16:9 Watch video into MySQL database.
    """
    res = create_watch_video_service(
        db=db,
        user_id=payload.user_id,
        title=payload.title or payload.caption or "Untitled Watch Video",
        video_url=payload.video_url,
        description=payload.description or payload.caption or "",
        thumbnail_url=payload.thumbnail_url,
        category=payload.category,
        duration=payload.duration or 120
    )
    if not res.get("success"):
        raise HTTPException(status_code=400, detail=res.get("message", "Could not publish watch video"))
    return res


@router.post("/watch-party/chat")
def send_watch_party_chat(
    payload: WatchPartyChatRequest
):
    """
    Broadcast a real-time synchronized chat message into a Watch Party room.
    """
    return send_watch_party_chat_service(
        party_id=payload.party_id or "general",
        user=payload.user,
        text=payload.text
    )


@router.get("/watch-party/{party_id}")
def get_watch_party_state(
    party_id: str
):
    """
    Fetch live synced chat messages and synchronized viewers count for a Watch Party room.
    """
    return get_watch_party_state_service(party_id=party_id)



@router.get("/feed")
def get_reels_feed(
    user_id: Optional[int] = Query(None, description="Current logged-in viewer ID"),
    category: Optional[str] = Query(None, description="Filter reels by category"),
    db: Session = Depends(get_db)
):
    """
    Fetch dynamic feed of all short vertical video reels across all users from MySQL database.
    Includes creator profile metadata, reactions breakdown, view counts, and engagement state.
    """
    return get_reels_feed_service(db=db, viewer_id=user_id, category=category)


@router.get("/user/{target_user_id}")
def get_user_reels(
    target_user_id: int,
    viewer_id: Optional[int] = Query(None, description="Viewer ID for reaction check"),
    db: Session = Depends(get_db)
):
    """
    Fetch all reels created by a specific user from MySQL database.
    """
    return get_user_reels_service(db=db, target_user_id=target_user_id, viewer_id=viewer_id)


@router.post("/create", status_code=status.HTTP_201_CREATED)
def create_reel(
    payload: ReelCreate,
    db: Session = Depends(get_db)
):
    """
    Publish a new short vertical reel into MySQL database.
    """
    res = create_reel_service(
        db=db,
        user_id=payload.user_id,
        video_url=payload.video_url,
        caption=payload.caption,
        audio_title=payload.audio_title,
        thumbnail_url=payload.thumbnail_url,
        category=payload.category,
        duration=payload.duration
    )
    if not res.get("success"):
        raise HTTPException(status_code=400, detail=res.get("message", "Could not publish reel"))
    return res


@router.post("/upload-video")
async def upload_reel_video(
    file: UploadFile = File(...)
):
    """
    Upload an mp4 / webm video file directly to the backend storage for a new reel.
    """
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    reels_upload_dir = os.path.join(base_dir, "uploads", "reels")
    os.makedirs(reels_upload_dir, exist_ok=True)

    ext = os.path.splitext(file.filename)[1] or ".mp4"
    unique_filename = f"reel_{uuid.uuid4().hex[:12]}{ext}"
    file_path = os.path.join(reels_upload_dir, unique_filename)

    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)

    return {
        "success": True,
        "video_url": f"/uploads/reels/{unique_filename}",
        "filename": unique_filename
    }


@router.post("/{reel_id}/react")
def react_to_reel(
    reel_id: int,
    payload: ReelReactRequest,
    db: Session = Depends(get_db)
):
    """
    Add, update, or toggle reaction (like, love, care, haha, wow, sad, angry, fire, star) on a reel in MySQL database.
    """
    res = react_to_reel_service(
        db=db,
        user_id=payload.user_id,
        reel_id=reel_id,
        reaction_type=payload.reaction_type or "like"
    )
    if not res.get("success"):
        raise HTTPException(status_code=404, detail=res.get("message", "Reel not found"))
    return res


@router.get("/{reel_id}/comments")
def get_reel_comments(
    reel_id: int,
    viewer_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Fetch all comments for a specific reel from MySQL database.
    """
    return get_reel_comments_service(db=db, reel_id=reel_id, viewer_id=viewer_id)


@router.post("/{reel_id}/comments", status_code=status.HTTP_201_CREATED)
def add_reel_comment(
    reel_id: int,
    payload: ReelCommentRequest,
    db: Session = Depends(get_db)
):
    """
    Add a new comment or reply to a reel in MySQL database.
    """
    res = add_reel_comment_service(
        db=db,
        user_id=payload.user_id,
        reel_id=reel_id,
        content=payload.content,
        parent_id=payload.parent_id
    )
    if not res.get("success"):
        raise HTTPException(status_code=400, detail=res.get("message", "Could not post comment"))
    return res


@router.post("/{reel_id}/save")
def toggle_save_reel(
    reel_id: int,
    user_id: int = Query(..., description="User ID saving/unsaving the reel"),
    db: Session = Depends(get_db)
):
    """
    Bookmark or unbookmark a reel in MySQL database.
    """
    return toggle_save_reel_service(db=db, user_id=user_id, reel_id=reel_id)


@router.get("/saved/all")
def get_saved_reels(
    user_id: int = Query(..., description="User ID"),
    db: Session = Depends(get_db)
):
    """
    Fetch all bookmarked reels for a user.
    """
    return get_saved_reels_service(db=db, user_id=user_id)


@router.post("/{reel_id}/stars")
def send_reel_stars(
    reel_id: int,
    payload: ReelStarsRequest,
    db: Session = Depends(get_db)
):
    """
    Send Stars / Tip to the creator of a reel.
    """
    res = send_reel_stars_service(
        db=db,
        user_id=payload.user_id,
        reel_id=reel_id,
        stars_amount=payload.stars_amount or 50,
        message=payload.message
    )
    if not res.get("success"):
        raise HTTPException(status_code=404, detail=res.get("message", "Could not send stars"))
    return res


@router.post("/{reel_id}/view")
def register_reel_view(
    reel_id: int,
    db: Session = Depends(get_db)
):
    """
    Increment reel view count in MySQL database.
    """
    return increment_reel_view_service(db=db, reel_id=reel_id)


@router.post("/{reel_id}/share")
def register_reel_share(
    reel_id: int,
    user_id: Optional[int] = Query(None),
    shared_to: Optional[str] = Query("timeline"),
    db: Session = Depends(get_db)
):
    """
    Increment reel share count in MySQL database.
    """
    return increment_reel_share_service(db=db, reel_id=reel_id)


@router.delete("/{reel_id}")
def delete_reel(
    reel_id: int,
    user_id: int = Query(..., description="Owner user ID"),
    db: Session = Depends(get_db)
):
    """
    Delete a reel from MySQL database.
    """
    res = delete_reel_service(db=db, reel_id=reel_id, user_id=user_id)
    if not res.get("success"):
        raise HTTPException(status_code=403, detail=res.get("message", "Could not delete reel"))
    return res
