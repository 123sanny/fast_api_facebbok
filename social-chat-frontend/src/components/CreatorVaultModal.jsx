import React, { useState, useEffect, useCallback } from "react";
import { 
  BsX, BsStarFill, BsShieldCheck, BsGraphUpArrow, 
  BsWallet2, BsTrophyFill, BsStars, BsCheckCircleFill,
  BsCurrencyRupee, BsBank,
  BsClockHistory, BsSendCheck
} from "react-icons/bs";
import { FaGem, FaCrown, FaBolt } from "react-icons/fa6";
import { getActiveUserId, getActiveUserName } from "../services/profileApi";
import { 
  fetchCreatorVaultApi, 
  simulateCreatorTipApi, 
  requestCreatorPayoutApi 
} from "../services/vaultApi";
import BuyStarsModal from "./BuyStarsModal";
import "./css/CreatorVaultModal.css";

const STATIC_BADGES = [
  { id: 1, name: "TruthGuard Pioneer", desc: "100% Verified authenticity score across 50+ posts", icon: <BsShieldCheck className="text-success" />, tier: "Gold" },
  { id: 2, name: "Viral Maestro", desc: "Generated over 500K organic impressions in 30 days", icon: <FaBolt className="text-warning" />, tier: "Diamond" },
  { id: 3, name: "Star Magnet 🌟", desc: "Received over 10,000 Creator Stars from followers", icon: <BsStarFill className="text-warning" />, tier: "Master" },
  { id: 4, name: "Cosmos Ambassador", desc: "Invited 25+ top verified creators to Nexoria", icon: <FaCrown className="text-primary" />, tier: "Platinum" }
];

function CreatorVaultModal({ onClose }) {
  const activeUserId = getActiveUserId() || 1;
  const activeUserName = getActiveUserName() || "Creator";

  // Vault State
  const [totalStars, setTotalStars] = useState(19050);
  const [bonusStars, setBonusStars] = useState(0);
  const [withdrawableStars, setWithdrawableStars] = useState(19050);
  const [usdValue, setUsdValue] = useState("190.50");
  const [inrValue, setInrValue] = useState("9525.00");
  const [walletAddress, setWalletAddress] = useState(`0x7F2...${activeUserId}_NexoriaVault`);
  const [achievements, setAchievements] = useState(STATIC_BADGES);
  const [recentTips, setRecentTips] = useState([]);
  const [payoutsHistory, setPayoutsHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // View Mode: "overview" | "history"
  const [activeTab, setActiveTab] = useState("overview");

  // Interactive Animations & Modals
  const [tipShowerActive, setTipShowerActive] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showBuyStarsModal, setShowBuyStarsModal] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Withdrawal Form State
  const [withdrawStars, setWithdrawStars] = useState(1000);
  const [payoutMethod, setPayoutMethod] = useState("UPI"); // UPI | Bank | PayPal
  const [upiId, setUpiId] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [accountHolderName, setAccountHolderName] = useState(activeUserName);
  const [phone, setPhone] = useState("");
  const [isSubmittingWithdraw, setIsSubmittingWithdraw] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load Vault Data from Real Backend
  const loadVaultData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetchCreatorVaultApi(activeUserId);
      if (res && res.success) {
        setTotalStars(res.total_stars);
        setBonusStars(res.bonus_stars || 0);
        setWithdrawableStars(res.withdrawable_stars !== undefined ? res.withdrawable_stars : Math.max(0, res.total_stars - (res.bonus_stars || 0)));
        setUsdValue(res.usd_value);
        setInrValue(res.inr_value || (res.total_stars * 0.5).toFixed(2));
        setWalletAddress(res.wallet_address || `0x7F2...${activeUserId}_NexoriaVault`);
        if (res.achievements && res.achievements.length > 0) {
          setAchievements(res.achievements);
        }
        if (res.recent_tips && res.recent_tips.length > 0) {
          setRecentTips(res.recent_tips);
        }
        if (res.payouts_history) {
          setPayoutsHistory(res.payouts_history);
        }
      }
    } catch (err) {
      console.warn("Failed to fetch vault data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [activeUserId]);

  useEffect(() => {
    loadVaultData();
  }, [loadVaultData]);

  // Simulate +200 Star Tip
  const triggerSimulateTip = async () => {
    setTipShowerActive(true);
    try {
      const supporters = ["Md Aslam", "Vijay Sagar", "Priya Sharma", "Elena Rostova", "Karan Tech"];
      const randomSupporter = supporters[Math.floor(Math.random() * supporters.length)];
      const notes = [
        "Incredible creative genius! ⭐ Keep inspiring!",
        "Loved your latest video breakdowns! 🔥",
        "Super inspiring journey! ⭐⭐ Star shower for you!",
        "Top tier creator on Nexoria! 🚀"
      ];
      const randomNote = notes[Math.floor(Math.random() * notes.length)];

      const res = await simulateCreatorTipApi(activeUserId, 200, randomSupporter, randomNote);
      if (res && res.success) {
        setTotalStars(res.new_balance);
        setBonusStars(res.bonus_stars || 0);
        setWithdrawableStars(res.withdrawable_stars !== undefined ? res.withdrawable_stars : Math.max(0, res.new_balance - (res.bonus_stars || 0)));
        setUsdValue(res.usd_value);
        setInrValue((res.new_balance * 0.5).toFixed(2));
        if (res.tip) {
          setRecentTips(prev => [res.tip, ...prev]);
        }
        showToast(`🎉 Received +200 Stars from ${randomSupporter}!`);
      } else {
        // Fallback offline simulate
        setTotalStars(prev => {
          const next = prev + 200;
          setWithdrawableStars(w => w + 200);
          setUsdValue((next * 0.01).toFixed(2));
          setInrValue((next * 0.5).toFixed(2));
          return next;
        });
        setRecentTips(prev => [
          {
            id: Date.now(),
            user: randomSupporter,
            avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${randomSupporter}`,
            stars: 200,
            note: randomNote,
            time: "Just now"
          },
          ...prev
        ]);
        showToast(`🎉 Received +200 Stars from ${randomSupporter}!`);
      }
    } catch (err) {
      console.error(err);
    }
    setTimeout(() => setTipShowerActive(false), 2200);
  };

  // Submit Withdrawal Request (1 Star = ₹0.50 INR)
  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();
    const requested = parseInt(withdrawStars, 10);
    if (requested < 100) {
      showToast("⚠️ Minimum withdrawal amount is 100 Stars (₹50 INR).");
      return;
    }
    if (requested > withdrawableStars) {
      showToast(`⚠️ Cannot withdraw more than withdrawable balance (${withdrawableStars.toLocaleString()} Stars = ₹${(withdrawableStars * 0.50).toFixed(2)}). Registration bonus stars (${bonusStars} ⭐) are reserved for tipping creators.`);
      return;
    }
    if (payoutMethod === "UPI" && !upiId.trim()) {
      showToast("⚠️ Please enter a valid UPI ID (e.g. name@okhdfcbank).");
      return;
    }
    if (payoutMethod === "Bank" && (!accountNumber.trim() || !ifscCode.trim())) {
      showToast("⚠️ Bank Account Number and IFSC Code are required.");
      return;
    }

    setIsSubmittingWithdraw(true);
    try {
      const payload = {
        user_id: activeUserId,
        stars_amount: requested,
        payout_method: payoutMethod,
        conversion_rate: 0.50,
        upi_id: payoutMethod === "UPI" ? upiId : null,
        bank_name: payoutMethod === "Bank" ? bankName : null,
        account_number: payoutMethod === "Bank" ? accountNumber : null,
        ifsc_code: payoutMethod === "Bank" ? ifscCode : null,
        account_holder_name: accountHolderName,
        phone_number: phone
      };

      const res = await requestCreatorPayoutApi(payload);
      if (res && res.success) {
        showToast(`💸 ${res.message}`);
        setShowWithdrawModal(false);
        setTotalStars(res.new_balance);
        setWithdrawableStars(Math.max(0, res.new_balance - bonusStars));
        setUsdValue(res.usd_value);
        setInrValue((res.new_balance * 0.5).toFixed(2));
        loadVaultData();
        setActiveTab("history");
      } else {
        showToast(`❌ ${res.message || "Withdrawal failed"}`);
      }
    } catch (err) {
      showToast(`❌ ${err.message || "Failed to submit withdrawal request"}`);
    } finally {
      setIsSubmittingWithdraw(false);
    }
  };

  const handleCopyWallet = () => {
    try {
      navigator.clipboard?.writeText(walletAddress)?.catch(() => {});
    } catch {}
    setCopiedAddress(true);
    showToast("📋 Creator Vault FIDO2 Key copied to clipboard!");
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  return (
    <div className="creator-vault-overlay" onClick={onClose}>
      <div className="creator-vault-modal shadow-2xl" onClick={e => e.stopPropagation()}>
        
        {/* Star Shower Confetti Animation */}
        {tipShowerActive && (
          <div className="star-shower-fullscreen-burst">
            {[...Array(25)].map((_, i) => (
              <div 
                key={i} 
                className="falling-star-particle"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 0.6}s`,
                  fontSize: `${Math.floor(Math.random() * 26) + 20}px`
                }}
              >
                ⭐
              </div>
            ))}
          </div>
        )}

        {/* Header */}
        <div className="vault-header">
          <div className="d-flex align-items-center gap-3">
            <div className="vault-icon-circle">
              <FaGem size={22} className="text-warning" />
            </div>
            <div>
              <div className="d-flex align-items-center gap-2">
                <h4 className="m-0 font-weight-bold">Nexoria Creator Star Vault</h4>
                {isLoading && (
                  <span className="badge bg-warning-subtle text-warning small" style={{ fontSize: "10px" }}>
                    Syncing...
                  </span>
                )}
              </div>
              <p className="vault-sub">Instant Monetization • Micro-Tips • Web3 Smart Payouts</p>
            </div>
          </div>
          <button className="vault-close-btn" onClick={onClose}>
            <BsX size={26} />
          </button>
        </div>

        {/* Body */}
        <div className="vault-body">
          
          {/* Total Star Balance Banner */}
          <div className="vault-balance-card">
            <div className="balance-info">
              <div className="d-flex align-items-center gap-2 mb-1">
                <span className="balance-label">TOTAL VAULT BALANCE</span>
                <span className="badge bg-warning-subtle text-warning small" style={{ fontSize: "11px", fontWeight: "700" }}>
                  1 ⭐ = 50 Paise (₹0.50 INR)
                </span>
              </div>
              <div className="balance-stars-row">
                <BsStarFill className="text-warning star-icon-large" />
                <h2>{totalStars.toLocaleString()}</h2>
                <span className="stars-unit">Stars</span>
              </div>
              <div className="d-flex flex-wrap gap-2 align-items-center mt-1">
                <p className="usd-conversion m-0">
                  ≈ ₹{inrValue} INR (${usdValue} USD)
                </p>
                {bonusStars > 0 && (
                  <span className="badge bg-info-subtle text-info small" title="Bonus stars received from registration can be used to tip creators">
                    🎁 {bonusStars} Bonus (For Tipping Only)
                  </span>
                )}
                <span className="badge bg-success-subtle text-success small font-weight-bold">
                  Withdrawable: {withdrawableStars.toLocaleString()} ⭐ (₹{(withdrawableStars * 0.50).toFixed(2)})
                </span>
              </div>
            </div>

            <div className="balance-actions">
              <button 
                className="btn-vault-action buy-stars-btn" 
                onClick={() => setShowBuyStarsModal(true)}
                title="Purchase & recharge stars (100⭐ = ₹50, 500⭐ = ₹250, 1000⭐ = ₹500)"
              >
                <BsStarFill className="me-1.5 text-warning" /> Buy / Recharge Stars
              </button>
              <button 
                className="btn-vault-action primary" 
                onClick={() => setShowWithdrawModal(true)}
              >
                <BsWallet2 className="me-1.5" /> Withdraw Funds
              </button>
              <button 
                className="btn-vault-action outline" 
                onClick={triggerSimulateTip}
                title="Trigger real-time +200 star tip simulation"
              >
                <BsStars className="me-1.5 text-warning" /> ✨ Simulate +200 Tip
              </button>
            </div>
          </div>

          {/* Sub-Tab Navigation */}
          <div className="vault-nav-tabs-bar">
            <button 
              className={`vault-tab-pill-btn ${activeTab === "overview" ? "active" : ""}`}
              onClick={() => setActiveTab("overview")}
            >
              <BsTrophyFill className="me-1.5 text-warning" /> Achievements & Live Tips
            </button>
            <button 
              className={`vault-tab-pill-btn ${activeTab === "history" ? "active" : ""}`}
              onClick={() => setActiveTab("history")}
            >
              <BsClockHistory className="me-1.5 text-info" /> Payout & Withdrawal History ({payoutsHistory.length})
            </button>
          </div>

          {/* TAB 1: OVERVIEW (Achievements & Live Tips) */}
          {activeTab === "overview" && (
            <div className="vault-grid-columns">
              
              {/* Left Column: Verified Creator Achievements */}
              <div className="vault-column">
                <div className="vault-section-title">
                  <BsTrophyFill className="text-warning me-2" />
                  <span>Verified Creator Achievements</span>
                </div>

                <div className="badges-list">
                  {achievements.map((badge, idx) => (
                    <div className="badge-item-card" key={badge.id || idx}>
                      <div className="badge-icon-wrap">
                        {badge.tier?.toLowerCase() === "gold" && <BsShieldCheck className="text-success" />}
                        {badge.tier?.toLowerCase() === "diamond" && <FaBolt className="text-warning" />}
                        {badge.tier?.toLowerCase() === "master" && <BsStarFill className="text-warning" />}
                        {badge.tier?.toLowerCase() === "platinum" && <FaCrown className="text-primary" />}
                      </div>
                      <div className="badge-details">
                        <div className="d-flex align-items-center justify-content-between">
                          <strong>{badge.name}</strong>
                          <span className={`badge-tier-tag ${badge.tier?.toLowerCase()}`}>{badge.tier}</span>
                        </div>
                        <p>{badge.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Recent Live Tips */}
              <div className="vault-column">
                <div className="vault-section-title d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center">
                    <BsGraphUpArrow className="text-success me-2" />
                    <span>Recent Live Tips</span>
                  </div>
                  <span className="live-pulse-badge">🔴 Live Feed</span>
                </div>

                <div className="tips-history-list">
                  {recentTips.slice(0, 5).map((tip, idx) => (
                    <div className="tip-history-row" key={tip.id || idx}>
                      <div className="tip-user-avatar">
                        <img 
                          src={tip.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${tip.user}`} 
                          alt="" 
                        />
                      </div>
                      <div className="tip-info flex-grow-1">
                        <div className="d-flex justify-content-between align-items-center">
                          <strong>{tip.user}</strong>
                          <span className="tip-amount">+{tip.stars} ⭐</span>
                        </div>
                        <p className="tip-note">“{tip.note}”</p>
                        <small className="text-muted">{tip.time}</small>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Creator Smart Vault Address */}
                <div className="vault-address-card" onClick={handleCopyWallet} style={{ cursor: "pointer" }}>
                  <div>
                    <small className="text-muted">Creator ID / FIDO2 Key</small>
                    <p className="m-0 font-monospace text-primary">{walletAddress}</p>
                  </div>
                  <button className="btn-copy-address" onClick={(e) => { e.stopPropagation(); handleCopyWallet(); }}>
                    {copiedAddress ? <BsCheckCircleFill className="text-success" /> : "Copy"}
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: PAYOUT & WITHDRAWAL HISTORY */}
          {activeTab === "history" && (
            <div className="vault-history-container">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="m-0 font-weight-bold">
                  <BsClockHistory className="me-2 text-info" />
                  Your Cashout & Withdrawal Requests
                </h6>
                <button 
                  className="btn btn-sm btn-primary rounded-pill px-3 py-1 font-weight-bold"
                  onClick={() => setShowWithdrawModal(true)}
                >
                  <BsWallet2 className="me-1" /> New Withdrawal
                </button>
              </div>

              {payoutsHistory.length === 0 ? (
                <div className="vault-empty-history text-center p-4">
                  <BsWallet2 size={36} className="text-muted mb-2 opacity-50" />
                  <p className="m-0 text-muted">No withdrawal requests found yet.</p>
                  <small className="text-secondary">Withdraw your accumulated Stars directly to your UPI ID or Bank Account.</small>
                </div>
              ) : (
                <div className="payouts-table-responsive">
                  <table className="table table-dark table-hover vault-payouts-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Stars</th>
                        <th>Amount (INR)</th>
                        <th>Method / Account</th>
                        <th>Status</th>
                        <th>UTR Reference</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payoutsHistory.map(p => (
                        <tr key={p.id}>
                          <td>{p.created_at}</td>
                          <td>
                            <span className="badge bg-warning-subtle text-warning font-weight-bold">
                              {p.stars_amount} ⭐
                            </span>
                          </td>
                          <td className="text-success font-weight-bold">₹{parseFloat(p.inr_amount).toLocaleString()}</td>
                          <td>
                            <span className="payout-method-tag">{p.payout_method}</span>
                            <small className="d-block text-muted">{p.destination || p.upi_id || "Direct Payout"}</small>
                          </td>
                          <td>
                            {p.status === "paid" && (
                              <span className="badge bg-success-subtle text-success">
                                🟢 Completed & Paid
                              </span>
                            )}
                            {p.status === "pending" && (
                              <span className="badge bg-warning-subtle text-warning">
                                🟡 Under Admin Review
                              </span>
                            )}
                            {p.status === "rejected" && (
                              <span className="badge bg-danger-subtle text-danger" title={p.admin_note}>
                                🔴 Rejected (Refunded)
                              </span>
                            )}
                          </td>
                          <td>
                            {p.admin_payout_ref ? (
                              <span className="font-monospace text-info small">{p.admin_payout_ref}</span>
                            ) : (
                              <span className="text-muted small">Pending UTR</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>

        {/* WITHDRAW FUNDS SUB-MODAL */}
        {showWithdrawModal && (
          <div className="vault-submodal-overlay" onClick={() => setShowWithdrawModal(false)}>
            <div className="vault-submodal-card shadow-2xl" onClick={e => e.stopPropagation()}>
              
              <div className="submodal-header">
                <div className="d-flex align-items-center gap-2">
                  <div className="submodal-icon-bubble">
                    <BsWallet2 size={18} />
                  </div>
                  <div>
                    <h5 className="m-0 font-weight-bold">Instant Creator Payout</h5>
                    <small className="text-muted">Direct transfer to your Bank or UPI (0% Fee)</small>
                  </div>
                </div>
                <button className="submodal-close-btn" onClick={() => setShowWithdrawModal(false)}>
                  <BsX size={22} />
                </button>
              </div>

              <form onSubmit={handleWithdrawSubmit} className="submodal-body">
                
                {/* Available Balance Preview */}
                <div className="withdraw-balance-preview-box">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="text-muted small">Withdrawable Balance</span>
                    <span className="badge bg-warning-subtle text-warning small font-weight-bold">Rate: 1 ⭐ = 50 Paise (₹0.50)</span>
                  </div>
                  <h4 className="text-warning m-0 font-weight-bold">
                    {withdrawableStars.toLocaleString()} Stars <small className="text-success font-weight-bold">≈ ₹{(withdrawableStars * 0.50).toFixed(2)} INR</small>
                  </h4>
                  {bonusStars > 0 && (
                    <small className="text-secondary d-block mt-1">
                      ℹ️ Total balance: {totalStars.toLocaleString()} ⭐ ({bonusStars} welcome bonus stars are for tipping creators only).
                    </small>
                  )}
                </div>

                {/* Amount to Withdraw */}
                <div className="mb-3">
                  <label className="form-label font-weight-bold small text-light">Stars to Withdraw</label>
                  <div className="input-group">
                    <span className="input-group-text bg-dark border-secondary text-warning">⭐</span>
                    <input 
                      type="number" 
                      className="form-control bg-dark text-light border-secondary"
                      min={100}
                      max={withdrawableStars}
                      value={withdrawStars}
                      onChange={e => setWithdrawStars(e.target.value)}
                      required
                    />
                  </div>

                  {/* Quick Chips */}
                  <div className="quick-amount-chips mt-2">
                    {[100, 500, 1000, 5000, withdrawableStars].filter((amt, idx, arr) => amt > 0 && amt <= withdrawableStars && arr.indexOf(amt) === idx).map(amt => (
                      <button
                        type="button"
                        key={amt}
                        className={`chip-btn ${withdrawStars === amt ? "active" : ""}`}
                        onClick={() => setWithdrawStars(amt)}
                      >
                        {amt === withdrawableStars ? "Max Withdrawable" : `${amt.toLocaleString()} ⭐ (₹${(amt * 0.5).toFixed(0)})`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Conversion Summary Banner */}
                <div className="conversion-summary-pill mb-3">
                  <div className="d-flex justify-content-between small">
                    <span className="text-muted">You Will Receive:</span>
                    <strong className="text-success font-weight-bold fs-6">₹{(withdrawStars * 0.50).toFixed(2)} INR</strong>
                  </div>
                  <div className="d-flex justify-content-between small mt-1">
                    <span className="text-muted">Platform Fee:</span>
                    <span className="text-info font-weight-bold">₹0.00 (100% Payout)</span>
                  </div>
                </div>

                {/* Payout Method Tabs */}
                <div className="mb-3">
                  <label className="form-label font-weight-bold small text-light">Select Payout Destination</label>
                  <div className="payout-method-selector-grid">
                    <button
                      type="button"
                      className={`method-option-card ${payoutMethod === "UPI" ? "active" : ""}`}
                      onClick={() => setPayoutMethod("UPI")}
                    >
                      <BsCurrencyRupee size={18} />
                      <span>Instant UPI</span>
                      <small>GPay, PhonePe, Paytm</small>
                    </button>

                    <button
                      type="button"
                      className={`method-option-card ${payoutMethod === "Bank" ? "active" : ""}`}
                      onClick={() => setPayoutMethod("Bank")}
                    >
                      <BsBank size={18} />
                      <span>Bank Transfer</span>
                      <small>NEFT / IMPS</small>
                    </button>
                  </div>
                </div>

                {/* Method Details Input */}
                {payoutMethod === "UPI" && (
                  <div className="mb-3">
                    <label className="form-label font-weight-bold small text-light">Your UPI ID (VPA)</label>
                    <input 
                      type="text" 
                      className="form-control bg-dark text-light border-secondary"
                      placeholder="e.g. mobile@okhdfcbank or user@paytm"
                      value={upiId}
                      onChange={e => setUpiId(e.target.value)}
                      required
                    />
                  </div>
                )}

                {payoutMethod === "Bank" && (
                  <div className="bank-inputs-grid mb-3">
                    <div>
                      <label className="form-label font-weight-bold small text-light">Account Number</label>
                      <input 
                        type="text" 
                        className="form-control bg-dark text-light border-secondary"
                        placeholder="Account Number"
                        value={accountNumber}
                        onChange={e => setAccountNumber(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="form-label font-weight-bold small text-light">IFSC Code</label>
                      <input 
                        type="text" 
                        className="form-control bg-dark text-light border-secondary"
                        placeholder="e.g. HDFC0001234"
                        value={ifscCode}
                        onChange={e => setIfscCode(e.target.value.toUpperCase())}
                        required
                      />
                    </div>
                    <div>
                      <label className="form-label font-weight-bold small text-light">Account Holder Name</label>
                      <input 
                        type="text" 
                        className="form-control bg-dark text-light border-secondary"
                        placeholder="Full Name as in Bank"
                        value={accountHolderName}
                        onChange={e => setAccountHolderName(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="form-label font-weight-bold small text-light">Bank Name</label>
                      <input 
                        type="text" 
                        className="form-control bg-dark text-light border-secondary"
                        placeholder="e.g. State Bank of India"
                        value={bankName}
                        onChange={e => setBankName(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {/* Optional Mobile Phone for SMS payout notification */}
                <div className="mb-3">
                  <label className="form-label font-weight-bold small text-light">Mobile Number (For Payout SMS Notification)</label>
                  <input 
                    type="tel" 
                    className="form-control bg-dark text-light border-secondary"
                    placeholder="e.g. +91 9876543210"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                  />
                </div>

                {/* Submit Action */}
                <div className="mt-4">
                  <button 
                    type="submit" 
                    className="btn btn-warning w-100 py-2.5 font-weight-bold shadow d-flex align-items-center justify-content-center gap-2"
                    disabled={isSubmittingWithdraw}
                  >
                    {isSubmittingWithdraw ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        Processing Instant Payout...
                      </>
                    ) : (
                      <>
                        <BsSendCheck size={18} />
                        Request Payout of ₹{(withdrawStars * 0.50).toFixed(2)} INR
                      </>
                    )}
                  </button>
                </div>

              </form>

            </div>
          </div>
        )}

        {/* BUY / RECHARGE STARS MODAL */}
        {showBuyStarsModal && (
          <BuyStarsModal
            onClose={() => setShowBuyStarsModal(false)}
            onSuccess={(res) => {
              setTotalStars(res.new_balance);
              setBonusStars(res.bonus_stars);
              setWithdrawableStars(res.withdrawable_stars);
              setUsdValue(res.usd_value);
              setInrValue(res.inr_value);
              loadVaultData();
              showToast(res.message);
            }}
          />
        )}

        {/* Floating Toast Notification */}
        {toastMessage && (
          <div className="vault-floating-toast shadow-lg">
            {toastMessage}
          </div>
        )}

      </div>
    </div>
  );
}

export default CreatorVaultModal;
