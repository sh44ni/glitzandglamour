'use client';

import Link from 'next/link';
import { ChevronLeft, Scale, Briefcase, CreditCard, AlertTriangle, Scale as ScaleIcon, Shield, Laptop, Copy, FileText, CheckCircle } from 'lucide-react';

export default function TermsPage() {
    return (
        <div style={{ minHeight: '100vh', padding: '40px 20px 120px', position: 'relative', zIndex: 1 }}>

            {/* Background elements */}
            <div style={{ position: 'absolute', top: '10%', left: '5%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(255,45,120,0.08) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none', zIndex: -1 }} />
            <div style={{ position: 'absolute', bottom: '20%', right: '5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(121,40,202,0.06) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none', zIndex: -1 }} />

            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
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
                        Terms &amp; <span className="text-gradient">Conditions</span>
                    </h1>
                    <p style={{ fontFamily: 'Poppins, sans-serif', color: '#bbb', fontSize: '16px', lineHeight: 1.6, maxWidth: '600px' }}>
                        Glitz &amp; Glamour Studio
                    </p>
                    <p style={{ fontFamily: 'Poppins, sans-serif', color: '#555', fontSize: '13px', marginTop: '12px' }}>
                        Last Updated: March 2026
                    </p>
                </div>

                <div style={{ display: 'grid', gap: '16px' }}>

                    <div style={{ background: 'rgba(255,45,120,0.05)', border: '1px solid rgba(255,45,120,0.15)', borderRadius: '12px', padding: '16px 20px', marginBottom: '16px' }}>
                        <p style={{ fontFamily: 'Poppins, sans-serif', color: '#eee', fontSize: '15px', fontWeight: 500 }}>
                            By accessing this website (https://glitzandglamours.com/) and booking services with Glitz &amp; Glamour Studio (“we,” “our,” “us”), you agree to the following terms.
                        </p>
                    </div>

                    <PolicyCard icon={<Briefcase size={18} color="#FFD166" />} title="Services">
                        <p>We offer beauty services including hair, nails, makeup, waxing, lashes, and brows. Services are subject to availability and may change at any time.</p>
                    </PolicyCard>

                    <PolicyCard icon={<CheckCircle size={18} color="#06D6A0" />} title="Appointments">
                        <p>Appointments must be booked through our website or approved methods. We reserve the right to refuse service to anyone.</p>
                    </PolicyCard>

                    <PolicyCard icon={<CreditCard size={18} color="#118AB2" />} title="Payments">
                        <p>Deposits may be required and are non-refundable unless otherwise stated. Full payment is due at the time of service.</p>
                    </PolicyCard>

                    <PolicyCard icon={<ScaleIcon size={18} color="#FF6B6B" />} title="Results Disclaimer">
                        <p>We do not guarantee specific results. Outcomes vary depending on hair condition, skin type, aftercare, and previous services.</p>
                    </PolicyCard>

                    <PolicyCard icon={<AlertTriangle size={18} color="#FF2D78" />} title="Limitation of Liability">
                        <p>Glitz &amp; Glamour Studio is not liable for:</p>
                        <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
                            <li>Allergic reactions</li>
                            <li>Skin irritation</li>
                            <li>Hair damage due to prior chemical treatments</li>
                            <li>Lash retention issues</li>
                        </ul>
                        <p>By booking, you accept all risks associated with beauty services.</p>
                    </PolicyCard>

                    <PolicyCard icon={<Shield size={18} color="#06D6A0" />} title="Client Responsibility">
                        <p>Clients must disclose all allergies, sensitivities, and prior treatments. Failure to do so releases us from liability.</p>
                    </PolicyCard>

                    <PolicyCard icon={<Laptop size={18} color="#9D4EDD" />} title="Website Use">
                        <p>You agree not to misuse this website or attempt unauthorized access.</p>
                    </PolicyCard>

                    <PolicyCard icon={<Copy size={18} color="#118AB2" />} title="Intellectual Property">
                        <p>All content, logos, and branding belong to Glitz &amp; Glamour Studio and may not be used without permission.</p>
                    </PolicyCard>

                    <PolicyCard icon={<Scale size={18} color="#FFD166" />} title="Governing Law">
                        <p>These terms are governed by the laws of California.</p>
                    </PolicyCard>

                    <PolicyCard icon={<FileText size={18} color="#FF6B6B" />} title="Changes">
                        <p>We reserve the right to update these terms at any time.</p>
                    </PolicyCard>

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
