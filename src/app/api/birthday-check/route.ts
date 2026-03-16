import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

/**
 * POST /api/birthday-check
 * Called on card page mount. Checks if today is the user's birthday and
 * grants a spin if it hasn't been granted yet this year.
 */
export async function POST() {
    try {
        const session = await auth();
        if (!session?.user?.email) return NextResponse.json({ birthdayToday: false, spinGranted: false });

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true, dateOfBirth: true },
        });

        if (!user?.dateOfBirth) return NextResponse.json({ birthdayToday: false, spinGranted: false, noDob: true });

        const today = new Date();
        const dob = new Date(user.dateOfBirth);
        const isBirthday = today.getMonth() === dob.getMonth() && today.getDate() === dob.getDate();

        if (!isBirthday) return NextResponse.json({ birthdayToday: false, spinGranted: false });

        // It's their birthday! Check if we already granted this year
        const card = await prisma.loyaltyCard.findUnique({
            where: { userId: user.id },
            select: { id: true, birthdaySpinGrantedYear: true, spinAvailable: true },
        });

        if (!card) return NextResponse.json({ birthdayToday: true, spinGranted: false });

        const currentYear = today.getFullYear();
        const alreadyGranted = (card as any).birthdaySpinGrantedYear === currentYear;

        if (alreadyGranted) return NextResponse.json({ birthdayToday: true, spinGranted: false, alreadyGranted: true });

        // Grant birthday spin!
        await (prisma as any).loyaltyCard.update({
            where: { id: card.id },
            data: {
                spinAvailable: true,
                birthdaySpinGrantedYear: currentYear,
            },
        });

        // Log a special birthday stamp entry
        await prisma.stamp.create({
            data: {
                loyaltyCardId: card.id,
                note: `🎂 Birthday spin reward — ${today.getFullYear()}`,
            },
        });

        return NextResponse.json({ birthdayToday: true, spinGranted: true });
    } catch (error) {
        console.error('[birthday-check]', error);
        return NextResponse.json({ birthdayToday: false, spinGranted: false });
    }
}
