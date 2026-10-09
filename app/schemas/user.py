from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class RegisterRequest(BaseModel):
    first_name: str
    surname: str
    username: Optional[str] = None
    dob: Optional[str] = None
    mobile: Optional[str] = None
    gender: Optional[str] = None
    email: EmailStr
    password: str


class RegisterResponse(BaseModel):
    id: int
    first_name: str
    surname: str
    username: Optional[str] = None
    email: str
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None
    message: str

    class Config:
        from_attributes = True


class UserOut(BaseModel):
    id: int
    first_name: str
    surname: str
    username: Optional[str] = None
    email: str
    mobile: Optional[str] = None
    gender: Optional[str] = None
    dob: Optional[str] = None
    profile_pic: Optional[str] = None
    bio: Optional[str] = None
    is_active: bool
    is_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    surname: Optional[str] = None
    username: Optional[str] = None
    mobile: Optional[str] = None
    gender: Optional[str] = None
    dob: Optional[str] = None
    bio: Optional[str] = None
    profile_pic: Optional[str] = None


class UserProfileSummary(BaseModel):
    id: int
    first_name: str
    surname: str
    username: Optional[str] = None
    profile_pic: Optional[str] = None
    bio: Optional[str] = None
    is_verified: bool

    class Config:
        from_attributes = True