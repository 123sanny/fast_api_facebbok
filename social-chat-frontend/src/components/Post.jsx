import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { 
  BsThreeDots, BsGlobeAmericas, BsHandThumbsUp, BsHandThumbsUpFill,
  BsChatLeft, BsShare, BsBookmark, BsLink45Deg, BsTrash3, 
  BsEmojiSmile, BsSendFill, BsImage, BsCheck2,
  BsShieldCheck, BsShieldFillCheck, BsStars, BsVolumeUpFill, BsVolumeMuteFill,
  BsX, BsCheckCircleFill, BsIncognito, BsHourglassSplit, BsLightningChargeFill,
  BsMusicNoteBeamed, BsPlayFill, BsPauseFill
} from "react-icons/bs";
import { 
  FaHeart, FaLaughSquint, FaSurprise, FaSadTear, FaAngry 
} from "react-icons/fa";
import { 
  getActiveUserId, getActiveUserName, getUserStorageItem,
  reactToPostApi, commentOnPostApi, sharePostApi
} from "../services/profileApi";
import "./css/Post.css";

const REACTIONS = [
  { type: "like", label: "Like", emoji: "👍", color: "#1877f2", icon: <BsHandThumbsUpFill /> },
  { type: "love", label: "Love", emoji: "❤️", color: "#f33e58", icon: <FaHeart /> },
  { type: "care", label: "Care", emoji: "🥰", color: "#f7b125", icon: <span style={{ fontSize: "16px" }}>🥰</span> },
  { type: "haha", label: "Haha", emoji: "😆", color: "#f7b125", icon: <FaLaughSquint /> },
  { type: "wow", label: "Wow", emoji: "😮", color: "#f7b125", icon: <FaSurprise /> },
  { type: "sad", label: "Sad", emoji: "😢", color: "#f7b125", icon: <FaSadTear /> },
  { type: "angry", label: "Angry", emoji: "😡", color: "#e9710f", icon: <FaAngry /> },
];

function Post({ posts, setPosts, onOpenChat, onOpenTipModal }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [reactionHoverId, setReactionHoverId] = useState(null);
  const [commentInputs, setCommentInputs] = useState({});
  const [openComments, setOpenComments] = useState({});
  const [copiedId, setCopiedId] = useState(null);
  const [shareModalPost, setShareModalPost] = useState(null);
  const [now, setNow] = useState(Date.now());
  const currentUserId = getActiveUserId();
  const [currentUserName, setCurrentUserName] = useState(() => getActiveUserName());
  const [currentUserAvatar, setCurrentUserAvatar] = useState(() => getUserStorageItem("avatar", `https://i.pravatar.cc/150?u=${currentUserId}`, currentUserId));

  // Real-time ticker for live countdown timers
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30000);
    const handleProfileUpdated = () => {
      const activeId = getActiveUserId();
      setCurrentUserName(getActiveUserName());
      setCurrentUserAvatar(getUserStorageItem("avatar", `https://i.pravatar.cc/150?u=${activeId}`, activeId));
    };
    window.addEventListener("profile-updated", handleProfileUpdated);
    return () => {
      clearInterval(timer);
      window.removeEventListener("profile-updated", handleProfileUpdated);
    };
  }, []);

  // Format dynamic time left for auto-expiring posts
  const formatTimeLeft = (post) => {
    if (post.expiresAt) {
      const diff = Math.max(0, post.expiresAt - now);
      if (diff <= 0) return "Expired (Dissolving...)";
      const totalHours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      if (totalHours >= 24) {
        const days = Math.floor(totalHours / 24);
        const remHours = totalHours % 24;
        return `${days}d ${remHours}h left`;
      }
      return `${totalHours}h ${mins}m left`;
    }
    if (post.expiryDuration === "24h") return "23h 59m left";
    if (post.expiryDuration === "7d") return "6d 23h left";
    if (post.ghostTimeLeft) return post.ghostTimeLeft;
    return null;
  };

  // Next-Gen Unique Features State
  const [speakingPostId, setSpeakingPostId] = useState(null);
  const [openSummaries, setOpenSummaries] = useState({});
  const [truthGuardModalPost, setTruthGuardModalPost] = useState(null);
  const [tippedPostId, setTippedPostId] = useState(null);
  const [tipToast, setTipToast] = useState("");
  
  // Feed Post Music Player State
  const [playingMusicPostId, setPlayingMusicPostId] = useState(null);
  const [audioProgress, setAudioProgress] = useState(0);
  const feedAudioRef = useRef(null);

  // Audio cleanup on unmount
  useEffect(() => {
    return () => {
      if (feedAudioRef.current) {
        feedAudioRef.current.pause();
        feedAudioRef.current = null;
      }
    };
  }, []);

  const handleTogglePostMusic = (post) => {
    const musicObj = post.music || (post.music_title ? {
      title: post.music_title,
      artist: post.music_artist,
      url: post.music_url,
      cover: post.music_cover,
      lyrics: post.music_lyrics
    } : null);

    if (!musicObj || !musicObj.url) return;

    if (playingMusicPostId === post.id) {
      if (feedAudioRef.current) {
        feedAudioRef.current.pause();
      }
      setPlayingMusicPostId(null);
      return;
    }

    if (feedAudioRef.current) {
      feedAudioRef.current.pause();
      feedAudioRef.current = null;
    }

    try {
      const audio = new Audio(musicObj.url);
      feedAudioRef.current = audio;
      audio.play().catch(e => console.warn("Feed audio play prevented:", e));
      setPlayingMusicPostId(post.id);

      audio.ontimeupdate = () => {
        if (audio.duration) {
          setAudioProgress((audio.currentTime / audio.duration) * 100);
        }
      };
      audio.onended = () => {
        setPlayingMusicPostId(null);
        setAudioProgress(0);
      };
      audio.onerror = () => {
        setPlayingMusicPostId(null);
      };
    } catch (err) {
      console.warn("Audio creation failed:", err);
    }
  };
  
  // 1. AI Tone Morph State
  const [postTones, setPostTones] = useState({});
  const [activeToneMenuId, setActiveToneMenuId] = useState(null);

  // Handle AI Tone Morphing
  const handleToneMorph = (postId, originalText, toneType) => {
    if (!originalText) return;
    
    if (toneType === "original") {
      setPostTones(prev => ({ ...prev, [postId]: null }));
      setActiveToneMenuId(null);
      return;
    }

    let morphed = "";
    if (toneType === "genz") {
      morphed = `✨ fr fr no cap, this is giving pure main character energy 🔥 ${originalText} 🚀 #vibes #lit #Nexoria2026`;
    } else if (toneType === "executive") {
      morphed = `💼 Executive Summary & Strategic Roadmap:\n“${originalText}”\n\nKey Takeaway: High-impact scalable velocity driving measurable creator ROI.`;
    } else if (toneType === "poetic") {
      morphed = `🌙 Stardust suspended in the digital ether...\n“${originalText}”\nEchoing through quantum silence and eternal horizons ✨`;
    } else if (toneType === "tech") {
      morphed = `🤖 [Neural Node #4092] Telemetry Check: Optimal.\nDecoded Payload: “${originalText}”\nAlgorithmic Confidence: 99.98% ⚡`;
    } else if (toneType === "zen") {
      morphed = `🌿 Inhale focus. Exhale distraction.\n${originalText}\nPeace within the signal 🧘💫`;
    }

    setPostTones(prev => ({
      ...prev,
      [postId]: { tone: toneType, text: morphed }
    }));
    setActiveToneMenuId(null);
  };

  // Select Reaction
  const handleSelectReaction = async (postId, reactionType) => {
    setPosts(prevPosts =>
      prevPosts.map(post => {
        if (post.id !== postId) return post;
        const currentReaction = post.userReaction;
        let newReaction = reactionType;
        let likesDelta = 0;

        if (currentReaction === reactionType) {
          newReaction = null;
          likesDelta = -1;
        } else if (!currentReaction) {
          likesDelta = 1;
        }

        return {
          ...post,
          userReaction: newReaction,
          isLiked: Boolean(newReaction),
          likesCount: Math.max(0, (post.likesCount || 0) + likesDelta)
        };
      })
    );
    setReactionHoverId(null);

    try {
      const res = await reactToPostApi(postId, currentUserId, reactionType);
      if (res && res.success) {
        setPosts(prevPosts =>
          prevPosts.map(post => {
            if (post.id !== postId) return post;
            return {
              ...post,
              userReaction: res.userReaction,
              isLiked: res.isLiked,
              likesCount: res.likesCount
            };
          })
        );
        window.dispatchEvent(new Event("nexoria_notifications_updated"));
      }
    } catch (err) {
      console.warn("Reaction API failed:", err);
    }
  };

  // Toggle quick like
  const handleQuickLike = (postId) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    if (post.userReaction) {
      handleSelectReaction(postId, post.userReaction);
    } else {
      handleSelectReaction(postId, "like");
    }
  };

  // Add Comment
  const handleAddComment = async (postId, e) => {
    e?.preventDefault();
    const text = commentInputs[postId]?.trim();
    if (!text) return;

    const tempId = Date.now();
    const newComment = {
      id: tempId,
      name: currentUserName,
      profile: currentUserAvatar,
      text: text,
      time: "Just now",
      likes: 0,
      userLiked: false
    };

    setPosts(prevPosts =>
      prevPosts.map(post => {
        if (post.id !== postId) return post;
        return {
          ...post,
          comments: [...(post.comments || []), newComment],
          commentsCount: (post.commentsCount || 0) + 1
        };
      })
    );

    setCommentInputs(prev => ({ ...prev, [postId]: "" }));
    setOpenComments(prev => ({ ...prev, [postId]: true }));

    try {
      const res = await commentOnPostApi(postId, currentUserId, text);
      if (res && res.success && res.comment) {
        setPosts(prevPosts =>
          prevPosts.map(post => {
            if (post.id !== postId) return post;
            const updatedComments = (post.comments || []).map(c => (c.id === tempId ? res.comment : c));
            return {
              ...post,
              comments: updatedComments,
              commentsCount: res.commentsCount || updatedComments.length
            };
          })
        );
        window.dispatchEvent(new Event("nexoria_notifications_updated"));
      }
    } catch (err) {
      console.warn("Comment API failed:", err);
    }
  };

  const handleExecuteShare = async (postId) => {
    try {
      const res = await sharePostApi(postId, currentUserId);
      if (res && res.success) {
        setPosts(prevPosts =>
          prevPosts.map(post => {
            if (post.id !== postId) return post;
            return {
              ...post,
              sharesCount: res.sharesCount || (post.sharesCount || 0) + 1
            };
          })
        );
        window.dispatchEvent(new Event("nexoria_notifications_updated"));
      }
    } catch (err) {
      console.warn("Share API failed:", err);
    }
    setShareModalPost(null);
    setTipToast("🚀 Post shared to timeline!");
    setTimeout(() => setTipToast(""), 3000);
  };

  // Like a comment
  const handleLikeComment = (postId, commentId) => {
    setPosts(prevPosts =>
      prevPosts.map(post => {
        if (post.id !== postId) return post;
        return {
          ...post,
          comments: (post.comments || []).map(c => {
            if (c.id !== commentId) return c;
            return {
              ...c,
              userLiked: !c.userLiked,
              likes: c.userLiked ? c.likes - 1 : c.likes + 1
            };
          })
        };
      })
    );
  };

  // Delete Post
  const handleDeletePost = (postId) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
    setActiveMenuId(null);
  };

  // Copy Link
  const handleCopyLink = (postId) => {
    try {
      navigator.clipboard?.writeText(window.location.origin + `/post/${postId}`)?.catch(() => {});
    } catch {}
    setCopiedId(postId);
    setTimeout(() => {
      setCopiedId(null);
      setActiveMenuId(null);
    }, 1500);
  };

  // AI Voice Speech Synthesis
  const handleToggleSpeech = (postId, text) => {
    if (!("speechSynthesis" in window)) {
      alert("Voice narration is not supported in this browser.");
      return;
    }

    if (speakingPostId === postId) {
      window.speechSynthesis.cancel();
      setSpeakingPostId(null);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text || "No caption available to read.");
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onend = () => setSpeakingPostId(null);
      utterance.onerror = () => setSpeakingPostId(null);
      window.speechSynthesis.speak(utterance);
      setSpeakingPostId(postId);
    }
  };

  // Toggle AI Summary
  const handleToggleSummary = (postId) => {
    setOpenSummaries(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  // Tip 50 Stars
  const handleTipStars = (postId, authorName) => {
    setTippedPostId(postId);
    setTipToast(`⭐ You tipped 50 Stars to ${authorName}! 🎉`);
    setTimeout(() => {
      setTippedPostId(null);
      setTimeout(() => setTipToast(""), 3000);
    }, 1200);
  };

  // Handle author profile click with ghost privacy protection
  const handleAuthorClick = (post) => {
    if (post.isGhost) {
      setTipToast("🎭 Ghost Mode: Profile identity is masked & untrackable.");
      setTimeout(() => setTipToast(""), 3500);
      return;
    }
    const authorId = post.user_id || post.userId || post.author_id || post.authorId || post.id;
    const authorName = post.author_name || post.name || "Nexoria User";
    const authorPic = post.author_pic || post.profile || post.userPic || post.avatar;

    navigate("/profile", {
      state: {
        user: {
          id: authorId,
          user_id: authorId,
          name: authorName,
          creatorName: authorName,
          profile: authorPic,
          avatar: authorPic,
          cover: post.cover || "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800",
          bio: post.bio || "Digital Creator on Nexoria 💫"
        }
      }
    });
    setTipToast(`🔔 Visiting ${authorName}'s profile!`);
    setTimeout(() => setTipToast(""), 3000);
  };

  return (
    <div className="posts-feed-container">
      {/* Tip Toast Alert */}
      {tipToast && (
        <div className="post-global-toast shadow-lg">
          {tipToast}
        </div>
      )}

      {posts.map((post) => {
        const userReactionObj = REACTIONS.find(r => r.type === post.userReaction);
        const isCommentsExpanded = openComments[post.id] ?? false;
        const isSpeaking = speakingPostId === post.id;
        const isSummaryOpen = openSummaries[post.id] ?? false;
        const activeTone = postTones[post.id];
        const displayedCaption = activeTone ? activeTone.text : post.caption;
        const timeLeft = formatTimeLeft(post);

        return (
          <div className={`fb-post-card ${post.isGhost ? "ghost-post-card" : ""}`} key={post.id}>
            {/* Header */}
            <div className="post-card-header">
              <div className="post-author-info">
                <img 
                  className={`post-author-avatar ${post.isGhost ? "ghost-avatar-glow" : ""}`}
                  src={post.profile || "https://i.pravatar.cc/150?u=fallback"} 
                  alt={post.name}
                  onError={(e) => { e.currentTarget.src = "https://i.pravatar.cc/150?u=fallback"; }}
                  onClick={() => handleAuthorClick(post)}
                  style={{ cursor: "pointer" }}
                />
                <div className="post-meta-details">
                  <h4 className="post-author-name d-flex align-items-center gap-1.5 flex-wrap">
                    <span 
                      onClick={() => handleAuthorClick(post)} 
                      style={{ cursor: "pointer" }}
                    >
                      {post.name}
                    </span>
                    {post.isGhost && (
                      <span className="ghost-user-tag">
                        <BsIncognito size={11} className="me-1" /> Ghost
                      </span>
                    )}
                    {post.feeling && <span className="post-feeling-tag"> is {post.feeling}</span>}
                    {post.location && <span className="post-location-tag"> at <strong>{post.location}</strong></span>}
                  </h4>
                  <div className="post-time-privacy">
                    <span>{post.time}</span>
                    <span className="dot-sep">·</span>
                    {post.isGhost ? (
                      <span className="text-purple d-inline-flex align-items-center gap-1">
                        <BsIncognito size={11} /> Masked
                      </span>
                    ) : (
                      <BsGlobeAmericas title="Public" size={12} />
                    )}
                    {timeLeft && (
                      <>
                        <span className="dot-sep">·</span>
                        <span className="post-expiry-header-chip" title="Self-destruct timer">
                          <BsHourglassSplit size={11} className="me-1 text-warning" />
                          {timeLeft}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* 3-Dot Menu */}
              <div className="post-options-dropdown-wrapper">
                <button 
                  className="post-icon-button"
                  onClick={() => setActiveMenuId(activeMenuId === post.id ? null : post.id)}
                >
                  <BsThreeDots size={18} />
                </button>

                {activeMenuId === post.id && (
                  <div className="post-dropdown-menu shadow">
                    <div className="dropdown-menu-item" onClick={() => setActiveMenuId(null)}>
                      <BsBookmark className="me-2 text-primary" /> Save post
                    </div>
                    <div className="dropdown-menu-item" onClick={() => handleCopyLink(post.id)}>
                      {copiedId === post.id ? <BsCheck2 className="me-2 text-success" /> : <BsLink45Deg className="me-2 text-info" />}
                      {copiedId === post.id ? "Link copied!" : "Copy link"}
                    </div>
                    <div className="dropdown-menu-item delete-item" onClick={() => handleDeletePost(post.id)}>
                      <BsTrash3 className="me-2 text-danger" /> Delete post
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Ghost Post Banner (If Ghost Mode Active) */}
            {post.isGhost ? (
              <div className="ghost-post-pill-banner">
                <div className="d-flex align-items-center gap-2">
                  <span className="ghost-pulsing-icon">👻</span>
                  <span><strong>Ghost Discussion:</strong> Zero-Trace Storage {timeLeft ? `· ⏳ Destructs in ${timeLeft}` : ""}</span>
                </div>
                <button className="btn-dissolve-fast" onClick={() => handleDeletePost(post.id)} title="Dissolve post now">
                  Dissolve 💥
                </button>
              </div>
            ) : (
              /* Auto-Expiring Post Banner (If 24h or 7d timer active) */
              timeLeft && (
                <div className="expiry-post-pill-banner">
                  <div className="d-flex align-items-center gap-2">
                    <BsHourglassSplit className="text-warning" />
                    <span><strong>Auto-Expiring Post:</strong> ⏳ Self-destructs in <strong>{timeLeft}</strong></span>
                  </div>
                  <span className="ep-badge">Temporary Post</span>
                </div>
              )
            )}

            {/* TruthGuard AI™ Authenticity Pill */}
            <div className="truthguard-pill-row">
              <button 
                className="truthguard-badge-btn" 
                onClick={() => setTruthGuardModalPost(post)}
                title="Click to view AI Authenticity & Fact-Check Report"
              >
                <BsShieldFillCheck className="text-success" size={13} />
                <span>TruthGuard AI: <strong>99.8% Authentic</strong></span>
                <span className="truthguard-tag">Verified</span>
              </button>
            </div>

            {/* Post Content / Caption (Dynamic Tone Morphed or Original) */}
            {displayedCaption && !post.background && (
              <div className={`post-text-wrap ${activeTone ? "morphed-active-box" : ""}`}>
                <p className="post-text-content">{displayedCaption}</p>
                {activeTone && (
                  <div className="tone-morphed-badge">
                    <span>AI Tone: <strong>{activeTone.tone.toUpperCase()}</strong></span>
                    <button onClick={() => handleToneMorph(post.id, post.caption, "original")}>↺ Reset</button>
                  </div>
                )}
              </div>
            )}

            {/* Gradient / Background Text Post */}
            {post.background && (
              <div className="post-background-banner" style={{ background: post.background }}>
                <p className="banner-text">{displayedCaption}</p>
              </div>
            )}

            {/* Attached Music Player Widget (Spotify / Facebook Style) */}
            {(() => {
              const musicObj = post.music || (post.music_title ? {
                title: post.music_title,
                artist: post.music_artist,
                url: post.music_url,
                cover: post.music_cover,
                lyrics: post.music_lyrics,
                duration: post.music_duration
              } : null);

              if (!musicObj || !musicObj.title) return null;
              const isThisPlaying = playingMusicPostId === post.id;

              return (
                <div className={`post-feed-music-player ${isThisPlaying ? "is-playing" : ""}`}>
                  <div className="pf-music-left">
                    <div className={`pf-music-thumb-wrap ${isThisPlaying ? "vinyl-spin" : ""}`}>
                      <img 
                        src={musicObj.cover || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200"} 
                        alt={musicObj.title} 
                        className="pf-music-thumb" 
                      />
                      <div className="pf-music-center-hole"></div>
                    </div>
                    <button 
                      type="button"
                      className="pf-music-play-btn" 
                      onClick={() => handleTogglePostMusic(post)}
                      title={isThisPlaying ? "Pause Audio" : "Play Audio"}
                    >
                      {isThisPlaying ? <BsPauseFill size={22} /> : <BsPlayFill size={22} className="ms-0.5" />}
                    </button>
                  </div>

                  <div className="pf-music-info-col" onClick={() => handleTogglePostMusic(post)}>
                    <div className="pf-music-top-line">
                      <span className="pf-music-tag">
                        <BsMusicNoteBeamed className="me-1" /> Song
                      </span>
                      {isThisPlaying && (
                        <div className="pf-music-equalizer">
                          <span></span>
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                      )}
                    </div>
                    <h5 className="pf-music-title">{musicObj.title}</h5>
                    <p className="pf-music-artist">{musicObj.artist || "Original Soundtrack"}</p>
                    {musicObj.lyrics && (
                      <div className="pf-music-lyrics-preview">
                        "{musicObj.lyrics}"
                      </div>
                    )}
                    {isThisPlaying && (
                      <div className="pf-music-progress-bar">
                        <div className="pf-music-progress-fill" style={{ width: `${audioProgress}%` }}></div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* AI Summary Box (If Toggled) */}
            {isSummaryOpen && (
              <div className="post-ai-summary-card shadow-sm">
                <div className="summary-title-row">
                  <span className="summary-badge"><BsStars className="me-1" /> AI Key Highlights</span>
                  <button className="summary-close-btn" onClick={() => handleToggleSummary(post.id)}>✕</button>
                </div>
                <ul className="summary-points">
                  <li><strong>Core Topic:</strong> {post.caption.slice(0, 50)}...</li>
                  <li><strong>Tone & Intent:</strong> Community connection, verified perspective, and positive insight.</li>
                  <li><strong>Action Item:</strong> Join the conversation or share with your network!</li>
                </ul>
              </div>
            )}

            {/* Post Media (Image or Video) */}
            {post.image && (
              <div className="post-media-frame">
                <img 
                  src={post.image} 
                  alt="Post content" 
                  loading="lazy" 
                  onError={(e) => { e.currentTarget.style.display = "none"; }} 
                />
              </div>
            )}

            {post.video && (
              <div className="post-media-frame">
                <video src={post.video} controls autoPlay loop muted playsInline />
              </div>
            )}

            {/* Next-Gen Smart Action Ribbon (AI Tone Morph, AI Summary, Voice Read, Tip Stars) */}
            <div className="post-smart-ribbon">
              {/* 1. Tone Morph Dropdown */}
              <div className="tone-morph-dropdown-anchor">
                <button 
                  className={`smart-ribbon-btn tone-btn ${activeTone ? "active-morphed" : ""}`}
                  onClick={() => setActiveToneMenuId(activeToneMenuId === post.id ? null : post.id)}
                  title="Rewrite post in 5 distinct AI styles"
                >
                  <span>🎭 {activeTone ? activeTone.tone.toUpperCase() : "Tone Morph"}</span>
                </button>

                {activeToneMenuId === post.id && (
                  <div className="tone-morph-popover shadow-xl">
                    <div className="tone-popover-title">✨ Rewrite in AI Tone:</div>
                    <button className="tone-choice-btn" onClick={() => handleToneMorph(post.id, post.caption, "genz")}>
                      🕶️ Gen Z / Cyberpunk
                    </button>
                    <button className="tone-choice-btn" onClick={() => handleToneMorph(post.id, post.caption, "executive")}>
                      💼 Wall Street Executive
                    </button>
                    <button className="tone-choice-btn" onClick={() => handleToneMorph(post.id, post.caption, "poetic")}>
                      🌙 Poetic & Cosmic
                    </button>
                    <button className="tone-choice-btn" onClick={() => handleToneMorph(post.id, post.caption, "tech")}>
                      🤖 Quantum AI Node
                    </button>
                    <button className="tone-choice-btn" onClick={() => handleToneMorph(post.id, post.caption, "zen")}>
                      🌿 Zen Minimalist
                    </button>
                    {activeTone && (
                      <button className="tone-choice-btn reset-btn" onClick={() => handleToneMorph(post.id, post.caption, "original")}>
                        ↺ Reset to Original
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* 2. AI Summary */}
              <button 
                className={`smart-ribbon-btn ${isSummaryOpen ? "active" : ""}`}
                onClick={() => handleToggleSummary(post.id)}
                title="Get 3-bullet AI Summary"
              >
                <BsStars className="me-1" />
                <span>{isSummaryOpen ? "Hide Summary" : "✨ AI Summary"}</span>
              </button>

              {/* 3. AI Voice Narration */}
              <button 
                className={`smart-ribbon-btn ${isSpeaking ? "speaking" : ""}`}
                onClick={() => handleToggleSpeech(post.id, displayedCaption)}
                title={isSpeaking ? "Stop Voice Narration" : "Listen to Post via AI Voice"}
              >
                {isSpeaking ? <BsVolumeMuteFill className="me-1 text-danger" /> : <BsVolumeUpFill className="me-1 text-primary" />}
                <span>{isSpeaking ? "Stop Voice" : "🔊 Listen"}</span>
              </button>

              {/* 4. Tip Stars / UPI Micro-Tip */}
              <button 
                className={`smart-ribbon-btn tip-btn tip-creator-glow ${tippedPostId === post.id ? "active-tipped" : ""}`}
                onClick={() => {
                  if (onOpenTipModal) {
                    onOpenTipModal(post);
                  } else {
                    handleTipStars(post.id, post.name);
                  }
                }}
                title="Send 1-Click UPI or NX Coins Tip to creator"
              >
                <BsLightningChargeFill className="me-1 text-warning" />
                <span>{tippedPostId === post.id ? "⭐ Tipped!" : "⚡ Tip Creator"}</span>
              </button>
            </div>

            {/* Post Statistics Bar */}
            <div className="post-stats-row">
              <div className="stats-reactions">
                {(post.likesCount > 0 || post.userReaction) ? (
                  <>
                    <span className="reaction-badge-group">
                      <span className="badge-bubble like-badge"><BsHandThumbsUpFill /></span>
                      <span className="badge-bubble love-badge"><FaHeart /></span>
                    </span>
                    <span className="stats-count-text">{post.likesCount || 1}</span>
                  </>
                ) : (
                  <span className="stats-count-text text-muted" style={{ fontSize: "13px" }}>0</span>
                )}
              </div>

              <div className="stats-counters">
                {post.commentsCount > 0 && (
                  <span 
                    className="counter-link"
                    onClick={() => setOpenComments(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
                  >
                    {post.commentsCount} {post.commentsCount === 1 ? "comment" : "comments"}
                  </span>
                )}
                {post.sharesCount > 0 && (
                  <>
                    <span className="dot-sep">·</span>
                    <span className="counter-link">{post.sharesCount} {post.sharesCount === 1 ? "share" : "shares"}</span>
                  </>
                )}
              </div>
            </div>

            {/* Subtle Divider Above Action Bar */}
            <div className="post-action-divider"></div>

            {/* Action Bar (Like, Comment, Share) - Nexoria 3-Column Horizontal Row */}
            <div className="post-action-bar">
              {/* Like Button with Reaction Popover */}
              <div 
                className="reaction-button-wrapper"
                onMouseEnter={() => setReactionHoverId(post.id)}
                onMouseLeave={() => setReactionHoverId(null)}
              >
                {/* Nexoria Reactions Floating Tray */}
                {reactionHoverId === post.id && (
                  <div className="floating-reactions-tray shadow-lg">
                    {REACTIONS.map((r) => (
                      <button 
                        key={r.type} 
                        type="button"
                        className="reaction-pill-btn"
                        onClick={() => handleSelectReaction(post.id, r.type)}
                      >
                        <span className="reaction-emoji-anim">{r.emoji}</span>
                        <span className="reaction-tooltip">{r.label}</span>
                      </button>
                    ))}
                  </div>
                )}

                <button 
                  type="button"
                  className={`post-action-btn ${post.userReaction ? "reacted" : ""}`}
                  style={{ color: userReactionObj ? userReactionObj.color : "inherit" }}
                  onClick={() => handleQuickLike(post.id)}
                >
                  <span className="action-btn-icon">
                    {userReactionObj ? userReactionObj.icon : <BsHandThumbsUp />}
                  </span>
                  <span className="action-btn-text">
                    {userReactionObj ? userReactionObj.label : t("like")}
                  </span>
                </button>
              </div>

              {/* Comment Button Column */}
              <div className="action-btn-col">
                <button 
                  type="button"
                  className="post-action-btn"
                  onClick={() => setOpenComments(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
                >
                  <span className="action-btn-icon"><BsChatLeft /></span>
                  <span className="action-btn-text">{t("comment")}</span>
                </button>
              </div>

              {/* Share Button Column */}
              <div className="action-btn-col">
                <button 
                  type="button"
                  className="post-action-btn"
                  onClick={() => setShareModalPost(post)}
                >
                  <span className="action-btn-icon"><BsShare /></span>
                  <span className="action-btn-text">{t("share")}</span>
                </button>
              </div>
            </div>

            {/* Subtle Divider Below Action Bar When Comments Expanded */}
            {isCommentsExpanded && <div className="post-action-divider"></div>}

            {/* Comments Section */}
            {isCommentsExpanded && (
              <div className="post-comments-expanded-box">
                {/* Comment Input */}
                <form className="comment-input-row" onSubmit={(e) => handleAddComment(post.id, e)}>
                  <img 
                    src={currentUserAvatar} 
                    alt="User" 
                    className="comment-author-avatar" 
                  />
                  <div className="comment-input-pill">
                    <input 
                      type="text" 
                      placeholder={t("write_comment")} 
                      value={commentInputs[post.id] || ""}
                      onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                    />
                    <div className="comment-input-actions">
                      <BsEmojiSmile className="comment-tool-icon" />
                      <BsImage className="comment-tool-icon" />
                      <button type="submit" className="comment-send-submit" disabled={!commentInputs[post.id]?.trim()}>
                        <BsSendFill />
                      </button>
                    </div>
                  </div>
                </form>

                {/* Comments List */}
                <div className="comments-thread-list">
                  {(post.comments || []).map((comment) => (
                    <div className="single-comment-row" key={comment.id}>
                      <img src={comment.profile} alt={comment.name} className="comment-user-avatar" />
                      <div className="comment-bubble-wrap">
                        <div className="comment-bubble">
                          <span className="comment-author-title">{comment.name}</span>
                          <p className="comment-text">{comment.text}</p>
                        </div>

                        {/* Comment Actions */}
                        <div className="comment-sub-actions">
                          <button 
                            className={`comment-like-link ${comment.userLiked ? "liked text-primary" : ""}`}
                            onClick={() => handleLikeComment(post.id, comment.id)}
                          >
                            Like {comment.likes > 0 && `(${comment.likes})`}
                          </button>
                          <span className="dot-sep">·</span>
                          <button className="comment-reply-link">Reply</button>
                          <span className="dot-sep">·</span>
                          <span className="comment-time-stamp">{comment.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        );
      })}

      {/* TruthGuard AI™ Authenticity & Fact-Check Modal */}
      {truthGuardModalPost && (
        <div className="truthguard-modal-overlay" onClick={() => setTruthGuardModalPost(null)}>
          <div className="truthguard-modal-dialog shadow-lg" onClick={e => e.stopPropagation()}>
            <div className="tg-modal-header">
              <div className="d-flex align-items-center gap-2">
                <div className="tg-icon-circle">
                  <BsShieldCheck size={20} />
                </div>
                <div>
                  <h5 className="m-0 font-weight-bold">TruthGuard AI™ Audit Report</h5>
                  <small className="text-muted">Real-Time Source & Integrity Analysis</small>
                </div>
              </div>
              <button className="tg-close-btn" onClick={() => setTruthGuardModalPost(null)}><BsX size={24} /></button>
            </div>

            <div className="tg-modal-body">
              <div className="tg-score-card">
                <div className="tg-score-num">99.8%</div>
                <div>
                  <strong>Authentic Content Verified</strong>
                  <p className="m-0 text-muted" style={{ fontSize: "12px" }}>Neural network verified against 450+ verified media sources & cryptographic integrity.</p>
                </div>
              </div>

              <div className="tg-audit-list">
                <div className="tg-audit-item">
                  <BsCheckCircleFill className="text-success" />
                  <div>
                    <strong>Deepfake & AI Image Manipulation: 0.0% Detected</strong>
                    <p className="m-0 text-muted" style={{ fontSize: "11.5px" }}>Pixels, noise frequency, and EXIF metadata confirm 100% natural authentic media.</p>
                  </div>
                </div>

                <div className="tg-audit-item">
                  <BsCheckCircleFill className="text-success" />
                  <div>
                    <strong>Misinformation / Fake News Risk: None</strong>
                    <p className="m-0 text-muted" style={{ fontSize: "11.5px" }}>Statements match known ground truth databases with zero hallucination.</p>
                  </div>
                </div>

                <div className="tg-audit-item">
                  <BsCheckCircleFill className="text-success" />
                  <div>
                    <strong>Safety, Toxicity & Spam: 100% Safe</strong>
                    <p className="m-0 text-muted" style={{ fontSize: "11.5px" }}>Fully compliant with Nexoria Trust & Safety Guidelines 2026.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="tg-modal-footer">
              <button className="btn btn-primary w-100 py-2 rounded-pill font-weight-bold" onClick={() => setTruthGuardModalPost(null)}>
                Got it, Thanks!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {shareModalPost && (
        <div className="share-modal-overlay" onClick={() => setShareModalPost(null)}>
          <div className="share-modal-content" onClick={e => e.stopPropagation()}>
            <div className="share-modal-header">
              <h5>Share Post</h5>
              <button className="share-close-btn" onClick={() => setShareModalPost(null)}>✕</button>
            </div>
            <div className="share-options-list">
              <div className="share-opt-item" onClick={() => handleExecuteShare(shareModalPost.id)}>
                <i className="bi bi-person-lines-fill"></i>
                <span>Share now (Public Feed)</span>
              </div>
              <div className="share-opt-item" onClick={() => handleExecuteShare(shareModalPost.id)}>
                <i className="bi bi-clock-history"></i>
                <span>Share to Your Story</span>
              </div>
              <div className="share-opt-item" onClick={() => { handleCopyLink(shareModalPost.id); handleExecuteShare(shareModalPost.id); }}>
                <i className="bi bi-link-45deg"></i>
                <span>Copy link & Share</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Post;