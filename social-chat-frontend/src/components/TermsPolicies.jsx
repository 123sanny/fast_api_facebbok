import React, { useState } from "react";
import { 
  BsChevronLeft, BsChevronRight, BsJournalText, 
  BsLock, BsSlashCircle, BsShieldCheck, 
  BsThreeDots, BsFileEarmarkCheck, BsArrowLeft, BsCheckCircleFill
} from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import MenuIcons from "./MenuIcons";
import ChatDrawer from "./ChatDrawer";
import "./css/TermsPage.css";

const TERMS_DATA = {
  tos: {
    title: "Terms of Service",
    subtitle: "Effective Date: January 1, 2026",
    sections: [
      {
        heading: "1. The Services We Provide",
        text: "Our mission is to give people the power to build community and bring the world closer together. To help advance this mission, we provide personalized experiences, connect you with people and organizations you care about, and empower you to express yourself through posts, reels, and live interactions."
      },
      {
        heading: "2. Your Commitments to Nexoria",
        text: "We provide these services to you and others to help advance our mission. In exchange, we need you to make the following commitments: You must use the same name that you use in everyday life, provide accurate information about yourself, create only one account for your own use, and not share your password with anyone."
      },
      {
        heading: "3. Permissions You Grant Us",
        text: "Permission to use content that you create and share: Some content that you share or upload, such as photos or videos, may be protected by intellectual property laws. You own the intellectual property rights in any such content that you create and share on Nexoria."
      },
      {
        heading: "4. Limits on Using Our Intellectual Property",
        text: "If you use content covered by intellectual property rights that we have and make available in our products (for example, images, designs, videos or sounds we provide), we retain all rights to our content."
      },
      {
        heading: "5. Account Termination and Suspension",
        text: "We want Nexoria to be a place where people feel welcome and safe to express themselves. If we determine that you have clearly, seriously or repeatedly breached our Terms or Policies, we may suspend or permanently disable your account."
      }
    ]
  },
  privacy: {
    title: "Privacy Policy",
    subtitle: "Last Updated: August 2026",
    sections: [
      {
        heading: "1. Information We Collect",
        text: "We collect information you provide directly to us when you create an account, create or share content, message or communicate with others, and interact with features. This includes metadata such as the location of a photo or the date a file was created."
      },
      {
        heading: "2. How We Use Your Information",
        text: "We use the information we have to deliver, personalize, and improve our services, including to personalize features and content (such as your Feed, Reels recommendations, and Marketplace items) and make suggestions for you on and off our platform."
      },
      {
        heading: "3. How Your Information Is Shared",
        text: "When you share and communicate using our Products, you choose the audience for what you share (e.g., Public, Friends, or Custom lists). Public information can be seen by anyone on or off our products."
      },
      {
        heading: "4. How Can You Manage or Delete Your Information?",
        text: "We provide you with the ability to access, rectify, port, and delete your data via Settings > Accounts Centre and Your Activity Log. You can delete your account at any time in settings."
      }
    ]
  },
  community: {
    title: "Community Standards",
    subtitle: "Building a safe and authentic community",
    sections: [
      {
        heading: "1. Authenticity & Identity",
        text: "We want to make sure that the content people see on Nexoria is authentic. We believe that authenticity creates a better environment for sharing, and that's why we don't want people using Nexoria to misrepresent who they are or what they're doing."
      },
      {
        heading: "2. Safety & Dignity",
        text: "We are committed to making Nexoria a safe place. We remove content that encourages suicide or self-harm, sexual exploitation, bullying, harassment, and severe violence."
      },
      {
        heading: "3. Privacy & Intellectual Property",
        text: "We are committed to protecting personal privacy and intellectual property rights. We believe in providing transparency about our enforcement and respecting copyright holders."
      }
    ]
  },
    cookies: {
      title: "Cookies & Tracking Policy",
      subtitle: "How we use cookies to improve your experience",
      sections: [
        {
          heading: "1. Why Do We Use Cookies?",
          text: "Cookies are small pieces of text used to store information on web browsers. We use cookies to verify your account and determine when you're logged in so we can make it easier for you to access our products."
        },
        {
          heading: "2. Essential vs Analytics Cookies",
          text: "Essential cookies help provide security, prevent fraudulent activity, and remember your display preferences (like Light/Dark Mode). Analytics cookies help us understand how people use our features so we can make them faster."
        }
      ]
    },
    trademark: {
      title: "Trademark & Legal Disclaimer",
      subtitle: "Independent Platform Notice & Trademark Clarifications",
      sections: [
        {
          heading: "1. Independent Operation",
          text: "Nexoria (and Nexoria Cosmos) is an independently developed, proprietary social platform. Nexoria is NOT affiliated with, sponsored by, authorized by, or endorsed by Meta Platforms, Inc., Facebook, Instagram, or any of their subsidiaries."
        },
        {
          heading: "2. Third-Party Trademarks",
          text: "Facebook®, Instagram®, WhatsApp®, Meta®, and other respective logos are registered trademarks of Meta Platforms, Inc. All other product names, logos, brands, and registered trademarks featured or referenced within our platform are the property of their respective trademark holders."
        },
        {
          heading: "3. Nominative Fair Use",
          text: "Any mention or reference to third-party services, platforms, or formats is strictly for descriptive, educational, and nominative fair use purposes. Nexoria develops and maintains 100% proprietary code, distinctive design architecture, and original interactive features."
        }
      ]
    },
    dmca: {
      title: "DMCA & Copyright Policy",
      subtitle: "Digital Millennium Copyright Act Compliance & Safe Harbor",
      sections: [
        {
          heading: "1. Respect for Intellectual Property",
          text: "Nexoria respects the intellectual property rights of creators and copyright holders worldwide. In accordance with the Digital Millennium Copyright Act (17 U.S.C. § 512) and international IP regulations, Nexoria will respond expeditiously to valid notices of copyright infringement."
        },
        {
          heading: "2. Reporting Infringement (Takedown Notices)",
          text: "If you believe your copyrighted work has been copied in a way that constitutes copyright infringement, please notify our Designated Copyright Agent at copyright@nexoria.com or via our Help & Support Inbox with the required identification of the copyrighted work and location URL."
        },
        {
          heading: "3. Repeat Infringer Policy",
          text: "Nexoria enforces a strict three-strike policy. In appropriate circumstances, Nexoria will permanently disable or terminate accounts of users who are found to be repeat copyright infringers."
        }
      ]
    }
  };

const TermsPolicies = () => {
  const navigate = useNavigate();
  const [activeChat, setActiveChat] = useState(null);
  const [selectedPolicyKey, setSelectedPolicyKey] = useState(null);

  const policyItems = [
    {
      key: "tos",
      icon: <BsJournalText className="terms-icon" />,
      title: "Terms of Service",
      desc: "Terms you agree to when you use Nexoria.",
    },
    {
      key: "privacy",
      icon: <BsLock className="terms-icon" />,
      title: "Privacy Policy",
      desc: "Information we receive and how it's used.",
    },
    {
      key: "community",
      icon: <BsSlashCircle className="terms-icon" />,
      title: "Community Standards",
      desc: "What's not allowed and how to report abuse.",
    },
    {
      key: "cookies",
      icon: <BsShieldCheck className="terms-icon" />,
      title: "Cookies Policy",
      desc: "How we use cookies and similar technologies.",
    },
    {
      key: "trademark",
      icon: <BsShieldCheck className="terms-icon" />,
      title: "Trademark & Legal Disclaimer",
      desc: "Independent platform notice and trademark declarations.",
    },
    {
      key: "dmca",
      icon: <BsFileEarmarkCheck className="terms-icon" />,
      title: "DMCA & Copyright Policy",
      desc: "Copyright protection, takedown notices & safe harbor.",
    }
  ];

  return (
    <div className="terms-page-root">
      <Header onOpenChat={setActiveChat} />

      <div className="terms-container">
        
        {/* Main List View */}
        {!selectedPolicyKey ? (
          <>
            {/* Header */}
            <div className="terms-header">
              <BsChevronLeft className="terms-back" onClick={() => navigate(-1)} />
              <h3>Terms & Policies</h3>
              <div style={{ width: 24 }}></div>
            </div>

            <div className="terms-divider"></div>

            {/* List Items */}
            <div className="terms-list">
              {policyItems.map((item) => (
                <div key={item.key}>
                  <div className="terms-item" onClick={() => setSelectedPolicyKey(item.key)}>
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
              <div className="terms-item" onClick={() => navigate("/support")}>
                <div className="terms-icon-wrap">
                  <BsThreeDots className="terms-icon" />
                </div>
                <div className="terms-text">
                  <strong>Help Centre & Safety Resources</strong>
                  <p>Get answers and learn more about account safety.</p>
                </div>
                <BsChevronRight className="terms-arrow" />
              </div>
            </div>
          </>
        ) : (
          /* Detailed Policy Article View */
          <div className="policy-detail-view">
            <div className="terms-header">
              <BsArrowLeft className="terms-back" onClick={() => setSelectedPolicyKey(null)} />
              <h3>{TERMS_DATA[selectedPolicyKey].title}</h3>
              <div style={{ width: 24 }}></div>
            </div>

            <div className="terms-divider"></div>

            <div className="policy-detail-content">
              <div className="policy-intro-badge">
                <BsFileEarmarkCheck size={20} className="text-primary me-2" />
                <span>{TERMS_DATA[selectedPolicyKey].subtitle}</span>
              </div>

              {TERMS_DATA[selectedPolicyKey].sections.map((sec, idx) => (
                <div key={idx} className="policy-section-block">
                  <h4>{sec.heading}</h4>
                  <p>{sec.text}</p>
                </div>
              ))}

              <div className="policy-footer-note">
                <BsCheckCircleFill className="text-success me-2" />
                <span>By using Nexoria, you agree to these legal standards.</span>
              </div>

              <button className="btn-back-to-terms" onClick={() => setSelectedPolicyKey(null)}>
                Back to all policies
              </button>
            </div>
          </div>
        )}

      </div>

      <ChatDrawer activeChat={activeChat} onClose={() => setActiveChat(null)} />

      <div className="mobile-bottom-nav">
        <MenuIcons />
      </div>
    </div>
  );
};

export default TermsPolicies;