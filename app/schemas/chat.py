from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any, Union
from datetime import datetime


class MessageSendRequest(BaseModel):
    user_id: int = Field(..., description="Sender User ID")
    receiver_id: int = Field(..., description="Recipient User ID")
    conversation_id: Optional[int] = None
    content: str = Field(..., description="Message text content")
    attachment_url: Optional[str] = None
    attachment_type: Optional[str] = None  # image, video, file, audio
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


class MessageReactionRequest(BaseModel):
    user_id: int
    emoji: str


class MarkReadRequest(BaseModel):
    user_id: int
    other_user_id: int


class ChatContactOut(BaseModel):
    id: int
    user_id: int
    name: str
    first_name: str
    surname: str
    img: str
    email: Optional[str] = None
    role: Optional[str] = "Nexoria Member"
    online: bool = False
    last_message: Optional[str] = None
    last_message_time: Optional[str] = None
    unread_count: int = 0
    mutual_count: int = 0


class ChatMessageOut(BaseModel):
    id: int
    conversation_id: Optional[int] = None
    sender_id: int
    receiver_id: Optional[int] = None
    sender: str  # "me" or "them"
    sender_name: Optional[str] = None
    sender_img: Optional[str] = None
    content: str
    attachment_url: Optional[str] = None
    attachment_type: Optional[str] = None
    reply_to_message_id: Optional[int] = None
    is_read: bool = False
    is_ghost: bool = False
    expire_seconds: int = 0
    expire_at: Optional[Any] = None
    remaining_seconds: Optional[int] = None
    is_e2ee: bool = True
    is_voice: bool = False
    voice_url: Optional[str] = None
    voice_duration: Optional[int] = 0
    voice_transcription: Optional[str] = None
    stars_tipped: int = 0
    status: str = "sent"
    created_at: Any
    time: str
    reactions: List[Dict[str, Any]] = []


class ConversationThreadOut(BaseModel):
    id: int
    other_user_id: int
    other_user_name: str
    other_user_img: str
    online: bool = False
    last_message: str
    last_message_time: str
    last_message_sender_id: int
    unread_count: int = 0
    updated_at: Optional[Any] = None


class MissedCallLogRequest(BaseModel):
    caller_id: int
    receiver_id: int
    call_type: str = "audio"  # audio or video
