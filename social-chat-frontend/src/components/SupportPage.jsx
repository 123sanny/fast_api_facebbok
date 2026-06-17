import React from "react";
import { BsChevronLeft, BsSearch, BsChevronRight, BsChatSquareDots, BsLifePreserver, BsFileText, BsExclamationTriangle } from "react-icons/bs";
import "./css/SupportPage.css";

const SupportPage = () => {
  return (
    <div className="support-container">

      {/* Header */}
      <div className="support-header">
        <BsChevronLeft className="back-icon" />
        <h3>Support</h3>
        <div style={{ width: 24 }}></div>
      </div>

      {/* Search Bar */}
      <div className="search-section">
        <div className="sp-search-bar">
          <BsSearch className="search-icon" />
          <input type="text" placeholder="Search or ask Meta AI for help" />
        </div>
      </div>

      {/* Meta AI Card */}
      <div className="content-padding">
        <div className="meta-ai-card">
          <div className="meta-ai-top">
            <div className="meta-ai-left">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Meta_Platforms_Inc._logo.svg/800px-Meta_Platforms_Inc._logo.svg.png"
                alt="Meta AI"
                className="meta-ai-logo"
              />
              <div>
                <strong>Meta AI support assistant</strong>
                <p>You're eligible to start earning</p>
              </div>
            </div>
            <span className="meta-ai-dots">•••</span>
          </div>
          <p className="meta-ai-desc">You're eligible to start earning with Subscriptions.</p>
          <div className="meta-ai-btns">
            <button>I need support</button>
            <button>What tools am I earning with?</button>
          </div>
        </div>

        {/* Get help with profile */}
        <h4 className="section-title">Get help with your profile</h4>
        <div className="sp-list-item">
          <div className="sp-item-left">
            <img src="https://i.pravatar.cc/50" alt="Profile" className="sp-profile-img" />
            <div>
              <strong>Sanny Tiwari</strong>
              <p>Review your profile's status.</p>
            </div>
          </div>
          <BsChevronRight />
        </div>

        {/* Your support activity */}
        <h4 className="section-title">Your support activity</h4>
        <div className="sp-list-item">
          <div className="sp-item-left">
            <BsChatSquareDots className="sp-icon" />
            <div>
              <strong>Things you reported</strong>
              <p>Check your report status.</p>
            </div>
          </div>
          <BsChevronRight />
        </div>

        {/* Make the most */}
        <h4 className="section-title">Make the most of your experience</h4>
        <div className="sp-promo-card">
          <img
            src="https://picsum.photos/400/200?random=5"
            alt="Growth Chart"
            className="sp-promo-img"
          />
          <div className="sp-promo-label">Monetisation and payouts</div>
        </div>

        {/* Article links */}
        <div className="sp-article-list">
          {[
            "How to check your monetisation eligibility on a Facebook Page ...",
            "About Facebook content monetisation for creators",
            "Update your Meta Verified creator profile information",
          ].map((text, i) => (
            <div className="sp-article-item" key={i}>
              <div className="sp-item-left">
                <BsChatSquareDots className="sp-icon" />
                <span>{text}</span>
              </div>
              <BsChevronRight />
            </div>
          ))}
          <p className="sp-see-all">See all</p>
        </div>

        {/* Can't find section */}
        <h4 className="section-title">Can't find what you're looking for?</h4>
        <p className="sp-subtitle">Find step-by-step guides to resolve common issues or learn more about our rules.</p>

        <div className="sp-list-item">
          <div className="sp-item-left">
            <BsLifePreserver className="sp-icon" />
            <strong>Help Centre</strong>
          </div>
          <BsChevronRight />
        </div>

        <div className="sp-list-item">
          <div className="sp-item-left">
            <BsFileText  className="sp-icon" />
            <strong>Terms & policies</strong>
          </div>
          <BsChevronRight />
        </div>

        <div className="sp-list-item" style={{ marginBottom: 30 }}>
          <div className="sp-item-left">
            <BsExclamationTriangle className="sp-icon" />
            <strong>Report a technical problem</strong>
          </div>
          <BsChevronRight />
        </div>

      </div>
    </div>
  );
};

export default SupportPage;