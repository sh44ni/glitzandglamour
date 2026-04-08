import type { NextRequest } from 'next/server';

function pickHeader(req: NextRequest, keys: string[]): string | null {
  for (const k of keys) {
    const v = req.headers.get(k);
    if (v && v.trim()) return v.trim();
  }
  return null;
}

export function getBookingOrigin(req: NextRequest): {
  ip: string | null;
  userAgent: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  latitude: string | null;
  longitude: string | null;
} {
  // IP: prefer forwarded-for (first), then real-ip.
  const xff = req.headers.get('x-forwarded-for');
  const ip =
    (xff ? xff.split(',')[0]?.trim() : null) ||
    req.headers.get('x-real-ip')?.trim() ||
    null;

  const userAgent = req.headers.get('user-agent')?.trim() || null;

  // Geo headers vary by host/proxy. We store whatever is available.
  const country =
    pickHeader(req, [
      'x-vercel-ip-country',
      'cf-ipcountry',
      'x-country',
      'x-geo-country',
    ]);

  const region =
    pickHeader(req, [
      'x-vercel-ip-country-region',
      'x-vercel-ip-region',
      'x-region',
      'x-geo-region',
    ]);

  const city =
    pickHeader(req, [
      'x-vercel-ip-city',
      'x-city',
      'x-geo-city',
    ]);

  const latitude =
    pickHeader(req, [
      'x-vercel-ip-latitude',
      'x-latitude',
      'x-geo-latitude',
    ]);

  const longitude =
    pickHeader(req, [
      'x-vercel-ip-longitude',
      'x-longitude',
      'x-geo-longitude',
    ]);

  return { ip, userAgent, country, region, city, latitude, longitude };
}

