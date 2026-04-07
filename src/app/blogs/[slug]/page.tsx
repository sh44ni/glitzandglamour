import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { Calendar, User, Clock, ChevronLeft, Eye, ArrowRight } from 'lucide-react';
import ViewTracker from './ViewTracker';
import CommentsSection from './CommentsSection';
import { auth } from '@/auth';
import { resolveImageUrl } from '@/lib/imageUrl';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const blog = await prisma.blogPost.findUnique({ where: { slug } });
    if (!blog) return { title: 'Not Found' };

    const coverUrl = blog.coverImage ? resolveImageUrl(blog.coverImage) : null;

    return {
        title: `${blog.title} | Glitz & Glamour Beauty Blog`,
        description: blog.excerpt || `Read ${blog.title} — beauty & nail tips from Glitz & Glamour Studio, Vista CA.`,
        keywords: `${blog.title}, beauty tips, nail art, salon blog, Glitz Glamour, JoJany`,
        alternates: {
            canonical: `https://glitzandglamours.com/blogs/${slug}`,
        },
        openGraph: {
            title: blog.title,
            description: blog.excerpt || '',
            type: 'article',
            publishedTime: blog.createdAt.toISOString(),
            modifiedTime: blog.updatedAt.toISOString(),
            authors: [blog.author],
            images: coverUrl ? [{ url: coverUrl, alt: blog.title }] : [],
            url: `https://glitzandglamours.com/blogs/${slug}`,
        },
        twitter: {
            card: 'summary_large_image',
            title: blog.title,
            description: blog.excerpt || '',
            images: coverUrl ? [coverUrl] : [],
        },
    };
}

/** Remove the first <img> from content HTML if it matches the cover image (avoids duplicate hero). */
function stripLeadingCoverImage(content: string, coverImage: string | null): string {
    if (!coverImage || !content) return content;
    const escaped = coverImage.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return content
        .replace(new RegExp(`<figure[^>]*>\\s*<img[^>]*src=["'][^"']*${escaped}[^"']*["'][^>]*>\\s*(<figcaption[^>]*>.*?</figcaption>\\s*)?</figure>`, 'i'), '')
        .replace(new RegExp(`<p[^>]*>\\s*<img[^>]*src=["'][^"']*${escaped}[^"']*["'][^>]*>\\s*</p>`, 'i'), '')
        .replace(new RegExp(`<img[^>]*src=["'][^"']*${escaped}[^"']*["'][^>]*>`, 'i'), '')
        .trimStart();
}

function estimateReadTime(content: string | null, excerpt: string | null): number {
    const text = content || excerpt || '';
    // Strip HTML tags for word count
    const plain = text.replace(/<[^>]+>/g, ' ').trim();
    const words = plain.split(/\s+/).filter(Boolean).length;
    return Math.max(2, Math.ceil(words / 200));
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const [blog, session] = await Promise.all([
        prisma.blogPost.findUnique({ where: { slug } }),
        auth(),
    ]);
    if (!blog) return notFound();

    const userId = (session?.user as { id?: string })?.id ?? null;
    const userName = session?.user?.name ?? null;
    const coverUrl = blog.coverImage ? resolveImageUrl(blog.coverImage) : null;
    const readTime = estimateReadTime(blog.content, blog.excerpt);

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: blog.title,
        image: coverUrl ? [coverUrl] : [],
        datePublished: blog.createdAt.toISOString(),
        dateModified: blog.updatedAt.toISOString(),
        author: [{ '@type': 'Person', name: blog.author }],
        publisher: {
            '@type': 'Organization',
            name: 'Glitz & Glamour Studio',
            logo: {
                '@type': 'ImageObject',
                url: 'https://glitzandglamours.com/favicon-glitz.png',
            },
        },
        description: blog.excerpt,
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `https://glitzandglamours.com/blogs/${slug}`,
        },
    };

    const breadcrumbJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://glitzandglamours.com' },
            { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://glitzandglamours.com/blogs' },
            { '@type': 'ListItem', position: 3, name: blog.title, item: `https://glitzandglamours.com/blogs/${slug}` },
        ],
    };

    return (
        <>
            <ViewTracker slug={slug} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

            <style>{`
                .post-page { min-height: 100vh; font-family: Poppins, sans-serif; }

                /* ── Hero ── */
                .post-hero {
                    position: relative;
                    width: 100%;
                    min-height: 480px;
                    display: flex;
                    align-items: flex-end;
                    overflow: hidden;
                    background: #0a0a0a;
                }
                .post-hero-bg {
                    position: absolute;
                    inset: 0;
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    opacity: 0.55;
                }
                .post-hero-gradient {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(to top, rgba(5,5,5,1) 0%, rgba(5,5,5,0.7) 40%, rgba(5,5,5,0.2) 100%);
                }
                .post-hero-no-img {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(135deg, rgba(255,45,120,0.08), rgba(121,40,202,0.06));
                }
                .post-hero-content {
                    position: relative;
                    z-index: 2;
                    width: 100%;
                    max-width: 860px;
                    margin: 0 auto;
                    padding: 120px 24px 48px;
                }
                .post-back-link {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    color: rgba(255,255,255,0.6);
                    text-decoration: none;
                    font-size: 13px;
                    font-weight: 500;
                    margin-bottom: 28px;
                    transition: color 0.2s;
                    padding: 8px 14px;
                    background: rgba(255,255,255,0.06);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 50px;
                    backdrop-filter: blur(8px);
                }
                .post-back-link:hover { color: #FF2D78; border-color: rgba(255,45,120,0.3); }

                .post-hero-title {
                    font-size: clamp(28px, 5vw, 50px);
                    font-weight: 900;
                    color: #fff;
                    line-height: 1.15;
                    letter-spacing: -0.5px;
                    margin: 0 0 20px;
                }
                .post-hero-meta {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    flex-wrap: wrap;
                }
                .post-hero-meta-item {
                    display: flex;
                    align-items: center;
                    gap: 7px;
                    font-size: 13px;
                    color: rgba(255,255,255,0.6);
                }
                .post-hero-author-avatar {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #FF2D78, #7928CA);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 11px;
                    font-weight: 800;
                    color: #fff;
                    flex-shrink: 0;
                }
                .post-read-time-pill {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    background: rgba(255,45,120,0.15);
                    border: 1px solid rgba(255,45,120,0.25);
                    color: #FF6BA8;
                    font-size: 11px;
                    font-weight: 700;
                    padding: 4px 12px;
                    border-radius: 50px;
                    letter-spacing: 0.3px;
                }
                .post-views-pill {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.08);
                    color: #888;
                    font-size: 11px;
                    font-weight: 600;
                    padding: 4px 12px;
                    border-radius: 50px;
                }

                /* ── Article Body ── */
                .post-body-wrap {
                    max-width: 860px;
                    margin: 0 auto;
                    padding: 56px 24px 80px;
                }

                /* ── Divider ── */
                .post-divider {
                    height: 1px;
                    background: linear-gradient(to right, rgba(255,45,120,0.3), transparent);
                    margin: 0 0 48px;
                }

                /* ── Blog Content ── */
                .blog-content {
                    font-size: 17px;
                    line-height: 1.85;
                    color: #ccc;
                }
                .blog-content h2 {
                    font-size: 28px;
                    font-weight: 800;
                    color: #fff;
                    margin: 52px 0 20px;
                    letter-spacing: -0.3px;
                    line-height: 1.2;
                }
                .blog-content h3 {
                    font-size: 21px;
                    font-weight: 700;
                    color: #eee;
                    margin: 36px 0 14px;
                }
                .blog-content h4 {
                    font-size: 17px;
                    font-weight: 700;
                    color: #ddd;
                    margin: 28px 0 10px;
                }
                .blog-content p {
                    margin-bottom: 26px;
                }
                .blog-content a {
                    color: #FF2D78;
                    text-decoration: underline;
                    text-underline-offset: 3px;
                }
                .blog-content a:hover { color: #FF6BA8; }
                .blog-content ul, .blog-content ol {
                    margin-bottom: 24px;
                    padding-left: 28px;
                }
                .blog-content li { margin-bottom: 10px; }
                .blog-content blockquote {
                    border-left: 3px solid #FF2D78;
                    margin: 32px 0;
                    padding: 16px 24px;
                    background: rgba(255,45,120,0.04);
                    border-radius: 0 12px 12px 0;
                    font-style: italic;
                    color: #bbb;
                }
                .blog-content img {
                    max-width: 100%;
                    height: auto;
                    border-radius: 20px;
                    margin: 36px 0;
                    display: block;
                    border: 1px solid rgba(255,255,255,0.06);
                }
                .blog-content code {
                    background: rgba(255,255,255,0.06);
                    padding: 2px 8px;
                    border-radius: 6px;
                    font-size: 14px;
                    color: #FF6BA8;
                }
                .blog-content pre {
                    background: rgba(255,255,255,0.04);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 14px;
                    padding: 20px 24px;
                    overflow-x: auto;
                    margin: 28px 0;
                }
                .blog-content strong { color: #fff; font-weight: 700; }
                .blog-content hr {
                    border: none;
                    height: 1px;
                    background: rgba(255,255,255,0.08);
                    margin: 40px 0;
                }

                /* ── CTA Strip ── */
                .post-cta-strip {
                    margin: 56px 0 0;
                    background: linear-gradient(135deg, rgba(255,45,120,0.08), rgba(121,40,202,0.06));
                    border: 1px solid rgba(255,45,120,0.2);
                    border-radius: 24px;
                    padding: 36px 32px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 24px;
                    flex-wrap: wrap;
                }
                .post-cta-text { flex: 1; min-width: 200px; }
                .post-cta-title { font-size: 20px; font-weight: 800; color: #fff; margin: 0 0 6px; }
                .post-cta-sub { font-size: 13px; color: #888; margin: 0; }

                @media (max-width: 640px) {
                    .post-hero-content { padding: 100px 16px 36px; }
                    .post-body-wrap { padding: 36px 16px 60px; }
                    .post-cta-strip { padding: 24px 20px; }
                    .blog-content { font-size: 15px; line-height: 1.75; }
                    .blog-content h2 { font-size: 22px; margin: 36px 0 14px; }
                    .blog-content h3 { font-size: 18px; }
                }
            `}</style>

            <div className="post-page">
                {/* ─── Hero ─── */}
                <header className="post-hero">
                    {coverUrl ? (
                        <img src={coverUrl} alt={blog.title} className="post-hero-bg" />
                    ) : (
                        <div className="post-hero-no-img" />
                    )}
                    <div className="post-hero-gradient" />
                    <div className="post-hero-content">
                        <Link href="/blogs" className="post-back-link no-press">
                            <ChevronLeft size={15} /> Back to Blog
                        </Link>

                        {blog.tags && (
                            <div style={{ marginBottom: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                {blog.tags.split(',').map((t: string) => t.trim()).filter(Boolean).map((tag: string) => (
                                    <span key={tag} style={{
                                        background: 'rgba(255,45,120,0.2)',
                                        border: '1px solid rgba(255,45,120,0.35)',
                                        color: '#FF6BA8',
                                        fontSize: '10px',
                                        fontWeight: 700,
                                        padding: '3px 10px',
                                        borderRadius: '50px',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                    }}>
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        <h1 className="post-hero-title">{blog.title}</h1>

                        <div className="post-hero-meta">
                            <span className="post-hero-meta-item">
                                <div className="post-hero-author-avatar">
                                    {blog.author.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()}
                                </div>
                                {blog.author}
                            </span>
                            <span className="post-hero-meta-item">
                                <Calendar size={14} />
                                {new Date(blog.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric', month: 'long', day: 'numeric'
                                })}
                            </span>
                            <span className="post-read-time-pill">
                                <Clock size={11} /> {readTime} min read
                            </span>
                            {(blog.views ?? 0) > 0 && (
                                <span className="post-views-pill">
                                    <Eye size={11} /> {blog.views} views
                                </span>
                            )}
                        </div>
                    </div>
                </header>

                {/* ─── Article Body ─── */}
                <div className="post-body-wrap">
                    <div className="post-divider" />

                    <article>
                        <div
                            className="blog-content"
                            dangerouslySetInnerHTML={{ __html: stripLeadingCoverImage(blog.content, blog.coverImage) }}
                        />
                    </article>

                    {/* ─── Book CTA ─── */}
                    <div className="post-cta-strip">
                        <div className="post-cta-text">
                            <p className="post-cta-title">Love what you're reading?</p>
                            <p className="post-cta-sub">Book an appointment and experience the Glitz & Glamour difference in person.</p>
                        </div>
                        <Link href="/book" className="btn-primary" style={{ flexShrink: 0 }}>
                            Book Now <ArrowRight size={15} />
                        </Link>
                    </div>

                    {/* ─── Comments ─── */}
                    <CommentsSection slug={slug} userId={userId} userName={userName} />
                </div>
            </div>
        </>
    );
}
