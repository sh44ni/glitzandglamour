import { prisma } from '@/lib/prisma';
import ReviewForm from './ReviewForm';
import Link from 'next/link';
import { Star } from 'lucide-react';

export default async function LeaveReviewFormPage({ params }: { params: { token: string } }) {
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
        // Fallback to true so the client form handles the error
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
        <div style={{ maxWidth: '600px', margin: '40px auto', padding: '0 24px' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <h1 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '28px', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>
                    Leave a Review
                </h1>
                <p style={{ color: '#ccc', fontSize: '15px' }}>
                    Share your experience with Glitz & Glamour Studio.
                </p>
            </div>

            <div style={{ 
                background: 'rgba(255,255,255,0.02)', 
                border: '1px solid rgba(255,255,255,0.08)', 
                borderRadius: '24px', 
                padding: '32px'
            }}>
                <ReviewForm token={params.token} initialName={clientName} />
            </div>
        </div>
    );
}
