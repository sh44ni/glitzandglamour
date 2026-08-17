'use client';

import { useEffect } from 'react';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('[GlobalError]', error);
    }, [error]);

    return (
        <html>
            <body style={{
                background: '#0A0A0A',
                color: '#fff',
                fontFamily: 'Poppins, sans-serif',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                flexDirection: 'column',
                gap: '16px',
                padding: '24px',
                textAlign: 'center',
            }}>
                <div style={{ fontSize: '48px' }}>✦</div>
                <h2 style={{ fontSize: '22px', fontWeight: 600, color: '#fff' }}>
                    Something went wrong
                </h2>
                <p style={{ color: '#aaa', fontSize: '14px', maxWidth: '360px' }}>
                    We hit an unexpected error. Try refreshing the page or come back shortly.
                </p>
                <button
                    onClick={reset}
                    style={{
                        marginTop: '8px',
                        background: '#FF2D78',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '12px 28px',
                        fontSize: '14px',
                        fontWeight: 600,
                        cursor: 'pointer',
                    }}
                >
                    Try again
                </button>
            </body>
        </html>
    );
}
