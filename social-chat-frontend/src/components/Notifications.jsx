import React, { useState } from "react";
import MenuIcons from "./MenuIcons";
import "./Notifications.css";

function Notifications() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Notifications Data
  const notifications = [
    { id: 1, type: "new", name: "", text: "Someone's trying to log in. Let us know if it's you.", time: "14m", img: "https://i.pravatar.cc/150?u=1", icon: "bi-shield-lock-fill", iconBg: "#1877F2", unread: true },
    { id: 2, type: "earlier", name: "Vijay Sagar Azad", text: "mentioned you and other followers in a comment.", time: "50m", img: "https://i.pravatar.cc/150?u=2", icon: "bi-chat-fill", iconBg: "#45bd62", unread: true },
    { id: 4, name: "Er AK Yadav", text: "was tagged in a post.", time: "10h", img: "https://i.pravatar.cc/150?u=3", icon: "bi-play-btn-fill", iconBg: "#f02849", unread: false }
  ];

  // Search History Data
  const recentSearches = [
    { id: 1, name: "ShabnamShaikh8291", desc: "Blogger · 1.3M followers", img: "https://i.pravatar.cc/150?u=shab" },
    { id: 2, name: "ak", desc: "", icon: "bi-clock" },
    { id: 3, name: "Sanny Tiwari", desc: "", img: "https://i.pravatar.cc/150?u=sanny" },
    { id: 5, name: "Birju Gupta", desc: "", img: "https://i.pravatar.cc/150?u=birju", online: true },
  ];

  const suggested = [
    { id: 10, name: "DrPradeep Pathak", desc: "1 mutual friend", img: "https://i.pravatar.cc/150?u=dr" },
    { id: 11, name: "facebook monetization", desc: "Public group · 46K members", img: "https://i.pravatar.cc/150?u=fb" },
  ];

  const renderNotif = (notif) => (
    <div key={notif.id} className={`notif-card ${notif.unread ? "unread" : ""}`}>
      <div className="notif-img-wrapper">
        <img src={notif.img} alt="user" className="notif-avatar" />
        <div className="notif-badge" style={{ backgroundColor: notif.iconBg }}>
          <i className={`bi ${notif.icon}`}></i>
        </div>
      </div>
      <div className="notif-content">
        <p>{notif.name && <strong>{notif.name} </strong>}{notif.text}</p>
        <span className="notif-time">{notif.time}</span>
      </div>
      <i className="bi bi-three-dots notif-more"></i>
    </div>
  );

  return (
    <div className="notif-container">
      {!isSearching ? (
        // --- NORMAL NOTIFICATIONS UI ---
        <>
          <div className="menu-icons"><MenuIcons /></div>
          <div className="notif-header">
            <div className="header-row">
              <div className="header-left">
                <i className="bi bi-list"></i>
                <h1>Notifications</h1>
              </div>
              <i className="bi bi-search search-trigger" onClick={() => setIsSearching(true)}></i>
            </div>
          </div>
          <section className="notif-section">
            <h3>New</h3>
            {notifications.filter(n => n.type === "new").map(renderNotif)}
          </section>
          <section className="notif-section">
            <h3>Earlier</h3>
            {notifications.filter(n => n.type !== "new").map(renderNotif)}
          </section>
        </>
      ) : (
        // --- FULL SEARCH UI (IMAGE 6) ---
        <div className="search-overlay">
          <div className="search-nav">
            <i className="bi bi-arrow-left" onClick={() => {setIsSearching(false); setSearchTerm("");}}></i>
            <div className="search-bar-inner">
              <i className="bi bi-search"></i>
              <input 
                type="text" 
                placeholder="Search with Meta AI" 
                autoFocus 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="search-scroll-body">
            <div className="s-head"><span>Recent</span><button>See all</button></div>
            {recentSearches.map(item => (
              <div key={item.id} className="s-item">
                <div className="s-left">
                  {item.icon ? (
                    <div className="s-icon-circle"><i className={`bi ${item.icon}`}></i></div>
                  ) : (
                    <div className="s-img-wrap">
                      <img src={item.img} alt="" />
                      {item.online && <span className="s-online"></span>}
                    </div>
                  )}
                  <div className="s-text">
                    <p className="s-name">{item.name}</p>
                    {item.desc && <p className="s-desc">{item.desc}</p>}
                  </div>
                </div>
                <i className="bi bi-three-dots"></i>
              </div>
            ))}

            <div className="s-head" style={{marginTop: '15px'}}><span>Suggested</span><button>Refresh</button></div>
            {suggested.map(item => (
              <div key={item.id} className="s-item">
                <div className="s-left">
                  <img src={item.img} alt="" className="s-avatar-only" />
                  <div className="s-text">
                    <p className="s-name">{item.name}</p>
                    <p className="s-desc">{item.desc}</p>
                  </div>
                </div>
                <i className="bi bi-three-dots"></i>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Notifications;