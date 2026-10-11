/**
 * Traffic Source Classifier & Normalizer
 * Standardizes inbound referrers, UTM parameters, and direct navigation
 * into canonical sites, brand names, and display categories.
 */

export type TrafficCategory = 'social' | 'search' | 'direct' | 'referral' | 'campaign' | 'internal_auth';
export type TrafficIconType =
    | 'instagram'
    | 'google'
    | 'facebook'
    | 'linktree'
    | 'yelp'
    | 'tiktok'
    | 'bing'
    | 'pinterest'
    | 'youtube'
    | 'twitter'
    | 'direct'
    | 'globe';

export interface ClassifiedTrafficSource {
    canonicalSite: string;       // e.g. 'instagram.com', 'google.com', 'direct'
    displayName: string;         // e.g. 'Instagram', 'Google Search', 'Direct / Bookmarks'
    category: TrafficCategory;
    iconType: TrafficIconType;
    brandColor: string;
    isInternalOrAuth: boolean;
    rawHost: string | null;
}

export function classifyTrafficSource(params: {
    referrer?: string | null;
    referrerHost?: string | null;
    utmSource?: string | null;
    utmCampaign?: string | null;
}): ClassifiedTrafficSource {
    const rawUtmSource = params.utmSource?.trim().toLowerCase() || null;
    let host = (params.referrerHost || '').trim().toLowerCase();

    // If no host was provided but a referrer URL exists, extract hostname
    if (!host && params.referrer) {
        try {
            const url = new URL(params.referrer.startsWith('http') ? params.referrer : `https://${params.referrer}`);
            host = url.hostname.toLowerCase();
        } catch {
            host = params.referrer.trim().toLowerCase();
        }
    }

    // Strip leading www.
    host = host.replace(/^www\./, '');

    // ── 1. Check for Internal & OAuth Handshake (to exclude from marketing) ──
    if (
        host === 'appleid.apple.com' ||
        host === 'accounts.google.com' ||
        host === 'glitzandglamours.com' ||
        host.endsWith('.glitzandglamours.com') ||
        host === 'localhost' ||
        host.startsWith('127.0.0.1') ||
        host.startsWith('192.168.') ||
        host.startsWith('10.')
    ) {
        return {
            canonicalSite: host || 'internal',
            displayName: host === 'appleid.apple.com' ? 'Apple ID (Auth)' : host === 'accounts.google.com' ? 'Google Account (Auth)' : 'Internal Navigation',
            category: 'internal_auth',
            iconType: 'globe',
            brandColor: '#888888',
            isInternalOrAuth: true,
            rawHost: host || null,
        };
    }

    // ── 2. Instagram ──
    if (
        rawUtmSource === 'instagram' ||
        rawUtmSource === 'ig' ||
        host.includes('instagram.com') ||
        host === 'ig.me' ||
        host === 'l.instagram.com'
    ) {
        return {
            canonicalSite: 'instagram.com',
            displayName: 'Instagram',
            category: 'social',
            iconType: 'instagram',
            brandColor: '#E1306C',
            isInternalOrAuth: false,
            rawHost: host || 'instagram.com',
        };
    }

    // ── 3. Facebook / Meta ──
    if (
        rawUtmSource === 'facebook' ||
        rawUtmSource === 'fb' ||
        rawUtmSource === 'meta' ||
        host.includes('facebook.com') ||
        host === 'fb.me' ||
        host === 'm.facebook.com' ||
        host === 'lm.facebook.com' ||
        host === 'l.facebook.com'
    ) {
        return {
            canonicalSite: 'facebook.com',
            displayName: 'Facebook',
            category: 'social',
            iconType: 'facebook',
            brandColor: '#1877F2',
            isInternalOrAuth: false,
            rawHost: host || 'facebook.com',
        };
    }

    // ── 4. Google Search ──
    if (
        rawUtmSource === 'google' ||
        host.includes('google.') ||
        host.includes('googlequicksearchbox') ||
        host === 'com.google.android.googlequicksearchbox'
    ) {
        return {
            canonicalSite: 'google.com',
            displayName: 'Google Search',
            category: 'search',
            iconType: 'google',
            brandColor: '#4285F4',
            isInternalOrAuth: false,
            rawHost: host || 'google.com',
        };
    }

    // ── 5. Linktree (Bio) ──
    if (host.includes('linktr.ee') || rawUtmSource === 'linktree') {
        return {
            canonicalSite: 'linktr.ee',
            displayName: 'Linktree (Bio)',
            category: 'social',
            iconType: 'linktree',
            brandColor: '#39E09B',
            isInternalOrAuth: false,
            rawHost: host || 'linktr.ee',
        };
    }

    // ── 6. Yelp ──
    if (host.includes('yelp.com') || rawUtmSource === 'yelp') {
        return {
            canonicalSite: 'yelp.com',
            displayName: 'Yelp',
            category: 'referral',
            iconType: 'yelp',
            brandColor: '#FF1A1A',
            isInternalOrAuth: false,
            rawHost: host || 'yelp.com',
        };
    }

    // ── 7. TikTok ──
    if (host.includes('tiktok.com') || rawUtmSource === 'tiktok') {
        return {
            canonicalSite: 'tiktok.com',
            displayName: 'TikTok',
            category: 'social',
            iconType: 'tiktok',
            brandColor: '#00F2FE',
            isInternalOrAuth: false,
            rawHost: host || 'tiktok.com',
        };
    }

    // ── 8. Bing ──
    if (host.includes('bing.com') || rawUtmSource === 'bing') {
        return {
            canonicalSite: 'bing.com',
            displayName: 'Bing',
            category: 'search',
            iconType: 'bing',
            brandColor: '#008373',
            isInternalOrAuth: false,
            rawHost: host || 'bing.com',
        };
    }

    // ── 9. Pinterest ──
    if (host.includes('pinterest.com') || host === 'pin.it' || rawUtmSource === 'pinterest') {
        return {
            canonicalSite: 'pinterest.com',
            displayName: 'Pinterest',
            category: 'social',
            iconType: 'pinterest',
            brandColor: '#E60023',
            isInternalOrAuth: false,
            rawHost: host || 'pinterest.com',
        };
    }

    // ── 10. YouTube ──
    if (host.includes('youtube.com') || host === 'youtu.be' || rawUtmSource === 'youtube') {
        return {
            canonicalSite: 'youtube.com',
            displayName: 'YouTube',
            category: 'social',
            iconType: 'youtube',
            brandColor: '#FF0000',
            isInternalOrAuth: false,
            rawHost: host || 'youtube.com',
        };
    }

    // ── 11. X / Twitter ──
    if (host.includes('twitter.com') || host.includes('x.com') || host === 't.co' || rawUtmSource === 'twitter') {
        return {
            canonicalSite: 'x.com',
            displayName: 'X / Twitter',
            category: 'social',
            iconType: 'twitter',
            brandColor: '#1DA1F2',
            isInternalOrAuth: false,
            rawHost: host || 'x.com',
        };
    }

    // ── 12. Direct Traffic (No Referrer) ──
    if (!host && !rawUtmSource) {
        return {
            canonicalSite: 'direct',
            displayName: 'Direct / Bookmarks',
            category: 'direct',
            iconType: 'direct',
            brandColor: '#00D478',
            isInternalOrAuth: false,
            rawHost: null,
        };
    }

    // ── 13. Other External Referrals ──
    const cleanHost = host || rawUtmSource || 'unknown';
    // Format display name nicely: capitalize first letter of domain (e.g. 'sandiego.org' -> 'Sandiego.org')
    const formattedName = cleanHost.charAt(0).toUpperCase() + cleanHost.slice(1);

    return {
        canonicalSite: cleanHost,
        displayName: formattedName,
        category: rawUtmSource ? 'campaign' : 'referral',
        iconType: 'globe',
        brandColor: '#AB47BC',
        isInternalOrAuth: false,
        rawHost: host || null,
    };
}
