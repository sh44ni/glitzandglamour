import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const { token, name, rating, text, imageUrls, authorAvatar } = await req.json();

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
                imageUrls: imageUrls ? JSON.stringify(imageUrls) : null,
                authorAvatar: authorAvatar || null,
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
