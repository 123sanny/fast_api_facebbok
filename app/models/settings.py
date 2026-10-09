from sqlalchemy import Column, Integer, String, Boolean, Text, DateTime, ForeignKey
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
    
    # Media, Audio & Feature Preferences
    video_autoplay     = Column(String(30), default="wifi_cellular")  # wifi_cellular, wifi_only, never
    data_saver         = Column(Boolean, default=False)
    hd_uploads         = Column(Boolean, default=True)
    spatial_audio      = Column(Boolean, default=True)
    noise_cancellation = Column(Boolean, default=True)
    audio_quality      = Column(String(20), default="high")  # high, standard, low
    early_access       = Column(Boolean, default=True)
    camera_suggestions = Column(Boolean, default=True)
    whatsapp_linked    = Column(Boolean, default=False)
    whatsapp_number    = Column(String(30), nullable=True)
    
    updated_at    = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

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
    
    # Comprehensive Privacy & Audience Controls
    who_can_see_posts        = Column(String(50), default="Public")
    who_can_see_friends      = Column(String(50), default="public")
    who_can_send_requests    = Column(String(50), default="everyone")
    who_can_post_on_profile  = Column(String(50), default="friends")
    who_can_follow           = Column(String(50), default="public")
    review_tags              = Column(Boolean, default=True)
    reactions_hide_others    = Column(Boolean, default=False)
    reactions_hide_own       = Column(Boolean, default=False)
    sensitive_content        = Column(String(20), default="standard")
    search_engine_indexing   = Column(Boolean, default=True)
    privacy_checkup_completed = Column(Boolean, default=False)

    updated_at          = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

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
    updated_at          = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="notification_settings")


class SecuritySettings(Base):
    __tablename__ = "security_settings"

    id                         = Column(Integer, primary_key=True)
    user_id                    = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    two_factor_enabled         = Column(Boolean, default=False)
    two_factor_method          = Column(String(20), nullable=True)  # app, passkey, totp, sms
    totp_secret                = Column(String(255), nullable=True)
    sim_swap_protection_enabled = Column(Boolean, default=True)
    biometric_lock_enabled     = Column(Boolean, default=False)
    anti_phishing_code         = Column(String(50), nullable=True)
    recovery_guardian_enabled  = Column(Boolean, default=False)
    login_alerts               = Column(Boolean, default=True)
    max_active_sessions        = Column(Integer, default=5)
    updated_at                 = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="security")


class TimeManagement(Base):
    __tablename__ = "time_management"

    id            = Column(Integer, primary_key=True)
    user_id       = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    daily_limit   = Column(Integer, default=0)
    sleep_mode_on = Column(Boolean, default=False)
    sleep_start   = Column(String(10), nullable=True)
    sleep_end     = Column(String(10), nullable=True)
    updated_at    = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="time_mgmt")


class LanguageSettings(Base):
    __tablename__ = "language_settings"

    id             = Column(Integer, primary_key=True)
    user_id        = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    app_language   = Column(String(10), default="en")
    translation_on = Column(Boolean, default=False)
    updated_at     = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="language")


class AdPreferences(Base):
    __tablename__ = "ad_preferences"

    id               = Column(Integer, primary_key=True)
    user_id          = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    personalized_ads = Column(Boolean, default=True)
    updated_at       = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="ad_prefs")


class PaymentSettings(Base):
    __tablename__ = "payment_settings"

    id                = Column(Integer, primary_key=True)
    user_id           = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    default_card      = Column(String(100), nullable=True)
    paypal_linked     = Column(Boolean, default=False)
    billing_address   = Column(Text, nullable=True)
    stars_pin_set     = Column(Boolean, default=False)
    auto_reload_stars = Column(Boolean, default=False)
    currency          = Column(String(10), default="USD")
    updated_at        = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

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


class FamilySupervision(Base):
    __tablename__ = "family_supervisions"

    id                        = Column(Integer, primary_key=True)
    parent_user_id            = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    guardian_email            = Column(String(150), nullable=True)
    teen_name                 = Column(String(100), nullable=False)
    teen_user_id              = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    relationship_type         = Column(String(50), default="Teen / Child")
    daily_time_limit_minutes  = Column(Integer, default=120)
    quiet_hours_start         = Column(String(10), default="22:00")
    quiet_hours_end           = Column(String(10), default="07:00")
    block_sensitive_content   = Column(Boolean, default=True)
    require_purchase_approval = Column(Boolean, default=True)
    status                    = Column(String(20), default="active")  # active, pending, paused
    created_at                = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at                = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    parent = relationship("User", foreign_keys=[parent_user_id])
    teen   = relationship("User", foreign_keys=[teen_user_id])