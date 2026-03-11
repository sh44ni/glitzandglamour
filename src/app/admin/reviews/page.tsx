'use client';

import { useEffect, useState, useCallback } from 'react';
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
    const [syncing, setSyncing] = useState(false);
    const [syncResult, setSyncResult] = useState<{ imported: number; skipped: number; message: string } | null>(null);
    const [syncError, setSyncError] = useState('');
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const fetchReviews = useCallback(async () => {
        const res = await fetch('/api/admin/sync-reviews');
        const data = await res.json();
        setReviews(data.reviews || []);
        setLoading(false);
    }, []);

    useEffect(() => { fetchReviews(); }, [fetchReviews]);

    async function syncSetmore() {
        setSyncing(true);
        setSyncResult(null);
        setSyncError('');
        try {
            const res = await fetch('/api/admin/sync-reviews', { method: 'POST' });
            const data = await res.json();
            if (!res.ok) { setSyncError(data.error || 'Sync failed'); return; }
            setSyncResult(data);
            await fetchReviews();
        } catch { setSyncError('Network error — check server logs'); }
        finally { setSyncing(false); }
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

    const setmoreCount = reviews.filter(r => r.source === 'setmore').length;
    const websiteCount = reviews.filter(r => r.source === 'website').length;

    return (
        <div style={{ maxWidth: '860px' }}>
            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ ...S, fontWeight: 700, color: '#fff', fontSize: '22px', marginBottom: '4px' }}>Reviews</h1>
                <p style={{ ...S, color: '#555', fontSize: '13px' }}>
                    {reviews.length} total · {websiteCount} website · {setmoreCount} from Setmore
                </p>
            </div>

            {/* Sync Card */}
            <div style={{ background: 'rgba(0,152,212,0.06)', border: '1px solid rgba(0,152,212,0.2)', borderRadius: '16px', padding: '20px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                        <p style={{ ...S, fontWeight: 600, color: '#fff', fontSize: '14px', marginBottom: '3px' }}>
                            Setmore Reviews Sync
                        </p>
                        <p style={{ ...S, color: '#555', fontSize: '12px' }}>
                            Fetches all reviews from your Setmore public page and saves them to the database.
                        </p>
                        <a href="https://glitzandglamourstudio.setmore.com/#reviews" target="_blank" rel="noopener"
                            style={{ ...S, display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#0098d4', fontSize: '11px', marginTop: '4px', textDecoration: 'none' }}>
                            View Setmore page <ExternalLink size={10} />
                        </a>
                    </div>
                    <button
                        onClick={syncSetmore}
                        disabled={syncing}
                        style={{ background: 'linear-gradient(135deg, #0098d4, #006fa6)', border: 'none', borderRadius: '10px', padding: '10px 20px', cursor: syncing ? 'not-allowed' : 'pointer', ...S, fontWeight: 600, fontSize: '13px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', opacity: syncing ? 0.7 : 1, flexShrink: 0 }}>
                        <RefreshCw size={14} style={{ animation: syncing ? 'spin 1s linear infinite' : 'none' }} />
                        {syncing ? 'Syncing…' : 'Sync Setmore Reviews'}
                    </button>
                </div>

                {/* Sync result */}
                {syncResult && (
                    <div style={{ marginTop: '12px', background: 'rgba(0,212,120,0.08)', border: '1px solid rgba(0,212,120,0.2)', borderRadius: '10px', padding: '10px 14px' }}>
                        <p style={{ ...S, color: '#00D478', fontSize: '13px', fontWeight: 600 }}>✓ {syncResult.message}</p>
                    </div>
                )}
                {syncError && (
                    <div style={{ marginTop: '12px', background: 'rgba(255,45,60,0.07)', border: '1px solid rgba(255,45,60,0.2)', borderRadius: '10px', padding: '10px 14px' }}>
                        <p style={{ ...S, color: '#ff6b6b', fontSize: '13px' }}>✗ {syncError}</p>
                    </div>
                )}
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
                    <p style={{ ...S, color: '#444', fontSize: '13px', marginTop: '10px' }}>No reviews yet. Hit "Sync" to import from Setmore.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '10px' }}>
                    {reviews.map(r => {
                        const authorName = r.user?.name || r.authorName || 'Unknown';
                        const initial = authorName.charAt(0).toUpperCase();
                        return (
                            <div key={r.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '14px 16px' }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                    {/* Avatar */}
                                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0, background: r.source === 'setmore' ? 'linear-gradient(135deg, #0098d4, #00c6ff)' : 'linear-gradient(135deg, #FF2D78, #7928CA)', display: 'flex', alignItems: 'center', justifyContent: 'center', ...S, fontWeight: 700, color: '#fff', fontSize: '14px' }}>
                                        {initial}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        {/* Name + badges row */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '4px' }}>
                                            <p style={{ ...S, fontWeight: 600, color: '#fff', fontSize: '13px' }}>{authorName}</p>

                                            {/* Source pill */}
                                            {r.source === 'setmore' ? (
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
