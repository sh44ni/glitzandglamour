import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { getMobileOrWebUser } from '@/lib/mobileAuth';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

/**
 * POST /api/mobile/push/register
 * Saves an Expo push token for the authenticated user.
 * Body: { token: string, platform?: "ios" | "android" }
 */
export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        const mobileUser = await getMobileOrWebUser(req, session?.user?.email);
        if (!mobileUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const rl = rateLimit(getClientIp(req), 'push-register', { limit: 10, windowMs: 60 * 60 * 1000 });
        if (!rl.ok) {
            return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
        }

        const body = await req.json().catch(() => ({}));
        const { token, platform } = body;

        if (!token || typeof token !== 'string' || !token.startsWith('ExponentPushToken')) {
            return NextResponse.json({ error: 'Invalid Expo push token.' }, { status: 400 });
        }

        // Upsert: if token already exists, update userId; if new, create.
        await (prisma as any).pushToken.upsert({
            where: { token },
            update: { userId: mobileUser.id, platform: platform ?? null, updatedAt: new Date() },
            create: { token, userId: mobileUser.id, platform: platform ?? null },
        });

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error('[push/register]', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
