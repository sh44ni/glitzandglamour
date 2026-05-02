'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, AlertCircle } from 'lucide-react';

const S = { fontFamily: 'Poppins, sans-serif' } as React.CSSProperties;

const HEALTH_QUESTIONS: { key: string; q: string }[] = [
    { key: 'pregnant',    q: 'Pregnant or breastfeeding?' },
    { key: 'accutane',    q: 'Used Accutane / isotretinoin in the past 12 months?' },
    { key: 'retinoids',   q: 'Using retinoids, Retin-A, or exfoliating acids (AHA/BHA)?' },
    { key: 'botox',       q: 'Had Botox, fillers, or injections in the past 2 weeks?' },
    { key: 'surgery',     q: 'Had surgery or medical procedures in the past 6 months?' },
    { key: 'infections',  q: 'Any active skin infections, open wounds, or cold sores?' },
    { key: 'autoimmune',  q: 'Any autoimmune conditions, diabetes, or circulatory issues?' },
    { key: 'hsv',         q: 'History of cold sores (HSV)?' },
    { key: 'pacemaker',   q: 'Pacemaker or implanted medical device?' },
];

function Section({ title }: { title: string }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '28px 0 14px' }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
            <span style={{ ...S, fontSize: 11, fontWeight: 700, color: '#FF2D78', textTransform: 'uppercase', letterSpacing: '1.2px', whiteSpace: 'nowrap' }}>{title}</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
        </div>
    );
}

function Row({ label, value, highlight }: { label: string; value: React.ReactNode; highlight?: boolean }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, padding: '11px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <span style={{ ...S, fontSize: 13, color: '#888', flex: 1 }}>{label}</span>
            <span style={{ ...S, fontSize: 13, fontWeight: 600, color: highlight ? '#FF2D78' : '#fff', textAlign: 'right', maxWidth: '60%' }}>{value}</span>
        </div>
    );
}

function YesNoBadge({ val }: { val: string | undefined }) {
    if (!val) return <span style={{ ...S, fontSize: 12, color: '#444' }}>—</span>;
    const isYes = val === 'yes';
    return (
        <span style={{ ...S, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 50, background: isYes ? 'rgba(255,80,80,0.15)' : 'rgba(0,212,120,0.1)', border: `1px solid ${isYes ? 'rgba(255,80,80,0.4)' : 'rgba(0,212,120,0.3)'}`, color: isYes ? '#ff8888' : '#00D478' }}>
            {isYes ? 'Yes' : 'No'}
        </span>
    );
}

export default function HealthRecordPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    const [updatedAt, setUpdatedAt] = useState<string | null>(null);

    useEffect(() => {
        if (status === 'unauthenticated') { router.push('/sign-in'); return; }
        if (status !== 'authenticated') return;
        fetch('/api/profile/health')
            .then(r => r.json())
            .then(d => {
                if (d.healthForm) {
                    setData(d.healthForm.data);
                    setUpdatedAt(d.healthForm.updatedAt);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [status, router]);

    if (loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="skeleton" style={{ width: 340, height: 200, borderRadius: 24 }} />
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', padding: '40px 20px 80px', maxWidth: 600, margin: '0 auto' }}>
            {/* Back */}
            <Link href="/profile" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#888', textDecoration: 'none', fontSize: 13, fontWeight: 600, marginBottom: 24, ...S }}>
                <ArrowLeft size={14} /> Back to Profile
            </Link>

            {/* Header */}
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ ...S, color: '#fff', fontSize: 24, fontWeight: 800, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <ShieldCheck size={22} color="#00D478" /> Health Record
                </h1>
                <p style={{ ...S, color: '#666', fontSize: 13, lineHeight: 1.5 }}>
                    Your health information is collected at booking and kept strictly confidential. It is only used by our studio to ensure your safety during services.
                </p>
                {updatedAt && (
                    <p style={{ ...S, color: '#444', fontSize: 11, marginTop: 8 }}>
                        Last updated: {new Date(updatedAt).toLocaleString()}
                    </p>
                )}
            </div>

            {!data ? (
                /* No record yet */
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '40px 24px', textAlign: 'center' }}>
                    <AlertCircle size={36} color="#555" style={{ marginBottom: 12 }} />
                    <p style={{ ...S, color: '#666', fontSize: 14, fontWeight: 600, marginBottom: 6 }}>No health record on file</p>
                    <p style={{ ...S, color: '#444', fontSize: 13 }}>
                        Your health intake form will be collected the next time you book a facial, lash, or waxing service.
                    </p>
                </div>
            ) : (
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '20px 24px' }}>

                    {/* ── Skin type ── */}
                    <Section title="Skin & Conditions" />
                    <Row
                        label="Skin type / concerns"
                        value={data.skinTypes?.length ? data.skinTypes.join(', ') : '—'}
                    />

                    {/* ── Health questions ── */}
                    <Section title="Health Questions" />
                    {HEALTH_QUESTIONS.map(({ key, q }) => (
                        <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                            <span style={{ ...S, fontSize: 13, color: '#aaa', flex: 1, lineHeight: 1.4 }}>{q}</span>
                            <YesNoBadge val={data.healthQ?.[key]} />
                        </div>
                    ))}

                    {/* ── Medications ── */}
                    <Section title="Medications" />
                    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '12px 14px' }}>
                        <p style={{ ...S, fontSize: 13, color: data.medications ? '#ddd' : '#444', lineHeight: 1.5 }}>
                            {data.medications || 'None listed'}
                        </p>
                    </div>

                    {/* ── Allergies ── */}
                    <Section title="Allergies & Reactions" />
                    <Row
                        label="Known reactions to"
                        value={data.allergies?.length ? data.allergies.join(', ') : 'None known'}
                        highlight={data.allergies?.length > 0}
                    />
                    {data.allergyNotes && (
                        <div style={{ background: 'rgba(255,45,120,0.05)', border: '1px solid rgba(255,45,120,0.15)', borderRadius: 12, padding: '12px 14px', marginTop: 8 }}>
                            <p style={{ ...S, fontSize: 11, color: '#FF2D78', fontWeight: 700, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Reaction Notes</p>
                            <p style={{ ...S, fontSize: 13, color: '#ddd', lineHeight: 1.5 }}>{data.allergyNotes}</p>
                        </div>
                    )}

                    {/* ── Emergency contact ── */}
                    <Section title="Emergency Contact" />
                    {data.emergencyName ? (
                        <>
                            <Row label="Name" value={data.emergencyName} />
                            <Row label="Phone" value={data.emergencyPhone || '—'} />
                            <Row label="Relationship" value={data.emergencyRelation || '—'} />
                        </>
                    ) : (
                        <p style={{ ...S, fontSize: 13, color: '#444' }}>No emergency contact on file.</p>
                    )}

                    {/* Footer note */}
                    <div style={{ marginTop: 28, padding: '12px 14px', background: 'rgba(0,212,120,0.05)', border: '1px solid rgba(0,212,120,0.12)', borderRadius: 12 }}>
                        <p style={{ ...S, fontSize: 12, color: '#00D478', fontWeight: 600, marginBottom: 4 }}>🔒 Confidential</p>
                        <p style={{ ...S, fontSize: 11, color: '#555', lineHeight: 1.5 }}>
                            This information is securely stored and only accessed by our licensed studio staff. To update your health record, please contact the studio directly.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
