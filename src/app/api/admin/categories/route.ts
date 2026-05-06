import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdminRequest } from '@/lib/adminAuth';

export async function GET(req: NextRequest) {
    if (!(await isAdminRequest(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const categories = await prisma.serviceCategory.findMany({ orderBy: { order: 'asc' } });
    return NextResponse.json({ categories });
}

export async function PATCH(req: NextRequest) {
    if (!(await isAdminRequest(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id, ...data } = await req.json();
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    const category = await prisma.serviceCategory.update({ where: { id }, data });
    return NextResponse.json({ category });
}
