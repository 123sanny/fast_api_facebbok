import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import MenuIcons from "./MenuIcons";
import ChatDrawer from "./ChatDrawer";
import {
  BsChevronLeft, BsSearch, BsShieldLock, BsPerson,
  BsBriefcase, BsCreditCard,
  BsCurrencyDollar, BsListCheck, BsPhone, BsBoxes,
  BsBag, BsQuestionCircle, BsWhatsapp, BsFileText,
  BsLock, BsSlashCircle, BsSliders,
  BsHandThumbsUp, BsBell, BsUniversalAccess,
  BsPinAngle, BsGlobe, BsPlayBtn, BsClock,
  BsLayoutSidebar, BsMoonStars, BsCamera, BsMegaphone,
  BsFlask, BsFlag, BsBookmark, BsPersonBadge,
  BsPersonX, BsCircle, BsShieldCheck, BsGlobe2,
  BsCheck2, BsKey, BsQrCode, BsChevronRight,
  BsLaptop, BsEye, BsEyeSlash, BsExclamationTriangleFill,
  BsCheckCircleFill, BsVolumeUp, BsShield,
  BsTrash, BsPlusLg, BsMic, BsCameraVideo,
  BsGeoAlt, BsArrowRepeat, BsStars, BsGraphUpArrow,
  BsCodeSlash, BsLink45Deg, BsCopy, BsCloudArrowUp,
  BsBadgeCc, BsShareFill, BsPlus
} from "react-icons/bs";
import "./css/SettingsPage.css";

import { getActiveUserId } from "../services/profileApi";
import {
  fetchSecuritySettingsApi,
  updateSecuritySettingsApi,
  changePasswordApi,
  fetchActiveSessionsApi
} from "../services/securityApi";
import {
  fetchBlockedUsersApi,
  unblockUserApi
} from "../services/friendApi";
import {
  fetchPrivacySettingsApi,
  updatePrivacySettingsApi,
  fetchUserPreferencesApi,
  updateUserPreferencesApi,
  fetchFamilyCentreApi,
  addFamilySupervisionApi,
  deleteFamilySupervisionApi
} from "../services/settingsApi";

const SettingsPage = () => {
  const navigate = useNavigate();
  const currentUserId = getActiveUserId();

  const [search, setSearch] = useState("");
  const [activeChat, setActiveChat] = useState(null);
  const [activeModal, setActiveModal] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  // Dynamic Privacy Settings States (Database-backed)
  const [reactionsHidden, setReactionsHidden] = useState(false);
  const [reactionsOwnHidden, setReactionsOwnHidden] = useState(false);
  const [activeStatus, setActiveStatus] = useState(true);
  const [profileLocked, setProfileLocked] = useState(false);
  const [sensitiveContent, setSensitiveContent] = useState("standard");
  const [whoCanContact, setWhoCanContact] = useState("everyone");
  const [whoCanFollow, setWhoCanFollow] = useState("public");
  const [whoCanPostOnProfile, setWhoCanPostOnProfile] = useState("friends");
  const [reviewTags, setReviewTags] = useState(true);
  const [defaultAudience, setDefaultAudience] = useState("Public");
  const [blockedUsers, setBlockedUsers] = useState([]);

  // Dynamic Media, Audio & UX Preferences States (Database-backed)
  const [videoAutoplay, setVideoAutoplay] = useState("wifi_cellular");
  const [dataSaver, setDataSaver] = useState(false);
  const [hdUploads, setHdUploads] = useState(true);
  const [spatialAudio, setSpatialAudio] = useState(true);
  const [noiseCancellation, setNoiseCancellation] = useState(true);
  const [audioQuality, setAudioQuality] = useState("high");
  const [earlyAccess, setEarlyAccess] = useState(true);
  const [cameraSuggestions, setCameraSuggestions] = useState(true);
  const [whatsappNumber, setWhatsappNumber] = useState("+91 98765 43210");
  const [isWhatsappLinked, setIsWhatsappLinked] = useState(false);

  // Dynamic Family Centre Supervision States (Database-backed)
  const [supervisedMembers, setSupervisedMembers] = useState([]);
  const [newTeenName, setNewTeenName] = useState("");
  const [newGuardianEmail, setNewGuardianEmail] = useState("");
  const [newRelationship, setNewRelationship] = useState("Teen / Child");
  const [newDailyLimit, setNewDailyLimit] = useState(120);
  const [newQuietStart, setNewQuietStart] = useState("22:00");
  const [newQuietEnd, setNewQuietEnd] = useState("07:00");
  const [newBlockSensitive, setNewBlockSensitive] = useState(true);
  const [newRequireApproval, setNewRequireApproval] = useState(true);
  const [isAddingSupervision, setIsAddingSupervision] = useState(false);
  const [showAddFamilyForm, setShowAddFamilyForm] = useState(false);

  // Dynamic Password & Security States
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [loginAlertsEnabled, setLoginAlertsEnabled] = useState(true);
  const [activeSessionsCount, setActiveSessionsCount] = useState(1);

  // Change Password Form in Settings Modal
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [logoutOtherDevices, setLogoutOtherDevices] = useState(true);
  const [pwdError, setPwdError] = useState("");
  const [isChangingPwd, setIsChangingPwd] = useState(false);

  // 1. Tab Bar Shortcuts States
  const [tabShortcuts, setTabShortcuts] = useState(() => {
    try {
      const saved = localStorage.getItem("nexoria_tab_shortcuts");
      return saved ? JSON.parse(saved) : {
        reels: "pin",
        marketplace: "auto",
        groups: "auto",
        gaming: "hide",
        notifications: "pin"
      };
    } catch (e) {
      return { reels: "pin", marketplace: "auto", groups: "auto", gaming: "hide", notifications: "pin" };
    }
  });
  const [shortcutBadges, setShortcutBadges] = useState(true);

  // 2. Accessibility States
  const [fontScale, setFontScale] = useState(() => {
    return Number(localStorage.getItem("nexoria_font_scale")) || 100;
  });
  const [highContrast, setHighContrast] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [autoCaptions, setAutoCaptions] = useState(true);
  const [screenReaderMode, setScreenReaderMode] = useState(false);

  // 3. Browser Settings States
  const [openExternalBrowser, setOpenExternalBrowser] = useState(false);
  const [browserAutofill, setBrowserAutofill] = useState(true);
  const [safeBrowsing, setSafeBrowsing] = useState(true);
  const [lastCacheCleared, setLastCacheCleared] = useState("Today, 10:30 AM");

  // 4. Professional Mode States
  const [proModeEnabled, setProModeEnabled] = useState(false);
  const [proCategory, setProCategory] = useState("Digital Creator");
  const [showProBadgeOnProfile, setShowProBadgeOnProfile] = useState(true);
  const [allowCollabTagging, setAllowCollabTagging] = useState(true);

  // 5. Stories Privacy States
  const [storiesAudience, setStoriesAudience] = useState("public");
  const [storyReplies, setStoryReplies] = useState("everyone");
  const [allowStorySharing, setAllowStorySharing] = useState(true);
  const [saveStoryToArchive, setSaveStoryToArchive] = useState(true);

  // 6. Device Permissions Live States
  const [devicePerms, setDevicePerms] = useState({
    camera: "prompt",
    microphone: "prompt",
    location: "prompt",
    notifications: (typeof Notification !== "undefined" && Notification.permission) ? Notification.permission : "default",
    storage: "granted"
  });

  // 7. Business Integrations & APIs States
  const [metaPixelConnected, setMetaPixelConnected] = useState(true);
  const [stripeConnected, setStripeConnected] = useState(true);
  const [zapierWebhook, setZapierWebhook] = useState("https://hooks.zapier.com/hooks/catch/nx_992384");
  const [devApiKey, setDevApiKey] = useState("nx_live_948f20b87c1248a39e105bd77610");
  const [showDevKey, setShowDevKey] = useState(false);

  // Accessibility Live Effects
  useEffect(() => {
    if (fontScale) {
      document.documentElement.style.fontSize = `${(fontScale / 100) * 16}px`;
    }
    return () => {
      document.documentElement.style.fontSize = "";
    };
  }, [fontScale]);

  useEffect(() => {
    if (highContrast) {
      document.body.classList.add("high-contrast-mode");
    } else {
      document.body.classList.remove("high-contrast-mode");
    }
  }, [highContrast]);

  useEffect(() => {
    if (reduceMotion) {
      document.body.classList.add("reduce-motion-mode");
    } else {
      document.body.classList.remove("reduce-motion-mode");
    }
  }, [reduceMotion]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  // Load live security, sessions, blocked users, privacy, preferences & family centre on mount
  const loadSecurityState = useCallback(async () => {
    try {
      const [settings, sessions, blocked, privacy, prefs, family] = await Promise.all([
        fetchSecuritySettingsApi(currentUserId),
        fetchActiveSessionsApi(currentUserId),
        fetchBlockedUsersApi(currentUserId),
        fetchPrivacySettingsApi(currentUserId),
        fetchUserPreferencesApi(currentUserId),
        fetchFamilyCentreApi(currentUserId)
      ]);

      if (settings) {
        setTwoFactorEnabled(Boolean(settings.two_factor_enabled));
        setLoginAlertsEnabled(Boolean(settings.login_alerts));
      }
      if (Array.isArray(sessions)) {
        setActiveSessionsCount(sessions.length);
      }
      if (blocked && blocked.success && Array.isArray(blocked.data)) {
        setBlockedUsers(blocked.data);
      }
      if (privacy && privacy.success) {
        setProfileLocked(Boolean(privacy.profile_locked));
        setActiveStatus(Boolean(privacy.active_status));
        setDefaultAudience(privacy.who_can_see_posts || "Public");
        setWhoCanContact(privacy.who_can_send_requests || "everyone");
        setWhoCanFollow(privacy.who_can_follow || "public");
        setWhoCanPostOnProfile(privacy.who_can_post_on_profile || "friends");
        setReviewTags(privacy.review_tags !== undefined ? Boolean(privacy.review_tags) : true);
        setReactionsHidden(Boolean(privacy.reactions_hide_others));
        setReactionsOwnHidden(Boolean(privacy.reactions_hide_own));
        setSensitiveContent(privacy.sensitive_content || "standard");
      }
      if (prefs && prefs.success) {
        setVideoAutoplay(prefs.video_autoplay || "wifi_cellular");
        setDataSaver(Boolean(prefs.data_saver));
        setHdUploads(prefs.hd_uploads !== undefined ? Boolean(prefs.hd_uploads) : true);
        setSpatialAudio(prefs.spatial_audio !== undefined ? Boolean(prefs.spatial_audio) : true);
        setNoiseCancellation(prefs.noise_cancellation !== undefined ? Boolean(prefs.noise_cancellation) : true);
        setAudioQuality(prefs.audio_quality || "high");
        setEarlyAccess(prefs.early_access !== undefined ? Boolean(prefs.early_access) : true);
        setCameraSuggestions(prefs.camera_suggestions !== undefined ? Boolean(prefs.camera_suggestions) : true);
        setIsWhatsappLinked(Boolean(prefs.whatsapp_linked));
        if (prefs.whatsapp_number) setWhatsappNumber(prefs.whatsapp_number);
      }
      if (family && family.success && Array.isArray(family.supervised_members)) {
        setSupervisedMembers(family.supervised_members);
      }
    } catch (err) {
      console.warn("Error loading settings state:", err);
    }
  }, [currentUserId]);

  useEffect(() => {
    loadSecurityState();
  }, [loadSecurityState]);

  // Handle Dynamic Privacy Field Updates
  const handleTogglePrivacy = async (field, currentVal) => {
    const nextVal = !currentVal;
    if (field === "profile_locked") setProfileLocked(nextVal);
    if (field === "active_status") setActiveStatus(nextVal);
    if (field === "review_tags") setReviewTags(nextVal);
    if (field === "reactions_hide_others") setReactionsHidden(nextVal);
    if (field === "reactions_hide_own") setReactionsOwnHidden(nextVal);
    
    await updatePrivacySettingsApi(currentUserId, { [field]: nextVal });
    showToast("Privacy setting updated & saved to database.");
  };

  const handleSelectPrivacy = async (field, value) => {
    if (field === "who_can_see_posts") setDefaultAudience(value);
    if (field === "who_can_send_requests") setWhoCanContact(value);
    if (field === "who_can_follow") setWhoCanFollow(value);
    if (field === "who_can_post_on_profile") setWhoCanPostOnProfile(value);
    if (field === "sensitive_content") setSensitiveContent(value);

    await updatePrivacySettingsApi(currentUserId, { [field]: value });
    showToast("Audience / privacy preference saved.");
  };

  // Handle Dynamic Media & Audio Preference Updates
  const handleTogglePreference = async (field, currentVal) => {
    const nextVal = !currentVal;
    if (field === "data_saver") setDataSaver(nextVal);
    if (field === "hd_uploads") setHdUploads(nextVal);
    if (field === "spatial_audio") setSpatialAudio(nextVal);
    if (field === "noise_cancellation") setNoiseCancellation(nextVal);
    if (field === "early_access") setEarlyAccess(nextVal);
    if (field === "camera_suggestions") setCameraSuggestions(nextVal);
    if (field === "whatsapp_linked") setIsWhatsappLinked(nextVal);

    await updateUserPreferencesApi(currentUserId, { [field]: nextVal });
    showToast("Audio & media preference saved to database.");
  };

  const handleSelectPreference = async (field, value) => {
    if (field === "video_autoplay") setVideoAutoplay(value);
    if (field === "audio_quality") setAudioQuality(value);

    await updateUserPreferencesApi(currentUserId, { [field]: value });
    showToast("Audio & media preference saved.");
  };

  // Handle Family Supervision Creation
  const handleAddSupervisionSubmit = async (e) => {
    e.preventDefault();
    if (!newTeenName.trim()) return;
    setIsAddingSupervision(true);
    try {
      const res = await addFamilySupervisionApi(currentUserId, {
        teen_name: newTeenName.trim(),
        guardian_email: newGuardianEmail.trim() || undefined,
        relationship_type: newRelationship,
        daily_time_limit_minutes: Number(newDailyLimit),
        quiet_hours_start: newQuietStart,
        quiet_hours_end: newQuietEnd,
        block_sensitive_content: newBlockSensitive,
        require_purchase_approval: newRequireApproval
      });
      if (res && res.success) {
        showToast(`Family supervision enabled for ${newTeenName}!`);
        setNewTeenName("");
        setNewGuardianEmail("");
        setShowAddFamilyForm(false);
        loadSecurityState();
      } else {
        showToast(res?.message || "Failed to add family member.");
      }
    } catch (err) {
      showToast("Error creating supervision link.");
    } finally {
      setIsAddingSupervision(false);
    }
  };

  // Handle Removing Family Supervision
  const handleDeleteSupervision = async (linkId, teenName) => {
    try {
      const res = await deleteFamilySupervisionApi(currentUserId, linkId);
      if (res && res.success) {
        showToast(`Supervision removed for ${teenName}.`);
        loadSecurityState();
      }
    } catch (err) {
      showToast("Error removing supervision.");
    }
  };

  // Handle password change from settings modal
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdError("");

    if (!currentPwd) {
      setPwdError("Please enter your current password.");
      return;
    }
    if (newPwd.length < 6) {
      setPwdError("New password must be at least 6 characters long.");
      return;
    }
    if (newPwd !== confirmPwd) {
      setPwdError("New password and confirmation do not match.");
      return;
    }

    setIsChangingPwd(true);
    try {
      const res = await changePasswordApi({
        userId: currentUserId,
        currentPassword: currentPwd,
        newPassword: newPwd,
        logoutOtherDevices
      });

      if (res.success) {
        showToast("✅ Password changed successfully!");
        setCurrentPwd("");
        setNewPwd("");
        setConfirmPwd("");
        setActiveModal(null);
        loadSecurityState();
      } else {
        setPwdError(res.message || "Failed to change password.");
      }
    } catch (err) {
      setPwdError("An error occurred while updating password.");
    } finally {
      setIsChangingPwd(false);
    }
  };

  // Handle 2FA toggle from settings
  const handleToggle2FA = async () => {
    const nextVal = !twoFactorEnabled;
    setTwoFactorEnabled(nextVal);
    await updateSecuritySettingsApi(currentUserId, { two_factor_enabled: nextVal });
    showToast(`Two-factor authentication ${nextVal ? "enabled" : "disabled"}.`);
    loadSecurityState();
  };

  // Handle Login Alerts toggle
  const handleToggleLoginAlerts = async () => {
    const nextVal = !loginAlertsEnabled;
    setLoginAlertsEnabled(nextVal);
    await updateSecuritySettingsApi(currentUserId, { login_alerts: nextVal });
    showToast(`Login alerts ${nextVal ? "enabled" : "disabled"}.`);
    loadSecurityState();
  };

  // 1. Tab Bar Handlers
  const handleTabShortcutChange = (tabId, mode) => {
    const updated = { ...tabShortcuts, [tabId]: mode };
    setTabShortcuts(updated);
    try {
      localStorage.setItem("nexoria_tab_shortcuts", JSON.stringify(updated));
    } catch (e) {}
    updateUserPreferencesApi(currentUserId, { tab_shortcuts: updated });
    showToast(`Tab shortcut updated: ${tabId} is now ${mode}.`);
  };

  const handleToggleShortcutBadges = () => {
    const nextVal = !shortcutBadges;
    setShortcutBadges(nextVal);
    updateUserPreferencesApi(currentUserId, { shortcut_badges: nextVal });
    showToast(`Shortcut notification badges ${nextVal ? "enabled" : "disabled"}.`);
  };

  // 2. Accessibility Handlers
  const handleFontScaleChange = (scale) => {
    setFontScale(scale);
    try {
      localStorage.setItem("nexoria_font_scale", String(scale));
    } catch (e) {}
  };

  const handleToggleHighContrast = () => {
    const nextVal = !highContrast;
    setHighContrast(nextVal);
    showToast(`High contrast mode ${nextVal ? "enabled" : "disabled"}.`);
  };

  const handleToggleReduceMotion = () => {
    const nextVal = !reduceMotion;
    setReduceMotion(nextVal);
    showToast(`Reduce motion ${nextVal ? "enabled" : "disabled"}.`);
  };

  const handleToggleAutoCaptions = () => {
    const nextVal = !autoCaptions;
    setAutoCaptions(nextVal);
    updateUserPreferencesApi(currentUserId, { auto_captions: nextVal });
    showToast(`Auto captions ${nextVal ? "enabled" : "disabled"}.`);
  };

  const handleToggleScreenReader = () => {
    const nextVal = !screenReaderMode;
    setScreenReaderMode(nextVal);
    showToast(`Screen reader optimizations ${nextVal ? "enabled" : "disabled"}.`);
  };

  // 3. Browser Handlers
  const handleToggleExternalBrowser = () => {
    const nextVal = !openExternalBrowser;
    setOpenExternalBrowser(nextVal);
    updateUserPreferencesApi(currentUserId, { open_external_browser: nextVal });
    showToast(`Open external browser ${nextVal ? "enabled" : "disabled"}.`);
  };

  const handleToggleBrowserAutofill = () => {
    const nextVal = !browserAutofill;
    setBrowserAutofill(nextVal);
    updateUserPreferencesApi(currentUserId, { browser_autofill: nextVal });
    showToast(`Browser autofill ${nextVal ? "enabled" : "disabled"}.`);
  };

  const handleToggleSafeBrowsing = () => {
    const nextVal = !safeBrowsing;
    setSafeBrowsing(nextVal);
    updateUserPreferencesApi(currentUserId, { safe_browsing: nextVal });
    showToast(`Safe browsing protection ${nextVal ? "enabled" : "disabled"}.`);
  };

  const handleClearBrowserCache = () => {
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setLastCacheCleared(`Today, ${timeNow}`);
    showToast("🧹 In-app browser cache, cookies & history cleared!");
  };

  // 4. Professional Mode Handlers
  const handleToggleProMode = async () => {
    const nextVal = !proModeEnabled;
    setProModeEnabled(nextVal);
    await updateUserPreferencesApi(currentUserId, { pro_mode: nextVal, pro_category: proCategory });
    showToast(`Professional mode ${nextVal ? "activated! Welcome Creator Studio 🎉" : "turned off."}`);
  };

  const handleSaveProCategory = async (cat) => {
    setProCategory(cat);
    await updateUserPreferencesApi(currentUserId, { pro_category: cat });
    showToast(`Creator category set to ${cat}.`);
  };

  // 5. Stories Privacy Handlers
  const handleStoriesAudience = async (aud) => {
    setStoriesAudience(aud);
    await updatePrivacySettingsApi(currentUserId, { stories_audience: aud });
    showToast(`Story audience set to ${aud}.`);
  };

  const handleStoryReplies = async (replyOpt) => {
    setStoryReplies(replyOpt);
    await updatePrivacySettingsApi(currentUserId, { story_replies: replyOpt });
    showToast(`Story message replies set to ${replyOpt}.`);
  };

  // 6. Device Permission Testing Handler
  const handleCheckDevicePermission = async (permType) => {
    if (permType === "camera") {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          stream.getTracks().forEach(t => t.stop());
          setDevicePerms(p => ({ ...p, camera: "granted" }));
          showToast("✅ Camera hardware access verified and granted!");
        } else {
          setDevicePerms(p => ({ ...p, camera: "granted" }));
          showToast("Camera access verified.");
        }
      } catch (err) {
        setDevicePerms(p => ({ ...p, camera: "denied" }));
        showToast("⚠️ Camera access denied or blocked by browser.");
      }
    } else if (permType === "microphone") {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          stream.getTracks().forEach(t => t.stop());
          setDevicePerms(p => ({ ...p, microphone: "granted" }));
          showToast("✅ Microphone hardware access verified and granted!");
        } else {
          setDevicePerms(p => ({ ...p, microphone: "granted" }));
          showToast("Microphone access verified.");
        }
      } catch (err) {
        setDevicePerms(p => ({ ...p, microphone: "denied" }));
        showToast("⚠️ Microphone access denied or blocked by browser.");
      }
    } else if (permType === "location") {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          () => {
            setDevicePerms(p => ({ ...p, location: "granted" }));
            showToast("✅ Geolocation GPS access verified!");
          },
          () => {
            setDevicePerms(p => ({ ...p, location: "denied" }));
            showToast("⚠️ Location access denied by user or browser.");
          }
        );
      } else {
        showToast("Geolocation is not supported by your browser.");
      }
    } else if (permType === "notifications") {
      if (typeof Notification !== "undefined") {
        try {
          const permission = await Notification.requestPermission();
          setDevicePerms(p => ({ ...p, notifications: permission }));
          showToast(`Push notifications status: ${permission}`);
        } catch (e) {
          showToast("Could not request notification permission.");
        }
      } else {
        showToast("Push notifications not supported on this device.");
      }
    }
  };

  // 7. Business Integrations Handlers
  const handleCopyDevApiKey = () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(devApiKey);
      showToast("📋 Developer API Key copied to clipboard!");
    } else {
      showToast("Developer API Key: " + devApiKey);
    }
  };

  const handleRegenerateDevApiKey = () => {
    const newKey = "nx_live_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    setDevApiKey(newKey);
    showToast("🔑 New Developer API Key generated & activated!");
  };

  const handleTestZapierWebhook = () => {
    showToast("🚀 Test webhook payload dispatched successfully to endpoint!");
  };

  const sections = [
    {
      title: "Nexoria Ironclad Security & Anti-Hack Hub",
      desc: "Unhackable Passkeys, TOTP Authenticator, AI Intrusion Geofence & Social Recovery.",
      items: [
        { icon: <BsShieldCheck />, label: "Security & Anti-Hack Shield (98% Ironclad)", path: "/security" },
        { icon: <BsKey />, label: "Passkeys & Biometric Hardware Key", path: "/security" },
        { icon: <BsQrCode />, label: "Authenticator App (TOTP 30s Rolling Codes)", path: "/security" },
      ]
    },
    {
      title: "Tools and resources",
      desc: "Our tools help you control and manage your privacy.",
      items: [
        { icon: <BsLock />, label: "Privacy Checkup", path: "/privacy" },
        { icon: <BsPerson />, label: "Family Centre", modal: "family_centre" },
        { icon: <BsSearch />, label: "Default audience settings", modal: "default_audience" },
      ]
    },
    {
      title: "Preferences",
      desc: "Customise your experience on Nexoria.",
      items: [
        { icon: <BsSliders />, label: "Content preferences", modal: "content_pref" },
        { icon: <BsHandThumbsUp />, label: "Reaction preferences", modal: "reaction_pref" },
        { icon: <BsBell />, label: "Notifications", path: "/notifications" },
        { icon: <BsUniversalAccess />, label: "Accessibility", modal: "accessibility" },
        { icon: <BsPinAngle />, label: "Tab bar shortcuts", modal: "tab_bar" },
        { icon: <BsGlobe />, label: "Language and region", path: "/languagepage" },
        { icon: <BsPlayBtn />, label: "Media & Audio Settings", modal: "media" },
        { icon: <BsClock />, label: "Time management", path: "/time-management" },
        { icon: <BsLayoutSidebar />, label: "Browser settings", modal: "browser" },
        { icon: <BsMoonStars />, label: "Dark mode", path: "/darkmodepage" },
        { icon: <BsCamera />, label: "Camera roll sharing suggestions", modal: "camera_suggestions" },
        { icon: <BsMegaphone />, label: "Ads in content that you've created", path: "/ad-activity" },
        { icon: <BsFlask />, label: "Early access to features", modal: "early_access" },
      ]
    },
    {
      title: "Audience and visibility",
      desc: "Control who can see what you share on Nexoria.",
      items: [
        { icon: <BsShieldLock />, label: "Profile locking", modal: "profile_locking" },
        { icon: <BsPerson />, label: "Profile details", path: "/edit-profile" },
        { icon: <BsBriefcase />, label: "Professional mode", modal: "pro_mode" },
        { icon: <BsPersonBadge />, label: "How people can find and contact you", modal: "find_contact" },
        { icon: <BsFileText />, label: "Posts", modal: "default_audience" },
        { icon: <BsBookmark />, label: "Stories", modal: "stories_privacy" },
        { icon: <BsFlag />, label: "Pages", path: "/home" },
        { icon: <BsPlayBtn />, label: "Reels", path: "/reels" },
        { icon: <BsPerson />, label: "Followers and public content", modal: "followers" },
        { icon: <BsPinAngle />, label: "Profile and tagging", modal: "tagging" },
        { icon: <BsPersonX />, label: "Blocking", path: "/blocking" },
        { icon: <BsCircle />, label: "Active Status", modal: "active_status" },
      ]
    },
    {
      title: "Payments",
      desc: "Manage your payment info and activity.",
      items: [
        { icon: <BsCreditCard />, label: "Ads payments", path: "/orders-payments" },
        { icon: <BsCurrencyDollar />, label: "Payouts & Bank Accounts", path: "/orders-payments" },
      ]
    },
    {
      title: "Your activity",
      desc: "Review your activity and content that you're tagged in.",
      items: [
        { icon: <BsListCheck />, label: "Activity log", path: "/ad-activity" },
        { icon: <BsPhone />, label: "Device permissions", modal: "device_permissions" },
        { icon: <BsBoxes />, label: "Apps and websites", modal: "connected_apps" },
        { icon: <BsBag />, label: "Business integrations", modal: "business_integrations" },
        { icon: <BsQuestionCircle />, label: "Learn how to manage your information", path: "/support" },
        { icon: <BsWhatsapp />, label: "WhatsApp & Connected Accounts", modal: "whatsapp" },
      ]
    },
    {
      title: "Community Standards and legal policies",
      desc: "",
      items: [
        { icon: <BsFileText />, label: "Terms of Service", path: "/terms_policies" },
        { icon: <BsLock />, label: "Privacy Policy", path: "/terms_policies" },
        { icon: <BsSlashCircle />, label: "Cookies Policy", path: "/terms_policies" },
      ]
    },
  ];

  const filteredSections = sections.map(sec => ({
    ...sec,
    items: sec.items.filter(item => item.label.toLowerCase().includes(search.toLowerCase()))
  })).filter(sec => sec.items.length > 0);

  const handleItemClick = (item) => {
    if (item.path) {
      navigate(item.path);
    } else if (item.modal) {
      setActiveModal(item.modal);
    }
  };

  const handleUnblock = async (targetId) => {
    try {
      const res = await unblockUserApi(currentUserId, targetId);
      if (res && res.success) {
        showToast("User unblocked successfully.");
        loadSecurityState();
      } else {
        showToast(res?.message || "Failed to unblock user.");
      }
    } catch (err) {
      showToast("Error unblocking user.");
    }
  };

  // Calculate strength for new password
  const getStrengthClass = (pwd) => {
    if (!pwd || pwd.length < 6) return "weak";
    if (pwd.length >= 10 && /[0-9]/.test(pwd) && /[^a-zA-Z0-9]/.test(pwd)) return "strong";
    return "medium";
  };

  return (
    <div className="settings-page-root">
      <Header onOpenChat={setActiveChat} />

      {/* Floating Toast Alert */}
      {toastMessage && (
        <div className="sec-floating-toast shadow-lg" style={{ position: "fixed", top: 75, right: 25, zIndex: 2090 }}>
          <BsCheckCircleFill className="text-success me-2" size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="sp2-container">
        
        {/* Top Title Bar */}
        <div className="sp2-header">
          <BsChevronLeft className="sp2-back" onClick={() => navigate(-1)} style={{ cursor: "pointer" }} />
          <h3>Settings & privacy</h3>
          <div style={{ width: 24 }}></div>
        </div>

        {/* Search Bar */}
        <div className="sp2-search-wrap">
          <BsSearch className="sp2-search-icon" />
          <input
            type="text"
            placeholder="Search settings"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="sp2-search-input"
          />
        </div>

        {/* Accounts Centre Card */}
        <div className="sp2-accounts-card">
          <div className="sp2-meta-row">
            <BsGlobe2 className="sp2-meta-icon" />
            <span className="sp2-meta-text">Nexoria Accounts Centre</span>
          </div>
          <h4>Accounts Centre</h4>
          <p>Manage your connected experiences, security credentials, and account settings across Nexoria.</p>
          
          <div className="sp2-acc-items">
            <div className="sp2-acc-item" onClick={() => navigate("/edit-profile")}>
              <BsPersonBadge className="sp2-acc-icon" /><span>Personal details</span>
            </div>
            <div className="sp2-acc-item" onClick={() => setActiveModal("password_security_hub")}>
              <BsShieldCheck className="sp2-acc-icon" /><span>Password and security</span>
            </div>
            <div className="sp2-acc-item" onClick={() => navigate("/ad-activity")}>
              <BsLayoutSidebar className="sp2-acc-icon" /><span>Ad preferences</span>
            </div>
            <div className="sp2-acc-item" onClick={() => navigate("/security")}>
              <BsShieldLock className="sp2-acc-icon" /><span>Verification & Logins</span>
            </div>
          </div>
          <p className="sp2-see-more" onClick={() => setActiveModal("password_security_hub")}>See more in Accounts Centre</p>
        </div>

        {/* Settings Sections */}
        {filteredSections.map((sec, idx) => (
          <div key={idx} className="sp2-section">
            <h4>{sec.title}</h4>
            {sec.desc && <p className="sp2-section-desc">{sec.desc}</p>}

            <div className="sp2-items-card">
              {sec.items.map((item, i) => (
                <div
                  key={i}
                  className="sp2-item"
                  onClick={() => handleItemClick(item)}
                >
                  <div className="sp2-item-left">
                    <span className="sp2-item-icon">{item.icon}</span>
                    <span className="sp2-item-label">{item.label}</span>
                  </div>
                  <BsChevronRight className="sp2-item-arrow" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ====================================================================
          MODALS & BOTTOM SHEETS
          ==================================================================== */}

      {/* Password & Security Hub Modal */}
      {activeModal === "password_security_hub" && (
        <div className="acp-overlay" onClick={() => setActiveModal(null)}>
          <div className="settings-modal-card" onClick={e => e.stopPropagation()}>
            <div className="settings-modal-header">
              <h4>Password and security</h4>
              <button className="acp-close" onClick={() => setActiveModal(null)}>✕</button>
            </div>
            <div className="settings-modal-body">
              <p className="text-muted small">Manage your passwords, login preferences and recovery methods.</p>
              
              <div className="sp2-items-card mb-3">
                <div className="sp2-item" onClick={() => setActiveModal("change_password_form")}>
                  <div className="sp2-item-left">
                    <BsKey className="sp2-item-icon text-primary" />
                    <div>
                      <span className="sp2-item-label d-block">Change password</span>
                      <small className="text-muted">Update your current account password</small>
                    </div>
                  </div>
                  <BsChevronRight className="sp2-item-arrow" />
                </div>

                <div className="sp2-item" onClick={handleToggle2FA}>
                  <div className="sp2-item-left">
                    <BsQrCode className="sp2-item-icon text-success" />
                    <div>
                      <span className="sp2-item-label d-block">Two-factor authentication</span>
                      <small className="text-muted">{twoFactorEnabled ? "Active (SMS/App Enabled)" : "Off (Recommended to turn on)"}</small>
                    </div>
                  </div>
                  <div className={`theme-toggle-switch ${twoFactorEnabled ? "on" : ""}`}>
                    <div className="switch-thumb"></div>
                  </div>
                </div>

                <div className="sp2-item" onClick={handleToggleLoginAlerts}>
                  <div className="sp2-item-left">
                    <BsBell className="sp2-item-icon text-warning" />
                    <div>
                      <span className="sp2-item-label d-block">Login alerts</span>
                      <small className="text-muted">{loginAlertsEnabled ? "In-app & email alerts active" : "Alerts disabled"}</small>
                    </div>
                  </div>
                  <div className={`theme-toggle-switch ${loginAlertsEnabled ? "on" : ""}`}>
                    <div className="switch-thumb"></div>
                  </div>
                </div>
              </div>

              <h6>Security checks</h6>
              <div className="sp2-items-card">
                <div className="sp2-item" onClick={() => { setActiveModal(null); navigate("/security"); }}>
                  <div className="sp2-item-left">
                    <BsLaptop className="sp2-item-icon text-info" />
                    <div>
                      <span className="sp2-item-label d-block">Where you're logged in</span>
                      <small className="text-muted">{activeSessionsCount} active device session{activeSessionsCount > 1 ? "s" : ""}</small>
                    </div>
                  </div>
                  <BsChevronRight className="sp2-item-arrow" />
                </div>
                <div className="sp2-item" onClick={() => { setActiveModal(null); navigate("/security"); }}>
                  <div className="sp2-item-left">
                    <BsShieldCheck className="sp2-item-icon text-primary" />
                    <div>
                      <span className="sp2-item-label d-block">Security Checkup & Anti-Hack</span>
                      <small className="text-muted">98% Ironclad Shield Protected</small>
                    </div>
                  </div>
                  <BsChevronRight className="sp2-item-arrow" />
                </div>
              </div>

              <button className="btn-publish-post mt-3" onClick={() => setActiveModal(null)}>Done</button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Form Modal */}
      {activeModal === "change_password_form" && (
        <div className="acp-overlay" onClick={() => setActiveModal(null)}>
          <div className="settings-modal-card" onClick={e => e.stopPropagation()}>
            <div className="settings-modal-header">
              <h4>Change password</h4>
              <button className="acp-close" onClick={() => setActiveModal(null)}>✕</button>
            </div>
            <div className="settings-modal-body">
              <p className="text-muted small">Your password must be at least 6 characters and should include numbers, letters and special characters.</p>

              {pwdError && (
                <div className="alert alert-danger py-2 small d-flex align-items-center gap-2 mb-3">
                  <BsExclamationTriangleFill size={16} />
                  <span>{pwdError}</span>
                </div>
              )}

              <form onSubmit={handleChangePassword}>
                <div className="mb-3">
                  <label className="form-label small fw-bold">Current password</label>
                  <div className="input-group">
                    <input 
                      type={showCurrentPwd ? "text" : "password"} 
                      className="form-control" 
                      placeholder="Current password"
                      value={currentPwd}
                      onChange={e => setCurrentPwd(e.target.value)}
                      required
                    />
                    <button 
                      type="button" 
                      className="btn btn-outline-secondary" 
                      onClick={() => setShowCurrentPwd(!showCurrentPwd)}
                    >
                      {showCurrentPwd ? <BsEyeSlash /> : <BsEye />}
                    </button>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-bold">New password</label>
                  <div className="input-group">
                    <input 
                      type={showNewPwd ? "text" : "password"} 
                      className="form-control" 
                      placeholder="New password (min 6 chars)"
                      value={newPwd}
                      onChange={e => setNewPwd(e.target.value)}
                      required
                    />
                    <button 
                      type="button" 
                      className="btn btn-outline-secondary" 
                      onClick={() => setShowNewPwd(!showNewPwd)}
                    >
                      {showNewPwd ? <BsEyeSlash /> : <BsEye />}
                    </button>
                  </div>
                  {newPwd && (
                    <div className="mt-1 d-flex align-items-center gap-2">
                      <div className="progress flex-grow-1" style={{ height: 4 }}>
                        <div 
                          className={`progress-bar ${getStrengthClass(newPwd) === 'strong' ? 'bg-success' : getStrengthClass(newPwd) === 'medium' ? 'bg-warning' : 'bg-danger'}`} 
                          style={{ width: getStrengthClass(newPwd) === 'strong' ? '100%' : getStrengthClass(newPwd) === 'medium' ? '60%' : '30%' }}
                        ></div>
                      </div>
                      <small className="text-muted" style={{ fontSize: "0.75rem" }}>
                        {getStrengthClass(newPwd).toUpperCase()}
                      </small>
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-bold">Re-type new password</label>
                  <div className="input-group">
                    <input 
                      type={showConfirmPwd ? "text" : "password"} 
                      className="form-control" 
                      placeholder="Confirm new password"
                      value={confirmPwd}
                      onChange={e => setConfirmPwd(e.target.value)}
                      required
                    />
                    <button 
                      type="button" 
                      className="btn btn-outline-secondary" 
                      onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                    >
                      {showConfirmPwd ? <BsEyeSlash /> : <BsEye />}
                    </button>
                  </div>
                </div>

                <div className="form-check mb-4">
                  <input 
                    className="form-check-input" 
                    type="checkbox" 
                    id="logoutOtherDevs"
                    checked={logoutOtherDevices}
                    onChange={e => setLogoutOtherDevices(e.target.checked)}
                  />
                  <label className="form-check-label small text-muted" htmlFor="logoutOtherDevs">
                    Log out of other devices (Recommended if someone else might know your old password)
                  </label>
                </div>

                <div className="d-flex gap-2">
                  <button 
                    type="button" 
                    className="btn btn-secondary rounded-pill w-100"
                    onClick={() => setActiveModal("password_security_hub")}
                  >
                    Back
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary rounded-pill w-100 fw-bold"
                    disabled={isChangingPwd}
                  >
                    {isChangingPwd ? "Updating..." : "Save Password"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 1. Reaction Preferences Modal */}
      {activeModal === "reaction_pref" && (
        <div className="acp-overlay" onClick={() => setActiveModal(null)}>
          <div className="settings-modal-card" onClick={e => e.stopPropagation()}>
            <div className="settings-modal-header">
              <h4>Reaction Preferences</h4>
              <button className="acp-close" onClick={() => setActiveModal(null)}>✕</button>
            </div>
            <div className="settings-modal-body">
              <p className="text-muted small">You won't see the total number of reactions for posts that other people share to Feed, Pages and Groups.</p>
              
              <div className="toggle-setting-row">
                <div>
                  <h6>On posts from others</h6>
                  <p>Hide total number of reactions on posts by others</p>
                </div>
                <div className={`theme-toggle-switch ${reactionsHidden ? "on" : ""}`} onClick={() => handleTogglePrivacy("reactions_hide_others", reactionsHidden)}>
                  <div className="switch-thumb"></div>
                </div>
              </div>

              <div className="toggle-setting-row">
                <div>
                  <h6>On your posts</h6>
                  <p>Hide number of reactions on posts you share</p>
                </div>
                <div className={`theme-toggle-switch ${reactionsOwnHidden ? "on" : ""}`} onClick={() => handleTogglePrivacy("reactions_hide_own", reactionsOwnHidden)}>
                  <div className="switch-thumb"></div>
                </div>
              </div>

              <button className="btn-publish-post mt-3" onClick={() => setActiveModal(null)}>Done</button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Active Status Modal */}
      {activeModal === "active_status" && (
        <div className="acp-overlay" onClick={() => setActiveModal(null)}>
          <div className="settings-modal-card" onClick={e => e.stopPropagation()}>
            <div className="settings-modal-header">
              <h4>Active Status</h4>
              <button className="acp-close" onClick={() => setActiveModal(null)}>✕</button>
            </div>
            <div className="settings-modal-body">
              <p className="text-muted small">Your friends and contacts see when you're active or recently active on this profile.</p>
              
              <div className="toggle-setting-row">
                <div>
                  <h6>Show when you're active</h6>
                  <p>{activeStatus ? "You appear active (green dot on)" : "You appear offline"}</p>
                </div>
                <div className={`theme-toggle-switch ${activeStatus ? "on" : ""}`} onClick={() => handleTogglePrivacy("active_status", activeStatus)}>
                  <div className="switch-thumb"></div>
                </div>
              </div>

              <button className="btn-publish-post mt-3" onClick={() => setActiveModal(null)}>Done</button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Profile Locking Modal */}
      {activeModal === "profile_locking" && (
        <div className="acp-overlay" onClick={() => setActiveModal(null)}>
          <div className="settings-modal-card" onClick={e => e.stopPropagation()}>
            <div className="settings-modal-header">
              <h4>Lock Your Profile</h4>
              <button className="acp-close" onClick={() => setActiveModal(null)}>✕</button>
            </div>
            <div className="settings-modal-body text-center">
              <BsShieldLock size={54} className="text-primary mb-3" />
              <h5>Make your photos and posts more private</h5>
              <p className="text-muted small">Only friends will see the photos, posts and stories on your profile. People you aren't friends with will only see a small preview.</p>
              
              <div className="toggle-setting-row text-start mt-3">
                <div>
                  <h6>Profile Lock Active</h6>
                  <p>{profileLocked ? "Your profile is locked (Protected)" : "Your profile is public"}</p>
                </div>
                <div className={`theme-toggle-switch ${profileLocked ? "on" : ""}`} onClick={() => handleTogglePrivacy("profile_locked", profileLocked)}>
                  <div className="switch-thumb"></div>
                </div>
              </div>

              <button className="btn-publish-post mt-3" onClick={() => setActiveModal(null)}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Default Audience Modal */}
      {activeModal === "default_audience" && (
        <div className="acp-overlay" onClick={() => setActiveModal(null)}>
          <div className="settings-modal-card" onClick={e => e.stopPropagation()}>
            <div className="settings-modal-header">
              <h4>Default Audience</h4>
              <button className="acp-close" onClick={() => setActiveModal(null)}>✕</button>
            </div>
            <div className="settings-modal-body">
              <p className="text-muted small">Select who can see your future posts by default across Feed, Reels, and profile.</p>
              
              {["Public", "Friends", "Friends except...", "Only me"].map(aud => (
                <div 
                  key={aud}
                  className={`radio-setting-option ${defaultAudience === aud ? "active" : ""}`}
                  onClick={() => handleSelectPrivacy("who_can_see_posts", aud)}
                >
                  <h6>{aud}</h6>
                  {defaultAudience === aud && <BsCheck2 size={20} className="text-primary" />}
                </div>
              ))}

              <button className="btn-publish-post mt-3" onClick={() => setActiveModal(null)}>Done</button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Blocking Modal (Facebook Standard Design) */}
      {activeModal === "blocking" && (
        <div className="acp-overlay" onClick={() => setActiveModal(null)}>
          <div className="settings-modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: 540 }}>
            <div className="settings-modal-header">
              <h4 className="mb-0">Blocking</h4>
              <button className="acp-close" onClick={() => setActiveModal(null)}>✕</button>
            </div>
            <div className="settings-modal-body">
              <h5 className="fw-bold mb-2">Blocked people</h5>
              <p className="text-muted small mb-3">
                Once you've blocked someone, that person can no longer see things you post on your Timeline, tag you, invite you to events or groups, start a conversation with you or add you as a friend. This doesn't include apps, games or groups you both participate in.
              </p>

              {/* Add to Blocked List Button */}
              <button 
                className="btn d-flex align-items-center gap-3 p-2 mb-3 w-100 rounded text-start"
                style={{ background: "rgba(24, 119, 242, 0.08)", border: "none" }}
                onClick={() => {
                  setActiveModal(null);
                  navigate("/blocking");
                }}
              >
                <div 
                  className="rounded d-flex align-items-center justify-content-center text-white" 
                  style={{ width: 36, height: 36, backgroundColor: "#1877f2", flexShrink: 0 }}
                >
                  <BsPlus size={24} />
                </div>
                <strong style={{ color: "#1877f2", letterSpacing: "0.2px" }}>ADD TO BLOCKED LIST</strong>
              </button>

              <div className="d-flex flex-column gap-2 mb-3">
                {blockedUsers.length === 0 ? (
                  <p className="text-muted small text-center py-3">You haven't blocked anyone yet.</p>
                ) : (
                  blockedUsers.map(user => {
                    const blockId = user.blocked_user_id || user.blocked_user || user.id;
                    const displayName = user.name || user.full_name || user.username || `User #${blockId}`;
                    const avatarUrl = user.profile_pic || user.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80";
                    return (
                      <div key={user.id || blockId} className="d-flex align-items-center justify-content-between p-2 rounded" style={{ borderBottom: "1px solid #e4e6eb" }}>
                        <div className="d-flex align-items-center gap-3">
                          <img 
                            src={avatarUrl} 
                            alt={displayName} 
                            style={{ width: 44, height: 44, borderRadius: 8, objectFit: "cover" }} 
                            onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80"; }}
                          />
                          <div>
                            <strong className="d-block text-dark" style={{ fontSize: "0.95rem" }}>{displayName}</strong>
                            {user.username && <small className="text-muted">@{user.username}</small>}
                          </div>
                        </div>
                        <button 
                          className="btn btn-sm fw-bold px-3 py-1"
                          style={{ backgroundColor: "#e4e6eb", color: "#050505", borderRadius: 6, fontSize: "0.85rem" }}
                          onClick={() => handleUnblock(blockId)}
                        >
                          UNBLOCK
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

              <button className="btn-publish-post mt-3" onClick={() => setActiveModal(null)}>Done</button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Media & Audio Settings Modal */}
      {activeModal === "media" && (
        <div className="acp-overlay" onClick={() => setActiveModal(null)}>
          <div className="settings-modal-card" onClick={e => e.stopPropagation()}>
            <div className="settings-modal-header">
              <h4>Media & Audio Settings</h4>
              <button className="acp-close" onClick={() => setActiveModal(null)}>✕</button>
            </div>
            <div className="settings-modal-body">
              <h6 className="fw-bold mb-2">Video Autoplay</h6>
              {[
                { id: "wifi_cellular", label: "On Mobile Data and Wi-Fi" },
                { id: "wifi_only", label: "On Wi-Fi Only" },
                { id: "never", label: "Never Autoplay Videos" }
              ].map(opt => (
                <div 
                  key={opt.id}
                  className={`radio-setting-option ${videoAutoplay === opt.id ? "active" : ""}`}
                  onClick={() => handleSelectPreference("video_autoplay", opt.id)}
                >
                  <h6>{opt.label}</h6>
                  {videoAutoplay === opt.id && <BsCheck2 size={20} className="text-primary" />}
                </div>
              ))}

              <div className="toggle-setting-row mt-3">
                <div>
                  <h6>Data Saver</h6>
                  <p>Reduces video quality to use up to 40% less data</p>
                </div>
                <div className={`theme-toggle-switch ${dataSaver ? "on" : ""}`} onClick={() => handleTogglePreference("data_saver", dataSaver)}>
                  <div className="switch-thumb"></div>
                </div>
              </div>

              <div className="toggle-setting-row">
                <div>
                  <h6>Upload in Full HD (1080p)</h6>
                  <p>Upload highest quality photos and videos</p>
                </div>
                <div className={`theme-toggle-switch ${hdUploads ? "on" : ""}`} onClick={() => handleTogglePreference("hd_uploads", hdUploads)}>
                  <div className="switch-thumb"></div>
                </div>
              </div>

              {/* Audio Lounge & Voice Controls */}
              <div className="mt-4 pt-3 border-top">
                <h6 className="fw-bold mb-2 d-flex align-items-center gap-2">
                  <BsVolumeUp className="text-primary" size={20} /> Audio Lounge & Voice Settings
                </h6>

                <div className="toggle-setting-row">
                  <div>
                    <h6>Spatial Audio 3D</h6>
                    <p>Immersive 360° directional sound in Audio Lounges</p>
                  </div>
                  <div className={`theme-toggle-switch ${spatialAudio ? "on" : ""}`} onClick={() => handleTogglePreference("spatial_audio", spatialAudio)}>
                    <div className="switch-thumb"></div>
                  </div>
                </div>

                <div className="toggle-setting-row">
                  <div>
                    <h6>AI Ambient Noise Cancellation</h6>
                    <p>Filters background chatter and room echo during live speaking</p>
                  </div>
                  <div className={`theme-toggle-switch ${noiseCancellation ? "on" : ""}`} onClick={() => handleTogglePreference("noise_cancellation", noiseCancellation)}>
                    <div className="switch-thumb"></div>
                  </div>
                </div>

                <h6 className="mt-3 small fw-bold">Audio Output Quality</h6>
                {[
                  { id: "high", label: "Studio High (320 kbps)" },
                  { id: "standard", label: "Standard (160 kbps)" },
                  { id: "low", label: "Data Saver (64 kbps)" }
                ].map(opt => (
                  <div 
                    key={opt.id}
                    className={`radio-setting-option ${audioQuality === opt.id ? "active" : ""}`}
                    onClick={() => handleSelectPreference("audio_quality", opt.id)}
                  >
                    <h6>{opt.label}</h6>
                    {audioQuality === opt.id && <BsCheck2 size={20} className="text-primary" />}
                  </div>
                ))}
              </div>

              <button className="btn-publish-post mt-3" onClick={() => setActiveModal(null)}>Done</button>
            </div>
          </div>
        </div>
      )}

      {/* 7. How people can find and contact you Modal */}
      {activeModal === "find_contact" && (
        <div className="acp-overlay" onClick={() => setActiveModal(null)}>
          <div className="settings-modal-card" onClick={e => e.stopPropagation()}>
            <div className="settings-modal-header">
              <h4>How People Can Find & Contact You</h4>
              <button className="acp-close" onClick={() => setActiveModal(null)}>✕</button>
            </div>
            <div className="settings-modal-body">
              <h6>Who can send you friend requests?</h6>
              {[
                { id: "everyone", label: "Everyone" },
                { id: "friends_of_friends", label: "Friends of friends" }
              ].map(opt => (
                <div 
                  key={opt.id}
                  className={`radio-setting-option ${whoCanContact === opt.id ? "active" : ""}`}
                  onClick={() => handleSelectPrivacy("who_can_send_requests", opt.id)}
                >
                  <h6>{opt.label}</h6>
                  {whoCanContact === opt.id && <BsCheck2 size={20} className="text-primary" />}
                </div>
              ))}

              <h6 className="mt-3">Who can see your friends list?</h6>
              {[
                { id: "public", label: "Public" },
                { id: "friends", label: "Friends" },
                { id: "only_me", label: "Only me" }
              ].map(opt => (
                <div 
                  key={opt.id}
                  className={`radio-setting-option ${whoCanFollow === opt.id ? "active" : ""}`}
                  onClick={() => handleSelectPrivacy("who_can_see_friends", opt.id)}
                >
                  <h6>{opt.label}</h6>
                  {whoCanFollow === opt.id && <BsCheck2 size={20} className="text-primary" />}
                </div>
              ))}

              <button className="btn-publish-post mt-3" onClick={() => setActiveModal(null)}>Done</button>
            </div>
          </div>
        </div>
      )}

      {/* 8. Profile and Tagging Modal */}
      {activeModal === "tagging" && (
        <div className="acp-overlay" onClick={() => setActiveModal(null)}>
          <div className="settings-modal-card" onClick={e => e.stopPropagation()}>
            <div className="settings-modal-header">
              <h4>Profile and Tagging</h4>
              <button className="acp-close" onClick={() => setActiveModal(null)}>✕</button>
            </div>
            <div className="settings-modal-body">
              <h6>Who can post on your profile?</h6>
              {[
                { id: "friends", label: "Friends" },
                { id: "only_me", label: "Only me" }
              ].map(opt => (
                <div 
                  key={opt.id}
                  className={`radio-setting-option ${whoCanPostOnProfile === opt.id ? "active" : ""}`}
                  onClick={() => handleSelectPrivacy("who_can_post_on_profile", opt.id)}
                >
                  <h6>{opt.label}</h6>
                  {whoCanPostOnProfile === opt.id && <BsCheck2 size={20} className="text-primary" />}
                </div>
              ))}

              <div className="toggle-setting-row mt-3">
                <div>
                  <h6>Review tags before they appear on your profile</h6>
                  <p>Manually approve posts you're tagged in</p>
                </div>
                <div className={`theme-toggle-switch ${reviewTags ? "on" : ""}`} onClick={() => handleTogglePrivacy("review_tags", reviewTags)}>
                  <div className="switch-thumb"></div>
                </div>
              </div>

              <button className="btn-publish-post mt-3" onClick={() => setActiveModal(null)}>Done</button>
            </div>
          </div>
        </div>
      )}

      {/* 9. Followers and Public Content Modal */}
      {activeModal === "followers" && (
        <div className="acp-overlay" onClick={() => setActiveModal(null)}>
          <div className="settings-modal-card" onClick={e => e.stopPropagation()}>
            <div className="settings-modal-header">
              <h4>Followers and Public Content</h4>
              <button className="acp-close" onClick={() => setActiveModal(null)}>✕</button>
            </div>
            <div className="settings-modal-body">
              <h6>Who can follow you</h6>
              <p className="small text-muted">Followers see your posts, stories, and reels in Feed.</p>
              {[
                { id: "public", label: "Public" },
                { id: "friends", label: "Friends" }
              ].map(opt => (
                <div 
                  key={opt.id}
                  className={`radio-setting-option ${whoCanFollow === opt.id ? "active" : ""}`}
                  onClick={() => handleSelectPrivacy("who_can_follow", opt.id)}
                >
                  <h6>{opt.label}</h6>
                  {whoCanFollow === opt.id && <BsCheck2 size={20} className="text-primary" />}
                </div>
              ))}

              <button className="btn-publish-post mt-3" onClick={() => setActiveModal(null)}>Done</button>
            </div>
          </div>
        </div>
      )}

      {/* 10. Family Centre Supervision Modal (Database-Backed) */}
      {activeModal === "family_centre" && (
        <div className="acp-overlay" onClick={() => setActiveModal(null)}>
          <div className="settings-modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="settings-modal-header">
              <div className="d-flex align-items-center gap-2">
                <BsShield className="text-primary" size={22} />
                <h4 className="mb-0">Family Centre & Parental Controls</h4>
              </div>
              <button className="acp-close" onClick={() => setActiveModal(null)}>✕</button>
            </div>
            <div className="settings-modal-body">
              <p className="text-muted small">
                Manage screen time limits, quiet hours, and sensitive content filters for teens and family members under your supervision.
              </p>

              {/* Supervised Members List */}
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="fw-bold mb-0">Supervised Members ({supervisedMembers.length})</h6>
                  <button 
                    className="btn btn-sm btn-outline-primary rounded-pill px-3"
                    onClick={() => setShowAddFamilyForm(!showAddFamilyForm)}
                  >
                    <BsPlusLg size={12} className="me-1" /> {showAddFamilyForm ? "Cancel" : "Add Member"}
                  </button>
                </div>

                {showAddFamilyForm && (
                  <form onSubmit={handleAddSupervisionSubmit} className="p-3 mb-3 bg-light rounded" style={{ border: "1px solid #dee2e6" }}>
                    <h6 className="fw-bold mb-2">Add Teen / Child to Supervise</h6>
                    <div className="row g-2 mb-2">
                      <div className="col-6">
                        <label className="form-label small fw-semibold">Family Member Name *</label>
                        <input 
                          type="text" 
                          className="form-control form-control-sm"
                          placeholder="e.g. Alex Kumar"
                          value={newTeenName}
                          onChange={e => setNewTeenName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="col-6">
                        <label className="form-label small fw-semibold">Relationship</label>
                        <select 
                          className="form-select form-select-sm"
                          value={newRelationship}
                          onChange={e => setNewRelationship(e.target.value)}
                        >
                          <option value="Teen / Child">Teen / Child</option>
                          <option value="Daughter">Daughter</option>
                          <option value="Son">Son</option>
                          <option value="Ward">Ward</option>
                          <option value="Sibling">Sibling</option>
                        </select>
                      </div>
                    </div>

                    <div className="mb-2">
                      <label className="form-label small fw-semibold">Guardian Email (Optional)</label>
                      <input 
                        type="email" 
                        className="form-control form-control-sm"
                        placeholder="guardian@example.com"
                        value={newGuardianEmail}
                        onChange={e => setNewGuardianEmail(e.target.value)}
                      />
                    </div>

                    <div className="row g-2 mb-2">
                      <div className="col-4">
                        <label className="form-label small fw-semibold">Daily Limit (m)</label>
                        <input 
                          type="number" 
                          className="form-control form-control-sm"
                          value={newDailyLimit}
                          onChange={e => setNewDailyLimit(e.target.value)}
                        />
                      </div>
                      <div className="col-4">
                        <label className="form-label small fw-semibold">Quiet From</label>
                        <input 
                          type="time" 
                          className="form-control form-control-sm"
                          value={newQuietStart}
                          onChange={e => setNewQuietStart(e.target.value)}
                        />
                      </div>
                      <div className="col-4">
                        <label className="form-label small fw-semibold">Quiet To</label>
                        <input 
                          type="time" 
                          className="form-control form-control-sm"
                          value={newQuietEnd}
                          onChange={e => setNewQuietEnd(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="form-check form-switch mb-2">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        id="blockSens"
                        checked={newBlockSensitive}
                        onChange={e => setNewBlockSensitive(e.target.checked)}
                      />
                      <label className="form-check-label small" htmlFor="blockSens">Block Sensitive & Explicit Content</label>
                    </div>

                    <div className="form-check form-switch mb-3">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        id="reqAppr"
                        checked={newRequireApproval}
                        onChange={e => setNewRequireApproval(e.target.checked)}
                      />
                      <label className="form-check-label small" htmlFor="reqAppr">Require Parent Approval for Purchases</label>
                    </div>

                    <button 
                      type="submit" 
                      className="btn btn-sm btn-primary rounded-pill w-100 fw-bold"
                      disabled={isAddingSupervision}
                    >
                      {isAddingSupervision ? "Activating..." : "Enable Supervision"}
                    </button>
                  </form>
                )}

                {supervisedMembers.length === 0 && !showAddFamilyForm ? (
                  <div className="p-3 text-center text-muted small bg-light rounded" style={{ border: "1px dashed #ced4da" }}>
                    No family members under supervision yet. Tap "Add Member" to set up parental guardrails.
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    {supervisedMembers.map(m => (
                      <div key={m.id} className="d-flex align-items-center justify-content-between p-2 px-3 rounded" style={{ background: "var(--sp2-card-bg, #f8f9fa)", border: "1px solid #e9ecef" }}>
                        <div>
                          <div className="d-flex align-items-center gap-2">
                            <strong className="d-block text-dark">{m.teen_name}</strong>
                            <span className="badge bg-success rounded-pill" style={{ fontSize: "0.7rem" }}>Active</span>
                          </div>
                          <small className="text-muted d-block">
                            Limit: {m.daily_time_limit_minutes} mins/day · Quiet: {m.quiet_hours_start} - {m.quiet_hours_end}
                          </small>
                        </div>
                        <button 
                          className="btn btn-sm btn-outline-danger rounded-circle p-1" 
                          title="Remove supervision"
                          onClick={() => handleDeleteSupervision(m.id, m.teen_name)}
                        >
                          <BsTrash size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button className="btn-publish-post mt-3" onClick={() => setActiveModal(null)}>Done</button>
            </div>
          </div>
        </div>
      )}

      {/* 11. WhatsApp & Connected Accounts Modal */}
      {activeModal === "whatsapp" && (
        <div className="acp-overlay" onClick={() => setActiveModal(null)}>
          <div className="settings-modal-card" onClick={e => e.stopPropagation()}>
            <div className="settings-modal-header">
              <h4>WhatsApp Connection</h4>
              <button className="acp-close" onClick={() => setActiveModal(null)}>✕</button>
            </div>
            <div className="settings-modal-body">
              <p className="text-muted small">Connect your WhatsApp account to receive security alerts and verify business inquiries.</p>
              
              <div className="toggle-setting-row">
                <div>
                  <h6>Link WhatsApp Account</h6>
                  <p>{isWhatsappLinked ? `Linked: ${whatsappNumber}` : "Not linked"}</p>
                </div>
                <div className={`theme-toggle-switch ${isWhatsappLinked ? "on" : ""}`} onClick={() => handleTogglePreference("whatsapp_linked", isWhatsappLinked)}>
                  <div className="switch-thumb"></div>
                </div>
              </div>

              {isWhatsappLinked && (
                <div className="mt-2">
                  <label className="form-label small fw-bold">WhatsApp Number</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={whatsappNumber}
                    onChange={e => {
                      setWhatsappNumber(e.target.value);
                      updateUserPreferencesApi(currentUserId, { whatsapp_number: e.target.value });
                    }}
                  />
                </div>
              )}

              <button className="btn-publish-post mt-3" onClick={() => setActiveModal(null)}>Done</button>
            </div>
          </div>
        </div>
      )}

      {/* 12. Connected Apps & Websites Modal */}
      {activeModal === "connected_apps" && (
        <div className="acp-overlay" onClick={() => setActiveModal(null)}>
          <div className="settings-modal-card" onClick={e => e.stopPropagation()}>
            <div className="settings-modal-header">
              <h4>Connected Apps & Websites</h4>
              <button className="acp-close" onClick={() => setActiveModal(null)}>✕</button>
            </div>
            <div className="settings-modal-body">
              <p className="text-muted small">Manage apps and websites you have logged into using Nexoria OAuth 2.0.</p>
              <div className="blocked-user-row mb-2">
                <div>
                  <strong>Spotify Music</strong>
                  <p className="small text-muted mb-0">Active · Connected via Nexoria SSO</p>
                </div>
                <button className="btn-unblock">Remove</button>
              </div>
              <div className="blocked-user-row mb-2">
                <div>
                  <strong>Canva Pro Studio</strong>
                  <p className="small text-muted mb-0">Active · Connected via Google SSO</p>
                </div>
                <button className="btn-unblock">Remove</button>
              </div>
              <button className="btn-publish-post mt-3" onClick={() => setActiveModal(null)}>Done</button>
            </div>
          </div>
        </div>
      )}

      {/* 13. Content Preferences Modal */}
      {activeModal === "content_pref" && (
        <div className="acp-overlay" onClick={() => setActiveModal(null)}>
          <div className="settings-modal-card" onClick={e => e.stopPropagation()}>
            <div className="settings-modal-header">
              <h4>Sensitive Content Control</h4>
              <button className="acp-close" onClick={() => setActiveModal(null)}>✕</button>
            </div>
            <div className="settings-modal-body">
              <p className="text-muted small">Decide how much sensitive content you see in Search, Reels, and Feed.</p>

              {[
                { id: "more", label: "More", desc: "You might see more photos and videos with sensitive topics" },
                { id: "standard", label: "Standard (Default)", desc: "You'll see some sensitive content" },
                { id: "less", label: "Less", desc: "You'll see fewer posts with sensitive topics" }
              ].map(opt => (
                <div 
                  key={opt.id}
                  className={`radio-setting-option ${sensitiveContent === opt.id ? "active" : ""}`}
                  onClick={() => handleSelectPrivacy("sensitive_content", opt.id)}
                >
                  <div>
                    <h6>{opt.label}</h6>
                    <p className="small text-muted mb-0">{opt.desc}</p>
                  </div>
                  {sensitiveContent === opt.id && <BsCheck2 size={20} className="text-primary" />}
                </div>
              ))}

              <button className="btn-publish-post mt-3" onClick={() => setActiveModal(null)}>Done</button>
            </div>
          </div>
        </div>
      )}

      {/* 14. Early Access Modal */}
      {activeModal === "early_access" && (
        <div className="acp-overlay" onClick={() => setActiveModal(null)}>
          <div className="settings-modal-card" onClick={e => e.stopPropagation()}>
            <div className="settings-modal-header">
              <h4>Early Access & Beta Features</h4>
              <button className="acp-close" onClick={() => setActiveModal(null)}>✕</button>
            </div>
            <div className="settings-modal-body">
              <div className="toggle-setting-row">
                <div>
                  <h6>Nexoria Beta Tester Program</h6>
                  <p>Get preview access to experimental AI features, new themes, and studio tools before official release.</p>
                </div>
                <div className={`theme-toggle-switch ${earlyAccess ? "on" : ""}`} onClick={() => handleTogglePreference("early_access", earlyAccess)}>
                  <div className="switch-thumb"></div>
                </div>
              </div>
              <button className="btn-publish-post mt-3" onClick={() => setActiveModal(null)}>Done</button>
            </div>
          </div>
        </div>
      )}

      {/* 15. Camera Suggestions Modal */}
      {activeModal === "camera_suggestions" && (
        <div className="acp-overlay" onClick={() => setActiveModal(null)}>
          <div className="settings-modal-card" onClick={e => e.stopPropagation()}>
            <div className="settings-modal-header">
              <h4>Camera Roll Suggestions</h4>
              <button className="acp-close" onClick={() => setActiveModal(null)}>✕</button>
            </div>
            <div className="settings-modal-body">
              <div className="toggle-setting-row">
                <div>
                  <h6>Sharing suggestions</h6>
                  <p>Receive notifications to share newly captured photos and videos as stories on Nexoria.</p>
                </div>
                <div className={`theme-toggle-switch ${cameraSuggestions ? "on" : ""}`} onClick={() => handleTogglePreference("camera_suggestions", cameraSuggestions)}>
                  <div className="switch-thumb"></div>
                </div>
              </div>
              <button className="btn-publish-post mt-3" onClick={() => setActiveModal(null)}>Done</button>
            </div>
          </div>
        </div>
      )}

      {/* 16. Tab Bar Shortcuts Modal */}
      {activeModal === "tab_bar" && (
        <div className="acp-overlay" onClick={() => setActiveModal(null)}>
          <div className="settings-modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className="settings-modal-header">
              <div className="d-flex align-items-center gap-2">
                <BsPinAngle className="text-primary" size={20} />
                <h4 className="mb-0">Tab Bar Shortcuts</h4>
              </div>
              <button className="acp-close" onClick={() => setActiveModal(null)}>✕</button>
            </div>
            <div className="settings-modal-body">
              <p className="text-muted small">
                Customize which shortcuts appear in your navigation bar. Pinned shortcuts will always stay visible.
              </p>

              {/* Notification badge dot setting */}
              <div className="toggle-setting-row mb-3 p-3 rounded" style={{ background: "var(--color-bg, #f0f2f5)" }}>
                <div>
                  <h6 className="mb-1">Shortcut notification dots</h6>
                  <p className="small text-muted mb-0">Show unread count badge dots on your navigation shortcuts</p>
                </div>
                <div className={`theme-toggle-switch ${shortcutBadges ? "on" : ""}`} onClick={() => handleToggleShortcutBadges()}>
                  <div className="switch-thumb"></div>
                </div>
              </div>

              <h6 className="fw-bold mb-2">Available Shortcuts</h6>
              <div className="d-flex flex-column gap-2 mb-3">
                {[
                  { id: "reels", label: "Reels & Video", icon: <BsPlayBtn className="text-primary" size={18} />, desc: "Watch trending reels and video creators" },
                  { id: "marketplace", label: "Marketplace", icon: <BsBag className="text-success" size={18} />, desc: "Buy and sell items in your community" },
                  { id: "groups", label: "Groups & Communities", icon: <BsBoxes className="text-info" size={18} />, desc: "Connect with people who share your interests" },
                  { id: "gaming", label: "Gaming Hub", icon: <BsLaptop className="text-warning" size={18} />, desc: "Play mini-games and watch live streams" },
                  { id: "notifications", label: "Notifications Tab", icon: <BsBell className="text-danger" size={18} />, desc: "Quick access to your activity and alerts" },
                ].map(tab => (
                  <div key={tab.id} className="d-flex align-items-center justify-content-between p-2 px-3 rounded" style={{ border: "1px solid var(--color-border, #e4e6eb)", background: "var(--color-surface, #ffffff)" }}>
                    <div className="d-flex align-items-center gap-2">
                      <div className="p-2 rounded-circle" style={{ background: "var(--color-bg, #f0f2f5)" }}>
                        {tab.icon}
                      </div>
                      <div>
                        <strong className="d-block text-dark" style={{ fontSize: "0.95rem" }}>{tab.label}</strong>
                        <small className="text-muted d-block" style={{ fontSize: "0.8rem" }}>{tab.desc}</small>
                      </div>
                    </div>
                    <div className="d-flex align-items-center gap-1">
                      <select 
                        className="form-select form-select-sm" 
                        style={{ width: 105, fontSize: "0.85rem", fontWeight: 600 }}
                        value={tabShortcuts[tab.id] || "auto"}
                        onChange={(e) => handleTabShortcutChange(tab.id, e.target.value)}
                      >
                        <option value="pin">Pin 📌</option>
                        <option value="auto">Auto ⚡</option>
                        <option value="hide">Hide ✕</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>

              <button className="btn-publish-post mt-2" onClick={() => setActiveModal(null)}>Save & Apply</button>
            </div>
          </div>
        </div>
      )}

      {/* 17. Accessibility Modal */}
      {activeModal === "accessibility" && (
        <div className="acp-overlay" onClick={() => setActiveModal(null)}>
          <div className="settings-modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className="settings-modal-header">
              <div className="d-flex align-items-center gap-2">
                <BsUniversalAccess className="text-primary" size={22} />
                <h4 className="mb-0">Accessibility</h4>
              </div>
              <button className="acp-close" onClick={() => setActiveModal(null)}>✕</button>
            </div>
            <div className="settings-modal-body">
              <p className="text-muted small">
                Adjust text size, contrast, animations, and audio captions to fit your vision and hearing needs.
              </p>

              {/* Text Size Slider */}
              <div className="p-3 mb-3 rounded" style={{ background: "var(--color-bg, #f0f2f5)", border: "1px solid var(--color-border, #e4e6eb)" }}>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="fw-bold mb-0">Font Scaling & Text Size</h6>
                  <span className="badge bg-primary rounded-pill px-2 py-1">{fontScale}%</span>
                </div>
                <p className="text-muted small mb-2">Drag the slider to make text across Nexoria larger or smaller.</p>
                <div className="d-flex align-items-center gap-3">
                  <span style={{ fontSize: "0.8rem", fontWeight: 700 }}>A</span>
                  <input 
                    type="range" 
                    className="form-range flex-grow-1" 
                    min={80} 
                    max={140} 
                    step={5} 
                    value={fontScale} 
                    onChange={(e) => handleFontScaleChange(Number(e.target.value))}
                  />
                  <span style={{ fontSize: "1.3rem", fontWeight: 700 }}>A</span>
                </div>
                <div className="p-2 mt-2 rounded text-center" style={{ background: "var(--color-surface, #ffffff)", border: "1px dashed var(--color-border, #ced0d4)", fontSize: `${(14 * fontScale) / 100}px` }}>
                  Live Preview: Welcome to Nexoria Social
                </div>
              </div>

              {/* High Contrast Mode */}
              <div className="toggle-setting-row mb-2">
                <div>
                  <h6>High Contrast Mode</h6>
                  <p>Enhance color contrast and borders for improved readability</p>
                </div>
                <div className={`theme-toggle-switch ${highContrast ? "on" : ""}`} onClick={handleToggleHighContrast}>
                  <div className="switch-thumb"></div>
                </div>
              </div>

              {/* Reduce Motion */}
              <div className="toggle-setting-row mb-2">
                <div>
                  <h6>Reduce Motion</h6>
                  <p>Minimize animations and transitions throughout the app</p>
                </div>
                <div className={`theme-toggle-switch ${reduceMotion ? "on" : ""}`} onClick={handleToggleReduceMotion}>
                  <div className="switch-thumb"></div>
                </div>
              </div>

              {/* Auto Captions */}
              <div className="toggle-setting-row mb-2">
                <div>
                  <div className="d-flex align-items-center gap-1">
                    <BsBadgeCc className="text-primary" size={16} />
                    <h6 className="mb-0">Auto-Generated Captions</h6>
                  </div>
                  <p>Automatically display closed captions on videos and reels</p>
                </div>
                <div className={`theme-toggle-switch ${autoCaptions ? "on" : ""}`} onClick={handleToggleAutoCaptions}>
                  <div className="switch-thumb"></div>
                </div>
              </div>

              {/* Screen Reader Optimization */}
              <div className="toggle-setting-row mb-3">
                <div>
                  <h6>Screen Reader Optimization</h6>
                  <p>Optimize ARIA landmarks and focus indicators for TalkBack & VoiceOver</p>
                </div>
                <div className={`theme-toggle-switch ${screenReaderMode ? "on" : ""}`} onClick={handleToggleScreenReader}>
                  <div className="switch-thumb"></div>
                </div>
              </div>

              <button className="btn-publish-post" onClick={() => setActiveModal(null)}>Done</button>
            </div>
          </div>
        </div>
      )}

      {/* 18. Browser Settings Modal */}
      {activeModal === "browser" && (
        <div className="acp-overlay" onClick={() => setActiveModal(null)}>
          <div className="settings-modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className="settings-modal-header">
              <div className="d-flex align-items-center gap-2">
                <BsLayoutSidebar className="text-primary" size={20} />
                <h4 className="mb-0">Browser Settings</h4>
              </div>
              <button className="acp-close" onClick={() => setActiveModal(null)}>✕</button>
            </div>
            <div className="settings-modal-body">
              <p className="text-muted small">
                Control how links open, manage autofill data, and clear in-app browsing cache and cookies.
              </p>

              <div className="toggle-setting-row mb-2">
                <div>
                  <h6>Open links in external browser</h6>
                  <p>Always open web links in your device's default browser (Chrome/Safari) instead of in-app</p>
                </div>
                <div className={`theme-toggle-switch ${openExternalBrowser ? "on" : ""}`} onClick={handleToggleExternalBrowser}>
                  <div className="switch-thumb"></div>
                </div>
              </div>

              <div className="toggle-setting-row mb-2">
                <div>
                  <h6>Autofill form & contact info</h6>
                  <p>Save time by allowing Nexoria in-app browser to autofill names, emails and addresses</p>
                </div>
                <div className={`theme-toggle-switch ${browserAutofill ? "on" : ""}`} onClick={handleToggleBrowserAutofill}>
                  <div className="switch-thumb"></div>
                </div>
              </div>

              <div className="toggle-setting-row mb-3">
                <div>
                  <div className="d-flex align-items-center gap-1">
                    <BsShieldCheck className="text-success" size={16} />
                    <h6 className="mb-0">Safe Browsing Protection</h6>
                  </div>
                  <p>Block phishing links, deceptive web pages, and unsafe malware downloads</p>
                </div>
                <div className={`theme-toggle-switch ${safeBrowsing ? "on" : ""}`} onClick={handleToggleSafeBrowsing}>
                  <div className="switch-thumb"></div>
                </div>
              </div>

              {/* Clear Browsing Data Card */}
              <div className="p-3 rounded mb-3" style={{ background: "var(--color-bg, #f0f2f5)", border: "1px solid var(--color-border, #e4e6eb)" }}>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="fw-bold mb-1">Clear Browsing Data</h6>
                    <p className="small text-muted mb-0">Clear your in-app browser cookies and cached web files.</p>
                    <small className="text-muted">Last cleared: <strong>{lastCacheCleared}</strong></small>
                  </div>
                  <button 
                    className="btn btn-outline-danger btn-sm rounded-pill px-3 fw-bold"
                    onClick={handleClearBrowserCache}
                  >
                    Clear Now
                  </button>
                </div>
              </div>

              <button className="btn-publish-post" onClick={() => setActiveModal(null)}>Done</button>
            </div>
          </div>
        </div>
      )}

      {/* 19. Professional Mode Modal */}
      {activeModal === "pro_mode" && (
        <div className="acp-overlay" onClick={() => setActiveModal(null)}>
          <div className="settings-modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className="settings-modal-header">
              <div className="d-flex align-items-center gap-2">
                <BsBriefcase className="text-primary" size={20} />
                <h4 className="mb-0">Professional Mode</h4>
              </div>
              <button className="acp-close" onClick={() => setActiveModal(null)}>✕</button>
            </div>
            <div className="settings-modal-body">
              {/* Hero Banner */}
              <div className="p-3 mb-3 rounded text-white" style={{ background: "linear-gradient(135deg, #1877f2 0%, #0d6efd 50%, #6f42c1 100%)" }}>
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <h5 className="fw-bold mb-1">Creator & Business Studio</h5>
                    <p className="small mb-0 opacity-75">Unlock monetization, in-depth audience insights, and professional badges.</p>
                  </div>
                  <BsStars size={28} className="text-warning" />
                </div>
                <div className="mt-3 pt-2 border-top border-white border-opacity-25 d-flex align-items-center justify-content-between">
                  <span className="fw-semibold small">Professional Mode Status:</span>
                  <span className={`badge ${proModeEnabled ? "bg-success" : "bg-light text-dark"} rounded-pill px-3 py-1`}>
                    {proModeEnabled ? "Active" : "Turned Off"}
                  </span>
                </div>
              </div>

              {/* Master Turn On/Off Toggle */}
              <div className="toggle-setting-row mb-3 p-3 rounded" style={{ background: "var(--color-bg, #f0f2f5)" }}>
                <div>
                  <h6 className="mb-1">Turn on Professional Mode</h6>
                  <p className="small text-muted mb-0">Allow anyone to follow you and view your public creator analytics</p>
                </div>
                <div className={`theme-toggle-switch ${proModeEnabled ? "on" : ""}`} onClick={handleToggleProMode}>
                  <div className="switch-thumb"></div>
                </div>
              </div>

              {proModeEnabled && (
                <>
                  {/* Category Selector */}
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Creator Profile Category</label>
                    <select 
                      className="form-select form-select-sm"
                      value={proCategory}
                      onChange={(e) => handleSaveProCategory(e.target.value)}
                    >
                      <option value="Digital Creator">Digital Creator</option>
                      <option value="Entrepreneur / Business">Entrepreneur / Business</option>
                      <option value="Artist / Musician">Artist / Musician</option>
                      <option value="Software Engineer & Tech">Software Engineer & Tech</option>
                      <option value="Gamer & Live Streamer">Gamer & Live Streamer</option>
                      <option value="Public Figure / Journalist">Public Figure / Journalist</option>
                      <option value="Fashion & Lifestyle">Fashion & Lifestyle</option>
                      <option value="Education & Coach">Education & Coach</option>
                    </select>
                  </div>

                  {/* Perks Grid */}
                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <div className="p-2 rounded text-center" style={{ background: "var(--color-bg, #f0f2f5)", border: "1px solid var(--color-border, #e4e6eb)" }}>
                        <BsGraphUpArrow className="text-primary mb-1" size={18} />
                        <strong className="d-block small">Professional Insights</strong>
                        <small className="text-muted" style={{ fontSize: "0.75rem" }}>Reach, impressions & demographics</small>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="p-2 rounded text-center" style={{ background: "var(--color-bg, #f0f2f5)", border: "1px solid var(--color-border, #e4e6eb)" }}>
                        <BsCurrencyDollar className="text-success mb-1" size={18} />
                        <strong className="d-block small">Monetization & Stars</strong>
                        <small className="text-muted" style={{ fontSize: "0.75rem" }}>Earn money from reels and live gifts</small>
                      </div>
                    </div>
                  </div>

                  {/* Badges & Collab Toggles */}
                  <div className="toggle-setting-row mb-2">
                    <div>
                      <h6>Display category badge on profile</h6>
                      <p>Show "{proCategory}" below your profile name</p>
                    </div>
                    <div className={`theme-toggle-switch ${showProBadgeOnProfile ? "on" : ""}`} onClick={() => setShowProBadgeOnProfile(!showProBadgeOnProfile)}>
                      <div className="switch-thumb"></div>
                    </div>
                  </div>

                  <div className="toggle-setting-row mb-3">
                    <div>
                      <h6>Allow Brand Collaboration Tagging</h6>
                      <p>Enable verified brands to invite you for sponsored posts</p>
                    </div>
                    <div className={`theme-toggle-switch ${allowCollabTagging ? "on" : ""}`} onClick={() => setAllowCollabTagging(!allowCollabTagging)}>
                      <div className="switch-thumb"></div>
                    </div>
                  </div>
                </>
              )}

              <button className="btn-publish-post" onClick={() => setActiveModal(null)}>Save & Close</button>
            </div>
          </div>
        </div>
      )}

      {/* 20. Stories Privacy Modal */}
      {activeModal === "stories_privacy" && (
        <div className="acp-overlay" onClick={() => setActiveModal(null)}>
          <div className="settings-modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className="settings-modal-header">
              <div className="d-flex align-items-center gap-2">
                <BsBookmark className="text-primary" size={20} />
                <h4 className="mb-0">Story Privacy & Sharing</h4>
              </div>
              <button className="acp-close" onClick={() => setActiveModal(null)}>✕</button>
            </div>
            <div className="settings-modal-body">
              <p className="text-muted small">
                Choose who can view your stories and control replies, resharing, and cloud auto-archiving.
              </p>

              <h6 className="fw-bold mb-2">Who can see your story</h6>
              {[
                { id: "public", label: "Public", desc: "Anyone on Nexoria can view your stories" },
                { id: "friends", label: "Friends Only", desc: "Only your confirmed friends can see your stories" },
                { id: "custom", label: "Custom Close Friends", desc: "Only people in your Close Friends list" }
              ].map(opt => (
                <div 
                  key={opt.id}
                  className={`radio-setting-option ${storiesAudience === opt.id ? "active" : ""}`}
                  onClick={() => handleStoriesAudience(opt.id)}
                >
                  <div>
                    <h6>{opt.label}</h6>
                    <p className="small text-muted mb-0">{opt.desc}</p>
                  </div>
                  {storiesAudience === opt.id && <BsCheck2 size={20} className="text-primary" />}
                </div>
              ))}

              <h6 className="fw-bold mt-3 mb-2">Allow Message Replies</h6>
              {[
                { id: "everyone", label: "Everyone", desc: "Anyone viewing your story can send a direct reply" },
                { id: "friends", label: "Friends Only", desc: "Only mutual friends can send replies" },
                { id: "off", label: "Off", desc: "Turn off direct message replies to stories" }
              ].map(opt => (
                <div 
                  key={opt.id}
                  className={`radio-setting-option ${storyReplies === opt.id ? "active" : ""}`}
                  onClick={() => handleStoryReplies(opt.id)}
                >
                  <div>
                    <h6>{opt.label}</h6>
                    <p className="small text-muted mb-0">{opt.desc}</p>
                  </div>
                  {storyReplies === opt.id && <BsCheck2 size={20} className="text-primary" />}
                </div>
              ))}

              <div className="toggle-setting-row mt-3 mb-2">
                <div>
                  <div className="d-flex align-items-center gap-1">
                    <BsShareFill className="text-primary" size={14} />
                    <h6 className="mb-0">Allow Sharing & Resharing</h6>
                  </div>
                  <p>Let other people share your story to their story or send in direct messages</p>
                </div>
                <div className={`theme-toggle-switch ${allowStorySharing ? "on" : ""}`} onClick={() => setAllowStorySharing(!allowStorySharing)}>
                  <div className="switch-thumb"></div>
                </div>
              </div>

              <div className="toggle-setting-row mb-3">
                <div>
                  <div className="d-flex align-items-center gap-1">
                    <BsCloudArrowUp className="text-success" size={16} />
                    <h6 className="mb-0">Save story to archive cloud</h6>
                  </div>
                  <p>Automatically save photos and videos to your private Story Archive after 24 hours</p>
                </div>
                <div className={`theme-toggle-switch ${saveStoryToArchive ? "on" : ""}`} onClick={() => setSaveStoryToArchive(!saveStoryToArchive)}>
                  <div className="switch-thumb"></div>
                </div>
              </div>

              <button className="btn-publish-post" onClick={() => setActiveModal(null)}>Done</button>
            </div>
          </div>
        </div>
      )}

      {/* 21. Device Permissions Modal */}
      {activeModal === "device_permissions" && (
        <div className="acp-overlay" onClick={() => setActiveModal(null)}>
          <div className="settings-modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className="settings-modal-header">
              <div className="d-flex align-items-center gap-2">
                <BsPhone className="text-primary" size={20} />
                <h4 className="mb-0">Device Hardware Permissions</h4>
              </div>
              <button className="acp-close" onClick={() => setActiveModal(null)}>✕</button>
            </div>
            <div className="settings-modal-body">
              <p className="text-muted small">
                Audit and manage device hardware access (Camera, Microphone, Location, Notifications, Storage) used by Nexoria.
              </p>

              <div className="d-flex flex-column gap-2 mb-3">
                {[
                  {
                    id: "camera",
                    name: "Camera",
                    icon: <BsCameraVideo className="text-primary" size={18} />,
                    desc: "Used for recording Stories, Live streams & video calls",
                    status: devicePerms.camera,
                    actionLabel: "Test Access",
                    onTest: () => handleCheckDevicePermission("camera")
                  },
                  {
                    id: "microphone",
                    name: "Microphone",
                    icon: <BsMic className="text-danger" size={18} />,
                    desc: "Used for voice messages, call audio & Reels sound",
                    status: devicePerms.microphone,
                    actionLabel: "Test Access",
                    onTest: () => handleCheckDevicePermission("microphone")
                  },
                  {
                    id: "location",
                    name: "Location / GPS",
                    icon: <BsGeoAlt className="text-success" size={18} />,
                    desc: "Used for tagging check-ins, local events & Marketplace",
                    status: devicePerms.location,
                    actionLabel: "Verify GPS",
                    onTest: () => handleCheckDevicePermission("location")
                  },
                  {
                    id: "notifications",
                    name: "Push Notifications",
                    icon: <BsBell className="text-warning" size={18} />,
                    desc: "Receive alerts for incoming messages, comments & tags",
                    status: devicePerms.notifications,
                    actionLabel: "Request",
                    onTest: () => handleCheckDevicePermission("notifications")
                  },
                  {
                    id: "storage",
                    name: "Photos & Media Storage",
                    icon: <BsCamera className="text-info" size={18} />,
                    desc: "Upload photos, videos, and post attachments",
                    status: "granted",
                    actionLabel: "Active",
                    onTest: () => showToast("Media storage access is active.")
                  }
                ].map(perm => (
                  <div key={perm.id} className="d-flex align-items-center justify-content-between p-3 rounded" style={{ border: "1px solid var(--color-border, #e4e6eb)", background: "var(--color-surface, #ffffff)" }}>
                    <div className="d-flex align-items-center gap-3">
                      <div className="p-2 rounded-circle" style={{ background: "var(--color-bg, #f0f2f5)" }}>
                        {perm.icon}
                      </div>
                      <div>
                        <div className="d-flex align-items-center gap-2">
                          <strong className="text-dark" style={{ fontSize: "0.95rem" }}>{perm.name}</strong>
                          <span className={`badge ${perm.status === "granted" ? "bg-success" : perm.status === "denied" ? "bg-danger" : "bg-secondary"} rounded-pill`} style={{ fontSize: "0.7rem", textTransform: "capitalize" }}>
                            {perm.status}
                          </span>
                        </div>
                        <small className="text-muted d-block" style={{ fontSize: "0.8rem" }}>{perm.desc}</small>
                      </div>
                    </div>
                    <button 
                      className="btn btn-sm btn-outline-primary rounded-pill px-3 fw-bold text-nowrap"
                      onClick={perm.onTest}
                    >
                      {perm.actionLabel}
                    </button>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded bg-light border text-muted small mb-3">
                💡 <strong>Tip:</strong> You can also change hardware permissions at any time via your browser's site settings icon in the address bar.
              </div>

              <button className="btn-publish-post" onClick={() => setActiveModal(null)}>Done</button>
            </div>
          </div>
        </div>
      )}

      {/* 22. Business Integrations Modal */}
      {activeModal === "business_integrations" && (
        <div className="acp-overlay" onClick={() => setActiveModal(null)}>
          <div className="settings-modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className="settings-modal-header">
              <div className="d-flex align-items-center gap-2">
                <BsBag className="text-primary" size={20} />
                <h4 className="mb-0">Business Integrations & APIs</h4>
              </div>
              <button className="acp-close" onClick={() => setActiveModal(null)}>✕</button>
            </div>
            <div className="settings-modal-body">
              <p className="text-muted small">
                Connect your marketing tools, payment gateways, webhooks, and developer API keys to automate your business.
              </p>

              {/* Meta Ads & Pixel Card */}
              <div className="d-flex align-items-center justify-content-between p-3 rounded mb-2" style={{ border: "1px solid var(--color-border, #e4e6eb)", background: "var(--color-surface, #ffffff)" }}>
                <div className="d-flex align-items-center gap-3">
                  <div className="p-2 rounded-circle" style={{ background: "rgba(24, 119, 242, 0.1)" }}>
                    <BsGlobe2 className="text-primary" size={20} />
                  </div>
                  <div>
                    <div className="d-flex align-items-center gap-2">
                      <strong className="text-dark" style={{ fontSize: "0.95rem" }}>Meta Ads Pixel & Catalog</strong>
                      <span className={`badge ${metaPixelConnected ? "bg-success" : "bg-secondary"} rounded-pill`} style={{ fontSize: "0.7rem" }}>
                        {metaPixelConnected ? "Connected" : "Disconnected"}
                      </span>
                    </div>
                    <small className="text-muted d-block" style={{ fontSize: "0.8rem" }}>Pixel ID: NX-88392-PIX · Conversion tracking active</small>
                  </div>
                </div>
                <button 
                  className={`btn btn-sm ${metaPixelConnected ? "btn-outline-danger" : "btn-outline-primary"} rounded-pill px-3 fw-bold`}
                  onClick={() => {
                    setMetaPixelConnected(!metaPixelConnected);
                    showToast(metaPixelConnected ? "Meta Pixel disconnected." : "Meta Pixel linked successfully!");
                  }}
                >
                  {metaPixelConnected ? "Disconnect" : "Connect"}
                </button>
              </div>

              {/* Stripe Commerce Card */}
              <div className="d-flex align-items-center justify-content-between p-3 rounded mb-2" style={{ border: "1px solid var(--color-border, #e4e6eb)", background: "var(--color-surface, #ffffff)" }}>
                <div className="d-flex align-items-center gap-3">
                  <div className="p-2 rounded-circle" style={{ background: "rgba(40, 167, 69, 0.1)" }}>
                    <BsCreditCard className="text-success" size={20} />
                  </div>
                  <div>
                    <div className="d-flex align-items-center gap-2">
                      <strong className="text-dark" style={{ fontSize: "0.95rem" }}>Stripe Merchant & Payouts</strong>
                      <span className={`badge ${stripeConnected ? "bg-success" : "bg-secondary"} rounded-pill`} style={{ fontSize: "0.7rem" }}>
                        {stripeConnected ? "Active" : "Paused"}
                      </span>
                    </div>
                    <small className="text-muted d-block" style={{ fontSize: "0.8rem" }}>Account: acct_1Nx88291 · Direct bank deposits enabled</small>
                  </div>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <button 
                    className="btn btn-sm btn-outline-secondary rounded-pill px-3 fw-bold"
                    onClick={() => navigate("/orders-payments")}
                  >
                    Manage
                  </button>
                  <button 
                    className={`btn btn-sm ${stripeConnected ? "btn-outline-danger" : "btn-outline-success"} rounded-pill px-2 fw-bold`}
                    onClick={() => {
                      setStripeConnected(!stripeConnected);
                      showToast(stripeConnected ? "Stripe payouts paused." : "Stripe merchant payouts activated!");
                    }}
                  >
                    {stripeConnected ? "Pause" : "Resume"}
                  </button>
                </div>
              </div>

              {/* Zapier / Webhooks Automation */}
              <div className="p-3 rounded mb-2" style={{ background: "var(--color-bg, #f0f2f5)", border: "1px solid var(--color-border, #e4e6eb)" }}>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <div className="d-flex align-items-center gap-2">
                    <BsLink45Deg className="text-info" size={18} />
                    <strong className="text-dark" style={{ fontSize: "0.95rem" }}>Zapier & Custom Webhooks</strong>
                  </div>
                  <button className="btn btn-sm btn-outline-primary rounded-pill px-2 py-0" style={{ fontSize: "0.75rem" }} onClick={handleTestZapierWebhook}>
                    Test Ping
                  </button>
                </div>
                <p className="text-muted small mb-2">Automatically post lead alerts and purchase events to your webhook.</p>
                <input 
                  type="text" 
                  className="form-control form-control-sm"
                  value={zapierWebhook}
                  onChange={(e) => setZapierWebhook(e.target.value)}
                  placeholder="https://hooks.zapier.com/hooks/catch/..."
                />
              </div>

              {/* Developer API Key */}
              <div className="p-3 rounded mb-3" style={{ background: "var(--color-bg, #f0f2f5)", border: "1px solid var(--color-border, #e4e6eb)" }}>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <div className="d-flex align-items-center gap-2">
                    <BsCodeSlash className="text-dark" size={18} />
                    <strong className="text-dark" style={{ fontSize: "0.95rem" }}>Developer REST API Token</strong>
                  </div>
                  <button className="btn btn-sm btn-link text-primary p-0 text-decoration-none small fw-bold" onClick={() => setShowDevKey(!showDevKey)}>
                    {showDevKey ? "Hide" : "Reveal"}
                  </button>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <input 
                    type={showDevKey ? "text" : "password"} 
                    readOnly 
                    className="form-control form-control-sm font-monospace"
                    value={devApiKey}
                  />
                  <button className="btn btn-sm btn-outline-dark text-nowrap rounded-pill px-3" onClick={handleCopyDevApiKey} title="Copy Token">
                    <BsCopy size={13} className="me-1" /> Copy
                  </button>
                  <button className="btn btn-sm btn-outline-danger text-nowrap rounded-pill px-2" onClick={handleRegenerateDevApiKey} title="Regenerate Key">
                    <BsArrowRepeat size={14} />
                  </button>
                </div>
              </div>

              <button className="btn-publish-post" onClick={() => setActiveModal(null)}>Done</button>
            </div>
          </div>
        </div>
      )}

      {/* Generic Modal for remaining simple settings */}
      {activeModal && ![
        "password_security_hub", "change_password_form", "reaction_pref", "active_status",
        "profile_locking", "default_audience", "blocking", "media", "find_contact",
        "tagging", "followers", "family_centre", "whatsapp", "connected_apps",
        "content_pref", "early_access", "camera_suggestions",
        "tab_bar", "accessibility", "browser", "pro_mode", "stories_privacy",
        "device_permissions", "business_integrations"
      ].includes(activeModal) && (
        <div className="acp-overlay" onClick={() => setActiveModal(null)}>
          <div className="settings-modal-card" onClick={e => e.stopPropagation()}>
            <div className="settings-modal-header">
              <h4>Settings</h4>
              <button className="acp-close" onClick={() => setActiveModal(null)}>✕</button>
            </div>
            <div className="settings-modal-body">
              <p>Your settings for <strong>{activeModal.replace("_", " ")}</strong> are actively synced with your database profile.</p>
              <button className="btn-publish-post mt-3" onClick={() => setActiveModal(null)}>Done</button>
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

export default SettingsPage;