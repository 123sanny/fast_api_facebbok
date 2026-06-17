import React, { useState } from "react";
import { BsX, BsChevronDown, BsChevronRight } from "react-icons/bs";
import "./css/FamilyMemberPage.css";

const RELATIONSHIPS = [
  "Mother", "Father", "Sister", "Brother",
  "Daughter", "Son", "Aunt", "Uncle",
  "Niece", "Nephew", "Cousin", "Grandmother",
  "Grandfather", "Spouse / Partner",
];

function FamilyMemberPage({ onClose, onSave }) {
  const [relationship, setRelationship] = useState("");
  const [name, setName] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [privacy] = useState("Public");

  const canSave = relationship.trim() !== "" && name.trim() !== "";

  return (
    <div className="fmp-wrapper">

      {/* Header */}
      <div className="fmp-header">
        <button className="fmp-close" onClick={onClose}>
          <BsX size={26} />
        </button>
        <h2>Family member</h2>
        <div className="fmp-header-space" />
      </div>

      {/* Fields */}
      <div className="fmp-body">

        {/* Relationship dropdown */}
        <div className="fmp-field" onClick={() => setShowDropdown(!showDropdown)}>
          <span className={relationship ? "fmp-field-value" : "fmp-placeholder"}>
            {relationship || "Relationship"}
          </span>
          <BsChevronDown size={16} className="fmp-field-icon" />
        </div>

        {/* Dropdown list */}
        {showDropdown && (
          <div className="fmp-dropdown">
            {RELATIONSHIPS.map((rel) => (
              <div
                key={rel}
                className={`fmp-dropdown-item ${relationship === rel ? "selected" : ""}`}
                onClick={() => { setRelationship(rel); setShowDropdown(false); }}
              >
                {rel}
              </div>
            ))}
          </div>
        )}

        {/* Name field */}
        <div className="fmp-field fmp-name-field">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="fmp-input"
          />
        </div>

      </div>

      {/* Footer */}
      <div className="fmp-footer">
        <div className="fmp-privacy-row">
          <div>
            <p className="fmp-privacy-label">Who can see this?</p>
            <p className="fmp-privacy-value">{privacy}</p>
          </div>
          <BsChevronRight size={18} className="fmp-privacy-arrow" />
        </div>

        <button
          className={`fmp-save-btn ${canSave ? "active" : ""}`}
          disabled={!canSave}
          onClick={() => canSave && onSave({ relationship, name, privacy })}
        >
          Save
        </button>
      </div>

    </div>
  );
}

export default FamilyMemberPage;