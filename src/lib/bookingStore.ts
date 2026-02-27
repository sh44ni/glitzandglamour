import fs from 'fs';
import path from 'path';
import { BookingData } from '@/types';

const DATA_PATH = path.join(process.cwd(), 'data', 'bookings.json');

export function readBookings(): (BookingData & { id: string })[] {
    try {
        if (!fs.existsSync(DATA_PATH)) return [];
        const raw = fs.readFileSync(DATA_PATH, 'utf-8');
        const data = JSON.parse(raw);
        return data.bookings || [];
    } catch {
        return [];
    }
}

export function writeBooking(booking: BookingData): void {
    const bookings = readBookings();
    bookings.unshift({ ...booking, id: Date.now().toString() });
    const dir = path.dirname(DATA_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DATA_PATH, JSON.stringify({ bookings }, null, 2));
}
