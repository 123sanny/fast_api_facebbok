import React from "react";
import {
  BsPatchCheckFill, BsFileEarmarkCheckFill, BsXLg, BsX, BsArrowRepeat
} from "react-icons/bs";

export default function BlueTickSection({
  bluetickRequestsList = [],
  verifiedUsersList = [],
  bluetickSubTab,
  setBluetickSubTab,
  bluetickFilter,
  setBluetickFilter,
  isLoading,
  loadBlueTickData,
  handleProcessBlueTick,
  handleRevokeBlueTick,
  // Modal state
  showBlueTickModal,
  setShowBlueTickModal,
  selectedBlueTickReq,
  setSelectedBlueTickReq,
  bluetickNote,
  setBluetickNote
}) {
  const filteredRequests = bluetickRequestsList.filter(item => {
    if (bluetickFilter === "all") return true;
    return item.status === bluetickFilter;
  });

  return (
    <div className="admin-bluetick-view">
      <div className="admin-view-header">
        <div>
          <h3 className="view-main-title">🌟 Blue Tick Verification & Purchases Hub</h3>
          <p className="view-sub-title">Manage paid Blue Tick subscription requests, inspect identity documents, and maintain the platform's verified users directory.</p>
        </div>

        <div className="d-flex align-items-center gap-2 flex-wrap">
          <div className="filter-pill-group">
            <button 
              className={`filter-pill-btn ${bluetickSubTab === "requests" ? "active" : ""}`}
              onClick={() => setBluetickSubTab("requests")}
            >
              📋 Verification Requests ({bluetickRequestsList.filter(r => r.status === "pending").length} Pending)
            </button>
            <button 
              className={`filter-pill-btn ${bluetickSubTab === "verified_users" ? "active" : ""}`}
              onClick={() => setBluetickSubTab("verified_users")}
            >
              👑 Verified Users Directory ({verifiedUsersList.length})
            </button>
          </div>

          <button 
            className="btn btn-outline-secondary d-flex align-items-center gap-2"
            onClick={loadBlueTickData}
            title="Refresh verification data"
          >
            <BsArrowRepeat size={16} className={isLoading ? "spin-icon" : ""} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {bluetickSubTab === "requests" ? (
        /* Sub-tab 1: Blue Tick Applications Queue */
        <div>
          <div className="filter-pill-group mb-3">
            <button 
              className={`filter-pill-btn ${bluetickFilter === "all" ? "active" : ""}`}
              onClick={() => setBluetickFilter("all")}
            >
              All Requests
            </button>
            <button 
              className={`filter-pill-btn ${bluetickFilter === "pending" ? "active" : ""}`}
              onClick={() => setBluetickFilter("pending")}
            >
              🟡 Pending Approvals
            </button>
            <button 
              className={`filter-pill-btn ${bluetickFilter === "approved" ? "active" : ""}`}
              onClick={() => setBluetickFilter("approved")}
            >
              🟢 Approved
            </button>
          </div>

          <div className="admin-surface-card shadow-sm p-0 overflow-hidden">
            <div className="table-responsive">
              <table className="table admin-data-table mb-0 align-middle">
                <thead>
                  <tr>
                    <th>Applicant</th>
                    <th>Category</th>
                    <th>ID Document Proof</th>
                    <th>Payment Ref & Fee</th>
                    <th>Status</th>
                    <th className="text-end">Verification Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-4 text-muted">
                        No verification requests found in this filter.
                      </td>
                    </tr>
                  ) : (
                    filteredRequests.map((req) => (
                      <tr key={req.id}>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <img 
                              src={req.user_avatar} 
                              alt="" 
                              className="admin-table-avatar" 
                              style={{ width: 34, height: 34 }}
                              onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(req.full_name || req.user_name || "User")}&background=1877f2&color=fff`; }}
                            />
                            <div>
                              <strong className="d-block text-light">{req.full_name || req.user_name}</strong>
                              <span className="text-muted small">{req.user_email}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="badge bg-primary-subtle text-primary">
                            {req.category}
                          </span>
                        </td>
                        <td>
                          <div>
                            <span className="d-block small">{req.id_document_type}</span>
                            {req.id_document_url && (
                              <a 
                                href={req.id_document_url} 
                                target="_blank" 
                                rel="noreferrer"
                                className="btn btn-sm btn-outline-info p-0 px-2 mt-1"
                                style={{ fontSize: 11 }}
                              >
                                <BsFileEarmarkCheckFill className="me-1" /> View ID Document
                              </a>
                            )}
                          </div>
                        </td>
                        <td>
                          <div>
                            <strong className="text-success">₹{req.amount_paid}</strong>
                            <div className="small text-muted font-monospace">{req.payment_ref || "Paid via Subscription"}</div>
                          </div>
                        </td>
                        <td>
                          <span className={`admin-status-chip ${req.status === "approved" ? "chip-active" : req.status === "rejected" ? "chip-banned" : "bg-warning-subtle text-warning"}`}>
                            {req.status ? req.status.toUpperCase() : "PENDING"}
                          </span>
                        </td>
                        <td className="text-end">
                          {req.status === "pending" ? (
                            <div className="d-flex justify-content-end gap-2">
                              <button 
                                className="btn btn-sm btn-primary fw-bold"
                                onClick={() => {
                                  setSelectedBlueTickReq(req);
                                  setShowBlueTickModal(true);
                                }}
                              >
                                🌟 Approve & Grant Badge
                              </button>
                              <button 
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleProcessBlueTick(req.id, "reject")}
                              >
                                <BsXLg className="me-1" /> Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-muted small">
                              {req.status === "approved" ? "🌟 Blue Tick Granted" : "Application Rejected"}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Sub-tab 2: Verified Users Directory */
        <div className="admin-surface-card shadow-sm p-0 overflow-hidden">
          <div className="p-3 border-bottom border-secondary-subtle d-flex justify-content-between align-items-center">
            <div>
              <h5 className="mb-0 fw-bold">👑 Active Verified Accounts Directory</h5>
              <span className="text-muted small">Platform members currently authorized to display the official Blue Verification badge</span>
            </div>
            <span className="badge bg-primary fs-6">{verifiedUsersList.length} Verified Accounts</span>
          </div>

          <div className="table-responsive">
            <table className="table admin-data-table mb-0 align-middle">
              <thead>
                <tr>
                  <th>Verified Member</th>
                  <th>Handle & Contact</th>
                  <th>Badge Tier</th>
                  <th>Content Volume</th>
                  <th>Verified Since</th>
                  <th className="text-end">Revoke Access</th>
                </tr>
              </thead>
              <tbody>
                {verifiedUsersList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-4 text-muted">
                      No verified users currently registered on the platform.
                    </td>
                  </tr>
                ) : (
                  verifiedUsersList.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <img 
                            src={user.avatar} 
                            alt="" 
                            className="admin-table-avatar" 
                            style={{ width: 36, height: 36 }}
                            onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || "User")}&background=1877f2&color=fff`; }}
                          />
                          <div>
                            <div className="d-flex align-items-center gap-1">
                              <strong className="text-light">{user.name}</strong>
                              <BsPatchCheckFill className="text-primary" size={15} />
                            </div>
                            <span className="text-muted small">{user.email}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="text-info">{user.username}</span>
                        <div className="text-muted small">{user.mobile}</div>
                      </td>
                      <td>
                        <span className="badge btn-verified-badge">
                          🌟 Official Verified
                        </span>
                      </td>
                      <td>
                        <span className="small text-muted">{user.posts_count} Posts • {user.reels_count} Reels</span>
                      </td>
                      <td>
                        <span className="text-muted small">{user.verified_since || "Active"}</span>
                      </td>
                      <td className="text-end">
                        <button 
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleRevokeBlueTick(user.id, user.name)}
                          title="Revoke Blue Tick badge from account"
                        >
                          🚫 Revoke Blue Tick
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= 🌟 BLUE TICK APPROVAL MODAL ================= */}
      {showBlueTickModal && selectedBlueTickReq && (
        <div className="admin-modal-backdrop" onClick={() => setShowBlueTickModal(false)}>
          <div className="admin-modal-box shadow-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header-row">
              <h5>🌟 Approve Blue Tick Verification</h5>
              <button className="close-btn" onClick={() => setShowBlueTickModal(false)}><BsX size={26} /></button>
            </div>

            <div className="modal-body-content">
              <div className="d-flex align-items-center gap-3 mb-3 p-2 rounded bg-secondary-subtle">
                <img 
                  src={selectedBlueTickReq.user_avatar} 
                  alt="" 
                  className="admin-table-avatar" 
                  style={{ width: 44, height: 44 }}
                  onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedBlueTickReq.full_name || selectedBlueTickReq.user_name || "User")}&background=1877f2&color=fff`; }}
                />
                <div>
                  <div className="d-flex align-items-center gap-1">
                    <strong>{selectedBlueTickReq.full_name || selectedBlueTickReq.user_name}</strong>
                    <BsPatchCheckFill className="text-primary" />
                  </div>
                  <div className="text-muted small">{selectedBlueTickReq.user_email}</div>
                </div>
              </div>

              <div className="user-detail-grid mb-3">
                <div className="detail-item">
                  <span className="text-muted small">Category</span>
                  <strong>{selectedBlueTickReq.category}</strong>
                </div>
                <div className="detail-item">
                  <span className="text-muted small">ID Document Type</span>
                  <strong>{selectedBlueTickReq.id_document_type}</strong>
                </div>
                <div className="detail-item">
                  <span className="text-muted small">Subscription Fee</span>
                  <strong className="text-success">₹{selectedBlueTickReq.amount_paid}</strong>
                </div>
                <div className="detail-item">
                  <span className="text-muted small">Payment / UTR Ref</span>
                  <strong className="font-monospace small">{selectedBlueTickReq.payment_ref || "Direct"}</strong>
                </div>
              </div>

              {selectedBlueTickReq.id_document_url && (
                <div className="mb-3">
                  <label className="form-label small fw-bold">Submitted Identity Proof</label>
                  <div className="rounded overflow-hidden border border-secondary-subtle" style={{ maxHeight: 180 }}>
                    <img src={selectedBlueTickReq.id_document_url} alt="ID Document" style={{ width: "100%", objectFit: "cover" }} />
                  </div>
                </div>
              )}

              <label className="form-label small fw-bold">Admin Verification Notes</label>
              <input 
                type="text"
                className="form-control admin-input mb-3"
                placeholder="E.g., Identity and government documents fully verified"
                value={bluetickNote}
                onChange={(e) => setBluetickNote(e.target.value)}
              />
            </div>

            <div className="modal-footer-row">
              <button className="btn btn-secondary" onClick={() => setShowBlueTickModal(false)}>Cancel</button>
              <button 
                className="btn btn-danger"
                onClick={() => handleProcessBlueTick(selectedBlueTickReq.id, "reject")}
              >
                Reject
              </button>
              <button 
                className="btn btn-primary fw-bold"
                onClick={() => handleProcessBlueTick(selectedBlueTickReq.id, "approve")}
              >
                🌟 Grant Official Blue Tick
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
