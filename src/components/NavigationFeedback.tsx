'use client';

import { useEffect, useState, useRef, useCallback, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

function NavigationFeedbackBar() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [active, setActive] = useState(false);
    const [progress, setProgress] = useState(0);
    const [visible, setVisible] = useState(false);

    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const fadeTimerRef = useRef<NodeJS.Timeout | null>(null);
    const safetyTimerRef = useRef<NodeJS.Timeout | null>(null);

    const startLoading = useCallback(() => {
        if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
        if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current);
        if (timerRef.current) clearInterval(timerRef.current);

        setVisible(true);
        setActive(true);
        setProgress(28);

        let currentProgress = 28;
        timerRef.current = setInterval(() => {
            currentProgress += (92 - currentProgress) * 0.15;
            setProgress(currentProgress);
        }, 120);

        // Safety timeout to reset after 8 seconds if navigation aborted
        safetyTimerRef.current = setTimeout(() => {
            stopLoading();
        }, 8000);
    }, []);

    const stopLoading = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current);

        setProgress(100);

        fadeTimerRef.current = setTimeout(() => {
            setVisible(false);
            setActive(false);
            setProgress(0);
        }, 200);
    }, []);

    // Listen for pathname or searchParams changes -> Route navigation complete
    useEffect(() => {
        if (active) {
            stopLoading();
        }
    }, [pathname, searchParams, active, stopLoading]);

    // Global click listener for internal link clicks
    useEffect(() => {
        function handleClick(e: MouseEvent | TouchEvent) {
            // Only left-clicks without modifier keys
            if ('button' in e && e.button !== 0) return;
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

            const target = e.target as HTMLElement | null;
            if (!target) return;

            // Find closest anchor tag
            const anchor = target.closest('a') as HTMLAnchorElement | null;
            if (!anchor) return;

            const href = anchor.getAttribute('href');
            if (!href) return;

            // Ignore external links, downloads, anchors, tel/mailto, or new tabs
            if (
                anchor.target === '_blank' ||
                anchor.hasAttribute('download') ||
                href.startsWith('mailto:') ||
                href.startsWith('tel:') ||
                href.startsWith('sms:') ||
                href.startsWith('javascript:')
            ) {
                return;
            }

            // Check if same origin
            try {
                const targetUrl = new URL(anchor.href, window.location.href);
                const currentOrigin = window.location.origin;

                if (targetUrl.origin !== currentOrigin) return;

                // If clicking an in-page anchor on the current page, don't trigger loading bar
                if (
                    targetUrl.pathname === window.location.pathname &&
                    targetUrl.search === window.location.search &&
                    targetUrl.hash
                ) {
                    return;
                }

                // If identical to current full URL, no navigation
                if (targetUrl.href === window.location.href) {
                    return;
                }

                // Legitimate internal navigation initiated!
                startLoading();
            } catch {
                // If URL parsing fails, ignore
            }
        }

        // Also listen for browser back/forward buttons
        function handlePopState() {
            startLoading();
        }

        document.addEventListener('click', handleClick, { capture: true, passive: true });
        window.addEventListener('popstate', handlePopState);

        return () => {
            document.removeEventListener('click', handleClick, { capture: true });
            window.removeEventListener('popstate', handlePopState);
            if (timerRef.current) clearInterval(timerRef.current);
            if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
            if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current);
        };
    }, [startLoading]);

    if (!visible) return null;

    return (
        <div
            id="global-nav-progress"
            aria-hidden="true"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                zIndex: 999999,
                pointerEvents: 'none',
                background: 'transparent',
                opacity: progress >= 100 ? 0 : 1,
                transition: 'opacity 200ms ease-out',
            }}
        >
            <div
                style={{
                    height: '100%',
                    width: `${progress}%`,
                    background: 'linear-gradient(90deg, #FF2D78 0%, #FF6BA8 50%, #d946ef 100%)',
                    boxShadow: '0 0 10px #FF2D78, 0 0 20px rgba(255, 45, 120, 0.75), 0 0 4px #fff',
                    borderRadius: '0 2px 2px 0',
                    transition: progress === 100
                        ? 'width 100ms ease-out'
                        : 'width 250ms cubic-bezier(0.1, 0.7, 0.1, 1)',
                    position: 'relative',
                }}
            >
                {/* Glowing leading spark */}
                <div
                    style={{
                        position: 'absolute',
                        right: 0,
                        top: '-2px',
                        bottom: '-2px',
                        width: '8px',
                        background: '#ffffff',
                        borderRadius: '50%',
                        boxShadow: '0 0 8px 3px #FF2D78, 0 0 14px 6px rgba(255, 107, 168, 0.8)',
                    }}
                />
            </div>
        </div>
    );
}

export default function NavigationFeedback() {
    return (
        <Suspense fallback={null}>
            <NavigationFeedbackBar />
        </Suspense>
    );
}
