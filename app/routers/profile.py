from typing import List

from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from utils.profile import save_uploaded_file
from services.profile_service import get_or_create_profile, set_active_photo
from models.profile import ProfilePhoto, PhotoType
from schemas.profile import ProfileOut, ProfilePhotoOut, SelectPhotoRequest

router = APIRouter(prefix="/users/{user_id}", tags=["Profile & Cover Photo"])


@router.get("/profile", response_model=ProfileOut)
def get_profile(user_id: int, db: Session = Depends(get_db)):
    return get_or_create_profile(db, user_id)


# ------------------------------------------------------------------
# "Upload Photo" -> Profile picture
# ------------------------------------------------------------------
@router.post("/profile-image")
def upload_profile_image(user_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    profile = get_or_create_profile(db, user_id)

    photo_url = save_uploaded_file(file, "profile")

    new_photo = ProfilePhoto(profile_id=profile.id, photo_url=photo_url, photo_type=PhotoType.profile)
    db.add(new_photo)
    db.commit()
    db.refresh(new_photo)

    set_active_photo(db, profile.id, PhotoType.profile, new_photo)

    profile.profile_pic = photo_url
    db.commit()

    return {"message": "Profile picture updated", "profile_pic": photo_url}


# ------------------------------------------------------------------
# "Upload Photo" -> Cover photo
# ------------------------------------------------------------------
@router.post("/cover-photo")
def upload_cover_photo(user_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    profile = get_or_create_profile(db, user_id)

    photo_url = save_uploaded_file(file, "cover")

    new_photo = ProfilePhoto(profile_id=profile.id, photo_url=photo_url, photo_type=PhotoType.cover)
    db.add(new_photo)
    db.commit()
    db.refresh(new_photo)

    set_active_photo(db, profile.id, PhotoType.cover, new_photo)

    profile.cover_photo = photo_url
    db.commit()

    return {"message": "Cover photo updated", "cover_photo": photo_url}


# ------------------------------------------------------------------
# "See cover photo" -> current cover dikhana
# ------------------------------------------------------------------
@router.get("/cover-photo")
def get_current_cover_photo(user_id: int, db: Session = Depends(get_db)):
    profile = get_or_create_profile(db, user_id)
    return {"cover_photo": profile.cover_photo}


# ------------------------------------------------------------------
# "Choose cover photo" -> purani uploaded photos ki list + select
# ------------------------------------------------------------------
@router.get("/cover-photos", response_model=List[ProfilePhotoOut])
def list_cover_photos(user_id: int, db: Session = Depends(get_db)):
    profile = get_or_create_profile(db, user_id)
    photos = (
        db.query(ProfilePhoto)
        .filter(ProfilePhoto.profile_id == profile.id, ProfilePhoto.photo_type == PhotoType.cover)
        .order_by(ProfilePhoto.uploaded_at.desc())
        .all()
    )
    return photos


@router.put("/cover-photo/select")
def select_cover_photo(user_id: int, payload: SelectPhotoRequest, db: Session = Depends(get_db)):
    profile = get_or_create_profile(db, user_id)

    photo = (
        db.query(ProfilePhoto)
        .filter(
            ProfilePhoto.id == payload.photo_id,
            ProfilePhoto.profile_id == profile.id,
            ProfilePhoto.photo_type == PhotoType.cover,
        )
        .first()
    )
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")

    set_active_photo(db, profile.id, PhotoType.cover, photo)

    profile.cover_photo = photo.photo_url
    db.commit()

    return {"message": "Cover photo selected", "cover_photo": photo.photo_url}