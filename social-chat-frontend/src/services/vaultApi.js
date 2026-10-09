/**
 * 🌟 Creator Star Vault & Withdrawals API Client
 */
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

function defaultHeaders() {
  const token = localStorage.getItem("access_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

/**
 * 1. Fetch Creator Star Vault Overview & Balance
 */
export async function fetchCreatorVaultApi(userId) {
  try {
    const res = await fetch(`${API_BASE_URL}/wallet/creator-vault/${userId}`, {
      headers: defaultHeaders()
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("fetchCreatorVaultApi error:", err);
    return {
      success: false,
      total_stars: 19050,
      usd_value: "190.50",
      inr_value: "9525.00",
      wallet_address: `0x7F2...${userId || '0001'}_NexoriaVault`,
      achievements: [],
      recent_tips: [],
      payouts_history: []
    };
  }
}

/**
 * 2. Simulate +200 (or custom) Creator Star Tip
 */
export async function simulateCreatorTipApi(userId, starsAmount = 200, senderName = "Nexoria Fan Supporter", note = "Loved your work! Keep shining ⭐") {
  try {
    const res = await fetch(`${API_BASE_URL}/wallet/creator-vault/simulate-tip`, {
      method: "POST",
      headers: defaultHeaders(),
      body: JSON.stringify({
        user_id: userId,
        stars_amount: starsAmount,
        sender_name: senderName,
        note: note
      })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("simulateCreatorTipApi error:", err);
    return { success: false, message: err.message };
  }
}

/**
 * 3. Request Payout / Cashout Withdrawal to UPI or Bank
 */
export async function requestCreatorPayoutApi(payload) {
  try {
    const res = await fetch(`${API_BASE_URL}/wallet/creator-vault/withdraw`, {
      method: "POST",
      headers: defaultHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.detail || errJson.message || `HTTP ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.error("requestCreatorPayoutApi error:", err);
    return { success: false, message: err.message };
  }
}

/**
 * 4. Purchase / Recharge Creator Stars
 */
export async function purchaseStarsApi(payload) {
  try {
    const res = await fetch(`${API_BASE_URL}/wallet/creator-vault/purchase-stars`, {
      method: "POST",
      headers: defaultHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.detail || errJson.message || `HTTP ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.error("purchaseStarsApi error:", err);
    return { success: false, message: err.message };
  }
}
