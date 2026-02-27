'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError('');

        const res = await signIn('admin-credentials', {
            password,
            redirect: false,
        });

        if (res?.ok) {
            router.push('/admin');
        } else {
            setError('Invalid email or password');
            setLoading(false);
        }
    }

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px', background: '#0A0A0A', position: 'relative', zIndex: 1,
        }}>
            <div className="glass" style={{ maxWidth: '400px', width: '100%', padding: '48px 32px' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{
                        fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: '22px',
                        background: 'linear-gradient(135deg, #FF2D78, #FF6BA8)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                        marginBottom: '4px',
                    }}>Glitz & Glamour</div>
                    <p style={{ fontFamily: 'Poppins, sans-serif', color: '#555', fontSize: '13px' }}>Admin Panel</p>
                </div>

                <form onSubmit={handleLogin}>
                    <div style={{ marginBottom: '24px' }}>
                        <label className="label">Secret Key</label>
                        <input type="password" className="input" value={password} onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••" required style={{ fontFamily: 'Poppins, sans-serif' }} />
                    </div>
                    {error && (
                        <p style={{ fontFamily: 'Poppins, sans-serif', color: '#FF2D78', fontSize: '13px', marginBottom: '16px', textAlign: 'center' }}>
                            {error}
                        </p>
                    )}
                    <button type="submit" className="btn-primary" style={{ width: '100%', fontSize: '15px', padding: '14px' }} disabled={loading}>
                        {loading ? 'Entering...' : 'Enter Console →'}
                    </button>
                </form>
            </div>
        </div>
    );
}
