'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

const SESSION_KEY = 'gg_sid';

function getOrCreateSessionId(): string {
    // Use sessionStorage so each browser tab/session is unique
    try {
        let sid = sessionStorage.getItem(SESSION_KEY);
        if (!sid) {
            sid = Math.random().toString(36).slice(2) + Date.now().toString(36);
            sessionStorage.setItem(SESSION_KEY, sid);
        }
        return sid;
    } catch {
        return Math.random().toString(36).slice(2);
    }
}

function getDevice(): string {
    const ua = navigator.userAgent;
    if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet';
    if (/mobile|android|iphone|ipod|blackberry|opera mini|iemobile/i.test(ua)) return 'mobile';
    return 'desktop';
}

export default function PageTracker() {
    const pathname = usePathname();
    const entryTimeRef = useRef<number>(Date.now());
    const sessionId = typeof window !== 'undefined' ? getOrCreateSessionId() : '';

    useEffect(() => {
        // Skip admin pages — we don't want to pollute analytics
        if (pathname?.startsWith('/admin')) return;

        entryTimeRef.current = Date.now();
        const sid = getOrCreateSessionId();

        // Track the page view
        fetch('/api/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                path: pathname,
                sessionId: sid,
                referrer: document.referrer || null,
                device: getDevice(),
            }),
        }).catch(() => {});

        // On page change / unload, send time-on-page
        const sendDuration = () => {
            const duration = Math.round((Date.now() - entryTimeRef.current) / 1000);
            if (duration < 2) return; // ignore instant bounces

            // Use sendBeacon for unload reliability
            const blob = new Blob(
                [JSON.stringify({ path: pathname, sessionId: sid, duration })],
                { type: 'application/json' }
            );
            navigator.sendBeacon('/api/track', blob);
        };

        window.addEventListener('beforeunload', sendDuration);
        return () => {
            sendDuration();
            window.removeEventListener('beforeunload', sendDuration);
        };
    }, [pathname, sessionId]);

    return null; // invisible component
}
