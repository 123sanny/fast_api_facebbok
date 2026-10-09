import React from "react";
import {
  BsSearch, BsX, BsPatchCheckFill, BsCopy, BsGeoAltFill, BsEyeFill, BsBan
} from "react-icons/bs";

export default function SecuritySection({
  securitySubTab,
  setSecuritySubTab,
  // Audit logs
  auditLogsList = [],
  auditLogSearch,
  setAuditLogSearch,
  auditLogFilter,
  setAuditLogFilter,
  // Login logs
  adminLoginLogs = [],
  // User geo-logins
  userGeoLoginsList = [],
  userGeoLoginSearch,
  setUserGeoLoginSearch,
  userGeoLoginFilter,
  setUserGeoLoginFilter,
  handleInspectUserTelemetry,
  showToast,
  // Suspicious radar
  suspiciousActivityList = [],
  handleToggleUserStatus,
  // Firewall / blocked IPs
  blockedIpsList = [],
  showBlockIpModal,
  setShowBlockIpModal,
  blockIpForm,
  setBlockIpForm,
  handleBlockIp,
  handleUnblockIp
}) {
  const filteredUserGeoLogins = userGeoLoginsList.filter(log => {
    if (userGeoLoginFilter === "active" && log.status !== "active") return false;
    if (!userGeoLoginSearch) return true;
    const q = userGeoLoginSearch.toLowerCase();
    return (
      (log.user_name && log.user_name.toLowerCase().includes(q)) ||
      (log.user_email && log.user_email.toLowerCase().includes(q)) ||
      (log.ip_address && log.ip_address.toLowerCase().includes(q)) ||
      (log.location && log.location.toLowerCase().includes(q))
    );
  });

  const filteredAuditLogs = auditLogsList.filter(log => {
    if (auditLogFilter !== "all" && log.target_type !== auditLogFilter && log.action !== auditLogFilter) return false;
    if (!auditLogSearch) return true;
    const q = auditLogSearch.toLowerCase();
    return (
      (log.admin_name && log.admin_name.toLowerCase().includes(q)) ||
      (log.action && log.action.toLowerCase().includes(q)) ||
      (log.details && log.details.toLowerCase().includes(q)) ||
      (log.ip_address && log.ip_address.toLowerCase().includes(q))
    );
  });

  return (
    <div className="admin-security-view">
      <div className="admin-view-header">
        <div>
          <h3 className="view-main-title">🛡️ Security Telemetry & Immutable Logs</h3>
          <p className="view-sub-title">Administrative action audit trail, login attempts, suspicious bots, and firewall IP blocking.</p>
        </div>
      </div>

      {/* High-Tech Sub-Tab Pill Bar */}
      <div className="admin-surface-card p-2 mb-4 shadow-sm">
        <div className="filter-pill-group">
          <button className={`filter-pill-btn ${securitySubTab === "audit" ? "active" : ""}`} onClick={() => setSecuritySubTab("audit")}>
            <span>📜 Audit Trail</span>
            <span className="badge bg-dark ms-1">{auditLogsList.length}</span>
          </button>
          <button className={`filter-pill-btn ${securitySubTab === "login_logs" ? "active" : ""}`} onClick={() => setSecuritySubTab("login_logs")}>
            <span>🔑 Admin Logins</span>
            <span className="badge bg-dark ms-1">{adminLoginLogs.length}</span>
          </button>
          <button className={`filter-pill-btn ${securitySubTab === "user_geologins" ? "active" : ""}`} onClick={() => setSecuritySubTab("user_geologins")}>
            <span>📍 User Geo-Logins</span>
            <span className="badge bg-primary ms-1">{userGeoLoginsList.length}</span>
          </button>
          <button className={`filter-pill-btn ${securitySubTab === "suspicious" ? "active" : ""}`} onClick={() => setSecuritySubTab("suspicious")}>
            <span>🤖 Suspicious Radar</span>
            <span className="badge bg-danger ms-1">{suspiciousActivityList.length}</span>
          </button>
          <button className={`filter-pill-btn ${securitySubTab === "blocked_ips" ? "active" : ""}`} onClick={() => setSecuritySubTab("blocked_ips")}>
            <span>🚫 IP Firewall</span>
            <span className="badge bg-danger ms-1">{blockedIpsList.length}</span>
          </button>
        </div>
      </div>

      {/* SUBTAB 1: AUDIT TRAIL */}
      {securitySubTab === "audit" && (
        <div>
          <div className="admin-surface-card mb-3 p-3 shadow-sm d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div className="admin-search-input-box flex-grow-1" style={{ maxWidth: 380 }}>
              <BsSearch size={14} />
              <input 
                type="text" 
                placeholder="Search audit actions, admins, IPs..." 
                value={auditLogSearch} 
                onChange={(e) => setAuditLogSearch(e.target.value)} 
              />
              {auditLogSearch && <button className="clear-btn" onClick={() => setAuditLogSearch("")}><BsX size={16} /></button>}
            </div>

            <div className="filter-pill-group">
              <button className={`filter-pill-btn ${auditLogFilter === "all" ? "active" : ""}`} onClick={() => setAuditLogFilter("all")}>All Actions</button>
              <button className={`filter-pill-btn ${auditLogFilter === "user" ? "active" : ""}`} onClick={() => setAuditLogFilter("user")}>👤 Users</button>
              <button className={`filter-pill-btn ${auditLogFilter === "system" ? "active" : ""}`} onClick={() => setAuditLogFilter("system")}>⚙️ System</button>
              <button className={`filter-pill-btn ${auditLogFilter === "firewall_ip" ? "active" : ""}`} onClick={() => setAuditLogFilter("firewall_ip")}>🛡️ Firewall</button>
            </div>
          </div>

          <div className="admin-surface-card shadow-sm p-0 overflow-hidden">
            <div className="table-responsive">
              <table className="table admin-data-table mb-0 align-middle">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Admin Staff</th>
                    <th>Action Executed</th>
                    <th>Target</th>
                    <th>Details & Notes</th>
                    <th>IP Address</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAuditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-4 text-muted">No audit logs found.</td>
                    </tr>
                  ) : (
                    filteredAuditLogs.map((log) => (
                      <tr key={log.id}>
                        <td><code>#{log.id}</code></td>
                        <td><strong className="text-light">{log.admin_name}</strong></td>
                        <td><span className="badge bg-primary-subtle text-primary">{log.action}</span></td>
                        <td><span className="badge bg-secondary-subtle text-light">{log.target_type} #{log.target_id}</span></td>
                        <td className="small text-light" style={{ maxWidth: 320 }}>{log.details}</td>
                        <td><code className="text-info">{log.ip_address}</code></td>
                        <td className="text-muted small">{log.created_at}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: LOGIN HISTORY */}
      {securitySubTab === "login_logs" && (
        <div className="admin-surface-card shadow-sm p-0 overflow-hidden">
          <div className="table-responsive">
            <table className="table admin-data-table mb-0 align-middle">
              <thead>
                <tr>
                  <th>Account Email</th>
                  <th>IP Address</th>
                  <th>Device & Browser</th>
                  <th>Location</th>
                  <th>2FA Status</th>
                  <th>Status</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {adminLoginLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-4 text-muted">No login records found.</td>
                  </tr>
                ) : (
                  adminLoginLogs.map((log) => (
                    <tr key={log.id}>
                      <td><strong>{log.email}</strong></td>
                      <td><code className="text-info">{log.ip_address}</code></td>
                      <td className="small">{log.device_info}</td>
                      <td className="small text-muted">{log.location}</td>
                      <td>
                        {log.two_factor_verified ? (
                          <span className="badge bg-success-subtle text-success">Verified</span>
                        ) : (
                          <span className="badge bg-secondary-subtle text-muted">Bypassed</span>
                        )}
                      </td>
                      <td>
                        <span className={`admin-status-chip ${log.status === "success" ? "chip-active" : "chip-banned"}`}>
                          {log.status?.toUpperCase()}
                        </span>
                      </td>
                      <td className="text-muted small">{log.created_at}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB: USER GEO-LOGINS */}
      {securitySubTab === "user_geologins" && (
        <div>
          <div className="admin-surface-card mb-3 p-3 shadow-sm d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div className="admin-search-input-box flex-grow-1" style={{ maxWidth: 380 }}>
              <BsSearch size={14} />
              <input 
                type="text" 
                placeholder="Search user name, email, IP, city..." 
                value={userGeoLoginSearch} 
                onChange={(e) => setUserGeoLoginSearch(e.target.value)} 
              />
              {userGeoLoginSearch && <button className="clear-btn" onClick={() => setUserGeoLoginSearch("")}><BsX size={16} /></button>}
            </div>

            <div className="filter-pill-group">
              <button className={`filter-pill-btn ${userGeoLoginFilter === "all" ? "active" : ""}`} onClick={() => setUserGeoLoginFilter("all")}>All Logins</button>
              <button className={`filter-pill-btn ${userGeoLoginFilter === "active" ? "active" : ""}`} onClick={() => setUserGeoLoginFilter("active")}>🟢 Active Sessions</button>
            </div>
          </div>

          <div className="admin-surface-card shadow-sm p-0 overflow-hidden">
            <div className="table-responsive">
              <table className="table admin-data-table mb-0 align-middle">
                <thead>
                  <tr>
                    <th>User Profile</th>
                    <th>IP Address</th>
                    <th>Login Location</th>
                    <th>Device & Browser</th>
                    <th>Session Status</th>
                    <th>Login Timestamp</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUserGeoLogins.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-4 text-muted">No user geo-login logs found.</td>
                    </tr>
                  ) : (
                    filteredUserGeoLogins.map((log) => (
                      <tr key={log.id}>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <img 
                              src={log.user_avatar} 
                              alt="" 
                              style={{ width: 34, height: 34, borderRadius: "50%", objectFit: "cover" }} 
                              onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(log.user_name || "User")}&background=1877f2&color=fff`; }}
                            />
                            <div>
                              <div className="d-flex align-items-center gap-1">
                                <strong className="text-light">{log.user_name}</strong>
                                {log.is_verified && <BsPatchCheckFill className="text-primary" size={13} />}
                              </div>
                              <span className="text-muted small">#{log.user_id} • {log.user_email}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-1">
                            <code className="text-info font-monospace">{log.ip_address}</code>
                            <button 
                              className="copy-chip-btn py-0 px-1"
                              onClick={() => {
                                navigator.clipboard.writeText(log.ip_address);
                                showToast("📋 IP copied!");
                              }}
                              title="Copy IP Address"
                            >
                              <BsCopy size={10} />
                            </button>
                          </div>
                        </td>
                        <td>
                          <span className="badge bg-dark border border-secondary text-warning d-inline-flex align-items-center gap-1">
                            <BsGeoAltFill size={11} className="text-danger" />
                            {log.location}
                          </span>
                        </td>
                        <td className="small">
                          <div className="text-light">{log.device}</div>
                          <span className="text-muted">{log.browser}</span>
                        </td>
                        <td>
                          <span className={`admin-status-chip ${log.status === "active" ? "chip-active" : "chip-banned"}`}>
                            {log.status?.toUpperCase()}
                          </span>
                        </td>
                        <td className="text-muted small">{log.created_at}</td>
                        <td className="text-end">
                          <div className="d-flex justify-content-end gap-1">
                            <button 
                              className="btn btn-sm btn-outline-info p-1 px-2"
                              onClick={() => handleInspectUserTelemetry({ id: log.user_id, name: log.user_name, email: log.user_email, avatar: log.user_avatar, is_verified: log.is_verified, is_active: true })}
                              title="Inspect User Profile & Telemetry"
                            >
                              <BsEyeFill size={13} />
                            </button>
                            <button 
                              className="btn btn-sm btn-outline-danger p-1 px-2"
                              onClick={() => {
                                setBlockIpForm({ ip_address: log.ip_address, reason: `Suspicious login activity on UID #${log.user_id}` });
                                setShowBlockIpModal(true);
                              }}
                              title="Block / Blacklist this IP"
                            >
                              <BsBan size={13} />
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
        </div>
      )}

      {/* SUBTAB 3: SUSPICIOUS ACTIVITY & BOTS */}
      {securitySubTab === "suspicious" && (
        <div className="admin-surface-card shadow-sm p-0 overflow-hidden">
          <div className="table-responsive">
            <table className="table admin-data-table mb-0 align-middle">
              <thead>
                <tr>
                  <th>Flagged User / Account</th>
                  <th>Failed Attempts</th>
                  <th>Threat Level</th>
                  <th>Detected Reason</th>
                  <th>Last Activity</th>
                  <th className="text-end">1-Click Action</th>
                </tr>
              </thead>
              <tbody>
                {suspiciousActivityList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-4 text-muted">No suspicious anomalies detected on platform.</td>
                  </tr>
                ) : (
                  suspiciousActivityList.map((item, idx) => (
                    <tr key={idx}>
                      <td>
                        <strong>{item.name}</strong>
                        <div className="text-muted small">{item.email}</div>
                      </td>
                      <td><strong className="text-danger">{item.failed_attempts} attempts</strong></td>
                      <td>
                        <span className={`badge ${item.threat_level === "High" ? "bg-danger text-white" : "bg-warning text-dark"}`}>
                          {item.threat_level} Threat
                        </span>
                      </td>
                      <td className="small text-light">{item.reason}</td>
                      <td className="text-muted small">{item.last_active}</td>
                      <td className="text-end">
                        <button 
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleToggleUserStatus({ id: item.user_id, name: item.name }, false)}
                        >
                          🚫 Ban Account
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

      {/* SUBTAB 4: FIREWALL IP BLACKLIST */}
      {securitySubTab === "blocked_ips" && (
        <div>
          <div className="d-flex justify-content-end mb-3">
            <button className="btn btn-danger d-flex align-items-center gap-2 fw-bold" onClick={() => setShowBlockIpModal(true)}>
              <BsBan size={14} /> Blacklist IP Address
            </button>
          </div>

          <div className="admin-surface-card shadow-sm p-0 overflow-hidden">
            <div className="table-responsive">
              <table className="table admin-data-table mb-0 align-middle">
                <thead>
                  <tr>
                    <th>Blacklisted IP</th>
                    <th>Reason / Threat Note</th>
                    <th>Blocked By</th>
                    <th>Blocked Date</th>
                    <th>Firewall Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {blockedIpsList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-4 text-muted">No IP addresses currently blocked in firewall.</td>
                    </tr>
                  ) : (
                    blockedIpsList.map((ip) => (
                      <tr key={ip.id}>
                        <td><code className="text-danger fs-6 fw-bold">{ip.ip_address}</code></td>
                        <td className="small text-light">{ip.reason}</td>
                        <td><span className="badge bg-secondary-subtle text-light">{ip.blocked_by}</span></td>
                        <td className="text-muted small">{ip.blocked_at}</td>
                        <td><span className="admin-status-chip chip-banned">BLOCKED</span></td>
                        <td className="text-end">
                          <button className="btn btn-sm btn-outline-success fw-bold" onClick={() => handleUnblockIp(ip.id)}>
                            🟢 Lift IP Block
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

      {/* ================= 🚫 BLACKLIST IP MODAL ================= */}
      {showBlockIpModal && (
        <div className="admin-modal-backdrop" onClick={() => setShowBlockIpModal(false)}>
          <div className="admin-modal-box shadow-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header-row">
              <h5>🚫 Blacklist Firewall IP Address</h5>
              <button className="close-btn" onClick={() => setShowBlockIpModal(false)}><BsX size={26} /></button>
            </div>

            <form onSubmit={handleBlockIp}>
              <div className="modal-body-content">
                <div className="mb-3">
                  <label className="form-label small fw-bold">IP Address (IPv4 or IPv6)</label>
                  <input 
                    type="text"
                    className="form-control admin-input font-monospace"
                    placeholder="e.g., 185.220.101.5"
                    value={blockIpForm.ip_address}
                    onChange={(e) => setBlockIpForm({ ...blockIpForm, ip_address: e.target.value })}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-bold">Blacklist Reason / Threat Description</label>
                  <textarea 
                    className="form-control admin-input"
                    rows={3}
                    placeholder="e.g., Automated brute-force credential stuffing and scrapers..."
                    value={blockIpForm.reason}
                    onChange={(e) => setBlockIpForm({ ...blockIpForm, reason: e.target.value })}
                    required
                  />
                </div>

                <div className="alert alert-danger py-2 px-3 small mb-0">
                  ⚠️ Requests from this IP address will be instantly rejected by the API Gateway with HTTP 403 Forbidden.
                </div>
              </div>

              <div className="modal-footer-row">
                <button type="button" className="btn btn-secondary" onClick={() => setShowBlockIpModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-danger fw-bold">
                  <BsBan className="me-1" /> Blacklist IP Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
