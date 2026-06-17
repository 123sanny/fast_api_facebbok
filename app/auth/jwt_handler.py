from jose import jwt
from datetime import datetime, timedelta

SECRET_KEY = "mysecretkey"
ALGORITHM = "HS256"

def create_access_token(data):
    payload = data.copy()
    payload["exp"] = datetime.utcnow() + timedelta(hours=1)

    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM
    )


def create_refresh_token(data):
    payload = data.copy()
    payload["exp"] = datetime.utcnow() + timedelta(days=30)

    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM
    )