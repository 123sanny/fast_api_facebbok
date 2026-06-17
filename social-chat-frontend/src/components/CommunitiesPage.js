import React, { useState } from "react";
import { BsArrowLeft, BsSearch, BsX } from "react-icons/bs";
import "./css/CommunitiesPage.css";

const GROUPS = [
  { id: 1, name: "General Knowledge & News", type: "Public group", members: "904K members", added: "Added by Varsha Maurya", img: "https://picsum.photos/seed/g1/60/60" },
  { id: 2, name: "◆follow to followers group◆", type: "Public group", members: "116K members", added: "Added by AS Yadav Ji and Jakir Ansari", img: null },
  { id: 3, name: "Deep Side ``)", type: "Public group", members: "979 members", added: null, img: "https://picsum.photos/seed/g3/60/60" },
  { id: 4, name: "ब्राह्मण", type: "Public group", members: "2.2K members", added: null, img: "https://picsum.photos/seed/g4/60/60" },
  { id: 5, name: "for my 5k friend", type: "Public group", members: "107 members", added: "Added by Amarjeetkushwaha Kushwaha", img: "https://picsum.photos/seed/g5/60/60" },
  { id: 6, name: "Anilkumar", type: "Public group", members: "53 members", added: null, img: null },
  { id: 7, name: "Maa Jia को पसंद करने वाले मित्र", type: "Public group", members: "6.3K members", added: null, img: null },
  { id: 8, name: "HTML, CSS & JavaScript", type: "Public group", members: "418K members", added: null, img: null },
  { id: 9, name: "Kavita Yadav Fan Group", type: "Public group", members: "24K members", added: null, img: null },
  { id: 10, name: "Chennai Super Kings", type: "Public group", members: "1.2M members", added: null, img: "https://picsum.photos/seed/g10/60/60" },
];

function CommunitiesPage({ onClose }) {
  const [query, setQuery] = useState("");

  const filtered = GROUPS.filter(g =>
    g.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="cp-wrapper">
      {/* Header */}
      <div className="cp-header">
        <button className="cp-back" onClick={onClose}><BsArrowLeft size={22} /></button>
      </div>

      <div className="cp-body">
        <h2 className="cp-title">Add your favourite groups</h2>

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
          {filtered.map(group => (
            <div key={group.id} className="cp-group-row">
              <div className="cp-group-img">
                {group.img
                  ? <img src={group.img} alt={group.name} />
                  : <div className="cp-group-img-placeholder" />
                }
              </div>
              <div className="cp-group-info">
                <p className="cp-group-name">{group.name}</p>
                <p className="cp-group-meta">{group.type} · {group.members}</p>
                {group.added && <p className="cp-group-added">{group.added}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CommunitiesPage;
