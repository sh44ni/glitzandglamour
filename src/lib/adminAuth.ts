import { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const ADMIN_SESSION_COOKIE = 'admin_session';

function getSecret() {
    const key = process.env.ADMIN_JWT_SECRET || process.env.NEXTAUTH_SECRET || 'glam-admin-secret-2026';
    return new TextEncoder().encode(key);
}

/**
 * Returns true if the incoming request has a valid admin session cookie.
 * Works in both Edge and Node.js runtimes.
 */
export async function isAdminRequest(req: NextRequest): Promise<boolean> {
    const token = req.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    if (!token) return false;

    // Support legacy plain "authenticated" value (backward-compat one deploy)
    if (token === 'authenticated') return true;

    try {
        await jwtVerify(token, getSecret());
        return true;
    } catch {
        return false;
    }
}
