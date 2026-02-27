'use client';

import { useState } from 'react';
import { AlertTriangle, X, Mail, RefreshCw } from 'lucide-react';

export default function UnverifiedBanner() {
    const [open, setOpen] = useState(false);
    const [dismissed, setDismissed] = useState(false);
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    if (dismissed) return null;

    async function resend() {
        setSending(true);
        setError('');
        try {
            const res = await fetch('/api/auth/resend-verification', { method: 'POST' });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed');
            setSent(true);
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'Something went wrong');
        } finally {
            setSending(false);
        }
    }

    return (
        <>
            {/* Banner */}
            <div
                onClick={() => setOpen(true)}
                style={{
                    background: 'rgba(255, 183, 0, 0.08)',
                    border: '1px solid rgba(255, 183, 0, 0.3)',
                    borderRadius: '14px',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: 'pointer',
                    marginBottom: '16px',
                    transition: 'background 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255, 183, 0, 0.12)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255, 183, 0, 0.08)')}
            >
                <AlertTriangle size={16} color="#FFB700" style={{ flexShrink: 0 }} />
                <p style={{
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '13px',
                    color: '#FFB700',
                    flex: 1,
                    fontWeight: 500,
                }}>
                    Email not verified — tap to learn more
                </p>
                <button
                    onClick={e => { e.stopPropagation(); setDismissed(true); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex' }}
                >
                    <X size={14} color="#aaa" />
                </button>
            </div>

            {/* Modal */}
            {open && (
                <div
                    style={{
                        position: 'fixed', inset: 0, zIndex: 1000,
                        background: 'rgba(0,0,0,0.7)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '20px',
                        backdropFilter: 'blur(8px)',
                    }}
                    onClick={() => setOpen(false)}
                >
                    <div
                        className="glass"
                        style={{ maxWidth: '400px', width: '100%', padding: '32px', position: 'relative' }}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Close */}
                        <button
                            onClick={() => setOpen(false)}
                            style={{
                                position: 'absolute', top: '16px', right: '16px',
                                background: 'none', border: 'none', cursor: 'pointer',
                            }}
                        >
                            <X size={18} color="#aaa" />
                        </button>

                        {/* Icon */}
                        <div style={{
                            width: '52px', height: '52px', borderRadius: '50%',
                            background: 'rgba(255, 183, 0, 0.1)',
                            border: '1px solid rgba(255, 183, 0, 0.3)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            marginBottom: '20px',
                        }}>
                            <Mail size={22} color="#FFB700" />
                        </div>

                        <h2 style={{
                            fontFamily: 'Poppins, sans-serif', fontWeight: 700,
                            fontSize: '18px', color: '#fff', marginBottom: '10px',
                        }}>
                            Confirm your email
                        </h2>
                        <p style={{
                            fontFamily: 'Poppins, sans-serif', fontSize: '14px',
                            color: '#aaa', lineHeight: 1.7, marginBottom: '20px',
                        }}>
                            We sent a confirmation email when you signed up.
                            Open it and click the{' '}
                            <strong style={{ color: '#FF2D78' }}>Confirm My Email</strong>{' '}
                            button to verify your account.
                        </p>
                        <p style={{
                            fontFamily: 'Poppins, sans-serif', fontSize: '13px',
                            color: '#888', lineHeight: 1.6, marginBottom: '24px',
                        }}>
                            Can&apos;t find it? Check your spam folder, or resend it below.
                        </p>

                        {sent ? (
                            <div style={{
                                background: 'rgba(0, 212, 120, 0.1)',
                                border: '1px solid rgba(0, 212, 120, 0.3)',
                                borderRadius: '10px', padding: '12px 16px',
                                fontFamily: 'Poppins, sans-serif', fontSize: '13px',
                                color: '#00D478',
                            }}>
                                ✅ Confirmation email sent! Check your inbox.
                            </div>
                        ) : (
                            <>
                                {error && (
                                    <p style={{
                                        fontFamily: 'Poppins, sans-serif', fontSize: '13px',
                                        color: '#FF6B6B', marginBottom: '12px',
                                    }}>{error}</p>
                                )}
                                <button
                                    onClick={resend}
                                    disabled={sending}
                                    className="btn-primary"
                                    style={{
                                        width: '100%', fontSize: '14px', padding: '13px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                        opacity: sending ? 0.7 : 1,
                                    }}
                                >
                                    <RefreshCw size={15} style={{ animation: sending ? 'spin 1s linear infinite' : undefined }} />
                                    {sending ? 'Sending...' : 'Resend Confirmation Email'}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </>
    );
}
