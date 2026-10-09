import datetime
from sqlalchemy import Column, Integer, String, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base


class Ad(Base):
    """
    Sponsored Advertiser Campaigns & Posts on Nexoria
    """
    __tablename__ = "ads"

    id             = Column(Integer, primary_key=True, index=True)
    brand_name     = Column(String(100), nullable=False, index=True)
    logo_url       = Column(Text, nullable=True)
    category       = Column(String(50), default="Technology")
    headline       = Column(String(255), nullable=False)
    description    = Column(Text, nullable=True)
    media_url      = Column(Text, nullable=True)
    target_url     = Column(String(255), nullable=False, default="https://nexoria.io")
    call_to_action = Column(String(50), default="Learn More")
    is_verified    = Column(Boolean, default=True)
    is_active      = Column(Boolean, default=True)
    status         = Column(String(30), default="active")  # active, paused, pending, rejected, completed
    budget         = Column(Integer, default=5000)
    spent          = Column(Integer, default=0)
    views_count    = Column(Integer, default=0)
    clicks_count   = Column(Integer, default=0)
    start_date     = Column(DateTime, nullable=True)
    end_date       = Column(DateTime, nullable=True)
    created_at     = Column(DateTime, default=datetime.datetime.utcnow)

    interactions = relationship("UserAdActivity", back_populates="ad", cascade="all, delete-orphan")


class UserAdActivity(Base):
    """
    User Interactions, Clicks, Saved Ads, and Feedback History
    """
    __tablename__ = "user_ad_activities"

    id               = Column(Integer, primary_key=True, index=True)
    user_id          = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    ad_id            = Column(Integer, ForeignKey("ads.id", ondelete="CASCADE"), nullable=False, index=True)
    interaction_type = Column(String(30), default="clicked")  # clicked, viewed, saved, hidden, reported
    is_saved         = Column(Boolean, default=False)
    is_hidden        = Column(Boolean, default=False)
    feedback_reason  = Column(String(100), nullable=True)
    feedback_text    = Column(Text, nullable=True)
    clicked_at       = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at       = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    ad   = relationship("Ad", back_populates="interactions")
    user = relationship("User")


class UserAdTopic(Base):
    """
    User Ad Topic Preferences (e.g. Technology, Fashion, Gaming, Food)
    """
    __tablename__ = "user_ad_topics"

    id            = Column(Integer, primary_key=True, index=True)
    user_id       = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    topic_name    = Column(String(80), nullable=False)
    is_interested = Column(Boolean, default=True)
    updated_at    = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User")


class UserBlockedAdvertiser(Base):
    """
    Blocked Advertisers and Sponsored Brands by User
    """
    __tablename__ = "user_blocked_advertisers"

    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    brand_name = Column(String(100), nullable=False, index=True)
    ad_id      = Column(Integer, ForeignKey("ads.id", ondelete="CASCADE"), nullable=True)
    reason     = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User")

