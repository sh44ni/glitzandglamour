'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

type Category = 'all' | 'nails' | 'facials' | 'waxing';

const categories: { value: Category; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'nails', label: 'Nails' },
    { value: 'facials', label: 'Facials' },
    { value: 'waxing', label: 'Waxing' },
];

interface GalleryImage {
    id: number;
    url: string;
    category: string;
    alt: string;
}

// Admin API URL - change this when deploying
const ADMIN_API_URL = process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:5000';

export default function GalleryPage() {
    const [selectedCategory, setSelectedCategory] = useState<Category>('all');
    const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch images from admin API
    useEffect(() => {
        fetchImages();
    }, []);

    const fetchImages = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${ADMIN_API_URL}/api/gallery`);
            if (response.ok) {
                const data = await response.json();
                // Transform URLs to include full admin URL
                const transformedImages = data.map((img: GalleryImage) => ({
                    ...img,
                    url: `${ADMIN_API_URL}${img.url}`,
                }));
                setImages(transformedImages);
            }
        } catch (error) {
            console.error('Failed to fetch gallery images:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Filter images by category
    const filteredImages =
        selectedCategory === 'all'
            ? images
            : images.filter((img) => img.category === selectedCategory);

    return (
        <div className="animate-fade-in bg-[#0A0A0A] min-h-screen">
            {/* Hero Section */}
            <section className="py-16 relative overflow-hidden">
                {/* Decorative bow */}
                <div className="absolute top-10 right-10 opacity-10">
                    <svg width="60" height="36" viewBox="0 0 40 24" fill="#FF1493">
                        <ellipse cx="10" cy="12" rx="10" ry="8" />
                        <ellipse cx="30" cy="12" rx="10" ry="8" />
                        <circle cx="20" cy="12" r="5" />
                    </svg>
                </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        <span className="text-white">Our </span>
                        <span className="text-[#FF1493]">Gallery</span>
                    </h1>
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                        Browse through our work and get inspired for your next appointment
                    </p>
                </div>
            </section>

            {/* Filter Tabs */}
            <section className="pb-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-wrap justify-center gap-2">
                        {categories.map((category) => (
                            <button
                                key={category.value}
                                onClick={() => setSelectedCategory(category.value)}
                                className={`
                  px-6 py-2 rounded-full font-medium transition-all duration-300
                  ${selectedCategory === category.value
                                        ? 'bg-[#FF1493] text-white shadow-md'
                                        : 'bg-[#1A1A1A] text-gray-400 hover:bg-[#2A2A2A] hover:text-white border border-gray-800'
                                    }
                `}
                            >
                                {category.label}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Gallery Grid */}
            <section className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {isLoading ? (
                        <div className="flex justify-center py-20">
                            <LoadingSpinner size="lg" />
                        </div>
                    ) : filteredImages.length === 0 ? (
                        <div className="text-center py-20">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-16 w-16 mx-auto text-gray-600 mb-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1}
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                            </svg>
                            <p className="text-gray-500">No images in this category yet.</p>
                            <p className="text-gray-600 text-sm mt-2">Check back soon for updates!</p>
                        </div>
                    ) : (
                        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                            {filteredImages.map((image, index) => (
                                <div
                                    key={image.id}
                                    className="break-inside-avoid cursor-pointer group"
                                    onClick={() => setSelectedImage(image)}
                                >
                                    <div className="relative overflow-hidden rounded-xl bg-[#1A1A1A] border border-gray-800 group-hover:border-[#FF1493]/30 transition-all duration-300">
                                        <div className="relative aspect-square">
                                            {/* Using native img for external images */}
                                            <img
                                                src={image.url}
                                                alt={image.alt || 'Gallery image'}
                                                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        </div>
                                        {/* Hover overlay */}
                                        <div className="absolute inset-0 bg-[#FF1493]/0 group-hover:bg-[#FF1493]/10 transition-colors duration-300 flex items-center justify-center">
                                            <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 px-3 py-1 rounded-full text-white text-sm">
                                                View
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-[#1A1A1A]">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                        Ready for Your Transformation?
                    </h2>
                    <p className="text-gray-400 mb-6">
                        Book your appointment and let us create beautiful nail art for you
                    </p>
                    <a
                        href="/book"
                        className="inline-flex items-center justify-center px-8 py-4 bg-[#FF1493] text-white font-medium rounded-full hover:bg-[#C71185] transition-colors shadow-lg hover:shadow-xl"
                    >
                        Book Appointment
                    </a>
                </div>
            </section>

            {/* Modal/Lightbox */}
            {selectedImage && (
                <Modal
                    isOpen={!!selectedImage}
                    onClose={() => setSelectedImage(null)}
                    imageUrl={selectedImage.url}
                    alt={selectedImage.alt || 'Gallery image'}
                />
            )}
        </div>
    );
}
