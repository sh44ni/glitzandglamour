import { NextRequest, NextResponse } from 'next/server';
import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

const { auth } = NextAuth(authConfig);

/**
 * Middleware:
 * - /admin routes: checked via standalone admin_session cookie (NOT NextAuth)
 * - /card, /profile: checked via NextAuth (customer session only)
 */
export default async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // ── Admin routes: use standalone cookie, never NextAuth ──────────
    if (pathname.startsWith('/admin')) {
        const adminSession = req.cookies.get('admin_session')?.value;

        // Allow the login page through always
        if (pathname === '/admin/login') {
            // If already authenticated, redirect to dashboard
            if (adminSession === 'authenticated') {
                return NextResponse.redirect(new URL('/admin', req.url));
            }
            return NextResponse.next();
        }

        // All other /admin pages require the cookie
        if (adminSession !== 'authenticated') {
            return NextResponse.redirect(new URL('/admin/login', req.url));
        }

        return NextResponse.next();
    }

    // ── Customer routes: use NextAuth ────────────────────────────────
    // /card and /profile handle their own in-page auth state (no redirect needed)
    return NextResponse.next();
}

export const config = {
    matcher: [
        '/admin/:path*',
        '/card',
        '/profile',
    ],
};
