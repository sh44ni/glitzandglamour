'use client';

import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
    Eye,
    EyeOff,
    Mail,
    Lock,
    User,
    ArrowLeft,
    Cake,
    Sparkles,
    CheckCircle2,
    AlertCircle,
    Gift,
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

const GOOGLE_SVG = (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908C16.658 14.251 17.64 11.943 17.64 9.2z" fill="#4285F4" />
        <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" />
        <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
        <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
    </svg>
);

const APPLE_SVG = (
    <svg width="17" height="17" viewBox="0 0 814 1000" fill="currentColor" aria-hidden="true">
        <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-42.1-150.1-90.5c-64.9-71.7-105-175.2-105-273.3 0-184.1 120.8-281.5 240-281.5 60.6 0 110.8 39.5 148.4 39.5 36.2 0 93.1-42.1 161.5-42.1 26 0 108.2 2.6 168.1 90.3zm-312.4-180.3c30.7-36.2 52.1-87.5 52.1-138.7 0-7.1-.6-14.3-1.9-20.1-49.6 1.9-109.5 33.1-146.4 75.2-27.5 30.7-52.1 80.7-52.1 132.6 0 7.7.6 15.4 1.9 22.4 4.5.6 9.7 1.3 14.9 1.3 44.9 0 100.2-29.4 131.5-72.7z" />
    </svg>
);

function SignInContent() {
    const searchParams = useSearchParams();
    const { t } = useTranslation();
    const [tab, setTab] = useState<'signin' | 'signup'>('signin');
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [siEmail, setSiEmail] = useState('');
    const [siPassword, setSiPassword] = useState('');
    const [suName, setSuName] = useState('');
    const [suEmail, setSuEmail] = useState('');
    const [suPassword, setSuPassword] = useState('');
    const [suConfirm, setSuConfirm] = useState('');
    const [suDob, setSuDob] = useState('');

    // Referral code from QR scan
    const referralCode = searchParams.get('ref') || '';
    const callbackUrl = searchParams.get('callbackUrl') || '/profile';

    useEffect(() => {
        if (searchParams.get('verified') === 'true') {
            setSuccess('Email confirmed! You can now sign in.');
            setTab('signin');
        }

        // Map NextAuth OAuth error codes to human-readable messages
        const oauthError = searchParams.get('error');
        if (oauthError) {
            // If this error originated from a mobile WebView OAuth flow, relay it
            // back to the native app via deep-link so the app can show an alert.
            const originatingCallbackUrl = searchParams.get('callbackUrl') || '';
            if (originatingCallbackUrl.includes('/app/auth/callback') || originatingCallbackUrl.startsWith('glitzmember://')) {
                const deepLinkBase = process.env.NEXT_PUBLIC_MOBILE_DEEP_LINK_BASE || 'glitzmember://auth/callback';
                try {
                    const deepLink = new URL(deepLinkBase);
                    deepLink.searchParams.set('error', oauthError);
                    window.location.href = deepLink.toString();
                } catch {
                    // If the URL construction fails, fall through to showing the error message
                }
                return;
            }

            switch (oauthError) {
                case 'invalid-token':
                    setError('Invalid or expired confirmation link.');
                    break;
                case 'AccessDenied':
                    setError('Sign-in was cancelled. Please try again.');
                    break;
                case 'OAuthSignin':
                case 'OAuthCallback':
                    setError('Apple sign-in failed. Please try again or use email.');
                    break;
                case 'OAuthAccountNotLinked':
                    setError('This email is already linked to a different sign-in method. Please sign in with your original method.');
                    break;
                case 'Verification':
                    setError('The sign-in link has expired. Please request a new one.');
                    break;
                default:
                    setError('Something went wrong during sign-in. Please try again.');
            }
        }

        // If arrived via referral QR, auto-switch to signup tab
        if (searchParams.get('ref')) setTab('signup');
        // Pre-select signup tab if linked from blog comment prompt
        if (searchParams.get('tab') === 'signup') setTab('signup');
    }, [searchParams]);

    async function handleSignIn(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError('');
        const result = await signIn('email-password', { email: siEmail, password: siPassword, redirect: false });
        setLoading(false);
        if (result?.error) setError('Incorrect email or password.');
        else window.location.href = callbackUrl;
    }

    async function handleSignUp(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        if (!suDob) { setError('Please enter your date of birth.'); return; }
        const dobDate = new Date(suDob);
        const ageDiff = Date.now() - dobDate.getTime();
        const age = new Date(ageDiff).getUTCFullYear() - 1970;
        if (age < 13) { setError('You must be at least 13 years old to create an account.'); return; }
        if (suPassword !== suConfirm) { setError('Passwords do not match.'); return; }
        if (suPassword.length < 8) { setError('Password must be at least 8 characters.'); return; }
        setLoading(true);
        try {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: suName,
                    email: suEmail,
                    password: suPassword,
                    dateOfBirth: suDob,
                    referralCode: referralCode || undefined,
                }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error || 'Something went wrong.'); return; }
            const result = await signIn('email-password', { email: suEmail, password: suPassword, redirect: false });
            if (result?.error) {
                setSuccess('Account created! Please sign in.');
                setTab('signin');
                setSiEmail(suEmail);
            } else {
                window.location.href = callbackUrl;
            }
        } catch {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    const inp: React.CSSProperties = {
        width: '100%',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.14)',
        borderRadius: '14px',
        padding: '13px 14px 13px 42px',
        fontFamily: 'Poppins, sans-serif',
        fontSize: '14px',
        color: '#fff',
        outline: 'none',
        transition: 'border-color 0.2s',
        boxSizing: 'border-box',
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '28px 16px', position: 'relative', zIndex: 1, boxSizing: 'border-box' }}>
            <style>{`
                .si-card {
                    position: relative;
                    overflow: hidden;
                    padding: 30px 24px;
                    border-radius: 26px;
                    background:
                        radial-gradient(circle at 18% 0%, rgba(255, 45, 120, 0.16), transparent 55%),
                        radial-gradient(circle at 82% 10%, rgba(226, 194, 134, 0.11), transparent 50%),
                        linear-gradient(155deg, rgba(32, 15, 26, 0.92), rgba(14, 7, 12, 0.96));
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    box-shadow: 0 28px 68px rgba(0, 0, 0, 0.58);
                }
                .si-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 8%;
                    right: 8%;
                    height: 1px;
                    background: linear-gradient(90deg, transparent, rgba(255, 138, 184, 0.65), rgba(226, 194, 134, 0.55), transparent);
                    pointer-events: none;
                }
                .si-tab {
                    flex: 1;
                    padding: 11px 8px;
                    font-family: 'Poppins', sans-serif;
                    font-size: 14px;
                    font-weight: 600;
                    background: none;
                    border: none;
                    cursor: pointer;
                    transition: all 0.25s;
                    position: relative;
                }
                .si-tab::after {
                    content: '';
                    position: absolute;
                    bottom: 0;
                    left: 10%;
                    right: 10%;
                    height: 2px;
                    border-radius: 2px;
                    transform: scaleX(0);
                    transition: transform 0.25s ease;
                }
                .si-tab.active {
                    color: #ff8ab8;
                }
                .si-tab.active::after {
                    background: linear-gradient(90deg, #ff8ab8, #E2C286);
                    transform: scaleX(1);
                }
                .si-tab.inactive {
                    color: #dfd2d9;
                }
                .si-input::placeholder {
                    color: #c8b8c2;
                }
                .si-input:focus {
                    border-color: rgba(255, 138, 184, 0.7) !important;
                    box-shadow: 0 0 0 3px rgba(255, 45, 120, 0.12);
                }
                .si-submit-btn {
                    width: 100%;
                    background: linear-gradient(135deg, #c81458 0%, #9e0b43 100%);
                    color: #fff;
                    border: 1px solid rgba(255, 138, 184, 0.35);
                    border-radius: 50px;
                    padding: 14px;
                    font-family: 'Poppins', sans-serif;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    box-shadow: 0 6px 20px rgba(200, 20, 88, 0.35);
                }
                .si-submit-btn:hover:not(:disabled) {
                    transform: translateY(-1px);
                    box-shadow: 0 10px 26px rgba(200, 20, 88, 0.45);
                }
                .si-submit-btn:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }
                .social-btn {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    padding: 13px;
                    border-radius: 14px;
                    font-family: 'Poppins', sans-serif;
                    font-weight: 600;
                    font-size: 14px;
                    cursor: pointer;
                    transition: all 0.2s;
                    border: 1.5px solid;
                    touch-action: manipulation;
                    -webkit-tap-highlight-color: transparent;
                }
                .social-btn:active {
                    transform: scale(0.97);
                }
                .social-btn-google {
                    background: #fff;
                    color: #111;
                    border-color: #fff;
                }
                .social-btn-google:hover {
                    background: #f0f0f0;
                }
                .social-btn-apple {
                    background: #0d060b;
                    color: #fff;
                    border-color: rgba(255, 255, 255, 0.2);
                }
                .social-btn-apple:hover {
                    background: #1a0c16;
                }
                @keyframes siSlide {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .si-form {
                    animation: siSlide 0.22s ease both;
                }
                .si-date-input.is-empty::-webkit-datetime-edit {
                    color: transparent;
                }
                .si-date-input.is-empty:focus::-webkit-datetime-edit {
                    color: #fff;
                }
                .si-date-wrapper:focus-within .si-date-placeholder {
                    opacity: 0;
                }
                .si-date-placeholder {
                    transition: opacity 0.2s;
                }
                .si-sr-only {
                    position: absolute;
                    width: 1px;
                    height: 1px;
                    padding: 0;
                    margin: -1px;
                    overflow: hidden;
                    clip: rect(0, 0, 0, 0);
                    white-space: nowrap;
                    border: 0;
                }
            `}</style>

            <div style={{ maxWidth: '420px', width: '100%' }}>

                {/* Header & Semantic H1 */}
                <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '5px 13px',
                        borderRadius: '999px',
                        background: 'rgba(255, 45, 120, 0.12)',
                        border: '1px solid rgba(255, 138, 184, 0.3)',
                        color: '#ff8ab8',
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '11px',
                        fontWeight: 600,
                        letterSpacing: '1.2px',
                        textTransform: 'uppercase',
                        marginBottom: '12px',
                    }}>
                        <Sparkles size={13} color="#ff8ab8" aria-hidden="true" />
                        <span>Glitz &amp; Glamour Studio</span>
                    </div>
                    <h1 style={{
                        fontFamily: 'Poppins, sans-serif',
                        fontWeight: 800,
                        fontSize: '26px',
                        color: '#fff',
                        marginBottom: '6px',
                        lineHeight: 1.25,
                    }}>
                        {tab === 'signin' ? 'Sign In to Your Account' : 'Create Your Glam Account'}
                    </h1>
                    <p style={{ fontFamily: 'Poppins, sans-serif', color: '#e2d6dc', fontSize: '13.5px', lineHeight: 1.5, margin: 0 }}>
                        {t('auth.signInSubtext')}
                    </p>
                </div>

                {/* Card */}
                <div className="si-card">

                    {/* Tabs */}
                    <div role="tablist" aria-label="Authentication mode" style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '24px' }}>
                        <button
                            type="button"
                            role="tab"
                            aria-selected={tab === 'signin'}
                            className={`si-tab ${tab === 'signin' ? 'active' : 'inactive'}`}
                            onClick={() => { setTab('signin'); setError(''); setSuccess(''); }}
                        >
                            Sign In
                        </button>
                        <button
                            type="button"
                            role="tab"
                            aria-selected={tab === 'signup'}
                            className={`si-tab ${tab === 'signup' ? 'active' : 'inactive'}`}
                            onClick={() => { setTab('signup'); setError(''); setSuccess(''); }}
                        >
                            {t('auth.createAccount')}
                        </button>
                    </div>

                    {/* Alerts */}
                    {success && (
                        <div role="status" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(94,240,168,0.1)', border: '1px solid rgba(94,240,168,0.3)', borderRadius: '12px', padding: '10px 14px', marginBottom: '16px', fontFamily: 'Poppins, sans-serif', fontSize: '13px', color: '#5ef0a8' }}>
                            <CheckCircle2 size={16} color="#5ef0a8" style={{ flexShrink: 0 }} aria-hidden="true" />
                            <span>{success}</span>
                        </div>
                    )}
                    {error && (
                        <div role="alert" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,45,120,0.12)', border: '1px solid rgba(255,138,184,0.35)', borderRadius: '12px', padding: '10px 14px', marginBottom: '16px', fontFamily: 'Poppins, sans-serif', fontSize: '13px', color: '#ffb3b3' }}>
                            <AlertCircle size={16} color="#ff8ab8" style={{ flexShrink: 0 }} aria-hidden="true" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Referral banner — shown when arriving via Insider QR */}
                    {tab === 'signup' && referralCode && (
                        <div style={{ background: 'linear-gradient(135deg, rgba(226,194,134,0.14), rgba(255,45,120,0.08))', border: '1px solid rgba(226,194,134,0.38)', borderRadius: '12px', padding: '10px 14px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Sparkles size={18} color="#E2C286" style={{ flexShrink: 0 }} aria-hidden="true" />
                            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', color: '#E2C286', lineHeight: 1.45, margin: 0 }}>
                                You were invited by a <strong>Glam Insider</strong>! Create your account to start earning rewards.
                            </p>
                        </div>
                    )}

                    {/* ── SIGN IN ── */}
                    {tab === 'signin' && (
                        <form key="signin" className="si-form" onSubmit={handleSignIn} style={{ display: 'grid', gap: '12px' }}>
                            {/* Email */}
                            <div style={{ position: 'relative' }}>
                                <label htmlFor="si-email" className="si-sr-only">Email address</label>
                                <Mail size={15} color="#dfd2d9" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} aria-hidden="true" />
                                <input
                                    id="si-email"
                                    aria-label="Email address"
                                    className="si-input"
                                    type="email"
                                    required
                                    placeholder="Email address"
                                    value={siEmail}
                                    onChange={e => setSiEmail(e.target.value)}
                                    style={inp}
                                />
                            </div>
                            {/* Password */}
                            <div style={{ position: 'relative' }}>
                                <label htmlFor="si-password" className="si-sr-only">Password</label>
                                <Lock size={15} color="#dfd2d9" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} aria-hidden="true" />
                                <input
                                    id="si-password"
                                    aria-label="Password"
                                    className="si-input"
                                    type={showPass ? 'text' : 'password'}
                                    required
                                    placeholder="Password"
                                    value={siPassword}
                                    onChange={e => setSiPassword(e.target.value)}
                                    style={{ ...inp, paddingRight: '44px' }}
                                />
                                <button
                                    type="button"
                                    aria-label={showPass ? 'Hide password' : 'Show password'}
                                    onClick={() => setShowPass(p => !p)}
                                    style={{ position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                >
                                    {showPass ? <EyeOff size={15} color="#dfd2d9" /> : <Eye size={15} color="#dfd2d9" />}
                                </button>
                            </div>
                            {/* Submit */}
                            <button type="submit" className="si-submit-btn" disabled={loading} style={{ marginTop: '2px' }}>
                                {loading ? 'Signing in...' : 'Sign In'}
                            </button>

                            {/* Divider */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '4px 0' }}>
                                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
                                <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#dfd2d9' }}>or continue with</span>
                                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
                            </div>

                            {/* Social buttons */}
                            <button type="button" className="social-btn social-btn-google" onClick={() => signIn('google', { callbackUrl: '/profile' })}>
                                {GOOGLE_SVG} Continue with Google
                            </button>
                            <button type="button" className="social-btn social-btn-apple" onClick={() => signIn('apple', { callbackUrl: '/profile' })}>
                                {APPLE_SVG} Continue with Apple
                            </button>

                            <p style={{ textAlign: 'center', fontFamily: 'Poppins, sans-serif', fontSize: '12.5px', color: '#e2d6dc', marginTop: '4px' }}>
                                No account?{' '}
                                <button
                                    type="button"
                                    onClick={() => { setTab('signup'); setError(''); }}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ff8ab8', fontWeight: 600, fontFamily: 'Poppins, sans-serif', fontSize: '12.5px', textDecoration: 'underline' }}
                                >
                                    Create one free
                                </button>
                            </p>
                        </form>
                    )}

                    {/* ── SIGN UP ── */}
                    {tab === 'signup' && (
                        <form key="signup" className="si-form" onSubmit={handleSignUp} style={{ display: 'grid', gap: '12px' }}>
                            {/* Name */}
                            <div style={{ position: 'relative' }}>
                                <label htmlFor="su-name" className="si-sr-only">Full name</label>
                                <User size={15} color="#dfd2d9" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} aria-hidden="true" />
                                <input
                                    id="su-name"
                                    aria-label="Full name"
                                    className="si-input"
                                    type="text"
                                    required
                                    placeholder="Full name"
                                    value={suName}
                                    onChange={e => setSuName(e.target.value)}
                                    style={inp}
                                />
                            </div>
                            {/* Date of Birth */}
                            <div className="si-date-wrapper" style={{ position: 'relative' }}>
                                <label htmlFor="su-dob" className="si-sr-only">Date of birth</label>
                                <Cake size={15} color="#dfd2d9" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} aria-hidden="true" />
                                <input
                                    id="su-dob"
                                    aria-label="Date of birth"
                                    className={`si-input si-date-input ${!suDob ? 'is-empty' : ''}`}
                                    type="date"
                                    required
                                    placeholder="Date of birth"
                                    value={suDob}
                                    onChange={e => setSuDob(e.target.value)}
                                    max={new Date(Date.now() - 13 * 365.25 * 24 * 3600 * 1000).toISOString().split('T')[0]}
                                    style={{ ...inp, colorScheme: 'dark' }}
                                />
                                {!suDob && (
                                    <span className="si-date-placeholder" style={{ position: 'absolute', left: '42px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', fontFamily: 'Poppins, sans-serif', fontSize: '14px', color: '#c8b8c2' }}>
                                        Date of birth *
                                    </span>
                                )}
                            </div>
                            <p style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontFamily: 'Poppins, sans-serif', fontSize: '11.5px', color: '#ff8ab8', marginTop: '-4px', marginLeft: '2px', lineHeight: 1.4 }}>
                                <Gift size={14} color="#ff8ab8" style={{ flexShrink: 0, marginTop: '1px' }} aria-hidden="true" />
                                <span>We use your birthdate to assign a <strong>free spin the wheel</strong> reward for you on your birthday!</span>
                            </p>
                            {/* Email */}
                            <div style={{ position: 'relative' }}>
                                <label htmlFor="su-email" className="si-sr-only">Email address</label>
                                <Mail size={15} color="#dfd2d9" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} aria-hidden="true" />
                                <input
                                    id="su-email"
                                    aria-label="Email address"
                                    className="si-input"
                                    type="email"
                                    required
                                    placeholder="Email address"
                                    value={suEmail}
                                    onChange={e => setSuEmail(e.target.value)}
                                    style={inp}
                                />
                            </div>
                            {/* Password */}
                            <div style={{ position: 'relative' }}>
                                <label htmlFor="su-password" className="si-sr-only">Password (minimum 8 characters)</label>
                                <Lock size={15} color="#dfd2d9" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} aria-hidden="true" />
                                <input
                                    id="su-password"
                                    aria-label="Password (minimum 8 characters)"
                                    className="si-input"
                                    type={showPass ? 'text' : 'password'}
                                    required
                                    placeholder="Password (min 8 chars)"
                                    value={suPassword}
                                    onChange={e => setSuPassword(e.target.value)}
                                    style={{ ...inp, paddingRight: '44px' }}
                                />
                                <button
                                    type="button"
                                    aria-label={showPass ? 'Hide password' : 'Show password'}
                                    onClick={() => setShowPass(p => !p)}
                                    style={{ position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                >
                                    {showPass ? <EyeOff size={15} color="#dfd2d9" /> : <Eye size={15} color="#dfd2d9" />}
                                </button>
                            </div>
                            {/* Confirm */}
                            <div style={{ position: 'relative' }}>
                                <label htmlFor="su-confirm" className="si-sr-only">Confirm password</label>
                                <Lock size={15} color="#dfd2d9" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} aria-hidden="true" />
                                <input
                                    id="su-confirm"
                                    aria-label="Confirm password"
                                    className="si-input"
                                    type={showConfirm ? 'text' : 'password'}
                                    required
                                    placeholder="Confirm password"
                                    value={suConfirm}
                                    onChange={e => setSuConfirm(e.target.value)}
                                    style={{ ...inp, paddingRight: '44px' }}
                                />
                                <button
                                    type="button"
                                    aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                                    onClick={() => setShowConfirm(p => !p)}
                                    style={{ position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                >
                                    {showConfirm ? <EyeOff size={15} color="#dfd2d9" /> : <Eye size={15} color="#dfd2d9" />}
                                </button>
                            </div>

                            {/* Submit */}
                            <button type="submit" className="si-submit-btn" disabled={loading} style={{ marginTop: '2px' }}>
                                {loading ? 'Creating account...' : 'Create Account'}
                            </button>

                            {/* Divider */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '4px 0' }}>
                                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
                                <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#dfd2d9' }}>or sign up with</span>
                                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
                            </div>

                            {/* Social buttons */}
                            <button type="button" className="social-btn social-btn-google" onClick={() => signIn('google', { callbackUrl: '/profile' })}>
                                {GOOGLE_SVG} Sign up with Google
                            </button>
                            <button type="button" className="social-btn social-btn-apple" onClick={() => signIn('apple', { callbackUrl: '/profile' })}>
                                {APPLE_SVG} Sign up with Apple
                            </button>

                            <p style={{ textAlign: 'center', fontFamily: 'Poppins, sans-serif', fontSize: '12.5px', color: '#e2d6dc', marginTop: '4px' }}>
                                Already have an account?{' '}
                                <button
                                    type="button"
                                    onClick={() => { setTab('signin'); setError(''); }}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ff8ab8', fontWeight: 600, fontFamily: 'Poppins, sans-serif', fontSize: '12.5px', textDecoration: 'underline' }}
                                >
                                    Sign in
                                </button>
                            </p>
                        </form>
                    )}
                </div>

                {/* Back */}
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <Link href="/" style={{ fontFamily: 'Poppins, sans-serif', color: '#e2d6dc', fontSize: '13px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <ArrowLeft size={14} color="#ff8ab8" aria-hidden="true" /> {t('common.backToHome')}
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function SignInPage() {
    return (
        <Suspense>
            <SignInContent />
        </Suspense>
    );
}
