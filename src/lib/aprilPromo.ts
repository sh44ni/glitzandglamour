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
 * Services on April Special.
 * - category: the category slug this deal belongs to
 * - nameMatcher: when set, a lowercase substring that must appear in the service name.
 *   Use this to target a specific service within a category (e.g. only women's haircuts).
 *   Services are matched from the database by name, so IDs don't matter.
 * price = fixed price advertised to client
 * label = display label in the badge
 */
export const PROMO_DEALS: { category: string; nameMatcher?: string; price: number; label: string }[] = [
    { category: 'haircuts', nameMatcher: 'women', price: 45, label: "Women's Haircut \u2014 $45 Flat" },
    { category: 'pedicures', price: 50, label: 'Any Style \u2014 $50 Flat' },
];

/** Given a service category, return its promo deal (or null).
 *  Deals with a nameMatcher restriction are excluded — use getPromoDealByServiceName instead. */
export function getPromoDeal(category: string): { price: number; label: string } | null {
    if (!isAprilPromoActive()) return null;
    return PROMO_DEALS.find(d => d.category === category && !d.nameMatcher) ?? null;
}

/** Given a service name and category, return its promo deal (or null).
 *  Checks nameMatcher as a case-insensitive substring of the service name. */
export function getPromoDealByServiceName(serviceName: string, category: string): { price: number; label: string } | null {
    if (!isAprilPromoActive()) return null;
    const lowerName = serviceName.toLowerCase();
    return PROMO_DEALS.find(d =>
        d.category === category && (
            !d.nameMatcher || lowerName.includes(d.nameMatcher)
        )
    ) ?? null;
}
