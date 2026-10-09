import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Header from "./Header";
import Stories from "./Stories";
import Post from "./Post";
import ChatDrawer from "./ChatDrawer";
import CreateStory from "./CreateStory";
import MenuIcons from "./MenuIcons";
import CreatePostModal from "./CreatePostModal";
import PulseLoungeModal from "./PulseLoungeModal";
import CreatorVaultModal from "./CreatorVaultModal";
import ZenSoundPlayer from "./ZenSoundPlayer";
import FeedAiSummaryModal from "./FeedAiSummaryModal";
import HyperlocalHubModal from "./HyperlocalHubModal";
import AudioHangoutModal from "./AudioHangoutModal";
import WatchPartyModal from "./WatchPartyModal";
import KeywordFilterModal from "./KeywordFilterModal";
import MicroTipModal from "./MicroTipModal";

import { 
  BsCameraVideoFill, BsImages, BsChevronDown, BsChevronUp,
  BsPeopleFill, BsBookmarkFill, BsShop, BsPlayBtn, 
  BsClockHistory, BsFlagFill, BsCalendar2EventFill, BsRssFill,
  BsSearch, BsThreeDots, BsStars, BsGeoAltFill,
  BsBroadcast, BsTvFill, BsFilterCircleFill, BsStarFill
} from "react-icons/bs";
import { 
  getActiveUserId, getUserStorageItem, getActiveUserName, 
  getActiveUserFirstName, fetchGlobalFeedPostsApi 
} from "../services/profileApi";
import { fetchChatContactsApi } from "../services/chatApi";

import "./css/Home.css";

const INITIAL_POSTS = [
  {
    id: 1,
    name: "Rk Kardam",
    profile: "https://i.pravatar.cc/40?img=8",
    time: "2h ago",
    caption: "Great discussions today on tech, community development and innovation! 🚀 Always inspiring to connect with like-minded creators.",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=700",
    likesCount: 142,
    commentsCount: 28,
    sharesCount: 12,
    userReaction: "like",
    comments: [
      { id: 101, name: "Vijay Sagar", profile: "https://i.pravatar.cc/40?img=1", text: "Truly inspiring session brother! 🔥", time: "1h ago", likes: 4 },
      { id: 102, name: "Sahil Paswan", profile: "https://i.pravatar.cc/40?img=9", text: "Great capture! 👏", time: "30m ago", likes: 1 }
    ]
  },
  {
    id: 2,
    name: "Sahil Paswan",
    profile: "https://i.pravatar.cc/40?img=9",
    time: "4h ago",
    caption: "Weekend getaway with best friends! Nature always heals the soul ❤️🌿",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=700",
    likesCount: 89,
    commentsCount: 14,
    sharesCount: 5,
    userReaction: null,
    comments: [
      { id: 201, name: "Amit Kumar", profile: "https://i.pravatar.cc/40?img=3", text: "Location please? Looks breathtaking!", time: "2h ago", likes: 2 }
    ]
  },
  {
    id: 3,
    name: "Alex Morgan",
    profile: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
    time: "1d ago",
    caption: "Building the next-generation social experience with React & FastAPI! 🚀 Fully responsive and lightning fast with zero algorithms.",
    background: "linear-gradient(135deg, #1877f2 0%, #00d2ff 100%)",
    likesCount: 230,
    commentsCount: 45,
    sharesCount: 19,
    userReaction: "love",
    comments: [
      { id: 301, name: "Priya Sharma", profile: "https://i.pravatar.cc/40?img=4", text: "This UI looks phenomenal! 🔥", time: "12h ago", likes: 8 }
    ]
  }
];

function Home() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const currentUserId = getActiveUserId();
  
  const [posts, setPosts] = useState(() => {
    try {
      const saved = localStorage.getItem("nexoria_feed_posts");
      return saved ? JSON.parse(saved) : INITIAL_POSTS;
    } catch {
      return INITIAL_POSTS;
    }
  });

  const [activeChat, setActiveChat] = useState(null);
  const [onlineContacts, setOnlineContacts] = useState([]);

  useEffect(() => {
    let isMounted = true;
    if (currentUserId) {
      fetchChatContactsApi(currentUserId).then((res) => {
        if (isMounted && res.success && res.data) {
          setOnlineContacts(res.data);
        }
      });
    }
    return () => { isMounted = false; };
  }, [currentUserId]);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [showCreateStoryModal, setShowCreateStoryModal] = useState(false);
  const [showLeftMore, setShowLeftMore] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("nexoria_theme") === "dark");
  const [zenMode, setZenMode] = useState(false);

  // Pillar 1: Custom Feed Mode ("chrono" | "ai" | "friends")
  const [feedMode, setFeedMode] = useState(() => localStorage.getItem("nexoria_feed_mode") || "chrono");

  // Pillar 1 & 2: Flagship Modals State
  const [showAiSummaryModal, setShowAiSummaryModal] = useState(false);
  const [showHyperlocalModal, setShowHyperlocalModal] = useState(false);
  const [showAudioHangoutModal, setShowAudioHangoutModal] = useState(false);
  const [showWatchPartyModal, setShowWatchPartyModal] = useState(false);
  const [showKeywordFilterModal, setShowKeywordFilterModal] = useState(false);
  const [tipModalPost, setTipModalPost] = useState(null);

  // Legacy modals
  const [showPulseLoungeModal, setShowPulseLoungeModal] = useState(false);
  const [showCreatorVaultModal, setShowCreatorVaultModal] = useState(false);
  const [showZenPlayer, setShowZenPlayer] = useState(false);

  // Keyword filters list
  const [keywordFilters, setKeywordFilters] = useState(() => {
    try {
      const saved = localStorage.getItem("nexoria_keyword_filters");
      return saved ? JSON.parse(saved) : ["politics", "spoilers", "toxicity"];
    } catch {
      return ["politics", "spoilers", "toxicity"];
    }
  });

  const activeUserId = getActiveUserId();
  const [userName, setUserName] = useState(() => getActiveUserName());
  const [userPic, setUserPic] = useState(() => getUserStorageItem("avatar", `https://i.pravatar.cc/150?u=${activeUserId}`, activeUserId));

  const loadFeedPosts = React.useCallback(async () => {
    try {
      const res = await fetchGlobalFeedPostsApi(currentUserId);
      if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
        setPosts(res.data);
      }
    } catch (err) {
      console.warn("Feed load error:", err);
    }
  }, [currentUserId]);

  useEffect(() => {
    loadFeedPosts();
  }, [loadFeedPosts]);

  useEffect(() => {
    const handleProfileUpdated = () => {
      const currentId = getActiveUserId();
      setUserPic(getUserStorageItem("avatar", `https://i.pravatar.cc/150?u=${currentId}`, currentId));
      setUserName(getActiveUserName());
      loadFeedPosts();
    };
    window.addEventListener("profile-updated", handleProfileUpdated);
    return () => window.removeEventListener("profile-updated", handleProfileUpdated);
  }, [loadFeedPosts]);

  useEffect(() => {
    localStorage.setItem("nexoria_feed_posts", JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem("nexoria_feed_mode", feedMode);
  }, [feedMode]);

  useEffect(() => {
    const openPostHandler = () => setShowCreatePostModal(true);
    const postCreatedHandler = (e) => {
      if (e.detail) {
        setPosts((prev) => [e.detail, ...prev.filter(p => p.id !== e.detail.id)]);
      }
      loadFeedPosts();
    };
    const openPulseHandler = () => setShowPulseLoungeModal(true);
    const openVaultHandler = () => setShowCreatorVaultModal(true);
    const openZenHandler = () => setShowZenPlayer(prev => !prev);
    const openAiSummaryHandler = () => setShowAiSummaryModal(true);
    const openHyperlocalHandler = () => setShowHyperlocalModal(true);

    window.addEventListener("open-create-post", openPostHandler);
    window.addEventListener("post-created", postCreatedHandler);
    window.addEventListener("open-pulse-lounge", openPulseHandler);
    window.addEventListener("open-creator-vault", openVaultHandler);
    window.addEventListener("open-zen-player", openZenHandler);
    window.addEventListener("open-ai-summary", openAiSummaryHandler);
    window.addEventListener("open-hyperlocal", openHyperlocalHandler);

    return () => {
      window.removeEventListener("open-create-post", openPostHandler);
      window.removeEventListener("post-created", postCreatedHandler);
      window.removeEventListener("open-pulse-lounge", openPulseHandler);
      window.removeEventListener("open-creator-vault", openVaultHandler);
      window.removeEventListener("open-zen-player", openZenHandler);
      window.removeEventListener("open-ai-summary", openAiSummaryHandler);
      window.removeEventListener("open-hyperlocal", openHyperlocalHandler);
    };
  }, [loadFeedPosts]);

  // Filter and Sort Posts based on Auto-Expiry, Keyword Blocklist & Feed Mode
  const filteredPosts = posts
    .filter((post) => {
      // 1. Filter out expired posts
      if (post.expiresAt && Date.now() > post.expiresAt) {
        return false;
      }
      // 2. Keyword mute filter
      if (keywordFilters && keywordFilters.length > 0) {
        const text = (post.caption || "").toLowerCase();
        const isBlocked = keywordFilters.some(
          (k) => k.trim() && text.includes(k.trim().toLowerCase())
        );
        if (isBlocked) return false;
      }
      // 3. Friends only mode filter
      if (feedMode === "friends") {
        if (post.isGhost) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (feedMode === "chrono") {
        return b.id - a.id;
      }
      if (feedMode === "ai") {
        const scoreA = (a.likesCount || 0) * 2 + (a.commentsCount || 0) * 3;
        const scoreB = (b.likesCount || 0) * 2 + (b.commentsCount || 0) * 3;
        return scoreB - scoreA;
      }
      return b.id - a.id;
    });

  return (
    <div className={`fb-home-root ${zenMode ? "zen-mode-active" : ""}`}>
      {/* Top Navigation Bar */}
      <Header 
        onOpenChat={setActiveChat} 
        darkMode={darkMode} 
        setDarkMode={setDarkMode}
        zenMode={zenMode}
        setZenMode={setZenMode}
      />

      {/* 3-Column Main Body */}
      <div className="fb-layout-body">
        
        {/* LEFT SIDEBAR (Desktop) */}
        {!zenMode && (
          <aside className="fb-left-sidebar">
            <div className="sidebar-shortcut-item" onClick={() => navigate("/profile")}>
              <img src={userPic} alt="" className="sidebar-avatar" />
              <span className="shortcut-label"><strong>{userName}</strong></span>
            </div>

            <div className="sidebar-shortcut-item" onClick={() => navigate("/friends")}>
              <div className="sidebar-icon-circle" style={{ color: "#1877f2" }}>
                <BsPeopleFill />
              </div>
              <span className="shortcut-label">{t("friends")}</span>
            </div>

            <div className="sidebar-shortcut-item" onClick={() => navigate("/reels")}>
              <div className="sidebar-icon-circle" style={{ color: "#f02849" }}>
                <BsPlayBtn />
              </div>
              <span className="shortcut-label">{t("video_reels")}</span>
            </div>

            <div className="sidebar-shortcut-item" onClick={() => navigate("/market")}>
              <div className="sidebar-icon-circle" style={{ color: "#00a884" }}>
                <BsShop />
              </div>
              <span className="shortcut-label">{t("marketplace")}</span>
            </div>

            <div className="sidebar-shortcut-item" onClick={() => setShowHyperlocalModal(true)}>
              <div className="sidebar-icon-circle" style={{ color: "#f59e0b" }}>
                <BsGeoAltFill />
              </div>
              <span className="shortcut-label">Hyperlocal Hub</span>
            </div>

            <div className="sidebar-shortcut-item" onClick={() => setShowAudioHangoutModal(true)}>
              <div className="sidebar-icon-circle" style={{ color: "#8b5cf6" }}>
                <BsBroadcast />
              </div>
              <span className="shortcut-label">Audio Lounge</span>
            </div>

            <div className="sidebar-shortcut-item" onClick={() => setShowWatchPartyModal(true)}>
              <div className="sidebar-icon-circle" style={{ color: "#ec4899" }}>
                <BsTvFill />
              </div>
              <span className="shortcut-label">Watch Party</span>
            </div>

            <div className="sidebar-shortcut-item" onClick={() => setShowKeywordFilterModal(true)}>
              <div className="sidebar-icon-circle" style={{ color: "#64748b" }}>
                <BsFilterCircleFill />
              </div>
              <span className="shortcut-label">Content Shield</span>
            </div>

            <div className="sidebar-shortcut-item" onClick={() => setShowCreatorVaultModal(true)}>
              <div className="sidebar-icon-circle" style={{ color: "#eab308" }}>
                <BsStarFill />
              </div>
              <span className="shortcut-label">Creator Star Vault</span>
            </div>

            {showLeftMore && (
              <>
                <div className="sidebar-shortcut-item" onClick={() => navigate("/saved")}>
                  <div className="sidebar-icon-circle" style={{ color: "#a033ff" }}>
                    <BsBookmarkFill />
                  </div>
                  <span className="shortcut-label">{t("saved")}</span>
                </div>

                <div className="sidebar-shortcut-item" onClick={() => navigate("/memories")}>
                  <div className="sidebar-icon-circle" style={{ color: "#1877f2" }}>
                    <BsClockHistory />
                  </div>
                  <span className="shortcut-label">{t("memories")}</span>
                </div>

                <div className="sidebar-shortcut-item" onClick={() => navigate("/pages")}>
                  <div className="sidebar-icon-circle" style={{ color: "#f5533d" }}>
                    <BsFlagFill />
                  </div>
                  <span className="shortcut-label">{t("pages")}</span>
                </div>

                <div className="sidebar-shortcut-item" onClick={() => navigate("/events")}>
                  <div className="sidebar-icon-circle" style={{ color: "#f7b125" }}>
                    <BsCalendar2EventFill />
                  </div>
                  <span className="shortcut-label">{t("events")}</span>
                </div>

                <div className="sidebar-shortcut-item" onClick={() => navigate("/feeds")}>
                  <div className="sidebar-icon-circle" style={{ color: "#2bb673" }}>
                    <BsRssFill />
                  </div>
                  <span className="shortcut-label">{t("feeds")}</span>
                </div>
              </>
            )}

            <div className="sidebar-shortcut-item see-more-row" onClick={() => setShowLeftMore(!showLeftMore)}>
              <div className="sidebar-icon-circle">
                {showLeftMore ? <BsChevronUp /> : <BsChevronDown />}
              </div>
              <span className="shortcut-label">{showLeftMore ? "See less" : "See more"}</span>
            </div>

            <hr className="sidebar-divider" />

            {/* Shortcuts section */}
            <div className="sidebar-sub-title">Your shortcuts</div>
            <div className="sidebar-shortcut-item">
              <img src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=100" alt="" className="shortcut-square-img" />
              <span className="shortcut-label">Nexoria Full Stack Creators</span>
            </div>
          </aside>
        )}

        {/* CENTER MAIN FEED */}
        <main className={`fb-center-feed ${zenMode ? "zen-feed" : ""}`}>
          {/* Stories Tray */}
          <Stories onOpenCreateStory={() => setShowCreateStoryModal(true)} />

          {/* NEXT-GEN FLAGSHIP DISCOVERY RIBBON */}
          <div className="nx-flagship-discovery-ribbon shadow-sm">
            {/* 1. 2-Minute AI Feed Daily Briefing */}
            <button 
              className="nx-flagship-pill summary-pill"
              onClick={() => setShowAiSummaryModal(true)}
              title="2-Minute AI Feed Catch-Up & Daily Briefing"
            >
              <span className="pill-icon">⚡</span>
              <div className="pill-text">
                <strong>2-Min AI Catch-Up</strong>
                <small>Daily Briefing</small>
              </div>
            </button>

            {/* 2. Hyperlocal Neighborhood Hub */}
            <button 
              className="nx-flagship-pill hyperlocal-pill"
              onClick={() => setShowHyperlocalModal(true)}
              title="Pincode & Neighborhood Local Spaces"
            >
              <span className="pill-icon">📍</span>
              <div className="pill-text">
                <strong>Hyperlocal Spaces</strong>
                <small>Pin 110001</small>
              </div>
            </button>

            {/* 3. Audio Hangout Lounge */}
            <button 
              className="nx-flagship-pill pulse-pill"
              onClick={() => setShowAudioHangoutModal(true)}
              title="Tap-to-Talk Micro-Community Hangout"
            >
              <span className="pulse-dot-anim"></span>
              <span className="pill-icon">🎙️</span>
              <div className="pill-text">
                <strong>Audio Lounge</strong>
                <small>32 Live</small>
              </div>
            </button>

            {/* 4. Watch Party Room */}
            <button 
              className="nx-flagship-pill watchparty-pill"
              onClick={() => setShowWatchPartyModal(true)}
              title="Synchronized Video Lounge & Live Chat"
            >
              <span className="pill-icon">🎬</span>
              <div className="pill-text">
                <strong>Watch Party</strong>
                <small>Sync Video</small>
              </div>
            </button>

            {/* 5. Keyword & Toxicity Shield */}
            <button 
              className="nx-flagship-pill shield-pill"
              onClick={() => setShowKeywordFilterModal(true)}
              title="Smart Content & Keyword Mute Filter"
            >
              <span className="pill-icon">🛡️</span>
              <div className="pill-text">
                <strong>Content Shield</strong>
                <small>{keywordFilters.length} Active</small>
              </div>
            </button>

            {/* 6. Creator Rewards & Coin Vault */}
            <button 
              className="nx-flagship-pill vault-pill"
              onClick={() => setShowCreatorVaultModal(true)}
              title="NX Coins & Gamified Creator Level"
            >
              <span className="pill-icon">🪙</span>
              <div className="pill-text">
                <strong>14.8K NX Coins</strong>
                <small>Level 14 Master</small>
              </div>
            </button>
          </div>

          {/* Create Post Trigger Box */}
          <div className="fb-create-post-box shadow-sm">
            <div className="create-post-top-row">
              <img src={userPic} alt="" className="post-creator-avatar" onClick={() => navigate("/profile")} />
              <div 
                className="create-post-input-trigger"
                onClick={() => setShowCreatePostModal(true)}
              >
                <span>{t("whats_on_mind")}, {getActiveUserFirstName("there")}?</span>
              </div>
            </div>

            <hr className="create-post-divider" />

            <div className="create-post-action-buttons">
              <div className="post-action-item" onClick={() => setShowCreatePostModal(true)}>
                <BsCameraVideoFill className="text-danger action-btn-icon" />
                <span>{t("live_video")}</span>
              </div>

              <div className="post-action-item" onClick={() => setShowCreatePostModal(true)}>
                <BsImages className="text-success action-btn-icon" />
                <span>{t("photo_video")}</span>
              </div>

              <div className="post-action-item ai-sparkle-trigger" onClick={() => setShowCreatePostModal(true)}>
                <BsStars className="text-primary action-btn-icon" />
                <span className="font-weight-bold">✨ AI Post Studio</span>
              </div>
            </div>
          </div>

          {/* CUSTOM FEED SWITCHER (Pillar 1: Zero-Algorithm vs AI Smart vs Friends) */}
          <div className="feed-mode-switcher-bar shadow-sm">
            <button 
              className={`feed-mode-tab ${feedMode === "chrono" ? "active" : ""}`}
              onClick={() => setFeedMode("chrono")}
              title="Pure chronological feed with 0 algorithmic manipulation"
            >
              <BsClockHistory className="me-1" />
              <span>⏱️ 0-Algorithm Chrono</span>
            </button>

            <button 
              className={`feed-mode-tab ${feedMode === "ai" ? "active" : ""}`}
              onClick={() => setFeedMode("ai")}
              title="Interest & Virality Based AI Feed"
            >
              <BsStars className="me-1" />
              <span>🧠 AI Smart Feed</span>
            </button>

            <button 
              className={`feed-mode-tab ${feedMode === "friends" ? "active" : ""}`}
              onClick={() => setFeedMode("friends")}
              title="Only verified friends updates"
            >
              <BsPeopleFill className="me-1" />
              <span>👥 Friends Only</span>
            </button>
          </div>

          {/* Posts Feed */}
          <Post 
            posts={filteredPosts} 
            setPosts={setPosts} 
            onOpenChat={setActiveChat} 
            onOpenTipModal={(p) => setTipModalPost(p)}
          />

          {/* Anti-Doomscroll Barrier & Digital Wellbeing Card */}
          <div className="anti-doomscroll-barrier-card shadow-sm">
            <div className="barrier-icon-badge">✨</div>
            <h5>You're All Caught Up!</h5>
            <p>You've seen every genuine update from your friends and local neighborhood. Nexoria does not use infinite addictive dark patterns.</p>
            <div className="barrier-action-btns">
              <button className="barrier-btn primary" onClick={() => navigate("/time-management")}>
                🧘 Check Screen Time (24m Today)
              </button>
              <button className="barrier-btn secondary" onClick={() => setShowZenPlayer(true)}>
                🎧 Focus with Zen Audio
              </button>
            </div>
          </div>
        </main>

        {/* RIGHT SIDEBAR (Desktop) */}
        {!zenMode && (
          <aside className="fb-right-sidebar">
            {/* Community Creator Spotlight (No Ads Model) */}
            <div className="d-flex align-items-center justify-content-between px-2 pt-1">
              <span className="right-section-title p-0">Creator Spotlight</span>
              <span className="ad-free-badge">100% Ad-Free</span>
            </div>
            
            <div className="sponsored-card creator-spotlight-card" onClick={() => navigate("/profile")}>
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200" alt="Creator" className="sponsored-img rounded-circle" style={{ width: "44px", height: "44px", objectFit: "cover" }} />
              <div className="sponsored-info">
                <h6>Aarav Sharma · AI Creator</h6>
                <p>90% Rev-Share • 14.2K Followers</p>
              </div>
            </div>

            <div className="sponsored-card creator-spotlight-card" onClick={() => navigate("/profile")}>
              <img src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=200" alt="Creator" className="sponsored-img rounded-circle" style={{ width: "44px", height: "44px", objectFit: "cover" }} />
              <div className="sponsored-info">
                <h6>Himalayan Wanderer</h6>
                <p>Zero-Suppression Reach • Delhi</p>
              </div>
            </div>

            <hr className="sidebar-divider" />

            {/* Birthdays Widget */}
            <div className="right-section-title">Birthdays</div>
            <div className="birthday-card">
              <span className="birthday-gift-icon">🎁</span>
              <p><strong>Rahul Verma</strong> and <strong>2 others</strong> have birthdays today.</p>
            </div>

            <hr className="sidebar-divider" />

            {/* Contacts / Online Friends */}
            <div className="contacts-header-row">
              <span className="right-section-title" style={{ margin: 0 }}>Contacts</span>
              <div className="contacts-action-icons">
                <BsSearch className="c-icon" />
                <BsThreeDots className="c-icon" />
              </div>
            </div>

            <div className="online-contacts-list">
              {onlineContacts.length === 0 ? (
                <div style={{ padding: "10px 14px", color: "var(--color-text-secondary)", fontSize: "12px" }}>
                  No contacts online right now.
                </div>
              ) : (
                onlineContacts.map((c) => {
                  const contactId = c.user_id || c.id;
                  return (
                    <div 
                      key={contactId} 
                      className="contact-item-row"
                      onClick={() => setActiveChat({ id: contactId, name: c.name, img: c.img, online: c.online })}
                    >
                      <div className="contact-avatar-wrap">
                        <img 
                          src={c.img || `https://i.pravatar.cc/100?u=${contactId}`} 
                          alt={c.name} 
                          onError={(e) => { e.currentTarget.src = `https://i.pravatar.cc/100?u=${contactId}`; }}
                        />
                        {c.online !== false && <span className="contact-online-dot"></span>}
                      </div>
                      <span className="contact-name">{c.name}</span>
                    </div>
                  );
                })
              )}
            </div>
          </aside>
        )}

      </div>

      {/* Floating Messenger Chat Window */}
      <ChatDrawer activeChat={activeChat} onClose={() => setActiveChat(null)} />

      {/* Fullscreen Create Story Modal */}
      {showCreateStoryModal && <CreateStory onClose={() => setShowCreateStoryModal(false)} />}

      {/* Unified Nexoria Create Post Modal (with Ghost Mode, Auto-Expiry, AI Studio) */}
      {showCreatePostModal && (
        <CreatePostModal onClose={() => setShowCreatePostModal(false)} />
      )}

      {/* 2-Minute AI Feed Daily Briefing Modal */}
      {showAiSummaryModal && (
        <FeedAiSummaryModal onClose={() => setShowAiSummaryModal(false)} />
      )}

      {/* Hyperlocal Pincode & Neighborhood Hub Modal */}
      {showHyperlocalModal && (
        <HyperlocalHubModal onClose={() => setShowHyperlocalModal(false)} />
      )}

      {/* Micro-Community Audio Hangout Modal */}
      {showAudioHangoutModal && (
        <AudioHangoutModal onClose={() => setShowAudioHangoutModal(false)} />
      )}

      {/* Watch Party Synchronized Lounge Modal */}
      {showWatchPartyModal && (
        <WatchPartyModal onClose={() => setShowWatchPartyModal(false)} />
      )}

      {/* Smart Keyword & Toxicity Content Filter Modal */}
      {showKeywordFilterModal && (
        <KeywordFilterModal 
          activeKeywords={keywordFilters}
          onSaveKeywords={(newKeywords) => {
            setKeywordFilters(newKeywords);
            localStorage.setItem("nexoria_keyword_filters", JSON.stringify(newKeywords));
          }}
          onClose={() => setShowKeywordFilterModal(false)} 
        />
      )}

      {/* Direct Micro-Tip Creator Modal (UPI / NX Coins) */}
      {tipModalPost && (
        <MicroTipModal recipient={tipModalPost} onClose={() => setTipModalPost(null)} />
      )}

      {/* Pulse Lounge & Creator Vault */}
      {showPulseLoungeModal && (
        <PulseLoungeModal onClose={() => setShowPulseLoungeModal(false)} />
      )}

      {showCreatorVaultModal && (
        <CreatorVaultModal onClose={() => setShowCreatorVaultModal(false)} />
      )}

      {showZenPlayer && (
        <ZenSoundPlayer 
          onClose={() => setShowZenPlayer(false)} 
          isZenMode={zenMode}
          onToggleZenMode={() => setZenMode(prev => !prev)}
        />
      )}

      {/* Mobile Bottom Navigation Bar */}
      <div className="mobile-bottom-nav">
        <MenuIcons />
      </div>
    </div>
  );
}

export default Home;