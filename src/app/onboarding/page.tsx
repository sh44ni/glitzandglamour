'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect, FormEvent } from 'react';
import {
    Sparkles,
    Calendar,
    Phone,
    User,
    Gift,
    AlertCircle,
    CheckCircle2,
    ArrowLeft,
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

function stripEmojis(str: string): string {
    return str.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, '').replace(/\s+/g, ' ').trim();
}

const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.14)',
    borderRadius: '14px',
    padding: '13px 16px',
    color: '#fff',
    fontSize: '14px',
    fontFamily: 'Poppins, sans-serif',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
    fontFamily: 'Poppins, sans-serif',
    fontSize: '11.5px',
    fontWeight: 600,
    color: '#f4eef1',
    marginBottom: '6px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    letterSpacing: '0.6px',
    textTransform: 'uppercase',
};

export default function OnboardingPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const { data: session, status, update } = useSession();
    const user = session?.user as { name?: string; phone?: string; dateOfBirth?: string } | undefined;

    const [name, setName] = useState(user?.name || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [dob, setDob] = useState(user?.dateOfBirth ? user.dateOfBirth.split('T')[0] : '');
    const [marketingConsent, setMarketingConsent] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (user?.name && !name) setName(user.name);
        if (user?.phone && !phone) setPhone(user.phone);
        if (user?.dateOfBirth && !dob) setDob(user.dateOfBirth.split('T')[0]);
    }, [user, name, phone, dob]);

    useEffect(() => {
        if (status !== 'authenticated') return;
        fetch('/api/profile')
            .then(r => r.json())
            .then(d => {
                if (d.user?.name && !name) setName(d.user.name);
                if (d.user?.phone && !phone) setPhone(d.user.phone);
                if (d.user?.dateOfBirth && !dob) setDob(String(d.user.dateOfBirth).split('T')[0]);
            })
            .catch(() => {});
    }, [status]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');

        if (!phone.trim()) {
            setError(stripEmojis(t('onboarding.errorPhone')));
            return;
        }
        if (!dob) {
            setError(stripEmojis(t('onboarding.errorDob')));
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: name.trim() || undefined,
                    phone: phone.trim(),
                    dateOfBirth: dob,
                    marketingConsent,
                }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                setError(data.error || stripEmojis(t('onboarding.errorFailed')));
                setLoading(false);
                return;
            }
            if (status === 'authenticated') {
                await update();
            }
            setSaved(true);
            setLoading(false);
            router.push('/profile');
        } catch {
            setError(stripEmojis(t('onboarding.errorConnection')));
            setLoading(false);
        }
    };

    const handleCancel = async () => {
        if (status !== 'authenticated') {
            router.push('/');
            return;
        }
        if (!confirm(stripEmojis(t('onboarding.confirmCancel')))) return;
        setLoading(true);
        try {
            const res = await fetch('/api/profile', { method: 'DELETE' });
            if (res.ok) {
                await signOut({ callbackUrl: '/' });
            } else {
                setError(stripEmojis(t('onboarding.errorDeleteFailed')));
                setLoading(false);
            }
        } catch {
            setError(stripEmojis(t('onboarding.errorConnection')));
            setLoading(false);
        }
    };

    const headingText = stripEmojis(t('onboarding.welcome')) || 'Complete Your Glam Profile';
    const subtext1 = stripEmojis(t('onboarding.subtextLine1'));
    const subtext2 = stripEmojis(t('onboarding.subtextLine2'));

    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '32px 16px 80px',
                position: 'relative',
                zIndex: 1,
                boxSizing: 'border-box',
                overflowX: 'hidden',
            }}
        >
            <style>{`
                .onboarding-card {
                    position: relative;
                    overflow: hidden;
                    border-radius: 28px;
                    padding: clamp(28px, 5vw, 40px) clamp(20px, 4vw, 32px) 32px;
                    max-width: 440px;
                    width: 100%;
                    box-sizing: border-box;
                    background:
                        radial-gradient(circle at 18% 0%, rgba(255, 45, 120, 0.16), transparent 55%),
                        radial-gradient(circle at 82% 10%, rgba(226, 194, 134, 0.11), transparent 50%),
                        linear-gradient(155deg, rgba(32, 15, 26, 0.92), rgba(14, 7, 12, 0.96));
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    box-shadow: 0 32px 68px rgba(0, 0, 0, 0.6);
                    text-align: center;
                }
                .onboarding-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 8%;
                    right: 8%;
                    height: 1px;
                    background: linear-gradient(90deg, transparent, rgba(255, 138, 184, 0.65), rgba(226, 194, 134, 0.55), transparent);
                    pointer-events: none;
                }
                .onboarding-input::placeholder {
                    color: #c8b8c2;
                }
                .onboarding-input:focus {
                    border-color: rgba(255, 138, 184, 0.7) !important;
                    box-shadow: 0 0 0 3px rgba(255, 45, 120, 0.12);
                }
            `}</style>

            <div style={{ maxWidth: '440px', width: '100%', boxSizing: 'border-box' }}>
                <div className="onboarding-card">
                    {/* Icon badge */}
                    <div
                        style={{
                            width: '60px',
                            height: '60px',
                            background: 'linear-gradient(135deg, rgba(255,45,120,0.22), rgba(226,194,134,0.12))',
                            border: '1.5px solid rgba(255,138,184,0.45)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 18px',
                            boxShadow: '0 0 24px rgba(255,45,120,0.22)',
                        }}
                    >
                        <Sparkles color="#ff8ab8" size={26} aria-hidden="true" />
                    </div>

                    <div
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '4px 12px',
                            borderRadius: '999px',
                            background: 'rgba(255, 45, 120, 0.12)',
                            border: '1px solid rgba(255, 138, 184, 0.3)',
                            color: '#ff8ab8',
                            fontFamily: 'Poppins, sans-serif',
                            fontSize: '11px',
                            fontWeight: 600,
                            letterSpacing: '1.1px',
                            textTransform: 'uppercase',
                            marginBottom: '10px',
                        }}
                    >
                        <span>VIP Member Onboarding</span>
                    </div>

                    {/* Semantic H1 */}
                    <h1
                        style={{
                            fontFamily: 'Poppins, sans-serif',
                            fontWeight: 700,
                            fontSize: '24px',
                            color: '#fff',
                            marginBottom: '10px',
                            lineHeight: 1.3,
                        }}
                    >
                        {headingText}
                    </h1>

                    {/* Subtext */}
                    <p
                        style={{
                            fontFamily: 'Poppins, sans-serif',
                            fontSize: '13.5px',
                            color: '#e2d6dc',
                            lineHeight: 1.65,
                            marginBottom: '26px',
                            padding: '0 4px',
                        }}
                    >
                        {subtext1} {subtext2}
                    </p>

                    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px', textAlign: 'left' }}>
                        {/* Full Name */}
                        <div>
                            <label htmlFor="onboarding-name" style={labelStyle}>
                                <User size={13} color="#ff8ab8" aria-hidden="true" />
                                <span>Full Name</span>
                            </label>
                            <input
                                id="onboarding-name"
                                aria-label="Full Name"
                                className="onboarding-input"
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="Your full name"
                                style={inputStyle}
                            />
                        </div>

                        {/* Phone */}
                        <div>
                            <label htmlFor="onboarding-phone" style={labelStyle}>
                                <Phone size={13} color="#ff8ab8" aria-hidden="true" />
                                <span>{stripEmojis(t('onboarding.mobileField'))} <span style={{ color: '#ff8ab8' }}>*</span></span>
                            </label>
                            <input
                                id="onboarding-phone"
                                aria-label={stripEmojis(t('onboarding.mobileField'))}
                                className="onboarding-input"
                                type="tel"
                                required
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                                placeholder={t('onboarding.phonePlaceholder')}
                                style={inputStyle}
                            />
                        </div>

                        {/* Date of Birth */}
                        <div>
                            <label htmlFor="onboarding-dob" style={labelStyle}>
                                <Calendar size={13} color="#ff8ab8" aria-hidden="true" />
                                <span>{stripEmojis(t('onboarding.dobField'))} <span style={{ color: '#ff8ab8' }}>*</span></span>
                            </label>
                            <input
                                id="onboarding-dob"
                                aria-label={stripEmojis(t('onboarding.dobField'))}
                                className="onboarding-input"
                                type="date"
                                required
                                value={dob}
                                onChange={e => setDob(e.target.value)}
                                max={new Date().toISOString().split('T')[0]}
                                style={{
                                    ...inputStyle,
                                    colorScheme: 'dark',
                                    WebkitTextFillColor: dob ? '#fff' : '#dfd2d9',
                                }}
                            />
                            <p
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    fontFamily: 'Poppins, sans-serif',
                                    fontSize: '12px',
                                    color: '#dfd2d9',
                                    marginTop: '6px',
                                    marginBottom: 0,
                                    paddingLeft: '2px',
                                }}
                            >
                                <Gift size={13} color="#ff8ab8" style={{ flexShrink: 0 }} aria-hidden="true" />
                                <span>Used for annual birthday spin rewards and VIP perks.</span>
                            </p>
                        </div>

                        {/* Marketing / SMS Consent */}
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '10px',
                                padding: '12px 14px',
                                borderRadius: '14px',
                                background: 'rgba(255, 45, 120, 0.06)',
                                border: '1px solid rgba(255, 138, 184, 0.22)',
                            }}
                        >
                            <input
                                id="onboarding-consent"
                                type="checkbox"
                                checked={marketingConsent}
                                onChange={e => setMarketingConsent(e.target.checked)}
                                style={{
                                    marginTop: '3px',
                                    accentColor: '#FF2D78',
                                    width: '16px',
                                    height: '16px',
                                    flexShrink: 0,
                                    cursor: 'pointer',
                                }}
                            />
                            <label
                                htmlFor="onboarding-consent"
                                style={{
                                    fontFamily: 'Poppins, sans-serif',
                                    fontSize: '12.5px',
                                    color: '#e2d6dc',
                                    lineHeight: 1.5,
                                    cursor: 'pointer',
                                }}
                            >
                                Send me appointment reminders, loyalty stamp updates, and exclusive birthday rewards via SMS. Reply STOP anytime to opt out.
                            </label>
                        </div>

                        {/* Saved Status */}
                        {saved && (
                            <div
                                role="status"
                                style={{
                                    background: 'rgba(94,240,168,0.1)',
                                    border: '1px solid rgba(94,240,168,0.3)',
                                    color: '#5ef0a8',
                                    padding: '10px 14px',
                                    borderRadius: '12px',
                                    fontSize: '13px',
                                    fontFamily: 'Poppins, sans-serif',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                }}
                            >
                                <CheckCircle2 size={16} color="#5ef0a8" style={{ flexShrink: 0 }} aria-hidden="true" />
                                <span>Profile updated! Redirecting...</span>
                            </div>
                        )}

                        {/* Error */}
                        {error && (
                            <div
                                role="alert"
                                style={{
                                    background: 'rgba(255,45,120,0.12)',
                                    border: '1px solid rgba(255,138,184,0.35)',
                                    color: '#ffb3b3',
                                    padding: '10px 14px',
                                    borderRadius: '12px',
                                    fontSize: '13px',
                                    fontFamily: 'Poppins, sans-serif',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                }}
                            >
                                <AlertCircle size={16} color="#ff8ab8" style={{ flexShrink: 0 }} aria-hidden="true" />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                background: loading
                                    ? 'rgba(200, 20, 88, 0.55)'
                                    : 'linear-gradient(135deg, #c81458 0%, #9e0b43 100%)',
                                border: '1px solid rgba(255, 138, 184, 0.35)',
                                borderRadius: '50px',
                                padding: '15px',
                                color: '#fff',
                                fontSize: '14.5px',
                                fontWeight: 600,
                                fontFamily: 'Poppins, sans-serif',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                boxShadow: '0 6px 20px rgba(200, 20, 88, 0.35)',
                                marginTop: '4px',
                                letterSpacing: '0.3px',
                            }}
                        >
                            {loading ? stripEmojis(t('onboarding.saving')) : stripEmojis(t('onboarding.submit'))}
                        </button>

                        {/* Cancel */}
                        <button
                            type="button"
                            onClick={handleCancel}
                            disabled={loading}
                            style={{
                                width: '100%',
                                background: 'rgba(255,255,255,0.04)',
                                border: '1px solid rgba(255,255,255,0.16)',
                                borderRadius: '50px',
                                padding: '13px',
                                color: '#dfd2d9',
                                fontSize: '13px',
                                fontWeight: 500,
                                fontFamily: 'Poppins, sans-serif',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s',
                            }}
                        >
                            {stripEmojis(t('onboarding.cancel'))}
                        </button>
                    </form>
                </div>

                {/* Back to Home link */}
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <Link
                        href="/"
                        style={{
                            fontFamily: 'Poppins, sans-serif',
                            color: '#e2d6dc',
                            fontSize: '13px',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                        }}
                    >
                        <ArrowLeft size={14} color="#ff8ab8" aria-hidden="true" /> {t('common.backToHome')}
                    </Link>
                </div>
            </div>
        </div>
    );
}
