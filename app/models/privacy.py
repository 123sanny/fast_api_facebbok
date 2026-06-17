from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class PrivacySettings(Base):
    __tablename__ = "privacy_settings"

    id = Column(Integer, primary_key=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        unique=True
    )

    profile_visibility = Column(
        String(20),
        default="public"
    )

    friend_request = Column(
        String(20),
        default="everyone"
    )

    user = relationship(
        "User",
        back_populates="privacy"
    )