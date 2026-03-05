import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { updateGoogleWalletPass } from '@/lib/wallet';

async function checkAdmin() {
    const session = await auth();
    return (session?.user as { role?: string })?.role === 'ADMIN';
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

        updateGoogleWalletPass(loyaltyCard.id, newStampCount).catch(console.error);

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

        updateGoogleWalletPass(loyaltyCard.id, 0).catch(console.error);

        return NextResponse.json({ success: true, message: 'Spin redeemed, card reset' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}

export async function DELETE(req: NextRequest) {
    if (!(await checkAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { searchParams } = new URL(req.url);
        const customerId = searchParams.get('id');

        if (!customerId) {
            return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({ where: { id: customerId } });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        await prisma.$transaction(async (tx) => {
            // 1. Delete user's reviews
            await tx.review.deleteMany({ where: { userId: customerId } });

            // 2. Delete notification logs for user's bookings
            const bookings = await tx.booking.findMany({ where: { userId: customerId }, select: { id: true } });
            const bookingIds = bookings.map(b => b.id);
            if (bookingIds.length > 0) {
                await tx.notificationLog.deleteMany({ where: { bookingId: { in: bookingIds } } });
            }

            // 3. Delete user's bookings
            await tx.booking.deleteMany({ where: { userId: customerId } });

            // 4. Delete loyalty card and its stamps
            const card = await tx.loyaltyCard.findUnique({ where: { userId: customerId }, select: { id: true } });
            if (card) {
                await tx.stamp.deleteMany({ where: { loyaltyCardId: card.id } });
                await tx.loyaltyCard.delete({ where: { id: card.id } });
            }

            // 5. Finally, delete the user
            await tx.user.delete({ where: { id: customerId } });
        });

        return NextResponse.json({ success: true, message: 'Customer deleted successfully' });
    } catch (error) {
        console.error('Error deleting customer:', error);
        return NextResponse.json({ error: 'Failed to delete customer' }, { status: 500 });
    }
}
