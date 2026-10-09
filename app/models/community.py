from sqlalchemy import Column, Integer, String, Boolean, Text, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from database import Base
import datetime


# ==================== GROUPS ====================
class Group(Base):
    """
    Facebook Groups & Community Spaces
    """
    __tablename__ = "groups"

    id                       = Column(Integer, primary_key=True, index=True)
    name                     = Column(String(120), nullable=False)
    slug                     = Column(String(150), unique=True, nullable=False, index=True)
    description              = Column(Text, nullable=True)
    cover_image              = Column(Text, nullable=True)
    icon_image               = Column(Text, nullable=True)
    privacy                  = Column(String(20), default="public")  # public, private, hidden
    is_post_approval_required = Column(Boolean, default=False)
    creator_id               = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at               = Column(DateTime, default=datetime.datetime.utcnow)

    creator  = relationship("User", foreign_keys=[creator_id])
    members  = relationship("GroupMember", back_populates="group", cascade="all, delete-orphan")
    posts    = relationship("GroupPost", back_populates="group", cascade="all, delete-orphan")
    rules    = relationship("GroupRule", back_populates="group", cascade="all, delete-orphan")


class GroupMember(Base):
    """
    Members and Roles inside a Group
    """
    __tablename__ = "group_members"

    id         = Column(Integer, primary_key=True, index=True)
    group_id   = Column(Integer, ForeignKey("groups.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id    = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    role       = Column(String(20), default="member")  # admin, moderator, member
    status     = Column(String(20), default="active")  # active, pending, banned
    joined_at  = Column(DateTime, default=datetime.datetime.utcnow)

    group = relationship("Group", back_populates="members")
    user  = relationship("User", back_populates="group_memberships")


class GroupPost(Base):
    """
    Posts Published in a Group
    """
    __tablename__ = "group_posts"

    id          = Column(Integer, primary_key=True, index=True)
    group_id    = Column(Integer, ForeignKey("groups.id", ondelete="CASCADE"), nullable=False, index=True)
    post_id     = Column(Integer, ForeignKey("posts.id", ondelete="CASCADE"), nullable=False, index=True)
    is_approved = Column(Boolean, default=True)
    approved_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at  = Column(DateTime, default=datetime.datetime.utcnow)

    group = relationship("Group", back_populates="posts")
    post  = relationship("Post")


class GroupRule(Base):
    """
    Community Rules for Group Members
    """
    __tablename__ = "group_rules"

    id          = Column(Integer, primary_key=True, index=True)
    group_id    = Column(Integer, ForeignKey("groups.id", ondelete="CASCADE"), nullable=False, index=True)
    title       = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    rule_order  = Column(Integer, default=1)

    group = relationship("Group", back_populates="rules")


# ==================== PAGES ====================
class Page(Base):
    """
    Facebook Creator, Business & Brand Pages
    """
    __tablename__ = "pages"

    id              = Column(Integer, primary_key=True, index=True)
    name            = Column(String(120), nullable=False)
    handle          = Column(String(80), unique=True, nullable=False, index=True)
    category        = Column(String(60), default="Creator")
    bio             = Column(Text, nullable=True)
    profile_pic     = Column(Text, nullable=True)
    cover_photo     = Column(Text, nullable=True)
    website         = Column(String(200), nullable=True)
    phone           = Column(String(30), nullable=True)
    email           = Column(String(150), nullable=True)
    is_verified     = Column(Boolean, default=False)
    followers_count = Column(Integer, default=0)
    likes_count     = Column(Integer, default=0)
    creator_id      = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at      = Column(DateTime, default=datetime.datetime.utcnow)

    creator   = relationship("User", foreign_keys=[creator_id])
    roles     = relationship("PageRole", back_populates="page", cascade="all, delete-orphan")
    followers = relationship("PageFollower", back_populates="page", cascade="all, delete-orphan")


class PageRole(Base):
    """
    Staff and Admin roles for Pages
    """
    __tablename__ = "page_roles"

    id         = Column(Integer, primary_key=True, index=True)
    page_id    = Column(Integer, ForeignKey("pages.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id    = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    role       = Column(String(30), default="editor")  # admin, editor, moderator, advertiser, analyst
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    page = relationship("Page", back_populates="roles")
    user = relationship("User")


class PageFollower(Base):
    """
    Followers of Pages
    """
    __tablename__ = "page_followers"

    id          = Column(Integer, primary_key=True, index=True)
    page_id     = Column(Integer, ForeignKey("pages.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id     = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    followed_at = Column(DateTime, default=datetime.datetime.utcnow)

    page = relationship("Page", back_populates="followers")
    user = relationship("User")


# ==================== EVENTS ====================
class Event(Base):
    """
    Events, Meetups & Virtual Webinars
    """
    __tablename__ = "events"

    id           = Column(Integer, primary_key=True, index=True)
    creator_id   = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title        = Column(String(200), nullable=False)
    description  = Column(Text, nullable=True)
    cover_image  = Column(Text, nullable=True)
    location     = Column(String(200), nullable=True)
    is_online    = Column(Boolean, default=False)
    meeting_link = Column(String(255), nullable=True)
    start_time   = Column(DateTime, nullable=False)
    end_time     = Column(DateTime, nullable=True)
    privacy      = Column(String(20), default="public")  # public, private, friends_only
    created_at   = Column(DateTime, default=datetime.datetime.utcnow)

    creator   = relationship("User", foreign_keys=[creator_id])
    attendees = relationship("EventAttendee", back_populates="event", cascade="all, delete-orphan")


class EventAttendee(Base):
    """
    Event RSVPs: Going, Interested, Declined
    """
    __tablename__ = "event_attendees"

    id         = Column(Integer, primary_key=True, index=True)
    event_id   = Column(Integer, ForeignKey("events.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id    = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    status     = Column(String(20), default="going")  # going, interested, declined
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    event = relationship("Event", back_populates="attendees")
    user  = relationship("User")


# ==================== MARKETPLACE ====================
class MarketplaceItem(Base):
    """
    Facebook Marketplace Buy & Sell Listings
    """
    __tablename__ = "marketplace_items"

    id          = Column(Integer, primary_key=True, index=True)
    seller_id   = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    category    = Column(String(60), nullable=False)  # Electronics, Vehicles, Property, Apparel, Home
    title       = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    price       = Column(Float, nullable=False)
    currency    = Column(String(10), default="USD")
    condition   = Column(String(30), default="like_new")  # new, like_new, good, fair
    location    = Column(String(120), nullable=False)
    images_json = Column(Text, nullable=True)  # JSON array of image URLs
    status      = Column(String(20), default="active")  # active, pending, sold, hidden
    created_at  = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at  = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    seller = relationship("User", foreign_keys=[seller_id], back_populates="marketplace_listings")
    saved  = relationship("SavedMarketplaceItem", back_populates="item", cascade="all, delete-orphan")


class SavedMarketplaceItem(Base):
    """
    Bookmarks for Marketplace Listings
    """
    __tablename__ = "saved_marketplace_items"

    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    item_id    = Column(Integer, ForeignKey("marketplace_items.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User")
    item = relationship("MarketplaceItem", back_populates="saved")


# ==================== REPORTS & MODERATION ====================
class Report(Base):
    """
    Abuse, Spam, Harassment, and Copyright Violation Reports
    """
    __tablename__ = "reports"

    id          = Column(Integer, primary_key=True, index=True)
    reporter_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    target_type = Column(String(30), nullable=False)  # post, comment, user, group, page, message
    target_id   = Column(Integer, nullable=False)
    reason      = Column(String(60), nullable=False)  # spam, hate_speech, violence, copyright, harassment, fake_account
    details     = Column(Text, nullable=True)
    status      = Column(String(20), default="pending")  # pending, reviewed, action_taken, dismissed
    created_at  = Column(DateTime, default=datetime.datetime.utcnow)

    reporter = relationship("User", foreign_keys=[reporter_id], back_populates="reports")
