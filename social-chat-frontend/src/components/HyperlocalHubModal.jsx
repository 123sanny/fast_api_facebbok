import React, { useState } from "react";
import { 
  BsX, BsPlusCircleFill, 
  BsMegaphoneFill, BsCart3, BsCalendarEventFill, BsChatLeftDotsFill,
  BsSearch, BsShieldCheck
} from "react-icons/bs";
import { getActiveUserId, getActiveUserName, getUserStorageItem } from "../services/profileApi";
import "./css/HyperlocalHubModal.css";

const MOCK_LOCAL_HUBS = [
  { pincode: "110001", name: "Connaught Place, Central Delhi", activeMembers: 1420 },
  { pincode: "201301", name: "Sector 18 & Atta Market, Noida", activeMembers: 980 },
  { pincode: "122002", name: "DLF Cyber City & Phase 2, Gurugram", activeMembers: 1850 },
  { pincode: "400050", name: "Bandra West & Linking Rd, Mumbai", activeMembers: 2200 },
  { pincode: "560038", name: "Indiranagar 100ft Rd, Bengaluru", activeMembers: 3100 },
  { pincode: "500081", name: "HITEC City & Madhapur, Hyderabad", activeMembers: 2400 }
];

const MOCK_LOCAL_POSTS = [
  {
    id: 101,
    type: "alert",
    badge: "📢 Local Notice",
    author: "Rohan Sharma",
    avatar: "https://i.pravatar.cc/100?img=33",
    pincode: "110001",
    time: "25m ago",
    title: "Tree branch clearing on Janpath Road today",
    desc: "Municipal team is clearing the road between 2 PM to 4 PM. Expect slight traffic diversion near Metro Gate 2.",
    replies: 12
  },
  {
    id: 102,
    type: "market",
    badge: "🛍️ Neighborhood Sale",
    author: "Sneha Patel",
    avatar: "https://i.pravatar.cc/100?img=44",
    pincode: "110001",
    time: "1h ago",
    title: "Moving out garage sale: Solid wood study table (₹1,500)",
    desc: "Excellent condition with 2 drawers. Pick up available today near Block B.",
    replies: 8
  },
  {
    id: 103,
    type: "event",
    badge: "🎉 Community Meetup",
    author: "Vikram Malhotra",
    avatar: "https://i.pravatar.cc/100?img=52",
    pincode: "110001",
    time: "3h ago",
    title: "Sunday Morning Runners Club (5K & Coffee)",
    desc: "Meeting at Inner Circle Gate 4 at 6:30 AM this Sunday. Beginners welcome!",
    replies: 24
  }
];

function HyperlocalHubModal({ onClose }) {
  const [selectedHub, setSelectedHub] = useState(MOCK_LOCAL_HUBS[0]);
  const [pincodeSearch, setPincodeSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // 'all', 'alerts', 'market', 'events'
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newType, setNewType] = useState("alert");
  const [localPosts, setLocalPosts] = useState(MOCK_LOCAL_POSTS);

  const filteredHubs = MOCK_LOCAL_HUBS.filter(h => 
    h.pincode.includes(pincodeSearch) || h.name.toLowerCase().includes(pincodeSearch.toLowerCase())
  );

  const filteredPosts = localPosts.filter(p => {
    if (activeTab === "all") return true;
    return p.type === activeTab;
  });

  const handleCreatePost = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) return;

    const activeId = getActiveUserId();
    const newPost = {
      id: Date.now(),
      type: newType,
      badge: newType === "alert" ? "📢 Local Notice" : newType === "market" ? "🛍️ Neighborhood Sale" : "🎉 Community Meetup",
      author: getActiveUserName(),
      avatar: getUserStorageItem("avatar", `https://i.pravatar.cc/150?u=${activeId}`, activeId),
      pincode: selectedHub.pincode,
      time: "Just now",
      title: newTitle,
      desc: newDesc,
      replies: 0
    };

    setLocalPosts([newPost, ...localPosts]);
    setNewTitle("");
    setNewDesc("");
    setShowCreateModal(false);
  };

  return (
    <div className="local-modal-overlay" onClick={onClose}>
      <div className="local-modal-dialog shadow-lg" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="local-modal-header">
          <div className="local-header-left">
            <span className="local-pin-icon">📍</span>
            <div>
              <h4>Hyperlocal Neighborhood Spaces</h4>
              <span className="local-current-loc">
                Active Hub: <strong>{selectedHub.name} ({selectedHub.pincode})</strong>
              </span>
            </div>
          </div>
          <button className="local-close-btn" onClick={onClose} aria-label="Close">
            <BsX size={26} />
          </button>
        </div>

        {/* Location Selector Bar */}
        <div className="local-picker-row">
          <div className="local-search-wrap">
            <BsSearch className="local-s-icon" />
            <input
              type="text"
              placeholder="Search Pincode or Locality (e.g. 110001, Noida, Bandra)..."
              value={pincodeSearch}
              onChange={(e) => setPincodeSearch(e.target.value)}
              className="local-search-input"
            />
          </div>
        </div>

        {/* Popular Hubs Horizontal Scroll */}
        {pincodeSearch && (
          <div className="local-hubs-dropdown">
            {filteredHubs.map(hub => (
              <div 
                key={hub.pincode} 
                className="hub-select-item"
                onClick={() => {
                  setSelectedHub(hub);
                  setPincodeSearch("");
                }}
              >
                <div>
                  <strong>{hub.name}</strong>
                  <small>Pincode: {hub.pincode} · {hub.activeMembers} neighbors</small>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Local Feed Toolbar */}
        <div className="local-feed-toolbar">
          <div className="local-tabs-group">
            <button 
              className={`local-tab ${activeTab === "all" ? "active" : ""}`}
              onClick={() => setActiveTab("all")}
            >
              All Local Updates
            </button>
            <button 
              className={`local-tab ${activeTab === "alert" ? "active" : ""}`}
              onClick={() => setActiveTab("alert")}
            >
              <BsMegaphoneFill className="me-1" /> Alerts
            </button>
            <button 
              className={`local-tab ${activeTab === "market" ? "active" : ""}`}
              onClick={() => setActiveTab("market")}
            >
              <BsCart3 className="me-1" /> Buy & Sell
            </button>
            <button 
              className={`local-tab ${activeTab === "event" ? "active" : ""}`}
              onClick={() => setActiveTab("event")}
            >
              <BsCalendarEventFill className="me-1" /> Meetups
            </button>
          </div>

          <button className="btn-post-local" onClick={() => setShowCreateModal(true)}>
            <BsPlusCircleFill className="me-1" /> Post Local Update
          </button>
        </div>

        {/* Create Local Post Modal Overlay */}
        {showCreateModal && (
          <div className="local-create-inline-box shadow-sm">
            <h5>Post in {selectedHub.name} ({selectedHub.pincode})</h5>
            <form onSubmit={handleCreatePost}>
              <div className="mb-2">
                <select 
                  className="form-select form-select-sm"
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                >
                  <option value="alert">📢 Urgent Local Alert / News</option>
                  <option value="market">🛍️ Garage Sale / Buy & Sell</option>
                  <option value="event">🎉 Community Event / Meetup</option>
                </select>
              </div>
              <input
                type="text"
                placeholder="Headline / Subject..."
                className="form-control form-control-sm mb-2"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
              />
              <textarea
                rows={2}
                placeholder="Details for your neighbors..."
                className="form-control form-control-sm mb-2"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                required
              />
              <div className="d-flex justify-content-end gap-2">
                <button type="button" className="btn btn-sm btn-secondary rounded-pill" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-sm btn-primary rounded-pill px-3">
                  Publish to Neighborhood
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Local Feed Stream */}
        <div className="local-posts-scroll">
          {filteredPosts.map(post => (
            <div key={post.id} className="local-post-card">
              <div className="lp-top">
                <img src={post.avatar} alt={post.author} className="lp-avatar" />
                <div className="lp-author-wrap">
                  <strong>{post.author}</strong>
                  <small>{post.time} · Pincode {post.pincode}</small>
                </div>
                <span className={`lp-badge badge-${post.type}`}>{post.badge}</span>
              </div>
              <h6 className="lp-title">{post.title}</h6>
              <p className="lp-desc">{post.desc}</p>
              <div className="lp-footer">
                <button className="lp-reply-btn">
                  <BsChatLeftDotsFill className="me-1" /> {post.replies} Neighbor Comments
                </button>
                <span className="lp-verified">
                  <BsShieldCheck className="text-success me-1" /> Verified Resident
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default HyperlocalHubModal;
