/**
 * Nexoria Ironclad Security & Password Management API Client
 * Connects frontend Settings and Security Shield to FastAPI backend.
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
 * 1. Change Password Dynamically
 */
export const changePasswordApi = async ({ userId, currentPassword, newPassword, logoutOtherDevices = false }) => {
  try {
    const res = await fetch(`${API_BASE_URL}/security/change-password`, {
      method: "POST",
      headers: getAuthHeaders(userId),
      body: JSON.stringify({
        user_id: Number(userId) || undefined,
        current_password: currentPassword,
        new_password: newPassword,
        logout_other_devices: Boolean(logoutOtherDevices)
      })
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, message: data.detail || "Failed to change password." };
    }
    return { success: true, message: data.message || "Password changed successfully." };
  } catch (err) {
    console.error("changePasswordApi error:", err);
    return { success: false, message: "Network connection error. Please try again." };
  }
};

/**
 * 2. Fetch Security Settings
 */
export const fetchSecuritySettingsApi = async (userId) => {
  try {
    const uid = userId || localStorage.getItem("user_id") || 1;
    const res = await fetch(`${API_BASE_URL}/security/settings?user_id=${uid}`, {
      method: "GET",
      headers: getAuthHeaders(uid)
    });
    if (!res.ok) throw new Error("Failed to fetch security settings");
    return await res.json();
  } catch (err) {
    console.warn("fetchSecuritySettingsApi error:", err);
    return null;
  }
};

/**
 * 3. Update Security Settings
 */
export const updateSecuritySettingsApi = async (userId, settingsData) => {
  try {
    const uid = userId || localStorage.getItem("user_id") || 1;
    const res = await fetch(`${API_BASE_URL}/security/settings?user_id=${uid}`, {
      method: "PUT",
      headers: getAuthHeaders(uid),
      body: JSON.stringify(settingsData)
    });
    if (!res.ok) throw new Error("Failed to update security settings");
    return await res.json();
  } catch (err) {
    console.error("updateSecuritySettingsApi error:", err);
    return null;
  }
};

/**
 * 4. Active Sessions Management
 */
export const fetchActiveSessionsApi = async (userId) => {
  try {
    const uid = userId || localStorage.getItem("user_id") || 1;
    const res = await fetch(`${API_BASE_URL}/security/sessions?user_id=${uid}`, {
      method: "GET",
      headers: getAuthHeaders(uid)
    });
    if (!res.ok) throw new Error("Failed to fetch sessions");
    return await res.json();
  } catch (err) {
    console.warn("fetchActiveSessionsApi error:", err);
    return [];
  }
};

export const revokeSessionApi = async (userId, sessionId) => {
  try {
    const uid = userId || localStorage.getItem("user_id") || 1;
    const res = await fetch(`${API_BASE_URL}/security/sessions/${sessionId}?user_id=${uid}`, {
      method: "DELETE",
      headers: getAuthHeaders(uid)
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("revokeSessionApi error:", err);
    return { success: false, message: "Could not revoke session" };
  }
};

export const nuclearLogoutAllSessionsApi = async (userId) => {
  try {
    const uid = userId || localStorage.getItem("user_id") || 1;
    const res = await fetch(`${API_BASE_URL}/security/sessions/nuclear/logout-all?user_id=${uid}`, {
      method: "DELETE",
      headers: getAuthHeaders(uid)
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("nuclearLogoutAllSessionsApi error:", err);
    return { success: false, message: "Nuclear logout failed" };
  }
};

/**
 * 5. FIDO2 / Biometric Passkeys
 */
export const fetchPasskeysApi = async (userId) => {
  try {
    const uid = userId || localStorage.getItem("user_id") || 1;
    const res = await fetch(`${API_BASE_URL}/security/passkeys?user_id=${uid}`, {
      method: "GET",
      headers: getAuthHeaders(uid)
    });
    if (!res.ok) throw new Error("Failed to fetch passkeys");
    return await res.json();
  } catch (err) {
    console.warn("fetchPasskeysApi error:", err);
    return [];
  }
};

export const registerPasskeyApi = async (userId, passkeyData) => {
  try {
    const uid = userId || localStorage.getItem("user_id") || 1;
    const res = await fetch(`${API_BASE_URL}/security/passkeys/register?user_id=${uid}`, {
      method: "POST",
      headers: getAuthHeaders(uid),
      body: JSON.stringify(passkeyData)
    });
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.detail || "Registration failed");
    }
    return await res.json();
  } catch (err) {
    console.error("registerPasskeyApi error:", err);
    throw err;
  }
};

export const deletePasskeyApi = async (userId, passkeyId) => {
  try {
    const uid = userId || localStorage.getItem("user_id") || 1;
    const res = await fetch(`${API_BASE_URL}/security/passkeys/${passkeyId}?user_id=${uid}`, {
      method: "DELETE",
      headers: getAuthHeaders(uid)
    });
    return await res.json();
  } catch (err) {
    console.error("deletePasskeyApi error:", err);
    return { success: false };
  }
};

/**
 * 6. Two-Factor Authentication (TOTP)
 */
export const fetchTotpSetupApi = async (userId) => {
  try {
    const uid = userId || localStorage.getItem("user_id") || 1;
    const res = await fetch(`${API_BASE_URL}/security/totp/setup?user_id=${uid}`, {
      method: "GET",
      headers: getAuthHeaders(uid)
    });
    if (!res.ok) throw new Error("Failed to setup TOTP");
    return await res.json();
  } catch (err) {
    console.error("fetchTotpSetupApi error:", err);
    return null;
  }
};

export const verifyTotpApi = async (userId, code) => {
  try {
    const uid = userId || localStorage.getItem("user_id") || 1;
    const res = await fetch(`${API_BASE_URL}/security/totp/verify?user_id=${uid}`, {
      method: "POST",
      headers: getAuthHeaders(uid),
      body: JSON.stringify({ code })
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, message: data.detail || "Invalid code" };
    }
    return { success: true, message: data.message };
  } catch (err) {
    console.error("verifyTotpApi error:", err);
    return { success: false, message: "Verification failed" };
  }
};

/**
 * 7. 10 Cold-Storage Backup Codes
 */
export const fetchBackupCodesApi = async (userId) => {
  try {
    const uid = userId || localStorage.getItem("user_id") || 1;
    const res = await fetch(`${API_BASE_URL}/security/backup-codes?user_id=${uid}`, {
      method: "GET",
      headers: getAuthHeaders(uid)
    });
    if (!res.ok) throw new Error("Failed to fetch backup codes");
    return await res.json();
  } catch (err) {
    console.warn("fetchBackupCodesApi error:", err);
    return { codes: [] };
  }
};

export const generateBackupCodesApi = async (userId) => {
  try {
    const uid = userId || localStorage.getItem("user_id") || 1;
    const res = await fetch(`${API_BASE_URL}/security/backup-codes/generate?user_id=${uid}`, {
      method: "POST",
      headers: getAuthHeaders(uid)
    });
    if (!res.ok) throw new Error("Failed to generate backup codes");
    return await res.json();
  } catch (err) {
    console.error("generateBackupCodesApi error:", err);
    return null;
  }
};

/**
 * 8. Trusted Recovery Guardians
 */
export const fetchGuardiansApi = async (userId) => {
  try {
    const uid = userId || localStorage.getItem("user_id") || 1;
    const res = await fetch(`${API_BASE_URL}/security/guardians?user_id=${uid}`, {
      method: "GET",
      headers: getAuthHeaders(uid)
    });
    if (!res.ok) throw new Error("Failed to fetch guardians");
    return await res.json();
  } catch (err) {
    console.warn("fetchGuardiansApi error:", err);
    return [];
  }
};

export const addGuardianApi = async (userId, guardianData) => {
  try {
    const uid = userId || localStorage.getItem("user_id") || 1;
    const res = await fetch(`${API_BASE_URL}/security/guardians?user_id=${uid}`, {
      method: "POST",
      headers: getAuthHeaders(uid),
      body: JSON.stringify(guardianData)
    });
    if (!res.ok) throw new Error("Failed to add guardian");
    return await res.json();
  } catch (err) {
    console.error("addGuardianApi error:", err);
    return null;
  }
};

export const deleteGuardianApi = async (userId, guardianId) => {
  try {
    const uid = userId || localStorage.getItem("user_id") || 1;
    const res = await fetch(`${API_BASE_URL}/security/guardians/${guardianId}?user_id=${uid}`, {
      method: "DELETE",
      headers: getAuthHeaders(uid)
    });
    return await res.json();
  } catch (err) {
    console.error("deleteGuardianApi error:", err);
    return { success: false };
  }
};

/**
 * 9. Live Security Audit Logs & Telemetry
 */
export const fetchAuditLogsApi = async (userId, limit = 20) => {
  try {
    const uid = userId || localStorage.getItem("user_id") || 1;
    const res = await fetch(`${API_BASE_URL}/security/audit-logs?user_id=${uid}&limit=${limit}`, {
      method: "GET",
      headers: getAuthHeaders(uid)
    });
    if (!res.ok) throw new Error("Failed to fetch audit logs");
    return await res.json();
  } catch (err) {
    console.warn("fetchAuditLogsApi error:", err);
    return [];
  }
};
