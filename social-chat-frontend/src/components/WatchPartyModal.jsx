import React, { useState, useEffect, useRef } from "react";
import { 
  BsX, BsVolumeMuteFill, BsVolumeUpFill, BsPlayFill, BsPauseFill,
  BsMicFill, BsMicMuteFill, BsCheckCircleFill, BsBroadcast
} from "react-icons/bs";
import { getActiveUserName } from "../services/profileApi";
import { fetchWatchPartyStateApi, sendWatchPartyChatApi } from "../services/reelsApi";
import "./css/WatchPartyModal.css";

const DEFAULT_VIDEO = {
  id: "wp-default",
  title: "Building an Autonomous AI Agent Ecosystem from Scratch | Masterclass 2026",
  creatorName: "Nexoria Tech Hub",
  videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  thumbnail: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1000"
};

function WatchPartyModal({ video = DEFAULT_VIDEO, partyId = "general", onClose }) {
  const currentUserName = getActiveUserName() || "You";
  const activeVideo = video || DEFAULT_VIDEO;

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [syncedViewers, setSyncedViewers] = useState(8);
  const [chatMessages, setChatMessages] = useState([
    { id: 1, user: "Aarav S.", text: "Bro check out that drone transition at 0:42! 🔥", time: "10:14" },
    { id: 2, user: "Pooja V.", text: "Color grading is unreal ✨", time: "10:15" },
    { id: 3, user: "Kabir X.", text: "Synced audio sounds crisp on headphones 🎧", time: "10:15" }
  ]);
  const [inputMsg, setInputMsg] = useState("");
  const [flyingEmojis, setFlyingEmojis] = useState([]);
  
  const videoRef = useRef(null);
  const chatScrollRef = useRef(null);

  // Sync Watch Party Room State
  useEffect(() => {
    let isMounted = true;
    const syncState = async () => {
      const res = await fetchWatchPartyStateApi(partyId);
      if (isMounted && res && res.success) {
        if (Array.isArray(res.messages) && res.messages.length > 0) {
          setChatMessages(res.messages);
        }
        if (res.viewers_count) {
          setSyncedViewers(res.viewers_count);
        }
      }
    };

    syncState();
    const interval = setInterval(syncState, 4000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [partyId]);

  const handleSendChat = async (e) => {
    e?.preventDefault();
    if (!inputMsg.trim()) return;

    const newMsg = {
      id: Date.now(),
      user: currentUserName,
      text: inputMsg.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setChatMessages((prev) => [...prev, newMsg]);
    setInputMsg("");

    setTimeout(() => {
      if (chatScrollRef.current) {
        chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
      }
    }, 50);

    await sendWatchPartyChatApi(partyId, currentUserName, newMsg.text);
  };

  const handleReactionBurst = (emoji) => {
    const id = Date.now() + Math.random();
    setFlyingEmojis((prev) => [...prev, { id, emoji, left: Math.floor(15 + Math.random() * 70) }]);
    setTimeout(() => {
      setFlyingEmojis((prev) => prev.filter((e) => e.id !== id));
    }, 1600);
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play().catch((e) => console.warn(e));
        setIsPlaying(true);
      }
    }
  };

  return (
    <div className="party-modal-overlay" onClick={onClose}>
      <div className="party-modal-dialog shadow-2xl" onClick={(e) => e.stopPropagation()}>
        
        {/* Top Header */}
        <div className="party-modal-header">
          <div className="party-header-left">
            <span className="live-pulse-dot"></span>
            <span className="party-badge"><BsBroadcast className="me-1" /> LIVE SYNC</span>
            <div className="party-title-col">
              <h4>Watch Party Lounge</h4>
              <span className="party-video-name">{activeVideo.title || "Synchronized Video Stream"}</span>
            </div>
          </div>
          <div className="party-header-right">
            <span className="synced-count-pill">
              <span className="dot-green"></span> {syncedViewers} Friends Synced
            </span>
            <button className="party-close-btn" onClick={onClose} aria-label="Close">
              <BsX size={28} />
            </button>
          </div>
        </div>

        {/* Party Body Layout (Video Left + Chat Right) */}
        <div className="party-body-layout">
          
          {/* Main Synced Video Player */}
          <div className="party-player-col">
            <div className="party-video-container">
              <video 
                ref={videoRef}
                src={activeVideo.videoUrl || activeVideo.video_url} 
                poster={activeVideo.thumbnail || activeVideo.thumbnail_url || activeVideo.posterUrl}
                autoPlay 
                loop 
                muted={isMuted}
                playsInline
                className="party-video-element"
                onClick={togglePlayPause}
              />

              {/* Flying Reaction Overlay */}
              <div className="party-floating-reactions-layer">
                {flyingEmojis.map((item) => (
                  <span 
                    key={item.id} 
                    className="party-fly-emoji" 
                    style={{ left: `${item.left}%` }}
                  >
                    {item.emoji}
                  </span>
                ))}
              </div>

              {/* Video Overlay Controls */}
              <div className="party-video-controls-bar">
                <button 
                  type="button" 
                  className="p-ctrl-btn" 
                  onClick={togglePlayPause}
                >
                  {isPlaying ? <BsPauseFill size={20} /> : <BsPlayFill size={20} />}
                </button>
                <button 
                  type="button" 
                  className="p-ctrl-btn" 
                  onClick={() => setIsMuted(!isMuted)}
                >
                  {isMuted ? <BsVolumeMuteFill size={18} /> : <BsVolumeUpFill size={18} />}
                </button>
                <div className="p-timeline-wrap">
                  <div className="p-progress-bar" style={{ width: isPlaying ? "58%" : "25%" }}></div>
                </div>
                <span className="p-sync-time">
                  <BsCheckCircleFill size={11} className="text-success me-1" /> 1080p Synced
                </span>
              </div>
            </div>

            {/* Quick Synced Reaction Bar */}
            <div className="party-reactions-toolbar">
              <button className="reaction-burst-btn" onClick={() => handleReactionBurst("🔥")}>🔥</button>
              <button className="reaction-burst-btn" onClick={() => handleReactionBurst("❤️")}>❤️</button>
              <button className="reaction-burst-btn" onClick={() => handleReactionBurst("😂")}>😂</button>
              <button className="reaction-burst-btn" onClick={() => handleReactionBurst("🍿")}>🍿</button>
              <button className="reaction-burst-btn" onClick={() => handleReactionBurst("🚀")}>🚀</button>
              <button className="reaction-burst-btn" onClick={() => handleReactionBurst("😮")}>😮</button>

              <button 
                className={`party-mic-toggle-btn ${isMicOn ? "mic-live" : ""}`}
                onClick={() => setIsMicOn(!isMicOn)}
              >
                {isMicOn ? <><BsMicFill className="text-danger me-1" /> Mic ON</> : <><BsMicMuteFill className="me-1" /> Voice Mic</>}
              </button>
            </div>
          </div>

          {/* Right Synchronized Chat Column */}
          <div className="party-chat-col">
            <div className="party-chat-header">
              <h6>Party Live Chat</h6>
              <small>Real-time synchronized comments</small>
            </div>

            <div className="party-chat-messages" ref={chatScrollRef}>
              {chatMessages.map((msg) => (
                <div key={msg.id} className="party-chat-bubble">
                  <div className="pc-user-row">
                    <strong className="pc-username">{msg.user}</strong>
                    <span className="pc-time">{msg.time}</span>
                  </div>
                  <p className="pc-text">{msg.text}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendChat} className="party-chat-input-bar">
              <input
                type="text"
                placeholder="React or chat with party..."
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                className="party-text-input"
              />
              <button type="submit" className="party-send-btn" disabled={!inputMsg.trim()}>
                Send
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
}

export default WatchPartyModal;
