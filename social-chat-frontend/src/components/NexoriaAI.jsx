import React, { useState, useRef, useEffect, useCallback } from "react";
import { 
  BsX, BsSendFill, BsStars, BsArrowRight, 
  BsMicFill, BsCodeSlash, BsTranslate, BsMagic, BsCheck2,
  BsTrash3, BsVolumeUpFill, BsVolumeMuteFill,
  BsCopy
} from "react-icons/bs";
import { getActiveUserId, getActiveUserName } from "../services/profileApi";
import { sendAIChatMessageApi, fetchAIPromptSuggestionsApi } from "../services/aiApi";
import "./css/NexoriaAI.css";

const AI_MODES = [
  { id: "general", label: "Quantum Co-Pilot", icon: <BsStars /> },
  { id: "creative", label: "Creative Writer", icon: <BsMagic /> },
  { id: "coder", label: "Code & Logic", icon: <BsCodeSlash /> },
  { id: "translator", label: "Polyglot 100+", icon: <BsTranslate /> }
];

function NexoriaAI({ onClose }) {
  const currentUserId = getActiveUserId();
  const currentUserName = getActiveUserName();
  const storageKey = `nexoria_ai_chat_${currentUserId || "guest"}`;

  const getInitialMessages = () => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return [
      {
        id: 1,
        sender: "ai",
        text: `⚡ **Welcome to Nexoria Quantum AI 2.0 (v2.4 Ultra)**!\nHello ${currentUserName || "there"}! I am your real-time neural social co-pilot. I can generate viral hooks, polish your captions, translate across 100+ languages, audit post authenticity, or draft code and strategies.`,
        time: "Just now",
        suggested_replies: [
          "Audit my profile standing 🛡️",
          "Write a viral Reel script 🎬",
          "Translate a message to Hindi & Spanish 🌐",
          "Write a FastAPI endpoint ⚡"
        ]
      }
    ];
  };

  const [messages, setMessages] = useState(getInitialMessages);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedMode, setSelectedMode] = useState("general");
  const [promptChips, setPromptChips] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [speakingId, setSpeakingId] = useState(null);
  const [streamingMessageId, setStreamingMessageId] = useState(null);

  const messagesEndRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);

  // Auto-scroll on new message or typing state
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, streamingMessageId]);

  // Persist messages per user
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(messages));
    } catch (e) {}
  }, [messages, storageKey]);

  // Load mode prompts on mode switch
  useEffect(() => {
    fetchAIPromptSuggestionsApi(selectedMode).then(res => {
      if (res && res.prompts) setPromptChips(res.prompts);
    });
  }, [selectedMode]);

  // Stop speech synthesis on unmount
  useEffect(() => {
    const synth = synthRef.current;
    return () => {
      if (synth && synth.speaking) {
        synth.cancel();
      }
    };
  }, []);

  // Voice Dictation / Web Speech Recognition
  const toggleVoice = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Speech recognition is not supported in this browser. Please type your message.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!isListening) {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = "en-US";
        recognition.interimResults = false;
        recognition.onstart = () => setIsListening(true);
        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setInputText(prev => (prev ? `${prev} ${transcript}` : transcript));
          setIsListening(false);
        };
        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);
        recognition.start();
      } catch (err) {
        setIsListening(false);
      }
    } else {
      setIsListening(false);
    }
  };

  // Text-To-Speech (Read Aloud)
  const toggleSpeech = (id, text) => {
    if (!synthRef.current) return;

    if (speakingId === id) {
      synthRef.current.cancel();
      setSpeakingId(null);
      return;
    }

    synthRef.current.cancel();
    // Clean markdown asterisks and code blocks for speech
    const cleanSpeechText = text
      .replace(/```[\s\S]*?```/g, "Code block omitted.")
      .replace(/[*#_`~]/g, "")
      .replace(/•/g, "");

    const utterance = new SpeechSynthesisUtterance(cleanSpeechText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    setSpeakingId(id);
    synthRef.current.speak(utterance);
  };

  // Copy Message
  const handleCopy = (id, text) => {
    try {
      navigator.clipboard?.writeText(text)?.catch(() => {});
    } catch {}
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Clear Chat History
  const handleClearChat = () => {
    if (window.confirm("Are you sure you want to clear your conversation with Nexoria AI?")) {
      synthRef.current?.cancel();
      setSpeakingId(null);
      const initial = [
        {
          id: Date.now(),
          sender: "ai",
          text: `⚡ **Conversation Reset**.\nHello ${currentUserName || "there"}! What would you like to explore next?`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggested_replies: [
            "Write a viral Reel script 🎬",
            "Audit my profile standing 🛡️",
            "Explain quantum computing 🔬",
            "Translate a message 🌐"
          ]
        }
      ];
      setMessages(initial);
      localStorage.setItem(storageKey, JSON.stringify(initial));
    }
  };

  // Typewriter Stream Simulation
  const streamAIResponse = useCallback((fullText, msgId, suggestedReplies = []) => {
    setStreamingMessageId(msgId);
    const words = fullText.split(" ");
    let currentIdx = 0;
    let accumulated = "";

    const interval = setInterval(() => {
      if (currentIdx < words.length) {
        accumulated += (currentIdx === 0 ? "" : " ") + words[currentIdx];
        setMessages(prev => prev.map(m => m.id === msgId ? { ...m, text: accumulated } : m));
        currentIdx++;
      } else {
        clearInterval(interval);
        setStreamingMessageId(null);
        setMessages(prev => prev.map(m => m.id === msgId ? { ...m, text: fullText, suggested_replies: suggestedReplies } : m));
      }
    }, 28);
  }, []);

  // Send Message Handler
  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputText).trim();
    if (!text || isTyping || streamingMessageId) return;

    const userMsgId = Date.now();
    const userMsg = {
      id: userMsgId,
      sender: "user",
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputText("");
    setIsTyping(true);

    // Prepare history payload (last 6 turns)
    const historyPayload = messages.slice(-6).map(m => ({
      sender: m.sender,
      text: m.text
    }));

    try {
      const res = await sendAIChatMessageApi({
        message: text,
        mode: selectedMode,
        history: historyPayload,
        userId: currentUserId,
        userName: currentUserName
      });

      setIsTyping(false);

      const aiMsgId = Date.now() + 1;
      const aiReplyText = res.reply || "⚡ Quantum Synthesis complete.";
      const followUps = res.suggested_replies || [];

      // Initial blank placeholder for typewriter
      setMessages(prev => [
        ...prev,
        {
          id: aiMsgId,
          sender: "ai",
          text: "",
          time: res.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggested_replies: []
        }
      ]);

      // Stream words
      streamAIResponse(aiReplyText, aiMsgId, followUps);

    } catch (err) {
      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "ai",
          text: "⚠️ Neural connection timeout. Please check your internet connection or retry.",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggested_replies: ["Retry last request 🔄"]
        }
      ]);
    }
  };

  // Helper to format text with Markdown bold and code blocks
  const renderFormattedMessage = (text) => {
    if (!text) return null;

    // Code block check
    const codeBlockRegex = /```([\w]*)\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: "text", content: text.substring(lastIndex, match.index) });
      }
      parts.push({ type: "code", lang: match[1] || "code", content: match[2].trim() });
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < text.length) {
      parts.push({ type: "text", content: text.substring(lastIndex) });
    }

    return parts.map((part, pIdx) => {
      if (part.type === "code") {
        return (
          <div key={pIdx} className="nx-ai-code-block">
            <div className="nx-ai-code-header">
              <span>{part.lang}</span>
              <button 
                className="nx-ai-code-copy-btn"
                onClick={() => handleCopy(`code_${pIdx}`, part.content)}
              >
                {copiedId === `code_${pIdx}` ? "Copied ✓" : "Copy Code"}
              </button>
            </div>
            <pre><code>{part.content}</code></pre>
          </div>
        );
      }

      // Format bold markdown **text**
      const lines = part.content.split("\n");
      return (
        <div key={pIdx}>
          {lines.map((line, lIdx) => {
            const boldParts = line.split(/(\*\*.*?\*\*)/g);
            return (
              <p key={lIdx} style={{ margin: "3px 0" }}>
                {boldParts.map((bp, bIdx) => {
                  if (bp.startsWith("**") && bp.endsWith("**")) {
                    return <strong key={bIdx}>{bp.slice(2, -2)}</strong>;
                  }
                  return bp;
                })}
              </p>
            );
          })}
        </div>
      );
    });
  };

  return (
    <div className="nx-ai-overlay" onClick={onClose}>
      <div className="nx-ai-dialog-box shadow-lg" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="nx-ai-header">
          <div className="nx-ai-header-brand">
            <div className="nx-ai-glow-orb">
              <BsStars size={18} />
            </div>
            <div>
              <div className="d-flex align-items-center gap-2">
                <h5 className="m-0 font-weight-bold">Nexoria Quantum AI</h5>
                <span className="nx-ai-model-tag">v2.4 Ultra</span>
              </div>
              <span className="nx-ai-sub-tag">Zero-latency Neural Social Assistant</span>
            </div>
          </div>
          
          <div className="d-flex align-items-center gap-2">
            <button 
              className="nx-ai-header-action-btn" 
              onClick={handleClearChat}
              title="Clear chat history"
            >
              <BsTrash3 size={15} />
            </button>
            <button className="nx-ai-close-btn" onClick={onClose}>
              <BsX size={26} />
            </button>
          </div>
        </div>

        {/* Mode Selector Pill Bar */}
        <div className="nx-ai-modes-tray">
          {AI_MODES.map((mode) => (
            <button
              key={mode.id}
              className={`nx-ai-mode-pill ${selectedMode === mode.id ? "active" : ""}`}
              onClick={() => setSelectedMode(mode.id)}
            >
              {mode.icon}
              <span>{mode.label}</span>
            </button>
          ))}
        </div>

        {/* Chat Body */}
        <div className="nx-ai-chat-body">
          {messages.map(m => (
            <div key={m.id} className={`nx-ai-bubble-row ${m.sender}`}>
              {m.sender === "ai" && (
                <div className="nx-ai-avatar-orb">
                  <BsStars size={14} />
                </div>
              )}
              <div className="nx-ai-bubble-content">
                <div className="nx-ai-bubble">
                  {renderFormattedMessage(m.text)}
                </div>

                <div className="nx-ai-bubble-meta">
                  <span>{m.time}</span>
                  {m.sender === "ai" && m.text && (
                    <div className="d-flex align-items-center gap-2 ms-2">
                      <button 
                        className="nx-ai-action-icon-btn" 
                        onClick={() => toggleSpeech(m.id, m.text)}
                        title={speakingId === m.id ? "Stop reading" : "Read aloud"}
                      >
                        {speakingId === m.id ? <BsVolumeMuteFill className="text-danger" size={13} /> : <BsVolumeUpFill size={13} />}
                      </button>
                      <button 
                        className="nx-ai-action-icon-btn" 
                        onClick={() => handleCopy(m.id, m.text)}
                        title="Copy text"
                      >
                        {copiedId === m.id ? <BsCheck2 className="text-success" size={13} /> : <BsCopy size={12} />}
                      </button>
                    </div>
                  )}
                </div>

                {/* Follow-up Suggested Reply Chips */}
                {m.sender === "ai" && m.suggested_replies && m.suggested_replies.length > 0 && (
                  <div className="nx-ai-followup-tray">
                    {m.suggested_replies.map((fPrompt, fIdx) => (
                      <button
                        key={fIdx}
                        className="nx-ai-followup-pill"
                        onClick={() => handleSendMessage(fPrompt)}
                        disabled={isTyping || !!streamingMessageId}
                      >
                        <span>{fPrompt}</span>
                        <BsArrowRight size={10} className="ms-1 opacity-75" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="nx-ai-bubble-row ai">
              <div className="nx-ai-avatar-orb">
                <BsStars size={14} />
              </div>
              <div className="nx-ai-bubble typing-bubble">
                <span className="nx-ai-dot"></span>
                <span className="nx-ai-dot"></span>
                <span className="nx-ai-dot"></span>
                <span className="nx-ai-typing-text ms-2">Neural synthesis in progress...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        {promptChips && promptChips.length > 0 && (
          <div className="nx-ai-prompt-chips-tray">
            {promptChips.map((prompt, idx) => (
              <button 
                key={idx}
                className="nx-ai-prompt-chip"
                onClick={() => handleSendMessage(prompt.text)}
                disabled={isTyping || !!streamingMessageId}
              >
                <span className="nx-ai-chip-tag">{prompt.tag}</span>
                <span className="nx-ai-chip-text">{prompt.text}</span>
                <BsArrowRight className="ms-auto" size={12} />
              </button>
            ))}
          </div>
        )}

        {/* Input Footer */}
        <form className="nx-ai-chat-footer" onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}>
          <button 
            type="button" 
            className={`nx-ai-tool-btn ${isListening ? "listening" : ""}`}
            onClick={toggleVoice}
            title={isListening ? "Listening... click to stop" : "Voice dictation"}
          >
            {isListening ? <BsMicFill className="text-danger" /> : <BsMicFill />}
          </button>

          <input 
            type="text" 
            placeholder={isListening ? "Listening to your voice..." : "Ask Nexoria Quantum AI anything..."}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isTyping || !!streamingMessageId}
            autoFocus
          />

          <button 
            type="submit" 
            className="nx-ai-send-btn" 
            disabled={!inputText.trim() || isTyping || !!streamingMessageId}
          >
            <BsSendFill size={14} />
          </button>
        </form>

      </div>
    </div>
  );
}

export default NexoriaAI;
