from sqlalchemy import Column, Integer, String, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
import datetime


class Friend(Base):
    """
    Mutual Friendships & Friend Requests
    """
    __tablename__ = "friends"

    id          = Column(Integer, primary_key=True, index=True)
    sender_id   = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    receiver_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    status      = Column(String(20), default="pending")  # pending, accepted, rejected, cancelled
    created_at  = Column(DateTime, default=datetime.datetime.utcnow)

    sender   = relationship("User", foreign_keys=[sender_id], back_populates="sent_requests")
    receiver = relationship("User", foreign_keys=[receiver_id], back_populates="received_requests")


class Follow(Base):
    """
    Public Profile & Creator Follower Graph
    """
    __tablename__ = "follows"

    id           = Column(Integer, primary_key=True, index=True)
    follower_id  = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    following_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at   = Column(DateTime, default=datetime.datetime.utcnow)

    follower  = relationship("User", foreign_keys=[follower_id], back_populates="following")
    following = relationship("User", foreign_keys=[following_id], back_populates="followers")


class BlockedUser(Base):
    """
    User Blocking Subsystem
    """
    __tablename__ = "blocked_users"

    id           = Column(Integer, primary_key=True, index=True)
    user_id      = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    blocked_user = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    reason       = Column(String(255), nullable=True)
    created_at   = Column(DateTime, default=datetime.datetime.utcnow)

    user         = relationship("User", foreign_keys=[user_id], back_populates="blocked")
    blocked_info = relationship("User", foreign_keys=[blocked_user])


class CloseFriend(Base):
    """
    Custom Lists: Close Friends, Family, Acquaintances, Restricted
    """
    __tablename__ = "close_friends"

    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    friend_id  = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    list_type  = Column(String(30), default="close_friends")  # close_friends, family, acquaintances, restricted
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user   = relationship("User", foreign_keys=[user_id], back_populates="close_friends")
    friend = relationship("User", foreign_keys=[friend_id])


class Conversation(Base):
    """
    1-on-1 and Group Chat Conversation Threads
    """
    __tablename__ = "conversations"

    id             = Column(Integer, primary_key=True, index=True)
    is_group       = Column(Boolean, default=False)
    title          = Column(String(100), nullable=True)  # Group name
    icon_url       = Column(Text, nullable=True)
    group_admin_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at     = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at     = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    group_admin  = relationship("User", foreign_keys=[group_admin_id])
    participants = relationship("ConversationParticipant", back_populates="conversation", cascade="all, delete-orphan")
    messages     = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")


class ConversationParticipant(Base):
    """
    Members and settings for each chat conversation
    """
    __tablename__ = "conversation_participants"

    id                   = Column(Integer, primary_key=True, index=True)
    conversation_id      = Column(Integer, ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id              = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    role                 = Column(String(20), default="member")  # admin, member
    custom_nickname      = Column(String(100), nullable=True)
    is_muted             = Column(Boolean, default=False)
    last_read_message_id = Column(Integer, nullable=True)
    joined_at            = Column(DateTime, default=datetime.datetime.utcnow)

    conversation = relationship("Conversation", back_populates="participants")
    user         = relationship("User")


class Message(Base):
    """
    E2EE, Ghost Mode & Voice Note Chat Messages
    """
    __tablename__ = "messages"

    id                  = Column(Integer, primary_key=True, index=True)
    conversation_id     = Column(Integer, ForeignKey("conversations.id", ondelete="CASCADE"), nullable=True, index=True)
    sender_id           = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    receiver_id         = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    content             = Column(Text, nullable=False)
    attachment_url      = Column(Text, nullable=True)
    attachment_type     = Column(String(20), nullable=True)  # image, video, file, audio
    reply_to_message_id = Column(Integer, ForeignKey("messages.id", ondelete="SET NULL"), nullable=True)
    is_read             = Column(Boolean, default=False)
    
    # Ghost Mode & Self-Destruct
    is_ghost            = Column(Boolean, default=False)
    expire_seconds      = Column(Integer, default=0)
    expire_at           = Column(DateTime, nullable=True)

    # End-to-End Encryption
    is_e2ee             = Column(Boolean, default=True)
    key_fingerprint     = Column(String(100), nullable=True)

    # Voice Note & AI Transcription
    is_voice            = Column(Boolean, default=False)
    voice_url           = Column(Text, nullable=True)
    voice_duration      = Column(Integer, default=0)
    voice_transcription = Column(Text, nullable=True)

    # In-Chat Star Tips
    stars_tipped        = Column(Integer, default=0)
    status              = Column(String(20), default="sent")  # sent, delivered, read, burned

    created_at          = Column(DateTime, default=datetime.datetime.utcnow)

    conversation = relationship("Conversation", back_populates="messages")
    sender       = relationship("User", foreign_keys=[sender_id], back_populates="sent_messages")
    receiver     = relationship("User", foreign_keys=[receiver_id], back_populates="received_messages")
    reply_to     = relationship("Message", remote_side=[id])
    reactions    = relationship("MessageReaction", back_populates="message", cascade="all, delete-orphan")


class MessageReaction(Base):
    """
    In-Chat Emoji Reactions on Messages
    """
    __tablename__ = "message_reactions"

    id         = Column(Integer, primary_key=True, index=True)
    message_id = Column(Integer, ForeignKey("messages.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id    = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    emoji      = Column(String(20), nullable=False)  # ❤️, 👍, 😂, 😮, 😢, 😡, 🔥
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    message = relationship("Message", back_populates="reactions")
    user    = relationship("User")


class Notification(Base):
    """
    Facebook-Style Rich Activity Notifications
    """
    __tablename__ = "notifications"

    id          = Column(Integer, primary_key=True, index=True)
    user_id     = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    actor_id    = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    post_id     = Column(Integer, ForeignKey("posts.id", ondelete="CASCADE"), nullable=True)
    entity_type = Column(String(50), nullable=True)  # post, comment, friend, group, page, order, security
    entity_id   = Column(Integer, nullable=True)
    type        = Column(String(50), nullable=False)  # like, comment, friend_request, message, tip, passkey
    message     = Column(String(255), nullable=True)
    is_read     = Column(Boolean, default=False)
    created_at  = Column(DateTime, default=datetime.datetime.utcnow)

    user  = relationship("User", foreign_keys=[user_id], back_populates="notifications")
    actor = relationship("User", foreign_keys=[actor_id])