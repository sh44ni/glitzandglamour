import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Page Not Found | Glitz & Glamour Studio',
    description: 'The page you are looking for does not exist.',
};

export default function NotFound() {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '70vh',
            gap: '16px',
            padding: '24px',
            textAlign: 'center',
            fontFamily: 'var(--font-poppins, Poppins, sans-serif)',
        }}>
            <div style={{ fontSize: '64px', fontWeight: 800, color: '#FF2D78', lineHeight: 1 }}>404</div>
            <h1 style={{ fontSize: '22px', fontWeight: 600, color: '#fff', margin: 0 }}>
                Page not found
            </h1>
            <p style={{ color: '#aaa', fontSize: '14px', maxWidth: '360px', margin: 0 }}>
                The page you&apos;re looking for doesn&apos;t exist or has been moved.
            </p>
            <div style={{ display: 'flex', gap: '12px', marginTop: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <Link
                    href="/"
                    style={{
                        background: '#FF2D78',
                        color: '#fff',
                        borderRadius: '12px',
                        padding: '11px 26px',
                        fontSize: '14px',
                        fontWeight: 600,
                        textDecoration: 'none',
                    }}
                >
                    Go home
                </Link>
                <Link
                    href="/book"
                    style={{
                        background: 'rgba(255,255,255,0.07)',
                        color: '#fff',
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: '12px',
                        padding: '11px 26px',
                        fontSize: '14px',
                        fontWeight: 600,
                        textDecoration: 'none',
                    }}
                >
                    Book appointment
                </Link>
            </div>
        </div>
    );
}
