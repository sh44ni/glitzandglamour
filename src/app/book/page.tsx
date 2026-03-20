'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
import Link from 'next/link';
import { CheckCircle, Sparkles, ChevronDown, Check, Search, UploadCloud, X } from 'lucide-react';

type Service = { id: string; name: string; category: string; priceLabel: string };

const TIMES = ['9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM'];


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

    const [form, setForm] = useState({
        serviceIds: preSelectedService ? [preSelectedService] : [] as string[],
        preferredDate: '',
        preferredTime: '',
        guestName: '',
        guestEmail: '',
        phone: '',
        notes: '',
        inspoImageUrls: [] as string[],
        smsConsent: false
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

    const set = (k: keyof typeof form, v: string | string[]) => setForm(f => ({ ...f, [k]: v }));
    const selectedServices = services.filter(s => form.serviceIds.includes(s.id));

    function validatePhone(phone: string) {
        const cleaned = phone.replace(/\s/g, '');
        if (!cleaned) return 'Phone number is required';
        if (cleaned.length < 7) return 'Enter a valid phone number';
        return '';
    }

    function goToReview() {
        const err = validatePhone(form.phone);
        if (err) { setPhoneError(err); return; }
        setPhoneError('');
        if (!form.smsConsent) return;
        if (session) {
            fetch('/api/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: form.phone }),
            }).catch(() => { });
        }
        setStep(3);
    }

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

            {/* Step indicator */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '28px', justifyContent: 'center' }}>
                {[1, 2, 3].map(s => (
                    <div key={s} style={{ height: '4px', flex: 1, maxWidth: '80px', borderRadius: '2px', background: s <= step ? '#FF2D78' : 'rgba(255,255,255,0.1)', transition: 'background 0.3s' }} />
                ))}
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
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginTop: '16px' }}>
                                        <input type="checkbox" id="smsConsentLogged" checked={form.smsConsent} onChange={e => setForm(f => ({ ...f, smsConsent: e.target.checked }))} style={{ marginTop: '2px', accentColor: '#FF2D78', width: '16px', height: '16px', flexShrink: 0, cursor: 'pointer' }} />
                                        <label htmlFor="smsConsentLogged" style={{ fontFamily: 'Poppins, sans-serif', color: '#ccc', fontSize: '12px', lineHeight: 1.5, cursor: 'pointer' }}>
                                            <span style={{ color: '#FF2D78' }}>*</span> I agree to the <Link href="/privacy" style={{ color: '#FF2D78', textDecoration: 'none' }}>Privacy Policy</Link> and to receive appointment-related text messages from Glitz & Glamour Studio at this phone number. Message frequency varies. Msg & data rates may apply. Reply STOP to opt out, HELP for help.
                                        </label>
                                    </div>
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
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginTop: '16px' }}>
                                        <input type="checkbox" id="smsConsentGuest" checked={form.smsConsent} onChange={e => setForm(f => ({ ...f, smsConsent: e.target.checked }))} style={{ marginTop: '2px', accentColor: '#FF2D78', width: '16px', height: '16px', flexShrink: 0, cursor: 'pointer' }} />
                                        <label htmlFor="smsConsentGuest" style={{ fontFamily: 'Poppins, sans-serif', color: '#ccc', fontSize: '12px', lineHeight: 1.5, cursor: 'pointer' }}>
                                            <span style={{ color: '#FF2D78' }}>*</span> I agree to the <Link href="/privacy" style={{ color: '#FF2D78', textDecoration: 'none' }}>Privacy Policy</Link> and to receive appointment-related text messages from Glitz & Glamour Studio at this phone number. Message frequency varies. Msg & data rates may apply. Reply STOP to opt out, HELP for help.
                                        </label>
                                    </div>
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

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button className="btn-outline" style={{ flex: 1 }} onClick={() => setStep(1)}>← Back</button>
                            <button className="btn-primary" style={{ flex: 2, opacity: (!form.smsConsent || (!session && (!form.guestName || !form.guestEmail))) ? 0.45 : 1 }}
                                disabled={!form.smsConsent || (!session && (!form.guestName || !form.guestEmail))}
                                onClick={goToReview}>
                                Review →
                            </button>
                        </div>
                    </div>
                )}

                {/* ─── Step 3: Confirm ─── */}
                {step === 3 && (
                    <div>
                        <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, color: '#fff', fontSize: '17px', marginBottom: '20px' }}>3. Confirm Booking</h3>
                        {[
                            { label: 'Service(s)', val: selectedServices.map(s => s.name).join(', ') || '—' },
                            { label: 'Date', val: form.preferredDate },
                            { label: 'Time', val: form.preferredTime },
                            { label: 'Name', val: session ? session.user?.name : form.guestName },
                            { label: 'Email', val: session ? session.user?.email : form.guestEmail },
                            { label: 'Phone', val: form.phone },
                            { label: 'Notes', val: form.notes || '—' },
                        ].map(({ label, val }) => val ? (
                            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <span style={{ fontFamily: 'Poppins, sans-serif', color: '#bbb', fontSize: '13px', flexShrink: 0 }}>{label}</span>
                                <span style={{ fontFamily: 'Poppins, sans-serif', color: label === 'Phone' ? '#FF2D78' : '#fff', fontSize: '13px', fontWeight: 500, textAlign: 'right' }}>{val as string}</span>
                            </div>
                        ) : null)}
                        <p style={{ fontFamily: 'Poppins, sans-serif', color: '#aaa', fontSize: '12px', marginTop: '16px', lineHeight: 1.6 }}>
                            By submitting, you agree to be contacted to finalize your appointment. Price is subject to change after consultation.
                        </p>
                        <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                            <button className="btn-outline" style={{ flex: 1 }} onClick={() => setStep(2)}>← Edit</button>
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
