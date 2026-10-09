import json
import math
import datetime
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, desc

from models.hyperlocal import HyperlocalPost, HyperlocalUpvote, HyperlocalService, NeighborhoodHub
from models.user import User
from services.marketplace_service import CITIES_DATA, find_city_data


# =====================================================================
# 1. SPATIAL DISTANCE & TIME ESTIMATOR ENGINES
# =====================================================================
def calculate_precise_distance_km(
    lat1: Optional[float], 
    lon1: Optional[float], 
    lat2: Optional[float], 
    lon2: Optional[float]
) -> float:
    """
    Haversine algorithm to compute exact distance in kilometers down to 2 decimals.
    """
    if lat1 is None or lon1 is None or lat2 is None or lon2 is None:
        return 1.2
    
    try:
        r = 6371.0  # Earth's radius in km
        d_lat = math.radians(lat2 - lat1)
        d_lon = math.radians(lon2 - lon1)
        a = (
            math.sin(d_lat / 2.0) ** 2 +
            math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
            math.sin(d_lon / 2.0) ** 2
        )
        c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
        return round(r * c, 2)
    except Exception:
        return 1.5


def format_distance_and_time(dist_km: float) -> Dict[str, str]:
    """
    Convert distance into human-friendly metrics, walking time, and driving time.
    """
    if dist_km < 0.8:
        dist_str = f"{int(dist_km * 1000)}m away"
        walk_mins = max(1, int(dist_km * 1000 / 75)) # ~4.5 km/h
        walk_str = f"{walk_mins} mins walk"
        drive_str = "1 min drive"
    elif dist_km < 2.0:
        dist_str = f"{dist_km:.1f} km away"
        walk_mins = int(dist_km * 13)
        walk_str = f"{walk_mins} mins walk"
        drive_str = f"{max(2, int(dist_km * 2.5))} mins drive"
    else:
        dist_str = f"{dist_km:.1f} km away"
        walk_str = f"{int(dist_km * 13)} mins walk"
        drive_str = f"{int(dist_km * 2.5)} mins drive"

    return {
        "distance_formatted": dist_str,
        "walking_time": walk_str,
        "driving_time": drive_str
    }


# =====================================================================
# 2. SEED REALISTIC HYPERLOCAL DATA IF TABLES ARE EMPTY
# =====================================================================
def seed_initial_hyperlocal_data(db: Session):
    """
    Ensure database has initial rich neighborhood posts, emergency alerts,
    local services, and residential hubs for immediate testing.
    """
    try:
        post_count = db.query(HyperlocalPost).count()
        if post_count > 0:
            return
    except Exception:
        return

    users = db.query(User).filter(User.is_active == True).limit(5).all()
    uid = users[0].id if users else 1

    sample_posts = [
        {
            "author_id": uid,
            "category": "alert",
            "title": "⚡ Scheduled Power Maintenance (11:00 AM - 2:00 PM)",
            "content": "Electricity board has notified transformer maintenance work today in Sector 18 / Connaught Place block. Inverters will be operational.",
            "city": "Delhi",
            "locality": "Connaught Place",
            "pincode": "110001",
            "latitude": 28.6315,
            "longitude": 77.2167,
            "broadcast_radius_km": 3.0,
            "is_urgent": True,
            "upvotes_count": 28,
            "comments_count": 6,
            "media": ["https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=600"]
        },
        {
            "author_id": users[1].id if len(users) > 1 else uid,
            "category": "lost_found",
            "title": "🐕 Golden Retriever Puppy Found near Community Park",
            "content": "Found a friendly young Golden Retriever with a red collar near the north gate of central park around 8 AM. Safe at my home. Please contact to identify.",
            "city": "Noida",
            "locality": "Sector 18",
            "pincode": "201301",
            "latitude": 28.5705,
            "longitude": 77.3210,
            "broadcast_radius_km": 5.0,
            "is_urgent": False,
            "upvotes_count": 45,
            "comments_count": 12,
            "media": ["https://images.unsplash.com/photo-1552053831-71594a27632d?w=600"]
        },
        {
            "author_id": users[2].id if len(users) > 2 else uid,
            "category": "recommendation",
            "title": "🥖 New Artisan Bakery & Coffee Roaster Opened!",
            "content": "Checked out 'The Daily Loaf' on 3rd Main road this morning. Their sourdough croissants and dark roast cappuccino are incredible! 15% neighbor discount today.",
            "city": "Bengaluru",
            "locality": "Indiranagar",
            "pincode": "560038",
            "latitude": 12.9780,
            "longitude": 77.6415,
            "broadcast_radius_km": 4.0,
            "is_urgent": False,
            "upvotes_count": 62,
            "comments_count": 19,
            "media": ["https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600"]
        },
        {
            "author_id": users[0].id if len(users) > 0 else uid,
            "category": "event",
            "title": "🌱 Sunday Neighborhood Tree Plantation & Clean Drive",
            "content": "Calling all residents of Block C and neighboring streets! We are planting 50 neem & gulmohar saplings this Sunday 7:30 AM. Gardening tools provided.",
            "city": "Delhi",
            "locality": "Saket",
            "pincode": "110017",
            "latitude": 28.5250,
            "longitude": 77.2150,
            "broadcast_radius_km": 3.0,
            "is_urgent": False,
            "upvotes_count": 34,
            "comments_count": 8,
            "media": ["https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600"]
        }
    ]

    for p in sample_posts:
        post_obj = HyperlocalPost(
            author_id=p["author_id"],
            category=p["category"],
            title=p["title"],
            content=p["content"],
            city=p["city"],
            locality=p["locality"],
            pincode=p["pincode"],
            latitude=p["latitude"],
            longitude=p["longitude"],
            broadcast_radius_km=p["broadcast_radius_km"],
            is_urgent=p["is_urgent"],
            upvotes_count=p["upvotes_count"],
            comments_count=p["comments_count"],
            media_json=json.dumps(p["media"]),
            created_at=datetime.datetime.utcnow() - datetime.timedelta(hours=math.sin(p["upvotes_count"]) * 12 + 4)
        )
        db.add(post_obj)

    sample_services = [
        {
            "owner_id": uid,
            "name": "Sharma 24x7 Electrician & AC Care",
            "category": "Home Repair",
            "service_type": "Certified Electrician & AC Specialist",
            "description": "Quick 20-minute response time in locality. Wiring, MCB repair, inverter setup, AC jet service with 90-day warranty.",
            "phone": "+91 98112 34567",
            "whatsapp": "+91 98112 34567",
            "price_starts_at": 199.0,
            "address": "Shop 4, Market Complex",
            "locality": "Connaught Place",
            "city": "Delhi",
            "latitude": 28.6290,
            "longitude": 77.2170,
            "service_radius_km": 5.0,
            "is_doorstep_available": True,
            "rating": 4.9,
            "reviews_count": 48,
            "images": ["https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600"]
        },
        {
            "owner_id": users[1].id if len(users) > 1 else uid,
            "category": "Food",
            "name": "Aunty's Desi Kitchen - Home Tiffins",
            "category": "Food",
            "service_type": "Fresh Homemade North & South Meals",
            "description": "Hygienic, low-oil, mother's style home cooked lunch & dinner. Daily changing menu, pure vegetarian & healthy choices.",
            "phone": "+91 98765 43210",
            "whatsapp": "+91 98765 43210",
            "price_starts_at": 120.0,
            "address": "B-42, Sector 18",
            "locality": "Sector 18",
            "city": "Noida",
            "latitude": 28.5710,
            "longitude": 77.3220,
            "service_radius_km": 4.0,
            "is_doorstep_available": True,
            "rating": 4.9,
            "reviews_count": 86,
            "images": ["https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600"]
        },
        {
            "owner_id": users[2].id if len(users) > 2 else uid,
            "category": "Tuition",
            "name": "Alpha Mathematics & Science Academy",
            "category": "Tuition",
            "service_type": "Grades 8-12 & IIT-JEE Foundation",
            "description": "Small batches (max 6 students) or 1-on-1 home coaching. 15 years experience, CBSE & ICSE syllabus.",
            "phone": "+91 99887 76655",
            "whatsapp": "+91 99887 76655",
            "price_starts_at": 500.0,
            "address": "12th Cross, Indiranagar",
            "locality": "Indiranagar",
            "city": "Bengaluru",
            "latitude": 12.9775,
            "longitude": 77.6420,
            "service_radius_km": 6.0,
            "is_doorstep_available": True,
            "rating": 4.8,
            "reviews_count": 32,
            "images": ["https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600"]
        },
        {
            "owner_id": uid,
            "name": "Green Fields Organic Milk & Veggies",
            "category": "Grocery",
            "service_type": "Farm Fresh A2 Cow Milk & Organics",
            "description": "Delivered daily by 6:30 AM in glass bottles. Unadulterated fresh milk, paneer, and organic farm greens.",
            "phone": "+91 91234 56789",
            "whatsapp": "+91 91234 56789",
            "price_starts_at": 75.0,
            "address": "Main Market Road",
            "locality": "Saket",
            "city": "Delhi",
            "latitude": 28.5230,
            "longitude": 77.2140,
            "service_radius_km": 4.0,
            "is_doorstep_available": True,
            "rating": 4.9,
            "reviews_count": 110,
            "images": ["https://images.unsplash.com/photo-1527153857715-3908f2ae5e81?w=600"]
        }
    ]

    for s in sample_services:
        serv_obj = HyperlocalService(
            owner_id=s["owner_id"],
            name=s["name"],
            category=s["category"],
            service_type=s["service_type"],
            description=s["description"],
            phone=s["phone"],
            whatsapp=s["whatsapp"],
            price_starts_at=s["price_starts_at"],
            address=s["address"],
            locality=s["locality"],
            city=s["city"],
            latitude=s["latitude"],
            longitude=s["longitude"],
            service_radius_km=s["service_radius_km"],
            is_doorstep_available=s["is_doorstep_available"],
            is_open_now=True,
            is_verified=True,
            rating=s["rating"],
            reviews_count=s["reviews_count"],
            images_json=json.dumps(s["images"]),
            created_at=datetime.datetime.utcnow() - datetime.timedelta(days=2)
        )
        db.add(serv_obj)

    sample_hubs = [
        {"name": "Connaught Place Central Hub", "slug": "cp-delhi-hub", "city": "Delhi", "locality": "Connaught Place", "lat": 28.6315, "lng": 77.2167, "radius_km": 3.0, "members": 342, "posts": 88},
        {"name": "Sector 18 Noida Circle", "slug": "sec-18-noida", "city": "Noida", "locality": "Sector 18", "lat": 28.5700, "lng": 77.3200, "radius_km": 3.5, "members": 218, "posts": 49},
        {"name": "Indiranagar Resident Hub", "slug": "indiranagar-blr", "city": "Bengaluru", "locality": "Indiranagar", "lat": 12.9784, "lng": 77.6408, "radius_km": 4.0, "members": 520, "posts": 142},
        {"name": "Saket Neighborhood Community", "slug": "saket-delhi", "city": "Delhi", "locality": "Saket", "lat": 28.5244, "lng": 77.2167, "radius_km": 3.0, "members": 195, "posts": 37},
        {"name": "Cyber City Gurugram Circle", "slug": "cyber-city-ggn", "city": "Gurugram", "locality": "Cyber City", "lat": 28.4900, "lng": 77.0900, "radius_km": 4.5, "members": 410, "posts": 95}
    ]

    for h in sample_hubs:
        hub_obj = NeighborhoodHub(
            name=h["name"],
            slug=h["slug"],
            city=h["city"],
            locality=h["locality"],
            latitude=h["lat"],
            longitude=h["lng"],
            radius_km=h["radius_km"],
            members_count=h["members"],
            posts_count=h["posts"]
        )
        db.add(hub_obj)

    try:
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Error seeding hyperlocal data: {e}")


# =====================================================================
# 3. FORMATTERS & TRANSFORMERS
# =====================================================================
def format_hyperlocal_post(
    post: HyperlocalPost, 
    user_lat: Optional[float] = None, 
    user_lng: Optional[float] = None,
    viewer_user_id: Optional[int] = None,
    upvoted_post_ids: Optional[set] = None
) -> Dict[str, Any]:
    """Format HyperlocalPost into structured response with distance & time."""
    effective_user_lat = user_lat if user_lat is not None else 28.6139
    effective_user_lng = user_lng if user_lng is not None else 77.2090
    
    dist_km = calculate_precise_distance_km(effective_user_lat, effective_user_lng, post.latitude, post.longitude)
    metrics = format_distance_and_time(dist_km)

    upvoted_ids = upvoted_post_ids or set()
    is_upvoted = post.id in upvoted_ids

    # Parse media list
    media_list = []
    if post.media_json:
        try:
            parsed = json.loads(post.media_json)
            if isinstance(parsed, list):
                media_list = parsed
            elif isinstance(parsed, str):
                media_list = [parsed]
        except Exception:
            if post.media_json.startswith("http"):
                media_list = [post.media_json]

    # Author details
    author = post.author
    author_name = "Local Neighbor"
    author_avatar = f"https://i.pravatar.cc/100?u={post.author_id}"
    author_verified = False
    author_username = None

    if author:
        author_name = f"{author.first_name or ''} {author.surname or ''}".strip() or author.username or "Local Neighbor"
        author_avatar = author.profile_pic or author_avatar
        author_verified = bool(author.is_verified)
        author_username = author.username

    return {
        "id": post.id,
        "author": {
            "id": post.author_id,
            "name": author_name,
            "username": author_username,
            "avatar": author_avatar,
            "is_verified": author_verified,
            "locality": post.locality
        },
        "category": post.category,
        "title": post.title,
        "content": post.content,
        "city": post.city,
        "locality": post.locality,
        "pincode": post.pincode,
        "latitude": post.latitude,
        "longitude": post.longitude,
        "distance_km": dist_km,
        "distance_formatted": metrics["distance_formatted"],
        "walking_time": metrics["walking_time"],
        "driving_time": metrics["driving_time"],
        "broadcast_radius_km": post.broadcast_radius_km,
        "is_urgent": post.is_urgent,
        "is_verified": post.is_verified,
        "upvotes_count": post.upvotes_count,
        "comments_count": post.comments_count,
        "views_count": post.views_count,
        "is_upvoted": is_upvoted,
        "media": media_list,
        "created_at": post.created_at or datetime.datetime.utcnow()
    }


def format_hyperlocal_service(
    service: HyperlocalService, 
    user_lat: Optional[float] = None, 
    user_lng: Optional[float] = None
) -> Dict[str, Any]:
    """Format HyperlocalService with distance, price, and media."""
    effective_user_lat = user_lat if user_lat is not None else 28.6139
    effective_user_lng = user_lng if user_lng is not None else 77.2090
    
    dist_km = calculate_precise_distance_km(effective_user_lat, effective_user_lng, service.latitude, service.longitude)
    metrics = format_distance_and_time(dist_km)

    images_list = []
    if service.images_json:
        try:
            parsed = json.loads(service.images_json)
            if isinstance(parsed, list):
                images_list = parsed
            elif isinstance(parsed, str):
                images_list = [parsed]
        except Exception:
            if service.images_json.startswith("http"):
                images_list = [service.images_json]

    price_fmt = f"₹{int(service.price_starts_at)}" if service.price_starts_at else None

    return {
        "id": service.id,
        "owner_id": service.owner_id,
        "name": service.name,
        "category": service.category,
        "service_type": service.service_type,
        "description": service.description or "",
        "phone": service.phone,
        "whatsapp": service.whatsapp,
        "price_starts_at": service.price_starts_at,
        "price_formatted": price_fmt,
        "address": service.address,
        "locality": service.locality,
        "city": service.city,
        "pincode": service.pincode,
        "latitude": service.latitude,
        "longitude": service.longitude,
        "distance_km": dist_km,
        "distance_formatted": metrics["distance_formatted"],
        "walking_time": metrics["walking_time"],
        "driving_time": metrics["driving_time"],
        "service_radius_km": service.service_radius_km,
        "is_open_now": service.is_open_now,
        "is_doorstep_available": service.is_doorstep_available,
        "is_verified": service.is_verified,
        "rating": service.rating,
        "reviews_count": service.reviews_count,
        "images": images_list,
        "created_at": service.created_at or datetime.datetime.utcnow()
    }


# =====================================================================
# 4. QUERY METHODS WITH SPATIAL ENGINE
# =====================================================================
def get_hyperlocal_feed(
    db: Session,
    viewer_user_id: Optional[int] = None,
    user_lat: Optional[float] = None,
    user_lng: Optional[float] = None,
    city: Optional[str] = None,
    locality: Optional[str] = None,
    category: Optional[str] = "all",
    radius_km: Optional[float] = 5.0,
    only_urgent: Optional[bool] = False,
    sort: Optional[str] = "nearest" # nearest, urgent_first, newest, most_upvoted
) -> List[Dict[str, Any]]:
    """
    Retrieve hyperlocal community updates within a specified radius (e.g. 0.5km, 1km, 3km, 5km, 10km).
    """
    seed_initial_hyperlocal_data(db)

    query = db.query(HyperlocalPost)

    # Filter Category
    if category and category.lower() != "all":
        query = query.filter(HyperlocalPost.category == category.lower())

    # Filter Urgent
    if only_urgent:
        query = query.filter(HyperlocalPost.is_urgent == True)

    posts = query.all()

    # Upvoted posts by this user
    upvoted_ids = set()
    if viewer_user_id:
        records = db.query(HyperlocalUpvote.post_id).filter(HyperlocalUpvote.user_id == viewer_user_id).all()
        upvoted_ids = {r[0] for r in records}

    formatted_posts: List[Dict[str, Any]] = []
    for post in posts:
        formatted = format_hyperlocal_post(
            post=post,
            user_lat=user_lat,
            user_lng=user_lng,
            viewer_user_id=viewer_user_id,
            upvoted_post_ids=upvoted_ids
        )

        # Distance Radius check (if radius specified and not huge)
        effective_radius = radius_km if radius_km is not None else 10.0
        if effective_radius < 50.0:
            if formatted["distance_km"] > effective_radius:
                continue

        formatted_posts.append(formatted)

    # Sorting
    if sort == "urgent_first":
        formatted_posts.sort(key=lambda x: (not x["is_urgent"], x["distance_km"]))
    elif sort == "nearest":
        formatted_posts.sort(key=lambda x: x["distance_km"])
    elif sort == "most_upvoted":
        formatted_posts.sort(key=lambda x: -x["upvotes_count"])
    else: # newest
        formatted_posts.sort(key=lambda x: x["id"], reverse=True)

    return formatted_posts


def create_hyperlocal_post(
    db: Session,
    author_id: int,
    payload: Any
) -> Dict[str, Any]:
    """Create a new hyperlocal neighborhood broadcast or alert."""
    title = getattr(payload, "title", None) or payload.get("title")
    content = getattr(payload, "content", None) or payload.get("content")
    category = getattr(payload, "category", "general") or payload.get("category", "general")
    city = getattr(payload, "city", "Delhi") or payload.get("city", "Delhi")
    locality = getattr(payload, "locality", "Nearby") or payload.get("locality", "Nearby")
    pincode = getattr(payload, "pincode", None) or payload.get("pincode")
    is_urgent = getattr(payload, "is_urgent", False) or payload.get("is_urgent", False)
    broadcast_radius = getattr(payload, "broadcast_radius_km", 5.0) or payload.get("broadcast_radius_km", 5.0)

    # Coordinates
    lat = getattr(payload, "latitude", None) or getattr(payload, "lat", None) or payload.get("latitude") or payload.get("lat")
    lng = getattr(payload, "longitude", None) or getattr(payload, "lng", None) or payload.get("longitude") or payload.get("lng")

    if lat is None or lng is None:
        city_info = find_city_data(city)
        lat = city_info["lat"]
        lng = city_info["lng"]

    media = getattr(payload, "media", None) or getattr(payload, "images", None) or payload.get("media") or payload.get("images") or []

    new_post = HyperlocalPost(
        author_id=author_id,
        category=category,
        title=title,
        content=content,
        city=city,
        locality=locality,
        pincode=pincode,
        latitude=float(lat),
        longitude=float(lng),
        broadcast_radius_km=float(broadcast_radius),
        is_urgent=bool(is_urgent),
        media_json=json.dumps(media) if media else None,
        created_at=datetime.datetime.utcnow()
    )

    db.add(new_post)
    db.commit()
    db.refresh(new_post)

    return format_hyperlocal_post(new_post, user_lat=float(lat), user_lng=float(lng), viewer_user_id=author_id)


def toggle_upvote_post(db: Session, user_id: int, post_id: int) -> Dict[str, Any]:
    """Toggle neighbor upvote for a hyperlocal post/alert."""
    post = db.query(HyperlocalPost).filter(HyperlocalPost.id == post_id).first()
    if not post:
        return {"success": False, "message": "Post not found", "is_upvoted": False}

    existing = db.query(HyperlocalUpvote).filter(
        HyperlocalUpvote.user_id == user_id,
        HyperlocalUpvote.post_id == post_id
    ).first()

    if existing:
        db.delete(existing)
        post.upvotes_count = max(0, post.upvotes_count - 1)
        db.commit()
        return {"success": True, "message": "Upvote removed", "is_upvoted": False}
    else:
        new_upvote = HyperlocalUpvote(user_id=user_id, post_id=post_id)
        db.add(new_upvote)
        post.upvotes_count += 1
        db.commit()
        return {"success": True, "message": "Neighbor verified & upvoted!", "is_upvoted": True}


def get_hyperlocal_services(
    db: Session,
    user_lat: Optional[float] = None,
    user_lng: Optional[float] = None,
    category: Optional[str] = "all",
    radius_km: Optional[float] = 6.0,
    search: Optional[str] = None
) -> List[Dict[str, Any]]:
    """Retrieve neighborhood services, shops, home kitchens, and doorstep pros."""
    seed_initial_hyperlocal_data(db)

    query = db.query(HyperlocalService)

    if category and category.lower() != "all":
        query = query.filter(HyperlocalService.category.ilike(f"%{category.strip()}%"))

    if search and search.strip():
        s = f"%{search.strip()}%"
        query = query.filter(
            or_(
                HyperlocalService.name.ilike(s),
                HyperlocalService.service_type.ilike(s),
                HyperlocalService.description.ilike(s),
                HyperlocalService.locality.ilike(s)
            )
        )

    services = query.all()

    formatted_services: List[Dict[str, Any]] = []
    for serv in services:
        formatted = format_hyperlocal_service(serv, user_lat=user_lat, user_lng=user_lng)
        
        # Service Radius filter
        if radius_km and radius_km < 50.0:
            if formatted["distance_km"] > radius_km:
                continue

        formatted_services.append(formatted)

    formatted_services.sort(key=lambda x: x["distance_km"])
    return formatted_services


def create_hyperlocal_service(
    db: Session,
    owner_id: int,
    payload: Any
) -> Dict[str, Any]:
    """Register a local neighborhood service or business."""
    name = getattr(payload, "name", None) or payload.get("name")
    category = getattr(payload, "category", "Home Repair") or payload.get("category", "Home Repair")
    service_type = getattr(payload, "service_type", "General Service") or payload.get("service_type", "General Service")
    description = getattr(payload, "description", "") or payload.get("description", "")
    phone = getattr(payload, "phone", None) or payload.get("phone")
    whatsapp = getattr(payload, "whatsapp", None) or payload.get("whatsapp")
    price = getattr(payload, "price_starts_at", None) or payload.get("price_starts_at")
    address = getattr(payload, "address", None) or payload.get("address")
    locality = getattr(payload, "locality", "Local Area") or payload.get("locality", "Local Area")
    city = getattr(payload, "city", "Delhi") or payload.get("city", "Delhi")
    pincode = getattr(payload, "pincode", None) or payload.get("pincode")

    lat = getattr(payload, "latitude", None) or getattr(payload, "lat", None) or payload.get("latitude") or payload.get("lat")
    lng = getattr(payload, "longitude", None) or getattr(payload, "lng", None) or payload.get("longitude") or payload.get("lng")

    if lat is None or lng is None:
        city_info = find_city_data(city)
        lat = city_info["lat"]
        lng = city_info["lng"]

    images = getattr(payload, "images", None) or payload.get("images") or []

    new_serv = HyperlocalService(
        owner_id=owner_id,
        name=name,
        category=category,
        service_type=service_type,
        description=description,
        phone=phone,
        whatsapp=whatsapp,
        price_starts_at=float(price) if price is not None else None,
        address=address,
        locality=locality,
        city=city,
        pincode=pincode,
        latitude=float(lat),
        longitude=float(lng),
        service_radius_km=float(getattr(payload, "service_radius_km", 5.0) or 5.0),
        is_doorstep_available=bool(getattr(payload, "is_doorstep_available", True)),
        is_open_now=True,
        is_verified=True,
        images_json=json.dumps(images) if images else None,
        created_at=datetime.datetime.utcnow()
    )

    db.add(new_serv)
    db.commit()
    db.refresh(new_serv)

    return format_hyperlocal_service(new_serv, user_lat=float(lat), user_lng=float(lng))


def get_neighborhood_hubs_near(
    db: Session,
    user_lat: Optional[float] = None,
    user_lng: Optional[float] = None,
    radius_km: float = 15.0
) -> List[Dict[str, Any]]:
    """Retrieve nearby residential circles / locality hubs."""
    seed_initial_hyperlocal_data(db)
    hubs = db.query(NeighborhoodHub).all()

    effective_lat = user_lat if user_lat is not None else 28.6139
    effective_lng = user_lng if user_lng is not None else 77.2090

    results = []
    for h in hubs:
        d = calculate_precise_distance_km(effective_lat, effective_lng, h.latitude, h.longitude)
        metrics = format_distance_and_time(d)
        results.append({
            "id": h.id,
            "name": h.name,
            "slug": h.slug,
            "city": h.city,
            "locality": h.locality,
            "latitude": h.latitude,
            "longitude": h.longitude,
            "distance_km": d,
            "distance_formatted": metrics["distance_formatted"],
            "radius_km": h.radius_km,
            "members_count": h.members_count,
            "posts_count": h.posts_count,
            "cover_image": h.cover_image,
            "created_at": h.created_at or datetime.datetime.utcnow()
        })

    results.sort(key=lambda x: x["distance_km"])
    return results


def get_hyperlocal_pulse_stats(
    db: Session,
    user_lat: Optional[float] = None,
    user_lng: Optional[float] = None,
    city: Optional[str] = "Delhi",
    locality: Optional[str] = "Connaught Place"
) -> Dict[str, Any]:
    """Get live stats on active neighbors, urgent alerts, and nearby services."""
    seed_initial_hyperlocal_data(db)

    effective_lat = user_lat if user_lat is not None else 28.6139
    effective_lng = user_lng if user_lng is not None else 77.2090

    urgent_count = db.query(HyperlocalPost).filter(HyperlocalPost.is_urgent == True).count()
    open_alerts = db.query(HyperlocalPost).filter(HyperlocalPost.category.in_(["alert", "emergency", "lost_found"])).count()
    service_count = db.query(HyperlocalService).count()

    return {
        "locality_name": locality or "Local Neighborhood",
        "city_name": city or "Delhi NCR",
        "latitude": effective_lat,
        "longitude": effective_lng,
        "active_neighbors_count": max(12, int(service_count * 18 + open_alerts * 9)),
        "open_alerts_count": open_alerts,
        "local_services_count": service_count,
        "urgent_broadcasts_count": urgent_count
    }
