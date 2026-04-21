import { useState, useRef, useEffect } from "react";
import "./Chatbot.css";

const SUGGESTIONS = [
  "What schemes are available for students?",
  "Am I eligible for any women schemes?",
  "Tell me about agriculture subsidies",
  "How to apply for housing schemes?",
  "Schemes for SC/ST category",
  "Healthcare for BPL families",
];

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 350);
    }
  }, [isOpen]);

  /**
   * Build conversation history array for the backend.
   * Only includes role and content (not schemes).
   */
  const buildHistory = () => {
    return messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));
  };

  const handleInterested = async (schemeId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login first to save schemes");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/user/add-interested", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ schemeId }),
      });

      if (res.ok) {
        alert("Added to interested schemes!");
        window.dispatchEvent(new Event('profileUpdated'));
      } else {
        alert("Failed to add to interested schemes");
      }
    } catch (err) {
      console.error(err);
      alert("Error occurred while saving");
    }
  };

  const handleApply = async (schemeId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login first to apply");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/user/add-applied", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ schemeId }),
      });

      if (res.ok) {
        alert("Applied successfully!");
        window.dispatchEvent(new Event('profileUpdated'));
      } else {
        alert("Failed to record application");
      }
    } catch (err) {
      console.error(err);
      alert("Error occurred while applying");
    }
  };

  const sendMessage = async (text) => {
    const userMsg = text.trim();
    if (!userMsg || loading) return;

    setShowSuggestions(false);
    setInput("");

    // Add user message
    const newMessages = [...messages, { role: "user", content: userMsg }];
    setMessages(newMessages);
    setLoading(true);

    try {
      // Build history from all messages BEFORE the current one
      const history = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const res = await fetch("http://localhost:5000/api/chatbot/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg,
          history: history,
        }),
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const data = await res.json();

      // Add bot response
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          content: data.answer,
          schemes: data.schemes || [],
        },
      ]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          content:
            "Sorry, I'm having trouble connecting right now. Please try again in a moment. 🔄",
          schemes: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleSuggestion = (text) => {
    sendMessage(text);
  };

  const handleClearChat = () => {
    setMessages([]);
    setShowSuggestions(true);
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        id="chatbot-toggle"
        className={`chat-toggle ${isOpen ? "open" : ""}`}
        onClick={() => setIsOpen((o) => !o)}
        aria-label="Toggle chatbot"
      >
        <span className="chat-toggle-icon">{isOpen ? "✕" : "💬"}</span>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="chat-window" id="chatbot-window">
          {/* Header */}
          <div className="chat-header">
            <div className="chat-header-avatar">🏛️</div>
            <div className="chat-header-info">
              <div className="chat-header-title">Yojanta Assistant</div>
              <div className="chat-header-status">
                <span className="chat-header-dot" />
                AI Agent · Ask me anything
              </div>
            </div>
            {messages.length > 0 && (
              <button
                className="chat-header-clear"
                onClick={handleClearChat}
                aria-label="New chat"
                title="Start new chat"
              >
                🔄
              </button>
            )}
            <button
              className="chat-header-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="chat-messages" id="chatbot-messages">
            {/* Welcome message */}
            {messages.length === 0 && (
              <div className="chat-welcome">
                <div className="chat-welcome-emoji">🤖</div>
                <h3>Hi! I'm Yojanta AI</h3>
                <p>
                  I'm your personal government scheme assistant. Ask me
                  anything — I can help you find schemes, check eligibility,
                  explain benefits, and guide you through applications.
                </p>
              </div>
            )}

            {/* Message bubbles */}
            {messages.map((msg, i) => (
              <div key={i} className={`chat-msg ${msg.role}`}>
                <div className="chat-msg-avatar">
                  {msg.role === "bot" ? "🤖" : "👤"}
                </div>
                <div className="chat-msg-bubble">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: formatBotMessage(msg.content),
                    }}
                  />

                  {/* Scheme cards */}
                  {msg.schemes &&
                    msg.schemes.length > 0 &&
                    msg.schemes.map((scheme, idx) => (
                      <div key={idx} className="chat-scheme-card">
                        <div className="chat-scheme-name">{scheme.name}</div>
                        {scheme.eligibility && (
                          <div className="chat-scheme-detail">
                            <strong>Eligibility:</strong>{" "}
                            {scheme.eligibility.substring(0, 150)}
                            {scheme.eligibility.length > 150 ? "..." : ""}
                          </div>
                        )}
                        {scheme.benefits && (
                          <div
                            className="chat-scheme-detail"
                            style={{ marginTop: 4 }}
                          >
                            <strong>Benefits:</strong>{" "}
                            {scheme.benefits.substring(0, 150)}
                            {scheme.benefits.length > 150 ? "..." : ""}
                          </div>
                        )}
                        <div className="chat-scheme-meta">
                          {scheme.category && (
                            <span className="chat-scheme-tag">
                              {scheme.category}
                            </span>
                          )}
                          {scheme.state && (
                            <span className="chat-scheme-tag">
                              📍 {scheme.state}
                            </span>
                          )}
                        </div>
                        <div className="chat-scheme-actions" style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                          <button
                            className="chat-action-btn"
                            onClick={() => handleInterested(scheme.id)}
                            style={{ flex: 1, padding: '6px 0', fontSize: '11.5px', background: 'rgba(108, 59, 255, 0.1)', border: '1px solid rgba(108, 59, 255, 0.2)', borderRadius: '6px', color: '#c4b5fd', cursor: 'pointer', transition: 'all 0.2s ease', fontFamily: "'Syne', sans-serif", fontWeight: '600' }}
                          >
                            ⭐ Interested
                          </button>
                          <button
                            className="chat-action-btn apply-btn"
                            onClick={() => handleApply(scheme.id)}
                            style={{ flex: 1, padding: '6px 0', fontSize: '11.5px', background: 'linear-gradient(135deg, #6c3bff, #a855f7)', border: 'none', borderRadius: '6px', color: '#fff', cursor: 'pointer', transition: 'all 0.2s ease', fontFamily: "'Syne', sans-serif", fontWeight: '600' }}
                          >
                            Apply Now →
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="chat-typing">
                <div className="chat-typing-avatar">🤖</div>
                <div className="chat-typing-dots">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick suggestions */}
          {showSuggestions && messages.length === 0 && (
            <div className="chat-suggestions">
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  className="chat-suggestion-btn"
                  onClick={() => handleSuggestion(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input area */}
          <div className="chat-input-area">
            <input
              ref={inputRef}
              id="chatbot-input"
              className="chat-input"
              type="text"
              placeholder="Ask about any government scheme..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              autoComplete="off"
            />
            <button
              id="chatbot-send"
              className="chat-send-btn"
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
              aria-label="Send message"
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Format bot text: **bold**, newlines, and bullets to HTML.
 */
function formatBotMessage(text) {
  if (!text) return "";
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n- /g, "<br/>• ")
    .replace(/\n\d+\.\s/g, (match) => "<br/>" + match.trim() + " ")
    .replace(/\n/g, "<br/>");
}

export default Chatbot;
