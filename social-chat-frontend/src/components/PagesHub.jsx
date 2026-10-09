import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BsFlagFill, BsPlusLg, BsSearch, BsCheck2, BsCheckCircleFill,
  BsShieldCheck, BsGlobe, BsPeopleFill, BsHeartFill, BsX,
  BsFillGridFill, BsBuilding, BsBroadcast, BsStarFill
} from "react-icons/bs";
import Header from "./Header";
import { getActiveUserId } from "../services/profileApi";
import {
  fetchPagesApi,
  createPageApi,
  toggleFollowPageApi
} from "../services/communityHubApi";
import "./css/PagesHub.css";

const CATEGORIES = [
  "All",
  "Tech & Innovation",
  "Music & Audio",
  "Gaming & Esports",
  "Art & Design",
  "Business & Startups",
  "Creator"
];

function PagesHub() {
  const navigate = useNavigate();
  const currentUserId = getActiveUserId() || 1;

  const [pages, setPages] = useState([]);
  const [activeTab, setActiveTab] = useState("discover"); // 'discover', 'followed', 'managed'
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Create Page Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [pageName, setPageName] = useState("");
  const [pageCategory, setPageCategory] = useState("Creator");
  const [pageBio, setPageBio] = useState("");
  const [pageWebsite, setPageWebsite] = useState("");
  const [pagePic, setPagePic] = useState("");
  const [pageCover, setPageCover] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadPages = async () => {
    setIsLoading(true);
    try {
      const res = await fetchPagesApi(
        selectedCategory === "All" ? null : selectedCategory,
        searchQuery || null,
        currentUserId
      );
      if (res && res.success) {
        setPages(res.data || []);
      }
    } catch (err) {
      console.error("Error loading pages:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPages();
  }, [selectedCategory]);

  const handleFollowToggle = async (pageId) => {
    try {
      const res = await toggleFollowPageApi(pageId, currentUserId);
      if (res && res.success) {
        setPages(prev => prev.map(p => {
          if (p.id === pageId) {
            const newFollowed = !p.is_followed;
            return {
              ...p,
              is_followed: newFollowed,
              followers_count: newFollowed ? p.followers_count + 1 : Math.max(0, p.followers_count - 1)
            };
          }
          return p;
        }));
        showToast(res.is_followed ? "🚩 Following page!" : "Unfollowed page");
      }
    } catch (err) {
      showToast("❌ Could not update follow status");
    }
  };

  const handleCreatePage = async (e) => {
    e.preventDefault();
    if (!pageName.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await createPageApi({
        creator_id: currentUserId,
        name: pageName.trim(),
        category: pageCategory,
        bio: pageBio.trim(),
        website: pageWebsite.trim(),
        profile_pic: pagePic.trim() || `https://api.dicebear.com/7.x/identicon/svg?seed=${pageName}`,
        cover_photo: pageCover.trim() || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200"
      });

      if (res && res.success) {
        showToast(`🎉 Page "${pageName}" created successfully!`);
        setShowCreateModal(false);
        setPageName("");
        setPageBio("");
        setPageWebsite("");
        setPagePic("");
        setPageCover("");
        loadPages();
      } else {
        showToast("❌ Could not create page");
      }
    } catch (err) {
      showToast("❌ Error creating page");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter based on active sidebar tab
  const displayedPages = pages.filter(p => {
    if (activeTab === "followed") return p.is_followed;
    if (activeTab === "managed") return p.creator_id === currentUserId;
    return true; // discover
  });

  return (
    <div className="pages-hub-wrapper">
      <Header />

      <div className="pages-main-layout container-fluid">
        {/* Left Sidebar */}
        <aside className="pages-left-sidebar">
          <div className="pages-sidebar-header">
            <div className="d-flex align-items-center gap-2">
              <div className="pages-badge-icon">
                <BsFlagFill size={20} />
              </div>
              <h4 className="m-0 font-weight-bold">Pages</h4>
            </div>
            <button 
              className="btn-create-page-trigger"
              onClick={() => setShowCreateModal(true)}
              title="Create new Page"
            >
              <BsPlusLg size={16} />
            </button>
          </div>

          <button 
            className="btn-create-page-big shadow"
            onClick={() => setShowCreateModal(true)}
          >
            <BsPlusLg className="me-2" /> Create New Page
          </button>

          {/* Nav Tabs */}
          <div className="pages-nav-list mt-3">
            <button 
              className={`page-nav-btn ${activeTab === "discover" ? "active" : ""}`}
              onClick={() => setActiveTab("discover")}
            >
              <BsFillGridFill className="nav-icon text-primary" />
              <span>Discover Pages</span>
            </button>

            <button 
              className={`page-nav-btn ${activeTab === "followed" ? "active" : ""}`}
              onClick={() => setActiveTab("followed")}
            >
              <BsHeartFill className="nav-icon text-danger" />
              <span>Liked & Followed Pages</span>
              <span className="count-badge">{pages.filter(p => p.is_followed).length}</span>
            </button>

            <button 
              className={`page-nav-btn ${activeTab === "managed" ? "active" : ""}`}
              onClick={() => setActiveTab("managed")}
            >
              <BsBuilding className="nav-icon text-warning" />
              <span>Your Managed Pages</span>
              <span className="count-badge">{pages.filter(p => p.creator_id === currentUserId).length}</span>
            </button>
          </div>

          <div className="pages-divider"></div>

          {/* Quick Categories */}
          <div className="pages-cat-section">
            <span className="cat-header-label">CATEGORIES</span>
            <div className="pages-cat-chips mt-2">
              {CATEGORIES.map(cat => (
                <button 
                  key={cat}
                  className={`cat-chip-btn ${selectedCategory === cat ? "active" : ""}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Right Main Grid */}
        <main className="pages-content-area">
          {/* Top Bar */}
          <div className="pages-top-bar">
            <div className="pages-search-box">
              <BsSearch className="search-icon text-muted" />
              <input 
                type="text" 
                placeholder="Search pages by name or keyword..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && loadPages()}
              />
              {searchQuery && (
                <button className="clear-search" onClick={() => { setSearchQuery(""); loadPages(); }}>
                  <BsX size={20} />
                </button>
              )}
            </div>

            <span className="pages-count-text">
              Showing <strong>{displayedPages.length}</strong> {activeTab === "followed" ? "followed pages" : "pages"}
            </span>
          </div>

          {/* Pages Grid */}
          {isLoading ? (
            <div className="pages-loading-grid">
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="page-skeleton-card"></div>
              ))}
            </div>
          ) : displayedPages.length === 0 ? (
            <div className="pages-empty-state">
              <div className="empty-flag-circle">
                <BsFlagFill size={36} />
              </div>
              <h5>No pages found in this view</h5>
              <p className="text-muted">
                {activeTab === "followed" 
                  ? "You haven't followed any pages yet. Discover verified creators, communities, and tech brands to get updates."
                  : activeTab === "managed" 
                  ? "You haven't created any pages yet. Launch your creator page or business brand on Nexoria today."
                  : "No pages match your search criteria."}
              </p>
              <button className="btn btn-primary rounded-pill px-4" onClick={() => setShowCreateModal(true)}>
                <BsPlusLg className="me-1" /> Create a Page
              </button>
            </div>
          ) : (
            <div className="pages-cards-grid">
              {displayedPages.map(page => (
                <div key={page.id} className="page-card shadow-lg">
                  {/* Cover */}
                  <div className="page-cover-banner">
                    <img src={page.cover_photo} alt="" />
                    <span className="page-cat-badge">{page.category}</span>
                  </div>

                  {/* Body */}
                  <div className="page-card-body">
                    <div className="page-profile-row">
                      <img src={page.profile_pic} alt="" className="page-avatar" />
                      <div className="page-title-wrap">
                        <div className="d-flex align-items-center gap-1">
                          <h6 className="m-0 font-weight-bold">{page.name}</h6>
                          {page.is_verified && <BsShieldCheck className="text-primary small" />}
                        </div>
                        <span className="page-handle">{page.handle}</span>
                      </div>
                    </div>

                    <p className="page-bio-text">{page.bio}</p>

                    <div className="page-metrics-row">
                      <span><BsPeopleFill className="me-1 text-primary" /> {page.followers_count.toLocaleString()} followers</span>
                      <span><BsHeartFill className="me-1 text-danger" /> {page.likes_count.toLocaleString()} likes</span>
                    </div>

                    {/* Actions */}
                    <div className="page-actions-row">
                      <button 
                        className={`btn-follow-page ${page.is_followed ? "following" : ""}`}
                        onClick={() => handleFollowToggle(page.id)}
                      >
                        {page.is_followed ? (
                          <><BsCheck2 size={18} className="me-1" /> Following</>
                        ) : (
                          <><BsPlusLg size={14} className="me-1" /> Follow Page</>
                        )}
                      </button>

                      {page.website && (
                        <a 
                          href={page.website} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="btn-page-web" 
                          title="Visit Website"
                        >
                          <BsGlobe size={16} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* CREATE PAGE MODAL */}
      {showCreateModal && (
        <div className="pages-modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="pages-modal-dialog shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="pages-modal-header">
              <h5 className="m-0 font-weight-bold">
                <BsFlagFill className="me-2 text-danger" /> Create a New Page
              </h5>
              <button className="btn-close-pmodal" onClick={() => setShowCreateModal(false)}>
                <BsX size={24} />
              </button>
            </div>

            <form onSubmit={handleCreatePage} className="pages-modal-body">
              <div className="mb-3">
                <label className="form-label font-weight-bold small text-light">Page Name</label>
                <input 
                  type="text" 
                  className="form-control bg-dark text-light border-secondary"
                  placeholder="e.g. Acme Innovations, Delhi Synthwave Studio..."
                  value={pageName}
                  onChange={e => setPageName(e.target.value)}
                  autoFocus
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label font-weight-bold small text-light">Category</label>
                <select 
                  className="form-select bg-dark text-light border-secondary"
                  value={pageCategory}
                  onChange={e => setPageCategory(e.target.value)}
                >
                  {CATEGORIES.filter(c => c !== "All").map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label font-weight-bold small text-light">Bio / Description</label>
                <textarea 
                  className="form-control bg-dark text-light border-secondary"
                  rows={3}
                  placeholder="Describe your brand, channel or organization..."
                  value={pageBio}
                  onChange={e => setPageBio(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="form-label font-weight-bold small text-light">Website / Link (Optional)</label>
                <input 
                  type="url" 
                  className="form-control bg-dark text-light border-secondary"
                  placeholder="https://yourpage.com"
                  value={pageWebsite}
                  onChange={e => setPageWebsite(e.target.value)}
                />
              </div>

              <div className="d-flex justify-content-end gap-2 mt-4">
                <button 
                  type="button" 
                  className="btn btn-secondary rounded-pill px-3"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-danger rounded-pill px-4 font-weight-bold"
                  disabled={isSubmitting || !pageName.trim()}
                >
                  {isSubmitting ? "Creating..." : "Publish Page"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      {toastMessage && (
        <div className="pages-floating-toast">
          {toastMessage}
        </div>
      )}
    </div>
  );
}

export default PagesHub;
