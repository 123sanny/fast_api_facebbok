from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime


# =====================================================================
# 1. PARTICIPANT SCHEMAS
# =====================================================================
class AudioParticipantUserOut(BaseModel):
    id: int
    name: str
    username: Optional[str] = None
    avatar: Optional[str] = None
    is_verified: bool = False
    stars: Optional[int] = 500


class AudioParticipantOut(BaseModel):
    id: int
    user_id: int
    role: str # host, co_host, speaker, listener
    is_muted: bool = True
    is_speaking: bool = False
    hand_raised: bool = False
    user: AudioParticipantUserOut


# =====================================================================
# 2. CHAT MESSAGE SCHEMAS
# =====================================================================
class AudioRoomMessageCreate(BaseModel):
    content: str


class AudioRoomMessageOut(BaseModel):
    id: int
    room_id: int
    user_id: int
    user_name: str
    user_avatar: str
    content: str
    created_at: datetime


# =====================================================================
# 3. ROOM SCHEMAS
# =====================================================================
class AudioRoomCreate(BaseModel):
    host_id: Optional[int] = None
    title: str
    topic: Optional[str] = "Live Discussion"
    category: Optional[str] = "Tech" # Tech, Music, Startups, Gaming, Career, Chill, News
    description: Optional[str] = None
    cover_image: Optional[str] = None
    privacy: Optional[str] = "public"
    spatial_audio_enabled: Optional[bool] = True
    ambient_music: Optional[str] = None


class AudioRoomOut(BaseModel):
    id: int
    host_id: int
    host_name: str
    host_avatar: str
    host_verified: bool = False
    title: str
    topic: Optional[str] = None
    category: str
    description: Optional[str] = None
    cover_image: Optional[str] = None
    status: str
    privacy: str
    is_recording: bool
    spatial_audio_enabled: bool
    ambient_music: Optional[str] = None
    listeners_count: int
    speakers_count: int
    speakers: List[AudioParticipantOut] = []
    listeners: List[AudioParticipantOut] = []
    is_host: bool = False
    is_speaker: bool = False
    my_hand_raised: bool = False
    my_is_muted: bool = True
    started_at: datetime
    created_at: datetime


# =====================================================================
# 4. ACTION & TIPPING SCHEMAS
# =====================================================================
class AudioRoomTipRequest(BaseModel):
    receiver_id: int
    stars: Optional[int] = 50


class AudioRoomReactionRequest(BaseModel):
    emoji: str # 🔥, 🚀, ❤️, 💎, 👏, ⭐


class AudioRoomActionResponse(BaseModel):
    success: bool
    message: str
    room: Optional[AudioRoomOut] = None
    participant: Optional[AudioParticipantOut] = None
    is_muted: Optional[bool] = None
    hand_raised: Optional[bool] = None
