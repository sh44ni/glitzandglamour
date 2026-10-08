'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, Calendar, MapPin, ArrowRight, ArrowLeft, Check, Phone, Mail, User, Clock, Heart } from 'lucide-react';

interface InteractiveQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEventType?: string;
  defaultLocation?: string;
}

const EVENT_CHIPS = [
  { label: 'Wedding / Bridal', icon: '💍' },
  { label: 'Quinceañera', icon: '👑' },
  { label: 'Prom / Homecoming', icon: '✨' },
  { label: 'Bridal Shower / Bach', icon: '🥂' },
  { label: 'Photo / Video Shoot', icon: '📸' },
  { label: 'Special Occasion / Gala', icon: '💃' },
];

const GUEST_CHIPS = [
  'Just me (1)',
  '2–3 people',
  '4–6 people',
  '7–10 people',
  '11+ VIP Party',
];

const SERVICE_CHIPS = [
  { id: 'Makeup', label: 'Full Glam Makeup', icon: '💄' },
  { id: 'Hair Styling', label: 'Bridal / Event Hair Styling', icon: '💇‍♀️' },
  { id: 'Updo', label: 'Updo & Hair Sculpting', icon: '✨' },
  { id: 'Lashes', label: 'Lashes & Finishing Touches', icon: '👁️' },
  { id: 'Hair Color', label: 'Hair Color & Extensions', icon: '🎨' },
  { id: 'Not sure yet', label: 'Not Sure (Recommend for Me)', icon: '💡' },
];

const BUDGET_CHIPS = [
  'Under $300',
  '$300 – $600',
  '$600 – $1,200',
  '$1,200 – $2,500',
  'Flexible',
];

function fmtPhone(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 10);
  if (d.length > 6) return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
  if (d.length > 3) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return d.length ? `(${d}` : '';
}

export default function InteractiveQuoteModal({
  isOpen,
  onClose,
  defaultEventType = '',
  defaultLocation = '',
}: InteractiveQuoteModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Form State
  const [eventType, setEventType] = useState(defaultEventType || 'Wedding / Bridal');
  const [eventDate, setEventDate] = useState('');
  const [guestCount, setGuestCount] = useState('Just me (1)');

  const [services, setServices] = useState<string[]>(['Makeup', 'Hair Styling']);
  const [onLocation, setOnLocation] = useState<'Yes — come to my venue' | 'No — we come to studio'>('Yes — come to my venue');
  const [location, setLocation] = useState(defaultLocation || '');

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [budget, setBudget] = useState('Flexible');
  const [notes, setNotes] = useState('');

  const [stepError, setStepError] = useState('');
  const modalBoxRef = useRef<HTMLDivElement>(null);

  // Sync incoming defaults
  useEffect(() => {
    if (defaultEventType) {
      // Find matching chip or fallback
      const match = EVENT_CHIPS.find(c => c.label.toLowerCase().includes(defaultEventType.toLowerCase().slice(0, 5)));
      setEventType(match ? match.label : defaultEventType);
    }
    if (defaultLocation) {
      setLocation(defaultLocation);
    }
  }, [defaultEventType, defaultLocation]);

  // Reset step error on input
  useEffect(() => {
    setStepError('');
  }, [step, eventType, eventDate, guestCount, services, location, firstName, lastName, phone, email]);

  if (!isOpen) return null;

  // Step 1 Validation
  const handleNextStep1 = () => {
    if (!eventType) {
      setStepError('Please choose the event type you are celebrating.');
      return;
    }
    if (!eventDate) {
      setStepError('Please pick an event date so we can check availability.');
      return;
    }
    if (!guestCount) {
      setStepError('Please select how many guests will receive services.');
      return;
    }
    setStepError('');
    setStep(2);
    modalBoxRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Step 2 Validation
  const handleNextStep2 = () => {
    if (services.length === 0) {
      setStepError('Please pick at least one service or select "Recommend for Me".');
      return;
    }
    if (!location.trim()) {
      setStepError('Please enter your venue, hotel, or city.');
      return;
    }
    setStepError('');
    setStep(3);
    modalBoxRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Step 3 Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      setStepError('Please enter your first and last name.');
      return;
    }
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setStepError('Please enter a valid 10-digit phone number for your SMS estimate.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setStepError('Please enter a valid email address.');
      return;
    }

    setSubmitting(true);
    setSubmitError('');

    try {
      const res = await fetch('/api/special-events-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim(),
          email: email.trim().toLowerCase(),
          eventType,
          eventDate,
          guestCount,
          location: location.trim(),
          services,
          onLocation,
          budget,
          notes: notes.trim(),
        }),
      });

      if (!res.ok) throw new Error('Failed to submit quote inquiry');
      setSubmitted(true);
    } catch {
      setSubmitError('Something went wrong. Please check your connection or call us directly.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleService = (sId: string) => {
    if (sId === 'Not sure yet') {
      setServices(['Not sure yet']);
      return;
    }
    setServices(prev => {
      const filtered = prev.filter(x => x !== 'Not sure yet');
      if (filtered.includes(sId)) {
        return filtered.filter(x => x !== sId);
      }
      return [...filtered, sId];
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        animation: 'popIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <style>{`
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.94) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes fadeInStep {
          from { opacity: 0; transform: translateX(8px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .quote-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 9px 14px;
          border-radius: 50px;
          font-family: 'Poppins', sans-serif;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.18s ease;
          user-select: none;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: #ddd;
        }
        .quote-chip:hover {
          background: rgba(255, 45, 120, 0.1);
          border-color: rgba(255, 45, 120, 0.4);
          color: #fff;
          transform: translateY(-1px);
        }
        .quote-chip.selected {
          background: linear-gradient(135deg, rgba(255, 45, 120, 0.25), rgba(168, 85, 247, 0.2));
          border: 1.5px solid #FF2D78;
          color: #ffffff;
          font-weight: 600;
          box-shadow: 0 0 14px rgba(255, 45, 120, 0.3);
        }
        .quote-input {
          width: 100%;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 12px;
          color: #fff;
          font-family: 'Poppins', sans-serif;
          font-size: 14px;
          padding: 11px 14px;
          outline: none;
          transition: all 0.2s ease;
        }
        .quote-input:focus {
          border-color: #FF2D78;
          background: rgba(255, 255, 255, 0.08);
          box-shadow: 0 0 0 3px rgba(255, 45, 120, 0.15);
        }
      `}</style>

      <div
        ref={modalBoxRef}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '520px',
          maxHeight: '90vh',
          overflowY: 'auto',
          backgroundColor: '#0f0a14',
          backgroundImage: 'radial-gradient(ellipse at top, rgba(255, 45, 120, 0.14) 0%, transparent 70%)',
          border: '1px solid rgba(255, 45, 120, 0.3)',
          borderRadius: '24px',
          boxShadow: '0 24px 70px rgba(0, 0, 0, 0.9), 0 0 32px rgba(255, 45, 120, 0.16)',
          padding: '24px',
          boxSizing: 'border-box',
        }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close quote popup"
          style={{
            position: 'absolute',
            top: '18px',
            right: '18px',
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '50%',
            width: '34px',
            height: '34px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#aaa',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            zIndex: 10,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#fff';
            e.currentTarget.style.borderColor = '#FF2D78';
            e.currentTarget.style.background = 'rgba(255, 45, 120, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#aaa';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
          }}
        >
          <X size={16} />
        </button>

        {submitted ? (
          /* Celebratory Confirmation Screen */
          <div style={{ textAlign: 'center', padding: '32px 12px 16px', animation: 'fadeInStep 0.3s ease' }}>
            <div style={{ fontSize: '50px', marginBottom: '16px', lineHeight: 1 }}>🌸</div>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '11px',
                fontWeight: 700,
                color: '#00D478',
                background: 'rgba(0, 212, 120, 0.12)',
                border: '1px solid rgba(0, 212, 120, 0.3)',
                padding: '4px 12px',
                borderRadius: '50px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '12px',
              }}
            >
              <Check size={12} strokeWidth={3} /> Inquiry Sent to Jojo
            </span>

            <h3 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '22px', fontWeight: 800, color: '#fff', margin: '0 0 10px' }}>
              You&apos;re On Our Calendar Radar!
            </h3>

            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13.5px', color: '#ccc', lineHeight: 1.6, maxWidth: '400px', margin: '0 auto 20px' }}>
              Thank you, <strong style={{ color: '#fff' }}>{firstName}</strong>! We received your <strong style={{ color: '#FF2D78' }}>{eventType}</strong> details for <strong style={{ color: '#fff' }}>{eventDate}</strong>.
              <br /><br />
              We will review our styling calendar and send your personalized, itemized quote to <strong style={{ color: '#fff' }}>{email}</strong> &amp; text <strong style={{ color: '#fff' }}>{phone}</strong> within 24–48 hours.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={onClose}
                className="btn-primary"
                style={{ padding: '10px 28px', fontSize: '13.5px', borderRadius: '50px' }}
              >
                Done / Close
              </button>
              <a
                href="https://www.instagram.com/glitzandglamourstudio/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline"
                style={{ padding: '10px 20px', fontSize: '13.5px', borderRadius: '50px' }}
              >
                Follow @glitzandglamourstudio ✨
              </a>
            </div>
          </div>
        ) : (
          /* Multi-Step Flow */
          <div>
            {/* Header Badge & Title */}
            <div style={{ marginBottom: '18px', paddingRight: '36px' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#FF2D78',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  marginBottom: '6px',
                }}
              >
                <Sparkles size={12} /> Custom Pricing Proposal
              </div>
              <h2
                style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '20px',
                  fontWeight: 800,
                  color: '#fff',
                  margin: '0 0 4px',
                  lineHeight: 1.25,
                }}
              >
                {step === 1 && '1. Choose Your Event & Date'}
                {step === 2 && '2. Your Glam Vision & Location'}
                {step === 3 && '3. Where to Send Your Quote?'}
              </h2>
              <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12.5px', color: '#999', margin: 0 }}>
                {step === 1 && 'Tell us what you are celebrating and your target event date.'}
                {step === 2 && 'Select the services you need and where glam takes place.'}
                {step === 3 && 'Enter your contact info to receive an itemized proposal.'}
              </p>
            </div>

            {/* Glowing Step Progress Bar */}
            <div
              style={{
                width: '100%',
                height: '4px',
                background: 'rgba(255, 255, 255, 0.08)',
                borderRadius: '4px',
                marginBottom: '22px',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: step === 1 ? '33%' : step === 2 ? '66%' : '100%',
                  background: 'linear-gradient(90deg, #FF2D78, #FF6BA8, #a855f7)',
                  boxShadow: '0 0 8px #FF2D78',
                  borderRadius: '4px',
                  transition: 'width 0.25s ease',
                }}
              />
            </div>

            {/* Validation Error Banner */}
            {stepError && (
              <div
                style={{
                  background: 'rgba(255, 45, 120, 0.1)',
                  border: '1px solid rgba(255, 45, 120, 0.35)',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  fontSize: '12px',
                  color: '#ffa8c5',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  animation: 'fadeInStep 0.2s ease',
                }}
              >
                <span>⚠️</span>
                <span>{stepError}</span>
              </div>
            )}

            {/* ── STEP 1: EVENT, DATE, GUESTS ── */}
            {step === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeInStep 0.25s ease' }}>
                {/* Event Type Chips */}
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#FF2D78', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                    What Are You Celebrating? *
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {EVENT_CHIPS.map(c => (
                      <button
                        key={c.label}
                        type="button"
                        onClick={() => setEventType(c.label)}
                        className={`quote-chip ${eventType === c.label ? 'selected' : ''}`}
                      >
                        <span>{c.icon}</span>
                        <span>{c.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Event Date Input */}
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#FF2D78', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                    Event Date *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="quote-input"
                      style={{ paddingLeft: '38px', colorScheme: 'dark' }}
                    />
                    <Calendar size={16} color="#FF2D78" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  </div>
                </div>

                {/* Guests Count Chips */}
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#FF2D78', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                    How Many Guests Receiving Glam? *
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {GUEST_CHIPS.map(g => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setGuestCount(g)}
                        className={`quote-chip ${guestCount === g ? 'selected' : ''}`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Step 1 Actions */}
                <div style={{ marginTop: '10px' }}>
                  <button
                    type="button"
                    onClick={handleNextStep1}
                    className="btn-primary"
                    style={{ width: '100%', padding: '13px', fontSize: '14px', fontWeight: 700, justifyContent: 'center' }}
                  >
                    Continue to Glam Services <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 2: GLAM VISION & LOCATION ── */}
            {step === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeInStep 0.25s ease' }}>
                {/* Services Needed */}
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#FF2D78', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                    Services Needed (Select all that apply) *
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
                    {SERVICE_CHIPS.map(s => {
                      const isSel = services.includes(s.id);
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => toggleService(s.id)}
                          className={`quote-chip ${isSel ? 'selected' : ''}`}
                          style={{ borderRadius: '12px', justifyContent: 'flex-start' }}
                        >
                          <span>{s.icon}</span>
                          <span style={{ flex: 1, textAlign: 'left' }}>{s.label}</span>
                          {isSel && <Check size={14} color="#FF2D78" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* On-Location Preference */}
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#FF2D78', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                    Where Should We Glam You? *
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setOnLocation('Yes — come to my venue')}
                      className={`quote-chip ${onLocation === 'Yes — come to my venue' ? 'selected' : ''}`}
                      style={{ borderRadius: '12px', justifyContent: 'center', textAlign: 'center', padding: '12px 10px' }}
                    >
                      🚗 On-Location / Venue
                    </button>
                    <button
                      type="button"
                      onClick={() => setOnLocation('No — we come to studio')}
                      className={`quote-chip ${onLocation === 'No — we come to studio' ? 'selected' : ''}`}
                      style={{ borderRadius: '12px', justifyContent: 'center', textAlign: 'center', padding: '12px 10px' }}
                    >
                      🏢 San Marcos Studio
                    </button>
                  </div>
                </div>

                {/* Event Location Input */}
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#FF2D78', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                    Venue Name or City Location *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      placeholder="e.g. Twin Oaks House, Carlsbad or Home Address"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="quote-input"
                      style={{ paddingLeft: '38px' }}
                    />
                    <MapPin size={16} color="#FF2D78" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  </div>
                </div>

                {/* Step 2 Navigation */}
                <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                  <button
                    type="button"
                    onClick={() => { setStep(1); setStepError(''); }}
                    className="btn-outline"
                    style={{ padding: '12px 20px', fontSize: '13.5px', borderRadius: '50px' }}
                  >
                    <ArrowLeft size={14} /> Back
                  </button>
                  <button
                    type="button"
                    onClick={handleNextStep2}
                    className="btn-primary"
                    style={{ flex: 1, padding: '12px', fontSize: '14px', fontWeight: 700, justifyContent: 'center' }}
                  >
                    Continue to Details <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 3: CONTACT & FINALIZE ── */}
            {step === 3 && (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', animation: 'fadeInStep 0.25s ease' }}>
                {/* Name */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#FF2D78', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                      First Name *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        placeholder="First Name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="quote-input"
                        style={{ paddingLeft: '34px' }}
                        required
                      />
                      <User size={14} color="#888" style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#FF2D78', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                      Last Name *
                    </label>
                    <input
                      type="text"
                      placeholder="Last Name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="quote-input"
                      required
                    />
                  </div>
                </div>

                {/* Phone & Email */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#FF2D78', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                      Phone (for SMS Quote) *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="tel"
                        placeholder="(760) 000-0000"
                        value={phone}
                        onChange={(e) => setPhone(fmtPhone(e.target.value))}
                        className="quote-input"
                        style={{ paddingLeft: '34px' }}
                        maxLength={14}
                        required
                      />
                      <Phone size={14} color="#FF2D78" style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#FF2D78', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                      Email Address *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="email"
                        placeholder="you@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="quote-input"
                        style={{ paddingLeft: '34px' }}
                        required
                      />
                      <Mail size={14} color="#888" style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    </div>
                  </div>
                </div>

                {/* Estimated Budget Chips (Optional) */}
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                    Estimated Budget (Optional)
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {BUDGET_CHIPS.map(b => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setBudget(b)}
                        className={`quote-chip ${budget === b ? 'selected' : ''}`}
                        style={{ padding: '6px 12px', fontSize: '11.5px' }}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notes (Optional) */}
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                    Notes, Ready-By Time or Vision (Optional)
                  </label>
                  <textarea
                    placeholder="e.g. Ready by 1:00 PM, Hollywood waves for bride..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    className="quote-input"
                    style={{ resize: 'none', height: '60px' }}
                  />
                </div>

                {submitError && (
                  <p style={{ color: '#FF2D78', fontSize: '12px', textAlign: 'center', margin: 0 }}>
                    {submitError}
                  </p>
                )}

                {/* Step 3 Actions */}
                <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                  <button
                    type="button"
                    onClick={() => { setStep(2); setStepError(''); }}
                    className="btn-outline"
                    style={{ padding: '12px 20px', fontSize: '13.5px', borderRadius: '50px' }}
                  >
                    <ArrowLeft size={14} /> Back
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary"
                    style={{
                      flex: 1,
                      padding: '13px',
                      fontSize: '14px',
                      fontWeight: 700,
                      justifyContent: 'center',
                      opacity: submitting ? 0.7 : 1,
                    }}
                  >
                    {submitting ? 'Sending Request… ✦' : 'Send My Quote Request ✦'}
                  </button>
                </div>

                <p style={{ fontSize: '10.5px', color: '#666', textAlign: 'center', margin: '4px 0 0' }}>
                  🔒 No obligation. Jojo reviews every inquiry and replies with personalized pricing.
                </p>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
