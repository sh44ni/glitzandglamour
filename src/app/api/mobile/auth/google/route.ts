import { NextRequest, NextResponse } from 'next/server';
import { signMobileTokenPair } from '@/lib/mobileAuth';
import { upsertOAuthUser } from '@/lib/oauthUser';
import { verifyGoogleIdToken } from '@/lib/verifyIdentityToken';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

/**
 * Native Google sign-in.
 * The app obtains a Google ID token from the native account picker
 * (@react-native-google-signin) and POSTs it here. We verify it against
 * Google's JWKS, find-or-create the user, and return a mobile JWT pair.
 */
export async function POST(req: NextRequest) {
    try {
        const rl = rateLimit(getClientIp(req), 'mobile-google', { limit: 20, windowMs: 60 * 60 * 1000 });
        if (!rl.ok) {
            return NextResponse.json(
                { error: 'Too many attempts. Please try again later.' },
                { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } },
            );
        }

        const body = await req.json().catch(() => ({}));
        const idToken = typeof body?.idToken === 'string' ? body.idToken : '';
        if (!idToken) {
            return NextResponse.json({ error: 'missing_id_token' }, { status: 400 });
        }

        let claims;
        try {
            claims = await verifyGoogleIdToken(idToken);
        } catch (e) {
            console.error('[mobile/auth/google] token verification failed:', e);
            return NextResponse.json({ error: 'invalid_token' }, { status: 401 });
        }

        if (!claims.emailVerified) {
            return NextResponse.json({ error: 'email_not_verified' }, { status: 401 });
        }

        const user = await upsertOAuthUser({
            provider: 'google',
            email: claims.email,
            name: claims.name,
            image: claims.picture,
            providerAccountId: claims.sub,
        });

        const { accessToken, refreshToken } = await signMobileTokenPair(user.id, user.email);

        return NextResponse.json({ accessToken, refreshToken, user });
    } catch (error) {
        console.error('[mobile/auth/google]', error);
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}
