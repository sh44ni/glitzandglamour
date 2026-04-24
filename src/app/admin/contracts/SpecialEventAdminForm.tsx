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
                                return (
                                    <button
                                        key={k}
                                        type="button"
                                        role="option"
                                        aria-selected={isActive}
                                        className={isActive ? styles.dropdownItemActive : styles.dropdownItem}
                                        onClick={() => { onChange(k); setOpen(false); }}
                                    >
                                        {t.title}
                                        {k.endsWith('ES') && <span className={styles.dropdownBadge}>ES</span>}
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
    breakHours: string;
    // 13 · Overtime
    overtimeRate: string;
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
    breakHours: '4',
    overtimeRate: '75.00',
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

    const t = useMemo(() => totals(f), [f]);
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
        contractDate: f.contractDate, contractNumber: f.contractNumber,
        clientLegalName: f.clientLegalName, phone: f.phone, email: f.email,
        eventType: f.eventType, eventDate: f.eventDate, startTime: f.startTime,
        venue: f.travelEnabled ? (f.dyn.locationAddress || f.venue || '') : 'Glitz & Glamour Studio — 812 Frances Dr, Vista, CA 92084',
        headcount: f.headcount,
        services: f.services,
        travelRequired: f.travelEnabled ? 'Yes' : 'No',
        travelFee: f.travelEnabled ? (f.dyn.travelFee || '0') : '0',
        travelDest: f.travelEnabled ? (f.dyn.locationAddress || f.venue || 'TBD') : '',
        miles: f.travelEnabled ? (f.dyn.travelDistance || '0') : '0',
        retainer: f.retainer || '0', balance: f.balance || '0',
        paymentPlanEnabled: !!f.ppActive && f.ppActive === 'Yes',
        travelEnabled: f.travelEnabled, trialFeeEnabled: false,
        ppActive: f.ppActive || 'N/A',
        pp2Amt: f.pp2Amt || '0', pp2Date: f.pp2Date || '',
        pp3Amt: f.pp3Amt || '0', pp3Date: f.pp3Date || '',
        ppFinal: f.ppFinal || '0',
        minSvc: f.minSvc || f.headcount || '1',
        lockDays: f.lockDays || '14',
        prepFee: f.prepFee || '25.00',
        overtimeRate: f.overtimeRate || '75.00',
        trialFee: 'N/A', minors: 'N/A', guardian: 'N/A', guardianPhone: 'N/A',
        parkingNotes: !f.travelEnabled ? (f.dyn.parkingNotes || '') : '',
        internalNotes: [
            f.contractType ? `Template: ${f.contractType}` : '',
            ...Object.entries(f.dyn).filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`),
        ].filter(Boolean).join('\n'),
    });

    const send = useCallback(async () => {
        setErr(''); setCopied(false);
        if (!f.contractType) { setErr('Please select a contract type first!'); return; }
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
        <div>
            {/* CONTRACT TYPE SELECTOR */}
            <div className={styles.selectorContainer}>
                <label className={styles.selectorLabel}>📋 Select Contract Template:</label>
                <ContractDropdown value={f.contractType} onChange={(v) => set('contractType', v)} />
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
                    <div className={styles.formGroup}><label>Phone</label><input type="tel" className={styles.input} placeholder="(555) 123-4567" value={f.phone} onChange={inp('phone')} /></div>
                    <div className={styles.formGroup}><label>Email *</label><input type="email" className={styles.input} placeholder="client@example.com" value={f.email} onChange={inp('email')} /></div>
                    <div className={styles.formGroup}>
                        <label>Event Type</label>
                        <CustomSelect
                            options={['Wedding', 'Corporate Event', 'Private Party', 'Other']}
                            value={f.eventType}
                            onChange={(v) => set('eventType', v)}
                            placeholder="Select..."
                        />
                    </div>
                </div>
                <div className={styles.formGrid}>
                    <div className={styles.formGroup}><label>Event Date</label><input type="date" className={styles.input} value={f.eventDate} onChange={inp('eventDate')} /></div>
                    <div className={styles.formGroup}><label>Start Time</label><input type="time" className={styles.input} value={f.startTime} onChange={inp('startTime')} /></div>
                </div>
                <div className={styles.formGroup} style={{ marginTop: 4 }}><label>Venue / Address</label><input className={styles.input} placeholder="Enter complete venue address" value={f.venue} onChange={inp('venue')} /></div>
                <div className={styles.formGroup} style={{ marginTop: 16 }}><label># People Serviced</label><input type="number" min={1} className={styles.input} value={f.headcount} onChange={inp('headcount')} style={{ maxWidth: 200 }} /></div>
            </div>

            {/* DYNAMIC TEMPLATE FIELDS (data-driven) */}
            {tpl && (
                <div className={styles.formSection}>
                    <h2>{tpl.sectionTitle} {f.contractType.endsWith('ES') && <span className={styles.dropdownBadge}>ES</span>}</h2>
                    <div className={styles.fieldHighlight}>
                        <p><strong style={{ color: '#FF6BA8' }}>{tpl.sectionTitle}:</strong></p>
                        {tpl.dynamicFields.map((field, idx) => {
                            const nextField = tpl.dynamicFields[idx + 1];
                            const isHalf = field.half;
                            const nextIsHalf = nextField?.half;

                            // Start a grid row if this is the first of a half-pair
                            if (isHalf && (idx === 0 || !tpl.dynamicFields[idx - 1]?.half)) {
                                return (
                                    <div key={field.key} className={styles.formGrid} style={{ marginTop: 14 }}>
                                        <div className={styles.formGroup}>
                                            <label>{field.label}</label>
                                            <DynFieldInput field={field} value={f.dyn[field.key] ?? ''} onChange={(v) => setDyn(field.key, v)} />
                                        </div>
                                        {nextIsHalf && nextField && (
                                            <div className={styles.formGroup}>
                                                <label>{nextField.label}</label>
                                                <DynFieldInput field={nextField} value={f.dyn[nextField.key] ?? ''} onChange={(v) => setDyn(nextField.key, v)} />
                                            </div>
                                        )}
                                    </div>
                                );
                            }
                            // Skip second of a half-pair (already rendered above)
                            if (isHalf && idx > 0 && tpl.dynamicFields[idx - 1]?.half) return null;

                            return (
                                <div key={field.key} className={styles.formGroup} style={{ marginTop: 14 }}>
                                    <label>{field.label}</label>
                                    <DynFieldInput field={field} value={f.dyn[field.key] ?? ''} onChange={(v) => setDyn(field.key, v)} />
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

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

            {/* TRAVEL & PRICING */}
            <div className={styles.formSection}>
                <h2>Location &amp; Pricing</h2>

                {/* Location type toggle */}
                <label style={{ fontFamily: 'Poppins, sans-serif', fontSize: 11, fontWeight: 600, color: '#888', letterSpacing: '0.8px', textTransform: 'uppercase', display: 'block', marginBottom: 10 }}>Service Location Type</label>
                <div className={styles.locationToggle}>
                    <button
                        type="button"
                        className={`${styles.locationBtn} ${!f.travelEnabled ? styles.locationBtnActive : ''}`}
                        onClick={() => set('travelEnabled', false)}
                    >
                        <span className={styles.locationBtnIcon}>🏠</span>
                        <span className={styles.locationBtnLabel}>In-Studio</span>
                        <span className={styles.locationBtnSub}>812 Frances Dr, Vista CA</span>
                    </button>
                    <button
                        type="button"
                        className={`${styles.locationBtn} ${f.travelEnabled ? styles.locationBtnActive : ''}`}
                        onClick={() => set('travelEnabled', true)}
                    >
                        <span className={styles.locationBtnIcon}>🚗</span>
                        <span className={styles.locationBtnLabel}>On Location</span>
                        <span className={styles.locationBtnSub}>Travel fees apply</span>
                    </button>
                </div>

                {/* In-studio: parking notes field */}
                {!f.travelEnabled && (
                    <div className={styles.formGroup} style={{ marginBottom: 16 }}>
                        <label>Parking / Access Notes <span style={{ color: '#666', fontWeight: 400 }}>(optional)</span></label>
                        <input className={styles.input} placeholder="e.g. Street parking available on Frances Dr, no permit required" value={f.dyn.parkingNotes ?? ''} onChange={(e) => setDyn('parkingNotes', e.target.value)} />
                    </div>
                )}

                {/* On-location: travel fields */}
                {f.travelEnabled && (
                    <div style={{ marginBottom: 16 }}>
                        <div className={styles.formGroup} style={{ marginBottom: 14 }}>
                            <label>Event Location Address *</label>
                            <input className={styles.input} placeholder="Complete venue address" value={f.dyn.locationAddress ?? ''} onChange={(e) => setDyn('locationAddress', e.target.value)} />
                        </div>
                        <div className={styles.formGrid}>
                            <div className={styles.formGroup}>
                                <label>Est. Miles (one-way)</label>
                                <input type="number" className={styles.input} placeholder="0" value={f.dyn.travelDistance ?? ''} onChange={(e) => setDyn('travelDistance', e.target.value)} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Travel Fee ($)</label>
                                <input type="number" className={styles.input} placeholder="0.00" value={f.dyn.travelFee ?? ''} onChange={(e) => setDyn('travelFee', e.target.value)} />
                            </div>
                        </div>
                    </div>
                )}

                <div className={styles.totalsBox}>
                    <h4>Auto totals (services + travel)</h4>
                    <div className={styles.totalsRow}>Services subtotal: <strong>{fmt(t.sub)}</strong></div>
                    <div className={styles.totalsRow}>Travel fee: <strong>{f.travelEnabled ? fmt(t.tv) : '—'}</strong></div>
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
                <h2>11 · Preparation Fee &amp; Workspace Break</h2>
                <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                        <label>Prep Fee Per Person ($)</label>
                        <input type="number" min={0} step="0.01" className={styles.input} placeholder="25.00" value={f.prepFee} onChange={(e) => setF((p) => ({ ...p, prepFee: e.target.value }))} />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Break / Water / Meal Threshold <span style={{ color: '#666', fontWeight: 400, fontSize: 11 }}>(hours)</span></label>
                        <input type="number" min={1} className={styles.input} placeholder="4" value={f.breakHours} onChange={(e) => setF((p) => ({ ...p, breakHours: e.target.value }))} />
                    </div>
                </div>
            </div>

            {/* 13 · OVERTIME RATE */}
            <div className={styles.formSection}>
                <h2>13 · Overtime Rate</h2>
                <div className={styles.formGroup} style={{ maxWidth: 300 }}>
                    <label>Overtime Rate Per Hour ($)</label>
                    <input type="number" min={0} step="0.01" className={styles.input} placeholder="75.00" value={f.overtimeRate} onChange={(e) => setF((p) => ({ ...p, overtimeRate: e.target.value }))} />
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
