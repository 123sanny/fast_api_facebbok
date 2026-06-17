import React, { useState } from "react";
import { FaSearch, FaTimes } from "react-icons/fa";
import { BsArrowLeft } from "react-icons/bs";
import "./css/CategoryPage.css";

const POPULAR_CATEGORIES = [
    "Digital creator", "Musician", "Design & fashion", "Chef",
    "Personal blog", "Comedian", "Public figure", "Tech", "Business",
    "Artist", "Photographer", "Dancer", "Sportsperson", "Coach",
    "Author", "Gamer", "Entrepreneur", "Scientist",
];

function CategoryPage({ initialSelected = [], onClose, onSave }) {
    const [selected, setSelected] = useState(initialSelected);
    const [query, setQuery] = useState("");

    const changed =
        selected.length !== initialSelected.length ||
        selected.some((c) => !initialSelected.includes(c));

    const addCategory = (name) => {
        if (!selected.includes(name)) {
            setSelected((prev) => [...prev, name]);
        }
        setQuery("");
    };

    const removeCategory = (name) => {
        setSelected((prev) => prev.filter((c) => c !== name));
    };

    const filteredPopular = POPULAR_CATEGORIES.filter((c) =>
        c.toLowerCase().includes(query.toLowerCase())
    );

    const handleSave = () => {
        if (!changed) return;
        onSave(selected);
    };

    return (
        <div className="catp-overlay" onClick={onClose}>
            <div className="catp-card" onClick={(e) => e.stopPropagation()}>

                <div className="catp-header">
                    <button className="catp-back" onClick={onClose} aria-label="Back">
                        <BsArrowLeft />
                    </button>
                </div>

                <div className="catp-body">
                    <h3 className="catp-title">How would you describe your profile?</h3>
                    <p className="catp-subtitle">
                        Categories can help people find you. Pick a few now or decide later.
                    </p>

                    <div className="catp-input-box">
                        <div className="catp-chips-row">
                            {selected.map((name) => (
                                <span className="catp-chip" key={name}>
                                    {name}
                                    <button
                                        className="catp-chip-remove"
                                        onClick={() => removeCategory(name)}
                                        aria-label={`Remove ${name}`}
                                        type="button"
                                    >
                                        <FaTimes />
                                    </button>
                                </span>
                            ))}
                        </div>
                        <input
                            className="catp-search-input"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search for categories"
                        />
                        <FaSearch className="catp-search-icon" />
                    </div>

                    <h4 className="catp-popular-title">Popular categories</h4>
                    <div className="catp-pills-wrap">
                        {filteredPopular.map((name) => {
                            const active = selected.includes(name);
                            return (
                                <button
                                    key={name}
                                    type="button"
                                    className={`catp-pill ${active ? "catp-pill-active" : ""}`}
                                    onClick={() => (active ? removeCategory(name) : addCategory(name))}
                                >
                                    {name}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="catp-footer">
                    <button className="catp-save-btn" onClick={handleSave} disabled={!changed}>
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CategoryPage;
