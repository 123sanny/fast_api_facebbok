// Nexoria Reels & Video Feed Hub API Service

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000";

/**
 * Convert relative /uploads/... media path to absolute server URL
 */
export function getReelMediaUrl(url) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:") || url.startsWith("blob:")) {
    return url;
  }
  const cleanPath = url.startsWith("/") ? url : `/${url}`;
  return `${API_BASE_URL}${cleanPath}`;
}

/**
 * Fetch dynamic feed of all short vertical video reels across all users from database.
 */
export async function fetchReelsFeedApi(userId = null, category = null) {
  try {
    const params = new URLSearchParams();
    if (userId) params.append("user_id", userId);
    if (category && category !== "✨ All" && category !== "All") {
      params.append("category", category);
    }
    const queryStr = params.toString() ? `?${params.toString()}` : "";
    const res = await fetch(`${API_BASE_URL}/reels/feed${queryStr}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn("fetchReelsFeedApi error:", err);
    return { success: false, data: [] };
  }
}

/**
 * Fetch reels posted by a specific creator / user.
 */
export async function fetchUserReelsApi(targetUserId, viewerId = null) {
  if (!targetUserId) return { success: false, data: [] };
  try {
    const query = viewerId ? `?viewer_id=${viewerId}` : "";
    const res = await fetch(`${API_BASE_URL}/reels/user/${targetUserId}${query}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn("fetchUserReelsApi error:", err);
    return { success: false, data: [] };
  }
}

/**
 * Publish a new reel to the MySQL database.
 */
export async function createReelApi(payload) {
  try {
    const res = await fetch(`${API_BASE_URL}/reels/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("createReelApi error:", err);
    return { success: false, message: err.message };
  }
}

/**
 * Upload a raw mp4 / webm video file directly to the backend storage.
 */
export async function uploadReelVideoApi(file) {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API_BASE_URL}/reels/upload-video`, {
      method: "POST",
      body: formData
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("uploadReelVideoApi error:", err);
    return { success: false, message: err.message };
  }
}

/**
 * Add, update, or toggle reaction on a reel.
 */
export async function reactToReelApi(reelId, userId, reactionType = "like") {
  if (!reelId || !userId) return { success: false };
  try {
    const res = await fetch(`${API_BASE_URL}/reels/${reelId}/react`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: Number(userId),
        reaction_type: reactionType
      })
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn("reactToReelApi error:", err);
    return { success: false };
  }
}

/**
 * Fetch threaded comments for a reel.
 */
export async function fetchReelCommentsApi(reelId, viewerId = null) {
  if (!reelId) return { success: false, data: [] };
  try {
    const query = viewerId ? `?viewer_id=${viewerId}` : "";
    const res = await fetch(`${API_BASE_URL}/reels/${reelId}/comments${query}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn("fetchReelCommentsApi error:", err);
    return { success: false, data: [] };
  }
}

/**
 * Add a comment to a reel.
 */
export async function addReelCommentApi(reelId, userId, content, parentId = null) {
  if (!reelId || !userId || !content) return { success: false };
  try {
    const res = await fetch(`${API_BASE_URL}/reels/${reelId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: Number(userId),
        content: content.trim(),
        parent_id: parentId ? Number(parentId) : null
      })
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("addReelCommentApi error:", err);
    return { success: false, message: err.message };
  }
}

/**
 * Toggle bookmark / save status for a reel.
 */
export async function toggleSaveReelApi(reelId, userId) {
  if (!reelId || !userId) return { success: false };
  try {
    const res = await fetch(`${API_BASE_URL}/reels/${reelId}/save?user_id=${userId}`, {
      method: "POST"
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn("toggleSaveReelApi error:", err);
    return { success: false };
  }
}

/**
 * Fetch all saved reels for user.
 */
export async function fetchSavedReelsApi(userId) {
  if (!userId) return { success: false, data: [] };
  try {
    const res = await fetch(`${API_BASE_URL}/reels/saved/all?user_id=${userId}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn("fetchSavedReelsApi error:", err);
    return { success: false, data: [] };
  }
}

/**
 * Send Stars / Tip to reel creator.
 */
export async function sendReelStarsApi(reelId, userId, starsAmount = 50, message = null) {
  if (!reelId || !userId) return { success: false };
  try {
    const res = await fetch(`${API_BASE_URL}/reels/${reelId}/stars`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: Number(userId),
        stars_amount: Number(starsAmount),
        message: message
      })
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn("sendReelStarsApi error:", err);
    return { success: false };
  }
}

/**
 * Register reel view.
 */
export async function registerReelViewApi(reelId) {
  if (!reelId) return { success: false };
  try {
    const res = await fetch(`${API_BASE_URL}/reels/${reelId}/view`, {
      method: "POST"
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch {
    return { success: false };
  }
}

/**
 * Register reel share.
 */
export async function registerReelShareApi(reelId, userId = null, sharedTo = "timeline") {
  if (!reelId) return { success: false };
  try {
    const params = new URLSearchParams();
    if (userId) params.append("user_id", userId);
    params.append("shared_to", sharedTo);
    const res = await fetch(`${API_BASE_URL}/reels/${reelId}/share?${params.toString()}`, {
      method: "POST"
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch {
    return { success: false };
  }
}

/**
 * Delete a reel.
 */
export async function deleteReelApi(reelId, userId) {
  if (!reelId || !userId) return { success: false };
  try {
    const res = await fetch(`${API_BASE_URL}/reels/${reelId}?user_id=${userId}`, {
      method: "DELETE"
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("deleteReelApi error:", err);
    return { success: false, message: err.message };
  }
}

/**
 * =========================================================
 * NEXORIA WATCH 16:9 VIDEOS & WATCH PARTY API FUNCTIONS
 * =========================================================
 */

/**
 * Fetch dynamic feed of 16:9 Watch videos from the backend database.
 */
export async function fetchWatchFeedApi(userId = null, category = null) {
  try {
    const params = new URLSearchParams();
    if (userId) params.append("user_id", userId);
    if (category && category !== "✨ All" && category !== "All") {
      params.append("category", category);
    }
    const queryStr = params.toString() ? `?${params.toString()}` : "";
    const res = await fetch(`${API_BASE_URL}/reels/watch/feed${queryStr}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn("fetchWatchFeedApi error:", err);
    return { success: false, data: [] };
  }
}

/**
 * Publish a new 16:9 Watch video to the database.
 */
export async function createWatchVideoApi(payload) {
  try {
    const res = await fetch(`${API_BASE_URL}/reels/watch/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: Number(payload.user_id),
        title: payload.title,
        description: payload.description,
        video_url: payload.video_url || payload.videoUrl,
        thumbnail_url: payload.thumbnail_url || payload.thumbnail || payload.posterUrl,
        category: payload.category || "Tech & AI",
        duration: payload.duration || 120,
        video_type: "watch"
      })
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("createWatchVideoApi error:", err);
    return { success: false, message: err.message };
  }
}

/**
 * Send a synchronized chat message into a Watch Party room.
 */
export async function sendWatchPartyChatApi(partyId = "general", user = "You", text = "") {
  if (!text || !text.trim()) return { success: false };
  try {
    const res = await fetch(`${API_BASE_URL}/reels/watch-party/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        party_id: partyId,
        user: user,
        text: text.trim()
      })
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("sendWatchPartyChatApi error:", err);
    return { success: false };
  }
}

/**
 * Fetch live synchronized chat messages and viewers count for a Watch Party room.
 */
export async function fetchWatchPartyStateApi(partyId = "general") {
  try {
    const res = await fetch(`${API_BASE_URL}/reels/watch-party/${partyId}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("fetchWatchPartyStateApi error:", err);
    return { success: false, messages: [], viewers_count: 5 };
  }
}

