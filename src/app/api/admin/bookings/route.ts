import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdminRequest } from '@/lib/adminAuth';
import { sendBookingConfirmed, sendStampEarned, sendBookingRescheduled } from '@/lib/email';
import { sendBookingSMS, sendClientConfirmationSMS, sendClientRescheduledSMS, sendClientCancellationSMS } from '@/lib/sms';
import { updateGoogleWalletPass } from '@/lib/wallet';

// POST — Admin manually creates an appointment
export async function POST(req: NextRequest) {
    if (!(await isAdminRequest(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { customerName, serviceId, preferredDate, preferredTime, email, phone, notes } = body;

    if (!customerName || !serviceId || !preferredDate || !preferredTime) {
        return NextResponse.json({ error: 'customerName, serviceId, preferredDate and preferredTime are required' }, { status: 400 });
    }

    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) return NextResponse.json({ error: 'Service not found' }, { status: 404 });

    let userId: string | null = null;
    let guestName: string | null = customerName;
    let guestEmail: string | null = email || null;
    let guestPhone: string | null = phone || null;

    if (email) {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            userId = existingUser.id;
            guestName = null;
            guestEmail = null;
            guestPhone = null;
        }
    }

    const booking = await prisma.booking.create({
        data: {
            userId,
            guestName,
            guestEmail,
            guestPhone,
            serviceId,
            preferredDate,
            preferredTime,
            notes: notes || null,
            status: 'PENDING',
        },
        include: {
            user: { select: { name: true, email: true, phone: true, image: true } },
            service: { select: { name: true, priceLabel: true, category: true } },
        },
    });

    return NextResponse.json({ success: true, booking }, { status: 201 });
}


export async function GET(req: NextRequest) {
    if (!(await isAdminRequest(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const bookings = await prisma.booking.findMany({
        where: status && status !== 'ALL' ? { status: status as any } : undefined,
        include: {
            user: { select: { name: true, email: true, phone: true, image: true } },
            service: { select: { name: true, priceLabel: true, category: true } },
        },
        orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ bookings });
}


export async function PATCH(req: NextRequest) {
    if (!(await isAdminRequest(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { bookingId, status, newDate, newTime } = body;

    const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { user: true, service: true },
    });

    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

    const updateData: any = { status, updatedAt: new Date() };
    if (newDate) updateData.preferredDate = newDate;
    if (newTime) updateData.preferredTime = newTime;

    const updated = await prisma.booking.update({ where: { id: bookingId }, data: updateData });

    const isRescheduled = (newDate && newDate !== booking.preferredDate) || (newTime && newTime !== booking.preferredTime);
    const customerName = booking.user?.name || booking.guestName || 'Customer';
    const customerEmail = booking.user?.email || booking.guestEmail;
    const customerPhone = booking.user?.phone || booking.guestPhone;

    // CONFIRMED → email + SMS to client
    if (status === 'CONFIRMED') {
        if (isRescheduled) {
            if (customerEmail) sendBookingRescheduled(bookingId, customerEmail, customerName, booking.service.name, `${updated.preferredDate} at ${updated.preferredTime}`).catch(console.error);
            if (customerPhone) sendClientRescheduledSMS(bookingId, customerPhone, customerName, booking.service.name, updated.preferredDate, updated.preferredTime).catch(console.error);
        } else if (booking.status !== 'CONFIRMED') {
            if (customerEmail) sendBookingConfirmed(bookingId, customerEmail, customerName, booking.service.name, `${updated.preferredDate} at ${updated.preferredTime}`).catch(console.error);
            if (customerPhone) sendClientConfirmationSMS(bookingId, customerPhone, customerName, booking.service.name, updated.preferredDate, updated.preferredTime).catch(console.error);
        }
    }

    // COMPLETED → stamp + referral
    if (status === 'COMPLETED' && !booking.stampAwarded) {
        if (booking.userId) {
            let loyaltyCard = await prisma.loyaltyCard.findUnique({ where: { userId: booking.userId } });
            if (!loyaltyCard) {
                loyaltyCard = await prisma.loyaltyCard.create({ data: { userId: booking.userId } });
            }

            const newStampCount = loyaltyCard.currentStamps + 1;
            const spinAvailable = newStampCount >= 10;

            await prisma.loyaltyCard.update({
                where: { id: loyaltyCard.id },
                data: {
                    currentStamps: spinAvailable ? loyaltyCard.currentStamps + 1 : newStampCount,
                    lifetimeStamps: loyaltyCard.lifetimeStamps + 1,
                    spinAvailable: spinAvailable || loyaltyCard.spinAvailable,
                },
            });

            await prisma.stamp.create({ data: { loyaltyCardId: loyaltyCard.id, bookingId } });
            await prisma.booking.update({ where: { id: bookingId }, data: { stampAwarded: true } });

            if (customerEmail) sendStampEarned(bookingId, customerEmail, customerName, newStampCount).catch(console.error);
            updateGoogleWalletPass(loyaltyCard.id, spinAvailable ? loyaltyCard.currentStamps + 1 : newStampCount).catch(console.error);

            // Referral reward
            const bookedUser = await (prisma as any).user.findUnique({ where: { id: booking.userId }, select: { referredById: true } });
            if (bookedUser?.referredById) {
                const openReferral = await (prisma as any).referral.findFirst({ where: { referredUserId: booking.userId, rewardGiven: false } });
                if (openReferral) {
                    await (prisma as any).referral.update({ where: { id: openReferral.id }, data: { rewardGiven: true, bookingId } });
                    const referrerCard = await (prisma as any).loyaltyCard.findUnique({ where: { userId: bookedUser.referredById } });
                    if (referrerCard) {
                        await (prisma as any).loyaltyCard.update({ where: { id: referrerCard.id }, data: { referralRewards: referrerCard.referralRewards + 1 } });
                    }
                }
            }
        }
    }

    // CANCELLED → SMS to client only
    if (status === 'CANCELLED') {
        if (customerPhone) sendClientCancellationSMS(bookingId, customerPhone, customerName, booking.service.name, booking.preferredDate).catch(console.error);
    }

    return NextResponse.json({ success: true, booking: updated });
}
