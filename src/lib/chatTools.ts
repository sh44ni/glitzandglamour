import { prisma } from './prisma';
import { sendBookingReceived } from './email';
import { sendBookingSMS } from './sms';

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
                'Check real-time availability for a specific date by reading the live calendar. Returns actual free time windows based on existing bookings, manual time blocks set by the owner, and blocked dates. ALWAYS call this before suggesting any time slot to a client — never estimate or calculate availability yourself.',
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
                'Get studio hours, location, policies, contact info (including Jojo\'s phone number), and social media links. Use this when someone asks how to contact, call, text, or reach the studio.',
            parameters: { type: 'object', properties: {} },
        },
    },
    {
        type: 'function' as const,
        function: {
            name: 'get_special_events',
            description:
                'Get comprehensive information about special event services: weddings & bridal hair/makeup, quinceañeras, proms, on-location mobile glam squad, bachelorette/bridal showers, baby showers, milestone birthdays, corporate galas, and photoshoots. Returns what is included, timelines, venues served, pricing guidelines, and direct booking links.',
            parameters: {
                type: 'object',
                properties: {
                    eventType: {
                        type: 'string',
                        description:
                            'Optional event type or slug: "weddings-bridal", "quinceaneras", "prom-homecoming", "on-location-hair-makeup", "bridal-showers-bachelorettes", "baby-showers", "sweet-16-birthdays", "corporate-gala", "photo-video-shoots".',
                    },
                },
            },
        },
    },
    {
        type: 'function' as const,
        function: {
            name: 'get_loyalty_info',
            description:
                'Get information about the loyalty program, stamp cards, rewards, birthday perks, referral program, and insider benefits. Use this when someone asks about rewards, loyalty, stamps, discounts, referrals, or membership perks.',
            parameters: {
                type: 'object',
                properties: {
                    userId: {
                        type: 'string',
                        description: 'Optional user ID to get their personal loyalty card status',
                    },
                    email: {
                        type: 'string',
                        description: 'Optional email to look up their personal loyalty card status if userId is unknown',
                    },
                    phone: {
                        type: 'string',
                        description: 'Optional phone number to look up their personal loyalty card status if userId is unknown',
                    },
                },
            },
        },
    },
    {
        type: 'function' as const,
        function: {
            name: 'get_reviews_summary',
            description:
                'Get a summary of recent reviews and the studio\'s overall rating. Use this when someone asks about reviews, ratings, reputation, or what other clients think.',
            parameters: { type: 'object', properties: {} },
        },
    },
    {
        type: 'function' as const,
        function: {
            name: 'get_blocked_dates',
            description:
                'Get all dates that are completely blocked or marked as "No More Bookings" by the studio. Use this to check which dates cannot be booked at all, or when a client asks what days the studio is closed or unavailable.',
            parameters: {
                type: 'object',
                properties: {
                    from: {
                        type: 'string',
                        description: 'Optional start date in YYYY-MM-DD format (defaults to today)',
                    },
                },
            },
        },
    },
    {
        type: 'function' as const,
        function: {
            name: 'transfer_to_human',
            description:
                'Transfer the chat to a real person (JoJo or Lava) by sending them an SMS notification. Use this when: (1) the customer explicitly asks to speak to a real person, a human, or a manager, OR (2) you are confused about what the customer is asking and cannot help them after trying. Do NOT use this for simple questions you can answer.',
            parameters: {
                type: 'object',
                properties: {
                    reason: {
                        type: 'string',
                        description: 'Brief reason for the transfer, e.g. "client requested human" or "unable to understand request"',
                    },
                },
                required: ['reason'],
            },
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
        case 'get_blocked_dates':
            return { result: await toolGetBlockedDates(args) };
        case 'create_booking':
            return toolCreateBooking(args, context);
        case 'get_business_info':
            return { result: toolGetBusinessInfo() };
        case 'get_special_events':
            return { result: await toolGetSpecialEvents(args) };
        case 'get_loyalty_info':
            return { result: await toolGetLoyaltyInfo(args, context) };
        case 'get_reviews_summary':
            return { result: await toolGetReviewsSummary() };
        case 'transfer_to_human':
            return { result: await toolTransferToHuman(args, context) };
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
    try {
        const where: Record<string, unknown> = { isActive: true };
        if (args.category && typeof args.category === 'string') {
            where.category = args.category;
        }
        const services = await prisma.service.findMany({
            where,
            orderBy: { displayOrder: 'asc' },
            select: { id: true, name: true, category: true, priceLabel: true, description: true, durationMins: true },
        });
        if (services.length > 0) {
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
    } catch (err) {
        console.warn('[chatTools] prisma.service lookup failed, using static servicesDetailed fallback:', err);
    }

    // High-availability fallback from audited services
    try {
        const { SERVICES_DETAILED } = await import('../data/servicesDetailed');
        let list = SERVICES_DETAILED;
        if (args.category && typeof args.category === 'string') {
            list = list.filter(s => s.category.toLowerCase() === (args.category as string).toLowerCase());
        }
        return JSON.stringify({
            count: list.length,
            services: list.map(s => ({
                id: s.id || s.slug,
                name: s.name,
                category: s.category,
                price: s.priceLabel,
                description: s.overview?.[0] || undefined,
                durationMins: s.durationMins || undefined,
            })),
        });
    } catch {
        return JSON.stringify({ count: 0, services: [] });
    }
}

// ── check_availability ───────────────────────────────────────────────
// Reads the LIVE calendar: existing bookings, manual time blocks, and
// full-day blocks. Returns actual free time windows — never calculates
// from hardcoded durations. The owner manages her own calendar; Kitty
// just reports what's open.

// Business hours for customers: 8:30 AM – 7:00 PM.
const DAY_START = 510;  // 8:30 AM in minutes
const DAY_END = 1140;   // 7:00 PM in minutes

function timeToMinutes(timeStr: string): number {
    const cleaned = timeStr.trim().toUpperCase();
    // 12h format: "8:30 AM", "1:00 PM"
    const match12 = cleaned.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
    if (match12) {
        let h = parseInt(match12[1], 10);
        const m = parseInt(match12[2], 10);
        if (match12[3] === 'PM' && h !== 12) h += 12;
        if (match12[3] === 'AM' && h === 12) h = 0;
        return h * 60 + m;
    }
    // 24h format: "14:00", "09:30"
    const match24 = cleaned.match(/^(\d{1,2}):(\d{2})$/);
    if (match24) return parseInt(match24[1], 10) * 60 + parseInt(match24[2], 10);
    return -1;
}

function minutesToTime12(mins: number): string {
    const h24 = Math.floor(mins / 60);
    const m = mins % 60;
    const ampm = h24 >= 12 ? 'PM' : 'AM';
    const h12 = h24 % 12 || 12;
    return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}

/** Merge overlapping/adjacent windows into non-overlapping sorted list */
function mergeWindows(windows: { start: number; end: number }[]): { start: number; end: number }[] {
    if (windows.length === 0) return [];
    const sorted = [...windows].sort((a, b) => a.start - b.start);
    const merged: { start: number; end: number }[] = [sorted[0]];
    for (let i = 1; i < sorted.length; i++) {
        const last = merged[merged.length - 1];
        if (sorted[i].start <= last.end) {
            last.end = Math.max(last.end, sorted[i].end);
        } else {
            merged.push(sorted[i]);
        }
    }
    return merged;
}

async function toolCheckAvailability(args: Record<string, unknown>): Promise<string> {
    const date = typeof args.date === 'string' ? args.date : '';
    if (!date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return JSON.stringify({ error: 'Invalid date format. Use YYYY-MM-DD.' });
    }

    const today = new Date().toISOString().split('T')[0];
    if (date < today) {
        return JSON.stringify({ error: 'Cannot check availability for past dates.' });
    }

    // Check day of week (closed Sun/Mon)
    const dateObj = new Date(date + 'T12:00:00');
    const dayOfWeek = dateObj.getDay(); // 0=Sun, 1=Mon
    if (dayOfWeek === 0 || dayOfWeek === 1) {
        return JSON.stringify({
            date,
            available: false,
            freeWindows: [],
            note: 'The studio is closed on Sundays and Mondays. Please suggest Tuesday through Saturday.',
        });
    }

    // Check full-day blocks ("No More Bookings")
    const blocked = await prisma.blockedDate.findUnique({ where: { date } });
    if (blocked) {
        return JSON.stringify({
            date,
            available: false,
            blocked: true,
            freeWindows: [],
            note: 'This date is unavailable. Please choose another date.',
            message: 'This date is unavailable. Please choose another date.',
            reason: blocked.reason || undefined,
        });
    }

    // ── Gather all occupied time windows ──────────────────────────────

    // 1. Existing bookings (PENDING + CONFIRMED) — use a default 2h30m window
    //    as a baseline estimate per booking. The owner can override by adding
    //    manual blocks for longer appointments.
    const BOOKING_DEFAULT_WINDOW = 150; // 2h30m in minutes
    const bookings = await prisma.booking.findMany({
        where: {
            preferredDate: date,
            status: { in: ['PENDING', 'CONFIRMED'] },
        },
        select: { preferredTime: true },
    });

    const bookingWindows: { start: number; end: number }[] = bookings
        .map(b => {
            const startMin = timeToMinutes(b.preferredTime);
            if (startMin < 0) return null;
            return { start: startMin, end: startMin + BOOKING_DEFAULT_WINDOW };
        })
        .filter((w): w is { start: number; end: number } => w !== null);

    // 2. Manual time blocks set by the owner
    const manualBlocks = await (prisma as any).manualBlock.findMany({
        where: { date },
        select: { startTime: true, endTime: true },
    });

    const manualWindows: { start: number; end: number }[] = manualBlocks
        .map((b: { startTime: string; endTime: string }) => {
            const s = timeToMinutes(b.startTime);
            const e = timeToMinutes(b.endTime);
            if (s < 0 || e < 0) return null;
            return { start: s, end: e };
        })
        .filter((w: { start: number; end: number } | null): w is { start: number; end: number } => w !== null);

    // 3. Merge all occupied windows
    const allOccupied = mergeWindows([...bookingWindows, ...manualWindows]);

    // 4. Compute free windows within business hours
    const freeWindows: { start: number; end: number }[] = [];
    let cursor = DAY_START;

    for (const occ of allOccupied) {
        const occStart = Math.max(occ.start, DAY_START);
        const occEnd = Math.min(occ.end, DAY_END);
        if (cursor < occStart) {
            freeWindows.push({ start: cursor, end: occStart });
        }
        cursor = Math.max(cursor, occEnd);
    }
    if (cursor < DAY_END) {
        freeWindows.push({ start: cursor, end: DAY_END });
    }

    // Format for human readability
    const freeLabels = freeWindows.map(w =>
        `${minutesToTime12(w.start)} – ${minutesToTime12(w.end)}`
    );

    const totalFreeMinutes = freeWindows.reduce((sum, w) => sum + (w.end - w.start), 0);

    return JSON.stringify({
        date,
        available: freeWindows.length > 0,
        freeWindows: freeLabels,
        freeWindowCount: freeWindows.length,
        totalFreeMinutes,
        existingBookings: bookings.length,
        manualBlocks: manualBlocks.length,
        note: freeWindows.length === 0
            ? 'This day is fully booked. Suggest another date.'
            : totalFreeMinutes <= 60
                ? 'Very limited availability — book soon!'
                : `${freeWindows.length} open window(s) available. Suggest a time within these free windows.`,
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

    // Check if the requested date is fully blocked ("No More Bookings")
    const blocked = await prisma.blockedDate.findUnique({ where: { date } });
    if (blocked) {
        return {
            result: JSON.stringify({
                error: 'This date is unavailable. Please choose another date.',
                blocked: true,
                date,
                reason: blocked.reason || undefined,
            }),
        };
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

// ── get_blocked_dates ───────────────────────────────────────────────
async function toolGetBlockedDates(args: Record<string, unknown>): Promise<string> {
    const today = new Date().toISOString().split('T')[0];
    const from = typeof args.from === 'string' && args.from.match(/^\d{4}-\d{2}-\d{2}$/) ? args.from : today;
    try {
        const blocked = await prisma.blockedDate.findMany({
            where: { date: { gte: from } },
            orderBy: { date: 'asc' },
            select: { date: true, reason: true },
        });
        return JSON.stringify({
            count: blocked.length,
            blockedDates: blocked.map(b => ({
                date: b.date,
                reason: b.reason || 'No More Bookings / Studio Closed',
                message: 'This date is unavailable. Please choose another date.',
            })),
            note: 'All these dates have full-day blocks preventing all bookings across all time slots. If a client attempts to book or asks about any of these dates, immediately inform them: "This date is unavailable. Please choose another date."',
        });
    } catch (err) {
        return JSON.stringify({ count: 0, blockedDates: [], error: 'Failed to retrieve blocked dates' });
    }
}

// ── get_business_info ────────────────────────────────────────────────
function toolGetBusinessInfo(): string {
    return JSON.stringify({
        name: 'Glitz & Glamour Studio',
        owner: 'JoJany (everyone calls her Jojo)',
        location: {
            address: '935 W San Marcos Blvd, Suite 101, San Marcos, CA 92078',
            area: 'San Marcos, CA (North San Diego County)',
            note: 'We recently moved! New address: 935 W San Marcos Blvd, Suite 101, San Marcos, CA. Former location: 812 Frances Dr, Vista, CA (no longer serving there).',
        },
        hours: {
            note: 'Available time slots: 8:30 AM to 7:00 PM daily. Exact working days may vary — recommend booking and the studio will confirm.',
            slots: '8:30 AM – 7:00 PM',
        },
        contact: {
            phone: '(760) 290-5910',
            phoneNote: 'You can call or text Jojo directly at this number',
            website: 'https://www.glitzandglamours.com',
            booking: 'https://www.glitzandglamours.com/book',
            email: 'info@glitzandglamours.com',
        },
        social: {
            instagram: '@glitzandglamourstudio',
            instagramUrl: 'https://instagram.com/glitzandglamourstudio',
            note: 'Follow us on Instagram for the latest looks, behind-the-scenes, and client transformations!',
        },
        policies: {
            booking: 'All bookings are pending until confirmed by the studio. We will reach out to finalize details, discuss pricing, and collect a deposit.',
            pricing: 'Prices shown are starting points. Final pricing is confirmed in person before the appointment begins based on length, design, and add-ons.',
            cancellation: 'Cancellations or reschedules require at least 48 hours notice in advance to transfer your deposit/retainer. Cancellations made under 48 hours or no-shows forfeit the retainer.',
            gracePeriod: 'We offer a 15-minute grace period for late arrivals. After 15 minutes, the appointment may need to be rescheduled and deposit forfeited.',
            deposits: 'A deposit/retainer is required to confirm your booking. The deposit amount varies by service ($25–$50).',
            fixes: 'Complimentary fixes for application issues on nails or lashes must be requested within 48 hours.',
        },
        categories: ['Nails', 'Pedicures', 'Hair Color', 'Haircuts', 'Waxing', 'Facials'],
        specialNote: 'Jojo is bilingual (English & Spanish) and welcomes all clients! 🇺🇸🇲🇽',
    });
}

// ── get_special_events ───────────────────────────────────────────────
async function toolGetSpecialEvents(args: Record<string, unknown> = {}): Promise<string> {
    try {
        const { SPECIAL_EVENTS_DETAILED } = await import('../data/specialEventsDetailed');

        const rawRequested = (args.eventType || args.slug || args.category || '') as string;
        const requested = rawRequested.toLowerCase().trim();

        if (requested) {
            const found = SPECIAL_EVENTS_DETAILED.find(e =>
                e.slug.toLowerCase() === requested ||
                e.aliases.some(a => a.toLowerCase() === requested || requested.includes(a.toLowerCase())) ||
                e.name.toLowerCase().includes(requested) ||
                requested.includes(e.slug.toLowerCase()) ||
                ((requested.includes('wedding') || requested.includes('bride') || requested.includes('bridal')) && e.slug === 'weddings-bridal') ||
                ((requested.includes('quince') || requested.includes('xv')) && e.slug === 'quinceaneras') ||
                ((requested.includes('prom') || requested.includes('homecoming') || requested.includes('dance')) && e.slug === 'prom-homecoming') ||
                ((requested.includes('location') || requested.includes('mobile') || requested.includes('travel')) && e.slug === 'on-location-hair-makeup') ||
                ((requested.includes('bachelorette') || (requested.includes('shower') && !requested.includes('baby'))) && e.slug === 'bridal-showers-bachelorettes') ||
                (requested.includes('baby') && e.slug === 'baby-showers') ||
                ((requested.includes('sweet') || requested.includes('birthday') || requested.includes('16')) && e.slug === 'sweet-16-birthdays') ||
                ((requested.includes('corporate') || requested.includes('gala') || requested.includes('headshot')) && e.slug === 'corporate-gala') ||
                ((requested.includes('shoot') || requested.includes('photo') || requested.includes('model') || requested.includes('video')) && e.slug === 'photo-video-shoots')
            );

            if (found) {
                return JSON.stringify({
                    matchedEvent: {
                        name: found.name,
                        slug: found.slug,
                        tag: found.tag,
                        headline: found.h1,
                        shortDesc: found.shortDesc,
                        overview: found.overview?.[0] || '',
                        servicesOffered: found.servicesOffered,
                        whatsIncluded: found.whatsIncluded,
                        timelineGuide: found.timelineGuide,
                        serviceAreas: {
                            studio: found.serviceAreas.primary,
                            mobileCities: found.serviceAreas.cities,
                            popularVenues: found.serviceAreas.venues,
                        },
                        pricingNote: found.pricingNote,
                        faqs: found.faqs.slice(0, 3),
                        directPageUrl: `https://www.glitzandglamours.com/special-events/${found.slug}`,
                    },
                    bookingAndInquiry: {
                        instructions: 'Special event packages are customized based on party size, services requested, and location (in-studio or on-location).',
                        inquiryFormUrl: 'https://www.glitzandglamours.com/special-events',
                        directContact: 'Call or text Jojo directly at (760) 290-5910',
                        recommendedBookingLeadTime: 'Weddings & Quinceañeras: 1–3 months in advance. Proms & smaller groups (3+): 2–4 weeks in advance.',
                    },
                });
            }
        }

        // Return comprehensive list of all 9 special event services
        return JSON.stringify({
            headline: 'Special Events & Luxury Glam Squad — Glitz & Glamour Studio',
            studioAddress: '935 W San Marcos Blvd, Suite 101, San Marcos, CA 92078 (moved here from Vista — Vista is permanently closed)',
            mobileTravelArea: 'On-location travel throughout North County San Diego (San Marcos, Vista, Carlsbad, Escondido, Oceanside, Encinitas, Fallbrook, Poway) and Temecula wine country.',
            venuesFrequentlyServed: ['Twin Oaks House & Gardens', 'Lakehouse Resort at Lake San Marcos', 'The Vistonian (Vista)', 'Leo Carrillo Ranch (Carlsbad)', 'Bandy Canyon Ranch (Escondido)', 'Shadowridge Golf Club'],
            totalEventServices: SPECIAL_EVENTS_DETAILED.length,
            events: SPECIAL_EVENTS_DETAILED.map(e => ({
                name: e.name,
                slug: e.slug,
                tag: e.tag,
                shortDesc: e.shortDesc,
                pills: e.pills,
                directPageUrl: `https://www.glitzandglamours.com/special-events/${e.slug}`,
            })),
            howToBook: {
                inquiryFormUrl: 'https://www.glitzandglamours.com/special-events',
                directPhone: '(760) 290-5910 (Call or text Jojo directly)',
                instagram: '@glitzandglamourstudio',
                pricing: 'Custom quotes based on party size, services selected, and travel distance.',
                advanceNotice: '1–3 months for weddings & quinceañeras; 2–4 weeks for groups of 3+.',
            },
        });
    } catch (err) {
        console.error('[chatTools] get_special_events error:', err);
        return JSON.stringify({
            headline: 'Special Events at Glitz & Glamour',
            eventTypes: ['Weddings & Bridal', 'Quinceañeras', 'Prom & Homecoming', 'On-Location Mobile Glam', 'Bridal Showers', 'Baby Showers', 'Sweet 16 & Birthdays', 'Corporate Galas', 'Photoshoots'],
            howToBook: 'Visit glitzandglamours.com/special-events or call/text Jojo at (760) 290-5910',
            location: '935 W San Marcos Blvd, Suite 101, San Marcos, CA 92078',
        });
    }
}

// ── get_loyalty_info ─────────────────────────────────────────────────
async function toolGetLoyaltyInfo(
    args: Record<string, unknown>,
    context: { userId?: string | null }
): Promise<string> {
    // Get the user's personal loyalty status if they're logged in
    let personalStatus: Record<string, unknown> | null = null;
    let userId = (args.userId as string) || context.userId;

    // Look up by email or phone if userId isn't known
    if (!userId && (args.email || args.phone)) {
        const query: any = [];
        if (args.email && typeof args.email === 'string') query.push({ email: args.email });
        if (args.phone && typeof args.phone === 'string') query.push({ phone: args.phone });
        
        if (query.length > 0) {
            const user = await prisma.user.findFirst({
                where: { OR: query },
                select: { id: true },
            });
            if (user) userId = user.id;
        }
    }

    if (userId) {
        try {
            const card = await prisma.loyaltyCard.findUnique({
                where: { userId },
                select: {
                    currentStamps: true,
                    lifetimeStamps: true,
                    spinAvailable: true,
                    spinsRedeemed: true,
                    birthdaySpinAvailable: true,
                    isInsider: true,
                    referralCode: true,
                    referralRewards: true,
                },
            });
            if (card) {
                personalStatus = {
                    currentStamps: card.currentStamps,
                    stampsNeeded: 10 - card.currentStamps,
                    lifetimeStamps: card.lifetimeStamps,
                    freeRewardAvailable: card.spinAvailable,
                    birthdayRewardAvailable: card.birthdaySpinAvailable,
                    isInsider: card.isInsider,
                    referralCode: card.referralCode,
                    referralRewards: card.referralRewards,
                };
            }
        } catch (err) {
            console.error('[chatTools] loyalty lookup error:', err);
        }
    }

    return JSON.stringify({
        program: {
            name: 'Glitz & Glamour Loyalty Card',
            howItWorks: 'Earn 1 stamp per completed appointment. After 10 stamps, you get a FREE nail set!',
            stampsToReward: 10,
            reward: 'Free nail set (your choice of style)',
        },
        birthdayPerk: {
            description: 'Birthday month? You get a free Spin the Wheel reward! 🎂',
            howToClaim: 'Make sure your date of birth is in your profile — the reward unlocks automatically during your birthday month.',
        },
        referralProgram: {
            description: 'Refer friends and earn rewards!',
            howItWorks: 'Share your unique referral code. When your friend signs up AND completes their first booking, you earn a bonus stamp.',
            benefit: '1 bonus stamp per successful referral',
        },
        insiderPerks: {
            description: 'Top clients unlock Insider status',
            benefits: ['Priority booking', 'Early access to promotions', 'Exclusive offers'],
        },
        digitalWallets: 'Your loyalty card can be added to both Apple Wallet (iOS) and Google Wallet (Android) for easy pass tracking! 🍎🤖',
        personalStatus: personalStatus || 'Sign up or log in to track your stamps and rewards!',
        signUpUrl: 'https://www.glitzandglamours.com (create an account to start collecting stamps)',
    });
}

// ── get_reviews_summary ──────────────────────────────────────────────
async function toolGetReviewsSummary(): Promise<string> {
    try {
        const [reviews, reviewCount] = await Promise.all([
            prisma.review.findMany({
                orderBy: { createdAt: 'desc' },
                take: 10,
                select: {
                    rating: true,
                    text: true,
                    source: true,
                    authorName: true,
                    user: { select: { name: true } },
                    createdAt: true,
                },
            }),
            prisma.review.count(),
        ]);

        const avgRating = reviews.length > 0
            ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
            : '5.0';

        return JSON.stringify({
            totalReviews: reviewCount,
            averageRating: avgRating,
            perfectScore: avgRating === '5.0',
            recentReviews: reviews.slice(0, 5).map(r => ({
                name: r.user?.name || r.authorName || 'Client',
                rating: r.rating,
                text: r.text.length > 150 ? r.text.substring(0, 150) + '...' : r.text,
                source: r.source,
                date: r.createdAt.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            })),
            viewAllUrl: 'https://www.glitzandglamours.com/reviews',
            leaveReviewUrl: 'https://www.glitzandglamours.com/reviews',
            highlights: 'Clients love Jojo\'s attention to detail, warm personality, and stunning nail art. Many mention the studio\'s welcoming atmosphere and professional service.',
        });
    } catch (err) {
        console.error('[chatTools] reviews summary error:', err);
        return JSON.stringify({
            averageRating: '5.0',
            note: 'Glitz & Glamour has a perfect 5-star rating! Visit www.glitzandglamours.com/reviews to read what clients are saying.',
        });
    }
}

// ── transfer_to_human ────────────────────────────────────────────────
const TAKEOVER_NUMBERS = [
    { name: 'JoJo', phone: '+17602905910' },
    { name: 'Lava', phone: '+17602125590' },
];

async function toolTransferToHuman(
    args: Record<string, unknown>,
    context: { conversationId?: string }
): Promise<string> {
    const reason = (args.reason as string) || 'Client requested human assistance';
    const convId = context.conversationId || 'unknown';
    const takeoverLink = `https://glitzandglamours.com/admin/chats?takeover=${convId}`;

    const smsBody = `Hey! 👋 It's Kitty — a client needs some assistance. Please take over the chat: ${takeoverLink}`;

    // Label the conversation + store transfer reason
    if (context.conversationId) {
        await prisma.chatConversation.update({
            where: { id: context.conversationId },
            data: {
                label: `🚨 Transfer: ${reason.slice(0, 40)}`,
                transferReason: reason,
            },
        }).catch(err => console.error('[chat] Failed to label transfer:', err));

        // Insert system message so the transfer is logged in chat history
        await prisma.chatMessage.create({
            data: {
                conversationId: context.conversationId,
                role: 'system',
                content: `🔄 Kitty requested a transfer to a real person. Reason: ${reason}`,
            },
        }).catch(err => console.error('[chat] Failed to create transfer message:', err));
    }

    // Fire SMS directly via Pingram (bypasses notification log which requires a bookingId)
    const { buildPingram } = await import('./pingramClient');
    const pingram = await buildPingram();
    let sent = 0;

    if (pingram) {
        const results = await Promise.allSettled(
            TAKEOVER_NUMBERS.map(async ({ name, phone }) => {
                console.log(`[chat] Sending takeover SMS to ${name} (${phone})`);
                await pingram.send({
                    type: 'booking_request',
                    to: { id: phone, number: phone },
                    sms: { message: smsBody },
                });
            })
        );
        sent = results.filter(r => r.status === 'fulfilled').length;
    } else {
        console.log('[chat] No Pingram key — SMS skipped');
    }

    console.log(`[chat] Transfer SMS sent to ${sent}/${TAKEOVER_NUMBERS.length} recipients`);

    return JSON.stringify({
        success: true,
        message: `Transfer initiated! SMS sent to ${sent} team member(s). The team has been notified and will take over this chat shortly. Let the client know help is on the way.`,
        reason,
    });
}

