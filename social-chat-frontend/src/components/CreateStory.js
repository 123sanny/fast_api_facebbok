import React, { useState } from "react";
import { 
  BsX, BsType, BsImages, BsMusicNoteBeamed,
  BsGlobeAmericas, BsCheck2Circle
} from "react-icons/bs";
import { getActiveUserId } from "../services/profileApi";
import { createStoryApi, uploadStoryMediaApi } from "../services/storiesApi";
import MusicPickerModal from "./MusicPickerModal";
import "./css/CreateStory.css";

const STORY_BACKGROUNDS = [
  "linear-gradient(135deg, #1877f2 0%, #00d2ff 100%)",
  "linear-gradient(135deg, #f12711 0%, #f5af19 100%)",
  "linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%)",
  "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
  "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)",
  "linear-gradient(135deg, #ec008c 0%, #fc6767 100%)",
  "linear-gradient(135deg, #654ea3 0%, #eaafc8 100%)"
];

const FONTS = ["Clean", "Headline", "Casual", "Fancy", "Simple"];

function CreateStory({ onClose }) {
  const currentUserId = Number(getActiveUserId());
  const [storyMode, setStoryMode] = useState("choose"); // 'choose' | 'text' | 'photo' | 'music'
  const [storyText, setStoryText] = useState("");
  const [selectedBg, setSelectedBg] = useState(STORY_BACKGROUNDS[0]);
  const [selectedFont, setSelectedFont] = useState("Clean");
  const [photoUrl, setPhotoUrl] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  // Music State
  const [selectedMusic, setSelectedMusic] = useState(null);
  const [showMusicPicker, setShowMusicPicker] = useState(false);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPhotoUrl(ev.target.result);
        setStoryMode("photo");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenMusicStory = () => {
    setStoryMode("music");
    setShowMusicPicker(true);
  };

  const handleSelectSong = (songData) => {
    setSelectedMusic(songData);
  };

  const handleShareStory = async () => {
    if (isSubmitting || !currentUserId) return;

    try {
      setIsSubmitting(true);

      let mediaUrl = null;

      // If photo story, upload media file to backend
      if (storyMode === "photo" && photoFile) {
        const uploadRes = await uploadStoryMediaApi(photoFile);
        if (uploadRes && uploadRes.success && uploadRes.media_url) {
          mediaUrl = uploadRes.media_url;
        } else {
          mediaUrl = photoUrl;
        }
      }

      const payload = {
        user_id: currentUserId,
        media_type: storyMode === "photo" ? "photo" : (storyMode === "music" ? "music" : "text"),
        media_url: mediaUrl,
        text_overlay: storyText.trim() || null,
        background_gradient: selectedBg,
        font_style: selectedFont,
        music_title: selectedMusic?.title || null,
        music_artist: selectedMusic?.artist || null,
        music_url: selectedMusic?.audioUrl || null,
        music_cover: selectedMusic?.cover || null,
        music_lyrics: selectedMusic?.lyrics || null,
        music_sticker_style: selectedMusic?.stickerStyle || "sticker"
      };

      const res = await createStoryApi(payload);
      if (res && res.success) {
        setToastMsg("Story published successfully!");
        window.dispatchEvent(new CustomEvent("nexoria_story_created", { detail: res.data }));
        setTimeout(() => {
          onClose();
        }, 600);
      } else {
        alert(res.message || "Failed to publish story.");
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error("Story publish error:", err);
      alert("Failed to share story. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-story-fullscreen-overlay">
      
      {/* Top Header */}
      <div className="create-story-header">
        <button className="story-header-close-btn" onClick={onClose}>
          <BsX size={28} />
        </button>
        <h4>Create story</h4>
        <div className="story-privacy-badge">
          <BsGlobeAmericas size={13} className="me-1" /> Public & Friends
        </div>
      </div>

      {toastMsg && (
        <div style={{
          position: "fixed",
          top: 70,
          left: "50%",
          transform: "translateX(-50%)",
          background: "#31a24c",
          color: "#fff",
          padding: "8px 18px",
          borderRadius: "20px",
          fontWeight: 600,
          fontSize: "14px",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          zIndex: 99999,
          boxShadow: "0 6px 20px rgba(0,0,0,0.25)"
        }}>
          <BsCheck2Circle size={18} /> {toastMsg}
        </div>
      )}

      {/* Main Studio Viewport */}
      <div className="create-story-studio-body">
        
        {/* State 1: Choose Mode (Photo, Text, or Music) */}
        {storyMode === "choose" && (
          <div className="choose-story-type-grid">
            {/* Photo Story Card */}
            <label className="story-type-card photo-card">
              <div className="story-type-icon-circle bg-photo">
                <BsImages size={32} />
              </div>
              <h5>Create a photo story</h5>
              <input type="file" hidden accept="image/*" onChange={handlePhotoUpload} />
            </label>

            {/* Text Story Card */}
            <div className="story-type-card text-card" onClick={() => setStoryMode("text")}>
              <div className="story-type-icon-circle bg-text">
                <BsType size={34} />
              </div>
              <h5>Create a text story</h5>
            </div>

            {/* Music Story Card */}
            <div className="story-type-card music-card" onClick={handleOpenMusicStory}>
              <div className="story-type-icon-circle bg-music">
                <BsMusicNoteBeamed size={32} />
              </div>
              <h5>Create a music story</h5>
            </div>
          </div>
        )}

        {/* State 2: Text Story Canvas Editor */}
        {storyMode === "text" && (
          <div className="story-editor-layout">
            <div className="story-editor-controls shadow-sm">
              <div className="editor-controls-header">
                <h5>Text Story</h5>
                <button className="btn-switch-mode" onClick={() => setStoryMode("choose")}>Change type</button>
              </div>

              {/* Music Sticker Trigger */}
              <div className="story-music-trigger-box">
                {selectedMusic ? (
                  <div className="selected-music-pill">
                    <img src={selectedMusic.cover} alt="" className="music-pill-thumb" />
                    <div className="music-pill-info">
                      <strong>{selectedMusic.title}</strong>
                      <small>{selectedMusic.artist}</small>
                    </div>
                    <button className="music-pill-remove" onClick={() => setSelectedMusic(null)} title="Remove Music">
                      <BsX size={18} />
                    </button>
                  </div>
                ) : (
                  <button 
                    type="button" 
                    className="btn-add-music-story"
                    onClick={() => setShowMusicPicker(true)}
                  >
                    <BsMusicNoteBeamed size={16} /> Add Music / Song 🎵
                  </button>
                )}
              </div>

              {/* Text Input */}
              <label>Your Text</label>
              <textarea
                placeholder="Start typing your thought or status..."
                value={storyText}
                onChange={(e) => setStoryText(e.target.value)}
                rows={4}
                autoFocus
              />

              {/* Font Selector */}
              <label>Font Style</label>
              <div className="font-options-row">
                {FONTS.map(font => (
                  <button 
                    key={font}
                    className={`font-pill-btn ${selectedFont === font ? "active" : ""}`}
                    onClick={() => setSelectedFont(font)}
                  >
                    {font}
                  </button>
                ))}
              </div>

              {/* Background Color Palettes */}
              <label>Backgrounds</label>
              <div className="bg-palettes-grid">
                {STORY_BACKGROUNDS.map((bg, i) => (
                  <div 
                    key={i} 
                    className={`bg-color-circle ${selectedBg === bg ? "active" : ""}`}
                    style={{ background: bg }}
                    onClick={() => setSelectedBg(bg)}
                  />
                ))}
              </div>

              {/* Action Buttons */}
              <div className="editor-bottom-actions">
                <button className="btn-discard" onClick={() => setStoryMode("choose")}>Discard</button>
                <button 
                  className="btn-share-story" 
                  disabled={(!storyText.trim() && !selectedMusic) || isSubmitting} 
                  onClick={handleShareStory}
                >
                  {isSubmitting ? "Sharing..." : "Share to story"}
                </button>
              </div>
            </div>

            {/* Center Story Preview Screen */}
            <div className="story-preview-wrapper">
              <div className="story-canvas-preview shadow-lg" style={{ background: selectedBg }}>
                
                {/* Music Sticker Overlay */}
                {selectedMusic && (
                  <div className={`story-music-sticker style-${selectedMusic.stickerStyle || "sticker"}`}>
                    {selectedMusic.stickerStyle === "vinyl" ? (
                      <div className="sticker-vinyl-wrap">
                        <div className="vinyl-disc rotating">
                          <img src={selectedMusic.cover} alt="" className="vinyl-center-img" />
                        </div>
                        <div className="vinyl-label-info">
                          <strong>{selectedMusic.title}</strong>
                          <span>{selectedMusic.artist}</span>
                        </div>
                      </div>
                    ) : selectedMusic.stickerStyle === "lyrics" ? (
                      <div className="sticker-lyrics-wrap">
                        <div className="lyrics-header">
                          <BsMusicNoteBeamed size={14} /> <strong>{selectedMusic.title}</strong>
                        </div>
                        <p className="lyrics-text">"{selectedMusic.lyrics || "Singing along with the vibes..."}"</p>
                      </div>
                    ) : (
                      <div className="sticker-card-wrap">
                        <img src={selectedMusic.cover} alt="" className="sticker-card-cover" />
                        <div className="sticker-card-meta">
                          <strong className="sticker-title">{selectedMusic.title}</strong>
                          <span className="sticker-artist">{selectedMusic.artist}</span>
                        </div>
                        <div className="sticker-eq-bars">
                          <span></span><span></span><span></span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <p className={`canvas-text font-${selectedFont.toLowerCase()}`}>
                  {storyText || (selectedMusic ? "" : "Start typing in the box...")}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* State 3: Photo Story Editor */}
        {storyMode === "photo" && (
          <div className="story-editor-layout">
            <div className="story-editor-controls shadow-sm">
              <div className="editor-controls-header">
                <h5>Photo Story</h5>
                <button className="btn-switch-mode" onClick={() => setStoryMode("choose")}>Change photo</button>
              </div>

              {/* Music Sticker Trigger */}
              <div className="story-music-trigger-box">
                {selectedMusic ? (
                  <div className="selected-music-pill">
                    <img src={selectedMusic.cover} alt="" className="music-pill-thumb" />
                    <div className="music-pill-info">
                      <strong>{selectedMusic.title}</strong>
                      <small>{selectedMusic.artist}</small>
                    </div>
                    <button className="music-pill-remove" onClick={() => setSelectedMusic(null)} title="Remove Music">
                      <BsX size={18} />
                    </button>
                  </div>
                ) : (
                  <button 
                    type="button" 
                    className="btn-add-music-story"
                    onClick={() => setShowMusicPicker(true)}
                  >
                    <BsMusicNoteBeamed size={16} /> Add Music / Song 🎵
                  </button>
                )}
              </div>

              <label>Add Caption</label>
              <input 
                type="text" 
                placeholder="Add text over your photo..."
                value={storyText}
                onChange={(e) => setStoryText(e.target.value)}
              />

              <div className="editor-bottom-actions" style={{ marginTop: "auto" }}>
                <button className="btn-discard" onClick={() => setStoryMode("choose")}>Discard</button>
                <button className="btn-share-story" disabled={isSubmitting} onClick={handleShareStory}>
                  {isSubmitting ? "Sharing..." : "Share to story"}
                </button>
              </div>
            </div>

            <div className="story-preview-wrapper">
              <div className="story-canvas-preview photo-canvas shadow-lg">
                <img src={photoUrl} alt="Story canvas" />

                {/* Music Sticker on Photo */}
                {selectedMusic && (
                  <div className={`story-music-sticker photo-sticker style-${selectedMusic.stickerStyle || "sticker"}`}>
                    <div className="sticker-card-wrap">
                      <img src={selectedMusic.cover} alt="" className="sticker-card-cover" />
                      <div className="sticker-card-meta">
                        <strong className="sticker-title">{selectedMusic.title}</strong>
                        <span className="sticker-artist">{selectedMusic.artist}</span>
                      </div>
                    </div>
                  </div>
                )}

                {storyText && (
                  <div className="photo-text-overlay">
                    <span>{storyText}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* State 4: Dedicated Music Story Editor */}
        {storyMode === "music" && (
          <div className="story-editor-layout">
            <div className="story-editor-controls shadow-sm">
              <div className="editor-controls-header">
                <h5>Music Story 🎵</h5>
                <button className="btn-switch-mode" onClick={() => setStoryMode("choose")}>Change type</button>
              </div>

              <div className="story-music-trigger-box">
                {selectedMusic ? (
                  <div className="selected-music-pill">
                    <img src={selectedMusic.cover} alt="" className="music-pill-thumb" />
                    <div className="music-pill-info">
                      <strong>{selectedMusic.title}</strong>
                      <small>{selectedMusic.artist}</small>
                    </div>
                    <button className="btn-change-music-link" onClick={() => setShowMusicPicker(true)}>
                      Change
                    </button>
                  </div>
                ) : (
                  <button 
                    type="button" 
                    className="btn-add-music-story"
                    onClick={() => setShowMusicPicker(true)}
                  >
                    <BsMusicNoteBeamed size={16} /> Choose a Song 🎵
                  </button>
                )}
              </div>

              <label>Add Story Note / Lyrics (Optional)</label>
              <textarea
                placeholder="Write your mood or favorite lyric..."
                value={storyText}
                onChange={(e) => setStoryText(e.target.value)}
                rows={3}
              />

              <label>Background Mood</label>
              <div className="bg-palettes-grid">
                {STORY_BACKGROUNDS.map((bg, i) => (
                  <div 
                    key={i} 
                    className={`bg-color-circle ${selectedBg === bg ? "active" : ""}`}
                    style={{ background: bg }}
                    onClick={() => setSelectedBg(bg)}
                  />
                ))}
              </div>

              <div className="editor-bottom-actions">
                <button className="btn-discard" onClick={() => setStoryMode("choose")}>Discard</button>
                <button 
                  className="btn-share-story" 
                  disabled={!selectedMusic || isSubmitting} 
                  onClick={handleShareStory}
                >
                  {isSubmitting ? "Sharing..." : "Share to story"}
                </button>
              </div>
            </div>

            {/* Preview Canvas with Vinyl & Equalizer */}
            <div className="story-preview-wrapper">
              <div className="story-canvas-preview shadow-lg music-canvas" style={{ background: selectedBg }}>
                {selectedMusic ? (
                  <div className="music-story-center-card">
                    {/* Vinyl Animation */}
                    <div className="vinyl-stage">
                      <div className="vinyl-disc-big rotating">
                        <img src={selectedMusic.cover} alt="" className="vinyl-cover-big" />
                      </div>
                    </div>

                    <div className="music-story-details">
                      <h4>{selectedMusic.title}</h4>
                      <p>{selectedMusic.artist} · {selectedMusic.album}</p>
                      {selectedMusic.lyrics && (
                        <div className="music-story-lyrics-box">
                          <span>"{selectedMusic.lyrics}"</span>
                        </div>
                      )}
                    </div>

                    <div className="soundwave-anim-bar">
                      <span></span><span></span><span></span><span></span><span></span><span></span>
                    </div>

                    {storyText && (
                      <div className="music-story-user-text">
                        <p>{storyText}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-white opacity-75">
                    <BsMusicNoteBeamed size={48} className="mb-2" />
                    <h5>Select a song to preview music story</h5>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Music Picker Modal */}
      <MusicPickerModal
        isOpen={showMusicPicker}
        onClose={() => setShowMusicPicker(false)}
        onSelectSong={handleSelectSong}
        initialSong={selectedMusic}
        mode="story"
      />
    </div>
  );
}

export default CreateStory;