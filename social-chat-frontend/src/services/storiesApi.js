// Nexoria Stories & 24-Hour Friends Status API Service

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000";

/**
 * Convert relative /uploads/... media path to absolute server URL
 */
export function getStoryMediaUrl(url) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:") || url.startsWith("blob:")) {
    return url;
  }
  const cleanPath = url.startsWith("/") ? url : `/${url}`;
  return `${API_BASE_URL}${cleanPath}`;
}

/**
 * Fetch stories & status feed for the logged in user:
 * Includes user's own stories, friend stories (unviewed first, then viewed), and community highlights.
 */
export async function fetchStoriesFeedApi(userId) {
  if (!userId) return { success: false, data: [] };
  try {
    const res = await fetch(`${API_BASE_URL}/stories/feed?user_id=${userId}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn("fetchStoriesFeedApi error:", err);
    return { success: false, data: [] };
  }
}

/**
 * Fetch active stories / status for a specific target user.
 */
export async function fetchUserStoriesApi(targetUserId, viewerId = null) {
  if (!targetUserId) return { success: false, data: [] };
  try {
    const url = viewerId 
      ? `${API_BASE_URL}/stories/user/${targetUserId}?viewer_id=${viewerId}`
      : `${API_BASE_URL}/stories/user/${targetUserId}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn("fetchUserStoriesApi error:", err);
    return { success: false, data: [] };
  }
}

/**
 * Fetch dynamic list of friends who currently have active statuses/stories.
 * Used in the Profile page "Friend Statuses" shelf.
 */
export async function fetchFriendsStatusesApi(userId) {
  if (!userId) return { success: false, data: [] };
  try {
    const res = await fetch(`${API_BASE_URL}/stories/friends-status?user_id=${userId}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn("fetchFriendsStatusesApi error:", err);
    return { success: false, data: [] };
  }
}

/**
 * Publish a new story (text or photo)
 */
export async function createStoryApi(payload) {
  try {
    const res = await fetch(`${API_BASE_URL}/stories/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("createStoryApi error:", err);
    return { success: false, message: err.message };
  }
}

/**
 * Upload a photo/video file for a story
 */
export async function uploadStoryMediaApi(file) {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API_BASE_URL}/stories/upload-media`, {
      method: "POST",
      body: formData
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("uploadStoryMediaApi error:", err);
    return { success: false, message: err.message };
  }
}

/**
 * Mark story as viewed by viewerId and optionally record emoji reaction
 */
export async function viewStoryApi(storyId, viewerId, reactionEmoji = null) {
  if (!storyId || !viewerId) return { success: false };
  try {
    const res = await fetch(`${API_BASE_URL}/stories/${storyId}/view`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        viewer_id: Number(viewerId),
        reaction_emoji: reactionEmoji
      })
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn("viewStoryApi error:", err);
    return { success: false };
  }
}

/**
 * Delete a story
 */
export async function deleteStoryApi(storyId, userId) {
  if (!storyId || !userId) return { success: false };
  try {
    const res = await fetch(`${API_BASE_URL}/stories/${storyId}?user_id=${userId}`, {
      method: "DELETE"
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("deleteStoryApi error:", err);
    return { success: false, message: err.message };
  }
}
