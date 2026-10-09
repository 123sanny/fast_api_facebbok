import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Header from "./Header";
import MenuIcons from "./MenuIcons";
import ChatDrawer from "./ChatDrawer";
import MicroTipModal from "./MicroTipModal";
import {
  BsSearch, BsX, BsCheckCircleFill, BsShieldCheck,
  BsPeopleFill, BsFileEarmarkTextFill, BsPlayBtnFill, BsShop,
  BsGlobe2, BsLightningChargeFill, BsChatDotsFill,
  BsPersonPlusFill, BsPersonCheckFill, BsMicFill,
  BsStars, BsArrowRight, BsTrash3, BsHeartFill, BsGeoAltFill
} from "react-icons/bs";
import "./css/SearchPage.css";

// Comprehensive Seed Data for Search
const SEED_USERS = [
  {
    id: 1,
    name: "Vijay Sagar Azad",
    role: "Mobile App Architect & Flutter Specialist",
    location: "Noida, UP",
    distance: "4.2 km away",
    img: "https://i.pravatar.cc/150?img=11",
    verified: true,
    mutualCount: 14,
    status: "🟢 Online Now",
    badges: ["Aadhaar Verified", "Top Voice"]
  },
  {
    id: 2,
    name: "Er AK Yadav",
    role: "AI Systems & Deep Learning Engineer",
    location: "Delhi, NCR",
    distance: "6.8 km away",
    img: "https://i.pravatar.cc/150?img=12",
    verified: true,
    mutualCount: 9,
    status: "🎧 In Audio Lounge",
    badges: ["Aadhaar Verified", "Pioneer Creator"]
  },
  {
    id: 3,
    name: "Rohit Sharma",
    role: "Cloud DevOps & Kubernetes Consultant",
    location: "Gurugram, Haryana",
    distance: "12 km away",
    img: "https://i.pravatar.cc/150?img=13",
    verified: true,
    mutualCount: 22,
    status: "💻 Coding Nexoria",
    badges: ["Aadhaar Verified"]
  },
  {
    id: 4,
    name: "Priya Sharma",
    role: "UI/UX & Product Design Lead",
    location: "Bengaluru, India",
    distance: "28 km away",
    img: "https://i.pravatar.cc/150?img=4",
    verified: true,
    mutualCount: 18,
    status: "✨ Designing 2.0 UI",
    badges: ["Pioneer Creator"]
  },
  {
    id: 5,
    name: "Md Aslam",
    role: "Full Stack MERN Developer",
    location: "Varanasi, UP",
    distance: "15 km away",
    img: "https://i.pravatar.cc/150?img=33",
    verified: false,
    mutualCount: 6,
    status: "🟢 Active 10m ago",
    badges: []
  },
  {
    id: 6,
    name: "Ananya Verma",
    role: "Prompt Engineer & LLM Researcher",
    location: "Delhi, India",
    distance: "2.1 km away",
    img: "https://i.pravatar.cc/150?img=47",
    verified: true,
    mutualCount: 31,
    status: "🤖 Experimenting AI",
    badges: ["Aadhaar Verified", "Top Voice"]
  }
];

const SEED_POSTS = [
  {
    id: 101,
    author: "Er AK Yadav",
    authorImg: "https://i.pravatar.cc/150?img=12",
    verified: true,
    time: "2h ago",
    caption: "Zero-Algorithm chronologically ordered feeds give creators 100% organic reach without shadowbanning. Nexoria is changing the game for social privacy! 🚀🔥",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800",
    tags: ["#ZeroAlgorithm", "#CreatorEconomy", "#AIInnovation"],
    likes: 342,
    comments: 58,
    truthGuardScore: 99.8
  },
  {
    id: 102,
    author: "Vijay Sagar Azad",
    authorImg: "https://i.pravatar.cc/150?img=11",
    verified: true,
    time: "4h ago",
    caption: "Built a fully responsive mobile-first UI with smooth glassmorphism and instant chat drawers. Open source vibes all the way! 💻✨",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800",
    tags: ["#WebDev", "#React19", "#UIUX"],
    likes: 512,
    comments: 89,
    truthGuardScore: 99.4
  },
  {
    id: 103,
    author: "Ananya Verma",
    authorImg: "https://i.pravatar.cc/150?img=47",
    verified: true,
    time: "6h ago",
    caption: "TruthGuard AI™ fact checks posts in real-time, reducing fake news and toxicity by 98%. Finally a calm social media experience! 🛡️🌿",
    image: "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800",
    tags: ["#TruthGuard", "#AIInnovation", "#SafeSocial"],
    likes: 420,
    comments: 64,
    truthGuardScore: 99.9
  }
];

const SEED_REELS = [
  {
    id: 201,
    title: "How Zero-Algorithm feeds work under the hood ⚡",
    author: "Er AK Yadav",
    authorImg: "https://i.pravatar.cc/150?img=12",
    views: "48.5K",
    likes: "4.2K",
    duration: "0:45",
    videoThumbnail: "https://images.unsplash.com/photo-1534972195531-a756b1126f24?w=600",
    tags: ["#Code", "#TechTrends"]
  },
  {
    id: 202,
    title: "1-Click UPI Micro-tips demo on Nexoria! 🪙",
    author: "Priya Sharma",
    authorImg: "https://i.pravatar.cc/150?img=4",
    views: "62.1K",
    likes: "8.9K",
    duration: "0:30",
    videoThumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600",
    tags: ["#CreatorTips", "#Monetization"]
  },
  {
    id: 203,
    title: "Glassmorphism & Dark Mode transition showcase ✨",
    author: "Vijay Sagar Azad",
    authorImg: "https://i.pravatar.cc/150?img=11",
    views: "34.8K",
    likes: "3.1K",
    duration: "0:52",
    videoThumbnail: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600",
    tags: ["#Design", "#UIUX"]
  }
];

const SEED_MARKET = [
  {
    id: 301,
    title: "Apple MacBook Pro M3 Max (36GB / 1TB SSD) - Pristine",
    price: "₹1,85,000",
    location: "Connaught Place, Delhi",
    distance: "3.5 km away",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600",
    seller: "Rohit Sharma",
    verifiedSeller: true,
    condition: "Like New"
  },
  {
    id: 302,
    title: "Sony WH-1000XM5 Noise Cancelling Headphones",
    price: "₹19,500",
    location: "Sector 18, Noida",
    distance: "7.1 km away",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600",
    seller: "Vijay Sagar Azad",
    verifiedSeller: true,
    condition: "Excellent"
  },
  {
    id: 303,
    title: "Ergonomic Mesh Chair with Lumbar Support",
    price: "₹8,499",
    location: "Cyber City, Gurugram",
    distance: "14 km away",
    image: "https://images.unsplash.com/photo-1580481077197-0b1928095b94?w=600",
    seller: "Ananya Verma",
    verifiedSeller: true,
    condition: "Brand New"
  }
];

const SEED_COMMUNITIES = [
  {
    id: 401,
    name: "AI Engineers & LLM Innovators India",
    members: "42.8K members",
    postsPerDay: "140+ posts/day",
    desc: "Collaborative hub for Deep Learning, PyTorch, LangChain, and generative AI builders in India.",
    banner: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800",
    icon: "🤖",
    privacy: "Public Community",
    joined: false
  },
  {
    id: 402,
    name: "Delhi NCR Tech Founders & Creators Circle",
    members: "18.4K members",
    postsPerDay: "85+ posts/day",
    desc: "Hyperlocal network of early stage startup builders, UI engineers, and indie hackers.",
    banner: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800",
    icon: "🚀",
    privacy: "Verified Only",
    joined: true
  },
  {
    id: 403,
    name: "React, Next.js & Frontend Wizards",
    members: "56.2K members",
    postsPerDay: "210+ posts/day",
    desc: "Best practices, architecture discussions, animations, and zero-bundle performance tricks.",
    banner: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800",
    icon: "⚛️",
    privacy: "Public Community",
    joined: true
  }
];

const TRENDING_TOPICS = [
  { tag: "#ZeroAlgorithm", volume: "128.4K posts", category: "Social Innovation", hot: true },
  { tag: "#TruthGuardAI", volume: "94.2K posts", category: "AI & Privacy", hot: true },
  { tag: "#CreatorEconomy", volume: "82.6K posts", category: "Monetization", hot: false },
  { tag: "#React19", volume: "61.3K posts", category: "Tech & Dev", hot: true },
  { tag: "#HyperlocalDelhi", volume: "45.1K posts", category: "Community", hot: false },
  { tag: "#ZeroDataSelling", volume: "39.8K posts", category: "Privacy", hot: false }
];

function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState("all");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [radiusFilter, setRadiusFilter] = useState("all");
  const [sortFilter, setSortFilter] = useState("relevant");
  const [activeChat, setActiveChat] = useState(null);
  const [tipModalPost, setTipModalPost] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [addedFriends, setAddedFriends] = useState({});
  const [joinedGroups, setJoinedGroups] = useState({ 402: true, 403: true });

  // Recent Searches History in localStorage
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("nexoria_recent_searches")) || [
        "Zero-Algorithm feed", "Vijay Sagar Azad", "AI prompt engineering", "MacBook Pro M3", "Delhi NCR Founders"
      ];
    } catch {
      return ["Zero-Algorithm feed", "Vijay Sagar Azad", "AI prompt engineering"];
    }
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Sync URL search params
  useEffect(() => {
    const q = searchParams.get("q");
    if (q !== null && q !== query) {
      setQuery(q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleSearchSubmit = (searchVal) => {
    const trimmed = (searchVal !== undefined ? searchVal : query).trim();
    if (!trimmed) return;

    setSearchParams({ q: trimmed });
    
    // Save to recents
    try {
      const updated = [trimmed, ...recentSearches.filter(s => s.toLowerCase() !== trimmed.toLowerCase())].slice(0, 10);
      setRecentSearches(updated);
      localStorage.setItem("nexoria_recent_searches", JSON.stringify(updated));
    } catch {}
  };

  const handleClearRecent = (itemToRemove, e) => {
    e?.stopPropagation();
    try {
      const updated = recentSearches.filter(s => s !== itemToRemove);
      setRecentSearches(updated);
      localStorage.setItem("nexoria_recent_searches", JSON.stringify(updated));
    } catch {}
  };

  const handleClearAllRecents = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem("nexoria_recent_searches");
    } catch {}
    showToast("Cleared recent searches");
  };

  // Filtered lists
  const filteredUsers = useMemo(() => {
    let list = SEED_USERS;
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(u =>
        u.name.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q) ||
        u.location.toLowerCase().includes(q)
      );
    }
    if (verifiedOnly) {
      list = list.filter(u => u.verified);
    }
    return list;
  }, [query, verifiedOnly]);

  const filteredPosts = useMemo(() => {
    let list = SEED_POSTS;
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(p =>
        p.author.toLowerCase().includes(q) ||
        p.caption.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    if (verifiedOnly) {
      list = list.filter(p => p.verified);
    }
    return list;
  }, [query, verifiedOnly]);

  const filteredReels = useMemo(() => {
    let list = SEED_REELS;
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(r =>
        r.title.toLowerCase().includes(q) ||
        r.author.toLowerCase().includes(q) ||
        r.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    return list;
  }, [query]);

  const filteredMarket = useMemo(() => {
    let list = SEED_MARKET;
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(m =>
        m.title.toLowerCase().includes(q) ||
        m.location.toLowerCase().includes(q) ||
        m.seller.toLowerCase().includes(q)
      );
    }
    if (verifiedOnly) {
      list = list.filter(m => m.verifiedSeller);
    }
    return list;
  }, [query, verifiedOnly]);

  const filteredCommunities = useMemo(() => {
    let list = SEED_COMMUNITIES;
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.desc.toLowerCase().includes(q)
      );
    }
    return list;
  }, [query]);

  const filteredTopics = useMemo(() => {
    let list = TRENDING_TOPICS;
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(t =>
        t.tag.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
      );
    }
    return list;
  }, [query]);

  const totalResultsCount = 
    filteredUsers.length + 
    filteredPosts.length + 
    filteredReels.length + 
    filteredMarket.length + 
    filteredCommunities.length;

  const handleToggleAddFriend = (id, name) => {
    setAddedFriends(prev => {
      const next = !prev[id];
      showToast(next ? `✓ Sent connection request to ${name}` : `Cancelled request to ${name}`);
      return { ...prev, [id]: next };
    });
  };

  const handleToggleJoinGroup = (id, name) => {
    setJoinedGroups(prev => {
      const next = !prev[id];
      showToast(next ? `🎉 You joined "${name}"!` : `Left "${name}"`);
      return { ...prev, [id]: next };
    });
  };

  const handleVoiceSearch = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      showToast("Voice recognition is not supported in this browser");
      return;
    }
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = "en-IN";
      recognition.onstart = () => showToast("🎙️ Listening... Speak now!");
      recognition.onresult = (event) => {
        const spoken = event.results[0][0].transcript;
        setQuery(spoken);
        handleSearchSubmit(spoken);
      };
      recognition.onerror = () => showToast("Could not recognize voice. Please try again.");
      recognition.start();
    } catch {
      showToast("Voice search unavailable");
    }
  };

  return (
    <div className="search-page-root">
      <Header onOpenChat={setActiveChat} />

      <div className="search-layout-container">
        
        {/* Toast Alert */}
        {toastMessage && (
          <div className="search-global-toast shadow-lg">
            <BsCheckCircleFill className="text-primary" size={18} />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* ===== 1. HERO SEARCH & EXPLORE BANNER ===== */}
        <div className="search-hero-banner">
          <div className="search-hero-content">
            <div className="search-badge-pill">
              <BsStars size={14} /> Nexoria Omnisearch AI
            </div>
            <h1>Explore Everything on Nexoria</h1>
            <p>Find friends, verified creators, trending discussions, marketplace deals, and communities with zero-algorithm bias.</p>

            {/* Glowing Search Bar */}
            <div className="search-input-master-wrapper">
              <BsSearch className="master-search-icon" size={20} />
              <input
                type="text"
                className="master-search-input"
                placeholder="Search across people, posts, reels, marketplace, groups, #tags..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()}
                autoFocus
              />
              {query && (
                <button className="master-search-clear-btn" onClick={() => { setQuery(""); setSearchParams({}); }}>
                  <BsX size={22} />
                </button>
              )}
              <button className="master-voice-btn" onClick={handleVoiceSearch} title="Voice Search">
                <BsMicFill size={18} />
              </button>
              <button className="master-search-submit-btn" onClick={() => handleSearchSubmit()}>
                Search
              </button>
            </div>

            {/* Trending Quick Tags Ribbon */}
            <div className="search-trending-ribbon">
              <span className="trending-title">🔥 Trending:</span>
              {TRENDING_TOPICS.map(t => (
                <span
                  key={t.tag}
                  className={`trending-chip ${query.toLowerCase() === t.tag.toLowerCase() ? "active" : ""}`}
                  onClick={() => {
                    setQuery(t.tag);
                    handleSearchSubmit(t.tag);
                  }}
                >
                  {t.tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ===== 2. CATEGORY TABS & FILTER BAR ===== */}
        <div className="search-toolbar-sticky">
          <div className="search-category-tabs">
            <button
              className={`search-tab-pill ${activeTab === "all" ? "active" : ""}`}
              onClick={() => setActiveTab("all")}
            >
              🌟 All Results <span className="tab-count">{totalResultsCount}</span>
            </button>
            <button
              className={`search-tab-pill ${activeTab === "people" ? "active" : ""}`}
              onClick={() => setActiveTab("people")}
            >
              👥 People <span className="tab-count">{filteredUsers.length}</span>
            </button>
            <button
              className={`search-tab-pill ${activeTab === "posts" ? "active" : ""}`}
              onClick={() => setActiveTab("posts")}
            >
              📝 Posts & Insights <span className="tab-count">{filteredPosts.length}</span>
            </button>
            <button
              className={`search-tab-pill ${activeTab === "reels" ? "active" : ""}`}
              onClick={() => setActiveTab("reels")}
            >
              🎬 Video Reels <span className="tab-count">{filteredReels.length}</span>
            </button>
            <button
              className={`search-tab-pill ${activeTab === "market" ? "active" : ""}`}
              onClick={() => setActiveTab("market")}
            >
              🛍️ Marketplace <span className="tab-count">{filteredMarket.length}</span>
            </button>
            <button
              className={`search-tab-pill ${activeTab === "groups" ? "active" : ""}`}
              onClick={() => setActiveTab("groups")}
            >
              🌐 Communities <span className="tab-count">{filteredCommunities.length}</span>
            </button>
            <button
              className={`search-tab-pill ${activeTab === "tags" ? "active" : ""}`}
              onClick={() => setActiveTab("tags")}
            >
              🏷️ Topics & Trends
            </button>
          </div>

          {/* Secondary Controls (Verified Filter, Distance, Sort) */}
          <div className="search-secondary-controls">
            <label className={`filter-toggle-chip ${verifiedOnly ? "active" : ""}`}>
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={() => setVerifiedOnly(!verifiedOnly)}
                style={{ display: "none" }}
              />
              <BsShieldCheck size={14} color={verifiedOnly ? "#fff" : "var(--color-primary)"} />
              <span>Aadhaar / Govt ID Verified Only</span>
            </label>

            <select
              className="search-select-dropdown"
              value={radiusFilter}
              onChange={(e) => setRadiusFilter(e.target.value)}
            >
              <option value="all">📍 All Locations</option>
              <option value="10">📍 Within 10 km (Hyperlocal)</option>
              <option value="25">📍 Within 25 km (City)</option>
              <option value="50">📍 Within 50 km (Metro)</option>
            </select>

            <select
              className="search-select-dropdown"
              value={sortFilter}
              onChange={(e) => setSortFilter(e.target.value)}
            >
              <option value="relevant">⚡ Most Relevant (AI)</option>
              <option value="latest">⏱️ Latest First (Chrono)</option>
              <option value="popular">🔥 Most Active</option>
            </select>
          </div>
        </div>

        {/* ===== 3. SEARCH MAIN BODY (RESULTS + SIDEBAR) ===== */}
        <div className="search-content-grid">
          
          {/* LEFT RESULTS FEED */}
          <div className="search-results-main">

            {/* Query Summary Strip */}
            {query && (
              <div className="search-query-status-bar">
                <span>Showing search results for <strong>"{query}"</strong> ({totalResultsCount} matches found)</span>
                <span className="search-reset-link" onClick={() => { setQuery(""); setSearchParams({}); }}>
                  Clear Search
                </span>
              </div>
            )}

            {/* A) PEOPLE SECTION */}
            {(activeTab === "all" || activeTab === "people") && filteredUsers.length > 0 && (
              <div className="search-result-block">
                <div className="block-header">
                  <h3><BsPeopleFill className="text-primary" /> People & Creators ({filteredUsers.length})</h3>
                  {activeTab === "all" && filteredUsers.length > 2 && (
                    <span className="view-more-link" onClick={() => setActiveTab("people")}>
                      View all {filteredUsers.length} people <BsArrowRight />
                    </span>
                  )}
                </div>

                <div className="search-people-grid">
                  {(activeTab === "all" ? filteredUsers.slice(0, 4) : filteredUsers).map(u => (
                    <div key={u.id} className="search-person-card">
                      <div className="person-avatar-wrap" onClick={() => navigate("/profile", { state: { user: { id: u.id, name: u.name, profile: u.img, cover: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800", bio: `${u.role} · ${u.location}` } } })}>
                        <img 
                          src={u.img} 
                          alt={u.name} 
                          onError={(e) => { e.currentTarget.src = "https://i.pravatar.cc/150?u=fallback"; }}
                        />
                        {u.verified && <span className="verified-mini-badge" title="Aadhaar Verified">✓</span>}
                      </div>

                      <div className="person-info-col">
                        <div className="person-name-row">
                          <h4 onClick={() => navigate("/profile", { state: { user: { id: u.id, name: u.name, profile: u.img, cover: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800", bio: `${u.role} · ${u.location}` } } })}>{u.name}</h4>
                          <span className="person-live-status">{u.status}</span>
                        </div>
                        <p className="person-role-text">{u.role}</p>
                        <p className="person-location-text">
                          <BsGeoAltFill size={11} color="var(--color-primary)" /> {u.location} · {u.distance}
                        </p>
                        <span className="person-mutual-tag">{u.mutualCount} mutual connections</span>

                        <div className="person-actions-row">
                          <button
                            className={`btn-person-add ${addedFriends[u.id] ? "added" : ""}`}
                            onClick={() => handleToggleAddFriend(u.id, u.name)}
                          >
                            {addedFriends[u.id] ? (
                              <><BsPersonCheckFill /> Request Sent</>
                            ) : (
                              <><BsPersonPlusFill /> Connect</>
                            )}
                          </button>
                          <button
                            className="btn-person-msg"
                            onClick={() => setActiveChat({ id: u.id || u.user_id, name: u.name, img: u.img, online: true })}
                          >
                            <BsChatDotsFill /> Message
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* B) POSTS & DISCUSSIONS SECTION */}
            {(activeTab === "all" || activeTab === "posts") && filteredPosts.length > 0 && (
              <div className="search-result-block">
                <div className="block-header">
                  <h3><BsFileEarmarkTextFill className="text-success" /> Posts & TruthGuard Insights ({filteredPosts.length})</h3>
                  {activeTab === "all" && filteredPosts.length > 2 && (
                    <span className="view-more-link" onClick={() => setActiveTab("posts")}>
                      View all posts <BsArrowRight />
                    </span>
                  )}
                </div>

                <div className="search-posts-list">
                  {(activeTab === "all" ? filteredPosts.slice(0, 2) : filteredPosts).map(p => (
                    <div key={p.id} className="search-post-card">
                      <div className="post-header-strip">
                        <img 
                          src={p.authorImg} 
                          alt={p.author} 
                          className="search-author-pic"
                          onError={(e) => { e.currentTarget.src = "https://i.pravatar.cc/150?u=fallback"; }}
                        />
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <h5 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>{p.author}</h5>
                            {p.verified && <span className="verified-mini-badge">✓</span>}
                          </div>
                          <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{p.time}</span>
                        </div>
                        <span className="truthguard-chip" style={{ marginLeft: "auto" }}>
                          <BsShieldCheck color="#10B981" /> {p.truthGuardScore}% Authentic
                        </span>
                      </div>

                      <p className="search-post-caption">{p.caption}</p>

                      {p.image && (
                        <div className="search-post-media">
                          <img src={p.image} alt="Media" loading="lazy" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                        </div>
                      )}

                      <div className="search-post-footer">
                        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                          <span style={{ fontSize: 13, color: "var(--color-text-secondary)", display: "flex", alignItems: "center", gap: 5 }}>
                            <BsHeartFill color="#EF4444" /> {p.likes}
                          </span>
                          <span style={{ fontSize: 13, color: "var(--color-text-secondary)", display: "flex", alignItems: "center", gap: 5 }}>
                            <BsChatDotsFill color="var(--color-primary)" /> {p.comments}
                          </span>
                        </div>
                        <button
                          className="search-post-tip-btn"
                          onClick={() => setTipModalPost({ name: p.author, creatorAvatar: p.authorImg })}
                        >
                          <BsLightningChargeFill color="#F59E0B" /> ⚡ Tip Creator
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* C) REELS & VIDEOS SECTION */}
            {(activeTab === "all" || activeTab === "reels") && filteredReels.length > 0 && (
              <div className="search-result-block">
                <div className="block-header">
                  <h3><BsPlayBtnFill className="text-danger" /> Video Reels ({filteredReels.length})</h3>
                  {activeTab === "all" && (
                    <span className="view-more-link" onClick={() => navigate("/reels")}>
                      Explore Reels Feed <BsArrowRight />
                    </span>
                  )}
                </div>

                <div className="search-reels-grid">
                  {filteredReels.map(r => (
                    <div key={r.id} className="search-reel-card" onClick={() => navigate("/reels")}>
                      <img src={r.videoThumbnail} alt={r.title} className="reel-thumb-img" />
                      <div className="reel-card-overlay">
                        <span className="reel-duration-tag">{r.duration}</span>
                        <div className="reel-bottom-info">
                          <div className="reel-author-line">
                            <img src={r.authorImg} alt="" className="reel-mini-avatar" />
                            <span>{r.author}</span>
                          </div>
                          <p className="reel-title-clamp">{r.title}</p>
                          <span className="reel-views-pill">▶ {r.views} views</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* D) MARKETPLACE DEALS */}
            {(activeTab === "all" || activeTab === "market") && filteredMarket.length > 0 && (
              <div className="search-result-block">
                <div className="block-header">
                  <h3><BsShop className="text-primary" /> Verified Marketplace Deals ({filteredMarket.length})</h3>
                  {activeTab === "all" && (
                    <span className="view-more-link" onClick={() => navigate("/market")}>
                      Open Marketplace <BsArrowRight />
                    </span>
                  )}
                </div>

                <div className="search-market-grid">
                  {filteredMarket.map(m => (
                    <div key={m.id} className="search-market-card" onClick={() => navigate("/market")}>
                      <div className="market-img-wrapper">
                        <img src={m.image} alt={m.title} />
                        <span className="market-price-tag">{m.price}</span>
                      </div>
                      <div className="market-card-body">
                        <h4 className="market-item-title">{m.title}</h4>
                        <p className="market-item-dist">
                          <BsGeoAltFill size={11} color="var(--color-primary)" /> {m.location} ({m.distance})
                        </p>
                        <div className="market-seller-strip">
                          <span>Seller: {m.seller}</span>
                          {m.verifiedSeller && <span className="verified-mini-badge" title="Aadhaar Verified">✓</span>}
                        </div>
                        <button
                          className="market-contact-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveChat({ name: m.seller, img: "https://i.pravatar.cc/150?u=seller", online: true });
                          }}
                        >
                          💬 Chat with Seller
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* E) COMMUNITIES & GROUPS */}
            {(activeTab === "all" || activeTab === "groups") && filteredCommunities.length > 0 && (
              <div className="search-result-block">
                <div className="block-header">
                  <h3><BsGlobe2 className="text-primary" /> Groups & Communities ({filteredCommunities.length})</h3>
                </div>

                <div className="search-groups-list">
                  {filteredCommunities.map(c => (
                    <div key={c.id} className="search-group-card">
                      <div className="group-banner-holder">
                        <img src={c.banner} alt={c.name} />
                        <div className="group-icon-bubble">{c.icon}</div>
                      </div>
                      <div className="group-content-area">
                        <div className="group-title-row">
                          <h4>{c.name}</h4>
                          <span className="group-privacy-pill">{c.privacy}</span>
                        </div>
                        <p className="group-desc-line">{c.desc}</p>
                        <div className="group-meta-row">
                          <span>👥 {c.members}</span>
                          <span>⚡ {c.postsPerDay}</span>
                        </div>
                        <button
                          className={`btn-join-group ${joinedGroups[c.id] ? "joined" : ""}`}
                          onClick={() => handleToggleJoinGroup(c.id, c.name)}
                        >
                          {joinedGroups[c.id] ? "✓ Joined" : "+ Join Community"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* F) TOPICS & HASHTAGS TAB */}
            {activeTab === "tags" && (
              <div className="search-result-block">
                <div className="block-header">
                  <h3>🔥 Trending Topics & Hashtags</h3>
                </div>
                <div className="search-topics-list">
                  {filteredTopics.map((t, idx) => (
                    <div
                      key={t.tag}
                      className="search-topic-row"
                      onClick={() => {
                        setQuery(t.tag);
                        handleSearchSubmit(t.tag);
                        setActiveTab("all");
                      }}
                    >
                      <div className="topic-rank-number">#{idx + 1}</div>
                      <div className="topic-info-col">
                        <div className="topic-tag-name">
                          {t.tag} {t.hot && <span className="hot-badge">HOT</span>}
                        </div>
                        <span className="topic-category-sub">{t.category} · {t.volume}</span>
                      </div>
                      <button className="topic-explore-btn">
                        Explore <BsArrowRight />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* EMPTY STATE */}
            {totalResultsCount === 0 && (
              <div className="search-empty-state-card">
                <div className="empty-state-emoji">🔍</div>
                <h3>No exact matches found for "{query}"</h3>
                <p>Try searching for different keywords, checking spelling, or browsing trending topics below.</p>
                <div className="empty-suggestion-pills">
                  {TRENDING_TOPICS.map(t => (
                    <button
                      key={t.tag}
                      className="empty-suggest-btn"
                      onClick={() => { setQuery(t.tag); handleSearchSubmit(t.tag); }}
                    >
                      {t.tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* RIGHT SIDEBAR (RECENT SEARCHES & TRENDING TOPICS) */}
          <aside className="search-sidebar-right">
            
            {/* Recent Searches Widget */}
            <div className="search-widget-box shadow-sm">
              <div className="widget-header">
                <h5>🕒 Recent Searches</h5>
                {recentSearches.length > 0 && (
                  <span className="widget-action-link" onClick={handleClearAllRecents}>
                    Clear All
                  </span>
                )}
              </div>

              {recentSearches.length === 0 ? (
                <p style={{ margin: 0, fontSize: 13, color: "var(--color-text-secondary)" }}>
                  No recent searches recorded yet.
                </p>
              ) : (
                <div className="recent-searches-list">
                  {recentSearches.map((item, i) => (
                    <div
                      key={i}
                      className="recent-search-item"
                      onClick={() => {
                        setQuery(item);
                        handleSearchSubmit(item);
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10, overflow: "hidden" }}>
                        <BsSearch size={13} className="text-muted" />
                        <span className="recent-text">{item}</span>
                      </div>
                      <button
                        className="recent-del-btn"
                        onClick={(e) => handleClearRecent(item, e)}
                        title="Remove search"
                      >
                        <BsTrash3 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Top Trending Discussions Widget */}
            <div className="search-widget-box shadow-sm">
              <div className="widget-header">
                <h5>🔥 Trending in India</h5>
                <span className="widget-action-link" onClick={() => setActiveTab("tags")}>
                  View All
                </span>
              </div>

              <div className="trending-widget-list">
                {TRENDING_TOPICS.map(t => (
                  <div
                    key={t.tag}
                    className="trending-widget-row"
                    onClick={() => {
                      setQuery(t.tag);
                      handleSearchSubmit(t.tag);
                    }}
                  >
                    <div>
                      <div className="tw-tag">{t.tag}</div>
                      <div className="tw-meta">{t.volume}</div>
                    </div>
                    {t.hot && <span className="tw-hot-pill">Trending</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Privacy Promise Banner */}
            <div className="search-privacy-shield-card">
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--color-primary)", fontWeight: 700, fontSize: 14 }}>
                <BsShieldCheck size={18} /> Zero-Tracking Search
              </div>
              <p style={{ margin: "8px 0 0", fontSize: 12.5, color: "var(--color-text-secondary)", lineHeight: 1.45 }}>
                Your searches are private and encrypted on your device. Nexoria does not build ad-targeting profiles or sell your search intent to third parties.
              </p>
            </div>

          </aside>

        </div>

      </div>

      {/* Micro-Tip Modal */}
      {tipModalPost && (
        <MicroTipModal
          creatorName={tipModalPost.name}
          creatorAvatar={tipModalPost.creatorAvatar}
          onClose={() => setTipModalPost(null)}
          onSuccess={(amt, msg) => {
            setTipModalPost(null);
            showToast(`⚡ Successfully tipped ₹${amt} to ${tipModalPost.name}!`);
          }}
        />
      )}

      {/* Floating Messenger Chat Drawer */}
      <ChatDrawer activeChat={activeChat} onClose={() => setActiveChat(null)} />

      {/* Mobile Bottom Navigation */}
      <div className="mobile-bottom-nav">
        <MenuIcons />
      </div>
    </div>
  );
}

export default SearchPage;
