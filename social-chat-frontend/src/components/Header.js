import React, { useState, useEffect, useRef } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  BsPlusLg, BsSearch, BsMessenger, BsFileText,
  BsBook, BsChatLeftText, BsChevronDown, 
  BsMoonStarsFill, BsSunFill, BsGearFill, 
  BsBoxArrowRight, BsQuestionCircleFill, BsPlayBtn,
  BsArrowLeft, BsX, BsShieldFillCheck
} from "react-icons/bs";

import Sidebar from "./Sidebar";
import CreatePostModal from "./CreatePostModal";
import CreateStory from "./CreateStory";
import ReelStory from "./ReelStory";
import NewNote from "./NewNote";
import { applyTheme, isDarkActive } from "../utils/theme";
import {
  getActiveUserId,
  getActiveUserName,
  getUserStorageItem,
  setUserStorageItem,
  fetchFullProfileApi
} from "../services/profileApi";
import { fetchConversationsApi, formatMessageTime } from "../services/chatApi";
import { fetchUnreadNotifCountApi } from "../services/notificationApi";

import "./css/Header.css";

function Header({ onOpenChat, darkMode: propDarkMode, setDarkMode: propSetDarkMode }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [openSidebar, setOpenSidebar] = useState(false);
  const [localDarkMode, setLocalDarkMode] = useState(isDarkActive);

  // Synchronize with external prop or global theme event
  const currentDarkMode = propDarkMode !== undefined ? propDarkMode : localDarkMode;

  useEffect(() => {
    const handleThemeChange = (e) => {
      setLocalDarkMode(e.detail.isDark);
    };
    window.addEventListener("nexoria_theme_change", handleThemeChange);
    return () => window.removeEventListener("nexoria_theme_change", handleThemeChange);
  }, []);
  
  // Dropdown States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMessengerMenu, setShowMessengerMenu] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [isMobileSearching, setIsMobileSearching] = useState(false);

  // Subpage Modals
  const [showCreatePostPage, setShowCreatePostPage] = useState(false);
  const [showStoryPage, setShowStoryPage] = useState(false);
  const [showReelPage, setShowReelPage] = useState(false);
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [unreadNotifCount, setUnreadNotifCount] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const updateUnreadCount = async () => {
      const activeId = getActiveUserId();
      if (!activeId) return;
      try {
        const count = await fetchUnreadNotifCountApi(activeId);
        if (isMounted && typeof count === "number") {
          setUnreadNotifCount(count);
        }
      } catch (e) {
        console.error("Failed to fetch unread count:", e);
      }
    };

    updateUnreadCount();
    const interval = setInterval(updateUnreadCount, 8000);
    window.addEventListener("nexoria_notifications_updated", updateUnreadCount);

    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener("nexoria_notifications_updated", updateUnreadCount);
    };
  }, []);

  const headerRef = useRef(null);
  const searchInputRef = useRef(null);
  const currentUserId = getActiveUserId();
  const [userName, setUserName] = useState(() => getActiveUserName());
  const [headerAvatar, setHeaderAvatar] = useState(() => getUserStorageItem("avatar", `https://i.pravatar.cc/150?u=${currentUserId}`, currentUserId));

  useEffect(() => {
    let isMounted = true;
    // Initial fetch from backend to ensure up-to-date avatar
    fetchFullProfileApi(currentUserId).then(res => {
      if (res.success && res.data && res.data.profile_pic && isMounted) {
        setHeaderAvatar(res.data.profile_pic);
        setUserStorageItem("avatar", res.data.profile_pic, currentUserId);
      }
      if (res.success && res.data && isMounted) {
        setUserName(getActiveUserName());
      }
    });

    const handleProfileUpdate = () => {
      const activeId = getActiveUserId();
      const updated = getUserStorageItem("avatar", `https://i.pravatar.cc/150?u=${activeId}`, activeId);
      if (updated) setHeaderAvatar(updated);
      setUserName(getActiveUserName());
    };
    window.addEventListener("profile-updated", handleProfileUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener("profile-updated", handleProfileUpdate);
    };
  }, [currentUserId]);

  const searchData = [
    { id: 1, name: "Vijay Sagar Azad", desc: "Friend · Active now", img: "https://i.pravatar.cc/150?u=1", type: "user" },
    { id: 2, name: "React & Next.js Community", desc: "Public Group · 42K members", icon: "bi-people-fill", type: "group" },
    { id: 3, name: "Marketplace Deals: iPhones & Bikes", desc: "Shop in Delhi", icon: "bi-shop", type: "market" },
    { id: 4, name: "Er AK Yadav", desc: "Friend · Suggested for you", img: "https://i.pravatar.cc/150?u=2", type: "user" },
    { id: 5, name: "Rohit Sharma", desc: "Friend · 5 mutual friends", img: "https://i.pravatar.cc/150?u=13", type: "user" },
    { id: 6, name: "Settings & Privacy", desc: "Preferences", icon: "bi-gear-fill", type: "settings" }
  ];

  const [messengerThreads, setMessengerThreads] = useState([]);

  useEffect(() => {
    let isMounted = true;
    const loadThreads = () => {
      if (currentUserId) {
        fetchConversationsApi(currentUserId).then((res) => {
          if (isMounted && res.success && res.data) {
            setMessengerThreads(res.data);
          }
        });
      }
    };

    loadThreads();

    const handleNewChatMessage = () => {
      loadThreads();
    };

    window.addEventListener("nexoria_new_chat_message", handleNewChatMessage);
    const syncInterval = setInterval(loadThreads, 5000);

    return () => { 
      isMounted = false; 
      window.removeEventListener("nexoria_new_chat_message", handleNewChatMessage);
      clearInterval(syncInterval);
    };
  }, [currentUserId, showMessengerMenu]);

  // Close all dropdowns helper
  const closeAllDropdowns = () => {
    setShowCreateModal(false);
    setShowProfileMenu(false);
    setShowMessengerMenu(false);
    setShowSearchDropdown(false);
    setIsMobileSearching(false);
  };

  const toggleCreateModal = () => {
    const next = !showCreateModal;
    closeAllDropdowns();
    setShowCreateModal(next);
  };

  const toggleMessengerMenu = () => {
    const next = !showMessengerMenu;
    closeAllDropdowns();
    setShowMessengerMenu(next);
  };

  const toggleProfileMenu = () => {
    const next = !showProfileMenu;
    closeAllDropdowns();
    setShowProfileMenu(next);
  };

  const openMobileSearch = () => {
    closeAllDropdowns();
    setIsMobileSearching(true);
  };

  const openDesktopSearch = () => {
    closeAllDropdowns();
    setShowSearchDropdown(true);
    searchInputRef.current?.focus();
  };

  // Close all dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (headerRef.current && !headerRef.current.contains(e.target)) {
        closeAllDropdowns();
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_id");
    localStorage.removeItem("first_name");
    navigate("/login", { replace: true });
  };

  const toggleDarkMode = () => {
    const newTheme = !currentDarkMode;
    setLocalDarkMode(newTheme);
    if (typeof propSetDarkMode === "function") {
      propSetDarkMode(newTheme);
    }
    applyTheme(newTheme ? "dark" : "light");
  };

  const handleSearchSubmit = (customTerm) => {
    const term = (customTerm !== undefined ? customTerm : searchTerm).trim();
    closeAllDropdowns();
    if (term) {
      // Save to recents
      try {
        const saved = JSON.parse(localStorage.getItem("nexoria_recent_searches")) || [];
        const updated = [term, ...saved.filter(s => s.toLowerCase() !== term.toLowerCase())].slice(0, 10);
        localStorage.setItem("nexoria_recent_searches", JSON.stringify(updated));
      } catch {}
      navigate(`/search?q=${encodeURIComponent(term)}`);
    } else {
      navigate("/search");
    }
  };

  const handleSearchResultClick = (item) => {
    closeAllDropdowns();
    setSearchTerm("");
    if (item.type === "market") {
      navigate("/market");
    } else if (item.type === "settings") {
      navigate("/settings");
    } else if (item.type === "user") {
      navigate("/profile", {
        state: {
          user: {
            id: item.id,
            user_id: item.id,
            name: item.name,
            creatorName: item.name,
            profile: item.img,
            avatar: item.img,
            bio: item.desc || "Nexoria Community Member"
          }
        }
      });
    } else {
      navigate("/friends");
    }
  };

  const filteredSearch = searchData.filter(item => 
    !searchTerm.trim() || item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.desc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <header className="fb-global-header" ref={headerRef}>
      <Sidebar open={openSidebar} setOpen={setOpenSidebar} />

      {/* LEFT SECTION (Logo + Search) */}
      <div className="header-section-left">
        <span className="mobile-menu-trigger" onClick={() => { closeAllDropdowns(); setOpenSidebar(true); }} title="Menu">☰</span>
        
        <div className="brand-logo-container" onClick={() => { closeAllDropdowns(); navigate("/home"); }}>
          <span className="brand-icon">N</span>
          <h2 className="brand-name">Nexoria</h2>
        </div>

        {/* Desktop Search Bar Container */}
        <div className="desktop-search-container">
          <div 
            className={`desktop-search-pill ${showSearchDropdown ? "active" : ""}`}
            onClick={openDesktopSearch}
          >
            <BsSearch className="search-icon" />
            <input 
              ref={searchInputRef}
              type="text" 
              placeholder={t("search_placeholder")} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={openDesktopSearch}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearchSubmit();
                }
              }}
            />
            {searchTerm && (
              <BsX className="search-clear-icon" onClick={(e) => { e.stopPropagation(); setSearchTerm(""); }} />
            )}
          </div>

          {/* Desktop Floating Search Dropdown */}
          {showSearchDropdown && (
            <div className="desktop-search-dropdown shadow-lg">
              {searchTerm.trim() && (
                <div 
                  className="search-result-row search-all-cta"
                  onClick={() => handleSearchSubmit()}
                  style={{ background: "var(--color-primary-soft, rgba(24, 119, 242, 0.1))", marginBottom: 6 }}
                >
                  <div className="search-row-left">
                    <div className="search-row-icon-circle" style={{ background: "var(--color-primary)", color: "#fff" }}>
                      <BsSearch size={14} />
                    </div>
                    <div className="search-row-text">
                      <h6 style={{ color: "var(--color-primary)" }}>Search all for "{searchTerm}"</h6>
                      <p>Open full Omnisearch results hub</p>
                    </div>
                  </div>
                  <i className="bi bi-arrow-right arrow-icon text-primary"></i>
                </div>
              )}

              <div className="dropdown-search-header">
                <span>{searchTerm ? "Top Matches" : "Quick Explore & Recent"}</span>
                {!searchTerm && (
                  <span className="clear-link" onClick={() => navigate("/search")}>Explore All</span>
                )}
              </div>

              <div className="dropdown-search-list">
                {filteredSearch.map(item => (
                  <div 
                    key={item.id} 
                    className="search-result-row"
                    onClick={() => handleSearchResultClick(item)}
                  >
                    <div className="search-row-left">
                      {item.img ? (
                        <img 
                          src={item.img} 
                          alt="" 
                          className="search-row-avatar"
                          onError={(e) => { e.currentTarget.src = "https://i.pravatar.cc/150?u=fallback"; }}
                        />
                      ) : (
                        <div className="search-row-icon-circle">
                          <i className={`bi ${item.icon}`}></i>
                        </div>
                      )}
                      <div className="search-row-text">
                        <h6>{item.name}</h6>
                        <p>{item.desc}</p>
                      </div>
                    </div>
                    <i className="bi bi-arrow-up-left arrow-icon"></i>
                  </div>
                ))}
              </div>

              {/* Trending Tags in Dropdown */}
              {!searchTerm && (
                <div style={{ marginTop: 10, paddingTop: 8, borderTop: "1px solid var(--color-border)" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--color-text-secondary)", marginBottom: 6 }}>
                    🔥 Trending on Nexoria
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                    {["#ZeroAlgorithm", "#TruthGuardAI", "#CreatorEconomy", "#React19"].map(tag => (
                      <span 
                        key={tag} 
                        style={{
                          fontSize: 11.5,
                          background: "var(--color-bg-hover)",
                          padding: "3px 8px",
                          borderRadius: 12,
                          fontWeight: 600,
                          cursor: "pointer"
                        }}
                        onClick={() => handleSearchSubmit(tag)}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* CENTER SECTION (Navigation Tabs) */}
      <nav className="header-section-center">
        <NavLink to="/home" onClick={closeAllDropdowns} className={({ isActive }) => `nav-tab-item ${isActive ? "active" : ""}`} title={t("home")}>
          <i className="bi bi-house-door-fill"></i>
          <span className="nav-active-pill"></span>
        </NavLink>

        <NavLink to="/reels" onClick={closeAllDropdowns} className={({ isActive }) => `nav-tab-item ${isActive ? "active" : ""}`} title={t("video_reels")}>
          <i className="bi bi-play-btn-fill"></i>
          <span className="nav-active-pill"></span>
        </NavLink>

        <NavLink to="/market" onClick={closeAllDropdowns} className={({ isActive }) => `nav-tab-item ${isActive ? "active" : ""}`} title={t("marketplace")}>
          <i className="bi bi-shop"></i>
          <span className="nav-active-pill"></span>
        </NavLink>

        <NavLink to="/friends" onClick={closeAllDropdowns} className={({ isActive }) => `nav-tab-item ${isActive ? "active" : ""}`} title={t("friends")}>
          <i className="bi bi-people-fill"></i>
          <span className="nav-active-pill"></span>
        </NavLink>

        <NavLink to="/notifications" onClick={closeAllDropdowns} className={({ isActive }) => `nav-tab-item ${isActive ? "active" : ""}`} title={t("notifications")}>
          <div className="nav-notif-wrap">
            <i className="bi bi-bell-fill"></i>
            {unreadNotifCount > 0 && <span className="nav-badge-count">{unreadNotifCount}</span>}
          </div>
          <span className="nav-active-pill"></span>
        </NavLink>
      </nav>

      {/* RIGHT SECTION (Create / Messenger / Search / Profile Menu) */}
      <div className="header-section-right">
        {/* Mobile Search Button */}
        <button className="mobile-search-btn" onClick={openMobileSearch} title="Search">
          <BsSearch size={18} />
        </button>

        {/* Plus / Create Icon */}
        <div className="header-circle-btn-wrap">
          <button 
            className={`header-circle-btn ${showCreateModal ? "active" : ""}`}
            title={t("create")}
            onClick={toggleCreateModal}
          >
            <BsPlusLg size={18} />
          </button>

          {showCreateModal && (
            <div className="header-dropdown-menu create-dropdown shadow-lg">
              <h5 className="dropdown-title">{t("create")}</h5>
              <div 
                className="dropdown-row-item" 
                onClick={() => { 
                  closeAllDropdowns();
                  setShowCreatePostPage(true); 
                }}
              >
                <div className="row-icon-circle bg-primary-soft"><BsFileText className="text-primary" /></div>
                <div>
                  <h6>{t("create_post")}</h6>
                  <p>Share a post on your feed</p>
                </div>
              </div>
              <div 
                className="dropdown-row-item" 
                onClick={() => { 
                  closeAllDropdowns();
                  window.dispatchEvent(new CustomEvent("open-pulse-lounge"));
                }}
              >
                <div className="row-icon-circle" style={{ background: "rgba(168, 85, 247, 0.15)", color: "#a855f7", fontSize: "16px" }}>🎙️</div>
                <div>
                  <h6>Pulse Lounge (Live 3D Room)</h6>
                  <p>Start or join spatial voice lounge</p>
                </div>
              </div>
              <div 
                className="dropdown-row-item" 
                onClick={() => { 
                  closeAllDropdowns();
                  window.dispatchEvent(new CustomEvent("open-creator-vault"));
                }}
              >
                <div className="row-icon-circle" style={{ background: "rgba(234, 179, 8, 0.15)", color: "#eab308", fontSize: "16px" }}>⭐</div>
                <div>
                  <h6>Creator Star Vault</h6>
                  <p>Manage Star tips & payouts</p>
                </div>
              </div>
              <div 
                className="dropdown-row-item" 
                onClick={() => { 
                  closeAllDropdowns();
                  setShowStoryPage(true); 
                }}
              >
                <div className="row-icon-circle bg-success-soft"><BsBook className="text-success" /></div>
                <div>
                  <h6>{t("create_story")}</h6>
                  <p>Share a photo or write text</p>
                </div>
              </div>
              <div 
                className="dropdown-row-item" 
                onClick={() => { 
                  closeAllDropdowns();
                  setShowReelPage(true); 
                }}
              >
                <div className="row-icon-circle bg-danger-soft"><BsPlayBtn className="text-danger" /></div>
                <div>
                  <h6>{t("create_reel")}</h6>
                  <p>Share a short video</p>
                </div>
              </div>
              <div 
                className="dropdown-row-item" 
                onClick={() => { 
                  closeAllDropdowns();
                  setIsNoteOpen(true); 
                }}
              >
                <div className="row-icon-circle bg-info-soft"><BsChatLeftText className="text-info" /></div>
                <div>
                  <h6>{t("create_note")}</h6>
                  <p>Share a thought with friends</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Messenger Icon */}
        <div className="header-circle-btn-wrap">
          <button 
            className={`header-circle-btn ${showMessengerMenu ? "active" : ""}`}
            title={t("messages")}
            onClick={toggleMessengerMenu}
          >
            <BsMessenger size={18} />
            <span className="btn-badge-dot"></span>
          </button>

          {showMessengerMenu && (
            <div className="header-dropdown-menu messenger-dropdown shadow-lg">
              <div className="dropdown-title-row">
                <h5>{t("messages")}</h5>
                <span className="see-all-link" onClick={() => { closeAllDropdowns(); navigate("/friends"); }}>See all</span>
              </div>
              <div className="messenger-threads-list">
                {messengerThreads.length === 0 ? (
                  <div style={{ padding: "16px 12px", textAlign: "center", color: "var(--color-text-secondary)", fontSize: "12.5px" }}>
                    No recent messages. Start a live chat with your friends! 💬
                  </div>
                ) : (
                  messengerThreads.map(t => {
                    const partnerId = t.other_user_id || t.id;
                    const partnerName = t.other_user_name || t.name;
                    const partnerImg = t.other_user_img || t.img || `https://i.pravatar.cc/100?u=${partnerId}`;
                    const preview = t.last_message || t.msg || "Active chat";
                    const isUnread = t.unread_count > 0 || Boolean(t.unread);

                    return (
                      <div 
                        key={t.id || partnerId} 
                        className="thread-item"
                        onClick={() => {
                          closeAllDropdowns();
                          onOpenChat?.({ id: partnerId, name: partnerName, img: partnerImg, online: t.online });
                        }}
                      >
                        <div className="thread-avatar-wrap">
                          <img src={partnerImg} alt={partnerName} />
                          {t.online !== false && <span className="online-indicator"></span>}
                        </div>
                        <div className="thread-info">
                          <h6>{partnerName}</h6>
                          <p>{preview} · {formatMessageTime(t.updated_at || t.last_message_time || t.time) || "Just now"}</p>
                        </div>
                        {isUnread && <span className="unread-blue-dot"></span>}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar & Dropdown */}
        <div className="header-circle-btn-wrap">
          <div 
            className="user-profile-button"
            onClick={toggleProfileMenu}
          >
            <img src={headerAvatar} alt="Profile" className="header-avatar-img" />
            <span className="avatar-chevron"><BsChevronDown size={11} /></span>
          </div>

          {showProfileMenu && (
            <div className="header-dropdown-menu profile-dropdown shadow-lg">
              {/* Profile Card */}
              <div 
                className="profile-menu-user-card"
                onClick={() => {
                  closeAllDropdowns();
                  navigate("/profile");
                }}
              >
                <img src={headerAvatar} alt="" className="menu-card-avatar" />
                <div className="menu-card-details">
                  <h5>{userName}</h5>
                  <p>See your profile</p>
                </div>
              </div>

              <div className="dropdown-divider"></div>

              {/* Dark Mode Switcher Item */}
              <div className="profile-menu-action-item" onClick={toggleDarkMode}>
                <div className="menu-icon-circle">
                  {currentDarkMode ? <BsSunFill className="text-warning" /> : <BsMoonStarsFill />}
                </div>
                <div className="action-text">
                  <h6>{currentDarkMode ? t("light_mode") : t("dark_mode")}</h6>
                  <p>{currentDarkMode ? "Switch to light appearance" : "Switch to dark appearance"}</p>
                </div>
                <div className={`theme-toggle-switch ${currentDarkMode ? "on" : ""}`}>
                  <div className="switch-thumb"></div>
                </div>
              </div>

              {/* Settings */}
              <div 
                className="profile-menu-action-item"
                onClick={() => {
                  closeAllDropdowns();
                  navigate("/settings");
                }}
              >
                <div className="menu-icon-circle"><BsGearFill /></div>
                <div className="action-text">
                  <h6>{t("settings")}</h6>
                </div>
              </div>

              {/* Security & Anti-Hack Shield */}
              <div 
                className="profile-menu-action-item"
                onClick={() => {
                  closeAllDropdowns();
                  navigate("/security");
                }}
              >
                <div className="menu-icon-circle text-success"><BsShieldFillCheck /></div>
                <div className="action-text">
                  <h6>{t("security_shield")}</h6>
                  <p className="text-success fw-bold" style={{ fontSize: "0.75rem", margin: 0 }}>98% Ironclad Protected</p>
                </div>
              </div>

              {/* Help & Support */}
              <div 
                className="profile-menu-action-item"
                onClick={() => {
                  closeAllDropdowns();
                  navigate("/support");
                }}
              >
                <div className="menu-icon-circle"><BsQuestionCircleFill /></div>
                <div className="action-text">
                  <h6>Help & support</h6>
                </div>
              </div>

              <div className="dropdown-divider"></div>

              {/* Logout */}
              <div className="profile-menu-action-item logout-item" onClick={handleLogout}>
                <div className="menu-icon-circle logout-icon"><BsBoxArrowRight /></div>
                <div className="action-text">
                  <h6>{t("logout")}</h6>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MOBILE FULLSCREEN SEARCH OVERLAY */}
      {isMobileSearching && (
        <div className="mobile-search-overlay-view">
          <div className="mobile-search-nav">
            <BsArrowLeft 
              size={22}
              className="back-icon"
              onClick={() => { setIsMobileSearching(false); setSearchTerm(""); }}
            />
            <div className="mobile-search-input-pill">
              <BsSearch className="search-icon" />
              <input 
                type="text" 
                placeholder="Search Nexoria..." 
                autoFocus 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearchSubmit();
                  }
                }}
              />
              {searchTerm && (
                <BsX className="search-clear-icon" onClick={() => setSearchTerm("")} />
              )}
            </div>
            <button
              style={{
                background: "var(--color-primary, #1877f2)",
                color: "#ffffff",
                border: "none",
                borderRadius: 20,
                padding: "6px 14px",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer"
              }}
              onClick={() => handleSearchSubmit()}
            >
              Search
            </button>
          </div>

          <div className="mobile-search-results-list">
            {searchTerm.trim() && (
              <div 
                className="search-result-row search-all-cta"
                onClick={() => handleSearchSubmit()}
                style={{ background: "var(--color-primary-soft, rgba(24, 119, 242, 0.1))", marginBottom: 8, padding: 12 }}
              >
                <div className="search-row-left">
                  <div className="search-row-icon-circle" style={{ background: "var(--color-primary)", color: "#fff" }}>
                    <BsSearch size={14} />
                  </div>
                  <div className="search-row-text">
                    <h6 style={{ color: "var(--color-primary)" }}>Search all for "{searchTerm}"</h6>
                    <p>Open full Omnisearch results hub</p>
                  </div>
                </div>
                <i className="bi bi-arrow-right arrow-icon text-primary"></i>
              </div>
            )}

            <div className="dropdown-search-header">
              <span>{searchTerm ? "Top Matches" : "Quick Explore & Trending"}</span>
            </div>
            
            {filteredSearch.map(item => (
              <div 
                key={item.id} 
                className="search-result-row"
                onClick={() => handleSearchResultClick(item)}
              >
                <div className="search-row-left">
                  {item.img ? (
                    <img 
                      src={item.img} 
                      alt="" 
                      className="search-row-avatar"
                      onError={(e) => { e.currentTarget.src = "https://i.pravatar.cc/150?u=fallback"; }}
                    />
                  ) : (
                    <div className="search-row-icon-circle">
                      <i className={`bi ${item.icon}`}></i>
                    </div>
                  )}
                  <div className="search-row-text">
                    <h6>{item.name}</h6>
                    <p>{item.desc}</p>
                  </div>
                </div>
                <i className="bi bi-arrow-up-left arrow-icon"></i>
              </div>
            ))}

            {!searchTerm && (
              <div style={{ marginTop: 16, padding: "12px 6px" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-secondary)", marginBottom: 8 }}>
                  🔥 Trending Topics on Nexoria
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {["#ZeroAlgorithm", "#TruthGuardAI", "#CreatorEconomy", "#React19", "#HyperlocalDelhi"].map(tag => (
                    <span 
                      key={tag} 
                      style={{
                        fontSize: 12.5,
                        background: "var(--color-bg-hover)",
                        padding: "6px 12px",
                        borderRadius: 16,
                        fontWeight: 600,
                        cursor: "pointer"
                      }}
                      onClick={() => handleSearchSubmit(tag)}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Subpage Modals */}
      {showCreatePostPage && <CreatePostModal onClose={() => setShowCreatePostPage(false)} />}
      {showStoryPage && <CreateStory onClose={() => setShowStoryPage(false)} />}
      {showReelPage && <ReelStory onClose={() => setShowReelPage(false)} />}
      {isNoteOpen && <NewNote onClose={() => setIsNoteOpen(false)} />}
    </header>
  );
}

export default Header;