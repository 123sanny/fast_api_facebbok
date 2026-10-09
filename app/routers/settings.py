import datetime
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Request, Query, Body
from sqlalchemy.orm import Session

from database import get_db
from models.user import User
from models.settings import PrivacySettings, UserSettings, FamilySupervision
from models.security import SecurityAuditLog
from models.session import UserSession

router = APIRouter(prefix="/settings", tags=["Settings, Privacy & Family Centre"])


def resolve_uid(request: Request, user_id: Optional[int] = None, db: Optional[Session] = None) -> int:
    """Resolve current user ID with fallbacks."""
    if user_id:
        return int(user_id)
    header_uid = request.headers.get("x-user-id")
    if header_uid:
        try:
            return int(header_uid)
        except ValueError:
            pass
    auth_header = request.headers.get("authorization")
    if auth_header and auth_header.startswith("Bearer ") and db:
        token = auth_header.split(" ")[1]
        session = db.query(UserSession).filter(UserSession.access_token == token).first()
        if session:
            return session.user_id
    return 1


def get_or_create_privacy(db: Session, user_id: int) -> PrivacySettings:
    """Fetch or initialize PrivacySettings row in database."""
    ps = db.query(PrivacySettings).filter(PrivacySettings.user_id == user_id).first()
    if not ps:
        ps = PrivacySettings(
            user_id=user_id,
            profile_visibility="public",
            friend_list_visible=True,
            posts_default="friends",
            profile_locked=False,
            active_status=True,
            who_can_see_posts="Public",
            who_can_see_friends="public",
            who_can_send_requests="everyone",
            who_can_post_on_profile="friends",
            who_can_follow="public",
            review_tags=True,
            reactions_hide_others=False,
            reactions_hide_own=False,
            sensitive_content="standard",
            search_engine_indexing=True,
            privacy_checkup_completed=False
        )
        db.add(ps)
        db.commit()
        db.refresh(ps)
    return ps


def get_or_create_user_settings(db: Session, user_id: int) -> UserSettings:
    """Fetch or initialize UserSettings row in database."""
    us = db.query(UserSettings).filter(UserSettings.user_id == user_id).first()
    if not us:
        us = UserSettings(
            user_id=user_id,
            dark_mode=False,
            language="en",
            privacy_level="public",
            video_autoplay="wifi_cellular",
            data_saver=False,
            hd_uploads=True,
            spatial_audio=True,
            noise_cancellation=True,
            audio_quality="high",
            early_access=True,
            camera_suggestions=True,
            whatsapp_linked=False
        )
        db.add(us)
        db.commit()
        db.refresh(us)
    return us


# =====================================================================
# 1. PRIVACY SETTINGS & AUDIENCE ENDPOINTS
# =====================================================================
@router.get("/privacy")
def get_privacy_settings(
    request: Request,
    user_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    """Fetch complete user privacy settings from database."""
    uid = resolve_uid(request, user_id, db)
    ps = get_or_create_privacy(db, uid)
    return {
        "success": True,
        "user_id": uid,
        "profile_locked": ps.profile_locked,
        "active_status": ps.active_status,
        "who_can_see_posts": ps.who_can_see_posts or "Public",
        "who_can_see_friends": ps.who_can_see_friends or "public",
        "who_can_send_requests": ps.who_can_send_requests or "everyone",
        "who_can_post_on_profile": ps.who_can_post_on_profile or "friends",
        "who_can_follow": ps.who_can_follow or "public",
        "review_tags": ps.review_tags if ps.review_tags is not None else True,
        "reactions_hide_others": ps.reactions_hide_others or False,
        "reactions_hide_own": ps.reactions_hide_own or False,
        "sensitive_content": ps.sensitive_content or "standard",
        "search_engine_indexing": ps.search_engine_indexing if ps.search_engine_indexing is not None else True,
        "privacy_checkup_completed": ps.privacy_checkup_completed or False,
        "updated_at": ps.updated_at.isoformat() if ps.updated_at else None
    }


@router.put("/privacy")
def update_privacy_settings(
    payload: Dict[str, Any],
    request: Request,
    user_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    """Update user privacy settings in database."""
    uid = resolve_uid(request, payload.get("user_id") or user_id, db)
    ps = get_or_create_privacy(db, uid)

    if "profile_locked" in payload:
        ps.profile_locked = bool(payload["profile_locked"])
    if "active_status" in payload:
        ps.active_status = bool(payload["active_status"])
    if "who_can_see_posts" in payload:
        ps.who_can_see_posts = str(payload["who_can_see_posts"])
    if "who_can_see_friends" in payload:
        ps.who_can_see_friends = str(payload["who_can_see_friends"])
    if "who_can_send_requests" in payload:
        ps.who_can_send_requests = str(payload["who_can_send_requests"])
    if "who_can_post_on_profile" in payload:
        ps.who_can_post_on_profile = str(payload["who_can_post_on_profile"])
    if "who_can_follow" in payload:
        ps.who_can_follow = str(payload["who_can_follow"])
    if "review_tags" in payload:
        ps.review_tags = bool(payload["review_tags"])
    if "reactions_hide_others" in payload:
        ps.reactions_hide_others = bool(payload["reactions_hide_others"])
    if "reactions_hide_own" in payload:
        ps.reactions_hide_own = bool(payload["reactions_hide_own"])
    if "sensitive_content" in payload:
        ps.sensitive_content = str(payload["sensitive_content"])
    if "search_engine_indexing" in payload:
        ps.search_engine_indexing = bool(payload["search_engine_indexing"])
    if "privacy_checkup_completed" in payload:
        ps.privacy_checkup_completed = bool(payload["privacy_checkup_completed"])

    ps.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(ps)

    return {
        "success": True,
        "message": "Privacy settings updated successfully!",
        "data": {
            "profile_locked": ps.profile_locked,
            "active_status": ps.active_status,
            "who_can_see_posts": ps.who_can_see_posts,
            "who_can_see_friends": ps.who_can_see_friends,
            "who_can_send_requests": ps.who_can_send_requests,
            "who_can_post_on_profile": ps.who_can_post_on_profile,
            "who_can_follow": ps.who_can_follow,
            "review_tags": ps.review_tags,
            "reactions_hide_others": ps.reactions_hide_others,
            "reactions_hide_own": ps.reactions_hide_own,
            "sensitive_content": ps.sensitive_content
        }
    }


# =====================================================================
# 2. MEDIA, AUDIO & FEATURE PREFERENCES
# =====================================================================
@router.get("/preferences")
def get_user_preferences(
    request: Request,
    user_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    """Fetch user media, audio and app preferences."""
    uid = resolve_uid(request, user_id, db)
    us = get_or_create_user_settings(db, uid)
    return {
        "success": True,
        "user_id": uid,
        "video_autoplay": us.video_autoplay or "wifi_cellular",
        "data_saver": us.data_saver or False,
        "hd_uploads": us.hd_uploads if us.hd_uploads is not None else True,
        "spatial_audio": us.spatial_audio if us.spatial_audio is not None else True,
        "noise_cancellation": us.noise_cancellation if us.noise_cancellation is not None else True,
        "audio_quality": us.audio_quality or "high",
        "early_access": us.early_access if us.early_access is not None else True,
        "camera_suggestions": us.camera_suggestions if us.camera_suggestions is not None else True,
        "whatsapp_linked": us.whatsapp_linked or False,
        "whatsapp_number": us.whatsapp_number or "",
        "updated_at": us.updated_at.isoformat() if us.updated_at else None
    }


@router.put("/preferences")
def update_user_preferences(
    payload: Dict[str, Any],
    request: Request,
    user_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    """Update user media, audio and app preferences."""
    uid = resolve_uid(request, payload.get("user_id") or user_id, db)
    us = get_or_create_user_settings(db, uid)

    if "video_autoplay" in payload:
        us.video_autoplay = str(payload["video_autoplay"])
    if "data_saver" in payload:
        us.data_saver = bool(payload["data_saver"])
    if "hd_uploads" in payload:
        us.hd_uploads = bool(payload["hd_uploads"])
    if "spatial_audio" in payload:
        us.spatial_audio = bool(payload["spatial_audio"])
    if "noise_cancellation" in payload:
        us.noise_cancellation = bool(payload["noise_cancellation"])
    if "audio_quality" in payload:
        us.audio_quality = str(payload["audio_quality"])
    if "early_access" in payload:
        us.early_access = bool(payload["early_access"])
    if "camera_suggestions" in payload:
        us.camera_suggestions = bool(payload["camera_suggestions"])
    if "whatsapp_linked" in payload:
        us.whatsapp_linked = bool(payload["whatsapp_linked"])
    if "whatsapp_number" in payload:
        us.whatsapp_number = str(payload["whatsapp_number"])

    us.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(us)

    return {
        "success": True,
        "message": "Preferences updated successfully!",
        "data": {
            "video_autoplay": us.video_autoplay,
            "data_saver": us.data_saver,
            "hd_uploads": us.hd_uploads,
            "spatial_audio": us.spatial_audio,
            "noise_cancellation": us.noise_cancellation,
            "audio_quality": us.audio_quality,
            "early_access": us.early_access,
            "camera_suggestions": us.camera_suggestions,
            "whatsapp_linked": us.whatsapp_linked,
            "whatsapp_number": us.whatsapp_number
        }
    }


# =====================================================================
# 3. PRIVACY CHECKUP WIZARD SUBMISSION
# =====================================================================
@router.post("/privacy-checkup/complete")
def complete_privacy_checkup(
    payload: Dict[str, Any],
    request: Request,
    user_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    """Complete privacy checkup wizard and save all configured privacy settings."""
    uid = resolve_uid(request, payload.get("user_id") or user_id, db)
    ps = get_or_create_privacy(db, uid)

    if "who_can_see_posts" in payload:
        ps.who_can_see_posts = str(payload["who_can_see_posts"])
    if "who_can_see_friends" in payload:
        ps.who_can_see_friends = str(payload["who_can_see_friends"])
    if "who_can_send_requests" in payload:
        ps.who_can_send_requests = str(payload["who_can_send_requests"])
    if "profile_locked" in payload:
        ps.profile_locked = bool(payload["profile_locked"])
    if "search_engine_indexing" in payload:
        ps.search_engine_indexing = bool(payload["search_engine_indexing"])

    ps.privacy_checkup_completed = True
    ps.updated_at = datetime.datetime.utcnow()

    db.add(SecurityAuditLog(
        user_id=uid,
        event_type="privacy_checkup_completed",
        severity="info",
        details="User completed 4-step Privacy Checkup Wizard"
    ))

    db.commit()
    return {
        "success": True,
        "message": "Privacy checkup completed and settings saved to database!"
    }


# =====================================================================
# 4. FAMILY CENTRE & SUPERVISION SYSTEM
# =====================================================================
@router.get("/family-centre")
def get_family_centre(
    request: Request,
    user_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    """Fetch Family Centre supervised accounts and parental controls."""
    uid = resolve_uid(request, user_id, db)
    supervisions = db.query(FamilySupervision).filter(FamilySupervision.parent_user_id == uid).all()
    
    data = []
    for s in supervisions:
        data.append({
            "id": s.id,
            "teen_name": s.teen_name,
            "relationship_type": s.relationship_type,
            "guardian_email": s.guardian_email,
            "daily_time_limit_minutes": s.daily_time_limit_minutes,
            "quiet_hours_start": s.quiet_hours_start,
            "quiet_hours_end": s.quiet_hours_end,
            "block_sensitive_content": s.block_sensitive_content,
            "require_purchase_approval": s.require_purchase_approval,
            "status": s.status,
            "created_at": s.created_at.isoformat() if s.created_at else None
        })

    return {
        "success": True,
        "count": len(data),
        "supervised_members": data
    }


@router.post("/family-centre/supervise", status_code=status.HTTP_201_CREATED)
def add_family_supervision(
    payload: Dict[str, Any],
    request: Request,
    user_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    """Add a teen/family member under supervision with custom guardrails."""
    uid = resolve_uid(request, payload.get("user_id") or user_id, db)
    teen_name = payload.get("teen_name")
    if not teen_name or not str(teen_name).strip():
        raise HTTPException(status_code=400, detail="Teen / Family member name is required.")

    new_link = FamilySupervision(
        parent_user_id=uid,
        guardian_email=payload.get("guardian_email"),
        teen_name=str(teen_name).strip(),
        relationship_type=payload.get("relationship_type", "Teen / Child"),
        daily_time_limit_minutes=int(payload.get("daily_time_limit_minutes", 120)),
        quiet_hours_start=str(payload.get("quiet_hours_start", "22:00")),
        quiet_hours_end=str(payload.get("quiet_hours_end", "07:00")),
        block_sensitive_content=bool(payload.get("block_sensitive_content", True)),
        require_purchase_approval=bool(payload.get("require_purchase_approval", True)),
        status="active"
    )
    db.add(new_link)

    db.add(SecurityAuditLog(
        user_id=uid,
        event_type="family_supervision_created",
        severity="info",
        details=f"Added Family Centre supervision for {teen_name}"
    ))

    db.commit()
    db.refresh(new_link)

    return {
        "success": True,
        "message": f"Supervision setup successfully for {teen_name}!",
        "id": new_link.id
    }


@router.put("/family-centre/{link_id}")
def update_family_supervision(
    link_id: int,
    payload: Dict[str, Any],
    request: Request,
    user_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    """Update supervision controls for a family member."""
    uid = resolve_uid(request, payload.get("user_id") or user_id, db)
    link = db.query(FamilySupervision).filter(
        FamilySupervision.id == link_id,
        FamilySupervision.parent_user_id == uid
    ).first()

    if not link:
        raise HTTPException(status_code=404, detail="Family supervision record not found.")

    if "daily_time_limit_minutes" in payload:
        link.daily_time_limit_minutes = int(payload["daily_time_limit_minutes"])
    if "quiet_hours_start" in payload:
        link.quiet_hours_start = str(payload["quiet_hours_start"])
    if "quiet_hours_end" in payload:
        link.quiet_hours_end = str(payload["quiet_hours_end"])
    if "block_sensitive_content" in payload:
        link.block_sensitive_content = bool(payload["block_sensitive_content"])
    if "require_purchase_approval" in payload:
        link.require_purchase_approval = bool(payload["require_purchase_approval"])
    if "status" in payload:
        link.status = str(payload["status"])

    link.updated_at = datetime.datetime.utcnow()
    db.commit()

    return {
        "success": True,
        "message": "Supervision controls updated successfully!"
    }


@router.delete("/family-centre/{link_id}")
def delete_family_supervision(
    link_id: int,
    request: Request,
    user_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    """Remove a family member from supervision."""
    uid = resolve_uid(request, user_id, db)
    link = db.query(FamilySupervision).filter(
        FamilySupervision.id == link_id,
        FamilySupervision.parent_user_id == uid
    ).first()

    if not link:
        raise HTTPException(status_code=404, detail="Family supervision record not found.")

    db.delete(link)
    db.commit()

    return {
        "success": True,
        "message": "Family supervision link removed successfully."
    }
