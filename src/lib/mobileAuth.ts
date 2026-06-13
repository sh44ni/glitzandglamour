import { jwtVerify, SignJWT } from 'jose';
import { prisma } from '@/lib/prisma';

export type MobileUser = {
    id: string;
    email: string;
};

function getJwtSecret(): Uint8Array {
    const secret = process.env.MOBILE_JWT_SECRET || process.env.AUTH_SECRET;
    if (!secret) throw new Error('Missing MOBILE_JWT_SECRET (or AUTH_SECRET)');
    return new TextEncoder().encode(secret);
}

export async function signMobileToken(
    payload: Record<string, unknown>,
    expiresInSeconds: number,
): Promise<string> {
    const now = Math.floor(Date.now() / 1000);
    return new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
        .setIssuedAt(now)
        .setExpirationTime(now + expiresInSeconds)
        .sign(getJwtSecret());
}

export async function signMobileTokenPair(userId: string, email: string) {
    const [accessToken, refreshToken] = await Promise.all([
        signMobileToken({ sub: userId, email, type: 'access' }, 60 * 30),
        signMobileToken({ sub: userId, email, type: 'refresh' }, 60 * 60 * 24 * 30),
    ]);
    return { accessToken, refreshToken };
}

/**
 * Extract and verify a Bearer token from the Authorization header.
 * Returns the decoded payload or null if missing/invalid.
 */
export async function verifyMobileToken(
    req: Request,
    expectedType: 'access' | 'refresh' = 'access',
): Promise<{ sub: string; email: string } | null> {
    const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) return null;
    const token = authHeader.slice(7).trim();
    if (!token) return null;

    try {
        const { payload } = await jwtVerify(token, getJwtSecret(), { algorithms: ['HS256'] });
        if (payload.type !== expectedType) return null;
        if (!payload.sub || !payload.email) return null;
        return { sub: payload.sub as string, email: payload.email as string };
    } catch {
        return null;
    }
}

/**
 * Returns the authenticated user from either:
 *   1. A NextAuth cookie session (web)
 *   2. A mobile Bearer access token
 * Returns null if neither is present or valid.
 */
export async function getMobileOrWebUser(
    req: Request,
    sessionEmail?: string | null | undefined,
): Promise<MobileUser | null> {
    // 1. Try NextAuth session (email passed from caller)
    if (sessionEmail) {
        const user = await prisma.user.findUnique({
            where: { email: sessionEmail },
            select: { id: true, email: true },
        });
        if (user) return { id: user.id, email: user.email };
    }

    // 2. Try Bearer token
    const tokenPayload = await verifyMobileToken(req, 'access');
    if (!tokenPayload) return null;

    const user = await prisma.user.findUnique({
        where: { id: tokenPayload.sub },
        select: { id: true, email: true },
    });
    return user ?? null;
}
