import json
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, status, Query, Body
from sqlalchemy.orm import Session

from database import get_db
from utils.profile import save_uploaded_file
from services.profile_service import (
    get_or_create_profile,
    profile_to_full_dict,
    set_active_photo,
    get_user_posts_data,
    get_all_feed_posts_data,
    create_new_post,
    get_user_photos_data,
    get_user_reels_data,
    purchase_or_activate_blue_tick,
    toggle_blue_tick,
    react_to_post,
    add_post_comment,
    share_post_item
)
from models.profile import ProfilePhoto, PhotoType
from models.ghost import GhostModeSettings
from models.social import Follow
from models.user import User
from schemas.profile import (
    ProfileFullOut, ProfilePhotoOut,
    PhotoUrlUpdate, CoverAdjustUpdate,
    BioUpdate, PinnedDetailsUpdate, CategoryUpdate,
    PersonalDetailsUpdate, FamilyPetsUpdate,
    WorkUpdate, EducationUpdate, HobbiesUpdate,
    InterestsUpdate, PlacesUpdate, CommunitiesUpdate,
    OffersUpdate, SocialsUpdate, MediaKitUpdate, BadgesUpdate,
    VerificationPurchaseRequest
)

router = APIRouter(prefix="/users/{user_id}", tags=["User Profile & Section APIs"])


# =====================================================================
# 0. UNIFIED FULL PROFILE & DYNAMIC STATS
# =====================================================================
@router.get("/profile", response_model=ProfileFullOut)
@router.get("/profile/full", response_model=ProfileFullOut)
def get_full_profile(
    user_id: int,
    viewer_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    """Fetch complete unified profile details across all 16 sections + live social graph counts."""
    profile = get_or_create_profile(db, user_id)
    return profile_to_full_dict(profile, db=db, current_user_id=viewer_id)


@router.get("/profile/metrics")
def get_profile_metrics(
    user_id: int,
    viewer_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    """Fetch live counters: followers, friends, posts, photos, reels, stars, badges."""
    profile = get_or_create_profile(db, user_id)
    d = profile_to_full_dict(profile, db=db, current_user_id=viewer_id)
    return {
        "user_id": user_id,
        "friends_count": d["friends_count"],
        "followers_count": d["followers_count"],
        "following_count": d["following_count"],
        "posts_count": d["posts_count"],
        "photos_count": d["photos_count"],
        "reels_count": d["reels_count"],
        "stars_count": d["stars_count"],
        "truthguard_score": d["truthguard_score"],
        "is_following": d["is_following"],
        "is_friend": d["is_friend"],
        "friend_status": d["friend_status"],
        "badges": d["badges"]
    }


# =====================================================================
posts_router = APIRouter(prefix="/posts", tags=["Post Engagements & Interactions"])


# =====================================================================
# DYNAMIC USER CONTENT: POSTS, PHOTOS, REELS, FOLLOW
# =====================================================================
@router.get("/posts")
def list_user_posts(
    user_id: int,
    viewer_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    """Fetch all posts created by this user from database with viewer context."""
    return {"success": True, "data": get_user_posts_data(db, user_id, viewer_id=viewer_id)}


@router.get("/photos")
def list_user_photos(
    user_id: int,
    viewer_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    """Fetch all gallery photos uploaded by this user with live like and comment data."""
    return {"success": True, "data": get_user_photos_data(db, user_id, viewer_id=viewer_id)}


@router.get("/reels")
def list_user_reels(user_id: int, db: Session = Depends(get_db)):
    """Fetch all video reels created by this user."""
    return {"success": True, "data": get_user_reels_data(db, user_id)}


@router.post("/follow")
def toggle_user_follow(
    user_id: int,
    follower_id: int = Query(...),
    db: Session = Depends(get_db)
):
    """Toggle follow status between follower_id and target user_id."""
    if follower_id == user_id:
        return {"success": False, "message": "Cannot follow yourself"}

    existing = db.query(Follow).filter(
        Follow.follower_id == follower_id,
        Follow.following_id == user_id
    ).first()

    if existing:
        db.delete(existing)
        db.commit()
        return {"success": True, "is_following": False, "message": "Unfollowed user"}
    else:
        new_follow = Follow(follower_id=follower_id, following_id=user_id)
        db.add(new_follow)
        db.commit()
        return {"success": True, "is_following": True, "message": "Now following user"}


# =====================================================================
# GLOBAL COMMUNITY FEED & POST CREATION
# =====================================================================
@posts_router.get("/feed")
@posts_router.get("")
def get_global_feed(
    viewer_id: Optional[int] = Query(None),
    limit: int = Query(100, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """Fetch global feed containing posts from all community users."""
    feed_data = get_all_feed_posts_data(db, viewer_id=viewer_id, limit=limit, offset=offset)
    return {"success": True, "data": feed_data}


@posts_router.post("")
@posts_router.post("/create")
def publish_post(
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """Create a new post in database published to global feed and author's profile."""
    user_id = int(payload.get("user_id", 1))
    content = payload.get("content") or payload.get("caption")
    image_url = payload.get("image_url") or payload.get("image")
    video_url = payload.get("video_url") or payload.get("video")
    feeling = payload.get("feeling")
    location = payload.get("location")
    privacy = payload.get("privacy", "public")
    is_ghost = bool(payload.get("is_ghost", False))
    ghost_alias = payload.get("ghost_alias")

    return create_new_post(
        db=db,
        user_id=user_id,
        content=content,
        image_url=image_url,
        video_url=video_url,
        feeling=feeling,
        location=location,
        privacy=privacy,
        is_ghost=is_ghost,
        ghost_alias=ghost_alias,
        music_title=payload.get("music_title"),
        music_artist=payload.get("music_artist"),
        music_url=payload.get("music_url"),
        music_cover=payload.get("music_cover"),
        music_duration=payload.get("music_duration")
    )


# =====================================================================
# LIVE POST & PHOTO ENGAGEMENT: REACT, COMMENT, SHARE
# =====================================================================
@posts_router.post("/{post_id}/react")
@router.post("/posts/{post_id}/react")
def post_react(
    post_id: int,
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """Toggle reaction/like on a post or photo, and notify author."""
    user_id = int(payload.get("user_id", 1))
    reaction_type = str(payload.get("reaction_type", "like"))
    return react_to_post(db, post_id, user_id, reaction_type)


@posts_router.post("/{post_id}/comments")
@router.post("/posts/{post_id}/comments")
def post_comment(
    post_id: int,
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """Add a new comment on post/photo and notify author."""
    user_id = int(payload.get("user_id", 1))
    content = str(payload.get("content", ""))
    return add_post_comment(db, post_id, user_id, content)


@posts_router.post("/{post_id}/share")
@router.post("/posts/{post_id}/share")
def post_share(
    post_id: int,
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """Share a post/photo and notify author."""
    user_id = int(payload.get("user_id", 1))
    return share_post_item(db, post_id, user_id)


# =====================================================================
# 1. AVATAR & COVER PHOTO (File Upload & URLs)
# =====================================================================
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

    return {"message": "Profile avatar updated successfully", "profile_pic": photo_url}


@router.put("/profile/avatar-url")
def update_profile_avatar_url(user_id: int, payload: PhotoUrlUpdate, db: Session = Depends(get_db)):
    profile = get_or_create_profile(db, user_id)
    profile.profile_pic = payload.photo_url
    db.commit()
    return {"message": "Avatar URL updated", "profile_pic": profile.profile_pic}


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

    return {"message": "Cover photo updated successfully", "cover_photo": photo_url}


@router.put("/profile/cover-url")
def update_profile_cover_url(user_id: int, payload: PhotoUrlUpdate, db: Session = Depends(get_db)):
    profile = get_or_create_profile(db, user_id)
    profile.cover_photo = payload.photo_url
    db.commit()
    return {"message": "Cover URL updated", "cover_photo": profile.cover_photo}


@router.put("/profile/cover/adjust")
def adjust_cover_position(user_id: int, payload: CoverAdjustUpdate, db: Session = Depends(get_db)):
    profile = get_or_create_profile(db, user_id)
    profile.cover_photo_offset_y = payload.offset_y
    profile.cover_photo_zoom = payload.zoom
    db.commit()
    return {
        "message": "Cover photo positioning adjusted",
        "offset_y": profile.cover_photo_offset_y,
        "zoom": profile.cover_photo_zoom
    }


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


# =====================================================================
# 2. BIO & INTRO QUOTE
# =====================================================================
@router.get("/profile/bio")
def get_bio(user_id: int, db: Session = Depends(get_db)):
    profile = get_or_create_profile(db, user_id)
    return {"bio": profile.bio, "intro_quote": profile.intro_quote}


@router.put("/profile/bio")
def update_bio(user_id: int, payload: BioUpdate, db: Session = Depends(get_db)):
    profile = get_or_create_profile(db, user_id)
    if payload.bio is not None:
        profile.bio = payload.bio
    if payload.intro_quote is not None:
        profile.intro_quote = payload.intro_quote
    db.commit()
    return {"message": "Bio & Intro updated successfully", "bio": profile.bio, "intro_quote": profile.intro_quote}


# =====================================================================
# 3. PINNED DETAILS
# =====================================================================
@router.get("/profile/pinned")
def get_pinned_details(user_id: int, db: Session = Depends(get_db)):
    profile = get_or_create_profile(db, user_id)
    try:
        pinned = json.loads(profile.pinned_details) if profile.pinned_details else []
    except Exception:
        pinned = []
    return {"pinned_details": pinned}


@router.put("/profile/pinned")
def update_pinned_details(user_id: int, payload: PinnedDetailsUpdate, db: Session = Depends(get_db)):
    profile = get_or_create_profile(db, user_id)
    profile.pinned_details = json.dumps(payload.pinned_details)
    db.commit()
    return {"message": "Pinned details updated", "pinned_details": payload.pinned_details}


# =====================================================================
# 4. CATEGORY & AI CREATOR STATUS
# =====================================================================
@router.get("/profile/category")
def get_category(user_id: int, db: Session = Depends(get_db)):
    profile = get_or_create_profile(db, user_id)
    try:
        cats = json.loads(profile.categories) if profile.categories else []
    except Exception:
        cats = []
    return {"categories": cats, "is_ai_creator": profile.is_ai_creator}


@router.put("/profile/category")
def update_category(user_id: int, payload: CategoryUpdate, db: Session = Depends(get_db)):
    profile = get_or_create_profile(db, user_id)
    profile.categories = json.dumps(payload.categories)
    profile.is_ai_creator = payload.is_ai_creator
    db.commit()
    return {
        "message": "Category & AI Creator status updated",
        "categories": payload.categories,
        "is_ai_creator": profile.is_ai_creator
    }


# =====================================================================
# 5. PERSONAL DETAILS (City, Hometown, DOB, Gender, Pronouns, Languages)
# =====================================================================
@router.get("/profile/personal")
def get_personal_details(user_id: int, db: Session = Depends(get_db)):
    profile = get_or_create_profile(db, user_id)
    try:
        langs = json.loads(profile.languages) if profile.languages else []
    except Exception:
        langs = []
    return {
        "current_city": profile.current_city,
        "hometown": profile.hometown,
        "relationship_status": profile.relationship_status,
        "dob_month_day": profile.dob_month_day,
        "dob_year": profile.dob_year,
        "dob_privacy": profile.dob_privacy,
        "gender": profile.gender,
        "pronouns": profile.pronouns,
        "languages": langs
    }


@router.put("/profile/personal")
def update_personal_details(user_id: int, payload: PersonalDetailsUpdate, db: Session = Depends(get_db)):
    profile = get_or_create_profile(db, user_id)
    if payload.current_city is not None:
        profile.current_city = payload.current_city
    if payload.hometown is not None:
        profile.hometown = payload.hometown
    if payload.relationship_status is not None:
        profile.relationship_status = payload.relationship_status
    if payload.dob_month_day is not None:
        profile.dob_month_day = payload.dob_month_day
    if payload.dob_year is not None:
        profile.dob_year = payload.dob_year
    if payload.dob_privacy is not None:
        profile.dob_privacy = payload.dob_privacy
    if payload.gender is not None:
        profile.gender = payload.gender
    if payload.pronouns is not None:
        profile.pronouns = payload.pronouns
    if payload.languages is not None:
        profile.languages = json.dumps(payload.languages)

    db.commit()
    return {"message": "Personal details updated successfully"}


# =====================================================================
# 6. FAMILY MEMBERS & PETS
# =====================================================================
@router.get("/profile/family")
def get_family_and_pets(user_id: int, db: Session = Depends(get_db)):
    profile = get_or_create_profile(db, user_id)
    try:
        fam = json.loads(profile.family_members) if profile.family_members else []
        pets = json.loads(profile.pets) if profile.pets else []
    except Exception:
        fam, pets = [], []
    return {"family_members": fam, "pets": pets}


@router.put("/profile/family")
def update_family_and_pets(user_id: int, payload: FamilyPetsUpdate, db: Session = Depends(get_db)):
    profile = get_or_create_profile(db, user_id)
    profile.family_members = json.dumps(payload.family_members)
    profile.pets = json.dumps(payload.pets)
    db.commit()
    return {"message": "Family and pets updated successfully"}


# =====================================================================
# 7. WORK EXPERIENCE
# =====================================================================
@router.get("/profile/work")
def get_work(user_id: int, db: Session = Depends(get_db)):
    profile = get_or_create_profile(db, user_id)
    return {
        "work_workplace": profile.work_workplace,
        "work_job_title": profile.work_job_title,
        "work_privacy": profile.work_privacy
    }


@router.put("/profile/work")
def update_work(user_id: int, payload: WorkUpdate, db: Session = Depends(get_db)):
    profile = get_or_create_profile(db, user_id)
    if payload.work_workplace is not None:
        profile.work_workplace = payload.work_workplace
    if payload.work_job_title is not None:
        profile.work_job_title = payload.work_job_title
    if payload.work_privacy is not None:
        profile.work_privacy = payload.work_privacy
    db.commit()
    return {"message": "Work experience updated successfully"}


# =====================================================================
# 8. EDUCATION DETAILS
# =====================================================================
@router.get("/profile/education")
def get_education(user_id: int, db: Session = Depends(get_db)):
    profile = get_or_create_profile(db, user_id)
    return {
        "education_school": profile.education_school,
        "education_college": profile.education_college,
        "education_degree": profile.education_degree,
        "education_privacy": profile.education_privacy
    }


@router.put("/profile/education")
def update_education(user_id: int, payload: EducationUpdate, db: Session = Depends(get_db)):
    profile = get_or_create_profile(db, user_id)
    if payload.education_school is not None:
        profile.education_school = payload.education_school
    if payload.education_college is not None:
        profile.education_college = payload.education_college
    if payload.education_degree is not None:
        profile.education_degree = payload.education_degree
    if payload.education_privacy is not None:
        profile.education_privacy = payload.education_privacy
    db.commit()
    return {"message": "Education details updated successfully"}


# =====================================================================
# 9. HOBBIES
# =====================================================================
@router.get("/profile/hobbies")
def get_hobbies(user_id: int, db: Session = Depends(get_db)):
    profile = get_or_create_profile(db, user_id)
    try:
        hobbies = json.loads(profile.hobbies) if profile.hobbies else []
    except Exception:
        hobbies = []
    return {"hobbies": hobbies}


@router.put("/profile/hobbies")
def update_hobbies(user_id: int, payload: HobbiesUpdate, db: Session = Depends(get_db)):
    profile = get_or_create_profile(db, user_id)
    profile.hobbies = json.dumps(payload.hobbies)
    db.commit()
    return {"message": "Hobbies updated successfully", "hobbies": payload.hobbies}


# =====================================================================
# 10. INTERESTS
# =====================================================================
@router.get("/profile/interests")
def get_interests(user_id: int, db: Session = Depends(get_db)):
    profile = get_or_create_profile(db, user_id)
    try:
        interests = json.loads(profile.interests) if profile.interests else {}
    except Exception:
        interests = {}
    return {"interests": interests}


@router.put("/profile/interests")
def update_interests(user_id: int, payload: InterestsUpdate, db: Session = Depends(get_db)):
    profile = get_or_create_profile(db, user_id)
    profile.interests = json.dumps({
        "music": payload.music,
        "tv_programmes": payload.tv_programmes,
        "films": payload.films,
        "games": payload.games,
        "sports": payload.sports
    })
    db.commit()
    return {"message": "Interests updated successfully"}


# =====================================================================
# 11. VISITED PLACES / TRAVEL
# =====================================================================
@router.get("/profile/places")
def get_places(user_id: int, db: Session = Depends(get_db)):
    profile = get_or_create_profile(db, user_id)
    try:
        places = json.loads(profile.visited_places) if profile.visited_places else []
    except Exception:
        places = []
    return {"visited_places": places, "places_privacy": profile.places_privacy}


@router.put("/profile/places")
def update_places(user_id: int, payload: PlacesUpdate, db: Session = Depends(get_db)):
    profile = get_or_create_profile(db, user_id)
    profile.visited_places = json.dumps(payload.visited_places)
    if payload.places_privacy:
        profile.places_privacy = payload.places_privacy
    db.commit()
    return {"message": "Visited places updated successfully", "visited_places": payload.visited_places}


# =====================================================================
# 12. COMMUNITIES & GROUPS
# =====================================================================
@router.get("/profile/communities")
def get_communities(user_id: int, db: Session = Depends(get_db)):
    profile = get_or_create_profile(db, user_id)
    try:
        comms = json.loads(profile.communities) if profile.communities else []
    except Exception:
        comms = []
    return {"communities": comms}


@router.put("/profile/communities")
def update_communities(user_id: int, payload: CommunitiesUpdate, db: Session = Depends(get_db)):
    profile = get_or_create_profile(db, user_id)
    profile.communities = json.dumps(payload.communities)
    db.commit()
    return {"message": "Communities updated successfully"}


# =====================================================================
# 13. OFFERS & DEALS
# =====================================================================
@router.get("/profile/offers")
def get_offers(user_id: int, db: Session = Depends(get_db)):
    profile = get_or_create_profile(db, user_id)
    try:
        offers = json.loads(profile.offers) if profile.offers else []
    except Exception:
        offers = []
    return {"offers": offers}


@router.put("/profile/offers")
def update_offers(user_id: int, payload: OffersUpdate, db: Session = Depends(get_db)):
    profile = get_or_create_profile(db, user_id)
    profile.offers = json.dumps(payload.offers)
    db.commit()
    return {"message": "Offers updated successfully"}


# =====================================================================
# 14. SOCIAL HANDLES & CONTACT INFO
# =====================================================================
@router.get("/profile/socials")
def get_socials(user_id: int, db: Session = Depends(get_db)):
    profile = get_or_create_profile(db, user_id)
    try:
        handles = json.loads(profile.social_handles) if profile.social_handles else {}
        custom_links = json.loads(profile.custom_links) if profile.custom_links else []
    except Exception:
        handles, custom_links = {}, []
    return {
        "social_handles": handles,
        "custom_links": custom_links,
        "website_link": profile.website_link,
        "contact_phone": profile.contact_phone,
        "contact_email": profile.contact_email,
        "contact_privacy": profile.contact_privacy
    }


@router.put("/profile/socials")
def update_socials(user_id: int, payload: SocialsUpdate, db: Session = Depends(get_db)):
    profile = get_or_create_profile(db, user_id)
    if payload.social_handles is not None:
        profile.social_handles = json.dumps(payload.social_handles)
    if payload.custom_links is not None:
        profile.custom_links = json.dumps(payload.custom_links)
    if payload.website_link is not None:
        profile.website_link = payload.website_link
    if payload.contact_phone is not None:
        profile.contact_phone = payload.contact_phone
    if payload.contact_email is not None:
        profile.contact_email = payload.contact_email
    if payload.contact_privacy is not None:
        profile.contact_privacy = payload.contact_privacy
    db.commit()
    return {"message": "Social handles & contact details updated successfully"}


# =====================================================================
# 15. CREATOR MEDIA KIT
# =====================================================================
@router.get("/profile/media-kit")
def get_media_kit(user_id: int, db: Session = Depends(get_db)):
    profile = get_or_create_profile(db, user_id)
    return {
        "media_kit_title": profile.media_kit_title,
        "media_kit_link": profile.media_kit_link,
        "media_kit_privacy": profile.media_kit_privacy
    }


@router.put("/profile/media-kit")
def update_media_kit(user_id: int, payload: MediaKitUpdate, db: Session = Depends(get_db)):
    profile = get_or_create_profile(db, user_id)
    if payload.media_kit_title is not None:
        profile.media_kit_title = payload.media_kit_title
    if payload.media_kit_link is not None:
        profile.media_kit_link = payload.media_kit_link
    if payload.media_kit_privacy is not None:
        profile.media_kit_privacy = payload.media_kit_privacy
    db.commit()
    return {"message": "Creator Media Kit updated successfully"}


# =====================================================================
# 16. VERIFIED TRUST BADGES
# =====================================================================
@router.get("/profile/badges")
def get_badges(user_id: int, db: Session = Depends(get_db)):
    profile = get_or_create_profile(db, user_id)
    try:
        badges = json.loads(profile.badges) if profile.badges else []
    except Exception:
        badges = []
    return {"badges": badges, "aadhaar_verified": profile.aadhaar_verified}


@router.put("/profile/badges")
def update_badges(user_id: int, payload: BadgesUpdate, db: Session = Depends(get_db)):
    profile = get_or_create_profile(db, user_id)
    profile.badges = json.dumps(payload.badges)
    profile.aadhaar_verified = payload.aadhaar_verified
    db.commit()
    return {"message": "Badges updated successfully", "badges": payload.badges, "aadhaar_verified": profile.aadhaar_verified}


# =====================================================================
# 17. GHOST PROTOCOL & ZERO-TRACE PRIVACY
# =====================================================================
@router.get("/ghost-settings")
def get_ghost_settings(user_id: int, db: Session = Depends(get_db)):
    """Fetch user's Ghost Mode anonymous persona, self-destruct timers, and privacy locks."""
    ghost = db.query(GhostModeSettings).filter(GhostModeSettings.user_id == user_id).first()
    if not ghost:
        ghost = GhostModeSettings(
            user_id=user_id,
            is_ghost_enabled=False,
            ghost_alias=f"QuantumGhost#{user_id + 100}",
            ghost_avatar=f"https://api.dicebear.com/7.x/bottts/svg?seed=QuantumGhost{user_id}",
            default_timer_seconds=15,
            burn_on_read=True,
            mask_ip_address=True,
            anti_screenshot_guard=True,
            zero_trace_storage=True
        )
        db.add(ghost)
        db.commit()
        db.refresh(ghost)

    return {
        "user_id": ghost.user_id,
        "is_ghost_enabled": ghost.is_ghost_enabled,
        "ghost_alias": ghost.ghost_alias,
        "ghost_avatar": ghost.ghost_avatar,
        "default_timer_seconds": ghost.default_timer_seconds,
        "burn_on_read": ghost.burn_on_read,
        "mask_ip_address": ghost.mask_ip_address,
        "anti_screenshot_guard": ghost.anti_screenshot_guard,
        "zero_trace_storage": ghost.zero_trace_storage
    }


@router.put("/ghost-settings")
def update_ghost_settings(user_id: int, payload: Dict[str, Any], db: Session = Depends(get_db)):
    """Update user's Ghost Mode settings."""
    ghost = db.query(GhostModeSettings).filter(GhostModeSettings.user_id == user_id).first()
    if not ghost:
        ghost = GhostModeSettings(user_id=user_id)
        db.add(ghost)

    if "is_ghost_enabled" in payload:
        ghost.is_ghost_enabled = bool(payload["is_ghost_enabled"])
    if "ghost_alias" in payload and payload["ghost_alias"]:
        ghost.ghost_alias = str(payload["ghost_alias"])
    if "ghost_avatar" in payload and payload["ghost_avatar"]:
        ghost.ghost_avatar = str(payload["ghost_avatar"])
    if "default_timer_seconds" in payload:
        ghost.default_timer_seconds = int(payload["default_timer_seconds"])
    if "burn_on_read" in payload:
        ghost.burn_on_read = bool(payload["burn_on_read"])
    if "mask_ip_address" in payload:
        ghost.mask_ip_address = bool(payload["mask_ip_address"])
    if "anti_screenshot_guard" in payload:
        ghost.anti_screenshot_guard = bool(payload["anti_screenshot_guard"])
    if "zero_trace_storage" in payload:
        ghost.zero_trace_storage = bool(payload["zero_trace_storage"])

    db.commit()
    db.refresh(ghost)

    return {
        "success": True,
        "message": "Ghost Protocol settings updated successfully",
        "data": {
            "is_ghost_enabled": ghost.is_ghost_enabled,
            "ghost_alias": ghost.ghost_alias,
            "default_timer_seconds": ghost.default_timer_seconds
        }
    }


# =====================================================================
# 17. BLUE TICK VERIFICATION & PURCHASE SYSTEM
# =====================================================================
@router.post("/verification/purchase")
def purchase_blue_tick(
    user_id: int,
    payload: Optional[VerificationPurchaseRequest] = None,
    db: Session = Depends(get_db)
):
    """
    Blue Tick Verified status purchase / subscribe endpoint.
    Grants Blue Tick badge to user who completes the checkout process.
    """
    tier = payload.plan_tier if payload else "monthly"
    method = payload.payment_method if payload else "upi"
    legal_name = payload.legal_name if payload else None
    cat = payload.category if payload else "Creator & Pioneer"
    upi_id = payload.upi_id if payload else None
    amount = payload.amount if payload else (4999.0 if tier == "yearly" else 499.0)

    res = purchase_or_activate_blue_tick(
        db,
        user_id=user_id,
        plan_tier=tier,
        payment_method=method,
        legal_name=legal_name,
        category=cat,
        upi_id=upi_id,
        amount=amount
    )
    return res


@router.post("/verification/toggle")
def toggle_user_verification(
    user_id: int,
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """
    Toggle verification status directly.
    """
    is_verified = bool(payload.get("is_verified", True))
    res = toggle_blue_tick(db, user_id=user_id, is_verified=is_verified)
    return res


# =====================================================================
# 18. NAME & USERNAME PROFILE UPDATE SYSTEM
# =====================================================================
@router.get("/profile/name")
def get_profile_name(user_id: int, db: Session = Depends(get_db)):
    """Fetch user first_name, surname, full_name, and username."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    full_name = f"{user.first_name} {user.surname}".strip()
    return {
        "success": True,
        "first_name": user.first_name,
        "surname": user.surname,
        "full_name": full_name,
        "username": user.username
    }


@router.put("/profile/name")
def update_profile_name(
    user_id: int,
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """Update user first_name, surname and/or username in database."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    first_name = payload.get("first_name")
    surname = payload.get("surname")
    username = payload.get("username")
    
    if first_name is not None and str(first_name).strip():
        user.first_name = str(first_name).strip()
    if surname is not None:
        user.surname = str(surname).strip()
    if username is not None and str(username).strip():
        clean_username = str(username).strip().lower().replace("@", "")
        if clean_username:
            existing = db.query(User).filter(User.username == clean_username, User.id != user_id).first()
            if existing:
                raise HTTPException(status_code=400, detail="Username already taken by another user.")
            user.username = clean_username
            
    db.commit()
    db.refresh(user)
    
    full_name = f"{user.first_name} {user.surname}".strip()
    return {
        "success": True,
        "message": "Profile name and username updated successfully!",
        "first_name": user.first_name,
        "surname": user.surname,
        "full_name": full_name,
        "username": user.username
    }