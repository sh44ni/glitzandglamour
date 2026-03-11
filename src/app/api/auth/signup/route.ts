import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { sendVerificationEmail } from '@/lib/email';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
    try {
        // Rate limit: 5 sign-ups per IP per hour
        const rl = rateLimit(getClientIp(req), 'signup', { limit: 5, windowMs: 60 * 60 * 1000 });
        if (!rl.ok) {
            return NextResponse.json(
                { error: 'Too many attempts. Please try again later.' },
                { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
            );
        }

        const { name, email, password, referralCode } = await req.json();

        if (!name || !email || !password) {
            return NextResponse.json({ error: 'Name, email and password are required.' }, { status: 400 });
        }
        if (password.length < 8) {
            return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
        }

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });
        }

        // Resolve referrer if a code was provided
        let referrerCard: { id: string; userId: string } | null = null;
        if (referralCode) {
            referrerCard = await prisma.loyaltyCard.findUnique({
                where: { referralCode },
                select: { id: true, userId: true },
            });
        }

        const passwordHash = await bcrypt.hash(password, 12);
        const verificationToken = crypto.randomUUID();

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: passwordHash,
                verificationToken,
                ...(referrerCard ? { referredById: referrerCard.userId } : {}),
            },
        });

        // Auto-create loyalty card
        await prisma.loyaltyCard.create({ data: { userId: user.id } });

        // Create referral tracking record
        if (referrerCard) {
            await (prisma as any).referral.create({
                data: {
                    referrerId: referrerCard.id,
                    referredUserId: user.id,
                },
            });
        }

        // Send verification email (non-blocking)
        sendVerificationEmail(email, name, verificationToken).catch(e =>
            console.error('[signup] verification email error:', e)
        );

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error('[signup] error:', e);
        return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
    }
}
