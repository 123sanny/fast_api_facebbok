import React, { useState } from "react";
import { 
  BsX, BsCameraVideoFill, BsUpload, BsCheck2Circle, 
  BsPlayFill, BsImage, BsGlobeAmericas 
} from "react-icons/bs";
import { getActiveUserId } from "../services/profileApi";
import { createWatchVideoApi, uploadReelVideoApi } from "../services/reelsApi";
import "./css/CreateWatchModal.css";

const WATCH_CATEGORIES = [
  "💻 Tech & AI", "🏏 Sports", "🎮 Gaming", "✈️ Travel", 
  "🍳 Food", "🎵 Music", "😂 Comedy", "📚 Tutorials", "🎬 Movies"
];

const PRESET_THUMBNAILS = [
  { id: 1, label: "Tech / Cyber", url: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1000" },
  { id: 2, label: "Sports Stadium", url: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=1000" },
  { id: 3, label: "Nature & Travel", url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1000" },
  { id: 4, label: "Gaming Arena", url: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1000" },
  { id: 5, label: "Cinema / Studio", url: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1000" }
];

function CreateWatchModal({ onClose, onVideoPublished }) {
  const currentUserId = Number(getActiveUserId());
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("💻 Tech & AI");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailUrl, setThumbnailUrl] = useState(PRESET_THUMBNAILS[0].url);
  const [isUploading, setIsUploading] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const handleVideoFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleCustomThumbnailUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setThumbnailUrl(ev.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePublish = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Please enter a video title.");
      return;
    }
    if (!videoUrl && !videoFile) {
      alert("Please upload a video or provide a video URL.");
      return;
    }

    try {
      setIsUploading(true);
      let finalVideoUrl = videoUrl;

      // If local video file was selected, upload it to the backend
      if (videoFile) {
        const uploadRes = await uploadReelVideoApi(videoFile);
        if (uploadRes && uploadRes.success && uploadRes.video_url) {
          finalVideoUrl = uploadRes.video_url;
        }
      }

      const payload = {
        user_id: currentUserId,
        title: title.trim(),
        description: description.trim(),
        video_url: finalVideoUrl,
        thumbnail_url: thumbnailUrl,
        category: category.replace(/[^a-zA-Z &]/g, "").trim(),
        duration: 180,
        video_type: "watch"
      };

      const res = await createWatchVideoApi(payload);
      if (res && res.success) {
        setToastMsg("Watch video published successfully! 🚀");
        window.dispatchEvent(new CustomEvent("nexoria_watch_video_created", { detail: res.data }));
        if (onVideoPublished) {
          onVideoPublished(res.data);
        }
        setTimeout(() => {
          onClose();
        }, 800);
      } else {
        alert(res?.message || "Failed to publish watch video.");
        setIsUploading(false);
      }
    } catch (err) {
      console.error("Watch publish error:", err);
      alert("Network error publishing video.");
      setIsUploading(false);
    }
  };

  return (
    <div className="create-watch-modal-overlay" onClick={onClose}>
      <div className="create-watch-modal-dialog shadow-xl" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="create-watch-header">
          <div className="d-flex align-items-center gap-2">
            <div className="create-watch-icon-box">
              <BsCameraVideoFill size={20} />
            </div>
            <div>
              <h5 className="m-0 fw-bold">Upload to Nexoria Watch</h5>
              <small className="text-muted">Publish 16:9 videos for the creator community</small>
            </div>
          </div>
          <button className="create-watch-close-btn" onClick={onClose}>
            <BsX size={26} />
          </button>
        </div>

        {toastMsg && (
          <div className="create-watch-toast-banner">
            <BsCheck2Circle size={18} /> {toastMsg}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handlePublish} className="create-watch-body">
          
          {/* Video Selector / Dropzone */}
          <div className="watch-upload-section">
            {!videoUrl ? (
              <div className="watch-video-dropzone">
                <input
                  type="file"
                  id="watch-video-file-input"
                  accept="video/mp4,video/webm,video/ogg,video/quicktime"
                  onChange={handleVideoFileUpload}
                  style={{ display: "none" }}
                />
                <label htmlFor="watch-video-file-input" className="watch-dropzone-label">
                  <div className="dropzone-circle">
                    <BsUpload size={26} />
                  </div>
                  <strong>Click to Upload 16:9 Video File</strong>
                  <span>Supports MP4, WebM, MOV (High Definition 1080p)</span>
                </label>
              </div>
            ) : (
              <div className="watch-video-preview-box">
                <video src={videoUrl} controls playsInline className="watch-preview-video" poster={thumbnailUrl} />
                <button
                  type="button"
                  className="btn-change-video"
                  onClick={() => { setVideoUrl(""); setVideoFile(null); }}
                >
                  Change Video
                </button>
              </div>
            )}
          </div>

          {/* Or Paste Direct Video URL */}
          <div className="mt-2 mb-3">
            <label className="watch-form-label">Or Paste Online Video URL (MP4 / Stream)</label>
            <input
              type="url"
              className="watch-form-input"
              placeholder="https://commondatastorage.googleapis.com/.../sample.mp4"
              value={videoUrl.startsWith("blob:") ? "" : videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
            />
          </div>

          {/* Video Title */}
          <div className="mb-3">
            <label className="watch-form-label">Video Title <span className="text-danger">*</span></label>
            <input
              type="text"
              className="watch-form-input fw-bold"
              placeholder="e.g. Building an Autonomous AI Agent Ecosystem in 2026"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div className="mb-3">
            <label className="watch-form-label">Description & Tags</label>
            <textarea
              className="watch-form-textarea"
              rows={3}
              placeholder="Tell viewers what your video is about, timestamps, source code, and #tags..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Category Selector */}
          <div className="mb-3">
            <label className="watch-form-label">Channel Category</label>
            <div className="watch-category-pills">
              {WATCH_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`category-pill-btn ${category === cat ? "active" : ""}`}
                  onClick={() => setCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Thumbnail Selector */}
          <div className="mb-3">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <label className="watch-form-label m-0">Video Thumbnail Cover</label>
              <label htmlFor="custom-thumb-file-input" className="btn-upload-thumb-link">
                <BsImage className="me-1" /> Upload Custom Cover
              </label>
              <input
                type="file"
                id="custom-thumb-file-input"
                accept="image/*"
                onChange={handleCustomThumbnailUpload}
                style={{ display: "none" }}
              />
            </div>

            <div className="thumbnail-presets-row">
              {PRESET_THUMBNAILS.map((thumb) => (
                <div
                  key={thumb.id}
                  className={`thumb-preset-card ${thumbnailUrl === thumb.url ? "active" : ""}`}
                  onClick={() => setThumbnailUrl(thumb.url)}
                >
                  <img src={thumb.url} alt={thumb.label} />
                  <span>{thumb.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Privacy & Audience */}
          <div className="watch-privacy-row mb-3">
            <div className="d-flex align-items-center gap-2">
              <BsGlobeAmericas className="text-primary" />
              <div>
                <strong>Public Broadcast</strong>
                <p className="m-0 text-muted small">Visible to all Nexoria users & followers on Watch feed</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="create-watch-footer">
            <button
              type="button"
              className="btn btn-secondary rounded-pill px-4 fw-bold"
              onClick={onClose}
              disabled={isUploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary rounded-pill px-5 fw-bold d-flex align-items-center gap-2"
              disabled={isUploading || !title.trim() || (!videoUrl && !videoFile)}
            >
              {isUploading ? (
                <>Publishing Video...</>
              ) : (
                <><BsPlayFill size={20} /> Publish to Watch Feed</>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

export default CreateWatchModal;
