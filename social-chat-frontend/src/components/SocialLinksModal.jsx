import React, { useState } from "react";
import { BsCheck2 } from "react-icons/bs";
import { FaInstagram, FaTwitter, FaYoutube, FaGithub, FaTiktok, FaDiscord, FaTelegram, FaLinkedin } from "react-icons/fa";
import "./css/HobbiesModal.css";

const PLATFORMS = [
  { key: "instagram", name: "Instagram", icon: <FaInstagram size={18} color="#E1306C" />, prefix: "instagram.com/" },
  { key: "twitter", name: "X (Twitter)", icon: <FaTwitter size={18} color="#1DA1F2" />, prefix: "x.com/" },
  { key: "youtube", name: "YouTube", icon: <FaYoutube size={18} color="#FF0000" />, prefix: "youtube.com/@" },
  { key: "github", name: "GitHub", icon: <FaGithub size={18} />, prefix: "github.com/" },
  { key: "linkedin", name: "LinkedIn", icon: <FaLinkedin size={18} color="#0A66C2" />, prefix: "linkedin.com/in/" },
  { key: "discord", name: "Discord", icon: <FaDiscord size={18} color="#5865F2" />, prefix: "discord.gg/" },
  { key: "telegram", name: "Telegram", icon: <FaTelegram size={18} color="#0088cc" />, prefix: "t.me/" },
  { key: "tiktok", name: "TikTok", icon: <FaTiktok size={18} />, prefix: "tiktok.com/@" },
];

function SocialLinksModal({ initialSocials = {}, onClose, onSave }) {
  const [socials, setSocials] = useState(initialSocials || {});

  const handleChange = (key, val) => {
    setSocials(prev => ({
      ...prev,
      [key]: val
    }));
  };

  const handleSave = () => {
    if (onSave) onSave(socials);
    onClose();
  };

  return (
    <div className="hbm-overlay" onClick={onClose}>
      <div className="hbm-card" onClick={(e) => e.stopPropagation()}>
        <div className="hbm-header">
          <button className="hbm-close" onClick={onClose}>✕</button>
          <h2>Social Media Handles</h2>
          <div style={{ width: 24 }} />
        </div>

        <div className="hbm-body">
          <p style={{ margin: 0, fontSize: 13.5, color: "var(--color-text-secondary)" }}>
            Connect your public social profiles to build your creator identity and social graph across Nexoria.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {PLATFORMS.map(p => (
              <div
                key={p.key}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 14px",
                  borderRadius: 12,
                  background: "var(--color-bg)",
                  border: "1px solid var(--color-border)"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", width: 26, justifyContent: "center" }}>
                  {p.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--color-text-secondary)", textTransform: "uppercase" }}>
                    {p.name}
                  </div>
                  <input
                    style={{
                      width: "100%",
                      border: "none",
                      outline: "none",
                      background: "transparent",
                      color: "var(--color-text)",
                      fontSize: 14.5,
                      fontWeight: 500,
                      marginTop: 2
                    }}
                    placeholder={`Your ${p.name} username or link`}
                    value={socials[p.key] || ""}
                    onChange={(e) => handleChange(p.key, e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="hbm-footer">
          <button className="hbm-save-btn" onClick={handleSave}>
            <BsCheck2 size={18} style={{ marginRight: 6 }} /> Save Social Profiles
          </button>
        </div>
      </div>
    </div>
  );
}

export default SocialLinksModal;
