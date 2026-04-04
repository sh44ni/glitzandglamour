/**
 * April Special 2026 — Promotion Configuration
 *
 * To end the promotion: change PROMO_END_DATE to yesterday,
 * or set PROMO_ACTIVE = false.
 *
 * To add/remove services: edit PROMO_DEALS below.
 */

export const PROMO_END_DATE = new Date('2026-05-01T00:00:00'); // Midnight May 1 — promo ends

/** Returns true if today is within the April promo window */
export function isAprilPromoActive(): boolean {
    const now = new Date();
    return now >= new Date('2026-04-01T00:00:00') && now < PROMO_END_DATE;
}

/** Returns ms remaining until promo ends, or 0 if over */
export function msUntilPromoEnds(): number {
    return Math.max(0, PROMO_END_DATE.getTime() - Date.now());
}

/**
 * Services on April Special, keyed by category slug.
 * price = fixed price advertised to client (e.g. 45 or 50)
 * label = display label in the badge
 */
export const PROMO_DEALS: { category: string; price: number; label: string }[] = [
    { category: 'haircuts', price: 45, label: 'Any Style — $45 Flat' },
    { category: 'pedicures', price: 50, label: 'Any Style — $50 Flat' },
];

/** Given a service category, return its promo deal (or null) */
export function getPromoDeal(category: string): { price: number; label: string } | null {
    if (!isAprilPromoActive()) return null;
    return PROMO_DEALS.find(d => d.category === category) ?? null;
}
