import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose';

/**
 * Verifies native OAuth identity tokens (Google ID token / Apple identity token)
 * directly against each provider's published JWKS. No browser round-trip.
 *
 * The remote key sets are cached in-module by `jose` (respecting HTTP cache
 * headers), so repeated verifications don't re-fetch the keys every time.
 */

const GOOGLE_JWKS = createRemoteJWKSet(
    new URL('https://www.googleapis.com/oauth2/v3/certs'),
);
const APPLE_JWKS = createRemoteJWKSet(
    new URL('https://appleid.apple.com/auth/keys'),
);

function splitEnvList(value: string | undefined): string[] {
    return (value ?? '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
}

/** Allowed `aud` values for a Google ID token (web + iOS + android client IDs). */
function googleAudiences(): string[] {
    const list = splitEnvList(process.env.GOOGLE_MOBILE_CLIENT_IDS);
    if (process.env.GOOGLE_CLIENT_ID) list.push(process.env.GOOGLE_CLIENT_ID);
    return Array.from(new Set(list));
}

/** Allowed `aud` values for an Apple identity token (app bundle id / services id). */
function appleAudiences(): string[] {
    const list = splitEnvList(process.env.APPLE_MOBILE_BUNDLE_ID);
    if (list.length === 0) list.push('com.glitzandglamours.member');
    if (process.env.AUTH_APPLE_ID) list.push(process.env.AUTH_APPLE_ID);
    return Array.from(new Set(list));
}

export type GoogleClaims = {
    sub: string;
    email: string;
    emailVerified: boolean;
    name: string | null;
    picture: string | null;
};

export async function verifyGoogleIdToken(idToken: string): Promise<GoogleClaims> {
    const audiences = googleAudiences();
    if (audiences.length === 0) {
        throw new Error('No Google client IDs configured (GOOGLE_MOBILE_CLIENT_IDS / GOOGLE_CLIENT_ID)');
    }

    const { payload } = await jwtVerify(idToken, GOOGLE_JWKS, {
        issuer: ['https://accounts.google.com', 'accounts.google.com'],
        audience: audiences,
    });

    const p = payload as JWTPayload & {
        email?: string;
        email_verified?: boolean | string;
        name?: string;
        picture?: string;
    };

    if (!p.sub || !p.email) {
        throw new Error('Google token missing sub/email');
    }

    return {
        sub: p.sub,
        email: p.email,
        emailVerified: p.email_verified === true || p.email_verified === 'true',
        name: p.name ?? null,
        picture: p.picture ?? null,
    };
}

export type AppleClaims = {
    sub: string;
    email: string | null;
    emailVerified: boolean;
};

export async function verifyAppleIdentityToken(identityToken: string): Promise<AppleClaims> {
    const audiences = appleAudiences();

    const { payload } = await jwtVerify(identityToken, APPLE_JWKS, {
        issuer: 'https://appleid.apple.com',
        audience: audiences,
    });

    const p = payload as JWTPayload & {
        email?: string;
        email_verified?: boolean | string;
    };

    if (!p.sub) {
        throw new Error('Apple token missing sub');
    }

    return {
        sub: p.sub,
        email: p.email ?? null,
        emailVerified: p.email_verified === true || p.email_verified === 'true',
    };
}
