import enum
import json
from sqlalchemy import Column, Integer, String, Text, Boolean, Float, TIMESTAMP, ForeignKey, Enum, func
from sqlalchemy.orm import relationship, backref
from database import Base


class PhotoType(str, enum.Enum):
    profile = "profile"
    cover = "cover"


class Profile(Base):
    """
    Rich Nexoria User Profile model supporting all 16 granular profile sections.
    """
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)

    # 1. Avatar & Cover Photos + Positioning
    profile_pic = Column(Text, nullable=True)
    cover_photo = Column(Text, nullable=True)
    cover_photo_offset_y = Column(Integer, default=0)
    cover_photo_zoom = Column(Float, default=1.0)

    # 2. Bio & Intro Quotes
    bio = Column(Text, nullable=True)
    intro_quote = Column(String(255), nullable=True)

    # 3. Pinned Details (JSON List of tags to display on top of Intro)
    pinned_details = Column(Text, default=json.dumps(["category", "city", "education", "work"]))

    # 4. Categories & AI Creator Status
    categories = Column(Text, default=json.dumps(["Digital creator", "Software Engineer"]))
    is_ai_creator = Column(Boolean, default=True)

    # 5. Personal Details (City, Hometown, Relationship, DOB, Gender, Pronouns, Languages)
    current_city = Column(String(100), default="Delhi, India")
    hometown = Column(String(100), default="Deoria, UP")
    relationship_status = Column(String(50), default="Single")
    dob_month_day = Column(String(50), default="10 August")
    dob_year = Column(String(20), default="2002")
    dob_privacy = Column(String(50), default="Friends")
    gender = Column(String(50), default="Male")
    pronouns = Column(String(50), default="he/him")
    languages = Column(Text, default=json.dumps(["Hindi", "English", "Bhojpuri"]))

    # 6. Family Members & Pets
    family_members = Column(Text, default=json.dumps([]))
    pets = Column(Text, default=json.dumps([]))

    # 7. Work Experience
    work_workplace = Column(String(150), default="Nexoria Technologies")
    work_job_title = Column(String(100), default="Full Stack Engineer")
    work_privacy = Column(String(50), default="Public")

    # 8. Education Details
    education_school = Column(String(150), nullable=True)
    education_college = Column(String(150), default="Computer Science and Engineering")
    education_degree = Column(String(100), default="B.Tech Computer Science")
    education_privacy = Column(String(50), default="Public")

    # 9. Hobbies (JSON List)
    hobbies = Column(Text, default=json.dumps(["💻 Coding", "📸 Photography", "🎵 Music Production", "✈️ Traveling"]))

    # 10. Interests (JSON Dictionary of music, tv, films, games, sports)
    interests = Column(Text, default=json.dumps({
        "music": ["Electronic", "Lo-Fi Beats", "Indian Classical", "Synthwave"],
        "tv_programmes": ["Silicon Valley", "Black Mirror", "Mr. Robot", "Dark"],
        "films": ["Interstellar", "Inception", "The Matrix", "Oppenheimer"],
        "games": ["Cyberpunk 2077", "Valorant", "GTA V", "Chess"],
        "sports": ["Cricket", "Formula 1", "Badminton", "Table Tennis"]
    }))

    # 11. Visited Places / Travel (JSON List)
    visited_places = Column(Text, default=json.dumps(["Delhi, India", "Deoria, UP", "Varanasi, UP", "Goa, India"]))
    places_privacy = Column(String(50), default="Public")

    # 12. Communities & Groups (JSON List)
    communities = Column(Text, default=json.dumps([
        {"name": "AI Engineers & Innovators India", "role": "Moderator"},
        {"name": "React & Next.js Developers", "role": "Member"},
        {"name": "Delhi Tech Founders", "role": "Core Member"}
    ]))

    # 13. Offers, Deals & Promotions (JSON List)
    offers = Column(Text, default=json.dumps([]))

    # 14. Social Handles & Contact Links (JSON Dictionaries)
    social_handles = Column(Text, default=json.dumps({
        "instagram": "sanny_tiwari_official",
        "github": "123sanny",
        "twitter": "sannytiwari_ai",
        "linkedin": "sannytiwari",
        "youtube": "@sannytiwari"
    }))
    custom_links = Column(Text, default=json.dumps([
        "https://github.com/123sanny",
        "https://nexoria.social/@sanny",
        "https://linkedin.com/in/sannytiwari"
    ]))
    website_link = Column(String(200), default="https://nexoria.social/@sanny")
    contact_phone = Column(String(30), nullable=True)
    contact_email = Column(String(150), nullable=True)
    contact_privacy = Column(String(50), default="Friends")

    # 15. Creator Media Kit
    media_kit_title = Column(String(150), default="Creator Media Kit 2026")
    media_kit_link = Column(String(255), default="https://nexoria.social/kit/sanny")
    media_kit_privacy = Column(String(50), default="Public")

    # 16. Verified Trust Badges & Blue Tick Purchase
    badges = Column(Text, default=json.dumps(["verified_id", "pioneer", "e2e_guard", "top_contributor"]))
    aadhaar_verified = Column(Boolean, default=True)
    is_verified_purchased = Column(Boolean, default=False)

    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    user = relationship("User", backref=backref("profile", uselist=False))
    photos = relationship("ProfilePhoto", back_populates="profile", cascade="all, delete-orphan")


class ProfilePhoto(Base):
    """
    Profile and cover photo history / album gallery.
    """
    __tablename__ = "profile_photos"

    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    photo_url = Column(Text, nullable=False)
    photo_type = Column(Enum(PhotoType), nullable=False)
    caption = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=False, nullable=False)
    uploaded_at = Column(TIMESTAMP, server_default=func.now())

    profile = relationship("Profile", back_populates="photos")