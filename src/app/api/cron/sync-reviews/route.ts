import { NextRequest, NextResponse } from 'next/server';
import { syncGoogleReviewsToDb } from '@/lib/googleReviews';

/**
 * GET/POST /api/cron/sync-reviews
 * Automated daily background job to fetch new Google reviews and keep
 * them continuously accumulating in the database.
 */
export async function GET(req: NextRequest) {
    return handleSync(req);
}

export async function POST(req: NextRequest) {
    return handleSync(req);
}

async function handleSync(req: NextRequest) {
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = req.headers.get('authorization');

    // If CRON_SECRET is configured, require it unless requested from localhost
    const host = req.headers.get('host') || '';
    const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1');

    if (cronSecret && !isLocalhost) {
        if (authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
    }

    try {
        console.log('[cron-sync-reviews] Starting daily Google review sync...');
        const googleResult = await syncGoogleReviewsToDb();
        console.log('[cron-sync-reviews] Completed:', googleResult.message);

        return NextResponse.json({
            success: true,
            syncedAt: new Date().toISOString(),
            google: googleResult,
        });
    } catch (e) {
        console.error('[cron-sync-reviews] Error syncing reviews:', e);
        return NextResponse.json({ error: 'Sync failed', details: String(e) }, { status: 500 });
    }
}
