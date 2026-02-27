import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

async function checkAdmin() {
    const session = await auth();
    const role = (session?.user as { role?: string })?.role;
    return role === 'ADMIN';
}

// GET: Retrieve all slider images sorted by order
export async function GET() {
    try {
        const images = await prisma.sliderImage.findMany({
            orderBy: { order: 'asc' },
        });
        return NextResponse.json({ images });
    } catch (e) {
        return NextResponse.json({ error: 'Failed to fetch slider images.' }, { status: 500 });
    }
}

// POST: Save a newly uploaded image URL
export async function POST(req: NextRequest) {
    if (!(await checkAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { url } = await req.json();
        if (!url) return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });

        // Get the current highest order
        const maxOrderRef = await prisma.sliderImage.findFirst({
            orderBy: { order: 'desc' },
            select: { order: true },
        });
        const nextOrder = maxOrderRef ? maxOrderRef.order + 1 : 0;

        const image = await prisma.sliderImage.create({
            data: { url, order: nextOrder },
        });

        return NextResponse.json({ image });
    } catch (e) {
        return NextResponse.json({ error: 'Failed to save slider image.' }, { status: 500 });
    }
}

// DELETE: Remove an image
export async function DELETE(req: NextRequest) {
    if (!(await checkAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

        await prisma.sliderImage.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: 'Failed to delete slider image.' }, { status: 500 });
    }
}
