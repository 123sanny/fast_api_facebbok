import React from "react";
import {
  BsPeopleFill, BsPersonCheckFill, BsPatchCheckFill, BsPersonXFill,
  BsDownload, BsArrowRepeat, BsSearch, BsX, BsListUl, BsGridFill,
  BsEnvelopeFill, BsTelephoneFill, BsLockFill, BsChatDotsFill,
  BsEyeFill, BsKeyFill, BsStarFill, BsBan, BsCheckLg, BsTrash3Fill,
  BsCopy, BsGeoAltFill, BsShieldCheck,
  BsChevronLeft, BsChevronRight, BsChevronDoubleLeft, BsChevronDoubleRight
} from "react-icons/bs";

export default function UsersSection({
  usersList = [],
  userSummary = {},
  userSearch,
  setUserSearch,
  userFilter,
  setUserFilter,
  userViewMode,
  setUserViewMode,
  userPage,
  userPageSize,
  userTotalCount,
  userTotalPages,
  handleUserPageChange,
  handleUserPageSizeChange,
  isLoading,
  loadUsers,
  handleExportCsv,
  showToast,
  handleToggleVerification,
  handleInspectUserTelemetry,
  handleToggleUserStatus,
  handleDeleteUser,
  // Modals state & handlers
  showUserDetailModal,
  setShowUserDetailModal,
  selectedUserForModal,
  setSelectedUserForModal,
  selectedUserTelemetry,
  isLoadingTelemetry,
  showResetPassModal,
  setShowResetPassModal,
  newResetPassword,
  setNewResetPassword,
  handleResetPassword,
  showAdjustStarsModal,
  setShowAdjustStarsModal,
  adjustStarsAmount,
  setAdjustStarsAmount,
  adjustStarsNote,
  setAdjustStarsNote,
  handleAdjustStars,
  showBanModal,
  setShowBanModal,
  banDuration,
  setBanDuration,
  banReason,
  setBanReason
}) {
  return (
    <div className="admin-users-view">
      {/* Header Title & Quick Export */}
      <div className="admin-view-header">
        <div>
          <h3 className="view-main-title">👥 User Directory & Clearance Management</h3>
          <p className="view-sub-title">Complete oversight of platform accounts, verification badges, password overrides, stars balance & access moderation.</p>
        </div>

        <div className="d-flex align-items-center gap-2 flex-wrap">
          <button 
            className="btn btn-outline-info d-flex align-items-center gap-2"
            onClick={() => handleExportCsv("users")}
            title="Export full user database to CSV file"
          >
            <BsDownload size={15} />
            <span>Export Users CSV</span>
          </button>

          <button 
            className="btn btn-outline-secondary d-flex align-items-center gap-2"
            onClick={loadUsers}
            title="Refresh user list"
          >
            <BsArrowRepeat size={16} className={isLoading ? "spin-icon" : ""} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Top KPI Telemetry Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="admin-surface-card p-3 shadow-sm h-100 d-flex align-items-center gap-3">
            <div className="kpi-icon-box bg-primary-subtle text-primary">
              <BsPeopleFill size={22} />
            </div>
            <div>
              <span className="kpi-label d-block">Total Registered</span>
              <h4 className="kpi-val mb-0">{userSummary.total_users || usersList.length}</h4>
              <small className="text-muted">Total Accounts</small>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="admin-surface-card p-3 shadow-sm h-100 d-flex align-items-center gap-3">
            <div className="kpi-icon-box bg-success-subtle text-success">
              <BsPersonCheckFill size={22} />
            </div>
            <div>
              <span className="kpi-label d-block">Active Accounts</span>
              <h4 className="kpi-val mb-0 text-success">{userSummary.active_users || usersList.filter(u => u.is_active).length}</h4>
              <small className="text-success">In Good Standing</small>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="admin-surface-card p-3 shadow-sm h-100 d-flex align-items-center gap-3">
            <div className="kpi-icon-box bg-info-subtle text-info">
              <BsPatchCheckFill size={22} />
            </div>
            <div>
              <span className="kpi-label d-block">Blue Tick Verified</span>
              <h4 className="kpi-val mb-0 text-info">{userSummary.verified_users || usersList.filter(u => u.is_verified).length}</h4>
              <small className="text-info">Verified Creators</small>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="admin-surface-card p-3 shadow-sm h-100 d-flex align-items-center gap-3">
            <div className="kpi-icon-box bg-danger-subtle text-danger">
              <BsPersonXFill size={22} />
            </div>
            <div>
              <span className="kpi-label d-block">Suspended / Muted</span>
              <h4 className="kpi-val mb-0 text-danger">
                {(userSummary.suspended_users || usersList.filter(u => u.is_banned).length) + (userSummary.chat_restricted_users || 0)}
              </h4>
              <small className="text-danger">Moderated Accounts</small>
            </div>
          </div>
        </div>
      </div>

      {/* Search, Filter Tabs & View Mode Switcher Toolbar */}
      <div className="admin-surface-card mb-4 p-3 shadow-sm">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
          
          {/* Filter Pills with Live Badges */}
          <div className="filter-pill-group">
            <button 
              className={`filter-pill-btn ${userFilter === "all" ? "active" : ""}`}
              onClick={() => setUserFilter("all")}
            >
              All Users <span className="badge bg-secondary ms-1">{userSummary.total_users || usersList.length}</span>
            </button>
            <button 
              className={`filter-pill-btn ${userFilter === "active" ? "active" : ""}`}
              onClick={() => setUserFilter("active")}
            >
              🟢 Active <span className="badge bg-success ms-1">{userSummary.active_users || usersList.filter(u => u.is_active).length}</span>
            </button>
            <button 
              className={`filter-pill-btn ${userFilter === "verified" ? "active" : ""}`}
              onClick={() => setUserFilter("verified")}
            >
              🌟 Blue Tick <span className="badge bg-primary ms-1">{userSummary.verified_users || usersList.filter(u => u.is_verified).length}</span>
            </button>
            <button 
              className={`filter-pill-btn ${userFilter === "banned" ? "active" : ""}`}
              onClick={() => setUserFilter("banned")}
            >
              🚫 Suspended <span className="badge bg-danger ms-1">{userSummary.suspended_users || usersList.filter(u => u.is_banned).length}</span>
            </button>
          </div>

          {/* Search Input & View Toggle */}
          <div className="d-flex align-items-center gap-2 flex-grow-1 justify-content-end" style={{ minWidth: 320 }}>
            <div className="admin-search-input-box flex-grow-1" style={{ maxWidth: 420 }}>
              <BsSearch size={15} />
              <input 
                type="text" 
                placeholder="Search by name, email, @handle, mobile..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
              {userSearch && (
                <button className="clear-btn" onClick={() => setUserSearch("")} title="Clear search">
                  <BsX size={18} />
                </button>
              )}
            </div>

            {/* View Switcher: Table vs Cards */}
            <div className="btn-group" role="group">
              <button 
                type="button" 
                className={`btn btn-sm ${userViewMode === "table" ? "btn-primary" : "btn-outline-secondary"}`}
                onClick={() => setUserViewMode("table")}
                title="Table View"
              >
                <BsListUl size={16} />
              </button>
              <button 
                type="button" 
                className={`btn btn-sm ${userViewMode === "grid" ? "btn-primary" : "btn-outline-secondary"}`}
                onClick={() => setUserViewMode("grid")}
                title="Grid Card View"
              >
                <BsGridFill size={15} />
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Users Empty State */}
      {usersList.length === 0 ? (
        <div className="admin-surface-card text-center py-5 shadow-sm">
          <BsPeopleFill size={44} className="text-secondary opacity-50 mb-3" />
          <h5 className="text-light">No Users Found</h5>
          <p className="text-muted small">No user records matched your search query "{userSearch}" or active filter.</p>
          <button 
            className="btn btn-sm btn-outline-info"
            onClick={() => { setUserSearch(""); setUserFilter("all"); }}
          >
            Reset Search & Filters
          </button>
        </div>
      ) : userViewMode === "table" ? (
        
        /* ================= TABLE VIEW ================= */
        <div className="admin-surface-card shadow-sm p-0 overflow-hidden">
          <div className="table-responsive">
            <table className="table admin-custom-table mb-0 align-middle">
              <thead>
                <tr>
                  <th>User Profile</th>
                  <th>Contact Information</th>
                  <th>Content Metrics</th>
                  <th>Chat Clearance</th>
                  <th>Verification</th>
                  <th>Account Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map((user) => (
                  <tr key={user.id}>
                    {/* Profile with Avatar, Name, Handle, UID */}
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <div className="position-relative">
                          <img 
                            src={user.avatar} 
                            alt="" 
                            className="user-table-avatar"
                            onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=1877f2&color=fff`; }}
                          />
                          {user.is_verified && (
                            <span className="position-absolute bottom-0 end-0 bg-primary text-white rounded-circle p-1 d-flex align-items-center justify-content-center" style={{ width: 16, height: 16, fontSize: 9 }}>
                              ✓
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="d-flex align-items-center gap-1">
                            <strong className="user-table-name">{user.name}</strong>
                            {user.is_verified && <BsPatchCheckFill className="text-primary" size={13} />}
                            <span className="badge bg-dark border border-secondary text-secondary ms-1" style={{ fontSize: "10px" }}>
                              #{user.id}
                            </span>
                          </div>
                          <span className="handle-tag d-block">{user.username}</span>
                        </div>
                      </div>
                    </td>

                    {/* Contact Info (Email & Phone) */}
                    <td>
                      <div className="d-flex flex-column gap-1 small">
                        <div className="d-flex align-items-center gap-1 text-light">
                          <BsEnvelopeFill size={11} className="text-muted" />
                          <span>{user.email}</span>
                          <button 
                            className="copy-chip-btn py-0 px-1" 
                            onClick={() => {
                              navigator.clipboard.writeText(user.email);
                              showToast("📋 Email copied!");
                            }}
                            title="Copy Email"
                          >
                            <BsCopy size={9} />
                          </button>
                        </div>
                        {user.mobile && user.mobile !== "—" && (
                          <div className="d-flex align-items-center gap-1 text-muted">
                            <BsTelephoneFill size={11} />
                            <span>{user.mobile}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Content Stats (Posts & Reels) */}
                    <td>
                      <div className="d-flex align-items-center gap-2 small">
                        <span className="badge bg-dark border border-secondary text-light">
                          📝 {user.posts_count} Posts
                        </span>
                        <span className="badge bg-dark border border-secondary text-light">
                          🎬 {user.reels_count} Reels
                        </span>
                      </div>
                    </td>

                    {/* Chat Safety Status */}
                    <td>
                      {user.is_chat_restricted ? (
                        <span className="badge bg-danger-subtle text-danger border border-danger-subtle p-1 px-2 d-inline-flex align-items-center gap-1">
                          <BsLockFill size={11} /> Chat Muted
                        </span>
                      ) : (
                        <span className="badge bg-success-subtle text-success border border-success-subtle p-1 px-2 d-inline-flex align-items-center gap-1">
                          <BsChatDotsFill size={11} /> Active
                        </span>
                      )}
                    </td>

                    {/* Verification Toggle */}
                    <td>
                      <button 
                        className={`btn btn-sm ${user.is_verified ? "btn-verified-badge" : "btn-outline-secondary"}`}
                        onClick={() => handleToggleVerification(user)}
                        title={user.is_verified ? "Click to Revoke Badge" : "Click to Grant Blue Tick"}
                      >
                        {user.is_verified ? "🌟 Verified" : "+ Grant Badge"}
                      </button>
                    </td>

                    {/* Account Status Pill */}
                    <td>
                      <span className={`status-pill ${user.is_active ? "chip-active" : "chip-banned"}`}>
                        {user.is_active ? "🟢 Active" : "🚫 Suspended"}
                      </span>
                    </td>

                    {/* Action Cluster Buttons */}
                    <td className="text-end">
                      <div className="d-flex justify-content-end gap-1">
                        <button 
                          className="btn-action-icon text-info"
                          onClick={() => handleInspectUserTelemetry(user)}
                          title="Inspect Profile & Telemetry"
                        >
                          <BsEyeFill size={14} />
                        </button>
                        
                        <button 
                          className="btn-action-icon text-warning"
                          onClick={() => { setSelectedUserForModal(user); setShowResetPassModal(true); }}
                          title="Reset Password Override"
                        >
                          <BsKeyFill size={14} />
                        </button>

                        <button 
                          className="btn-action-icon text-primary"
                          onClick={() => { setSelectedUserForModal(user); setShowAdjustStarsModal(true); }}
                          title="Grant / Adjust Star Wallet"
                        >
                          <BsStarFill size={13} />
                        </button>

                        <button 
                          className={`btn-action-icon ${user.is_active ? "text-danger" : "text-success"}`}
                          onClick={() => {
                            if (user.is_active) {
                              setSelectedUserForModal(user);
                              setShowBanModal(true);
                            } else {
                              handleToggleUserStatus(user, true);
                            }
                          }}
                          title={user.is_active ? "Suspend Account" : "Reactivate Account"}
                        >
                          {user.is_active ? <BsBan size={14} /> : <BsCheckLg size={14} />}
                        </button>

                        <button 
                          className="btn-action-icon text-danger"
                          onClick={() => handleDeleteUser(user)}
                          title="Permanently Delete Account"
                        >
                          <BsTrash3Fill size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        
        /* ================= GRID CARDS VIEW ================= */
        <div className="row g-3">
          {usersList.map((user) => (
            <div className="col-12 col-md-6 col-xl-4" key={user.id}>
              <div className="admin-surface-card p-0 h-100 overflow-hidden shadow-sm d-flex flex-direction-column justify-content-between position-relative">
                
                {/* Card Top Banner with Avatar & Status */}
                <div className="p-3" style={{ background: "linear-gradient(135deg, rgba(24, 119, 242, 0.12) 0%, rgba(15, 23, 42, 0.6) 100%)", borderBottom: "1px solid rgba(255, 255, 255, 0.06)" }}>
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="badge bg-dark border border-secondary text-secondary">
                      UID #{user.id}
                    </span>
                    <span className={`status-pill ${user.is_active ? "chip-active" : "chip-banned"}`}>
                      {user.is_active ? "🟢 Active" : "🚫 Suspended"}
                    </span>
                  </div>

                  <div className="d-flex align-items-center gap-3">
                    <div className="position-relative">
                      <img 
                        src={user.avatar} 
                        alt="" 
                        className="rounded-circle border border-2 border-primary" 
                        style={{ width: 52, height: 52, objectFit: "cover" }}
                        onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=1877f2&color=fff`; }}
                      />
                      {user.is_verified && (
                        <BsPatchCheckFill className="position-absolute bottom-0 end-0 text-primary bg-dark rounded-circle" size={18} />
                      )}
                    </div>
                    <div className="overflow-hidden">
                      <h6 className="mb-0 text-light fw-bold text-truncate">{user.name}</h6>
                      <span className="text-info small d-block text-truncate">{user.username}</span>
                      <span className="text-muted" style={{ fontSize: "11px" }}>Joined: {user.created_at}</span>
                    </div>
                  </div>
                </div>

                {/* Card Middle: Bio & Contact */}
                <div className="p-3">
                  <p className="text-muted small mb-3 fst-italic" style={{ minHeight: "36px", lineClamp: 2, display: "-webkit-box", WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    "{user.bio || "No bio entered yet."}"
                  </p>

                  <div className="d-flex flex-column gap-1 small mb-3 p-2 rounded bg-dark border border-secondary">
                    <div className="d-flex align-items-center justify-content-between">
                      <span className="text-muted">Email:</span>
                      <strong className="text-light text-truncate ms-2" style={{ maxWidth: 180 }}>{user.email}</strong>
                    </div>
                    {user.mobile && (
                      <div className="d-flex align-items-center justify-content-between">
                        <span className="text-muted">Mobile:</span>
                        <span className="text-light">{user.mobile}</span>
                      </div>
                    )}
                  </div>

                  {/* Stats Badge Row */}
                  <div className="d-flex align-items-center justify-content-between gap-2 p-2 rounded bg-dark border border-secondary text-center small mb-3">
                    <div className="flex-grow-1">
                      <span className="text-muted d-block" style={{ fontSize: "10px" }}>POSTS</span>
                      <strong className="text-light">{user.posts_count}</strong>
                    </div>
                    <div className="flex-grow-1 border-start border-end border-secondary">
                      <span className="text-muted d-block" style={{ fontSize: "10px" }}>REELS</span>
                      <strong className="text-light">{user.reels_count}</strong>
                    </div>
                    <div className="flex-grow-1">
                      <span className="text-muted d-block" style={{ fontSize: "10px" }}>VERIFICATION</span>
                      <strong className={user.is_verified ? "text-primary" : "text-muted"}>
                        {user.is_verified ? "Verified" : "Standard"}
                      </strong>
                    </div>
                  </div>

                  {/* Chat Status Pill */}
                  <div className="d-flex align-items-center justify-content-between">
                    <span className="text-muted small">Chat Permission:</span>
                    {user.is_chat_restricted ? (
                      <span className="badge bg-danger-subtle text-danger">🔒 Chat Muted</span>
                    ) : (
                      <span className="badge bg-success-subtle text-success">🟢 Active</span>
                    )}
                  </div>
                </div>

                {/* Card Bottom Actions Bar */}
                <div className="p-2 px-3 bg-dark border-top border-secondary d-flex align-items-center justify-content-between">
                  <button 
                    className="btn btn-sm btn-outline-info"
                    onClick={() => handleInspectUserTelemetry(user)}
                    title="Inspect Profile Details"
                  >
                    <BsEyeFill className="me-1" /> Inspect
                  </button>

                  <div className="d-flex align-items-center gap-1">
                    <button 
                      className="btn btn-sm btn-outline-warning p-1 px-2"
                      onClick={() => { setSelectedUserForModal(user); setShowResetPassModal(true); }}
                      title="Reset Password"
                    >
                      <BsKeyFill />
                    </button>

                    <button 
                      className="btn btn-sm btn-outline-primary p-1 px-2"
                      onClick={() => { setSelectedUserForModal(user); setShowAdjustStarsModal(true); }}
                      title="Star Balance"
                    >
                      <BsStarFill />
                    </button>

                    <button 
                      className={`btn btn-sm ${user.is_active ? "btn-outline-danger" : "btn-outline-success"} p-1 px-2`}
                      onClick={() => {
                        if (user.is_active) {
                          setSelectedUserForModal(user);
                          setShowBanModal(true);
                        } else {
                          handleToggleUserStatus(user, true);
                        }
                      }}
                      title={user.is_active ? "Suspend" : "Unblock"}
                    >
                      {user.is_active ? <BsBan /> : <BsCheckLg />}
                    </button>

                    <button 
                      className="btn btn-sm btn-danger p-1 px-2"
                      onClick={() => handleDeleteUser(user)}
                      title="Delete Account"
                    >
                      <BsTrash3Fill />
                    </button>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}

      {/* ================= 🔢 USER DIRECTORY PAGINATION BAR ================= */}
      {userTotalCount > 0 && (
        <div className="admin-surface-card mt-3 p-3 shadow-sm d-flex align-items-center justify-content-between flex-wrap gap-3">
          {/* Left info */}
          <div className="d-flex align-items-center gap-2 small text-muted">
            <span>
              Showing <strong className="text-light">{Math.min((userPage - 1) * userPageSize + 1, userTotalCount)}</strong> to <strong className="text-light">{Math.min(userPage * userPageSize, userTotalCount)}</strong> of <strong className="text-primary">{userTotalCount}</strong> users
            </span>
            <span className="badge bg-dark border border-secondary text-secondary ms-2">
              Page {userPage} of {userTotalPages}
            </span>
          </div>

          {/* Center/Right controls */}
          <div className="d-flex align-items-center gap-3">
            {/* Rows per page selector */}
            <div className="d-flex align-items-center gap-2 small">
              <span className="text-muted d-none d-sm-inline">Rows per page:</span>
              <select 
                className="form-select form-select-sm admin-select py-1 px-2"
                style={{ width: "auto" }}
                value={userPageSize}
                onChange={(e) => handleUserPageSizeChange(e.target.value)}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            {/* Page Navigation Buttons */}
            <div className="btn-group" role="group">
              <button 
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={() => handleUserPageChange(1)}
                disabled={userPage <= 1}
                title="First Page"
              >
                <BsChevronDoubleLeft size={13} />
              </button>
              <button 
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={() => handleUserPageChange(userPage - 1)}
                disabled={userPage <= 1}
                title="Previous Page"
              >
                <BsChevronLeft size={13} />
              </button>

              {/* Numeric page badges */}
              {Array.from({ length: Math.min(5, userTotalPages) }, (_, i) => {
                let pageNum;
                if (userTotalPages <= 5) {
                  pageNum = i + 1;
                } else if (userPage <= 3) {
                  pageNum = i + 1;
                } else if (userPage >= userTotalPages - 2) {
                  pageNum = userTotalPages - 4 + i;
                } else {
                  pageNum = userPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    type="button"
                    className={`btn btn-sm ${userPage === pageNum ? "btn-primary fw-bold" : "btn-outline-secondary"}`}
                    onClick={() => handleUserPageChange(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button 
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={() => handleUserPageChange(userPage + 1)}
                disabled={userPage >= userTotalPages}
                title="Next Page"
              >
                <BsChevronRight size={13} />
              </button>
              <button 
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={() => handleUserPageChange(userTotalPages)}
                disabled={userPage >= userTotalPages}
                title="Last Page"
              >
                <BsChevronDoubleRight size={13} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= USER DETAIL MODAL ================= */}
      {showUserDetailModal && selectedUserForModal && (
        <div className="admin-modal-backdrop" onClick={() => setShowUserDetailModal(false)}>
          <div className="admin-modal-box shadow-2xl" style={{ maxWidth: 540 }} onClick={e => e.stopPropagation()}>
            
            <div className="modal-header-row">
              <div className="d-flex align-items-center gap-2">
                <BsShieldCheck className="text-primary" size={20} />
                <h5 className="mb-0">User Intelligence Profile</h5>
              </div>
              <button className="close-btn" onClick={() => setShowUserDetailModal(false)}><BsX size={26} /></button>
            </div>

            <div className="modal-body-content">
              {/* Profile Cover Header */}
              <div className="p-3 mb-3 rounded-3" style={{ background: "linear-gradient(135deg, rgba(24, 119, 242, 0.2) 0%, rgba(15, 23, 42, 0.9) 100%)", border: "1px solid rgba(24, 119, 242, 0.3)" }}>
                <div className="d-flex align-items-center gap-3">
                  <div className="position-relative">
                    <img 
                      src={selectedUserForModal.avatar} 
                      alt="" 
                      className="rounded-circle border border-2 border-primary shadow" 
                      style={{ width: 62, height: 62, objectFit: "cover" }}
                      onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUserForModal.name)}&background=1877f2&color=fff`; }}
                    />
                    {selectedUserForModal.is_verified && (
                      <BsPatchCheckFill className="position-absolute bottom-0 end-0 text-primary bg-dark rounded-circle" size={20} />
                    )}
                  </div>
                  <div>
                    <div className="d-flex align-items-center gap-1">
                      <h5 className="mb-0 fw-bold text-light">{selectedUserForModal.name}</h5>
                      <span className="badge bg-dark border border-secondary text-secondary ms-1">
                        #{selectedUserForModal.id}
                      </span>
                    </div>
                    <span className="text-info small fw-bold">{selectedUserForModal.username}</span>
                    <div className="d-flex align-items-center gap-2 mt-1">
                      <span className={`status-pill ${selectedUserForModal.is_active ? "chip-active" : "chip-banned"}`} style={{ fontSize: "10px", padding: "2px 8px" }}>
                        {selectedUserForModal.is_active ? "🟢 Active" : "🚫 Suspended"}
                      </span>
                      {selectedUserForModal.is_chat_restricted && (
                        <span className="badge bg-danger-subtle text-danger" style={{ fontSize: "10px" }}>
                          🔒 Chat Muted
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bio Quote */}
              <div className="p-2 px-3 mb-3 rounded bg-dark border border-secondary text-light small fst-italic">
                "{selectedUserForModal.bio || "No bio information provided by user."}"
              </div>

              {/* 4-Stat Metric Strip */}
              <div className="row g-2 mb-3 text-center">
                <div className="col-3">
                  <div className="p-2 rounded bg-dark border border-secondary">
                    <span className="text-muted d-block" style={{ fontSize: "10px" }}>POSTS</span>
                    <strong className="text-light">{selectedUserForModal.posts_count}</strong>
                  </div>
                </div>
                <div className="col-3">
                  <div className="p-2 rounded bg-dark border border-secondary">
                    <span className="text-muted d-block" style={{ fontSize: "10px" }}>REELS</span>
                    <strong className="text-light">{selectedUserForModal.reels_count}</strong>
                  </div>
                </div>
                <div className="col-3">
                  <div className="p-2 rounded bg-dark border border-secondary">
                    <span className="text-muted d-block" style={{ fontSize: "10px" }}>FAILED LOGINS</span>
                    <strong className={selectedUserForModal.failed_attempts > 0 ? "text-warning" : "text-success"}>
                      {selectedUserForModal.failed_attempts || 0}
                    </strong>
                  </div>
                </div>
                <div className="col-3">
                  <div className="p-2 rounded bg-dark border border-secondary">
                    <span className="text-muted d-block" style={{ fontSize: "10px" }}>BADGE</span>
                    <strong className={selectedUserForModal.is_verified ? "text-primary" : "text-muted"}>
                      {selectedUserForModal.is_verified ? "Verified" : "Regular"}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Information Grid */}
              <div className="user-detail-grid mb-3">
                <div className="detail-item">
                  <span className="text-muted small">Email Address</span>
                  <div className="d-flex align-items-center justify-content-between">
                    <strong className="text-truncate text-light me-1" style={{ maxWidth: 170 }}>{selectedUserForModal.email}</strong>
                    <button 
                      className="copy-chip-btn py-0 px-1"
                      onClick={() => {
                        navigator.clipboard.writeText(selectedUserForModal.email);
                        showToast("📋 Email copied!");
                      }}
                      title="Copy Email"
                    >
                      <BsCopy size={10} />
                    </button>
                  </div>
                </div>

                <div className="detail-item">
                  <span className="text-muted small">Mobile Number</span>
                  <strong className="text-light">{selectedUserForModal.mobile || "—"}</strong>
                </div>

                <div className="detail-item">
                  <span className="text-muted small">Gender</span>
                  <strong className="text-light">{selectedUserForModal.gender || "Unspecified"}</strong>
                </div>

                <div className="detail-item">
                  <span className="text-muted small">Registered On</span>
                  <strong className="text-light">{selectedUserForModal.created_at}</strong>
                </div>
              </div>

              {/* 📍 Last Known Login & Geolocation Telemetry */}
              <div className="p-3 mb-3 rounded-3 bg-dark border border-secondary shadow-sm">
                <div className="d-flex align-items-center justify-content-between mb-2 pb-1 border-bottom border-secondary-subtle">
                  <div className="d-flex align-items-center gap-2">
                    <BsGeoAltFill className="text-danger" size={15} />
                    <strong className="text-light small">📍 Last Login & Geolocation Telemetry</strong>
                    {isLoadingTelemetry && <span className="spinner-border spinner-border-sm text-primary ms-1" role="status"></span>}
                  </div>
                  <span className="badge bg-primary-subtle text-primary font-monospace" style={{ fontSize: "11px" }}>
                    {selectedUserTelemetry?.last_known_ip || selectedUserForModal.last_login_ip || "103.21.244.2"}
                  </span>
                </div>

                <div className="row g-2 small mb-2">
                  <div className="col-12">
                    <span className="text-muted d-block" style={{ fontSize: "11px" }}>Access Origin / City:</span>
                    <strong className="text-warning">
                      {selectedUserTelemetry?.last_known_location || selectedUserForModal.last_login_location || "Mumbai, Maharashtra, India 🇮🇳"}
                    </strong>
                  </div>

                  <div className="col-6">
                    <span className="text-muted d-block" style={{ fontSize: "11px" }}>💻 Device & OS:</span>
                    <span className="text-light">{selectedUserTelemetry?.last_known_device || selectedUserForModal.last_login_device || "Windows 11 • Chrome 124"}</span>
                  </div>

                  <div className="col-6">
                    <span className="text-muted d-block" style={{ fontSize: "11px" }}>🕒 Access Time:</span>
                    <span className="text-light">{selectedUserTelemetry?.last_login_at || selectedUserForModal.last_login_time || "Recently Active"}</span>
                  </div>
                </div>

                {/* Recent Login History Mini Stream */}
                {selectedUserTelemetry?.login_history && selectedUserTelemetry.login_history.length > 0 && (
                  <div className="mt-2 pt-2 border-top border-secondary-subtle">
                    <span className="text-muted d-block mb-1" style={{ fontSize: "10px" }}>RECENT LOGIN SESSIONS:</span>
                    <div className="d-flex flex-column gap-1">
                      {selectedUserTelemetry.login_history.slice(0, 3).map((sess, sIdx) => (
                        <div key={sIdx} className="d-flex align-items-center justify-content-between p-1 px-2 rounded bg-black bg-opacity-40 border border-secondary border-opacity-40" style={{ fontSize: "11px" }}>
                          <span className="text-light">{sess.location || "India 🇮🇳"}</span>
                          <span className="text-muted font-monospace">{sess.ip_address} • {sess.timestamp}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Direct Quick Action Toolbar */}
              <label className="form-label small fw-bold text-light mb-2">⚡ Instant Clearance Controls</label>
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <button 
                  className="btn btn-sm btn-outline-warning d-flex align-items-center gap-1"
                  onClick={() => { setShowUserDetailModal(false); setShowResetPassModal(true); }}
                >
                  <BsKeyFill size={13} /> Reset Password
                </button>

                <button 
                  className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                  onClick={() => { setShowUserDetailModal(false); setShowAdjustStarsModal(true); }}
                >
                  <BsStarFill size={13} /> Adjust Stars
                </button>

                <button 
                  className={`btn btn-sm ${selectedUserForModal.is_active ? "btn-outline-danger" : "btn-outline-success"} d-flex align-items-center gap-1`}
                  onClick={() => {
                    setShowUserDetailModal(false);
                    if (selectedUserForModal.is_active) {
                      setShowBanModal(true);
                    } else {
                      handleToggleUserStatus(selectedUserForModal, true);
                    }
                  }}
                >
                  {selectedUserForModal.is_active ? <><BsBan size={13} /> Suspend Account</> : <><BsCheckLg size={13} /> Reactivate Account</>}
                </button>
              </div>

            </div>

            <div className="modal-footer-row">
              <button className="btn btn-secondary" onClick={() => setShowUserDetailModal(false)}>Close Profile</button>
            </div>
          </div>
        </div>
      )}

      {/* ================= RESET PASSWORD MODAL ================= */}
      {showResetPassModal && selectedUserForModal && (
        <div className="admin-modal-backdrop" onClick={() => setShowResetPassModal(false)}>
          <div className="admin-modal-box shadow-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header-row">
              <h5>🔑 Reset Password for {selectedUserForModal.name}</h5>
              <button className="close-btn" onClick={() => setShowResetPassModal(false)}><BsX size={26} /></button>
            </div>

            <form onSubmit={handleResetPassword}>
              <div className="modal-body-content">
                <p className="small text-muted">Admin override will immediately hash and replace the user's password in the database.</p>
                
                <label className="form-label small fw-bold">New Password (Minimum 6 characters)</label>
                <input 
                  type="text"
                  className="form-control admin-input mb-3"
                  placeholder="Enter new temporary password..."
                  value={newResetPassword}
                  onChange={(e) => setNewResetPassword(e.target.value)}
                  required
                />
              </div>

              <div className="modal-footer-row">
                <button type="button" className="btn btn-secondary" onClick={() => setShowResetPassModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-warning fw-bold text-dark">
                  💾 Override Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= ADJUST STARS MODAL ================= */}
      {showAdjustStarsModal && selectedUserForModal && (
        <div className="admin-modal-backdrop" onClick={() => setShowAdjustStarsModal(false)}>
          <div className="admin-modal-box shadow-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header-row">
              <h5>⭐ Adjust Star Balance: {selectedUserForModal.name}</h5>
              <button className="close-btn" onClick={() => setShowAdjustStarsModal(false)}><BsX size={26} /></button>
            </div>

            <form onSubmit={handleAdjustStars}>
              <div className="modal-body-content">
                <label className="form-label small fw-bold">Star Amount (Positive to Grant, Negative to Deduct)</label>
                <input 
                  type="number"
                  className="form-control admin-input mb-3"
                  value={adjustStarsAmount}
                  onChange={(e) => setAdjustStarsAmount(e.target.value)}
                  required
                />

                <label className="form-label small fw-bold">Adjustment Reason Note</label>
                <input 
                  type="text"
                  className="form-control admin-input mb-3"
                  value={adjustStarsNote}
                  onChange={(e) => setAdjustStarsNote(e.target.value)}
                  placeholder="E.g. Promotional Reward, Refund..."
                />
              </div>

              <div className="modal-footer-row">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAdjustStarsModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary fw-bold">
                  ✨ Apply Star Balance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= BAN USER MODAL ================= */}
      {showBanModal && selectedUserForModal && (
        <div className="admin-modal-backdrop" onClick={() => setShowBanModal(false)}>
          <div className="admin-modal-box shadow-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header-row">
              <h5>Suspend User Account</h5>
              <button className="close-btn" onClick={() => setShowBanModal(false)}><BsX size={26} /></button>
            </div>

            <div className="modal-body-content">
              <p>Are you sure you want to suspend account <strong>{selectedUserForModal.name}</strong> ({selectedUserForModal.email})?</p>
              
              <label className="form-label small fw-bold">Suspension Duration</label>
              <select 
                className="form-select admin-input mb-3"
                value={banDuration}
                onChange={(e) => setBanDuration(e.target.value)}
              >
                <option value="24h">24 Hours</option>
                <option value="7d">7 Days</option>
                <option value="30d">30 Days</option>
                <option value="perm">Permanent Suspension (Indefinite)</option>
              </select>

              <label className="form-label small fw-bold">Reason for suspension</label>
              <textarea 
                className="form-control admin-input"
                rows={3}
                placeholder="E.g., Repeated community guideline violation, spamming..."
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
              />
            </div>

            <div className="modal-footer-row">
              <button className="btn btn-secondary" onClick={() => setShowBanModal(false)}>Cancel</button>
              <button 
                className="btn btn-danger fw-bold"
                onClick={() => handleToggleUserStatus(selectedUserForModal, false)}
              >
                🚫 Confirm Suspension
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
