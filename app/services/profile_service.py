from sqlalchemy.orm import Session

from models.profile import Profile, ProfilePhoto, PhotoType


def get_or_create_profile(db: Session, user_id: int) -> Profile:
    """Agar user ka profile row already nahi bana, to yaha pehli baar bana diya jata hai."""
    profile = db.query(Profile).filter(Profile.user_id == user_id).first()
    if not profile:
        profile = Profile(user_id=user_id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile


def set_active_photo(db: Session, profile_id: int, photo_type: PhotoType, photo: ProfilePhoto):
    """Purani active photo ko deactivate karke, nayi ko active banata hai."""
    db.query(ProfilePhoto).filter(
        ProfilePhoto.profile_id == profile_id,
        ProfilePhoto.photo_type == photo_type,
        ProfilePhoto.is_active == True,
    ).update({"is_active": False})
    photo.is_active = True
    db.commit()