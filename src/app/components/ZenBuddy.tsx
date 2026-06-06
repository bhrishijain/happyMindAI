"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExamSettings, getZenBuddyReply } from "../utils/wellbeing";

interface Message {
  id: string;
  sender: "user" | "buddy";
  text: string;
}

interface ZenBuddyProps {
  settings: ExamSettings;
}

const PRESET_PROMPTS = [
  { text: "I failed a mock test today...", label: "📝 Mock Test Failure" },
  { text: "My parents have very high expectations.", label: "👨‍👩‍👧 Parental Pressure" },
  { text: "I feel exhausted and want to give up.", label: "🔋 Study Burnout" },
  { text: "I study all day but feel like I forget everything.", label: "🧠 Memory Lapses" }
];

export default function ZenBuddy({ settings }: ZenBuddyProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Load welcome message
  useEffect(() => {
    setMessages([
      {
        id: "welcome",
        sender: "buddy",
        text: getZenBuddyReply("hello", settings.examName)
      }
    ]);
  }, [settings.examName]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: text
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    // Simulate natural thinking delay
    setTimeout(() => {
      const buddyReplyText = getZenBuddyReply(text, settings.examName);
      const buddyMsg: Message = {
        id: `buddy-${Date.now()}`,
        sender: "buddy",
        text: buddyReplyText
      };
      setMessages((prev) => [...prev, buddyMsg]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className="fade-in glass-panel" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div>
        <h2 style={{ fontSize: "1.35rem", fontWeight: 700, marginBottom: "0.25rem" }}>
          💬 ZenBuddy Counselor
        </h2>
        <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
          Your anonymous, offline counselor. Share concerns about exams, expectations, or exhaustion. No data leaves your screen.
        </p>
      </div>

      {/* Chat Window */}
      <div className="chat-window">
        <div className="chat-messages" style={{ minHeight: "300px", maxHeight: "400px", padding: "1.25rem" }}>
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`chat-bubble ${msg.sender === "user" ? "chat-bubble-user" : "chat-bubble-buddy"}`}
            >
              {msg.text.split("\n").map((line, idx) => {
                // Bold formatting parser for specific advice highlights
                if (line.includes("**")) {
                  const parts = line.split("**");
                  return (
                    <p key={idx} style={{ marginBottom: "0.5rem" }}>
                      {parts.map((part, pidx) => pidx % 2 === 1 ? <strong key={pidx}>{part}</strong> : part)}
                    </p>
                  );
                }
                return <p key={idx} style={{ marginBottom: "0.5rem" }}>{line}</p>;
              })}
            </div>
          ))}
          {isTyping && (
            <div className="chat-bubble chat-bubble-buddy chat-bubble-typing">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Preset Prompts Helper */}
      <div>
        <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: 500, display: "block", marginBottom: "0.5rem" }}>
          💡 Click a quick prompt if you aren't sure what to say:
        </span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
          {PRESET_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              disabled={isTyping}
              onClick={() => handleSendMessage(prompt.text)}
              style={{
                background: "var(--bg-primary)",
                border: "1px solid var(--border-color)",
                padding: "0.4rem 0.8rem",
                borderRadius: "16px",
                fontSize: "0.8rem",
                cursor: isTyping ? "not-allowed" : "pointer",
                color: "var(--text-secondary)",
                fontWeight: 500,
                transition: "all 0.15s ease"
              }}
              onMouseOver={(e) => (e.currentTarget.style.borderColor = "hsl(var(--primary))")}
              onMouseOut={(e) => (e.currentTarget.style.borderColor = "var(--border-color)")}
            >
              {prompt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input Message bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(inputValue);
        }}
        style={{ display: "flex", gap: "0.75rem", borderTop: "1px solid var(--border-color)", paddingTop: "1rem" }}
      >
        <input
          aria-label="Write your message here"
          type="text"
          placeholder={isTyping ? "ZenBuddy is writing recommendations..." : "Ask ZenBuddy: 'I can't sleep' or 'parents are stressing me'..."}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          disabled={isTyping}
          style={{ flexGrow: 1 }}
        />
        <button 
          type="submit" 
          className="btn btn-primary" 
          disabled={isTyping || !inputValue.trim()}
          style={{ flexShrink: 0, padding: "0 1.5rem" }}
        >
          Send
        </button>
      </form>
    </div>
  );
}
