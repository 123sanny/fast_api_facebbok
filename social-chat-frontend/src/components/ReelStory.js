import React, { useState, useRef } from "react";
import { 
  BsX, BsArrowLeft, BsPlayFill, 
  BsVolumeMuteFill, BsVolumeUpFill, BsMusicNoteBeamed, 
  BsGlobeAmericas, BsPeopleFill, BsLockFill, 
  BsCameraVideoFill, BsUpload, BsFolder2Open,
  BsHash, BsCheckCircleFill, BsHeartFill, 
  BsChatDotsFill, BsShareFill, BsArrowRepeat
} from "react-icons/bs";
import { getActiveUserId, getActiveUserName, getUserStorageItem } from "../services/profileApi";
import { createReelApi, uploadReelVideoApi, getReelMediaUrl } from "../services/reelsApi";
import "./css/ReelStory.css";

const SAMPLE_VIDEOS = [
  {
    name: "Stadium Flame 🏏",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
  },
  {
    name: "Nature Escape 🌲",
    url: "https://assets.mixkit.co/videos/preview/mixkit-tree-branches-in-the-breeze-1188-large.mp4"
  },
  {
    name: "Cyber Velocity 🚀",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4"
  }
];

const SOUNDTRACKS = [
  { id: "trending", name: "Nexoria Viral Beat", artist: "Original Sound", icon: "🔥" },
  { id: "lofi", name: "Midnight Lo-Fi Chill", artist: "ChillHop Records", icon: "🎧" },
  { id: "acoustic", name: "Acoustic Sunset Melody", artist: "String Ensemble", icon: "🎸" },
  { id: "bass", name: "Cyber Club Bass Drop", artist: "Nexoria EDM", icon: "⚡" },
  { id: "original", name: "Original Camera Audio", artist: "Creator Audio", icon: "🎙️" }
];

const HASHTAG_PRESETS = [
  "#Trending", "#Viral", "#Reels", "#Nexoria", "#Explore", "#Vibe", "#Comedy", "#Tech"
];

const CATEGORIES = ["Trending", "Entertainment", "Music", "Comedy", "Tech & AI", "Gaming", "Sports", "Travel"];

const PRIVACY_OPTIONS = [
  { id: "public", label: "Public", icon: <BsGlobeAmericas size={13} /> },
  { id: "friends", label: "Friends", icon: <BsPeopleFill size={13} /> },
  { id: "only_me", label: "Only Me", icon: <BsLockFill size={13} /> }
];

const ReelStory = ({ onClose }) => {
  const [caption, setCaption] = useState("");
  const [videoFile, setVideoFile] = useState(SAMPLE_VIDEOS[0].url);
  const [rawFile, setRawFile] = useState(null);
  const [selectedMusic, setSelectedMusic] = useState(SOUNDTRACKS[0].name);
  const [selectedCategory, setSelectedCategory] = useState("Trending");
  const [privacy, setPrivacy] = useState(PRIVACY_OPTIONS[0]);
  const [showPrivacyMenu, setShowPrivacyMenu] = useState(false);
  const [allowComments, setAllowComments] = useState(true);
  const [allowRemix, setAllowRemix] = useState(true);
  
  // Video playback states
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);

  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  const currentUserId = getActiveUserId();
  const userName = getActiveUserName();
  const userAvatar = getUserStorageItem("avatar", `https://i.pravatar.cc/150?u=${currentUserId}`, currentUserId);

  // Video selection handler
  const handleVideoSelect = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setRawFile(file);
      const url = URL.createObjectURL(file);
      setVideoFile(url);
      setIsPlaying(true);
    }
  };

  // Toggle Play/Pause
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  // Toggle Audio Mute
  const toggleMute = (e) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    const newMuted = !isMuted;
    videoRef.current.muted = newMuted;
    setIsMuted(newMuted);
  };

  // Add hashtag to caption
  const handleAddHashtag = (tag) => {
    if (caption.includes(tag)) return;
    setCaption(prev => prev ? `${prev} ${tag}` : tag);
  };

  // Publish Reel
  const handlePublishReel = async () => {
    if (!videoFile) {
      alert("Please choose or record a video first!");
      return;
    }

    setIsPublishing(true);

    try {
      let finalVideoUrl = videoFile;

      // If user picked a local file from disk, upload to backend first
      if (rawFile) {
        const uploadRes = await uploadReelVideoApi(rawFile);
        if (uploadRes && uploadRes.success && uploadRes.video_url) {
          finalVideoUrl = getReelMediaUrl(uploadRes.video_url);
        }
      }

      // Save to MySQL database via reels router
      const dbRes = await createReelApi({
        user_id: Number(currentUserId) || 1,
        video_url: finalVideoUrl,
        caption: caption.trim() || `Exploring moments on Nexoria! 🚀 #${selectedCategory} #Reels`,
        audio_title: selectedMusic,
        category: selectedCategory,
        duration: 15
      });

      const newReel = (dbRes && dbRes.data) ? dbRes.data : {
        id: Date.now(),
        creatorName: userName,
        creatorAvatar: userAvatar,
        isVerified: true,
        videoUrl: finalVideoUrl,
        caption: caption.trim() || `Exploring moments on Nexoria! 🚀 #${selectedCategory} #Reels`,
        songTitle: selectedMusic,
        likes: "1",
        liked: true,
        reactionType: "love",
        commentsCount: 0,
        saved: false,
        isFollowing: false,
        category: selectedCategory,
        views: "1 View",
        timeAgo: "Just now",
        starsCount: 50,
        comments: []
      };

      const existing = JSON.parse(localStorage.getItem("nexoria_reels_list") || "[]");
      localStorage.setItem("nexoria_reels_list", JSON.stringify([newReel, ...existing]));
      window.dispatchEvent(new Event("nexoria_reels_updated"));
    } catch (err) {
      console.error("Failed to save reel:", err);
    } finally {
      setIsPublishing(false);
      onClose();
    }
  };

  return (
    <div className="reel-creator-fullscreen-overlay">
      {/* Hidden File Picker */}
      <input 
        type="file" 
        ref={fileInputRef} 
        hidden 
        accept="video/*" 
        onChange={handleVideoSelect} 
      />

      {/* Header */}
      <header className="reel-creator-header">
        <div className="reel-header-left">
          <button className="reel-header-close-btn" onClick={onClose} title="Close Studio">
            <BsArrowLeft size={20} className="d-md-none" />
            <BsX size={26} className="d-none d-md-block" />
          </button>
          <h4 className="reel-header-title">Create Reel</h4>
        </div>

        <div className="reel-header-right">
          {/* Privacy Picker */}
          <div className="reel-privacy-dropdown-wrap">
            <button 
              className="reel-privacy-badge-btn"
              onClick={() => setShowPrivacyMenu(!showPrivacyMenu)}
            >
              {privacy.icon}
              <span>{privacy.label}</span>
            </button>

            {showPrivacyMenu && (
              <div className="reel-privacy-menu">
                {PRIVACY_OPTIONS.map(opt => (
                  <button 
                    key={opt.id}
                    className={`reel-privacy-opt ${privacy.id === opt.id ? "active" : ""}`}
                    onClick={() => {
                      setPrivacy(opt);
                      setShowPrivacyMenu(false);
                    }}
                  >
                    {opt.icon}
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Publish in Header (Mobile/Tablet standard) */}
          <button 
            className="btn-header-publish d-md-none"
            onClick={handlePublishReel}
            disabled={isPublishing || !videoFile}
          >
            {isPublishing ? "Posting..." : "Share"}
          </button>
        </div>
      </header>

      {/* Main Studio Scrollable Body */}
      <div className="reel-creator-body">
        <div className="reel-creator-container">
          
          {/* LEFT: Live 9:16 Vertical Simulated Reel Preview */}
          <div className="reel-preview-column">
            <div className="reel-phone-frame">
              {videoFile ? (
                <div className="reel-phone-video-wrap">
                  <video 
                    ref={videoRef}
                    src={videoFile}
                    autoPlay
                    loop
                    muted={isMuted}
                    playsInline
                    className="reel-live-video-player"
                    onClick={togglePlay}
                  />

                  {/* Top Badges & Mute Button */}
                  <div className="reel-preview-top-badge">
                    <BsCameraVideoFill size={10} /> 9:16 HD Reel
                  </div>

                  <button 
                    className="reel-preview-btn-mute" 
                    onClick={toggleMute}
                    title={isMuted ? "Unmute Sound" : "Mute Sound"}
                  >
                    {isMuted ? <BsVolumeMuteFill size={16} /> : <BsVolumeUpFill size={16} />}
                  </button>

                  {/* Play / Pause Tap Overlay */}
                  {!isPlaying && (
                    <div className="reel-preview-play-toggle-tap" onClick={togglePlay}>
                      <div className="reel-play-paused-icon">
                        <BsPlayFill />
                      </div>
                    </div>
                  )}

                  {/* Simulated Side Actions */}
                  <div className="reel-preview-side-actions">
                    <div className="reel-preview-action-btn">
                      <BsHeartFill style={{ color: "#f33e5b" }} />
                      <span>1</span>
                    </div>
                    <div className="reel-preview-action-btn">
                      <BsChatDotsFill />
                      <span>0</span>
                    </div>
                    <div className="reel-preview-action-btn">
                      <BsShareFill />
                      <span>Share</span>
                    </div>
                  </div>

                  {/* Bottom Metadata & Live Caption Overlay */}
                  <div className="reel-preview-bottom-metadata">
                    <div className="reel-preview-creator-row">
                      <img src={userAvatar} alt="" className="reel-preview-avatar" />
                      <span className="reel-preview-creator-name">{userName}</span>
                      <span className="reel-preview-follow-tag">Follow</span>
                    </div>

                    <p className="reel-preview-caption-text">
                      {caption.trim() || `Exploring moments on Nexoria! 🚀 #${selectedCategory} #Reels`}
                    </p>

                    <div className="reel-preview-music-pill">
                      <BsMusicNoteBeamed size={11} />
                      <span>{selectedMusic}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="reel-empty-upload-placeholder">
                  <div className="reel-upload-icon-circle">
                    <BsCameraVideoFill />
                  </div>
                  <h6>Upload Video for Reel</h6>
                  <p>Choose a vertical (9:16) video up to 90 seconds</p>
                  <button 
                    className="btn-placeholder-upload"
                    onClick={() => fileInputRef.current && fileInputRef.current.click()}
                  >
                    <BsFolder2Open /> Select from Device
                  </button>
                  <button 
                    className="btn-placeholder-sample"
                    onClick={() => setVideoFile(SAMPLE_VIDEOS[0].url)}
                  >
                    ⚡ Use Sample Clip
                  </button>
                </div>
              )}
            </div>

            {/* Quick Change Video Controls */}
            {videoFile && (
              <div className="reel-preview-quick-actions">
                <button 
                  className="btn-change-video-pill"
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                >
                  <BsUpload size={13} /> Change Video
                </button>
                <button 
                  className="btn-change-video-pill"
                  onClick={() => {
                    const nextSample = SAMPLE_VIDEOS.find(s => s.url !== videoFile) || SAMPLE_VIDEOS[0];
                    setVideoFile(nextSample.url);
                  }}
                >
                  <BsArrowRepeat size={13} /> Next Sample
                </button>
              </div>
            )}
          </div>

          {/* RIGHT: Studio Form & Details Column */}
          <div className="reel-controls-column">
            
            {/* Caption & Description Section */}
            <div className="reel-controls-section">
              <div className="reel-section-title">
                <span>Caption & Hashtags</span>
                <small>{caption.length}/500</small>
              </div>

              <textarea 
                className="reel-caption-textarea"
                rows={3}
                placeholder="Write a catchy caption, mention @friends and add #hashtags..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                maxLength={500}
              />

              <div className="reel-hashtag-pills-row">
                <span className="text-muted small d-flex align-items-center me-1">
                  <BsHash /> Quick Tags:
                </span>
                {HASHTAG_PRESETS.map(tag => (
                  <button 
                    key={tag}
                    className="hashtag-chip"
                    onClick={() => handleAddHashtag(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Soundtrack Selector */}
            <div className="reel-controls-section">
              <div className="reel-section-title">
                <span>Audio & Music</span>
                <small className="text-primary fw-bold">{selectedMusic}</small>
              </div>

              <div className="reel-audio-cards-grid">
                {SOUNDTRACKS.map(track => (
                  <div 
                    key={track.id}
                    className={`reel-audio-card ${selectedMusic === track.name ? "active" : ""}`}
                    onClick={() => setSelectedMusic(track.name)}
                  >
                    <div className="reel-audio-icon-wrap">
                      {track.icon}
                    </div>
                    <div className="reel-audio-card-text">
                      <strong>{track.name}</strong>
                      <div className="small text-muted">{track.artist}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Category Selector */}
            <div className="reel-controls-section">
              <div className="reel-section-title">
                <span>Category</span>
                <small>{selectedCategory}</small>
              </div>

              <div className="reel-category-pills-row">
                {CATEGORIES.map(cat => (
                  <button 
                    key={cat}
                    className={`reel-cat-pill ${selectedCategory === cat ? "active" : ""}`}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Reel Preferences & Toggles */}
            <div className="reel-controls-section">
              <div className="reel-section-title">
                <span>Audience & Interaction</span>
              </div>

              <div className="reel-toggle-row">
                <div className="reel-toggle-label">
                  <span>Allow Comments</span>
                  <small>Anyone who sees this reel can leave a comment</small>
                </div>
                <label className="reel-switch">
                  <input 
                    type="checkbox" 
                    checked={allowComments} 
                    onChange={() => setAllowComments(!allowComments)} 
                  />
                  <span className="reel-slider"></span>
                </label>
              </div>

              <div className="reel-toggle-row">
                <div className="reel-toggle-label">
                  <span>Allow Remixing & Duets</span>
                  <small>Let creators use this video in their own reels</small>
                </div>
                <label className="reel-switch">
                  <input 
                    type="checkbox" 
                    checked={allowRemix} 
                    onChange={() => setAllowRemix(!allowRemix)} 
                  />
                  <span className="reel-slider"></span>
                </label>
              </div>
            </div>

            {/* Desktop Bottom Action Buttons */}
            <div className="reel-form-bottom-actions">
              <button className="btn-reel-cancel" onClick={onClose}>
                Cancel
              </button>
              <button 
                className="btn-reel-publish-main"
                onClick={handlePublishReel}
                disabled={isPublishing || !videoFile}
              >
                {isPublishing ? (
                  <>Publishing Reel...</>
                ) : (
                  <>
                    <BsCheckCircleFill /> Publish Reel Now
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom Action Bar */}
      <div className="reel-mobile-sticky-bottom-bar">
        <button className="btn-reel-cancel" onClick={onClose}>
          Cancel
        </button>
        <button 
          className="btn-reel-publish-main"
          onClick={handlePublishReel}
          disabled={isPublishing || !videoFile}
        >
          {isPublishing ? "Publishing..." : "🚀 Publish Reel"}
        </button>
      </div>
    </div>
  );
};

export default ReelStory;