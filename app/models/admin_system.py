import datetime
from sqlalchemy import Column, Integer, String, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base


class AdminUser(Base):
    """
    Role-Based Access Control (RBAC) Admin Accounts.
    Roles: super_admin, moderator, support, finance_manager
    """
    __tablename__ = "admin_users"

    id               = Column(Integer, primary_key=True, index=True)
    username         = Column(String(80), unique=True, nullable=False, index=True)
    email            = Column(String(150), unique=True, nullable=False, index=True)
    password         = Column(String(255), nullable=False)
    name             = Column(String(120), nullable=False)
    role             = Column(String(50), nullable=False, default="moderator")  # super_admin, moderator, support, finance_manager
    permissions_json = Column(Text, nullable=True)  # JSON array of permission keys
    avatar           = Column(Text, nullable=True)
    is_active        = Column(Boolean, default=True)
    two_factor_auth  = Column(Boolean, default=True)
    last_login_at    = Column(DateTime, nullable=True)
    created_at       = Column(DateTime, default=datetime.datetime.utcnow)


class AdminAuditLog(Base):
    """
    Immutable Security & Action Audit Trail for all Administrative Actions.
    """
    __tablename__ = "admin_audit_logs"

    id          = Column(Integer, primary_key=True, index=True)
    admin_id    = Column(Integer, nullable=True)
    admin_name  = Column(String(120), nullable=False, default="Admin")
    action      = Column(String(100), nullable=False, index=True)
    target_type = Column(String(50), nullable=False, index=True)  # user, post, reel, report, payout, ad, ip, system, chat
    target_id   = Column(String(100), nullable=True)
    details     = Column(Text, nullable=True)
    ip_address  = Column(String(60), nullable=True)
    user_agent  = Column(Text, nullable=True)
    created_at  = Column(DateTime, default=datetime.datetime.utcnow, index=True)


class AdminLoginLog(Base):
    """
    Records Admin Access Attempts, IPs, and 2FA Verification Logs.
    """
    __tablename__ = "admin_login_logs"

    id                  = Column(Integer, primary_key=True, index=True)
    email               = Column(String(150), nullable=False, index=True)
    ip_address          = Column(String(60), nullable=True)
    device_info         = Column(String(150), nullable=True)
    location            = Column(String(120), nullable=True)
    status              = Column(String(30), default="success")  # success, failed_password, failed_pin, ip_blocked
    two_factor_verified = Column(Boolean, default=True)
    created_at          = Column(DateTime, default=datetime.datetime.utcnow, index=True)


class BlockedIP(Base):
    """
    Firewall & Blacklisted IP Addresses.
    """
    __tablename__ = "blocked_ips"

    id         = Column(Integer, primary_key=True, index=True)
    ip_address = Column(String(60), unique=True, nullable=False, index=True)
    reason     = Column(String(255), nullable=True)
    blocked_by = Column(String(100), default="Super Admin")
    is_active  = Column(Boolean, default=True)
    blocked_at = Column(DateTime, default=datetime.datetime.utcnow)


class BroadcastAnnouncement(Base):
    """
    Platform-Wide Broadcasts, Targeted Group Announcements, and Scheduled Notifications.
    """
    __tablename__ = "broadcast_announcements"

    id                  = Column(Integer, primary_key=True, index=True)
    title               = Column(String(180), nullable=False)
    message             = Column(Text, nullable=False)
    type                = Column(String(40), default="info")  # info, warning, success, alert, promotion
    target_audience     = Column(String(50), default="all")   # all, creators, verified_users, specific_users
    target_user_ids     = Column(Text, nullable=True)         # JSON list of IDs
    scheduled_at        = Column(DateTime, nullable=True)
    is_sent             = Column(Boolean, default=False)
    sent_at             = Column(DateTime, nullable=True)
    recipients_count    = Column(Integer, default=0)
    created_by_admin_id = Column(Integer, nullable=True)
    created_at          = Column(DateTime, default=datetime.datetime.utcnow)


class AppSystemConfig(Base):
    """
    Persistent App-Wide Settings & Feature Flags (Signups, Maintenance, Upload Limits, Force Update).
    """
    __tablename__ = "app_system_configs"

    key        = Column(String(80), primary_key=True)
    value      = Column(Text, nullable=False)
    category   = Column(String(50), default="general")  # general, security, uploads, version, legal
    updated_by = Column(String(100), default="System")
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)


class LegalDocument(Base):
    """
    Dynamic Legal & Policy Documents (Privacy Policy, Terms of Service, Community Guidelines, FAQ).
    """
    __tablename__ = "legal_documents"

    id               = Column(Integer, primary_key=True, index=True)
    slug             = Column(String(60), unique=True, nullable=False, index=True)  # privacy_policy, terms_of_service, faq, community_guidelines
    title            = Column(String(180), nullable=False)
    content_markdown = Column(Text, nullable=False)
    last_updated_by  = Column(String(100), default="Super Admin")
    updated_at       = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)


class PlatformVisitorLog(Base):
    """
    Real-Time Platform Visitor Counter & Geolocation Analytics Telemetry.
    """
    __tablename__ = "platform_visitor_logs"

    id           = Column(Integer, primary_key=True, index=True)
    ip_address   = Column(String(60), nullable=False, index=True)
    user_id      = Column(Integer, nullable=True, index=True)
    page_path    = Column(String(255), default="/")
    user_agent   = Column(Text, nullable=True)
    device_type  = Column(String(50), default="Desktop")  # Desktop, Mobile, Tablet
    device_name  = Column(String(120), default="Web Browser")
    browser      = Column(String(80), default="Chrome")
    os_name      = Column(String(80), default="Windows")
    city         = Column(String(100), default="Mumbai")
    region       = Column(String(100), default="Maharashtra")
    country      = Column(String(100), default="India")
    country_code = Column(String(10), default="IN")
    country_flag = Column(String(10), default="🇮🇳")
    isp          = Column(String(150), nullable=True)
    lat          = Column(String(30), nullable=True)
    lon          = Column(String(30), nullable=True)
    created_at   = Column(DateTime, default=datetime.datetime.utcnow, index=True)

