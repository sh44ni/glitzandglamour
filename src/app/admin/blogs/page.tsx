'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Save, Image as ImageIcon, ChevronLeft, Type, AlignLeft, Bold, Italic, Link as LinkIcon, List, Heading2, Tag, Check, Loader2, Globe, EyeOff, Search, Edit, Trash2, Plus, Eye, TrendingUp } from 'lucide-react';
import Link from 'next/link';

type Blog = {
    id: string;
    title: string;
    slug: string;
    published: boolean;
    views: number;
    createdAt: string;
};

export default function AdminBlogsPage() {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        try {
            const res = await fetch('/api/admin/blogs');
            const data = await res.json();
            if (data.blogs) setBlogs(data.blogs);
        } catch (error) {
            console.error('Failed to load blogs', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`Are you sure you want to permanently delete "${title}"?`)) return;
        try {
            const res = await fetch(`/api/admin/blogs/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setBlogs(prev => prev.filter(b => b.id !== id));
            }
        } catch (err) {
            alert('Error deleting post');
        }
    };

    const filteredBlogs = blogs.filter(b => b.title.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div style={{ padding: '0px 10px', fontFamily: 'Poppins, sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ color: '#fff', fontSize: '28px', fontWeight: 700, margin: '0 0 4px' }}>Blog Posts</h1>
                    <p style={{ color: '#888', fontSize: '14px', margin: 0 }}>Manage and write engaging SEO articles.</p>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <Link href="/admin/blogs/analytics" style={{ textDecoration: 'none' }}>
                        <button style={{
                            background: 'rgba(255,255,255,0.06)', color: '#fff', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px',
                            padding: '12px 16px', fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'
                        }}>
                            <TrendingUp size={18} /> Analytics
                        </button>
                    </Link>
                    <Link href="/admin/blogs/new" style={{ textDecoration: 'none' }}>
                        <button style={{
                            background: '#FF2D78', color: '#fff', border: 'none', borderRadius: '12px',
                            padding: '12px 20px', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'
                        }}>
                            <Plus size={18} /> Write Post
                        </button>
                    </Link>
                </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '24px' }}>
                <div style={{ position: 'relative', marginBottom: '24px' }}>
                    <Search size={18} color="#666" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input 
                        type="text" 
                        placeholder="Search blogs..." 
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        style={{ 
                            width: '100%', padding: '14px 14px 14px 44px', background: 'rgba(0,0,0,0.3)', 
                            border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', outline: 'none' 
                        }} 
                    />
                </div>

                {loading ? (
                    <div style={{ color: '#888', padding: '20px', textAlign: 'center' }}>Loading blogs...</div>
                ) : filteredBlogs.length === 0 ? (
                    <div style={{ color: '#888', padding: '40px 20px', textAlign: 'center' }}>No blogs found. Start writing!</div>
                ) : (
                    <div style={{ display: 'grid', gap: '12px' }}>
                        {filteredBlogs.map(blog => (
                            <div key={blog.id} style={{ 
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                background: 'rgba(0,0,0,0.3)', padding: '16px 20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)'
                            }}>
                                <div>
                                    <h3 style={{ color: '#fff', fontSize: '16px', fontWeight: 600, margin: '0 0 6px' }}>{blog.title}</h3>
                                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                        <span style={{ color: '#666', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            {blog.published ? <Globe size={12} color="#00D478" /> : <EyeOff size={12} color="#FFD166" />}
                                            {blog.published ? 'Published' : 'Draft'}
                                        </span>
                                        <span style={{ color: '#666', fontSize: '12px' }}>•</span>
                                        <span style={{ color: '#666', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Eye size={12} /> {blog.views} Views
                                        </span>
                                        <span style={{ color: '#666', fontSize: '12px' }}>•</span>
                                        <span style={{ color: '#666', fontSize: '12px' }}>/{blog.slug}</span>
                                        <span style={{ color: '#666', fontSize: '12px' }}>•</span>
                                        <span style={{ color: '#666', fontSize: '12px' }}>{new Date(blog.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <Link href={`/admin/blogs/${blog.id}`} style={{ textDecoration: 'none' }}>
                                        <button style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Edit size={14} /> Edit
                                        </button>
                                    </Link>
                                    <button onClick={() => handleDelete(blog.id, blog.title)} style={{ background: 'rgba(255,60,60,0.1)', border: 'none', color: '#ff4444', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Trash2 size={14} /> Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
