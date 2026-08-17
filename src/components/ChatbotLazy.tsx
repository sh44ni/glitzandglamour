'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

// Dynamically import the chatbot — it's a heavy component (~38KB JS)
const Chatbot = dynamic(() => import('@/components/Chatbot'), { ssr: false });

export default function ChatbotLazy() {
    const [shouldLoad, setShouldLoad] = useState(false);

    useEffect(() => {
        // Strategy: load after user interaction OR 12s idle — whichever comes first.
        // This keeps the chatbot off the critical path for LCP and TBT.
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
            clearTimeout(idleTimer);
        };

        // Fire on any user interaction
        window.addEventListener('pointerdown', load, { capture: true, passive: true });
        window.addEventListener('keydown', load, { capture: true });
        window.addEventListener('touchstart', load, { capture: true, passive: true });
        window.addEventListener('scroll', load, { capture: true, passive: true });

        // Fallback: load after 12 seconds if user hasn't interacted
        const idleTimer = setTimeout(load, 12000);

        return cleanup;
    }, []);

    if (!shouldLoad) return null;

    return <Chatbot />;
}
