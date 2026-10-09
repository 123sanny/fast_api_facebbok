import React, { useState } from "react";
import { BsShieldCheck, BsCheck2 } from "react-icons/bs";
import { FaAward, FaCrown, FaCheckCircle, FaRobot, FaHeart } from "react-icons/fa";
import "./css/HobbiesModal.css";

const AVAILABLE_BADGES = [
  { id: "verified_id", title: "Govt ID / Aadhaar Verified", desc: "Identity verified for zero fake profiles and safe community trading.", icon: <BsShieldCheck size={22} color="#1877f2" />, active: true },
  { id: "pioneer", title: "Nexoria Pioneer Creator", desc: "Founding member badge with 90% creator revenue share status.", icon: <FaCrown size={22} color="#F59E0B" />, active: true },
  { id: "e2e_guard", title: "TruthGuard & E2E Security Shield", desc: "End-to-End encrypted messenger & zero data selling pledge verified.", icon: <FaCheckCircle size={22} color="#10B981" />, active: true },
  { id: "top_contributor", title: "Top Community Voice", desc: "Awarded weekly for helpful, non-toxic discussions.", icon: <FaAward size={22} color="#8B5CF6" />, active: true },
  { id: "zen_mind", title: "Zen Focus & Healthy Screen Time", desc: "Maintains balanced usage and anti-doomscroll habits.", icon: <FaHeart size={22} color="#EC4899" />, active: false },
  { id: "ai_innovator", title: "AI Prompt Crafter", desc: "Published high-impact multimodal AI creations.", icon: <FaRobot size={22} color="#06B6D4" />, active: false }
];

function BadgesModal({ initialBadges = ["verified_id", "pioneer", "e2e_guard", "top_contributor"], onClose, onSave }) {
  const [activeBadgeIds, setActiveBadgeIds] = useState(initialBadges);

  const toggleBadge = (id) => {
    setActiveBadgeIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    if (onSave) onSave(activeBadgeIds);
    onClose();
  };

  return (
    <div className="hbm-overlay" onClick={onClose}>
      <div className="hbm-card" onClick={(e) => e.stopPropagation()}>
        <div className="hbm-header">
          <button className="hbm-close" onClick={onClose}>✕</button>
          <h2>Profile & Trust Badges</h2>
          <div style={{ width: 24 }} />
        </div>

        <div className="hbm-body">
          <p style={{ margin: 0, fontSize: 13.5, color: "var(--color-text-secondary)" }}>
            Earn and showcase verified credentials, community achievements, and security trust badges on your profile.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {AVAILABLE_BADGES.map(b => {
              const isEnabled = activeBadgeIds.includes(b.id);
              return (
                <div
                  key={b.id}
                  onClick={() => toggleBadge(b.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 14px",
                    borderRadius: 12,
                    background: isEnabled ? "rgba(24, 119, 242, 0.08)" : "var(--color-bg)",
                    border: `1.5px solid ${isEnabled ? "var(--color-primary)" : "var(--color-border)"}`,
                    cursor: "pointer",
                    transition: "all 0.15s"
                  }}
                >
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    background: "var(--color-surface)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
                    flexShrink: 0
                  }}>
                    {b.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14.5, fontWeight: 700, color: "var(--color-text)" }}>
                      {b.title}
                    </div>
                    <div style={{ fontSize: 12.5, color: "var(--color-text-secondary)", marginTop: 2 }}>
                      {b.desc}
                    </div>
                  </div>
                  <div style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    border: `2px solid ${isEnabled ? "var(--color-primary)" : "var(--color-border)"}`,
                    background: isEnabled ? "var(--color-primary)" : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: 13,
                    flexShrink: 0
                  }}>
                    {isEnabled && <BsCheck2 size={16} />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="hbm-footer">
          <button className="hbm-save-btn" onClick={handleSave}>
            Save Active Badges ({activeBadgeIds.length})
          </button>
        </div>
      </div>
    </div>
  );
}

export default BadgesModal;
