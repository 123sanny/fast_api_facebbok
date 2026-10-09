from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


# ==================== CONVERSATIONS ====================
class ConversationCreate(BaseModel):
    is_group: Optional[bool] = False
    title: Optional[str] = None
    icon_url: Optional[str] = None
    participant_ids: List[int] = []


class ConversationParticipantOut(BaseModel):
    id: int
    conversation_id: int
    user_id: int
    role: str
    custom_nickname: Optional[str] = None
    is_muted: bool
    joined_at: datetime

    class Config:
        from_attributes = True


class ConversationOut(BaseModel):
    id: int
    is_group: bool
    title: Optional[str] = None
    icon_url: Optional[str] = None
    group_admin_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    participants: Optional[List[ConversationParticipantOut]] = []

    class Config:
        from_attributes = True


# ==================== MESSAGES ====================
class MessageReactionCreate(BaseModel):
    message_id: int
    emoji: str  # ❤️, 👍, 😂, 😮, 😢, 😡, 🔥


class MessageReactionOut(BaseModel):
    id: int
    message_id: int
    user_id: int
    emoji: str
    created_at: datetime

    class Config:
        from_attributes = True


class MessageCreate(BaseModel):
    conversation_id: Optional[int] = None
    receiver_id: Optional[int] = None
    content: str
    attachment_url: Optional[str] = None
    attachment_type: Optional[str] = None
    reply_to_message_id: Optional[int] = None
    is_ghost: Optional[bool] = False
    expire_seconds: Optional[int] = 0
    is_e2ee: Optional[bool] = True
    key_fingerprint: Optional[str] = None
    is_voice: Optional[bool] = False
    voice_url: Optional[str] = None
    voice_duration: Optional[int] = 0
    voice_transcription: Optional[str] = None
    stars_tipped: Optional[int] = 0


class MessageOut(BaseModel):
    id: int
    conversation_id: Optional[int] = None
    sender_id: int
    receiver_id: Optional[int] = None
    content: str
    attachment_url: Optional[str] = None
    attachment_type: Optional[str] = None
    reply_to_message_id: Optional[int] = None
    is_read: bool
    is_ghost: bool
    expire_seconds: int
    expire_at: Optional[datetime] = None
    is_e2ee: bool
    key_fingerprint: Optional[str] = None
    is_voice: bool
    voice_url: Optional[str] = None
    voice_duration: int
    voice_transcription: Optional[str] = None
    stars_tipped: int
    status: str
    created_at: datetime
    reactions: Optional[List[MessageReactionOut]] = []

    class Config:
        from_attributes = True


# ==================== FRIENDS & FOLLOWS ====================
class FriendRequestCreate(BaseModel):
    receiver_id: int


class FriendActionRequest(BaseModel):
    request_id: int
    action: str  # accept / reject / cancel


class FriendOut(BaseModel):
    id: int
    sender_id: int
    receiver_id: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class FollowActionRequest(BaseModel):
    user_id: int
    action: str  # follow / unfollow


class FollowOut(BaseModel):
    id: int
    follower_id: int
    following_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class CloseFriendAddRequest(BaseModel):
    friend_id: int
    list_type: Optional[str] = "close_friends"  # close_friends, family, acquaintances, restricted


class CloseFriendOut(BaseModel):
    id: int
    user_id: int
    friend_id: int
    list_type: str
    created_at: datetime

    class Config:
        from_attributes = True


# ==================== NOTIFICATIONS ====================
class NotificationOut(BaseModel):
    id: int
    user_id: int
    actor_id: Optional[int] = None
    post_id: Optional[int] = None
    entity_type: Optional[str] = None
    entity_id: Optional[int] = None
    type: str
    message: Optional[str] = None
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ==================== BLOCKED USERS ====================
class BlockedUserCreate(BaseModel):
    blocked_user_id: int
    reason: Optional[str] = None


class BlockedUserOut(BaseModel):
    id: int
    user_id: int
    blocked_user: int
    reason: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
