import React, { useState } from "react";
import { BsX, BsTag, BsGeoAlt, BsThreeDotsVertical, BsHandThumbsUp, BsChatSquare, BsShare, BsHandThumbsUpFill } from "react-icons/bs";
import "./css/FullScreenCover.css";

function FullScreenCover({ coverImg, onClose }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(39);

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount(prev => liked ? prev - 1 : prev + 1);
  };

  // Aaj ki date
  const today = new Date();
  const dateStr = today.toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric"
  }).toUpperCase();

  return (
    <div className="fsc-wrapper">

      {/* ===== TOP BAR ===== */}
      <div className="fsc-topbar">
        <button className="fsc-icon-btn" onClick={onClose}>
          <BsX size={26} />
        </button>
        <div className="fsc-topbar-right">
          <button className="fsc-icon-btn"><BsTag size={20} /></button>
          <button className="fsc-icon-btn fsc-location"><BsGeoAlt size={20} /></button>
          <button className="fsc-icon-btn"><BsThreeDotsVertical size={20} /></button>
        </div>
      </div>

      {/* ===== IMAGE AREA ===== */}
      <div className="fsc-image-area">
        <img src={coverImg} alt="Cover" />
      </div>

      {/* ===== BOTTOM INFO ===== */}
      <div className="fsc-bottom">

        {/* Name + Location */}
        <div className="fsc-user-info">
          <p className="fsc-name">Sanny Tiwari</p>
          <p className="fsc-location-text">— at <strong>Delhi, India.</strong></p>
          <p className="fsc-date">{dateStr}</p>
        </div>

        {/* Likes + Comments count */}
        <div className="fsc-counts">
          <div className="fsc-reaction-icons">
            <span className="fsc-react-like">👍</span>
            <span className="fsc-react-heart">❤️</span>
            <span className="fsc-count-num">{likeCount}</span>
          </div>
          <span className="fsc-comment-count">5 comments</span>
        </div>

        <div className="fsc-divider" />

        {/* Action Buttons */}
        <div className="fsc-actions">
          <button className={`fsc-action-btn ${liked ? "liked" : ""}`} onClick={handleLike}>
            {liked ? <BsHandThumbsUpFill size={20} /> : <BsHandThumbsUp size={20} />}
            <span>Like</span>
          </button>

          <button className="fsc-action-btn">
            <BsChatSquare size={18} />
            <span>Comment</span>
          </button>

          <button className="fsc-action-btn">
            <BsShare size={18} />
            <span>Share</span>
          </button>
        </div>

      </div>
    </div>
  );
}

export default FullScreenCover;