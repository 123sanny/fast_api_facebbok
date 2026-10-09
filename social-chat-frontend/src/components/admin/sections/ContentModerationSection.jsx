import React from "react";
import {
  BsSearch, BsPinAngleFill, BsTrash3Fill, BsRocketTakeoffFill,
  BsPlayFill, BsEyeFill, BsX
} from "react-icons/bs";

export default function ContentModerationSection({
  activeTab = "posts", // "posts", "reels", "reports"
  postsList = [],
  postSearch,
  setPostSearch,
  handleFeaturePost,
  handleDeletePost,
  reelsList = [],
  reelSearch,
  setReelSearch,
  reelCategoryFilter,
  setReelCategoryFilter,
  handleFeatureReel,
  handleDeleteReel,
  activePreviewReel,
  setActivePreviewReel,
  reportsList = [],
  reportFilter,
  setReportFilter,
  handleActionReport
}) {
  return (
    <div>
      {/* ================= POSTS & AI TRUTHGUARD ================= */}
      {activeTab === "posts" && (
        <div className="admin-posts-view">
          <div className="admin-view-header">
            <div>
              <h3 className="view-main-title">Posts & AI TruthGuard Moderation</h3>
              <p className="view-sub-title">Inspect real-time posts, automated deepfake detections, and truth scoring.</p>
            </div>

            <div className="admin-search-input-box">
              <BsSearch />
              <input 
                type="text" 
                placeholder="Search posts by content text..."
                value={postSearch}
                onChange={(e) => setPostSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="posts-admin-grid">
            {postsList.length === 0 ? (
              <div className="admin-surface-card text-center py-5 text-muted col-12">
                No posts found.
              </div>
            ) : (
              postsList.map(post => (
                <div key={post.id} className="post-admin-card shadow-sm">
                  <div className="post-admin-header">
                    <div className="d-flex align-items-center gap-2">
                      <img 
                        src={post.author_avatar} 
                        alt="" 
                        className="post-author-avatar" 
                        onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author_name || "User")}&background=1877f2&color=fff`; }}
                      />
                      <div>
                        <strong>{post.author_name}</strong>
                        <span className="d-block small text-muted">{post.created_at}</span>
                      </div>
                    </div>

                    <div className="d-flex align-items-center gap-2">
                      <span className={`truthguard-badge ${post.truthguard_score >= 85 ? "badge-authentic" : "badge-flagged"}`}>
                        🛡️ {post.truthguard_score}% TruthGuard
                      </span>
                      
                      <button 
                        className="btn btn-sm btn-outline-warning p-1"
                        onClick={() => handleFeaturePost(post.id)}
                        title="Pin to Explore Feed"
                      >
                        <BsPinAngleFill />
                      </button>

                      <button 
                        className="btn btn-sm btn-outline-danger p-1"
                        onClick={() => handleDeletePost(post.id)}
                        title="Remove Post"
                      >
                        <BsTrash3Fill />
                      </button>
                    </div>
                  </div>

                  <p className="post-admin-body-txt">{post.content || "No text caption"}</p>

                  {post.image_url && (
                    <div className="post-admin-media-box">
                      <img src={post.image_url} alt="" />
                    </div>
                  )}

                  <div className="post-admin-footer">
                    <span className="small text-muted">👍 {post.likes_count} likes • 💬 {post.comments_count} comments</span>
                    <span className="badge bg-secondary-subtle text-secondary">{post.privacy}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ================= REELS MODERATION ================= */}
      {activeTab === "reels" && (
        <div className="admin-reels-view">
          <div className="admin-view-header">
            <div>
              <h3 className="view-main-title">Reels & Vertical Video Moderation</h3>
              <p className="view-sub-title">Review short videos uploaded to the database, feature high quality creators, and delete policy violations.</p>
            </div>

            <div className="admin-search-input-box">
              <BsSearch />
              <input 
                type="text" 
                placeholder="Search reels by caption or sound..."
                value={reelSearch}
                onChange={(e) => setReelSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Category Pills */}
          <div className="admin-filter-bar mb-3">
            {["all", "Trending", "Music", "Comedy", "Tech", "Dance", "Fitness"].map(cat => (
              <button 
                key={cat}
                className={`filter-pill ${reelCategoryFilter === cat ? "active" : ""}`}
                onClick={() => setReelCategoryFilter(cat)}
              >
                {cat === "all" ? "All Reels" : cat}
              </button>
            ))}
          </div>

          <div className="reels-admin-grid">
            {reelsList
              .filter(r => reelCategoryFilter === "all" || (r.category && r.category.toLowerCase() === reelCategoryFilter.toLowerCase()))
              .map(reel => (
              <div key={reel.id} className="reel-admin-card shadow-sm">
                <div className="reel-admin-thumb-wrap" onClick={() => setActivePreviewReel(reel)}>
                  <img src={reel.thumbnail_url || "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=600"} alt="" />
                  <div className="reel-play-overlay">
                    <BsPlayFill size={36} />
                  </div>
                  <span className="reel-cat-badge">{reel.category}</span>
                </div>

                <div className="p-3">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <strong className="small text-truncate">{reel.creator_name}</strong>
                    <div className="d-flex gap-1">
                      <button 
                        className="btn btn-sm btn-outline-warning p-1"
                        onClick={() => handleFeatureReel(reel.id)}
                        title="Boost to Trending"
                      >
                        <BsRocketTakeoffFill size={13} />
                      </button>
                      <button 
                        className="btn btn-sm btn-outline-danger p-1"
                        onClick={() => handleDeleteReel(reel.id)}
                        title="Delete Reel"
                      >
                        <BsTrash3Fill size={13} />
                      </button>
                    </div>
                  </div>

                  <p className="small text-truncate mb-2 text-muted">{reel.caption}</p>

                  <div className="d-flex align-items-center justify-content-between small text-muted">
                    <span><BsEyeFill className="me-1" /> {reel.views_count}</span>
                    <span>🎵 {reel.audio_title}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= REPORTS & SAFETY ================= */}
      {activeTab === "reports" && (
        <div className="admin-reports-view">
          <div className="admin-view-header">
            <div>
              <h3 className="view-main-title">Community Safety & Reports Queue</h3>
              <p className="view-sub-title">Review user-submitted violation reports, harassment claims, and spam flags.</p>
            </div>

            <div className="admin-filter-bar">
              <button 
                className={`filter-pill ${reportFilter === "all" ? "active" : ""}`}
                onClick={() => setReportFilter("all")}
              >
                All Reports
              </button>
              <button 
                className={`filter-pill ${reportFilter === "pending" ? "active" : ""}`}
                onClick={() => setReportFilter("pending")}
              >
                Pending Review
              </button>
            </div>
          </div>

          <div className="reports-admin-list">
            {reportsList
              .filter(r => reportFilter === "all" || r.status === reportFilter)
              .map(report => (
              <div key={report.id} className="report-admin-card shadow-sm">
                <div className="d-flex align-items-start justify-content-between">
                  <div>
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <span className="badge bg-danger text-white">⚠️ Community Violation</span>
                      <span className="text-muted small">Reported by <strong>{report.reporter_name}</strong> • {report.created_at}</span>
                    </div>
                    <h6 className="fw-bold mb-1">Reason: {report.reason}</h6>
                    <p className="text-muted small mb-0">Target: User #{report.target_user_id || "N/A"} • Entity ID: #{report.target_post_id || "N/A"}</p>
                  </div>

                  <div className="d-flex align-items-center gap-2">
                    <button 
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => handleActionReport(report.id, "dismissed")}
                    >
                      Dismiss
                    </button>
                    <button 
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleActionReport(report.id, "content_deleted")}
                    >
                      Remove Content
                    </button>
                    <button 
                      className="btn btn-sm btn-danger fw-bold"
                      onClick={() => handleActionReport(report.id, "user_suspended")}
                    >
                      Suspend User
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= REEL PREVIEW MODAL ================= */}
      {activePreviewReel && (
        <div className="admin-modal-backdrop" onClick={() => setActivePreviewReel(null)}>
          <div className="admin-reel-preview-box shadow-lg" onClick={e => e.stopPropagation()}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h6 className="mb-0 fw-bold">{activePreviewReel.creator_name}</h6>
              <button className="close-btn" onClick={() => setActivePreviewReel(null)}><BsX size={26} /></button>
            </div>
            
            <div className="admin-video-player-frame">
              <video 
                src={activePreviewReel.video_url} 
                controls 
                autoPlay 
                className="admin-preview-video"
              />
            </div>

            <div className="mt-3 d-flex justify-content-between align-items-center">
              <div>
                <p className="small mb-1">{activePreviewReel.caption}</p>
                <span className="small text-muted">🎵 {activePreviewReel.audio_title} • {activePreviewReel.views_count} views</span>
              </div>
              <button 
                className="btn btn-danger btn-sm"
                onClick={() => {
                  handleDeleteReel(activePreviewReel.id);
                  setActivePreviewReel(null);
                }}
              >
                <BsTrash3Fill className="me-1" /> Delete Reel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
