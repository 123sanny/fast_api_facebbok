import os
import shutil
import uuid
from fastapi import UploadFile

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
os.makedirs(os.path.join(UPLOAD_DIR, "profile"), exist_ok=True)
os.makedirs(os.path.join(UPLOAD_DIR, "cover"), exist_ok=True)


def save_uploaded_file(file: UploadFile, folder: str) -> str:
    """File ko disk pe save karta hai aur public-facing full HTTP URL return karta hai."""
    ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    filename = f"{uuid.uuid4()}.{ext}"
    folder_path = os.path.join(UPLOAD_DIR, folder)
    os.makedirs(folder_path, exist_ok=True)
    file_path = os.path.join(folder_path, filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return f"http://localhost:8000/uploads/{folder}/{filename}"