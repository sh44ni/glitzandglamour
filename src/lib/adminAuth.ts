import { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const ADMIN_SESSION_COOKIE = 'admin_session';

if (!process.env.ADMIN_JWT_SECRET) {
    throw new Error('[SECURITY] ADMIN_JWT_SECRET env variable is not set.');
}
const SECRET = new TextEncoder().encode(process.env.ADMIN_JWT_SECRET);

/**
 * Returns true if the incoming request has a valid admin session cookie.
 * Works in both Edge and Node.js runtimes.
 */
export async function isAdminRequest(req: NextRequest): Promise<boolean> {
    const token = req.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    if (!token) return false;

    try {
        await jwtVerify(token, SECRET);
        return true;
    } catch {
        return false;
    }
}
