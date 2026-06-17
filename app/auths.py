from datetime import datetime, timedelta
from jose import jwt
from passlib.context import CryptContext

SECRET_KEY = "secret123"
ALGORITHM = "HS256"

pwd_context = CryptContext(schemes=["bcrypt"])


def hash_password(password: str):
    return pwd_context.hash(password)


def verify_password(password, hashed):
    return pwd_context.verify(password, hashed)


def create_token(data: dict):

    expire = datetime.utcnow() + timedelta(hours=24)
    data.update({"exp": expire})

    return jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)