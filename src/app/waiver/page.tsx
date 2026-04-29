'use client';

import Link from 'next/link';
import { ChevronLeft, AlertTriangle, CheckCircle, Shield, FileText, Info, RefreshCw, Camera, BookOpen } from 'lucide-react';

const SECTIONS = [
    {
        sym: '⚠', icon: <AlertTriangle size={18} color="#FFD166" />, title: 'Inherent Risks',
        text: 'Beauty services involve inherent risks that may vary by service type and client condition. These risks can include irritation, redness, chemical exposure, allergic reaction, sensitivity, breakage, poor retention, lifting, staining, uneven processing, skin reaction, or unexpected service outcomes even when reasonable care is used.',
    },
    {
        sym: '◔', icon: <Info size={18} color="#06D6A0" />, title: 'Client Disclosures',
        text: 'You agree to provide accurate and complete information before receiving services, including allergies, sensitivities, medications, prior chemical treatments, prior services, skin or scalp conditions, nail conditions, pregnancy-related concerns where relevant, lash or eye sensitivities, and any other information that could affect safety, suitability, or results.',
    },
    {
        sym: '△', icon: <CheckCircle size={18} color="#FF6BA8" />, title: 'No Guarantee of Results',
        text: 'Specific service results are not guaranteed. Outcomes may differ based on your natural hair, skin, lashes, nails, prior product use, prior chemical history, health factors, maintenance habits, aftercare compliance, product compatibility, and pre-existing conditions.',
    },
    {
        sym: '↺', icon: <RefreshCw size={18} color="#9D4EDD" />, title: 'Aftercare Responsibility',
        text: 'You are responsible for following the aftercare and maintenance instructions provided for your service. Glitz & Glamour Studio is not responsible for issues caused in whole or in part by failure to follow aftercare, product misuse, picking, moisture exposure, heat exposure, friction, improper home care, or outside work performed after your appointment.',
    },
    {
        sym: '⟐', icon: <AlertTriangle size={18} color="#FF6B6B" />, title: 'Pre-Existing Conditions & Prior Work',
        text: 'Glitz & Glamour Studio is not responsible for damage, breakage, irritation, retention problems, uneven results, lifting, shedding, peeling, or other complications caused in whole or in part by pre-existing weakness, prior services, prior chemical history, box dye, bleach history, third-party work, previous lash extensions, prior waxing sensitivity, damaged nails, or other pre-existing conditions.',
    },
    {
        sym: '⛨', icon: <Shield size={18} color="#FF2D78" />, title: 'Release & Limitation of Liability',
        text: 'To the fullest extent permitted by law, you understand and accept the inherent risks associated with the services you request and release Glitz & Glamour Studio from claims arising from inherent service risks, disclosed service-related risks, allergic reactions despite reasonable precautions, pre-existing conditions, prior work, prior chemical history, inaccurate or incomplete client disclosures, or failure to follow aftercare or maintenance instructions.',
    },
    {
        sym: '◉', icon: <Camera size={18} color="#9D4EDD" />, title: 'Photo / Video Notice',
        text: 'Glitz & Glamour Studio may photograph or record services, service results, or limited behind-the-scenes content. Separate consent will be requested before any identifiable client photo or video is taken or used for portfolio, website, social media, marketing, educational, or promotional purposes. Declining photo or video consent will not affect your ability to receive services.',
    },
    {
        sym: '◌', icon: <FileText size={18} color="#118AB2" />, title: 'Voluntary Acceptance',
        text: 'By proceeding with your appointment, you voluntarily choose to receive services with knowledge that beauty services carry inherent and variable risks, and you accept responsibility for truthful disclosure, aftercare compliance, and service-related decisions made based on the information you provide.',
    },
    {
        sym: '▣', icon: <BookOpen size={18} color="#FF6BA8" />, title: 'Contact',
        text: 'If you have questions about this Liability Waiver or whether a service is appropriate for you, contact Glitz & Glamour Studio before booking or before your appointment begins.',
    },
];

export default function LiabilityWaiverPage() {
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
                        fontFamily: 'Poppins, sans-serif', marginBottom: '24px', transition: 'color 0.2s',
                    }}
                        onMouseOver={e => { (e.currentTarget as HTMLElement).style.color = '#FF2D78'; }}
                        onMouseOut={e => { (e.currentTarget as HTMLElement).style.color = '#aaa'; }}>
                        <ChevronLeft size={16} /> Studio Policies
                    </Link>

                    <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 'clamp(2.4rem, 5vw, 3.5rem)', letterSpacing: '-1px', marginBottom: '16px', lineHeight: 1.1 }}>
                        Liability <span className="text-gradient">Waiver</span>
                    </h1>
                    <p style={{ fontFamily: 'Poppins, sans-serif', color: '#bbb', fontSize: '16px', lineHeight: 1.6, maxWidth: '640px' }}>
                        Liability Waiver &amp; Client Consent — This Liability Waiver applies to regular website bookings and in-studio or routine service appointments with Glitz &amp; Glamour Studio for non-event beauty services such as nails, hair, waxing, lashes, brows, facials, pedicures, and similar services.
                    </p>
                    <p style={{ fontFamily: 'Poppins, sans-serif', color: '#555', fontSize: '13px', marginTop: '12px' }}>
                        Last Updated: April 2026 · Glitz &amp; Glamour Studio
                    </p>
                    <p style={{ fontFamily: 'Poppins, sans-serif', color: '#777', fontSize: '13px', marginTop: '12px', maxWidth: '620px', lineHeight: 1.6, borderLeft: '2px solid rgba(255,45,120,0.3)', paddingLeft: '12px' }}>
                        By checking the acknowledgment box at booking and by receiving services, you confirm that you have reviewed this Liability Waiver together with the{' '}
                        <a href="/policy" style={{ color: '#FF2D78', textDecoration: 'underline' }}>Studio Policies</a>,{' '}
                        <a href="/terms" style={{ color: '#FF2D78', textDecoration: 'underline' }}>Terms &amp; Conditions</a>, and{' '}
                        <a href="/privacy" style={{ color: '#FF2D78', textDecoration: 'underline' }}>Privacy Policy</a> applicable to regular website bookings. This page does not govern separate bridal, event, or Beauty Events Agreement services.
                    </p>
                </div>

                {/* Intro banner */}
                <div style={{ background: 'rgba(255,45,120,0.05)', border: '1px solid rgba(255,45,120,0.15)', borderRadius: '12px', padding: '16px 20px', marginBottom: '24px' }}>
                    <p style={{ fontFamily: 'Poppins, sans-serif', color: '#eee', fontSize: '15px', fontWeight: 500 }}>
                        By booking or receiving non-event services, you acknowledge the inherent risks of beauty services, confirm your disclosure responsibilities, and agree to the following limitations and acknowledgments.
                    </p>
                </div>

                {/* Client Confirmations — special bulleted card */}
                <div style={{ display: 'grid', gap: '14px' }}>

                    {/* Render first 2 sections before the confirmations card */}
                    {SECTIONS.slice(0, 2).map(({ sym, icon, title, text }) => (
                        <PolicyCard key={title} sym={sym} icon={icon} title={title}>
                            <p>{text}</p>
                        </PolicyCard>
                    ))}

                    {/* Client Confirmations — bulleted */}
                    <PolicyCard sym="✓" icon={<CheckCircle size={18} color="#06D6A0" />} title="Client Confirmations">
                        <ul style={{ paddingLeft: '18px', margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <li>You have disclosed relevant allergies, sensitivities, medications, and conditions to the best of your knowledge.</li>
                            <li>You understand results vary and are not guaranteed.</li>
                            <li>You understand service longevity, retention, color result, lift, durability, or final outcome may vary based on individual factors.</li>
                            <li>You agree to follow all reasonable pre-service and aftercare instructions.</li>
                        </ul>
                    </PolicyCard>

                    {/* Remaining sections */}
                    {SECTIONS.slice(2).map(({ sym, icon, title, text }) => (
                        <PolicyCard key={title} sym={sym} icon={icon} title={title}>
                            <p>{text}</p>
                        </PolicyCard>
                    ))}

                </div>

                {/* Footer links */}
                <div style={{ marginTop: '60px', padding: '40px 24px', background: 'rgba(255,45,120,0.04)', borderRadius: '24px', border: '1px solid rgba(255,45,120,0.1)' }}>
                    <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '20px', color: '#fff', marginBottom: '8px', textAlign: 'center' }}>More Studio Policies</h3>
                    <p style={{ fontFamily: 'Poppins, sans-serif', color: '#bbb', fontSize: '14px', marginBottom: '24px', textAlign: 'center' }}>Explore our other policies and guidelines below.</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                        <Link href="/faq"     className="btn-outline" style={{ display: 'flex', justifyContent: 'center', padding: '12px', fontSize: '14px' }}>FAQ</Link>
                        <Link href="/policy"  className="btn-outline" style={{ display: 'flex', justifyContent: 'center', padding: '12px', fontSize: '14px' }}>Studio Policies</Link>
                        <Link href="/terms"   className="btn-outline" style={{ display: 'flex', justifyContent: 'center', padding: '12px', fontSize: '14px' }}>Terms &amp; Conditions</Link>
                        <Link href="/privacy" className="btn-outline" style={{ display: 'flex', justifyContent: 'center', padding: '12px', fontSize: '14px' }}>Privacy Policy</Link>
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
