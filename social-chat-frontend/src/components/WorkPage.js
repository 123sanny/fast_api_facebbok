import React, { useState } from "react";
import { BsX, BsChevronRight, BsTrash } from "react-icons/bs";
import ChooseAudiencePage from "./ChooseAudiencePage";
import "./css/EditSubPage.css";

function WorkPage({ onClose, onSave }) {
  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");
  const [privacy, setPrivacy] = useState("Public");
  const [showAudience, setShowAudience] = useState(false);

  const canSave = company.trim() !== "";

  return (
    <>
      <div className="esp-wrapper">
        <div className="esp-header">
          <button className="esp-close" onClick={onClose}><BsX size={26} /></button>
          <h2>Work experience</h2>
          <div className="esp-header-space" />
        </div>

        <div className="esp-body">
          <div className="esp-field" style={{ marginBottom: 12 }}>
            <div className="esp-field-inner">
              <label className="esp-field-label">Company</label>
              <input
                className="esp-field-input"
                placeholder="Company name"
                value={company}
                onChange={e => setCompany(e.target.value)}
                autoFocus
              />
            </div>
            {company && (
              <button className="esp-clear-btn" onClick={() => setCompany("")}>
                <BsX size={18} />
              </button>
            )}
          </div>

          <div className="esp-field">
            <div className="esp-field-inner">
              <label className="esp-field-label">Position</label>
              <input
                className="esp-field-input"
                placeholder="Your role / position"
                value={position}
                onChange={e => setPosition(e.target.value)}
              />
            </div>
            {position && (
              <button className="esp-clear-btn" onClick={() => setPosition("")}>
                <BsX size={18} />
              </button>
            )}
          </div>
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
            className={`esp-save-btn ${canSave ? "active" : ""}`}
            disabled={!canSave}
            onClick={() => onSave && onSave({ company, position, privacy })}
          >Save</button>
        </div>
      </div>

      {showAudience && (
        <ChooseAudiencePage
          initialValue="public"
          onClose={() => setShowAudience(false)}
          onSave={(val) => { setPrivacy(val); setShowAudience(false); }}
        />
      )}
    </>
  );
}

export default WorkPage;
