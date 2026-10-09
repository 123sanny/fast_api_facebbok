import datetime
import random
import string
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc

from models.support import SupportTicket, TicketMessage, AccountHealth, BugReport
from models.community import Report
from models.user import User


def generate_ticket_number(prefix: str = "NX") -> str:
    """Generate a unique human-readable ticket reference number like NX-89214"""
    random_digits = "".join(random.choices(string.digits, k=5))
    return f"{prefix}-{random_digits}"


# =====================================================================
# 1. ACCOUNT HEALTH & SAFETY PROFILE
# =====================================================================
def get_or_create_account_health(db: Session, user_id: int) -> AccountHealth:
    """Retrieve existing user account health record or initialize clean baseline."""
    health = db.query(AccountHealth).filter(AccountHealth.user_id == user_id).first()
    if not health:
        user = db.query(User).filter(User.id == user_id).first()
        is_verified = user.is_verified if user else False
        health = AccountHealth(
            user_id=user_id,
            health_score=100,
            security_rating="secure",
            violation_count=0,
            strike_count=0,
            shadowban_status=False,
            is_verified_creator=is_verified,
            last_security_scan=datetime.datetime.utcnow()
        )
        db.add(health)
        db.commit()
        db.refresh(health)
    return health


def trigger_security_scan(db: Session, user_id: int) -> AccountHealth:
    """Perform on-demand security scan, recalculating health score and updating scan timestamp."""
    health = get_or_create_account_health(db, user_id)
    
    # Recalculate health based on violations and strikes
    score = 100 - (health.violation_count * 15) - (health.strike_count * 25)
    health.health_score = max(0, min(100, score))
    
    if health.health_score >= 90:
        health.security_rating = "secure"
    elif health.health_score >= 70:
        health.security_rating = "good"
    elif health.health_score >= 40:
        health.security_rating = "at_risk"
    else:
        health.security_rating = "critical"
        
    health.last_security_scan = datetime.datetime.utcnow()
    db.commit()
    db.refresh(health)
    return health


# =====================================================================
# 2. SUPPORT TICKETS & THREADED MESSAGES
# =====================================================================
def create_support_ticket(
    db: Session,
    user_id: int,
    subject: str,
    category: str,
    description: str,
    priority: str = "medium",
    attachment_url: Optional[str] = None
) -> SupportTicket:
    """Create a new support helpdesk ticket."""
    ticket = SupportTicket(
        ticket_number=generate_ticket_number("NX-TCK"),
        user_id=user_id,
        subject=subject,
        category=category,
        description=description,
        priority=priority,
        status="open",
        attachment_url=attachment_url,
        created_at=datetime.datetime.utcnow()
    )
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    
    # 1. Auto-add initial user message to thread
    first_msg = TicketMessage(
        ticket_id=ticket.id,
        sender_id=user_id,
        is_staff=False,
        message=description,
        attachment_url=attachment_url,
        created_at=datetime.datetime.utcnow()
    )
    db.add(first_msg)

    # 2. Auto-add immediate Staff Acknowledgment Message so user sees dynamic live support response
    staff_greeting = (
        f"👋 Hello! Thank you for contacting Nexoria Support Desk.\n\n"
        f"We have logged your ticket #{ticket.ticket_number} under '{category.replace('_', ' ').title()}'. "
        f"Our support specialists and engineering team are reviewing your details. "
        f"You can post additional details, screenshots, or questions here anytime!"
    )
    staff_ack = TicketMessage(
        ticket_id=ticket.id,
        sender_id=None,
        is_staff=True,
        message=staff_greeting,
        created_at=datetime.datetime.utcnow() + datetime.timedelta(seconds=1)
    )
    db.add(staff_ack)
    
    ticket.status = "in_progress"
    db.commit()
    db.refresh(ticket)
    return ticket


def get_user_tickets(db: Session, user_id: int) -> List[SupportTicket]:
    """Fetch all tickets filed by the user."""
    return db.query(SupportTicket).filter(
        SupportTicket.user_id == user_id
    ).order_by(desc(SupportTicket.created_at)).all()


def get_ticket_by_id(db: Session, ticket_id: int, user_id: Optional[int] = None) -> Optional[SupportTicket]:
    """Get single ticket by ID with ownership verification."""
    query = db.query(SupportTicket).filter(SupportTicket.id == ticket_id)
    if user_id:
        query = query.filter(SupportTicket.user_id == user_id)
    return query.first()


def add_ticket_reply(
    db: Session,
    ticket_id: int,
    sender_id: int,
    message: str,
    is_staff: bool = False,
    attachment_url: Optional[str] = None
) -> TicketMessage:
    """Post a reply on a support ticket thread and update ticket status."""
    ticket = db.query(SupportTicket).filter(SupportTicket.id == ticket_id).first()
    if not ticket:
        raise ValueError("Ticket not found")

    new_msg = TicketMessage(
        ticket_id=ticket_id,
        sender_id=sender_id,
        is_staff=is_staff,
        message=message,
        attachment_url=attachment_url,
        created_at=datetime.datetime.utcnow()
    )
    db.add(new_msg)

    if is_staff:
        ticket.status = "in_progress"
    elif ticket.status == "resolved":
        ticket.status = "open"  # Re-open if user replies to resolved ticket
    else:
        ticket.status = "in_progress"

    ticket.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(new_msg)
    return new_msg



# =====================================================================
# 3. USER REPORTS FILED & POLICY VIOLATIONS
# =====================================================================
def get_user_filed_reports(db: Session, user_id: int) -> List[Dict[str, Any]]:
    """Retrieve reports submitted by this user about other accounts/content."""
    reports = db.query(Report).filter(Report.reporter_id == user_id).order_by(desc(Report.created_at)).all()
    results = []
    
    # If user has no reports yet, provide baseline initial seed report so inbox is informative
    if not reports:
        # Create standard initial reviewed report
        sample_report = Report(
            reporter_id=user_id,
            target_type="user",
            target_id=202,
            reason="fake_account",
            details="Profile attempting identity duplication and automated promotional spam.",
            status="action_taken",
            created_at=datetime.datetime.utcnow() - datetime.timedelta(days=1, hours=3)
        )
        db.add(sample_report)
        db.commit()
        db.refresh(sample_report)
        reports = [sample_report]

    for r in reports:
        action_summary = "Report received and under standard safety queue."
        if r.status == "action_taken":
            action_summary = "Action taken: The reported content/profile was reviewed and removed for violating Community Standards."
        elif r.status == "reviewed":
            action_summary = "Reviewed: Content was analyzed against policy guidelines."
        elif r.status == "dismissed":
            action_summary = "Reviewed: Content was found to comply with community standards at this time."

        results.append({
            "id": r.id,
            "reference_code": f"NX-REP-{r.id:05d}",
            "target_type": r.target_type,
            "target_id": r.target_id,
            "reason": r.reason.replace("_", " ").title(),
            "details": r.details,
            "status": r.status,
            "action_summary": action_summary,
            "created_at": r.created_at.isoformat() if r.created_at else datetime.datetime.utcnow().isoformat()
        })
    return results


def get_user_violations(db: Session, user_id: int) -> List[Dict[str, Any]]:
    """Retrieve violation notices or strikes on the user's account."""
    health = get_or_create_account_health(db, user_id)
    violations = []
    
    if health.strike_count > 0 or health.violation_count > 0:
        violations.append({
            "id": 1,
            "title": "Community Standards Warning",
            "policy": "Unoriginal Content / Third-party Watermark",
            "strike_level": health.strike_count,
            "date": (datetime.datetime.utcnow() - datetime.timedelta(days=7)).isoformat(),
            "status": "warning_active",
            "can_request_review": True,
            "details": "A video reel was flagged for containing unlicensed third-party branding."
        })
        
    return violations


def request_violation_review(db: Session, user_id: int, violation_id: int, reason: str) -> Dict[str, Any]:
    """File a formal request for safety team human review on a strike."""
    ticket = create_support_ticket(
        db=db,
        user_id=user_id,
        subject=f"Review Request for Violation Notice #{violation_id}",
        category="account_recovery",
        description=f"User requested human appeal review. Reason: {reason}",
        priority="high"
    )
    return {
        "success": True,
        "message": "Appeal submitted successfully. Our safety committee will review within 24-48 hours.",
        "ticket_number": ticket.ticket_number
    }


# =====================================================================
# 4. BUG REPORTS & TECHNICAL PROBLEM SUBMISSION
# =====================================================================
def submit_bug_report(
    db: Session,
    user_id: int,
    title: str,
    steps_to_reproduce: str,
    category: str = "General",
    system_diagnostics: Optional[str] = None,
    app_version: str = "2.5.0",
    os_info: Optional[str] = None,
    screenshot_url: Optional[str] = None
) -> BugReport:
    """Record a detailed technical glitch or bug report with system telemetry."""
    bug = BugReport(
        user_id=user_id,
        title=f"[{category}] {title}",
        steps_to_reproduce=steps_to_reproduce,
        system_diagnostics=system_diagnostics,
        app_version=app_version,
        os_info=os_info,
        screenshot_url=screenshot_url,
        status="submitted",
        created_at=datetime.datetime.utcnow()
    )
    db.add(bug)
    db.commit()
    db.refresh(bug)
    
    # Also link a corresponding support ticket so it shows in the user's Support Inbox
    create_support_ticket(
        db=db,
        user_id=user_id,
        subject=f"Bug Report #{bug.id}: [{category}] {title}",
        category="bug_report",
        description=f"{steps_to_reproduce}\n\n[Diagnostics: {system_diagnostics or 'N/A'}]",
        priority="medium",
        attachment_url=screenshot_url
    )
    
    return bug


# =====================================================================
# 5. CREATOR MONETISATION HUB DATA
# =====================================================================
def get_monetisation_hub_summary(db: Session, user_id: int) -> Dict[str, Any]:
    """Compute dynamic Creator Monetisation metrics for the logged-in user."""
    user = db.query(User).filter(User.id == user_id).first()
    health = get_or_create_account_health(db, user_id)
    
    # Dynamic calculation or personalized creator stats
    is_eligible = (health.strike_count == 0) and (health.health_score >= 80)
    
    # Compute sample dynamic revenue values based on user ID seed
    seed = (user_id * 137) % 500
    stars_earned = 120.00 + (seed * 0.4)
    subs_earned = 280.00 + (seed * 0.8)
    ads_earned = 640.00 + (seed * 1.5)
    bonus_earned = 250.00 + (seed * 0.5)
    total_estimated = stars_earned + subs_earned + ads_earned + bonus_earned
    
    # Next automatic payout date (21st of current/next month)
    today = datetime.date.today()
    payout_day = 21
    if today.day <= payout_day:
        next_payout = datetime.date(today.year, today.month, payout_day)
    else:
        # Next month
        next_month = today.month + 1 if today.month < 12 else 1
        year = today.year if today.month < 12 else today.year + 1
        next_payout = datetime.date(year, next_month, payout_day)

    return {
        "user_id": user_id,
        "is_eligible": is_eligible,
        "policy_standing": "Good Standing (0 Strikes)" if is_eligible else "Under Review",
        "estimated_total_earnings": round(total_estimated, 2),
        "monthly_growth_percent": 18.4,
        "next_payout_date": next_payout.strftime("%d %B, %Y"),
        "payout_status": "Direct Bank Payout Active",
        "streams": [
            {
                "id": "stars",
                "name": "Stars on Reels & Live",
                "icon": "⭐",
                "status": "Active" if is_eligible else "Pending",
                "amount": round(stars_earned, 2),
                "metric_label": f"{int(stars_earned * 100):,} stars received"
            },
            {
                "id": "subscriptions",
                "name": "Supporter Subscriptions",
                "icon": "💎",
                "status": "Active" if is_eligible else "Pending",
                "amount": round(subs_earned, 2),
                "metric_label": f"{int(subs_earned / 5)} active paying subscribers"
            },
            {
                "id": "video_ads",
                "name": "In-Stream Video Ads",
                "icon": "🎬",
                "status": "Active" if is_eligible else "Pending",
                "amount": round(ads_earned, 2),
                "metric_label": f"{round(ads_earned * 1.4, 1):,}K monetised views"
            },
            {
                "id": "reels_bonus",
                "name": "Reels Creator Bonus",
                "icon": "🔥",
                "status": "Active" if is_eligible else "Pending",
                "amount": round(bonus_earned, 2),
                "metric_label": "Goal 85% completed"
            }
        ]
    }


# =====================================================================
# 6. KNOWLEDGE BASE ARTICLES & FEEDBACK
# =====================================================================
KNOWLEDGE_BASE_DATA = [
    {
        "id": "monetisation-eligibility",
        "category": "Monetisation",
        "title": "How to check your monetisation eligibility on a Nexoria Page",
        "readTime": "3 min read",
        "summary": "Learn the policy standards, follower count, and watch time requirements to start earning on Nexoria.",
        "content": [
            "To check your monetisation status on Nexoria, go to your Professional Dashboard > Monetisation Tools.",
            "Requirements include having at least 5,000 authentic followers, 60,000 total eligible minutes viewed across your videos in the last 60 days, and residing in an eligible country.",
            "Ensure your Page strictly complies with Nexoria Partner Monetisation Policies and Content Monetisation Standards (no copyright infringements or unoriginal content)."
        ],
        "tips": [
            "Keep publishing original vertical Reels with high retention rate.",
            "Do not re-upload content with third-party watermarks or unlicensed audio.",
            "Check your Account Quality tab monthly to keep a clean record."
        ],
        "helpful_count": 842,
        "not_helpful_count": 18
    },
    {
        "id": "creator-monetisation",
        "category": "Creator Studio",
        "title": "About Nexoria content monetisation for creators",
        "readTime": "4 min read",
        "summary": "Discover how to unlock Subscriptions, Stars in Live streams, and In-Stream Video Ads.",
        "content": [
            "Nexoria provides multiple revenue streams for creators: Stars (virtual gifts sent by viewers during live streams and reels), Subscriptions (monthly recurring fees for exclusive content & supporter badges), and In-stream Ads (overlay and mid-roll ads on videos).",
            "Payouts are processed automatically every month once your account reaches the $100 minimum threshold balance.",
            "You can link your direct Bank Account (Wire Transfer) or PayPal from Settings > Orders & Payments > Payouts."
        ],
        "tips": [
            "Offer custom subscriber perks such as exclusive badge icons, private group access, and behind-the-scenes stories.",
            "Pin your top star contributors in comments to reward your community."
        ],
        "helpful_count": 1205,
        "not_helpful_count": 24
    },
    {
        "id": "verified-profile",
        "category": "Account & Profile",
        "title": "Update your Nexoria Verified creator profile information",
        "readTime": "2 min read",
        "summary": "How to maintain your blue verification badge and update legal details safely.",
        "content": [
            "Nexoria Verified confirms the authenticity of profiles representing public figures, creators, and brands.",
            "If you need to update your registered display name or category, submit an official verification change request before modifying your username.",
            "Enabling Two-Factor Authentication (2FA) is mandatory to protect your verified badge from unauthorized takeover attempts."
        ],
        "tips": [
            "Never disable 2FA as it may temporarily freeze your badge status for security review.",
            "Keep your official government ID up-to-date in your Identity Confirmation settings."
        ],
        "helpful_count": 670,
        "not_helpful_count": 12
    },
    {
        "id": "security-2fa",
        "category": "Privacy & Security",
        "title": "How to protect your account with Two-Factor Authentication (2FA)",
        "readTime": "3 min read",
        "summary": "Add an extra layer of security using Google Authenticator or SMS verification codes.",
        "content": [
            "Two-Factor Authentication prevents unauthorized access even if someone knows your password.",
            "To enable it, navigate to Settings > Privacy Checkup > Account Security > Two-Factor Authentication.",
            "You can generate backup recovery codes to save in a secure place in case you lose access to your phone."
        ],
        "tips": [
            "We recommend using an Authenticator app (such as Google Authenticator or Authy) over SMS for maximum security.",
            "Review your Active Login Sessions in Settings > Device Request to sign out of unknown devices."
        ],
        "helpful_count": 1940,
        "not_helpful_count": 31
    },
    {
        "id": "community-strikes",
        "category": "Community Standards",
        "title": "Understanding Nexoria Community Standards & Violation Strikes",
        "readTime": "5 min read",
        "summary": "How violation strikes work and what you can do if you believe a strike was issued by mistake.",
        "content": [
            "Nexoria issues strikes for violations of Community Standards, including spam, hate speech, bullying, impersonation, or copyright infringement.",
            "1st strike: Warning with no restriction. 2nd-4th strikes: Temporary restriction on posting or live streaming. 5+ strikes: Account suspension review.",
            "If you believe content was removed mistakenly, you can click 'Request Review' directly from your Support Inbox within 14 days."
        ],
        "tips": [
            "Check your Support Inbox regularly to inspect warning reports.",
            "Reviews are generally resolved by our safety team within 24 to 48 hours."
        ],
        "helpful_count": 510,
        "not_helpful_count": 15
    },
    {
        "id": "recover-account",
        "category": "Account & Login",
        "title": "How to recover a hacked, locked, or disabled account",
        "readTime": "4 min read",
        "summary": "Step-by-step instructions to regain access to your account if you suspect a compromise.",
        "content": [
            "If you cannot log in, visit the Login page and click 'Forgot password' to receive a recovery link via your registered email or phone number.",
            "If your email was changed by an attacker, click 'No longer have access to these?' and verify your identity by uploading a government-issued photo ID.",
            "Once approved, a secure reset link will be sent to your newly verified email address."
        ],
        "tips": [
            "Always set up trusted recovery contacts in your security settings.",
            "Never share SMS verification OTPs or login codes with anyone."
        ],
        "helpful_count": 3120,
        "not_helpful_count": 45
    }
]


def get_knowledge_base_articles(query: Optional[str] = None) -> List[Dict[str, Any]]:
    """Search or list knowledge base articles across title, summary, category, content, and tips."""
    if not query or not isinstance(query, str) or not query.strip():
        return KNOWLEDGE_BASE_DATA
    
    q = query.lower().strip()
    return [
        art for art in KNOWLEDGE_BASE_DATA
        if (
            q in art["title"].lower()
            or q in art["summary"].lower()
            or q in art["category"].lower()
            or any(q in p.lower() for p in art.get("content", []))
            or any(q in t.lower() for t in art.get("tips", []))
        )
    ]


def record_article_feedback(article_id: str, is_helpful: bool) -> Dict[str, Any]:
    """Increment helpful / not helpful count for an article."""
    for art in KNOWLEDGE_BASE_DATA:
        if art["id"] == article_id:
            if is_helpful:
                art["helpful_count"] += 1
            else:
                art["not_helpful_count"] += 1
            return {
                "success": True,
                "article_id": article_id,
                "helpful_count": art["helpful_count"],
                "not_helpful_count": art["not_helpful_count"]
            }
    return {"success": False, "error": "Article not found"}
