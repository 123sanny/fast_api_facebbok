import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import MenuIcons from "./MenuIcons";
import ChatDrawer from "./ChatDrawer";
import {
  BsCheck2All, BsThreeDots, BsTrash3, BsBellSlash, BsEyeFill,
  BsSearch, BsShieldLockFill, BsHeartFill, BsChatFill,
  BsPersonPlusFill, BsGiftFill, BsLightningChargeFill,
  BsGearFill, BsX, BsCheckCircleFill, BsBellFill
} from "react-icons/bs";
import { getActiveUserId } from "../services/profileApi";
import {
  fetchNotificationsApi,
  toggleNotifReadApi,
  markAllNotifsReadApi,
  clearReadNotifsApi,
  clearAllNotifsApi,
  deleteNotifApi,
  fetchNotifSettingsApi,
  updateNotifSettingsApi
} from "../services/notificationApi";
import { acceptFriendRequestApi, rejectFriendRequestApi } from "../services/friendApi";
import "./css/Notifications.css";

function Notifications() {
  const navigate = useNavigate();
  const currentUserId = Number(getActiveUserId());

  // Dynamic state
  const [notifs, setNotifs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filterTab, setFilterTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [activeChat, setActiveChat] = useState(null);
  const [isDndEnabled, setIsDndEnabled] = useState(() => localStorage.getItem("nexoria_notif_dnd") === "true");
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Notification Preferences State
  const [preferences, setPreferences] = useState({
    profileViews: true,
    tips: true,
    comments: true,
    friendRequests: true,
    securityAlerts: true,
    likes: true,
    messages: true,
    sounds: true
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // ============================================================================
  // 1. FETCH DYNAMIC NOTIFICATIONS FROM FASTAPI DATABASE
  // ============================================================================
  const loadNotifications = useCallback(async (showLoading = false) => {
    if (!currentUserId) return;
    if (showLoading) setIsLoading(true);
    const res = await fetchNotificationsApi(currentUserId);
    if (res && res.data) {
      setNotifs(res.data);
      setUnreadCount(res.unread_count || 0);
    }
    if (showLoading) setIsLoading(false);
  }, [currentUserId]);

  useEffect(() => {
    loadNotifications(true);

    // Fetch real notification settings
    fetchNotifSettingsApi(currentUserId).then((res) => {
      if (res && res.success && res.data) {
        setPreferences(res.data);
      }
    });

    const handleNotifsUpdate = () => {
      loadNotifications(false);
    };

    window.addEventListener("nexoria_notifications_updated", handleNotifsUpdate);
    // Background polling sync every 6 seconds to keep alerts live
    const syncInterval = setInterval(() => loadNotifications(false), 6000);

    return () => {
      window.removeEventListener("nexoria_notifications_updated", handleNotifsUpdate);
      clearInterval(syncInterval);
    };
  }, [currentUserId, loadNotifications]);

  // ============================================================================
  // 2. USER ACTION HANDLERS
  // ============================================================================
  const handleMarkAllAsRead = async () => {
    setNotifs(prev => prev.map(n => ({ ...n, unread: false, is_read: true })));
    setUnreadCount(0);
    await markAllNotifsReadApi(currentUserId);
    window.dispatchEvent(new Event("nexoria_notifications_updated"));
    showToast("✓ All notifications marked as read");
  };

  const handleClearAllRead = async () => {
    setNotifs(prev => prev.filter(n => n.unread));
    await clearReadNotifsApi(currentUserId);
    window.dispatchEvent(new Event("nexoria_notifications_updated"));
    showToast("🗑️ Cleared read notifications");
  };

  const handleClearAll = async () => {
    setNotifs([]);
    setUnreadCount(0);
    await clearAllNotifsApi(currentUserId);
    window.dispatchEvent(new Event("nexoria_notifications_updated"));
    showToast("🗑️ All notifications removed");
  };

  const handleToggleRead = async (id) => {
    const target = notifs.find(n => n.id === id);
    const nextUnread = target ? !target.unread : false;
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, unread: nextUnread, is_read: !nextUnread } : n));
    setUnreadCount(prev => nextUnread ? prev + 1 : Math.max(0, prev - 1));
    await toggleNotifReadApi(id, currentUserId);
    window.dispatchEvent(new Event("nexoria_notifications_updated"));
  };

  const handleDeleteNotif = async (id) => {
    const target = notifs.find(n => n.id === id);
    const wasUnread = target?.unread;
    setNotifs(prev => prev.filter(n => n.id !== id));
    if (wasUnread) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    setActiveMenuId(null);
    await deleteNotifApi(id, currentUserId);
    window.dispatchEvent(new Event("nexoria_notifications_updated"));
    showToast("Notification removed");
  };


  const handleAcceptFriendRequest = async (notif) => {
    if (notif.entity_id) {
      const res = await acceptFriendRequestApi(notif.entity_id, currentUserId);
      if (res && res.success) {
        showToast(`✓ Accepted friend request from ${notif.name}!`);
        handleDeleteNotif(notif.id);
        window.dispatchEvent(new Event("friends-updated"));
      } else {
        showToast(res?.error || `✓ Connected with ${notif.name}!`);
        handleDeleteNotif(notif.id);
      }
    } else {
      showToast(`✓ Friend request accepted!`);
      handleDeleteNotif(notif.id);
    }
  };

  const handleDeclineFriendRequest = async (notif) => {
    if (notif.entity_id) {
      await rejectFriendRequestApi(notif.entity_id, currentUserId);
    }
    handleDeleteNotif(notif.id);
    showToast("Friend request declined");
  };

  const toggleDnd = () => {
    const next = !isDndEnabled;
    setIsDndEnabled(next);
    localStorage.setItem("nexoria_notif_dnd", String(next));
    showToast(next ? "🔕 Do Not Disturb (DND) Enabled" : "🔔 Notifications Unmuted");
  };

  const handleSavePref = async (key) => {
    const updated = { ...preferences, [key]: !preferences[key] };
    setPreferences(updated);
    await updateNotifSettingsApi(currentUserId, updated);
  };

  // Click on notification to navigate to profile or chat
  const handleNotificationClick = (n) => {
    if (n.unread) {
      handleToggleRead(n.id);
    }
    if (n.type === "tip" || n.type === "message") {
      setActiveChat({
        id: n.actor_id || n.user_id,
        name: n.name,
        img: n.img,
        online: true
      });
    } else if (n.name && !n.name.toLowerCase().includes("security") && !n.name.toLowerCase().includes("milestone")) {
      navigate("/profile", {
        state: {
          targetUser: {
            id: n.actor_id || n.user_id,
            user_id: n.actor_id || n.user_id,
            name: n.name,
            creatorName: n.name,
            creatorAvatar: n.img,
            profile: n.img,
            category: n.role || "Creator",
            caption: `Connecting on Nexoria 🌟`
          }
        }
      });
    }
  };

  // Helper for notification icons
  const getNotifIcon = (n) => {
    const t = (n.type || "").toLowerCase();
    switch (t) {
      case "profile_view":
        return <BsEyeFill size={13} />;
      case "tip":
        return <BsLightningChargeFill size={13} />;
      case "security":
        return <BsShieldLockFill size={13} />;
      case "comment":
        return <BsChatFill size={13} />;
      case "like":
      case "reaction":
        return <BsHeartFill size={13} />;
      case "friend":
      case "friend_request":
        return <BsPersonPlusFill size={13} />;
      case "birthday":
        return <BsGiftFill size={13} />;
      default:
        return <BsBellFill size={13} />;
    }
  };

  // Filter logic with 24-Hour (1-Day) Auto-Expiration window
  const getFilteredNotifs = () => {
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    let list = notifs.filter(n => {
      if (!n.created_at) return true;
      const createdTime = new Date(n.created_at).getTime();
      return isNaN(createdTime) || createdTime >= oneDayAgo;
    });

    if (filterTab === "unread") {
      list = list.filter(n => n.unread);
    } else if (filterTab === "profile_view") {
      list = list.filter(n => n.type === "profile_view");
    } else if (filterTab === "tips") {
      list = list.filter(n => n.type === "tip");
    } else if (filterTab === "comments") {
      list = list.filter(n => n.type === "comment" || n.type === "mention");
    } else if (filterTab === "friends") {
      list = list.filter(n => n.type === "friend" || n.type === "friend_request");
    } else if (filterTab === "security") {
      list = list.filter(n => n.type === "security");
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(n =>
        (n.name && n.name.toLowerCase().includes(q)) ||
        (n.text && n.text.toLowerCase().includes(q)) ||
        (n.tag && n.tag.toLowerCase().includes(q))
      );
    }

    return list;
  };

  const filteredNotifs = getFilteredNotifs();
  const profileViewsCount = notifs.filter(n => n.type === "profile_view").length;
  const tipsCount = notifs.filter(n => n.type === "tip").length;
  const friendRequestsCount = notifs.filter(n => n.type === "friend" || n.type === "friend_request").length;

  return (
    <div className="notif-page-root">
      <Header onOpenChat={setActiveChat} />

      <div className="notif-layout-container">
        <div className="notif-main-box">

          {/* Toast Notification */}
          {toastMessage && (
            <div style={{
              position: "fixed",
              top: 76,
              left: "50%",
              transform: "translateX(-50%)",
              background: "var(--color-surface, #ffffff)",
              border: "1.5px solid var(--color-primary, #1877f2)",
              color: "var(--color-text, #050505)",
              padding: "10px 22px",
              borderRadius: 30,
              boxShadow: "0 8px 30px rgba(0,0,0,0.2)",
              zIndex: 3000,
              fontSize: 14.5,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 8,
              animation: "espSlide 0.2s ease"
            }}>
              <BsCheckCircleFill color="var(--color-primary)" size={18} />
              {toastMessage}
            </div>
          )}

          {/* ===== 1. HERO NOTIFICATION BANNER ===== */}
          <div className="notif-hero-banner">
            <div className="notif-hero-top">
              <div className="notif-title-group">
                <h1>
                  🔔 Notifications Center
                  {unreadCount > 0 && (
                    <span style={{ fontSize: 13, background: "var(--color-danger, #e41e3f)", color: "#fff", padding: "3px 10px", borderRadius: 14, fontWeight: 700 }}>
                      {unreadCount} Unread
                    </span>
                  )}
                </h1>
                <p>Stay updated on real-time profile visits, creator tips, friend requests, security alerts & network interactions.</p>
              </div>

              {/* Quick Actions */}
              <div className="notif-hero-actions">
                <button className="btn-notif-hero" onClick={handleMarkAllAsRead} title="Mark All as Read">
                  <BsCheck2All size={16} /> Mark All Read
                </button>
                <button
                  className={`btn-notif-hero ${isDndEnabled ? "active-pulse" : ""}`}
                  onClick={toggleDnd}
                  title="Toggle Do Not Disturb Mode"
                >
                  <BsBellSlash size={15} /> {isDndEnabled ? "DND Active" : "DND Mode"}
                </button>
                <button className="btn-notif-hero" onClick={() => setShowSettingsModal(true)} title="Notification Settings">
                  <BsGearFill size={15} />
                </button>
                {notifs.some(n => !n.unread) && (
                  <button className="btn-notif-hero" onClick={handleClearAllRead} title="Clear Read Notifications">
                    <BsTrash3 size={14} /> Clear Read
                  </button>
                )}
                {notifs.length > 0 && (
                  <button className="btn-notif-hero" onClick={handleClearAll} title="Delete All Notifications">
                    <BsTrash3 size={14} className="text-danger" /> Clear All
                  </button>
                )}
              </div>
            </div>

            {/* Smart Search Bar */}
            <div className="notif-search-wrapper">
              <BsSearch className="text-muted" size={16} />
              <input
                type="text"
                className="notif-search-input"
                placeholder="Search alerts by sender, keyword, or alert type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-icon)" }}
                  onClick={() => setSearchQuery("")}
                >
                  <BsX size={20} />
                </button>
              )}
            </div>
          </div>

          {/* ===== 2. CATEGORY PILL TABS ===== */}
          <div className="notif-category-tabs">
            <button
              className={`notif-tab-pill ${filterTab === "all" ? "active" : ""}`}
              onClick={() => setFilterTab("all")}
            >
              All Alerts <span className="notif-tab-counter">{notifs.length}</span>
            </button>
            <button
              className={`notif-tab-pill ${filterTab === "unread" ? "active" : ""}`}
              onClick={() => setFilterTab("unread")}
            >
              🔴 Unread <span className="notif-tab-counter">{unreadCount}</span>
            </button>
            <button
              className={`notif-tab-pill ${filterTab === "friends" ? "active" : ""}`}
              onClick={() => setFilterTab("friends")}
            >
              👥 Requests <span className="notif-tab-counter">{friendRequestsCount}</span>
            </button>
            <button
              className={`notif-tab-pill ${filterTab === "tips" ? "active" : ""}`}
              onClick={() => setFilterTab("tips")}
            >
              ⚡ Tips & Rewards <span className="notif-tab-counter">{tipsCount}</span>
            </button>
            <button
              className={`notif-tab-pill ${filterTab === "profile_view" ? "active" : ""}`}
              onClick={() => setFilterTab("profile_view")}
            >
              👁️ Profile Views <span className="notif-tab-counter">{profileViewsCount}</span>
            </button>
            <button
              className={`notif-tab-pill ${filterTab === "comments" ? "active" : ""}`}
              onClick={() => setFilterTab("comments")}
            >
              💬 Comments
            </button>
            <button
              className={`notif-tab-pill ${filterTab === "security" ? "active" : ""}`}
              onClick={() => setFilterTab("security")}
            >
              🛡️ Security
            </button>
          </div>

          {/* ===== 3. NOTIFICATIONS CARDS LIST ===== */}
          <div className="notif-list-container">
            {isLoading ? (
              <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--color-text-secondary)" }}>
                <div className="spinner-border text-primary" role="status" style={{ width: 28, height: 28, marginBottom: 12 }}></div>
                <div style={{ fontSize: 13.5, fontWeight: 600 }}>Loading real-time notifications...</div>
              </div>
            ) : filteredNotifs.length === 0 ? (
              <div className="notif-empty-state-box">
                <div className="notif-empty-icon">🔕</div>
                <h4 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>No notifications found</h4>
                <p style={{ margin: 0, color: "var(--color-text-secondary)", fontSize: 14 }}>
                  {searchQuery ? "No alerts match your search query." : "You're all caught up with your latest alerts!"}
                </p>
              </div>
            ) : (
              filteredNotifs.map(n => (
                <div
                  key={n.id}
                  className={`notif-item-card ${n.unread ? "unread" : ""}`}
                  onClick={() => handleNotificationClick(n)}
                >
                  {/* Avatar & Icon Badge */}
                  <div className="notif-avatar-frame">
                    <img 
                      src={n.img} 
                      alt={n.name} 
                      className="notif-main-avatar" 
                      onError={(e) => { e.currentTarget.src = "https://i.pravatar.cc/150?u=fallback"; }}
                    />
                    <div className="notif-icon-badge" style={{ background: n.iconBg || "#1877f2" }}>
                      {getNotifIcon(n)}
                    </div>
                  </div>

                  {/* Content Info */}
                  <div className="notif-content-area">
                    <p className="notif-text-line">
                      <span className="notif-user-bold">{n.name}</span> {n.text}
                    </p>

                    <div className="notif-meta-line">
                      <span className="notif-time-badge">{n.time}</span>
                      {n.tag && <span className="notif-tag-pill">{n.tag}</span>}
                    </div>

                    {/* Interactive Inline Action Buttons */}
                    <div className="notif-inline-actions" onClick={(e) => e.stopPropagation()}>
                      {(n.type === "friend" || n.type === "friend_request") && (
                        <>
                          <button
                            className="notif-btn-action-primary"
                            onClick={() => handleAcceptFriendRequest(n)}
                          >
                            ✓ Accept Request
                          </button>
                          <button
                            className="notif-btn-action-secondary"
                            onClick={() => handleDeclineFriendRequest(n)}
                          >
                            Decline
                          </button>
                        </>
                      )}

                      {n.type === "profile_view" && (
                        <>
                          <button
                            className="notif-btn-action-primary"
                            onClick={() => handleNotificationClick(n)}
                          >
                            👁️ View Profile Back
                          </button>
                          <button
                            className="notif-btn-action-secondary"
                            onClick={() => setActiveChat({ id: n.actor_id || n.user_id, name: n.name, img: n.img, online: true })}
                          >
                            💬 Message
                          </button>
                        </>
                      )}

                      {n.type === "tip" && (
                        <button
                          className="notif-btn-action-primary"
                          style={{ background: "linear-gradient(135deg, #F59E0B, #D97706)" }}
                          onClick={() => {
                            showToast(`⚡ Opened chat with ${n.name}`);
                            setActiveChat({ id: n.actor_id || n.user_id, name: n.name, img: n.img, online: true });
                          }}
                        >
                          ⭐ Chat & Thank
                        </button>
                      )}

                      {n.type === "comment" && (
                        <button
                          className="notif-btn-action-secondary"
                          onClick={() => setActiveChat({ id: n.actor_id || n.user_id, name: n.name, img: n.img, online: true })}
                        >
                          💬 Reply
                        </button>
                      )}

                      {n.type === "birthday" && (
                        <button
                          className="notif-btn-action-primary"
                          style={{ background: "linear-gradient(135deg, #F59E0B, #EC4899)" }}
                          onClick={() => {
                            showToast("🎉 Sent Happy Birthday wishes!");
                            setActiveChat({ id: n.actor_id || n.user_id, name: n.name, img: n.img, online: true });
                          }}
                        >
                          🎉 Send Wishes
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Right Controls */}
                  <div className="notif-right-controls" onClick={(e) => e.stopPropagation()}>
                    {n.unread && <span className="unread-pulse-dot" title="Unread alert"></span>}
                    
                    <button
                      className="notif-menu-trigger"
                      onClick={() => setActiveMenuId(activeMenuId === n.id ? null : n.id)}
                      aria-label="Notification Options"
                    >
                      <BsThreeDots size={18} />
                    </button>

                    {/* Context Dropdown Menu */}
                    {activeMenuId === n.id && (
                      <div className="notif-context-menu">
                        <div className="notif-menu-option" onClick={() => { handleToggleRead(n.id); setActiveMenuId(null); }}>
                          <BsCheck2All className="text-primary" size={16} />
                          {n.unread ? "Mark as read" : "Mark as unread"}
                        </div>
                        <div className="notif-menu-option" onClick={() => { showToast(`Alerts from ${n.name} silenced`); setActiveMenuId(null); }}>
                          <BsBellSlash className="text-warning" size={16} />
                          Turn off alerts of this type
                        </div>
                        <div className="notif-menu-option danger" onClick={() => handleDeleteNotif(n.id)}>
                          <BsTrash3 size={15} />
                          Remove notification
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      </div>

      {/* ===== NOTIFICATION SETTINGS MODAL ===== */}
      {showSettingsModal && (
        <div className="radar-modal-overlay" onClick={() => setShowSettingsModal(false)}>
          <div className="notif-settings-dialog" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--color-border)" }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
                <BsGearFill size={18} color="var(--color-primary)" /> Notification Preferences
              </h3>
              <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-icon)" }} onClick={() => setShowSettingsModal(false)}>
                <BsX size={24} />
              </button>
            </div>

            <div style={{ padding: "8px 0" }}>
              {[
                { key: "profileViews", title: "👁️ Profile View Notifications", desc: "Notify me when peers visit my profile" },
                { key: "tips", title: "⚡ Creator Micro-Tips & Star Coins", desc: "Get real-time alerts on received creator tips" },
                { key: "comments", title: "💬 Comments & Discussions", desc: "Notify when someone comments on your posts" },
                { key: "friendRequests", title: "👥 Connection & Friend Requests", desc: "Alerts for incoming friend requests" },
                { key: "securityAlerts", title: "🛡️ Zero-Trust Security & Login Alerts", desc: "Critical alerts for new device logins" },
                { key: "sounds", title: "🔔 Sound Effects & Haptics", desc: "Play ambient chime on incoming notifications" }
              ].map(item => (
                <div key={item.key} className="notif-settings-toggle-row">
                  <div>
                    <div style={{ fontSize: 14.5, fontWeight: 600 }}>{item.title}</div>
                    <div style={{ fontSize: 12.5, color: "var(--color-text-secondary)", marginTop: 2 }}>{item.desc}</div>
                  </div>
                  <label className="notif-switch">
                    <input
                      type="checkbox"
                      checked={Boolean(preferences[item.key])}
                      onChange={() => handleSavePref(item.key)}
                    />
                    <span className="notif-slider"></span>
                  </label>
                </div>
              ))}
            </div>

            <div style={{ padding: "14px 20px", borderTop: "1px solid var(--color-border)", display: "flex", justifyContent: "flex-end" }}>
              <button
                className="notif-btn-action-primary"
                style={{ width: "100%", justifyContent: "center", height: 38 }}
                onClick={() => {
                  setShowSettingsModal(false);
                  showToast("Preferences saved successfully!");
                }}
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Drawer */}
      <ChatDrawer activeChat={activeChat} onClose={() => setActiveChat(null)} />

      {/* Mobile Bottom Navigation */}
      <div className="mobile-bottom-nav">
        <MenuIcons />
      </div>
    </div>
  );
}

export default Notifications;