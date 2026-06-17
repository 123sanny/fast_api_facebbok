import React, { useState } from "react";
import { BsArrowLeft, BsSearch } from "react-icons/bs";
import "./css/DarkModePage.css";

const DarkModePage = ({ onClose }) => {
  const [selected, setSelected] = useState("off");

  return (
    <div className="dark-mode-page">
      {/* Header */}
      <div className="dark-header">
        <BsArrowLeft
          className="dark-icon"
          onClick={onClose}
        />

        <h2>Dark mode</h2>

        <BsSearch className="dark-icon" />
      </div>

      {/* Options */}

      <div
        className="dark-option"
        onClick={() => setSelected("on")}
      >
        <span>On</span>

        <div
          className={`radio-btn ${
            selected === "on" ? "active" : ""
          }`}
        />
      </div>

      <div
        className="dark-option"
        onClick={() => setSelected("off")}
      >
        <span>Off</span>

        <div
          className={`radio-btn ${
            selected === "off" ? "active" : ""
          }`}
        />
      </div>

      <div
        className="dark-option dark-system"
        onClick={() => setSelected("system")}
      >
        <div>
          <h4>Use system settings</h4>

          <p>
            We'll adjust your appearance based on
            your device's system settings.
          </p>
        </div>

        <div
          className={`radio-btn ${
            selected === "system" ? "active" : ""
          }`}
        />
      </div>
    </div>
  );
};

export default DarkModePage;