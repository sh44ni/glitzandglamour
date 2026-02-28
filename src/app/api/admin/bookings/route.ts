import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { sendBookingConfirmed, sendStampEarned, sendBookingRescheduled } from '@/lib/email';
import { sendCancellationSMS } from '@/lib/sms';

async function checkAdmin() {
    const session = await auth();
    const role = (session?.user as { role?: string })?.role;
    return role === 'ADMIN';
}

// POST — Admin manually creates an appointment
export async function POST(req: NextRequest) {
    if (!(await checkAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { customerName, serviceId, preferredDate, preferredTime, email, phone, notes } = body;

    if (!customerName || !serviceId || !preferredDate || !preferredTime) {
        return NextResponse.json({ error: 'customerName, serviceId, preferredDate and preferredTime are required' }, { status: 400 });
    }

    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) return NextResponse.json({ error: 'Service not found' }, { status: 404 });

    // If email provided, link to existing user account; otherwise store as guest
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
    if (!(await checkAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

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
    if (!(await checkAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { bookingId, status, newDate, newTime } = body;

    const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
            user: true,
            service: true,
        },
    });

    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

    // Update status and optionally date/time
    const updateData: any = { status, updatedAt: new Date() };
    if (newDate) updateData.preferredDate = newDate;
    if (newTime) updateData.preferredTime = newTime;

    const updated = await prisma.booking.update({
        where: { id: bookingId },
        data: updateData,
    });

    const isRescheduled = (newDate && newDate !== booking.preferredDate) || (newTime && newTime !== booking.preferredTime);
    const customerName = booking.user?.name || booking.guestName || 'Customer';
    const customerEmail = booking.user?.email || booking.guestEmail;

    // CONFIRMED → send confirmation email or rescheduled email
    if (status === 'CONFIRMED' && customerEmail) {
        if (isRescheduled) {
            sendBookingRescheduled(
                customerEmail,
                customerName,
                booking.service.name,
                `${updated.preferredDate} at ${updated.preferredTime}`
            ).catch(console.error);
        } else if (booking.status !== 'CONFIRMED') {
            sendBookingConfirmed(
                customerEmail,
                customerName,
                booking.service.name,
                `${updated.preferredDate} at ${updated.preferredTime}`
            ).catch(console.error);
        }
    }

    // COMPLETED → award stamp if user has account
    if (status === 'COMPLETED' && !booking.stampAwarded) {
        if (booking.userId) {
            // Find or create loyalty card
            let loyaltyCard = await prisma.loyaltyCard.findUnique({
                where: { userId: booking.userId },
            });

            if (!loyaltyCard) {
                loyaltyCard = await prisma.loyaltyCard.create({
                    data: { userId: booking.userId },
                });
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

            await prisma.stamp.create({
                data: {
                    loyaltyCardId: loyaltyCard.id,
                    bookingId: bookingId,
                },
            });

            await prisma.booking.update({
                where: { id: bookingId },
                data: { stampAwarded: true },
            });

            // Send stamp email
            if (customerEmail) {
                sendStampEarned(customerEmail, customerName, newStampCount).catch(console.error);
            }
        }
    }

    // CANCELLED → SMS to JoJany
    if (status === 'CANCELLED') {
        sendCancellationSMS(customerName, booking.service.name, booking.preferredDate).catch(console.error);
    }

    return NextResponse.json({ success: true, booking: updated });
}
