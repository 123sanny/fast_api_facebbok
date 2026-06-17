import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BsChevronLeft, BsSearch, BsGlobe, BsPatchCheckFill } from "react-icons/bs";
import "./css/AdActivity.css";

const recentAds = [
  {
    id: 1,
    name: "ChatGPT",
    verified: true,
    time: "Ad · 21 May",
    clickedAgo: "14 hours ago",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/ChatGPT_logo.svg/240px-ChatGPT_logo.svg.png",
    img: "https://picsum.photos/600/400?random=31",
    adText: "Ab dher saare tabs kholne ki zarurat nahi",
  },
  {
    id: 2,
    name: "Amazon India",
    verified: true,
    time: "Ad · 20 May",
    clickedAgo: "1 day ago",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/200px-Amazon_logo.svg.png",
    img: "https://picsum.photos/600/400?random=32",
    adText: "Great deals every day. Shop now!",
  },
];

const savedAds = [
  {
    id: 3,
    name: "Spotify",
    verified: true,
    time: "Ad · 18 May",
    clickedAgo: "3 days ago",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Spotify_logo_without_text.svg/200px-Spotify_logo_without_text.svg.png",
    img: "https://picsum.photos/600/400?random=33",
    adText: "Music for everyone. Try free.",
  },
  {
    id: 4,
    name: "Flipkart",
    verified: false,
    time: "Ad · 15 May",
    clickedAgo: "6 days ago",
    logo: "https://picsum.photos/50/50?random=44",
    img: "https://picsum.photos/600/400?random=34",
    adText: "Big Billion Days sale is here!",
  },
];

const AdCard = ({ ad }) => (
  <div className="aa-card">
    <div className="aa-card-meta">
      <p className="aa-clicked">You clicked this on &nbsp;<strong>{ad.clickedAgo}</strong></p>
    </div>
    <div className="aa-card-header">
      <img src={ad.logo} alt={ad.name} className="aa-logo" />
      <div>
        <div className="aa-name-row">
          <strong>{ad.name}</strong>
          {ad.verified && <BsPatchCheckFill className="aa-verified" />}
        </div>
        <div className="aa-time-row">
          <span>{ad.time}</span>
          <BsGlobe className="aa-globe" />
        </div>
      </div>
    </div>
    <img src={ad.img} alt="ad" className="aa-ad-img" />
    <p className="aa-ad-text">{ad.adText}</p>
  </div>
);

const AdActivity = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState("recent");

  const ads = tab === "recent" ? recentAds : savedAds;

  return (
    <div className="aa-container">

      {/* Header */}
      <div className="aa-header">
        <BsChevronLeft className="aa-back" onClick={() => navigate(-1)} />
        <h3>Ad activity</h3>
        <BsSearch className="aa-search" />
      </div>
      <div className="aa-divider"></div>

      {/* Title */}
      <div className="aa-title-section">
        <h4>Your ad activity</h4>
        <p>See ads you've recently interacted with and leave feedback on advertisers you've purchased from.</p>
      </div>

      <div className="aa-divider-thick"></div>

      {/* Tabs */}
      <div className="aa-tabs">
        <button
          className={`aa-tab ${tab === "recent" ? "active" : ""}`}
          onClick={() => setTab("recent")}
        >
          RECENT
        </button>
        <button
          className={`aa-tab ${tab === "saved" ? "active" : ""}`}
          onClick={() => setTab("saved")}
        >
          SAVED <span className="aa-saved-count">4</span>
        </button>
      </div>

      <div className="aa-divider"></div>

      {/* Ads List */}
      <div className="aa-list">
        {ads.map(ad => (
          <div key={ad.id}>
            <AdCard ad={ad} />
            <div className="aa-divider"></div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default AdActivity;