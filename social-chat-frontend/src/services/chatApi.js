// Nexoria Live Realtime Chat & Messenger API Service

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000";

/**
 * Format any ISO/UTC or server timestamp into the client device's accurate local time.
 * e.g., "12:30 PM", "Yesterday, 4:15 PM", "Sep 29, 2:10 PM"
 */
export function formatMessageTime(dateInput) {
  if (!dateInput) return "";

  // If it's already a simple local time string like "12:30 PM", return it
  if (
    typeof dateInput === "string" &&
    !dateInput.includes("T") &&
    !dateInput.includes("-") &&
    (dateInput.includes(":") || dateInput.includes("AM") || dateInput.includes("PM"))
  ) {
    return dateInput;
  }

  let d;
  if (typeof dateInput === "string") {
    // If it's an ISO string without timezone indicator (e.g. "2026-10-02T06:56:00"), treat as UTC
    if (!dateInput.endsWith("Z") && !dateInput.includes("+") && dateInput.includes("T")) {
      d = new Date(dateInput + "Z");
    } else {
      d = new Date(dateInput);
    }
  } else if (dateInput instanceof Date) {
    d = dateInput;
  } else {
    d = new Date(dateInput);
  }

  if (isNaN(d.getTime())) return String(dateInput);

  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const timeStr = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true });

  if (isToday) {
    return timeStr;
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) {
    return `Yesterday, ${timeStr}`;
  }

  return `${d.toLocaleDateString([], { month: "short", day: "numeric" })}, ${timeStr}`;
}

/**
 * Convert relative /uploads/... media path to absolute server URL
 */
export function getChatMediaUrl(url) {
  if (!url) return "";
  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("blob:") ||
    url.startsWith("data:")
  ) {
    return url;
  }
  const baseUrl = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000";
  return `${baseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
}

/**
 * Build WebSocket URL for live chat
 */
export function getChatWebSocketUrl(userId) {
  const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  let host = "127.0.0.1:8000";
  try {
    if (API_BASE_URL.startsWith("http")) {
      const url = new URL(API_BASE_URL);
      host = url.host;
    }
  } catch (e) {
    console.error("Invalid API_BASE_URL for WebSocket:", e);
  }
  return `${wsProtocol}//${host}/ws/chat/${userId}`;
}

/**
 * Fetch available chat contacts with live online status
 */
export async function fetchChatContactsApi(userId) {
  try {
    const res = await fetch(`${API_BASE_URL}/chat/contacts?user_id=${userId}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { success: true, data };
  } catch (err) {
    console.warn("fetchChatContactsApi error, fallback:", err);
    return { success: false, data: [] };
  }
}

/**
 * Fetch user's active conversation threads for Messenger dropdown
 */
export async function fetchConversationsApi(userId) {
  try {
    const res = await fetch(`${API_BASE_URL}/chat/conversations?user_id=${userId}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { success: true, data };
  } catch (err) {
    console.warn("fetchConversationsApi error, fallback:", err);
    return { success: false, data: [] };
  }
}

/**
 * Fetch live message history between two users
 */
export async function fetchChatMessagesApi(userId, otherUserId, limit = 100) {
  try {
    const res = await fetch(`${API_BASE_URL}/chat/messages?user_id=${userId}&other_user_id=${otherUserId}&limit=${limit}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { success: true, data };
  } catch (err) {
    console.warn("fetchChatMessagesApi error, fallback:", err);
    return { success: false, data: [] };
  }
}

/**
 * Send a chat message (text, ghost timer, voice note, photo, or star tip)
 */
export async function sendMessageApi(payload) {
  try {
    const res = await fetch(`${API_BASE_URL}/chat/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.detail || `HTTP ${res.status}`);
    }
    const data = await res.json();
    return { success: true, data };
  } catch (err) {
    console.error("sendMessageApi error:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Log an unanswered, rejected, or timed-out call as a Missed Call message
 */
export async function logMissedCallApi(callerId, receiverId, callType = "audio") {
  try {
    const res = await fetch(`${API_BASE_URL}/chat/calls/missed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ caller_id: callerId, receiver_id: receiverId, call_type: callType })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { success: true, data };
  } catch (err) {
    console.warn("logMissedCallApi error:", err);
    return { success: false, error: err.message };
  }
}

/**
 * React with emoji to a message
 */
export async function reactMessageApi(messageId, userId, emoji) {
  try {
    const res = await fetch(`${API_BASE_URL}/chat/messages/${messageId}/react`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, emoji })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { success: true, data };
  } catch (err) {
    console.warn("reactMessageApi error:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Mark messages as read
 */
export async function markMessagesReadApi(userId, otherUserId) {
  try {
    const res = await fetch(`${API_BASE_URL}/chat/messages/mark-read`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, other_user_id: otherUserId })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return { success: true };
  } catch (err) {
    console.warn("markMessagesReadApi error:", err);
    return { success: false };
  }
}

/**
 * Upload chat image/audio attachment
 */
export async function uploadChatMediaApi(file) {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${API_BASE_URL}/chat/upload`, {
      method: "POST",
      body: formData
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { success: true, data };
  } catch (err) {
    console.error("uploadChatMediaApi error:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Upload multiple chat images/attachments
 */
export async function uploadMultipleChatMediaApi(files) {
  try {
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }
    const res = await fetch(`${API_BASE_URL}/chat/upload-multiple`, {
      method: "POST",
      body: formData
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { success: true, data };
  } catch (err) {
    console.error("uploadMultipleChatMediaApi error:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Clear full conversation between two users
 */
export async function clearConversationApi(userId, otherUserId) {
  try {
    const res = await fetch(`${API_BASE_URL}/chat/conversations/${otherUserId}?user_id=${userId}`, {
      method: "DELETE"
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { success: true, data };
  } catch (err) {
    console.warn("clearConversationApi error:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Delete a message (deleteType: "everyone" | "me")
 */
export async function deleteChatMessageApi(messageId, userId, deleteType = "everyone") {
  try {
    const res = await fetch(`${API_BASE_URL}/chat/messages/${messageId}?user_id=${userId}&delete_type=${deleteType}`, {
      method: "DELETE"
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return { success: true };
  } catch (err) {
    console.warn("deleteChatMessageApi error:", err);
    return { success: false };
  }
}

