'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { Plus, Trash2, Upload, X, Pencil, Check } from 'lucide-react';

type Service = {
    id: string; name: string; category: string; priceFrom: number; priceLabel: string;
    description?: string | null; imageUrl?: string | null; active: boolean;
    slug?: string | null;
    ogImageUrl?: string | null;
    seoTitle?: string | null;
    seoDescription?: string | null;
    seoKeywords?: string | null;
    longDescription?: string | null;
    benefits?: string | null;
    faqs?: { q: string; a: string }[] | null;
    durationMins?: number | null;
    startingAtPrice?: number | null;
};

const CATEGORIES = [
    { key: 'nails', label: 'Nail Services' },
    { key: 'pedicures', label: 'Pedicures' },
    { key: 'haircolor', label: 'Hair Color' },
    { key: 'haircuts', label: 'Haircuts' },
    { key: 'waxing', label: 'Waxing' },
    { key: 'facials', label: 'Facials' },
];

const EMPTY_FORM = {
    name: '',
    slug: '',
    category: 'nails',
    priceFrom: '',
    priceLabel: '',
    description: '',
    longDescription: '',
    benefits: '',
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    ogImageUrl: '',
    durationMins: '',
    startingAtPrice: '',
    imageUrl: '',
    faqs: [{ q: '', a: '' }],
};

function slugify(input: string) {
    return input
        .toLowerCase()
        .trim()
        .replace(/&/g, 'and')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

export default function AdminManagePage() {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [form, setForm] = useState<typeof EMPTY_FORM>(EMPTY_FORM);
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [activeCategory, setActiveCategory] = useState<string>('nails');
    const fileInput = useRef<HTMLInputElement>(null);

    const fetchServices = () => {
        fetch('/api/admin/services').then(r => r.json()).then(d => {
            setServices(d.services || []); setLoading(false);
        });
    };

    useEffect(() => { fetchServices(); }, []);

    async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const fd = new FormData();
            fd.append('file', file);
            const res = await fetch('/api/upload', { method: 'POST', body: fd });
            if (!res.ok) throw new Error('Upload failed');
            const { url } = await res.json();
            setForm((f) => ({ ...f, imageUrl: url }));
        } catch {
            alert('Image upload failed. Try again.');
        } finally {
            setUploading(false);
        }
    }

    async function handleSave() {
        if (!form.name || !form.priceLabel) return alert('Name and price label are required');
        const slug = String(form.slug || '').trim() || slugify(String(form.name || ''));
        if (!slug) return alert('Slug is required');
        setSaving(true);
        try {
            const body = {
                ...form,
                priceFrom: Number(form.priceFrom) || 0,
                slug,
                durationMins: form.durationMins ? Number(form.durationMins) : null,
                startingAtPrice: form.startingAtPrice ? Number(form.startingAtPrice) : null,
                faqs: Array.isArray(form.faqs)
                    ? form.faqs.filter((x: any) => x?.q?.trim() && x?.a?.trim())
                    : [],
                ...(editId ? { id: editId } : {}),
            };
            await fetch('/api/admin/services', {
                method: editId ? 'PATCH' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            fetchServices();
            setShowForm(false);
            setEditId(null);
            setForm(EMPTY_FORM);
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm('Delete this service?')) return;
        await fetch('/api/admin/services', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }),
        });
        fetchServices();
    }

    function startEdit(s: Service) {
        setForm({
            ...EMPTY_FORM,
            name: s.name,
            slug: s.slug || slugify(s.name),
            category: s.category,
            priceFrom: String(s.priceFrom),
            priceLabel: s.priceLabel,
            description: s.description || '',
            longDescription: s.longDescription || '',
            benefits: s.benefits || '',
            seoTitle: s.seoTitle || '',
            seoDescription: s.seoDescription || '',
            seoKeywords: s.seoKeywords || '',
            ogImageUrl: s.ogImageUrl || '',
            durationMins: s.durationMins ? String(s.durationMins) : '',
            startingAtPrice: s.startingAtPrice ? String(s.startingAtPrice) : '',
            imageUrl: s.imageUrl || '',
            faqs: (s.faqs && s.faqs.length ? s.faqs : [{ q: '', a: '' }]),
        });
        setEditId(s.id);
        setShowForm(true);
    }

    const grouped = CATEGORIES.reduce<Record<string, Service[]>>((acc, cat) => {
        acc[cat.key] = services.filter(s => s.category === cat.key);
        return acc;
    }, {});

    return (
        <div style={{ maxWidth: '860px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#fff', fontSize: '22px', marginBottom: '2px' }}>Manage Services</h1>
                    <p style={{ fontFamily: 'Poppins, sans-serif', color: '#444', fontSize: '13px' }}>{services.length} services total</p>
                </div>
                <button className="btn-primary" style={{ fontSize: '13px', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '6px' }}
                    onClick={() => { setShowForm(true); setEditId(null); setForm(EMPTY_FORM); }}>
                    <Plus size={16} /> Add Service
                </button>
            </div>

            {/* Add/Edit Form */}
            {showForm && (
                <div style={{ background: 'rgba(255,45,120,0.04)', border: '1px solid rgba(255,45,120,0.2)', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, color: '#fff', fontSize: '15px' }}>{editId ? 'Edit Service' : 'New Service'}</h2>
                        <button onClick={() => { setShowForm(false); setEditId(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555' }}>
                            <X size={18} />
                        </button>
                    </div>

                    <div style={{ display: 'grid', gap: '12px' }}>
                        {/* Image Upload */}
                        <div>
                            <label className="label">Service Image</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                                {form.imageUrl && (
                                    <div style={{ width: '80px', height: '80px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
                                        <Image src={form.imageUrl} alt="Preview" fill style={{ objectFit: 'cover' }} />
                                    </div>
                                )}
                                <button type="button"
                                    onClick={() => fileInput.current?.click()}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px',
                                        background: 'rgba(255,255,255,0.06)', border: '1px dashed rgba(255,255,255,0.15)',
                                        borderRadius: '10px', cursor: 'pointer', color: '#888',
                                        fontFamily: 'Poppins, sans-serif', fontSize: '13px', transition: 'all 0.2s',
                                    }}>
                                    <Upload size={15} /> {uploading ? 'Uploading...' : form.imageUrl ? 'Change Image' : 'Upload Image'}
                                </button>
                                <input ref={fileInput} type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                                {form.imageUrl && (
                                    <button type="button" onClick={() => setForm(f => ({ ...f, imageUrl: '' }))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555' }}>
                                        <X size={16} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Grid fields */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                            <div>
                                <label className="label">Service Name *</label>
                                <input className="input" value={form.name} onChange={e => setForm((f) => ({ ...f, name: e.target.value, slug: f.slug ? f.slug : slugify(e.target.value) }))} placeholder="e.g. Acrylic Full Set" style={{ fontFamily: 'Poppins, sans-serif' }} />
                            </div>
                            <div>
                                <label className="label">Slug *</label>
                                <input className="input" value={form.slug} onChange={e => setForm((f) => ({ ...f, slug: slugify(e.target.value) }))} placeholder="e.g. acrylic-full-set" style={{ fontFamily: 'Poppins, sans-serif' }} />
                                <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: '#444', marginTop: '6px' }}>
                                    URL: <span style={{ color: '#888' }}>/services/{form.slug || slugify(form.name || '') || 'your-slug'}</span>
                                </p>
                            </div>
                            <div>
                                <label className="label">Category *</label>
                                <select className="input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={{ fontFamily: 'Poppins, sans-serif' }}>
                                    {CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="label">Price From ($)</label>
                                <input className="input" type="number" value={form.priceFrom} onChange={e => setForm(f => ({ ...f, priceFrom: e.target.value }))} placeholder="65" style={{ fontFamily: 'Poppins, sans-serif' }} />
                            </div>
                            <div>
                                <label className="label">Price Label *</label>
                                <input className="input" value={form.priceLabel} onChange={e => setForm(f => ({ ...f, priceLabel: e.target.value }))} placeholder="From $65" style={{ fontFamily: 'Poppins, sans-serif' }} />
                            </div>
                            <div>
                                <label className="label">Duration (mins)</label>
                                <input className="input" type="number" value={form.durationMins} onChange={e => setForm((f) => ({ ...f, durationMins: e.target.value }))} placeholder="60" style={{ fontFamily: 'Poppins, sans-serif' }} />
                            </div>
                            <div>
                                <label className="label">Starting At Price ($)</label>
                                <input className="input" type="number" value={form.startingAtPrice} onChange={e => setForm((f) => ({ ...f, startingAtPrice: e.target.value }))} placeholder="65" style={{ fontFamily: 'Poppins, sans-serif' }} />
                            </div>
                        </div>

                        <div>
                            <label className="label">Description</label>
                            <textarea className="input" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Short description..." rows={2} style={{ resize: 'vertical', fontFamily: 'Poppins, sans-serif' }} />
                        </div>

                        <div style={{ marginTop: '4px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '16px' }}>
                            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', fontWeight: 800, color: '#fff', marginBottom: '12px' }}>SEO</p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label className="label">SEO Title</label>
                                    <input className="input" value={form.seoTitle} onChange={e => setForm((f) => ({ ...f, seoTitle: e.target.value }))} placeholder={`${form.name || 'Service'} | Glitz & Glamour Studio`} style={{ fontFamily: 'Poppins, sans-serif' }} />
                                </div>
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label className="label">SEO Description</label>
                                    <textarea className="input" value={form.seoDescription} onChange={e => setForm((f) => ({ ...f, seoDescription: e.target.value }))} placeholder="Write a compelling meta description (150–160 chars)..." rows={2} style={{ resize: 'vertical', fontFamily: 'Poppins, sans-serif' }} />
                                </div>
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label className="label">SEO Keywords</label>
                                    <input className="input" value={form.seoKeywords} onChange={e => setForm((f) => ({ ...f, seoKeywords: e.target.value }))} placeholder="comma, separated, keywords" style={{ fontFamily: 'Poppins, sans-serif' }} />
                                </div>
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label className="label">OG Image URL</label>
                                    <input className="input" value={form.ogImageUrl} onChange={e => setForm((f) => ({ ...f, ogImageUrl: e.target.value }))} placeholder="https://..." style={{ fontFamily: 'Poppins, sans-serif' }} />
                                    <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: '#444', marginTop: '6px' }}>
                                        Leave blank to use the service image.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '16px' }}>
                            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', fontWeight: 800, color: '#fff', marginBottom: '12px' }}>Long content</p>
                            <div style={{ display: 'grid', gap: '12px' }}>
                                <div>
                                    <label className="label">Long Description (Markdown)</label>
                                    <textarea className="input" value={form.longDescription} onChange={e => setForm((f) => ({ ...f, longDescription: e.target.value }))} placeholder="Write a long, SEO-friendly description (you can use markdown)..." rows={6} style={{ resize: 'vertical', fontFamily: 'Poppins, sans-serif' }} />
                                </div>
                                <div>
                                    <label className="label">Benefits / What's included (Markdown)</label>
                                    <textarea className="input" value={form.benefits} onChange={e => setForm((f) => ({ ...f, benefits: e.target.value }))} placeholder="- Benefit 1\n- Benefit 2\n- Benefit 3" rows={4} style={{ resize: 'vertical', fontFamily: 'Poppins, sans-serif' }} />
                                </div>
                            </div>
                        </div>

                        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '16px' }}>
                            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', fontWeight: 800, color: '#fff', marginBottom: '12px' }}>FAQs</p>
                            <div style={{ display: 'grid', gap: '10px' }}>
                                {(form.faqs || []).map((fq: any, idx: number) => (
                                    <div key={idx} style={{ padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.25)' }}>
                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                                            <p style={{ margin: 0, color: '#666', fontSize: '12px', fontWeight: 700 }}>FAQ #{idx + 1}</p>
                                            <button
                                                type="button"
                                                onClick={() => setForm((f) => ({ ...f, faqs: (f.faqs || []).filter((_: any, i: number) => i !== idx) }))}
                                                style={{ background: 'rgba(255,45,120,0.06)', border: '1px solid rgba(255,45,120,0.15)', color: '#FF2D78', borderRadius: '10px', padding: '6px 10px', cursor: 'pointer' }}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                        <label className="label">Question</label>
                                        <input className="input" value={fq.q} onChange={e => setForm((f) => ({ ...f, faqs: (f.faqs || []).map((x: any, i: number) => i === idx ? { ...x, q: e.target.value } : x) }))} placeholder="e.g. How long does it last?" style={{ fontFamily: 'Poppins, sans-serif' }} />
                                        <div style={{ height: 10 }} />
                                        <label className="label">Answer</label>
                                        <textarea className="input" value={fq.a} onChange={e => setForm((f) => ({ ...f, faqs: (f.faqs || []).map((x: any, i: number) => i === idx ? { ...x, a: e.target.value } : x) }))} placeholder="Answer..." rows={3} style={{ resize: 'vertical', fontFamily: 'Poppins, sans-serif' }} />
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => setForm((f) => ({ ...f, faqs: [...(f.faqs || []), { q: '', a: '' }] }))}
                                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#bbb', borderRadius: '12px', padding: '10px 12px', cursor: 'pointer', fontWeight: 700 }}
                                >
                                    + Add FAQ
                                </button>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button className="btn-outline" style={{ fontSize: '13px', padding: '9px 18px' }} onClick={() => { setShowForm(false); setEditId(null); }}>Cancel</button>
                            <button className="btn-primary" style={{ fontSize: '13px', padding: '9px 20px', display: 'flex', alignItems: 'center', gap: '6px' }}
                                disabled={saving || uploading} onClick={handleSave}>
                                <Check size={14} /> {saving ? 'Saving...' : editId ? 'Save Changes' : 'Add Service'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Category tabs */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '20px' }}>
                {CATEGORIES.map(cat => (
                    <button key={cat.key} onClick={() => setActiveCategory(cat.key)}
                        style={{
                            fontFamily: 'Poppins, sans-serif', fontSize: '12px', fontWeight: 500,
                            padding: '6px 14px', borderRadius: '50px', cursor: 'pointer', transition: 'all 0.2s', border: 'none',
                            background: activeCategory === cat.key ? '#FF2D78' : 'rgba(255,255,255,0.05)',
                            color: activeCategory === cat.key ? '#fff' : '#555',
                        }}>
                        {cat.label}
                        {grouped[cat.key]?.length > 0 && (
                            <span style={{ marginLeft: '6px', fontSize: '11px', opacity: 0.7 }}>({grouped[cat.key].length})</span>
                        )}
                    </button>
                ))}
            </div>

            {/* Services list */}
            <div style={{ display: 'grid', gap: '8px' }}>
                {loading ? (
                    Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton" style={{ height: '64px', borderRadius: '12px' }} />)
                ) : (grouped[activeCategory] || []).length === 0 ? (
                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '32px', textAlign: 'center' }}>
                        <p style={{ fontFamily: 'Poppins, sans-serif', color: '#444', fontSize: '13px' }}>No services in this category yet.</p>
                    </div>
                ) : (
                    (grouped[activeCategory] || []).map(s => (
                        <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                            {s.imageUrl && (
                                <div style={{ width: '44px', height: '44px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
                                    <Image src={s.imageUrl} alt={s.name} fill style={{ objectFit: 'cover' }} />
                                </div>
                            )}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 500, color: '#e0e0e0', fontSize: '14px' }}>{s.name}</p>
                                <p style={{ fontFamily: 'Poppins, sans-serif', color: '#FF2D78', fontSize: '12px', fontWeight: 600 }}>{s.priceLabel}</p>
                            </div>
                            <div style={{ display: 'flex', gap: '6px' }}>
                                <button onClick={() => startEdit(s)} style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                                    <Pencil size={13} color="#888" />
                                </button>
                                <button onClick={() => handleDelete(s.id)} style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,45,120,0.06)', border: '1px solid rgba(255,45,120,0.15)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                                    <Trash2 size={13} color="#FF2D78" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
