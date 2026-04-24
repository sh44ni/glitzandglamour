/**
 * JSON-serializable contract fragments for the client wizard (no HTML strings).
 * Parsed server-side from the legal template with Cheerio.
 */
export type NativeContentBlock =
    | { type: 'heading'; level: 1 | 2 | 3 | 4; text: string }
    | { type: 'paragraph'; text: string }
    | { type: 'list'; ordered: boolean; items: string[] }
    | { type: 'keyValue'; label: string; value: string }
    | { type: 'table'; headers: string[]; rows: string[][] }
    | { type: 'horizontalRule' }
    | { type: 'callout'; variant: 'warning' | 'info'; text: string };
