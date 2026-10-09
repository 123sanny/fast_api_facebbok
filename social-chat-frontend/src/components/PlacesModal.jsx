import React, { useState } from "react";
import { BsGeoAlt, BsPlus, BsTrash, BsGlobe } from "react-icons/bs";
import "./css/HobbiesModal.css";

const POPULAR_DESTINATIONS = [
  "🏖️ Goa, India", "🏔️ Manali, Himachal", "🏰 Jaipur, Rajasthan",
  "🌆 Mumbai, Maharashtra", "🕌 Varanasi, UP", "🗼 Paris, France",
  "🏙️ Dubai, UAE", "⛩️ Tokyo, Japan", "🏝️ Bali, Indonesia",
  "🗽 New York, USA", "🏔️ Leh Ladakh, India", "🌲 Munnar, Kerala"
];

function PlacesModal({ initialPlaces = ["Delhi, India", "Deoria, UP", "Varanasi, UP"], onClose, onSave }) {
  const [places, setPlaces] = useState(initialPlaces);
  const [newPlace, setNewPlace] = useState("");
  const [privacy, setPrivacy] = useState("Public");

  const handleAdd = (place) => {
    const text = place || newPlace;
    if (text.trim() && !places.includes(text.trim())) {
      setPlaces(prev => [...prev, text.trim()]);
      setNewPlace("");
    }
  };

  const handleRemove = (idx) => {
    setPlaces(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSave = () => {
    if (onSave) onSave(places, privacy);
    onClose();
  };

  return (
    <div className="hbm-overlay" onClick={onClose}>
      <div className="hbm-card" onClick={(e) => e.stopPropagation()}>
        <div className="hbm-header">
          <button className="hbm-close" onClick={onClose}>✕</button>
          <h2>Travel & Visited Places</h2>
          <div style={{ width: 24 }} />
        </div>

        <div className="hbm-body">
          <form onSubmit={(e) => { e.preventDefault(); handleAdd(); }} style={{ display: "flex", gap: 8 }}>
            <div style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid var(--color-border)",
              background: "var(--color-bg)"
            }}>
              <BsGeoAlt size={18} color="var(--color-primary)" />
              <input
                style={{
                  flex: 1,
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  color: "var(--color-text)",
                  fontSize: 14.5
                }}
                placeholder="Add a city, country, or landmark..."
                value={newPlace}
                onChange={(e) => setNewPlace(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={!newPlace.trim()}
              style={{
                padding: "10px 16px",
                borderRadius: 10,
                background: newPlace.trim() ? "var(--color-primary)" : "var(--color-bg-hover)",
                color: newPlace.trim() ? "#fff" : "var(--color-text-secondary)",
                border: "none",
                cursor: newPlace.trim() ? "pointer" : "default",
                fontWeight: 600
              }}
            >
              <BsPlus size={18} /> Add
            </button>
          </form>

          {/* Privacy Switcher */}
          <div
            onClick={() => setPrivacy(p => p === "Public" ? "Friends" : p === "Friends" ? "Only me" : "Public")}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 14px",
              borderRadius: 10,
              background: "var(--color-bg)",
              cursor: "pointer"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <BsGlobe size={16} color="var(--color-icon)" />
              <span style={{ fontSize: 14, fontWeight: 600 }}>Who can see visited places?</span>
            </div>
            <span style={{ fontSize: 13, color: "var(--color-primary)", fontWeight: 700 }}>{privacy}</span>
          </div>

          <div>
            <div className="hbm-section-title">Your Places ({places.length})</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
              {places.map((p, idx) => (
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
                  <span style={{ fontSize: 14.5, fontWeight: 500 }}>📍 {p}</span>
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
          </div>

          <div>
            <div className="hbm-section-title">Popular Destinations</div>
            <div className="hbm-chips" style={{ marginTop: 8 }}>
              {POPULAR_DESTINATIONS.map(dest => (
                <div key={dest} className="hbm-chip" onClick={() => handleAdd(dest)}>
                  {dest}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="hbm-footer">
          <button className="hbm-save-btn" onClick={handleSave}>
            Save Places ({places.length})
          </button>
        </div>
      </div>
    </div>
  );
}

export default PlacesModal;
