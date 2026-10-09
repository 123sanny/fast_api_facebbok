import os
import shutil
import uuid
import datetime
from typing import List, Optional, Dict, Set, Any
from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, desc

from database import get_db, SessionLocal
from models.user import User
from models.social import Friend, Conversation, ConversationParticipant, Message, MessageReaction
from models.payment import StarWallet, StarTransaction
from schemas.chat import (
    MessageSendRequest,
    MessageReactionRequest,
    MarkReadRequest,
    ChatContactOut,
    ChatMessageOut,
    ConversationThreadOut,
    MissedCallLogRequest
)

router = APIRouter(tags=["Live Realtime Chat & Messenger"])


# ==============================================================================
# WEBSOCKET CONNECTION MANAGER (REALTIME PRESENCE & MESSAGING)
# ==============================================================================

class ChatConnectionManager:
    def __init__(self):
        # Maps user_id -> Set of active WebSocket connections (multi-tab support)
        self.active_connections: Dict[int, Set[WebSocket]] = {}

    async def connect(self, user_id: int, websocket: WebSocket):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = set()
        self.active_connections[user_id].add(websocket)
        # Notify user's contacts about online presence
        await self.broadcast_presence(user_id, is_online=True)

    def disconnect(self, user_id: int, websocket: WebSocket):
        if user_id in self.active_connections:
            self.active_connections[user_id].discard(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
                # If all tabs closed, broadcast offline presence
                # (handled asynchronously)

    def is_user_online(self, user_id: int) -> bool:
        return user_id in self.active_connections and len(self.active_connections[user_id]) > 0

    async def send_to_user(self, user_id: int, message_payload: dict):
        """Send JSON payload to all active sockets of a target user."""
        if user_id in self.active_connections:
            dead_sockets = set()
            for ws in list(self.active_connections[user_id]):
                try:
                    await ws.send_json(message_payload)
                except Exception:
                    dead_sockets.add(ws)
            for ws in dead_sockets:
                self.active_connections[user_id].discard(ws)

    async def broadcast_presence(self, user_id: int, is_online: bool):
        """Notify active connected peers that user presence changed."""
        presence_payload = {
            "type": "presence_update",
            "user_id": user_id,
            "online": is_online,
            "timestamp": datetime.datetime.utcnow().isoformat()
        }
        for uid, sockets in list(self.active_connections.items()):
            if uid != user_id:
                for ws in list(sockets):
                    try:
                        await ws.send_json(presence_payload)
                    except Exception:
                        pass


manager = ChatConnectionManager()


# ==============================================================================
# WEBSOCKET ENDPOINTS
# ==============================================================================

@router.websocket("/ws/chat/{user_id}")
@router.websocket("/chat/ws/{user_id}")
async def websocket_chat_hub(websocket: WebSocket, user_id: int):
    """
    Full-duplex WebSocket connection for real-time live messaging,
    instant typing indicators, read receipts, and online status.
    """
    await manager.connect(user_id, websocket)
    try:
        while True:
            data = await websocket.receive_json()
            event_type = data.get("type")

            if event_type == "ping":
                await websocket.send_json({"type": "pong", "timestamp": datetime.datetime.utcnow().isoformat()})

            elif event_type == "typing":
                receiver_id = data.get("receiver_id")
                if receiver_id:
                    await manager.send_to_user(receiver_id, {
                        "type": "typing",
                        "sender_id": user_id,
                        "receiver_id": receiver_id
                    })

            elif event_type == "stop_typing":
                receiver_id = data.get("receiver_id")
                if receiver_id:
                    await manager.send_to_user(receiver_id, {
                        "type": "stop_typing",
                        "sender_id": user_id,
                        "receiver_id": receiver_id
                    })

            elif event_type == "delete_message":
                msg_id = data.get("message_id")
                receiver_id = data.get("receiver_id")
                delete_type = data.get("delete_type", "everyone")
                if msg_id:
                    db = SessionLocal()
                    try:
                        msg = db.query(Message).filter(Message.id == msg_id).first()
                        if msg:
                            is_sender = (msg.sender_id == user_id)
                            # Only sender can delete for everyone
                            if delete_type == "everyone" and is_sender:
                                db.delete(msg)
                                db.commit()
                                del_payload = {
                                    "type": "message_deleted",
                                    "message_id": msg_id,
                                    "sender_id": user_id,
                                    "receiver_id": receiver_id,
                                    "delete_type": "everyone"
                                }
                                if receiver_id:
                                    await manager.send_to_user(receiver_id, del_payload)
                                await manager.send_to_user(user_id, del_payload)
                            else:
                                # Delete for me (only notify requesting user)
                                del_payload = {
                                    "type": "message_deleted",
                                    "message_id": msg_id,
                                    "sender_id": msg.sender_id,
                                    "receiver_id": msg.receiver_id,
                                    "delete_type": "me"
                                }
                                await manager.send_to_user(user_id, del_payload)
                    except Exception as e:
                        print(f"Error handling delete_message event: {e}")
                    finally:
                        db.close()

            elif event_type == "mark_read":
                other_user_id = data.get("other_user_id")
                if other_user_id:
                    # Mark in DB
                    db = SessionLocal()
                    try:
                        db.query(Message).filter(
                            Message.sender_id == other_user_id,
                            Message.receiver_id == user_id,
                            Message.is_read == False
                        ).update({"is_read": True, "status": "read"})
                        db.commit()
                    finally:
                        db.close()

                    await manager.send_to_user(other_user_id, {
                        "type": "messages_read",
                        "reader_id": user_id,
                        "sender_id": other_user_id
                    })

            # Realtime Phone/Audio & Video Call Signaling
            elif event_type == "call_request":
                receiver_id = data.get("receiver_id")
                if receiver_id:
                    await manager.send_to_user(receiver_id, {
                        "type": "incoming_call",
                        "sender_id": user_id,
                        "sender_name": data.get("sender_name", "User"),
                        "sender_img": data.get("sender_img", ""),
                        "call_type": data.get("call_type", "audio"),  # audio or video
                        "timestamp": datetime.datetime.utcnow().isoformat()
                    })

            elif event_type == "call_accepted":
                receiver_id = data.get("receiver_id")
                if receiver_id:
                    await manager.send_to_user(receiver_id, {
                        "type": "call_accepted",
                        "user_id": user_id
                    })

            elif event_type in ["call_rejected", "call_missed"]:
                receiver_id = data.get("receiver_id")
                call_type = data.get("call_type", "audio")
                caller_id = data.get("caller_id") or (receiver_id if event_type == "call_rejected" else user_id)
                callee_id = user_id if event_type == "call_rejected" else receiver_id

                if receiver_id:
                    # Notify other party
                    await manager.send_to_user(receiver_id, {
                        "type": "call_rejected",
                        "user_id": user_id,
                        "call_type": call_type
                    })

                # Automatically save missed call record in database
                if caller_id and callee_id and caller_id != callee_id:
                    db = SessionLocal()
                    try:
                        conv = _get_or_create_conversation(db, caller_id, callee_id)
                        content = "Missed video call" if call_type == "video" else "Missed audio call"
                        att_type = "missed_video_call" if call_type == "video" else "missed_audio_call"
                        missed_msg = Message(
                            conversation_id=conv.id,
                            sender_id=caller_id,
                            receiver_id=callee_id,
                            content=content,
                            attachment_type=att_type,
                            is_read=False,
                            is_ghost=False,
                            is_e2ee=True,
                            status="delivered"
                        )
                        db.add(missed_msg)
                        conv.updated_at = datetime.datetime.utcnow()
                        db.commit()
                        db.refresh(missed_msg)

                        f_caller = _format_message(missed_msg, current_user_id=caller_id)
                        f_callee = _format_message(missed_msg, current_user_id=callee_id)

                        await manager.send_to_user(caller_id, {
                            "type": "message_sent",
                            "message": f_caller
                        })
                        await manager.send_to_user(callee_id, {
                            "type": "new_message",
                            "message": f_callee
                        })
                    except Exception as e:
                        print(f"Error logging missed call: {e}")
                    finally:
                        db.close()

            elif event_type == "call_ended":
                receiver_id = data.get("receiver_id")
                if receiver_id:
                    await manager.send_to_user(receiver_id, {
                        "type": "call_ended",
                        "user_id": user_id
                    })

            elif event_type == "webrtc_signal":
                receiver_id = data.get("receiver_id")
                if receiver_id:
                    await manager.send_to_user(receiver_id, {
                        "type": "webrtc_signal",
                        "sender_id": user_id,
                        "signal_data": data.get("signal_data")
                    })

    except WebSocketDisconnect:
        manager.disconnect(user_id, websocket)
        await manager.broadcast_presence(user_id, is_online=False)
    except Exception:
        manager.disconnect(user_id, websocket)
        await manager.broadcast_presence(user_id, is_online=False)


# ==============================================================================
# HELPER FORMATTING FUNCTIONS
# ==============================================================================

def _format_time(dt: datetime.datetime) -> str:
    if not dt:
        return ""
    if isinstance(dt, datetime.datetime):
        iso_str = dt.isoformat()
        if not iso_str.endswith("Z") and "+" not in iso_str:
            return iso_str + "Z"
        return iso_str
    return str(dt)


def _format_message(msg: Message, current_user_id: int) -> dict:
    sender_type = "me" if msg.sender_id == current_user_id else "them"
    now = datetime.datetime.utcnow()

    remaining_seconds = None
    if msg.is_ghost and msg.expire_at:
        rem = int((msg.expire_at - now).total_seconds())
        remaining_seconds = max(0, rem)

    # Reactions formatting
    reaction_list = []
    if msg.reactions:
        for r in msg.reactions:
            reaction_list.append({
                "id": r.id,
                "user_id": r.user_id,
                "emoji": r.emoji,
                "user_name": f"{r.user.first_name} {r.user.surname}" if r.user else "User"
            })

    sender_name = f"{msg.sender.first_name} {msg.sender.surname}" if msg.sender else "User"
    sender_img = msg.sender.profile_pic if msg.sender and msg.sender.profile_pic else f"https://i.pravatar.cc/100?u={msg.sender_id}"

    created_at_iso = ""
    if msg.created_at:
        if isinstance(msg.created_at, datetime.datetime):
            created_at_iso = msg.created_at.isoformat()
            if not created_at_iso.endswith("Z") and "+" not in created_at_iso:
                created_at_iso += "Z"
        else:
            created_at_iso = str(msg.created_at)
            if not created_at_iso.endswith("Z") and "+" not in created_at_iso:
                created_at_iso += "Z"
    else:
        created_at_iso = datetime.datetime.utcnow().isoformat() + "Z"

    expire_at_iso = None
    if msg.expire_at:
        if isinstance(msg.expire_at, datetime.datetime):
            expire_at_iso = msg.expire_at.isoformat()
            if not expire_at_iso.endswith("Z") and "+" not in expire_at_iso:
                expire_at_iso += "Z"
        else:
            expire_at_iso = str(msg.expire_at)

    return {
        "id": msg.id,
        "conversation_id": msg.conversation_id,
        "sender_id": msg.sender_id,
        "receiver_id": msg.receiver_id,
        "sender": sender_type,
        "sender_name": sender_name,
        "sender_img": sender_img,
        "content": msg.content,
        "attachment_url": msg.attachment_url,
        "attachment_type": msg.attachment_type,
        "reply_to_message_id": msg.reply_to_message_id,
        "is_read": bool(msg.is_read),
        "is_ghost": bool(msg.is_ghost),
        "expire_seconds": msg.expire_seconds or 0,
        "expire_at": expire_at_iso,
        "remaining_seconds": remaining_seconds,
        "is_e2ee": bool(msg.is_e2ee),
        "is_voice": bool(msg.is_voice),
        "voice_url": msg.voice_url,
        "voice_duration": msg.voice_duration or 0,
        "voice_transcription": msg.voice_transcription,
        "stars_tipped": msg.stars_tipped or 0,
        "status": msg.status or ("read" if msg.is_read else "delivered"),
        "created_at": created_at_iso,
        "time": created_at_iso,
        "reactions": reaction_list
    }


def _get_or_create_conversation(db: Session, user1_id: int, user2_id: int) -> Conversation:
    """Ensure a 1-on-1 Conversation entity exists between two users."""
    # Find existing conversation with both participants
    subquery = db.query(ConversationParticipant.conversation_id).filter(
        ConversationParticipant.user_id.in_([user1_id, user2_id])
    ).group_by(ConversationParticipant.conversation_id).having(
        ConversationParticipant.conversation_id.isnot(None)
    ).all()

    for (c_id,) in subquery:
        parts = db.query(ConversationParticipant).filter(ConversationParticipant.conversation_id == c_id).all()
        part_uids = {p.user_id for p in parts}
        if {user1_id, user2_id}.issubset(part_uids):
            conv = db.query(Conversation).filter(Conversation.id == c_id).first()
            if conv and not conv.is_group:
                return conv

    # Create new conversation
    new_conv = Conversation(is_group=False)
    db.add(new_conv)
    db.flush()

    db.add(ConversationParticipant(conversation_id=new_conv.id, user_id=user1_id, role="member"))
    db.add(ConversationParticipant(conversation_id=new_conv.id, user_id=user2_id, role="member"))
    db.commit()
    db.refresh(new_conv)
    return new_conv


# ==============================================================================
# REST API ENDPOINTS
# ==============================================================================

@router.get("/chat/contacts", response_model=List[ChatContactOut])
def get_chat_contacts(user_id: int, db: Session = Depends(get_db)):
    """
    Get dynamic list of contacts/friends available to chat with live online/offline status,
    last interaction snippet, and unread counts.
    """
    # 1. Fetch accepted friends from database
    friendships = db.query(Friend).filter(
        or_(
            and_(Friend.sender_id == user_id, Friend.status == "accepted"),
            and_(Friend.receiver_id == user_id, Friend.status == "accepted")
        )
    ).all()

    friend_user_ids = []
    for f in friendships:
        fid = f.receiver_id if f.sender_id == user_id else f.sender_id
        if fid not in friend_user_ids:
            friend_user_ids.append(fid)

    # If user has no accepted friends yet, provide other registered platform users as accessible contacts
    if not friend_user_ids:
        other_users = db.query(User).filter(User.id != user_id, User.is_active == True).limit(10).all()
        target_users = other_users
    else:
        target_users = db.query(User).filter(User.id.in_(friend_user_ids), User.is_active == True).all()

    contacts = []
    for u in target_users:
        # Latest message between current user and this contact
        last_msg = db.query(Message).filter(
            or_(
                and_(Message.sender_id == user_id, Message.receiver_id == u.id),
                and_(Message.sender_id == u.id, Message.receiver_id == user_id)
            )
        ).order_by(Message.created_at.desc()).first()

        unread_count = db.query(Message).filter(
            Message.sender_id == u.id,
            Message.receiver_id == user_id,
            Message.is_read == False
        ).count()

        is_online = manager.is_user_online(u.id)

        last_content = None
        last_time = None
        if last_msg:
            if last_msg.is_voice:
                last_content = "🎤 Voice note"
            elif last_msg.stars_tipped and last_msg.stars_tipped > 0:
                last_content = f"⭐ Tipped {last_msg.stars_tipped} Stars"
            elif last_msg.attachment_url:
                last_content = "📷 Photo attachment"
            else:
                last_content = last_msg.content[:40] + ("..." if len(last_msg.content) > 40 else "")
            last_time = _format_time(last_msg.created_at)

        contacts.append(ChatContactOut(
            id=u.id,
            user_id=u.id,
            name=f"{u.first_name} {u.surname}",
            first_name=u.first_name,
            surname=u.surname,
            img=u.profile_pic if u.profile_pic else f"https://i.pravatar.cc/100?u={u.id}",
            email=u.email,
            role=u.bio if u.bio else "Nexoria Member",
            online=is_online,
            last_message=last_content,
            last_message_time=last_time,
            unread_count=unread_count,
            mutual_count=0
        ))

    return contacts


@router.get("/chat/conversations", response_model=List[ConversationThreadOut])
def list_user_conversations(user_id: int, db: Session = Depends(get_db)):
    """
    Retrieve active conversation threads for the Messenger dropdown / chats view.
    """
    # Fetch all messages involving the user
    recent_messages = db.query(Message).filter(
        or_(Message.sender_id == user_id, Message.receiver_id == user_id)
    ).order_by(Message.created_at.desc()).all()

    seen_partners = set()
    threads = []

    for msg in recent_messages:
        partner_id = msg.receiver_id if msg.sender_id == user_id else msg.sender_id
        if not partner_id or partner_id in seen_partners or partner_id == user_id:
            continue

        seen_partners.add(partner_id)
        partner = db.query(User).filter(User.id == partner_id).first()
        if not partner:
            continue

        unread_count = db.query(Message).filter(
            Message.sender_id == partner_id,
            Message.receiver_id == user_id,
            Message.is_read == False
        ).count()

        is_online = manager.is_user_online(partner_id)

        preview = msg.content
        if msg.is_voice:
            preview = "🎤 Voice note"
        elif msg.stars_tipped and msg.stars_tipped > 0:
            preview = f"⭐ {msg.stars_tipped} Stars gifted"
        elif msg.attachment_url:
            preview = "📷 Photo attachment"

        threads.append(ConversationThreadOut(
            id=msg.conversation_id or partner_id,
            other_user_id=partner_id,
            other_user_name=f"{partner.first_name} {partner.surname}",
            other_user_img=partner.profile_pic if partner.profile_pic else f"https://i.pravatar.cc/100?u={partner_id}",
            online=is_online,
            last_message=preview,
            last_message_time=_format_time(msg.created_at),
            last_message_sender_id=msg.sender_id,
            unread_count=unread_count,
            updated_at=msg.created_at
        ))

    return threads


@router.get("/chat/messages", response_model=List[ChatMessageOut])
def get_chat_messages(
    user_id: int,
    other_user_id: int,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Retrieve live message history between two users, clean expired ghost messages,
    and automatically mark received unread messages as read.
    """
    now = datetime.datetime.utcnow()

    # 1. Clean expired ghost messages
    expired_ghosts = db.query(Message).filter(
        Message.is_ghost == True,
        Message.expire_at.isnot(None),
        Message.expire_at <= now,
        or_(
            and_(Message.sender_id == user_id, Message.receiver_id == other_user_id),
            and_(Message.sender_id == other_user_id, Message.receiver_id == user_id)
        )
    ).all()
    for g in expired_ghosts:
        db.delete(g)
    if expired_ghosts:
        db.commit()

    # 2. Query valid messages
    messages = db.query(Message).filter(
        or_(
            and_(Message.sender_id == user_id, Message.receiver_id == other_user_id),
            and_(Message.sender_id == other_user_id, Message.receiver_id == user_id)
        )
    ).order_by(Message.created_at.asc()).limit(limit).all()

    # 3. Mark incoming unread messages as read
    unread_incoming = [m for m in messages if m.sender_id == other_user_id and not m.is_read]
    if unread_incoming:
        for m in unread_incoming:
            m.is_read = True
            m.status = "read"
        db.commit()

    return [_format_message(m, user_id) for m in messages]


@router.post("/chat/messages", response_model=ChatMessageOut)
async def send_chat_message(data: MessageSendRequest, db: Session = Depends(get_db)):
    """
    Send a live chat message (text, ghost timer, voice note, photo, or star tip).
    Persists to DB and broadcasts instantly to receiver via active WebSocket.
    """
    sender = db.query(User).filter(User.id == data.user_id).first()
    if not sender:
        raise HTTPException(status_code=404, detail="Sender user not found")

    receiver = db.query(User).filter(User.id == data.receiver_id).first()
    if not receiver:
        raise HTTPException(status_code=404, detail="Receiver user not found")

    # Get or create conversation thread
    conv = _get_or_create_conversation(db, data.user_id, data.receiver_id)

    # Handle ghost expiration calculation
    expire_at = None
    if data.is_ghost and data.expire_seconds and data.expire_seconds > 0:
        expire_at = datetime.datetime.utcnow() + datetime.timedelta(seconds=data.expire_seconds)

    # Handle In-Chat Star Tip economy transfer
    if data.stars_tipped and data.stars_tipped > 0:
        # Sender wallet debit
        sender_wallet = db.query(StarWallet).filter(StarWallet.user_id == data.user_id).first()
        if not sender_wallet:
            sender_wallet = StarWallet(user_id=data.user_id, balance=1000)
            db.add(sender_wallet)
            db.flush()

        if sender_wallet.balance < data.stars_tipped:
            raise HTTPException(status_code=400, detail=f"Insufficient Star balance ({sender_wallet.balance} Stars available)")

        sender_wallet.balance -= data.stars_tipped
        sender_wallet.total_spent += data.stars_tipped
        sender_wallet.total_tipped += data.stars_tipped

        # Receiver wallet credit
        receiver_wallet = db.query(StarWallet).filter(StarWallet.user_id == data.receiver_id).first()
        if not receiver_wallet:
            receiver_wallet = StarWallet(user_id=data.receiver_id, balance=0)
            db.add(receiver_wallet)
            db.flush()

        receiver_wallet.balance += data.stars_tipped
        receiver_wallet.total_earned += data.stars_tipped

        # Ledger transaction
        db.add(StarTransaction(
            wallet_id=sender_wallet.id,
            sender_id=data.user_id,
            receiver_id=data.receiver_id,
            type="creator_tip",
            stars_amount=data.stars_tipped,
            note=f"In-chat Star tip to {receiver.first_name} {receiver.surname}"
        ))
        db.add(StarTransaction(
            wallet_id=receiver_wallet.id,
            sender_id=data.user_id,
            receiver_id=data.receiver_id,
            type="creator_tip",
            stars_amount=data.stars_tipped,
            note=f"In-chat Star tip received from {sender.first_name} {sender.surname}"
        ))

    # Create message record
    new_message = Message(
        conversation_id=conv.id,
        sender_id=data.user_id,
        receiver_id=data.receiver_id,
        content=data.content,
        attachment_url=data.attachment_url,
        attachment_type=data.attachment_type,
        reply_to_message_id=data.reply_to_message_id,
        is_read=False,
        is_ghost=bool(data.is_ghost),
        expire_seconds=data.expire_seconds or 0,
        expire_at=expire_at,
        is_e2ee=bool(data.is_e2ee),
        is_voice=bool(data.is_voice),
        voice_url=data.voice_url,
        voice_duration=data.voice_duration or 0,
        voice_transcription=data.voice_transcription,
        stars_tipped=data.stars_tipped or 0,
        status="delivered"
    )
    db.add(new_message)

    # Update conversation timestamp
    conv.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(new_message)

    # Format for both parties
    formatted_for_sender = _format_message(new_message, current_user_id=data.user_id)
    formatted_for_receiver = _format_message(new_message, current_user_id=data.receiver_id)

    # Broadcast in real time via WebSocket
    await manager.send_to_user(data.receiver_id, {
        "type": "new_message",
        "message": formatted_for_receiver
    })
    await manager.send_to_user(data.user_id, {
        "type": "message_sent",
        "message": formatted_for_sender
    })

    return formatted_for_sender


@router.post("/chat/calls/missed")
async def log_missed_call(data: MissedCallLogRequest, db: Session = Depends(get_db)):
    """
    Log an unanswered, rejected, or timed-out call as a Missed Call message in the chat thread.
    Broadcasts in real-time to both caller and receiver so it appears instantly.
    """
    caller = db.query(User).filter(User.id == data.caller_id).first()
    receiver = db.query(User).filter(User.id == data.receiver_id).first()
    if not caller or not receiver:
        raise HTTPException(status_code=404, detail="Caller or Receiver not found")

    conv = _get_or_create_conversation(db, data.caller_id, data.receiver_id)

    content = "Missed video call" if data.call_type == "video" else "Missed audio call"
    att_type = "missed_video_call" if data.call_type == "video" else "missed_audio_call"

    missed_msg = Message(
        conversation_id=conv.id,
        sender_id=data.caller_id,
        receiver_id=data.receiver_id,
        content=content,
        attachment_url=None,
        attachment_type=att_type,
        is_read=False,
        is_ghost=False,
        is_e2ee=True,
        status="delivered"
    )
    db.add(missed_msg)
    conv.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(missed_msg)

    # Format for both parties
    formatted_for_caller = _format_message(missed_msg, current_user_id=data.caller_id)
    formatted_for_receiver = _format_message(missed_msg, current_user_id=data.receiver_id)

    # Broadcast instantly to both users via WebSocket
    await manager.send_to_user(data.receiver_id, {
        "type": "new_message",
        "message": formatted_for_receiver
    })
    await manager.send_to_user(data.caller_id, {
        "type": "message_sent",
        "message": formatted_for_caller
    })

    return formatted_for_caller


@router.post("/chat/messages/{message_id}/react")
async def react_to_message(message_id: int, data: MessageReactionRequest, db: Session = Depends(get_db)):
    """
    Add, update, or toggle an emoji reaction on a message in real-time.
    """
    msg = db.query(Message).filter(Message.id == message_id).first()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")

    existing_reaction = db.query(MessageReaction).filter(
        MessageReaction.message_id == message_id,
        MessageReaction.user_id == data.user_id
    ).first()

    if existing_reaction:
        if existing_reaction.emoji == data.emoji:
            # Toggle off
            db.delete(existing_reaction)
        else:
            # Change emoji
            existing_reaction.emoji = data.emoji
    else:
        # Add reaction
        new_reaction = MessageReaction(
            message_id=message_id,
            user_id=data.user_id,
            emoji=data.emoji
        )
        db.add(new_reaction)

    db.commit()

    # Fetch updated reactions
    reactions = db.query(MessageReaction).filter(MessageReaction.message_id == message_id).all()
    formatted_reactions = []
    for r in reactions:
        formatted_reactions.append({
            "id": r.id,
            "user_id": r.user_id,
            "emoji": r.emoji,
            "user_name": f"{r.user.first_name} {r.user.surname}" if r.user else "User"
        })

    # Broadcast reaction event to both users
    react_payload = {
        "type": "message_reaction",
        "message_id": message_id,
        "reactions": formatted_reactions
    }
    if msg.sender_id:
        await manager.send_to_user(msg.sender_id, react_payload)
    if msg.receiver_id:
        await manager.send_to_user(msg.receiver_id, react_payload)

    return {"success": True, "reactions": formatted_reactions}


@router.post("/chat/messages/mark-read")
async def mark_messages_as_read(data: MarkReadRequest, db: Session = Depends(get_db)):
    """
    Explicitly mark all messages from other_user_id to user_id as read.
    """
    db.query(Message).filter(
        Message.sender_id == data.other_user_id,
        Message.receiver_id == data.user_id,
        Message.is_read == False
    ).update({"is_read": True, "status": "read"})
    db.commit()

    await manager.send_to_user(data.other_user_id, {
        "type": "messages_read",
        "reader_id": data.user_id,
        "sender_id": data.other_user_id
    })
    return {"success": True}


@router.post("/chat/upload")
def upload_chat_attachment(file: UploadFile = File(...)):
    """
    Upload a single image, audio clip, or file attachment for chat.
    """
    chat_uploads_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads", "chat")
    os.makedirs(chat_uploads_dir, exist_ok=True)

    ext = os.path.splitext(file.filename)[1] if file.filename else ".jpg"
    unique_filename = f"chat_{uuid.uuid4().hex[:12]}{ext}"
    dest_path = os.path.join(chat_uploads_dir, unique_filename)

    with open(dest_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {
        "url": f"/uploads/chat/{unique_filename}",
        "filename": unique_filename,
        "content_type": file.content_type
    }


@router.post("/chat/upload-multiple")
def upload_multiple_chat_attachments(files: List[UploadFile] = File(...)):
    """
    Upload multiple images or media attachments at once for rich batch messaging.
    """
    chat_uploads_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads", "chat")
    os.makedirs(chat_uploads_dir, exist_ok=True)

    uploaded_items = []
    for file in files:
        ext = os.path.splitext(file.filename)[1] if file.filename else ".jpg"
        unique_filename = f"chat_{uuid.uuid4().hex[:12]}{ext}"
        dest_path = os.path.join(chat_uploads_dir, unique_filename)

        with open(dest_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        uploaded_items.append({
            "url": f"/uploads/chat/{unique_filename}",
            "filename": unique_filename,
            "content_type": file.content_type
        })

    return {
        "success": True,
        "files": uploaded_items,
        "count": len(uploaded_items)
    }


@router.delete("/chat/conversations/{other_user_id}")
def clear_conversation(other_user_id: int, user_id: int, db: Session = Depends(get_db)):
    """
    Clear all messages between two users in the chat history.
    """
    db.query(Message).filter(
        or_(
            and_(Message.sender_id == user_id, Message.receiver_id == other_user_id),
            and_(Message.sender_id == other_user_id, Message.receiver_id == user_id)
        )
    ).delete(synchronize_session=False)
    db.commit()
    return {"success": True, "message": "Conversation history cleared successfully"}


@router.delete("/chat/messages/{message_id}")
async def delete_chat_message(
    message_id: int, 
    user_id: int, 
    delete_type: Optional[str] = Query("everyone"), 
    db: Session = Depends(get_db)
):
    """
    Delete a specific message from chat (Delete for Everyone or Delete for Me).
    Broadcasts message_deleted event via WebSocket to both sender and receiver in real-time.
    """
    msg = db.query(Message).filter(Message.id == message_id).first()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")

    sender_id = msg.sender_id
    receiver_id = msg.receiver_id
    is_sender = (sender_id == user_id)

    if delete_type == "everyone":
        if not is_sender:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail="Only the sender can delete this message for everyone."
            )
        # Sender deletes for everyone: delete from DB and notify both parties
        db.delete(msg)
        db.commit()

        del_payload = {
            "type": "message_deleted",
            "message_id": message_id,
            "sender_id": sender_id,
            "receiver_id": receiver_id,
            "delete_type": "everyone"
        }
        if receiver_id:
            await manager.send_to_user(receiver_id, del_payload)
        if sender_id:
            await manager.send_to_user(sender_id, del_payload)

        return {"success": True, "message_id": message_id, "message": "Message deleted for everyone"}

    else:
        # delete_type == "me" (Only notify the requesting user)
        del_payload = {
            "type": "message_deleted",
            "message_id": message_id,
            "sender_id": sender_id,
            "receiver_id": receiver_id,
            "delete_type": "me"
        }
        await manager.send_to_user(user_id, del_payload)
        return {"success": True, "message_id": message_id, "message": "Message deleted for you"}


