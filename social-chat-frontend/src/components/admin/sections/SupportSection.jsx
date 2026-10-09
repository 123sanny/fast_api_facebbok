import React from "react";
import { BsX } from "react-icons/bs";

export default function SupportSection({
  supportTicketsList = [],
  bugReportsList = [],
  supportSubTab,
  setSupportSubTab,
  // Reply modal states & handlers
  activeTicketForReply,
  setActiveTicketForReply,
  replyMessage,
  setReplyMessage,
  ticketNewStatus,
  setTicketNewStatus,
  handleReplyTicketSubmit
}) {
  return (
    <div className="admin-support-view">
      <div className="admin-view-header">
        <div>
          <h3 className="view-main-title">Customer Support & Bug Diagnostics</h3>
          <p className="view-sub-title">Answer user inquiries, manage creator issues, and review crash telemetry.</p>
        </div>

        <div className="filter-pill-group">
          <button 
            className={`filter-pill-btn ${supportSubTab === "tickets" ? "active" : ""}`}
            onClick={() => setSupportSubTab("tickets")}
          >
            🎫 Support Tickets ({supportTicketsList.length})
          </button>
          <button 
            className={`filter-pill-btn ${supportSubTab === "bugs" ? "active" : ""}`}
            onClick={() => setSupportSubTab("bugs")}
          >
            🐛 Bug Tracker ({bugReportsList.length})
          </button>
        </div>
      </div>

      {supportSubTab === "tickets" ? (
        <div className="admin-surface-card shadow-sm p-0 overflow-hidden">
          <div className="table-responsive">
            <table className="table admin-data-table mb-0 align-middle">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Subject / Issue</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {supportTicketsList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-4 text-muted">
                      No support tickets found.
                    </td>
                  </tr>
                ) : (
                  supportTicketsList.map(ticket => (
                    <tr key={ticket.id}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <img 
                            src={ticket.user_avatar} 
                            alt="" 
                            className="admin-table-avatar" 
                            style={{ width: 32, height: 32 }}
                            onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(ticket.user_name || "User")}&background=1877f2&color=fff`; }}
                          />
                          <div>
                            <strong>{ticket.user_name}</strong>
                            <div className="text-muted small">{ticket.user_email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div>
                          <strong>{ticket.subject}</strong>
                          <p className="text-muted small mb-0 text-truncate" style={{ maxWidth: 320 }}>{ticket.description}</p>
                        </div>
                      </td>
                      <td><span className="badge bg-secondary-subtle text-light">{ticket.category}</span></td>
                      <td>
                        <span className={`badge ${ticket.priority === "urgent" ? "bg-danger" : ticket.priority === "high" ? "bg-warning text-dark" : "bg-info text-dark"}`}>
                          {ticket.priority ? ticket.priority.toUpperCase() : "NORMAL"}
                        </span>
                      </td>
                      <td>
                        <span className={`admin-status-chip ${ticket.status === "resolved" ? "chip-active" : "chip-banned"}`}>
                          {ticket.status ? ticket.status.toUpperCase() : "OPEN"}
                        </span>
                      </td>
                      <td className="text-end">
                        <button 
                          className="btn btn-sm btn-primary fw-bold"
                          onClick={() => { setActiveTicketForReply(ticket); setTicketNewStatus("resolved"); }}
                        >
                          💬 Reply & Resolve
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {bugReportsList.length === 0 ? (
            <div className="admin-surface-card text-center py-5 text-muted col-12">
              No diagnostic bug reports found.
            </div>
          ) : (
            bugReportsList.map(bug => (
              <div key={bug.id} className="col-md-6">
                <div className="admin-surface-card shadow-sm">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <span className="badge bg-danger-subtle text-danger fw-bold">🐛 {bug.id}</span>
                    <span className="badge bg-secondary-subtle text-secondary">{bug.date}</span>
                  </div>
                  <h6 className="fw-bold">{bug.title}</h6>
                  <p className="small text-muted mb-2"><strong>Steps to Reproduce:</strong> {bug.steps}</p>
                  <div className="d-flex justify-content-between align-items-center pt-2 border-top border-secondary-subtle small text-muted">
                    <span>App Version: {bug.app_version}</span>
                    <span>OS: {bug.os_info}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ================= REPLY SUPPORT TICKET MODAL ================= */}
      {activeTicketForReply && (
        <div className="admin-modal-backdrop" onClick={() => setActiveTicketForReply(null)}>
          <div className="admin-modal-box shadow-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header-row">
              <h5>💬 Dispatch Reply: {activeTicketForReply.ticket_number}</h5>
              <button className="close-btn" onClick={() => setActiveTicketForReply(null)}><BsX size={26} /></button>
            </div>

            <form onSubmit={handleReplyTicketSubmit}>
              <div className="modal-body-content">
                <div className="p-2 mb-3 rounded bg-secondary-subtle small">
                  <strong>User Inquiry:</strong> {activeTicketForReply.description}
                </div>

                <label className="form-label small fw-bold">Official Support Response</label>
                <textarea 
                  className="form-control admin-input mb-3"
                  rows={4}
                  placeholder="Type official response to user..."
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  required
                />

                <label className="form-label small fw-bold">Update Ticket Status</label>
                <select 
                  className="form-select admin-input mb-2"
                  value={ticketNewStatus}
                  onChange={(e) => setTicketNewStatus(e.target.value)}
                >
                  <option value="resolved">🟢 Resolved</option>
                  <option value="in_progress">🟡 In Progress</option>
                  <option value="closed">⚪ Closed</option>
                </select>
              </div>

              <div className="modal-footer-row">
                <button type="button" className="btn btn-secondary" onClick={() => setActiveTicketForReply(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary fw-bold">
                  ✉️ Send Response
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
