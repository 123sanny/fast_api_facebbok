import React, { useState } from "react";
import {
  BsX, BsStarFill, BsQrCodeScan,
  BsShieldCheck, BsCreditCard2FrontFill, BsLightningFill,
  BsCheckCircleFill, BsBank
} from "react-icons/bs";
import { purchaseStarsApi } from "../services/vaultApi";
import { getActiveUserId, getActiveUserName } from "../services/profileApi";
import "./css/BuyStarsModal.css";

const STAR_RECHARGE_PACKS = [
  { id: 1, stars: 100, bonus: 0, inr: 50, tag: "Starter" },
  { id: 2, stars: 500, bonus: 50, inr: 250, tag: "Popular", badge: "+50 Bonus ⭐" },
  { id: 3, stars: 1000, bonus: 150, inr: 500, tag: "Best Value 🔥", badge: "+150 Bonus ⭐", featured: true },
  { id: 4, stars: 2500, bonus: 500, inr: 1250, tag: "Creator Pro 💎", badge: "+500 Bonus ⭐" },
  { id: 5, stars: 5000, bonus: 1250, inr: 2500, tag: "VIP Whale 👑", badge: "+1,250 Bonus ⭐" }
];

export default function BuyStarsModal({ onClose, onSuccess }) {
  const activeUserId = getActiveUserId() || 1;
  const activeUserName = getActiveUserName() || "Creator";

  const [selectedPack, setSelectedPack] = useState(STAR_RECHARGE_PACKS[2]); // Default 1000 stars
  const [isCustom, setIsCustom] = useState(false);
  const [customStars, setCustomStars] = useState(200);

  const [paymentMethod, setPaymentMethod] = useState("upi"); // upi | card | netbanking
  const [upiApp, setUpiApp] = useState("gpay"); // gpay | phonepe | paytm | qr
  const [upiIdInput, setUpiIdInput] = useState("");
  const [utrNumber, setUtrNumber] = useState("");
  const [cardNumber, setCardNumber] = useState("4532 •••• •••• 8921");
  const [cardHolder, setCardHolder] = useState(activeUserName);

  const [isProcessing, setIsProcessing] = useState(false);
  const [successResult, setSuccessResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const currentStars = isCustom ? parseInt(customStars || 0, 10) : selectedPack.stars;
  const currentBonus = isCustom ? 0 : selectedPack.bonus;
  const totalStarsToReceive = currentStars + currentBonus;
  const currentPriceINR = isCustom ? (currentStars * 0.50).toFixed(2) : selectedPack.inr.toFixed(2);

  const handlePurchase = async () => {
    if (totalStarsToReceive <= 0) {
      setErrorMessage("Please enter or select a valid Star amount.");
      return;
    }

    setErrorMessage("");
    setIsProcessing(true);

    try {
      const payload = {
        user_id: activeUserId,
        stars_amount: currentStars,
        bonus_stars: currentBonus,
        amount_paid: parseFloat(currentPriceINR),
        payment_method: paymentMethod === "upi" ? `UPI (${upiApp.toUpperCase()})` : paymentMethod === "card" ? "Debit/Credit Card" : "Net Banking",
        transaction_ref: utrNumber || `UPI_REF_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`
      };

      const res = await purchaseStarsApi(payload);
      if (res && res.success) {
        setSuccessResult(res);
        if (onSuccess) onSuccess(res);
      } else {
        setErrorMessage(res?.message || "Failed to process Star purchase. Please try again.");
      }
    } catch (err) {
      setErrorMessage(err.message || "Payment transaction failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="buy-stars-overlay" onClick={onClose}>
      <div className="buy-stars-modal shadow-2xl" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="buy-stars-header">
          <div className="d-flex align-items-center gap-2">
            <div className="buy-stars-icon-bubble">
              <BsStarFill size={20} className="text-warning" />
            </div>
            <div>
              <h5 className="m-0 font-weight-bold">Buy & Recharge Stars</h5>
              <small className="text-muted">Standard Creator Rate: 1 Star = 50 Paise (₹0.50 INR)</small>
            </div>
          </div>
          <button className="buy-stars-close-btn" onClick={onClose}>
            <BsX size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="buy-stars-body">
          {successResult ? (
            /* Success State */
            <div className="buy-stars-success-view text-center py-4">
              <div className="success-star-burst mb-3">
                <BsCheckCircleFill size={56} className="text-success" />
              </div>
              <h4 className="text-light font-weight-bold mb-1">Recharge Successful!</h4>
              <p className="text-muted small mb-3">{successResult.message}</p>

              <div className="success-pack-summary-box mb-4">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Stars Added:</span>
                  <strong className="text-warning font-weight-bold">+{successResult.stars_added?.toLocaleString()} ⭐</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Amount Paid:</span>
                  <strong className="text-success font-weight-bold">₹{parseFloat(successResult.amount_paid).toFixed(2)} INR</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">New Total Balance:</span>
                  <strong className="text-light font-weight-bold">{successResult.new_balance?.toLocaleString()} Stars</strong>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Transaction ID:</span>
                  <span className="font-monospace text-info small">{successResult.transaction_ref}</span>
                </div>
              </div>

              <button 
                className="btn btn-warning w-100 py-2.5 font-weight-bold rounded-pill shadow"
                onClick={onClose}
              >
                Done & Return to Vault
              </button>
            </div>
          ) : (
            /* Pack Selection & Checkout View */
            <>
              {errorMessage && (
                <div className="alert alert-danger py-2 px-3 small rounded-3 mb-3">
                  {errorMessage}
                </div>
              )}

              {/* Star Packages Grid */}
              <div className="mb-3">
                <label className="form-label font-weight-bold small text-light mb-2">
                  Choose a Star Pack
                </label>
                <div className="star-packs-grid">
                  {STAR_RECHARGE_PACKS.map(pack => {
                    const isSelected = !isCustom && selectedPack.id === pack.id;
                    return (
                      <div
                        key={pack.id}
                        className={`star-pack-card ${isSelected ? "selected" : ""} ${pack.featured ? "featured" : ""}`}
                        onClick={() => {
                          setSelectedPack(pack);
                          setIsCustom(false);
                        }}
                      >
                        {pack.badge && <span className="pack-bonus-badge">{pack.badge}</span>}
                        <div className="pack-stars-row">
                          <BsStarFill className="text-warning me-1" />
                          <strong>{pack.stars.toLocaleString()}</strong>
                        </div>
                        <div className="pack-price-tag">₹{pack.inr} INR</div>
                        <div className="pack-tag-sub">{pack.tag}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Custom Amount Selector Toggle */}
              <div className="mb-3">
                <div 
                  className={`custom-amount-toggle-card ${isCustom ? "active" : ""}`}
                  onClick={() => setIsCustom(true)}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="font-weight-bold small text-light">Custom Star Quantity</span>
                    <span className="badge bg-warning-subtle text-warning small">1 ⭐ = ₹0.50</span>
                  </div>
                  {isCustom && (
                    <div className="mt-2 input-group input-group-sm" onClick={e => e.stopPropagation()}>
                      <span className="input-group-text bg-dark text-warning border-secondary">⭐</span>
                      <input
                        type="number"
                        min="50"
                        step="50"
                        className="form-control bg-dark text-light border-secondary"
                        value={customStars}
                        onChange={e => setCustomStars(Math.max(1, parseInt(e.target.value || 0, 10)))}
                        placeholder="Enter star amount"
                      />
                      <span className="input-group-text bg-dark text-success border-secondary font-weight-bold">
                        = ₹{(customStars * 0.50).toFixed(2)} INR
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Methods */}
              <div className="mb-3">
                <label className="form-label font-weight-bold small text-light mb-2">
                  Select Payment Method
                </label>
                <div className="buy-payment-methods-grid">
                  <button
                    type="button"
                    className={`buy-method-chip ${paymentMethod === "upi" ? "active" : ""}`}
                    onClick={() => setPaymentMethod("upi")}
                  >
                    <BsQrCodeScan className="me-1 text-success" /> Instant UPI / QR
                  </button>
                  <button
                    type="button"
                    className={`buy-method-chip ${paymentMethod === "card" ? "active" : ""}`}
                    onClick={() => setPaymentMethod("card")}
                  >
                    <BsCreditCard2FrontFill className="me-1 text-primary" /> Cards / Debit
                  </button>
                  <button
                    type="button"
                    className={`buy-method-chip ${paymentMethod === "netbanking" ? "active" : ""}`}
                    onClick={() => setPaymentMethod("netbanking")}
                  >
                    <BsBank className="me-1 text-info" /> Net Banking
                  </button>
                </div>
              </div>

              {/* UPI Sub-Options */}
              {paymentMethod === "upi" && (
                <div className="upi-details-card mb-3">
                  <div className="upi-app-pills mb-2">
                    {["gpay", "phonepe", "paytm", "qr"].map(app => (
                      <button
                        type="button"
                        key={app}
                        className={`upi-pill-btn ${upiApp === app ? "active" : ""}`}
                        onClick={() => setUpiApp(app)}
                      >
                        {app === "gpay" && "Google Pay"}
                        {app === "phonepe" && "PhonePe"}
                        {app === "paytm" && "Paytm"}
                        {app === "qr" && "Scan QR Code"}
                      </button>
                    ))}
                  </div>

                  {upiApp === "qr" ? (
                    <div className="qr-box-view text-center py-2">
                      <div className="qr-scan-preview-box">
                        <BsQrCodeScan size={50} className="text-warning mb-1" />
                        <span className="d-block text-secondary small">upi://pay?pa=nexoria@upi&am={currentPriceINR}</span>
                      </div>
                      <small className="text-muted d-block mt-1">Scan using any UPI app to pay ₹{currentPriceINR}</small>
                    </div>
                  ) : (
                    <div>
                      <input
                        type="text"
                        className="form-control form-control-sm bg-dark text-light border-secondary mb-2"
                        placeholder="Enter UPI VPA (e.g. mobile@upi)"
                        value={upiIdInput}
                        onChange={e => setUpiIdInput(e.target.value)}
                      />
                    </div>
                  )}

                  <input
                    type="text"
                    className="form-control form-control-sm bg-dark text-light border-secondary"
                    placeholder="Optional 12-Digit Bank UTR / Tx ID (Leave blank for instant simulation)"
                    value={utrNumber}
                    onChange={e => setUtrNumber(e.target.value)}
                  />
                </div>
              )}

              {/* Card Sub-Options */}
              {paymentMethod === "card" && (
                <div className="card-details-box mb-3">
                  <div className="mb-2">
                    <input
                      type="text"
                      className="form-control form-control-sm bg-dark text-light border-secondary"
                      placeholder="Card Number"
                      value={cardNumber}
                      onChange={e => setCardNumber(e.target.value)}
                    />
                  </div>
                  <div className="row g-2">
                    <div className="col-6">
                      <input
                        type="text"
                        className="form-control form-control-sm bg-dark text-light border-secondary"
                        placeholder="MM/YY"
                        defaultValue="08/29"
                      />
                    </div>
                    <div className="col-6">
                      <input
                        type="password"
                        maxLength={4}
                        className="form-control form-control-sm bg-dark text-light border-secondary"
                        placeholder="CVV"
                        defaultValue="892"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Checkout Summary Pill */}
              <div className="order-summary-pill mb-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <span className="text-muted small">Total Stars Credited:</span>
                    <strong className="d-block text-warning font-weight-bold">
                      {totalStarsToReceive.toLocaleString()} Stars {currentBonus > 0 && <span className="text-success small">(+{currentBonus} Bonus)</span>}
                    </strong>
                  </div>
                  <div className="text-end">
                    <span className="text-muted small">Amount Payable:</span>
                    <h5 className="m-0 text-success font-weight-bold">₹{currentPriceINR} INR</h5>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                className="btn btn-warning w-100 py-2.5 font-weight-bold shadow d-flex align-items-center justify-content-center gap-2"
                onClick={handlePurchase}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status"></span>
                    Settling Payment Securely...
                  </>
                ) : (
                  <>
                    <BsLightningFill size={18} />
                    Pay ₹{currentPriceINR} INR & Add {totalStarsToReceive.toLocaleString()} ⭐
                  </>
                )}
              </button>

              <div className="mt-2 text-center">
                <small className="text-muted" style={{ fontSize: "11px" }}>
                  <BsShieldCheck className="text-success me-1" />
                  256-Bit Encrypted Instant Settlement • Non-withdrawable registration bonus rules apply
                </small>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
