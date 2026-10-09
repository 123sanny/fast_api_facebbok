from sqlalchemy import Column, Integer, String, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
import datetime


class GhostModeSettings(Base):
    """
    Ghost Protocol: Zero-Trace Anonymous Identity & Ephemeral Privacy Settings
    """
    __tablename__ = "ghost_settings"

    id                    = Column(Integer, primary_key=True, index=True)
    user_id               = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    is_ghost_enabled      = Column(Boolean, default=False)
    ghost_alias           = Column(String(100), default="QuantumGhost#109")
    ghost_avatar          = Column(Text, default="https://api.dicebear.com/7.x/bottts/svg?seed=QuantumGhost")
    default_timer_seconds = Column(Integer, default=15)  # 5s, 15s, 30s, 60s, 3600s
    burn_on_read          = Column(Boolean, default=True)
    mask_ip_address       = Column(Boolean, default=True)
    anti_screenshot_guard = Column(Boolean, default=True)
    zero_trace_storage    = Column(Boolean, default=True)
    updated_at            = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="ghost_settings")


class GhostSession(Base):
    """
    Active Ephemeral Ghost Mode Session Token for Zero-Trace Authentication
    """
    __tablename__ = "ghost_sessions"

    id           = Column(Integer, primary_key=True, index=True)
    user_id      = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    session_key  = Column(String(255), unique=True, nullable=False)
    alias_active = Column(String(100), nullable=False)
    is_active    = Column(Boolean, default=True)
    created_at   = Column(DateTime, default=datetime.datetime.utcnow)
    expires_at   = Column(DateTime, nullable=False)

    user = relationship("User")


class GhostBurnLog(Base):
    """
    Audit log of self-destructed ephemeral messages and posts (content is never saved)
    """
    __tablename__ = "ghost_burn_logs"

    id         = Column(Integer, primary_key=True, index=True)
    item_type  = Column(String(30), default="message")  # message, post, story
    item_id    = Column(Integer, nullable=True)
    sender_id  = Column(Integer, nullable=True)
    burned_at  = Column(DateTime, default=datetime.datetime.utcnow)
