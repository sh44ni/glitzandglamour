'use client';

import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft, Cake } from 'lucide-react';

const GOOGLE_SVG = (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908C16.658 14.251 17.64 11.943 17.64 9.2z" fill="#4285F4" />
        <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" />
        <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
        <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
    </svg>
);

const APPLE_SVG = (
    <svg width="17" height="17" viewBox="0 0 814 1000" fill="currentColor">
        <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-42.1-150.1-90.5c-64.9-71.7-105-175.2-105-273.3 0-184.1 120.8-281.5 240-281.5 60.6 0 110.8 39.5 148.4 39.5 36.2 0 93.1-42.1 161.5-42.1 26 0 108.2 2.6 168.1 90.3zm-312.4-180.3c30.7-36.2 52.1-87.5 52.1-138.7 0-7.1-.6-14.3-1.9-20.1-49.6 1.9-109.5 33.1-146.4 75.2-27.5 30.7-52.1 80.7-52.1 132.6 0 7.7.6 15.4 1.9 22.4 4.5.6 9.7 1.3 14.9 1.3 44.9 0 100.2-29.4 131.5-72.7z" />
    </svg>
);

function SignInContent() {
    const searchParams = useSearchParams();
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
        if (searchParams.get('verified') === 'true') { setSuccess('Email confirmed! You can now sign in.'); setTab('signin'); }
        if (searchParams.get('error') === 'invalid-token') setError('Invalid or expired confirmation link.');
        // If arrived via referral QR, auto-switch to signup tab
        if (searchParams.get('ref')) setTab('signup');
        // Pre-select signup tab if linked from blog comment prompt
        if (searchParams.get('tab') === 'signup') setTab('signup');
    }, [searchParams]);

    async function handleSignIn(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true); setError('');
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
                body: JSON.stringify({ name: suName, email: suEmail, password: suPassword, dateOfBirth: suDob, referralCode: referralCode || undefined }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error || 'Something went wrong.'); return; }
            const result = await signIn('email-password', { email: suEmail, password: suPassword, redirect: false });
            if (result?.error) { setSuccess('Account created! Please sign in.'); setTab('signin'); setSiEmail(suEmail); }
            else window.location.href = callbackUrl;
        } catch { setError('Something went wrong. Please try again.'); }
        finally { setLoading(false); }
    }

    const inp: React.CSSProperties = {
        width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '14px', padding: '13px 14px 13px 42px',
        fontFamily: 'Poppins, sans-serif', fontSize: '14px', color: '#fff', outline: 'none',
        transition: 'border-color 0.2s',
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 16px', position: 'relative', zIndex: 1 }}>
            <style>{`
                .si-tab { flex:1; padding:11px 8px; font-family:Poppins,sans-serif; font-size:14px; font-weight:600; background:none; border:none; cursor:pointer; transition:all 0.25s; position:relative; }
                .si-tab::after { content:''; position:absolute; bottom:0; left:10%; right:10%; height:2px; border-radius:2px; transform:scaleX(0); transition:transform 0.25s ease; }
                .si-tab.active { color:#FF2D78; }
                .si-tab.active::after { background:#FF2D78; transform:scaleX(1); }
                .si-tab.inactive { color:#888; }
                .si-input:focus { border-color:rgba(255,45,120,0.6) !important; box-shadow:0 0 0 3px rgba(255,45,120,0.08); }
                .social-btn { width:100%; display:flex; align-items:center; justify-content:center; gap:10px; padding:13px; border-radius:14px; font-family:Poppins,sans-serif; font-weight:600; font-size:14px; cursor:pointer; transition:all 0.2s; border:1.5px solid; touch-action:manipulation; -webkit-tap-highlight-color:transparent; }
                .social-btn:active { transform:scale(0.97); }
                .social-btn-google { background:#fff; color:#111; border-color:#fff; }
                .social-btn-google:hover { background:#f0f0f0; }
                .social-btn-apple { background:#000; color:#fff; border-color:rgba(255,255,255,0.15); }
                .social-btn-apple:hover { background:#111; }
                @keyframes siSlide { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
                .si-form { animation: siSlide 0.22s ease both; }
                
                .si-date-input.is-empty::-webkit-datetime-edit { color: transparent; }
                .si-date-input.is-empty:focus::-webkit-datetime-edit { color: #fff; }
                .si-date-wrapper:focus-within .si-date-placeholder { opacity: 0; }
                .si-date-placeholder { transition: opacity 0.2s; }
            `}</style>

            <div style={{ maxWidth: '400px', width: '100%' }}>

                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 900, fontSize: '26px', background: 'linear-gradient(135deg, #FF2D78, #FF6BA8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: '4px' }}>
                        Glitz &amp; Glamour
                    </div>
                    <p style={{ fontFamily: 'Poppins, sans-serif', color: '#888', fontSize: '13px' }}>
                        Sign in to access your loyalty card
                    </p>
                </div>

                {/* Card */}
                <div className="glass" style={{ padding: '28px 24px', borderRadius: '24px' }}>

                    {/* Tabs */}
                    <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.07)', marginBottom: '24px' }}>
                        <button className={`si-tab ${tab === 'signin' ? 'active' : 'inactive'}`} onClick={() => { setTab('signin'); setError(''); setSuccess(''); }}>Sign In</button>
                        <button className={`si-tab ${tab === 'signup' ? 'active' : 'inactive'}`} onClick={() => { setTab('signup'); setError(''); setSuccess(''); }}>Create Account</button>
                    </div>

                    {/* Alerts */}
                    {success && <div style={{ background: 'rgba(0,212,120,0.08)', border: '1px solid rgba(0,212,120,0.25)', borderRadius: '10px', padding: '10px 14px', marginBottom: '16px', fontFamily: 'Poppins, sans-serif', fontSize: '13px', color: '#00D478' }}>✅ {success}</div>}
                    {error && <div style={{ background: 'rgba(255,45,120,0.08)', border: '1px solid rgba(255,45,120,0.25)', borderRadius: '10px', padding: '10px 14px', marginBottom: '16px', fontFamily: 'Poppins, sans-serif', fontSize: '13px', color: '#FF6B6B' }}>{error}</div>}

                    {/* Referral banner — shown when arriving via Insider QR */}
                    {tab === 'signup' && referralCode && (
                        <div style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.12), rgba(255,215,0,0.06))', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '10px', padding: '10px 14px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '18px' }}>⭐</span>
                            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', color: '#D4AF37', lineHeight: 1.4 }}>
                                You were invited by a <strong>Glam Insider</strong>! Create your account to start earning rewards 💅
                            </p>
                        </div>
                    )}

                    {/* ── SIGN IN ── */}
                    {tab === 'signin' && (
                        <form key="signin" className="si-form" onSubmit={handleSignIn} style={{ display: 'grid', gap: '12px' }}>
                            {/* Email */}
                            <div style={{ position: 'relative' }}>
                                <Mail size={15} color="#777" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                                <input className="si-input" type="email" required placeholder="Email address" value={siEmail} onChange={e => setSiEmail(e.target.value)} style={inp} />
                            </div>
                            {/* Password */}
                            <div style={{ position: 'relative' }}>
                                <Lock size={15} color="#777" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                                <input className="si-input" type={showPass ? 'text' : 'password'} required placeholder="Password" value={siPassword} onChange={e => setSiPassword(e.target.value)} style={{ ...inp, paddingRight: '44px' }} />
                                <button type="button" onClick={() => setShowPass(p => !p)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                                    {showPass ? <EyeOff size={15} color="#888" /> : <Eye size={15} color="#888" />}
                                </button>
                            </div>
                            {/* Submit */}
                            <button type="submit" className="btn-primary btn-pulse" disabled={loading} style={{ width: '100%', fontSize: '14px', padding: '14px', marginTop: '2px', opacity: loading ? 0.7 : 1 }}>
                                {loading ? 'Signing in…' : 'Sign In'}
                            </button>

                            {/* Divider */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '4px 0' }}>
                                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.07)' }} />
                                <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#777' }}>or continue with</span>
                                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.07)' }} />
                            </div>

                            {/* Social buttons */}
                            <button type="button" className="social-btn social-btn-google" onClick={() => signIn('google', { callbackUrl })}>
                                {GOOGLE_SVG} Continue with Google
                            </button>
                            <button type="button" className="social-btn social-btn-apple" onClick={() => signIn('apple', { callbackUrl })}>
                                {APPLE_SVG} Continue with Apple
                            </button>

                            <p style={{ textAlign: 'center', fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#777', marginTop: '4px' }}>
                                No account?{' '}
                                <button type="button" onClick={() => { setTab('signup'); setError(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#FF2D78', fontWeight: 600, fontFamily: 'Poppins, sans-serif', fontSize: '12px' }}>
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
                                <User size={15} color="#777" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                                <input className="si-input" type="text" required placeholder="Full name" value={suName} onChange={e => setSuName(e.target.value)} style={inp} />
                            </div>
                            {/* Date of Birth */}
                            <div className="si-date-wrapper" style={{ position: 'relative' }}>
                                <Cake size={15} color="#777" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                                <input
                                    className={`si-input si-date-input ${!suDob ? 'is-empty' : ''}`}
                                    type="date"
                                    required
                                    placeholder="Date of birth"
                                    value={suDob}
                                    onChange={e => setSuDob(e.target.value)}
                                    max={new Date(Date.now() - 13 * 365.25 * 24 * 3600 * 1000).toISOString().split('T')[0]}
                                    style={{ ...inp, colorScheme: 'dark' }}
                                />
                                {!suDob && <span className="si-date-placeholder" style={{ position: 'absolute', left: '42px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', fontFamily: 'Poppins, sans-serif', fontSize: '14px', color: '#555' }}>Date of birth *</span>}
                            </div>
                            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: '#FF2D78', opacity: 0.9, marginTop: '-6px', marginLeft: '4px', lineHeight: 1.3 }}>
                                🎂 We need your birthdate to assign a <b>free spin the wheel</b> reward for you on your birthday!
                            </p>
                            {/* Email */}
                            <div style={{ position: 'relative' }}>
                                <Mail size={15} color="#777" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                                <input className="si-input" type="email" required placeholder="Email address" value={suEmail} onChange={e => setSuEmail(e.target.value)} style={inp} />
                            </div>
                            {/* Password */}
                            <div style={{ position: 'relative' }}>
                                <Lock size={15} color="#777" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                                <input className="si-input" type={showPass ? 'text' : 'password'} required placeholder="Password (min 8 chars)" value={suPassword} onChange={e => setSuPassword(e.target.value)} style={{ ...inp, paddingRight: '44px' }} />
                                <button type="button" onClick={() => setShowPass(p => !p)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                                    {showPass ? <EyeOff size={15} color="#888" /> : <Eye size={15} color="#888" />}
                                </button>
                            </div>
                            {/* Confirm */}
                            <div style={{ position: 'relative' }}>
                                <Lock size={15} color="#777" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                                <input className="si-input" type={showConfirm ? 'text' : 'password'} required placeholder="Confirm password" value={suConfirm} onChange={e => setSuConfirm(e.target.value)} style={{ ...inp, paddingRight: '44px' }} />
                                <button type="button" onClick={() => setShowConfirm(p => !p)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                                    {showConfirm ? <EyeOff size={15} color="#888" /> : <Eye size={15} color="#888" />}
                                </button>
                            </div>

                            {/* Submit */}
                            <button type="submit" className="btn-primary btn-pulse" disabled={loading} style={{ width: '100%', fontSize: '14px', padding: '14px', marginTop: '2px', opacity: loading ? 0.7 : 1 }}>
                                {loading ? 'Creating account…' : 'Create Account'}
                            </button>

                            {/* Divider */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '4px 0' }}>
                                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.07)' }} />
                                <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#777' }}>or sign up with</span>
                                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.07)' }} />
                            </div>

                            {/* Social buttons */}
                            <button type="button" className="social-btn social-btn-google" onClick={() => signIn('google', { callbackUrl })}>
                                {GOOGLE_SVG} Sign up with Google
                            </button>
                            <button type="button" className="social-btn social-btn-apple" onClick={() => signIn('apple', { callbackUrl })}>
                                {APPLE_SVG} Sign up with Apple
                            </button>

                            <p style={{ textAlign: 'center', fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#777', marginTop: '4px' }}>
                                Already have an account?{' '}
                                <button type="button" onClick={() => { setTab('signin'); setError(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#FF2D78', fontWeight: 600, fontFamily: 'Poppins, sans-serif', fontSize: '12px' }}>
                                    Sign in
                                </button>
                            </p>
                        </form>
                    )}
                </div>

                {/* Back */}
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <Link href="/" style={{ fontFamily: 'Poppins, sans-serif', color: '#777', fontSize: '13px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                        <ArrowLeft size={13} /> Back to Home
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
