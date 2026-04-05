'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useTranslation } from '@/lib/i18n';

// Define the shape of our Gallery Image from the backend API
type GalleryImage = { id: string; url: string; tags: string; createdAt: string };

export default function GalleryPage() {
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [allTags, setAllTags] = useState<string[]>([]);
    const [activeTag, setActiveTag] = useState<string>('All');
    const [loading, setLoading] = useState(true);
    const { t } = useTranslation();

    useEffect(() => {
        // Fetch all images and unique tags on mount
        fetch('/api/gallery')
            .then(res => res.json())
            .then(data => {
                if (data.images) setImages(data.images);
                if (data.tags) setAllTags(data.tags);
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    // Filter images locally based on the active selected tag
    const filteredImages = activeTag === 'All'
        ? images
        : images.filter(img => {
            if (!img.tags) return false;
            // Split tags, clean whitespace, and check if activeTag is included
            const imgTags = img.tags.split(',').map(t => t.trim().toLowerCase());
            return imgTags.includes(activeTag.toLowerCase());
        });

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#0A0A0A', color: '#fff' }}>
            <main style={{ flex: 1, padding: 'clamp(80px, 12vw, 120px) 24px 60px', maxWidth: '1200px', width: '100%', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                    <h1 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 800, marginBottom: '16px', letterSpacing: '-1px' }}>
                        {t('gallery.heading').split(' ')[0]} <span className="text-gradient">{t('gallery.heading').split(' ').slice(1).join(' ')}</span>
                    </h1>
                    <p style={{ fontFamily: 'Poppins, sans-serif', color: '#aaa', fontSize: 'clamp(14px, 2vw, 16px)', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
                        {t('gallery.subtext')}
                    </p>
                </div>

                {/* Tags Filter Bar */}
                {allTags.length > 0 && (
                    <div className="no-scrollbar" style={{
                        display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '16px', marginBottom: '32px',
                        justifyContent: 'center', flexWrap: 'wrap'
                    }}>
                        <button
                            onClick={() => setActiveTag('All')}
                            className={activeTag === 'All' ? 'btn-primary' : 'btn-outline'}
                            style={{
                                padding: '8px 20px', borderRadius: '30px', fontSize: '14px', fontFamily: 'Poppins, sans-serif',
                                whiteSpace: 'nowrap', transition: 'all 0.3s ease'
                            }}
                        >
                            All Work
                        </button>

                        {allTags.map(tag => (
                            <button
                                key={tag}
                                onClick={() => setActiveTag(tag)}
                                className={activeTag === tag ? 'btn-primary' : 'btn-outline'}
                                style={{
                                    padding: '8px 20px', borderRadius: '30px', fontSize: '14px', fontFamily: 'Poppins, sans-serif',
                                    whiteSpace: 'nowrap', transition: 'all 0.3s ease',
                                    ...(activeTag !== tag && { background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' })
                                }}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                )}

                {/* Photo Grid */}
                {loading ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="skeleton" style={{ aspectRatio: '4/5', borderRadius: '24px' }} />
                        ))}
                    </div>
                ) : filteredImages.length === 0 ? (
                    <div className="glass" style={{ padding: '60px 20px', textAlign: 'center', borderRadius: '24px' }}>
                        <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, color: '#fff', fontSize: '18px', marginBottom: '8px' }}>
                            {activeTag === 'All' ? 'Portfolio coming soon!' : `No photos found for "${activeTag}"`}
                        </h3>
                        <p style={{ fontFamily: 'Poppins, sans-serif', color: '#888', fontSize: '14px' }}>
                            {activeTag === 'All' ? 'Check back later to see our latest transformations.' : 'Try selecting a different filter above.'}
                        </p>
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                        gap: '24px',
                        alignItems: 'start'
                    }}>
                        {filteredImages.map((img) => (
                            <div key={img.id} className="glass" style={{
                                position: 'relative', borderRadius: '24px', overflow: 'hidden',
                                padding: '8px', cursor: 'pointer', transition: 'transform 0.3s',
                                breakInside: 'avoid'
                            }}
                                onMouseOver={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-5px)'; }}
                                onMouseOut={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
                            >
                                <div style={{ position: 'relative', width: '100%', aspectRatio: '4/5', borderRadius: '16px', overflow: 'hidden', backgroundColor: '#111' }}>
                                    <Image
                                        src={img.url}
                                        alt="Portfolio piece"
                                        fill
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        style={{ objectFit: 'cover' }}
                                    />

                                    {/* Subtle gradient overlay for better text contrast if we have tags */}
                                    {img.tags && (
                                        <div style={{
                                            position: 'absolute', bottom: 0, left: 0, right: 0,
                                            padding: '24px 16px 16px',
                                            background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)',
                                            display: 'flex', gap: '6px', flexWrap: 'wrap',
                                            opacity: 0, transition: 'opacity 0.2s',
                                        }}
                                            className="gallery-tags-overlay"
                                        >
                                            {img.tags.split(',').map(tag => (
                                                <span key={tag} style={{
                                                    fontFamily: 'Poppins, sans-serif', color: '#fff', fontSize: '10px',
                                                    fontWeight: 600, background: 'rgba(255,45,120,0.8)', padding: '2px 8px',
                                                    borderRadius: '20px', backdropFilter: 'blur(4px)'
                                                }}>
                                                    {tag.trim()}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <style jsx>{`
                                    div:hover .gallery-tags-overlay {
                                        opacity: 1 !important;
                                    }
                                `}</style>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
