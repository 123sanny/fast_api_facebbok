from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from database import get_db
from schemas.community import (
    MarketplaceItemCreate,
    MarketplaceListingOut,
    MarketplaceActionResponse
)
from services.marketplace_service import (
    get_marketplace_items,
    create_marketplace_item,
    toggle_save_marketplace_item,
    get_user_saved_marketplace_items,
    CITIES_DATA
)

router = APIRouter(prefix="/marketplace", tags=["Facebook Marketplace"])


# =====================================================================
# 1. LIST MARKETPLACE ITEMS (WITH DISTANCE & NEARBY LOCATION ENGINE)
# =====================================================================
@router.get("/items", response_model=List[MarketplaceListingOut])
def list_marketplace_items(
    viewer_user_id: Optional[int] = Query(None, description="Active viewing user ID"),
    user_id: Optional[int] = Query(None, description="Alias for viewer_user_id"),
    category: Optional[str] = Query("All", description="Electronics, Vehicles, Home Goods, Apparel, Property, Entertainment"),
    search: Optional[str] = Query(None, description="Search keyword for item title, city, or locality"),
    city: Optional[str] = Query(None, description="Filter city (Delhi, Mumbai, Bengaluru, etc.)"),
    lat: Optional[float] = Query(None, description="User's current GPS / chosen city latitude"),
    lng: Optional[float] = Query(None, description="User's current GPS / chosen city longitude"),
    radius: Optional[int] = Query(40, description="Distance radius in kilometers (5, 15, 30, 50, 100)"),
    sort: Optional[str] = Query("nearest", description="nearest, recommended, low_high, high_low"),
    verified_only: Optional[bool] = Query(False, description="Filter only Aadhaar / Govt ID verified sellers"),
    db: Session = Depends(get_db)
):
    """
    Fetch all active marketplace items with real-time distance calculation,
    nearby location radius filtering, and category filters.
    """
    effective_user_id = viewer_user_id or user_id
    return get_marketplace_items(
        db=db,
        viewer_user_id=effective_user_id,
        category=category,
        search=search,
        city=city,
        user_lat=lat,
        user_lng=lng,
        radius=radius,
        sort=sort,
        verified_only=verified_only
    )


# =====================================================================
# 2. CREATE NEW MARKETPLACE LISTING
# =====================================================================
@router.post("/items", response_model=MarketplaceActionResponse)
def create_listing(
    payload: MarketplaceItemCreate,
    user_id: Optional[int] = Query(None, description="Seller user ID"),
    db: Session = Depends(get_db)
):
    """
    Publish a new item listing to the marketplace, visible to all users across the platform.
    """
    seller_id = payload.seller_id or user_id or 1
    
    if not payload.title or payload.price is None:
        raise HTTPException(status_code=400, detail="Title and price are required to create a listing")

    created_item = create_marketplace_item(db=db, seller_id=seller_id, payload=payload)

    return {
        "success": True,
        "message": "Listing published successfully to Marketplace",
        "item": created_item
    }


# =====================================================================
# 3. TOGGLE BOOKMARK / SAVE ITEM
# =====================================================================
@router.post("/items/{item_id}/save", response_model=MarketplaceActionResponse)
def toggle_save_item(
    item_id: int,
    user_id: int = Query(..., description="User ID bookmarking the item"),
    db: Session = Depends(get_db)
):
    """
    Toggle save/bookmark status for a marketplace listing.
    """
    res = toggle_save_marketplace_item(db=db, user_id=user_id, item_id=item_id)
    return res


# =====================================================================
# 4. GET USER'S SAVED ITEMS
# =====================================================================
@router.get("/saved", response_model=List[MarketplaceListingOut])
def get_saved_items(
    user_id: int = Query(..., description="User ID"),
    lat: Optional[float] = Query(None),
    lng: Optional[float] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Retrieve all listings bookmarked by the user.
    """
    return get_user_saved_marketplace_items(db=db, user_id=user_id, user_lat=lat, user_lng=lng)


# =====================================================================
# 5. GET CITIES & LOCALITIES LIST
# =====================================================================
@router.get("/cities")
def get_cities_list():
    """
    Get list of supported cities with geo-coordinates and popular localities.
    """
    return [
        {
            "name": val["name"],
            "state": val["state"],
            "lat": val["lat"],
            "lng": val["lng"],
            "localities": val["localities"]
        }
        for val in CITIES_DATA.values()
    ]
