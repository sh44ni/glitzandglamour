'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

interface CarouselSlide {
    src: string;
    alt: string;
    label?: string;
}

interface HeroCarouselProps {
    slides: CarouselSlide[];
    autoPlayInterval?: number;
}

export default function HeroCarousel({ slides, autoPlayInterval = 4000 }: HeroCarouselProps) {
    const [current, setCurrent] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);

    const goTo = useCallback((index: number) => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        setCurrent(index);
        setTimeout(() => setIsTransitioning(false), 600);
    }, [isTransitioning]);

    const next = useCallback(() => {
        goTo((current + 1) % slides.length);
    }, [current, slides.length, goTo]);

    useEffect(() => {
        const timer = setInterval(next, autoPlayInterval);
        return () => clearInterval(timer);
    }, [next, autoPlayInterval]);

    if (!slides.length) return null;

    return (
        <div className="relative w-full h-full overflow-hidden">
            {/* Slides */}
            {slides.map((slide, index) => (
                <div
                    key={index}
                    className="absolute inset-0 transition-opacity duration-700 ease-in-out"
                    style={{ opacity: index === current ? 1 : 0 }}
                >
                    <Image
                        src={slide.src}
                        alt={slide.alt}
                        fill
                        className="object-cover"
                        priority={index === 0}
                        sizes="100vw"
                    />
                </div>
            ))}

            {/* Navigation dots */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goTo(index)}
                        className={`transition-all duration-300 rounded-full ${
                            index === current
                                ? 'w-6 h-2 bg-[#FF1493]'
                                : 'w-2 h-2 bg-white/30 hover:bg-white/50'
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>

            {/* Arrow buttons */}
            <button
                onClick={() => goTo((current - 1 + slides.length) % slides.length)}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full glass flex items-center justify-center text-white hover:bg-white/10 transition-all"
                aria-label="Previous slide"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </button>
            <button
                onClick={() => goTo((current + 1) % slides.length)}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full glass flex items-center justify-center text-white hover:bg-white/10 transition-all"
                aria-label="Next slide"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </button>
        </div>
    );
}
