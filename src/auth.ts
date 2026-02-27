import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import { authConfig } from './auth.config';

const isProduction = process.env.NODE_ENV === 'production';
const productionUrl = process.env.NEXTAUTH_URL || process.env.AUTH_URL;

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    ...(isProduction && productionUrl ? {
        cookies: {
            sessionToken: {
                name: `__Secure-next-auth.session-token`,
                options: { httpOnly: true, sameSite: 'lax', path: '/', secure: true },
            },
            callbackUrl: {
                name: `__Secure-next-auth.callback-url`,
                options: { httpOnly: true, sameSite: 'lax', path: '/', secure: true },
            },
            csrfToken: {
                name: `__Host-next-auth.csrf-token`,
                options: { httpOnly: true, sameSite: 'lax', path: '/', secure: true },
            },
        },
    } : {}),
    providers: [
        // Spread Google from authConfig, add admin Credentials here
        ...authConfig.providers,
        Credentials({
            id: 'admin-credentials',
            name: 'Admin Login',
            credentials: {
                password: { label: 'Secret Key', type: 'password' },
            },
            async authorize(credentials) {
                if (credentials?.password === 'jojany##92083') {
                    return { id: 'admin-1', email: 'info@glitzandglamours.com', name: 'JoJany', role: 'ADMIN' };
                }
                return null;
            },
        }),
    ],
    callbacks: {
        async signIn({ user, account }) {
            if (account?.provider === 'google') {
                try {
                    const existingUser = await prisma.user.findUnique({
                        where: { email: user.email! },
                    });
                    if (!existingUser) {
                        const newUser = await prisma.user.create({
                            data: {
                                email: user.email!,
                                name: user.name || 'Guest',
                                googleId: account.providerAccountId,
                                image: user.image,
                            },
                        });
                        await prisma.loyaltyCard.create({ data: { userId: newUser.id } });
                    } else if (!existingUser.googleId) {
                        await prisma.user.update({
                            where: { id: existingUser.id },
                            data: { googleId: account.providerAccountId, image: user.image },
                        });
                    }
                } catch (e) {
                    console.error('[auth] Google signIn DB error (non-blocking):', e);
                }
            }
            return true;
        },

        async jwt({ token, user, account }) {
            if (user) {
                token.role = (user as { role?: string }).role || 'CUSTOMER';
            }
            if (account?.provider === 'admin-credentials') {
                token.role = 'ADMIN';
            }
            return token;
        },

        async session({ session, token }) {
            if (session.user) {
                (session.user as { role?: string }).role = token.role as string;
                try {
                    if (token.role === 'CUSTOMER') {
                        const dbUser = await prisma.user.findUnique({
                            where: { email: session.user.email! },
                            select: { id: true },
                        });
                        if (dbUser) (session.user as { id?: string }).id = dbUser.id;
                    } else if (token.role === 'ADMIN') {
                        const dbAdmin = await prisma.adminUser.findUnique({
                            where: { email: session.user.email! },
                            select: { id: true },
                        });
                        if (dbAdmin) (session.user as { id?: string }).id = dbAdmin.id;
                    }
                } catch (e) {
                    console.error('[auth] session callback DB error (non-blocking):', e);
                }
            }
            return session;
        },
    },
});
