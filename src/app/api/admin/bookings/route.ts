import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

function isAuthenticated(request: NextRequest): boolean {
    return request.cookies.get('admin_session')?.value === 'authenticated';
}

export async function GET(request: NextRequest) {
    if (!isAuthenticated(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Try to load bookings from the data file if it exists
        const dataPath = path.join(process.cwd(), 'data', 'bookings.json');
        if (fs.existsSync(dataPath)) {
            const raw = fs.readFileSync(dataPath, 'utf-8');
            const data = JSON.parse(raw);
            return NextResponse.json(data.bookings || []);
        }
        return NextResponse.json([]);
    } catch {
        return NextResponse.json([]);
    }
}

export async function POST(request: NextRequest) {
    try {
        const booking = await request.json();

        // Save booking to data file
        const dataPath = path.join(process.cwd(), 'data', 'bookings.json');
        let bookings: object[] = [];

        if (fs.existsSync(dataPath)) {
            const raw = fs.readFileSync(dataPath, 'utf-8');
            const data = JSON.parse(raw);
            bookings = data.bookings || [];
        }

        bookings.unshift({ ...booking, id: Date.now().toString() });
        fs.writeFileSync(dataPath, JSON.stringify({ bookings }, null, 2));

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: 'Failed to save booking' }, { status: 500 });
    }
}
