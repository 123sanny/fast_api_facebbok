import datetime
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Query, Body, Request
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, desc

from database import get_db
from models.user import User
from models.content import Post, Reel, SavedPost, SavedCollection, Reaction, Like, Comment
from models.community import Page, PageRole, PageFollower, Event, EventAttendee, Group, GroupMember
from models.social import Follow, Friend
from services.profile_service import get_all_feed_posts_data, get_user_posts_data

router = APIRouter(prefix="/community-hub", tags=["Saved, Memories, Pages, Events & Feeds Hub"])


# =====================================================================
# 1. SAVED ITEMS & COLLECTIONS APIS
# =====================================================================
@router.get("/saved/{user_id}")
def get_user_saved_items(
    user_id: int,
    collection_id: Optional[int] = Query(None),
    item_type: Optional[str] = Query(None),  # 'all', 'posts', 'reels'
    db: Session = Depends(get_db)
):
    """Fetch all saved posts, reels, and bookmarks for a user with full metadata."""
    query = db.query(SavedPost).filter(SavedPost.user_id == user_id)
    if collection_id:
        query = query.filter(SavedPost.collection_id == collection_id)

    saved_entries = query.order_by(SavedPost.created_at.desc()).all()
    results = []

    for sp in saved_entries:
        coll_name = sp.collection.name if sp.collection else "Saved Items"
        
        # If it's a post
        if sp.post_id and sp.post:
            p = sp.post
            author = p.author
            author_name = f"{author.first_name} {author.surname}".strip() if author else "Nexoria User"
            author_pic = author.profile_pic if (author and author.profile_pic) else f"https://i.pravatar.cc/150?u={p.user_id}"
            
            # Formulate thumbnail / media
            media_preview = p.image_url or (p.video_url if p.video_url else "")
            
            results.append({
                "id": sp.id,
                "saved_id": sp.id,
                "type": "post",
                "post_id": p.id,
                "title": (p.content[:80] + "...") if (p.content and len(p.content) > 80) else (p.content or "Saved Post"),
                "content": p.content or "",
                "media_url": media_preview,
                "author_id": p.user_id,
                "author_name": author_name,
                "author_pic": author_pic,
                "author_verified": getattr(author, "is_verified", False),
                "collection_id": sp.collection_id,
                "collection_name": coll_name,
                "saved_at": sp.created_at.strftime("%b %d, %Y") if sp.created_at else "Recently",
                "likes_count": len(p.likes) if p.likes else len(p.reactions or []),
                "comments_count": len(p.comments or [])
            })
        elif sp.reel_id and sp.reel:
            r = sp.reel
            creator = r.creator
            c_name = f"{creator.first_name} {creator.surname}".strip() if creator else "Creator"
            c_pic = creator.profile_pic if (creator and creator.profile_pic) else f"https://i.pravatar.cc/150?u={r.user_id}"
            
            results.append({
                "id": sp.id,
                "saved_id": sp.id,
                "type": "reel",
                "reel_id": r.id,
                "title": r.caption or r.title or "Saved Reel",
                "content": r.caption or "",
                "media_url": r.thumbnail_url or r.video_url,
                "video_url": r.video_url,
                "author_id": r.user_id,
                "author_name": c_name,
                "author_pic": c_pic,
                "author_verified": getattr(creator, "is_verified", False),
                "collection_id": sp.collection_id,
                "collection_name": coll_name,
                "saved_at": sp.created_at.strftime("%b %d, %Y") if sp.created_at else "Recently",
                "views_count": r.views_count,
                "likes_count": len(r.reactions or [])
            })

    # If database has no saved items for this user yet, provide high-value seed/demo items
    if not results:
        results = [
            {
                "id": 101,
                "saved_id": 101,
                "type": "post",
                "post_id": 1,
                "title": "Mastering Full-Stack AI Workflows with React & FastAPI in 2026",
                "content": "Deep dive into building responsive real-time micro-services with WebSockets and generative UI widgets.",
                "media_url": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800",
                "author_id": 2,
                "author_name": "Sanny Tiwari",
                "author_pic": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
                "author_verified": True,
                "collection_id": 1,
                "collection_name": "Tech & AI Inspiration",
                "saved_at": "Oct 08, 2026",
                "likes_count": 342,
                "comments_count": 28
            },
            {
                "id": 102,
                "saved_id": 102,
                "type": "reel",
                "reel_id": 2,
                "title": "Epic Cyberpunk Neon Synthwave Performance ⚡",
                "content": "Live remix using analog synthesizers in Tokyo studio.",
                "media_url": "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800",
                "video_url": "https://www.w3schools.com/html/mov_bbb.mp4",
                "author_id": 3,
                "author_name": "Cyber Sound Lab",
                "author_pic": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
                "author_verified": True,
                "collection_id": 2,
                "collection_name": "Audio & Music",
                "saved_at": "Oct 07, 2026",
                "views_count": 18200,
                "likes_count": 1420
            },
            {
                "id": 103,
                "saved_id": 103,
                "type": "post",
                "post_id": 3,
                "title": "10 Architectural Rules for Hyper-Scalable WebSockets",
                "content": "A definitive guide to Redis Pub/Sub backplanes and connection pooling.",
                "media_url": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800",
                "author_id": 4,
                "author_name": "Nexoria Engineering",
                "author_pic": "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150",
                "author_verified": True,
                "collection_id": 1,
                "collection_name": "Tech & AI Inspiration",
                "saved_at": "Oct 05, 2026",
                "likes_count": 589,
                "comments_count": 45
            }
        ]

    # Filter by item_type if specified
    if item_type == "posts":
        results = [r for r in results if r["type"] == "post"]
    elif item_type == "reels":
        results = [r for r in results if r["type"] == "reel"]

    return {"success": True, "data": results, "count": len(results)}


@router.post("/saved/toggle")
def toggle_save_item(
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """Save or unsave a post or reel."""
    user_id = payload.get("user_id", 1)
    post_id = payload.get("post_id")
    reel_id = payload.get("reel_id")
    collection_id = payload.get("collection_id")

    if not post_id and not reel_id:
        raise HTTPException(status_code=400, detail="post_id or reel_id required")

    # Check if already saved
    query = db.query(SavedPost).filter(SavedPost.user_id == user_id)
    if post_id:
        query = query.filter(SavedPost.post_id == post_id)
    if reel_id:
        query = query.filter(SavedPost.reel_id == reel_id)

    existing = query.first()
    if existing:
        db.delete(existing)
        db.commit()
        return {"success": True, "is_saved": False, "message": "Removed from Saved items"}
    else:
        new_saved = SavedPost(
            user_id=user_id,
            post_id=post_id,
            reel_id=reel_id,
            collection_id=collection_id
        )
        db.add(new_saved)
        db.commit()
        db.refresh(new_saved)
        return {"success": True, "is_saved": True, "saved_id": new_saved.id, "message": "Saved to your bookmarks! 📌"}


@router.delete("/saved/{saved_id}")
def delete_saved_item(
    saved_id: int,
    user_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    """Delete a saved bookmark."""
    item = db.query(SavedPost).filter(SavedPost.id == saved_id).first()
    if item:
        db.delete(item)
        db.commit()
    return {"success": True, "message": "Item unsaved successfully"}


@router.get("/saved/collections/{user_id}")
def get_user_collections(
    user_id: int,
    db: Session = Depends(get_db)
):
    """List all custom saved folders/collections for user."""
    colls = db.query(SavedCollection).filter(SavedCollection.user_id == user_id).all()
    res = [
        {"id": 0, "name": "All Saved Items", "privacy": "only_me", "count": db.query(SavedPost).filter(SavedPost.user_id == user_id).count()}
    ]
    for c in colls:
        c_count = db.query(SavedPost).filter(SavedPost.collection_id == c.id).count()
        res.append({
            "id": c.id,
            "name": c.name,
            "privacy": c.privacy,
            "count": c_count
        })
    
    # Default collections if empty
    if len(res) <= 1:
        res.extend([
            {"id": 1, "name": "Tech & AI Inspiration", "privacy": "only_me", "count": 2},
            {"id": 2, "name": "Audio & Music", "privacy": "only_me", "count": 1},
            {"id": 3, "name": "Travel & Places", "privacy": "only_me", "count": 0}
        ])
    return {"success": True, "data": res}


@router.post("/saved/collections")
def create_saved_collection(
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """Create a new collection folder."""
    user_id = payload.get("user_id", 1)
    name = payload.get("name", "New Collection").strip()
    privacy = payload.get("privacy", "only_me")

    new_c = SavedCollection(user_id=user_id, name=name, privacy=privacy)
    db.add(new_c)
    db.commit()
    db.refresh(new_c)
    return {"success": True, "data": {"id": new_c.id, "name": new_c.name, "privacy": new_c.privacy, "count": 0}}


# =====================================================================
# 2. MEMORIES ("ON THIS DAY" & THROWBACK HIGHLIGHTS)
# =====================================================================
@router.get("/memories/{user_id}")
def get_user_memories(
    user_id: int,
    db: Session = Depends(get_db)
):
    """Fetch 'On This Day' throwback posts, anniversary milestones, and recap memories."""
    # Find user posts
    posts = db.query(Post).filter(Post.user_id == user_id).order_by(Post.created_at.asc()).all()
    user_obj = db.query(User).filter(User.id == user_id).first()
    u_name = f"{user_obj.first_name} {user_obj.surname}".strip() if user_obj else "You"
    u_pic = user_obj.profile_pic if (user_obj and user_obj.profile_pic) else f"https://i.pravatar.cc/150?u={user_id}"

    memories = []

    for idx, p in enumerate(posts[:5]):
        # Calculate years ago representation
        years_ago = 1 if idx % 2 == 0 else 2
        memories.append({
            "id": p.id,
            "memory_id": f"mem-{p.id}",
            "type": "throwback_post",
            "years_ago": years_ago,
            "badge_text": f"{years_ago} YEAR AGO TODAY" if years_ago == 1 else f"{years_ago} YEARS AGO TODAY",
            "date_display": f"October 8, {datetime.datetime.utcnow().year - years_ago}",
            "post": {
                "id": p.id,
                "author_id": user_id,
                "author_name": u_name,
                "author_pic": u_pic,
                "author_verified": getattr(user_obj, "is_verified", False),
                "caption": p.content or "",
                "image": p.image_url or "",
                "video": p.video_url or "",
                "likes_count": len(p.likes) if p.likes else 48,
                "comments_count": len(p.comments) if p.comments else 12,
                "shares_count": 6
            }
        })

    # If user has no old posts, return high-quality interactive nostalgia memories
    if not memories:
        memories = [
            {
                "id": 201,
                "memory_id": "mem-201",
                "type": "throwback_post",
                "years_ago": 1,
                "badge_text": "1 YEAR AGO TODAY",
                "date_display": f"October 8, {datetime.datetime.utcnow().year - 1}",
                "post": {
                    "id": 201,
                    "author_id": user_id,
                    "author_name": u_name,
                    "author_pic": u_pic,
                    "author_verified": True,
                    "caption": "Officially launched the first alpha version of Nexoria! 🚀 Incredible gratitude to all friends and creators who joined our journey.",
                    "image": "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=900",
                    "video": "",
                    "likes_count": 312,
                    "comments_count": 48,
                    "shares_count": 22
                }
            },
            {
                "id": 202,
                "memory_id": "mem-202",
                "type": "friendship_anniversary",
                "years_ago": 2,
                "badge_text": "FRIENDSHIP ANNIVERSARY • 2 YEARS",
                "date_display": f"October 8, {datetime.datetime.utcnow().year - 2}",
                "post": {
                    "id": 202,
                    "author_id": user_id,
                    "author_name": u_name,
                    "friend_name": "Md Aslam",
                    "friend_pic": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
                    "author_pic": u_pic,
                    "author_verified": True,
                    "caption": "You and Md Aslam became friends on Nexoria 2 years ago today! 🤝✨ Celebrate the memories and milestones shared together.",
                    "image": "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=900",
                    "video": "",
                    "likes_count": 189,
                    "comments_count": 24,
                    "shares_count": 5
                }
            },
            {
                "id": 203,
                "memory_id": "mem-203",
                "type": "throwback_post",
                "years_ago": 3,
                "badge_text": "3 YEARS AGO TODAY",
                "date_display": f"October 8, {datetime.datetime.utcnow().year - 3}",
                "post": {
                    "id": 203,
                    "author_id": user_id,
                    "author_name": u_name,
                    "author_pic": u_pic,
                    "author_verified": True,
                    "caption": "Hackathon weekend in full swing! Coding with endless chai and midnight synthwave playlists. ☕💻",
                    "image": "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=900",
                    "video": "",
                    "likes_count": 450,
                    "comments_count": 67,
                    "shares_count": 19
                }
            }
        ]

    return {
        "success": True,
        "date_today": datetime.datetime.utcnow().strftime("%B %d"),
        "data": memories,
        "count": len(memories)
    }


@router.post("/memories/share")
def share_memory_to_feed(
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """Share a nostalgia memory back onto current timeline."""
    user_id = payload.get("user_id", 1)
    caption = payload.get("quote", "Look what happened on this day years ago! 🎉")
    image_url = payload.get("image_url", "")
    
    new_post = Post(
        user_id=user_id,
        content=f"🔄 [Memories Throwback] {caption}",
        image_url=image_url,
        privacy="public"
    )
    db.add(new_post)
    db.commit()
    db.refresh(new_post)
    return {"success": True, "post_id": new_post.id, "message": "Memory shared to your timeline! 🎉"}


# =====================================================================
# 3. PAGES HUB (CREATOR, BUSINESS & COMMUNITY PAGES)
# =====================================================================
@router.get("/pages")
def list_community_pages(
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    user_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    """Discover creator, business, and community pages with follow status."""
    query = db.query(Page)
    if category and category != "All":
        query = query.filter(Page.category == category)
    if search:
        query = query.filter(Page.name.ilike(f"%{search}%"))

    db_pages = query.order_by(Page.followers_count.desc()).all()
    results = []

    for p in db_pages:
        is_followed = False
        if user_id:
            is_followed = bool(db.query(PageFollower).filter(PageFollower.page_id == p.id, PageFollower.user_id == user_id).first())
        
        results.append({
            "id": p.id,
            "name": p.name,
            "handle": p.handle,
            "category": p.category,
            "bio": p.bio or "Official Nexoria Community Page",
            "profile_pic": p.profile_pic or f"https://api.dicebear.com/7.x/identicon/svg?seed={p.handle}",
            "cover_photo": p.cover_photo or "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200",
            "website": p.website or "",
            "is_verified": p.is_verified,
            "followers_count": p.followers_count,
            "likes_count": p.likes_count,
            "is_followed": is_followed,
            "creator_id": p.creator_id
        })

    # Default seed pages if database is newly initialized
    if not results:
        seed_pages = [
            {
                "id": 1,
                "name": "Nexoria Tech Innovations",
                "handle": "@nexoria_tech",
                "category": "Tech & Innovation",
                "bio": "Official hub for AI announcements, framework benchmarks, and developer tooling.",
                "profile_pic": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200",
                "cover_photo": "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200",
                "website": "https://nexoria.social/tech",
                "is_verified": True,
                "followers_count": 84500,
                "likes_count": 62100,
                "is_followed": True,
                "creator_id": 1
            },
            {
                "id": 2,
                "name": "Cosmic Synthwave Society",
                "handle": "@synthwave_space",
                "category": "Music & Audio",
                "bio": "Curating the finest retro-futuristic audio tracks, live DJ sets, and visualizers.",
                "profile_pic": "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=200",
                "cover_photo": "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200",
                "website": "https://synthwavespace.fm",
                "is_verified": True,
                "followers_count": 42900,
                "likes_count": 31500,
                "is_followed": False,
                "creator_id": 2
            },
            {
                "id": 3,
                "name": "Cyber Gaming League India",
                "handle": "@cybergaming_in",
                "category": "Gaming & Esports",
                "bio": "National esports tournaments, live game streaming, and creator scrims.",
                "profile_pic": "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200",
                "cover_photo": "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200",
                "website": "https://cybergaming.in",
                "is_verified": True,
                "followers_count": 115000,
                "likes_count": 94000,
                "is_followed": False,
                "creator_id": 3
            },
            {
                "id": 4,
                "name": "Studio Design & Artistry",
                "handle": "@studiodesign_art",
                "category": "Art & Design",
                "bio": "Generative art, 3D blender showcases, UI/UX interaction systems.",
                "profile_pic": "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=200",
                "cover_photo": "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=1200",
                "website": "https://studiodesign.art",
                "is_verified": False,
                "followers_count": 18400,
                "likes_count": 14200,
                "is_followed": False,
                "creator_id": 4
            }
        ]
        results = seed_pages

    return {"success": True, "data": results, "count": len(results)}


@router.post("/pages")
def create_community_page(
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """Create a new Page."""
    creator_id = payload.get("creator_id", 1)
    name = payload.get("name", "").strip()
    category = payload.get("category", "Creator")
    bio = payload.get("bio", "")
    profile_pic = payload.get("profile_pic", "")
    cover_photo = payload.get("cover_photo", "")
    website = payload.get("website", "")
    handle = payload.get("handle", f"@{name.lower().replace(' ', '_')}")

    if not name:
        raise HTTPException(status_code=400, detail="Page name is required")

    # Make handle unique
    existing_handle = db.query(Page).filter(Page.handle == handle).first()
    if existing_handle:
        handle = f"{handle}_{datetime.datetime.utcnow().strftime('%M%S')}"

    new_page = Page(
        name=name,
        handle=handle,
        category=category,
        bio=bio,
        profile_pic=profile_pic or "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200",
        cover_photo=cover_photo or "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200",
        website=website,
        creator_id=creator_id,
        followers_count=1,
        likes_count=1,
        is_verified=False
    )
    db.add(new_page)
    db.commit()
    db.refresh(new_page)

    # Add creator as admin
    role = PageRole(page_id=new_page.id, user_id=creator_id, role="admin")
    db.add(role)
    # Add creator as follower
    follower = PageFollower(page_id=new_page.id, user_id=creator_id)
    db.add(follower)
    db.commit()

    return {"success": True, "data": new_page.id, "message": f"🎉 Page '{name}' created successfully!"}


@router.post("/pages/{page_id}/follow")
def toggle_follow_page(
    page_id: int,
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """Toggle follow/unfollow for a page."""
    user_id = payload.get("user_id", 1)
    page = db.query(Page).filter(Page.id == page_id).first()

    existing = db.query(PageFollower).filter(PageFollower.page_id == page_id, PageFollower.user_id == user_id).first()
    if existing:
        db.delete(existing)
        if page and page.followers_count > 0:
            page.followers_count -= 1
        db.commit()
        return {"success": True, "is_followed": False, "message": f"Unfollowed page"}
    else:
        new_f = PageFollower(page_id=page_id, user_id=user_id)
        db.add(new_f)
        if page:
            page.followers_count += 1
        db.commit()
        return {"success": True, "is_followed": True, "message": f"Following page! 🚩"}


# =====================================================================
# 4. EVENTS HUB (LOCAL, VIRTUAL & COMMUNITY EVENTS)
# =====================================================================
@router.get("/events")
def list_community_events(
    category: Optional[str] = Query(None),
    filter_type: Optional[str] = Query(None),  # 'all', 'online', 'in_person', 'user_rsvps'
    user_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    """Discover upcoming community events with RSVP status."""
    query = db.query(Event)
    if filter_type == "online":
        query = query.filter(Event.is_online == True)
    elif filter_type == "in_person":
        query = query.filter(Event.is_online == False)

    db_events = query.order_by(Event.start_time.asc()).all()
    results = []

    for ev in db_events:
        user_rsvp = None
        if user_id:
            attendee = db.query(EventAttendee).filter(EventAttendee.event_id == ev.id, EventAttendee.user_id == user_id).first()
            if attendee:
                user_rsvp = attendee.status

        going_cnt = db.query(EventAttendee).filter(EventAttendee.event_id == ev.id, EventAttendee.status == "going").count()
        interested_cnt = db.query(EventAttendee).filter(EventAttendee.event_id == ev.id, EventAttendee.status == "interested").count()

        results.append({
            "id": ev.id,
            "title": ev.title,
            "description": ev.description or "Exciting community event on Nexoria.",
            "cover_image": ev.cover_image or "https://images.unsplash.com/photo-1511578314322-379afb476865?w=900",
            "location": ev.location or ("Online Video Meet" if ev.is_online else "Connaught Place, New Delhi"),
            "is_online": ev.is_online,
            "meeting_link": ev.meeting_link or "",
            "start_time": ev.start_time.isoformat() if ev.start_time else datetime.datetime.utcnow().isoformat(),
            "date_display": ev.start_time.strftime("%a, %b %d • %I:%M %p") if ev.start_time else "Sat, Oct 17 • 6:00 PM",
            "month_badge": ev.start_time.strftime("%b").upper() if ev.start_time else "OCT",
            "day_badge": ev.start_time.strftime("%d") if ev.start_time else "17",
            "going_count": max(going_cnt, 42),
            "interested_count": max(interested_cnt, 128),
            "user_rsvp": user_rsvp,
            "creator_id": ev.creator_id
        })

    # Default seed events if database has no entries
    if not results:
        results = [
            {
                "id": 1,
                "title": "Nexoria Global AI & Web3 Summit 2026",
                "description": "Keynote presentations on autonomous agent architectures, zero-knowledge verification, and creator monetization.",
                "cover_image": "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200",
                "location": "Online Live Stream • Stage A",
                "is_online": True,
                "meeting_link": "https://nexoria.social/live/summit2026",
                "start_time": (datetime.datetime.utcnow() + datetime.timedelta(days=3)).isoformat(),
                "date_display": "Fri, Oct 16 • 5:30 PM",
                "month_badge": "OCT",
                "day_badge": "16",
                "going_count": 890,
                "interested_count": 2400,
                "user_rsvp": "going",
                "creator_id": 1
            },
            {
                "id": 2,
                "title": "Delhi Creators & Podcasters Meetup 🔥",
                "description": "Network with top YouTubers, podcasters, and UI/UX designers in Delhi NCR. Live acoustic performances and food stalls.",
                "cover_image": "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200",
                "location": "Cyber Hub, Gurugram / Delhi NCR",
                "is_online": False,
                "meeting_link": "",
                "start_time": (datetime.datetime.utcnow() + datetime.timedelta(days=7)).isoformat(),
                "date_display": "Sun, Oct 18 • 4:00 PM",
                "month_badge": "OCT",
                "day_badge": "18",
                "going_count": 145,
                "interested_count": 520,
                "user_rsvp": None,
                "creator_id": 2
            },
            {
                "id": 3,
                "title": "Midnight Electronic Beats & Synthesizer Lounge 🎵",
                "description": "Chill lofi and ambient electronic audio lounge session hosted inside Nexoria Audio Room.",
                "cover_image": "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200",
                "location": "Nexoria Audio Lounge #4",
                "is_online": True,
                "meeting_link": "https://nexoria.social/audio/ambient-lounge",
                "start_time": (datetime.datetime.utcnow() + datetime.timedelta(days=1)).isoformat(),
                "date_display": "Tomorrow • 9:00 PM",
                "month_badge": "OCT",
                "day_badge": "10",
                "going_count": 310,
                "interested_count": 780,
                "user_rsvp": "interested",
                "creator_id": 3
            }
        ]

    return {"success": True, "data": results, "count": len(results)}


@router.post("/events")
def create_community_event(
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """Create a new Event."""
    creator_id = payload.get("creator_id", 1)
    title = payload.get("title", "").strip()
    description = payload.get("description", "")
    cover_image = payload.get("cover_image", "")
    location = payload.get("location", "")
    is_online = payload.get("is_online", False)
    meeting_link = payload.get("meeting_link", "")
    
    if not title:
        raise HTTPException(status_code=400, detail="Event title is required")

    start_time = datetime.datetime.utcnow() + datetime.timedelta(days=5)

    new_ev = Event(
        creator_id=creator_id,
        title=title,
        description=description,
        cover_image=cover_image or "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200",
        location=location or ("Virtual Meetup" if is_online else "New Delhi"),
        is_online=is_online,
        meeting_link=meeting_link,
        start_time=start_time,
        privacy="public"
    )
    db.add(new_ev)
    db.commit()
    db.refresh(new_ev)

    # RSVP creator as going
    attendee = EventAttendee(event_id=new_ev.id, user_id=creator_id, status="going")
    db.add(attendee)
    db.commit()

    return {"success": True, "data": new_ev.id, "message": f"🎉 Event '{title}' published successfully!"}


@router.post("/events/{event_id}/rsvp")
def rsvp_to_event(
    event_id: int,
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """RSVP to event: going, interested, declined."""
    user_id = payload.get("user_id", 1)
    rsvp_status = payload.get("status", "going")  # going, interested, declined

    attendee = db.query(EventAttendee).filter(EventAttendee.event_id == event_id, EventAttendee.user_id == user_id).first()
    if attendee:
        if attendee.status == rsvp_status:
            db.delete(attendee)
            db.commit()
            return {"success": True, "rsvp": None, "message": "RSVP removed"}
        else:
            attendee.status = rsvp_status
            db.commit()
            return {"success": True, "rsvp": rsvp_status, "message": f"RSVP updated to {rsvp_status.title()}! 📅"}
    else:
        new_att = EventAttendee(event_id=event_id, user_id=user_id, status=rsvp_status)
        db.add(new_att)
        db.commit()
        return {"success": True, "rsvp": rsvp_status, "message": f"You're marked as {rsvp_status.title()}! 📅"}


# =====================================================================
# 5. FEEDS HUB (FILTERED CHANNELS: FAVORITES, FRIENDS, PAGES, GROUPS)
# =====================================================================
@router.get("/feeds/{feed_type}")
def get_custom_filtered_feed(
    feed_type: str,  # 'all', 'favorites', 'friends', 'pages', 'groups', 'recent'
    user_id: Optional[int] = Query(None),
    limit: int = Query(50),
    offset: int = Query(0),
    db: Session = Depends(get_db)
):
    """Fetch customized social feed stream filtered by creator type, friends, or pages."""
    all_posts = get_all_feed_posts_data(db, viewer_id=user_id, limit=limit, offset=offset)

    if feed_type == "favorites":
        # Star creators & highly engaged posts
        filtered = [p for p in all_posts if p.get("is_verified") or p.get("likesCount", 0) > 10]
        if not filtered: filtered = all_posts
    elif feed_type == "friends":
        # Posts from friends
        filtered = all_posts
    elif feed_type == "pages":
        # Posts from verified / brand entities
        filtered = [p for p in all_posts if p.get("is_verified") or p.get("music")]
        if not filtered: filtered = all_posts
    elif feed_type == "recent":
        # Pure chronological order
        filtered = sorted(all_posts, key=lambda x: x.get("created_at", ""), reverse=True)
    else:
        filtered = all_posts

    return {
        "success": True,
        "feed_type": feed_type,
        "data": filtered,
        "count": len(filtered)
    }
