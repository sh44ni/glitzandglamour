import { NextRequest, NextResponse } from 'next/server';
import { SignJWT, jwtVerify } from 'jose';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

const ADMIN_SESSION_COOKIE = 'admin_session';

function getSecret() {
    const key = process.env.ADMIN_JWT_SECRET;
    if (!key) throw new Error('[SECURITY] ADMIN_JWT_SECRET env variable is not set.');
    return new TextEncoder().encode(key);
}

export async function POST(request: NextRequest) {
    try {
        // Rate limit: 5 login attempts per IP per 15 minutes
        const rl = rateLimit(getClientIp(request), 'admin-login', { limit: 5, windowMs: 15 * 60 * 1000 });
        if (!rl.ok) {
            return NextResponse.json(
                { error: 'Too many login attempts. Please try again later.' },
                { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
            );
        }

        const { password, rememberDevice } = await request.json();
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (!adminPassword) {
            return NextResponse.json({ error: 'Admin not configured' }, { status: 500 });
        }

        // Trim both sides to prevent whitespace issues from .env copy-paste
        if (password.trim() !== adminPassword.trim()) {
            return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
        }

        // 30 days if "remember device", otherwise 8 hours
        const maxAgeSecs = rememberDevice ? 30 * 24 * 60 * 60 : 8 * 60 * 60;
        const expiresIn = rememberDevice ? '30d' : '8h';

        const token = await new SignJWT({ role: 'ADMIN' })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime(expiresIn)
            .setIssuedAt()
            .sign(getSecret());

        const response = NextResponse.json({ success: true });
        response.cookies.set(ADMIN_SESSION_COOKIE, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: rememberDevice ? maxAgeSecs : undefined,
            path: '/',
        });
        return response;
    } catch {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}

export async function DELETE() {
    const response = NextResponse.json({ success: true });
    response.cookies.delete(ADMIN_SESSION_COOKIE);
    return response;
}

/** Helper used by admin API routes to verify the admin cookie */
export async function verifyAdminCookie(request: NextRequest): Promise<boolean> {
    const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    if (!token) return false;

    try {
        await jwtVerify(token, getSecret());
        return true;
    } catch {
        return false;
    }
}
