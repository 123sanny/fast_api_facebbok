from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app import models, schemas, auth
from app.database import SessionLocal

router = APIRouter()


def get_db():
    db = SessionLocal()
    yield db
    db.close()


@router.post("/signup")
def signup(user: schemas.UserCreate, db: Session = Depends(get_db)):

    hashed = auth.hash_password(user.password)

    new_user = models.User(
        username=user.username,
        email=user.email,
        password=hashed,
        surname =user.surname,
        phone= user.phone,
        gender=user.gender,
        date_of_birth=user.date_of_birth
        
    )

    db.add(new_user)
    db.commit()

    return {"message": "User created"}


@router.post("/login")
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):

    db_user = db.query(models.User).filter(
        models.User.email == user.email
    ).first()

    if not db_user:
        return {"error": "User not found"}

    if not auth.verify_password(user.password, db_user.password):
        return {"error": "Wrong password"}

    token = auth.create_token({"user_id": db_user.id})
    

    return {"access_token": token}