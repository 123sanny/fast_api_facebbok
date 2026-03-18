import React from "react";
import MenuIcons from "./MenuIcons";
import "./Reels.css";

function Reels() {
  return (
        <div>
        <div className="menu-icons">
            <MenuIcons />
        </div>
   
    <div className="reels-wrapper">
      {/* 1. Top Reels Header (Image 2 ke mutabiq) */}
      <div className="reels-top-nav">
        <div className="reels-header-left">
          <i className="bi bi-list"></i>
          <h2>Reels</h2>
        </div>
        <div className="reels-header-right">
          <i className="bi bi-camera"></i>
          <i className="bi bi-search"></i>
          <div className="profile-icon-wrapper">
            <i className="bi bi-person-circle"></i>
            <span className="red-dot"></span>
          </div>
        </div>
      </div>

      {/* 2. Main Reel Section (Image 1 ke mutabiq) */}
      <div className="reel-container">
        <div className="reel-video-mock">
          {/* Hindi Title Overlay */}
          <div className="hindi-overlay">
            Dhoni ने गंभीर को खुश कर दिया!
          </div>

          {/* Action Buttons (Right Side) */}
          <div className="reel-side-actions">
            <div className="action-btn">
              <i className="bi bi-hand-thumbs-up"></i>
              <span>44k</span>
            </div>
            <div className="action-btn">
              <i className="bi bi-chat-dots"></i>
              <span>156</span>
            </div>
            <div className="action-btn">
              <i className="bi bi-share"></i>
              <span>230</span>
            </div>
            <div className="action-btn">
              <i className="bi bi-bookmark"></i>
              <span>937</span>
            </div>
            <i className="bi bi-three-dots"></i>
          </div>

          {/* Bottom Profile Info */}
          <div className="reel-bottom-info">
            <div className="user-info-row">
              <div className="brand-logo">CB</div>
              <div className="user-text">
                <p className="user-name">CricketBook By Shubh... <i className="bi bi-globe-americas"></i></p>
                <p className="sub-text">New for you - 1 of 2</p>
              </div>
              <button className="follow-btn">Follow</button>
            </div>
            <p className="reel-caption">
              Dhoni Praises Gambhir as 'Coach ... <span>more</span>
            </p>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}

export default Reels;
    

  