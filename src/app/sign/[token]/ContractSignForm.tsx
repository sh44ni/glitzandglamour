'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, Download, Eye, FileText } from 'lucide-react';
import styles from './contract-sign.module.css';

type GateState = 'loading' | 'ready' | 'invalid' | 'completed' | 'expired';

function signPadHeightPx(): number {
    if (typeof window === 'undefined') return 160;
    return window.innerWidth < 640 ? 200 : 160;
}

const label: React.CSSProperties = {
    display: 'block',
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--text-muted)',
    marginBottom: '8px',
    letterSpacing: '0.02em',
};

const input: React.CSSProperties = {
    width: '100%',
    background: 'rgba(0,0,0,0.35)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    padding: '12px 14px',
    color: '#fff',
    fontSize: '14px',
    fontFamily: 'Poppins, sans-serif',
    outline: 'none',
};

const reviewLabel: React.CSSProperties = {
    fontSize: '11px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    color: '#FF6BA8',
    marginBottom: '10px',
};

const reviewClause: React.CSSProperties = {
    fontSize: '13px',
    color: 'var(--text-muted)',
    lineHeight: 1.65,
    marginBottom: '8px',
    paddingLeft: '12px',
    borderLeft: '2px solid rgba(255,45,120,0.35)',
};

const divider: React.CSSProperties = {
    height: 1,
    background: 'rgba(255,255,255,0.06)',
    margin: '18px 0',
};

const badge: React.CSSProperties = {
    fontSize: '10px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    padding: '4px 10px',
    borderRadius: '50px',
    background: 'rgba(255,45,120,0.15)',
    color: '#FF6BA8',
    border: '1px solid rgba(255,45,120,0.25)',
};

const num: React.CSSProperties = {
    fontSize: '11px',
    fontWeight: 800,
    color: '#FF2D78',
    opacity: 0.9,
};

function FieldError({ show, children }: { show: boolean; children: React.ReactNode }) {
    if (!show) return null;
    return (
        <p style={{ color: '#ff6b8a', fontSize: '12px', marginTop: '6px', marginBottom: 0 }}>{children}</p>
    );
}

const REVIEW_SECTIONS: { title: string; lines: string[] }[] = [
    {
        title: 'Cancellation Policy (Section 08)',
        lines: [
            'All retainers are non-refundable.',
            'More than 21 days prior — loss of retainer only.',
            '14–21 days prior — loss of retainer plus 50% of the remaining balance.',
            'Less than 14 days prior — 100% of the total service amount is owed.',
            'No-shows will be charged the full contract amount.',
            'Cancellation must be submitted in writing via text or email to (760) 290-5910 or info@glitzandglamours.com.',
        ],
    },
    {
        title: 'No Refunds Policy (Section 04)',
        lines: [
            'All services are final. No refunds will be issued once services have been completed. Any concerns must be addressed during the service.',
        ],
    },
    {
        title: 'Late Arrival (Section 10)',
        lines: [
            'Client lateness of 30 or more minutes will result in cancellation of services. The full contract amount remains owed and no refund will be issued.',
        ],
    },
    {
        title: 'Client Preparation (Section 09)',
        lines: [
            'Hair clients must arrive with clean, dry hair. Makeup clients must arrive with a clean, makeup-free face. Failure to arrive prepared will result in a preparation fee per person.',
        ],
    },
    {
        title: 'Limitation of Liability (Section 20)',
        lines: [
            "Maximum liability of Glitz & Glamour Studio shall not exceed the total amount paid by the Client for the specific services at issue.",
            'Dissatisfaction with aesthetic results alone does not constitute grounds for a refund or legal claim beyond the amount paid.',
        ],
    },
    {
        title: 'Entire Agreement (Section 22)',
        lines: [
            'This Agreement supersedes all prior conversations, promises, or understandings — written or verbal — made before signing. Instagram DMs and verbal agreements are not binding.',
        ],
    },
];

export default function ContractSignForm({ token }: { token: string }) {
    const [gate, setGate] = useState<GateState>('loading');
    const [submitting, setSubmitting] = useState(false);
    const [submitErr, setSubmitErr] = useState('');
    const [refCode, setRefCode] = useState('');
    const [pdfAvailable, setPdfAvailable] = useState(false);

    const [confirmRead, setConfirmRead] = useState(false);
    const [allergies, setAllergies] = useState('');
    const [skinCond, setSkinCond] = useState('');
    const [medications, setMedications] = useState('');
    const [photoConsent, setPhotoConsent] = useState<'Yes' | 'No' | ''>('');
    const [photoRestrict, setPhotoRestrict] = useState('');
    const [hasMinor, setHasMinor] = useState(false);
    const [minorNames, setMinorNames] = useState('');
    const [guardianName, setGuardianName] = useState('');
    const [guardianPhone, setGuardianPhone] = useState('');
    const [initials, setInitials] = useState({
        norefund: '',
        payment: '',
        cancel: '',
        allergy: '',
        photo: '',
        liability: '',
        entire: '',
        minors: '',
    });
    const [fullName, setFullName] = useState('');
    const [signDate, setSignDate] = useState('');
    const [finalAgree, setFinalAgree] = useState(false);

    const [touched, setTouched] = useState(false);

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const drawing = useRef(false);
    const [hasSignature, setHasSignature] = useState(false);
    const signatureMarkedRef = useRef(false);
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
    /** Logical size (CSS px) after scale — white pad + dark ink for PDF export */
    const sigPadRef = useRef({ w: 320, h: 160 });

    useEffect(() => {
        const t = new Date();
        const mm = String(t.getMonth() + 1).padStart(2, '0');
        const dd = String(t.getDate()).padStart(2, '0');
        setSignDate(`${mm}/${dd}/${t.getFullYear()}`);
    }, []);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch(`/api/contracts/sign/${encodeURIComponent(token)}`);
                const data = await res.json();
                if (cancelled) return;
                if (!res.ok || !data.ok) {
                    if (data.reason === 'expired') setGate('expired');
                    else if (data.reason === 'completed') {
                        setRefCode(typeof data.referenceCode === 'string' ? data.referenceCode : '');
                        setPdfAvailable(Boolean(data.pdfAvailable));
                        setGate('completed');
                    } else setGate('invalid');
                    return;
                }
                setGate('ready');
                if (data.clientHintName) setFullName((n) => n || data.clientHintName);
            } catch {
                if (!cancelled) setGate('invalid');
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [token]);

    const pdfPreviewHref = useMemo(
        () => `/api/contracts/sign/${encodeURIComponent(token)}/pdf?mode=inline`,
        [token],
    );
    const pdfDownloadHref = useMemo(
        () => `/api/contracts/sign/${encodeURIComponent(token)}/pdf?mode=download`,
        [token],
    );

    const setupCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.parentElement?.getBoundingClientRect();
        if (!rect?.width) return;
        const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
        const w = rect.width;
        const h = signPadHeightPx();
        sigPadRef.current = { w, h };
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.height = `${h}px`;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);
        ctx.strokeStyle = '#141414';
        ctx.lineWidth = 2.25;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctxRef.current = ctx;
    }, []);

    useEffect(() => {
        if (gate !== 'ready') return;
        setupCanvas();
        const onResize = () => setupCanvas();
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, [gate, setupCanvas]);

    function getPos(e: React.MouseEvent | React.TouchEvent) {
        const canvas = canvasRef.current!;
        const rect = canvas.getBoundingClientRect();
        if ('touches' in e && e.touches[0]) {
            return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
        }
        const me = e as React.MouseEvent;
        return { x: me.clientX - rect.left, y: me.clientY - rect.top };
    }

    function clearSignature() {
        const canvas = canvasRef.current;
        const ctx = ctxRef.current;
        if (!ctx) return;
        const { w, h } = sigPadRef.current;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);
        signatureMarkedRef.current = false;
        setHasSignature(false);
    }

    function markSigned() {
        if (!signatureMarkedRef.current) {
            signatureMarkedRef.current = true;
            setHasSignature(true);
        }
    }

    function validate(): boolean {
        setTouched(true);
        if (!confirmRead) return false;
        if (!allergies.trim() || !skinCond.trim()) return false;
        if (photoConsent !== 'Yes' && photoConsent !== 'No') return false;
        if (photoConsent === 'No' && !photoRestrict.trim()) return false;
        if (hasMinor) {
            if (!minorNames.trim() || !guardianName.trim() || !guardianPhone.trim()) return false;
        }
        const need: (keyof typeof initials)[] = ['norefund', 'payment', 'cancel', 'allergy', 'photo', 'liability', 'entire'];
        for (const k of need) {
            if (!initials[k]?.trim()) return false;
        }
        if (hasMinor && !initials.minors.trim()) return false;
        if (!fullName.trim() || !signDate.trim()) return false;
        if (!finalAgree) return false;
        if (!hasSignature) return false;
        return true;
    }

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitErr('');
        if (!validate()) {
            setSubmitErr('Please complete all required fields, initials, and your signature.');
            return;
        }
        const canvas = canvasRef.current;
        if (!canvas) return;
        const signaturePngBase64 = canvas.toDataURL('image/png');

        setSubmitting(true);
        try {
            const res = await fetch(`/api/contracts/sign/${encodeURIComponent(token)}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    confirmRead: true,
                    allergies: allergies.trim(),
                    skinCond: skinCond.trim(),
                    medications: medications.trim(),
                    photoConsent,
                    photoRestrict: photoConsent === 'No' ? photoRestrict.trim() : null,
                    hasMinor,
                    minorNames: hasMinor ? minorNames.trim() : null,
                    guardianName: hasMinor ? guardianName.trim() : null,
                    guardianPhone: hasMinor ? guardianPhone.trim() : null,
                    initials: {
                        norefund: initials.norefund.trim().toUpperCase(),
                        payment: initials.payment.trim().toUpperCase(),
                        cancel: initials.cancel.trim().toUpperCase(),
                        allergy: initials.allergy.trim().toUpperCase(),
                        photo: initials.photo.trim().toUpperCase(),
                        liability: initials.liability.trim().toUpperCase(),
                        entire: initials.entire.trim().toUpperCase(),
                        ...(hasMinor ? { minors: initials.minors.trim().toUpperCase() } : {}),
                    },
                    fullName: fullName.trim(),
                    signDate: signDate.trim(),
                    finalAgree: true,
                    signaturePngBase64,
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                setSubmitErr(data.error || 'Something went wrong.');
                setSubmitting(false);
                return;
            }
            setRefCode(data.referenceCode || '');
            setPdfAvailable(true);
            setGate('completed');
        } catch {
            setSubmitErr('Network error. Please try again.');
        }
        setSubmitting(false);
    }

    function setIni(key: keyof typeof initials, v: string) {
        setInitials((prev) => ({ ...prev, [key]: v.toUpperCase() }));
    }

    if (gate === 'loading') {
        return (
            <div
                className={styles.root}
                style={{ maxWidth: 560, textAlign: 'center', color: 'var(--text-muted)', paddingTop: 48 }}
            >
                Loading…
            </div>
        );
    }

    if (gate === 'invalid') {
        return (
            <div className={styles.root} style={{ maxWidth: 560, textAlign: 'center', paddingTop: 48 }}>
                <h1 style={{ fontSize: '22px', marginBottom: '12px' }}>Link not valid</h1>
                <p style={{ color: 'var(--text-muted)' }}>This signing link may be incorrect or no longer available. Contact Glitz & Glamour Studio for a new link.</p>
            </div>
        );
    }

    if (gate === 'expired') {
        return (
            <div className={styles.root} style={{ maxWidth: 560, textAlign: 'center', paddingTop: 48 }}>
                <h1 style={{ fontSize: '22px', marginBottom: '12px' }}>Link expired</h1>
                <p style={{ color: 'var(--text-muted)' }}>Ask the studio to send you a fresh contract link.</p>
            </div>
        );
    }

    if (gate === 'completed') {
        return (
            <div className={`${styles.root} ${styles.successRoot}`}>
                <div className={styles.successHero}>
                    <div className={styles.successIconWrap} aria-hidden>
                        <CheckCircle2 className={styles.successIcon} size={52} strokeWidth={1.35} />
                    </div>
                    <h1 className={styles.successTitle}>Agreement received</h1>
                    <p className={styles.successLead}>
                        Your signed contract is on file. JoJany will follow up to confirm details.
                    </p>
                </div>

                {pdfAvailable ? (
                    <div className={styles.successPdfCard}>
                        <div className={styles.successPdfHead}>
                            <FileText className={styles.successPdfIcon} size={22} strokeWidth={1.75} aria-hidden />
                            <div className={styles.successPdfCopy}>
                                <span className={styles.successPdfLabel}>Your signed PDF</span>
                                <span className={styles.successPdfHint}>Preview in a new tab or download a copy for your records.</span>
                            </div>
                        </div>
                        <div className={styles.successActions}>
                            <a
                                className={styles.successBtnPreview}
                                href={pdfPreviewHref}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Eye size={18} strokeWidth={2} aria-hidden />
                                Preview PDF
                            </a>
                            <a className={styles.successBtnDownload} href={pdfDownloadHref} download>
                                <Download size={18} strokeWidth={2} aria-hidden />
                                Download
                            </a>
                        </div>
                    </div>
                ) : (
                    <p className={styles.successPdfMissing}>
                        If you need a copy of your signed agreement, text or email the studio with your reference below.
                    </p>
                )}

                {refCode ? (
                    <div className={styles.successRef}>
                        <span className={styles.successRefLabel}>Reference</span>
                        <span className={styles.successRefCode}>{refCode}</span>
                    </div>
                ) : null}

                <p className={styles.successContact}>
                    Questions?{' '}
                    <a href="tel:7602905910" className={styles.successContactLink}>
                        (760) 290-5910
                    </a>{' '}
                    ·{' '}
                    <a href="mailto:info@glitzandglamours.com" className={styles.successContactLink}>
                        info@glitzandglamours.com
                    </a>
                </p>
            </div>
        );
    }

    const showErr = touched;

    return (
        <div className={styles.root}>
            <header style={{ textAlign: 'center', marginBottom: '28px' }}>
                <p style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#FF6BA8', marginBottom: '8px' }}>
                    Beauty &amp; Event Services Agreement
                </p>
                <h1 style={{ fontSize: 'clamp(24px,6vw,34px)', fontWeight: 800, lineHeight: 1.15, marginBottom: '8px' }}>
                    Glitz &amp; Glamour <span style={{ fontWeight: 300, fontStyle: 'italic', color: '#FF6BA8' }}>Studio</span>
                </h1>
                <p style={{ color: 'var(--text-dim)', fontSize: 'clamp(12px,3.2vw,13px)', lineHeight: 1.5, padding: '0 4px' }}>
                    glitzandglamours.com · Vista, CA · @glitzandglamourstudio
                </p>
            </header>

            <div className={styles.progress}>
                <div className={styles.progressInner}>
                    {['Review', 'Disclosures', 'Initials', 'Signature'].map((lbl, i) => (
                        <div key={lbl} className={styles.step}>
                            <div className={styles.stepDot}>{i + 1}</div>
                            <span className={styles.stepLabel}>{lbl}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div
                style={{
                    background: 'rgba(255,45,120,0.08)',
                    border: '1px solid rgba(255,45,120,0.2)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '14px 16px',
                    marginBottom: '22px',
                    fontSize: '13px',
                    color: 'var(--text-muted)',
                    lineHeight: 1.6,
                }}
            >
                Please read carefully. Fields marked <span style={{ color: '#FF2D78' }}>*</span> are required. This agreement is legally binding once
                submitted.
            </div>

            <form onSubmit={onSubmit} noValidate>
                <div className={styles.card}>
                    <div className={styles.cardHead}>
                        <span style={num}>01</span>
                        <span style={{ flex: 1, fontWeight: 700, fontSize: '15px' }}>Contract summary — please review</span>
                    </div>
                    <div className={styles.cardBody}>
                        {REVIEW_SECTIONS.map((sec) => (
                            <div key={sec.title}>
                                <div style={reviewLabel}>{sec.title}</div>
                                {sec.lines.map((line, li) => (
                                    <p key={`${sec.title}-${li}`} style={reviewClause}>
                                        {line}
                                    </p>
                                ))}
                                <div style={divider} />
                            </div>
                        ))}
                        <div>
                            <span style={label}>
                                Confirm you have read the contract summary <span style={{ color: '#FF2D78' }}>*</span>
                            </span>
                            <label
                                className={styles.checkLabel}
                                style={{
                                    border: confirmRead ? '1px solid rgba(255,45,120,0.35)' : '1px solid rgba(255,255,255,0.08)',
                                    background: confirmRead ? 'rgba(255,45,120,0.06)' : 'transparent',
                                }}
                            >
                                <input type="checkbox" checked={confirmRead} onChange={(e) => setConfirmRead(e.target.checked)} style={{ marginTop: 4 }} />
                                <span style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.55 }}>
                                    I have read and understand the contract terms summarized above and agree to be fully bound by all 24 sections of the
                                    Glitz &amp; Glamour Studio Beauty &amp; Event Services Agreement.
                                </span>
                            </label>
                            <FieldError show={showErr && !confirmRead}>You must confirm you have read the contract.</FieldError>
                        </div>
                    </div>
                </div>

                <div className={styles.card}>
                    <div className={styles.cardHead}>
                        <span style={num}>02</span>
                        <span style={{ flex: 1, fontWeight: 700, fontSize: '15px' }}>Section 11 — Allergy &amp; skin disclosure</span>
                        <span style={badge}>Required</span>
                    </div>
                    <div className={styles.cardBody}>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.65, marginBottom: '18px' }}>
                            You are responsible for disclosing any known skin sensitivities, allergies, or medical conditions. Glitz &amp; Glamour Studio is
                            not liable for adverse reactions from undisclosed conditions.
                        </p>
                        <div style={{ marginBottom: '16px' }}>
                            <span style={label}>
                                Known allergies or sensitivities <span style={{ color: '#FF2D78' }}>*</span>
                            </span>
                            <input
                                style={input}
                                className={styles.inputMobile}
                                value={allergies}
                                onChange={(e) => setAllergies(e.target.value)}
                                placeholder={'e.g. Latex, fragrances — or "None known"'}
                            />
                            <FieldError show={showErr && !allergies.trim()}>This field is required.</FieldError>
                        </div>
                        <div style={{ marginBottom: '16px' }}>
                            <span style={label}>
                                Skin conditions <span style={{ color: '#FF2D78' }}>*</span>
                            </span>
                            <input
                                style={input}
                                className={styles.inputMobile}
                                value={skinCond}
                                onChange={(e) => setSkinCond(e.target.value)}
                                placeholder={'e.g. Eczema, rosacea — or "None"'}
                            />
                            <FieldError show={showErr && !skinCond.trim()}>This field is required.</FieldError>
                        </div>
                        <div>
                            <span style={label}>Current medications (optional)</span>
                            <input
                                style={input}
                                className={styles.inputMobile}
                                value={medications}
                                onChange={(e) => setMedications(e.target.value)}
                                placeholder="e.g. Retinol, Accutane"
                            />
                        </div>
                    </div>
                </div>

                <div className={styles.card}>
                    <div className={styles.cardHead}>
                        <span style={num}>03</span>
                        <span style={{ flex: 1, fontWeight: 700, fontSize: '15px' }}>Section 12 — Photo &amp; social media release</span>
                        <span style={badge}>Required</span>
                    </div>
                    <div className={styles.cardBody}>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.65, marginBottom: '18px' }}>
                            We may photograph or video services for portfolio and promotion. Please select your preference.
                        </p>
                        <span style={label}>
                            Photo &amp; video consent <span style={{ color: '#FF2D78' }}>*</span>
                        </span>
                        {(['Yes', 'No'] as const).map((v) => (
                            <label
                                key={v}
                                className={styles.radioLabel}
                                style={{
                                    border: photoConsent === v ? '1px solid rgba(255,45,120,0.35)' : '1px solid rgba(255,255,255,0.08)',
                                    background: photoConsent === v ? 'rgba(255,45,120,0.06)' : 'transparent',
                                    marginBottom: '8px',
                                }}
                            >
                                <input type="radio" name="photo" checked={photoConsent === v} onChange={() => setPhotoConsent(v)} />
                                {v === 'Yes' ? 'Yes — I consent to photos/video for portfolio and promotional use.' : 'No — I do not consent to photo or video use.'}
                            </label>
                        ))}
                        <FieldError show={showErr && photoConsent !== 'Yes' && photoConsent !== 'No'}>Please select an option.</FieldError>
                        {photoConsent === 'No' ? (
                            <div style={{ marginTop: '14px' }}>
                                <span style={label}>
                                    Describe restrictions <span style={{ color: '#FF2D78' }}>*</span>
                                </span>
                                <input
                                    style={input}
                                    className={styles.inputMobile}
                                    value={photoRestrict}
                                    onChange={(e) => setPhotoRestrict(e.target.value)}
                                    placeholder="e.g. No face shown"
                                />
                                <FieldError show={showErr && !photoRestrict.trim()}>Required when selecting No.</FieldError>
                            </div>
                        ) : null}
                    </div>
                </div>

                <div className={styles.card}>
                    <div className={styles.cardHead}>
                        <span style={num}>04</span>
                        <span style={{ flex: 1, fontWeight: 700, fontSize: '15px' }}>Section 17 — Minors policy</span>
                        <span style={{ ...badge, background: 'rgba(255,255,255,0.06)', color: 'var(--text-dim)', borderColor: 'rgba(255,255,255,0.1)' }}>
                            If applicable
                        </span>
                    </div>
                    <div className={styles.cardBody}>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.65, marginBottom: '16px' }}>
                            Only if someone receiving services is under 18. Otherwise leave blank (N/A).
                        </p>
                        <span style={label}>Any minors receiving services?</span>
                        <label className={styles.radioLabel} style={{ marginBottom: '8px' }}>
                            <input type="radio" name="minor" checked={!hasMinor} onChange={() => setHasMinor(false)} />
                            No — all clients are 18+
                        </label>
                        <label className={styles.radioLabel} style={{ marginBottom: '16px' }}>
                            <input type="radio" name="minor" checked={hasMinor} onChange={() => setHasMinor(true)} />
                            Yes — one or more minors
                        </label>
                        {hasMinor ? (
                            <>
                                <div style={{ marginBottom: '14px' }}>
                                    <span style={label}>
                                        Minor name(s) &amp; age(s) <span style={{ color: '#FF2D78' }}>*</span>
                                    </span>
                                    <input style={input}
                                className={styles.inputMobile} value={minorNames} onChange={(e) => setMinorNames(e.target.value)} placeholder="e.g. Sofia R., age 15" />
                                    <FieldError show={showErr && !minorNames.trim()}>Required.</FieldError>
                                </div>
                                <div className={styles.grid2}>
                                    <div>
                                        <span style={label}>
                                            Guardian name &amp; relationship <span style={{ color: '#FF2D78' }}>*</span>
                                        </span>
                                        <input style={input}
                                className={styles.inputMobile} value={guardianName} onChange={(e) => setGuardianName(e.target.value)} />
                                        <FieldError show={showErr && !guardianName.trim()}>Required.</FieldError>
                                    </div>
                                    <div>
                                        <span style={label}>
                                            Guardian phone <span style={{ color: '#FF2D78' }}>*</span>
                                        </span>
                                        <input style={input}
                                className={styles.inputMobile} value={guardianPhone} onChange={(e) => setGuardianPhone(e.target.value)} />
                                        <FieldError show={showErr && !guardianPhone.trim()}>Required.</FieldError>
                                    </div>
                                </div>
                            </>
                        ) : null}
                    </div>
                </div>

                <div className={styles.card}>
                    <div className={styles.cardHead}>
                        <span style={num}>05</span>
                        <span style={{ flex: 1, fontWeight: 700, fontSize: '15px' }}>Required initials</span>
                        <span style={badge}>All required</span>
                    </div>
                    <div className={styles.cardBody}>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '18px', lineHeight: 1.65 }}>
                            Initial each section to confirm you read and agree. Use your real initials (e.g. JL).
                        </p>
                        {(
                            [
                                ['norefund', 'Section 04 — No refunds', 'All services are final once completed.'],
                                ['payment', 'Section 05 — Payment plan', 'Payments forfeited on cancellation; $25 late fee after 3 days.'],
                                ['cancel', 'Section 08 — Cancellation', 'Tiers: 21+ / 14–21 / under 14 / no-show; retainers non-refundable.'],
                                ['allergy', 'Section 11 — Allergy disclosure', 'Information is accurate; studio not liable for undisclosed conditions.'],
                                ['photo', 'Section 12 — Photo release', 'Consent decision made knowingly per California likeness rights.'],
                                ['liability', 'Section 20 — Limitation of liability', 'Max liability = amount paid; subjective dissatisfaction alone is not a claim.'],
                                ['entire', 'Section 22 — Entire agreement', 'Contract supersedes prior DMs, texts, and verbal statements.'],
                            ] as const
                        ).map(([key, title, sub]) => (
                            <div
                                key={key}
                                style={{
                                    padding: '14px 16px',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(255,45,120,0.15)',
                                    background: 'rgba(0,0,0,0.2)',
                                    marginBottom: '12px',
                                }}
                            >
                                <div style={{ ...reviewLabel, marginBottom: '6px' }}>{title} *</div>
                                <p style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '12px', lineHeight: 1.55 }}>{sub}</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <span style={{ color: 'var(--text-dim)' }}>✕</span>
                                    <input
                                        style={{ ...input, fontStyle: 'italic', letterSpacing: '0.08em' }}
                                        className={`${styles.inputMobile} ${styles.initialInput}`}
                                        maxLength={5}
                                        value={initials[key]}
                                        onChange={(e) => setIni(key, e.target.value)}
                                        placeholder="Initials"
                                    />
                                </div>
                                <FieldError show={showErr && !initials[key].trim()}>Required.</FieldError>
                            </div>
                        ))}
                        {hasMinor ? (
                            <div
                                style={{
                                    padding: '14px 16px',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(255,45,120,0.15)',
                                    background: 'rgba(0,0,0,0.2)',
                                    marginBottom: '12px',
                                }}
                            >
                                <div style={{ ...reviewLabel, marginBottom: '6px' }}>Section 17 — Minors *</div>
                                <p style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '12px', lineHeight: 1.55 }}>
                                    I am the legal guardian and authorize services for the minor(s) listed.
                                </p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <span style={{ color: 'var(--text-dim)' }}>✕</span>
                                    <input
                                        style={{ ...input }}
                                        className={`${styles.inputMobile} ${styles.initialInput}`}
                                        maxLength={5}
                                        value={initials.minors}
                                        onChange={(e) => setIni('minors', e.target.value)}
                                        placeholder="Guardian initials"
                                    />
                                </div>
                                <FieldError show={showErr && !initials.minors.trim()}>Required for minors.</FieldError>
                            </div>
                        ) : null}
                    </div>
                </div>

                <div className={styles.card}>
                    <div className={styles.cardHead}>
                        <span style={num}>06</span>
                        <span style={{ flex: 1, fontWeight: 700, fontSize: '15px' }}>Section 24 — Signature &amp; final agreement</span>
                        <span style={badge}>Required</span>
                    </div>
                    <div className={styles.cardBody}>
                        <div className={styles.grid2}>
                            <div>
                                <span style={label}>
                                    Full legal name <span style={{ color: '#FF2D78' }}>*</span>
                                </span>
                                <input style={input}
                                className={styles.inputMobile} value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="As on ID" />
                                <FieldError show={showErr && !fullName.trim()}>Required.</FieldError>
                            </div>
                            <div>
                                <span style={label}>
                                    Today&apos;s date <span style={{ color: '#FF2D78' }}>*</span>
                                </span>
                                <input style={input}
                                className={styles.inputMobile} value={signDate} onChange={(e) => setSignDate(e.target.value)} placeholder="MM/DD/YYYY" />
                                <FieldError show={showErr && !signDate.trim()}>Required.</FieldError>
                            </div>
                        </div>
                        <span style={label}>
                            Your signature <span style={{ color: '#FF2D78' }}>*</span>
                        </span>
                        <p style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '10px', lineHeight: 1.5 }}>
                            Sign on the white pad in dark ink so your signature prints clearly on the PDF agreement.
                        </p>
                        <div
                            style={{
                                border: showErr && !hasSignature ? '2px solid #ff6b8a' : '1px solid rgba(0,0,0,0.12)',
                                borderRadius: '12px',
                                background: '#ffffff',
                                marginBottom: '10px',
                                touchAction: 'none',
                                boxShadow: 'inset 0 0 0 1px rgba(255,45,120,0.08)',
                            }}
                        >
                            <canvas
                                ref={canvasRef}
                                style={{ display: 'block', width: '100%', cursor: 'crosshair' }}
                                onMouseDown={(e) => {
                                    const ctx = ctxRef.current;
                                    if (!ctx) return;
                                    drawing.current = true;
                                    ctx.beginPath();
                                    const p = getPos(e);
                                    ctx.moveTo(p.x, p.y);
                                }}
                                onMouseMove={(e) => {
                                    if (!drawing.current) return;
                                    const ctx = ctxRef.current;
                                    if (!ctx) return;
                                    const p = getPos(e);
                                    ctx.lineTo(p.x, p.y);
                                    ctx.stroke();
                                    markSigned();
                                }}
                                onMouseUp={() => {
                                    drawing.current = false;
                                }}
                                onMouseLeave={() => {
                                    drawing.current = false;
                                }}
                                onTouchStart={(e) => {
                                    e.preventDefault();
                                    const ctx = ctxRef.current;
                                    if (!ctx) return;
                                    drawing.current = true;
                                    ctx.beginPath();
                                    const p = getPos(e);
                                    ctx.moveTo(p.x, p.y);
                                }}
                                onTouchMove={(e) => {
                                    e.preventDefault();
                                    if (!drawing.current) return;
                                    const ctx = ctxRef.current;
                                    if (!ctx) return;
                                    const p = getPos(e);
                                    ctx.lineTo(p.x, p.y);
                                    ctx.stroke();
                                    markSigned();
                                }}
                                onTouchEnd={() => {
                                    drawing.current = false;
                                }}
                            />
                        </div>
                        <button type="button" className={`btn-outline ${styles.clearSigBtn}`} onClick={clearSignature}>
                            Clear signature
                        </button>
                        <FieldError show={showErr && !hasSignature}>Draw your signature in the box.</FieldError>

                        <label
                            className={styles.checkLabel}
                            style={{
                                padding: '16px',
                                border: '1px solid rgba(255,45,120,0.2)',
                                background: 'rgba(255,45,120,0.06)',
                                marginTop: '18px',
                            }}
                        >
                            <input type="checkbox" checked={finalAgree} onChange={(e) => setFinalAgree(e.target.checked)} style={{ marginTop: 4 }} />
                            <span style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.65 }}>
                                By checking this box and submitting, I — <strong style={{ color: '#fff' }}>{fullName.trim() || 'the undersigned'}</strong> —
                                confirm I have read and understood the agreement and agree to be fully bound, including Sections 04, 08, 11, and 20. This is my
                                electronic signature.
                            </span>
                        </label>
                        <FieldError show={showErr && !finalAgree}>You must check this box.</FieldError>

                        {submitErr ? <p style={{ color: '#ff6b8a', marginTop: '16px', fontSize: '14px' }}>{submitErr}</p> : null}

                        <button type="submit" className={`btn-primary ${styles.submitBtn}`} disabled={submitting}>
                            {submitting ? 'Submitting…' : 'Submit signed agreement'}
                        </button>
                        <p style={{ fontSize: '11px', color: 'var(--text-dim)', textAlign: 'center', marginTop: '14px', lineHeight: 1.6 }}>
                            Electronic signature is binding under the ESIGN Act and California law.
                        </p>
                    </div>
                </div>
            </form>
        </div>
    );
}
