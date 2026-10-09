import React from "react";
import {
  BsPlusLg, BsTrash3Fill, BsX
} from "react-icons/bs";

export default function TeamSection({
  teamMembersList = [],
  showCreateTeamMemberModal,
  setShowCreateTeamMemberModal,
  teamMemberForm,
  setTeamMemberForm,
  handleCreateTeamMember,
  handleDeleteTeamMember
}) {
  return (
    <div className="admin-roles-view">
      <div className="admin-view-header">
        <div>
          <h3 className="view-main-title">👥 Admin Roles & Access Control (RBAC)</h3>
          <p className="view-sub-title">Configure SuperAdmin, Moderator, and Support roles with granular operational permissions.</p>
        </div>

        <button className="btn btn-primary d-flex align-items-center gap-2 fw-bold shadow-sm" onClick={() => setShowCreateTeamMemberModal(true)}>
          <BsPlusLg size={14} /> Add Staff Account
        </button>
      </div>

      <div className="admin-surface-card shadow-sm p-0 overflow-hidden">
        <div className="table-responsive">
          <table className="table admin-data-table mb-0 align-middle">
            <thead>
              <tr>
                <th>Staff Member</th>
                <th>Role</th>
                <th>Assigned Permissions</th>
                <th>2FA Security</th>
                <th>Last Active</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {teamMembersList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-muted">No staff accounts registered.</td>
                </tr>
              ) : (
                teamMembersList.map((member) => (
                  <tr key={member.id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <img 
                          src={member.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"} 
                          alt="" 
                          className="admin-table-avatar" 
                          style={{ width: 36, height: 36 }} 
                          onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name || "Admin")}&background=1877f2&color=fff`; }}
                        />
                        <div>
                          <strong className="text-light d-block">{member.name}</strong>
                          <small className="text-muted">@{member.username} • {member.email}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${member.role === "super_admin" ? "bg-danger-subtle text-danger" : member.role === "moderator" ? "bg-info-subtle text-info" : "bg-teal-subtle text-teal"}`}>
                        {member.role ? member.role.replace(/_/g, " ").toUpperCase() : "STAFF"}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex flex-wrap gap-1" style={{ maxWidth: 300 }}>
                        {(member.permissions || []).map((perm, idx) => (
                          <span key={idx} className="badge bg-secondary-subtle text-light" style={{ fontSize: "10px" }}>
                            {perm.replace(/_/g, " ")}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      {member.two_factor_auth ? (
                        <span className="badge bg-success-subtle text-success">🔒 2FA Enforced</span>
                      ) : (
                        <span className="badge bg-warning-subtle text-warning">Disabled</span>
                      )}
                    </td>
                    <td className="text-muted small">{member.last_login || "Active"}</td>
                    <td className="text-end">
                      {member.role !== "super_admin" && (
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteTeamMember(member.id)} title="Delete Staff Account">
                          <BsTrash3Fill size={13} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= 👥 ADD ADMIN / STAFF MODAL ================= */}
      {showCreateTeamMemberModal && (
        <div className="admin-modal-backdrop" onClick={() => setShowCreateTeamMemberModal(false)}>
          <div className="admin-modal-box shadow-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header-row">
              <h5>👥 Add Admin / Staff Account</h5>
              <button className="close-btn" onClick={() => setShowCreateTeamMemberModal(false)}><BsX size={26} /></button>
            </div>

            <form onSubmit={handleCreateTeamMember}>
              <div className="modal-body-content">
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-bold">Full Name</label>
                    <input 
                      type="text"
                      className="form-control admin-input"
                      placeholder="e.g., Vikram Sharma"
                      value={teamMemberForm.name}
                      onChange={(e) => setTeamMemberForm({ ...teamMemberForm, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-bold">Username</label>
                    <input 
                      type="text"
                      className="form-control admin-input"
                      placeholder="e.g., vikram_mod"
                      value={teamMemberForm.username}
                      onChange={(e) => setTeamMemberForm({ ...teamMemberForm, username: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-bold">Email Address</label>
                    <input 
                      type="email"
                      className="form-control admin-input"
                      placeholder="staff@nexoria.com"
                      value={teamMemberForm.email}
                      onChange={(e) => setTeamMemberForm({ ...teamMemberForm, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-bold">Staff Password</label>
                    <input 
                      type="password"
                      className="form-control admin-input"
                      placeholder="Minimum 8 characters"
                      value={teamMemberForm.password}
                      onChange={(e) => setTeamMemberForm({ ...teamMemberForm, password: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-bold">Role Assignment</label>
                  <select 
                    className="form-select admin-select"
                    value={teamMemberForm.role}
                    onChange={(e) => setTeamMemberForm({ ...teamMemberForm, role: e.target.value })}
                  >
                    <option value="moderator">🛡️ Content Moderator (Moderate posts, reels & chats)</option>
                    <option value="support">🎫 Support Specialist (Answer tickets & help requests)</option>
                    <option value="finance_manager">💳 Finance Manager (Review star payouts & cashouts)</option>
                    <option value="super_admin">👑 Super Admin (Full Platform Control)</option>
                  </select>
                </div>

                <label className="form-label small fw-bold">Operational Permissions</label>
                <div className="row g-2">
                  {[
                    { key: "moderate_content", label: "Moderate Content & Chats" },
                    { key: "manage_users", label: "Manage & Suspend Users" },
                    { key: "manage_finance", label: "Approve Payouts & Stars" },
                    { key: "manage_ads", label: "Manage Ads Campaigns" },
                    { key: "view_audit_logs", label: "View Audit & Security Logs" },
                    { key: "system_settings", label: "Edit System Settings" }
                  ].map((p) => (
                    <div className="col-6" key={p.key}>
                      <label className="d-flex align-items-center gap-2 p-2 rounded bg-dark border border-secondary small cursor-pointer">
                        <input 
                          type="checkbox"
                          checked={teamMemberForm.permissions.includes(p.key)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setTeamMemberForm({ ...teamMemberForm, permissions: [...teamMemberForm.permissions, p.key] });
                            } else {
                              setTeamMemberForm({ ...teamMemberForm, permissions: teamMemberForm.permissions.filter(k => k !== p.key) });
                            }
                          }}
                        />
                        <span>{p.label}</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="modal-footer-row">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateTeamMemberModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary fw-bold">
                  💾 Create Staff Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
