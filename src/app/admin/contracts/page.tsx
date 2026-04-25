'use client';

import { useCallback, useEffect, useState } from 'react';
import { Copy, CheckCircle, Clock, Link2, ExternalLink, Plus, Send, FileSignature, Users } from 'lucide-react';
import styles from './contracts.module.css';
import SpecialEventAdminForm from './SpecialEventAdminForm';
import FinalizeStudioPanel from './FinalizeStudioPanel';
import SpecialEventClients from './SpecialEventClients';

type Lifecycle = 'DRAFT' | 'SENT' | 'CLIENT_SIGNED' | 'SIGNED';

type InviteRow = {
    id: string;
    token: string;
    label: string | null;
    clientHintName: string | null;
    clientHintEmail: string | null;
    expiresAt: string;
    status: 'PENDING' | 'COMPLETED';
    lifecycleStatus: Lifecycle;
    isExpired: boolean;
    completedAt: string | null;
    referenceCode: string | null;
    pdfKey: string | null;
    createdAt: string;
    isSpecialEvent: boolean;
    contractNumber: string | null;
    sentAt: string | null;
    clientSignedAt: string | null;
    adminSignedAt: string | null;
    retainerReceived: boolean;
};

function StatusBadge({ row }: { row: InviteRow }) {
    if (row.isSpecialEvent) {
        const ls = row.lifecycleStatus;
        if (ls === 'SIGNED') {
            return (
                <span
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#00D478',
                        background: 'rgba(0,212,120,0.1)',
                        border: '1px solid rgba(0,212,120,0.3)',
                        borderRadius: '50px',
                        padding: '3px 10px',
                    }}
                >
                    <CheckCircle size={10} /> SIGNED
                </span>
            );
        }
        if (ls === 'CLIENT_SIGNED') {
            return (
                <span
                    style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#5c9ded',
                        background: 'rgba(92,157,237,0.12)',
                        border: '1px solid rgba(92,157,237,0.35)',
                        borderRadius: '50px',
                        padding: '3px 10px',
                    }}
                >
                    Client signed
                </span>
            );
        }
        if (ls === 'DRAFT') {
            return (
                <span
                    style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#c9a227',
                        background: 'rgba(201,162,39,0.12)',
                        border: '1px solid rgba(201,162,39,0.35)',
                        borderRadius: '50px',
                        padding: '3px 10px',
                    }}
                >
                    Draft
                </span>
            );
        }
        if (ls === 'SENT') {
            return (
                <span
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#FF6BA8',
                        background: 'rgba(255,45,120,0.1)',
                        border: '1px solid rgba(255,45,120,0.25)',
                        borderRadius: '50px',
                        padding: '3px 10px',
                    }}
                >
                    <Send size={10} /> Sent
                </span>
            );
        }
    }
    if (row.status === 'COMPLETED') {
        return (
            <span
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#00D478',
                    background: 'rgba(0,212,120,0.1)',
                    border: '1px solid rgba(0,212,120,0.3)',
                    borderRadius: '50px',
                    padding: '3px 10px',
                }}
            >
                <CheckCircle size={10} /> Signed
            </span>
        );
    }
    if (row.isExpired) {
        return (
            <span
                style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#888',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '50px',
                    padding: '3px 10px',
                }}
            >
                Expired
            </span>
        );
    }
    return (
        <span
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11px',
                fontWeight: 700,
                color: '#FF6BA8',
                background: 'rgba(255,45,120,0.1)',
                border: '1px solid rgba(255,45,120,0.25)',
                borderRadius: '50px',
                padding: '3px 10px',
            }}
        >
            <Clock size={10} /> Awaiting client
        </span>
    );
}

export default function AdminContractsPage() {
    const [invites, setInvites] = useState<InviteRow[]>([]);
    const [origin, setOrigin] = useState('');
    const [loading, setLoading] = useState(true);
    const [finalizeId, setFinalizeId] = useState<string | null>(null);
    const [creating, setCreating] = useState(false);
    const [label, setLabel] = useState('');
    const [clientHintName, setClientHintName] = useState('');
    const [clientHintEmail, setClientHintEmail] = useState('');
    const [expiresInDays, setExpiresInDays] = useState(14);
    const [lastCreatedUrl, setLastCreatedUrl] = useState('');
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'contracts' | 'clients'>('contracts');

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/contracts');
            if (res.ok) {
                const d = await res.json();
                setInvites(d.invites || []);
                setOrigin(d.origin || (typeof window !== 'undefined' ? window.location.origin : ''));
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    async function createInvite() {
        setCreating(true);
        setLastCreatedUrl('');
        try {
            const res = await fetch('/api/admin/contracts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    label: label.trim() || undefined,
                    clientHintName: clientHintName.trim() || undefined,
                    clientHintEmail: clientHintEmail.trim() || undefined,
                    expiresInDays,
                }),
            });
            const d = await res.json();
            if (res.ok && d.invite?.signUrl) {
                setLastCreatedUrl(d.invite.signUrl);
                setLabel('');
                setClientHintName('');
                setClientHintEmail('');
                load();
            }
        } finally {
            setCreating(false);
        }
    }

    function signUrlForToken(t: string) {
        const base = origin || (typeof window !== 'undefined' ? window.location.origin : '');
        return `${base}/sign/${t}`;
    }

    async function copyText(text: string, id: string) {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        } catch {
            /* ignore */
        }
    }

    const inputStyle: React.CSSProperties = {
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '12px',
        padding: '12px 16px',
        color: '#fff',
        fontFamily: 'Poppins, sans-serif',
        width: '100%',
        boxSizing: 'border-box',
    };

    return (
        <div className={styles.root}>
            <h1
                style={{
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: 'clamp(22px,4vw,28px)',
                    fontWeight: 800,
                    marginBottom: '8px',
                    background: 'linear-gradient(135deg, #FF2D78, #FF6BA8)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                }}
            >
                Special Events
            </h1>
            <p style={{ color: '#666', fontFamily: 'Poppins, sans-serif', fontSize: '14px', marginBottom: '20px' }}>
                Manage special event contracts and clients.
            </p>

            {/* Tab Bar */}
            <div className={styles.tabBar}>
                <button
                    type="button"
                    className={activeTab === 'contracts' ? styles.tabBtnActive : styles.tabBtn}
                    onClick={() => setActiveTab('contracts')}
                >
                    <FileSignature size={14} /> Contracts
                </button>
                <button
                    type="button"
                    className={activeTab === 'clients' ? styles.tabBtnActive : styles.tabBtn}
                    onClick={() => setActiveTab('clients')}
                >
                    <Users size={14} /> Clients
                </button>
            </div>

            {/* ── Contracts Tab ── */}
            {activeTab === 'contracts' && (<>
            <SpecialEventAdminForm onCreated={load} />

            {finalizeId ? (() => {
                const row = invites.find((r) => r.id === finalizeId);
                return (
                    <FinalizeStudioPanel
                        inviteId={finalizeId}
                        summary={{
                            label: row?.label ?? null,
                            contractNumber: row?.contractNumber ?? null,
                            clientName: row?.clientHintName ?? null,
                            clientEmail: row?.clientHintEmail ?? null,
                            clientSignedAt: row?.clientSignedAt ?? null,
                        }}
                        onDone={() => {
                            setFinalizeId(null);
                            load();
                        }}
                    />
                );
            })() : null}

            <div className={styles.panel}>
                <h2 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>
                    New signing link
                </h2>
                <div className={styles.formGrid}>
                    <div>
                        <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '6px' }}>Internal label (optional)</label>
                        <input className={styles.inputTouch} style={inputStyle} value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Sarah — bridal trial" />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '6px' }}>Client name hint (optional)</label>
                        <input className={styles.inputTouch} style={inputStyle} value={clientHintName} onChange={(e) => setClientHintName(e.target.value)} placeholder="Prefills name field" />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '6px' }}>Client email hint (optional)</label>
                        <input className={styles.inputTouch} style={inputStyle} value={clientHintEmail} onChange={(e) => setClientHintEmail(e.target.value)} placeholder="For your records only" />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '6px' }}>Expires in (days)</label>
                        <input
                            className={styles.inputTouch}
                            style={inputStyle}
                            type="number"
                            min={1}
                            max={90}
                            value={expiresInDays}
                            onChange={(e) => setExpiresInDays(Number(e.target.value) || 14)}
                        />
                    </div>
                </div>
                <button
                    type="button"
                    className={`btn-primary ${styles.primaryBtn}`}
                    onClick={createInvite}
                    disabled={creating}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                    <Plus size={18} />
                    {creating ? 'Creating…' : 'Generate link'}
                </button>
                {lastCreatedUrl ? (
                    <div className={`${styles.successBanner} ${styles.successRow}`}>
                        <div>
                            <strong style={{ color: '#00D478' }}>Link ready</strong>
                            <div style={{ color: '#ccc', marginTop: '6px', lineHeight: 1.45 }}>{lastCreatedUrl}</div>
                        </div>
                        <button type="button" onClick={() => copyText(lastCreatedUrl, 'new')} className={styles.copyBtn}>
                            Copy link
                        </button>
                    </div>
                ) : null}
            </div>

            <h2 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '14px' }}>Recent links</h2>

            {loading ? (
                <p style={{ color: '#666' }}>Loading…</p>
            ) : invites.length === 0 ? (
                <p style={{ color: '#666' }}>No contract links yet.</p>
            ) : (
                <>
                <div className={styles.mobileList}>
                    {invites.map((row) => (
                        <div key={row.id} className={styles.mobileCard}>
                            <div className={styles.mobileCardTop}>
                                <div style={{ minWidth: 0 }}>
                                    <div className={styles.mobileTitle}>{row.label || '—'}</div>
                                    <div className={styles.mobileMeta}>
                                        {[row.clientHintName, row.clientHintEmail].filter(Boolean).join(' · ') || 'No hints'}
                                    </div>
                                    {row.referenceCode ? (
                                        <div style={{ fontSize: '11px', color: '#FF6BA8', marginTop: '8px' }}>Ref {row.referenceCode}</div>
                                    ) : null}
                                </div>
                                <StatusBadge row={row} />
                            </div>
                            <div className={styles.mobileRow}>
                                <span className={styles.mobileRowLabel}>Expires</span>
                                <span className={styles.mobileRowVal}>{new Date(row.expiresAt).toLocaleDateString()}</span>
                            </div>
                            <div className={styles.mobileRow}>
                                <span className={styles.mobileRowLabel}>Signed</span>
                                <span className={styles.mobileRowVal}>
                                    {row.completedAt ? new Date(row.completedAt).toLocaleString() : '—'}
                                </span>
                            </div>
                            <div className={styles.mobileActions}>
                                <button
                                    type="button"
                                    className={styles.mobileBtn}
                                    onClick={() => copyText(signUrlForToken(row.token), row.id)}
                                >
                                    {copiedId === row.id ? <CheckCircle size={16} /> : <Copy size={16} />}
                                    {copiedId === row.id ? 'Copied' : 'Copy link'}
                                </button>
                                {row.pdfKey ? (
                                    <a
                                        href={
                                            row.isSpecialEvent
                                                ? `/api/admin/contracts/${row.id}/pdf`
                                                : `/api/images/${row.pdfKey}`
                                        }
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={styles.mobileBtnPdf}
                                    >
                                        <ExternalLink size={16} /> Open PDF
                                    </a>
                                ) : null}
                                {row.isSpecialEvent && row.lifecycleStatus === 'CLIENT_SIGNED' ? (
                                    <button type="button" className={styles.primaryBtn} onClick={() => setFinalizeId(row.id)}>
                                        Finalize (SIGNED)
                                    </button>
                                ) : null}
                            </div>
                        </div>
                    ))}
                </div>
                <div className={styles.tableWrap}>
                    <table className={styles.table}>
                        <thead>
                            <tr style={{ background: 'rgba(255,255,255,0.03)', textAlign: 'left' }}>
                                <th style={{ padding: '12px 14px', color: '#888', fontWeight: 600 }}>Label / hints</th>
                                <th style={{ padding: '12px 14px', color: '#888', fontWeight: 600 }}>Status</th>
                                <th style={{ padding: '12px 14px', color: '#888', fontWeight: 600 }}>Expires</th>
                                <th style={{ padding: '12px 14px', color: '#888', fontWeight: 600 }}>Signed</th>
                                <th style={{ padding: '12px 14px', color: '#888', fontWeight: 600 }}>PDF</th>
                                <th style={{ padding: '12px 14px', color: '#888', fontWeight: 600 }}>Link</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invites.map((row) => (
                                <tr key={row.id} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '12px 14px', color: '#ccc', verticalAlign: 'top' }}>
                                        <div style={{ fontWeight: 600, color: '#fff' }}>{row.label || '—'}</div>
                                        <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                                            {[row.clientHintName, row.clientHintEmail].filter(Boolean).join(' · ') || 'No hints'}
                                        </div>
                                        {row.referenceCode ? (
                                            <div style={{ fontSize: '11px', color: '#FF6BA8', marginTop: '6px' }}>Ref {row.referenceCode}</div>
                                        ) : null}
                                    </td>
                                    <td style={{ padding: '12px 14px', verticalAlign: 'top' }}>
                                        <StatusBadge row={row} />
                                    </td>
                                    <td style={{ padding: '12px 14px', color: '#999', verticalAlign: 'top', whiteSpace: 'nowrap' }}>
                                        {new Date(row.expiresAt).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: '12px 14px', color: '#999', verticalAlign: 'top', whiteSpace: 'nowrap' }}>
                                        {row.completedAt ? new Date(row.completedAt).toLocaleString() : '—'}
                                    </td>
                                    <td style={{ padding: '12px 14px', verticalAlign: 'top' }}>
                                        {row.pdfKey ? (
                                            <a
                                                href={
                                                    row.isSpecialEvent
                                                        ? `/api/admin/contracts/${row.id}/pdf`
                                                        : `/api/images/${row.pdfKey}`
                                                }
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{ color: '#FF6BA8', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                            >
                                                <ExternalLink size={14} /> Open PDF
                                            </a>
                                        ) : (
                                            <span style={{ color: '#555' }}>—</span>
                                        )}
                                        {row.isSpecialEvent && row.lifecycleStatus === 'CLIENT_SIGNED' ? (
                                            <div style={{ marginTop: 8 }}>
                                                <button
                                                    type="button"
                                                    className={styles.copyBtn}
                                                    onClick={() => setFinalizeId(row.id)}
                                                >
                                                    Finalize
                                                </button>
                                            </div>
                                        ) : null}
                                    </td>
                                    <td style={{ padding: '12px 14px', verticalAlign: 'top' }}>
                                        <button
                                            type="button"
                                            onClick={() => copyText(signUrlForToken(row.token), row.id)}
                                            style={{
                                                background: 'rgba(255,45,120,0.12)',
                                                border: '1px solid rgba(255,45,120,0.25)',
                                                borderRadius: '8px',
                                                padding: '8px 12px',
                                                color: '#FF6BA8',
                                                cursor: 'pointer',
                                                fontSize: '12px',
                                                fontFamily: 'Poppins, sans-serif',
                                                fontWeight: 600,
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                            }}
                                        >
                                            {copiedId === row.id ? <CheckCircle size={14} /> : <Copy size={14} />}
                                            {copiedId === row.id ? 'Copied' : 'Copy link'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                </>
            )}

            <p
                style={{
                    marginTop: '24px',
                    fontSize: '12px',
                    color: '#555',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                    flexWrap: 'wrap',
                    lineHeight: 1.5,
                }}
            >
                <Link2 size={14} /> Public URL pattern: <code style={{ color: '#888' }}>/sign/[token]</code>
            </p>
            </>)}

            {/* ── Clients Tab ── */}
            {activeTab === 'clients' && <SpecialEventClients />}
        </div>
    );
}
