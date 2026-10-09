import datetime
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, desc, func

from models.content import Reel, Reaction, Comment, CommentReaction, SavedPost, PostTip
from models.user import User
from models.social import Friend, Follow
from models.profile import Profile


def format_count(count: int) -> str:
    """Format numeric counts to human readable strings (e.g., 1.2K, 4.5M)."""
    if not count or count <= 0:
        return "0"
    if count >= 1_000_000:
        val = count / 1_000_000
        return f"{val:.1f}M" if val < 10 else f"{int(val)}M"
    if count >= 1_000:
        val = count / 1_000
        return f"{val:.1f}K" if val < 10 else f"{int(val)}K"
    return str(count)


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
    if days < 7:
        return f"{days}d ago"
    weeks = days // 7
    if weeks < 4:
        return f"{weeks}w ago"
    return dt.strftime("%b %d")


def format_reel_response(reel: Reel, viewer_id: Optional[int] = None, db: Optional[Session] = None) -> Dict[str, Any]:
    """Helper to build comprehensive, dynamic reel payload matching frontend structure."""
    creator = reel.creator
    creator_profile = creator.profile if creator else None

    if creator:
        creator_name = f"{creator.first_name or ''} {creator.surname or ''}".strip() or creator.username or f"Creator #{reel.user_id}"
        is_verified = getattr(creator, "is_verified", False) or False
    else:
        creator_name = f"Creator #{reel.user_id}"
        is_verified = False

    creator_avatar = creator_profile.profile_pic if (creator_profile and creator_profile.profile_pic) else (
        creator.profile_pic if (creator and creator.profile_pic) else f"https://i.pravatar.cc/150?u={reel.user_id}"
    )

    # Reactions computation
    reactions = reel.reactions or []
    total_reactions = len(reactions)
    
    viewer_reaction = None
    if viewer_id:
        for r in reactions:
            if r.user_id == viewer_id:
                viewer_reaction = r.reaction_type
                break

    # Stars count
    stars_total = 0
    if hasattr(reel, "tips") and reel.tips:
        stars_total = sum(t.stars_amount for t in reel.tips)
    else:
        # Fallback stars based on initial views/reactions
        stars_total = max(50, total_reactions * 10)

    # Saved check
    is_saved = False
    if viewer_id and hasattr(reel, "saved") and reel.saved:
        is_saved = any(s.user_id == viewer_id for s in reel.saved)

    # Following check
    is_following = False
    if viewer_id and db and creator and viewer_id != reel.user_id:
        follow_record = db.query(Follow).filter(
            Follow.follower_id == viewer_id,
            Follow.following_id == reel.user_id
        ).first()
        is_following = follow_record is not None

    # Format latest comments
    comments_list = []
    top_comments = (reel.comments or [])[:5]
    for c in top_comments:
        c_user = c.user
        c_prof = c_user.profile if c_user else None
        c_name = f"{c_user.first_name or ''} {c_user.surname or ''}".strip() if c_user else "Nexoria Member"
        c_avatar = c_prof.profile_pic if (c_prof and c_prof.profile_pic) else (
            c_user.profile_pic if (c_user and c_user.profile_pic) else f"https://i.pravatar.cc/100?u={c.user_id}"
        )
        comments_list.append({
            "id": c.id,
            "user_id": c.user_id,
            "name": c_name,
            "avatar": c_avatar,
            "text": c.content,
            "time": format_time_ago(c.created_at),
            "created_at": c.created_at,
            "likes": len(c.reactions) if hasattr(c, "reactions") and c.reactions else 0
        })

    views_formatted = format_count(reel.views_count or 1) + " views" if (reel.views_count or 0) < 1000 else format_count(reel.views_count or 1)
    likes_formatted = format_count(total_reactions) if total_reactions > 0 else "0"

    return {
        "id": reel.id,
        "user_id": reel.user_id,
        "creatorId": reel.user_id,
        "creatorName": creator_name,
        "creatorAvatar": creator_avatar,
        "isVerified": is_verified,
        "video_type": getattr(reel, "video_type", "reel") or "reel",
        "title": getattr(reel, "title", None) or reel.caption or "Nexoria Watch Video",
        "description": getattr(reel, "description", None) or reel.caption or "",
        "videoUrl": reel.video_url,
        "posterUrl": reel.thumbnail_url or "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800",
        "thumbnail": reel.thumbnail_url or "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800",
        "caption": reel.caption or "",
        "songTitle": reel.audio_title or "Original Audio",
        "category": getattr(reel, "category", "Trending") or "Trending",
        "duration": reel.duration or 15,
        "likes": likes_formatted,
        "likesCount": total_reactions,
        "liked": viewer_reaction is not None,
        "reactionType": viewer_reaction,
        "starsCount": stars_total,
        "views": views_formatted,
        "viewsCount": reel.views_count or 0,
        "sharesCount": reel.shares_count or 0,
        "commentsCount": len(reel.comments or []),
        "saved": is_saved,
        "isFollowing": is_following,
        "timeAgo": format_time_ago(reel.created_at),
        "created_at": reel.created_at.isoformat() if reel.created_at else None,
        "comments": comments_list
    }


def seed_reels_if_empty(db: Session, viewer_id: Optional[int] = None):
    """Seed dynamic sample reels into MySQL database if reels table is empty."""
    users = db.query(User).limit(6).all()
    if not users:
        return

    now = datetime.datetime.utcnow()

    sample_reels = [
        {
            "caption": "Unbelievable last-over finish in the World Cup final! 🔥 Watch till the end for the masterstroke! 🏏 #Cricket #FinalOver #ThrillingMatch",
            "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
            "thumbnail_url": "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800",
            "audio_title": "Stadium Echoes - Official Crowd Anthem",
            "category": "Sports",
            "duration": 15,
            "views_count": 124000,
            "shares_count": 450,
            "reaction_types": ["like", "love", "fire", "wow"],
            "comments": [
                "Pure masterclass under pressure! 🔥👏",
                "Still having goosebumps watching this finish! ❤️",
                "Best moment of 2026 cricket so far!"
            ]
        },
        {
            "caption": "The world's first quantum neural processor unveiled today! 🤖 Computing at the speed of light! #TechAI #Quantum2026 #Innovation",
            "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
            "thumbnail_url": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800",
            "audio_title": "Cyberpunk Pulse - Future Beat",
            "category": "Tech & AI",
            "duration": 18,
            "views_count": 68000,
            "shares_count": 890,
            "reaction_types": ["fire", "wow", "like", "star"],
            "comments": [
                "This will revolutionize agentic computing forever.",
                "Is this shipping for developers this quarter?"
            ]
        },
        {
            "caption": "Hidden emerald waterfall valley tucked away in the deep Himalayas 🌊 Would you cliff jump here? ⛺ #TravelIndia #Himalayas #Wanderlust",
            "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
            "thumbnail_url": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800",
            "audio_title": "Acoustic Nature Harmony - Ambient Melody",
            "category": "Travel",
            "duration": 22,
            "views_count": 240000,
            "shares_count": 1200,
            "reaction_types": ["love", "care", "wow", "fire"],
            "comments": [
                "Pinned on my map immediately! 🏔️✨",
                "Water looks so crystal clear and freezing cold!"
            ]
        },
        {
            "caption": "The secret 60-second crispy street paneer tikka recipe! 🧀 Secret masala revealed in the end! #Foodie #StreetFood #PaneerLovers",
            "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4",
            "thumbnail_url": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800",
            "audio_title": "Desi Dhaba Beats - High Energy",
            "category": "Food",
            "duration": 14,
            "views_count": 94800,
            "shares_count": 310,
            "reaction_types": ["love", "haha", "fire"],
            "comments": [
                "Making this tonight for dinner! Looks so yummy 😋"
            ]
        },
        {
            "caption": "Insane 1v4 clutch ace in championship grand finals! 🎮 How did he spot that headshot?! 🎯 #Gaming #Esports #ClutchMoment",
            "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
            "thumbnail_url": "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800",
            "audio_title": "EDM Victory Anthem - Drop Beat",
            "category": "Gaming",
            "duration": 20,
            "views_count": 61300,
            "shares_count": 520,
            "reaction_types": ["fire", "wow", "like"],
            "comments": [
                "Cleanest flick shot of the tournament hands down! 🎯"
            ]
        }
    ]

    for idx, sample in enumerate(sample_reels):
        assigned_user = users[idx % len(users)]
        reel = Reel(
            user_id=assigned_user.id,
            video_url=sample["video_url"],
            thumbnail_url=sample["thumbnail_url"],
            caption=sample["caption"],
            audio_title=sample["audio_title"],
            category=sample["category"],
            duration=sample["duration"],
            views_count=sample["views_count"],
            shares_count=sample["shares_count"],
            created_at=now - datetime.timedelta(hours=(idx * 4 + 2))
        )
        db.add(reel)
        db.flush()

        # Seed reactions
        for r_user in users:
            rx_type = sample["reaction_types"][r_user.id % len(sample["reaction_types"])]
            db.add(Reaction(user_id=r_user.id, reel_id=reel.id, reaction_type=rx_type))

        # Seed comments
        for c_idx, c_text in enumerate(sample["comments"]):
            commenter = users[(idx + c_idx + 1) % len(users)]
            db.add(Comment(
                user_id=commenter.id,
                reel_id=reel.id,
                content=c_text,
                created_at=now - datetime.timedelta(minutes=(c_idx * 25 + 10))
            ))

    db.commit()


def get_reels_feed_service(
    db: Session,
    viewer_id: Optional[int] = None,
    category: Optional[str] = None
) -> Dict[str, Any]:
    """Retrieve full dynamic feed of reels across all users from MySQL database."""
    # Check count
    count = db.query(func.count(Reel.id)).scalar()
    if count == 0:
        seed_reels_if_empty(db, viewer_id)

    query = db.query(Reel)

    if category and category.strip() and category.strip() not in ["✨ All", "All", "🔥 Trending", "Trending"]:
        clean_category = category.replace("✨", "").replace("🔥", "").replace("💻", "").replace("🏏", "").replace("🎮", "").replace("✈️", "").replace("🍳", "").replace("🎵", "").replace("😂", "").strip()
        query = query.filter(Reel.category.ilike(f"%{clean_category}%"))

    reels = query.order_by(desc(Reel.created_at)).all()
    formatted = [format_reel_response(r, viewer_id=viewer_id, db=db) for r in reels]

    return {
        "success": True,
        "count": len(formatted),
        "data": formatted
    }


def get_user_reels_service(
    db: Session,
    target_user_id: int,
    viewer_id: Optional[int] = None
) -> Dict[str, Any]:
    """Retrieve all reels created by a specific user."""
    reels = db.query(Reel).filter(Reel.user_id == target_user_id).order_by(desc(Reel.created_at)).all()
    formatted = [format_reel_response(r, viewer_id=viewer_id, db=db) for r in reels]

    return {
        "success": True,
        "user_id": target_user_id,
        "count": len(formatted),
        "data": formatted
    }


def create_reel_service(
    db: Session,
    user_id: int,
    video_url: str,
    caption: Optional[str] = None,
    audio_title: Optional[str] = "Original Audio",
    thumbnail_url: Optional[str] = None,
    category: Optional[str] = "Trending",
    duration: Optional[int] = 15
) -> Dict[str, Any]:
    """Create and persist a new short vertical reel into MySQL database."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return {"success": False, "message": "User not found"}

    now = datetime.datetime.utcnow()

    reel = Reel(
        user_id=user_id,
        video_url=video_url,
        thumbnail_url=thumbnail_url,
        caption=caption,
        audio_title=audio_title or "Original Audio",
        category=category or "Trending",
        duration=duration or 15,
        views_count=1,
        shares_count=0,
        created_at=now
    )
    db.add(reel)
    db.flush()

    # Initial author love reaction
    db.add(Reaction(user_id=user_id, reel_id=reel.id, reaction_type="love", created_at=now))
    db.commit()
    db.refresh(reel)

    return {
        "success": True,
        "message": "Reel published successfully to database feed",
        "data": format_reel_response(reel, viewer_id=user_id, db=db)
    }


def react_to_reel_service(
    db: Session,
    user_id: int,
    reel_id: int,
    reaction_type: str = "like"
) -> Dict[str, Any]:
    """Toggle or switch user reaction on a reel in MySQL database."""
    reel = db.query(Reel).filter(Reel.id == reel_id).first()
    if not reel:
        return {"success": False, "message": "Reel not found"}

    existing_reaction = db.query(Reaction).filter(
        Reaction.user_id == user_id,
        Reaction.reel_id == reel_id
    ).first()

    liked = True
    active_reaction = reaction_type

    if existing_reaction:
        if existing_reaction.reaction_type == reaction_type:
            # Toggle off (unreact)
            db.delete(existing_reaction)
            liked = False
            active_reaction = None
        else:
            # Change reaction type (e.g. like -> fire)
            existing_reaction.reaction_type = reaction_type
            liked = True
            active_reaction = reaction_type
    else:
        # Add new reaction
        new_rx = Reaction(user_id=user_id, reel_id=reel_id, reaction_type=reaction_type)
        db.add(new_rx)
        liked = True
        active_reaction = reaction_type

    db.commit()

    # Re-calculate reactions count
    total_reactions = db.query(func.count(Reaction.id)).filter(Reaction.reel_id == reel_id).scalar()

    return {
        "success": True,
        "reel_id": reel_id,
        "liked": liked,
        "reactionType": active_reaction,
        "likesCount": total_reactions,
        "likes": format_count(total_reactions)
    }


def get_reel_comments_service(
    db: Session,
    reel_id: int,
    viewer_id: Optional[int] = None
) -> Dict[str, Any]:
    """Retrieve all comments on a specific reel."""
    reel = db.query(Reel).filter(Reel.id == reel_id).first()
    if not reel:
        return {"success": False, "message": "Reel not found", "data": []}

    comments = db.query(Comment).filter(
        Comment.reel_id == reel_id,
        Comment.parent_id == None
    ).order_by(desc(Comment.created_at)).all()

    formatted = []
    for c in comments:
        c_user = c.user
        c_prof = c_user.profile if c_user else None
        c_name = f"{c_user.first_name or ''} {c_user.surname or ''}".strip() if c_user else "Nexoria Member"
        c_avatar = c_prof.profile_pic if (c_prof and c_prof.profile_pic) else (
            c_user.profile_pic if (c_user and c_user.profile_pic) else f"https://i.pravatar.cc/100?u={c.user_id}"
        )
        formatted.append({
            "id": c.id,
            "user_id": c.user_id,
            "name": c_name,
            "avatar": c_avatar,
            "text": c.content,
            "time": format_time_ago(c.created_at),
            "created_at": c.created_at.isoformat() if c.created_at else None,
            "likes": len(c.reactions) if hasattr(c, "reactions") and c.reactions else 0
        })

    return {
        "success": True,
        "reel_id": reel_id,
        "count": len(formatted),
        "data": formatted
    }


def add_reel_comment_service(
    db: Session,
    user_id: int,
    reel_id: int,
    content: str,
    parent_id: Optional[int] = None
) -> Dict[str, Any]:
    """Add a new comment or reply to a reel in MySQL database."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return {"success": False, "message": "User not found"}

    reel = db.query(Reel).filter(Reel.id == reel_id).first()
    if not reel:
        return {"success": False, "message": "Reel not found"}

    now = datetime.datetime.utcnow()
    comment = Comment(
        user_id=user_id,
        reel_id=reel_id,
        parent_id=parent_id,
        content=content.strip(),
        created_at=now
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)

    u_prof = user.profile if user else None
    u_name = f"{user.first_name or ''} {user.surname or ''}".strip() or user.username
    u_avatar = u_prof.profile_pic if (u_prof and u_prof.profile_pic) else (
        user.profile_pic if user.profile_pic else f"https://i.pravatar.cc/100?u={user_id}"
    )

    total_comments = db.query(func.count(Comment.id)).filter(Comment.reel_id == reel_id).scalar()

    return {
        "success": True,
        "message": "Comment posted successfully",
        "commentsCount": total_comments,
        "data": {
            "id": comment.id,
            "user_id": user_id,
            "name": u_name,
            "avatar": u_avatar,
            "text": comment.content,
            "time": "Just now",
            "created_at": now.isoformat(),
            "likes": 0
        }
    }


def toggle_save_reel_service(
    db: Session,
    user_id: int,
    reel_id: int
) -> Dict[str, Any]:
    """Save or remove a reel bookmark in database."""
    saved_item = db.query(SavedPost).filter(
        SavedPost.user_id == user_id,
        SavedPost.reel_id == reel_id
    ).first()

    if saved_item:
        db.delete(saved_item)
        db.commit()
        return {"success": True, "saved": False, "message": "Reel removed from saved"}
    else:
        new_save = SavedPost(user_id=user_id, reel_id=reel_id)
        db.add(new_save)
        db.commit()
        return {"success": True, "saved": True, "message": "Reel saved to bookmarks"}


def get_saved_reels_service(
    db: Session,
    user_id: int
) -> Dict[str, Any]:
    """Fetch all reels saved by user."""
    saved_records = db.query(SavedPost).filter(
        SavedPost.user_id == user_id,
        SavedPost.reel_id != None
    ).order_by(desc(SavedPost.created_at)).all()

    reels = []
    for s in saved_records:
        if s.reel:
            reels.append(format_reel_response(s.reel, viewer_id=user_id, db=db))

    return {
        "success": True,
        "count": len(reels),
        "data": reels
    }


def send_reel_stars_service(
    db: Session,
    user_id: int,
    reel_id: int,
    stars_amount: int = 50,
    message: Optional[str] = None
) -> Dict[str, Any]:
    """Tip stars to reel creator."""
    reel = db.query(Reel).filter(Reel.id == reel_id).first()
    if not reel:
        return {"success": False, "message": "Reel not found"}

    tip = PostTip(
        reel_id=reel_id,
        tipper_id=user_id,
        stars_amount=stars_amount,
        message=message or "Sent Stars to Reel"
    )
    db.add(tip)
    db.commit()

    total_stars = db.query(func.sum(PostTip.stars_amount)).filter(PostTip.reel_id == reel_id).scalar() or stars_amount

    return {
        "success": True,
        "message": f"Sent {stars_amount} Stars to creator!",
        "stars_amount": stars_amount,
        "total_stars": int(total_stars)
    }


def increment_reel_view_service(db: Session, reel_id: int) -> Dict[str, Any]:
    """Increment reel view count in database."""
    reel = db.query(Reel).filter(Reel.id == reel_id).first()
    if not reel:
        return {"success": False, "message": "Reel not found"}

    reel.views_count = (reel.views_count or 0) + 1
    db.commit()
    return {"success": True, "views_count": reel.views_count}


def increment_reel_share_service(db: Session, reel_id: int) -> Dict[str, Any]:
    """Increment reel share count in database."""
    reel = db.query(Reel).filter(Reel.id == reel_id).first()
    if not reel:
        return {"success": False, "message": "Reel not found"}

    reel.shares_count = (reel.shares_count or 0) + 1
    db.commit()
    return {"success": True, "shares_count": reel.shares_count}


def delete_reel_service(db: Session, reel_id: int, user_id: int) -> Dict[str, Any]:
    """Delete a reel if current user is the owner."""
    reel = db.query(Reel).filter(Reel.id == reel_id).first()
    if not reel:
        return {"success": False, "message": "Reel not found"}

    if reel.user_id != user_id:
        return {"success": False, "message": "Unauthorized to delete this reel"}

    db.delete(reel)
    db.commit()
    return {"success": True, "message": "Reel deleted successfully"}


# =========================================================
# NEXORIA WATCH 16:9 LONG-FORM VIDEOS & WATCH PARTY SERVICES
# =========================================================

def seed_watch_videos_if_empty(db: Session):
    """Seed dynamic sample 16:9 Watch videos into MySQL database if none exist."""
    users = db.query(User).limit(6).all()
    if not users:
        return

    now = datetime.datetime.utcnow()

    sample_watch = [
        {
            "title": "Building an Autonomous AI Agent Ecosystem from Scratch in 2026 | Full Masterclass",
            "description": "Deep dive into multi-agent workflows, tool routing, memory caching, and state machines with modern web frameworks. Complete source code walkthrough included!",
            "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            "thumbnail_url": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1000",
            "category": "Tech & AI",
            "duration": 1458,  # ~24m
            "views_count": 1420000,
            "shares_count": 1820
        },
        {
            "title": "India vs Australia T20 Final Thriller - Extended Match Highlights & Dressing Room Celebrations 🏆",
            "description": "Relive every boundary, wicket, and the breathless final over that decided the World Championship! Includes exclusive post-match interviews.",
            "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
            "thumbnail_url": "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=1000",
            "category": "Sports",
            "duration": 1125,  # ~18m
            "views_count": 4800000,
            "shares_count": 8900
        },
        {
            "title": "Top 10 Hidden Gem Destinations in South Asia You Must Visit Before You Turn 30 ✈️🌏",
            "description": "From secret island lagoons in Kerala to mist-shrouded tea valleys in Munnar and high mountain monasteries in Ladakh.",
            "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
            "thumbnail_url": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1000",
            "category": "Travel",
            "duration": 920,   # ~15m
            "views_count": 890000,
            "shares_count": 640
        }
    ]

    for idx, sample in enumerate(sample_watch):
        assigned_user = users[idx % len(users)]
        v = Reel(
            user_id=assigned_user.id,
            video_type="watch",
            title=sample["title"],
            description=sample["description"],
            video_url=sample["video_url"],
            thumbnail_url=sample["thumbnail_url"],
            caption=sample["title"],
            category=sample["category"],
            duration=sample["duration"],
            views_count=sample["views_count"],
            shares_count=sample["shares_count"],
            created_at=now - datetime.timedelta(days=(idx + 1))
        )
        db.add(v)
        db.flush()

        # Seed initial reactions
        for u in users:
            db.add(Reaction(user_id=u.id, reel_id=v.id, reaction_type="like"))

    db.commit()


def get_watch_feed_service(
    db: Session,
    viewer_id: Optional[int] = None,
    category: Optional[str] = None
) -> Dict[str, Any]:
    """Retrieve full dynamic feed of 16:9 Watch videos from MySQL database."""
    # Check if any watch videos exist
    watch_count = db.query(func.count(Reel.id)).filter(Reel.video_type == "watch").scalar()
    if watch_count == 0:
        seed_watch_videos_if_empty(db)

    query = db.query(Reel).filter(Reel.video_type == "watch")

    if category and category.strip() and category.strip() not in ["✨ All", "All", "🔥 Trending", "Trending"]:
        clean_category = category.replace("✨", "").replace("🔥", "").replace("💻", "").replace("🏏", "").replace("🎮", "").replace("✈️", "").replace("🍳", "").replace("🎵", "").replace("😂", "").strip()
        query = query.filter(Reel.category.ilike(f"%{clean_category}%"))

    videos = query.order_by(desc(Reel.created_at)).all()
    formatted = [format_reel_response(v, viewer_id=viewer_id, db=db) for v in videos]

    return {
        "success": True,
        "count": len(formatted),
        "data": formatted
    }


def create_watch_video_service(
    db: Session,
    user_id: int,
    title: str,
    video_url: str,
    description: Optional[str] = None,
    thumbnail_url: Optional[str] = None,
    category: Optional[str] = "Tech & AI",
    duration: Optional[int] = 120
) -> Dict[str, Any]:
    """Publish a new 16:9 Watch video to the database."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return {"success": False, "message": "User not found"}

    now = datetime.datetime.utcnow()

    watch_video = Reel(
        user_id=user_id,
        video_type="watch",
        title=title.strip(),
        description=(description or "").strip(),
        caption=title.strip(),
        video_url=video_url.strip(),
        thumbnail_url=thumbnail_url or "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1000",
        category=category or "Tech & AI",
        duration=duration or 120,
        views_count=1,
        shares_count=0,
        created_at=now
    )
    db.add(watch_video)
    db.flush()

    db.add(Reaction(user_id=user_id, reel_id=watch_video.id, reaction_type="like", created_at=now))
    db.commit()
    db.refresh(watch_video)

    return {
        "success": True,
        "message": "Watch video published successfully",
        "data": format_reel_response(watch_video, viewer_id=user_id, db=db)
    }


# In-Memory Real-Time Watch Party State Manager
WATCH_PARTY_ROOMS: Dict[str, Dict[str, Any]] = {
    "general": {
        "party_id": "general",
        "viewers_count": 8,
        "messages": [
            { "id": 1, "user": "Aarav S.", "text": "Bro check out that drone transition at 0:42! 🔥", "time": "10:14" },
            { "id": 2, "user": "Pooja V.", "text": "Color grading is unreal ✨", "time": "10:15" },
            { "id": 3, "user": "Kabir X.", "text": "Synced audio sounds crisp on headphones 🎧", "time": "10:15" }
        ]
    }
}


def send_watch_party_chat_service(party_id: str, user: str, text: str) -> Dict[str, Any]:
    """Add a synchronized chat message to a Watch Party room."""
    pid = party_id or "general"
    if pid not in WATCH_PARTY_ROOMS:
        WATCH_PARTY_ROOMS[pid] = {
            "party_id": pid,
            "viewers_count": 5,
            "messages": []
        }

    new_msg = {
        "id": int(datetime.datetime.utcnow().timestamp() * 1000),
        "user": user or "You",
        "text": text.strip(),
        "time": datetime.datetime.utcnow().strftime("%H:%M")
    }

    WATCH_PARTY_ROOMS[pid]["messages"].append(new_msg)
    # Keep last 100 messages
    if len(WATCH_PARTY_ROOMS[pid]["messages"]) > 100:
        WATCH_PARTY_ROOMS[pid]["messages"] = WATCH_PARTY_ROOMS[pid]["messages"][-100:]

    return {
        "success": True,
        "message": new_msg,
        "party_id": pid,
        "all_messages": WATCH_PARTY_ROOMS[pid]["messages"]
    }


def get_watch_party_state_service(party_id: str) -> Dict[str, Any]:
    """Fetch current synchronized chat & viewer state for a Watch Party room."""
    pid = party_id or "general"
    if pid not in WATCH_PARTY_ROOMS:
        WATCH_PARTY_ROOMS[pid] = {
            "party_id": pid,
            "viewers_count": 6,
            "messages": [
                { "id": 1, "user": "Nexoria Live", "text": "Welcome to the Synchronized Watch Lounge! 🍿🎬", "time": "Now" }
            ]
        }

    return {
        "success": True,
        "party_id": pid,
        "viewers_count": WATCH_PARTY_ROOMS[pid]["viewers_count"],
        "messages": WATCH_PARTY_ROOMS[pid]["messages"]
    }

