'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronDown, Sparkles, Scissors, Sun, Eye, FileText } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

function AccordionItem({ q, a }: { q: string, a: string }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div
            onClick={() => setIsOpen(!isOpen)}
            className="glass"
            style={{
                borderRadius: '16px', overflow: 'hidden',
                marginBottom: '10px', cursor: 'pointer',
                border: isOpen ? '1px solid rgba(255,45,120,0.3)' : '1px solid rgba(255,255,255,0.08)',
                transition: 'all 0.2s ease',
                background: isOpen ? 'rgba(255,45,120,0.04)' : undefined
            }}
        >
            <div style={{
                padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                gap: '16px'
            }}>
                <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '15px', color: '#fff', margin: 0, lineHeight: 1.4 }}>
                    {q}
                </h3>
                <div style={{
                    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    color: isOpen ? '#FF2D78' : '#888', flexShrink: 0
                }}>
                    <ChevronDown size={20} />
                </div>
            </div>

            <div style={{
                height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0,
                overflow: 'hidden', padding: isOpen ? '0 20px 20px' : '0 20px',
                transition: 'all 0.3s ease',
            }}>
                <p style={{ fontFamily: 'Poppins, sans-serif', color: '#aaa', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>
                    {a}
                </p>
            </div>
        </div>
    );
}

export default function FAQPage() {
    const { t } = useTranslation();

    const faqData = [
        {
            category: t('faq.categories.nails'),
            icon: <Sparkles size={20} color="#FF2D78" />,
            questions: [
                { q: t('faq.q1_1'), a: t('faq.a1_1') },
                { q: t('faq.q1_2'), a: t('faq.a1_2') },
                { q: t('faq.q1_3'), a: t('faq.a1_3') },
            ]
        },
        {
            category: t('faq.categories.hair'),
            icon: <Scissors size={20} color="#FF2D78" />,
            questions: [
                { q: t('faq.q2_1'), a: t('faq.a2_1') },
                { q: t('faq.q2_2'), a: t('faq.a2_2') },
            ]
        },
        {
            category: t('faq.categories.waxing'),
            icon: <Sun size={20} color="#FF2D78" />,
            questions: [
                { q: t('faq.q3_1'), a: t('faq.a3_1') },
                { q: t('faq.q3_2'), a: t('faq.a3_2') },
                { q: t('faq.q3_3'), a: t('faq.a3_3') },
            ]
        },
        {
            category: t('faq.categories.lashes'),
            icon: <Eye size={20} color="#FF2D78" />,
            questions: [
                { q: t('faq.q4_1'), a: t('faq.a4_1') },
                { q: t('faq.q4_2'), a: t('faq.a4_2') },
                { q: t('faq.q4_3'), a: t('faq.a4_3') },
            ]
        },
    ];

    return (
        <div style={{ minHeight: '100vh', padding: '40px 20px 120px', position: 'relative', zIndex: 1 }}>

            {/* Background elements */}
            <div style={{ position: 'absolute', top: '10%', right: '5%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(255,45,120,0.08) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none', zIndex: -1 }} />
            <div style={{ position: 'absolute', top: '40%', left: '5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(121,40,202,0.05) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none', zIndex: -1 }} />

            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div style={{ marginBottom: '40px' }}>
                    <Link href="/" style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        color: '#aaa', textDecoration: 'none', fontSize: '14px',
                        fontFamily: 'Poppins, sans-serif', marginBottom: '24px',
                        transition: 'color 0.2s'
                    }}
                        onMouseOver={e => { (e.currentTarget as HTMLElement).style.color = '#FF2D78'; }}
                        onMouseOut={e => { (e.currentTarget as HTMLElement).style.color = '#aaa'; }}>
                        <ChevronLeft size={16} /> {t('faq.backToHome')}
                    </Link>

                    <h1 style={{
                        fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 'clamp(2.4rem, 5vw, 3.5rem)',
                        letterSpacing: '-1px', marginBottom: '16px', lineHeight: 1.1
                    }}>
                        {t('faq.heading')} <span className="text-gradient">{t('faq.headingHighlight')}</span>
                    </h1>
                    <p style={{ fontFamily: 'Poppins, sans-serif', color: '#bbb', fontSize: '16px', lineHeight: 1.6, maxWidth: '600px' }}>
                        {t('faq.subtext')}
                    </p>
                    <p style={{ fontFamily: 'Poppins, sans-serif', color: '#555', fontSize: '13px', marginTop: '12px' }}>
                        {t('faq.lastUpdated')}
                    </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
                    {faqData.map((section, idx) => (
                        <div key={idx}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                                <div style={{
                                    width: '40px', height: '40px', borderRadius: '12px',
                                    background: 'rgba(255,45,120,0.1)', border: '1px solid rgba(255,45,120,0.2)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    {section.icon}
                                </div>
                                <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '22px', color: '#fff' }}>
                                    {section.category}
                                </h2>
                            </div>

                            <div>
                                {section.questions.map((faq, fIdx) => (
                                    <AccordionItem key={fIdx} q={faq.q} a={faq.a} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Info Card */}
                <div style={{ marginTop: '48px', padding: '24px', background: 'rgba(255,45,120,0.05)', border: '1px solid rgba(255,45,120,0.15)', borderRadius: '16px', display: 'flex', gap: '16px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FileText size={18} color="#FFD166" />
                    </div>
                    <div>
                        <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '16px', color: '#fff', marginBottom: '6px' }}>{t('faq.stillHaveQuestions')}</h3>
                        <p style={{ fontFamily: 'Poppins, sans-serif', color: '#aaa', fontSize: '14px', lineHeight: 1.6 }}>{t('faq.stillHaveQuestionsText')}</p>
                    </div>
                </div>

                {/* Footer link back */}
                <div style={{ marginTop: '60px', padding: '40px 24px', background: 'rgba(255,45,120,0.04)', borderRadius: '24px', border: '1px solid rgba(255,45,120,0.1)' }}>
                    <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '20px', color: '#fff', marginBottom: '8px', textAlign: 'center' }}>{t('faq.morePolicies')}</h3>
                    <p style={{ fontFamily: 'Poppins, sans-serif', color: '#bbb', fontSize: '14px', marginBottom: '24px', textAlign: 'center' }}>{t('faq.morePoliciesText')}</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                        <Link href="/policy" className="btn-outline" style={{ display: 'flex', justifyContent: 'center', padding: '12px', fontSize: '14px' }}>{t('faq.studioPolicies')}</Link>
                        <Link href="/waiver" className="btn-outline" style={{ display: 'flex', justifyContent: 'center', padding: '12px', fontSize: '14px' }}>{t('faq.liabilityWaiver')}</Link>
                        <Link href="/terms" className="btn-outline" style={{ display: 'flex', justifyContent: 'center', padding: '12px', fontSize: '14px' }}>{t('faq.termsConditions')}</Link>
                        <Link href="/privacy" className="btn-outline" style={{ display: 'flex', justifyContent: 'center', padding: '12px', fontSize: '14px' }}>{t('faq.privacyPolicy')}</Link>
                    </div>
                </div>

            </div>
        </div>
    );
}
