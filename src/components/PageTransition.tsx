'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export default function PageTransition({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [visible, setVisible] = useState(true);
    const prevPath = useRef(pathname);

    useEffect(() => {
        if (prevPath.current === pathname) return;
        prevPath.current = pathname;

        // Fade out (instant) then fade in
        setVisible(false);
        const t = setTimeout(() => setVisible(true), 40);
        return () => clearTimeout(t);
    }, [pathname]);

    return (
        <div
            style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(6px)',
                transition: visible
                    ? 'opacity 220ms ease-out, transform 220ms ease-out'
                    : 'none',
                willChange: 'opacity, transform',
            }}
        >
            {children}
        </div>
    );
}
