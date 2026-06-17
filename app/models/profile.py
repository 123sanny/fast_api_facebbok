import enum

from sqlalchemy import Column, Integer, Text, Boolean, TIMESTAMP, ForeignKey, Enum, func
from sqlalchemy.orm import relationship, backref

from database import Base


class PhotoType(str, enum.Enum):
    profile = "profile"
    cover = "cover"


class Profile(Base):
    """
    User se bilkul alag table. models/user.py ko EDIT NAHI kiya gaya.
    'backref' ki wajah se User.profile khud-ba-khud available ho jata hai.
    """
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)

    profile_pic = Column(Text, nullable=True)
    cover_photo = Column(Text, nullable=True)

    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    # STEP 6 ka relation yahi hai -> "User" class me kuch likhne ki zaroorat nahi
    user = relationship("User", backref=backref("profile", uselist=False))
    photos = relationship("ProfilePhoto", back_populates="profile", cascade="all, delete-orphan")


class ProfilePhoto(Base):
    """Profile/cover photo history - gallery aur 'Choose cover photo' feature ke liye."""
    __tablename__ = "profile_photos"

    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False)
    photo_url = Column(Text, nullable=False)
    photo_type = Column(Enum(PhotoType), nullable=False)
    is_active = Column(Boolean, default=False, nullable=False)
    uploaded_at = Column(TIMESTAMP, server_default=func.now())

    profile = relationship("Profile", back_populates="photos")