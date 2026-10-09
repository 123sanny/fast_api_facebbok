import React, { useState } from "react";
import { BsArrowLeft } from "react-icons/bs";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import langs from "langs";
import "./css/LanguagePage.css";

const PRIMARY_LANGUAGES = [
  { code: "en", name: "English (US)", native: "English" },
  { code: "hi", name: "Hindi", native: "हिन्दी" },
  { code: "es", name: "Spanish", native: "Español" },
  { code: "fr", name: "French", native: "Français" },
  { code: "de", name: "German", native: "Deutsch" },
  { code: "bn", name: "Bengali", native: "বাংলা" },
  { code: "mr", name: "Marathi", native: "मराठी" },
  { code: "te", name: "Telugu", native: "తెలుగు" },
  { code: "ta", name: "Tamil", native: "தமிழ்" },
  { code: "gu", name: "Gujarati", native: "ગુજરાતી" },
  { code: "ur", name: "Urdu", native: "اردو" },
  { code: "ar", name: "Arabic", native: "العربية" },
  { code: "ru", name: "Russian", native: "Русский" },
  { code: "zh", name: "Chinese (Simplified)", native: "中文" },
  { code: "ja", name: "Japanese", native: "日本語" },
  { code: "pt", name: "Portuguese", native: "Português" }
];

const LanguagePage = ({ onClose }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [keyboardOn, setKeyboardOn] = useState(true);
  const [commentKeyboard, setCommentKeyboard] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(
    () => localStorage.getItem("language") || i18n?.language || "en"
  );
  
  const handleSelectLanguage = (langCode) => {
    setSelectedLanguage(langCode);
    localStorage.setItem("language", langCode);
    if (i18n?.changeLanguage) {
      i18n.changeLanguage(langCode);
    }
  };

  const handleBack = () => {
    if (onClose) {
      onClose();
    } else {
      navigate(-1);
    }
  };

  const otherLanguages = langs.all()
    .filter(lang => lang["1"] && !PRIMARY_LANGUAGES.some(p => p.code === lang["1"]))
    .map(lang => ({
      code: lang["1"],
      name: lang.name,
      native: lang.local || lang.name
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
  
  return (
    <div className="language-page">
      {/* Header */}
      <div className="language-header">
        <button className="back-btn" onClick={handleBack}>
          <BsArrowLeft />
        </button>
        <h4>{t("language")}</h4>
      </div>

      {/* Keyboard Section */}
      <div className="section-title">
        Indian language keyboard
      </div>

      <div className="setting-row">
        <span>The keyboard is turned on.</span>
        <input
          type="checkbox"
          checked={keyboardOn}
          onChange={() => setKeyboardOn(!keyboardOn)}
        />
      </div>

      <div className="setting-row">
        <span>The keyboard is turned off for comments.</span>
        <input
          type="checkbox"
          checked={commentKeyboard}
          onChange={() => setCommentKeyboard(!commentKeyboard)}
        />
      </div>

      {/* Suggested / Primary Languages */}
      <div className="section-title">
        Suggested Languages
      </div>

      <div className="language-scroll-list mb-3">
        {PRIMARY_LANGUAGES.map((lang) => (
          <div 
            className={`language-item ${selectedLanguage === lang.code ? "active-lang-item" : ""}`} 
            key={lang.code}
            onClick={() => handleSelectLanguage(lang.code)}
            style={{ cursor: "pointer" }}
          >
            <div>
              <span className="fw-semibold">{lang.native}</span>
              <small className="text-muted ms-2" style={{ fontSize: "0.8rem" }}>({lang.name})</small>
            </div>

            <input
              type="radio"
              name="language"
              checked={selectedLanguage === lang.code}
              onChange={() => handleSelectLanguage(lang.code)}
            />
          </div>
        ))}
      </div>

      {/* Other Languages Section */}
      <div className="section-title">
        All Other Languages
      </div>

      <div className="language-scroll-list">
        {otherLanguages.map((lang) => (
          <div 
            className="language-item" 
            key={lang.code}
            onClick={() => handleSelectLanguage(lang.code)}
            style={{ cursor: "pointer" }}
          >
            <span>{lang.native || lang.name}</span>

            <input
              type="radio"
              name="language"
              checked={selectedLanguage === lang.code}
              onChange={() => handleSelectLanguage(lang.code)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default LanguagePage;

