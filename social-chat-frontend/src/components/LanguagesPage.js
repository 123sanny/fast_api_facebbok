import React, { useState } from "react";
import { BsX, BsChevronRight, BsTrash } from "react-icons/bs";
import "./css/EditSubPage.css";

function LanguagesPage({ initialValue = "English, Hindi", onClose, onSave }) {
  const [value, setValue] = useState(initialValue);
  const [privacy, setPrivacy] = useState("Friends");

  return (
    <div className="esp-wrapper">
      {/* Header */}
      <div className="esp-header">
        <button className="esp-close" onClick={onClose}><BsX size={26} /></button>
        <h2>Languages</h2>
        <div className="esp-header-space" />
      </div>

      <div className="esp-body">
        {/* Language field with clear btn */}
        <div className="esp-field">
          <div className="esp-field-inner">
            <label className="esp-field-label">Languages</label>
            <input
              className="esp-field-input"
              value={value}
              onChange={e => setValue(e.target.value)}
            />
          </div>
          {value.length > 0 && (
            <button className="esp-clear-btn" onClick={() => setValue("")}>
              <BsX size={18} />
            </button>
          )}
        </div>

        {/* Remove button */}
        <button className="esp-remove-btn">
          <BsTrash size={16} /> Remove
        </button>
      </div>

      {/* Footer */}
      <div className="esp-footer">
        <div className="esp-privacy-row">
          <div>
            <p className="esp-privacy-label">Who can see this?</p>
            <p className="esp-privacy-value">{privacy}</p>
          </div>
          <BsChevronRight size={18} />
        </div>
        <button
          className={`esp-save-btn ${value ? "active" : ""}`}
          disabled={!value}
          onClick={() => onSave && onSave(value, privacy)}
        >Save</button>
      </div>
    </div>
  );
}

export default LanguagesPage;
