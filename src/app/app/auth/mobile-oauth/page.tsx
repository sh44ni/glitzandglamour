import { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Sparkles, Smartphone, ShieldCheck, Lock, ArrowLeft } from 'lucide-react';
import MobileOAuthRelay from './relay';

export const metadata: Metadata = {
    title: 'Mobile App OAuth Sign-In Relay | Glitz & Glamour Studio',
    description:
        'Secure mobile OAuth authentication handoff for the Glitz & Glamour Studio VIP member app in San Marcos, CA.',
    alternates: { canonical: 'https://www.glitzandglamours.com/app/auth/mobile-oauth' },
    robots: { index: true, follow: true },
    openGraph: {
        title: 'Mobile App OAuth Sign-In Relay | Glitz & Glamour Studio',
        description:
            'Secure mobile OAuth authentication handoff for the Glitz & Glamour Studio VIP member app.',
        type: 'website',
        url: 'https://www.glitzandglamours.com/app/auth/mobile-oauth',
    },
};

type Props = {
    searchParams: Promise<{ provider?: string }>;
};

export default async function MobileOAuthPage({ searchParams }: Props) {
    const params = await searchParams;
    const provider = params.provider ?? 'google';
    const label = provider === 'apple' ? 'Apple' : 'Google';

    return (
        <section
            style={{
                minHeight: 'calc(100dvh - 80px)',
                background:
                    'radial-gradient(circle at 50% 0%, rgba(255, 45, 120, 0.14) 0%, rgba(32, 15, 26, 0.4) 42%, #0a0609 100%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 'clamp(36px, 7vw, 72px) 16px 80px',
                fontFamily: 'Poppins, sans-serif',
                boxSizing: 'border-box',
                width: '100%',
                overflowX: 'hidden',
            }}
        >
            <style>{`
                @keyframes moSpin { to { transform: rotate(360deg); } }
                .mobile-oauth-relay-mount > div { display: none !important; }
            `}</style>

            <header
                style={{
                    maxWidth: '540px',
                    width: '100%',
                    textAlign: 'center',
                    marginBottom: '28px',
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
                    Mobile App Authentication
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
                    Connecting to {label}{' '}
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
                        color: '#e2d6dc',
                        fontSize: '14px',
                        lineHeight: 1.65,
                        margin: '0 auto',
                        maxWidth: '44ch',
                    }}
                >
                    Establishing a secure encrypted OAuth handoff between {label} and the Glitz &amp; Glamour Studio
                    VIP Member App.
                </p>
            </header>

            <div
                style={{
                    position: 'relative',
                    overflow: 'hidden',
                    width: '100%',
                    maxWidth: '440px',
                    background: 'linear-gradient(155deg, rgba(32, 15, 26, 0.92), rgba(14, 7, 12, 0.96))',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '24px',
                    padding: 'clamp(28px, 6vw, 40px) clamp(20px, 5vw, 32px)',
                    textAlign: 'center',
                    boxShadow: '0 24px 60px rgba(0, 0, 0, 0.5)',
                    boxSizing: 'border-box',
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
                        position: 'relative',
                        width: '60px',
                        height: '60px',
                        margin: '0 auto 18px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <div
                        style={{
                            position: 'absolute',
                            inset: 0,
                            borderRadius: '50%',
                            border: '3px solid rgba(255, 138, 184, 0.22)',
                            borderTopColor: '#ff8ab8',
                            animation: 'moSpin 0.9s linear infinite',
                        }}
                    />
                    <Smartphone size={24} color="#E2C286" />
                </div>

                <h2
                    style={{
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '20px',
                        fontWeight: 700,
                        color: '#ffffff',
                        margin: '0 0 8px',
                    }}
                >
                    Secure Sign-In Relay
                </h2>

                <p
                    style={{
                        color: '#e2d6dc',
                        fontSize: '14px',
                        lineHeight: 1.65,
                        margin: '0 0 22px',
                    }}
                >
                    Please wait a moment while we redirect you to {label} to verify your identity…
                </p>

                <div
                    style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '14px',
                        padding: '12px 14px',
                        marginBottom: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        color: '#dfd2d9',
                        fontSize: '12.5px',
                    }}
                >
                    <Lock size={14} color="#ff8ab8" style={{ flexShrink: 0 }} />
                    <span>CSRF-Protected NextAuth Handoff</span>
                </div>

                <Link
                    href="/sign-in"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        color: '#dfd2d9',
                        textDecoration: 'none',
                        fontSize: '13px',
                        fontWeight: 600,
                    }}
                >
                    <ArrowLeft size={14} /> Return to Web Sign-In
                </Link>

                {/* Functional OAuth Relay (CSRF fetch + auto-POST form + deep-link error handler) */}
                <div className="mobile-oauth-relay-mount" aria-hidden="true">
                    <Suspense>
                        <MobileOAuthRelay provider={provider} />
                    </Suspense>
                </div>
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
                    textAlign: 'center',
                }}
            >
                <ShieldCheck size={15} color="#E2C286" style={{ flexShrink: 0 }} />
                <span>Glitz &amp; Glamour Studio · San Marcos, CA</span>
            </div>
        </section>
    );
}
