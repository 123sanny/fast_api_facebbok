import React, { useState, useEffect, useCallback, useRef } from "react";
import { 
  BsPlusLg, BsChevronLeft, BsChevronRight, BsX, 
  BsPauseFill, BsPlayFill, BsSendFill,
  BsVolumeUpFill, BsVolumeMuteFill, BsMusicNoteBeamed
} from "react-icons/bs";
import { getActiveUserId, getUserStorageItem } from "../services/profileApi";
import { 
  fetchStoriesFeedApi, 
  viewStoryApi, 
  getStoryMediaUrl 
} from "../services/storiesApi";
import "./css/Stories.css";

function Stories({ onOpenCreateStory }) {
  const currentUserId = Number(getActiveUserId());
  const [stories, setStories] = useState([]);
  const [activeStoryIndex, setActiveStoryIndex] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [sentReaction, setSentReaction] = useState(null);
  const [currentUserPic, setCurrentUserPic] = useState(() => 
    getUserStorageItem("avatar", `https://i.pravatar.cc/150?u=${currentUserId}`, currentUserId)
  );

  const audioRef = useRef(null);

  // 1. Fetch Dynamic Stories from FastAPI Database
  const loadStories = useCallback(async () => {
    if (!currentUserId) return;
    try {
      const res = await fetchStoriesFeedApi(currentUserId);
      if (res && res.success && Array.isArray(res.data)) {
        setStories(res.data);
      }
    } catch (err) {
      console.warn("Failed to load stories:", err);
    }
  }, [currentUserId]);

  useEffect(() => {
    loadStories();

    const handleStoryCreated = () => {
      loadStories();
    };

    const handleProfileUpdate = () => {
      const activeId = getActiveUserId();
      setCurrentUserPic(getUserStorageItem("avatar", `https://i.pravatar.cc/150?u=${activeId}`, activeId));
    };

    window.addEventListener("nexoria_story_created", handleStoryCreated);
    window.addEventListener("profile-updated", handleProfileUpdate);

    return () => {
      window.removeEventListener("nexoria_story_created", handleStoryCreated);
      window.removeEventListener("profile-updated", handleProfileUpdate);
    };
  }, [loadStories]);

  const currentActiveStory = activeStoryIndex !== null ? stories[activeStoryIndex] : null;

  // Background Audio Player for Stories with Music
  useEffect(() => {
    if (!currentActiveStory || activeStoryIndex === null) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      return;
    }

    if (currentActiveStory.music_url) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(currentActiveStory.music_url);
      audio.muted = isMuted;
      audio.loop = true;
      if (!isPaused) {
        audio.play().catch(e => console.warn("Story audio playback blocked:", e));
      }
      audioRef.current = audio;
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [activeStoryIndex, currentActiveStory?.id]);

  // Audio Pause / Resume and Mute Control
  useEffect(() => {
    if (audioRef.current) {
      if (isPaused) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(e => console.warn(e));
      }
      audioRef.current.muted = isMuted;
    }
  }, [isPaused, isMuted]);

  // Story Progress Timer
  useEffect(() => {
    if (activeStoryIndex === null || isPaused || !stories.length) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          // Move to next story
          if (activeStoryIndex < stories.length - 1) {
            const nextIdx = activeStoryIndex + 1;
            setActiveStoryIndex(nextIdx);
            const nextStory = stories[nextIdx];
            if (nextStory && currentUserId) {
              viewStoryApi(nextStory.id, currentUserId);
            }
            return 0;
          } else {
            // Close viewer
            setActiveStoryIndex(null);
            return 0;
          }
        }
        return prev + 2; // 50 ticks = 5 seconds
      });
    }, 100);

    return () => clearInterval(interval);
  }, [activeStoryIndex, isPaused, stories, currentUserId]);

  const handleOpenStory = (index) => {
    setActiveStoryIndex(index);
    setProgress(0);
    setIsPaused(false);
    const selected = stories[index];
    if (selected && currentUserId) {
      viewStoryApi(selected.id, currentUserId);
      setStories((prev) => prev.map((s, i) => i === index ? { ...s, has_viewed: true } : s));
    }
  };

  const handlePrevStory = () => {
    if (activeStoryIndex > 0) {
      const prevIdx = activeStoryIndex - 1;
      setActiveStoryIndex(prevIdx);
      setProgress(0);
      const prevStory = stories[prevIdx];
      if (prevStory && currentUserId) {
        viewStoryApi(prevStory.id, currentUserId);
      }
    }
  };

  const handleNextStory = () => {
    if (activeStoryIndex < stories.length - 1) {
      const nextIdx = activeStoryIndex + 1;
      setActiveStoryIndex(nextIdx);
      setProgress(0);
      const nextStory = stories[nextIdx];
      if (nextStory && currentUserId) {
        viewStoryApi(nextStory.id, currentUserId);
      }
    } else {
      setActiveStoryIndex(null);
    }
  };

  const handleSendReaction = (emoji) => {
    setSentReaction(emoji);
    const activeStory = stories[activeStoryIndex];
    if (activeStory && currentUserId) {
      viewStoryApi(activeStory.id, currentUserId, emoji);
    }
    setTimeout(() => setSentReaction(null), 1500);
  };

  const handleSendReply = (e) => {
    e?.preventDefault();
    if (!replyText.trim() || activeStoryIndex === null) return;
    const currentStory = stories[activeStoryIndex];
    
    // Broadcast message to open chat drawer with author
    window.dispatchEvent(new CustomEvent("open-direct-chat", {
      detail: {
        id: currentStory.user_id,
        name: currentStory.name,
        img: currentStory.user_img,
        initialMessage: `Replying to your story: "${replyText}"`
      }
    }));

    alert(`Reply sent to ${currentStory.name}: "${replyText}"`);
    setReplyText("");
  };

  return (
    <div className="fb-stories-wrapper">
      {/* Stories Horizontal Tray */}
      <div className="stories-tray-container">
        
        {/* Create Story Card */}
        <div className="story-card create-story-card" onClick={onOpenCreateStory}>
          <div className="create-story-top-thumb">
            <img src={currentUserPic} alt="User" />
          </div>
          <div className="create-plus-badge">
            <BsPlusLg size={16} />
          </div>
          <p className="create-story-label">Add story</p>
        </div>

        {/* Dynamic Stories List */}
        {stories.map((story, index) => {
          const isTextStory = story.media_type === "text" || (!story.media_url && !story.storyImg);
          const isMusicStory = story.media_type === "music" || Boolean(story.music_title);
          const isUnviewed = !story.has_viewed && !story.is_own_story;
          
          return (
            <div 
              key={story.id || index} 
              className={`story-card user-story-card ${story.is_own_story ? "own-story" : ""} ${isUnviewed ? "unviewed" : ""}`}
              onClick={() => handleOpenStory(index)}
              style={isTextStory || isMusicStory ? { background: story.background_gradient } : {}}
            >
              {isMusicStory ? (
                <div className="story-card-music-preview">
                  <div className="tray-music-vinyl">
                    <img src={story.music_cover || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=100"} alt="" />
                  </div>
                  <span className="tray-music-badge">
                    <BsMusicNoteBeamed size={11} /> {story.music_title || "Song"}
                  </span>
                </div>
              ) : isTextStory ? (
                <div className="story-card-text-preview">
                  <p className={`preview-text font-${(story.font_style || "clean").toLowerCase()}`}>
                    {story.text_overlay || "Status Update"}
                  </p>
                </div>
              ) : (
                <img 
                  className="story-bg-image" 
                  src={getStoryMediaUrl(story.media_url || story.storyImg)} 
                  alt={story.name}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600";
                  }}
                />
              )}

              {/* Music Indicator Badge if Photo Story has Music */}
              {story.music_title && !isMusicStory && (
                <div className="story-has-music-icon" title={`Soundtrack: ${story.music_title}`}>
                  <BsMusicNoteBeamed size={11} />
                </div>
              )}

              {/* Author Avatar Pill */}
              <div className="story-user-avatar-wrap">
                <img 
                  src={story.user_img || story.userImg || `https://i.pravatar.cc/150?u=${story.user_id}`} 
                  alt={story.name} 
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = `https://i.pravatar.cc/150?u=${story.user_id}`;
                  }}
                />
              </div>

              {/* Author Name */}
              <span className="story-user-name">
                {story.is_own_story ? "Your story" : story.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* Fullscreen Story Viewer Modal */}
      {currentActiveStory && (
        <div className="story-viewer-modal-backdrop" onClick={() => setActiveStoryIndex(null)}>
          
          {/* Close Button Top Right */}
          <button className="story-modal-close-btn" onClick={() => setActiveStoryIndex(null)} title="Close">
            <BsX size={32} />
          </button>

          {/* Left Arrow */}
          {activeStoryIndex > 0 && (
            <button className="story-nav-btn prev" onClick={(e) => { e.stopPropagation(); handlePrevStory(); }} title="Previous">
              <BsChevronLeft size={24} />
            </button>
          )}

          {/* Story Container */}
          <div className="story-content-viewport" onClick={(e) => e.stopPropagation()}>
            
            {/* Top Progress Bar */}
            <div className="story-progress-bar-track">
              {stories.map((s, i) => (
                <div key={s.id || i} className="progress-segment">
                  <div 
                    className="progress-fill" 
                    style={{
                      width: i < activeStoryIndex ? "100%" : i === activeStoryIndex ? `${progress}%` : "0%"
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Story Header */}
            <div className="story-viewer-header">
              <div className="viewer-user-meta">
                <img 
                  src={currentActiveStory.user_img || currentActiveStory.userImg || `https://i.pravatar.cc/150?u=${currentActiveStory.user_id}`} 
                  alt="" 
                  className="viewer-avatar" 
                />
                <div>
                  <h6>{currentActiveStory.is_own_story ? "Your Story" : currentActiveStory.name}</h6>
                  <span>{currentActiveStory.time_ago || currentActiveStory.time || "Just now"}</span>
                </div>
              </div>

              {/* Music Badge in Story Header */}
              {currentActiveStory.music_title && (
                <div className="viewer-music-badge">
                  <BsMusicNoteBeamed size={13} className="text-primary" />
                  <span className="music-marquee-text">
                    {currentActiveStory.music_title} · {currentActiveStory.music_artist}
                  </span>
                  <div className="viewer-eq-mini">
                    <span></span><span></span><span></span>
                  </div>
                </div>
              )}

              <div className="viewer-controls">
                {currentActiveStory.music_url && (
                  <button
                    className="control-icon-btn"
                    onClick={() => setIsMuted(!isMuted)}
                    title={isMuted ? "Unmute" : "Mute"}
                  >
                    {isMuted ? <BsVolumeMuteFill size={18} /> : <BsVolumeUpFill size={18} />}
                  </button>
                )}
                <button 
                  className="control-icon-btn" 
                  onClick={() => setIsPaused(!isPaused)}
                  title={isPaused ? "Play" : "Pause"}
                >
                  {isPaused ? <BsPlayFill size={20} /> : <BsPauseFill size={20} />}
                </button>
              </div>
            </div>

            {/* Story Main Media */}
            <div 
              className="story-main-media"
              onMouseDown={() => setIsPaused(true)}
              onMouseUp={() => setIsPaused(false)}
              onTouchStart={() => setIsPaused(true)}
              onTouchEnd={() => setIsPaused(false)}
            >
              {/* Music Story Mode */}
              {currentActiveStory.media_type === "music" || (currentActiveStory.music_title && !currentActiveStory.media_url) ? (
                <div 
                  className="music-story-fullscreen-canvas"
                  style={{ background: currentActiveStory.background_gradient || "linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%)" }}
                >
                  <div className="music-story-center-card">
                    <div className="vinyl-stage">
                      <div className={`vinyl-disc-big ${!isPaused ? "rotating" : ""}`}>
                        <img src={currentActiveStory.music_cover || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300"} alt="" className="vinyl-cover-big" />
                      </div>
                    </div>

                    <div className="music-story-details">
                      <h4>{currentActiveStory.music_title}</h4>
                      <p>{currentActiveStory.music_artist}</p>
                      {currentActiveStory.music_lyrics && (
                        <div className="music-story-lyrics-box">
                          <span>"{currentActiveStory.music_lyrics}"</span>
                        </div>
                      )}
                    </div>

                    <div className="soundwave-anim-bar">
                      <span></span><span></span><span></span><span></span><span></span><span></span>
                    </div>

                    {currentActiveStory.text_overlay && (
                      <div className="music-story-user-text">
                        <p>{currentActiveStory.text_overlay}</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : currentActiveStory.media_type === "text" || (!currentActiveStory.media_url && !currentActiveStory.storyImg) ? (
                <div 
                  className="text-story-full-canvas"
                  style={{ background: currentActiveStory.background_gradient || "linear-gradient(135deg, #1877f2 0%, #00d2ff 100%)" }}
                >
                  <p className={`canvas-text font-${(currentActiveStory.font_style || "clean").toLowerCase()}`}>
                    {currentActiveStory.text_overlay || "Status Update"}
                  </p>
                </div>
              ) : (
                <div className="photo-story-full-canvas">
                  <img 
                    src={getStoryMediaUrl(currentActiveStory.media_url || currentActiveStory.storyImg)} 
                    alt="Story"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600";
                    }}
                  />

                  {/* Music Sticker Overlay on Photo Story */}
                  {currentActiveStory.music_title && (
                    <div className="story-photo-music-sticker">
                      <div className="sticker-card-wrap">
                        <img src={currentActiveStory.music_cover || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=100"} alt="" className="sticker-card-cover" />
                        <div className="sticker-card-meta">
                          <strong className="sticker-title">{currentActiveStory.music_title}</strong>
                          <span className="sticker-artist">{currentActiveStory.music_artist}</span>
                        </div>
                        <div className="sticker-eq-bars">
                          <span></span><span></span><span></span>
                        </div>
                      </div>
                    </div>
                  )}

                  {currentActiveStory.text_overlay && (
                    <div className="story-photo-caption-bar">
                      <span>{currentActiveStory.text_overlay}</span>
                    </div>
                  )}
                </div>
              )}

              {sentReaction && (
                <div className="animated-flying-reaction">{sentReaction}</div>
              )}
            </div>

            {/* Story Footer / Reply Bar */}
            <div className="story-viewer-footer">
              {!currentActiveStory.is_own_story && (
                <form className="story-reply-form" onSubmit={handleSendReply}>
                  <input 
                    type="text" 
                    placeholder={`Reply to ${currentActiveStory.name}...`}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                  />
                  {replyText.trim() && (
                    <button type="submit" className="story-send-btn"><BsSendFill size={14} /></button>
                  )}
                </form>
              )}

              <div className="story-quick-reactions">
                {["👍", "❤️", "🥰", "😆", "😮", "🔥", "⭐"].map((emoji, i) => (
                  <span 
                    key={i} 
                    className="quick-react-item" 
                    onClick={() => handleSendReaction(emoji)}
                  >
                    {emoji}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Arrow */}
          {activeStoryIndex < stories.length - 1 && (
            <button className="story-nav-btn next" onClick={(e) => { e.stopPropagation(); handleNextStory(); }} title="Next">
              <BsChevronRight size={24} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default Stories;