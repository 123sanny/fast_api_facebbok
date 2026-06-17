import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BsChevronLeft } from "react-icons/bs";
import "./css/DeviceLogin.css";

const DeviceLogin = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState("");

  return (
    <div className="dl-container">

      {/* Header */}
      <div className="dl-header">
        <BsChevronLeft className="dl-back" onClick={() => navigate(-1)} />
        <h3>Device login requests</h3>
        <div style={{ width: 24 }}></div>
      </div>
      <div className="dl-divider"></div>

      {/* Content */}
      <div className="dl-content">
        <h2>Login requests</h2>
        <p className="dl-desc">
          You can see or approve login requests from apps on TVs or devices here.
          Only continue if you are trying to log in with Facebook.
        </p>

        <h4>Enter code</h4>

        <input
          type="text"
          className="dl-input"
          value={code}
          onChange={e => setCode(e.target.value)}
          placeholder=""
        />

        <p className="dl-trust">Only use a code from a source that you trust.</p>

        <button
          className={`dl-btn ${code.trim() ? "active" : ""}`}
          disabled={!code.trim()}
        >
          Approve
        </button>
      </div>

    </div>
  );
};

export default DeviceLogin;