import React from "react";
import { BsImage, BsUpload, BsFacebook } from "react-icons/bs";
import "./css/CoverBottomSheet.css";

function CoverBottomSheet({
  isOpen,
  onClose,
  onSeeCover,
  onUpload,
  onChoose,
  showSeeCover = true,
}) {
  return (
    <>
      {isOpen && (
        <div className="cbs-backdrop" onClick={onClose} />
      )}

      <div className={`cbs-sheet ${isOpen ? "open" : ""}`}>
        <div className="cbs-handle" />

        <ul className="cbs-list">

          {showSeeCover && (
            <li onClick={onSeeCover}>
              <div className="cbs-icon">
                <BsImage size={20} />
              </div>
              <span>See cover photo</span>
            </li>
          )}

          <li onClick={onUpload}>
            <div className="cbs-icon">
              <BsUpload size={20} />
            </div>
            <span>Upload Photo</span>
          </li>

          <li onClick={onChoose}>
            <div className="cbs-icon cbs-icon-dark">
              <BsFacebook size={20} />
            </div>
            <span>
              {showSeeCover
                ? "Choose cover photo"
                : "Choose profile photo"}
            </span>
          </li>

        </ul>
      </div>
    </>
  );
}

export default CoverBottomSheet;