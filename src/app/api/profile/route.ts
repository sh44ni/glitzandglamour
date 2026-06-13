import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { getMobileOrWebUser } from '@/lib/mobileAuth';

// GET — fetch current user profile data
export async function GET(req: NextRequest) {
    const session = await auth();
    const mobileUser = await getMobileOrWebUser(req, session?.user?.email);
    if (!mobileUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await (prisma as any).user.findUnique({
        where: { id: mobileUser.id },
        select: { id: true, name: true, email: true, phone: true, image: true, dateOfBirth: true, googleId: true, appleId: true },
    });

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    return NextResponse.json({ user });
}

// PATCH — update profile (name + phone + avatar)
export async function PATCH(req: NextRequest) {
    const session = await auth();
    const mobileUser = await getMobileOrWebUser(req, session?.user?.email);
    if (!mobileUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

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
        where: { id: mobileUser.id },
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

// DELETE — delete user account
export async function DELETE(req: NextRequest) {
    const session = await auth();
    const mobileUser = await getMobileOrWebUser(req, session?.user?.email);
    if (!mobileUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const user = await (prisma as any).user.findUnique({
            where: { id: mobileUser.id },
            include: { loyaltyCard: true }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        await (prisma as any).$transaction(async (tx: any) => {
            await tx.booking.updateMany({
                where: { userId: user.id },
                data: { userId: null }
            });
            await tx.review.deleteMany({ where: { userId: user.id } });
            await tx.customerNote.deleteMany({ where: { userId: user.id } });

            if (user.loyaltyCard?.id) {
                await tx.appleWalletDevice.deleteMany({
                    where: { loyaltyCardId: user.loyaltyCard.id }
                });
                await tx.loyaltyCard.delete({ where: { id: user.loyaltyCard.id } });
            }

            await tx.chatConversation.updateMany({
                where: { userId: user.id },
                data: { userId: null }
            });
            await tx.blogComment.deleteMany({ where: { userId: user.id } });
            await tx.user.delete({ where: { id: user.id } });
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete user account:', error);
        return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
    }
}
