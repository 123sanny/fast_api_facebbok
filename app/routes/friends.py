from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app import models

router = APIRouter()


def get_db():
    db = SessionLocal()
    yield db
    db.close()


@router.post("/send_request")
def send_request(sender: int, receiver: int, db: Session = Depends(get_db)):

    req = models.FriendRequest(
        sender=sender,
        receiver=receiver,
        status="pending"
    )

    db.add(req)
    db.commit()

    return {"message": "Request sent"}


@router.post("/accept_request")
def accept_request(request_id: int, db: Session = Depends(get_db)):

    req = db.query(models.FriendRequest).filter(
        models.FriendRequest.id == request_id
    ).first()

    req.status = "accepted"

    db.commit()

    return {"message": "Friend request accepted"}