import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { Calendar, Clock, ChevronLeft, Eye, ArrowRight, Sparkles, Award } from 'lucide-react';
import ViewTracker from './ViewTracker';
import CommentsSection from './CommentsSection';
import { resolveImageUrl } from '@/lib/imageUrl';
import { FALLBACK_BLOGS } from '@/data/fallbackBlogs';

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const fbBlog = FALLBACK_BLOGS[slug];
    const dbBlog = fbBlog ? null : await prisma.blogPost.findUnique({ where: { slug } });
    const blog = dbBlog && fbBlog
        ? {
              ...dbBlog,
              title: fbBlog.title,
              excerpt: fbBlog.excerpt,
              content: fbBlog.content,
              coverImage: fbBlog.coverImage || dbBlog.coverImage,
              tags: dbBlog.tags || fbBlog.tags,
          }
        : (fbBlog || dbBlog || null);
    if (!blog) return { title: 'Not Found' };

    const coverUrl = blog.coverImage ? resolveImageUrl(blog.coverImage) : null;
    // Clean any existing branding suffix to prevent double branding
    const cleanTitle = blog.title
        .replace(/\s*(\||-)\s*Glitz & Glamour(\s+Studio)?$/i, '')
        .replace(/\s*(\||-)\s*Glitz(\s+CA)?$/i, '')
        .trim();
    let title: string;
    if (`${cleanTitle} | Glitz CA`.length <= 60) {
        title = `${cleanTitle} | Glitz CA`;
    } else if (`${cleanTitle} | Glitz`.length <= 60) {
        title = `${cleanTitle} | Glitz`;
    } else if (cleanTitle.length <= 60) {
        title = cleanTitle;
    } else {
        const brand = ' | Glitz';
        const maxLen = 60 - brand.length - 1;
        const truncated = cleanTitle.slice(0, maxLen).replace(/\s+\S*$/, '');
        title = `${truncated}…${brand}`;
    }

    const rawDesc = (
        blog.excerpt ||
        `Read ${cleanTitle} — expert beauty, hair & nail tips from Glitz & Glamour Studio in San Marcos & Vista, CA.`
    ).trim();
    const description =
        rawDesc.length > 160
            ? `${rawDesc.slice(0, 157).replace(/\s+\S*$/, '')}...`
            : rawDesc;

    return {
        title,
        description,
        keywords: `${blog.title}, beauty tips, nail art San Marcos, hair salon Vista CA, Glitz & Glamour Studio, JoJany Lavalle`,
        alternates: {
            canonical: `https://www.glitzandglamours.com/blogs/${slug}`,
        },
        openGraph: {
            title,
            description,
            type: 'article',
            publishedTime: blog.createdAt.toISOString(),
            modifiedTime: blog.updatedAt.toISOString(),
            authors: [blog.author],
            images: coverUrl ? [{ url: coverUrl, alt: blog.title }] : [],
            url: `https://www.glitzandglamours.com/blogs/${slug}`,
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
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

/** Sanitizes blog content HTML: strips outer doctype/html/head/body wrappers while preserving styles, demoting body <h1> to <h2>, enforcing WCAG AA contrast and lazy image attributes */
function sanitizeBlogBody(content: string, coverImage: string | null): string {
    if (!content) return '';
    let html = content;

    // Preserve any custom <style> tags from <head>
    const styles: string[] = [];
    const styleRegex = /<style[\s\S]*?<\/style>/gi;
    let styleMatch: RegExpExecArray | null;
    while ((styleMatch = styleRegex.exec(html)) !== null) {
        styles.push(styleMatch[0]);
    }

    // Extract inner <body> content if a full HTML document was pasted into the DB
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (bodyMatch) {
        html = bodyMatch[1];
    } else {
        html = html
            .replace(/<!DOCTYPE[^>]*>/gi, '')
            .replace(/<html[^>]*>/gi, '')
            .replace(/<\/html>/gi, '')
            .replace(/<head[\s\S]*?<\/head>/gi, '')
            .replace(/<meta[^>]*>/gi, '')
            .replace(/<title[\s\S]*?<\/title>/gi, '');
    }

    // Strip any remaining structural, meta, title, doctype tags
    html = html
        .replace(/<!DOCTYPE[^>]*>/gi, '')
        .replace(/<\/?(html|head|body)[^>]*>/gi, '')
        .replace(/<meta[^>]*>/gi, '')
        .replace(/<title[\s\S]*?<\/title>/gi, '');

    // Strip leading cover image if duplicate
    html = stripLeadingCoverImage(html, coverImage);

    // Demote any body <h1> to <h2> so there's only one main <h1> on page
    html = html
        .replace(/<h1(\b[^>]*)>/gi, '<h2$1>')
        .replace(/<\/h1>/gi, '</h2>');

    // Prepend preserved <style> tags
    const uniqueStyles = Array.from(new Set(styles)).join('\n');
    if (uniqueStyles && !html.includes(uniqueStyles)) {
        html = `${uniqueStyles}\n${html}`;
    }

    // Upgrade any embedded low-contrast text colors in inline or <style> CSS to WCAG AA tokens
    html = html
        .replace(/(?<![-\w])color\s*:\s*#ff2d78\b/gi, 'color: #ff8ab8')
        .replace(/(?<![-\w])color\s*:\s*#(333|444|555|666|777|888|999|aaa)\b/gi, 'color: #e2d6dc');

    // Ensure inline <img> tags have lazy loading, async decoding, low fetchPriority, and explicit dimensions
    html = html.replace(/<img\b([^>]*)>/gi, (match, attrs) => {
        let updated = attrs;
        if (!/\bloading\s*=/i.test(updated)) updated += ' loading="lazy"';
        if (!/\bdecoding\s*=/i.test(updated)) updated += ' decoding="async"';
        if (!/\bfetchpriority\s*=/i.test(updated)) updated += ' fetchpriority="low"';
        if (!/\bwidth\s*=/i.test(updated)) updated += ' width="800"';
        if (!/\bheight\s*=/i.test(updated)) updated += ' height="450"';
        return `<img${updated}>`;
    });

    return html.trim();
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
    const fbBlog = FALLBACK_BLOGS[slug];
    const dbBlog = fbBlog ? null : await prisma.blogPost.findUnique({ where: { slug } });
    const blog = dbBlog && fbBlog
        ? {
              ...dbBlog,
              title: fbBlog.title,
              excerpt: fbBlog.excerpt,
              content: fbBlog.content,
              coverImage: fbBlog.coverImage || dbBlog.coverImage,
              tags: dbBlog.tags || fbBlog.tags,
          }
        : (fbBlog || dbBlog || null);
    if (!blog) return notFound();
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
                url: 'https://www.glitzandglamours.com/favicon-glitz.png',
            },
        },
        description: blog.excerpt,
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `https://www.glitzandglamours.com/blogs/${slug}`,
        },
    };

    const breadcrumbJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.glitzandglamours.com' },
            { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://www.glitzandglamours.com/blogs' },
            { '@type': 'ListItem', position: 3, name: blog.title, item: `https://www.glitzandglamours.com/blogs/${slug}` },
        ],
    };

    return (
        <>
            <ViewTracker slug={slug} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

            <style>{`
                .post-page {
                    min-height: 100vh;
                    font-family: 'Poppins', sans-serif;
                    overflow-x: hidden;
                }

                /* ── Hero ── */
                .post-hero {
                    position: relative;
                    width: 100%;
                    min-height: 460px;
                    display: flex;
                    align-items: flex-end;
                    overflow: hidden;
                    background: linear-gradient(155deg, rgba(32, 15, 26, 0.96), rgba(14, 7, 12, 0.98));
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                }
                .post-hero-bg {
                    position: absolute;
                    top: 24px;
                    right: 24px;
                    width: 140px;
                    height: 92px;
                    border-radius: 16px;
                    border: 1px solid rgba(255, 138, 184, 0.35);
                    object-fit: cover;
                    opacity: 0.85;
                    z-index: 1;
                }
                .post-hero-gradient {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(
                        to top,
                        rgba(10, 5, 9, 0.98) 0%,
                        rgba(14, 7, 12, 0.84) 48%,
                        rgba(14, 7, 12, 0.48) 100%
                    );
                }
                .post-hero-no-img {
                    position: absolute;
                    inset: 0;
                    background: radial-gradient(circle at 80% 20%, rgba(255, 45, 120, 0.16), transparent 60%),
                                linear-gradient(155deg, rgba(32, 15, 26, 0.95), rgba(14, 7, 12, 0.98));
                }
                .post-hero-content {
                    position: relative;
                    z-index: 2;
                    width: 100%;
                    max-width: 880px;
                    margin: 0 auto;
                    padding: 118px 24px 48px;
                    box-sizing: border-box;
                }
                .post-top-nav-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                    flex-wrap: wrap;
                    margin-bottom: 24px;
                }
                .post-back-link {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    color: #f4eef1;
                    text-decoration: none;
                    font-size: 13px;
                    font-weight: 600;
                    transition: color 0.2s, border-color 0.2s, background 0.2s;
                    padding: 8px 16px;
                    background: rgba(14, 7, 12, 0.82);
                    border: 1px solid rgba(255, 255, 255, 0.16);
                    border-radius: 50px;
                    backdrop-filter: blur(8px);
                }
                .post-back-link:hover {
                    color: #ff8ab8;
                    border-color: rgba(255, 138, 184, 0.45);
                    background: rgba(32, 15, 26, 0.92);
                }
                .post-breadcrumb {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 12px;
                    color: #dfd2d9;
                    flex-wrap: wrap;
                }
                .post-breadcrumb a {
                    color: #dfd2d9;
                    text-decoration: none;
                    transition: color 0.2s;
                }
                .post-breadcrumb a:hover { color: #ff8ab8; }
                .post-breadcrumb-sep { color: #c8b8c2; }
                .post-breadcrumb-current {
                    color: #ff8ab8;
                    font-weight: 600;
                    max-width: 240px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .post-tags-row {
                    margin-bottom: 16px;
                    display: flex;
                    gap: 8px;
                    flex-wrap: wrap;
                }
                .post-tag-pill {
                    background: rgba(14, 7, 12, 0.88);
                    border: 1px solid rgba(255, 138, 184, 0.4);
                    color: #ff8ab8;
                    font-size: 10px;
                    font-weight: 700;
                    padding: 4px 12px;
                    border-radius: 50px;
                    text-transform: uppercase;
                    letter-spacing: 0.6px;
                }

                .post-hero-title {
                    font-family: 'Poppins', sans-serif;
                    font-size: clamp(26px, 4.8vw, 48px);
                    font-weight: 900;
                    color: #fff;
                    line-height: 1.15;
                    letter-spacing: -0.6px;
                    margin: 0 0 22px;
                    overflow-wrap: anywhere;
                }
                .post-hero-meta {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    flex-wrap: wrap;
                }
                .post-hero-meta-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 13px;
                    color: #dfd2d9;
                    font-weight: 500;
                }
                .post-hero-author-avatar {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: rgba(255, 45, 120, 0.22);
                    border: 1px solid rgba(255, 138, 184, 0.45);
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
                    background: rgba(255, 45, 120, 0.16);
                    border: 1px solid rgba(255, 138, 184, 0.38);
                    color: #ff8ab8;
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
                    background: rgba(255, 255, 255, 0.06);
                    border: 1px solid rgba(255, 255, 255, 0.14);
                    color: #dfd2d9;
                    font-size: 11px;
                    font-weight: 600;
                    padding: 4px 12px;
                    border-radius: 50px;
                }

                /* ── Article Body ── */
                .post-body-wrap {
                    max-width: 880px;
                    margin: 0 auto;
                    padding: 48px 24px 88px;
                    box-sizing: border-box;
                }
                .post-article-surface {
                    position: relative;
                    background: linear-gradient(155deg, rgba(32, 15, 26, 0.92), rgba(14, 7, 12, 0.96));
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 28px;
                    padding: 44px 44px 48px;
                    box-shadow: 0 24px 64px rgba(0, 0, 0, 0.45);
                    overflow: hidden;
                }
                .post-article-surface::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 8%;
                    right: 8%;
                    height: 1px;
                    background: linear-gradient(90deg, transparent, rgba(255, 138, 184, 0.65), rgba(226, 194, 134, 0.5), transparent);
                    pointer-events: none;
                }

                /* ── Blog Content Prose ── */
                .blog-content {
                    font-size: 16.5px;
                    line-height: 1.85;
                    color: #e2d6dc;
                    overflow-wrap: anywhere;
                    word-break: break-word;
                }
                .blog-content * {
                    max-width: 100%;
                    box-sizing: border-box;
                }
                .blog-content h2 {
                    font-family: 'Poppins', sans-serif;
                    font-size: clamp(22px, 3vw, 27px);
                    font-weight: 800;
                    color: #fff !important;
                    margin: 44px 0 18px;
                    letter-spacing: -0.3px;
                    line-height: 1.25;
                }
                .blog-content h2:first-child {
                    margin-top: 0;
                }
                .blog-content h3 {
                    font-family: 'Poppins', sans-serif;
                    font-size: clamp(18px, 2.4vw, 21px);
                    font-weight: 700;
                    color: #f4eef1 !important;
                    margin: 32px 0 12px;
                }
                .blog-content h4 {
                    font-family: 'Poppins', sans-serif;
                    font-size: 17px;
                    font-weight: 700;
                    color: #f4eef1 !important;
                    margin: 26px 0 10px;
                }
                .blog-content p {
                    margin-bottom: 24px;
                    color: #e2d6dc;
                }
                .blog-content a {
                    color: #ff8ab8 !important;
                    font-weight: 600;
                    text-decoration: underline;
                    text-underline-offset: 3px;
                    transition: color 0.2s;
                }
                .blog-content a:hover { color: #ffc2dc !important; }
                .blog-content ul, .blog-content ol {
                    margin-bottom: 24px;
                    padding-left: 24px;
                    color: #e2d6dc;
                }
                .blog-content li {
                    margin-bottom: 10px;
                    color: #e2d6dc;
                }
                .blog-content blockquote {
                    border-left: 3px solid #FF2D78;
                    margin: 32px 0;
                    padding: 18px 24px;
                    background: rgba(255, 45, 120, 0.08);
                    border-radius: 0 14px 14px 0;
                    font-style: italic;
                    color: #f4eef1;
                }
                .blog-content img {
                    max-width: 100%;
                    height: auto;
                    border-radius: 20px;
                    margin: 32px 0;
                    display: block;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }
                .blog-content table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 28px 0;
                    display: block;
                    overflow-x: auto;
                }
                .blog-content th, .blog-content td {
                    padding: 12px 14px;
                    border: 1px solid rgba(255, 255, 255, 0.12);
                    color: #e2d6dc;
                    text-align: left;
                }
                .blog-content th {
                    background: rgba(255, 45, 120, 0.12);
                    color: #fff;
                    font-weight: 700;
                }
                .blog-content code {
                    background: rgba(255, 255, 255, 0.08);
                    padding: 2px 8px;
                    border-radius: 6px;
                    font-size: 14px;
                    color: #ff8ab8;
                }
                .blog-content pre {
                    background: rgba(14, 7, 12, 0.9);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 14px;
                    padding: 20px 24px;
                    overflow-x: auto;
                    margin: 28px 0;
                }
                .blog-content strong { color: #fff; font-weight: 700; }
                .blog-content hr {
                    border: none;
                    height: 1px;
                    background: rgba(255, 255, 255, 0.1);
                    margin: 40px 0;
                }

                /* ── Author Bio Card ── */
                .post-author-card {
                    position: relative;
                    margin-top: 36px;
                    padding: 28px 30px;
                    background: linear-gradient(155deg, rgba(32, 15, 26, 0.92), rgba(14, 7, 12, 0.96));
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 24px;
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    overflow: hidden;
                }
                .post-author-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 10%;
                    right: 10%;
                    height: 1px;
                    background: linear-gradient(90deg, transparent, rgba(226, 194, 134, 0.55), rgba(255, 138, 184, 0.55), transparent);
                    pointer-events: none;
                }
                .post-author-badge-avatar {
                    width: 56px;
                    height: 56px;
                    border-radius: 50%;
                    background: rgba(255, 45, 120, 0.18);
                    border: 1px solid rgba(226, 194, 134, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 18px;
                    font-weight: 800;
                    color: #fff;
                    flex-shrink: 0;
                }

                /* ── Flagship Services Section ── */
                .post-services-card {
                    position: relative;
                    margin-top: 36px;
                    padding: 32px 30px;
                    background: linear-gradient(155deg, rgba(32, 15, 26, 0.92), rgba(14, 7, 12, 0.96));
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 24px;
                    overflow: hidden;
                }
                .post-services-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 10%;
                    right: 10%;
                    height: 1px;
                    background: linear-gradient(90deg, transparent, rgba(255, 138, 184, 0.6), rgba(226, 194, 134, 0.45), transparent);
                    pointer-events: none;
                }
                .post-service-pill {
                    display: inline-flex;
                    align-items: center;
                    padding: 8px 15px;
                    border-radius: 50px;
                    background: rgba(255, 45, 120, 0.12);
                    border: 1px solid rgba(255, 138, 184, 0.35);
                    color: #ff8ab8;
                    font-size: 12px;
                    font-weight: 600;
                    text-decoration: none;
                    transition: background 0.2s, border-color 0.2s, color 0.2s;
                }
                .post-service-pill:hover {
                    background: rgba(255, 45, 120, 0.24);
                    border-color: #ff8ab8;
                    color: #fff;
                }

                /* ── CTA Strip ── */
                .post-cta-strip {
                    position: relative;
                    margin: 36px 0 0;
                    background: linear-gradient(155deg, rgba(32, 15, 26, 0.92), rgba(14, 7, 12, 0.96));
                    border: 1px solid rgba(255, 138, 184, 0.28);
                    border-radius: 24px;
                    padding: 36px 32px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 24px;
                    flex-wrap: wrap;
                    overflow: hidden;
                    box-shadow: 0 20px 52px rgba(0, 0, 0, 0.4);
                }
                .post-cta-strip::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 10%;
                    right: 10%;
                    height: 1px;
                    background: linear-gradient(90deg, transparent, rgba(255, 138, 184, 0.7), rgba(226, 194, 134, 0.55), transparent);
                    pointer-events: none;
                }
                .post-cta-text { flex: 1; min-width: 220px; }
                .post-cta-title { font-size: 21px; font-weight: 800; color: #fff; margin: 0 0 6px; }
                .post-cta-sub { font-size: 14px; color: #e2d6dc; margin: 0; line-height: 1.6; }

                @media (max-width: 640px) {
                    .post-hero-bg { display: none; }
                    .post-hero-content { padding: 98px 16px 36px; }
                    .post-body-wrap { padding: 28px 16px 64px; }
                    .post-article-surface { padding: 26px 18px 30px; border-radius: 22px; }
                    .post-author-card { padding: 22px 18px; flex-direction: column; align-items: flex-start; border-radius: 20px; }
                    .post-services-card { padding: 24px 18px; border-radius: 20px; }
                    .post-cta-strip { padding: 26px 20px; border-radius: 20px; }
                    .blog-content { font-size: 15.5px; line-height: 1.78; }
                    .blog-content h2 { font-size: 21px; margin: 32px 0 14px; }
                    .blog-content h3 { font-size: 18px; }
                }
            `}</style>

            <div className="post-page">
                {/* ─── Hero ─── */}
                <header className="post-hero">
                    {coverUrl ? (
                        <img
                            src={coverUrl}
                            alt={blog.title}
                            width={140}
                            height={92}
                            loading="lazy"
                            decoding="async"
                            fetchPriority="low"
                            className="post-hero-bg"
                        />
                    ) : (
                        <div className="post-hero-no-img" />
                    )}
                    <div className="post-hero-gradient" />
                    <div className="post-hero-content">
                        <div className="post-top-nav-row">
                            <Link href="/blogs" className="post-back-link no-press">
                                <ChevronLeft size={15} /> Back to Blog
                            </Link>
                            <nav className="post-breadcrumb" aria-label="Breadcrumb">
                                <Link href="/">Home</Link>
                                <span className="post-breadcrumb-sep">›</span>
                                <Link href="/blogs">Blog</Link>
                                <span className="post-breadcrumb-sep">›</span>
                                <span className="post-breadcrumb-current">{blog.title}</span>
                            </nav>
                        </div>

                        {blog.tags && (
                            <div className="post-tags-row">
                                {blog.tags.split(',').map((t: string) => t.trim()).filter(Boolean).map((tag: string) => (
                                    <span key={tag} className="post-tag-pill">
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
                                <Calendar size={14} color="#ff8ab8" />
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
                    <article className="post-article-surface">
                        <div
                            className="blog-content"
                            dangerouslySetInnerHTML={{ __html: sanitizeBlogBody(blog.content, blog.coverImage) }}
                        />
                    </article>

                    {/* ─── Author Bio Card ─── */}
                    <aside className="post-author-card" aria-label="About the author">
                        <div className="post-author-badge-avatar">
                            {blog.author.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                                <span style={{ fontSize: '16px', fontWeight: 800, color: '#fff' }}>{blog.author}</span>
                                <span style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                                    fontSize: '11px', fontWeight: 700, color: '#E2C286',
                                    background: 'rgba(226, 194, 134, 0.12)',
                                    border: '1px solid rgba(226, 194, 134, 0.35)',
                                    padding: '2px 10px', borderRadius: '50px'
                                }}>
                                    <Award size={11} /> Master Stylist &amp; Founder
                                </span>
                            </div>
                            <p style={{ fontSize: '13.5px', color: '#e2d6dc', lineHeight: 1.65, margin: 0 }}>
                                Licensed cosmetologist, master colorist, and nail artist at Glitz &amp; Glamour Studio in San Marcos, CA — specializing in Apres Gel-X, dimensional balayage, and North County bridal glam.
                            </p>
                        </div>
                    </aside>

                    {/* ─── Flagship Salon Services Internal Links ─── */}
                    <section
                        className="post-services-card"
                        aria-label="Explore Our Flagship Salon Services in San Marcos & Vista"
                    >
                        <h2
                            style={{
                                fontSize: '18px',
                                fontWeight: 800,
                                color: '#fff',
                                margin: '0 0 8px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                            }}
                        >
                            <Sparkles size={16} color="#ff8ab8" />
                            Explore Our Flagship Salon Services in San Marcos &amp; Vista
                        </h2>
                        <p
                            style={{
                                fontSize: '13.5px',
                                color: '#e2d6dc',
                                margin: '0 0 18px',
                                lineHeight: 1.65,
                            }}
                        >
                            Visit Glitz &amp; Glamour Studio at 935 W San Marcos Blvd, Suite 101, San Marcos, CA 92078 — serving San Marcos, Vista, Carlsbad &amp; Escondido:
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                            {[
                                { href: '/services/gelx', label: 'Apres Gel-X Nails ($60+)' },
                                { href: '/services/acrylic-set', label: 'Acrylic Full Sets ($65+)' },
                                { href: '/services/rebalance', label: 'Nail Rebalance ($55+)' },
                                { href: '/services/classic-foot-soak-detox', label: 'Classic Detox Pedicure ($65+)' },
                                { href: '/services/jelly-hydrating-foot-detox', label: 'Jelly Foot Detox ($75+)' },
                                { href: '/services/balayage', label: 'Custom Balayage ($380+)' },
                                { href: '/services/highlights', label: 'Foil Highlights ($380+)' },
                                { href: '/services/womens-haircut', label: "Women's Haircut & Blowout ($65+)" },
                                { href: '/services/deep-cleansing-extraction-facial', label: 'Deep Cleansing Facial ($85+)' },
                                { href: '/services/brazilian', label: 'Female Brazilian Wax ($60+)' },
                                { href: '/special-events/weddings-bridal', label: 'San Diego Bridal Hair & Makeup' },
                                { href: '/service-areas/san-marcos-ca', label: 'San Marcos Flagship Salon' },
                                { href: '/service-areas/vista-ca', label: 'Vista, CA Beauty Guide' },
                            ].map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="post-service-pill"
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    </section>

                    {/* ─── Book CTA ─── */}
                    <div className="post-cta-strip">
                        <div className="post-cta-text">
                            <p className="post-cta-title">Love what you&apos;re reading?</p>
                            <p className="post-cta-sub">Book an appointment and experience the Glitz &amp; Glamour difference in person.</p>
                        </div>
                        <Link href="/book" className="btn-primary" style={{ flexShrink: 0 }}>
                            Book Now <ArrowRight size={15} />
                        </Link>
                    </div>

                    {/* ─── Comments ─── */}
                    <CommentsSection slug={slug} />
                </div>
            </div>
        </>
    );
}
