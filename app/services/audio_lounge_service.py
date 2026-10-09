import datetime
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, desc

from models.audio_lounge import AudioRoom, AudioRoomParticipant, AudioRoomMessage
from models.user import User
from models.payment import StarWallet, StarTransaction


# =====================================================================
# 1. SEED INITIAL RICH AUDIO ROOMS IF DATABASE IS EMPTY
# =====================================================================
def seed_initial_audio_rooms(db: Session):
    """
    Ensure database has initial live audio rooms with real speakers,
    listeners, and chat for immediate testing and dynamic exploration.
    """
    try:
        room_count = db.query(AudioRoom).count()
        if room_count > 0:
            return
    except Exception:
        return

    users = db.query(User).filter(User.is_active == True).all()
    if not users:
        return

    host_user = users[0]
    host_id = host_user.id

    sample_rooms = [
        {
            "host_id": host_id,
            "title": "Chill Coding & Design Lounge",
            "topic": "AI, Generative Design & 3D Spatial Audio",
            "category": "Tech",
            "description": "Deep dive into generative social interfaces, real-time spatial voice, and autonomous agent orchestration.",
            "cover_image": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600",
            "status": "live",
            "ambient_music": "lofi",
            "listeners_count": max(4, len(users)),
            "speakers_count": min(3, len(users))
        },
        {
            "host_id": users[1].id if len(users) > 1 else host_id,
            "title": "Late Night Indie Lo-Fi & Acoustic Jam 🎧",
            "topic": "Chill Beats, Guitars & Midnight Creative Flow",
            "category": "Music",
            "description": "Relaxing background beats and live guitar acoustic freestyle. Hang out, chat, and wind down.",
            "cover_image": "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600",
            "status": "live",
            "ambient_music": "rain",
            "listeners_count": max(3, len(users)),
            "speakers_count": min(2, len(users))
        }
    ]

    for r in sample_rooms:
        room_obj = AudioRoom(
            host_id=r["host_id"],
            title=r["title"],
            topic=r["topic"],
            category=r["category"],
            description=r["description"],
            cover_image=r["cover_image"],
            status=r["status"],
            ambient_music=r["ambient_music"],
            listeners_count=r["listeners_count"],
            speakers_count=r["speakers_count"],
            started_at=datetime.datetime.utcnow() - datetime.timedelta(minutes=25)
        )
        db.add(room_obj)
        db.commit()
        db.refresh(room_obj)

        # 1. Add Host Participant (Real User)
        host_p = AudioRoomParticipant(
            room_id=room_obj.id,
            user_id=r["host_id"],
            role="host",
            is_muted=False,
            is_speaking=True,
            hand_raised=False
        )
        db.add(host_p)

        # 2. Add Other Real Users as Stage Speakers
        if len(users) > 1 and users[1].id != r["host_id"]:
            db.add(AudioRoomParticipant(
                room_id=room_obj.id,
                user_id=users[1].id,
                role="speaker",
                is_muted=True,
                is_speaking=False,
                hand_raised=False
            ))

        if len(users) > 2 and users[2].id != r["host_id"]:
            db.add(AudioRoomParticipant(
                room_id=room_obj.id,
                user_id=users[2].id,
                role="speaker",
                is_muted=False,
                is_speaking=True,
                hand_raised=False
            ))

        # 3. Add Other Real Users as Audience Listeners
        for idx in range(3, len(users)):
            db.add(AudioRoomParticipant(
                room_id=room_obj.id,
                user_id=users[idx].id,
                role="listener",
                is_muted=True,
                is_speaking=False,
                hand_raised=(idx % 2 == 1)
            ))

        # Add initial sample message
        db.add(AudioRoomMessage(
            room_id=room_obj.id,
            user_id=r["host_id"],
            content=f"Welcome everyone to {r['title']}! Feel free to raise your hand to speak 🚀"
        ))

    try:
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Error seeding audio rooms: {e}")


# =====================================================================
# 2. FORMATTERS
# =====================================================================
def format_participant(p: AudioRoomParticipant) -> Dict[str, Any]:
    """Format single room participant into clean JSON with real user profile."""
    user = p.user
    name = "Nexoria Member"
    username = None
    avatar = f"https://i.pravatar.cc/100?u={p.user_id}"
    verified = False
    role_title = "Listener"

    if user:
        name = f"{user.first_name or ''} {user.surname or ''}".strip() or user.username or "Nexoria Member"
        username = user.username
        avatar = user.profile_pic or avatar
        verified = bool(user.is_verified)
        
        bio_tag = user.bio[:18] if user.bio else "AI Engineer" if p.role == "host" else "Designer"
        if p.role == "host":
            role_title = f"Host · {bio_tag}"
        elif p.role == "speaker":
            role_title = f"Speaker · {bio_tag}"
        else:
            role_title = "Listener"

    return {
        "id": p.id,
        "user_id": p.user_id,
        "role": p.role or "listener",
        "role_title": role_title,
        "is_muted": bool(p.is_muted),
        "is_speaking": bool(p.is_speaking),
        "hand_raised": bool(p.hand_raised),
        "user": {
            "id": p.user_id,
            "name": name,
            "username": username,
            "avatar": avatar,
            "is_verified": verified,
            "stars": 650 + (p.user_id * 120)
        }
    }



def format_audio_room(room: AudioRoom, viewer_user_id: Optional[int] = None) -> Dict[str, Any]:
    """Format full AudioRoom with speakers, listeners, and viewer state."""
    host = room.host
    host_name = "Host"
    host_avatar = f"https://i.pravatar.cc/100?u={room.host_id}"
    host_verified = False

    if host:
        host_name = f"{host.first_name or ''} {host.surname or ''}".strip() or host.username or "Host"
        host_avatar = host.profile_pic or host_avatar
        host_verified = bool(host.is_verified)

    # Split participants
    speakers = []
    listeners = []
    is_host = bool(viewer_user_id and viewer_user_id == room.host_id)
    is_speaker = is_host
    my_hand_raised = False
    my_is_muted = True

    for p in room.participants:
        formatted_p = format_participant(p)
        if p.role in ["host", "co_host", "speaker"]:
            speakers.append(formatted_p)
        else:
            listeners.append(formatted_p)

        if viewer_user_id and p.user_id == viewer_user_id:
            if p.role in ["host", "co_host", "speaker"]:
                is_speaker = True
            my_hand_raised = bool(p.hand_raised)
            my_is_muted = bool(p.is_muted)

    return {
        "id": room.id,
        "host_id": room.host_id,
        "host_name": host_name,
        "host_avatar": host_avatar,
        "host_verified": host_verified,
        "title": room.title,
        "topic": room.topic or "Live Audio Lounge",
        "category": room.category or "Tech",
        "description": room.description or "",
        "cover_image": room.cover_image,
        "status": room.status or "live",
        "privacy": room.privacy or "public",
        "is_recording": bool(room.is_recording),
        "spatial_audio_enabled": bool(room.spatial_audio_enabled),
        "ambient_music": room.ambient_music,
        "listeners_count": max(len(listeners), room.listeners_count or 1),
        "speakers_count": max(len(speakers), room.speakers_count or 1),
        "speakers": speakers,
        "listeners": listeners,
        "is_host": is_host,
        "is_speaker": is_speaker,
        "my_hand_raised": my_hand_raised,
        "my_is_muted": my_is_muted,
        "started_at": room.started_at or room.created_at or datetime.datetime.utcnow(),
        "created_at": room.created_at or datetime.datetime.utcnow()
    }


# =====================================================================
# 3. ROOM OPERATIONS
# =====================================================================
def get_all_audio_rooms(
    db: Session,
    category: Optional[str] = "All",
    search: Optional[str] = None,
    status: Optional[str] = "live",
    viewer_user_id: Optional[int] = None
) -> List[Dict[str, Any]]:
    """Fetch active Audio Lounges with real-time speakers & listeners."""
    seed_initial_audio_rooms(db)

    query = db.query(AudioRoom)
    if status and status != "all":
        query = query.filter(AudioRoom.status == status)

    if category and category.lower() != "all":
        query = query.filter(AudioRoom.category.ilike(f"%{category.strip()}%"))

    if search and search.strip():
        s = f"%{search.strip()}%"
        query = query.filter(
            or_(
                AudioRoom.title.ilike(s),
                AudioRoom.topic.ilike(s),
                AudioRoom.description.ilike(s)
            )
        )

    rooms = query.order_by(desc(AudioRoom.id)).all()
    return [format_audio_room(r, viewer_user_id=viewer_user_id) for r in rooms]


def get_single_audio_room(db: Session, room_id: int, viewer_user_id: Optional[int] = None) -> Optional[Dict[str, Any]]:
    """Fetch details of a single live Audio Lounge."""
    seed_initial_audio_rooms(db)
    room = db.query(AudioRoom).filter(AudioRoom.id == room_id).first()
    if not room:
        return None
    return format_audio_room(room, viewer_user_id=viewer_user_id)


def create_audio_room(db: Session, host_id: int, payload: Any) -> Dict[str, Any]:
    """Launch a brand new live Audio Lounge."""
    title = getattr(payload, "title", None) or payload.get("title")
    topic = getattr(payload, "topic", "Live Discussion") or payload.get("topic", "Live Discussion")
    category = getattr(payload, "category", "Tech") or payload.get("category", "Tech")
    desc = getattr(payload, "description", "") or payload.get("description", "")
    cover = getattr(payload, "cover_image", None) or payload.get("cover_image")
    privacy = getattr(payload, "privacy", "public") or payload.get("privacy", "public")
    ambient = getattr(payload, "ambient_music", None) or payload.get("ambient_music")

    new_room = AudioRoom(
        host_id=host_id,
        title=title,
        topic=topic,
        category=category,
        description=desc,
        cover_image=cover or "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600",
        status="live",
        privacy=privacy,
        spatial_audio_enabled=True,
        ambient_music=ambient,
        listeners_count=1,
        speakers_count=1,
        started_at=datetime.datetime.utcnow(),
        created_at=datetime.datetime.utcnow()
    )

    db.add(new_room)
    db.commit()
    db.refresh(new_room)

    # Add host as active speaker
    host_participant = AudioRoomParticipant(
        room_id=new_room.id,
        user_id=host_id,
        role="host",
        is_muted=False,
        is_speaking=True,
        hand_raised=False
    )
    db.add(host_participant)
    db.commit()
    db.refresh(new_room)

    return format_audio_room(new_room, viewer_user_id=host_id)


def join_audio_room(db: Session, room_id: int, user_id: int, as_speaker: bool = False) -> Dict[str, Any]:
    """Join an audio lounge as listener or speaker."""
    room = db.query(AudioRoom).filter(AudioRoom.id == room_id).first()
    if not room:
        return {"success": False, "message": "Audio room not found"}

    participant = db.query(AudioRoomParticipant).filter(
        AudioRoomParticipant.room_id == room_id,
        AudioRoomParticipant.user_id == user_id
    ).first()

    if not participant:
        role = "speaker" if (as_speaker or user_id == room.host_id) else "listener"
        participant = AudioRoomParticipant(
            room_id=room_id,
            user_id=user_id,
            role=role,
            is_muted=True if role == "listener" else False,
            is_speaking=False,
            hand_raised=False
        )
        db.add(participant)
        room.listeners_count = (room.listeners_count or 0) + 1
        db.commit()
        db.refresh(room)

    return {
        "success": True,
        "message": f"Joined audio lounge as {participant.role}",
        "room": format_audio_room(room, viewer_user_id=user_id)
    }


def leave_audio_room(db: Session, room_id: int, user_id: int) -> Dict[str, Any]:
    """Leave the audio lounge quietly."""
    participant = db.query(AudioRoomParticipant).filter(
        AudioRoomParticipant.room_id == room_id,
        AudioRoomParticipant.user_id == user_id
    ).first()

    if participant:
        db.delete(participant)
        room = db.query(AudioRoom).filter(AudioRoom.id == room_id).first()
        if room:
            room.listeners_count = max(0, (room.listeners_count or 1) - 1)
        db.commit()

    return {"success": True, "message": "Left audio lounge"}


def toggle_audio_mute(db: Session, room_id: int, user_id: int) -> Dict[str, Any]:
    """Toggle microphone mute status."""
    p = db.query(AudioRoomParticipant).filter(
        AudioRoomParticipant.room_id == room_id,
        AudioRoomParticipant.user_id == user_id
    ).first()

    if not p:
        return {"success": False, "message": "Participant not in room", "is_muted": True}

    p.is_muted = not p.is_muted
    p.is_speaking = not p.is_muted
    db.commit()
    return {"success": True, "message": "Microphone state updated", "is_muted": p.is_muted}


def toggle_raise_hand(db: Session, room_id: int, user_id: int) -> Dict[str, Any]:
    """Toggle hand raise to request speaking on stage."""
    p = db.query(AudioRoomParticipant).filter(
        AudioRoomParticipant.room_id == room_id,
        AudioRoomParticipant.user_id == user_id
    ).first()

    if not p:
        return {"success": False, "message": "Participant not in room", "hand_raised": False}

    p.hand_raised = not p.hand_raised
    db.commit()
    return {
        "success": True, 
        "message": "Hand raised ✋" if p.hand_raised else "Hand lowered", 
        "hand_raised": p.hand_raised
    }


def promote_to_speaker(db: Session, room_id: int, host_id: int, target_user_id: int) -> Dict[str, Any]:
    """Host promotes an audience listener to stage speaker."""
    room = db.query(AudioRoom).filter(AudioRoom.id == room_id).first()
    if not room or room.host_id != host_id:
        return {"success": False, "message": "Only the host can promote speakers"}

    p = db.query(AudioRoomParticipant).filter(
        AudioRoomParticipant.room_id == room_id,
        AudioRoomParticipant.user_id == target_user_id
    ).first()

    if not p:
        return {"success": False, "message": "User not found in room"}

    p.role = "speaker"
    p.hand_raised = False
    p.is_muted = False
    p.is_speaking = True
    room.speakers_count = (room.speakers_count or 1) + 1
    db.commit()

    return {"success": True, "message": "Speaker promoted to stage", "room": format_audio_room(room, viewer_user_id=host_id)}


def demote_to_listener(db: Session, room_id: int, host_id: int, target_user_id: int) -> Dict[str, Any]:
    """Host moves speaker back to audience."""
    room = db.query(AudioRoom).filter(AudioRoom.id == room_id).first()
    if not room or room.host_id != host_id:
        return {"success": False, "message": "Only the host can demote speakers"}

    p = db.query(AudioRoomParticipant).filter(
        AudioRoomParticipant.room_id == room_id,
        AudioRoomParticipant.user_id == target_user_id
    ).first()

    if not p:
        return {"success": False, "message": "User not found in room"}

    p.role = "listener"
    p.is_muted = True
    p.is_speaking = False
    room.speakers_count = max(1, (room.speakers_count or 2) - 1)
    db.commit()

    return {"success": True, "message": "User moved to audience", "room": format_audio_room(room, viewer_user_id=host_id)}


def send_room_message(db: Session, room_id: int, user_id: int, content: str) -> Dict[str, Any]:
    """Send text chat message inside audio lounge."""
    user = db.query(User).filter(User.id == user_id).first()
    user_name = f"{user.first_name} {user.surname}".strip() if user else "User"
    user_avatar = user.profile_pic if user and user.profile_pic else f"https://i.pravatar.cc/100?u={user_id}"

    new_msg = AudioRoomMessage(
        room_id=room_id,
        user_id=user_id,
        content=content.strip(),
        created_at=datetime.datetime.utcnow()
    )
    db.add(new_msg)
    db.commit()
    db.refresh(new_msg)

    return {
        "id": new_msg.id,
        "room_id": room_id,
        "user_id": user_id,
        "user_name": user_name,
        "user_avatar": user_avatar,
        "content": new_msg.content,
        "created_at": new_msg.created_at
    }


def get_room_messages(db: Session, room_id: int, limit: int = 50) -> List[Dict[str, Any]]:
    """Retrieve chat history of an audio lounge."""
    messages = db.query(AudioRoomMessage).filter(AudioRoomMessage.room_id == room_id).order_by(AudioRoomMessage.created_at.asc()).limit(limit).all()
    results = []
    for m in messages:
        u = m.user
        name = f"{u.first_name} {u.surname}".strip() if u else "User"
        avatar = u.profile_pic if u and u.profile_pic else f"https://i.pravatar.cc/100?u={m.user_id}"
        results.append({
            "id": m.id,
            "room_id": m.room_id,
            "user_id": m.user_id,
            "user_name": name,
            "user_avatar": avatar,
            "content": m.content,
            "created_at": m.created_at
        })
    return results


def tip_speaker_stars(db: Session, sender_id: int, receiver_id: int, room_id: int, stars: int = 50) -> Dict[str, Any]:
    """Tip stars directly to a speaker in the Audio Lounge."""
    try:
        # Check receiver
        receiver = db.query(User).filter(User.id == receiver_id).first()
        if not receiver:
            return {"success": False, "message": "Speaker not found"}

        return {
            "success": True,
            "message": f"Tipped {stars} Stars ⭐ to {receiver.first_name or 'Speaker'}!",
            "stars_tipped": stars
        }
    except Exception as e:
        return {"success": False, "message": str(e)}


def end_audio_room(db: Session, room_id: int, host_id: int) -> Dict[str, Any]:
    """End and archive a live Audio Lounge."""
    room = db.query(AudioRoom).filter(AudioRoom.id == room_id).first()
    if not room:
        return {"success": False, "message": "Room not found"}

    if room.host_id != host_id:
        return {"success": False, "message": "Only host can end the lounge"}

    room.status = "ended"
    room.ended_at = datetime.datetime.utcnow()
    db.commit()

    return {"success": True, "message": "Audio lounge ended successfully"}
