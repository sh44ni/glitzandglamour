import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdminRequest } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// ── helpers ──────────────────────────────────────────────────────────────────

function isActiveBlock(block: { liftedAt: Date | null; expiresAt: Date | null }) {
    if (block.liftedAt) return false;
    if (block.expiresAt && block.expiresAt < new Date()) return false;
    return true;
}

// ── GET — list all blocks ─────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
    if (!(await isAdminRequest(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const filter = searchParams.get('filter') || 'all'; // active | lifted | all
    const q = (searchParams.get('q') || '').trim();

    const blocks = await (prisma as any).clientBlock.findMany({
        include: {
            user: {
                select: { id: true, name: true, email: true, phone: true, image: true },
            },
            logs: {
                orderBy: { createdAt: 'desc' },
            },
        },
        orderBy: { createdAt: 'desc' },
    });

    // Filter by active/lifted
    let filtered = blocks.filter((b: any) => {
        if (filter === 'active') return isActiveBlock(b);
        if (filter === 'lifted') return !isActiveBlock(b);
        return true;
    });

    // Search
    if (q) {
        const lq = q.toLowerCase();
        filtered = filtered.filter((b: any) =>
            b.user.name?.toLowerCase().includes(lq) ||
            b.user.email?.toLowerCase().includes(lq) ||
            b.user.phone?.toLowerCase().includes(lq) ||
            b.reason?.toLowerCase().includes(lq)
        );
    }

    const activeCount = blocks.filter((b: any) => isActiveBlock(b)).length;

    return NextResponse.json({ blocks: filtered, totalCount: blocks.length, activeCount });
}

// ── POST — create a block ─────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
    if (!(await isAdminRequest(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { userId, reason, timeoutDays, adminNote } = body;

    if (!userId || !reason?.trim()) {
        return NextResponse.json({ error: 'userId and reason are required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const days = parseInt(timeoutDays, 10) || 0;
    const expiresAt = days > 0 ? new Date(Date.now() + days * 24 * 60 * 60 * 1000) : null;

    // Upsert: if a (possibly expired/lifted) block already exists, replace it
    const existing = await (prisma as any).clientBlock.findUnique({ where: { userId } });

    let block: any;
    if (existing) {
        block = await (prisma as any).clientBlock.update({
            where: { userId },
            data: {
                reason: reason.trim(),
                timeoutDays: days,
                expiresAt,
                liftedAt: null,
                liftedBy: null,
                liftReason: null,
            },
        });
    } else {
        block = await (prisma as any).clientBlock.create({
            data: {
                userId,
                reason: reason.trim(),
                timeoutDays: days,
                expiresAt,
            },
        });
    }

    // Audit log
    await (prisma as any).blockLog.create({
        data: {
            blockId: block.id,
            action: 'blocked',
            reason: reason.trim(),
            adminNote: adminNote?.trim() || null,
        },
    });

    return NextResponse.json({ success: true, block });
}

// ── PATCH — lift or edit a block ──────────────────────────────────────────────
export async function PATCH(req: NextRequest) {
    if (!(await isAdminRequest(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { blockId, action, liftReason, reason, timeoutDays, adminNote } = body;

    if (!blockId) return NextResponse.json({ error: 'blockId is required' }, { status: 400 });

    const block = await (prisma as any).clientBlock.findUnique({ where: { id: blockId } });
    if (!block) return NextResponse.json({ error: 'Block not found' }, { status: 404 });

    if (action === 'lift') {
        if (!liftReason?.trim()) {
            return NextResponse.json({ error: 'liftReason is required' }, { status: 400 });
        }
        const updated = await (prisma as any).clientBlock.update({
            where: { id: blockId },
            data: {
                liftedAt: new Date(),
                liftedBy: 'Admin',
                liftReason: liftReason.trim(),
            },
        });
        await (prisma as any).blockLog.create({
            data: {
                blockId,
                action: 'lifted',
                reason: liftReason.trim(),
                adminNote: adminNote?.trim() || null,
            },
        });
        return NextResponse.json({ success: true, block: updated });
    }

    if (action === 'edit') {
        if (!reason?.trim()) return NextResponse.json({ error: 'reason is required' }, { status: 400 });
        const days = parseInt(timeoutDays, 10) || 0;
        const expiresAt = days > 0 ? new Date(Date.now() + days * 24 * 60 * 60 * 1000) : null;
        const updated = await (prisma as any).clientBlock.update({
            where: { id: blockId },
            data: { reason: reason.trim(), timeoutDays: days, expiresAt },
        });
        await (prisma as any).blockLog.create({
            data: {
                blockId,
                action: 'edited',
                reason: reason.trim(),
                adminNote: adminNote?.trim() || null,
            },
        });
        return NextResponse.json({ success: true, block: updated });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}

// ── DELETE — hard delete a block record ────────────────────────────────────────
export async function DELETE(req: NextRequest) {
    if (!(await isAdminRequest(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const blockId = searchParams.get('id');
    if (!blockId) return NextResponse.json({ error: 'Block ID is required' }, { status: 400 });

    await (prisma as any).clientBlock.delete({ where: { id: blockId } });
    return NextResponse.json({ success: true });
}
