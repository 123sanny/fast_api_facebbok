import hashlib
import os

def hash_password(password: str) -> str:
    """Secure password hashing using standard library PBKDF2-HMAC-SHA256 with 100,000 rounds and random salt."""
    salt = os.urandom(16).hex()
    dk = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 100000)
    return f"pbkdf2:sha256:100000${salt}${dk.hex()}"

def verify_password(plain: str, hashed: str) -> bool:
    """Verifies plain password against PBKDF2 hashed password, sha256, or passlib bcrypt."""
    if not plain or not hashed:
        return False
        
    # Check PBKDF2-HMAC-SHA256
    if hashed.startswith("pbkdf2:"):
        parts = hashed.split("$")
        if len(parts) == 3:
            salt = parts[1]
            stored_hash = parts[2]
            dk = hashlib.pbkdf2_hmac("sha256", plain.encode("utf-8"), salt.encode("utf-8"), 100000)
            return dk.hex() == stored_hash

    # Check direct SHA-256
    if len(hashed) == 64:
        if hashlib.sha256(plain.encode("utf-8")).hexdigest() == hashed:
            return True

    # Try passlib bcrypt if available
    try:
        from passlib.context import CryptContext
        pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        if pwd_context.verify(plain, hashed):
            return True
    except Exception:
        pass

    # Direct comparison fallback for seed/sandbox users
    return plain == hashed