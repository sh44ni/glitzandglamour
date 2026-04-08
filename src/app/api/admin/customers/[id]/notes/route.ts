import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdminRequest } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  const notes = await (prisma as any).customerNote.findMany({
    where: { userId: id },
    orderBy: { createdAt: 'desc' },
    select: { id: true, text: true, imageUrl: true, createdAt: true },
    take: 50,
  });

  return NextResponse.json({ notes });
}

