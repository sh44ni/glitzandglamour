import { prisma } from './prisma';

type NotifType = 'sms' | 'email';
type NotifStatus = 'sent' | 'failed' | 'skipped';

interface LogParams {
  bookingId: string;
  type: NotifType;
  event: string;
  recipient?: string;
  status: NotifStatus;
  error?: string;
  message?: string;
}

export async function logNotification(params: LogParams) {
  try {
    await prisma.notificationLog.create({
      data: {
        bookingId: params.bookingId,
        type: params.type,
        event: params.event,
        recipient: params.recipient,
        status: params.status,
        error: params.error,
        message: params.message ? params.message.slice(0, 300) : undefined,
      },
    });
  } catch (e) {
    // Logging should never crash the main flow
    console.error('[NOTIF LOG ERROR]', e);
  }
}

// ── Helpers that detect credit exhaustion / hard errors ───────────────────────

export function detectSmsError(error: unknown): string {
  const msg = error instanceof Error ? error.message : String(error);
  if (/insufficient|credit|balance|quota|limit/i.test(msg)) return 'credits_exhausted';
  if (/invalid.*number|number.*invalid/i.test(msg)) return 'invalid_number';
  if (/network|timeout|ECONNREFUSED/i.test(msg)) return 'network_error';
  return 'unknown_error';
}

export function detectEmailError(error: unknown): string {
  const msg = error instanceof Error ? error.message : String(error);
  if (/rate.limit|too many|quota|limit/i.test(msg)) return 'credits_exhausted';
  if (/invalid.*email|email.*invalid/i.test(msg)) return 'invalid_email';
  if (/domain.*not.*verified|not.*verify/i.test(msg)) return 'domain_not_verified';
  return 'unknown_error';
}

// ── Pingram SOFT warnings (2xx with issues) ───────────────────────────────────
// Pingram returns HTTP 200 even when it can't actually dispatch — e.g. if the
// notification `type` isn't configured, the SMS channel is disabled, or the
// recipient has unsubscribed. The warning comes back as strings in the
// `messages[]` array on the response body. We parse them here so the admin
// notifications page shows the real reason instead of a misleading "Sent".
//
// Returns a short error code (matching ERROR_LABELS in the admin page) or
// undefined if the response looks successful.
export function detectPingramSoftWarning(response: unknown): string | undefined {
  if (!response || typeof response !== 'object') return undefined;
  const r = response as { messages?: unknown; trackingId?: unknown };
  const messages = Array.isArray(r.messages) ? (r.messages as unknown[]).map(String) : [];
  if (messages.length === 0) return undefined;

  const joined = messages.join(' | ').toLowerCase();

  // Pattern: "No SMS channel configured for notification type X"
  //          "SMS channel is disabled"
  if (/sms.*(disabled|not\s*enabled|not\s*configured|no\s*channel)/i.test(joined)
    || /no\s*sms/i.test(joined)
    || /channel.*(disabled|not\s*enabled|off)/i.test(joined)) {
    return 'pingram_channel_disabled';
  }

  // Pattern: "Unknown notification type" / "Notification type X not found"
  if (/(unknown|not\s*found|does\s*not\s*exist|invalid).*(type|notification)/i.test(joined)
    || /type.*(unknown|not\s*found|does\s*not\s*exist|invalid)/i.test(joined)) {
    return 'pingram_type_not_configured';
  }

  // Pattern: user has opted out / been suppressed
  if (/unsubscrib|suppress|opted?\s*out|blocked/i.test(joined)) {
    return 'pingram_user_unsubscribed';
  }

  // Pattern: sender/from number issue
  if (/(sender|from).*(missing|not\s*set|invalid|not\s*configured)/i.test(joined)
    || /no\s*from\s*number/i.test(joined)) {
    return 'pingram_sender_missing';
  }

  // Pattern: explicit failure keywords anywhere
  if (/fail|error|reject|drop/i.test(joined)) {
    return 'pingram_dispatch_failed';
  }

  // messages present but nothing recognizably bad — treat as informational
  return undefined;
}
