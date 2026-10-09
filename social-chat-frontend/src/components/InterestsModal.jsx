import React, { useState } from "react";
import { BsPlus, BsTrash, BsCheck2 } from "react-icons/bs";
import { FaMusic, FaTv, FaFilm, FaGamepad, FaTshirt } from "react-icons/fa";
import "./css/HobbiesModal.css";

const CATEGORY_CONFIG = {
  music: { title: "Music & Artists", icon: <FaMusic size={18} />, placeholder: "e.g. A.R. Rahman, Coldplay, Taylor Swift" },
  tv: { title: "TV Programmes & Web Series", icon: <FaTv size={18} />, placeholder: "e.g. Stranger Things, Mirzapur, Breaking Bad" },
  films: { title: "Films & Cinema", icon: <FaFilm size={18} />, placeholder: "e.g. Interstellar, Inception, 3 Idiots" },
  games: { title: "Games & Esports", icon: <FaGamepad size={18} />, placeholder: "e.g. Valorant, GTA V, BGMI, Cyberpunk" },
  sports: { title: "Sports Teams & Athletes", icon: <FaTshirt size={18} />, placeholder: "e.g. Real Madrid, CSK, Virat Kohli, Messi" }
};

function InterestsModal({ initialType = "music", initialData = {}, onClose, onSave }) {
  const [activeType, setActiveType] = useState(initialType);
  const [interests, setInterests] = useState(initialData || {});
  const [newItem, setNewItem] = useState("");

  const currentList = interests[activeType] || [];
  const currentConfig = CATEGORY_CONFIG[activeType] || CATEGORY_CONFIG.music;

  const handleAddItem = (e) => {
    e.preventDefault();
    if (newItem.trim()) {
      setInterests(prev => ({
        ...prev,
        [activeType]: [...(prev[activeType] || []), newItem.trim()]
      }));
      setNewItem("");
    }
  };

  const handleRemove = (itemIdx) => {
    setInterests(prev => ({
      ...prev,
      [activeType]: (prev[activeType] || []).filter((_, i) => i !== itemIdx)
    }));
  };

  const handleSave = () => {
    if (onSave) onSave(interests);
    onClose();
  };

  return (
    <div className="hbm-overlay" onClick={onClose}>
      <div className="hbm-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="hbm-header">
          <button className="hbm-close" onClick={onClose}>✕</button>
          <h2>Edit Interests & Favorites</h2>
          <div style={{ width: 24 }} />
        </div>

        {/* Category Selector Tabs */}
        <div style={{
          display: "flex",
          gap: 6,
          padding: "10px 16px",
          overflowX: "auto",
          borderBottom: "1px solid var(--color-border)",
          background: "var(--color-bg)"
        }}>
          {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => setActiveType(key)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                borderRadius: 20,
                border: "none",
                background: activeType === key ? "var(--color-primary)" : "var(--color-surface)",
                color: activeType === key ? "#fff" : "var(--color-text)",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                whiteSpace: "nowrap"
              }}
            >
              {cfg.icon} {key.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="hbm-body">
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 16, fontWeight: 700 }}>
            {currentConfig.icon} {currentConfig.title}
          </div>

          <form onSubmit={handleAddItem} style={{ display: "flex", gap: 8 }}>
            <input
              style={{
                flex: 1,
                padding: "10px 14px",
                borderRadius: 10,
                border: "1px solid var(--color-border)",
                background: "var(--color-bg)",
                color: "var(--color-text)",
                outline: "none",
                fontSize: 14.5
              }}
              placeholder={currentConfig.placeholder}
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              autoFocus
            />
            <button
              type="submit"
              disabled={!newItem.trim()}
              style={{
                padding: "10px 16px",
                borderRadius: 10,
                background: newItem.trim() ? "var(--color-primary)" : "var(--color-bg-hover)",
                color: newItem.trim() ? "#fff" : "var(--color-text-secondary)",
                border: "none",
                cursor: newItem.trim() ? "pointer" : "default",
                fontWeight: 600
              }}
            >
              <BsPlus size={18} /> Add
            </button>
          </form>

          <div>
            <div className="hbm-section-title">Saved Items ({currentList.length})</div>
            {currentList.length === 0 ? (
              <p style={{ color: "var(--color-text-secondary)", fontSize: 14, marginTop: 8 }}>
                No favorites added yet. Add your favorite titles above!
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
                {currentList.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 14px",
                      borderRadius: 10,
                      background: "var(--color-bg)",
                      border: "1px solid var(--color-border)"
                    }}
                  >
                    <span style={{ fontSize: 14.5, fontWeight: 500 }}>{item}</span>
                    <button
                      onClick={() => handleRemove(idx)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--color-danger, #e41e3f)",
                        cursor: "pointer",
                        padding: 4
                      }}
                    >
                      <BsTrash size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="hbm-footer">
          <button className="hbm-save-btn" onClick={handleSave}>
            <BsCheck2 size={18} style={{ marginRight: 6 }} /> Save All Interests
          </button>
        </div>
      </div>
    </div>
  );
}

export default InterestsModal;
