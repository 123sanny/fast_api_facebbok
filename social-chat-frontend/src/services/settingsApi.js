/**
 * Nexoria Settings, Privacy & Family Centre API Client
 * Connects frontend settings, privacy checkup, media/audio, and family supervision to FastAPI & MySQL.
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
 * 1. Fetch Privacy Settings
 */
export const fetchPrivacySettingsApi = async (userId) => {
  try {
    const uid = userId || localStorage.getItem("user_id") || 1;
    const res = await fetch(`${API_BASE_URL}/settings/privacy?user_id=${uid}`, {
      method: "GET",
      headers: getAuthHeaders(uid)
    });
    if (!res.ok) throw new Error("Failed to fetch privacy settings");
    return await res.json();
  } catch (err) {
    console.warn("fetchPrivacySettingsApi error:", err);
    return {
      success: false,
      profile_locked: false,
      active_status: true,
      who_can_see_posts: "Public",
      who_can_see_friends: "public",
      who_can_send_requests: "everyone",
      who_can_post_on_profile: "friends",
      who_can_follow: "public",
      review_tags: true,
      reactions_hide_others: false,
      reactions_hide_own: false,
      sensitive_content: "standard",
      search_engine_indexing: true
    };
  }
};

/**
 * 2. Update Privacy Settings
 */
export const updatePrivacySettingsApi = async (userId, privacyData) => {
  try {
    const uid = userId || localStorage.getItem("user_id") || 1;
    const res = await fetch(`${API_BASE_URL}/settings/privacy?user_id=${uid}`, {
      method: "PUT",
      headers: getAuthHeaders(uid),
      body: JSON.stringify({ ...privacyData, user_id: uid })
    });
    if (!res.ok) throw new Error("Failed to update privacy settings");
    return await res.json();
  } catch (err) {
    console.error("updatePrivacySettingsApi error:", err);
    return { success: false, message: err.message };
  }
};

/**
 * 3. Complete Privacy Checkup Wizard
 */
export const completePrivacyCheckupApi = async (userId, checkupData) => {
  try {
    const uid = userId || localStorage.getItem("user_id") || 1;
    const res = await fetch(`${API_BASE_URL}/settings/privacy-checkup/complete`, {
      method: "POST",
      headers: getAuthHeaders(uid),
      body: JSON.stringify({ ...checkupData, user_id: uid })
    });
    if (!res.ok) throw new Error("Failed to complete privacy checkup");
    return await res.json();
  } catch (err) {
    console.error("completePrivacyCheckupApi error:", err);
    return { success: false, message: err.message };
  }
};

/**
 * 4. Fetch Media, Audio & UX Preferences
 */
export const fetchUserPreferencesApi = async (userId) => {
  try {
    const uid = userId || localStorage.getItem("user_id") || 1;
    const res = await fetch(`${API_BASE_URL}/settings/preferences?user_id=${uid}`, {
      method: "GET",
      headers: getAuthHeaders(uid)
    });
    if (!res.ok) throw new Error("Failed to fetch preferences");
    return await res.json();
  } catch (err) {
    console.warn("fetchUserPreferencesApi error:", err);
    return {
      success: false,
      video_autoplay: "wifi_cellular",
      data_saver: false,
      hd_uploads: true,
      spatial_audio: true,
      noise_cancellation: true,
      audio_quality: "high",
      early_access: true,
      camera_suggestions: true,
      whatsapp_linked: false,
      whatsapp_number: ""
    };
  }
};

/**
 * 5. Update Media, Audio & UX Preferences
 */
export const updateUserPreferencesApi = async (userId, prefsData) => {
  try {
    const uid = userId || localStorage.getItem("user_id") || 1;
    const res = await fetch(`${API_BASE_URL}/settings/preferences?user_id=${uid}`, {
      method: "PUT",
      headers: getAuthHeaders(uid),
      body: JSON.stringify({ ...prefsData, user_id: uid })
    });
    if (!res.ok) throw new Error("Failed to update preferences");
    return await res.json();
  } catch (err) {
    console.error("updateUserPreferencesApi error:", err);
    return { success: false, message: err.message };
  }
};

/**
 * 6. Fetch Family Centre Supervised Members
 */
export const fetchFamilyCentreApi = async (userId) => {
  try {
    const uid = userId || localStorage.getItem("user_id") || 1;
    const res = await fetch(`${API_BASE_URL}/settings/family-centre?user_id=${uid}`, {
      method: "GET",
      headers: getAuthHeaders(uid)
    });
    if (!res.ok) throw new Error("Failed to fetch family centre");
    return await res.json();
  } catch (err) {
    console.warn("fetchFamilyCentreApi error:", err);
    return { success: false, count: 0, supervised_members: [] };
  }
};

/**
 * 7. Add Family Supervision
 */
export const addFamilySupervisionApi = async (userId, supervisionData) => {
  try {
    const uid = userId || localStorage.getItem("user_id") || 1;
    const res = await fetch(`${API_BASE_URL}/settings/family-centre/supervise`, {
      method: "POST",
      headers: getAuthHeaders(uid),
      body: JSON.stringify({ ...supervisionData, user_id: uid })
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, message: data.detail || "Failed to setup supervision" };
    }
    return { success: true, ...data };
  } catch (err) {
    console.error("addFamilySupervisionApi error:", err);
    return { success: false, message: err.message };
  }
};

/**
 * 8. Update Family Supervision Controls
 */
export const updateFamilySupervisionApi = async (userId, linkId, supervisionData) => {
  try {
    const uid = userId || localStorage.getItem("user_id") || 1;
    const res = await fetch(`${API_BASE_URL}/settings/family-centre/${linkId}`, {
      method: "PUT",
      headers: getAuthHeaders(uid),
      body: JSON.stringify({ ...supervisionData, user_id: uid })
    });
    return await res.json();
  } catch (err) {
    console.error("updateFamilySupervisionApi error:", err);
    return { success: false, message: err.message };
  }
};

/**
 * 9. Delete Family Supervision Link
 */
export const deleteFamilySupervisionApi = async (userId, linkId) => {
  try {
    const uid = userId || localStorage.getItem("user_id") || 1;
    const res = await fetch(`${API_BASE_URL}/settings/family-centre/${linkId}?user_id=${uid}`, {
      method: "DELETE",
      headers: getAuthHeaders(uid)
    });
    return await res.json();
  } catch (err) {
    console.error("deleteFamilySupervisionApi error:", err);
    return { success: false, message: err.message };
  }
};
