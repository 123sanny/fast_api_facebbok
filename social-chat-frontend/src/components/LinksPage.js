import React, { useState } from "react";
import { BsX, BsChevronRight, BsPencilFill, BsLink45Deg, BsPlusLg, BsTrash } from "react-icons/bs";
import ChooseAudiencePage from "./ChooseAudiencePage";
import "./css/Linkspage.css";

function LinksPage({ onClose, onSave }) {
  const [links, setLinks] = useState([
    "https://www.linkedin.com/in/sanny-tiwari-28945b240/"
  ]);
  const [privacy, setPrivacy] = useState("Public");
  const [showAudience, setShowAudience] = useState(false);

  // Add new link
  const [showAdd, setShowAdd] = useState(false);
  const [newLink, setNewLink] = useState("");

  // Edit existing link
  const [editIdx, setEditIdx] = useState(null);
  const [editValue, setEditValue] = useState("");

  const handleAdd = () => {
    if (newLink.trim()) {
      setLinks(prev => [...prev, newLink.trim()]);
      setNewLink("");
      setShowAdd(false);
    }
  };

  const handleEditOpen = (idx) => {
    setEditIdx(idx);
    setEditValue(links[idx]);
  };

  const handleEditSave = () => {
    if (editValue.trim()) {
      setLinks(prev => prev.map((l, i) => i === editIdx ? editValue.trim() : l));
    }
    setEditIdx(null);
    setEditValue("");
  };

  const handleDelete = (idx) => {
    setLinks(prev => prev.filter((_, i) => i !== idx));
    setEditIdx(null);
  };

  return (
    <>
      <div className="lp-wrapper">

        {/* Header */}
        <div className="lp-header">
          <button className="lp-close" onClick={onClose}><BsX size={28} /></button>
          <h2>Links</h2>
          <div className="lp-header-space" />
        </div>

        {/* Body */}
        <div className="lp-body">

          {/* Add Button */}
          <button className="lp-add-btn" onClick={() => { setShowAdd(!showAdd); setEditIdx(null); }}>
            <BsPlusLg size={15} /> Add
          </button>

          {/* Add URL input */}
          {showAdd && (
            <div className="lp-edit-box">
              <p className="lp-edit-box-label">Add link</p>
              <input
                className="lp-edit-input"
                placeholder="Paste or type a URL"
                value={newLink}
                onChange={e => setNewLink(e.target.value)}
                autoFocus
              />
              <div className="lp-edit-box-actions">
                <button className="lp-cancel-btn" onClick={() => { setShowAdd(false); setNewLink(""); }}>
                  Cancel
                </button>
                <button
                  className={`lp-confirm-btn ${newLink.trim() ? "active" : ""}`}
                  disabled={!newLink.trim()}
                  onClick={handleAdd}
                >
                  Add
                </button>
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="lp-divider" />

          {/* Links List */}
          <div className="lp-list">
            {links.map((link, idx) => (
              <div key={idx}>
                {/* Link Row */}
                <div className="lp-link-row">
                  <BsLink45Deg size={24} className="lp-link-icon" />
                  <p className="lp-link-text">{link}</p>
                  <button className="lp-edit-btn" onClick={() => handleEditOpen(idx)}>
                    <BsPencilFill size={16} />
                  </button>
                </div>

                {/* Inline Edit Box — pencil click ke baad */}
                {editIdx === idx && (
                  <div className="lp-edit-box">
                    <p className="lp-edit-box-label">Edit link</p>
                    <input
                      className="lp-edit-input"
                      value={editValue}
                      onChange={e => setEditValue(e.target.value)}
                      autoFocus
                    />
                    <div className="lp-edit-box-actions">
                      {/* Delete */}
                      <button className="lp-delete-btn" onClick={() => handleDelete(idx)}>
                        <BsTrash size={16} /> Remove
                      </button>
                      <div className="lp-edit-box-right">
                        <button className="lp-cancel-btn" onClick={() => setEditIdx(null)}>
                          Cancel
                        </button>
                        <button
                          className={`lp-confirm-btn ${editValue.trim() ? "active" : ""}`}
                          disabled={!editValue.trim()}
                          onClick={handleEditSave}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>

        {/* Footer */}
        <div className="lp-footer">
          <div className="lp-privacy-row" onClick={() => setShowAudience(true)}>
            <div>
              <p className="lp-privacy-label">Who can see this?</p>
              <p className="lp-privacy-value">{privacy}</p>
            </div>
            <BsChevronRight size={18} className="lp-privacy-arrow" />
          </div>
          <button className="lp-save-btn" onClick={() => onSave && onSave(links, privacy)}>
            Save
          </button>
        </div>

      </div>

      {/* Choose Audience */}
      {showAudience && (
        <ChooseAudiencePage
          initialValue={privacy.toLowerCase().replace(/ /g, "_")}
          onClose={() => setShowAudience(false)}
          onSave={(val) => { setPrivacy(val); setShowAudience(false); }}
        />
      )}
    </>
  );
}

export default LinksPage;