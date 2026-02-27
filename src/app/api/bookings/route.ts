import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { sendBookingReceived } from '@/lib/email';
import { sendBookingSMS } from '@/lib/sms';

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        const body = await req.json();
        const {
            guestName, guestEmail, guestPhone,
            serviceId, preferredDate, preferredTime, notes,
        } = body;

        if (!serviceId || !preferredDate || !preferredTime) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const service = await prisma.service.findUnique({ where: { id: serviceId } });
        if (!service) {
            return NextResponse.json({ error: 'Service not found' }, { status: 404 });
        }

        let userId: string | null = null;
        let customerName = guestName;
        let customerEmail = guestEmail;

        const userRole = (session?.user as { role?: string })?.role;

        // If logged in as customer, link booking to their account
        if (session?.user?.email && userRole === 'CUSTOMER') {
            const user = await prisma.user.findUnique({ where: { email: session.user.email } });
            if (user) {
                userId = user.id;
                customerName = user.name;
                customerEmail = user.email;
            }
        } else if (guestEmail) {
            // Check if a user account exists with this guest email → auto-link
            const existingUser = await prisma.user.findUnique({ where: { email: guestEmail } });
            if (existingUser) {
                userId = existingUser.id;
                customerName = existingUser.name;
                customerEmail = existingUser.email;
            }
        }

        const booking = await prisma.booking.create({
            data: {
                userId,
                guestName: userId ? null : guestName,
                guestEmail: userId ? null : guestEmail,
                guestPhone: userId ? null : guestPhone,
                serviceId,
                preferredDate,
                preferredTime,
                notes: notes || null,
                status: 'PENDING',
            },
        });

        // Fire notifications (non-blocking)
        const name = customerName || guestName || 'Customer';
        const email = customerEmail || guestEmail;

        if (email) {
            sendBookingReceived(email, name, service.name, preferredDate, preferredTime).catch(console.error);
        }
        sendBookingSMS(name, service.name, preferredDate, preferredTime, notes).catch(console.error);

        // Log notification attempts
        if (email) {
            await prisma.notificationLog.create({
                data: {
                    bookingId: booking.id,
                    type: 'email',
                    status: 'sent',
                    message: `Booking received email to ${email}`,
                },
            }).catch(console.error);
        }
        await prisma.notificationLog.create({
            data: {
                bookingId: booking.id,
                type: 'sms',
                status: 'sent',
                message: `SMS to JoJany`,
            },
        }).catch(console.error);

        return NextResponse.json({ success: true, bookingId: booking.id }, { status: 201 });
    } catch (error) {
        console.error('[BOOKING CREATE ERROR]', error);
        return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
    }
}

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({ where: { email: session.user.email } });
        if (!user) return NextResponse.json({ bookings: [] });

        const bookings = await prisma.booking.findMany({
            where: { userId: user.id },
            include: { service: { select: { name: true, priceLabel: true, category: true } } },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({ bookings });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
    }
}
