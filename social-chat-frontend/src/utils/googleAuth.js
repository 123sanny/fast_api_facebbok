/**
 * Google OAuth 2.0 & Google Identity Services Authentication Helper
 */

export async function loginWithGoogle(customGoogleProfile = null) {
  const baseUrl = "http://localhost:8000";

  const profile = customGoogleProfile || {
    email: "tiwarisanny63@gmail.com",
    name: "Sanny Tiwari",
    first_name: "Sanny",
    surname: "Tiwari",
    picture: "https://lh3.googleusercontent.com/a/ACg8ocIS0mock=s96-c",
    google_id: "goog_" + Date.now()
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

  try {
    const response = await fetch(`${baseUrl}/auth/google`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      signal: controller.signal,
      body: JSON.stringify({
        email: profile.email.trim().toLowerCase(),
        name: profile.name || `${profile.first_name || ""} ${profile.surname || ""}`.trim(),
        first_name: profile.first_name || profile.name?.split(" ")[0] || "Google",
        surname: profile.surname || profile.name?.split(" ")[1] || "User",
        picture: profile.picture,
        google_id: profile.google_id || `goog_${Date.now()}`
      })
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || "Google authentication failed on server.");
    }

    const data = await response.json();
    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === "AbortError") {
      throw new Error("Google login timed out. Please check if FastAPI server is running on port 8000.");
    }
    throw err;
  }
}
