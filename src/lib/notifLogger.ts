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

// ── Helpers that detect credit exhaustion errors ──────────────────────────────

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
