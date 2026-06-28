import React, { useState } from "react";
import { BsX, BsChevronRight, BsTrash } from "react-icons/bs";
import ChooseAudiencePage from "./ChooseAudiencePage";
import "./css/EditSubPage.css";

function EmailPage({ onClose, onSave }) {
  const [email, setEmail] = useState("");
  const [privacy, setPrivacy] = useState("Friends");
  const [showAudience, setShowAudience] = useState(false);

  return (
    <>
      <div className="esp-wrapper">
        <div className="esp-header">
          <button className="esp-close" onClick={onClose}><BsX size={26} /></button>
          <h2>Email address</h2>
          <div className="esp-header-space" />
        </div>

        <div className="esp-body">
          <div className="esp-field">
            <div className="esp-field-inner">
              <label className="esp-field-label">Email address</label>
              <input
                className="esp-field-input"
                placeholder="Add your email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                type="email"
                autoFocus
              />
            </div>
            {email && (
              <button className="esp-clear-btn" onClick={() => setEmail("")}>
                <BsX size={18} />
              </button>
            )}
          </div>

          {email && (
            <button className="esp-remove-btn">
              <BsTrash size={16} /> Remove
            </button>
          )}
        </div>

        <div className="esp-footer">
          <div className="esp-privacy-row" onClick={() => setShowAudience(true)}>
            <div>
              <p className="esp-privacy-label">Who can see this?</p>
              <p className="esp-privacy-value">{privacy}</p>
            </div>
            <BsChevronRight size={18} />
          </div>
          <button
            className={`esp-save-btn ${email ? "active" : ""}`}
            disabled={!email}
            onClick={() => onSave && onSave(email, privacy)}
          >Save</button>
        </div>
      </div>

      {showAudience && (
        <ChooseAudiencePage
          initialValue="friends"
          onClose={() => setShowAudience(false)}
          onSave={(val) => { setPrivacy(val); setShowAudience(false); }}
        />
      )}
    </>
  );
}

export default EmailPage;
