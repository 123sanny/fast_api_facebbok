import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BsClockHistory, BsShareFill, BsHeartFill, BsChatDotsFill,
  BsShieldCheck, BsBellFill, BsGearFill, BsCalendar2CheckFill,
  BsStars, BsCheckCircleFill, BsX, BsSendCheck
} from "react-icons/bs";
import Header from "./Header";
import { getActiveUserId } from "../services/profileApi";
import { fetchMemoriesApi, shareMemoryApi } from "../services/communityHubApi";
import "./css/MemoriesPage.css";

function MemoriesPage() {
  const navigate = useNavigate();
  const currentUserId = getActiveUserId() || 1;

  const [memories, setMemories] = useState([]);
  const [dateToday, setDateToday] = useState("Today");
  const [isLoading, setIsLoading] = useState(true);
  
  // Share Memory Modal
  const [activeShareMemory, setActiveShareMemory] = useState(null);
  const [shareQuote, setShareQuote] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  
  // Notification Preferences
  const [notifPref, setNotifPref] = useState("all"); // 'all', 'highlights', 'none'
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadMemories = async () => {
    setIsLoading(true);
    try {
      const res = await fetchMemoriesApi(currentUserId);
      if (res && res.success) {
        setMemories(res.data || []);
        if (res.date_today) setDateToday(res.date_today);
      }
    } catch (err) {
      console.error("Error loading memories:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMemories();
  }, []);

  const handleOpenShare = (mem) => {
    setActiveShareMemory(mem);
    setShareQuote(`Remembering this incredible moment from ${mem.years_ago} ${mem.years_ago === 1 ? 'year' : 'years'} ago! ✨🎉`);
  };

  const handleShareSubmit = async (e) => {
    e?.preventDefault();
    if (!activeShareMemory) return;

    setIsSharing(true);
    try {
      const res = await shareMemoryApi({
        user_id: currentUserId,
        quote: shareQuote,
        image_url: activeShareMemory.post?.image || "",
        memory_id: activeShareMemory.id
      });

      if (res && res.success) {
        showToast("🚀 Memory shared to your timeline!");
        setActiveShareMemory(null);
        setShareQuote("");
      } else {
        showToast("❌ Could not share memory");
      }
    } catch (err) {
      showToast("❌ Error sharing memory");
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="memories-page-wrapper">
      <Header />

      <div className="memories-container container-fluid">
        <div className="memories-inner-layout">
          
          {/* Top Hero Banner */}
          <div className="memories-hero-banner">
            <div className="hero-badge">
              <BsClockHistory size={24} />
            </div>
            <div className="hero-content">
              <h2>Memories on {dateToday}</h2>
              <p>We hope you enjoy looking back and sharing your memories on Nexoria, from the most recent to the way back when.</p>
            </div>
            <button 
              className="btn-memory-settings" 
              onClick={() => setShowSettingsModal(true)}
              title="Memory notification preferences"
            >
              <BsGearFill size={18} />
              <span>Settings</span>
            </button>
          </div>

          {/* Feed of Memories */}
          {isLoading ? (
            <div className="memories-skeleton-list">
              {[1, 2].map(n => (
                <div key={n} className="memory-skeleton-card"></div>
              ))}
            </div>
          ) : memories.length === 0 ? (
            <div className="memories-empty-state">
              <div className="empty-clock-icon">
                <BsStars size={40} />
              </div>
              <h4>No memories to see today</h4>
              <p className="text-muted">You don't have any throwback posts or anniversaries on {dateToday}. We'll notify you when you have new memories to celebrate!</p>
              <button className="btn btn-primary rounded-pill px-4" onClick={() => navigate("/home")}>
                Create New Posts
              </button>
            </div>
          ) : (
            <div className="memories-cards-feed">
              {memories.map((mem) => (
                <div key={mem.id} className="memory-card shadow-lg">
                  {/* Ribbon */}
                  <div className="memory-ribbon">
                    <div className="d-flex align-items-center gap-2">
                      <BsStars className="text-warning" />
                      <span className="ribbon-title">{mem.badge_text}</span>
                    </div>
                    <span className="ribbon-date">{mem.date_display}</span>
                  </div>

                  {/* Card Content Header */}
                  <div className="memory-card-header">
                    <div className="d-flex align-items-center gap-2.5">
                      <img 
                        src={mem.post?.author_pic || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"} 
                        alt="" 
                        className="memory-author-img"
                      />
                      <div>
                        <div className="d-flex align-items-center gap-1">
                          <strong>{mem.post?.author_name || "You"}</strong>
                          {mem.post?.author_verified && <BsShieldCheck className="text-primary small" />}
                        </div>
                        <small className="text-muted">{mem.date_display}</small>
                      </div>
                    </div>
                  </div>

                  {/* Caption */}
                  {mem.post?.caption && (
                    <div className="memory-caption">
                      <p>{mem.post.caption}</p>
                    </div>
                  )}

                  {/* Media */}
                  {mem.post?.image && (
                    <div className="memory-media-wrap">
                      <img src={mem.post.image} alt="Throwback Memory" />
                    </div>
                  )}

                  {/* Social Engagements Bar */}
                  <div className="memory-stats-bar">
                    <div className="d-flex align-items-center gap-3 text-muted small">
                      <span><BsHeartFill className="text-danger me-1" /> {mem.post?.likes_count || 0}</span>
                      <span><BsChatDotsFill className="text-info me-1" /> {mem.post?.comments_count || 0}</span>
                    </div>

                    <button 
                      className="btn-share-memory"
                      onClick={() => handleOpenShare(mem)}
                    >
                      <BsShareFill className="me-1.5" /> Share Throwback
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>

      {/* SHARE MEMORY MODAL */}
      {activeShareMemory && (
        <div className="mem-modal-overlay" onClick={() => setActiveShareMemory(null)}>
          <div className="mem-modal-dialog shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="mem-modal-header">
              <h5 className="m-0 font-weight-bold">
                <BsShareFill className="me-2 text-primary" /> Share Throwback Memory
              </h5>
              <button className="btn-close-mem" onClick={() => setActiveShareMemory(null)}>
                <BsX size={24} />
              </button>
            </div>

            <form onSubmit={handleShareSubmit} className="mem-modal-body">
              <div className="mb-3">
                <label className="form-label font-weight-bold small text-light">Say something about this memory...</label>
                <textarea 
                  className="form-control bg-dark text-light border-secondary"
                  rows={3}
                  value={shareQuote}
                  onChange={e => setShareQuote(e.target.value)}
                  placeholder="Add your thoughts or memories..."
                  autoFocus
                />
              </div>

              {/* Preview Attached Memory */}
              <div className="mem-share-preview-card">
                <div className="small text-warning font-weight-bold mb-1">
                  ⭐ {activeShareMemory.badge_text}
                </div>
                <p className="small text-light m-0">{activeShareMemory.post?.caption}</p>
                {activeShareMemory.post?.image && (
                  <img src={activeShareMemory.post.image} alt="" className="mem-share-preview-img mt-2" />
                )}
              </div>

              <div className="d-flex justify-content-end gap-2 mt-4">
                <button 
                  type="button" 
                  className="btn btn-secondary rounded-pill px-3"
                  onClick={() => setActiveShareMemory(null)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary rounded-pill px-4 font-weight-bold d-flex align-items-center gap-2"
                  disabled={isSharing}
                >
                  {isSharing ? "Sharing..." : <><BsSendCheck size={18} /> Share to Feed</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MEMORY SETTINGS MODAL */}
      {showSettingsModal && (
        <div className="mem-modal-overlay" onClick={() => setShowSettingsModal(false)}>
          <div className="mem-modal-dialog shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="mem-modal-header">
              <h5 className="m-0 font-weight-bold">
                <BsBellFill className="me-2 text-warning" /> Memories Notifications
              </h5>
              <button className="btn-close-mem" onClick={() => setShowSettingsModal(false)}>
                <BsX size={24} />
              </button>
            </div>

            <div className="mem-modal-body">
              <p className="small text-muted mb-3">Choose how often you want to be notified about your throwback memories.</p>

              <div className="mem-pref-options">
                <label className={`pref-card ${notifPref === "all" ? "active" : ""}`} onClick={() => setNotifPref("all")}>
                  <input type="radio" name="memPref" checked={notifPref === "all"} onChange={() => {}} />
                  <div>
                    <strong>All Memories</strong>
                    <p className="m-0 small text-muted">Notify me once a day whenever memories or throwbacks are available.</p>
                  </div>
                </label>

                <label className={`pref-card ${notifPref === "highlights" ? "active" : ""}`} onClick={() => setNotifPref("highlights")}>
                  <input type="radio" name="memPref" checked={notifPref === "highlights"} onChange={() => {}} />
                  <div>
                    <strong>Highlights & Milestones Only</strong>
                    <p className="m-0 small text-muted">Only notify me for major friendship milestones and viral throwback moments.</p>
                  </div>
                </label>

                <label className={`pref-card ${notifPref === "none" ? "active" : ""}`} onClick={() => setNotifPref("none")}>
                  <input type="radio" name="memPref" checked={notifPref === "none"} onChange={() => {}} />
                  <div>
                    <strong>None</strong>
                    <p className="m-0 small text-muted">Turn off throwback memory notifications.</p>
                  </div>
                </label>
              </div>

              <div className="d-flex justify-content-end mt-4">
                <button 
                  className="btn btn-primary rounded-pill px-4"
                  onClick={() => {
                    showToast("⚙️ Memory preferences updated successfully!");
                    setShowSettingsModal(false);
                  }}
                >
                  Save Preferences
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toastMessage && (
        <div className="mem-floating-toast">
          {toastMessage}
        </div>
      )}
    </div>
  );
}

export default MemoriesPage;
