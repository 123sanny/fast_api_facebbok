/**
 * Nexoria Ad Activity & Preferences Client Service
 * Connects AdActivity component to FastAPI and MySQL.
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

const getAuthHeaders = (userId) => {
  const token = localStorage.getItem("token") || localStorage.getItem("access_token") || "";
  const uid = userId || localStorage.getItem("user_id") || "1";
  return {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    "x-user-id": String(uid),
  };
};

/**
 * 1. Fetch Ad Activity (Recent interacted ads or Saved collection)
 */
export const fetchAdActivityApi = async (userId, tab = "recent", search = "") => {
  try {
    const uid = userId || localStorage.getItem("user_id") || 1;
    const url = new URL(`${API_BASE_URL}/ads/activity`);
    url.searchParams.set("user_id", uid);
    url.searchParams.set("tab", tab);
    if (search && search.trim()) {
      url.searchParams.set("search", search.trim());
    }

    const res = await fetch(url.toString(), {
      method: "GET",
      headers: getAuthHeaders(uid)
    });
    if (!res.ok) throw new Error("Failed to fetch ad activity");
    return await res.json();
  } catch (err) {
    console.warn("fetchAdActivityApi error:", err);
    return { success: false, tab, count: 0, saved_count: 0, data: [] };
  }
};

/**
 * 2. Save / Unsave an Ad
 */
export const toggleSaveAdApi = async (userId, adId) => {
  try {
    const uid = userId || localStorage.getItem("user_id") || 1;
    const res = await fetch(`${API_BASE_URL}/ads/${adId}/save?user_id=${uid}`, {
      method: "POST",
      headers: getAuthHeaders(uid)
    });
    if (!res.ok) throw new Error("Failed to toggle save ad");
    return await res.json();
  } catch (err) {
    console.error("toggleSaveAdApi error:", err);
    return { success: false };
  }
};

/**
 * 3. Track User Click on Ad
 */
export const trackAdClickApi = async (userId, adId) => {
  try {
    const uid = userId || localStorage.getItem("user_id") || 1;
    const res = await fetch(`${API_BASE_URL}/ads/interact`, {
      method: "POST",
      headers: getAuthHeaders(uid),
      body: JSON.stringify({ user_id: uid, ad_id: adId, interaction_type: "clicked" })
    });
    return await res.json();
  } catch (err) {
    console.warn("trackAdClickApi error:", err);
    return { success: false };
  }
};

/**
 * 4. Hide Ad or Submit Feedback
 */
export const hideAdApi = async (userId, adId, reason = "irrelevant", feedbackText = "") => {
  try {
    const uid = userId || localStorage.getItem("user_id") || 1;
    const res = await fetch(`${API_BASE_URL}/ads/${adId}/hide`, {
      method: "POST",
      headers: getAuthHeaders(uid),
      body: JSON.stringify({ user_id: uid, ad_id: adId, reason, feedback_text: feedbackText })
    });
    return await res.json();
  } catch (err) {
    console.error("hideAdApi error:", err);
    return { success: false };
  }
};

/**
 * 5. Create Sponsored Ad Campaign
 */
export const createAdCampaignApi = async (userId, adData) => {
  try {
    const uid = userId || localStorage.getItem("user_id") || 1;
    const res = await fetch(`${API_BASE_URL}/ads/create`, {
      method: "POST",
      headers: getAuthHeaders(uid),
      body: JSON.stringify({ ...adData, user_id: uid })
    });
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.detail || "Failed to create ad campaign");
    }
    return await res.json();
  } catch (err) {
    console.error("createAdCampaignApi error:", err);
    throw err;
  }
};

/**
 * 6. Fetch Ad Preferences & Topics
 */
export const fetchAdPreferencesApi = async (userId) => {
  try {
    const uid = userId || localStorage.getItem("user_id") || 1;
    const res = await fetch(`${API_BASE_URL}/ads/preferences?user_id=${uid}`, {
      method: "GET",
      headers: getAuthHeaders(uid)
    });
    if (!res.ok) throw new Error("Failed to fetch ad preferences");
    return await res.json();
  } catch (err) {
    console.warn("fetchAdPreferencesApi error:", err);
    return { personalized_ads: true, topics: [] };
  }
};

/**
 * 7. Update Ad Preferences & Topics
 */
export const updateAdPreferencesApi = async (userId, prefsData) => {
  try {
    const uid = userId || localStorage.getItem("user_id") || 1;
    const res = await fetch(`${API_BASE_URL}/ads/preferences?user_id=${uid}`, {
      method: "PUT",
      headers: getAuthHeaders(uid),
      body: JSON.stringify(prefsData)
    });
    if (!res.ok) throw new Error("Failed to update ad preferences");
    return await res.json();
  } catch (err) {
    console.error("updateAdPreferencesApi error:", err);
    return null;
  }
};

/**
 * 8. Block an Advertiser
 */
export const blockAdvertiserApi = async (userId, brandName, adId = null, reason = "Blocked by user") => {
  try {
    const uid = userId || localStorage.getItem("user_id") || 1;
    const res = await fetch(`${API_BASE_URL}/ads/block`, {
      method: "POST",
      headers: getAuthHeaders(uid),
      body: JSON.stringify({ user_id: uid, brand_name: brandName, ad_id: adId, reason })
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("blockAdvertiserApi error:", err);
    return { success: false, message: "Could not block advertiser" };
  }
};

/**
 * 9. Unblock an Advertiser
 */
export const unblockAdvertiserApi = async (userId, brandName) => {
  try {
    const uid = userId || localStorage.getItem("user_id") || 1;
    const res = await fetch(`${API_BASE_URL}/ads/blocked/${encodeURIComponent(brandName)}?user_id=${uid}`, {
      method: "DELETE",
      headers: getAuthHeaders(uid)
    });
    return await res.json();
  } catch (err) {
    console.error("unblockAdvertiserApi error:", err);
    return { success: false, message: "Could not unblock advertiser" };
  }
};

/**
 * 10. Fetch Blocked Advertisers
 */
export const fetchBlockedAdvertisersApi = async (userId) => {
  try {
    const uid = userId || localStorage.getItem("user_id") || 1;
    const res = await fetch(`${API_BASE_URL}/ads/blocked?user_id=${uid}`, {
      method: "GET",
      headers: getAuthHeaders(uid)
    });
    if (!res.ok) throw new Error("Failed to fetch blocked advertisers");
    return await res.json();
  } catch (err) {
    console.warn("fetchBlockedAdvertisersApi error:", err);
    return [];
  }
};

