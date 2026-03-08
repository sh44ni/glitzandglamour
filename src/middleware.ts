import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const ADMIN_COOKIE = 'admin_session';
const SECRET = new TextEncoder().encode(
    process.env.ADMIN_JWT_SECRET || process.env.NEXTAUTH_SECRET || 'glam-admin-secret-key'
);

async function isAdminAuthenticated(req: NextRequest): Promise<boolean> {
    const token = req.cookies.get(ADMIN_COOKIE)?.value;
    if (!token) return false;
    // Legacy plain-string value (one-deploy backward compat)
    if (token === 'authenticated') return true;
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

    if (pathname.startsWith('/admin')) {
        const authed = await isAdminAuthenticated(req);

        // Already logged in — redirect away from login page
        if (pathname === '/admin/login') {
            return authed
                ? NextResponse.redirect(new URL('/admin', req.url))
                : NextResponse.next();
        }

        // Protect all other /admin pages
        if (!authed) {
            return NextResponse.redirect(new URL('/admin/login', req.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*'],
};
