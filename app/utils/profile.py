import os
import shutil
import uuid

from fastapi import UploadFile

# Aapke project me already "app/services/uploads" folder maujood hai,
# isliye usi ko reuse kar rahe hai.
UPLOAD_DIR = "uploads"
os.makedirs(f"{UPLOAD_DIR}/profile", exist_ok=True)
os.makedirs(f"{UPLOAD_DIR}/cover", exist_ok=True)


def save_uploaded_file(file: UploadFile, folder: str) -> str:
    """File ko disk pe save karta hai aur public-facing path return karta hai.
    Production me isko S3 / Cloudinary se replace kar sakte ho."""
    ext = file.filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    path = f"{UPLOAD_DIR}/{folder}/{filename}"
    with open(path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return f"/{path}"