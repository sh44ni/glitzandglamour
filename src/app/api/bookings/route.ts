import { NextRequest, NextResponse } from 'next/server';
import { BookingData } from '@/types';
import { getServiceById } from '@/data/services';

// Admin API URL for forwarding bookings
const ADMIN_API_URL = process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:5000';

/**
 * POST /api/bookings
 * Handle booking form submissions - forwards to admin panel
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate required fields
        const requiredFields = ['name', 'email', 'phone', 'service', 'date', 'time'];
        for (const field of requiredFields) {
            if (!body[field]) {
                return NextResponse.json(
                    { success: false, error: `${field} is required` },
                    { status: 400 }
                );
            }
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(body.email)) {
            return NextResponse.json(
                { success: false, error: 'Invalid email format' },
                { status: 400 }
            );
        }

        // Validate phone format (10 digits)
        const phoneDigits = body.phone.replace(/\D/g, '');
        if (phoneDigits.length !== 10) {
            return NextResponse.json(
                { success: false, error: 'Invalid phone number format' },
                { status: 400 }
            );
        }

        // Get service name from ID
        const service = getServiceById(body.service);
        const serviceName = service ? `${service.name} - ${service.price}` : body.service;

        const bookingData: BookingData = {
            name: body.name,
            email: body.email,
            phone: body.phone,
            service: serviceName,
            date: body.date,
            time: body.time,
            notes: body.notes || '',
            timestamp: body.timestamp || new Date().toISOString(),
            status: 'pending',
        };

        // Forward to admin panel API
        try {
            await fetch(`${ADMIN_API_URL}/api/bookings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookingData),
            });
        } catch (error) {
            console.warn('Could not forward to admin API:', error);
            // Continue anyway - booking is still valid
        }

        return NextResponse.json({
            success: true,
            message: 'Booking request received successfully',
        });
    } catch (error) {
        console.error('Booking API error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to process booking request' },
            { status: 500 }
        );
    }
}
