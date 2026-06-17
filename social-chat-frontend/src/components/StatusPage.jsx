import React, { useState } from "react";
import { BsChevronRight, BsCheck2 } from "react-icons/bs";
import "./css/StatusPage.css";

const STATUS_OPTIONS = [
    "Single",
    "In a relationship",
    "Engaged",
    "Married",
    "It's complicated",
    "Separated",
    "Divorced",
    "Widowed",
];

const PRIVACY_OPTIONS = ["Public", "Friends", "Only me"];

function StatusPage({ initialStatus = "", initialPrivacy = "Friends", onClose, onSave }) {
    const [status, setStatus] = useState(initialStatus);
    const [privacy, setPrivacy] = useState(initialPrivacy);
    const [showPrivacyMenu, setShowPrivacyMenu] = useState(false);

    const changed = status !== initialStatus || privacy !== initialPrivacy;
    const canSave = changed && status !== "";

    const handleSave = () => {
        if (!canSave) return;
        onSave(status, privacy);
    };

    return (
        <div className="sts-overlay" onClick={onClose}>
            <div className="sts-card" onClick={(e) => e.stopPropagation()}>

                <div className="sts-header">
                    <button className="sts-close" onClick={onClose} aria-label="Close">✕</button>
                    <h2>Status</h2>
                    <BsChevronRight className="sts-header-chevron" />
                </div>

                <div className="sts-body">
                    <div className="sts-select-wrap">
                        <span className="sts-floating-label">Status</span>
                        <select
                            className="sts-select"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                        >
                            <option value="" disabled hidden></option>
                            {STATUS_OPTIONS.map((opt) => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                    </div>
                    {status === "" && <p className="sts-required">Required</p>}

                    <div className="sts-privacy-section">
                        <button
                            className="sts-privacy-row"
                            onClick={() => setShowPrivacyMenu((v) => !v)}
                            type="button"
                        >
                            <div className="sts-privacy-text">
                                <strong>Who can see this?</strong>
                                <span className="sts-privacy-value">{privacy}</span>
                            </div>
                            <BsChevronRight
                                className={`sts-privacy-chevron ${showPrivacyMenu ? "sts-rotated" : ""}`}
                            />
                        </button>
                        {showPrivacyMenu && (
                            <div className="sts-privacy-options">
                                {PRIVACY_OPTIONS.map((opt) => (
                                    <button
                                        key={opt}
                                        type="button"
                                        className="sts-privacy-option"
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

                <div className="sts-footer">
                    <button className="sts-save-btn" onClick={handleSave} disabled={!canSave}>
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}

export default StatusPage;