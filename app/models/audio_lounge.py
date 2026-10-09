from sqlalchemy import Column, Integer, String, Boolean, Text, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from database import Base
import datetime


# =====================================================================
# 1. LIVE AUDIO ROOMS (PULSE AUDIO LOUNGE)
# =====================================================================
class AudioRoom(Base):
    """
    Live 3D Audio Spaces & Clubhouse/Spaces style Rooms.
    """
    __tablename__ = "audio_rooms"

    id                    = Column(Integer, primary_key=True, index=True)
    host_id               = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title                 = Column(String(200), nullable=False)
    topic                 = Column(String(200), nullable=True)
    category              = Column(String(60), default="Tech", index=True) # Tech, Music, Startups, Gaming, Career, Chill, News
    description           = Column(Text, nullable=True)
    cover_image           = Column(Text, nullable=True)
    
    status                = Column(String(20), default="live", index=True) # live, scheduled, ended
    privacy               = Column(String(20), default="public") # public, friends_only, invite_only
    is_recording          = Column(Boolean, default=False)
    spatial_audio_enabled = Column(Boolean, default=True)
    ambient_music         = Column(String(100), nullable=True) # lofi_chill, synthwave, rain, jazz
    
    listeners_count       = Column(Integer, default=1)
    speakers_count        = Column(Integer, default=1)
    
    started_at            = Column(DateTime, default=datetime.datetime.utcnow)
    ended_at              = Column(DateTime, nullable=True)
    created_at            = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    updated_at            = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    host                  = relationship("User", foreign_keys=[host_id])
    participants          = relationship("AudioRoomParticipant", back_populates="room", cascade="all, delete-orphan")
    messages              = relationship("AudioRoomMessage", back_populates="room", cascade="all, delete-orphan")


# =====================================================================
# 2. AUDIO ROOM PARTICIPANTS (SPEAKERS & AUDIENCE)
# =====================================================================
class AudioRoomParticipant(Base):
    """
    Tracks live speakers, co-hosts, listeners, hand raises, and mute states.
    """
    __tablename__ = "audio_room_participants"

    id           = Column(Integer, primary_key=True, index=True)
    room_id      = Column(Integer, ForeignKey("audio_rooms.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id      = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    role         = Column(String(30), default="listener") # host, co_host, speaker, listener
    is_muted     = Column(Boolean, default=True)
    is_speaking  = Column(Boolean, default=False)
    hand_raised  = Column(Boolean, default=False)
    joined_at    = Column(DateTime, default=datetime.datetime.utcnow)

    room         = relationship("AudioRoom", back_populates="participants")
    user         = relationship("User")


# =====================================================================
# 3. LIVE ROOM CHAT & MESSAGES
# =====================================================================
class AudioRoomMessage(Base):
    """
    Live synchronized text chat inside the audio room.
    """
    __tablename__ = "audio_room_messages"

    id         = Column(Integer, primary_key=True, index=True)
    room_id    = Column(Integer, ForeignKey("audio_rooms.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id    = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    content    = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)

    room       = relationship("AudioRoom", back_populates="messages")
    user       = relationship("User")
