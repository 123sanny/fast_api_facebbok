from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel


class PhotoTypeEnum(str, Enum):
    profile = "profile"
    cover = "cover"


class ProfileOut(BaseModel):
    id: int
    user_id: int
    profile_pic: Optional[str] = None
    cover_photo: Optional[str] = None

    class Config:
        from_attributes = True  # pydantic v2 (orm_mode = True agar v1 use kar rahe ho)


class ProfilePhotoOut(BaseModel):
    id: int
    photo_url: str
    photo_type: PhotoTypeEnum
    is_active: bool
    uploaded_at: datetime

    class Config:
        from_attributes = True


class SelectPhotoRequest(BaseModel):
    photo_id: int