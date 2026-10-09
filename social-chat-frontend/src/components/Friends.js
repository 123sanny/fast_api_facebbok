import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BsSearch, BsCheck2, BsChatDotsFill, BsPersonPlusFill,
  BsStarFill, BsStar, BsShieldCheck, BsSoundwave,
  BsGeoAltFill, BsFillPeopleFill, BsCheckCircleFill, BsX,
  BsPersonXFill
} from "react-icons/bs";
import Header from "./Header";
import MenuIcons from "./MenuIcons";
import ChatDrawer from "./ChatDrawer";
import AudioHangoutModal from "./AudioHangoutModal";
import { getActiveUserId } from "../services/profileApi";
import {
  fetchFriendRequestsApi,
  fetchFriendSuggestionsApi,
  fetchUserFriendsApi,
  fetchFriendStatsApi,
  sendFriendRequestApi,
  acceptFriendRequestApi,
  rejectFriendRequestApi,
  cancelFriendRequestApi,
  removeFriendApi,
  toggleStarFriendApi
} from "../services/friendApi";
import "./css/Friends.css";

function Friends() {
  const navigate = useNavigate();
  const currentUserId = getActiveUserId();
  const [activeTab, setActiveTab] = useState("all");
  const [requests, setRequests] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [myFriends, setMyFriends] = useState([]);
  const [stats, setStats] = useState({ total_friends: 0, pending_requests: 0, suggestions_count: 0, online_count: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeChat, setActiveChat] = useState(null);
  const [showRadarModal, setShowRadarModal] = useState(false);
  const [showAudioHangout, setShowAudioHangout] = useState(false);
  const [showCircleModal, setShowCircleModal] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Initial Data Fetching from FastAPI Backend
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setIsLoading(true);
      try {
        const [reqRes, sugRes, frRes, stRes] = await Promise.all([
          fetchFriendRequestsApi(currentUserId),
          fetchFriendSuggestionsApi(currentUserId),
          fetchUserFriendsApi(currentUserId),
          fetchFriendStatsApi(currentUserId)
        ]);

        if (isMounted) {
          if (reqRes.success && reqRes.data) setRequests(reqRes.data);
          if (sugRes.success && sugRes.data) setSuggestions(sugRes.data);
          if (frRes.success && frRes.data) setMyFriends(frRes.data);
          if (stRes.success && stRes.data) setStats(stRes.data);
        }
      } catch (err) {
        console.error("Failed to load friend data from server:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadData();
    return () => { isMounted = false; };
  }, [currentUserId]);

  const handleConfirm = async (req) => {
    // Optimistic UI update
    setRequests(prev => prev.filter(r => r.id !== req.id));
    setMyFriends(prev => [
      {
        id: req.id,
        friend_user_id: req.sender_id,
        name: req.name,
        role: req.role,
        location: req.location,
        cover: req.cover,
        img: req.img,
        mutual_count: req.mutual_count || req.mutualCount || 0,
        mutual_avatars: req.mutual_avatars || req.mutualAvatars || [],
        verified: req.verified,
        online: true,
        starred: false,
        activity: "🟢 Active now",
        distance: req.distance
      },
      ...prev
    ]);
    showToast(`🎉 You and ${req.name} are now connected on Nexoria!`);

    await acceptFriendRequestApi(req.id, currentUserId);
    fetchFriendStatsApi(currentUserId).then(st => st.success && setStats(st.data));
  };

  const handleDelete = async (id) => {
    setRequests(prev => prev.filter(r => r.id !== id));
    showToast(`Request removed`);
    await rejectFriendRequestApi(id, currentUserId);
    fetchFriendStatsApi(currentUserId).then(st => st.success && setStats(st.data));
  };

  const handleConfirmAll = async () => {
    const list = [...requests];
    setRequests([]);
    for (const req of list) {
      setMyFriends(prev => [
        {
          id: req.id,
          friend_user_id: req.sender_id,
          name: req.name,
          role: req.role,
          location: req.location,
          cover: req.cover,
          img: req.img,
          mutual_count: req.mutual_count || req.mutualCount || 0,
          mutual_avatars: req.mutual_avatars || req.mutualAvatars || [],
          verified: req.verified,
          online: true,
          starred: false,
          activity: "🟢 Active now",
          distance: req.distance
        },
        ...prev
      ]);
      await acceptFriendRequestApi(req.id, currentUserId);
    }
    showToast(`🎉 Accepted all friend requests!`);
    fetchFriendStatsApi(currentUserId).then(st => st.success && setStats(st.data));
  };

  const handleToggleAddFriend = async (suggestion) => {
    const targetId = suggestion.user_id || suggestion.id;
    const nextSent = !suggestion.sent;

    setSuggestions(prev => prev.map(s => {
      if ((s.user_id || s.id) === targetId) {
        return { ...s, sent: nextSent };
      }
      return s;
    }));

    if (nextSent) {
      showToast(`Friend request sent to ${suggestion.name} 🚀`);
      await sendFriendRequestApi(currentUserId, targetId);
    } else {
      showToast(`Request cancelled`);
      await cancelFriendRequestApi(currentUserId, targetId);
    }
    fetchFriendStatsApi(currentUserId).then(st => st.success && setStats(st.data));
  };

  const handleRemoveSuggestion = (id) => {
    setSuggestions(prev => prev.filter(s => (s.user_id || s.id) !== id));
  };

  const toggleStarFriend = async (friend) => {
    const targetId = friend.friend_user_id || friend.id;
    const nextStarred = !friend.starred;

    setMyFriends(prev => prev.map(f => {
      if ((f.friend_user_id || f.id) === targetId) {
        return { ...f, starred: nextStarred };
      }
      return f;
    }));

    const res = await toggleStarFriendApi(currentUserId, targetId);
    if (res.success) {
      showToast(res.message || (nextStarred ? `⭐ Added ${friend.name} to Close Friends` : `Removed from Close Friends`));
    }
  };

  const handleUnfriend = async (friend) => {
    const targetId = friend.friend_user_id || friend.id;
    setMyFriends(prev => prev.filter(f => (f.friend_user_id || f.id) !== targetId));
    showToast(`Removed ${friend.name} from friends`);
    await removeFriendApi(currentUserId, targetId);
    fetchFriendStatsApi(currentUserId).then(st => st.success && setStats(st.data));
  };

  const handleViewProfile = (user) => {
    const targetId = user.friend_user_id || user.id || user.user_id;
    navigate("/profile", {
      state: {
        user: {
          id: targetId,
          user_id: targetId,
          name: user.name,
          creatorName: user.name,
          creatorAvatar: user.img || user.profile || user.avatar,
          avatar: user.img || user.profile || user.avatar,
          posterUrl: user.cover,
          category: user.role,
          isFollowing: true
        },
        targetUser: {
          id: targetId,
          user_id: targetId,
          name: user.name,
          creatorName: user.name,
          creatorAvatar: user.img || user.profile || user.avatar,
          avatar: user.img || user.profile || user.avatar,
          posterUrl: user.cover,
          category: user.role,
          isFollowing: true
        }
      }
    });
  };

  // Filter friends list based on query & tab
  const getFilteredFriends = () => {
    let list = myFriends;
    if (activeTab === "online") {
      list = list.filter(f => f.online);
    } else if (activeTab === "starred") {
      list = list.filter(f => f.starred);
    } else if (activeTab === "nearby") {
      list = list.filter(f => f.location.toLowerCase().includes("delhi") || f.location.toLowerCase().includes("deoria"));
    }
    if (searchQuery.trim()) {
      list = list.filter(f =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return list;
  };

  const displayedFriends = getFilteredFriends();
  const onlineCount = myFriends.filter(f => f.online).length;
  const starredCount = myFriends.filter(f => f.starred).length;

  return (
    <div className="friends-page-root">
      <Header onOpenChat={setActiveChat} />

      <div className="friends-layout-body">
        <div className="friends-main-container">

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

          {/* ===== 1. HERO BANNER & REAL-TIME STATS ===== */}
          <div className="friends-hero-banner">
            <div className="hero-top-row">
              <div className="hero-title-group">
                <h1>👥 Friends & Community Hub</h1>
                <p>Connect with your authentic network, collaborate in realtime lounges, and discover nearby peers.</p>
              </div>

              {/* Action Buttons */}
              <div className="hero-action-buttons">
                <button className="btn-hero-action btn-radar" onClick={() => setShowRadarModal(true)}>
                  <BsGeoAltFill size={15} /> Nearby Radar (Live)
                </button>
                <button className="btn-hero-action btn-hangout" onClick={() => setShowAudioHangout(true)}>
                  <BsSoundwave size={16} /> Audio Lounge
                </button>
                <button className="btn-hero-action btn-circle" onClick={() => setShowCircleModal(true)}>
                  <BsFillPeopleFill size={15} /> My Circles
                </button>
              </div>
            </div>

            {/* Live Stats Strip */}
            <div className="hero-stats-strip">
              <div className="stat-badge">
                <span className="stat-dot-pulse"></span>
                <span><strong>{stats.online_count || onlineCount}</strong> Online Now</span>
              </div>
              <div className="stat-badge">
                <span>⭐ <strong>{starredCount}</strong> Close Friends</span>
              </div>
              <div className="stat-badge">
                <span>📬 <strong>{requests.length}</strong> Pending Requests</span>
              </div>
              <div className="stat-badge">
                <span>🌐 <strong>{stats.total_friends || myFriends.length}</strong> Total Friends</span>
              </div>
            </div>

            {/* Smart Search Bar */}
            <div className="hero-search-wrapper">
              <BsSearch className="text-muted" size={17} />
              <input
                type="text"
                className="hero-search-input"
                placeholder="Search friends by name, role (e.g. AI Engineer, Designer), or city..."
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
          <div className="friends-category-tabs">
            <button
              className={`f-cat-tab ${activeTab === "all" ? "active" : ""}`}
              onClick={() => setActiveTab("all")}
            >
              🌟 All Connections <span className="f-tab-counter">{myFriends.length}</span>
            </button>
            <button
              className={`f-cat-tab ${activeTab === "requests" ? "active" : ""}`}
              onClick={() => setActiveTab("requests")}
            >
              📬 Requests <span className="f-tab-counter" style={{ background: requests.length > 0 ? "var(--color-danger, #e41e3f)" : undefined, color: requests.length > 0 ? "#fff" : undefined }}>{requests.length}</span>
            </button>
            <button
              className={`f-cat-tab ${activeTab === "suggestions" ? "active" : ""}`}
              onClick={() => setActiveTab("suggestions")}
            >
              ✨ AI Smart Discovery <span className="f-tab-counter">{suggestions.length}</span>
            </button>
            <button
              className={`f-cat-tab ${activeTab === "online" ? "active" : ""}`}
              onClick={() => setActiveTab("online")}
            >
              🟢 Online Now <span className="f-tab-counter">{onlineCount}</span>
            </button>
            <button
              className={`f-cat-tab ${activeTab === "nearby" ? "active" : ""}`}
              onClick={() => setActiveTab("nearby")}
            >
              📍 Nearby & Hometown
            </button>
            <button
              className={`f-cat-tab ${activeTab === "starred" ? "active" : ""}`}
              onClick={() => setActiveTab("starred")}
            >
              ⭐ Close Friends ({starredCount})
            </button>
          </div>

          {/* Loading Indicator */}
          {isLoading && (
            <div style={{ padding: "40px 20px", textAlign: "center" }}>
              <div className="spinner-border text-primary mb-2" role="status"></div>
              <p style={{ color: "var(--color-text-secondary)", margin: 0 }}>Syncing your live connections and requests...</p>
            </div>
          )}

          {/* ===== 3. PENDING FRIEND REQUESTS SECTION ===== */}
          {(activeTab === "all" || activeTab === "requests") && requests.length > 0 && (
            <section className="friends-grid-section">
              <div className="friends-grid-header">
                <h3>
                  📬 Pending Friend Requests
                  <span style={{ fontSize: 13, background: "var(--color-danger, #e41e3f)", color: "#fff", padding: "2px 8px", borderRadius: 12 }}>{requests.length} new</span>
                </h3>
                {requests.length > 1 && (
                  <button className="btn-batch-action" onClick={handleConfirmAll}>
                    ✓ Accept All ({requests.length})
                  </button>
                )}
              </div>

              <div className="friends-cards-grid">
                {requests.map(req => (
                  <div className="friend-ultra-card" key={req.id}>
                    <div className="card-cover-wrap">
                      <img src={req.cover} alt="Cover" className="card-cover-img" />
                    </div>

                    <div className="card-avatar-row">
                      <div className="card-avatar-ring" onClick={() => handleViewProfile(req)}>
                        <img src={req.img} alt={req.name} className="card-avatar-img" />
                        <span className="card-online-dot"></span>
                      </div>
                      {req.verified && (
                        <div className="card-verified-badge">
                          <BsShieldCheck size={13} /> Verified
                        </div>
                      )}
                    </div>

                    <div className="card-content">
                      <h4 className="card-user-name" onClick={() => handleViewProfile(req)}>{req.name}</h4>
                      <p className="card-user-role">{req.role}</p>

                      <div className="card-status-pill">
                        <BsGeoAltFill color="var(--color-primary)" size={12} />
                        <span>{req.location} · {req.distance}</span>
                      </div>

                      <div className="card-mutual-strip">
                        <div className="mutual-avatar-stack">
                          {(req.mutualAvatars || []).map((src, i) => (
                            <img 
                              src={src} 
                              alt="Mutual" 
                              key={i} 
                              onError={(e) => { e.currentTarget.src = "https://i.pravatar.cc/100?u=fallback"; }}
                            />
                          ))}
                        </div>
                        <span className="mutual-count-text">{req.mutualCount} mutual friends</span>
                      </div>

                      <div className="card-actions-grid">
                        <div className="card-btn-dual-row">
                          <button className="card-btn-primary" onClick={() => handleConfirm(req)}>
                            <BsCheck2 size={18} /> Confirm
                          </button>
                          <button className="card-btn-secondary" onClick={() => handleDelete(req.id)}>
                            Delete
                          </button>
                        </div>
                        <button
                          className="card-btn-secondary"
                          style={{ fontSize: 13, height: 32 }}
                          onClick={() => handleViewProfile(req)}
                        >
                          👁️ View Profile
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ===== 4. AI SUGGESTIONS / PEOPLE YOU MAY KNOW ===== */}
          {(activeTab === "all" || activeTab === "suggestions") && suggestions.length > 0 && (
            <section className="friends-grid-section">
              <div className="friends-grid-header">
                <h3>✨ AI-Powered People You May Know</h3>
                <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>Based on your interests, college & location</span>
              </div>

              <div className="friends-cards-grid">
                {suggestions.map(s => (
                  <div className="friend-ultra-card" key={s.id}>
                    <div className="card-cover-wrap">
                      <img src={s.cover} alt="Cover" className="card-cover-img" />
                    </div>

                    <div className="card-avatar-row">
                      <div className="card-avatar-ring" onClick={() => handleViewProfile(s)}>
                        <img src={s.img} alt={s.name} className="card-avatar-img" />
                      </div>
                      {s.verified && (
                        <div className="card-verified-badge">
                          <BsShieldCheck size={13} /> Verified
                        </div>
                      )}
                    </div>

                    <div className="card-content">
                      <h4 className="card-user-name" onClick={() => handleViewProfile(s)}>{s.name}</h4>
                      <p className="card-user-role">{s.role}</p>

                      <div className="card-status-pill">
                        <span>{s.activity}</span>
                      </div>

                      <div className="card-mutual-strip">
                        <div className="mutual-avatar-stack">
                          {(s.mutualAvatars || []).map((src, i) => (
                            <img 
                              src={src} 
                              alt="Mutual" 
                              key={i} 
                              onError={(e) => { e.currentTarget.src = "https://i.pravatar.cc/100?u=fallback"; }}
                            />
                          ))}
                        </div>
                        <span className="mutual-count-text">{s.mutualCount} mutual connections · {s.distance}</span>
                      </div>

                      <div className="card-actions-grid">
                        <div className="card-btn-dual-row">
                          <button
                            className={`card-btn-primary ${s.sent ? "card-btn-secondary" : ""}`}
                            onClick={() => handleToggleAddFriend(s)}
                          >
                            {s.sent ? (
                              <><BsCheck2 size={16} /> Request Sent</>
                            ) : (
                              <><BsPersonPlusFill size={15} /> Add Friend</>
                            )}
                          </button>
                          {!s.sent && (
                            <button
                              className="card-btn-secondary"
                              onClick={() => handleRemoveSuggestion(s.id || s.user_id)}
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        <button
                          className="card-btn-secondary"
                          style={{ fontSize: 13, height: 32 }}
                          onClick={() => handleViewProfile(s)}
                        >
                          👁️ View Profile
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ===== 5. YOUR ACTIVE CONNECTIONS GRID ===== */}
          {(activeTab === "all" || activeTab === "online" || activeTab === "starred" || activeTab === "nearby") && (
            <section className="friends-grid-section">
              <div className="friends-grid-header">
                <h3>
                  🌟 Your Friends
                  <span style={{ fontSize: 14, color: "var(--color-text-secondary)", fontWeight: 500 }}>
                    ({displayedFriends.length} shown)
                  </span>
                </h3>
              </div>

              {displayedFriends.length === 0 ? (
                <div style={{
                  padding: "40px 20px",
                  textAlign: "center",
                  background: "var(--color-surface)",
                  borderRadius: 16,
                  border: "1px solid var(--color-border)"
                }}>
                  <div style={{ fontSize: 40, marginBottom: 10 }}>🔍</div>
                  <h4 style={{ margin: "0 0 6px" }}>No matching friends found</h4>
                  <p style={{ color: "var(--color-text-secondary)", margin: 0 }}>Try clearing your search query or switching tabs.</p>
                </div>
              ) : (
                <div className="friends-cards-grid">
                  {displayedFriends.map(f => (
                    <div className="friend-ultra-card" key={f.id || f.friend_user_id}>
                      <div className="card-cover-wrap">
                        <img src={f.cover} alt="Cover" className="card-cover-img" />
                        <div className="card-top-badges">
                          <button
                            className={`btn-star-fav ${f.starred ? "starred" : ""}`}
                            onClick={() => toggleStarFriend(f)}
                            title={f.starred ? "Starred Close Friend" : "Add to Close Friends"}
                          >
                            {f.starred ? <BsStarFill size={15} /> : <BsStar size={15} />}
                          </button>
                        </div>
                      </div>

                      <div className="card-avatar-row">
                        <div className="card-avatar-ring" onClick={() => handleViewProfile(f)}>
                          <img src={f.img} alt={f.name} className="card-avatar-img" />
                          {f.online && <span className="card-online-dot"></span>}
                        </div>
                        {f.verified && (
                          <div className="card-verified-badge">
                            <BsShieldCheck size={13} /> Verified
                          </div>
                        )}
                      </div>

                      <div className="card-content">
                        <h4 className="card-user-name" onClick={() => handleViewProfile(f)}>{f.name}</h4>
                        <p className="card-user-role">{f.role}</p>

                        <div className="card-status-pill">
                          <span>{f.activity}</span>
                        </div>

                        <div className="card-mutual-strip">
                          <div className="mutual-avatar-stack">
                            {(f.mutual_avatars || f.mutualAvatars || []).map((src, i) => (
                              <img 
                                src={src} 
                                alt="Mutual" 
                                key={i} 
                                onError={(e) => { e.currentTarget.src = "https://i.pravatar.cc/100?u=fallback"; }}
                              />
                            ))}
                          </div>
                          <span className="mutual-count-text">{f.location} · {f.distance}</span>
                        </div>

                        <div className="card-actions-grid">
                          <div className="card-btn-dual-row">
                            <button
                              className="card-btn-primary"
                              onClick={() => setActiveChat({ id: f.friend_user_id || f.user_id || f.id, name: f.name, img: f.img, online: f.online })}
                            >
                              <BsChatDotsFill size={14} /> Message
                            </button>
                            <button
                              className="card-btn-secondary"
                              onClick={() => handleUnfriend(f)}
                              title="Unfriend"
                            >
                              <BsPersonXFill size={14} className="text-danger" /> Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

        </div>
      </div>

      {/* ===== RADAR HYPERLOCAL DISCOVERY MODAL ===== */}
      {showRadarModal && (
        <div className="radar-modal-overlay" onClick={() => setShowRadarModal(false)}>
          <div className="radar-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--color-border)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 17 }}>
                <BsGeoAltFill color="var(--color-primary)" size={18} />
                Hyperlocal Peer & Friend Radar
              </div>
              <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-icon)" }} onClick={() => setShowRadarModal(false)}>
                <BsX size={24} />
              </button>
            </div>

            <div className="radar-scanner-box">
              <div className="radar-sweep-beam"></div>
              <div className="radar-center-pulse">📡</div>
            </div>

            <div style={{ padding: 20 }}>
              <h4 style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 700 }}>Scanning for Nearby Connections in Delhi & NCR...</h4>
              <p style={{ margin: "0 0 16px", fontSize: 13.5, color: "var(--color-text-secondary)" }}>
                Zero tracking mode enabled. Radar uses privacy-preserving geohashes with zero persistent location storage.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {myFriends.slice(0, 3).map(friend => (
                  <div key={friend.id || friend.friend_user_id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderRadius: 12, background: "var(--color-bg)", border: "1px solid var(--color-border)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <img src={friend.img} alt={friend.name} style={{ width: 40, height: 40, borderRadius: "50%" }} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14.5 }}>{friend.name}</div>
                        <div style={{ fontSize: 12.5, color: "var(--color-primary)" }}>📍 {friend.distance} · {friend.location}</div>
                      </div>
                    </div>
                    <button
                      className="card-btn-primary"
                      style={{ width: "auto", padding: "6px 14px", height: 32, fontSize: 13 }}
                      onClick={() => {
                        setShowRadarModal(false);
                        setActiveChat({ id: friend.id || friend.user_id, name: friend.name, img: friend.img, online: friend.online });
                      }}
                    >
                      Say Hi 👋
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== CUSTOM CIRCLES MODAL ===== */}
      {showCircleModal && (
        <div className="radar-modal-overlay" onClick={() => setShowCircleModal(false)}>
          <div className="radar-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--color-border)" }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>👥 Custom Friend Circles</h3>
              <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-icon)" }} onClick={() => setShowCircleModal(false)}>
                <BsX size={24} />
              </button>
            </div>
            <div style={{ padding: 20 }}>
              <p style={{ margin: "0 0 16px", fontSize: 13.5, color: "var(--color-text-secondary)" }}>
                Organize your social graph into discrete, private circles with customized feed visibility.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { name: "💻 Dev & Founders Circle", count: 24, desc: "Tech builders, open-source peers & engineers" },
                  { name: "🎮 Gaming Squad", count: 12, desc: "Multiplayer lobbies, Discord voice & esports" },
                  { name: "🎓 College & CSE Alumni", count: 68, desc: "Batchmates and professors" },
                  { name: "⭐ Close Friends Only", count: starredCount, desc: "Private stories and auto-expiring posts" }
                ].map((c, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", borderRadius: 12, background: "var(--color-bg)", border: "1px solid var(--color-border)" }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14.5 }}>{c.name}</div>
                      <div style={{ fontSize: 12.5, color: "var(--color-text-secondary)", marginTop: 2 }}>{c.desc}</div>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, background: "rgba(24, 119, 242, 0.1)", color: "var(--color-primary)", padding: "4px 10px", borderRadius: 12 }}>
                      {c.count} members
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Audio Hangout Modal */}
      {showAudioHangout && (
        <AudioHangoutModal onClose={() => setShowAudioHangout(false)} />
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

export default Friends;