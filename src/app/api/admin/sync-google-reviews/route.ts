import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/adminAuth';
import { syncGoogleReviewsToDb } from '@/lib/googleReviews';

// POST /api/admin/sync-google-reviews — trigger Google review sync into DB
export async function POST(req: NextRequest) {
    if (!(await isAdminRequest(req))) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const result = await syncGoogleReviewsToDb();
        return NextResponse.json(result);
    } catch (e) {
        console.error('[sync-google-reviews]', e instanceof Error ? e.message : e);
        return NextResponse.json({ error: 'Failed to sync Google reviews. Check server logs.' }, { status: 500 });
    }
}
