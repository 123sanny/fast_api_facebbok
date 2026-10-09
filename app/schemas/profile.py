from datetime import datetime
from enum import Enum
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class PhotoTypeEnum(str, Enum):
    profile = "profile"
    cover = "cover"


class ProfilePhotoOut(BaseModel):
    id: int
    photo_url: str
    photo_type: PhotoTypeEnum
    caption: Optional[str] = None
    is_active: bool
    uploaded_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# =====================================================================
# 16 GRANULAR SECTION SCHEMAS
# =====================================================================

# 1. Avatar & Cover Photo
class PhotoUrlUpdate(BaseModel):
    photo_url: str

class CoverAdjustUpdate(BaseModel):
    offset_y: int = 0
    zoom: float = 1.0


# 2. Bio & Intro Quote
class BioUpdate(BaseModel):
    bio: Optional[str] = None
    intro_quote: Optional[str] = None


# 3. Pinned Details
class PinnedDetailsUpdate(BaseModel):
    pinned_details: List[str] = Field(default_factory=list)


# 4. Category & AI Creator Status
class CategoryUpdate(BaseModel):
    categories: List[str] = Field(default_factory=list)
    is_ai_creator: bool = True


# 5. Personal Details (City, Hometown, Relationship, DOB, Gender, Pronouns, Languages)
class PersonalDetailsUpdate(BaseModel):
    current_city: Optional[str] = None
    hometown: Optional[str] = None
    relationship_status: Optional[str] = None
    dob_month_day: Optional[str] = None
    dob_year: Optional[str] = None
    dob_privacy: Optional[str] = "Friends"
    gender: Optional[str] = None
    pronouns: Optional[str] = None
    languages: Optional[List[str]] = None


# 6. Family Members & Pets
class FamilyPetsUpdate(BaseModel):
    family_members: List[Dict[str, Any]] = Field(default_factory=list)
    pets: List[Dict[str, Any]] = Field(default_factory=list)


# 7. Work Experience
class WorkUpdate(BaseModel):
    work_workplace: Optional[str] = None
    work_job_title: Optional[str] = None
    work_privacy: Optional[str] = "Public"


# 8. Education Details
class EducationUpdate(BaseModel):
    education_school: Optional[str] = None
    education_college: Optional[str] = None
    education_degree: Optional[str] = None
    education_privacy: Optional[str] = "Public"


# 9. Hobbies
class HobbiesUpdate(BaseModel):
    hobbies: List[str] = Field(default_factory=list)


# 10. Interests (Music, TV, Films, Games, Sports)
class InterestsUpdate(BaseModel):
    music: List[str] = Field(default_factory=list)
    tv_programmes: List[str] = Field(default_factory=list)
    films: List[str] = Field(default_factory=list)
    games: List[str] = Field(default_factory=list)
    sports: List[str] = Field(default_factory=list)


# 11. Places Visited / Travel
class PlacesUpdate(BaseModel):
    visited_places: List[str] = Field(default_factory=list)
    places_privacy: Optional[str] = "Public"


# 12. Communities & Groups
class CommunitiesUpdate(BaseModel):
    communities: List[Dict[str, Any]] = Field(default_factory=list)


# 13. Offers, Deals & Promotions
class OffersUpdate(BaseModel):
    offers: List[Dict[str, Any]] = Field(default_factory=list)


# 14. Social Handles & Contact Info
class SocialsUpdate(BaseModel):
    social_handles: Dict[str, str] = Field(default_factory=dict)
    custom_links: List[str] = Field(default_factory=list)
    website_link: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None
    contact_privacy: Optional[str] = "Friends"


# 15. Creator Media Kit
class MediaKitUpdate(BaseModel):
    media_kit_title: Optional[str] = None
    media_kit_link: Optional[str] = None
    media_kit_privacy: Optional[str] = "Public"


# 16. Verified Trust Badges
class BadgesUpdate(BaseModel):
    badges: List[str] = Field(default_factory=list)
    aadhaar_verified: bool = True


# =====================================================================
# FULL PROFILE OUTPUT SCHEMA
# =====================================================================
class ProfileFullOut(BaseModel):
    id: int
    user_id: int
    first_name: Optional[str] = None
    surname: Optional[str] = None
    full_name: Optional[str] = None
    username: Optional[str] = None
    email: Optional[str] = None
    profile_pic: Optional[str] = None
    cover_photo: Optional[str] = None
    cover_photo_offset_y: int = 0
    cover_photo_zoom: float = 1.0

    bio: Optional[str] = None
    intro_quote: Optional[str] = None

    pinned_details: List[str] = Field(default_factory=list)
    categories: List[str] = Field(default_factory=list)
    is_ai_creator: bool = True

    current_city: Optional[str] = None
    hometown: Optional[str] = None
    relationship_status: Optional[str] = None
    dob_month_day: Optional[str] = None
    dob_year: Optional[str] = None
    dob_privacy: Optional[str] = "Friends"
    gender: Optional[str] = None
    pronouns: Optional[str] = None
    languages: List[str] = Field(default_factory=list)

    family_members: List[Dict[str, Any]] = Field(default_factory=list)
    pets: List[Dict[str, Any]] = Field(default_factory=list)

    work_workplace: Optional[str] = None
    work_job_title: Optional[str] = None
    work_privacy: Optional[str] = "Public"

    education_school: Optional[str] = None
    education_college: Optional[str] = None
    education_degree: Optional[str] = None
    education_privacy: Optional[str] = "Public"

    hobbies: List[str] = Field(default_factory=list)
    interests: Dict[str, List[str]] = Field(default_factory=dict)
    visited_places: List[str] = Field(default_factory=list)
    places_privacy: Optional[str] = "Public"

    communities: List[Dict[str, Any]] = Field(default_factory=list)
    offers: List[Dict[str, Any]] = Field(default_factory=list)

    social_handles: Dict[str, str] = Field(default_factory=dict)
    custom_links: List[str] = Field(default_factory=list)
    website_link: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None
    contact_privacy: Optional[str] = "Friends"

    media_kit_title: Optional[str] = None
    media_kit_link: Optional[str] = None
    media_kit_privacy: Optional[str] = "Public"

    badges: List[str] = Field(default_factory=list)
    aadhaar_verified: bool = True

    # Dynamic Social Graph, Verification & Content Metrics
    is_verified: bool = False
    is_verified_purchased: bool = False
    can_get_free_verified: bool = False
    friends_count: int = 0
    followers_count: int = 0
    following_count: int = 0
    posts_count: int = 0
    photos_count: int = 0
    reels_count: int = 0
    stars_count: int = 0
    truthguard_score: float = 99.8
    is_following: bool = False
    is_friend: bool = False
    friend_status: str = "none"

    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class VerificationPurchaseRequest(BaseModel):
    plan_tier: Optional[str] = "monthly"  # monthly (₹499), yearly (₹4,999)
    payment_method: Optional[str] = "upi"  # upi, stars, card, netbanking
    legal_name: Optional[str] = None
    category: Optional[str] = "Creator & Pioneer"
    upi_id: Optional[str] = None
    amount: Optional[float] = 499.0
    currency: Optional[str] = "INR"
    auto_renew: bool = True


# Aliases & Backward Compatibility
ProfileOut = ProfileFullOut

class ProfileUpdate(BaseModel):
    bio: Optional[str] = None
    intro_quote: Optional[str] = None
    work_workplace: Optional[str] = None
    work_job_title: Optional[str] = None
    education_school: Optional[str] = None
    education_college: Optional[str] = None
    current_city: Optional[str] = None
    hometown: Optional[str] = None
    relationship_status: Optional[str] = None
    website_link: Optional[str] = None
    pronouns: Optional[str] = None
    gender: Optional[str] = None

class SelectPhotoRequest(BaseModel):
    photo_id: int