import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const ADMIN_COOKIE = 'admin_session';

if (!process.env.ADMIN_JWT_SECRET) {
    throw new Error('[SECURITY] ADMIN_JWT_SECRET env variable is not set. App cannot start safely.');
}
const SECRET = new TextEncoder().encode(process.env.ADMIN_JWT_SECRET);

async function isAdminAuthenticated(req: NextRequest): Promise<boolean> {
    const token = req.cookies.get(ADMIN_COOKIE)?.value;
    if (!token) return false;
    try {
        await jwtVerify(token, SECRET);
        return true;
    } catch {
        return false;
    }
}

/**
 * Middleware:
 * - /admin routes: checked via standalone admin_session JWT cookie (NOT NextAuth)
 * - All other routes: pass through (customer pages handle their own auth in-page)
 */
export default async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
        // Skip auth check for the admin login page and the admin auth API (login endpoint)
        if (pathname === '/admin/login' || pathname === '/api/admin/auth') {
            const authed = await isAdminAuthenticated(req);
            if (pathname === '/admin/login') {
                return authed
                    ? NextResponse.redirect(new URL('/admin', req.url))
                    : NextResponse.next();
            }
            // /api/admin/auth (login POST / logout DELETE) — always pass through
            return NextResponse.next();
        }

        // Protect all other /admin pages AND /api/admin/* routes
        const authed = await isAdminAuthenticated(req);
        if (!authed) {
            if (pathname.startsWith('/api/admin')) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }
            return NextResponse.redirect(new URL('/admin/login', req.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/api/admin/:path*'],
};
