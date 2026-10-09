import datetime
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import or_

from models.ads import Ad, UserAdActivity, UserAdTopic, UserBlockedAdvertiser
from models.settings import AdPreferences


def format_time_ago(dt: datetime.datetime) -> str:
    """Format datetime into human-friendly time elapsed string."""
    if not dt:
        return "Recently"
    now = datetime.datetime.utcnow()
    diff = now - dt

    if diff.days > 365:
        years = diff.days // 365
        return f"{years} year{'s' if years > 1 else ''} ago"
    elif diff.days >= 30:
        months = diff.days // 30
        return f"{months} month{'s' if months > 1 else ''} ago"
    elif diff.days > 0:
        return f"{diff.days} day{'s' if diff.days > 1 else ''} ago"
    elif diff.seconds >= 3600:
        hours = diff.seconds // 3600
        return f"{hours} hour{'s' if hours > 1 else ''} ago"
    elif diff.seconds >= 60:
        mins = diff.seconds // 60
        return f"{mins} minute{'s' if mins > 1 else ''} ago"
    return "Just now"


def format_ad_date(dt: datetime.datetime) -> str:
    """Format datetime into standard Ad date label like 'Ad · 21 May'."""
    if not dt:
        return "Ad · Recent"
    return f"Ad · {dt.strftime('%d %b')}"


def seed_ads_if_empty(db: Session, user_id: int = 1):
    """Seed initial advertiser campaigns and user interactions for realistic UX."""
    count = db.query(Ad).count()
    if count == 0:
        seed_data = [
            {
                "brand_name": "ChatGPT",
                "logo_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/ChatGPT_logo.svg/240px-ChatGPT_logo.svg.png",
                "category": "AI & Tech",
                "headline": "Ab dher saare tabs kholne ki zarurat nahi",
                "description": "ChatGPT Plus brings instant web browsing, DALL·E 3 generation & custom GPTs into your daily workflow.",
                "media_url": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
                "target_url": "https://chatgpt.com",
                "call_to_action": "Try Free",
                "is_verified": True
            },
            {
                "brand_name": "Amazon India",
                "logo_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/200px-Amazon_logo.svg.png",
                "category": "Shopping",
                "headline": "Great deals every day. Fast delivery on 10,000+ top products!",
                "description": "Prime members enjoy same-day delivery, Prime Video blockbusters, and exclusive lightning discounts.",
                "media_url": "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80",
                "target_url": "https://amazon.in",
                "call_to_action": "Shop Now",
                "is_verified": True
            },
            {
                "brand_name": "Spotify Premium",
                "logo_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Spotify_logo_without_text.svg/200px-Spotify_logo_without_text.svg.png",
                "category": "Music & Audio",
                "headline": "Music for everyone. Listen ad-free with unlimited skips.",
                "description": "Over 100 million songs, high-fidelity audio, and curated playlists for every mood.",
                "media_url": "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80",
                "target_url": "https://spotify.com",
                "call_to_action": "Get Premium",
                "is_verified": True
            },
            {
                "brand_name": "Nike India",
                "logo_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Logo_NIKE.svg/200px-Logo_NIKE.svg.png",
                "category": "Fashion & Sports",
                "headline": "Air Jordan 1 High OG — Legendary Style Re-engineered",
                "description": "Premium full-grain leather, encapsulated Air-Sole cushioning, and iconic court heritage.",
                "media_url": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80",
                "target_url": "https://nike.com",
                "call_to_action": "Explore Drops",
                "is_verified": True
            },
            {
                "brand_name": "Apple India",
                "logo_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/150px-Apple_logo_black.svg.png",
                "category": "Technology",
                "headline": "MacBook Pro with M3 Max — Monster Power for Creatives",
                "description": "Liquid Retina XDR display, up to 22 hours battery life, and pro hardware-accelerated ray tracing.",
                "media_url": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80",
                "target_url": "https://apple.com/in",
                "call_to_action": "Learn More",
                "is_verified": True
            },
            {
                "brand_name": "Flipkart",
                "logo_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Flipkart_logo.svg/200px-Flipkart_logo.svg.png",
                "category": "Shopping",
                "headline": "Big Billion Days sale is here! Up to 80% off on smartphones",
                "description": "Exciting exchange bonuses, no-cost EMIs, and early VIP access starting midnight.",
                "media_url": "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&auto=format&fit=crop&q=80",
                "target_url": "https://flipkart.com",
                "call_to_action": "Shop Deals",
                "is_verified": True
            },
            {
                "brand_name": "Swiggy Instamart",
                "logo_url": "https://upload.wikimedia.org/wikipedia/en/thumb/1/12/Swiggy_logo.svg/200px-Swiggy_logo.svg.png",
                "category": "Groceries & Food",
                "headline": "Fresh veggies & snacks delivered in 10 minutes!",
                "description": "Order midnight munchies, fresh farm fruits, dairy and bakery items directly to your doorstep.",
                "media_url": "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80",
                "target_url": "https://swiggy.com",
                "call_to_action": "Order Now",
                "is_verified": True
            }
        ]

        created_ads = []
        for ad_item in seed_data:
            ad = Ad(**ad_item)
            db.add(ad)
            created_ads.append(ad)
        db.commit()

        # Seed initial user interactions
        time_deltas = [
            datetime.timedelta(hours=14),
            datetime.timedelta(days=1),
            datetime.timedelta(days=3),
            datetime.timedelta(days=6),
            datetime.timedelta(hours=2),
            datetime.timedelta(days=8),
            datetime.timedelta(hours=5)
        ]

        for idx, ad in enumerate(created_ads):
            delta = time_deltas[idx % len(time_deltas)]
            clicked_dt = datetime.datetime.utcnow() - delta
            is_saved = (idx in (0, 2, 4))  # Save ChatGPT, Spotify, and Apple

            interaction = UserAdActivity(
                user_id=user_id,
                ad_id=ad.id,
                interaction_type="clicked",
                is_saved=is_saved,
                is_hidden=False,
                clicked_at=clicked_dt
            )
            db.add(interaction)
        db.commit()

    # Seed Default Ad Topics if empty
    topic_count = db.query(UserAdTopic).filter(UserAdTopic.user_id == user_id).count()
    if topic_count == 0:
        default_topics = [
            "Artificial Intelligence & Machine Learning",
            "Smartphones & Gadgets",
            "Online Shopping & Fashion",
            "Music Streaming & Podcasts",
            "Food & Grocery Delivery",
            "Travel, Hotels & Flights",
            "Gaming, PC Hardware & Consoles",
            "Financial Services & Crypto",
            "Fitness & Healthy Living"
        ]
        for t in default_topics:
            db.add(UserAdTopic(user_id=user_id, topic_name=t, is_interested=True))
        db.commit()


def get_user_ad_activity_service(
    db: Session,
    user_id: int,
    tab: str = "recent",
    search: str = ""
):
    """
    Retrieve user's dynamic ad activity (recent clicked/interacted ads and saved ads).
    """
    seed_ads_if_empty(db, user_id)

    # Base query for user's interactions joined with Ad
    query = (
        db.query(UserAdActivity, Ad)
        .join(Ad, UserAdActivity.ad_id == Ad.id)
        .filter(UserAdActivity.user_id == user_id)
        .filter(UserAdActivity.is_hidden == False)
    )

    # Exclude blocked advertisers
    blocked_brands = db.query(UserBlockedAdvertiser.brand_name).filter(UserBlockedAdvertiser.user_id == user_id).all()
    if blocked_brands:
        b_names = [b[0] for b in blocked_brands]
        query = query.filter(~Ad.brand_name.in_(b_names))

    if tab == "saved":
        query = query.filter(UserAdActivity.is_saved == True)

    if search and search.strip():
        term = f"%{search.strip().lower()}%"
        query = query.filter(
            or_(
                Ad.brand_name.ilike(term),
                Ad.headline.ilike(term),
                Ad.category.ilike(term),
                Ad.description.ilike(term)
            )
        )

    # Order by most recent clicked_at
    records = query.order_by(UserAdActivity.clicked_at.desc()).all()

    # Total saved count for badge
    total_saved = (
        db.query(UserAdActivity)
        .filter(UserAdActivity.user_id == user_id)
        .filter(UserAdActivity.is_saved == True)
        .filter(UserAdActivity.is_hidden == False)
        .count()
    )

    formatted_items = []
    for activity, ad in records:
        time_str = format_ad_date(activity.clicked_at)
        clicked_ago_str = format_time_ago(activity.clicked_at)

        formatted_items.append({
            "id": activity.id,
            "ad_id": ad.id,
            "name": ad.brand_name,
            "brand_name": ad.brand_name,
            "logo": ad.logo_url or "https://picsum.photos/50/50?random=1",
            "logo_url": ad.logo_url or "https://picsum.photos/50/50?random=1",
            "category": ad.category or "Sponsored",
            "time": time_str,
            "clickedAgo": clicked_ago_str,
            "clicked_ago": clicked_ago_str,
            "adText": ad.headline,
            "headline": ad.headline,
            "description": ad.description or "",
            "img": ad.media_url or "https://picsum.photos/600/400?random=10",
            "media_url": ad.media_url or "https://picsum.photos/600/400?random=10",
            "target_url": ad.target_url or "https://nexoria.io",
            "call_to_action": ad.call_to_action or "Learn More",
            "verified": bool(ad.is_verified),
            "is_verified": bool(ad.is_verified),
            "is_saved": bool(activity.is_saved),
            "is_hidden": bool(activity.is_hidden),
            "clicked_at": activity.clicked_at
        })

    return {
        "success": True,
        "tab": tab,
        "count": len(formatted_items),
        "saved_count": total_saved,
        "data": formatted_items
    }


def track_ad_interaction_service(
    db: Session,
    user_id: int,
    ad_id: int,
    interaction_type: str = "clicked"
):
    """
    Track user clicking or interacting with an ad.
    """
    activity = db.query(UserAdActivity).filter(
        UserAdActivity.user_id == user_id,
        UserAdActivity.ad_id == ad_id
    ).first()

    now = datetime.datetime.utcnow()

    if not activity:
        activity = UserAdActivity(
            user_id=user_id,
            ad_id=ad_id,
            interaction_type=interaction_type,
            is_saved=False,
            is_hidden=False,
            clicked_at=now
        )
        db.add(activity)
    else:
        activity.interaction_type = interaction_type
        activity.clicked_at = now
        activity.is_hidden = False

    db.commit()
    db.refresh(activity)

    return {
        "success": True,
        "message": "Ad interaction recorded",
        "ad_id": ad_id,
        "clicked_at": activity.clicked_at
    }


def toggle_save_ad_service(db: Session, user_id: int, ad_id: int):
    """
    Toggle saving/bookmarking an ad.
    """
    activity = db.query(UserAdActivity).filter(
        UserAdActivity.user_id == user_id,
        UserAdActivity.ad_id == ad_id
    ).first()

    if not activity:
        activity = UserAdActivity(
            user_id=user_id,
            ad_id=ad_id,
            interaction_type="saved",
            is_saved=True,
            is_hidden=False,
            clicked_at=datetime.datetime.utcnow()
        )
        db.add(activity)
    else:
        activity.is_saved = not activity.is_saved

    db.commit()
    db.refresh(activity)

    saved_count = db.query(UserAdActivity).filter(
        UserAdActivity.user_id == user_id,
        UserAdActivity.is_saved == True,
        UserAdActivity.is_hidden == False
    ).count()

    return {
        "success": True,
        "is_saved": activity.is_saved,
        "saved_count": saved_count,
        "message": "Ad saved to your saved collection" if activity.is_saved else "Ad removed from saved"
    }


def hide_or_report_ad_service(
    db: Session,
    user_id: int,
    ad_id: int,
    reason: str = "irrelevant",
    feedback_text: Optional[str] = None
):
    """
    Hide an ad or submit feedback on advertiser.
    """
    activity = db.query(UserAdActivity).filter(
        UserAdActivity.user_id == user_id,
        UserAdActivity.ad_id == ad_id
    ).first()

    if not activity:
        activity = UserAdActivity(
            user_id=user_id,
            ad_id=ad_id,
            interaction_type="hidden",
            is_saved=False,
            is_hidden=True,
            feedback_reason=reason,
            feedback_text=feedback_text,
            clicked_at=datetime.datetime.utcnow()
        )
        db.add(activity)
    else:
        activity.is_hidden = True
        activity.feedback_reason = reason
        activity.feedback_text = feedback_text

    db.commit()

    return {
        "success": True,
        "ad_id": ad_id,
        "message": "Ad hidden from your activity stream. Feedback recorded."
    }


def create_ad_campaign_service(
    db: Session,
    user_id: int,
    brand_name: str,
    headline: str,
    description: Optional[str] = None,
    media_url: Optional[str] = None,
    logo_url: Optional[str] = None,
    target_url: str = "https://nexoria.io",
    category: str = "Technology",
    call_to_action: str = "Learn More"
):
    """
    Create a new advertiser campaign and register interaction.
    """
    new_ad = Ad(
        brand_name=brand_name.strip(),
        headline=headline.strip(),
        description=description.strip() if description else None,
        media_url=media_url or "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop&q=80",
        logo_url=logo_url or f"https://api.dicebear.com/7.x/identicon/svg?seed={brand_name.strip()}",
        target_url=target_url.strip(),
        category=category or "Sponsored",
        call_to_action=call_to_action or "Learn More",
        is_verified=True,
        is_active=True
    )
    db.add(new_ad)
    db.commit()
    db.refresh(new_ad)

    # Record as interacted for current user
    activity = UserAdActivity(
        user_id=user_id,
        ad_id=new_ad.id,
        interaction_type="clicked",
        is_saved=False,
        is_hidden=False,
        clicked_at=datetime.datetime.utcnow()
    )
    db.add(activity)
    db.commit()

    return {
        "success": True,
        "message": "Sponsored ad campaign created successfully!",
        "ad": new_ad
    }


def get_ad_preferences_service(db: Session, user_id: int):
    """
    Get user's ad preferences & topics.
    """
    seed_ads_if_empty(db, user_id)

    pref = db.query(AdPreferences).filter(AdPreferences.user_id == user_id).first()
    personalized = pref.personalized_ads if pref else True

    topics = db.query(UserAdTopic).filter(UserAdTopic.user_id == user_id).all()
    topic_list = [{"topic_name": t.topic_name, "is_interested": t.is_interested} for t in topics]

    return {
        "personalized_ads": personalized,
        "topics": topic_list
    }


def update_ad_preferences_service(
    db: Session,
    user_id: int,
    personalized_ads: Optional[bool] = None,
    topics: Optional[List[dict]] = None
):
    """
    Update ad personalization setting and toggle topic interests.
    """
    pref = db.query(AdPreferences).filter(AdPreferences.user_id == user_id).first()
    if not pref:
        pref = AdPreferences(user_id=user_id, personalized_ads=True)
        db.add(pref)

    if personalized_ads is not None:
        pref.personalized_ads = personalized_ads

    if topics:
        for t_item in topics:
            t_name = t_item.get("topic_name")
            t_val = t_item.get("is_interested", True)
            existing = db.query(UserAdTopic).filter(
                UserAdTopic.user_id == user_id,
                UserAdTopic.topic_name == t_name
            ).first()
            if existing:
                existing.is_interested = t_val
            else:
                db.add(UserAdTopic(user_id=user_id, topic_name=t_name, is_interested=t_val))

    db.commit()
    db.refresh(pref)

    return get_ad_preferences_service(db, user_id)


# =====================================================================
# ADVERTISER & BRAND BLOCKING
# =====================================================================
def block_advertiser_service(
    db: Session,
    user_id: int,
    brand_name: str,
    ad_id: Optional[int] = None,
    reason: Optional[str] = "Blocked by user"
) -> Dict[str, Any]:
    """Block an advertiser so their ads no longer appear for this user."""
    clean_brand = brand_name.strip()
    existing = db.query(UserBlockedAdvertiser).filter(
        UserBlockedAdvertiser.user_id == user_id,
        UserBlockedAdvertiser.brand_name.ilike(clean_brand)
    ).first()

    if not existing:
        new_block = UserBlockedAdvertiser(
            user_id=user_id,
            brand_name=clean_brand,
            ad_id=ad_id,
            reason=reason
        )
        db.add(new_block)
        db.commit()

    return {
        "success": True,
        "message": f"All ads and sponsored content from '{clean_brand}' have been blocked.",
        "brand_name": clean_brand
    }


def unblock_advertiser_service(db: Session, user_id: int, brand_name: str) -> Dict[str, Any]:
    """Unblock an advertiser."""
    clean_brand = brand_name.strip()
    db.query(UserBlockedAdvertiser).filter(
        UserBlockedAdvertiser.user_id == user_id,
        UserBlockedAdvertiser.brand_name.ilike(clean_brand)
    ).delete()
    db.commit()

    return {
        "success": True,
        "message": f"Advertiser '{clean_brand}' has been unblocked.",
        "brand_name": clean_brand
    }


def get_blocked_advertisers_service(db: Session, user_id: int) -> List[Dict[str, Any]]:
    """List all blocked advertisers for user."""
    records = db.query(UserBlockedAdvertiser).filter(UserBlockedAdvertiser.user_id == user_id).all()
    return [
        {
            "id": r.id,
            "brand_name": r.brand_name,
            "reason": r.reason,
            "created_at": r.created_at.isoformat() if r.created_at else None
        }
        for r in records
    ]

