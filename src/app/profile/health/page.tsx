'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Check, AlertCircle } from 'lucide-react';

function Chip({ label, selected, onToggle }: { label: string; selected: boolean; onToggle: () => void }) {
    return (
        <button
            type="button"
            onClick={onToggle}
            style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '7px 14px', borderRadius: '50px',
                background: selected ? 'rgba(255,45,120,0.12)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${selected ? 'rgba(255,45,120,0.45)' : 'rgba(255,255,255,0.1)'}`,
                cursor: 'pointer', transition: 'all 0.15s',
                fontFamily: 'Poppins, sans-serif', fontSize: '13px',
                color: selected ? '#FF2D78' : '#aaa', fontWeight: selected ? 600 : 400,
            }}
        >
            <span style={{
                width: '7px', height: '7px', borderRadius: '50%', flexShrink: 0,
                background: selected ? '#FF2D78' : 'rgba(255,255,255,0.2)',
                transition: 'background 0.15s',
            }} />
            {label}
        </button>
    );
}

function YesNo({ question, value, onChange }: { question: string; value: 'yes' | 'no' | null; onChange: (v: 'yes' | 'no') => void }) {
    return (
        <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
            padding: '12px 16px', borderRadius: '12px',
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
            marginBottom: '8px',
        }}>
            <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', color: '#ddd', lineHeight: 1.4, flex: 1 }}>{question}</span>
            <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                {(['yes', 'no'] as const).map(opt => (
                    <button
                        key={opt}
                        type="button"
                        onClick={() => onChange(opt)}
                        style={{
                            padding: '6px 14px', borderRadius: '50px',
                            border: `1px solid ${value === opt ? (opt === 'yes' ? 'rgba(255,100,100,0.6)' : 'rgba(255,45,120,0.5)') : 'rgba(255,255,255,0.12)'}`,
                            background: value === opt ? (opt === 'yes' ? 'rgba(255,80,80,0.18)' : 'rgba(255,45,120,0.18)') : 'rgba(255,255,255,0.04)',
                            color: value === opt ? (opt === 'yes' ? '#ff8888' : '#FF2D78') : '#666',
                            fontFamily: 'Poppins, sans-serif', fontSize: '12px', fontWeight: 600,
                            cursor: 'pointer', transition: 'all 0.15s', textTransform: 'capitalize',
                        }}
                    >{opt}</button>
                ))}
            </div>
        </div>
    );
}

export default function HealthFormPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const [form, setForm] = useState({
        skinTypes: [] as string[],
        healthQ: {} as Record<string, 'yes' | 'no'>,
        medications: '',
        allergies: [] as string[],
        allergyNotes: '',
        emergencyName: '',
        emergencyPhone: '',
        emergencyRelation: '',
    });

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/sign-in');
        } else if (status === 'authenticated') {
            fetch('/api/profile/health')
                .then(r => r.json())
                .then(d => {
                    if (d.healthForm && d.healthForm.data) {
                        setForm(prev => ({ ...prev, ...d.healthForm.data }));
                    }
                    setLoading(false);
                })
                .catch(() => setLoading(false));
        }
    }, [status, router]);

    const set = (k: keyof typeof form, v: unknown) => setForm(f => ({ ...f, [k]: v }));
    const inp = {
        width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '10px', padding: '12px 14px', fontFamily: 'Poppins, sans-serif', fontSize: '14px',
        color: '#fff', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box' as const
    };

    async function handleSave() {
        setSaving(true);
        setMessage(null);
        try {
            const res = await fetch('/api/profile/health', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data: form })
            });
            const data = await res.json();
            if (data.success) {
                setMessage({ type: 'success', text: 'Health form updated successfully!' });
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                setMessage({ type: 'error', text: data.error || 'Failed to save form.' });
            }
        } catch (e) {
            setMessage({ type: 'error', text: 'An unexpected error occurred.' });
        } finally {
            setSaving(false);
        }
    }

    if (loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="skeleton" style={{ width: '340px', height: '200px', borderRadius: '24px' }} />
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', padding: '40px 20px', maxWidth: '600px', margin: '0 auto', fontFamily: 'Poppins, sans-serif' }}>
            <div style={{ marginBottom: '24px' }}>
                <Link href="/profile" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#888', textDecoration: 'none', fontSize: '13px', fontWeight: 600, marginBottom: '16px' }}>
                    <ArrowLeft size={14} /> Back to Profile
                </Link>
                <h1 style={{ color: '#fff', fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>Health Profile</h1>
                <p style={{ color: '#aaa', fontSize: '13px', lineHeight: 1.5 }}>
                    Your health profile is used to ensure your safety during services like facials, lashes, and waxing. It is kept strictly confidential.
                </p>
            </div>

            {message && (
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '12px 16px', borderRadius: '12px', marginBottom: '20px',
                    background: message.type === 'success' ? 'rgba(0,212,120,0.1)' : 'rgba(255,45,60,0.1)',
                    border: `1px solid ${message.type === 'success' ? 'rgba(0,212,120,0.3)' : 'rgba(255,45,60,0.3)'}`,
                    color: message.type === 'success' ? '#00D478' : '#ff6b6b', fontSize: '13px', fontWeight: 600
                }}>
                    {message.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
                    {message.text}
                </div>
            )}

            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '24px' }}>
                
                {/* ── Skin & Conditions ── */}
                <h2 style={{ fontSize: '16px', color: '#FF2D78', fontWeight: 700, marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>Skin & Health</h2>
                <div style={{ marginBottom: '24px' }}>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: '#aaa', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Skin type / concerns</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {['Sensitive', 'Oily', 'Dry', 'Acne-prone', 'Rosacea', 'Eczema / Psoriasis', 'Keloid scarring', 'None'].map(opt => (
                            <Chip key={opt} label={opt} selected={form.skinTypes.includes(opt)}
                                onToggle={() => {
                                    const cur = form.skinTypes;
                                    if (opt === 'None') { set('skinTypes', cur.includes('None') ? [] : ['None']); return; }
                                    const next = cur.includes(opt) ? cur.filter(x => x !== opt) : [...cur.filter(x => x !== 'None'), opt];
                                    set('skinTypes', next);
                                }}
                            />
                        ))}
                    </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                    {[
                        { key: 'pregnant', q: 'Pregnant or breastfeeding?' },
                        { key: 'accutane', q: 'Used Accutane / isotretinoin in the past 12 months?' },
                        { key: 'retinoids', q: 'Using retinoids, Retin-A, or exfoliating acids (AHA/BHA)?' },
                        { key: 'botox', q: 'Had Botox, fillers, or injections in the past 2 weeks?' },
                        { key: 'surgery', q: 'Had surgery or medical procedures in the past 6 months?' },
                        { key: 'infections', q: 'Any active skin infections, open wounds, or cold sores?' },
                        { key: 'autoimmune', q: 'Any autoimmune conditions, diabetes, or circulatory issues?' },
                        { key: 'hsv', q: 'History of cold sores (HSV)?' },
                        { key: 'pacemaker', q: 'Pacemaker or implanted medical device?' },
                    ].map(({ key, q }) => (
                        <YesNo key={key} question={q}
                            value={(form.healthQ[key] as 'yes' | 'no' | null) ?? null}
                            onChange={v => set('healthQ', { ...form.healthQ, [key]: v })}
                        />
                    ))}
                </div>

                <div style={{ marginBottom: '32px' }}>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: '#aaa', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Current medications <span style={{ textTransform: 'none', color: '#666', fontWeight: 400, fontSize: '12px', letterSpacing: 0 }}>(optional)</span>
                    </p>
                    <textarea className="input" placeholder="Any topical or oral medications, including supplements…" value={form.medications} onChange={e => set('medications', e.target.value)} rows={3} style={{ ...inp, resize: 'vertical', minHeight: '80px' }} />
                </div>

                <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '32px -24px' }} />

                {/* ── Allergies ── */}
                <h2 style={{ fontSize: '16px', color: '#FF2D78', fontWeight: 700, marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>Allergies & Reactions</h2>
                <div style={{ marginBottom: '24px' }}>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: '#aaa', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Ever reacted to any of these?</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {['Latex / gloves', 'Acrylic / gel', 'Lash adhesive', 'Wax', 'Hair dye / bleach', 'Skincare products', 'Fragrance', 'Numbing creams', 'None known'].map(opt => (
                            <Chip key={opt} label={opt} selected={form.allergies.includes(opt)}
                                onToggle={() => {
                                    const cur = form.allergies;
                                    if (opt === 'None known') { set('allergies', cur.includes('None known') ? [] : ['None known']); return; }
                                    const next = cur.includes(opt) ? cur.filter(x => x !== opt) : [...cur.filter(x => x !== 'None known'), opt];
                                    set('allergies', next);
                                }}
                            />
                        ))}
                    </div>
                </div>

                <div style={{ marginBottom: '32px' }}>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: '#aaa', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Describe any reactions or other allergies <span style={{ textTransform: 'none', color: '#666', fontWeight: 400, fontSize: '12px', letterSpacing: 0 }}>(optional)</span>
                    </p>
                    <textarea className="input" placeholder="What happened? What caused it?" value={form.allergyNotes} onChange={e => set('allergyNotes', e.target.value)} rows={3} style={{ ...inp, resize: 'vertical', minHeight: '80px' }} />
                </div>

                <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '32px -24px' }} />

                {/* ── Emergency Contact ── */}
                <h2 style={{ fontSize: '16px', color: '#FF2D78', fontWeight: 700, marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>Emergency Contact</h2>
                <div style={{ display: 'grid', gap: '16px', marginBottom: '32px' }}>
                    <div>
                        <label className="label" style={{ display: 'block', fontSize: '13px', color: '#aaa', marginBottom: '6px' }}>Name</label>
                        <input type="text" className="input" placeholder="Emergency contact name" value={form.emergencyName} onChange={e => set('emergencyName', e.target.value)} style={inp} />
                    </div>
                    <div>
                        <label className="label" style={{ display: 'block', fontSize: '13px', color: '#aaa', marginBottom: '6px' }}>Phone Number</label>
                        <input type="tel" className="input" placeholder="Emergency contact phone" value={form.emergencyPhone} onChange={e => set('emergencyPhone', e.target.value)} style={inp} />
                    </div>
                    <div>
                        <label className="label" style={{ display: 'block', fontSize: '13px', color: '#aaa', marginBottom: '6px' }}>Relationship</label>
                        <input type="text" className="input" placeholder="e.g. Partner, Parent, Friend" value={form.emergencyRelation} onChange={e => set('emergencyRelation', e.target.value)} style={inp} />
                    </div>
                </div>

                <button
                    className="btn-primary"
                    disabled={saving}
                    onClick={handleSave}
                    style={{ width: '100%', padding: '16px', fontSize: '15px', fontWeight: 700 }}
                >
                    {saving ? 'Saving...' : 'Save Health Profile'}
                </button>
            </div>
        </div>
    );
}
