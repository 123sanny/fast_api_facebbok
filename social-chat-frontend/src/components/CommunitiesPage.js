import React, { useState } from "react";
import { BsArrowLeft, BsSearch, BsX, BsCheck } from "react-icons/bs";
import "./css/CommunitiesPage.css";

const GROUPS = [
  { id: 1, name: "General Knowledge & News", type: "Public group", members: "904K members", added: "Added by Varsha Maurya", img: "https://picsum.photos/seed/g1/60/60" },
  { id: 2, name: "◆follow to followers group◆", type: "Public group", members: "116K members", added: "Added by AS Yadav Ji and Jakir Ansari", img: null },
  { id: 3, name: "Deep Side ``)", type: "Public group", members: "979 members", added: null, img: "https://picsum.photos/seed/g3/60/60" },
  { id: 4, name: "Tech Innovators & Developers", type: "Public group", members: "450K members", added: null, img: "https://picsum.photos/seed/g4/60/60" },
  { id: 5, name: "Nexoria Pioneers Community", type: "Public group", members: "107K members", added: "Official Group", img: "https://picsum.photos/seed/g5/60/60" },
  { id: 6, name: "Anilkumar", type: "Public group", members: "53 members", added: null, img: null },
  { id: 7, name: "HTML, CSS & JavaScript Masters", type: "Public group", members: "418K members", added: null, img: "https://picsum.photos/seed/g8/60/60" },
  { id: 8, name: "Creator Studio & Micro-Tipping Lounge", type: "Public group", members: "24K members", added: null, img: null },
  { id: 9, name: "Delhi Local Hub & Meetups", type: "Public group", members: "1.2M members", added: null, img: "https://picsum.photos/seed/g10/60/60" },
];

function CommunitiesPage({ initialSelected = [1, 5], onClose, onSave }) {
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState(initialSelected);

  const filtered = GROUPS.filter(g =>
    g.name.toLowerCase().includes(query.toLowerCase())
  );

  const toggleGroup = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    const selectedGroups = GROUPS.filter(g => selectedIds.includes(g.id));
    if (onSave) onSave(selectedGroups);
    onClose();
  };

  return (
    <div className="cp-wrapper">
      {/* Header */}
      <div className="cp-header">
        <button className="cp-back" onClick={onClose}><BsArrowLeft size={22} /></button>
        <h2 style={{ fontSize: 18, margin: 0, fontWeight: 700 }}>Communities</h2>
        <div style={{ width: 38 }} />
      </div>

      <div className="cp-body">
        <h2 className="cp-title">Add your favourite groups & communities</h2>

        {/* Search */}
        <div className="cp-search-bar">
          <BsSearch size={16} className="cp-search-icon" />
          <input
            className="cp-search-input"
            placeholder="Search your groups"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          {query && (
            <button className="cp-search-clear" onClick={() => setQuery("")}>
              <BsX size={18} />
            </button>
          )}
        </div>

        {/* Groups List */}
        <div className="cp-list">
          {filtered.map(group => {
            const isSel = selectedIds.includes(group.id);
            return (
              <div
                key={group.id}
                className={`cp-group-row ${isSel ? "selected" : ""}`}
                onClick={() => toggleGroup(group.id)}
              >
                <div className="cp-group-img">
                  {group.img ? (
                    <img src={group.img} alt={group.name} />
                  ) : (
                    <div className="cp-group-img-placeholder">👥</div>
                  )}
                </div>
                <div className="cp-group-info">
                  <p className="cp-group-name">{group.name}</p>
                  <p className="cp-group-meta">{group.type} · {group.members}</p>
                  {group.added && <p className="cp-group-added">{group.added}</p>}
                </div>
                <div className="cp-group-check">
                  {isSel && <BsCheck size={20} />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="cp-footer">
        <button className="cp-save-btn" onClick={handleSave}>
          Save Communities ({selectedIds.length})
        </button>
      </div>
    </div>
  );
}

export default CommunitiesPage;
