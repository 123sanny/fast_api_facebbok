from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from database import get_db
from schemas.audio_lounge import (
    AudioRoomCreate,
    AudioRoomOut,
    AudioRoomMessageCreate,
    AudioRoomMessageOut,
    AudioRoomTipRequest,
    AudioRoomReactionRequest,
    AudioRoomActionResponse
)
from services.audio_lounge_service import (
    get_all_audio_rooms,
    get_single_audio_room,
    create_audio_room,
    join_audio_room,
    leave_audio_room,
    toggle_audio_mute,
    toggle_raise_hand,
    promote_to_speaker,
    demote_to_listener,
    send_room_message,
    get_room_messages,
    tip_speaker_stars,
    end_audio_room
)

router = APIRouter(prefix="/audio-lounge", tags=["Audio Lounge & Live Spaces"])


# =====================================================================
# 1. BROWSE ACTIVE AUDIO ROOMS
# =====================================================================
@router.get("/rooms", response_model=List[AudioRoomOut])
def list_rooms(
    viewer_user_id: Optional[int] = Query(None, description="Current user viewing rooms"),
    user_id: Optional[int] = Query(None, description="Alias for viewer_user_id"),
    category: Optional[str] = Query("All", description="Tech, Music, Startups, Gaming, Career, Chill, News"),
    search: Optional[str] = Query(None, description="Search keyword in title, topic, or description"),
    status: Optional[str] = Query("live", description="live, scheduled, ended, all"),
    db: Session = Depends(get_db)
):
    """
    Fetch all live 3D Audio Spaces & Lounges with live speakers and listener counts.
    """
    effective_user_id = viewer_user_id or user_id
    return get_all_audio_rooms(
        db=db,
        category=category,
        search=search,
        status=status,
        viewer_user_id=effective_user_id
    )


# =====================================================================
# 2. CREATE / LAUNCH A NEW AUDIO ROOM
# =====================================================================
@router.post("/rooms", response_model=AudioRoomActionResponse)
def launch_room(
    payload: AudioRoomCreate,
    user_id: Optional[int] = Query(None, description="Host user ID"),
    db: Session = Depends(get_db)
):
    """
    Launch a new Audio Lounge as Host.
    """
    host_id = payload.host_id or user_id or 1
    if not payload.title:
        raise HTTPException(status_code=400, detail="Room title is required")

    created = create_audio_room(db=db, host_id=host_id, payload=payload)
    return {
        "success": True,
        "message": "Audio Lounge launched live!",
        "room": created
    }


# =====================================================================
# 3. GET SINGLE ROOM DETAILS
# =====================================================================
@router.get("/rooms/{room_id}", response_model=AudioRoomOut)
def get_room(
    room_id: int,
    viewer_user_id: Optional[int] = Query(None),
    user_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Get live stage details, active speakers, waveforms, and listeners of a room.
    """
    effective_user_id = viewer_user_id or user_id
    room = get_single_audio_room(db=db, room_id=room_id, viewer_user_id=effective_user_id)
    if not room:
        raise HTTPException(status_code=404, detail="Audio room not found")
    return room


# =====================================================================
# 4. JOIN AUDIO ROOM
# =====================================================================
@router.post("/rooms/{room_id}/join", response_model=AudioRoomActionResponse)
def join_room(
    room_id: int,
    user_id: int = Query(..., description="User ID joining room"),
    as_speaker: Optional[bool] = Query(False),
    db: Session = Depends(get_db)
):
    """
    Join an audio room as a listener or speaker.
    """
    res = join_audio_room(db=db, room_id=room_id, user_id=user_id, as_speaker=as_speaker)
    if not res.get("success"):
        raise HTTPException(status_code=404, detail=res.get("message", "Could not join room"))
    return res


# =====================================================================
# 5. LEAVE AUDIO ROOM
# =====================================================================
@router.post("/rooms/{room_id}/leave", response_model=AudioRoomActionResponse)
def leave_room(
    room_id: int,
    user_id: int = Query(..., description="User ID leaving room"),
    db: Session = Depends(get_db)
):
    """
    Leave the audio lounge quietly.
    """
    return leave_audio_room(db=db, room_id=room_id, user_id=user_id)


# =====================================================================
# 6. TOGGLE MUTE
# =====================================================================
@router.post("/rooms/{room_id}/toggle-mute", response_model=AudioRoomActionResponse)
def toggle_mute(
    room_id: int,
    user_id: int = Query(...),
    db: Session = Depends(get_db)
):
    """
    Toggle microphone mute/unmute state.
    """
    res = toggle_audio_mute(db=db, room_id=room_id, user_id=user_id)
    return res


# =====================================================================
# 7. TOGGLE RAISE HAND ✋
# =====================================================================
@router.post("/rooms/{room_id}/raise-hand", response_model=AudioRoomActionResponse)
def raise_hand(
    room_id: int,
    user_id: int = Query(...),
    db: Session = Depends(get_db)
):
    """
    Raise or lower hand to request speaking on the stage.
    """
    res = toggle_raise_hand(db=db, room_id=room_id, user_id=user_id)
    return res


# =====================================================================
# 8. PROMOTE LISTENER TO SPEAKER (HOST ONLY)
# =====================================================================
@router.post("/rooms/{room_id}/promote", response_model=AudioRoomActionResponse)
def promote_user(
    room_id: int,
    host_id: int = Query(..., description="Host ID"),
    target_user_id: int = Query(..., description="Target User ID"),
    db: Session = Depends(get_db)
):
    """
    Host accepts hand-raise and promotes listener to stage speaker.
    """
    res = promote_to_speaker(db=db, room_id=room_id, host_id=host_id, target_user_id=target_user_id)
    if not res.get("success"):
        raise HTTPException(status_code=400, detail=res.get("message", "Could not promote user"))
    return res


# =====================================================================
# 9. DEMOTE SPEAKER TO LISTENER (HOST ONLY)
# =====================================================================
@router.post("/rooms/{room_id}/demote", response_model=AudioRoomActionResponse)
def demote_user(
    room_id: int,
    host_id: int = Query(...),
    target_user_id: int = Query(...),
    db: Session = Depends(get_db)
):
    """
    Host demotes speaker back to audience.
    """
    res = demote_to_listener(db=db, room_id=room_id, host_id=host_id, target_user_id=target_user_id)
    if not res.get("success"):
        raise HTTPException(status_code=400, detail=res.get("message", "Could not demote user"))
    return res


# =====================================================================
# 10. ROOM LIVE CHAT
# =====================================================================
@router.get("/rooms/{room_id}/messages", response_model=List[AudioRoomMessageOut])
def list_room_messages(
    room_id: int,
    limit: Optional[int] = Query(50),
    db: Session = Depends(get_db)
):
    """
    Fetch synchronized chat messages for the audio lounge.
    """
    return get_room_messages(db=db, room_id=room_id, limit=limit)


@router.post("/rooms/{room_id}/messages", response_model=AudioRoomMessageOut)
def post_room_message(
    room_id: int,
    payload: AudioRoomMessageCreate,
    user_id: int = Query(...),
    db: Session = Depends(get_db)
):
    """
    Send a message in the audio lounge live chat.
    """
    if not payload.content or not payload.content.strip():
        raise HTTPException(status_code=400, detail="Message content cannot be empty")
    return send_room_message(db=db, room_id=room_id, user_id=user_id, content=payload.content)


# =====================================================================
# 11. TIP STARS TO SPEAKER ⭐
# =====================================================================
@router.post("/rooms/{room_id}/tip", response_model=AudioRoomActionResponse)
def tip_speaker(
    room_id: int,
    payload: AudioRoomTipRequest,
    sender_id: int = Query(...),
    db: Session = Depends(get_db)
):
    """
    Tip stars directly to an active speaker on stage.
    """
    res = tip_speaker_stars(
        db=db,
        sender_id=sender_id,
        receiver_id=payload.receiver_id,
        room_id=room_id,
        stars=payload.stars or 50
    )
    if not res.get("success"):
        raise HTTPException(status_code=400, detail=res.get("message", "Could not tip stars"))
    return res


# =====================================================================
# 12. END AUDIO ROOM (HOST ONLY)
# =====================================================================
@router.post("/rooms/{room_id}/end", response_model=AudioRoomActionResponse)
def end_room(
    room_id: int,
    host_id: int = Query(...),
    db: Session = Depends(get_db)
):
    """
    End and close the live Audio Lounge.
    """
    res = end_audio_room(db=db, room_id=room_id, host_id=host_id)
    if not res.get("success"):
        raise HTTPException(status_code=400, detail=res.get("message", "Could not end room"))
    return res
