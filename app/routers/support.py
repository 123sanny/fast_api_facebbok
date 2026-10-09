from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from database import get_db
from schemas.support import (
    AccountHealthOut,
    SupportTicketOut,
    SupportTicketCreate,
    TicketMessageOut,
    TicketReplyIn,
    ReportProblemIn,
    ViolationReviewIn,
    ArticleFeedbackIn
)
from services.support_service import (
    get_or_create_account_health,
    trigger_security_scan,
    create_support_ticket,
    get_user_tickets,
    get_ticket_by_id,
    add_ticket_reply,
    get_user_filed_reports,
    get_user_violations,
    request_violation_review,
    submit_bug_report,
    get_monetisation_hub_summary,
    get_knowledge_base_articles,
    record_article_feedback
)

router = APIRouter(prefix="", tags=["Help & Support Hub"])


# =====================================================================
# 1. ACCOUNT HEALTH & SAFETY PROFILE
# =====================================================================
@router.get("/users/{user_id}/support/health", response_model=AccountHealthOut)
def get_user_health(user_id: int, db: Session = Depends(get_db)):
    """Retrieve or initialize dynamic account quality and safety health profile."""
    return get_or_create_account_health(db, user_id)


@router.post("/users/{user_id}/support/health/scan", response_model=AccountHealthOut)
def scan_user_health(user_id: int, db: Session = Depends(get_db)):
    """Run real-time security integrity and account safety scan."""
    return trigger_security_scan(db, user_id)


# =====================================================================
# 2. SUPPORT INBOX & TICKETS
# =====================================================================
@router.get("/users/{user_id}/support/tickets", response_model=List[SupportTicketOut])
def list_user_tickets(user_id: int, db: Session = Depends(get_db)):
    """List all support helpdesk tickets filed by the user."""
    return get_user_tickets(db, user_id)


@router.post("/users/{user_id}/support/tickets", response_model=SupportTicketOut)
def create_ticket(user_id: int, payload: SupportTicketCreate, db: Session = Depends(get_db)):
    """Open a new support ticket."""
    return create_support_ticket(
        db=db,
        user_id=user_id,
        subject=payload.subject,
        category=payload.category,
        description=payload.description,
        priority=payload.priority or "medium",
        attachment_url=payload.attachment_url
    )


@router.get("/users/{user_id}/support/tickets/{ticket_id}", response_model=SupportTicketOut)
def get_ticket_details(user_id: int, ticket_id: int, db: Session = Depends(get_db)):
    """Fetch complete ticket thread with conversation messages."""
    ticket = get_ticket_by_id(db, ticket_id, user_id=user_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Support ticket not found")
    return ticket


@router.post("/users/{user_id}/support/tickets/{ticket_id}/reply", response_model=TicketMessageOut)
def reply_to_ticket(user_id: int, ticket_id: int, payload: TicketReplyIn, db: Session = Depends(get_db)):
    """Post a user message reply to an existing support ticket thread."""
    ticket = get_ticket_by_id(db, ticket_id, user_id=user_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Support ticket not found")
    
    return add_ticket_reply(
        db=db,
        ticket_id=ticket_id,
        sender_id=user_id,
        message=payload.message,
        is_staff=False,
        attachment_url=payload.attachment_url
    )


# =====================================================================
# 3. USER REPORTS FILED & POLICY VIOLATIONS
# =====================================================================
@router.get("/users/{user_id}/support/reports-filed")
def list_reports_filed(user_id: int, db: Session = Depends(get_db)):
    """List moderation reports submitted by this user about other accounts."""
    return {
        "success": True,
        "reports": get_user_filed_reports(db, user_id)
    }


@router.get("/users/{user_id}/support/violations")
def list_user_violations(user_id: int, db: Session = Depends(get_db)):
    """Retrieve policy warnings or active strikes on user's account."""
    return {
        "success": True,
        "violations": get_user_violations(db, user_id)
    }


@router.post("/users/{user_id}/support/violations/{violation_id}/request-review")
def request_strike_review(user_id: int, violation_id: int, payload: ViolationReviewIn, db: Session = Depends(get_db)):
    """Submit formal appeal for human review of a strike or warning."""
    return request_violation_review(db, user_id, violation_id, payload.reason)


# =====================================================================
# 4. REPORT A TECHNICAL PROBLEM / BUG REPORT
# =====================================================================
@router.post("/users/{user_id}/support/report-problem")
def report_technical_problem(user_id: int, payload: ReportProblemIn, db: Session = Depends(get_db)):
    """Submit bug report with client diagnostics logs, creating a reference ticket."""
    bug = submit_bug_report(
        db=db,
        user_id=user_id,
        title=payload.title or "Technical Glitch",
        steps_to_reproduce=payload.steps_to_reproduce,
        category=payload.category or "General",
        system_diagnostics=payload.system_diagnostics,
        app_version=payload.app_version or "2.5.0",
        os_info=payload.os_info,
        screenshot_url=payload.screenshot_url
    )
    return {
        "success": True,
        "ticket_id": f"NX-REP-{bug.id:05d}",
        "bug_id": bug.id,
        "message": "Report submitted successfully! Diagnostic logs captured."
    }


# =====================================================================
# 5. CREATOR MONETISATION HUB
# =====================================================================
@router.get("/users/{user_id}/support/monetisation-hub")
def get_monetisation_hub(user_id: int, db: Session = Depends(get_db)):
    """Retrieve estimated earnings, active streams, and payout schedule."""
    return {
        "success": True,
        "data": get_monetisation_hub_summary(db, user_id)
    }


# =====================================================================
# 6. KNOWLEDGE BASE ARTICLES & FEEDBACK
# =====================================================================
@router.get("/support/articles")
def list_knowledge_articles(query: Optional[str] = Query(None)):
    """Search and browse verified help guides and topics."""
    return {
        "success": True,
        "articles": get_knowledge_base_articles(query)
    }


@router.post("/support/articles/{article_id}/feedback")
def submit_article_feedback(article_id: str, payload: ArticleFeedbackIn):
    """Vote helpful or not helpful on a support article."""
    return record_article_feedback(article_id, payload.is_helpful)
