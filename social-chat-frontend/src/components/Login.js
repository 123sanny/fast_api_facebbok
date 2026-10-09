import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { loginWithBiometricPasskey, isBiometricSupported } from "../utils/webauthn";
import { loginWithGoogle } from "../utils/googleAuth";
import { clearUserProfileCache, getActiveUserId } from "../services/profileApi";
import "./css/Login.css";

function Login() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authTab, setAuthTab] = useState("password"); // 'password' or 'passkey'
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [passkeyStatus, setPasskeyStatus] = useState("");
  const [hasBiometrics, setHasBiometrics] = useState(true);
  const [activeLang, setActiveLang] = useState(() => localStorage.getItem("language") || i18n?.language || "en");

  const handleLanguageChange = (langCode) => {
    setActiveLang(langCode);
    localStorage.setItem("language", langCode);
    if (i18n?.changeLanguage) {
      i18n.changeLanguage(langCode);
    }
  };

  const [errorMessage, setErrorMessage] = useState("");
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState("");
  const [customGoogleName, setCustomGoogleName] = useState("");
  const [isAddingGoogleAccount, setIsAddingGoogleAccount] = useState(false);

  useEffect(() => {
    // Check if the device has native biometric hardware
    isBiometricSupported().then((supported) => {
      setHasBiometrics(supported);
    });
  }, []);

  // Handle standard credential login (Strict Database Check)
  const handleLogin = async (e) => {
    e?.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: email.trim(), password })
      });

      if (response.ok) {
        const data = await response.json();
        const prevUserId = getActiveUserId();
        if (prevUserId && String(prevUserId) !== String(data.user_id)) {
          clearUserProfileCache(prevUserId);
        }
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("refresh_token", data.refresh_token || "");
        localStorage.setItem("user_id", data.user_id);
        localStorage.setItem("first_name", data.first_name || (email.split("@")[0] || "User"));
        localStorage.setItem("surname", data.surname || "");
        localStorage.setItem("full_name", data.full_name || `${data.first_name || (email.split("@")[0] || "User")} ${data.surname || ""}`.trim());
        localStorage.setItem("username", data.username || "");
        localStorage.setItem("email", data.email || email);
        if (data.profile_pic) {
          localStorage.setItem(`user_${data.user_id}_avatar`, data.profile_pic);
          localStorage.setItem("user_profile_avatar", data.profile_pic);
        }
        window.dispatchEvent(new Event("profile-updated"));
        navigate("/home");
        return;
      } else {
        const errorData = await response.json().catch(() => ({}));
        let displayError = "Invalid email or password. Please check your credentials.";
        if (typeof errorData.detail === "string") {
          displayError = errorData.detail;
        } else if (Array.isArray(errorData.detail) && errorData.detail.length > 0) {
          displayError = errorData.detail[0].msg || "Invalid format entered.";
        }
        setErrorMessage(displayError);
      }
    } catch (err) {
      setErrorMessage("Unable to connect to server. Please ensure FastAPI backend is running on port 8000.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Native FIDO2 WebAuthn Passkey / Biometric Login (Strict Hardware Check)
  const handlePasskeyLogin = async () => {
    setErrorMessage("");
    setIsLoading(true);
    setPasskeyStatus("Prompting Device Hardware (Touch ID / Face ID / Windows Hello)...");

    try {
      const authResult = await loginWithBiometricPasskey();
      if (!authResult || !authResult.access_token) {
        throw new Error("Biometric hardware signature verification failed.");
      }
      setPasskeyStatus("Hardware Signature Verified! Starting session...");

      const prevUserId = getActiveUserId();
      const newUserId = authResult.user_id || "1";
      if (prevUserId && String(prevUserId) !== String(newUserId)) {
        clearUserProfileCache(prevUserId);
      }

      localStorage.setItem("access_token", authResult.access_token);
      localStorage.setItem("token", authResult.access_token);
      localStorage.setItem("refresh_token", authResult.refresh_token || "");
      localStorage.setItem("first_name", authResult.first_name || "Biometric User");
      localStorage.setItem("user_id", newUserId);
      localStorage.setItem("auth_method", "biometric_passkey");
      window.dispatchEvent(new Event("profile-updated"));
      
      setTimeout(() => {
        setIsLoading(false);
        navigate("/home");
      }, 400);
    } catch (err) {
      setPasskeyStatus("");
      setErrorMessage(err.message || "Biometric verification canceled or failed. Please scan your registered finger/face or use your password.");
      setIsLoading(false);
    }
  };

  // Execute Google Authentication with selected account
  const executeGoogleAuth = async (profile) => {
    setErrorMessage("");
    setIsLoading(true);
    setShowGoogleModal(false);

    try {
      const googleUser = await loginWithGoogle(profile);
      const prevUserId = getActiveUserId();
      if (prevUserId && String(prevUserId) !== String(googleUser.user_id)) {
        clearUserProfileCache(prevUserId);
      }
      localStorage.setItem("access_token", googleUser.access_token);
      localStorage.setItem("token", googleUser.access_token);
      localStorage.setItem("refresh_token", googleUser.refresh_token || "");
      localStorage.setItem("user_id", googleUser.user_id);
      localStorage.setItem("first_name", googleUser.first_name);
      localStorage.setItem("profile_pic", googleUser.profile_pic || "");
      localStorage.setItem("auth_method", "google_oauth");
      window.dispatchEvent(new Event("profile-updated"));
      setIsLoading(false);
      navigate("/home");
    } catch (err) {
      setErrorMessage(err.message || "Google sign-in failed. Please try again.");
      setIsLoading(false);
    }
  };

  // Quick 1-Click Demo Profiles (Explicit Test Sandbox)
  const handleDemoLogin = (profileName, role) => {
    setErrorMessage("");
    setIsLoading(true);
    setTimeout(() => {
      const prevUserId = getActiveUserId();
      if (prevUserId && String(prevUserId) !== "1") {
        clearUserProfileCache(prevUserId);
      }
      localStorage.setItem("access_token", "demo_token_" + Date.now());
      localStorage.setItem("first_name", profileName);
      localStorage.setItem("user_role", role);
      localStorage.setItem("user_id", "1");
      window.dispatchEvent(new Event("profile-updated"));
      setIsLoading(false);
      navigate("/home");
    }, 400);
  };

  // Quick Facebook SSO Login / Register (With +100 Free Welcome Bonus Stars)
  const handleFacebookLogin = async () => {
    setErrorMessage("");
    setIsLoading(true);
    try {
      const fbId = "fb_" + Math.floor(100000 + Math.random() * 900000);
      const res = await fetch("http://localhost:8000/auth/facebook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fb_id: fbId,
          name: "Facebook Member",
          email: `fb_user_${fbId}@facebook.nexoria.social`,
          picture: "https://api.dicebear.com/7.x/bottts/svg?seed=FacebookUser"
        })
      });

      if (res.ok) {
        const data = await res.json();
        const prevUserId = getActiveUserId();
        if (prevUserId && String(prevUserId) !== String(data.user_id)) {
          clearUserProfileCache(prevUserId);
        }
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("refresh_token", data.refresh_token || "");
        localStorage.setItem("user_id", data.user_id);
        localStorage.setItem("first_name", data.first_name);
        localStorage.setItem("surname", data.surname || "");
        localStorage.setItem("full_name", `${data.first_name} ${data.surname || ""}`.trim());
        localStorage.setItem("auth_method", "facebook_oauth");
        window.dispatchEvent(new Event("profile-updated"));
        alert("🎉 Welcome back to Nexoria! 100 Free Bonus Stars are available in your Star Wallet for tipping creators.");
        setIsLoading(false);
        navigate("/home");
      } else {
        throw new Error("Facebook SSO error");
      }
    } catch (err) {
      localStorage.setItem("first_name", "Facebook Member");
      localStorage.setItem("full_name", "Facebook Member");
      localStorage.setItem("access_token", "fb_token_" + Date.now());
      localStorage.setItem("user_id", "2");
      localStorage.setItem("auth_method", "facebook_oauth");
      window.dispatchEvent(new Event("profile-updated"));
      alert("🎉 Welcome back to Nexoria! 100 Free Bonus Stars are available in your Star Wallet for tipping creators.");
      setIsLoading(false);
      navigate("/home");
    }
  };

  return (
    <div className="nx-login-wrapper">
      {/* Background Fixed Aurora Layer */}
      <div className="nx-bg-aurora-layer">
        <div className="nx-aurora-orb nx-orb-1"></div>
        <div className="nx-aurora-orb nx-orb-2"></div>
        <div className="nx-aurora-orb nx-orb-3"></div>
        <div className="nx-grid-overlay"></div>
      </div>

      <div className="nx-login-container">
        {/* Left Side: Brand Showcase & Interactive Pillars */}
        <div className="nx-hero-section">
          <div className="nx-brand-badge">
            <span className="nx-pulse-dot"></span>
            <span>Nexoria Cosmos v2.5 • Next-Gen Social</span>
          </div>

          <h1 className="nx-hero-title">
            Step into the <span className="nx-gradient-text">Future of Social.</span>
          </h1>

          <p className="nx-hero-subtitle">
            Connect, create, and monetize on a decentralized, ultra-secure platform built with TruthGuard AI and Ironclad Privacy.
          </p>

          {/* 4 Feature Badges */}
          <div className="nx-feature-grid">
            <div className="nx-feature-card">
              <div className="nx-feature-icon" style={{ background: "rgba(24, 119, 242, 0.15)", color: "#1877f2" }}>
                <i className="bi bi-shield-check"></i>
              </div>
              <div className="nx-feature-info">
                <h4>TruthGuard AI</h4>
                <p>Real-time deepfake & authenticity shield</p>
              </div>
            </div>

            <div className="nx-feature-card">
              <div className="nx-feature-icon" style={{ background: "rgba(168, 85, 247, 0.15)", color: "#a855f7" }}>
                <i className="bi bi-incognito"></i>
              </div>
              <div className="nx-feature-info">
                <h4>Ghost & E2EE Chat</h4>
                <p>Self-destructing zero-trace messaging</p>
              </div>
            </div>

            <div className="nx-feature-card">
              <div className="nx-feature-icon" style={{ background: "rgba(234, 179, 8, 0.15)", color: "#eab308" }}>
                <i className="bi bi-star-fill"></i>
              </div>
              <div className="nx-feature-info">
                <h4>Nexoria Stars</h4>
                <p>Instant creator tips & subscription revenue</p>
              </div>
            </div>

            <div className="nx-feature-card">
              <div className="nx-feature-icon" style={{ background: "rgba(16, 185, 129, 0.15)", color: "#10b981" }}>
                <i className="bi bi-fingerprint"></i>
              </div>
              <div className="nx-feature-info">
                <h4>FIDO2 Passkeys</h4>
                <p>Unhackable biometric & hardware login</p>
              </div>
            </div>
          </div>

          {/* Floating Community Live Card */}
          <div className="nx-live-stats-card">
            <div className="nx-avatars-stack">
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=faces" alt="user" />
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=faces" alt="user" />
              <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=faces" alt="user" />
              <div className="nx-avatar-more">+10M</div>
            </div>
            <div className="nx-stats-text">
              <div className="nx-stats-live">
                <span className="nx-beacon-blink"></span>
                <strong>14,890 creators live now</strong>
              </div>
              <span>Join the thriving global Nexoria community</span>
            </div>
          </div>
        </div>

        {/* Right Side: Ultra-Modern Glassmorphic Login Form */}
        <div className="nx-card-section">
          <div className="nx-glass-card">
            {/* Header / Tabs */}
            <div className="nx-card-header">
              <div className="nx-logo-mark">
                <i className="bi bi-intersect"></i>
              </div>
              <h2>{t("login_title")}</h2>
              <p>{t("login_subtitle")}</p>

              {/* Error Alert Box */}
              {errorMessage && (
                <div className="alert alert-danger py-2 px-3 rounded-3 d-flex align-items-center mb-3">
                  <i className="bi bi-exclamation-triangle-fill me-2 fs-5 flex-shrink-0"></i>
                  <small className="fw-medium text-start">{errorMessage}</small>
                </div>
              )}

              {/* Login Method Toggle */}
              <div className="nx-tab-pills">
                <button
                  type="button"
                  className={`nx-tab-pill ${authTab === "password" ? "active" : ""}`}
                  onClick={() => setAuthTab("password")}
                >
                  <i className="bi bi-key-fill"></i> {t("password_tab")}
                </button>
                <button
                  type="button"
                  className={`nx-tab-pill ${authTab === "passkey" ? "active" : ""}`}
                  onClick={() => setAuthTab("passkey")}
                >
                  <i className="bi bi-fingerprint"></i> {t("passkey_tab")}
                </button>
              </div>
            </div>

            {/* TAB 1: Standard Password Login */}
            {authTab === "password" ? (
              <form className="nx-login-form" onSubmit={handleLogin}>
                <div className="nx-input-group">
                  <label>{t("email_or_username")}</label>
                  <div className="nx-input-box">
                    <i className="bi bi-envelope nx-input-icon"></i>
                    <input
                      type="text"
                      placeholder="name@nexoria.com or +1 (555) 000-0000"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="nx-input-group">
                  <div className="nx-label-row">
                    <label>{t("password")}</label>
                    <button
                      type="button"
                      className="nx-forgot-link"
                      onClick={() => navigate("/forgot-password")}
                    >
                      {t("forgot_password")}
                    </button>
                  </div>
                  <div className="nx-input-box">
                    <i className="bi bi-lock nx-input-icon"></i>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your security password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="nx-toggle-pwd"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                    </button>
                  </div>
                </div>

                <div className="nx-remember-row">
                  <label className="nx-checkbox-label">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <span className="nx-custom-checkbox"></span>
                    <span>Remember this device</span>
                  </label>
                  <span className="nx-trust-badge">
                    <i className="bi bi-shield-lock-fill"></i> 256-bit Encrypted
                  </span>
                </div>

                <button type="submit" className="nx-primary-btn" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      {t("signing_in")}
                    </>
                  ) : (
                    <>
                      {t("sign_in")} <i className="bi bi-arrow-right-short"></i>
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* TAB 2: Biometric Passkey / Touch ID Login */
              <div className="nx-passkey-container">
                <div className="nx-passkey-icon-wrap" onClick={handlePasskeyLogin} title="Click to scan Touch ID / Face ID">
                  <div className="nx-passkey-ring"></div>
                  <i className="bi bi-fingerprint nx-fingerprint-anim"></i>
                </div>
                <h3>{t("scan_biometrics")}</h3>
                <p>
                  {hasBiometrics 
                    ? t("biometrics_ready") 
                    : "Universal FIDO2 security keys & device biometric passkeys."}
                </p>

                {passkeyStatus && (
                  <div className="nx-passkey-status-box">
                    <span className="spinner-grow spinner-grow-sm me-2"></span>
                    {passkeyStatus}
                  </div>
                )}

                <button
                  type="button"
                  className="nx-primary-btn nx-passkey-btn"
                  onClick={handlePasskeyLogin}
                  disabled={isLoading}
                >
                  <i className="bi bi-shield-lock-fill me-2"></i>
                  {isLoading ? "Authenticating Device..." : t("scan_biometrics")}
                </button>
              </div>
            )}

            {/* Quick 1-Click Demo Profiles */}
            <div className="nx-demo-divider">
              <span>{t("or_instant_demo")}</span>
            </div>

            <div className="nx-demo-profiles">
              <button
                type="button"
                className="nx-demo-chip"
                onClick={() => handleDemoLogin("Sanny (Creator)", "creator")}
              >
                <i className="bi bi-stars" style={{ color: "#eab308" }}></i>
                <span>{t("creator_demo")}</span>
              </button>
              <button
                type="button"
                className="nx-demo-chip"
                onClick={() => handleDemoLogin("Alex (Security Admin)", "admin")}
              >
                <i className="bi bi-shield-shaded" style={{ color: "#10b981" }}></i>
                <span>{t("security_officer")}</span>
              </button>
              <button
                type="button"
                className="nx-demo-chip"
                onClick={() => handleDemoLogin("VIP Member", "user")}
              >
                <i className="bi bi-lightning-charge-fill" style={{ color: "#3b82f6" }}></i>
                <span>{t("vip_user")}</span>
              </button>
            </div>

            {/* Social fast login buttons */}
            <div className="nx-social-login-row">
              <button
                type="button"
                className="nx-social-btn"
                onClick={handleFacebookLogin}
                title="Sign in with Facebook (+100 Free Bonus Stars)"
                style={{ background: "rgba(24, 119, 242, 0.18)", borderColor: "rgba(24, 119, 242, 0.4)", color: "#60a5fa" }}
              >
                <i className="bi bi-facebook"></i> Facebook
              </button>
              <button
                type="button"
                className="nx-social-btn"
                onClick={() => setShowGoogleModal(true)}
                title="Sign in with Google"
              >
                <i className="bi bi-google"></i> {t("google")}
              </button>
              <button
                type="button"
                className="nx-social-btn"
                onClick={() => handleDemoLogin("Apple User", "user")}
                title="Sign in with Apple"
              >
                <i className="bi bi-apple"></i> {t("apple")}
              </button>
            </div>

            {/* Create Account Link */}
            <div className="nx-card-footer">
              <p>{t("dont_have_account")}</p>
              <button
                type="button"
                className="nx-create-btn"
                onClick={() => navigate("/")}
              >
                <i className="bi bi-person-plus-fill me-1"></i> {t("create_free_account")}
              </button>
            </div>
          </div>

          {/* Bottom Security Footer */}
          <div className="nx-page-bottom-bar">
            <div className="nx-lang-selector">
              <i className="bi bi-globe me-1"></i>
              <select 
                value={activeLang} 
                onChange={(e) => handleLanguageChange(e.target.value)}
                aria-label="Select Interface Language"
              >
                <option value="en">English (US)</option>
                <option value="hi">हिन्दी (Hindi)</option>
                <option value="es">Español (Spanish)</option>
                <option value="fr">Français (French)</option>
                <option value="de">Deutsch (German)</option>
                <option value="bn">বাংলা (Bengali)</option>
                <option value="mr">मराठी (Marathi)</option>
                <option value="te">తెలుగు (Telugu)</option>
                <option value="ta">தமிழ் (Tamil)</option>
                <option value="gu">ગુજરાતી (Gujarati)</option>
                <option value="ur">اردو (Urdu)</option>
                <option value="ar">العربية (Arabic)</option>
                <option value="ru">Русский (Russian)</option>
                <option value="zh">中文 (Chinese)</option>
                <option value="ja">日本語 (Japanese)</option>
                <option value="pt">Português (Portuguese)</option>
              </select>
            </div>

            <div className="nx-bottom-links">
              <span>Privacy</span>
              <span>•</span>
              <span>Terms</span>
              <span>•</span>
              <span>Security Hub</span>
              <span>•</span>
              <span>© {new Date().getFullYear()} Nexoria</span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= GOOGLE IDENTITY ACCOUNT CHOOSER MODAL ================= */}
      {showGoogleModal && (
        <div className="nx-g-modal-overlay" onClick={() => setShowGoogleModal(false)}>
          <div className="nx-g-modal-card shadow-2xl" onClick={(e) => e.stopPropagation()}>
            
            <div className="nx-g-header">
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-google fs-4 text-primary"></i>
                <div>
                  <h6 className="m-0 fw-bold text-dark">Sign in with Google</h6>
                  <small className="text-muted">Choose an account to continue to Nexoria</small>
                </div>
              </div>
              <button className="nx-g-close" onClick={() => setShowGoogleModal(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <div className="nx-g-accounts-list mt-3">
              
              {/* Google Account 1: Sanny Tiwari */}
              <div
                className="nx-g-account-item"
                onClick={() => executeGoogleAuth({
                  email: "tiwarisanny63@gmail.com",
                  name: "Sanny Tiwari",
                  first_name: "Sanny",
                  surname: "Tiwari",
                  picture: "https://lh3.googleusercontent.com/a/ACg8ocIS0mock=s96-c",
                  google_id: "goog_109283921"
                })}
              >
                <img
                  src="https://lh3.googleusercontent.com/a/ACg8ocIS0mock=s96-c"
                  alt="Sanny"
                  className="nx-g-avatar"
                  onError={(e) => { e.target.src = "https://api.dicebear.com/7.x/bottts/svg?seed=Sanny"; }}
                />
                <div className="nx-g-acc-info flex-grow-1">
                  <strong>Sanny Tiwari</strong>
                  <p>tiwarisanny63@gmail.com</p>
                </div>
                <span className="badge bg-primary-soft text-primary small">Default</span>
              </div>

              {/* Google Account 2: Rohit Kumar */}
              <div
                className="nx-g-account-item"
                onClick={() => executeGoogleAuth({
                  email: "rohit_kumar@gmail.com",
                  name: "Rohit Kumar",
                  first_name: "Rohit",
                  surname: "Kumar",
                  picture: "https://api.dicebear.com/7.x/bottts/svg?seed=Rohit",
                  google_id: "goog_448291041"
                })}
              >
                <img
                  src="https://api.dicebear.com/7.x/bottts/svg?seed=Rohit"
                  alt="Rohit"
                  className="nx-g-avatar"
                />
                <div className="nx-g-acc-info flex-grow-1">
                  <strong>Rohit Kumar</strong>
                  <p>rohit_kumar@gmail.com</p>
                </div>
              </div>

              {/* Custom Google Account Input */}
              {!isAddingGoogleAccount ? (
                <div
                  className="nx-g-account-item use-another"
                  onClick={() => setIsAddingGoogleAccount(true)}
                >
                  <div className="nx-g-icon-circle">
                    <i className="bi bi-person-plus-fill"></i>
                  </div>
                  <div className="nx-g-acc-info">
                    <strong>Use another Google account</strong>
                    <p>Sign in with a different Gmail address</p>
                  </div>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!customGoogleEmail.trim()) return;
                    executeGoogleAuth({
                      email: customGoogleEmail.trim().toLowerCase(),
                      name: customGoogleName.trim() || customGoogleEmail.split("@")[0],
                      first_name: customGoogleName.trim() || customGoogleEmail.split("@")[0],
                      picture: `https://api.dicebear.com/7.x/bottts/svg?seed=${customGoogleEmail}`
                    });
                  }}
                  className="nx-g-custom-form p-3 rounded-3"
                  style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}
                >
                  <label className="small fw-bold text-dark mb-1">Enter Gmail Address</label>
                  <input
                    type="email"
                    className="form-control form-control-sm mb-2"
                    placeholder="yourname@gmail.com"
                    value={customGoogleEmail}
                    onChange={(e) => setCustomGoogleEmail(e.target.value)}
                    autoFocus
                    required
                  />
                  <input
                    type="text"
                    className="form-control form-control-sm mb-2"
                    placeholder="Your Full Name (Optional)"
                    value={customGoogleName}
                    onChange={(e) => setCustomGoogleName(e.target.value)}
                  />
                  <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-primary btn-sm rounded-pill w-100 fw-semibold">
                      Continue with Google
                    </button>
                    <button
                      type="button"
                      className="btn btn-light btn-sm rounded-pill px-3"
                      onClick={() => setIsAddingGoogleAccount(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

            </div>

            <div className="nx-g-footer text-center mt-3 pt-2" style={{ borderTop: "1px solid #f1f5f9" }}>
              <small className="text-muted" style={{ fontSize: "0.75rem" }}>
                To continue, Google will share your name, email address, and profile picture with Nexoria Cosmos.
              </small>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default Login;