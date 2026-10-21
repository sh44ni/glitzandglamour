'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Sparkles, Camera, Expand } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import ImageLightbox from '@/components/ImageLightbox';

// Define the shape of our Gallery Image from the backend API
type GalleryImage = {
    id: string;
    url: string;
    tags: string;
    createdAt: string;
    alt?: string;
    title?: string;
};

const INITIAL_GALLERY_IMAGES: GalleryImage[] = [
    {
        id: 'curated-acrylic-set',
        url: '/services/catalog/acrylic-set.webp',
        tags: 'Nails, Acrylics',
        createdAt: '2025-02-01T12:00:00.000Z',
        title: 'Sculpted Full Set Acrylics',
        alt: 'Sculpted full set acrylic nail extensions at Glitz & Glamour Studio in San Marcos, CA',
    },
    {
        id: 'curated-gelx',
        url: '/services/catalog/gelx.webp',
        tags: 'Nails, Gel-X',
        createdAt: '2025-02-02T12:00:00.000Z',
        title: 'Apres Gel-X Soft Gel Extensions',
        alt: 'Apres Gel-X soft gel nail extensions crafted by JoJany in San Marcos, CA',
    },
    {
        id: 'curated-balayage',
        url: '/services/catalog/acrylic-toes.webp',
        tags: 'Nails, Pedicures',
        createdAt: '2025-02-03T12:00:00.000Z',
        title: 'Sculpted French Acrylic Toes',
        alt: 'Precision sculpted acrylic toe enhancements and pedicure in San Marcos, CA',
    },
    {
        id: 'curated-custom-facial',
        url: '/services/catalog/deep-cleansing-extraction-facial.webp',
        tags: 'Facials, Skincare',
        createdAt: '2025-02-04T12:00:00.000Z',
        title: 'Restorative Custom Facial',
        alt: 'Corrective pore-clearing custom facial and luxury skincare treatment in San Marcos, CA',
    },
    {
        id: 'curated-highlights',
        url: '/services/catalog/basic-facial.webp',
        tags: 'Facials, Skincare',
        createdAt: '2025-02-05T12:00:00.000Z',
        title: 'Hydrating Glow & Botanical Facial',
        alt: 'Hydrating botanical glow facial and skin barrier treatment in San Marcos, CA',
    },
    {
        id: 'curated-womens-haircut',
        url: '/services/catalog/classic-foot-soak-detox.webp',
        tags: 'Nails, Pedicures',
        createdAt: '2025-02-06T12:00:00.000Z',
        title: 'Classic Detox Foot Soak & Spa Pedicure',
        alt: 'Luxury mineral foot soak detox and spa pedicure in San Marcos, CA',
    },
    {
        id: 'curated-weddings',
        url: '/services/catalog/anti-aging-and-enzyme-facial.webp',
        tags: 'Bridal, Facials',
        createdAt: '2025-02-07T12:00:00.000Z',
        title: 'Bridal Prep Enzyme Renewal Facial',
        alt: 'Luxury bridal skin prep and enzyme facial in North County San Diego',
    },
    {
        id: 'curated-quinceaneras',
        url: '/services/catalog/foreign-soak-off.webp',
        tags: 'Nails, Gel-X',
        createdAt: '2025-02-08T12:00:00.000Z',
        title: 'Gentle Nail Care & Cuticle Prep',
        alt: 'Gentle soak-off and Russian-style dry cuticle detailing in San Marcos, CA',
    },
    {
        id: 'curated-prom',
        url: '/services/catalog/underarm.webp',
        tags: 'Waxing, Skincare',
        createdAt: '2025-02-09T12:00:00.000Z',
        title: 'Smooth Elastic Hard-Wax Care',
        alt: 'Gentle low-temperature hard wax skin smoothing at Glitz & Glamour Studio in San Marcos, CA',
    },
    {
        id: 'curated-ombre',
        url: '/services/catalog/sideburns.webp',
        tags: 'Waxing, Facial Wax',
        createdAt: '2025-02-10T12:00:00.000Z',
        title: 'Precision Facial Contouring Wax',
        alt: 'Facial waxing and brow contouring at Glitz & Glamour Studio in San Marcos, CA',
    },
    {
        id: 'curated-french-tip',
        url: '/services/catalog/upper-lip.webp',
        tags: 'Waxing, Facial Wax',
        createdAt: '2025-02-11T12:00:00.000Z',
        title: 'Delicate Facial & Lip Smoothing',
        alt: 'Sensitive-skin upper lip and facial waxing in San Marcos, CA',
    },
    {
        id: 'curated-tiered-nail-art',
        url: '/services/catalog/kids-haircut-boys.webp',
        tags: 'Haircuts, Styling',
        createdAt: '2025-02-12T12:00:00.000Z',
        title: 'Precision Salon Haircut & Finish',
        alt: 'Precision scissor haircut and styling at Glitz & Glamour Studio in San Marcos, CA',
    },
];

const INITIAL_TAGS: string[] = [
    'Nails',
    'Acrylics',
    'Gel-X',
    'Nail Art',
    'Hair Color',
    'Balayage',
    'Highlights',
    'Haircuts',
    'Facials',
    'Bridal',
    'Special Events',
];

const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.glitzandglamours.com' },
        { '@type': 'ListItem', position: 2, name: 'Gallery', item: 'https://www.glitzandglamours.com/gallery' },
    ],
};

export default function GalleryPage() {
    const [images, setImages] = useState<GalleryImage[]>(INITIAL_GALLERY_IMAGES);
    const [allTags, setAllTags] = useState<string[]>(INITIAL_TAGS);
    const [activeTag, setActiveTag] = useState<string>('All');
    const [loading, setLoading] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    useTranslation();

    const openLightbox = useCallback((idx: number) => setLightboxIndex(idx), []);
    const closeLightbox = useCallback(() => setLightboxIndex(null), []);

    useEffect(() => {
        fetch('/api/gallery?all=true')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data.images) && data.images.length > 0) {
                    setImages(data.images);
                    if (Array.isArray(data.tags) && data.tags.length > 0) {
                        setAllTags(data.tags);
                    }
                }
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    // Filter images locally based on the active selected tag
    const filteredImages = activeTag === 'All'
        ? images
        : images.filter(img => {
            if (!img.tags) return false;
            const imgTags = img.tags.split(',').map(tag => tag.trim().toLowerCase());
            return imgTags.includes(activeTag.toLowerCase());
        });

    return (
        <div className="gal-page">
            <style>{`
                .gal-page {
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    color: #fff;
                    position: relative;
                    z-index: 1;
                }
                .gal-main {
                    flex: 1;
                    width: min(1200px, calc(100% - 2rem));
                    margin: 0 auto;
                    padding: clamp(28px, 5vw, 52px) 0 100px;
                }
                .gal-hero-card {
                    position: relative;
                    overflow: hidden;
                    border-radius: 28px;
                    padding: clamp(24px, 4vw, 44px);
                    margin-bottom: 32px;
                    background:
                        radial-gradient(circle at 18% 0%, rgba(255, 45, 120, 0.18), transparent 52%),
                        radial-gradient(circle at 85% 10%, rgba(226, 194, 134, 0.12), transparent 48%),
                        linear-gradient(155deg, rgba(32, 15, 26, 0.92), rgba(14, 7, 12, 0.96));
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    box-shadow: 0 28px 70px rgba(0, 0, 0, 0.55);
                    text-align: center;
                }
                .gal-hero-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 8%;
                    right: 8%;
                    height: 1px;
                    background: linear-gradient(90deg, transparent, rgba(255, 143, 188, 0.55), rgba(226, 194, 134, 0.55), transparent);
                }
                .gal-eyebrow {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 6px 14px;
                    border-radius: 999px;
                    background: rgba(255, 45, 120, 0.15);
                    border: 1px solid rgba(255, 130, 180, 0.38);
                    margin-bottom: 14px;
                    font-family: 'Poppins', sans-serif;
                    color: #ff8ab8;
                    font-weight: 700;
                    font-size: 11px;
                    text-transform: uppercase;
                    letter-spacing: 2.4px;
                }
                .gal-title {
                    font-family: 'Poppins', sans-serif;
                    font-size: clamp(1.9rem, 4.5vw, 3.2rem);
                    font-weight: 800;
                    line-height: 1.15;
                    margin-bottom: 18px;
                    letter-spacing: -0.03em;
                    color: #fff;
                }
                .gal-seo-box {
                    font-family: 'Poppins', sans-serif;
                    color: #e2d6dc;
                    font-size: 14.5px;
                    max-width: 820px;
                    margin: 0 auto 22px;
                    line-height: 1.72;
                    text-align: left;
                    background: rgba(255, 255, 255, 0.035);
                    padding: clamp(16px, 2.5vw, 22px) clamp(18px, 3vw, 26px);
                    border-radius: 18px;
                    border: 1px solid rgba(255, 255, 255, 0.08);
                }
                .gal-seo-box strong {
                    color: #fff;
                }
                .gal-filter-bar {
                    display: flex;
                    gap: 10px;
                    padding-bottom: 8px;
                    margin-bottom: 28px;
                    justify-content: center;
                    flex-wrap: wrap;
                }
                .gal-filter-btn {
                    padding: 8px 18px;
                    border-radius: 999px;
                    font-size: 13px;
                    font-weight: 600;
                    font-family: 'Poppins', sans-serif;
                    white-space: nowrap;
                    cursor: pointer;
                    transition: all 0.22s ease;
                    background: linear-gradient(155deg, rgba(32, 15, 26, 0.92), rgba(14, 7, 12, 0.96));
                    color: #e2d6dc;
                    border: 1px solid rgba(255, 255, 255, 0.12);
                }
                .gal-filter-btn:hover {
                    border-color: rgba(255, 143, 188, 0.55);
                    color: #fff;
                    transform: translateY(-1px);
                }
                .gal-filter-btn-active {
                    background: linear-gradient(135deg, #FF2D78 0%, #c9185b 100%);
                    color: #fff;
                    border: 1px solid rgba(255, 160, 200, 0.65);
                    box-shadow: 0 8px 24px rgba(255, 45, 120, 0.32);
                }
                .gal-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(265px, 1fr));
                    gap: 22px;
                    align-items: start;
                }
                @media (max-width: 640px) {
                    .gal-grid {
                        grid-template-columns: repeat(2, minmax(0, 1fr));
                        gap: 12px;
                    }
                }
                @media (max-width: 390px) {
                    .gal-grid {
                        grid-template-columns: minmax(0, 1fr);
                        gap: 16px;
                    }
                }
                .gal-card:nth-child(n+7),
                .gal-cta-banner {
                    content-visibility: auto;
                    contain-intrinsic-size: auto 360px;
                }
                .gal-card {
                    position: relative;
                    border-radius: 22px;
                    overflow: hidden;
                    padding: 8px;
                    cursor: pointer;
                    background: linear-gradient(155deg, rgba(32, 15, 26, 0.92), rgba(14, 7, 12, 0.96));
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    box-shadow: 0 16px 38px rgba(0, 0, 0, 0.42);
                    transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
                    outline: none;
                }
                .gal-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 12%;
                    right: 12%;
                    height: 1px;
                    background: linear-gradient(90deg, transparent, rgba(255, 143, 188, 0.55), transparent);
                    pointer-events: none;
                    z-index: 2;
                }
                .gal-card:hover,
                .gal-card:focus-visible {
                    transform: translateY(-4px);
                    border-color: rgba(255, 143, 188, 0.55);
                    box-shadow: 0 22px 48px rgba(255, 45, 120, 0.18);
                }
                .gal-card:focus-visible {
                    outline: 2px solid #ff8ab8;
                    outline-offset: 2px;
                }
                .gal-img-wrap {
                    position: relative;
                    width: 100%;
                    aspect-ratio: 4 / 5;
                    border-radius: 16px;
                    overflow: hidden;
                    background-color: #140911;
                }
                .gal-img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    display: block;
                    transition: transform 0.35s ease;
                }
                .gal-card:hover .gal-img,
                .gal-card:focus-visible .gal-img {
                    transform: scale(1.03);
                }
                .gal-zoom-badge {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    width: 32px;
                    height: 32px;
                    border-radius: 999px;
                    background: rgba(14, 7, 12, 0.78);
                    border: 1px solid rgba(255, 255, 255, 0.18);
                    color: #f4eef1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    backdrop-filter: blur(8px);
                    opacity: 0.85;
                    transition: opacity 0.2s ease, transform 0.2s ease, background 0.2s ease;
                }
                .gal-card:hover .gal-zoom-badge,
                .gal-card:focus-visible .gal-zoom-badge {
                    opacity: 1;
                    background: rgba(255, 45, 120, 0.85);
                    border-color: rgba(255, 180, 210, 0.6);
                    transform: scale(1.06);
                }
                .gal-tags-overlay {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    padding: 28px 12px 12px;
                    background: linear-gradient(to top, rgba(10, 4, 8, 0.92) 0%, rgba(10, 4, 8, 0.55) 60%, transparent 100%);
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }
                .gal-card-title {
                    font-family: 'Poppins', sans-serif;
                    font-size: 13px;
                    font-weight: 700;
                    color: #fff;
                    line-height: 1.3;
                }
                .gal-tag-list {
                    display: flex;
                    gap: 6px;
                    flex-wrap: wrap;
                }
                .gal-tag-pill {
                    font-family: 'Poppins', sans-serif;
                    color: #ff8ab8;
                    font-size: 10.5px;
                    font-weight: 600;
                    background: rgba(255, 45, 120, 0.18);
                    border: 1px solid rgba(255, 130, 180, 0.42);
                    padding: 2px 9px;
                    border-radius: 999px;
                    backdrop-filter: blur(6px);
                }
                .gal-empty-state {
                    padding: 56px 24px;
                    text-align: center;
                    border-radius: 24px;
                    background: linear-gradient(155deg, rgba(32, 15, 26, 0.92), rgba(14, 7, 12, 0.96));
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }
                .gal-cta-strip {
                    margin-top: 44px;
                    padding: 28px 24px;
                    border-radius: 24px;
                    background: linear-gradient(155deg, rgba(32, 15, 26, 0.92), rgba(14, 7, 12, 0.96));
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 20px;
                    flex-wrap: wrap;
                }
            `}</style>

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
            />

            <main className="gal-main">
                {/* Editorial Hero Card */}
                <div className="gal-hero-card">
                    <div className="gal-eyebrow">
                        <Camera size={13} color="#ff8ab8" aria-hidden="true" />
                        <span>Authentic Studio Portfolio</span>
                    </div>

                    <h1 className="gal-title">
                        Nail &amp; Beauty Gallery | <span className="text-gradient">San Marcos, CA</span>
                    </h1>

                    <div className="gal-seo-box">
                        <p style={{ marginBottom: '12px' }}>
                            Welcome to the portfolio gallery of <strong>Glitz &amp; Glamour Studio</strong> in San Marcos, CA (935 W San Marcos Blvd, Suite 101). If you are searching for the <strong>closest beauty salon to me</strong> or looking for dependable <strong>local beauty salons</strong> in North County San Diego, this gallery showcases authentic, real-world results crafted with passion and precision by JoJany.
                        </p>
                        <p style={{ margin: 0 }}>
                            Browse our latest client transformations across sculpted acrylic extensions, Apres Gel-X soft gel sets, classic French tips, hand-painted nail art, seamless sun-kissed balayage, dimensional foil highlights, precision haircuts, and restorative facials. Every photograph represents an unfiltered snapshot of actual work performed inside our private studio for clients from San Marcos, Vista, Oceanside, and Carlsbad. See something you love? Save your favorite inspiration photos and bring them to your next appointment.
                        </p>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        <Link href="/book" className="btn-primary" style={{ fontSize: '14px', padding: '11px 26px' }}>
                            Book This Look →
                        </Link>
                        <Link href="/services" className="btn-outline" style={{ fontSize: '14px', padding: '11px 24px', color: '#f4eef1', borderColor: 'rgba(255,255,255,0.2)' }}>
                            Explore Service Menu
                        </Link>
                    </div>
                </div>

                {/* Tags Filter Bar */}
                {allTags.length > 0 && (
                    <div className="gal-filter-bar" role="toolbar" aria-label="Filter gallery by service category">
                        <button
                            type="button"
                            onClick={() => setActiveTag('All')}
                            aria-pressed={activeTag === 'All'}
                            className={`gal-filter-btn ${activeTag === 'All' ? 'gal-filter-btn-active' : ''}`}
                        >
                            All Work ({images.length})
                        </button>

                        {allTags.map(tag => (
                            <button
                                key={tag}
                                type="button"
                                onClick={() => setActiveTag(tag)}
                                aria-pressed={activeTag === tag}
                                className={`gal-filter-btn ${activeTag === tag ? 'gal-filter-btn-active' : ''}`}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                )}

                {/* Photo Grid */}
                {loading ? (
                    <div className="gal-grid">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="skeleton" style={{ aspectRatio: '4/5', borderRadius: '22px' }} />
                        ))}
                    </div>
                ) : filteredImages.length === 0 ? (
                    <div className="gal-empty-state">
                        <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#fff', fontSize: '18px', marginBottom: '8px' }}>
                            {activeTag === 'All' ? 'Portfolio coming soon!' : `No photos found for "${activeTag}"`}
                        </h2>
                        <p style={{ fontFamily: 'Poppins, sans-serif', color: '#dfd2d9', fontSize: '14px', marginBottom: '16px' }}>
                            {activeTag === 'All' ? 'Check back later to see our latest transformations.' : 'Try selecting a different filter above.'}
                        </p>
                        {activeTag !== 'All' && (
                            <button
                                type="button"
                                onClick={() => setActiveTag('All')}
                                className="btn-primary"
                                style={{ fontSize: '13px', padding: '9px 22px' }}
                            >
                                Show All Work
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="gal-grid">
                        {filteredImages.map((img, idx) => {
                            const tagList = img.tags
                                ? img.tags.split(',').map(tag => tag.trim()).filter(Boolean)
                                : [];
                            const labelTitle = img.title || (tagList.length > 0 ? tagList.join(' · ') : 'Studio Portfolio Transformation');
                            const altText = img.alt || `${labelTitle} — Glitz & Glamour Studio in San Marcos, CA`;

                            return (
                                <div
                                    key={img.id}
                                    role="button"
                                    tabIndex={0}
                                    aria-label={`Open full-screen photo: ${labelTitle}`}
                                    className="gal-card"
                                    onClick={() => openLightbox(idx)}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            openLightbox(idx);
                                        }
                                    }}
                                >
                                    <div className="gal-img-wrap">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={img.url}
                                            alt={altText}
                                            width={400}
                                            height={500}
                                            loading="lazy"
                                            decoding="async"
                                            fetchPriority="low"
                                            className="gal-img"
                                        />

                                        <span className="gal-zoom-badge" aria-hidden="true">
                                            <Expand size={14} />
                                        </span>

                                        {(img.title || tagList.length > 0) && (
                                            <div className="gal-tags-overlay">
                                                {img.title && (
                                                    <span className="gal-card-title">{img.title}</span>
                                                )}
                                                {tagList.length > 0 && (
                                                    <div className="gal-tag-list">
                                                        {tagList.map(tag => (
                                                            <span key={tag} className="gal-tag-pill">
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Bottom Editorial Conversion Strip */}
                <div className="gal-cta-strip">
                    <div>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#E2C286', fontFamily: 'Poppins, sans-serif', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '6px' }}>
                            <Sparkles size={13} color="#E2C286" aria-hidden="true" />
                            <span>Inspired by a Look?</span>
                        </div>
                        <h2 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 'clamp(1.2rem, 2.5vw, 1.5rem)', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
                            Bring your favorite inspiration photo to your appointment
                        </h2>
                        <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13.5px', color: '#e2d6dc', margin: 0 }}>
                            Every set, color formula, and treatment is customized one-on-one by JoJany in our private San Marcos studio.
                        </p>
                    </div>
                    <Link href="/book" className="btn-primary" style={{ fontSize: '14px', padding: '12px 28px', whiteSpace: 'nowrap' }}>
                        Book Your Appointment →
                    </Link>
                </div>
            </main>

            {/* Lightbox overlay */}
            {lightboxIndex !== null && filteredImages.length > 0 && (
                <ImageLightbox
                    images={filteredImages.map(img => img.url)}
                    startIndex={lightboxIndex}
                    onClose={closeLightbox}
                />
            )}
        </div>
    );
}
