import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signMobileTokenPair, verifyMobileToken } from '@/lib/mobileAuth';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { jwtVerify } from 'jose';

function getJwtSecret() {
    const secret = process.env.MOBILE_JWT_SECRET || process.env.AUTH_SECRET;
    if (!secret) throw new Error('Missing MOBILE_JWT_SECRET');
    return new TextEncoder().encode(secret);
}

export async function POST(req: NextRequest) {
    try {
        const rl = rateLimit(getClientIp(req), 'mobile-register', { limit: 5, windowMs: 60 * 60 * 1000 });
        if (!rl.ok) {
            return NextResponse.json(
                { error: 'Too many attempts. Please try again later.' },
                { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } },
            );
        }

        const body = await req.json().catch(() => ({}));
        const { name, email, password, dateOfBirth, phone, verificationToken, referralCode } = body;

        if (!name || !email || !password) {
            return NextResponse.json({ error: 'Name, email, and password are required.' }, { status: 400 });
        }
        if (!dateOfBirth) {
            return NextResponse.json({ error: 'Date of birth is required.' }, { status: 400 });
        }
        if (!phone || !phone.trim()) {
            return NextResponse.json({ error: 'Phone number is required.' }, { status: 400 });
        }
        if (!verificationToken) {
            return NextResponse.json({ error: 'Email verification is required. Please verify your email first.' }, { status: 400 });
        }

        // Validate the email_verify JWT
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

        const dob = new Date(dateOfBirth);
        if (isNaN(dob.getTime())) {
            return NextResponse.json({ error: 'Invalid date of birth.' }, { status: 400 });
        }
        const ageYears = new Date(Date.now() - dob.getTime()).getUTCFullYear() - 1970;
        if (ageYears < 13) {
            return NextResponse.json(
                { error: 'You must be at least 13 years old to create an account.' },
                { status: 400 },
            );
        }
        if (String(password).length < 8) {
            return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
        }

        const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
        if (existing) {
            return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });
        }

        let referrerCard: { id: string; userId: string } | null = null;
        if (referralCode) {
            referrerCard = await prisma.loyaltyCard.findUnique({
                where: { referralCode: String(referralCode) },
                select: { id: true, userId: true },
            });
        }

        const passwordHash = await bcrypt.hash(String(password), 12);

        const user = await (prisma as any).user.create({
            data: {
                name: String(name).trim().slice(0, 80),
                email: normalizedEmail,
                password: passwordHash,
                emailVerified: new Date(), // OTP already verified
                dateOfBirth: dob,
                phone: String(phone).trim().slice(0, 30),
                ...(referrerCard ? { referredById: referrerCard.userId } : {}),
            },
        });

        await prisma.loyaltyCard.create({ data: { userId: user.id } });

        if (referrerCard) {
            await (prisma as any).referral.create({
                data: { referrerId: referrerCard.id, referredUserId: user.id },
            });
        }

        // Link guest bookings (non-blocking)
        prisma.booking.findMany({
            where: { guestEmail: normalizedEmail, userId: null },
            select: { id: true },
        }).then(async (guestBookings) => {
            if (guestBookings.length > 0) {
                const ids = guestBookings.map(b => b.id);
                await prisma.booking.updateMany({
                    where: { id: { in: ids } },
                    data: { userId: user.id, guestName: null, guestEmail: null, guestPhone: null },
                });
            }
        }).catch(console.error);

        const { accessToken, refreshToken } = await signMobileTokenPair(user.id, user.email);

        return NextResponse.json({
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                image: user.image ?? null,
                emailVerified: user.emailVerified ? user.emailVerified.toISOString() : null,
                phone: user.phone ?? null,
                dateOfBirth: user.dateOfBirth ? user.dateOfBirth.toISOString() : null,
            },
        }, { status: 201 });
    } catch (error) {
        console.error('[mobile/auth/register]', error);
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}
