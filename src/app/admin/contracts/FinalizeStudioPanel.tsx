'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './contracts.module.css';

export default function FinalizeStudioPanel({
    inviteId,
    onDone,
}: {
    inviteId: string;
    onDone: () => void;
}) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
    const drawing = useRef(false);
    const [hasSig, setHasSig] = useState(false);
    const [name, setName] = useState('Jojany Lavalle');
    const [dateStr, setDateStr] = useState(() => {
        const t = new Date();
        return t.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    });
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState('');

    const setup = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const w = 480;
        const h = 140;
        const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);
        ctx.strokeStyle = '#141414';
        ctx.lineWidth = 2.25;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctxRef.current = ctx;
    }, []);

    useEffect(() => {
        setup();
    }, [setup]);

    function pos(e: React.MouseEvent | React.TouchEvent) {
        const canvas = canvasRef.current!;
        const r = canvas.getBoundingClientRect();
        if ('touches' in e && e.touches[0]) {
            return { x: e.touches[0].clientX - r.left, y: e.touches[0].clientY - r.top };
        }
        const me = e as React.MouseEvent;
        return { x: me.clientX - r.left, y: me.clientY - r.top };
    }

    async function submit() {
        setErr('');
        const canvas = canvasRef.current;
        if (!canvas || !hasSig) {
            setErr('Draw your studio signature first.');
            return;
        }
        if (!name.trim()) {
            setErr('Printed name is required.');
            return;
        }
        setBusy(true);
        try {
            const signaturePngBase64 = canvas.toDataURL('image/png');
            const res = await fetch(`/api/admin/contracts/${inviteId}/finalize`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    retainerReceived: true,
                    adminPrintedName: name.trim(),
                    adminSignDateDisplay: dateStr.trim(),
                    signaturePngBase64,
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
                Confirm retainer received, then add your countersignature. This regenerates the final PDF with the full agreement
                text.
            </p>
            {err ? <p style={{ color: '#ff6b8a', marginBottom: 10 }}>{err}</p> : null}
            <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 11, color: '#888', marginBottom: 4 }}>Printed name</label>
                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{
                        width: '100%',
                        maxWidth: 400,
                        padding: '10px 12px',
                        borderRadius: 10,
                        border: '1px solid rgba(255,255,255,0.12)',
                        background: 'rgba(0,0,0,0.25)',
                        color: '#fff',
                    }}
                />
            </div>
            <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 11, color: '#888', marginBottom: 4 }}>Date line</label>
                <input
                    value={dateStr}
                    onChange={(e) => setDateStr(e.target.value)}
                    style={{
                        width: '100%',
                        maxWidth: 400,
                        padding: '10px 12px',
                        borderRadius: 10,
                        border: '1px solid rgba(255,255,255,0.12)',
                        background: 'rgba(0,0,0,0.25)',
                        color: '#fff',
                    }}
                />
            </div>
            <p style={{ fontSize: 12, color: '#888', marginBottom: 6 }}>Studio signature</p>
            <canvas
                ref={canvasRef}
                style={{ border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, touchAction: 'none', cursor: 'crosshair' }}
                onMouseDown={(e) => {
                    const ctx = ctxRef.current;
                    if (!ctx) return;
                    drawing.current = true;
                    ctx.beginPath();
                    const p = pos(e);
                    ctx.moveTo(p.x, p.y);
                }}
                onMouseMove={(e) => {
                    if (!drawing.current) return;
                    const ctx = ctxRef.current;
                    if (!ctx) return;
                    const p = pos(e);
                    ctx.lineTo(p.x, p.y);
                    ctx.stroke();
                    setHasSig(true);
                }}
                onMouseUp={() => {
                    drawing.current = false;
                }}
                onMouseLeave={() => {
                    drawing.current = false;
                }}
                onTouchStart={(e) => {
                    e.preventDefault();
                    const ctx = ctxRef.current;
                    if (!ctx) return;
                    drawing.current = true;
                    ctx.beginPath();
                    const p = pos(e);
                    ctx.moveTo(p.x, p.y);
                }}
                onTouchMove={(e) => {
                    e.preventDefault();
                    if (!drawing.current) return;
                    const ctx = ctxRef.current;
                    if (!ctx) return;
                    const p = pos(e);
                    ctx.lineTo(p.x, p.y);
                    ctx.stroke();
                    setHasSig(true);
                }}
                onTouchEnd={() => {
                    drawing.current = false;
                }}
            />
            <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                <button type="button" className={styles.copyBtn} onClick={setup}>
                    Clear signature
                </button>
                <button type="button" className={`btn-primary ${styles.primaryBtn}`} disabled={busy} onClick={submit}>
                    {busy ? 'Saving…' : 'Mark retainer received & sign'}
                </button>
            </div>
        </div>
    );
}
