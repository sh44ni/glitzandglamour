'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { RefreshCw, Trash2, Star, Globe, ExternalLink } from 'lucide-react';

type ReviewRow = {
    id: string;
    rating: number;
    text: string;
    source: string;
    badge?: string | null;
    authorName?: string | null;
    createdAt: string;
    user?: { name: string; image?: string | null } | null;
};

export default function AdminReviewsPage() {
    const [reviews, setReviews] = useState<ReviewRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncingSetmore, setSyncingSetmore] = useState(false);
    const [syncingGoogle, setSyncingGoogle] = useState(false);
    const [setmoreResult, setSetmoreResult] = useState<{ imported: number; skipped: number; message: string } | null>(null);
    const [setmoreError, setSetmoreError] = useState('');
    const [googleResult, setGoogleResult] = useState<{ imported: number; skipped: number; total: number; message: string } | null>(null);
    const [googleError, setGoogleError] = useState('');
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const fetchReviews = useCallback(async () => {
        const res = await fetch('/api/admin/sync-reviews');
        const data = await res.json();
        setReviews(data.reviews || []);
        setLoading(false);
    }, []);

    useEffect(() => { fetchReviews(); }, [fetchReviews]);

    async function syncSetmore() {
        setSyncingSetmore(true);
        setSetmoreResult(null);
        setSetmoreError('');
        try {
            const res = await fetch('/api/admin/sync-reviews', { method: 'POST' });
            const data = await res.json();
            if (!res.ok) { setSetmoreError(data.error || 'Sync failed'); return; }
            setSetmoreResult(data);
            await fetchReviews();
        } catch { setSetmoreError('Network error — check server logs'); }
        finally { setSyncingSetmore(false); }
    }

    async function syncGoogle() {
        setSyncingGoogle(true);
        setGoogleResult(null);
        setGoogleError('');
        try {
            const res = await fetch('/api/admin/sync-google-reviews', { method: 'POST' });
            const data = await res.json();
            if (!res.ok) { setGoogleError(data.error || 'Google sync failed'); return; }
            setGoogleResult(data);
            await fetchReviews();
        } catch { setGoogleError('Network error — check server logs'); }
        finally { setSyncingGoogle(false); }
    }

    async function deleteReview(id: string) {
        if (!confirm('Delete this review?')) return;
        setDeletingId(id);
        try {
            await fetch(`/api/admin/sync-reviews?id=${id}`, { method: 'DELETE' });
            setReviews(prev => prev.filter(r => r.id !== id));
        } finally { setDeletingId(null); }
    }

    const S: React.CSSProperties = { fontFamily: 'Poppins, sans-serif' };

    const websiteCount = reviews.filter(r => r.source === 'website').length;
    const googleCount = reviews.filter(r => r.source === 'google').length;
    const setmoreCount = reviews.filter(r => r.source === 'setmore').length;

    return (
        <div style={{ maxWidth: '860px' }}>
            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ ...S, fontWeight: 700, color: '#fff', fontSize: '22px', marginBottom: '4px' }}>Reviews Management</h1>
                <p style={{ ...S, color: '#888', fontSize: '13px' }}>
                    {reviews.length} total · {websiteCount} verified website · {googleCount} from Google · {setmoreCount} from Setmore
                </p>
            </div>

            {/* Sync Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                
                {/* Google Reviews Sync Card */}
                <div style={{ background: 'rgba(66,133,244,0.06)', border: '1px solid rgba(66,133,244,0.2)', borderRadius: '16px', padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                </svg>
                                <p style={{ ...S, fontWeight: 600, color: '#fff', fontSize: '14px' }}>
                                    Google Reviews Sync
                                </p>
                            </div>
                            <p style={{ ...S, color: '#888', fontSize: '12px', lineHeight: 1.5 }}>
                                Fetches and auto-accumulates all Google reviews into the database. Runs daily.
                            </p>
                            <a href="https://maps.google.com/?q=Glitz+and+Glamour+Studio+Vista+CA" target="_blank" rel="noopener"
                                style={{ ...S, display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#4285F4', fontSize: '11px', marginTop: '6px', textDecoration: 'none' }}>
                                View on Google Maps <ExternalLink size={10} />
                            </a>
                        </div>
                        <button
                            onClick={syncGoogle}
                            disabled={syncingGoogle}
                            style={{ background: 'linear-gradient(135deg, #4285F4, #1967D2)', border: 'none', borderRadius: '10px', padding: '10px 16px', cursor: syncingGoogle ? 'not-allowed' : 'pointer', ...S, fontWeight: 600, fontSize: '12px', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px', opacity: syncingGoogle ? 0.7 : 1, flexShrink: 0 }}>
                            <RefreshCw size={13} style={{ animation: syncingGoogle ? 'spin 1s linear infinite' : 'none' }} />
                            {syncingGoogle ? 'Syncing…' : 'Sync Google'}
                        </button>
                    </div>

                    {googleResult && (
                        <div style={{ marginTop: '12px', background: 'rgba(0,212,120,0.08)', border: '1px solid rgba(0,212,120,0.2)', borderRadius: '10px', padding: '8px 12px' }}>
                            <p style={{ ...S, color: '#00D478', fontSize: '12px', fontWeight: 600 }}>✓ {googleResult.message}</p>
                        </div>
                    )}
                    {googleError && (
                        <div style={{ marginTop: '12px', background: 'rgba(255,45,60,0.07)', border: '1px solid rgba(255,45,60,0.2)', borderRadius: '10px', padding: '8px 12px' }}>
                            <p style={{ ...S, color: '#ff6b6b', fontSize: '12px' }}>✗ {googleError}</p>
                        </div>
                    )}
                </div>

                {/* Setmore Reviews Sync Card */}
                <div style={{ background: 'rgba(0,152,212,0.06)', border: '1px solid rgba(0,152,212,0.2)', borderRadius: '16px', padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                        <div>
                            <p style={{ ...S, fontWeight: 600, color: '#fff', fontSize: '14px', marginBottom: '4px' }}>
                                Setmore Reviews Sync
                            </p>
                            <p style={{ ...S, color: '#888', fontSize: '12px', lineHeight: 1.5 }}>
                                Fetches all reviews from your Setmore booking page and saves them to the database.
                            </p>
                            <a href="https://glitzandglamourstudio.setmore.com/#reviews" target="_blank" rel="noopener"
                                style={{ ...S, display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#0098d4', fontSize: '11px', marginTop: '6px', textDecoration: 'none' }}>
                                View Setmore page <ExternalLink size={10} />
                            </a>
                        </div>
                        <button
                            onClick={syncSetmore}
                            disabled={syncingSetmore}
                            style={{ background: 'linear-gradient(135deg, #0098d4, #006fa6)', border: 'none', borderRadius: '10px', padding: '10px 16px', cursor: syncingSetmore ? 'not-allowed' : 'pointer', ...S, fontWeight: 600, fontSize: '12px', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px', opacity: syncingSetmore ? 0.7 : 1, flexShrink: 0 }}>
                            <RefreshCw size={13} style={{ animation: syncingSetmore ? 'spin 1s linear infinite' : 'none' }} />
                            {syncingSetmore ? 'Syncing…' : 'Sync Setmore'}
                        </button>
                    </div>

                    {setmoreResult && (
                        <div style={{ marginTop: '12px', background: 'rgba(0,212,120,0.08)', border: '1px solid rgba(0,212,120,0.2)', borderRadius: '10px', padding: '8px 12px' }}>
                            <p style={{ ...S, color: '#00D478', fontSize: '12px', fontWeight: 600 }}>✓ {setmoreResult.message}</p>
                        </div>
                    )}
                    {setmoreError && (
                        <div style={{ marginTop: '12px', background: 'rgba(255,45,60,0.07)', border: '1px solid rgba(255,45,60,0.2)', borderRadius: '10px', padding: '8px 12px' }}>
                            <p style={{ ...S, color: '#ff6b6b', fontSize: '12px' }}>✗ {setmoreError}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Spin animation */}
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

            {/* Reviews List */}
            {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="skeleton" style={{ height: '100px', borderRadius: '14px', marginBottom: '10px' }} />
                ))
            ) : reviews.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 0' }}>
                    <Globe size={32} color="#2a2a2a" />
                    <p style={{ ...S, color: '#444', fontSize: '13px', marginTop: '10px' }}>No reviews in database yet. Hit "Sync" above to import.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '10px' }}>
                    {reviews.map(r => {
                        const authorName = r.user?.name || r.authorName || 'Unknown';
                        const initial = authorName.charAt(0).toUpperCase();
                        const avatarImage = r.user?.image;
                        return (
                            <div key={r.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '14px 16px' }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                    {/* Avatar */}
                                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0, overflow: 'hidden', position: 'relative', background: r.source === 'google' ? '#333' : r.source === 'setmore' ? 'linear-gradient(135deg, #0098d4, #00c6ff)' : 'linear-gradient(135deg, #FF2D78, #7928CA)', display: 'flex', alignItems: 'center', justifyContent: 'center', ...S, fontWeight: 700, color: '#fff', fontSize: '14px' }}>
                                        {avatarImage ? (
                                            <Image src={avatarImage} alt={authorName} fill style={{ objectFit: 'cover' }} />
                                        ) : (
                                            initial
                                        )}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        {/* Name + badges row */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '4px' }}>
                                            <p style={{ ...S, fontWeight: 600, color: '#fff', fontSize: '13px' }}>{authorName}</p>

                                            {/* Source pill */}
                                            {r.source === 'google' ? (
                                                <span style={{ background: 'rgba(66,133,244,0.12)', border: '1px solid rgba(66,133,244,0.3)', borderRadius: '50px', padding: '1px 7px', ...S, fontSize: '10px', fontWeight: 600, color: '#4285F4', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                                    </svg>
                                                    Google
                                                </span>
                                            ) : r.source === 'setmore' ? (
                                                <span style={{ background: 'rgba(0,152,212,0.12)', border: '1px solid rgba(0,152,212,0.3)', borderRadius: '50px', padding: '1px 7px', ...S, fontSize: '10px', fontWeight: 600, color: '#0098d4' }}>
                                                    setmore
                                                </span>
                                            ) : (
                                                <span style={{ background: 'rgba(255,45,120,0.1)', border: '1px solid rgba(255,45,120,0.2)', borderRadius: '50px', padding: '1px 7px', ...S, fontSize: '10px', fontWeight: 600, color: '#FF2D78' }}>
                                                    🌐 website
                                                </span>
                                            )}

                                            {/* Loyalty badge */}
                                            {r.badge === 'insider' && (
                                                <span style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.35)', borderRadius: '50px', padding: '1px 7px', ...S, fontSize: '10px', fontWeight: 700, color: '#D4AF37' }}>
                                                    ⭐ Glam Insider
                                                </span>
                                            )}
                                            {r.badge === 'member' && (
                                                <span style={{ background: 'rgba(255,45,120,0.1)', border: '1px solid rgba(255,45,120,0.25)', borderRadius: '50px', padding: '1px 7px', ...S, fontSize: '10px', fontWeight: 600, color: '#FF2D78' }}>
                                                    💗 Glam Member
                                                </span>
                                            )}
                                        </div>

                                        {/* Stars + date */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                            <div style={{ display: 'flex', gap: '2px' }}>
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <Star key={i} size={11} fill={i < r.rating ? '#FFB700' : 'transparent'} color={i < r.rating ? '#FFB700' : '#444'} />
                                                ))}
                                            </div>
                                            <span style={{ ...S, color: '#444', fontSize: '11px' }}>
                                                {new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </span>
                                        </div>

                                        {/* Review text */}
                                        <p style={{ ...S, color: '#999', fontSize: '12px', lineHeight: 1.6, wordBreak: 'break-word' }}>
                                            "{r.text.length > 200 ? r.text.substring(0, 200) + '…' : r.text}"
                                        </p>
                                    </div>

                                    {/* Delete */}
                                    <button onClick={() => deleteReview(r.id)} disabled={deletingId === r.id}
                                        style={{ background: 'rgba(255,45,60,0.07)', border: '1px solid rgba(255,45,60,0.18)', borderRadius: '7px', padding: '5px 7px', cursor: 'pointer', color: '#ff6b6b', flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                                        {deletingId === r.id ? '…' : <Trash2 size={12} />}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
