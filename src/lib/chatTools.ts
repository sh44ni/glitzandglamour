import { prisma } from './prisma';
import { sendBookingReceived } from './email';
import { sendBookingSMS } from './sms';

// ── Available time slots (matches booking page) ──────────────────────
const ALL_TIMES = [
    '8:30 AM', '8:45 AM', '9:00 AM', '9:15 AM', '9:30 AM', '9:45 AM',
    '10:00 AM', '10:15 AM', '10:30 AM', '10:45 AM', '11:00 AM', '11:15 AM',
    '11:30 AM', '11:45 AM', '12:00 PM', '12:15 PM', '12:30 PM', '12:45 PM',
    '1:00 PM', '1:15 PM', '1:30 PM', '1:45 PM', '2:00 PM', '2:15 PM',
    '2:30 PM', '2:45 PM', '3:00 PM', '3:15 PM', '3:30 PM', '3:45 PM',
    '4:00 PM', '4:15 PM', '4:30 PM', '4:45 PM', '5:00 PM', '5:15 PM',
    '5:30 PM', '5:45 PM', '6:00 PM', '6:15 PM', '6:30 PM', '6:45 PM', '7:00 PM',
];

// ── Tool definitions (OpenAI function-calling format) ────────────────
export const TOOL_DEFINITIONS = [
    {
        type: 'function' as const,
        function: {
            name: 'get_services',
            description:
                'Get the full list of available salon services with real prices from the database. Optionally filter by category. Always use this instead of guessing prices.',
            parameters: {
                type: 'object',
                properties: {
                    category: {
                        type: 'string',
                        enum: ['nails', 'pedicures', 'haircolor', 'haircuts', 'waxing', 'facials'],
                        description: 'Optional category filter',
                    },
                },
            },
        },
    },
    {
        type: 'function' as const,
        function: {
            name: 'check_availability',
            description:
                'Check which time slots are already booked for a specific date. Returns booked slots and remaining open slots. Use this when user asks about availability.',
            parameters: {
                type: 'object',
                properties: {
                    date: {
                        type: 'string',
                        description: 'Date in YYYY-MM-DD format',
                    },
                },
                required: ['date'],
            },
        },
    },
    {
        type: 'function' as const,
        function: {
            name: 'create_booking',
            description:
                'Create a new booking appointment. ONLY call this after the user has explicitly confirmed all details. The booking is pending — the studio will reach out to finalize and collect deposit.',
            parameters: {
                type: 'object',
                properties: {
                    serviceId: {
                        type: 'string',
                        description: 'The service ID from the database',
                    },
                    date: {
                        type: 'string',
                        description: 'Preferred date in YYYY-MM-DD format',
                    },
                    time: {
                        type: 'string',
                        description: 'Preferred time, e.g. "2:00 PM"',
                    },
                    guestName: {
                        type: 'string',
                        description: "Client's full name",
                    },
                    guestPhone: {
                        type: 'string',
                        description: "Client's phone number",
                    },
                    guestEmail: {
                        type: 'string',
                        description: "Client's email (optional)",
                    },
                    notes: {
                        type: 'string',
                        description: 'Any notes or special requests',
                    },
                },
                required: ['serviceId', 'date', 'time', 'guestName', 'guestPhone'],
            },
        },
    },
    {
        type: 'function' as const,
        function: {
            name: 'get_business_info',
            description:
                'Get studio hours, location, policies, and contact information.',
            parameters: { type: 'object', properties: {} },
        },
    },
];

// ── Tool executor ────────────────────────────────────────────────────
export async function executeTool(
    name: string,
    args: Record<string, unknown>,
    context: { userId?: string | null; ip?: string; conversationId?: string }
): Promise<{ result: string; bookingCard?: BookingCardData }> {
    switch (name) {
        case 'get_services':
            return { result: await toolGetServices(args) };
        case 'check_availability':
            return { result: await toolCheckAvailability(args) };
        case 'create_booking':
            return toolCreateBooking(args, context);
        case 'get_business_info':
            return { result: toolGetBusinessInfo() };
        default:
            return { result: JSON.stringify({ error: `Unknown tool: ${name}` }) };
    }
}

export type BookingCardData = {
    bookingId: string;
    service: string;
    priceLabel: string;
    date: string;
    time: string;
    guestName: string;
    status: 'pending';
};

// ── get_services ─────────────────────────────────────────────────────
async function toolGetServices(args: Record<string, unknown>): Promise<string> {
    const where: Record<string, unknown> = { isActive: true };
    if (args.category && typeof args.category === 'string') {
        where.category = args.category;
    }
    const services = await prisma.service.findMany({
        where,
        orderBy: { displayOrder: 'asc' },
        select: { id: true, name: true, category: true, priceLabel: true, description: true, durationMins: true },
    });
    return JSON.stringify({
        count: services.length,
        services: services.map(s => ({
            id: s.id,
            name: s.name,
            category: s.category,
            price: s.priceLabel,
            description: s.description || undefined,
            durationMins: s.durationMins || undefined,
        })),
    });
}

// ── check_availability ───────────────────────────────────────────────
async function toolCheckAvailability(args: Record<string, unknown>): Promise<string> {
    const date = typeof args.date === 'string' ? args.date : '';
    if (!date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return JSON.stringify({ error: 'Invalid date format. Use YYYY-MM-DD.' });
    }

    const today = new Date().toISOString().split('T')[0];
    if (date < today) {
        return JSON.stringify({ error: 'Cannot check availability for past dates.' });
    }

    const bookings = await prisma.booking.findMany({
        where: {
            preferredDate: date,
            status: { in: ['PENDING', 'CONFIRMED'] },
        },
        select: { preferredTime: true },
    });

    const bookedTimes = new Set(bookings.map(b => b.preferredTime));
    const openSlots = ALL_TIMES.filter(t => !bookedTimes.has(t));

    return JSON.stringify({
        date,
        totalSlots: ALL_TIMES.length,
        bookedCount: bookedTimes.size,
        openCount: openSlots.length,
        openSlots: openSlots.length > 20
            ? `${openSlots.length} slots available — most of the day is open`
            : openSlots,
        note: openSlots.length === 0
            ? 'This day is fully booked. Suggest another date.'
            : openSlots.length < 5
                ? 'Only a few slots left — book soon!'
                : 'Plenty of availability.',
    });
}

// ── create_booking ───────────────────────────────────────────────────
async function toolCreateBooking(
    args: Record<string, unknown>,
    context: { userId?: string | null; ip?: string; conversationId?: string }
): Promise<{ result: string; bookingCard?: BookingCardData }> {
    const { serviceId, date, time, guestName, guestPhone, guestEmail, notes } = args as {
        serviceId: string;
        date: string;
        time: string;
        guestName: string;
        guestPhone: string;
        guestEmail?: string;
        notes?: string;
    };

    if (!serviceId || !date || !time || !guestName || !guestPhone) {
        return { result: JSON.stringify({ error: 'Missing required fields: serviceId, date, time, guestName, guestPhone' }) };
    }

    // Look up service
    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) {
        // Try matching by name
        const byName = await prisma.service.findFirst({
            where: { name: { contains: serviceId, mode: 'insensitive' }, isActive: true },
        });
        if (!byName) {
            return { result: JSON.stringify({ error: `Service "${serviceId}" not found. Use get_services to find valid service IDs.` }) };
        }
        return toolCreateBooking({ ...args, serviceId: byName.id }, context);
    }

    // Auto-link if email matches existing user
    let userId: string | null = context.userId || null;
    if (!userId && guestEmail) {
        const existing = await prisma.user.findUnique({ where: { email: guestEmail } });
        if (existing) userId = existing.id;
    }

    const booking = await prisma.booking.create({
        data: {
            userId,
            guestName: userId ? null : guestName,
            guestEmail: userId ? null : (guestEmail || null),
            guestPhone: userId ? null : guestPhone,
            serviceId: service.id,
            preferredDate: date,
            preferredTime: time,
            notes: notes ? `[Booked via Hello Kitty 🐱] ${notes}` : '[Booked via Hello Kitty 🐱]',
            status: 'PENDING',
            bookingIp: context.ip || null,
        } as any,
    });

    // ── Auto-label the chat conversation ──────────────────────────
    if (context.conversationId) {
        await prisma.chatConversation.update({
            where: { id: context.conversationId },
            data: {
                label: `Booking: ${service.name}`,
                hasBooking: true,
            },
        }).catch(err => console.error('[chat] Failed to label conversation:', err));
    }

    // Fire notifications (same flow as regular bookings)
    const name = guestName || 'Customer';
    if (guestEmail) {
        sendBookingReceived(booking.id, guestEmail, name, service.name, date, time).catch(console.error);
    }
    sendBookingSMS(booking.id, name, service.name, date, time, notes || undefined, guestPhone).catch(console.error);

    const card: BookingCardData = {
        bookingId: booking.id,
        service: service.name,
        priceLabel: service.priceLabel,
        date,
        time,
        guestName: name,
        status: 'pending',
    };

    return {
        result: JSON.stringify({
            success: true,
            bookingId: booking.id,
            message: `Booking request submitted! ${service.name} on ${date} at ${time} for ${name}. This is a PENDING request — our team will reach out to finalize pricing and collect a deposit to fully confirm the appointment.`,
        }),
        bookingCard: card,
    };
}

// ── get_business_info ────────────────────────────────────────────────
function toolGetBusinessInfo(): string {
    return JSON.stringify({
        name: 'Glitz & Glamour Studio',
        owner: 'JoJany',
        location: 'Vista, CA (North San Diego County)',
        hours: {
            note: 'Available time slots: 8:30 AM to 7:00 PM daily. Exact working days may vary — recommend booking and the studio will confirm.',
            slots: '8:30 AM – 7:00 PM',
        },
        contact: {
            website: 'https://glitzandglamours.com',
            booking: 'https://glitzandglamours.com/book',
        },
        policies: {
            booking: 'All bookings are pending until confirmed by the studio. We will reach out to finalize details, discuss pricing, and collect a deposit.',
            pricing: 'Prices shown are starting points. Final pricing is confirmed in person before the appointment begins based on length, design, and add-ons.',
            cancellation: 'Please contact the studio directly for any changes to your appointment.',
        },
        categories: ['Nails', 'Pedicures', 'Hair Color', 'Haircuts', 'Waxing', 'Facials'],
    });
}
