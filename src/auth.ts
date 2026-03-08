import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { authConfig } from './auth.config';

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    providers: [
        ...authConfig.providers,
        // Email + password sign-in
        Credentials({
            id: 'email-password',
            name: 'Email',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email as string },
                });

                if (!user || !user.password) return null;

                const valid = await bcrypt.compare(credentials.password as string, user.password);
                if (!valid) return null;

                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    image: user.image,
                    role: 'CUSTOMER',
                    emailVerified: user.emailVerified ? user.emailVerified.toISOString() : null,
                };
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
                                // Google accounts are auto-verified
                                emailVerified: new Date(),
                            },
                        });
                        await prisma.loyaltyCard.create({ data: { userId: newUser.id } });
                    } else if (!existingUser.googleId) {
                        await prisma.user.update({
                            where: { id: existingUser.id },
                            data: {
                                googleId: account.providerAccountId,
                                image: user.image,
                                emailVerified: existingUser.emailVerified ?? new Date(),
                            },
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
                token.emailVerified = (user as { emailVerified?: string | null }).emailVerified ?? null;
            }
            if (account?.provider === 'admin-credentials') {
                token.role = 'ADMIN';
            }
            return token;
        },

        async session({ session, token }) {
            if (session.user) {
                (session.user as { role?: string }).role = token.role as string;
                (session.user as { emailVerified?: string | null }).emailVerified =
                    token.emailVerified as string | null;

                try {
                    if (token.role === 'CUSTOMER') {
                        const dbUser = await prisma.user.findUnique({
                            where: { email: session.user.email! },
                            select: { id: true, emailVerified: true },
                        });
                        if (dbUser) {
                            (session.user as { id?: string }).id = dbUser.id;
                            // Keep emailVerified fresh from DB
                            (session.user as { emailVerified?: string | null }).emailVerified =
                                dbUser.emailVerified ? dbUser.emailVerified.toISOString() : null;
                        }
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
