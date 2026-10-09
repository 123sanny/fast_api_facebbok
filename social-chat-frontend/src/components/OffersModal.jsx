import React, { useState } from "react";
import { BsPlus, BsTrash, BsTag } from "react-icons/bs";
import "./css/HobbiesModal.css";

function OffersModal({ initialOffers = [], onClose, onSave }) {
  const [offers, setOffers] = useState(initialOffers);
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [discountCode, setDiscountCode] = useState("");

  const handleAdd = (e) => {
    e.preventDefault();
    if (title.trim() && link.trim()) {
      setOffers(prev => [...prev, {
        id: Date.now(),
        title: title.trim(),
        link: link.trim(),
        discountCode: discountCode.trim()
      }]);
      setTitle("");
      setLink("");
      setDiscountCode("");
    }
  };

  const handleRemove = (id) => {
    setOffers(prev => prev.filter(o => o.id !== id));
  };

  const handleSave = () => {
    if (onSave) onSave(offers);
    onClose();
  };

  return (
    <div className="hbm-overlay" onClick={onClose}>
      <div className="hbm-card" onClick={(e) => e.stopPropagation()}>
        <div className="hbm-header">
          <button className="hbm-close" onClick={onClose}>✕</button>
          <h2>Promotions & Offers</h2>
          <div style={{ width: 24 }} />
        </div>

        <div className="hbm-body">
          <p style={{ margin: 0, fontSize: 13.5, color: "var(--color-text-secondary)" }}>
            Share affiliate deals, brand discount promo codes, or limited-time promotional offers with your followers.
          </p>

          <form onSubmit={handleAdd} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input
              style={{
                padding: "10px 14px",
                borderRadius: 10,
                border: "1px solid var(--color-border)",
                background: "var(--color-bg)",
                color: "var(--color-text)",
                outline: "none",
                fontSize: 14.5
              }}
              placeholder="Offer Title (e.g. 20% Off Hosting / My Merch)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <input
              style={{
                padding: "10px 14px",
                borderRadius: 10,
                border: "1px solid var(--color-border)",
                background: "var(--color-bg)",
                color: "var(--color-text)",
                outline: "none",
                fontSize: 14.5
              }}
              placeholder="Affiliate or Promo URL (https://...)"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              required
            />
            <div style={{ display: "flex", gap: 8 }}>
              <input
                style={{
                  flex: 1,
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "1px solid var(--color-border)",
                  background: "var(--color-bg)",
                  color: "var(--color-text)",
                  outline: "none",
                  fontSize: 14.5
                }}
                placeholder="Discount Code (Optional, e.g. SAVE20)"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
              />
              <button
                type="submit"
                disabled={!title.trim() || !link.trim()}
                style={{
                  padding: "10px 16px",
                  borderRadius: 10,
                  background: title.trim() && link.trim() ? "var(--color-primary)" : "var(--color-bg-hover)",
                  color: title.trim() && link.trim() ? "#fff" : "var(--color-text-secondary)",
                  border: "none",
                  cursor: title.trim() && link.trim() ? "pointer" : "default",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 4
                }}
              >
                <BsPlus size={18} /> Add
              </button>
            </div>
          </form>

          <div>
            <div className="hbm-section-title">Active Offers ({offers.length})</div>
            {offers.length === 0 ? (
              <p style={{ color: "var(--color-text-secondary)", fontSize: 14, marginTop: 8 }}>
                No active promotions. Add your affiliate or discount links above.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
                {offers.map((off) => (
                  <div
                    key={off.id}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      padding: "12px 14px",
                      borderRadius: 10,
                      background: "var(--color-bg)",
                      border: "1px solid var(--color-border)"
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 600, fontSize: 14.5 }}>
                        <BsTag size={15} color="var(--color-primary)" /> {off.title}
                      </div>
                      <div style={{ fontSize: 13, color: "var(--color-primary)", marginTop: 2 }}>{off.link}</div>
                      {off.discountCode && (
                        <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 2 }}>
                          Code: <strong>{off.discountCode}</strong>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemove(off.id)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--color-danger, #e41e3f)",
                        cursor: "pointer",
                        padding: 4
                      }}
                    >
                      <BsTrash size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="hbm-footer">
          <button className="hbm-save-btn" onClick={handleSave}>
            Save Offers ({offers.length})
          </button>
        </div>
      </div>
    </div>
  );
}

export default OffersModal;
