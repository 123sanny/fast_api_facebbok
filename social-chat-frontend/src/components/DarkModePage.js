import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  BsArrowLeft, BsMoonStarsFill, BsSunFill, BsPhoneFill, 
  BsShieldCheck, BsLightningChargeFill, BsEyeFill
} from "react-icons/bs";
import { applyTheme, getSavedTheme, isDarkActive } from "../utils/theme";
import "./css/DarkModePage.css";

const DarkModePage = ({ onClose }) => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(getSavedTheme);
  const [isDark, setIsDark] = useState(isDarkActive);

  useEffect(() => {
    const handleThemeChange = (e) => {
      setSelected(e.detail.theme);
      setIsDark(e.detail.isDark);
    };
    window.addEventListener("nexoria_theme_change", handleThemeChange);
    return () => window.removeEventListener("nexoria_theme_change", handleThemeChange);
  }, []);

  const handleBack = () => {
    if (onClose) {
      onClose();
    } else {
      navigate(-1);
    }
  };

  const handleSelectMode = (mode) => {
    setSelected(mode);
    applyTheme(mode);
  };

  return (
    <div className="dark-mode-page-root">
      {/* Mobile Top Header */}
      <div className="dark-page-header">
        <button className="dark-back-btn" onClick={handleBack} aria-label="Go back">
          <BsArrowLeft size={22} />
        </button>
        <h3>Dark Mode Settings</h3>
        <div style={{ width: 38 }}></div>
      </div>

      <div className="dark-page-container">
        
        {/* Visual Preview Section */}
        <div className="dark-preview-showcase">
          <div className="preview-hero-card">
            <div className={`preview-mini-phone ${isDark ? "phone-dark" : "phone-light"}`}>
              <div className="phone-notch"></div>
              <div className="phone-screen">
                <div className="screen-header-bar">
                  <div className="screen-logo-dot"></div>
                  <div className="screen-nav-lines"></div>
                </div>
                <div className="screen-post-card">
                  <div className="post-avatar-dot"></div>
                  <div className="post-text-skeleton">
                    <div className="line-long"></div>
                    <div className="line-short"></div>
                  </div>
                </div>
                <div className="screen-actions-row">
                  <span className="action-dot"></span>
                  <span className="action-dot"></span>
                  <span className="action-dot"></span>
                </div>
              </div>
            </div>

            <div className="preview-status-pill">
              {isDark ? (
                <span className="badge-dark-active">
                  <BsMoonStarsFill className="me-2 text-warning" /> Dark Mode Active
                </span>
              ) : (
                <span className="badge-light-active">
                  <BsSunFill className="me-2 text-warning" /> Light Mode Active
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Options List Group */}
        <div className="dark-options-group">
          <h5 className="group-title">Display Appearance</h5>

          {/* Option: ON (Dark) */}
          <div 
            className={`dark-option-card ${selected === "dark" ? "selected" : ""}`}
            onClick={() => handleSelectMode("dark")}
          >
            <div className="option-left">
              <div className="option-icon-wrap bg-dark-soft">
                <BsMoonStarsFill className="text-warning" />
              </div>
              <div className="option-text">
                <span className="option-title">On</span>
                <p className="option-desc">Optimal for low-light environments, saves AMOLED battery</p>
              </div>
            </div>
            <div className={`custom-radio-circle ${selected === "dark" ? "active" : ""}`}>
              <div className="radio-inner-dot"></div>
            </div>
          </div>

          {/* Option: OFF (Light) */}
          <div 
            className={`dark-option-card ${selected === "light" ? "selected" : ""}`}
            onClick={() => handleSelectMode("light")}
          >
            <div className="option-left">
              <div className="option-icon-wrap bg-light-soft">
                <BsSunFill className="text-warning" />
              </div>
              <div className="option-text">
                <span className="option-title">Off</span>
                <p className="option-desc">Crisp, clean high-contrast appearance for daytime</p>
              </div>
            </div>
            <div className={`custom-radio-circle ${selected === "light" ? "active" : ""}`}>
              <div className="radio-inner-dot"></div>
            </div>
          </div>

          {/* Option: SYSTEM */}
          <div 
            className={`dark-option-card ${selected === "system" ? "selected" : ""}`}
            onClick={() => handleSelectMode("system")}
          >
            <div className="option-left">
              <div className="option-icon-wrap bg-blue-soft">
                <BsPhoneFill className="text-primary" />
              </div>
              <div className="option-text">
                <span className="option-title">Use system settings</span>
                <p className="option-desc">Automatically match your device's daylight & night schedule</p>
              </div>
            </div>
            <div className={`custom-radio-circle ${selected === "system" ? "active" : ""}`}>
              <div className="radio-inner-dot"></div>
            </div>
          </div>
        </div>

        {/* Benefits & Info Section */}
        <div className="dark-benefits-card">
          <h6><BsShieldCheck className="text-primary me-2" /> Nexoria Display Comfort</h6>
          <div className="benefit-row">
            <BsEyeFill className="text-info me-2 flex-shrink-0" />
            <span>Reduces eye fatigue during late-night scrolling and video watching.</span>
          </div>
          <div className="benefit-row">
            <BsLightningChargeFill className="text-warning me-2 flex-shrink-0" />
            <span>Conserves battery life on OLED and AMOLED mobile screens.</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DarkModePage;