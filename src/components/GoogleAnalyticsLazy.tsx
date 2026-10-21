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
            window.removeEventListener('wheel', load, { capture: true });
            window.removeEventListener('mousemove', load, { capture: true });
            clearTimeout(fallbackTimer);
        };

        // Load on first genuine user interaction
        window.addEventListener('pointerdown', load, { capture: true, passive: true });
        window.addEventListener('keydown', load, { capture: true });
        window.addEventListener('touchstart', load, { capture: true, passive: true });
        window.addEventListener('wheel', load, { capture: true, passive: true });
        window.addEventListener('mousemove', load, { capture: true, passive: true });

        // Fallback: load after 25 seconds if user hasn't interacted
        const fallbackTimer = setTimeout(load, 25000);

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
