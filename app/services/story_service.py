import datetime
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, desc

from models.content import Story, StoryView
from models.user import User
from models.social import Friend
from models.profile import Profile


def format_time_ago(dt: datetime.datetime) -> str:
    """Helper to convert datetime into human readable social timestamp."""
    if not dt:
        return "Just now"
    now = datetime.datetime.utcnow()
    diff = now - dt
    seconds = int(diff.total_seconds())
    
    if seconds < 60:
        return "Just now"
    minutes = seconds // 60
    if minutes < 60:
        return f"{minutes}m ago"
    hours = minutes // 60
    if hours < 24:
        return f"{hours}h ago"
    days = hours // 24
    return f"{days}d ago"


def format_story_response(story: Story, viewer_id: Optional[int] = None, friend_ids: Optional[set] = None) -> Dict[str, Any]:
    """Helper to build consistent, dynamic story payload."""
    author = story.author
    author_profile = author.profile if author else None
    
    if author:
        author_name = f"{author.first_name or ''} {author.surname or ''}".strip() or author.username or f"User {story.user_id}"
    else:
        author_name = f"User {story.user_id}"

    author_img = author_profile.profile_pic if (author_profile and author_profile.profile_pic) else (
        author.profile_pic if (author and author.profile_pic) else f"https://i.pravatar.cc/150?u={story.user_id}"
    )
    author_handle = f"@{author.username.lower()}" if (author and author.username) else f"@user{story.user_id}"

    # Build views list with viewer profiles
    views_list = []
    has_viewed = False
    if story.views:
        for v in story.views:
            v_user = v.viewer
            v_prof = v_user.profile if v_user else None
            if v_user:
                v_name = f"{v_user.first_name or ''} {v_user.surname or ''}".strip() or v_user.username or f"User {v.viewer_id}"
            else:
                v_name = f"User {v.viewer_id}"
            v_img = v_prof.profile_pic if (v_prof and v_prof.profile_pic) else (
                v_user.profile_pic if (v_user and v_user.profile_pic) else f"https://i.pravatar.cc/150?u={v.viewer_id}"
            )
            if viewer_id and v.viewer_id == viewer_id:
                has_viewed = True
            
            views_list.append({
                "id": v.id,
                "story_id": v.story_id,
                "viewer_id": v.viewer_id,
                "viewer_name": v_name,
                "viewer_img": v_img,
                "reaction_emoji": v.reaction_emoji,
                "viewed_at": v.viewed_at
            })

    is_own = bool(viewer_id and story.user_id == viewer_id)
    is_friend = bool(friend_ids and story.user_id in friend_ids)

    return {
        "id": story.id,
        "user_id": story.user_id,
        "name": author_name,
        "username": author_handle,
        "user_img": author_img,
        "userImg": author_img,  # Compatibility with existing frontend keys
        "media_url": story.media_url,
        "storyImg": story.media_url or "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600",
        "media_type": story.media_type or "text",
        "text_overlay": story.text_overlay,
        "background_gradient": story.background_gradient or "linear-gradient(135deg, #1877f2 0%, #00d2ff 100%)",
        "font_style": story.font_style or "Clean",
        "music_title": story.music_title,
        "music_artist": story.music_artist,
        "music_url": story.music_url,
        "music_cover": story.music_cover,
        "music_lyrics": story.music_lyrics,
        "music_sticker_style": story.music_sticker_style or "sticker",
        "created_at": story.created_at,
        "expires_at": story.expires_at,
        "time_ago": format_time_ago(story.created_at),
        "time": format_time_ago(story.created_at),  # Compatibility key
        "views_count": len(views_list),
        "has_viewed": has_viewed,
        "is_own_story": is_own,
        "is_friend_story": is_friend,
        "views": views_list
    }


def create_story_service(
    db: Session,
    user_id: int,
    media_type: str = "text",
    media_url: Optional[str] = None,
    text_overlay: Optional[str] = None,
    background_gradient: Optional[str] = None,
    font_style: Optional[str] = "Clean",
    music_title: Optional[str] = None,
    music_artist: Optional[str] = None,
    music_url: Optional[str] = None,
    music_cover: Optional[str] = None,
    music_lyrics: Optional[str] = None,
    music_sticker_style: Optional[str] = "sticker"
) -> Dict[str, Any]:
    """Create and persist a new 24h story or text status with optional music soundtrack & sticker."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return {"success": False, "message": "User not found"}

    now = datetime.datetime.utcnow()
    expires = now + datetime.timedelta(hours=24)

    story = Story(
        user_id=user_id,
        media_type=media_type or "text",
        media_url=media_url,
        text_overlay=text_overlay,
        background_gradient=background_gradient or "linear-gradient(135deg, #1877f2 0%, #00d2ff 100%)",
        font_style=font_style or "Clean",
        music_title=music_title,
        music_artist=music_artist,
        music_url=music_url,
        music_cover=music_cover,
        music_lyrics=music_lyrics,
        music_sticker_style=music_sticker_style or "sticker",
        created_at=now,
        expires_at=expires
    )
    db.add(story)
    db.commit()
    db.refresh(story)

    return {
        "success": True,
        "message": "Story published successfully!",
        "data": format_story_response(story, viewer_id=user_id)
    }


def get_stories_feed_service(db: Session, user_id: int) -> Dict[str, Any]:
    """
    Retrieve active stories feed:
    Prioritizes:
    1) Current user's own active stories
    2) All accepted friends' active stories
    3) Community active stories if friend count is low
    """
    now = datetime.datetime.utcnow()

    # 1. Fetch friend user IDs
    friend_records = db.query(Friend).filter(
        or_(
            and_(Friend.sender_id == user_id, Friend.status == "accepted"),
            and_(Friend.receiver_id == user_id, Friend.status == "accepted")
        )
    ).all()

    friend_ids = set()
    for fr in friend_records:
        if fr.sender_id == user_id:
            friend_ids.add(fr.receiver_id)
        else:
            friend_ids.add(fr.sender_id)

    # 2. Fetch all active stories
    active_stories = db.query(Story).filter(
        or_(
            Story.expires_at > now,
            Story.expires_at == None
        )
    ).order_by(desc(Story.created_at)).all()

    # Seed fallback initial stories if table is completely empty
    if not active_stories:
        seed_stories_if_empty(db, user_id, friend_ids)
        active_stories = db.query(Story).filter(
            or_(
                Story.expires_at > now,
                Story.expires_at == None
            )
        ).order_by(desc(Story.created_at)).all()

    # Partition stories into: own, friends, others
    own_stories = []
    friend_stories_unviewed = []
    friend_stories_viewed = []
    other_stories = []

    for st in active_stories:
        formatted = format_story_response(st, viewer_id=user_id, friend_ids=friend_ids)
        if st.user_id == user_id:
            own_stories.append(formatted)
        elif st.user_id in friend_ids:
            if formatted["has_viewed"]:
                friend_stories_viewed.append(formatted)
            else:
                friend_stories_unviewed.append(formatted)
        else:
            other_stories.append(formatted)

    # Combine in priority order
    final_list = own_stories + friend_stories_unviewed + friend_stories_viewed + other_stories

    return {
        "success": True,
        "count": len(final_list),
        "friends_count": len(friend_ids),
        "data": final_list
    }


def get_user_stories_service(db: Session, target_user_id: int, viewer_id: Optional[int] = None) -> Dict[str, Any]:
    """Retrieve all active stories posted by a specific user."""
    now = datetime.datetime.utcnow()

    # Get viewer's friends to determine is_friend_story
    friend_ids = set()
    if viewer_id:
        friend_records = db.query(Friend).filter(
            or_(
                and_(Friend.sender_id == viewer_id, Friend.status == "accepted"),
                and_(Friend.receiver_id == viewer_id, Friend.status == "accepted")
            )
        ).all()
        for fr in friend_records:
            if fr.sender_id == viewer_id:
                friend_ids.add(fr.receiver_id)
            else:
                friend_ids.add(fr.sender_id)

    stories = db.query(Story).filter(
        Story.user_id == target_user_id,
        or_(
            Story.expires_at > now,
            Story.expires_at == None
        )
    ).order_by(Story.created_at.asc()).all()

    formatted = [format_story_response(s, viewer_id=viewer_id, friend_ids=friend_ids) for s in stories]

    return {
        "success": True,
        "user_id": target_user_id,
        "has_active_story": len(formatted) > 0,
        "count": len(formatted),
        "data": formatted
    }


def get_friend_statuses_service(db: Session, user_id: int) -> Dict[str, Any]:
    """
    Specifically fetch dynamic friend statuses for Profile page widget:
    Returns list of user's friends who currently have active stories / statuses.
    """
    now = datetime.datetime.utcnow()

    friend_records = db.query(Friend).filter(
        or_(
            and_(Friend.sender_id == user_id, Friend.status == "accepted"),
            and_(Friend.receiver_id == user_id, Friend.status == "accepted")
        )
    ).all()

    friend_ids = set()
    for fr in friend_records:
        if fr.sender_id == user_id:
            friend_ids.add(fr.receiver_id)
        else:
            friend_ids.add(fr.sender_id)

    if not friend_ids:
        return {"success": True, "count": 0, "data": []}

    active_stories = db.query(Story).filter(
        Story.user_id.in_(list(friend_ids)),
        or_(
            Story.expires_at > now,
            Story.expires_at == None
        )
    ).order_by(desc(Story.created_at)).all()

    # Group stories by friend
    friends_map: Dict[int, List[Dict[str, Any]]] = {}
    for st in active_stories:
        if st.user_id not in friends_map:
            friends_map[st.user_id] = []
        friends_map[st.user_id].append(format_story_response(st, viewer_id=user_id, friend_ids=friend_ids))

    results = []
    for f_id, f_stories in friends_map.items():
        latest = f_stories[0]
        results.append({
            "friend_id": f_id,
            "name": latest["name"],
            "username": latest["username"],
            "user_img": latest["user_img"],
            "stories_count": len(f_stories),
            "latest_story": latest,
            "has_unviewed": any(not s["has_viewed"] for s in f_stories),
            "stories": f_stories
        })

    return {
        "success": True,
        "count": len(results),
        "data": results
    }


def view_story_service(db: Session, story_id: int, viewer_id: int, reaction_emoji: Optional[str] = None) -> Dict[str, Any]:
    """Record that a user viewed a story and optionally reacted with an emoji."""
    story = db.query(Story).filter(Story.id == story_id).first()
    if not story:
        return {"success": False, "message": "Story not found"}

    existing_view = db.query(StoryView).filter(
        StoryView.story_id == story_id,
        StoryView.viewer_id == viewer_id
    ).first()

    now = datetime.datetime.utcnow()

    if existing_view:
        if reaction_emoji:
            existing_view.reaction_emoji = reaction_emoji
        existing_view.viewed_at = now
        db.commit()
    else:
        new_view = StoryView(
            story_id=story_id,
            viewer_id=viewer_id,
            reaction_emoji=reaction_emoji,
            viewed_at=now
        )
        db.add(new_view)
        db.commit()

    return {
        "success": True,
        "message": "Story view registered",
        "story_id": story_id,
        "reaction_emoji": reaction_emoji
    }


def delete_story_service(db: Session, story_id: int, user_id: int) -> Dict[str, Any]:
    """Delete a story if owner matches."""
    story = db.query(Story).filter(Story.id == story_id).first()
    if not story:
        return {"success": False, "message": "Story not found"}

    if story.user_id != user_id:
        return {"success": False, "message": "Unauthorized to delete this story"}

    db.delete(story)
    db.commit()
    return {"success": True, "message": "Story deleted successfully"}


def seed_stories_if_empty(db: Session, user_id: int, friend_ids: set):
    """Populate realistic dynamic seed stories if the database has 0 active stories."""
    users = db.query(User).limit(10).all()
    if not users:
        return

    now = datetime.datetime.utcnow()

    sample_stories_data = [
        {
            "media_type": "photo",
            "media_url": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600",
            "text_overlay": "Sunset vibes at the beach 🌅🌊",
            "background_gradient": "linear-gradient(135deg, #f12711 0%, #f5af19 100%)",
            "font_style": "Casual"
        },
        {
            "media_type": "text",
            "media_url": None,
            "text_overlay": "Building the future of decentralized social web with zero manipulation! 🚀✨",
            "background_gradient": "linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%)",
            "font_style": "Headline"
        },
        {
            "media_type": "photo",
            "media_url": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600",
            "text_overlay": "Weekend coffee & code session ☕💻",
            "background_gradient": "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
            "font_style": "Clean"
        },
        {
            "media_type": "text",
            "media_url": None,
            "text_overlay": "Late night creativity hits different... Keep pushing your dreams! 🌟",
            "background_gradient": "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)",
            "font_style": "Fancy"
        }
    ]

    for idx, u in enumerate(users[:4]):
        sample = sample_stories_data[idx % len(sample_stories_data)]
        st = Story(
            user_id=u.id,
            media_type=sample["media_type"],
            media_url=sample["media_url"],
            text_overlay=sample["text_overlay"],
            background_gradient=sample["background_gradient"],
            font_style=sample["font_style"],
            created_at=now - datetime.timedelta(hours=(idx * 3 + 1)),
            expires_at=now + datetime.timedelta(hours=24 - (idx * 3))
        )
        db.add(st)

    db.commit()
