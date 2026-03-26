import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { ArrowRight, Calendar, User } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata = {
    title: 'Glitz & Glamour Blog | Tips, Trends & Updates',
    description: 'Read the latest beauty tutorials, nail trends, and salon updates from JoJany.',
};

export default async function BlogsIndexPage() {
    const blogs = await prisma.blogPost.findMany({
        where: { published: true },
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div style={{ minHeight: '100vh', padding: '120px 20px 60px', fontFamily: 'Poppins, sans-serif' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                
                <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                    <h1 style={{ color: '#fff', fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 800, margin: '0 0 16px' }}>
                        The <span style={{ color: '#FF2D78' }}>Glamour</span> Blog
                    </h1>
                    <p style={{ color: '#aaa', fontSize: '16px', maxWidth: '600px', margin: '0 auto' }}>
                        Expert tips, latest nail trends, and inside looks at Glitz & Glamour Studio.
                    </p>
                </div>

                {blogs.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <p style={{ color: '#888' }}>Check back soon for new articles!</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '32px' }}>
                        {blogs.map(blog => (
                            <Link key={blog.id} href={`/blogs/${blog.slug}`} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', overflow: 'hidden', transition: 'transform 0.3s, border-color 0.3s' }} className="blog-card">
                                {blog.coverImage ? (
                                    <div style={{ width: '100%', aspectRatio: '16/10', overflow: 'hidden' }}>
                                        <img src={blog.coverImage} alt={blog.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                ) : (
                                    <div style={{ width: '100%', aspectRatio: '16/10', background: 'linear-gradient(135deg, rgba(255,45,120,0.1), rgba(0,0,0,0.5))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <span style={{ color: '#FF2D78', opacity: 0.5, fontWeight: 700, fontSize: '24px' }}>G&G</span>
                                    </div>
                                )}
                                
                                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                                    <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                                        <span style={{ fontSize: '12px', color: '#888', display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={12} /> {new Date(blog.createdAt).toLocaleDateString()}</span>
                                        <span style={{ fontSize: '12px', color: '#888', display: 'flex', alignItems: 'center', gap: '6px' }}><User size={12} /> {blog.author}</span>
                                    </div>
                                    <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#fff', margin: '0 0 12px', lineHeight: 1.3 }}>{blog.title}</h2>
                                    <p style={{ fontSize: '14px', color: '#aaa', margin: '0 0 24px', lineHeight: 1.6, flex: 1 }}>{blog.excerpt}</p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#FF2D78', fontSize: '14px', fontWeight: 600 }}>
                                        Read Article <ArrowRight size={16} />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
                <style>{`
                    .blog-card:hover { transform: translateY(-4px); border-color: rgba(255,45,120,0.3) !important; }
                `}</style>
            </div>
        </div>
    );
}
