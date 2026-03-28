'use client';

import { useState } from 'react';
import { Star, Upload, X, Loader2, CheckCircle } from 'lucide-react';
import { uploadImage } from '@/lib/storage'; // ensure this is imported from client side
import Image from 'next/image';

export default function ReviewForm({ token, initialName }: { token: string; initialName?: string }) {
    const [name, setName] = useState(initialName || '');
    const [rating, setRating] = useState(5);
    const [text, setText] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
        }
    };

    const handleRemoveFile = () => {
        setFile(null);
        setPreview(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return alert('Please enter your name.');
        if (!text.trim()) return alert('Please write a quick review.');

        setLoading(true);
        try {
            let imageUrl = null;
            if (file) {
                const uploadRes = await uploadImage(file);
                imageUrl = uploadRes.url;
            }

            const res = await fetch('/api/reviews/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, name, rating, text, imageUrl })
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

            {/* Name */}
            <div>
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
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#FF2D78', marginBottom: '8px' }}>Add a Photo <span style={{ color: '#888', fontWeight: 400 }}>(Optional)</span></label>
                
                {!preview ? (
                    <label style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        gap: '12px', padding: '32px', borderRadius: '16px',
                        background: 'rgba(255,45,120,0.05)', border: '1.5px dashed rgba(255,45,120,0.3)',
                        cursor: 'pointer', transition: 'all 0.2s'
                    }}
                        onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(255,45,120,0.08)')}
                        onMouseOut={(e) => (e.currentTarget.style.background = 'rgba(255,45,120,0.05)')}
                    >
                        <Upload size={28} color="#FF2D78" />
                        <span style={{ fontSize: '14px', color: '#FF2D78', fontWeight: 500 }}>Upload a photo of your new look</span>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                        />
                    </label>
                ) : (
                    <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <Image
                            src={preview}
                            alt="Preview"
                            width={600}
                            height={400}
                            style={{ width: '100%', height: 'auto', display: 'block' }}
                        />
                        <button
                            type="button"
                            onClick={handleRemoveFile}
                            style={{
                                position: 'absolute', top: '12px', right: '12px',
                                background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%',
                                width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', color: '#fff', backdropFilter: 'blur(4px)'
                            }}
                        >
                            <X size={18} />
                        </button>
                    </div>
                )}
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
