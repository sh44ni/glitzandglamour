import type { NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';
import Apple from 'next-auth/providers/apple';

/**
 * Edge-safe auth config — no Prisma, no bcryptjs.
 * Imported by middleware.ts to keep the Edge Function bundle small.
 * The full auth.ts extends this with DB callbacks.
 */
export const authConfig: NextAuthConfig = {
    trustHost: true,
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        Apple({
            clientId: process.env.AUTH_APPLE_ID!,
            clientSecret: process.env.AUTH_APPLE_SECRET!,
        }),
    ],
    pages: {
        signIn: '/sign-in',
        error: '/sign-in',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const role = (auth?.user as { role?: string })?.role;
            const pathname = nextUrl.pathname;

            // Admin routes
            if (pathname.startsWith('/admin')) {
                if (pathname === '/admin/login') {
                    return role === 'ADMIN'
                        ? Response.redirect(new URL('/admin', nextUrl))
                        : true;
                }
                // Explicitly redirect to /admin/login (not the default /sign-in)
                if (role !== 'ADMIN') {
                    return Response.redirect(new URL('/admin/login', nextUrl));
                }
                return true;
            }

            // Profile and card handle their own auth state in-page — no redirect needed

            return true;
        },
        jwt({ token, user, account }) {
            if (user) {
                token.role = (user as { role?: string }).role || 'CUSTOMER';
            }
            if (account?.provider === 'admin-credentials') {
                token.role = 'ADMIN';
            }
            return token;
        },
        session({ session, token }) {
            if (session.user) {
                (session.user as { role?: string }).role = token.role as string;
            }
            return session;
        },
    },
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60,   // 30 days — how long the JWT token is valid
        updateAge: 24 * 60 * 60,      // refresh the token once per day
    },
    cookies: {
        sessionToken: {
            name: 'next-auth.session-token',
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                secure: process.env.NODE_ENV === 'production',
                // ⬇️ This is the key fix: tell the browser to persist
                // the cookie for 30 days instead of deleting it when
                // the tab/browser is closed.
                maxAge: 30 * 24 * 60 * 60,
            },
        },
    },
};
