import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { ArrowRight, Calendar, User, Clock, Rss, Sparkles, PenTool, Mail } from 'lucide-react';
import { resolveImageUrl } from '@/lib/imageUrl';
import type { Metadata } from 'next';
import BlogsClient from './BlogsClient';
import FeaturedImage from './FeaturedImage';
import { FALLBACK_BLOGS } from '@/data/fallbackBlogs';

export const revalidate = 3600;

export const metadata: Metadata = {
    title: 'Beauty, Nail & Hair Blog | San Marcos & Vista | Glitz CA',
    description:
        'Explore 2026 nail trends, Gel-X vs. acrylic guides, balayage prices, and bridal beauty tips from Glitz & Glamour Studio in San Marcos & Vista, CA.',
    keywords: 'beauty blog, nail trends San Marcos, Gel-X vs acrylics, balayage price San Marcos, bridal hair makeup San Diego, Vista CA salon blog, JoJany Lavalle',
    alternates: {
        canonical: 'https://www.glitzandglamours.com/blogs',
    },
    openGraph: {
        title: 'Beauty, Nail & Hair Blog | San Marcos & Vista | Glitz CA',
        description:
            'Explore 2026 nail trends, Gel-X vs. acrylic guides, balayage prices, and bridal beauty tips from Glitz & Glamour Studio in San Marcos & Vista, CA.',
        type: 'website',
        url: 'https://www.glitzandglamours.com/blogs',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Beauty, Nail & Hair Blog | San Marcos & Vista | Glitz CA',
        description:
            'Explore 2026 nail trends, Gel-X vs. acrylic guides, balayage prices, and bridal beauty tips from Glitz & Glamour Studio in San Marcos & Vista, CA.',
    },
};

function estimateReadTime(excerpt: string | null, content?: string | null): number {
    const text = excerpt || content || '';
    const words = text.trim().split(/\s+/).length;
    return Math.max(2, Math.ceil(words / 200));
}

export default async function BlogsIndexPage() {
    const blogs = await prisma.blogPost.findMany({
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
            views: true,
            tags: true,
        },
    }).catch(() => []);

    const allBlogs = blogs.map((b) => {
        const fb = FALLBACK_BLOGS[b.slug];
        return fb
            ? {
                  ...b,
                  title: fb.title,
                  excerpt: fb.excerpt,
                  coverImage: fb.coverImage || b.coverImage,
                  tags: b.tags || fb.tags,
              }
            : b;
    });

    for (const fb of Object.values(FALLBACK_BLOGS)) {
        if (!allBlogs.some((b) => b.slug === fb.slug)) {
            allBlogs.push({
                id: fb.id,
                slug: fb.slug,
                title: fb.title,
                excerpt: fb.excerpt,
                coverImage: fb.coverImage,
                author: fb.author,
                createdAt: fb.createdAt,
                views: fb.views,
                tags: fb.tags,
            });
        }
    }

    allBlogs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const featured = allBlogs[0] ?? null;
    const restBlogs = allBlogs.slice(1);

    const featuredCoverUrl = featured?.coverImage
        ? resolveImageUrl(featured.coverImage)
        : null;

    // JSON-LD: Blog Listing (ItemList) for Google
    const itemListJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'Glitz & Glamour Beauty Blog',
        description: 'Expert beauty tutorials, nail trends, hair color guides, and bridal tips in San Marcos & Vista, CA.',
        url: 'https://www.glitzandglamours.com/blogs',
        numberOfItems: allBlogs.length,
        itemListElement: allBlogs.slice(0, 12).map((b: any, i: number) => ({
            '@type': 'ListItem',
            position: i + 1,
            url: `https://www.glitzandglamours.com/blogs/${b.slug}`,
            name: b.title,
        })),
    };

    // JSON-LD: BreadcrumbList
    const breadcrumbJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.glitzandglamours.com' },
            { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://www.glitzandglamours.com/blogs' },
        ],
    };

    // Serialise blog data for client component (dates → strings)
    const clientBlogs = allBlogs.map((b: any) => ({
        id: b.id,
        slug: b.slug,
        title: b.title,
        excerpt: b.excerpt ?? null,
        coverImage: b.coverImage ? (resolveImageUrl(b.coverImage) ?? null) : null,
        author: b.author,
        createdAt: b.createdAt instanceof Date ? b.createdAt.toISOString() : b.createdAt,
        viewCount: b.views ?? 0,
        tags: b.tags ?? null,
    }));

    const featuredClientBlog = featured
        ? {
            id: featured.id,
            slug: featured.slug,
            title: featured.title,
            excerpt: featured.excerpt ?? null,
            coverImage: featuredCoverUrl ?? null,
            author: featured.author,
            createdAt: featured.createdAt instanceof Date ? featured.createdAt.toISOString() : featured.createdAt,
            viewCount: featured.views ?? 0,
            tags: featured.tags ?? null,
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
                    padding-bottom: 88px;
                    font-family: 'Poppins', sans-serif;
                    overflow-x: hidden;
                }

                /* ─── Breadcrumb ─── */
                .blogs-breadcrumb {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 12px;
                    color: #dfd2d9;
                    margin-bottom: 36px;
                    padding: 0 24px;
                    max-width: 1200px;
                    margin-left: auto;
                    margin-right: auto;
                }
                .blogs-breadcrumb a {
                    color: #dfd2d9;
                    text-decoration: none;
                    transition: color 0.2s;
                }
                .blogs-breadcrumb a:hover { color: #ff8ab8; }
                .blogs-breadcrumb-sep { color: #c8b8c2; }
                .blogs-breadcrumb-current { color: #ff8ab8; font-weight: 600; }

                /* ─── Hero ─── */
                .blogs-hero {
                    position: relative;
                    width: 100%;
                    max-width: 1200px;
                    margin: 0 auto 72px;
                    padding: 0 24px;
                }
                .blogs-hero-header-panel {
                    position: relative;
                    background: linear-gradient(155deg, rgba(32, 15, 26, 0.92), rgba(14, 7, 12, 0.96));
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 28px;
                    padding: 44px 44px 40px;
                    margin-bottom: 36px;
                    overflow: hidden;
                    box-shadow: 0 24px 64px rgba(0, 0, 0, 0.45);
                }
                .blogs-hero-header-panel::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 8%;
                    right: 8%;
                    height: 1px;
                    background: linear-gradient(90deg, transparent, rgba(255, 138, 184, 0.65), rgba(226, 194, 134, 0.55), transparent);
                    pointer-events: none;
                }
                .blogs-hero-header-panel::after {
                    content: '';
                    position: absolute;
                    top: -90px;
                    right: -90px;
                    width: 280px;
                    height: 280px;
                    background: radial-gradient(circle, rgba(255, 45, 120, 0.16) 0%, transparent 70%);
                    pointer-events: none;
                }
                .blogs-hero-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 7px;
                    background: rgba(255, 45, 120, 0.14);
                    border: 1px solid rgba(255, 138, 184, 0.35);
                    border-radius: 50px;
                    padding: 6px 15px;
                    font-size: 11px;
                    font-weight: 700;
                    color: #ff8ab8;
                    letter-spacing: 1.2px;
                    text-transform: uppercase;
                    margin-bottom: 20px;
                }
                .blogs-hero-heading {
                    font-family: 'Poppins', sans-serif;
                    font-size: clamp(34px, 5.5vw, 58px);
                    font-weight: 900;
                    color: #fff;
                    line-height: 1.06;
                    letter-spacing: -1.4px;
                    margin: 0 0 16px;
                }
                .blogs-hero-heading .grad {
                    background: linear-gradient(135deg, #ff8ab8 0%, #FF2D78 52%, #E2C286 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }
                .blogs-hero-sub {
                    font-size: 16px;
                    color: #e2d6dc;
                    max-width: 600px;
                    line-height: 1.72;
                    margin: 0;
                }

                /* ─── Featured Card ─── */
                .featured-card {
                    position: relative;
                    border-radius: 28px;
                    overflow: hidden;
                    min-height: 440px;
                    display: flex;
                    align-items: flex-end;
                    background: linear-gradient(155deg, rgba(32, 15, 26, 0.92), rgba(14, 7, 12, 0.96));
                    border: 1px solid rgba(255, 255, 255, 0.12);
                    text-decoration: none;
                    transition: transform 0.38s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.38s, border-color 0.38s;
                    box-shadow: 0 24px 64px rgba(0, 0, 0, 0.5);
                }
                .featured-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 6%;
                    right: 6%;
                    height: 1px;
                    background: linear-gradient(90deg, transparent, rgba(255, 138, 184, 0.7), rgba(226, 194, 134, 0.5), transparent);
                    z-index: 3;
                    pointer-events: none;
                }
                .featured-card:hover {
                    transform: translateY(-4px);
                    border-color: rgba(255, 138, 184, 0.4);
                    box-shadow: 0 32px 80px -16px rgba(255, 45, 120, 0.28);
                }
                .featured-card-bg {
                    position: absolute;
                    top: 24px;
                    right: 24px;
                    width: 140px;
                    height: 92px;
                    border-radius: 16px;
                    border: 1px solid rgba(255, 138, 184, 0.35);
                    object-fit: cover;
                    z-index: 2;
                    transition: transform 0.6s ease;
                }
                .featured-card:hover .featured-card-bg {
                    transform: scale(1.04);
                }
                .featured-card-gradient {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(
                        to top,
                        rgba(10, 5, 9, 0.97) 0%,
                        rgba(14, 7, 12, 0.84) 48%,
                        rgba(14, 7, 12, 0.32) 100%
                    );
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
                    background: rgba(14, 7, 12, 0.88);
                    border: 1px solid rgba(226, 194, 134, 0.55);
                    color: #E2C286;
                    font-size: 11px;
                    font-weight: 700;
                    padding: 6px 14px;
                    border-radius: 50px;
                    letter-spacing: 1.3px;
                    text-transform: uppercase;
                    margin-bottom: 16px;
                    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45);
                }
                .featured-title {
                    font-family: 'Poppins', sans-serif;
                    font-size: clamp(22px, 3.5vw, 36px);
                    font-weight: 800;
                    color: #fff;
                    line-height: 1.2;
                    margin: 0 0 12px;
                    max-width: 720px;
                }
                .featured-excerpt {
                    font-size: 15px;
                    color: #e2d6dc;
                    line-height: 1.68;
                    max-width: 620px;
                    margin: 0 0 24px;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                .featured-meta {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    flex-wrap: wrap;
                }
                .featured-meta-item {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 13px;
                    color: #dfd2d9;
                }
                .featured-cta {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    background: rgba(255, 45, 120, 0.18);
                    backdrop-filter: blur(8px);
                    border: 1px solid rgba(255, 138, 184, 0.45);
                    color: #fff;
                    font-family: 'Poppins', sans-serif;
                    font-size: 13px;
                    font-weight: 700;
                    padding: 10px 22px;
                    border-radius: 50px;
                    margin-left: auto;
                    transition: background 0.25s, border-color 0.25s, transform 0.25s;
                    white-space: nowrap;
                }
                .featured-card:hover .featured-cta {
                    background: rgba(255, 45, 120, 0.32);
                    border-color: #ff8ab8;
                    transform: translateX(2px);
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
                    margin-bottom: 32px;
                    flex-wrap: wrap;
                    gap: 16px;
                }
                .blogs-section-title {
                    font-family: 'Poppins', sans-serif;
                    font-size: 24px;
                    font-weight: 800;
                    color: #fff;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin: 0;
                    flex: 1;
                }
                .blogs-section-line {
                    flex: 1;
                    height: 1px;
                    background: linear-gradient(to right, rgba(255, 138, 184, 0.35), rgba(226, 194, 134, 0.2), transparent);
                    margin-left: 16px;
                }
                .blogs-count-badge {
                    font-size: 12px;
                    font-weight: 700;
                    color: #ff8ab8;
                    background: rgba(255, 45, 120, 0.14);
                    border: 1px solid rgba(255, 138, 184, 0.32);
                    padding: 5px 14px;
                    border-radius: 50px;
                }

                /* ─── Empty State ─── */
                .blogs-index-empty {
                    max-width: 600px;
                    margin: 0 auto;
                    text-align: center;
                    padding: 72px 24px;
                    background: linear-gradient(155deg, rgba(32, 15, 26, 0.92), rgba(14, 7, 12, 0.96));
                    border-radius: 28px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }
                .blogs-index-empty-badge {
                    width: 64px;
                    height: 64px;
                    border-radius: 50%;
                    margin: 0 auto 18px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(255, 45, 120, 0.14);
                    border: 1px solid rgba(255, 138, 184, 0.35);
                }

                /* ─── Newsletter CTA ─── */
                .blog-newsletter {
                    max-width: 1200px;
                    margin: 72px auto 0;
                    padding: 0 24px;
                }
                .blog-newsletter-card {
                    background: linear-gradient(155deg, rgba(32, 15, 26, 0.92), rgba(14, 7, 12, 0.96));
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 28px;
                    padding: 52px 40px;
                    text-align: center;
                    position: relative;
                    overflow: hidden;
                    box-shadow: 0 24px 64px rgba(0, 0, 0, 0.45);
                }
                .blog-newsletter-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 10%;
                    right: 10%;
                    height: 1px;
                    background: linear-gradient(90deg, transparent, rgba(255, 138, 184, 0.65), rgba(226, 194, 134, 0.55), transparent);
                    pointer-events: none;
                }
                .blog-newsletter-card::after {
                    content: '';
                    position: absolute;
                    top: -80px;
                    right: -80px;
                    width: 240px;
                    height: 240px;
                    background: radial-gradient(circle, rgba(255, 45, 120, 0.16) 0%, transparent 70%);
                    pointer-events: none;
                }
                .blog-newsletter-icon {
                    width: 58px;
                    height: 58px;
                    border-radius: 50%;
                    margin: 0 auto 18px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(255, 45, 120, 0.14);
                    border: 1px solid rgba(255, 138, 184, 0.38);
                }
                .blog-newsletter-title {
                    font-family: 'Poppins', sans-serif;
                    font-size: clamp(24px, 3.5vw, 30px);
                    font-weight: 800;
                    color: #fff;
                    margin: 0 0 12px;
                }
                .blog-newsletter-sub {
                    font-size: 15px;
                    color: #e2d6dc;
                    max-width: 460px;
                    margin: 0 auto 28px;
                    line-height: 1.7;
                }

                @media (max-width: 640px) {
                    .blogs-hero-header-panel { padding: 28px 20px; border-radius: 22px; }
                    .featured-card-content { padding: 26px 20px; }
                    .blogs-hero { padding: 0 16px; }
                    .blogs-section { padding: 0 16px; }
                    .blog-newsletter { padding: 0 16px; }
                    .blog-newsletter-card { padding: 36px 20px; border-radius: 22px; }
                    .blogs-breadcrumb { padding: 0 16px; margin-bottom: 24px; }
                    .featured-meta { gap: 10px; }
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
                <div className="blogs-hero" style={{ marginBottom: featured ? '48px' : '72px' }}>
                    <div className="blogs-hero-header-panel">
                        <span className="blogs-hero-badge">
                            <Rss size={11} /> Beauty Journal
                        </span>
                        <h1 className="blogs-hero-heading">
                            The <span className="grad">Glamour</span><br />Blog
                        </h1>
                        <p className="blogs-hero-sub">
                            Expert nail tutorials, the freshest beauty trends, hair care secrets, and exclusive behind-the-scenes from our San Marcos &amp; Vista studio.
                        </p>
                    </div>

                    {/* ─── FEATURED LATEST POST ─── */}
                    {featuredClientBlog && (
                        <Link
                            href={`/blogs/${featuredClientBlog.slug}`}
                            className="featured-card no-press"
                        >
                            {featuredClientBlog.coverImage ? (
                                <FeaturedImage
                                    src={featuredClientBlog.coverImage}
                                    alt={featuredClientBlog.title}
                                />
                            ) : (
                                <div style={{
                                    position: 'absolute', inset: 0, zIndex: 0,
                                    background: 'linear-gradient(155deg, rgba(32, 15, 26, 0.92), rgba(14, 7, 12, 0.96))'
                                }} />
                            )}
                            <div className="featured-card-gradient" />
                            <div className="featured-card-content">
                                <div className="featured-chip">
                                    <Sparkles size={12} /> Latest Article
                                </div>
                                <h2 className="featured-title">{featuredClientBlog.title}</h2>
                                {featuredClientBlog.excerpt && (
                                    <p className="featured-excerpt">{featuredClientBlog.excerpt}</p>
                                )}
                                <div className="featured-meta">
                                    <span className="featured-meta-item">
                                        <User size={13} color="#ff8ab8" /> {featuredClientBlog.author}
                                    </span>
                                    <span className="featured-meta-item">
                                        <Calendar size={13} color="#ff8ab8" />
                                        {new Date(featuredClientBlog.createdAt).toLocaleDateString('en-US', {
                                            month: 'long', day: 'numeric', year: 'numeric'
                                        })}
                                    </span>
                                    <span className="featured-meta-item">
                                        <Clock size={13} color="#E2C286" />
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
                {allBlogs.length > 0 && (
                    <section className="blogs-section" aria-label="All blog posts">
                        <div className="blogs-section-header">
                            <h2 className="blogs-section-title">
                                All Articles
                                <div className="blogs-section-line" />
                            </h2>
                            <span className="blogs-count-badge">{allBlogs.length} posts</span>
                        </div>

                        {/* Client component handles search + tag filtering */}
                        <BlogsClient blogs={clientBlogs} />
                    </section>
                )}

                {/* ─── EMPTY STATE ─── */}
                {allBlogs.length === 0 && (
                    <div className="blogs-index-empty">
                        <div className="blogs-index-empty-badge">
                            <PenTool size={26} color="#ff8ab8" />
                        </div>
                        <p style={{ color: '#e2d6dc', fontSize: '16px', margin: 0 }}>
                            Our first article is coming soon — check back shortly!
                        </p>
                    </div>
                )}

                {/* ─── NEWSLETTER CTA ─── */}
                <div className="blog-newsletter">
                    <div className="blog-newsletter-card">
                        <div className="blog-newsletter-icon">
                            <Mail size={24} color="#ff8ab8" />
                        </div>
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
