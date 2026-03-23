'use client';

import Link from 'next/link';
import { ChevronLeft, AlertTriangle, CheckCircle, Shield, FileText } from 'lucide-react';

export default function LiabilityWaiverPage() {
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
                        Liability <span className="text-gradient">Waiver</span>
                    </h1>
                    <p style={{ fontFamily: 'Poppins, sans-serif', color: '#bbb', fontSize: '16px', lineHeight: 1.6, maxWidth: '600px' }}>
                        LIABILITY WAIVER &amp; CLIENT CONSENT
                    </p>
                    <p style={{ fontFamily: 'Poppins, sans-serif', color: '#555', fontSize: '13px', marginTop: '12px' }}>
                        Glitz &amp; Glamour Studio
                    </p>
                </div>

                <div style={{ display: 'grid', gap: '16px' }}>
                    
                    <div style={{ background: 'rgba(255,45,120,0.05)', border: '1px solid rgba(255,45,120,0.15)', borderRadius: '12px', padding: '16px 20px', marginBottom: '16px' }}>
                        <p style={{ fontFamily: 'Poppins, sans-serif', color: '#eee', fontSize: '15px', fontWeight: 500 }}>
                            By booking or receiving services, you acknowledge and agree to the following:
                        </p>
                    </div>

                    <PolicyCard icon={<AlertTriangle size={18} color="#FFD166" />} title="Inherent Risks">
                        <p>I understand beauty services involve risks including but not limited to:</p>
                        <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
                            <li>Chemical exposure</li>
                            <li>Skin irritation</li>
                            <li>Allergic reactions</li>
                            <li>Hair damage</li>
                        </ul>
                    </PolicyCard>

                    <PolicyCard icon={<CheckCircle size={18} color="#06D6A0" />} title="Client Confirmations">
                        <p>I confirm the following:</p>
                        <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
                            <li>I have disclosed all medical conditions, allergies, and sensitivities.</li>
                            <li>I understand results are not guaranteed.</li>
                            <li>I agree to follow all aftercare instructions provided to me.</li>
                        </ul>
                    </PolicyCard>

                    <PolicyCard icon={<Shield size={18} color="#FF6B6B" />} title="Release of Liability">
                        <p>I release Glitz &amp; Glamour Studio from liability for any of the following:</p>
                        <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
                            <li>Allergic reactions</li>
                            <li>Hair damage from prior treatments</li>
                            <li>Lash retention issues</li>
                            <li>Skin irritation from waxing or products</li>
                        </ul>
                    </PolicyCard>

                    <PolicyCard icon={<FileText size={18} color="#118AB2" />} title="Voluntary Acceptance">
                        <p>By booking, I voluntarily accept all risks associated with receiving these services.</p>
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
