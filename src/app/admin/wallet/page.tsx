'use client';

import { useState, useEffect, useRef } from 'react';
import { UploadCloud, Send, Smartphone, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

type Stats = { deviceCount: number; cardCount: number };
type Result = { success: boolean; bannerUpdated: boolean; pushedCount: number; deviceCount: number; error?: string };

export default function AdminWalletPushPage() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<Result | null>(null);
    const fileInput = useRef<HTMLInputElement>(null);

    useEffect(() => { fetchStats(); }, []);

    const fetchStats = async () => {
        try {
            const r = await fetch('/api/admin/wallet-push');
            const d = await r.json();
            setStats(d);
        } catch (e) { console.error(e); }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (!f) return;
        setFile(f);
        setPreview(URL.createObjectURL(f));
        setResult(null);
    };

    const handleSubmit = async (pushAll: boolean) => {
        setLoading(true);
        setResult(null);
        try {
            const fd = new FormData();
            if (file) fd.append('banner', file);
            fd.append('pushAll', pushAll.toString());

            const res = await fetch('/api/admin/wallet-push', { method: 'POST', body: fd });
            const data = await res.json();
            setResult(data);
            if (data.success) {
                setFile(null);
                setPreview(null);
                if (fileInput.current) fileInput.current.value = '';
                fetchStats();
            }
        } catch (e: any) {
            setResult({ success: false, bannerUpdated: false, pushedCount: 0, deviceCount: 0, error: e.message });
        } finally {
            setLoading(false);
        }
    };

    const P = { fontFamily: 'Poppins, sans-serif' };

    return (
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ ...P, fontWeight: 700, color: '#fff', fontSize: '24px', marginBottom: '8px' }}>
                    Apple Wallet Pass Manager
                </h1>
                <p style={{ ...P, color: '#888', fontSize: '14px' }}>
                    Update the loyalty card banner image and push changes to all registered Apple Wallet passes.
                </p>
            </div>

            {/* Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
                {[
                    { label: 'Registered Devices', value: stats?.deviceCount ?? '—', icon: <Smartphone size={20} color="#FF2D78" /> },
                    { label: 'Cards with Wallet', value: stats?.cardCount ?? '—', icon: <Send size={20} color="#FF2D78" /> },
                ].map(({ label, value, icon }) => (
                    <div key={label} style={{
                        background: 'rgba(255,45,120,0.04)', border: '1px solid rgba(255,45,120,0.12)',
                        borderRadius: '16px', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px'
                    }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,45,120,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {icon}
                        </div>
                        <div>
                            <p style={{ ...P, fontWeight: 700, color: '#fff', fontSize: '28px', lineHeight: 1 }}>{value}</p>
                            <p style={{ ...P, color: '#666', fontSize: '12px', marginTop: '4px' }}>{label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Banner Upload Card */}
            <div style={{
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '20px', padding: '28px', marginBottom: '20px'
            }}>
                <h2 style={{ ...P, fontWeight: 600, color: '#fff', fontSize: '16px', marginBottom: '6px' }}>
                    🖼️ Banner Image
                </h2>
                <p style={{ ...P, color: '#666', fontSize: '13px', marginBottom: '20px' }}>
                    This replaces <code style={{ color: '#FF2D78', background: 'rgba(255,45,120,0.08)', padding: '1px 6px', borderRadius: '4px' }}>loyaltycardbanner2.png</code> — the strip image on the pass. Best size: <strong style={{ color: '#aaa' }}>1125 × 432px</strong>.
                </p>

                {/* Preview */}
                {preview ? (
                    <div style={{ marginBottom: '20px', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', position: 'relative', maxHeight: '200px' }}>
                        <img src={preview} alt="Banner preview" style={{ width: '100%', objectFit: 'cover', display: 'block', maxHeight: '200px' }} />
                        <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.7)', borderRadius: '8px', padding: '4px 10px' }}>
                            <span style={{ ...P, color: '#fff', fontSize: '12px' }}>New banner preview</span>
                        </div>
                    </div>
                ) : (
                    <div style={{ marginBottom: '20px' }}>
                        <p style={{ ...P, color: '#555', fontSize: '13px', fontStyle: 'italic' }}>
                            Current banner: <span style={{ color: '#888' }}>loyaltycardbanner2.png</span>
                        </p>
                        <img
                            src={`/loyaltycardbanner2.png?v=${Date.now()}`}
                            alt="Current banner"
                            style={{ width: '100%', maxHeight: '160px', objectFit: 'cover', borderRadius: '10px', marginTop: '8px', border: '1px solid rgba(255,255,255,0.06)' }}
                        />
                    </div>
                )}

                <input ref={fileInput} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleFileChange} style={{ display: 'none' }} />
                <button
                    onClick={() => fileInput.current?.click()}
                    style={{
                        ...P, background: 'rgba(255,255,255,0.05)', border: '1px dashed rgba(255,255,255,0.15)',
                        borderRadius: '12px', padding: '12px 20px', color: '#aaa', fontSize: '14px',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', width: '100%', justifyContent: 'center',
                        transition: 'all 0.2s',
                    }}
                    onMouseOver={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,45,120,0.4)'; (e.currentTarget as HTMLElement).style.color = '#FF2D78'; }}
                    onMouseOut={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.15)'; (e.currentTarget as HTMLElement).style.color = '#aaa'; }}
                >
                    <UploadCloud size={18} /> {file ? `Selected: ${file.name}` : 'Choose a new banner image'}
                </button>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                {/* Upload banner only */}
                <button
                    onClick={() => handleSubmit(false)}
                    disabled={loading || !file}
                    style={{
                        ...P, background: file ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', padding: '16px 20px',
                        color: file ? '#fff' : '#444', fontSize: '14px', fontWeight: 600, cursor: file ? 'pointer' : 'not-allowed',
                        display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center',
                        transition: 'all 0.2s', opacity: loading ? 0.6 : 1,
                    }}
                >
                    <UploadCloud size={16} /> Update Banner Only
                    <span style={{ ...P, fontSize: '11px', color: '#555', display: 'block', marginTop: '2px' }}>(no push)</span>
                </button>

                {/* Upload banner + push all */}
                <button
                    onClick={() => handleSubmit(true)}
                    disabled={loading || (!file && stats?.deviceCount === 0)}
                    style={{
                        ...P,
                        background: loading ? 'rgba(255,45,120,0.3)' : 'linear-gradient(135deg, #FF2D78, #FF6BA8)',
                        border: 'none', borderRadius: '14px', padding: '16px 20px',
                        color: '#fff', fontSize: '14px', fontWeight: 700, cursor: loading ? 'wait' : 'pointer',
                        display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center',
                        boxShadow: '0 4px 20px rgba(255,45,120,0.3)', transition: 'all 0.2s',
                        opacity: loading ? 0.7 : 1,
                    }}
                >
                    {loading ? <><RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> Pushing...</> : <><Send size={16} /> {file ? 'Update Banner + Push All' : 'Push Update to All'}</>}
                </button>
            </div>

            {/* Result Banner */}
            {result && (
                <div style={{
                    borderRadius: '14px', padding: '16px 20px',
                    background: result.success ? 'rgba(0,212,120,0.08)' : 'rgba(255,45,120,0.08)',
                    border: `1px solid ${result.success ? 'rgba(0,212,120,0.25)' : 'rgba(255,45,120,0.25)'}`,
                    display: 'flex', gap: '12px', alignItems: 'flex-start',
                }}>
                    {result.success ? <CheckCircle size={20} color="#00D478" style={{ flexShrink: 0, marginTop: '1px' }} /> : <AlertCircle size={20} color="#FF2D78" style={{ flexShrink: 0, marginTop: '1px' }} />}
                    <div>
                        {result.success ? (
                            <>
                                <p style={{ ...P, fontWeight: 600, color: '#00D478', fontSize: '14px', marginBottom: '4px' }}>Done!</p>
                                <p style={{ ...P, color: '#aaa', fontSize: '13px' }}>
                                    {result.bannerUpdated && '✅ Banner updated on server. '}
                                    {result.pushedCount > 0 ? `📲 Push sent to ${result.pushedCount} card${result.pushedCount !== 1 ? 's' : ''} (${result.deviceCount} device${result.deviceCount !== 1 ? 's' : ''}).` : ''}
                                    {!result.bannerUpdated && result.pushedCount === 0 && 'No changes were made.'}
                                </p>
                                {result.pushedCount > 0 && (
                                    <p style={{ ...P, color: '#555', fontSize: '12px', marginTop: '4px' }}>
                                        Wallet will refresh within ~30 seconds on each device.
                                    </p>
                                )}
                            </>
                        ) : (
                            <p style={{ ...P, color: '#FF2D78', fontSize: '14px' }}>Error: {result.error || 'Something went wrong'}</p>
                        )}
                    </div>
                </div>
            )}

            {/* Info note */}
            <div style={{ marginTop: '24px', padding: '16px 20px', background: 'rgba(255,215,0,0.04)', border: '1px solid rgba(255,215,0,0.12)', borderRadius: '14px' }}>
                <p style={{ ...P, color: '#888', fontSize: '13px', lineHeight: 1.6 }}>
                    💡 <strong style={{ color: '#aaa' }}>Note:</strong> Only users who re-added their pass after the latest update will receive push notifications. Stamp count updates push automatically when a booking is marked complete.
                </p>
            </div>

            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
