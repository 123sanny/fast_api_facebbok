from sqlalchemy import Column, Integer, String, Boolean, Text, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from database import Base
import datetime


# =====================================================================
# 1. HYPERLOCAL NEIGHBORHOOD POSTS & ALERTS
# =====================================================================
class HyperlocalPost(Base):
    """
    Hyperlocal Community Feed: Neighborhood announcements, emergency alerts,
    lost & found, local events, road/power updates, and neighbor discussions.
    """
    __tablename__ = "hyperlocal_posts"

    id             = Column(Integer, primary_key=True, index=True)
    author_id      = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    category       = Column(String(50), nullable=False, default="general") # alert, emergency, lost_found, event, recommendation, general, service
    title          = Column(String(200), nullable=False)
    content        = Column(Text, nullable=False)
    
    # Precise Spatial & Locality Metadata
    city           = Column(String(80), nullable=False, index=True)
    locality       = Column(String(120), nullable=False, index=True)
    pincode        = Column(String(20), nullable=True)
    latitude       = Column(Float, nullable=False, index=True)
    longitude      = Column(Float, nullable=False, index=True)
    broadcast_radius_km = Column(Float, default=5.0) # 1km, 3km, 5km, 10km radius
    
    media_json     = Column(Text, nullable=True) # JSON list of images / attachments
    is_urgent      = Column(Boolean, default=False)
    is_verified    = Column(Boolean, default=True)
    upvotes_count  = Column(Integer, default=0)
    comments_count = Column(Integer, default=0)
    views_count    = Column(Integer, default=0)
    
    created_at     = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    updated_at     = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    author         = relationship("User", foreign_keys=[author_id])
    upvotes        = relationship("HyperlocalUpvote", back_populates="post", cascade="all, delete-orphan")


# =====================================================================
# 2. HYPERLOCAL UPVOTES & HELPFUL CONFIRMATIONS
# =====================================================================
class HyperlocalUpvote(Base):
    """
    Neighbor verification & upvoting for local posts/alerts.
    """
    __tablename__ = "hyperlocal_upvotes"

    id         = Column(Integer, primary_key=True, index=True)
    post_id    = Column(Integer, ForeignKey("hyperlocal_posts.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id    = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    post       = relationship("HyperlocalPost", back_populates="upvotes")
    user       = relationship("User")


# =====================================================================
# 3. HYPERLOCAL BUSINESSES & HOME SERVICES
# =====================================================================
class HyperlocalService(Base):
    """
    Verified neighborhood professionals, shops, home kitchens, tutors,
    electricians, plumbers, and doorstep services within 0.5 - 10 KM.
    """
    __tablename__ = "hyperlocal_services"

    id                 = Column(Integer, primary_key=True, index=True)
    owner_id           = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name               = Column(String(150), nullable=False)
    category           = Column(String(60), nullable=False, index=True) # Home Repair, Tuition, Grocery, Medical, Food, Fitness, Tech
    service_type       = Column(String(100), nullable=False) # e.g. "Electrician & AC Repair", "Home Cooked Tiffin"
    description        = Column(Text, nullable=True)
    
    # Contact & Ordering Info
    phone              = Column(String(25), nullable=True)
    whatsapp           = Column(String(25), nullable=True)
    price_starts_at    = Column(Float, nullable=True) # e.g. 199.0
    
    # Location Metadata
    address            = Column(String(255), nullable=True)
    locality           = Column(String(120), nullable=False, index=True)
    city               = Column(String(80), nullable=False, index=True)
    pincode            = Column(String(20), nullable=True)
    latitude           = Column(Float, nullable=False, index=True)
    longitude          = Column(Float, nullable=False, index=True)
    service_radius_km  = Column(Float, default=5.0) # Delivery / service range
    
    # Badges & Operational Status
    is_open_now        = Column(Boolean, default=True)
    is_doorstep_available = Column(Boolean, default=True)
    is_verified        = Column(Boolean, default=True)
    rating             = Column(Float, default=4.8)
    reviews_count      = Column(Integer, default=12)
    images_json        = Column(Text, nullable=True)
    
    created_at         = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at         = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    owner              = relationship("User", foreign_keys=[owner_id])


# =====================================================================
# 4. NEIGHBORHOOD HUBS & RESIDENTIAL CIRCLES
# =====================================================================
class NeighborhoodHub(Base):
    """
    Locality hubs for specific residential colonies, sectors, or societies.
    """
    __tablename__ = "neighborhood_hubs"

    id             = Column(Integer, primary_key=True, index=True)
    name           = Column(String(120), nullable=False) # e.g. "Sector 62 Noida Hub"
    slug           = Column(String(150), unique=True, nullable=False, index=True)
    city           = Column(String(80), nullable=False)
    locality       = Column(String(120), nullable=False)
    latitude       = Column(Float, nullable=False)
    longitude      = Column(Float, nullable=False)
    radius_km      = Column(Float, default=3.0)
    members_count  = Column(Integer, default=1)
    posts_count    = Column(Integer, default=0)
    cover_image    = Column(Text, nullable=True)
    created_at     = Column(DateTime, default=datetime.datetime.utcnow)
