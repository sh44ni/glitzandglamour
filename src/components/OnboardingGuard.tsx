'use client';

import { useSession } from 'next-auth/react';
import { useState, FormEvent } from 'react';
import { Sparkles, Calendar, Phone } from 'lucide-react';

export default function OnboardingGuard({ children }: { children: React.ReactNode }) {
    const { data: session, status, update } = useSession();

    // Only apply logic to authenticated customers
    const isCustomer = status === 'authenticated' && session?.user && (session.user as any).role === 'CUSTOMER';
    const user = session?.user as any;

    // We must ensure the user has BOTH a phone and a date of birth.
    // user.phone and user.dateOfBirth are fetched in the session callback (auth.ts).
    const needsOnboarding = isCustomer && (!user?.phone || !user?.dateOfBirth);

    const [phone, setPhone] = useState(user?.phone || '');
    const [dob, setDob] = useState(user?.dateOfBirth ? user.dateOfBirth.split('T')[0] : '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');

        if (!phone.trim()) {
            setError('Please enter your mobile number.');
            return;
        }
        if (!dob) {
            setError('Please enter your date of birth.');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, dateOfBirth: dob }),
            });

            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'Failed to update profile.');
                setLoading(false);
                return;
            }

            // Immediately force NextAuth to re-fetch the session with the new DB data
            await update();

        } catch (err) {
            setError('Connection error. Please try again.');
        }
        setLoading(false);
    };

    if (status === 'loading') {
        return <>{children}</>;
    }

    if (needsOnboarding) {
        return (
            <div style={{
                position: 'fixed',
                inset: 0,
                background: '#050204',
                zIndex: 999999, // Ensure it covers absolutely everything (including navs)
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px'
            }}>
                <div style={{
                    position: 'absolute',
                    top: '-20%', left: '-10%',
                    width: '140%', height: '140%',
                    background: 'radial-gradient(circle at 50% 0%, rgba(255,45,120,0.15) 0%, transparent 50%)',
                    pointerEvents: 'none',
                    zIndex: 0
                }} />

                <div style={{
                    background: 'rgba(25, 10, 18, 0.65)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 45, 120, 0.25)',
                    borderRadius: '24px',
                    padding: '36px 28px',
                    maxWidth: '440px',
                    width: '100%',
                    boxShadow: '0 30px 60px rgba(0,0,0,0.5), 0 0 40px rgba(255,45,120,0.1)',
                    position: 'relative',
                    zIndex: 1,
                    textAlign: 'center'
                }}>
                    <div style={{
                        width: '64px', height: '64px',
                        background: 'linear-gradient(135deg, rgba(255,45,120,0.2), rgba(255,107,168,0.1))',
                        border: '2px solid rgba(255,45,120,0.4)',
                        borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 20px',
                        boxShadow: '0 0 20px rgba(255,45,120,0.2)'
                    }}>
                        <Sparkles color="#FF2D78" size={32} />
                    </div>

                    <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '24px', color: '#fff', marginBottom: '8px' }}>
                        Welcome to Glitz & Glamour! 💅
                    </h1>
                    <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', color: '#bbb', lineHeight: 1.6, marginBottom: '28px' }}>
                        To complete your profile, we just need your <strong style={{ color: '#FF2D78' }}>mobile</strong> to notify you about appointments and your <strong style={{ color: '#FF2D78' }}>birthday</strong> for exclusive annual rewards! 🎂✨
                    </p>

                    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px', textAlign: 'left' }}>
                        <div>
                            <label style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', fontWeight: 600, color: '#ddd', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px', letterSpacing: '0.5px' }}>
                                <Phone size={14} color="#FF2D78" /> Mobile Number
                            </label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="(xxx) xxx-xxxx"
                                style={{
                                    width: '100%',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.12)',
                                    borderRadius: '12px',
                                    padding: '14px 16px',
                                    color: '#fff',
                                    fontSize: '15px',
                                    fontFamily: 'Poppins, sans-serif',
                                    outline: 'none',
                                    transition: 'border-color 0.2s'
                                }}
                                onFocus={(e) => e.target.style.borderColor = 'rgba(255,45,120,0.5)'}
                                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                            />
                        </div>

                        <div>
                            <label style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', fontWeight: 600, color: '#ddd', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px', letterSpacing: '0.5px' }}>
                                <Calendar size={14} color="#FF2D78" /> Date of Birth
                            </label>
                            <input
                                type="date"
                                value={dob}
                                onChange={(e) => setDob(e.target.value)}
                                style={{
                                    width: '100%',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.12)',
                                    borderRadius: '12px',
                                    padding: '14px 16px',
                                    color: '#fff',
                                    fontSize: '15px',
                                    fontFamily: 'Poppins, sans-serif',
                                    outline: 'none',
                                    transition: 'border-color 0.2s',
                                    colorScheme: 'dark'
                                }}
                                onFocus={(e) => e.target.style.borderColor = 'rgba(255,45,120,0.5)'}
                                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                            />
                        </div>

                        {error && (
                            <div style={{
                                background: 'rgba(255,0,0,0.1)',
                                border: '1px solid rgba(255,0,0,0.2)',
                                color: '#ff6b6b',
                                padding: '10px 14px',
                                borderRadius: '8px',
                                fontSize: '13px',
                                fontFamily: 'Poppins, sans-serif',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <span>⚠️</span> {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                background: 'linear-gradient(135deg, #FF2D78, #FF6BA8)',
                                border: 'none',
                                borderRadius: '50px',
                                padding: '16px',
                                color: '#fff',
                                fontSize: '16px',
                                fontWeight: 600,
                                fontFamily: 'Poppins, sans-serif',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                boxShadow: '0 4px 15px rgba(255,45,120,0.3)',
                                opacity: loading ? 0.8 : 1,
                                marginTop: '8px',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                            onMouseOver={(e) => {
                                if (!loading) {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(255,45,120,0.4)';
                                }
                            }}
                            onMouseOut={(e) => {
                                if (!loading) {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(255,45,120,0.3)';
                                }
                            }}
                        >
                            {loading ? 'Saving Profile...' : 'Complete Profile & Continue'}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
