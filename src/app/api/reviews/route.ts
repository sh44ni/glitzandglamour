import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { ReviewData, PaginatedReviews } from '@/types';

// Path to reviews JSON file
// TODO: Replace with database queries when migrating from MVP
const REVIEWS_FILE = path.join(process.cwd(), 'data', 'reviews.json');

/**
 * Read reviews from JSON file
 * TODO: Replace with: await prisma.review.findMany()
 */
async function readReviews(): Promise<ReviewData[]> {
    try {
        const data = await fs.readFile(REVIEWS_FILE, 'utf-8');
        const json = JSON.parse(data);
        return json.reviews || [];
    } catch (error) {
        // If file doesn't exist, return empty array
        return [];
    }
}

/**
 * Write reviews to JSON file
 * TODO: Replace with: await prisma.review.create({ data })
 */
async function writeReviews(reviews: ReviewData[]): Promise<void> {
    const dir = path.dirname(REVIEWS_FILE);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(REVIEWS_FILE, JSON.stringify({ reviews }, null, 2));
}

/**
 * GET /api/reviews
 * Fetch paginated reviews
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');

        const allReviews = await readReviews();

        // Filter only approved reviews and sort by date (newest first)
        const approvedReviews = allReviews
            .filter((r) => r.approved)
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        const total = approvedReviews.length;
        const totalPages = Math.ceil(total / limit);
        const startIndex = (page - 1) * limit;
        const paginatedReviews = approvedReviews.slice(startIndex, startIndex + limit);

        const response: PaginatedReviews = {
            reviews: paginatedReviews,
            total,
            page,
            limit,
            totalPages,
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error('Reviews GET error:', error);
        return NextResponse.json(
            { reviews: [], total: 0, page: 1, limit: 10, totalPages: 0 },
            { status: 500 }
        );
    }
}

/**
 * POST /api/reviews
 * Submit a new review
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate required fields
        if (!body.name || !body.rating || !body.reviewText) {
            return NextResponse.json(
                { success: false, error: 'Name, rating, and review text are required' },
                { status: 400 }
            );
        }

        // Validate rating
        if (body.rating < 1 || body.rating > 5) {
            return NextResponse.json(
                { success: false, error: 'Rating must be between 1 and 5' },
                { status: 400 }
            );
        }

        // Validate review text length
        if (body.reviewText.length < 10) {
            return NextResponse.json(
                { success: false, error: 'Review must be at least 10 characters' },
                { status: 400 }
            );
        }

        if (body.reviewText.length > 500) {
            return NextResponse.json(
                { success: false, error: 'Review must not exceed 500 characters' },
                { status: 400 }
            );
        }

        const newReview: ReviewData = {
            id: `review-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: body.name.trim(),
            rating: body.rating,
            reviewText: body.reviewText.trim(),
            date: body.date || new Date().toISOString().split('T')[0],
            approved: true, // Auto-approve for MVP; add moderation later
            timestamp: body.timestamp || new Date().toISOString(),
        };

        // Read existing reviews and add new one
        const reviews = await readReviews();
        reviews.unshift(newReview);
        await writeReviews(reviews);

        // TODO: When migrating to database:
        // const savedReview = await prisma.review.create({ data: newReview });

        return NextResponse.json({
            success: true,
            message: 'Review submitted successfully',
            review: newReview,
        });
    } catch (error) {
        console.error('Reviews POST error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to submit review' },
            { status: 500 }
        );
    }
}
