import React, { useState } from "react";
import { BsX, BsChevronRight, BsLockFill, BsTrash } from "react-icons/bs";
import ChooseAudiencePage from "./ChooseAudiencePage";
import "./css/EditSubPage.css";

function PhonePage({ onClose, onSave }) {
  const [phone, setPhone] = useState("096702 52272");
  const [privacy, setPrivacy] = useState("Only me");
  const [showAudience, setShowAudience] = useState(false);

  return (
    <>
      <div className="esp-wrapper">
        <div className="esp-header">
          <button className="esp-close" onClick={onClose}><BsX size={26} /></button>
          <h2>Phone</h2>
          <div className="esp-header-space" />
        </div>

        <div className="esp-body">
          <div className="esp-field">
            <div className="esp-field-inner">
              <label className="esp-field-label">Phone number</label>
              <input
                className="esp-field-input"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                type="tel"
              />
            </div>
            {phone && (
              <button className="esp-clear-btn" onClick={() => setPhone("")}>
                <BsX size={18} />
              </button>
            )}
          </div>

          <button className="esp-remove-btn" onClick={() => { setPhone(""); onClose(); }}>
            <BsTrash size={16} /> Remove
          </button>
        </div>

        <div className="esp-footer">
          <div className="esp-privacy-row" onClick={() => setShowAudience(true)}>
            <div>
              <p className="esp-privacy-label">Who can see this?</p>
              <p className="esp-privacy-value">
                <BsLockFill size={12} style={{ marginRight: 4 }} />
                {privacy}
              </p>
            </div>
            <BsChevronRight size={18} />
          </div>
          <button
            className={`esp-save-btn ${phone ? "active" : ""}`}
            disabled={!phone}
            onClick={() => onSave && onSave(phone, privacy)}
          >Save</button>
        </div>
      </div>

      {showAudience && (
        <ChooseAudiencePage
          initialValue="only_me"
          onClose={() => setShowAudience(false)}
          onSave={(val) => { setPrivacy(val); setShowAudience(false); }}
        />
      )}
    </>
  );
}

export default PhonePage;
