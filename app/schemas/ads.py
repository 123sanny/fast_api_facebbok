from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class AdOut(BaseModel):
    id: int
    brand_name: str
    logo_url: Optional[str] = None
    category: Optional[str] = "Technology"
    headline: str
    description: Optional[str] = None
    media_url: Optional[str] = None
    target_url: str
    call_to_action: Optional[str] = "Learn More"
    is_verified: bool = True
    is_active: bool = True
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AdActivityItemOut(BaseModel):
    id: int
    ad_id: int
    name: str
    brand_name: str
    logo: Optional[str] = None
    logo_url: Optional[str] = None
    category: Optional[str] = "Sponsored"
    time: str
    clickedAgo: str
    clicked_ago: str
    adText: str
    headline: str
    description: Optional[str] = None
    img: Optional[str] = None
    media_url: Optional[str] = None
    target_url: str
    call_to_action: Optional[str] = "Learn More"
    verified: bool = True
    is_verified: bool = True
    is_saved: bool = False
    is_hidden: bool = False
    clicked_at: Optional[datetime] = None


class AdActivityResponse(BaseModel):
    success: bool
    tab: str
    count: int
    saved_count: int
    data: List[AdActivityItemOut]


class AdCreateRequest(BaseModel):
    user_id: Optional[int] = None
    brand_name: str
    headline: str
    description: Optional[str] = None
    media_url: Optional[str] = None
    logo_url: Optional[str] = None
    target_url: Optional[str] = "https://nexoria.io"
    category: Optional[str] = "Technology"
    call_to_action: Optional[str] = "Learn More"


class AdInteractionRequest(BaseModel):
    ad_id: int
    user_id: Optional[int] = None
    interaction_type: Optional[str] = "clicked"


class AdHideRequest(BaseModel):
    ad_id: int
    user_id: Optional[int] = None
    reason: Optional[str] = "irrelevant"
    feedback_text: Optional[str] = None


class AdTopicOut(BaseModel):
    topic_name: str
    is_interested: bool


class AdPreferencesOut(BaseModel):
    personalized_ads: bool
    topics: List[AdTopicOut]


class AdPreferencesUpdate(BaseModel):
    personalized_ads: Optional[bool] = None
    topics: Optional[List[dict]] = None
