'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Send, AlertTriangle } from 'lucide-react';
import Image from 'next/image';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hi there! 💕 I\'m Hello Kitty! How can I help you sparkle at Glitz & Glamour Studio today? 🎀' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const sendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      });

      const data = await res.json();

      if (res.ok && data.reply) {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
      } else {
        setMessages((prev) => [...prev, { role: 'assistant', content: 'Oops! My bow got tangled. Please try asking again later! 🎀' }]);
      }
    } catch (error) {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Oh no, I couldn\'t reach JoJany right now. Please try again! 💕' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .chatbot-btn {
          position: fixed;
          bottom: 80px; /* Above mobile bottom nav */
          right: 20px;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, #FF2D78, #FF6BA8);
          box-shadow: 0 4px 14px rgba(255,45,120,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 50;
          transition: transform 0.2s;
        }
        .chatbot-btn:hover {
          transform: scale(1.05);
        }
        .chatbot-btn .dot {
          position: absolute;
          top: 4px;
          right: 4px;
          width: 12px;
          height: 12px;
          background-color: #22c55e;
          border: 2px solid #fff;
          border-radius: 50%;
        }
        
        @media (min-width: 768px) {
          .chatbot-btn {
            bottom: 24px;
            right: 24px;
          }
        }

        .chat-window {
          position: fixed;
          bottom: 90px;
          right: 20px;
          width: calc(100% - 40px);
          max-width: 380px;
          height: 500px;
          max-height: calc(100vh - 120px);
          background: rgba(22, 8, 24, 0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 45, 120, 0.3);
          border-radius: 20px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.5), 0 0 20px rgba(255,45,120,0.1);
          display: flex;
          flex-direction: column;
          z-index: 51;
          overflow: hidden;
          opacity: 0;
          pointer-events: none;
          transform: translateY(20px) scale(0.95);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .chat-window.open {
          opacity: 1;
          pointer-events: auto;
          transform: translateY(0) scale(1);
        }

        @media (min-width: 768px) {
          .chat-window {
            bottom: 95px;
            right: 24px;
          }
        }

        .chat-header {
          padding: 16px;
          background: linear-gradient(90deg, rgba(255,45,120,0.15), rgba(0,0,0,0));
          border-bottom: 1px solid rgba(255,255,255,0.05);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .chat-warning {
          background: rgba(255, 183, 0, 0.1);
          border-bottom: 1px solid rgba(255, 183, 0, 0.2);
          padding: 8px 12px;
          display: flex;
          align-items: flex-start;
          gap: 8px;
        }
        .chat-warning p {
          font-family: 'Poppins', sans-serif;
          font-size: 11px;
          color: #ffb700;
          margin: 0;
          line-height: 1.4;
        }

        .chat-body {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .chat-msg {
          max-width: 85%;
          padding: 10px 14px;
          border-radius: 16px;
          font-family: 'Poppins', sans-serif;
          font-size: 13.5px;
          line-height: 1.5;
        }
        .chat-msg.assistant {
          align-self: flex-start;
          background: rgba(255,255,255,0.05);
          color: #fff;
          border-bottom-left-radius: 4px;
        }
        .chat-msg.user {
          align-self: flex-end;
          background: linear-gradient(135deg, #FF2D78, #FF6BA8);
          color: #fff;
          border-bottom-right-radius: 4px;
        }

        .chat-input-area {
          padding: 12px;
          border-top: 1px solid rgba(255,255,255,0.05);
          background: rgba(0,0,0,0.2);
        }
        .chat-input-wrapper {
          display: flex;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 50px;
          padding: 4px;
        }
        .chat-input {
          flex: 1;
          background: transparent;
          border: none;
          color: #fff;
          font-family: 'Poppins', sans-serif;
          font-size: 14px;
          padding: 8px 16px;
          outline: none;
        }
        .chat-input::placeholder {
          color: #666;
        }
        .chat-send {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #FF2D78;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          cursor: pointer;
        }
        .chat-send:disabled {
          background: #555;
          cursor: not-allowed;
        }

        /* Typing indicator */
        .typing {
          display: flex;
          gap: 4px;
          padding: 4px 8px;
        }
        .typing span {
          width: 6px;
          height: 6px;
          background: #FF2D78;
          border-radius: 50%;
          animation: bounce 1.4s infinite ease-in-out both;
        }
        .typing span:nth-child(1) { animation-delay: -0.32s; }
        .typing span:nth-child(2) { animation-delay: -0.16s; }
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
      `}</style>

      {/* CHAT WIDGET */}
      <div className={`chat-window ${isOpen ? 'open' : ''}`}>
        <div className="chat-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ position: 'relative', width: 36, height: 36, borderRadius: '50%', background: '#fff', overflow: 'hidden', border: '2px solid #FF2D78' }}>
              <Image src="/hellokitty-01.svg" alt="Hello Kitty" fill style={{ objectFit: 'contain', padding: '4px' }} />
              {/* Online Dot */}
              <div style={{ position: 'absolute', bottom: 0, right: 0, width: 8, height: 8, background: '#22c55e', borderRadius: '50%', border: '1px solid #fff' }} />
            </div>
            <div>
              <h3 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '15px', fontWeight: 600, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                Hello Kitty
                <span style={{ fontSize: '10px', background: 'rgba(255,45,120,0.2)', padding: '2px 6px', borderRadius: '4px', color: '#FF2D78', fontWeight: 700 }}>BETA</span>
              </h3>
              <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: '#22c55e', margin: 0 }}>Online</p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', color: '#999', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <div className="chat-warning">
          <AlertTriangle size={14} color="#ffb700" style={{ flexShrink: 0, marginTop: '2px' }} />
          <p>Hello Kitty is in BETA and may give inaccurate info. <b>Prices are estimates only and not final.</b></p>
        </div>

        <div className="chat-body">
          {messages.map((m, i) => (
            <div key={i} className={`chat-msg ${m.role}`}>
              {m.content}
            </div>
          ))}
          {isLoading && (
            <div className="chat-msg assistant typing">
              <span></span><span></span><span></span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-area">
          <form onSubmit={sendMessage} className="chat-input-wrapper">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..."
              className="chat-input"
            />
            <button type="submit" className="chat-send" disabled={!input.trim() || isLoading}>
              <Send size={16} style={{ marginLeft: '-2px' }} />
            </button>
          </form>
        </div>
      </div>

      {/* FLOATING BUTTON */}
      {!isOpen && (
        <div className="chatbot-btn" onClick={() => setIsOpen(true)}>
          <div style={{ position: 'relative', width: 34, height: 34 }}>
            <Image src="/hellokitty-01.svg" alt="Chat" fill style={{ objectFit: 'contain' }} />
          </div>
          <div className="dot" />
        </div>
      )}
    </>
  );
}
