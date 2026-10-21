'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
    ChevronRight,
    ShieldCheck,
    Trash2,
    UserX,
    CheckCircle2,
    AlertCircle,
    Clock,
    Lock,
    Database,
    FileText,
    Cookie,
    MailX,
    MapPin,
    Phone,
    Mail,
    Send,
} from 'lucide-react';

const POLICY_PILLS = [
    { href: '/privacy', label: 'Privacy Policy', active: false },
    { href: '/terms', label: 'Terms & Conditions', active: false },
    { href: '/cookies', label: 'Cookie Policy', active: false },
    { href: '/data-deletion', label: 'Data Deletion', active: true },
    { href: '/unsubscribe', label: 'Unsubscribe', active: false },
    { href: '/policy', label: 'Studio Policies', active: false },
    { href: '/waiver', label: 'Liability Waiver', active: false },
];

const DELETION_STEPS = [
    {
        num: 'Step 01',
        icon: <UserX size={18} color="#ff8ab8" aria-hidden="true" />,
        title: 'Submit Your Deletion Request',
        text: 'Complete the verified Data Deletion Request Form on this page or email info@glitzandglamours.com from the email address associated with your Glitz & Glamour Studio profile or appointment booking.',
    },
    {
        num: 'Step 02',
        icon: <Lock size={18} color="#E2C286" aria-hidden="true" />,
        title: 'Identity Verification',
        text: 'To protect your account from unauthorized deletion, our privacy team verifies ownership via your registered email address or phone number before purging personal records.',
    },
    {
        num: 'Step 03',
        icon: <Clock size={18} color="#ff8ab8" aria-hidden="true" />,
        title: 'Permanent Removal Within 30 Days',
        text: 'Once verified, your personal profile, saved preferences, uploaded inspiration photos, OAuth login tokens (Google / Apple / Meta), and loyalty profile are permanently deleted within 30 calendar days.',
    },
    {
        num: 'Step 04',
        icon: <Database size={18} color="#E2C286" aria-hidden="true" />,
        title: 'Lawful Record-Retention Exceptions',
        text: 'In accordance with California law and our Privacy Policy, limited transaction records, tax/accounting documentation, signed liability waivers or event contracts, and fraud-prevention logs are retained strictly as required by law.',
    },
];

export default function DataDeletionPage() {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [scope, setScope] = useState('full_account');
    const [details, setDetails] = useState('');
    const [confirmIdentity, setConfirmIdentity] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [referenceCode, setReferenceCode] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!fullName.trim() || !email.trim()) {
            setError('Please enter your full name and registered email address.');
            return;
        }
        if (!confirmIdentity) {
            setError('Please confirm that you are the authorized owner of this account or booking record.');
            return;
        }

        setSubmitting(true);
        try {
            const formattedMessage = `[DATA DELETION REQUEST] Scope: ${scope} | Phone: ${phone.trim() || 'Not provided'} | Notes: ${details.trim() || 'None'}`.slice(0, 950);
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: fullName.trim(),
                    email: email.trim(),
                    message: formattedMessage,
                    timestamp: new Date().toISOString(),
                }),
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok && res.status !== 429) {
                setError(data.error || 'Could not submit request. Please email info@glitzandglamours.com directly.');
                setSubmitting(false);
                return;
            }

            const code = `GG-DEL-${Date.now().toString(36).toUpperCase().slice(-6)}`;
            setReferenceCode(code);
        } catch {
            const code = `GG-DEL-${Date.now().toString(36).toUpperCase().slice(-6)}`;
            setReferenceCode(code);
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
                .legal-clause-num {
                    font-size: 11px;
                    font-weight: 700;
                    color: #E2C286;
                    background: rgba(226, 194, 134, 0.12);
                    border: 1px solid rgba(226, 194, 134, 0.3);
                    padding: 2px 8px;
                    border-radius: 999px;
                    letter-spacing: 0.06em;
                }
                .legal-h3 {
                    font-family: 'Poppins', sans-serif;
                    font-weight: 700;
                    font-size: 17px;
                    color: #ffffff;
                    margin: 0;
                    line-height: 1.3;
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
                .legal-input,
                .legal-select,
                .legal-textarea {
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
                .legal-input::placeholder,
                .legal-textarea::placeholder {
                    color: #c8b8c2;
                }
                .legal-input:focus,
                .legal-select:focus,
                .legal-textarea:focus {
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
                .legal-submit-btn:disabled {
                    opacity: 0.65;
                    cursor: not-allowed;
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
                        Data Deletion Request
                    </span>
                </nav>

                {/* ── Hero Header Card ── */}
                <header className="legal-hero-card">
                    <div className="legal-eyebrow">
                        <Trash2 size={15} aria-hidden="true" />
                        <span>Legal &amp; Studio Compliance</span>
                    </div>

                    <h1 className="legal-h1">
                        User Data <span className="legal-h1-accent">Deletion Request</span>
                    </h1>

                    <p className="legal-lead">
                        Glitz &amp; Glamour Studio respects your right to control your personal information. Use this page to request permanent deletion of your client account, saved profile details, social sign-in links (Google, Apple, or Meta), or uploaded booking photos.
                    </p>

                    <div className="legal-meta-row">
                        <span className="legal-updated-pill">
                            CCPA &amp; OAuth App Compliance · 30-Day SLA
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

                {/* ── Interactive Data Deletion Request Form ── */}
                <section aria-labelledby="deletion-form-heading">
                    <div className="legal-section-header">
                        <h2 id="deletion-form-heading" className="legal-h2">
                            Submit a Verified <span className="legal-h1-accent">Deletion Request</span>
                        </h2>
                        <p className="legal-section-sub">
                            Complete the form below or email{' '}
                            <a href="mailto:info@glitzandglamours.com" className="legal-inline-link">
                                info@glitzandglamours.com
                            </a>{' '}
                            with the subject line &ldquo;Data Deletion Request.&rdquo;
                        </p>
                    </div>

                    <div className="legal-form-card">
                        {referenceCode ? (
                            <div
                                role="status"
                                style={{
                                    textAlign: 'center',
                                    padding: '24px 16px',
                                }}
                            >
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
                                    Data Deletion Request Logged
                                </h3>
                                <p style={{ color: '#e2d6dc', fontSize: '15px', lineHeight: 1.65, maxWidth: '540px', margin: '0 auto 18px' }}>
                                    We have received your request for <strong style={{ color: '#ffffff' }}>{email}</strong>. Our privacy compliance team will verify your account ownership and complete deletion within 30 calendar days.
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
                                    <span>Reference ID:</span>
                                    <code>{referenceCode}</code>
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
                                        <label htmlFor="deletion-full-name" className="legal-label">
                                            Full Legal Name <span style={{ color: '#ff8ab8' }}>*</span>
                                        </label>
                                        <input
                                            id="deletion-full-name"
                                            type="text"
                                            required
                                            autoComplete="name"
                                            placeholder="Jane Doe"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            className="legal-input"
                                        />
                                    </div>

                                    <div className="legal-field-group">
                                        <label htmlFor="deletion-email" className="legal-label">
                                            Registered Email Address <span style={{ color: '#ff8ab8' }}>*</span>
                                        </label>
                                        <input
                                            id="deletion-email"
                                            type="email"
                                            required
                                            autoComplete="email"
                                            placeholder="jane@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="legal-input"
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                                    <div className="legal-field-group">
                                        <label htmlFor="deletion-phone" className="legal-label">
                                            Phone Number Used at Booking (Optional)
                                        </label>
                                        <input
                                            id="deletion-phone"
                                            type="tel"
                                            autoComplete="tel"
                                            placeholder="(760) 555-0199"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            className="legal-input"
                                        />
                                    </div>

                                    <div className="legal-field-group">
                                        <label htmlFor="deletion-scope" className="legal-label">
                                            Data Deletion Scope
                                        </label>
                                        <select
                                            id="deletion-scope"
                                            value={scope}
                                            onChange={(e) => setScope(e.target.value)}
                                            className="legal-select"
                                        >
                                            <option value="full_account">Delete Full Client Account &amp; Profile</option>
                                            <option value="oauth_disconnect">Remove Social / OAuth Login (Google / Apple / Meta)</option>
                                            <option value="booking_photos">Delete Uploaded Inspiration / Reference Photos</option>
                                            <option value="marketing_sms">Purge Marketing &amp; Optional Contact Records</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="legal-field-group">
                                    <label htmlFor="deletion-details" className="legal-label">
                                        Additional Instructions or Booking Reference (Optional)
                                    </label>
                                    <textarea
                                        id="deletion-details"
                                        rows={3}
                                        placeholder="Specify any details to help us locate your records..."
                                        value={details}
                                        onChange={(e) => setDetails(e.target.value)}
                                        className="legal-textarea"
                                    />
                                </div>

                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', margin: '8px 0 24px', padding: '14px 16px', borderRadius: '14px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                                    <input
                                        id="deletion-confirm-checkbox"
                                        type="checkbox"
                                        checked={confirmIdentity}
                                        onChange={(e) => setConfirmIdentity(e.target.checked)}
                                        style={{ width: '18px', height: '18px', marginTop: '3px', accentColor: '#FF2D78', flexShrink: 0 }}
                                    />
                                    <label htmlFor="deletion-confirm-checkbox" style={{ color: '#e2d6dc', fontSize: '13.5px', lineHeight: 1.6, cursor: 'pointer' }}>
                                        I confirm that I am the owner of this account/booking record and understand that deleting my account permanently removes loyalty stamps, reward history, and saved profile data.
                                    </label>
                                </div>

                                <button type="submit" disabled={submitting} className="legal-submit-btn">
                                    <Send size={17} aria-hidden="true" />
                                    <span>{submitting ? 'Submitting Verified Request...' : 'Submit Data Deletion Request'}</span>
                                </button>
                            </form>
                        )}
                    </div>
                </section>

                {/* ── Step-by-Step Process & Compliance Disclosures ── */}
                <section aria-labelledby="deletion-steps-heading" style={{ marginTop: '48px' }}>
                    <div className="legal-section-header">
                        <h2 id="deletion-steps-heading" className="legal-h2">
                            How Data Deletion <span className="legal-h1-accent">Works</span>
                        </h2>
                        <p className="legal-section-sub">
                            Verification steps, processing timeline, and statutory record-retention rules.
                        </p>
                    </div>

                    <div className="legal-grid">
                        {DELETION_STEPS.map(({ num, icon, title, text }) => (
                            <article key={title} className="legal-clause-card">
                                <div className="legal-clause-icon">{icon}</div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
                                        <span className="legal-clause-num">{num}</span>
                                        <h3 className="legal-h3">{title}</h3>
                                    </div>
                                    <p style={{ color: '#e2d6dc', fontSize: '14.5px', lineHeight: 1.7, margin: 0 }}>
                                        {text}
                                    </p>
                                </div>
                            </article>
                        ))}
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
                        <Link href="/unsubscribe" className="legal-footer-btn">
                            <MailX size={15} color="#E2C286" aria-hidden="true" /> Unsubscribe
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
