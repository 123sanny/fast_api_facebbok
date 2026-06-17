from sqlalchemy import Column, Integer, String, Boolean, Text, DateTime, ForeignKey, Time
from sqlalchemy.orm import relationship
from database import Base
import datetime

class UserSettings(Base):
    __tablename__ = "user_settings"

    id            = Column(Integer, primary_key=True)
    user_id       = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    dark_mode     = Column(Boolean, default=False)
    language      = Column(String(20), default="en")
    privacy_level = Column(String(20), default="public")
    updated_at    = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="settings")


class PrivacySettings(Base):
    __tablename__ = "privacy_settings"

    id                  = Column(Integer, primary_key=True)
    user_id             = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    profile_visibility  = Column(String(20), default="public")
    friend_list_visible = Column(Boolean, default=True)
    posts_default       = Column(String(20), default="friends")
    profile_locked      = Column(Boolean, default=False)
    active_status       = Column(Boolean, default=True)
    updated_at          = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="privacy")


class NotificationSettings(Base):
    __tablename__ = "notification_settings"

    id                  = Column(Integer, primary_key=True)
    user_id             = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    likes               = Column(Boolean, default=True)
    comments            = Column(Boolean, default=True)
    friend_requests     = Column(Boolean, default=True)
    messages            = Column(Boolean, default=True)
    push_notifications  = Column(Boolean, default=True)
    email_notifications = Column(Boolean, default=False)
    updated_at          = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="notification_settings")


class SecuritySettings(Base):
    __tablename__ = "security_settings"

    id                 = Column(Integer, primary_key=True)
    user_id            = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    two_factor_enabled = Column(Boolean, default=False)
    two_factor_method  = Column(String(20), nullable=True)
    login_alerts       = Column(Boolean, default=True)
    updated_at         = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="security")


class TimeManagement(Base):
    __tablename__ = "time_management"

    id            = Column(Integer, primary_key=True)
    user_id       = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    daily_limit   = Column(Integer, default=0)
    sleep_mode_on = Column(Boolean, default=False)
    sleep_start   = Column(String(10), nullable=True)
    sleep_end     = Column(String(10), nullable=True)
    updated_at    = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="time_mgmt")


class LanguageSettings(Base):
    __tablename__ = "language_settings"

    id             = Column(Integer, primary_key=True)
    user_id        = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    app_language   = Column(String(10), default="en")
    translation_on = Column(Boolean, default=False)
    updated_at     = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="language")


class AdPreferences(Base):
    __tablename__ = "ad_preferences"

    id               = Column(Integer, primary_key=True)
    user_id          = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    personalized_ads = Column(Boolean, default=True)
    updated_at       = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="ad_prefs")


class PaymentSettings(Base):
    __tablename__ = "payment_settings"

    id              = Column(Integer, primary_key=True)
    user_id         = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    default_card    = Column(String(100), nullable=True)
    paypal_linked   = Column(Boolean, default=False)
    billing_address = Column(Text, nullable=True)
    updated_at      = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="payment")


class LoginActivity(Base):
    __tablename__ = "login_activity"

    id         = Column(Integer, primary_key=True)
    user_id    = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    device     = Column(String(100))
    browser    = Column(String(100))
    ip_address = Column(String(50))
    location   = Column(String(100))
    status     = Column(String(20), default="active")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="login_activities")