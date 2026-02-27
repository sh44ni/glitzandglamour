import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
    const token = req.nextUrl.searchParams.get('token');

    if (!token) {
        return NextResponse.redirect(new URL('/sign-in?error=invalid-token', req.url));
    }

    try {
        const user = await prisma.user.findUnique({ where: { verificationToken: token } });

        if (!user) {
            return NextResponse.redirect(new URL('/sign-in?error=invalid-token', req.url));
        }

        await prisma.user.update({
            where: { id: user.id },
            data: {
                emailVerified: new Date(),
                verificationToken: null,
            },
        });

        return NextResponse.redirect(new URL('/sign-in?verified=true', req.url));
    } catch (e) {
        console.error('[verify-email] error:', e);
        return NextResponse.redirect(new URL('/sign-in?error=server-error', req.url));
    }
}
