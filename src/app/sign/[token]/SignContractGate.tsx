'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    Sparkles,
    ShieldAlert,
    FileX2,
    Clock,
    FileClock,
    CheckCircle2,
    Gift,
    Cake,
    Tag,
    Smartphone,
    ArrowRight,
    ArrowLeft,
    Phone,
    Mail,
    ShieldCheck,
    FileSignature,
} from 'lucide-react';
import type { AdminContractPayload } from '@/lib/contracts/adminContractPayload';
import ClientSignWizard from './ClientSignWizard';
import styles from './contract-sign.module.css';
import './client-sign.css';

type Gate =
    | { state: 'loading' }
    | { state: 'invalid' }
    | { state: 'expired' }
    | { state: 'not_sent' }
    | { state: 'voided'; noteClient?: string | null }
    | {
          state: 'ready_legacy';
          expiresAt: string;
          clientHintName: string | null;
          clientHintEmail: string | null;
      }
    | {
          state: 'ready_special';
          adminPayload: AdminContractPayload;
          expiresAt: string;
          contractNumber: string | null;
      }
    | {
          state: 'completed';
          referenceCode: string | null;
          pdfAvailable: boolean;
          token: string;
          flow: string;
          clientEmail: string | null;
      };

const HIGH_CONTRAST_WIZARD_OVERRIDES = `
    :root {
        --pk: #FF2D78;
        --pk2: #ff8ab8;
        --bg: #0a0609;
        --card: #160b12;
        --brd: rgba(255, 255, 255, 0.12);
        --txt: #f4eef1;
        --mut: #dfd2d9;
        --grn: #00D478;
    }
    .csShell {
        background: radial-gradient(circle at 50% 0%, rgba(255, 45, 120, 0.14) 0%, rgba(32, 15, 26, 0.4) 42%, #0a0609 100%) !important;
        color: #f4eef1 !important;
    }
    .csCard {
        background: linear-gradient(155deg, rgba(32, 15, 26, 0.92), rgba(14, 7, 12, 0.96)) !important;
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
        box-shadow: 0 20px 52px rgba(0, 0, 0, 0.48) !important;
    }
    .csTopSub, .csProgLabel, .csCardBadge, .csInfoK, .csKvK, .csTbl th, .csLabel, .csSec31Confirm, .wsPlaceholder {
        color: #dfd2d9 !important;
    }
    .csP, .csList li, .csTbl td, .csGeoLabel, .csSec31Prose p, .csInitLabel, .wsItem {
        color: #e2d6dc !important;
    }
    .csCardTitle, .csTopBrand, .csGradTitle {
        background: linear-gradient(135deg, #ff8ab8, #E2C286) !important;
        -webkit-background-clip: text !important;
        background-clip: text !important;
        -webkit-text-fill-color: transparent !important;
    }
    .csInitPH {
        color: #ff8ab8 !important;
    }
    .csBtnSubmit, .csFloatNext {
        background: linear-gradient(135deg, #d81b60 0%, #a01347 100%) !important;
        color: #ffffff !important;
        border: 1px solid rgba(255, 138, 184, 0.4) !important;
    }
    .csFloatBack {
        color: #ff8ab8 !important;
        background: rgba(32, 15, 26, 0.92) !important;
        border: 1px solid rgba(255, 138, 184, 0.35) !important;
    }
    .csFloatInit {
        color: #ffb4c8 !important;
        background: rgba(180, 20, 60, 0.88) !important;
        border: 1px solid rgba(255, 138, 184, 0.5) !important;
    }
    @keyframes sgSpin {
        to { transform: rotate(360deg); }
    }
`;

function EditorialContractHeader() {
    return (
        <header
            style={{
                maxWidth: '600px',
                width: '100%',
                margin: '0 auto 28px',
                textAlign: 'center',
            }}
        >
            <div
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 14px',
                    borderRadius: '999px',
                    background: 'rgba(255, 45, 120, 0.12)',
                    border: '1px solid rgba(255, 138, 184, 0.3)',
                    color: '#ff8ab8',
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    marginBottom: '14px',
                }}
            >
                <Sparkles size={13} color="#E2C286" />
                Digital Agreement Portal
            </div>

            <h1
                style={{
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: 800,
                    fontSize: 'clamp(24px, 5.5vw, 34px)',
                    lineHeight: 1.2,
                    color: '#ffffff',
                    letterSpacing: '-0.02em',
                    margin: '0 0 10px',
                }}
            >
                Special Event Service Agreement{' '}
                <span
                    style={{
                        display: 'block',
                        fontSize: 'clamp(15px, 3.6vw, 19px)',
                        fontWeight: 600,
                        color: '#ff8ab8',
                        marginTop: '4px',
                    }}
                >
                    Glitz &amp; Glamour Studio
                </span>
            </h1>

            <p
                style={{
                    fontFamily: 'Poppins, sans-serif',
                    color: '#e2d6dc',
                    fontSize: '14px',
                    lineHeight: 1.65,
                    margin: '0 auto',
                    maxWidth: '48ch',
                }}
            >
                Secure electronic contract review, health &amp; safety disclosures, and digital signature verification
                for bridal and special event bookings.
            </p>
        </header>
    );
}

function StudioSupportFooter() {
    return (
        <div
            style={{
                marginTop: '24px',
                paddingTop: '20px',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                alignItems: 'center',
            }}
        >
            <p
                style={{
                    color: '#dfd2d9',
                    fontSize: '13px',
                    margin: 0,
                    lineHeight: 1.6,
                    fontFamily: 'Poppins, sans-serif',
                }}
            >
                Need assistance with your contract link? Reach our studio concierge:
            </p>

            <div
                style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '10px',
                    justifyContent: 'center',
                }}
            >
                <a
                    href="tel:7602905910"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '7px',
                        padding: '10px 16px',
                        borderRadius: '999px',
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(255, 138, 184, 0.3)',
                        color: '#ff8ab8',
                        textDecoration: 'none',
                        fontSize: '13px',
                        fontWeight: 600,
                        fontFamily: 'Poppins, sans-serif',
                    }}
                >
                    <Phone size={14} /> (760) 290-5910
                </a>
                <a
                    href="mailto:info@glitzandglamours.com"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '7px',
                        padding: '10px 16px',
                        borderRadius: '999px',
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(255, 138, 184, 0.3)',
                        color: '#ff8ab8',
                        textDecoration: 'none',
                        fontSize: '13px',
                        fontWeight: 600,
                        fontFamily: 'Poppins, sans-serif',
                    }}
                >
                    <Mail size={14} /> info@glitzandglamours.com
                </a>
            </div>

            <Link
                href="/"
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: '#dfd2d9',
                    textDecoration: 'none',
                    fontSize: '13px',
                    fontWeight: 600,
                    marginTop: '4px',
                    fontFamily: 'Poppins, sans-serif',
                }}
            >
                <ArrowLeft size={14} /> Return to Glitz &amp; Glamour Studio
            </Link>
        </div>
    );
}

export default function SignContractGate({ token }: { token: string }) {
    const [gate, setGate] = useState<Gate>({ state: 'loading' });

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch(`/api/contracts/sign/${encodeURIComponent(token)}`);
                const data = await res.json();
                if (cancelled) return;
                if (!res.ok || !data.ok) {
                    if (data.reason === 'voided') setGate({ state: 'voided', noteClient: data.noteClient });
                    else if (data.reason === 'expired') setGate({ state: 'expired' });
                    else if (data.reason === 'not_sent') setGate({ state: 'not_sent' });
                    else if (data.reason === 'completed') {
                        setGate({
                            state: 'completed',
                            referenceCode: typeof data.referenceCode === 'string' ? data.referenceCode : null,
                            pdfAvailable: Boolean(data.pdfAvailable),
                            token,
                            flow: typeof data.flow === 'string' ? data.flow : 'legacy',
                            clientEmail: typeof data.clientEmail === 'string' ? data.clientEmail : null,
                        });
                    } else setGate({ state: 'invalid' });
                    return;
                }
                if (data.flow === 'special-events-v1' && data.adminPayload) {
                    setGate({
                        state: 'ready_special',
                        adminPayload: data.adminPayload as AdminContractPayload,
                        expiresAt: data.expiresAt,
                        contractNumber: data.contractNumber ?? null,
                    });
                } else {
                    setGate({
                        state: 'ready_legacy',
                        expiresAt: data.expiresAt,
                        clientHintName: data.clientHintName ?? null,
                        clientHintEmail: data.clientHintEmail ?? null,
                    });
                }
            } catch {
                if (!cancelled) setGate({ state: 'invalid' });
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [token]);

    if (gate.state === 'ready_special') {
        return (
            <>
                <style>{HIGH_CONTRAST_WIZARD_OVERRIDES}</style>
                <ClientSignWizard
                    token={token}
                    adminPayload={gate.adminPayload}
                    contractNumber={gate.contractNumber}
                    onComplete={(referenceCode) => {
                        setGate({
                            state: 'completed',
                            referenceCode,
                            pdfAvailable: true,
                            token,
                            flow: 'special-events-v1',
                            clientEmail: gate.adminPayload.email || null,
                        });
                    }}
                />
            </>
        );
    }

    if (gate.state === 'completed') {
        return (
            <>
                <style>{HIGH_CONTRAST_WIZARD_OVERRIDES}</style>
                <section
                    className={`${styles.root} ${styles.successRoot}`}
                    style={{
                        maxWidth: '640px',
                        margin: '0 auto',
                        padding: 'clamp(36px, 7vw, 64px) 16px 80px',
                        boxSizing: 'border-box',
                    }}
                >
                    {/* ── THANK YOU HERO ── */}
                    <div
                        className={styles.successHero}
                        style={{
                            position: 'relative',
                            overflow: 'hidden',
                            background: 'linear-gradient(155deg, rgba(32, 15, 26, 0.92), rgba(14, 7, 12, 0.96))',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '24px',
                            padding: 'clamp(28px, 6vw, 40px) clamp(20px, 5vw, 32px)',
                            boxShadow: '0 24px 60px rgba(0, 0, 0, 0.5)',
                            marginBottom: '24px',
                        }}
                    >
                        <div
                            aria-hidden="true"
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: '10%',
                                right: '10%',
                                height: '1px',
                                background:
                                    'linear-gradient(90deg, transparent, rgba(255, 138, 184, 0.6), rgba(226, 194, 134, 0.5), transparent)',
                            }}
                        />

                        <div
                            style={{
                                width: '60px',
                                height: '60px',
                                borderRadius: '18px',
                                margin: '0 auto 16px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'rgba(255, 45, 120, 0.14)',
                                border: '1px solid rgba(255, 138, 184, 0.35)',
                                color: '#E2C286',
                            }}
                        >
                            <CheckCircle2 size={30} />
                        </div>

                        <h1
                            style={{
                                fontFamily: 'Poppins, sans-serif',
                                fontSize: 'clamp(24px, 5.5vw, 32px)',
                                fontWeight: 800,
                                color: '#ffffff',
                                margin: '0 0 12px',
                                lineHeight: 1.2,
                            }}
                        >
                            Thank you for signing!
                        </h1>
                        <p
                            style={{
                                fontFamily: 'Poppins, sans-serif',
                                color: '#e2d6dc',
                                lineHeight: 1.7,
                                fontSize: '15px',
                                margin: '0 auto',
                                maxWidth: '42ch',
                            }}
                        >
                            A copy of your signed agreement has been sent to{' '}
                            <strong style={{ color: '#ff8ab8' }}>{gate.clientEmail || 'your email'}</strong>.
                        </p>
                        <p
                            style={{
                                fontFamily: 'Poppins, sans-serif',
                                color: '#dfd2d9',
                                lineHeight: 1.7,
                                fontSize: '14px',
                                margin: '10px auto 0',
                                maxWidth: '42ch',
                            }}
                        >
                            Once we countersign and finalize your contract, we will send you the fully executed PDF
                            copy for your records. You are all set!
                        </p>

                        {gate.referenceCode ? (
                            <div
                                className={styles.successRef}
                                style={{
                                    marginTop: '20px',
                                    marginBottom: 0,
                                    background: 'rgba(255, 45, 120, 0.12)',
                                    border: '1px solid rgba(255, 138, 184, 0.35)',
                                }}
                            >
                                <span className={styles.successRefLabel} style={{ color: '#ff8ab8' }}>
                                    Contract Reference
                                </span>
                                <span className={styles.successRefCode} style={{ color: '#ffffff' }}>
                                    {gate.referenceCode}
                                </span>
                            </div>
                        ) : null}
                    </div>

                    {/* ── G&G MEMBERSHIP BANNER ── */}
                    <div className={styles.memberCta}>
                        <div className={styles.memberCtaGlow} />
                        <div
                            className={styles.memberCtaCard}
                            style={{
                                background: 'linear-gradient(155deg, rgba(32, 15, 26, 0.94), rgba(14, 7, 12, 0.96))',
                                border: '1px solid rgba(255, 138, 184, 0.32)',
                            }}
                        >
                            <div className={styles.memberCtaBadge} style={{ color: '#ff8ab8' }}>
                                <Sparkles size={13} color="#E2C286" /> Exclusive Invitation
                            </div>
                            <h2 className={styles.memberCtaTitle}>Join Glitz &amp; Glamour</h2>
                            <p className={styles.memberCtaLead} style={{ color: '#e2d6dc' }}>
                                As a special event client, you&apos;re invited to join our VIP membership — completely
                                free. Unlock exclusive studio perks every time you visit.
                            </p>
                            <ul className={styles.memberBenefits}>
                                <li>
                                    <span className={styles.memberBenefitIcon} style={{ color: '#ff8ab8' }}>
                                        <Gift size={20} />
                                    </span>
                                    <span>
                                        <strong>Loyalty Rewards Card</strong>
                                        <span className={styles.memberBenefitHint} style={{ color: '#dfd2d9' }}>
                                            Collect stamps with every visit. 10 stamps = complimentary full nail set.
                                        </span>
                                    </span>
                                </li>
                                <li>
                                    <span className={styles.memberBenefitIcon} style={{ color: '#ff8ab8' }}>
                                        <Cake size={20} />
                                    </span>
                                    <span>
                                        <strong>Free Birthday Spin</strong>
                                        <span className={styles.memberBenefitHint} style={{ color: '#dfd2d9' }}>
                                            Spin the prize wheel on your birthday for studio rewards and gifts.
                                        </span>
                                    </span>
                                </li>
                                <li>
                                    <span className={styles.memberBenefitIcon} style={{ color: '#ff8ab8' }}>
                                        <Tag size={20} />
                                    </span>
                                    <span>
                                        <strong>Exclusive Member Offers</strong>
                                        <span className={styles.memberBenefitHint} style={{ color: '#dfd2d9' }}>
                                            Early access to seasonal promotions and Glam Insider rewards.
                                        </span>
                                    </span>
                                </li>
                                <li>
                                    <span className={styles.memberBenefitIcon} style={{ color: '#ff8ab8' }}>
                                        <Smartphone size={20} />
                                    </span>
                                    <span>
                                        <strong>Digital Wallet Pass</strong>
                                        <span className={styles.memberBenefitHint} style={{ color: '#dfd2d9' }}>
                                            Add your loyalty pass to Apple Wallet or Google Wallet — always with you.
                                        </span>
                                    </span>
                                </li>
                            </ul>
                            <a
                                className={styles.memberCtaBtn}
                                href="/sign-in?tab=signup"
                                style={{
                                    background: 'linear-gradient(135deg, #d81b60 0%, #a01347 100%)',
                                    color: '#ffffff',
                                    border: '1px solid rgba(255, 138, 184, 0.45)',
                                }}
                            >
                                <ArrowRight size={18} />
                                Create Your Free Account
                            </a>
                            <p className={styles.memberCtaFine} style={{ color: '#dfd2d9' }}>
                                No payment required · Takes 30 seconds
                            </p>
                        </div>
                    </div>

                    <p className={styles.successContact} style={{ color: '#dfd2d9' }}>
                        Questions? Contact us at{' '}
                        <a
                            className={styles.successContactLink}
                            href="mailto:info@glitzandglamours.com"
                            style={{ color: '#ff8ab8' }}
                        >
                            info@glitzandglamours.com
                        </a>
                    </p>
                </section>
            </>
        );
    }

    // Status states: loading, voided, invalid, not_sent, expired, ready_legacy
    return (
        <>
            <style>{HIGH_CONTRAST_WIZARD_OVERRIDES}</style>
            <section
                style={{
                    minHeight: 'calc(100dvh - 80px)',
                    background:
                        'radial-gradient(circle at 50% 0%, rgba(255, 45, 120, 0.14) 0%, rgba(32, 15, 26, 0.4) 42%, #0a0609 100%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    padding: 'clamp(36px, 7vw, 72px) 16px 80px',
                    boxSizing: 'border-box',
                    width: '100%',
                    overflowX: 'hidden',
                }}
            >
                <EditorialContractHeader />

                <div style={{ width: '100%', maxWidth: '540px' }}>
                    <div
                        style={{
                            position: 'relative',
                            overflow: 'hidden',
                            background: 'linear-gradient(155deg, rgba(32, 15, 26, 0.92), rgba(14, 7, 12, 0.96))',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '24px',
                            padding: 'clamp(28px, 6vw, 40px) clamp(20px, 5vw, 32px)',
                            textAlign: 'center',
                            boxShadow: '0 24px 60px rgba(0, 0, 0, 0.5)',
                        }}
                    >
                        <div
                            aria-hidden="true"
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: '10%',
                                right: '10%',
                                height: '1px',
                                background:
                                    'linear-gradient(90deg, transparent, rgba(255, 138, 184, 0.6), rgba(226, 194, 134, 0.5), transparent)',
                            }}
                        />

                        {gate.state === 'loading' && (
                            <div role="status" aria-live="polite" style={{ padding: '16px 0' }}>
                                <div
                                    style={{
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: '50%',
                                        border: '3px solid rgba(255, 138, 184, 0.22)',
                                        borderTopColor: '#ff8ab8',
                                        animation: 'sgSpin 0.8s linear infinite',
                                        margin: '0 auto 18px',
                                    }}
                                />
                                <h2
                                    style={{
                                        fontFamily: 'Poppins, sans-serif',
                                        fontSize: '20px',
                                        fontWeight: 700,
                                        color: '#ffffff',
                                        margin: '0 0 8px',
                                    }}
                                >
                                    Loading Your Agreement
                                </h2>
                                <p
                                    style={{
                                        fontFamily: 'Poppins, sans-serif',
                                        color: '#e2d6dc',
                                        fontSize: '14px',
                                        lineHeight: 1.65,
                                        margin: 0,
                                    }}
                                >
                                    Verifying your encrypted studio signing token…
                                </p>
                            </div>
                        )}

                        {gate.state === 'voided' && (
                            <>
                                <div
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '56px',
                                        height: '56px',
                                        borderRadius: '18px',
                                        background: 'rgba(255, 80, 110, 0.14)',
                                        border: '1px solid rgba(255, 138, 184, 0.35)',
                                        color: '#ff8ab8',
                                        marginBottom: '16px',
                                    }}
                                >
                                    <FileX2 size={26} />
                                </div>
                                <h2
                                    style={{
                                        fontSize: '22px',
                                        fontWeight: 800,
                                        color: '#ffffff',
                                        margin: '0 0 10px',
                                        fontFamily: 'Poppins, sans-serif',
                                    }}
                                >
                                    Agreement Voided
                                </h2>
                                <p
                                    style={{
                                        color: '#e2d6dc',
                                        fontSize: '14px',
                                        lineHeight: 1.65,
                                        marginBottom: '20px',
                                        fontFamily: 'Poppins, sans-serif',
                                    }}
                                >
                                    This special event contract has been voided by Glitz &amp; Glamour Studio and is no
                                    longer active.
                                </p>
                                {gate.noteClient && (
                                    <div
                                        style={{
                                            background: 'rgba(0, 0, 0, 0.35)',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            borderRadius: '14px',
                                            padding: '14px 18px',
                                            textAlign: 'left',
                                            marginBottom: '20px',
                                        }}
                                    >
                                        <span
                                            style={{
                                                fontSize: '11px',
                                                fontWeight: 700,
                                                color: '#ff8ab8',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.06em',
                                                display: 'block',
                                                marginBottom: '4px',
                                                fontFamily: 'Poppins, sans-serif',
                                            }}
                                        >
                                            Studio Notice
                                        </span>
                                        <p
                                            style={{
                                                color: '#f4eef1',
                                                fontSize: '13.5px',
                                                margin: 0,
                                                lineHeight: 1.55,
                                                fontFamily: 'Poppins, sans-serif',
                                            }}
                                        >
                                            {gate.noteClient}
                                        </p>
                                    </div>
                                )}
                                <StudioSupportFooter />
                            </>
                        )}

                        {gate.state === 'invalid' && (
                            <>
                                <div
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '56px',
                                        height: '56px',
                                        borderRadius: '18px',
                                        background: 'rgba(255, 45, 120, 0.14)',
                                        border: '1px solid rgba(255, 138, 184, 0.35)',
                                        color: '#ff8ab8',
                                        marginBottom: '16px',
                                    }}
                                >
                                    <ShieldAlert size={26} />
                                </div>
                                <h2
                                    style={{
                                        fontSize: '22px',
                                        fontWeight: 800,
                                        color: '#ffffff',
                                        margin: '0 0 10px',
                                        fontFamily: 'Poppins, sans-serif',
                                    }}
                                >
                                    Link Not Valid
                                </h2>
                                <p
                                    style={{
                                        color: '#e2d6dc',
                                        fontSize: '14px',
                                        lineHeight: 1.65,
                                        marginBottom: '8px',
                                        fontFamily: 'Poppins, sans-serif',
                                    }}
                                >
                                    This contract signing link may be incorrect, superseded, or not available yet.
                                    Please contact Glitz &amp; Glamour Studio to request an updated agreement link.
                                </p>
                                <StudioSupportFooter />
                            </>
                        )}

                        {gate.state === 'not_sent' && (
                            <>
                                <div
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '56px',
                                        height: '56px',
                                        borderRadius: '18px',
                                        background: 'rgba(226, 194, 134, 0.14)',
                                        border: '1px solid rgba(226, 194, 134, 0.35)',
                                        color: '#E2C286',
                                        marginBottom: '16px',
                                    }}
                                >
                                    <FileClock size={26} />
                                </div>
                                <h2
                                    style={{
                                        fontSize: '22px',
                                        fontWeight: 800,
                                        color: '#ffffff',
                                        margin: '0 0 10px',
                                        fontFamily: 'Poppins, sans-serif',
                                    }}
                                >
                                    Link Not Active Yet
                                </h2>
                                <p
                                    style={{
                                        color: '#e2d6dc',
                                        fontSize: '14px',
                                        lineHeight: 1.65,
                                        marginBottom: '8px',
                                        fontFamily: 'Poppins, sans-serif',
                                    }}
                                >
                                    This contract is still being prepared by our event coordinator. Please ask the
                                    studio to dispatch your agreement link when ready.
                                </p>
                                <StudioSupportFooter />
                            </>
                        )}

                        {gate.state === 'expired' && (
                            <>
                                <div
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '56px',
                                        height: '56px',
                                        borderRadius: '18px',
                                        background: 'rgba(226, 194, 134, 0.14)',
                                        border: '1px solid rgba(226, 194, 134, 0.35)',
                                        color: '#E2C286',
                                        marginBottom: '16px',
                                    }}
                                >
                                    <Clock size={26} />
                                </div>
                                <h2
                                    style={{
                                        fontSize: '22px',
                                        fontWeight: 800,
                                        color: '#ffffff',
                                        margin: '0 0 10px',
                                        fontFamily: 'Poppins, sans-serif',
                                    }}
                                >
                                    Contract Link Expired
                                </h2>
                                <p
                                    style={{
                                        color: '#e2d6dc',
                                        fontSize: '14px',
                                        lineHeight: 1.65,
                                        marginBottom: '8px',
                                        fontFamily: 'Poppins, sans-serif',
                                    }}
                                >
                                    For your security, special event signing links expire automatically. Please reach
                                    out to the studio so we can send you a fresh contract link.
                                </p>
                                <StudioSupportFooter />
                            </>
                        )}

                        {gate.state === 'ready_legacy' && (
                            <>
                                <div
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '56px',
                                        height: '56px',
                                        borderRadius: '18px',
                                        background: 'rgba(255, 45, 120, 0.14)',
                                        border: '1px solid rgba(255, 138, 184, 0.35)',
                                        color: '#ff8ab8',
                                        marginBottom: '16px',
                                    }}
                                >
                                    <FileSignature size={26} />
                                </div>
                                <h2
                                    style={{
                                        fontSize: '22px',
                                        fontWeight: 800,
                                        color: '#ffffff',
                                        margin: '0 0 10px',
                                        fontFamily: 'Poppins, sans-serif',
                                    }}
                                >
                                    Legacy Agreement Format
                                </h2>
                                <p
                                    style={{
                                        color: '#e2d6dc',
                                        fontSize: '14px',
                                        lineHeight: 1.65,
                                        marginBottom: '8px',
                                        fontFamily: 'Poppins, sans-serif',
                                    }}
                                >
                                    This agreement uses an older contract template. Please contact Glitz &amp; Glamour
                                    Studio to receive our updated Special Event Digital Agreement.
                                </p>
                                <StudioSupportFooter />
                            </>
                        )}
                    </div>

                    <div
                        style={{
                            marginTop: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            color: '#c8b8c2',
                            fontSize: '12px',
                            fontFamily: 'Poppins, sans-serif',
                            textAlign: 'center',
                        }}
                    >
                        <ShieldCheck size={15} color="#E2C286" style={{ flexShrink: 0 }} />
                        <span>256-Bit Encrypted E-Signature · Glitz &amp; Glamour Studio</span>
                    </div>
                </div>
            </section>
        </>
    );
}
