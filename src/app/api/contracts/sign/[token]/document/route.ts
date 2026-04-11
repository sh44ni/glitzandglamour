import { NextResponse } from 'next/server';

/** Legacy iframe URL; signing now uses the native wizard. */
export function GET() {
    return NextResponse.json({ error: 'This agreement opens in the studio sign page.' }, { status: 410 });
}
