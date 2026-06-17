import React, { useState } from "react";
import "./css/AiCreatorPage.css";

function AiCreatorPage({ initialValue = "No", onClose, onSave }) {
    const [value, setValue] = useState(initialValue);
    const changed = value !== initialValue;

    const handleSave = () => {
        if (!changed) return;
        onSave(value);
    };

    return (
        <div className="acp-overlay" onClick={onClose}>
            <div className="acp-card" onClick={(e) => e.stopPropagation()}>

                <div className="acp-header">
                    <button className="acp-close" onClick={onClose} aria-label="Close">✕</button>
                    <h2>AI creator</h2>
                    <div className="acp-header-space"></div>
                </div>

                <div className="acp-body">
                    <p className="acp-question">
                        Does this profile regularly share AI-generated content?{" "}
                        <a href="#" className="acp-learn-more" onClick={(e) => e.preventDefault()}>
                            Learn more
                        </a>
                    </p>

                    <label className="acp-option">
                        <span>Yes</span>
                        <input
                            type="radio"
                            name="ai-creator"
                            checked={value === "Yes"}
                            onChange={() => setValue("Yes")}
                        />
                    </label>
                    <label className="acp-option">
                        <span>No</span>
                        <input
                            type="radio"
                            name="ai-creator"
                            checked={value === "No"}
                            onChange={() => setValue("No")}
                        />
                    </label>
                </div>

                <div className="acp-footer">
                    <button className="acp-save-btn" onClick={handleSave} disabled={!changed}>
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AiCreatorPage;
