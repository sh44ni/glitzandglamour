/**
 * Glitz & Glamour Studio — data retention (product policy)
 *
 * Core client and operational records (accounts, bookings, reviews, loyalty,
 * contract signing submissions, uploaded media references, and first-party
 * page analytics) are kept on an ongoing basis. There is no scheduled automatic
 * deletion of these records by the application.
 *
 * Exceptions: short-lived tokens (e.g. review links, auth codes) expire by design;
 * users may request account/data deletion per the privacy policy; legal or
 * hosting requirements may apply independently.
 */
export const DATA_RETENTION_CLIENT_RECORDS_INDEFINITE = true;

export const DATA_RETENTION_SUMMARY =
    'We retain your account, booking history, reviews, loyalty activity, signed ' +
    'contract acknowledgments, and first-party site usage analytics as part of ' +
    'running the studio. We do not auto-delete these records on a timer. You may ' +
    'request deletion of your personal data by contacting us.';
