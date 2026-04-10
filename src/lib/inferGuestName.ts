/**
 * Decide whether a first chat message is likely a name vs a greeting or real question.
 * Used so Hello Kitty does not store "hi does this shop take card?" as guestName.
 */

const GREETINGS = new Set([
    'hello',
    'hi',
    'hey',
    'yo',
    'sup',
    'howdy',
    'hola',
    'heyy',
    'heyyy',
    'gm',
    'gn',
    'morning',
    'afternoon',
    'evening',
]);

/** Single-word messages that are not names */
const WEEKDAYS = new Set([
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
]);

const BLOCKLIST = new Set([
    ...WEEKDAYS,
    'help',
    'info',
    'question',
    'booking',
    'book',
    'services',
    'service',
    'yes',
    'no',
    'ok',
    'okay',
    'sure',
    'maybe',
    'thanks',
    'thankyou',
    'bye',
    'goodbye',
    'here',
    'anyone',
    'someone',
]);

/** After "I'm" / "I am", these are clearly not names */
const NOT_NAME_AFTER_IM = new Set([
    'interested',
    'looking',
    'wondering',
    'trying',
    'here',
    'good',
    'fine',
    'not',
    'just',
    'ready',
    'sorry',
    'late',
    'early',
    'confused',
    'asking',
    'curious',
    'calling',
    'emailing',
    'texting',
    'checking',
    'seeing',
    'hoping',
]);

function cap(s: string): string {
    if (!s) return s;
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

/** Letters, hyphen, apostrophe, period (e.g. O'Brien) */
function isNameToken(t: string): boolean {
    return /^[a-zA-Z][a-zA-Z'.-]{0,24}$/.test(t);
}

function acceptAsName(token: string): boolean {
    const l = token.toLowerCase();
    if (!isNameToken(token)) return false;
    if (BLOCKLIST.has(l)) return false;
    if (NOT_NAME_AFTER_IM.has(l)) return false;
    if (GREETINGS.has(l)) return false;
    return true;
}

const QUESTION_OR_TOPIC_HINT =
    /\?|(\b(what|when|where|who|why|how|does|do|did|is|are|was|were|can|could|would|should|will|won't|don't|doesn't|much|many|cost|price|pay|paid|payment|card|cards|cash|credit|debit|venmo|zelle|apple\s*pay|book|booking|appointment|appointments|open|close|closed|hours|address|location|phone|number|call|text|email|service|services|take|accept|available|walk|walk-?in|discount|deal|policy|cancel|cancellation|cu[aá]nto|cuanto|d[oó]nde|donde|c[oó]mo|como|por\s*qu[eé]|puedo|aceptan|toman|tienen|horario|precio)\b)/i;

const CHITCHAT_START =
    /^(lmao|lol|omg|wtf|tbh|idk|nm|nvm|haha|hahaha|ugh|ah+|oh+|um+|uh+|well|so|btw)\b/i;

const INTRO_PATTERNS: RegExp[] = [
    /\bmy\s+name\s+is\s+([a-zA-Z][a-zA-Z'.-]{0,24})\b/i,
    /\bmy\s+name'?s\s+([a-zA-Z][a-zA-Z'.-]{0,24})\b/i,
    /\bmy\s+names\s+([a-zA-Z][a-zA-Z'.-]{0,24})\b/i,
    /\bcall\s+me\s+([a-zA-Z][a-zA-Z'.-]{0,24})\b/i,
    /\bthis\s+is\s+([a-zA-Z][a-zA-Z'.-]{0,24})\b/i,
    /\bi\s+am\s+([a-zA-Z][a-zA-Z'.-]{0,24})\b/i,
];

/**
 * Returns a display-safe name (first + optional last), or null if the message
 * should be treated as a normal chat turn (question, greeting-only, etc.).
 */
export function inferGuestName(raw: string): string | null {
    const trimmed = raw.trim().replace(/\s+/g, ' ');
    if (!trimmed) return null;

    for (const re of INTRO_PATTERNS) {
        const m = trimmed.match(re);
        if (m?.[1] && acceptAsName(m[1])) {
            return cap(m[1]);
        }
    }

    const imMatch = trimmed.match(/\bi'?m\s+([a-zA-Z][a-zA-Z'.-]{0,24})\b/i);
    if (imMatch?.[1] && acceptAsName(imMatch[1])) {
        return cap(imMatch[1]);
    }

    if (trimmed.length > 48) return null;
    if (CHITCHAT_START.test(trimmed) && QUESTION_OR_TOPIC_HINT.test(trimmed)) return null;
    if (QUESTION_OR_TOPIC_HINT.test(trimmed)) return null;
    if (/[@/]/.test(trimmed)) return null;
    if (/\d{3,}/.test(trimmed)) return null;

    const words = trimmed.split(/\s+/).filter(Boolean);
    if (words.length === 0) return null;
    if (words.length > 3) return null;

    if (words.length === 2 && GREETINGS.has(words[0].toLowerCase())) {
        const second = words[1];
        if (!acceptAsName(second)) return null;
        return cap(second);
    }

    if (words.length === 1) {
        const w = words[0].toLowerCase();
        if (GREETINGS.has(w)) return null;
        if (!acceptAsName(words[0])) return null;
        if (w.length < 2 || w.length > 22) return null;
        return cap(words[0]);
    }

    if (words.length === 2) {
        if (!words.every((w) => isNameToken(w))) return null;
        const a = words[0].toLowerCase();
        const b = words[1].toLowerCase();
        if (GREETINGS.has(a) || GREETINGS.has(b)) return null;
        if (!acceptAsName(words[0]) || !acceptAsName(words[1])) return null;
        return `${cap(words[0])} ${cap(words[1])}`;
    }

    if (words.length === 3) {
        if (!words.every((w) => isNameToken(w))) return null;
        const lows = words.map((w) => w.toLowerCase());
        if (lows.some((w) => GREETINGS.has(w) || !acceptAsName(w))) return null;
        return `${cap(words[0])} ${cap(words[1])} ${cap(words[2])}`;
    }

    return null;
}
