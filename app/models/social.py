from sqlalchemy import Column, Integer, String, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
import datetime

class Friend(Base):
    __tablename__ = "friends"

    id          = Column(Integer, primary_key=True, index=True)
    sender_id   = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    receiver_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    status      = Column(String(20), default="pending")  # pending / accepted / rejected
    created_at  = Column(DateTime, default=datetime.datetime.utcnow)

    sender   = relationship("User", foreign_keys=[sender_id], back_populates="sent_requests")
    receiver = relationship("User", foreign_keys=[receiver_id], back_populates="received_requests")


class Message(Base):
    __tablename__ = "messages"

    id          = Column(Integer, primary_key=True, index=True)
    sender_id   = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    receiver_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    content     = Column(Text, nullable=False)
    is_read     = Column(Boolean, default=False)
    created_at  = Column(DateTime, default=datetime.datetime.utcnow)

    sender   = relationship("User", foreign_keys=[sender_id], back_populates="sent_messages")
    receiver = relationship("User", foreign_keys=[receiver_id], back_populates="received_messages")


class Notification(Base):
    __tablename__ = "notifications"

    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    from_user  = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    post_id    = Column(Integer, ForeignKey("posts.id", ondelete="CASCADE"), nullable=True)
    type       = Column(String(50), nullable=False)  # like / comment / friend_request / message
    is_read    = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", foreign_keys=[user_id], back_populates="notifications")


class BlockedUser(Base):
    __tablename__ = "blocked_users"

    id           = Column(Integer, primary_key=True, index=True)
    user_id      = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    blocked_user = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at   = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", foreign_keys=[user_id], back_populates="blocked")