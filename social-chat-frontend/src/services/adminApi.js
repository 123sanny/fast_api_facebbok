// Nexoria Enterprise Admin Panel API Service

const API_BASE_URL = process.env.REACT_APP_API_URL || process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";

const defaultHeaders = () => {
  const adminToken = sessionStorage.getItem("nexoria_admin_token") || localStorage.getItem("nexoria_admin_token");
  return {
    "Content-Type": "application/json",
    ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {})
  };
};

/**
 * 0. Admin Authentication & Session Verification
 */
export async function loginAdminApi(identifier, password, masterPin = "") {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password, master_pin: masterPin })
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, message: data.detail || "Invalid admin credentials or Master PIN" };
    }
    return data;
  } catch (err) {
    console.error("loginAdminApi error:", err);
    return { success: false, message: err.message || "Admin authentication network error" };
  }
}

export async function verifyAdminSessionApi(token) {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/verify-session?token=${encodeURIComponent(token)}`);
    if (!res.ok) return { success: false };
    return await res.json();
  } catch (err) {
    return { success: false };
  }
}

/**
 * 1. Master KPI Metrics
 */
export async function fetchAdminMetricsApi() {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/dashboard/metrics`, {
      headers: defaultHeaders()
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("fetchAdminMetricsApi error:", err);
    return { success: false, metrics: null };
  }
}

/**
 * 2. User Directory & Search
 */
export async function fetchAdminUsersApi(search = "", filterType = "all", page = 1, limit = 20) {
  try {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (filterType && filterType !== "all") params.append("filter_type", filterType);
    params.append("page", page);
    params.append("limit", limit);

    const res = await fetch(`${API_BASE_URL}/admin/users?${params.toString()}`, {
      headers: defaultHeaders()
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("fetchAdminUsersApi error:", err);
    return { success: false, data: [], total: 0 };
  }
}

/**
 * 3. Update User Status (Block / Unblock / Suspend)
 */
export async function updateUserStatusApi(userId, isActive, banReason = null) {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/users/${userId}/status`, {
      method: "PUT",
      headers: defaultHeaders(),
      body: JSON.stringify({ is_active: isActive, ban_reason: banReason })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("updateUserStatusApi error:", err);
    return { success: false, message: err.message };
  }
}

/**
 * 4. Toggle User Verification (Blue Tick)
 */
export async function updateUserVerificationApi(userId, isVerified) {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/users/${userId}/verification`, {
      method: "PUT",
      headers: defaultHeaders(),
      body: JSON.stringify({ is_verified: isVerified })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("updateUserVerificationApi error:", err);
    return { success: false, message: err.message };
  }
}

/**
 * 5. Delete User Account
 */
export async function deleteUserApi(userId) {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
      method: "DELETE",
      headers: defaultHeaders()
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("deleteUserApi error:", err);
    return { success: false, message: err.message };
  }
}

/**
 * 6. Posts Moderation
 */
export async function fetchAdminPostsApi(search = "", limit = 50, offset = 0) {
  try {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    params.append("limit", limit);
    params.append("offset", offset);

    const res = await fetch(`${API_BASE_URL}/admin/posts?${params.toString()}`, {
      headers: defaultHeaders()
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("fetchAdminPostsApi error:", err);
    return { success: false, data: [] };
  }
}

export async function deleteAdminPostApi(postId) {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/posts/${postId}`, {
      method: "DELETE",
      headers: defaultHeaders()
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("deleteAdminPostApi error:", err);
    return { success: false, message: err.message };
  }
}

/**
 * 7. Reels Moderation
 */
export async function fetchAdminReelsApi(search = "", limit = 50, offset = 0) {
  try {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    params.append("limit", limit);
    params.append("offset", offset);

    const res = await fetch(`${API_BASE_URL}/admin/reels?${params.toString()}`, {
      headers: defaultHeaders()
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("fetchAdminReelsApi error:", err);
    return { success: false, data: [] };
  }
}

export async function deleteAdminReelApi(reelId) {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/reels/${reelId}`, {
      method: "DELETE",
      headers: defaultHeaders()
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("deleteAdminReelApi error:", err);
    return { success: false, message: err.message };
  }
}

/**
 * 8. Reports Queue & Action
 */
export async function fetchAdminReportsApi() {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/reports`, {
      headers: defaultHeaders()
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("fetchAdminReportsApi error:", err);
    return { success: false, data: [] };
  }
}

export async function actionAdminReportApi(reportId, action, notes = null) {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/reports/${reportId}/action`, {
      method: "POST",
      headers: defaultHeaders(),
      body: JSON.stringify({ action, notes })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("actionAdminReportApi error:", err);
    return { success: false, message: err.message };
  }
}

/**
 * 9. User Direct Security & Star Controls
 */
export async function resetUserPasswordApi(userId, newPassword) {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/users/${userId}/reset-password`, {
      method: "POST",
      headers: defaultHeaders(),
      body: JSON.stringify({ new_password: newPassword })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("resetUserPasswordApi error:", err);
    return { success: false, message: err.message };
  }
}

export async function adjustUserStarsApi(userId, amount, note = "") {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/users/${userId}/adjust-stars`, {
      method: "POST",
      headers: defaultHeaders(),
      body: JSON.stringify({ amount, note })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("adjustUserStarsApi error:", err);
    return { success: false, message: err.message };
  }
}

/**
 * 10. Finance & Creator Economy
 */
export async function fetchAdminFinanceApi() {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/finance/overview`, {
      headers: defaultHeaders()
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("fetchAdminFinanceApi error:", err);
    return { success: false, summary: null, payouts: [], transactions: [] };
  }
}

export async function processAdminPayoutApi(payoutId, action, notes = "") {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/finance/payout/${payoutId}/action`, {
      method: "POST",
      headers: defaultHeaders(),
      body: JSON.stringify({ action, notes })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("processAdminPayoutApi error:", err);
    return { success: false, message: err.message };
  }
}

/**
 * 11. Support Helpdesk & Bug Tracker
 */
export async function fetchAdminSupportTicketsApi() {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/support/tickets`, {
      headers: defaultHeaders()
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("fetchAdminSupportTicketsApi error:", err);
    return { success: false, data: [] };
  }
}

export async function replyAdminTicketApi(ticketId, replyMessage, newStatus = "resolved") {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/support/tickets/${ticketId}/reply`, {
      method: "POST",
      headers: defaultHeaders(),
      body: JSON.stringify({ message: replyMessage, status: newStatus })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("replyAdminTicketApi error:", err);
    return { success: false, message: err.message };
  }
}

export async function fetchAdminBugReportsApi() {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/support/bugs`, {
      headers: defaultHeaders()
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("fetchAdminBugReportsApi error:", err);
    return { success: false, data: [] };
  }
}

/**
 * 12. Live Global Broadcast Dispatcher
 */
export async function sendAdminBroadcastApi(payload) {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/broadcast/send`, {
      method: "POST",
      headers: defaultHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("sendAdminBroadcastApi error:", err);
    return { success: false, message: err.message };
  }
}

/**
 * 13. Platform System Settings
 */
export async function fetchAdminSettingsApi() {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/settings`, {
      headers: defaultHeaders()
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("fetchAdminSettingsApi error:", err);
    return { success: false, settings: {} };
  }
}

export async function updateAdminSettingsApi(payload) {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/settings`, {
      method: "PUT",
      headers: defaultHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("updateAdminSettingsApi error:", err);
    return { success: false, message: err.message };
  }
}

/**
 * 14. Star Purchase Verification & Approvals
 */
export async function fetchAdminStarPurchasesApi(status = "all") {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/star-purchases?status=${status}`, {
      headers: defaultHeaders()
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("fetchAdminStarPurchasesApi error:", err);
    return { success: false, data: [] };
  }
}

export async function verifyGrantStarsApi(requestId, action, note = "") {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/star-purchases/${requestId}/action`, {
      method: "POST",
      headers: defaultHeaders(),
      body: JSON.stringify({ action, note })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("verifyGrantStarsApi error:", err);
    return { success: false, message: err.message };
  }
}

export async function submitUserStarPurchaseApi(payload) {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/star-purchases/submit`, {
      method: "POST",
      headers: defaultHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("submitUserStarPurchaseApi error:", err);
    return { success: false, message: err.message };
  }
}

/**
 * 15. Blue Tick Purchases & Verified Users Directory
 */
export async function fetchAdminBlueTickRequestsApi(status = "all") {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/bluetick/requests?status=${status}`, {
      headers: defaultHeaders()
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("fetchAdminBlueTickRequestsApi error:", err);
    return { success: false, data: [] };
  }
}

export async function fetchAdminVerifiedUsersApi() {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/bluetick/verified-users`, {
      headers: defaultHeaders()
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("fetchAdminVerifiedUsersApi error:", err);
    return { success: false, data: [] };
  }
}

export async function processBlueTickRequestApi(requestId, action, note = "") {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/bluetick/requests/${requestId}/action`, {
      method: "POST",
      headers: defaultHeaders(),
      body: JSON.stringify({ action, note })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("processBlueTickRequestApi error:", err);
    return { success: false, message: err.message };
  }
}

export async function revokeBlueTickApi(userId) {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/bluetick/revoke/${userId}`, {
      method: "POST",
      headers: defaultHeaders()
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("revokeBlueTickApi error:", err);
    return { success: false, message: err.message };
  }
}

export async function submitUserBlueTickApi(payload) {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/bluetick/submit`, {
      method: "POST",
      headers: defaultHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("submitUserBlueTickApi error:", err);
    return { success: false, message: err.message };
  }
}

/**
 * 15. Star to Rupee (INR) Cashout / Redemption Queue
 */
export async function fetchAdminStarCashoutsApi(status = "all") {
  try {
    const params = new URLSearchParams();
    if (status && status !== "all") params.append("status", status);

    const res = await fetch(`${API_BASE_URL}/admin/star-cashouts?${params.toString()}`, {
      headers: defaultHeaders()
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("fetchAdminStarCashoutsApi error:", err);
    return { success: false, data: [] };
  }
}

export async function processStarCashoutApi(requestId, action, payoutRef = "", note = "") {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/star-cashouts/${requestId}/action`, {
      method: "POST",
      headers: defaultHeaders(),
      body: JSON.stringify({ action, payout_ref: payoutRef, note })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("processStarCashoutApi error:", err);
    return { success: false, message: err.message };
  }
}

export async function submitUserStarCashoutApi(payload) {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/star-cashouts/submit`, {
      method: "POST",
      headers: defaultHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("submitUserStarCashoutApi error:", err);
    return { success: false, message: err.message };
  }
}

export async function fetchUserStarCashoutsApi(userId) {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/star-cashouts/user/${userId}`, {
      headers: defaultHeaders()
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("fetchUserStarCashoutsApi error:", err);
    return { success: false, data: [] };
  }
}

/**
 * 16. 4-Digit Payment PIN Reset / Forgot PIN Verification Queue
 */
export async function fetchAdminPinResetsApi(status = "all") {
  try {
    const params = new URLSearchParams();
    if (status && status !== "all") params.append("status", status);

    const res = await fetch(`${API_BASE_URL}/admin/pin-resets?${params.toString()}`, {
      headers: defaultHeaders()
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("fetchAdminPinResetsApi error:", err);
    return { success: false, data: [] };
  }
}

export async function processPinResetRequestApi(requestId, action, note = "") {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/pin-resets/${requestId}/action`, {
      method: "POST",
      headers: defaultHeaders(),
      body: JSON.stringify({ action, note })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("processPinResetRequestApi error:", err);
    return { success: false, message: err.message };
  }
}

export async function submitUserPinResetApi(payload) {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/pin-resets/submit`, {
      method: "POST",
      headers: defaultHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("submitUserPinResetApi error:", err);
    return { success: false, message: err.message };
  }
}

export async function fetchUserPinResetStatusApi(userId) {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/pin-resets/user-status/${userId}`, {
      headers: defaultHeaders()
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("fetchUserPinResetStatusApi error:", err);
    return { success: false, has_request: false, status: "none" };
  }
}

export async function completeUserPinResetApi(payload) {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/pin-resets/complete-reset`, {
      method: "POST",
      headers: defaultHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("completeUserPinResetApi error:", err);
    return { success: false, message: err.message };
  }
}

/**
 * 17. 2-Day (48-Hour) PIN Lockout & Verification
 */
export async function verifyPaymentPinApi(payload) {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/pin-resets/verify-pin`, {
      method: "POST",
      headers: defaultHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return errData.detail ? { success: false, message: errData.detail } : { success: false, message: `HTTP ${res.status}` };
    }
    return await res.json();
  } catch (err) {
    console.error("verifyPaymentPinApi error:", err);
    return { success: false, message: err.message || "Network error verifying PIN" };
  }
}

export async function fetchPinLockStatusApi(userId) {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/pin-resets/lock-status/${userId}`, {
      headers: defaultHeaders()
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("fetchPinLockStatusApi error:", err);
    return { success: false, is_locked: false, failed_attempts: 0, remaining_attempts: 5 };
  }
}

/**
 * 18. User Payment Methods & Vault Audit API
 */
export async function fetchAdminPaymentMethodsApi(type = "all", search = "") {
  try {
    const params = new URLSearchParams();
    if (type && type !== "all") params.append("type", type);
    if (search && search.trim()) params.append("search", search.trim());

    const res = await fetch(`${API_BASE_URL}/admin/payment-methods?${params.toString()}`, {
      headers: defaultHeaders()
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("fetchAdminPaymentMethodsApi error:", err);
    return { success: false, summary: { total: 0, cards: 0, upi: 0, bank: 0, paypal: 0 }, data: [] };
  }
}

export async function deleteAdminPaymentMethodApi(methodId) {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/payment-methods/${methodId}`, {
      method: "DELETE",
      headers: defaultHeaders()
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("deleteAdminPaymentMethodApi error:", err);
    return { success: false, message: err.message };
  }
}

export async function saveUserPaymentMethodApi(payload) {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/payment-methods/add-user-method`, {
      method: "POST",
      headers: defaultHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("saveUserPaymentMethodApi error:", err);
    return { success: false, message: err.message };
  }
}

/**
 * 19. Chat & Messages Moderation API (Privacy Compliant)
 */
export async function fetchAdminReportedChatsApi(status = "all") {
  try {
    const params = new URLSearchParams();
    if (status && status !== "all") params.append("status", status);
    const res = await fetch(`${API_BASE_URL}/admin/chats/reported?${params.toString()}`, {
      headers: defaultHeaders()
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("fetchAdminReportedChatsApi error:", err);
    return { success: false, data: [], pending_count: 0 };
  }
}

export async function actionAdminReportedChatApi(reportId, action, note = "", adminName = "Super Admin") {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/chats/reported/${reportId}/action`, {
      method: "POST",
      headers: defaultHeaders(),
      body: JSON.stringify({ action, note, admin_name: adminName })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("actionAdminReportedChatApi error:", err);
    return { success: false, message: err.message };
  }
}

/**
 * 20. Platform Announcements & Scheduled Notifications API
 */
export async function fetchAdminAnnouncementsApi() {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/announcements`, {
      headers: defaultHeaders()
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("fetchAdminAnnouncementsApi error:", err);
    return { success: false, data: [] };
  }
}

export async function createAdminAnnouncementApi(payload) {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/announcements`, {
      method: "POST",
      headers: defaultHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("createAdminAnnouncementApi error:", err);
    return { success: false, message: err.message };
  }
}

export async function deleteAdminAnnouncementApi(announcementId) {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/announcements/${announcementId}`, {
      method: "DELETE",
      headers: defaultHeaders()
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("deleteAdminAnnouncementApi error:", err);
    return { success: false, message: err.message };
  }
}

/**
 * 21. Ads & Sponsored Campaigns API
 */
export async function fetchAdminAdsApi(status = "all", search = "") {
  try {
    const params = new URLSearchParams();
    if (status && status !== "all") params.append("status", status);
    if (search && search.trim()) params.append("search", search.trim());
    const res = await fetch(`${API_BASE_URL}/admin/ads?${params.toString()}`, {
      headers: defaultHeaders()
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("fetchAdminAdsApi error:", err);
    return { success: false, summary: {}, data: [] };
  }
}

export async function createAdminAdCampaignApi(payload) {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/ads`, {
      method: "POST",
      headers: defaultHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("createAdminAdCampaignApi error:", err);
    return { success: false, message: err.message };
  }
}

export async function updateAdminAdStatusApi(adId, action) {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/ads/${adId}/status`, {
      method: "POST",
      headers: defaultHeaders(),
      body: JSON.stringify({ action })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("updateAdminAdStatusApi error:", err);
    return { success: false, message: err.message };
  }
}

export async function deleteAdminAdCampaignApi(adId) {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/ads/${adId}`, {
      method: "DELETE",
      headers: defaultHeaders()
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("deleteAdminAdCampaignApi error:", err);
    return { success: false, message: err.message };
  }
}

/**
 * 22. Deep Analytics & CSV Exports API
 */
export async function fetchAdminDeepAnalyticsApi() {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/analytics/deep`, {
      headers: defaultHeaders()
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("fetchAdminDeepAnalyticsApi error:", err);
    return { success: false };
  }
}

export function getAdminExportCsvUrl(entityType) {
  return `${API_BASE_URL}/admin/analytics/export/${entityType}`;
}

/**
 * 23. RBAC Admin Roles & Team Members API
 */
export async function fetchAdminTeamMembersApi() {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/roles/team`, {
      headers: defaultHeaders()
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("fetchAdminTeamMembersApi error:", err);
    return { success: false, data: [] };
  }
}

export async function createAdminTeamMemberApi(payload) {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/roles/team`, {
      method: "POST",
      headers: defaultHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("createAdminTeamMemberApi error:", err);
    return { success: false, message: err.message };
  }
}

export async function updateAdminTeamMemberApi(memberId, payload) {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/roles/team/${memberId}`, {
      method: "PUT",
      headers: defaultHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("updateAdminTeamMemberApi error:", err);
    return { success: false, message: err.message };
  }
}

export async function deleteAdminTeamMemberApi(memberId) {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/roles/team/${memberId}`, {
      method: "DELETE",
      headers: defaultHeaders()
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("deleteAdminTeamMemberApi error:", err);
    return { success: false, message: err.message };
  }
}

/**
 * 24. Dynamic Legal Documents & FAQ API
 */
export async function fetchAdminLegalDocumentsApi() {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/legal/documents`, {
      headers: defaultHeaders()
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("fetchAdminLegalDocumentsApi error:", err);
    return { success: false, data: [] };
  }
}

export async function updateAdminLegalDocumentApi(slug, payload) {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/legal/documents/${slug}`, {
      method: "POST",
      headers: defaultHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("updateAdminLegalDocumentApi error:", err);
    return { success: false, message: err.message };
  }
}

/**
 * 25. Security & Logs API (Audit Trail, Login Logs, Suspicious Bots, IP Blocking)
 */
export async function fetchAdminAuditLogsApi(filterType = "all", search = "", limit = 50) {
  try {
    const params = new URLSearchParams();
    if (filterType && filterType !== "all") params.append("filter_type", filterType);
    if (search && search.trim()) params.append("search", search.trim());
    params.append("limit", limit);

    const res = await fetch(`${API_BASE_URL}/admin/security/audit-logs?${params.toString()}`, {
      headers: defaultHeaders()
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("fetchAdminAuditLogsApi error:", err);
    return { success: false, data: [] };
  }
}

export async function fetchAdminLoginHistoryApi() {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/security/login-history`, {
      headers: defaultHeaders()
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("fetchAdminLoginHistoryApi error:", err);
    return { success: false, data: [] };
  }
}

export async function fetchAdminSuspiciousActivityApi() {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/security/suspicious`, {
      headers: defaultHeaders()
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("fetchAdminSuspiciousActivityApi error:", err);
    return { success: false, data: [] };
  }
}

export async function fetchAdminBlockedIpsApi() {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/security/blocked-ips`, {
      headers: defaultHeaders()
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("fetchAdminBlockedIpsApi error:", err);
    return { success: false, data: [] };
  }
}

export async function blockAdminIpApi(payload) {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/security/blocked-ips`, {
      method: "POST",
      headers: defaultHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("blockAdminIpApi error:", err);
    return { success: false, message: err.message };
  }
}

export async function unblockAdminIpApi(ipId) {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/security/blocked-ips/${ipId}`, {
      method: "DELETE",
      headers: defaultHeaders()
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("unblockAdminIpApi error:", err);
    return { success: false, message: err.message };
  }
}

/**
 * 23. Real-Time Platform Visitor Counter & Analytics
 */
export async function fetchAdminVisitorAnalyticsApi() {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/dashboard/visitors`, {
      headers: defaultHeaders()
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("fetchAdminVisitorAnalyticsApi error:", err);
    return { success: false, counters: null };
  }
}

export async function trackPlatformVisitApi(pagePath = "/", userId = null) {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/track-visit`, {
      method: "POST",
      headers: defaultHeaders(),
      body: JSON.stringify({ page_path: pagePath, user_id: userId })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    return { success: false };
  }
}

/**
 * 24. User Geolocation History & Deep Telemetry
 */
export async function fetchAdminUserGeoLoginsApi(search = "", filterStatus = "all", limit = 100) {
  try {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (filterStatus && filterStatus !== "all") params.append("filter_status", filterStatus);
    params.append("limit", limit);

    const res = await fetch(`${API_BASE_URL}/admin/users/login-geolocations?${params.toString()}`, {
      headers: defaultHeaders()
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("fetchAdminUserGeoLoginsApi error:", err);
    return { success: false, data: [] };
  }
}

export async function fetchAdminUserTelemetryApi(userId) {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/users/${userId}/telemetry`, {
      headers: defaultHeaders()
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("fetchAdminUserTelemetryApi error:", err);
    return { success: false, telemetry: null };
  }
}








