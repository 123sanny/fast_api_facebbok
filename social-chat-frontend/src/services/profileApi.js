/**
 * Nexoria Profile FastAPI Client Service
 * Connects frontend EditProfile & Profile components to backend FastAPI database tables.
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

export const getActiveUserId = () => {
  try {
    const id = localStorage.getItem("user_id");
    return id ? parseInt(id, 10) : 1;
  } catch {
    return 1;
  }
};

export const getActiveUserName = (fallback = "Nexoria User") => {
  try {
    const fullName = localStorage.getItem("full_name");
    if (fullName && fullName.trim()) return fullName.trim();
    const firstName = localStorage.getItem("first_name");
    const surname = localStorage.getItem("surname");
    if (firstName && surname) return `${firstName} ${surname}`.trim();
    if (firstName) return firstName.trim();
    return fallback;
  } catch {
    return fallback;
  }
};

export const getActiveUserFirstName = (fallback = "User") => {
  try {
    const firstName = localStorage.getItem("first_name");
    if (firstName && firstName.trim()) return firstName.trim();
    const fullName = localStorage.getItem("full_name");
    if (fullName && fullName.trim()) return fullName.split(" ")[0];
    return fallback;
  } catch {
    return fallback;
  }
};

export const getActiveUserHandle = () => {
  try {
    const username = localStorage.getItem("username");
    if (username && username.trim()) return `@${username.toLowerCase().replace(/[^a-z0-9_]/g, '')}`;
    const name = getActiveUserName();
    return `@${name.toLowerCase().replace(/[^a-z0-9_]/g, '')}`;
  } catch {
    return `@user_${getActiveUserId()}`;
  }
};

export const getUserStorageItem = (key, fallback = null, userId = getActiveUserId()) => {
  try {
    const val = localStorage.getItem(`user_${userId}_${key}`);
    if (val !== null && val !== undefined) return val;
    return fallback;
  } catch {
    return fallback;
  }
};

export const setUserStorageItem = (key, val, userId = getActiveUserId()) => {
  try {
    const stringVal = typeof val === "object" && val !== null ? JSON.stringify(val) : String(val || "");
    localStorage.setItem(`user_${userId}_${key}`, stringVal);
    if (String(userId) === String(getActiveUserId())) {
      localStorage.setItem(`user_profile_${key}`, stringVal);
    }
  } catch (err) {
    console.warn("Storage error:", err);
  }
};

export const clearUserProfileCache = (userId) => {
  try {
    const activeKeys = [
      "avatar", "cover", "bio", "pinned_details", "categories", "ai_creator",
      "location", "hometown", "education", "dob", "status", "family", "pets",
      "gender", "pronouns", "languages", "work", "hobbies", "interests",
      "places", "communities", "offers", "socials", "links", "badges", "phone", "email"
    ];
    activeKeys.forEach(k => {
      localStorage.removeItem(`user_profile_${k}`);
      if (userId) {
        localStorage.removeItem(`user_${userId}_${k}`);
      }
    });
  } catch (e) {}
};

const defaultHeaders = () => {
  const token = localStorage.getItem("access_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

/**
 * 0. Fetch complete unified profile & metrics
 */
export const fetchFullProfileApi = async (userId = getActiveUserId(), viewerId = null) => {
  try {
    let url = `${API_BASE_URL}/users/${userId}/profile/full`;
    if (viewerId) {
      url += `?viewer_id=${encodeURIComponent(viewerId)}`;
    }
    const res = await fetch(url, {
      headers: defaultHeaders()
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return { success: true, data };
  } catch (err) {
    console.warn("FastAPI backend offline or error, using local state:", err.message);
    return { success: false, error: err.message };
  }
};

/**
 * 1. Avatar & Cover Photos (File Upload & URL updates)
 */
export const uploadAvatarFileApi = async (file, userId = getActiveUserId()) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const token = localStorage.getItem("access_token");
    const res = await fetch(`${API_BASE_URL}/users/${userId}/profile-image`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("Avatar file upload failed:", err.message);
    return { success: false, error: err.message };
  }
};

export const uploadCoverFileApi = async (file, userId = getActiveUserId()) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const token = localStorage.getItem("access_token");
    const res = await fetch(`${API_BASE_URL}/users/${userId}/cover-photo`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("Cover photo file upload failed:", err.message);
    return { success: false, error: err.message };
  }
};

export const updateAvatarUrlApi = async (photoUrl, userId = getActiveUserId()) => {
  try {
    const res = await fetch(`${API_BASE_URL}/users/${userId}/profile/avatar-url`, {
      method: "PUT",
      headers: defaultHeaders(),
      body: JSON.stringify({ photo_url: photoUrl })
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
};

export const updateCoverUrlApi = async (photoUrl, userId = getActiveUserId()) => {
  try {
    const res = await fetch(`${API_BASE_URL}/users/${userId}/profile/cover-url`, {
      method: "PUT",
      headers: defaultHeaders(),
      body: JSON.stringify({ photo_url: photoUrl })
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
};

export const adjustCoverPositionApi = async ({ offset_y = 0, zoom = 1.0 }, userId = getActiveUserId()) => {
  try {
    const res = await fetch(`${API_BASE_URL}/users/${userId}/profile/cover/adjust`, {
      method: "PUT",
      headers: defaultHeaders(),
      body: JSON.stringify({ offset_y, zoom })
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
};

/**
 * 2. Bio & Intro Quote
 */
export const updateBioApi = async ({ bio, intro_quote }, userId = getActiveUserId()) => {
  try {
    const res = await fetch(`${API_BASE_URL}/users/${userId}/profile/bio`, {
      method: "PUT",
      headers: defaultHeaders(),
      body: JSON.stringify({ bio, intro_quote })
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
};

/**
 * 3. Pinned Details
 */
export const updatePinnedDetailsApi = async (pinnedDetails, userId = getActiveUserId()) => {
  try {
    const res = await fetch(`${API_BASE_URL}/users/${userId}/profile/pinned`, {
      method: "PUT",
      headers: defaultHeaders(),
      body: JSON.stringify({ pinned_details: pinnedDetails })
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
};

/**
 * 4. Category & AI Creator Status
 */
export const updateCategoryApi = async ({ categories, is_ai_creator }, userId = getActiveUserId()) => {
  try {
    const res = await fetch(`${API_BASE_URL}/users/${userId}/profile/category`, {
      method: "PUT",
      headers: defaultHeaders(),
      body: JSON.stringify({ categories, is_ai_creator })
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
};

/**
 * 5. Personal Details (City, Hometown, Relationship, DOB, Gender, Pronouns, Languages)
 */
export const updatePersonalDetailsApi = async (details, userId = getActiveUserId()) => {
  try {
    const res = await fetch(`${API_BASE_URL}/users/${userId}/profile/personal`, {
      method: "PUT",
      headers: defaultHeaders(),
      body: JSON.stringify(details)
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
};

/**
 * 6. Family & Pets
 */
export const updateFamilyAndPetsApi = async ({ family_members = [], pets = [] }, userId = getActiveUserId()) => {
  try {
    const res = await fetch(`${API_BASE_URL}/users/${userId}/profile/family`, {
      method: "PUT",
      headers: defaultHeaders(),
      body: JSON.stringify({ family_members, pets })
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
};

/**
 * 7. Work Experience
 */
export const updateWorkApi = async ({ work_workplace, work_job_title, work_privacy = "Public" }, userId = getActiveUserId()) => {
  try {
    const res = await fetch(`${API_BASE_URL}/users/${userId}/profile/work`, {
      method: "PUT",
      headers: defaultHeaders(),
      body: JSON.stringify({ work_workplace, work_job_title, work_privacy })
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
};

/**
 * 8. Education Details
 */
export const updateEducationApi = async ({ education_school, education_college, education_degree, education_privacy = "Public" }, userId = getActiveUserId()) => {
  try {
    const res = await fetch(`${API_BASE_URL}/users/${userId}/profile/education`, {
      method: "PUT",
      headers: defaultHeaders(),
      body: JSON.stringify({ education_school, education_college, education_degree, education_privacy })
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
};

/**
 * 9. Hobbies
 */
export const updateHobbiesApi = async (hobbies, userId = getActiveUserId()) => {
  try {
    const res = await fetch(`${API_BASE_URL}/users/${userId}/profile/hobbies`, {
      method: "PUT",
      headers: defaultHeaders(),
      body: JSON.stringify({ hobbies })
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
};

/**
 * 10. Interests
 */
export const updateInterestsApi = async (interests, userId = getActiveUserId()) => {
  try {
    const res = await fetch(`${API_BASE_URL}/users/${userId}/profile/interests`, {
      method: "PUT",
      headers: defaultHeaders(),
      body: JSON.stringify({
        music: interests.music || [],
        tv_programmes: interests.tv_programmes || [],
        films: interests.films || [],
        games: interests.games || [],
        sports: interests.sports || []
      })
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
};

/**
 * 11. Visited Places / Travel
 */
export const updatePlacesApi = async ({ visited_places = [], places_privacy = "Public" }, userId = getActiveUserId()) => {
  try {
    const res = await fetch(`${API_BASE_URL}/users/${userId}/profile/places`, {
      method: "PUT",
      headers: defaultHeaders(),
      body: JSON.stringify({ visited_places, places_privacy })
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
};

/**
 * 12. Communities & Groups
 */
export const updateCommunitiesApi = async (communities, userId = getActiveUserId()) => {
  try {
    const res = await fetch(`${API_BASE_URL}/users/${userId}/profile/communities`, {
      method: "PUT",
      headers: defaultHeaders(),
      body: JSON.stringify({ communities })
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
};

/**
 * 13. Offers & Deals
 */
export const updateOffersApi = async (offers, userId = getActiveUserId()) => {
  try {
    const res = await fetch(`${API_BASE_URL}/users/${userId}/profile/offers`, {
      method: "PUT",
      headers: defaultHeaders(),
      body: JSON.stringify({ offers })
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
};

/**
 * 14. Social Handles & Contact Info
 */
export const updateSocialsApi = async (socialsData, userId = getActiveUserId()) => {
  try {
    const res = await fetch(`${API_BASE_URL}/users/${userId}/profile/socials`, {
      method: "PUT",
      headers: defaultHeaders(),
      body: JSON.stringify(socialsData)
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
};

/**
 * 15. Creator Media Kit
 */
export const updateMediaKitApi = async ({ media_kit_title, media_kit_link, media_kit_privacy = "Public" }, userId = getActiveUserId()) => {
  try {
    const res = await fetch(`${API_BASE_URL}/users/${userId}/profile/media-kit`, {
      method: "PUT",
      headers: defaultHeaders(),
      body: JSON.stringify({ media_kit_title, media_kit_link, media_kit_privacy })
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
};

/**
 * 16. Verified Trust Badges
 */
export const updateBadgesApi = async ({ badges, aadhaar_verified = true }, userId = getActiveUserId()) => {
  try {
    const res = await fetch(`${API_BASE_URL}/users/${userId}/profile/badges`, {
      method: "PUT",
      headers: defaultHeaders(),
      body: JSON.stringify({ badges, aadhaar_verified })
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
};

/**
 * 16.5 Global Community Feed API (All Users' Posts for Home Timeline)
 */
export const fetchGlobalFeedPostsApi = async (viewerId = getActiveUserId(), limit = 100, offset = 0) => {
  try {
    let url = `${API_BASE_URL}/posts/feed?limit=${limit}&offset=${offset}`;
    if (viewerId) {
      url += `&viewer_id=${encodeURIComponent(viewerId)}`;
    }
    const res = await fetch(url, {
      headers: defaultHeaders()
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn("fetchGlobalFeedPostsApi error:", err);
    return { success: false, data: [] };
  }
};

/**
 * 16.6 Create New Post API (Persists to Database & Global Feed)
 */
export const createPostApi = async (postPayload) => {
  try {
    const res = await fetch(`${API_BASE_URL}/posts`, {
      method: "POST",
      headers: defaultHeaders(),
      body: JSON.stringify(postPayload)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn("createPostApi error:", err);
    return { success: false, error: err.message };
  }
};

/**
 * 17. Dynamic User Posts from Database (Profile Page Only)
 */
export const fetchUserPostsApi = async (userId = getActiveUserId(), viewerId = null) => {
  try {
    let url = `${API_BASE_URL}/users/${userId}/posts`;
    if (viewerId) {
      url += `?viewer_id=${encodeURIComponent(viewerId)}`;
    }
    const res = await fetch(url, {
      headers: defaultHeaders()
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn("fetchUserPostsApi error:", err);
    return { success: false, data: [] };
  }
};

/**
 * 18. Dynamic User Photos from Database
 */
export const fetchUserPhotosApi = async (userId = getActiveUserId(), viewerId = null) => {
  try {
    let url = `${API_BASE_URL}/users/${userId}/photos`;
    if (viewerId) {
      url += `?viewer_id=${encodeURIComponent(viewerId)}`;
    }
    const res = await fetch(url, {
      headers: defaultHeaders()
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn("fetchUserPhotosApi error:", err);
    return { success: false, data: [] };
  }
};

/**
 * 18.1 Post / Photo Reaction & Like API
 */
export const reactToPostApi = async (postId, userId = getActiveUserId(), reactionType = "like") => {
  try {
    const res = await fetch(`${API_BASE_URL}/posts/${postId}/react`, {
      method: "POST",
      headers: defaultHeaders(),
      body: JSON.stringify({ user_id: userId, reaction_type: reactionType })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn("reactToPostApi error:", err);
    return { success: false, error: err.message };
  }
};

/**
 * 18.2 Post / Photo Comment API
 */
export const commentOnPostApi = async (postId, userId = getActiveUserId(), content = "") => {
  try {
    const res = await fetch(`${API_BASE_URL}/posts/${postId}/comments`, {
      method: "POST",
      headers: defaultHeaders(),
      body: JSON.stringify({ user_id: userId, content })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn("commentOnPostApi error:", err);
    return { success: false, error: err.message };
  }
};

/**
 * 18.3 Post / Photo Share API
 */
export const sharePostApi = async (postId, userId = getActiveUserId()) => {
  try {
    const res = await fetch(`${API_BASE_URL}/posts/${postId}/share`, {
      method: "POST",
      headers: defaultHeaders(),
      body: JSON.stringify({ user_id: userId })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn("sharePostApi error:", err);
    return { success: false, error: err.message };
  }
};

/**
 * 19. Dynamic User Reels from Database
 */
export const fetchUserReelsApi = async (userId = getActiveUserId()) => {
  try {
    const res = await fetch(`${API_BASE_URL}/users/${userId}/reels`, {
      headers: defaultHeaders()
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn("fetchUserReelsApi error:", err);
    return { success: false, data: [] };
  }
};

/**
 * 20. Dynamic User Friends List from Database
 */
export const fetchUserFriendsApi = async (userId = getActiveUserId()) => {
  try {
    const res = await fetch(`${API_BASE_URL}/users/${userId}/friends`, {
      headers: defaultHeaders()
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { success: true, data };
  } catch (err) {
    console.warn("fetchUserFriendsApi error:", err);
    return { success: false, data: [] };
  }
};

/**
 * 21. Toggle Follow User
 */
export const toggleFollowApi = async (targetUserId, followerId = getActiveUserId()) => {
  try {
    const res = await fetch(`${API_BASE_URL}/users/${targetUserId}/follow?follower_id=${followerId}`, {
      method: "POST",
      headers: defaultHeaders()
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn("toggleFollowApi error:", err);
    return { success: false, is_following: false };
  }
};

/**
 * 22. Purchase / Activate Blue Tick Verification
 */
export const purchaseVerificationApi = async (userId = getActiveUserId(), payload = { plan_tier: "blue_tick_monthly", payment_method: "stars" }) => {
  try {
    const res = await fetch(`${API_BASE_URL}/users/${userId}/verification/purchase`, {
      method: "POST",
      headers: defaultHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn("purchaseVerificationApi error:", err);
    return { success: false, message: err.message };
  }
};

/**
 * 23. Direct Verification Toggle API
 */
export const toggleVerificationApi = async (userId = getActiveUserId(), isVerified = true) => {
  try {
    const res = await fetch(`${API_BASE_URL}/users/${userId}/verification/toggle`, {
      method: "POST",
      headers: defaultHeaders(),
      body: JSON.stringify({ is_verified: isVerified })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn("toggleVerificationApi error:", err);
    return { success: false, message: err.message };
  }
};

/**
 * 24. Fetch Profile Name & Username API
 */
export const fetchProfileNameApi = async (userId = getActiveUserId()) => {
  try {
    const res = await fetch(`${API_BASE_URL}/users/${userId}/profile/name`, {
      headers: defaultHeaders()
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn("fetchProfileNameApi error:", err);
    return {
      success: false,
      first_name: localStorage.getItem("first_name") || "",
      surname: localStorage.getItem("surname") || "",
      full_name: getActiveUserName(),
      username: localStorage.getItem("username") || ""
    };
  }
};

/**
 * 25. Update Profile Name & Username API
 */
export const updateProfileNameApi = async (nameData, userId = getActiveUserId()) => {
  try {
    const res = await fetch(`${API_BASE_URL}/users/${userId}/profile/name`, {
      method: "PUT",
      headers: defaultHeaders(),
      body: JSON.stringify(nameData)
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, message: data.detail || "Failed to update profile name" };
    }
    if (data.first_name !== undefined) localStorage.setItem("first_name", data.first_name);
    if (data.surname !== undefined) localStorage.setItem("surname", data.surname);
    if (data.full_name !== undefined) localStorage.setItem("full_name", data.full_name);
    if (data.username !== undefined) localStorage.setItem("username", data.username);
    
    // Dispatch global event for instant UI update across Header, Profile, and Settings
    window.dispatchEvent(new Event("profile-updated"));
    return { success: true, ...data };
  } catch (err) {
    console.error("updateProfileNameApi error:", err);
    return { success: false, message: err.message || "Network error" };
  }
};


