'use client';

import Link from 'next/link';
import { ChevronLeft, CalendarX, Clock, CreditCard, AlertTriangle, CheckCircle, MapPin, Sparkles, Scissors } from 'lucide-react';

export default function PolicyPage() {
    return (
        <div style={{ minHeight: '100vh', padding: '40px 20px 120px', position: 'relative', zIndex: 1 }}>

            {/* Background elements for extra flair */}
            <div style={{ position: 'absolute', top: '10%', left: '5%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(255,45,120,0.08) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none', zIndex: -1 }} />
            <div style={{ position: 'absolute', bottom: '20%', right: '5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(121,40,202,0.06) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none', zIndex: -1 }} />

            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ marginBottom: '40px' }}>
                    <Link href="/" style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        color: '#aaa', textDecoration: 'none', fontSize: '14px',
                        fontFamily: 'Poppins, sans-serif', marginBottom: '24px',
                        transition: 'color 0.2s'
                    }}
                        onMouseOver={e => { (e.currentTarget as HTMLElement).style.color = '#FF2D78'; }}
                        onMouseOut={e => { (e.currentTarget as HTMLElement).style.color = '#aaa'; }}>
                        <ChevronLeft size={16} /> Back to Home
                    </Link>

                    <h1 style={{
                        fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 'clamp(2.4rem, 5vw, 3.5rem)',
                        letterSpacing: '-1px', marginBottom: '16px', lineHeight: 1.1
                    }}>
                        Studio <span className="text-gradient">Policies</span>
                    </h1>
                    <p style={{ fontFamily: 'Poppins, sans-serif', color: '#bbb', fontSize: '16px', lineHeight: 1.6, maxWidth: '600px' }}>
                        Please review these policies before booking an appointment to ensure the best possible experience for everyone.
                    </p>
                </div>

                <div style={{ display: 'grid', gap: '40px' }}>

                    {/* NAIL SERVICES SECTION */}
                    <section>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,45,120,0.1)', border: '1px solid rgba(255,45,120,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Sparkles size={20} color="#FF2D78" />
                            </div>
                            <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '24px', color: '#fff' }}>Nail Services</h2>
                        </div>

                        <div style={{ display: 'grid', gap: '16px' }}>
                            <PolicyCard
                                icon={<CalendarX size={18} color="#FFD166" />}
                                title="Appointments"
                                text="A retainer is required to secure your appointment. Walk-ins are not available at this time. Please note that the retainer is non-refundable; however, it will be applied toward your total service amount."
                            />
                            <PolicyCard
                                icon={<AlertTriangle size={18} color="#FF6B6B" />}
                                title="Cancellations & Rescheduling"
                                text="24-hour notice is required to transfer your retainer. No-shows forfeit the retainer and may be required to prepay in full for future bookings."
                            />
                            <PolicyCard
                                icon={<Clock size={18} color="#06D6A0" />}
                                title="Late Policy"
                                text="A 10-minute grace period is allowed. After that, a $10 late fee applies. Beyond 15 minutes, your appointment may be canceled."
                            />
                            <PolicyCard
                                icon={<CreditCard size={18} color="#118AB2" />}
                                title="Payment"
                                text="Cash, Cash App, and Apple Pay accepted. No refunds once the service is completed."
                            />
                            <PolicyCard
                                icon={<CheckCircle size={18} color="#FF2D78" />}
                                title="Fixes"
                                text="Must be requested within 48 hours. Fixes due to personal nail care or accidents will have a fee."
                            />
                        </div>
                    </section>

                    <hr style={{ border: 'none', borderTop: '1px dashed rgba(255,255,255,0.1)' }} />

                    {/* HAIRSTYLING & MAKEUP SECTION */}
                    <section>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,45,120,0.1)', border: '1px solid rgba(255,45,120,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Scissors size={20} color="#FF2D78" />
                            </div>
                            <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '24px', color: '#fff' }}>Hairstyling & Makeup</h2>
                        </div>

                        <div style={{ display: 'grid', gap: '16px' }}>
                            <PolicyCard
                                icon={<MapPin size={18} color="#06D6A0" />}
                                title="Location"
                                text="Mobile services based in Oceanside. Travel fees may apply outside the area."
                            />
                            <PolicyCard
                                icon={<CalendarX size={18} color="#FFD166" />}
                                title="Booking"
                                text="A non-refundable retainer is required to secure your appointment. The remaining balance is due on the day of service."
                            />
                            <PolicyCard
                                icon={<AlertTriangle size={18} color="#FF6B6B" />}
                                title="Cancellations"
                                text="Must be made at least 48 hours in advance to transfer your retainer to a future appointment. Last-minute cancellations or no-shows will forfeit the retainer."
                            />
                            <PolicyCard
                                icon={<Clock size={18} color="#118AB2" />}
                                title="Late Policy"
                                text="A 10-minute grace period is allowed. After that, a $15 late fee applies. Beyond 20 minutes, your appointment may be canceled."
                            />
                            <PolicyCard
                                icon={<CheckCircle size={18} color="#FF2D78" />}
                                title="Prep"
                                text="Please arrive with clean, dry hair and a makeup-free face. A prep fee may apply if additional work is needed."
                            />
                            <PolicyCard
                                icon={<CreditCard size={18} color="#9D4EDD" />}
                                title="Payment"
                                text="Cash, Cash App, and Apple Pay accepted. No refunds once the service is completed."
                            />
                        </div>
                    </section>

                </div>

                {/* Footer CTA */}
                <div style={{ marginTop: '60px', textAlign: 'center', padding: '40px 24px', background: 'rgba(255,45,120,0.04)', borderRadius: '24px', border: '1px solid rgba(255,45,120,0.1)' }}>
                    <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '20px', color: '#fff', marginBottom: '12px' }}>Ready constraints to book?</h3>
                    <p style={{ fontFamily: 'Poppins, sans-serif', color: '#bbb', fontSize: '14px', marginBottom: '24px' }}>Now that you're familiar with the policies, let's get you on the schedule!</p>
                    <Link href="/book" className="btn-primary" style={{ padding: '14px 32px' }}>
                        Book Appointment
                    </Link>
                </div>

            </div>
        </div>
    );
}

function PolicyCard({ icon, title, text }: { icon: React.ReactNode, title: string, text: string }) {
    return (
        <div className="glass" style={{
            padding: '24px', borderRadius: '16px', display: 'flex', gap: '16px',
            transition: 'transform 0.2s', cursor: 'default'
        }}
            onMouseOver={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
            onMouseOut={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
        >
            <div style={{
                width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
                {icon}
            </div>
            <div>
                <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '16px', color: '#fff', marginBottom: '6px' }}>
                    {title}
                </h3>
                <p style={{ fontFamily: 'Poppins, sans-serif', color: '#aaa', fontSize: '14px', lineHeight: 1.6 }}>
                    {text}
                </p>
            </div>
        </div>
    );
}
