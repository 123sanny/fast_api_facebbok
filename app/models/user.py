from sqlalchemy import Column, Integer, String, Boolean, Text, DateTime
from sqlalchemy.orm import relationship
from database import Base
import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    first_name = Column(String(100), nullable=False)
    surname    = Column(String(100), nullable=False)
    username   = Column(String(80), unique=True, nullable=True, index=True)

    mobile = Column(String(20), nullable=True)
    gender = Column(String(20), nullable=True)
    dob    = Column(String(20), nullable=True)

    email    = Column(String(150), unique=True, nullable=False, index=True)
    password = Column(String(255), nullable=False)

    profile_pic = Column(Text, nullable=True)
    bio         = Column(Text, nullable=True)

    is_active   = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    is_chat_restricted    = Column(Boolean, default=False)
    chat_restricted_until = Column(DateTime, nullable=True)
    failed_login_attempts = Column(Integer, default=0)
    locked_until          = Column(DateTime, nullable=True)

    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(
        DateTime,
        default=datetime.datetime.utcnow,
        onupdate=datetime.datetime.utcnow
    )

    # Content & Media Relationships
    posts             = relationship("Post", back_populates="author", cascade="all, delete-orphan")
    reels             = relationship("Reel", back_populates="creator", cascade="all, delete-orphan")
    stories           = relationship("Story", back_populates="author", cascade="all, delete-orphan")
    reactions         = relationship("Reaction", back_populates="user", cascade="all, delete-orphan")
    likes             = relationship("Like", back_populates="user", cascade="all, delete-orphan")
    comments          = relationship("Comment", back_populates="user", cascade="all, delete-orphan")
    shares            = relationship("Share", back_populates="user", cascade="all, delete-orphan")
    saved_posts       = relationship("SavedPost", back_populates="user", cascade="all, delete-orphan")
    saved_collections = relationship("SavedCollection", back_populates="user", cascade="all, delete-orphan")
    post_tips         = relationship("PostTip", back_populates="tipper", cascade="all, delete-orphan")

    # Social Graph Relationships
    sent_requests     = relationship("Friend", foreign_keys="Friend.sender_id", back_populates="sender", cascade="all, delete-orphan")
    received_requests = relationship("Friend", foreign_keys="Friend.receiver_id", back_populates="receiver", cascade="all, delete-orphan")
    following         = relationship("Follow", foreign_keys="Follow.follower_id", back_populates="follower", cascade="all, delete-orphan")
    followers         = relationship("Follow", foreign_keys="Follow.following_id", back_populates="following", cascade="all, delete-orphan")
    blocked           = relationship("BlockedUser", foreign_keys="BlockedUser.user_id", back_populates="user", cascade="all, delete-orphan")
    close_friends     = relationship("CloseFriend", foreign_keys="CloseFriend.user_id", back_populates="user", cascade="all, delete-orphan")

    # Messenger & Notifications Relationships
    sent_messages     = relationship("Message", foreign_keys="Message.sender_id", back_populates="sender")
    received_messages = relationship("Message", foreign_keys="Message.receiver_id", back_populates="receiver")
    notifications     = relationship("Notification", foreign_keys="Notification.user_id", back_populates="user", cascade="all, delete-orphan")
    sessions          = relationship("UserSession", back_populates="user", cascade="all, delete-orphan")

    # Communities & Ecosystem
    group_memberships    = relationship("GroupMember", back_populates="user", cascade="all, delete-orphan")
    marketplace_listings = relationship("MarketplaceItem", foreign_keys="MarketplaceItem.seller_id", back_populates="seller", cascade="all, delete-orphan")
    reports              = relationship("Report", foreign_keys="Report.reporter_id", back_populates="reporter", cascade="all, delete-orphan")
    login_activities     = relationship("LoginActivity", back_populates="user", cascade="all, delete-orphan")

    # Settings Relationships (one-to-one)
    settings              = relationship("UserSettings", back_populates="user", uselist=False, cascade="all, delete-orphan")
    privacy               = relationship("PrivacySettings", back_populates="user", uselist=False, cascade="all, delete-orphan")
    notification_settings = relationship("NotificationSettings", back_populates="user", uselist=False, cascade="all, delete-orphan")
    security              = relationship("SecuritySettings", back_populates="user", uselist=False, cascade="all, delete-orphan")
    time_mgmt             = relationship("TimeManagement", back_populates="user", uselist=False, cascade="all, delete-orphan")
    language              = relationship("LanguageSettings", back_populates="user", uselist=False, cascade="all, delete-orphan")
    ad_prefs              = relationship("AdPreferences", back_populates="user", uselist=False, cascade="all, delete-orphan")
    payment               = relationship("PaymentSettings", back_populates="user", uselist=False, cascade="all, delete-orphan")
    ghost_settings        = relationship("GhostModeSettings", back_populates="user", uselist=False, cascade="all, delete-orphan")

    # Ironclad Anti-Hack Security Hub
    passkeys            = relationship("Passkey", back_populates="user", cascade="all, delete-orphan")
    backup_codes        = relationship("BackupCode", back_populates="user", cascade="all, delete-orphan")
    guardians           = relationship("RecoveryGuardian", foreign_keys="RecoveryGuardian.user_id", back_populates="user", cascade="all, delete-orphan")
    security_audit_logs = relationship("SecurityAuditLog", back_populates="user", cascade="all, delete-orphan")

    # Nexoria Pay & Stars Economy
    wallet                     = relationship("StarWallet", back_populates="user", uselist=False, cascade="all, delete-orphan")
    payment_methods            = relationship("PaymentMethod", back_populates="user", cascade="all, delete-orphan")
    sent_star_transactions     = relationship("StarTransaction", foreign_keys="StarTransaction.sender_id", back_populates="sender")
    received_star_transactions = relationship("StarTransaction", foreign_keys="StarTransaction.receiver_id", back_populates="receiver")
    subscriptions_made         = relationship("CreatorSubscription", foreign_keys="CreatorSubscription.subscriber_id", back_populates="subscriber", cascade="all, delete-orphan")
    subscribers_received       = relationship("CreatorSubscription", foreign_keys="CreatorSubscription.creator_id", back_populates="creator", cascade="all, delete-orphan")
    shipping_addresses         = relationship("ShippingAddress", back_populates="user", cascade="all, delete-orphan")
    orders_placed              = relationship("Order", foreign_keys="Order.buyer_id", back_populates="buyer", cascade="all, delete-orphan")
    orders_received            = relationship("Order", foreign_keys="Order.seller_id", back_populates="seller")

    # Help & Support Hub
    support_tickets = relationship("SupportTicket", back_populates="user", cascade="all, delete-orphan")
    account_health  = relationship("AccountHealth", back_populates="user", uselist=False, cascade="all, delete-orphan")
    bug_reports     = relationship("BugReport", back_populates="user", cascade="all, delete-orphan")