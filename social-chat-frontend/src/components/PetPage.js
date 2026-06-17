import React, { useState } from "react";
import { BsX, BsChevronDown, BsChevronRight } from "react-icons/bs";
import "./css/FamilyMemberPage.css"; // Same CSS reuse karo

const PET_TYPES = [
  "Dog", "Cat", "Bird", "Fish",
  "Rabbit", "Hamster", "Turtle", "Snake",
  "Guinea pig", "Horse", "Other",
];

function PetPage({ onClose, onSave }) {
  const [type, setType] = useState("");
  const [name, setName] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [privacy] = useState("Public");

  const canSave = type.trim() !== "" && name.trim() !== "";

  return (
    <div className="fmp-wrapper">

      {/* Header */}
      <div className="fmp-header">
        <button className="fmp-close" onClick={onClose}>
          <BsX size={26} />
        </button>
        <h2>Pet</h2>
        <div className="fmp-header-space" />
      </div>

      {/* Fields */}
      <div className="fmp-body">

        {/* Type dropdown */}
        <div className="fmp-field" onClick={() => setShowDropdown(!showDropdown)}>
          <span className={type ? "fmp-field-value" : "fmp-placeholder"}>
            {type || "Type"}
          </span>
          <BsChevronDown size={16} className="fmp-field-icon" />
        </div>

        {/* Dropdown list */}
        {showDropdown && (
          <div className="fmp-dropdown">
            {PET_TYPES.map((t) => (
              <div
                key={t}
                className={`fmp-dropdown-item ${type === t ? "selected" : ""}`}
                onClick={() => { setType(t); setShowDropdown(false); }}
              >
                {t}
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
          onClick={() => canSave && onSave({ type, name, privacy })}
        >
          Save
        </button>
      </div>

    </div>
  );
}

export default PetPage;