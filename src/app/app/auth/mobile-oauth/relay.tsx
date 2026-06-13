'use client';

import { useEffect, useRef } from 'react';

export default function MobileOAuthRelay({ provider }: { provider: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const csrfRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Fetch CSRF token then auto-POST to NextAuth's OAuth endpoint.
    // This bypasses the custom pages.signIn redirect that a plain GET request would trigger.
    fetch('/api/auth/csrf')
      .then((r) => r.json())
      .then(({ csrfToken }: { csrfToken: string }) => {
        if (csrfRef.current) csrfRef.current.value = csrfToken;
        formRef.current?.submit();
      })
      .catch(() => {
        // v5 may not require CSRF for OAuth — try anyway
        formRef.current?.submit();
      });
  }, [provider]);

  const label = provider === 'apple' ? 'Apple' : 'Google';

  return (
    <>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          background: '#fff',
          fontFamily: 'system-ui, sans-serif',
          gap: 12,
        }}
      >
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="16" fill="#FF2D78" fillOpacity="0.12" />
          <circle cx="16" cy="16" r="5" fill="#FF2D78" />
        </svg>
        <p style={{ color: '#999', fontSize: 14, margin: 0 }}>
          Connecting to {label}…
        </p>
      </div>

      {/* Hidden form — submitted programmatically after CSRF token is fetched */}
      <form
        ref={formRef}
        method="POST"
        action={`/api/auth/signin/${provider}`}
        style={{ display: 'none' }}
      >
        <input ref={csrfRef} type="hidden" name="csrfToken" defaultValue="" />
        {/* callbackUrl must be same-origin; /app/auth/callback creates the deep-link code */}
        <input type="hidden" name="callbackUrl" value="/app/auth/callback" />
      </form>
    </>
  );
}
