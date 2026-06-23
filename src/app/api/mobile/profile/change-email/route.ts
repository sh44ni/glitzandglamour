import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { getMobileOrWebUser } from '@/lib/mobileAuth';
import { sendOtpEmail } from '@/lib/email';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

/**
 * POST /api/mobile/profile/change-email
 *
 * Step 1 — { newEmail }            → sends OTP to newEmail
 * Step 2 — { newEmail, code }      → verifies OTP, commits email change
 */
export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        const mobileUser = await getMobileOrWebUser(req, session?.user?.email);
        if (!mobileUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const rl = rateLimit(getClientIp(req), 'mobile-change-email', { limit: 5, windowMs: 10 * 60 * 1000 });
        if (!rl.ok) {
            return NextResponse.json(
                { error: 'Too many attempts. Please wait before trying again.' },
                { status: 429 },
            );
        }

        const body = await req.json().catch(() => ({}));
        const { newEmail, code } = body;

        if (!newEmail || typeof newEmail !== 'string') {
            return NextResponse.json({ error: 'New email is required.' }, { status: 400 });
        }

        const normalized = newEmail.toLowerCase().trim();

        // Basic email validation
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
            return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 });
        }

        // Can't change to the same email
        if (normalized === mobileUser.email?.toLowerCase()) {
            return NextResponse.json({ error: 'That is already your current email.' }, { status: 400 });
        }

        // ── STEP 2: Verify OTP + commit ───────────────────────────────────────
        if (code) {
            const otp = await (prisma as any).emailOtp.findFirst({
                where: {
                    email: normalized,
                    consumedAt: null,
                    expiresAt: { gt: new Date() },
                },
                orderBy: { createdAt: 'desc' },
            });

            if (!otp) {
                return NextResponse.json({ error: 'Code expired or not found. Request a new one.' }, { status: 400 });
            }

            if (otp.attempts >= 5) {
                await (prisma as any).emailOtp.update({ where: { id: otp.id }, data: { consumedAt: new Date() } });
                return NextResponse.json({ error: 'Too many failed attempts. Request a new code.' }, { status: 400 });
            }

            const valid = await bcrypt.compare(String(code), otp.codeHash);
            if (!valid) {
                await (prisma as any).emailOtp.update({ where: { id: otp.id }, data: { attempts: otp.attempts + 1 } });
                const remaining = 5 - (otp.attempts + 1);
                return NextResponse.json(
                    { error: `Incorrect code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.` },
                    { status: 400 },
                );
            }

            // Consume OTP
            await (prisma as any).emailOtp.update({ where: { id: otp.id }, data: { consumedAt: new Date() } });

            // Check new email not taken (race condition guard)
            const taken = await prisma.user.findUnique({ where: { email: normalized }, select: { id: true } });
            if (taken && taken.id !== mobileUser.id) {
                return NextResponse.json({ error: 'This email is already in use.' }, { status: 409 });
            }

            // Commit email change
            const updated = await (prisma as any).user.update({
                where: { id: mobileUser.id },
                data: { email: normalized, emailVerified: new Date() },
                select: { id: true, name: true, email: true, phone: true, image: true, dateOfBirth: true },
            });

            return NextResponse.json({ ok: true, user: updated });
        }

        // ── STEP 1: Send OTP to new email ─────────────────────────────────────
        // Check new email not already registered to someone else
        const existing = await prisma.user.findUnique({ where: { email: normalized }, select: { id: true } });
        if (existing && existing.id !== mobileUser.id) {
            return NextResponse.json({ error: 'This email is already in use by another account.' }, { status: 409 });
        }

        // Invalidate old OTPs for this new email
        await (prisma as any).emailOtp.updateMany({
            where: { email: normalized, consumedAt: null },
            data: { consumedAt: new Date() },
        });

        const codeStr = String(Math.floor(100000 + Math.random() * 900000));
        const codeHash = await bcrypt.hash(codeStr, 8);
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await (prisma as any).emailOtp.create({
            data: { email: normalized, codeHash, expiresAt },
        });

        // Fetch display name for personalised email (non-blocking if not found)
        const userRecord = await prisma.user.findUnique({
            where: { id: mobileUser.id },
            select: { name: true },
        });

        sendOtpEmail(normalized, userRecord?.name ?? 'there', codeStr).catch(console.error);

        return NextResponse.json({ ok: true, sent: true });
    } catch (error) {
        console.error('[mobile/profile/change-email]', error);
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}
