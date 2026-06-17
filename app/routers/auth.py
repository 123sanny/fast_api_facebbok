from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models.user import User
from auth.jwt_handler import (
    create_access_token,
    create_refresh_token
)

from utils.hashing import verify_password
from auth.dependencies import oauth2_scheme

from models.session import UserSession
from models.settings import (
    UserSettings, PrivacySettings, NotificationSettings,
    SecuritySettings, TimeManagement, LanguageSettings,
    AdPreferences, PaymentSettings
)
from schemas.user import RegisterRequest, RegisterResponse
from utils.hashing import hash_password

from schemas.auth import LoginSchema

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/signup", response_model=RegisterResponse, status_code=status.HTTP_201_CREATED)
def signup(data: RegisterRequest, db: Session = Depends(get_db)):

    # 1. Check karo email already exist to nahi karta
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # 2. Password hash karo
    hashed = hash_password(data.password)

    # 3. Naya user banao
    new_user = User(
    first_name=data.first_name,
    surname=data.surname,
    mobile=data.mobile,
    gender=data.gender,
    dob=data.dob,
    email=data.email,
    password=hashed,
    profile_pic="",
    bio=""
)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # 4. Default settings automatically create karo
    db.add(UserSettings(user_id=new_user.id))
    db.add(PrivacySettings(user_id=new_user.id))
    db.add(NotificationSettings(user_id=new_user.id))
    db.add(SecuritySettings(user_id=new_user.id))
    db.add(TimeManagement(user_id=new_user.id))
    db.add(LanguageSettings(user_id=new_user.id))
    db.add(AdPreferences(user_id=new_user.id))
    db.add(PaymentSettings(user_id=new_user.id))
    db.commit()

    return {
        "id": new_user.id,
        "first_name": new_user.first_name,
        "email": new_user.email,
        "surname": new_user.surname,
        "message": "Registration successful!"
    }
    
@router.post("/login")
def login(data: LoginSchema, db: Session = Depends(get_db)):

    user = db.query (User).filter(
        User.email == data.email
    ).first()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials"
        )

    if not verify_password(data.password, user.password):
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials"
        )

    access_token = create_access_token(
        {"user_id": user.id}
    )

    refresh_token = create_refresh_token(
        {"user_id": user.id}
    )

    session = UserSession(
        user_id=user.id,
        access_token=access_token,
        refresh_token=refresh_token
    )

    db.add(session)
    db.commit()

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "user_id": user.id,
        "first_name": user.first_name,
        "surname": user.surname
    }
    

@router.post("/logout")
def logout(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):

    session = db.query(UserSession).filter(
        UserSession.access_token == token
    ).first()

    if session:
        db.delete(session)
        db.commit()

    return {
        "message": "Logged out"
    }