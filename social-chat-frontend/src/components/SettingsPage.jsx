import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BsChevronLeft, BsSearch, BsShieldLock, BsPerson,
  BsBriefcase, BsCreditCard,
  BsCurrencyDollar, BsListCheck, BsPhone, BsBoxes,
  BsBag, BsQuestionCircle, BsWhatsapp, BsFileText,
  BsLock, BsSlashCircle, BsSliders,
  BsHandThumbsUp, BsBell, BsUniversalAccess,
  BsPinAngle, BsGlobe, BsPlayBtn, BsClock,
  BsLayoutSidebar, BsMoonStars, BsCamera, BsMegaphone,
  BsFlask, BsFlag, BsBookmark, BsPersonBadge,
  BsPersonX, BsCircle, BsShieldCheck
} from "react-icons/bs";
import { FaMeta } from "react-icons/fa6";
import "./css/SettingsPage.css";

const sections = [
  {
    title: "Tools and resources",
    desc: "Our tools help you control and manage your privacy.",
    items: [
      { icon: <BsLock />, label: "Privacy Checkup" },
      { icon: <BsPerson />, label: "Family Centre" },
      { icon: <BsSearch />, label: "Default audience settings" },
    ]
  },
  {
    title: "Preferences",
    desc: "Customise your experience on Facebook.",
    items: [
      { icon: <BsSliders />, label: "Content preferences" },
      { icon: <BsHandThumbsUp />, label: "Reaction preferences" },
      { icon: <BsBell />, label: "Notifications" },
      { icon: <BsUniversalAccess />, label: "Accessibility" },
      { icon: <BsPinAngle />, label: "Tab bar" },
      { icon: <BsGlobe />, label: "Language and region" },
      { icon: <BsPlayBtn />, label: "Media" },
      { icon: <BsClock />, label: "Time management" },
      { icon: <BsLayoutSidebar />, label: "Browser" },
      { icon: <BsMoonStars />, label: "Dark mode" },
      { icon: <BsCamera />, label: "Camera roll sharing suggestions" },
      { icon: <BsMegaphone />, label: "Ads in content that you've created" },
      { icon: <BsFlask />, label: "Early access to features" },
    ]
  },
  {
    title: "Audience and visibility",
    desc: "Control who can see what you share on Facebook.",
    items: [
      { icon: <BsShieldLock />, label: "Profile locking" },
      { icon: <BsPerson />, label: "Profile details" },
      { icon: <BsBriefcase />, label: "Professional mode" },
      { icon: <BsPersonBadge />, label: "How people can find and contact you" },
      { icon: <BsFileText />, label: "Posts" },
      { icon: <BsBookmark />, label: "Stories" },
      { icon: <BsFlag />, label: "Pages" },
      { icon: <BsPlayBtn />, label: "Reels" },
      { icon: <BsPerson />, label: "Followers and public content" },
      { icon: <BsPinAngle />, label: "Profile and tagging" },
      { icon: <BsPersonX />, label: "Blocking" },
      { icon: <BsCircle />, label: "Active Status" },
    ]
  },
  {
    title: "Payments",
    desc: "Manage your payment info and activity.",
    items: [
      { icon: <BsCreditCard />, label: "Ads payments" },
      { icon: <BsCurrencyDollar />, label: "Payouts" },
    ]
  },
  {
    title: "Your activity",
    desc: "Review your activity and content that you're tagged in.",
    items: [
      { icon: <BsListCheck />, label: "Activity log" },
      { icon: <BsPhone />, label: "Device permissions" },
      { icon: <BsBoxes />, label: "Apps and websites" },
      { icon: <BsBag />, label: "Business integrations" },
      { icon: <BsQuestionCircle />, label: "Learn how to manage your information" },
      { icon: <BsWhatsapp />, label: "WhatsApp" },
    ]
  },
  {
    title: "Community Standards and legal policies",
    desc: "",
    items: [
      { icon: <BsFileText />, label: "Terms of Service" },
      { icon: <BsLock />, label: "Privacy Policy" },
      { icon: <BsSlashCircle />, label: "Cookies Policy" },
    ]
  },
];

const SettingsPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  return (
    <div className="sp2-container">

      {/* Header */}
      <div className="sp2-header">
        <BsChevronLeft className="sp2-back" onClick={() => navigate(-1)} />
        <h3>Settings & privacy</h3>
        <BsSearch className="sp2-search-icon" />
      </div>
      <div className="sp2-divider"></div>

      {/* Search Bar */}
      <div className="sp2-search-wrap">
        <input
          type="text"
          placeholder="Search settings"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="sp2-search-input"
        />
      </div>

      {/* Accounts Centre Card */}
      <div className="sp2-accounts-card">
        <div className="sp2-meta-row">
          <FaMeta className="sp2-meta-icon" />
          <span className="sp2-meta-text">Meta</span>
        </div>
        <h4>Accounts Centre</h4>
        <p>Manage your connected experiences and account settings across Meta technologies.</p>
        <div className="sp2-acc-items">
          <div className="sp2-acc-item"><BsPersonBadge className="sp2-acc-icon" /><span>Personal details</span></div>
          <div className="sp2-acc-item"><BsShieldCheck className="sp2-acc-icon" /><span>Password and security</span></div>
          <div className="sp2-acc-item"><BsLayoutSidebar className="sp2-acc-icon" /><span>Ad preferences</span></div>
          <div className="sp2-acc-item"><BsShieldLock className="sp2-acc-icon" /><span>Verification</span></div>
        </div>
        <p className="sp2-see-more">See more in Accounts Centre</p>
      </div>

      {/* Sections */}
      {sections.map((section, si) => (
        <div className="sp2-section" key={si}>
          <h4 className="sp2-section-title">{section.title}</h4>
          {section.desc && <p className="sp2-section-desc">{section.desc}</p>}
          {section.items.map((item, ii) => (
            <div className="sp2-item" key={ii}>
              <div className="sp2-item-icon">{item.icon}</div>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      ))}

    </div>
  );
};

export default SettingsPage;