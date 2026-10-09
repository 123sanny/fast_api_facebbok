/**
 * audioLoungeApi.js - Frontend API Client for Live Audio Lounge & Spaces
 * Connects frontend components to FastAPI backend:
 * - Live audio room directories, host details, and category filters
 * - Dynamic stage speakers & audience participation
 * - Microphones, hand raising (✋), and host approval controls
 * - Live text chat & star tipping (⭐)
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
 * 1. Fetch Active Audio Rooms
 */
export async function fetchAudioRoomsApi({
  userId,
  category = "All",
  search = "",
  status = "live"
} = {}) {
  try {
    const params = new URLSearchParams();
    if (userId) params.append("viewer_user_id", userId.toString());
    if (category && category !== "All") params.append("category", category);
    if (search && search.trim()) params.append("search", search.trim());
    if (status) params.append("status", status);

    const res = await fetch(`${API_BASE_URL}/audio-lounge/rooms?${params.toString()}`, {
      headers: getAuthHeaders()
    });

    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    return { success: true, data };
  } catch (err) {
    console.warn("fetchAudioRoomsApi warning:", err);
    return { success: false, data: [] };
  }
}

/**
 * 2. Fetch Single Audio Room Stage Details
 */
export async function fetchAudioRoomDetailsApi(roomId, userId) {
  try {
    const params = userId ? `?viewer_user_id=${userId}` : "";
    const res = await fetch(`${API_BASE_URL}/audio-lounge/rooms/${roomId}${params}`, {
      headers: getAuthHeaders()
    });

    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    return { success: true, data };
  } catch (err) {
    console.error("fetchAudioRoomDetailsApi error:", err);
    return { success: false, error: err.message };
  }
}

/**
 * 3. Create a New Audio Lounge (Host)
 */
export async function createAudioRoomApi(payload, userId) {
  try {
    const effectiveUserId = userId || payload.host_id || 1;
    const bodyPayload = {
      ...payload,
      host_id: effectiveUserId
    };

    const res = await fetch(`${API_BASE_URL}/audio-lounge/rooms?user_id=${effectiveUserId}`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(bodyPayload)
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || `HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    return { success: true, data: data.room || data };
  } catch (err) {
    console.error("createAudioRoomApi error:", err);
    return { success: false, error: err.message };
  }
}

/**
 * 4. Join Audio Room
 */
export async function joinAudioRoomApi(roomId, userId, asSpeaker = false) {
  try {
    const res = await fetch(`${API_BASE_URL}/audio-lounge/rooms/${roomId}/join?user_id=${userId}&as_speaker=${asSpeaker}`, {
      method: "POST",
      headers: getAuthHeaders()
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || `HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    return { success: true, data: data.room || data };
  } catch (err) {
    console.error("joinAudioRoomApi error:", err);
    return { success: false, error: err.message };
  }
}

/**
 * 5. Leave Audio Room
 */
export async function leaveAudioRoomApi(roomId, userId) {
  try {
    const res = await fetch(`${API_BASE_URL}/audio-lounge/rooms/${roomId}/leave?user_id=${userId}`, {
      method: "POST",
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return { success: true };
  } catch (err) {
    console.warn("leaveAudioRoomApi error:", err);
    return { success: false };
  }
}

/**
 * 6. Toggle Microphone Mute
 */
export async function toggleAudioMuteApi(roomId, userId) {
  try {
    const res = await fetch(`${API_BASE_URL}/audio-lounge/rooms/${roomId}/toggle-mute?user_id=${userId}`, {
      method: "POST",
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    return { success: true, is_muted: data.is_muted };
  } catch (err) {
    console.error("toggleAudioMuteApi error:", err);
    return { success: false, error: err.message };
  }
}

/**
 * 7. Toggle Raise Hand ✋
 */
export async function toggleRaiseHandApi(roomId, userId) {
  try {
    const res = await fetch(`${API_BASE_URL}/audio-lounge/rooms/${roomId}/raise-hand?user_id=${userId}`, {
      method: "POST",
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    return { success: true, hand_raised: data.hand_raised };
  } catch (err) {
    console.error("toggleRaiseHandApi error:", err);
    return { success: false, error: err.message };
  }
}

/**
 * 8. Promote Listener to Speaker (Host Only)
 */
export async function promoteToSpeakerApi(roomId, hostId, targetUserId) {
  try {
    const res = await fetch(`${API_BASE_URL}/audio-lounge/rooms/${roomId}/promote?host_id=${hostId}&target_user_id=${targetUserId}`, {
      method: "POST",
      headers: getAuthHeaders()
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || `HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    return { success: true, data: data.room || data };
  } catch (err) {
    console.error("promoteToSpeakerApi error:", err);
    return { success: false, error: err.message };
  }
}

/**
 * 9. Demote Speaker to Listener (Host Only)
 */
export async function demoteToListenerApi(roomId, hostId, targetUserId) {
  try {
    const res = await fetch(`${API_BASE_URL}/audio-lounge/rooms/${roomId}/demote?host_id=${hostId}&target_user_id=${targetUserId}`, {
      method: "POST",
      headers: getAuthHeaders()
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || `HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    return { success: true, data: data.room || data };
  } catch (err) {
    console.error("demoteToListenerApi error:", err);
    return { success: false, error: err.message };
  }
}

/**
 * 10. Fetch Room Chat Messages
 */
export async function fetchRoomMessagesApi(roomId) {
  try {
    const res = await fetch(`${API_BASE_URL}/audio-lounge/rooms/${roomId}/messages`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    return { success: true, data };
  } catch (err) {
    console.warn("fetchRoomMessagesApi warning:", err);
    return { success: false, data: [] };
  }
}

/**
 * 11. Send Room Message
 */
export async function sendRoomMessageApi(roomId, userId, content) {
  try {
    const res = await fetch(`${API_BASE_URL}/audio-lounge/rooms/${roomId}/messages?user_id=${userId}`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ content })
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    return { success: true, data };
  } catch (err) {
    console.error("sendRoomMessageApi error:", err);
    return { success: false, error: err.message };
  }
}

/**
 * 12. Tip Stars to Speaker ⭐
 */
export async function tipSpeakerStarsApi(roomId, senderId, receiverId, stars = 50) {
  try {
    const res = await fetch(`${API_BASE_URL}/audio-lounge/rooms/${roomId}/tip?sender_id=${senderId}`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ receiver_id: receiverId, stars })
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    return { success: true, message: data.message };
  } catch (err) {
    console.error("tipSpeakerStarsApi error:", err);
    return { success: false, error: err.message };
  }
}

/**
 * 13. End Audio Room (Host Only)
 */
export async function endAudioRoomApi(roomId, hostId) {
  try {
    const res = await fetch(`${API_BASE_URL}/audio-lounge/rooms/${roomId}/end?host_id=${hostId}`, {
      method: "POST",
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return { success: true };
  } catch (err) {
    console.error("endAudioRoomApi error:", err);
    return { success: false, error: err.message };
  }
}
