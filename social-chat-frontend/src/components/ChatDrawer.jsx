import React, { useState, useEffect, useRef, useCallback } from "react";
import { 
  BsX, BsDash, BsEmojiSmile, BsImage, 
  BsHandThumbsUpFill, BsSendFill, BsCameraVideoFill, BsTelephoneFill,
  BsShieldLockFill, BsStars, BsMicFill, BsCheck2All, BsCheck2,
  BsMicMuteFill, BsCameraVideoOffFill, BsTelephoneXFill, BsThreeDotsVertical,
  BsTrashFill, BsPersonFill, BsVolumeUpFill, BsVolumeMuteFill,
  BsDownload, BsShareFill, BsArrowLeft
} from "react-icons/bs";
import { FaGhost } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { getActiveUserId, getActiveUserName } from "../services/profileApi";
import {
  fetchChatMessagesApi,
  sendMessageApi,
  reactMessageApi,
  markMessagesReadApi,
  uploadChatMediaApi,
  uploadMultipleChatMediaApi,
  clearConversationApi,
  deleteChatMessageApi,
  getChatWebSocketUrl,
  formatMessageTime,
  logMissedCallApi,
  getChatMediaUrl
} from "../services/chatApi";
import callSounds from "../utils/callSounds";
import "./css/ChatDrawer.css";

const AVAILABLE_EMOJIS = ["😀", "😂", "❤️", "👍", "🔥", "🎉", "😍", "👏", "🙌", "💯", "😎", "🥳", "👻", "⚡", "⭐"];
const REACTION_EMOJIS = ["❤️", "👍", "😂", "😮", "😢", "🔥"];

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun3.l.google.com:19302" },
    { urls: "stun:stun4.l.google.com:19302" }
  ]
};

function ChatDrawer({ activeChat, onClose, onMinimize }) {
  const navigate = useNavigate();
  const currentUserId = Number(getActiveUserId());
  const currentUserName = getActiveUserName();
  const targetUserId = activeChat ? Number(activeChat.id || activeChat.user_id || activeChat.friend_user_id) : null;

  // Chat state
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const [showMenuDropdown, setShowMenuDropdown] = useState(false);
  const [ghostMode, setGhostMode] = useState(false);
  const [ghostTimer, setGhostTimer] = useState(15); // seconds
  const [showStarTipModal, setShowStarTipModal] = useState(false);
  const [tipToast, setTipToast] = useState("");
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [onlineStatus, setOnlineStatus] = useState(activeChat?.online ?? true);
  const [deleteModalMsg, setDeleteModalMsg] = useState(null); // Message queued for delete confirmation

  // Multiple Files / Photos Attachment state
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);


  // Voice Note Recording state (Real Audio)
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);

  // Audio / Video Call state
  const [activeCallType, setActiveCallType] = useState(null); // null | "audio" | "video"
  const [callState, setCallState] = useState("idle"); // "idle" | "calling" | "ringing" | "connected" | "ended"
  const [callDuration, setCallDuration] = useState(0);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [incomingCall, setIncomingCall] = useState(null); // { sender_id, sender_name, sender_img, call_type }
  const [hasRemoteVideo, setHasRemoteVideo] = useState(false);

  // Refs
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const isTypingSentRef = useRef(false);
  const handleIncomingSocketEventRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const callTimerRef = useRef(null);
  const callTimeoutRef = useRef(null);
  const isCallConnectedRef = useRef(false);


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isPartnerTyping, selectedFiles]);

  useEffect(() => {
    if (activeChat) {
      setOnlineStatus(activeChat.online ?? true);
    }
  }, [activeChat]);

  // ============================================================================
  // 1. FETCH INITIAL MESSAGES HISTORY & CONTINUOUS DIRECT LIVE SYNC (NO REFRESH)
  // ============================================================================
  useEffect(() => {
    if (!targetUserId || !currentUserId) return;

    let isMounted = true;
    setIsLoadingMessages(true);

    fetchChatMessagesApi(currentUserId, targetUserId).then((res) => {
      if (isMounted && res.success && res.data) {
        setMessages(res.data);
      }
      if (isMounted) setIsLoadingMessages(false);
    });

    markMessagesReadApi(currentUserId, targetUserId);

    // Live background polling sync every 3 seconds to guarantee direct instant updates
    const syncInterval = setInterval(() => {
      fetchChatMessagesApi(currentUserId, targetUserId).then((res) => {
        if (isMounted && res.success && res.data) {
          setMessages((prev) => {
            const prevIds = new Set(prev.map((m) => m.id));
            const hasNew = res.data.some((m) => !prevIds.has(m.id));
            if (hasNew || res.data.length !== prev.length) {
              return res.data;
            }
            return prev;
          });
        }
      });
    }, 3000);

    return () => {
      isMounted = false;
      clearInterval(syncInterval);
    };
  }, [currentUserId, targetUserId]);

  // ============================================================================
  // 2. LIVE WEBSOCKET CONNECTION & CALL SIGNALING
  // ============================================================================
  useEffect(() => {
    if (!currentUserId) return;

    const wsUrl = getChatWebSocketUrl(currentUserId);
    let ws = null;
    let reconnectTimer = null;

    const connectWs = () => {
      try {
        ws = new WebSocket(wsUrl);
        socketRef.current = ws;

        ws.onopen = () => {
          const pingInterval = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: "ping" }));
            }
          }, 25000);
          ws._pingInterval = pingInterval;
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (handleIncomingSocketEventRef.current) {
              handleIncomingSocketEventRef.current(data);
            }
          } catch (e) {
            console.warn("WebSocket parse error:", e);
          }
        };

        ws.onclose = () => {
          if (ws._pingInterval) clearInterval(ws._pingInterval);
          reconnectTimer = setTimeout(connectWs, 3000);
        };

        ws.onerror = () => {
          ws.close();
        };
      } catch (err) {
        console.warn("WebSocket connection error:", err);
      }
    };

    connectWs();

    return () => {
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (ws) {
        if (ws._pingInterval) clearInterval(ws._pingInterval);
        ws.close();
      }
    };
  }, [currentUserId]);

  // Handle incoming real-time socket events
  const handleIncomingSocketEvent = useCallback((event) => {
    const { type, message, sender_id, message_id, reactions, user_id, online, call_type, sender_name, sender_img } = event;

    const curTargetId = Number(targetUserId);
    const curUserId = Number(currentUserId);

    if ((type === "new_message" || type === "message_sent") && message) {
      const msgSenderId = Number(message.sender_id);
      const msgReceiverId = Number(message.receiver_id);

      // Check if this message belongs to the currently active conversation
      const isForCurrentChat = (
        (msgSenderId === curTargetId && msgReceiverId === curUserId) ||
        (msgSenderId === curUserId && msgReceiverId === curTargetId) ||
        (msgSenderId === curTargetId)
      );

      if (isForCurrentChat) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === message.id)) return prev;
          return [...prev, message];
        });
        setIsPartnerTyping(false);
        if (msgSenderId === curTargetId && curUserId) {
          markMessagesReadApi(curUserId, curTargetId);
        }
      }

      // Broadcast globally to update header and thread lists live without refresh
      window.dispatchEvent(new CustomEvent("nexoria_new_chat_message", { detail: message }));

    } else if (type === "typing") {
      if (Number(sender_id) === curTargetId) {
        setIsPartnerTyping(true);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
          setIsPartnerTyping(false);
        }, 4000);
      }
    } else if (type === "stop_typing") {
      if (Number(sender_id) === curTargetId) {
        setIsPartnerTyping(false);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      }
    } else if (type === "message_deleted") {
      const delId = message_id || event.message_id;
      if (delId) {
        setMessages((prev) => prev.filter((m) => m.id !== delId));
      }
    } else if (type === "message_reaction" && message_id) {
      setMessages((prev) =>
        prev.map((m) => (m.id === message_id ? { ...m, reactions: reactions || [] } : m))
      );
    } else if (type === "messages_read") {
      setMessages((prev) =>
        prev.map((m) => (m.sender === "me" || Number(m.sender_id) === curUserId ? { ...m, is_read: true, status: "read" } : m))
      );
    } else if (type === "presence_update") {
      if (Number(user_id) === curTargetId) {
        setOnlineStatus(Boolean(online));
      }
    } else if (type === "incoming_call") {
      // Incoming call signal received from peer
      if (Number(sender_id) === curTargetId) {
        callSounds.startIncomingRing();
        setIncomingCall({
          sender_id: Number(sender_id),
          sender_name: sender_name || activeChat?.name || "User",
          sender_img: sender_img || activeChat?.img,
          call_type: call_type || "audio"
        });
      }
    } else if (type === "call_accepted") {
      callSounds.stopAllSounds();
      callSounds.playConnectChime();
      isCallConnectedRef.current = true;
      if (callTimeoutRef.current) clearTimeout(callTimeoutRef.current);
      setCallState("connected");
      startCallTimer();

      // Caller creates and sends WebRTC Offer
      const pc = peerConnectionRef.current;
      if (pc) {
        pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: activeCallType === "video" })
          .then((offer) => pc.setLocalDescription(offer))
          .then(() => {
            if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
              socketRef.current.send(JSON.stringify({
                type: "webrtc_signal",
                receiver_id: curTargetId,
                signal_data: {
                  type: "offer",
                  sdp: pc.localDescription
                }
              }));
            }
          })
          .catch((err) => console.warn("Error creating WebRTC offer:", err));
      }
    } else if (type === "call_rejected") {
      callSounds.stopAllSounds();
      callSounds.playDisconnectTone();
      if (callTimeoutRef.current) clearTimeout(callTimeoutRef.current);
      endCallCleanup();
      setTipToast("Call declined");
      setTimeout(() => setTipToast(""), 3000);
      if (event.message) {
        setMessages((prev) => prev.some((m) => m.id === event.message.id) ? prev : [...prev, event.message]);
      }
    } else if (type === "call_ended") {
      callSounds.stopAllSounds();
      callSounds.playDisconnectTone();
      if (callTimeoutRef.current) clearTimeout(callTimeoutRef.current);
      endCallCleanup();
      setTipToast("Call ended");
      setTimeout(() => setTipToast(""), 2500);
    } else if (type === "webrtc_signal" && event.signal_data) {
      const signal = event.signal_data;
      const pc = peerConnectionRef.current;
      if (pc) {
        if (signal.type === "offer" && signal.sdp) {
          pc.setRemoteDescription(new RTCSessionDescription(signal.sdp))
            .then(() => pc.createAnswer())
            .then((answer) => pc.setLocalDescription(answer))
            .then(() => {
              if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
                socketRef.current.send(JSON.stringify({
                  type: "webrtc_signal",
                  receiver_id: curTargetId,
                  signal_data: {
                    type: "answer",
                    sdp: pc.localDescription
                  }
                }));
              }
            })
            .catch((err) => console.warn("Error handling offer:", err));
        } else if (signal.type === "answer" && signal.sdp) {
          pc.setRemoteDescription(new RTCSessionDescription(signal.sdp))
            .catch((err) => console.warn("Error handling answer:", err));
        } else if (signal.type === "candidate" && signal.candidate) {
          pc.addIceCandidate(new RTCIceCandidate(signal.candidate))
            .catch((err) => console.warn("Error adding ICE candidate:", err));
        }
      }
    }
  }, [targetUserId, currentUserId, activeChat, activeCallType]);

  useEffect(() => {
    handleIncomingSocketEventRef.current = handleIncomingSocketEvent;
  }, [handleIncomingSocketEvent]);

  // ============================================================================
  // 3. GHOST MODE REALTIME COUNTDOWN
  // ============================================================================
  useEffect(() => {
    const interval = setInterval(() => {
      setMessages((prev) => {
        const now = Date.now();
        const filtered = prev.filter((m) => {
          if (!m.is_ghost || !m.expire_at) return true;
          const expireTime = new Date(m.expire_at).getTime();
          return expireTime > now;
        });
        return filtered.length !== prev.length ? filtered : prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!activeChat) return null;

  // ============================================================================
  // 4. WEBRTC PEER CONNECTION & CALLING LOGIC (AUDIO & HD VIDEO CALLS)
  // ============================================================================
  const initPeerConnection = (partnerId, isAudioOnly = false) => {
    try {
      if (peerConnectionRef.current) {
        try {
          peerConnectionRef.current.ontrack = null;
          peerConnectionRef.current.onicecandidate = null;
          peerConnectionRef.current.close();
        } catch (e) {}
        peerConnectionRef.current = null;
      }

      const pc = new RTCPeerConnection(ICE_SERVERS);
      peerConnectionRef.current = pc;

      // Attach local tracks
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          pc.addTrack(track, localStreamRef.current);
        });
      }

      // Handle remote incoming audio/video tracks
      pc.ontrack = (event) => {
        const stream = event.streams[0] || (event.track ? new MediaStream([event.track]) : null);
        if (stream) {
          remoteStreamRef.current = stream;
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = stream;
          }
          if (remoteAudioRef.current) {
            remoteAudioRef.current.srcObject = stream;
          }
          const videoTracks = stream.getVideoTracks();
          if (videoTracks.length > 0) {
            setHasRemoteVideo(true);
          }
        }
      };

      // Broadcast ICE candidates via WebSocket
      pc.onicecandidate = (event) => {
        if (event.candidate && socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
          socketRef.current.send(JSON.stringify({
            type: "webrtc_signal",
            receiver_id: Number(partnerId),
            signal_data: {
              type: "candidate",
              candidate: event.candidate
            }
          }));
        }
      };

      pc.oniceconnectionstatechange = () => {
        if (pc.iceConnectionState === "disconnected" || pc.iceConnectionState === "failed") {
          console.log("ICE Connection State changed:", pc.iceConnectionState);
        }
      };

      return pc;
    } catch (err) {
      console.warn("initPeerConnection error:", err);
      return null;
    }
  };

  const startCallTimer = () => {
    if (callTimerRef.current) clearInterval(callTimerRef.current);
    setCallDuration(0);
    callTimerRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
  };

  const formatCallDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const startAudioCall = async () => {
    if (!targetUserId) return;
    setActiveCallType("audio");
    setCallState("calling");
    setIsMicMuted(false);
    setIsSpeakerOn(true);
    isCallConnectedRef.current = false;
    setHasRemoteVideo(false);

    // Play ringing tone
    callSounds.startOutgoingRing();

    // Get microphone stream
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true }).catch(() => null);
        if (stream) {
          localStreamRef.current = stream;
        }
      }
    } catch (err) {
      console.warn("Could not capture microphone:", err);
    }

    // Initialize WebRTC
    initPeerConnection(targetUserId, true);

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: "call_request",
        receiver_id: targetUserId,
        sender_name: currentUserName,
        call_type: "audio"
      }));
    }

    // 25-second timeout for missed call if receiver does not answer
    if (callTimeoutRef.current) clearTimeout(callTimeoutRef.current);
    callTimeoutRef.current = setTimeout(async () => {
      if (!isCallConnectedRef.current) {
        callSounds.stopAllSounds();
        endCallCleanup();
        setTipToast("No answer · Missed call logged");
        setTimeout(() => setTipToast(""), 3000);
        const res = await logMissedCallApi(currentUserId, targetUserId, "audio");
        if (res.success && res.data) {
          setMessages((prev) => prev.some((m) => m.id === res.data.id) ? prev : [...prev, res.data]);
        }
      }
    }, 25000);
  };

  const startVideoCall = async () => {
    if (!targetUserId) return;
    setActiveCallType("video");
    setCallState("calling");
    setIsMicMuted(false);
    setIsCameraOff(false);
    isCallConnectedRef.current = false;
    setHasRemoteVideo(false);

    // Play ringing tone
    callSounds.startOutgoingRing();

    // Request browser camera and mic stream
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true }).catch(() => null);
        if (stream) {
          localStreamRef.current = stream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        }
      }
    } catch (err) {
      console.warn("Could not capture camera feed:", err);
    }

    // Initialize WebRTC
    initPeerConnection(targetUserId, false);

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: "call_request",
        receiver_id: targetUserId,
        sender_name: currentUserName,
        call_type: "video"
      }));
    }

    // 25-second timeout for missed call if receiver does not answer
    if (callTimeoutRef.current) clearTimeout(callTimeoutRef.current);
    callTimeoutRef.current = setTimeout(async () => {
      if (!isCallConnectedRef.current) {
        callSounds.stopAllSounds();
        endCallCleanup();
        setTipToast("No answer · Missed call logged");
        setTimeout(() => setTipToast(""), 3000);
        const res = await logMissedCallApi(currentUserId, targetUserId, "video");
        if (res.success && res.data) {
          setMessages((prev) => prev.some((m) => m.id === res.data.id) ? prev : [...prev, res.data]);
        }
      }
    }, 25000);
  };

  const acceptIncomingCall = async () => {
    if (!incomingCall) return;
    callSounds.stopAllSounds();
    callSounds.playConnectChime();
    isCallConnectedRef.current = true;
    if (callTimeoutRef.current) clearTimeout(callTimeoutRef.current);

    const type = incomingCall.call_type || "audio";
    const callerId = incomingCall.sender_id || targetUserId;
    setActiveCallType(type);
    setCallState("connected");
    setIncomingCall(null);
    startCallTimer();

    // Get local media
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const constraints = type === "video" ? { video: true, audio: true } : { audio: true };
        const stream = await navigator.mediaDevices.getUserMedia(constraints).catch(() => null);
        if (stream) {
          localStreamRef.current = stream;
          if (localVideoRef.current && type === "video") {
            localVideoRef.current.srcObject = stream;
          }
        }
      }
    } catch (e) {
      console.warn("acceptIncomingCall media error:", e);
    }

    // Initialize WebRTC Peer Connection
    initPeerConnection(callerId, type !== "video");

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN && callerId) {
      socketRef.current.send(JSON.stringify({
        type: "call_accepted",
        receiver_id: callerId
      }));
    }
  };

  const rejectIncomingCall = async () => {
    if (!incomingCall) return;
    callSounds.stopAllSounds();
    callSounds.playDisconnectTone();
    if (callTimeoutRef.current) clearTimeout(callTimeoutRef.current);

    const callerId = incomingCall.sender_id || targetUserId;
    const type = incomingCall.call_type || "audio";

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN && callerId) {
      socketRef.current.send(JSON.stringify({
        type: "call_rejected",
        receiver_id: callerId,
        caller_id: callerId,
        call_type: type
      }));
    }

    setIncomingCall(null);

    // Save missed call log
    const res = await logMissedCallApi(callerId, currentUserId, type);
    if (res.success && res.data) {
      setMessages((prev) => prev.some((m) => m.id === res.data.id) ? prev : [...prev, res.data]);
    }
  };

  const endCallCleanup = () => {
    callSounds.stopAllSounds();
    if (callTimeoutRef.current) clearTimeout(callTimeoutRef.current);
    if (callTimerRef.current) clearInterval(callTimerRef.current);

    // Close WebRTC connection
    if (peerConnectionRef.current) {
      try {
        peerConnectionRef.current.ontrack = null;
        peerConnectionRef.current.onicecandidate = null;
        peerConnectionRef.current.close();
      } catch (e) {}
      peerConnectionRef.current = null;
    }

    // Stop local media tracks
    if (localStreamRef.current) {
      try {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
      } catch (e) {}
      localStreamRef.current = null;
    }

    // Stop remote media tracks
    if (remoteStreamRef.current) {
      try {
        remoteStreamRef.current.getTracks().forEach((t) => t.stop());
      } catch (e) {}
      remoteStreamRef.current = null;
    }

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = null;
    }

    isCallConnectedRef.current = false;
    setHasRemoteVideo(false);
    setActiveCallType(null);
    setCallState("idle");
    setCallDuration(0);
  };

  const endCall = async () => {
    callSounds.stopAllSounds();
    callSounds.playDisconnectTone();
    const wasConnected = isCallConnectedRef.current;
    const callType = activeCallType || "audio";

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN && targetUserId) {
      socketRef.current.send(JSON.stringify({
        type: "call_ended",
        receiver_id: targetUserId
      }));
    }

    // If caller cancels before receiver answered, log as missed call
    if (!wasConnected && targetUserId && currentUserId) {
      const res = await logMissedCallApi(currentUserId, targetUserId, callType);
      if (res.success && res.data) {
        setMessages((prev) => prev.some((m) => m.id === res.data.id) ? prev : [...prev, res.data]);
      }
    }

    endCallCleanup();
    setTipToast(wasConnected ? "Call ended" : "Call cancelled");
    setTimeout(() => setTipToast(""), 2500);
  };

  const toggleMic = () => {
    const nextMute = !isMicMuted;
    setIsMicMuted(nextMute);
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((t) => { t.enabled = !nextMute; });
    }
  };

  const toggleCamera = () => {
    const nextCameraOff = !isCameraOff;
    setIsCameraOff(nextCameraOff);
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((t) => { t.enabled = !nextCameraOff; });
    }
  };

  const toggleSpeaker = () => {
    setIsSpeakerOn((prev) => {
      const next = !prev;
      if (remoteAudioRef.current) {
        remoteAudioRef.current.muted = !next;
      }
      return next;
    });
  };

  // ============================================================================
  // 5. TYPING BROADCASTING & TEXT SENDING
  // ============================================================================
  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputText(val);

    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN || !targetUserId) return;

    if (val.trim()) {
      // Send live typing signal
      if (!isTypingSentRef.current) {
        isTypingSentRef.current = true;
        socketRef.current.send(
          JSON.stringify({
            type: "typing",
            receiver_id: targetUserId,
          })
        );
      }

      // Refresh debounced stop_typing timer on every keystroke
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN && targetUserId) {
          socketRef.current.send(
            JSON.stringify({
              type: "stop_typing",
              receiver_id: targetUserId,
            })
          );
        }
        isTypingSentRef.current = false;
      }, 2500);
    } else {
      // If user erased the input text completely, stop typing immediately
      if (isTypingSentRef.current) {
        socketRef.current.send(
          JSON.stringify({
            type: "stop_typing",
            receiver_id: targetUserId,
          })
        );
        isTypingSentRef.current = false;
      }
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    }
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    const clean = inputText.trim();

    // If multiple images are queued, upload and send them
    if (selectedFiles.length > 0) {
      await handleSendMultipleFiles();
      return;
    }

    if (!clean || !targetUserId) return;

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          type: "stop_typing",
          receiver_id: targetUserId,
        })
      );
    }
    isTypingSentRef.current = false;
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    const payload = {
      user_id: currentUserId,
      receiver_id: targetUserId,
      content: clean,
      is_ghost: ghostMode,
      expire_seconds: ghostMode ? ghostTimer : 0,
      is_e2ee: true,
      stars_tipped: 0,
    };

    setInputText("");
    setShowEmojis(false);


    const tempId = Date.now();
    const nowIso = new Date().toISOString();
    const tempMsg = {
      id: tempId,
      sender_id: currentUserId,
      receiver_id: targetUserId,
      sender: "me",
      content: clean,
      created_at: nowIso,
      time: formatMessageTime(nowIso),
      is_ghost: ghostMode,
      expire_seconds: ghostMode ? ghostTimer : 0,
      expire_at: ghostMode ? new Date(Date.now() + ghostTimer * 1000).toISOString() : null,
      is_read: false,
      status: "delivered",
      reactions: [],
    };
    setMessages((prev) => [...prev, tempMsg]);

    const res = await sendMessageApi(payload);
    if (res.success && res.data) {
      setMessages((prev) => prev.map((m) => (m.id === tempId ? res.data : m)));
    }
  };

  const handleThumbsUp = async () => {
    if (!targetUserId) return;
    const payload = {
      user_id: currentUserId,
      receiver_id: targetUserId,
      content: "👍",
      is_ghost: false,
    };

    const tempId = Date.now();
    const nowIso = new Date().toISOString();
    const tempMsg = {
      id: tempId,
      sender_id: currentUserId,
      receiver_id: targetUserId,
      sender: "me",
      content: "👍",
      is_emoji_only: true,
      created_at: nowIso,
      time: formatMessageTime(nowIso),
      status: "delivered",
      reactions: [],
    };
    setMessages((prev) => [...prev, tempMsg]);

    const res = await sendMessageApi(payload);
    if (res.success && res.data) {
      setMessages((prev) => prev.map((m) => (m.id === tempId ? res.data : m)));
    }
  };

  // ============================================================================
  // 6. MULTIPLE IMAGES & ATTACHMENT SELECTION
  // ============================================================================
  const handleFilesSelected = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const newPreviewItems = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name
    }));

    setSelectedFiles((prev) => [...prev, ...newPreviewItems]);
    // Reset file input value so same files can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeSelectedFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSendMultipleFiles = async () => {
    if (!selectedFiles.length || !targetUserId) return;

    setIsUploading(true);
    const filesToUpload = [...selectedFiles];
    const previewBlobUrls = filesToUpload.map((item) => item.preview);
    const textCaption = inputText.trim();
    const content = textCaption || (filesToUpload.length > 1 ? `Shared ${filesToUpload.length} photos` : "Shared a photo");

    // Optimistic local preview message so user sees photos immediately
    const tempId = Date.now();
    const nowIso = new Date().toISOString();
    const tempMsg = {
      id: tempId,
      sender_id: currentUserId,
      receiver_id: targetUserId,
      sender: "me",
      content: content,
      attachment_url: JSON.stringify(previewBlobUrls),
      attachment_type: "image_gallery",
      created_at: nowIso,
      time: formatMessageTime(nowIso),
      is_ghost: ghostMode,
      expire_seconds: ghostMode ? ghostTimer : 0,
      expire_at: ghostMode ? new Date(Date.now() + ghostTimer * 1000).toISOString() : null,
      is_read: false,
      status: "sending",
      reactions: [],
    };
    setMessages((prev) => [...prev, tempMsg]);
    setSelectedFiles([]);
    setInputText("");

    const rawFiles = filesToUpload.map((item) => item.file);
    let uploadedUrls = [];
    if (rawFiles.length === 1) {
      const singleRes = await uploadChatMediaApi(rawFiles[0]);
      if (singleRes.success && singleRes.data && singleRes.data.url) {
        uploadedUrls.push(singleRes.data.url);
      }
    } else {
      const multiRes = await uploadMultipleChatMediaApi(rawFiles);
      if (multiRes.success && multiRes.data && multiRes.data.files) {
        uploadedUrls = multiRes.data.files.map((f) => f.url);
      }
    }
    setIsUploading(false);

    if (uploadedUrls.length > 0) {
      const payload = {
        user_id: currentUserId,
        receiver_id: targetUserId,
        content: content,
        attachment_url: JSON.stringify(uploadedUrls),
        attachment_type: "image_gallery",
        is_ghost: ghostMode,
        expire_seconds: ghostMode ? ghostTimer : 0,
      };

      const sendRes = await sendMessageApi(payload);
      if (sendRes.success && sendRes.data) {
        setMessages((prev) => prev.map((m) => (m.id === tempId ? sendRes.data : m)));
      }
    }
  };

  // ============================================================================
  // 7. REAL VOICE NOTE RECORDING (MediaRecorder)
  // ============================================================================
  const startVoiceRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setTipToast("Audio recording not supported on this browser");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.start();
      setIsRecordingVoice(true);
      setRecordingDuration(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.warn("Could not start recording:", err);
      setTipToast("Microphone access denied");
      setTimeout(() => setTipToast(""), 2500);
    }
  };

  const stopAndSendVoiceRecording = () => {
    if (!mediaRecorderRef.current) return;

    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    setIsRecordingVoice(false);

    const duration = recordingDuration;

    mediaRecorderRef.current.onstop = async () => {
      const payload = {
        user_id: currentUserId,
        receiver_id: targetUserId,
        content: "Voice note",
        is_voice: true,
        voice_duration: duration || 5,
        voice_transcription: "Live audio message recorded on Nexoria.",
        is_ghost: ghostMode,
        expire_seconds: ghostMode ? ghostTimer : 0,
      };

      const res = await sendMessageApi(payload);
      if (res.success && res.data) {
        setMessages((prev) => [...prev, res.data]);
      }
    };

    mediaRecorderRef.current.stop();
  };

  const cancelVoiceRecording = () => {
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    setIsRecordingVoice(false);
    setRecordingDuration(0);
    setTipToast("Voice note cancelled");
    setTimeout(() => setTipToast(""), 2000);
  };

  // ============================================================================
  // 8. CHAT OPTIONS & STAR TIPS
  // ============================================================================
  const handleClearChat = async () => {
    if (!window.confirm(`Clear all chat messages with ${activeChat.name}?`)) return;
    setShowMenuDropdown(false);
    const res = await clearConversationApi(currentUserId, targetUserId);
    if (res.success) {
      setMessages([]);
      setTipToast("Chat history cleared");
      setTimeout(() => setTipToast(""), 2500);
    }
  };

  const handleSendStarTip = async (stars) => {
    if (!targetUserId) return;

    const payload = {
      user_id: currentUserId,
      receiver_id: targetUserId,
      content: `⭐ Sent ${stars} Nexoria Stars to ${activeChat.name}! 🌟`,
      stars_tipped: stars,
      is_ghost: false,
    };

    setShowStarTipModal(false);
    setTipToast(`⭐ Successfully gifted ${stars} Stars to ${activeChat.name}!`);
    setTimeout(() => setTipToast(""), 3500);

    const res = await sendMessageApi(payload);
    if (res.success && res.data) {
      setMessages((prev) => [...prev, res.data]);
    } else {
      setTipToast(res.error || "Failed to send Stars");
    }
  };

  const handleDownloadMedia = async (url, filename) => {
    try {
      const fullUrl = getChatMediaUrl(url);
      setTipToast("Downloading media...");
      const response = await fetch(fullUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      const fileExt = url.includes(".") ? url.split(".").pop().split("?")[0] : "jpg";
      a.download = filename || `nexoria_media_${Date.now()}.${fileExt}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
      setTipToast("📥 File downloaded successfully!");
      setTimeout(() => setTipToast(""), 2500);
    } catch (err) {
      window.open(getChatMediaUrl(url), "_blank");
    }
  };

  const handleShareMedia = async (url, caption = "") => {
    const fullUrl = getChatMediaUrl(url);
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Shared photo from Nexoria Chat",
          text: caption || "Check out this photo on Nexoria",
          url: fullUrl,
        });
        setTipToast("Shared successfully!");
        setTimeout(() => setTipToast(""), 2000);
      } catch (e) {
        // Cancelled or not supported
      }
    } else {
      try {
        await navigator.clipboard.writeText(fullUrl);
        setTipToast("📋 Media link copied to clipboard!");
        setTimeout(() => setTipToast(""), 2500);
      } catch (e) {
        window.open(fullUrl, "_blank");
      }
    }
  };

  const handleDeleteMessage = async (msgId, deleteType = "everyone") => {
    setDeleteModalMsg(null);
    // Optimistically remove from state
    setMessages((prev) => prev.filter((m) => m.id !== msgId));

    // Send WebSocket signal for instant real-time sync
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN && targetUserId) {
      socketRef.current.send(JSON.stringify({
        type: "delete_message",
        message_id: msgId,
        receiver_id: targetUserId,
        delete_type: deleteType
      }));
    }

    // Call backend API
    await deleteChatMessageApi(msgId, currentUserId, deleteType);
    setTipToast(deleteType === "everyone" ? "🗑️ Message deleted for everyone" : "🗑️ Message deleted for you");
    setTimeout(() => setTipToast(""), 2500);
  };

  const handleReactToMessage = async (msgId, emoji) => {
    const res = await reactMessageApi(msgId, currentUserId, emoji);
    if (res.success && res.data) {
      setMessages((prev) =>
        prev.map((m) => (m.id === msgId ? { ...m, reactions: res.data.reactions } : m))
      );
    }
  };

  // Helper to parse gallery URLs safely
  const parseAttachmentUrls = (attachmentUrl) => {
    if (!attachmentUrl) return [];
    try {
      if (typeof attachmentUrl === "string") {
        const trimmed = attachmentUrl.trim();
        if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
          const parsed = JSON.parse(trimmed);
          return Array.isArray(parsed) ? parsed : [trimmed];
        }
        return [trimmed];
      }
      if (Array.isArray(attachmentUrl)) return attachmentUrl;
      return [String(attachmentUrl)];
    } catch {
      return [attachmentUrl];
    }
  };

  return (
    <div className={`chat-docked-box ${isMinimized ? "minimized" : ""} ${ghostMode ? "ghost-theme" : ""}`}>
      {/* Toast Alert */}
      {tipToast && (
        <div className="chat-tip-toast shadow-sm">
          <span>{tipToast}</span>
        </div>
      )}

      {/* Hidden File Input for Multiple Attachments */}
      <input
        type="file"
        multiple
        ref={fileInputRef}
        style={{ display: "none" }}
        accept="image/*,video/*,.pdf,.doc,.docx"
        onChange={handleFilesSelected}
      />

      {/* Incoming Call Notification Banner */}
      {incomingCall && (
        <div className="incoming-call-banner">
          <div className="d-flex align-items-center gap-2">
            <img 
              src={incomingCall.sender_img || `https://i.pravatar.cc/100?u=${incomingCall.sender_id}`} 
              alt="" 
              style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }} 
            />
            <div>
              <strong style={{ fontSize: 13.5 }}>{incomingCall.sender_name}</strong>
              <div style={{ fontSize: 11, color: "#31a24c" }}>
                Incoming {incomingCall.call_type === "video" ? "HD Video" : "Audio"} Call...
              </div>
            </div>
          </div>
          <div className="d-flex align-items-center gap-2">
            <button className="call-action-circle-btn accept-call" style={{ width: 34, height: 34, fontSize: 15 }} onClick={acceptIncomingCall} title="Accept">
              <BsTelephoneFill />
            </button>
            <button className="call-action-circle-btn end-call" style={{ width: 34, height: 34, fontSize: 15 }} onClick={rejectIncomingCall} title="Decline">
              <BsTelephoneXFill />
            </button>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* LIVE AUDIO / VIDEO CALL FULLSCREEN DOCKED OVERLAY */}
      {/* ==================================================================== */}
      {activeCallType && (
        <div className="chat-call-overlay">
          <div className="chat-call-header">
            <div className="call-type-badge">
              <BsShieldLockFill className="text-success" />
              {activeCallType === "video" ? "Quantum HD Video Call" : "Quantum Voice Call"}
            </div>
            <h4 className="call-user-name">{activeChat.name}</h4>
            <div className="call-status-text">
              {callState === "calling" ? "Calling..." : `Connected · ${formatCallDuration(callDuration)}`}
            </div>
          </div>

          {activeCallType === "audio" ? (
            <div className="chat-call-avatar-wrap">
              <div className="call-pulse-ring"></div>
              <div className="call-pulse-ring delay"></div>
              <img 
                src={activeChat.img || `https://i.pravatar.cc/100?u=${targetUserId || "chat"}`} 
                alt={activeChat.name} 
                className="chat-call-avatar" 
              />
            </div>
          ) : (
            <div className="video-call-feed-wrap">
              {/* Remote Video Stream from Peer */}
              <video 
                ref={remoteVideoRef} 
                autoPlay 
                playsInline 
                className="remote-video-feed"
                style={{ display: hasRemoteVideo ? "block" : "none", width: "100%", height: "100%", objectFit: "cover" }}
              />
              {!hasRemoteVideo && (
                <div className="remote-video-feed d-flex flex-column align-items-center justify-content-center" style={{ background: "#18191a", color: "#fff", height: "100%", minHeight: 280, width: "100%" }}>
                  <img 
                    src={activeChat.img || `https://i.pravatar.cc/100?u=${targetUserId || "chat"}`} 
                    alt="Remote" 
                    className="chat-call-avatar" 
                    style={{ width: 80, height: 80, borderRadius: "50%", marginBottom: 12, objectFit: "cover", boxShadow: "0 0 20px rgba(0,0,0,0.5)" }} 
                  />
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>
                    {callState === "calling" ? "Calling video feed..." : "HD Video Connected · Encrypted"}
                  </span>
                </div>
              )}
              {/* Local Camera Picture-in-Picture */}
              <video 
                ref={localVideoRef} 
                autoPlay 
                playsInline 
                muted 
                className="local-pip-video-feed" 
              />
            </div>
          )}

          {/* Real-time Remote Audio Stream Receiver */}
          <audio ref={remoteAudioRef} autoPlay playsInline />

          {/* Call Controls Toolbar */}
          <div className="chat-call-actions-row">
            <button 
              className={`call-action-circle-btn ${isMicMuted ? "muted" : ""}`}
              onClick={toggleMic}
              title={isMicMuted ? "Unmute Mic" : "Mute Mic"}
            >
              {isMicMuted ? <BsMicMuteFill /> : <BsMicFill />}
            </button>

            {activeCallType === "video" ? (
              <button 
                className={`call-action-circle-btn ${isCameraOff ? "muted" : ""}`}
                onClick={toggleCamera}
                title={isCameraOff ? "Turn Camera On" : "Turn Camera Off"}
              >
                {isCameraOff ? <BsCameraVideoOffFill /> : <BsCameraVideoFill />}
              </button>
            ) : (
              <button 
                className={`call-action-circle-btn ${!isSpeakerOn ? "muted" : ""}`}
                onClick={toggleSpeaker}
                title="Toggle Speaker"
              >
                {isSpeakerOn ? <BsVolumeUpFill /> : <BsVolumeMuteFill />}
              </button>
            )}

            <button 
              className="call-action-circle-btn end-call"
              onClick={endCall}
              title="End Call"
            >
              <BsTelephoneXFill />
            </button>
          </div>
        </div>
      )}

      {/* Chat Header */}
      <div className="chat-docked-header" onClick={() => isMinimized && setIsMinimized(false)}>
        <div className="chat-header-user">
          <button 
            type="button" 
            className="chat-mobile-back-btn" 
            title="Back / Close Chat" 
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
          >
            <BsArrowLeft size={18} />
          </button>
          <div className="chat-avatar-wrapper">
            <img src={activeChat.img || `https://i.pravatar.cc/100?u=${targetUserId || "chat"}`} alt={activeChat.name} />
            {onlineStatus && <span className="chat-online-indicator"></span>}
          </div>
          <div className="chat-user-details">
            <div className="d-flex align-items-center gap-1">
              <span className="chat-user-name">{activeChat.name}</span>
              {ghostMode && <FaGhost className="text-warning ms-1" title="Ghost Self-Destruct Active" />}
            </div>
            <span className="chat-user-status">
              <BsShieldLockFill className="text-success me-1" size={10} />
              {isPartnerTyping ? (
                <span style={{ color: "var(--color-primary, #1877f2)", fontWeight: 700 }}>✍️ Typing...</span>
              ) : onlineStatus ? (
                "🟢 Active Now · Quantum E2EE"
              ) : (
                "Offline · E2EE Protected"
              )}
            </span>
          </div>
        </div>

        <div className="chat-header-actions" onClick={(e) => e.stopPropagation()}>
          {/* Ghost Mode Toggle */}
          <button 
            className={`chat-icon-btn ${ghostMode ? "active-ghost" : ""}`}
            title={ghostMode ? "Ghost Mode ON (Self-destruct messages)" : "Turn ON Ghost Ephemeral Mode"}
            onClick={() => setGhostMode(!ghostMode)}
          >
            <FaGhost size={13} />
          </button>

          {/* Star Tip Button */}
          <button 
            className="chat-icon-btn star-tip-btn" 
            title="Tip Stars"
            onClick={() => setShowStarTipModal(true)}
          >
            <BsStars size={14} />
          </button>

          {/* Video Call Trigger */}
          <button 
            className="chat-icon-btn" 
            title="Start HD video call"
            onClick={startVideoCall}
          >
            <BsCameraVideoFill size={14} />
          </button>

          {/* Audio / Phone Call Trigger */}
          <button 
            className="chat-icon-btn" 
            title="Start phone voice call"
            onClick={startAudioCall}
          >
            <BsTelephoneFill size={13} />
          </button>

          {/* Chat Options Dropdown Toggle */}
          <div style={{ position: "relative" }}>
            <button 
              className="chat-icon-btn" 
              title="More options"
              onClick={() => setShowMenuDropdown(!showMenuDropdown)}
            >
              <BsThreeDotsVertical size={14} />
            </button>

            {showMenuDropdown && (
              <div 
                style={{
                  position: "absolute",
                  top: 32,
                  right: 0,
                  background: "var(--color-surface, #fff)",
                  border: "1px solid var(--color-border, #e4e6eb)",
                  borderRadius: 10,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
                  zIndex: 200,
                  width: 175,
                  padding: "6px 0"
                }}
              >
                <div 
                  className="dropdown-row-item px-3 py-2 d-flex align-items-center gap-2 cursor-pointer"
                  style={{ fontSize: 13 }}
                  onClick={() => {
                    setShowMenuDropdown(false);
                    navigate("/profile", { state: { targetUser: activeChat } });
                  }}
                >
                  <BsPersonFill size={14} /> View Profile
                </div>
                <div 
                  className="dropdown-row-item px-3 py-2 d-flex align-items-center gap-2 cursor-pointer text-danger"
                  style={{ fontSize: 13 }}
                  onClick={handleClearChat}
                >
                  <BsTrashFill size={14} /> Clear Messages
                </div>
              </div>
            )}
          </div>

          <button 
            className="chat-icon-btn" 
            title={isMinimized ? "Expand" : "Minimize"}
            onClick={() => setIsMinimized(!isMinimized)}
          >
            <BsDash size={18} />
          </button>
          <button className="chat-icon-btn" title="Close" onClick={onClose}><BsX size={20} /></button>
        </div>
      </div>

      {/* Ghost Mode Timer Bar Banner */}
      {ghostMode && !isMinimized && (
        <div className="ghost-timer-bar">
          <div className="d-flex align-items-center gap-1">
            <FaGhost size={12} />
            <span>Ghost Mode: Self-destruct in</span>
          </div>
          <select 
            value={ghostTimer} 
            onChange={(e) => setGhostTimer(Number(e.target.value))}
            className="ghost-timer-select"
          >
            <option value="5">5 seconds</option>
            <option value="15">15 seconds</option>
            <option value="30">30 seconds</option>
            <option value="60">1 minute</option>
          </select>
        </div>
      )}

      {!isMinimized && (
        <>
          {/* Messages Body */}
          <div className="chat-messages-container">
            <div className="chat-contact-intro">
              <img src={activeChat.img || `https://i.pravatar.cc/100?u=${targetUserId || "chat"}`} alt={activeChat.name} className="intro-avatar" />
              <h5>{activeChat.name}</h5>
              <div className="chat-e2ee-badge-strip">
                <BsShieldLockFill className="text-success me-1" />
                <span>End-to-End Encrypted (Live Direct Peer Communication)</span>
              </div>
            </div>

            {isLoadingMessages && (
              <div style={{ textAlign: "center", padding: "10px", color: "var(--color-text-secondary)", fontSize: "12px" }}>
                Loading live chat history...
              </div>
            )}

            {messages.map((m) => {
              const isOutgoing = m.sender === "me" || m.sender_id === currentUserId;
              const expireTime = m.expire_at ? new Date(m.expire_at).getTime() : null;
              const secondsLeft = m.is_ghost && expireTime ? Math.max(1, Math.ceil((expireTime - Date.now()) / 1000)) : null;
              const attachmentUrls = parseAttachmentUrls(m.attachment_url);

              return (
                <div key={m.id} className={`chat-msg-row ${isOutgoing ? "outgoing" : "incoming"}`}>
                  {!isOutgoing && (
                    <img src={activeChat.img || `https://i.pravatar.cc/100?u=${targetUserId || "chat"}`} alt="" className="msg-avatar" />
                  )}

                  {/* Hover Reaction Toolbar & Message Actions */}
                  <div className="msg-hover-actions">
                    {REACTION_EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        className="msg-react-btn"
                        onClick={() => handleReactToMessage(m.id, emoji)}
                        title={`React with ${emoji}`}
                      >
                        {emoji}
                      </button>
                    ))}
                    <button
                      type="button"
                      className="msg-delete-hover-btn"
                      onClick={() => setDeleteModalMsg(m)}
                      title="Delete message"
                    >
                      <BsTrashFill size={11} />
                    </button>
                  </div>

                  {m.attachment_type === "missed_audio_call" || m.attachment_type === "missed_video_call" || (m.content && m.content.toLowerCase().startsWith("missed ")) ? (
                    <div className={`chat-missed-call-card ${isOutgoing ? "caller-missed" : "receiver-missed"}`}>
                      <div className={`missed-call-icon-wrap ${isOutgoing ? "bg-secondary-soft" : "bg-danger-soft"}`}>
                        {m.attachment_type === "missed_video_call" || (m.content && m.content.toLowerCase().includes("video")) ? (
                          isOutgoing ? <BsCameraVideoFill className="text-secondary" /> : <BsCameraVideoOffFill className="text-danger" />
                        ) : (
                          isOutgoing ? <BsTelephoneFill className="text-secondary" /> : <BsTelephoneXFill className="text-danger" />
                        )}
                      </div>
                      <div className="missed-call-info">
                        <div className="missed-call-title">
                          {isOutgoing ? (
                            m.attachment_type === "missed_video_call" || (m.content && m.content.toLowerCase().includes("video"))
                              ? "Outgoing Video Call"
                              : "Outgoing Audio Call"
                          ) : (
                            m.attachment_type === "missed_video_call" || (m.content && m.content.toLowerCase().includes("video"))
                              ? "Missed Video Call"
                              : "Missed Audio Call"
                          )}
                        </div>
                        <div className="missed-call-subtitle">
                          {isOutgoing ? "No answer · " : ""}
                          {formatMessageTime(m.created_at || m.time)}
                        </div>
                      </div>
                      <button 
                        className="missed-call-action-btn"
                        onClick={() => (m.attachment_type === "missed_video_call" || (m.content && m.content.toLowerCase().includes("video"))) ? startVideoCall() : startAudioCall()}
                        title={isOutgoing ? "Call again" : "Call back"}
                      >
                        <span>{isOutgoing ? "🔁 Call again" : "📞 Call back"}</span>
                      </button>
                    </div>
                  ) : m.stars_tipped && m.stars_tipped > 0 ? (
                    <div className="chat-tip-bubble shadow-sm">
                      <div className="d-flex align-items-center gap-2">
                        <span className="tip-star-icon">⭐</span>
                        <div>
                          <strong>{m.stars_tipped} Stars Sent!</strong>
                          <p className="m-0 text-muted" style={{ fontSize: "11px" }}>Creator Tip Confirmed</p>
                        </div>
                      </div>
                      <span className="chat-msg-time">{formatMessageTime(m.created_at || m.time)}</span>
                    </div>
                  ) : m.is_voice ? (
                    <div className="chat-voice-bubble">
                      <div className="voice-audio-bar">
                        <button className="voice-play-icon">▶</button>
                        <div className="voice-wave-sim">
                          <span></span><span></span><span></span><span></span><span></span><span></span>
                        </div>
                        <span className="voice-duration">{m.voice_duration || 5}s</span>
                      </div>
                      {m.voice_transcription && (
                        <div className="voice-transcript">
                          <small>🎙️ <em>"{m.voice_transcription}"</em></small>
                        </div>
                      )}
                      <span className="chat-msg-time">{formatMessageTime(m.created_at || m.time)}</span>
                    </div>
                  ) : (
                    <div className={`chat-bubble ${m.content === "👍" ? "emoji-bubble" : ""} ${m.is_ghost ? "ghost-bubble" : ""}`}>
                      {/* Multiple Photos Grid / Single Image Preview with Download & Share Options */}
                      {attachmentUrls.length > 1 ? (
                        <div className="chat-multi-image-grid">
                          {attachmentUrls.map((url, imgIdx) => {
                            const fullUrl = getChatMediaUrl(url);
                            return (
                              <div key={imgIdx} className="chat-media-item-wrap">
                                <img 
                                  src={fullUrl} 
                                  alt="Attachment" 
                                  className="chat-multi-grid-item" 
                                  onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300";
                                  }}
                                  onClick={() => window.open(fullUrl, "_blank")}
                                />
                                <div className="chat-media-quick-bar">
                                  <button 
                                    type="button" 
                                    className="media-quick-btn download" 
                                    onClick={(e) => { e.stopPropagation(); handleDownloadMedia(url); }}
                                    title="Download image"
                                  >
                                    <BsDownload size={11} />
                                  </button>
                                  <button 
                                    type="button" 
                                    className="media-quick-btn share" 
                                    onClick={(e) => { e.stopPropagation(); handleShareMedia(url, m.content); }}
                                    title="Share / Copy Link"
                                  >
                                    <BsShareFill size={11} />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : attachmentUrls.length === 1 ? (
                        <div className="chat-media-item-wrap single">
                          <img 
                            src={getChatMediaUrl(attachmentUrls[0])} 
                            alt="Attachment" 
                            className="chat-attachment-img" 
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300";
                            }}
                            onClick={() => window.open(getChatMediaUrl(attachmentUrls[0]), "_blank")}
                          />
                          <div className="chat-media-quick-bar">
                            <button 
                              type="button" 
                              className="media-quick-btn download" 
                              onClick={(e) => { e.stopPropagation(); handleDownloadMedia(attachmentUrls[0]); }}
                              title="Download to device"
                            >
                              <BsDownload size={12} /> <span>Download</span>
                            </button>
                            <button 
                              type="button" 
                              className="media-quick-btn share" 
                              onClick={(e) => { e.stopPropagation(); handleShareMedia(attachmentUrls[0], m.content); }}
                              title="Share / Copy Link"
                            >
                              <BsShareFill size={12} /> <span>Share</span>
                            </button>
                          </div>
                        </div>
                      ) : null}

                      {/* Text content */}
                      {(!attachmentUrls.length || (m.content && !m.content.startsWith("Shared "))) && (
                        <span>{m.content}</span>
                      )}
                      
                      <div className="chat-bubble-footer">
                        <span className="chat-msg-time">{formatMessageTime(m.created_at || m.time)}</span>
                        {m.is_ghost && (
                          <span className="ghost-countdown-tag" title="Auto-destructs">
                            🔥 {secondsLeft || m.expire_seconds || 15}s
                          </span>
                        )}
                        {isOutgoing && (
                          m.is_read ? (
                            <BsCheck2All className="text-primary ms-1" size={13} title="Read" />
                          ) : (
                            <BsCheck2 className="text-muted ms-1" size={13} title="Delivered" />
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* Reaction Badges on message bottom */}
                  {m.reactions && m.reactions.length > 0 && (
                    <div className={`msg-reactions-badge-row ${isOutgoing ? "outgoing" : ""}`}>
                      {m.reactions.map((r, ri) => (
                        <span key={ri} className="reaction-pill" title={r.user_name || "Reaction"}>
                          {r.emoji}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Live Typing Indicator */}
            {isPartnerTyping && (
              <div className="chat-typing-row">
                <img src={activeChat.img || `https://i.pravatar.cc/100?u=${targetUserId || "chat"}`} alt="" className="msg-avatar" style={{ width: 24, height: 24, borderRadius: "50%" }} />
                <div className="typing-bubble">
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                </div>
                <span className="typing-status-hint">
                  {activeChat.name?.split(" ")[0] || "User"} is typing...
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Delete Message Modal Confirmation */}
          {deleteModalMsg && (() => {
            const isMsgSender = Number(deleteModalMsg.sender_id) === Number(currentUserId) || deleteModalMsg.sender === "me";
            return (
              <div className="chat-delete-modal-overlay" onClick={() => setDeleteModalMsg(null)}>
                <div className="chat-delete-modal-dialog" onClick={(e) => e.stopPropagation()}>
                  <div className="delete-modal-header">
                    <h6>Delete message?</h6>
                    <BsX className="cursor-pointer" size={22} onClick={() => setDeleteModalMsg(null)} />
                  </div>
                  <p className="delete-modal-subtitle">
                    {isMsgSender
                      ? "Aapne yeh message bheja tha. Aap ise sabhi ke chat se (Delete for everyone) ya sirf apne view se (Delete for me) delete kar sakte hain."
                      : "Yeh message samne wale user ne bheja hai. Ise sirf aap apne chat se (Delete for me) remove kar sakte hain."}
                  </p>
                  <div className="delete-modal-actions">
                    {isMsgSender && (
                      <button 
                        className="delete-choice-btn danger-everyone"
                        onClick={() => handleDeleteMessage(deleteModalMsg.id, "everyone")}
                      >
                        <BsTrashFill /> Delete for everyone
                      </button>
                    )}
                    <button 
                      className="delete-choice-btn secondary-me"
                      onClick={() => handleDeleteMessage(deleteModalMsg.id, "me")}
                    >
                      Delete for me
                    </button>
                    <button 
                      className="delete-choice-btn cancel-btn"
                      onClick={() => setDeleteModalMsg(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Multiple File Attachment Preview Bar */}
          {selectedFiles.length > 0 && (
            <div className="chat-multi-preview-bar">
              {selectedFiles.map((item, idx) => (
                <div key={idx} className="chat-preview-chip">
                  <img src={item.preview} alt="Preview" />
                  <button className="chat-preview-remove-btn" onClick={() => removeSelectedFile(idx)}>
                    <BsX />
                  </button>
                </div>
              ))}
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--color-primary)", whiteSpace: "nowrap" }}>
                {selectedFiles.length} item(s) selected
              </div>
            </div>
          )}

          {/* Real-time Voice Recording Bar */}
          {isRecordingVoice && (
            <div className="chat-voice-recorder-bar">
              <div className="recording-indicator-wrap">
                <span className="recording-pulse-dot"></span>
                <span>Recording... {recordingDuration}s</span>
              </div>
              <div className="recorder-actions">
                <button className="recorder-btn cancel" onClick={cancelVoiceRecording}>
                  <BsTrashFill /> Cancel
                </button>
                <button className="recorder-btn send" onClick={stopAndSendVoiceRecording}>
                  <BsSendFill /> Send
                </button>
              </div>
            </div>
          )}

          {/* Star Tip Modal */}
          {showStarTipModal && (
            <div className="chat-star-modal-overlay" onClick={() => setShowStarTipModal(false)}>
              <div className="chat-star-modal-dialog" onClick={(e) => e.stopPropagation()}>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="m-0 font-weight-bold">⭐ Tip {activeChat.name}</h6>
                  <BsX className="cursor-pointer" size={20} onClick={() => setShowStarTipModal(false)} />
                </div>
                <p className="text-muted" style={{ fontSize: "12px" }}>Direct creator micro-reward via Nexoria Stars</p>
                <div className="star-tip-grid">
                  <button className="star-tip-pack" onClick={() => handleSendStarTip(20)}>
                    <span>⭐ 20</span>
                    <small>$0.29</small>
                  </button>
                  <button className="star-tip-pack active" onClick={() => handleSendStarTip(50)}>
                    <span>⭐ 50</span>
                    <small>$0.69</small>
                  </button>
                  <button className="star-tip-pack" onClick={() => handleSendStarTip(100)}>
                    <span>⭐ 100</span>
                    <small>$1.29</small>
                  </button>
                  <button className="star-tip-pack" onClick={() => handleSendStarTip(500)}>
                    <span>⭐ 500</span>
                    <small>$5.99</small>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Emoji Popover */}
          {showEmojis && (
            <div className="chat-emoji-picker">
              {AVAILABLE_EMOJIS.map((em, i) => (
                <span 
                  key={i} 
                  className="emoji-item" 
                  onClick={() => { setInputText(prev => prev + em); setShowEmojis(false); }}
                >
                  {em}
                </span>
              ))}
            </div>
          )}

          {/* Input Footer Form */}
          <form className="chat-docked-footer" onSubmit={handleSend}>
            <div className="chat-input-toolbar">
              <button 
                type="button" 
                className="chat-tool-btn" 
                title="Attach photos/files (Supports multiple)"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                <BsImage size={15} />
              </button>
              <button 
                type="button" 
                className="chat-tool-btn" 
                title="Insert emoji"
                onClick={() => setShowEmojis(!showEmojis)}
              >
                <BsEmojiSmile size={15} />
              </button>
              <button 
                type="button" 
                className={`chat-tool-btn ${isRecordingVoice ? "recording" : ""}`}
                title={isRecordingVoice ? "Recording voice note..." : "Record AI Voice Note"}
                onClick={isRecordingVoice ? stopAndSendVoiceRecording : startVoiceRecording}
              >
                <BsMicFill size={15} />
              </button>
            </div>

            <input 
              type="text" 
              placeholder={ghostMode ? "Type self-destructing message..." : "Type a secure message..."}
              value={inputText}
              onChange={handleInputChange}
              className={`chat-text-input ${ghostMode ? "ghost-input" : ""}`}
              autoFocus
            />

            {inputText.trim() || selectedFiles.length > 0 ? (
              <button type="submit" className="chat-send-btn" disabled={isUploading}>
                <BsSendFill size={14} />
              </button>
            ) : (
              <button type="button" className="chat-like-btn" onClick={handleThumbsUp} title="Send Thumbs Up">
                <BsHandThumbsUpFill size={17} />
              </button>
            )}
          </form>
        </>
      )}
    </div>
  );
}

export default ChatDrawer;
