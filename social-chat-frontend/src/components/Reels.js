import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { 
  BsHandThumbsUp, BsHandThumbsUpFill, BsHeartFill, BsChatDots, 
  BsShare, BsBookmark, BsBookmarkFill, BsVolumeMuteFill, 
  BsVolumeUpFill, BsChevronUp, BsChevronDown, BsSendFill,
  BsX, BsMusicNoteBeamed, BsPlayFill, BsCameraVideoFill,
  BsSearch, BsCheckCircleFill, BsFire,
  BsStarFill, BsBroadcast, BsCollectionPlayFill, BsEyeFill,
  BsThreeDots, BsLink45Deg, BsWhatsapp,
  BsSpeedometer2, BsArrowRepeat, BsLightningChargeFill,
  BsPlusLg
} from "react-icons/bs";
import Header from "./Header";
import MenuIcons from "./MenuIcons";
import ChatDrawer from "./ChatDrawer";
import ReelStory from "./ReelStory";
import ReelOptionsBottomSheet from "./ReelOptionsBottomSheet";
import MicroTipModal from "./MicroTipModal";
import CreateWatchModal from "./CreateWatchModal";
import WatchPartyModal from "./WatchPartyModal";
import { getActiveUserId, getActiveUserName, getActiveUserFirstName, getUserStorageItem } from "../services/profileApi";
import { 
  fetchReelsFeedApi, 
  fetchWatchFeedApi,
  reactToReelApi, 
  fetchReelCommentsApi, 
  addReelCommentApi, 
  toggleSaveReelApi, 
  sendReelStarsApi, 
  registerReelViewApi, 
  registerReelShareApi,
  getReelMediaUrl 
} from "../services/reelsApi";
import "./css/Reels.css";

// 7 Nexoria Reactions
const REACTIONS = [
  { id: "like", label: "Like", emoji: "👍", color: "#1877F2" },
  { id: "love", label: "Love", emoji: "❤️", color: "#F33E5B" },
  { id: "care", label: "Care", emoji: "🥰", color: "#F7B125" },
  { id: "haha", label: "Haha", emoji: "😆", color: "#F7B125" },
  { id: "wow", label: "Wow", emoji: "😮", color: "#F7B125" },
  { id: "sad", label: "Sad", emoji: "😢", color: "#F7B125" },
  { id: "angry", label: "Angry", emoji: "😡", color: "#E9710F" },
  { id: "fire", label: "Fire", emoji: "🔥", color: "#FF5722" }
];

// Initial Preset Reels (9:16 Vertical fallback)
const INITIAL_REELS = [
  {
    id: 101,
    creatorName: "Cricket Chronicles",
    creatorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
    isVerified: true,
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    posterUrl: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800",
    caption: "Unbelievable last-over finish in the World Cup final! 🔥 Watch till the end for the masterstroke! 🏏 #Cricket #FinalOver #ThrillingMatch",
    songTitle: "Stadium Echoes - Official Crowd Anthem",
    category: "Sports",
    likes: "84.5K",
    liked: false,
    reactionType: null,
    starsCount: 350,
    views: "1.2M",
    commentsCount: 420,
    saved: false,
    isFollowing: false,
    timeAgo: "2h ago",
    comments: [
      { id: 1, name: "Rohit Sharma Fan", avatar: "https://i.pravatar.cc/100?img=12", text: "Pure masterclass under pressure! 🔥👏", time: "1h ago", likes: 24 },
      { id: 2, name: "Priya Patel", avatar: "https://i.pravatar.cc/100?img=32", text: "Still having goosebumps watching this finish! ❤️", time: "45m ago", likes: 12 },
      { id: 3, name: "Aman Verma", avatar: "https://i.pravatar.cc/100?img=44", text: "Best moment of 2026 cricket so far!", time: "15m ago", likes: 5 }
    ]
  },
  {
    id: 102,
    creatorName: "TechNova AI Studio",
    creatorAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100",
    isVerified: true,
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    posterUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800",
    caption: "The world's first quantum neural processor unveiled today! 🤖 Computing at the speed of light! #TechAI #Quantum2026 #Innovation",
    songTitle: "Cyberpunk Pulse - Future Beat",
    category: "Tech & AI",
    likes: "49.2K",
    liked: true,
    reactionType: "fire",
    starsCount: 820,
    views: "680K",
    commentsCount: 198,
    saved: true,
    isFollowing: true,
    timeAgo: "5h ago",
    comments: [
      { id: 1, name: "Devansh Kumar", avatar: "https://i.pravatar.cc/100?img=60", text: "This will revolutionize agentic computing forever.", time: "3h ago", likes: 45 },
      { id: 2, name: "Sarah Jenkins", avatar: "https://i.pravatar.cc/100?img=49", text: "Is this shipping for developers this quarter?", time: "2h ago", likes: 8 }
    ]
  },
  {
    id: 103,
    creatorName: "Wanderlust Nomad",
    creatorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
    isVerified: true,
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    posterUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800",
    caption: "Hidden emerald waterfall valley tucked away in the deep Himalayas 🌊 Would you cliff jump here? ⛺ #TravelIndia #Himalayas #Wanderlust",
    songTitle: "Acoustic Nature Harmony - Ambient Melody",
    category: "Travel",
    likes: "128K",
    liked: false,
    reactionType: null,
    starsCount: 1420,
    views: "2.4M",
    commentsCount: 856,
    saved: false,
    isFollowing: false,
    timeAgo: "1d ago",
    comments: [
      { id: 1, name: "Ananya Roy", avatar: "https://i.pravatar.cc/100?img=25", text: "Pinned on my map immediately! 🏔️✨", time: "18h ago", likes: 88 },
      { id: 2, name: "Vikas Mehra", avatar: "https://i.pravatar.cc/100?img=68", text: "Water looks so crystal clear and freezing cold!", time: "12h ago", likes: 19 }
    ]
  },
  {
    id: 104,
    creatorName: "Chef Ranveer's Kitchen",
    creatorAvatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100",
    isVerified: true,
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4",
    posterUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800",
    caption: "The secret 60-second crispy street paneer tikka recipe! 🧀 Secret masala revealed in the end! #Foodie #StreetFood #PaneerLovers",
    songTitle: "Desi Dhaba Beats - High Energy",
    category: "Food",
    likes: "94.8K",
    liked: false,
    reactionType: null,
    starsCount: 560,
    views: "1.8M",
    commentsCount: 310,
    saved: false,
    isFollowing: false,
    timeAgo: "2d ago",
    comments: [
      { id: 1, name: "Neha Gupta", avatar: "https://i.pravatar.cc/100?img=36", text: "Making this tonight for dinner! Looks so yummy 😋", time: "1d ago", likes: 31 }
    ]
  },
  {
    id: 105,
    creatorName: "Pro Gamer League",
    creatorAvatar: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=100",
    isVerified: false,
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    posterUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800",
    caption: "Insane 1v4 clutch ace in championship grand finals! 🎮 How did he spot that headshot?! 🎯 #Gaming #Esports #ClutchMoment",
    songTitle: "EDM Victory Anthem - Drop Beat",
    category: "Gaming",
    likes: "61.3K",
    liked: false,
    reactionType: null,
    starsCount: 940,
    views: "920K",
    commentsCount: 240,
    saved: false,
    isFollowing: false,
    timeAgo: "3d ago",
    comments: [
      { id: 1, name: "Kabir X", avatar: "https://i.pravatar.cc/100?img=15", text: "Cleanest flick shot of the tournament hands down! 🎯", time: "2d ago", likes: 52 }
    ]
  }
];

// Long-Form Nexoria Watch Videos (16:9)
const WATCH_VIDEOS = [
  {
    id: 201,
    title: "Building an Autonomous AI Agent Ecosystem from Scratch in 2026 | Full Masterclass",
    creatorName: "NextGen Developers Hub",
    creatorAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100",
    isVerified: true,
    duration: "24:18",
    views: "1.4M views",
    timeAgo: "3 days ago",
    category: "Tech & AI",
    thumbnail: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1000",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    description: "Deep dive into multi-agent workflows, tool routing, memory caching, and state machines with modern web frameworks. Complete source code walkthrough included!",
    likes: "74K",
    liked: false,
    reactionType: null,
    commentsCount: 1820,
    saved: false,
    isFollowing: true
  },
  {
    id: 202,
    title: "India vs Australia T20 Final Thriller - Extended Match Highlights & Dressing Room Celebrations 🏆",
    creatorName: "Star Sports Network",
    creatorAvatar: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=100",
    isVerified: true,
    duration: "18:45",
    views: "4.8M views",
    timeAgo: "1 day ago",
    category: "Sports",
    thumbnail: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=1000",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    description: "Relive every boundary, wicket, and the breathless final over that decided the World Championship! Includes exclusive post-match interviews.",
    likes: "320K",
    liked: true,
    reactionType: "love",
    commentsCount: 8900,
    saved: true,
    isFollowing: false
  },
  {
    id: 203,
    title: "Top 10 Hidden Gem Destinations in South Asia You Must Visit Before You Turn 30 ✈️🌏",
    creatorName: "Travel Infinite Series",
    creatorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
    isVerified: true,
    duration: "15:20",
    views: "890K views",
    timeAgo: "5 days ago",
    category: "Travel",
    thumbnail: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1000",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    description: "From secret island lagoons in Kerala to mist-shrouded tea valleys in Munnar and high mountain monasteries in Ladakh.",
    likes: "58K",
    liked: false,
    reactionType: null,
    commentsCount: 640,
    saved: false,
    isFollowing: false
  }
];

// Live Broadcast Data
const LIVE_STREAMS = [
  {
    id: 301,
    streamer: "Nexoria Gaming Live 🎮",
    avatar: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=100",
    title: "🔥 Grand Finals Invitational - Live Ranked Matches with Viewers! [Giveaway at 50K Views]",
    viewers: "38.4K",
    category: "Gaming",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
    thumbnail: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1000",
    chatMessages: [
      { user: "Aryan_99", text: "LET'S GOOO! Clutch that round! 🔥", color: "#45bd62" },
      { user: "Pooja_Sharma", text: "The strategy is unreal today 👏", color: "#1877f2" },
      { user: "GamerBoy_Pro", text: "Sent 100 Stars! Keep slaying! ⭐⭐", color: "#f7b125" },
      { user: "Vikram_Dev", text: "That weapon loadout is super aggressive!", color: "#e4e6eb" }
    ]
  },
  {
    id: 302,
    streamer: "Cosmos Tech Talk 🚀",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100",
    title: "🔴 Live Q&A: The Future of Quantum Web & Real-Time AI Assistants with Lead Engineers",
    viewers: "19.2K",
    category: "Tech & AI",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackSeeTheWorld.mp4",
    thumbnail: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1000",
    chatMessages: [
      { user: "Karan_Tech", text: "How does the memory persistence work in browser?", color: "#1877f2" },
      { user: "Sophia_AI", text: "Excited for the upcoming developer beta! 🎉", color: "#f33e5b" },
      { user: "Amit_92", text: "Hello from Bangalore team! 👋", color: "#45bd62" }
    ]
  }
];

// Trending Channels for Sidebar
const TRENDING_CHANNELS = [
  { id: 1, name: "ICC Cricket World", subscribers: "14.2M", avatar: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=100", followed: false },
  { id: 2, name: "TechCrunch Pulse", subscribers: "8.6M", avatar: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=100", followed: true },
  { id: 3, name: "Discovery Planet", subscribers: "21.5M", avatar: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=100", followed: false },
  { id: 4, name: "MasterChef India Live", subscribers: "5.3M", avatar: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=100", followed: false }
];

const CATEGORIES = [
  "✨ All", "🔥 Trending", "💻 Tech & AI", "🏏 Sports", 
  "🎮 Gaming", "✈️ Travel", "🍳 Food", "🎵 Music", "😂 Comedy"
];

export default function Reels({ defaultTab }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  // Navigation Modes: "reels" | "watch" | "live" | "saved"
  const [activeTab, setActiveTab] = useState(() => {
    if (defaultTab === "watch" || location.pathname === "/watch") return "watch";
    return "reels";
  });

  useEffect(() => {
    if (location.pathname === "/watch" || defaultTab === "watch") {
      setActiveTab("watch");
    }
  }, [location.pathname, defaultTab]);

  const [selectedCategory, setSelectedCategory] = useState("✨ All");
  const [searchQuery, setSearchQuery] = useState("");

  // Reels State - initialized with fallback, dynamic from backend MySQL
  const [reelsList, setReelsList] = useState(() => {
    try {
      const savedUserReels = JSON.parse(localStorage.getItem("nexoria_reels_list") || "[]");
      const sanitized = savedUserReels.map(r => ({
        ...r,
        videoUrl: (r.videoUrl && r.videoUrl.startsWith("blob:")) 
          ? "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" 
          : r.videoUrl
      }));
      return sanitized.length > 0 ? [...sanitized, ...INITIAL_REELS] : INITIAL_REELS;
    } catch {
      return INITIAL_REELS;
    }
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Watch Feed State
  const [watchFeed, setWatchFeed] = useState(WATCH_VIDEOS);
  const [channels, setChannels] = useState(TRENDING_CHANNELS);

  // Live Streams State
  const [liveStreams, setLiveStreams] = useState(LIVE_STREAMS);
  const [liveChatInput, setLiveChatInput] = useState("");
  const [activeLiveIndex, setActiveLiveIndex] = useState(0);

  // UI Interactive States
  const [showCommentsDrawer, setShowCommentsDrawer] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [showShareModal, setShowShareModal] = useState(false);
  const [, setShareTargetReel] = useState(null);
  const [hoveredReactionReelId, setHoveredReactionReelId] = useState(null);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [doubleTapHeart, setDoubleTapHeart] = useState(false);
  const [starAwarding, setStarAwarding] = useState(false);
  const [showCreateReelModal, setShowCreateReelModal] = useState(false);
  const [showCreateWatchModal, setShowCreateWatchModal] = useState(false);
  const [showWatchPartyModal, setShowWatchPartyModal] = useState(false);
  const [selectedPartyVideo, setSelectedPartyVideo] = useState(null);
  const [showTipModal, setShowTipModal] = useState(false);
  const [activeChat, setActiveChat] = useState(null);

  // Nexoria 3-Dot Options Bottom Sheet States
  const [showReelOptionsModal, setShowReelOptionsModal] = useState(false);
  const [quality, setQuality] = useState("Auto (Recommended)");
  const [captionsEnabled, setCaptionsEnabled] = useState(false);
  const [isClearMode, setIsClearMode] = useState(false);
  const [autoScrollNext, setAutoScrollNext] = useState(true);

  const videoRef = useRef(null);
  const liveChatContainerRef = useRef(null);

  // Toast Notification Helper
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Load Dynamic Reels Feed from Database API
  const loadReelsFeed = async () => {
    try {
      const activeUserId = getActiveUserId();
      const res = await fetchReelsFeedApi(activeUserId, selectedCategory);
      if (res && res.success && res.data && res.data.length > 0) {
        const sanitized = res.data.map(r => ({
          ...r,
          videoUrl: getReelMediaUrl(r.videoUrl || r.video_url),
          posterUrl: getReelMediaUrl(r.posterUrl || r.thumbnail_url),
          creatorAvatar: getReelMediaUrl(r.creatorAvatar)
        }));
        setReelsList(sanitized);
      }
    } catch (err) {
      console.warn("Could not load backend reels feed:", err);
    }
  };

  // Load Dynamic 16:9 Watch Feed from Database API
  const loadWatchFeed = async () => {
    try {
      const activeUserId = getActiveUserId();
      const res = await fetchWatchFeedApi(activeUserId, selectedCategory);
      if (res && res.success && res.data && res.data.length > 0) {
        const sanitized = res.data.map(v => ({
          ...v,
          videoUrl: getReelMediaUrl(v.videoUrl || v.video_url),
          thumbnail: getReelMediaUrl(v.thumbnail || v.thumbnail_url || v.posterUrl),
          posterUrl: getReelMediaUrl(v.thumbnail || v.thumbnail_url || v.posterUrl),
          creatorAvatar: getReelMediaUrl(v.creatorAvatar)
        }));
        setWatchFeed(sanitized);
      }
    } catch (err) {
      console.warn("Could not load backend watch feed:", err);
    }
  };

  // Initial load & category changes
  useEffect(() => {
    loadReelsFeed();
    loadWatchFeed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]);

  // Sync with user created reels/watch videos on broadcast events
  useEffect(() => {
    const handleReelsUpdated = () => {
      loadReelsFeed();
      loadWatchFeed();
    };
    window.addEventListener("nexoria_reels_updated", handleReelsUpdated);
    window.addEventListener("nexoria_watch_video_created", handleReelsUpdated);
    return () => {
      window.removeEventListener("nexoria_reels_updated", handleReelsUpdated);
      window.removeEventListener("nexoria_watch_video_created", handleReelsUpdated);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]);

  // Update HTML5 video playback rate programmatically
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed, currentIndex]);

  // Filter Reels based on Category
  const filteredReels = reelsList.filter(reel => {
    if (selectedCategory === "✨ All" || selectedCategory === "🔥 Trending") return true;
    return reel.category?.toLowerCase() === selectedCategory.replace(/[^a-zA-Z &]/g, "").trim().toLowerCase();
  });

  const currentReel = filteredReels[currentIndex] || filteredReels[0] || reelsList[0];

  // Register View in database when active reel changes
  useEffect(() => {
    if (currentReel?.id && typeof currentReel.id === "number") {
      registerReelViewApi(currentReel.id).catch(() => {});
    }
  }, [currentIndex, currentReel?.id]);

  // Next / Previous Navigation
  const handleNextReel = () => {
    if (currentIndex < filteredReels.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsPlaying(true);
    } else {
      showToast("🎉 You have caught up with all current reels!");
    }
  };

  const handlePrevReel = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsPlaying(true);
    }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  // Keyboard navigation for Reels
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (showCommentsDrawer || showShareModal || showCreateReelModal) return;
      if (activeTab === "reels") {
        if (e.key === "ArrowDown" || e.key === "j") {
          handleNextReel();
        } else if (e.key === "ArrowUp" || e.key === "k") {
          handlePrevReel();
        } else if (e.key === " " || e.key === "k") {
          e.preventDefault();
          togglePlayPause();
        } else if (e.key === "m" || e.key === "M") {
          setIsMuted(prev => !prev);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, filteredReels.length, activeTab, isPlaying, showCommentsDrawer, showShareModal, showCreateReelModal]);

  // Video Time Update & Autoplay Next
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration || 0);
    }
  };

  const handleVideoEnded = () => {
    if (autoScrollNext && currentIndex < filteredReels.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsPlaying(true);
    } else {
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => {});
      }
    }
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    if (videoRef.current && duration > 0) {
      videoRef.current.currentTime = pos * duration;
      setCurrentTime(pos * duration);
    }
  };

  // Double tap to like with heart ripple
  const handleDoubleTap = () => {
    setDoubleTapHeart(true);
    setTimeout(() => setDoubleTapHeart(false), 900);
    if (!currentReel.liked) {
      handleReactionSelect(currentReel.id, "love");
    }
  };

  // Dynamic Database Reaction Handler
  const handleReactionSelect = async (reelId, reactionId) => {
    const activeUserId = getActiveUserId();
    const reactionObj = REACTIONS.find(r => r.id === reactionId) || REACTIONS[0];
    
    // Optimistic UI state update
    setReelsList(prev => prev.map(reel => {
      if (reel.id !== reelId) return reel;
      const isAlready = reel.liked && reel.reactionType === reactionId;
      return {
        ...reel,
        liked: !isAlready,
        reactionType: isAlready ? null : reactionId,
        likes: isAlready ? `${Math.max(0, (parseInt(reel.likes) || 1) - 1)}` : `${(parseInt(reel.likes) || 0) + 1}`
      };
    }));
    setHoveredReactionReelId(null);
    showToast(`Reacted with ${reactionObj.emoji} ${reactionObj.label}!`);

    // Persist to MySQL database via API
    if (reelId && activeUserId) {
      try {
        const res = await reactToReelApi(reelId, activeUserId, reactionId);
        if (res && res.success) {
          setReelsList(prev => prev.map(reel => {
            if (reel.id !== reelId) return reel;
            return {
              ...reel,
              liked: res.liked,
              reactionType: res.reactionType,
              likes: res.likes || reel.likes,
              likesCount: res.likesCount || reel.likesCount
            };
          }));
        }
      } catch (err) {
        console.warn("React API sync error:", err);
      }
    }
  };

  // Dynamic Database Star Tipping Action
  const handleSendStars = async (reelId, amount = 50) => {
    const activeUserId = getActiveUserId();
    setStarAwarding(true);
    setTimeout(() => setStarAwarding(false), 1500);

    setReelsList(prev => prev.map(reel => {
      if (reel.id !== reelId) return reel;
      return { ...reel, starsCount: (reel.starsCount || 0) + amount };
    }));

    showToast(`⭐ Sent ${amount} Stars to creator! Thank you for supporting!`);

    if (reelId && activeUserId) {
      try {
        await sendReelStarsApi(reelId, activeUserId, amount);
      } catch (err) {
        console.warn("Star API sync error:", err);
      }
    }
  };

  // Dynamic Database Save / Bookmark Reel
  const handleToggleSave = async (reelId) => {
    const activeUserId = getActiveUserId();
    setReelsList(prev => prev.map(reel => {
      if (reel.id !== reelId) return reel;
      const nextSaved = !reel.saved;
      showToast(nextSaved ? "💾 Reel saved to your collection!" : "Removed from saved collection.");
      return { ...reel, saved: nextSaved };
    }));

    if (reelId && activeUserId) {
      try {
        await toggleSaveReelApi(reelId, activeUserId);
      } catch (err) {
        console.warn("Save API sync error:", err);
      }
    }
  };

  // Navigate to Creator Profile with User Details
  const handleNavigateToProfile = (creator) => {
    if (!creator) return;
    navigate("/profile", { 
      state: { 
        user: {
          creatorName: creator.creatorName || creator.name,
          creatorAvatar: creator.creatorAvatar || creator.avatar || creator.img,
          category: creator.category || "Creator",
          isVerified: creator.isVerified || false,
          views: creator.views || "10K views",
          timeAgo: creator.timeAgo || "Recently",
          caption: creator.caption || creator.description || "Creator on Nexoria",
          videoUrl: creator.videoUrl,
          posterUrl: creator.posterUrl || creator.thumbnail,
          isFollowing: creator.isFollowing || false
        }
      } 
    });
  };

  // Follow Creator Toggle
  const handleToggleFollow = (creatorName) => {
    setReelsList(prev => prev.map(reel => {
      if (reel.creatorName !== creatorName) return reel;
      return { ...reel, isFollowing: !reel.isFollowing };
    }));
    setChannels(prev => prev.map(ch => {
      if (ch.name !== creatorName) return ch;
      return { ...ch, followed: !ch.followed };
    }));
  };

  // Sync fresh comments from database when comments drawer opens
  useEffect(() => {
    if (showCommentsDrawer && currentReel?.id) {
      const activeUserId = getActiveUserId();
      fetchReelCommentsApi(currentReel.id, activeUserId).then(res => {
        if (res && res.success && res.data) {
          setReelsList(prev => prev.map(r => {
            if (r.id !== currentReel.id) return r;
            return {
              ...r,
              comments: res.data,
              commentsCount: res.count
            };
          }));
        }
      }).catch(() => {});
    }
  }, [showCommentsDrawer, currentReel?.id]);

  // Dynamic Database Comments Posting
  const handleAddComment = async (e) => {
    e?.preventDefault();
    if (!commentText.trim()) return;

    const activeUserId = getActiveUserId();
    const commentName = getActiveUserName();
    const userAvatar = getUserStorageItem("avatar", `https://i.pravatar.cc/150?u=${activeUserId}`, activeUserId);

    const tempComment = {
      id: Date.now(),
      name: commentName,
      avatar: userAvatar,
      text: commentText.trim(),
      time: "Just now",
      likes: 0
    };

    setReelsList(prev => prev.map(reel => {
      if (reel.id !== currentReel.id) return reel;
      return {
        ...reel,
        comments: [tempComment, ...(reel.comments || [])],
        commentsCount: (reel.commentsCount || 0) + 1
      };
    }));

    const textToSubmit = commentText.trim();
    setCommentText("");
    showToast("💬 Comment posted!");

    // Persist comment to MySQL database
    if (currentReel?.id && activeUserId) {
      try {
        const res = await addReelCommentApi(currentReel.id, activeUserId, textToSubmit);
        if (res && res.success && res.data) {
          setReelsList(prev => prev.map(reel => {
            if (reel.id !== currentReel.id) return reel;
            const updatedComments = (reel.comments || []).map(c => c.id === tempComment.id ? res.data : c);
            return {
              ...reel,
              comments: updatedComments,
              commentsCount: res.commentsCount || reel.commentsCount
            };
          }));
        }
      } catch (err) {
        console.warn("Comment API sync error:", err);
      }
    }
  };

  // Live Stream Chat send
  const handleSendLiveMessage = (e) => {
    e?.preventDefault();
    if (!liveChatInput.trim()) return;

    const userFirstName = getActiveUserFirstName("You");
    const newMsg = {
      user: userFirstName,
      text: liveChatInput.trim(),
      color: "#ffc107"
    };

    setLiveStreams(prev => prev.map((stream, idx) => {
      if (idx !== activeLiveIndex) return stream;
      return {
        ...stream,
        chatMessages: [...stream.chatMessages, newMsg]
      };
    }));

    setLiveChatInput("");
    if (liveChatContainerRef.current) {
      liveChatContainerRef.current.scrollTop = liveChatContainerRef.current.scrollHeight;
    }
  };

  return (
    <div className="reels-hub-page-root">
      <Header onOpenChat={setActiveChat} />

      {/* Main Container */}
      <div className="reels-hub-main-wrapper">
        
        {/* Top Sticky Hub Navigation Bar */}
        <div className="reels-subnav-container">
          <div className="reels-subnav-content">
            {/* View Mode Tabs */}
            <div className="reels-mode-tabs">
              <button 
                className={`mode-tab-btn ${activeTab === "reels" ? "active" : ""}`}
                onClick={() => { setActiveTab("reels"); setCurrentIndex(0); }}
              >
                <BsPlayFill size={20} />
                <span>{t("reels")}</span>
              </button>

              <button 
                className={`mode-tab-btn ${activeTab === "watch" ? "active" : ""}`}
                onClick={() => setActiveTab("watch")}
              >
                <BsCollectionPlayFill size={18} />
                <span>{t("watch_feed")}</span>
              </button>

              <button 
                className={`mode-tab-btn live-tab-btn ${activeTab === "live" ? "active" : ""}`}
                onClick={() => setActiveTab("live")}
              >
                <span className="live-pulse-indicator"></span>
                <BsBroadcast size={18} />
                <span>{t("live_streams")}</span>
              </button>

              <button 
                className={`mode-tab-btn ${activeTab === "saved" ? "active" : ""}`}
                onClick={() => setActiveTab("saved")}
              >
                <BsBookmarkFill size={17} />
                <span>{t("saved")} ({reelsList.filter(r => r.saved).length})</span>
              </button>
            </div>

            {/* Quick Upload Action */}
            <div className="reels-subnav-actions">
              {activeTab === "watch" ? (
                <button 
                  className="btn-create-reel-top btn-create-watch-top"
                  onClick={() => setShowCreateWatchModal(true)}
                  style={{ background: "linear-gradient(135deg, #1877f2, #8b5cf6)" }}
                >
                  <BsCameraVideoFill size={16} />
                  <span>Upload to Watch</span>
                </button>
              ) : (
                <button 
                  className="btn-create-reel-top"
                  onClick={() => setShowCreateReelModal(true)}
                >
                  <BsCameraVideoFill size={16} />
                  <span>{t("create_reel")}</span>
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Pills Carousel */}
          <div className="reels-category-carousel">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                className={`category-pill-btn ${selectedCategory === cat ? "active" : ""}`}
                onClick={() => {
                  setSelectedCategory(cat);
                  setCurrentIndex(0);
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* MODE 1: VERTICAL 9:16 REELS SHORTS PLAYER                     */}
        {/* ------------------------------------------------------------- */}
        {activeTab === "reels" && (
          <div className="reels-shorts-viewport-layout">
            
            {/* Desktop Vertical Up/Down Nav buttons */}
            <div className="reels-nav-arrows-column">
              <button 
                className="reel-nav-circle-btn" 
                disabled={currentIndex === 0} 
                onClick={handlePrevReel}
                title="Previous Reel (Key: ↑)"
              >
                <BsChevronUp size={22} />
              </button>
              <span className="reels-counter-indicator">
                {currentIndex + 1} / {filteredReels.length}
              </span>
              <button 
                className="reel-nav-circle-btn" 
                disabled={currentIndex === filteredReels.length - 1} 
                onClick={handleNextReel}
                title="Next Reel (Key: ↓)"
              >
                <BsChevronDown size={22} />
              </button>
            </div>

            {/* Main Stage & Right Floating Interaction Bar */}
            <div className="reels-stage-with-actions">
              
              {/* Vertical 9:16 Reel Player Card */}
              <div 
                className={`reels-video-player-card shadow-lg ${isClearMode ? "is-clear-mode" : ""}`}
                onDoubleClick={handleDoubleTap}
              >
                {/* HTML5 Video Element */}
                <video
                  ref={videoRef}
                  key={currentReel?.id}
                  src={currentReel?.videoUrl}
                  poster={currentReel?.posterUrl}
                  playsInline
                  autoPlay={isPlaying}
                  muted={isMuted}
                  onError={(e) => {
                    e.target.src = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";
                  }}
                  onTimeUpdate={handleTimeUpdate}
                  onEnded={handleVideoEnded}
                  onClick={isClearMode ? () => setIsClearMode(false) : togglePlayPause}
                  className="reel-html5-video"
                />

                {/* Clear Mode Exit Indicator */}
                {isClearMode && (
                  <div className="reel-clear-mode-floating-banner" onClick={() => setIsClearMode(false)}>
                    <span>✨ Clear Mode Active • Tap screen to restore UI</span>
                  </div>
                )}

                {/* Double Tap Heart Ripple Effect */}
                {doubleTapHeart && (
                  <div className="double-tap-heart-animation">
                    <BsHeartFill size={88} className="heart-pop-icon" />
                  </div>
                )}

                {/* Stars Sent Confetti Overlay */}
                {starAwarding && (
                  <div className="star-awarding-burst">
                    <BsStarFill size={72} className="star-burst-icon" />
                    <span>+50 Stars Sent! ⭐</span>
                  </div>
                )}

                {/* Play/Pause Center Indicator */}
                {!isPlaying && !isClearMode && (
                  <div className="reel-paused-overlay" onClick={togglePlayPause}>
                    <div className="play-pulse-circle">
                      <BsPlayFill size={48} />
                    </div>
                  </div>
                )}

                {/* Closed Captions Live Banner */}
                {captionsEnabled && !isClearMode && (
                  <div className="reel-live-captions-overlay">
                    <div className="captions-text-pill">
                      <span>💬 [CC] {currentReel?.caption || "Original Soundtrack Playing"}</span>
                    </div>
                  </div>
                )}

                {/* Top Player Overlays (Sound, Speed, Category, Creator RevShare) */}
                {!isClearMode && (
                  <div className="reel-top-controls-bar">
                    <div className="reel-top-left-chips">
                      <div className="reel-category-chip">
                        <BsFire size={13} className="me-1 text-warning" />
                        {currentReel?.category || "Trending"}
                      </div>
                      <div className="reel-revshare-chip" title="Nexoria 90% Creator Revenue Share Standard">
                        💎 90% Creator Rev-Share
                      </div>
                    </div>

                    <div className="reel-top-right-tools">
                      {/* Playback Speed Selector */}
                      <div className="speed-selector-wrapper">
                        <button 
                          className="reel-tool-btn"
                          onClick={(e) => { e.stopPropagation(); setShowSpeedMenu(!showSpeedMenu); }}
                          title="Playback Speed"
                        >
                          <BsSpeedometer2 size={16} />
                          <span className="speed-val">{playbackSpeed}x</span>
                        </button>

                        {showSpeedMenu && (
                          <div className="speed-dropdown-menu" onClick={e => e.stopPropagation()}>
                            {[0.5, 0.75, 1, 1.25, 1.5, 2].map(spd => (
                              <button
                                key={spd}
                                className={`speed-option-btn ${playbackSpeed === spd ? "active" : ""}`}
                                onClick={() => {
                                  setPlaybackSpeed(spd);
                                  if (videoRef.current) videoRef.current.playbackRate = spd;
                                  setShowSpeedMenu(false);
                                }}
                              >
                                {spd}x {spd === 1 && "(Normal)"}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Mute/Unmute */}
                      <button 
                        className="reel-tool-btn" 
                        onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}
                        title={isMuted ? "Unmute (M)" : "Mute (M)"}
                      >
                        {isMuted ? <BsVolumeMuteFill size={19} className="text-danger" /> : <BsVolumeUpFill size={19} />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Bottom Overlay Info (Creator, Caption, Audio Disc) */}
                {!isClearMode && (
                  <div className="reel-bottom-info-container">
                    {/* Creator Bar */}
                    <div className="reel-creator-header-row">
                      <div 
                        className="creator-avatar-ring"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNavigateToProfile(currentReel);
                        }}
                        style={{ cursor: "pointer" }}
                        title={`View ${currentReel?.creatorName}'s profile`}
                      >
                        <img src={currentReel?.creatorAvatar} alt="" className="creator-avatar-img" />
                      </div>
                      <div className="creator-meta-col">
                        <div 
                          className="creator-name-row"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNavigateToProfile(currentReel);
                          }}
                          style={{ cursor: "pointer" }}
                          title={`View ${currentReel?.creatorName}'s profile`}
                        >
                          <span className="creator-name-txt">{currentReel?.creatorName}</span>
                          {currentReel?.isVerified && (
                            <BsCheckCircleFill size={13} className="text-primary ms-1 verified-check" />
                          )}
                        </div>
                        <span className="creator-sub-txt">{currentReel?.views} • {currentReel?.timeAgo}</span>
                      </div>

                      <button 
                        className={`btn-reel-follow-toggle ${currentReel?.isFollowing ? "following" : ""}`}
                        onClick={(e) => { e.stopPropagation(); handleToggleFollow(currentReel?.creatorName); }}
                      >
                        {currentReel?.isFollowing ? "Following" : "+ Follow"}
                      </button>
                    </div>

                    {/* Caption */}
                    <p className="reel-caption-body">{currentReel?.caption}</p>

                    {/* Music Marquee & Rotating Disc */}
                    <div className="reel-audio-track-row">
                      <div className="audio-marquee-box">
                        <BsMusicNoteBeamed className="music-note-icon animated-note" />
                        <span className="audio-title-marquee">{currentReel?.songTitle}</span>
                      </div>
                      <div className="spinning-vinyl-disc" title="Original Audio Track">
                        <img src={currentReel?.creatorAvatar} alt="disc" className="vinyl-cover-art" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Interactive Seekable Scrubber at Bottom */}
                {!isClearMode && (
                  <div className="reel-bottom-scrubber-track" onClick={handleSeek}>
                    <div 
                      className="reel-bottom-scrubber-fill"
                      style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Right Side Floating Social Actions Column */}
              {!isClearMode && (
                <div className="reels-floating-actions-col">
                  
                  {/* Like / Reaction Button with 7-Reaction Hover Tray */}
                  <div 
                    className="reel-action-box"
                    onMouseEnter={() => setHoveredReactionReelId(currentReel?.id)}
                    onMouseLeave={() => setHoveredReactionReelId(null)}
                  >
                    {/* 7 Animated Floating Reaction Tray */}
                    {hoveredReactionReelId === currentReel?.id && (
                      <div className="reels-reactions-floating-popup">
                        {REACTIONS.map(reaction => (
                          <button 
                            key={reaction.id}
                            className="reaction-burst-item"
                            onClick={() => handleReactionSelect(currentReel?.id, reaction.id)}
                            title={reaction.label}
                          >
                            <span className="reaction-emoji-glyph">{reaction.emoji}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    <button 
                      className={`reel-action-circle-btn ${currentReel?.liked ? "liked-active" : ""}`}
                      onClick={() => handleReactionSelect(currentReel?.id, currentReel?.reactionType || "like")}
                    >
                      {currentReel?.liked ? (
                        <BsHandThumbsUpFill size={24} style={{ color: REACTIONS.find(r => r.id === currentReel?.reactionType)?.color || "#1877f2" }} />
                      ) : (
                        <BsHandThumbsUp size={24} />
                      )}
                    </button>
                    <span className="reel-action-metric">{currentReel?.likes}</span>
                  </div>

                  {/* Comment Drawer Button */}
                  <div className="reel-action-box">
                    <button 
                      className="reel-action-circle-btn"
                      onClick={() => setShowCommentsDrawer(true)}
                      title="View & Add Comments"
                    >
                      <BsChatDots size={23} />
                    </button>
                    <span className="reel-action-metric">{currentReel?.commentsCount}</span>
                  </div>

                  {/* Send 50 Stars / Quick Tipping */}
                  <div className="reel-action-box">
                    <button 
                      className="reel-action-circle-btn star-tip-btn"
                      onClick={() => handleSendStars(currentReel?.id, 50)}
                      title="Send 50 ⭐ Stars to Creator"
                    >
                      <BsStarFill size={22} className="text-warning" />
                    </button>
                    <span className="reel-action-metric text-warning">{currentReel?.starsCount || 0} ⭐</span>
                  </div>

                  {/* Direct 1-Click Micro-Tipping / Support Creator (0% fee) */}
                  <div className="reel-action-box">
                    <button 
                      className="reel-action-circle-btn tip-creator-circle-btn"
                      onClick={() => setShowTipModal(true)}
                      title="⚡ Direct 1-Click Tip Creator (0% Platform Fee)"
                    >
                      <BsLightningChargeFill size={21} className="text-warning" />
                    </button>
                    <span className="reel-action-metric tip-metric-txt">⚡ Tip</span>
                  </div>

                  {/* Share Button */}
                  <div className="reel-action-box">
                    <button 
                      className="reel-action-circle-btn"
                      onClick={() => {
                        setShareTargetReel(currentReel);
                        setShowShareModal(true);
                      }}
                      title="Share Reel"
                    >
                      <BsShare size={21} />
                    </button>
                    <span className="reel-action-metric">Share</span>
                  </div>

                  {/* Save / Bookmark Button */}
                  <div className="reel-action-box">
                    <button 
                      className={`reel-action-circle-btn ${currentReel?.saved ? "saved-active" : ""}`}
                      onClick={() => handleToggleSave(currentReel?.id)}
                      title={currentReel?.saved ? "Remove from Saved" : "Save Reel"}
                    >
                      {currentReel?.saved ? (
                        <BsBookmarkFill size={21} className="text-primary" />
                      ) : (
                        <BsBookmark size={21} />
                      )}
                    </button>
                    <span className="reel-action-metric">Save</span>
                  </div>

                  {/* More Options / Three Dots (Opens Nexoria Reel 3-Dot Options Bottom Sheet) */}
                  <div className="reel-action-box">
                    <button 
                      className="reel-action-circle-btn"
                      onClick={() => setShowReelOptionsModal(true)}
                      title="More options (Speed, Quality, Captions, Clear Mode, Report...)"
                    >
                      <BsThreeDots size={22} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* MODE 2: NEXORIA WATCH 16:9 LONG-FORM VIDEO FEED               */}
        {/* ------------------------------------------------------------- */}
        {activeTab === "watch" && (
          <div className="watch-feed-grid-layout">
            
            {/* Left/Center Main Video Feed Column */}
            <div className="watch-feed-main-col">
              
              {/* Watch Video Creator Banner */}
              <div className="watch-create-banner shadow-sm mb-3">
                <div className="d-flex align-items-center gap-3">
                  <div className="watch-create-icon-bubble">
                    <BsCameraVideoFill size={20} />
                  </div>
                  <div className="watch-create-text" onClick={() => setShowCreateWatchModal(true)}>
                    <strong>Publish a 16:9 Video to Watch</strong>
                    <p className="m-0 text-muted small">Share tutorials, gaming highlights, match replays, and long-form videos</p>
                  </div>
                </div>
                <button className="btn btn-primary rounded-pill px-3 py-1.5 fw-bold d-flex align-items-center gap-1.5" onClick={() => setShowCreateWatchModal(true)}>
                  <BsPlusLg size={14} /> Upload Video
                </button>
              </div>

              {watchFeed
                .filter(v => {
                  if (selectedCategory === "✨ All" || selectedCategory === "🔥 Trending") return true;
                  return v.category?.toLowerCase() === selectedCategory.replace(/[^a-zA-Z &]/g, "").trim().toLowerCase();
                })
                .map(video => (
                  <div key={video.id} className="watch-video-card-post shadow-sm">
                    {/* Header: Channel info & Follow */}
                    <div className="watch-card-header">
                      <div 
                        className="watch-channel-info" 
                        onClick={() => handleNavigateToProfile(video)}
                        style={{ cursor: "pointer" }}
                        title={`View ${video.creatorName}'s profile`}
                      >
                        <img src={video.creatorAvatar} alt="" className="watch-channel-avatar" />
                        <div>
                          <div className="channel-title-row">
                            <span className="channel-name">{video.creatorName}</span>
                            {video.isVerified && <BsCheckCircleFill size={13} className="text-primary ms-1" />}
                          </div>
                          <span className="watch-time-meta">{video.views} • {video.timeAgo}</span>
                        </div>
                      </div>

                      <div className="watch-header-actions">
                        <button 
                          className={`btn-watch-follow ${video.isFollowing ? "following" : ""}`}
                          onClick={() => {
                            setWatchFeed(prev => prev.map(v => v.id === video.id ? { ...v, isFollowing: !v.isFollowing } : v));
                            showToast(video.isFollowing ? "Unfollowed channel" : `Followed ${video.creatorName}!`);
                          }}
                        >
                          {video.isFollowing ? "Following" : "+ Follow"}
                        </button>
                      </div>
                    </div>

                    {/* Title & Description */}
                    <div className="watch-card-caption">
                      <h5>{video.title}</h5>
                      <p className="watch-desc-text">{video.description}</p>
                    </div>

                    {/* 16:9 Video Player Container */}
                    <div className="watch-16-9-player-box">
                      <video
                        src={video.videoUrl}
                        poster={video.thumbnail || video.posterUrl}
                        controls
                        playsInline
                        className="watch-html5-video"
                      />
                      <span className="video-duration-tag">{typeof video.duration === "number" ? `${Math.floor(video.duration / 60)}:${video.duration % 60 < 10 ? '0' + (video.duration % 60) : video.duration % 60}` : video.duration}</span>
                      <span className="video-hd-badge">1080p HD</span>
                    </div>

                    {/* Engagement Metrics Summary */}
                    <div className="watch-stats-summary-bar">
                      <div className="d-flex align-items-center gap-1 text-primary">
                        <BsHandThumbsUpFill size={14} />
                        <BsHeartFill size={13} className="text-danger" />
                        <span className="stats-count-txt ms-1">{video.likes}</span>
                      </div>
                      <div className="d-flex align-items-center gap-3 text-muted small">
                        <span>{video.commentsCount} comments</span>
                        <span>1.4K shares</span>
                      </div>
                    </div>

                    {/* Nexoria 4-Column Action Bar with Watch Party */}
                    <div className="watch-card-actions-row">
                      <button 
                        className={`watch-action-bar-btn ${video.liked ? "active-liked text-primary" : ""}`}
                        onClick={() => {
                          setWatchFeed(prev => prev.map(v => v.id === video.id ? { ...v, liked: !v.liked } : v));
                        }}
                      >
                        {video.liked ? <BsHandThumbsUpFill size={18} /> : <BsHandThumbsUp size={18} />}
                        <span>Like</span>
                      </button>

                      <button 
                        className="watch-action-bar-btn"
                        onClick={() => showToast("Opening comments thread...")}
                      >
                        <BsChatDots size={18} />
                        <span>Comment</span>
                      </button>

                      <button 
                        className="watch-action-bar-btn text-info"
                        onClick={() => {
                          setSelectedPartyVideo(video);
                          setShowWatchPartyModal(true);
                        }}
                        title="Start a synchronized live Watch Party with friends"
                      >
                        <BsBroadcast size={17} />
                        <span>Watch Party</span>
                      </button>

                      <button 
                        className="watch-action-bar-btn text-warning"
                        onClick={() => {
                          setStarAwarding(true);
                          setTimeout(() => setStarAwarding(false), 1500);
                          showToast(`⭐ Sent 50 Stars to ${video.creatorName}!`);
                        }}
                      >
                        <BsStarFill size={17} />
                        <span>Send Stars</span>
                      </button>

                      <button 
                        className="watch-action-bar-btn"
                        onClick={() => {
                          setShareTargetReel(video);
                          setShowShareModal(true);
                        }}
                      >
                        <BsShare size={17} />
                        <span>Share</span>
                      </button>
                    </div>
                  </div>
                ))}
            </div>

            {/* Right Watch Hub Sidebar */}
            <div className="watch-feed-sidebar-col">
              
              {/* Search Videos */}
              <div className="watch-sidebar-card shadow-sm">
                <div className="watch-search-input-box">
                  <BsSearch className="search-icon" />
                  <input 
                    type="text" 
                    placeholder="Search Watch videos & reels..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Trending Channels to Follow */}
              <div className="watch-sidebar-card shadow-sm">
                <div className="sidebar-card-header">
                  <h6>🔥 Trending Channels</h6>
                </div>
                <div className="trending-channels-list">
                  {channels.map(channel => (
                    <div key={channel.id} className="channel-item-row">
                      <img src={channel.avatar} alt="" className="channel-item-avatar" />
                      <div className="channel-item-meta">
                        <span className="channel-item-name">{channel.name}</span>
                        <span className="channel-item-subs">{channel.subscribers} followers</span>
                      </div>
                      <button 
                        className={`channel-follow-btn ${channel.followed ? "followed" : ""}`}
                        onClick={() => {
                          setChannels(prev => prev.map(c => c.id === channel.id ? { ...c, followed: !c.followed } : c));
                          showToast(channel.followed ? "Unfollowed channel" : `Followed ${channel.name}!`);
                        }}
                      >
                        {channel.followed ? "Following" : "Follow"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Watch History / Playlists */}
              <div className="watch-sidebar-card shadow-sm">
                <div className="sidebar-card-header">
                  <h6>📼 Top Playlists</h6>
                </div>
                <div className="playlist-mini-items">
                  <div className="playlist-card" onClick={() => showToast("Loading AI Series playlist...")}>
                    <img src="https://images.unsplash.com/photo-1518770660439-4636190af475?w=200" alt="" />
                    <div className="playlist-meta">
                      <h6>NextGen AI Masterclasses</h6>
                      <span>12 Videos • Updated yesterday</span>
                    </div>
                  </div>
                  <div className="playlist-card" onClick={() => showToast("Loading Cricket Highlights...")}>
                    <img src="https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=200" alt="" />
                    <div className="playlist-meta">
                      <h6>ICC World Cup Top Moments</h6>
                      <span>28 Videos • 4.2M views</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* MODE 3: LIVE STREAMS HUB (🔴 Live Broadcasts)                  */}
        {/* ------------------------------------------------------------- */}
        {activeTab === "live" && (
          <div className="live-hub-fullscreen-layout">
            {/* Main Active Live Stream Stage */}
            <div className="live-stream-stage-col">
              <div className="live-video-player-container shadow-lg">
                <video 
                  src={liveStreams[activeLiveIndex]?.videoUrl}
                  poster={liveStreams[activeLiveIndex]?.thumbnail}
                  autoPlay
                  controls
                  playsInline
                  className="live-html5-player"
                />
                
                {/* Pulsing LIVE badge & Viewer Count */}
                <div className="live-header-badges">
                  <div className="live-badge-pulsing">
                    <span className="live-dot"></span> LIVE
                  </div>
                  <div className="live-viewers-badge">
                    <BsEyeFill size={14} className="me-1" />
                    {liveStreams[activeLiveIndex]?.viewers} Watching
                  </div>
                </div>
              </div>

              {/* Streamer Info & Details */}
              <div className="live-streamer-details-card shadow-sm">
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-3">
                    <img src={liveStreams[activeLiveIndex]?.avatar} alt="" className="live-streamer-avatar" />
                    <div>
                      <h5 className="mb-1 fw-bold">{liveStreams[activeLiveIndex]?.title}</h5>
                      <div className="d-flex align-items-center gap-2">
                        <span className="fw-semibold text-primary">{liveStreams[activeLiveIndex]?.streamer}</span>
                        <span className="badge bg-primary-subtle text-primary">{liveStreams[activeLiveIndex]?.category}</span>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-2">
                    <button 
                      className="btn btn-warning text-dark fw-bold d-flex align-items-center gap-1"
                      onClick={() => {
                        setStarAwarding(true);
                        setTimeout(() => setStarAwarding(false), 1500);
                        showToast("⭐ Super Chat of 100 Stars sent to Streamer!");
                      }}
                    >
                      <BsStarFill /> Send Super Stars
                    </button>
                    <button 
                      className="btn btn-primary fw-bold"
                      onClick={() => showToast("Following streamer notifications!")}
                    >
                      + Follow
                    </button>
                  </div>
                </div>
              </div>

              {/* Other Live Broadcasts Switcher */}
              <div className="other-live-streams-section">
                <h6 className="fw-bold mb-3">🔴 Other Live Broadcasts</h6>
                <div className="live-stream-cards-grid">
                  {liveStreams.map((stream, idx) => (
                    <div 
                      key={stream.id} 
                      className={`live-thumbnail-card ${activeLiveIndex === idx ? "active-stream" : ""}`}
                      onClick={() => setActiveLiveIndex(idx)}
                    >
                      <div className="thumb-container">
                        <img src={stream.thumbnail} alt="" />
                        <span className="live-badge-mini">LIVE</span>
                        <span className="viewers-tag"><BsEyeFill size={11} className="me-1" />{stream.viewers}</span>
                      </div>
                      <div className="p-2">
                        <h6 className="small fw-bold mb-1 text-truncate">{stream.title}</h6>
                        <span className="small text-muted">{stream.streamer}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Interactive Live Chat Stream */}
            <div className="live-chat-sidebar-col shadow-sm">
              <div className="live-chat-header">
                <h6>💬 Live Stream Chat</h6>
                <span className="live-indicator-text">Real-Time</span>
              </div>

              <div className="live-chat-messages-box" ref={liveChatContainerRef}>
                {liveStreams[activeLiveIndex]?.chatMessages.map((msg, i) => (
                  <div key={i} className="live-chat-bubble">
                    <span className="chat-user-name" style={{ color: msg.color }}>{msg.user}:</span>
                    <span className="chat-user-message">{msg.text}</span>
                  </div>
                ))}
              </div>

              {/* Live Chat Input */}
              <form className="live-chat-input-row" onSubmit={handleSendLiveMessage}>
                <input 
                  type="text" 
                  placeholder="Send a live message..."
                  value={liveChatInput}
                  onChange={(e) => setLiveChatInput(e.target.value)}
                />
                <button type="submit" className="live-chat-send-btn">
                  <BsSendFill size={16} />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* MODE 4: SAVED COLLECTION (Bookmarked Reels & Videos)           */}
        {/* ------------------------------------------------------------- */}
        {activeTab === "saved" && (
          <div className="saved-collection-page-view">
            <div className="saved-header-row mb-4">
              <div>
                <h4 className="fw-bold mb-1">💾 Saved Videos & Reels</h4>
                <p className="text-muted mb-0">Reels and videos you have bookmarked to watch later.</p>
              </div>
            </div>

            {reelsList.filter(r => r.saved).length === 0 ? (
              <div className="empty-saved-state text-center py-5 shadow-sm rounded-4 bg-surface">
                <BsBookmark size={54} className="text-muted mb-3" />
                <h5 className="fw-bold">No Saved Videos Yet</h5>
                <p className="text-muted small">Click the bookmark icon on any reel or watch video to save it here.</p>
                <button className="btn btn-primary mt-2" onClick={() => setActiveTab("reels")}>
                  Explore Reels
                </button>
              </div>
            ) : (
              <div className="saved-cards-grid">
                {reelsList.filter(r => r.saved).map(reel => (
                  <div key={reel.id} className="saved-video-item-card shadow-sm">
                    <div className="saved-thumb-box" onClick={() => { setActiveTab("reels"); setCurrentIndex(reelsList.findIndex(r => r.id === reel.id)); }}>
                      <img src={reel.posterUrl || reel.videoUrl} alt="" />
                      <div className="saved-play-hover-overlay">
                        <BsPlayFill size={40} />
                      </div>
                    </div>
                    <div className="p-3">
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <div className="d-flex align-items-center gap-2">
                          <img src={reel.creatorAvatar} alt="" className="rounded-circle" style={{ width: 28, height: 28 }} />
                          <span className="small fw-bold">{reel.creatorName}</span>
                        </div>
                        <button 
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleToggleSave(reel.id)}
                          title="Remove from saved"
                        >
                          <BsBookmarkFill size={13} />
                        </button>
                      </div>
                      <p className="small text-truncate mb-2">{reel.caption}</p>
                      <div className="d-flex align-items-center justify-content-between text-muted small">
                        <span>{reel.views}</span>
                        <span className="badge bg-secondary-subtle text-secondary">{reel.category}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* ------------------------------------------------------------- */}
      {/* SLIDE-IN COMMENT DRAWER                                        */}
      {/* ------------------------------------------------------------- */}
      {showCommentsDrawer && (
        <div className="reels-comments-drawer-backdrop" onClick={() => setShowCommentsDrawer(false)}>
          <div className="reels-comments-drawer-panel" onClick={e => e.stopPropagation()}>
            <div className="drawer-top-header">
              <h5>Comments ({currentReel?.commentsCount || 0})</h5>
              <button className="drawer-close-btn" onClick={() => setShowCommentsDrawer(false)}>
                <BsX size={28} />
              </button>
            </div>

            <div className="drawer-comments-scroll-list">
              {(currentReel?.comments || []).map(comm => (
                <div key={comm.id} className="comment-thread-item">
                  <img src={comm.avatar || "https://i.pravatar.cc/40?img=1"} alt="" className="comment-avatar-img" />
                  <div className="comment-content-box">
                    <div className="comment-bubble">
                      <span className="comment-author-name">{comm.name}</span>
                      <p className="comment-author-text">{comm.text}</p>
                    </div>
                    <div className="comment-meta-actions">
                      <span className="comment-time-txt">{comm.time}</span>
                      <button className="comment-like-txt-btn">Like ({comm.likes || 0})</button>
                      <button className="comment-reply-txt-btn">Reply</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Emoji Strip */}
            <div className="drawer-emoji-quick-strip">
              {["❤️", "🔥", "🙌", "😂", "👏", "😍", "✨", "💯"].map(emoji => (
                <button
                  key={emoji}
                  className="quick-emoji-btn"
                  onClick={() => setCommentText(prev => prev + emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <form className="drawer-comment-input-footer" onSubmit={handleAddComment}>
              <input 
                type="text" 
                placeholder="Add a comment to this reel..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                autoFocus
              />
              <button type="submit" className="drawer-comment-submit-btn" disabled={!commentText.trim()}>
                <BsSendFill size={16} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SHARE MODAL                                                   */}
      {/* ------------------------------------------------------------- */}
      {showShareModal && (
        <div className="reels-modal-backdrop" onClick={() => setShowShareModal(false)}>
          <div className="reels-share-modal-box shadow-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-top-header">
              <h5>Share Reel</h5>
              <button className="drawer-close-btn" onClick={() => setShowShareModal(false)}>
                <BsX size={26} />
              </button>
            </div>

            <div className="share-targets-grid">
              <div className="share-option-card" onClick={() => {
                try {
                  navigator.clipboard?.writeText(window.location.href)?.catch(() => {});
                } catch {}
                showToast("📋 Reel link copied to clipboard!");
                if (currentReel?.id) registerReelShareApi(currentReel.id, getActiveUserId(), "link");
                setShowShareModal(false);
              }}>
                <div className="share-icon-circle bg-primary-subtle text-primary">
                  <BsLink45Deg size={26} />
                </div>
                <span>Copy Link</span>
              </div>

              <div className="share-option-card" onClick={() => {
                showToast("🚀 Shared to your News Feed!");
                if (currentReel?.id) registerReelShareApi(currentReel.id, getActiveUserId(), "timeline");
                setShowShareModal(false);
              }}>
                <div className="share-icon-circle bg-success-subtle text-success">
                  <BsArrowRepeat size={24} />
                </div>
                <span>Share to Feed</span>
              </div>

              <div className="share-option-card" onClick={() => {
                window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent("Watch this awesome reel on Nexoria! " + window.location.href)}`, "_blank");
                if (currentReel?.id) registerReelShareApi(currentReel.id, getActiveUserId(), "whatsapp");
                setShowShareModal(false);
              }}>
                <div className="share-icon-circle bg-success-subtle text-success">
                  <BsWhatsapp size={24} />
                </div>
                <span>WhatsApp</span>
              </div>

              <div className="share-option-card" onClick={() => {
                showToast("💬 Reel sent to direct messages!");
                if (currentReel?.id) registerReelShareApi(currentReel.id, getActiveUserId(), "messenger");
                setShowShareModal(false);
              }}>
                <div className="share-icon-circle bg-info-subtle text-info">
                  <BsChatDots size={24} />
                </div>
                <span>Messenger</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* CREATE REEL MODAL INTEGRATION                                 */}
      {/* ------------------------------------------------------------- */}
      {showCreateReelModal && (
        <ReelStory onClose={() => setShowCreateReelModal(false)} />
      )}

      {/* ------------------------------------------------------------- */}
      {/* CREATE WATCH VIDEO (16:9) MODAL INTEGRATION                   */}
      {/* ------------------------------------------------------------- */}
      {showCreateWatchModal && (
        <CreateWatchModal
          onClose={() => setShowCreateWatchModal(false)}
          onVideoPublished={(newWatchVideo) => {
            setWatchFeed(prev => [newWatchVideo, ...prev]);
            showToast("🎉 16:9 Watch video published successfully!");
          }}
        />
      )}

      {/* ------------------------------------------------------------- */}
      {/* WATCH PARTY SYNCHRONIZED LIVE LOUNGE MODAL                    */}
      {/* ------------------------------------------------------------- */}
      {showWatchPartyModal && (
        <WatchPartyModal
          video={selectedPartyVideo}
          partyId={selectedPartyVideo ? `party-${selectedPartyVideo.id}` : "general"}
          onClose={() => {
            setShowWatchPartyModal(false);
            setSelectedPartyVideo(null);
          }}
        />
      )}

      {/* ------------------------------------------------------------- */}
      {/* NEXORIA 3-DOT REEL OPTIONS BOTTOM SHEET MODAL                 */}
      {/* ------------------------------------------------------------- */}
      <ReelOptionsBottomSheet
        isOpen={showReelOptionsModal}
        onClose={() => setShowReelOptionsModal(false)}
        currentReel={currentReel}
        playbackSpeed={playbackSpeed}
        setPlaybackSpeed={(spd) => {
          setPlaybackSpeed(spd);
          if (videoRef.current) videoRef.current.playbackRate = spd;
          showToast(`Playback speed set to ${spd}x`);
        }}
        quality={quality}
        setQuality={(q) => {
          setQuality(q);
          showToast(`Quality set to ${q}`);
        }}
        captionsEnabled={captionsEnabled}
        setCaptionsEnabled={(enabled) => {
          setCaptionsEnabled(enabled);
          showToast(enabled ? "💬 Captions turned ON" : "Captions turned OFF");
        }}
        isClearMode={isClearMode}
        setIsClearMode={(val) => {
          setIsClearMode(val);
          if (val) showToast("✨ Clear Mode: UI hidden. Tap screen anytime to restore.");
        }}
        autoScrollNext={autoScrollNext}
        setAutoScrollNext={(val) => {
          setAutoScrollNext(val);
          showToast(val ? "⏭️ Auto-scroll next reel enabled" : "Auto-scroll disabled");
        }}
        isSaved={currentReel?.saved}
        onToggleSave={() => handleToggleSave(currentReel?.id)}
        onCopyLink={() => {
          try {
            navigator.clipboard?.writeText(window.location.origin + `/reels/${currentReel?.id}`)?.catch(() => {});
          } catch {}
          showToast("🔗 Reel link copied to clipboard!");
        }}
        onInterested={() => {
          showToast("👍 Marked as Interested! We'll show more reels like this.");
        }}
        onNotInterested={() => {
          showToast("👎 Reel hidden. We'll show fewer reels like this.");
          if (currentIndex < filteredReels.length - 1) {
            handleNextReel();
          }
        }}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="reels-floating-toast-alert shadow-lg">
          {toastMessage}
        </div>
      )}

      {/* Direct 1-Click Micro-Tipping Modal */}
      {showTipModal && (
        <MicroTipModal
          recipient={currentReel}
          onClose={() => setShowTipModal(false)}
          onTipSuccess={(res) => showToast(`⚡ Sent ₹${res.amount} tip to ${res.creatorName}!`)}
        />
      )}

      <ChatDrawer activeChat={activeChat} onClose={() => setActiveChat(null)} />

      {/* Mobile Bottom Navigation */}
      <div className="mobile-bottom-nav">
        <MenuIcons />
      </div>
    </div>
  );
}