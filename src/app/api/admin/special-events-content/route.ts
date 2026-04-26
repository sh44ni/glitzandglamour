import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdminRequest } from '@/lib/adminAuth';

// GET: Retrieve all special event page content
export async function GET(req: NextRequest) {
    if (!(await isAdminRequest(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try {
        const [hero, heroImages, categories, services] = await Promise.all([
            prisma.specialEventHero.findFirst({ where: { isActive: true } }),
            prisma.specialEventHeroImage.findMany({ orderBy: { order: 'asc' } }),
            prisma.specialEventCategory.findMany({ orderBy: { displayOrder: 'asc' } }),
            prisma.specialEventService.findMany({ orderBy: { displayOrder: 'asc' } }),
        ]);
        return NextResponse.json({ hero, heroImages, categories, services });
    } catch {
        return NextResponse.json({ error: 'Failed to fetch content.' }, { status: 500 });
    }
}

// POST: Create a category, service, hero, or heroImage
export async function POST(req: NextRequest) {
    if (!(await isAdminRequest(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try {
        const { type, ...data } = await req.json();
        if (type === 'category') {
            const maxOrder = await prisma.specialEventCategory.findFirst({ orderBy: { displayOrder: 'desc' }, select: { displayOrder: true } });
            const item = await prisma.specialEventCategory.create({ data: { ...data, displayOrder: (maxOrder?.displayOrder ?? -1) + 1 } });
            return NextResponse.json({ item }, { status: 201 });
        }
        if (type === 'service') {
            const maxOrder = await prisma.specialEventService.findFirst({ orderBy: { displayOrder: 'desc' }, select: { displayOrder: true } });
            const item = await prisma.specialEventService.create({ data: { ...data, displayOrder: (maxOrder?.displayOrder ?? -1) + 1 } });
            return NextResponse.json({ item }, { status: 201 });
        }
        if (type === 'hero') {
            const existing = await prisma.specialEventHero.findFirst({ where: { isActive: true } });
            if (existing) {
                const item = await prisma.specialEventHero.update({ where: { id: existing.id }, data });
                return NextResponse.json({ item });
            }
            const item = await prisma.specialEventHero.create({ data });
            return NextResponse.json({ item }, { status: 201 });
        }
        if (type === 'heroImage') {
            // Check max 10
            const count = await prisma.specialEventHeroImage.count();
            if (count >= 10) return NextResponse.json({ error: 'Maximum 10 hero slider images allowed.' }, { status: 400 });
            const maxOrder = await prisma.specialEventHeroImage.findFirst({ orderBy: { order: 'desc' }, select: { order: true } });
            const item = await prisma.specialEventHeroImage.create({ data: { url: data.url, order: (maxOrder?.order ?? -1) + 1 } });
            return NextResponse.json({ item }, { status: 201 });
        }
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    } catch (e: any) {
        return NextResponse.json({ error: e.message || 'Failed to create.' }, { status: 500 });
    }
}

// PATCH: Update a category, service, or hero
export async function PATCH(req: NextRequest) {
    if (!(await isAdminRequest(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try {
        const { type, id, ...data } = await req.json();
        if (type === 'category') {
            const item = await prisma.specialEventCategory.update({ where: { id }, data });
            return NextResponse.json({ item });
        }
        if (type === 'service') {
            const item = await prisma.specialEventService.update({ where: { id }, data });
            return NextResponse.json({ item });
        }
        if (type === 'hero') {
            const item = await prisma.specialEventHero.update({ where: { id }, data });
            return NextResponse.json({ item });
        }
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    } catch (e: any) {
        return NextResponse.json({ error: e.message || 'Failed to update.' }, { status: 500 });
    }
}

// DELETE: Remove a category, service, or heroImage
export async function DELETE(req: NextRequest) {
    if (!(await isAdminRequest(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try {
        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type');
        const id = searchParams.get('id');
        if (!type || !id) return NextResponse.json({ error: 'type and id required' }, { status: 400 });
        if (type === 'category') {
            await prisma.specialEventCategory.delete({ where: { id } });
        } else if (type === 'service') {
            await prisma.specialEventService.delete({ where: { id } });
        } else if (type === 'heroImage') {
            await prisma.specialEventHeroImage.delete({ where: { id } });
        } else {
            return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
        }
        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: 'Failed to delete.' }, { status: 500 });
    }
}
