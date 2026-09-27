import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

function getDeepLinkBase() {
  return process.env.MOBILE_DEEP_LINK_BASE || 'glitzmember://auth/callback';
}

export async function GET(req: Request) {
  const url = new URL(req.url);

  // NextAuth forwards OAuth errors to the callbackUrl as ?error=...
  // Relay them to the app via deep-link so the mobile side can show an alert.
  const oauthError = url.searchParams.get('error');
  if (oauthError) {
    const deepLink = new URL(getDeepLinkBase());
    deepLink.searchParams.set('error', oauthError);
    return NextResponse.redirect(deepLink.toString());
  }

  const session = await auth();

  // When Apple doesn't share the email (privacy relay or subsequent logins),
  // session.user.email may be absent. Fall back to a sub-based lookup using
  // the NextAuth account token stored in the session JWT (sub = appleId).
  let dbUser: { id: string; name: string | null } | null = null;

  if (session?.user?.email) {
    dbUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, name: true },
    });
  }

  // If no user found by email (e.g. Apple hid it), attempt to locate by appleId
  // which NextAuth stores as the token `sub` claim.
  if (!dbUser && (session as any)?.token?.sub) {
    dbUser = await prisma.user.findFirst({
      where: { appleId: (session as any).token.sub },
      select: { id: true, name: true },
    });
  }

  if (!session?.user || !dbUser) {
    // No valid session — redirect back to sign-in with an informative error.
    const signIn = new URL('/sign-in', req.url);
    signIn.searchParams.set('error', 'OAuthCallback');
    return NextResponse.redirect(signIn.toString());
  }

  const code = crypto.randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  await prisma.mobileAuthCode.create({
    data: {
      code,
      userId: dbUser.id,
      expiresAt,
    },
  });

  const deepLink = new URL(getDeepLinkBase());
  deepLink.searchParams.set('code', code);

  return NextResponse.redirect(deepLink.toString());
}
