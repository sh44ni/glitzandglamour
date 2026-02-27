import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

/**
 * Middleware uses the edge-safe authConfig (no Prisma, no bcrypt)
 * to stay well under Vercel's 1MB Edge Function size limit.
 */
export default NextAuth(authConfig).auth;

export const config = {
    matcher: [
        '/admin/:path*',
        '/card',
        '/profile',
    ],
};
