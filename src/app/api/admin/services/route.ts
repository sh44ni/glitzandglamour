import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

async function checkAdmin() {
    const session = await auth();
    return (session?.user as { role?: string })?.role === 'ADMIN';
}

export async function GET() {
    if (!(await checkAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const services = await prisma.service.findMany({ orderBy: { displayOrder: 'asc' } });
    return NextResponse.json({ services });
}

export async function POST(req: NextRequest) {
    if (!(await checkAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const data = await req.json();
    const service = await prisma.service.create({ data });
    return NextResponse.json({ service }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
    if (!(await checkAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id, ...data } = await req.json();
    const service = await prisma.service.update({ where: { id }, data });
    return NextResponse.json({ service });
}

export async function DELETE(req: NextRequest) {
    if (!(await checkAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await req.json();
    await prisma.service.delete({ where: { id } });
    return NextResponse.json({ success: true });
}
