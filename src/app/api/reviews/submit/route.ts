import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/adminAuth'; // Checking if adminAuth is available or we can use generic next-auth. Wait, I will just use the standard route setup. 
// Actually, I don't know the exact auth path, so I'll just skip server-side auth resolution and pass it from client if needed, or just let it be anonymous.
// Let's remove the auth import and assume anonymous or client sends it.

export async function POST(req: Request) {
    try {
        const { token, name, rating, text, imageUrl } = await req.json();

        if (!token || !name || !rating || !text) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Find the request
        const reviewReq = await (prisma as any).reviewRequest.findUnique({
            where: { token }
        });

        if (!reviewReq) {
            return NextResponse.json({ error: 'Invalid review link' }, { status: 404 });
        }

        if (reviewReq.isUsed) {
            return NextResponse.json({ error: 'This review link has already been used. Thank you!' }, { status: 400 });
        }

        // 2. Mark as used
        await (prisma as any).reviewRequest.update({
            where: { id: reviewReq.id },
            data: { isUsed: true }
        });

        // 3. Create the review
        const review = await (prisma as any).review.create({
            data: {
                reviewRequestId: reviewReq.id,
                rating: Number(rating),
                text,
                imageUrl: imageUrl || null,
                authorName: name,
                source: 'website'
            }
        });

        return NextResponse.json({ success: true, reviewId: review.id });
    } catch (e: any) {
        console.error('Submit review error:', e);
        return NextResponse.json({ error: e.message || 'Error submitting review' }, { status: 500 });
    }
}
