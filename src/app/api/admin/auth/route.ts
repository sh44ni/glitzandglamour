import { NextRequest, NextResponse } from 'next/server';
import { SignJWT, jwtVerify } from 'jose';

const ADMIN_SESSION_COOKIE = 'admin_session';
if (!process.env.ADMIN_JWT_SECRET) {
    throw new Error('[SECURITY] ADMIN_JWT_SECRET env variable is not set.');
}
const SECRET = new TextEncoder().encode(process.env.ADMIN_JWT_SECRET);

export async function POST(request: NextRequest) {
    try {
        const { password, rememberDevice } = await request.json();
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (!adminPassword) {
            return NextResponse.json({ error: 'Admin not configured' }, { status: 500 });
        }

        if (password !== adminPassword) {
            return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
        }

        // 30 days if "remember device", otherwise 8 hours
        const maxAgeSecs = rememberDevice ? 30 * 24 * 60 * 60 : 8 * 60 * 60;
        const expiresIn = rememberDevice ? '30d' : '8h';

        // Sign a JWT so the cookie value is verifiable
        const token = await new SignJWT({ role: 'ADMIN' })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime(expiresIn)
            .setIssuedAt()
            .sign(SECRET);

        const response = NextResponse.json({ success: true });
        response.cookies.set(ADMIN_SESSION_COOKIE, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: rememberDevice ? maxAgeSecs : undefined, // undefined = session cookie
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

    // Support legacy plain "authenticated" value (backward-compat one deploy)
    if (token === 'authenticated') return true;

    try {
        await jwtVerify(token, SECRET);
        return true;
    } catch {
        return false;
    }
}
