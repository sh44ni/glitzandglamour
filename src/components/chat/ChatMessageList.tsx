'use client';

import React from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  ExternalLink,
  FileText,
  Mic,
  Phone,
  Sparkles,
  User,
  ZoomIn,
} from 'lucide-react';
import KittyAvatar from './KittyAvatar';
import { getOriginBadgeConfig } from '@/lib/originBadges';
import type { AvailabilitySlot, ChatMessageItem, QuickReply } from './types';

type ChatMessageListProps = {
  messages: ChatMessageItem[];
  isLoading: boolean;
  agentTyping: boolean;
  agentName: string | null;
  onQuickReply: (qr: QuickReply) => void;
  onPlayPop: (type?: 'send' | 'receive' | 'sparkle') => void;
  onTriggerSparkles: () => void;
  onOpenLightbox: (images: string[], startIndex: number) => void;
  bodyRef: React.RefObject<HTMLDivElement | null>;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
};

const fmtDate = (d: string) => {
  try {
    return new Date(`${d}T12:00:00`).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return d;
  }
};

const relativeTime = (ts?: number) => {
  if (!ts) return '';
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const normalizeUrl = (rawUrl: string): string => {
  const url = rawUrl.trim().replace(/[.,;:)]+$/, '');
  if (
    !url.startsWith('http://') &&
    !url.startsWith('https://') &&
    !url.startsWith('tel:') &&
    !url.startsWith('mailto:')
  ) {
    if (url.startsWith('/')) return url;
    return `https://${url}`;
  }
  return url;
};

const getSmartButtonLabel = (rawLabel: string, url: string): { label: string; icon: string } => {
  const lowerUrl = url.toLowerCase();
  const cleanLabel = rawLabel.replace(/[🔗📎👉👇➡️✨💅📅💍👰👑💃🚗📞💎📍⭐📸❤️🌸🐱]/gu, '').trim();
  const isGeneric =
    !cleanLabel ||
    /^(here|click here|link|website|visit|this link|book here|view here|http)/i.test(cleanLabel);

  if (lowerUrl.includes('/special-events/weddings-bridal')) return { label: 'Weddings & Bridal Glam', icon: '👰' };
  if (lowerUrl.includes('/special-events/quinceaneras')) return { label: 'Quinceañeras Packages', icon: '👑' };
  if (lowerUrl.includes('/special-events/prom-homecoming')) return { label: 'Prom & Homecoming', icon: '💃' };
  if (lowerUrl.includes('/special-events/on-location')) return { label: 'On-Location Mobile Squad', icon: '🚗' };
  if (lowerUrl.includes('/special-events/bridal-showers')) return { label: 'Bridal Showers & Bachelorette', icon: '🥂' };
  if (lowerUrl.includes('/special-events/baby-showers')) return { label: 'Baby Showers & Reveals', icon: '🌸' };
  if (lowerUrl.includes('/special-events/sweet-16')) return { label: 'Sweet 16 & Birthdays', icon: '🎂' };
  if (lowerUrl.includes('/special-events/corporate-gala')) return { label: 'Corporate Galas & Headshots', icon: '✨' };
  if (lowerUrl.includes('/special-events/photo-video')) return { label: 'Photo & Video Shoots', icon: '📸' };
  if (lowerUrl.includes('/special-events')) return { label: 'Explore Special Events', icon: '✨' };
  if (lowerUrl.includes('/book')) return { label: 'Book Appointment Online', icon: '📅' };
  if (lowerUrl.includes('/card')) return { label: 'VIP Loyalty Stamp Card', icon: '💎' };
  if (lowerUrl.includes('/services')) return { label: 'Browse Salon Services', icon: '💅' };
  if (lowerUrl.includes('/portfolio')) return { label: 'View Work Portfolio', icon: '🖼️' };
  if (lowerUrl.includes('/reviews')) return { label: 'Client Reviews', icon: '⭐' };
  if (lowerUrl.startsWith('tel:') || lowerUrl.includes('760')) return { label: 'Call / Text Jojo (760) 290-5910', icon: '📞' };

  return { label: cleanLabel && !isGeneric ? cleanLabel : 'View Details', icon: '✨' };
};

const EMOTE_CHIP_LABELS: Record<string, string> = {
  sparkle: '✨ Sparkly mood',
  love: '💕 Adores it',
  celebrate: '🎉 Yay!',
  apologetic: '🥺 Gentle note',
  thinking: '💭 Thinking',
  sleepy: '😴 Cat nap',
};

const ChatMessageList = React.memo(function ChatMessageList({
  messages,
  isLoading,
  agentTyping,
  agentName,
  onQuickReply,
  onPlayPop,
  onTriggerSparkles,
  onOpenLightbox,
  bodyRef,
  messagesEndRef,
}: ChatMessageListProps) {
  const renderContent = (text: string) => {
    if (!text) return null;

    const combinedRegex =
      /(\[([^\]]+)\]\(([^)]+)\))|(\*\*([^*]+)\*\*)|(?:\()?((?:https?:\/\/|(?:www\.)?glitzandglamours\.com)[^\s<)]+)(?:\))?/gi;

    const elements: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = combinedRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        elements.push(<span key={`txt-${lastIndex}`}>{text.substring(lastIndex, match.index)}</span>);
      }

      if (match[1]) {
        const url = normalizeUrl(match[3]);
        const { label, icon } = getSmartButtonLabel(match[2], url);
        elements.push(
          <a
            key={`link-${match.index}`}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="hk-btn-link"
            onClick={(e) => {
              e.stopPropagation();
              onPlayPop('sparkle');
              onTriggerSparkles();
            }}
          >
            <span className="hk-btn-link-icon">{icon}</span>
            <span className="hk-btn-link-text">{label}</span>
            <ExternalLink size={11} className="hk-btn-link-arrow" />
          </a>
        );
      } else if (match[4]) {
        elements.push(<strong key={`b-${match.index}`}>{match[5]}</strong>);
      } else if (match[6]) {
        const url = normalizeUrl(match[6]);
        const { label, icon } = getSmartButtonLabel('', url);
        elements.push(
          <a
            key={`bare-${match.index}`}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="hk-btn-link"
            onClick={(e) => {
              e.stopPropagation();
              onPlayPop('sparkle');
              onTriggerSparkles();
            }}
          >
            <span className="hk-btn-link-icon">{icon}</span>
            <span className="hk-btn-link-text">{label}</span>
            <ExternalLink size={11} className="hk-btn-link-arrow" />
          </a>
        );
      }

      lastIndex = combinedRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      elements.push(<span key={`txt-${lastIndex}`}>{text.substring(lastIndex)}</span>);
    }

    return elements;
  };

  return (
    <div ref={bodyRef} className="hk-body" role="log" aria-live="polite" aria-label="Chat messages" tabIndex={0}>
      <div className="hk-body-inner">
        {messages.map((m, i) => {
        if (m.role === 'system') {
          return (
            <div key={i} className="hk-system-pill">
              {m.content}
            </div>
          );
        }

        const groupClass =
          m.role === 'user' ? 'user-group' : m.role === 'agent' ? 'agent-group' : 'assistant-group';
        const availSlots =
          m.role === 'assistant' && !m.bookingCard && m.availability?.slots ? m.availability.slots : [];
        const isLoyaltyMsg =
          m.role === 'assistant' &&
          !m.bookingCard &&
          (m.content.toLowerCase().includes('stamp') ||
            m.content.toLowerCase().includes('loyalty') ||
            m.content.toLowerCase().includes('rewards'));
        const attachments = m.attachments || [];
        const cardOriginBadge =
          m.bookingCard?.attributionBadge ||
          (m.bookingCard?.heardFrom ? getOriginBadgeConfig(m.bookingCard.heardFrom) : null);

        return (
          <div key={i} className={`hk-msg-group ${groupClass}`}>
            {m.role === 'agent' && (
              <div className="hk-agent-badge">👤 {m.agentName || agentName || 'Team Member'}</div>
            )}

            {m.role === 'assistant' && m.emote && m.emote !== 'happy' && EMOTE_CHIP_LABELS[m.emote] && (
              <div className="hk-emote-row">
                <span className="hk-emote-avatar-mini">
                  <KittyAvatar emote={m.emote} size={18} />
                </span>
                <span className="hk-emote-pill">{EMOTE_CHIP_LABELS[m.emote]}</span>
              </div>
            )}

            <div className={`hk-msg ${m.role}`}>
              {attachments.length > 0 && (
                <div
                  className={`hk-msg-images ${attachments.length === 1 ? 'single' : 'multi'}`}
                >
                  {attachments.map((imgUrl, idx) => (
                    <button
                      key={`${imgUrl}-${idx}`}
                      type="button"
                      className="hk-msg-img-btn"
                      onClick={() => onOpenLightbox(attachments, idx)}
                      aria-label={`View inspo photo ${idx + 1}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imgUrl}
                        alt={`Inspiration photo ${idx + 1}`}
                        loading="lazy"
                        decoding="async"
                        className="hk-msg-img"
                      />
                      <span className="hk-msg-img-zoom">
                        <ZoomIn size={12} />
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {m.content && <div>{renderContent(m.content)}</div>}

              {m.isVoice && (
                <div className="hk-voice-badge">
                  <Mic size={10} /> voice
                </div>
              )}
              {m.timestamp && <div className="hk-msg-time">{relativeTime(m.timestamp)}</div>}
            </div>

            {availSlots.length > 0 && (
              <div className="hk-time-chips-wrap">
                <div className="hk-chips-title">
                  <Clock size={12} color="#FF7EB3" />
                  <span>
                    Select a time to book{m.availability?.formattedDate ? ` (${m.availability.formattedDate})` : ''}:
                  </span>
                </div>
                <div className="hk-slots-grid">
                  {availSlots.map((slot: AvailabilitySlot, idx: number) => (
                    <button
                      key={idx}
                      type="button"
                      className={`hk-time-chip${!slot.available ? ' booked' : ''}`}
                      disabled={!slot.available}
                      onClick={() => {
                        if (!slot.available) return;
                        onPlayPop('send');
                        onTriggerSparkles();
                        onQuickReply({
                          label: `⏰ ${slot.time}`,
                          message: `I would like to book${m.availability?.date ? ` on ${m.availability.date}` : ''} at ${slot.time}`,
                        });
                      }}
                    >
                      <span style={{ textDecoration: !slot.available ? 'line-through' : 'none' }}>{slot.time}</span>
                      {!slot.available && (
                        <span className="hk-booked-pill">{slot.label || 'Already Booked'}</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {isLoyaltyMsg && (
              <div className="hk-loyalty-card">
                <div className="hk-loyalty-head">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Sparkles size={14} color="#FFD700" />
                    <span className="hk-loyalty-title">VIP Loyalty Pass</span>
                  </div>
                  <span className="hk-loyalty-badge">10 STAMPS = FREE NAIL SET</span>
                </div>
                <div className="hk-stamps-grid">
                  {Array.from({ length: 10 }).map((_, sIdx) => {
                    const isFree = sIdx === 9;
                    return (
                      <div key={sIdx} className={`hk-stamp-circle ${isFree ? 'is-reward' : ''}`}>
                        {isFree ? '🎁' : '🐾'}
                        <span className="hk-stamp-num">{sIdx + 1}</span>
                      </div>
                    );
                  })}
                </div>
                <p className="hk-loyalty-sub">1 stamp per visit • Free gift on your birthday month! 🎂</p>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <a
                    href="/card"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hk-wallet-btn"
                    onClick={() => onTriggerSparkles()}
                  >
                    <span>📱 Open Digital Pass</span>
                  </a>
                  <button
                    type="button"
                    className="hk-wallet-btn secondary"
                    onClick={() => {
                      onPlayPop('send');
                      onQuickReply({
                        label: '📅 Book to Earn Stamp',
                        message: "I'd like to book an appointment to earn stamps",
                      });
                    }}
                  >
                    <span>📅 Book to Earn</span>
                  </button>
                </div>
              </div>
            )}

            {m.bookingCard && (
              <div className="hk-booking-card">
                <div className="hk-booking-card-head">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                    <CheckCircle2 size={18} color="#22c55e" />
                    <span className="hk-booking-card-title">Booking Request Submitted!</span>
                  </div>
                  <span className="hk-kitty-channel-pill">🐱 Hello Kitty</span>
                </div>

                <div className="hk-booking-rows">
                  {[
                    { icon: <Sparkles size={13} color="#FF6BA8" />, label: 'Service', value: m.bookingCard.service },
                    {
                      icon: <DollarSign size={13} color="#FF6BA8" />,
                      label: 'Price',
                      value: m.bookingCard.priceLabel || 'Discussed in person',
                    },
                    { icon: <Calendar size={13} color="#FF6BA8" />, label: 'Date', value: fmtDate(m.bookingCard.date) },
                    { icon: <Clock size={13} color="#FF6BA8" />, label: 'Time', value: m.bookingCard.time },
                    { icon: <User size={13} color="#FF6BA8" />, label: 'Name', value: m.bookingCard.guestName },
                  ].map((row, j) => (
                    <div key={j} className="hk-booking-row">
                      {row.icon}
                      <span className="hk-booking-label">{row.label}</span>
                      <span className="hk-booking-value">{row.value}</span>
                    </div>
                  ))}
                </div>

                {m.bookingCard.notes && (
                  <div className="hk-booking-notes">
                    <div className="hk-booking-notes-head">
                      <FileText size={12} color="#FF7EB3" />
                      <span>Noted Requirements</span>
                    </div>
                    <p>{m.bookingCard.notes}</p>
                  </div>
                )}

                {m.bookingCard.inspoImageUrls && m.bookingCard.inspoImageUrls.length > 0 && (
                  <div className="hk-booking-inspo">
                    <span className="hk-booking-inspo-label">
                      Attached Inspo ({m.bookingCard.inspoImageUrls.length})
                    </span>
                    <div className="hk-booking-inspo-grid">
                      {m.bookingCard.inspoImageUrls.map((url, imgIdx) => (
                        <button
                          key={`${url}-${imgIdx}`}
                          type="button"
                          className="hk-booking-inspo-thumb"
                          onClick={() => onOpenLightbox(m.bookingCard!.inspoImageUrls!, imgIdx)}
                          aria-label={`View attached inspo photo ${imgIdx + 1}`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt={`Attached inspo ${imgIdx + 1}`} loading="lazy" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {cardOriginBadge && (
                  <div className="hk-booking-origin-row">
                    <span className="hk-booking-origin-label">Found us via:</span>
                    <span
                      className="hk-booking-origin-pill"
                      style={{
                        background: cardOriginBadge.bg,
                        border: `1px solid ${cardOriginBadge.border}`,
                        color: cardOriginBadge.color,
                      }}
                    >
                      <span>{cardOriginBadge.emoji}</span>
                      <span>{cardOriginBadge.label}</span>
                    </span>
                  </div>
                )}

                <div className="hk-booking-pending">
                  <p>
                    ⏳ Pending — We&apos;ll reach out to finalize your price &amp; collect a retainer to confirm
                  </p>
                </div>

                <a href="tel:7602905910" className="hk-booking-call">
                  <Phone size={12} />
                  <span>Call or Text Jojo: (760) 290-5910</span>
                </a>
              </div>
            )}

            {m.quickReplies && m.quickReplies.length > 0 && !isLoading && (
              <div className="hk-qr-wrap">
                {m.quickReplies.map((qr, qi) => (
                  <button key={qi} type="button" className="hk-qr-btn" onClick={() => onQuickReply(qr)}>
                    {qr.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {isLoading && (
        <div className="hk-typing" aria-label="Hello Kitty is thinking">
          <KittyAvatar emote="thinking" size={22} />
          <div className="hk-typing-dots">
            <span />
            <span />
            <span />
          </div>
          <span className="hk-typing-text">Hello Kitty is thinking…</span>
        </div>
      )}

      {agentTyping && !isLoading && (
        <div
          className="hk-typing"
          style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.22)' }}
        >
          <div className="hk-typing-dots">
            <span style={{ background: '#818cf8' }} />
            <span style={{ background: '#818cf8' }} />
            <span style={{ background: '#818cf8' }} />
          </div>
          <span className="hk-typing-text" style={{ color: '#a5b4fc' }}>
            {agentName || 'Agent'} is typing…
          </span>
        </div>
      )}

      <div ref={messagesEndRef} />
      </div>
    </div>
  );
});

export default ChatMessageList;
