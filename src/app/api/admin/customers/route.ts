import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

async function checkAdmin() {
    const session = await auth();
    return (session?.user as { role?: string })?.role === 'ADMIN';
}

export async function GET() {
    if (!(await checkAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const customers = await prisma.user.findMany({
        include: {
            loyaltyCard: {
                include: { stamps: { orderBy: { earnedAt: 'desc' } } },
            },
            bookings: {
                include: { service: { select: { name: true } } },
                orderBy: { createdAt: 'desc' },
                take: 5,
            },
            _count: { select: { bookings: true } },
        },
        orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ customers });
}

export async function POST(req: NextRequest) {
    if (!(await checkAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { customerId, action, note } = await req.json();

    const user = await prisma.user.findUnique({ where: { id: customerId } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    let loyaltyCard = await prisma.loyaltyCard.findUnique({ where: { userId: customerId } });
    if (!loyaltyCard) {
        loyaltyCard = await prisma.loyaltyCard.create({ data: { userId: customerId } });
    }

    if (action === 'add-stamp') {
        const newStampCount = loyaltyCard.currentStamps + 1;
        const spinAvailable = newStampCount >= 10;

        await prisma.loyaltyCard.update({
            where: { id: loyaltyCard.id },
            data: {
                currentStamps: newStampCount,
                lifetimeStamps: loyaltyCard.lifetimeStamps + 1,
                spinAvailable: spinAvailable || loyaltyCard.spinAvailable,
            },
        });

        await prisma.stamp.create({
            data: { loyaltyCardId: loyaltyCard.id, note: note || 'Manual stamp by admin' },
        });

        return NextResponse.json({ success: true, message: 'Stamp added' });
    }

    if (action === 'redeem-spin') {
        if (!loyaltyCard.spinAvailable) {
            return NextResponse.json({ error: 'No spin available' }, { status: 400 });
        }

        await prisma.loyaltyCard.update({
            where: { id: loyaltyCard.id },
            data: {
                currentStamps: 0,
                spinAvailable: false,
                spinsRedeemed: loyaltyCard.spinsRedeemed + 1,
            },
        });

        return NextResponse.json({ success: true, message: 'Spin redeemed, card reset' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
