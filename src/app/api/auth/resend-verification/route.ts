import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
        if (user.emailVerified) return NextResponse.json({ error: 'Already verified' }, { status: 400 });

        const verificationToken = crypto.randomUUID();

        await prisma.user.update({
            where: { id: user.id },
            data: { verificationToken },
        });

        await sendVerificationEmail(user.id, user.email, user.name, verificationToken);

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error('[resend-verification] error:', e);
        return NextResponse.json({ error: 'Failed to send email. Try again.' }, { status: 500 });
    }
}
