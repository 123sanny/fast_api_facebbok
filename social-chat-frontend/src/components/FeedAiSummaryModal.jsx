import React, { useState } from "react";
import { 
  BsX, BsStars, BsArrowRight, 
  BsClockHistory, BsShare, BsBookmarkCheckFill
} from "react-icons/bs";
import "./css/FeedAiSummaryModal.css";

const MOCK_SUMMARY_ITEMS = [
  {
    id: 1,
    category: "Tech & Innovation",
    emoji: "🚀",
    headline: "AI Agents Ecosystem Masterclass Released",
    summary: "Aarav Sharma and 14 developers published a hands-on guide to autonomous multi-agent systems and real-time WebSockets.",
    author: "Aarav Sharma",
    likes: "240 Likes",
    linkText: "View Post"
  },
  {
    id: 2,
    category: "Hyperlocal Delhi-NCR",
    emoji: "📍",
    headline: "Weekend Designers & Indie Makers Meetup at CP",
    summary: "Pooja Verma is hosting an open-air tech & coffee hangout this Sunday at Connaught Place Central Park (10 AM).",
    author: "Pooja Verma",
    likes: "95 Attending",
    linkText: "Join Event"
  },
  {
    id: 3,
    category: "Creator Economy",
    emoji: "💎",
    headline: "Star Vault Creator Rewards Hits 100K Transactions",
    summary: "Nexoria creators generated over ₹12.4 Lakh in direct micro-tips and supporter badges in September with 0% platform take rate.",
    author: "Nexoria Insights",
    likes: "1.8K Boosts",
    linkText: "Explore Vault"
  },
  {
    id: 4,
    category: "Community Buzz",
    emoji: "🌿",
    headline: "Pulse Lounge 3D Spatial Audio Surges to 8,000 Concurrent Listeners",
    summary: "The nightly chill lo-fi coding room hosted spontaneous AMAs with open-source maintainers across 12 countries.",
    author: "Kabir X",
    likes: "420 Voices",
    linkText: "Tune In"
  }
];

function FeedAiSummaryModal({ onClose }) {
  const [copied, setCopied] = useState(false);

  const handleShareSummary = () => {
    try {
      navigator.clipboard?.writeText(
        "⚡ Catch up on Nexoria in 2 Mins:\n" +
        MOCK_SUMMARY_ITEMS.map(i => `• ${i.headline}: ${i.summary}`).join("\n\n")
      )?.catch(() => {});
    } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="summary-modal-overlay" onClick={onClose}>
      <div className="summary-modal-dialog shadow-lg" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="summary-modal-header">
          <div className="summary-title-wrap">
            <span className="summary-badge-sparkle">
              <BsStars className="text-warning" />
            </span>
            <div>
              <h4>2-Minute Daily Feed Catch-Up</h4>
              <span className="summary-meta-time">
                <BsClockHistory className="me-1" /> Synthesized from your top 48 friend updates
              </span>
            </div>
          </div>
          <button className="summary-close-btn" onClick={onClose} aria-label="Close">
            <BsX size={26} />
          </button>
        </div>

        {/* Hero AI Digest Banner */}
        <div className="summary-hero-card">
          <div className="sh-left">
            <span className="sh-pill">⚡ Neural Digest</span>
            <h5>Your Friends' Highlights at a Glance</h5>
            <p>Zero clickbait, zero ads. Just the key moments you care about.</p>
          </div>
          <button className="sh-share-btn" onClick={handleShareSummary}>
            <BsShare className="me-1" /> {copied ? "Copied Digest!" : "Copy Summary"}
          </button>
        </div>

        {/* Summary Items List */}
        <div className="summary-items-scroll">
          {MOCK_SUMMARY_ITEMS.map((item, idx) => (
            <div key={item.id} className="summary-item-card">
              <div className="summary-card-top">
                <span className="item-emoji">{item.emoji}</span>
                <span className="item-cat">{item.category}</span>
                <span className="item-stats ms-auto">{item.likes}</span>
              </div>
              <h6>{item.headline}</h6>
              <p>{item.summary}</p>
              <div className="summary-card-footer">
                <span className="summary-author">By <strong>{item.author}</strong></span>
                <button className="summary-view-btn" onClick={onClose}>
                  {item.linkText} <BsArrowRight size={12} className="ms-1" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="summary-modal-footer">
          <span className="footer-guarantee">
            <BsBookmarkCheckFill className="text-success me-1" /> AI Briefing refreshed automatically every 3 hours
          </span>
          <button className="btn btn-primary rounded-pill px-4 py-2" onClick={onClose}>
            Got it, Let's Browse
          </button>
        </div>

      </div>
    </div>
  );
}

export default FeedAiSummaryModal;
