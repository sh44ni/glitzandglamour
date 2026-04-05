'use client';

import Link from 'next/link';
import { ChevronLeft, CalendarX, Clock, CreditCard, AlertTriangle, CheckCircle, MapPin, Sparkles, Scissors, Droplets, Eye, Sun, Camera } from 'lucide-react';

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
                    <p style={{ fontFamily: 'Poppins, sans-serif', color: '#555', fontSize: '13px', marginTop: '12px' }}>
                        Last Updated: April 2026
                    </p>
                    <p style={{ fontFamily: 'Poppins, sans-serif', color: '#777', fontSize: '13px', marginTop: '12px', maxWidth: '600px', lineHeight: 1.6, borderLeft: '2px solid rgba(255,45,120,0.3)', paddingLeft: '12px' }}>
                        By checking the acknowledgment box at booking, you confirm you have read and agree to all policies on this page.
                    </p>
                </div>

                <div style={{ display: 'grid', gap: '40px' }}>

                    {/* GENERAL POLICIES SECTION */}
                    <section>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,45,120,0.1)', border: '1px solid rgba(255,45,120,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <AlertTriangle size={20} color="#FF2D78" />
                            </div>
                            <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '24px', color: '#fff' }}>General Policies</h2>
                        </div>

                        <div style={{ display: 'grid', gap: '16px' }}>
                            <PolicyCard
                                icon={<CalendarX size={18} color="#FFD166" />}
                                title="No-Shows"
                                text="No-Shows may be charged and may be blocked from future bookings."
                            />
                            <PolicyCard
                                icon={<AlertTriangle size={18} color="#FF6B6B" />}
                                title="Right To Refuse Service"
                                text="We reserve the right to refuse service for inappropriate behavior or safety concerns."
                            />
                            <PolicyCard
                                icon={<CheckCircle size={18} color="#06D6A0" />}
                                title="Results"
                                text="Results may vary and are not guaranteed."
                            />
                        </div>
                    </section>

                    <hr style={{ border: 'none', borderTop: '1px dashed rgba(255,255,255,0.1)' }} />

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

                    <hr style={{ border: 'none', borderTop: '1px dashed rgba(255,255,255,0.1)' }} />

                    {/* FACIALS SECTION */}
                    <section>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,45,120,0.1)', border: '1px solid rgba(255,45,120,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Droplets size={20} color="#FF2D78" />
                            </div>
                            <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '24px', color: '#fff' }}>Facials &amp; Skincare</h2>
                        </div>

                        <div style={{ display: 'grid', gap: '16px' }}>
                            <PolicyCard
                                icon={<AlertTriangle size={18} color="#FFD166" />}
                                title="Contraindications"
                                text="Please arrive with a clean face if possible. Discontinue use of retinoids, AHAs, BHAs, and avoid excessive sun exposure at least 3-5 days prior to your facial. We cannot perform certain peels if you are currently using Accutane."
                            />
                            <PolicyCard
                                icon={<CheckCircle size={18} color="#06D6A0" />}
                                title="Aftercare"
                                text="Avoid direct sunlight, saunas, and strenuous exercise for 24-48 hours after treatment. Always apply SPF daily as instructed."
                            />
                        </div>
                    </section>

                    <hr style={{ border: 'none', borderTop: '1px dashed rgba(255,255,255,0.1)' }} />

                    {/* LASHES SECTION */}
                    <section>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,45,120,0.1)', border: '1px solid rgba(255,45,120,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Eye size={20} color="#FF2D78" />
                            </div>
                            <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '24px', color: '#fff' }}>Lash Services</h2>
                        </div>

                        <div style={{ display: 'grid', gap: '16px' }}>
                            <PolicyCard
                                icon={<Sparkles size={18} color="#118AB2" />}
                                title="Preparation"
                                text="Arrive with completely clean lashes—no mascara, eyeliner, or oils. A $15 makeup removal fee will apply if deep cleaning is required before your set."
                            />
                            <PolicyCard
                                icon={<Clock size={18} color="#06D6A0" />}
                                title="Fills vs. Full Sets"
                                text="You must have at least 40% of your extensions remaining to be considered a fill. If less than 40% remain, you will be charged for a new full set."
                            />
                            <PolicyCard
                                icon={<AlertTriangle size={18} color="#FF6B6B" />}
                                title="Aftercare &amp; Fixes"
                                text="Do not wet lashes for the first 24 hours. Avoid oil-based products around the eyes. We offer a 48-hour grace period for complimentary fixes related to application issues (not poor aftercare). Fixes requested after 48 hours will incur a fee."
                            />
                        </div>
                    </section>
                    
                    <hr style={{ border: 'none', borderTop: '1px dashed rgba(255,255,255,0.1)' }} />

                    {/* WAXING SECTION */}
                    <section>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,45,120,0.1)', border: '1px solid rgba(255,45,120,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Sun size={20} color="#FF2D78" />
                            </div>
                            <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '24px', color: '#fff' }}>Waxing</h2>
                        </div>

                        <div style={{ display: 'grid', gap: '16px' }}>
                            <PolicyCard
                                icon={<Scissors size={18} color="#9D4EDD" />}
                                title="Hair Length"
                                text="Hair must be at least 1/4 inch long (about the size of a grain of rice) for effective waxing. Please do not trim prior to your appointment."
                            />
                            <PolicyCard
                                icon={<AlertTriangle size={18} color="#FF6B6B" />}
                                title="Contraindications"
                                text="We cannot wax clients using Accutane, Retin-A, or other thinning medications. Please inform us of any prescription skincare routines beforehand."
                            />
                            <PolicyCard
                                icon={<Sun size={18} color="#FFD166" />}
                                title="Aftercare"
                                text="Avoid sun exposure, tight clothing, heavy exercise, saunas, and hot baths for at least 24 hours post-wax to prevent irritation or breakouts."
                            />
                        </div>
                    </section>

                    <hr style={{ border: 'none', borderTop: '1px dashed rgba(255,255,255,0.1)' }} />

                    {/* PHOTO & IMAGE POLICY SECTION */}
                    <section>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,45,120,0.1)', border: '1px solid rgba(255,45,120,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Camera size={20} color="#FF2D78" />
                            </div>
                            <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '24px', color: '#fff' }}>Photo &amp; Image Policy</h2>
                        </div>

                        <p style={{ fontFamily: 'Poppins, sans-serif', color: '#bbb', fontSize: '14px', lineHeight: 1.7, marginBottom: '20px', paddingLeft: '4px' }}>
                            At Glitz &amp; Glamour Studio, we love sharing the beautiful work we create together! Photos of your nails, hair, and beauty results may be taken during or after your appointment and shared on our social media, website, and marketing materials.
                        </p>

                        <div style={{ display: 'grid', gap: '16px' }}>
                            <PolicyCard
                                icon={<Camera size={18} color="#FF2D78" />}
                                title="Consent by Booking"
                                text="By booking with us, you agree that photos taken at the studio may be used to showcase our work online and in promotional content. We will never share anything unflattering — we only post work we're proud of!"
                            />
                            <PolicyCard
                                icon={<CheckCircle size={18} color="#06D6A0" />}
                                title="Opting Out"
                                text="If you'd prefer not to be photographed, just let us know before your appointment and we'll happily respect that — no questions asked."
                            />
                            <PolicyCard
                                icon={<AlertTriangle size={18} color="#FFD166" />}
                                title="Minors"
                                text="If your child is receiving a service, a parent or guardian must confirm consent for any photos taken before they are captured or shared."
                            />
                            <PolicyCard
                                icon={<Sparkles size={18} color="#9D4EDD" />}
                                title="Photo Removal Requests"
                                text="Want us to remove a photo? Reach out to us at info@glitzandglamours.com and we'll do our best to accommodate your request going forward."
                            />
                        </div>

                        <p style={{ fontFamily: 'Poppins, sans-serif', color: '#666', fontSize: '13px', marginTop: '20px', paddingLeft: '4px', lineHeight: 1.6 }}>
                            For full legal terms regarding image rights and copyright, please see our{' '}
                            <a href="/terms" style={{ color: '#FF2D78', textDecoration: 'underline' }}>Terms &amp; Conditions</a>.
                        </p>
                    </section>

                </div>

                <div style={{ marginTop: '60px', padding: '40px 24px', background: 'rgba(255,45,120,0.04)', borderRadius: '24px', border: '1px solid rgba(255,45,120,0.1)' }}>
                    <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '20px', color: '#fff', marginBottom: '8px', textAlign: 'center' }}>More Studio Policies</h3>
                    <p style={{ fontFamily: 'Poppins, sans-serif', color: '#bbb', fontSize: '14px', marginBottom: '24px', textAlign: 'center' }}>Explore our other policies and guidelines below, or book your appointment today.</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '24px' }}>
                        <Link href="/faq" className="btn-outline" style={{ display: 'flex', justifyContent: 'center', padding: '12px', fontSize: '14px' }}>FAQ</Link>
                        <Link href="/waiver" className="btn-outline" style={{ display: 'flex', justifyContent: 'center', padding: '12px', fontSize: '14px' }}>Liability Waiver</Link>
                        <Link href="/terms" className="btn-outline" style={{ display: 'flex', justifyContent: 'center', padding: '12px', fontSize: '14px' }}>Terms &amp; Conditions</Link>
                        <Link href="/privacy" className="btn-outline" style={{ display: 'flex', justifyContent: 'center', padding: '12px', fontSize: '14px' }}>Privacy Policy</Link>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <Link href="/book" className="btn-primary" style={{ padding: '14px 32px' }}>
                            Book Appointment
                        </Link>
                    </div>
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
