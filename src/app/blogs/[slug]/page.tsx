import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { Calendar, User, ChevronLeft } from 'lucide-react';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const blog = await prisma.blogPost.findUnique({ where: { slug } });
    if (!blog) return { title: 'Not Found' };

    return {
        title: `${blog.title} | Glitz & Glamour Blog`,
        description: blog.excerpt || `Read ${blog.title} on Glitz & Glamour Studio's beauty and styling blog.`,
        openGraph: {
            title: blog.title,
            description: blog.excerpt || '',
            type: 'article',
            publishedTime: blog.createdAt.toISOString(),
            authors: [blog.author],
            images: blog.coverImage ? [blog.coverImage] : [],
        }
    };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const blog = await prisma.blogPost.findUnique({ where: { slug } });
    if (!blog) return notFound();

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": blog.title,
        "image": blog.coverImage ? [blog.coverImage] : [],
        "datePublished": blog.createdAt.toISOString(),
        "dateModified": blog.updatedAt.toISOString(),
        "author": [{
            "@type": "Person",
            "name": blog.author
        }],
        "publisher": {
            "@type": "Organization",
            "name": "Glitz & Glamour Studio",
            "logo": {
                "@type": "ImageObject",
                "url": "https://glitzandglamours.com/favicon-glitz.png"
            }
        },
        "description": blog.excerpt
    };

    return (
        <div style={{ minHeight: '100vh', padding: '120px 20px 60px', fontFamily: 'Poppins, sans-serif' }}>
            {/* JSON-LD For Google Rich Snippets */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <article style={{ maxWidth: '800px', margin: '0 auto' }}>
                <Link href="/blogs" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#ff2d78', textDecoration: 'none', fontSize: '14px', fontWeight: 600, marginBottom: '32px' }}>
                    <ChevronLeft size={16} /> Back to Blog
                </Link>

                <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 800, color: '#fff', margin: '0 0 24px', lineHeight: 1.2 }}>
                    {blog.title}
                </h1>

                <div style={{ display: 'flex', gap: '24px', marginBottom: '40px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#aaa', fontSize: '14px' }}>
                        <User size={16} color="#FF2D78" /> By {blog.author}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#aaa', fontSize: '14px' }}>
                        <Calendar size={16} /> {new Date(blog.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                </div>

                {blog.coverImage && (
                    <div style={{ width: '100%', marginBottom: '40px', borderRadius: '24px', overflow: 'hidden' }}>
                        <img src={blog.coverImage} alt={blog.title} style={{ width: '100%', height: 'auto', display: 'block' }} />
                    </div>
                )}

                <div 
                    className="blog-content"
                    dangerouslySetInnerHTML={{ __html: blog.content }}
                />

                <style>{`
                    .blog-content {
                        font-size: 16px;
                        line-height: 1.8;
                        color: #ccc;
                    }
                    .blog-content h2 {
                        font-size: 28px;
                        fontWeight: 700;
                        color: #fff;
                        marginTop: 48px;
                        marginBottom: 24px;
                    }
                    .blog-content h3 {
                        font-size: 22px;
                        fontWeight: 600;
                        color: #eee;
                        marginTop: 32px;
                        marginBottom: 16px;
                    }
                    .blog-content p {
                        margin-bottom: 24px;
                    }
                    .blog-content a {
                        color: #FF2D78;
                        textDecoration: underline;
                    }
                    .blog-content ul {
                        margin-bottom: 24px;
                        padding-left: 24px;
                    }
                    .blog-content li {
                        margin-bottom: 8px;
                    }
                    .blog-content img {
                        max-width: 100%;
                        height: auto;
                        border-radius: 16px;
                        margin: 32px 0;
                    }
                `}</style>
            </article>
        </div>
    );
}
