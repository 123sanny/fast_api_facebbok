import React from "react";
import { BsExclamationTriangle } from "react-icons/bs";
import { BsBugFill } from "react-icons/bs";
import "./css/ReportModal.css";

const ReportModal = ({ onClose }) => {
  return (
    <div className="report-overlay" onClick={onClose}>
      <div className="report-sheet" onClick={e => e.stopPropagation()}>
        <div className="report-handle"></div>

        {/* Top Section */}
        <div className="report-top">
          <h2>Go back to where you saw an issue and shake your phone</h2>
          <p>Did you encounter a problem? Please shake your phone where you see it to help us find and fix the issue faster.</p>
          <img src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" alt="shake phone" className="report-shake-img" />
          <button className="report-ok-btn" onClick={onClose}>OK</button>
        </div>

        <div className="report-divider"></div>

        <div className="report-option">
          <div className="report-icon-circle">
            <BsExclamationTriangle />
          </div>
          <div>
            <strong>Reports about abuse or spam shouldn't be submitted here</strong>
            <p>Learn how to report abuse or spam. This includes things such as violence, criminal behaviour, offensive content and safety issues.</p>
          </div>
        </div>

        <div className="report-divider"></div>

        <div className="report-option">
          <div className="report-icon-circle">
            <BsBugFill />
          </div>
          <strong>Continue to report a problem</strong>
        </div>

        <div className="report-divider"></div>

        <div className="report-toggle-item">
          <div>
            <strong>Shake phone to report a problem</strong>
            <p className="report-learn">Learn more</p>
          </div>
          <div className="report-toggle on"></div>
        </div>

        <div className="report-toggle-item">
          <div>
            <strong>Show button to report a problem</strong>
            <p>Available on selected screens only. Displays a small button on-screen that can be repositioned by dragging.</p>
          </div>
          <div className="report-toggle on"></div>
        </div>

      </div>
    </div>
  );
};

export default ReportModal;