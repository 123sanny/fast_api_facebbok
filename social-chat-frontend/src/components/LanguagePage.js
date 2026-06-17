import React, { useState } from "react";
import { BsArrowLeft } from "react-icons/bs";
import { useTranslation } from "react-i18next";
import langs from "langs";
import "./css/LanguagePage.css";

const LanguagePage = ({ onClose }) => {
  const { t, i18n } = useTranslation();

  const [keyboardOn, setKeyboardOn] = useState(true);
  const [commentKeyboard, setCommentKeyboard] = useState(false);
const [selectedLanguage, setSelectedLanguage] = useState("en");
  
 
const languages = langs.all()
  .filter(lang => lang["1"])
  .map(lang => ({
    code: lang["1"],
    name: lang.local || lang.name
  }))
  .sort((a, b) => a.name.localeCompare(b.name));
  
  return (
    <div className="language-page">

      {/* Header */}
      <div className="language-header">
        <button className="back-btn" onClick={onClose}>
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

      {/* Language Section */}
      <div className="section-title">
        Facebook language
      </div>

     <div className="language-scroll-list">
  {languages.map((lang) => (
    <div className="language-item" key={lang.code}>
      <span>{lang.name}</span>

      <input
        type="radio"
        name="language"
        checked={selectedLanguage === lang.code}
       onChange={() => {
  setSelectedLanguage(lang.code);

  if (i18n?.changeLanguage) {
    i18n.changeLanguage(lang.code);
  }
}}
      />
    </div>
  ))}
</div>

    </div>
  );
};

export default LanguagePage;

