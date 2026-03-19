'use client';

import { useEffect, useState, useCallback } from 'react';
import { Mail, MessageSquare, CheckCircle, XCircle, Clock, RefreshCw, AlertTriangle } from 'lucide-react';

type Log = {
    id: string;
    type: 'sms' | 'email';
    event: string;
    recipient?: string;
    status: 'sent' | 'failed' | 'skipped';
    error?: string;
    message?: string;
    sentAt: string;
    booking?: {
        guestName?: string;
        user?: { name: string };
        service?: { name: string };
    };
};

type Summary = {
    sms: { sent: number; failed: number; skipped: number };
    email: { sent: number; failed: number; skipped: number };
};

const EVENT_LABELS: Record<string, string> = {
    booking_received: 'New Booking',
    booking_confirmed: 'Confirmed',
    booking_rescheduled: 'Rescheduled',
    booking_cancelled: 'Cancelled',
    stamp_earned: 'Stamp Earned',
    email_verification: 'Email Verify',
};

const ERROR_LABELS: Record<string, { label: string; color: string }> = {
    credits_exhausted: { label: '⚠️ Credits exhausted', color: '#FFB700' },
    invalid_number: { label: 'Invalid number', color: '#FF2D78' },
    invalid_email: { label: 'Invalid email', color: '#FF2D78' },
    domain_not_verified: { label: 'Domain not verified', color: '#FF2D78' },
    network_error: { label: 'Network error', color: '#FF8C00' },
    unknown_error: { label: 'Unknown error', color: '#555' },
};

export default function NotificationsPage() {
    const [logs, setLogs] = useState<Log[]>([]);
    const [summary, setSummary] = useState<Summary>({ sms: { sent: 0, failed: 0, skipped: 0 }, email: { sent: 0, failed: 0, skipped: 0 } });
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [typeFilter, setTypeFilter] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<string>('');

    const load = useCallback(async (silent = false) => {
        if (!silent) setLoading(true); else setRefreshing(true);
        const params = new URLSearchParams();
        if (typeFilter) params.set('type', typeFilter);
        if (statusFilter) params.set('status', statusFilter);
        const res = await fetch(`/api/admin/notifications?${params}`);
        if (res.ok) {
            const d = await res.json();
            setLogs(d.logs || []);
            setSummary(d.summary);
            setTotal(d.total || 0);
        }
        setLoading(false);
        setRefreshing(false);
    }, [typeFilter, statusFilter]);

    useEffect(() => { load(); }, [load]);

    const totalSMS = summary.sms.sent + summary.sms.failed + summary.sms.skipped;
    const totalEmail = summary.email.sent + summary.email.failed + summary.email.skipped;
    const failedTotal = summary.sms.failed + summary.email.failed;

    return (
        <div style={{ maxWidth: '900px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#fff', fontSize: '22px', marginBottom: '4px' }}>Notification Logs</h1>
                    <p style={{ fontFamily: 'Poppins, sans-serif', color: '#555', fontSize: '13px' }}>{total} total notifications tracked</p>
                </div>
                <button onClick={() => load(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '8px 14px', cursor: 'pointer', color: '#aaa', fontFamily: 'Poppins, sans-serif', fontSize: '13px' }}>
                    <RefreshCw size={14} style={{ animation: refreshing ? 'spin 0.7s linear infinite' : 'none' }} />
                    Refresh
                </button>
            </div>

            {/* Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px', marginBottom: '24px' }}>
                <StatCard icon={<MessageSquare size={18} color="#00D478" />} label="SMS Sent" value={summary.sms.sent} color="#00D478" />
                <StatCard icon={<Mail size={18} color="#FF2D78" />} label="Emails Sent" value={summary.email.sent} color="#FF2D78" />
                <StatCard icon={<XCircle size={18} color="#FFB700" />} label="Failed Total" value={failedTotal} color="#FFB700" urgent={failedTotal > 0} />
                <StatCard icon={<Clock size={18} color="#555" />} label="Skipped" value={summary.sms.skipped + summary.email.skipped} color="#555" />
            </div>

            {/* Credit Warning */}
            {failedTotal > 0 && (
                <div style={{ background: 'rgba(255,183,0,0.08)', border: '1px solid rgba(255,183,0,0.3)', borderRadius: '12px', padding: '14px 18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <AlertTriangle size={18} color="#FFB700" style={{ flexShrink: 0 }} />
                    <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', color: '#FFB700', margin: 0 }}>
                        <strong>{failedTotal} notification{failedTotal > 1 ? 's' : ''} failed</strong> — check logs below. This may indicate exhausted Pingram or Resend credits.
                    </p>
                </div>
            )}

            {/* Filters */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                {(['', 'sms', 'email'] as const).map(t => (
                    <FilterBtn key={t || 'all'} label={t === '' ? 'All Types' : t === 'sms' ? '💬 SMS' : '📧 Email'} active={typeFilter === t} onClick={() => setTypeFilter(t)} />
                ))}
                <div style={{ width: 1, background: 'rgba(255,255,255,0.08)', margin: '0 4px' }} />
                {(['', 'sent', 'failed', 'skipped'] as const).map(s => (
                    <FilterBtn key={s || 'all-status'} label={s === '' ? 'All Status' : s} active={statusFilter === s} onClick={() => setStatusFilter(s)}
                        color={s === 'sent' ? '#00D478' : s === 'failed' ? '#FF2D78' : s === 'skipped' ? '#555' : undefined} />
                ))}
            </div>

            {/* Log Table */}
            <div style={{ display: 'grid', gap: '8px' }}>
                {loading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="skeleton" style={{ height: 72, borderRadius: 12 }} />
                    ))
                ) : logs.length === 0 ? (
                    <div className="glass" style={{ padding: '40px', textAlign: 'center', borderRadius: '16px' }}>
                        <p style={{ fontFamily: 'Poppins, sans-serif', color: '#555' }}>No notifications logged yet</p>
                    </div>
                ) : logs.map(log => {
                    const customerName = log.booking?.user?.name || log.booking?.guestName || '—';
                    const serviceName = log.booking?.service?.name || '—';
                    const errInfo = log.error ? ERROR_LABELS[log.error] || { label: log.error, color: '#888' } : null;

                    return (
                        <div key={log.id} style={{
                            background: 'rgba(255,255,255,0.03)',
                            border: `1px solid ${log.status === 'failed' ? 'rgba(255,45,120,0.2)' : 'rgba(255,255,255,0.06)'}`,
                            borderRadius: '12px', padding: '12px 14px',
                        }}>
                            {/* Row 1: icon + type/event + status badge + time */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
                                {log.type === 'sms'
                                    ? <MessageSquare size={14} color={log.status === 'sent' ? '#00D478' : log.status === 'failed' ? '#FF2D78' : '#555'} style={{ flexShrink: 0 }} />
                                    : <Mail size={14} color={log.status === 'sent' ? '#FF2D78' : log.status === 'failed' ? '#FFB700' : '#555'} style={{ flexShrink: 0 }} />}
                                <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, color: '#fff', fontSize: '12px' }}>
                                    {log.type.toUpperCase()} — {EVENT_LABELS[log.event] || log.event}
                                </span>
                                <StatusBadge status={log.status} />
                                <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: '#444', marginLeft: 'auto', whiteSpace: 'nowrap' }}>
                                    {new Date(log.sentAt).toLocaleDateString()} {new Date(log.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>

                            {/* Row 2: customer + service */}
                            <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: '#555', display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: errInfo || log.message ? '6px' : 0 }}>
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>👤 {customerName}</span>
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>💅 {serviceName}</span>
                                {log.recipient && <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '160px' }}>→ {log.recipient}</span>}
                            </div>

                            {/* Row 3: error badge + message preview */}
                            {(errInfo || log.message) && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    {errInfo && (
                                        <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: errInfo.color, background: `${errInfo.color}18`, border: `1px solid ${errInfo.color}44`, borderRadius: '50px', padding: '2px 8px', alignSelf: 'flex-start' }}>
                                            {errInfo.label}
                                        </span>
                                    )}
                                    {log.message && (
                                        <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: '#444', fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>
                                            {log.message}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

function StatCard({ icon, label, value, color, urgent }: { icon: React.ReactNode; label: string; value: number; color: string; urgent?: boolean }) {
    return (
        <div style={{
            background: urgent && value > 0 ? 'rgba(255,183,0,0.06)' : 'rgba(255,255,255,0.03)',
            border: `1px solid ${urgent && value > 0 ? 'rgba(255,183,0,0.25)' : 'rgba(255,255,255,0.06)'}`,
            borderRadius: '14px', padding: '18px 20px',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                {icon}
                <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#666', fontWeight: 500 }}>{label}</span>
            </div>
            <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: '28px', fontWeight: 700, color }}>{value.toLocaleString()}</div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const cfg = status === 'sent'
        ? { color: '#00D478', icon: <CheckCircle size={10} />, label: 'Sent' }
        : status === 'failed'
            ? { color: '#FF2D78', icon: <XCircle size={10} />, label: 'Failed' }
            : { color: '#555', icon: <Clock size={10} />, label: 'Skipped' };
    return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontFamily: 'Poppins, sans-serif', fontSize: '10px', fontWeight: 600, color: cfg.color, background: `${cfg.color}18`, border: `1px solid ${cfg.color}44`, borderRadius: '50px', padding: '2px 8px' }}>
            {cfg.icon} {cfg.label}
        </span>
    );
}

function FilterBtn({ label, active, onClick, color }: { label: string; active: boolean; onClick: () => void; color?: string }) {
    const activeColor = color || '#FF2D78';
    return (
        <button onClick={onClick} style={{
            fontFamily: 'Poppins, sans-serif', fontSize: '12px', fontWeight: 600,
            padding: '6px 14px', borderRadius: '50px', cursor: 'pointer', transition: 'all 0.2s',
            background: active ? `${activeColor}22` : 'rgba(255,255,255,0.04)',
            color: active ? activeColor : '#555',
            border: active ? `1px solid ${activeColor}55` : '1px solid rgba(255,255,255,0.08)',
        }}>
            {label}
        </button>
    );
}
