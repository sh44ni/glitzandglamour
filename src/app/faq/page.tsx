'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronDown, Sparkles, Scissors, Sun, Eye, FileText } from 'lucide-react';

const faqData = [
  {
    category: "Nails & Pedicures",
    icon: <Sparkles size={20} color="#FF2D78" />,
    questions: [
      {
        q: "What is the difference between Gel & Acrylic?",
        a: "Gel polish is cured under a UV/LED lamp and can last 2–3 weeks with a glossy finish. Acrylics are an extension applied over your natural nail for added length and strength, and are great if you want a dramatic look or struggle with nail growth."
      },
      {
        q: "How long does a manicure or pedicure take?",
        a: "A basic manicure typically takes about 30–45 minutes, while a pedicure can take 45–60 minutes. If you're adding gel, acrylics, or nail art, plan for a little extra time!"
      },
      {
        q: "How often should I get a fill for my acrylics?",
        a: "We recommend regular two- to three-week fills to keep your natural nails healthy, prevent lifting, and maintain the structural integrity of the extension."
      }
    ]
  },
  {
    category: "Hair Styling",
    icon: <Scissors size={20} color="#FF2D78" />,
    questions: [
      {
        q: "How long will my blowout last?",
        a: "A professional blowout typically lasts 3–5 days depending on your hair type, activity level, and how you care for it. To extend your blowout, sleep on a silk pillowcase, avoid humidity, and use a dry shampoo at the roots as needed."
      },
      {
        q: "Do I need to wash my hair before my appointment?",
        a: "If you're coming in for a formal up-do or dry styling, day-old unwashed hair usually holds pins and texture best. For standard cuts, blowouts, or color, we will wash it for you."
      }
    ]
  },
  {
    category: "Waxing",
    icon: <Sun size={20} color="#FF2D78" />,
    questions: [
      {
        q: "What do I wear for my wax appointment?",
        a: "We recommend wearing loose, comfortable clothing (preferably cotton) to avoid friction or irritation on the freshly waxed skin after your appointment."
      },
      {
        q: "Should I shave before my waxing appointment?",
        a: "No! Please let the hair grow out. Hair needs to be at least 1/4 inch long (about the size of a grain of rice) so the wax can properly grip and remove it."
      },
      {
        q: "Can I get waxed if I am using skincare medications?",
        a: "No. You must be off Accutane for at least 6 months, and off topical retinoids (Retin-A, Differin, AHAs/BHAs) for at least 5-7 days prior to waxing to prevent skin lifting or tearing."
      }
    ]
  },
  {
    category: "Lashes & Facials",
    icon: <Eye size={20} color="#FF2D78" />,
    questions: [
      {
        q: "How do I prepare for my lash appointment?",
        a: "Please arrive completely makeup-free around the eye area. Do not wear mascara, eyeliner, or use heavy oil-based eye creams prior to your appointment. A $15 makeup removal fee applies if deep cleaning is required."
      },
      {
        q: "How often do I need a lash fill?",
        a: "To maintain a full look, we recommend coming in every 2 to 3 weeks. You must have at least 40% of your extensions remaining to qualify for a fill; otherwise it requires a full set."
      },
      {
        q: "Will my face be red after a facial?",
        a: "Some mild pinkness is completely normal (especially if extractions were performed or active enzymes used) and usually subsides within a few hours. We always ensure you leave with soothing products and SPF!"
      }
    ]
  }
];

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
                        <ChevronLeft size={16} /> Back to Home
                    </Link>

                    <h1 style={{
                        fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 'clamp(2.4rem, 5vw, 3.5rem)',
                        letterSpacing: '-1px', marginBottom: '16px', lineHeight: 1.1
                    }}>
                        Frequently Asked <span className="text-gradient">Questions</span>
                    </h1>
                    <p style={{ fontFamily: 'Poppins, sans-serif', color: '#bbb', fontSize: '16px', lineHeight: 1.6, maxWidth: '600px' }}>
                        Everything you need to know before your appointment at Glitz &amp; Glamour Studio.
                    </p>
                    <p style={{ fontFamily: 'Poppins, sans-serif', color: '#555', fontSize: '13px', marginTop: '12px' }}>
                        Last Updated: April 2026
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
                        <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '16px', color: '#fff', marginBottom: '6px' }}>Still have questions?</h3>
                        <p style={{ fontFamily: 'Poppins, sans-serif', color: '#aaa', fontSize: '14px', lineHeight: 1.6 }}>If you couldn't find the answer you were looking for, please refer to our thorough Studio Policies or contact us directly.</p>
                    </div>
                </div>

                {/* Footer link back */}
                <div style={{ marginTop: '60px', padding: '40px 24px', background: 'rgba(255,45,120,0.04)', borderRadius: '24px', border: '1px solid rgba(255,45,120,0.1)' }}>
                    <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '20px', color: '#fff', marginBottom: '8px', textAlign: 'center' }}>More Studio Policies</h3>
                    <p style={{ fontFamily: 'Poppins, sans-serif', color: '#bbb', fontSize: '14px', marginBottom: '24px', textAlign: 'center' }}>Explore our other policies and guidelines below.</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                        <Link href="/policy" className="btn-outline" style={{ display: 'flex', justifyContent: 'center', padding: '12px', fontSize: '14px' }}>Studio Policies</Link>
                        <Link href="/waiver" className="btn-outline" style={{ display: 'flex', justifyContent: 'center', padding: '12px', fontSize: '14px' }}>Liability Waiver</Link>
                        <Link href="/terms" className="btn-outline" style={{ display: 'flex', justifyContent: 'center', padding: '12px', fontSize: '14px' }}>Terms &amp; Conditions</Link>
                        <Link href="/privacy" className="btn-outline" style={{ display: 'flex', justifyContent: 'center', padding: '12px', fontSize: '14px' }}>Privacy Policy</Link>
                    </div>
                </div>

            </div>
        </div>
    );
}
