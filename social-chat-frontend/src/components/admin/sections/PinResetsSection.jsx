import React from "react";
import {
  BsKeyFill, BsCheckLg, BsXLg, BsX
} from "react-icons/bs";

export default function PinResetsSection({
  pinResetsList = [],
  pinResetFilter,
  setPinResetFilter,
  // Modals & handlers
  showPinResetApproveModal,
  setShowPinResetApproveModal,
  showPinResetRejectModal,
  setShowPinResetRejectModal,
  selectedPinReset,
  setSelectedPinReset,
  pinResetNote,
  setPinResetNote,
  handleApprovePinReset,
  handleRejectPinReset
}) {
  const filteredList = pinResetsList.filter(item => {
    if (pinResetFilter === "all") return true;
    return item.status === pinResetFilter;
  });

  return (
    <div className="admin-pin-resets-view">
      <div className="admin-view-header">
        <div>
          <h3 className="view-main-title">🔐 4-Digit Payment PIN Reset Verification</h3>
          <p className="view-sub-title">Users who forgot their Payment Security PIN submit a reset authorization request. Verify user identity and grant reset permissions.</p>
        </div>

        <div className="admin-filter-bar">
          <button 
            className={`filter-pill ${pinResetFilter === "all" ? "active" : ""}`}
            onClick={() => setPinResetFilter("all")}
          >
            All Requests ({pinResetsList.length})
          </button>
          <button 
            className={`filter-pill ${pinResetFilter === "pending" ? "active" : ""}`}
            onClick={() => setPinResetFilter("pending")}
          >
            🟡 Pending Verification ({pinResetsList.filter(p => p.status === "pending").length})
          </button>
          <button 
            className={`filter-pill ${pinResetFilter === "approved" ? "active" : ""}`}
            onClick={() => setPinResetFilter("approved")}
          >
            🟢 Approved ({pinResetsList.filter(p => p.status === "approved").length})
          </button>
          <button 
            className={`filter-pill ${pinResetFilter === "rejected" ? "active" : ""}`}
            onClick={() => setPinResetFilter("rejected")}
          >
            🔴 Rejected ({pinResetsList.filter(p => p.status === "rejected").length})
          </button>
        </div>
      </div>

      {/* PIN Resets Table */}
      <div className="admin-surface-card shadow-sm p-0 overflow-hidden">
        <div className="table-responsive">
          <table className="table admin-data-table mb-0 align-middle">
            <thead>
              <tr>
                <th>User Profile</th>
                <th>Registered Contact</th>
                <th>Request Reason</th>
                <th>Request Time</th>
                <th>Status</th>
                <th>Admin Note</th>
                <th className="text-end">Verification Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-5 text-muted">
                    <BsKeyFill size={36} className="text-secondary mb-2 d-block mx-auto opacity-50" />
                    No PIN reset requests found in this filter.
                  </td>
                </tr>
              ) : (
                filteredList.map((req) => (
                  <tr key={req.id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <img 
                          src={req.avatar} 
                          alt="" 
                          className="admin-table-avatar" 
                          style={{ width: 36, height: 36 }}
                          onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(req.user_name || "User")}&background=1877f2&color=fff`; }}
                        />
                        <div>
                          <strong className="d-block text-light">{req.user_name}</strong>
                          <span className="text-muted small">UID: #{req.user_id}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>{req.user_email}</div>
                      <span className="text-muted small">{req.user_phone}</span>
                    </td>
                    <td>
                      <div className="small text-light" style={{ maxWidth: "250px" }}>
                        {req.reason}
                      </div>
                    </td>
                    <td>
                      <span className="text-muted small">{req.created_at}</span>
                    </td>
                    <td>
                      <span className={`admin-status-chip ${
                        req.status === "pending" ? "chip-pending" :
                        req.status === "approved" ? "chip-approved" :
                        req.status === "resolved" ? "chip-active" : "chip-banned"
                      }`}>
                        {req.status === "pending" ? "🟡 Pending Verification" :
                         req.status === "approved" ? "🟢 Approved (Can Reset)" :
                         req.status === "resolved" ? "🎉 Resolved (New PIN Set)" : "🔴 Rejected"}
                      </span>
                    </td>
                    <td>
                      <span className="small text-muted font-monospace">
                        {req.admin_note || "—"}
                      </span>
                    </td>
                    <td className="text-end">
                      {req.status === "pending" ? (
                        <div className="d-flex justify-content-end gap-2">
                          <button 
                            className="btn btn-sm btn-success fw-bold d-inline-flex align-items-center"
                            onClick={() => {
                              setSelectedPinReset(req);
                              setPinResetNote("Identity verified by SuperAdmin. Reset authorized.");
                              setShowPinResetApproveModal(true);
                            }}
                            title="Verify and grant PIN reset permission"
                          >
                            <BsCheckLg className="me-1" size={14} /> Approve Reset
                          </button>
                          <button 
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => {
                              setSelectedPinReset(req);
                              setPinResetNote("Identity verification failed.");
                              setShowPinResetRejectModal(true);
                            }}
                            title="Reject request"
                          >
                            <BsXLg size={13} />
                          </button>
                        </div>
                      ) : req.status === "approved" ? (
                        <span className="badge bg-success-subtle text-success small">
                          Authorized • Waiting for User
                        </span>
                      ) : req.status === "resolved" ? (
                        <span className="badge bg-primary-subtle text-primary small">
                          Resolved & Closed
                        </span>
                      ) : (
                        <span className="badge bg-danger-subtle text-danger small">
                          Rejected
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

      {/* ================= APPROVE PIN RESET MODAL ================= */}
      {showPinResetApproveModal && selectedPinReset && (
        <div className="admin-modal-backdrop" onClick={() => setShowPinResetApproveModal(false)}>
          <div className="admin-modal-box shadow-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header-row">
              <h5>✅ Approve 4-Digit Security PIN Reset</h5>
              <button className="close-btn" onClick={() => setShowPinResetApproveModal(false)}><BsX size={26} /></button>
            </div>

            <div className="modal-body-content">
              <div className="p-3 mb-3 rounded bg-success-subtle border border-success-subtle">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <img 
                    src={selectedPinReset.avatar} 
                    alt="" 
                    style={{ width: 40, height: 40, borderRadius: "50%" }}
                    onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedPinReset.user_name || "User")}&background=1877f2&color=fff`; }}
                  />
                  <div>
                    <strong className="d-block text-success-emphasis">{selectedPinReset.user_name}</strong>
                    <span className="small text-muted">{selectedPinReset.user_email} • UID #{selectedPinReset.user_id}</span>
                  </div>
                </div>
                <div className="small text-muted mt-1">
                  <strong>User Reason:</strong> {selectedPinReset.reason}
                </div>
              </div>

              <p className="small text-muted mb-2">
                By approving, you authorize this user to create a new 4-Digit Security PIN on their Payment Vault.
              </p>

              <label className="form-label small fw-bold">Admin Verification Note (Optional)</label>
              <input 
                type="text"
                className="form-control admin-input mb-3"
                value={pinResetNote}
                onChange={(e) => setPinResetNote(e.target.value)}
                placeholder="E.g., Identity verified via registered contact"
              />
            </div>

            <div className="modal-footer-row">
              <button type="button" className="btn btn-secondary" onClick={() => setShowPinResetApproveModal(false)}>Cancel</button>
              <button 
                type="button" 
                className="btn btn-success fw-bold"
                onClick={handleApprovePinReset}
              >
                <BsCheckLg className="me-1" /> Authorize PIN Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= REJECT PIN RESET MODAL ================= */}
      {showPinResetRejectModal && selectedPinReset && (
        <div className="admin-modal-backdrop" onClick={() => setShowPinResetRejectModal(false)}>
          <div className="admin-modal-box shadow-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header-row">
              <h5>🚫 Reject 4-Digit Security PIN Reset</h5>
              <button className="close-btn" onClick={() => setShowPinResetRejectModal(false)}><BsX size={26} /></button>
            </div>

            <div className="modal-body-content">
              <p className="text-muted small">
                Are you sure you want to reject the PIN reset request for <strong>{selectedPinReset.user_name}</strong>?
              </p>

              <label className="form-label small fw-bold">Reason for Rejection (Visible to User)</label>
              <textarea 
                className="form-control admin-input mb-3"
                rows={3}
                value={pinResetNote}
                onChange={(e) => setPinResetNote(e.target.value)}
                placeholder="E.g. Unable to verify user identity. Please contact official support."
                required
              />
            </div>

            <div className="modal-footer-row">
              <button type="button" className="btn btn-secondary" onClick={() => setShowPinResetRejectModal(false)}>Cancel</button>
              <button 
                type="button" 
                className="btn btn-danger fw-bold"
                onClick={handleRejectPinReset}
              >
                <BsXLg className="me-1" /> Reject Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
