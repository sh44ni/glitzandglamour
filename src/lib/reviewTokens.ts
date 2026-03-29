import { prisma } from './prisma';
import { randomBytes } from 'crypto';

/**
 * Generate a secure random token for a booking review link.
 * Checks whether this client is a first-time visitor across email, phone, and userId.
 */
export async function createReviewToken(bookingId: string): Promise<{ token: string; isFirstVisit: boolean }> {
    // Get booking with user info for context
    const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { user: true },
    });
    if (!booking) throw new Error('Booking not found');

    const email = booking.user?.email || booking.guestEmail;
    const phone = booking.user?.phone || booking.guestPhone;
    const userId = booking.userId;

    // Build OR conditions to find any prior completed bookings
    const orConditions: object[] = [];
    if (userId) orConditions.push({ userId });
    if (email) {
        orConditions.push({ guestEmail: email });
        // If there's a userId, also check linked accounts with same email
        if (userId) {
            const userWithEmail = await prisma.user.findUnique({ where: { email } });
            if (userWithEmail && userWithEmail.id !== userId) {
                orConditions.push({ userId: userWithEmail.id });
            }
        }
    }
    if (phone) {
        orConditions.push({ guestPhone: phone });
        if (userId) {
            const userWithPhone = await (prisma as any).user.findFirst({ where: { phone } });
            if (userWithPhone && userWithPhone.id !== userId) {
                orConditions.push({ userId: userWithPhone.id });
            }
        }
    }

    let isFirstVisit = true;
    if (orConditions.length > 0) {
        const priorCompleted = await prisma.booking.count({
            where: {
                id: { not: bookingId },
                status: 'COMPLETED',
                OR: orConditions as any,
            },
        });
        isFirstVisit = priorCompleted === 0;
    }

    // Generate secure random token
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Upsert in case it already exists (idempotent)
    await (prisma as any).reviewToken.upsert({
        where: { bookingId },
        create: { bookingId, token, isFirstVisit, expiresAt },
        update: { token, isFirstVisit, expiresAt, used: false },
    });

    return { token, isFirstVisit };
}

/**
 * Validate a review token. Returns the booking context if valid.
 */
export async function validateReviewToken(token: string) {
    const rt = await (prisma as any).reviewToken.findUnique({
        where: { token },
        include: {
            booking: {
                include: {
                    user: { select: { id: true, name: true, email: true, image: true } },
                    service: { select: { name: true } },
                    review: true,
                },
            },
        },
    });

    if (!rt) return { valid: false, reason: 'not_found' };
    if (rt.used) return { valid: false, reason: 'already_used' };
    if (new Date() > new Date(rt.expiresAt)) return { valid: false, reason: 'expired' };
    if (rt.booking.status !== 'COMPLETED') return { valid: false, reason: 'not_completed' };
    if (rt.booking.review) return { valid: false, reason: 'already_reviewed' };

    return {
        valid: true,
        reviewTokenId: rt.id,
        isFirstVisit: rt.isFirstVisit,
        booking: rt.booking,
    };
}

/**
 * Mark a review token as used.
 */
export async function markReviewTokenUsed(token: string) {
    await (prisma as any).reviewToken.update({
        where: { token },
        data: { used: true },
    });
}
