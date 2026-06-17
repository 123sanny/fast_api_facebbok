import React from 'react';
import { 
  BsMusicNoteBeamed, BsType, BsStars, 
  BsX, BsGearFill, BsChevronDown, BsImages 
} from "react-icons/bs";
import "./css/CreateStory.css";

const ReelStory = ({ onClose }) => {
  // Dummy gallery images
  const galleryImages = Array(12).fill("https://picsum.photos/200/300");

  return (
    <div className="create-story-overlay">
      {/* Header */}
      <div className="story-header">
        <BsX size={30} onClick={onClose} style={{cursor:'pointer'}} />
        <h5 className="mb-0 fw-bold">Create story</h5>
        <BsGearFill size={22} />
      </div>

      {/* 1. Horizontal Scrolling Options (Top Section) */}
      <div className="story-options-scroll d-flex gap-3 px-3 py-4">
        <div className="story-opt-card">
          <div className="opt-icon-circle"><BsMusicNoteBeamed /></div>
          <span>Music</span>
        </div>
        <div className="story-opt-card">
          <div className="opt-icon-circle"><BsType /></div>
          <span>Text</span>
        </div>
        <div className="story-opt-card">
          <div className="opt-icon-circle"><BsStars /></div>
          <span>AI images</span>
        </div>
        {/* Aap aur bhi add kar sakte hain... */}
      </div>

      {/* 2. Gallery Header Section */}
      <div className="gallery-controls px-3 d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center fw-bold">
          Gallery <BsChevronDown size={14} className="ms-1" />
        </div>
        <button className="select-multiple-btn">
          <BsImages className="me-2" /> Select multiple
        </button>
      </div>

      {/* 3. Gallery Grid (Scrolling Section) */}
      <div className="gallery-grid mt-3">
        {galleryImages.map((img, index) => (
          <div key={index} className="gallery-item">
            <img src={`${img}?sig=${index}`} alt="gallery" />
          </div>
        ))}
      </div>

      {/* Camera Floating Button */}
      <div className="camera-float-btn">
         <i className="bi bi-camera-fill"></i>
      </div>
    </div>
  );
};

export default ReelStory;