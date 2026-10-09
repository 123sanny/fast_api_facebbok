import React from "react";
import {
  BsPlusLg, BsSearch, BsX, BsMegaphoneFill, BsTrash3Fill
} from "react-icons/bs";

export default function AdsSection({
  adsList = [],
  adsSummary = {},
  adSearch,
  setAdSearch,
  adFilter,
  setAdFilter,
  handleUpdateAdStatus,
  handleDeleteAd,
  // Modal state & handlers
  showCreateAdModal,
  setShowCreateAdModal,
  adForm,
  setAdForm,
  handleCreateAd
}) {
  const filteredAds = adsList.filter(item => {
    if (adFilter !== "all" && item.status !== adFilter) return false;
    if (!adSearch) return true;
    const q = adSearch.toLowerCase();
    return (
      (item.brand_name && item.brand_name.toLowerCase().includes(q)) ||
      (item.headline && item.headline.toLowerCase().includes(q))
    );
  });

  return (
    <div className="admin-ads-view">
      <div className="admin-view-header">
        <div>
          <h3 className="view-main-title">📊 Sponsored Ads & Advertiser Campaigns</h3>
          <p className="view-sub-title">Review, approve, pause, and inspect live click-through telemetry for platform ads.</p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button 
            className="btn btn-primary d-flex align-items-center gap-2 fw-bold shadow-sm"
            onClick={() => setShowCreateAdModal(true)}
          >
            <BsPlusLg size={14} /> Create Ad Campaign
          </button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="admin-metric-card p-3 shadow-sm">
            <span className="metric-label text-muted small">Total Campaigns</span>
            <h3 className="metric-val text-light mb-0">{adsSummary.totalCampaigns || adsList.length}</h3>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="admin-metric-card p-3 shadow-sm">
            <span className="metric-label text-muted small">Active Campaigns</span>
            <h3 className="metric-val text-success mb-0">{adsSummary.activeCampaigns || adsList.filter(a => a.status === "active").length}</h3>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="admin-metric-card p-3 shadow-sm">
            <span className="metric-label text-muted small">Total Views & Clicks</span>
            <h3 className="metric-val text-info mb-0">{adsSummary.totalViews?.toLocaleString() || 0} / {adsSummary.totalClicks?.toLocaleString() || 0}</h3>
            <small className="text-secondary" style={{ fontSize: "11px" }}>Avg CTR: {adsSummary.averageCTR || 0}%</small>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="admin-metric-card p-3 shadow-sm">
            <span className="metric-label text-muted small">Total Ad Budget / Spent</span>
            <h3 className="metric-val text-warning mb-0">₹{adsSummary.totalBudgetINR?.toLocaleString() || 0}</h3>
            <small className="text-success" style={{ fontSize: "11px" }}>Spent: ₹{adsSummary.totalSpentINR?.toLocaleString() || 0}</small>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="admin-surface-card mb-3 p-3 shadow-sm d-flex flex-wrap align-items-center justify-content-between gap-3">
        <div className="admin-search-input-box flex-grow-1" style={{ maxWidth: 380 }}>
          <BsSearch size={14} />
          <input 
            type="text"
            placeholder="Search campaigns by brand or headline..."
            value={adSearch}
            onChange={(e) => setAdSearch(e.target.value)}
          />
          {adSearch && <button className="clear-btn" onClick={() => setAdSearch("")}><BsX size={16} /></button>}
        </div>

        <div className="filter-pill-group">
          <button className={`filter-pill-btn ${adFilter === "all" ? "active" : ""}`} onClick={() => setAdFilter("all")}>All Ads</button>
          <button className={`filter-pill-btn ${adFilter === "active" ? "active" : ""}`} onClick={() => setAdFilter("active")}>🟢 Active</button>
          <button className={`filter-pill-btn ${adFilter === "paused" ? "active" : ""}`} onClick={() => setAdFilter("paused")}>⏸️ Paused</button>
        </div>
      </div>

      <div className="admin-surface-card shadow-sm p-0 overflow-hidden">
        <div className="table-responsive">
          <table className="table admin-data-table mb-0 align-middle">
            <thead>
              <tr>
                <th>Campaign</th>
                <th>Category</th>
                <th>Budget & Spent</th>
                <th>Impressions & Clicks</th>
                <th>CTR (%)</th>
                <th>Target URL</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAds.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-4 text-muted">No campaigns found.</td>
                </tr>
              ) : (
                filteredAds.map((ad) => (
                  <tr key={ad.id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        {ad.media_url ? (
                          <img src={ad.media_url} alt="" className="rounded" style={{ width: 44, height: 44, objectFit: "cover" }} />
                        ) : (
                          <div className="rounded bg-primary-subtle text-primary d-flex align-items-center justify-content-center" style={{ width: 44, height: 44 }}>
                            <BsMegaphoneFill size={18} />
                          </div>
                        )}
                        <div>
                          <strong className="text-light d-block">{ad.brand_name}</strong>
                          <small className="text-muted">{ad.headline}</small>
                        </div>
                      </div>
                    </td>
                    <td><span className="badge bg-secondary-subtle text-light">{ad.category}</span></td>
                    <td>
                      <div style={{ minWidth: 120 }}>
                        <div className="d-flex justify-content-between small mb-1">
                          <span>₹{ad.spent?.toLocaleString()}</span>
                          <span className="text-muted">₹{ad.budget?.toLocaleString()}</span>
                        </div>
                        <div className="progress" style={{ height: 4 }}>
                          <div className="progress-bar bg-warning" style={{ width: `${Math.min(100, (ad.spent / (ad.budget || 1)) * 100)}%` }}></div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div><strong>{ad.views_count?.toLocaleString()}</strong> views</div>
                      <small className="text-info">{ad.clicks_count?.toLocaleString()} clicks</small>
                    </td>
                    <td><strong className="text-success">{ad.ctr_percent}%</strong></td>
                    <td>
                      <a href={ad.target_url} target="_blank" rel="noreferrer" className="text-truncate d-inline-block text-info" style={{ maxWidth: 140 }}>
                        {ad.target_url}
                      </a>
                    </td>
                    <td>
                      <span className={`admin-status-chip ${ad.status === "active" ? "chip-active" : "chip-banned"}`}>
                        {ad.status?.toUpperCase()}
                      </span>
                    </td>
                    <td className="text-end">
                      <div className="d-flex justify-content-end gap-1">
                        {ad.status === "active" ? (
                          <button className="btn btn-sm btn-outline-warning" onClick={() => handleUpdateAdStatus(ad.id, "pause")} title="Pause Campaign">
                            ⏸️
                          </button>
                        ) : (
                          <button className="btn btn-sm btn-outline-success" onClick={() => handleUpdateAdStatus(ad.id, "resume")} title="Resume Campaign">
                            ▶️
                          </button>
                        )}
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteAd(ad.id)} title="Delete Campaign">
                          <BsTrash3Fill size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= 📊 CREATE AD CAMPAIGN MODAL ================= */}
      {showCreateAdModal && (
        <div className="admin-modal-backdrop" onClick={() => setShowCreateAdModal(false)}>
          <div className="admin-modal-box shadow-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header-row">
              <h5>➕ Create Sponsored Ad Campaign</h5>
              <button className="close-btn" onClick={() => setShowCreateAdModal(false)}><BsX size={26} /></button>
            </div>

            <form onSubmit={handleCreateAd}>
              <div className="modal-body-content">
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-bold">Brand / Advertiser Name</label>
                    <input 
                      type="text"
                      className="form-control admin-input"
                      placeholder="e.g., TechNova Pro"
                      value={adForm.brand_name}
                      onChange={(e) => setAdForm({ ...adForm, brand_name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-bold">Category</label>
                    <select 
                      className="form-select admin-select"
                      value={adForm.category}
                      onChange={(e) => setAdForm({ ...adForm, category: e.target.value })}
                    >
                      <option value="Technology">💻 Technology</option>
                      <option value="Fashion">👗 Fashion & Apparel</option>
                      <option value="Gaming">🎮 Gaming & Esports</option>
                      <option value="Finance">💳 Finance & Fintech</option>
                      <option value="Education">📚 Education & Learning</option>
                    </select>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-bold">Headline</label>
                  <input 
                    type="text"
                    className="form-control admin-input"
                    placeholder="e.g., Accelerate your AI Development by 10x"
                    value={adForm.headline}
                    onChange={(e) => setAdForm({ ...adForm, headline: e.target.value })}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-bold">Description Text</label>
                  <textarea 
                    className="form-control admin-input"
                    rows={2}
                    placeholder="Short ad pitch displayed on feed..."
                    value={adForm.description}
                    onChange={(e) => setAdForm({ ...adForm, description: e.target.value })}
                  />
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-bold">Target Destination URL</label>
                    <input 
                      type="url"
                      className="form-control admin-input"
                      placeholder="https://example.com"
                      value={adForm.target_url}
                      onChange={(e) => setAdForm({ ...adForm, target_url: e.target.value })}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-bold">Creative Media / Image URL</label>
                    <input 
                      type="url"
                      className="form-control admin-input"
                      placeholder="https://images.unsplash.com/..."
                      value={adForm.media_url}
                      onChange={(e) => setAdForm({ ...adForm, media_url: e.target.value })}
                    />
                  </div>
                </div>

                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-bold">Call To Action Button</label>
                    <input 
                      type="text"
                      className="form-control admin-input"
                      placeholder="e.g., Learn More, Shop Now, Sign Up"
                      value={adForm.call_to_action}
                      onChange={(e) => setAdForm({ ...adForm, call_to_action: e.target.value })}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-bold">Total Budget (INR ₹)</label>
                    <input 
                      type="number"
                      className="form-control admin-input"
                      value={adForm.budget}
                      onChange={(e) => setAdForm({ ...adForm, budget: parseInt(e.target.value, 10) || 5000 })}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer-row">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateAdModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary fw-bold">
                  🚀 Launch Ad Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
