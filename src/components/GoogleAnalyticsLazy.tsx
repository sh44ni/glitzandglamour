'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

interface GoogleAnalyticsLazyProps {
    gaId: string;
}

export default function GoogleAnalyticsLazy({ gaId }: GoogleAnalyticsLazyProps) {
    const [shouldLoad, setShouldLoad] = useState(false);

    useEffect(() => {
        let loaded = false;

        const load = () => {
            if (loaded) return;
            loaded = true;
            setShouldLoad(true);
            cleanup();
        };

        const cleanup = () => {
            window.removeEventListener('pointerdown', load, { capture: true });
            window.removeEventListener('keydown', load, { capture: true });
            window.removeEventListener('touchstart', load, { capture: true });
            window.removeEventListener('scroll', load, { capture: true });
            if (typeof window !== 'undefined' && 'cancelIdleCallback' in window && idleId) {
                (window as any).cancelIdleCallback(idleId);
            }
            clearTimeout(fallbackTimer);
        };

        // Load on first user interaction
        window.addEventListener('pointerdown', load, { capture: true, passive: true });
        window.addEventListener('keydown', load, { capture: true });
        window.addEventListener('touchstart', load, { capture: true, passive: true });
        window.addEventListener('scroll', load, { capture: true, passive: true });

        // Or load when browser is idle (fallback: 3.5 seconds)
        let idleId: number | null = null;
        if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
            idleId = (window as any).requestIdleCallback(load, { timeout: 4000 });
        }
        const fallbackTimer = setTimeout(load, 3500);

        return cleanup;
    }, []);

    if (!shouldLoad) return null;

    return (
        <>
            <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
                strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
                {`
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', '${gaId}', { page_path: window.location.pathname });
                `}
            </Script>
        </>
    );
}
