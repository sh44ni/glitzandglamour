'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Trash2, AlertCircle, UploadCloud, Plus } from 'lucide-react';

type SliderImage = { id: string; url: string; order: number };

export default function AdminSliderPage() {
    const [images, setImages] = useState<SliderImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const fileInput = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchImages();
    }, []);

    const fetchImages = async () => {
        try {
            const r = await fetch('/api/admin/slider');
            const d = await r.json();
            if (d.images) setImages(d.images);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            // 1. Upload to our generic /api/upload endpoint
            const fd = new FormData();
            fd.append('file', file);
            const uploadRes = await fetch('/api/upload', { method: 'POST', body: fd });
            if (!uploadRes.ok) throw new Error('Upload failed');

            const { url } = await uploadRes.json();

            // 2. Save reference to DB
            const saveRes = await fetch('/api/admin/slider', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url })
            });

            if (!saveRes.ok) throw new Error('Save failed');

            await fetchImages();
        } catch (error) {
            console.error('Failed to upload image:', error);
            alert('Failed to upload image. Please try again.');
        } finally {
            setUploading(false);
            if (fileInput.current) fileInput.current.value = '';
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to remove this image from the slider?')) return;

        try {
            const r = await fetch(`/api/admin/slider?id=${id}`, { method: 'DELETE' });
            if (r.ok) {
                setImages(prev => prev.filter(img => img.id !== id));
            }
        } catch (e) {
            console.error(e);
            alert('Failed to delete image');
        }
    };

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#fff', fontSize: '24px', marginBottom: '8px' }}>Homepage Slider</h1>
                    <p style={{ fontFamily: 'Poppins, sans-serif', color: '#888', fontSize: '14px', maxWidth: '500px' }}>
                        Manage the rotating background images on the main homepage. The slider will smoothly crossfade between these images.
                    </p>
                </div>

                <div>
                    <input
                        ref={fileInput}
                        type="file"
                        accept="image/*"
                        onChange={handleUpload}
                        style={{ display: 'none' }}
                    />
                    <button
                        onClick={() => fileInput.current?.click()}
                        disabled={uploading}
                        className="btn-primary"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px' }}
                    >
                        {uploading ? (
                            <>Uploading...</>
                        ) : (
                            <><UploadCloud size={18} /> Upload Image</>
                        )}
                    </button>
                </div>
            </div>

            {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                    {[1, 2, 3].map(i => (
                        <div key={i} className="skeleton" style={{ height: '200px', borderRadius: '16px' }} />
                    ))}
                </div>
            ) : images.length === 0 ? (
                <div className="glass" style={{ padding: '60px 20px', textAlign: 'center', borderRadius: '24px' }}>
                    <div style={{ width: '64px', height: '64px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                        <AlertCircle size={32} color="#aaa" />
                    </div>
                    <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, color: '#fff', fontSize: '18px', marginBottom: '8px' }}>No Slider Images</h3>
                    <p style={{ fontFamily: 'Poppins, sans-serif', color: '#888', fontSize: '14px', marginBottom: '24px' }}>
                        The homepage is currently using the default static background. <br />Upload some images to activate the dynamic slider.
                    </p>
                    <button onClick={() => fileInput.current?.click()} className="btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        <Plus size={16} /> Add First Image
                    </button>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                    {images.map((img, index) => (
                        <div key={img.id} style={{
                            position: 'relative', borderRadius: '16px', overflow: 'hidden',
                            border: '1px solid rgba(255,255,255,0.1)', aspectRatio: '16/9',
                            background: '#111'
                        }}>
                            <Image
                                src={img.url}
                                alt={`Slider image ${index + 1}`}
                                fill
                                style={{ objectFit: 'cover' }}
                            />

                            {/* Overlay Controls */}
                            <div style={{
                                position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 50%)',
                                display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '16px'
                            }}>
                                <span style={{ fontFamily: 'Poppins, sans-serif', color: '#fff', fontSize: '12px', fontWeight: 600, background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '12px', backdropFilter: 'blur(4px)' }}>
                                    Slide {index + 1}
                                </span>

                                <button
                                    onClick={() => handleDelete(img.id)}
                                    style={{
                                        background: 'rgba(255,45,120,0.9)', border: 'none', borderRadius: '50%',
                                        width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        cursor: 'pointer', boxShadow: '0 4px 12px rgba(255,45,120,0.3)', transition: 'transform 0.2s'
                                    }}
                                    onMouseOver={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.1)'; }}
                                    onMouseOut={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
                                >
                                    <Trash2 size={16} color="#fff" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
