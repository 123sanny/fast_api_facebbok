from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime


# =====================================================================
# 1. AUTHOR & USER SCHEMAS
# =====================================================================
class HyperlocalAuthorOut(BaseModel):
    id: int
    name: str
    username: Optional[str] = None
    avatar: Optional[str] = None
    is_verified: bool = False
    locality: Optional[str] = None


# =====================================================================
# 2. NEIGHBORHOOD POST & ALERT SCHEMAS
# =====================================================================
class HyperlocalPostCreate(BaseModel):
    author_id: Optional[int] = None
    category: Optional[str] = "general" # alert, emergency, lost_found, event, recommendation, general, service
    title: str
    content: str
    city: str
    locality: str
    pincode: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    broadcast_radius_km: Optional[float] = 5.0
    is_urgent: Optional[bool] = False
    media: Optional[List[str]] = None
    images: Optional[List[str]] = None


class HyperlocalPostOut(BaseModel):
    id: int
    author: HyperlocalAuthorOut
    category: str
    title: str
    content: str
    city: str
    locality: str
    pincode: Optional[str] = None
    latitude: float
    longitude: float
    distance_km: float
    distance_formatted: str
    walking_time: str
    driving_time: str
    broadcast_radius_km: float
    is_urgent: bool
    is_verified: bool
    upvotes_count: int
    comments_count: int
    views_count: int
    is_upvoted: bool = False
    media: List[str] = []
    created_at: datetime


# =====================================================================
# 3. LOCAL BUSINESS & HOME SERVICE SCHEMAS
# =====================================================================
class HyperlocalServiceCreate(BaseModel):
    owner_id: Optional[int] = None
    name: str
    category: str # Home Repair, Tuition, Grocery, Medical, Food, Fitness, Tech
    service_type: str # e.g. "Certified Electrician & AC Service"
    description: Optional[str] = None
    phone: Optional[str] = None
    whatsapp: Optional[str] = None
    price_starts_at: Optional[float] = None
    address: Optional[str] = None
    locality: str
    city: str
    pincode: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    service_radius_km: Optional[float] = 5.0
    is_doorstep_available: Optional[bool] = True
    images: Optional[List[str]] = None


class HyperlocalServiceOut(BaseModel):
    id: int
    owner_id: int
    name: str
    category: str
    service_type: str
    description: Optional[str] = None
    phone: Optional[str] = None
    whatsapp: Optional[str] = None
    price_starts_at: Optional[float] = None
    price_formatted: Optional[str] = None
    address: Optional[str] = None
    locality: str
    city: str
    pincode: Optional[str] = None
    latitude: float
    longitude: float
    distance_km: float
    distance_formatted: str
    walking_time: str
    driving_time: str
    service_radius_km: float
    is_open_now: bool
    is_doorstep_available: bool
    is_verified: bool
    rating: float
    reviews_count: int
    images: List[str] = []
    created_at: datetime


# =====================================================================
# 4. NEIGHBORHOOD HUB & STATS SCHEMAS
# =====================================================================
class NeighborhoodHubOut(BaseModel):
    id: int
    name: str
    slug: str
    city: str
    locality: str
    latitude: float
    longitude: float
    distance_km: float
    distance_formatted: str
    radius_km: float
    members_count: int
    posts_count: int
    cover_image: Optional[str] = None
    created_at: datetime


class HyperlocalStatsOut(BaseModel):
    locality_name: str
    city_name: str
    latitude: float
    longitude: float
    active_neighbors_count: int
    open_alerts_count: int
    local_services_count: int
    urgent_broadcasts_count: int


class HyperlocalActionResponse(BaseModel):
    success: bool
    message: str
    post: Optional[HyperlocalPostOut] = None
    service: Optional[HyperlocalServiceOut] = None
    is_upvoted: Optional[bool] = None
