import React from 'react';

const SearchOverlay = ({ isSearching, setIsSearching, searchTerm, setSearchTerm, recentSearches, suggested }) => {
  
  if (!isSearching) return null; // Agar searching true nahi hai toh kuch mat dikhao

  return (
    <div className="search-overlay">
      <div className="search-nav">
        <i 
          className="bi bi-arrow-left" 
          onClick={() => { setIsSearching(false); setSearchTerm(""); }}
          style={{ cursor: 'pointer' }}
        ></i>
        <div className="search-bar-inner">
          <i className="bi bi-search"></i>
          <input 
            type="text" 
            placeholder="Search with Meta AI" 
            autoFocus 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="search-scroll-body">
        {/* Recent Searches Section */}
        <div className="s-head">
          <span>Recent</span>
          <button>See all</button>
        </div>
        {recentSearches.map(item => (
          <div key={item.id} className="s-item">
            <div className="s-left">
              {item.icon ? (
                <div className="s-icon-circle"><i className={`bi ${item.icon}`}></i></div>
              ) : (
                <div className="s-img-wrap">
                  <img src={item.img} alt="" />
                  {item.online && <span className="s-online"></span>}
                </div>
              )}
              <div className="s-text">
                <p className="s-name">{item.name}</p>
                {item.desc && <p className="s-desc">{item.desc}</p>}
              </div>
            </div>
            <i className="bi bi-three-dots"></i>
          </div>
        ))}

        {/* Suggested Section */}
        <div className="s-head" style={{ marginTop: '15px' }}>
          <span>Suggested</span>
          <button>Refresh</button>
        </div>
        {suggested.map(item => (
          <div key={item.id} className="s-item">
            <div className="s-left">
              <img src={item.img} alt="" className="s-avatar-only" />
              <div className="s-text">
                <p className="s-name">{item.name}</p>
                <p className="s-desc">{item.desc}</p>
              </div>
            </div>
            <i className="bi bi-three-dots"></i>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchOverlay;