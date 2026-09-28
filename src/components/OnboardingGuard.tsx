'use client';

import { useSession, signOut } from 'next-auth/react';
import { useState, FormEvent } from 'react';
import { Sparkles, Calendar, Phone } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '12px',
    padding: '13px 16px',
    color: '#fff',
    fontSize: '15px',
    fontFamily: 'Poppins, sans-serif',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
    fontFamily: 'Poppins, sans-serif',
    fontSize: '11px',
    fontWeight: 600,
    color: '#aaa',
    marginBottom: '6px',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    letterSpacing: '0.6px',
    textTransform: 'uppercase',
};

export default function OnboardingGuard({ children }: { children: React.ReactNode }) {
    const { t } = useTranslation();
    const { data: session, status, update } = useSession();

    const isCustomer = status === 'authenticated' && session?.user && (session.user as any).role === 'CUSTOMER';
    const user = session?.user as any;
    const needsOnboarding = isCustomer && (!user?.phone || !user?.dateOfBirth);

    const [phone, setPhone] = useState(user?.phone || '');
    const [dob, setDob] = useState(user?.dateOfBirth ? user.dateOfBirth.split('T')[0] : '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');

        if (!phone.trim()) { setError(t('onboarding.errorPhone')); return; }
        if (!dob)           { setError(t('onboarding.errorDob'));   return; }

        setLoading(true);
        try {
            const res = await fetch('/api/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, dateOfBirth: dob }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error || t('onboarding.errorFailed')); setLoading(false); return; }
            await update();
        } catch {
            setError(t('onboarding.errorConnection'));
        }
        setLoading(false);
    };

    const handleCancel = async () => {
        if (!confirm(t('onboarding.confirmCancel'))) return;
        setLoading(true);
        try {
            const res = await fetch('/api/profile', { method: 'DELETE' });
            if (res.ok) { await signOut({ callbackUrl: '/' }); }
            else { setError(t('onboarding.errorDeleteFailed')); setLoading(false); }
        } catch {
            setError(t('onboarding.errorConnection'));
            setLoading(false);
        }
    };

    if (status === 'loading') return <>{children}</>;

    if (needsOnboarding) {
        return (
            <div style={{
                position: 'fixed', inset: 0,
                background: '#060105',
                zIndex: 999999,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '20px',
                overflowY: 'auto',
            }}>
                {/* Ambient glow */}
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(255,45,120,0.18) 0%, transparent 60%)',
                    pointerEvents: 'none',
                }} />

                <div style={{
                    background: 'rgba(22, 8, 16, 0.80)',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                    border: '1px solid rgba(255, 45, 120, 0.22)',
                    borderRadius: '28px',
                    padding: '40px 28px 32px',
                    maxWidth: '420px',
                    width: '100%',
                    boxShadow: '0 32px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,45,120,0.06)',
                    position: 'relative',
                    zIndex: 1,
                    textAlign: 'center',
                }}>
                    {/* Icon badge */}
                    <div style={{
                        width: '60px', height: '60px',
                        background: 'linear-gradient(135deg, rgba(255,45,120,0.22), rgba(255,107,168,0.10))',
                        border: '1.5px solid rgba(255,45,120,0.45)',
                        borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 20px',
                        boxShadow: '0 0 24px rgba(255,45,120,0.25)',
                    }}>
                        <Sparkles color="#FF2D78" size={28} />
                    </div>

                    {/* Heading */}
                    <h1 style={{
                        fontFamily: 'Poppins, sans-serif',
                        fontWeight: 700,
                        fontSize: '22px',
                        color: '#fff',
                        marginBottom: '10px',
                        lineHeight: 1.3,
                    }}>
                        {t('onboarding.welcome')}
                    </h1>

                    {/* Subtext — two clean lines, no interpolation tricks */}
                    <p style={{
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '13px',
                        color: '#999',
                        lineHeight: 1.65,
                        marginBottom: '28px',
                        padding: '0 4px',
                    }}>
                        {t('onboarding.subtextLine1')}
                        <br />
                        {t('onboarding.subtextLine2')}
                    </p>

                    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '14px', textAlign: 'left' }}>

                        {/* Phone */}
                        <div>
                            <label style={labelStyle}>
                                <Phone size={12} color="#FF2D78" />
                                {t('onboarding.mobileField')}
                            </label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder={t('onboarding.phonePlaceholder')}
                                style={inputStyle}
                                onFocus={(e) => e.target.style.borderColor = 'rgba(255,45,120,0.55)'}
                                onBlur={(e)  => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                            />
                        </div>

                        {/* Date of Birth */}
                        <div>
                            <label style={labelStyle}>
                                <Calendar size={12} color="#FF2D78" />
                                {t('onboarding.dobField')}
                            </label>
                            <input
                                type="date"
                                value={dob}
                                onChange={(e) => setDob(e.target.value)}
                                max={new Date().toISOString().split('T')[0]}
                                style={{
                                    ...inputStyle,
                                    colorScheme: 'dark',
                                    // Force date text to be white on iOS Safari
                                    WebkitTextFillColor: dob ? '#fff' : '#666',
                                }}
                                onFocus={(e) => e.target.style.borderColor = 'rgba(255,45,120,0.55)'}
                                onBlur={(e)  => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                            />
                            {!dob && (
                                <p style={{
                                    fontFamily: 'Poppins, sans-serif',
                                    fontSize: '11px',
                                    color: '#666',
                                    marginTop: '5px',
                                    paddingLeft: '2px',
                                }}>
                                    Used for birthday rewards only 🎂
                                </p>
                            )}
                        </div>

                        {/* Error */}
                        {error && (
                            <div style={{
                                background: 'rgba(255,0,0,0.08)',
                                border: '1px solid rgba(255,80,80,0.25)',
                                color: '#ff7070',
                                padding: '10px 14px',
                                borderRadius: '10px',
                                fontSize: '13px',
                                fontFamily: 'Poppins, sans-serif',
                                display: 'flex', alignItems: 'center', gap: '8px',
                            }}>
                                <span>⚠️</span> {error}
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                background: loading
                                    ? 'rgba(255,45,120,0.5)'
                                    : 'linear-gradient(135deg, #FF2D78, #FF6BA8)',
                                border: 'none',
                                borderRadius: '50px',
                                padding: '15px',
                                color: '#fff',
                                fontSize: '15px',
                                fontWeight: 600,
                                fontFamily: 'Poppins, sans-serif',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                transition: 'transform 0.2s, box-shadow 0.2s, opacity 0.2s',
                                boxShadow: '0 4px 18px rgba(255,45,120,0.35)',
                                marginTop: '6px',
                                letterSpacing: '0.3px',
                            }}
                            onMouseOver={(e) => {
                                if (!loading) {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(255,45,120,0.45)';
                                }
                            }}
                            onMouseOut={(e) => {
                                if (!loading) {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 4px 18px rgba(255,45,120,0.35)';
                                }
                            }}
                        >
                            {loading ? t('onboarding.saving') : t('onboarding.submit')}
                        </button>

                        {/* Cancel */}
                        <button
                            type="button"
                            onClick={handleCancel}
                            disabled={loading}
                            style={{
                                width: '100%',
                                background: 'transparent',
                                border: '1px solid rgba(255,255,255,0.12)',
                                borderRadius: '50px',
                                padding: '13px',
                                color: '#666',
                                fontSize: '13px',
                                fontWeight: 500,
                                fontFamily: 'Poppins, sans-serif',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s',
                            }}
                            onMouseOver={(e) => {
                                if (!loading) {
                                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.22)';
                                    e.currentTarget.style.color = '#aaa';
                                }
                            }}
                            onMouseOut={(e) => {
                                if (!loading) {
                                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
                                    e.currentTarget.style.color = '#666';
                                }
                            }}
                        >
                            {t('onboarding.cancel')}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
