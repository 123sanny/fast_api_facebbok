import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  BsChevronLeft, BsSearch, BsGlobe, BsPatchCheckFill,
  BsBookmark, BsBookmarkFill, BsBoxArrowUpRight, BsEyeSlash,
  BsPlusLg, BsSliders, BsCheck2, BsX, BsCheckCircleFill,
  BsMegaphoneFill, BsStars, BsSlashCircle, BsTagFill
} from "react-icons/bs";
import Header from "./Header";
import MenuIcons from "./MenuIcons";
import ChatDrawer from "./ChatDrawer";
import "./css/AdActivity.css";

import { getActiveUserId } from "../services/profileApi";
import {
  fetchAdActivityApi,
  toggleSaveAdApi,
  trackAdClickApi,
  hideAdApi,
  createAdCampaignApi,
  fetchAdPreferencesApi,
  updateAdPreferencesApi,
  blockAdvertiserApi,
  unblockAdvertiserApi,
  fetchBlockedAdvertisersApi
} from "../services/adActivityApi";

const AdActivity = () => {
  const navigate = useNavigate();
  const currentUserId = getActiveUserId();

  const [activeChat, setActiveChat] = useState(null);
  const [tab, setTab] = useState("recent"); // "recent" | "saved" | "preferences"
  const [search, setSearch] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Dynamic Data
  const [ads, setAds] = useState([]);
  const [savedCount, setSavedCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Ad Preferences State
  const [personalizedAds, setPersonalizedAds] = useState(true);
  const [topics, setTopics] = useState([]);
  const [blockedAdvertisers, setBlockedAdvertisers] = useState([]);

  // Modals & Feedback
  const [selectedAdForFeedback, setSelectedAdForFeedback] = useState(null);
  const [feedbackReason, setFeedbackReason] = useState("irrelevant");
  const [feedbackText, setFeedbackText] = useState("");
  const [showCreateAdModal, setShowCreateAdModal] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Create Ad Form State
  const [brandName, setBrandName] = useState("");
  const [headline, setHeadline] = useState("");
  const [description, setDescription] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [targetUrl, setTargetUrl] = useState("https://nexoria.io");
  const [category, setCategory] = useState("Technology");
  const [callToAction, setCallToAction] = useState("Learn More");
  const [isCreatingAd, setIsCreatingAd] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  // 1. Fetch Dynamic Ad Activity
  const loadAdActivity = useCallback(async () => {
    if (tab === "preferences") return;
    setIsLoading(true);
    try {
      const res = await fetchAdActivityApi(currentUserId, tab, search);
      if (res && res.success && Array.isArray(res.data)) {
        setAds(res.data);
        setSavedCount(res.saved_count || 0);
      }
    } catch (err) {
      console.warn("Failed to load ad activity:", err);
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId, tab, search]);

  // 2. Fetch Ad Preferences & Blocked Advertisers
  const loadAdPreferences = useCallback(async () => {
    try {
      const [res, blocked] = await Promise.all([
        fetchAdPreferencesApi(currentUserId),
        fetchBlockedAdvertisersApi(currentUserId)
      ]);
      if (res) {
        setPersonalizedAds(Boolean(res.personalized_ads));
        if (Array.isArray(res.topics)) {
          setTopics(res.topics);
        }
      }
      if (Array.isArray(blocked)) {
        setBlockedAdvertisers(blocked);
      }
    } catch (err) {
      console.warn("Failed to load ad preferences:", err);
    }
  }, [currentUserId]);

  useEffect(() => {
    if (tab === "preferences") {
      loadAdPreferences();
    } else {
      loadAdActivity();
    }
  }, [tab, search, loadAdActivity, loadAdPreferences]);

  // 3. Save / Unsave Ad
  const handleToggleSave = async (ad) => {
    const res = await toggleSaveAdApi(currentUserId, ad.ad_id);
    if (res && res.success) {
      setAds(prev => prev.map(item => item.ad_id === ad.ad_id ? { ...item, is_saved: res.is_saved } : item));
      setSavedCount(res.saved_count);
      showToast(res.message);
      if (tab === "saved" && !res.is_saved) {
        setAds(prev => prev.filter(item => item.ad_id !== ad.ad_id));
      }
    }
  };

  // 4. Click Ad / Visit Advertiser
  const handleAdClick = async (ad) => {
    await trackAdClickApi(currentUserId, ad.ad_id);
    if (ad.target_url) {
      window.open(ad.target_url, "_blank", "noopener,noreferrer");
    }
  };

  // 5. Hide Ad / Submit Feedback
  const handleHideAdSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAdForFeedback) return;
    const res = await hideAdApi(currentUserId, selectedAdForFeedback.ad_id, feedbackReason, feedbackText);
    if (res && res.success) {
      setAds(prev => prev.filter(item => item.ad_id !== selectedAdForFeedback.ad_id));
      setSelectedAdForFeedback(null);
      setFeedbackText("");
      showToast("Ad hidden from your activity stream. Feedback recorded.");
    }
  };

  // 6. Create Sponsored Ad Campaign
  const handleCreateAdSubmit = async (e) => {
    e.preventDefault();
    if (!brandName || !headline) return;
    setIsCreatingAd(true);
    try {
      const res = await createAdCampaignApi(currentUserId, {
        brand_name: brandName,
        headline,
        description,
        media_url: mediaUrl || undefined,
        target_url: targetUrl || "https://nexoria.io",
        category,
        call_to_action: callToAction
      });
      if (res && res.success) {
        showToast("🎉 Sponsored ad campaign created and added to activity stream!");
        setShowCreateAdModal(false);
        setBrandName("");
        setHeadline("");
        setDescription("");
        setMediaUrl("");
        loadAdActivity();
      }
    } catch (err) {
      showToast("Could not create ad campaign. Check inputs.");
    } finally {
      setIsCreatingAd(false);
    }
  };

  // 7. Toggle Personalized Ads
  const handleTogglePersonalized = async () => {
    const nextVal = !personalizedAds;
    setPersonalizedAds(nextVal);
    await updateAdPreferencesApi(currentUserId, { personalized_ads: nextVal });
    showToast(`Personalized ads ${nextVal ? "enabled" : "disabled"}.`);
  };

  // 8. Toggle Topic Interest
  const handleToggleTopic = async (topic) => {
    const nextVal = !topic.is_interested;
    const updatedTopics = topics.map(t => t.topic_name === topic.topic_name ? { ...t, is_interested: nextVal } : t);
    setTopics(updatedTopics);
    await updateAdPreferencesApi(currentUserId, {
      topics: [{ topic_name: topic.topic_name, is_interested: nextVal }]
    });
    showToast(`Topic preference updated: ${topic.topic_name}`);
  };

  // 9. Block All Ads from an Advertiser
  const handleBlockAdvertiser = async (brand, adId = null) => {
    if (!brand) return;
    try {
      const res = await blockAdvertiserApi(currentUserId, brand, adId, feedbackReason || "Blocked by user");
      if (res && res.success) {
        showToast(`🚫 Blocked all ads from "${brand}".`);
        setSelectedAdForFeedback(null);
        setAds(prev => prev.filter(item => (item.name || item.brand_name) !== brand));
        loadAdPreferences();
      } else {
        showToast(res?.message || "Failed to block advertiser.");
      }
    } catch (err) {
      showToast("Error blocking advertiser.");
    }
  };

  // 10. Unblock an Advertiser
  const handleUnblockAdvertiser = async (brand) => {
    try {
      const res = await unblockAdvertiserApi(currentUserId, brand);
      if (res && res.success) {
        showToast(`Unblocked ads from "${brand}".`);
        loadAdPreferences();
      } else {
        showToast(res?.message || "Failed to unblock advertiser.");
      }
    } catch (err) {
      showToast("Error unblocking advertiser.");
    }
  };

  return (
    <div className="fb-ad-activity-root">
      <Header onOpenChat={setActiveChat} />

      {/* Floating Toast Alert */}
      {toastMessage && (
        <div className="fb-ad-toast shadow-lg">
          <BsCheckCircleFill className="text-success me-2" size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="fb-ad-activity-container">
        {/* Header Bar */}
        <div className="fb-ad-header">
          <button className="fb-ad-back-btn" onClick={() => navigate(-1)} aria-label="Go back">
            <BsChevronLeft size={20} />
          </button>
          <h2 className="fb-ad-header-title">Ad activity</h2>
          <div className="fb-ad-header-actions">
            <button 
              className="fb-ad-sponsor-btn"
              onClick={() => setShowCreateAdModal(true)}
              title="Sponsor / Create New Ad"
            >
              <BsPlusLg size={12} /> Sponsor Ad
            </button>
            <button 
              className={`fb-ad-icon-btn ${isSearching ? "active" : ""}`} 
              onClick={() => setIsSearching(!isSearching)}
              title="Search ads"
            >
              <BsSearch size={16} />
            </button>
          </div>
        </div>

        {/* Expandable Search Input */}
        {isSearching && (
          <div className="fb-ad-search-box">
            <BsSearch className="fb-ad-search-icon" />
            <input
              type="text"
              className="fb-ad-search-input"
              placeholder="Search ads by advertiser, product, or keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
            {search && (
              <button className="fb-ad-search-clear" onClick={() => setSearch("")}>
                <BsX size={20} />
              </button>
            )}
          </div>
        )}

        {/* Hero Section */}
        <div className="fb-ad-hero">
          <h3 className="fb-ad-hero-title">Your ad activity</h3>
          <p className="fb-ad-hero-desc">
            See ads you've recently interacted with on Feed & Reels, save your favorite deals, and customize advertiser topics.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="fb-ad-tabs">
          <button
            className={`fb-ad-tab ${tab === "recent" ? "active" : ""}`}
            onClick={() => setTab("recent")}
          >
            RECENT
          </button>
          <button
            className={`fb-ad-tab ${tab === "saved" ? "active" : ""}`}
            onClick={() => setTab("saved")}
          >
            SAVED {savedCount > 0 && <span className="fb-ad-saved-badge">{savedCount}</span>}
          </button>
          <button
            className={`fb-ad-tab ${tab === "preferences" ? "active" : ""}`}
            onClick={() => setTab("preferences")}
          >
            <BsSliders size={13} className="me-1" /> AD TOPICS
          </button>
        </div>

        {/* Tab Content */}
        <div className="fb-ad-body">
          {tab === "preferences" ? (
            /* AD TOPICS & PREFERENCES VIEW */
            <div className="fb-ad-pref-view">
              {/* Personalized Ads Toggle Card */}
              <div className="fb-pref-card">
                <div className="fb-pref-row">
                  <div>
                    <h5 className="fb-pref-title">Personalized Ads</h5>
                    <p className="fb-pref-subtitle">
                      Allow Nexoria to use your activity and interactions to recommend more relevant sponsors and exclusive deals.
                    </p>
                  </div>
                  <div 
                    className={`theme-toggle-switch ${personalizedAds ? "on" : ""}`}
                    onClick={handleTogglePersonalized}
                  >
                    <div className="switch-thumb"></div>
                  </div>
                </div>
              </div>

              <div className="fb-topics-header">
                <h5 className="fw-bold mb-1">Advertiser Topics You're Interested In</h5>
                <p className="text-muted small mb-3">
                  Tap to follow or unfollow ad categories. We'll adjust your feed sponsors accordingly.
                </p>
              </div>

              <div className="fb-topics-grid">
                {topics.map((t, idx) => (
                  <button
                    key={idx}
                    className={`fb-topic-chip ${t.is_interested ? "active" : ""}`}
                    onClick={() => handleToggleTopic(t)}
                  >
                    {t.is_interested && <BsCheck2 size={16} className="me-1 text-primary" />}
                    <span>{t.topic_name}</span>
                  </button>
                ))}
              </div>

              {/* Blocked Advertisers Section */}
              <div className="fb-blocked-adv-section mt-4 pt-3 border-top">
                <h5 className="fw-bold mb-1 d-flex align-items-center gap-2">
                  <BsSlashCircle className="text-danger" size={18} /> Blocked Advertisers
                </h5>
                <p className="text-muted small mb-3">
                  You won't see any ads or sponsored deals from these brands across Nexoria.
                </p>

                {blockedAdvertisers.length === 0 ? (
                  <div className="fb-empty-blocked-box">
                    You haven't blocked any advertisers yet.
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    {blockedAdvertisers.map((b, idx) => (
                      <div key={idx} className="fb-blocked-adv-row">
                        <div>
                          <strong className="d-block text-dark">{b.brand_name}</strong>
                          <small className="text-muted">Blocked on {new Date(b.created_at || Date.now()).toLocaleDateString()}</small>
                        </div>
                        <button 
                          className="btn btn-sm btn-outline-danger rounded-pill px-3 fw-bold"
                          onClick={() => handleUnblockAdvertiser(b.brand_name)}
                        >
                          Unblock
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* RECENT OR SAVED ADS FEED */
            <div className="fb-ad-feed">
              {isLoading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : ads.length === 0 ? (
                <div className="fb-ad-empty-state">
                  <div className="fb-ad-empty-icon-box">
                    {tab === "saved" ? <BsBookmark size={36} /> : <BsMegaphoneFill size={36} />}
                  </div>
                  <h4 className="fw-bold mb-1">{tab === "saved" ? "No saved ads yet" : "No recent ad interactions"}</h4>
                  <p className="text-muted small mb-0">
                    {tab === "saved" 
                      ? "When you bookmark sponsored posts and deals, they will appear here in your saved vault."
                      : "Ads you click on or interact with in your feed will show up here."}
                  </p>
                </div>
              ) : (
                ads.map(ad => {
                  const brandDisplayName = ad.name || ad.brand_name || "Sponsored";
                  const logoSrc = ad.logo || ad.logo_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${brandDisplayName}`;
                  const imageSrc = ad.img || ad.media_url;
                  const adCategory = ad.category || "Technology";
                  const timeClicked = ad.clickedAgo || ad.time || "Recently";

                  return (
                    <div key={ad.id || ad.ad_id} className="fb-ad-card">
                      {/* Top Clicked & Category Bar */}
                      <div className="fb-ad-card-meta">
                        <span className="fb-ad-clicked-text">
                          You clicked this on <strong>{timeClicked}</strong>
                        </span>
                        <span className="fb-ad-category-pill">
                          <BsTagFill size={10} className="me-1 opacity-75" />
                          {adCategory}
                        </span>
                      </div>

                      {/* Post Header */}
                      <div className="fb-ad-post-header">
                        <img 
                          src={logoSrc} 
                          alt={brandDisplayName} 
                          className="fb-ad-avatar" 
                          onError={(e) => {
                            e.currentTarget.src = `https://api.dicebear.com/7.x/identicon/svg?seed=${brandDisplayName}`;
                          }}
                        />
                        <div className="fb-ad-author-info">
                          <div className="d-flex align-items-center gap-1">
                            <strong className="fb-ad-brand-name">{brandDisplayName}</strong>
                            {ad.verified && <BsPatchCheckFill className="text-primary" size={14} />}
                          </div>
                          <div className="fb-ad-sponsored-line">
                            <span>Ad · {ad.time || "Sponsored"}</span>
                            <BsGlobe size={11} className="ms-1 opacity-75" />
                          </div>
                        </div>
                      </div>

                      {/* Headline / Copy */}
                      {ad.headline && <h5 className="fb-ad-headline">{ad.headline}</h5>}
                      {(ad.adText || ad.description) && (
                        <p className="fb-ad-copy">{ad.adText || ad.description}</p>
                      )}

                      {/* Media Image */}
                      {imageSrc && (
                        <div className="fb-ad-media-wrap" onClick={() => handleAdClick(ad)}>
                          <img 
                            src={imageSrc} 
                            alt="ad banner" 
                            className="fb-ad-image" 
                            onError={(e) => {
                              e.currentTarget.src = "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop&q=80";
                            }}
                          />
                        </div>
                      )}

                      {/* CTA Banner Bar */}
                      <div className="fb-ad-cta-banner">
                        <div className="fb-ad-domain-info" onClick={() => handleAdClick(ad)}>
                          <span className="fb-ad-domain-url">
                            {ad.target_url ? ad.target_url.replace(/^https?:\/\//, "").replace(/\/.*$/, "") : "nexoria.io"}
                          </span>
                          <span className="fb-ad-domain-title">{ad.headline || brandDisplayName}</span>
                        </div>
                        <button 
                          className="fb-ad-cta-action-btn"
                          onClick={() => handleAdClick(ad)}
                        >
                          <span>{ad.call_to_action || "Learn More"}</span>
                          <BsBoxArrowUpRight size={12} className="ms-1" />
                        </button>
                      </div>

                      {/* Footer Actions Row */}
                      <div className="fb-ad-card-footer">
                        <button 
                          className={`fb-ad-footer-btn ${ad.is_saved ? "saved" : ""}`}
                          onClick={() => handleToggleSave(ad)}
                        >
                          {ad.is_saved ? <BsBookmarkFill className="text-primary" /> : <BsBookmark />}
                          <span>{ad.is_saved ? "Saved" : "Save"}</span>
                        </button>
                        <button 
                          className="fb-ad-footer-btn"
                          onClick={() => setSelectedAdForFeedback(ad)}
                        >
                          <BsEyeSlash />
                          <span>Hide Ad</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>

      {/* ================= MODALS ================= */}

      {/* 1. HIDE AD / FEEDBACK MODAL */}
      {selectedAdForFeedback && (
        <div className="fb-ad-modal-overlay" onClick={() => setSelectedAdForFeedback(null)}>
          <div className="fb-ad-modal-card" onClick={e => e.stopPropagation()}>
            <div className="fb-ad-modal-header">
              <h5 className="mb-0 fw-bold">Why do you want to hide this ad?</h5>
              <button className="fb-ad-modal-close" onClick={() => setSelectedAdForFeedback(null)}>✕</button>
            </div>
            <div className="fb-ad-modal-body">
              <p className="text-muted small mb-3">
                Your feedback helps us show you better ads from <strong>{selectedAdForFeedback.name || selectedAdForFeedback.brand_name}</strong>.
              </p>

              <form onSubmit={handleHideAdSubmit}>
                {[
                  { id: "irrelevant", label: "Not relevant to me" },
                  { id: "too_often", label: "I see this ad too often" },
                  { id: "already_purchased", label: "I already bought this item" },
                  { id: "misleading", label: "Misleading or inappropriate" }
                ].map(opt => (
                  <div 
                    key={opt.id}
                    className={`fb-ad-feedback-option ${feedbackReason === opt.id ? "active" : ""}`}
                    onClick={() => setFeedbackReason(opt.id)}
                  >
                    <span>{opt.label}</span>
                    {feedbackReason === opt.id && <BsCheck2 size={18} className="text-primary" />}
                  </div>
                ))}

                <div className="mt-3">
                  <label className="form-label small text-muted">Additional comments (optional):</label>
                  <input 
                    type="text" 
                    className="form-control form-control-sm"
                    placeholder="Tell us more..."
                    value={feedbackText}
                    onChange={e => setFeedbackText(e.target.value)}
                  />
                </div>

                <div className="d-flex gap-2 mt-4">
                  <button 
                    type="button" 
                    className="btn btn-secondary rounded-pill w-100"
                    onClick={() => setSelectedAdForFeedback(null)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-warning rounded-pill w-100 fw-bold"
                  >
                    Hide Ad
                  </button>
                </div>

                <div className="my-3 text-center">
                  <span className="text-muted small" style={{ fontSize: "0.75rem", letterSpacing: "1px" }}>── OR BLOCK ADVERTISER ──</span>
                </div>

                <button 
                  type="button" 
                  className="btn btn-outline-danger w-100 rounded-pill fw-bold d-flex align-items-center justify-content-center gap-2"
                  onClick={() => handleBlockAdvertiser(selectedAdForFeedback.name || selectedAdForFeedback.brand_name, selectedAdForFeedback.ad_id)}
                >
                  <BsSlashCircle size={16} /> Block all ads from {selectedAdForFeedback.name || selectedAdForFeedback.brand_name}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 2. CREATE SPONSORED AD MODAL */}
      {showCreateAdModal && (
        <div className="fb-ad-modal-overlay" onClick={() => setShowCreateAdModal(false)}>
          <div className="fb-ad-modal-card" onClick={e => e.stopPropagation()}>
            <div className="fb-ad-modal-header">
              <h5 className="mb-0 fw-bold d-flex align-items-center gap-2">
                <BsStars className="text-primary" /> Sponsor / Create Ad Campaign
              </h5>
              <button className="fb-ad-modal-close" onClick={() => setShowCreateAdModal(false)}>✕</button>
            </div>
            <div className="fb-ad-modal-body">
              <p className="text-muted small mb-3">
                Create a dynamic sponsored ad post that appears across Nexoria Feed, Reels, and Marketplace.
              </p>

              <form onSubmit={handleCreateAdSubmit}>
                <div className="mb-3">
                  <label className="form-label small fw-bold">Brand / Business Name *</label>
                  <input 
                    type="text" 
                    className="form-control"
                    placeholder="e.g. Acme Innovations"
                    value={brandName}
                    onChange={e => setBrandName(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-bold">Headline *</label>
                  <input 
                    type="text" 
                    className="form-control"
                    placeholder="e.g. Discover 50% Off On New Summer Tech"
                    value={headline}
                    onChange={e => setHeadline(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-bold">Description</label>
                  <textarea 
                    className="form-control"
                    rows={2}
                    placeholder="Provide details about your product or offer..."
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-bold">Image / Banner URL (Optional)</label>
                  <input 
                    type="url" 
                    className="form-control"
                    placeholder="https://images.unsplash.com/..."
                    value={mediaUrl}
                    onChange={e => setMediaUrl(e.target.value)}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-bold">Destination Website URL *</label>
                  <input 
                    type="url" 
                    className="form-control"
                    placeholder="https://yourwebsite.com"
                    value={targetUrl}
                    onChange={e => setTargetUrl(e.target.value)}
                    required
                  />
                </div>

                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <label className="form-label small fw-bold">Category</label>
                    <select 
                      className="form-select form-select-sm"
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                    >
                      <option value="Technology">Technology</option>
                      <option value="Shopping">Shopping</option>
                      <option value="Fashion">Fashion</option>
                      <option value="Food & Dining">Food & Dining</option>
                      <option value="Entertainment">Entertainment</option>
                      <option value="Travel">Travel</option>
                    </select>
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-bold">Call To Action</label>
                    <select 
                      className="form-select form-select-sm"
                      value={callToAction}
                      onChange={e => setCallToAction(e.target.value)}
                    >
                      <option value="Learn More">Learn More</option>
                      <option value="Shop Now">Shop Now</option>
                      <option value="Try Free">Try Free</option>
                      <option value="Download">Download</option>
                      <option value="Order Now">Order Now</option>
                    </select>
                  </div>
                </div>

                <div className="d-flex gap-2 mt-4">
                  <button 
                    type="button" 
                    className="btn btn-secondary rounded-pill w-100"
                    onClick={() => setShowCreateAdModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary rounded-pill w-100 fw-bold"
                    disabled={isCreatingAd}
                  >
                    {isCreatingAd ? "Publishing..." : "Launch Campaign"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <ChatDrawer activeChat={activeChat} onClose={() => setActiveChat(null)} />

      <div className="mobile-bottom-nav">
        <MenuIcons />
      </div>
    </div>
  );
};

export default AdActivity;