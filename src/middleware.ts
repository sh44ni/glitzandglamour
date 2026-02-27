import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
    const { pathname } = req.nextUrl;
    const session = req.auth;
    const role = (session?.user as { role?: string })?.role;

    // Admin routes — require ADMIN role
    if (pathname.startsWith('/admin')) {
        if (pathname === '/admin/login') {
            // If already logged in as admin, redirect to dashboard
            if (role === 'ADMIN') {
                return NextResponse.redirect(new URL('/admin', req.url));
            }
            return NextResponse.next();
        }
        if (role !== 'ADMIN') {
            return NextResponse.redirect(new URL('/admin/login', req.url));
        }
        return NextResponse.next();
    }

    // Customer-only routes
    if (pathname === '/card' || pathname === '/profile') {
        if (!session || role === 'ADMIN') {
            return NextResponse.redirect(new URL('/sign-in', req.url));
        }
    }

    return NextResponse.next();
});

export const config = {
    matcher: [
        '/admin/:path*',
        '/card',
        '/profile',
    ],
};
