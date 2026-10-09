import React, { useState } from "react";
import { 
  BsX, BsPlus, 
  BsCheckCircleFill, BsEyeSlashFill
} from "react-icons/bs";
import "./css/KeywordFilterModal.css";

const PRESET_TOPICS = [
  { id: "politics", label: "Political Toxicity & Debates", keywords: ["politics", "election", "politician", "scandal"] },
  { id: "spoilers", label: "Movie & Sports Spoilers", keywords: ["spoiler", "ending", "leaked", "match result"] },
  { id: "crypto", label: "Crypto & Get-Rich Spam", keywords: ["crypto", "nft", "airdrop", "guaranteed profit", "telegram signal"] },
  { id: "ragebait", label: "Ragebait & Negativity", keywords: ["shocking", "exposed", "furious", "ruined"] }
];

function KeywordFilterModal({ 
  activeKeywords = [], 
  onSaveKeywords, 
  onClose,
  filteredCount = 0
}) {
  const [keywordsList, setKeywordsList] = useState(activeKeywords);
  const [newKeywordInput, setNewKeywordInput] = useState("");

  const handleAddKeyword = (e) => {
    e?.preventDefault();
    const clean = newKeywordInput.trim().toLowerCase();
    if (!clean || keywordsList.includes(clean)) return;
    setKeywordsList(prev => [...prev, clean]);
    setNewKeywordInput("");
  };

  const handleRemoveKeyword = (kw) => {
    setKeywordsList(prev => prev.filter(k => k !== kw));
  };

  const handleTogglePreset = (preset) => {
    const allIncluded = preset.keywords.every(k => keywordsList.includes(k));
    if (allIncluded) {
      setKeywordsList(prev => prev.filter(k => !preset.keywords.includes(k)));
    } else {
      const newItems = preset.keywords.filter(k => !keywordsList.includes(k));
      setKeywordsList(prev => [...prev, ...newItems]);
    }
  };

  const handleSave = () => {
    if (onSaveKeywords) {
      onSaveKeywords(keywordsList);
    }
    onClose();
  };

  return (
    <div className="kw-modal-overlay" onClick={onClose}>
      <div className="kw-modal-dialog shadow-lg" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="kw-modal-header">
          <div className="kw-header-title">
            <span className="kw-shield-icon">🛡️</span>
            <div>
              <h4>Smart Content & Keyword Filtering</h4>
              <span className="kw-header-desc">Clean your feed from unwanted topics and spoilers</span>
            </div>
          </div>
          <button className="kw-close-btn" onClick={onClose} aria-label="Close">
            <BsX size={26} />
          </button>
        </div>

        <div className="kw-modal-body">
          
          {/* Active Filter Metrics */}
          <div className="kw-status-ribbon">
            <div className="kw-status-left">
              <BsEyeSlashFill className="text-warning me-2" />
              <span><strong>{filteredCount} Posts</strong> currently muted from your feed</span>
            </div>
            <span className="kw-shield-badge">Shield Active</span>
          </div>

          {/* Quick Preset Topics */}
          <div className="kw-section">
            <label className="kw-label">Quick One-Click Topic Mutes</label>
            <div className="kw-presets-grid">
              {PRESET_TOPICS.map((preset) => {
                const isActive = preset.keywords.every(k => keywordsList.includes(k));
                return (
                  <button
                    key={preset.id}
                    type="button"
                    className={`kw-preset-pill ${isActive ? "active" : ""}`}
                    onClick={() => handleTogglePreset(preset)}
                  >
                    <span>{preset.label}</span>
                    {isActive ? <BsCheckCircleFill className="text-primary ms-1" /> : <BsPlus size={16} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Keyword Input */}
          <div className="kw-section">
            <label className="kw-label">Add Specific Words or Hashtags</label>
            <form onSubmit={handleAddKeyword} className="kw-input-row">
              <input
                type="text"
                placeholder="e.g. #election, drama, crypto, spoiler..."
                value={newKeywordInput}
                onChange={(e) => setNewKeywordInput(e.target.value)}
                className="kw-custom-input"
              />
              <button type="submit" className="kw-add-btn" disabled={!newKeywordInput.trim()}>
                <BsPlus size={20} /> Add
              </button>
            </form>
          </div>

          {/* Active Muted Keywords Chips */}
          <div className="kw-section">
            <label className="kw-label">
              Currently Blocked Keywords ({keywordsList.length})
            </label>
            {keywordsList.length > 0 ? (
              <div className="kw-chips-wrap">
                {keywordsList.map((kw) => (
                  <span key={kw} className="kw-chip">
                    <span>{kw}</span>
                    <button 
                      type="button" 
                      onClick={() => handleRemoveKeyword(kw)} 
                      className="kw-chip-remove"
                      aria-label="Remove keyword"
                    >
                      <BsX size={16} />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="kw-empty-msg">No custom keywords blocked yet. All feed topics will appear normally.</p>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="kw-modal-footer">
          <button 
            type="button" 
            className="btn btn-outline-secondary rounded-pill px-3"
            onClick={() => setKeywordsList([])}
          >
            Clear All
          </button>
          <button 
            type="button" 
            className="btn btn-primary rounded-pill px-4"
            onClick={handleSave}
          >
            Save & Update Feed
          </button>
        </div>

      </div>
    </div>
  );
}

export default KeywordFilterModal;
