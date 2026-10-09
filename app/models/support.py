from sqlalchemy import Column, Integer, String, Boolean, Text, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from database import Base
import datetime


class SupportTicket(Base):
    """
    Help Desk, Account Recovery & Security Incident Support Tickets
    """
    __tablename__ = "support_tickets"

    id             = Column(Integer, primary_key=True, index=True)
    ticket_number  = Column(String(40), unique=True, nullable=False, index=True)
    user_id        = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    subject        = Column(String(200), nullable=False)
    category       = Column(String(50), nullable=False)  # account_recovery, security_breach, payment_issue, bug_report, creator_payout, general
    description    = Column(Text, nullable=False)
    priority       = Column(String(20), default="medium")  # low, medium, high, urgent
    status         = Column(String(30), default="open")    # open, in_progress, resolved, closed
    attachment_url = Column(Text, nullable=True)
    resolved_at    = Column(DateTime, nullable=True)
    created_at     = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at     = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user     = relationship("User", back_populates="support_tickets")
    messages = relationship("TicketMessage", back_populates="ticket", cascade="all, delete")


class TicketMessage(Base):
    """
    Threaded Replies on Support Tickets between User & Support Staff
    """
    __tablename__ = "ticket_messages"

    id             = Column(Integer, primary_key=True, index=True)
    ticket_id      = Column(Integer, ForeignKey("support_tickets.id", ondelete="CASCADE"), nullable=False, index=True)
    sender_id      = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    is_staff       = Column(Boolean, default=False, nullable=False)
    message        = Column(Text, nullable=False)
    attachment_url = Column(Text, nullable=True)
    created_at     = Column(DateTime, default=datetime.datetime.utcnow)

    ticket = relationship("SupportTicket", back_populates="messages")
    sender = relationship("User")


class AccountHealth(Base):
    """
    Account Safety Reputation, Violation Counter & Anti-Ban Metrics
    """
    __tablename__ = "account_health"

    id                  = Column(Integer, primary_key=True, index=True)
    user_id             = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    health_score        = Column(Integer, default=100)  # 0 - 100
    security_rating     = Column(String(30), default="secure")  # secure, good, at_risk, critical
    violation_count     = Column(Integer, default=0)
    strike_count        = Column(Integer, default=0)
    shadowban_status    = Column(Boolean, default=False)
    is_verified_creator = Column(Boolean, default=False)
    last_security_scan  = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at          = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="account_health")


class BugReport(Base):
    """
    User-submitted Diagnostics, Bug Reports & App Telemetry
    """
    __tablename__ = "bug_reports"

    id                  = Column(Integer, primary_key=True, index=True)
    user_id             = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title               = Column(String(200), nullable=False)
    steps_to_reproduce  = Column(Text, nullable=False)
    system_diagnostics  = Column(Text, nullable=True)  # JSON or text logs
    app_version         = Column(String(30), default="2.0.0")
    os_info             = Column(String(100), nullable=True)
    screenshot_url      = Column(Text, nullable=True)
    status              = Column(String(30), default="submitted")  # submitted, triaged, investigating, fixed, dismissed
    created_at          = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="bug_reports")
