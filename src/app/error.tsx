'use client';

import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('[AppError]', error);
    }, [error]);

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
            <div style={{ fontSize: '42px' }}>✦</div>
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#fff' }}>
                Something went wrong
            </h2>
            <p style={{ color: '#aaa', fontSize: '14px', maxWidth: '340px' }}>
                We ran into an unexpected issue. Please try again or contact us if this keeps happening.
            </p>
            <button
                onClick={reset}
                aria-label="Retry the failed action"
                style={{
                    marginTop: '8px',
                    background: '#FF2D78',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '11px 26px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                }}
            >
                Try again
            </button>
        </div>
    );
}
