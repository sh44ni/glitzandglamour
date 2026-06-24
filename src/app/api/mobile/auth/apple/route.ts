import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signMobileTokenPair } from '@/lib/mobileAuth';
import { upsertOAuthUser } from '@/lib/oauthUser';
import { verifyAppleIdentityToken } from '@/lib/verifyIdentityToken';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { resolveImageUrl } from '@/lib/imageUrl';

/**
 * Native Apple sign-in.
 * The app obtains an identity token from the native Apple sheet
 * (expo-apple-authentication) and POSTs it here, along with the user's name
 * which Apple only provides on the very first authorization. We verify the
 * token against Apple's JWKS, find-or-create the user, and return a mobile
 * JWT pair.
 */
export async function POST(req: NextRequest) {
    try {
        const rl = rateLimit(getClientIp(req), 'mobile-apple', { limit: 20, windowMs: 60 * 60 * 1000 });
        if (!rl.ok) {
            return NextResponse.json(
                { error: 'Too many attempts. Please try again later.' },
                { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } },
            );
        }

        const body = await req.json().catch(() => ({}));
        const identityToken = typeof body?.identityToken === 'string' ? body.identityToken : '';
        const fullName = typeof body?.fullName === 'string' ? body.fullName.trim() : '';
        if (!identityToken) {
            return NextResponse.json({ error: 'missing_identity_token' }, { status: 400 });
        }

        let claims;
        try {
            claims = await verifyAppleIdentityToken(identityToken);
        } catch (e) {
            console.error('[mobile/auth/apple] token verification failed:', e);
            return NextResponse.json({ error: 'invalid_token' }, { status: 401 });
        }

        // The Apple identity token normally carries the email claim on every
        // sign-in. If it's ever absent, fall back to the existing account
        // matched by the stable Apple user id (appleId).
        if (!claims.email) {
            const existing = await prisma.user.findFirst({
                where: { appleId: claims.sub },
                select: {
                    id: true, email: true, name: true, image: true,
                    emailVerified: true, phone: true, dateOfBirth: true,
                },
            });
            if (!existing) {
                return NextResponse.json({ error: 'email_unavailable' }, { status: 401 });
            }
            const tokens = await signMobileTokenPair(existing.id, existing.email);
            return NextResponse.json({
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
                user: {
                    id: existing.id,
                    email: existing.email,
                    name: existing.name,
                    image: resolveImageUrl(existing.image) ?? null,
                    emailVerified: existing.emailVerified ? existing.emailVerified.toISOString() : null,
                    phone: existing.phone ?? null,
                    dateOfBirth: existing.dateOfBirth ? existing.dateOfBirth.toISOString() : null,
                },
            });
        }

        const user = await upsertOAuthUser({
            provider: 'apple',
            email: claims.email,
            name: fullName || null,
            providerAccountId: claims.sub,
        });

        const { accessToken, refreshToken } = await signMobileTokenPair(user.id, user.email);

        return NextResponse.json({ accessToken, refreshToken, user });
    } catch (error) {
        console.error('[mobile/auth/apple]', error);
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}
