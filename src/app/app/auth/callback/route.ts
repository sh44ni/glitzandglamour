import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

function getDeepLinkBase() {
  return process.env.MOBILE_DEEP_LINK_BASE || 'glitzmember://auth/callback';
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.redirect(new URL('/sign-in', req.url));
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, name: true },
  });

  if (!dbUser) {
    return NextResponse.redirect(new URL('/sign-in', req.url));
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

