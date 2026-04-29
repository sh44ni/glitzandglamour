import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdminRequest } from '@/lib/adminAuth';

const MAX_GALLERY = 12;

export async function GET(req: NextRequest) {
    const isAdmin = await isAdminRequest(req);
    try {
        const photos = await prisma.specialEventGalleryPhoto.findMany({
            orderBy: { order: 'asc' },
        });
        return NextResponse.json({ photos });
    } catch {
        return NextResponse.json({ error: 'Failed to fetch gallery.' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    if (!(await isAdminRequest(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try {
        const count = await prisma.specialEventGalleryPhoto.count();
        if (count >= MAX_GALLERY) {
            return NextResponse.json({ error: `Maximum ${MAX_GALLERY} gallery photos allowed.` }, { status: 400 });
        }
        const { url, title = '', description = '' } = await req.json();
        const maxOrder = await prisma.specialEventGalleryPhoto.findFirst({ orderBy: { order: 'desc' }, select: { order: true } });
        const photo = await prisma.specialEventGalleryPhoto.create({
            data: { url, title, description, order: (maxOrder?.order ?? -1) + 1 },
        });
        return NextResponse.json({ photo }, { status: 201 });
    } catch (e: any) {
        return NextResponse.json({ error: e.message || 'Failed to create.' }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    if (!(await isAdminRequest(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try {
        const { id, title, description, order } = await req.json();
        const photo = await prisma.specialEventGalleryPhoto.update({
            where: { id },
            data: { title, description, ...(order !== undefined && { order }) },
        });
        return NextResponse.json({ photo });
    } catch (e: any) {
        return NextResponse.json({ error: e.message || 'Failed to update.' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    if (!(await isAdminRequest(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
        await prisma.specialEventGalleryPhoto.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: 'Failed to delete.' }, { status: 500 });
    }
}
