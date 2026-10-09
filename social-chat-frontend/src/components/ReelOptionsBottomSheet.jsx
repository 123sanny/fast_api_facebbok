import React, { useState } from "react";
import { 
  BsPlusCircle, BsDashCircle, BsSpeedometer2, BsBadgeHd, 
  BsBadgeCc, BsArrowsAngleExpand, BsSkipEnd, BsFileEarmarkText, 
  BsTranslate, BsBookmark, BsBookmarkFill, BsLink45Deg, 
  BsExclamationCircle, BsChevronRight, BsArrowLeft, BsCheck2,
  BsX, BsCheckCircleFill
} from "react-icons/bs";
import "./css/ReelOptionsBottomSheet.css";

function ReelOptionsBottomSheet({
  isOpen,
  onClose,
  currentReel,
  playbackSpeed,
  setPlaybackSpeed,
  quality,
  setQuality,
  captionsEnabled,
  setCaptionsEnabled,
  isClearMode,
  setIsClearMode,
  autoScrollNext,
  setAutoScrollNext,
  isSaved,
  onToggleSave,
  onCopyLink,
  onInterested,
  onNotInterested
}) {
  const [currentView, setCurrentView] = useState("main"); // 'main' | 'speed' | 'quality' | 'audio' | 'report' | 'report_success'
  const [selectedReportReason, setSelectedReportReason] = useState(null);

  if (!isOpen) return null;

  const handleClose = () => {
    setCurrentView("main");
    setSelectedReportReason(null);
    onClose();
  };

  const handleSelectSpeed = (speed) => {
    setPlaybackSpeed(speed);
    setCurrentView("main");
  };

  const handleSelectQuality = (q) => {
    setQuality(q);
    setCurrentView("main");
  };

  const handleSubmitReport = () => {
    if (!selectedReportReason) return;
    setCurrentView("report_success");
  };

  return (
    <div className="fb-reel-options-overlay" onClick={handleClose}>
      <div 
        className="fb-reel-options-sheet shadow-2xl" 
        onClick={e => e.stopPropagation()}
      >
        {/* Top Centered Drag Handle */}
        <div className="fb-sheet-handle-bar">
          <div className="fb-sheet-handle"></div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* VIEW 1: MAIN OPTIONS LIST (Nexoria Interactive Sheet)        */}
        {/* ------------------------------------------------------------- */}
        {currentView === "main" && (
          <div className="fb-sheet-content-scroll">
            
            {/* GROUP 1: Feedback / Interest Group Card */}
            <div className="fb-sheet-group-card">
              <button 
                className="fb-sheet-row-btn"
                onClick={() => {
                  onInterested?.();
                  handleClose();
                }}
              >
                <div className="fb-sheet-icon-wrap text-dark-mode">
                  <BsPlusCircle size={22} />
                </div>
                <div className="fb-sheet-text-col">
                  <span className="fb-sheet-row-title">Interested</span>
                  <span className="fb-sheet-row-desc">More of your reels will be like this.</span>
                </div>
              </button>

              <button 
                className="fb-sheet-row-btn"
                onClick={() => {
                  onNotInterested?.();
                  handleClose();
                }}
              >
                <div className="fb-sheet-icon-wrap text-dark-mode">
                  <BsDashCircle size={22} />
                </div>
                <div className="fb-sheet-text-col">
                  <span className="fb-sheet-row-title">Not interested</span>
                  <span className="fb-sheet-row-desc">Fewer of your reels will be like this.</span>
                </div>
              </button>
            </div>

            {/* GROUP 2: Playback, Viewing & Audio Settings Card */}
            <div className="fb-sheet-group-card">
              {/* Playback Speed */}
              <button 
                className="fb-sheet-row-btn"
                onClick={() => setCurrentView("speed")}
              >
                <div className="fb-sheet-icon-wrap text-dark-mode">
                  <BsSpeedometer2 size={21} />
                </div>
                <div className="fb-sheet-text-col">
                  <span className="fb-sheet-row-title">Playback speed</span>
                </div>
                <div className="fb-sheet-right-action">
                  <span className="fb-sheet-badge-val">{playbackSpeed}x</span>
                  <BsChevronRight size={14} className="fb-sheet-chevron" />
                </div>
              </button>

              {/* Quality Settings */}
              <button 
                className="fb-sheet-row-btn"
                onClick={() => setCurrentView("quality")}
              >
                <div className="fb-sheet-icon-wrap text-dark-mode">
                  <BsBadgeHd size={22} />
                </div>
                <div className="fb-sheet-text-col">
                  <span className="fb-sheet-row-title">Quality settings</span>
                </div>
                <div className="fb-sheet-right-action">
                  <span className="fb-sheet-badge-val">{quality}</span>
                  <BsChevronRight size={14} className="fb-sheet-chevron" />
                </div>
              </button>

              {/* Captions Toggle */}
              <button 
                className="fb-sheet-row-btn"
                onClick={() => setCaptionsEnabled(!captionsEnabled)}
              >
                <div className="fb-sheet-icon-wrap text-dark-mode">
                  <BsBadgeCc size={22} />
                </div>
                <div className="fb-sheet-text-col">
                  <span className="fb-sheet-row-title">Captions</span>
                </div>
                <div className="fb-sheet-right-action">
                  <span className={`fb-sheet-pill-tag ${captionsEnabled ? "active" : ""}`}>
                    {captionsEnabled ? "ON" : "OFF"}
                  </span>
                </div>
              </button>

              {/* Clear Mode */}
              <button 
                className="fb-sheet-row-btn"
                onClick={() => {
                  setIsClearMode(true);
                  handleClose();
                }}
              >
                <div className="fb-sheet-icon-wrap text-dark-mode">
                  <BsArrowsAngleExpand size={19} />
                </div>
                <div className="fb-sheet-text-col">
                  <span className="fb-sheet-row-title">Clear mode</span>
                </div>
              </button>

              {/* Scroll to next reel automatically */}
              <button 
                className="fb-sheet-row-btn"
                onClick={() => setAutoScrollNext(!autoScrollNext)}
              >
                <div className="fb-sheet-icon-wrap text-dark-mode">
                  <BsSkipEnd size={22} />
                </div>
                <div className="fb-sheet-text-col">
                  <span className="fb-sheet-row-title">Scroll to next reel automatically</span>
                </div>
                <div className="fb-sheet-right-action">
                  <div className={`fb-toggle-switch ${autoScrollNext ? "checked" : ""}`}>
                    <div className="fb-toggle-knob"></div>
                  </div>
                </div>
              </button>

              {/* Transcript (Disabled/Informational row) */}
              <div className="fb-sheet-row-btn disabled-transcript-row">
                <div className="fb-sheet-icon-wrap text-muted">
                  <BsFileEarmarkText size={21} />
                </div>
                <div className="fb-sheet-text-col">
                  <span className="fb-sheet-row-title text-muted">Transcript</span>
                  <span className="fb-sheet-row-desc text-muted">The creator hasn't uploaded a transcript for this reel</span>
                </div>
              </div>

              {/* Audio and language */}
              <button 
                className="fb-sheet-row-btn"
                onClick={() => setCurrentView("audio")}
              >
                <div className="fb-sheet-icon-wrap text-dark-mode">
                  <BsTranslate size={21} />
                </div>
                <div className="fb-sheet-text-col">
                  <span className="fb-sheet-row-title">Audio and language</span>
                </div>
                <div className="fb-sheet-right-action">
                  <BsChevronRight size={14} className="fb-sheet-chevron" />
                </div>
              </button>
            </div>

            {/* GROUP 3: Save, Share, Safety & Report Card */}
            <div className="fb-sheet-group-card">
              {/* Save Reel */}
              <button 
                className="fb-sheet-row-btn"
                onClick={() => {
                  onToggleSave?.();
                  handleClose();
                }}
              >
                <div className="fb-sheet-icon-wrap text-dark-mode">
                  {isSaved ? <BsBookmarkFill size={21} className="text-primary" /> : <BsBookmark size={21} />}
                </div>
                <div className="fb-sheet-text-col">
                  <span className="fb-sheet-row-title">{isSaved ? "Saved in reels" : "Save reel"}</span>
                  <span className="fb-sheet-row-desc">Add this to your saved reels.</span>
                </div>
              </button>

              {/* Copy Link */}
              <button 
                className="fb-sheet-row-btn"
                onClick={() => {
                  onCopyLink?.();
                  handleClose();
                }}
              >
                <div className="fb-sheet-icon-wrap text-dark-mode">
                  <BsLink45Deg size={23} />
                </div>
                <div className="fb-sheet-text-col">
                  <span className="fb-sheet-row-title">Copy link</span>
                </div>
              </button>

              {/* Find support or report reel */}
              <button 
                className="fb-sheet-row-btn"
                onClick={() => setCurrentView("report")}
              >
                <div className="fb-sheet-icon-wrap text-dark-mode">
                  <BsExclamationCircle size={21} />
                </div>
                <div className="fb-sheet-text-col">
                  <span className="fb-sheet-row-title">Find support or report reel</span>
                  <span className="fb-sheet-row-desc">I'm concerned about this reel.</span>
                </div>
                <div className="fb-sheet-right-action">
                  <BsChevronRight size={14} className="fb-sheet-chevron" />
                </div>
              </button>
            </div>

          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* VIEW 2: PLAYBACK SPEED SUB-MENU                                */}
        {/* ------------------------------------------------------------- */}
        {currentView === "speed" && (
          <div className="fb-sheet-subview">
            <div className="fb-sheet-sub-header">
              <button className="fb-sheet-back-btn" onClick={() => setCurrentView("main")}>
                <BsArrowLeft size={20} />
              </button>
              <h5>Playback speed</h5>
              <button className="fb-sheet-close-btn" onClick={handleClose}>
                <BsX size={22} />
              </button>
            </div>

            <div className="fb-sheet-group-card mt-2">
              {[
                { val: 0.5, label: "0.5x" },
                { val: 0.75, label: "0.75x" },
                { val: 1, label: "1x (Normal)" },
                { val: 1.25, label: "1.25x" },
                { val: 1.5, label: "1.5x" },
                { val: 2, label: "2x" }
              ].map(item => (
                <button
                  key={item.val}
                  className="fb-sheet-choice-row"
                  onClick={() => handleSelectSpeed(item.val)}
                >
                  <span className="choice-label">{item.label}</span>
                  {playbackSpeed === item.val && <BsCheck2 size={20} className="text-primary choice-check" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* VIEW 3: QUALITY SETTINGS SUB-MENU                             */}
        {/* ------------------------------------------------------------- */}
        {currentView === "quality" && (
          <div className="fb-sheet-subview">
            <div className="fb-sheet-sub-header">
              <button className="fb-sheet-back-btn" onClick={() => setCurrentView("main")}>
                <BsArrowLeft size={20} />
              </button>
              <h5>Quality settings</h5>
              <button className="fb-sheet-close-btn" onClick={handleClose}>
                <BsX size={22} />
              </button>
            </div>

            <div className="fb-sheet-group-card mt-2">
              {[
                { id: "Auto", title: "Auto (Recommended)", desc: "Adjusts to give you the best experience for your network conditions." },
                { id: "1080p HD", title: "High Quality (1080p HD)", desc: "Uses more data." },
                { id: "720p HD", title: "Standard HD (720p)", desc: "Balanced video quality." },
                { id: "480p", title: "Medium Quality (480p)", desc: "Smooth streaming on mobile data." },
                { id: "Data Saver", title: "Data Saver (360p)", desc: "Reduces video quality to save cellular bandwidth." }
              ].map(item => (
                <button
                  key={item.id}
                  className="fb-sheet-choice-row has-desc"
                  onClick={() => handleSelectQuality(item.id)}
                >
                  <div className="choice-text-col">
                    <span className="choice-title">{item.title}</span>
                    <span className="choice-sub">{item.desc}</span>
                  </div>
                  {quality === item.id && <BsCheck2 size={20} className="text-primary choice-check" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* VIEW 4: AUDIO AND LANGUAGE SUB-MENU                           */}
        {/* ------------------------------------------------------------- */}
        {currentView === "audio" && (
          <div className="fb-sheet-subview">
            <div className="fb-sheet-sub-header">
              <button className="fb-sheet-back-btn" onClick={() => setCurrentView("main")}>
                <BsArrowLeft size={20} />
              </button>
              <h5>Audio and language</h5>
              <button className="fb-sheet-close-btn" onClick={handleClose}>
                <BsX size={22} />
              </button>
            </div>

            <div className="fb-sheet-group-card mt-2">
              <div className="audio-detail-banner">
                <div className="audio-disc-icon">🎵</div>
                <div>
                  <h6 className="m-0 font-weight-bold">{currentReel?.songTitle || "Original Audio"}</h6>
                  <p className="m-0 text-muted small">Original Sound by {currentReel?.creatorName || "Creator"}</p>
                </div>
              </div>

              <hr className="fb-sheet-divider" />

              <div className="p-3">
                <span className="fb-sheet-sub-title">Audio Tracks & Dubbing</span>
                <div className="mt-2 d-flex flex-column gap-2">
                  <div className="audio-track-item active">
                    <span>English (Original Audio Track)</span>
                    <span className="badge bg-primary">Active</span>
                  </div>
                  <div className="audio-track-item">
                    <span>Hindi (AI Neural Dub)</span>
                    <span className="badge bg-secondary">Available</span>
                  </div>
                  <div className="audio-track-item">
                    <span>Spanish (AI Neural Dub)</span>
                    <span className="badge bg-secondary">Available</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* VIEW 5: REPORT REEL SUB-MENU                                  */}
        {/* ------------------------------------------------------------- */}
        {currentView === "report" && (
          <div className="fb-sheet-subview">
            <div className="fb-sheet-sub-header">
              <button className="fb-sheet-back-btn" onClick={() => setCurrentView("main")}>
                <BsArrowLeft size={20} />
              </button>
              <h5>Report this reel</h5>
              <button className="fb-sheet-close-btn" onClick={handleClose}>
                <BsX size={22} />
              </button>
            </div>

            <p className="report-intro-text">
              Why are you reporting this reel? Your feedback helps keep the Nexoria community safe.
            </p>

            <div className="fb-sheet-group-card">
              {[
                "Nudity or sexual activity",
                "Hate speech or symbols",
                "Violence or dangerous content",
                "Bullying or harassment",
                "False information or scam",
                "Spam or misleading metadata",
                "Intellectual property violation",
                "I just don't like it"
              ].map((reason) => (
                <button
                  key={reason}
                  className={`fb-sheet-choice-row ${selectedReportReason === reason ? "selected-reason" : ""}`}
                  onClick={() => setSelectedReportReason(reason)}
                >
                  <span className="choice-label">{reason}</span>
                  <div className={`radio-dot ${selectedReportReason === reason ? "active" : ""}`}></div>
                </button>
              ))}
            </div>

            <div className="p-3">
              <button 
                className="btn-submit-report w-100"
                disabled={!selectedReportReason}
                onClick={handleSubmitReport}
              >
                Submit Report
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* VIEW 6: REPORT SUBMITTED SUCCESS                              */}
        {/* ------------------------------------------------------------- */}
        {currentView === "report_success" && (
          <div className="fb-sheet-subview p-4 text-center">
            <BsCheckCircleFill size={54} className="text-success mb-3 mt-2" />
            <h5 className="font-weight-bold">Thanks for letting us know</h5>
            <p className="text-muted small mb-4">
              We use these reports to train our safety algorithms and review violations of our Community Guidelines.
            </p>
            <button className="btn btn-primary w-100 py-2 rounded-pill font-weight-bold" onClick={handleClose}>
              Done
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

export default ReelOptionsBottomSheet;
