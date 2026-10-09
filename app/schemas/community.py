from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


# ==================== GROUPS ====================
class GroupCreate(BaseModel):
    name: str
    description: Optional[str] = None
    cover_image: Optional[str] = None
    icon_image: Optional[str] = None
    privacy: Optional[str] = "public"  # public, private, hidden
    is_post_approval_required: Optional[bool] = False


class GroupUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    cover_image: Optional[str] = None
    icon_image: Optional[str] = None
    privacy: Optional[str] = None
    is_post_approval_required: Optional[bool] = None


class GroupRuleOut(BaseModel):
    id: int
    group_id: int
    title: str
    description: Optional[str] = None
    rule_order: int

    class Config:
        from_attributes = True


class GroupMemberOut(BaseModel):
    id: int
    group_id: int
    user_id: int
    role: str
    status: str
    joined_at: datetime

    class Config:
        from_attributes = True


class GroupOut(BaseModel):
    id: int
    name: str
    slug: str
    description: Optional[str] = None
    cover_image: Optional[str] = None
    icon_image: Optional[str] = None
    privacy: str
    is_post_approval_required: bool
    creator_id: int
    created_at: datetime
    members_count: Optional[int] = 0

    class Config:
        from_attributes = True


# ==================== PAGES ====================
class PageCreate(BaseModel):
    name: str
    handle: str
    category: Optional[str] = "Creator"
    bio: Optional[str] = None
    profile_pic: Optional[str] = None
    cover_photo: Optional[str] = None
    website: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None


class PageUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    bio: Optional[str] = None
    profile_pic: Optional[str] = None
    cover_photo: Optional[str] = None
    website: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None


class PageRoleOut(BaseModel):
    id: int
    page_id: int
    user_id: int
    role: str
    created_at: datetime

    class Config:
        from_attributes = True


class PageOut(BaseModel):
    id: int
    name: str
    handle: str
    category: str
    bio: Optional[str] = None
    profile_pic: Optional[str] = None
    cover_photo: Optional[str] = None
    website: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    is_verified: bool
    followers_count: int
    likes_count: int
    creator_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ==================== EVENTS ====================
class EventCreate(BaseModel):
    title: str
    description: Optional[str] = None
    cover_image: Optional[str] = None
    location: Optional[str] = None
    is_online: Optional[bool] = False
    meeting_link: Optional[str] = None
    start_time: datetime
    end_time: Optional[datetime] = None
    privacy: Optional[str] = "public"


class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    cover_image: Optional[str] = None
    location: Optional[str] = None
    is_online: Optional[bool] = None
    meeting_link: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    privacy: Optional[str] = None


class EventAttendeeOut(BaseModel):
    id: int
    event_id: int
    user_id: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class EventRsvpRequest(BaseModel):
    status: str  # going, interested, declined


class EventOut(BaseModel):
    id: int
    creator_id: int
    title: str
    description: Optional[str] = None
    cover_image: Optional[str] = None
    location: Optional[str] = None
    is_online: bool
    meeting_link: Optional[str] = None
    start_time: datetime
    end_time: Optional[datetime] = None
    privacy: str
    created_at: datetime
    attendees_count: Optional[int] = 0

    class Config:
        from_attributes = True


# ==================== MARKETPLACE ====================
class MarketplaceItemCreate(BaseModel):
    seller_id: Optional[int] = None
    category: str
    title: str
    description: Optional[str] = None
    price: float
    currency: Optional[str] = "INR"
    condition: Optional[str] = "Brand New"
    city: Optional[str] = "Delhi"
    locality: Optional[str] = "Local Area"
    location: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    images_json: Optional[str] = None
    img: Optional[str] = None
    images: Optional[List[str]] = None


class MarketplaceItemUpdate(BaseModel):
    category: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    condition: Optional[str] = None
    location: Optional[str] = None
    images_json: Optional[str] = None
    status: Optional[str] = None


class MarketplaceSellerInfo(BaseModel):
    id: int
    name: str
    username: Optional[str] = None
    avatar: Optional[str] = None
    verified: bool = False
    rating: Optional[float] = 4.9
    reviews_count: Optional[int] = 18


class MarketplaceListingOut(BaseModel):
    id: int
    seller_id: int
    name: str
    title: str
    price: str
    rawPrice: float
    oldPrice: Optional[str] = None
    category: str
    condition: str
    city: str
    locality: Optional[str] = None
    lat: float
    lng: float
    distanceKm: float
    locationFormatted: str
    desc: Optional[str] = None
    description: Optional[str] = None
    img: str
    images: List[str] = []
    status: str = "active"
    seller: str
    sellerImg: str
    verified: bool
    seller_info: Optional[MarketplaceSellerInfo] = None
    is_saved: bool = False
    created_at: datetime


class MarketplaceItemOut(BaseModel):
    id: int
    seller_id: int
    category: str
    title: str
    description: Optional[str] = None
    price: float
    currency: str
    condition: str
    location: str
    images_json: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class MarketplaceActionResponse(BaseModel):
    success: bool
    message: str
    item: Optional[MarketplaceListingOut] = None
    is_saved: Optional[bool] = None



# ==================== REPORTS ====================
class ReportCreate(BaseModel):
    target_type: str  # post, comment, user, group, page, message
    target_id: int
    reason: str  # spam, hate_speech, violence, copyright, harassment, fake_account
    details: Optional[str] = None


class ReportOut(BaseModel):
    id: int
    reporter_id: int
    target_type: str
    target_id: int
    reason: str
    details: Optional[str] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
