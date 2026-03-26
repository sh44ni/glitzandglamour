'use client';

import { useEffect, useRef } from 'react';

export default function ViewTracker({ slug }: { slug: string }) {
    const hasFired = useRef(false);

    useEffect(() => {
        if (hasFired.current) return;
        hasFired.current = true;

        fetch(`/api/blogs/${slug}/view`, { method: 'POST', keepalive: true }).catch(console.error);
    }, [slug]);

    return null;
}
