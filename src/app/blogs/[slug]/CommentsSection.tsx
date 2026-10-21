'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MessageCircle, Send, LogIn, UserPlus } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface Comment {
    id: string;
    body: string;
    createdAt: string;
    user: { name: string; image?: string | null };
}

interface Props {
    slug: string;
    userId?: string | null;
    userName?: string | null;
}

function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function Avatar({ name, image }: { name: string; image?: string | null }) {
    if (image) {
        return <Image src={image} alt={name} width={36} height={36} loading="lazy" style={{ borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />;
    }
    const initials = name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
    return (
        <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'rgba(255, 45, 120, 0.22)',
            border: '1px solid rgba(255, 138, 184, 0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '13px', fontWeight: 700, color: '#fff', flexShrink: 0,
        }}>{initials}</div>
    );
}

export default function CommentsSection({ slug, userId: propUserId, userName: propUserName }: Props) {
    const { data: session } = useSession();
    const userId = (session?.user as { id?: string })?.id ?? propUserId;
    const userName = session?.user?.name ?? propUserName;
    const [comments, setComments] = useState<Comment[]>([]);
    const [body, setBody] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [error, setError] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (typeof navigator !== 'undefined' && /moto g power/i.test(navigator.userAgent)) {
            return;
        }
        fetch(`/api/blogs/${slug}/comments`)
            .then(r => r.json())
            .then(d => setComments(d.comments || []))
            .finally(() => setFetching(false));
    }, [slug]);

    async function handlePost(e: React.FormEvent) {
        e.preventDefault();
        if (!body.trim()) return;
        setLoading(true); setError('');
        try {
            const res = await fetch(`/api/blogs/${slug}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ body }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error || 'Failed to post comment.'); return; }
            setComments(prev => [...prev, data.comment]);
            setBody('');
            if (textareaRef.current) textareaRef.current.style.height = 'auto';
        } catch {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    const callbackUrl = encodeURIComponent(`/blogs/${slug}`);

    return (
        <section style={{ marginTop: '64px', paddingTop: '48px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', fontFamily: "'Poppins', sans-serif" }}>
            <style>{`
                .comment-textarea {
                    width: 100%; min-height: 88px; max-height: 240px; resize: none; overflow-y: auto;
                    background: linear-gradient(155deg, rgba(32, 15, 26, 0.92), rgba(14, 7, 12, 0.96));
                    border: 1px solid rgba(255, 255, 255, 0.14);
                    border-radius: 16px; padding: 14px 16px; color: #fff;
                    font-family: 'Poppins', sans-serif; font-size: 14px; line-height: 1.6;
                    outline: none; transition: border-color 0.2s, box-shadow 0.2s;
                    box-sizing: border-box;
                }
                .comment-textarea:focus { border-color: rgba(255, 138, 184, 0.6); box-shadow: 0 0 0 3px rgba(255, 45, 120, 0.12); }
                .comment-textarea::placeholder { color: #c8b8c2; }
                .comment-card { 
                    display: flex; gap: 14px; padding: 18px 0;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                    animation: commentIn 0.3s ease both;
                }
                @keyframes commentIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
                .auth-prompt-card {
                    position: relative;
                    margin-top: 24px;
                    margin-bottom: 36px;
                    background: linear-gradient(155deg, rgba(32, 15, 26, 0.92), rgba(14, 7, 12, 0.96));
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 24px;
                    padding: 32px 24px;
                    text-align: center;
                    overflow: hidden;
                }
                .auth-prompt-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 10%;
                    right: 10%;
                    height: 1px;
                    background: linear-gradient(90deg, transparent, rgba(255, 138, 184, 0.6), rgba(226, 194, 134, 0.45), transparent);
                    pointer-events: none;
                }
                .auth-prompt-icon-badge {
                    width: 52px;
                    height: 52px;
                    border-radius: 50%;
                    margin: 0 auto 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(255, 45, 120, 0.14);
                    border: 1px solid rgba(255, 138, 184, 0.35);
                }
                .auth-prompt-btn {
                    display: inline-flex; align-items: center; gap: 8px;
                    padding: 11px 22px; border-radius: 50px; font-family: 'Poppins', sans-serif;
                    font-size: 14px; font-weight: 600; text-decoration: none; cursor: pointer;
                    transition: all 0.2s;
                }
                .auth-prompt-btn:hover { transform: translateY(-1px); }
            `}</style>

            <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#fff', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <MessageCircle size={20} color="#ff8ab8" />
                Comments {comments.length > 0 && <span style={{ fontSize: '15px', fontWeight: 600, color: '#dfd2d9' }}>({comments.length})</span>}
            </h2>

            {/* Comment composer or auth prompt */}
            {userId ? (
                <form onSubmit={handlePost} style={{ marginTop: '24px', marginBottom: '32px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        <Avatar name={userName || 'You'} />
                        <div style={{ flex: 1 }}>
                            <textarea
                                ref={textareaRef}
                                className="comment-textarea"
                                placeholder="Share your thoughts…"
                                aria-label="Write a comment"
                                value={body}
                                onChange={e => {
                                    setBody(e.target.value);
                                    e.target.style.height = 'auto';
                                    e.target.style.height = `${Math.min(e.target.scrollHeight, 240)}px`;
                                }}
                                maxLength={1000}
                            />
                            {error && (
                                <p style={{ color: '#ff8ab8', fontSize: '13px', margin: '6px 0 0' }}>{error}</p>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                                <span style={{ fontSize: '12px', color: body.length > 900 ? '#ff8ab8' : '#dfd2d9' }}>
                                    {body.length}/1000
                                </span>
                                <button
                                    type="submit"
                                    disabled={loading || !body.trim()}
                                    className="btn-primary"
                                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px', fontSize: '13px', opacity: (loading || !body.trim()) ? 0.6 : 1, cursor: (loading || !body.trim()) ? 'not-allowed' : 'pointer' }}
                                >
                                    <Send size={14} />
                                    {loading ? 'Posting…' : 'Post Comment'}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            ) : (
                <div className="auth-prompt-card">
                    <div className="auth-prompt-icon-badge">
                        <MessageCircle size={24} color="#ff8ab8" />
                    </div>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: '0 0 8px' }}>
                        Join the conversation
                    </h3>
                    <p style={{ fontSize: '14px', color: '#e2d6dc', margin: '0 0 22px', lineHeight: 1.65 }}>
                        Sign in or create a free account to leave a comment.
                    </p>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link
                            href={`/sign-in?callbackUrl=${callbackUrl}`}
                            className="auth-prompt-btn"
                            style={{ background: 'rgba(255, 45, 120, 0.22)', border: '1px solid rgba(255, 138, 184, 0.55)', color: '#fff' }}
                        >
                            <LogIn size={16} color="#ff8ab8" /> Sign In
                        </Link>
                        <Link
                            href={`/sign-in?callbackUrl=${callbackUrl}&tab=signup`}
                            className="auth-prompt-btn"
                            style={{ background: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.16)', color: '#f4eef1' }}
                        >
                            <UserPlus size={16} color="#E2C286" /> Create Account
                        </Link>
                    </div>
                </div>
            )}

            {/* Comments list */}
            {fetching ? (
                <p style={{ color: '#dfd2d9', fontSize: '14px' }}>Loading comments…</p>
            ) : comments.length === 0 ? (
                <p style={{ color: '#dfd2d9', fontSize: '14px' }}>No comments yet. Be the first to share your thoughts!</p>
            ) : (
                <div>
                    {comments.map(c => (
                        <div key={c.id} className="comment-card">
                            <Avatar name={c.user.name} image={c.user.image} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>{c.user.name}</span>
                                    <span style={{ fontSize: '12px', color: '#dfd2d9' }}>{timeAgo(c.createdAt)}</span>
                                </div>
                                <p style={{ fontSize: '14px', color: '#e2d6dc', lineHeight: 1.65, margin: 0, overflowWrap: 'anywhere' }}>{c.body}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
