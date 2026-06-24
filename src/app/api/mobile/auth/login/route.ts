import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signMobileTokenPair } from '@/lib/mobileAuth';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { resolveImageUrl } from '@/lib/imageUrl';

export async function POST(req: NextRequest) {
    try {
        const rl = rateLimit(getClientIp(req), 'mobile-login', { limit: 10, windowMs: 60 * 60 * 1000 });
        if (!rl.ok) {
            return NextResponse.json(
                { error: 'Too many attempts. Please try again later.' },
                { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } },
            );
        }

        const body = await req.json().catch(() => ({}));
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email: String(email).toLowerCase().trim() },
            select: { id: true, email: true, name: true, image: true, password: true, emailVerified: true, phone: true, dateOfBirth: true },
        });

        if (!user || !user.password) {
            return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
        }

        const valid = await bcrypt.compare(String(password), user.password);
        if (!valid) {
            return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
        }

        const { accessToken, refreshToken } = await signMobileTokenPair(user.id, user.email);

        return NextResponse.json({
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                image: resolveImageUrl(user.image) ?? null,
                emailVerified: user.emailVerified ? user.emailVerified.toISOString() : null,
                phone: user.phone ?? null,
                dateOfBirth: user.dateOfBirth ? user.dateOfBirth.toISOString() : null,
            },
        });
    } catch (error) {
        console.error('[mobile/auth/login]', error);
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}
