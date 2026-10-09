/**
 * friendApi.js - Comprehensive API client for Friends, Requests & Suggestions
 * Handles real-time communication with FastAPI backend endpoints:
 * - Incoming Friend Requests
 * - Friend Suggestions (Proximity, Alumni, Tech, Creative)
 * - Accepted Friends Directory
 * - Sending, Accepting, Rejecting, Cancelling Requests
 * - Unfriending & Star/Close Friends toggle
 */

const API_BASE_URL = "http://localhost:8000";

const getAuthHeaders = () => {
  const token = localStorage.getItem("access_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

/**
 * 1. Fetch Incoming Friend Requests
 */
export async function fetchFriendRequestsApi(userId) {
  try {
    const res = await fetch(`${API_BASE_URL}/users/${userId}/friends/requests`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    return { success: true, data };
  } catch (err) {
    console.warn("fetchFriendRequestsApi fallback:", err);
    return { success: false, data: [] };
  }
}

/**
 * 2. Fetch Smart Friend Suggestions
 */
export async function fetchFriendSuggestionsApi(userId, category = null) {
  try {
    const query = category && category !== "all" ? `?category=${encodeURIComponent(category)}` : "";
    const res = await fetch(`${API_BASE_URL}/users/${userId}/friends/suggestions${query}`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    return { success: true, data };
  } catch (err) {
    console.warn("fetchFriendSuggestionsApi fallback:", err);
    return { success: false, data: [] };
  }
}

/**
 * 3. Fetch Accepted Friends Directory
 */
export async function fetchUserFriendsApi(userId) {
  try {
    const res = await fetch(`${API_BASE_URL}/users/${userId}/friends`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    return { success: true, data };
  } catch (err) {
    console.warn("fetchUserFriendsApi fallback:", err);
    return { success: false, data: [] };
  }
}

/**
 * 4. Fetch Friend Stats (Total, Pending, Suggestions)
 */
export async function fetchFriendStatsApi(userId) {
  try {
    const res = await fetch(`${API_BASE_URL}/users/${userId}/friends/stats`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    return { success: true, data };
  } catch (err) {
    console.warn("fetchFriendStatsApi fallback:", err);
    return {
      success: false,
      data: { total_friends: 0, pending_requests: 0, suggestions_count: 0, online_count: 0 }
    };
  }
}

/**
 * 5. Send Friend Request
 */
export async function sendFriendRequestApi(senderId, receiverId) {
  try {
    const res = await fetch(`${API_BASE_URL}/users/${senderId}/friends/requests`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ receiver_id: receiverId })
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || `HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    return { success: true, data };
  } catch (err) {
    console.error("sendFriendRequestApi error:", err);
    return { success: false, error: err.message };
  }
}

/**
 * 6. Accept Friend Request
 */
export async function acceptFriendRequestApi(requestId, userId) {
  try {
    const res = await fetch(`${API_BASE_URL}/users/${userId}/friends/requests/${requestId}/accept`, {
      method: "POST",
      headers: getAuthHeaders()
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || `HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    return { success: true, data };
  } catch (err) {
    console.error("acceptFriendRequestApi error:", err);
    return { success: false, error: err.message };
  }
}

/**
 * 7. Reject / Delete Friend Request
 */
export async function rejectFriendRequestApi(requestId, userId) {
  try {
    const res = await fetch(`${API_BASE_URL}/users/${userId}/friends/requests/${requestId}/reject`, {
      method: "POST",
      headers: getAuthHeaders()
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || `HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    return { success: true, data };
  } catch (err) {
    console.error("rejectFriendRequestApi error:", err);
    return { success: false, error: err.message };
  }
}

/**
 * 8. Cancel Sent Friend Request
 */
export async function cancelFriendRequestApi(senderId, receiverId) {
  try {
    const res = await fetch(`${API_BASE_URL}/users/${senderId}/friends/requests/${receiverId}/cancel`, {
      method: "DELETE",
      headers: getAuthHeaders()
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || `HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    return { success: true, data };
  } catch (err) {
    console.error("cancelFriendRequestApi error:", err);
    return { success: false, error: err.message };
  }
}

/**
 * 9. Remove Friend (Unfriend)
 */
export async function removeFriendApi(userId, friendId) {
  try {
    const res = await fetch(`${API_BASE_URL}/users/${userId}/friends/${friendId}/remove`, {
      method: "DELETE",
      headers: getAuthHeaders()
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || `HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    return { success: true, data };
  } catch (err) {
    console.error("removeFriendApi error:", err);
    return { success: false, error: err.message };
  }
}

/**
 * 10. Toggle Star / Close Friend
 */
export async function toggleStarFriendApi(userId, friendId) {
  try {
    const res = await fetch(`${API_BASE_URL}/users/${userId}/friends/${friendId}/toggle-star`, {
      method: "POST",
      headers: getAuthHeaders()
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || `HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    return { success: true, data };
  } catch (err) {
    console.error("toggleStarFriendApi error:", err);
    return { success: false, error: err.message };
  }
}

/**
 * 11. Fetch Blocked Users
 */
export async function fetchBlockedUsersApi(userId) {
  try {
    const res = await fetch(`${API_BASE_URL}/users/${userId}/blocked`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    return { success: true, data };
  } catch (err) {
    console.warn("fetchBlockedUsersApi error:", err);
    return { success: false, data: [] };
  }
}

/**
 * 12. Block a User
 */
export async function blockUserApi(userId, targetIdentifier, reason = "Blocked by user") {
  try {
    const res = await fetch(`${API_BASE_URL}/users/${userId}/block`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ identifier: targetIdentifier, reason })
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, message: data.detail || "Could not block user" };
    }
    return { success: true, message: data.message, data };
  } catch (err) {
    console.error("blockUserApi error:", err);
    return { success: false, message: "Network connection error" };
  }
}

/**
 * 13. Unblock a User
 */
export async function unblockUserApi(userId, blockedUserId) {
  try {
    const res = await fetch(`${API_BASE_URL}/users/${userId}/blocked/${blockedUserId}`, {
      method: "DELETE",
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, message: data.detail || "Could not unblock user" };
    }
    return { success: true, message: data.message };
  } catch (err) {
    console.error("unblockUserApi error:", err);
    return { success: false, message: "Network connection error" };
  }
}

/**
 * 14. Search Users to Block
 */
export async function searchUsersToBlockApi(userId, query = "") {
  try {
    const qParam = query ? `?q=${encodeURIComponent(query)}` : "";
    const res = await fetch(`${API_BASE_URL}/users/${userId}/search-to-block${qParam}`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    return { success: true, data };
  } catch (err) {
    console.warn("searchUsersToBlockApi error:", err);
    return { success: false, data: [] };
  }
}


