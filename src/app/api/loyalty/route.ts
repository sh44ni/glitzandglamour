import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { getMobileOrWebUser } from '@/lib/mobileAuth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        const mobileUser = await getMobileOrWebUser(req, session?.user?.email);
        if (!mobileUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const user = await prisma.user.findUnique({
            where: { id: mobileUser.id },
            include: {
                loyaltyCard: {
                    include: {
                        stamps: { orderBy: { earnedAt: 'desc' } },
                    },
                },
            },
        });

        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        const card = user.loyaltyCard;

        let referralStats = null;
        if (card) {
            const referrals = await (prisma as any).referral.findMany({
                where: { referrerId: card.id },
            });
            referralStats = {
                totalReferrals: referrals.length,
                pendingRewards: referrals.filter((r: any) => !r.rewardGiven).length,
                completedReferrals: referrals.filter((r: any) => r.rewardGiven).length,
            };
        }

        return NextResponse.json({
            loyaltyCard: card ? { ...card, referralStats } : null,
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch loyalty card' }, { status: 500 });
    }
}
