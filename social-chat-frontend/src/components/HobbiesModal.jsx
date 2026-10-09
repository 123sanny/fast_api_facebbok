import React, { useState } from "react";
import { BsSearch, BsCheck2, BsPlus } from "react-icons/bs";
import "./css/HobbiesModal.css";

const POPULAR_HOBBIES = [
  "📸 Photography", "✈️ Traveling", "💻 Coding", "🎮 Gaming",
  "🎵 Music Production", "🍳 Cooking", "📚 Reading", "💪 Fitness & Gym",
  "🎨 Digital Art", "🎬 Filmmaking", "🚴 Cycling", "✍️ Creative Writing",
  "🌱 Gardening", "💃 Dancing", "🧘 Yoga & Meditation", "🎸 Playing Guitar",
  "⚽ Football", "🏏 Cricket", "🔭 Astronomy", "☕ Specialty Coffee"
];

function HobbiesModal({ initialSelected = ["💻 Coding", "📸 Photography", "🎵 Music Production"], onClose, onSave }) {
  const [selected, setSelected] = useState(initialSelected);
  const [search, setSearch] = useState("");
  const [customHobby, setCustomHobby] = useState("");

  const filtered = POPULAR_HOBBIES.filter(h =>
    h.toLowerCase().includes(search.toLowerCase())
  );

  const toggleHobby = (hobby) => {
    setSelected(prev =>
      prev.includes(hobby) ? prev.filter(h => h !== hobby) : [...prev, hobby]
    );
  };

  const handleAddCustom = (e) => {
    e.preventDefault();
    if (customHobby.trim()) {
      const formatted = `⭐ ${customHobby.trim()}`;
      if (!selected.includes(formatted)) {
        setSelected(prev => [...prev, formatted]);
      }
      setCustomHobby("");
    }
  };

  const handleSave = () => {
    if (onSave) onSave(selected);
    onClose();
  };

  return (
    <div className="hbm-overlay" onClick={onClose}>
      <div className="hbm-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="hbm-header">
          <button className="hbm-close" onClick={onClose}>✕</button>
          <h2>Edit Hobbies</h2>
          <div style={{ width: 24 }} />
        </div>

        {/* Body */}
        <div className="hbm-body">
          <div className="hbm-search">
            <BsSearch size={15} color="var(--color-icon)" />
            <input
              placeholder="Search hobbies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Add custom hobby */}
          <form onSubmit={handleAddCustom} style={{ display: "flex", gap: 8 }}>
            <input
              style={{
                flex: 1,
                padding: "8px 12px",
                borderRadius: 10,
                border: "1px solid var(--color-border)",
                background: "var(--color-bg)",
                color: "var(--color-text)",
                outline: "none"
              }}
              placeholder="Add custom hobby..."
              value={customHobby}
              onChange={(e) => setCustomHobby(e.target.value)}
            />
            <button
              type="submit"
              disabled={!customHobby.trim()}
              style={{
                padding: "8px 14px",
                borderRadius: 10,
                background: customHobby.trim() ? "var(--color-primary)" : "var(--color-bg-hover)",
                color: customHobby.trim() ? "#fff" : "var(--color-text-secondary)",
                border: "none",
                cursor: customHobby.trim() ? "pointer" : "default",
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontWeight: 600
              }}
            >
              <BsPlus size={18} /> Add
            </button>
          </form>

          <div>
            <div className="hbm-section-title">Selected ({selected.length})</div>
            <div className="hbm-chips" style={{ marginTop: 8 }}>
              {selected.map(h => (
                <div key={h} className="hbm-chip selected" onClick={() => toggleHobby(h)}>
                  <BsCheck2 size={16} /> {h}
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="hbm-section-title">Suggested Hobbies</div>
            <div className="hbm-chips" style={{ marginTop: 8 }}>
              {filtered.map(h => {
                const isSel = selected.includes(h);
                if (isSel) return null;
                return (
                  <div key={h} className="hbm-chip" onClick={() => toggleHobby(h)}>
                    {h}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="hbm-footer">
          <button className="hbm-save-btn" onClick={handleSave}>
            Save Hobbies ({selected.length})
          </button>
        </div>
      </div>
    </div>
  );
}

export default HobbiesModal;
