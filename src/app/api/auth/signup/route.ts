import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
    try {
        const { name, email, password } = await req.json();

        if (!name || !email || !password) {
            return NextResponse.json({ error: 'Name, email and password are required.' }, { status: 400 });
        }
        if (password.length < 8) {
            return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
        }

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });
        }

        const passwordHash = await bcrypt.hash(password, 12);
        const verificationToken = crypto.randomUUID();

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: passwordHash,
                verificationToken,
            },
        });

        // Auto-create loyalty card
        await prisma.loyaltyCard.create({ data: { userId: user.id } });

        // Send verification email (non-blocking — don't fail signup if email fails)
        sendVerificationEmail(email, name, verificationToken).catch(e =>
            console.error('[signup] verification email error:', e)
        );

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error('[signup] error:', e);
        return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
    }
}
