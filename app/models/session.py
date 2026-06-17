# models/session.py

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
import datetime

class UserSession(Base):
    __tablename__ = "user_sessions"

    id = Column(Integer, primary_key=True)

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))

    access_token = Column(String(500))
    refresh_token = Column(String(500))

    device = Column(String(100))
    ip_address = Column(String(100))

    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # user = relationship("User")
    user = relationship(
    "User",
    back_populates="sessions"
)