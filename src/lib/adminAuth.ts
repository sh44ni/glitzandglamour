import { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const ADMIN_SESSION_COOKIE = 'admin_session';
const SECRET = new TextEncoder().encode(
    process.env.ADMIN_JWT_SECRET || process.env.NEXTAUTH_SECRET || 'glam-admin-secret-key'
);

/**
 * Returns true if the incoming request has a valid admin session cookie.
 * Works in both Edge and Node.js runtimes.
 */
export async function isAdminRequest(req: NextRequest): Promise<boolean> {
    const token = req.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    if (!token) return false;

    // Legacy plain value — kept for one-deploy backward compat
    if (token === 'authenticated') return true;

    try {
        await jwtVerify(token, SECRET);
        return true;
    } catch {
        return false;
    }
}
