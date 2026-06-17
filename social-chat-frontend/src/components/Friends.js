import React, { useState } from "react";
import { BsSearch } from "react-icons/bs";
import MenuIcons from "./MenuIcons";
import Sidebar from "./Sidebar";

import "./css/Friends.css";

const friendRequests = [
  {
    id: 1,
    name: "Md Aslam",
    time: "4d",
    img: "https://i.pravatar.cc/100?img=11",
    mutualText: "92 mutual friends",
    mutualImg: "https://i.pravatar.cc/20?img=5",
    badge: "3h",
  },
  {
    id: 2,
    name: "حسام نبيل",
    time: "20w",
    img: null,
    mutualText: null,
    mutualImg: null,
    badge: null,
  },
  {
    id: 3,
    name: "Naina Kumari",
    time: "2y",
    img: "https://i.pravatar.cc/100?img=20",
    mutualText: "1 mutual friend",
    mutualImg: "https://i.pravatar.cc/20?img=8",
    badge: null,
  },
  {
    id: 4,
    name: "Shaw Rahulshaw Rajesh",
    time: "23w",
    img: "https://i.pravatar.cc/100?img=14",
    mutualText: null,
    mutualImg: null,
    badge: "25m",
  },
];

const suggestions = [
  { id: 1, name: "Nirmala Sharma", mutual: "3 mutual friends", img: "https://i.pravatar.cc/100?img=25" },
  { id: 2, name: "Rahul Verma", mutual: "5 mutual friends", img: "https://i.pravatar.cc/100?img=30" },
  { id: 3, name: "Priya Singh", mutual: "12 mutual friends", img: "https://i.pravatar.cc/100?img=35" },
  { id: 4, name: "Amit Kumar", mutual: "2 mutual friends", img: "https://i.pravatar.cc/100?img=40" },
];

function Friends() {
  const [activeTab, setActiveTab] = useState("online");
  const [requests, setRequests] = useState(friendRequests);
  const [open, setOpen] = useState(false);

  const handleConfirm = (id) => setRequests(prev => prev.filter(r => r.id !== id));
  const handleDelete = (id) => setRequests(prev => prev.filter(r => r.id !== id));

  return (
      
    <div className="fr-container">
       <div className="profiles">
        <div className="menu-icons">
            <MenuIcons />
      </div>
      </div>
      {/* Header */}
      <div className="fr-header">
        <div className="fr-header-left">
          <Sidebar open={open} setOpen={setOpen} />
          <span className="menu" onClick={() => setOpen(true)}>☰</span>
          <h2>Friends</h2>
        </div>
        <div className="fr-header-right">
          <div className="fr-search-circle">
            <BsSearch />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="fr-tabs">
        <button
          className={`fr-tab ${activeTab === "online" ? "active" : ""}`}
          onClick={() => setActiveTab("online")}
        >
          <span className="fr-online-dot"></span> 221 online
        </button>
        <button
          className={`fr-tab ${activeTab === "suggestions" ? "active" : ""}`}
          onClick={() => setActiveTab("suggestions")}
        >
          Suggestions
        </button>
        <button
          className={`fr-tab ${activeTab === "yours" ? "active" : ""}`}
          onClick={() => setActiveTab("yours")}
        >
          Your friends
        </button>
      </div>

      <div className="fr-divider"></div>

      {/* Friend Requests */}
      <div className="fr-section">
        <div className="fr-section-header">
          <h3>Friend requests <span className="fr-count">{requests.length}</span></h3>
          <span className="fr-see-all">See all</span>
        </div>

        {requests.map((req) => (
          <div className="fr-card" key={req.id}>
            <div className="fr-avatar-wrap">
              {req.img
                ? <img src={req.img} alt={req.name} className="fr-avatar" />
                : <div className="fr-avatar-placeholder"><span>👤</span></div>
              }
              {req.badge && <span className="fr-badge">{req.badge}</span>}
            </div>

            <div className="fr-info">
              <div className="fr-name-row">
                <strong>{req.name}</strong>
                <span className="fr-time">{req.time}</span>
              </div>

              {req.mutualText && (
                <div className="fr-mutual">
                  <img src={req.mutualImg} alt="mutual" className="fr-mutual-img" />
                  <span>{req.mutualText} · {req.time}</span>
                </div>
              )}

              <div className="fr-btns">
                <button className="fr-btn-confirm" onClick={() => handleConfirm(req.id)}>Confirm</button>
                <button className="fr-btn-delete" onClick={() => handleDelete(req.id)}>Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="fr-divider"></div>

      {/* People You May Know */}
      <div className="fr-section">
        <div className="fr-section-header">
          <h3>People you may know</h3>
        </div>

        {suggestions.map((s) => (
          <div className="fr-card" key={s.id}>
            <div className="fr-avatar-wrap">
              <img src={s.img} alt={s.name} className="fr-avatar" />
            </div>
            <div className="fr-info">
              <strong>{s.name}</strong>
              <div className="fr-mutual">
                <span>{s.mutual}</span>
              </div>
              <div className="fr-btns">
                <button className="fr-btn-confirm">Add Friend</button>
                <button className="fr-btn-delete">Remove</button>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

export default Friends;