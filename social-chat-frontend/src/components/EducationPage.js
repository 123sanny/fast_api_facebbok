import React, { useState } from "react";
import { BsX, BsChevronRight, BsTrash } from "react-icons/bs";
import ChooseAudiencePage from "./ChooseAudiencePage";
import "./css/EditSubPage.css";

function EducationPage({ onClose, onSave }) {
  const [school, setSchool] = useState("Computer Science and Engineering");
  const [privacy, setPrivacy] = useState("Public");
  const [showAudience, setShowAudience] = useState(false);

  return (
    <>
      <div className="esp-wrapper">
        <div className="esp-header">
          <button className="esp-close" onClick={onClose}><BsX size={26} /></button>
          <h2>Education</h2>
          <div className="esp-header-space" />
        </div>

        <div className="esp-body">
          <div className="esp-field">
            <div className="esp-field-inner">
              <label className="esp-field-label">College / University</label>
              <input
                className="esp-field-input"
                placeholder="School or college name"
                value={school}
                onChange={e => setSchool(e.target.value)}
              />
            </div>
            {school && (
              <button className="esp-clear-btn" onClick={() => setSchool("")}>
                <BsX size={18} />
              </button>
            )}
          </div>

          <button className="esp-remove-btn">
            <BsTrash size={16} /> Remove
          </button>
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
            className={`esp-save-btn ${school ? "active" : ""}`}
            disabled={!school}
            onClick={() => onSave && onSave(school, privacy)}
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

export default EducationPage;
