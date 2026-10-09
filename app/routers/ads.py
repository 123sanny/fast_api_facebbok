from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status, Request
from sqlalchemy.orm import Session

from database import get_db
from models.user import User
from models.session import UserSession
from schemas.ads import (
    AdActivityResponse,
    AdCreateRequest,
    AdInteractionRequest,
    AdHideRequest,
    AdPreferencesOut,
    AdPreferencesUpdate
)
from services.ad_service import (
    get_user_ad_activity_service,
    track_ad_interaction_service,
    toggle_save_ad_service,
    hide_or_report_ad_service,
    create_ad_campaign_service,
    get_ad_preferences_service,
    update_ad_preferences_service,
    block_advertiser_service,
    unblock_advertiser_service,
    get_blocked_advertisers_service
)

router = APIRouter(prefix="/ads", tags=["Ad Activity & Preferences"])


def resolve_uid(request: Request, user_id: Optional[int], db: Session) -> int:
    """Helper to extract active user id from query -> header -> token -> fallback."""
    if user_id:
        return user_id
    header_uid = request.headers.get("x-user-id")
    if header_uid and header_uid.isdigit():
        return int(header_uid)
    auth_h = request.headers.get("authorization")
    if auth_h and auth_h.startswith("Bearer "):
        token = auth_h.split(" ")[1]
        sess = db.query(UserSession).filter(UserSession.access_token == token).first()
        if sess:
            return sess.user_id
    first_user = db.query(User).first()
    return first_user.id if first_user else 1


@router.get("/activity", response_model=AdActivityResponse)
def get_ad_activity(
    request: Request,
    user_id: Optional[int] = Query(None),
    tab: str = Query("recent"),
    search: str = Query(""),
    db: Session = Depends(get_db)
):
    """
    Fetch user's live ad activity (recent interacted ads or saved ads) with search filter.
    """
    uid = resolve_uid(request, user_id, db)
    return get_user_ad_activity_service(
        db=db,
        user_id=uid,
        tab=tab.lower(),
        search=search
    )


@router.post("/interact")
def track_ad_interaction(
    data: AdInteractionRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Record user click or interaction with an ad.
    """
    uid = resolve_uid(request, data.user_id, db)
    return track_ad_interaction_service(
        db=db,
        user_id=uid,
        ad_id=data.ad_id,
        interaction_type=data.interaction_type or "clicked"
    )


@router.post("/{ad_id}/save")
def toggle_save_ad(
    ad_id: int,
    request: Request,
    user_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Toggle save / bookmark on an ad.
    """
    uid = resolve_uid(request, user_id, db)
    return toggle_save_ad_service(
        db=db,
        user_id=uid,
        ad_id=ad_id
    )


@router.post("/{ad_id}/hide")
def hide_or_report_ad(
    ad_id: int,
    data: AdHideRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Hide an ad or submit feedback on advertiser.
    """
    uid = resolve_uid(request, data.user_id, db)
    return hide_or_report_ad_service(
        db=db,
        user_id=uid,
        ad_id=ad_id,
        reason=data.reason or "irrelevant",
        feedback_text=data.feedback_text
    )


@router.post("/create", status_code=status.HTTP_201_CREATED)
def create_ad_campaign(
    data: AdCreateRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Create a new sponsored advertiser campaign.
    """
    uid = resolve_uid(request, data.user_id, db)
    return create_ad_campaign_service(
        db=db,
        user_id=uid,
        brand_name=data.brand_name,
        headline=data.headline,
        description=data.description,
        media_url=data.media_url,
        logo_url=data.logo_url,
        target_url=data.target_url or "https://nexoria.io",
        category=data.category or "Technology",
        call_to_action=data.call_to_action or "Learn More"
    )


@router.get("/preferences", response_model=AdPreferencesOut)
def get_ad_preferences(
    request: Request,
    user_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Fetch user ad personalization settings and topic interests.
    """
    uid = resolve_uid(request, user_id, db)
    return get_ad_preferences_service(db=db, user_id=uid)


@router.put("/preferences", response_model=AdPreferencesOut)
def update_ad_preferences(
    data: AdPreferencesUpdate,
    request: Request,
    user_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Update ad personalization settings and toggle topic interests.
    """
    uid = resolve_uid(request, user_id, db)
    return update_ad_preferences_service(
        db=db,
        user_id=uid,
        personalized_ads=data.personalized_ads,
        topics=data.topics
    )


# =====================================================================
# ADVERTISER & BRAND BLOCKING ENDPOINTS
# =====================================================================
@router.post("/block")
def block_advertiser(
    payload: dict,
    request: Request,
    user_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Block an advertiser/brand permanently.
    """
    uid = resolve_uid(request, payload.get("user_id") or user_id, db)
    brand_name = payload.get("brand_name")
    if not brand_name:
        raise HTTPException(status_code=400, detail="Brand name is required.")
    return block_advertiser_service(
        db=db,
        user_id=uid,
        brand_name=brand_name,
        ad_id=payload.get("ad_id"),
        reason=payload.get("reason", "Blocked by user")
    )


@router.get("/blocked")
def list_blocked_advertisers(
    request: Request,
    user_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    """
    List all blocked advertisers for the active user.
    """
    uid = resolve_uid(request, user_id, db)
    return get_blocked_advertisers_service(db=db, user_id=uid)


@router.delete("/blocked/{brand_name}")
def unblock_advertiser(
    brand_name: str,
    request: Request,
    user_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Unblock an advertiser/brand.
    """
    uid = resolve_uid(request, user_id, db)
    return unblock_advertiser_service(db=db, user_id=uid, brand_name=brand_name)

