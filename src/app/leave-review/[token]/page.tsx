import Link from 'next/link';
import { Gift, Star, Award, ChevronRight } from 'lucide-react';
import prisma from '@/lib/prisma';

export default async function LeaveReviewLanding({ params }: { params: { token: string } }) {
    // We can retrieve the review request to check if it's already used or valid.
    let isValid = false;
    let isUsed = false;
    let clientName = '';

    try {
        const reqDb = await (prisma as any).reviewRequest.findUnique({
            where: { token: params.token }
        });
        if (reqDb) {
            isValid = true;
            isUsed = reqDb.isUsed;
            clientName = reqDb.clientName;
        }
    } catch(e) {
        console.error(e);
        // Fallback to true so the client form handles the error if DB is down
        isValid = true; 
    }

    if (!isValid) {
        return (
            <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <h1 style={{ fontSize: '24px', color: '#ff4444', marginBottom: '16px' }}>Invalid Link</h1>
                <p>This review link does not exist or is malformed.</p>
                <Link href="/" className="btn-primary" style={{ marginTop: '24px' }}>Return Home</Link>
            </div>
        );
    }

    if (isUsed) {
        return (
            <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', textAlign: 'center', padding: '24px' }}>
                <div style={{ background: 'rgba(255,45,120,0.1)', padding: '24px', borderRadius: '50%', marginBottom: '24px' }}>
                    <Star size={48} color="#FF2D78" fill="#FF2D78" />
                </div>
                <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px' }}>Thanks for your review!</h1>
                <p style={{ color: '#aaa', maxWidth: '400px' }}>This link has already been used. We truly appreciate your feedback and support for Glitz & Glamour Studio! 💕</p>
                <Link href="/" className="btn-primary" style={{ marginTop: '32px' }}>Return Home</Link>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '600px', margin: '40px auto', padding: '0 24px', color: '#fff' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <h1 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '28px', fontWeight: 800, marginBottom: '8px' }}>
                    Hi {clientName ? clientName.split(' ')[0] : 'there'}! 👋
                </h1>
                <p style={{ color: '#ccc', fontSize: '15px', lineHeight: '1.6' }}>
                    Thank you again for visiting the studio. We'd love to hear about your experience! Before you leave a review, did you know you can unlock exclusive perks?
                </p>
            </div>

            <div style={{ 
                background: 'linear-gradient(145deg, rgba(255,45,120,0.1) 0%, rgba(200,40,150,0.05) 100%)', 
                border: '1px solid rgba(255,45,120,0.2)', 
                borderRadius: '24px', 
                padding: '32px 24px',
                marginBottom: '32px'
            }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#FF2D78', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Award size={20} /> Join Our Insider Club
                </h2>
                
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <li style={{ display: 'flex', gap: '12px' }}>
                        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '8px', borderRadius: '50%', height: '36px', width: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Star size={18} color="#FFD700" />
                        </div>
                        <div>
                            <strong style={{ display: 'block', fontSize: '15px' }}>Loyalty Card</strong>
                            <span style={{ color: '#aaa', fontSize: '13px' }}>Earn stamps on every visit for free services and rewards.</span>
                        </div>
                    </li>
                    <li style={{ display: 'flex', gap: '12px' }}>
                        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '8px', borderRadius: '50%', height: '36px', width: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Gift size={18} color="#FFD700" />
                        </div>
                        <div>
                            <strong style={{ display: 'block', fontSize: '15px' }}>Birthday Spin</strong>
                            <span style={{ color: '#aaa', fontSize: '13px' }}>Get a free spin on the prize wheel during your birthday month!</span>
                        </div>
                    </li>
                </ul>

                <div style={{ marginTop: '28px' }}>
                    <Link 
                        href={\`/sign-in?callbackUrl=/leave-review/\${params.token}/form\`}
                        style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            background: '#FF2D78', color: '#fff', padding: '16px 20px', 
                            borderRadius: '16px', textDecoration: 'none', fontWeight: 600,
                            boxShadow: '0 8px 16px rgba(255,45,120,0.25)'
                        }}
                    >
                        Sign Up & Leave Review
                        <ChevronRight size={18} />
                    </Link>
                </div>
            </div>

            <div style={{ textAlign: 'center' }}>
                <Link 
                    href={\`/leave-review/\${params.token}/form\`}
                    style={{
                        color: '#888', textDecoration: 'underline', fontSize: '14px', 
                        padding: '12px', display: 'inline-block'
                    }}
                >
                    I'm not interested, skip
                </Link>
            </div>
        </div>
    );
}
