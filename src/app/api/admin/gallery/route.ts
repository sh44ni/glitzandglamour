import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

async function checkAdmin() {
    const session = await auth();
    const role = (session?.user as { role?: string })?.role;
    return role === 'ADMIN';
}

// POST: Save a newly uploaded gallery image URL and its comma-separated tags
export async function POST(req: NextRequest) {
    if (!(await checkAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { url, tags } = await req.json();
        if (!url) return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });

        const image = await prisma.galleryImage.create({
            data: {
                url,
                tags: tags || ""
            },
        });

        return NextResponse.json({ image });
    } catch (e) {
        return NextResponse.json({ error: 'Failed to save gallery image.' }, { status: 500 });
    }
}

// DELETE: Remove a gallery image
export async function DELETE(req: NextRequest) {
    if (!(await checkAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

        await prisma.galleryImage.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: 'Failed to delete gallery image.' }, { status: 500 });
    }
}
