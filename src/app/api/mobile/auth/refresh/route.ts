import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyMobileToken, signMobileToken } from '@/lib/mobileAuth';

export async function POST(req: NextRequest) {
    try {
        const tokenPayload = await verifyMobileToken(req, 'refresh');
        if (!tokenPayload) {
            return NextResponse.json({ error: 'Invalid or expired refresh token.' }, { status: 401 });
        }

        // Confirm user still exists
        const user = await prisma.user.findUnique({
            where: { id: tokenPayload.sub },
            select: { id: true, email: true },
        });
        if (!user) {
            return NextResponse.json({ error: 'User not found.' }, { status: 401 });
        }

        const accessToken = await signMobileToken(
            { sub: user.id, email: user.email, type: 'access' },
            60 * 30,
        );

        return NextResponse.json({ accessToken });
    } catch (error) {
        console.error('[mobile/auth/refresh]', error);
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}
