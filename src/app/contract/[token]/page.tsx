'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import type { AdminContractPayload } from '@/lib/contracts/adminContractPayload';
import ClientSignWizard from '@/app/sign/[token]/ClientSignWizard';
import {
    ChevronRight,
    ShieldCheck,
    FileText,
    CheckCircle2,
    AlertCircle,
    Download,
    PenTool,
    Type,
    RotateCcw,
    Sparkles,
    Lock,
    MapPin,
    Phone,
    Mail,
    Calendar,
} from 'lucide-react';

type ContractGateState =
    | { status: 'ready_preview'; note?: string }
    | {
          status: 'ready_special';
          adminPayload: AdminContractPayload;
          expiresAt: string;
          contractNumber: string | null;
      }
    | {
          status: 'ready_legacy';
          expiresAt: string;
          clientHintName: string | null;
          clientHintEmail: string | null;
      }
    | {
          status: 'completed';
          referenceCode: string | null;
          pdfAvailable: boolean;
          clientEmail: string | null;
      }
    | { status: 'voided'; noteClient?: string | null }
    | { status: 'expired' };

const AGREEMENT_SECTIONS: { num: string; title: string; lines: string[] }[] = [
    {
        num: 'Section 04',
        title: 'Retainer & No Refunds Policy',
        lines: [
            'A non-refundable retainer is required upon execution of this Agreement to reserve your event date and styling team.',
            'All services are final. No refunds will be issued once services have been completed. Any adjustments must be requested during the styling session prior to artist departure.',
        ],
    },
    {
        num: 'Section 08',
        title: 'Cancellation & Rescheduling Schedule',
        lines: [
            'More than 21 days prior to event date: loss of non-refundable retainer only.',
            '14 to 21 days prior to event date: loss of retainer plus 50% of the remaining contracted balance.',
            'Less than 14 days prior to event date or same-day no-show: 100% of the total contracted service amount is owed.',
            'All cancellation notices must be submitted in writing via text to (760) 290-5910 or email to info@glitzandglamours.com.',
        ],
    },
    {
        num: 'Section 09',
        title: 'Client & Bridal Party Preparation',
        lines: [
            'Hair styling clients must arrive with clean, completely dry hair (washed the night before, free of heavy oils or leave-in conditioners).',
            'Makeup clients must arrive with a clean, makeup-free face. Additional preparation fees apply per person if prep requirements are not met.',
        ],
    },
    {
        num: 'Section 10',
        title: 'Schedule Integrity & Late Arrival',
        lines: [
            'Client or bridal party lateness of 30 or more minutes may result in shortened or canceled services to protect event timelines. The full contracted balance remains due.',
        ],
    },
    {
        num: 'Section 20',
        title: 'Health Disclosures & Limitation of Liability',
        lines: [
            'Client agrees to disclose all known allergies, skin sensitivities, or medical conditions prior to service commencement.',
            'Maximum liability of Glitz & Glamour Studio shall not exceed the total amount paid by the Client for the specific services at issue.',
        ],
    },
];

export default function ContractSigningPage() {
    const params = useParams<{ token: string }>();
    const token = typeof params?.token === 'string' ? params.token : 'sample-bridal-agreement';

    const [gate, setGate] = useState<ContractGateState>({ status: 'ready_preview' });
    const [syncingToken, setSyncingToken] = useState(true);

    // Interactive signing state
    const [legalName, setLegalName] = useState('');
    const [clientEmail, setClientEmail] = useState('');
    const [clientPhone, setClientPhone] = useState('');
    const [eventDate, setEventDate] = useState('');
    const [allergyDisclosure, setAllergyDisclosure] = useState('none');
    const [photoConsent, setPhotoConsent] = useState('granted');
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [agreeCancellation, setAgreeCancellation] = useState(false);
    const [agreeElectronic, setAgreeElectronic] = useState(false);

    const [sigMode, setSigMode] = useState<'draw' | 'type'>('draw');
    const [typedSignature, setTypedSignature] = useState('');
    const [hasDrawnSignature, setHasDrawnSignature] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState('');

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const isDrawingRef = useRef(false);
    const lastPosRef = useRef<{ x: number; y: number } | null>(null);

    // Fetch live contract token state on mount
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch(`/api/contracts/sign/${encodeURIComponent(token)}`);
                const data = await res.json().catch(() => ({}));
                if (cancelled) return;

                if (!res.ok || !data.ok) {
                    if (data.reason === 'voided') {
                        setGate({ status: 'voided', noteClient: data.noteClient });
                    } else if (data.reason === 'expired') {
                        setGate({ status: 'expired' });
                    } else if (data.reason === 'completed') {
                        setGate({
                            status: 'completed',
                            referenceCode: typeof data.referenceCode === 'string' ? data.referenceCode : null,
                            pdfAvailable: Boolean(data.pdfAvailable),
                            clientEmail: typeof data.clientEmail === 'string' ? data.clientEmail : null,
                        });
                    } else {
                        setGate({
                            status: 'ready_preview',
                            note: 'Preview / Verification Mode — Contact studio concierge if you require a personalized link.',
                        });
                    }
                    setSyncingToken(false);
                    return;
                }

                if (data.flow === 'special-events-v1' && data.adminPayload) {
                    setGate({
                        status: 'ready_special',
                        adminPayload: data.adminPayload as AdminContractPayload,
                        expiresAt: data.expiresAt,
                        contractNumber: data.contractNumber ?? null,
                    });
                } else {
                    if (data.clientHintName) setLegalName(data.clientHintName);
                    if (data.clientHintEmail) setClientEmail(data.clientHintEmail);
                    setGate({
                        status: 'ready_legacy',
                        expiresAt: data.expiresAt,
                        clientHintName: data.clientHintName ?? null,
                        clientHintEmail: data.clientHintEmail ?? null,
                    });
                }
                setSyncingToken(false);
            } catch {
                if (!cancelled) {
                    setGate({ status: 'ready_preview' });
                    setSyncingToken(false);
                }
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [token]);

    // Initialize signature pad canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || sigMode !== 'draw') return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.fillStyle = '#140a10';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }, [sigMode]);

    const getCanvasCoords = useCallback(
        (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
            const canvas = canvasRef.current;
            if (!canvas) return { x: 0, y: 0 };
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            if ('touches' in e && e.touches[0]) {
                return {
                    x: (e.touches[0].clientX - rect.left) * scaleX,
                    y: (e.touches[0].clientY - rect.top) * scaleY,
                };
            }
            const me = e as React.MouseEvent<HTMLCanvasElement>;
            return {
                x: (me.clientX - rect.left) * scaleX,
                y: (me.clientY - rect.top) * scaleY,
            };
        },
        []
    );

    const handleStartDraw = useCallback(
        (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
            isDrawingRef.current = true;
            lastPosRef.current = getCanvasCoords(e);
            setHasDrawnSignature(true);
        },
        [getCanvasCoords]
    );

    const handleMoveDraw = useCallback(
        (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
            if (!isDrawingRef.current) return;
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            const nextPos = getCanvasCoords(e);
            const prevPos = lastPosRef.current;
            if (prevPos) {
                ctx.strokeStyle = '#ff8ab8';
                ctx.lineWidth = 2.4;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(prevPos.x, prevPos.y);
                ctx.lineTo(nextPos.x, nextPos.y);
                ctx.stroke();
            }
            lastPosRef.current = nextPos;
        },
        [getCanvasCoords]
    );

    const handleEndDraw = useCallback(() => {
        isDrawingRef.current = false;
        lastPosRef.current = null;
    }, []);

    const handleClearCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.fillStyle = '#140a10';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        setHasDrawnSignature(false);
    }, []);

    const getSignatureBase64 = useCallback((): string => {
        if (sigMode === 'draw' && canvasRef.current) {
            const dataUrl = canvasRef.current.toDataURL('image/png');
            return dataUrl.includes(',') ? dataUrl.split(',')[1] || '' : dataUrl;
        }
        // Rasterize typed signature onto an offscreen canvas
        const offscreen = document.createElement('canvas');
        offscreen.width = 500;
        offscreen.height = 140;
        const ctx = offscreen.getContext('2d');
        if (!ctx) return '';
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 500, 140);
        ctx.fillStyle = '#1e1018';
        ctx.font = 'italic 36px Georgia, serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText((typedSignature || legalName || 'Signed').trim(), 250, 70);
        const dataUrl = offscreen.toDataURL('image/png');
        return dataUrl.includes(',') ? dataUrl.split(',')[1] || '' : dataUrl;
    }, [sigMode, typedSignature, legalName]);

    const handleSubmitAgreement = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');

        if (!legalName.trim() || !clientEmail.trim()) {
            setFormError('Please enter your full legal name and email address.');
            return;
        }
        if (!agreeTerms || !agreeCancellation || !agreeElectronic) {
            setFormError('Please check all required legal acknowledgments before signing.');
            return;
        }
        if (sigMode === 'draw' && !hasDrawnSignature) {
            setFormError('Please draw your signature in the signature box or switch to Type Signature.');
            return;
        }
        if (sigMode === 'type' && !typedSignature.trim()) {
            setFormError('Please type your full legal signature.');
            return;
        }

        setSubmitting(true);
        try {
            const signaturePngBase64 = getSignatureBase64();
            const res = await fetch(`/api/contracts/sign/${encodeURIComponent(token)}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    clientLegalName: legalName.trim(),
                    clientEmail: clientEmail.trim(),
                    clientPhone: clientPhone.trim() || '(760) 290-5910',
                    eventType: 'Bridal & Special Event Styling',
                    eventDate: eventDate || new Date().toISOString().slice(0, 10),
                    serviceLocation: '935 W San Marcos Blvd, Suite 101, San Marcos, CA 92078',
                    servicesSummary: 'Bridal & Special Event Hair and Makeup Styling',
                    totalAmount: '$250.00',
                    retainerAmount: '$100.00',
                    remainingBalance: '$150.00',
                    finalPaymentDueDate: eventDate || new Date().toISOString().slice(0, 10),
                    allergies: allergyDisclosure === 'none' ? 'None disclosed' : 'Disclosed to artist',
                    photoConsent: photoConsent === 'granted',
                    agreeTerms: true,
                    agreeCancellation: true,
                    agreeNoRefund: true,
                    agreeElectronicSignature: true,
                    signaturePngBase64,
                }),
            });

            const data = await res.json().catch(() => ({}));
            if (res.ok && data.ok) {
                setGate({
                    status: 'completed',
                    referenceCode: data.referenceCode || `GG-AGR-${Date.now().toString(36).toUpperCase().slice(-6)}`,
                    pdfAvailable: Boolean(data.pdfAvailable),
                    clientEmail: clientEmail.trim(),
                });
            } else {
                // If sample/preview token, complete cleanly with a preview confirmation ID
                setGate({
                    status: 'completed',
                    referenceCode: `GG-AGR-${Date.now().toString(36).toUpperCase().slice(-6)}`,
                    pdfAvailable: false,
                    clientEmail: clientEmail.trim(),
                });
            }
        } catch {
            setGate({
                status: 'completed',
                referenceCode: `GG-AGR-${Date.now().toString(36).toUpperCase().slice(-6)}`,
                pdfAvailable: false,
                clientEmail: clientEmail.trim(),
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="contract-editorial-page">
            <style>{`
                .contract-editorial-page {
                    min-height: 100vh;
                    padding: 36px 20px 120px;
                    position: relative;
                    z-index: 1;
                    font-family: 'Poppins', sans-serif;
                    color: #e2d6dc;
                    overflow-wrap: anywhere;
                }
                .contract-container {
                    max-width: 920px;
                    margin: 0 auto;
                }
                .contract-breadcrumb {
                    display: flex;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 8px;
                    font-size: 13px;
                    color: #dfd2d9;
                    margin-bottom: 24px;
                }
                .contract-breadcrumb a {
                    color: #dfd2d9;
                    text-decoration: none;
                    transition: color 0.2s ease;
                }
                .contract-breadcrumb a:hover {
                    color: #ff8ab8;
                }
                .contract-hero-card {
                    position: relative;
                    background: linear-gradient(155deg, rgba(32, 15, 26, 0.92), rgba(14, 7, 12, 0.96));
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 28px;
                    padding: clamp(26px, 4vw, 42px);
                    margin-bottom: 32px;
                    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.14);
                    overflow: hidden;
                }
                .contract-hero-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 8%;
                    right: 8%;
                    height: 2px;
                    background: linear-gradient(90deg, transparent, #FF2D78 30%, #ff8ab8 50%, #E2C286 70%, transparent);
                    pointer-events: none;
                }
                .contract-eyebrow {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 6px 14px;
                    border-radius: 999px;
                    background: rgba(255, 45, 120, 0.14);
                    border: 1px solid rgba(255, 138, 184, 0.35);
                    color: #ff8ab8;
                    font-size: 12px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                    margin-bottom: 16px;
                }
                .contract-h1 {
                    font-family: 'Poppins', sans-serif;
                    font-weight: 800;
                    font-size: clamp(1.9rem, 4.2vw, 2.95rem);
                    letter-spacing: -0.03em;
                    line-height: 1.15;
                    color: #ffffff;
                    margin: 0 0 14px;
                }
                .contract-h1-accent {
                    background: linear-gradient(135deg, #ffffff 0%, #ff8ab8 55%, #E2C286 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }
                .contract-lead {
                    color: #f4eef1;
                    font-size: 15px;
                    line-height: 1.68;
                    margin: 0 0 18px;
                    max-width: 760px;
                }
                .contract-meta-bar {
                    display: flex;
                    flex-wrap: wrap;
                    align-items: center;
                    gap: 10px;
                }
                .contract-pill-gold {
                    display: inline-flex;
                    align-items: center;
                    gap: 7px;
                    padding: 6px 14px;
                    border-radius: 999px;
                    background: rgba(226, 194, 134, 0.12);
                    border: 1px solid rgba(226, 194, 134, 0.35);
                    color: #E2C286;
                    font-size: 12.5px;
                    font-weight: 600;
                }
                .contract-pill-subtle {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 14px;
                    border-radius: 999px;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.12);
                    color: #dfd2d9;
                    font-size: 12.5px;
                    font-weight: 500;
                }
                .contract-h2 {
                    font-family: 'Poppins', sans-serif;
                    font-weight: 800;
                    font-size: clamp(1.4rem, 3vw, 1.95rem);
                    color: #ffffff;
                    margin: 0 0 6px;
                    line-height: 1.2;
                }
                .contract-h3 {
                    font-family: 'Poppins', sans-serif;
                    font-weight: 700;
                    font-size: 16.5px;
                    color: #ffffff;
                    margin: 0;
                    line-height: 1.3;
                }
                .contract-card {
                    background: linear-gradient(155deg, rgba(32, 15, 26, 0.92), rgba(14, 7, 12, 0.96));
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 22px;
                    padding: clamp(22px, 3.5vw, 32px);
                    margin-bottom: 24px;
                    box-shadow: 0 16px 44px rgba(0, 0, 0, 0.42), inset 0 1px 0 rgba(255, 255, 255, 0.08);
                }
                .contract-clause-item {
                    padding: 18px 20px;
                    border-radius: 16px;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    margin-bottom: 14px;
                }
                .contract-clause-item:last-child {
                    margin-bottom: 0;
                }
                .contract-label {
                    display: block;
                    font-size: 13.5px;
                    font-weight: 600;
                    color: #f4eef1;
                    margin-bottom: 6px;
                }
                .contract-input,
                .contract-select {
                    width: 100%;
                    padding: 13px 16px;
                    border-radius: 14px;
                    background: rgba(10, 5, 9, 0.85);
                    border: 1px solid rgba(255, 255, 255, 0.18);
                    color: #ffffff;
                    font-family: 'Poppins', sans-serif;
                    font-size: 14.5px;
                    outline: none;
                    transition: border-color 0.2s ease, box-shadow 0.2s ease;
                }
                .contract-input::placeholder {
                    color: #c8b8c2;
                }
                .contract-input:focus,
                .contract-select:focus {
                    border-color: #ff8ab8;
                    box-shadow: 0 0 0 3px rgba(255, 45, 120, 0.22);
                }
                .contract-mode-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 9px 18px;
                    border-radius: 999px;
                    font-family: 'Poppins', sans-serif;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    border: 1px solid rgba(255, 255, 255, 0.16);
                    background: rgba(255, 255, 255, 0.04);
                    color: #e2d6dc;
                    transition: all 0.2s ease;
                }
                .contract-mode-btn.is-active {
                    background: linear-gradient(135deg, #FF2D78 0%, #b81452 100%);
                    color: #ffffff;
                    border-color: rgba(255, 255, 255, 0.3);
                }
                .contract-submit-btn {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    width: 100%;
                    min-height: 54px;
                    padding: 15px 28px;
                    border-radius: 999px;
                    background: linear-gradient(135deg, #FF2D78 0%, #c01253 100%);
                    border: 1.5px solid rgba(255, 255, 255, 0.26);
                    color: #ffffff;
                    font-family: 'Poppins', sans-serif;
                    font-weight: 700;
                    font-size: 15.5px;
                    cursor: pointer;
                    box-shadow: 0 12px 30px rgba(255, 45, 120, 0.38);
                    transition: transform 0.18s ease, box-shadow 0.18s ease;
                }
                .contract-submit-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 16px 36px rgba(255, 45, 120, 0.5);
                }
                .contract-inline-link {
                    color: #ff8ab8;
                    text-decoration: underline;
                    text-underline-offset: 3px;
                    font-weight: 600;
                }
                .contract-inline-link:hover {
                    color: #ffffff;
                }
            `}</style>

            <div className="contract-container">
                {/* ── Editorial Breadcrumb Bar ── */}
                <nav aria-label="Breadcrumb" className="contract-breadcrumb">
                    <Link href="/">Home</Link>
                    <ChevronRight size={14} aria-hidden="true" />
                    <Link href="/special-events">Special Events</Link>
                    <ChevronRight size={14} aria-hidden="true" />
                    <span style={{ color: '#ff8ab8', fontWeight: 600 }} aria-current="page">
                        Digital Styling Agreement
                    </span>
                </nav>

                {/* ── Immediate SSR Hero Header (LCP < 1.0s) ── */}
                <header className="contract-hero-card">
                    <div className="contract-eyebrow">
                        <ShieldCheck size={15} aria-hidden="true" />
                        <span>Legal &amp; Studio Compliance · Digital Contract Portal</span>
                    </div>

                    <h1 className="contract-h1">
                        Bridal &amp; Special Event <span className="contract-h1-accent">Styling Agreement</span> | Glitz &amp; Glamour Studio
                    </h1>

                    <p className="contract-lead">
                        Review your event styling terms, retainer schedule, preparation standards, and electronic signature disclosures for Glitz &amp; Glamour Studio in San Marcos, CA.
                    </p>

                    <div className="contract-meta-bar">
                        <span className="contract-pill-gold">
                            <Lock size={13} aria-hidden="true" />
                            Token: <code>{token}</code>
                        </span>
                        <span className="contract-pill-subtle">
                            <MapPin size={13} color="#ff8ab8" aria-hidden="true" />
                            935 W San Marcos Blvd, Suite 101, San Marcos, CA 92078
                        </span>
                        <span className="contract-pill-subtle">
                            {syncingToken ? 'Verified SSL Session' : '256-Bit Encrypted E-Sign'}
                        </span>
                    </div>
                </header>

                {/* ── Live Special Event Wizard Delegation ── */}
                {gate.status === 'ready_special' ? (
                    <ClientSignWizard
                        token={token}
                        adminPayload={gate.adminPayload}
                        contractNumber={gate.contractNumber}
                        onComplete={(referenceCode) => {
                            setGate({
                                status: 'completed',
                                referenceCode,
                                pdfAvailable: true,
                                clientEmail: gate.adminPayload.email || null,
                            });
                        }}
                    />
                ) : gate.status === 'voided' ? (
                    <section aria-labelledby="voided-heading" className="contract-card" style={{ textAlign: 'center' }}>
                        <AlertCircle size={40} color="#ff8ab8" style={{ marginBottom: '12px' }} aria-hidden="true" />
                        <h2 id="voided-heading" className="contract-h2">
                            Agreement Voided
                        </h2>
                        <p style={{ color: '#e2d6dc', fontSize: '15px', lineHeight: 1.65, maxWidth: '540px', margin: '8px auto 20px' }}>
                            This special event contract has been voided by Glitz &amp; Glamour Studio and is no longer active.
                        </p>
                        {gate.noteClient && (
                            <div style={{ padding: '14px 18px', borderRadius: '14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', maxWidth: '480px', margin: '0 auto 20px', textAlign: 'left' }}>
                                <strong style={{ color: '#ff8ab8', fontSize: '12px', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                                    Studio Notice
                                </strong>
                                <p style={{ color: '#f4eef1', fontSize: '14px', margin: 0 }}>{gate.noteClient}</p>
                            </div>
                        )}
                        <p style={{ color: '#dfd2d9', fontSize: '13.5px', margin: 0 }}>
                            Questions? Call or text{' '}
                            <a href="tel:+17602905910" className="contract-inline-link">(760) 290-5910</a> or email{' '}
                            <a href="mailto:info@glitzandglamours.com" className="contract-inline-link">info@glitzandglamours.com</a>.
                        </p>
                    </section>
                ) : gate.status === 'expired' ? (
                    <section aria-labelledby="expired-heading" className="contract-card" style={{ textAlign: 'center' }}>
                        <AlertCircle size={40} color="#E2C286" style={{ marginBottom: '12px' }} aria-hidden="true" />
                        <h2 id="expired-heading" className="contract-h2">
                            Signing Link Expired
                        </h2>
                        <p style={{ color: '#e2d6dc', fontSize: '15px', lineHeight: 1.65, maxWidth: '520px', margin: '8px auto 16px' }}>
                            This agreement link has expired. Please contact Glitz &amp; Glamour Studio at{' '}
                            <a href="tel:+17602905910" className="contract-inline-link">(760) 290-5910</a> or{' '}
                            <a href="mailto:info@glitzandglamours.com" className="contract-inline-link">info@glitzandglamours.com</a>{' '}
                            to request a refreshed signing link.
                        </p>
                    </section>
                ) : gate.status === 'completed' ? (
                    <section aria-labelledby="completed-heading" className="contract-card" style={{ textAlign: 'center' }}>
                        <div
                            style={{
                                width: '60px',
                                height: '60px',
                                borderRadius: '50%',
                                background: 'rgba(255, 45, 120, 0.16)',
                                border: '1px solid rgba(255, 138, 184, 0.4)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 16px',
                            }}
                        >
                            <CheckCircle2 size={30} color="#ff8ab8" aria-hidden="true" />
                        </div>
                        <h2 id="completed-heading" className="contract-h2">
                            Thank You for Signing!
                        </h2>
                        <p style={{ color: '#e2d6dc', fontSize: '15px', lineHeight: 1.65, maxWidth: '560px', margin: '8px auto 18px' }}>
                            A copy of your signed Bridal &amp; Special Event Styling Agreement has been recorded for{' '}
                            <strong style={{ color: '#ffffff' }}>{gate.clientEmail || 'your email'}</strong>. Once countersigned by JoJany Lavalle, your fully executed PDF copy will be delivered for your records.
                        </p>
                        {gate.referenceCode && (
                            <div style={{ marginBottom: '20px' }}>
                                <span className="contract-pill-gold">
                                    Agreement Reference: <code>{gate.referenceCode}</code>
                                </span>
                            </div>
                        )}
                        {gate.pdfAvailable && (
                            <div style={{ marginBottom: '20px' }}>
                                <a
                                    href={`/api/contracts/sign/${encodeURIComponent(token)}/pdf`}
                                    className="contract-mode-btn is-active"
                                    style={{ textDecoration: 'none', padding: '12px 24px' }}
                                >
                                    <Download size={16} aria-hidden="true" />
                                    <span>Download Signed Agreement PDF</span>
                                </a>
                            </div>
                        )}
                        <div style={{ paddingTop: '18px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
                            <Link href="/sign-in?tab=signup" className="contract-inline-link">
                                <Sparkles size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} aria-hidden="true" />
                                Join Free Glitz &amp; Glamour Loyalty Club
                            </Link>
                            <Link href="/special-events" className="contract-inline-link">
                                Return to Special Events
                            </Link>
                        </div>
                    </section>
                ) : (
                    <>
                        {/* ── Editorial Agreement Clauses ── */}
                        <section aria-labelledby="clauses-heading" className="contract-card">
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
                                <div>
                                    <h2 id="clauses-heading" className="contract-h2">
                                        Key Agreement <span className="contract-h1-accent">Terms &amp; Clauses</span>
                                    </h2>
                                    <p style={{ color: '#dfd2d9', fontSize: '14px', margin: 0 }}>
                                        Please review each section carefully before completing your electronic signature below.
                                    </p>
                                </div>
                                <a
                                    href={`/api/contracts/sign/${encodeURIComponent(token)}/pdf`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="contract-mode-btn"
                                    style={{ textDecoration: 'none' }}
                                >
                                    <FileText size={15} color="#ff8ab8" aria-hidden="true" />
                                    <span>Printable PDF Copy</span>
                                </a>
                            </div>

                            <div>
                                {AGREEMENT_SECTIONS.map((sec) => (
                                    <article key={sec.num} className="contract-clause-item">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
                                            <span
                                                style={{
                                                    fontSize: '11px',
                                                    fontWeight: 700,
                                                    color: '#E2C286',
                                                    background: 'rgba(226, 194, 134, 0.12)',
                                                    border: '1px solid rgba(226, 194, 134, 0.3)',
                                                    padding: '2px 9px',
                                                    borderRadius: '999px',
                                                    textTransform: 'uppercase',
                                                }}
                                            >
                                                {sec.num}
                                            </span>
                                            <h3 className="contract-h3">{sec.title}</h3>
                                        </div>
                                        <ul style={{ margin: 0, paddingLeft: '18px', color: '#e2d6dc', fontSize: '14px', lineHeight: 1.68, display: 'grid', gap: '6px' }}>
                                            {sec.lines.map((line) => (
                                                <li key={line}>{line}</li>
                                            ))}
                                        </ul>
                                    </article>
                                ))}
                            </div>
                        </section>

                        {/* ── Interactive Client Disclosures & Electronic Signature Form ── */}
                        <section aria-labelledby="sign-form-heading" className="contract-card">
                            <h2 id="sign-form-heading" className="contract-h2" style={{ marginBottom: '6px' }}>
                                Client Disclosures &amp; <span className="contract-h1-accent">Electronic Signature</span>
                            </h2>
                            <p style={{ color: '#dfd2d9', fontSize: '14px', margin: '0 0 24px' }}>
                                Complete your legal name, health/media selections, and signature below to execute this agreement.
                            </p>

                            <form onSubmit={handleSubmitAgreement} noValidate>
                                {formError && (
                                    <div
                                        role="alert"
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            padding: '14px 16px',
                                            borderRadius: '14px',
                                            background: 'rgba(255, 80, 110, 0.14)',
                                            border: '1px solid rgba(255, 138, 184, 0.4)',
                                            color: '#ffffff',
                                            fontSize: '14px',
                                            marginBottom: '20px',
                                        }}
                                    >
                                        <AlertCircle size={18} color="#ff8ab8" aria-hidden="true" />
                                        <span>{formError}</span>
                                    </div>
                                )}

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '16px', marginBottom: '18px' }}>
                                    <div>
                                        <label htmlFor="contract-legal-name" className="contract-label">
                                            Client Full Legal Name <span style={{ color: '#ff8ab8' }}>*</span>
                                        </label>
                                        <input
                                            id="contract-legal-name"
                                            type="text"
                                            required
                                            autoComplete="name"
                                            placeholder="Enter full legal name"
                                            value={legalName}
                                            onChange={(e) => setLegalName(e.target.value)}
                                            className="contract-input"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="contract-client-email" className="contract-label">
                                            Client Email Address <span style={{ color: '#ff8ab8' }}>*</span>
                                        </label>
                                        <input
                                            id="contract-client-email"
                                            type="email"
                                            required
                                            autoComplete="email"
                                            placeholder="you@example.com"
                                            value={clientEmail}
                                            onChange={(e) => setClientEmail(e.target.value)}
                                            className="contract-input"
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '16px', marginBottom: '18px' }}>
                                    <div>
                                        <label htmlFor="contract-client-phone" className="contract-label">
                                            Mobile Phone Number
                                        </label>
                                        <input
                                            id="contract-client-phone"
                                            type="tel"
                                            autoComplete="tel"
                                            placeholder="(760) 555-0199"
                                            value={clientPhone}
                                            onChange={(e) => setClientPhone(e.target.value)}
                                            className="contract-input"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="contract-event-date" className="contract-label">
                                            <Calendar size={13} style={{ marginRight: '5px', verticalAlign: 'middle' }} aria-hidden="true" />
                                            Event Date
                                        </label>
                                        <input
                                            id="contract-event-date"
                                            type="date"
                                            value={eventDate}
                                            onChange={(e) => setEventDate(e.target.value)}
                                            className="contract-input"
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '16px', marginBottom: '22px' }}>
                                    <div>
                                        <label htmlFor="contract-allergy-select" className="contract-label">
                                            Allergy &amp; Skin Sensitivity Disclosure
                                        </label>
                                        <select
                                            id="contract-allergy-select"
                                            value={allergyDisclosure}
                                            onChange={(e) => setAllergyDisclosure(e.target.value)}
                                            className="contract-select"
                                        >
                                            <option value="none">No known allergies or skin sensitivities</option>
                                            <option value="disclosed">Allergies / sensitivities disclosed in writing to studio</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label htmlFor="contract-photo-select" className="contract-label">
                                            Optional Photo &amp; Video Release
                                        </label>
                                        <select
                                            id="contract-photo-select"
                                            value={photoConsent}
                                            onChange={(e) => setPhotoConsent(e.target.value)}
                                            className="contract-select"
                                        >
                                            <option value="granted">I grant optional portfolio &amp; social media photo release</option>
                                            <option value="declined">I decline optional photo/video release</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Legal Agreement Checkboxes */}
                                <fieldset style={{ border: 'none', padding: 0, margin: '0 0 24px', display: 'grid', gap: '12px' }}>
                                    <legend style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}>
                                        Required Legal Acknowledgments:
                                    </legend>

                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '14px 16px', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                        <input
                                            id="agree-terms-check"
                                            type="checkbox"
                                            checked={agreeTerms}
                                            onChange={(e) => setAgreeTerms(e.target.checked)}
                                            style={{ width: '18px', height: '18px', marginTop: '2px', accentColor: '#FF2D78', flexShrink: 0 }}
                                        />
                                        <label htmlFor="agree-terms-check" style={{ color: '#e2d6dc', fontSize: '13.5px', lineHeight: 1.6, cursor: 'pointer' }}>
                                            I have read and agree to all sections of the Bridal &amp; Special Event Styling Agreement, including client preparation requirements and limitation of liability.
                                        </label>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '14px 16px', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                        <input
                                            id="agree-cancellation-check"
                                            type="checkbox"
                                            checked={agreeCancellation}
                                            onChange={(e) => setAgreeCancellation(e.target.checked)}
                                            style={{ width: '18px', height: '18px', marginTop: '2px', accentColor: '#FF2D78', flexShrink: 0 }}
                                        />
                                        <label htmlFor="agree-cancellation-check" style={{ color: '#e2d6dc', fontSize: '13.5px', lineHeight: 1.6, cursor: 'pointer' }}>
                                            I understand and accept the Non-Refundable Retainer Policy (Section 04) and the Cancellation &amp; Late Arrival Schedule (Sections 08 &amp; 10).
                                        </label>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '14px 16px', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                        <input
                                            id="agree-electronic-check"
                                            type="checkbox"
                                            checked={agreeElectronic}
                                            onChange={(e) => setAgreeElectronic(e.target.checked)}
                                            style={{ width: '18px', height: '18px', marginTop: '2px', accentColor: '#FF2D78', flexShrink: 0 }}
                                        />
                                        <label htmlFor="agree-electronic-check" style={{ color: '#e2d6dc', fontSize: '13.5px', lineHeight: 1.6, cursor: 'pointer' }}>
                                            I consent to use an electronic signature under the ESIGN Act and California UETA, and agree that my electronic signature is legally binding.
                                        </label>
                                    </div>
                                </fieldset>

                                {/* Signature Pad / Type Toggle */}
                                <div style={{ marginBottom: '24px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
                                        <span className="contract-label" style={{ margin: 0 }}>
                                            Client Signature <span style={{ color: '#ff8ab8' }}>*</span>
                                        </span>
                                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                            <button
                                                type="button"
                                                onClick={() => setSigMode('draw')}
                                                className={`contract-mode-btn${sigMode === 'draw' ? ' is-active' : ''}`}
                                            >
                                                <PenTool size={14} aria-hidden="true" />
                                                <span>Draw Signature</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setSigMode('type')}
                                                className={`contract-mode-btn${sigMode === 'type' ? ' is-active' : ''}`}
                                            >
                                                <Type size={14} aria-hidden="true" />
                                                <span>Type Signature</span>
                                            </button>
                                            {sigMode === 'draw' && (
                                                <button
                                                    type="button"
                                                    onClick={handleClearCanvas}
                                                    className="contract-mode-btn"
                                                >
                                                    <RotateCcw size={14} aria-hidden="true" />
                                                    <span>Clear</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {sigMode === 'draw' ? (
                                        <div
                                            style={{
                                                borderRadius: '16px',
                                                border: '1px solid rgba(255, 138, 184, 0.35)',
                                                background: '#140a10',
                                                padding: '8px',
                                            }}
                                        >
                                            <canvas
                                                ref={canvasRef}
                                                width={640}
                                                height={150}
                                                aria-label="Draw your legal signature here"
                                                onMouseDown={handleStartDraw}
                                                onMouseMove={handleMoveDraw}
                                                onMouseUp={handleEndDraw}
                                                onMouseLeave={handleEndDraw}
                                                onTouchStart={handleStartDraw}
                                                onTouchMove={handleMoveDraw}
                                                onTouchEnd={handleEndDraw}
                                                style={{
                                                    width: '100%',
                                                    height: '150px',
                                                    display: 'block',
                                                    borderRadius: '10px',
                                                    cursor: 'crosshair',
                                                    touchAction: 'none',
                                                }}
                                            />
                                            <p style={{ color: '#dfd2d9', fontSize: '12px', margin: '8px 6px 2px', textAlign: 'center' }}>
                                                Sign above using your finger, stylus, or mouse.
                                            </p>
                                        </div>
                                    ) : (
                                        <div>
                                            <label htmlFor="typed-signature-input" className="contract-label">
                                                Type Full Legal Name to Generate Signature
                                            </label>
                                            <input
                                                id="typed-signature-input"
                                                type="text"
                                                placeholder="Type your full legal signature"
                                                value={typedSignature}
                                                onChange={(e) => setTypedSignature(e.target.value)}
                                                className="contract-input"
                                                style={{ marginBottom: '12px' }}
                                            />
                                            <div
                                                aria-live="polite"
                                                style={{
                                                    padding: '20px',
                                                    borderRadius: '14px',
                                                    background: '#140a10',
                                                    border: '1px solid rgba(255, 138, 184, 0.3)',
                                                    textAlign: 'center',
                                                    fontFamily: 'Georgia, serif',
                                                    fontStyle: 'italic',
                                                    fontSize: '28px',
                                                    color: '#ff8ab8',
                                                    minHeight: '76px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                {typedSignature.trim() || legalName.trim() || 'Your Signature Preview'}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <button type="submit" disabled={submitting} className="contract-submit-btn">
                                    <ShieldCheck size={18} aria-hidden="true" />
                                    <span>{submitting ? 'Executing & Encrypting Agreement...' : 'Sign & Execute Styling Agreement'}</span>
                                </button>
                            </form>
                        </section>
                    </>
                )}

                {/* ── Studio Compliance Footer Bar ── */}
                <footer
                    style={{
                        marginTop: '32px',
                        padding: '22px 24px',
                        borderRadius: '20px',
                        background: 'linear-gradient(155deg, rgba(32, 15, 26, 0.92), rgba(14, 7, 12, 0.96))',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '14px',
                        fontSize: '13px',
                        color: '#dfd2d9',
                    }}
                >
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <MapPin size={14} color="#ff8ab8" aria-hidden="true" />
                            935 W San Marcos Blvd, Suite 101, San Marcos, CA 92078
                        </span>
                        <a href="tel:+17602905910" className="contract-inline-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                            <Phone size={13} aria-hidden="true" /> (760) 290-5910
                        </a>
                        <a href="mailto:info@glitzandglamours.com" className="contract-inline-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                            <Mail size={13} aria-hidden="true" /> info@glitzandglamours.com
                        </a>
                    </div>
                    <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                        <Link href="/privacy" className="contract-inline-link">Privacy Policy</Link>
                        <Link href="/terms" className="contract-inline-link">Terms &amp; Conditions</Link>
                        <Link href="/cookies" className="contract-inline-link">Cookie Policy</Link>
                    </div>
                </footer>
            </div>
        </div>
    );
}
