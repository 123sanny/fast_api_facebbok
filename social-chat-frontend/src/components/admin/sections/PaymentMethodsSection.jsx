import React from "react";
import {
  BsCreditCard2FrontFill, BsCreditCard, BsQrCodeScan, BsBank,
  BsSearch, BsX, BsArrowRepeat, BsEyeFill, BsTrash3Fill
} from "react-icons/bs";

export default function PaymentMethodsSection({
  paymentMethodsList = [],
  paymentMethodsSummary = {},
  paymentMethodSearch,
  setPaymentMethodSearch,
  paymentMethodFilter,
  setPaymentMethodFilter,
  isLoading,
  loadPaymentMethods,
  showToast,
  // Modals state & handlers
  showPaymentMethodModal,
  setShowPaymentMethodModal,
  selectedPaymentMethodForModal,
  setSelectedPaymentMethodForModal,
  showDeletePaymentMethodModal,
  setShowDeletePaymentMethodModal,
  methodToDelete,
  setMethodToDelete,
  handleDeletePaymentMethod
}) {
  return (
    <div className="admin-payment-methods-view">
      <div className="admin-view-header">
        <div>
          <h3 className="view-main-title">💳 User Payment Methods & Vault Audit</h3>
          <p className="view-sub-title">
            Real-time monitoring of all linked Credit/Debit Cards, UPI IDs, Bank Accounts & Wallets saved in Nexoria Pay Vault.
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button 
            className="btn btn-sm btn-outline-info d-flex align-items-center gap-1"
            onClick={() => {
              loadPaymentMethods();
              showToast("🔄 Payment methods refreshed!");
            }}
          >
            <BsArrowRepeat size={14} className={isLoading ? "spin-icon" : ""} /> Refresh Vault
          </button>
        </div>
      </div>

      {/* Quick Telemetry KPI Cards */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="admin-metric-card p-3 shadow-sm">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="metric-label text-muted small">Total Linked</span>
              <div className="metric-icon-box bg-primary-subtle text-primary" style={{ width: 34, height: 34 }}>
                <BsCreditCard2FrontFill size={16} />
              </div>
            </div>
            <h3 className="metric-val text-light mb-0">{paymentMethodsSummary.total || paymentMethodsList.length}</h3>
            <small className="text-secondary" style={{ fontSize: "11px" }}>Across all users</small>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="admin-metric-card p-3 shadow-sm">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="metric-label text-muted small">Cards (Visa/MC)</span>
              <div className="metric-icon-box bg-info-subtle text-info" style={{ width: 34, height: 34 }}>
                <BsCreditCard size={16} />
              </div>
            </div>
            <h3 className="metric-val text-info mb-0">{paymentMethodsSummary.cards || 0}</h3>
            <small className="text-secondary" style={{ fontSize: "11px" }}>Credit & Debit Cards</small>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="admin-metric-card p-3 shadow-sm">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="metric-label text-muted small">UPI Handles</span>
              <div className="metric-icon-box bg-warning-subtle text-warning" style={{ width: 34, height: 34 }}>
                <BsQrCodeScan size={16} />
              </div>
            </div>
            <h3 className="metric-val text-warning mb-0">{paymentMethodsSummary.upi || 0}</h3>
            <small className="text-secondary" style={{ fontSize: "11px" }}>Google Pay / PhonePe / BHIM</small>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="admin-metric-card p-3 shadow-sm">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="metric-label text-muted small">Bank Accounts</span>
              <div className="metric-icon-box bg-success-subtle text-success" style={{ width: 34, height: 34 }}>
                <BsBank size={16} />
              </div>
            </div>
            <h3 className="metric-val text-success mb-0">{paymentMethodsSummary.bank || 0}</h3>
            <small className="text-secondary" style={{ fontSize: "11px" }}>Direct Payout Accounts</small>
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="admin-surface-card mb-3 p-3 shadow-sm d-flex flex-wrap align-items-center justify-content-between gap-3">
        <div className="admin-search-input-box flex-grow-1" style={{ maxWidth: 380 }}>
          <BsSearch size={14} />
          <input 
            type="text"
            placeholder="Search by user, email, UPI ID, last 4, bank..."
            value={paymentMethodSearch}
            onChange={(e) => setPaymentMethodSearch(e.target.value)}
          />
          {paymentMethodSearch && (
            <button className="clear-btn" onClick={() => setPaymentMethodSearch("")}>
              <BsX size={16} />
            </button>
          )}
        </div>

        <div className="filter-pill-group">
          <button 
            className={`filter-pill-btn ${paymentMethodFilter === "all" ? "active" : ""}`}
            onClick={() => setPaymentMethodFilter("all")}
          >
            All Methods
          </button>
          <button 
            className={`filter-pill-btn ${paymentMethodFilter === "card" ? "active" : ""}`}
            onClick={() => setPaymentMethodFilter("card")}
          >
            💳 Cards
          </button>
          <button 
            className={`filter-pill-btn ${paymentMethodFilter === "upi" ? "active" : ""}`}
            onClick={() => setPaymentMethodFilter("upi")}
          >
            ⚡ UPI Handles
          </button>
          <button 
            className={`filter-pill-btn ${paymentMethodFilter === "bank" ? "active" : ""}`}
            onClick={() => setPaymentMethodFilter("bank")}
          >
            🏦 Bank Accounts
          </button>
          <button 
            className={`filter-pill-btn ${paymentMethodFilter === "paypal" ? "active" : ""}`}
            onClick={() => setPaymentMethodFilter("paypal")}
          >
            🅿️ PayPal
          </button>
        </div>
      </div>

      {/* Payment Methods Table */}
      <div className="admin-surface-card shadow-sm p-0 overflow-hidden">
        <div className="table-responsive">
          <table className="table admin-data-table mb-0 align-middle">
            <thead>
              <tr>
                <th>User Account</th>
                <th>Payment Mode</th>
                <th>Masked Credentials & Details</th>
                <th>Billing / Holder Name</th>
                <th>Vault Status</th>
                <th>Linked Time</th>
                <th className="text-end">Admin Actions</th>
              </tr>
            </thead>
            <tbody>
              {paymentMethodsList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-5 text-muted">
                    <BsCreditCard2FrontFill size={36} className="text-secondary mb-2 d-block mx-auto opacity-50" />
                    No payment methods found matching this criteria.
                  </td>
                </tr>
              ) : (
                paymentMethodsList.map((method) => (
                  <tr key={method.id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <img 
                          src={method.user_avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"} 
                          alt="" 
                          className="admin-table-avatar" 
                          style={{ width: 36, height: 36 }}
                          onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(method.user_name || "User")}&background=1877f2&color=fff`; }}
                        />
                        <div>
                          <strong className="d-block text-light">{method.user_name}</strong>
                          <span className="text-muted small">UID #{method.user_id} • {method.user_email}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`payout-mode-badge ${method.type === 'upi' ? 'payout-mode-upi' : method.type === 'bank' ? 'payout-mode-bank' : 'bg-primary-subtle text-primary border border-primary-subtle'}`}>
                        {method.type === "card" ? "💳 Card" : method.type === "upi" ? "⚡ UPI" : method.type === "bank" ? "🏦 Bank" : "🅿️ PayPal"}
                      </span>
                    </td>
                    <td>
                      <div>
                        <strong className="d-block text-light">{method.display_title}</strong>
                        <span className="text-muted small">{method.display_sub}</span>
                      </div>
                    </td>
                    <td>
                      <span className="small text-light font-monospace">
                        {method.billing_name || "—"}
                      </span>
                    </td>
                    <td>
                      {method.is_default ? (
                        <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1 rounded-pill small">
                          ⭐ Primary Default
                        </span>
                      ) : (
                        <span className="badge bg-secondary-subtle text-secondary px-2 py-1 rounded-pill small">
                          Secondary
                        </span>
                      )}
                    </td>
                    <td>
                      <span className="text-muted small">{method.created_at}</span>
                    </td>
                    <td className="text-end">
                      <div className="d-flex justify-content-end gap-2">
                        <button 
                          className="btn btn-sm btn-outline-info"
                          onClick={() => {
                            setSelectedPaymentMethodForModal(method);
                            setShowPaymentMethodModal(true);
                          }}
                          title="View Full Payment Security Details"
                        >
                          <BsEyeFill size={13} className="me-1" /> Inspect
                        </button>
                        <button 
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => {
                            setMethodToDelete(method);
                            setShowDeletePaymentMethodModal(true);
                          }}
                          title="Revoke and remove from user vault"
                        >
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

      {/* ================= PAYMENT METHOD INSPECT MODAL ================= */}
      {showPaymentMethodModal && selectedPaymentMethodForModal && (
        <div className="admin-modal-backdrop" onClick={() => setShowPaymentMethodModal(false)}>
          <div className="admin-modal-box shadow-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header-row">
              <h5>💳 Payment Vault Security Audit</h5>
              <button className="close-btn" onClick={() => setShowPaymentMethodModal(false)}><BsX size={26} /></button>
            </div>

            <div className="modal-body-content">
              {/* User Bar */}
              <div className="p-3 mb-3 rounded bg-primary-subtle border border-primary-subtle d-flex align-items-center gap-3">
                <img 
                  src={selectedPaymentMethodForModal.user_avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"} 
                  alt="" 
                  style={{ width: 44, height: 44, borderRadius: "50%" }}
                  onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedPaymentMethodForModal.user_name || "User")}&background=1877f2&color=fff`; }}
                />
                <div>
                  <strong className="d-block text-light">{selectedPaymentMethodForModal.user_name}</strong>
                  <span className="small text-muted">{selectedPaymentMethodForModal.user_email} • UID #{selectedPaymentMethodForModal.user_id}</span>
                </div>
              </div>

              {/* Method Card */}
              <div className="p-3 mb-3 rounded bg-dark border border-secondary text-start">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="badge bg-primary text-uppercase px-2 py-1">
                    {selectedPaymentMethodForModal.type} Gateway
                  </span>
                  {selectedPaymentMethodForModal.is_default && (
                    <span className="badge bg-success-subtle text-success">⭐ Primary Default</span>
                  )}
                </div>

                <h5 className="text-light mb-1">{selectedPaymentMethodForModal.display_title}</h5>
                <p className="text-muted small mb-3">{selectedPaymentMethodForModal.display_sub}</p>

                <div className="row g-2 small">
                  <div className="col-6">
                    <span className="text-muted d-block">Billing / Holder Name:</span>
                    <strong className="text-light">{selectedPaymentMethodForModal.billing_name || selectedPaymentMethodForModal.user_name}</strong>
                  </div>
                  <div className="col-6">
                    <span className="text-muted d-block">Linked Date:</span>
                    <strong className="text-light">{selectedPaymentMethodForModal.created_at}</strong>
                  </div>
                  {selectedPaymentMethodForModal.card_brand && (
                    <div className="col-6">
                      <span className="text-muted d-block">Card Brand:</span>
                      <strong className="text-info">{selectedPaymentMethodForModal.card_brand}</strong>
                    </div>
                  )}
                  {selectedPaymentMethodForModal.provider && (
                    <div className="col-6">
                      <span className="text-muted d-block">Gateway Provider:</span>
                      <strong className="text-info">{selectedPaymentMethodForModal.provider}</strong>
                    </div>
                  )}
                </div>
              </div>

              <div className="alert alert-info py-2 px-3 small mb-0">
                🔒 <strong>Zero-Trust PCI Security:</strong> Card numbers and sensitive tokens are tokenized and masked under 256-Bit AES encryption.
              </div>
            </div>

            <div className="modal-footer-row">
              <button type="button" className="btn btn-secondary" onClick={() => setShowPaymentMethodModal(false)}>Close</button>
              <button 
                type="button" 
                className="btn btn-outline-danger"
                onClick={() => {
                  setShowPaymentMethodModal(false);
                  setMethodToDelete(selectedPaymentMethodForModal);
                  setShowDeletePaymentMethodModal(true);
                }}
              >
                <BsTrash3Fill className="me-1" /> Revoke Method
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= REVOKE / DELETE PAYMENT METHOD MODAL ================= */}
      {showDeletePaymentMethodModal && methodToDelete && (
        <div className="admin-modal-backdrop" onClick={() => setShowDeletePaymentMethodModal(false)}>
          <div className="admin-modal-box shadow-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header-row">
              <h5>🗑️ Revoke Payment Method</h5>
              <button className="close-btn" onClick={() => setShowDeletePaymentMethodModal(false)}><BsX size={26} /></button>
            </div>

            <div className="modal-body-content">
              <p className="small text-muted mb-3">
                Are you sure you want to revoke and delete this payment method for <strong>{methodToDelete.user_name}</strong>?
              </p>

              <div className="p-3 mb-3 rounded bg-danger-subtle border border-danger-subtle">
                <strong className="d-block text-danger-emphasis">{methodToDelete.display_title}</strong>
                <span className="small text-muted">{methodToDelete.display_sub}</span>
              </div>

              <div className="alert alert-warning py-2 px-3 small mb-0">
                ⚠️ Once revoked, this payment method will be removed from the user's checkout options immediately.
              </div>
            </div>

            <div className="modal-footer-row">
              <button type="button" className="btn btn-secondary" onClick={() => setShowDeletePaymentMethodModal(false)}>Cancel</button>
              <button 
                type="button" 
                className="btn btn-danger fw-bold"
                onClick={handleDeletePaymentMethod}
              >
                <BsTrash3Fill className="me-1" /> Confirm Revocation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
