// Dates of substantive content revisions, not build times or request times.
// Keep unchanged pages at the previous sitemap baseline. Add a path here when
// its published content changes instead of marking the whole site as updated.
const PREVIOUS_CONTENT_REVISION = '2026-11-13T00:00:00Z';

const CONTENT_UPDATES: Readonly<Record<string, string>> = {
  '/services/nails': '2026-11-26T00:00:00Z',
  '/services/pedicures': '2026-11-26T00:00:00Z',
  '/services/waxing': '2026-11-26T00:00:00Z',
  '/services/facials': '2026-11-26T00:00:00Z',
  '/services/eyebrow-wax': '2026-11-26T00:00:00Z',
};

export function getContentUpdatedAt(path: string): Date {
  return new Date(CONTENT_UPDATES[path] ?? PREVIOUS_CONTENT_REVISION);
}
