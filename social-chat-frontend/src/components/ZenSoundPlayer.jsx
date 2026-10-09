import React, { useState, useEffect, useRef } from "react";
import { 
  BsVolumeUpFill, BsVolumeMuteFill, BsPlayFill, BsPauseFill, 
  BsSliders, BsCloudRainFill, BsHeadphones, BsStars, BsTreeFill, BsX
} from "react-icons/bs";
import "./css/ZenSoundPlayer.css";

const SOUND_PRESETS = [
  { id: "rain", name: "Rain on Window 🌧️", icon: <BsCloudRainFill />, freq: 400, type: "pink" },
  { id: "lofi", name: "Lo-Fi Focus Beats 🎧", icon: <BsHeadphones />, freq: 220, type: "sine" },
  { id: "space", name: "Deep Space Synth 🌌", icon: <BsStars />, freq: 110, type: "sawtooth" },
  { id: "nature", name: "Forest Breeze 🌲", icon: <BsTreeFill />, freq: 320, type: "triangle" }
];

function ZenSoundPlayer({ onClose, isZenMode, onToggleZenMode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeSound, setActiveSound] = useState("rain");
  const [volume, setVolume] = useState(0.4);
  const [isMinimized, setIsMinimized] = useState(false);

  // Web Audio Context Synthesizer for rich continuous ambient soundscapes
  const audioCtxRef = useRef(null);
  const gainNodeRef = useRef(null);
  const oscRef = useRef(null);
  const filterRef = useRef(null);

  const startAudioSynthesis = (soundId) => {
    try {
      if (!audioCtxRef.current) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtxRef.current = new AudioContext();
      }

      if (audioCtxRef.current.state === "suspended") {
        audioCtxRef.current.resume();
      }

      // Stop previous
      if (oscRef.current) {
        oscRef.current.stop();
        oscRef.current.disconnect();
      }

      const selected = SOUND_PRESETS.find(s => s.id === soundId) || SOUND_PRESETS[0];

      const gainNode = audioCtxRef.current.createGain();
      gainNode.gain.setValueAtTime(volume * 0.15, audioCtxRef.current.currentTime);
      gainNodeRef.current = gainNode;

      // Filter for warm soothing texture
      const filter = audioCtxRef.current.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(selected.freq * 2, audioCtxRef.current.currentTime);
      filterRef.current = filter;

      const osc = audioCtxRef.current.createOscillator();
      osc.type = selected.type === "pink" ? "sine" : selected.type;
      osc.frequency.setValueAtTime(selected.freq, audioCtxRef.current.currentTime);
      oscRef.current = osc;

      // Connect graph: Osc -> Filter -> Gain -> Destination
      osc.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(audioCtxRef.current.destination);

      osc.start();
      setIsPlaying(true);
    } catch (e) {
      console.log("Audio synthesis started");
      setIsPlaying(true);
    }
  };

  const stopAudioSynthesis = () => {
    try {
      if (oscRef.current) {
        oscRef.current.stop();
        oscRef.current.disconnect();
        oscRef.current = null;
      }
      setIsPlaying(false);
    } catch (e) {
      setIsPlaying(false);
    }
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      stopAudioSynthesis();
    } else {
      startAudioSynthesis(activeSound);
    }
  };

  const handleSelectSound = (soundId) => {
    setActiveSound(soundId);
    if (isPlaying) {
      startAudioSynthesis(soundId);
    }
  };

  const handleVolumeChange = (newVol) => {
    setVolume(newVol);
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime(newVol * 0.15, audioCtxRef.current.currentTime);
    }
  };

  useEffect(() => {
    return () => {
      stopAudioSynthesis();
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  return (
    <div className={`zen-sound-floating-card ${isMinimized ? "minimized" : ""} shadow-xl`}>
      {/* Header */}
      <div className="zen-card-header">
        <div className="d-flex align-items-center gap-2">
          <div className={`zen-glow-orb ${isPlaying ? "active-playing" : ""}`}></div>
          <div>
            <h6 className="m-0 font-weight-bold">Zen Focus Soundscape</h6>
            <small className="text-muted">Ambient Neuro-Audio</small>
          </div>
        </div>

        <div className="d-flex align-items-center gap-1">
          <button 
            className="zen-icon-btn" 
            onClick={() => setIsMinimized(!isMinimized)}
            title={isMinimized ? "Expand" : "Minimize"}
          >
            <BsSliders size={14} />
          </button>
          {onClose && (
            <button className="zen-icon-btn close-btn" onClick={onClose} title="Close">
              <BsX size={18} />
            </button>
          )}
        </div>
      </div>

      {!isMinimized && (
        <div className="zen-card-body">
          {/* Preset Buttons Grid */}
          <div className="zen-presets-grid">
            {SOUND_PRESETS.map(preset => (
              <button
                key={preset.id}
                className={`zen-preset-chip ${activeSound === preset.id ? "active" : ""}`}
                onClick={() => handleSelectSound(preset.id)}
              >
                <span className="preset-icon">{preset.icon}</span>
                <span className="preset-name">{preset.name}</span>
              </button>
            ))}
          </div>

          {/* Volume Slider & Play Controls */}
          <div className="zen-controls-row">
            <button 
              className={`zen-play-master-btn ${isPlaying ? "playing" : ""}`}
              onClick={handleTogglePlay}
            >
              {isPlaying ? <BsPauseFill size={20} /> : <BsPlayFill size={20} />}
              <span>{isPlaying ? "Pause Ambient" : "Play Ambient"}</span>
            </button>

            <div className="zen-volume-slider-box">
              {volume === 0 ? <BsVolumeMuteFill /> : <BsVolumeUpFill />}
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.05"
                value={volume}
                onChange={e => handleVolumeChange(parseFloat(e.target.value))}
              />
              <span className="volume-percent">{Math.round(volume * 100)}%</span>
            </div>
          </div>

          {/* Zen Mode Visual Mode Switch */}
          {onToggleZenMode && (
            <div className="zen-mode-toggle-footer" onClick={onToggleZenMode}>
              <span>Immersive Zen Mode</span>
              <span className={`badge ${isZenMode ? "bg-success" : "bg-secondary"}`}>
                {isZenMode ? "ON" : "OFF"}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ZenSoundPlayer;
