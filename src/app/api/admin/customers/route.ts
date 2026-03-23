import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdminRequest } from '@/lib/adminAuth';
import { updateGoogleWalletPass } from '@/lib/wallet';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
    if (!(await isAdminRequest(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const customers = await (prisma as any).user.findMany({
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            image: true,
            dateOfBirth: true,
            createdAt: true,
            googleId: true,
            appleId: true,
            password: true,
            loyaltyCard: {
                include: { stamps: { orderBy: { earnedAt: 'desc' } } },
            },
            bookings: {
                include: { service: { select: { name: true } } },
                orderBy: { createdAt: 'desc' },
                take: 5,
            },
            notes: { orderBy: { createdAt: 'desc' } },
            _count: { select: { bookings: true } },
        },
        orderBy: { createdAt: 'desc' },
    });

    // Attach referral stats to each customer's loyalty card
    const customersWithReferrals = await Promise.all(
        customers.map(async (c: any) => {
            if (!c.loyaltyCard) return c;
            const referrals = await (prisma as any).referral.findMany({
                where: { referrerId: c.loyaltyCard.id },
            });
            return {
                ...c,
                loyaltyCard: {
                    ...c.loyaltyCard,
                    referralStats: {
                        totalReferrals: referrals.length,
                        pendingRewards: referrals.filter((r: any) => !r.rewardGiven).length,
                        completedReferrals: referrals.filter((r: any) => r.rewardGiven).length,
                    },
                },
            };
        })
    );

    return NextResponse.json({ customers: customersWithReferrals });
}

export async function POST(req: NextRequest) {
    if (!(await isAdminRequest(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { customerId, action, note } = body;

    // ── set-dob ─────────────────────────────────────────────────────
    if (action === 'set-dob') {
        const { dob } = body;
        if (!dob) return NextResponse.json({ error: 'Date of birth is required' }, { status: 400 });
        await (prisma as any).user.update({
            where: { id: customerId },
            data: { dateOfBirth: new Date(dob) },
        });
        return NextResponse.json({ success: true });
    }

    // ── Note actions (no loyaltyCard needed) ──────────────────────
    if (action === 'add-note') {
        const { noteText, imageUrl } = body;
        if (!noteText?.trim()) return NextResponse.json({ error: 'Note text is required' }, { status: 400 });
        const created = await (prisma as any).customerNote.create({
            data: { userId: customerId, text: noteText.trim(), imageUrl: imageUrl || null },
        });
        return NextResponse.json({ success: true, note: created });
    }

    if (action === 'delete-note') {
        const { noteId } = body;
        if (!noteId) return NextResponse.json({ error: 'Note ID is required' }, { status: 400 });
        await (prisma as any).customerNote.delete({ where: { id: noteId } });
        return NextResponse.json({ success: true });
    }

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
            return NextResponse.json({ error: 'No nail set reward available' }, { status: 400 });
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

        return NextResponse.json({ success: true, message: 'Free nail set redeemed, card reset' });
    }

    if (action === 'redeem-birthday-spin') {
        const hasSpin = (loyaltyCard as any).birthdaySpinAvailable;
        if (!hasSpin) {
            return NextResponse.json({ error: 'No birthday spin available' }, { status: 400 });
        }
        await (prisma as any).loyaltyCard.update({
            where: { id: loyaltyCard.id },
            data: { birthdaySpinAvailable: false },
        });
        return NextResponse.json({ success: true, message: 'Birthday spin redeemed' });
    }

    // ── Insider toggle ─────────────────────────────────────────────
    if (action === 'grant-insider' || action === 'revoke-insider') {
        const isInsider = action === 'grant-insider';

        let referralCode = (loyaltyCard as any).referralCode;

        if (isInsider && !referralCode) {
            const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
            let code = 'GLAM-';
            for (let i = 0; i < 6; i++) {
                code += chars[Math.floor(Math.random() * chars.length)];
            }
            referralCode = code;
        }

        await (prisma as any).loyaltyCard.update({
            where: { id: loyaltyCard.id },
            data: { isInsider, ...(isInsider ? { referralCode } : {}) },
        });

        return NextResponse.json({
            success: true,
            message: isInsider ? 'Insider status granted' : 'Insider status revoked',
            referralCode: isInsider ? referralCode : null,
        });
    }

    if (action === 'redeem-reward') {
        const currentRewards = (loyaltyCard as any).referralRewards ?? 0;
        if (currentRewards <= 0) {
            return NextResponse.json({ error: 'No rewards to redeem' }, { status: 400 });
        }
        await (prisma as any).loyaltyCard.update({
            where: { id: loyaltyCard.id },
            data: { referralRewards: currentRewards - 1 },
        });
        return NextResponse.json({ success: true, message: 'Reward redeemed' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}

export async function DELETE(req: NextRequest) {
    if (!(await isAdminRequest(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

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
            await tx.review.deleteMany({ where: { userId: customerId } });

            const bookings = await tx.booking.findMany({ where: { userId: customerId }, select: { id: true } });
            const bookingIds = bookings.map(b => b.id);
            if (bookingIds.length > 0) {
                await tx.notificationLog.deleteMany({ where: { bookingId: { in: bookingIds } } });
            }

            await tx.booking.deleteMany({ where: { userId: customerId } });

            const card = await tx.loyaltyCard.findUnique({ where: { userId: customerId }, select: { id: true } });
            if (card) {
                await tx.stamp.deleteMany({ where: { loyaltyCardId: card.id } });
                await (tx as any).referral.deleteMany({ where: { referrerId: card.id } });
                await tx.loyaltyCard.delete({ where: { id: card.id } });
            }
            // Cascade delete customer notes
            await (tx as any).customerNote.deleteMany({ where: { userId: customerId } });
            await (tx as any).user.updateMany({ where: { referredById: customerId }, data: { referredById: null } });
            await tx.user.delete({ where: { id: customerId } });
        });

        return NextResponse.json({ success: true, message: 'Customer deleted successfully' });
    } catch (error) {
        console.error('Error deleting customer:', error);
        return NextResponse.json({ error: 'Failed to delete customer' }, { status: 500 });
    }
}
