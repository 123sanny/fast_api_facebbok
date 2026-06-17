import React, { useState, useRef } from "react";
import { BsChevronLeft } from "react-icons/bs";
import "./css/DragToAdjust.css";

function DragToAdjust({ image, profilePic, onSave, onClose }) {
  const [offsetY, setOffsetY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef(0);
  const dragStartOffset = useRef(0);

  // ---- Touch drag ----
  const handleTouchStart = (e) => {
    setIsDragging(true);
    dragStartY.current = e.touches[0].clientY;
    dragStartOffset.current = offsetY;
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const delta = e.touches[0].clientY - dragStartY.current;
    const newOffset = dragStartOffset.current + delta;
    // Clamp: image bahut upar ya neeche na jaye
    setOffsetY(Math.min(80, Math.max(-80, newOffset)));
  };

  const handleTouchEnd = () => setIsDragging(false);

  // ---- Mouse drag (desktop) ----
  const handleMouseDown = (e) => {
    setIsDragging(true);
    dragStartY.current = e.clientY;
    dragStartOffset.current = offsetY;
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const delta = e.clientY - dragStartY.current;
    const newOffset = dragStartOffset.current + delta;
    setOffsetY(Math.min(80, Math.max(-80, newOffset)));
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleSave = () => {
    onSave(image); // adjusted image cover mein set karo
    onClose();
  };

  return (
    <div
      className="dta-wrapper"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* ===== TOP BAR ===== */}
      <div className="dta-topbar">
        <button className="dta-back" onClick={onClose}>
          <BsChevronLeft size={22} />
          <span>Drag to Adjust</span>
        </button>
        <button className="dta-save" onClick={handleSave}>
          SAVE
        </button>
      </div>

      {/* ===== DRAG AREA ===== */}
      <div
        className="dta-preview"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        style={{ cursor: isDragging ? "grabbing" : "grab" }}
      >
        {/* Cover image — drag se move hogi */}
        <img
          className="dta-cover-img"
          src={image}
          alt="cover"
          style={{ transform: `translateY(${offsetY}px)` }}
          draggable={false}
        />

        {/* Profile pic overlay — bottom left */}
        <div className="dta-profile-overlay">
          <img
            className="dta-profile-pic"
            src={profilePic}
            alt="profile"
          />
        </div>
      </div>

      {/* ===== SHARE TO FEED ===== */}
      <div className="dta-footer">
        <ShareToFeedToggle />
      </div>
    </div>
  );
}

/* ---- Share to Feed checkbox ---- */
function ShareToFeedToggle() {
  const [checked, setChecked] = useState(true);
  return (
    <div className="dta-share-row" onClick={() => setChecked(!checked)}>
      <span>Share your update to Feed</span>
      <div className={`dta-checkbox ${checked ? "checked" : ""}`}>
        {checked && <span className="dta-checkmark">✓</span>}
      </div>
    </div>
  );
}

export default DragToAdjust;
