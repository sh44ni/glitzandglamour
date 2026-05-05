'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { X, Send, Mic, MicOff, Calendar, Clock, User, CheckCircle2, Sparkles, DollarSign } from 'lucide-react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useTranslation } from '@/lib/i18n';
import { inferGuestName } from '@/lib/inferGuestName';
import { usePathname } from 'next/navigation';

type BookingCard = {
  bookingId: string;
  service: string;
  priceLabel?: string;
  date: string;
  time: string;
  guestName: string;
  status: 'pending';
};

type QuickReply = { label: string; message: string };

type Message = {
  role: 'user' | 'assistant' | 'agent' | 'system';
  content: string;
  isVoice?: boolean;
  bookingCard?: BookingCard;
  quickReplies?: QuickReply[];
  timestamp?: number;
  agentName?: string;
};

export default function Chatbot() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { t } = useTranslation();
  const isHiddenPage = pathname?.startsWith('/admin')
    || pathname?.startsWith('/sign')
    || pathname?.startsWith('/tasks')
    || pathname?.startsWith('/onboarding');

  if (isHiddenPage) return null;

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [miniPos, setMiniPos] = useState<{ x: number; y: number } | null>(null);
  const dragRef = useRef<{ dragging: boolean; startX: number; startY: number; origX: number; origY: number; moved: boolean }>({ dragging: false, startX: 0, startY: 0, origX: 0, origY: 0, moved: false });
  const wasMinimized = useRef(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sessionRestored, setSessionRestored] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const conversationIdRef = useRef<string | null>(null);
  const [messageCount, setMessageCount] = useState(0);
  const [isExhausted, setIsExhausted] = useState(false);
  const [guestName, setGuestName] = useState<string | null>(null);
  const [hasAskedName, setHasAskedName] = useState(false);
  const [showCta, setShowCta] = useState(true);

  // Takeover state
  const [isTakenOver, setIsTakenOver] = useState(false);
  const [agentName, setAgentName] = useState<string | null>(null);
  const [transferCountdown, setTransferCountdown] = useState<number | null>(null); // seconds remaining
  const [transferTimedOut, setTransferTimedOut] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastPollTime = useRef<string | null>(null);
  const [agentTyping, setAgentTyping] = useState(false);

  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => { if (isOpen) { scrollToBottom(); setShowCta(false); } }, [messages, isOpen]);

  // ── Persist chat state to sessionStorage ─────────────────────────
  // Save messages + conversationId whenever they change (after initial restore)
  useEffect(() => {
    if (!sessionRestored) return;
    try {
      sessionStorage.setItem('hk_messages', JSON.stringify(messages));
    } catch { /* quota exceeded — ignore */ }
  }, [messages, sessionRestored]);

  useEffect(() => {
    if (!sessionRestored) return;
    if (conversationId) {
      sessionStorage.setItem('hk_convId', conversationId);
    }
  }, [conversationId, sessionRestored]);

  useEffect(() => {
    if (!sessionRestored) return;
    sessionStorage.setItem('hk_msgCount', String(messageCount));
  }, [messageCount, sessionRestored]);

  useEffect(() => {
    if (!sessionRestored) return;
    if (guestName) sessionStorage.setItem('hk_guestName', guestName);
    if (hasAskedName) sessionStorage.setItem('hk_hasAskedName', '1');
  }, [guestName, hasAskedName, sessionRestored]);

  useEffect(() => {
    if (!sessionRestored) return;
    sessionStorage.setItem('hk_takenOver', isTakenOver ? '1' : '0');
    if (agentName) sessionStorage.setItem('hk_agentName', agentName);
  }, [isTakenOver, agentName, sessionRestored]);

  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setVoiceSupported(!!SR);
  }, []);

  // Init welcome with quick replies — or restore from sessionStorage
  useEffect(() => {
    const exhaustedUntil = localStorage.getItem('kittyExhausted');
    if (exhaustedUntil && Date.now() < parseInt(exhaustedUntil)) {
      setIsExhausted(true);
      setMessages([{ role: 'assistant', content: "I'm taking a little cat nap right now 😴 Please try again in a bit! 🐱", timestamp: Date.now() }]);
      setSessionRestored(true);
      return;
    }

    // Try restoring from sessionStorage (survives refresh, clears on tab close)
    try {
      const savedMessages = sessionStorage.getItem('hk_messages');
      const savedConvId = sessionStorage.getItem('hk_convId');
      if (savedMessages && savedConvId) {
        const parsed: Message[] = JSON.parse(savedMessages);
        if (parsed.length > 0) {
          setMessages(parsed);
          setConversationId(savedConvId);
          conversationIdRef.current = savedConvId;
          // Restore other state
          const savedCount = sessionStorage.getItem('hk_msgCount');
          if (savedCount) setMessageCount(parseInt(savedCount) || 0);
          const savedGuestName = sessionStorage.getItem('hk_guestName');
          if (savedGuestName) { setGuestName(savedGuestName); setHasAskedName(true); }
          if (sessionStorage.getItem('hk_hasAskedName') === '1') setHasAskedName(true);
          // Restore takeover state
          if (sessionStorage.getItem('hk_takenOver') === '1') {
            setIsTakenOver(true);
            setAgentName(sessionStorage.getItem('hk_agentName') || 'Team Member');
            // Resume polling for agent messages
            startTransferCountdown(savedConvId);
          }
          setSessionRestored(true);
          return; // Skip welcome — we have history
        }
      }
    } catch { /* corrupted sessionStorage — ignore, show welcome */ }

    let name = null;
    const welcomeReplies: QuickReply[] = [
      { label: '💅 View Services', message: 'Show me your services' },
      { label: '📅 Book Appointment', message: "I'd like to book an appointment" },
      { label: 'ℹ️ Studio Info', message: 'Tell me about the studio' },
    ];
    let welcome = "Hey there! I'm Hello Kitty 🐱✨ Your cute AI assistant for Glitz & Glamour Studio!\n\nI can help you browse services, check availability, and even book appointments right here in chat! 💅\n\nWhat can I help you with today? 💕";
    if (session?.user?.name) {
      name = session.user.name.split(' ')[0];
      welcome = `Hey ${name}! 💕 Welcome back to Glitz & Glamour! 🐱✨\n\nI can help you browse services, check availability, and book appointments right here! What are you looking for today? 💅`;
      setGuestName(name);
      setHasAskedName(true);
    }
    setMessages([{ role: 'assistant', content: welcome, quickReplies: welcomeReplies, timestamp: Date.now() }]);
    setSessionRestored(true);
  }, [session]);

  // ── Takeover polling & countdown ───────────────────────────────────
  const isWorkHours = () => {
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes();
    const total = h * 60 + m;
    return total >= 510 && total <= 1140; // 8:30 AM to 7:00 PM
  };

  const startTransferCountdown = useCallback((convId?: string) => {
    const activeConvId = convId || conversationIdRef.current;
    const seconds = isWorkHours() ? 5 * 60 : 10 * 60;
    setTransferCountdown(seconds);
    setTransferTimedOut(false);
    lastPollTime.current = new Date().toISOString();

    // Countdown timer
    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setTransferCountdown(prev => {
        if (prev === null || prev <= 1) {
          // Time's up!
          clearInterval(countdownRef.current!);
          countdownRef.current = null;
          if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
          setTransferTimedOut(true);
          setTransferCountdown(null);
          setMessages(p => [...p, {
            role: 'assistant',
            content: "I'm so sorry! 😿 Our team is currently busy helping other clients and couldn't join in time.\n\nPlease reach out directly:\n📞 Call/Text Jojo: (760) 290-5910\n📧 Email: info@glitzandglamours.com\n🌐 Book online: glitzandglamours.com/book\n\nWe truly apologize for the wait! 💕",
            timestamp: Date.now(),
            quickReplies: [
              { label: '📞 Call Jojo', message: "What's Jojo's phone number?" },
              { label: '📅 Book Online', message: 'I\'d like to book an appointment' },
            ],
          }]);
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    // Poll for takeover status every 3s
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      // Use ref to always get latest conversationId
      const cid = conversationIdRef.current || activeConvId;
      if (!cid) return;
      try {
        const params = new URLSearchParams({ conversationId: cid });
        if (lastPollTime.current) params.set('since', lastPollTime.current);
        const res = await fetch(`/api/chat/status?${params}`);
        const data = await res.json();
        lastPollTime.current = new Date().toISOString();

        // Add new agent/system messages
        if (data.newMessages?.length > 0) {
          setMessages(prev => {
            const existingIds = new Set(prev.map((m: any) => m.pollId).filter(Boolean));
            const fresh = data.newMessages.filter((m: any) => !existingIds.has(m.id));
            if (fresh.length === 0) return prev;
            return [...prev, ...fresh.map((m: any) => ({
              role: m.role as 'agent' | 'system',
              content: m.content,
              timestamp: new Date(m.createdAt).getTime(),
              agentName: data.agentName || undefined,
              pollId: m.id,
            } as Message & { pollId?: string }))];
          });
        }

        if (data.isTakenOver) {
          // Agent connected!
          setIsTakenOver(true);
          setAgentName(data.agentName);
          setTransferCountdown(null);
          if (countdownRef.current) { clearInterval(countdownRef.current); countdownRef.current = null; }
          // Keep polling for new messages
        }

        // Agent typing indicator
        setAgentTyping(!!data.agentTyping);

        if (!data.isTakenOver) {
          // Check if we were previously taken over
          setIsTakenOver(prev => {
            if (prev) {
              // Agent released — Kitty is back
              setAgentName(null);
              if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
            }
            return false;
          });
        }
      } catch { /* ignore polling errors */ }
    }, 3000);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  const toggleVoice = useCallback(async () => {
    if (isListening) { recognitionRef.current?.stop(); setIsListening(false); return; }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert('Voice not supported in this browser'); return; }
    try {
      // Request mic permission explicitly — triggers browser prompt
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(t => t.stop()); // release immediately, SpeechRecognition uses its own stream

      const recognition = new SR();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      recognition.onresult = (e: any) => {
        const transcript = e.results[0][0].transcript;
        setInput(prev => prev ? `${prev} ${transcript}` : transcript);
        setIsListening(false);
        inputRef.current?.focus();
      };
      recognition.onerror = (e: any) => {
        console.error('[voice] error:', e.error);
        setIsListening(false);
      };
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
      recognition.start();
      setIsListening(true);
    } catch (err) {
      console.error('[voice] Mic permission denied:', err);
      alert('Please allow microphone access to use voice input');
    }
  }, [isListening]);

  const handleQuickReply = (qr: QuickReply) => {
    setInput(qr.message);
    setTimeout(() => {
      const form = document.getElementById('hk-chat-form') as HTMLFormElement;
      if (form) form.requestSubmit();
    }, 50);
  };

  const sendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading || isExhausted) return;

    if (messageCount >= 25) {
      const exhaustedTime = Date.now() + 30 * 60 * 1000;
      localStorage.setItem('kittyExhausted', exhaustedTime.toString());
      setIsExhausted(true);
      setMessages(prev => [...prev, { role: 'user', content: input.trim(), timestamp: Date.now() }, { role: 'assistant', content: "I need a little cat nap now 😴 I've been chatting a lot! Try again in 30 minutes, or visit our booking page directly! 🐱💕", timestamp: Date.now() }]);
      setInput('');
      return;
    }

    const currentInput = input.trim();
    const wasVoice = isListening;
    setInput('');
    setIsLoading(true);

    // Remove quick replies from previous messages
    setMessages(prev => prev.map(m => ({ ...m, quickReplies: undefined })));

    let updatedGuestName = guestName;
    if (!hasAskedName && !session) {
      const inferred = inferGuestName(currentInput);
      if (inferred) {
        updatedGuestName = inferred;
        setGuestName(inferred);
        setHasAskedName(true);
        const first = inferred.split(/\s+/)[0];
        setMessages(prev => [...prev,
          { role: 'user', content: currentInput, isVoice: wasVoice, timestamp: Date.now() },
          { role: 'assistant', content: `Aww, nice to meet you ${first}! 🐱💕 How can I help you today? ✨`, timestamp: Date.now(),
            quickReplies: [
              { label: '💅 View Services', message: 'Show me your services' },
              { label: '📅 Book Now', message: "I'd like to book an appointment" },
            ]
          }
        ]);
        setMessageCount(prev => prev + 1);
        setIsLoading(false);
        return;
      }
      setHasAskedName(true);
    }

    const userMsg: Message = { role: 'user', content: currentInput, isVoice: wasVoice, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setMessageCount(prev => prev + 1);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg]
            .filter(m => m.role === 'user' || m.role === 'assistant')
            .map(m => ({ role: m.role, content: m.content })),
          conversationId,
          guestName: updatedGuestName,
        }),
      });
      const data = await res.json();
      if (data.conversationId) {
        setConversationId(data.conversationId);
        conversationIdRef.current = data.conversationId;
      }

      // Handle takeover mode — no AI reply, just store for agent
      if (data.isTakenOver) {
        setIsTakenOver(true);
        setAgentName(data.agentName);
        // Don't add a reply — agent will respond via polling
      } else if (res.ok && data.reply) {
        const assistantMsg: Message = {
          role: 'assistant',
          content: data.reply,
          timestamp: Date.now(),
          quickReplies: data.quickReplies || undefined,
        };
        if (data.bookingCard) assistantMsg.bookingCard = data.bookingCard;
        setMessages(prev => [...prev, assistantMsg]);

        // Start countdown if transfer was initiated
        if (data.transferInitiated) {
          startTransferCountdown(data.conversationId);
        }
      } else if (!data.isTakenOver) {
        setMessages(prev => [...prev, { role: 'assistant', content: "Oops! Something went wrong 🐱 Please try again!", timestamp: Date.now() }]);
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "I can't connect right now 🐱 Please try again in a moment!", timestamp: Date.now() }]);
    } finally {
      setIsLoading(false);
    }
  };

  const fmtDate = (d: string) => {
    try { return new Date(d + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }); } catch { return d; }
  };

  const relativeTime = (ts?: number) => {
    if (!ts) return '';
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  // Simple bold/line-break renderer
  const renderContent = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      // Convert bullet lines
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <>
      <style>{`
        .hk-btn{position:fixed;bottom:80px;right:20px;width:62px;height:62px;border-radius:50%;background:linear-gradient(135deg,#FF2D78,#FF6BA8);box-shadow:0 4px 20px rgba(255,45,120,0.45),0 0 0 0 rgba(255,45,120,0.4);display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:50;transition:transform .2s;animation:hkPulse 2.5s infinite}
        .hk-btn:hover{transform:scale(1.08)}
        @keyframes hkPulse{0%,100%{box-shadow:0 4px 20px rgba(255,45,120,0.45),0 0 0 0 rgba(255,45,120,0.4)}50%{box-shadow:0 4px 20px rgba(255,45,120,0.45),0 0 0 8px rgba(255,45,120,0)}}
        .hk-btn .hk-dot{position:absolute;top:2px;right:2px;width:14px;height:14px;background:#22c55e;border:2.5px solid #fff;border-radius:50%}
        .hk-cta{position:fixed;bottom:97px;right:92px;background:#fff;color:#FF2D78;font-family:'Poppins',sans-serif;font-weight:600;font-size:12px;padding:8px 16px;border-radius:20px;border-bottom-right-radius:4px;box-shadow:0 4px 18px rgba(0,0,0,0.15);z-index:49;display:flex;align-items:center;gap:8px;animation:hkFloat 2.5s infinite}
        @keyframes hkFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
        .hk-cta button{background:rgba(255,45,120,0.1);border:none;color:#FF2D78;border-radius:50%;width:18px;height:18px;display:flex;align-items:center;justify-content:center;cursor:pointer}
        @media(min-width:768px){.hk-btn{bottom:24px;right:24px}.hk-cta{bottom:41px;right:96px}}

        .hk-win{position:fixed;bottom:90px;right:20px;width:calc(100% - 40px);max-width:400px;height:560px;max-height:calc(100vh - 120px);background:rgba(15,10,20,0.92);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border:1px solid rgba(255,45,120,0.2);border-radius:24px;box-shadow:0 16px 50px rgba(0,0,0,0.6),0 0 30px rgba(255,45,120,0.08);display:flex;flex-direction:column;z-index:51;overflow:hidden;opacity:0;pointer-events:none;transform:translateY(16px) scale(0.96);transition:all .3s cubic-bezier(0.16,1,0.3,1)}
        .hk-win.open{opacity:1;pointer-events:auto;transform:translateY(0) scale(1)}
        @media(min-width:768px){.hk-win{bottom:95px;right:24px}}

        .hk-head{padding:16px 18px;background:linear-gradient(135deg,rgba(255,45,120,0.12),rgba(139,0,67,0.08));border-bottom:1px solid rgba(255,255,255,0.06);display:flex;align-items:center;justify-content:space-between}
        .hk-head-info{display:flex;align-items:center;gap:10px}
        .hk-avatar{position:relative;width:38px;height:38px;border-radius:50%;background:#fff;overflow:hidden;border:2px solid #FF2D78;flex-shrink:0}
        .hk-avatar .dot{position:absolute;bottom:0;right:0;width:10px;height:10px;background:#22c55e;border-radius:50%;border:2px solid #fff}
        .hk-close{background:rgba(255,255,255,0.06);border:none;color:#999;cursor:pointer;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;transition:all .15s}
        .hk-close:hover{background:rgba(255,255,255,0.1);color:#fff}

        .hk-body{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px;scroll-behavior:smooth}
        .hk-body::-webkit-scrollbar{width:4px}
        .hk-body::-webkit-scrollbar-thumb{background:rgba(255,45,120,0.2);border-radius:4px}

        .hk-msg{max-width:88%;padding:10px 14px;font-family:'Poppins',sans-serif;font-size:13.5px;line-height:1.55;white-space:pre-wrap;word-break:break-word;animation:hkFadeIn .25s ease-out}
        @keyframes hkFadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        .hk-msg.assistant{align-self:flex-start;background:rgba(255,255,255,0.06);color:#eee;border-radius:18px 18px 18px 4px}
        .hk-msg.user{align-self:flex-end;background:linear-gradient(135deg,#FF2D78,#e0266a);color:#fff;border-radius:18px 18px 4px 18px}
        .hk-msg-time{font-size:10px;color:rgba(255,255,255,0.25);margin-top:3px;font-family:'Poppins',sans-serif}

        .hk-msg-group{display:flex;flex-direction:column}
        .hk-msg-group.user-group{align-items:flex-end}
        .hk-msg-group.assistant-group{align-items:flex-start}

        .hk-booking-card{align-self:flex-start;max-width:90%;background:linear-gradient(135deg,rgba(34,197,94,0.08),rgba(34,197,94,0.03));border:1px solid rgba(34,197,94,0.25);border-radius:16px;padding:16px;animation:hkFadeIn .3s ease-out}

        .hk-qr-wrap{display:flex;flex-wrap:wrap;gap:6px;animation:hkFadeIn .3s ease-out;margin-top:4px;max-width:88%}
        .hk-qr-btn{background:rgba(255,45,120,0.08);border:1px solid rgba(255,45,120,0.25);color:#FF6BA8;font-family:'Poppins',sans-serif;font-size:12px;font-weight:500;padding:7px 14px;border-radius:20px;cursor:pointer;transition:all .2s;white-space:nowrap}
        .hk-qr-btn:hover{background:rgba(255,45,120,0.18);border-color:rgba(255,45,120,0.4);color:#fff;transform:translateY(-1px)}

        .hk-input-area{padding:12px 14px;border-top:1px solid rgba(255,255,255,0.06);background:rgba(0,0,0,0.25)}
        .hk-input-wrap{display:flex;align-items:center;gap:6px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.08);border-radius:50px;padding:4px 4px 4px 16px;transition:border-color .2s}
        .hk-input-wrap:focus-within{border-color:rgba(255,45,120,0.4)}
        .hk-input{flex:1;background:transparent;border:none;color:#fff;font-family:'Poppins',sans-serif;font-size:14px;padding:8px 0;outline:none;min-width:0}
        .hk-input::placeholder{color:#555}
        .hk-icon-btn{width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:none;cursor:pointer;transition:all .15s;flex-shrink:0}
        .hk-send{background:#FF2D78;color:#fff}
        .hk-send:disabled{background:rgba(255,255,255,0.08);color:#555;cursor:not-allowed}
        .hk-mic{background:rgba(255,255,255,0.06);color:#aaa}
        .hk-mic:hover{background:rgba(255,255,255,0.1);color:#fff}
        .hk-mic.active{background:rgba(255,60,60,0.2);color:#ff4444;animation:hkMicPulse 1.2s infinite}
        @keyframes hkMicPulse{0%,100%{box-shadow:0 0 0 0 rgba(255,60,60,0.3)}50%{box-shadow:0 0 0 8px rgba(255,60,60,0)}}

        .hk-typing{display:flex;align-items:center;gap:8px;padding:8px 14px;align-self:flex-start;background:rgba(255,255,255,0.06);border-radius:18px 18px 18px 4px;white-space:nowrap}
        .hk-typing-dots{display:flex;gap:4px;flex-shrink:0}
        .hk-typing-dots span{width:7px;height:7px;background:#FF2D78;border-radius:50%;animation:hkBounce 1.4s infinite ease-in-out both}
        .hk-typing-dots span:nth-child(1){animation-delay:-0.32s}
        .hk-typing-dots span:nth-child(2){animation-delay:-0.16s}

        .hk-msg.agent{align-self:flex-start;background:linear-gradient(135deg,rgba(99,102,241,0.12),rgba(99,102,241,0.06));border:1px solid rgba(99,102,241,0.2);color:#eee;border-radius:18px 18px 18px 4px}
        .hk-msg-group.agent-group{align-items:flex-start}
        .hk-agent-badge{display:inline-flex;align-items:center;gap:4px;font-size:10px;color:#818cf8;font-weight:600;margin-bottom:4px;font-family:'Poppins',sans-serif}
        .hk-system-pill{align-self:center;text-align:center;font-family:'Poppins',sans-serif;font-size:11px;color:#888;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);border-radius:20px;padding:6px 16px;animation:hkFadeIn .3s ease-out}
        .hk-countdown-bar{padding:10px 16px;background:linear-gradient(135deg,rgba(255,183,0,0.1),rgba(255,183,0,0.05));border-bottom:1px solid rgba(255,183,0,0.15);display:flex;align-items:center;justify-content:space-between;font-family:'Poppins',sans-serif;animation:hkFadeIn .3s ease-out}
        .hk-countdown-text{font-size:12px;color:#ffb700;font-weight:500}
        .hk-countdown-timer{font-size:14px;color:#fff;font-weight:700;font-variant-numeric:tabular-nums}
        .hk-connected-bar{padding:10px 16px;background:linear-gradient(135deg,rgba(34,197,94,0.1),rgba(34,197,94,0.05));border-bottom:1px solid rgba(34,197,94,0.15);display:flex;align-items:center;gap:8px;font-family:'Poppins',sans-serif;animation:hkFadeIn .3s ease-out}
        .hk-connected-dot{width:8px;height:8px;background:#22c55e;border-radius:50%;animation:hkPulse 2s infinite}
        .hk-connected-text{font-size:12px;color:#22c55e;font-weight:600}
        @keyframes hkBounce{0%,80%,100%{transform:scale(0)}40%{transform:scale(1)}}
        .hk-typing-text{font-family:'Poppins',sans-serif;font-size:11px;color:#888;white-space:nowrap}
        .hk-voice-badge{display:inline-flex;align-items:center;gap:3px;font-size:10px;color:rgba(255,255,255,0.5);margin-top:4px}
      `}</style>

      {/* Chat Window */}
      <div className={`hk-win ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="hk-head">
          <div className="hk-head-info">
            <div className="hk-avatar">
              <Image src="/hellokitty-01.svg" alt="Hello Kitty" fill style={{ objectFit: 'contain', padding: '4px' }} />
              <div className="dot" />
            </div>
            <div>
              <h3 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '15px', fontWeight: 700, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                {isTakenOver ? agentName || 'Team Member' : 'Hello Kitty'}
                <span style={{ fontSize: '9px', background: isTakenOver ? 'linear-gradient(135deg,#6366f1,#818cf8)' : 'linear-gradient(135deg,#FF2D78,#FF6BA8)', padding: '2px 8px', borderRadius: '10px', color: '#fff', fontWeight: 600, letterSpacing: '0.5px' }}>{isTakenOver ? 'LIVE' : 'AI'}</span>
              </h3>
              <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: '#22c55e', margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: 6, height: 6, background: '#22c55e', borderRadius: '50%', display: 'inline-block' }} />
                {isTakenOver ? `${agentName || 'Agent'} is here to help` : 'Online — can book for you'}
              </p>
            </div>
          </div>
          <button className="hk-close" onClick={() => { setIsOpen(false); if (wasMinimized.current) setIsMinimized(true); }} title="Close">
            <X size={16} />
          </button>
        </div>

        {/* Countdown banner */}
        {transferCountdown !== null && (
          <div className="hk-countdown-bar">
            <span className="hk-countdown-text">⏳ Connecting you to our team...</span>
            <span className="hk-countdown-timer">{Math.floor(transferCountdown / 60)}:{String(transferCountdown % 60).padStart(2, '0')}</span>
          </div>
        )}

        {/* Connected agent banner */}
        {isTakenOver && !transferCountdown && (
          <div className="hk-connected-bar">
            <span className="hk-connected-dot" />
            <span className="hk-connected-text">🟢 Connected to {agentName || 'our team'}</span>
          </div>
        )}

        {/* Messages */}
        <div className="hk-body">
          {messages.map((m, i) => {
            // System messages as centered pills
            if (m.role === 'system') {
              return <div key={i} className="hk-system-pill">{m.content}</div>;
            }

            const groupClass = m.role === 'user' ? 'user-group' : m.role === 'agent' ? 'agent-group' : 'assistant-group';
            return (
            <div key={i} className={`hk-msg-group ${groupClass}`}>
              {m.role === 'agent' && <div className="hk-agent-badge">👤 {m.agentName || agentName || 'Team Member'}</div>}
              <div className={`hk-msg ${m.role}`}>
                {renderContent(m.content)}
                {m.isVoice && <div className="hk-voice-badge"><Mic size={10} /> voice</div>}
                {m.timestamp && <div className="hk-msg-time">{relativeTime(m.timestamp)}</div>}
              </div>
              {/* Booking confirmation card */}
              {m.bookingCard && (
                <div className="hk-booking-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <CheckCircle2 size={18} color="#22c55e" />
                    <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', fontWeight: 700, color: '#22c55e' }}>Booking Request Submitted!</span>
                  </div>
                  <div style={{ display: 'grid', gap: '8px' }}>
                    {[
                      { icon: <Sparkles size={13} color="#FF2D78" />, label: 'Service', value: m.bookingCard.service },
                      { icon: <DollarSign size={13} color="#FF2D78" />, label: 'Price', value: m.bookingCard.priceLabel || 'Discussed in person' },
                      { icon: <Calendar size={13} color="#FF2D78" />, label: 'Date', value: fmtDate(m.bookingCard.date) },
                      { icon: <Clock size={13} color="#FF2D78" />, label: 'Time', value: m.bookingCard.time },
                      { icon: <User size={13} color="#FF2D78" />, label: 'Name', value: m.bookingCard.guestName },
                    ].map((row, j) => (
                      <div key={j} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                        {row.icon}
                        <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: '#888', width: '50px' }}>{row.label}</span>
                        <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12.5px', color: '#fff', fontWeight: 500 }}>{row.value}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: '12px', padding: '8px 10px', background: 'rgba(255,183,0,0.08)', borderRadius: '8px', border: '1px solid rgba(255,183,0,0.15)' }}>
                    <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: '#ffb700', margin: 0, lineHeight: 1.5 }}>
                      ⏳ Pending — We&apos;ll reach out to finalize your price &amp; collect a deposit to confirm
                    </p>
                  </div>
                </div>
              )}
              {/* Quick reply buttons */}
              {m.quickReplies && m.quickReplies.length > 0 && !isLoading && (
                <div className="hk-qr-wrap">
                  {m.quickReplies.map((qr, qi) => (
                    <button key={qi} className="hk-qr-btn" onClick={() => handleQuickReply(qr)}>
                      {qr.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            );
          })}
          {isLoading && (
            <div className="hk-typing">
              <div className="hk-typing-dots"><span /><span /><span /></div>
              <span className="hk-typing-text">Hello Kitty is typing...</span>
            </div>
          )}
          {agentTyping && !isLoading && (
            <div className="hk-typing" style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.15)' }}>
              <div className="hk-typing-dots"><span style={{ background: '#818cf8' }} /><span style={{ background: '#818cf8' }} /><span style={{ background: '#818cf8' }} /></div>
              <span className="hk-typing-text" style={{ color: '#818cf8' }}>{agentName || 'Agent'} is typing...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="hk-input-area">
          <form id="hk-chat-form" onSubmit={sendMessage} className="hk-input-wrap">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={isListening ? 'Listening...' : 'Ask me anything...'}
              className="hk-input"
              disabled={isExhausted}
            />
            {voiceSupported && (
              <button type="button" className={`hk-icon-btn hk-mic ${isListening ? 'active' : ''}`} onClick={toggleVoice} disabled={isExhausted}>
                {isListening ? <MicOff size={16} /> : <Mic size={16} />}
              </button>
            )}
            <button type="submit" className="hk-icon-btn hk-send" disabled={!input.trim() || isLoading || isExhausted}>
              <Send size={15} style={{ marginLeft: '-1px' }} />
            </button>
          </form>
          <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '10px', color: '#444', textAlign: 'center', margin: '6px 0 0', lineHeight: 1.3 }}>
            Hello Kitty AI may make mistakes. Prices confirmed in person.
          </p>
        </div>
      </div>

      {/* Minimized — tiny draggable kitty circle */}
      {!isOpen && isMinimized && (
        <div
          onPointerDown={e => {
            const el = e.currentTarget;
            const rect = el.getBoundingClientRect();
            dragRef.current = { dragging: true, startX: e.clientX, startY: e.clientY, origX: rect.left, origY: rect.top, moved: false };
            el.setPointerCapture(e.pointerId);
            el.style.transition = 'none';
          }}
          onPointerMove={e => {
            const d = dragRef.current;
            if (!d.dragging) return;
            const dx = e.clientX - d.startX;
            const dy = e.clientY - d.startY;
            if (Math.abs(dx) > 4 || Math.abs(dy) > 4) d.moved = true;
            const newX = Math.max(0, Math.min(window.innerWidth - 42, d.origX + dx));
            const newY = Math.max(0, Math.min(window.innerHeight - 42, d.origY + dy));
            setMiniPos({ x: newX, y: newY });
          }}
          onPointerUp={e => {
            const d = dragRef.current;
            d.dragging = false;
            e.currentTarget.style.transition = 'all 0.2s';
            if (!d.moved) {
              setIsMinimized(false);
              setShowCta(true);
            }
          }}
          style={{
            position: 'fixed',
            left: miniPos ? `${miniPos.x}px` : 'auto',
            top: miniPos ? `${miniPos.y}px` : 'auto',
            right: miniPos ? 'auto' : '20px',
            bottom: miniPos ? 'auto' : '80px',
            zIndex: 50,
            width: '42px', height: '42px', borderRadius: '50%',
            background: 'rgba(15,10,20,0.9)', border: '1.5px solid rgba(255,45,120,0.35)',
            boxShadow: '0 4px 16px rgba(255,45,120,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'grab', transition: 'all 0.2s',
            animation: 'hkPulse 2.5s infinite',
            touchAction: 'none',
          }}
        >
          <div style={{ position: 'relative', width: 26, height: 26, pointerEvents: 'none' }}>
            <Image src="/hellokitty-01.svg" alt="Kitty" fill style={{ objectFit: 'contain' }} />
          </div>
          <span style={{ position: 'absolute', top: '2px', right: '2px', width: '10px', height: '10px', background: '#22c55e', borderRadius: '50%', border: '2px solid rgba(15,10,20,0.9)', pointerEvents: 'none' }} />
        </div>
      )}

      {/* CTA Label — × on banner minimizes everything */}
      {!isOpen && !isMinimized && showCta && !isExhausted && (
        <div className="hk-cta">
          ✨ Need help booking?
          <button onClick={e => { e.stopPropagation(); setIsMinimized(true); wasMinimized.current = true; }}><X size={10} strokeWidth={3} /></button>
        </div>
      )}

      {/* Floating Button — visible when NOT minimized */}
      {!isOpen && !isMinimized && (
        <div className="hk-btn" onClick={() => setIsOpen(true)}>
          <div style={{ position: 'relative', width: 34, height: 34 }}>
            <Image src="/hellokitty-01.svg" alt="Chat" fill style={{ objectFit: 'contain' }} />
          </div>
          <div className="hk-dot" />
        </div>
      )}
    </>
  );
}
