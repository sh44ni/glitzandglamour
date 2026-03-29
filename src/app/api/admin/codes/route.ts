import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/adminAuth';
import { validateDiscountCode, redeemDiscountCode } from '@/lib/discountCodes';
import { prisma } from '@/lib/prisma';

// GET /api/admin/codes — list all discount codes
export async function GET(req: NextRequest) {
    if (!(await isAdminRequest(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('q') || '';
    const filter = searchParams.get('filter') || 'all'; // 'all' | 'active' | 'used'

    const where: any = {};
    if (filter === 'active') where.isUsed = false;
    if (filter === 'used') where.isUsed = true;
    if (search) {
        where.OR = [
            { code: { contains: search.toUpperCase() } },
            { customerName: { contains: search, mode: 'insensitive' } },
        ];
    }

    const codes = await (prisma as any).discountCode.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
            booking: {
                include: {
                    service: { select: { name: true } },
                    user: { select: { name: true, email: true } },
                },
            },
        },
        take: 100,
    });

    const total = await (prisma as any).discountCode.count({ where });
    const activeCount = await (prisma as any).discountCode.count({ where: { isUsed: false } });
    const usedCount = await (prisma as any).discountCode.count({ where: { isUsed: true } });

    return NextResponse.json({ codes, total, activeCount, usedCount });
}

// POST /api/admin/codes — validate a code (no side effects)
export async function POST(req: NextRequest) {
    if (!(await isAdminRequest(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { code } = await req.json();
    if (!code) return NextResponse.json({ error: 'code is required' }, { status: 400 });

    const result = await validateDiscountCode(code);
    return NextResponse.json(result);
}

// PATCH /api/admin/codes — redeem a code (marks as used)
export async function PATCH(req: NextRequest) {
    if (!(await isAdminRequest(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { code } = await req.json();
    if (!code) return NextResponse.json({ error: 'code is required' }, { status: 400 });

    const result = await redeemDiscountCode(code);
    if (!result.success) {
        const msg = result.error === 'not_found' ? 'Code not found' : 'Code has already been redeemed';
        return NextResponse.json({ error: msg }, { status: result.error === 'not_found' ? 404 : 409 });
    }

    return NextResponse.json({ success: true, message: 'Code redeemed successfully' });
}
