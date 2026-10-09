import json
import datetime
from typing import Any, Dict, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, func, desc

from models.profile import Profile, ProfilePhoto, PhotoType
from models.social import Friend, Follow, Notification
from models.content import Post, Reel, Comment, Like, Reaction, Share
from models.payment import StarTransaction
from models.user import User


def safe_json_loads(val: Any, default: Any):
    """Safely parse JSON strings or return fallback default."""
    if val is None:
        return default
    if isinstance(val, (list, dict)):
        return val
    try:
        return json.loads(val)
    except Exception:
        return default


def get_or_create_profile(db: Session, user_id: int) -> Profile:
    """Agar user ka profile row already nahi bana, to default values ke sath initialize karte hain."""
    profile = db.query(Profile).filter(Profile.user_id == user_id).first()
    if not profile:
        profile = Profile(user_id=user_id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile


def profile_to_full_dict(profile: Profile, db: Optional[Session] = None, current_user_id: Optional[int] = None) -> Dict[str, Any]:
    """Profile model ko Pydantic ProfileFullOut schema me serialize karne ke liye python dict banata hai."""
    u = profile.user
    first_name = u.first_name if u else ""
    surname = u.surname if u else ""
    full_name = f"{first_name} {surname}".strip() if (first_name or surname) else "Nexoria User"
    username = u.username if u else f"user_{profile.user_id}"
    user_email = u.email if u else ""

    # Dynamic metrics computation
    friends_cnt = 0
    followers_cnt = 0
    following_cnt = 0
    posts_cnt = 0
    photos_cnt = 0
    reels_cnt = 0
    stars_cnt = 0
    is_following = False
    is_friend = False
    friend_status = "none"

    if db is not None:
        uid = profile.user_id
        # 1. Friends count
        friends_cnt = db.query(Friend).filter(
            Friend.status == "accepted",
            or_(Friend.sender_id == uid, Friend.receiver_id == uid)
        ).count()

        # 2. Followers & Following
        followers_cnt = db.query(Follow).filter(Follow.following_id == uid).count()
        following_cnt = db.query(Follow).filter(Follow.follower_id == uid).count()

        # 3. Posts & Photos & Reels
        posts_cnt = db.query(Post).filter(Post.user_id == uid).count()
        reels_cnt = db.query(Reel).filter(Reel.user_id == uid).count()

        prof_photos = db.query(ProfilePhoto).filter(ProfilePhoto.profile_id == profile.id).count()
        post_photos = db.query(Post).filter(Post.user_id == uid, Post.image_url.isnot(None), Post.image_url != "").count()
        photos_cnt = prof_photos + post_photos

        # 4. Creator Stars
        star_sum = db.query(func.sum(StarTransaction.stars_amount)).filter(StarTransaction.receiver_id == uid).scalar()
        stars_cnt = int(star_sum) if star_sum else 0

        # 5. Relationship with current viewer
        if current_user_id and current_user_id != uid:
            is_following = bool(db.query(Follow).filter(Follow.follower_id == current_user_id, Follow.following_id == uid).first())
            
            fr = db.query(Friend).filter(
                or_(
                    and_(Friend.sender_id == current_user_id, Friend.receiver_id == uid),
                    and_(Friend.sender_id == uid, Friend.receiver_id == current_user_id)
                )
            ).first()
            if fr:
                friend_status = fr.status
                is_friend = (fr.status == "accepted")

    return {
        "id": profile.id,
        "user_id": profile.user_id,
        "first_name": first_name,
        "surname": surname,
        "full_name": full_name,
        "username": username,
        "email": profile.contact_email or user_email,
        "profile_pic": profile.profile_pic or f"https://i.pravatar.cc/150?u={profile.user_id}",
        "cover_photo": profile.cover_photo or "https://images.unsplash.com/photo-1707343843437-caacff5cfa74?w=1200",
        "cover_photo_offset_y": profile.cover_photo_offset_y or 0,
        "cover_photo_zoom": profile.cover_photo_zoom or 1.0,

        "bio": profile.bio or "🚀 Full-Stack AI Engineer & Open Source Contributor | Building next-gen decentralized social experiences on Nexoria.",
        "intro_quote": profile.intro_quote or "Innovating for a zero-manipulation social web ✨",

        "pinned_details": safe_json_loads(profile.pinned_details, ["category", "city", "education", "work"]),
        "categories": safe_json_loads(profile.categories, ["Digital creator", "Software Engineer"]),
        "is_ai_creator": profile.is_ai_creator if profile.is_ai_creator is not None else True,

        "current_city": profile.current_city or "Delhi, India",
        "hometown": profile.hometown or "Deoria, UP",
        "relationship_status": profile.relationship_status or "Single",
        "dob_month_day": profile.dob_month_day or "10 August",
        "dob_year": profile.dob_year or "2002",
        "dob_privacy": profile.dob_privacy or "Friends",
        "gender": profile.gender or "Male",
        "pronouns": profile.pronouns or "he/him",
        "languages": safe_json_loads(profile.languages, ["Hindi", "English", "Bhojpuri"]),

        "family_members": safe_json_loads(profile.family_members, []),
        "pets": safe_json_loads(profile.pets, []),

        "work_workplace": profile.work_workplace or "Nexoria Technologies",
        "work_job_title": profile.work_job_title or "Full Stack Engineer",
        "work_privacy": profile.work_privacy or "Public",

        "education_school": profile.education_school or "St. Xavier's High School",
        "education_college": profile.education_college or "Computer Science and Engineering",
        "education_degree": profile.education_degree or "B.Tech Computer Science",
        "education_privacy": profile.education_privacy or "Public",

        "hobbies": safe_json_loads(profile.hobbies, ["💻 Coding", "📸 Photography", "🎵 Music Production", "✈️ Traveling"]),
        "interests": safe_json_loads(profile.interests, {
            "music": ["Electronic", "Lo-Fi Beats", "Indian Classical", "Synthwave"],
            "tv_programmes": ["Silicon Valley", "Black Mirror", "Mr. Robot", "Dark"],
            "films": ["Interstellar", "Inception", "The Matrix", "Oppenheimer"],
            "games": ["Cyberpunk 2077", "Valorant", "GTA V", "Chess"],
            "sports": ["Cricket", "Formula 1", "Badminton", "Table Tennis"]
        }),
        "visited_places": safe_json_loads(profile.visited_places, ["Delhi, India", "Deoria, UP", "Varanasi, UP", "Goa, India"]),
        "places_privacy": profile.places_privacy or "Public",

        "communities": safe_json_loads(profile.communities, [
            {"name": "AI Engineers & Innovators India", "role": "Moderator"},
            {"name": "React & Next.js Developers", "role": "Member"},
            {"name": "Delhi Tech Founders", "role": "Core Member"}
        ]),
        "offers": safe_json_loads(profile.offers, []),

        "social_handles": safe_json_loads(profile.social_handles, {
            "instagram": "sanny_tiwari_official",
            "github": "123sanny",
            "twitter": "sannytiwari_ai",
            "linkedin": "sannytiwari",
            "youtube": "@sannytiwari"
        }),
        "custom_links": safe_json_loads(profile.custom_links, [
            "https://github.com/123sanny",
            "https://nexoria.social/@sanny",
            "https://linkedin.com/in/sannytiwari"
        ]),
        "website_link": profile.website_link or "https://nexoria.social/@sanny",
        "contact_phone": profile.contact_phone,
        "contact_email": profile.contact_email,
        "contact_privacy": profile.contact_privacy or "Friends",

        "media_kit_title": profile.media_kit_title or "Creator Media Kit 2026",
        "media_kit_link": profile.media_kit_link or "https://nexoria.social/kit/sanny",
        "media_kit_privacy": profile.media_kit_privacy or "Public",

        "badges": safe_json_loads(profile.badges, ["verified_id", "pioneer", "e2e_guard", "top_contributor"]),
        "aadhaar_verified": profile.aadhaar_verified if profile.aadhaar_verified is not None else True,

        # Dynamic Blue Tick Verification Logic: Only for >= 1M followers OR purchased/subscribed
        "is_verified": bool((followers_cnt >= 1_000_000) or getattr(profile, "is_verified_purchased", False) or (u and getattr(u, "is_verified", False))),
        "is_verified_purchased": bool(getattr(profile, "is_verified_purchased", False) or (u and getattr(u, "is_verified", False))),
        "can_get_free_verified": bool(followers_cnt >= 1_000_000),

        # Dynamic Metrics
        "friends_count": friends_cnt,
        "followers_count": followers_cnt,
        "following_count": following_cnt,
        "posts_count": posts_cnt,
        "photos_count": photos_cnt,
        "reels_count": reels_cnt,
        "stars_count": stars_cnt,
        "truthguard_score": 99.8,
        "is_following": is_following,
        "is_friend": is_friend,
        "friend_status": friend_status,

        "created_at": profile.created_at,
        "updated_at": profile.updated_at
    }


def purchase_or_activate_blue_tick(
    db: Session,
    user_id: int,
    plan_tier: str = "monthly",
    payment_method: str = "upi",
    legal_name: Optional[str] = None,
    category: Optional[str] = "Creator & Pioneer",
    upi_id: Optional[str] = None,
    amount: Optional[float] = None
) -> Dict[str, Any]:
    """User ke liye Blue Tick application & payment receipt create karta hai jo Admin verification queue me jaata hai."""
    profile = get_or_create_profile(db, user_id)
    now = datetime.datetime.utcnow()
    is_yearly = (plan_tier == "yearly")
    final_amount = amount if amount is not None else (4999.0 if is_yearly else 499.0)
    expires_at = now + datetime.timedelta(days=365 if is_yearly else 30)
    txn_id = f"NEX-VFY-{now.strftime('%Y%m%d%H%M%S')}-{user_id}"

    # Create BlueTickRequest in Admin verification queue
    try:
        from models.payment import BlueTickRequest
        req = BlueTickRequest(
            user_id=user_id,
            full_name=legal_name or (f"{profile.user.first_name} {profile.user.surname}" if profile.user else f"User #{user_id}"),
            category=category or "Creator & Pioneer",
            id_document_type="Government ID / Payment Receipt",
            id_document_url="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600",
            payment_ref=txn_id,
            amount_paid=final_amount,
            currency="INR",
            status="pending"
        )
        db.add(req)
        db.commit()
    except Exception as e:
        print("BlueTickRequest DB creation notice:", e)

    return {
        "success": True,
        "message": "Payment receipt & verification application submitted! Admin will verify your transaction and grant your Blue Tick badge. ⏳💎",
        "is_verified": False,
        "is_verified_purchased": False,
        "transaction_id": txn_id,
        "plan_tier": plan_tier,
        "plan_name": "Annual Verified Pass (365 Days)" if is_yearly else "Monthly Verified Subscription (30 Days)",
        "amount_paid": final_amount,
        "currency": "INR",
        "payment_method": payment_method,
        "legal_name": legal_name or (f"{profile.user.first_name} {profile.user.surname}" if profile.user else "Verified Member"),
        "category": category or "Creator & Pioneer",
        "activated_at": now.strftime("%d %B %Y, %I:%M %p"),
        "expires_at": expires_at.strftime("%d %B %Y"),
        "status": "pending"
    }


def toggle_blue_tick(db: Session, user_id: int, is_verified: bool) -> Dict[str, Any]:
    """Admin / User switch to toggle blue tick."""
    profile = get_or_create_profile(db, user_id)
    profile.is_verified_purchased = is_verified
    if profile.user:
        profile.user.is_verified = is_verified
    db.commit()
    db.refresh(profile)
    return {
        "success": True,
        "is_verified": is_verified,
        "is_verified_purchased": is_verified
    }


def set_active_photo(db: Session, profile_id: int, photo_type: PhotoType, photo: ProfilePhoto):
    """Purani active photo ko deactivate karke nayi ko active set karta hai."""
    db.query(ProfilePhoto).filter(
        ProfilePhoto.profile_id == profile_id,
        ProfilePhoto.photo_type == photo_type,
        ProfilePhoto.is_active == True,
    ).update({"is_active": False})
    photo.is_active = True
    db.commit()


def get_user_posts_data(db: Session, user_id: int, viewer_id: Optional[int] = None) -> List[Dict[str, Any]]:
    """Fetch real user posts from database with author info, comments, engagement, and viewer like state."""
    posts = db.query(Post).filter(Post.user_id == user_id).order_by(Post.created_at.desc()).all()
    res = []
    for p in posts:
        author = p.author
        author_name = f"{author.first_name} {author.surname}".strip() if author else "Nexoria User"
        author_pic = author.profile_pic if (author and author.profile_pic) else f"https://i.pravatar.cc/150?u={user_id}"
        
        # Determine verified status for author
        author_followers = db.query(Follow).filter(Follow.following_id == p.user_id).count()
        author_profile = author.profile if author else None
        author_verified = bool(author_followers >= 1_000_000 or getattr(author, "is_verified", False) or getattr(author_profile, "is_verified_purchased", False))

        # Comments
        comments_list = []
        for c in (p.comments or []):
            c_user = c.user
            c_name = f"{c_user.first_name} {c_user.surname}".strip() if c_user else "User"
            c_pic = c_user.profile_pic if (c_user and c_user.profile_pic) else f"https://i.pravatar.cc/40?u={c.user_id}"
            
            c_time = "Just now"
            if c.created_at:
                c_diff = int((datetime.datetime.utcnow() - c.created_at).total_seconds())
                if c_diff < 60: c_time = "Just now"
                elif c_diff < 3600: c_time = f"{c_diff // 60}m"
                elif c_diff < 86400: c_time = f"{c_diff // 3600}h"
                else: c_time = f"{c_diff // 86400}d"

            comments_list.append({
                "id": c.id,
                "user_id": c.user_id,
                "name": c_name,
                "profile": c_pic,
                "text": c.content,
                "time": c_time,
                "created_at": c.created_at.isoformat() + "Z" if c.created_at else "",
                "likes": 0
            })

        likes_cnt = len(p.likes) if p.likes else (len(p.reactions) if p.reactions else 0)
        shares_cnt = len(p.shares) if p.shares else 0

        # Check if viewer liked / reacted
        user_reaction = None
        is_liked = False
        if viewer_id:
            user_react_obj = db.query(Reaction).filter(Reaction.post_id == p.id, Reaction.user_id == viewer_id).first()
            if user_react_obj:
                user_reaction = user_react_obj.reaction_type
                is_liked = True
            elif db.query(Like).filter(Like.post_id == p.id, Like.user_id == viewer_id).first():
                user_reaction = "like"
                is_liked = True

        # Time formatting
        time_str = "Just now"
        if p.created_at:
            diff = datetime.datetime.utcnow() - p.created_at
            secs = int(diff.total_seconds())
            if secs < 60:
                time_str = "Just now"
            elif secs < 3600:
                time_str = f"{secs // 60}m ago"
            elif secs < 86400:
                time_str = f"{secs // 3600}h ago"
            else:
                time_str = f"{secs // 86400}d ago"

        res.append({
            "id": p.id,
            "user_id": p.user_id,
            "name": author_name,
            "profile": author_pic,
            "is_verified": author_verified,
            "time": time_str,
            "created_at": p.created_at.isoformat() + "Z" if p.created_at else "",
            "caption": p.content or "",
            "image": p.image_url or "",
            "video": p.video_url or "",
            "feeling": p.feeling or "",
            "location": p.location or "",
            "privacy": p.privacy or "public",
            "likesCount": likes_cnt,
            "commentsCount": len(comments_list),
            "sharesCount": shares_cnt,
            "isLiked": is_liked,
            "userReaction": user_reaction,
            "music_title": p.music_title,
            "music_artist": p.music_artist,
            "music_url": p.music_url,
            "music_cover": p.music_cover,
            "music_duration": p.music_duration or 30,
            "music": {
                "title": p.music_title,
                "artist": p.music_artist,
                "url": p.music_url,
                "cover": p.music_cover,
                "duration": p.music_duration or 30
            } if p.music_title else None,
            "comments": comments_list
        })
    return res


def get_all_feed_posts_data(
    db: Session,
    viewer_id: Optional[int] = None,
    limit: int = 100,
    offset: int = 0
) -> List[Dict[str, Any]]:
    """Fetch global feed posts created by all community users with live engagement & profile info."""
    posts = db.query(Post).order_by(Post.created_at.desc()).limit(limit).offset(offset).all()
    res = []
    for p in posts:
        author = p.author
        author_name = f"{author.first_name} {author.surname}".strip() if author else "Nexoria User"
        author_pic = author.profile_pic if (author and author.profile_pic) else f"https://i.pravatar.cc/150?u={p.user_id}"
        
        # Author Blue Tick Verification Check
        author_followers = db.query(Follow).filter(Follow.following_id == p.user_id).count()
        author_profile = author.profile if author else None
        author_verified = bool(author_followers >= 1_000_000 or getattr(author, "is_verified", False) or getattr(author_profile, "is_verified_purchased", False))

        # Comments
        comments_list = []
        for c in (p.comments or []):
            c_user = c.user
            c_name = f"{c_user.first_name} {c_user.surname}".strip() if c_user else "User"
            c_pic = c_user.profile_pic if (c_user and c_user.profile_pic) else f"https://i.pravatar.cc/40?u={c.user_id}"
            
            c_time = "Just now"
            if c.created_at:
                c_diff = int((datetime.datetime.utcnow() - c.created_at).total_seconds())
                if c_diff < 60: c_time = "Just now"
                elif c_diff < 3600: c_time = f"{c_diff // 60}m"
                elif c_diff < 86400: c_time = f"{c_diff // 3600}h"
                else: c_time = f"{c_diff // 86400}d"

            comments_list.append({
                "id": c.id,
                "user_id": c.user_id,
                "name": c_name,
                "profile": c_pic,
                "text": c.content,
                "time": c_time,
                "created_at": c.created_at.isoformat() + "Z" if c.created_at else "",
                "likes": 0
            })

        likes_cnt = len(p.likes) if p.likes else (len(p.reactions) if p.reactions else 0)
        shares_cnt = len(p.shares) if p.shares else 0

        # Check if viewer liked / reacted
        user_reaction = None
        is_liked = False
        if viewer_id:
            user_react_obj = db.query(Reaction).filter(Reaction.post_id == p.id, Reaction.user_id == viewer_id).first()
            if user_react_obj:
                user_reaction = user_react_obj.reaction_type
                is_liked = True
            elif db.query(Like).filter(Like.post_id == p.id, Like.user_id == viewer_id).first():
                user_reaction = "like"
                is_liked = True

        time_str = "Just now"
        if p.created_at:
            diff = datetime.datetime.utcnow() - p.created_at
            secs = int(diff.total_seconds())
            if secs < 60:
                time_str = "Just now"
            elif secs < 3600:
                time_str = f"{secs // 60}m ago"
            elif secs < 86400:
                time_str = f"{secs // 3600}h ago"
            else:
                time_str = f"{secs // 86400}d ago"

        res.append({
            "id": p.id,
            "user_id": p.user_id,
            "name": p.ghost_alias if p.is_ghost else author_name,
            "profile": f"https://api.dicebear.com/7.x/bottts/svg?seed={p.ghost_alias}" if p.is_ghost else author_pic,
            "author_id": p.user_id,
            "author_name": author_name,
            "author_pic": author_pic,
            "is_verified": author_verified if not p.is_ghost else False,
            "time": time_str,
            "created_at": p.created_at.isoformat() + "Z" if p.created_at else "",
            "caption": p.content or "",
            "image": p.image_url or "",
            "video": p.video_url or "",
            "feeling": p.feeling or "",
            "location": p.location or "",
            "privacy": p.privacy or "public",
            "likesCount": likes_cnt,
            "commentsCount": len(comments_list),
            "sharesCount": shares_cnt,
            "isLiked": is_liked,
            "userReaction": user_reaction,
            "music_title": p.music_title,
            "music_artist": p.music_artist,
            "music_url": p.music_url,
            "music_cover": p.music_cover,
            "music_duration": p.music_duration or 30,
            "music": {
                "title": p.music_title,
                "artist": p.music_artist,
                "url": p.music_url,
                "cover": p.music_cover,
                "duration": p.music_duration or 30
            } if p.music_title else None,
            "comments": comments_list
        })
    return res


def create_new_post(
    db: Session,
    user_id: int,
    content: Optional[str] = None,
    image_url: Optional[str] = None,
    video_url: Optional[str] = None,
    feeling: Optional[str] = None,
    location: Optional[str] = None,
    privacy: str = "public",
    is_ghost: bool = False,
    ghost_alias: Optional[str] = None,
    music_title: Optional[str] = None,
    music_artist: Optional[str] = None,
    music_url: Optional[str] = None,
    music_cover: Optional[str] = None,
    music_duration: Optional[int] = 30
) -> Dict[str, Any]:
    """Insert a new post into database and return formatted record."""
    post = Post(
        user_id=user_id,
        content=content,
        image_url=image_url,
        video_url=video_url,
        feeling=feeling,
        location=location,
        privacy=privacy,
        is_ghost=is_ghost,
        ghost_alias=ghost_alias if is_ghost else None,
        music_title=music_title,
        music_artist=music_artist,
        music_url=music_url,
        music_cover=music_cover,
        music_duration=music_duration or 30,
        truthguard_score=99.8,
        stars_earned=0
    )
    db.add(post)
    db.commit()
    db.refresh(post)

    author = db.query(User).filter(User.id == user_id).first()
    author_name = f"{author.first_name} {author.surname}".strip() if author else "Nexoria User"
    author_pic = author.profile_pic if (author and author.profile_pic) else f"https://i.pravatar.cc/150?u={user_id}"
    author_followers = db.query(Follow).filter(Follow.following_id == user_id).count()
    author_profile = author.profile if author else None
    author_verified = bool(author_followers >= 1_000_000 or getattr(author, "is_verified", False) or getattr(author_profile, "is_verified_purchased", False))

    return {
        "success": True,
        "data": {
            "id": post.id,
            "user_id": post.user_id,
            "name": post.ghost_alias if post.is_ghost else author_name,
            "profile": f"https://api.dicebear.com/7.x/bottts/svg?seed={post.ghost_alias}" if post.is_ghost else author_pic,
            "author_id": post.user_id,
            "author_name": author_name,
            "author_pic": author_pic,
            "is_verified": author_verified if not post.is_ghost else False,
            "time": "Just now",
            "created_at": post.created_at.isoformat() + "Z" if post.created_at else "",
            "caption": post.content or "",
            "image": post.image_url or "",
            "video": post.video_url or "",
            "feeling": post.feeling or "",
            "location": post.location or "",
            "privacy": post.privacy or "public",
            "likesCount": 0,
            "commentsCount": 0,
            "sharesCount": 0,
            "stars": 0,
            "truthguard_score": 99.8,
            "isGhost": bool(post.is_ghost),
            "ghostAlias": post.ghost_alias or "",
            "isLiked": False,
            "userReaction": None,
            "music_title": post.music_title,
            "music_artist": post.music_artist,
            "music_url": post.music_url,
            "music_cover": post.music_cover,
            "music_duration": post.music_duration or 30,
            "music": {
                "title": post.music_title,
                "artist": post.music_artist,
                "url": post.music_url,
                "cover": post.music_cover,
                "duration": post.music_duration or 30
            } if post.music_title else None,
            "comments": []
        }
    }


def get_user_photos_data(db: Session, user_id: int, viewer_id: Optional[int] = None) -> List[Dict[str, Any]]:
    """Fetch rich user uploaded photos with live likes, comments, and engagement for interactive viewing."""
    profile = db.query(Profile).filter(Profile.user_id == user_id).first()
    author = profile.user if profile else db.query(User).filter(User.id == user_id).first()
    author_name = f"{author.first_name} {author.surname}".strip() if author else "Nexoria User"
    author_pic = author.profile_pic if (author and author.profile_pic) else f"https://i.pravatar.cc/150?u={user_id}"
    
    author_followers = db.query(Follow).filter(Follow.following_id == user_id).count()
    author_verified = bool(author_followers >= 1_000_000 or getattr(author, "is_verified", False) or getattr(profile, "is_verified_purchased", False))

    photos = []
    seen_urls = set()

    # 1. Post image attachments (with full post engagement)
    post_images = db.query(Post).filter(
        Post.user_id == user_id,
        Post.image_url.isnot(None),
        Post.image_url != ""
    ).order_by(Post.created_at.desc()).all()

    for p in post_images:
        if p.image_url and p.image_url not in seen_urls:
            seen_urls.add(p.image_url)
            
            # Comments
            comments_list = []
            for c in (p.comments or []):
                c_user = c.user
                c_name = f"{c_user.first_name} {c_user.surname}".strip() if c_user else "User"
                c_pic = c_user.profile_pic if (c_user and c_user.profile_pic) else f"https://i.pravatar.cc/40?u={c.user_id}"
                c_time = "Just now"
                if c.created_at:
                    c_diff = int((datetime.datetime.utcnow() - c.created_at).total_seconds())
                    if c_diff < 60: c_time = "Just now"
                    elif c_diff < 3600: c_time = f"{c_diff // 60}m"
                    elif c_diff < 86400: c_time = f"{c_diff // 3600}h"
                    else: c_time = f"{c_diff // 86400}d"
                comments_list.append({
                    "id": c.id,
                    "user_id": c.user_id,
                    "name": c_name,
                    "profile": c_pic,
                    "text": c.content,
                    "time": c_time,
                    "created_at": c.created_at.isoformat() + "Z" if c.created_at else ""
                })

            likes_cnt = len(p.likes) if p.likes else (len(p.reactions) if p.reactions else 0)
            shares_cnt = len(p.shares) if p.shares else 0

            # Check if viewer liked
            is_liked = False
            user_reaction = None
            if viewer_id:
                user_react_obj = db.query(Reaction).filter(Reaction.post_id == p.id, Reaction.user_id == viewer_id).first()
                if user_react_obj:
                    user_reaction = user_react_obj.reaction_type
                    is_liked = True
                elif db.query(Like).filter(Like.post_id == p.id, Like.user_id == viewer_id).first():
                    user_reaction = "like"
                    is_liked = True

            photos.append({
                "id": p.id,
                "post_id": p.id,
                "url": p.image_url,
                "caption": p.content or "Photo update",
                "user_id": p.user_id,
                "author_name": author_name,
                "author_pic": author_pic,
                "author_verified": author_verified,
                "created_at": p.created_at.strftime("%d %b %Y, %I:%M %p") if p.created_at else "Recent",
                "likesCount": likes_cnt,
                "commentsCount": len(comments_list),
                "sharesCount": shares_cnt,
                "isLiked": is_liked,
                "userReaction": user_reaction,
                "comments": comments_list
            })

    # 2. Profile & cover photos
    if profile:
        prof_photos = db.query(ProfilePhoto).filter(
            ProfilePhoto.profile_id == profile.id
        ).order_by(ProfilePhoto.uploaded_at.desc()).all()
        for pp in prof_photos:
            if pp.photo_url and pp.photo_url not in seen_urls:
                seen_urls.add(pp.photo_url)
                photos.append({
                    "id": f"prof_{pp.id}",
                    "post_id": None,
                    "url": pp.photo_url,
                    "caption": pp.caption or (f"{pp.photo_type.title()} Photo" if pp.photo_type else "Profile Photo"),
                    "user_id": user_id,
                    "author_name": author_name,
                    "author_pic": author_pic,
                    "author_verified": author_verified,
                    "created_at": pp.uploaded_at.strftime("%d %b %Y") if pp.uploaded_at else "Recent",
                    "likesCount": 0,
                    "commentsCount": 0,
                    "sharesCount": 0,
                    "isLiked": False,
                    "userReaction": None,
                    "comments": []
                })

    return photos


def get_user_reels_data(db: Session, user_id: int) -> List[Dict[str, Any]]:
    """Fetch real reels by user."""
    reels = db.query(Reel).filter(Reel.user_id == user_id).order_by(Reel.created_at.desc()).all()
    res = []
    for r in reels:
        res.append({
            "id": r.id,
            "user_id": r.user_id,
            "title": r.caption or r.audio_title or "Reel",
            "video_url": r.video_url,
            "img": r.thumbnail_url or "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500",
            "views": f"{r.views_count} views" if r.views_count else "1 view",
            "duration": r.duration or 15,
            "created_at": r.created_at.isoformat() + "Z" if r.created_at else ""
        })
    return res


def react_to_post(db: Session, post_id: int, user_id: int, reaction_type: str = "like") -> Dict[str, Any]:
    """Toggle or update reaction/like on a post or photo, and notify post author."""
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        return {"success": False, "message": "Post not found"}

    existing_react = db.query(Reaction).filter(Reaction.post_id == post_id, Reaction.user_id == user_id).first()
    current_react = None

    if existing_react:
        if existing_react.reaction_type == reaction_type:
            # Same reaction -> Remove it (unlike)
            db.delete(existing_react)
            db.query(Like).filter(Like.post_id == post_id, Like.user_id == user_id).delete()
            current_react = None
        else:
            # Different reaction -> Update it
            existing_react.reaction_type = reaction_type
            current_react = reaction_type
    else:
        # Add new reaction
        new_react = Reaction(post_id=post_id, user_id=user_id, reaction_type=reaction_type)
        db.add(new_react)
        # Also ensure Like record exists
        if not db.query(Like).filter(Like.post_id == post_id, Like.user_id == user_id).first():
            db.add(Like(post_id=post_id, user_id=user_id))
        current_react = reaction_type

        # Dispatch notification to post author if not self
        if post.user_id != user_id:
            reactor = db.query(User).filter(User.id == user_id).first()
            reactor_name = f"{reactor.first_name} {reactor.surname}".strip() if reactor else "Someone"
            notif = Notification(
                user_id=post.user_id,
                actor_id=user_id,
                post_id=post.id,
                entity_type="post",
                entity_id=post.id,
                type="like",
                message=f"{reactor_name} liked your photo/post 👍"
            )
            db.add(notif)

    db.commit()

    # Recalculate likes
    likes_cnt = db.query(Reaction).filter(Reaction.post_id == post_id).count()
    if likes_cnt == 0:
        likes_cnt = db.query(Like).filter(Like.post_id == post_id).count()

    return {
        "success": True,
        "post_id": post_id,
        "isLiked": bool(current_react is not None),
        "userReaction": current_react,
        "likesCount": likes_cnt
    }


def add_post_comment(db: Session, post_id: int, user_id: int, content: str) -> Dict[str, Any]:
    """Add a new comment on post/photo and notify post author."""
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        return {"success": False, "message": "Post not found"}

    new_comment = Comment(
        post_id=post_id,
        user_id=user_id,
        content=content.strip()
    )
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)

    # Dispatch notification to author if not self
    if post.user_id != user_id:
        commenter = db.query(User).filter(User.id == user_id).first()
        commenter_name = f"{commenter.first_name} {commenter.surname}".strip() if commenter else "Someone"
        preview = (content[:40] + "...") if len(content) > 40 else content
        notif = Notification(
            user_id=post.user_id,
            actor_id=user_id,
            post_id=post.id,
            entity_type="post",
            entity_id=post.id,
            type="comment",
            message=f"{commenter_name} commented on your photo/post: \"{preview}\""
        )
        db.add(notif)
        db.commit()

    commenter = db.query(User).filter(User.id == user_id).first()
    c_name = f"{commenter.first_name} {commenter.surname}".strip() if commenter else "User"
    c_pic = commenter.profile_pic if (commenter and commenter.profile_pic) else f"https://i.pravatar.cc/40?u={user_id}"

    total_comments = db.query(Comment).filter(Comment.post_id == post_id).count()

    return {
        "success": True,
        "post_id": post_id,
        "commentsCount": total_comments,
        "comment": {
            "id": new_comment.id,
            "user_id": user_id,
            "name": c_name,
            "profile": c_pic,
            "text": new_comment.content,
            "time": "Just now",
            "created_at": new_comment.created_at.isoformat() + "Z" if new_comment.created_at else "",
            "likes": 0
        }
    }


def share_post_item(db: Session, post_id: int, user_id: int) -> Dict[str, Any]:
    """Record share of photo/post and notify author."""
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        return {"success": False, "message": "Post not found"}

    share = Share(post_id=post_id, user_id=user_id)
    db.add(share)
    db.commit()

    if post.user_id != user_id:
        sharer = db.query(User).filter(User.id == user_id).first()
        sharer_name = f"{sharer.first_name} {sharer.surname}".strip() if sharer else "Someone"
        notif = Notification(
            user_id=post.user_id,
            actor_id=user_id,
            post_id=post.id,
            entity_type="post",
            entity_id=post.id,
            type="share",
            message=f"{sharer_name} shared your photo/post! 🚀"
        )
        db.add(notif)
        db.commit()

    shares_cnt = db.query(Share).filter(Share.post_id == post_id).count()

    return {
        "success": True,
        "post_id": post_id,
        "sharesCount": shares_cnt
    }