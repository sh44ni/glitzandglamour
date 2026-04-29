'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
import Link from 'next/link';
import { CheckCircle, Sparkles, ChevronDown, Check, Search, UploadCloud, X, AlertCircle } from 'lucide-react';
import { isAprilPromoActive, getPromoDealByServiceName } from '@/lib/aprilPromo';

type Service = { id: string; name: string; category: string; priceLabel: string };

// Services that require a health intake form
const HEALTH_INTAKE_CATEGORIES = ['facials', 'lashes', 'waxing'];

const TIMES = ['8:30 AM', '8:45 AM', '9:00 AM', '9:15 AM', '9:30 AM', '9:45 AM', '10:00 AM', '10:15 AM', '10:30 AM', '10:45 AM', '11:00 AM', '11:15 AM', '11:30 AM', '11:45 AM', '12:00 PM', '12:15 PM', '12:30 PM', '12:45 PM', '1:00 PM', '1:15 PM', '1:30 PM', '1:45 PM', '2:00 PM', '2:15 PM', '2:30 PM', '2:45 PM', '3:00 PM', '3:15 PM', '3:30 PM', '3:45 PM', '4:00 PM', '4:15 PM', '4:30 PM', '4:45 PM', '5:00 PM', '5:15 PM', '5:30 PM', '5:45 PM', '6:00 PM', '6:15 PM', '6:30 PM', '6:45 PM', '7:00 PM'];


// ─── Multi-Service Selector ───────────────────────────────────────────────
function ServiceMultiSelect({ services, values, onChange }: {
    services: Service[];
    values: string[];
    onChange: (ids: string[]) => void;
}) {
    const [query, setQuery] = useState('');
    const byCategory = services
        .filter(s => !query.trim() || s.name.toLowerCase().includes(query.toLowerCase()) || s.category.toLowerCase().includes(query.toLowerCase()))
        .reduce<Record<string, Service[]>>((acc, s) => {
            if (!acc[s.category]) acc[s.category] = [];
            acc[s.category].push(s);
            return acc;
        }, {});

    function toggle(id: string) {
        onChange(values.includes(id) ? values.filter(v => v !== id) : [...values, id]);
    }

    return (
        <div>
            {/* Search */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '10px', padding: '10px 14px', marginBottom: '10px',
            }}>
                <Search size={14} color="#777" style={{ flexShrink: 0 }} />
                <input
                    type="text" placeholder="Search services…" value={query}
                    onChange={e => setQuery(e.target.value)}
                    style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontFamily: 'Poppins, sans-serif', fontSize: '13px', color: '#fff' }}
                />
                {query && <button type="button" onClick={() => setQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666', padding: 0 }}>✕</button>}
            </div>

            {/* Selected chips */}
            {values.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                    {values.map(id => {
                        const svc = services.find(s => s.id === id);
                        return svc ? (
                            <span key={id} style={{
                                display: 'inline-flex', alignItems: 'center', gap: '5px',
                                background: 'rgba(255,45,120,0.15)', border: '1px solid rgba(255,45,120,0.35)',
                                borderRadius: '20px', padding: '4px 10px',
                                fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#FF2D78',
                            }}>
                                {svc.name}
                                <button type="button" onClick={() => toggle(id)}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#FF2D78', padding: 0, lineHeight: 1, fontSize: '13px' }}>×</button>
                            </span>
                        ) : null;
                    })}
                </div>
            )}

            {/* Service list */}
            <div style={{ maxHeight: '260px', overflowY: 'auto', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.07)', background: '#111' }}>
                {Object.entries(byCategory).map(([cat, svcs]) => (
                    <div key={cat}>
                        <div style={{
                            padding: '6px 14px 4px', fontFamily: 'Poppins, sans-serif', fontSize: '10px',
                            fontWeight: 700, color: '#FF2D78', textTransform: 'uppercase', letterSpacing: '1px',
                            background: 'rgba(255,45,120,0.04)', borderBottom: '1px solid rgba(255,255,255,0.05)',
                        }}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</div>
                        {svcs.map(s => {
                            const selected = values.includes(s.id);
                            return (
                                <button key={s.id} type="button" onClick={() => toggle(s.id)} style={{
                                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '10px 14px', background: selected ? 'rgba(255,45,120,0.08)' : 'transparent',
                                    border: 'none', cursor: 'pointer', textAlign: 'left',
                                    borderBottom: '1px solid rgba(255,255,255,0.03)',
                                }}
                                    onMouseOver={e => { if (!selected) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)'; }}
                                    onMouseOut={e => { if (!selected) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                                >
                                    <div>
                                        <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', fontWeight: 500, color: selected ? '#FF2D78' : '#e0e0e0' }}>{s.name}</div>
                                        <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: '#888' }}>{s.priceLabel}</div>
                                    </div>
                                    <div style={{
                                        width: '18px', height: '18px', borderRadius: '5px', flexShrink: 0,
                                        background: selected ? '#FF2D78' : 'rgba(255,255,255,0.08)',
                                        border: selected ? 'none' : '1px solid rgba(255,255,255,0.15)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        transition: 'all 0.15s',
                                    }}>
                                        {selected && <Check size={11} color="#fff" strokeWidth={3} />}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Image Uploader Component ──────────────────────────────────────────────
function InspoUploader({ urls, setUrls }: { urls: string[], setUrls: (urls: string[]) => void }) {
    const [uploadingCount, setUploadingCount] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    async function handleFiles(files: FileList | File[]) {
        const fileArray = Array.from(files).filter(file => {
            const isImage = file.type.startsWith('image/') || file.name.match(/\.(heic|heif|jpg|jpeg|png|webp|avif|gif)$/i);
            const isSizeValid = file.size <= 25 * 1024 * 1024;
            return isImage && isSizeValid;
        });

        if (fileArray.length !== files.length) {
            alert('Some files were ignored (must be images under 25MB).');
        }

        const availableSlots = 5 - urls.length;
        const filesToUpload = fileArray.slice(0, availableSlots);

        if (filesToUpload.length === 0) return;
        if (fileArray.length > availableSlots) {
            alert(`You can only upload up to 5 inspiration photos total. We'll upload the first ${availableSlots}.`);
        }

        setUploadingCount((prev) => prev + filesToUpload.length);

        const uploadedUrls: string[] = [];

        await Promise.all(filesToUpload.map(async (file) => {
            try {
                const formData = new FormData();
                formData.append('file', file);
                const res = await fetch('/api/upload', { method: 'POST', body: formData });
                if (!res.ok) throw new Error('Upload failed');
                const data = await res.json();
                uploadedUrls.push(data.url);
            } catch (e) {
                console.error(e);
            } finally {
                setUploadingCount((prev) => prev - 1);
            }
        }));

        if (uploadedUrls.length > 0) {
            setUrls([...urls, ...uploadedUrls]);
        }
    }

    return (
        <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <label className="label" style={{ marginBottom: 0 }}>Inspiration Photos <span style={{ fontWeight: 400, color: '#888', fontSize: '12px' }}>(Optional)</span></label>
                <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#888' }}>
                    {urls.length}/5
                </span>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {/* Uploaded Images */}
                {urls.map((url, idx) => (
                    <div key={idx} style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt={`Inspo ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button type="button" onClick={() => setUrls(urls.filter((_, i) => i !== idx))} style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}>
                            <X size={13} color="#fff" />
                        </button>
                    </div>
                ))}

                {/* Loading Placeholders */}
                {Array.from({ length: uploadingCount }).map((_, idx) => (
                    <div key={`loading-${idx}`} style={{ width: '80px', height: '80px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: '24px', height: '24px', border: '2px solid rgba(255,45,120,0.2)', borderTopColor: '#FF2D78', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                    </div>
                ))}

                {/* Add Button */}
                {(urls.length + uploadingCount < 5) && (
                    <button
                        type="button"
                        style={{ width: '80px', height: '80px', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.01)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0 }}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <UploadCloud size={24} color="#888" />
                    </button>
                )}
            </div>

            <input
                type="file"
                multiple
                ref={fileInputRef}
                style={{ display: 'none' }}
                // Accept image/* specifically forces iOS Safari to automatically convert HEIC to JPEG.
                accept="image/*"
                onChange={(e) => {
                    const files = e.target.files;
                    if (files && files.length > 0) handleFiles(files);
                    e.target.value = '';
                }}
            />
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            `}} />
        </div>
    );
}

// ─── Service Dropdown (legacy single-select, kept for reference) ────────────
function ServiceDropdown({ services, value, onChange }: {
    services: Service[];
    value: string;
    onChange: (id: string) => void;
}) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const ref = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        function handler(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    useEffect(() => {
        if (open) setTimeout(() => searchRef.current?.focus(), 50);
    }, [open]);

    const selected = services.find(s => s.id === value);

    const filtered = query.trim()
        ? services.filter(s =>
            s.name.toLowerCase().includes(query.toLowerCase()) ||
            s.category.toLowerCase().includes(query.toLowerCase())
        )
        : services;

    const byCategory = filtered.reduce<Record<string, Service[]>>((acc, s) => {
        if (!acc[s.category]) acc[s.category] = [];
        acc[s.category].push(s);
        return acc;
    }, {});

    return (
        <div ref={ref} style={{ position: 'relative' }}>
            {/* Trigger */}
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                style={{
                    width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: 'rgba(255,255,255,0.05)',
                    border: `1px solid ${open ? '#FF2D78' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: '10px', padding: '12px 14px', cursor: 'pointer',
                    fontFamily: 'Poppins, sans-serif', fontSize: '14px',
                    color: selected ? '#fff' : '#888', transition: 'border-color 0.2s',
                }}
            >
                <span>{selected ? `${selected.name} — ${selected.priceLabel}` : 'Select a service…'}</span>
                <ChevronDown size={16} color="#666" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />
            </button>

            {/* Panel */}
            {open && (
                <div style={{
                    position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 200,
                    background: '#181818', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '14px', overflow: 'hidden',
                    boxShadow: '0 20px 48px rgba(0,0,0,0.8)',
                }}>
                    {/* Search bar */}
                    <div style={{ padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Search size={14} color="#555" style={{ flexShrink: 0 }} />
                        <input
                            ref={searchRef}
                            type="text"
                            placeholder="Search services…"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            style={{
                                flex: 1, background: 'none', border: 'none', outline: 'none',
                                fontFamily: 'Poppins, sans-serif', fontSize: '13px', color: '#fff',
                            }}
                        />
                        {query && (
                            <button type="button" onClick={() => setQuery('')}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555', padding: 0, lineHeight: 1 }}>
                                ✕
                            </button>
                        )}
                    </div>

                    {/* Service list */}
                    <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                        {Object.keys(byCategory).length === 0 && (
                            <div style={{ padding: '16px 14px', fontFamily: 'Poppins, sans-serif', color: '#555', fontSize: '13px' }}>
                                No services match "{query}"
                            </div>
                        )}
                        {Object.entries(byCategory).map(([cat, svcs]) => (
                            <div key={cat}>
                                <div style={{
                                    padding: '7px 14px 5px',
                                    fontFamily: 'Poppins, sans-serif', fontSize: '10px', fontWeight: 700,
                                    color: '#FF2D78', textTransform: 'uppercase', letterSpacing: '1px',
                                    background: 'rgba(255,45,120,0.04)',
                                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                                }}>
                                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                </div>
                                {svcs.map(s => {
                                    const isSelected = value === s.id;
                                    return (
                                        <button
                                            key={s.id}
                                            type="button"
                                            onClick={() => { onChange(s.id); setOpen(false); setQuery(''); }}
                                            style={{
                                                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                padding: '11px 14px',
                                                background: isSelected ? 'rgba(255,45,120,0.1)' : 'transparent',
                                                border: 'none', cursor: 'pointer', textAlign: 'left',
                                                borderBottom: '1px solid rgba(255,255,255,0.03)',
                                            }}
                                            onMouseOver={e => { if (!isSelected) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)'; }}
                                            onMouseOut={e => { if (!isSelected) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                                        >
                                            <div>
                                                <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', fontWeight: 500, color: isSelected ? '#FF2D78' : '#e0e0e0' }}>
                                                    {s.name}
                                                </div>
                                                <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: '#555' }}>
                                                    {s.priceLabel}
                                                </div>
                                            </div>
                                            {isSelected && <Check size={14} color="#FF2D78" />}
                                        </button>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Time Dropdown ─────────────────────────────────────────────────────────
function TimeDropdown({ times, value, onChange }: { times: string[]; value: string; onChange: (t: string) => void; }) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handler(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div ref={ref} style={{ position: 'relative' }}>
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                style={{
                    width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: 'rgba(255,255,255,0.05)',
                    border: `1px solid ${open ? '#FF2D78' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: '10px', padding: '12px 14px', cursor: 'pointer',
                    fontFamily: 'Poppins, sans-serif', fontSize: '14px',
                    color: value ? '#fff' : '#888', transition: 'border-color 0.2s',
                }}
            >
                <span>{value || 'Select time…'}</span>
                <ChevronDown size={16} color="#666" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />
            </button>

            {open && (
                <div style={{
                    position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 200,
                    background: '#181818', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '14px', overflow: 'hidden',
                    boxShadow: '0 20px 48px rgba(0,0,0,0.8)',
                    maxHeight: '240px', overflowY: 'auto',
                }}>
                    {times.map(t => {
                        const isSelected = value === t;
                        return (
                            <button
                                key={t}
                                type="button"
                                onClick={() => { onChange(t); setOpen(false); }}
                                style={{
                                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '10px 14px',
                                    background: isSelected ? 'rgba(255,45,120,0.1)' : 'transparent',
                                    border: 'none', cursor: 'pointer', textAlign: 'left',
                                    borderBottom: '1px solid rgba(255,255,255,0.03)',
                                    fontFamily: 'Poppins, sans-serif', fontSize: '13px',
                                    color: isSelected ? '#FF2D78' : '#ddd', fontWeight: isSelected ? 600 : 400,
                                }}
                                onMouseOver={e => { if (!isSelected) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)'; }}
                                onMouseOut={e => { if (!isSelected) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                            >
                                {t}
                                {isSelected && <Check size={13} color="#FF2D78" />}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// ─── Health Intake Accordion Section ──────────────────────────────────────
function IntakeSection({ num, title, open, onToggle, children }: {
    num: number; title: string; open: boolean; onToggle: () => void; children: React.ReactNode;
}) {
    return (
        <div style={{
            borderRadius: '16px', overflow: 'hidden', marginBottom: '10px',
            border: '1px solid rgba(255,255,255,0.06)',
        }}>
            <button
                type="button"
                onClick={onToggle}
                style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 18px',
                    background: open
                        ? 'linear-gradient(135deg, rgba(139,0,67,0.55), rgba(100,0,45,0.45))'
                        : 'rgba(255,255,255,0.03)',
                    border: 'none', cursor: 'pointer',
                    borderBottom: open ? '1px solid rgba(255,45,120,0.15)' : 'none',
                    transition: 'background 0.2s',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        width: '26px', height: '26px', borderRadius: '50%', flexShrink: 0,
                        background: open ? '#FF2D78' : 'rgba(255,45,120,0.15)',
                        border: `1px solid ${open ? '#FF2D78' : 'rgba(255,45,120,0.3)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'Poppins, sans-serif', fontSize: '12px', fontWeight: 700,
                        color: open ? '#fff' : '#FF2D78', transition: 'all 0.2s',
                    }}>{num}</div>
                    <span style={{
                        fontFamily: 'Poppins, sans-serif', fontSize: '14px', fontWeight: 600,
                        color: open ? '#FF2D78' : '#e0e0e0',
                    }}>{title}</span>
                </div>
                <ChevronDown
                    size={16} color={open ? '#FF2D78' : '#666'}
                    style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}
                />
            </button>
            {open && (
                <div style={{ padding: '20px 18px', background: 'rgba(0,0,0,0.2)' }}>
                    {children}
                </div>
            )}
        </div>
    );
}

// ─── Chip Toggle Button ───────────────────────────────────────────────────
function Chip({ label, selected, onToggle }: { label: string; selected: boolean; onToggle: () => void }) {
    return (
        <button
            type="button"
            onClick={onToggle}
            style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '7px 14px', borderRadius: '50px',
                background: selected ? 'rgba(255,45,120,0.12)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${selected ? 'rgba(255,45,120,0.45)' : 'rgba(255,255,255,0.1)'}`,
                cursor: 'pointer', transition: 'all 0.15s',
                fontFamily: 'Poppins, sans-serif', fontSize: '13px',
                color: selected ? '#FF2D78' : '#aaa', fontWeight: selected ? 600 : 400,
            }}
        >
            <span style={{
                width: '7px', height: '7px', borderRadius: '50%', flexShrink: 0,
                background: selected ? '#FF2D78' : 'rgba(255,255,255,0.2)',
                transition: 'background 0.15s',
            }} />
            {label}
        </button>
    );
}

// ─── Yes/No Toggle ────────────────────────────────────────────────────────
function YesNo({ question, value, onChange }: { question: string; value: 'yes' | 'no' | null; onChange: (v: 'yes' | 'no') => void }) {
    return (
        <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
            padding: '12px 16px', borderRadius: '12px',
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
            marginBottom: '8px',
        }}>
            <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', color: '#ddd', lineHeight: 1.4, flex: 1 }}>{question}</span>
            <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                {(['yes', 'no'] as const).map(opt => (
                    <button
                        key={opt}
                        type="button"
                        onClick={() => onChange(opt)}
                        style={{
                            padding: '6px 14px', borderRadius: '50px',
                            border: `1px solid ${value === opt ? (opt === 'yes' ? 'rgba(255,100,100,0.6)' : 'rgba(255,45,120,0.5)') : 'rgba(255,255,255,0.12)'}`,
                            background: value === opt ? (opt === 'yes' ? 'rgba(255,80,80,0.18)' : 'rgba(255,45,120,0.18)') : 'rgba(255,255,255,0.04)',
                            color: value === opt ? (opt === 'yes' ? '#ff8888' : '#FF2D78') : '#666',
                            fontFamily: 'Poppins, sans-serif', fontSize: '12px', fontWeight: 600,
                            cursor: 'pointer', transition: 'all 0.15s', textTransform: 'capitalize',
                        }}
                    >{opt}</button>
                ))}
            </div>
        </div>
    );
}

function BookingForm() {
    const { data: session } = useSession();
    const searchParams = useSearchParams();
    const router = useRouter();
    const preSelectedService = searchParams.get('service') || '';

    const [step, setStep] = useState(1);
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [phoneError, setPhoneError] = useState('');
    // Health intake accordion state
    const [intakeOpen, setIntakeOpen] = useState({ health: true, allergies: false, consent: false });
    // Health intake consent tracking
    const [intakeConsentChecked, setIntakeConsentChecked] = useState([false, false, false]);

    const [form, setForm] = useState({
        serviceIds: preSelectedService ? [preSelectedService] : [] as string[],
        preferredDate: '',
        preferredTime: '',
        guestName: '',
        guestEmail: '',
        phone: '',
        notes: '',
        inspoImageUrls: [] as string[],
        policyConsent: false,
        smsConsent: false,
        // ── Health Intake ──
        skinTypes: [] as string[],
        healthQ: {} as Record<string, 'yes' | 'no'>,
        medications: '',
        allergies: [] as string[],
        allergyNotes: '',
        emergencyName: '',
        emergencyPhone: '',
        emergencyRelation: '',
    });

    useEffect(() => {
        fetch('/api/services').then(r => r.json()).then(d => setServices(d.services || []));
    }, []);

    useEffect(() => {
        if (!session) return;
        fetch('/api/profile').then(r => r.json()).then(d => {
            if (d.user?.phone) setForm(f => ({ ...f, phone: d.user.phone }));
        }).catch(() => { });
    }, [session]);

    const set = (k: keyof typeof form, v: unknown) => setForm(f => ({ ...f, [k]: v }));
    const selectedServices = services.filter(s => form.serviceIds.includes(s.id));

    // Detect if health intake is needed
    const needsHealthIntake = selectedServices.some(s => HEALTH_INTAKE_CATEGORIES.includes(s.category));
    const totalSteps = needsHealthIntake ? 4 : 3;

    // ── April promo detection ──────────────────────────────────────────────
    const promoActive = isAprilPromoActive();
    const promoDeal = promoActive
        ? selectedServices.reduce<{ price: number; label: string } | null>((found, s) => {
            if (found) return found;
            return getPromoDealByServiceName(s.name, s.category);
        }, null)
        : null;

    function validatePhone(phone: string) {
        const cleaned = phone.replace(/\s/g, '');
        if (!cleaned) return 'Phone number is required';
        if (cleaned.length < 7) return 'Enter a valid phone number';
        return '';
    }

    function goForwardFromContact() {
        const err = validatePhone(form.phone);
        if (err) { setPhoneError(err); return; }
        setPhoneError('');
        if (!form.policyConsent) return;
        if (session) {
            fetch('/api/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: form.phone }),
            }).catch(() => { });
        }
        // If health intake needed, go to step 3 (intake), else step 4 (review)
        setStep(needsHealthIntake ? 3 : 4);
    }

    const intakeComplete = intakeConsentChecked.every(Boolean);

    async function submit() {
        setLoading(true);
        try {
            const payload: Record<string, unknown> = {
                serviceIds: form.serviceIds,
                preferredDate: form.preferredDate,
                preferredTime: form.preferredTime,
                notes: form.notes || undefined,
                inspoImageUrls: form.inspoImageUrls,
                smsConsent: form.smsConsent,
                // April promo fields
                isPromoBooking: !!promoDeal,
                promoPrice: promoDeal?.price ?? undefined,
                // Health intake (if applicable)
                ...(needsHealthIntake && {
                    healthIntake: {
                        skinTypes: form.skinTypes,
                        healthQ: form.healthQ,
                        medications: form.medications || undefined,
                        allergies: form.allergies,
                        allergyNotes: form.allergyNotes || undefined,
                        emergencyName: form.emergencyName || undefined,
                        emergencyPhone: form.emergencyPhone || undefined,
                        emergencyRelation: form.emergencyRelation || undefined,
                    }
                }),
            };
            if (session) {
                payload.guestPhone = form.phone;
            } else {
                payload.guestName = form.guestName;
                payload.guestEmail = form.guestEmail;
                payload.guestPhone = form.phone;
            }
            const res = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (res.ok) {
                if (session) {
                    router.push('/card?booked=1');
                } else {
                    setDone(true);
                    setTimeout(() => setShowPopup(true), 800);
                }
            }
        } finally { setLoading(false); }
    }

    const inp = { fontFamily: 'Poppins, sans-serif' };

    if (done && !showPopup) return (
        <div style={{ textAlign: 'center', padding: '60px 20px', maxWidth: '480px', margin: '0 auto' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(0,212,120,0.12)', border: '1px solid rgba(0,212,120,0.3)', marginBottom: '20px' }}>
                <CheckCircle size={30} color="#00D478" strokeWidth={1.75} />
            </div>
            <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#fff', fontSize: '26px', marginBottom: '12px' }}>Booking Received!</h2>
            <p style={{ fontFamily: 'Poppins, sans-serif', color: '#eee', fontSize: '15px', marginBottom: '32px', lineHeight: 1.7 }}>
                We'll reach out to your phone soon to discuss your look and finalize everything. Talk soon — Glitz & Glamour
            </p>
            <Link href="/" className="btn-primary">Back to Home</Link>
        </div>
    );

    return (
        <div style={{ maxWidth: '580px', margin: '0 auto', padding: '40px 20px 120px', position: 'relative', zIndex: 1 }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#fff', fontSize: 'clamp(22px, 5vw, 32px)', marginBottom: '8px' }}>Book Appointment</h1>
                <p style={{ fontFamily: 'Poppins, sans-serif', color: '#ccc', fontSize: '14px' }}>
                    We'll reach out to finalize everything before confirming.
                </p>
            </div>

            {/* Step indicator — dynamic based on whether health intake is needed */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '28px', justifyContent: 'center' }}>
                {Array.from({ length: totalSteps }).map((_, i) => {
                    // Map UI step to progress bar fill logic
                    // step 1=choose, 2=contact, 3=intake(if needed), 4=review
                    const filled = step > i + 1 || step === i + 1;
                    return (
                        <div key={i} style={{ height: '4px', flex: 1, maxWidth: '80px', borderRadius: '2px', background: filled ? '#FF2D78' : 'rgba(255,255,255,0.1)', transition: 'background 0.3s' }} />
                    );
                })}
            </div>

            <div className="glass" style={{ padding: '28px 24px', borderRadius: '24px' }}>

                {/* ─── Step 1: Service + Time ─── */}
                {step === 1 && (
                    <div>
                        <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, color: '#fff', fontSize: '17px', marginBottom: '20px' }}>1. Choose Service &amp; Time</h3>

                        {/* Services — multi-select */}
                        <div style={{ marginBottom: '16px' }}>
                            <label className="label">Services <span style={{ fontWeight: 400, color: '#888', fontSize: '12px' }}>(select one or more)</span></label>
                            <ServiceMultiSelect
                                services={services}
                                values={form.serviceIds}
                                onChange={ids => setForm(f => ({ ...f, serviceIds: ids }))}
                            />
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
                            <div style={{ flex: '1 1 200px' }}>
                                <label className="label">Preferred Date</label>
                                <input type="date" className="input" value={form.preferredDate}
                                    onChange={e => set('preferredDate', e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                    style={{ ...inp, colorScheme: 'dark' }} />
                            </div>
                            <div style={{ flex: '1 1 200px' }}>
                                <label className="label">Preferred Time</label>
                                <TimeDropdown
                                    times={TIMES}
                                    value={form.preferredTime}
                                    onChange={t => set('preferredTime', t)}
                                />
                            </div>
                        </div>

                        {/* ── April Promo Notice (Step 1) ── */}
                        {promoDeal && (
                            <div style={{
                                background: 'linear-gradient(135deg,rgba(255,45,120,0.1),rgba(255,45,120,0.05))',
                                border: '1px solid rgba(255,45,120,0.3)',
                                borderRadius: '14px', padding: '14px 18px',
                                marginBottom: '16px',
                            }}>
                                <p style={{ fontFamily: 'Poppins, sans-serif', color: '#FF2D78', fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>
                                    🌸 April Special Applied!
                                </p>
                                <p style={{ fontFamily: 'Poppins, sans-serif', color: '#ddd', fontSize: '13px', lineHeight: 1.5 }}>
                                    Your fixed price will be <strong style={{ color: '#FF2D78' }}>${promoDeal.price}</strong> if your booking is confirmed. No surprises.
                                </p>
                            </div>
                        )}

                        {/* Health intake notice */}
                        {form.serviceIds.length > 0 && needsHealthIntake && (
                            <div style={{
                                display: 'flex', alignItems: 'flex-start', gap: '10px',
                                background: 'rgba(255,45,120,0.06)', border: '1px solid rgba(255,45,120,0.2)',
                                borderRadius: '12px', padding: '12px 14px', marginBottom: '16px',
                            }}>
                                <AlertCircle size={16} color="#FF2D78" style={{ flexShrink: 0, marginTop: '1px' }} />
                                <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12.5px', color: '#ddd', lineHeight: 1.5 }}>
                                    Your selected service(s) require a brief <strong style={{ color: '#FF2D78' }}>Health Intake Form</strong> — this helps us serve you safely.
                                </p>
                            </div>
                        )}

                        <button className="btn-primary" style={{ width: '100%', opacity: (form.serviceIds.length > 0 && form.preferredDate && form.preferredTime) ? 1 : 0.45 }}
                            disabled={form.serviceIds.length === 0 || !form.preferredDate || !form.preferredTime}
                            onClick={() => setStep(2)}>
                            Continue →
                        </button>
                    </div>
                )}


                {/* ─── Step 2: Contact Details ─── */}
                {step === 2 && (
                    <div>
                        <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, color: '#fff', fontSize: '17px', marginBottom: '20px' }}>2. Your Details</h3>

                        {session ? (
                            /* Logged-in: show account info read-only, only ask for phone */
                            <>
                                <div style={{ background: 'rgba(255,45,120,0.06)', border: '1px solid rgba(255,45,120,0.15)', borderRadius: '14px', padding: '16px 18px', marginBottom: '20px' }}>
                                    <p style={{ fontFamily: 'Poppins, sans-serif', color: '#FF2D78', fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>
                                        Booking as {session.user?.name}
                                    </p>
                                    <p style={{ fontFamily: 'Poppins, sans-serif', color: '#ccc', fontSize: '13px' }}>{session.user?.email}</p>
                                </div>

                                {/* Phone — required even for logged-in users */}
                                <div style={{ marginBottom: '20px' }}>
                                    <label className="label">
                                        Phone Number <span style={{ color: '#FF2D78' }}>*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        className="input"
                                        placeholder="+1 (760) 000-0000"
                                        value={form.phone}
                                        onChange={e => { set('phone', e.target.value); setPhoneError(''); }}
                                        style={{ ...inp, borderColor: phoneError ? 'rgba(255,45,120,0.6)' : undefined }}
                                    />
                                    {phoneError && <p style={{ fontFamily: 'Poppins, sans-serif', color: '#FF2D78', fontSize: '12px', marginTop: '6px' }}>{phoneError}</p>}
                                    {!phoneError && !form.phone && (
                                        <p style={{ fontFamily: 'Poppins, sans-serif', color: '#bbb', fontSize: '12px', marginTop: '5px' }}>
                                            We'll text you to confirm your appointment
                                        </p>
                                    )}
                                    {form.phone && !phoneError && (
                                        <p style={{ fontFamily: 'Poppins, sans-serif', color: '#bbb', fontSize: '12px', marginTop: '5px' }}>
                                            This will be saved to your profile
                                        </p>
                                    )}
                                </div>
                            </>
                        ) : (
                            /* Guest: all fields required */
                            <>
                                <div style={{ marginBottom: '12px' }}>
                                    <label className="label">Full Name <span style={{ color: '#FF2D78' }}>*</span></label>
                                    <input type="text" className="input" placeholder="Your name" value={form.guestName}
                                        onChange={e => set('guestName', e.target.value)} style={inp} />
                                </div>
                                <div style={{ marginBottom: '12px' }}>
                                    <label className="label">Email <span style={{ color: '#FF2D78' }}>*</span></label>
                                    <input type="email" className="input" placeholder="your@email.com" value={form.guestEmail}
                                        onChange={e => set('guestEmail', e.target.value)} style={inp} />
                                </div>
                                <div style={{ marginBottom: '12px' }}>
                                    <label className="label">Phone Number <span style={{ color: '#FF2D78' }}>*</span></label>
                                    <input type="tel" className="input" placeholder="+1 (760) 000-0000" value={form.phone}
                                        onChange={e => { set('phone', e.target.value); setPhoneError(''); }}
                                        style={{ ...inp, borderColor: phoneError ? 'rgba(255,45,120,0.6)' : undefined }} />
                                    {phoneError && <p style={{ fontFamily: 'Poppins, sans-serif', color: '#FF2D78', fontSize: '12px', marginTop: '6px' }}>{phoneError}</p>}
                                    {!phoneError && (
                                        <p style={{ fontFamily: 'Poppins, sans-serif', color: '#bbb', fontSize: '12px', marginTop: '5px' }}>
                                            We'll text you to confirm your appointment
                                        </p>
                                    )}
                                </div>
                            </>
                        )}

                        <div style={{ marginBottom: '28px' }}>
                            <label className="label" style={{ marginBottom: '10px' }}>Tell us all about your vision (Optional)</label>

                            <div style={{ background: 'rgba(255,45,120,0.05)', border: '1px solid rgba(255,45,120,0.15)', borderRadius: '12px', padding: '14px 16px', marginBottom: '12px' }}>
                                <p style={{ fontFamily: 'Poppins, sans-serif', color: '#eee', fontSize: '13px', marginBottom: '10px', fontWeight: 500, lineHeight: 1.4 }}>
                                    To help us prepare for your perfect look, please share:
                                </p>
                                <ul style={{ fontFamily: 'Poppins, sans-serif', color: '#ccc', fontSize: '12.5px', margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px', lineHeight: 1.5 }}>
                                    <li><strong style={{ color: '#FF2D78', fontWeight: 600 }}>The Vision</strong> ✦ Your overall idea and inspiration.</li>
                                    <li><strong style={{ color: '#FF2D78', fontWeight: 600 }}>For Hair</strong> ✦ Your current length, hair history (past colors, chemical treatments), and any concerns.</li>
                                    <li><strong style={{ color: '#FF2D78', fontWeight: 600 }}>For Nails</strong> ✦ Desired shape, length, and any key details we should know.</li>
                                </ul>
                            </div>

                            <textarea className="input" placeholder="e.g. My hair is currently shoulder length and was dyed dark brown 6 months ago..." value={form.notes}
                                onChange={e => set('notes', e.target.value)} rows={4}
                                style={{ ...inp, resize: 'vertical', minHeight: '100px' }} />
                        </div>

                        <InspoUploader
                            urls={form.inspoImageUrls}
                            setUrls={(newUrls) => set('inspoImageUrls', newUrls)}
                        />

                        {/* Policy consent */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginTop: '20px' }}>
                            <input type="checkbox" id="policyConsent" checked={form.policyConsent} onChange={e => setForm(f => ({ ...f, policyConsent: e.target.checked }))} style={{ marginTop: '2px', accentColor: '#FF2D78', width: '16px', height: '16px', flexShrink: 0, cursor: 'pointer' }} />
                            <label htmlFor="policyConsent" style={{ fontFamily: 'Poppins, sans-serif', color: '#ccc', fontSize: '12px', lineHeight: 1.5, cursor: 'pointer' }}>
                                <span style={{ color: '#FF2D78' }}>*</span> By booking, I acknowledge and consent to the <Link href="/policy" style={{ color: '#FF2D78', textDecoration: 'none' }}>Studio Policies</Link>, <Link href="/waiver" style={{ color: '#FF2D78', textDecoration: 'none' }}>Liability Waiver</Link>, <Link href="/terms" style={{ color: '#FF2D78', textDecoration: 'none' }}>Terms &amp; Conditions</Link>, and <Link href="/privacy" style={{ color: '#FF2D78', textDecoration: 'none' }}>Privacy Policy</Link>.
                            </label>
                        </div>

                        {/* SMS consent */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginTop: '12px' }}>
                            <input type="checkbox" id="smsConsent" checked={form.smsConsent} onChange={e => setForm(f => ({ ...f, smsConsent: e.target.checked }))} style={{ marginTop: '2px', accentColor: '#FF2D78', width: '16px', height: '16px', flexShrink: 0, cursor: 'pointer' }} />
                            <label htmlFor="smsConsent" style={{ fontFamily: 'Poppins, sans-serif', color: '#ccc', fontSize: '12px', lineHeight: 1.5, cursor: 'pointer' }}>
                                By providing your phone number, you agree to receive SMS notifications from Glitz &amp; Glamour. Message frequency may vary. Standard Message and Data Rates may apply. Reply STOP to opt out. Reply HELP for help.
                            </label>
                        </div>

                        {/* Accuracy statement */}
                        <div style={{ marginTop: '16px', padding: '12px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                            <p style={{ fontFamily: 'Poppins, sans-serif', color: '#888', fontSize: '12px', lineHeight: 1.6, margin: 0 }}>
                                By continuing, you represent that the information you provided is true, accurate, and complete.
                            </p>
                        </div>

                        <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                            <button className="btn-outline" style={{ flex: 1 }} onClick={() => setStep(1)}>← Back</button>
                            <button className="btn-primary" style={{ flex: 2, opacity: (!form.policyConsent || (!session && (!form.guestName || !form.guestEmail))) ? 0.45 : 1 }}
                                disabled={!form.policyConsent || (!session && (!form.guestName || !form.guestEmail))}
                                onClick={goForwardFromContact}>
                                {needsHealthIntake ? 'Health Form →' : 'Review →'}
                            </button>
                        </div>
                    </div>
                )}

                {/* ─── Step 3: Health Intake (only for Facials / Lashes / Waxing) ─── */}
                {step === 3 && needsHealthIntake && (
                    <div>
                        <div style={{ marginBottom: '20px' }}>
                            <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, color: '#fff', fontSize: '17px', marginBottom: '6px' }}>
                                3. Health Intake Form
                            </h3>
                            <p style={{ fontFamily: 'Poppins, sans-serif', color: '#aaa', fontSize: '13px', lineHeight: 1.5 }}>
                                Required for {selectedServices.filter(s => HEALTH_INTAKE_CATEGORIES.includes(s.category)).map(s => s.name).join(', ')}. Your information is kept confidential.
                            </p>
                        </div>

                        {/* ── Accordion 1: Health & Skin ── */}
                        <IntakeSection num={1} title="Health & skin" open={intakeOpen.health} onToggle={() => setIntakeOpen(o => ({ ...o, health: !o.health }))}>
                            <div style={{ marginBottom: '16px' }}>
                                <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', fontWeight: 600, color: '#aaa', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Skin type / concerns</p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {['Sensitive', 'Oily', 'Dry', 'Acne-prone', 'Rosacea', 'Eczema / Psoriasis', 'Keloid scarring', 'None'].map(opt => (
                                        <Chip key={opt} label={opt} selected={form.skinTypes.includes(opt)}
                                            onToggle={() => {
                                                const cur = form.skinTypes;
                                                if (opt === 'None') { set('skinTypes', cur.includes('None') ? [] : ['None']); return; }
                                                const next = cur.includes(opt) ? cur.filter(x => x !== opt) : [...cur.filter(x => x !== 'None'), opt];
                                                set('skinTypes', next);
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>

                            {[
                                { key: 'pregnant', q: 'Pregnant or breastfeeding?' },
                                { key: 'accutane', q: 'Used Accutane / isotretinoin in the past 12 months?' },
                                { key: 'retinoids', q: 'Using retinoids, Retin-A, or exfoliating acids (AHA/BHA)?' },
                                { key: 'botox', q: 'Had Botox, fillers, or injections in the past 2 weeks?' },
                                { key: 'surgery', q: 'Had surgery or medical procedures in the past 6 months?' },
                                { key: 'infections', q: 'Any active skin infections, open wounds, or cold sores?' },
                                { key: 'autoimmune', q: 'Any autoimmune conditions, diabetes, or circulatory issues?' },
                                { key: 'hsv', q: 'History of cold sores (HSV)?' },
                                { key: 'pacemaker', q: 'Pacemaker or implanted medical device?' },
                            ].map(({ key, q }) => (
                                <YesNo key={key} question={q}
                                    value={(form.healthQ[key] as 'yes' | 'no' | null) ?? null}
                                    onChange={v => set('healthQ', { ...form.healthQ, [key]: v })}
                                />
                            ))}

                            <div style={{ marginTop: '16px' }}>
                                <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', fontWeight: 600, color: '#aaa', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Current medications <span style={{ textTransform: 'none', color: '#666', fontWeight: 400, fontSize: '12px', letterSpacing: 0 }}>(optional)</span>
                                </p>
                                <textarea
                                    className="input"
                                    placeholder="Any topical or oral medications, including supplements…"
                                    value={form.medications}
                                    onChange={e => set('medications', e.target.value)}
                                    rows={3}
                                    style={{ ...inp, resize: 'vertical', minHeight: '80px' }}
                                />
                            </div>

                            <button
                                type="button"
                                className="btn-primary"
                                style={{ width: '100%', marginTop: '16px', fontSize: '14px', padding: '12px' }}
                                onClick={() => setIntakeOpen(o => ({ ...o, health: false, allergies: true }))}
                            >
                                Next — Allergies →
                            </button>
                        </IntakeSection>

                        {/* ── Accordion 2: Allergies & Past Reactions ── */}
                        <IntakeSection num={2} title="Allergies & past reactions" open={intakeOpen.allergies} onToggle={() => setIntakeOpen(o => ({ ...o, allergies: !o.allergies }))}>
                            <div style={{ marginBottom: '16px' }}>
                                <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', fontWeight: 600, color: '#aaa', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Ever reacted to any of these?</p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {['Latex / gloves', 'Acrylic / gel', 'Lash adhesive', 'Wax', 'Hair dye / bleach', 'Skincare products', 'Fragrance', 'Numbing creams', 'None known'].map(opt => (
                                        <Chip key={opt} label={opt} selected={form.allergies.includes(opt)}
                                            onToggle={() => {
                                                const cur = form.allergies;
                                                if (opt === 'None known') { set('allergies', cur.includes('None known') ? [] : ['None known']); return; }
                                                const next = cur.includes(opt) ? cur.filter(x => x !== opt) : [...cur.filter(x => x !== 'None known'), opt];
                                                set('allergies', next);
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', fontWeight: 600, color: '#aaa', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Describe any reactions or other allergies <span style={{ textTransform: 'none', color: '#666', fontWeight: 400, fontSize: '12px', letterSpacing: 0 }}>(optional)</span>
                                </p>
                                <textarea
                                    className="input"
                                    placeholder="What happened? What caused it?"
                                    value={form.allergyNotes}
                                    onChange={e => set('allergyNotes', e.target.value)}
                                    rows={3}
                                    style={{ ...inp, resize: 'vertical', minHeight: '80px' }}
                                />
                            </div>

                            <button
                                type="button"
                                className="btn-primary"
                                style={{ width: '100%', fontSize: '14px', padding: '12px' }}
                                onClick={() => setIntakeOpen(o => ({ ...o, allergies: false, consent: true }))}
                            >
                                Next — Consent →
                            </button>
                        </IntakeSection>

                        {/* ── Accordion 3: Emergency Contact & Consent ── */}
                        <IntakeSection num={3} title="Consent" open={intakeOpen.consent} onToggle={() => setIntakeOpen(o => ({ ...o, consent: !o.consent }))}>
                            {/* Emergency Contact */}
                            <div style={{ marginBottom: '20px' }}>
                                <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', fontWeight: 600, color: '#aaa', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Emergency Contact <span style={{ textTransform: 'none', color: '#666', fontWeight: 400, fontSize: '12px', letterSpacing: 0 }}>(optional)</span>
                                </p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <input
                                        type="text" className="input"
                                        placeholder="Contact name"
                                        value={form.emergencyName}
                                        onChange={e => set('emergencyName', e.target.value)}
                                        style={inp}
                                    />
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <input
                                            type="tel" className="input"
                                            placeholder="Phone number"
                                            value={form.emergencyPhone}
                                            onChange={e => set('emergencyPhone', e.target.value)}
                                            style={{ ...inp, flex: 1 }}
                                        />
                                        <input
                                            type="text" className="input"
                                            placeholder="Relationship"
                                            value={form.emergencyRelation}
                                            onChange={e => set('emergencyRelation', e.target.value)}
                                            style={{ ...inp, flex: 1 }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Consent checkboxes */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                                {[
                                    'All information I provided is accurate. I agree to update it at every visit.',
                                    'I understand beauty services carry risks (reactions, variation in results) and release Glitz & Glamour Studio from liability for reactions caused by undisclosed conditions.',
                                    'I agree to the Studio Policies, Liability Waiver, Terms & Conditions, Image Usage Policy, and Privacy Policy.',
                                ].map((text, i) => (
                                    <label key={i}
                                        htmlFor={`intake-consent-${i}`}
                                        style={{
                                            display: 'flex', alignItems: 'flex-start', gap: '12px',
                                            padding: '14px 16px', borderRadius: '12px', cursor: 'pointer',
                                            background: intakeConsentChecked[i] ? 'rgba(255,45,120,0.05)' : 'rgba(255,255,255,0.03)',
                                            border: `1px solid ${intakeConsentChecked[i] ? 'rgba(255,45,120,0.25)' : 'rgba(255,255,255,0.07)'}`,
                                            transition: 'all 0.15s',
                                        }}
                                    >
                                        <div style={{ position: 'relative', flexShrink: 0, marginTop: '1px' }}>
                                            <input
                                                type="checkbox"
                                                id={`intake-consent-${i}`}
                                                checked={intakeConsentChecked[i]}
                                                onChange={e => {
                                                    const next = [...intakeConsentChecked];
                                                    next[i] = e.target.checked;
                                                    setIntakeConsentChecked(next);
                                                }}
                                                style={{ width: '18px', height: '18px', accentColor: '#FF2D78', cursor: 'pointer' }}
                                            />
                                        </div>
                                        <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', color: '#ccc', lineHeight: 1.55 }}>{text}</span>
                                    </label>
                                ))}
                            </div>

                            <button
                                type="button"
                                className="btn-primary"
                                style={{ width: '100%', fontSize: '14px', padding: '12px', opacity: intakeComplete ? 1 : 0.45 }}
                                disabled={!intakeComplete}
                                onClick={() => setStep(4)}
                            >
                                Review Booking →
                            </button>
                        </IntakeSection>

                        <div style={{ marginTop: '16px' }}>
                            <button className="btn-outline" style={{ width: '100%' }} onClick={() => setStep(2)}>← Back to Details</button>
                        </div>
                    </div>
                )}

                {/* ─── Step 4 (or 3 if no intake): Confirm ─── */}
                {step === 4 && (
                    <div>
                        <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, color: '#fff', fontSize: '17px', marginBottom: '20px' }}>
                            {needsHealthIntake ? '4' : '3'}. Confirm Booking
                        </h3>
                        {[
                            { label: 'Service(s)', val: selectedServices.map(s => s.name).join(', ') || '—' },
                            { label: 'Date', val: form.preferredDate },
                            { label: 'Time', val: form.preferredTime },
                            { label: 'Name', val: session ? session.user?.name : form.guestName },
                            { label: 'Email', val: session ? session.user?.email : form.guestEmail },
                            { label: 'Phone', val: form.phone },
                            { label: 'Notes', val: form.notes || '—' },
                            ...(needsHealthIntake ? [
                                { label: 'Health Form', val: '✓ Completed' },
                            ] : []),
                        ].map(({ label, val }) => val ? (
                            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <span style={{ fontFamily: 'Poppins, sans-serif', color: '#bbb', fontSize: '13px', flexShrink: 0 }}>{label}</span>
                                <span style={{ fontFamily: 'Poppins, sans-serif', color: label === 'Phone' ? '#FF2D78' : label === 'Health Form' ? '#00D478' : '#fff', fontSize: '13px', fontWeight: 500, textAlign: 'right' }}>{val as string}</span>
                            </div>
                        ) : null)}
                        <p style={{ fontFamily: 'Poppins, sans-serif', color: '#aaa', fontSize: '12px', marginTop: '16px', lineHeight: 1.6 }}>
                            By submitting, you agree to be contacted to finalize your appointment. Price is subject to change after consultation.
                        </p>

                        {/* ── April Promo Confirmation Notice ── */}
                        {promoDeal && (
                            <div style={{
                                background: 'linear-gradient(135deg,rgba(255,45,120,0.1),rgba(255,45,120,0.05))',
                                border: '1px solid rgba(255,45,120,0.3)',
                                borderRadius: '14px', padding: '16px 18px',
                                marginTop: '14px',
                                display: 'flex', alignItems: 'center', gap: '12px',
                            }}>
                                <div style={{ fontSize: '24px', flexShrink: 0 }}>🌸</div>
                                <div>
                                    <p style={{ fontFamily: 'Poppins, sans-serif', color: '#FF2D78', fontWeight: 700, fontSize: '14px', marginBottom: '3px' }}>
                                        April Special — Fixed Price
                                    </p>
                                    <p style={{ fontFamily: 'Poppins, sans-serif', color: '#ddd', fontSize: '13px', lineHeight: 1.5 }}>
                                        If confirmed, your appointment will be <strong style={{ color: '#fff' }}>${promoDeal.price} flat</strong>. JoJany will reach out to confirm!
                                    </p>
                                </div>
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                            <button className="btn-outline" style={{ flex: 1 }} onClick={() => setStep(needsHealthIntake ? 3 : 2)}>← Edit</button>
                            <button className="btn-primary btn-pulse" style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                onClick={submit} disabled={loading}>
                                {loading ? 'Sending...' : <><Sparkles size={15} /> Confirm Booking</>}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Sign-up popup after guest booking */}
            {showPopup && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div className="glass" style={{ maxWidth: '420px', width: '100%', padding: '36px 28px', textAlign: 'center', borderColor: 'rgba(255,45,120,0.35)' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(255,45,120,0.1)', border: '1px solid rgba(255,45,120,0.2)', marginBottom: '16px' }}>
                            <Sparkles size={22} color="#FF2D78" strokeWidth={1.75} />
                        </div>
                        <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#fff', fontSize: '20px', marginBottom: '8px' }}>Want to track your rewards?</h3>
                        <p style={{ fontFamily: 'Poppins, sans-serif', color: '#ddd', fontSize: '14px', marginBottom: '24px', lineHeight: 1.6 }}>
                            Create a free account and earn a stamp every visit. Your first stamp is waiting!
                        </p>
                        <button className="btn-primary" style={{ width: '100%', marginBottom: '10px', fontSize: '15px', padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                            onClick={() => signIn('google', { callbackUrl: '/card' })}>
                            <svg width="17" height="17" viewBox="0 0 18 18" fill="none"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" /><path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" /><path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" /><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" /></svg>
                            Continue with Google
                        </button>
                        <button onClick={() => { setShowPopup(false); router.push('/'); }}
                            style={{ fontFamily: 'Poppins, sans-serif', background: 'none', border: 'none', color: '#aaa', fontSize: '13px', cursor: 'pointer', padding: '8px' }}>
                            Maybe Later
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function BookPage() {
    return (
        <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ color: '#FF2D78', fontFamily: 'Poppins, sans-serif' }}>Loading...</span></div>}>
            <BookingForm />
        </Suspense>
    );
}
