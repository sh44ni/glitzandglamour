import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { jwtVerify } from 'jose';

function getJwtSecret() {
    const secret = process.env.MOBILE_JWT_SECRET || process.env.AUTH_SECRET;
    if (!secret) throw new Error('Missing MOBILE_JWT_SECRET');
    return new TextEncoder().encode(secret);
}

export async function POST(req: NextRequest) {
    try {
        const rl = rateLimit(getClientIp(req), 'mobile-reset-password', { limit: 5, windowMs: 60 * 60 * 1000 });
        if (!rl.ok) {
            return NextResponse.json(
                { error: 'Too many attempts. Please try again later.' },
                { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } },
            );
        }

        const body = await req.json().catch(() => ({}));
        const { email, newPassword, verificationToken } = body;

        if (!email || !newPassword || !verificationToken) {
            return NextResponse.json({ error: 'Email, new password, and verification token are required.' }, { status: 400 });
        }

        if (String(newPassword).length < 8) {
            return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
        }

        // Validate the email_verify JWT (same token type issued by verify-otp)
        let verifiedEmail: string;
        try {
            const { payload } = await jwtVerify(String(verificationToken), getJwtSecret(), { algorithms: ['HS256'] });
            if (payload.type !== 'email_verify' || !payload.email) {
                return NextResponse.json({ error: 'Invalid verification token.' }, { status: 400 });
            }
            verifiedEmail = payload.email as string;
        } catch {
            return NextResponse.json({ error: 'Verification token expired or invalid. Please verify your email again.' }, { status: 400 });
        }

        const normalizedEmail = String(email).toLowerCase().trim();
        if (verifiedEmail !== normalizedEmail) {
            return NextResponse.json({ error: 'Verification token does not match this email address.' }, { status: 400 });
        }

        // Find the user
        const user = await prisma.user.findUnique({
            where: { email: normalizedEmail },
            select: { id: true, password: true },
        });

        if (!user) {
            // Don't leak that the account doesn't exist
            return NextResponse.json({ ok: true });
        }

        // Hash and update password
        const passwordHash = await bcrypt.hash(String(newPassword), 10);
        await prisma.user.update({
            where: { id: user.id },
            data: { password: passwordHash },
        });

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('[mobile/auth/reset-password]', error);
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}
