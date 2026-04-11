'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { AdminContractPayload } from '@/lib/contracts/adminContractPayload';
import { SPECIAL_EVENT_INIT_IDS, type SpecialEventInitId } from '@/lib/contracts/specialEventConstants';
import { SPECIAL_EVENT_INIT_LABELS } from '@/lib/contracts/specialEventInitLabels';
import styles from './contract-sign.module.css';
import './special-events-contract.prose.css';

type WizardApi = {
    ok: true;
    letterheadHtml: string;
    chunks: string[];
    stepLabels: string[];
};

const ALLERGY_OPTIONS = [
    '',
    'None',
    'Latex',
    'Fragrance / Perfume',
    'Hair Dye / PPD (para-phenylenediamine)',
    'Shellac / Gel products',
    'Nail Acrylic / Monomer',
    'Nickel / Metal',
    'Adhesives / Glue',
    'Essential Oils',
    'Preservatives (parabens, formaldehyde)',
    'Multiple allergies — see details below',
    'Other — see details below',
] as const;

const SKIN_OPTIONS = [
    '',
    'None',
    'Sensitive skin',
    'Eczema',
    'Psoriasis',
    'Rosacea',
    'Acne / Active breakouts',
    'Dermatitis (contact or seborrheic)',
    'Scalp condition (dandruff, seborrhea, psoriasis)',
    'Thin / damaged hair or scalp',
    'Recent chemical service (within 4 weeks)',
    'Multiple conditions — see details below',
    'Other — see details below',
] as const;

const PHOTO_OPTIONS = ['', 'Yes — full consent granted', 'No — consent denied'] as const;

function needsAllergyDetail(sel: string): boolean {
    return sel.includes('see details below') || sel.includes('Multiple') || sel.includes('Other');
}

function needsSkinDetail(sel: string): boolean {
    return (
        sel.includes('see details below') ||
        sel.includes('Multiple') ||
        sel.includes('Other') ||
        sel.includes('Scalp condition')
    );
}

function longDateFromIso(iso: string): string {
    const d = new Date(`${iso}T12:00:00`);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function emptyInitials(): Record<SpecialEventInitId, string> {
    const o = {} as Record<SpecialEventInitId, string>;
    for (const id of SPECIAL_EVENT_INIT_IDS) o[id] = '';
    return o;
}

export default function SpecialEventSignWizard({
    token,
    adminPayload,
    contractNumber,
    onComplete,
}: {
    token: string;
    adminPayload: AdminContractPayload;
    contractNumber: string | null;
    onComplete: (referenceCode: string | null) => void;
}) {
    const [wizard, setWizard] = useState<WizardApi | null>(null);
    const [loadErr, setLoadErr] = useState('');
    const [phase, setPhase] = useState(0);
    const [submitErr, setSubmitErr] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const [allergySelect, setAllergySelect] = useState('');
    const [allergyDetail, setAllergyDetail] = useState('');
    const [skinSelect, setSkinSelect] = useState('');
    const [skinDetail, setSkinDetail] = useState('');
    const [photoValue, setPhotoValue] = useState('');
    const [photoRestrict, setPhotoRestrict] = useState('');
    const [initials, setInitials] = useState(emptyInitials);
    const [printedName, setPrintedName] = useState(adminPayload.clientLegalName || '');
    const [signDateIso, setSignDateIso] = useState(() => new Date().toISOString().slice(0, 10));
    const [geoConsent, setGeoConsent] = useState(false);
    /** Snapshot when leaving Sign step — canvas is unmounted on Review, so POST must use this. */
    const [capturedSignaturePng, setCapturedSignaturePng] = useState('');
    const [signStepErr, setSignStepErr] = useState('');

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const drawing = useRef(false);
    const last = useRef<{ x: number; y: number } | null>(null);

    const termCount = wizard?.chunks.length ?? 0;
    const totalPhases = useMemo(() => 1 + termCount + 4, [termCount]);
    const signPhaseIndex = termCount + 3;

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch(`/api/contracts/sign/${encodeURIComponent(token)}/wizard`);
                const data = await res.json();
                if (cancelled) return;
                if (!res.ok || !data.ok) {
                    setLoadErr(data.error || 'Could not load agreement.');
                    return;
                }
                setWizard(data as WizardApi);
            } catch {
                if (!cancelled) setLoadErr('Could not load agreement.');
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [token]);

    const pos = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        const c = canvasRef.current;
        if (!c) return { x: 0, y: 0 };
        const r = c.getBoundingClientRect();
        const scaleX = c.width / r.width;
        const scaleY = c.height / r.height;
        if ('touches' in e && e.touches[0]) {
            return { x: (e.touches[0].clientX - r.left) * scaleX, y: (e.touches[0].clientY - r.top) * scaleY };
        }
        const me = e as React.MouseEvent<HTMLCanvasElement>;
        return { x: (me.clientX - r.left) * scaleX, y: (me.clientY - r.top) * scaleY };
    }, []);

    const startDraw = useCallback(
        (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
            drawing.current = true;
            last.current = pos(e);
        },
        [pos]
    );

    const endDraw = useCallback(() => {
        drawing.current = false;
        last.current = null;
    }, []);

    const doDraw = useCallback(
        (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
            if (!drawing.current) return;
            const c = canvasRef.current;
            if (!c) return;
            const ctx = c.getContext('2d');
            if (!ctx) return;
            const p = pos(e);
            const prev = last.current;
            if (prev) {
                ctx.strokeStyle = '#1e1018';
                ctx.lineWidth = 2;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(prev.x, prev.y);
                ctx.lineTo(p.x, p.y);
                ctx.stroke();
            }
            last.current = p;
        },
        [pos]
    );

    const clearCanvas = useCallback(() => {
        const c = canvasRef.current;
        if (!c) return;
        const ctx = c.getContext('2d');
        if (!ctx) return;
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, c.width, c.height);
        setCapturedSignaturePng('');
        setSignStepErr('');
    }, []);

    useEffect(() => {
        const c = canvasRef.current;
        if (!c || phase !== signPhaseIndex) return;
        const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1;
        const w = Math.min(500, c.clientWidth || 320);
        const h = 130;
        c.width = w * dpr;
        c.height = h * dpr;
        const ctx = c.getContext('2d');
        if (!ctx) return;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, w, h);
        if (capturedSignaturePng.length >= 80) {
            const img = new Image();
            img.onload = () => {
                const c2 = canvasRef.current;
                if (!c2) return;
                const x = c2.getContext('2d');
                if (!x) return;
                x.fillStyle = '#fff';
                x.fillRect(0, 0, w, h);
                x.drawImage(img, 0, 0, w, h);
            };
            img.src = `data:image/png;base64,${capturedSignaturePng}`;
        }
    }, [phase, signPhaseIndex, capturedSignaturePng]);

    const canvasToBase64 = useCallback(() => {
        const c = canvasRef.current;
        if (!c) return '';
        const u = c.toDataURL('image/png');
        return u.includes(',') ? u.split(',')[1] || '' : u;
    }, []);

    const submit = useCallback(async () => {
        setSubmitErr('');
        setSubmitting(true);
        try {
            const sig = capturedSignaturePng.trim() || canvasToBase64();
            if (sig.length < 80) {
                setSubmitErr('A valid signature image is required. Go back to the Sign step and continue again.');
                setSubmitting(false);
                return;
            }
            const body = {
                mode: 'special-events-v1' as const,
                allergySelect,
                allergyDetail,
                skinSelect,
                skinDetail,
                photoValue,
                photoRestrict: photoValue === 'No — consent denied' ? photoRestrict : '',
                geoConsent: true as const,
                initials: Object.fromEntries(
                    SPECIAL_EVENT_INIT_IDS.map((id) => [id, (initials[id] || '').trim().toUpperCase()])
                ) as Record<SpecialEventInitId, string>,
                printedName: printedName.trim(),
                clientSignDateDisplay: longDateFromIso(signDateIso),
                signatureMethod: 'draw' as const,
                signaturePngBase64: sig,
            };
            if (!geoConsent) {
                setSubmitErr('Please confirm data collection consent.');
                setSubmitting(false);
                return;
            }
            const res = await fetch(`/api/contracts/sign/${encodeURIComponent(token)}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                setSubmitErr(typeof data.error === 'string' ? data.error : 'Submission failed.');
                setSubmitting(false);
                return;
            }
            onComplete(typeof data.referenceCode === 'string' ? data.referenceCode : null);
        } catch {
            setSubmitErr('Network error. Try again.');
        }
        setSubmitting(false);
    }, [
        allergySelect,
        allergyDetail,
        skinSelect,
        skinDetail,
        photoValue,
        photoRestrict,
        initials,
        printedName,
        signDateIso,
        geoConsent,
        capturedSignaturePng,
        canvasToBase64,
        token,
        onComplete,
    ]);

    const goNext = useCallback(() => {
        setSignStepErr('');
        setSubmitErr('');
        if (phase === signPhaseIndex) {
            const b64 = canvasToBase64();
            if (b64.length < 80) {
                setSignStepErr('Please draw your signature in the box before continuing.');
                return;
            }
            if (!printedName.trim()) {
                setSignStepErr('Please enter your printed legal name.');
                return;
            }
            if (!geoConsent) {
                setSignStepErr('Please confirm data collection consent (Section 29).');
                return;
            }
            setCapturedSignaturePng(b64);
        }
        const initialsPhaseIdx = termCount + 2;
        if (phase === initialsPhaseIdx) {
            const missing = SPECIAL_EVENT_INIT_IDS.filter((id) => !(initials[id] || '').trim());
            if (missing.length) {
                setSignStepErr('Please enter your initials for every item before continuing.');
                return;
            }
        }
        setPhase((p) => p + 1);
    }, [
        phase,
        signPhaseIndex,
        termCount,
        canvasToBase64,
        printedName,
        geoConsent,
        initials,
    ]);

    if (loadErr) {
        return (
            <div className={styles.specialShell}>
                <p style={{ color: '#ff6b8a' }}>{loadErr}</p>
            </div>
        );
    }

    if (!wizard) {
        return (
            <div className={styles.specialShell} style={{ color: 'var(--text-muted)', textAlign: 'center' }}>
                Loading agreement…
            </div>
        );
    }

    const introPhase = 0;
    const firstTermPhase = 1;
    const lastTermPhase = termCount;
    const detailsPhase = termCount + 1;
    const initialsPhase = termCount + 2;
    const signPhase = termCount + 3;
    const reviewPhase = termCount + 4;

    const stepLabel =
        phase === introPhase
            ? 'Overview'
            : phase >= firstTermPhase && phase <= lastTermPhase
              ? wizard.stepLabels[phase - 1] || `Part ${phase}`
              : phase === detailsPhase
                ? 'Your health & photo preferences'
                : phase === initialsPhase
                  ? 'Initials'
                  : phase === signPhase
                    ? 'Sign'
                    : 'Review & submit';

    return (
        <div className={styles.specialShell}>
            <div className={styles.wizardProgress}>
                <span className={styles.wizardProgressText}>
                    Step {phase + 1} of {totalPhases}
                </span>
                <span className={styles.wizardProgressSub}>{stepLabel}</span>
                <div className={styles.wizardProgressBar}>
                    <div
                        className={styles.wizardProgressFill}
                        style={{ width: `${((phase + 1) / totalPhases) * 100}%` }}
                    />
                </div>
            </div>

            {phase === introPhase ? (
                <div>
                    <h1 className={styles.specialTitle}>Your agreement</h1>
                    {contractNumber ? <p className={styles.specialMeta}>Contract {contractNumber}</p> : null}
                    <p className={styles.specialHint} style={{ marginBottom: 20 }}>
                        Review the summary below, then continue through each part of the contract. You will enter health
                        details, add your initials, sign, and submit.
                    </p>
                    <div className="ggsContractShell" style={{ marginBottom: 24 }}>
                        <div
                            className="contract"
                            dangerouslySetInnerHTML={{ __html: wizard.letterheadHtml }}
                            suppressHydrationWarning
                        />
                    </div>
                    <div className={styles.introGrid}>
                        <div className={styles.introItem}>
                            <span className={styles.introKey}>Client</span>
                            <span className={styles.introVal}>{adminPayload.clientLegalName}</span>
                        </div>
                        <div className={styles.introItem}>
                            <span className={styles.introKey}>Event</span>
                            <span className={styles.introVal}>
                                {adminPayload.eventType} · {adminPayload.eventDate}
                            </span>
                        </div>
                        <div className={styles.introItem}>
                            <span className={styles.introKey}>Venue</span>
                            <span className={styles.introVal}>{adminPayload.venue}</span>
                        </div>
                        <div className={styles.introItem}>
                            <span className={styles.introKey}>Email</span>
                            <span className={styles.introVal}>{adminPayload.email}</span>
                        </div>
                    </div>
                </div>
            ) : null}

            {phase >= firstTermPhase && phase <= lastTermPhase ? (
                <div>
                    <h2 className={styles.wizardChunkTitle}>{wizard.stepLabels[phase - 1]}</h2>
                    <div className="ggsContractShell">
                        <div className="contract">
                            <div className="c-body">
                                <div
                                    dangerouslySetInnerHTML={{ __html: wizard.chunks[phase - 1] || '' }}
                                    suppressHydrationWarning
                                />
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}

            {phase === detailsPhase ? (
                <div className={styles.wizardFormCard}>
                    <h2 className={styles.wizardChunkTitle}>Your health &amp; photo preferences</h2>
                    <label className={styles.wizardLabel}>Allergies</label>
                    <select
                        className={styles.wizardInput}
                        value={allergySelect}
                        onChange={(e) => setAllergySelect(e.target.value)}
                    >
                        {ALLERGY_OPTIONS.map((o, i) => (
                            <option key={`a-${i}`} value={o}>
                                {o || 'Select…'}
                            </option>
                        ))}
                    </select>
                    {needsAllergyDetail(allergySelect) ? (
                        <>
                            <label className={styles.wizardLabel}>Allergy details</label>
                            <textarea
                                className={styles.wizardTextarea}
                                value={allergyDetail}
                                onChange={(e) => setAllergyDetail(e.target.value)}
                                rows={3}
                            />
                        </>
                    ) : null}

                    <label className={styles.wizardLabel}>Skin &amp; scalp</label>
                    <select
                        className={styles.wizardInput}
                        value={skinSelect}
                        onChange={(e) => setSkinSelect(e.target.value)}
                    >
                        {SKIN_OPTIONS.map((o, i) => (
                            <option key={`s-${i}`} value={o}>
                                {o || 'Select…'}
                            </option>
                        ))}
                    </select>
                    {needsSkinDetail(skinSelect) ? (
                        <>
                            <label className={styles.wizardLabel}>Details</label>
                            <textarea
                                className={styles.wizardTextarea}
                                value={skinDetail}
                                onChange={(e) => setSkinDetail(e.target.value)}
                                rows={3}
                            />
                        </>
                    ) : null}

                    <label className={styles.wizardLabel}>Photo &amp; video consent</label>
                    <select
                        className={styles.wizardInput}
                        value={photoValue}
                        onChange={(e) => setPhotoValue(e.target.value)}
                    >
                        {PHOTO_OPTIONS.map((o, i) => (
                            <option key={`p-${i}`} value={o}>
                                {o === '' ? 'Select…' : o}
                            </option>
                        ))}
                    </select>
                    {photoValue === 'No — consent denied' ? (
                        <>
                            <label className={styles.wizardLabel}>Describe restrictions</label>
                            <input
                                className={styles.wizardInput}
                                value={photoRestrict}
                                onChange={(e) => setPhotoRestrict(e.target.value)}
                            />
                        </>
                    ) : null}
                </div>
            ) : null}

            {phase === initialsPhase ? (
                <div className={styles.wizardFormCard}>
                    <h2 className={styles.wizardChunkTitle}>Your initials</h2>
                    <p className={styles.specialHint} style={{ marginBottom: 16 }}>
                        Enter the initials you are agreeing to for each item (usually 2–3 letters).
                    </p>
                    {signStepErr ? <p style={{ color: '#ff6b8a', marginBottom: 12 }}>{signStepErr}</p> : null}
                    <div className={styles.initialsGrid}>
                        {SPECIAL_EVENT_INIT_IDS.map((id) => (
                            <div key={id} className={styles.initialsRow}>
                                <label className={styles.initialsLabel} htmlFor={id}>
                                    {SPECIAL_EVENT_INIT_LABELS[id]}
                                </label>
                                <input
                                    id={id}
                                    className={styles.initialsInput}
                                    maxLength={4}
                                    value={initials[id]}
                                    onChange={(e) =>
                                        setInitials((prev) => ({ ...prev, [id]: e.target.value.toUpperCase() }))
                                    }
                                />
                            </div>
                        ))}
                    </div>
                </div>
            ) : null}

            {phase === signPhase ? (
                <div className={styles.wizardFormCard}>
                    <h2 className={styles.wizardChunkTitle}>Sign</h2>
                    {signStepErr ? <p style={{ color: '#ff6b8a', marginBottom: 12 }}>{signStepErr}</p> : null}
                    <label className={styles.wizardLabel}>Draw your signature</label>
                    <canvas
                        ref={canvasRef}
                        className={styles.sigCanvas}
                        onMouseDown={startDraw}
                        onMouseUp={endDraw}
                        onMouseLeave={endDraw}
                        onMouseMove={doDraw}
                        onTouchStart={(e) => {
                            e.preventDefault();
                            startDraw(e);
                        }}
                        onTouchEnd={endDraw}
                        onTouchMove={(e) => {
                            e.preventDefault();
                            doDraw(e);
                        }}
                    />
                    <button type="button" className={styles.wizardSecondaryBtn} onClick={clearCanvas}>
                        Clear signature
                    </button>

                    <label className={styles.wizardLabel}>Printed legal name</label>
                    <input
                        className={styles.wizardInput}
                        value={printedName}
                        onChange={(e) => setPrintedName(e.target.value)}
                    />

                    <label className={styles.wizardLabel}>Signing date</label>
                    <input
                        type="date"
                        className={styles.wizardInput}
                        value={signDateIso}
                        onChange={(e) => setSignDateIso(e.target.value)}
                    />

                    <label className={styles.wizardCheck}>
                        <input type="checkbox" checked={geoConsent} onChange={(e) => setGeoConsent(e.target.checked)} />I
                        consent to the collection of my IP address, approximate location, device information, and execution
                        timestamp for authenticating my signature, as described in Section 29.
                    </label>
                </div>
            ) : null}

            {phase === reviewPhase ? (
                <div className={styles.wizardFormCard}>
                    <h2 className={styles.wizardChunkTitle}>Ready to submit</h2>
                    <p className={styles.specialHint}>
                        By submitting, you confirm you read the agreement, your information is accurate, and you agree to
                        be bound by the contract.
                    </p>
                    {capturedSignaturePng.length >= 80 ? (
                        <div style={{ marginBottom: 16 }}>
                            <p className={styles.wizardLabel} style={{ marginBottom: 8 }}>
                                Your signature
                            </p>
                            <img
                                alt="Your signature"
                                src={`data:image/png;base64,${capturedSignaturePng}`}
                                style={{ maxWidth: '100%', height: 'auto', borderRadius: 8, border: '1px solid #333' }}
                            />
                        </div>
                    ) : null}
                    {submitErr ? <p style={{ color: '#ff6b8a', marginBottom: 12 }}>{submitErr}</p> : null}
                    <button
                        type="button"
                        className={styles.wizardPrimaryBtn}
                        disabled={submitting}
                        onClick={() => void submit()}
                    >
                        {submitting ? 'Submitting…' : 'Submit signed agreement'}
                    </button>
                </div>
            ) : null}

            <div className={styles.wizardNav}>
                <button
                    type="button"
                    className={styles.wizardSecondaryBtn}
                    disabled={phase === 0}
                    onClick={() => setPhase((p) => Math.max(0, p - 1))}
                >
                    Back
                </button>
                {phase < reviewPhase ? (
                    <button type="button" className={styles.wizardPrimaryBtn} onClick={goNext}>
                        Continue
                    </button>
                ) : null}
            </div>
        </div>
    );
}
