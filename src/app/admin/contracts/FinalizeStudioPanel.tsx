'use client';

import { useState } from 'react';
import styles from './contracts.module.css';

export default function FinalizeStudioPanel({
    inviteId,
    onDone,
}: {
    inviteId: string;
    onDone: () => void;
}) {
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState('');

    async function submit() {
        setErr('');
        setBusy(true);
        try {
            const res = await fetch(`/api/admin/contracts/${inviteId}/finalize`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    retainerReceived: true,
                }),
            });
            const d = await res.json();
            if (!res.ok) {
                setErr(d.error || 'Finalize failed');
                return;
            }
            onDone();
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className={styles.panel} style={{ borderColor: 'rgba(0,212,120,0.25)' }}>
            <h3 style={{ color: '#00D478', fontSize: 15, marginBottom: 10 }}>Finalize contract (SIGNED)</h3>
            <p style={{ color: '#888', fontSize: 13, marginBottom: 14 }}>
                Confirm the retainer has been received. This marks the booking as officially confirmed and triggers the client confirmation email.
            </p>
            {err ? <p style={{ color: '#ff6b8a', marginBottom: 10 }}>{err}</p> : null}
            <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                <button type="button" className={`btn-primary ${styles.primaryBtn}`} disabled={busy} onClick={submit}>
                    {busy ? 'Saving…' : 'Mark retainer received & confirm booking'}
                </button>
            </div>
        </div>
    );
}
