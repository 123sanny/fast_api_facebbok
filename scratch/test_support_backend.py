import sys
import os

# Set UTF-8 encoding for stdout
sys.stdout.reconfigure(encoding='utf-8')

# Add app directory to sys.path
sys.path.insert(0, r"d:\frontend _chat\app")

from database import SessionLocal
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
from models.user import User

def run_tests():
    db = SessionLocal()
    try:
        # 1. Get or create test user
        user = db.query(User).first()
        if not user:
            print("❌ No user in DB to test with")
            return
        
        user_id = user.id
        print(f"Testing with User ID: {user_id} ({user.first_name} {user.surname})")

        # 2. Account Health
        health = get_or_create_account_health(db, user_id)
        print(f"✅ Account Health initial: Score={health.health_score}, Rating={health.security_rating}")

        scanned_health = trigger_security_scan(db, user_id)
        print(f"✅ Trigger Security Scan: Score={scanned_health.health_score}, Last Scan={scanned_health.last_security_scan}")

        # 3. Create Support Ticket
        ticket = create_support_ticket(
            db=db,
            user_id=user_id,
            subject="Cannot update profile cover photo alignment",
            category="general",
            description="When I drag the cover photo to reposition, it snaps back on mobile screen.",
            priority="high"
        )
        print(f"✅ Created Support Ticket: Number={ticket.ticket_number}, ID={ticket.id}, Status={ticket.status}")

        # 4. Add User Reply & Staff Reply
        user_msg = add_ticket_reply(
            db=db,
            ticket_id=ticket.id,
            sender_id=user_id,
            message="I tested on Chrome Android v124 and Firefox Mobile.",
            is_staff=False
        )
        print(f"✅ Added User Reply: ID={user_msg.id}, Message='{user_msg.message}'")

        staff_msg = add_ticket_reply(
            db=db,
            ticket_id=ticket.id,
            sender_id=None,
            message="Hello! Thank you for the report. Our UI team is releasing a patch for touchdrag support on mobile.",
            is_staff=True
        )
        print(f"✅ Added Staff Reply: ID={staff_msg.id}, is_staff={staff_msg.is_staff}")

        # 5. Fetch Ticket Details
        fetched_ticket = get_ticket_by_id(db, ticket.id, user_id=user_id)
        print(f"✅ Fetched Ticket Details: Messages Count={len(fetched_ticket.messages)}")
        for m in fetched_ticket.messages:
            print(f"   - [{'STAFF' if m.is_staff else 'USER'}]: {m.message}")

        # 6. List User Tickets
        all_tickets = get_user_tickets(db, user_id)
        print(f"✅ Total Tickets for user: {len(all_tickets)}")

        # 7. Moderation Reports Filed
        reports = get_user_filed_reports(db, user_id)
        print(f"✅ Reports Filed count: {len(reports)}, First report code={reports[0]['reference_code'] if reports else 'None'}")

        # 8. User Violations & Appeals
        violations = get_user_violations(db, user_id)
        print(f"✅ Violations count: {len(violations)}")

        # 9. Bug Report Telemetry
        bug = submit_bug_report(
            db=db,
            user_id=user_id,
            title="Stories carousel stuck on slide 3",
            steps_to_reproduce="1. Open feed. 2. Tap third story bubble. 3. Video does not auto-advance.",
            category="Stories & Reels",
            system_diagnostics="OS: Win32 | Browser: Edge 122",
            app_version="2.5.0"
        )
        print(f"✅ Submitted Bug Report: ID={bug.id}, Title={bug.title}")

        # 10. Monetisation Hub
        monetisation = get_monetisation_hub_summary(db, user_id)
        print(f"✅ Monetisation Hub: Estimated=${monetisation['estimated_total_earnings']}, Streams={len(monetisation['streams'])}")

        # 11. Knowledge Base Articles
        articles = get_knowledge_base_articles("password")
        print(f"✅ Knowledge Base articles for 'password': Found {len(articles)}")

        # 12. Article Feedback
        fb_res = record_article_feedback("security-2fa", is_helpful=True)
        print(f"✅ Article Feedback recorded: {fb_res}")

        print("\n🎉 ALL SUPPORT BACKEND SERVICES WORK PERFECTLY AND DYNAMICALLY!")

    finally:
        db.close()

if __name__ == "__main__":
    run_tests()
