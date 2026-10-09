from typing import Optional, Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException, Query, status, Body, Response, Request
from sqlalchemy.orm import Session

from database import get_db
from services.admin_service import (
    authenticate_admin_service,
    verify_admin_session_service,
    get_admin_dashboard_metrics,
    get_admin_visitor_analytics,
    get_admin_user_geologins_list,
    get_admin_user_telemetry,
    track_platform_visit_service,
    get_admin_users_list,
    update_user_status_by_admin,
    toggle_user_verification_by_admin,
    delete_user_by_admin,
    admin_reset_user_password,
    admin_adjust_user_stars,
    get_admin_posts_list,
    delete_post_by_admin,
    get_admin_reels_list,
    delete_reel_by_admin,
    get_admin_reports_list,
    action_report_by_admin,
    get_admin_finance_overview,
    admin_process_payout,
    get_admin_support_tickets_list,
    admin_reply_ticket,
    get_admin_bug_reports_list,
    admin_send_broadcast_announcement,
    get_admin_star_purchases_list,
    admin_verify_and_grant_stars,
    user_submit_star_purchase,
    get_admin_bluetick_requests_list,
    get_admin_verified_users_list,
    admin_process_bluetick_request,
    admin_revoke_bluetick,
    user_submit_bluetick_request,
    get_admin_star_cashouts_list,
    admin_process_star_cashout,
    get_user_star_cashouts,
    get_system_settings,
    update_system_settings,
    get_admin_pin_resets_list,
    admin_process_pin_reset_request,
    user_submit_pin_reset_request,
    get_user_pin_reset_status,
    user_complete_pin_reset,
    verify_user_payment_pin,
    get_user_pin_lock_status,
    get_admin_payment_methods_list,
    delete_admin_payment_method,
    user_add_payment_method,
    get_admin_reported_chats_list,
    admin_action_reported_chat,
    get_admin_announcements_list,
    admin_create_announcement,
    admin_delete_announcement,
    get_admin_ads_management_list,
    admin_create_ad_campaign,
    admin_update_ad_status,
    admin_delete_ad_campaign,
    get_admin_deep_analytics,
    export_admin_data_csv,
    get_admin_team_members,
    admin_create_team_member,
    admin_update_team_member,
    admin_delete_team_member,
    get_db_system_settings,
    update_db_system_settings,
    get_all_legal_documents,
    update_legal_document,
    get_admin_audit_logs_list,
    get_admin_login_history_list,
    get_admin_suspicious_activity_list,
    get_admin_blocked_ips_list,
    admin_block_ip_address,
    admin_unblock_ip_address
)

router = APIRouter(prefix="/admin", tags=["Admin Management"])


@router.post("/login")
def admin_login(
    request: Request,
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """Authenticate and authorize Master SuperAdmin / Admin users."""
    identifier = payload.get("identifier") or payload.get("email") or payload.get("username")
    password = payload.get("password")
    master_pin = payload.get("master_pin") or payload.get("pin")

    if not identifier or not password:
        raise HTTPException(status_code=400, detail="Identifier and password are required")

    from routers.auth import get_client_ip
    client_ip = get_client_ip(request)
    user_agent = request.headers.get("user-agent", "Web Browser")

    res = authenticate_admin_service(
        db,
        identifier=str(identifier),
        password=str(password),
        master_pin=str(master_pin) if master_pin else None,
        ip_address=client_ip,
        user_agent=user_agent
    )
    if not res.get("success"):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=res.get("message", "Access Denied: Invalid credentials"))
    return res


@router.get("/verify-session")
def admin_verify_session(token: Optional[str] = Query(None)):
    """Validate admin authorization token."""
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token required")
    res = verify_admin_session_service(token)
    if not res.get("success"):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=res.get("message", "Session expired or invalid"))
    return res


@router.get("/dashboard/metrics")
def get_dashboard_metrics(db: Session = Depends(get_db)):
    """Fetch live KPI metrics across the platform."""
    return get_admin_dashboard_metrics(db)


@router.get("/dashboard/visitors")
def get_dashboard_visitors(db: Session = Depends(get_db)):
    """Fetch real-time visitor counter telemetry, device breakdown, and geo distribution."""
    return get_admin_visitor_analytics(db)


@router.post("/track-visit")
def track_site_visit(
    request: Request,
    payload: Dict[str, Any] = Body(default={}),
    db: Session = Depends(get_db)
):
    """Telemetry hit endpoint to record public and user site visits."""
    from routers.auth import get_client_ip
    client_ip = get_client_ip(request)
    user_agent = request.headers.get("user-agent", "")
    page_path = payload.get("page_path") or "/"
    user_id = payload.get("user_id")
    return track_platform_visit_service(db, ip_address=client_ip, user_agent=user_agent, page_path=page_path, user_id=user_id)


@router.get("/users/login-geolocations")
def get_users_login_geolocations(
    search: Optional[str] = Query(None),
    filter_status: Optional[str] = Query("all"),
    limit: int = Query(100),
    db: Session = Depends(get_db)
):
    """Retrieve full platform user login geolocation history."""
    return get_admin_user_geologins_list(db, search=search, filter_status=filter_status, limit=limit)


@router.get("/users/{user_id}/telemetry")
def get_single_user_telemetry(user_id: int, db: Session = Depends(get_db)):
    """Retrieve deep geolocation footprint and recent logins for a single user."""
    res = get_admin_user_telemetry(db, user_id=user_id)
    if not res.get("success"):
        raise HTTPException(status_code=404, detail=res.get("message", "User not found"))
    return res



@router.get("/users")
def list_admin_users(
    search: Optional[str] = Query(None),
    filter_type: Optional[str] = Query("all"),
    page: Optional[int] = Query(1),
    limit: int = Query(20),
    offset: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    """Search and filter all registered users with pagination."""
    if offset is None:
        p = max(1, page if page else 1)
        offset = (p - 1) * limit
    return get_admin_users_list(db, search=search, filter_type=filter_type, limit=limit, offset=offset)


@router.put("/users/{user_id}/status")
def update_user_status(
    user_id: int,
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """Block, suspend, or unblock a user."""
    is_active = bool(payload.get("is_active", True))
    ban_reason = payload.get("ban_reason")
    res = update_user_status_by_admin(db, user_id=user_id, is_active=is_active, ban_reason=ban_reason)
    if not res.get("success"):
        raise HTTPException(status_code=404, detail=res.get("message"))
    return res


@router.put("/users/{user_id}/verification")
def update_user_verification(
    user_id: int,
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """Grant or revoke Blue Tick verification badge."""
    is_verified = bool(payload.get("is_verified", True))
    res = toggle_user_verification_by_admin(db, user_id=user_id, is_verified=is_verified)
    if not res.get("success"):
        raise HTTPException(status_code=404, detail=res.get("message"))
    return res


@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db)
):
    """Permanently delete user account."""
    res = delete_user_by_admin(db, user_id=user_id)
    if not res.get("success"):
        raise HTTPException(status_code=404, detail=res.get("message"))
    return res


@router.get("/posts")
def list_admin_posts(
    search: Optional[str] = Query(None),
    limit: int = Query(50),
    offset: int = Query(0),
    db: Session = Depends(get_db)
):
    """List posts with AI authenticity scores for moderation."""
    return get_admin_posts_list(db, search=search, limit=limit, offset=offset)


@router.delete("/posts/{post_id}")
def delete_post(
    post_id: int,
    db: Session = Depends(get_db)
):
    """Remove a post from platform."""
    res = delete_post_by_admin(db, post_id=post_id)
    if not res.get("success"):
        raise HTTPException(status_code=404, detail=res.get("message"))
    return res


@router.get("/reels")
def list_admin_reels(
    search: Optional[str] = Query(None),
    limit: int = Query(50),
    offset: int = Query(0),
    db: Session = Depends(get_db)
):
    """List reels for media moderation."""
    return get_admin_reels_list(db, search=search, limit=limit, offset=offset)


@router.delete("/reels/{reel_id}")
def delete_reel(
    reel_id: int,
    db: Session = Depends(get_db)
):
    """Delete a reel."""
    res = delete_reel_by_admin(db, reel_id=reel_id)
    if not res.get("success"):
        raise HTTPException(status_code=404, detail=res.get("message"))
    return res


@router.get("/reports")
def list_admin_reports(db: Session = Depends(get_db)):
    """List reported content and abuse submissions."""
    return get_admin_reports_list(db)


@router.post("/reports/{report_id}/action")
def action_report(
    report_id: int,
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """Execute action on user report."""
    action = str(payload.get("action", "dismiss"))
    notes = payload.get("notes")
    return action_report_by_admin(db, report_id=report_id, action=action, notes=notes)


@router.post("/users/{user_id}/reset-password")
def reset_user_password(
    user_id: int,
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """Admin overrides user password."""
    new_password = payload.get("new_password") or payload.get("password")
    if not new_password or len(str(new_password)) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    res = admin_reset_user_password(db, user_id=user_id, new_password=str(new_password))
    if not res.get("success"):
        raise HTTPException(status_code=404, detail=res.get("message"))
    return res


@router.post("/users/{user_id}/adjust-stars")
def adjust_user_stars(
    user_id: int,
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """Admin grants or deducts stars from user wallet."""
    amount = int(payload.get("amount", 0))
    note = payload.get("note")
    if amount == 0:
        raise HTTPException(status_code=400, detail="Amount cannot be zero")
    return admin_adjust_user_stars(db, user_id=user_id, amount=amount, note=note)


@router.get("/finance/overview")
def get_finance_overview(db: Session = Depends(get_db)):
    """Fetch Stars ledger, creator payouts queue, and revenue share."""
    return get_admin_finance_overview(db)


@router.post("/finance/payout/{payout_id}/action")
def process_payout_action(
    payout_id: str,
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """Approve or Reject creator cashout."""
    action = payload.get("action", "approve")
    notes = payload.get("notes")
    res = admin_process_payout(db, payout_id=payout_id, action=action, notes=notes)
    if not res.get("success"):
        raise HTTPException(status_code=404, detail=res.get("message"))
    return res


@router.get("/support/tickets")
def list_support_tickets(db: Session = Depends(get_db)):
    """Retrieve user inquiries and customer support tickets."""
    return get_admin_support_tickets_list(db)


@router.post("/support/tickets/{ticket_id}/reply")
def reply_support_ticket(
    ticket_id: str,
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """Respond to user ticket and update ticket status."""
    reply_msg = payload.get("message") or payload.get("reply")
    new_status = payload.get("status", "resolved")
    if not reply_msg:
        raise HTTPException(status_code=400, detail="Reply message cannot be empty")
    return admin_reply_ticket(db, ticket_id=ticket_id, reply_message=reply_msg, new_status=new_status)


@router.get("/support/bugs")
def list_bug_reports(db: Session = Depends(get_db)):
    """Fetch user bug reports and crash logs."""
    return get_admin_bug_reports_list(db)


@router.post("/broadcast/send")
def send_broadcast(
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """Publish live global platform announcement."""
    title = payload.get("title", "Platform Notice")
    message = payload.get("message", "")
    broadcast_type = payload.get("type", "info")
    target_group = payload.get("target", "all")
    if not message.strip():
        raise HTTPException(status_code=400, detail="Broadcast message is required")
    return admin_send_broadcast_announcement(db, title=title, message=message, broadcast_type=broadcast_type, target_group=target_group)


# --------------------------------------------------------------------------
# STAR PURCHASE VERIFICATION ENDPOINTS
# --------------------------------------------------------------------------
@router.get("/star-purchases")
def list_star_purchases(
    status: Optional[str] = Query("all"),
    db: Session = Depends(get_db)
):
    """Retrieve user star purchase verification requests."""
    return get_admin_star_purchases_list(db, status_filter=status)


@router.post("/star-purchases/{request_id}/action")
def verify_star_purchase_action(
    request_id: str,
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """Admin approves or rejects Star purchase and credits user wallet."""
    action = payload.get("action", "approve")
    note = payload.get("note")
    res = admin_verify_and_grant_stars(db, request_id=request_id, action=action, note=note)
    if not res.get("success"):
        raise HTTPException(status_code=400, detail=res.get("message"))
    return res


@router.post("/star-purchases/submit")
def submit_star_purchase(
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """User submits a payment transaction for Star pack."""
    user_id = int(payload.get("user_id", 1))
    stars_amount = int(payload.get("stars_amount", 500))
    amount_paid = float(payload.get("amount_paid", 250.0))
    payment_method = payload.get("payment_method", "UPI")
    transaction_ref = payload.get("transaction_ref", "TXN_SAMPLE")
    receipt_url = payload.get("receipt_url")
    return user_submit_star_purchase(
        db,
        user_id=user_id,
        stars_amount=stars_amount,
        amount_paid=amount_paid,
        payment_method=payment_method,
        transaction_ref=transaction_ref,
        receipt_url=receipt_url
    )


# --------------------------------------------------------------------------
# BLUE TICK VERIFICATION & PURCHASES ENDPOINTS
# --------------------------------------------------------------------------
@router.get("/bluetick/requests")
def list_bluetick_requests(
    status: Optional[str] = Query("all"),
    db: Session = Depends(get_db)
):
    """Retrieve all Blue Tick verification applications."""
    return get_admin_bluetick_requests_list(db, status_filter=status)


@router.get("/bluetick/verified-users")
def list_verified_users(db: Session = Depends(get_db)):
    """Retrieve all users currently holding the Blue Tick badge."""
    return get_admin_verified_users_list(db)


@router.post("/bluetick/requests/{request_id}/action")
def process_bluetick_action(
    request_id: str,
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """Approve or Reject Blue Tick verification request."""
    action = payload.get("action", "approve")
    note = payload.get("note")
    res = admin_process_bluetick_request(db, request_id=request_id, action=action, note=note)
    if not res.get("success"):
        raise HTTPException(status_code=400, detail=res.get("message"))
    return res


@router.post("/bluetick/revoke/{user_id}")
def revoke_bluetick(user_id: int, db: Session = Depends(get_db)):
    """Revoke Blue Tick badge from user."""
    res = admin_revoke_bluetick(db, user_id=user_id)
    if not res.get("success"):
        raise HTTPException(status_code=404, detail=res.get("message"))
    return res


@router.post("/bluetick/submit")
def submit_bluetick_application(
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """User applies for Blue Tick Verification."""
    user_id = int(payload.get("user_id", 1))
    full_name = payload.get("full_name", "Creator")
    category = payload.get("category", "Creator")
    id_document_type = payload.get("id_document_type", "Aadhaar Card")
    id_document_url = payload.get("id_document_url")
    payment_ref = payload.get("payment_ref")
    amount_paid = float(payload.get("amount_paid", 499.0))
    return user_submit_bluetick_request(
        db,
        user_id=user_id,
        full_name=full_name,
        category=category,
        id_document_type=id_document_type,
        id_document_url=id_document_url,
        payment_ref=payment_ref,
        amount_paid=amount_paid
    )


# --------------------------------------------------------------------------
# STAR TO RUPEE (INR) CASHOUT / REDEMPTION ENDPOINTS
# --------------------------------------------------------------------------
@router.get("/star-cashouts")
def get_star_cashouts(
    status: Optional[str] = Query("all"),
    db: Session = Depends(get_db)
):
    """Retrieve list of user Star-to-Rupee cashout requests."""
    return get_admin_star_cashouts_list(db, status_filter=status)


@router.post("/star-cashouts/{request_id}/action")
def process_star_cashout(
    request_id: int,
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """Admin verifies payout transfer to user's UPI/Bank, and approves or rejects."""
    action = payload.get("action", "approve")  # approve, pay, reject
    payout_ref = payload.get("payout_ref")
    note = payload.get("note")
    res = admin_process_star_cashout(db, request_id=request_id, action=action, payout_ref=payout_ref, note=note)
    if not res.get("success"):
        raise HTTPException(status_code=400, detail=res.get("message"))
    return res


@router.post("/star-cashouts/submit")
def submit_star_cashout_request(
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """User submits a request to convert their Stars to INR."""
    user_id = int(payload.get("user_id", 1))
    stars_amount = int(payload.get("stars_amount", 0))
    conversion_rate = float(payload.get("conversion_rate", 0.50))
    payout_method = payload.get("payout_method", "UPI")
    upi_id = payload.get("upi_id")
    bank_name = payload.get("bank_name")
    account_number = payload.get("account_number")
    ifsc_code = payload.get("ifsc_code")
    account_holder_name = payload.get("account_holder_name")
    phone_number = payload.get("phone_number")

    res = user_submit_star_cashout(
        db,
        user_id=user_id,
        stars_amount=stars_amount,
        conversion_rate=conversion_rate,
        payout_method=payout_method,
        upi_id=upi_id,
        bank_name=bank_name,
        account_number=account_number,
        ifsc_code=ifsc_code,
        account_holder_name=account_holder_name,
        phone_number=phone_number
    )
    if not res.get("success"):
        raise HTTPException(status_code=400, detail=res.get("message"))
    return res


@router.get("/star-cashouts/user/{user_id}")
def get_user_cashout_history(
    user_id: int,
    db: Session = Depends(get_db)
):
    """Get cashout history for specific user."""
    return get_user_star_cashouts(db, user_id=user_id)


@router.get("/settings")
def get_settings():
    """Retrieve platform configuration settings."""
    return get_system_settings()


@router.put("/settings")
def update_settings(payload: Dict[str, Any] = Body(...)):
    """Update platform configuration settings."""
    return update_system_settings(payload)


# --------------------------------------------------------------------------
# 🔐 4-DIGIT PAYMENT PIN RESET / FORGOT PIN VERIFICATION ENDPOINTS
# --------------------------------------------------------------------------
@router.get("/pin-resets")
def get_pin_resets(
    status: Optional[str] = Query("all"),
    db: Session = Depends(get_db)
):
    """Retrieve list of user 4-Digit Security PIN reset requests for Admin review."""
    return get_admin_pin_resets_list(db, status_filter=status)


@router.post("/pin-resets/{request_id}/action")
def process_pin_reset_action(
    request_id: int,
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """SuperAdmin approves or rejects a user PIN reset verification request."""
    action = payload.get("action", "approve")
    note = payload.get("note")
    res = admin_process_pin_reset_request(db, request_id=request_id, action=action, note=note)
    if not res.get("success"):
        raise HTTPException(status_code=400, detail=res.get("message"))
    return res


@router.post("/pin-resets/submit")
def submit_pin_reset_request(
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """User submits a request to reset forgotten 4-digit PIN."""
    user_id = int(payload.get("user_id", 1))
    reason = payload.get("reason")
    phone = payload.get("phone")
    res = user_submit_pin_reset_request(db, user_id=user_id, reason=reason, phone=phone)
    if not res.get("success"):
        raise HTTPException(status_code=400, detail=res.get("message"))
    return res


@router.get("/pin-resets/user-status/{user_id}")
def get_user_pin_status(
    user_id: int,
    db: Session = Depends(get_db)
):
    """Check if user has an active, pending, or approved PIN reset request."""
    return get_user_pin_reset_status(db, user_id=user_id)


@router.post("/pin-resets/complete-reset")
def complete_pin_reset(
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """User sets a new PIN after Admin verification approval."""
    user_id = int(payload.get("user_id", 1))
    new_pin = str(payload.get("new_pin", "")).strip()
    request_id = payload.get("request_id")
    if request_id:
        try:
            request_id = int(request_id)
        except Exception:
            request_id = None
    res = user_complete_pin_reset(db, user_id=user_id, new_pin=new_pin, request_id=request_id)
    if not res.get("success"):
        raise HTTPException(status_code=400, detail=res.get("message"))
    return res


@router.post("/pin-resets/verify-pin")
def verify_payment_pin_endpoint(
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """
    Verify payment PIN. If 5 consecutive failed attempts occur,
    locks payment access for 2 days (48 hours).
    Automatically unlocks when 2 days elapse.
    """
    user_id = int(payload.get("user_id", 1))
    pin = str(payload.get("pin", "")).strip()
    if not pin or len(pin) != 4 or not pin.isdigit():
        raise HTTPException(status_code=400, detail="PIN must be exactly 4 numeric digits")
    return verify_user_payment_pin(db, user_id=user_id, pin=pin)


@router.get("/pin-resets/lock-status/{user_id}")
def get_payment_pin_lock_status_endpoint(
    user_id: int,
    db: Session = Depends(get_db)
):
    """Check 2-day payment lock status for user."""
    return get_user_pin_lock_status(db, user_id=user_id)


# --------------------------------------------------------------------------
# 💳 USER PAYMENT METHODS & VAULT AUDIT ENDPOINTS
# --------------------------------------------------------------------------
@router.get("/payment-methods")
def list_admin_payment_methods(
    type: Optional[str] = Query("all"),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Retrieve saved user payment methods (Cards, UPI, Bank Accounts) for Admin inspection."""
    return get_admin_payment_methods_list(db, type_filter=type, search=search)


@router.delete("/payment-methods/{method_id}")
def delete_admin_payment_method_endpoint(
    method_id: int,
    db: Session = Depends(get_db)
):
    """Admin revokes / removes a payment method from user vault."""
    return delete_admin_payment_method(db, method_id=method_id)


@router.post("/payment-methods/add-user-method")
def add_user_payment_method_endpoint(
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """Save a user payment method to vault."""
    user_id = int(payload.get("user_id", 1))
    return user_add_payment_method(db, user_id=user_id, payload=payload)


# --------------------------------------------------------------------------
# 💬 CHAT & MESSAGES MODERATION ENDPOINTS
# --------------------------------------------------------------------------
@router.get("/chats/reported")
def list_reported_chats(
    status: Optional[str] = Query("all"),
    db: Session = Depends(get_db)
):
    """Retrieve reported chats for moderator inspection."""
    return get_admin_reported_chats_list(db, status_filter=status)


@router.post("/chats/reported/{report_id}/action")
def action_reported_chat_endpoint(
    report_id: int,
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """Moderator executes action (dismiss, delete_message, restrict_chat_24h, restrict_chat_permanent, unrestrict_chat, ban_user)."""
    action = payload.get("action", "dismiss")
    note = payload.get("note")
    admin_name = payload.get("admin_name", "Super Admin")
    res = admin_action_reported_chat(db, report_id=report_id, action=action, note=note, admin_name=admin_name)
    if not res.get("success"):
        raise HTTPException(status_code=400, detail=res.get("message"))
    return res


# --------------------------------------------------------------------------
# 🔔 NOTIFICATIONS & ANNOUNCEMENTS ENDPOINTS
# --------------------------------------------------------------------------
@router.get("/announcements")
def list_announcements(db: Session = Depends(get_db)):
    """Retrieve all platform announcements and scheduled notifications."""
    return get_admin_announcements_list(db)


@router.post("/announcements")
def create_announcement_endpoint(
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """Broadcast or schedule platform announcement."""
    admin_name = payload.get("admin_name", "Super Admin")
    res = admin_create_announcement(db, payload=payload, admin_name=admin_name)
    if not res.get("success"):
        raise HTTPException(status_code=400, detail=res.get("message"))
    return res


@router.delete("/announcements/{announcement_id}")
def delete_announcement_endpoint(
    announcement_id: int,
    admin_name: Optional[str] = Query("Super Admin"),
    db: Session = Depends(get_db)
):
    """Delete an announcement."""
    return admin_delete_announcement(db, announcement_id=announcement_id, admin_name=admin_name)


# --------------------------------------------------------------------------
# 📊 ADS & SPONSORED PROMOTIONS ENDPOINTS
# --------------------------------------------------------------------------
@router.get("/ads")
def list_admin_ads(
    status: Optional[str] = Query("all"),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Retrieve all ad campaigns with KPIs and live telemetry."""
    return get_admin_ads_management_list(db, status_filter=status, search=search)


@router.post("/ads")
def create_ad_campaign_endpoint(
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """Create a new ad campaign."""
    admin_name = payload.get("admin_name", "Super Admin")
    res = admin_create_ad_campaign(db, payload=payload, admin_name=admin_name)
    if not res.get("success"):
        raise HTTPException(status_code=400, detail=res.get("message"))
    return res


@router.post("/ads/{ad_id}/status")
def update_ad_status_endpoint(
    ad_id: int,
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """Pause, resume, approve, or reject an ad campaign."""
    action = payload.get("action", "pause")
    admin_name = payload.get("admin_name", "Super Admin")
    res = admin_update_ad_status(db, ad_id=ad_id, action=action, admin_name=admin_name)
    if not res.get("success"):
        raise HTTPException(status_code=400, detail=res.get("message"))
    return res


@router.delete("/ads/{ad_id}")
def delete_ad_endpoint(
    ad_id: int,
    admin_name: Optional[str] = Query("Super Admin"),
    db: Session = Depends(get_db)
):
    """Delete an ad campaign."""
    return admin_delete_ad_campaign(db, ad_id=ad_id, admin_name=admin_name)


# --------------------------------------------------------------------------
# 📈 DEEP ANALYTICS & CSV EXPORT ENDPOINTS
# --------------------------------------------------------------------------
@router.get("/analytics/deep")
def get_platform_deep_analytics(db: Session = Depends(get_db)):
    """Retrieve comprehensive user growth, retention, active users, and device breakdown."""
    return get_admin_deep_analytics(db)


@router.get("/analytics/export/{entity_type}")
def export_platform_data_csv(
    entity_type: str,
    db: Session = Depends(get_db)
):
    """Export database records (users, transactions, audit_logs, ads) as CSV."""
    valid_types = ["users", "transactions", "audit_logs", "ads"]
    if entity_type not in valid_types:
        raise HTTPException(status_code=400, detail=f"Invalid export entity. Must be one of: {', '.join(valid_types)}")
    csv_data = export_admin_data_csv(db, entity_type=entity_type)
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=nexoria_{entity_type}_export.csv"}
    )


# --------------------------------------------------------------------------
# ⚙️ RBAC ADMIN ROLES & TEAM MANAGEMENT ENDPOINTS
# --------------------------------------------------------------------------
@router.get("/roles/team")
def get_team_members_list(db: Session = Depends(get_db)):
    """Retrieve all staff accounts and roles."""
    return get_admin_team_members(db)


@router.post("/roles/team")
def create_team_member_endpoint(
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """Add a new staff member (Moderator, Support, SuperAdmin)."""
    admin_name = payload.get("admin_name", "Super Admin")
    res = admin_create_team_member(db, payload=payload, admin_name=admin_name)
    if not res.get("success"):
        raise HTTPException(status_code=400, detail=res.get("message"))
    return res


@router.put("/roles/team/{member_id}")
def update_team_member_endpoint(
    member_id: int,
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """Update team member role or permissions."""
    admin_name = payload.get("admin_name", "Super Admin")
    res = admin_update_team_member(db, member_id=member_id, payload=payload, admin_name=admin_name)
    if not res.get("success"):
        raise HTTPException(status_code=400, detail=res.get("message"))
    return res


@router.delete("/roles/team/{member_id}")
def delete_team_member_endpoint(
    member_id: int,
    admin_name: Optional[str] = Query("Super Admin"),
    db: Session = Depends(get_db)
):
    """Delete a staff member account."""
    return admin_delete_team_member(db, member_id=member_id, admin_name=admin_name)


# --------------------------------------------------------------------------
# 📜 DYNAMIC LEGAL DOCUMENTS & FAQ ENDPOINTS
# --------------------------------------------------------------------------
@router.get("/legal/documents")
def get_legal_documents_endpoint(db: Session = Depends(get_db)):
    """Retrieve all dynamic legal policies, guidelines, and FAQ."""
    return get_all_legal_documents(db)


@router.post("/legal/documents/{slug}")
def update_legal_document_endpoint(
    slug: str,
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """Update privacy policy, terms, or FAQ markdown."""
    title = payload.get("title", slug.replace("_", " ").title())
    content = payload.get("content_markdown", "")
    admin_name = payload.get("admin_name", "Super Admin")
    return update_legal_document(db, slug=slug, title=title, content_markdown=content, admin_name=admin_name)


# --------------------------------------------------------------------------
# 🛡️ SECURITY AUDIT TRAIL, LOGIN HISTORY & FIREWALL IP BLOCKING
# --------------------------------------------------------------------------
@router.get("/security/audit-logs")
def list_audit_logs(
    filter_type: Optional[str] = Query("all"),
    search: Optional[str] = Query(None),
    limit: int = Query(50),
    db: Session = Depends(get_db)
):
    """Retrieve immutable admin audit logs."""
    return get_admin_audit_logs_list(db, action_filter=filter_type, search=search, limit=limit)


@router.get("/security/login-history")
def list_login_history(db: Session = Depends(get_db)):
    """Retrieve admin login attempt history."""
    return get_admin_login_history_list(db)


@router.get("/security/suspicious")
def list_suspicious_activity(db: Session = Depends(get_db)):
    """Retrieve suspicious logins, brute force bots, and locked users."""
    return get_admin_suspicious_activity_list(db)


@router.get("/security/blocked-ips")
def list_blocked_ips(db: Session = Depends(get_db)):
    """Retrieve list of blacklisted firewall IPs."""
    return get_admin_blocked_ips_list(db)


@router.post("/security/blocked-ips")
def block_ip_endpoint(
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """Blacklist an IP address."""
    ip_address = str(payload.get("ip_address", "")).strip()
    reason = str(payload.get("reason", "Malicious activity")).strip()
    admin_name = payload.get("admin_name", "Super Admin")
    if not ip_address:
        raise HTTPException(status_code=400, detail="IP Address is required")
    return admin_block_ip_address(db, ip_address=ip_address, reason=reason, admin_name=admin_name)


@router.delete("/security/blocked-ips/{ip_id}")
def unblock_ip_endpoint(
    ip_id: int,
    admin_name: Optional[str] = Query("Super Admin"),
    db: Session = Depends(get_db)
):
    """Remove an IP address from blacklist."""
    return admin_unblock_ip_address(db, ip_id=ip_id, admin_name=admin_name)




