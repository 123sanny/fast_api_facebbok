import React, { useState, useEffect, useRef } from "react";
import {
  BsSearch, BsX, BsPlayFill, BsPauseFill,
  BsMusicNoteBeamed, BsCheck2, BsSoundwave,
  BsDisc, BsFileText, BsSliders2Vertical,
  BsUpload, BsMicFill, BsStopFill, BsLink45Deg,
  BsFilm, BsHeadphones
} from "react-icons/bs";
import { MUSIC_GENRES, getFilteredTracks } from "../utils/musicLibrary";
import "./css/MusicPickerModal.css";

const STICKER_STYLES = [
  { id: "sticker", label: "Album Card", icon: <BsMusicNoteBeamed /> },
  { id: "vinyl", label: "Vinyl Disc", icon: <BsDisc /> },
  { id: "lyrics", label: "Lyrics", icon: <BsFileText /> },
  { id: "compact", label: "Pill Badge", icon: <BsSoundwave /> }
];

const DIALOGUE_COVERS = [
  { id: "cinema", label: "🎬 Cinema", url: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=300" },
  { id: "action", label: "🔥 Action", url: "https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=300" },
  { id: "rocky", label: "⚡ Rocky Boss", url: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=300" },
  { id: "comedy", label: "💰 25 Din", url: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=300" },
  { id: "mic", label: "🎙️ Voice Studio", url: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=300" },
  { id: "music", label: "🎧 Headphone", url: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300" },
  { id: "party", label: "🚀 Party", url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=300" }
];

function MusicPickerModal({ isOpen, onClose, onSelectSong, initialSong = null, mode = "story" }) {
  // Navigation Tabs: 'library' | 'upload' | 'record' | 'url'
  const [activeTab, setActiveTab] = useState("library");

  // Library State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [selectedTrack, setSelectedTrack] = useState(initialSong || null);
  const [playingTrackId, setPlayingTrackId] = useState(null);
  const [stickerStyle, setStickerStyle] = useState("sticker");
  const [startSec, setStartSec] = useState(0);

  // Custom Upload State
  const [customAudioUrl, setCustomAudioUrl] = useState("");
  const [customTitle, setCustomTitle] = useState("");
  const [customArtist, setCustomArtist] = useState("");
  const [customCover, setCustomCover] = useState(DIALOGUE_COVERS[0].url);
  const [customLyrics, setCustomLyrics] = useState("");

  // Live Voice / Dialogue Recorder State
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [recordedUrl, setRecordedUrl] = useState("");
  const [recordedTitle, setRecordedTitle] = useState("");
  const [recordedSpeaker, setRecordedSpeaker] = useState("");
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordTimerRef = useRef(null);

  // Direct Audio URL State
  const [inputUrl, setInputUrl] = useState("");
  const [inputUrlTitle, setInputUrlTitle] = useState("");
  const [inputUrlArtist, setInputUrlArtist] = useState("");

  const audioRef = useRef(null);

  // Stop audio on unmount or close
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (recordTimerRef.current) {
        clearInterval(recordTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      if (audioRef.current) {
        audioRef.current.pause();
        setPlayingTrackId(null);
      }
      if (isRecording) {
        handleStopRecording();
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const tracks = getFilteredTracks(selectedGenre, searchQuery);

  // Toggle Audio Audition / Preview
  const handleTogglePreview = (track, e) => {
    e?.stopPropagation();

    if (playingTrackId === track.id) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setPlayingTrackId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(track.audioUrl);
      audio.currentTime = startSec;
      audio.play().catch((err) => console.warn("Audio play blocked:", err));
      audioRef.current = audio;
      setPlayingTrackId(track.id);

      audio.onended = () => {
        setPlayingTrackId(null);
      };
    }
  };

  const handleTrackClick = (track) => {
    setSelectedTrack(track);
    if (playingTrackId !== track.id) {
      handleTogglePreview(track);
    }
  };

  // 1. Handle File Upload from Device
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileUrl = URL.createObjectURL(file);
    const cleanName = file.name.replace(/\.[^/.]+$/, "");

    setCustomAudioUrl(fileUrl);
    setCustomTitle(cleanName);
    setCustomArtist("Custom Audio / Dialogue");

    const newTrack = {
      id: "uploaded-" + Date.now(),
      title: cleanName,
      artist: "Custom Dialogue / Song",
      album: "Local Device File",
      audioUrl: fileUrl,
      cover: customCover,
      lyrics: "Attached from local device 🎧",
      duration: 30
    };

    setSelectedTrack(newTrack);
  };

  // 2. Handle Live Dialogue / Voice Recording
  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/mp3" });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedUrl(audioUrl);

        const recTitle = recordedTitle.trim() || "Recorded Dialogue 🎙️";
        const recArtist = recordedSpeaker.trim() || "Original Voice Clip";

        const recTrack = {
          id: "recorded-" + Date.now(),
          title: recTitle,
          artist: recArtist,
          album: "Live Voice Recording",
          audioUrl: audioUrl,
          cover: customCover || "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=300",
          lyrics: `Voice Note (${recordDuration}s) 🎙️`,
          duration: recordDuration || 15
        };

        setSelectedTrack(recTrack);
        stream.getTracks().forEach((t) => t.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordDuration(0);
      recordTimerRef.current = setInterval(() => {
        setRecordDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Mic recording failed:", err);
      alert("Microphone permission was denied or is unavailable on this device.");
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordTimerRef.current) {
        clearInterval(recordTimerRef.current);
      }
    }
  };

  // 3. Handle Direct URL Attachment
  const handleAddDirectUrl = () => {
    if (!inputUrl.trim()) return;
    const urlTrack = {
      id: "url-" + Date.now(),
      title: inputUrlTitle.trim() || "Web Audio Track",
      artist: inputUrlArtist.trim() || "Online Stream",
      album: "Web Soundtrack",
      audioUrl: inputUrl.trim(),
      cover: customCover,
      lyrics: "Direct audio stream link 🔗",
      duration: 30
    };
    setSelectedTrack(urlTrack);
  };

  // Final confirmation to attach song/dialogue to story or post
  const handleConfirmSelection = () => {
    let finalTrack = selectedTrack;

    if (activeTab === "upload" && customAudioUrl) {
      finalTrack = {
        title: customTitle.trim() || "Custom Dialogue / Song",
        artist: customArtist.trim() || "Original Audio",
        album: "Device Upload",
        audioUrl: customAudioUrl,
        cover: customCover,
        lyrics: customLyrics.trim() || "Attached from Device 📁",
        duration: 30,
        startTime: startSec,
        stickerStyle: stickerStyle
      };
    } else if (activeTab === "record" && recordedUrl) {
      finalTrack = {
        title: recordedTitle.trim() || "Recorded Dialogue 🎙️",
        artist: recordedSpeaker.trim() || "Voice Note",
        album: "Live Voice Recording",
        audioUrl: recordedUrl,
        cover: customCover,
        lyrics: `Live Dialogue (${recordDuration}s) 🎙️`,
        duration: recordDuration || 15,
        startTime: 0,
        stickerStyle: stickerStyle
      };
    } else if (activeTab === "url" && inputUrl) {
      finalTrack = {
        title: inputUrlTitle.trim() || "Web Audio Stream",
        artist: inputUrlArtist.trim() || "Online Stream",
        album: "Web Audio",
        audioUrl: inputUrl.trim(),
        cover: customCover,
        lyrics: "Online Audio Stream 🔗",
        duration: 30,
        startTime: startSec,
        stickerStyle: stickerStyle
      };
    }

    if (!finalTrack || !finalTrack.audioUrl) {
      alert("Please choose, record, or upload a song/dialogue first!");
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      setPlayingTrackId(null);
    }

    onSelectSong({
      title: finalTrack.title,
      artist: finalTrack.artist,
      album: finalTrack.album || "Soundtrack",
      audioUrl: finalTrack.audioUrl,
      cover: finalTrack.cover || customCover,
      lyrics: finalTrack.lyrics,
      duration: finalTrack.duration || 30,
      startTime: startSec,
      stickerStyle: stickerStyle
    });

    onClose();
  };

  return (
    <div className="music-modal-overlay" onClick={onClose}>
      <div className="music-modal-card" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="music-modal-header">
          <div className="d-flex align-items-center gap-2">
            <div className="music-header-icon-box">
              <BsMusicNoteBeamed size={18} />
            </div>
            <div>
              <h5 className="music-modal-title">Audio & Dialogue Studio</h5>
              <p className="music-modal-subtitle">
                Add songs, movie dialogues, viral memes, or record your voice
              </p>
            </div>
          </div>
          <button className="music-modal-close-btn" onClick={onClose}>
            <BsX size={24} />
          </button>
        </div>

        {/* Master Mode Switcher Tabs */}
        <div className="music-mode-tabs-bar">
          <button
            className={`music-tab-btn ${activeTab === "library" ? "active" : ""}`}
            onClick={() => setActiveTab("library")}
          >
            <BsHeadphones className="me-1" /> Library & Dialogues
          </button>
          <button
            className={`music-tab-btn ${activeTab === "upload" ? "active" : ""}`}
            onClick={() => setActiveTab("upload")}
          >
            <BsUpload className="me-1" /> Upload Audio / Dialogue
          </button>
          <button
            className={`music-tab-btn ${activeTab === "record" ? "active" : ""}`}
            onClick={() => setActiveTab("record")}
          >
            <BsMicFill className="me-1" /> Record Voice
          </button>
          <button
            className={`music-tab-btn ${activeTab === "url" ? "active" : ""}`}
            onClick={() => setActiveTab("url")}
          >
            <BsLink45Deg className="me-1" /> Audio Link
          </button>
        </div>

        {/* TAB 1: CURATED SONGS & FAMOUS DIALOGUES LIBRARY */}
        {activeTab === "library" && (
          <>
            {/* Search Input */}
            <div className="music-search-wrap">
              <BsSearch className="music-search-icon" />
              <input
                type="text"
                className="music-search-input"
                placeholder="Search songs, dialogues (Pushpa, KGF, Don, Hera Pheri)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              {searchQuery && (
                <button className="music-search-clear" onClick={() => setSearchQuery("")}>
                  <BsX size={18} />
                </button>
              )}
            </div>

            {/* Genre / Category Tabs */}
            <div className="music-genres-scroll">
              {MUSIC_GENRES.map((g) => (
                <button
                  key={g.id}
                  className={`music-genre-chip ${selectedGenre === g.id ? "active" : ""}`}
                  onClick={() => setSelectedGenre(g.id)}
                >
                  {g.label}
                </button>
              ))}
            </div>

            {/* Tracks List */}
            <div className="music-tracks-list">
              {tracks.length === 0 ? (
                <div className="music-empty-state">
                  <BsFilm size={36} className="text-muted mb-2" />
                  <p>No songs or dialogues found for "{searchQuery}". You can upload your custom file from the <strong>Upload</strong> tab!</p>
                </div>
              ) : (
                tracks.map((t) => {
                  const isSelected = selectedTrack?.id === t.id;
                  const isPlaying = playingTrackId === t.id;

                  return (
                    <div
                      key={t.id}
                      className={`music-track-row ${isSelected ? "selected" : ""}`}
                      onClick={() => handleTrackClick(t)}
                    >
                      {/* Cover with Play/Pause button */}
                      <div className="music-track-cover-wrap">
                        <img src={t.cover} alt={t.title} className="music-track-cover" />
                        <button
                          className={`music-play-overlay-btn ${isPlaying ? "playing" : ""}`}
                          onClick={(e) => handleTogglePreview(t, e)}
                        >
                          {isPlaying ? <BsPauseFill size={18} /> : <BsPlayFill size={18} />}
                        </button>
                      </div>

                      {/* Info */}
                      <div className="music-track-info">
                        <div className="d-flex align-items-center gap-1.5 flex-wrap">
                          <strong className="music-track-title">{t.title}</strong>
                          {t.genre === "dialogues" && (
                            <span className="badge-dialogue-tag">🎬 Dialogue</span>
                          )}
                          {t.trending && (
                            <span className="badge-trending-tag">🔥 Viral</span>
                          )}
                        </div>
                        <span className="music-track-artist">{t.artist} · {t.album}</span>
                        {t.lyrics && (
                          <small className="music-track-lyrics">"{t.lyrics.slice(0, 50)}..."</small>
                        )}
                      </div>

                      {/* Equalizer animation when playing */}
                      {isPlaying && (
                        <div className="music-equalizer-bars">
                          <span></span>
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                      )}

                      {/* Selected checkmark or Add icon */}
                      <div className="music-select-indicator">
                        {isSelected ? (
                          <div className="music-selected-circle">
                            <BsCheck2 size={16} />
                          </div>
                        ) : (
                          <button className="music-use-btn">Select</button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}

        {/* TAB 2: UPLOAD CUSTOM AUDIO / DIALOGUE FILE */}
        {activeTab === "upload" && (
          <div className="music-custom-tab-container">
            <div className="upload-dropzone-box">
              <input
                type="file"
                id="custom-audio-upload-input"
                accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg"
                onChange={handleFileUpload}
                style={{ display: "none" }}
              />
              <label htmlFor="custom-audio-upload-input" className="upload-dropzone-label">
                <div className="upload-icon-circle">
                  <BsUpload size={24} />
                </div>
                <strong>Click to Upload Any Song or Dialogue File</strong>
                <span>Supports MP3, WAV, AAC, M4A, OGG from your phone or PC</span>
              </label>
            </div>

            {customAudioUrl && (
              <div className="uploaded-details-form mt-3">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="badge bg-success">Audio File Ready ✅</span>
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => handleTogglePreview({ id: "custom-preview", audioUrl: customAudioUrl })}
                  >
                    {playingTrackId === "custom-preview" ? <BsPauseFill size={16} /> : <BsPlayFill size={16} />}
                    {playingTrackId === "custom-preview" ? "Pause" : "Listen Preview"}
                  </button>
                </div>

                <div className="mb-2">
                  <label className="form-label-custom">Song / Dialogue Title</label>
                  <input
                    type="text"
                    className="form-control-custom"
                    placeholder="e.g. Pushpa Climax Dialogue or Song Title"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                  />
                </div>

                <div className="mb-2">
                  <label className="form-label-custom">Speaker / Artist Name</label>
                  <input
                    type="text"
                    className="form-control-custom"
                    placeholder="e.g. Allu Arjun, Rocky Bhai, or Your Name"
                    value={customArtist}
                    onChange={(e) => setCustomArtist(e.target.value)}
                  />
                </div>

                <div className="mb-2">
                  <label className="form-label-custom">Dialogue / Song Quote (Optional)</label>
                  <input
                    type="text"
                    className="form-control-custom"
                    placeholder="e.g. Jhukega nahi sala! 🔥"
                    value={customLyrics}
                    onChange={(e) => setCustomLyrics(e.target.value)}
                  />
                </div>

                {/* Theme Cover Selector */}
                <div className="mb-2">
                  <label className="form-label-custom">Choose Sticker Cover Art</label>
                  <div className="dialogue-covers-grid">
                    {DIALOGUE_COVERS.map((cov) => (
                      <div
                        key={cov.id}
                        className={`dialogue-cover-item ${customCover === cov.url ? "active" : ""}`}
                        onClick={() => setCustomCover(cov.url)}
                      >
                        <img src={cov.url} alt={cov.label} />
                        <span>{cov.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: LIVE VOICE / DIALOGUE RECORDER */}
        {activeTab === "record" && (
          <div className="music-custom-tab-container text-center py-4">
            <div className="recorder-visualizer-box">
              <div className={`recorder-mic-pulse ${isRecording ? "recording" : ""}`}>
                <BsMicFill size={36} color="#ffffff" />
              </div>
              <h4 className="mt-3 font-weight-bold">
                {isRecording ? `Recording Dialogue... 00:${recordDuration < 10 ? "0" + recordDuration : recordDuration}` : "Live Voice & Dialogue Studio"}
              </h4>
              <p className="text-muted small">
                Record your own iconic dialogue, punchline, or voice note and attach it to your story or feed post!
              </p>
            </div>

            <div className="recorder-controls-row mt-3">
              {!isRecording ? (
                <button className="btn btn-danger rounded-pill px-4 py-2 fw-bold d-inline-flex align-items-center gap-2" onClick={handleStartRecording}>
                  <BsMicFill /> Start Recording
                </button>
              ) : (
                <button className="btn btn-dark rounded-pill px-4 py-2 fw-bold d-inline-flex align-items-center gap-2" onClick={handleStopRecording}>
                  <BsStopFill size={20} /> Stop & Save Clip
                </button>
              )}
            </div>

            {recordedUrl && (
              <div className="recorded-clip-box mt-4 text-start">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <span className="badge bg-success">Voice Clip Recorded ({recordDuration}s) 🎉</span>
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => handleTogglePreview({ id: "rec-preview", audioUrl: recordedUrl })}
                  >
                    {playingTrackId === "rec-preview" ? <BsPauseFill size={16} /> : <BsPlayFill size={16} />}
                    {playingTrackId === "rec-preview" ? "Pause" : "Play Voice"}
                  </button>
                </div>

                <div className="mb-2">
                  <label className="form-label-custom">Dialogue / Voice Title</label>
                  <input
                    type="text"
                    className="form-control-custom"
                    placeholder="e.g. My Favorite Movie Dialogue"
                    value={recordedTitle}
                    onChange={(e) => setRecordedTitle(e.target.value)}
                  />
                </div>

                <div className="mb-2">
                  <label className="form-label-custom">Speaker Name</label>
                  <input
                    type="text"
                    className="form-control-custom"
                    placeholder="e.g. Your Name or Movie Character"
                    value={recordedSpeaker}
                    onChange={(e) => setRecordedSpeaker(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: DIRECT AUDIO URL */}
        {activeTab === "url" && (
          <div className="music-custom-tab-container py-3">
            <div className="mb-3">
              <label className="form-label-custom">Direct Audio / Song / Dialogue Link (MP3 / Audio URL)</label>
              <div className="input-group">
                <input
                  type="url"
                  className="form-control-custom"
                  placeholder="https://example.com/audio/pushpa_dialogue.mp3"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                />
                <button className="btn btn-primary px-3 ms-2 rounded-pill fw-bold" onClick={handleAddDirectUrl}>
                  Load
                </button>
              </div>
            </div>

            <div className="mb-2">
              <label className="form-label-custom">Song / Dialogue Title</label>
              <input
                type="text"
                className="form-control-custom"
                placeholder="Title (e.g. Viral Meme Theme)"
                value={inputUrlTitle}
                onChange={(e) => setInputUrlTitle(e.target.value)}
              />
            </div>

            <div className="mb-2">
              <label className="form-label-custom">Artist / Speaker Name</label>
              <input
                type="text"
                className="form-control-custom"
                placeholder="Artist or Character Name"
                value={inputUrlArtist}
                onChange={(e) => setInputUrlArtist(e.target.value)}
              />
            </div>

            {/* Theme Cover Selector */}
            <div className="mb-2 mt-3">
              <label className="form-label-custom">Choose Cover Art</label>
              <div className="dialogue-covers-grid">
                {DIALOGUE_COVERS.map((cov) => (
                  <div
                    key={cov.id}
                    className={`dialogue-cover-item ${customCover === cov.url ? "active" : ""}`}
                    onClick={() => setCustomCover(cov.url)}
                  >
                    <img src={cov.url} alt={cov.label} />
                    <span>{cov.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Bottom Drawer: Trimmer & Sticker Customizer (When a track is picked or uploaded) */}
        {(selectedTrack || customAudioUrl || recordedUrl || inputUrl) && (
          <div className="music-bottom-customizer">
            <div className="music-selected-summary">
              <img
                src={selectedTrack?.cover || customCover || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300"}
                alt=""
                className="music-mini-cover"
              />
              <div className="music-mini-info">
                <strong>{selectedTrack?.title || customTitle || recordedTitle || inputUrlTitle || "Ready to Attach"}</strong>
                <span>{selectedTrack?.artist || customArtist || recordedSpeaker || inputUrlArtist || "Audio Track"}</span>
              </div>
            </div>

            {/* Sticker Style Selector (For stories) */}
            {mode === "story" && (
              <div className="music-sticker-style-section">
                <span className="style-label">Sticker Style on Screen:</span>
                <div className="music-sticker-styles-row">
                  {STICKER_STYLES.map((st) => (
                    <button
                      key={st.id}
                      className={`music-style-btn ${stickerStyle === st.id ? "active" : ""}`}
                      onClick={() => setStickerStyle(st.id)}
                    >
                      {st.icon} {st.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Audio 30s Timeline Scrubber */}
            <div className="music-timeline-scrubber">
              <div className="d-flex align-items-center justify-content-between mb-1">
                <span className="small text-muted d-flex align-items-center gap-1">
                  <BsSliders2Vertical size={13} /> Clip start time: {startSec}s
                </span>
                <span className="small fw-bold text-primary">30s Duration</span>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                step="5"
                value={startSec}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setStartSec(val);
                  if (audioRef.current && playingTrackId) {
                    audioRef.current.currentTime = val;
                  }
                }}
                className="form-range music-range-slider"
              />
            </div>

            {/* Confirm Button */}
            <div className="d-flex gap-2 mt-2">
              <button
                type="button"
                className="btn btn-secondary rounded-pill w-50 fw-bold"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary rounded-pill w-50 fw-bold d-flex align-items-center justify-content-center gap-2"
                onClick={handleConfirmSelection}
              >
                <BsCheck2 size={18} /> Attach to {mode === "story" ? "Story" : "Post"}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default MusicPickerModal;
