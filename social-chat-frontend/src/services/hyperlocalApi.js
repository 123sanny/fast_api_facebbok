/**
 * hyperlocalApi.js - Frontend API Client for Hyperlocal Neighborhood Discovery
 * Connects frontend components to FastAPI backend:
 * - Real-time neighborhood feed & emergency broadcasts (0.5km - 10km)
 * - Neighbor upvoting & local verification
 * - Local businesses, home kitchens, and doorstep services directory
 * - Locality hubs & neighborhood pulse statistics
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
 * 1. Fetch Hyperlocal Neighborhood Feed
 */
export async function fetchHyperlocalFeedApi({
  userId,
  lat = null,
  lng = null,
  city = "",
  locality = "",
  category = "all",
  radiusKm = 5.0,
  onlyUrgent = false,
  sort = "nearest"
} = {}) {
  try {
    const params = new URLSearchParams();
    if (userId) params.append("viewer_user_id", userId.toString());
    if (lat !== null && lat !== undefined) params.append("lat", lat.toString());
    if (lng !== null && lng !== undefined) params.append("lng", lng.toString());
    if (city && city.trim()) params.append("city", city.trim());
    if (locality && locality.trim()) params.append("locality", locality.trim());
    if (category && category !== "all") params.append("category", category);
    if (radiusKm !== null && radiusKm !== undefined) params.append("radius_km", radiusKm.toString());
    if (onlyUrgent) params.append("only_urgent", "true");
    if (sort) params.append("sort", sort);

    const res = await fetch(`${API_BASE_URL}/hyperlocal/feed?${params.toString()}`, {
      headers: getAuthHeaders()
    });

    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    return { success: true, data };
  } catch (err) {
    console.warn("fetchHyperlocalFeedApi warning:", err);
    return { success: false, data: [] };
  }
}

/**
 * 2. Publish Neighborhood Post or Urgent Alert
 */
export async function createHyperlocalPostApi(payload, userId) {
  try {
    const effectiveUserId = userId || payload.author_id || 1;
    const bodyPayload = {
      ...payload,
      author_id: effectiveUserId
    };

    const res = await fetch(`${API_BASE_URL}/hyperlocal/posts?user_id=${effectiveUserId}`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(bodyPayload)
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || `HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    return { success: true, data: data.post || data };
  } catch (err) {
    console.error("createHyperlocalPostApi error:", err);
    return { success: false, error: err.message };
  }
}

/**
 * 3. Upvote / Confirm Neighborhood Broadcast
 */
export async function toggleUpvoteHyperlocalPostApi(postId, userId) {
  try {
    const res = await fetch(`${API_BASE_URL}/hyperlocal/posts/${postId}/upvote?user_id=${userId}`, {
      method: "POST",
      headers: getAuthHeaders()
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || `HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    return { success: true, is_upvoted: data.is_upvoted };
  } catch (err) {
    console.error("toggleUpvoteHyperlocalPostApi error:", err);
    return { success: false, error: err.message };
  }
}

/**
 * 4. Fetch Nearby Local Services & Home Businesses
 */
export async function fetchHyperlocalServicesApi({
  lat = null,
  lng = null,
  category = "all",
  radiusKm = 6.0,
  search = ""
} = {}) {
  try {
    const params = new URLSearchParams();
    if (lat !== null) params.append("lat", lat.toString());
    if (lng !== null) params.append("lng", lng.toString());
    if (category && category !== "all") params.append("category", category);
    if (radiusKm) params.append("radius_km", radiusKm.toString());
    if (search && search.trim()) params.append("search", search.trim());

    const res = await fetch(`${API_BASE_URL}/hyperlocal/services?${params.toString()}`, {
      headers: getAuthHeaders()
    });

    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    return { success: true, data };
  } catch (err) {
    console.warn("fetchHyperlocalServicesApi warning:", err);
    return { success: false, data: [] };
  }
}

/**
 * 5. Register Local Service / Business
 */
export async function registerHyperlocalServiceApi(payload, userId) {
  try {
    const effectiveUserId = userId || payload.owner_id || 1;
    const bodyPayload = {
      ...payload,
      owner_id: effectiveUserId
    };

    const res = await fetch(`${API_BASE_URL}/hyperlocal/services?user_id=${effectiveUserId}`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(bodyPayload)
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || `HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    return { success: true, data: data.service || data };
  } catch (err) {
    console.error("registerHyperlocalServiceApi error:", err);
    return { success: false, error: err.message };
  }
}

/**
 * 6. Fetch Neighborhood Hubs / Residential Circles
 */
export async function fetchNeighborhoodHubsApi(lat = null, lng = null, radiusKm = 15.0) {
  try {
    const params = new URLSearchParams();
    if (lat !== null) params.append("lat", lat.toString());
    if (lng !== null) params.append("lng", lng.toString());
    if (radiusKm) params.append("radius_km", radiusKm.toString());

    const res = await fetch(`${API_BASE_URL}/hyperlocal/hubs?${params.toString()}`, {
      headers: getAuthHeaders()
    });

    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    return { success: true, data };
  } catch (err) {
    console.warn("fetchNeighborhoodHubsApi warning:", err);
    return { success: false, data: [] };
  }
}

/**
 * 7. Fetch Hyperlocal Community Pulse Stats
 */
export async function fetchHyperlocalStatsApi(lat = null, lng = null, city = "Delhi", locality = "Connaught Place") {
  try {
    const params = new URLSearchParams();
    if (lat !== null) params.append("lat", lat.toString());
    if (lng !== null) params.append("lng", lng.toString());
    if (city) params.append("city", city);
    if (locality) params.append("locality", locality);

    const res = await fetch(`${API_BASE_URL}/hyperlocal/stats?${params.toString()}`, {
      headers: getAuthHeaders()
    });

    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    return { success: true, data };
  } catch (err) {
    console.warn("fetchHyperlocalStatsApi warning:", err);
    return { 
      success: false, 
      data: {
        locality_name: locality,
        city_name: city,
        latitude: lat || 28.6139,
        longitude: lng || 77.2090,
        active_neighbors_count: 35,
        open_alerts_count: 2,
        local_services_count: 6,
        urgent_broadcasts_count: 1
      } 
    };
  }
}
