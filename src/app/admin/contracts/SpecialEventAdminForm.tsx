'use client';

import { useCallback, useState } from 'react';
import { Copy, CheckCircle } from 'lucide-react';
import type { AdminContractPayload, AdminServiceLine } from '@/lib/contracts/adminContractPayload';
import styles from './contracts.module.css';

function randomContractNumber(): string {
    const a = Math.floor(Math.random() * 100000);
    const b = Math.floor(Math.random() * 100000);
    return `GGS-${String(a * 100000 + b).padStart(10, '0')}`;
}

const emptyService = (): AdminServiceLine => ({ description: '', price: '', notes: '' });

function defaultPayload(): AdminContractPayload {
    const today = new Date().toISOString().slice(0, 10);
    return {
        contractDate: today,
        contractNumber: randomContractNumber(),
        clientLegalName: '',
        phone: '',
        email: '',
        eventType: '',
        eventDate: '',
        startTime: '',
        venue: '',
        headcount: '1',
        services: [emptyService()],
        travelRequired: '',
        travelFee: '0',
        travelDest: '',
        miles: '',
        retainer: '',
        balance: '',
        ppActive: '',
        pp2Amt: '',
        pp2Date: '',
        pp3Amt: '',
        pp3Date: '',
        ppFinal: '',
        minSvc: '',
        lockDays: '',
        addonFee: '',
        prepFee: '25.00',
        overtimeRate: '75.00',
        trialFee: '',
        minors: '',
        guardian: '',
        guardianPhone: '',
        internalNotes: '',
    };
}

const inputStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    padding: '10px 12px',
    color: '#fff',
    width: '100%',
    boxSizing: 'border-box',
    fontFamily: 'Poppins, sans-serif',
    fontSize: '13px',
};

export default function SpecialEventAdminForm({ onCreated }: { onCreated: () => void }) {
    const [payload, setPayload] = useState<AdminContractPayload>(() => defaultPayload());
    const [saving, setSaving] = useState(false);
    const [inviteId, setInviteId] = useState<string | null>(null);
    const [lastSignUrl, setLastSignUrl] = useState('');
    const [lastEmailed, setLastEmailed] = useState<boolean | null>(null);
    const [emailClient, setEmailClient] = useState(true);
    const [copied, setCopied] = useState(false);
    const [err, setErr] = useState('');

    const set =
        (key: keyof AdminContractPayload) =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
            setPayload((p) => ({ ...p, [key]: e.target.value }));
        };

    const setService = (i: number, key: keyof AdminServiceLine, v: string) => {
        setPayload((p) => {
            const services = [...p.services];
            services[i] = { ...services[i], [key]: v };
            return { ...p, services };
        });
    };

    const addSvc = () => setPayload((p) => ({ ...p, services: [...p.services, emptyService()] }));
    const delSvc = (i: number) =>
        setPayload((p) => {
            const next = p.services.filter((_, j) => j !== i);
            return { ...p, services: next.length ? next : [emptyService()] };
        });

    const sendContractToClient = useCallback(async () => {
        setErr('');
        setCopied(false);
        setSaving(true);
        try {
            const res = await fetch('/api/admin/contracts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    label: `${payload.clientLegalName || 'Client'} — ${payload.contractNumber}`,
                    expiresInDays: 30,
                    adminPayload: payload,
                    sendEmail: emailClient,
                }),
            });
            const d = await res.json();
            if (!res.ok) {
                setErr(d.error || 'Could not send contract');
                return;
            }
            setInviteId(d.invite?.id || null);
            const url = d.invite?.signUrl || '';
            setLastSignUrl(url);
            setLastEmailed(typeof d.invite?.clientEmailed === 'boolean' ? d.invite.clientEmailed : null);
            onCreated();
        } finally {
            setSaving(false);
        }
    }, [payload, emailClient, onCreated]);

    const saveChanges = useCallback(async () => {
        if (!inviteId) return;
        setErr('');
        setSaving(true);
        try {
            const res = await fetch(`/api/admin/contracts/${inviteId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ adminPayload: payload }),
            });
            const d = await res.json();
            if (!res.ok) setErr(d.error || 'Save failed');
            else onCreated();
        } finally {
            setSaving(false);
        }
    }, [inviteId, payload, onCreated]);

    const resendEmail = useCallback(async () => {
        if (!inviteId) return;
        setErr('');
        setSaving(true);
        try {
            const res = await fetch(`/api/admin/contracts/${inviteId}/send`, { method: 'POST' });
            const d = await res.json();
            if (!res.ok) setErr(d.error || 'Resend failed');
            else {
                setLastEmailed(Boolean(d.clientEmailed));
                if (d.signUrl) setLastSignUrl(d.signUrl);
                onCreated();
            }
        } finally {
            setSaving(false);
        }
    }, [inviteId, onCreated]);

    function resetNewContract() {
        setPayload(defaultPayload());
        setInviteId(null);
        setLastSignUrl('');
        setLastEmailed(null);
        setErr('');
        setCopied(false);
    }

    async function copyLink() {
        if (!lastSignUrl) return;
        try {
            await navigator.clipboard.writeText(lastSignUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            setErr('Could not copy — select the link and copy manually.');
        }
    }

    return (
        <div className={styles.panel} style={{ marginBottom: 24 }}>
            <h2 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 12 }}>
                Special event — full contract (studio fields)
            </h2>
            <p style={{ color: '#888', fontSize: 13, marginBottom: 16, lineHeight: 1.5 }}>
                Fill in the details below, then click <strong style={{ color: '#ccc' }}>Send contract to client</strong>. The signing link
                works immediately — you can copy it here and the client can also get it by email (if email is set up).
            </p>
            {lastSignUrl ? (
                <div
                    className={styles.successBanner}
                    style={{ marginBottom: 16, textAlign: 'left' as const, lineHeight: 1.5 }}
                >
                    <strong style={{ color: '#00D478' }}>Ready to sign</strong>
                    <p style={{ color: '#ccc', margin: '10px 0 6px', fontSize: 13 }}>
                        {lastEmailed === true
                            ? 'We sent an email to the client with a button to open the agreement.'
                            : lastEmailed === false
                              ? 'We could not send email automatically. Copy the link below and send it to the client (text, DM, etc.).'
                              : 'Copy the link below for the client.'}
                    </p>
                    <div
                        style={{
                            wordBreak: 'break-all',
                            fontSize: 12,
                            color: '#aaa',
                            marginBottom: 10,
                            fontFamily: 'monospace',
                        }}
                    >
                        {lastSignUrl}
                    </div>
                    <button type="button" onClick={copyLink} className={styles.copyBtn} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                        {copied ? 'Copied' : 'Copy link'}
                    </button>
                </div>
            ) : null}
            {err ? <p style={{ color: '#ff6b8a', marginBottom: 12 }}>{err}</p> : null}

            <div className={styles.formGrid}>
                <div>
                    <label style={{ display: 'block', fontSize: 11, color: '#888', marginBottom: 4 }}>Contract date</label>
                    <input type="date" style={inputStyle} value={payload.contractDate} onChange={set('contractDate')} />
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: 11, color: '#888', marginBottom: 4 }}>Contract #</label>
                    <input style={inputStyle} value={payload.contractNumber} onChange={set('contractNumber')} />
                </div>
                <div className={styles.fullRow}>
                    <label style={{ display: 'block', fontSize: 11, color: '#888', marginBottom: 4 }}>Client legal name</label>
                    <input style={inputStyle} value={payload.clientLegalName} onChange={set('clientLegalName')} />
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: 11, color: '#888', marginBottom: 4 }}>Phone</label>
                    <input style={inputStyle} value={payload.phone} onChange={set('phone')} />
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: 11, color: '#888', marginBottom: 4 }}>Email</label>
                    <input type="email" style={inputStyle} value={payload.email} onChange={set('email')} />
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: 11, color: '#888', marginBottom: 4 }}>Event type</label>
                    <select style={inputStyle} value={payload.eventType} onChange={set('eventType')}>
                        <option value="">Select…</option>
                        <option>Wedding / Bridal</option>
                        <option>Quinceañera</option>
                        <option>Prom / Homecoming</option>
                        <option>Bridal Shower / Bachelorette</option>
                        <option>Baby Shower</option>
                        <option>Sweet 16 / Birthday</option>
                        <option>Corporate / Gala</option>
                        <option>Photo / Video Shoot</option>
                        <option>Other Special Event</option>
                    </select>
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: 11, color: '#888', marginBottom: 4 }}>Event date</label>
                    <input type="date" style={inputStyle} value={payload.eventDate} onChange={set('eventDate')} />
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: 11, color: '#888', marginBottom: 4 }}>Start time</label>
                    <input type="time" style={inputStyle} value={payload.startTime} onChange={set('startTime')} />
                </div>
                <div className={styles.fullRow}>
                    <label style={{ display: 'block', fontSize: 11, color: '#888', marginBottom: 4 }}>Venue / address</label>
                    <input style={inputStyle} value={payload.venue} onChange={set('venue')} />
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: 11, color: '#888', marginBottom: 4 }}># people serviced</label>
                    <input type="number" min={1} style={inputStyle} value={payload.headcount} onChange={set('headcount')} />
                </div>
            </div>

            <h3 style={{ color: '#FF6BA8', fontSize: 13, margin: '18px 0 10px' }}>Services</h3>
            {payload.services.map((s, i) => (
                <div key={i} className={styles.formGrid} style={{ marginBottom: 10, alignItems: 'end' }}>
                    <div className={styles.fullRow}>
                        <input
                            style={inputStyle}
                            placeholder="Description"
                            value={s.description}
                            onChange={(e) => setService(i, 'description', e.target.value)}
                        />
                    </div>
                    <div>
                        <input
                            style={inputStyle}
                            placeholder="Price"
                            type="number"
                            step="0.01"
                            value={s.price}
                            onChange={(e) => setService(i, 'price', e.target.value)}
                        />
                    </div>
                    <div>
                        <input
                            style={inputStyle}
                            placeholder="Notes"
                            value={s.notes}
                            onChange={(e) => setService(i, 'notes', e.target.value)}
                        />
                    </div>
                    <div>
                        <button type="button" className={styles.copyBtn} onClick={() => delSvc(i)}>
                            Remove
                        </button>
                    </div>
                </div>
            ))}
            <button type="button" className={styles.copyBtn} onClick={addSvc}>
                + Add service
            </button>

            <h3 style={{ color: '#FF6BA8', fontSize: 13, margin: '18px 0 10px' }}>Travel &amp; pricing</h3>
            <div className={styles.formGrid}>
                <div>
                    <label style={{ display: 'block', fontSize: 11, color: '#888', marginBottom: 4 }}>Travel required</label>
                    <select style={inputStyle} value={payload.travelRequired} onChange={set('travelRequired')}>
                        <option value="">Select…</option>
                        <option>Yes</option>
                        <option>No</option>
                        <option>TBD</option>
                    </select>
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: 11, color: '#888', marginBottom: 4 }}>Travel fee ($)</label>
                    <input type="number" step="0.01" style={inputStyle} value={payload.travelFee} onChange={set('travelFee')} />
                </div>
                <div className={styles.fullRow}>
                    <label style={{ display: 'block', fontSize: 11, color: '#888', marginBottom: 4 }}>Travel destination</label>
                    <input style={inputStyle} value={payload.travelDest} onChange={set('travelDest')} />
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: 11, color: '#888', marginBottom: 4 }}>Miles from Vista</label>
                    <input type="number" style={inputStyle} value={payload.miles} onChange={set('miles')} />
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: 11, color: '#888', marginBottom: 4 }}>Retainer ($)</label>
                    <input type="number" step="0.01" style={inputStyle} value={payload.retainer} onChange={set('retainer')} />
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: 11, color: '#888', marginBottom: 4 }}>Remaining balance ($)</label>
                    <input type="number" step="0.01" style={inputStyle} value={payload.balance} onChange={set('balance')} />
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: 11, color: '#888', marginBottom: 4 }}>Payment plan active</label>
                    <select style={inputStyle} value={payload.ppActive} onChange={set('ppActive')}>
                        <option value="">Select…</option>
                        <option>Yes</option>
                        <option>No</option>
                    </select>
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: 11, color: '#888', marginBottom: 4 }}>2nd payment ($)</label>
                    <input type="number" step="0.01" style={inputStyle} value={payload.pp2Amt} onChange={set('pp2Amt')} />
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: 11, color: '#888', marginBottom: 4 }}>2nd due date</label>
                    <input type="date" style={inputStyle} value={payload.pp2Date} onChange={set('pp2Date')} />
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: 11, color: '#888', marginBottom: 4 }}>3rd payment ($)</label>
                    <input type="number" step="0.01" style={inputStyle} value={payload.pp3Amt} onChange={set('pp3Amt')} />
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: 11, color: '#888', marginBottom: 4 }}>3rd due date</label>
                    <input type="date" style={inputStyle} value={payload.pp3Date} onChange={set('pp3Date')} />
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: 11, color: '#888', marginBottom: 4 }}>Final payment ($)</label>
                    <input type="number" step="0.01" style={inputStyle} value={payload.ppFinal} onChange={set('ppFinal')} />
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: 11, color: '#888', marginBottom: 4 }}>Min services (on-location)</label>
                    <input style={inputStyle} value={payload.minSvc} onChange={set('minSvc')} />
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: 11, color: '#888', marginBottom: 4 }}>Headcount lock-in (days)</label>
                    <input type="number" style={inputStyle} value={payload.lockDays} onChange={set('lockDays')} />
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: 11, color: '#888', marginBottom: 4 }}>Same-day surcharge ($)</label>
                    <input type="number" step="0.01" style={inputStyle} value={payload.addonFee} onChange={set('addonFee')} />
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: 11, color: '#888', marginBottom: 4 }}>Prep fee / person ($)</label>
                    <input type="number" step="0.01" style={inputStyle} value={payload.prepFee} onChange={set('prepFee')} />
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: 11, color: '#888', marginBottom: 4 }}>Overtime / hr ($)</label>
                    <input type="number" step="0.01" style={inputStyle} value={payload.overtimeRate} onChange={set('overtimeRate')} />
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: 11, color: '#888', marginBottom: 4 }}>Trial fee ($)</label>
                    <input type="number" step="0.01" style={inputStyle} value={payload.trialFee} onChange={set('trialFee')} />
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: 11, color: '#888', marginBottom: 4 }}>Minors</label>
                    <input style={inputStyle} value={payload.minors} onChange={set('minors')} placeholder="N/A" />
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: 11, color: '#888', marginBottom: 4 }}>Guardian</label>
                    <input style={inputStyle} value={payload.guardian} onChange={set('guardian')} />
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: 11, color: '#888', marginBottom: 4 }}>Guardian phone</label>
                    <input style={inputStyle} value={payload.guardianPhone} onChange={set('guardianPhone')} />
                </div>
                <div className={styles.fullRow}>
                    <label style={{ display: 'block', fontSize: 11, color: '#888', marginBottom: 4 }}>Internal notes (not on contract)</label>
                    <textarea style={{ ...inputStyle, minHeight: 56 }} value={payload.internalNotes} onChange={set('internalNotes')} />
                </div>
            </div>

            {!inviteId ? (
                <label
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        marginTop: 18,
                        marginBottom: 8,
                        fontSize: 13,
                        color: '#bbb',
                        cursor: 'pointer',
                    }}
                >
                    <input type="checkbox" checked={emailClient} onChange={(e) => setEmailClient(e.target.checked)} />
                    Also email the client at the address above (recommended)
                </label>
            ) : null}

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 8 }}>
                {!inviteId ? (
                    <button
                        type="button"
                        className={`btn-primary ${styles.primaryBtn}`}
                        disabled={saving}
                        onClick={sendContractToClient}
                    >
                        Send contract to client
                    </button>
                ) : null}
                {inviteId ? (
                    <>
                        <button type="button" className={styles.copyBtn} disabled={saving} onClick={saveChanges}>
                            Save field changes only
                        </button>
                        <button type="button" className={styles.mobileBtnPdf} disabled={saving} onClick={resendEmail}>
                            Send email again
                        </button>
                        <button type="button" className={styles.copyBtn} disabled={saving} onClick={resetNewContract}>
                            Clear form (new client)
                        </button>
                    </>
                ) : null}
            </div>
            {inviteId ? (
                <p style={{ fontSize: 12, color: '#777', marginTop: 10, lineHeight: 1.5 }}>
                    To send a <strong style={{ color: '#999' }}>different</strong> contract, use <strong style={{ color: '#999' }}>Clear form (new client)</strong>{' '}
                    first so you don&apos;t create duplicates.
                </p>
            ) : null}
            {inviteId ? (
                <p style={{ fontSize: 11, color: '#555', marginTop: 10 }}>
                    Contract id (for support): {inviteId}
                </p>
            ) : null}
        </div>
    );
}
