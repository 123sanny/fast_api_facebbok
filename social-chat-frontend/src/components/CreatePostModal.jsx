import React, { useState, useEffect, useRef } from "react";
import {
  BsX, BsGlobeAmericas, BsImages, BsEmojiSmileFill,
  BsPeopleFill, BsStars, BsTranslate, BsMagic,
  BsGraphUpArrow, BsGeoAltFill,
  BsHourglassSplit, BsIncognito, BsClockHistory,
  BsMusicNoteBeamed, BsPlayFill, BsPauseFill
} from "react-icons/bs";
import { 
  getActiveUserId, getActiveUserName, getActiveUserFirstName, 
  getUserStorageItem, createPostApi 
} from "../services/profileApi";
import MusicPickerModal from "./MusicPickerModal";
import "./css/CreatePostModal.css";

const BACKGROUND_PRESETS = [
  { id: "none", bg: "" },
  { id: "blue-cyan", bg: "linear-gradient(135deg, #1877f2 0%, #00d2ff 100%)" },
  { id: "fire", bg: "linear-gradient(135deg, #f12711 0%, #f5af19 100%)" },
  { id: "purple-pink", bg: "linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%)" },
  { id: "neon-green", bg: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)" },
  { id: "dark-night", bg: "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)" },
  { id: "sweet-candy", bg: "linear-gradient(135deg, #ec008c 0%, #fc6767 100%)" },
];

const GHOST_ALIASES = [
  "🎭 NeonRaven#842",
  "🎭 QuantumGhost#109",
  "🎭 CyberNomad#551",
  "🎭 ShadowScribe#304",
  "🎭 MysticByte#918"
];

function CreatePostModal({ onClose, onPostCreated }) {
  const [newPostText, setNewPostText] = useState("");
  const [selectedBg, setSelectedBg] = useState("");
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [selectedMediaType, setSelectedMediaType] = useState(null);
  const [selectedFeeling, setSelectedFeeling] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [postPrivacy, setPostPrivacy] = useState("Public");
  const [showFeelingPicker, setShowFeelingPicker] = useState(false);
  const [showLocationInput, setShowLocationInput] = useState(false);

  // Music State
  const [selectedMusic, setSelectedMusic] = useState(null);
  const [showMusicPicker, setShowMusicPicker] = useState(false);
  const [isPlayingMusicPreview, setIsPlayingMusicPreview] = useState(false);
  const musicAudioRef = useRef(null);

  // 1. Ghost / Anonymous Mode State
  const [isGhostMode, setIsGhostMode] = useState(false);
  const [ghostAlias] = useState(() => GHOST_ALIASES[Math.floor(Math.random() * GHOST_ALIASES.length)]);

  // 2. Auto-Expiring Post State
  const [expiryDuration, setExpiryDuration] = useState("24h"); // '24h', '7d', 'never'

  // 3. AI Studio & Tone Switcher State
  const [showAiStudio, setShowAiStudio] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [viralityScore, setViralityScore] = useState(94);
  const [activeTone, setActiveTone] = useState("original");

  const currentUserId = getActiveUserId();
  const userName = getActiveUserName();
  const userPic = getUserStorageItem("avatar", `https://i.pravatar.cc/150?u=${currentUserId}`, currentUserId);

  useEffect(() => {
    return () => {
      if (musicAudioRef.current) {
        musicAudioRef.current.pause();
      }
    };
  }, []);

  const handleToggleMusicPreview = () => {
    if (!selectedMusic?.audioUrl) return;
    if (isPlayingMusicPreview) {
      if (musicAudioRef.current) musicAudioRef.current.pause();
      setIsPlayingMusicPreview(false);
    } else {
      if (musicAudioRef.current) musicAudioRef.current.pause();
      const audio = new Audio(selectedMusic.audioUrl);
      audio.play().catch(e => console.warn(e));
      musicAudioRef.current = audio;
      setIsPlayingMusicPreview(true);
      audio.onended = () => setIsPlayingMusicPreview(false);
    }
  };


  // Handle Media File Selection
  const handleMediaUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const type = file.type.startsWith("video") ? "video" : "image";
      setSelectedMediaType(type);
      setSelectedMedia(URL.createObjectURL(file));
      setSelectedBg(""); // Remove background when media is selected
    }
  };

  // AI Tone Morph / Switcher
  const handleApplyTone = (toneType) => {
    setActiveTone(toneType);
    if (!newPostText.trim()) {
      if (toneType === "poetic") {
        setNewPostText("🌙 चंद ख्वाब, कुछ उम्मीदें और यह सफर...\nजिंदगी की दास्तान भी कितनी हसीन है ✨ #NexoriaShayari");
      } else if (toneType === "funny") {
        setNewPostText("😂 Me thinking I’ll wake up at 5 AM tomorrow for workout vs reality at 9:30 AM staring at ceiling 💀 #Relatable #Vibes");
      } else if (toneType === "professional") {
        setNewPostText("💼 Key Learning: Scaling resilient distributed architectures requires deep alignment on latency thresholds, modularity, and high team autonomy. 🚀");
      } else if (toneType === "hype") {
        setNewPostText("🔥 MASSIVE DROP INCOMING! We're reimagining social media with zero algorithms and 100% creator freedom! Are you ready? 🚀⚡");
      } else if (toneType === "deep") {
        setNewPostText("💡 Real growth happens in the quiet hours when nobody is watching. Consistency will always beat sporadic motivation.");
      }
      setViralityScore(97);
      return;
    }

    setIsAiProcessing(true);
    setTimeout(() => {
      const base = newPostText.trim();
      let modified = base;
      if (toneType === "professional") {
        modified = `💼 Executive Insight:\n\n“${base}”\n\nStrategic Takeaway: Driving scalable impact and meaningful momentum. 🚀 #Leadership`;
      } else if (toneType === "funny") {
        modified = `😂 Real talk though:\n\n${base}\n\n(Don't ask me how I know this 💀🤣)`;
      } else if (toneType === "poetic") {
        modified = `✨ खामोशियों की भी अपनी जुबां होती है...\n\n“${base}”\n\nरोशनी की तलाश में एक खूबसूरत मोड़ 🌙💫`;
      } else if (toneType === "hype") {
        modified = `🔥 STOP SCROLLING & READ THIS:\n\n⚡ ${base} ⚡\n\n👇 Drop your unfiltered thoughts below! #Viral`;
      } else if (toneType === "deep") {
        modified = `💡 Reflection of the Day:\n\n“${base}”\n\nSometimes pausing to observe is the highest form of progress 🌿`;
      }
      setNewPostText(modified);
      setViralityScore(98);
      setIsAiProcessing(false);
    }, 500);
  };

  // AI Studio: 1-Click Multi-Language Translation
  const handleAiTranslate = (lang) => {
    setIsAiProcessing(true);
    setTimeout(() => {
      if (lang === "hindi") {
        setNewPostText(
          "🌟 नेक्सोरिया पर जुड़ने और सीखने का एक शानदार अनुभव! भविष्य के तकनीकी नवाचार और समुदाय निर्माण की ओर एक नया कदम। 🚀 #NexoriaHindi #TechIndia"
        );
      } else if (lang === "english") {
        setNewPostText(
          "🌟 A truly transformative experience connecting and building on Nexoria! Shaping the future of high-performance community spaces. 🚀 #Nexoria #Innovation"
        );
      } else if (lang === "spanish") {
        setNewPostText(
          "🌟 ¡Una experiencia transformadora en Nexoria! Construyendo el futuro de la tecnología y las comunidades conectadas. 🚀 #NexoriaEspanol #Innovacion"
        );
      }
      setViralityScore(96);
      setIsAiProcessing(false);
    }, 600);
  };

  // Publish Post
  const handlePublishPost = async (e) => {
    e?.preventDefault();
    if (!newPostText.trim() && !selectedMedia && !selectedMusic) return;

    if (musicAudioRef.current) {
      musicAudioRef.current.pause();
    }

    // Calculate expiry timestamp
    let expiresAt = null;
    if (expiryDuration === "24h") {
      expiresAt = Date.now() + 24 * 60 * 60 * 1000;
    } else if (expiryDuration === "7d") {
      expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
    }

    const newPost = {
      id: Date.now(),
      user_id: currentUserId,
      name: isGhostMode ? ghostAlias : userName,
      profile: isGhostMode ? "https://api.dicebear.com/7.x/bottts/svg?seed=" + ghostAlias : userPic,
      author_id: currentUserId,
      author_name: userName,
      author_pic: userPic,
      isGhost: isGhostMode,
      ghostAlias: isGhostMode ? ghostAlias : null,
      expiryDuration,
      expiresAt,
      time: "Just now",
      caption: newPostText,
      image: selectedMediaType === "image" ? selectedMedia : null,
      video: selectedMediaType === "video" ? selectedMedia : null,
      background: selectedBg || null,
      feeling: selectedFeeling || null,
      location: selectedLocation || null,
      privacy: isGhostMode ? "Anonymous (Public)" : postPrivacy,
      likesCount: 0,
      commentsCount: 0,
      sharesCount: 0,
      userReaction: null,
      music_title: selectedMusic?.title || null,
      music_artist: selectedMusic?.artist || null,
      music_url: selectedMusic?.audioUrl || null,
      music_cover: selectedMusic?.cover || null,
      music_duration: selectedMusic?.duration || 30,
      music: selectedMusic ? {
        title: selectedMusic.title,
        artist: selectedMusic.artist,
        url: selectedMusic.audioUrl,
        cover: selectedMusic.cover,
        duration: selectedMusic.duration || 30
      } : null,
      comments: [],
    };

    // Save to localStorage
    try {
      const saved = localStorage.getItem("nexoria_feed_posts");
      const existing = saved ? JSON.parse(saved) : [];
      localStorage.setItem("nexoria_feed_posts", JSON.stringify([newPost, ...existing]));
    } catch (err) {
      console.error("Storage error:", err);
    }

    // Call backend API to persist to MySQL database
    try {
      await createPostApi({
        user_id: currentUserId,
        content: newPostText,
        image_url: selectedMediaType === "image" ? selectedMedia : null,
        video_url: selectedMediaType === "video" ? selectedMedia : null,
        feeling: selectedFeeling || null,
        location: selectedLocation || null,
        privacy: isGhostMode ? "anonymous" : postPrivacy.toLowerCase(),
        is_ghost: isGhostMode,
        ghost_alias: isGhostMode ? ghostAlias : null,
        music_title: selectedMusic?.title || null,
        music_artist: selectedMusic?.artist || null,
        music_url: selectedMusic?.audioUrl || null,
        music_cover: selectedMusic?.cover || null,
        music_duration: selectedMusic?.duration || 30
      });
    } catch (err) {
      console.warn("Backend createPostApi error:", err);
    }

    // Dispatch global events
    window.dispatchEvent(new CustomEvent("post-created", { detail: newPost }));
    window.dispatchEvent(new Event("profile-updated"));

    if (onPostCreated) {
      onPostCreated(newPost);
    }

    onClose();
  };

  return (
    <div className="fb-create-post-overlay" onClick={onClose}>
      <div className="fb-create-post-dialog shadow-lg" onClick={(e) => e.stopPropagation()}>
        
        {/* Modal Header */}
        <div className="dialog-header">
          <h5>Create Post</h5>
          <button className="dialog-close-btn" onClick={onClose} aria-label="Close">
            <BsX size={24} />
          </button>
        </div>

        {/* User / Ghost Info Bar */}
        <div className="dialog-user-row">
          <img 
            src={isGhostMode ? "https://api.dicebear.com/7.x/bottts/svg?seed=" + ghostAlias : userPic} 
            alt="" 
            className="dialog-user-avatar" 
          />
          <div className="d-flex flex-column">
            <h6>{isGhostMode ? ghostAlias : userName}</h6>
            
            <div className="d-flex align-items-center gap-2 mt-1 flex-wrap">
              {/* Privacy Selector */}
              {!isGhostMode ? (
                <div className="privacy-selector-pill">
                  <BsGlobeAmericas size={11} />
                  <select value={postPrivacy} onChange={(e) => setPostPrivacy(e.target.value)}>
                    <option value="Public">Public</option>
                    <option value="Friends">Friends</option>
                    <option value="Only Me">Only me</option>
                  </select>
                </div>
              ) : (
                <span className="ghost-shield-chip">
                  <BsIncognito className="me-1" /> Identity Masked
                </span>
              )}

              {/* Auto-Expiry Duration Selector */}
              <div className="expiry-selector-pill" title="Auto-destruct timer for this post">
                <BsHourglassSplit size={11} className="text-warning" />
                <select value={expiryDuration} onChange={(e) => setExpiryDuration(e.target.value)}>
                  <option value="24h">⏳ 24h Auto-Expiry</option>
                  <option value="7d">🗓️ 7 Days Expiry</option>
                  <option value="never">♾️ Permanent</option>
                </select>
              </div>
            </div>
          </div>

          {/* Top Actions: Ghost Toggle + AI Studio */}
          <div className="d-flex align-items-center gap-2 ms-auto">
            <button
              type="button"
              className={`ghost-mode-toggle-btn ${isGhostMode ? "active" : ""}`}
              onClick={() => setIsGhostMode(!isGhostMode)}
              title="Post anonymously without revealing profile"
            >
              <BsIncognito size={15} className="me-1" />
              <span>{isGhostMode ? "Ghost ON" : "Ghost"}</span>
            </button>

            <button
              type="button"
              className={`ai-studio-toggle-btn ${showAiStudio ? "active" : ""}`}
              onClick={() => setShowAiStudio(!showAiStudio)}
              title="Open AI Post Assistant & Tone Switcher"
            >
              <BsStars className="me-1" />
              <span>AI Studio</span>
            </button>
          </div>
        </div>

        {/* AI STUDIO & TONE SWITCHER TOOLBAR */}
        {showAiStudio && (
          <div className="ai-post-studio-panel shadow-sm">
            <div className="ai-studio-top-bar">
              <div className="d-flex align-items-center gap-2">
                <BsMagic className="text-primary" />
                <strong>Nexoria AI Tone & Language Assistant</strong>
              </div>
              <div className="virality-pill">
                <BsGraphUpArrow className="me-1 text-success" />
                <span>Score: <strong>{viralityScore}%</strong></span>
              </div>
            </div>

            {/* Tone Selector Chips */}
            <div className="ai-tones-horizontal-bar">
              <span className="tone-label">Tone:</span>
              <button 
                type="button" 
                className={`ai-tone-chip ${activeTone === "professional" ? "active" : ""}`}
                onClick={() => handleApplyTone("professional")}
                disabled={isAiProcessing}
              >
                👔 Professional
              </button>
              <button 
                type="button" 
                className={`ai-tone-chip ${activeTone === "funny" ? "active" : ""}`}
                onClick={() => handleApplyTone("funny")}
                disabled={isAiProcessing}
              >
                😂 Funny / Meme
              </button>
              <button 
                type="button" 
                className={`ai-tone-chip ${activeTone === "poetic" ? "active" : ""}`}
                onClick={() => handleApplyTone("poetic")}
                disabled={isAiProcessing}
              >
                ✨ Poetic / Shayari
              </button>
              <button 
                type="button" 
                className={`ai-tone-chip ${activeTone === "hype" ? "active" : ""}`}
                onClick={() => handleApplyTone("hype")}
                disabled={isAiProcessing}
              >
                🔥 Viral Hype
              </button>
              <button 
                type="button" 
                className={`ai-tone-chip ${activeTone === "deep" ? "active" : ""}`}
                onClick={() => handleApplyTone("deep")}
                disabled={isAiProcessing}
              >
                💡 Deep Thought
              </button>
            </div>

            {/* Translation Actions */}
            <div className="ai-translate-row">
              <span className="tone-label"><BsTranslate className="me-1" /> Translate:</span>
              <button type="button" className="ai-trans-chip" onClick={() => handleAiTranslate("hindi")}>
                🇮🇳 Hindi
              </button>
              <button type="button" className="ai-trans-chip" onClick={() => handleAiTranslate("english")}>
                🇬🇧 English
              </button>
              <button type="button" className="ai-trans-chip" onClick={() => handleAiTranslate("spanish")}>
                🇪🇸 Spanish
              </button>
            </div>
          </div>
        )}

        {/* Feelings Badge if Selected */}
        {selectedFeeling && (
          <div className="selected-feeling-badge">
            <span>Feeling {selectedFeeling}</span>
            <BsX className="remove-tag-icon" onClick={() => setSelectedFeeling("")} />
          </div>
        )}

        {/* Location Badge if Selected */}
        {selectedLocation && (
          <div className="selected-feeling-badge bg-info-soft text-info">
            <span>📍 At {selectedLocation}</span>
            <BsX className="remove-tag-icon" onClick={() => setSelectedLocation("")} />
          </div>
        )}

        {/* Modal Textarea / Background Banner */}
        <div
          className={`dialog-text-wrapper ${selectedBg ? "has-background" : ""}`}
          style={{ background: selectedBg || "transparent" }}
        >
          <textarea
            className="dialog-textarea"
            placeholder={
              isGhostMode 
                ? "Share an anonymous thought or ask a raw question safely..."
                : `What's on your mind, ${getActiveUserFirstName("there")}?`
            }
            value={newPostText}
            onChange={(e) => {
              setNewPostText(e.target.value);
              if (e.target.value.length > 20) setViralityScore(95);
            }}
            autoFocus
          />
        </div>

        {/* Background Gradient Palette Picker */}
        {!selectedMedia && (
          <div className="dialog-bg-palette">
            <span className="palette-label">Theme:</span>
            {BACKGROUND_PRESETS.map((p) => (
              <div
                key={p.id}
                className={`palette-color-swatch ${selectedBg === p.bg ? "active" : ""}`}
                style={{ background: p.bg || "var(--color-bg-hover)" }}
                onClick={() => setSelectedBg(p.bg)}
              >
                {p.id === "none" && <span>✕</span>}
              </div>
            ))}
          </div>
        )}

        {/* Media Upload Preview with Remove Button */}
        {selectedMedia && (
          <div className="dialog-media-preview-container">
            <button
              type="button"
              className="remove-preview-btn"
              onClick={() => setSelectedMedia(null)}
            >
              <BsX size={20} />
            </button>
            {selectedMediaType === "image" ? (
              <img src={selectedMedia} alt="Preview" className="preview-img" />
            ) : (
              <video src={selectedMedia} controls className="preview-img" autoPlay loop muted />
            )}
          </div>
        )}

        {/* Feeling Picker Bar */}
        {showFeelingPicker && (
          <div className="feelings-selection-grid">
            {[
              "Happy 😊",
              "Loved ❤️",
              "Excited 🎉",
              "Blessed 🙏",
              "Cool 😎",
              "Eating 🍕",
              "Traveling ✈️",
              "Thinking 💭",
            ].map((f, i) => (
              <span
                key={i}
                className="feeling-chip"
                onClick={() => {
                  setSelectedFeeling(f);
                  setShowFeelingPicker(false);
                }}
              >
                {f}
              </span>
            ))}
          </div>
        )}

        {/* Location Input Box */}
        {showLocationInput && (
          <div className="p-2 mb-2">
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Enter city or locality (e.g. Connaught Place, Noida, Bangalore)..."
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") setShowLocationInput(false);
              }}
            />
          </div>
        )}

        {/* Attached Music Card Preview */}
        {selectedMusic && (
          <div className="post-attached-music-card">
            <div className="music-card-left">
              <img src={selectedMusic.cover} alt="" className="music-card-thumb" />
              <button
                type="button"
                className={`music-card-play-btn ${isPlayingMusicPreview ? "playing" : ""}`}
                onClick={handleToggleMusicPreview}
              >
                {isPlayingMusicPreview ? <BsPauseFill size={16} /> : <BsPlayFill size={16} />}
              </button>
            </div>
            <div className="music-card-body">
              <div className="d-flex align-items-center gap-1">
                <BsMusicNoteBeamed className="text-primary" size={13} />
                <strong>{selectedMusic.title}</strong>
              </div>
              <span className="text-muted small">{selectedMusic.artist} · {selectedMusic.album}</span>
            </div>
            {isPlayingMusicPreview && (
              <div className="music-card-eq">
                <span></span><span></span><span></span><span></span>
              </div>
            )}
            <button
              type="button"
              className="music-card-remove-btn"
              onClick={() => {
                if (musicAudioRef.current) musicAudioRef.current.pause();
                setSelectedMusic(null);
                setIsPlayingMusicPreview(false);
              }}
              title="Remove music"
            >
              <BsX size={20} />
            </button>
          </div>
        )}

        {/* Add to your post Toolbar */}
        <div className="dialog-toolbar-box">
          <span>Add to your post</span>
          <div className="toolbar-icon-group">
            <label className="tool-icon-btn text-success" title="Photo/video">
              <BsImages size={20} />
              <input type="file" hidden accept="image/*,video/*" onChange={handleMediaUpload} />
            </label>
            <button
              type="button"
              className={`tool-icon-btn ${selectedMusic ? "text-primary active" : "text-info"}`}
              title="Add Music / Soundtrack"
              onClick={() => setShowMusicPicker(true)}
            >
              <BsMusicNoteBeamed size={20} />
            </button>
            <button
              type="button"
              className="tool-icon-btn text-warning"
              title="Feeling/activity"
              onClick={() => setShowFeelingPicker(!showFeelingPicker)}
            >
              <BsEmojiSmileFill size={20} />
            </button>
            <button
              type="button"
              className="tool-icon-btn text-danger"
              title="Check in / Location"
              onClick={() => setShowLocationInput(!showLocationInput)}
            >
              <BsGeoAltFill size={20} />
            </button>
            <button
              type="button"
              className="tool-icon-btn text-primary"
              title="Tag connections"
              onClick={() => alert("Tag Connections: Tagged users will be notified.")}
            >
              <BsPeopleFill size={20} />
            </button>
          </div>
        </div>

        {/* Expiry Reminder Footer */}
        {expiryDuration !== "never" && (
          <div className="expiry-hint-row">
            <BsClockHistory className="text-warning me-1" />
            <span>
              This post will automatically self-destruct after{" "}
              <strong>{expiryDuration === "24h" ? "24 Hours" : "7 Days"}</strong>.
            </span>
          </div>
        )}

        {/* Publish Button */}
        <div className="dialog-footer">
          <button
            type="button"
            className="btn-publish-post"
            disabled={!newPostText.trim() && !selectedMedia && !selectedMusic}
            onClick={handlePublishPost}
          >
            {isGhostMode ? "Post Anonymously (Ghost)" : "Post"}
          </button>
        </div>
      </div>

      {/* Music Picker Modal */}
      <MusicPickerModal
        isOpen={showMusicPicker}
        onClose={() => setShowMusicPicker(false)}
        onSelectSong={(song) => setSelectedMusic(song)}
        initialSong={selectedMusic}
        mode="post"
      />
    </div>
  );
}

export default CreatePostModal;
