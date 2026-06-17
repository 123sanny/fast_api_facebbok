import React, { useState } from "react";
import { BsX, BsChevronDown, BsLockFill } from "react-icons/bs";
import "./css/GenderPage.css";

const SYSTEM_PRONOUNS = ["he/him", "she/her", "they/them"];

function GenderPage({ onClose, onSave }) {
  const [gender, setGender] = useState("Male");
  const [pronouns, setPronouns] = useState("");
  const [systemPronoun, setSystemPronoun] = useState("he/him");
  const [showSysDropdown, setShowSysDropdown] = useState(false);

  return (
    <div className="gp-wrapper">
      {/* Header */}
      <div className="gp-header">
        <button className="gp-close" onClick={onClose}><BsX size={26} /></button>
        <h2>Gender and pronouns</h2>
        <div className="gp-header-space" />
      </div>

      <div className="gp-body">
        {/* Gender Section */}
        <div className="gp-section-title">Gender</div>
        <p className="gp-section-sub">You can add up to 10 gender identities.</p>
        <div className="gp-privacy-pill">
          <BsLockFill size={13} /> Only me <BsChevronDown size={12} />
        </div>
        <div className="gp-field">
          <label className="gp-field-label">Gender</label>
          <input
            className="gp-field-input"
            value={gender}
            onChange={e => setGender(e.target.value)}
          />
        </div>

        {/* Expressive Pronouns */}
        <div className="gp-section-title" style={{ marginTop: 28 }}>Expressive pronouns</div>
        <p className="gp-section-sub">
          Let people know how to refer to you. You can add up to 4 pronouns.
        </p>
        <div className="gp-privacy-pill">
          <BsLockFill size={13} /> Only me <BsChevronDown size={12} />
        </div>
        <div className="gp-field">
          <input
            className="gp-field-input"
            placeholder="Your pronouns"
            value={pronouns}
            onChange={e => setPronouns(e.target.value)}
          />
        </div>

        {/* System Pronouns */}
        <div className="gp-section-title" style={{ marginTop: 28 }}>System pronouns</div>
        <p className="gp-section-sub">
          Used for notifications from Facebook. System pronouns are public and can be seen by anyone.{" "}
          <span className="gp-learn-more">Learn more</span>
        </p>
        <div className="gp-field gp-field-select" onClick={() => setShowSysDropdown(!showSysDropdown)}>
          <label className="gp-field-label">System pronouns</label>
          <div className="gp-select-row">
            <span className="gp-field-input">{systemPronoun}</span>
            <BsChevronDown size={16} className="gp-select-arrow" />
          </div>
        </div>
        {showSysDropdown && (
          <div className="gp-dropdown">
            {SYSTEM_PRONOUNS.map(p => (
              <div
                key={p}
                className={`gp-dropdown-item ${systemPronoun === p ? "selected" : ""}`}
                onClick={() => { setSystemPronoun(p); setShowSysDropdown(false); }}
              >{p}</div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="gp-footer">
        <button
          className="gp-save-btn"
          onClick={() => onSave && onSave({ gender, pronouns, systemPronoun })}
        >Save</button>
      </div>
    </div>
  );
}

export default GenderPage;
