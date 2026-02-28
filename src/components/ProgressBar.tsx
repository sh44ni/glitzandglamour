'use client';

import { AppProgressBar } from 'next-nprogress-bar';

export default function ProgressBar() {
    return (
        <AppProgressBar
            height="2px"
            color="#FF2D78"
            options={{ showSpinner: false }}
            shallowRouting
        />
    );
}
