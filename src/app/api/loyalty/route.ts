import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: {
                loyaltyCard: {
                    include: {
                        stamps: { orderBy: { earnedAt: 'desc' } },
                    },
                },
            },
        });

        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        return NextResponse.json({ loyaltyCard: user.loyaltyCard });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch loyalty card' }, { status: 500 });
    }
}
