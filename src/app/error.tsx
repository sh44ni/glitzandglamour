'use client';

import { useEffect } from 'react';
import { Sparkles, RotateCcw } from 'lucide-react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('[AppError]', String(error?.message), '| digest:', String(error?.digest), '| path:', typeof window !== 'undefined' ? window.location.pathname : '', '| stack:', String(error?.stack).slice(0, 2000));
        try {
            const key = 'gg_err_autoretry_' + window.location.pathname;
            const prev = sessionStorage.getItem(key);
            const now = Date.now();
            if (!prev || now - Number(prev) > 8000) {
                sessionStorage.setItem(key, String(now));
                reset();
                setTimeout(() => {
                    window.location.reload();
                }, 120);
            }
        } catch {
            // ignore storage errors
        }
    }, [error, reset]);

    const handleRetry = () => {
        try {
            reset();
        } catch {
            // ignore
        }
        if (typeof window !== 'undefined') {
            window.location.reload();
        }
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            gap: '16px',
            padding: '24px',
            textAlign: 'center',
            fontFamily: 'var(--font-poppins, Poppins, sans-serif)',
        }}>
            <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'rgba(255, 45, 120, 0.14)',
                border: '1px solid rgba(255, 143, 188, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ff8ab8',
            }}>
                <Sparkles size={26} />
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#fff', margin: 0 }}>
                Something went wrong
            </h1>
            <p style={{ color: '#e2d6dc', fontSize: '14px', maxWidth: '360px', lineHeight: 1.6, margin: 0 }}>
                We ran into an unexpected issue. Please try again or contact us if this keeps happening.
            </p>
            {process.env.NODE_ENV !== 'production' && error?.message && (
                <pre style={{ color: '#ffb3cf', fontSize: '11px', maxWidth: '640px', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', background: 'rgba(255,45,120,0.08)', border: '1px solid rgba(255,130,180,0.3)', borderRadius: '10px', padding: '10px 12px', margin: 0, textAlign: 'left' }}>
                    {error.message}
                </pre>
            )}
            <button
                onClick={handleRetry}
                aria-label="Retry the failed action"
                style={{
                    marginTop: '8px',
                    background: 'linear-gradient(135deg, #FF2D78 0%, #d81b60 100%)',
                    color: '#fff',
                    border: '1px solid rgba(255, 255, 255, 0.22)',
                    borderRadius: '999px',
                    padding: '12px 28px',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 8px 24px rgba(255, 45, 120, 0.35)',
                }}
            >
                <RotateCcw size={15} />
                Try again
            </button>
        </div>
    );
}
