import React from "react";
import { useNavigate } from "react-router-dom";
import { BsSearch, BsArrowLeft, BsClock, BsPersonCircle } from "react-icons/bs";

const SearchOverlay = ({ isSearching, setIsSearching, searchTerm, setSearchTerm, recentSearches, suggested }) => {
  const navigate = useNavigate();

  if (!isSearching) return null;

  const allItems = [
    ...(recentSearches || []),
    ...(suggested || []),
    { id: 201, name: "React Developers Group", desc: "Public Group · 42K members", icon: "bi-people" },
    { id: 202, name: "Marketplace: iPhones & Gadgets", desc: "Electronics in Delhi", icon: "bi-shop" },
    { id: 203, name: "Aarav Sharma", desc: "Digital Creator", img: "https://i.pravatar.cc/150?u=aarav" },
  ];

  const filtered = allItems.filter(item => 
    !searchTerm || item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (item.desc && item.desc.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSelectResult = (item) => {
    setIsSearching(false);
    setSearchTerm("");
    if (item.name.toLowerCase().includes("market")) {
      navigate("/market");
    } else if (item.name.toLowerCase().includes("settings")) {
      navigate("/settings");
    } else if (item.img) {
      navigate("/profile", {
        state: {
          user: {
            id: item.id,
            name: item.name,
            profile: item.img,
            bio: item.desc || "Nexoria Community Member"
          }
        }
      });
    } else {
      navigate("/friends");
    }
  };

  return (
    <div className="search-overlay">
      <div className="search-nav">
        <BsArrowLeft 
          size={20}
          onClick={() => { setIsSearching(false); setSearchTerm(""); }}
          style={{ cursor: "pointer", color: "var(--color-icon)", marginRight: "10px" }}
        />
        <div className="search-bar-inner">
          <BsSearch className="search-icon" />
          <input 
            type="text" 
            placeholder="Search Nexoria..." 
            autoFocus 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="search-scroll-body">
        {/* Results */}
        <div className="s-head">
          <span>{searchTerm ? "Search Results" : "Recent"}</span>
          {!searchTerm && <button>Clear all</button>}
        </div>

        {filtered.map(item => (
          <div key={item.id} className="s-item" onClick={() => handleSelectResult(item)}>
            <div className="s-left">
              {item.img ? (
                <div className="s-img-wrap">
                  <img src={item.img} alt="" />
                  {item.online && <span className="s-online"></span>}
                </div>
              ) : (
                <div className="s-icon-circle">
                  <i className={`bi ${item.icon || "bi-clock"}`}></i>
                </div>
              )}
              <div className="s-text">
                <p className="s-name">{item.name}</p>
                {item.desc && <p className="s-desc">{item.desc}</p>}
              </div>
            </div>
            <i className="bi bi-arrow-up-left" style={{ color: "var(--color-text-muted)" }}></i>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchOverlay;