'use client';

import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, Eye, EyeOff, Mail, Lock, User } from 'lucide-react';

type Tab = 'google' | 'signin' | 'signup';

function SignInContent() {
    const searchParams = useSearchParams();
    const [tab, setTab] = useState<Tab>('google');
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Sign-in form
    const [siEmail, setSiEmail] = useState('');
    const [siPassword, setSiPassword] = useState('');

    // Sign-up form
    const [suName, setSuName] = useState('');
    const [suEmail, setSuEmail] = useState('');
    const [suPassword, setSuPassword] = useState('');
    const [suConfirm, setSuConfirm] = useState('');

    useEffect(() => {
        if (searchParams.get('verified') === 'true') {
            setSuccess('Email confirmed! You can now sign in.');
            setTab('signin');
        }
        if (searchParams.get('error') === 'invalid-token') {
            setError('Invalid or expired confirmation link.');
        }
    }, [searchParams]);

    async function handleSignIn(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError('');
        const result = await signIn('email-password', {
            email: siEmail,
            password: siPassword,
            redirect: false,
        });
        setLoading(false);
        if (result?.error) {
            setError('Incorrect email or password.');
        } else {
            window.location.href = '/card';
        }
    }

    async function handleSignUp(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        if (suPassword !== suConfirm) {
            setError('Passwords do not match.');
            return;
        }
        if (suPassword.length < 8) {
            setError('Password must be at least 8 characters.');
            return;
        }
        setLoading(true);
        try {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: suName, email: suEmail, password: suPassword }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'Something went wrong.');
                return;
            }
            // Auto sign-in after signup
            const result = await signIn('email-password', {
                email: suEmail,
                password: suPassword,
                redirect: false,
            });
            if (result?.error) {
                setSuccess('Account created! Please sign in.');
                setTab('signin');
                setSiEmail(suEmail);
            } else {
                window.location.href = '/card';
            }
        } catch {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    const inputStyle: React.CSSProperties = {
        width: '100%',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '12px',
        padding: '12px 14px 12px 40px',
        fontFamily: 'Poppins, sans-serif',
        fontSize: '14px',
        color: '#fff',
        outline: 'none',
        transition: 'border-color 0.2s',
    };

    const tabStyle = (active: boolean): React.CSSProperties => ({
        flex: 1,
        padding: '10px 6px',
        fontFamily: 'Poppins, sans-serif',
        fontSize: '13px',
        fontWeight: active ? 600 : 400,
        color: active ? '#FF2D78' : '#888',
        background: 'none',
        border: 'none',
        borderBottom: `2px solid ${active ? '#FF2D78' : 'transparent'}`,
        cursor: 'pointer',
        transition: 'all 0.2s',
        whiteSpace: 'nowrap',
    });

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', position: 'relative', zIndex: 1 }}>
            <div className="glass" style={{ maxWidth: '420px', width: '100%', padding: '36px 32px' }}>

                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                    <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: '22px', background: 'linear-gradient(135deg, #FF2D78, #FF6BA8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: '4px' }}>
                        Glitz &amp; Glamour
                    </div>
                    <p style={{ fontFamily: 'Poppins, sans-serif', color: '#666', fontSize: '13px' }}>
                        Your beauty, your loyalty card
                    </p>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.07)', marginBottom: '24px' }}>
                    <button style={tabStyle(tab === 'google')} onClick={() => { setTab('google'); setError(''); setSuccess(''); }}>
                        Google
                    </button>
                    <button style={tabStyle(tab === 'signin')} onClick={() => { setTab('signin'); setError(''); setSuccess(''); }}>
                        Sign In
                    </button>
                    <button style={tabStyle(tab === 'signup')} onClick={() => { setTab('signup'); setError(''); setSuccess(''); }}>
                        Create Account
                    </button>
                </div>

                {/* Success / Error */}
                {success && (
                    <div style={{ background: 'rgba(0,212,120,0.08)', border: '1px solid rgba(0,212,120,0.25)', borderRadius: '10px', padding: '10px 14px', marginBottom: '16px', fontFamily: 'Poppins, sans-serif', fontSize: '13px', color: '#00D478' }}>
                        ✅ {success}
                    </div>
                )}
                {error && (
                    <div style={{ background: 'rgba(255,45,120,0.08)', border: '1px solid rgba(255,45,120,0.25)', borderRadius: '10px', padding: '10px 14px', marginBottom: '16px', fontFamily: 'Poppins, sans-serif', fontSize: '13px', color: '#FF6B6B' }}>
                        {error}
                    </div>
                )}

                {/* ── GOOGLE TAB ── */}
                {tab === 'google' && (
                    <div>
                        <p style={{ fontFamily: 'Poppins, sans-serif', color: '#aaa', fontSize: '13px', textAlign: 'center', marginBottom: '20px', lineHeight: 1.6 }}>
                            One tap and you&apos;re in. No password needed.
                        </p>
                        <button
                            className="btn-primary"
                            style={{ width: '100%', fontSize: '14px', padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                            onClick={() => signIn('google', { callbackUrl: '/card' })}
                        >
                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
                                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" />
                                <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
                                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
                            </svg>
                            Continue with Google
                        </button>
                        <div style={{ textAlign: 'center', marginTop: '20px' }}>
                            <button onClick={() => setTab('signup')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Poppins, sans-serif', fontSize: '13px', color: '#888' }}>
                                Prefer email? <span style={{ color: '#FF2D78' }}>Create an account</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* ── SIGN IN TAB ── */}
                {tab === 'signin' && (
                    <form onSubmit={handleSignIn} style={{ display: 'grid', gap: '14px' }}>
                        {/* Email */}
                        <div style={{ position: 'relative' }}>
                            <Mail size={15} color="#555" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                            <input
                                type="email" required placeholder="Email address"
                                value={siEmail} onChange={e => setSiEmail(e.target.value)}
                                style={inputStyle}
                            />
                        </div>
                        {/* Password */}
                        <div style={{ position: 'relative' }}>
                            <Lock size={15} color="#555" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                            <input
                                type={showPass ? 'text' : 'password'} required placeholder="Password"
                                value={siPassword} onChange={e => setSiPassword(e.target.value)}
                                style={{ ...inputStyle, paddingRight: '42px' }}
                            />
                            <button type="button" onClick={() => setShowPass(p => !p)}
                                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}>
                                {showPass ? <EyeOff size={15} color="#666" /> : <Eye size={15} color="#666" />}
                            </button>
                        </div>
                        <button type="submit" className="btn-primary" disabled={loading}
                            style={{ width: '100%', fontSize: '14px', padding: '13px', opacity: loading ? 0.7 : 1 }}>
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                        <div style={{ textAlign: 'center' }}>
                            <button type="button" onClick={() => setTab('signup')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Poppins, sans-serif', fontSize: '13px', color: '#888' }}>
                                No account? <span style={{ color: '#FF2D78' }}>Create one free</span>
                            </button>
                        </div>
                    </form>
                )}

                {/* ── SIGN UP TAB ── */}
                {tab === 'signup' && (
                    <form onSubmit={handleSignUp} style={{ display: 'grid', gap: '14px' }}>
                        {/* Name */}
                        <div style={{ position: 'relative' }}>
                            <User size={15} color="#555" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                            <input
                                type="text" required placeholder="Full name"
                                value={suName} onChange={e => setSuName(e.target.value)}
                                style={inputStyle}
                            />
                        </div>
                        {/* Email */}
                        <div style={{ position: 'relative' }}>
                            <Mail size={15} color="#555" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                            <input
                                type="email" required placeholder="Email address"
                                value={suEmail} onChange={e => setSuEmail(e.target.value)}
                                style={inputStyle}
                            />
                        </div>
                        {/* Password */}
                        <div style={{ position: 'relative' }}>
                            <Lock size={15} color="#555" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                            <input
                                type={showPass ? 'text' : 'password'} required placeholder="Password (min 8 chars)"
                                value={suPassword} onChange={e => setSuPassword(e.target.value)}
                                style={{ ...inputStyle, paddingRight: '42px' }}
                            />
                            <button type="button" onClick={() => setShowPass(p => !p)}
                                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}>
                                {showPass ? <EyeOff size={15} color="#666" /> : <Eye size={15} color="#666" />}
                            </button>
                        </div>
                        {/* Confirm */}
                        <div style={{ position: 'relative' }}>
                            <Lock size={15} color="#555" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                            <input
                                type={showConfirm ? 'text' : 'password'} required placeholder="Confirm password"
                                value={suConfirm} onChange={e => setSuConfirm(e.target.value)}
                                style={{ ...inputStyle, paddingRight: '42px' }}
                            />
                            <button type="button" onClick={() => setShowConfirm(p => !p)}
                                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}>
                                {showConfirm ? <EyeOff size={15} color="#666" /> : <Eye size={15} color="#666" />}
                            </button>
                        </div>
                        <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#666', lineHeight: 1.6, margin: '-4px 0' }}>
                            A confirmation email will be sent — verification is optional but recommended.
                        </p>
                        <button type="submit" className="btn-primary" disabled={loading}
                            style={{ width: '100%', fontSize: '14px', padding: '13px', opacity: loading ? 0.7 : 1 }}>
                            {loading ? 'Creating account...' : 'Create Account'}
                        </button>
                        <div style={{ textAlign: 'center' }}>
                            <button type="button" onClick={() => setTab('signin')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Poppins, sans-serif', fontSize: '13px', color: '#888' }}>
                                Already have an account? <span style={{ color: '#FF2D78' }}>Sign in</span>
                            </button>
                        </div>
                    </form>
                )}

                {/* Back  */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px', textAlign: 'center', marginTop: '24px' }}>
                    <Link href="/" style={{ fontFamily: 'Poppins, sans-serif', color: '#444', fontSize: '13px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
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
