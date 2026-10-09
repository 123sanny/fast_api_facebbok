from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


# ==================== Support Tickets ====================
class SupportTicketCreate(BaseModel):
    subject: str
    category: str  # account_recovery, security_breach, payment_issue, bug_report, creator_payout, general
    description: str
    priority: Optional[str] = "medium"  # low, medium, high, urgent
    attachment_url: Optional[str] = None


class SupportTicketUpdate(BaseModel):
    status: Optional[str] = None  # open, in_progress, resolved, closed
    priority: Optional[str] = None


class TicketMessageCreate(BaseModel):
    ticket_id: int
    message: str
    attachment_url: Optional[str] = None


class TicketMessageOut(BaseModel):
    id: int
    ticket_id: int
    sender_id: Optional[int] = None
    is_staff: bool
    message: str
    attachment_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class SupportTicketOut(BaseModel):
    id: int
    ticket_number: str
    user_id: int
    subject: str
    category: str
    description: str
    priority: str
    status: str
    attachment_url: Optional[str] = None
    resolved_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    messages: Optional[List[TicketMessageOut]] = []

    class Config:
        from_attributes = True


# ==================== Account Health ====================
class AccountHealthOut(BaseModel):
    id: int
    user_id: int
    health_score: int
    security_rating: str
    violation_count: int
    strike_count: int
    shadowban_status: bool
    is_verified_creator: bool
    last_security_scan: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ==================== Bug Reports ====================
class BugReportCreate(BaseModel):
    title: str
    steps_to_reproduce: str
    system_diagnostics: Optional[str] = None
    app_version: Optional[str] = "2.0.0"
    os_info: Optional[str] = None
    screenshot_url: Optional[str] = None


class BugReportOut(BaseModel):
    id: int
    user_id: int
    title: str
    steps_to_reproduce: str
    system_diagnostics: Optional[str] = None
    app_version: str
    os_info: Optional[str] = None
    screenshot_url: Optional[str] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


# ==================== Action Request Payloads ====================
class ReportProblemIn(BaseModel):
    category: Optional[str] = "Feed & Posts"
    title: Optional[str] = "Technical Glitch"
    steps_to_reproduce: str
    system_diagnostics: Optional[str] = None
    app_version: Optional[str] = "2.5.0"
    os_info: Optional[str] = None
    screenshot_url: Optional[str] = None


class ViolationReviewIn(BaseModel):
    violation_id: int
    reason: str


class ArticleFeedbackIn(BaseModel):
    is_helpful: bool


class TicketReplyIn(BaseModel):
    message: str
    attachment_url: Optional[str] = None

