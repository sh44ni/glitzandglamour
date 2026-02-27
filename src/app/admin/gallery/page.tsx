'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Trash2, AlertCircle, UploadCloud, Plus, Tag } from 'lucide-react';

type GalleryImage = { id: string; url: string; tags: string; createdAt: string };

export default function AdminGalleryPage() {
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [tagsInput, setTagsInput] = useState("");
    const fileInput = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchImages();
    }, []);

    const fetchImages = async () => {
        try {
            const r = await fetch('/api/gallery');
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

            // 2. Save reference to DB with tags
            const saveRes = await fetch('/api/admin/gallery', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url, tags: tagsInput.trim() })
            });

            if (!saveRes.ok) throw new Error('Save failed');

            setTagsInput(""); // Reset tags after successful upload
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
        if (!confirm('Are you sure you want to remove this image from the gallery?')) return;

        try {
            const r = await fetch(`/api/admin/gallery?id=${id}`, { method: 'DELETE' });
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '24px', marginBottom: '32px' }}>
                <div style={{ flex: 1, minWidth: '300px' }}>
                    <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#fff', fontSize: '24px', marginBottom: '8px' }}>Gallery Management</h1>
                    <p style={{ fontFamily: 'Poppins, sans-serif', color: '#888', fontSize: '14px', maxWidth: '500px' }}>
                        Upload photos to your public portfolio. Add comma-separated tags (e.g., "Nails, Acrylic, Pink") so clients can filter your work.
                    </p>
                </div>

                <div className="glass" style={{ padding: '16px', borderRadius: '16px', flex: 1, minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px 12px' }}>
                        <Tag size={16} color="#888" />
                        <select
                            value={tagsInput}
                            onChange={(e) => setTagsInput(e.target.value)}
                            style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', width: '100%', fontSize: '13px', fontFamily: 'Poppins, sans-serif', cursor: 'pointer' }}
                        >
                            <option value="" style={{ color: '#000' }}>No specific service (General)</option>
                            <option value="Nails" style={{ color: '#000' }}>Nails</option>
                            <option value="Hair" style={{ color: '#000' }}>Hair</option>
                            <option value="Makeup" style={{ color: '#000' }}>Makeup</option>
                            <option value="Lashes" style={{ color: '#000' }}>Lashes</option>
                            <option value="Pedicure" style={{ color: '#000' }}>Pedicure</option>
                            <option value="Brows" style={{ color: '#000' }}>Brows</option>
                        </select>
                    </div>

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
                        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px' }}
                    >
                        {uploading ? (
                            <>Uploading...</>
                        ) : (
                            <><UploadCloud size={18} /> Upload to Gallery</>
                        )}
                    </button>
                    <p style={{ fontSize: '10px', color: '#666', textAlign: 'center', marginTop: '-4px' }}>
                        Set your tags before clicking Upload.
                    </p>
                </div>
            </div>

            {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="skeleton" style={{ height: '300px', borderRadius: '16px' }} />
                    ))}
                </div>
            ) : images.length === 0 ? (
                <div className="glass" style={{ padding: '60px 20px', textAlign: 'center', borderRadius: '24px' }}>
                    <div style={{ width: '64px', height: '64px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                        <AlertCircle size={32} color="#aaa" />
                    </div>
                    <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, color: '#fff', fontSize: '18px', marginBottom: '8px' }}>No Gallery Images</h3>
                    <p style={{ fontFamily: 'Poppins, sans-serif', color: '#888', fontSize: '14px', marginBottom: '24px' }}>
                        Your public portfolio is currently empty. Start uploading photos to show off your work!
                    </p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                    {images.map((img) => (
                        <div key={img.id} style={{
                            position: 'relative', borderRadius: '16px', overflow: 'hidden',
                            border: '1px solid rgba(255,255,255,0.1)', aspectRatio: '4/5',
                            background: '#111'
                        }}>
                            <Image
                                src={img.url}
                                alt="Gallery upload"
                                fill
                                style={{ objectFit: 'cover' }}
                            />

                            {/* Overlay Controls */}
                            <div style={{
                                position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 40%)',
                                display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '16px'
                            }}>
                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', maxWidth: '80%' }}>
                                    {img.tags && img.tags.split(',').map(tag => (
                                        <span key={tag} style={{
                                            fontFamily: 'Poppins, sans-serif', color: '#fff', fontSize: '10px',
                                            fontWeight: 600, background: 'rgba(255,45,120,0.8)', padding: '2px 8px',
                                            borderRadius: '20px', backdropFilter: 'blur(4px)'
                                        }}>
                                            {tag.trim()}
                                        </span>
                                    ))}
                                </div>

                                <button
                                    onClick={() => handleDelete(img.id)}
                                    style={{
                                        background: 'rgba(20,20,20,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%',
                                        width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        cursor: 'pointer', flexShrink: 0
                                    }}
                                >
                                    <Trash2 size={14} color="#ff4444" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
