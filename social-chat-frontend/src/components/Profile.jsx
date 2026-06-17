import React, { useState, useRef } from "react";
import MenuIcons from "./MenuIcons";
import CoverBottomSheet from "./CoverBottomSheet";
import FullScreenCover from "./FullScreenCover";
import ChooseCoverPhoto from "./ChooseCoverPhoto";
import DragToAdjust from "./DragToAdjust";
import "./css/Profile.css";
import Sidebar from "./Sidebar";
import { useNavigate } from "react-router-dom";
import { BsCameraFill, BsPencilFill, BsSearch, BsThreeDots } from "react-icons/bs";

const PROFILE_PIC = "https://i.pravatar.cc/150";

function Profile() {
  const [showCoverMenu, setShowCoverMenu]     = useState(false);
  const [coverImg, setCoverImg]               = useState("https://picsum.photos/800/300");
  const [showFullCover, setShowFullCover]     = useState(false);
  const [showChooseCover, setShowChooseCover] = useState(false);
  const [dragImage, setDragImage]             = useState(null); // Upload ke baad drag
  const [open, setOpen] = useState(false);
const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const friends = [
    { name: "Rohit Sharma",  img: "https://i.pravatar.cc/150?img=1" },
    { name: "Anjali Verma",  img: "https://i.pravatar.cc/150?img=2" },
    { name: "Amit Singh",    img: "https://i.pravatar.cc/150?img=3" },
    { name: "Priya Sharma",  img: "https://i.pravatar.cc/150?img=4" },
    { name: "Karan Jain",    img: "https://i.pravatar.cc/150?img=5" },
    { name: "Neha Gupta",    img: "https://i.pravatar.cc/150?img=6" },
  ];

  // Upload ke baad DragToAdjust open karo
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setDragImage(URL.createObjectURL(file));
    e.target.value = "";
  };

  return (
    <div className="profiles">
      <div className="menu-icons"><MenuIcons /></div>
<Sidebar open={open} setOpen={setOpen} />
      {/* Cover Photo */}
      <div className="cover">
        <img src={coverImg} alt="cover" />
        <div className="cover-overlay">
          <span className="left-icons" onClick={() => setOpen(true)}>☰</span>
          <div className="right-icons">
            <BsPencilFill
              onClick={() => navigate("/edit-profile")}
            />

            <BsSearch />
            <BsThreeDots />
          </div>
        </div>
        <div className="cover-camera" onClick={() => setShowCoverMenu(true)}>
          <BsCameraFill />
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      {/* Profile Info */}
      <div className="profile-info">
        <img className="profile-pic" src={PROFILE_PIC} alt="profile" />
        <h2>Sanny Tiwari</h2>
        <p>5K followers · 4 following · 43 posts</p>
        <span className="bio">Digital creator · Delhi · Computer Science</span>
      </div>

      {/* Buttons */}
      <div className="profile-buttons">
        <button className="blue">Professional dashboard</button>
        <div className="small-btns">
          <button>Add to story</button>
          <button>Advertise</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <span className="active">All</span>
        <span>Reels</span>
        <span>Photos</span>
        <span>Events</span>
      </div>

      {/* Desktop 2-column layout */}
      <div className="desktop-layout">
        <div className="left-column">
          <div className="details">
            <h3>Personal details <span className="edit-icon">✏️</span></h3>
            <p>📍 Delhi, India</p>
            <p>🏠 Deoria</p>
            <p>🎂 10 August 2002</p>
          </div>
          <div className="details">
            <h3>Education <span className="edit-icon">✏️</span></h3>
            <p>🎓 Bachelor of Technology - Computer Science</p>
            <p>🏫 Delhi University</p>
            <p>📅 2020 - 2024</p>
          </div>
          <div className="details friends-section">
            <div className="friends-header">
              <h3>Friends</h3>
              <span className="see-all">See all</span>
            </div>
            <div className="friends-row">
              {friends.map((friend, index) => (
                <div className="friend" key={index}>
                  <img src={friend.img} alt={friend.name} />
                  <p>{friend.name}</p>
                  <span>5 mutual friends</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="right-column">
          <div className="all-posts">
            <div className="post-header">
              <h3>All posts</h3>
              <span className="filter">Filters</span>
            </div>
            <div className="post-input">
              <img src={PROFILE_PIC} alt="user" />
              <input type="text" placeholder="What's on your mind?" />
              <span className="photo-icon">🖼️</span>
            </div>
            <div className="post-actions">
              <button className="reel-btn">🎬 Reel</button>
              <button className="live-btn">🔴 Live</button>
            </div>
            <button className="manage-posts">💬 Manage posts</button>
          </div>

          <div className="posts">
            <div className="post-card">
              <div className="post-top">
                <img className="post-profile" src="https://i.pravatar.cc/150?img=10" alt="user" />
                <div className="post-user-info">
                  <h4>Sanny Tiwari</h4>
                  <div className="post-meta">
                    <span>2d</span>
                    <span>🎵 Tanux - Sare Vaade Jitenge</span>
                    <span>🌍</span>
                  </div>
                </div>
                <div className="post-menu">⋯</div>
              </div>
              <p className="post-text">Finding ticket to world cup 2026 ⚽🔥</p>
              <div className="post-actions">
                <button>👍 Like</button>
                <button>💬 Comment</button>
                <button>↗ Share</button>
              </div>
            </div>

            <div className="post-card">
              <div className="post-top">
                <div className="post-user-info">
                  <h4>Sanny Tiwari</h4>
                  <div className="post-meta">
                    <span>1d</span><span>🌍</span>
                  </div>
                </div>
                <div className="post-menu">⋯</div>
              </div>
              <p className="post-text">Learning React everyday 🚀</p>
              <div className="post-actions">
                <button>👍 Like</button>
                <button>💬 Comment</button>
                <button>↗ Share</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* COVER BOTTOM SHEET */}
      <CoverBottomSheet
        isOpen={showCoverMenu}
        onClose={() => setShowCoverMenu(false)}
        onSeeCover={() => { setShowCoverMenu(false); setShowFullCover(true); }}
        onUpload={() => { setShowCoverMenu(false); fileInputRef.current.click(); }}
        onChoose={() => { setShowCoverMenu(false); setShowChooseCover(true); }}
      />

      {/* FULLSCREEN COVER VIEWER */}
      {showFullCover && (
        <FullScreenCover
          coverImg={coverImg}
          onClose={() => setShowFullCover(false)}
        />
      )}

      {/* CHOOSE COVER PHOTO PAGE */}
      {showChooseCover && (
        <ChooseCoverPhoto
          onClose={() => setShowChooseCover(false)}
          onSelect={(img) => setCoverImg(img)}
          profilePic={PROFILE_PIC}
        />
      )}

      {/* DRAG TO ADJUST — Upload ke baad */}
      {dragImage && (
        <DragToAdjust
          image={dragImage}
          profilePic={PROFILE_PIC}
          onSave={(img) => setCoverImg(img)}
          onClose={() => setDragImage(null)}
        />
      )}

    </div>
  );
}

export default Profile;