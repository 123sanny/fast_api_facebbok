import React from "react";
import {
  BsCurrencyRupee, BsCashStack, BsStarFill, BsSendCheck,
  BsCopy, BsXLg, BsX, BsCheckCircleFill, BsArrowRepeat
} from "react-icons/bs";

export default function StarCashoutsSection({
  starCashoutsList = [],
  starCashoutFilter,
  setStarCashoutFilter,
  systemSettings = {},
  isLoading,
  loadStarCashouts,
  showToast,
  handleOpenPayoutModal,
  handleOpenRejectCashoutModal,
  handleProcessStarCashout,
  // Modals state
  showStarPayoutModal,
  setShowStarPayoutModal,
  showStarCashoutRejectModal,
  setShowStarCashoutRejectModal,
  selectedStarCashout,
  payoutRefInput,
  setPayoutRefInput,
  payoutNoteInput,
  setPayoutNoteInput,
  cashoutRejectReason,
  setCashoutRejectReason
}) {
  const filteredList = starCashoutsList.filter(item => {
    if (starCashoutFilter === "all") return true;
    return item.status === starCashoutFilter;
  });

  return (
    <div className="admin-star-cashouts-view">
      <div className="admin-view-header">
        <div>
          <h3 className="view-main-title">💸 Creator Star Withdrawals & Payout Management</h3>
          <p className="view-sub-title">Review creator requests to withdraw & convert Stars into real money (UPI / Bank Transfer). Verify user destination, enter UTR / Payment reference, and process instant payouts or refunds.</p>
        </div>

        <div className="d-flex align-items-center gap-2 flex-wrap">
          <div className="filter-pill-group">
            <button 
              className={`filter-pill-btn ${starCashoutFilter === "all" ? "active" : ""}`}
              onClick={() => setStarCashoutFilter("all")}
            >
              All Requests ({starCashoutsList.length})
            </button>
            <button 
              className={`filter-pill-btn ${starCashoutFilter === "pending" ? "active" : ""}`}
              onClick={() => setStarCashoutFilter("pending")}
            >
              🟡 Pending Payout ({starCashoutsList.filter(s => s.status === "pending").length})
            </button>
            <button 
              className={`filter-pill-btn ${starCashoutFilter === "paid" ? "active" : ""}`}
              onClick={() => setStarCashoutFilter("paid")}
            >
              🟢 Completed & Paid ({starCashoutsList.filter(s => s.status === "paid").length})
            </button>
            <button 
              className={`filter-pill-btn ${starCashoutFilter === "rejected" ? "active" : ""}`}
              onClick={() => setStarCashoutFilter("rejected")}
            >
              🔴 Rejected
            </button>
          </div>

          <button 
            className="btn btn-outline-secondary d-flex align-items-center gap-2"
            onClick={loadStarCashouts}
            title="Refresh cashouts list"
          >
            <BsArrowRepeat size={16} className={isLoading ? "spin-icon" : ""} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="admin-metric-card shadow-sm p-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted small">Pending Cashouts</span>
              <div className="metric-icon-bubble bg-warning-subtle text-warning">
                <BsCurrencyRupee size={18} />
              </div>
            </div>
            <h3 className="metric-value mb-0 text-warning">
              ₹{starCashoutsList.filter(s => s.status === "pending").reduce((acc, c) => acc + (c.inr_amount || 0), 0).toLocaleString()}
            </h3>
            <span className="small text-muted">
              {starCashoutsList.filter(s => s.status === "pending").reduce((acc, c) => acc + (c.stars_amount || 0), 0).toLocaleString()} Stars awaiting payout
            </span>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="admin-metric-card shadow-sm p-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted small">Total Disbursed (Paid)</span>
              <div className="metric-icon-bubble bg-success-subtle text-success">
                <BsCashStack size={18} />
              </div>
            </div>
            <h3 className="metric-value mb-0 text-success">
              ₹{starCashoutsList.filter(s => s.status === "paid").reduce((acc, c) => acc + (c.inr_amount || 0), 0).toLocaleString()}
            </h3>
            <span className="small text-muted">Transferred directly to user accounts</span>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="admin-metric-card shadow-sm p-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted small">Total Redeemed Stars</span>
              <div className="metric-icon-bubble bg-primary-subtle text-primary">
                <BsStarFill size={18} />
              </div>
            </div>
            <h3 className="metric-value mb-0 text-primary">
              {starCashoutsList.filter(s => s.status === "paid").reduce((acc, c) => acc + (c.stars_amount || 0), 0).toLocaleString()} ⭐
            </h3>
            <span className="small text-muted">Converted into real money</span>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="admin-metric-card shadow-sm p-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted small">Conversion Standard</span>
              <div className="metric-icon-bubble bg-info-subtle text-info">
                <BsSendCheck size={18} />
              </div>
            </div>
            <h3 className="metric-value mb-0 text-info">
              1 ⭐ = ₹{systemSettings.star_rate_inr || 0.50}
            </h3>
            <span className="small text-muted">Official redemption rate</span>
          </div>
        </div>
      </div>

      {/* Star Cashouts Table */}
      <div className="admin-surface-card shadow-sm p-0 overflow-hidden">
        <div className="table-responsive">
          <table className="table admin-data-table mb-0 align-middle">
            <thead>
              <tr>
                <th>User Account</th>
                <th>Stars Redeemed</th>
                <th>Rupee Amount (INR)</th>
                <th>Payout Method & Destination</th>
                <th>Request Date</th>
                <th>Status</th>
                <th className="text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-muted">
                    No star cashout requests found in this filter.
                  </td>
                </tr>
              ) : (
                filteredList.map((req) => (
                  <tr key={req.id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <img 
                          src={req.user_avatar} 
                          alt="" 
                          className="admin-table-avatar" 
                          style={{ width: 36, height: 36 }}
                          onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(req.user_name || "User")}&background=1877f2&color=fff`; }}
                        />
                        <div>
                          <strong className="d-block text-light">{req.user_name}</strong>
                          <span className="text-muted small">{req.user_email}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-warning-subtle text-warning fw-bold fs-6">
                        <BsStarFill className="me-1 text-warning" size={13} /> {req.stars_amount ? req.stars_amount.toLocaleString() : 0} ⭐
                      </span>
                    </td>
                    <td>
                      <div className="inr-highlight-tag">
                        ₹{req.inr_amount ? req.inr_amount.toLocaleString() : 0}
                      </div>
                      <small className="text-muted d-block">Rate: 1⭐ = ₹{req.conversion_rate}</small>
                    </td>
                    <td>
                      <div className="payout-details-card">
                        <div className="d-flex align-items-center justify-content-between mb-1">
                          <span className={`payout-mode-badge ${req.payout_method === "UPI" ? "payout-mode-upi" : "payout-mode-bank"}`}>
                            {req.payout_method === "UPI" ? "⚡ UPI Payout" : "🏦 Bank Transfer"}
                          </span>
                        </div>
                        {req.payout_method === "UPI" ? (
                          <div className="d-flex align-items-center">
                            <span className="font-monospace text-light fw-bold">{req.upi_id || req.phone_number || "—"}</span>
                            {req.upi_id && (
                              <button 
                                className="copy-chip-btn"
                                onClick={() => {
                                  navigator.clipboard.writeText(req.upi_id);
                                  showToast("📋 UPI ID copied to clipboard!");
                                }}
                                title="Copy UPI ID"
                              >
                                <BsCopy size={11} className="me-1" /> Copy
                              </button>
                            )}
                          </div>
                        ) : (
                          <div>
                            <div className="d-flex align-items-center">
                              <strong className="text-light">{req.bank_name || "Bank"}</strong>
                              <span className="text-muted ms-1">• A/C: {req.account_number}</span>
                              {req.account_number && (
                                <button 
                                  className="copy-chip-btn"
                                  onClick={() => {
                                    navigator.clipboard.writeText(req.account_number);
                                    showToast("📋 Account Number copied!");
                                  }}
                                  title="Copy Account Number"
                                >
                                  <BsCopy size={11} className="me-1" /> Copy
                                </button>
                              )}
                            </div>
                            <span className="text-muted small">IFSC: {req.ifsc_code} | {req.account_holder_name}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="text-light small">{req.created_at}</span>
                    </td>
                    <td>
                      <span className={`admin-status-chip ${
                        req.status === "paid" ? "chip-active" : 
                        req.status === "pending" ? "chip-pending" : "chip-banned"
                      }`}>
                        {req.status === "paid" ? "🟢 Paid & Completed" : 
                         req.status === "pending" ? "🟡 Pending Payout" : "🔴 Rejected"}
                      </span>
                    </td>
                    <td className="text-end">
                      {req.status === "pending" ? (
                        <div className="d-flex justify-content-end gap-2">
                          <button 
                            className="btn btn-sm btn-success fw-bold d-inline-flex align-items-center"
                            onClick={() => handleOpenPayoutModal(req)}
                            title="Transfer INR and mark Completed"
                          >
                            <BsSendCheck className="me-1" size={14} /> Pay & Complete
                          </button>
                          <button 
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleOpenRejectCashoutModal(req)}
                            title="Reject and refund stars"
                          >
                            <BsXLg size={13} />
                          </button>
                        </div>
                      ) : req.status === "paid" ? (
                        <div>
                          <span className="badge bg-success-subtle text-success small font-monospace d-block">
                            Ref: {req.admin_payout_ref || "Paid"}
                          </span>
                          <span className="text-muted very-small" style={{ fontSize: "11px" }}>{req.paid_at || "Completed"}</span>
                        </div>
                      ) : (
                        <span className="text-muted small">
                          {req.admin_note || "Request Rejected"}
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

      {/* ================= 💸 STAR CASHOUT / PAYOUT MODAL ================= */}
      {showStarPayoutModal && selectedStarCashout && (
        <div className="admin-modal-backdrop" onClick={() => setShowStarPayoutModal(false)}>
          <div className="admin-modal-box shadow-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header-row">
              <h5>💸 Send INR Payout & Complete Cashout</h5>
              <button className="close-btn" onClick={() => setShowStarPayoutModal(false)}><BsX size={26} /></button>
            </div>

            <div className="modal-body-content">
              {/* User Bar */}
              <div className="payout-user-preview-bar mb-3">
                <img 
                  src={selectedStarCashout.user_avatar} 
                  alt="" 
                  className="admin-table-avatar" 
                  style={{ width: 44, height: 44 }}
                  onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedStarCashout.user_name || "User")}&background=1877f2&color=fff`; }}
                />
                <div>
                  <strong>{selectedStarCashout.user_name}</strong>
                  <div className="text-muted small">{selectedStarCashout.user_email} • Wallet Balance: {selectedStarCashout.wallet_balance} ⭐</div>
                </div>
              </div>

              {/* Conversion Highlight Box */}
              <div className="payout-modal-summary mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-muted small">Stars to Redeem</span>
                  <span className="badge bg-warning-subtle text-warning fw-bold fs-6">
                    <BsStarFill className="me-1 text-warning" /> {selectedStarCashout.stars_amount ? selectedStarCashout.stars_amount.toLocaleString() : 0} ⭐
                  </span>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="fw-bold">Amount to Transfer</span>
                  <span className="fs-4 fw-bold text-success">
                    ₹{selectedStarCashout.inr_amount ? selectedStarCashout.inr_amount.toLocaleString() : 0}
                  </span>
                </div>
              </div>

              {/* Destination Details */}
              <div className="payout-details-card mb-3">
                <label className="form-label small fw-bold text-muted mb-1">
                  Recipient {selectedStarCashout.payout_method === "UPI" ? "⚡ UPI ID" : "🏦 Bank Account"} Details
                </label>
                {selectedStarCashout.payout_method === "UPI" ? (
                  <div className="d-flex align-items-center justify-content-between">
                    <span className="font-monospace text-light fw-bold fs-6">{selectedStarCashout.upi_id || selectedStarCashout.phone_number}</span>
                    {selectedStarCashout.upi_id && (
                      <button 
                        className="copy-chip-btn"
                        onClick={() => {
                          navigator.clipboard.writeText(selectedStarCashout.upi_id);
                          showToast("📋 UPI ID copied to clipboard!");
                        }}
                      >
                        <BsCopy size={12} className="me-1" /> Copy UPI
                      </button>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="d-flex align-items-center justify-content-between mb-1">
                      <div>
                        <strong className="text-light">{selectedStarCashout.bank_name || "Bank"}</strong>
                        <span className="text-muted ms-2">A/C: {selectedStarCashout.account_number}</span>
                      </div>
                      {selectedStarCashout.account_number && (
                        <button 
                          className="copy-chip-btn"
                          onClick={() => {
                            navigator.clipboard.writeText(selectedStarCashout.account_number);
                            showToast("📋 Account Number copied!");
                          }}
                        >
                          <BsCopy size={12} className="me-1" /> Copy A/C
                        </button>
                      )}
                    </div>
                    <div className="small text-muted">
                      IFSC: <strong className="text-light font-monospace">{selectedStarCashout.ifsc_code}</strong> | Holder: {selectedStarCashout.account_holder_name}
                    </div>
                  </div>
                )}
              </div>

              {/* Admin Bank UTR Ref */}
              <label className="form-label small fw-bold">Bank / UPI Transaction Reference (UTR / Tx ID) *</label>
              <input 
                type="text"
                className="form-control admin-input mb-3 font-monospace"
                placeholder="E.g., UTR98214810294 or RZP_PAY_88129"
                value={payoutRefInput}
                onChange={(e) => setPayoutRefInput(e.target.value)}
                required
              />

              <label className="form-label small fw-bold">Admin Transfer Note (Optional)</label>
              <input 
                type="text"
                className="form-control admin-input mb-2"
                placeholder="E.g., Disbursed via Admin HDFC Current A/C"
                value={payoutNoteInput}
                onChange={(e) => setPayoutNoteInput(e.target.value)}
              />
            </div>

            <div className="modal-footer-row">
              <button className="btn btn-secondary" onClick={() => setShowStarPayoutModal(false)}>Cancel</button>
              <button 
                className="btn btn-success fw-bold d-inline-flex align-items-center"
                onClick={() => handleProcessStarCashout(selectedStarCashout.id, "approve")}
              >
                <BsCheckCircleFill className="me-2" /> Confirm Payment & Complete Cashout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= 🚫 REJECT STAR CASHOUT MODAL ================= */}
      {showStarCashoutRejectModal && selectedStarCashout && (
        <div className="admin-modal-backdrop" onClick={() => setShowStarCashoutRejectModal(false)}>
          <div className="admin-modal-box shadow-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header-row">
              <h5>🚫 Reject Star Cashout Request</h5>
              <button className="close-btn" onClick={() => setShowStarCashoutRejectModal(false)}><BsX size={26} /></button>
            </div>

            <div className="modal-body-content">
              <p>
                Are you sure you want to reject the cashout request of <strong>{selectedStarCashout.user_name}</strong> for <strong>{selectedStarCashout.stars_amount} Stars (₹{selectedStarCashout.inr_amount})</strong>?
              </p>
              <div className="p-2 mb-3 rounded bg-warning-subtle text-warning small">
                ⚠️ Rejecting will automatically cancel the payout and <strong>refund the {selectedStarCashout.stars_amount} Stars</strong> back into the user's active wallet balance.
              </div>

              <label className="form-label small fw-bold">Reason for Rejection *</label>
              <textarea 
                className="form-control admin-input"
                rows={3}
                placeholder="E.g., Invalid UPI ID, Bank account closed, IFSC code mismatch..."
                value={cashoutRejectReason}
                onChange={(e) => setCashoutRejectReason(e.target.value)}
                required
              />
            </div>

            <div className="modal-footer-row">
              <button className="btn btn-secondary" onClick={() => setShowStarCashoutRejectModal(false)}>Cancel</button>
              <button 
                className="btn btn-danger fw-bold"
                onClick={() => handleProcessStarCashout(selectedStarCashout.id, "reject")}
              >
                🚫 Reject & Refund Stars
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
