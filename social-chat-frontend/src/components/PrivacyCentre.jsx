import React from "react";
import { useNavigate } from "react-router-dom";
import { BsX, BsSearch, BsList, BsChevronRight, BsIncognito, BsFacebook, BsInstagram } from "react-icons/bs";
import { FaMeta } from "react-icons/fa6";
import "./css/PrivacyCentre.css";

const PrivacyCentre = () => {
  const navigate = useNavigate();

  return (
    <div className="pc-container">

      {/* Header */}
      <div className="pc-header">
        <BsX className="pc-close" onClick={() => navigate(-1)} />
        <div className="pc-header-meta">
          <FaMeta className="pc-meta-icon" />
          <span>Meta</span>
        </div>
        <div className="pc-header-right">
          <BsSearch className="pc-icon" />
          <BsList className="pc-icon" />
        </div>
      </div>

      <div className="pc-scroll">

        {/* Title Section */}
        <div className="pc-title-section">
          <h2>Privacy Centre</h2>
          <p>Make the privacy choices that are right for you. Learn how to manage and control your privacy on Facebook, Instagram, Messenger and other Meta Products.</p>
        </div>

        {/* We build privacy */}
        <div className="pc-section">
          <h3>We build privacy into our products</h3>
          <div className="pc-card">
            <div className="pc-card-icon-wrap">
              <img src="https://img.icons8.com/color/96/secured-letter.png" alt="Private messaging" className="pc-card-img" />
            </div>
            <h4>Private messaging</h4>
            <p>Our messaging products offer end-to-end encryption, so your conversations stay safe and secure.</p>
          </div>
        </div>

        {/* Settings to help */}
        <div className="pc-section">
          <h3>Settings to help control your privacy</h3>
          <p className="pc-section-desc">We build easy-to-use settings that you can use to make the privacy choices that are right for you.</p>
          <img src="https://picsum.photos/600/300?random=10" alt="Privacy settings" className="pc-full-img" />
          <button className="pc-blue-btn">Review settings</button>
        </div>

        {/* Privacy topics */}
        <div className="pc-section">
          <h3>Privacy topics</h3>
          <p className="pc-section-desc">Get answers to your privacy questions and manage your privacy in a way that's right for you.</p>

          <div className="pc-topic-card">
            <img src="https://picsum.photos/600/250?random=20" alt="Generative AI" className="pc-topic-img" />
            <div className="pc-topic-label">
              <span className="pc-topic-sub">Generative AI</span>
              <strong>Generative AI at Meta</strong>
            </div>
          </div>

          <button className="pc-outline-btn">View all topics</button>
        </div>

        {/* Learn about Meta's commitment */}
        <div className="pc-section">
          <h3>Learn about Meta's commitment to privacy</h3>
          <p className="pc-section-desc">Find more resources that you can use to learn about how Meta builds privacy into its products.</p>

          <div className="pc-list-item">
            <BsIncognito className="pc-list-icon" />
            <span>More privacy resources</span>
            <BsChevronRight className="pc-list-arrow" />
          </div>
        </div>

        {/* Learn more in Privacy Policy */}
        <div className="pc-section">
          <h3>Learn more in the Privacy Policy</h3>

          <div className="pc-policy-card">
            <img src="https://img.icons8.com/color/96/privacy-policy.png" alt="Privacy Policy" className="pc-policy-icon" />
            <div>
              <strong>What is the Privacy Policy, and what does it cover?</strong>
              <p>Privacy Policy</p>
            </div>
            <BsChevronRight />
          </div>
        </div>

        {/* Looking for more */}
        <div className="pc-section">
          <h3>Looking for more privacy settings?</h3>
          <p className="pc-section-desc">Quickly access your settings across Facebook and Messenger or Instagram</p>

          <div className="pc-platform-card">
            <div className="pc-platform-item">
              <span>Facebook</span>
              <div className="pc-platform-right">
                <BsFacebook className="pc-fb-icon" />
                <BsChevronRight />
              </div>
            </div>
            <div className="pc-platform-divider"></div>
            <div className="pc-platform-item">
              <span>Instagram</span>
              <div className="pc-platform-right">
                <BsInstagram className="pc-ig-icon" />
                <BsChevronRight />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PrivacyCentre;