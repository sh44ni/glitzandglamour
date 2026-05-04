'use client';
import { useEffect, useState, useCallback } from 'react';
import { Megaphone, Plus, Send, CheckCircle, XCircle, Clock, BarChart2, Trash2, RefreshCw, Users, MessageSquare, TrendingUp, X, Filter } from 'lucide-react';
import CampaignCreator from './CampaignCreator';

const S = { fontFamily: 'Poppins, sans-serif' } as const;

type Campaign = {
    id: string; name: string; message: string; status: string;
    totalRecipients: number; sentCount: number; failedCount: number;
    sentAt: string | null; completedAt: string | null; createdAt: string;
    _count: { recipients: number };
};

type Recipient = {
    id: string; name: string; phone: string; email: string | null;
    hasConsent: boolean; status: string; error: string | null; sentAt: string | null;
};

const STATUS_CFG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
    DRAFT:     { label: 'Draft',     color: '#888',    bg: 'rgba(136,136,136,0.1)',  icon: <Clock size={11} /> },
    SENDING:   { label: 'Sending…',  color: '#FFB700', bg: 'rgba(255,183,0,0.1)',    icon: <RefreshCw size={11} style={{ animation: 'spin 0.8s linear infinite' }} /> },
    COMPLETED: { label: 'Completed', color: '#00D478', bg: 'rgba(0,212,120,0.1)',    icon: <CheckCircle size={11} /> },
    FAILED:    { label: 'Failed',    color: '#FF2D78', bg: 'rgba(255,45,120,0.1)',   icon: <XCircle size={11} /> },
};

const RECIP_CFG: Record<string, { color: string; icon: React.ReactNode }> = {
    sent:    { color: '#00D478', icon: <CheckCircle size={11} /> },
    failed:  { color: '#FF2D78', icon: <XCircle size={11} /> },
    pending: { color: '#888',    icon: <Clock size={11} /> },
};

export default function CampaignsPage() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreator, setShowCreator] = useState(false);
    const [analytics, setAnalytics] = useState<Campaign | null>(null);
    const [recipients, setRecipients] = useState<Recipient[]>([]);
    const [loadingRecipients, setLoadingRecipients] = useState(false);
    const [recipFilter, setRecipFilter] = useState<'all' | 'sent' | 'failed'>('all');
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const load = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        const d = await fetch('/api/admin/campaigns').then(r => r.json());
        setCampaigns(d.campaigns || []);
        setLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);

    // Auto-refresh if any campaign is SENDING
    useEffect(() => {
        const hasSending = campaigns.some(c => c.status === 'SENDING');
        if (!hasSending) return;
        const t = setInterval(() => load(true), 3000);
        return () => clearInterval(t);
    }, [campaigns, load]);

    async function openAnalytics(c: Campaign) {
        setAnalytics(c);
        setLoadingRecipients(true);
        const d = await fetch(`/api/admin/campaigns/recipients?campaignId=${c.id}`).then(r => r.json());
        setRecipients(d.recipients || []);
        setLoadingRecipients(false);
    }

    async function deleteCampaign(id: string) {
        if (!window.confirm('Delete this campaign and all its data?')) return;
        setDeletingId(id);
        await fetch(`/api/admin/campaigns?id=${id}`, { method: 'DELETE' });
        setDeletingId(null);
        load(true);
    }

    const totalSent     = campaigns.reduce((s, c) => s + c.sentCount, 0);
    const totalFailed   = campaigns.reduce((s, c) => s + c.failedCount, 0);
    const totalContacts = campaigns.reduce((s, c) => s + c.totalRecipients, 0);
    const deliveryRate  = totalContacts > 0 ? Math.round((totalSent / totalContacts) * 100) : 0;

    const filteredRecipients = recipients.filter(r => recipFilter === 'all' || r.status === recipFilter);

    return (
        <div style={{ maxWidth: 880 }}>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes pulse { 0%,100%{opacity:0.4} 50%{opacity:0.8} }`}</style>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <h1 style={{ ...S, fontWeight: 700, color: '#fff', fontSize: 22, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Megaphone size={20} color="#FF2D78" /> Campaigns
                    </h1>
                    <p style={{ ...S, color: '#555', fontSize: 13 }}>{campaigns.length} campaign{campaigns.length !== 1 ? 's' : ''} · {totalContacts} total sends</p>
                </div>
                <button onClick={() => setShowCreator(true)} style={{ ...S, background: 'linear-gradient(135deg,#FF2D78,#7928CA)', border: 'none', borderRadius: 12, padding: '10px 18px', cursor: 'pointer', color: '#fff', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Plus size={15} /> New Campaign
                </button>
            </div>

            {/* Stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px,1fr))', gap: 10, marginBottom: 24 }}>
                {[
                    { icon: <Megaphone size={16} color="#FF2D78" />, label: 'Campaigns', val: campaigns.length },
                    { icon: <Users size={16} color="#7928CA" />, label: 'Total Reached', val: totalContacts },
                    { icon: <CheckCircle size={16} color="#00D478" />, label: 'Delivered', val: totalSent, color: '#00D478' },
                    { icon: <TrendingUp size={16} color="#FFB700" />, label: 'Delivery Rate', val: `${deliveryRate}%`, color: deliveryRate > 80 ? '#00D478' : deliveryRate > 50 ? '#FFB700' : '#FF2D78' },
                ].map(({ icon, label, val, color }) => (
                    <div key={label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '16px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>{icon}<span style={{ ...S, fontSize: 12, color: '#555' }}>{label}</span></div>
                        <div style={{ ...S, fontSize: 26, fontWeight: 700, color: (color as string) || '#fff' }}>{val}</div>
                    </div>
                ))}
            </div>

            {/* Campaign list */}
            <div style={{ display: 'grid', gap: 10 }}>
                {loading ? Array.from({ length: 3 }).map((_, i) => <div key={i} style={{ height: 90, borderRadius: 14, background: 'rgba(255,255,255,0.04)', animation: 'pulse 1.5s infinite' }} />) :
                campaigns.length === 0 ? (
                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: '48px 24px', textAlign: 'center' }}>
                        <Megaphone size={36} color="#2a2a2a" style={{ marginBottom: 12 }} />
                        <p style={{ ...S, color: '#555', fontSize: 14 }}>No campaigns yet. Create your first one!</p>
                        <button onClick={() => setShowCreator(true)} style={{ ...S, marginTop: 16, background: 'linear-gradient(135deg,#FF2D78,#7928CA)', border: 'none', borderRadius: 10, padding: '10px 20px', cursor: 'pointer', color: '#fff', fontSize: 13, fontWeight: 700 }}>
                            Create Campaign
                        </button>
                    </div>
                ) : campaigns.map(c => {
                    const cfg = STATUS_CFG[c.status] || STATUS_CFG.DRAFT;
                    const pct = c.totalRecipients > 0 ? Math.round((c.sentCount / c.totalRecipients) * 100) : 0;
                    const failPct = c.totalRecipients > 0 ? Math.round((c.failedCount / c.totalRecipients) * 100) : 0;
                    return (
                        <div key={c.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '16px 18px', transition: 'border-color 0.2s' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                                        <h3 style={{ ...S, fontWeight: 700, color: '#fff', fontSize: 14, margin: 0 }}>{c.name}</h3>
                                        <span style={{ ...S, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 50, display: 'inline-flex', alignItems: 'center', gap: 4, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}44` }}>
                                            {cfg.icon} {cfg.label}
                                        </span>
                                    </div>
                                    <p style={{ ...S, color: '#444', fontSize: 12, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '90%' }}>{c.message}</p>
                                </div>
                                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                                    {c.status !== 'DRAFT' && (
                                        <button onClick={() => openAnalytics(c)} style={{ ...S, background: 'rgba(255,45,120,0.1)', border: '1px solid rgba(255,45,120,0.25)', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: '#FF2D78', fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <BarChart2 size={12} /> Analytics
                                        </button>
                                    )}
                                    <button onClick={() => deleteCampaign(c.id)} disabled={deletingId === c.id || c.status === 'SENDING'} style={{ background: 'rgba(255,45,60,0.08)', border: '1px solid rgba(255,45,60,0.2)', borderRadius: 8, padding: '6px 8px', cursor: deletingId === c.id || c.status === 'SENDING' ? 'not-allowed' : 'pointer', color: '#ff6b6b', display: 'flex', alignItems: 'center', opacity: c.status === 'SENDING' ? 0.4 : 1 }}>
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            </div>
                            {/* Stats row */}
                            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: c.status !== 'DRAFT' ? 10 : 0 }}>
                                {[
                                    { label: 'Recipients', val: c.totalRecipients, color: '#888' },
                                    { label: 'Sent', val: c.sentCount, color: '#00D478' },
                                    { label: 'Failed', val: c.failedCount, color: c.failedCount > 0 ? '#FF2D78' : '#555' },
                                ].map(({ label, val, color }) => (
                                    <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                        <span style={{ ...S, fontSize: 10, color: '#444', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{label}</span>
                                        <span style={{ ...S, fontSize: 16, fontWeight: 700, color }}>{val}</span>
                                    </div>
                                ))}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    <span style={{ ...S, fontSize: 10, color: '#444', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Created</span>
                                    <span style={{ ...S, fontSize: 12, color: '#555' }}>{new Date(c.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                            {/* Progress bar */}
                            {c.status !== 'DRAFT' && c.totalRecipients > 0 && (
                                <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 4, height: 6, overflow: 'hidden' }}>
                                    <div style={{ height: '100%', display: 'flex' }}>
                                        <div style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#00D478,#00B860)', transition: 'width 0.5s' }} />
                                        <div style={{ width: `${failPct}%`, background: '#FF2D78', transition: 'width 0.5s' }} />
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Analytics Modal */}
            {analytics && (
                <div onClick={e => e.target === e.currentTarget && setAnalytics(null)} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
                    <div style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, width: '100%', maxWidth: 640, maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 56px rgba(0,0,0,0.7)' }}>
                        {/* Modal header */}
                        <div style={{ padding: '20px 20px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <h2 style={{ ...S, fontWeight: 700, color: '#fff', fontSize: 16, margin: 0 }}>{analytics.name}</h2>
                                    <p style={{ ...S, color: '#555', fontSize: 12, marginTop: 3 }}>Campaign Analytics · {new Date(analytics.createdAt).toLocaleDateString()}</p>
                                </div>
                                <button onClick={() => setAnalytics(null)} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#888' }}><X size={15} /></button>
                            </div>
                            {/* Mini stat row */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginTop: 14 }}>
                                {[
                                    { label: 'Total', val: analytics.totalRecipients, color: '#fff' },
                                    { label: 'Sent', val: analytics.sentCount, color: '#00D478' },
                                    { label: 'Failed', val: analytics.failedCount, color: analytics.failedCount > 0 ? '#FF2D78' : '#555' },
                                    { label: 'Rate', val: analytics.totalRecipients > 0 ? `${Math.round((analytics.sentCount / analytics.totalRecipients) * 100)}%` : '—', color: '#FFB700' },
                                ].map(({ label, val, color }) => (
                                    <div key={label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '10px 12px' }}>
                                        <p style={{ ...S, color: '#555', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 3 }}>{label}</p>
                                        <p style={{ ...S, fontWeight: 700, color, fontSize: 20, margin: 0 }}>{val}</p>
                                    </div>
                                ))}
                            </div>
                            {/* Delivery bar */}
                            {analytics.totalRecipients > 0 && (
                                <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 4, height: 6, marginTop: 12, overflow: 'hidden' }}>
                                    <div style={{ height: '100%', display: 'flex' }}>
                                        <div style={{ width: `${Math.round((analytics.sentCount / analytics.totalRecipients) * 100)}%`, background: 'linear-gradient(90deg,#00D478,#00B860)', transition: 'width 0.5s' }} />
                                        <div style={{ width: `${Math.round((analytics.failedCount / analytics.totalRecipients) * 100)}%`, background: '#FF2D78' }} />
                                    </div>
                                </div>
                            )}
                        </div>
                        {/* Message preview */}
                        <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', flexShrink: 0, background: 'rgba(255,45,120,0.04)' }}>
                            <p style={{ ...S, fontSize: 10, color: '#FF2D78', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Message Sent</p>
                            <p style={{ ...S, fontSize: 13, color: '#ccc', lineHeight: 1.5, margin: 0 }}>{analytics.message}</p>
                        </div>
                        {/* Filter */}
                        <div style={{ padding: '12px 20px 0', display: 'flex', gap: 6, flexShrink: 0 }}>
                            {(['all', 'sent', 'failed'] as const).map(f => (
                                <button key={f} onClick={() => setRecipFilter(f)} style={{ ...S, fontSize: 11, fontWeight: 600, padding: '5px 12px', borderRadius: 50, cursor: 'pointer', border: 'none', background: recipFilter === f ? (f === 'failed' ? 'rgba(255,45,120,0.15)' : f === 'sent' ? 'rgba(0,212,120,0.12)' : 'rgba(255,45,120,0.1)') : 'rgba(255,255,255,0.05)', color: recipFilter === f ? (f === 'failed' ? '#FF2D78' : f === 'sent' ? '#00D478' : '#FF2D78') : '#555' }}>
                                    {f.charAt(0).toUpperCase() + f.slice(1)} {f !== 'all' ? `(${recipients.filter(r => r.status === f).length})` : `(${recipients.length})`}
                                </button>
                            ))}
                        </div>
                        {/* Recipient list */}
                        <div style={{ overflowY: 'auto', flex: 1, padding: '12px 20px 20px' }}>
                            {loadingRecipients ? Array.from({ length: 5 }).map((_, i) => <div key={i} style={{ height: 52, borderRadius: 10, background: 'rgba(255,255,255,0.04)', marginBottom: 6, animation: 'pulse 1.5s infinite' }} />) :
                            filteredRecipients.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '30px 0' }}>
                                    <MessageSquare size={28} color="#2a2a2a" />
                                    <p style={{ ...S, color: '#333', fontSize: 13, marginTop: 8 }}>No recipients in this view</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    {filteredRecipients.map(r => {
                                        const rc = RECIP_CFG[r.status] || RECIP_CFG.pending;
                                        return (
                                            <div key={r.id} style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${r.status === 'sent' ? 'rgba(0,212,120,0.1)' : r.status === 'failed' ? 'rgba(255,45,120,0.15)' : 'rgba(255,255,255,0.05)'}`, borderRadius: 10, padding: '10px 13px', display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <p style={{ ...S, fontWeight: 600, color: '#ddd', fontSize: 13, margin: 0 }}>{r.name}</p>
                                                    <p style={{ ...S, color: '#555', fontSize: 11, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.phone}{r.email ? ` · ${r.email}` : ''}</p>
                                                    {r.error && <p style={{ ...S, color: '#FF2D78', fontSize: 10, margin: '2px 0 0', fontStyle: 'italic' }}>{r.error}</p>}
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                                                    <span style={{ ...S, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 50, display: 'inline-flex', alignItems: 'center', gap: 4, color: rc.color, background: `${rc.color}18`, border: `1px solid ${rc.color}44` }}>
                                                        {rc.icon} {r.status}
                                                    </span>
                                                    <span style={{ ...S, fontSize: 10, color: r.hasConsent ? '#00D478' : '#FFB700' }}>{r.hasConsent ? '✓ Consented' : '⚠ No consent'}</span>
                                                    {r.sentAt && <span style={{ ...S, fontSize: 10, color: '#333' }}>{new Date(r.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {showCreator && <CampaignCreator onClose={() => setShowCreator(false)} onCreated={() => load(true)} />}
        </div>
    );
}
