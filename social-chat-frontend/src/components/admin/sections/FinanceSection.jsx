import React from "react";
import { BsCheckLg, BsXLg } from "react-icons/bs";

export default function FinanceSection({
  financeData = { summary: {}, payouts: [], transactions: [] },
  handleProcessPayout
}) {
  const payouts = financeData.payouts || [];
  const transactions = financeData.transactions || [];

  return (
    <div className="admin-finance-view">
      <div className="admin-view-header">
        <div>
          <h3 className="view-main-title">Stars Economy & Creator Finance</h3>
          <p className="view-sub-title">Direct oversight of Star tipping transactions, creator cashout requests, and platform revenue share.</p>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div className="admin-surface-card shadow-sm">
            <span className="text-muted small">Total Stars Circulated</span>
            <h2 className="text-warning fw-bold my-2">{financeData.summary?.totalStarsCirculated?.toLocaleString() || 0} ⭐</h2>
            <span className="text-success small">Platform Reserve: ₹{financeData.summary?.platformCommissionINR || 0} (10%)</span>
          </div>
        </div>

        <div className="col-md-4">
          <div className="admin-surface-card shadow-sm">
            <span className="text-muted small">Pending Creator Cashouts</span>
            <h2 className="text-primary fw-bold my-2">₹{financeData.summary?.pendingPayoutsAmount?.toLocaleString() || 0}</h2>
            <span className="text-muted small">{financeData.summary?.pendingPayoutsCount || payouts.filter(p => p.status === "pending").length} requests awaiting approval</span>
          </div>
        </div>

        <div className="col-md-4">
          <div className="admin-surface-card shadow-sm">
            <span className="text-muted small">Estimated Gross Star Volume</span>
            <h2 className="text-success fw-bold my-2">₹{financeData.summary?.estimatedINRVolume?.toLocaleString() || 0}</h2>
            <span className="text-muted small">Conversion Rate: 1 Star = ₹0.50</span>
          </div>
        </div>
      </div>

      {/* Creator Payout Requests Table */}
      <div className="admin-surface-card shadow-sm mb-4">
        <div className="card-header-flex mb-3">
          <h5 className="card-heading-title">💸 Creator Withdrawal Requests</h5>
          <span className="badge bg-primary-subtle text-primary">Live Queue</span>
        </div>

        <div className="table-responsive">
          <table className="table admin-data-table mb-0 align-middle">
            <thead>
              <tr>
                <th>Creator</th>
                <th>Stars Amount</th>
                <th>Cash Value (INR)</th>
                <th>Payout Method</th>
                <th>Status</th>
                <th className="text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              {payouts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-muted">
                    No withdrawal requests in queue.
                  </td>
                </tr>
              ) : (
                payouts.map(payout => (
                  <tr key={payout.id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <img 
                          src={payout.creator_avatar} 
                          alt="" 
                          className="admin-table-avatar" 
                          style={{ width: 32, height: 32 }}
                          onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(payout.creator_name || "User")}&background=1877f2&color=fff`; }}
                        />
                        <strong>{payout.creator_name}</strong>
                      </div>
                    </td>
                    <td><span className="text-warning fw-bold">{payout.stars_amount} ⭐</span></td>
                    <td><strong>₹{payout.fiat_value}</strong></td>
                    <td>
                      <div className="small">
                        <div>{payout.payout_method}</div>
                        <span className="text-muted">{payout.account_info}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`admin-status-chip ${payout.status === "approved" ? "chip-active" : payout.status === "rejected" ? "chip-banned" : "bg-warning-subtle text-warning"}`}>
                        {payout.status ? payout.status.toUpperCase() : "PENDING"}
                      </span>
                    </td>
                    <td className="text-end">
                      {payout.status === "pending" ? (
                        <div className="d-flex justify-content-end gap-2">
                          <button 
                            className="btn btn-sm btn-success fw-bold"
                            onClick={() => handleProcessPayout(payout.id, "approve")}
                          >
                            <BsCheckLg className="me-1" /> Approve
                          </button>
                          <button 
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleProcessPayout(payout.id, "reject")}
                          >
                            <BsXLg className="me-1" /> Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-muted small">Processed</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Star Transactions Ledger */}
      <div className="admin-surface-card shadow-sm">
        <div className="card-header-flex mb-3">
          <h5 className="card-heading-title">📜 Recent Star Economy Transactions</h5>
          <span className="badge bg-secondary-subtle text-secondary">Audit Trail</span>
        </div>

        <div className="table-responsive">
          <table className="table admin-data-table mb-0 align-middle">
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Type</th>
                <th>Stars</th>
                <th>INR Value</th>
                <th>Sender</th>
                <th>Receiver</th>
                <th>Date & Time</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-muted">
                    No transactions recorded yet.
                  </td>
                </tr>
              ) : (
                transactions.map((tx, idx) => (
                  <tr key={idx}>
                    <td><code>#{tx.id}</code></td>
                    <td><span className="badge bg-secondary-subtle text-light">{tx.type}</span></td>
                    <td><strong className="text-warning">{tx.stars} ⭐</strong></td>
                    <td>₹{tx.fiat}</td>
                    <td>{tx.sender}</td>
                    <td>{tx.receiver}</td>
                    <td className="text-muted small">{tx.date}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
