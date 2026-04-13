'use client';

import { useEffect, useState } from 'react';
import type { AdminContractPayload } from '@/lib/contracts/adminContractPayload';
import ContractSignForm from './ContractSignForm';
import SpecialEventSignWizard from './SpecialEventSignWizard';
import styles from './contract-sign.module.css';

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
        const pdfPreviewHref = `/api/contracts/sign/${encodeURIComponent(gate.token)}/pdf?mode=inline`;
        const pdfDownloadHref = `/api/contracts/sign/${encodeURIComponent(gate.token)}/pdf?mode=download`;
        const isSpecialDone = gate.flow === 'special-events-v1';
        return (
            <div className={`${styles.root} ${styles.successRoot} ${isSpecialDone ? styles.successRootWide : ''}`}>
                <div className={styles.successHero}>
                    <h1 className={styles.successTitle}>{isSpecialDone ? "You're all set" : 'Agreement received'}</h1>
                    <p className={styles.successLead}>
                        {isSpecialDone
                            ? 'Your signed agreement is ready. Preview it below and download a copy for your records.'
                            : 'Your signed contract is on file.'}
                    </p>
                </div>
                {gate.pdfAvailable && isSpecialDone ? (
                    <>
                        <div className={styles.successPdfEmbedWrap}>
                            <iframe
                                className={styles.successPdfEmbed}
                                title="Signed agreement preview"
                                src={pdfPreviewHref}
                            />
                        </div>
                        <p className={styles.successPdfEmbedHint}>
                            PDF not showing?{' '}
                            <a className={styles.successPdfEmbedLink} href={pdfPreviewHref} target="_blank" rel="noopener noreferrer">
                                Open preview in a new tab
                            </a>
                            .
                        </p>
                        <div className={styles.successDownloadRow}>
                            <a className={styles.successBtnDownloadFull} href={pdfDownloadHref} download>
                                Download PDF
                            </a>
                        </div>
                    </>
                ) : null}
                {gate.pdfAvailable && !isSpecialDone ? (
                    <div className={styles.successPdfCard}>
                        <div className={styles.successPdfHead}>
                            <div className={styles.successPdfCopy}>
                                <span className={styles.successPdfLabel}>Your agreement PDF</span>
                                <span className={styles.successPdfHint}>Preview or download for your records.</span>
                            </div>
                        </div>
                        <div className={styles.successActions}>
                            <a className={styles.successBtnPreview} href={pdfPreviewHref} target="_blank" rel="noopener noreferrer">
                                Preview PDF
                            </a>
                            <a className={styles.successBtnDownload} href={pdfDownloadHref} download>
                                Download
                            </a>
                        </div>
                    </div>
                ) : null}
                {gate.referenceCode ? (
                    <div className={styles.successRef}>
                        <span className={styles.successRefLabel}>Contract No.</span>
                        <span className={styles.successRefCode}>{gate.referenceCode}</span>
                    </div>
                ) : null}
            </div>
        );
    }

    if (gate.state === 'ready_special') {
        return (
            <SpecialEventSignWizard
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
                    });
                }}
            />
        );
    }

    return <ContractSignForm token={token} />;
}
