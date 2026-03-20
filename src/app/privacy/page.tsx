'use client';

import Link from 'next/link';
import { ChevronLeft, Shield, Database, Eye, Share2, Lock, UserCheck, Mail, RefreshCw, FileText } from 'lucide-react';

export default function PrivacyPolicyPage() {
    return (
        <div style={{ minHeight: '100vh', padding: '40px 20px 120px', position: 'relative', zIndex: 1 }}>

            {/* Background glows */}
            <div style={{ position: 'absolute', top: '10%', left: '5%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(255,45,120,0.08) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none', zIndex: -1 }} />
            <div style={{ position: 'absolute', bottom: '20%', right: '5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(121,40,202,0.06) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none', zIndex: -1 }} />

            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ marginBottom: '40px' }}>
                    <Link href="/policy" style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        color: '#aaa', textDecoration: 'none', fontSize: '14px',
                        fontFamily: 'Poppins, sans-serif', marginBottom: '24px',
                        transition: 'color 0.2s'
                    }}
                        onMouseOver={e => { (e.currentTarget as HTMLElement).style.color = '#FF2D78'; }}
                        onMouseOut={e => { (e.currentTarget as HTMLElement).style.color = '#aaa'; }}>
                        <ChevronLeft size={16} /> Studio Policies
                    </Link>

                    <h1 style={{
                        fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 'clamp(2.4rem, 5vw, 3.5rem)',
                        letterSpacing: '-1px', marginBottom: '16px', lineHeight: 1.1
                    }}>
                        Privacy <span className="text-gradient">Policy</span>
                    </h1>
                    <p style={{ fontFamily: 'Poppins, sans-serif', color: '#bbb', fontSize: '16px', lineHeight: 1.6, maxWidth: '600px' }}>
                        Your privacy matters to us. This policy explains what information we collect, how we use it, and your rights as a client of Glitz & Glamour Studio.
                    </p>
                    <p style={{ fontFamily: 'Poppins, sans-serif', color: '#555', fontSize: '13px', marginTop: '12px' }}>
                        Last updated: March 2026 · Glitz & Glamour Studio · 812 Frances Dr, Vista, CA 92083
                    </p>
                </div>

                <div style={{ display: 'grid', gap: '16px' }}>

                    <PolicyCard
                        icon={<Database size={18} color="#FFD166" />}
                        title="Information We Collect"
                        text="When you book an appointment or create an account, we collect your name, email address, and phone number. You may also optionally share inspiration images and appointment notes. We do not collect payment card details — payments are handled in person via Cash, Cash App, or Apple Pay."
                    />

                    <PolicyCard
                        icon={<Eye size={18} color="#06D6A0" />}
                        title="How We Use Your Information"
                        text="Your information is used solely to manage your bookings, send appointment confirmations and reminders via email or SMS, maintain your loyalty card stamps, and improve your experience at the studio. We do not use your data for advertising."
                    />

                    <PolicyCard
                        icon={<Share2 size={18} color="#118AB2" />}
                        title="Information Sharing"
                        text="We do not sell, rent, or share your personal information with third parties for marketing purposes. Your data may be processed by trusted services we use to operate the studio — such as our email provider (Resend) and SMS service (Pingram) — solely to deliver communications you've requested."
                    />

                    <PolicyCard
                        icon={<Shield size={18} color="#FF2D78" />}
                        title="Data Security"
                        text="Your data is stored securely in an encrypted database. Passwords are hashed and never stored in plain text. Our systems are hosted on a private server and access is strictly controlled. We take reasonable technical and organizational measures to protect your information."
                    />

                    <PolicyCard
                        icon={<Lock size={18} color="#9D4EDD" />}
                        title="Cookies & Sessions"
                        text="Our website uses session cookies to keep you signed in. We do not use advertising or tracking cookies. Google Sign-In may set cookies managed by Google's own privacy policy. You can clear cookies at any time from your browser settings."
                    />

                    <PolicyCard
                        icon={<UserCheck size={18} color="#06D6A0" />}
                        title="Your Rights"
                        text="You have the right to access, correct, or delete the personal information we hold about you. To request a copy of your data or to have your account removed, please contact us at info@glitzandglamours.com. We will respond within 7 business days."
                    />

                    <PolicyCard
                        icon={<Mail size={18} color="#FFD166" />}
                        title="Communications"
                        text="By booking an appointment, you consent to receive transactional emails and SMS messages related to your booking (confirmations, reminders, and updates). You may opt out of SMS communications at any time by replying STOP, or unsubscribe from emails via the link in any email we send."
                    />

                    <PolicyCard
                        icon={<RefreshCw size={18} color="#FF6B6B" />}
                        title="Policy Updates"
                        text="We may update this policy from time to time. When we do, we'll update the date at the top of this page. Continued use of our website or services after changes are posted constitutes acceptance of those changes."
                    />

                    <PolicyCard
                        icon={<FileText size={18} color="#118AB2" />}
                        title="Contact"
                        text="If you have any questions about this Privacy Policy or how your data is handled, please contact us at info@glitzandglamours.com or visit us at 812 Frances Dr, Vista, CA 92083."
                    />

                </div>

                {/* Footer link back */}
                <div style={{ marginTop: '60px', textAlign: 'center', padding: '40px 24px', background: 'rgba(255,45,120,0.04)', borderRadius: '24px', border: '1px solid rgba(255,45,120,0.1)' }}>
                    <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '20px', color: '#fff', marginBottom: '12px' }}>Review Our Studio Policies</h3>
                    <p style={{ fontFamily: 'Poppins, sans-serif', color: '#bbb', fontSize: '14px', marginBottom: '24px' }}>Cancellations, payments, late policy, and more — all in one place.</p>
                    <Link href="/policy" className="btn-primary" style={{ padding: '14px 32px' }}>
                        View Studio Policies
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
