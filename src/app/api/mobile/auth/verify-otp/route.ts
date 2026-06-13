import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signMobileToken } from '@/lib/mobileAuth';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

const MAX_ATTEMPTS = 5;

export async function POST(req: NextRequest) {
    try {
        const rl = rateLimit(getClientIp(req), 'mobile-verify-otp', { limit: 10, windowMs: 10 * 60 * 1000 });
        if (!rl.ok) {
            return NextResponse.json(
                { error: 'Too many attempts. Please try again later.' },
                { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } },
            );
        }

        const body = await req.json().catch(() => ({}));
        const { email, code } = body;

        if (!email || !code) {
            return NextResponse.json({ error: 'Email and code are required.' }, { status: 400 });
        }

        const normalizedEmail = String(email).toLowerCase().trim();

        // Find the most recent unconsumed, unexpired OTP for this email
        const otp = await (prisma as any).emailOtp.findFirst({
            where: {
                email: normalizedEmail,
                consumedAt: null,
                expiresAt: { gt: new Date() },
            },
            orderBy: { createdAt: 'desc' },
        });

        if (!otp) {
            return NextResponse.json({ error: 'Code expired or not found. Please request a new code.' }, { status: 400 });
        }

        if (otp.attempts >= MAX_ATTEMPTS) {
            await (prisma as any).emailOtp.update({
                where: { id: otp.id },
                data: { consumedAt: new Date() },
            });
            return NextResponse.json({ error: 'Too many failed attempts. Please request a new code.' }, { status: 400 });
        }

        const valid = await bcrypt.compare(String(code), otp.codeHash);

        if (!valid) {
            await (prisma as any).emailOtp.update({
                where: { id: otp.id },
                data: { attempts: otp.attempts + 1 },
            });
            const remaining = MAX_ATTEMPTS - (otp.attempts + 1);
            return NextResponse.json(
                { error: `Incorrect code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.` },
                { status: 400 },
            );
        }

        // Mark consumed
        await (prisma as any).emailOtp.update({
            where: { id: otp.id },
            data: { consumedAt: new Date() },
        });

        // If this email already belongs to a user, mark them as verified
        const existingUser = await prisma.user.findUnique({
            where: { email: normalizedEmail },
            select: { id: true, emailVerified: true },
        });
        if (existingUser && !existingUser.emailVerified) {
            await prisma.user.update({
                where: { id: existingUser.id },
                data: { emailVerified: new Date() },
            });
        }

        // Issue a short-lived verification token so the mobile register endpoint
        // knows OTP was completed without requiring the user to type the code again.
        const verificationToken = await signMobileToken(
            { email: normalizedEmail, type: 'email_verify' },
            15 * 60, // 15 min
        );

        return NextResponse.json({ verified: true, verificationToken });
    } catch (error) {
        console.error('[mobile/auth/verify-otp]', error);
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}
