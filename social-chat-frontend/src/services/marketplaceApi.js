/**
 * marketplaceApi.js - Comprehensive API client for Facebook Marketplace
 * Handles live synchronization with FastAPI backend:
 * - Real-time cross-user marketplace listings
 * - Distance calculation and nearest location radius filters
 * - Creating and publishing new item listings with instant network sync
 * - Bookmarking / saving items
 * - City directories and geo-coordinates
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

const getAuthHeaders = () => {
  const token = localStorage.getItem("access_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

/**
 * 1. Fetch Marketplace Listings with distance calculation and filters
 */
export async function fetchMarketplaceItemsApi({
  userId,
  category = "All",
  search = "",
  city = "",
  lat = null,
  lng = null,
  radius = 40,
  sort = "nearest",
  verifiedOnly = false
} = {}) {
  try {
    const params = new URLSearchParams();
    if (userId) params.append("viewer_user_id", userId);
    if (category && category !== "All") params.append("category", category);
    if (search && search.trim()) params.append("search", search.trim());
    if (city && city.trim()) params.append("city", city.trim());
    if (lat !== null && lat !== undefined) params.append("lat", lat.toString());
    if (lng !== null && lng !== undefined) params.append("lng", lng.toString());
    if (radius !== null && radius !== undefined) params.append("radius", radius.toString());
    if (sort) params.append("sort", sort);
    if (verifiedOnly) params.append("verified_only", "true");

    const url = `${API_BASE_URL}/marketplace/items?${params.toString()}`;
    const res = await fetch(url, {
      headers: getAuthHeaders()
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    return { success: true, data };
  } catch (err) {
    console.warn("fetchMarketplaceItemsApi warning:", err);
    return { success: false, data: [] };
  }
}

/**
 * 2. Publish New Marketplace Listing
 */
export async function createMarketplaceListingApi(payload, userId) {
  try {
    const effectiveUserId = userId || payload.seller_id || 1;
    const bodyPayload = {
      ...payload,
      seller_id: effectiveUserId
    };

    const res = await fetch(`${API_BASE_URL}/marketplace/items?user_id=${effectiveUserId}`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(bodyPayload)
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || `HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    return { success: true, data: data.item || data };
  } catch (err) {
    console.error("createMarketplaceListingApi error:", err);
    return { success: false, error: err.message };
  }
}

/**
 * 3. Toggle Bookmark / Save Marketplace Item
 */
export async function toggleSaveMarketplaceItemApi(itemId, userId) {
  try {
    const res = await fetch(`${API_BASE_URL}/marketplace/items/${itemId}/save?user_id=${userId}`, {
      method: "POST",
      headers: getAuthHeaders()
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || `HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    return { success: true, is_saved: data.is_saved };
  } catch (err) {
    console.error("toggleSaveMarketplaceItemApi error:", err);
    return { success: false, error: err.message };
  }
}

/**
 * 4. Fetch User's Saved Marketplace Items
 */
export async function fetchSavedMarketplaceItemsApi(userId, lat = null, lng = null) {
  try {
    const params = new URLSearchParams({ user_id: userId.toString() });
    if (lat !== null) params.append("lat", lat.toString());
    if (lng !== null) params.append("lng", lng.toString());

    const res = await fetch(`${API_BASE_URL}/marketplace/saved?${params.toString()}`, {
      headers: getAuthHeaders()
    });

    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    return { success: true, data };
  } catch (err) {
    console.warn("fetchSavedMarketplaceItemsApi error:", err);
    return { success: false, data: [] };
  }
}

/**
 * 5. Fetch Supported Cities Directory
 */
export async function fetchCitiesListApi() {
  try {
    const res = await fetch(`${API_BASE_URL}/marketplace/cities`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    return { success: true, data };
  } catch (err) {
    console.warn("fetchCitiesListApi fallback:", err);
    return { success: false, data: [] };
  }
}
