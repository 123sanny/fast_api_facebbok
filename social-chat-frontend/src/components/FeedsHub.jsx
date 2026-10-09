import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BsRssFill, BsStarFill, BsPeopleFill, BsFlagFill,
  BsClockHistory, BsFilterCircleFill, BsHeartFill, BsChatDotsFill,
  BsShareFill, BsBookmarkFill, BsBookmark, BsShieldCheck,
  BsMusicNote, BsThreeDots, BsPlayFill, BsPauseFill
} from "react-icons/bs";
import Header from "./Header";
import KeywordFilterModal from "./KeywordFilterModal";
import { getActiveUserId } from "../services/profileApi";
import { fetchFilteredFeedApi, toggleSaveItemApi } from "../services/communityHubApi";
import "./css/FeedsHub.css";

const FEED_CHANNELS = [
  { id: "all", label: "All Feeds", icon: BsRssFill, color: "#22c55e", desc: "Combined stream of all creators, friends & pages" },
  { id: "favorites", label: "Favorites", icon: BsStarFill, color: "#eab308", desc: "Top Star creators and your closest connections" },
  { id: "friends", label: "Friends Only", icon: BsPeopleFill, color: "#3b82f6", desc: "Posts only from your accepted friends" },
  { id: "pages", label: "Pages & Brands", icon: BsFlagFill, color: "#ef4444", desc: "Official updates, tech news & music releases" },
  { id: "recent", label: "Most Recent", icon: BsClockHistory, color: "#a855f7", desc: "Strict reverse-chronological timeline" }
];

function FeedsHub() {
  const navigate = useNavigate();
  const currentUserId = getActiveUserId() || 1;

  const [activeChannel, setActiveChannel] = useState("all");
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Audio playback state for posts with music
  const [playingAudioId, setPlayingAudioId] = useState(null);
  const [audioObj, setAudioObj] = useState(null);

  // Content Shield / Keyword Filter
  const [showKeywordModal, setShowKeywordModal] = useState(false);
  const [activeKeywords, setActiveKeywords] = useState(["politics", "spoilers"]);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadFeed = async () => {
    setIsLoading(true);
    try {
      const res = await fetchFilteredFeedApi(activeChannel, currentUserId);
      if (res && res.success) {
        setPosts(res.data || []);
      }
    } catch (err) {
      console.error("Error loading feed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFeed();
  }, [activeChannel]);

  // Audio Play / Pause
  const handleToggleMusic = (postId, musicUrl) => {
    if (!musicUrl) return;

    if (playingAudioId === postId) {
      audioObj?.pause();
      setPlayingAudioId(null);
    } else {
      if (audioObj) audioObj.pause();
      const newAudio = new Audio(musicUrl);
      newAudio.play().catch(() => {});
      newAudio.onended = () => setPlayingAudioId(null);
      setAudioObj(newAudio);
      setPlayingAudioId(postId);
    }
  };

  // Toggle Save Bookmark
  const handleSaveToggle = async (postId) => {
    try {
      const res = await toggleSaveItemApi({
        user_id: currentUserId,
        post_id: postId
      });
      if (res && res.success) {
        showToast(res.is_saved ? "📌 Post saved to bookmarks!" : "Post unsaved");
      }
    } catch (err) {
      showToast("❌ Could not update saved bookmark");
    }
  };

  // Filter posts with active blocked keywords
  const visiblePosts = posts.filter(p => {
    if (!p.caption) return true;
    const text = p.caption.toLowerCase();
    return !activeKeywords.some(kw => text.includes(kw.toLowerCase()));
  });

  const activeChannelObj = FEED_CHANNELS.find(c => c.id === activeChannel) || FEED_CHANNELS[0];

  return (
    <div className="feeds-hub-wrapper">
      <Header />

      <div className="feeds-main-layout container-fluid">
        {/* Left Sidebar */}
        <aside className="feeds-left-sidebar">
          <div className="feeds-sidebar-header">
            <div className="d-flex align-items-center gap-2">
              <div className="feeds-badge-icon">
                <BsRssFill size={20} />
              </div>
              <h4 className="m-0 font-weight-bold">Feeds</h4>
            </div>
            <button 
              className="btn-shield-trigger"
              onClick={() => setShowKeywordModal(true)}
              title="Content Shield & Keyword Muting"
            >
              <BsFilterCircleFill size={18} />
            </button>
          </div>

          <p className="feeds-sidebar-desc">
            Select a custom view to filter your timeline into dedicated channels.
          </p>

          {/* Channels List */}
          <div className="feeds-channels-list">
            {FEED_CHANNELS.map(ch => {
              const IconComponent = ch.icon;
              return (
                <button
                  key={ch.id}
                  className={`feed-channel-btn ${activeChannel === ch.id ? "active" : ""}`}
                  onClick={() => setActiveChannel(ch.id)}
                >
                  <div className="channel-icon-bubble" style={{ color: ch.color }}>
                    <IconComponent size={18} />
                  </div>
                  <div className="channel-text-info">
                    <span className="channel-title">{ch.label}</span>
                    <small className="channel-desc">{ch.desc}</small>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Content Shield Status Widget */}
          <div className="content-shield-mini-card mt-auto" onClick={() => setShowKeywordModal(true)}>
            <div className="d-flex align-items-center justify-content-between mb-1">
              <span className="shield-label">
                <BsFilterCircleFill className="me-1 text-info" /> Content Shield
              </span>
              <span className="shield-active-pill">Active</span>
            </div>
            <p className="shield-desc">
              {activeKeywords.length} topic keywords muted. Click to configure.
            </p>
          </div>
        </aside>

        {/* Right Main Feed Stream */}
        <main className="feeds-content-area">
          {/* Top Channel Header Banner */}
          <div className="feed-channel-banner">
            <div className="d-flex align-items-center gap-3">
              <div className="banner-icon-circle" style={{ color: activeChannelObj.color }}>
                {React.createElement(activeChannelObj.icon, { size: 24 })}
              </div>
              <div>
                <h4 className="m-0 font-weight-bold">{activeChannelObj.label}</h4>
                <p className="m-0 text-muted small">{activeChannelObj.desc}</p>
              </div>
            </div>

            <div className="d-flex align-items-center gap-2">
              <button 
                className="btn-content-shield-btn"
                onClick={() => setShowKeywordModal(true)}
              >
                <BsFilterCircleFill className="me-1.5" /> Content Shield ({activeKeywords.length})
              </button>
            </div>
          </div>

          {/* Posts Stream */}
          {isLoading ? (
            <div className="feed-skeleton-stream">
              {[1, 2, 3].map(n => (
                <div key={n} className="feed-skeleton-card"></div>
              ))}
            </div>
          ) : visiblePosts.length === 0 ? (
            <div className="feeds-empty-state">
              <div className="empty-rss-circle">
                <BsRssFill size={36} />
              </div>
              <h5>No posts in this feed channel</h5>
              <p className="text-muted">
                Posts matching "{activeChannelObj.label}" will appear here as your network publishes updates.
              </p>
              <button className="btn btn-primary rounded-pill px-4" onClick={() => setActiveChannel("all")}>
                View All Feeds
              </button>
            </div>
          ) : (
            <div className="feeds-posts-stream">
              {visiblePosts.map(post => (
                <div key={post.id} className="feed-post-card shadow-lg">
                  {/* Author Header */}
                  <div className="post-header-row">
                    <div className="d-flex align-items-center gap-2.5">
                      <img src={post.profile || "https://i.pravatar.cc/150"} alt="" className="post-author-pic" />
                      <div>
                        <div className="d-flex align-items-center gap-1">
                          <strong className="post-author-name">{post.name}</strong>
                          {post.is_verified && <BsShieldCheck className="text-primary small" />}
                        </div>
                        <small className="post-time-text">{post.time || "Recently"}</small>
                      </div>
                    </div>

                    <button className="btn-post-menu" onClick={() => handleSaveToggle(post.id)}>
                      <BsBookmarkFill className="text-muted hover-purple" />
                    </button>
                  </div>

                  {/* Caption */}
                  {post.caption && (
                    <div className="post-caption-box">
                      <p>{post.caption}</p>
                    </div>
                  )}

                  {/* Music Player Bar (if attached) */}
                  {post.music && (
                    <div className="post-music-pill" onClick={() => handleToggleMusic(post.id, post.music.url)}>
                      <div className="music-cover-wrap">
                        <img src={post.music.cover || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100"} alt="" />
                        <div className="music-play-btn-circle">
                          {playingAudioId === post.id ? <BsPauseFill size={14} /> : <BsPlayFill size={14} />}
                        </div>
                      </div>
                      <div className="music-details flex-grow-1">
                        <div className="d-flex align-items-center gap-1">
                          <BsMusicNote className="text-warning small" />
                          <strong className="music-title text-truncate">{post.music.title}</strong>
                        </div>
                        <span className="music-artist">{post.music.artist}</span>
                      </div>
                      <span className="music-status-tag">{playingAudioId === post.id ? "Playing 🎵" : "30s Preview"}</span>
                    </div>
                  )}

                  {/* Image / Video Media */}
                  {post.image && (
                    <div className="post-media-container">
                      <img src={post.image} alt="" />
                    </div>
                  )}

                  {/* Social Counters */}
                  <div className="post-social-counters">
                    <div className="d-flex align-items-center gap-1 text-muted small">
                      <BsHeartFill className="text-danger" />
                      <span>{post.likesCount || 0}</span>
                    </div>
                    <div className="d-flex align-items-center gap-3 text-muted small">
                      <span>{post.commentsCount || 0} comments</span>
                      <span>{post.sharesCount || 0} shares</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="post-action-buttons-row">
                    <button className="btn-action-feed">
                      <BsHeartFill className="me-1.5 text-danger" /> Like
                    </button>
                    <button className="btn-action-feed">
                      <BsChatDotsFill className="me-1.5 text-info" /> Comment
                    </button>
                    <button className="btn-action-feed" onClick={() => { showToast("🚀 Post shared to your timeline!"); }}>
                      <BsShareFill className="me-1.5 text-success" /> Share
                    </button>
                    <button className="btn-action-feed" onClick={() => handleSaveToggle(post.id)}>
                      <BsBookmark className="me-1.5 text-warning" /> Save
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Content Shield & Keyword Filter Modal */}
      {showKeywordModal && (
        <KeywordFilterModal 
          activeKeywords={activeKeywords}
          onSaveKeywords={(kws) => {
            setActiveKeywords(kws);
            showToast("🛡️ Content Shield filter updated!");
          }}
          onClose={() => setShowKeywordModal(false)}
          filteredCount={posts.length - visiblePosts.length}
        />
      )}

      {/* Toast */}
      {toastMessage && (
        <div className="feeds-floating-toast">
          {toastMessage}
        </div>
      )}
    </div>
  );
}

export default FeedsHub;
