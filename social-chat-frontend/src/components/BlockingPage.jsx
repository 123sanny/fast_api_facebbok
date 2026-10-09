import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import MenuIcons from "./MenuIcons";
import ChatDrawer from "./ChatDrawer";
import {
  BsChevronLeft,
  BsPlus,
  BsSearch,
  BsCheckCircleFill,
  BsX,
  BsPersonX
} from "react-icons/bs";
import { getActiveUserId } from "../services/profileApi";
import {
  fetchBlockedUsersApi,
  blockUserApi,
  unblockUserApi,
  searchUsersToBlockApi
} from "../services/friendApi";
import "./css/BlockingPage.css";

const BlockingPage = () => {
  const navigate = useNavigate();
  const currentUserId = getActiveUserId();

  const [activeChat, setActiveChat] = useState(null);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState("");

  // Add to Blocked List modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Confirmation Modals State
  const [confirmUnblockUser, setConfirmUnblockUser] = useState(null);
  const [confirmBlockUser, setConfirmBlockUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  // 1. Fetch Blocked Users
  const loadBlockedUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchBlockedUsersApi(currentUserId);
      if (res && res.success && Array.isArray(res.data)) {
        setBlockedUsers(res.data);
      } else {
        setBlockedUsers([]);
      }
    } catch (err) {
      console.warn("Error loading blocked users:", err);
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    loadBlockedUsers();
  }, [loadBlockedUsers]);

  // 2. Search users to block
  const handleSearchUsers = useCallback(async (query) => {
    setSearchQuery(query);
    setSearchLoading(true);
    try {
      const res = await searchUsersToBlockApi(currentUserId, query);
      if (res && res.success && Array.isArray(res.data)) {
        setSearchResults(res.data);
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      console.warn("Error searching users:", err);
    } finally {
      setSearchLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    if (showAddModal) {
      handleSearchUsers("");
    }
  }, [showAddModal, handleSearchUsers]);

  // 3. Confirm Block Action
  const executeBlock = async () => {
    if (!confirmBlockUser) return;
    setActionLoading(true);
    try {
      const res = await blockUserApi(currentUserId, confirmBlockUser.id, "Blocked from Blocking settings");
      if (res && res.success) {
        showToast(`${confirmBlockUser.name || confirmBlockUser.full_name || "User"} has been blocked.`);
        setConfirmBlockUser(null);
        setShowAddModal(false);
        setSearchQuery("");
        loadBlockedUsers();
      } else {
        showToast(res?.message || "Failed to block user.");
      }
    } catch (err) {
      showToast("Error blocking user.");
    } finally {
      setActionLoading(false);
    }
  };

  // 4. Confirm Unblock Action
  const executeUnblock = async () => {
    if (!confirmUnblockUser) return;
    setActionLoading(true);
    try {
      const blockId = confirmUnblockUser.blocked_user_id || confirmUnblockUser.blocked_user || confirmUnblockUser.id;
      const res = await unblockUserApi(currentUserId, blockId);
      if (res && res.success) {
        showToast(`${confirmUnblockUser.name || confirmUnblockUser.full_name || "User"} was unblocked.`);
        setConfirmUnblockUser(null);
        loadBlockedUsers();
      } else {
        showToast(res?.message || "Failed to unblock user.");
      }
    } catch (err) {
      showToast("Error unblocking user.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="fb-blocking-root">
      <Header onOpenChat={setActiveChat} />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fb-blocking-toast shadow-lg">
          <BsCheckCircleFill className="text-success me-2" size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="fb-blocking-container">
        {/* Top Header Bar */}
        <div className="fb-blocking-header">
          <button className="fb-blocking-back-btn" onClick={() => navigate(-1)} aria-label="Go back">
            <BsChevronLeft size={20} />
          </button>
          <h2 className="fb-blocking-title">Blocking</h2>
          <div style={{ width: 28 }}></div>
        </div>

        {/* Content Body */}
        <div className="fb-blocking-content">
          <h3 className="fb-blocked-heading">Blocked people</h3>
          <p className="fb-blocked-desc">
            Once you've blocked someone, that person can no longer see things you post on your Timeline, tag you, invite you to events or groups, start a conversation with you or add you as a friend. This doesn't include apps, games or groups you both participate in.
          </p>

          {/* ADD TO BLOCKED LIST Action Row */}
          <button className="fb-add-blocked-btn" onClick={() => setShowAddModal(true)}>
            <div className="fb-add-plus-icon-box">
              <BsPlus size={24} color="#ffffff" />
            </div>
            <span className="fb-add-blocked-label">ADD TO BLOCKED LIST</span>
          </button>

          {/* Blocked Users List */}
          <div className="fb-blocked-list">
            {loading ? (
              <div className="fb-blocked-loading">
                <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                <span>Loading blocked users...</span>
              </div>
            ) : blockedUsers.length === 0 ? (
              <div className="fb-blocked-empty">
                <BsPersonX size={44} className="text-muted mb-2" />
                <p className="mb-0">You haven't blocked anyone yet.</p>
                <small className="text-muted">Tap "ADD TO BLOCKED LIST" above to block someone.</small>
              </div>
            ) : (
              blockedUsers.map((user) => {
                const displayName = user.name || user.full_name || user.username || `User #${user.id}`;
                const avatarUrl = user.avatar || user.profile_pic || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80";
                return (
                  <div key={user.id || user.blocked_user_id} className="fb-blocked-item">
                    <div className="fb-blocked-item-left">
                      <img
                        src={avatarUrl}
                        alt={displayName}
                        className="fb-blocked-avatar"
                        onError={(e) => {
                          e.currentTarget.src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80";
                        }}
                      />
                      <div className="fb-blocked-user-info">
                        <span className="fb-blocked-name">{displayName}</span>
                        {user.username && (
                          <small className="fb-blocked-handle">@{user.username}</small>
                        )}
                      </div>
                    </div>
                    <button
                      className="fb-unblock-btn"
                      onClick={() => setConfirmUnblockUser(user)}
                    >
                      UNBLOCK
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 1. ADD TO BLOCKED LIST SEARCH MODAL */}
      {/* ===================================================================== */}
      {showAddModal && (
        <div className="fb-blocking-overlay" onClick={() => setShowAddModal(false)}>
          <div className="fb-blocking-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="fb-blocking-modal-header">
              <h4>Add to blocked list</h4>
              <button className="fb-blocking-modal-close" onClick={() => setShowAddModal(false)}>
                <BsX size={24} />
              </button>
            </div>
            <div className="fb-blocking-modal-body">
              <p className="text-muted small mb-2">
                Type a name, username, or email to search for people to block.
              </p>

              <div className="fb-search-input-wrap">
                <BsSearch className="fb-search-icon" />
                <input
                  type="text"
                  className="fb-search-input"
                  placeholder="Type a name or email address"
                  value={searchQuery}
                  onChange={(e) => handleSearchUsers(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="fb-search-results-list">
                {searchLoading ? (
                  <div className="p-3 text-center text-muted small">
                    <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                    Searching...
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="p-3 text-center text-muted small">
                    {searchQuery ? "No users found matching your search." : "Search registered users to block."}
                  </div>
                ) : (
                  searchResults.map((u) => {
                    const uName = u.name || u.full_name || u.username;
                    const uAvatar = u.avatar || u.profile_pic || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80";
                    return (
                      <div key={u.id} className="fb-search-user-row">
                        <div className="d-flex align-items-center gap-2">
                          <img
                            src={uAvatar}
                            alt={uName}
                            className="fb-blocked-avatar"
                            onError={(e) => {
                              e.currentTarget.src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80";
                            }}
                          />
                          <div>
                            <strong className="d-block text-dark" style={{ fontSize: "0.95rem" }}>{uName}</strong>
                            {u.username && <small className="text-muted">@{u.username}</small>}
                          </div>
                        </div>
                        <button
                          className="fb-block-action-btn"
                          onClick={() => setConfirmBlockUser(u)}
                        >
                          Block
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 2. CONFIRM BLOCK MODAL (FACEBOOK STANDARD) */}
      {/* ===================================================================== */}
      {confirmBlockUser && (
        <div className="fb-blocking-overlay" onClick={() => !actionLoading && setConfirmBlockUser(null)}>
          <div className="fb-blocking-dialog-card" onClick={(e) => e.stopPropagation()}>
            <h4 className="fb-dialog-title">
              Block {confirmBlockUser.name || confirmBlockUser.full_name || "this user"}?
            </h4>
            <div className="fb-dialog-body">
              <p className="mb-2 fw-semibold text-dark">
                {confirmBlockUser.name || confirmBlockUser.full_name || "This person"} will no longer be able to:
              </p>
              <ul className="fb-dialog-bullet-list">
                <li>See things you post on your timeline</li>
                <li>Tag you in posts, photos, or comments</li>
                <li>Invite you to events or groups</li>
                <li>Start a conversation or send messages to you</li>
                <li>Add you as a friend</li>
              </ul>
              <p className="text-muted small mb-0">
                If you're friends, blocking will also unfriend them.
              </p>
            </div>
            <div className="fb-dialog-actions">
              <button
                className="fb-dialog-btn fb-dialog-btn-cancel"
                onClick={() => setConfirmBlockUser(null)}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                className="fb-dialog-btn fb-dialog-btn-primary"
                onClick={executeBlock}
                disabled={actionLoading}
              >
                {actionLoading ? "Blocking..." : "Block"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 3. CONFIRM UNBLOCK MODAL (FACEBOOK STANDARD) */}
      {/* ===================================================================== */}
      {confirmUnblockUser && (
        <div className="fb-blocking-overlay" onClick={() => !actionLoading && setConfirmUnblockUser(null)}>
          <div className="fb-blocking-dialog-card" onClick={(e) => e.stopPropagation()}>
            <h4 className="fb-dialog-title">
              Unblock {confirmUnblockUser.name || confirmUnblockUser.full_name || "this user"}?
            </h4>
            <div className="fb-dialog-body">
              <p className="mb-2">
                If you unblock <strong>{confirmUnblockUser.name || confirmUnblockUser.full_name}</strong>, they may be able to see your timeline or contact you, depending on your privacy settings.
              </p>
              <p className="text-muted small mb-0">
                You'll have to wait 48 hours if you want to block {confirmUnblockUser.name || confirmUnblockUser.full_name} again.
              </p>
            </div>
            <div className="fb-dialog-actions">
              <button
                className="fb-dialog-btn fb-dialog-btn-cancel"
                onClick={() => setConfirmUnblockUser(null)}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                className="fb-dialog-btn fb-dialog-btn-primary"
                onClick={executeUnblock}
                disabled={actionLoading}
              >
                {actionLoading ? "Unblocking..." : "Unblock"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ChatDrawer activeChat={activeChat} onClose={() => setActiveChat(null)} />

      <div className="mobile-bottom-nav">
        <MenuIcons />
      </div>
    </div>
  );
};

export default BlockingPage;
