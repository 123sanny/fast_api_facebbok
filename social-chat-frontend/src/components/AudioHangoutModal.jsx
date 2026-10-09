import React, { useState } from "react";
import { 
  BsX, BsMicFill, BsMicMuteFill, BsHandIndexThumbFill, 
  BsSoundwave
} from "react-icons/bs";
import "./css/AudioHangoutModal.css";

const MOCK_SPEAKERS = [
  { id: 1, name: "Aarav Sharma", avatar: "https://i.pravatar.cc/100?img=12", isHost: true, isSpeaking: true, role: "Host · AI Engineer" },
  { id: 2, name: "Pooja Verma", avatar: "https://i.pravatar.cc/100?img=45", isHost: false, isSpeaking: false, role: "Speaker · Designer" },
  { id: 3, name: "Kabir X", avatar: "https://i.pravatar.cc/100?img=60", isHost: false, isSpeaking: true, role: "Speaker · Gaming" }
];

const MOCK_LISTENERS = [
  { id: 4, name: "Vikram M.", avatar: "https://i.pravatar.cc/100?img=33" },
  { id: 5, name: "Ananya R.", avatar: "https://i.pravatar.cc/100?img=28" },
  { id: 6, name: "Sameer K.", avatar: "https://i.pravatar.cc/100?img=52" },
  { id: 7, name: "Deepak S.", avatar: "https://i.pravatar.cc/100?img=68" }
];

function AudioHangoutModal({ onClose }) {
  const [isMuted, setIsMuted] = useState(true);
  const [handRaised, setHandRaised] = useState(false);
  const [ambientSound, setAmbientSound] = useState("lofi"); // 'lofi', 'rain', 'cafe', 'off'
  const [activeSpeakerList] = useState(MOCK_SPEAKERS);

  const handleToggleHand = () => {
    setHandRaised(!handRaised);
  };

  return (
    <div className="audio-modal-overlay" onClick={onClose}>
      <div className="audio-modal-dialog shadow-lg" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="audio-modal-header">
          <div className="audio-title-left">
            <span className="live-wave-icon">
              <BsSoundwave size={22} className="text-primary" />
            </span>
            <div>
              <h4>Chill Coding & Design Lounge</h4>
              <span className="audio-room-meta">🎙️ 3 Speakers · 42 Listening · 3D Spatial Audio</span>
            </div>
          </div>
          <button className="audio-close-btn" onClick={onClose} aria-label="Close">
            <BsX size={26} />
          </button>
        </div>

        {/* Ambient Soundscape Bar */}
        <div className="audio-ambient-bar">
          <span className="ambient-label">🎧 Background Soundscape:</span>
          <div className="ambient-chips">
            <button 
              className={`amb-chip ${ambientSound === "lofi" ? "active" : ""}`}
              onClick={() => setAmbientSound("lofi")}
            >
              ☕ Lo-Fi Beats
            </button>
            <button 
              className={`amb-chip ${ambientSound === "rain" ? "active" : ""}`}
              onClick={() => setAmbientSound("rain")}
            >
              🌧️ Gentle Rain
            </button>
            <button 
              className={`amb-chip ${ambientSound === "cafe" ? "active" : ""}`}
              onClick={() => setAmbientSound("cafe")}
            >
              🥐 Cozy Cafe
            </button>
            <button 
              className={`amb-chip ${ambientSound === "off" ? "active" : ""}`}
              onClick={() => setAmbientSound("off")}
            >
              Off
            </button>
          </div>
        </div>

        {/* Room Stage (Speakers) */}
        <div className="audio-room-body">
          <h6 className="stage-heading">On Stage (Speakers)</h6>
          <div className="speakers-grid">
            {activeSpeakerList.map(sp => (
              <div key={sp.id} className={`speaker-card ${sp.isSpeaking ? "speaking-active" : ""}`}>
                <div className="speaker-avatar-wrap">
                  <img src={sp.avatar} alt={sp.name} className="speaker-avatar" />
                  {sp.isSpeaking && <div className="speaking-wave-ring"></div>}
                  <span className="speaker-mic-badge">
                    {sp.isSpeaking ? "🎙️" : "🔇"}
                  </span>
                </div>
                <strong>{sp.name}</strong>
                <small>{sp.role}</small>
              </div>
            ))}
          </div>

          {/* Listeners Grid */}
          <h6 className="stage-heading mt-3">Listeners in the Lounge (42)</h6>
          <div className="listeners-grid">
            {MOCK_LISTENERS.map(lis => (
              <div key={lis.id} className="listener-card">
                <img src={lis.avatar} alt={lis.name} className="listener-avatar" />
                <span>{lis.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Control Bar */}
        <div className="audio-bottom-bar">
          <button 
            className="btn btn-outline-danger btn-sm rounded-pill px-3"
            onClick={onClose}
          >
            ✌️ Leave Quietly
          </button>

          <div className="d-flex align-items-center gap-2 ms-auto">
            <button 
              className={`audio-hand-btn ${handRaised ? "active-hand" : ""}`}
              onClick={handleToggleHand}
              title="Raise hand to speak"
            >
              <BsHandIndexThumbFill size={16} className="me-1" />
              {handRaised ? "Hand Raised ✋" : "Raise Hand"}
            </button>

            <button 
              className={`audio-mic-btn ${!isMuted ? "mic-unmuted" : ""}`}
              onClick={() => setIsMuted(!isMuted)}
            >
              {isMuted ? (
                <>
                  <BsMicMuteFill size={18} className="me-1" /> Muted (Tap to Speak)
                </>
              ) : (
                <>
                  <BsMicFill size={18} className="me-1 text-danger" /> Live on Mic
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default AudioHangoutModal;
