import React, { useState } from "react";
import { FaTrash } from "react-icons/fa";
import { BsChevronRight, BsCheck2 } from "react-icons/bs";
import "./css/SimpleTextFieldPage.css";

const PRIVACY_OPTIONS = ["Public", "Friends", "Only me"];

function SimpleTextFieldPage({
    title,
    label,
    initialValue = "",
    initialPrivacy = "Public",
    onClose,
    onSave,
}) {
    const [value, setValue] = useState(initialValue);
    const [privacy, setPrivacy] = useState(initialPrivacy);
    const [showPrivacyMenu, setShowPrivacyMenu] = useState(false);

    const changed = value !== initialValue || privacy !== initialPrivacy;

    const handleSave = () => {
        if (!changed) return;
        onSave(value, privacy);
    };

    const handleRemove = () => {
        onSave("", privacy);
    };

    return (
        <div className="stf-overlay" onClick={onClose}>
            <div className="stf-card" onClick={(e) => e.stopPropagation()}>

                <div className="stf-header">
                    <button className="stf-close" onClick={onClose} aria-label="Close">✕</button>
                    <h2>{title}</h2>
                    <BsChevronRight className="stf-header-chevron" />
                </div>

                <div className="stf-body">
                    <div className="stf-input-wrap">
                        <span className="stf-floating-label">{label}</span>
                        <input
                            className="stf-input"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            autoFocus
                        />
                    </div>

                    {value && (
                        <button className="stf-remove-btn" onClick={handleRemove} type="button">
                            <FaTrash /> Remove
                        </button>
                    )}

                    <div className="stf-privacy-section">
                        <button
                            className="stf-privacy-row"
                            onClick={() => setShowPrivacyMenu((v) => !v)}
                            type="button"
                        >
                            <div className="stf-privacy-text">
                                <strong>Who can see this?</strong>
                                <span className="stf-privacy-value">{privacy}</span>
                            </div>
                            <BsChevronRight
                                className={`stf-privacy-chevron ${showPrivacyMenu ? "stf-rotated" : ""}`}
                            />
                        </button>
                        {showPrivacyMenu && (
                            <div className="stf-privacy-options">
                                {PRIVACY_OPTIONS.map((opt) => (
                                    <button
                                        key={opt}
                                        type="button"
                                        className="stf-privacy-option"
                                        onClick={() => {
                                            setPrivacy(opt);
                                            setShowPrivacyMenu(false);
                                        }}
                                    >
                                        <span>{opt}</span>
                                        {privacy === opt && <BsCheck2 />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="stf-footer">
                    <button className="stf-save-btn" onClick={handleSave} disabled={!changed}>
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}

export default SimpleTextFieldPage;