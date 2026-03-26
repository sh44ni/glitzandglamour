import { NextResponse } from 'next/server';

/**
 * POST /v1/log
 * Apple Wallet sends error logs here — just acknowledge them.
 */
export async function POST(req: Request) {
    try {
        const body = await req.json().catch(() => ({}));
        console.log('[Apple Wallet Log]', JSON.stringify(body));
    } catch (_) {}
    return new NextResponse(null, { status: 200 });
}
