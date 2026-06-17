import React from "react";
import { BsX } from "react-icons/bs";
import "./css/MetaAI.css";

const Meta = ({ onClose }) => {

  const handleRedirect = () => {
    window.open("https://www.meta.ai/", "_blank"); // new tab
    // ya same tab ke liye:
    // window.location.href = "https://www.meta.ai/";
  };

  return (
    <div className="meta-overlay">

      {/* Header */}
      <div className="meta-header">
        <BsX size={28} onClick={onClose} className="close-btn" />
        <h5>Meta AI support assistant</h5>
        <div style={{width: "28px"}}></div>
      </div>

      {/* Content */}
      <div className="meta-content">
        
        <div className="loader"></div>

        <h4>Meta AI सपोर्ट असिस्टेंट से पूछें</h4>

        <p>
          इस सेवा का उपयोग करने का मतलब है कि आप Meta AI की शर्तों से सहमत हैं।
        </p>

        {/* Options */}
        <div className="meta-options">
          <div className="meta-option" onClick={handleRedirect}>
            मैं Facebook पर अपना पासवर्ड कैसे रीसेट करूं?
          </div>

          <div className="meta-option" onClick={handleRedirect}>
            मेरी पोस्ट कौन देख सकता है?
          </div>

          <div className="meta-option" onClick={handleRedirect}>
            अनुचित कंटेंट की रिपोर्ट कैसे करें?
          </div>
        </div>

      </div>

      {/* Footer Input */}
      <div className="meta-footer">
        <input 
          type="text" 
          placeholder="मैसेज लिखें..." 
          onFocus={handleRedirect}
        />
      </div>

    </div>
  );
};

export default Meta;