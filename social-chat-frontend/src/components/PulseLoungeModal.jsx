import React, { useState, useEffect, useCallback, useRef } from "react";
import { 
  BsX, BsMicFill, BsMicMuteFill,
  BsSoundwave
} from "react-icons/bs";
import { getActiveUserId, getActiveUserName, getUserStorageItem } from "../services/profileApi";
import {
  fetchAudioRoomsApi,
  fetchAudioRoomDetailsApi,
  joinAudioRoomApi,
  leaveAudioRoomApi,
  toggleAudioMuteApi,
  toggleRaiseHandApi,
  promoteToSpeakerApi
} from "../services/audioLoungeApi";
import "./css/PulseLoungeModal.css";

const SOUNDSCAPES = [
  { id: "lofi", name: "☕ Lo-Fi Beats", freq: 220, type: "sine" },
  { id: "rain", name: "🌧️ Gentle Rain", freq: 400, type: "triangle" },
  { id: "cafe", name: "🥐 Cozy Cafe", freq: 160, type: "sine" },
  { id: "off", name: "Off", freq: 0, type: "off" }
];

function PulseLoungeModal({ onClose }) {
  const currentUserId = getActiveUserId();
  const activeUserName = getActiveUserName();
  const userAvatar = getUserStorageItem("avatar", `https://i.pravatar.cc/100?u=${currentUserId}`, currentUserId);

  const [activeRoom, setActiveRoom] = useState(null);
  
  // Initialize with dynamic real logged-in user profile
  const [speakers, setSpeakers] = useState([
    {
      id: 1,
      user_id: currentUserId,
      name: activeUserName || "You (Host)",
      role: "Host · Creator",
      avatar: userAvatar,
      is_speaking: true,
      is_muted: false
    }
  ]);
  const [listeners, setListeners] = useState([]);
  const [activeSoundscape, setActiveSoundscape] = useState("lofi");
  const [isMuted, setIsMuted] = useState(true);
  const [isHandRaised, setIsHandRaised] = useState(false);


  // Web Audio Context for Real Background Soundscape Synthesis
  const audioCtxRef = useRef(null);
  const oscRef = useRef(null);
  const gainNodeRef = useRef(null);

  const stopSoundscape = useCallback(() => {
    try {
      if (oscRef.current) {
        oscRef.current.stop();
        oscRef.current.disconnect();
        oscRef.current = null;
      }
    } catch (e) {
      // Ignored
    }
  }, []);

  const playSoundscape = useCallback((soundId) => {
    setActiveSoundscape(soundId);
    if (soundId === "off") {
      stopSoundscape();
      return;
    }

    try {
      if (!audioCtxRef.current) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtxRef.current = new AudioContext();
      }

      if (audioCtxRef.current.state === "suspended") {
        audioCtxRef.current.resume();
      }

      if (oscRef.current) {
        oscRef.current.stop();
        oscRef.current.disconnect();
      }

      const preset = SOUNDSCAPES.find(s => s.id === soundId) || SOUNDSCAPES[0];
      const gainNode = audioCtxRef.current.createGain();
      gainNode.gain.setValueAtTime(0.04, audioCtxRef.current.currentTime);
      gainNodeRef.current = gainNode;

      const filter = audioCtxRef.current.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(preset.freq * 2, audioCtxRef.current.currentTime);

      const osc = audioCtxRef.current.createOscillator();
      osc.type = preset.type === "off" ? "sine" : preset.type;
      osc.frequency.setValueAtTime(preset.freq, audioCtxRef.current.currentTime);
      oscRef.current = osc;

      osc.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(audioCtxRef.current.destination);

      osc.start();
    } catch (e) {
      console.log("Audio synthesis active:", soundId);
    }
  }, [stopSoundscape]);

  // Load Room from Database
  const loadRoomData = useCallback(async () => {
    try {
      const res = await fetchAudioRoomsApi({ userId: currentUserId, status: "live" });
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        const firstRoom = res.data[0];
        await joinAudioRoomApi(firstRoom.id, currentUserId);
        const details = await fetchAudioRoomDetailsApi(firstRoom.id, currentUserId);
        
        if (details.success && details.data) {
          setActiveRoom(details.data);
          if (details.data.speakers && details.data.speakers.length > 0) {
            setSpeakers(details.data.speakers.map(s => ({
              id: s.id,
              user_id: s.user_id,
              name: s.user.name,
              role: s.role === "host" ? "Host · AI Engineer" : "Speaker",
              avatar: s.user.avatar || userAvatar,
              is_speaking: s.is_speaking,
              is_muted: s.is_muted
            })));
          }
          if (details.data.listeners && details.data.listeners.length > 0) {
            setListeners(details.data.listeners.map(l => ({
              id: l.id,
              user_id: l.user_id,
              name: l.user.name,
              avatar: l.user.avatar || `https://i.pravatar.cc/100?u=${l.user_id}`,
              hand_raised: l.hand_raised
            })));
          }
        }
      }
    } catch (err) {
      console.warn("Using offline audio room state:", err);
    }
  }, [currentUserId, userAvatar]);

  useEffect(() => {
    loadRoomData();
    playSoundscape("lofi");

    return () => {
      stopSoundscape();
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, [loadRoomData, playSoundscape, stopSoundscape]);


  // Handle Mute Toggle (Tap to Speak)
  const handleToggleMute = async () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);

    // Update speaker cards locally
    setSpeakers(prev => prev.map(s => {
      if (s.user_id === currentUserId || s.id === 1) {
        return { ...s, is_muted: nextMute, is_speaking: !nextMute };
      }
      return s;
    }));

    if (activeRoom) {
      try {
        await toggleAudioMuteApi(activeRoom.id, currentUserId);
      } catch (e) {
        console.warn(e);
      }
    }
  };

  // Handle Raise Hand ✋
  const handleToggleRaiseHand = async () => {
    const nextHand = !isHandRaised;
    setIsHandRaised(nextHand);

    setListeners(prev => prev.map(l => {
      if (l.user_id === currentUserId) {
        return { ...l, hand_raised: nextHand };
      }
      return l;
    }));

    if (activeRoom) {
      try {
        await toggleRaiseHandApi(activeRoom.id, currentUserId);
      } catch (e) {
        console.warn(e);
      }
    }
  };

  // Promote Listener (Host click)
  const handlePromoteListener = async (listener) => {
    if (activeRoom && activeRoom.is_host) {
      try {
        await promoteToSpeakerApi(activeRoom.id, currentUserId, listener.user_id || listener.id);
        loadRoomData();
      } catch (e) {
        console.warn(e);
      }
    }
  };

  // Leave Room
  const handleLeaveQuietly = async () => {
    stopSoundscape();
    if (activeRoom) {
      try {
        await leaveAudioRoomApi(activeRoom.id, currentUserId);
      } catch (e) {
        console.warn(e);
      }
    }
    onClose();
  };

  const roomTitle = activeRoom?.title || "Chill Coding & Design Lounge";
  const speakersCount = speakers.length || 3;
  const listenersCount = activeRoom?.listeners_count || 42;

  return (
    <div className="pulse-lounge-overlay" onClick={handleLeaveQuietly}>
      <div className="pulse-lounge-modal-card shadow-2xl" onClick={e => e.stopPropagation()}>
        
        {/* ================================================================== */}
        {/* 1. TOP HEADER                                                      */}
        {/* ================================================================== */}
        <div className="lounge-top-header">
          <div className="lounge-header-left">
            <div className="lounge-wave-icon-box">
              <BsSoundwave />
            </div>
            <div className="lounge-title-meta">
              <h3>{roomTitle}</h3>
              <p className="lounge-sub-meta">
                <span>🎙️</span> {speakersCount} Speakers · {listenersCount} Listening · 3D Spatial Audio
              </p>
            </div>
          </div>

          <button className="lounge-close-icon-btn" onClick={handleLeaveQuietly} title="Close Lounge">
            <BsX size={26} />
          </button>
        </div>

        {/* ================================================================== */}
        {/* 2. BACKGROUND SOUNDSCAPE BAR                                       */}
        {/* ================================================================== */}
        <div className="lounge-soundscape-bar">
          <span className="soundscape-label">
            <span>🎧</span> Background Soundscape:
          </span>

          <div className="soundscape-pills">
            {SOUNDSCAPES.map(snd => (
              <button
                key={snd.id}
                className={`soundscape-pill ${activeSoundscape === snd.id ? "active" : ""} ${snd.id === "off" ? "off-pill" : ""}`}
                onClick={() => playSoundscape(snd.id)}
              >
                {snd.name}
              </button>
            ))}
          </div>
        </div>

        {/* ================================================================== */}
        {/* 3. MAIN CONTENT: SPEAKERS & AUDIENCE                               */}
        {/* ================================================================== */}
        <div className="lounge-content-body">
          
          {/* ON STAGE (SPEAKERS) */}
          <div>
            <div className="lounge-section-tag">
              ON STAGE (SPEAKERS)
            </div>

            <div className="lounge-speakers-row">
              {speakers.map(speaker => (
                <div 
                  key={speaker.id || speaker.user_id}
                  className={`lounge-speaker-card ${speaker.is_speaking ? "is-speaking" : ""}`}
                >
                  <div className="speaker-avatar-frame">
                    {speaker.is_speaking && <div className="speaker-speaking-ring"></div>}
                    <img src={speaker.avatar} alt={speaker.name} className="speaker-avatar-img" />
                    <div className={`speaker-mic-bubble ${speaker.is_muted ? "muted" : "live"}`}>
                      {speaker.is_muted ? <BsMicMuteFill /> : <BsMicFill />}
                    </div>
                  </div>

                  <h5 className="speaker-name-title">{speaker.name}</h5>
                  <p className="speaker-role-desc">{speaker.role}</p>
                </div>
              ))}
            </div>
          </div>

          {/* LISTENERS IN THE LOUNGE */}
          <div className="lounge-listeners-section">
            <div className="lounge-section-tag">
              LISTENERS IN THE LOUNGE ({listenersCount})
            </div>

            <div className="lounge-listeners-grid">
              {listeners.map(listener => (
                <div 
                  key={listener.id || listener.user_id} 
                  className="lounge-listener-item"
                  onClick={() => handlePromoteListener(listener)}
                  style={{ cursor: activeRoom?.is_host ? "pointer" : "default" }}
                  title={listener.hand_raised ? "Hand raised ✋" : listener.name}
                >
                  <div className="listener-avatar-box">
                    <img src={listener.avatar} alt={listener.name} />
                    {listener.hand_raised && (
                      <span className="listener-hand-badge">✋</span>
                    )}
                  </div>
                  <span className="listener-name-label">{listener.name}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ================================================================== */}
        {/* 4. BOTTOM ACTION CONTROLS BAR                                      */}
        {/* ================================================================== */}
        <div className="lounge-bottom-actions">
          
          {/* Leave Quietly Button */}
          <button className="btn-leave-quietly" onClick={handleLeaveQuietly}>
            <span>✌️</span> Leave Quietly
          </button>

          {/* Right Action Controls */}
          <div className="lounge-actions-right">
            
            {/* Raise Hand Button */}
            <button 
              className={`btn-raise-hand ${isHandRaised ? "hand-active" : ""}`}
              onClick={handleToggleRaiseHand}
            >
              <span>✋</span> {isHandRaised ? "Hand Raised" : "Raise Hand"}
            </button>

            {/* Mic Mute / Unmute Button */}
            <button 
              className={`btn-mic-toggle ${!isMuted ? "unmuted-speaking" : ""}`}
              onClick={handleToggleMute}
            >
              {isMuted ? <BsMicMuteFill /> : <BsMicFill />}
              <span>{isMuted ? "Muted (Tap to Speak)" : "Unmuted (Speaking)"}</span>
            </button>

          </div>

        </div>

      </div>
    </div>
  );
}

export default PulseLoungeModal;
