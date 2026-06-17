import React from "react";
import { useNavigate } from "react-router-dom";
import {
  BsChevronLeft, BsChevronRight, BsCart3,
  BsList, BsStar, BsGrid3X3, BsShieldCheck,
  BsQuestionCircle, BsFileEarmarkText
} from "react-icons/bs";
import { FaMeta } from "react-icons/fa6";
import "./css/OrdersPayments.css";

const sections = [
  {
    title: "Balances",
    items: [
      { icon: <BsStar />, label: "Facebook Stars" },
    ]
  },
  {
    title: "Payment information",
    items: [
      { icon: <BsGrid3X3 />, label: "Subscriptions" },
    ]
  },
  {
    title: "Settings",
    items: [
      { icon: <BsShieldCheck />, label: "Security and controls" },
      { icon: <BsQuestionCircle />, label: "Help" },
      { icon: <BsFileEarmarkText />, label: "Terms and privacy" },
    ]
  },
];

const OrdersPayments = () => {
  const navigate = useNavigate();

  return (
    <div className="op-container">

      {/* Header */}
      <div className="op-header">
        <BsChevronLeft className="op-back" onClick={() => navigate(-1)} />
        <h3>Orders and payments</h3>
        <div className="op-header-right">
          <BsCart3 className="op-icon" />
          <BsList className="op-icon" />
        </div>
      </div>
      <div className="op-divider"></div>

      {/* Meta Pay Card */}
      <div className="op-meta-card">
        <div className="op-meta-top">
          <FaMeta className="op-meta-icon" />
          <span className="op-meta-text">Meta Pay</span>
        </div>
        <p>Transactions, credit cards, debit cards, delivery info, PayPal</p>
      </div>

      {/* Sections */}
      {sections.map((section, si) => (
        <div className="op-section" key={si}>
          <h4 className="op-section-title">{section.title}</h4>
          {section.items.map((item, ii) => (
            <div key={ii}>
              <div className="op-item">
                <div className="op-item-left">
                  <span className="op-item-icon">{item.icon}</span>
                  <strong>{item.label}</strong>
                </div>
                <BsChevronRight className="op-arrow" />
              </div>
              {ii < section.items.length - 1 && <div className="op-divider"></div>}
            </div>
          ))}
        </div>
      ))}

    </div>
  );
};

export default OrdersPayments;