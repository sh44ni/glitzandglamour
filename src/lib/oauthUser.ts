import { prisma } from '@/lib/prisma';

export type OAuthProvider = 'google' | 'apple';

export type OAuthUserInput = {
    provider: OAuthProvider;
    email: string;
    name?: string | null;
    image?: string | null;
    /** Provider-specific stable account id (Google `sub` or Apple `sub`) */
    providerAccountId: string;
};

export type OAuthUserResult = {
    id: string;
    email: string;
    name: string | null;
    image: string | null;
    emailVerified: string | null;
    phone: string | null;
    dateOfBirth: string | null;
};

/**
 * Find-or-create a user from a verified native OAuth sign-in (Google / Apple).
 *
 * Mirrors the `signIn` callback in `src/auth.ts` so that the native mobile flow
 * and the browser NextAuth flow converge on identical account state:
 *   - creates the user + loyalty card on first sign-in
 *   - links existing guest bookings to the new account
 *   - back-fills the provider id / image / emailVerified on returning users
 */
export async function upsertOAuthUser(input: OAuthUserInput): Promise<OAuthUserResult> {
    const email = input.email.toLowerCase().trim();
    const { provider, providerAccountId } = input;

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (!existingUser) {
        const newUser = await prisma.user.create({
            data: {
                email,
                name: input.name || 'Guest',
                ...(provider === 'google'
                    ? { googleId: providerAccountId }
                    : { appleId: providerAccountId }),
                image: input.image ?? null,
                emailVerified: new Date(),
            },
        });

        await prisma.loyaltyCard.create({ data: { userId: newUser.id } });

        // Link guest bookings to the new account (non-blocking — same as web flow).
        prisma.booking
            .findMany({ where: { guestEmail: email, userId: null }, select: { id: true } })
            .then(async (guestBookings) => {
                if (guestBookings.length > 0) {
                    const bookingIds = guestBookings.map((b) => b.id);
                    await prisma.booking.updateMany({
                        where: { id: { in: bookingIds } },
                        data: { userId: newUser.id, guestName: null, guestEmail: null, guestPhone: null },
                    });
                    await (prisma as any).bookingConsent.updateMany({
                        where: { bookingId: { in: bookingIds }, userId: null },
                        data: { userId: newUser.id },
                    });
                    console.log(`[oauthUser] Linked ${guestBookings.length} guest booking(s) to new ${provider} user ${newUser.id}`);
                }
            })
            .catch((e) => console.error('[oauthUser] guest booking link error:', e));

        return toResult(newUser);
    }

    const updateData: Record<string, unknown> = {
        image: input.image || existingUser.image,
        emailVerified: existingUser.emailVerified ?? new Date(),
    };
    if (provider === 'google' && !existingUser.googleId) {
        updateData.googleId = providerAccountId;
    } else if (provider === 'apple' && !existingUser.appleId) {
        updateData.appleId = providerAccountId;
    }

    const updated = await prisma.user.update({
        where: { id: existingUser.id },
        data: updateData,
    });

    return toResult(updated);
}

function toResult(user: {
    id: string;
    email: string;
    name: string | null;
    image: string | null;
    emailVerified: Date | null;
    phone: string | null;
    dateOfBirth: Date | null;
}): OAuthUserResult {
    return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        emailVerified: user.emailVerified ? user.emailVerified.toISOString() : null,
        phone: user.phone ?? null,
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.toISOString() : null,
    };
}
