'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Plus, Trash2, Save, UploadCloud, GripVertical, Eye, EyeOff } from 'lucide-react';
import styles from './contracts.module.css';

type Category = { id: string; tag: string; name: string; slug: string | null; description: string; longDescription: string | null; benefits: string | null; imageUrl: string | null; pills: string; wide: boolean; gradient: string; displayOrder: number; isActive: boolean };
type Svc = { id: string; icon: string; title: string; description: string; displayOrder: number; isActive: boolean };
type Hero = { id: string; eyebrow: string; headline: string; subtext: string; imageUrl: string | null; isActive: boolean } | null;
type HeroImg = { id: string; url: string; order: number };

const inp: React.CSSProperties = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px 14px', color: '#fff', fontFamily: 'Poppins, sans-serif', fontSize: '13px', width: '100%', boxSizing: 'border-box' as const };
const lbl: React.CSSProperties = { display: 'block', fontSize: '11px', color: '#888', marginBottom: '4px', fontWeight: 600 };
const card: React.CSSProperties = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '20px', marginBottom: '14px' };

export default function SpecialEventPageContent() {
    const [hero, setHero] = useState<Hero>(null);
    const [heroImgs, setHeroImgs] = useState<HeroImg[]>([]);
    const [cats, setCats] = useState<Category[]>([]);
    const [svcs, setSvcs] = useState<Svc[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState('');
    const [uploading, setUploading] = useState('');
    const fileRef = useRef<HTMLInputElement>(null);
    const [uploadTarget, setUploadTarget] = useState<{ type: string; id?: string }>({ type: '' });

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const r = await fetch('/api/admin/special-events-content');
            if (r.ok) {
                const d = await r.json();
                setHero(d.hero);
                setHeroImgs(d.heroImages || []);
                setCats(d.categories || []);
                setSvcs(d.services || []);
            }
        } finally { setLoading(false); }
    }, []);

    useEffect(() => { load(); }, [load]);

    async function upload(file: File): Promise<string | null> {
        const fd = new FormData(); fd.append('file', file);
        const r = await fetch('/api/upload', { method: 'POST', body: fd });
        if (!r.ok) return null;
        return (await r.json()).url;
    }

    function triggerUpload(type: string, id?: string) {
        setUploadTarget({ type, id });
        fileRef.current?.click();
    }

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        const { type, id } = uploadTarget;
        setUploading(id || type);
        try {
            const url = await upload(file);
            if (!url) return alert('Upload failed');
            if (type === 'heroSlider') {
                await api('POST', { type: 'heroImage', url });
            } else if (type === 'category' && id) {
                await api('PATCH', { type: 'category', id, imageUrl: url });
            }
            await load();
        } finally { setUploading(''); if (fileRef.current) fileRef.current.value = ''; }
    }

    async function api(method: string, body: any) {
        return fetch('/api/admin/special-events-content', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    }

    async function deleteHeroImg(id: string) {
        if (!confirm('Remove this slider image?')) return;
        await fetch(`/api/admin/special-events-content?type=heroImage&id=${id}`, { method: 'DELETE' });
        await load();
    }

    async function saveHero() {
        if (!hero) return;
        setSaving('hero');
        await api('POST', { type: 'hero', eyebrow: hero.eyebrow, headline: hero.headline, subtext: hero.subtext });
        setSaving('');
    }

    async function addCategory() {
        setSaving('new-cat');
        await api('POST', { type: 'category', tag: 'New', name: 'New Event', description: 'Description here', pills: '', wide: false, gradient: 'linear-gradient(135deg, #2d0f1e, #1A0A10)' });
        await load(); setSaving('');
    }
    async function saveCategory(c: Category) {
        setSaving(c.id);
        await api('PATCH', { type: 'category', id: c.id, tag: c.tag, name: c.name, slug: c.slug, description: c.description, longDescription: c.longDescription, benefits: c.benefits, pills: c.pills, wide: c.wide, gradient: c.gradient, isActive: c.isActive, imageUrl: c.imageUrl });
        setSaving('');
    }
    async function deleteCategory(id: string) {
        if (!confirm('Delete this event category?')) return;
        await fetch(`/api/admin/special-events-content?type=category&id=${id}`, { method: 'DELETE' });
        await load();
    }

    async function addService() {
        setSaving('new-svc');
        await api('POST', { type: 'service', icon: '✨', title: 'New Service', description: 'Description here' });
        await load(); setSaving('');
    }
    async function saveService(s: Svc) {
        setSaving(s.id);
        await api('PATCH', { type: 'service', id: s.id, icon: s.icon, title: s.title, description: s.description, isActive: s.isActive });
        setSaving('');
    }
    async function deleteService(id: string) {
        if (!confirm('Delete this service?')) return;
        await fetch(`/api/admin/special-events-content?type=service&id=${id}`, { method: 'DELETE' });
        await load();
    }

    function updateCat(id: string, field: string, val: any) { setCats(prev => prev.map(c => c.id === id ? { ...c, [field]: val } : c)); }
    function updateSvc(id: string, field: string, val: any) { setSvcs(prev => prev.map(s => s.id === id ? { ...s, [field]: val } : s)); }

    if (loading) return <p style={{ color: '#666', fontFamily: 'Poppins, sans-serif' }}>Loading page content…</p>;

    return (
        <div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />

            {/* ── Hero Text ── */}
            <div style={card}>
                <h2 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '16px', fontWeight: 700, color: '#FF6BA8', marginBottom: '16px' }}>Hero Section — Text</h2>
                <div className={styles.formGrid}>
                    <div><label style={lbl}>Eyebrow Text</label><input style={inp} value={hero?.eyebrow || ''} onChange={e => setHero(h => h ? { ...h, eyebrow: e.target.value } : { id: '', eyebrow: e.target.value, headline: '', subtext: '', imageUrl: null, isActive: true })} /></div>
                    <div className={styles.fullRow}><label style={lbl}>Headline</label><input style={inp} value={hero?.headline || ''} onChange={e => setHero(h => h ? { ...h, headline: e.target.value } : { id: '', headline: e.target.value, eyebrow: '', subtext: '', imageUrl: null, isActive: true })} /></div>
                    <div className={styles.fullRow}><label style={lbl}>Subtext</label><textarea style={{ ...inp, resize: 'vertical' as const, minHeight: '60px' }} value={hero?.subtext || ''} onChange={e => setHero(h => h ? { ...h, subtext: e.target.value } : { id: '', subtext: e.target.value, eyebrow: '', headline: '', imageUrl: null, isActive: true })} /></div>
                </div>
                <button className={styles.btnPrimary} onClick={saveHero} disabled={saving === 'hero'} style={{ marginTop: '12px' }}><Save size={14} /> {saving === 'hero' ? 'Saving…' : 'Save Hero Text'}</button>
            </div>

            {/* ── Hero Slider Images ── */}
            <div style={card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h2 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '16px', fontWeight: 700, color: '#FF6BA8', margin: 0 }}>Hero Slider Images <span style={{ fontSize: '12px', color: '#666', fontWeight: 400 }}>({heroImgs.length}/10)</span></h2>
                    <button className={styles.btnSecondary} onClick={() => triggerUpload('heroSlider')} disabled={uploading === 'heroSlider' || heroImgs.length >= 10} style={{ marginTop: 0 }}>
                        <UploadCloud size={14} /> {uploading === 'heroSlider' ? 'Uploading…' : 'Add Image'}
                    </button>
                </div>
                {heroImgs.length === 0 ? (
                    <p style={{ color: '#555', fontFamily: 'Poppins, sans-serif', fontSize: '13px' }}>No hero images yet. The hero will use a gradient background. Upload up to 10 images for a crossfading slider.</p>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 180px), 1fr))', gap: '12px' }}>
                        {heroImgs.map((img, i) => (
                            <div key={img.id} style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', aspectRatio: '16/9', background: '#111' }}>
                                <Image src={img.url} alt={`Hero slide ${i + 1}`} fill style={{ objectFit: 'cover' }} />
                                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '10px' }}>
                                    <span style={{ fontFamily: 'Poppins, sans-serif', color: '#fff', fontSize: '11px', fontWeight: 600, background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '10px', backdropFilter: 'blur(4px)' }}>Slide {i + 1}</span>
                                    <button onClick={() => deleteHeroImg(img.id)} style={{ background: 'rgba(255,45,120,0.9)', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                        <Trash2 size={14} color="#fff" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Event Categories ── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', marginTop: '28px' }}>
                <h2 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '16px', fontWeight: 700, color: '#fff' }}>Event Categories</h2>
                <button className={styles.btnSecondary} onClick={addCategory} disabled={saving === 'new-cat'}><Plus size={14} /> {saving === 'new-cat' ? 'Adding…' : 'Add Category'}</button>
            </div>
            {cats.length === 0 ? (
                <p style={{ color: '#555', fontFamily: 'Poppins, sans-serif', fontSize: '13px', marginBottom: '20px' }}>No event categories yet.</p>
            ) : cats.map(c => (
                <div key={c.id} style={{ ...card, opacity: c.isActive ? 1 : 0.5 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <GripVertical size={14} color="#444" />
                            <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#fff', fontSize: '14px' }}>{c.name}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                            <button onClick={() => updateCat(c.id, 'isActive', !c.isActive)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.isActive ? '#4ade80' : '#666' }}>{c.isActive ? <Eye size={16} /> : <EyeOff size={16} />}</button>
                            <button onClick={() => deleteCategory(c.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#FF2D78' }}><Trash2 size={16} /></button>
                        </div>
                    </div>
                    <div className={styles.formGrid}>
                        <div><label style={lbl}>Tag</label><input style={inp} value={c.tag} onChange={e => updateCat(c.id, 'tag', e.target.value)} /></div>
                        <div><label style={lbl}>Name</label><input style={inp} value={c.name} onChange={e => updateCat(c.id, 'name', e.target.value)} /></div>
                        <div><label style={lbl}>URL Slug</label><input style={inp} value={c.slug || ''} onChange={e => updateCat(c.id, 'slug', e.target.value)} placeholder="weddings-bridal" /></div>
                        <div className={styles.fullRow}><label style={lbl}>Short Description</label><input style={inp} value={c.description} onChange={e => updateCat(c.id, 'description', e.target.value)} /></div>
                        <div className={styles.fullRow}><label style={lbl}>Long Description <span style={{color:'#555', fontWeight:400}}>(for individual page)</span></label><textarea style={{...inp, resize:'vertical' as const, minHeight:'80px'}} value={c.longDescription || ''} onChange={e => updateCat(c.id, 'longDescription', e.target.value)} placeholder="Detailed description for the individual event page..." /></div>
                        <div className={styles.fullRow}><label style={lbl}>Benefits / What&apos;s Included <span style={{color:'#555', fontWeight:400}}>(use - for bullets)</span></label><textarea style={{...inp, resize:'vertical' as const, minHeight:'60px'}} value={c.benefits || ''} onChange={e => updateCat(c.id, 'benefits', e.target.value)} placeholder="- Professional hair styling&#10;- Full glam makeup" /></div>
                        <div><label style={lbl}>Pills (comma-separated)</label><input style={inp} value={c.pills} onChange={e => updateCat(c.id, 'pills', e.target.value)} placeholder="Hair,Makeup,Lashes" /></div>
                        <div><label style={lbl}>Gradient CSS</label><input style={inp} value={c.gradient} onChange={e => updateCat(c.id, 'gradient', e.target.value)} /></div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><input type="checkbox" checked={c.wide} onChange={e => updateCat(c.id, 'wide', e.target.checked)} style={{ accentColor: '#FF2D78' }} /><label style={{ fontSize: '12px', color: '#aaa', fontFamily: 'Poppins, sans-serif' }}>Wide (2 columns)</label></div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '8px', flexWrap: 'wrap' }}>
                        <button className={styles.btnSecondary} onClick={() => triggerUpload('category', c.id)} disabled={uploading === c.id} style={{ marginTop: 0 }}><UploadCloud size={14} /> {uploading === c.id ? 'Uploading…' : 'Upload Image'}</button>
                        {c.imageUrl && <div style={{ width: '60px', height: '40px', borderRadius: '6px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', position: 'relative' }}><Image src={c.imageUrl} alt={c.name} fill style={{ objectFit: 'cover' }} /></div>}
                        <button className={styles.btnPrimary} onClick={() => saveCategory(c)} disabled={saving === c.id} style={{ marginLeft: 'auto', marginTop: 0 }}><Save size={14} /> {saving === c.id ? 'Saving…' : 'Save'}</button>
                    </div>
                </div>
            ))}

            {/* ── Services ── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', marginTop: '28px' }}>
                <h2 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '16px', fontWeight: 700, color: '#fff' }}>Event Services</h2>
                <button className={styles.btnSecondary} onClick={addService} disabled={saving === 'new-svc'}><Plus size={14} /> {saving === 'new-svc' ? 'Adding…' : 'Add Service'}</button>
            </div>
            {svcs.length === 0 ? (
                <p style={{ color: '#555', fontFamily: 'Poppins, sans-serif', fontSize: '13px' }}>No services yet.</p>
            ) : svcs.map(s => (
                <div key={s.id} style={{ ...card, opacity: s.isActive ? 1 : 0.5 }}>
                    <div className={styles.formGrid}>
                        <div><label style={lbl}>Icon (emoji)</label><input style={{ ...inp, maxWidth: '80px' }} value={s.icon} onChange={e => updateSvc(s.id, 'icon', e.target.value)} /></div>
                        <div><label style={lbl}>Title</label><input style={inp} value={s.title} onChange={e => updateSvc(s.id, 'title', e.target.value)} /></div>
                        <div className={styles.fullRow}><label style={lbl}>Description</label><input style={inp} value={s.description} onChange={e => updateSvc(s.id, 'description', e.target.value)} /></div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '8px' }}>
                        <button onClick={() => updateSvc(s.id, 'isActive', !s.isActive)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: s.isActive ? '#4ade80' : '#666' }}>{s.isActive ? <Eye size={16} /> : <EyeOff size={16} />}</button>
                        <button onClick={() => deleteService(s.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#FF2D78' }}><Trash2 size={16} /></button>
                        <button className={styles.btnPrimary} onClick={() => saveService(s)} disabled={saving === s.id} style={{ marginLeft: 'auto', marginTop: 0 }}><Save size={14} /> {saving === s.id ? 'Saving…' : 'Save'}</button>
                    </div>
                </div>
            ))}
        </div>
    );
}
