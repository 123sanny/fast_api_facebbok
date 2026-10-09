import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { 
  BsX, BsSearch, BsList, BsChevronRight, BsIncognito, 
  BsGlobe2, BsShieldCheck, BsCheckCircleFill, BsLockFill,
  BsPeopleFill, BsGlobe, BsCheck2
} from "react-icons/bs";
import { getActiveUserId } from "../services/profileApi";
import { fetchPrivacySettingsApi, completePrivacyCheckupApi } from "../services/settingsApi";
import "./css/PrivacyCentre.css";

const PrivacyCentre = () => {
  const navigate = useNavigate();
  const currentUserId = getActiveUserId();

  const [privacyData, setPrivacyData] = useState({
    profile_locked: false,
    active_status: true,
    who_can_see_posts: "Public",
    who_can_see_friends: "public",
    who_can_send_requests: "everyone",
    who_can_post_on_profile: "friends",
    who_can_follow: "public",
    review_tags: true,
    reactions_hide_others: false,
    reactions_hide_own: false,
    sensitive_content: "standard",
    search_engine_indexing: true,
    privacy_checkup_completed: false
  });

  const [showCheckupModal, setShowCheckupModal] = useState(false);
  const [checkupStep, setCheckupStep] = useState(1);
  const [toastMessage, setToastMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Checkup draft state
  const [draftPostAudience, setDraftPostAudience] = useState("Public");
  const [draftFriendRequests, setDraftFriendRequests] = useState("everyone");
  const [draftSearchIndexing, setDraftSearchIndexing] = useState(true);
  const [draftProfileLock, setDraftProfileLock] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const loadPrivacy = useCallback(async () => {
    try {
      const res = await fetchPrivacySettingsApi(currentUserId);
      if (res && res.success) {
        setPrivacyData(res);
        setDraftPostAudience(res.who_can_see_posts || "Public");
        setDraftFriendRequests(res.who_can_send_requests || "everyone");
        setDraftSearchIndexing(res.search_engine_indexing !== undefined ? res.search_engine_indexing : true);
        setDraftProfileLock(Boolean(res.profile_locked));
      }
    } catch (err) {
      console.warn("Error loading privacy data:", err);
    }
  }, [currentUserId]);

  useEffect(() => {
    loadPrivacy();
  }, [loadPrivacy]);

  const handleFinishCheckup = async () => {
    setIsSaving(true);
    try {
      const payload = {
        who_can_see_posts: draftPostAudience,
        who_can_send_requests: draftFriendRequests,
        search_engine_indexing: draftSearchIndexing,
        profile_locked: draftProfileLock
      };
      const res = await completePrivacyCheckupApi(currentUserId, payload);
      if (res && res.success) {
        showToast("🎉 Privacy checkup completed and saved to database!");
        setShowCheckupModal(false);
        setCheckupStep(1);
        loadPrivacy();
      } else {
        showToast(res?.message || "Failed to complete privacy checkup.");
      }
    } catch (err) {
      showToast("Error saving privacy checkup.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="pc-container">

      {/* Toast Alert */}
      {toastMessage && (
        <div style={{
          position: "fixed",
          top: 20,
          right: 20,
          zIndex: 2500,
          background: "#198754",
          color: "#fff",
          padding: "10px 18px",
          borderRadius: "8px",
          boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontWeight: 600,
          fontSize: "0.9rem"
        }}>
          <BsCheckCircleFill size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="pc-header">
        <BsX className="pc-close" onClick={() => navigate(-1)} />
        <div className="pc-header-meta">
          <BsGlobe2 className="pc-meta-icon" />
          <span>Nexoria</span>
        </div>
        <div className="pc-header-right">
          <BsSearch className="pc-icon" />
          <BsList className="pc-icon" />
        </div>
      </div>

      <div className="pc-scroll">

        {/* Title Section */}
        <div className="pc-title-section">
          <div className="d-flex align-items-center justify-content-between mb-2">
            <h2>Privacy Centre</h2>
            {privacyData.privacy_checkup_completed ? (
              <span className="badge bg-success py-2 px-3 d-flex align-items-center gap-1 rounded-pill" style={{ fontSize: "0.8rem" }}>
                <BsCheckCircleFill /> Checkup Completed
              </span>
            ) : (
              <span className="badge bg-warning text-dark py-2 px-3 rounded-pill" style={{ fontSize: "0.8rem" }}>
                Checkup Recommended
              </span>
            )}
          </div>
          <p>Make the privacy choices that are right for you. Learn how to manage and control your privacy on Nexoria, Nexoria Lens, and across our quantum-secured ecosystem.</p>
        </div>

        {/* Interactive Privacy Checkup Card */}
        <div className="pc-section">
          <div className="card border-0 shadow-sm p-3 mb-3" style={{ background: "linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%)", color: "#fff", borderRadius: 14 }}>
            <div className="d-flex align-items-start gap-3">
              <div style={{ background: "rgba(255,255,255,0.2)", padding: 12, borderRadius: "50%" }}>
                <BsShieldCheck size={28} />
              </div>
              <div className="flex-grow-1">
                <h4 className="fw-bold mb-1">Nexoria Privacy Checkup</h4>
                <p className="small mb-3" style={{ opacity: 0.9 }}>
                  Guided 4-step wizard to review who can see what you share, how people can find you, and secure your profile.
                </p>
                <button 
                  className="btn btn-light fw-bold rounded-pill px-4"
                  onClick={() => {
                    setCheckupStep(1);
                    setShowCheckupModal(true);
                  }}
                >
                  {privacyData.privacy_checkup_completed ? "Review Privacy Checkup" : "Start Privacy Checkup"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* We build privacy */}
        <div className="pc-section">
          <h3>We build privacy into our products</h3>
          <div className="pc-card">
            <div className="pc-card-icon-wrap">
              <img src="https://img.icons8.com/color/96/secured-letter.png" alt="Private messaging" className="pc-card-img" />
            </div>
            <h4>Private messaging & E2EE</h4>
            <p>Our messaging products offer quantum-grade end-to-end encryption, so your conversations stay safe and secure.</p>
          </div>
        </div>

        {/* Settings to help */}
        <div className="pc-section">
          <h3>Settings to help control your privacy</h3>
          <p className="pc-section-desc">We build easy-to-use settings that you can use to make the privacy choices that are right for you.</p>
          <img src="https://picsum.photos/600/300?random=10" alt="Privacy settings" className="pc-full-img" />
          <button className="pc-blue-btn" onClick={() => navigate("/settings")}>Review settings</button>
        </div>

        {/* Privacy topics */}
        <div className="pc-section">
          <h3>Privacy topics</h3>
          <p className="pc-section-desc">Get answers to your privacy questions and manage your privacy in a way that's right for you.</p>

          <div className="pc-topic-card">
            <img src="https://picsum.photos/600/250?random=20" alt="Generative AI" className="pc-topic-img" />
            <div className="pc-topic-label">
              <span className="pc-topic-sub">Quantum AI Safety</span>
              <strong>Generative AI & Privacy at Nexoria</strong>
            </div>
          </div>

          <button className="pc-outline-btn" onClick={() => navigate("/settings")}>View all settings</button>
        </div>

        {/* Learn about Meta's commitment */}
        <div className="pc-section">
          <h3>Learn about Nexoria's commitment to privacy</h3>
          <p className="pc-section-desc">Find more resources that you can use to learn about how Nexoria builds privacy into its products.</p>

          <div className="pc-list-item" onClick={() => navigate("/support")}>
            <BsIncognito className="pc-list-icon" />
            <span>More privacy resources & support</span>
            <BsChevronRight className="pc-list-arrow" />
          </div>
        </div>

        {/* Learn more in Privacy Policy */}
        <div className="pc-section">
          <h3>Learn more in the Privacy Policy</h3>

          <div className="pc-policy-card" onClick={() => navigate("/terms_policies")}>
            <img src="https://img.icons8.com/color/96/privacy-policy.png" alt="Privacy Policy" className="pc-policy-icon" />
            <div>
              <strong>What is the Privacy Policy, and what does it cover?</strong>
              <p>Privacy Policy</p>
            </div>
            <BsChevronRight />
          </div>
        </div>

      </div>

      {/* ====================================================================
          INTERACTIVE PRIVACY CHECKUP WIZARD MODAL
          ==================================================================== */}
      {showCheckupModal && (
        <div className="acp-overlay" onClick={() => setShowCheckupModal(false)}>
          <div className="settings-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
            
            {/* Modal Header */}
            <div className="settings-modal-header">
              <div>
                <span className="text-primary small fw-bold text-uppercase">Step {checkupStep} of 4</span>
                <h4 className="mb-0">
                  {checkupStep === 1 && "Who can see what you share"}
                  {checkupStep === 2 && "How people can find you"}
                  {checkupStep === 3 && "Search & data discoverability"}
                  {checkupStep === 4 && "Profile lock & protection"}
                </h4>
              </div>
              <button className="acp-close" onClick={() => setShowCheckupModal(false)}>✕</button>
            </div>

            {/* Modal Body */}
            <div className="settings-modal-body">
              
              {/* STEP 1: Who can see what you share */}
              {checkupStep === 1 && (
                <div>
                  <p className="text-muted small mb-3">
                    Choose who sees your future posts and stories on Feed, Reels, and profile by default.
                  </p>
                  {["Public", "Friends", "Only me"].map(opt => (
                    <div 
                      key={opt}
                      className={`radio-setting-option ${draftPostAudience === opt ? "active" : ""}`}
                      onClick={() => setDraftPostAudience(opt)}
                    >
                      <div className="d-flex align-items-center gap-2">
                        {opt === "Public" && <BsGlobe size={18} className="text-primary" />}
                        {opt === "Friends" && <BsPeopleFill size={18} className="text-primary" />}
                        {opt === "Only me" && <BsLockFill size={18} className="text-primary" />}
                        <h6>{opt}</h6>
                      </div>
                      {draftPostAudience === opt && <BsCheck2 size={20} className="text-primary" />}
                    </div>
                  ))}
                </div>
              )}

              {/* STEP 2: How people can find you */}
              {checkupStep === 2 && (
                <div>
                  <p className="text-muted small mb-3">
                    Decide who can send you friend requests and reach out to you on Nexoria.
                  </p>
                  {[
                    { id: "everyone", label: "Everyone", desc: "Anyone on Nexoria can send you friend requests" },
                    { id: "friends_of_friends", label: "Friends of friends", desc: "Only people who share mutual connections" }
                  ].map(opt => (
                    <div 
                      key={opt.id}
                      className={`radio-setting-option ${draftFriendRequests === opt.id ? "active" : ""}`}
                      onClick={() => setDraftFriendRequests(opt.id)}
                    >
                      <div>
                        <h6>{opt.label}</h6>
                        <small className="text-muted d-block">{opt.desc}</small>
                      </div>
                      {draftFriendRequests === opt.id && <BsCheck2 size={20} className="text-primary" />}
                    </div>
                  ))}
                </div>
              )}

              {/* STEP 3: Search Engine Indexing */}
              {checkupStep === 3 && (
                <div>
                  <p className="text-muted small mb-3">
                    Control whether external search engines (like Google) can index and display a link to your Nexoria profile.
                  </p>
                  <div className="toggle-setting-row">
                    <div>
                      <h6>Search Engine Indexing</h6>
                      <p>{draftSearchIndexing ? "Search engines can link to your profile" : "Search engines will NOT link to your profile"}</p>
                    </div>
                    <div 
                      className={`theme-toggle-switch ${draftSearchIndexing ? "on" : ""}`}
                      onClick={() => setDraftSearchIndexing(!draftSearchIndexing)}
                    >
                      <div className="switch-thumb"></div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: Profile Locking */}
              {checkupStep === 4 && (
                <div>
                  <p className="text-muted small mb-3">
                    When your profile is locked, only confirmed friends can view full photos, posts, and details.
                  </p>
                  <div className="toggle-setting-row">
                    <div>
                      <h6>Lock Your Profile</h6>
                      <p>{draftProfileLock ? "Profile is locked (Ironclad Privacy)" : "Profile is public"}</p>
                    </div>
                    <div 
                      className={`theme-toggle-switch ${draftProfileLock ? "on" : ""}`}
                      onClick={() => setDraftProfileLock(!draftProfileLock)}
                    >
                      <div className="switch-thumb"></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Step Navigation Buttons */}
              <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
                {checkupStep > 1 ? (
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary rounded-pill px-4"
                    onClick={() => setCheckupStep(s => s - 1)}
                  >
                    Back
                  </button>
                ) : (
                  <div></div>
                )}

                {checkupStep < 4 ? (
                  <button 
                    type="button" 
                    className="btn btn-primary rounded-pill px-4 fw-bold"
                    onClick={() => setCheckupStep(s => s + 1)}
                  >
                    Next Step
                  </button>
                ) : (
                  <button 
                    type="button" 
                    className="btn btn-success rounded-pill px-4 fw-bold"
                    onClick={handleFinishCheckup}
                    disabled={isSaving}
                  >
                    {isSaving ? "Saving..." : "Save & Complete Checkup"}
                  </button>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PrivacyCentre;