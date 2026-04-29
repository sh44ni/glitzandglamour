'use client';

import Link from 'next/link';
import {
    ChevronLeft, Shield, Database, Eye, Share2, Lock, UserCheck,
    RefreshCw, FileText, Smartphone, CheckSquare, MessageSquare,
    AlertCircle, PhoneOff, HelpCircle, Server, Archive, BookOpen,
} from 'lucide-react';

export default function PrivacyPolicyPage() {
    return (
        <div style={{ minHeight: '100vh', padding: '40px 20px 120px', position: 'relative', zIndex: 1 }}>

            {/* Background glows */}
            <div style={{ position: 'absolute', top: '10%', left: '5%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(255,45,120,0.08) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none', zIndex: -1 }} />
            <div style={{ position: 'absolute', bottom: '20%', right: '5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(121,40,202,0.06) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none', zIndex: -1 }} />

            <div style={{ maxWidth: '800px', margin: '0 auto' }}>

                {/* ── Header ── */}
                <div style={{ marginBottom: '40px' }}>
                    <Link href="/policy" style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        color: '#aaa', textDecoration: 'none', fontSize: '14px',
                        fontFamily: 'Poppins, sans-serif', marginBottom: '24px', transition: 'color 0.2s',
                    }}
                        onMouseOver={e => { (e.currentTarget as HTMLElement).style.color = '#FF2D78'; }}
                        onMouseOut={e => { (e.currentTarget as HTMLElement).style.color = '#aaa'; }}>
                        <ChevronLeft size={16} /> Studio Policies
                    </Link>

                    <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 'clamp(2.4rem, 5vw, 3.5rem)', letterSpacing: '-1px', marginBottom: '16px', lineHeight: 1.1 }}>
                        Privacy <span className="text-gradient">Policy</span>
                    </h1>
                    <p style={{ fontFamily: 'Poppins, sans-serif', color: '#bbb', fontSize: '16px', lineHeight: 1.6, maxWidth: '640px' }}>
                        Your privacy matters to us. This Privacy Policy explains what information Glitz &amp; Glamour Studio collects for regular website service bookings, how that information is used, when it may be shared with service providers, and what rights you have regarding your personal information.
                    </p>
                    <p style={{ fontFamily: 'Poppins, sans-serif', color: '#555', fontSize: '13px', marginTop: '12px' }}>
                        Last Updated: April 2026 · Glitz &amp; Glamour Studio
                    </p>
                    <p style={{ fontFamily: 'Poppins, sans-serif', color: '#777', fontSize: '13px', marginTop: '12px', maxWidth: '620px', lineHeight: 1.6, borderLeft: '2px solid rgba(255,45,120,0.3)', paddingLeft: '12px' }}>
                        This Privacy Policy applies to regular website bookings for salon and beauty services such as nails, hair, waxing, lashes, brows, facials, pedicures, and similar appointments. It does not govern separate event inquiries, bridal/event services, or Beauty Events Agreements handled outside the website booking flow.
                    </p>
                </div>

                {/* ── Privacy Policy Sections ── */}
                <div style={{ display: 'grid', gap: '14px' }}>

                    <PolicyCard sym="◍" icon={<Database size={18} color="#FFD166" />} title="Information We Collect">
                        <p>When you book an appointment or create an account with Glitz &amp; Glamour Studio, we may collect your name, email address, phone number, appointment details, booking notes, inspiration photos you choose to upload, service history, loyalty activity, and limited technical information associated with your booking. Payment card details are not stored by the booking form when payment is handled separately or through third-party payment methods.</p>
                    </PolicyCard>

                    <PolicyCard sym="◐" icon={<Eye size={18} color="#06D6A0" />} title="How We Use Your Information">
                        <p>We use your information to manage bookings, send appointment confirmations and reminders, support SMS or email communications you requested, maintain service history and loyalty records, review notes and inspiration photos submitted for appointments, improve operational workflows, prevent fraud or abuse, and maintain the security and integrity of the platform.</p>
                    </PolicyCard>

                    <PolicyCard sym="⇄" icon={<Share2 size={18} color="#118AB2" />} title="Information Sharing">
                        <p>We do not sell, rent, or share your personal information with third parties for their own advertising or marketing purposes. We may share limited information with trusted service providers that help operate the studio or booking system, such as email-delivery providers, SMS-delivery providers, hosting providers, or security/infrastructure vendors, but only to the extent reasonably necessary for them to provide services on our behalf.</p>
                    </PolicyCard>

                    <PolicyCard sym="🛡" icon={<Shield size={18} color="#FF2D78" />} title="Data Security">
                        <p>We take reasonable administrative, technical, and organizational measures to protect personal information from unauthorized access, misuse, alteration, loss, or disclosure. However, no storage system, website, or transmission method can be guaranteed to be completely secure.</p>
                    </PolicyCard>

                    <PolicyCard sym="☰" icon={<Archive size={18} color="#4FC3F7" />} title="How Long We Keep Data">
                        <p>We retain personal information for as long as reasonably necessary to operate the studio, maintain booking and account records, comply with legal or tax obligations, resolve disputes, enforce policies, preserve fraud-prevention records, and document communications or consent records associated with bookings.</p>
                    </PolicyCard>

                    <PolicyCard sym="⌂" icon={<Lock size={18} color="#9D4EDD" />} title="Cookies & Sessions">
                        <p>Our website may use session-based tools, cookies, or similar technologies to keep the booking flow functional, maintain security, prevent abuse, and improve reliability. These tools are used for operational purposes and not to provide unrelated third-party behavioral advertising through the booking process.</p>
                    </PolicyCard>

                    <PolicyCard sym="⬒" icon={<Server size={18} color="#118AB2" />} title="IP Address & Approximate Geolocation">
                        <p>When you submit or finalize a booking, we may log limited technical information such as your IP address, approximate location (for example city, region, or country), and device/browser information. We use this information for fraud prevention, abuse prevention, security monitoring, operational reporting, and to help protect the studio, platform, and clients. This information is not used for targeted advertising.</p>
                    </PolicyCard>

                    <PolicyCard sym="☺" icon={<UserCheck size={18} color="#06D6A0" />} title="Your Rights">
                        <p>You may contact Glitz &amp; Glamour Studio to request access to, correction of, or deletion of the personal information we hold about you, subject to legal obligations, record-retention needs, fraud-prevention needs, and other lawful exceptions. You may also request that we update account contact details or remove information where appropriate.</p>
                    </PolicyCard>

                    <PolicyCard sym="↻" icon={<RefreshCw size={18} color="#FF6B6B" />} title="Policy Updates">
                        <p>We may update this Privacy Policy from time to time. The effective version is the one posted on the website at the time of booking or website use. Continued use of the booking system after updates are posted constitutes acknowledgment of those updates.</p>
                    </PolicyCard>

                    <PolicyCard sym="▣" icon={<BookOpen size={18} color="#FF6BA8" />} title="Contact">
                        <p>If you have questions about this Privacy Policy or how your information is handled, contact Glitz &amp; Glamour Studio using the contact information listed on the website.</p>
                    </PolicyCard>

                </div>

                {/* ── SMS Terms Header ── */}
                <div style={{ marginTop: '60px', marginBottom: '28px' }}>
                    <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', letterSpacing: '-1px', marginBottom: '8px', lineHeight: 1.1 }}>
                        SMS / Text Messaging <span className="text-gradient">Terms of Service</span>
                    </h2>
                </div>

                {/* ── SMS Sections ── */}
                <div style={{ display: 'grid', gap: '14px' }}>

                    <PolicyCard sym="▭" icon={<Smartphone size={18} color="#118AB2" />} title="Program Description">
                        <p>Glitz &amp; Glamour Studio may offer transactional SMS text messaging for appointment confirmations, reminders, scheduling updates, or related service communications. These messages are intended for regular website bookings and related appointment activity rather than unrelated promotional campaigns.</p>
                    </PolicyCard>

                    <PolicyCard sym="✓" icon={<CheckSquare size={18} color="#06D6A0" />} title="Consent">
                        <p>By providing your phone number and opting into SMS communications through the booking flow or another approved method, you agree to receive transactional text messages related to your appointments. Consent to receive text messages is not required to book if another communication method is available.</p>
                    </PolicyCard>

                    <PolicyCard sym="☷" icon={<MessageSquare size={18} color="#FFD166" />} title="Message Frequency">
                        <p>Message frequency varies based on your booking activity, appointment changes, and communication needs. You may receive recurring or one-time messages related to confirmation, reminders, follow-up, or scheduling updates.</p>
                    </PolicyCard>

                    <PolicyCard sym="!" icon={<AlertCircle size={18} color="#FF6B6B" />} title="Message and Data Rates">
                        <p>Message and data rates may apply depending on your wireless carrier or service plan. Glitz &amp; Glamour Studio is not responsible for carrier charges or limitations.</p>
                    </PolicyCard>

                    <PolicyCard sym="✕" icon={<PhoneOff size={18} color="#FF2D78" />} title="Opt-Out / How to Stop">
                        <p>You can opt out of SMS messages at any time by replying <strong style={{ color: '#fff' }}>STOP</strong> to a message you receive from us, subject to any final confirmation message required to process the opt-out.</p>
                    </PolicyCard>

                    <PolicyCard sym="?" icon={<HelpCircle size={18} color="#9D4EDD" />} title="Help">
                        <p>For help with the text messaging program, reply <strong style={{ color: '#fff' }}>HELP</strong> to a message you receive from us or contact Glitz &amp; Glamour Studio using the contact information listed on the website.</p>
                    </PolicyCard>

                    <PolicyCard sym="⌁" icon={<Shield size={18} color="#FFD166" />} title="SMS Privacy">
                        <p>Your phone number, SMS opt-in data, and related messaging records are used only to deliver the messages you requested and maintain communication records. They are not sold, rented, or shared for unrelated third-party marketing purposes.</p>
                    </PolicyCard>

                </div>

                {/* ── Footer links ── */}
                <div style={{ marginTop: '60px', padding: '40px 24px', background: 'rgba(255,45,120,0.04)', borderRadius: '24px', border: '1px solid rgba(255,45,120,0.1)' }}>
                    <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '20px', color: '#fff', marginBottom: '8px', textAlign: 'center' }}>More Studio Policies</h3>
                    <p style={{ fontFamily: 'Poppins, sans-serif', color: '#bbb', fontSize: '14px', marginBottom: '24px', textAlign: 'center' }}>Explore our other policies and guidelines below.</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                        <Link href="/faq"     className="btn-outline" style={{ display: 'flex', justifyContent: 'center', padding: '12px', fontSize: '14px' }}>FAQ</Link>
                        <Link href="/policy"  className="btn-outline" style={{ display: 'flex', justifyContent: 'center', padding: '12px', fontSize: '14px' }}>Studio Policies</Link>
                        <Link href="/waiver"  className="btn-outline" style={{ display: 'flex', justifyContent: 'center', padding: '12px', fontSize: '14px' }}>Liability Waiver</Link>
                        <Link href="/terms"   className="btn-outline" style={{ display: 'flex', justifyContent: 'center', padding: '12px', fontSize: '14px' }}>Terms &amp; Conditions</Link>
                    </div>
                </div>

            </div>
        </div>
    );
}

function PolicyCard({ sym, icon, title, children }: { sym: string; icon: React.ReactNode; title: string; children: React.ReactNode }) {
    return (
        <div className="glass" style={{ padding: '22px 24px', borderRadius: '16px', display: 'flex', gap: '16px', transition: 'transform 0.2s', cursor: 'default' }}
            onMouseOver={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
            onMouseOut={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '11px', color: '#FF2D78', fontWeight: 700, flexShrink: 0 }}>{sym}</span>
                    <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '16px', color: '#fff' }}>{title}</h3>
                </div>
                <div style={{ fontFamily: 'Poppins, sans-serif', color: '#aaa', fontSize: '14px', lineHeight: 1.65 }}>
                    {children}
                </div>
            </div>
        </div>
    );
}
