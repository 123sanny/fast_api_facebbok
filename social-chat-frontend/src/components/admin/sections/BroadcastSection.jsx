import React from "react";
import {
  BsBroadcast, BsPlusLg, BsTrash3Fill, BsX
} from "react-icons/bs";

export default function BroadcastSection({
  activeTab = "announcements", // "broadcast" or "announcements"
  broadcastForm,
  setBroadcastForm,
  isBroadcasting,
  handleSendBroadcast,
  announcementsList = [],
  showCreateAnnouncementModal,
  setShowCreateAnnouncementModal,
  announcementForm,
  setAnnouncementForm,
  handleCreateAnnouncement,
  handleDeleteAnnouncement
}) {
  return (
    <div>
      {/* ================= TAB 10: GLOBAL BROADCAST ================= */}
      {activeTab === "broadcast" && (
        <div className="admin-broadcast-view">
          <div className="admin-view-header">
            <div>
              <h3 className="view-main-title">Live Global Platform Broadcast</h3>
              <p className="view-sub-title">Publish real-time announcements, emergency alerts, or major product updates to all users.</p>
            </div>
          </div>

          <div className="row g-4">
            <div className="col-lg-7">
              <div className="admin-surface-card shadow-sm">
                <h5 className="mb-3 fw-bold">📢 Compose Live Announcement</h5>
                
                <form onSubmit={handleSendBroadcast}>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Announcement Title</label>
                    <input 
                      type="text"
                      className="form-control admin-input"
                      value={broadcastForm.title}
                      onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold">Announcement Body Message</label>
                    <textarea 
                      className="form-control admin-input"
                      rows={4}
                      value={broadcastForm.message}
                      onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                      required
                    />
                  </div>

                  <div className="row g-3 mb-4">
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Banner Alert Theme</label>
                      <select 
                        className="form-select admin-input"
                        value={broadcastForm.type}
                        onChange={(e) => setBroadcastForm({ ...broadcastForm, type: e.target.value })}
                      >
                        <option value="info">🔵 Informational (Blue)</option>
                        <option value="warning">🟡 Maintenance Alert (Amber)</option>
                        <option value="success">🟢 Celebration / New Feature (Green)</option>
                        <option value="danger">🔴 Critical Urgent Alert (Red)</option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Target Audience</label>
                      <select 
                        className="form-select admin-input"
                        value={broadcastForm.target}
                        onChange={(e) => setBroadcastForm({ ...broadcastForm, target: e.target.value })}
                      >
                        <option value="all">🌍 All Registered Users</option>
                        <option value="creators">⭐ Verified Creators Only</option>
                        <option value="new">🚀 New Signups (Last 7 Days)</option>
                      </select>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isBroadcasting}
                    className="btn btn-warning w-100 py-2 fw-bold text-dark shadow"
                  >
                    {isBroadcasting ? "Publishing Dispatch..." : "🚀 Push Live Broadcast Now"}
                  </button>
                </form>
              </div>
            </div>

            <div className="col-lg-5">
              <div className="admin-surface-card shadow-sm">
                <h5 className="mb-3 fw-bold">👁️ User Feed Live Preview</h5>
                <p className="text-muted small mb-3">This is how your banner will appear at the top of the user feed:</p>

                <div className={`p-3 rounded-3 border ${broadcastForm.type === "warning" ? "bg-warning-subtle text-warning border-warning" : broadcastForm.type === "success" ? "bg-success-subtle text-success border-success" : broadcastForm.type === "danger" ? "bg-danger-subtle text-danger border-danger" : "bg-primary-subtle text-primary border-primary"}`}>
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <BsBroadcast />
                    <strong>{broadcastForm.title || "Announcement Title"}</strong>
                  </div>
                  <p className="small mb-0">{broadcastForm.message || "Message body will appear here..."}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB: NOTIFICATIONS & ANNOUNCEMENTS ================= */}
      {activeTab === "announcements" && (
        <div className="admin-announcements-view">
          <div className="admin-view-header">
            <div>
              <h3 className="view-main-title">🔔 Notifications & Announcements Hub</h3>
              <p className="view-sub-title">Push instant platform alerts, targeted user announcements, or schedule future notifications.</p>
            </div>

            <div className="d-flex align-items-center gap-2">
              <button 
                className="btn btn-primary d-flex align-items-center gap-2 fw-bold shadow-sm"
                onClick={() => setShowCreateAnnouncementModal(true)}
              >
                <BsPlusLg size={14} /> Create Announcement
              </button>
            </div>
          </div>

          {/* KPI Summary */}
          <div className="row g-3 mb-4">
            <div className="col-6 col-md-3">
              <div className="admin-metric-card p-3 shadow-sm">
                <span className="metric-label text-muted small">Total Dispatches</span>
                <h3 className="metric-val text-light mb-0">{announcementsList.length}</h3>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="admin-metric-card p-3 shadow-sm">
                <span className="metric-label text-muted small">Broadcast Sent</span>
                <h3 className="metric-val text-success mb-0">{announcementsList.filter(a => a.is_sent).length}</h3>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="admin-metric-card p-3 shadow-sm">
                <span className="metric-label text-muted small">Scheduled Queue</span>
                <h3 className="metric-val text-warning mb-0">{announcementsList.filter(a => !a.is_sent).length}</h3>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="admin-metric-card p-3 shadow-sm">
                <span className="metric-label text-muted small">Total Audience Reached</span>
                <h3 className="metric-val text-info mb-0">
                  {announcementsList.reduce((acc, curr) => acc + (curr.recipients_count || 0), 0).toLocaleString()}
                </h3>
              </div>
            </div>
          </div>

          <div className="admin-surface-card shadow-sm p-0 overflow-hidden">
            <div className="table-responsive">
              <table className="table admin-data-table mb-0 align-middle">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Title & Content</th>
                    <th>Category Type</th>
                    <th>Target Audience</th>
                    <th>Status</th>
                    <th>Sent / Scheduled Time</th>
                    <th>Recipients</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {announcementsList.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-4 text-muted">No announcements posted yet.</td>
                    </tr>
                  ) : (
                    announcementsList.map((item) => (
                      <tr key={item.id}>
                        <td><code>#{item.id}</code></td>
                        <td style={{ maxWidth: 320 }}>
                          <strong className="text-light d-block">{item.title}</strong>
                          <small className="text-muted">{item.message}</small>
                        </td>
                        <td>
                          <span className={`badge ${item.type === "warning" ? "bg-warning-subtle text-warning" : item.type === "alert" ? "bg-danger-subtle text-danger" : item.type === "success" ? "bg-success-subtle text-success" : "bg-primary-subtle text-primary"}`}>
                            {item.type?.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <span className="badge bg-secondary-subtle text-light">
                            👥 {item.target_audience?.replace(/_/g, " ")?.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          {item.is_sent ? (
                            <span className="admin-status-chip chip-active">✅ SENT LIVE</span>
                          ) : (
                            <span className="admin-status-chip bg-warning-subtle text-warning">⏳ SCHEDULED</span>
                          )}
                        </td>
                        <td className="text-muted small">{item.sent_at || item.scheduled_at || item.created_at}</td>
                        <td><strong className="text-info">{item.recipients_count}</strong></td>
                        <td className="text-end">
                          <button 
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDeleteAnnouncement(item.id)}
                            title="Delete Announcement"
                          >
                            <BsTrash3Fill size={13} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= 🔔 CREATE ANNOUNCEMENT MODAL ================= */}
      {showCreateAnnouncementModal && (
        <div className="admin-modal-backdrop" onClick={() => setShowCreateAnnouncementModal(false)}>
          <div className="admin-modal-box shadow-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header-row">
              <h5>📢 Broadcast Platform Announcement</h5>
              <button className="close-btn" onClick={() => setShowCreateAnnouncementModal(false)}><BsX size={26} /></button>
            </div>

            <form onSubmit={handleCreateAnnouncement}>
              <div className="modal-body-content">
                <div className="mb-3">
                  <label className="form-label small fw-bold">Announcement Title</label>
                  <input 
                    type="text"
                    className="form-control admin-input"
                    placeholder="e.g., Major Platform Upgrade & New Creator Features!"
                    value={announcementForm.title}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-bold">Message Content / Push Body</label>
                  <textarea 
                    className="form-control admin-input"
                    rows={4}
                    placeholder="Enter announcement text to display on user feed and notifications..."
                    value={announcementForm.message}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, message: e.target.value })}
                    required
                  />
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-bold">Notification Type</label>
                    <select 
                      className="form-select admin-select"
                      value={announcementForm.type}
                      onChange={(e) => setAnnouncementForm({ ...announcementForm, type: e.target.value })}
                    >
                      <option value="info">ℹ️ Informational (Blue)</option>
                      <option value="warning">⚠️ Notice / Warning (Yellow)</option>
                      <option value="success">🎉 Success / Celebration (Green)</option>
                      <option value="alert">🚨 Critical Security Alert (Red)</option>
                      <option value="promotion">🎁 Star / Special Offer</option>
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-bold">Target Audience</label>
                    <select 
                      className="form-select admin-select"
                      value={announcementForm.target_audience}
                      onChange={(e) => setAnnouncementForm({ ...announcementForm, target_audience: e.target.value })}
                    >
                      <option value="all">🌍 All Registered Users</option>
                      <option value="creators">⭐ Verified Creators</option>
                      <option value="verified_users">🌟 Blue Tick Verified</option>
                    </select>
                  </div>
                </div>

                <div className="mb-2">
                  <label className="form-label small fw-bold">Schedule for Future (Optional)</label>
                  <input 
                    type="datetime-local"
                    className="form-control admin-input"
                    value={announcementForm.scheduled_at}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, scheduled_at: e.target.value })}
                  />
                  <small className="text-muted">Leave empty to broadcast immediately across live feeds.</small>
                </div>
              </div>

              <div className="modal-footer-row">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateAnnouncementModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary fw-bold">
                  🚀 Publish Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
