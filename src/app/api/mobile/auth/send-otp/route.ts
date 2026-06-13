import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { sendOtpEmail } from '@/lib/email';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
    try {
        const rl = rateLimit(getClientIp(req), 'mobile-send-otp', { limit: 5, windowMs: 10 * 60 * 1000 });
        if (!rl.ok) {
            return NextResponse.json(
                { error: 'Too many attempts. Please wait before requesting another code.' },
                { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } },
            );
        }

        const body = await req.json().catch(() => ({}));
        const { email } = body;

        if (!email || typeof email !== 'string') {
            return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Invalidate any existing unused OTPs for this email
        await (prisma as any).emailOtp.updateMany({
            where: { email: normalizedEmail, consumedAt: null },
            data: { consumedAt: new Date() },
        });

        // Generate 6-digit code
        const code = String(Math.floor(100000 + Math.random() * 900000));
        const codeHash = await bcrypt.hash(code, 10);
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

        await (prisma as any).emailOtp.create({
            data: { email: normalizedEmail, codeHash, expiresAt },
        });

        // Look up name for personalised email (non-blocking if not found)
        const user = await prisma.user.findUnique({
            where: { email: normalizedEmail },
            select: { name: true },
        });

        sendOtpEmail(normalizedEmail, user?.name ?? 'there', code).catch(console.error);

        // Always return ok — don't leak account existence
        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('[mobile/auth/send-otp]', error);
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}
