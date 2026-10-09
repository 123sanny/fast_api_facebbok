from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from database import get_db
from schemas.hyperlocal import (
    HyperlocalPostCreate,
    HyperlocalPostOut,
    HyperlocalServiceCreate,
    HyperlocalServiceOut,
    NeighborhoodHubOut,
    HyperlocalStatsOut,
    HyperlocalActionResponse
)
from services.hyperlocal_service import (
    get_hyperlocal_feed,
    create_hyperlocal_post,
    toggle_upvote_post,
    get_hyperlocal_services,
    create_hyperlocal_service,
    get_neighborhood_hubs_near,
    get_hyperlocal_pulse_stats
)

router = APIRouter(prefix="/hyperlocal", tags=["Hyperlocal & Neighborhood Discovery"])


# =====================================================================
# 1. NEIGHBORHOOD FEED & COMMUNITY ALERTS (RADIUS FILTER)
# =====================================================================
@router.get("/feed", response_model=List[HyperlocalPostOut])
def list_hyperlocal_feed(
    viewer_user_id: Optional[int] = Query(None, description="Active user ID"),
    user_id: Optional[int] = Query(None, description="Alias for viewer_user_id"),
    lat: Optional[float] = Query(None, description="User's current GPS latitude"),
    lng: Optional[float] = Query(None, description="User's current GPS longitude"),
    city: Optional[str] = Query(None, description="City name"),
    locality: Optional[str] = Query(None, description="Locality or colony name"),
    category: Optional[str] = Query("all", description="alert, emergency, lost_found, event, recommendation, general, service"),
    radius_km: Optional[float] = Query(5.0, description="Spatial radius in KM (e.g. 0.5, 1, 3, 5, 10)"),
    only_urgent: Optional[bool] = Query(False, description="Filter only urgent emergency broadcasts"),
    sort: Optional[str] = Query("nearest", description="nearest, urgent_first, newest, most_upvoted"),
    db: Session = Depends(get_db)
):
    """
    Retrieve real-time neighborhood posts and emergency updates within a strict geographic radius.
    """
    effective_user_id = viewer_user_id or user_id
    return get_hyperlocal_feed(
        db=db,
        viewer_user_id=effective_user_id,
        user_lat=lat,
        user_lng=lng,
        city=city,
        locality=locality,
        category=category,
        radius_km=radius_km,
        only_urgent=only_urgent,
        sort=sort
    )


# =====================================================================
# 2. CREATE NEIGHBORHOOD POST / URGENT BROADCAST
# =====================================================================
@router.post("/posts", response_model=HyperlocalActionResponse)
def create_neighborhood_post(
    payload: HyperlocalPostCreate,
    user_id: Optional[int] = Query(None, description="Author user ID"),
    db: Session = Depends(get_db)
):
    """
    Publish a local neighborhood announcement, event, or urgent safety alert.
    """
    author_id = payload.author_id or user_id or 1
    if not payload.title or not payload.content:
        raise HTTPException(status_code=400, detail="Title and content are required for local broadcasts")

    created = create_hyperlocal_post(db=db, author_id=author_id, payload=payload)
    return {
        "success": True,
        "message": "Neighborhood post published successfully",
        "post": created
    }


# =====================================================================
# 3. UPVOTE / CONFIRM LOCAL BROADCAST
# =====================================================================
@router.post("/posts/{post_id}/upvote", response_model=HyperlocalActionResponse)
def upvote_post(
    post_id: int,
    user_id: int = Query(..., description="User ID upvoting the post"),
    db: Session = Depends(get_db)
):
    """
    Upvote / confirm neighborhood report as a verified neighbor.
    """
    res = toggle_upvote_post(db=db, user_id=user_id, post_id=post_id)
    if not res.get("success"):
        raise HTTPException(status_code=404, detail=res.get("message", "Post not found"))
    return res


# =====================================================================
# 4. NEIGHBORHOOD SERVICES & LOCAL BUSINESSES DIRECTORY
# =====================================================================
@router.get("/services", response_model=List[HyperlocalServiceOut])
def list_local_services(
    lat: Optional[float] = Query(None, description="User's current latitude"),
    lng: Optional[float] = Query(None, description="User's current longitude"),
    category: Optional[str] = Query("all", description="Home Repair, Tuition, Grocery, Medical, Food, Fitness, Tech"),
    radius_km: Optional[float] = Query(6.0, description="Service range radius in KM"),
    search: Optional[str] = Query(None, description="Search keyword for service name or type"),
    db: Session = Depends(get_db)
):
    """
    Discover verified local businesses, home kitchens, tutors, and electricians nearby.
    """
    return get_hyperlocal_services(
        db=db,
        user_lat=lat,
        user_lng=lng,
        category=category,
        radius_km=radius_km,
        search=search
    )


# =====================================================================
# 5. REGISTER NEW LOCAL SERVICE / BUSINESS
# =====================================================================
@router.post("/services", response_model=HyperlocalActionResponse)
def register_local_service(
    payload: HyperlocalServiceCreate,
    user_id: Optional[int] = Query(None, description="Service owner user ID"),
    db: Session = Depends(get_db)
):
    """
    List a local service or neighborhood business on the Hyperlocal network.
    """
    owner_id = payload.owner_id or user_id or 1
    if not payload.name or not payload.service_type:
        raise HTTPException(status_code=400, detail="Service name and type are required")

    created = create_hyperlocal_service(db=db, owner_id=owner_id, payload=payload)
    return {
        "success": True,
        "message": "Local business / service registered successfully",
        "service": created
    }


# =====================================================================
# 6. NEIGHBORHOOD HUBS & RESIDENTIAL CIRCLES
# =====================================================================
@router.get("/hubs", response_model=List[NeighborhoodHubOut])
def list_neighborhood_hubs(
    lat: Optional[float] = Query(None),
    lng: Optional[float] = Query(None),
    radius_km: Optional[float] = Query(15.0),
    db: Session = Depends(get_db)
):
    """
    Find nearby residential community circles and society hubs.
    """
    return get_neighborhood_hubs_near(db=db, user_lat=lat, user_lng=lng, radius_km=radius_km)


# =====================================================================
# 7. HYPERLOCAL COMMUNITY PULSE & STATS
# =====================================================================
@router.get("/stats", response_model=HyperlocalStatsOut)
def get_community_pulse(
    lat: Optional[float] = Query(None),
    lng: Optional[float] = Query(None),
    city: Optional[str] = Query("Delhi"),
    locality: Optional[str] = Query("Connaught Place"),
    db: Session = Depends(get_db)
):
    """
    Get live metrics on active neighbors, emergency alerts, and verified local services.
    """
    return get_hyperlocal_pulse_stats(
        db=db,
        user_lat=lat,
        user_lng=lng,
        city=city,
        locality=locality
    )
