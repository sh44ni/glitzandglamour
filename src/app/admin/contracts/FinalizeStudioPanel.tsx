'use client';

import { useEffect, useState } from 'react';
import styles from './contracts.module.css';

export type FinalizeContractSummary = {
    label: string | null;
    contractNumber: string | null;
    clientName: string | null;
    clientEmail: string | null;
    clientSignedAt: string | null;
};

const FINALIZE_WORDS = [
    'Confirming the booking ✨',
    'Sealing the deal 💎',
    'Generating the final PDF 📄',
    'Notifying the client 💌',
    'Locking in the sparkle 🔐',
    'Stamping the approval 💋',
    'Wrapping it up beautifully 🎀',
    'Almost there, boss 💅',
    'Making it official 🥂',
    'Applying the finishing touch ✍️',
    'Polishing the final contract 💄',
    'Sending confirmation magic 🪄',
];

export default function FinalizeStudioPanel({
    inviteId,
    summary,
    onDone,
}: {
    inviteId: string;
    summary: FinalizeContractSummary;
    onDone: () => void;
}) {
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState('');
    const [showConfirm, setShowConfirm] = useState(false);
    const [prog, setProg] = useState(0);
    const [wordIdx, setWordIdx] = useState(0);

    /* Animated progress during finalize */
    useEffect(() => {
        if (!busy) { setProg(0); setWordIdx(0); return; }
        const progTimer = setInterval(() => setProg(p => {
            if (p >= 95) return 95;
            return Math.min(95, p + (p < 30 ? 4 : p < 60 ? 2.5 : p < 80 ? 1.2 : 0.4));
        }), 120);
        const wordTimer = setInterval(() => setWordIdx(i => (i + 1) % FINALIZE_WORDS.length), 2000);
        return () => { clearInterval(progTimer); clearInterval(wordTimer); };
    }, [busy]);

    async function submit() {
        setErr('');
        setBusy(true);
        try {
            const res = await fetch(`/api/admin/contracts/${inviteId}/finalize`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    retainerReceived: true,
                }),
            });
            const d = await res.json();
            if (!res.ok) {
                setErr(d.error || 'Finalize failed');
                return;
            }
            setProg(100);
            setTimeout(() => onDone(), 400);
            return;
        } catch {
            setErr('Network error.');
        } finally {
            setBusy(false);
            setShowConfirm(false);
        }
    }

    const displayName = summary.label || summary.clientName || 'Unknown';
    const signedDate = summary.clientSignedAt
        ? new Date(summary.clientSignedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
        : null;

    return (
        <div className={styles.panel} style={{ borderColor: 'rgba(0,212,120,0.25)' }}>
            <h3 style={{ color: '#00D478', fontSize: 15, marginBottom: 10 }}>Finalize contract (SIGNED)</h3>
            <p style={{ color: '#888', fontSize: 13, marginBottom: 14 }}>
                Confirm the retainer has been received. This marks the booking as officially confirmed and triggers the client confirmation email.
            </p>
            {err ? <p style={{ color: '#ff6b8a', marginBottom: 10 }}>{err}</p> : null}
            <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                <button type="button" className={`btn-primary ${styles.primaryBtn}`} disabled={busy} onClick={() => setShowConfirm(true)}>
                    {busy ? 'Saving…' : 'Mark retainer received & confirm booking'}
                </button>
            </div>

            {/* ── Finalize Confirmation Modal ── */}
            {showConfirm && !busy && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 9999,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(0,0,0,0.65)',
                        backdropFilter: 'blur(6px)',
                    }}
                    onClick={() => setShowConfirm(false)}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            background: '#1a1a1a',
                            border: '1px solid rgba(0,212,120,0.25)',
                            borderRadius: 18,
                            padding: '32px 28px',
                            maxWidth: 440,
                            width: '92%',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
                            animation: 'fadeSlideIn 0.25s ease',
                        }}
                    >
                        {/* Header */}
                        <div style={{ textAlign: 'center', marginBottom: 20 }}>
                            <div style={{ fontSize: 36, marginBottom: 10 }}>⚠️</div>
                            <h3 style={{
                                fontFamily: 'Poppins, sans-serif',
                                fontSize: 18,
                                fontWeight: 700,
                                color: '#fff',
                                margin: 0,
                            }}>Finalize This Contract?</h3>
                        </div>

                        {/* Contract Summary */}
                        <div style={{
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: 12,
                            padding: '16px 18px',
                            marginBottom: 20,
                        }}>
                            <p style={{
                                fontFamily: 'Poppins, sans-serif',
                                fontSize: 10,
                                fontWeight: 700,
                                color: '#666',
                                textTransform: 'uppercase',
                                letterSpacing: '0.08em',
                                margin: '0 0 10px',
                            }}>Contract Summary</p>

                            {[
                                { label: 'Client', value: displayName },
                                { label: 'Contract #', value: summary.contractNumber || '—' },
                                { label: 'Email', value: summary.clientEmail || '—' },
                                ...(signedDate ? [{ label: 'Client signed', value: signedDate }] : []),
                            ].map((item) => (
                                <div key={item.label} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'baseline',
                                    padding: '6px 0',
                                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                                    fontFamily: 'Poppins, sans-serif',
                                    fontSize: 13,
                                }}>
                                    <span style={{ color: '#777' }}>{item.label}</span>
                                    <span style={{ color: '#ccc', fontWeight: 500, textAlign: 'right', maxWidth: '60%', wordBreak: 'break-word' }}>{item.value}</span>
                                </div>
                            ))}
                        </div>

                        {/* Warning */}
                        <p style={{
                            fontFamily: 'Poppins, sans-serif',
                            fontSize: 12,
                            color: '#999',
                            lineHeight: 1.7,
                            marginBottom: 24,
                            textAlign: 'center',
                        }}>
                            This will mark the contract as <strong style={{ color: '#00D478' }}>fully executed</strong>,
                            confirm the booking, and notify the client. <strong style={{ color: '#ff6b8a' }}>This cannot be undone.</strong>
                        </p>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                            <button
                                type="button"
                                onClick={() => setShowConfirm(false)}
                                style={{
                                    background: 'rgba(255,255,255,0.06)',
                                    border: '1px solid rgba(255,255,255,0.12)',
                                    borderRadius: 10,
                                    padding: '12px 24px',
                                    color: '#ccc',
                                    fontSize: 14,
                                    fontFamily: 'Poppins, sans-serif',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    minHeight: 44,
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={busy}
                                onClick={() => void submit()}
                                style={{
                                    background: 'linear-gradient(135deg, #00D478, #00B865)',
                                    border: 'none',
                                    borderRadius: 10,
                                    padding: '12px 24px',
                                    color: '#fff',
                                    fontSize: 14,
                                    fontFamily: 'Poppins, sans-serif',
                                    fontWeight: 700,
                                    cursor: busy ? 'not-allowed' : 'pointer',
                                    opacity: busy ? 0.6 : 1,
                                    transition: 'all 0.2s',
                                    minHeight: 44,
                                    boxShadow: '0 4px 16px rgba(0,212,120,0.3)',
                                }}
                            >
                                Yes, Finalize
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Finalize Loading Overlay ── */}
            {busy && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 10000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(0,0,0,0.82)',
                        backdropFilter: 'blur(8px)',
                    }}
                >
                    <div style={{
                        textAlign: 'center',
                        maxWidth: 400,
                        padding: '0 24px',
                    }}>
                        <div style={{
                            fontSize: 48,
                            marginBottom: 16,
                            animation: 'pulse 2s ease-in-out infinite',
                        }}>💎</div>
                        <h2 style={{
                            fontFamily: 'Poppins, sans-serif',
                            fontSize: '1.3rem',
                            fontWeight: 700,
                            background: 'linear-gradient(135deg, #00D478, #4ade80)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            marginBottom: 8,
                        }}>Finalizing Contract</h2>
                        <p style={{
                            fontFamily: 'Poppins, sans-serif',
                            color: '#888',
                            fontSize: 13,
                            marginBottom: 28,
                        }}>Please don&apos;t close this page</p>

                        {/* Progress bar */}
                        <div style={{
                            background: 'rgba(255,255,255,0.06)',
                            borderRadius: 50,
                            height: 10,
                            overflow: 'hidden',
                            marginBottom: 10,
                            border: '1px solid rgba(0,212,120,0.15)',
                        }}>
                            <div style={{
                                height: '100%',
                                borderRadius: 50,
                                background: 'linear-gradient(90deg, #00D478, #4ade80, #00D478)',
                                transition: 'width 0.3s ease',
                                width: `${Math.round(prog)}%`,
                            }} />
                        </div>
                        <p style={{
                            fontFamily: 'Poppins, sans-serif',
                            color: '#00D478',
                            fontSize: 12,
                            fontWeight: 600,
                            letterSpacing: '1.5px',
                            marginBottom: 22,
                        }}>{Math.round(prog)}%</p>

                        {/* Fun words */}
                        <p style={{
                            fontFamily: 'Poppins, sans-serif',
                            color: '#ccc',
                            fontSize: 14,
                            minHeight: 26,
                            transition: 'opacity 0.3s',
                        }}>{FINALIZE_WORDS[wordIdx]}</p>

                        {/* Animated dots */}
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 18 }}>
                            {[0, 1, 2].map(i => (
                                <span key={i} style={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    background: '#00D478',
                                    display: 'inline-block',
                                    animation: `pulse 1.4s ease-in-out ${i * 0.15}s infinite`,
                                }} />
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 0.4; transform: scale(0.95); }
                    50% { opacity: 1; transform: scale(1.05); }
                }
            `}</style>
        </div>
    );
}
