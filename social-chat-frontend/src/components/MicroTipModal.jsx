import React, { useState } from "react";
import { 
  BsX, BsLightningChargeFill, BsCurrencyRupee, 
  BsCheckCircleFill, BsShieldCheck 
} from "react-icons/bs";
import "./css/MicroTipModal.css";

const TIP_AMOUNTS = [10, 25, 50, 100, 200, 500];

function MicroTipModal({ post, recipient, onClose, onTipSuccess }) {
  const target = post || recipient;
  const [selectedAmount, setSelectedAmount] = useState(50);
  const [customAmount, setCustomAmount] = useState("");
  const [tipMessage, setTipMessage] = useState("Awesome content! Keep it up! 🔥");
  const [tipType, setTipType] = useState("upi"); // 'upi' or 'nx_coins'
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const activeAmount = customAmount ? Number(customAmount) : selectedAmount;
  const creatorName = target?.name || target?.user || target?.creatorName || "Creator";
  const creatorAvatar = target?.profile || target?.avatar || target?.creatorAvatar || "https://i.pravatar.cc/100?img=12";

  const handleSendTip = (e) => {
    e.preventDefault();
    if (!activeAmount || activeAmount <= 0) return;

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsCompleted(true);
      if (onTipSuccess) {
        onTipSuccess({
          postId: post?.id,
          amount: activeAmount,
          type: tipType,
          message: tipMessage,
          creatorName
        });
      }
    }, 900);
  };

  return (
    <div className="tip-modal-overlay" onClick={onClose}>
      <div className="tip-modal-dialog shadow-lg" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="tip-modal-header">
          <div className="tip-header-title">
            <span className="tip-icon-sparkle">⚡</span>
            <h4>Direct 1-Click Micro-Tipping</h4>
          </div>
          <button className="tip-modal-close-btn" onClick={onClose} aria-label="Close">
            <BsX size={26} />
          </button>
        </div>

        {isCompleted ? (
          <div className="tip-success-view text-center">
            <div className="confetti-cannon">
              <span className="confetti c1">🎉</span>
              <span className="confetti c2">⭐</span>
              <span className="confetti c3">💖</span>
              <span className="confetti c4">💎</span>
            </div>
            <div className="tip-success-icon-wrap">
              <BsCheckCircleFill size={52} className="text-success" />
            </div>
            <h3>Tip Sent Successfully!</h3>
            <p className="tip-success-subtitle">
              You tipped <strong>₹{activeAmount}</strong> to <strong>{creatorName}</strong>.
            </p>
            {tipMessage && (
              <div className="tip-note-box">
                <em>“{tipMessage}”</em>
              </div>
            )}
            <div className="tip-badge-info">
              <BsShieldCheck className="text-success me-1" /> 100% of tips go directly to the creator with 0% platform fee.
            </div>
            <button className="btn btn-primary rounded-pill w-100 py-2 mt-3" onClick={onClose}>
              Done & Return
            </button>
          </div>
        ) : (
          <form onSubmit={handleSendTip} className="tip-modal-body">
            
            {/* Creator Profile Preview */}
            <div className="tip-creator-preview">
              <img src={creatorAvatar} alt={creatorName} className="tip-creator-avatar" />
              <div className="tip-creator-info">
                <h6>{creatorName}</h6>
                <span>Support independent high-quality posts</span>
              </div>
              <div className="tip-fee-pill">0% Fee</div>
            </div>

            {/* Payment Method Selector */}
            <div className="tip-method-selector">
              <button
                type="button"
                className={`method-pill ${tipType === "upi" ? "active" : ""}`}
                onClick={() => setTipType("upi")}
              >
                <span>📱 Instant UPI / GPay / Paytm</span>
              </button>
              <button
                type="button"
                className={`method-pill ${tipType === "nx_coins" ? "active" : ""}`}
                onClick={() => setTipType("nx_coins")}
              >
                <span>🪙 NX Coins (Balance: 520)</span>
              </button>
            </div>

            {/* Amount Presets Grid */}
            <div className="tip-amount-grid">
              {TIP_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  className={`amount-btn ${activeAmount === amt && !customAmount ? "selected" : ""}`}
                  onClick={() => {
                    setSelectedAmount(amt);
                    setCustomAmount("");
                  }}
                >
                  <BsCurrencyRupee />{amt}
                </button>
              ))}
            </div>

            {/* Custom Amount Input */}
            <div className="custom-tip-input-wrap">
              <span className="currency-symbol">₹</span>
              <input
                type="number"
                min="1"
                max="10000"
                placeholder="Or enter custom amount..."
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="custom-tip-input"
              />
            </div>

            {/* Message Input */}
            <div className="tip-msg-box">
              <label className="tip-input-label">Cheer Message (Optional):</label>
              <input
                type="text"
                placeholder="Add a friendly note..."
                value={tipMessage}
                onChange={(e) => setTipMessage(e.target.value)}
                className="tip-msg-input"
                maxLength={80}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn-send-tip shadow"
              disabled={isProcessing || activeAmount <= 0}
            >
              {isProcessing ? (
                <span>Processing Payment...</span>
              ) : (
                <span>
                  <BsLightningChargeFill className="me-1 text-warning" /> Send ₹{activeAmount} Tip to {creatorName}
                </span>
              )}
            </button>

            <div className="tip-trust-footer">
              <BsShieldCheck className="text-muted me-1" />
              <span>Encrypted & Verified · Direct Creator Settlement</span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default MicroTipModal;
