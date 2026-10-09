import React from "react";
import { BsX } from "react-icons/bs";

export default function ReportedChatsSection({
  reportedChatsList = [],
  reportedChatFilter,
  setReportedChatFilter,
  // Modal state & handlers
  showReportActionModal,
  setShowReportActionModal,
  selectedReportForAction,
  setSelectedReportForAction,
  reportActionType,
  setReportActionType,
  reportActionNote,
  setReportActionNote,
  handleActionReportedChat
}) {
  const filteredList = reportedChatsList.filter(item => {
    if (reportedChatFilter === "all") return true;
    return item.status === reportedChatFilter;
  });

  return (
    <div className="admin-reports-view">
      <div className="admin-view-header">
        <div>
          <h3 className="view-main-title">💬 Reported Chats & Message Moderation</h3>
          <p className="view-sub-title">Privacy-preserving inspection. Only user-reported messages and conversations are audited.</p>
        </div>

        <div className="admin-filter-bar">
          <button 
            className={`filter-pill ${reportedChatFilter === "all" ? "active" : ""}`}
            onClick={() => setReportedChatFilter("all")}
          >
            All ({reportedChatsList.length})
          </button>
          <button 
            className={`filter-pill ${reportedChatFilter === "pending" ? "active" : ""}`}
            onClick={() => setReportedChatFilter("pending")}
          >
            ⚠️ Pending ({reportedChatsList.filter(r => r.status === "pending").length})
          </button>
          <button 
            className={`filter-pill ${reportedChatFilter === "action_taken" ? "active" : ""}`}
            onClick={() => setReportedChatFilter("action_taken")}
          >
            ✅ Action Taken ({reportedChatsList.filter(r => r.status === "action_taken").length})
          </button>
          <button 
            className={`filter-pill ${reportedChatFilter === "dismissed" ? "active" : ""}`}
            onClick={() => setReportedChatFilter("dismissed")}
          >
            ❌ Dismissed ({reportedChatsList.filter(r => r.status === "dismissed").length})
          </button>
        </div>
      </div>

      <div className="admin-surface-card shadow-sm p-0 overflow-hidden">
        <div className="table-responsive">
          <table className="table admin-data-table mb-0 align-middle">
            <thead>
              <tr>
                <th>Report ID</th>
                <th>Reporter</th>
                <th>Reported User (Offender)</th>
                <th>Reported Message & Content</th>
                <th>Reason / Violation</th>
                <th>Reported At</th>
                <th>Status</th>
                <th className="text-end">Moderation Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-4 text-muted">
                    🎉 No reported chats in queue. Chat feeds are safe and clean!
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => (
                  <tr key={item.report_id}>
                    <td><code>#REP-{item.report_id}</code></td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <img 
                          src={item.reporter?.avatar || "https://i.pravatar.cc/100"} 
                          alt="" 
                          className="admin-table-avatar" 
                          style={{ width: 32, height: 32 }}
                          onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.reporter?.name || "User")}&background=1877f2&color=fff`; }}
                        />
                        <div>
                          <strong className="text-light small">{item.reporter?.name}</strong>
                          <div className="text-muted" style={{ fontSize: "11px" }}>UID #{item.reporter?.id}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <img 
                          src={item.offender?.avatar || "https://i.pravatar.cc/100"} 
                          alt="" 
                          className="admin-table-avatar" 
                          style={{ width: 32, height: 32 }}
                          onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.offender?.name || "User")}&background=1877f2&color=fff`; }}
                        />
                        <div>
                          <strong className="text-light small">{item.offender?.name}</strong>
                          {item.offender?.is_chat_restricted && (
                            <span className="badge bg-danger-subtle text-danger ms-1" style={{ fontSize: "10px" }}>Chat Restricted</span>
                          )}
                          <div className="text-muted" style={{ fontSize: "11px" }}>{item.offender?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ maxWidth: 280 }}>
                      <div className="p-2 rounded bg-dark border border-secondary-subtle small">
                        <div className="text-light font-monospace" style={{ fontSize: "12px" }}>
                          "{item.message_content}"
                        </div>
                        {item.attachment_url && (
                          <a href={item.attachment_url} target="_blank" rel="noreferrer" className="badge bg-info-subtle text-info mt-1 d-inline-block text-decoration-none">
                            📎 View Attached Media
                          </a>
                        )}
                        <div className="text-muted mt-1" style={{ fontSize: "10px" }}>Sent: {item.message_sent_at}</div>
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-danger-subtle text-danger">{item.reason}</span>
                      {item.details && <div className="text-muted small mt-1" style={{ fontSize: "11px" }}>{item.details}</div>}
                    </td>
                    <td className="text-muted small">{item.created_at}</td>
                    <td>
                      <span className={`admin-status-chip ${item.status === "action_taken" ? "chip-active" : item.status === "dismissed" ? "chip-banned" : "bg-warning-subtle text-warning"}`}>
                        {item.status?.toUpperCase()}
                      </span>
                    </td>
                    <td className="text-end">
                      <button 
                        className="btn btn-sm btn-outline-warning fw-bold"
                        onClick={() => {
                          setSelectedReportForAction(item);
                          setReportActionType("restrict_chat_24h");
                          setShowReportActionModal(true);
                        }}
                      >
                        🛡️ Moderate Chat
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= 💬 MODERATE REPORTED CHAT MODAL ================= */}
      {showReportActionModal && selectedReportForAction && (
        <div className="admin-modal-backdrop" onClick={() => setShowReportActionModal(false)}>
          <div className="admin-modal-box shadow-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header-row">
              <h5>🛡️ Moderate Reported Chat & User</h5>
              <button className="close-btn" onClick={() => setShowReportActionModal(false)}><BsX size={26} /></button>
            </div>

            <div className="modal-body-content">
              {/* Offender Preview */}
              <div className="p-3 mb-3 rounded bg-danger-subtle border border-danger-subtle d-flex align-items-center gap-3">
                <img 
                  src={selectedReportForAction.offender?.avatar || "https://i.pravatar.cc/100"} 
                  alt="" 
                  style={{ width: 44, height: 44, borderRadius: "50%" }}
                  onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedReportForAction.offender?.name || "User")}&background=1877f2&color=fff`; }}
                />
                <div>
                  <strong className="text-danger-emphasis d-block">{selectedReportForAction.offender?.name}</strong>
                  <span className="small text-muted">{selectedReportForAction.offender?.email}</span>
                </div>
              </div>

              {/* Reported Message */}
              <div className="p-3 mb-3 rounded bg-dark border border-secondary">
                <label className="form-label small fw-bold text-muted mb-1">Reported Message Excerpt</label>
                <div className="text-light font-monospace small">"{selectedReportForAction.message_content}"</div>
                {selectedReportForAction.details && (
                  <div className="text-warning small mt-2"><strong>Reporter Note:</strong> {selectedReportForAction.details}</div>
                )}
              </div>

              {/* Action Radios */}
              <label className="form-label small fw-bold">Select Moderation Action</label>
              <div className="d-flex flex-column gap-2 mb-3">
                <label className="p-2 rounded bg-dark border border-secondary d-flex align-items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="chatAction" 
                    value="restrict_chat_24h"
                    checked={reportActionType === "restrict_chat_24h"}
                    onChange={(e) => setReportActionType(e.target.value)}
                  />
                  <span>🚫 <strong>Restrict from Chat for 24 Hours</strong> (Temporary Mute)</span>
                </label>

                <label className="p-2 rounded bg-dark border border-secondary d-flex align-items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="chatAction" 
                    value="restrict_chat_permanent"
                    checked={reportActionType === "restrict_chat_permanent"}
                    onChange={(e) => setReportActionType(e.target.value)}
                  />
                  <span>🛑 <strong>Permanently Block User from Chat</strong></span>
                </label>

                <label className="p-2 rounded bg-dark border border-secondary d-flex align-items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="chatAction" 
                    value="delete_message"
                    checked={reportActionType === "delete_message"}
                    onChange={(e) => setReportActionType(e.target.value)}
                  />
                  <span>🗑️ <strong>Delete / Purge Abusive Message</strong></span>
                </label>

                <label className="p-2 rounded bg-dark border border-secondary d-flex align-items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="chatAction" 
                    value="unrestrict_chat"
                    checked={reportActionType === "unrestrict_chat"}
                    onChange={(e) => setReportActionType(e.target.value)}
                  />
                  <span>🟢 <strong>Lift / Restore Chat Privileges</strong></span>
                </label>

                <label className="p-2 rounded bg-dark border border-secondary d-flex align-items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="chatAction" 
                    value="dismiss"
                    checked={reportActionType === "dismiss"}
                    onChange={(e) => setReportActionType(e.target.value)}
                  />
                  <span>❌ <strong>Dismiss Report</strong> (False Alarm)</span>
                </label>
              </div>

              <label className="form-label small fw-bold">Admin Audit Note (Optional)</label>
              <input 
                type="text" 
                className="form-control admin-input"
                placeholder="Reason for moderation action..."
                value={reportActionNote}
                onChange={(e) => setReportActionNote(e.target.value)}
              />
            </div>

            <div className="modal-footer-row">
              <button type="button" className="btn btn-secondary" onClick={() => setShowReportActionModal(false)}>Cancel</button>
              <button 
                type="button" 
                className="btn btn-primary fw-bold"
                onClick={() => handleActionReportedChat(selectedReportForAction.report_id, reportActionType)}
              >
                Execute Action Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
