'use client';

import { useState } from 'react';
import { Star, Upload, X, Loader2, CheckCircle } from 'lucide-react';
import { uploadImage } from '@/lib/storage'; // ensure this is imported from client side
import Image from 'next/image';

export default function ReviewForm({ token, initialName }: { token: string; initialName?: string }) {
    const [name, setName] = useState(initialName || '');
    const [rating, setRating] = useState(5);
    const [text, setText] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setFiles(prev => [...prev, ...newFiles]);
            const newPreviews = newFiles.map(f => URL.createObjectURL(f));
            setPreviews(prev => [...prev, ...newPreviews]);
        }
    };

    const handleRemoveFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setAvatarFile(selectedFile);
            setAvatarPreview(URL.createObjectURL(selectedFile));
        }
    };

    const handleRemoveAvatar = () => {
        setAvatarFile(null);
        setAvatarPreview(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return alert('Please enter your name.');
        if (!text.trim()) return alert('Please write a quick review.');

        setLoading(true);
        try {
            let imageUrls: string[] = [];
            let authorAvatar = null;

            if (avatarFile) {
                const uploadRes = await uploadImage(avatarFile);
                if (uploadRes?.url) authorAvatar = uploadRes.url;
            }

            for (const f of files) {
                const uploadRes = await uploadImage(f);
                if (uploadRes?.url) imageUrls.push(uploadRes.url);
            }

            const res = await fetch('/api/reviews/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, name, rating, text, imageUrls, authorAvatar })
            });

            const data = await res.json();
            if (data.success) {
                setSuccess(true);
            } else {
                alert(data.error || 'Failed to submit review');
            }
        } catch (error: any) {
            console.error('Submit error', error);
            alert('Something went wrong. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#fff' }}>
                <div style={{ background: 'rgba(45,255,120,0.1)', display: 'inline-flex', padding: '24px', borderRadius: '50%', marginBottom: '24px' }}>
                    <CheckCircle size={48} color="#2df878" />
                </div>
                <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px' }}>Thank you for your review!</h2>
                <p style={{ color: '#aaa' }}>Your feedback means the world to us. Your $10 discount has been noted! 💕</p>
                <a href="/" style={{ display: 'inline-block', marginTop: '32px', padding: '12px 24px', background: '#FF2D78', color: '#fff', borderRadius: '50px', textDecoration: 'none', fontWeight: 600 }}>
                    Return to Studio
                </a>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px', color: '#fff' }}>
            {/* Rating */}
            <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                <p style={{ fontSize: '14px', color: '#aaa', fontWeight: 600, marginBottom: '12px' }}>How was your experience?</p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            style={{
                                background: 'none', border: 'none', cursor: 'pointer',
                                padding: '4px', transition: 'transform 0.1s'
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
                            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                        >
                            <Star size={32} fill={star <= rating ? '#FFD700' : 'transparent'} color={star <= rating ? '#FFD700' : '#444'} strokeWidth={1.5} />
                        </button>
                    ))}
                </div>
            </div>

            {/* Name & Avatar Row */}
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#FF2D78', marginBottom: '8px' }}>Your Name <span style={{ color: '#ff4444' }}>*</span></label>
                    <input
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your name"
                        style={{
                            width: '100%', padding: '14px 16px', borderRadius: '12px',
                            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
                            color: '#fff', outline: 'none', fontSize: '15px'
                        }}
                    />
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#FF2D78', marginBottom: '8px', textAlign: 'center' }}>Profile Photo</label>
                    <div style={{ position: 'relative', width: '56px', height: '56px', margin: '0 auto', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '1px dashed rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden' }}>
                        {avatarPreview ? (
                            <>
                                <Image src={avatarPreview} alt="Avatar" width={56} height={56} style={{ 
                                    objectFit: 'cover', 
                                    position: 'absolute',
                                    top: 0, left: 0, width: '100%', height: '100%' 
                                }} />
                                <div onClick={(e) => { e.preventDefault(); handleRemoveAvatar(); }} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s', zIndex: 10 }} onMouseEnter={e => e.currentTarget.style.opacity = '1'} onMouseLeave={e => e.currentTarget.style.opacity = '0'}>
                                    <X size={20} color="#fff" />
                                </div>
                            </>
                        ) : (
                            <label style={{ cursor: 'pointer', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: 0 }}>
                                <Upload size={20} color="#aaa" />
                                <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
                            </label>
                        )}
                    </div>
                </div>
            </div>

            {/* Review Text */}
            <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#FF2D78', marginBottom: '8px' }}>Review <span style={{ color: '#ff4444' }}>*</span></label>
                <textarea
                    required
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Share the details of your experience... What did you love?"
                    rows={5}
                    style={{
                        width: '100%', padding: '14px 16px', borderRadius: '12px',
                        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
                        color: '#fff', outline: 'none', fontSize: '15px', resize: 'vertical'
                    }}
                />
            </div>

            {/* Photo Upload */}
            <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#FF2D78', marginBottom: '8px' }}>Add Photos <span style={{ color: '#888', fontWeight: 400 }}>(Optional)</span></label>
                
                <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
                    {previews.map((src, i) => (
                        <div key={i} style={{ position: 'relative', width: '100px', height: '100px', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
                            <Image src={src} alt="Preview" width={100} height={100} style={{ 
                                objectFit: 'cover', 
                                position: 'absolute',
                                top: 0, left: 0, width: '100%', height: '100%' 
                            }} />
                            <button type="button" onClick={() => handleRemoveFile(i)} style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', zIndex: 10 }}>
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                    
                    <label style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        width: '100px', height: '100px', borderRadius: '12px', flexShrink: 0,
                        background: 'rgba(255,45,120,0.05)', border: '1.5px dashed rgba(255,45,120,0.3)',
                        cursor: 'pointer', transition: 'all 0.2s'
                    }}
                        onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(255,45,120,0.08)')}
                        onMouseOut={(e) => (e.currentTarget.style.background = 'rgba(255,45,120,0.05)')}
                    >
                        <Upload size={24} color="#FF2D78" />
                        <span style={{ fontSize: '11px', color: '#FF2D78', fontWeight: 500, marginTop: '4px' }}>Add Photo</span>
                        <input type="file" accept="image/*" multiple onChange={handleFilesChange} style={{ display: 'none' }} />
                    </label>
                </div>
            </div>

            {/* Submit */}
            <button
                type="submit"
                disabled={loading}
                style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    width: '100%', padding: '16px', borderRadius: '14px',
                    background: loading ? '#444' : 'linear-gradient(135deg, #FF2D78, #FF6BA8)',
                    color: '#fff', border: 'none', fontSize: '16px', fontWeight: 700,
                    cursor: loading ? 'not-allowed' : 'pointer', marginTop: '12px',
                    boxShadow: loading ? 'none' : '0 8px 16px rgba(255,45,120,0.25)'
                }}
            >
                {loading ? <Loader2 size={20} className="spin" /> : 'Submit Review'}
            </button>
            <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        </form>
    );
}
