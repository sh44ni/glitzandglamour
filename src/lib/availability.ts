import { prisma } from './prisma';
import { SERVICES_DETAILED } from '@/data/servicesDetailed';

// Studio hours: Monday–Sunday, 9:00 AM (540) to 7:00 PM (1140)
export const DAY_START = 540;  // 9:00 AM
export const DAY_END = 1140;   // 7:00 PM
const DEFAULT_BOOKING_DURATION_MINS = 90;

// Map canonical service durations by ID, slug, and lowercase name
const DURATION_BY_KEY = new Map<string, number>();
for (const s of SERVICES_DETAILED) {
    if (s.durationMins) {
        DURATION_BY_KEY.set(s.id.toLowerCase(), s.durationMins);
        DURATION_BY_KEY.set(s.slug.toLowerCase(), s.durationMins);
        DURATION_BY_KEY.set(s.name.toLowerCase(), s.durationMins);
    }
}

export function getServiceDurationMins(
    service?: { id?: string; slug?: string | null; name?: string; durationMins?: number | null } | null,
    additionalServiceIds?: string | null
): number {
    let total = 0;
    if (service) {
        if (typeof service.durationMins === 'number' && service.durationMins > 0) {
            total += service.durationMins;
        } else {
            const byId = service.id ? DURATION_BY_KEY.get(service.id.toLowerCase()) : undefined;
            const bySlug = service.slug ? DURATION_BY_KEY.get(service.slug.toLowerCase()) : undefined;
            const byName = service.name ? DURATION_BY_KEY.get(service.name.toLowerCase()) : undefined;
            total += byId || bySlug || byName || DEFAULT_BOOKING_DURATION_MINS;
        }
    }
    if (additionalServiceIds) {
        for (const rawId of additionalServiceIds.split(',')) {
            const key = rawId.trim().toLowerCase();
            if (!key) continue;
            total += DURATION_BY_KEY.get(key) || 45;
        }
    }
    return Math.max(total || DEFAULT_BOOKING_DURATION_MINS, 30);
}

export function timeToMinutes(timeStr?: string | null): number {
    if (!timeStr) return -1;
    const cleaned = String(timeStr).trim().toUpperCase();
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
    const match24 = cleaned.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
    if (match24) {
        return parseInt(match24[1], 10) * 60 + parseInt(match24[2], 10);
    }
    return -1;
}

export function minutesToTime12(mins: number): string {
    const h24 = Math.floor(mins / 60);
    const m = mins % 60;
    const ampm = h24 >= 12 ? 'PM' : 'AM';
    const h12 = h24 % 12 || 12;
    return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}

export function getPacificNow(): { today: string; currentMinutes: number } {
    const now = new Date();
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Los_Angeles',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    }).formatToParts(now);
    const map: Record<string, string> = {};
    for (const p of parts) map[p.type] = p.value;
    const year = map.year || String(now.getFullYear());
    const month = map.month || String(now.getMonth() + 1).padStart(2, '0');
    const day = map.day || String(now.getDate()).padStart(2, '0');
    const hour = parseInt(map.hour || '0', 10) % 24;
    const minute = parseInt(map.minute || '0', 10);
    return {
        today: `${year}-${month}-${day}`,
        currentMinutes: hour * 60 + minute,
    };
}

export type OccupiedWindow = {
    start: number;
    end: number;
    source: 'booking' | 'manual_block';
    label: string;
};

export type TimeSlotItem = {
    time: string;
    minutes: number;
    available: boolean;
    reason?: 'booked' | 'blocked' | 'past';
    label?: string;
};

export type DayAvailability = {
    date: string;
    formattedDate: string;
    blocked: boolean;
    blockReason?: string;
    available: boolean;
    freeWindows: string[];
    freeWindowCount: number;
    totalFreeMinutes: number;
    existingBookings: number;
    manualBlocks: number;
    /** 15-minute slots from 9:00 AM to 7:00 PM for /book dropdowns */
    slots: TimeSlotItem[];
    /** 30-minute slots from 9:00 AM to 7:00 PM for Kitty Bot interactive selector */
    chatSlots: TimeSlotItem[];
    availableSlots: string[];
    bookedSlots: string[];
    note: string;
};

function mergeWindows(windows: { start: number; end: number }[]): { start: number; end: number }[] {
    if (windows.length === 0) return [];
    const sorted = [...windows].sort((a, b) => a.start - b.start);
    const merged: { start: number; end: number }[] = [{ ...sorted[0] }];
    for (let i = 1; i < sorted.length; i++) {
        const last = merged[merged.length - 1];
        if (sorted[i].start <= last.end) {
            last.end = Math.max(last.end, sorted[i].end);
        } else {
            merged.push({ ...sorted[i] });
        }
    }
    return merged;
}

function formatReadableDate(date: string): string {
    try {
        const d = new Date(`${date}T00:00:00`);
        return d.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
        });
    } catch {
        return date;
    }
}

export async function getDayAvailability(date: string): Promise<DayAvailability> {
    const formattedDate = formatReadableDate(date);

    // 1. Check full-day block ("No More Bookings")
    const blocked = await prisma.blockedDate.findUnique({ where: { date } });

    // 2. Fetch active bookings (all non-CANCELLED statuses hold their time slot:
    //    PENDING, CONTACTED, IN_TALKS, CONFIRMED, COMPLETED)
    const directBookings = await prisma.booking.findMany({
        where: {
            preferredDate: date,
            status: { not: 'CANCELLED' },
        },
        select: {
            id: true,
            preferredDate: true,
            preferredTime: true,
            status: true,
            serviceId: true,
            additionalServiceIds: true,
            serviceSchedules: true,
            service: {
                select: { id: true, slug: true, name: true, durationMins: true },
            },
        },
    });

    // Also check bookings that used per-service schedules (`serviceSchedules`) on this date
    const multiScheduleBookings = await prisma.booking.findMany({
        where: {
            preferredDate: { not: date },
            status: { not: 'CANCELLED' },
            NOT: { serviceSchedules: { equals: null as any } },
        },
        select: {
            id: true,
            serviceSchedules: true,
        },
    }).catch(() => []);

    const occupiedWindows: OccupiedWindow[] = [];

    for (const b of directBookings) {
        // Check if this booking uses per-service schedules
        const schedObj = b.serviceSchedules && typeof b.serviceSchedules === 'object'
            ? (b.serviceSchedules as Record<string, { date?: string; time?: string }>)
            : null;
        if (schedObj && Object.keys(schedObj).length > 0) {
            let matchedAny = false;
            for (const [svcKey, sched] of Object.entries(schedObj)) {
                if (sched?.date === date && sched?.time) {
                    const startMin = timeToMinutes(sched.time);
                    if (startMin >= 0) {
                        const dur = DURATION_BY_KEY.get(svcKey.toLowerCase()) || DEFAULT_BOOKING_DURATION_MINS;
                        occupiedWindows.push({
                            start: startMin,
                            end: startMin + dur,
                            source: 'booking',
                            label: 'Already Booked',
                        });
                        matchedAny = true;
                    }
                }
            }
            if (matchedAny) continue;
        }

        const startMin = timeToMinutes(b.preferredTime);
        if (startMin >= 0) {
            const duration = getServiceDurationMins(b.service, b.additionalServiceIds);
            occupiedWindows.push({
                start: startMin,
                end: startMin + duration,
                source: 'booking',
                label: 'Already Booked',
            });
        }
    }

    for (const mb of multiScheduleBookings) {
        const schedObj = mb.serviceSchedules && typeof mb.serviceSchedules === 'object'
            ? (mb.serviceSchedules as Record<string, { date?: string; time?: string }>)
            : null;
        if (!schedObj) continue;
        for (const [svcKey, sched] of Object.entries(schedObj)) {
            if (sched?.date === date && sched?.time) {
                const startMin = timeToMinutes(sched.time);
                if (startMin >= 0) {
                    const dur = DURATION_BY_KEY.get(svcKey.toLowerCase()) || DEFAULT_BOOKING_DURATION_MINS;
                    occupiedWindows.push({
                        start: startMin,
                        end: startMin + dur,
                        source: 'booking',
                        label: 'Already Booked',
                    });
                }
            }
        }
    }

    // 3. Manual time blocks set by the owner in Admin Calendar
    const manualBlocks = await (prisma as any).manualBlock.findMany({
        where: { date },
        select: { startTime: true, endTime: true, reason: true },
    });

    for (const block of manualBlocks) {
        const s = timeToMinutes(block.startTime);
        const e = timeToMinutes(block.endTime);
        if (s >= 0 && e > s) {
            occupiedWindows.push({
                start: s,
                end: e,
                source: 'manual_block',
                label: 'Already Booked',
            });
        }
    }

    const mergedOccupied = mergeWindows(occupiedWindows.map(w => ({ start: w.start, end: w.end })));
    const { today } = getPacificNow();
    const isPastDate = date < today;

    // Build discrete slot list helper
    const buildSlots = (stepMins: number): TimeSlotItem[] => {
        const items: TimeSlotItem[] = [];
        for (let mins = DAY_START; mins <= DAY_END; mins += stepMins) {
            const timeLabel = minutesToTime12(mins);
            if (blocked) {
                items.push({
                    time: timeLabel,
                    minutes: mins,
                    available: false,
                    reason: 'blocked',
                    label: 'Unavailable',
                });
                continue;
            }
            const isBooked = mergedOccupied.some(w => mins < w.end && (mins + stepMins) > w.start);
            if (isBooked) {
                items.push({
                    time: timeLabel,
                    minutes: mins,
                    available: false,
                    reason: 'booked',
                    label: 'Already Booked',
                });
                continue;
            }
            if (isPastDate) {
                items.push({
                    time: timeLabel,
                    minutes: mins,
                    available: false,
                    reason: 'past',
                    label: 'Passed',
                });
                continue;
            }
            items.push({
                time: timeLabel,
                minutes: mins,
                available: true,
            });
        }
        return items;
    };

    const slots15 = buildSlots(15);
    const slots30 = buildSlots(30);

    if (blocked) {
        return {
            date,
            formattedDate,
            blocked: true,
            blockReason: blocked.reason || undefined,
            available: false,
            freeWindows: [],
            freeWindowCount: 0,
            totalFreeMinutes: 0,
            existingBookings: directBookings.length,
            manualBlocks: manualBlocks.length,
            slots: slots15,
            chatSlots: slots30,
            availableSlots: [],
            bookedSlots: slots30.map(s => s.time),
            note: 'This date is unavailable. Please choose another date.',
        };
    }

    // 4. Compute continuous free windows within studio hours
    const freeWindows: { start: number; end: number }[] = [];
    let cursor = DAY_START;
    for (const occ of mergedOccupied) {
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

    const freeLabels = freeWindows.map(w => `${minutesToTime12(w.start)} – ${minutesToTime12(w.end)}`);
    const totalFreeMinutes = freeWindows.reduce((sum, w) => sum + (w.end - w.start), 0);
    const availableSlots = slots30.filter(s => s.available).map(s => s.time);
    const bookedSlots = slots15.filter(s => s.reason === 'booked').map(s => s.time);
    const hasOpenSlots = availableSlots.length > 0 && !isPastDate;

    return {
        date,
        formattedDate,
        blocked: false,
        available: hasOpenSlots,
        freeWindows: freeLabels,
        freeWindowCount: freeWindows.length,
        totalFreeMinutes,
        existingBookings: directBookings.length,
        manualBlocks: manualBlocks.length,
        slots: slots15,
        chatSlots: slots30,
        availableSlots,
        bookedSlots,
        note: !hasOpenSlots
            ? 'This day is fully booked. Suggest another date.'
            : totalFreeMinutes <= 60
                ? 'Very limited availability — book soon!'
                : `${availableSlots.length} time slots open (${freeLabels.join(', ')}).`,
    };
}

/**
 * Find the next date after `fromDate` that has open availability.
 */
export async function findNextOpenDateAvailability(fromDate: string, maxDays = 14): Promise<DayAvailability | null> {
    const base = new Date(`${fromDate}T00:00:00`);
    if (isNaN(base.getTime())) return null;
    for (let i = 1; i <= maxDays; i++) {
        const d = new Date(base);
        d.setDate(base.getDate() + i);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const candidate = `${yyyy}-${mm}-${dd}`;
        const avail = await getDayAvailability(candidate);
        if (avail.available && avail.availableSlots.length > 0) {
            return avail;
        }
    }
    return null;
}

/**
 * Verify if a specific requested time on `date` is available for booking.
 */
export async function checkSlotAvailable(
    date: string,
    timeStr: string
): Promise<{
    ok: boolean;
    normalizedTime: string;
    reason?: string;
    dayAvailability: DayAvailability;
}> {
    const dayAvailability = await getDayAvailability(date);
    if (dayAvailability.blocked) {
        return {
            ok: false,
            normalizedTime: timeStr,
            reason: 'This date is unavailable. Please choose another date.',
            dayAvailability,
        };
    }

    const reqMins = timeToMinutes(timeStr);
    if (reqMins < DAY_START || reqMins > DAY_END) {
        return {
            ok: false,
            normalizedTime: timeStr,
            reason: `Requested time "${timeStr}" is outside our studio hours (9:00 AM – 7:00 PM).`,
            dayAvailability,
        };
    }

    const normalizedTime = minutesToTime12(reqMins);
    const matchingSlot = dayAvailability.slots.find(s => s.minutes === reqMins);
    const isBooked = matchingSlot
        ? !matchingSlot.available
        : dayAvailability.bookedSlots.includes(normalizedTime);

    if (isBooked) {
        const nearby = dayAvailability.availableSlots.slice(0, 6).join(', ');
        return {
            ok: false,
            normalizedTime,
            reason: `${normalizedTime} on ${date} is already booked. Available times on ${date}: ${nearby || 'None (fully booked)'}.`,
            dayAvailability,
        };
    }

    return {
        ok: true,
        normalizedTime,
        dayAvailability,
    };
}
