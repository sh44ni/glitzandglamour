'use client';

import { useState } from 'react';
import { Shield, Lock, MonitorSmartphone, Eye, EyeOff } from 'lucide-react';

export default function AdminLoginPage() {
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showRememberPrompt, setShowRememberPrompt] = useState(false);

    // Step 1: verify password first, then show the remember prompt
    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        if (!password || loading) return;
        setLoading(true);
        setError('');

        try {
            // Use rememberDevice: false just to verify — we re-call on step 2 with the real choice
            const res = await fetch('/api/admin/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: password.trim(), rememberDevice: false }),
            });

            if (res.ok) {
                setShowRememberPrompt(true);
                setLoading(false);
            } else {
                const data = await res.json();
                setError(data.error || 'Invalid secret key. Try again.');
                setLoading(false);
            }
        } catch (err: any) {
            setError(err?.message || 'Network error occurred.');
            setLoading(false);
        }
    }

    // Step 2: re-issue cookie with correct expiry based on choice
    async function submitWithRemember(remember: boolean) {
        setLoading(true);
        setError('');
        setShowRememberPrompt(false);

        try {
            const res = await fetch('/api/admin/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: password.trim(), rememberDevice: remember }),
            });

            if (res.ok) {
                window.location.href = '/admin';
            } else {
                const data = await res.json();
                setError(data.error || 'Something went wrong, please try again.');
                setLoading(false);
            }
        } catch (err: any) {
            setError(err?.message || 'Network error occurred.');
            setLoading(false);
        }
    }

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px', background: '#0A0A0A', position: 'relative', zIndex: 1,
        }}>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
                .admin-login-card { animation: fadeIn 0.25s ease both; }
                @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
                .remember-prompt { animation: slideUp 0.2s ease both; }
                .pw-toggle { background: none; border: none; cursor: pointer; color: #555; display: flex; align-items: center; padding: 0 4px; }
                .pw-toggle:hover { color: #FF2D78; }
            `}</style>

            <div className="glass admin-login-card" style={{ maxWidth: '400px', width: '100%', padding: '48px 32px', position: 'relative' }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(255,45,120,0.1)', border: '1px solid rgba(255,45,120,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                        <Shield size={24} color="#FF2D78" />
                    </div>
                    <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: '22px', background: 'linear-gradient(135deg, #FF2D78, #FF6BA8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: '4px' }}>
                        Glitz &amp; Glamour
                    </div>
                    <p style={{ fontFamily: 'Poppins, sans-serif', color: '#555', fontSize: '13px' }}>Admin Panel</p>
                </div>

                {/* Main login form */}
                {!showRememberPrompt ? (
                    <form onSubmit={handleLogin}>
                        <div style={{ marginBottom: '24px' }}>
                            <label className="label">
                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Lock size={12} color="#888" /> Secret Key
                                </span>
                            </label>
                            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className="input"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    autoFocus
                                    style={{ fontFamily: 'Poppins, sans-serif', paddingRight: '42px', width: '100%' }}
                                />
                                <button
                                    type="button"
                                    className="pw-toggle"
                                    onClick={() => setShowPassword(v => !v)}
                                    tabIndex={-1}
                                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>
                        {error && (
                            <p style={{ fontFamily: 'Poppins, sans-serif', color: '#FF2D78', fontSize: '13px', marginBottom: '16px', textAlign: 'center' }}>
                                {error}
                            </p>
                        )}
                        <button
                            type="submit"
                            className="btn-primary"
                            style={{ width: '100%', fontSize: '15px', padding: '14px' }}
                            disabled={loading || !password}
                        >
                            {loading ? 'Verifying…' : 'Enter Console →'}
                        </button>
                    </form>
                ) : (
                    /* Remember-device prompt — only shown after successful password verification */
                    <div className="remember-prompt">
                        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                            <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(255,45,120,0.1)', border: '1px solid rgba(255,45,120,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                                <MonitorSmartphone size={24} color="#FF2D78" />
                            </div>
                            <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#fff', fontSize: '16px', marginBottom: '6px' }}>
                                Remember this device?
                            </p>
                            <p style={{ fontFamily: 'Poppins, sans-serif', color: '#666', fontSize: '13px', lineHeight: 1.5 }}>
                                Stay signed in for 30 days, or sign in again every 8 hours.
                            </p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <button
                                onClick={() => submitWithRemember(true)}
                                disabled={loading}
                                style={{
                                    width: '100%', padding: '14px', borderRadius: '50px',
                                    background: 'linear-gradient(135deg, #FF2D78, #FF6BA8)',
                                    border: 'none', color: '#fff',
                                    fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '14px',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    opacity: loading ? 0.7 : 1,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                }}
                            >
                                {loading ? 'Signing in…' : <><MonitorSmartphone size={16} /> Remember for 30 days</>}
                            </button>
                            <button
                                onClick={() => submitWithRemember(false)}
                                disabled={loading}
                                style={{
                                    width: '100%', padding: '13px', borderRadius: '50px',
                                    background: 'transparent',
                                    border: '1.5px solid rgba(255,255,255,0.1)',
                                    color: '#888',
                                    fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '14px',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                }}
                            >
                                {loading ? '…' : 'Just this session'}
                            </button>
                            <button
                                onClick={() => { setShowRememberPrompt(false); setError(''); }}
                                disabled={loading}
                                style={{ background: 'none', border: 'none', color: '#444', fontFamily: 'Poppins, sans-serif', fontSize: '12px', cursor: 'pointer', padding: '4px', textAlign: 'center' }}
                            >
                                ← Back
                            </button>
                        </div>

                        {error && (
                            <p style={{ fontFamily: 'Poppins, sans-serif', color: '#FF2D78', fontSize: '13px', marginTop: '14px', textAlign: 'center' }}>
                                {error}
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
