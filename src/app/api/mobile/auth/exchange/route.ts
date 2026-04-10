import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { prisma } from '@/lib/prisma';

function getJwtSecret() {
  const secret = process.env.MOBILE_JWT_SECRET || process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error('Missing MOBILE_JWT_SECRET (or AUTH_SECRET)');
  }
  return new TextEncoder().encode(secret);
}

async function signToken(payload: Record<string, unknown>, expiresInSeconds: number) {
  const now = Math.floor(Date.now() / 1000);
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt(now)
    .setExpirationTime(now + expiresInSeconds)
    .sign(getJwtSecret());
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const code = typeof body?.code === 'string' ? body.code : '';
  if (!code) {
    return NextResponse.json({ error: 'missing_code' }, { status: 400 });
  }

  const record = await prisma.mobileAuthCode.findUnique({
    where: { code },
    include: {
      user: { select: { id: true, email: true, name: true } },
    },
  });

  if (!record) {
    return NextResponse.json({ error: 'invalid_code' }, { status: 401 });
  }

  if (record.usedAt) {
    return NextResponse.json({ error: 'code_used' }, { status: 401 });
  }

  if (record.expiresAt.getTime() < Date.now()) {
    return NextResponse.json({ error: 'code_expired' }, { status: 401 });
  }

  await prisma.mobileAuthCode.update({
    where: { id: record.id },
    data: { usedAt: new Date() },
  });

  const accessToken = await signToken(
    {
      sub: record.user.id,
      email: record.user.email,
      type: 'access',
    },
    60 * 30, // 30 min
  );

  const refreshToken = await signToken(
    {
      sub: record.user.id,
      email: record.user.email,
      type: 'refresh',
    },
    60 * 60 * 24 * 30, // 30 days
  );

  return NextResponse.json({
    accessToken,
    refreshToken,
    user: {
      id: record.user.id,
      email: record.user.email,
      name: record.user.name,
    },
  });
}

