from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class FriendRequestCreate(BaseModel):
    receiver_id: int


class FriendActionResponse(BaseModel):
    success: bool
    message: str
    friendship_id: Optional[int] = None
    status: Optional[str] = None


class FriendRequestOut(BaseModel):
    id: int
    sender_id: int
    receiver_id: int
    name: str
    username: Optional[str] = None
    role: Optional[str] = None
    location: Optional[str] = None
    cover: Optional[str] = None
    img: Optional[str] = None
    mutual_count: int = 0
    mutual_avatars: List[str] = []
    verified: bool = False
    activity: Optional[str] = None
    distance: Optional[str] = None
    created_at: Optional[datetime] = None
    status: str = "pending"


class FriendSuggestionOut(BaseModel):
    id: int
    user_id: int
    name: str
    username: Optional[str] = None
    role: Optional[str] = None
    location: Optional[str] = None
    cover: Optional[str] = None
    img: Optional[str] = None
    mutual_count: int = 0
    mutual_avatars: List[str] = []
    verified: bool = False
    activity: Optional[str] = None
    distance: Optional[str] = None
    category: str = "nearby"  # nearby, alumni, tech, creative
    sent: bool = False


class FriendOut(BaseModel):
    id: int
    friend_user_id: int
    name: str
    username: Optional[str] = None
    role: Optional[str] = None
    location: Optional[str] = None
    cover: Optional[str] = None
    img: Optional[str] = None
    mutual_count: int = 0
    mutual_avatars: List[str] = []
    verified: bool = False
    online: bool = True
    starred: bool = False
    activity: Optional[str] = None
    distance: Optional[str] = None
    since: Optional[datetime] = None


class FriendStatsOut(BaseModel):
    total_friends: int = 0
    pending_requests: int = 0
    suggestions_count: int = 0
    online_count: int = 0
