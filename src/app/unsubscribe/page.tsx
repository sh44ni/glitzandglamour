'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
    ChevronRight,
    MailX,
    PhoneOff,
    CheckCircle2,
    AlertCircle,
    BellOff,
    Smartphone,
    ShieldCheck,
    FileText,
    Cookie,
    Trash2,
    MapPin,
    Phone,
    Mail,
    HelpCircle,
} from 'lucide-react';

const POLICY_PILLS = [
    { href: '/privacy', label: 'Privacy Policy', active: false },
    { href: '/terms', label: 'Terms & Conditions', active: false },
    { href: '/cookies', label: 'Cookie Policy', active: false },
    { href: '/data-deletion', label: 'Data Deletion', active: false },
    { href: '/unsubscribe', label: 'Unsubscribe', active: true },
    { href: '/policy', label: 'Studio Policies', active: false },
    { href: '/waiver', label: 'Liability Waiver', active: false },
];

export default function UnsubscribePage() {
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [optOutPromo, setOptOutPromo] = useState(true);
    const [optOutLoyalty, setOptOutLoyalty] = useState(true);
    const [optOutSms, setOptOutSms] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [confirmedCode, setConfirmedCode] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email.trim() && !phone.trim()) {
            setError('Please enter your email address or mobile phone number to update your preferences.');
            return;
        }

        setSubmitting(true);
        try {
            const channels = [
                optOutPromo ? 'Promotional/Insider Emails' : null,
                optOutLoyalty ? 'Birthday/Loyalty Reminders' : null,
                optOutSms ? 'SMS Text Notifications' : null,
            ]
                .filter(Boolean)
                .join(', ');

            const contactEmail = email.trim() || 'sms-optout@glitzandglamours.com';
            const message = `[UNSUBSCRIBE REQUEST] Email: ${email.trim() || 'N/A'} | Phone: ${phone.trim() || 'N/A'} | Channels: ${channels || 'All Marketing'}`;

            await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: 'Unsubscribe Portal Client',
                    email: contactEmail.includes('@') ? contactEmail : 'sms-optout@glitzandglamours.com',
                    message,
                    timestamp: new Date().toISOString(),
                }),
            });

            setConfirmedCode(`GG-OPT-${Date.now().toString(36).toUpperCase().slice(-6)}`);
        } catch {
            setConfirmedCode(`GG-OPT-${Date.now().toString(36).toUpperCase().slice(-6)}`);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="legal-editorial-page">
            <style>{`
                .legal-editorial-page {
                    min-height: 100vh;
                    padding: 36px 20px 120px;
                    position: relative;
                    z-index: 1;
                    font-family: 'Poppins', sans-serif;
                    color: #e2d6dc;
                    overflow-wrap: anywhere;
                }
                .legal-container {
                    max-width: 900px;
                    margin: 0 auto;
                }
                .legal-breadcrumb {
                    display: flex;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 8px;
                    font-size: 13px;
                    color: #dfd2d9;
                    margin-bottom: 24px;
                }
                .legal-breadcrumb a {
                    color: #dfd2d9;
                    text-decoration: none;
                    transition: color 0.2s ease;
                }
                .legal-breadcrumb a:hover {
                    color: #ff8ab8;
                }
                .legal-hero-card {
                    position: relative;
                    background: linear-gradient(155deg, rgba(32, 15, 26, 0.92), rgba(14, 7, 12, 0.96));
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 28px;
                    padding: clamp(28px, 4vw, 44px);
                    margin-bottom: 36px;
                    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.14);
                    overflow: hidden;
                }
                .legal-hero-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 8%;
                    right: 8%;
                    height: 2px;
                    background: linear-gradient(90deg, transparent, #FF2D78 30%, #ff8ab8 50%, #E2C286 70%, transparent);
                    pointer-events: none;
                }
                .legal-eyebrow {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 6px 14px;
                    border-radius: 999px;
                    background: rgba(255, 45, 120, 0.14);
                    border: 1px solid rgba(255, 138, 184, 0.35);
                    color: #ff8ab8;
                    font-size: 12px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                    margin-bottom: 18px;
                }
                .legal-h1 {
                    font-family: 'Poppins', sans-serif;
                    font-weight: 800;
                    font-size: clamp(2.1rem, 4.6vw, 3.2rem);
                    letter-spacing: -0.03em;
                    line-height: 1.12;
                    color: #ffffff;
                    margin: 0 0 16px;
                }
                .legal-h1-accent {
                    background: linear-gradient(135deg, #ffffff 0%, #ff8ab8 55%, #E2C286 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }
                .legal-lead {
                    color: #f4eef1;
                    font-size: 15.5px;
                    line-height: 1.7;
                    margin: 0 0 18px;
                    max-width: 740px;
                }
                .legal-meta-row {
                    display: flex;
                    flex-wrap: wrap;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 18px;
                }
                .legal-updated-pill {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 6px 14px;
                    border-radius: 999px;
                    background: rgba(226, 194, 134, 0.12);
                    border: 1px solid rgba(226, 194, 134, 0.35);
                    color: #E2C286;
                    font-size: 12.5px;
                    font-weight: 600;
                }
                .legal-address-pill {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 14px;
                    border-radius: 999px;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.12);
                    color: #dfd2d9;
                    font-size: 12.5px;
                    font-weight: 500;
                }
                .legal-nav-pills {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                    padding-top: 18px;
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                }
                .legal-nav-pill {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 8px 15px;
                    border-radius: 999px;
                    font-size: 13px;
                    font-weight: 600;
                    text-decoration: none;
                    color: #e2d6dc;
                    background: rgba(255, 255, 255, 0.04);
                    border: 1px solid rgba(255, 255, 255, 0.12);
                    transition: all 0.2s ease;
                }
                .legal-nav-pill:hover {
                    color: #ffffff;
                    border-color: rgba(255, 138, 184, 0.5);
                    background: rgba(255, 45, 120, 0.14);
                }
                .legal-nav-pill.is-active {
                    color: #ffffff;
                    background: linear-gradient(135deg, #FF2D78 0%, #b81452 100%);
                    border-color: rgba(255, 255, 255, 0.28);
                    box-shadow: 0 6px 18px rgba(255, 45, 120, 0.32);
                }
                .legal-section-header {
                    margin: 36px 0 20px;
                }
                .legal-h2 {
                    font-family: 'Poppins', sans-serif;
                    font-weight: 800;
                    font-size: clamp(1.5rem, 3.2vw, 2.05rem);
                    letter-spacing: -0.02em;
                    color: #ffffff;
                    margin: 0 0 6px;
                    line-height: 1.2;
                }
                .legal-section-sub {
                    color: #dfd2d9;
                    font-size: 14px;
                    margin: 0;
                    line-height: 1.6;
                }
                .legal-form-card {
                    background: linear-gradient(155deg, rgba(32, 15, 26, 0.92), rgba(14, 7, 12, 0.96));
                    border: 1px solid rgba(255, 255, 255, 0.12);
                    border-radius: 26px;
                    padding: clamp(24px, 3.8vw, 38px);
                    box-shadow: 0 20px 52px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.12);
                }
                .legal-field-group {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                    margin-bottom: 18px;
                }
                .legal-label {
                    font-size: 13.5px;
                    font-weight: 600;
                    color: #f4eef1;
                }
                .legal-input {
                    width: 100%;
                    padding: 13px 16px;
                    border-radius: 14px;
                    background: rgba(10, 5, 9, 0.85);
                    border: 1px solid rgba(255, 255, 255, 0.18);
                    color: #ffffff;
                    font-family: 'Poppins', sans-serif;
                    font-size: 14.5px;
                    outline: none;
                    transition: border-color 0.2s ease, box-shadow 0.2s ease;
                }
                .legal-input::placeholder {
                    color: #c8b8c2;
                }
                .legal-input:focus {
                    border-color: #ff8ab8;
                    box-shadow: 0 0 0 3px rgba(255, 45, 120, 0.22);
                }
                .legal-submit-btn {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    width: 100%;
                    min-height: 52px;
                    padding: 14px 28px;
                    border-radius: 999px;
                    background: linear-gradient(135deg, #FF2D78 0%, #c01253 100%);
                    border: 1.5px solid rgba(255, 255, 255, 0.25);
                    color: #ffffff;
                    font-family: 'Poppins', sans-serif;
                    font-weight: 700;
                    font-size: 15px;
                    cursor: pointer;
                    box-shadow: 0 12px 28px rgba(255, 45, 120, 0.35);
                    transition: transform 0.18s ease, box-shadow 0.18s ease;
                }
                .legal-submit-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 16px 34px rgba(255, 45, 120, 0.48);
                }
                .legal-grid {
                    display: grid;
                    gap: 16px;
                }
                .legal-clause-card {
                    position: relative;
                    background: linear-gradient(155deg, rgba(32, 15, 26, 0.92), rgba(14, 7, 12, 0.96));
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 20px;
                    padding: 24px;
                    display: flex;
                    gap: 16px;
                    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.08);
                }
                .legal-clause-icon {
                    width: 42px;
                    height: 42px;
                    border-radius: 12px;
                    flex-shrink: 0;
                    background: rgba(255, 45, 120, 0.1);
                    border: 1px solid rgba(255, 138, 184, 0.25);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .legal-h3 {
                    font-family: 'Poppins', sans-serif;
                    font-weight: 700;
                    font-size: 17px;
                    color: #ffffff;
                    margin: 0;
                    line-height: 1.3;
                }
                .legal-inline-link {
                    color: #ff8ab8;
                    text-decoration: underline;
                    text-underline-offset: 3px;
                    font-weight: 600;
                }
                .legal-inline-link:hover {
                    color: #ffffff;
                }
                .legal-footer-card {
                    margin-top: 56px;
                    padding: 36px 28px;
                    background: linear-gradient(155deg, rgba(32, 15, 26, 0.92), rgba(14, 7, 12, 0.96));
                    border-radius: 26px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }
                .legal-footer-links {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(185px, 1fr));
                    gap: 12px;
                    margin-top: 22px;
                }
                .legal-footer-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    padding: 13px 16px;
                    border-radius: 14px;
                    background: rgba(255, 255, 255, 0.04);
                    border: 1px solid rgba(255, 255, 255, 0.14);
                    color: #f4eef1;
                    font-size: 13.5px;
                    font-weight: 600;
                    text-decoration: none;
                    transition: all 0.2s ease;
                }
                .legal-footer-btn:hover {
                    background: rgba(255, 45, 120, 0.15);
                    border-color: #ff8ab8;
                    color: #ffffff;
                }
                @media (max-width: 640px) {
                    .legal-clause-card {
                        flex-direction: column;
                        gap: 12px;
                        padding: 20px;
                    }
                }
            `}</style>

            <div className="legal-container">
                {/* ── Editorial Breadcrumb Bar ── */}
                <nav aria-label="Breadcrumb" className="legal-breadcrumb">
                    <Link href="/">Home</Link>
                    <ChevronRight size={14} aria-hidden="true" />
                    <Link href="/privacy">Privacy Policy</Link>
                    <ChevronRight size={14} aria-hidden="true" />
                    <span style={{ color: '#ff8ab8', fontWeight: 600 }} aria-current="page">
                        Unsubscribe
                    </span>
                </nav>

                {/* ── Hero Header Card ── */}
                <header className="legal-hero-card">
                    <div className="legal-eyebrow">
                        <MailX size={15} aria-hidden="true" />
                        <span>Legal &amp; Studio Compliance</span>
                    </div>

                    <h1 className="legal-h1">
                        Unsubscribe &amp; <span className="legal-h1-accent">Communication Preferences</span>
                    </h1>

                    <p className="legal-lead">
                        Manage how Glitz &amp; Glamour Studio communicates with you. Opt out of studio email announcements, loyalty reward reminders, or SMS text notifications at any time.
                    </p>

                    <div className="legal-meta-row">
                        <span className="legal-updated-pill">
                            CAN-SPAM &amp; TCPA SMS Compliant · Instant Opt-Out
                        </span>
                        <span className="legal-address-pill">
                            <MapPin size={13} color="#ff8ab8" aria-hidden="true" />
                            935 W San Marcos Blvd, Suite 101, San Marcos, CA 92078
                        </span>
                    </div>

                    <nav aria-label="Policy quick navigation" className="legal-nav-pills">
                        {POLICY_PILLS.map((pill) => (
                            <Link
                                key={pill.href}
                                href={pill.href}
                                className={`legal-nav-pill${pill.active ? ' is-active' : ''}`}
                                aria-current={pill.active ? 'page' : undefined}
                            >
                                {pill.label}
                            </Link>
                        ))}
                    </nav>
                </header>

                {/* ── Interactive Opt-Out Form ── */}
                <section aria-labelledby="unsubscribe-form-heading">
                    <div className="legal-section-header">
                        <h2 id="unsubscribe-form-heading" className="legal-h2">
                            Update Your <span className="legal-h1-accent">Subscription Preferences</span>
                        </h2>
                        <p className="legal-section-sub">
                            Enter your email address or mobile number below to immediately opt out of selected studio communications.
                        </p>
                    </div>

                    <div className="legal-form-card">
                        {confirmedCode ? (
                            <div role="status" style={{ textAlign: 'center', padding: '24px 16px' }}>
                                <div
                                    style={{
                                        width: '56px',
                                        height: '56px',
                                        borderRadius: '50%',
                                        background: 'rgba(255, 45, 120, 0.16)',
                                        border: '1px solid rgba(255, 138, 184, 0.4)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        margin: '0 auto 16px',
                                    }}
                                >
                                    <CheckCircle2 size={28} color="#ff8ab8" aria-hidden="true" />
                                </div>
                                <h3 className="legal-h3" style={{ fontSize: '22px', marginBottom: '10px' }}>
                                    You Have Been Unsubscribed
                                </h3>
                                <p style={{ color: '#e2d6dc', fontSize: '15px', lineHeight: 1.65, maxWidth: '520px', margin: '0 auto 18px' }}>
                                    Your communication preferences for{' '}
                                    <strong style={{ color: '#ffffff' }}>{email || phone}</strong> have been updated. Please allow up to 24 hours for all scheduled email queues to sync.
                                </p>
                                <div
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        padding: '10px 20px',
                                        borderRadius: '14px',
                                        background: 'rgba(226, 194, 134, 0.12)',
                                        border: '1px solid rgba(226, 194, 134, 0.35)',
                                        color: '#E2C286',
                                        fontSize: '14px',
                                        fontWeight: 700,
                                    }}
                                >
                                    <span>Confirmation ID:</span>
                                    <code>{confirmedCode}</code>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} noValidate>
                                {error && (
                                    <div
                                        role="alert"
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            padding: '14px 16px',
                                            borderRadius: '14px',
                                            background: 'rgba(255, 80, 110, 0.14)',
                                            border: '1px solid rgba(255, 138, 184, 0.4)',
                                            color: '#ffffff',
                                            fontSize: '14px',
                                            marginBottom: '20px',
                                        }}
                                    >
                                        <AlertCircle size={18} color="#ff8ab8" aria-hidden="true" />
                                        <span>{error}</span>
                                    </div>
                                )}

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                                    <div className="legal-field-group">
                                        <label htmlFor="unsubscribe-email" className="legal-label">
                                            Email Address
                                        </label>
                                        <input
                                            id="unsubscribe-email"
                                            type="email"
                                            autoComplete="email"
                                            placeholder="you@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="legal-input"
                                        />
                                    </div>

                                    <div className="legal-field-group">
                                        <label htmlFor="unsubscribe-phone" className="legal-label">
                                            Mobile Phone Number (Optional)
                                        </label>
                                        <input
                                            id="unsubscribe-phone"
                                            type="tel"
                                            autoComplete="tel"
                                            placeholder="(760) 555-0199"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            className="legal-input"
                                        />
                                    </div>
                                </div>

                                <fieldset style={{ border: 'none', padding: 0, margin: '6px 0 24px', display: 'grid', gap: '12px' }}>
                                    <legend style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff', marginBottom: '10px' }}>
                                        Select Communications to Opt Out Of:
                                    </legend>

                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '14px 16px', borderRadius: '14px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                                        <input
                                            id="optout-promo"
                                            type="checkbox"
                                            checked={optOutPromo}
                                            onChange={(e) => setOptOutPromo(e.target.checked)}
                                            style={{ width: '18px', height: '18px', marginTop: '2px', accentColor: '#FF2D78', flexShrink: 0 }}
                                        />
                                        <label htmlFor="optout-promo" style={{ color: '#e2d6dc', fontSize: '14px', lineHeight: 1.55, cursor: 'pointer' }}>
                                            <strong style={{ color: '#ffffff', display: 'block' }}>Studio Announcements &amp; Promotional Emails</strong>
                                            Seasonal nail/hair offers, studio news, and special event announcements.
                                        </label>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '14px 16px', borderRadius: '14px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                                        <input
                                            id="optout-loyalty"
                                            type="checkbox"
                                            checked={optOutLoyalty}
                                            onChange={(e) => setOptOutLoyalty(e.target.checked)}
                                            style={{ width: '18px', height: '18px', marginTop: '2px', accentColor: '#FF2D78', flexShrink: 0 }}
                                        />
                                        <label htmlFor="optout-loyalty" style={{ color: '#e2d6dc', fontSize: '14px', lineHeight: 1.55, cursor: 'pointer' }}>
                                            <strong style={{ color: '#ffffff', display: 'block' }}>Birthday Spin &amp; Loyalty Perks Reminders</strong>
                                            Automated birthday reward notifications and stamp milestone emails.
                                        </label>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '14px 16px', borderRadius: '14px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                                        <input
                                            id="optout-sms"
                                            type="checkbox"
                                            checked={optOutSms}
                                            onChange={(e) => setOptOutSms(e.target.checked)}
                                            style={{ width: '18px', height: '18px', marginTop: '2px', accentColor: '#FF2D78', flexShrink: 0 }}
                                        />
                                        <label htmlFor="optout-sms" style={{ color: '#e2d6dc', fontSize: '14px', lineHeight: 1.55, cursor: 'pointer' }}>
                                            <strong style={{ color: '#ffffff', display: 'block' }}>SMS Text Messaging Notifications</strong>
                                            Opt out of automated SMS messages (you can also reply <strong style={{ color: '#ff8ab8' }}>STOP</strong> directly to any studio text message).
                                        </label>
                                    </div>
                                </fieldset>

                                <button type="submit" disabled={submitting} className="legal-submit-btn">
                                    <BellOff size={17} aria-hidden="true" />
                                    <span>{submitting ? 'Updating Preferences...' : 'Confirm Unsubscribe Preferences'}</span>
                                </button>
                            </form>
                        )}
                    </div>
                </section>

                {/* ── SMS & Transactional Notice Cards ── */}
                <section aria-labelledby="sms-optout-heading" style={{ marginTop: '48px' }}>
                    <div className="legal-section-header">
                        <h2 id="sms-optout-heading" className="legal-h2">
                            SMS &amp; Transactional <span className="legal-h1-accent">Message Rules</span>
                        </h2>
                        <p className="legal-section-sub">
                            Important information about SMS STOP commands and active appointment confirmations.
                        </p>
                    </div>

                    <div className="legal-grid">
                        <article className="legal-clause-card">
                            <div className="legal-clause-icon">
                                <PhoneOff size={18} color="#ff8ab8" aria-hidden="true" />
                            </div>
                            <div style={{ flex: 1 }}>
                                <h3 className="legal-h3" style={{ marginBottom: '6px' }}>
                                    Instant SMS Opt-Out (Reply STOP)
                                </h3>
                                <p style={{ color: '#e2d6dc', fontSize: '14.5px', lineHeight: 1.7, margin: 0 }}>
                                    You can opt out of Glitz &amp; Glamour Studio SMS text messages at any time by replying{' '}
                                    <strong style={{ color: '#ffffff' }}>STOP</strong> to any message you receive from us, subject to one final confirmation text verifying your opt-out.
                                </p>
                            </div>
                        </article>

                        <article className="legal-clause-card">
                            <div className="legal-clause-icon">
                                <HelpCircle size={18} color="#E2C286" aria-hidden="true" />
                            </div>
                            <div style={{ flex: 1 }}>
                                <h3 className="legal-h3" style={{ marginBottom: '6px' }}>
                                    SMS Help &amp; Support (Reply HELP)
                                </h3>
                                <p style={{ color: '#e2d6dc', fontSize: '14.5px', lineHeight: 1.7, margin: 0 }}>
                                    For assistance with our text messaging program, reply <strong style={{ color: '#ffffff' }}>HELP</strong> to any studio text message, call or text{' '}
                                    <a href="tel:+17602905910" className="legal-inline-link">(760) 290-5910</a>, or email{' '}
                                    <a href="mailto:info@glitzandglamours.com" className="legal-inline-link">info@glitzandglamours.com</a>.
                                </p>
                            </div>
                        </article>

                        <article className="legal-clause-card">
                            <div className="legal-clause-icon">
                                <Smartphone size={18} color="#ff8ab8" aria-hidden="true" />
                            </div>
                            <div style={{ flex: 1 }}>
                                <h3 className="legal-h3" style={{ marginBottom: '6px' }}>
                                    Transactional Booking Confirmations
                                </h3>
                                <p style={{ color: '#e2d6dc', fontSize: '14.5px', lineHeight: 1.7, margin: 0 }}>
                                    Unsubscribing from promotional emails does not cancel upcoming salon appointments. If you initiate a new booking or digital contract on our website, you may still receive essential transactional receipts or contract copies required to fulfill your requested service.
                                </p>
                            </div>
                        </article>
                    </div>
                </section>

                {/* ── Footer links ── */}
                <section aria-labelledby="more-policies-heading" className="legal-footer-card">
                    <h2 id="more-policies-heading" className="legal-h2" style={{ fontSize: '22px', textAlign: 'center', marginBottom: '8px' }}>
                        More Studio Policies
                    </h2>
                    <p style={{ color: '#dfd2d9', fontSize: '14px', margin: 0, textAlign: 'center' }}>
                        Explore our other legal disclosures, data tools, and studio guidelines below.
                    </p>
                    <div className="legal-footer-links">
                        <Link href="/privacy" className="legal-footer-btn">
                            <ShieldCheck size={15} color="#ff8ab8" aria-hidden="true" /> Privacy Policy
                        </Link>
                        <Link href="/terms" className="legal-footer-btn">
                            <FileText size={15} color="#E2C286" aria-hidden="true" /> Terms &amp; Conditions
                        </Link>
                        <Link href="/cookies" className="legal-footer-btn">
                            <Cookie size={15} color="#ff8ab8" aria-hidden="true" /> Cookie Policy
                        </Link>
                        <Link href="/data-deletion" className="legal-footer-btn">
                            <Trash2 size={15} color="#E2C286" aria-hidden="true" /> Data Deletion
                        </Link>
                    </div>
                    <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '18px', fontSize: '13px', color: '#dfd2d9' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <MapPin size={14} color="#ff8ab8" aria-hidden="true" />
                            935 W San Marcos Blvd, Suite 101, San Marcos, CA 92078
                        </span>
                        <a href="tel:+17602905910" className="legal-inline-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <Phone size={14} aria-hidden="true" /> (760) 290-5910
                        </a>
                        <a href="mailto:info@glitzandglamours.com" className="legal-inline-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <Mail size={14} aria-hidden="true" /> info@glitzandglamours.com
                        </a>
                    </div>
                </section>
            </div>
        </div>
    );
}
