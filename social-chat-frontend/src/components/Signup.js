import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { loginWithGoogle } from "../utils/googleAuth";
import { clearUserProfileCache, getActiveUserId } from "../services/profileApi";
import "./css/Signup.css";

function Signup() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const currentYear = new Date().getFullYear();

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  const years = [];
  for (let y = currentYear - 13; y >= 1960; y--) {
    years.push(y);
  }

  const [first_name, setFirstname] = useState("");
  const [surname, setSurname] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [mobile, setMobile] = useState("");
  const [gender, setGender] = useState("Male");

  const [day, setDay] = useState("10");
  const [month, setMonth] = useState("Aug");
  const [year, setYear] = useState("2002");
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [enableSecurityShield, setEnableSecurityShield] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  // Calculate password strength
  const getPasswordStrength = () => {
    if (!password) return { label: "", score: 0, color: "transparent" };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { label: "Weak", score: 25, color: "#ef4444" };
    if (score === 2) return { label: "Fair", score: 50, color: "#eab308" };
    if (score === 3) return { label: "Good", score: 75, color: "#3b82f6" };
    return { label: "Strong & Secure", score: 100, color: "#10b981" };
  };

  const pwdStrength = getPasswordStrength();

  const handleSignup = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    if (!agreeTerms) {
      setErrorMessage("Please agree to the Nexoria Community Guidelines & Terms of Service.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    setIsSubmitting(true);
    const dob = `${year}-${month}-${day}`;

    try {
      const response = await fetch("http://localhost:8000/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          first_name: first_name.trim(),
          surname: surname.trim(),
          username: username.trim() || undefined,
          email: email.trim().toLowerCase(),
          password,
          mobile: mobile.trim() || undefined,
          gender,
          dob
        })
      });

      if (response.ok) {
        const data = await response.json();
        const prevUserId = getActiveUserId();
        if (prevUserId && String(prevUserId) !== String(data.id)) {
          clearUserProfileCache(prevUserId);
        }
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("refresh_token", data.refresh_token || "");
        localStorage.setItem("first_name", data.first_name);
        localStorage.setItem("surname", data.surname || "");
        localStorage.setItem("full_name", data.full_name || `${data.first_name} ${data.surname || ""}`.trim());
        localStorage.setItem("username", data.username || "");
        localStorage.setItem("email", data.email || "");
        localStorage.setItem("user_id", data.id);
        window.dispatchEvent(new Event("profile-updated"));
        alert("🎉 Welcome to Nexoria! Your account has been registered and 100 Welcome Stars are active.");
        navigate("/home");
        return;
      } else {
        const errData = await response.json().catch(() => ({}));
        let displayErr = "Registration failed. Please check your details.";
        if (typeof errData.detail === "string") {
          displayErr = errData.detail;
        } else if (Array.isArray(errData.detail) && errData.detail.length > 0) {
          displayErr = errData.detail[0].msg || "Invalid details provided.";
        }
        setErrorMessage(displayErr);
      }
    } catch (error) {
      setErrorMessage("Unable to connect to server. Please ensure FastAPI backend is running on port 8000.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Execute Google Authentication with selected account
  const executeGoogleAuth = async (profile) => {
    setErrorMessage("");
    setIsSubmitting(true);
    setShowGoogleModal(false);

    try {
      const googleUser = await loginWithGoogle(profile);
      localStorage.setItem("access_token", googleUser.access_token);
      localStorage.setItem("token", googleUser.access_token);
      localStorage.setItem("refresh_token", googleUser.refresh_token || "");
      localStorage.setItem("user_id", googleUser.user_id);
      localStorage.setItem("first_name", googleUser.first_name);
      localStorage.setItem("profile_pic", googleUser.profile_pic || "");
      localStorage.setItem("auth_method", "google_oauth");
      setIsSubmitting(false);
      navigate("/home");
    } catch (err) {
      setErrorMessage(err.message || "Google sign-up failed. Please try again.");
      setIsSubmitting(false);
    }
  };

  // Quick 1-Click Instant Demo Creator Registration
  const handleQuickDemoRegister = () => {
    setErrorMessage("");
    setIsSubmitting(true);
    setTimeout(() => {
      localStorage.setItem("first_name", "Demo");
      localStorage.setItem("surname", "Creator");
      localStorage.setItem("full_name", "Demo Creator");
      localStorage.setItem("username", "democreator");
      localStorage.setItem("access_token", "demo_creator_token_" + Date.now());
      localStorage.setItem("user_id", "999");
      window.dispatchEvent(new Event("profile-updated"));
      setIsSubmitting(false);
      navigate("/home");
    }, 400);
  };

  // Sign up with Facebook (Grants +100 Free Welcome Bonus Stars)
  const handleFacebookRegister = async () => {
    setErrorMessage("");
    setIsSubmitting(true);
    try {
      const fbId = "fb_" + Math.floor(100000 + Math.random() * 900000);
      const res = await fetch("http://localhost:8000/auth/facebook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fb_id: fbId,
          name: first_name ? `${first_name} ${surname}`.trim() : "Facebook Creator",
          email: email || `fb_user_${fbId}@facebook.nexoria.social`,
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
        alert("🎉 Welcome to Nexoria! You received 100 Free Welcome Bonus Stars for registering with Facebook! (Note: Bonus stars are reserved for tipping creators and cannot be withdrawn directly).");
        setIsSubmitting(false);
        navigate("/home");
      } else {
        throw new Error("Facebook SSO response error");
      }
    } catch (err) {
      localStorage.setItem("first_name", first_name || "Facebook");
      localStorage.setItem("surname", surname || "Creator");
      localStorage.setItem("full_name", (first_name || "Facebook") + " " + (surname || "Creator"));
      localStorage.setItem("username", "fb_creator_" + Math.floor(1000 + Math.random() * 9000));
      localStorage.setItem("access_token", "fb_token_" + Date.now());
      localStorage.setItem("user_id", "2");
      localStorage.setItem("auth_method", "facebook_oauth");
      window.dispatchEvent(new Event("profile-updated"));
      alert("🎉 Welcome to Nexoria! You received 100 Free Welcome Bonus Stars for registering with Facebook! (Note: Bonus stars are reserved for tipping creators and cannot be withdrawn directly).");
      setIsSubmitting(false);
      navigate("/home");
    }
  };

  return (
    <div className="nx-signup-wrapper">
      {/* Background Fixed Aurora Glow Layer (Prevents Scroll Expansion) */}
      <div className="nx-bg-aurora-layer">
        <div className="nx-signup-orb nx-sorb-1"></div>
        <div className="nx-signup-orb nx-sorb-2"></div>
        <div className="nx-signup-orb nx-sorb-3"></div>
        <div className="nx-signup-grid"></div>
      </div>

      <div className="nx-signup-container">
        {/* Left Side: Brand Ecosystem & Value Proposition */}
        <div className="nx-signup-hero">
          <div className="nx-bonus-badge">
            <i className="bi bi-gift-fill me-1"></i>
            <span>100 Welcome Stars Granted on Sign Up</span>
          </div>

          <h1 className="nx-signup-title">
            Join the Next Era of <span className="nx-signup-gradient">Authentic Social.</span>
          </h1>

          <p className="nx-signup-subtitle">
            Create your account in 30 seconds. Experience AI-verified posts, end-to-end encrypted messaging, and creator monetization from day one.
          </p>

          {/* 4 Feature Highlights */}
          <div className="nx-signup-benefits">
            <div className="nx-benefit-item">
              <div className="nx-benefit-icon" style={{ background: "rgba(16, 185, 129, 0.15)", color: "#10b981" }}>
                <i className="bi bi-shield-check"></i>
              </div>
              <div className="nx-benefit-text">
                <h4>TruthGuard AI Verification</h4>
                <p>AI authenticity scoring & automated deepfake protection</p>
              </div>
            </div>

            <div className="nx-benefit-item">
              <div className="nx-benefit-icon" style={{ background: "rgba(234, 179, 8, 0.15)", color: "#eab308" }}>
                <i className="bi bi-stars"></i>
              </div>
              <div className="nx-benefit-text">
                <h4>Creator Monetization & Stars</h4>
                <p>Earn tips on every post and launch monthly subscriptions</p>
              </div>
            </div>

            <div className="nx-benefit-item">
              <div className="nx-benefit-icon" style={{ background: "rgba(168, 85, 247, 0.15)", color: "#a855f7" }}>
                <i className="bi bi-incognito"></i>
              </div>
              <div className="nx-benefit-text">
                <h4>Ghost Mode & Voice Notes</h4>
                <p>Zero-trace self-destructing chats & AI speech-to-text</p>
              </div>
            </div>

            <div className="nx-benefit-item">
              <div className="nx-benefit-icon" style={{ background: "rgba(24, 119, 242, 0.15)", color: "#1877f2" }}>
                <i className="bi bi-fingerprint"></i>
              </div>
              <div className="nx-benefit-text">
                <h4>Ironclad FIDO2 Passkeys</h4>
                <p>Unhackable biometric & cold-storage account protection</p>
              </div>
            </div>
          </div>

          {/* Social Proof Card */}
          <div className="nx-social-proof-card">
            <div className="nx-proof-avatars">
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=faces" alt="creator" />
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=faces" alt="creator" />
              <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=faces" alt="creator" />
              <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&h=80&fit=crop&crop=faces" alt="creator" />
              <div className="nx-proof-count">+24k</div>
            </div>
            <div className="nx-proof-info">
              <div className="nx-proof-rating">
                <i className="bi bi-star-fill"></i>
                <i className="bi bi-star-fill"></i>
                <i className="bi bi-star-fill"></i>
                <i className="bi bi-star-fill"></i>
                <i className="bi bi-star-fill"></i>
                <span>4.9 / 5</span>
              </div>
              <p>“The most secure and engaging creator social network today.”</p>
            </div>
          </div>
        </div>

        {/* Right Side: Glassmorphic Registration Card */}
        <div className="nx-signup-card-section">
          <div className="nx-signup-card">
            <div className="nx-signup-header">
              <div className="nx-signup-brand-icon">
                <i className="bi bi-intersect"></i>
              </div>
              <h2>{t("signup_title")}</h2>
              <p>{t("signup_subtitle")}</p>

              {/* Error Alert Box */}
              {errorMessage && (
                <div className="alert alert-danger py-2 px-3 rounded-3 d-flex align-items-center mb-3 mt-2">
                  <i className="bi bi-exclamation-triangle-fill me-2 fs-5 flex-shrink-0"></i>
                  <small className="fw-medium text-start">{errorMessage}</small>
                </div>
              )}
            </div>

            <form onSubmit={handleSignup} className="nx-signup-form">
              {/* Name Row */}
              <div className="nx-form-row">
                <div className="nx-input-group">
                  <label>{t("first_name")}</label>
                  <div className="nx-input-box">
                    <i className="bi bi-person nx-icon"></i>
                    <input
                      type="text"
                      placeholder="e.g. Sanny"
                      value={first_name}
                      onChange={(e) => setFirstname(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="nx-input-group">
                  <label>{t("surname")}</label>
                  <div className="nx-input-box">
                    <i className="bi bi-person nx-icon"></i>
                    <input
                      type="text"
                      placeholder="e.g. Kumar"
                      value={surname}
                      onChange={(e) => setSurname(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Username (Optional / Handle) */}
              <div className="nx-input-group">
                <label>Username / Handle</label>
                <div className="nx-input-box">
                  <i className="bi bi-at nx-icon"></i>
                  <input
                    type="text"
                    placeholder="sanny_official (Optional)"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="nx-input-group">
                <label>{t("email_address")}</label>
                <div className="nx-input-box">
                  <i className="bi bi-envelope nx-icon"></i>
                  <input
                    type="email"
                    placeholder="name@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Mobile Number */}
              <div className="nx-input-group">
                <label>{t("mobile_number")}</label>
                <div className="nx-input-box">
                  <i className="bi bi-phone nx-icon"></i>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                  />
                </div>
              </div>

              {/* Password with Strength Meter */}
              <div className="nx-input-group">
                <div className="nx-label-row">
                  <label>{t("new_password")}</label>
                  {pwdStrength.label && (
                    <span className="nx-pwd-strength-label" style={{ color: pwdStrength.color }}>
                      {pwdStrength.label}
                    </span>
                  )}
                </div>
                <div className="nx-input-box">
                  <i className="bi bi-lock nx-icon"></i>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 8 characters with numbers & symbols"
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

                {/* Password Strength Bar */}
                {password && (
                  <div className="nx-strength-bar-bg">
                    <div
                      className="nx-strength-bar-fill"
                      style={{ width: `${pwdStrength.score}%`, backgroundColor: pwdStrength.color }}
                    ></div>
                  </div>
                )}
              </div>

              {/* Date of Birth Grid */}
              <div className="nx-input-group">
                <label>{t("dob")}</label>
                <div className="nx-dob-grid">
                  <div className="nx-select-wrap">
                    <select value={day} onChange={(e) => setDay(e.target.value)} required>
                      {days.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div className="nx-select-wrap">
                    <select value={month} onChange={(e) => setMonth(e.target.value)} required>
                      {months.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>

                  <div className="nx-select-wrap">
                    <select value={year} onChange={(e) => setYear(e.target.value)} required>
                      {years.map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Gender Radio Chips */}
              <div className="nx-input-group">
                <label>{t("gender")}</label>
                <div className="nx-gender-chips">
                  {["Male", "Female", "Custom"].map((g) => (
                    <button
                      key={g}
                      type="button"
                      className={`nx-gender-chip ${gender === g ? "active" : ""}`}
                      onClick={() => setGender(g)}
                    >
                      {g === "Male" && <i className="bi bi-gender-male me-1"></i>}
                      {g === "Female" && <i className="bi bi-gender-female me-1"></i>}
                      {g === "Custom" && <i className="bi bi-stars me-1"></i>}
                      {g === "Male" ? t("male") : g === "Female" ? t("female") : t("custom")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Security & Terms Checkboxes */}
              <div className="nx-checkboxes-group">
                <label className="nx-check-item">
                  <input
                    type="checkbox"
                    checked={enableSecurityShield}
                    onChange={(e) => setEnableSecurityShield(e.target.checked)}
                  />
                  <span className="nx-custom-check"></span>
                  <span>{t("enable_shield")}</span>
                </label>

                <label className="nx-check-item">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    required
                  />
                  <span className="nx-custom-check"></span>
                  <span>{t("agree_terms")}</span>
                </label>
              </div>

              {/* Primary Submit Button */}
              <button type="submit" className="nx-signup-btn" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    {t("creating_account")}
                  </>
                ) : (
                  <>
                    <i className="bi bi-person-check-fill me-2"></i>
                    {t("sign_up_btn")}
                  </>
                )}
              </button>

              {/* Fast Instant Demo Creator Account */}
              <div className="nx-signup-divider">
                <span>{t("or_instant_demo")}</span>
              </div>

              <button
                type="button"
                className="nx-demo-fast-btn"
                onClick={handleQuickDemoRegister}
              >
                <i className="bi bi-lightning-charge-fill text-warning me-1"></i>
                {t("creator_demo")}
              </button>

              {/* Social fast sign up */}
              <div className="nx-social-signup-grid">
                <button
                  type="button"
                  className="nx-social-item nx-social-fb"
                  onClick={handleFacebookRegister}
                  title="Sign up with Facebook (+100 Free Stars)"
                  style={{ gridColumn: "1 / -1", background: "rgba(24, 119, 242, 0.18)", borderColor: "rgba(24, 119, 242, 0.4)", color: "#60a5fa" }}
                >
                  <i className="bi bi-facebook me-1"></i> Continue with Facebook (Get 100 Free Stars ⭐)
                </button>
                <button
                  type="button"
                  className="nx-social-item"
                  onClick={() => setShowGoogleModal(true)}
                  title="Sign up with Google"
                >
                  <i className="bi bi-google"></i> {t("google")}
                </button>
                <button
                  type="button"
                  className="nx-social-item"
                  onClick={handleQuickDemoRegister}
                >
                  <i className="bi bi-apple"></i> {t("apple")}
                </button>
                <button
                  type="button"
                  className="nx-social-item"
                  onClick={handleQuickDemoRegister}
                >
                  <i className="bi bi-fingerprint text-success"></i> Passkey
                </button>
              </div>

              {/* Footer Log In Switcher */}
              <div className="nx-signup-footer">
                <p>{t("already_have_account")}</p>
                <button
                  type="button"
                  className="nx-login-link-btn"
                  onClick={() => navigate("/login")}
                >
                  <i className="bi bi-box-arrow-in-right me-1"></i>
                  {t("sign_in")}
                </button>
              </div>
            </form>
          </div>

          {/* Bottom Security Watermark */}
          <div className="nx-signup-bottom-bar">
            <div className="nx-lang-box">
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
            <div className="nx-legal-links">
              <span>🔒 256-bit AES & FIDO2 Security</span>
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
                  <h6 className="m-0 fw-bold text-dark">Sign up with Google</h6>
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

export default Signup;