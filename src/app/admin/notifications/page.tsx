'use client';

import { useEffect, useState, useCallback } from 'react';
import { Mail, MessageSquare, CheckCircle, XCircle, Clock, RefreshCw, AlertTriangle, Stethoscope, Send } from 'lucide-react';

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

type HealthGET = {
    pingram: {
        hasApiKey: boolean;
        apiKeyPrefix?: string;
        apiKeySuffix?: string;
        apiKeyMetadata?: Record<string, unknown>;
        baseUrl: string;
        fromNumber?: string;
        fromEmail?: string;
        fromName?: string;
    };
    resend: { hasApiKey: boolean; from?: string; deprecated?: boolean };
    owner: { phone?: string; notificationId?: string };
    serverTime: string;
};

type HealthPOST = {
    channel: 'sms' | 'email';
    target: { toNumber?: string; toId?: string; toEmail?: string };
    success?: boolean;
    reason?: string;
    errorCode?: string;
    trackingId?: string;
    rawResponse?: unknown;
    rawError?: unknown;
    response?: unknown;
    error?: string;
    errorDetail?: unknown;
    serverTime: string;
};

const EVENT_LABELS: Record<string, string> = {
    booking_received: 'New Booking',
    booking_confirmed: 'Confirmed',
    booking_rescheduled: 'Rescheduled',
    booking_cancelled: 'Cancelled',
    booking_completed: 'Completed',
    stamp_earned: 'Stamp Earned',
    email_verification: 'Email Verify',
    review_request: 'Review Request',
    manual_sms: 'Manual',
    manual_email: 'Manual Email',
    contract_invite: 'Contract Invite',
    contract_admin_sent: 'Contract Sent (Admin)',
    contract_admin_signed: 'Client Signed (Admin)',
    contract_received: 'Contract Received',
    contract_confirmed: 'Booking Confirmed',
    diagnostic_email: 'Diagnostic Email',
};

const ERROR_LABELS: Record<string, { label: string; color: string }> = {
    credits_exhausted: { label: 'Credits exhausted', color: '#FFB700' },
    invalid_number: { label: 'Invalid number', color: '#FF2D78' },
    invalid_email: { label: 'Invalid email', color: '#FF2D78' },
    domain_not_verified: { label: 'Domain not verified', color: '#FF2D78' },
    email_suppressed: { label: 'Email suppressed (bounce/complaint)', color: '#FF2D78' },
    network_error: { label: 'Network error', color: '#FF8C00' },
    unknown_error: { label: 'Unknown error', color: '#555' },
    no_api_key: { label: 'No API key on server', color: '#FFB700' },
    pingram_channel_disabled: { label: 'Pingram: channel disabled on type', color: '#FFB700' },
    pingram_type_not_configured: { label: 'Pingram: notification type not configured', color: '#FFB700' },
    pingram_user_unsubscribed: { label: 'Pingram: recipient unsubscribed', color: '#FF8C00' },
    pingram_sender_missing: { label: 'Pingram: sender not set', color: '#FFB700' },
    pingram_dispatch_failed: { label: 'Pingram: dispatch failed', color: '#FF2D78' },
};

export default function NotificationsPage() {
    const [logs, setLogs] = useState<Log[]>([]);
    const [summary, setSummary] = useState<Summary>({ sms: { sent: 0, failed: 0, skipped: 0 }, email: { sent: 0, failed: 0, skipped: 0 } });
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [typeFilter, setTypeFilter] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<string>('');

    // Diagnostic panel state
    const [health, setHealth] = useState<HealthGET | null>(null);
    const [diagResult, setDiagResult] = useState<HealthPOST | null>(null);
    const [diagRunning, setDiagRunning] = useState(false);
    const [diagPhone, setDiagPhone] = useState<string>('');
    const [diagEmail, setDiagEmail] = useState<string>('');
    const [diagChannel, setDiagChannel] = useState<'sms' | 'email'>('sms');
    const [panelOpen, setPanelOpen] = useState(false);

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

    const loadHealth = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/notifications/health');
            if (res.ok) {
                const d = await res.json();
                setHealth(d);
                if (!diagPhone && d?.owner?.phone) setDiagPhone(d.owner.phone);
                if (!diagEmail && d?.owner?.notificationId) setDiagEmail(d.owner.notificationId);
            }
        } catch (e) {
            console.error('[HEALTH FETCH ERROR]', e);
        }
    }, [diagPhone, diagEmail]);

    useEffect(() => { load(); }, [load]);
    useEffect(() => { loadHealth(); }, [loadHealth]);

    async function runDiagnostic() {
        setDiagRunning(true);
        setDiagResult(null);
        try {
            const body = diagChannel === 'email'
                ? { channel: 'email', toEmail: diagEmail || undefined }
                : { channel: 'sms', toNumber: diagPhone || undefined };
            const res = await fetch('/api/admin/notifications/health', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            const d = await res.json();
            setDiagResult(d);
            // After a diag run, refresh logs so the new row shows up
            load(true);
        } catch (e) {
            setDiagResult({ channel: diagChannel, target: {}, error: String(e), serverTime: new Date().toISOString() });
        } finally {
            setDiagRunning(false);
        }
    }

    const totalSMS = summary.sms.sent + summary.sms.failed + summary.sms.skipped;
    const smsHealthy = summary.sms.sent > 0 && summary.sms.sent >= summary.sms.failed + summary.sms.skipped;
    const smsBroken = totalSMS > 0 && summary.sms.sent === 0; // all SMS attempts have been skipped or failed
    const failedTotal = summary.sms.failed + summary.email.failed;

    return (
        <div style={{ maxWidth: '900px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#fff', fontSize: '22px', marginBottom: '4px' }}>Notification Logs</h1>
                    <p style={{ fontFamily: 'Poppins, sans-serif', color: '#555', fontSize: '13px' }}>{total} total notifications tracked</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => setPanelOpen(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: panelOpen ? 'rgba(255,45,120,0.12)' : 'rgba(255,255,255,0.06)', border: `1px solid ${panelOpen ? 'rgba(255,45,120,0.4)' : 'rgba(255,255,255,0.1)'}`, borderRadius: '10px', padding: '8px 14px', cursor: 'pointer', color: panelOpen ? '#FF2D78' : '#aaa', fontFamily: 'Poppins, sans-serif', fontSize: '13px' }}>
                        <Stethoscope size={14} />
                        Diagnostics
                    </button>
                    <button onClick={() => load(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '8px 14px', cursor: 'pointer', color: '#aaa', fontFamily: 'Poppins, sans-serif', fontSize: '13px' }}>
                        <RefreshCw size={14} style={{ animation: refreshing ? 'spin 0.7s linear infinite' : 'none' }} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Diagnostic Panel */}
            {panelOpen && (
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '18px 20px', marginBottom: '20px' }}>
                    <h2 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px', fontWeight: 600, color: '#fff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Stethoscope size={14} color="#FF2D78" /> Pingram Notification Diagnostics
                    </h2>

                    {/* Env snapshot */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10, marginBottom: 16 }}>
                        <EnvChip label="Pingram API Key" ok={!!health?.pingram.hasApiKey} value={health?.pingram.hasApiKey ? `${health.pingram.apiKeyPrefix}...${health.pingram.apiKeySuffix}` : 'MISSING'} />
                        <EnvChip label="Pingram Base URL" ok={!!health?.pingram.baseUrl} value={health?.pingram.baseUrl || '—'} />
                        <EnvChip label="From Phone" ok={!!health?.pingram.fromNumber} value={health?.pingram.fromNumber || 'not set'} />
                        <EnvChip label="From Email" ok={!!health?.pingram.fromEmail} value={health?.pingram.fromEmail || 'not set'} />
                        <EnvChip label="Owner Phone" ok={!!health?.owner.phone} value={health?.owner.phone || 'not set'} />
                        <EnvChip label="Owner Email" ok={!!health?.owner.notificationId} value={health?.owner.notificationId || 'not set'} />
                        {health?.pingram.apiKeyMetadata && (
                            <EnvChip label="Pingram Env ID" ok={true} value={String((health.pingram.apiKeyMetadata as { environmentId?: string }).environmentId || '—').slice(0, 20)} />
                        )}
                    </div>

                    {/* Channel toggle */}
                    <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                        <button
                            onClick={() => { setDiagChannel('sms'); setDiagResult(null); }}
                            style={{ fontFamily: 'Poppins, sans-serif', fontSize: 12, fontWeight: 600, padding: '6px 16px', borderRadius: '50px', cursor: 'pointer', background: diagChannel === 'sms' ? 'rgba(255,45,120,0.18)' : 'rgba(255,255,255,0.04)', color: diagChannel === 'sms' ? '#FF2D78' : '#666', border: diagChannel === 'sms' ? '1px solid rgba(255,45,120,0.4)' : '1px solid rgba(255,255,255,0.08)' }}
                        >
                            SMS
                        </button>
                        <button
                            onClick={() => { setDiagChannel('email'); setDiagResult(null); }}
                            style={{ fontFamily: 'Poppins, sans-serif', fontSize: 12, fontWeight: 600, padding: '6px 16px', borderRadius: '50px', cursor: 'pointer', background: diagChannel === 'email' ? 'rgba(255,45,120,0.18)' : 'rgba(255,255,255,0.04)', color: diagChannel === 'email' ? '#FF2D78' : '#666', border: diagChannel === 'email' ? '1px solid rgba(255,45,120,0.4)' : '1px solid rgba(255,255,255,0.08)' }}
                        >
                            Email
                        </button>
                    </div>

                    {/* Test send inputs */}
                    <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                        {diagChannel === 'sms' ? (
                            <input
                                type="tel"
                                placeholder="+17602905910"
                                value={diagPhone}
                                onChange={(e) => setDiagPhone(e.target.value)}
                                style={{ flex: '1 1 220px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px 12px', color: '#fff', fontFamily: 'Poppins, sans-serif', fontSize: 13 }}
                            />
                        ) : (
                            <input
                                type="email"
                                placeholder="info@glitzandglamours.com"
                                value={diagEmail}
                                onChange={(e) => setDiagEmail(e.target.value)}
                                style={{ flex: '1 1 220px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px 12px', color: '#fff', fontFamily: 'Poppins, sans-serif', fontSize: 13 }}
                            />
                        )}
                        <button
                            onClick={runDiagnostic}
                            disabled={diagRunning || (diagChannel === 'sms' ? !diagPhone : !diagEmail)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 6,
                                background: diagRunning ? 'rgba(255,255,255,0.04)' : 'linear-gradient(135deg,#FF2D78,#FF6AA7)',
                                border: 'none', borderRadius: '8px', padding: '8px 16px',
                                cursor: diagRunning || (diagChannel === 'sms' ? !diagPhone : !diagEmail) ? 'not-allowed' : 'pointer',
                                color: '#fff', fontFamily: 'Poppins, sans-serif', fontSize: 13, fontWeight: 600,
                                opacity: diagRunning || (diagChannel === 'sms' ? !diagPhone : !diagEmail) ? 0.5 : 1,
                            }}
                        >
                            <Send size={13} /> {diagRunning ? 'Sending...' : diagChannel === 'email' ? 'Send Test Email' : 'Send Test SMS'}
                        </button>
                    </div>
                    <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 11, color: '#666', margin: '0 0 12px' }}>
                        Sends a real <code style={{ color: '#FF2D78' }}>[DIAGNOSTIC]</code> {diagChannel === 'email' ? 'email' : 'SMS'} via the production server. Surfaces the raw Pingram response to confirm delivery.
                    </p>

                    {/* Diag result */}
                    {diagResult && (
                        <div style={{ background: 'rgba(0,0,0,0.4)', border: `1px solid ${diagResult.error || diagResult.errorCode ? 'rgba(255,45,120,0.4)' : 'rgba(0,212,120,0.3)'}`, borderRadius: 10, padding: 12, marginTop: 8 }}>
                            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 12, fontWeight: 600, color: diagResult.error || diagResult.errorCode ? '#FF2D78' : '#00D478', margin: '0 0 8px' }}>
                                {diagResult.error || diagResult.errorCode ? 'ERROR' : 'SUCCESS'} — {diagResult.channel?.toUpperCase()} → {diagResult.target?.toEmail || diagResult.target?.toNumber}
                            </p>
                            <pre style={{ fontFamily: 'ui-monospace, SFMono-Regular, monospace', fontSize: 11, color: '#ccc', margin: 0, maxHeight: 320, overflow: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                {JSON.stringify(diagResult, null, 2)}
                            </pre>
                            {diagResult.channel === 'sms' && (
                                <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 11, color: '#777', marginTop: 8, marginBottom: 0 }}>
                                    If <code>response.messages</code> is empty and success, the SMS was accepted. Cross-reference <code>trackingId</code> in Pingram → Logs.
                                </p>
                            )}
                            {diagResult.channel === 'email' && (
                                <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 11, color: '#777', marginTop: 8, marginBottom: 0 }}>
                                    Check your inbox for the diagnostic email. If success but no email arrives, check Pingram → Logs for the <code>trackingId</code> and confirm the domain is verified.
                                </p>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Broken-SMS banner (replaces false "green" signal) */}
            {smsBroken && (
                <div style={{ background: 'rgba(255,45,120,0.08)', border: '1px solid rgba(255,45,120,0.3)', borderRadius: '12px', padding: '14px 18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <AlertTriangle size={18} color="#FF2D78" style={{ flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                        <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', color: '#FF2D78', margin: 0, fontWeight: 600 }}>
                            SMS delivery is not working. {totalSMS} attempt{totalSMS > 1 ? 's' : ''} — 0 actually sent.
                        </p>
                        <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#aaa', margin: '2px 0 0' }}>
                            Click Diagnostics above to see the raw Pingram response and fix the root cause.
                        </p>
                    </div>
                </div>
            )}

            {/* Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px', marginBottom: '24px' }}>
                <StatCard
                    icon={<MessageSquare size={18} color={smsBroken ? '#FF2D78' : smsHealthy ? '#00D478' : '#FFB700'} />}
                    label="SMS Sent"
                    value={summary.sms.sent}
                    color={smsBroken ? '#FF2D78' : smsHealthy ? '#00D478' : '#FFB700'}
                    urgent={smsBroken}
                    subtext={smsBroken ? `${summary.sms.failed + summary.sms.skipped} not delivered` : undefined}
                />
                <StatCard icon={<Mail size={18} color="#FF2D78" />} label="Emails Sent" value={summary.email.sent} color="#FF2D78" />
                <StatCard icon={<XCircle size={18} color="#FFB700" />} label="Failed Total" value={failedTotal} color="#FFB700" urgent={failedTotal > 0} />
                <StatCard icon={<Clock size={18} color="#555" />} label="Skipped" value={summary.sms.skipped + summary.email.skipped} color="#555" />
            </div>

            {/* Generic failure banner (kept for when some-but-not-all fail) */}
            {failedTotal > 0 && !smsBroken && (
                <div style={{ background: 'rgba(255,183,0,0.08)', border: '1px solid rgba(255,183,0,0.3)', borderRadius: '12px', padding: '14px 18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <AlertTriangle size={18} color="#FFB700" style={{ flexShrink: 0 }} />
                    <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', color: '#FFB700', margin: 0 }}>
                        <strong>{failedTotal} notification{failedTotal > 1 ? 's' : ''} failed</strong> — check the error pills below. May indicate exhausted Pingram / Resend credits, or a template misconfiguration.
                    </p>
                </div>
            )}

            {/* Filters */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                {(['', 'sms', 'email'] as const).map(t => (
                    <FilterBtn key={t || 'all'} label={t === '' ? 'All Types' : t === 'sms' ? 'SMS' : 'Email'} active={typeFilter === t} onClick={() => setTypeFilter(t)} />
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

                            <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: '#555', display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: errInfo || log.message ? '6px' : 0 }}>
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>{customerName}</span>
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>{serviceName}</span>
                                {log.recipient && <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '160px' }}>→ {log.recipient}</span>}
                            </div>

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

function StatCard({ icon, label, value, color, urgent, subtext }: { icon: React.ReactNode; label: string; value: number; color: string; urgent?: boolean; subtext?: string }) {
    return (
        <div style={{
            background: urgent ? `${color}10` : 'rgba(255,255,255,0.03)',
            border: `1px solid ${urgent ? `${color}55` : 'rgba(255,255,255,0.06)'}`,
            borderRadius: '14px', padding: '18px 20px',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                {icon}
                <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#666', fontWeight: 500 }}>{label}</span>
            </div>
            <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: '28px', fontWeight: 700, color }}>{value.toLocaleString()}</div>
            {subtext && (
                <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color, opacity: 0.8, marginTop: 4 }}>{subtext}</div>
            )}
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

function EnvChip({ label, ok, value }: { label: string; ok: boolean; value: string }) {
    return (
        <div style={{ background: 'rgba(0,0,0,0.25)', border: `1px solid ${ok ? 'rgba(0,212,120,0.25)' : 'rgba(255,45,120,0.3)'}`, borderRadius: 8, padding: '8px 10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                {ok ? <CheckCircle size={11} color="#00D478" /> : <XCircle size={11} color="#FF2D78" />}
                <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#888', fontWeight: 600 }}>{label}</span>
            </div>
            <div style={{ fontFamily: 'ui-monospace, SFMono-Regular, monospace', fontSize: 11, color: ok ? '#ccc' : '#FF2D78', wordBreak: 'break-all' }}>{value}</div>
        </div>
    );
}
