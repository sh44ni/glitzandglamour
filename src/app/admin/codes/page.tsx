'use client';

import { useEffect, useState, useCallback } from 'react';
import { CheckCircle, XCircle, Search, Tag, RefreshCw, Clock } from 'lucide-react';

type DiscountCode = {
    id: string;
    code: string;
    customerName: string;
    isUsed: boolean;
    usedAt?: string;
    createdAt: string;
    booking?: {
        service?: { name: string };
        user?: { name: string; email: string };
        preferredDate?: string;
    };
};

type Stats = { total: number; activeCount: number; usedCount: number };
type ValidateResult = {
    valid: boolean;
    reason?: string;
    code?: string;
    customerName?: string;
    createdAt?: string;
    service?: string;
    isUsed?: boolean;
    usedAt?: string;
};

function CodeStatusBadge({ isUsed }: { isUsed: boolean }) {
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            fontFamily: 'Poppins, sans-serif', fontSize: '11px', fontWeight: 700,
            color: isUsed ? '#555' : '#00D478',
            background: isUsed ? 'rgba(255,255,255,0.04)' : 'rgba(0,212,120,0.1)',
            border: `1px solid ${isUsed ? 'rgba(255,255,255,0.08)' : 'rgba(0,212,120,0.3)'}`,
            borderRadius: '50px', padding: '3px 10px',
        }}>
            {isUsed ? <XCircle size={10} /> : <CheckCircle size={10} />}
            {isUsed ? 'Redeemed' : 'Active'}
        </span>
    );
}

export default function AdminCodesPage() {
    const [codes, setCodes] = useState<DiscountCode[]>([]);
    const [stats, setStats] = useState<Stats>({ total: 0, activeCount: 0, usedCount: 0 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<'all' | 'active' | 'used'>('all');
    const [refreshing, setRefreshing] = useState(false);

    // Validator state
    const [codeInput, setCodeInput] = useState('');
    const [validating, setValidating] = useState(false);
    const [validateResult, setValidateResult] = useState<ValidateResult | null>(null);
    const [redeeming, setRedeeming] = useState(false);
    const [redeemSuccess, setRedeemSuccess] = useState(false);

    const load = useCallback(async (silent = false) => {
        if (!silent) setLoading(true); else setRefreshing(true);
        const params = new URLSearchParams({ filter });
        if (search) params.set('q', search);
        const res = await fetch(`/api/admin/codes?${params}`);
        if (res.ok) {
            const d = await res.json();
            setCodes(d.codes || []);
            setStats({ total: d.total, activeCount: d.activeCount, usedCount: d.usedCount });
        }
        setLoading(false);
        setRefreshing(false);
    }, [filter, search]);

    useEffect(() => { load(); }, [load]);

    async function validateCode() {
        if (!codeInput.trim()) return;
        setValidating(true);
        setValidateResult(null);
        setRedeemSuccess(false);
        try {
            const res = await fetch('/api/admin/codes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: codeInput.trim().toUpperCase() }),
            });
            const d = await res.json();
            setValidateResult(d);
        } catch {
            setValidateResult({ valid: false, reason: 'Network error' });
        }
        setValidating(false);
    }

    async function redeemCode() {
        if (!validateResult?.code) return;
        setRedeeming(true);
        try {
            const res = await fetch('/api/admin/codes', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: validateResult.code }),
            });
            if (res.ok) {
                setRedeemSuccess(true);
                setValidateResult(prev => prev ? { ...prev, isUsed: true } : prev);
                load(true);
            }
        } catch { }
        setRedeeming(false);
    }

    const inputStyle: React.CSSProperties = {
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '12px', padding: '12px 16px',
        color: '#fff', fontSize: '14px',
        fontFamily: 'Poppins, sans-serif',
        width: '100%', outline: 'none',
        transition: 'border-color 0.2s',
    };

    return (
        <div style={{ maxWidth: '900px' }}>
            <div style={{ marginBottom: '28px' }}>
                <h1 style={{
                    fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#fff',
                    fontSize: '22px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '10px',
                }}>
                    <Tag size={20} color="#FF2D78" /> Discount Codes
                </h1>
                <p style={{ fontFamily: 'Poppins, sans-serif', color: '#555', fontSize: '13px' }}>
                    Validate and redeem $10 off first-visit review codes
                </p>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '28px' }}>
                {[
                    { label: 'Total Codes', value: stats.total, color: '#fff' },
                    { label: 'Active', value: stats.activeCount, color: '#00D478' },
                    { label: 'Redeemed', value: stats.usedCount, color: '#FF2D78' },
                ].map(s => (
                    <div key={s.label} style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.07)',
                        borderRadius: '16px', padding: '18px 20px',
                    }}>
                        <p style={{ fontFamily: 'Poppins, sans-serif', color: '#555', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>{s.label}</p>
                        <p style={{ fontFamily: 'Poppins, sans-serif', color: s.color, fontSize: '28px', fontWeight: 800 }}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* ─── VALIDATOR WIDGET ─────────────────────────────────── */}
            <div style={{
                background: 'rgba(255,45,120,0.04)',
                border: '1px solid rgba(255,45,120,0.2)',
                borderRadius: '20px', padding: '24px',
                marginBottom: '28px',
            }}>
                <h2 style={{
                    fontFamily: 'Poppins, sans-serif', color: '#fff',
                    fontSize: '16px', fontWeight: 700, marginBottom: '16px',
                    display: 'flex', alignItems: 'center', gap: '8px',
                }}>
                    🏷️ Validate &amp; Redeem
                </h2>

                <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                    <input
                        type="text"
                        value={codeInput}
                        onChange={e => setCodeInput(e.target.value.toUpperCase())}
                        onKeyDown={e => e.key === 'Enter' && validateCode()}
                        placeholder="Enter code e.g. SARAH-X9KPZ"
                        style={{
                            ...inputStyle, flex: 1,
                            fontFamily: 'Courier New, monospace',
                            fontSize: '16px', letterSpacing: '1px',
                        }}
                    />
                    <button
                        onClick={validateCode}
                        disabled={validating || !codeInput.trim()}
                        style={{
                            padding: '12px 20px',
                            background: 'linear-gradient(135deg,#FF2D78,#FF6BA8)',
                            border: 'none', borderRadius: '12px',
                            color: '#fff', fontFamily: 'Poppins, sans-serif',
                            fontSize: '14px', fontWeight: 600,
                            cursor: validating ? 'not-allowed' : 'pointer',
                            opacity: validating ? 0.7 : 1,
                            flexShrink: 0, whiteSpace: 'nowrap',
                        }}
                    >
                        {validating ? '…' : 'Validate'}
                    </button>
                </div>

                {/* Validation result */}
                {validateResult && (
                    <div style={{
                        background: validateResult.valid
                            ? 'rgba(0,212,120,0.06)'
                            : 'rgba(255,45,120,0.06)',
                        border: `1px solid ${validateResult.valid ? 'rgba(0,212,120,0.25)' : 'rgba(255,45,120,0.25)'}`,
                        borderRadius: '14px', padding: '18px 20px',
                        animation: 'slideUp 0.25s ease',
                    }}>
                        {validateResult.valid ? (
                            <>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                            <CheckCircle size={18} color="#00D478" />
                                            <span style={{
                                                fontFamily: 'Courier New, monospace',
                                                fontSize: '20px', fontWeight: 900, color: '#FF2D78',
                                                letterSpacing: '2px',
                                            }}>
                                                {validateResult.code}
                                            </span>
                                            <CodeStatusBadge isUsed={validateResult.isUsed || redeemSuccess} />
                                        </div>
                                        <p style={{ fontFamily: 'Poppins, sans-serif', color: '#ddd', fontSize: '14px', fontWeight: 600, marginBottom: '2px' }}>
                                            {validateResult.customerName}
                                        </p>
                                        {validateResult.service && (
                                            <p style={{ fontFamily: 'Poppins, sans-serif', color: '#666', fontSize: '12px' }}>
                                                💅 {validateResult.service}
                                            </p>
                                        )}
                                        <p style={{ fontFamily: 'Poppins, sans-serif', color: '#555', fontSize: '11px', marginTop: '4px' }}>
                                            <Clock size={10} style={{ marginRight: '4px' }} />
                                            Earned {new Date(validateResult.createdAt!).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: '28px', fontWeight: 900, color: '#00D478' }}>
                                        $10
                                    </div>
                                </div>

                                {redeemSuccess ? (
                                    <div style={{
                                        background: 'rgba(0,212,120,0.1)', border: '1px solid rgba(0,212,120,0.3)',
                                        borderRadius: '10px', padding: '12px 16px',
                                        fontFamily: 'Poppins, sans-serif', color: '#00D478',
                                        fontSize: '14px', fontWeight: 600, textAlign: 'center',
                                    }}>
                                        ✅ Code Redeemed Successfully — $10 off applied!
                                    </div>
                                ) : validateResult.isUsed ? (
                                    <div style={{
                                        background: 'rgba(255,45,120,0.08)', border: '1px solid rgba(255,45,120,0.2)',
                                        borderRadius: '10px', padding: '12px 16px',
                                        fontFamily: 'Poppins, sans-serif', color: '#FF2D78',
                                        fontSize: '13px', textAlign: 'center',
                                    }}>
                                        ⚠️ This code was already redeemed on {new Date(validateResult.usedAt!).toLocaleDateString()}
                                    </div>
                                ) : (
                                    <button
                                        onClick={redeemCode}
                                        disabled={redeeming}
                                        style={{
                                            width: '100%', padding: '14px',
                                            background: 'linear-gradient(135deg,#00D478,#00B864)',
                                            border: 'none', borderRadius: '12px',
                                            color: '#fff', fontFamily: 'Poppins, sans-serif',
                                            fontSize: '15px', fontWeight: 700,
                                            cursor: redeeming ? 'not-allowed' : 'pointer',
                                            opacity: redeeming ? 0.7 : 1,
                                            transition: 'all 0.2s',
                                        }}
                                    >
                                        {redeeming ? 'Redeeming…' : '✅ Mark as Redeemed — $10 Off Applied'}
                                    </button>
                                )}
                            </>
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <XCircle size={20} color="#FF2D78" />
                                <div>
                                    <p style={{ fontFamily: 'Poppins, sans-serif', color: '#FF2D78', fontWeight: 600, fontSize: '14px' }}>
                                        Invalid Code
                                    </p>
                                    <p style={{ fontFamily: 'Poppins, sans-serif', color: '#888', fontSize: '13px' }}>
                                        {validateResult.reason === 'not_found'
                                            ? 'No code found matching that input.'
                                            : validateResult.reason === 'already_used'
                                                ? 'This code has already been redeemed.'
                                                : 'Unknown error — please try again.'}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ─── CODE LIST ─────────────────────────────────────────── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {(['all', 'active', 'used'] as const).map(f => (
                        <button key={f} onClick={() => setFilter(f)} style={{
                            fontFamily: 'Poppins, sans-serif', fontSize: '12px', fontWeight: 600,
                            padding: '6px 14px', borderRadius: '50px', cursor: 'pointer',
                            background: filter === f ? '#FF2D78' : 'rgba(255,255,255,0.04)',
                            color: filter === f ? '#fff' : '#555',
                            border: filter === f ? '1px solid #FF2D78' : '1px solid rgba(255,255,255,0.08)',
                            transition: 'all 0.2s',
                        }}>
                            {f === 'all' ? 'All' : f === 'active' ? '🟢 Active' : '⬛ Redeemed'}
                        </button>
                    ))}
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={14} color="#555" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="text"
                            placeholder="Search code or name…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{ ...inputStyle, paddingLeft: '34px', width: '200px', fontSize: '13px' }}
                        />
                    </div>
                    <button onClick={() => load(true)} title="Refresh" style={{
                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '10px', padding: '10px', cursor: 'pointer', display: 'flex',
                    }}>
                        <RefreshCw size={14} color="#666" style={{ animation: refreshing ? 'spin 0.7s linear infinite' : 'none' }} />
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gap: '10px' }}>
                {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} style={{ height: 72, background: 'rgba(255,255,255,0.03)', borderRadius: '14px', animation: 'pulse 1.5s ease infinite' }} />
                    ))
                ) : codes.length === 0 ? (
                    <div style={{
                        background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: '16px', padding: '40px', textAlign: 'center',
                    }}>
                        <Tag size={32} color="#333" style={{ margin: '0 auto 12px', display: 'block' }} />
                        <p style={{ fontFamily: 'Poppins, sans-serif', color: '#444' }}>
                            No codes yet — they&apos;ll appear here when first-time clients leave a review.
                        </p>
                    </div>
                ) : codes.map(c => (
                    <div key={c.id} style={{
                        background: c.isUsed ? 'rgba(255,255,255,0.02)' : 'rgba(0,212,120,0.03)',
                        border: `1px solid ${c.isUsed ? 'rgba(255,255,255,0.06)' : 'rgba(0,212,120,0.12)'}`,
                        borderRadius: '14px', padding: '14px 18px',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        gap: '12px', flexWrap: 'wrap',
                        opacity: c.isUsed ? 0.6 : 1,
                    }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' }}>
                                <span style={{
                                    fontFamily: 'Courier New, monospace', fontSize: '16px',
                                    fontWeight: 900, color: c.isUsed ? '#555' : '#FF2D78',
                                    letterSpacing: '1.5px',
                                }}>
                                    {c.code}
                                </span>
                                <CodeStatusBadge isUsed={c.isUsed} />
                            </div>
                            <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', color: '#ddd', marginBottom: '2px' }}>
                                {c.customerName}
                            </div>
                            <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: '#444', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                {c.booking?.service?.name && <span>💅 {c.booking.service.name}</span>}
                                <span>📅 {new Date(c.createdAt).toLocaleDateString()}</span>
                                {c.isUsed && c.usedAt && <span>✓ Used {new Date(c.usedAt).toLocaleDateString()}</span>}
                            </div>
                        </div>
                        {!c.isUsed && (
                            <button
                                onClick={() => {
                                    setCodeInput(c.code);
                                    setValidateResult({ valid: true, code: c.code, customerName: c.customerName, createdAt: c.createdAt, service: c.booking?.service?.name, isUsed: false });
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                style={{
                                    padding: '8px 16px', background: 'rgba(255,45,120,0.1)',
                                    border: '1px solid rgba(255,45,120,0.25)',
                                    borderRadius: '10px', cursor: 'pointer',
                                    fontFamily: 'Poppins, sans-serif', fontSize: '12px',
                                    color: '#FF2D78', fontWeight: 600, whiteSpace: 'nowrap',
                                }}
                            >
                                Redeem →
                            </button>
                        )}
                    </div>
                ))}
            </div>
            <style>{`
                @keyframes slideUp { from { transform: translateY(10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
                @keyframes spin { to { transform: rotate(360deg); } }
                input:focus, button:focus { outline: none; }
                input:focus { border-color: rgba(255,45,120,0.5) !important; }
            `}</style>
        </div>
    );
}
