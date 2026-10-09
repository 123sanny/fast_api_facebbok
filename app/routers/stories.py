import os
import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status, UploadFile, File
from sqlalchemy.orm import Session

from database import get_db
from schemas.content import StoryCreate, StoryViewCreate
from services.story_service import (
    create_story_service,
    get_stories_feed_service,
    get_user_stories_service,
    get_friend_statuses_service,
    view_story_service,
    delete_story_service
)

router = APIRouter(prefix="/stories", tags=["Stories & Statuses"])


@router.post("/create", status_code=status.HTTP_201_CREATED)
def create_story(
    payload: StoryCreate,
    db: Session = Depends(get_db)
):
    """
    Publish a new 24-hour disappearing story or status.
    Supports both text stories (with gradient background & fonts) and photo stories.
    """
    res = create_story_service(
        db=db,
        user_id=payload.user_id,
        media_type=payload.media_type or "text",
        media_url=payload.media_url,
        text_overlay=payload.text_overlay,
        background_gradient=payload.background_gradient,
        font_style=payload.font_style,
        music_title=payload.music_title,
        music_artist=payload.music_artist,
        music_url=payload.music_url,
        music_cover=payload.music_cover,
        music_lyrics=payload.music_lyrics,
        music_sticker_style=payload.music_sticker_style
    )
    if not res.get("success"):
        raise HTTPException(status_code=400, detail=res.get("message", "Could not publish story"))
    return res


@router.post("/upload-media")
async def upload_story_media(
    file: UploadFile = File(...)
):
    """
    Upload an image or video file for a story.
    Returns the static URL for the uploaded media.
    """
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    stories_upload_dir = os.path.join(base_dir, "uploads", "stories")
    os.makedirs(stories_upload_dir, exist_ok=True)

    ext = os.path.splitext(file.filename)[1] or ".jpg"
    unique_filename = f"story_{uuid.uuid4().hex[:12]}{ext}"
    file_path = os.path.join(stories_upload_dir, unique_filename)

    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)

    return {
        "success": True,
        "media_url": f"/uploads/stories/{unique_filename}",
        "filename": unique_filename
    }


@router.get("/feed")
def get_stories_feed(
    user_id: int = Query(..., description="Logged-in user ID"),
    db: Session = Depends(get_db)
):
    """
    Get all active stories and friend statuses for the logged in user:
    Prioritizes:
    1) Logged-in user's active story
    2) Connected friends' unviewed and viewed stories
    3) Community stories
    """
    return get_stories_feed_service(db, user_id)


@router.get("/user/{target_user_id}")
def get_user_stories(
    target_user_id: int,
    viewer_id: Optional[int] = Query(None, description="Viewer user ID for view checks"),
    db: Session = Depends(get_db)
):
    """
    Fetch active stories/status for a specific user (used in profile avatar rings and status views).
    """
    return get_user_stories_service(db, target_user_id, viewer_id)


@router.get("/friends-status")
def get_friends_statuses(
    user_id: int = Query(..., description="Logged-in user ID"),
    db: Session = Depends(get_db)
):
    """
    Fetch dynamic list of friends who currently have active statuses/stories.
    Used for the Profile Friend Statuses & Stories shelf widget.
    """
    return get_friend_statuses_service(db, user_id)


@router.post("/{story_id}/view")
def view_story(
    story_id: int,
    payload: StoryViewCreate,
    db: Session = Depends(get_db)
):
    """
    Mark story as viewed by viewer_id and register quick reaction emoji (e.g. ❤️, 😂, 🔥, ⭐).
    """
    res = view_story_service(
        db=db,
        story_id=story_id,
        viewer_id=payload.viewer_id,
        reaction_emoji=payload.reaction_emoji
    )
    if not res.get("success"):
        raise HTTPException(status_code=404, detail=res.get("message", "Story not found"))
    return res


@router.delete("/{story_id}")
def delete_story(
    story_id: int,
    user_id: int = Query(..., description="ID of the user requesting deletion"),
    db: Session = Depends(get_db)
):
    """
    Delete a story belonging to the user.
    """
    res = delete_story_service(db, story_id, user_id)
    if not res.get("success"):
        raise HTTPException(status_code=403, detail=res.get("message", "Could not delete story"))
    return res
