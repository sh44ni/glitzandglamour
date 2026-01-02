import { NextRequest, NextResponse } from 'next/server';
import { GalleryImage } from '@/types';

/**
 * GET /api/gallery
 * Fetch gallery images
 * 
 * TODO: Database/CMS Integration
 * - Replace static data with database queries
 * - Add: const images = await prisma.galleryImage.findMany()
 * - Or integrate with a CMS like Sanity, Contentful, etc.
 */

// Placeholder gallery images for MVP
// Replace with actual images or CMS data
const placeholderImages: GalleryImage[] = Array.from({ length: 15 }, (_, i) => ({
    id: `img-${i + 1}`,
    url: `/gallery/placeholder-${(i % 5) + 1}.jpg`,
    alt: `Gallery image ${i + 1} - ${(['Nail Art', 'Facial Treatment', 'Waxing Service'][i % 3])}`,
    category: (['nails', 'facials', 'waxing'] as const)[i % 3],
    timestamp: new Date(Date.now() - i * 86400000).toISOString(),
}));

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');

        // TODO: Replace with database query
        // const images = await prisma.galleryImage.findMany({
        //   where: category && category !== 'all' ? { category } : undefined,
        //   orderBy: { timestamp: 'desc' },
        // });

        let images = placeholderImages;

        // Filter by category if specified
        if (category && category !== 'all') {
            images = images.filter((img) => img.category === category);
        }

        // Sort by timestamp (newest first)
        images.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        return NextResponse.json({
            success: true,
            images,
            total: images.length,
        });
    } catch (error) {
        console.error('Gallery API error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch gallery images', images: [] },
            { status: 500 }
        );
    }
}
