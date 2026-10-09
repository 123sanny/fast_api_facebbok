import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  getActiveUserId,
  getActiveUserName,
  getUserStorageItem,
  setUserStorageItem,
  fetchFullProfileApi
} from "../services/profileApi";
import { fetchUnreadNotifCountApi } from "../services/notificationApi";
import "./css/MenuIcons.css";

function MenuIcons() {
  const currentUserId = getActiveUserId();
  const userName = getActiveUserName();

  const [userAvatar, setUserAvatar] = useState(() => {
    return getUserStorageItem(
      "avatar",
      `https://api.dicebear.com/7.x/identicon/svg?seed=${userName || currentUserId || "user"}`,
      currentUserId
    );
  });

  const [unreadCount, setUnreadCount] = useState(0);

  // Sync and fetch the latest user profile picture
  useEffect(() => {
    let isMounted = true;
    const activeId = getActiveUserId();

    const loadProfile = async () => {
      if (!activeId) return;
      try {
        const res = await fetchFullProfileApi(activeId);
        if (isMounted && res && res.success && res.data && res.data.profile_pic) {
          setUserAvatar(res.data.profile_pic);
          setUserStorageItem("avatar", res.data.profile_pic, activeId);
        }
      } catch (err) {
        console.warn("Failed to load user avatar in MenuIcons:", err);
      }
    };

    const loadUnreadCount = async () => {
      if (!activeId) return;
      try {
        const count = await fetchUnreadNotifCountApi(activeId);
        if (isMounted && typeof count === "number") {
          setUnreadCount(count);
        }
      } catch (e) {
        // silent fail
      }
    };

    loadProfile();
    loadUnreadCount();

    // Event listeners for profile changes and notifications
    const handleProfileUpdate = () => {
      const id = getActiveUserId();
      const updated = getUserStorageItem(
        "avatar",
        `https://api.dicebear.com/7.x/identicon/svg?seed=${getActiveUserName() || id || "user"}`,
        id
      );
      if (updated) setUserAvatar(updated);
    };

    const handleNotificationsUpdated = () => {
      loadUnreadCount();
    };

    window.addEventListener("profile-updated", handleProfileUpdate);
    window.addEventListener("nexoria_notifications_updated", handleNotificationsUpdated);
    window.addEventListener("storage", handleProfileUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener("profile-updated", handleProfileUpdate);
      window.removeEventListener("nexoria_notifications_updated", handleNotificationsUpdated);
      window.removeEventListener("storage", handleProfileUpdate);
    };
  }, [currentUserId]);

  const fallbackAvatar = `https://api.dicebear.com/7.x/identicon/svg?seed=${userName || currentUserId || "user"}`;

  return (
    <div className="menu-bar">
      <div className="menu-icons">
        <NavLink to="/home" className={({ isActive }) => (isActive ? "active" : "")} title="Home">
          <i className="bi bi-house"></i>
        </NavLink>

        <NavLink to="/reels" className={({ isActive }) => (isActive ? "active" : "")} title="Reels">
          <i className="bi bi-play-btn"></i>
        </NavLink>

        <NavLink to="/friends" className={({ isActive }) => (isActive ? "active" : "")} title="Friends">
          <i className="bi bi-people"></i>
        </NavLink>

        <NavLink to="/market" className={({ isActive }) => (isActive ? "active" : "")} title="Marketplace">
          <i className="bi bi-shop"></i>
        </NavLink>

        <NavLink to="/notifications" className={({ isActive }) => (isActive ? "active position-relative" : "position-relative")} title="Notifications">
          <i className="bi bi-bell"></i>
          {unreadCount > 0 && (
            <span className="menu-notif-dot">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </NavLink>

        <NavLink to="/profile" className={({ isActive }) => (isActive ? "active" : "")} title="Your Profile">
          <img
            className="header-profile"
            src={userAvatar || fallbackAvatar}
            alt={userName || "Profile"}
            onError={(e) => {
              e.currentTarget.src = fallbackAvatar;
            }}
          />
        </NavLink>
      </div>
    </div>
  );
}

export default MenuIcons;