import json
import math
import datetime
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc

from models.community import MarketplaceItem, SavedMarketplaceItem
from models.user import User

# =====================================================================
# INDIAN CITIES DIRECTORY & GEO-COORDINATES FOR DISTANCE ENGINE
# =====================================================================
CITIES_DATA: Dict[str, Dict[str, Any]] = {
    "delhi": {
        "name": "Delhi",
        "state": "NCR",
        "lat": 28.6139,
        "lng": 77.2090,
        "localities": ["Connaught Place", "Lajpat Nagar", "Karol Bagh", "Dwarka", "Saket", "Rohini", "Chandni Chowk", "Hauz Khas"]
    },
    "noida": {
        "name": "Noida",
        "state": "NCR",
        "lat": 28.5355,
        "lng": 77.3910,
        "localities": ["Sector 18", "Sector 62", "Sector 137", "Sector 76", "Noida Expressway", "Sector 50", "Sector 128"]
    },
    "gurugram": {
        "name": "Gurugram",
        "state": "NCR",
        "lat": 28.4595,
        "lng": 77.0266,
        "localities": ["Cyber City", "Golf Course Road", "Sohna Road", "MG Road", "Sector 56", "DLF Phase 5", "Cyber Hub"]
    },
    "mumbai": {
        "name": "Mumbai",
        "state": "Maharashtra",
        "lat": 19.0760,
        "lng": 72.8777,
        "localities": ["Bandra West", "Andheri East", "Juhu", "Colaba", "Powai", "Thane", "Navi Mumbai", "Dadar", "Worli"]
    },
    "bengaluru": {
        "name": "Bengaluru",
        "state": "Karnataka",
        "lat": 12.9716,
        "lng": 77.5946,
        "localities": ["Indiranagar", "Koramangala", "HSR Layout", "Whitefield", "MG Road", "Electronic City", "Bellandur"]
    },
    "hyderabad": {
        "name": "Hyderabad",
        "state": "Telangana",
        "lat": 17.3850,
        "lng": 78.4867,
        "localities": ["Hitec City", "Gachibowli", "Jubilee Hills", "Banjara Hills", "Madhapur", "Kondapur", "Kukatpally"]
    },
    "pune": {
        "name": "Pune",
        "state": "Maharashtra",
        "lat": 18.5204,
        "lng": 73.8567,
        "localities": ["Koregaon Park", "Viman Nagar", "Kothrud", "Baner", "Hinjewadi", "Aundh", "Wakad", "Magarpatta"]
    },
    "jaipur": {
        "name": "Jaipur",
        "state": "Rajasthan",
        "lat": 26.9124,
        "lng": 75.7873,
        "localities": ["Malviya Nagar", "Vaishali Nagar", "C-Scheme", "Mansarovar", "Raja Park", "Tonk Road"]
    },
    "lucknow": {
        "name": "Lucknow",
        "state": "Uttar Pradesh",
        "lat": 26.8467,
        "lng": 80.9462,
        "localities": ["Hazratganj", "Gomti Nagar", "Aliganj", "Indira Nagar", "Mahanagar", "Vibhuti Khand"]
    },
    "kolkata": {
        "name": "Kolkata",
        "state": "West Bengal",
        "lat": 22.5726,
        "lng": 88.3639,
        "localities": ["Park Street", "Salt Lake", "New Town", "Ballygunge", "Howrah", "Alipore", "Gariahat"]
    },
    "chandigarh": {
        "name": "Chandigarh",
        "state": "Punjab/Haryana",
        "lat": 30.7333,
        "lng": 76.7794,
        "localities": ["Sector 17", "Sector 35", "Sector 22", "Panchkula", "Mohali Phase 7", "Zirakpur"]
    },
    "patna": {
        "name": "Patna",
        "state": "Bihar",
        "lat": 25.5941,
        "lng": 85.1376,
        "localities": ["Boring Road", "Kankarbagh", "Bailey Road", "Patliputra Colony", "Fraser Road", "Danapur"]
    },
    "ahmedabad": {
        "name": "Ahmedabad",
        "state": "Gujarat",
        "lat": 23.0225,
        "lng": 72.5714,
        "localities": ["SG Highway", "Satellite", "Vastrapur", "Prahlad Nagar", "Navrangpura", "Bodakdev"]
    },
    "chennai": {
        "name": "Chennai",
        "state": "Tamil Nadu",
        "lat": 13.0827,
        "lng": 80.2707,
        "localities": ["T Nagar", "Anna Nagar", "Adyar", "Velachery", "OMR", "Nungambakkam"]
    }
}


def find_city_data(city_name: Optional[str]) -> Dict[str, Any]:
    """Match city name against known Indian cities database or fallback to Delhi."""
    if not city_name:
        return CITIES_DATA["delhi"]
    
    clean = city_name.strip().lower()
    for key, data in CITIES_DATA.items():
        if key in clean or clean in key or data["name"].lower() in clean:
            return data
    return CITIES_DATA["delhi"]


def calculate_distance_km(lat1: Optional[float], lon1: Optional[float], lat2: Optional[float], lon2: Optional[float]) -> float:
    """
    Haversine formula to calculate the great-circle distance between two points in km.
    """
    if lat1 is None or lon1 is None or lat2 is None or lon2 is None:
        return 4.2
    
    try:
        r = 6371.0  # Earth's radius in kilometers
        d_lat = math.radians(lat2 - lat1)
        d_lon = math.radians(lon2 - lon1)
        a = (
            math.sin(d_lat / 2.0) ** 2 +
            math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
            math.sin(d_lon / 2.0) ** 2
        )
        c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
        return round(r * c, 1)
    except Exception:
        return 5.0


def format_currency_inr(amount: float) -> str:
    """Format numeric price into Indian Rupee style e.g. ₹11,500"""
    try:
        val = int(round(amount))
        return f"₹{val:,}"
    except Exception:
        return f"₹{amount}"


# =====================================================================
# SEED INITIAL HIGH QUALITY DATA IF DATABASE TABLE IS EMPTY
# =====================================================================
def seed_initial_marketplace_items(db: Session):
    """
    Seed initial marketplace items if table is empty, linked to existing users.
    """
    try:
        count = db.query(MarketplaceItem).count()
        if count > 0:
            return
    except Exception:
        return

    # Find candidate sellers from users table
    users = db.query(User).filter(User.is_active == True).limit(5).all()
    default_seller_id = users[0].id if users else 1

    sample_items = [
        {
            "seller_id": users[0].id if len(users) > 0 else default_seller_id,
            "category": "Electronics",
            "title": "Apple iPhone 12 (128GB) Blue",
            "description": "100% battery health, original box and cable included. Zero scratches. Always used with screen protector and case.",
            "price": 11500.0,
            "condition": "Used - Like New",
            "city": "Delhi",
            "locality": "Connaught Place",
            "lat": 28.6280,
            "lng": 77.2180,
            "img": "https://images.unsplash.com/photo-1510557880182-3d4d3cba3f95?w=600"
        },
        {
            "seller_id": users[1].id if len(users) > 1 else default_seller_id,
            "category": "Electronics",
            "title": "Canon EOS 600D with 18-55mm Lens",
            "description": "Great condition DSLR camera, perfect for beginners and content creators. Includes battery, charger, bag, and 64GB SD card.",
            "price": 21000.0,
            "condition": "Used - Good",
            "city": "Noida",
            "locality": "Sector 18",
            "lat": 28.5700,
            "lng": 77.3200,
            "img": "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600"
        },
        {
            "seller_id": users[0].id if len(users) > 0 else default_seller_id,
            "category": "Electronics",
            "title": "Sony Extra Bass Bluetooth Speaker",
            "description": "Unopened sealed box. 16 hours battery backup, waterproof IP67 rating, deep punchy bass.",
            "price": 4200.0,
            "condition": "Brand New",
            "city": "Delhi",
            "locality": "Saket",
            "lat": 28.5244,
            "lng": 77.2167,
            "img": "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600"
        },
        {
            "seller_id": users[2].id if len(users) > 2 else default_seller_id,
            "category": "Vehicles",
            "title": "Hero Splendor Plus 2021 Model",
            "description": "First owner, only 14,000 km driven. All service records available from authorized service center, insurance valid.",
            "price": 45000.0,
            "condition": "Used - Good",
            "city": "Gurugram",
            "locality": "Cyber City",
            "lat": 28.4900,
            "lng": 77.0900,
            "img": "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600"
        },
        {
            "seller_id": users[1].id if len(users) > 1 else default_seller_id,
            "category": "Home Goods",
            "title": "LG 7kg Fully Automatic Washing Machine",
            "description": "Selling due to relocation. Works perfectly with smart inverter motor and 10-year warranty on motor.",
            "price": 8500.0,
            "condition": "Used - Good",
            "city": "Delhi",
            "locality": "Lajpat Nagar",
            "lat": 28.5700,
            "lng": 77.2400,
            "img": "https://images.unsplash.com/photo-1626806819282-2c1dc01a5e0c?w=600"
        },
        {
            "seller_id": users[3].id if len(users) > 3 else default_seller_id,
            "category": "Apparel",
            "title": "Vintage Casual Bomber Jacket (Size L)",
            "description": "Imported premium quality bomber jacket. Navy blue color, warm windproof inner fleece lining.",
            "price": 1250.0,
            "condition": "Brand New",
            "city": "Delhi",
            "locality": "Karol Bagh",
            "lat": 28.6500,
            "lng": 77.1900,
            "img": "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600"
        },
        {
            "seller_id": users[2].id if len(users) > 2 else default_seller_id,
            "category": "Entertainment",
            "title": "Sony PlayStation 5 Disc Edition + 2 Controllers",
            "description": "Complete box with Spider-Man 2 and God of War Ragnarok games included. Barely used.",
            "price": 34000.0,
            "condition": "Used - Like New",
            "city": "Noida",
            "locality": "Sector 62",
            "lat": 28.6200,
            "lng": 77.3600,
            "img": "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600"
        },
        {
            "seller_id": users[0].id if len(users) > 0 else default_seller_id,
            "category": "Home Goods",
            "title": "Solid Sheesham Wood 6-Seater Dining Table",
            "description": "Heavy teak finish Sheesham dining table with 6 cushioned chairs. Excellent structural condition.",
            "price": 18500.0,
            "condition": "Used - Good",
            "city": "Gurugram",
            "locality": "Golf Course Road",
            "lat": 28.4500,
            "lng": 77.1000,
            "img": "https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?w=600"
        },
        {
            "seller_id": users[1].id if len(users) > 1 else default_seller_id,
            "category": "Vehicles",
            "title": "Royal Enfield Classic 350 (Gunmetal Grey)",
            "description": "Single owner, dual-channel ABS, custom exhaust, brand new MRF tyres, mint showroom condition.",
            "price": 68000.0,
            "condition": "Used - Good",
            "city": "Mumbai",
            "locality": "Bandra West",
            "lat": 19.0596,
            "lng": 72.8295,
            "img": "https://images.unsplash.com/photo-1558981408-db0ecd8a1ee4?w=600"
        },
        {
            "seller_id": users[2].id if len(users) > 2 else default_seller_id,
            "category": "Electronics",
            "title": "Apple MacBook Air M2 (8GB / 256GB Midnight)",
            "description": "Battery cycle count 42, 98% battery health. With original invoice, MagSafe fast charger and sleeve.",
            "price": 52000.0,
            "condition": "Used - Like New",
            "city": "Bengaluru",
            "locality": "Indiranagar",
            "lat": 12.9784,
            "lng": 77.6408,
            "img": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600"
        }
    ]

    for item_data in sample_items:
        meta_dict = {
            "img": item_data["img"],
            "images": [item_data["img"]],
            "city": item_data["city"],
            "locality": item_data["locality"],
            "lat": item_data["lat"],
            "lng": item_data["lng"]
        }
        
        loc_str = f"{item_data['locality']}, {item_data['city']}"
        new_item = MarketplaceItem(
            seller_id=item_data["seller_id"],
            category=item_data["category"],
            title=item_data["title"],
            description=item_data["description"],
            price=item_data["price"],
            currency="INR",
            condition=item_data["condition"],
            location=loc_str,
            images_json=json.dumps(meta_dict),
            status="active",
            created_at=datetime.datetime.utcnow() - datetime.timedelta(hours=math.sin(item_data["price"]) * 10 + 5)
        )
        db.add(new_item)
    
    try:
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Error seeding marketplace items: {e}")


# =====================================================================
# FORMAT ITEM WITH REAL-TIME DISTANCE AND SELLER PROFILE
# =====================================================================
def format_marketplace_item(
    item: MarketplaceItem,
    user_lat: Optional[float] = None,
    user_lng: Optional[float] = None,
    saved_item_ids: Optional[set] = None
) -> Dict[str, Any]:
    """Format MarketplaceItem into complete JSON payload with distance, seller, and meta."""
    saved_ids = saved_item_ids or set()
    is_saved = item.id in saved_ids

    # Parse metadata from images_json or location
    img = "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600"
    images = []
    city_name = "Delhi"
    locality_name = ""
    item_lat = 28.6139
    item_lng = 77.2090

    if item.images_json:
        try:
            parsed = json.loads(item.images_json)
            if isinstance(parsed, dict):
                img = parsed.get("img") or parsed.get("images", [img])[0]
                images = parsed.get("images") or [img]
                city_name = parsed.get("city") or city_name
                locality_name = parsed.get("locality") or locality_name
                if parsed.get("lat") is not None:
                    item_lat = float(parsed["lat"])
                if parsed.get("lng") is not None:
                    item_lng = float(parsed["lng"])
            elif isinstance(parsed, list) and len(parsed) > 0:
                img = parsed[0]
                images = parsed
            elif isinstance(parsed, str):
                img = parsed
                images = [parsed]
        except Exception:
            if item.images_json.startswith("http"):
                img = item.images_json
                images = [img]

    # If city or coordinates not yet resolved, parse location string
    if item.location:
        parts = [p.strip() for p in item.location.split(",") if p.strip()]
        if len(parts) >= 2:
            locality_name = locality_name or parts[0]
            city_name = city_name or parts[1]
        elif len(parts) == 1:
            city_name = city_name or parts[0]
        
        # Match coordinates for city
        city_info = find_city_data(city_name)
        if item_lat == 28.6139 and item_lng == 77.2090 and city_name.lower() != "delhi":
            item_lat = city_info["lat"]
            item_lng = city_info["lng"]

    # Calculate distance from viewer's current coordinate
    effective_user_lat = user_lat if user_lat is not None else 28.6139
    effective_user_lng = user_lng if user_lng is not None else 77.2090
    dist_km = calculate_distance_km(effective_user_lat, effective_user_lng, item_lat, item_lng)

    # Seller Information
    seller_user = item.seller
    seller_name = "Nexoria Seller"
    seller_avatar = f"https://i.pravatar.cc/100?u={item.seller_id}"
    seller_verified = False
    seller_username = None

    if seller_user:
        first = seller_user.first_name or ""
        surname = seller_user.surname or ""
        seller_name = f"{first} {surname}".strip() or seller_user.username or "Nexoria Seller"
        seller_avatar = seller_user.profile_pic or seller_avatar
        seller_verified = bool(seller_user.is_verified)
        seller_username = seller_user.username

    loc_formatted = f"{locality_name or city_name} · {dist_km} km away"

    return {
        "id": item.id,
        "seller_id": item.seller_id,
        "name": item.title,
        "title": item.title,
        "price": format_currency_inr(item.price),
        "rawPrice": float(item.price),
        "oldPrice": None,
        "category": item.category or "Electronics",
        "condition": item.condition or "Brand New",
        "city": city_name,
        "locality": locality_name or city_name,
        "lat": item_lat,
        "lng": item_lng,
        "distanceKm": dist_km,
        "locationFormatted": loc_formatted,
        "desc": item.description or "",
        "description": item.description or "",
        "img": img,
        "images": images if images else [img],
        "status": item.status or "active",
        "seller": seller_name,
        "sellerImg": seller_avatar,
        "verified": seller_verified,
        "seller_info": {
            "id": item.seller_id,
            "name": seller_name,
            "username": seller_username,
            "avatar": seller_avatar,
            "verified": seller_verified,
            "rating": 4.9,
            "reviews_count": 18
        },
        "is_saved": is_saved,
        "created_at": item.created_at or datetime.datetime.utcnow()
    }


# =====================================================================
# QUERY MARKETPLACE ITEMS WITH DISTANCE SORTING AND FILTERS
# =====================================================================
def get_marketplace_items(
    db: Session,
    viewer_user_id: Optional[int] = None,
    category: Optional[str] = "All",
    search: Optional[str] = None,
    city: Optional[str] = None,
    user_lat: Optional[float] = None,
    user_lng: Optional[float] = None,
    radius: Optional[int] = 40,
    sort: Optional[str] = "nearest",
    verified_only: Optional[bool] = False
) -> List[Dict[str, Any]]:
    """
    Fetch all active marketplace items with real-time distance calculation,
    nearby location radius filtering, category filters, and sorting.
    """
    seed_initial_marketplace_items(db)

    # Base query for active listings
    query = db.query(MarketplaceItem).filter(MarketplaceItem.status == "active")

    # Filter Category
    if category and category.strip().lower() != "all":
        query = query.filter(MarketplaceItem.category.ilike(f"%{category.strip()}%"))

    # Filter Search query
    if search and search.strip():
        s = f"%{search.strip()}%"
        query = query.filter(
            or_(
                MarketplaceItem.title.ilike(s),
                MarketplaceItem.description.ilike(s),
                MarketplaceItem.location.ilike(s),
                MarketplaceItem.category.ilike(s)
            )
        )

    items = query.all()

    # Get viewer's saved items set
    saved_ids = set()
    if viewer_user_id:
        saved_records = db.query(SavedMarketplaceItem.item_id).filter(SavedMarketplaceItem.user_id == viewer_user_id).all()
        saved_ids = {r[0] for r in saved_records}

    # Format all listings and compute real distance
    formatted_items: List[Dict[str, Any]] = []
    for item in items:
        formatted = format_marketplace_item(
            item=item,
            user_lat=user_lat,
            user_lng=user_lng,
            saved_item_ids=saved_ids
        )

        # Distance Radius Filter (if radius is specified and not 100 / all)
        if radius and radius < 100:
            if formatted["distanceKm"] > float(radius):
                continue

        # Verified Seller Filter
        if verified_only and not formatted["verified"]:
            continue

        formatted_items.append(formatted)

    # Sort Listings
    if sort == "nearest":
        formatted_items.sort(key=lambda x: x["distanceKm"])
    elif sort == "low_high":
        formatted_items.sort(key=lambda x: x["rawPrice"])
    elif sort == "high_low":
        formatted_items.sort(key=lambda x: -x["rawPrice"])
    else:  # "recommended" or "newest"
        formatted_items.sort(key=lambda x: x["id"], reverse=True)

    return formatted_items


# =====================================================================
# CREATE NEW MARKETPLACE ITEM
# =====================================================================
def create_marketplace_item(
    db: Session,
    seller_id: int,
    payload: Any
) -> Dict[str, Any]:
    """
    Create a new listing in the database and make it immediately visible to all users.
    """
    # Extract payload attributes
    title = getattr(payload, "title", None) or payload.get("title")
    price = getattr(payload, "price", None) or payload.get("price")
    category = getattr(payload, "category", "Electronics") or payload.get("category", "Electronics")
    condition = getattr(payload, "condition", "Brand New") or payload.get("condition", "Brand New")
    city = getattr(payload, "city", None) or payload.get("city") or "Delhi"
    locality = getattr(payload, "locality", None) or payload.get("locality") or "Local Area"
    desc = getattr(payload, "description", None) or getattr(payload, "desc", None) or payload.get("description", "") or payload.get("desc", "")
    
    # Media image
    img = getattr(payload, "img", None) or getattr(payload, "image_url", None) or payload.get("img") or payload.get("image_url") or "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600"
    images = getattr(payload, "images", None) or payload.get("images") or [img]

    # Resolve coordinates
    city_info = find_city_data(city)
    lat = getattr(payload, "lat", None) or payload.get("lat")
    lng = getattr(payload, "lng", None) or payload.get("lng")

    if lat is None or lng is None:
        lat = city_info["lat"]
        lng = city_info["lng"]

    # Build location string and metadata JSON
    loc_str = f"{locality}, {city_info['name']}"
    meta = {
        "img": img,
        "images": images,
        "city": city_info["name"],
        "locality": locality,
        "lat": lat,
        "lng": lng
    }

    new_item = MarketplaceItem(
        seller_id=seller_id,
        category=category,
        title=title,
        description=desc,
        price=float(price),
        currency="INR",
        condition=condition,
        location=loc_str,
        images_json=json.dumps(meta),
        status="active",
        created_at=datetime.datetime.utcnow()
    )

    db.add(new_item)
    db.commit()
    db.refresh(new_item)

    return format_marketplace_item(new_item, user_lat=lat, user_lng=lng)


# =====================================================================
# TOGGLE SAVE / BOOKMARK ITEM
# =====================================================================
def toggle_save_marketplace_item(db: Session, user_id: int, item_id: int) -> Dict[str, Any]:
    """Toggle bookmark for a marketplace listing."""
    existing = db.query(SavedMarketplaceItem).filter(
        SavedMarketplaceItem.user_id == user_id,
        SavedMarketplaceItem.item_id == item_id
    ).first()

    if existing:
        db.delete(existing)
        db.commit()
        return {"success": True, "message": "Item removed from saved", "is_saved": False}
    else:
        new_save = SavedMarketplaceItem(user_id=user_id, item_id=item_id)
        db.add(new_save)
        db.commit()
        return {"success": True, "message": "Item saved successfully", "is_saved": True}


# =====================================================================
# GET SAVED ITEMS FOR USER
# =====================================================================
def get_user_saved_marketplace_items(
    db: Session,
    user_id: int,
    user_lat: Optional[float] = None,
    user_lng: Optional[float] = None
) -> List[Dict[str, Any]]:
    """Fetch all marketplace items saved by the specified user."""
    saved_records = db.query(SavedMarketplaceItem).filter(SavedMarketplaceItem.user_id == user_id).all()
    item_ids = [r.item_id for r in saved_records]
    
    if not item_ids:
        return []

    items = db.query(MarketplaceItem).filter(MarketplaceItem.id.in_(item_ids)).all()
    saved_set = set(item_ids)

    return [
        format_marketplace_item(item, user_lat=user_lat, user_lng=user_lng, saved_item_ids=saved_set)
        for item in items
    ]
