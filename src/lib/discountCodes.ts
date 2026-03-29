import { prisma } from './prisma';

/**
 * Generate a personalized discount code for a first-time reviewer.
 * Format: FIRSTNAME-XXXXX (e.g. SARAH-X9KPZ)
 */
function buildCode(name: string): string {
    const first = name.trim().split(' ')[0].toUpperCase().replace(/[^A-Z]/g, '').slice(0, 10);
    const suffix = Math.random().toString(36).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5);
    return `${first}-${suffix}`;
}

export async function generateDiscountCode(bookingId: string, customerName: string, userId?: string | null): Promise<string> {
    // Check if one already exists (idempotent)
    const existing = await (prisma as any).discountCode.findUnique({ where: { bookingId } });
    if (existing) return existing.code;

    let code = buildCode(customerName);
    // Ensure uniqueness
    let attempts = 0;
    while (attempts < 10) {
        const clash = await (prisma as any).discountCode.findUnique({ where: { code } });
        if (!clash) break;
        code = buildCode(customerName);
        attempts++;
    }

    await (prisma as any).discountCode.create({
        data: {
            code,
            userId: userId || null,
            customerName,
            bookingId,
        },
    });

    return code;
}

/**
 * Validate a code without redeeming it.
 */
export async function validateDiscountCode(code: string) {
    const dc = await (prisma as any).discountCode.findUnique({
        where: { code: code.toUpperCase() },
        include: { booking: { include: { service: { select: { name: true } } } } },
    });

    if (!dc) return { valid: false, reason: 'not_found' };
    if (dc.isUsed) return { valid: false, reason: 'already_used', usedAt: dc.usedAt };

    return {
        valid: true,
        id: dc.id,
        code: dc.code,
        customerName: dc.customerName,
        createdAt: dc.createdAt,
        service: dc.booking?.service?.name,
        isUsed: false,
    };
}

/**
 * Mark a code as redeemed. Admin-only action.
 */
export async function redeemDiscountCode(code: string): Promise<{ success: boolean; error?: string }> {
    const dc = await (prisma as any).discountCode.findUnique({ where: { code: code.toUpperCase() } });
    if (!dc) return { success: false, error: 'not_found' };
    if (dc.isUsed) return { success: false, error: 'already_used' };

    await (prisma as any).discountCode.update({
        where: { code: code.toUpperCase() },
        data: { isUsed: true, usedAt: new Date() },
    });

    return { success: true };
}
