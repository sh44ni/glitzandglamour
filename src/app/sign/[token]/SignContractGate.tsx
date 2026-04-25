'use client';

import { useEffect, useState } from 'react';
import type { AdminContractPayload } from '@/lib/contracts/adminContractPayload';
import ClientSignWizard from './ClientSignWizard';
import styles from './contract-sign.module.css';
import './client-sign.css';

type Gate =
    | { state: 'loading' }
    | { state: 'invalid' }
    | { state: 'expired' }
    | { state: 'not_sent' }
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
                    if (data.reason === 'expired') setGate({ state: 'expired' });
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

    if (gate.state === 'loading') {
        return (
            <div className={styles.root} style={{ textAlign: 'center', paddingTop: 48, color: 'var(--text-muted)' }}>
                Loading…
            </div>
        );
    }

    if (gate.state === 'invalid') {
        return (
            <div className={styles.root} style={{ maxWidth: 560, textAlign: 'center', paddingTop: 48 }}>
                <h1 style={{ fontSize: 22, marginBottom: 12 }}>Link not valid</h1>
                <p style={{ color: 'var(--text-muted)' }}>
                    This signing link may be incorrect or not available yet. Contact Glitz &amp; Glamour Studio.
                </p>
            </div>
        );
    }

    if (gate.state === 'not_sent') {
        return (
            <div className={styles.root} style={{ maxWidth: 560, textAlign: 'center', paddingTop: 48 }}>
                <h1 style={{ fontSize: 22, marginBottom: 12 }}>Link not active yet</h1>
                <p style={{ color: 'var(--text-muted)' }}>
                    This link is not active yet. Ask the studio to send the contract again.
                </p>
            </div>
        );
    }

    if (gate.state === 'expired') {
        return (
            <div className={styles.root} style={{ maxWidth: 560, textAlign: 'center', paddingTop: 48 }}>
                <h1 style={{ fontSize: 22, marginBottom: 12 }}>Link expired</h1>
                <p style={{ color: 'var(--text-muted)' }}>Ask the studio to send you a fresh contract link.</p>
            </div>
        );
    }

    if (gate.state === 'completed') {
        return (
            <div className={`${styles.root} ${styles.successRoot}`} style={{ maxWidth: 620 }}>
                {/* ── THANK YOU HERO ── */}
                <div className={styles.successHero}>
                    <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'center' }}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#FF6BA8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l2.09 6.26L20.18 9l-5 4.36L16.82 20 12 16.77 7.18 20l1.64-6.64-5-4.36 6.09-.74z"/></svg>
                    </div>
                    <h1 className={styles.successTitle}>Thank you for signing!</h1>
                    <p className={styles.successLead}>
                        A copy of your signed agreement has been sent to{' '}
                        <strong style={{ color: '#FF6BA8' }}>{gate.clientEmail || 'your email'}</strong>.
                    </p>
                    <p className={styles.successLead} style={{ marginTop: 8 }}>
                        Once we finalize your contract, we&apos;ll send you the fully executed copy for your records. You&apos;re all set!
                    </p>
                </div>

                {gate.referenceCode ? (
                    <div className={styles.successRef}>
                        <span className={styles.successRefLabel}>Contract No.</span>
                        <span className={styles.successRefCode}>{gate.referenceCode}</span>
                    </div>
                ) : null}

                {/* ── G&G MEMBERSHIP BANNER ── */}
                <div className={styles.memberCta}>
                    <div className={styles.memberCtaGlow} />
                    <div className={styles.memberCtaCard}>
                        <div className={styles.memberCtaBadge}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h12l4 6-10 13L2 9z"/><path d="M2 9h20"/><path d="M12 22L6 9"/><path d="M12 22l6-13"/><path d="m10 3 2 6"/><path d="m14 3-2 6"/></svg>
                            {' '}Exclusive Invitation
                        </div>
                        <h2 className={styles.memberCtaTitle}>
                            Join Glitz &amp; Glamour
                        </h2>
                        <p className={styles.memberCtaLead}>
                            As a special event client, you&apos;re invited to join our membership — completely free. 
                            Unlock exclusive perks every time you visit.
                        </p>
                        <ul className={styles.memberBenefits}>
                            <li>
                                <span className={styles.memberBenefitIcon}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8V21"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5C9 3 12 8 12 8"/><path d="M16.5 8a2.5 2.5 0 0 0 0-5C15 3 12 8 12 8"/></svg>
                                </span>
                                <span>
                                    <strong>Loyalty Rewards Card</strong>
                                    <span className={styles.memberBenefitHint}>
                                        Collect stamps with every visit. 10 stamps = free nail set.
                                    </span>
                                </span>
                            </li>
                            <li>
                                <span className={styles.memberBenefitIcon}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8"/><path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1"/><path d="M2 21h20"/><path d="M7 8v3"/><path d="M12 8v3"/><path d="M17 8v3"/><path d="M7 4h.01"/><path d="M12 4h.01"/><path d="M17 4h.01"/></svg>
                                </span>
                                <span>
                                    <strong>Free Birthday Spin</strong>
                                    <span className={styles.memberBenefitHint}>
                                        Spin the wheel on your birthday for prizes, discounts, and freebies.
                                    </span>
                                </span>
                            </li>
                            <li>
                                <span className={styles.memberBenefitIcon}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
                                </span>
                                <span>
                                    <strong>Exclusive Member Offers</strong>
                                    <span className={styles.memberBenefitHint}>
                                        Early access to promotions and insider-only discounts.
                                    </span>
                                </span>
                            </li>
                            <li>
                                <span className={styles.memberBenefitIcon}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
                                </span>
                                <span>
                                    <strong>Digital Wallet Pass</strong>
                                    <span className={styles.memberBenefitHint}>
                                        Add your loyalty card to Apple Wallet or Google Wallet — always with you.
                                    </span>
                                </span>
                            </li>
                        </ul>
                        <a className={styles.memberCtaBtn} href="/sign-in?tab=signup">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                            Create Your Free Account
                        </a>
                        <p className={styles.memberCtaFine}>
                            No payment required · Takes 30 seconds
                        </p>
                    </div>
                </div>

                <p className={styles.successContact}>
                    Questions? Contact us at{' '}
                    <a className={styles.successContactLink} href="mailto:info@glitzandglamours.com">
                        info@glitzandglamours.com
                    </a>
                </p>
            </div>
        );
    }

    if (gate.state === 'ready_special') {
        return (
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
        );
    }

    return (
        <div className="csShell" style={{ textAlign: 'center', paddingTop: 48, color: '#7a6070' }}>
            Unsupported contract type.
        </div>
    );
}
