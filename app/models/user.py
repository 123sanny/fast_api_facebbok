from sqlalchemy import Column, Integer, String, Boolean, Text, DateTime
from sqlalchemy.orm import relationship
from database import Base
import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    first_name = Column(String(100), nullable=False)
    surname = Column(String(100), nullable=False)

    mobile = Column(String(20), nullable=True)
    gender = Column(String(20), nullable=True)
    dob = Column(String(20), nullable=True)

    email = Column(String(150), unique=True, nullable=False, index=True)
    password = Column(String(255), nullable=False)

    profile_pic = Column(Text, nullable=True)
    bio = Column(Text, nullable=True)

    is_active = Column(Boolean, default=True)

    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(
        DateTime,
        default=datetime.datetime.utcnow,
        onupdate=datetime.datetime.utcnow
    )

    # Relationships
    posts              = relationship("Post", back_populates="author", cascade="all, delete")
    stories            = relationship("Story", back_populates="author", cascade="all, delete")
    likes              = relationship("Like", back_populates="user", cascade="all, delete")
    comments           = relationship("Comment", back_populates="user", cascade="all, delete")
    shares             = relationship("Share", back_populates="user", cascade="all, delete")
    saved_posts        = relationship("SavedPost", back_populates="user", cascade="all, delete")
    sent_messages      = relationship("Message", foreign_keys="Message.sender_id", back_populates="sender")
    received_messages  = relationship("Message", foreign_keys="Message.receiver_id", back_populates="receiver")
    notifications      = relationship("Notification", foreign_keys="Notification.user_id", back_populates="user")
    sent_requests      = relationship("Friend", foreign_keys="Friend.sender_id", back_populates="sender")
    received_requests  = relationship("Friend", foreign_keys="Friend.receiver_id", back_populates="receiver")
    reports            = relationship("Report", back_populates="user", cascade="all, delete")
    login_activities   = relationship("LoginActivity", back_populates="user", cascade="all, delete")
    blocked            = relationship("BlockedUser", foreign_keys="BlockedUser.user_id", back_populates="user")

    # Settings (one-to-one)
    settings              = relationship("UserSettings", back_populates="user", uselist=False, cascade="all, delete")
    privacy               = relationship("PrivacySettings", back_populates="user", uselist=False, cascade="all, delete")
    notification_settings = relationship("NotificationSettings", back_populates="user", uselist=False, cascade="all, delete")
    security              = relationship("SecuritySettings", back_populates="user", uselist=False, cascade="all, delete")
    time_mgmt             = relationship("TimeManagement", back_populates="user", uselist=False, cascade="all, delete")
    language              = relationship("LanguageSettings", back_populates="user", uselist=False, cascade="all, delete")
    ad_prefs              = relationship("AdPreferences", back_populates="user", uselist=False, cascade="all, delete")
    payment               = relationship("PaymentSettings", back_populates="user", uselist=False, cascade="all, delete")
    sessions = relationship("UserSession", cascade="all, delete")
    sessions = relationship(
    "UserSession",
    back_populates="user"
)