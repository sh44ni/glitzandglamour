import { prisma } from './prisma';
import { sendBookingReceived } from './email';
import { sendBookingSMS } from './sms';
import { POLICY_TOOL_SUMMARY } from './studioPolicies';
import { getOriginBadgeConfig, type OriginBadgeConfig } from './originBadges';
import {
    formatClientNotes,
    isValidChatUploadUrl,
    normalizeDiscoverySource,
} from './kittyEmotes';
import {
    getDayAvailability,
    findNextOpenDateAvailability,
    checkSlotAvailable,
    getPacificNow,
    type TimeSlotItem,
} from './availability';

export type AvailabilityWidgetData = {
    date: string;
    formattedDate: string;
    available: boolean;
    blocked: boolean;
    slots: TimeSlotItem[];
};

export type AttributionSavedData = {
    bookingId: string;
    source: string;
    badge: OriginBadgeConfig | null;
};

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
                'Create a new booking appointment. ONLY call this after the client has confirmed their service, date, time, full name, phone number, AND you have gathered their design/service requirements (or noted they prefer consultation in person) plus inspected any uploaded inspo photos. The booking is pending — the studio will reach out to finalize and collect the retainer.',
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
                        description:
                            'Concise structured summary of the client’s requirements & preferences (nail shape/length/art/chrome/removal needs, hair history/box dye/target tone, skin sensitivities, plus key details seen in uploaded inspo photos). Write ONLY client requirements — never write "Booked via Hello Kitty".',
                    },
                    inspoImageUrls: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'Optional list of validated uploaded studio inspo image URLs (/api/images/uploads/...) shared in this chat (up to 5).',
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
    {
        type: 'function' as const,
        function: {
            name: 'save_booking_discovery_source',
            description:
                'Record how the client heard about Glitz & Glamour Studio (e.g. Google, Instagram, Facebook, TikTok, Yelp, Word of Mouth, Walked / Drove By, Other) onto the booking just created in this chat. ONLY call this after create_booking succeeded and the client tells you how they found the studio.',
            parameters: {
                type: 'object',
                properties: {
                    source: {
                        type: 'string',
                        description: 'How the client found the studio (e.g. "Google", "Instagram", "Facebook", "TikTok", "Yelp", "Word of Mouth", "Walked / Drove By", or custom text)',
                    },
                },
                required: ['source'],
            },
        },
    },
];

// ── Tool executor ────────────────────────────────────────────────────
export async function executeTool(
    name: string,
    args: Record<string, unknown>,
    context: { userId?: string | null; ip?: string; conversationId?: string; conversationInspoUrls?: string[] }
): Promise<{
    result: string;
    bookingCard?: BookingCardData;
    availabilityWidget?: AvailabilityWidgetData;
    attributionSaved?: AttributionSavedData;
}> {
    switch (name) {
        case 'get_services':
            return { result: await toolGetServices(args) };
        case 'check_availability':
            return toolCheckAvailability(args);
        case 'get_blocked_dates':
            return { result: await toolGetBlockedDates(args) };
        case 'create_booking':
            return toolCreateBooking(args, context);
        case 'save_booking_discovery_source':
            return toolSaveBookingDiscoverySource(args, context);
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
    notes?: string | null;
    inspoImageUrls?: string[];
    heardFrom?: string | null;
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
async function toolCheckAvailability(
    args: Record<string, unknown>
): Promise<{ result: string; availabilityWidget?: AvailabilityWidgetData }> {
    const date = typeof args.date === 'string' ? args.date.trim() : '';
    if (!date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return { result: JSON.stringify({ error: 'Invalid date format. Use YYYY-MM-DD.' }) };
    }

    const { today } = getPacificNow();
    if (date < today) {
        return { result: JSON.stringify({ error: 'Cannot check availability for past dates.' }) };
    }

    const avail = await getDayAvailability(date);

    // If this date is blocked or fully booked, also look up the next open date
    if (!avail.available) {
        const nextOpen = await findNextOpenDateAvailability(date);
        const widget: AvailabilityWidgetData | undefined = nextOpen
            ? {
                date: nextOpen.date,
                formattedDate: nextOpen.formattedDate,
                available: true,
                blocked: false,
                slots: nextOpen.chatSlots,
            }
            : undefined;

        return {
            result: JSON.stringify({
                date,
                formattedDate: avail.formattedDate,
                available: false,
                blocked: avail.blocked,
                freeWindows: [],
                availableSlots: [],
                bookedSlots: avail.bookedSlots,
                note: 'This date is unavailable. Please choose another date.',
                message: 'This date is unavailable. Please choose another date.',
                reason: avail.blockReason || undefined,
                nextAvailableDate: nextOpen
                    ? {
                        date: nextOpen.date,
                        formattedDate: nextOpen.formattedDate,
                        freeWindows: nextOpen.freeWindows,
                        availableSlots: nextOpen.availableSlots,
                        bookedSlots: nextOpen.bookedSlots,
                    }
                    : undefined,
            }),
            availabilityWidget: widget,
        };
    }

    return {
        result: JSON.stringify({
            date: avail.date,
            formattedDate: avail.formattedDate,
            available: avail.available,
            freeWindows: avail.freeWindows,
            freeWindowCount: avail.freeWindowCount,
            totalFreeMinutes: avail.totalFreeMinutes,
            availableSlots: avail.availableSlots,
            bookedSlots: avail.bookedSlots,
            existingBookings: avail.existingBookings,
            manualBlocks: avail.manualBlocks,
            note: avail.bookedSlots.length > 0
                ? `${avail.availableSlots.length} open time slots available. Already booked times (${avail.bookedSlots.join(', ')}) are marked "Already Booked" in the interactive selector below.`
                : `${avail.availableSlots.length} open time slots available from 9:00 AM to 7:00 PM in the interactive selector below.`,
        }),
        availabilityWidget: {
            date: avail.date,
            formattedDate: avail.formattedDate,
            available: avail.available,
            blocked: avail.blocked,
            slots: avail.chatSlots,
        },
    };
}

// ── create_booking ───────────────────────────────────────────────────
async function toolCreateBooking(
    args: Record<string, unknown>,
    context: { userId?: string | null; ip?: string; conversationId?: string; conversationInspoUrls?: string[] }
): Promise<{ result: string; bookingCard?: BookingCardData; availabilityWidget?: AvailabilityWidgetData }> {
    const { serviceId, date, time, guestName, guestPhone, guestEmail, notes, inspoImageUrls } = args as {
        serviceId: string;
        date: string;
        time: string;
        guestName: string;
        guestPhone: string;
        guestEmail?: string;
        notes?: string;
        inspoImageUrls?: unknown;
    };

    if (!serviceId || !date || !time || !guestName || !guestPhone) {
        return { result: JSON.stringify({ error: 'Missing required fields: serviceId, date, time, guestName, guestPhone' }) };
    }

    // Verify both full-day blocks AND time-slot conflicts before creating booking
    const slotCheck = await checkSlotAvailable(date, time);
    if (!slotCheck.ok) {
        if (slotCheck.dayAvailability.blocked) {
            return {
                result: JSON.stringify({
                    error: 'This date is unavailable. Please choose another date.',
                    blocked: true,
                    date,
                    reason: slotCheck.dayAvailability.blockReason || undefined,
                }),
            };
        }
        return {
            result: JSON.stringify({
                error: slotCheck.reason,
                conflict: true,
                date,
                requestedTime: time,
                availableSlots: slotCheck.dayAvailability.availableSlots,
                bookedSlots: slotCheck.dayAvailability.bookedSlots,
            }),
            availabilityWidget: slotCheck.dayAvailability.available
                ? {
                    date: slotCheck.dayAvailability.date,
                    formattedDate: slotCheck.dayAvailability.formattedDate,
                    available: true,
                    blocked: false,
                    slots: slotCheck.dayAvailability.chatSlots,
                }
                : undefined,
        };
    }
    const normalizedTime = slotCheck.normalizedTime;

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

    // Merge validated inspo URLs from tool args and conversation history (deduped, max 5)
    const rawCandidateUrls = [
        ...(Array.isArray(inspoImageUrls) ? inspoImageUrls : []),
        ...(context.conversationInspoUrls || []),
    ];
    const mergedInspoUrls: string[] = [];
    const seenUrls = new Set<string>();
    for (const url of rawCandidateUrls) {
        if (!isValidChatUploadUrl(url)) continue;
        const cleanUrl = url.trim();
        if (seenUrls.has(cleanUrl)) continue;
        seenUrls.add(cleanUrl);
        mergedInspoUrls.push(cleanUrl);
        if (mergedInspoUrls.length >= 5) break;
    }

    // Store ONLY clean client requirements in notes (channel is tracked via bookingChannel)
    const cleanNotes = formatClientNotes(typeof notes === 'string' ? notes : null);

    const booking = await prisma.booking.create({
        data: {
            userId,
            guestName: userId ? null : guestName,
            guestEmail: userId ? null : (guestEmail || null),
            guestPhone: userId ? null : guestPhone,
            serviceId: service.id,
            preferredDate: date,
            preferredTime: normalizedTime,
            notes: cleanNotes,
            inspoImageUrls: mergedInspoUrls,
            bookingChannel: 'HELLO_KITTY',
            status: 'PENDING',
            bookingIp: context.ip || null,
        },
    });

    // ── Auto-label the chat conversation & bind booking ID for attribution ──
    if (context.conversationId) {
        await prisma.chatConversation.update({
            where: { id: context.conversationId },
            data: {
                label: `Booking: ${service.name}`,
                hasBooking: true,
                lastBookingId: booking.id,
            },
        }).catch(err => console.error('[chat] Failed to label conversation:', err));
    }

    // Fire notifications (same flow as regular bookings)
    const name = guestName || 'Customer';
    if (guestEmail) {
        sendBookingReceived(booking.id, guestEmail, name, service.name, date, normalizedTime).catch(console.error);
    }
    const smsNotes = cleanNotes
        ? `[Kitty AI] ${cleanNotes}${mergedInspoUrls.length ? ` (+${mergedInspoUrls.length} inspo photo${mergedInspoUrls.length > 1 ? 's' : ''})` : ''}`
        : `[Kitty AI] No requirements noted${mergedInspoUrls.length ? ` (+${mergedInspoUrls.length} inspo photo${mergedInspoUrls.length > 1 ? 's' : ''})` : ''}`;
    sendBookingSMS(booking.id, name, service.name, date, normalizedTime, smsNotes, guestPhone).catch(console.error);

    const card: BookingCardData = {
        bookingId: booking.id,
        service: service.name,
        priceLabel: service.priceLabel,
        date,
        time: normalizedTime,
        guestName: name,
        status: 'pending',
        notes: cleanNotes,
        inspoImageUrls: mergedInspoUrls,
    };

    return {
        result: JSON.stringify({
            success: true,
            bookingId: booking.id,
            inspoCount: mergedInspoUrls.length,
            message: `Booking request submitted! ${service.name} on ${date} at ${normalizedTime} for ${name}. This is a PENDING request — our team will reach out to finalize pricing and collect a retainer to fully confirm the appointment. Now celebrate warmly and ask the client one quick question: how they found Glitz & Glamour Studio (e.g., Google, Instagram, Facebook, TikTok, Yelp, or a friend).`,
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
    } catch {
        return JSON.stringify({ count: 0, blockedDates: [], error: 'Failed to retrieve blocked dates' });
    }
}

// ── get_business_info ────────────────────────────────────────────────
function toolGetBusinessInfo(): string {
    return JSON.stringify({
        name: 'Glitz & Glamour Studio',
        owner: 'Jojo',
        location: {
            address: '935 W San Marcos Blvd, Suite 101, San Marcos, CA 92078',
            area: 'San Marcos, CA (North San Diego County)',
            note: 'We recently moved! New address: 935 W San Marcos Blvd, Suite 101, San Marcos, CA. Former location: 812 Frances Dr, Vista, CA (no longer serving there).',
        },
        hours: {
            note: 'Open Monday–Sunday, 9:00 AM to 7:00 PM. Services are by appointment.',
            slots: '9:00 AM – 7:00 PM',
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
            instagramUrl: 'https://www.instagram.com/glitzandglamourstudio/',
            note: 'Follow us on Instagram for the latest looks, behind-the-scenes, and client transformations!',
        },
        policies: {
            booking: 'All bookings are pending until confirmed by the studio. We will reach out to finalize details, discuss pricing, and collect a retainer.',
            pricing: 'Prices shown are starting points. Final pricing is confirmed in person before the appointment begins based on length, design, and add-ons.',
            studioPolicies: POLICY_TOOL_SUMMARY,
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
                        instructions: 'Special occasion hair & makeup starts around $185 (hair and makeup together) and is customized based on party size, services requested, and location (in-studio or on-location). This is separate from everyday salon pricing; never quote everyday prices for events.',
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
                pricing: 'Special occasion hair & makeup starts around $185 (hair and makeup together), with a custom quote based on party size, services selected, and travel distance. Priced separately from everyday salon services because a different technique and approach is used so it lasts all night.',
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
        const query: Array<{ email: string } | { phone: string }> = [];
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
    const takeoverLink = `https://www.glitzandglamours.com/admin/chats?takeover=${convId}`;

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

    if (sent === 0) {
        // Never claim the team was notified when no text actually went out.
        return JSON.stringify({
            success: false,
            message: 'The team could NOT be notified automatically from here. Tell the client you could not reach the team through chat, and give them Jojo\'s direct number (760) 290-5910 to call or text. Do not say anyone was notified.',
            reason,
        });
    }

    return JSON.stringify({
        success: true,
        message: `Transfer initiated! SMS sent to ${sent} team member(s). The team has been notified and will take over this chat shortly. Let the client know help is on the way.`,
        reason,
    });
}

// ── save_booking_discovery_source ───────────────────────────────────
async function toolSaveBookingDiscoverySource(
    args: Record<string, unknown>,
    context: { userId?: string | null; conversationId?: string }
): Promise<{ result: string; attributionSaved?: AttributionSavedData }> {
    const rawSource = typeof args.source === 'string' ? args.source : '';
    const normalized = normalizeDiscoverySource(rawSource);
    if (!normalized) {
        return { result: JSON.stringify({ error: 'Missing discovery source text.' }) };
    }
    if (!context.conversationId) {
        return { result: JSON.stringify({ error: 'No active conversation context to attach source.' }) };
    }

    // Enforce conversation scoping so arbitrary booking IDs cannot be overwritten
    const conv = await prisma.chatConversation.findUnique({
        where: { id: context.conversationId },
        select: { lastBookingId: true },
    });

    if (!conv?.lastBookingId) {
        return { result: JSON.stringify({ error: 'No booking found in this chat yet.' }) };
    }

    const updated = await prisma.booking.update({
        where: { id: conv.lastBookingId },
        data: { heardFrom: normalized },
        select: { id: true, userId: true, heardFrom: true },
    });

    // Bind permanent origin source on the client account if not yet set
    const targetUserId = updated.userId || context.userId || null;
    if (targetUserId) {
        const user = await prisma.user.findUnique({
            where: { id: targetUserId },
            select: { originSource: true },
        });
        if (user && !user.originSource) {
            await prisma.user.update({
                where: { id: targetUserId },
                data: { originSource: normalized },
            }).catch(err => console.error('[chat] Failed to bind user originSource:', err));
        }
    }

    return {
        result: JSON.stringify({
            success: true,
            bookingId: updated.id,
            heardFrom: normalized,
            message: `Saved discovery source "${normalized}" onto booking.`,
        }),
        attributionSaved: {
            bookingId: updated.id,
            source: normalized,
            badge: getOriginBadgeConfig(normalized),
        },
    };
}

