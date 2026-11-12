'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { X, Volume2, VolumeX, RotateCcw, ImagePlus } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { inferGuestName } from '@/lib/inferGuestName';
import { usePathname } from 'next/navigation';
import { EMOTE_STATUS_LABELS, isValidChatUploadUrl, type KittyEmote } from '@/lib/kittyEmotes';
import KittyAvatar from './chat/KittyAvatar';
import ChatMessageList from './chat/ChatMessageList';
import ChatComposer from './chat/ChatComposer';
import type { ChatMessageItem, PendingAttachment, QuickReply } from './chat/types';

const ImageLightbox = dynamic(() => import('@/components/ImageLightbox'), { ssr: false });

type PolledMessage = ChatMessageItem & { pollId?: string };

type SpeechRecognitionEventLike = {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
};

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

type WindowWithSpeechAndAudio = Window & {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
  webkitAudioContext?: typeof AudioContext;
};

type PolledStatusMessage = {
  id: string;
  role: 'agent' | 'system';
  content: string;
  attachments?: string[];
  createdAt: string;
};

const MAX_BOOKING_PHOTOS = 5;

const BANNER_PHRASES = [
  'Can I book for you? 💅',
  'Send nail or hair inspo! 📸',
  'Want to book an appointment? ✨',
  'Looking for open slots? 📅',
  "Ask me prices or let's book! 🐱",
  "Ready for fresh nails? Let's book! 💖",
  'Book your glam session in seconds! 🎀',
  'Bridal & event glam available! 💍✨',
];

const WELCOME_QUICK_REPLIES: QuickReply[] = [
  { label: '💅 Services & Prices', message: 'Show me your services and starting prices' },
  { label: '📅 Open Slots', message: 'When is the next open appointment?' },
  { label: '📸 Upload Inspo', message: "I'd like to share an inspo photo and check availability" },
  { label: '💍 Special Events', message: 'Tell me about your special event & bridal services' },
];

function buildWelcomeMessage(firstName?: string | null): PolledMessage {
  const cleanName = firstName?.trim().split(/\s+/)[0];
  const content = cleanName
    ? `Hey ${cleanName}! 💕 Welcome back to Glitz & Glamour! Kitty 2.0 is ready to check openings, view your inspo photos, or book your glam! 💅`
    : "Hey there! I'm Hello Kitty 2.0 🐱✨ Your VIP assistant for Glitz & Glamour Studio!\n\nI can check live openings, view your inspo photos, and book right here. What look are we planning today? 💕";
  return {
    role: 'assistant',
    emote: 'happy',
    content,
    quickReplies: WELCOME_QUICK_REPLIES,
    timestamp: Date.now(),
  };
}

export default function Chatbot() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isHiddenPage =
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/sign') ||
    pathname?.startsWith('/onboarding');

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [miniPos, setMiniPos] = useState<{ x: number; y: number } | null>(null);
  const dragRef = useRef<{
    dragging: boolean;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    moved: boolean;
  }>({ dragging: false, startX: 0, startY: 0, origX: 0, origY: 0, moved: false });
  const wasMinimized = useRef(false);

  const [messages, setMessages] = useState<PolledMessage[]>([]);
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
  const [bannerPhraseIndex, setBannerPhraseIndex] = useState(0);
  const [showRestartConfirm, setShowRestartConfirm] = useState(false);

  // Inspo upload + lightbox state
  const [pendingAttachments, setPendingAttachments] = useState<PendingAttachment[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const dragCounterRef = useRef(0);
  const [lightboxState, setLightboxState] = useState<{ images: string[]; index: number } | null>(null);

  // Mobile keyboard-aware viewport height tracking (active only when virtual keyboard is open)
  const [mobileViewportStyle, setMobileViewportStyle] = useState<{ top: number; height: number } | null>(null);

  // Takeover state
  const [isTakenOver, setIsTakenOver] = useState(false);
  const [agentName, setAgentName] = useState<string | null>(null);
  const [transferCountdown, setTransferCountdown] = useState<number | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastPollTime = useRef<string | null>(null);
  const [agentTyping, setAgentTyping] = useState(false);

  // Voice input
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  const bodyRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const initializedRef = useRef(false);
  const isLoadingRef = useRef(false);
  const wasOpenRef = useRef(false);
  const prevMessageCountRef = useRef(0);

  useEffect(() => {
    isLoadingRef.current = isLoading;
  }, [isLoading]);

  // Total unique inspo photos already submitted inside this conversation
  const totalConversationPhotos = useMemo(() => {
    const seen = new Set<string>();
    for (const m of messages) {
      for (const url of m.attachments || []) {
        if (isValidChatUploadUrl(url)) seen.add(url);
      }
    }
    return seen.size;
  }, [messages]);

  // Rotate floating banner phrase periodically
  useEffect(() => {
    setBannerPhraseIndex(Math.floor(Math.random() * BANNER_PHRASES.length));
    const interval = setInterval(() => {
      setBannerPhraseIndex((prev) => (prev + 1) % BANNER_PHRASES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Reused single Web Audio API synthesizer
  const [soundEnabled, setSoundEnabled] = useState(true);
  useEffect(() => {
    const s = localStorage.getItem('hk_sound');
    if (s !== null) setSoundEnabled(s === '1');
  }, []);

  useEffect(() => {
    return () => {
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  const toggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev;
      localStorage.setItem('hk_sound', next ? '1' : '0');
      return next;
    });
  };

  const playPop = useCallback(
    (type: 'send' | 'receive' | 'sparkle' = 'send') => {
      if (!soundEnabled || typeof window === 'undefined') return;
      try {
        const w = window as WindowWithSpeechAndAudio;
        const AudioCtx = window.AudioContext || w.webkitAudioContext;
        if (!AudioCtx) return;
        if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
          audioCtxRef.current = new AudioCtx();
        }
        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') {
          ctx.resume().catch(() => {});
        }
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        const now = ctx.currentTime;
        if (type === 'send') {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(420, now);
          osc.frequency.exponentialRampToValueAtTime(780, now + 0.08);
          gain.gain.setValueAtTime(0.06, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
          osc.start(now);
          osc.stop(now + 0.08);
        } else if (type === 'receive') {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(680, now);
          osc.frequency.exponentialRampToValueAtTime(500, now + 0.1);
          gain.gain.setValueAtTime(0.05, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
          osc.start(now);
          osc.stop(now + 0.1);
        } else {
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(800, now);
          osc.frequency.exponentialRampToValueAtTime(1400, now + 0.14);
          gain.gain.setValueAtTime(0.07, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
          osc.start(now);
          osc.stop(now + 0.14);
        }
      } catch {
        // Audio context might be blocked prior to gesture
      }
    },
    [soundEnabled]
  );

  // Sparkle bursts
  const [sparkles, setSparkles] = useState<{ id: number; x: number; y: number; char: string }[]>([]);
  const triggerSparkles = useCallback(() => {
    playPop('sparkle');
    const emojis = ['✨', '💖', '🎀', '💅', '⭐', '🌸'];
    const newSparkles = Array.from({ length: 12 }).map((_, i) => ({
      id: Date.now() + i,
      x: 15 + Math.random() * 70,
      y: 25 + Math.random() * 50,
      char: emojis[Math.floor(Math.random() * emojis.length)],
    }));
    setSparkles(newSparkles);
    setTimeout(() => setSparkles([]), 1400);
  }, [playPop]);

  // Track mobile virtual keyboard resize cleanly without shifting static scroll viewport
  useEffect(() => {
    if (!isOpen || typeof window === 'undefined' || !window.visualViewport) {
      setMobileViewportStyle(null);
      return;
    }
    const vv = window.visualViewport;
    const updateViewport = () => {
      const keyboardOpen = window.innerWidth < 640 && vv.height < window.innerHeight - 90;
      if (keyboardOpen) {
        setMobileViewportStyle({
          top: Math.max(4, Math.round(vv.offsetTop + 4)),
          height: Math.max(280, Math.round(vv.height - 10)),
        });
      } else {
        setMobileViewportStyle(null);
      }
    };
    updateViewport();
    vv.addEventListener('resize', updateViewport);
    vv.addEventListener('scroll', updateViewport);
    window.addEventListener('resize', updateViewport);
    return () => {
      vv.removeEventListener('resize', updateViewport);
      vv.removeEventListener('scroll', updateViewport);
      window.removeEventListener('resize', updateViewport);
    };
  }, [isOpen]);

  // Escape key closes lightbox -> restart modal -> chat window
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (lightboxState) return; // ImageLightbox handles its own Escape
      if (showRestartConfirm) {
        setShowRestartConfirm(false);
        return;
      }
      setIsOpen(false);
      if (wasMinimized.current) setIsMinimized(true);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, lightboxState, showRestartConfirm]);

  const handleConfirmRestart = () => {
    setShowRestartConfirm(false);
    sessionStorage.removeItem('hk_messages');
    sessionStorage.removeItem('hk_convId');
    sessionStorage.removeItem('hk_msgCount');
    sessionStorage.removeItem('hk_takenOver');
    sessionStorage.removeItem('hk_agentName');
    setConversationId(null);
    conversationIdRef.current = null;
    setMessageCount(0);
    setIsTakenOver(false);
    setAgentName(null);
    setPendingAttachments((prev) => {
      prev.forEach((a) => URL.revokeObjectURL(a.previewUrl));
      return [];
    });
    setUploadError(null);
    playPop('sparkle');
    triggerSparkles();
    setMessages([buildWelcomeMessage(session?.user?.name)]);
  };

  useEffect(() => {
    if (!isOpen) {
      wasOpenRef.current = false;
      return;
    }
    setShowCta(false);
    const el = bodyRef.current;
    if (!el) return;
    const justOpened = !wasOpenRef.current;
    const countGrew = messages.length > prevMessageCountRef.current;
    wasOpenRef.current = true;
    prevMessageCountRef.current = messages.length;
    if (!justOpened && !countGrew) return;

    const frame = requestAnimationFrame(() => {
      if (justOpened) {
        el.scrollTop = el.scrollHeight;
      } else {
        el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [messages, isOpen]);

  // Persist lightweight chat state to sessionStorage
  useEffect(() => {
    if (!sessionRestored) return;
    try {
      sessionStorage.setItem('hk_messages', JSON.stringify(messages));
    } catch {
      /* ignore storage quota */
    }
  }, [messages, sessionRestored]);

  useEffect(() => {
    if (!sessionRestored || !conversationId) return;
    sessionStorage.setItem('hk_convId', conversationId);
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
    const w = window as WindowWithSpeechAndAudio;
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    setVoiceSupported(!!SR);
  }, []);

  // Init welcome or restore once on mount
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const exhaustedUntil = localStorage.getItem('kittyExhausted');
    if (exhaustedUntil && Date.now() < parseInt(exhaustedUntil, 10)) {
      setIsExhausted(true);
      setMessages([
        {
          role: 'assistant',
          emote: 'sleepy',
          content: "I'm taking a little cat nap right now 😴 Please try again in a bit! 🐱",
          timestamp: Date.now(),
        },
      ]);
      setSessionRestored(true);
      return;
    }

    try {
      const savedMessages = sessionStorage.getItem('hk_messages');
      const savedConvId = sessionStorage.getItem('hk_convId');
      if (savedMessages && savedConvId && !/ðŸ|âœ|â€/.test(savedMessages)) {
        const parsed: PolledMessage[] = JSON.parse(savedMessages);
        if (parsed.length > 0) {
          // Deduplicate consecutive initial greeting bubbles if restored from an older session race
          const cleaned =
            parsed.length >= 2 &&
            parsed[0].role === 'assistant' &&
            parsed[1].role === 'assistant' &&
            !parsed[0].bookingCard &&
            /glitz\s*&\s*glamour/i.test(parsed[0].content) &&
            /glitz\s*&\s*glamour/i.test(parsed[1].content)
              ? parsed.slice(1)
              : parsed;
          setMessages(cleaned);
          setConversationId(savedConvId);
          conversationIdRef.current = savedConvId;
          const savedCount = sessionStorage.getItem('hk_msgCount');
          if (savedCount) setMessageCount(parseInt(savedCount, 10) || 0);
          const savedGuestName = sessionStorage.getItem('hk_guestName');
          if (savedGuestName) {
            setGuestName(savedGuestName);
            setHasAskedName(true);
          }
          if (sessionStorage.getItem('hk_hasAskedName') === '1') setHasAskedName(true);
          if (sessionStorage.getItem('hk_takenOver') === '1') {
            setIsTakenOver(true);
            setAgentName(sessionStorage.getItem('hk_agentName') || 'Team Member');
            startTransferCountdown(savedConvId);
          }
          setSessionRestored(true);
          return;
        }
      }
    } catch {
      /* ignore corrupt sessionStorage */
    }

    const firstName = session?.user?.name?.split(' ')[0] || null;
    if (firstName) {
      setGuestName(firstName);
      setHasAskedName(true);
    }
    setMessages([buildWelcomeMessage(firstName)]);
    setSessionRestored(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Safely personalize single unstarted greeting when async session finishes resolving
  useEffect(() => {
    const firstName = session?.user?.name?.split(' ')[0];
    if (!firstName) return;
    setGuestName((prev) => prev || firstName);
    setHasAskedName(true);
    if (conversationIdRef.current || isLoadingRef.current) return;
    setMessages((prev) => {
      if (prev.length !== 1 || prev[0].role !== 'assistant' || isLoadingRef.current || conversationIdRef.current) {
        return prev;
      }
      return [buildWelcomeMessage(firstName)];
    });
  }, [session?.user?.name]);

  const isWorkHours = () => {
    const now = new Date();
    const total = now.getHours() * 60 + now.getMinutes();
    return total >= 540 && total <= 1140;
  };

  const pollStatusOnce = useCallback(async (activeConvId?: string) => {
    if (typeof document !== 'undefined' && document.hidden) return;
    const cid = conversationIdRef.current || activeConvId;
    if (!cid) return;
    try {
      const params = new URLSearchParams({ conversationId: cid });
      if (lastPollTime.current) params.set('since', lastPollTime.current);
      const res = await fetch(`/api/chat/status?${params}`);
      const data = await res.json();
      lastPollTime.current = new Date().toISOString();

      if (data.newMessages?.length > 0) {
        const incoming = data.newMessages as PolledStatusMessage[];
        setMessages((prev) => {
          const existingIds = new Set(prev.map((m) => m.pollId).filter(Boolean));
          const fresh = incoming.filter((m) => !existingIds.has(m.id));
          if (fresh.length === 0) return prev;
          return [
            ...prev,
            ...fresh.map(
              (m) =>
                ({
                  role: m.role,
                  content: m.content,
                  attachments: m.attachments || undefined,
                  timestamp: new Date(m.createdAt).getTime(),
                  agentName: data.agentName || undefined,
                  pollId: m.id,
                }) as PolledMessage
            ),
          ];
        });
      }

      if (data.isTakenOver) {
        setIsTakenOver(true);
        setAgentName(data.agentName);
        setTransferCountdown(null);
        if (countdownRef.current) {
          clearInterval(countdownRef.current);
          countdownRef.current = null;
        }
      }

      setAgentTyping(!!data.agentTyping);

      if (!data.isTakenOver) {
        setIsTakenOver((prev) => {
          if (prev) {
            setAgentName(null);
            if (pollRef.current) {
              clearInterval(pollRef.current);
              pollRef.current = null;
            }
          }
          return false;
        });
      }
    } catch {
      /* ignore polling blips */
    }
  }, []);

  const startTransferCountdown = useCallback(
    (convId?: string) => {
      const activeConvId = convId || conversationIdRef.current;
      const seconds = isWorkHours() ? 5 * 60 : 10 * 60;
      setTransferCountdown(seconds);
      lastPollTime.current = new Date().toISOString();

      if (countdownRef.current) clearInterval(countdownRef.current);
      countdownRef.current = setInterval(() => {
        setTransferCountdown((prev) => {
          if (prev === null || prev <= 1) {
            if (countdownRef.current) clearInterval(countdownRef.current);
            countdownRef.current = null;
            if (pollRef.current) {
              clearInterval(pollRef.current);
              pollRef.current = null;
            }
            setMessages((p) => [
              ...p,
              {
                role: 'assistant',
                emote: 'apologetic',
                content:
                  "I'm so sorry! 😿 Our team is currently busy helping other clients and couldn't join in time.\n\nPlease reach out directly:\n📞 Call/Text Jojo: (760) 290-5910\n📧 Email: info@glitzandglamours.com\n🌐 Book online: glitzandglamours.com/book\n\nWe truly apologize for the wait! 💕",
                timestamp: Date.now(),
                quickReplies: [
                  { label: '📞 Call Jojo', message: "What's Jojo's phone number?" },
                  { label: '📅 Book Online', message: "I'd like to book an appointment" },
                ],
              },
            ]);
            return null;
          }
          return prev - 1;
        });
      }, 1000);

      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = setInterval(() => {
        pollStatusOnce(activeConvId || undefined);
      }, 3000);
    },
    [pollStatusOnce]
  );

  // Resume poll cleanly on tab return during active takeover
  useEffect(() => {
    const onVisible = () => {
      if (!document.hidden && (isTakenOver || transferCountdown !== null)) {
        pollStatusOnce();
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [isTakenOver, transferCountdown, pollStatusOnce]);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  const toggleVoice = useCallback(async () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    const w = window as WindowWithSpeechAndAudio;
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) {
      alert('Voice not supported in this browser');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());

      const recognition = new SR();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      recognition.onresult = (e: SpeechRecognitionEventLike) => {
        const transcript = e.results[0][0].transcript;
        setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
        textareaRef.current?.focus();
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
      recognition.start();
      setIsListening(true);
    } catch {
      alert('Please allow microphone access to use voice input');
    }
  }, [isListening]);

  // Inspo upload handler (matches /book InspoUploader validation + HEIC UX)
  const handlePickFiles = useCallback(
    async (files: FileList | File[]) => {
      setUploadError(null);
      const list = Array.from(files);

      const heicFiles = list.filter(
        (f) =>
          f.type === 'image/heic' ||
          f.type === 'image/heif' ||
          /\.(heic|heif)$/i.test(f.name)
      );
      if (heicFiles.length > 0) {
        setUploadError(
          "HEIC photos can't be uploaded directly. Open the photo in your Camera Roll, tap Share -> Save as JPEG, or use Safari on iOS which converts automatically."
        );
        return;
      }

      const validFiles = list.filter((file) => {
        const isImg =
          file.type.startsWith('image/') ||
          /\.(jpg|jpeg|png|webp|avif|gif)$/i.test(file.name);
        return isImg && file.size <= 25 * 1024 * 1024;
      });

      if (validFiles.length !== list.length) {
        setUploadError('Some files were skipped — only images under 25MB are supported.');
      }

      const usedSlots = totalConversationPhotos + pendingAttachments.length;
      const availableForBooking = Math.max(0, MAX_BOOKING_PHOTOS - usedSlots);
      const perMessageCap = Math.max(0, 4 - pendingAttachments.length);
      const allowance = Math.min(availableForBooking, perMessageCap);

      if (allowance <= 0) {
        setUploadError(`You can attach up to ${MAX_BOOKING_PHOTOS} inspo photos per booking (4 per message).`);
        return;
      }

      const slice = validFiles.slice(0, allowance);
      if (slice.length === 0) return;

      const batch: PendingAttachment[] = slice.map((file, idx) => ({
        id: `${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 7)}`,
        previewUrl: URL.createObjectURL(file),
        status: 'uploading',
      }));

      setPendingAttachments((prev) => [...prev, ...batch]);

      await Promise.all(
        slice.map(async (file, idx) => {
          const itemId = batch[idx].id;
          try {
            const fd = new FormData();
            fd.append('file', file);
            const res = await fetch('/api/upload', { method: 'POST', body: fd });
            if (!res.ok) {
              const errData = await res.json().catch(() => ({}));
              const errMsg = errData.error || `Upload failed (${res.status})`;
              setUploadError(errMsg);
              setPendingAttachments((prev) =>
                prev.map((a) => (a.id === itemId ? { ...a, status: 'error', error: errMsg } : a))
              );
              return;
            }
            const data = await res.json();
            setPendingAttachments((prev) =>
              prev.map((a) =>
                a.id === itemId ? { ...a, status: 'ready', uploadedUrl: data.url } : a
              )
            );
          } catch {
            setUploadError('Network error uploading photo — please try again.');
            setPendingAttachments((prev) =>
              prev.map((a) =>
                a.id === itemId ? { ...a, status: 'error', error: 'Network error' } : a
              )
            );
          }
        })
      );
    },
    [pendingAttachments.length, totalConversationPhotos]
  );

  const handleRemoveAttachment = useCallback((id: string) => {
    setPendingAttachments((prev) => {
      const victim = prev.find((a) => a.id === id);
      if (victim) URL.revokeObjectURL(victim.previewUrl);
      return prev.filter((a) => a.id !== id);
    });
  }, []);

  const submitTurn = useCallback(
    async (explicitText?: string) => {
      const readyAttachments = pendingAttachments
        .filter((a) => a.status === 'ready' && a.uploadedUrl)
        .map((a) => a.uploadedUrl!);
      const isUploadingAny = pendingAttachments.some((a) => a.status === 'uploading');

      const currentInput = (explicitText ?? input).trim();
      if ((!currentInput && readyAttachments.length === 0) || isUploadingAny || isLoading || isExhausted) {
        return;
      }

      if (messageCount >= 25) {
        const exhaustedTime = Date.now() + 30 * 60 * 1000;
        localStorage.setItem('kittyExhausted', exhaustedTime.toString());
        setIsExhausted(true);
        setMessages((prev) => [
          ...prev,
          { role: 'user', content: currentInput, attachments: readyAttachments, timestamp: Date.now() },
          {
            role: 'assistant',
            emote: 'sleepy',
            content:
              "I need a little cat nap now 😴 I've been chatting a lot! Try again in 30 minutes, or visit our booking page directly! 🐱💕",
            timestamp: Date.now(),
          },
        ]);
        if (explicitText === undefined) setInput('');
        setPendingAttachments([]);
        return;
      }

      const wasVoice = isListening && explicitText === undefined;
      if (explicitText === undefined) setInput('');
      setPendingAttachments((prev) => {
        prev.forEach((a) => URL.revokeObjectURL(a.previewUrl));
        return [];
      });
      setUploadError(null);
      isLoadingRef.current = true;
      setIsLoading(true);

      // Clear old quick replies
      const strippedHistory = messages.map((m) => ({ ...m, quickReplies: undefined }));

      // Quick local name greeting when visitor introduces themselves with text only
      let updatedGuestName = guestName;
      if (!hasAskedName && !session && currentInput && readyAttachments.length === 0) {
        const inferred = inferGuestName(currentInput);
        if (inferred) {
          updatedGuestName = inferred;
          setGuestName(inferred);
          setHasAskedName(true);
          const first = inferred.split(/\s+/)[0];
          setMessages([
            ...strippedHistory,
            { role: 'user', content: currentInput, isVoice: wasVoice, timestamp: Date.now() },
            {
              role: 'assistant',
              emote: 'love',
              content: `Aww, nice to meet you ${first}! 🐱💕 How can I help you today? Feel free to upload any inspo pics with the 📷 button! ✨`,
              timestamp: Date.now(),
              quickReplies: [
                { label: '💅 View Services', message: 'Show me your services' },
                { label: '📅 Book Now', message: "I'd like to book an appointment" },
              ],
            },
          ]);
          setMessageCount((prev) => prev + 1);
          setIsLoading(false);
          return;
        }
        setHasAskedName(true);
      }

      playPop('send');
      const userMsg: PolledMessage = {
        role: 'user',
        content: currentInput,
        attachments: readyAttachments.length > 0 ? readyAttachments : undefined,
        isVoice: wasVoice,
        timestamp: Date.now(),
      };
      const nextMessages = [...strippedHistory, userMsg];
      setMessages(nextMessages);
      setMessageCount((prev) => prev + 1);

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: nextMessages
              .filter((m) => m.role === 'user' || m.role === 'assistant')
              .map((m) => ({
                role: m.role,
                content: m.content,
                ...(m.attachments?.length ? { attachments: m.attachments } : {}),
              })),
            conversationId: conversationIdRef.current,
            guestName: updatedGuestName,
          }),
        });
        const data = await res.json();
        if (data.conversationId) {
          setConversationId(data.conversationId);
          conversationIdRef.current = data.conversationId;
        }

        if (data.isTakenOver) {
          setIsTakenOver(true);
          setAgentName(data.agentName);
        } else if (res.ok && data.reply) {
          playPop('receive');
          const assistantMsg: PolledMessage = {
            role: 'assistant',
            emote: (data.emote as KittyEmote) || (data.bookingCard ? 'celebrate' : 'happy'),
            content: data.reply,
            timestamp: Date.now(),
            quickReplies: data.quickReplies || undefined,
            availability: data.availabilityWidget || undefined,
          };
          if (data.bookingCard) {
            assistantMsg.bookingCard = data.bookingCard;
            triggerSparkles();
          }

          setMessages((prev) => {
            let updated = prev;
            if (data.attributionSaved) {
              updated = prev.map((m) =>
                m.bookingCard && m.bookingCard.bookingId === data.attributionSaved.bookingId
                  ? {
                      ...m,
                      bookingCard: {
                        ...m.bookingCard,
                        heardFrom: data.attributionSaved.source,
                        attributionBadge: data.attributionSaved.badge,
                      },
                    }
                  : m
              );
              triggerSparkles();
            }
            return [...updated, assistantMsg];
          });

          if (data.transferInitiated) {
            startTransferCountdown(data.conversationId);
          }
        } else if (!data.isTakenOver) {
          setMessages((prev) => [
            ...prev,
            {
              role: 'assistant',
              emote: 'apologetic',
              content: 'Oops! Something went wrong 🐱 Please try again!',
              timestamp: Date.now(),
            },
          ]);
        }
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            emote: 'apologetic',
            content: "I can't connect right now 🐱 Please try again in a moment!",
            timestamp: Date.now(),
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [
      pendingAttachments,
      input,
      isLoading,
      isExhausted,
      messageCount,
      isListening,
      messages,
      guestName,
      hasAskedName,
      session,
      playPop,
      triggerSparkles,
      startTransferCountdown,
    ]
  );

  const handleQuickReply = useCallback(
    (qr: QuickReply) => {
      playPop('send');
      submitTurn(qr.message);
    },
    [playPop, submitTurn]
  );

  const sendMessage = useCallback(
    (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      submitTurn();
    },
    [submitTurn]
  );

  const handleOpenLightbox = useCallback((images: string[], index: number) => {
    setLightboxState({ images, index });
  }, []);

  // Live header Kitty emote derived cleanly from UI state + latest assistant expression
  const activeEmote: KittyEmote = useMemo(() => {
    if (isExhausted) return 'sleepy';
    if (isListening) return 'listening';
    if (isLoading) return 'thinking';
    if (uploadError) return 'apologetic';
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'assistant' && messages[i].emote) {
        return messages[i].emote!;
      }
    }
    return 'happy';
  }, [isExhausted, isListening, isLoading, uploadError, messages]);

  if (isHiddenPage) return null;

  return (
    <>
      <style>{`
        .hk-btn{position:fixed;bottom:80px;right:20px;width:62px;height:62px;border:none;border-radius:50%;background:linear-gradient(135deg,#FF2D78,#FF6BA8);box-shadow:0 4px 20px rgba(255,45,120,0.45),0 0 0 0 rgba(255,45,120,0.4);display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:10000;transition:transform .2s;animation:hkPulse 2.5s infinite;padding:0}
        .hk-btn:hover{transform:scale(1.08)}
        .hk-btn:focus-visible,.hk-cta-main:focus-visible,.hk-cta-dismiss:focus-visible,.hk-mini:focus-visible,.hk-head-btn:focus-visible,.hk-close:focus-visible,.hk-icon-btn:focus-visible{outline:2px solid #fff;outline-offset:2px}
        @keyframes hkPulse{0%,100%{box-shadow:0 4px 20px rgba(255,45,120,0.45),0 0 0 0 rgba(255,45,120,0.4)}50%{box-shadow:0 4px 20px rgba(255,45,120,0.45),0 0 0 8px rgba(255,45,120,0)}}
        .hk-btn .hk-dot{position:absolute;top:2px;right:2px;width:14px;height:14px;background:#22c55e;border:2.5px solid #fff;border-radius:50%}

        .hk-badge-launcher{position:absolute;top:-4px;right:-4px;background:#ff2d78;color:#fff;font-family:'Poppins',sans-serif;font-size:9px;font-weight:700;line-height:1;padding:3px 6px;border-radius:10px;border:1.5px solid #fff;letter-spacing:0.2px;z-index:2}
        .hk-badge-header{font-family:'Poppins',sans-serif;font-size:10px;font-weight:700;line-height:1;letter-spacing:0.3px;color:#ffb3d1;background:rgba(255,45,120,0.16);border:1px solid rgba(255,107,168,0.4);padding:3px 7px;border-radius:10px}
        .hk-badge-live{font-size:9px;background:linear-gradient(135deg,#6366f1,#818cf8);padding:2px 8px;border-radius:10px;color:#fff;font-weight:700;letter-spacing:0.5px}

        .hk-head-btn{background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.06);color:#d0c4cb;cursor:pointer;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;transition:all 0.2s}
        .hk-head-btn:hover{background:rgba(255,255,255,0.14);color:#fff;transform:scale(1.06)}
        .hk-head-btn:active{transform:scale(0.94)}

        .hk-cta{position:fixed;bottom:97px;right:92px;background:#fff;color:#b8004a;font-family:'Poppins',sans-serif;font-weight:700;font-size:12px;padding:6px 10px 6px 14px;border-radius:20px;border-bottom-right-radius:4px;box-shadow:0 4px 18px rgba(0,0,0,0.18);z-index:9999;display:flex;align-items:center;gap:6px;animation:hkFloat 2.5s infinite}
        .hk-cta-main{background:none;border:none;color:inherit;font:inherit;padding:2px 0;cursor:pointer;text-align:left}
        .hk-cta-dismiss{background:rgba(184,0,74,0.12);border:none;color:#b8004a;border-radius:50%;width:20px;height:20px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:transform 0.15s;flex-shrink:0}
        .hk-cta-dismiss:hover{transform:scale(1.12)}
        @keyframes hkFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
        .hk-cta-text{display:inline-block;animation:hkBannerFade 0.35s ease}
        @keyframes hkBannerFade{from{opacity:0;transform:translateY(3px)}to{opacity:1;transform:translateY(0)}}
        @media(min-width:768px){.hk-btn{bottom:24px;right:24px}.hk-cta{bottom:41px;right:96px}}

        .hk-mini{position:fixed;bottom:80px;right:20px;z-index:10000;width:44px;height:44px;border-radius:50%;background:rgba(15,10,20,0.92);border:1.5px solid rgba(255,45,120,0.4);box-shadow:0 4px 16px rgba(255,45,120,0.28);display:flex;align-items:center;justify-content:center;cursor:grab;transition:all .2s;animation:hkPulse 2.5s infinite;touch-action:none;padding:0}
        @media(min-width:768px){.hk-mini{bottom:24px;right:24px}}

        .hk-win{position:fixed;bottom:8px;right:8px;left:8px;width:auto;height:calc(100dvh - 16px - env(safe-area-inset-bottom));max-height:700px;background:rgba(14,10,19,0.96);backdrop-filter:blur(26px);-webkit-backdrop-filter:blur(26px);border:1px solid rgba(255,107,168,0.28);border-radius:24px;box-shadow:0 20px 60px rgba(0,0,0,0.72),0 0 40px rgba(255,45,120,0.14);display:flex;flex-direction:column;z-index:10001;overflow:hidden;opacity:0;pointer-events:none;transform:translateY(16px) scale(0.96);transition:opacity .24s ease,transform .24s cubic-bezier(0.16,1,0.3,1)}
        .hk-win.open{opacity:1;pointer-events:auto;transform:none}
        @media(min-width:640px){.hk-win{left:auto;right:24px;bottom:24px;width:420px;height:min(650px,calc(100dvh - 48px))}}

        .hk-drop-overlay{position:absolute;inset:0;background:rgba(20,8,22,0.88);backdrop-filter:blur(8px);z-index:500;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;border:2px dashed #FF2D78;border-radius:22px;margin:8px;color:#fff;font-family:'Poppins',sans-serif;pointer-events:none;animation:hkFadeIn .15s ease-out}
        .hk-drop-overlay p{margin:0;font-size:14px;font-weight:700}
        .hk-drop-overlay span{font-size:11.5px;color:#ffb3d1}

        .hk-head{padding:14px 16px;background:radial-gradient(110% 130% at 0% 0%,rgba(255,45,120,0.22),rgba(139,0,67,0.08) 60%,transparent),rgba(255,255,255,0.02);border-bottom:1px solid rgba(255,255,255,0.08);display:flex;align-items:center;justify-content:space-between;flex-shrink:0}
        .hk-head-info{display:flex;align-items:center;gap:10px;min-width:0}
        .hk-avatar{position:relative;width:44px;height:44px;border-radius:50%;background:#fff;border:2px solid #FF2D78;flex-shrink:0;box-shadow:0 0 12px rgba(255,45,120,0.4);display:flex;align-items:center;justify-content:center;padding:3px;transition:transform .25s ease}
        .hk-avatar.emote-celebrate,.hk-avatar.emote-sparkle{animation:hkCelebratePop .6s ease}
        .hk-avatar.emote-thinking{animation:hkThinkTilt 1.6s ease-in-out infinite}
        .hk-avatar.emote-listening{box-shadow:0 0 0 4px rgba(255,45,120,0.35),0 0 16px rgba(255,45,120,0.6)}
        @keyframes hkCelebratePop{0%,100%{transform:scale(1)}40%{transform:scale(1.1) rotate(-4deg)}75%{transform:scale(1.06) rotate(4deg)}}
        @keyframes hkThinkTilt{0%,100%{transform:rotate(-3deg)}50%{transform:rotate(4deg)}}
        .hk-avatar .dot{position:absolute;bottom:0;right:0;width:11px;height:11px;background:#22c55e;border-radius:50%;border:2px solid #fff}
        .hk-status-sub{font-family:'Poppins',sans-serif;font-size:11px;color:#b8f7cd;margin:2px 0 0;display:flex;align-items:center;gap:5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .hk-close{background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.06);color:#d0c4cb;cursor:pointer;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;transition:all .15s}
        .hk-close:hover{background:rgba(255,255,255,0.14);color:#fff;transform:scale(1.06)}

        .hk-body{flex:1 1 0%;min-height:0;overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch;touch-action:pan-y;overscroll-behavior-y:contain;padding:14px 16px;scrollbar-width:thin;scrollbar-color:rgba(255,107,168,0.45) transparent;outline:none}
        .hk-body-inner{display:flex;flex-direction:column;gap:12px;min-height:100%}
        .hk-body::-webkit-scrollbar{width:5px}
        .hk-body::-webkit-scrollbar-track{background:transparent}
        .hk-body::-webkit-scrollbar-thumb{background:rgba(255,107,168,0.45);border-radius:5px}
        .hk-body::-webkit-scrollbar-thumb:hover{background:rgba(255,107,168,0.7)}

        .hk-msg{max-width:88%;padding:10px 14px;font-family:'Poppins',sans-serif;font-size:13.5px;line-height:1.55;white-space:pre-wrap;word-break:break-word;animation:hkFadeIn .22s ease-out}
        @keyframes hkFadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        .hk-msg.assistant{align-self:flex-start;background:rgba(255,255,255,0.07);color:#f3eef1;border-radius:18px 18px 18px 4px;border:1px solid rgba(255,255,255,0.07)}
        .hk-msg.user{align-self:flex-end;background:linear-gradient(135deg,#FF2D78,#d91e63);color:#fff;border-radius:18px 18px 4px 18px;box-shadow:0 4px 15px rgba(255,45,120,0.28)}
        .hk-msg-time{font-size:10px;color:#b8a9b3;margin-top:4px;font-family:'Poppins',sans-serif}
        .hk-msg.user .hk-msg-time{color:rgba(255,255,255,0.8)}

        .hk-msg-group{display:flex;flex-direction:column}
        .hk-msg-group.user-group{align-items:flex-end}
        .hk-msg-group.assistant-group{align-items:flex-start}

        .hk-emote-row{display:inline-flex;align-items:center;gap:5px;margin-bottom:4px;padding-left:2px}
        .hk-emote-avatar-mini{width:22px;height:22px;border-radius:50%;background:#fff;border:1px solid rgba(255,45,120,0.45);display:inline-flex;align-items:center;justify-content:center;padding:2px}
        .hk-emote-pill{font-family:'Poppins',sans-serif;font-size:10px;font-weight:600;color:#ffb3d1;background:rgba(255,45,120,0.12);border:1px solid rgba(255,107,168,0.25);padding:1px 8px;border-radius:999px}

        .hk-msg-images{display:grid;gap:6px;margin-bottom:6px}
        .hk-msg-images.single{grid-template-columns:minmax(0,190px)}
        .hk-msg-images.multi{grid-template-columns:repeat(2,minmax(0,115px))}
        .hk-msg-img-btn{position:relative;aspect-ratio:1/1;border-radius:12px;overflow:hidden;border:1px solid rgba(255,255,255,0.22);background:#0c0a0f;padding:0;cursor:zoom-in;display:block}
        .hk-msg-img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .2s ease}
        .hk-msg-img-btn:hover .hk-msg-img{transform:scale(1.04)}
        .hk-msg-img-zoom{position:absolute;bottom:5px;right:5px;background:rgba(0,0,0,0.65);color:#fff;border-radius:6px;padding:3px;display:flex;align-items:center;justify-content:center}

        .hk-booking-card{align-self:flex-start;width:100%;max-width:95%;background:linear-gradient(145deg,rgba(34,197,94,0.12),rgba(16,18,24,0.92));border:1px solid rgba(34,197,94,0.34);border-radius:18px;padding:14px;animation:hkFadeIn .3s ease-out;box-shadow:0 8px 24px rgba(0,0,0,0.35);margin-top:6px}
        .hk-booking-card-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:10px;flex-wrap:wrap}
        .hk-booking-card-title{font-family:'Poppins',sans-serif;font-size:13px;font-weight:700;color:#4ade80}
        .hk-kitty-channel-pill{font-family:'Poppins',sans-serif;font-size:10px;font-weight:700;color:#ffb3d1;background:rgba(255,45,120,0.16);border:1px solid rgba(255,107,168,0.38);padding:2px 8px;border-radius:999px}
        .hk-booking-rows{display:grid;gap:6px}
        .hk-booking-row{display:flex;align-items:center;gap:8px;padding:6px 10px;background:rgba(255,255,255,0.04);border-radius:8px}
        .hk-booking-label{font-family:'Poppins',sans-serif;font-size:11px;color:#b8a9b3;width:52px;flex-shrink:0}
        .hk-booking-value{font-family:'Poppins',sans-serif;font-size:12.5px;color:#fff;font-weight:500}
        .hk-booking-notes{margin-top:9px;padding:9px 11px;background:rgba(255,45,120,0.08);border-left:2.5px solid #FF2D78;border-radius:0 10px 10px 0}
        .hk-booking-notes-head{display:flex;align-items:center;gap:5px;font-family:'Poppins',sans-serif;font-size:10.5px;font-weight:700;color:#ffb3d1;text-transform:uppercase;letter-spacing:0.4px;margin-bottom:3px}
        .hk-booking-notes p{margin:0;font-family:'Poppins',sans-serif;font-size:12px;color:#f3eef1;line-height:1.45}
        .hk-booking-inspo{margin-top:9px}
        .hk-booking-inspo-label{display:block;font-family:'Poppins',sans-serif;font-size:10.5px;font-weight:600;color:#d0c4cb;margin-bottom:5px}
        .hk-booking-inspo-grid{display:flex;gap:6px;flex-wrap:wrap}
        .hk-booking-inspo-thumb{width:52px;height:52px;border-radius:8px;overflow:hidden;border:1px solid rgba(255,255,255,0.2);padding:0;background:#0a0a0e;cursor:zoom-in}
        .hk-booking-inspo-thumb img{width:100%;height:100%;object-fit:cover;display:block}
        .hk-booking-origin-row{display:flex;align-items:center;gap:7px;margin-top:9px;flex-wrap:wrap}
        .hk-booking-origin-label{font-family:'Poppins',sans-serif;font-size:11px;color:#d0c4cb}
        .hk-booking-origin-pill{font-family:'Poppins',sans-serif;font-size:10.5px;font-weight:600;padding:2px 8px;border-radius:6px;display:inline-flex;align-items:center;gap:4px}
        .hk-booking-pending{margin-top:10px;padding:8px 10px;background:rgba(255,183,0,0.1);border-radius:8px;border:1px solid rgba(255,183,0,0.22)}
        .hk-booking-pending p{font-family:'Poppins',sans-serif;font-size:11px;color:#fcd34d;margin:0;line-height:1.45}
        .hk-booking-call{margin-top:9px;background:rgba(255,45,120,0.14);border:1px solid rgba(255,107,168,0.35);border-radius:10px;padding:8px 12px;color:#ffb3d1;font-family:'Poppins',sans-serif;font-size:11.5px;font-weight:600;text-decoration:none;display:flex;align-items:center;justify-content:center;gap:6px}

        .hk-qr-wrap{display:flex;flex-wrap:wrap;gap:6px;animation:hkFadeIn .3s ease-out;margin-top:7px;max-width:98%}
        .hk-qr-btn{background:linear-gradient(135deg,rgba(255,45,120,0.14) 0%,rgba(255,107,168,0.08) 100%);border:1px solid rgba(255,107,168,0.4);color:#ffb3d1;font-family:'Poppins',sans-serif;font-size:11.5px;font-weight:600;padding:6px 12px;border-radius:50px;cursor:pointer;transition:all .2s cubic-bezier(0.34,1.56,0.64,1);white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.2);display:inline-flex;align-items:center;gap:5px}
        .hk-qr-btn:hover{background:linear-gradient(135deg,#FF2D78 0%,#FF6BA8 100%);border-color:#fff;color:#fff;transform:translateY(-1px);box-shadow:0 6px 20px rgba(255,45,120,0.45)}
        .hk-qr-btn:active{transform:scale(0.96)}

        .hk-persistent-bar{display:flex;gap:6px;padding:7px 22px 7px 12px;overflow-x:auto;background:rgba(20,10,25,0.88);border-top:1px solid rgba(255,45,120,0.15);scrollbar-width:none;flex-shrink:0;-webkit-mask-image:linear-gradient(to right,#000 0%,#000 90%,transparent 100%);mask-image:linear-gradient(to right,#000 0%,#000 90%,transparent 100%)}
        .hk-persistent-bar::-webkit-scrollbar{display:none}
        .hk-persistent-chip{background:rgba(255,45,120,0.1);border:1px solid rgba(255,107,168,0.3);color:#ffb3d1;font-family:'Poppins',sans-serif;font-size:11.5px;font-weight:600;padding:5px 12px;border-radius:50px;cursor:pointer;white-space:nowrap;flex-shrink:0;transition:all .2s ease}
        .hk-persistent-chip:hover{background:linear-gradient(135deg,#FF2D78 0%,#FF6BA8 100%);border-color:#fff;color:#fff}

        .hk-time-chips-wrap{margin-top:8px;background:rgba(255,45,120,0.08);border:1px solid rgba(255,107,168,0.25);border-radius:14px;padding:10px 12px;animation:hkFadeIn .3s ease-out;max-width:94%}
        .hk-chips-title{display:flex;align-items:center;gap:6px;font-family:'Poppins',sans-serif;font-size:11px;font-weight:600;color:#ffb3d1;margin-bottom:8px}
        .hk-slots-grid{display:flex;flex-wrap:wrap;gap:6px;max-height:190px;overflow-y:auto;padding-right:2px}
        .hk-time-chip{background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.18);color:#fff;font-family:'Poppins',sans-serif;font-size:12px;font-weight:600;padding:6px 11px;border-radius:8px;cursor:pointer;transition:all .15s ease}
        .hk-time-chip:hover{background:#FF2D78;border-color:#FF2D78;color:#fff;transform:translateY(-1px)}
        .hk-time-chip.booked{background:rgba(255,255,255,0.02);border:1px dashed rgba(255,45,120,0.3);color:#9e8e98;cursor:not-allowed;opacity:0.85;display:inline-flex;align-items:center;gap:5px}
        .hk-time-chip.booked:hover{background:rgba(255,255,255,0.02);border-color:rgba(255,45,120,0.3);transform:none}
        .hk-booked-pill{font-size:9.5px;font-weight:700;padding:1px 6px;border-radius:999px;background:rgba(255,45,120,0.16);border:1px solid rgba(255,107,168,0.35);color:#ffb3d1}

        .hk-loyalty-card{margin-top:8px;background:linear-gradient(145deg,rgba(255,45,120,0.15) 0%,rgba(20,10,25,0.96) 100%);border:1px solid rgba(255,45,120,0.38);border-radius:16px;padding:14px;max-width:94%;animation:hkFadeIn .3s ease-out;box-shadow:0 6px 20px rgba(0,0,0,0.4)}
        .hk-loyalty-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;gap:6px;flex-wrap:wrap}
        .hk-loyalty-title{font-family:'Poppins',sans-serif;font-size:13px;font-weight:700;color:#fff}
        .hk-loyalty-badge{font-family:'Poppins',sans-serif;font-size:8.5px;font-weight:700;color:#FFD700;background:rgba(255,215,0,0.12);border:1px solid rgba(255,215,0,0.3);padding:2px 7px;border-radius:20px;letter-spacing:0.3px}
        .hk-loyalty-sub{font-family:'Poppins',sans-serif;font-size:11px;color:#d8ccd3;margin:6px 0 10px;text-align:center}
        .hk-stamps-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin:10px 0}
        .hk-stamp-circle{aspect-ratio:1;border-radius:50%;background:rgba(255,255,255,0.05);border:1px dashed rgba(255,45,120,0.4);display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:14px}
        .hk-stamp-circle.is-reward{border:1.5px solid #FFD700;background:rgba(255,215,0,0.14)}
        .hk-stamp-num{font-size:8.5px;font-family:'Poppins',sans-serif;color:#b8a9b3;font-weight:600;margin-top:-2px}
        .hk-wallet-btn{flex:1;background:linear-gradient(135deg,#FF2D78 0%,#FF6BA8 100%);border:none;border-radius:10px;padding:8px 10px;font-family:'Poppins',sans-serif;font-size:11px;font-weight:600;color:#fff;text-align:center;text-decoration:none;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;transition:all .2s}
        .hk-wallet-btn.secondary{background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.16)}

        .hk-sparkle-item{position:absolute;font-size:18px;animation:hkSparkleFloat 1.2s ease-out forwards;pointer-events:none;z-index:999}
        @keyframes hkSparkleFloat{0%{transform:scale(0.4) translateY(0);opacity:1}100%{transform:scale(1.4) translateY(-60px);opacity:0}}

        .hk-waveform{display:flex;align-items:center;gap:3px;height:18px}
        .hk-waveform span{width:3px;background:#FF2D78;border-radius:2px;animation:hkWave 1s ease-in-out infinite}
        .hk-waveform span:nth-child(1){animation-delay:0s;height:8px}
        .hk-waveform span:nth-child(2){animation-delay:0.15s;height:16px}
        .hk-waveform span:nth-child(3){animation-delay:0.3s;height:12px}
        .hk-waveform span:nth-child(4){animation-delay:0.45s;height:18px}
        @keyframes hkWave{0%,100%{transform:scaleY(0.4)}50%{transform:scaleY(1)}}

        .hk-input-area{padding:10px 12px calc(10px + env(safe-area-inset-bottom));border-top:1px solid rgba(255,255,255,0.08);background:rgba(0,0,0,0.34);flex-shrink:0}
        .hk-upload-error{display:flex;align-items:flex-start;gap:8px;background:rgba(255,60,60,0.12);border:1px solid rgba(255,120,120,0.35);border-radius:10px;padding:8px 10px;margin-bottom:8px;font-family:'Poppins',sans-serif;font-size:11.5px;color:#ffd0d0;line-height:1.45}
        .hk-upload-err-close{margin-left:auto;background:none;border:none;color:#ff9a9a;cursor:pointer;padding:2px;flex-shrink:0}
        .hk-attach-tray{background:rgba(255,255,255,0.04);border:1px solid rgba(255,107,168,0.22);border-radius:12px;padding:7px 9px;margin-bottom:8px}
        .hk-attach-meta{display:flex;justify-content:space-between;align-items:center;font-family:'Poppins',sans-serif;font-size:10.5px;font-weight:600;color:#ffb3d1;margin-bottom:5px}
        .hk-attach-cap{color:#fcd34d}
        .hk-attach-row{display:flex;gap:8px;flex-wrap:wrap}
        .hk-attach-thumb{position:relative;width:50px;height:50px;border-radius:9px;overflow:hidden;border:1px solid rgba(255,255,255,0.22);background:#0c0a0f}
        .hk-attach-thumb img{width:100%;height:100%;object-fit:cover;display:block}
        .hk-attach-overlay{position:absolute;inset:0;background:rgba(0,0,0,0.55);display:flex;align-items:center;justify-content:center}
        .hk-attach-overlay.err{background:rgba(120,15,25,0.7)}
        .hk-spin{animation:hkSpin 1s linear infinite}
        @keyframes hkSpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        .hk-attach-remove{position:absolute;top:2px;right:2px;width:16px;height:16px;border-radius:50%;background:rgba(0,0,0,0.78);color:#fff;border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;padding:0}

        .hk-input-wrap{display:flex;align-items:center;gap:6px;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.12);border-radius:24px;padding:5px 6px}
        .hk-input-wrap:focus-within{border-color:rgba(255,107,168,0.65);box-shadow:0 0 0 2px rgba(255,45,120,0.22)}
        .hk-input{flex:1;background:transparent;border:none;color:#fff;font-family:'Poppins',sans-serif;font-size:16px;line-height:20px;min-height:36px;max-height:96px;padding:8px 4px;outline:none;min-width:0;resize:none;overflow-y:hidden;overflow-x:hidden}
        .hk-input:focus,.hk-input:focus-visible{outline:none !important;outline-offset:0 !important}
        @media(min-width:640px){.hk-input{font-size:13.5px}}
        .hk-input::placeholder{color:#a89aa2}
        .hk-icon-btn{width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:none;cursor:pointer;transition:all .15s;flex-shrink:0}
        .hk-photo-btn{background:rgba(255,45,120,0.14);color:#ffb3d1}
        .hk-photo-btn:hover:not(:disabled){background:rgba(255,45,120,0.28);color:#fff}
        .hk-photo-btn:disabled{opacity:0.4;cursor:not-allowed}
        .hk-send{background:#FF2D78;color:#fff}
        .hk-send:disabled{background:rgba(255,255,255,0.09);color:#9e8e98;cursor:not-allowed}
        .hk-mic{background:rgba(255,255,255,0.07);color:#d0c4cb}
        .hk-mic:hover{background:rgba(255,255,255,0.14);color:#fff}
        .hk-mic.active{background:rgba(255,60,60,0.24);color:#ff6b6b;animation:hkMicPulse 1.2s infinite}
        @keyframes hkMicPulse{0%,100%{box-shadow:0 0 0 0 rgba(255,60,60,0.3)}50%{box-shadow:0 0 0 8px rgba(255,60,60,0)}}
        .hk-footer-credit{font-family:'Poppins',sans-serif;font-size:10.5px;color:#b8a9b3;text-align:center;margin:6px 0 0;line-height:1.3}

        .hk-typing{display:flex;align-items:center;gap:8px;padding:8px 13px;align-self:flex-start;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.06);border-radius:18px 18px 18px 4px;white-space:nowrap}
        .hk-typing-dots{display:flex;gap:4px;flex-shrink:0}
        .hk-typing-dots span{width:6px;height:6px;background:#FF2D78;border-radius:50%;animation:hkBounce 1.4s infinite ease-in-out both}
        .hk-typing-dots span:nth-child(1){animation-delay:-0.32s}
        .hk-typing-dots span:nth-child(2){animation-delay:-0.16s}
        @keyframes hkBounce{0%,80%,100%{transform:scale(0)}40%{transform:scale(1)}}
        .hk-typing-text{font-family:'Poppins',sans-serif;font-size:11.5px;color:#d0c4cb}

        .hk-msg.agent{align-self:flex-start;background:linear-gradient(135deg,rgba(99,102,241,0.14),rgba(99,102,241,0.07));border:1px solid rgba(99,102,241,0.24);color:#f3eef1;border-radius:18px 18px 18px 4px}
        .hk-msg-group.agent-group{align-items:flex-start}
        .hk-agent-badge{display:inline-flex;align-items:center;gap:4px;font-size:10.5px;color:#a5b4fc;font-weight:600;margin-bottom:4px;font-family:'Poppins',sans-serif}
        .hk-system-pill{align-self:center;text-align:center;font-family:'Poppins',sans-serif;font-size:11px;color:#b8a9b3;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:20px;padding:5px 14px;animation:hkFadeIn .3s ease-out}
        .hk-countdown-bar{padding:9px 16px;background:linear-gradient(135deg,rgba(255,183,0,0.12),rgba(255,183,0,0.05));border-bottom:1px solid rgba(255,183,0,0.2);display:flex;align-items:center;justify-content:space-between;font-family:'Poppins',sans-serif;flex-shrink:0}
        .hk-countdown-text{font-size:12px;color:#fcd34d;font-weight:500}
        .hk-countdown-timer{font-size:14px;color:#fff;font-weight:700;font-variant-numeric:tabular-nums}
        .hk-connected-bar{padding:9px 16px;background:linear-gradient(135deg,rgba(34,197,94,0.12),rgba(34,197,94,0.05));border-bottom:1px solid rgba(34,197,94,0.2);display:flex;align-items:center;gap:8px;font-family:'Poppins',sans-serif;flex-shrink:0}
        .hk-connected-dot{width:8px;height:8px;background:#22c55e;border-radius:50%;animation:hkPulse 2s infinite}
        .hk-connected-text{font-size:12px;color:#4ade80;font-weight:600}
        .hk-voice-badge{display:inline-flex;align-items:center;gap:3px;font-size:10px;color:rgba(255,255,255,0.72);margin-top:4px}
        .hk-footer-link{color:#FF6BA8;text-decoration:none;font-weight:600}
        .hk-footer-link:hover{text-decoration:underline}

        .hk-btn-link{display:inline-flex;align-items:center;gap:6px;background:linear-gradient(135deg,#FF2D78 0%,#FF6BA8 100%);color:#fff !important;font-family:'Poppins',sans-serif;font-size:12px;font-weight:700;padding:5px 13px;border-radius:14px;text-decoration:none !important;margin:4px 2px;vertical-align:middle;border:1px solid rgba(255,255,255,0.35);box-shadow:0 3px 12px rgba(255,45,120,0.4);transition:all 0.2s cubic-bezier(0.16,1,0.3,1);cursor:pointer;white-space:nowrap}
        .hk-btn-link:hover{transform:translateY(-1px) scale(1.02);box-shadow:0 6px 20px rgba(255,45,120,0.65);filter:brightness(1.06)}
        .hk-btn-link-icon{font-size:12.5px;line-height:1}
        .hk-btn-link-text{font-weight:700;letter-spacing:0.2px}

        .hk-modal-overlay{position:absolute;inset:0;background:rgba(10,5,15,0.86);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;padding:20px;z-index:1000;animation:hkFadeIn 0.2s ease-out}
        .hk-modal-card{background:linear-gradient(135deg,rgba(35,16,28,0.98),rgba(18,10,20,0.98));border:1.5px solid rgba(255,45,120,0.45);border-radius:22px;padding:24px 20px 20px;width:100%;max-width:320px;text-align:center;box-shadow:0 16px 45px rgba(0,0,0,0.75)}
        .hk-modal-avatar{width:54px;height:54px;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;margin:0 auto 14px;border:2px solid #FF2D78;box-shadow:0 0 16px rgba(255,45,120,0.5);padding:5px}
        .hk-modal-title{font-family:'Poppins',sans-serif;font-size:15px;font-weight:700;color:#fff;margin:0 0 6px}
        .hk-modal-desc{font-family:'Poppins',sans-serif;font-size:12px;color:#d0c4cb;line-height:1.5;margin:0 0 20px}
        .hk-modal-actions{display:flex;gap:10px;justify-content:center}
        .hk-modal-btn{flex:1;font-family:'Poppins',sans-serif;font-size:12.5px;font-weight:600;padding:10px 14px;border-radius:12px;border:none;cursor:pointer;transition:all 0.2s ease}
        .hk-modal-btn.cancel{background:rgba(255,255,255,0.09);color:#eee;border:1px solid rgba(255,255,255,0.14)}
        .hk-modal-btn.confirm{background:linear-gradient(135deg,#FF2D78 0%,#FF6BA8 100%);color:#fff}

        @media (prefers-reduced-motion: reduce) {
          .hk-btn,.hk-cta,.hk-mini,.hk-avatar,.hk-sparkle-item,.hk-typing-dots span,.hk-waveform span{animation:none !important;transition:none !important}
        }
      `}</style>

      {/* Lightbox for viewing inspo photos */}
      {lightboxState && (
        <ImageLightbox
          images={lightboxState.images}
          startIndex={lightboxState.index}
          onClose={() => setLightboxState(null)}
        />
      )}

      {/* Chat Window */}
      <div
        role="dialog"
        aria-label="Hello Kitty 2.0 Studio Concierge"
        aria-hidden={!isOpen}
        className={`hk-win ${isOpen ? 'open' : ''}`}
        style={
          mobileViewportStyle && isOpen
            ? {
                top: `${mobileViewportStyle.top}px`,
                bottom: 'auto',
                height: `${mobileViewportStyle.height}px`,
                maxHeight: `${mobileViewportStyle.height}px`,
              }
            : undefined
        }
        onDragEnter={(e) => {
          e.preventDefault();
          dragCounterRef.current += 1;
          if (e.dataTransfer?.types?.includes('Files')) setIsDraggingFile(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          dragCounterRef.current = Math.max(0, dragCounterRef.current - 1);
          if (dragCounterRef.current === 0) setIsDraggingFile(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          dragCounterRef.current = 0;
          setIsDraggingFile(false);
          if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
            handlePickFiles(e.dataTransfer.files);
          }
        }}
      >
        {isDraggingFile && (
          <div className="hk-drop-overlay">
            <ImagePlus size={34} color="#FF6BA8" />
            <p>Drop your inspo photo here 💕</p>
            <span>Kitty Vision will inspect the look for you</span>
          </div>
        )}

        {/* Restart Confirmation Modal */}
        {showRestartConfirm && (
          <div className="hk-modal-overlay" onClick={() => setShowRestartConfirm(false)}>
            <div
              className="hk-modal-card"
              role="alertdialog"
              aria-modal="true"
              aria-label="Start a fresh chat?"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="hk-modal-avatar">
                <KittyAvatar emote="love" size={40} />
              </div>
              <h4 className="hk-modal-title">Start a fresh chat? 💕</h4>
              <p className="hk-modal-desc">
                Your current chat will be refreshed and Hello Kitty 2.0 will greet you with a clean slate!
              </p>
              <div className="hk-modal-actions">
                <button
                  type="button"
                  className="hk-modal-btn cancel"
                  onClick={() => setShowRestartConfirm(false)}
                >
                  Keep Chatting
                </button>
                <button
                  type="button"
                  className="hk-modal-btn confirm"
                  onClick={handleConfirmRestart}
                >
                  ✨ Start Fresh
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Sparkles Overlay */}
        {sparkles.length > 0 && (
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 100, overflow: 'hidden' }}>
            {sparkles.map((s) => (
              <span key={s.id} className="hk-sparkle-item" style={{ left: `${s.x}%`, top: `${s.y}%` }}>
                {s.char}
              </span>
            ))}
          </div>
        )}

        {/* Header */}
        <div className="hk-head">
          <div className="hk-head-info">
            <div className={`hk-avatar emote-${activeEmote}`}>
              <KittyAvatar emote={activeEmote} size={34} alt="Hello Kitty 2.0" />
              <div className="dot" />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <h3 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '15px', fontWeight: 700, color: '#fff', margin: 0 }}>
                  {isTakenOver ? agentName || 'Team Member' : 'Hello Kitty'}
                </h3>
                {!isTakenOver ? (
                  <span className="hk-badge-header">2.0</span>
                ) : (
                  <span className="hk-badge-live">LIVE AGENT</span>
                )}
              </div>
              <p className="hk-status-sub">
                <span
                  style={{
                    width: 6,
                    height: 6,
                    background: '#22c55e',
                    borderRadius: '50%',
                    display: 'inline-block',
                    flexShrink: 0,
                    boxShadow: '0 0 6px #22c55e',
                  }}
                />
                <span>
                  {isTakenOver ? `${agentName || 'Agent'} is here to help` : (EMOTE_STATUS_LABELS[activeEmote] || EMOTE_STATUS_LABELS.happy)}
                </span>
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              type="button"
              className="hk-head-btn"
              onClick={toggleSound}
              aria-label={soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
              title={soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
            >
              {soundEnabled ? <Volume2 size={15} color="#FF7EB3" /> : <VolumeX size={15} color="#a89aa2" />}
            </button>

            <button
              type="button"
              className="hk-head-btn"
              onClick={() => setShowRestartConfirm(true)}
              aria-label="Restart conversation"
              title="Restart conversation"
            >
              <RotateCcw size={14} />
            </button>

            <button
              type="button"
              className="hk-close"
              onClick={() => {
                setIsOpen(false);
                if (wasMinimized.current) setIsMinimized(true);
              }}
              aria-label="Close chat"
              title="Close"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Countdown banner */}
        {transferCountdown !== null && (
          <div className="hk-countdown-bar">
            <span className="hk-countdown-text">⏳ Connecting you to our team…</span>
            <span className="hk-countdown-timer">
              {Math.floor(transferCountdown / 60)}:{String(transferCountdown % 60).padStart(2, '0')}
            </span>
          </div>
        )}

        {/* Connected agent banner */}
        {isTakenOver && !transferCountdown && (
          <div className="hk-connected-bar">
            <span className="hk-connected-dot" />
            <span className="hk-connected-text">🟢 Connected to {agentName || 'our team'}</span>
          </div>
        )}

        {/* Memoized Messages Area */}
        <ChatMessageList
          messages={messages}
          isLoading={isLoading}
          agentTyping={agentTyping}
          agentName={agentName}
          onQuickReply={handleQuickReply}
          onPlayPop={playPop}
          onTriggerSparkles={triggerSparkles}
          onOpenLightbox={handleOpenLightbox}
          bodyRef={bodyRef}
          messagesEndRef={messagesEndRef}
        />

        {/* Quick Action Carousel (hidden when latest message already presents inline quick replies) */}
        {!isExhausted &&
          !(messages[messages.length - 1]?.quickReplies?.length) &&
          !(messages[messages.length - 1]?.availability?.slots?.length) && (
          <div className="hk-persistent-bar" aria-label="Quick topics">
            {[
              { label: '💅 Services & Prices', msg: 'Show me your services and starting prices' },
              { label: '📅 Available Slots', msg: 'When is the next open appointment?' },
              { label: '💎 VIP Stamp Card', msg: 'How does the VIP stamp card work?' },
              { label: '📍 Studio Location', msg: 'Where is the studio located?' },
              { label: '📞 Call / Text Jojo', msg: "What is Jojo's phone number?" },
              { label: '👰 Special Events', msg: 'Tell me about weddings and special events' },
            ].map((item, idx) => (
              <button
                key={idx}
                type="button"
                className="hk-persistent-chip"
                onClick={() => {
                  playPop('send');
                  handleQuickReply({ label: item.label, message: item.msg });
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}

        {/* Composer */}
        <ChatComposer
          input={input}
          onInputChange={setInput}
          onSubmit={sendMessage}
          onPickFiles={handlePickFiles}
          onRemoveAttachment={handleRemoveAttachment}
          pendingAttachments={pendingAttachments}
          totalConversationPhotos={totalConversationPhotos}
          maxBookingPhotos={MAX_BOOKING_PHOTOS}
          uploadError={uploadError}
          onDismissUploadError={() => setUploadError(null)}
          isListening={isListening}
          voiceSupported={voiceSupported}
          onToggleVoice={toggleVoice}
          isLoading={isLoading}
          isExhausted={isExhausted}
          textareaRef={textareaRef}
        />
      </div>

      {/* Minimized draggable Kitty button */}
      {!isOpen && isMinimized && (
        <button
          type="button"
          aria-label="Open Hello Kitty chat"
          onPointerDown={(e) => {
            const el = e.currentTarget;
            const rect = el.getBoundingClientRect();
            dragRef.current = {
              dragging: true,
              startX: e.clientX,
              startY: e.clientY,
              origX: rect.left,
              origY: rect.top,
              moved: false,
            };
            el.setPointerCapture(e.pointerId);
            el.style.transition = 'none';
          }}
          onPointerMove={(e) => {
            const d = dragRef.current;
            if (!d.dragging) return;
            const dx = e.clientX - d.startX;
            const dy = e.clientY - d.startY;
            if (Math.abs(dx) > 4 || Math.abs(dy) > 4) d.moved = true;
            const newX = Math.max(0, Math.min(window.innerWidth - 44, d.origX + dx));
            const newY = Math.max(0, Math.min(window.innerHeight - 44, d.origY + dy));
            setMiniPos({ x: newX, y: newY });
          }}
          onPointerUp={(e) => {
            const d = dragRef.current;
            d.dragging = false;
            e.currentTarget.style.transition = 'all 0.2s';
            if (!d.moved) {
              setIsMinimized(false);
              setShowCta(true);
            }
          }}
          className="hk-mini"
          style={
            miniPos
              ? { left: `${miniPos.x}px`, top: `${miniPos.y}px`, right: 'auto', bottom: 'auto' }
              : undefined
          }
        >
          <KittyAvatar emote={isExhausted ? 'sleepy' : 'happy'} size={28} />
          <span
            style={{
              position: 'absolute',
              top: '2px',
              right: '2px',
              width: '10px',
              height: '10px',
              background: '#22c55e',
              borderRadius: '50%',
              border: '2px solid rgba(15,10,20,0.9)',
              pointerEvents: 'none',
            }}
          />
        </button>
      )}

      {/* CTA Banner */}
      {!isOpen && !isMinimized && showCta && !isExhausted && (
        <div className="hk-cta">
          <button
            type="button"
            className="hk-cta-main"
            onClick={() => {
              playPop('send');
              setIsOpen(true);
            }}
          >
            <span key={bannerPhraseIndex} className="hk-cta-text">
              {BANNER_PHRASES[bannerPhraseIndex]}
            </span>
          </button>
          <button
            type="button"
            className="hk-cta-dismiss"
            onClick={() => {
              setIsMinimized(true);
              wasMinimized.current = true;
            }}
            aria-label="Dismiss chat prompt"
            title="Minimize"
          >
            <X size={10} strokeWidth={3} />
          </button>
        </div>
      )}

      {/* Floating Launcher Button */}
      {!isOpen && !isMinimized && (
        <button
          type="button"
          className="hk-btn"
          aria-label="Open Hello Kitty 2.0 chat"
          aria-expanded={isOpen}
          onClick={() => {
            playPop('send');
            setIsOpen(true);
          }}
        >
          <KittyAvatar emote={isExhausted ? 'sleepy' : 'sparkle'} size={36} />
          <div className="hk-dot" />
          <div className="hk-badge-launcher">2.0</div>
        </button>
      )}
    </>
  );
}
