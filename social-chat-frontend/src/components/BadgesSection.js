import React from "react";
import "./css/BadgesSection.css";
import { BsShieldCheck } from "react-icons/bs";

function BadgesSection() {
  return (
    <div className="bs-wrapper">
      <div className="bs-item">
        <div className="bs-icon">
          <BsShieldCheck size={24} />
        </div>
        <p className="bs-text">You haven't earned any badges this week.</p>
      </div>
    </div>
  );
}

export default BadgesSection;
