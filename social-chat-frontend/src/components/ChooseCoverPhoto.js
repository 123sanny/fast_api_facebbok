import React, { useState } from "react";
import { BsChevronLeft } from "react-icons/bs";
import DragToAdjust from "./DragToAdjust";
import "./css/ChooseCoverPhoto.css";

const SAMPLE_PHOTOS = [
  "https://picsum.photos/seed/a1/600/400",
  "https://picsum.photos/seed/a2/600/600",
  "https://picsum.photos/seed/a3/600/400",
  "https://picsum.photos/seed/a4/600/400",
  "https://picsum.photos/seed/a5/600/600",
  "https://picsum.photos/seed/a6/600/400",
  "https://picsum.photos/seed/a7/600/400",
  "https://picsum.photos/seed/a8/600/400",
  "https://picsum.photos/seed/a9/600/600",
  "https://picsum.photos/seed/a10/600/400",
  "https://picsum.photos/seed/a11/600/400",
  "https://picsum.photos/seed/a12/600/400",
];

const TABS = ["Photos of you", "Uploads", "Albums", "Videos"];

function ChooseCoverPhoto({ onClose, onSelect, profilePic }) {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const handlePhotoClick = (img) => {
    setSelectedPhoto(img); // DragToAdjust open karo
  };

  const handleSave = (img) => {
    onSelect(img);  // cover set karo Profile mein
    onClose();      // ChooseCoverPhoto band karo
  };

  return (
    <>
      <div className="ccp-wrapper">

        {/* TOP BAR */}
        <div className="ccp-topbar">
          <button className="ccp-back" onClick={onClose}>
            <BsChevronLeft size={22} />
          </button>
          <h2 className="ccp-title">Photos of you</h2>
        </div>

        {/* TABS */}
        <div className="ccp-tabs">
          {TABS.map((tab, i) => (
            <button
              key={i}
              className={`ccp-tab ${activeTab === i ? "active" : ""}`}
              onClick={() => setActiveTab(i)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* PHOTO GRID */}
        <div className="ccp-grid">
          {SAMPLE_PHOTOS.map((img, i) => (
            <div
              key={i}
              className="ccp-photo"
              onClick={() => handlePhotoClick(img)}
            >
              <img src={img} alt={`photo-${i}`} />
            </div>
          ))}
        </div>

      </div>

      {/* DragToAdjust — photo select hone par open hoga */}
      {selectedPhoto && (
        <DragToAdjust
          image={selectedPhoto}
          profilePic={profilePic || "https://i.pravatar.cc/150"}
          onSave={handleSave}
          onClose={() => setSelectedPhoto(null)}
        />
      )}
    </>
  );
}

export default ChooseCoverPhoto;