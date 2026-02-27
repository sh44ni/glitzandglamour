'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
import Link from 'next/link';
import { CheckCircle, Sparkles } from 'lucide-react';

type Service = { id: string; name: string; category: string; priceLabel: string };

const TIMES = ['9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM'];

function BookingForm() {
    const { data: session } = useSession();
    const searchParams = useSearchParams();
    const router = useRouter();
    const preSelectedService = searchParams.get('service') || '';

    const [step, setStep] = useState(1);
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [phoneError, setPhoneError] = useState('');

    const [form, setForm] = useState({
        serviceId: preSelectedService,
        preferredDate: '',
        preferredTime: '',
        guestName: '',
        guestEmail: '',
        phone: '',   // unified field: used for both logged-in and guest
        notes: '',
    });

    useEffect(() => {
        fetch('/api/services').then(r => r.json()).then(d => setServices(d.services || []));
    }, []);

    // Pre-fill phone from profile if logged in
    useEffect(() => {
        if (!session) return;
        fetch('/api/profile').then(r => r.json()).then(d => {
            if (d.user?.phone) setForm(f => ({ ...f, phone: d.user.phone }));
        }).catch(() => { });
    }, [session]);

    const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
    const selectedService = services.find(s => s.id === form.serviceId);

    function validatePhone(phone: string) {
        const cleaned = phone.replace(/\s/g, '');
        if (!cleaned) return 'Phone number is required';
        if (cleaned.length < 7) return 'Enter a valid phone number';
        return '';
    }

    function goToReview() {
        const err = validatePhone(form.phone);
        if (err) { setPhoneError(err); return; }
        setPhoneError('');
        // Save phone to profile for logged-in users
        if (session) {
            fetch('/api/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: form.phone }),
            }).catch(() => { });
        }
        setStep(3);
    }

    async function submit() {
        setLoading(true);
        try {
            const payload: Record<string, string | undefined> = {
                serviceId: form.serviceId,
                preferredDate: form.preferredDate,
                preferredTime: form.preferredTime,
                notes: form.notes || undefined,
            };
            if (session) {
                // Logged-in: pass phone as guestPhone so it's stored on booking
                payload.guestPhone = form.phone;
            } else {
                payload.guestName = form.guestName;
                payload.guestEmail = form.guestEmail;
                payload.guestPhone = form.phone;
            }
            const res = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (res.ok) {
                setDone(true);
                if (!session) setTimeout(() => setShowPopup(true), 800);
            }
        } finally { setLoading(false); }
    }

    const inp = { fontFamily: 'Poppins, sans-serif' };

    if (done && !showPopup) return (
        <div style={{ textAlign: 'center', padding: '60px 20px', maxWidth: '480px', margin: '0 auto' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(0,212,120,0.12)', border: '1px solid rgba(0,212,120,0.3)', marginBottom: '20px' }}>
                <CheckCircle size={30} color="#00D478" strokeWidth={1.75} />
            </div>
            <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#fff', fontSize: '26px', marginBottom: '12px' }}>Booking Received!</h2>
            <p style={{ fontFamily: 'Poppins, sans-serif', color: '#eee', fontSize: '15px', marginBottom: '32px', lineHeight: 1.7 }}>
                I'll reach out to your phone soon to discuss your look and finalize everything. Talk soon — JoJany
            </p>
            <Link href="/" className="btn-primary">Back to Home</Link>
        </div>
    );

    return (
        <div style={{ maxWidth: '580px', margin: '0 auto', padding: '40px 20px 120px', position: 'relative', zIndex: 1 }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#fff', fontSize: 'clamp(22px, 5vw, 32px)', marginBottom: '8px' }}>Book Appointment</h1>
                <p style={{ fontFamily: 'Poppins, sans-serif', color: '#ccc', fontSize: '14px' }}>
                    I'll reach out to finalize everything before confirming.
                </p>
            </div>

            {/* Step indicator */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '28px', justifyContent: 'center' }}>
                {[1, 2, 3].map(s => (
                    <div key={s} style={{ height: '4px', flex: 1, maxWidth: '80px', borderRadius: '2px', background: s <= step ? '#FF2D78' : 'rgba(255,255,255,0.1)', transition: 'background 0.3s' }} />
                ))}
            </div>

            <div className="glass" style={{ padding: '28px 24px', borderRadius: '24px' }}>

                {/* ─── Step 1: Service + Time ─── */}
                {step === 1 && (
                    <div>
                        <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, color: '#fff', fontSize: '17px', marginBottom: '20px' }}>1. Choose Service & Time</h3>
                        <div style={{ marginBottom: '16px' }}>
                            <label className="label">Service</label>
                            <select className="input" value={form.serviceId} onChange={e => set('serviceId', e.target.value)}
                                style={{ ...inp, background: 'rgba(255,255,255,0.05)', color: form.serviceId ? '#fff' : '#bbb', cursor: 'pointer' }}>
                                <option value="" disabled>Select a service...</option>
                                {['nails', 'pedicures', 'haircolor', 'haircuts', 'waxing', 'facials'].map(cat => {
                                    const catSvcs = services.filter(s => s.category === cat);
                                    if (!catSvcs.length) return null;
                                    return (
                                        <optgroup key={cat} label={cat.charAt(0).toUpperCase() + cat.slice(1)}>
                                            {catSvcs.map(s => <option key={s.id} value={s.id}>{s.name} — {s.priceLabel}</option>)}
                                        </optgroup>
                                    );
                                })}
                            </select>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
                            <div style={{ flex: '1 1 200px' }}>
                                <label className="label">Preferred Date</label>
                                <input type="date" className="input" value={form.preferredDate}
                                    onChange={e => set('preferredDate', e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                    style={{ ...inp, colorScheme: 'dark' }} />
                            </div>
                            <div style={{ flex: '1 1 200px' }}>
                                <label className="label">Preferred Time</label>
                                <select className="input" value={form.preferredTime} onChange={e => set('preferredTime', e.target.value)}
                                    style={{ ...inp, background: 'rgba(255,255,255,0.05)', color: form.preferredTime ? '#fff' : '#bbb', cursor: 'pointer' }}>
                                    <option value="">Select time...</option>
                                    {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                        </div>
                        <button className="btn-primary" style={{ width: '100%', opacity: (form.serviceId && form.preferredDate && form.preferredTime) ? 1 : 0.45 }}
                            disabled={!form.serviceId || !form.preferredDate || !form.preferredTime}
                            onClick={() => setStep(2)}>
                            Continue →
                        </button>
                    </div>
                )}

                {/* ─── Step 2: Contact Details ─── */}
                {step === 2 && (
                    <div>
                        <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, color: '#fff', fontSize: '17px', marginBottom: '20px' }}>2. Your Details</h3>

                        {session ? (
                            /* Logged-in: show account info read-only, only ask for phone */
                            <>
                                <div style={{ background: 'rgba(255,45,120,0.06)', border: '1px solid rgba(255,45,120,0.15)', borderRadius: '14px', padding: '16px 18px', marginBottom: '20px' }}>
                                    <p style={{ fontFamily: 'Poppins, sans-serif', color: '#FF2D78', fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>
                                        Booking as {session.user?.name}
                                    </p>
                                    <p style={{ fontFamily: 'Poppins, sans-serif', color: '#ccc', fontSize: '13px' }}>{session.user?.email}</p>
                                </div>

                                {/* Phone — required even for logged-in users */}
                                <div style={{ marginBottom: '20px' }}>
                                    <label className="label">
                                        Phone Number <span style={{ color: '#FF2D78' }}>*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        className="input"
                                        placeholder="+1 (760) 000-0000"
                                        value={form.phone}
                                        onChange={e => { set('phone', e.target.value); setPhoneError(''); }}
                                        style={{ ...inp, borderColor: phoneError ? 'rgba(255,45,120,0.6)' : undefined }}
                                    />
                                    {phoneError && <p style={{ fontFamily: 'Poppins, sans-serif', color: '#FF2D78', fontSize: '12px', marginTop: '6px' }}>{phoneError}</p>}
                                    {!phoneError && !form.phone && (
                                        <p style={{ fontFamily: 'Poppins, sans-serif', color: '#bbb', fontSize: '12px', marginTop: '5px' }}>
                                            I'll text you to confirm your appointment
                                        </p>
                                    )}
                                    {form.phone && !phoneError && (
                                        <p style={{ fontFamily: 'Poppins, sans-serif', color: '#bbb', fontSize: '12px', marginTop: '5px' }}>
                                            This will be saved to your profile
                                        </p>
                                    )}
                                </div>
                            </>
                        ) : (
                            /* Guest: all fields required */
                            <>
                                <div style={{ marginBottom: '12px' }}>
                                    <label className="label">Full Name <span style={{ color: '#FF2D78' }}>*</span></label>
                                    <input type="text" className="input" placeholder="Your name" value={form.guestName}
                                        onChange={e => set('guestName', e.target.value)} style={inp} />
                                </div>
                                <div style={{ marginBottom: '12px' }}>
                                    <label className="label">Email <span style={{ color: '#FF2D78' }}>*</span></label>
                                    <input type="email" className="input" placeholder="your@email.com" value={form.guestEmail}
                                        onChange={e => set('guestEmail', e.target.value)} style={inp} />
                                </div>
                                <div style={{ marginBottom: '12px' }}>
                                    <label className="label">Phone Number <span style={{ color: '#FF2D78' }}>*</span></label>
                                    <input type="tel" className="input" placeholder="+1 (760) 000-0000" value={form.phone}
                                        onChange={e => { set('phone', e.target.value); setPhoneError(''); }}
                                        style={{ ...inp, borderColor: phoneError ? 'rgba(255,45,120,0.6)' : undefined }} />
                                    {phoneError && <p style={{ fontFamily: 'Poppins, sans-serif', color: '#FF2D78', fontSize: '12px', marginTop: '6px' }}>{phoneError}</p>}
                                    {!phoneError && (
                                        <p style={{ fontFamily: 'Poppins, sans-serif', color: '#bbb', fontSize: '12px', marginTop: '5px' }}>
                                            I'll text you to confirm your appointment
                                        </p>
                                    )}
                                </div>
                            </>
                        )}

                        <div style={{ marginBottom: '20px' }}>
                            <label className="label">Notes (Optional)</label>
                            <textarea className="input" placeholder="Tell me about your vision, reference photos, or any questions..." value={form.notes}
                                onChange={e => set('notes', e.target.value)} rows={3}
                                style={{ ...inp, resize: 'vertical', minHeight: '80px' }} />
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button className="btn-outline" style={{ flex: 1 }} onClick={() => setStep(1)}>← Back</button>
                            <button className="btn-primary" style={{ flex: 2 }}
                                disabled={!session && (!form.guestName || !form.guestEmail)}
                                onClick={goToReview}>
                                Review →
                            </button>
                        </div>
                    </div>
                )}

                {/* ─── Step 3: Confirm ─── */}
                {step === 3 && (
                    <div>
                        <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, color: '#fff', fontSize: '17px', marginBottom: '20px' }}>3. Confirm Booking</h3>
                        {[
                            { label: 'Service', val: selectedService?.name },
                            { label: 'Price', val: selectedService?.priceLabel + ' (final discussed with me)' },
                            { label: 'Date', val: form.preferredDate },
                            { label: 'Time', val: form.preferredTime },
                            { label: 'Name', val: session ? session.user?.name : form.guestName },
                            { label: 'Email', val: session ? session.user?.email : form.guestEmail },
                            { label: 'Phone', val: form.phone },
                            { label: 'Notes', val: form.notes || '—' },
                        ].map(({ label, val }) => val ? (
                            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <span style={{ fontFamily: 'Poppins, sans-serif', color: '#bbb', fontSize: '13px', flexShrink: 0 }}>{label}</span>
                                <span style={{ fontFamily: 'Poppins, sans-serif', color: label === 'Phone' ? '#FF2D78' : '#fff', fontSize: '13px', fontWeight: 500, textAlign: 'right' }}>{val as string}</span>
                            </div>
                        ) : null)}
                        <p style={{ fontFamily: 'Poppins, sans-serif', color: '#aaa', fontSize: '12px', marginTop: '16px', lineHeight: 1.6 }}>
                            By submitting, you agree to be contacted to finalize your appointment. Price is subject to change after consultation.
                        </p>
                        <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                            <button className="btn-outline" style={{ flex: 1 }} onClick={() => setStep(2)}>← Edit</button>
                            <button className="btn-primary btn-pulse" style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                onClick={submit} disabled={loading}>
                                {loading ? 'Sending...' : <><Sparkles size={15} /> Confirm Booking</>}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Sign-up popup after guest booking */}
            {showPopup && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div className="glass" style={{ maxWidth: '420px', width: '100%', padding: '36px 28px', textAlign: 'center', borderColor: 'rgba(255,45,120,0.35)' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(255,45,120,0.1)', border: '1px solid rgba(255,45,120,0.2)', marginBottom: '16px' }}>
                            <Sparkles size={22} color="#FF2D78" strokeWidth={1.75} />
                        </div>
                        <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#fff', fontSize: '20px', marginBottom: '8px' }}>Want to track your rewards?</h3>
                        <p style={{ fontFamily: 'Poppins, sans-serif', color: '#ddd', fontSize: '14px', marginBottom: '24px', lineHeight: 1.6 }}>
                            Create a free account and earn a stamp every visit. Your first stamp is waiting!
                        </p>
                        <button className="btn-primary" style={{ width: '100%', marginBottom: '10px', fontSize: '15px', padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                            onClick={() => signIn('google', { callbackUrl: '/card' })}>
                            <svg width="17" height="17" viewBox="0 0 18 18" fill="none"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" /><path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" /><path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" /><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" /></svg>
                            Continue with Google
                        </button>
                        <button onClick={() => { setShowPopup(false); router.push('/'); }}
                            style={{ fontFamily: 'Poppins, sans-serif', background: 'none', border: 'none', color: '#aaa', fontSize: '13px', cursor: 'pointer', padding: '8px' }}>
                            Maybe Later
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function BookPage() {
    return (
        <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ color: '#FF2D78', fontFamily: 'Poppins, sans-serif' }}>Loading...</span></div>}>
            <BookingForm />
        </Suspense>
    );
}
