import React from "react";
import {
  BsReceipt, BsCheckLg, BsXLg, BsX, BsArrowRepeat
} from "react-icons/bs";

export default function StarPurchasesSection({
  starPurchasesList = [],
  starPurchaseFilter,
  setStarPurchaseFilter,
  isLoading,
  loadStarPurchases,
  handleVerifyGrantStars,
  // Modal states
  showStarVerifyModal,
  setShowStarVerifyModal,
  selectedStarPurchase,
  setSelectedStarPurchase,
  starVerifyNote,
  setStarVerifyNote
}) {
  const filteredList = starPurchasesList.filter(item => {
    if (starPurchaseFilter === "all") return true;
    return item.status === starPurchaseFilter;
  });

  return (
    <div className="admin-star-purchases-view">
      <div className="admin-view-header">
        <div>
          <h3 className="view-main-title">⭐ Star Purchases & Verification Queue</h3>
          <p className="view-sub-title">Review user payment transactions, verify UTR reference numbers and screenshot receipts, and credit Stars to user wallets.</p>
        </div>

        <div className="d-flex align-items-center gap-2 flex-wrap">
          <div className="filter-pill-group">
            <button 
              className={`filter-pill-btn ${starPurchaseFilter === "all" ? "active" : ""}`}
              onClick={() => setStarPurchaseFilter("all")}
            >
              All Purchases ({starPurchasesList.length})
            </button>
            <button 
              className={`filter-pill-btn ${starPurchaseFilter === "pending" ? "active" : ""}`}
              onClick={() => setStarPurchaseFilter("pending")}
            >
              🟡 Pending Verification ({starPurchasesList.filter(s => s.status === "pending").length})
            </button>
            <button 
              className={`filter-pill-btn ${starPurchaseFilter === "approved" ? "active" : ""}`}
              onClick={() => setStarPurchaseFilter("approved")}
            >
              🟢 Approved & Credited
            </button>
            <button 
              className={`filter-pill-btn ${starPurchaseFilter === "rejected" ? "active" : ""}`}
              onClick={() => setStarPurchaseFilter("rejected")}
            >
              🔴 Rejected
            </button>
          </div>

          <button 
            className="btn btn-outline-secondary d-flex align-items-center gap-2"
            onClick={loadStarPurchases}
            title="Refresh purchases list"
          >
            <BsArrowRepeat size={16} className={isLoading ? "spin-icon" : ""} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Star Purchases Queue Table */}
      <div className="admin-surface-card shadow-sm p-0 overflow-hidden">
        <div className="table-responsive">
          <table className="table admin-data-table mb-0 align-middle">
            <thead>
              <tr>
                <th>User Profile</th>
                <th>Star Package</th>
                <th>Amount Paid</th>
                <th>Payment Mode & UTR / Ref</th>
                <th>Receipt Proof</th>
                <th>Status</th>
                <th className="text-end">Verification Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-muted">
                    No star purchase requests found in this filter.
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
                          style={{ width: 34, height: 34 }} 
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
                        ⭐ {req.stars_amount} Stars
                      </span>
                    </td>
                    <td>
                      <strong className="text-success fs-6">₹{req.amount_paid}</strong>
                    </td>
                    <td>
                      <div>
                        <strong>{req.payment_method}</strong>
                        <div className="small text-muted font-monospace">{req.transaction_ref}</div>
                      </div>
                    </td>
                    <td>
                      {req.receipt_url ? (
                        <a 
                          href={req.receipt_url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="btn btn-sm btn-outline-info p-1 px-2"
                        >
                          <BsReceipt className="me-1" /> View Receipt
                        </a>
                      ) : (
                        <span className="text-muted small">No screenshot</span>
                      )}
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
                            className="btn btn-sm btn-success fw-bold"
                            onClick={() => {
                              setSelectedStarPurchase(req);
                              setShowStarVerifyModal(true);
                            }}
                          >
                            <BsCheckLg className="me-1" /> Verify & Grant Stars
                          </button>
                          <button 
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleVerifyGrantStars(req.id, "reject")}
                          >
                            <BsXLg className="me-1" /> Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-muted small">
                          {req.admin_note || (req.status === "approved" ? "Stars Credited" : "Rejected")}
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

      {/* ================= ⭐ STAR PURCHASE VERIFY MODAL ================= */}
      {showStarVerifyModal && selectedStarPurchase && (
        <div className="admin-modal-backdrop" onClick={() => setShowStarVerifyModal(false)}>
          <div className="admin-modal-box shadow-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header-row">
              <h5>⭐ Verify Star Transaction & Credit</h5>
              <button className="close-btn" onClick={() => setShowStarVerifyModal(false)}><BsX size={26} /></button>
            </div>

            <div className="modal-body-content">
              <div className="d-flex align-items-center gap-3 mb-3 p-2 rounded bg-secondary-subtle">
                <img 
                  src={selectedStarPurchase.user_avatar} 
                  alt="" 
                  className="admin-table-avatar" 
                  style={{ width: 44, height: 44 }}
                  onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedStarPurchase.user_name || "User")}&background=1877f2&color=fff`; }}
                />
                <div>
                  <strong>{selectedStarPurchase.user_name}</strong>
                  <div className="text-muted small">{selectedStarPurchase.user_email}</div>
                </div>
              </div>

              <div className="user-detail-grid mb-3">
                <div className="detail-item">
                  <span className="text-muted small">Stars To Credit</span>
                  <strong className="text-warning fs-5">⭐ {selectedStarPurchase.stars_amount}</strong>
                </div>
                <div className="detail-item">
                  <span className="text-muted small">Amount Paid</span>
                  <strong className="text-success fs-5">₹{selectedStarPurchase.amount_paid}</strong>
                </div>
                <div className="detail-item">
                  <span className="text-muted small">Payment Mode</span>
                  <strong>{selectedStarPurchase.payment_method}</strong>
                </div>
                <div className="detail-item">
                  <span className="text-muted small">Transaction / UTR ID</span>
                  <strong className="font-monospace small">{selectedStarPurchase.transaction_ref}</strong>
                </div>
              </div>

              {selectedStarPurchase.receipt_url && (
                <div className="mb-3">
                  <label className="form-label small fw-bold">Payment Screenshot / Receipt</label>
                  <div className="rounded overflow-hidden border border-secondary-subtle" style={{ maxHeight: 200 }}>
                    <img src={selectedStarPurchase.receipt_url} alt="Receipt" style={{ width: "100%", objectFit: "cover" }} />
                  </div>
                </div>
              )}

              <label className="form-label small fw-bold">Admin Verification Note (Optional)</label>
              <input 
                type="text"
                className="form-control admin-input mb-3"
                placeholder="E.g., Verified in bank statement / Razorpay"
                value={starVerifyNote}
                onChange={(e) => setStarVerifyNote(e.target.value)}
              />
            </div>

            <div className="modal-footer-row">
              <button className="btn btn-secondary" onClick={() => setShowStarVerifyModal(false)}>Cancel</button>
              <button 
                className="btn btn-danger"
                onClick={() => handleVerifyGrantStars(selectedStarPurchase.id, "reject")}
              >
                Reject Request
              </button>
              <button 
                className="btn btn-success fw-bold"
                onClick={() => handleVerifyGrantStars(selectedStarPurchase.id, "approve")}
              >
                ✨ Verify & Credit Stars Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
