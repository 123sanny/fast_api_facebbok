from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
import datetime

class Report(Base):
    __tablename__ = "reports"

    id         = Column(Integer, primary_key=True)
    user_id    = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    type       = Column(String(50))
    reason     = Column(Text)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="reports")


class Group(Base):
    __tablename__ = "groups"

    id          = Column(Integer, primary_key=True)
    name        = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    admin_id    = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    created_at  = Column(DateTime, default=datetime.datetime.utcnow)


class Event(Base):
    __tablename__ = "events"

    id          = Column(Integer, primary_key=True)
    user_id     = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    title       = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    location    = Column(String(200), nullable=True)
    event_date  = Column(DateTime, nullable=True)
    created_at  = Column(DateTime, default=datetime.datetime.utcnow)


class Page(Base):
    __tablename__ = "pages"

    id          = Column(Integer, primary_key=True)
    admin_id    = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    name        = Column(String(100), nullable=False)
    category    = Column(String(50), nullable=True)
    description = Column(Text, nullable=True)
    created_at  = Column(DateTime, default=datetime.datetime.utcnow)