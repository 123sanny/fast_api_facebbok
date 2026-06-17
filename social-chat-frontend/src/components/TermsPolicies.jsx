import React from "react";
import { BsChevronLeft, BsChevronRight, BsJournalText, BsLock, BsSlashCircle } from "react-icons/bs";
import { BsThreeDots } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import "./css/TermsPage.css";

const items = [
  {
    icon: <BsJournalText className="terms-icon" />,
    title: "Terms of Service",
    desc: "Terms you agree to when you use Facebook.",
  },
  {
    icon: <BsLock className="terms-icon" />,
    title: "Privacy Policy",
    desc: "Information we receive and how it's used.",
  },
  {
    icon: <BsSlashCircle className="terms-icon" />,
    title: "Community Standards",
    desc: "What's not allowed and how to report abuse.",
  },
];

const TermsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="terms-container">
      {/* Header */}
      <div className="terms-header">
        <BsChevronLeft className="terms-back" onClick={() => navigate(-1)} />
        <h3>Terms & Policies</h3>
        <div style={{ width: 24 }}></div>
      </div>

      <div className="terms-divider"></div>

      {/* List Items */}
      <div className="terms-list">
        {items.map((item, i) => (
          <div key={i}>
            <div className="terms-item">
              <div className="terms-icon-wrap">{item.icon}</div>
              <div className="terms-text">
                <strong>{item.title}</strong>
                <p>{item.desc}</p>
              </div>
              <BsChevronRight className="terms-arrow" />
            </div>
            <div className="terms-divider"></div>
          </div>
        ))}

        {/* More Resources */}
        <div className="terms-item">
          <div className="terms-icon-wrap">
            <BsThreeDots className="terms-icon" />
          </div>
          <div className="terms-text">
            <strong>More Resources</strong>
          </div>
          <BsChevronRight className="terms-arrow" />
        </div>
      </div>
    </div>
  );
};

export default TermsPage;