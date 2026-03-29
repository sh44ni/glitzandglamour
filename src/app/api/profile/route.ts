import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// GET — fetch current user profile data
export async function GET() {
    const session = await auth();
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await (prisma as any).user.findUnique({
        where: { email: session.user.email },
        select: { id: true, name: true, email: true, phone: true, image: true, dateOfBirth: true, googleId: true, appleId: true },
    });

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    return NextResponse.json({ user });
}

// PATCH — update profile (name + phone + avatar)
export async function PATCH(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { name, phone, image, dateOfBirth } = body;

    // Validate phone if provided
    if (phone && !/^\+?[\d\s\-().]{7,20}$/.test(phone)) {
        return NextResponse.json({ error: 'Invalid phone number format' }, { status: 400 });
    }

    // Validate DOB if provided
    let dobDate: Date | undefined;
    if (dateOfBirth) {
        dobDate = new Date(dateOfBirth);
        if (isNaN(dobDate.getTime())) {
            return NextResponse.json({ error: 'Invalid date of birth.' }, { status: 400 });
        }
    }

    const updated = await (prisma as any).user.update({
        where: { email: session.user.email },
        data: {
            ...(name ? { name: name.trim().slice(0, 80) } : {}),
            ...(phone !== undefined ? { phone: phone.trim() || null } : {}),
            ...(image ? { image } : {}),
            ...(dobDate ? { dateOfBirth: dobDate } : {}),
        },
        select: { id: true, name: true, email: true, phone: true, image: true, dateOfBirth: true, googleId: true, appleId: true },
    });

    return NextResponse.json({ user: updated });
}
