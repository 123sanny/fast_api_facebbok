import React, { useState } from "react";
import { BsX, BsChevronRight } from "react-icons/bs";
import ChooseAudiencePage from "./ChooseAudiencePage";
import "./css/EditSubPage.css";

function MediaKitPage({ onClose, onSave }) {
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [privacy, setPrivacy] = useState("Public");
  const [showAudience, setShowAudience] = useState(false);

  const canSave = link.trim() !== "";

  return (
    <>
      <div className="esp-wrapper">

        {/* Header */}
        <div className="esp-header">
          <button className="esp-close" onClick={onClose}><BsX size={26} /></button>
          <h2>Media kit</h2>
          <div className="esp-header-space" />
        </div>

        {/* Body */}
        <div className="esp-body" style={{ background: "#fff" }}>

          {/* Link title */}
          <div className="esp-field" style={{ marginBottom: 12 }}>
            <div className="esp-field-inner">
              <input
                className="esp-field-input"
                placeholder="Link title"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </div>
          </div>

          {/* Link (required) */}
          <div className="esp-field">
            <div className="esp-field-inner">
              <input
                className="esp-field-input"
                placeholder="Link"
                value={link}
                onChange={e => setLink(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          {/* Required hint */}
          <p className="mkt-required-hint">Required</p>

        </div>

        {/* Footer */}
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
            onClick={() => canSave && onSave && onSave({ title, link, privacy })}
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

export default MediaKitPage;
