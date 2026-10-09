import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BsBookmarkFill, BsFolderPlus, BsSearch, BsThreeDotsVertical,
  BsTrash, BsFolderFill, BsCollectionFill, BsPlayCircleFill,
  BsPostcardFill, BsShareFill, BsLink45Deg, BsCheckCircleFill,
  BsX, BsShieldCheck, BsArrowRight
} from "react-icons/bs";
import Header from "./Header";
import { getActiveUserId } from "../services/profileApi";
import {
  fetchSavedItemsApi,
  deleteSavedItemApi,
  fetchCollectionsApi,
  createCollectionApi
} from "../services/communityHubApi";
import "./css/SavedPage.css";

function SavedPage() {
  const navigate = useNavigate();
  const currentUserId = getActiveUserId() || 1;

  const [savedItems, setSavedItems] = useState([]);
  const [collections, setCollections] = useState([]);
  const [activeCollectionId, setActiveCollectionId] = useState(null); // null means all
  const [filterType, setFilterType] = useState("all"); // 'all', 'posts', 'reels'
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  
  // Modals & Menus
  const [showCreateCollectionModal, setShowCreateCollectionModal] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [newCollectionPrivacy, setNewCollectionPrivacy] = useState("only_me");
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [itemsRes, collsRes] = await Promise.all([
        fetchSavedItemsApi(currentUserId, activeCollectionId, filterType === "all" ? null : filterType),
        fetchCollectionsApi(currentUserId)
      ]);

      if (itemsRes && itemsRes.success) {
        setSavedItems(itemsRes.data || []);
      }
      if (collsRes && collsRes.success) {
        setCollections(collsRes.data || []);
      }
    } catch (err) {
      console.error("Error loading saved items:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeCollectionId, filterType]);

  const handleUnsave = async (savedId) => {
    try {
      await deleteSavedItemApi(savedId);
      setSavedItems(prev => prev.filter(item => item.id !== savedId && item.saved_id !== savedId));
      showToast("🗑️ Item removed from your Saved bookmarks");
    } catch (err) {
      showToast("❌ Failed to unsave item");
    }
  };

  const handleCreateCollection = async (e) => {
    e.preventDefault();
    if (!newCollectionName.trim()) return;

    try {
      const res = await createCollectionApi({
        user_id: currentUserId,
        name: newCollectionName.trim(),
        privacy: newCollectionPrivacy
      });
      if (res && res.success) {
        showToast(`📁 Collection "${newCollectionName}" created!`);
        setShowCreateCollectionModal(false);
        setNewCollectionName("");
        loadData();
      }
    } catch (err) {
      showToast("❌ Failed to create collection");
    }
  };

  const handleCopyLink = (item) => {
    const link = `${window.location.origin}/post/${item.post_id || item.reel_id || 1}`;
    navigator.clipboard?.writeText(link);
    showToast("📋 Link copied to clipboard!");
    setActiveMenuId(null);
  };

  const filteredItems = savedItems.filter(item => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (item.title && item.title.toLowerCase().includes(q)) ||
      (item.content && item.content.toLowerCase().includes(q)) ||
      (item.author_name && item.author_name.toLowerCase().includes(q))
    );
  });

  return (
    <div className="saved-page-wrapper">
      <Header />

      <div className="saved-main-layout container-fluid">
        {/* LEFT SIDEBAR: Filters & Collections */}
        <aside className="saved-left-sidebar">
          <div className="saved-sidebar-header">
            <div className="d-flex align-items-center gap-2">
              <div className="saved-badge-icon">
                <BsBookmarkFill size={20} />
              </div>
              <h4 className="m-0 font-weight-bold">Saved</h4>
            </div>
            <button 
              className="btn-create-coll-trigger"
              onClick={() => setShowCreateCollectionModal(true)}
              title="Create new collection folder"
            >
              <BsFolderPlus size={18} />
            </button>
          </div>

          {/* Quick Filters */}
          <div className="saved-filter-nav">
            <button 
              className={`saved-nav-item ${activeCollectionId === null && filterType === "all" ? "active" : ""}`}
              onClick={() => { setActiveCollectionId(null); setFilterType("all"); }}
            >
              <BsCollectionFill className="nav-icon text-primary" />
              <span>All Saved Items</span>
              <span className="count-badge">{savedItems.length}</span>
            </button>

            <button 
              className={`saved-nav-item ${filterType === "posts" ? "active" : ""}`}
              onClick={() => { setFilterType("posts"); setActiveCollectionId(null); }}
            >
              <BsPostcardFill className="nav-icon text-warning" />
              <span>Posts</span>
            </button>

            <button 
              className={`saved-nav-item ${filterType === "reels" ? "active" : ""}`}
              onClick={() => { setFilterType("reels"); setActiveCollectionId(null); }}
            >
              <BsPlayCircleFill className="nav-icon text-danger" />
              <span>Reels & Videos</span>
            </button>
          </div>

          <div className="saved-divider"></div>

          {/* Collections List */}
          <div className="saved-collections-section">
            <div className="d-flex justify-content-between align-items-center mb-2 px-2">
              <span className="coll-heading">MY COLLECTIONS</span>
              <button 
                className="btn-new-coll-inline"
                onClick={() => setShowCreateCollectionModal(true)}
              >
                + New
              </button>
            </div>

            <div className="collections-list">
              {collections.map((coll) => (
                <button
                  key={coll.id}
                  className={`saved-nav-item coll-item ${activeCollectionId === coll.id ? "active" : ""}`}
                  onClick={() => { setActiveCollectionId(coll.id); setFilterType("all"); }}
                >
                  <BsFolderFill className="nav-icon text-info" />
                  <span className="coll-title text-truncate">{coll.name}</span>
                  {coll.count !== undefined && <span className="count-badge">{coll.count}</span>}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* RIGHT MAIN CONTENT AREA */}
        <main className="saved-content-area">
          {/* Top Search & Controls Bar */}
          <div className="saved-top-bar">
            <div className="saved-search-box">
              <BsSearch className="search-icon text-muted" />
              <input 
                type="text" 
                placeholder="Search your saved posts and videos..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button className="clear-search" onClick={() => setSearchQuery("")}>
                  <BsX size={20} />
                </button>
              )}
            </div>

            <div className="saved-active-tag">
              <span className="text-muted small">Viewing:</span>
              <strong className="text-light">
                {activeCollectionId ? collections.find(c => c.id === activeCollectionId)?.name || "Collection" : (filterType === "all" ? "All Bookmarks" : filterType.toUpperCase())}
              </strong>
            </div>
          </div>

          {/* Items Grid */}
          {isLoading ? (
            <div className="saved-loading-grid">
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="saved-skeleton-card"></div>
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="saved-empty-state">
              <div className="empty-icon-circle">
                <BsBookmarkFill size={36} />
              </div>
              <h5>No saved items found</h5>
              <p className="text-muted">
                {searchQuery ? "No bookmarks match your search query." : "When you bookmark posts or reels across Nexoria, they will appear right here for quick access."}
              </p>
              <button className="btn btn-primary rounded-pill px-4" onClick={() => navigate("/home")}>
                Explore Feed <BsArrowRight className="ms-1" />
              </button>
            </div>
          ) : (
            <div className="saved-cards-grid">
              {filteredItems.map((item) => (
                <div key={item.id} className="saved-item-card">
                  {/* Media Thumbnail */}
                  {item.media_url ? (
                    <div className="saved-card-media" onClick={() => item.type === "reel" ? navigate("/reels") : navigate("/home")}>
                      <img src={item.media_url} alt="" />
                      {item.type === "reel" && (
                        <div className="reel-play-overlay">
                          <BsPlayCircleFill size={36} />
                        </div>
                      )}
                      <span className="type-pill-badge">{item.type === "reel" ? "Reel" : "Post"}</span>
                    </div>
                  ) : (
                    <div className="saved-card-text-preview" onClick={() => navigate("/home")}>
                      <p>“{item.content || item.title}”</p>
                      <span className="type-pill-badge">Post</span>
                    </div>
                  )}

                  {/* Card Body */}
                  <div className="saved-card-body">
                    <div className="saved-card-header">
                      <div className="saved-author-info">
                        <img src={item.author_pic} alt="" className="author-avatar" />
                        <div>
                          <div className="d-flex align-items-center gap-1">
                            <span className="author-name">{item.author_name}</span>
                            {item.author_verified && <BsShieldCheck className="text-primary small" />}
                          </div>
                          <small className="saved-date">Saved {item.saved_at}</small>
                        </div>
                      </div>

                      {/* 3-Dots Action Menu */}
                      <div className="menu-container position-relative">
                        <button 
                          className="btn-card-menu"
                          onClick={() => setActiveMenuId(activeMenuId === item.id ? null : item.id)}
                        >
                          <BsThreeDotsVertical />
                        </button>

                        {activeMenuId === item.id && (
                          <div className="saved-dropdown-menu shadow-lg">
                            <button onClick={() => handleUnsave(item.saved_id || item.id)}>
                              <BsTrash className="text-danger me-2" /> Unsave item
                            </button>
                            <button onClick={() => handleCopyLink(item)}>
                              <BsLink45Deg className="text-info me-2" /> Copy link
                            </button>
                            <button onClick={() => { showToast("🚀 Shared to your timeline!"); setActiveMenuId(null); }}>
                              <BsShareFill className="text-success me-2" /> Share
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <h6 className="saved-card-title">{item.title}</h6>
                    {item.content && item.content !== item.title && (
                      <p className="saved-card-desc">{item.content}</p>
                    )}

                    <div className="saved-card-footer">
                      <span className="coll-tag">
                        <BsFolderFill className="me-1 text-info" /> {item.collection_name}
                      </span>
                      <button 
                        className="btn-view-item"
                        onClick={() => item.type === "reel" ? navigate("/reels") : navigate("/home")}
                      >
                        View {item.type === "reel" ? "Reel" : "Post"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* CREATE COLLECTION MODAL */}
      {showCreateCollectionModal && (
        <div className="saved-modal-overlay" onClick={() => setShowCreateCollectionModal(false)}>
          <div className="saved-modal-dialog shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="saved-modal-header">
              <h5 className="m-0 font-weight-bold">
                <BsFolderPlus className="me-2 text-primary" /> Create New Collection
              </h5>
              <button className="btn-close-modal" onClick={() => setShowCreateCollectionModal(false)}>
                <BsX size={24} />
              </button>
            </div>

            <form onSubmit={handleCreateCollection} className="saved-modal-body">
              <div className="mb-3">
                <label className="form-label font-weight-bold small text-light">Collection Name</label>
                <input 
                  type="text" 
                  className="form-control bg-dark text-light border-secondary"
                  placeholder="e.g. Dream Vacation, AI Architecture, Workflows..."
                  value={newCollectionName}
                  onChange={e => setNewCollectionName(e.target.value)}
                  autoFocus
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label font-weight-bold small text-light">Privacy</label>
                <select 
                  className="form-select bg-dark text-light border-secondary"
                  value={newCollectionPrivacy}
                  onChange={e => setNewCollectionPrivacy(e.target.value)}
                >
                  <option value="only_me">🔒 Only Me (Private)</option>
                  <option value="friends">👥 Friends Only</option>
                  <option value="public">🌐 Public</option>
                </select>
              </div>

              <div className="d-flex justify-content-end gap-2 mt-4">
                <button 
                  type="button" 
                  className="btn btn-secondary rounded-pill px-3"
                  onClick={() => setShowCreateCollectionModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary rounded-pill px-4 font-weight-bold"
                  disabled={!newCollectionName.trim()}
                >
                  Create Collection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Toast */}
      {toastMessage && (
        <div className="saved-floating-toast">
          {toastMessage}
        </div>
      )}
    </div>
  );
}

export default SavedPage;
