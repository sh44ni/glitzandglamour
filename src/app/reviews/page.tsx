'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, MessageSquarePlus, ExternalLink, CheckCircle, Lock, AlertCircle } from 'lucide-react';

const STATIC_REVIEWS = [
    { id: 's1', name: 'Guadalupe Lopez', text: 'Amazing nails experience! JoJany is incredibly talented and made sure I was happy with every detail. My nails came out perfect. Highly recommend!', rating: 5, date: 'Nov 2025' },
    { id: 's2', name: 'Yesenia Sanchez', text: 'So kind and welcoming! Her hair work is absolutely stunning. She really listens to what you want and delivers beyond expectations. Love this studio!', rating: 5, date: 'Nov 2025' },
    { id: 's3', name: 'Kaylee', text: "She gave me the most beautiful Barbie beach girl look! Exactly what I envisioned. JoJany is a true artist. I won't go anywhere else!", rating: 5, date: 'Oct 2025' },
    { id: 's4', name: 'Janet D', text: 'Total vibe, she never disappoints! Every single visit is better than the last. The studio atmosphere is amazing and her work is always flawless.', rating: 5, date: 'Oct 2025' },
    { id: 's5', name: 'Gloria Jimenez', text: 'She goes above and beyond every time! JoJany truly cares about her clients and it shows in her work. My nails have never looked this good!', rating: 5, date: 'Oct 2025' },
    { id: 's6', name: 'Daniela Castillo', text: '¡Excelente trabajo y muy carismática! Hace que te sientas como en casa. Su trabajo es de primera calidad. 100% recomendada.', rating: 5, date: 'Oct 2025' },
    { id: 's7', name: 'Olivia Tate', text: 'She exceeded all my expectations! I came in with a reference photo and she matched it perfectly. The quality of her work is outstanding. Book her now!', rating: 5, date: 'Sep 2025' },
    { id: 's8', name: 'Maryjane Munoz', text: 'Amazing work and amazing energy! JoJany makes every appointment so fun and relaxing. You can tell she genuinely loves what she does. Best in the area!', rating: 5, date: 'Sep 2025' },
];

type Review = {
    id: string; rating: number; text: string; createdAt: string;
    user: { name: string; image?: string | null };
    booking?: { service?: { name: string } };
};

type EligibleBooking = { id: string; service: { name: string } };

function Stars({ rating, interactive = false, onChange }: { rating: number; interactive?: boolean; onChange?: (n: number) => void }) {
    const [hover, setHover] = useState(0);
    return (
        <div style={{ display: 'flex', gap: '3px' }}>
            {[1, 2, 3, 4, 5].map(n => (
                <button key={n} type="button"
                    onClick={() => interactive && onChange?.(n)}
                    onMouseEnter={() => interactive && setHover(n)}
                    onMouseLeave={() => interactive && setHover(0)}
                    style={{
                        background: 'none', border: 'none', cursor: interactive ? 'pointer' : 'default',
                        padding: '2px', lineHeight: 0,
                    }}>
                    <Star
                        size={interactive ? 26 : 13}
                        fill={n <= (interactive ? (hover || rating) : rating) ? '#FFB700' : 'transparent'}
                        color={n <= (interactive ? (hover || rating) : rating) ? '#FFB700' : '#aaa'}
                        strokeWidth={1.5}
                    />
                </button>
            ))}
        </div>
    );
}

export default function ReviewsPage() {
    const { data: session, status } = useSession();
    const [dbReviews, setDbReviews] = useState<Review[]>([]);
    const [eligible, setEligible] = useState<EligibleBooking[]>([]);
    const [loading, setLoading] = useState(true);

    // Form state
    const [selectedBooking, setSelectedBooking] = useState('');
    const [rating, setRating] = useState(5);
    const [text, setText] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetch('/api/reviews').then(r => r.json()).then(d => {
            setDbReviews(d.reviews || []);
            setEligible(d.eligibleBookings || []);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, [session]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!selectedBooking) { setError('Select which appointment you are reviewing'); return; }
        if (rating < 1) { setError('Please select a star rating'); return; }
        if (text.trim().length < 10) { setError('Write at least 10 characters'); return; }
        setSubmitting(true); setError('');
        try {
            const r = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookingId: selectedBooking, rating, text }),
            });
            const d = await r.json();
            if (!r.ok) { setError(d.error || 'Submission failed'); return; }
            setSubmitted(true);
            // Add to local list
            setDbReviews(prev => [d.review, ...prev]);
            setEligible(prev => prev.filter(b => b.id !== selectedBooking));
        } finally { setSubmitting(false); }
    }

    // All reviews combined: DB reviews first (newest), then static Setmore ones
    const allReviews = [...dbReviews];

    return (
        <div style={{ minHeight: '100vh', padding: '48px 20px 120px', maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 1 }}>

            {/* ─── Header ─── */}
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <p style={{ fontFamily: 'Poppins, sans-serif', color: '#FF2D78', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '8px' }}>
                    Client Reviews
                </p>
                <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 'clamp(22px, 5vw, 38px)', color: '#fff', letterSpacing: '-0.5px', marginBottom: '12px' }}>
                    What Our Clients Say
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '14px' }}>
                    <Stars rating={5} />
                    <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#FFB700', fontSize: '16px' }}>5.0</span>
                    <span style={{ fontFamily: 'Poppins, sans-serif', color: '#aaa', fontSize: '13px' }}>· 116+ verified reviews</span>
                </div>

                {/* Setmore badge link */}
                <a href="https://glitzandglamourstudio.setmore.com/?source=instagram&instant_experiences_enabled=true#reviews" target="_blank" rel="noopener"
                    style={{
                        display: 'inline-flex', alignItems: 'center', gap: '8px',
                        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '50px', padding: '10px 20px', textDecoration: 'none',
                        fontFamily: 'Poppins, sans-serif', color: '#eee', fontSize: '13px',
                        transition: 'all 0.2s',
                    }}>
                    <span style={{ color: '#0098d4', fontWeight: 600 }}>setmore</span>
                    <span>View all reviews</span>
                    <ExternalLink size={13} color="#bbb" />
                </a>
            </div>

            {/* ─── Review Form / Eligibility Block ─── */}
            <div style={{ marginBottom: '40px' }}>

                {/* Not signed in */}
                {status !== 'loading' && !session && (
                    <div className="glass" style={{ padding: '28px', textAlign: 'center', borderRadius: '20px', marginBottom: '20px', borderColor: 'rgba(255,255,255,0.08)' }}>
                        <Lock size={28} color="#aaa" strokeWidth={1.5} style={{ marginBottom: '12px' }} />
                        <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, color: '#fff', fontSize: '17px', marginBottom: '8px' }}>Sign in to Leave a Review</h2>
                        <p style={{ fontFamily: 'Poppins, sans-serif', color: '#bbb', fontSize: '14px', marginBottom: '20px' }}>
                            Only signed-in clients who have completed an appointment can leave a review.
                        </p>
                        <Link href="/sign-in" className="btn-primary" style={{ fontSize: '14px', padding: '11px 28px' }}>Sign In with Google</Link>
                    </div>
                )}

                {/* Signed in — no eligible bookings */}
                {session && !loading && eligible.length === 0 && !submitted && (
                    <div className="glass" style={{ padding: '28px', textAlign: 'center', borderRadius: '20px', marginBottom: '20px', borderColor: 'rgba(255,255,255,0.08)' }}>
                        <AlertCircle size={28} color="#bbb" strokeWidth={1.5} style={{ marginBottom: '12px' }} />
                        <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, color: '#fff', fontSize: '17px', marginBottom: '8px' }}>Not Eligible to Review Yet</h2>
                        <p style={{ fontFamily: 'Poppins, sans-serif', color: '#bbb', fontSize: '14px', lineHeight: 1.7, marginBottom: '20px' }}>
                            You can leave a review once you've completed an appointment with us.<br />
                            All your reviews must be tied to a real visit.
                        </p>
                        <Link href="/book" className="btn-primary" style={{ fontSize: '14px', padding: '11px 28px' }}>Book an Appointment</Link>
                    </div>
                )}

                {/* Submitted success */}
                {submitted && (
                    <div style={{ background: 'rgba(0,212,120,0.06)', border: '1px solid rgba(0,212,120,0.25)', borderRadius: '16px', padding: '24px', textAlign: 'center', marginBottom: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                        <CheckCircle size={32} color="#00D478" strokeWidth={1.75} />
                        <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, color: '#00D478', fontSize: '16px' }}>Thank you for your review!</p>
                        <p style={{ fontFamily: 'Poppins, sans-serif', color: '#bbb', fontSize: '13px' }}>Your feedback is now live below.</p>
                    </div>
                )}

                {/* Eligible — show form */}
                {session && !loading && eligible.length > 0 && !submitted && (
                    <div className="glass" style={{ padding: '28px', borderRadius: '20px', marginBottom: '20px', borderColor: 'rgba(255,45,120,0.2)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                            <MessageSquarePlus size={20} color="#FF2D78" strokeWidth={1.75} />
                            <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, color: '#fff', fontSize: '17px' }}>
                                Leave a Review
                            </h2>
                            <span style={{ fontFamily: 'Poppins, sans-serif', background: 'rgba(255,45,120,0.12)', border: '1px solid rgba(255,45,120,0.2)', color: '#FF2D78', borderRadius: '50px', padding: '2px 10px', fontSize: '11px', fontWeight: 600 }}>
                                {eligible.length} eligible {eligible.length === 1 ? 'visit' : 'visits'}
                            </span>
                        </div>

                        <form onSubmit={handleSubmit}>
                            {/* Select booking */}
                            <div style={{ marginBottom: '16px' }}>
                                <label className="label">Which appointment are you reviewing?</label>
                                <select className="input" value={selectedBooking} onChange={e => setSelectedBooking(e.target.value)}
                                    style={{ fontFamily: 'Poppins, sans-serif', background: 'rgba(255,255,255,0.05)', color: selectedBooking ? '#fff' : '#bbb', cursor: 'pointer' }}>
                                    <option value="">Select a completed visit...</option>
                                    {eligible.map(b => (
                                        <option key={b.id} value={b.id}>{b.service.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Star rating */}
                            <div style={{ marginBottom: '16px' }}>
                                <label className="label">Your Rating</label>
                                <div style={{ marginTop: '6px' }}>
                                    <Stars rating={rating} interactive onChange={setRating} />
                                </div>
                            </div>

                            {/* Review text */}
                            <div style={{ marginBottom: '16px' }}>
                                <label className="label">Your Review</label>
                                <textarea className="input" value={text} onChange={e => setText(e.target.value)}
                                    placeholder="Tell others about your experience — what service did you get? What did you love?" rows={4}
                                    style={{ fontFamily: 'Poppins, sans-serif', resize: 'vertical', minHeight: '100px' }} />
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                                    {error ? <p style={{ fontFamily: 'Poppins, sans-serif', color: '#FF2D78', fontSize: '12px' }}>{error}</p> : <span />}
                                    <p style={{ fontFamily: 'Poppins, sans-serif', color: text.length > 550 ? '#FF2D78' : '#aaa', fontSize: '12px' }}>{text.length}/600</p>
                                </div>
                            </div>

                            <button type="submit" className="btn-primary" style={{ width: '100%', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                disabled={submitting}>
                                <MessageSquarePlus size={16} />
                                {submitting ? 'Submitting...' : 'Submit Review'}
                            </button>
                        </form>
                    </div>
                )}
            </div>

            {/* ─── DB Reviews (real, from our users) ─── */}
            {allReviews.length > 0 && (
                <div style={{ marginBottom: '32px' }}>
                    <p style={{ fontFamily: 'Poppins, sans-serif', color: '#aaa', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 600, marginBottom: '14px' }}>
                        Verified Client Reviews
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                        {allReviews.map(r => (
                            <div key={r.id} className="glass-card" style={{ padding: '20px', borderRadius: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                    <div style={{
                                        width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0, overflow: 'hidden',
                                        background: 'linear-gradient(135deg, #FF2D78, #7928CA)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        position: 'relative',
                                    }}>
                                        {r.user.image ? (
                                            <Image src={r.user.image} alt={r.user.name} fill style={{ objectFit: 'cover' }} />
                                        ) : (
                                            <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#fff', fontSize: '16px' }}>
                                                {r.user.name.charAt(0)}
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, color: '#fff', fontSize: '14px' }}>{r.user.name}</p>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Stars rating={r.rating} />
                                            {r.booking?.service?.name && (
                                                <span style={{ fontFamily: 'Poppins, sans-serif', color: '#aaa', fontSize: '11px' }}>{r.booking.service.name}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <p style={{ fontFamily: 'Poppins, sans-serif', color: '#999', fontSize: '13px', lineHeight: 1.7, fontStyle: 'italic' }}>
                                    &ldquo;{r.text}&rdquo;
                                </p>
                                <p style={{ fontFamily: 'Poppins, sans-serif', color: '#aaa', fontSize: '11px', marginTop: '10px' }}>
                                    {new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ─── Setmore Reviews (static) ─── */}
            <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                    <p style={{ fontFamily: 'Poppins, sans-serif', color: '#aaa', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 600 }}>
                        From Setmore
                    </p>
                    <a href="https://glitzandglamourstudio.setmore.com/?source=instagram&instant_experiences_enabled=true#reviews" target="_blank" rel="noopener"
                        style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#0098d4', fontFamily: 'Poppins, sans-serif', fontSize: '11px', fontWeight: 600, textDecoration: 'none' }}>
                        See all <ExternalLink size={11} />
                    </a>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px', marginBottom: '40px' }}>
                    {STATIC_REVIEWS.map(r => (
                        <div key={r.id} className="glass-card" style={{ padding: '20px', borderRadius: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg, #7928CA, #FF2D78)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#fff', fontSize: '14px' }}>
                                    {r.name.charAt(0)}
                                </div>
                                <div>
                                    <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, color: '#ccc', fontSize: '13px' }}>{r.name}</p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Stars rating={r.rating} />
                                        <span style={{ fontFamily: 'Poppins, sans-serif', color: '#aaa', fontSize: '11px' }}>{r.date}</span>
                                    </div>
                                </div>
                            </div>
                            <p style={{ fontFamily: 'Poppins, sans-serif', color: '#eee', fontSize: '13px', lineHeight: 1.7, fontStyle: 'italic' }}>&ldquo;{r.text}&rdquo;</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* CTA */}
            <div style={{ textAlign: 'center' }}>
                <Link href="/book" className="btn-primary" style={{ fontSize: '15px', padding: '14px 36px' }}>
                    Book Your Appointment →
                </Link>
            </div>
        </div>
    );
}
