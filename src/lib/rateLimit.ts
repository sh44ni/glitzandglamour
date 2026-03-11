/**
 * In-memory rate limiter — no external dependencies required.
 *
 * Works per-instance (suitable for single-server / VPS deployments and
 * local dev). On multi-instance deployments (e.g. Vercel with many
 * serverless functions) each instance has its own window, so effective
 * throughput per user is multiplied by the number of instances. For
 * true cross-instance limiting, replace the Map with a Redis/Upstash store.
 *
 * Usage:
 *   const result = rateLimit(ip, { limit: 5, windowMs: 60_000 });
 *   if (!result.ok) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
 */

interface RateLimitOptions {
    /** Max requests allowed per window */
    limit: number;
    /** Window duration in milliseconds */
    windowMs: number;
}

interface RateLimitResult {
    ok: boolean;
    remaining: number;
    resetAt: number; // unix ms
}

type Entry = { count: number; resetAt: number };

// Key: `${identifier}:${routeKey}` → Entry
const store = new Map<string, Entry>();

// Cleanup stale entries every 5 minutes to prevent memory leak
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
        if (now > entry.resetAt) store.delete(key);
    }
}, 5 * 60 * 1000);

export function rateLimit(
    identifier: string,
    routeKey: string,
    { limit, windowMs }: RateLimitOptions,
): RateLimitResult {
    const key = `${routeKey}:${identifier}`;
    const now = Date.now();

    let entry = store.get(key);
    if (!entry || now > entry.resetAt) {
        entry = { count: 0, resetAt: now + windowMs };
        store.set(key, entry);
    }

    entry.count += 1;
    const remaining = Math.max(0, limit - entry.count);
    const ok = entry.count <= limit;

    return { ok, remaining, resetAt: entry.resetAt };
}

/** Extracts a best-effort IP from a Next.js request. */
export function getClientIp(req: Request): string {
    return (
        req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        req.headers.get('x-real-ip') ||
        'unknown'
    );
}
