'use client';

import Link from 'next/link';
import { ChevronLeft, Shield, Database, Eye, Share2, Lock, UserCheck, RefreshCw, FileText, Smartphone, CheckSquare, MessageSquare, AlertCircle, PhoneOff, HelpCircle, Server, Archive } from 'lucide-react';
import { DATA_RETENTION_SUMMARY } from '@/lib/dataRetention';

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
                        Last updated: April 2026 · Glitz &amp; Glamour Studio · 812 Frances Dr, Vista, CA 92083
                    </p>
                    <p style={{ fontFamily: 'Poppins, sans-serif', color: '#777', fontSize: '13px', marginTop: '12px', maxWidth: '600px', lineHeight: 1.6, borderLeft: '2px solid rgba(255,45,120,0.3)', paddingLeft: '12px' }}>
                        By checking the acknowledgment box at booking, you confirm you have read and agree to all policies on this page.
                    </p>
                </div>

                <div style={{ display: 'grid', gap: '16px' }}>

                    <PolicyCard
                        icon={<Database size={18} color="#FFD166" />}
                        title="Information We Collect"
                    >
                        <p>When you book an appointment or create an account with Glitz & Glamour Studio, we collect your name, email address, and phone number. You may also share inspiration images and appointment notes. We do not collect payment card details — payments are handled in person via Cash, Cash App, or Apple Pay.</p>
                        <p style={{ marginTop: '10px' }}>
                            When you finalize a booking on our website, we also collect limited technical data such as your IP address, approximate geolocation (city/region/country), and device/browser information (for example, user agent) to help protect against fraud and abuse, secure our systems, and understand where bookings are being made from.
                        </p>
                    </PolicyCard>

                    <PolicyCard
                        icon={<Eye size={18} color="#06D6A0" />}
                        title="How We Use Your Information"
                    >
                        <p>We use your information to:</p>
                        <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
                            <li>Manage your bookings and send appointment confirmations and reminders via email or SMS</li>
                            <li>Maintain your loyalty card stamps</li>
                            <li>Improve your experience at the studio</li>
                        </ul>
                        <p>We do not use your data for advertising or marketing purposes. We do not sell, rent, or share your personal information with third parties for marketing.</p>
                    </PolicyCard>

                    <PolicyCard
                        icon={<Share2 size={18} color="#118AB2" />}
                        title="Information Sharing"
                    >
                        <p>Your data may be processed by trusted third-party services we use to operate the studio, solely to deliver communications you have requested. These include:</p>
                        <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
                            <li>Resend (email delivery)</li>
                            <li>Pingram (SMS delivery)</li>
                        </ul>
                        <p>These providers only process your data on our behalf and are not permitted to use it for their own purposes.</p>
                    </PolicyCard>

                    <PolicyCard
                        icon={<Shield size={18} color="#FF2D78" />}
                        title="Data Security"
                    >
                        <p>Your data is stored securely in an encrypted database. Passwords are hashed and never stored in plain text. Our systems are hosted on a private server with strictly controlled access. We take reasonable technical and organizational measures to protect your information from unauthorized access, loss, or misuse.</p>
                    </PolicyCard>

                    <PolicyCard
                        icon={<Archive size={18} color="#4FC3F7" />}
                        title="How Long We Keep Data"
                    >
                        <p>{DATA_RETENTION_SUMMARY}</p>
                        <p style={{ marginTop: '10px' }}>
                            Short-lived access links (for example, one-time review invitations) expire automatically for security. If you ask us to delete your account or personal data, we will honor that request subject to any legal record-keeping obligations.
                        </p>
                    </PolicyCard>

                    <PolicyCard
                        icon={<Lock size={18} color="#9D4EDD" />}
                        title="Cookies & Sessions"
                    >
                        <p>Our website uses session cookies to keep you signed in. We do not use advertising or tracking cookies. Google Sign-In may set cookies managed by Google&apos;s own privacy policy. You can clear cookies at any time from your browser settings.</p>
                    </PolicyCard>

                    <PolicyCard
                        icon={<Server size={18} color="#118AB2" />}
                        title="IP Address & Geolocation"
                    >
                        <p>When you submit a booking, we may log your IP address and derive an approximate location (such as city, region, and country). This information is used for:</p>
                        <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
                            <li>Security, abuse prevention, and rate limiting</li>
                            <li>Investigating suspicious activity and protecting the studio and clients</li>
                            <li>Operational reporting (for example, understanding where bookings originate)</li>
                        </ul>
                        <p>We do not use this information for targeted advertising.</p>
                    </PolicyCard>

                    <PolicyCard
                        icon={<UserCheck size={18} color="#06D6A0" />}
                        title="Your Rights"
                    >
                        <p>You have the right to access, correct, or delete the personal information we hold about you. To request a copy of your data or to have your account removed, contact us at info@glitzandglamours.com. We will respond within 7 business days.</p>
                    </PolicyCard>

                    <PolicyCard
                        icon={<RefreshCw size={18} color="#FF6B6B" />}
                        title="Policy Updates"
                    >
                        <p>We may update this policy from time to time. When we do, we will update the date at the top of this page. Continued use of our website or services after changes are posted constitutes acceptance of those changes.</p>
                    </PolicyCard>
                    
                    <PolicyCard
                        icon={<FileText size={18} color="#118AB2" />}
                        title="Contact"
                    >
                        <p>If you have questions about this Privacy Policy, our SMS Terms, or how your data is handled:</p>
                        <p style={{ marginTop: '8px' }}>Email: info@glitzandglamours.com<br/>Address: 812 Frances Dr, Vista, CA 92083</p>
                    </PolicyCard>

                </div>

                {/* SMS Terms Header */}
                <div style={{ marginTop: '60px', marginBottom: '32px' }}>
                    <h2 style={{
                        fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
                        letterSpacing: '-1px', marginBottom: '16px', lineHeight: 1.1
                    }}>
                        SMS / Text Messaging <span className="text-gradient">Terms of Service</span>
                    </h2>
                </div>

                <div style={{ display: 'grid', gap: '16px' }}>
                    
                    <PolicyCard
                        icon={<Smartphone size={18} color="#118AB2" />}
                        title="Program Description"
                    >
                        <p>Glitz & Glamour Studio offers SMS text messaging to provide appointment confirmations, reminders, and booking updates. Messages are transactional and related to services you have booked with us. We do not send promotional or marketing messages via SMS.</p>
                    </PolicyCard>

                    <PolicyCard
                        icon={<CheckSquare size={18} color="#06D6A0" />}
                        title="Consent"
                    >
                        <p>By providing your phone number during the booking or account creation process and checking the consent box, you agree to receive transactional text messages from Glitz & Glamour Studio related to your appointments. Consent to receive text messages is not a condition of purchasing any service. You may book appointments without opting into SMS — email notifications are always available as an alternative.</p>
                    </PolicyCard>

                    <PolicyCard
                        icon={<MessageSquare size={18} color="#FFD166" />}
                        title="Message Frequency"
                    >
                        <p>Message frequency varies based on your booking activity. You will typically receive 1–3 messages per appointment (confirmation, reminder, and/or update). No recurring marketing messages will be sent.</p>
                    </PolicyCard>

                    <PolicyCard
                        icon={<AlertCircle size={18} color="#FF6B6B" />}
                        title="Message and Data Rates"
                    >
                        <p>Message and data rates may apply. Check with your mobile carrier for details about your messaging plan. Glitz & Glamour Studio is not responsible for charges from your carrier.</p>
                    </PolicyCard>

                    <PolicyCard
                        icon={<PhoneOff size={18} color="#FF2D78" />}
                        title="Opt-Out / How to Stop"
                    >
                        <p>You can opt out of SMS messages at any time by replying STOP to any message you receive from us. After opting out, you will receive one final confirmation message. You will no longer receive text messages from Glitz & Glamour Studio unless you re-subscribe.</p>
                    </PolicyCard>

                    <PolicyCard
                        icon={<HelpCircle size={18} color="#9D4EDD" />}
                        title="Help"
                    >
                        <p>For help with our text messaging program, reply HELP to any message, or contact us at info@glitzandglamours.com or (760) 290-5910.</p>
                    </PolicyCard>

                    <PolicyCard
                        icon={<Server size={18} color="#118AB2" />}
                        title="Supported Carriers"
                    >
                        <p>Our SMS program is compatible with all major US carriers. Carriers are not liable for delayed or undelivered messages.</p>
                    </PolicyCard>

                    <PolicyCard
                        icon={<Shield size={18} color="#FFD166" />}
                        title="Privacy"
                    >
                        <p>Your phone number and opt-in data will not be sold, rented, or shared with third parties for promotional purposes. Your information is used solely by Glitz & Glamour Studio and our SMS service provider (Pingram) to deliver the messages you have requested. For full details, see our Privacy Policy above.</p>
                    </PolicyCard>

                </div>

                <div style={{ marginTop: '60px', padding: '40px 24px', background: 'rgba(255,45,120,0.04)', borderRadius: '24px', border: '1px solid rgba(255,45,120,0.1)' }}>
                    <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '20px', color: '#fff', marginBottom: '8px', textAlign: 'center' }}>More Studio Policies</h3>
                    <p style={{ fontFamily: 'Poppins, sans-serif', color: '#bbb', fontSize: '14px', marginBottom: '24px', textAlign: 'center' }}>Explore our other policies and guidelines below.</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                        <Link href="/faq" className="btn-outline" style={{ display: 'flex', justifyContent: 'center', padding: '12px', fontSize: '14px' }}>FAQ</Link>
                        <Link href="/policy" className="btn-outline" style={{ display: 'flex', justifyContent: 'center', padding: '12px', fontSize: '14px' }}>Studio Policies</Link>
                        <Link href="/waiver" className="btn-outline" style={{ display: 'flex', justifyContent: 'center', padding: '12px', fontSize: '14px' }}>Liability Waiver</Link>
                        <Link href="/terms" className="btn-outline" style={{ display: 'flex', justifyContent: 'center', padding: '12px', fontSize: '14px' }}>Terms &amp; Conditions</Link>
                    </div>
                </div>

            </div>
        </div>
    );
}

function PolicyCard({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) {
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
                <div style={{ fontFamily: 'Poppins, sans-serif', color: '#aaa', fontSize: '14px', lineHeight: 1.6 }}>
                    {children}
                </div>
            </div>
        </div>
    );
}
