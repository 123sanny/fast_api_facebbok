// Nexoria Dynamic Notifications API Service

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000";

/**
 * Fetch all dynamic notifications from backend for a specific user.
 */
export async function fetchNotificationsApi(userId, filterType = null, limit = 50) {
  try {
    let url = `${API_BASE_URL}/notifications?user_id=${userId}&limit=${limit}`;
    if (filterType && filterType !== "all") {
      url += `&filter_type=${encodeURIComponent(filterType)}`;
    }
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn("fetchNotificationsApi error:", err);
    return { success: false, data: [], count: 0, unread_count: 0 };
  }
}

/**
 * Fetch live unread notification count for Header bell badge.
 */
export async function fetchUnreadNotifCountApi(userId) {
  try {
    const res = await fetch(`${API_BASE_URL}/notifications/unread-count?user_id=${userId}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.count || data.unread_count || 0;
  } catch (err) {
    console.warn("fetchUnreadNotifCountApi error:", err);
    return 0;
  }
}

/**
 * Mark a single notification as read.
 */
export async function markNotifReadApi(notifId, userId) {
  try {
    const res = await fetch(`${API_BASE_URL}/notifications/${notifId}/read?user_id=${userId}`, {
      method: "POST"
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { success: true, data };
  } catch (err) {
    console.warn("markNotifReadApi error:", err);
    return { success: false };
  }
}

/**
 * Toggle notification read/unread.
 */
export async function toggleNotifReadApi(notifId, userId) {
  try {
    const res = await fetch(`${API_BASE_URL}/notifications/${notifId}/toggle-read?user_id=${userId}`, {
      method: "POST"
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn("toggleNotifReadApi error:", err);
    return { success: false };
  }
}

/**
 * Mark all notifications as read.
 */
export async function markAllNotifsReadApi(userId) {
  try {
    const res = await fetch(`${API_BASE_URL}/notifications/mark-all-read?user_id=${userId}`, {
      method: "POST"
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { success: true, data };
  } catch (err) {
    console.warn("markAllNotifsReadApi error:", err);
    return { success: false };
  }
}

/**
 * Delete all read notifications from database.
 */
export async function clearReadNotifsApi(userId) {
  try {
    const res = await fetch(`${API_BASE_URL}/notifications/clear-read?user_id=${userId}`, {
      method: "DELETE"
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { success: true, data };
  } catch (err) {
    console.warn("clearReadNotifsApi error:", err);
    return { success: false };
  }
}

/**
 * Delete all notifications from database.
 */
export async function clearAllNotifsApi(userId) {
  try {
    const res = await fetch(`${API_BASE_URL}/notifications/clear-all?user_id=${userId}`, {
      method: "DELETE"
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { success: true, data };
  } catch (err) {
    console.warn("clearAllNotifsApi error:", err);
    return { success: false };
  }
}

/**
 * Delete single notification.
 */
export async function deleteNotifApi(notifId, userId) {
  try {
    const res = await fetch(`${API_BASE_URL}/notifications/${notifId}?user_id=${userId}`, {
      method: "DELETE"
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { success: true, data };
  } catch (err) {
    console.warn("deleteNotifApi error:", err);
    return { success: false };
  }
}

/**
 * Fetch notification preferences.
 */
export async function fetchNotifSettingsApi(userId) {
  try {
    const res = await fetch(`${API_BASE_URL}/notifications/settings?user_id=${userId}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn("fetchNotifSettingsApi error:", err);
    return { success: false, data: {} };
  }
}

/**
 * Update notification preferences.
 */
export async function updateNotifSettingsApi(userId, settings) {
  try {
    const res = await fetch(`${API_BASE_URL}/notifications/settings?user_id=${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { success: true, data };
  } catch (err) {
    console.warn("updateNotifSettingsApi error:", err);
    return { success: false };
  }
}

/**
 * Create custom dynamic notification (e.g. profile views, reactions, comments)
 */
export async function createNotificationApi(userId, { actorId, notifType = "profile_view", message, entityType, entityId, postId } = {}) {
  try {
    let url = `${API_BASE_URL}/notifications?user_id=${userId}&notif_type=${encodeURIComponent(notifType)}`;
    if (actorId) url += `&actor_id=${actorId}`;
    if (message) url += `&message=${encodeURIComponent(message)}`;
    if (entityType) url += `&entity_type=${encodeURIComponent(entityType)}`;
    if (entityId) url += `&entity_id=${entityId}`;
    if (postId) url += `&post_id=${postId}`;

    const res = await fetch(url, { method: "POST" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn("createNotificationApi error:", err);
    return { success: false };
  }
}

