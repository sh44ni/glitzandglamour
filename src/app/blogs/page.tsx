import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { ArrowRight, Calendar, User, Clock, Rss } from 'lucide-react';
import { resolveImageUrl } from '@/lib/imageUrl';
import type { Metadata } from 'next';
import BlogsClient from './BlogsClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Beauty Blog | Tips, Trends & Nail Art | Glitz & Glamour Studio',
    description:
        'Explore expert beauty tutorials, nail trend guides, hair care tips, and inside looks at Glitz & Glamour Studio in Vista & San Marcos, CA. Written by JoJany.',
    keywords: 'beauty blog, nail trends, nail art tips, hair care, balayage, gel nails, Vista CA salon blog, JoJany tips',
    alternates: {
        canonical: 'https://glitzandglamours.com/blogs',
    },
    openGraph: {
        title: 'Beauty Blog | Glitz & Glamour Studio',
        description: 'Expert beauty tutorials, nail trends, and salon updates from JoJany.',
        type: 'website',
        url: 'https://glitzandglamours.com/blogs',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Beauty Blog | Glitz & Glamour Studio',
        description: 'Expert beauty tutorials, nail trends, and salon updates from JoJany.',
    },
};

function estimateReadTime(excerpt: string | null, content?: string | null): number {
    const text = excerpt || content || '';
    const words = text.trim().split(/\s+/).length;
    return Math.max(2, Math.ceil(words / 200));
}

export default async function BlogsIndexPage() {
    const blogs = await (prisma as any).blogPost.findMany({
        where: { published: true },
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            slug: true,
            title: true,
            excerpt: true,
            coverImage: true,
            author: true,
            createdAt: true,
            tags: true,
            viewCount: true,
        },
    });

    const featured = blogs[0] ?? null;
    const restBlogs = blogs.slice(1);

    const featuredCoverUrl = featured?.coverImage
        ? resolveImageUrl(featured.coverImage)
        : null;

    // JSON-LD: Blog Listing (ItemList) for Google
    const itemListJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'Glitz & Glamour Beauty Blog',
        description: 'Expert beauty tutorials, nail trends, and salon updates.',
        url: 'https://glitzandglamours.com/blogs',
        numberOfItems: blogs.length,
        itemListElement: blogs.slice(0, 10).map((b: any, i: number) => ({
            '@type': 'ListItem',
            position: i + 1,
            url: `https://glitzandglamours.com/blogs/${b.slug}`,
            name: b.title,
        })),
    };

    // JSON-LD: BreadcrumbList
    const breadcrumbJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://glitzandglamours.com' },
            { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://glitzandglamours.com/blogs' },
        ],
    };

    // Serialise blog data for client component (dates → strings)
    const clientBlogs = blogs.map((b: any) => ({
        ...b,
        createdAt: b.createdAt instanceof Date ? b.createdAt.toISOString() : b.createdAt,
        coverImage: b.coverImage ? (resolveImageUrl(b.coverImage) ?? null) : null,
    }));

    const featuredClientBlog = featured
        ? {
            ...featured,
            createdAt: featured.createdAt instanceof Date ? featured.createdAt.toISOString() : featured.createdAt,
            coverImage: featuredCoverUrl ?? null,
        }
        : null;

    return (
        <>
            {/* ─── JSON-LD Structured Data ─── */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
            />

            <style>{`
                /* ─── Page Shell ─── */
                .blogs-page {
                    min-height: 100vh;
                    padding-top: 90px;
                    padding-bottom: 80px;
                    font-family: Poppins, sans-serif;
                }

                /* ─── Hero ─── */
                .blogs-hero {
                    position: relative;
                    width: 100%;
                    max-width: 1200px;
                    margin: 0 auto 72px;
                    padding: 0 24px;
                }
                .blogs-hero-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    background: rgba(255,45,120,0.12);
                    border: 1px solid rgba(255,45,120,0.25);
                    border-radius: 50px;
                    padding: 5px 14px;
                    font-size: 11px;
                    font-weight: 700;
                    color: #FF2D78;
                    letter-spacing: 1px;
                    text-transform: uppercase;
                    margin-bottom: 22px;
                }
                .blogs-hero-heading {
                    font-size: clamp(36px, 6vw, 62px);
                    font-weight: 900;
                    color: #fff;
                    line-height: 1.05;
                    letter-spacing: -1.5px;
                    margin: 0 0 16px;
                }
                .blogs-hero-heading .grad {
                    background: linear-gradient(135deg, #FF2D78 0%, #FF6BA8 50%, #B76E79 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }
                .blogs-hero-sub {
                    font-size: 16px;
                    color: #999;
                    max-width: 540px;
                    line-height: 1.7;
                    margin: 0 0 48px;
                }

                /* ─── Featured Card ─── */
                .featured-card {
                    position: relative;
                    border-radius: 32px;
                    overflow: hidden;
                    min-height: 440px;
                    display: flex;
                    align-items: flex-end;
                    background: linear-gradient(135deg, rgba(255,45,120,0.1), rgba(0,0,0,0.8));
                    border: 1px solid rgba(255,255,255,0.08);
                    text-decoration: none;
                    transition: transform 0.4s cubic-bezier(0.4,0,0.2,1), box-shadow 0.4s;
                    will-change: transform;
                }
                .featured-card:hover {
                    transform: scale(1.01);
                    box-shadow: 0 32px 80px -16px rgba(255,45,120,0.3);
                }
                .featured-card-bg {
                    position: absolute;
                    inset: 0;
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    z-index: 0;
                    transition: transform 0.6s ease;
                }
                .featured-card:hover .featured-card-bg {
                    transform: scale(1.05);
                }
                .featured-card-gradient {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(to top, rgba(5,5,5,0.95) 0%, rgba(5,5,5,0.6) 40%, rgba(5,5,5,0.1) 100%);
                    z-index: 1;
                }
                .featured-card-content {
                    position: relative;
                    z-index: 2;
                    padding: 40px 44px;
                    width: 100%;
                }
                .featured-chip {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    background: linear-gradient(135deg, #FF2D78, #CC1E5A);
                    color: #fff;
                    font-size: 10px;
                    font-weight: 800;
                    padding: 5px 14px;
                    border-radius: 50px;
                    letter-spacing: 1.5px;
                    text-transform: uppercase;
                    margin-bottom: 16px;
                    box-shadow: 0 4px 18px rgba(255,45,120,0.4);
                }
                .featured-title {
                    font-size: clamp(22px, 3.5vw, 38px);
                    font-weight: 800;
                    color: #fff;
                    line-height: 1.2;
                    margin: 0 0 12px;
                    max-width: 680px;
                }
                .featured-excerpt {
                    font-size: 14px;
                    color: rgba(255,255,255,0.65);
                    line-height: 1.65;
                    max-width: 560px;
                    margin: 0 0 24px;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                .featured-meta {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    flex-wrap: wrap;
                }
                .featured-meta-item {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 13px;
                    color: rgba(255,255,255,0.55);
                }
                .featured-cta {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    background: rgba(255,255,255,0.1);
                    backdrop-filter: blur(8px);
                    border: 1px solid rgba(255,255,255,0.2);
                    color: #fff;
                    font-family: Poppins, sans-serif;
                    font-size: 13px;
                    font-weight: 700;
                    padding: 10px 20px;
                    border-radius: 50px;
                    margin-left: auto;
                    transition: background 0.2s, border-color 0.2s;
                    white-space: nowrap;
                }
                .featured-card:hover .featured-cta {
                    background: rgba(255,45,120,0.3);
                    border-color: rgba(255,45,120,0.5);
                }

                /* ─── Section Divider ─── */
                .blogs-section {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 24px;
                }
                .blogs-section-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 36px;
                    flex-wrap: wrap;
                    gap: 16px;
                }
                .blogs-section-title {
                    font-size: 24px;
                    font-weight: 800;
                    color: #fff;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .blogs-section-line {
                    flex: 1;
                    height: 1px;
                    background: linear-gradient(to right, rgba(255,45,120,0.3), transparent);
                    margin-left: 16px;
                }
                .blogs-count-badge {
                    font-size: 11px;
                    font-weight: 600;
                    color: #FF2D78;
                    background: rgba(255,45,120,0.1);
                    border: 1px solid rgba(255,45,120,0.2);
                    padding: 4px 10px;
                    border-radius: 50px;
                }

                /* ─── Newsletter CTA ─── */
                .blog-newsletter {
                    max-width: 1200px;
                    margin: 72px auto 0;
                    padding: 0 24px;
                }
                .blog-newsletter-card {
                    background: linear-gradient(135deg, rgba(255,45,120,0.08) 0%, rgba(121,40,202,0.06) 100%);
                    border: 1px solid rgba(255,45,120,0.2);
                    border-radius: 28px;
                    padding: 48px 40px;
                    text-align: center;
                    position: relative;
                    overflow: hidden;
                }
                .blog-newsletter-card::before {
                    content: '';
                    position: absolute;
                    top: -80px;
                    right: -80px;
                    width: 240px;
                    height: 240px;
                    background: radial-gradient(circle, rgba(255,45,120,0.15) 0%, transparent 70%);
                    pointer-events: none;
                }
                .blog-newsletter-icon {
                    font-size: 40px;
                    margin-bottom: 16px;
                }
                .blog-newsletter-title {
                    font-size: 28px;
                    font-weight: 800;
                    color: #fff;
                    margin: 0 0 10px;
                }
                .blog-newsletter-sub {
                    font-size: 14px;
                    color: #888;
                    max-width: 420px;
                    margin: 0 auto 28px;
                    line-height: 1.7;
                }

                /* ─── Breadcrumb ─── */
                .blogs-breadcrumb {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 12px;
                    color: #555;
                    margin-bottom: 40px;
                    padding: 0 24px;
                    max-width: 1200px;
                    margin-left: auto;
                    margin-right: auto;
                }
                .blogs-breadcrumb a {
                    color: #777;
                    text-decoration: none;
                    transition: color 0.2s;
                }
                .blogs-breadcrumb a:hover { color: #FF2D78; }
                .blogs-breadcrumb-sep { color: #333; }
                .blogs-breadcrumb-current { color: #FF2D78; font-weight: 600; }

                @media (max-width: 640px) {
                    .featured-card-content { padding: 24px 20px; }
                    .blogs-hero { padding: 0 16px; }
                    .blogs-section { padding: 0 16px; }
                    .blog-newsletter { padding: 0 16px; }
                    .blog-newsletter-card { padding: 32px 20px; }
                    .blogs-breadcrumb { padding: 0 16px; }
                    .featured-meta { gap: 8px; }
                    .featured-cta { display: none; }
                }
            `}</style>

            <div className="blogs-page">
                {/* Breadcrumb (SEO) */}
                <nav className="blogs-breadcrumb" aria-label="Breadcrumb">
                    <Link href="/">Home</Link>
                    <span className="blogs-breadcrumb-sep">›</span>
                    <span className="blogs-breadcrumb-current">Blog</span>
                </nav>

                {/* ─── HERO HEADER ─── */}
                <div className="blogs-hero" style={{ marginBottom: featured ? '40px' : '72px' }}>
                    <span className="blogs-hero-badge">
                        <Rss size={10} /> Beauty Journal
                    </span>
                    <h1 className="blogs-hero-heading">
                        The <span className="grad">Glamour</span><br />Blog
                    </h1>
                    <p className="blogs-hero-sub">
                        Expert nail tutorials, the freshest beauty trends, hair care secrets, and exclusive behind-the-scenes from our Vista studio.
                    </p>

                    {/* ─── FEATURED LATEST POST ─── */}
                    {featuredClientBlog && (
                        <Link
                            href={`/blogs/${featuredClientBlog.slug}`}
                            className="featured-card no-press"
                            aria-label={`Featured: ${featuredClientBlog.title}`}
                        >
                            {featuredClientBlog.coverImage ? (
                                <img
                                    src={featuredClientBlog.coverImage}
                                    alt={featuredClientBlog.title}
                                    className="featured-card-bg"
                                />
                            ) : (
                                <div style={{
                                    position: 'absolute', inset: 0, zIndex: 0,
                                    background: 'linear-gradient(135deg, rgba(255,45,120,0.12) 0%, rgba(121,40,202,0.12) 100%)'
                                }} />
                            )}
                            <div className="featured-card-gradient" />
                            <div className="featured-card-content">
                                <div className="featured-chip">✦ Latest Article</div>
                                <h2 className="featured-title">{featuredClientBlog.title}</h2>
                                {featuredClientBlog.excerpt && (
                                    <p className="featured-excerpt">{featuredClientBlog.excerpt}</p>
                                )}
                                <div className="featured-meta">
                                    <span className="featured-meta-item">
                                        <User size={13} /> {featuredClientBlog.author}
                                    </span>
                                    <span className="featured-meta-item">
                                        <Calendar size={13} />
                                        {new Date(featuredClientBlog.createdAt).toLocaleDateString('en-US', {
                                            month: 'long', day: 'numeric', year: 'numeric'
                                        })}
                                    </span>
                                    <span className="featured-meta-item">
                                        <Clock size={13} />
                                        {estimateReadTime(featuredClientBlog.excerpt)} min read
                                    </span>
                                    <span className="featured-cta">
                                        Read Now <ArrowRight size={14} />
                                    </span>
                                </div>
                            </div>
                        </Link>
                    )}
                </div>

                {/* ─── ALL POSTS SECTION ─── */}
                {blogs.length > 0 && (
                    <section className="blogs-section" aria-label="All blog posts">
                        <div className="blogs-section-header">
                            <h2 className="blogs-section-title">
                                All Articles
                                <div className="blogs-section-line" />
                            </h2>
                            <span className="blogs-count-badge">{blogs.length} posts</span>
                        </div>

                        {/* Client component handles search + tag filtering */}
                        <BlogsClient blogs={clientBlogs} />
                    </section>
                )}

                {/* ─── EMPTY STATE ─── */}
                {blogs.length === 0 && (
                    <div style={{
                        maxWidth: '600px', margin: '0 auto', textAlign: 'center',
                        padding: '80px 24px',
                        background: 'rgba(255,255,255,0.02)',
                        borderRadius: '28px',
                        border: '1px solid rgba(255,255,255,0.05)'
                    }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>✍️</div>
                        <p style={{ color: '#888', fontSize: '16px' }}>Our first article is coming soon — check back shortly!</p>
                    </div>
                )}

                {/* ─── NEWSLETTER CTA ─── */}
                <div className="blog-newsletter">
                    <div className="blog-newsletter-card">
                        <div className="blog-newsletter-icon">💌</div>
                        <h2 className="blog-newsletter-title">Never Miss a Trend</h2>
                        <p className="blog-newsletter-sub">
                            Book an appointment and stay in the loop with our latest beauty tips and exclusive studio offers.
                        </p>
                        <Link href="/book" className="btn-primary" style={{ display: 'inline-flex' }}>
                            Book Your Appointment <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
