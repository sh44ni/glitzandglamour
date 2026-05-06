'use client';

import Link from 'next/link';
import {
    ChevronLeft, Camera, Shield, Edit3, Slash, Award, Users, XCircle, Scale
} from 'lucide-react';

export default function ImagePolicyPage() {
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
                        Image Usage &amp; <span className="text-gradient">Release Policy</span>
                    </h1>
                    <p style={{ fontFamily: 'Poppins, sans-serif', color: '#bbb', fontSize: '16px', lineHeight: 1.6, maxWidth: '640px' }}>
                        Applies only if you separately opt in to photo/video consent through this website, your booking form, or another written consent method.
                    </p>
                </div>

                {/* ── Policy Sections ── */}
                <div style={{ display: 'grid', gap: '14px' }}>

                    <PolicyCard sym="◍" icon={<Camera size={18} color="#FFD166" />} title="Optional consent">
                        <p>By checking the optional image consent box or otherwise providing written consent, you grant Glitz &amp; Glamour Studio a non-exclusive, royalty-free, worldwide license to use, reproduce, publish, and display photographs, video recordings, and images captured during or after your session for uses including, but not limited to, social media, website and online portfolio, marketing and promotional materials, blog posts and newsletters, and contest or award submissions.</p>
                    </PolicyCard>

                    <PolicyCard sym="◐" icon={<Shield size={18} color="#06D6A0" />} title="No effect on services">
                        <p>You are not required to consent to photo, video, or image use in order to book or receive services. Declining consent will not affect your appointment or service experience.</p>
                    </PolicyCard>

                    <PolicyCard sym="⇄" icon={<Edit3 size={18} color="#118AB2" />} title="Editing and presentation">
                        <p>Glitz &amp; Glamour Studio may crop, resize, adjust lighting or color, add captions, watermarks, music, branding, or otherwise edit images or videos for presentation purposes. We will not intentionally edit content in a way that materially misrepresents you or the service provided.</p>
                    </PolicyCard>

                    <PolicyCard sym="🛡" icon={<Slash size={18} color="#FF2D78" />} title="Restrictions">
                        <p>Glitz &amp; Glamour Studio will not sell your images or videos directly to third parties for commercial resale, use your images or videos in a defamatory, obscene, or unlawful manner, or alter images or videos in a way that misrepresents you.</p>
                    </PolicyCard>

                    <PolicyCard sym="☰" icon={<Award size={18} color="#4FC3F7" />} title="Ownership & copyright">
                        <p>Glitz &amp; Glamour Studio retains full copyright and ownership of all images and videos taken during or after your session. Agreeing to this policy grants a usage license only — it does not transfer copyright to the client.</p>
                    </PolicyCard>

                    <PolicyCard sym="⌂" icon={<Users size={18} color="#9D4EDD" />} title="Minors">
                        <p>If any subject is under 18 years of age, the parent or legal guardian providing consent confirms they have legal authority to grant the rights described in this policy on behalf of the minor.</p>
                    </PolicyCard>

                    <PolicyCard sym="↻" icon={<XCircle size={18} color="#FF6B6B" />} title="Withdrawal of consent">
                        <p>You may withdraw consent for future use of your images or videos by submitting a written request to info@glitzandglamours.com. Previously published content cannot always be removed from all platforms, but we will make reasonable efforts to stop future use going forward.</p>
                    </PolicyCard>

                    <PolicyCard sym="▣" icon={<Scale size={18} color="#FF6BA8" />} title="Governing law">
                        <p>This policy is governed by the laws of California, United States. Any disputes shall be resolved in the courts of that jurisdiction.</p>
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
