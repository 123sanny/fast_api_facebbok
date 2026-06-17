import React, { useState } from "react";
import { FaFolder, FaMapMarkerAlt, FaGraduationCap, FaGlobe } from "react-icons/fa";
import "./css/PinnedDetailsPage.css";

// Yahan jo bhi "pin karne layak" details hai unki list - EditProfile.jsx
// ke PINNED_LABELS se ids match hone chahiye
const AVAILABLE_DETAILS = [
    { id: "category", icon: FaFolder, label: "Digital creator", privacy: "Public" },
    { id: "city", icon: FaMapMarkerAlt, label: "Delhi", privacy: "Public" },
    { id: "education", icon: FaGraduationCap, label: "Computer Science and Engineering", privacy: "Public" },
];

const MAX_PINNED = 5;

function PinnedDetailsPage({ initialSelected = [], onClose, onSave }) {
    const [selected, setSelected] = useState(initialSelected);

    const toggle = (id) => {
        setSelected((prev) => {
            if (prev.includes(id)) return prev.filter((x) => x !== id);
            if (prev.length >= MAX_PINNED) return prev; // 5 se zyada select nahi hone dena
            return [...prev, id];
        });
    };

    const handleSave = () => {
        onSave(selected);
    };

    return (
        <div className="pdp-overlay" onClick={onClose}>
            <div className="pdp-card" onClick={(e) => e.stopPropagation()}>

                <div className="pdp-header">
                    <button className="pdp-close" onClick={onClose} aria-label="Close">✕</button>
                    <h2>Intro</h2>
                    <div className="pdp-header-space"></div>
                </div>

                <div className="pdp-body">
                    <h3 className="pdp-title">Pinned details</h3>
                    <p className="pdp-subtitle">
                        Select up to five details to also show at the top of your profile.
                        Details will be visible based on audience settings.
                    </p>

                    <div className="pdp-list">
                        {AVAILABLE_DETAILS.map((item) => {
                            const Icon = item.icon;
                            const checked = selected.includes(item.id);
                            return (
                                <label key={item.id} className="pdp-row">
                                    <span className="pdp-row-icon"><Icon /></span>
                                    <div className="pdp-row-text">
                                        <span className="pdp-row-label">{item.label}</span>
                                        <span className="pdp-row-privacy">
                                            <FaGlobe className="pdp-inline-icon" /> {item.privacy}
                                        </span>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={checked}
                                        onChange={() => toggle(item.id)}
                                        className="pdp-checkbox-native"
                                    />
                                    <span className={`pdp-checkbox ${checked ? "pdp-checkbox-checked" : ""}`}>
                                        {checked && "✓"}
                                    </span>
                                </label>
                            );
                        })}
                    </div>
                </div>

                <div className="pdp-footer">
                    <button className="pdp-save-btn" onClick={handleSave}>
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}

export default PinnedDetailsPage;
