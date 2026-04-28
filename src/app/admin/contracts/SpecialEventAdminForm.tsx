'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Copy, CheckCircle, ExternalLink } from 'lucide-react';
import {
    validateAdminContractPayload,
    type AdminContractPayload,
    type AdminServiceLine,
} from '@/lib/contracts/adminContractPayload';
import {
    CONTRACT_TEMPLATES,
    TEMPLATE_GROUPS,
    dynamicFieldDefaults,
    type DynField,
} from './contractTemplates';
import styles from './contracts.module.css';

/* ── helpers ── */
const rng = () => `GGS-${String(Math.floor(Math.random() * 1e10)).padStart(10, '0')}`;
const empty = (): AdminServiceLine => ({ description: '', price: '', notes: '' });
const fmt = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/** Format a phone string as (XXX) XXX-XXXX as the user types. */
function formatPhone(raw: string): string {
    const digits = raw.replace(/\D/g, '').slice(0, 10);
    if (digits.length <= 3) return digits.length ? `(${digits}` : '';
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

/* ── Custom Dropdown ── */
function ContractDropdown({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    const label = value && CONTRACT_TEMPLATES[value] ? CONTRACT_TEMPLATES[value].title : null;
    const isES = value.endsWith('ES');

    return (
        <div className={styles.dropdownWrap} ref={ref}>
            <button
                type="button"
                className={`${styles.dropdownTrigger} ${open ? styles.dropdownTriggerOpen : ''}`}
                onClick={() => setOpen((o) => !o)}
                aria-haspopup="listbox"
                aria-expanded={open}
            >
                {label ? (
                    <span>
                        {label}
                        {isES && <span className={styles.dropdownBadge}>ES</span>}
                    </span>
                ) : (
                    <span className={styles.dropdownTriggerPlaceholder}>-- Choose a contract type --</span>
                )}
            </button>
            {open && (
                <div className={styles.dropdownPopover} role="listbox">
                    {TEMPLATE_GROUPS.map((g) => (
                        <div key={g.label} className={styles.dropdownGroup}>
                            <div className={styles.dropdownGroupLabel}>{g.label}</div>
                            {g.keys.map((k) => {
                                const t = CONTRACT_TEMPLATES[k];
                                const isActive = k === value;
                                const isUnavailable = !t.available;
                                return (
                                    <button
                                        key={k}
                                        type="button"
                                        role="option"
                                        aria-selected={isActive}
                                        className={isActive ? styles.dropdownItemActive : styles.dropdownItem}
                                        onClick={() => { if (!isUnavailable) { onChange(k); setOpen(false); } }}
                                        style={isUnavailable ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
                                        disabled={isUnavailable}
                                    >
                                        {t.title}
                                        {k.endsWith('ES') && <span className={styles.dropdownBadge}>ES</span>}
                                        {isUnavailable && <span className={styles.dropdownBadge} style={{ background: 'rgba(255,200,0,0.25)', color: '#ffd700', marginLeft: 8 }}>Coming Soon</span>}
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

/* ── Reusable Custom Select ── */
function CustomSelect({ options, value, onChange, placeholder }: { options: string[]; value: string; onChange: (v: string) => void; placeholder?: string }) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, [open]);

    const display = value || placeholder || 'Select...';

    return (
        <div className={styles.selectWrap} ref={ref}>
            <button
                type="button"
                className={`${styles.selectTrigger} ${open ? styles.selectTriggerOpen : ''}`}
                onClick={() => setOpen((o) => !o)}
            >
                <span className={!value ? styles.selectPlaceholder : undefined}>{display}</span>
            </button>
            {open && (
                <div className={styles.selectPopover}>
                    {options.map((opt) => (
                        <button
                            key={opt}
                            type="button"
                            className={opt === value ? styles.selectOptionActive : styles.selectOption}
                            onClick={() => { onChange(opt); setOpen(false); }}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

/* ── Dynamic Field Renderer ── */
function DynFieldInput({ field, value, onChange }: { field: DynField; value: string; onChange: (v: string) => void }) {
    const cls = styles.input;
    const common = { className: cls, value, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(e.target.value) };

    switch (field.type) {
        case 'textarea':
            return <textarea {...common} placeholder={field.placeholder} style={{ minHeight: 80 }} />;
        case 'select':
            return <CustomSelect options={field.options || []} value={value} onChange={onChange} />;
        default:
            return <input {...common} type={field.type} placeholder={field.placeholder} />;
    }
}

const EVENT_TYPES = [
    'Wedding / Bridal', 'Quinceañera', 'Prom / Homecoming',
    'Bridal Shower / Bachelorette', 'Baby Shower',
    'Sweet 16 / Birthday', 'Corporate / Gala',
    'Photo / Video Shoot', 'Other Special Event',
];

/* ── form state ── */
type FormState = {
    contractType: string;
    contractDate: string;
    contractNumber: string;
    clientLegalName: string;
    phone: string;
    email: string;
    eventType: string;
    eventDate: string;
    startTime: string;
    venue: string;
    headcount: string;
    services: AdminServiceLine[];
    travelEnabled: boolean;
    retainer: string;
    balance: string;
    // 05 · Payment Plan
    ppActive: string;
    pp2Amt: string;
    pp2Date: string;
    pp3Amt: string;
    pp3Date: string;
    ppFinal: string;
    // 06 · Minimum Booking
    minSvc: string;
    lockDays: string;
    // 11 · Prep Fee
    prepFee: string;
    // 13 · Overtime
    overtimeRate: string;
    // 19 · Trial Run
    trialFee: string;
    // 20 · Minors
    minors: string;
    guardian: string;
    guardianPhone: string;
    // Parking notes (in-studio)
    parkingNotes: string;
    dyn: Record<string, string>;
};

const initForm = (): FormState => ({
    contractType: '',
    contractDate: new Date().toISOString().slice(0, 10),
    contractNumber: rng(),
    clientLegalName: '',
    phone: '',
    email: '',
    eventType: '',
    eventDate: '',
    startTime: '',
    venue: '',
    headcount: '1',
    services: [empty()],
    travelEnabled: false,
    retainer: '',
    balance: '',
    ppActive: '',
    pp2Amt: '0.00',
    pp2Date: '',
    pp3Amt: '0.00',
    pp3Date: '',
    ppFinal: '0.00',
    minSvc: '1',
    lockDays: '14',
    prepFee: '25.00',
    overtimeRate: '75.00',
    trialFee: '',
    minors: 'N/A',
    guardian: 'N/A',
    guardianPhone: 'N/A',
    parkingNotes: '',
    dyn: dynamicFieldDefaults(),
});

function totals(f: FormState) {
    let sub = 0;
    for (const s of f.services) if (s.description.trim()) sub += parseFloat(s.price) || 0;
    const tv = f.travelEnabled ? parseFloat(f.dyn.travelFee) || 0 : 0;
    return { sub, tv, grand: sub + tv };
}

/* ── component ── */
export default function SpecialEventAdminForm({ onCreated }: { onCreated: () => void }) {
    const [f, setF] = useState<FormState>(initForm);
    const [saving, setSaving] = useState(false);
    const [inviteId, setInviteId] = useState<string | null>(null);
    const [signUrl, setSignUrl] = useState('');
    const [emailed, setEmailed] = useState<boolean | null>(null);
    const [emailClient, setEmailClient] = useState(true);
    const [copied, setCopied] = useState(false);
    const [err, setErr] = useState('');
    const formRef = useRef<HTMLDivElement>(null);

    /* Prevent scroll-wheel from changing number input values */
    useEffect(() => {
        const el = formRef.current;
        if (!el) return;
        const handler = (e: WheelEvent) => {
            const target = e.target as HTMLElement;
            if (target.tagName === 'INPUT' && (target as HTMLInputElement).type === 'number') {
                (target as HTMLInputElement).blur();
            }
        };
        el.addEventListener('wheel', handler, { passive: true });
        return () => el.removeEventListener('wheel', handler);
    }, []);

    const t = useMemo(() => totals(f), [f]);

    /* Auto-fill retainer as 50% of grand total whenever total changes */
    useEffect(() => {
        const half = (t.grand / 2).toFixed(2);
        setF((p) => ({ ...p, retainer: half, balance: half }));
    }, [t.grand]);
    const tpl = f.contractType ? CONTRACT_TEMPLATES[f.contractType] : null;

    const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setF((p) => ({ ...p, [k]: v }));
    const inp = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => set(k, e.target.value as never);
    const setDyn = (k: string, v: string) => setF((p) => ({ ...p, dyn: { ...p.dyn, [k]: v } }));

    const setSvc = (i: number, k: keyof AdminServiceLine, v: string) =>
        setF((p) => { const s = [...p.services]; s[i] = { ...s[i], [k]: v }; return { ...p, services: s }; });
    const addSvc = () => setF((p) => ({ ...p, services: [...p.services, empty()] }));
    const rmSvc = (i: number) => setF((p) => { const n = p.services.filter((_, j) => j !== i); return { ...p, services: n.length ? n : [empty()] }; });

    const onRetainer = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value;
        setF((p) => {
            const g = totals({ ...p, retainer: raw }).grand;
            const r = parseFloat(raw.trim());
            return { ...p, retainer: raw, balance: Number.isNaN(r) ? p.balance : Math.max(0, g - r).toFixed(2) };
        });
    };
    const recalc = () => {
        const r = parseFloat(f.retainer.trim());
        set('balance', (Number.isNaN(r) ? t.grand : Math.max(0, t.grand - r)).toFixed(2));
    };

    /* map to API payload */
    const buildPayload = (): AdminContractPayload => ({
        contractType: tpl?.contractType || 'on-location',
        contractDate: f.contractDate, contractNumber: f.contractNumber,
        clientLegalName: f.clientLegalName, phone: f.phone, email: f.email,
        eventType: f.eventType, eventDate: f.eventDate, startTime: f.startTime,
        venue: f.travelEnabled ? (f.dyn.locationAddress || f.venue || '') : 'Glitz & Glamour Studio — 812 Frances Dr, Vista, CA 92084 (In-Studio)',
        headcount: f.headcount,
        services: f.services,
        travelRequired: f.travelEnabled ? 'Yes' : 'No',
        travelFee: f.travelEnabled ? (f.dyn.travelFee || '0') : '0',
        travelDest: f.travelEnabled ? (f.dyn.locationAddress || f.venue || 'TBD') : '',
        miles: f.travelEnabled ? (f.dyn.travelDistance || '0') : '0',
        retainer: f.retainer || '0', balance: f.balance || '0',
        paymentPlanEnabled: !!f.ppActive && f.ppActive === 'Yes',
        travelEnabled: f.travelEnabled,
        trialFeeEnabled: !!f.trialFee && parseFloat(f.trialFee) > 0,
        ppActive: f.ppActive || 'N/A',
        pp2Amt: f.pp2Amt || '0', pp2Date: f.pp2Date || '',
        pp3Amt: f.pp3Amt || '0', pp3Date: f.pp3Date || '',
        ppFinal: f.ppFinal || '0',
        minSvc: f.minSvc || f.headcount || '1',
        lockDays: f.lockDays || '14',
        prepFee: f.prepFee || '25.00',
        overtimeRate: f.overtimeRate || '75.00',
        trialFee: f.trialFee || 'N/A',
        minors: f.minors || 'N/A',
        guardian: f.guardian || 'N/A',
        guardianPhone: f.guardianPhone || 'N/A',
        parkingNotes: !f.travelEnabled ? (f.parkingNotes || '') : '',
        internalNotes: [
            f.contractType ? `Template: ${f.contractType}` : '',
            ...Object.entries(f.dyn).filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`),
        ].filter(Boolean).join('\n'),
    });

    const send = useCallback(async () => {
        setErr(''); setCopied(false);
        if (!f.contractType) { setErr('Please select a contract type first!'); return; }
        if (tpl && !tpl.available) { setErr('This contract template is Coming Soon and is not yet available.'); return; }
        const payload = buildPayload();
        const v = validateAdminContractPayload(payload);
        if (!v.ok) { setErr(v.message); return; }
        setSaving(true);
        try {
            const res = await fetch('/api/admin/contracts', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ label: `${v.data.clientLegalName || 'Client'} — ${v.data.contractNumber}`, expiresInDays: 30, adminPayload: v.data, sendEmail: emailClient }),
            });
            const d = await res.json();
            if (!res.ok) { setErr(d.error || 'Could not send contract'); return; }
            setInviteId(d.invite?.id || null);
            setSignUrl(d.invite?.signUrl || '');
            setEmailed(typeof d.invite?.clientEmailed === 'boolean' ? d.invite.clientEmailed : null);
            onCreated();
        } finally { setSaving(false); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [f, emailClient, onCreated]);

    const copy = async () => {
        if (!signUrl) return;
        try { await navigator.clipboard.writeText(signUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); }
        catch { setErr('Could not copy — select the link and copy manually.'); }
    };
    const reset = () => { setF(initForm()); setInviteId(null); setSignUrl(''); setEmailed(null); setErr(''); setCopied(false); };

    /* ── render ── */
    return (
        <div ref={formRef}>
            {/* CONTRACT TYPE SELECTOR */}
            <div className={styles.selectorContainer}>
                <label className={styles.selectorLabel}>📋 Select Contract Template:</label>
                <ContractDropdown value={f.contractType} onChange={(v) => {
                    const selected = CONTRACT_TEMPLATES[v];
                    const isOnLocation = selected?.contractType?.startsWith('on-location') ?? false;
                    setF((p) => ({ ...p, contractType: v, travelEnabled: isOnLocation }));
                }} />
                {tpl && (
                    <div className={styles.descriptionBoxActive}>
                        <h4>{tpl.title}</h4>
                        <p>{tpl.description}</p>
                        <div style={{ marginTop: 10 }}>
                            {tpl.tags.map((tag) => <span key={tag} className={styles.tag}>{tag}</span>)}
                        </div>
                    </div>
                )}
            </div>

            {/* INFO BOX */}
            <div className={styles.infoBox}>
                <strong>ℹ️ Instructions:</strong> Fill in the details below, then click <strong>Send contract to client</strong>. The signing link works immediately — you can copy it here and the client can also get it by email (if email is set up).
            </div>

            {/* SUCCESS BANNER */}
            {signUrl && (
                <div className={styles.successBanner}>
                    <strong style={{ color: '#00D478', fontSize: 15 }}>✅ Contract Ready to Sign</strong>
                    <p style={{ color: '#ccc', margin: '10px 0 6px', fontSize: 13 }}>
                        {emailed === true ? 'We sent an email to the client with a button to open the agreement.'
                            : emailed === false ? 'We could not send email automatically. Copy the link below and send it to the client.'
                            : 'Copy the link below for the client.'}
                    </p>
                    <div style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: 8,
                        padding: '10px 14px',
                        marginBottom: 12,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        flexWrap: 'wrap',
                    }}>
                        <a
                            href={signUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ wordBreak: 'break-all', fontSize: 12, color: '#FF6BA8', fontFamily: 'monospace', flex: 1, textDecoration: 'none' }}
                        >
                            {signUrl}
                        </a>
                        <a
                            href={signUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: 'inline-flex', alignItems: 'center', gap: 4,
                                color: '#aaa', fontSize: 11, textDecoration: 'none', flexShrink: 0,
                            }}
                        >
                            <ExternalLink size={12} /> Open
                        </a>
                    </div>
                    <button
                        type="button"
                        onClick={copy}
                        style={{
                            background: copied ? 'rgba(0,212,120,0.15)' : 'rgba(255,45,120,0.15)',
                            border: `1.5px solid ${copied ? 'rgba(0,212,120,0.4)' : 'rgba(255,45,120,0.35)'}`,
                            borderRadius: 10,
                            padding: '10px 22px',
                            color: copied ? '#00D478' : '#FF6BA8',
                            cursor: 'pointer',
                            fontSize: 13,
                            fontFamily: 'Poppins, sans-serif',
                            fontWeight: 600,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8,
                            transition: 'all .2s',
                        }}
                    >
                        {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                        {copied ? 'Copied!' : 'Copy Contract Link'}
                    </button>
                </div>
            )}
            {err && <p style={{ color: '#ff6b8a', marginBottom: 12, fontFamily: 'Poppins, sans-serif', fontSize: 13 }}>{err}</p>}

            {/* CONTRACT INFORMATION */}
            <div className={styles.formSection}>
                <h2>Contract Information</h2>
                <div className={styles.formGrid}>
                    <div className={styles.formGroup}><label>Contract Date</label><input type="date" className={styles.input} value={f.contractDate} onChange={inp('contractDate')} /></div>
                    <div className={styles.formGroup}><label>Contract #</label><input className={styles.input} value={f.contractNumber} readOnly style={{ cursor: 'not-allowed', opacity: 0.8 }} /></div>
                    <div className={styles.formGroup}><label>Client Legal Name *</label><input className={styles.input} placeholder="Enter client's full legal name" value={f.clientLegalName} onChange={inp('clientLegalName')} /></div>
                </div>
                <div className={styles.formGrid}>
                    <div className={styles.formGroup}><label>Phone</label><input type="tel" className={styles.input} placeholder="(555) 123-4567" value={f.phone} onChange={(e) => set('phone', formatPhone(e.target.value))} /></div>
                    <div className={styles.formGroup}><label>Email *</label><input type="email" className={styles.input} placeholder="client@example.com" value={f.email} onChange={inp('email')} /></div>
                    <div className={styles.formGroup}>
                        <label>Event Type</label>
                        <CustomSelect
                            options={EVENT_TYPES}
                            value={f.eventType}
                            onChange={(v) => set('eventType', v)}
                            placeholder="Select event…"
                        />
                    </div>
                </div>
                <div className={styles.formGrid}>
                    <div className={styles.formGroup}><label>Event Date</label><input type="date" className={styles.input} value={f.eventDate} onChange={inp('eventDate')} /></div>
                    <div className={styles.formGroup}><label>Start Time</label><input type="time" className={styles.input} value={f.startTime} onChange={inp('startTime')} /></div>
                </div>
                {!f.travelEnabled && (
                <div className={styles.formGroup} style={{ marginTop: 4 }}>
                    <label>Service Location</label>
                    <input className={styles.input} value="Glitz & Glamour Studio — 812 Frances Dr, Vista, CA 92084 (In-Studio)" readOnly style={{ cursor: 'not-allowed', opacity: 0.8 }} />
                </div>
                )}
                <div className={styles.formGroup} style={{ marginTop: 16 }}><label># People Being Serviced</label><input type="number" min={1} className={styles.input} value={f.headcount} onChange={inp('headcount')} style={{ maxWidth: 200 }} /></div>
            </div>



            {/* SERVICES */}
            <div className={styles.formSection}>
                <h2>Services</h2>
                {f.services.map((s, i) => (
                    <div key={i} className={styles.serviceRow}>
                        <div className={styles.formGroup}><label>Description</label><textarea className={styles.input} style={{ minHeight: 80 }} placeholder="Describe the services to be provided" value={s.description} onChange={(e) => setSvc(i, 'description', e.target.value)} /></div>
                        <div className={styles.serviceRowInner}>
                            <div className={styles.formGroup}><label>Price ($)</label><input type="number" className={styles.input} placeholder="0.00" value={s.price} onChange={(e) => setSvc(i, 'price', e.target.value)} /></div>
                            <div className={styles.formGroup}><label>Notes</label><input className={styles.input} placeholder="Additional notes" value={s.notes} onChange={(e) => setSvc(i, 'notes', e.target.value)} /></div>
                            {f.services.length > 1 && <div style={{ display: 'flex', alignItems: 'flex-end' }}><button type="button" className={styles.btnSecondary} onClick={() => rmSvc(i)}>Remove</button></div>}
                        </div>
                    </div>
                ))}
                <button type="button" className={styles.btnSecondary} style={{ marginTop: 4 }} onClick={addSvc}>+ Add Service</button>
            </div>

            {/* 03 · LOCATION-SPECIFIC FIELDS */}
            <div className={styles.formSection}>
                <h2>{f.travelEnabled ? '03 · Travel, Parking & Access Fees' : '03 · In-Studio Arrival & Parking'}</h2>

                {/* In-studio: parking notes */}
                {!f.travelEnabled && (
                    <>
                        <div className={styles.formGroup} style={{ marginBottom: 14 }}>
                            <label>Studio Address</label>
                            <input className={styles.input} value="Glitz & Glamour Studio — 812 Frances Dr, Vista, CA 92084" readOnly style={{ cursor: 'not-allowed', opacity: 0.8 }} />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Parking / Access Notes for Client <span style={{ color: '#666', fontWeight: 400 }}>(optional)</span></label>
                            <textarea className={styles.input} style={{ minHeight: 60 }} placeholder="e.g. Street parking available. Please arrive 5–10 minutes early." value={f.parkingNotes} onChange={(e) => set('parkingNotes', e.target.value)} />
                        </div>
                    </>
                )}

                {/* On-location: travel fields */}
                {f.travelEnabled && (
                    <>
                        <div className={styles.formGroup} style={{ marginBottom: 14 }}>
                            <label>Event Location Address *</label>
                            <input className={styles.input} placeholder="Complete venue address" value={f.dyn.locationAddress ?? ''} onChange={(e) => setDyn('locationAddress', e.target.value)} />
                        </div>
                        <div className={styles.formGrid}>
                            <div className={styles.formGroup}>
                                <label>Est. Miles from Vista (one-way)</label>
                                <input type="number" className={styles.input} placeholder="0" value={f.dyn.travelDistance ?? ''} onChange={(e) => setDyn('travelDistance', e.target.value)} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Travel Fee ($)</label>
                                <input type="number" className={styles.input} placeholder="0.00" value={f.dyn.travelFee ?? ''} onChange={(e) => setDyn('travelFee', e.target.value)} />
                            </div>
                        </div>
                    </>
                )}

                <div className={styles.totalsBox} style={{ marginTop: 16 }}>
                    <h4>Auto totals (services{f.travelEnabled ? ' + travel' : ''})</h4>
                    <div className={styles.totalsRow}>Services subtotal: <strong>{fmt(t.sub)}</strong></div>
                    {f.travelEnabled && <div className={styles.totalsRow}>Travel fee: <strong>{fmt(t.tv)}</strong></div>}
                    <div className={`${styles.totalsRow} ${styles.totalsDivider}`}>Grand total: <strong className={styles.grandTotal}>{fmt(t.grand)}</strong></div>
                </div>
            </div>

            {/* 04 · PAYMENT */}
            <div className={styles.formSection}>
                <h2>04 · Payment</h2>
                <div className={styles.formGrid}>
                    <div className={styles.formGroup}><label>Retainer ($)</label><input type="number" className={styles.input} placeholder="0.00" value={f.retainer} onChange={onRetainer} /></div>
                    <div className={styles.formGroup}><label>Remaining Balance ($)</label><input type="number" className={styles.input} placeholder="0.00" value={f.balance} readOnly style={{ cursor: 'not-allowed', opacity: 0.8 }} /></div>
                </div>
                <button type="button" className={styles.btnSecondary} style={{ marginTop: 8 }} onClick={recalc}>Recalc balance from totals</button>
            </div>

            {/* 05 · PAYMENT PLAN */}
            <div className={styles.formSection}>
                <h2>05 · Payment Plan <span style={{ fontSize: 12, fontWeight: 400, color: '#666' }}>(Optional)</span></h2>
                <div className={styles.formGroup}>
                    <label>Payment Plan Active?</label>
                    <CustomSelect
                        options={['Yes', 'No', 'N/A']}
                        value={f.ppActive}
                        onChange={(v) => setF((p) => ({ ...p, ppActive: v }))}
                        placeholder="Select..."
                    />
                </div>
                {f.ppActive === 'Yes' && (
                    <>
                        <div className={styles.formGrid} style={{ marginTop: 14 }}>
                            <div className={styles.formGroup}><label>2nd Payment ($)</label><input type="number" className={styles.input} placeholder="0.00" value={f.pp2Amt} onChange={(e) => setF((p) => ({ ...p, pp2Amt: e.target.value }))} /></div>
                            <div className={styles.formGroup}><label>2nd Due Date</label><input type="date" className={styles.input} value={f.pp2Date} onChange={(e) => setF((p) => ({ ...p, pp2Date: e.target.value }))} /></div>
                        </div>
                        <div className={styles.formGrid} style={{ marginTop: 14 }}>
                            <div className={styles.formGroup}><label>3rd Payment ($)</label><input type="number" className={styles.input} placeholder="0.00" value={f.pp3Amt} onChange={(e) => setF((p) => ({ ...p, pp3Amt: e.target.value }))} /></div>
                            <div className={styles.formGroup}><label>3rd Due Date</label><input type="date" className={styles.input} value={f.pp3Date} onChange={(e) => setF((p) => ({ ...p, pp3Date: e.target.value }))} /></div>
                        </div>
                        <div className={styles.formGroup} style={{ marginTop: 14 }}>
                            <label>Final Payment ($)</label>
                            <input type="number" className={styles.input} placeholder="0.00" value={f.ppFinal} onChange={(e) => setF((p) => ({ ...p, ppFinal: e.target.value }))} style={{ maxWidth: 260 }} />
                        </div>
                    </>
                )}
            </div>

            {/* 06 · MINIMUM BOOKING */}
            <div className={styles.formSection}>
                <h2>06 · Minimum Booking</h2>
                <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                        <label>Minimum Services Required <span style={{ color: '#666', fontWeight: 400, fontSize: 11 }}>(total service slots)</span></label>
                        <input type="number" min={1} className={styles.input} placeholder="e.g. 4" value={f.minSvc} onChange={(e) => setF((p) => ({ ...p, minSvc: e.target.value }))} />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Final Changes Deadline <span style={{ color: '#666', fontWeight: 400, fontSize: 11 }}>(days before event)</span></label>
                        <input type="number" min={1} className={styles.input} placeholder="e.g. 14" value={f.lockDays} onChange={(e) => setF((p) => ({ ...p, lockDays: e.target.value }))} />
                    </div>
                </div>
            </div>

            {/* 11 · PREP FEE */}
            <div className={styles.formSection}>
                <h2>11 · Preparation Fee <span style={{ fontSize: 12, fontWeight: 400, color: '#666' }}>(per person)</span></h2>
                <div className={styles.formGroup} style={{ maxWidth: 300 }}>
                    <label>Prep Fee Per Person ($)</label>
                    <input type="number" min={0} step="0.01" className={styles.input} placeholder="25.00" value={f.prepFee} onChange={(e) => setF((p) => ({ ...p, prepFee: e.target.value }))} />
                </div>
            </div>

            {/* 13 · OVERTIME RATE */}
            <div className={styles.formSection}>
                <h2>13 · Overtime Rate <span style={{ fontSize: 12, fontWeight: 400, color: '#666' }}>(per hour)</span></h2>
                <div className={styles.formGroup} style={{ maxWidth: 300 }}>
                    <label>Overtime Rate Per Hour ($)</label>
                    <input type="number" min={0} step="0.01" className={styles.input} placeholder="75.00" value={f.overtimeRate} onChange={(e) => setF((p) => ({ ...p, overtimeRate: e.target.value }))} />
                </div>
            </div>

            {/* 19 · TRIAL RUN */}
            <div className={styles.formSection}>
                <h2>19 · Trial Run Fee <span style={{ fontSize: 12, fontWeight: 400, color: '#666' }}>(if applicable)</span></h2>
                <div className={styles.formGroup} style={{ maxWidth: 300 }}>
                    <label>Trial Run Fee ($)</label>
                    <input type="number" min={0} step="0.01" className={styles.input} placeholder="0.00 or leave blank for N/A" value={f.trialFee} onChange={(e) => setF((p) => ({ ...p, trialFee: e.target.value }))} />
                </div>
            </div>

            {/* 20 · MINORS */}
            <div className={styles.formSection}>
                <h2>20 · Minors Policy <span style={{ fontSize: 12, fontWeight: 400, color: '#666' }}>(if applicable)</span></h2>
                <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                        <label>Minor(s) Being Serviced</label>
                        <input className={styles.input} placeholder="First name(s) + age(s), or N/A" value={f.minors} onChange={(e) => setF((p) => ({ ...p, minors: e.target.value }))} />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Parent/Guardian Name & Relationship</label>
                        <input className={styles.input} placeholder="e.g. Maria Gomez — Mother" value={f.guardian} onChange={(e) => setF((p) => ({ ...p, guardian: e.target.value }))} />
                    </div>
                </div>
                <div className={styles.formGroup} style={{ marginTop: 14, maxWidth: 300 }}>
                    <label>Parent/Guardian Phone</label>
                    <input type="tel" className={styles.input} placeholder="(760) 000-0000" value={f.guardianPhone} onChange={(e) => setF((p) => ({ ...p, guardianPhone: formatPhone(e.target.value) }))} />
                </div>
            </div>


            {/* EMAIL + ACTIONS */}
            {!inviteId && (
                <label className={styles.checkboxRow} style={{ marginTop: 8 }}>
                    <input type="checkbox" checked={emailClient} onChange={(e) => setEmailClient(e.target.checked)} />
                    <span>Also email the client at the address above (recommended)</span>
                </label>
            )}
            <div className={styles.actionsRow}>
                {!inviteId && <button type="button" className={styles.btnPrimary} disabled={saving} onClick={send}>{saving ? 'Sending…' : 'Send contract to client'}</button>}
                {inviteId && <button type="button" className={styles.btnSecondary} onClick={reset}>Clear form (new client)</button>}
            </div>
            {inviteId && <p style={{ fontSize: 11, color: '#555', marginTop: 14, fontFamily: 'Poppins, sans-serif' }}>Contract id: {inviteId}</p>}
        </div>
    );
}
