'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Plus, Trash2, Save, UploadCloud } from 'lucide-react';
import styles from './contracts.module.css';

const MAX = 12;
const inp: React.CSSProperties = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px 14px', color: '#fff', fontFamily: 'Poppins, sans-serif', fontSize: '13px', width: '100%', boxSizing: 'border-box' as const };
const lbl: React.CSSProperties = { display: 'block', fontSize: '11px', color: '#888', marginBottom: '4px', fontWeight: 600, letterSpacing: '0.5px' };

type Photo = { id: string; url: string; title: string; description: string; order: number };

export default function SpecialEventPageContent() {
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState('');
    const [uploading, setUploading] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const r = await fetch('/api/admin/gallery-photos');
            if (r.ok) setPhotos((await r.json()).photos || []);
        } finally { setLoading(false); }
    }, []);

    useEffect(() => { load(); }, [load]);

    async function uploadFile(file: File): Promise<string | null> {
        const fd = new FormData(); fd.append('file', file);
        const r = await fetch('/api/upload', { method: 'POST', body: fd });
        if (!r.ok) return null;
        return (await r.json()).url;
    }

    async function handleAdd(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        if (photos.length >= MAX) { alert(`Maximum ${MAX} gallery photos allowed.`); return; }
        setUploading(true);
        try {
            const url = await uploadFile(file);
            if (!url) { alert('Upload failed'); return; }
            await fetch('/api/admin/gallery-photos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url, title: '', description: '' }),
            });
            await load();
        } finally {
            setUploading(false);
            if (fileRef.current) fileRef.current.value = '';
        }
    }

    async function save(p: Photo) {
        setSaving(p.id);
        await fetch('/api/admin/gallery-photos', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: p.id, title: p.title, description: p.description }),
        });
        setSaving('');
    }

    async function del(id: string) {
        if (!confirm('Delete this photo?')) return;
        await fetch(`/api/admin/gallery-photos?id=${id}`, { method: 'DELETE' });
        setPhotos(ps => ps.filter(p => p.id !== id));
    }

    function update(id: string, field: 'title' | 'description', val: string) {
        setPhotos(ps => ps.map(p => p.id === id ? { ...p, [field]: val } : p));
    }

    if (loading) return <p style={{ color: '#666', fontFamily: 'Poppins, sans-serif', padding: '20px' }}>Loading gallery…</p>;

    return (
        <div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAdd} />

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                    <h2 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '16px', fontWeight: 700, color: '#FF6BA8', margin: 0 }}>
                        Gallery Photos
                        <span style={{ fontSize: '12px', color: '#555', fontWeight: 400, marginLeft: '8px' }}>
                            {photos.length}/{MAX} photos
                        </span>
                    </h2>
                    <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#666', margin: '4px 0 0' }}>
                        Each photo title & description appears in a popup when visitors click the image. Used for SEO.
                    </p>
                </div>
                <button
                    className={styles.btnSecondary}
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading || photos.length >= MAX}
                    style={{ marginTop: 0, flexShrink: 0 }}
                >
                    <UploadCloud size={14} />
                    {uploading ? 'Uploading…' : 'Add Photo'}
                </button>
            </div>

            {/* Empty state */}
            {photos.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.08)' }}>
                    <p style={{ fontFamily: 'Poppins, sans-serif', color: '#555', fontSize: '14px', marginBottom: '16px' }}>
                        No gallery photos yet. Upload up to {MAX} photos.
                    </p>
                    <button className={styles.btnPrimary} onClick={() => fileRef.current?.click()} disabled={uploading}>
                        <UploadCloud size={14} /> Upload First Photo
                    </button>
                </div>
            )}

            {/* Photo cards */}
            <div style={{ display: 'grid', gap: '16px' }}>
                {photos.map((p, i) => (
                    <div key={p.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '16px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                        {/* Thumbnail */}
                        <div style={{ width: '100px', height: '80px', borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', flexShrink: 0, position: 'relative', background: '#111' }}>
                            <Image src={p.url} alt={p.title || `Photo ${i + 1}`} fill style={{ objectFit: 'cover' }} />
                            <div style={{ position: 'absolute', bottom: '4px', left: '4px', background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: '10px', fontWeight: 700, padding: '1px 7px', borderRadius: '6px', fontFamily: 'Poppins, sans-serif' }}>
                                #{i + 1}
                            </div>
                        </div>

                        {/* Fields */}
                        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div>
                                <label style={lbl}>Title <span style={{ color: '#555', fontWeight: 400 }}>(popup heading)</span></label>
                                <input
                                    style={inp}
                                    value={p.title}
                                    placeholder="e.g. Natural Glow — Bridal Makeup"
                                    onChange={e => update(p.id, 'title', e.target.value)}
                                />
                            </div>
                            <div>
                                <label style={lbl}>Description <span style={{ color: '#555', fontWeight: 400 }}>(popup body · SEO text)</span></label>
                                <textarea
                                    style={{ ...inp, resize: 'vertical', minHeight: '64px' }}
                                    value={p.description}
                                    placeholder="e.g. Soft glam bridal look with luminous skin and defined brows for a wedding in Vista, CA."
                                    onChange={e => update(p.id, 'description', e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }}>
                            <button
                                className={styles.btnPrimary}
                                onClick={() => save(p)}
                                disabled={saving === p.id}
                                style={{ marginTop: 0, fontSize: '12px', padding: '8px 14px', whiteSpace: 'nowrap' }}
                            >
                                <Save size={13} /> {saving === p.id ? 'Saving…' : 'Save'}
                            </button>
                            <button
                                onClick={() => del(p.id)}
                                style={{ background: 'rgba(255,45,120,0.08)', border: '1px solid rgba(255,45,120,0.2)', borderRadius: '8px', cursor: 'pointer', color: '#FF2D78', padding: '7px 14px', fontSize: '12px', fontFamily: 'Poppins, sans-serif', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}
                            >
                                <Trash2 size={13} /> Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Progress bar */}
            {photos.length > 0 && (
                <div style={{ marginTop: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: '#555' }}>Gallery capacity</span>
                        <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: photos.length >= MAX ? '#FF2D78' : '#4ade80' }}>{photos.length}/{MAX}</span>
                    </div>
                    <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${(photos.length / MAX) * 100}%`, background: photos.length >= MAX ? '#FF2D78' : 'linear-gradient(90deg, #FF2D78, #a855f7)', borderRadius: '2px', transition: 'width 0.3s' }} />
                    </div>
                </div>
            )}
        </div>
    );
}
