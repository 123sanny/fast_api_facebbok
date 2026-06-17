import React, { useState } from "react";
import { FaGlobe } from "react-icons/fa";
import "./css/BioEditPage.css";

const MAX_BIO_LENGTH = 101;

function BioEditPage({ initialBio = "", onClose, onSave }) {
    const [bio, setBio] = useState(initialBio);

    const handleSave = () => {
        onSave(bio.trim());
    };

    return (
        // backdrop par click -> close (desktop par dialog ke bahar click karne jaisa)
        <div className="bep-overlay" onClick={onClose}>
            <div className="bep-card" onClick={(e) => e.stopPropagation()}>

                {/* ===== HEADER ===== */}
                <div className="bep-header">
                    <button className="bep-close" onClick={onClose} aria-label="Close">
                        ✕
                    </button>
                    <h2>Intro</h2>
                    <div className="bep-header-space"></div>
                </div>

                {/* ===== BODY ===== */}
                <div className="bep-body">
                    <h3 className="bep-label">Add a bio</h3>

                    <div className="bep-input-wrap">
                        <span className="bep-floating-label">Introduce yourself</span>
                        <textarea
                            className="bep-textarea"
                            value={bio}
                            onChange={(e) => setBio(e.target.value.slice(0, MAX_BIO_LENGTH))}
                            autoFocus
                        />
                    </div>

                    <div className="bep-meta">
                        <FaGlobe className="bep-meta-icon" />
                        <span>Public · {bio.length}/{MAX_BIO_LENGTH}</span>
                    </div>
                </div>

                {/* ===== FOOTER ===== */}
                <div className="bep-footer">
                    <button
                        className="bep-save-btn"
                        onClick={handleSave}
                        disabled={bio.trim().length === 0}
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}

export default BioEditPage;