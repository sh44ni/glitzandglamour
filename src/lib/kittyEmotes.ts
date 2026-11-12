export const KITTY_EMOTES = [
    'happy',
    'sparkle',
    'thinking',
    'love',
    'listening',
    'celebrate',
    'apologetic',
    'sleepy',
] as const;

export type KittyEmote = (typeof KITTY_EMOTES)[number];

export const EMOTE_STATUS_LABELS: Record<KittyEmote, string> = {
    happy: 'Can book & view inspo ✨',
    sparkle: 'Loving this glam vibe ✨',
    thinking: 'Checking calendar & details…',
    love: 'So excited for your look 💕',
    listening: 'Listening to you… 🎤',
    celebrate: 'Booking request submitted! 🎉',
    apologetic: 'Let’s work this out gently 💕',
    sleepy: 'Taking a quick cat nap 😴',
};

const VALID_EMOTE_SET = new Set<string>(KITTY_EMOTES);

/**
 * Extracts `[emote:<name>]` tags emitted by the assistant and strips them
 * cleanly before persisting or rendering chat text.
 */
export function extractKittyEmote(raw: string): { text: string; emote: KittyEmote } {
    if (!raw) return { text: '', emote: 'happy' };

    let matchedEmote: KittyEmote = 'happy';
    const cleaned = raw
        .replace(/\[emote:([a-z]+)\]/gi, (_, candidate: string) => {
            const lower = candidate.toLowerCase();
            if (VALID_EMOTE_SET.has(lower)) {
                matchedEmote = lower as KittyEmote;
            }
            return '';
        })
        .replace(/^\s+|\s+$/g, '')
        .replace(/\n{3,}/g, '\n\n');

    return { text: cleaned, emote: matchedEmote };
}

const VALID_UPLOAD_URL_RE = /^\/api\/images\/uploads\/([a-zA-Z0-9._-]+\.(?:webp|jpe?g|png|gif))$/i;

/** Validates that an image URL refers strictly to a local studio upload path. */
export function isValidChatUploadUrl(url: unknown): url is string {
    if (typeof url !== 'string') return false;
    const trimmed = url.trim();
    if (!trimmed || trimmed.includes('..') || trimmed.includes('\\')) return false;
    return VALID_UPLOAD_URL_RE.test(trimmed);
}

/** Extracts the MinIO object key (`uploads/...`) from a validated upload URL. */
export function extractUploadKey(url: string): string | null {
    if (!isValidChatUploadUrl(url)) return null;
    const match = url.trim().match(VALID_UPLOAD_URL_RE);
    return match ? `uploads/${match[1]}` : null;
}

/**
 * Sanitizes and deduplicates client-submitted upload attachment paths.
 * Enforces the upload allowlist so external URLs cannot reach Vision decoding.
 */
export function sanitizeChatAttachments(raw: unknown, maxItems = 4): string[] {
    if (!Array.isArray(raw)) return [];
    const out: string[] = [];
    const seen = new Set<string>();
    for (const item of raw) {
        if (!isValidChatUploadUrl(item)) continue;
        const clean = item.trim();
        if (seen.has(clean)) continue;
        seen.add(clean);
        out.push(clean);
        if (out.length >= maxItems) break;
    }
    return out;
}

const LEGACY_KITTY_PREFIX_RE = /^\[Booked via Hello Kitty(?:\s*🐱)?\]\s*/i;

/** Returns true for bookings created through Hello Kitty AI (new column or legacy prefix). */
export function isHelloKittyBooking(booking: { bookingChannel?: string | null; notes?: string | null }): boolean {
    if (booking.bookingChannel === 'HELLO_KITTY') return true;
    return Boolean(booking.notes && LEGACY_KITTY_PREFIX_RE.test(booking.notes.trim()));
}

/** Strips legacy `[Booked via Hello Kitty]` prefix when displaying client requirements in admin views. */
export function formatClientNotes(notes?: string | null): string | null {
    if (!notes) return null;
    const cleaned = notes.trim().replace(LEGACY_KITTY_PREFIX_RE, '').trim();
    return cleaned.length > 0 ? cleaned : null;
}

const DISCOVERY_SYNONYMS: Array<[RegExp, string]> = [
    [/\b(?:instagram|insta|ig)\b/i, 'Instagram'],
    [/\b(?:facebook|fb|meta)\b/i, 'Facebook'],
    [/\b(?:tiktok|tik\s*tok|tt)\b/i, 'TikTok'],
    [/\b(?:google|maps|search|gmb)\b/i, 'Google'],
    [/\b(?:yelp)\b/i, 'Yelp'],
    [/\b(?:word of mouth|friend|family|sister|mom|coworker|referred|referral)\b/i, 'Word of Mouth'],
    [/\b(?:walked|drove|walk by|drive by|passing by|saw the sign|plaza|street)\b/i, 'Walked / Drove By'],
];

/** Normalizes client attribution answers into canonical studio origin preset labels. */
export function normalizeDiscoverySource(raw: string): string | null {
    const trimmed = raw.trim().replace(/^["']|["']$/g, '').slice(0, 80);
    if (!trimmed) return null;
    for (const [pattern, label] of DISCOVERY_SYNONYMS) {
        if (pattern.test(trimmed)) return label;
    }
    return trimmed;
}
