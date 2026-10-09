import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import Header from "./Header";
import MenuIcons from "./MenuIcons";
import ChatDrawer from "./ChatDrawer";
import CoverBottomSheet from "./CoverBottomSheet";
import FullScreenCover from "./FullScreenCover";
import ChooseCoverPhoto from "./ChooseCoverPhoto";
import DragToAdjust from "./DragToAdjust";
import CreateStory from "./CreateStory";
import Stories from "./Stories";
import CreatePostModal from "./CreatePostModal";
import Post from "./Post";
import {
  BsCameraFill, BsPencilFill, BsThreeDots,
  BsPlusLg, BsSearch, BsGeoAltFill,
  BsBriefcaseFill, BsMortarboardFill, BsHeartFill,
  BsPlayFill, BsFilm, BsShieldFillCheck, BsStars,
  BsImages, BsAwardFill,
  BsCheckCircleFill, BsClockHistory,
  BsMessenger, BsArrowLeft,
  BsDownload, BsShare, BsHandThumbsUp, BsHandThumbsUpFill,
  BsChatLeftTextFill, BsSendFill,
  BsChevronLeft, BsChevronRight, BsX, BsPauseFill
} from "react-icons/bs";
import "./css/Profile.css";
import {
  fetchFullProfileApi,
  fetchUserPostsApi,
  fetchUserPhotosApi,
  fetchUserReelsApi,
  fetchUserFriendsApi,
  toggleFollowApi,
  purchaseVerificationApi,
  toggleVerificationApi,
  reactToPostApi,
  commentOnPostApi,
  sharePostApi,
  getActiveUserId,
  getActiveUserName,
  getActiveUserHandle,
  getUserStorageItem,
  setUserStorageItem,
  uploadAvatarFileApi,
  uploadCoverFileApi,
  updateBioApi,
  updateAvatarUrlApi,
  updateCoverUrlApi
} from "../services/profileApi";
import { createNotificationApi } from "../services/notificationApi";
import {
  fetchUserStoriesApi,
  fetchFriendsStatusesApi,
  viewStoryApi,
  getStoryMediaUrl
} from "../services/storiesApi";

function Profile() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userId } = useParams();
  const queryParams = new URLSearchParams(location.search);
  const queryUserId = queryParams.get("id") || queryParams.get("userId") || queryParams.get("user_id");

  const targetUser = location.state?.user || location.state?.targetUser;

  const fileInputRef = useRef(null);
  const avatarInputRef = useRef(null);

  const currentUserId = getActiveUserId();
  const parsedTargetId = targetUser?.id || targetUser?.user_id || (userId ? Number(userId) : null) || (queryUserId ? Number(queryUserId) : null);
  const targetUserId = parsedTargetId ? Number(parsedTargetId) : null;

  const isViewingOther = Boolean(
    (targetUserId && Number(targetUserId) !== Number(currentUserId)) ||
    (targetUser && (targetUser.creatorName || targetUser.name) && ((targetUser.creatorName || targetUser.name) !== getActiveUserName()))
  );

  const activeProfileUserId = (isViewingOther && targetUserId) ? targetUserId : currentUserId;
  const defaultUserAvatar = `https://i.pravatar.cc/150?u=${activeProfileUserId}`;

  // Basic Profile Identity States
  const [displayName, setDisplayName] = useState(() => targetUser?.creatorName || targetUser?.name || getActiveUserName());
  const [displayHandle, setDisplayHandle] = useState(() => getActiveUserHandle());
  const [profilePic, setProfilePic] = useState(() => targetUser?.profile || targetUser?.avatar || getUserStorageItem("avatar", defaultUserAvatar, activeProfileUserId));
  const [coverImg, setCoverImg] = useState(() => targetUser?.cover || getUserStorageItem("cover", "https://images.unsplash.com/photo-1707343843437-caacff5cfa74?w=1200", activeProfileUserId));
  const [bio, setBio] = useState(() => targetUser?.bio || getUserStorageItem("bio", "🚀 Full Stack Engineer · Creator & Pioneer · Building Nexoria Cosmos 💫", activeProfileUserId));
  
  // User Intro details
  const [userCity, setUserCity] = useState("Delhi, India");
  const [userHometown, setUserHometown] = useState("Deoria");
  const [userEducation, setUserEducation] = useState("Computer Science and Engineering");
  const [userStatus, setUserStatus] = useState("Single");
  const [userWork, setUserWork] = useState({ company: "Nexoria Technologies", position: "Full Stack Engineer" });

  // Dynamic Metrics & Social Graph from Database
  const [friendsCount, setFriendsCount] = useState(0);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [starsCount, setStarsCount] = useState(0);
  const [truthguardScore, setTruthguardScore] = useState(99.8);
  const [isFollowingUser, setIsFollowingUser] = useState(false);
  const [userBadges, setUserBadges] = useState(["verified_id", "pioneer", "e2e_guard"]);
  
  // Blue Tick Verified & Multi-Step Checkout States
  const [isVerified, setIsVerified] = useState(false);
  const [isVerifiedPurchased, setIsVerifiedPurchased] = useState(false);
  const [canGetFreeVerified, setCanGetFreeVerified] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [isPurchasingVerification, setIsPurchasingVerification] = useState(false);

  const [checkoutStep, setCheckoutStep] = useState("plan"); // "plan" | "details" | "payment" | "processing" | "success"
  const [selectedPlan, setSelectedPlan] = useState("monthly"); // "monthly" (₹499) | "yearly" (₹4,999)
  const [legalName, setLegalName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Digital Creator & Influencer");
  const [paymentMethod, setPaymentMethod] = useState("upi"); // "upi" | "stars" | "card"
  const [upiId, setUpiId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExp, setCardExp] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [orderReceipt, setOrderReceipt] = useState(null);
  const [processingMsg, setProcessingMsg] = useState("");

  // Dynamic Content Lists
  const [posts, setPosts] = useState([]);
  const [friends, setFriends] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [reels, setReels] = useState([]);

  // UI Flow States
  const [activeTab, setActiveTab] = useState("All");
  const [activeChat, setActiveChat] = useState(null);
  const [friendsSearch, setFriendsSearch] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoCommentText, setPhotoCommentText] = useState("");
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [tempBio, setTempBio] = useState(bio);

  // Dynamic Stories & Friends Statuses States
  const [userStories, setUserStories] = useState([]);
  const [friendStatuses, setFriendStatuses] = useState([]);
  const [activeStoryViewer, setActiveStoryViewer] = useState(null);
  const [storyViewerIndex, setStoryViewerIndex] = useState(0);
  const [storyViewerProgress, setStoryViewerProgress] = useState(0);
  const [isStoryViewerPaused, setIsStoryViewerPaused] = useState(false);
  const [storyReplyText, setStoryReplyText] = useState("");
  const [storyFlyingEmoji, setStoryFlyingEmoji] = useState(null);

  // Modals & Sheets
  const [showCoverMenu, setShowCoverMenu] = useState(false);
  const [showFullCover, setShowFullCover] = useState(false);
  const [showChooseCover, setShowChooseCover] = useState(false);
  const [dragImage, setDragImage] = useState(null);
  const [selectedCoverFile, setSelectedCoverFile] = useState(null);
  const [showCreateStoryModal, setShowCreateStoryModal] = useState(false);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);

  // ==========================================================================
  // 1. LOAD FULL DYNAMIC DATA FROM FASTAPI DATABASE
  // ==========================================================================
  const loadProfileData = useCallback(async () => {
    if (!activeProfileUserId) return;

    try {
      // 1. Fetch unified full profile & live metrics
      const fullRes = await fetchFullProfileApi(activeProfileUserId, currentUserId);
      if (fullRes && fullRes.success && fullRes.data) {
        const d = fullRes.data;
        if (d.full_name) setDisplayName(d.full_name);
        if (d.username) setDisplayHandle(`@${d.username.toLowerCase().replace(/[^a-z0-9_]/g, '')}`);
        if (d.profile_pic) setProfilePic(d.profile_pic);
        if (d.cover_photo) setCoverImg(d.cover_photo);
        if (d.bio) setBio(d.bio);
        if (d.current_city) setUserCity(d.current_city);
        if (d.hometown) setUserHometown(d.hometown);
        if (d.education_college) setUserEducation(d.education_college);
        if (d.relationship_status) setUserStatus(d.relationship_status);
        if (d.work_workplace) setUserWork({ company: d.work_workplace, position: d.work_job_title || "Full Stack Engineer" });

        const fCount = d.followers_count || 0;
        setFriendsCount(d.friends_count || 0);
        setFollowersCount(fCount);
        setFollowingCount(d.following_count || 0);
        setStarsCount(d.stars_count || 0);
        setTruthguardScore(d.truthguard_score || 99.8);
        setUserBadges(d.badges || ["verified_id", "pioneer"]);
        setIsFollowingUser(Boolean(d.is_following));

        // Strict Blue Tick Verification Condition: >= 1M followers OR purchased
        const has1MFollowers = Boolean(fCount >= 1000000 || d.can_get_free_verified);
        const hasPurchased = Boolean(d.is_verified_purchased || (d.is_verified && fCount < 1000000));
        const finalVerified = Boolean(d.is_verified || has1MFollowers || hasPurchased);
        
        setIsVerified(finalVerified);
        setIsVerifiedPurchased(Boolean(d.is_verified_purchased));
        setCanGetFreeVerified(has1MFollowers);

        if (!isViewingOther) {
          setUserStorageItem("avatar", d.profile_pic, currentUserId);
          setUserStorageItem("cover", d.cover_photo, currentUserId);
          setUserStorageItem("bio", d.bio, currentUserId);
        }
      }

      // 2. Fetch User Real Posts with viewer context
      const postsRes = await fetchUserPostsApi(activeProfileUserId, currentUserId);
      if (postsRes && postsRes.success && Array.isArray(postsRes.data)) {
        setPosts(postsRes.data);
      }

      // 3. Fetch User Real Friends
      const friendsRes = await fetchUserFriendsApi(activeProfileUserId);
      if (friendsRes && friendsRes.success && Array.isArray(friendsRes.data)) {
        setFriends(friendsRes.data);
        if (friendsRes.data.length > 0) {
          setFriendsCount(friendsRes.data.length);
        }
      }

      // 4. Fetch User Real Gallery Photos with live like & comment data
      const photosRes = await fetchUserPhotosApi(activeProfileUserId, currentUserId);
      if (photosRes && photosRes.success && Array.isArray(photosRes.data)) {
        setPhotos(photosRes.data);
      }

      // 5. Fetch User Real Reels
      const reelsRes = await fetchUserReelsApi(activeProfileUserId);
      if (reelsRes && reelsRes.success && Array.isArray(reelsRes.data)) {
        setReels(reelsRes.data);
      }

      // 6. Fetch User Active Stories / Status
      const storiesRes = await fetchUserStoriesApi(activeProfileUserId, currentUserId);
      if (storiesRes && storiesRes.success && Array.isArray(storiesRes.data)) {
        setUserStories(storiesRes.data);
      }

      // 7. Fetch Friends Active Statuses
      const friendStatusesRes = await fetchFriendsStatusesApi(activeProfileUserId);
      if (friendStatusesRes && friendStatusesRes.success && Array.isArray(friendStatusesRes.data)) {
        setFriendStatuses(friendStatusesRes.data);
      }

    } catch (err) {
      console.warn("Failed to load dynamic profile data:", err);
    }
  }, [activeProfileUserId, currentUserId, isViewingOther]);

  // Photo Interactions: Lightbox Open, Like, Comment, Share, Download
  const handleOpenPhoto = (item) => {
    if (typeof item === "object" && item !== null) {
      setSelectedPhoto(item);
    } else {
      setSelectedPhoto({
        id: `photo_${Date.now()}`,
        url: item,
        caption: "Photo update",
        author_name: displayName,
        author_pic: profilePic,
        author_verified: isVerified,
        likesCount: 0,
        commentsCount: 0,
        sharesCount: 0,
        isLiked: false,
        comments: []
      });
    }
  };

  const handleTogglePhotoLike = async () => {
    if (!selectedPhoto) return;
    const postId = selectedPhoto.post_id || (typeof selectedPhoto.id === "number" ? selectedPhoto.id : null);
    const currentlyLiked = Boolean(selectedPhoto.isLiked);
    const newLiked = !currentlyLiked;
    const newLikesCount = Math.max(0, (selectedPhoto.likesCount || 0) + (newLiked ? 1 : -1));

    setSelectedPhoto(prev => ({
      ...prev,
      isLiked: newLiked,
      likesCount: newLikesCount
    }));

    setPhotos(prevList =>
      prevList.map(item => {
        const match = (typeof item === "object" && (item.id === selectedPhoto.id || item.url === selectedPhoto.url));
        if (!match) return item;
        return {
          ...item,
          isLiked: newLiked,
          likesCount: newLikesCount
        };
      })
    );

    if (postId) {
      try {
        const res = await reactToPostApi(postId, currentUserId, "like");
        if (res && res.success) {
          setSelectedPhoto(prev => ({
            ...prev,
            isLiked: res.isLiked,
            likesCount: res.likesCount
          }));
          window.dispatchEvent(new Event("nexoria_notifications_updated"));
        }
      } catch (err) {
        console.warn("Photo like error:", err);
      }
    }
  };

  const handleAddPhotoComment = async (e) => {
    e?.preventDefault();
    if (!photoCommentText.trim() || !selectedPhoto) return;

    const text = photoCommentText.trim();
    const tempId = Date.now();
    const newCommentObj = {
      id: tempId,
      name: getActiveUserName(),
      profile: profilePic,
      text: text,
      time: "Just now"
    };

    setSelectedPhoto(prev => ({
      ...prev,
      comments: [...(prev.comments || []), newCommentObj],
      commentsCount: (prev.commentsCount || 0) + 1
    }));

    setPhotos(prevList =>
      prevList.map(item => {
        const match = (typeof item === "object" && (item.id === selectedPhoto.id || item.url === selectedPhoto.url));
        if (!match) return item;
        return {
          ...item,
          comments: [...(item.comments || []), newCommentObj],
          commentsCount: (item.commentsCount || 0) + 1
        };
      })
    );

    setPhotoCommentText("");

    const postId = selectedPhoto.post_id || (typeof selectedPhoto.id === "number" ? selectedPhoto.id : null);
    if (postId) {
      try {
        const res = await commentOnPostApi(postId, currentUserId, text);
        if (res && res.success && res.comment) {
          setSelectedPhoto(prev => ({
            ...prev,
            comments: (prev.comments || []).map(c => (c.id === tempId ? res.comment : c)),
            commentsCount: res.commentsCount || prev.comments?.length
          }));
          window.dispatchEvent(new Event("nexoria_notifications_updated"));
        }
      } catch (err) {
        console.warn("Photo comment error:", err);
      }
    }
  };

  const handleSharePhoto = async () => {
    if (!selectedPhoto) return;
    const postId = selectedPhoto.post_id || (typeof selectedPhoto.id === "number" ? selectedPhoto.id : null);
    
    setSelectedPhoto(prev => ({
      ...prev,
      sharesCount: (prev.sharesCount || 0) + 1
    }));

    if (postId) {
      try {
        const res = await sharePostApi(postId, currentUserId);
        if (res && res.success) {
          setSelectedPhoto(prev => ({ ...prev, sharesCount: res.sharesCount }));
          window.dispatchEvent(new Event("nexoria_notifications_updated"));
        }
      } catch (err) {}
    }
    alert("Photo shared to your feed timeline! 🚀");
  };

  const handleDownloadPhoto = async () => {
    if (!selectedPhoto) return;
    const url = selectedPhoto.url || selectedPhoto;
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `nexoria_photo_${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      window.open(url, "_blank");
    }
  };

  useEffect(() => {
    loadProfileData();

    const handleProfileUpdate = () => loadProfileData();
    window.addEventListener("profile-updated", handleProfileUpdate);
    window.addEventListener("post-created", handleProfileUpdate);
    window.addEventListener("friends-updated", handleProfileUpdate);

    return () => {
      window.removeEventListener("profile-updated", handleProfileUpdate);
      window.removeEventListener("post-created", handleProfileUpdate);
      window.removeEventListener("friends-updated", handleProfileUpdate);
    };
  }, [loadProfileData]);

  // ==========================================================================
  // 2. DYNAMIC "PROFILE VIEW" NOTIFICATION DISPATCH
  // ==========================================================================
  useEffect(() => {
    if (isViewingOther && targetUserId && Number(targetUserId) !== Number(currentUserId)) {
      createNotificationApi(Number(targetUserId), {
        actorId: Number(currentUserId),
        notifType: "profile_view",
        message: "viewed your profile 👁️"
      }).then(() => {
        window.dispatchEvent(new Event("nexoria_notifications_updated"));
      }).catch(err => console.error("Failed to send profile view notification:", err));
    }
  }, [isViewingOther, targetUserId, currentUserId]);

  // ==========================================================================
  // 3. ACTIONS: FOLLOW, BIO, AVATAR, COVER
  // ==========================================================================
  const handleToggleFollow = async () => {
    if (!targetUserId || !currentUserId) return;
    const res = await toggleFollowApi(targetUserId, currentUserId);
    if (res && res.success) {
      setIsFollowingUser(res.is_following);
      setFollowersCount(prev => res.is_following ? prev + 1 : Math.max(0, prev - 1));
      window.dispatchEvent(new Event("profile-updated"));
    }
  };

  const handleExecuteCheckout = async () => {
    setIsPurchasingVerification(true);
    setCheckoutStep("processing");
    setProcessingMsg("Securing connection with Payment Gateway...");

    setTimeout(() => {
      setProcessingMsg("Verifying Creator credentials & Authenticity pledge...");
    }, 700);

    setTimeout(async () => {
      setProcessingMsg("Minting Blue Tick signature on database...");
      try {
        const payload = {
          plan_tier: selectedPlan,
          payment_method: paymentMethod,
          legal_name: (legalName || displayName || "").trim(),
          category: selectedCategory,
          upi_id: paymentMethod === "upi" ? (upiId.trim() || "creator@upi") : null,
          amount: selectedPlan === "yearly" ? 4999.0 : 499.0,
          currency: "INR"
        };
        const res = await purchaseVerificationApi(activeProfileUserId, payload);
        if (res && res.success) {
          setIsVerified(false);
          setIsVerifiedPurchased(false);
          setOrderReceipt(res);
          setCheckoutStep("success");
          window.dispatchEvent(new Event("profile-updated"));
        } else {
          alert(res?.message || "Payment processing failed. Please try again.");
          setCheckoutStep("payment");
        }
      } catch (err) {
        console.error("Verification purchase failed:", err);
        alert("Failed to process transaction. Please try again.");
        setCheckoutStep("payment");
      } finally {
        setIsPurchasingVerification(false);
      }
    }, 1500);
  };

  const handleToggleVerificationDev = async (enableVal) => {
    setIsPurchasingVerification(true);
    try {
      const res = await toggleVerificationApi(activeProfileUserId, enableVal);
      if (res && res.success) {
        setIsVerified(Boolean(res.is_verified));
        setIsVerifiedPurchased(Boolean(res.is_verified_purchased));
        window.dispatchEvent(new Event("profile-updated"));
      }
    } catch (err) {
      console.error("Toggle verification failed:", err);
    } finally {
      setIsPurchasingVerification(false);
    }
  };

  const handleSaveBio = async () => {
    const updatedBio = tempBio.trim() || bio;
    setBio(updatedBio);
    setUserStorageItem("bio", updatedBio, currentUserId);
    await updateBioApi({ bio: updatedBio }, currentUserId);
    window.dispatchEvent(new Event("profile-updated"));
    setIsEditingBio(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedCoverFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setDragImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const previewUrl = event.target.result;
        setProfilePic(previewUrl);
        setUserStorageItem("avatar", previewUrl, currentUserId);
        window.dispatchEvent(new Event("profile-updated"));

        try {
          const uploadRes = await uploadAvatarFileApi(file, currentUserId);
          if (uploadRes && uploadRes.profile_pic) {
            setProfilePic(uploadRes.profile_pic);
            setUserStorageItem("avatar", uploadRes.profile_pic, currentUserId);
            window.dispatchEvent(new Event("profile-updated"));
          } else {
            updateAvatarUrlApi(previewUrl, currentUserId);
          }
        } catch (err) {
          updateAvatarUrlApi(previewUrl, currentUserId);
        }
      };
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  };

  // Listen for real-time dynamic story creation
  useEffect(() => {
    const handleStoryCreated = () => {
      loadProfileData();
    };
    window.addEventListener("nexoria_story_created", handleStoryCreated);
    return () => {
      window.removeEventListener("nexoria_story_created", handleStoryCreated);
    };
  }, [loadProfileData]);

  // Story Viewer Auto-Progress Timer
  useEffect(() => {
    if (!activeStoryViewer || !activeStoryViewer.length || isStoryViewerPaused) return;

    const interval = setInterval(() => {
      setStoryViewerProgress((prev) => {
        if (prev >= 100) {
          if (storyViewerIndex < activeStoryViewer.length - 1) {
            const nextIdx = storyViewerIndex + 1;
            setStoryViewerIndex(nextIdx);
            const nextStory = activeStoryViewer[nextIdx];
            if (nextStory && currentUserId) {
              viewStoryApi(nextStory.id, currentUserId);
            }
            return 0;
          } else {
            setActiveStoryViewer(null);
            setStoryViewerIndex(0);
            return 0;
          }
        }
        return prev + 2; // 50 ticks = 5 seconds
      });
    }, 100);

    return () => clearInterval(interval);
  }, [activeStoryViewer, storyViewerIndex, isStoryViewerPaused, currentUserId]);

  const handleOpenStoryViewer = (storyList, startIndex = 0) => {
    if (!storyList || !storyList.length) return;
    setActiveStoryViewer(storyList);
    setStoryViewerIndex(startIndex);
    setStoryViewerProgress(0);
    setIsStoryViewerPaused(false);
    const targetStory = storyList[startIndex];
    if (targetStory && currentUserId) {
      viewStoryApi(targetStory.id, currentUserId);
    }
  };

  const handleStoryPrev = () => {
    if (storyViewerIndex > 0) {
      const prevIdx = storyViewerIndex - 1;
      setStoryViewerIndex(prevIdx);
      setStoryViewerProgress(0);
      const prevStory = activeStoryViewer[prevIdx];
      if (prevStory && currentUserId) {
        viewStoryApi(prevStory.id, currentUserId);
      }
    }
  };

  const handleStoryNext = () => {
    if (storyViewerIndex < activeStoryViewer.length - 1) {
      const nextIdx = storyViewerIndex + 1;
      setStoryViewerIndex(nextIdx);
      setStoryViewerProgress(0);
      const nextStory = activeStoryViewer[nextIdx];
      if (nextStory && currentUserId) {
        viewStoryApi(nextStory.id, currentUserId);
      }
    } else {
      setActiveStoryViewer(null);
      setStoryViewerIndex(0);
    }
  };

  const handleStoryReact = (emoji) => {
    setStoryFlyingEmoji(emoji);
    const activeStory = activeStoryViewer?.[storyViewerIndex];
    if (activeStory && currentUserId) {
      viewStoryApi(activeStory.id, currentUserId, emoji);
    }
    setTimeout(() => setStoryFlyingEmoji(null), 1500);
  };

  const handleStoryReply = (e) => {
    e?.preventDefault();
    if (!storyReplyText.trim() || !activeStoryViewer) return;
    const cur = activeStoryViewer[storyViewerIndex];
    if (cur) {
      setActiveChat({
        id: cur.user_id,
        name: cur.name,
        img: cur.user_img,
        online: true
      });
      alert(`Reply sent to ${cur.name}: "${storyReplyText}"`);
      setStoryReplyText("");
      setActiveStoryViewer(null);
    }
  };

  const filteredFriends = friends.filter(f =>
    !friendsSearch.trim() || (f.name && f.name.toLowerCase().includes(friendsSearch.toLowerCase())) ||
    (f.role && f.role.toLowerCase().includes(friendsSearch.toLowerCase()))
  );

  return (
    <div className="profile-page-root">
      <Header onOpenChat={setActiveChat} />

      <div className="profile-main-wrapper">

        {/* Viewing Other Profile Top Indicator */}
        {isViewingOther && (
          <div className="viewing-other-profile-banner shadow-sm">
            <div className="banner-left-info">
              <span className="banner-eye-pulse">👁️</span>
              <span>You are viewing <strong>{displayName}</strong>'s profile</span>
            </div>
            <button className="btn-return-my-profile" onClick={() => navigate("/profile", { state: null })}>
              <BsArrowLeft className="me-1" /> Back to my profile
            </button>
          </div>
        )}
        
        {/* ================= HERO COVER CONTAINER ================= */}
        <div className="profile-cover-card shadow-sm">
          <img className="profile-cover-img" src={coverImg} alt="cover" />
          <div className="cover-ambient-overlay"></div>
          
          {!isViewingOther && (
            <div className="cover-edit-floating-btn" onClick={() => setShowCoverMenu(true)}>
              <BsCameraFill size={15} />
              <span>Edit cover photo</span>
            </div>
          )}
        </div>

        {/* Hidden File Inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
        <input
          ref={avatarInputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleAvatarChange}
        />

        {/* ================= IDENTITY HEADER & STATS ================= */}
        <div className="profile-identity-card">
          <div className="identity-left-group">
            {/* Avatar with Glow Ring & Camera Changer */}
            <div className="profile-avatar-wrapper">
              <div 
                className={`avatar-glow-ring ${userStories.length > 0 ? "has-active-story" : ""}`}
                onClick={() => userStories.length > 0 && handleOpenStoryViewer(userStories)}
                style={{ cursor: userStories.length > 0 ? "pointer" : "default" }}
                title={userStories.length > 0 ? "Click to view active 24h story/status ✨" : ""}
              >
                <img className="profile-avatar-image" src={profilePic} alt="profile" />
                {userStories.length > 0 && (
                  <span className="story-ring-badge-tag" title="Active 24h Story">Story</span>
                )}
              </div>
              <span className="avatar-online-pulse" title="Online now"></span>
              {!isViewingOther && (
                <button
                  type="button"
                  className="avatar-change-btn"
                  onClick={() => avatarInputRef.current.click()}
                  title="Change profile picture"
                >
                  <BsCameraFill size={15} />
                </button>
              )}
            </div>

            {/* Profile Info, Handle, Badges */}
            <div className="profile-meta-info">
              <div className="name-badge-row">
                <h1 className="profile-display-name">{displayName}</h1>
                {isVerified ? (
                  <span 
                    className="creator-verified-badge" 
                    title={followersCount >= 1000000 ? "Blue Tick Verified Creator (1M+ Followers) 🌟" : "Blue Tick Verified (Purchased / Active Subscription) 💎"}
                  >
                    <BsCheckCircleFill className="text-primary me-1" />
                    <span>Verified</span>
                  </span>
                ) : (
                  !isViewingOther && (
                    <button 
                      className="get-verified-badge-btn" 
                      onClick={() => setShowVerificationModal(true)}
                      title="Blue Tick: Available only for 1M+ followers or subscription purchase"
                    >
                      <BsStars className="me-1 text-primary" />
                      <span>Get Blue Tick</span>
                    </button>
                  )
                )}
                <span className="truthguard-score-badge" title={`TruthGuard AI Authenticity Rating: ${truthguardScore}%`}>
                  <BsShieldFillCheck className="text-success me-1" />
                  <span>{truthguardScore}%</span>
                </span>
              </div>

              <p className="profile-username-handle">{displayHandle} · Nexoria {isViewingOther ? "Creator" : "Member"}</p>

              {/* Bio Section */}
              {!isEditingBio ? (
                <div className="profile-bio-row">
                  <p className="profile-bio-text">{bio || "Welcome to my Nexoria profile 💫"}</p>
                  {!isViewingOther && (
                    <button className="bio-inline-edit-btn" onClick={() => { setTempBio(bio); setIsEditingBio(true); }}>
                      <BsPencilFill size={11} className="me-1" /> Edit
                    </button>
                  )}
                </div>
              ) : (
                <div className="bio-edit-inline-form">
                  <textarea
                    className="bio-edit-textarea"
                    value={tempBio}
                    onChange={(e) => setTempBio(e.target.value)}
                    maxLength={140}
                    autoFocus
                  />
                  <div className="d-flex gap-2 justify-content-end mt-1">
                    <button className="btn btn-sm btn-light rounded-pill px-3" onClick={() => setIsEditingBio(false)}>Cancel</button>
                    <button className="btn btn-sm btn-primary rounded-pill px-3" onClick={handleSaveBio}>Save Bio</button>
                  </div>
                </div>
              )}

              {/* Dynamic Quick Stats Row */}
              <div className="profile-quick-stats-row">
                <div className="stat-pill-item" onClick={() => setActiveTab("Friends")}>
                  <strong>{friendsCount}</strong> <span>Friends</span>
                </div>
                <div className="stat-pill-item">
                  <strong>{followersCount}</strong> <span>Followers</span>
                </div>
                <div className="stat-pill-item">
                  <strong>{followingCount}</strong> <span>Following</span>
                </div>
                <div className="stat-pill-item star-pill" onClick={() => setActiveTab("Badges")}>
                  <BsStars className="text-warning me-1" />
                  <strong>{starsCount}</strong> <span>Stars</span>
                </div>
                <div className="stat-pill-item safety-pill">
                  <BsShieldFillCheck className="text-success me-1" />
                  <span>2FA Shielded</span>
                </div>
              </div>
            </div>
          </div>

          {/* Identity Right Action Hub */}
          <div className="profile-action-hub">
            {isViewingOther ? (
              <>
                {userStories.length > 0 && (
                  <button 
                    className="btn-action-primary" 
                    style={{ background: "linear-gradient(135deg, #e1306c 0%, #fd1d1d 50%, #f56040 100%)", border: "none" }}
                    onClick={() => handleOpenStoryViewer(userStories)}
                    title="View user's active story"
                  >
                    <BsPlayFill size={18} className="me-1" /> View Story
                  </button>
                )}
                <button 
                  className={isFollowingUser ? "btn-action-secondary" : "btn-action-primary"}
                  onClick={handleToggleFollow}
                >
                  {isFollowingUser ? (
                    <><BsCheckCircleFill className="text-primary me-1" /> Following</>
                  ) : (
                    <><BsPlusLg className="me-1" /> Follow</>
                  )}
                </button>
                <button 
                  className="btn-action-primary" 
                  onClick={() => setActiveChat({ id: targetUserId || currentUserId, name: displayName, img: profilePic, online: true })}
                >
                  <BsMessenger className="me-1" /> Message
                </button>
                <button 
                  className="btn-action-icon" 
                  onClick={() => navigate("/profile", { state: null })} 
                  title="Back to my profile"
                >
                  <BsArrowLeft size={18} />
                </button>
              </>
            ) : (
              <>
                <button className="btn-action-primary" onClick={() => setShowCreateStoryModal(true)}>
                  <BsPlusLg className="me-1" /> Add to story
                </button>
                <button className="btn-action-secondary" onClick={() => setShowCreatePostModal(true)}>
                  <BsPencilFill className="me-1" /> Create post
                </button>
                <button className="btn-action-icon" onClick={() => navigate("/edit-profile")} title="Edit Profile Details">
                  <BsThreeDots size={18} />
                </button>
              </>
            )}
          </div>
        </div>

        <div className="profile-separator-bar"></div>

        {/* ================= PROFILE NAVIGATION TABS ================= */}
        <div className="profile-nav-pill-tabs">
          {[
            { id: "All", label: "Posts & Feed" },
            { id: "Statuses", label: `Statuses & Stories (${friendStatuses.length + userStories.length})` },
            { id: "About", label: "About" },
            { id: "Friends", label: `Friends (${friendsCount})` },
            { id: "Photos", label: `Photos (${photos.length})` },
            { id: "Reels", label: `Reels (${reels.length})` },
            { id: "Badges", label: "⭐ Badges & Stars" }
          ].map(tab => (
            <button
              key={tab.id}
              className={`prof-nav-btn ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ================= TAB 1: ALL (FEED & INTRO WIDGETS) ================= */}
        {activeTab === "All" && (
          <div className="profile-two-col-layout">
            
            {/* Left Sidebar Widgets */}
            <aside className="profile-left-widget-col">
              
              {/* Intro Details Widget */}
              <div className="profile-glass-card shadow-sm">
                <div className="widget-card-title">
                  <h5>Intro</h5>
                  {!isViewingOther && (
                    <button className="widget-action-link" onClick={() => navigate("/edit-profile")}>Edit details</button>
                  )}
                </div>
                
                <p className="bio-highlight-quote">{bio || "Innovating for a zero-manipulation social web ✨"}</p>

                <div className="intro-items-list">
                  <div className="intro-row-entry">
                    <div className="intro-icon-box bg-gradient-amber">
                      <BsBriefcaseFill size={15} />
                    </div>
                    <span>Works as <strong>{userWork?.position || "Full Stack Engineer"}</strong> at <strong>{userWork?.company || "Nexoria Technologies"}</strong></span>
                  </div>
                  <div className="intro-row-entry">
                    <div className="intro-icon-box bg-gradient-purple">
                      <BsMortarboardFill size={15} />
                    </div>
                    <span>Studied at <strong>{userEducation || "Computer Science and Engineering"}</strong></span>
                  </div>
                  <div className="intro-row-entry">
                    <div className="intro-icon-box bg-gradient-blue">
                      <BsGeoAltFill size={15} />
                    </div>
                    <span>Lives in <strong>{userCity || "Delhi, India"}</strong></span>
                  </div>
                  <div className="intro-row-entry">
                    <div className="intro-icon-box bg-gradient-teal">
                      <BsGeoAltFill size={15} />
                    </div>
                    <span>From <strong>{userHometown || "Deoria"}</strong></span>
                  </div>
                </div>

                {!isViewingOther && (
                  <button className="btn-full-width-soft mt-3" onClick={() => navigate("/edit-profile")}>
                    ✏️ Edit Public Details
                  </button>
                )}
              </div>

              {/* Dynamic Friends' Live Statuses & Stories Widget */}
              <div className="profile-glass-card shadow-sm friend-statuses-card">
                <div className="widget-card-title">
                  <div className="d-flex align-items-center gap-2">
                    <span className="status-live-pulse-dot"></span>
                    <div>
                      <h5 className="m-0">Friends' Statuses</h5>
                      <small className="text-muted">{friendStatuses.length} friend(s) updated status</small>
                    </div>
                  </div>
                  {!isViewingOther && (
                    <span className="widget-action-link" onClick={() => setShowCreateStoryModal(true)}>+ Add Status</span>
                  )}
                </div>

                {friendStatuses.length === 0 ? (
                  <div className="empty-status-shelf">
                    <p className="text-muted small m-0 py-1">No active friend statuses right now.</p>
                    {!isViewingOther && (
                      <button className="btn-add-status-pill mt-2" onClick={() => setShowCreateStoryModal(true)}>
                        <BsPlusLg className="me-1" /> Post a status / story
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="friend-statuses-list-vertical">
                    {friendStatuses.map((item) => (
                      <div 
                        key={item.friend_id} 
                        className="friend-status-row-item"
                        onClick={() => handleOpenStoryViewer(item.stories)}
                        title="Click to view friend's 24h status"
                      >
                        <div className={`friend-status-avatar-ring ${item.has_unviewed ? "unviewed" : ""}`}>
                          <img src={item.user_img} alt={item.name} />
                        </div>
                        <div className="friend-status-info">
                          <div className="d-flex align-items-center justify-content-between">
                            <h6>{item.name}</h6>
                            <span className="status-time-tag">{item.latest_story?.time_ago || "Active"}</span>
                          </div>
                          <p className="status-snippet-text">
                            {item.latest_story?.text_overlay || (item.latest_story?.media_type === "photo" ? "📷 Shared a photo story" : "Active 24h status")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Photos Preview Widget */}
              <div className="profile-glass-card shadow-sm">
                <div className="widget-card-title">
                  <div>
                    <h5>Photos</h5>
                    <small className="text-muted">{photos.length} photos</small>
                  </div>
                  <span className="widget-action-link" onClick={() => setActiveTab("Photos")}>See all</span>
                </div>

                {photos.length === 0 ? (
                  <p className="text-muted small m-0 py-2">No photos uploaded yet.</p>
                ) : (
                  <div className="photos-nine-grid">
                    {photos.slice(0, 6).map((src, i) => (
                      <div key={i} className="photo-thumb-wrap" onClick={() => handleOpenPhoto(src)}>
                        <img src={src.url || src} alt="thumbnail" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Friends Preview Widget */}
              <div className="profile-glass-card shadow-sm">
                <div className="widget-card-title">
                  <div>
                    <h5>Friends</h5>
                    <small className="text-muted">{friendsCount} friends</small>
                  </div>
                  <span className="widget-action-link" onClick={() => setActiveTab("Friends")}>See all</span>
                </div>

                {friends.length === 0 ? (
                  <p className="text-muted small m-0 py-2">No friends connected yet.</p>
                ) : (
                  <div className="friends-nine-grid">
                    {friends.slice(0, 6).map((f, i) => (
                      <div
                        key={i}
                        className="friend-grid-card"
                        onClick={() => setActiveChat({ id: f.id || f.user_id || f.friend_user_id, name: f.name, img: f.img, online: f.online })}
                      >
                        <div className="friend-avatar-thumb">
                          <img src={f.img} alt={f.name} />
                          {f.online && <span className="friend-online-dot"></span>}
                        </div>
                        <p className="friend-name-label">{f.name}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </aside>

            {/* Right Feed Column */}
            <main className="profile-right-feed-col">
              
              {/* Dynamic Stories & 24h Statuses Tray */}
              <div className="profile-stories-tray-wrap mb-3">
                <Stories onOpenCreateStory={() => setShowCreateStoryModal(true)} />
              </div>

              {/* Create Post Prompt Box */}
              {!isViewingOther && (
                <div className="profile-create-post-card shadow-sm">
                  <div className="create-post-top">
                    <img src={profilePic} alt="" className="post-creator-pic" />
                    <div className="fake-input-pill" onClick={() => setShowCreatePostModal(true)}>
                      What's on your mind, {displayName ? displayName.split(" ")[0] : "there"}?
                    </div>
                  </div>
                  
                  <div className="create-post-action-bar">
                    <button className="post-quick-btn text-danger" onClick={() => setShowCreatePostModal(true)}>
                      <BsFilm className="me-1" /> Live video
                    </button>
                    <button className="post-quick-btn text-success" onClick={() => setShowCreatePostModal(true)}>
                      <BsImages className="me-1" /> Photo/video
                    </button>
                    <button className="post-quick-btn text-primary" onClick={() => setShowCreatePostModal(true)}>
                      <BsStars className="me-1" /> AI Studio
                    </button>
                  </div>
                </div>
              )}

              {/* Dynamic User Posts Stream */}
              <div className="profile-posts-stream">
                {posts.length === 0 ? (
                  <div className="profile-glass-card p-4 text-center text-muted">
                    <p className="m-0">No posts published yet.</p>
                    {!isViewingOther && (
                      <button className="btn btn-sm btn-primary rounded-pill mt-2" onClick={() => setShowCreatePostModal(true)}>
                        Create your first post
                      </button>
                    )}
                  </div>
                ) : (
                  <Post posts={posts} setPosts={setPosts} onOpenChat={setActiveChat} />
                )}
              </div>
            </main>

          </div>
        )}

        {/* ================= TAB: STATUSES & STORIES ================= */}
        {activeTab === "Statuses" && (
          <div className="profile-glass-card p-4 shadow-sm">
            <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom flex-wrap gap-2">
              <div>
                <h3 className="m-0 fw-bold">Live Statuses & 24h Stories</h3>
                <small className="text-muted">Real-time status updates from friends & your profile</small>
              </div>
              {!isViewingOther && (
                <button className="btn-action-primary" onClick={() => setShowCreateStoryModal(true)}>
                  <BsPlusLg className="me-1" /> Post New Status
                </button>
              )}
            </div>

            {/* Current Profile User's Stories */}
            <div className="profile-statuses-section-block mb-4">
              <h5 className="section-subheading mb-3">
                {isViewingOther ? `${displayName}'s Active Statuses` : "Your Active Statuses"} ({userStories.length})
              </h5>
              {userStories.length === 0 ? (
                <div className="empty-status-banner p-3 text-center border rounded-3 bg-light-subtle">
                  <p className="text-muted m-0">No active status posted right now.</p>
                  {!isViewingOther && (
                    <button className="btn btn-sm btn-primary rounded-pill mt-2" onClick={() => setShowCreateStoryModal(true)}>
                      <BsPlusLg className="me-1" /> Add Status / Story
                    </button>
                  )}
                </div>
              ) : (
                <div className="status-cards-grid">
                  {userStories.map((story) => (
                    <div 
                      key={story.id} 
                      className="profile-status-grid-item"
                      onClick={() => handleOpenStoryViewer(userStories)}
                      style={story.media_type === "text" || !story.media_url ? { background: story.background_gradient } : {}}
                    >
                      {story.media_type === "photo" && story.media_url ? (
                        <img src={getStoryMediaUrl(story.media_url)} alt="Story" className="status-grid-img" />
                      ) : (
                        <div className="status-grid-text-wrap">
                          <p className={`status-grid-text font-${(story.font_style || "clean").toLowerCase()}`}>
                            {story.text_overlay || "Status Update"}
                          </p>
                        </div>
                      )}
                      <div className="status-grid-bottom-bar">
                        <span className="status-time-badge">{story.time_ago || "Active"}</span>
                        <span className="status-views-badge">👁️ {story.views_count || 0}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Friends' Statuses */}
            {!isViewingOther && (
              <div className="profile-statuses-section-block">
                <h5 className="section-subheading mb-3">
                  Friends with Active Statuses ({friendStatuses.length})
                </h5>
                {friendStatuses.length === 0 ? (
                  <p className="text-muted small m-0">None of your friends have active statuses right now.</p>
                ) : (
                  <div className="friends-status-big-grid">
                    {friendStatuses.map((item) => (
                      <div 
                        key={item.friend_id} 
                        className="friend-status-card-box"
                        onClick={() => handleOpenStoryViewer(item.stories)}
                      >
                        <div className="friend-status-card-header">
                          <img src={item.user_img} alt={item.name} className="friend-status-card-avatar" />
                          <div>
                            <h6>{item.name}</h6>
                            <small className="text-muted">{item.latest_story?.time_ago || "Recently active"}</small>
                          </div>
                        </div>
                        <div 
                          className="friend-status-card-preview"
                          style={item.latest_story?.media_type === "text" || !item.latest_story?.media_url ? { background: item.latest_story?.background_gradient } : {}}
                        >
                          {item.latest_story?.media_type === "photo" && item.latest_story?.media_url ? (
                            <img src={getStoryMediaUrl(item.latest_story.media_url)} alt="Story" />
                          ) : (
                            <p className={`font-${(item.latest_story?.font_style || "clean").toLowerCase()}`}>
                              {item.latest_story?.text_overlay || "Status Update"}
                            </p>
                          )}
                        </div>
                        <button className="btn-view-friend-status-pill">
                          <BsPlayFill className="me-1" /> View Status
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 2: ABOUT TAB ================= */}
        {activeTab === "About" && (
          <div className="profile-glass-card p-4 shadow-sm">
            <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
              <div>
                <h3 className="m-0 fw-bold">About {displayName}</h3>
                <small className="text-muted">Overview and personal information</small>
              </div>
              {!isViewingOther && (
                <button className="btn-action-primary" onClick={() => navigate("/edit-profile")}>
                  <BsPencilFill className="me-1" /> Edit Profile Info
                </button>
              )}
            </div>

            <div className="about-details-grid">
              <div className="about-info-item">
                <div className="about-icon-circle bg-primary-soft text-primary"><BsBriefcaseFill /></div>
                <div>
                  <h6>Works as <strong>{userWork?.position || "Software Engineer"}</strong> at <strong>{userWork?.company || "Nexoria Technologies"}</strong></h6>
                  <p className="text-muted m-0">Specializes in Full Stack Architecture, React, and High-Performance APIs.</p>
                </div>
              </div>

              <div className="about-info-item">
                <div className="about-icon-circle bg-success-soft text-success"><BsMortarboardFill /></div>
                <div>
                  <h6>Studied at <strong>{userEducation || "Computer Science and Engineering"}</strong></h6>
                  <p className="text-muted m-0">Class of 2024 · Graduated with Distinction</p>
                </div>
              </div>

              <div className="about-info-item">
                <div className="about-icon-circle bg-danger-soft text-danger"><BsGeoAltFill /></div>
                <div>
                  <h6>Lives in <strong>{userCity || "Delhi, India"}</strong></h6>
                  <p className="text-muted m-0">From {userHometown || "Deoria"}</p>
                </div>
              </div>

              <div className="about-info-item">
                <div className="about-icon-circle bg-warning-soft text-warning"><BsHeartFill /></div>
                <div>
                  <h6>{userStatus || "Single"}</h6>
                  <p className="text-muted m-0">Relationship status</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 3: FRIENDS TAB ================= */}
        {activeTab === "Friends" && (
          <div className="profile-glass-card p-4 shadow-sm">
            <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom flex-wrap gap-2">
              <div>
                <h3 className="m-0 fw-bold">Friends</h3>
                <span className="text-muted small">{friendsCount} total connections</span>
              </div>
              <div className="friends-search-pill">
                <BsSearch className="me-2 text-muted" />
                <input
                  type="text"
                  placeholder="Search Friends..."
                  value={friendsSearch}
                  onChange={e => setFriendsSearch(e.target.value)}
                />
              </div>
            </div>

            {filteredFriends.length === 0 ? (
              <div className="text-center py-4 text-muted">
                <p className="m-0">No friends found.</p>
                {!isViewingOther && (
                  <button className="btn btn-sm btn-primary rounded-pill mt-2" onClick={() => navigate("/friends")}>
                    Find Friends
                  </button>
                )}
              </div>
            ) : (
              <div className="friends-full-responsive-grid">
                {filteredFriends.map((f, i) => (
                  <div key={i} className="friend-extended-card shadow-sm">
                    <img src={f.img} alt={f.name} className="friend-card-avatar" />
                    <div className="friend-card-details">
                      <h5 className="m-0">{f.name}</h5>
                      <p className="text-muted small m-0">{f.mutual || f.role || "Nexoria Friend"}</p>
                      <button
                        className="btn btn-sm btn-primary-soft rounded-pill mt-2"
                        onClick={() => setActiveChat({ id: f.id || f.user_id || f.friend_user_id, name: f.name, img: f.img, online: f.online })}
                      >
                        Message
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 4: PHOTOS TAB ================= */}
        {activeTab === "Photos" && (
          <div className="profile-glass-card p-4 shadow-sm">
            <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
              <div>
                <h3 className="m-0 fw-bold">Photos</h3>
                <span className="text-muted small">{photos.length} photos uploaded</span>
              </div>
            </div>

            {photos.length === 0 ? (
              <div className="text-center py-4 text-muted">
                <p className="m-0">No photos uploaded yet.</p>
              </div>
            ) : (
              <div className="photos-full-gallery-grid">
                {photos.map((src, i) => (
                  <div key={i} className="photo-card-frame" onClick={() => handleOpenPhoto(src)}>
                    <img src={src.url || src} alt="" />
                    <div className="photo-zoom-overlay">
                      <BsSearch size={22} className="text-white" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 5: REELS TAB ================= */}
        {activeTab === "Reels" && (
          <div className="profile-glass-card p-4 shadow-sm">
            <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
              <div>
                <h3 className="m-0 fw-bold">Reels</h3>
                <span className="text-muted small">{reels.length} Vertical Shorts</span>
              </div>
              <button className="btn-action-primary" onClick={() => navigate("/reels")}>
                <BsFilm className="me-1" /> Watch All Reels
              </button>
            </div>

            {reels.length === 0 ? (
              <div className="text-center py-4 text-muted">
                <p className="m-0">No reels created yet.</p>
                <button className="btn btn-sm btn-primary rounded-pill mt-2" onClick={() => navigate("/reels")}>
                  Explore Reels
                </button>
              </div>
            ) : (
              <div className="reels-responsive-grid">
                {reels.map((r, i) => (
                  <div key={i} className="reel-card-item" onClick={() => navigate("/reels")}>
                    <img src={r.img} alt="" />
                    <div className="reel-card-gradient">
                      <p className="m-0 text-white fw-bold"><BsPlayFill /> {r.views}</p>
                      <span className="small text-white-50">{r.title}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 6: BADGES & STARS TAB ================= */}
        {activeTab === "Badges" && (
          <div className="profile-glass-card p-4 shadow-sm">
            <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
              <div>
                <h3 className="m-0 fw-bold">Creator Badges & Star Wallet</h3>
                <span className="text-muted small">Nexoria VIP Status & Achievements</span>
              </div>
              <div className="badge bg-warning-soft text-warning fs-6 px-3 py-2 rounded-pill">
                ⭐ Balance: {starsCount} Stars
              </div>
            </div>

            <div className="row g-3">
              <div className="col-md-4">
                <div className="p-3 rounded-3 border bg-light h-100 text-center">
                  <div className="fs-1 text-primary mb-2"><BsAwardFill /></div>
                  <h6 className="fw-bold">Pioneer Member</h6>
                  <p className="text-muted small m-0">Early adopter badge granted for joining Nexoria Cosmos ({userBadges.length} total active badges).</p>
                </div>
              </div>
              <div className="col-md-4">
                <div className="p-3 rounded-3 border bg-light h-100 text-center">
                  <div className="fs-1 text-success mb-2"><BsShieldFillCheck /></div>
                  <h6 className="fw-bold">TruthGuard AI Shield</h6>
                  <p className="text-muted small m-0">Verified authentic profile with {truthguardScore}% authenticity score.</p>
                </div>
              </div>
              <div className="col-md-4">
                <div className={`p-3 rounded-3 border h-100 text-center ${isVerified ? "bg-primary-soft border-primary" : "bg-light"}`}>
                  <div className={`fs-1 mb-2 ${isVerified ? "text-primary" : "text-muted"}`}>
                    <BsCheckCircleFill />
                  </div>
                  <h6 className="fw-bold">
                    {isVerified ? "Blue Tick Verified 💎" : "Blue Tick Verification"}
                  </h6>
                  <p className="text-muted small m-0">
                    {isVerified 
                      ? (isVerifiedPurchased ? "Active · Verified via Nexoria Subscription." : (followersCount >= 1000000 ? "Active · Granted for 1M+ organic followers." : "Active · Verified Account."))
                      : "Locked · Requires 1,000,000 followers or subscription purchase."
                    }
                  </p>
                  {!isViewingOther && !isVerified && (
                    <button 
                      className="btn btn-sm btn-primary rounded-pill mt-2 px-3" 
                      onClick={() => setShowVerificationModal(true)}
                    >
                      Unlock Blue Tick
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Interactive Rich Photo Lightbox Modal */}
      {selectedPhoto && (
        <div className="fullscreen-photo-lightbox" onClick={() => setSelectedPhoto(null)}>
          <div className="photo-lightbox-modal-content shadow-2xl" onClick={e => e.stopPropagation()}>
            {/* Left Image Media Pane */}
            <div className="photo-lightbox-media-pane">
              <img 
                src={selectedPhoto.url || selectedPhoto} 
                alt="Selected content" 
                className="photo-lightbox-main-img" 
              />
              
              {/* Media Floating Controls Overlay */}
              <div className="photo-media-controls-bar">
                <button 
                  className="photo-ctrl-btn" 
                  onClick={handleDownloadPhoto}
                  title="Download photo"
                >
                  <BsDownload /> <span>Download</span>
                </button>
                <button 
                  className="photo-ctrl-btn" 
                  onClick={handleSharePhoto}
                  title="Share photo"
                >
                  <BsShare /> <span>Share</span>
                </button>
              </div>

              <button className="photo-lightbox-mobile-close" onClick={() => setSelectedPhoto(null)}>✕</button>
            </div>

            {/* Right Engagement Sidebar */}
            <div className="photo-lightbox-sidebar">
              {/* Author Header */}
              <div className="photo-sidebar-header">
                <div className="d-flex align-items-center gap-2 min-w-0">
                  <img 
                    src={selectedPhoto.author_pic || profilePic} 
                    alt="" 
                    className="photo-sidebar-avatar" 
                  />
                  <div className="min-w-0">
                    <h6 className="photo-sidebar-author-name m-0 d-flex align-items-center gap-1">
                      <span className="text-truncate">{selectedPhoto.author_name || displayName}</span>
                      {(selectedPhoto.author_verified || isVerified) && (
                        <BsCheckCircleFill className="text-primary flex-shrink-0" size={13} title="Verified Creator" />
                      )}
                    </h6>
                    <small className="text-muted">{selectedPhoto.created_at || "Recently updated"}</small>
                  </div>
                </div>
                <button className="photo-sidebar-close-btn" onClick={() => setSelectedPhoto(null)}>✕</button>
              </div>

              {/* Photo Caption / Post Content */}
              {selectedPhoto.caption && (
                <div className="photo-sidebar-caption-box">
                  <p className="photo-caption-text">{selectedPhoto.caption}</p>
                </div>
              )}

              {/* Engagement Stats Bar */}
              <div className="photo-sidebar-stats-row">
                <div className="d-flex align-items-center gap-1">
                  <span className="photo-stat-icon-bubble bg-primary text-white"><BsHandThumbsUpFill size={10} /></span>
                  <span className="photo-stat-count-num"><strong>{selectedPhoto.likesCount || 0}</strong> likes</span>
                </div>
                <div className="text-muted small">
                  <span>{selectedPhoto.commentsCount || (selectedPhoto.comments?.length || 0)} comments</span>
                  {selectedPhoto.sharesCount > 0 && <span> · {selectedPhoto.sharesCount} shares</span>}
                </div>
              </div>

              {/* Action Buttons: Like, Comment, Share */}
              <div className="photo-sidebar-action-bar">
                <button 
                  className={`photo-act-btn ${selectedPhoto.isLiked ? "active-liked text-primary" : ""}`}
                  onClick={handleTogglePhotoLike}
                >
                  {selectedPhoto.isLiked ? <BsHandThumbsUpFill className="text-primary" /> : <BsHandThumbsUp />}
                  <span>Like</span>
                </button>
                <button 
                  className="photo-act-btn" 
                  onClick={() => document.getElementById("photo-comment-input-box")?.focus()}
                >
                  <BsChatLeftTextFill />
                  <span>Comment</span>
                </button>
                <button 
                  className="photo-act-btn"
                  onClick={handleSharePhoto}
                >
                  <BsShare />
                  <span>Share</span>
                </button>
              </div>

              {/* Live Comments Stream */}
              <div className="photo-sidebar-comments-list">
                {(!selectedPhoto.comments || selectedPhoto.comments.length === 0) ? (
                  <div className="text-center py-4 text-muted small">
                    <p className="m-0">No comments yet.</p>
                    <p className="m-0">Be the first to share your thoughts!</p>
                  </div>
                ) : (
                  selectedPhoto.comments.map((c, idx) => (
                    <div className="photo-comment-item-row" key={c.id || idx}>
                      <img src={c.profile || `https://i.pravatar.cc/40?u=${c.user_id || idx}`} alt="" className="photo-comment-avatar" />
                      <div className="photo-comment-content-bubble">
                        <span className="photo-comment-user-name">{c.name || "User"}</span>
                        <p className="photo-comment-body-text">{c.text || c.content}</p>
                        <div className="photo-comment-meta-actions">
                          <span className="photo-comment-time">{c.time || "Just now"}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Comment Composer Box */}
              <form className="photo-sidebar-comment-composer" onSubmit={handleAddPhotoComment}>
                <img src={profilePic} alt="" className="composer-user-avatar" />
                <div className="composer-input-pill">
                  <input 
                    id="photo-comment-input-box"
                    type="text" 
                    placeholder="Write a comment..." 
                    value={photoCommentText}
                    onChange={e => setPhotoCommentText(e.target.value)}
                  />
                  <button 
                    type="submit" 
                    className="composer-send-btn" 
                    disabled={!photoCommentText.trim()}
                  >
                    <BsSendFill />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Create Story Modal */}
      {showCreateStoryModal && <CreateStory onClose={() => setShowCreateStoryModal(false)} />}

      {/* Create Post Modal */}
      {showCreatePostModal && <CreatePostModal onClose={() => setShowCreatePostModal(false)} />}

      {/* Fullscreen Story Viewer Modal in Profile */}
      {activeStoryViewer && activeStoryViewer.length > 0 && storyViewerIndex !== null && activeStoryViewer[storyViewerIndex] && (
        <div className="story-viewer-modal-backdrop" onClick={() => { setActiveStoryViewer(null); setStoryViewerIndex(0); }}>
          <button className="story-modal-close-btn" onClick={() => { setActiveStoryViewer(null); setStoryViewerIndex(0); }} title="Close">
            <BsX size={32} />
          </button>

          {storyViewerIndex > 0 && (
            <button className="story-nav-btn prev" onClick={(e) => { e.stopPropagation(); handleStoryPrev(); }} title="Previous">
              <BsChevronLeft size={24} />
            </button>
          )}

          <div className="story-content-viewport" onClick={(e) => e.stopPropagation()}>
            <div className="story-progress-bar-track">
              {activeStoryViewer.map((s, i) => (
                <div key={s.id || i} className="progress-segment">
                  <div 
                    className="progress-fill" 
                    style={{
                      width: i < storyViewerIndex ? "100%" : i === storyViewerIndex ? `${storyViewerProgress}%` : "0%"
                    }}
                  />
                </div>
              ))}
            </div>

            <div className="story-viewer-header">
              <div className="viewer-user-meta">
                <img 
                  src={activeStoryViewer[storyViewerIndex].user_img || activeStoryViewer[storyViewerIndex].userImg || `https://i.pravatar.cc/150?u=${activeStoryViewer[storyViewerIndex].user_id}`} 
                  alt="" 
                  className="viewer-avatar" 
                />
                <div>
                  <h6>{activeStoryViewer[storyViewerIndex].is_own_story ? "Your Story" : activeStoryViewer[storyViewerIndex].name}</h6>
                  <span>{activeStoryViewer[storyViewerIndex].time_ago || activeStoryViewer[storyViewerIndex].time || "Just now"}</span>
                </div>
              </div>
              <div className="viewer-controls">
                <button 
                  className="control-icon-btn" 
                  onClick={() => setIsStoryViewerPaused(!isStoryViewerPaused)}
                  title={isStoryViewerPaused ? "Play" : "Pause"}
                >
                  {isStoryViewerPaused ? <BsPlayFill size={20} /> : <BsPauseFill size={20} />}
                </button>
              </div>
            </div>

            <div 
              className="story-main-media"
              onMouseDown={() => setIsStoryViewerPaused(true)}
              onMouseUp={() => setIsStoryViewerPaused(false)}
              onTouchStart={() => setIsStoryViewerPaused(true)}
              onTouchEnd={() => setIsStoryViewerPaused(false)}
            >
              {activeStoryViewer[storyViewerIndex].media_type === "text" || (!activeStoryViewer[storyViewerIndex].media_url && !activeStoryViewer[storyViewerIndex].storyImg) ? (
                <div 
                  className="text-story-full-canvas"
                  style={{ background: activeStoryViewer[storyViewerIndex].background_gradient || "linear-gradient(135deg, #1877f2 0%, #00d2ff 100%)" }}
                >
                  <p className={`canvas-text font-${(activeStoryViewer[storyViewerIndex].font_style || "clean").toLowerCase()}`}>
                    {activeStoryViewer[storyViewerIndex].text_overlay || "Status Update"}
                  </p>
                </div>
              ) : (
                <div className="photo-story-full-canvas">
                  <img 
                    src={getStoryMediaUrl(activeStoryViewer[storyViewerIndex].media_url || activeStoryViewer[storyViewerIndex].storyImg)} 
                    alt="Story"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600";
                    }}
                  />
                  {activeStoryViewer[storyViewerIndex].text_overlay && (
                    <div className="story-photo-caption-bar">
                      <span>{activeStoryViewer[storyViewerIndex].text_overlay}</span>
                    </div>
                  )}
                </div>
              )}

              {storyFlyingEmoji && (
                <div className="animated-flying-reaction">{storyFlyingEmoji}</div>
              )}
            </div>

            <div className="story-viewer-footer">
              {!activeStoryViewer[storyViewerIndex].is_own_story && (
                <form className="story-reply-form" onSubmit={handleStoryReply}>
                  <input 
                    type="text" 
                    placeholder={`Reply to ${activeStoryViewer[storyViewerIndex].name}...`}
                    value={storyReplyText}
                    onChange={(e) => setStoryReplyText(e.target.value)}
                  />
                  {storyReplyText.trim() && (
                    <button type="submit" className="story-send-btn"><BsSendFill size={14} /></button>
                  )}
                </form>
              )}

              <div className="story-quick-reactions">
                {["👍", "❤️", "🥰", "😆", "😮", "🔥", "⭐"].map((emoji, i) => (
                  <span 
                    key={i} 
                    className="quick-react-item" 
                    onClick={() => handleStoryReact(emoji)}
                  >
                    {emoji}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {storyViewerIndex < activeStoryViewer.length - 1 && (
            <button className="story-nav-btn next" onClick={(e) => { e.stopPropagation(); handleStoryNext(); }} title="Next">
              <BsChevronRight size={24} />
            </button>
          )}
        </div>
      )}

      {/* Cover Menus and Sheets */}
      <CoverBottomSheet
        isOpen={showCoverMenu}
        onClose={() => setShowCoverMenu(false)}
        onSeeCover={() => { setShowCoverMenu(false); setShowFullCover(true); }}
        onUpload={() => { setShowCoverMenu(false); fileInputRef.current.click(); }}
        onChoose={() => { setShowCoverMenu(false); setShowChooseCover(true); }}
      />

      {showFullCover && (
        <FullScreenCover
          coverImg={coverImg}
          onClose={() => setShowFullCover(false)}
        />
      )}

      {showChooseCover && (
        <ChooseCoverPhoto
          onClose={() => setShowChooseCover(false)}
          onSelect={(img) => {
            setCoverImg(img);
            setUserStorageItem("cover", img, currentUserId);
            updateCoverUrlApi(img, currentUserId);
            window.dispatchEvent(new Event("profile-updated"));
            setShowChooseCover(false);
          }}
          profilePic={profilePic}
        />
      )}

      {dragImage && (
        <DragToAdjust
          image={dragImage}
          profilePic={profilePic}
          onSave={async (img) => {
            setCoverImg(img);
            setUserStorageItem("cover", img, currentUserId);
            window.dispatchEvent(new Event("profile-updated"));
            if (selectedCoverFile) {
              try {
                const uploadRes = await uploadCoverFileApi(selectedCoverFile, currentUserId);
                if (uploadRes && uploadRes.cover_photo) {
                  setCoverImg(uploadRes.cover_photo);
                  setUserStorageItem("cover", uploadRes.cover_photo, currentUserId);
                  window.dispatchEvent(new Event("profile-updated"));
                }
              } catch (err) {
                updateCoverUrlApi(img, currentUserId);
              }
              setSelectedCoverFile(null);
            } else {
              updateCoverUrlApi(img, currentUserId);
            }
            setDragImage(null);
          }}
          onClose={() => { setDragImage(null); setSelectedCoverFile(null); }}
        />
      )}

      {/* Blue Tick Verification & Multi-Step Purchase Checkout Modal */}
      {showVerificationModal && (
        <div className="verif-modal-overlay" onClick={() => { if (!isPurchasingVerification) setShowVerificationModal(false); }}>
          <div className="verif-modal-card" onClick={e => e.stopPropagation()}>
            {/* Header with Step Indicator */}
            <div className="verif-modal-header">
              <h3 className="verif-modal-title">
                <BsCheckCircleFill className="text-primary" /> Nexoria Blue Tick Verification
              </h3>
              <button 
                className="verif-modal-close" 
                onClick={() => { if (!isPurchasingVerification) setShowVerificationModal(false); }}
                disabled={isPurchasingVerification}
              >
                ✕
              </button>
            </div>

            {/* Stepper Navigation */}
            {checkoutStep !== "processing" && checkoutStep !== "success" && (
              <div className="px-4 pt-3">
                <div className="verif-step-nav">
                  <div className={`verif-step-node ${checkoutStep === "plan" ? "active" : "completed"}`}>
                    <div className="verif-step-dot">1</div>
                    <span className="verif-step-label">Plan</span>
                  </div>
                  <div className={`verif-step-node ${checkoutStep === "details" ? "active" : (checkoutStep === "payment" ? "completed" : "")}`}>
                    <div className="verif-step-dot">2</div>
                    <span className="verif-step-label">Details</span>
                  </div>
                  <div className={`verif-step-node ${checkoutStep === "payment" ? "active" : ""}`}>
                    <div className="verif-step-dot">3</div>
                    <span className="verif-step-label">Payment</span>
                  </div>
                </div>
              </div>
            )}

            <div className="verif-modal-body">
              {/* ================= STEP 1: CHOOSE PLAN ================= */}
              {checkoutStep === "plan" && (
                <>
                  <p className="text-muted small m-0">
                    Blue Tick Verification is available exclusively for accounts with <strong>1,000,000+ Followers</strong> or via <strong>Nexoria Verified Subscription</strong>.
                  </p>

                  {/* 1M Followers Organic Track */}
                  <div className={`verif-rule-card ${canGetFreeVerified ? "highlight" : ""}`}>
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="verif-rule-badge-tag" style={{ background: canGetFreeVerified ? "#10b981" : "#6b7280" }}>
                        {canGetFreeVerified ? "Unlocked (Eligible)" : "Option 1: Organic Milestone"}
                      </span>
                      <span className="fw-bold text-primary small">1,000,000 Followers</span>
                    </div>
                    <h6 className="fw-bold m-0">Creator Community Milestone</h6>
                    <p className="text-muted small mt-1 mb-2">
                      Reach 1M organic followers to automatically unlock permanent free verification across the network.
                    </p>
                    <div className="d-flex justify-content-between small text-muted">
                      <span>Your Followers: <strong>{followersCount.toLocaleString()}</strong></span>
                      <span>Goal: <strong>1,000,000</strong></span>
                    </div>
                    <div className="verif-progress-track">
                      <div 
                        className="verif-progress-bar" 
                        style={{ width: `${Math.min(100, Math.max(1, (followersCount / 1000000) * 100))}%` }} 
                      />
                    </div>
                  </div>

                  {/* Option 2: Subscription Plan Selector */}
                  <div>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h6 className="fw-bold m-0">Option 2: Nexoria Verified Subscription</h6>
                      <span className="badge bg-primary-soft text-primary">Instant Active</span>
                    </div>

                    <div className="verif-plans-grid">
                      {/* Monthly Plan */}
                      <div 
                        className={`verif-plan-card ${selectedPlan === "monthly" ? "selected" : ""}`}
                        onClick={() => setSelectedPlan("monthly")}
                      >
                        <span className="fw-bold small text-muted">Monthly Plan</span>
                        <div className="verif-plan-price">₹499 <span className="fs-6 text-muted fw-normal">/ mo</span></div>
                        <span className="small text-muted mt-auto">Billed monthly · Cancel anytime</span>
                      </div>

                      {/* Yearly Plan */}
                      <div 
                        className={`verif-plan-card ${selectedPlan === "yearly" ? "selected" : ""}`}
                        onClick={() => setSelectedPlan("yearly")}
                      >
                        <span className="verif-savings-pill">Save 20%</span>
                        <span className="fw-bold small text-muted">Annual VIP Pass</span>
                        <div className="verif-plan-price">₹4,999 <span className="fs-6 text-muted fw-normal">/ yr</span></div>
                        <span className="small text-success fw-bold mt-auto">Save ₹989 + Free Priority</span>
                      </div>
                    </div>
                  </div>

                  {/* Verified Benefits */}
                  <div className="p-3 rounded-3 bg-light border">
                    <h6 className="fw-bold small mb-2">Included Verified Perks:</h6>
                    <div className="row g-2 small text-muted">
                      <div className="col-6">💎 Blue Checkmark Badge</div>
                      <div className="col-6">📈 3x Reach Algorithm Boost</div>
                      <div className="col-6">🛡️ Impersonation Protection</div>
                      <div className="col-6">⭐ Creator Star Monetization</div>
                    </div>
                  </div>

                  {isVerified ? (
                    <div className="d-flex gap-2">
                      <button className="btn btn-outline-success w-100 rounded-3 py-2 fw-bold" disabled>
                        <BsCheckCircleFill className="me-1" /> Blue Tick Currently Active
                      </button>
                      <button 
                        className="btn btn-outline-danger rounded-3 px-3" 
                        onClick={() => handleToggleVerificationDev(false)}
                        title="Deactivate Blue Tick (Dev/Test)"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <button 
                      className="verif-purchase-action-btn"
                      onClick={() => {
                        if (canGetFreeVerified) {
                          handleExecuteCheckout();
                        } else {
                          setCheckoutStep("details");
                        }
                      }}
                    >
                      {canGetFreeVerified ? "Claim Free 1M Creator Blue Tick 🎉" : "Continue to Verification Details →"}
                    </button>
                  )}

                  {/* Quick Dev Switch */}
                  <div className="d-flex justify-content-between align-items-center p-2 rounded-3 bg-light border small text-muted mt-1">
                    <span>Fast Testing Switch:</span>
                    <button 
                      className="btn btn-xs btn-sm btn-outline-primary py-1 px-3 rounded-pill"
                      onClick={() => handleToggleVerificationDev(!isVerified)}
                    >
                      {isVerified ? "Toggle OFF" : "Toggle ON (Instant Verified)"}
                    </button>
                  </div>
                </>
              )}

              {/* ================= STEP 2: DETAILS ================= */}
              {checkoutStep === "details" && (
                <>
                  <div className="d-flex align-items-center justify-content-between">
                    <h6 className="fw-bold m-0">Step 2: Creator Identity & Category</h6>
                    <span className="badge bg-light text-dark border">Govt ID Verification</span>
                  </div>
                  <p className="text-muted small m-0">
                    Provide your legal name matching your identity documents to prevent impersonation and fraud.
                  </p>

                  <div className="verif-field-group">
                    <label className="verif-field-label">Full Legal Name (as on Aadhaar / PAN / Govt ID)</label>
                    <input 
                      type="text" 
                      className="verif-field-input" 
                      placeholder="e.g. Sanny Tiwari"
                      value={legalName || displayName}
                      onChange={e => setLegalName(e.target.value)}
                    />
                  </div>

                  <div className="verif-field-group">
                    <label className="verif-field-label">Creator / Profile Category</label>
                    <select 
                      className="verif-field-input"
                      value={selectedCategory}
                      onChange={e => setSelectedCategory(e.target.value)}
                    >
                      <option value="Digital Creator & Influencer">Digital Creator & Influencer</option>
                      <option value="Tech & Software Engineer">Tech & Software Engineer</option>
                      <option value="Entrepreneur & Business Founder">Entrepreneur & Business Founder</option>
                      <option value="Artist, Music & Entertainment">Artist, Music & Entertainment</option>
                      <option value="Public Figure & Journalist">Public Figure & Journalist</option>
                      <option value="Community Leader & Pioneer">Community Leader & Pioneer</option>
                    </select>
                  </div>

                  <div className="verif-field-group">
                    <label className="verif-field-label">Verified Username Handle</label>
                    <input 
                      type="text" 
                      className="verif-field-input" 
                      value={displayHandle}
                      disabled
                      style={{ opacity: 0.8, background: "rgba(0,0,0,0.03)" }}
                    />
                  </div>

                  <div className="d-flex gap-2 mt-2">
                    <button className="btn btn-light rounded-3 px-4 fw-bold" onClick={() => setCheckoutStep("plan")}>
                      ← Back
                    </button>
                    <button className="verif-purchase-action-btn" onClick={() => setCheckoutStep("payment")}>
                      Proceed to Payment (₹{selectedPlan === "yearly" ? "4,999" : "499"}) →
                    </button>
                  </div>
                </>
              )}

              {/* ================= STEP 3: PAYMENT METHOD ================= */}
              {checkoutStep === "payment" && (
                <>
                  <div className="d-flex align-items-center justify-content-between">
                    <h6 className="fw-bold m-0">Step 3: Secure Checkout</h6>
                    <span className="badge bg-success-soft text-success fw-bold">
                      Payable: ₹{selectedPlan === "yearly" ? "4,999" : "499"}
                    </span>
                  </div>

                  {/* Payment Method Selector Tabs */}
                  <div className="verif-pay-methods">
                    <button 
                      className={`verif-pay-tab ${paymentMethod === "upi" ? "active" : ""}`}
                      onClick={() => setPaymentMethod("upi")}
                    >
                      📱 UPI / QR
                    </button>
                    <button 
                      className={`verif-pay-tab ${paymentMethod === "stars" ? "active" : ""}`}
                      onClick={() => setPaymentMethod("stars")}
                    >
                      ⭐ Stars ({starsCount})
                    </button>
                    <button 
                      className={`verif-pay-tab ${paymentMethod === "card" ? "active" : ""}`}
                      onClick={() => setPaymentMethod("card")}
                    >
                      💳 Cards
                    </button>
                  </div>

                  {/* UPI Method */}
                  {paymentMethod === "upi" && (
                    <div className="d-flex flex-column gap-3">
                      <div className="verif-qr-container">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=nexoria.official@upi&pn=NexoriaSocial&am=${selectedPlan === "yearly" ? "4999" : "499"}&cu=INR`} 
                          alt="UPI QR Code" 
                          className="verif-qr-img" 
                        />
                        <span className="small fw-bold text-primary">Scan with GPay / PhonePe / Paytm / BHIM</span>
                        <span className="text-muted" style={{ fontSize: 11 }}>Amount: ₹{selectedPlan === "yearly" ? "4,999" : "499"}</span>
                      </div>

                      <div className="verif-field-group">
                        <label className="verif-field-label">Or Enter UPI ID</label>
                        <input 
                          type="text" 
                          className="verif-field-input" 
                          placeholder="e.g. yourname@okhdfcbank"
                          value={upiId}
                          onChange={e => setUpiId(e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  {/* Stars Wallet Method */}
                  {paymentMethod === "stars" && (
                    <div className="p-3 rounded-3 bg-light border text-center">
                      <div className="fs-1 text-warning mb-1">⭐</div>
                      <h6 className="fw-bold">Pay with Star Wallet</h6>
                      <p className="text-muted small m-0">
                        Available Balance: <strong>{starsCount} Stars</strong>
                      </p>
                      <p className="text-muted small mt-1">
                        Cost: <strong>{selectedPlan === "yearly" ? "4,999" : "499"} Stars</strong>
                      </p>
                    </div>
                  )}

                  {/* Card Method */}
                  {paymentMethod === "card" && (
                    <div className="d-flex flex-column gap-2">
                      <div className="verif-field-group">
                        <label className="verif-field-label">Card Number</label>
                        <input 
                          type="text" 
                          className="verif-field-input" 
                          placeholder="4111 2222 3333 4444"
                          maxLength={19}
                          value={cardNumber}
                          onChange={e => setCardNumber(e.target.value)}
                        />
                      </div>
                      <div className="row g-2">
                        <div className="col-6">
                          <label className="verif-field-label">Expiry MM/YY</label>
                          <input 
                            type="text" 
                            className="verif-field-input" 
                            placeholder="12/28"
                            maxLength={5}
                            value={cardExp}
                            onChange={e => setCardExp(e.target.value)}
                          />
                        </div>
                        <div className="col-6">
                          <label className="verif-field-label">CVV</label>
                          <input 
                            type="password" 
                            className="verif-field-input" 
                            placeholder="123"
                            maxLength={4}
                            value={cardCvv}
                            onChange={e => setCardCvv(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="d-flex gap-2 mt-2">
                    <button className="btn btn-light rounded-3 px-4 fw-bold" onClick={() => setCheckoutStep("details")}>
                      ← Back
                    </button>
                    <button 
                      className="verif-purchase-action-btn"
                      onClick={handleExecuteCheckout}
                      disabled={isPurchasingVerification}
                    >
                      <BsStars /> Pay ₹{selectedPlan === "yearly" ? "4,999" : "499"} & Activate
                    </button>
                  </div>
                </>
              )}

              {/* ================= STEP 4: PROCESSING STATE ================= */}
              {checkoutStep === "processing" && (
                <div className="verif-success-hero py-4">
                  <div className="verif-badge-burst">
                    <BsCheckCircleFill />
                  </div>
                  <h5 className="fw-bold mb-1">Processing Blue Tick Verification...</h5>
                  <p className="text-primary small fw-bold mb-3">{processingMsg}</p>
                  <div className="w-100 px-4">
                    <div className="verif-progress-track">
                      <div className="verif-progress-bar" style={{ width: "85%" }} />
                    </div>
                  </div>
                  <span className="text-muted small mt-2">Please do not close this window</span>
                </div>
              )}

              {/* ================= STEP 5: SUCCESS & RECEIPT ================= */}
              {checkoutStep === "success" && (
                <div className="verif-success-hero">
                  <div className="verif-badge-burst" style={{ background: "linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(24, 119, 242, 0.25))" }}>
                    <BsClockHistory className="text-warning" />
                  </div>
                  <h4 className="fw-bold mb-1">Application Submitted for Admin Review! ⏳💎</h4>
                  <p className="text-muted small mb-3">
                    Your verification application & payment receipt have been sent to Admin. Your official Blue Tick checkmark badge will be activated automatically once Admin verifies your details.
                  </p>

                  <div className="verif-receipt-box mb-3 text-start">
                    <div className="verif-receipt-row">
                      <span>Transaction ID:</span>
                      <strong>{orderReceipt?.transaction_id || `NEX-VFY-${Date.now()}`}</strong>
                    </div>
                    <div className="verif-receipt-row">
                      <span>Status:</span>
                      <span className="badge bg-warning text-dark">Under Admin Review</span>
                    </div>
                    <div className="verif-receipt-row">
                      <span>Plan Name:</span>
                      <strong>{orderReceipt?.plan_name || (selectedPlan === "yearly" ? "Annual Pass" : "Monthly Subscription")}</strong>
                    </div>
                    <div className="verif-receipt-row">
                      <span>Amount Paid:</span>
                      <strong className="text-success">₹{orderReceipt?.amount_paid || (selectedPlan === "yearly" ? 4999 : 499)}</strong>
                    </div>
                    <div className="verif-receipt-row">
                      <span>Applicant Name:</span>
                      <strong>{orderReceipt?.legal_name || legalName || displayName}</strong>
                    </div>
                  </div>

                  <button 
                    className="verif-purchase-action-btn"
                    onClick={() => {
                      setShowVerificationModal(false);
                      setCheckoutStep("plan");
                    }}
                  >
                    Done & Back to Profile ✨
                  </button>
                </div>
              )}

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
}

export default Profile;