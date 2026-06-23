'use client';

import { useEffect, useState, useCallback } from 'react';
import { Bell, Send, CheckCircle, XCircle, Smartphone, RefreshCw, Sparkles } from 'lucide-react';

const S = { fontFamily: 'Poppins, sans-serif' } as const;

type Campaign = {
    id: string;
    title: string;
    body: string;
    data?: Record<string, unknown> | null;
    totalSent: number;
    totalFailed: number;
    sentAt: string;
};

type SendResult = { sent: number; failed: number; message?: string } | null;

const DEEP_LINK_SCREENS = [
    { label: 'None (just open app)', value: '' },
    { label: '🏠 Home', value: 'home' },
    { label: '📅 Book Now', value: 'book' },
    { label: '✨ Events', value: 'events' },
    { label: '💳 Loyalty Card', value: 'card' },
    { label: '🖼️ Gallery', value: 'gallery' },
    { label: '👤 Profile', value: 'profile' },
];

export default function PushNotificationsPage() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [tokenCount, setTokenCount] = useState(0);
    const [loading, setLoading] = useState(true);

    // Compose
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [screen, setScreen] = useState('');
    const [sending, setSending] = useState(false);
    const [result, setResult] = useState<SendResult>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);

    const load = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        const res = await fetch('/api/admin/push/campaigns');
        if (res.ok) {
            const d = await res.json();
            setCampaigns(d.campaigns || []);
            setTokenCount(d.tokenCount || 0);
        }
        setLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);

    async function doSend() {
        setSending(true);
        setResult(null);
        setConfirmOpen(false);
        try {
            const payload: Record<string, unknown> = { title: title.trim(), body: body.trim() };
            if (screen) payload.data = { screen };

            const res = await fetch('/api/admin/push/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const d = await res.json();
            setResult(d);
            if (d.sent > 0 || d.failed >= 0) {
                setTitle('');
                setBody('');
                setScreen('');
                load(true);
            }
        } catch {
            setResult({ sent: 0, failed: 0, message: 'Network error. Try again.' });
        } finally {
            setSending(false);
        }
    }

    const canSend = title.trim().length > 0 && body.trim().length > 0;

    return (
        <div style={{ maxWidth: 920 }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <h1 style={{ ...S, fontWeight: 700, color: '#fff', fontSize: 22, marginBottom: 4 }}>
                        Push Notifications
                    </h1>
                    <p style={{ ...S, color: '#555', fontSize: 13 }}>
                        Send notifications directly to app users
                    </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,45,120,0.08)', border: '1px solid rgba(255,45,120,0.2)', borderRadius: 12, padding: '10px 16px' }}>
                        <Smartphone size={15} color="#FF2D78" />
                        <span style={{ ...S, fontSize: 13, fontWeight: 700, color: '#FF2D78' }}>{tokenCount}</span>
                        <span style={{ ...S, fontSize: 12, color: '#555' }}>registered devices</span>
                    </div>
                    <button onClick={() => load(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 14px', cursor: 'pointer', color: '#aaa', ...S, fontSize: 13 }}>
                        <RefreshCw size={13} />
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>

                {/* ── Compose Panel ── */}
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 18, padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <Sparkles size={16} color="#FF2D78" />
                        <span style={{ ...S, fontWeight: 700, color: '#fff', fontSize: 15 }}>Compose</span>
                    </div>

                    {/* Audience pill */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(0,212,120,0.07)', border: '1px solid rgba(0,212,120,0.2)', borderRadius: 10, padding: '10px 14px' }}>
                        <CheckCircle size={13} color="#00D478" />
                        <span style={{ ...S, fontSize: 12, color: '#00D478', fontWeight: 600 }}>All {tokenCount} registered app users</span>
                    </div>

                    {/* Title */}
                    <div>
                        <label style={{ ...S, color: '#555', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 6 }}>
                            Notification Title
                        </label>
                        <input
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            maxLength={65}
                            placeholder="✨ Special offer for you!"
                            style={{ ...S, width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 12px', color: '#fff', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                        />
                        <div style={{ ...S, fontSize: 10, color: '#333', textAlign: 'right', marginTop: 4 }}>{title.length}/65</div>
                    </div>

                    {/* Body */}
                    <div>
                        <label style={{ ...S, color: '#555', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 6 }}>
                            Message
                        </label>
                        <textarea
                            value={body}
                            onChange={e => setBody(e.target.value)}
                            maxLength={200}
                            rows={3}
                            placeholder="Tap to see what's waiting for you 💅"
                            style={{ ...S, width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 12px', color: '#fff', fontSize: 13, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                        />
                        <div style={{ ...S, fontSize: 10, color: '#333', textAlign: 'right', marginTop: 4 }}>{body.length}/200</div>
                    </div>

                    {/* Deep link screen */}
                    <div>
                        <label style={{ ...S, color: '#555', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 6 }}>
                            Open Screen on Tap
                        </label>
                        <select
                            value={screen}
                            onChange={e => setScreen(e.target.value)}
                            style={{ ...S, width: '100%', background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 12px', color: '#ccc', fontSize: 13, outline: 'none', boxSizing: 'border-box', cursor: 'pointer' }}
                        >
                            {DEEP_LINK_SCREENS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Preview */}
                    {(title || body) && (
                        <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 14 }}>
                            <p style={{ ...S, fontSize: 10, color: '#444', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>Preview</p>
                            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#FF2D78,#7928CA)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <Bell size={18} color="#fff" />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ ...S, fontWeight: 700, color: '#fff', fontSize: 13, margin: 0, marginBottom: 2 }}>{title || 'Your title here'}</p>
                                    <p style={{ ...S, color: '#888', fontSize: 12, margin: 0, lineHeight: 1.4 }}>{body || 'Your message here'}</p>
                                </div>
                                <span style={{ ...S, fontSize: 10, color: '#444', flexShrink: 0 }}>now</span>
                            </div>
                        </div>
                    )}

                    {/* Result banner */}
                    {result && (
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            background: result.failed > 0 && result.sent === 0 ? 'rgba(255,45,120,0.08)' : 'rgba(0,212,120,0.08)',
                            border: `1px solid ${result.failed > 0 && result.sent === 0 ? 'rgba(255,45,120,0.3)' : 'rgba(0,212,120,0.3)'}`,
                            borderRadius: 10, padding: '12px 14px',
                        }}>
                            {result.sent > 0
                                ? <CheckCircle size={15} color="#00D478" />
                                : <XCircle size={15} color="#FF2D78" />
                            }
                            <div>
                                {result.message
                                    ? <p style={{ ...S, fontSize: 13, color: '#aaa', margin: 0 }}>{result.message}</p>
                                    : <p style={{ ...S, fontSize: 13, fontWeight: 600, color: result.sent > 0 ? '#00D478' : '#FF2D78', margin: 0 }}>
                                        ✅ {result.sent} delivered{result.failed > 0 ? `, ❌ ${result.failed} failed` : ''}
                                    </p>
                                }
                            </div>
                        </div>
                    )}

                    {/* Send button */}
                    {!confirmOpen ? (
                        <button
                            onClick={() => setConfirmOpen(true)}
                            disabled={!canSend || tokenCount === 0}
                            style={{
                                ...S, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                background: canSend && tokenCount > 0 ? 'linear-gradient(135deg,#FF2D78,#7928CA)' : 'rgba(255,255,255,0.05)',
                                border: 'none', borderRadius: 12, padding: '13px',
                                cursor: canSend && tokenCount > 0 ? 'pointer' : 'not-allowed',
                                color: canSend && tokenCount > 0 ? '#fff' : '#333',
                                fontSize: 14, fontWeight: 700, transition: 'all 0.2s',
                            }}
                        >
                            <Bell size={16} />
                            Send to {tokenCount} device{tokenCount !== 1 ? 's' : ''}
                        </button>
                    ) : (
                        <div style={{ background: 'rgba(255,45,120,0.06)', border: '1px solid rgba(255,45,120,0.2)', borderRadius: 12, padding: 14 }}>
                            <p style={{ ...S, fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 12 }}>
                                Send "{title}" to all {tokenCount} devices?
                            </p>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button
                                    onClick={() => setConfirmOpen(false)}
                                    style={{ ...S, flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px', cursor: 'pointer', color: '#888', fontSize: 13 }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={doSend}
                                    disabled={sending}
                                    style={{ ...S, flex: 2, background: sending ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg,#FF2D78,#7928CA)', border: 'none', borderRadius: 10, padding: '10px', cursor: sending ? 'not-allowed' : 'pointer', color: sending ? '#444' : '#fff', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                                >
                                    <Send size={13} />
                                    {sending ? 'Sending…' : 'Confirm Send'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Campaign History ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <Bell size={15} color="#555" />
                        <span style={{ ...S, fontWeight: 600, color: '#888', fontSize: 14 }}>Recent Sends</span>
                    </div>

                    {loading ? (
                        Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} style={{ height: 80, borderRadius: 14, background: 'rgba(255,255,255,0.04)', animation: 'pulse 1.5s infinite' }} />
                        ))
                    ) : campaigns.length === 0 ? (
                        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '40px 20px', textAlign: 'center' }}>
                            <Bell size={28} color="#222" style={{ marginBottom: 10 }} />
                            <p style={{ ...S, color: '#333', fontSize: 13 }}>No push notifications sent yet</p>
                        </div>
                    ) : campaigns.map(c => (
                        <div key={c.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '14px 16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                                <p style={{ ...S, fontWeight: 700, color: '#fff', fontSize: 13, margin: 0, flex: 1, marginRight: 8 }}>{c.title}</p>
                                <span style={{ ...S, fontSize: 10, color: '#333', whiteSpace: 'nowrap', flexShrink: 0 }}>
                                    {new Date(c.sentAt).toLocaleDateString()} {new Date(c.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            <p style={{ ...S, fontSize: 12, color: '#555', margin: '0 0 10px', lineHeight: 1.4 }}>{c.body}</p>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <span style={{ ...S, fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 50, background: 'rgba(0,212,120,0.1)', color: '#00D478', border: '1px solid rgba(0,212,120,0.25)' }}>
                                    ✓ {c.totalSent} sent
                                </span>
                                {c.totalFailed > 0 && (
                                    <span style={{ ...S, fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 50, background: 'rgba(255,45,120,0.08)', color: '#FF2D78', border: '1px solid rgba(255,45,120,0.25)' }}>
                                        ✗ {c.totalFailed} failed
                                    </span>
                                )}
                                {c.data && (c.data as { screen?: string }).screen && (
                                    <span style={{ ...S, fontSize: 11, padding: '3px 10px', borderRadius: 50, background: 'rgba(255,255,255,0.05)', color: '#444', border: '1px solid rgba(255,255,255,0.08)' }}>
                                        → {(c.data as { screen: string }).screen}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
                @keyframes pulse { 0%,100% { opacity:0.4; } 50% { opacity:0.8; } }
                select option { background: #1a1a1a; color: #ccc; }
            `}</style>
        </div>
    );
}
