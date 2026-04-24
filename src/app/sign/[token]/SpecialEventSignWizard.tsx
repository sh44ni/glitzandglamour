'use client';

import {
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { createPortal } from 'react-dom';
import type { AdminContractPayload } from '@/lib/contracts/adminContractPayload';
import {
    computeSpecialEventPricing,
    formatAllergyDisplay,
    formatSkinDisplay,
    SIGNATURE_TYPEFACE_OPTIONS,
    type SignatureTypefaceId,
} from '@/lib/contracts/adminContractPayload';
import type { WizardChunkClient } from '@/lib/contracts/contractFragment';
import type { NativeContentBlock } from '@/lib/contracts/nativeContentBlocks';
import type { SpecialEventInitId } from '@/lib/contracts/specialEventConstants';
import { SPECIAL_EVENT_INIT_LABELS } from '@/lib/contracts/specialEventInitLabels';
import styles from './contract-sign.module.css';

type WizardApi = {
    ok: true;
    chunks: WizardChunkClient[];
    stepLabels: string[];
    requiredInitialIds: SpecialEventInitId[];
};

const SIGN_FONTS_HREF =
    'https://fonts.googleapis.com/css2?family=Allura&family=Caveat:wght@400;600&family=Cinzel:wght@500;600&family=Dancing+Script:wght@400;700&family=Great+Vibes&family=Parisienne&display=swap';

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

function chunkRequiresAllergyDisclosure(chunk: WizardChunkClient): boolean {
    return chunk.sections.some((s) => s.initialIds.includes('init_allergy'));
}
function chunkRequiresPhotoDisclosure(chunk: WizardChunkClient): boolean {
    return chunk.sections.some((s) => s.initialIds.includes('init_photo'));
}
function chunkRequiresDisclosure(chunk: WizardChunkClient): boolean {
    return chunkRequiresAllergyDisclosure(chunk) || chunkRequiresPhotoDisclosure(chunk);
}

/** First A–Z letter of each word from the client name, max 4 (matches initials field rules). */
function suggestInitialsFromName(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    let out = '';
    for (const p of parts) {
        for (let i = 0; i < p.length && out.length < 4; i++) {
            const ch = p[i]!.toUpperCase();
            if (ch >= 'A' && ch <= 'Z') {
                out += ch;
                break;
            }
        }
    }
    return out.slice(0, 4);
}

function longDateFromIso(iso: string): string {
    const d = new Date(`${iso}T12:00:00`);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

// NativeBlocks v2 — renders rich HTML via dangerouslySetInnerHTML
function NativeBlocks({ blocks }: { blocks: NativeContentBlock[] }) {
    return (
        <div className={styles.wizardNativeProse}>
            {blocks.map((b, i) => {
                switch (b.type) {
                    case 'heading': {
                        if (b.level <= 2) {
                            return (
                                <h2 key={i} className={styles.wizardNativeHeading}>
                                    {b.text}
                                </h2>
                            );
                        }
                        if (b.level === 3) {
                            return (
                                <h3 key={i} className={styles.wizardNativeHeading}>
                                    {b.text}
                                </h3>
                            );
                        }
                        return (
                            <h4 key={i} className={styles.wizardNativeHeading}>
                                {b.text}
                            </h4>
                        );
                    }
                    case 'paragraph':
                        return (
                            <p key={i} className={styles.wizardNativeP} dangerouslySetInnerHTML={{ __html: b.text }} />
                        );
                    case 'list':
                        return b.ordered ? (
                            <ol key={i} className={styles.wizardNativeList}>
                                {b.items.map((item, j) => (
                                    <li key={j} dangerouslySetInnerHTML={{ __html: item }} />
                                ))}
                            </ol>
                        ) : (
                            <ul key={i} className={styles.wizardNativeList}>
                                {b.items.map((item, j) => (
                                    <li key={j} dangerouslySetInnerHTML={{ __html: item }} />
                                ))}
                            </ul>
                        );
                    case 'keyValue':
                        return (
                            <div key={i} className={styles.wizardNativeKv}>
                                <span className={styles.wizardNativeKvLabel}>{b.label}</span>
                                <span className={styles.wizardNativeKvVal}>{b.value}</span>
                            </div>
                        );
                    case 'table':
                        return (
                            <div key={i} className={styles.wizardNativeTableWrap}>
                                <table className={styles.wizardNativeTable}>
                                    {b.headers.length > 0 ? (
                                        <thead>
                                            <tr>
                                                {b.headers.map((h, j) => (
                                                    <th key={j}>{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                    ) : null}
                                    <tbody>
                                        {b.rows.map((row, ri) => (
                                            <tr key={ri}>
                                                {row.map((cell, ci) => (
                                                    <td key={ci}>{cell}</td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        );
                    case 'horizontalRule':
                        return <hr key={i} className={styles.wizardNativeHr} />;
                    case 'callout':
                        return (
                            <div key={i} className={`${styles.wizardNativeCallout} ${b.variant === 'warning' ? styles.wizardNativeCalloutWarn : styles.wizardNativeCalloutInfo}`} dangerouslySetInnerHTML={{ __html: b.text }} />
                        );
                    default:
                        return null;
                }
            })}
        </div>
    );
}

async function rasterizeTypedSignature(text: string, fontFamily: string): Promise<string> {
    const raw = text.trim() || ' ';
    await document.fonts.ready;
    const w = 500;
    const h = 130;
    const dpr = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 2);
    const c = document.createElement('canvas');
    c.width = w * dpr;
    c.height = h * dpr;
    const ctx = c.getContext('2d');
    if (!ctx) return '';
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#1e1018';
    let fontPx = 44;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const measure = (px: number) => {
        ctx.font = `${px}px ${fontFamily}`;
        return ctx.measureText(raw).width;
    };
    while (fontPx > 16 && measure(fontPx) > w - 48) fontPx -= 2;
    ctx.font = `${fontPx}px ${fontFamily}`;
    ctx.fillText(raw, w / 2, h / 2);
    const u = c.toDataURL('image/png');
    return u.includes(',') ? u.split(',')[1] || '' : u;
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
    const [initials, setInitials] = useState<Record<string, string>>({});
    const [printedName, setPrintedName] = useState(adminPayload.clientLegalName || '');
    const [signDateIso, setSignDateIso] = useState(() => new Date().toISOString().slice(0, 10));
    const [geoConsent, setGeoConsent] = useState(false);
    const [capturedSignaturePng, setCapturedSignaturePng] = useState('');
    const [signStepErr, setSignStepErr] = useState('');

    const [signatureMode, setSignatureMode] = useState<'draw' | 'type'>('draw');
    const [typefaceId, setTypefaceId] = useState<SignatureTypefaceId>('dancing');
    const [typedSigText, setTypedSigText] = useState(adminPayload.clientLegalName || '');
    const [sigFontsReady, setSigFontsReady] = useState(false);

    const [openInitialId, setOpenInitialId] = useState<SpecialEventInitId | null>(null);
    const [draftInitial, setDraftInitial] = useState('');
    const [activeInitialId, setActiveInitialId] = useState<SpecialEventInitId | null>(null);

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const drawing = useRef(false);
    const last = useRef<{ x: number; y: number } | null>(null);
    const topRef = useRef<HTMLDivElement | null>(null);
    const initialSlotRefs = useRef<Partial<Record<SpecialEventInitId, HTMLButtonElement | null>>>({});
    const initSheetInputRef = useRef<HTMLInputElement | null>(null);

    const termCount = wizard?.chunks.length ?? 0;
    const totalPhases = useMemo(() => 1 + termCount + 2, [termCount]);
    const signPhaseIndex = termCount + 1;
    const reviewPhase = termCount + 2;

    const pricing = useMemo(() => computeSpecialEventPricing(adminPayload), [adminPayload]);

    useEffect(() => {
        const id = 'ggs-sign-fonts-css';
        if (document.getElementById(id)) return;
        const link = document.createElement('link');
        link.id = id;
        link.rel = 'stylesheet';
        link.href = SIGN_FONTS_HREF;
        document.head.appendChild(link);
    }, []);

    useLayoutEffect(() => {
        topRef.current?.scrollIntoView({ behavior: 'auto', block: 'start' });
        if (typeof window !== 'undefined') window.scrollTo(0, 0);
    }, [phase]);

    useEffect(() => {
        if (!openInitialId) return;
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = prevOverflow;
        };
    }, [openInitialId]);

    useLayoutEffect(() => {
        if (!openInitialId) return;
        const id = requestAnimationFrame(() => {
            initSheetInputRef.current?.focus({ preventScroll: true });
        });
        return () => cancelAnimationFrame(id);
    }, [openInitialId]);

    useEffect(() => {
        if (phase !== signPhaseIndex || signatureMode !== 'type') {
            setSigFontsReady(false);
            return;
        }
        let cancelled = false;
        void document.fonts.ready.then(() => {
            if (!cancelled) setSigFontsReady(true);
        });
        return () => {
            cancelled = true;
        };
    }, [phase, signPhaseIndex, signatureMode]);

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

    const stepInitialIdsForPhase = useCallback(
        (p: number): SpecialEventInitId[] => {
            if (!wizard || p < 1 || p > termCount) return [];
            const chunk = wizard.chunks[p - 1];
            return chunk.initialIds.filter((id) => wizard.requiredInitialIds.includes(id));
        },
        [wizard, termCount]
    );

    const termStepContinueBlocked = useMemo(() => {
        if (!wizard || phase < 1 || phase > termCount) return false;
        const ids = stepInitialIdsForPhase(phase);
        for (const id of ids) {
            const v = (initials[id] || '').trim();
            if (v.length < 1 || v.length > 4) return true;
        }
        const ch = wizard.chunks[phase - 1];
        if (chunkRequiresAllergyDisclosure(ch)) {
            if (!allergySelect.trim()) return true;
            if (needsAllergyDetail(allergySelect) && !allergyDetail.trim()) return true;
            if (!skinSelect.trim()) return true;
            if (needsSkinDetail(skinSelect) && !skinDetail.trim()) return true;
        }
        if (chunkRequiresPhotoDisclosure(ch)) {
            if (!photoValue.trim()) return true;
            if (photoValue === 'No — consent denied' && !photoRestrict.trim()) return true;
        }
        return false;
    }, [
        wizard,
        phase,
        termCount,
        stepInitialIdsForPhase,
        initials,
        allergySelect,
        allergyDetail,
        skinSelect,
        skinDetail,
        photoValue,
        photoRestrict,
    ]);

    useEffect(() => {
        if (!wizard) return;
        if (phase >= 1 && phase <= termCount) {
            const ids = stepInitialIdsForPhase(phase);
            const firstEmpty = ids.find((id) => !(initials[id] || '').trim());
            setActiveInitialId(firstEmpty ?? ids[ids.length - 1] ?? null);
        } else {
            setOpenInitialId(null);
        }
    }, [phase, wizard, termCount, stepInitialIdsForPhase, initials]);

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
        if (!c || phase !== signPhaseIndex || signatureMode !== 'draw') return;
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
    }, [phase, signPhaseIndex, signatureMode, capturedSignaturePng]);

    const canvasToBase64 = useCallback(() => {
        const c = canvasRef.current;
        if (!c) return '';
        const u = c.toDataURL('image/png');
        return u.includes(',') ? u.split(',')[1] || '' : u;
    }, []);

    const openInitialEditor = useCallback(
        (id: SpecialEventInitId) => {
            const existing = (initials[id] || '').trim().toUpperCase().replace(/[^A-Z]/g, '');
            const suggestion = suggestInitialsFromName(printedName || adminPayload.clientLegalName || '');
            setDraftInitial(existing || suggestion);
            setOpenInitialId(id);
            setActiveInitialId(id);
        },
        [initials, printedName, adminPayload.clientLegalName]
    );

    const saveInitialDraft = useCallback(() => {
        if (!openInitialId) return;
        const v = draftInitial.trim().toUpperCase();
        if (v.length < 1 || v.length > 4) return;
        setInitials((prev) => ({ ...prev, [openInitialId]: v }));
        setOpenInitialId(null);
    }, [openInitialId, draftInitial]);

    const goNextInitial = useCallback(() => {
        if (!wizard) return;
        const ids = stepInitialIdsForPhase(phase);
        const startIdx =
            activeInitialId && ids.includes(activeInitialId) ? ids.indexOf(activeInitialId) + 1 : 0;
        let next: SpecialEventInitId | undefined;
        for (let i = startIdx; i < ids.length; i++) {
            if (!(initials[ids[i]] || '').trim()) {
                next = ids[i];
                break;
            }
        }
        if (!next) {
            next = ids.find((id) => !(initials[id] || '').trim());
        }
        if (next) {
            setActiveInitialId(next);
            initialSlotRefs.current[next]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [wizard, phase, stepInitialIdsForPhase, activeInitialId, initials]);

    const submit = useCallback(async () => {
        if (!wizard) return;
        setSubmitErr('');
        setSubmitting(true);
        try {
            const sig = capturedSignaturePng.trim() || canvasToBase64();
            if (sig.length < 80) {
                setSubmitErr('A valid signature image is required. Go back to the Sign step and continue again.');
                setSubmitting(false);
                return;
            }
            const initialsPayload = Object.fromEntries(
                wizard.requiredInitialIds.map((id) => [id, (initials[id] || '').trim().toUpperCase()])
            );
            const body = {
                mode: 'special-events-v1' as const,
                allergySelect,
                allergyDetail,
                skinSelect,
                skinDetail,
                photoValue,
                photoRestrict: photoValue === 'No — consent denied' ? photoRestrict : '',
                geoConsent: true as const,
                initials: initialsPayload,
                printedName: printedName.trim(),
                clientSignDateDisplay: longDateFromIso(signDateIso),
                signatureMethod: signatureMode,
                ...(signatureMode === 'type' ? { signatureTypefaceId: typefaceId } : {}),
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
        wizard,
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
        signatureMode,
        typefaceId,
        token,
        onComplete,
    ]);

    const goNext = useCallback(() => {
        if (!wizard) return;
        setSignStepErr('');
        setSubmitErr('');

        if (phase >= 1 && phase <= termCount) {
            const ids = stepInitialIdsForPhase(phase);
            for (const id of ids) {
                const v = (initials[id] || '').trim();
                if (v.length < 1 || v.length > 4) {
                    setSignStepErr('Please add your initials for each item on this page (tap a row).');
                    return;
                }
            }
            const ch = wizard.chunks[phase - 1];
            if (chunkRequiresAllergyDisclosure(ch)) {
                if (!allergySelect.trim()) {
                    setSignStepErr('Please select an allergy / sensitivity option (Section 14).');
                    return;
                }
                if (!skinSelect.trim()) {
                    setSignStepErr('Please select a skin / scalp option (Section 14).');
                    return;
                }
                if (needsAllergyDetail(allergySelect) && !allergyDetail.trim()) {
                    setSignStepErr('Please add allergy details (Section 14).');
                    return;
                }
                if (needsSkinDetail(skinSelect) && !skinDetail.trim()) {
                    setSignStepErr('Please add skin / scalp details (Section 14).');
                    return;
                }
            }
            if (chunkRequiresPhotoDisclosure(ch)) {
                if (!photoValue.trim()) {
                    setSignStepErr('Please select photo / video consent (Section 15).');
                    return;
                }
                if (photoValue === 'No — consent denied' && !photoRestrict.trim()) {
                    setSignStepErr('Please describe photo restrictions when consent is denied (Section 15).');
                    return;
                }
            }
        }

        if (phase === signPhaseIndex) {
            if (!printedName.trim()) {
                setSignStepErr('Please enter your printed legal name.');
                return;
            }
            if (!geoConsent) {
                setSignStepErr('Please confirm data collection consent (Section 29).');
                return;
            }
            if (signatureMode === 'draw') {
                const b64 = canvasToBase64();
                if (b64.length < 80) {
                    setSignStepErr('Please draw your signature in the box before continuing.');
                    return;
                }
                setCapturedSignaturePng(b64);
                setPhase((p) => p + 1);
                return;
            }
            const fam =
                SIGNATURE_TYPEFACE_OPTIONS.find((o) => o.id === typefaceId)?.family ?? 'serif';
            const line = (typedSigText.trim() || printedName.trim());
            void rasterizeTypedSignature(line, fam).then((b64) => {
                if (b64.length < 80) {
                    setSignStepErr('Could not create typed signature. Try another style or use Draw.');
                    return;
                }
                setCapturedSignaturePng(b64);
                setPhase((p) => p + 1);
            });
            return;
        }

        setPhase((p) => p + 1);
    }, [
        wizard,
        phase,
        termCount,
        stepInitialIdsForPhase,
        initials,
        signPhaseIndex,
        printedName,
        geoConsent,
        signatureMode,
        typefaceId,
        typedSigText,
        canvasToBase64,
        allergySelect,
        allergyDetail,
        skinSelect,
        skinDetail,
        photoValue,
        photoRestrict,
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

    const stepLabel =
        phase === introPhase
            ? 'Overview'
            : phase >= firstTermPhase && phase <= lastTermPhase
              ? wizard.stepLabels[phase - 1] || `Part ${phase}`
              : phase === signPhaseIndex
                ? 'Sign'
                : 'Review & submit';

    const currentStepInitialIds = stepInitialIdsForPhase(phase);

    const typedPreviewFamily =
        SIGNATURE_TYPEFACE_OPTIONS.find((o) => o.id === typefaceId)?.family ?? 'serif';

    return (
        <div className={`${styles.specialShell} ${styles.specialSignWizard}`} ref={topRef}>
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
                    <p className={styles.specialHint} style={{ marginBottom: 16 }}>
                        Glitz &amp; Glamour Studio · Vista, CA. Review the summary below, then continue through each part
                        of the contract. You will initial each section as you go, enter health details, sign, and submit.
                    </p>
                    <div className={styles.introGrid}>
                        <div className={styles.introItem}>
                            <span className={styles.introKey}>Client</span>
                            <span className={styles.introVal}>{adminPayload.clientLegalName}</span>
                        </div>
                        <div className={styles.introItem}>
                            <span className={styles.introKey}>Phone</span>
                            <span className={styles.introVal}>{adminPayload.phone}</span>
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
                        <div className={styles.introItem}>
                            <span className={styles.introKey}>People serviced</span>
                            <span className={styles.introVal}>{adminPayload.headcount}</span>
                        </div>
                    </div>

                    <h2 className={styles.wizardChunkTitle} style={{ marginTop: 22 }}>
                        Services
                    </h2>
                    <div className={styles.wizardIntroTableWrap}>
                        <table className={styles.wizardNativeTable}>
                            <thead>
                                <tr>
                                    <th>Service</th>
                                    <th>Price</th>
                                    <th>Notes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pricing.serviceLines.length ? (
                                    pricing.serviceLines.map((row, i) => (
                                        <tr key={i}>
                                            <td>{row.description}</td>
                                            <td>{row.priceDisplay}</td>
                                            <td>{row.notes}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={3} style={{ color: 'var(--text-dim)', fontStyle: 'italic' }}>
                                            No services listed.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className={styles.wizardIntroTotals}>
                        <span>
                            <strong>Subtotal</strong>{' '}
                            {pricing.subtotal > 0
                                ? `$${pricing.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                : '—'}
                        </span>
                        <span>
                            <strong>Travel</strong> {pricing.travelDisplay}
                        </span>
                        <span>
                            <strong>Grand total</strong>{' '}
                            {pricing.grandTotal > 0
                                ? `$${pricing.grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                : '—'}
                        </span>
                    </div>
                </div>
            ) : null}

            {phase >= firstTermPhase && phase <= lastTermPhase ? (
                <div>
                    <h2 className={styles.wizardChunkTitle}>{wizard.stepLabels[phase - 1]}</h2>
                    {chunkRequiresDisclosure(wizard.chunks[phase - 1]!) ? (
                        <p className={styles.specialHint} style={{ marginTop: 8 }}>
                            When you reach them, complete the <strong>Section 14</strong> and{' '}
                            <strong>Section 15</strong> questions, then add your initials where shown (tap a row). Use{' '}
                            <strong>Next initial</strong> to jump to the next line.
                        </p>
                    ) : currentStepInitialIds.length > 0 ? (
                        <p className={styles.specialHint} style={{ marginTop: 8 }}>
                            Read each section, then add your initials where shown (tap a row). Use{' '}
                            <strong>Next initial</strong> to jump to the next line.
                        </p>
                    ) : null}
                    {signStepErr ? <p style={{ color: '#ff6b8a', marginBottom: 8 }}>{signStepErr}</p> : null}
                    {(wizard.chunks[phase - 1]?.sections ?? []).map((sec, si) => {
                        const secInitialIds = sec.initialIds.filter((id) =>
                            wizard.requiredInitialIds.includes(id)
                        );
                        const showSec14Form = sec.initialIds.includes('init_allergy');
                        const showSec15Form = sec.initialIds.includes('init_photo');
                        return (
                            <div key={si} className={styles.wizardTermSection}>
                                <div className={styles.wizardTermCard}>
                                    <NativeBlocks blocks={sec.blocks} />
                                </div>
                                {showSec14Form ? (
                                    <div className={styles.wizardSectionFormCard}>
                                        <p className={styles.wizardSectionFormTitle}>Your disclosure (Section 14)</p>
                                        <label className={styles.wizardLabel}>Allergies / sensitivities</label>
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
                                    </div>
                                ) : null}
                                {showSec15Form ? (
                                    <div className={styles.wizardSectionFormCard}>
                                        <p className={styles.wizardSectionFormTitle}>Photo / video (Section 15)</p>
                                        <label className={styles.wizardLabel}>Consent decision</label>
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
                                                    placeholder="e.g. No face shown, no Instagram"
                                                />
                                            </>
                                        ) : null}
                                    </div>
                                ) : null}
                                {secInitialIds.length > 0 ? (
                                    <div className={styles.wizardSectionInitialWrap}>
                                        <div className={styles.initTapList}>
                                            {secInitialIds.map((id) => (
                                                <button
                                                    key={id}
                                                    type="button"
                                                    ref={(el) => {
                                                        initialSlotRefs.current[id] = el;
                                                    }}
                                                    className={`${styles.initTapSlot} ${activeInitialId === id ? styles.initTapSlotActive : ''}`}
                                                    onClick={() => openInitialEditor(id)}
                                                >
                                                    <span className={styles.initTapLabel}>
                                                        {SPECIAL_EVENT_INIT_LABELS[id]}
                                                    </span>
                                                    <span
                                                        className={
                                                            initials[id]?.trim()
                                                                ? styles.initTapVal
                                                                : `${styles.initTapVal} ${styles.initTapPlaceholder}`
                                                        }
                                                    >
                                                        {initials[id]?.trim() || 'Tap to add initials'}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                        );
                    })}
                    {currentStepInitialIds.length > 0 ? (
                        <div className={styles.initNextRow}>
                            <button type="button" className={styles.wizardSecondaryBtn} onClick={goNextInitial}>
                                Next initial
                            </button>
                        </div>
                    ) : null}
                </div>
            ) : null}

            {phase === signPhaseIndex ? (
                <div className={styles.wizardFormCard}>
                    <h2 className={styles.wizardChunkTitle}>Sign</h2>
                    {signStepErr ? <p style={{ color: '#ff6b8a', marginBottom: 12 }}>{signStepErr}</p> : null}

                    <div className={styles.sigModeRow}>
                        <button
                            type="button"
                            className={`${styles.sigModeBtn} ${signatureMode === 'draw' ? styles.sigModeBtnActive : ''}`}
                            onClick={() => setSignatureMode('draw')}
                        >
                            Draw
                        </button>
                        <button
                            type="button"
                            className={`${styles.sigModeBtn} ${signatureMode === 'type' ? styles.sigModeBtnActive : ''}`}
                            onClick={() => setSignatureMode('type')}
                        >
                            Type
                        </button>
                    </div>

                    {signatureMode === 'draw' ? (
                        <>
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
                        </>
                    ) : (
                        <>
                            <label className={styles.wizardLabel}>Signature text</label>
                            <input
                                className={styles.wizardInput}
                                value={typedSigText}
                                onChange={(e) => setTypedSigText(e.target.value)}
                                placeholder={printedName || 'Your name'}
                            />
                            <label className={styles.wizardLabel}>Style</label>
                            <select
                                className={styles.wizardInput}
                                value={typefaceId}
                                onChange={(e) => setTypefaceId(e.target.value as SignatureTypefaceId)}
                            >
                                {SIGNATURE_TYPEFACE_OPTIONS.map((o) => (
                                    <option key={o.id} value={o.id}>
                                        {o.label}
                                    </option>
                                ))}
                            </select>
                            <p className={styles.wizardLabel} style={{ marginTop: 12 }}>
                                Preview
                            </p>
                            <div
                                className={`${styles.sigTypePreview} ${sigFontsReady ? styles.sigTypePreviewReady : ''}`}
                                style={{ fontFamily: typedPreviewFamily }}
                                aria-live="polite"
                            >
                                {typedSigText.trim() || printedName.trim() || 'Your name'}
                            </div>
                            <p className={styles.specialHint} style={{ marginTop: 8 }}>
                                Your name will be saved as an image for the PDF, same as drawing.
                            </p>
                        </>
                    )}

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
                        By submitting, I certify that all information provided is true, complete, and accurate to the best
                        of my knowledge, and that I am fully and legally bound by all terms and conditions of this
                        Agreement.
                    </p>
                    <div className={styles.wizardReviewDisclosure}>
                        <p className={styles.wizardReviewDisclosureTitle}>On your agreement</p>
                        <p className={styles.wizardReviewDisclosureLine}>
                            <span>Allergies / sensitivities</span>
                            <span>{formatAllergyDisplay(allergySelect, allergyDetail)}</span>
                        </p>
                        <p className={styles.wizardReviewDisclosureLine}>
                            <span>Skin / scalp</span>
                            <span>{formatSkinDisplay(skinSelect, skinDetail)}</span>
                        </p>
                        <p className={styles.wizardReviewDisclosureLine}>
                            <span>Photo / video</span>
                            <span>{photoValue || '—'}</span>
                        </p>
                        {photoValue === 'No — consent denied' && photoRestrict.trim() ? (
                            <p className={styles.wizardReviewDisclosureLine}>
                                <span>Restrictions</span>
                                <span>{photoRestrict.trim()}</span>
                            </p>
                        ) : null}
                    </div>
                    <div className={styles.wizardReviewDisclosure} style={{ marginTop: 14 }}>
                        <p className={styles.wizardReviewDisclosureTitle}>Agreement summary (by category)</p>
                        <p className={styles.specialHint} style={{ marginTop: 6 }}>
                            This summary is grouped by the same category labels you reviewed throughout the signing steps.
                        </p>
                        <div style={{ display: 'grid', gap: 10, marginTop: 10 }}>
                            {wizard.stepLabels.map((lbl, i) => (
                                <details key={`sum-${i}`} style={{ border: '1px solid rgba(255,255,255,0.10)', borderRadius: 12, overflow: 'hidden' }}>
                                    <summary style={{ cursor: 'pointer', padding: '12px 14px', listStyle: 'none', color: '#fff', fontWeight: 700 }}>
                                        {lbl}
                                    </summary>
                                    <div style={{ padding: '12px 14px' }}>
                                        {(wizard.chunks[i]?.sections ?? []).map((sec, si) => (
                                            <div key={`sum-${i}-${si}`} style={{ marginBottom: 12 }}>
                                                <NativeBlocks blocks={sec.blocks} />
                                            </div>
                                        ))}
                                    </div>
                                </details>
                            ))}
                        </div>
                    </div>
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

            {openInitialId && typeof document !== 'undefined'
                ? createPortal(
                      <div
                          className={styles.initSheetBackdrop}
                          role="presentation"
                          onClick={() => setOpenInitialId(null)}
                      >
                          <div className={styles.initSheet} role="dialog" onClick={(e) => e.stopPropagation()}>
                              <p className={styles.initSheetTitle}>{SPECIAL_EVENT_INIT_LABELS[openInitialId]}</p>
                              <input
                                  ref={initSheetInputRef}
                                  className={styles.initSheetInput}
                                  maxLength={4}
                                  inputMode="text"
                                  autoCapitalize="characters"
                                  value={draftInitial}
                                  onChange={(e) =>
                                      setDraftInitial(e.target.value.toUpperCase().replace(/[^A-Z]/g, ''))
                                  }
                              />
                              <div className={styles.initSheetActions}>
                                  <button
                                      type="button"
                                      className={styles.wizardSecondaryBtn}
                                      onClick={() => setOpenInitialId(null)}
                                  >
                                      Cancel
                                  </button>
                                  <button
                                      type="button"
                                      className={styles.wizardPrimaryBtn}
                                      disabled={!draftInitial.trim()}
                                      onClick={saveInitialDraft}
                                  >
                                      Save
                                  </button>
                              </div>
                          </div>
                      </div>,
                      document.body
                  )
                : null}

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
                    <button
                        type="button"
                        className={styles.wizardPrimaryBtn}
                        disabled={termStepContinueBlocked}
                        onClick={goNext}
                    >
                        Continue
                    </button>
                ) : null}
            </div>
        </div>
    );
}
