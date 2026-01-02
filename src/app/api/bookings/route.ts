import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, generateBookingEmailHtml } from '@/lib/email';
import { BookingData } from '@/types';
import { getServiceById } from '@/data/services';

/**
 * POST /api/bookings
 * Handle booking form submissions
 * 
 * TODO: Database Integration
 * - Replace email-only flow with database storage
 * - Add: const booking = await prisma.booking.create({ data: bookingData })
 * - Consider adding booking confirmation number generation
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

        // TODO: Save to database
        // const savedBooking = await prisma.booking.create({ data: bookingData });

        // Send email notification
        const contactEmail = process.env.CONTACT_EMAIL || 'glitzandglamourstudio@email.com';
        const emailResult = await sendEmail({
            to: contactEmail,
            subject: `New Booking Request: ${bookingData.name} - ${serviceName}`,
            html: generateBookingEmailHtml(bookingData),
            replyTo: bookingData.email,
        });

        if (!emailResult.success) {
            console.error('Failed to send booking email:', emailResult.error);
            // Still return success if the booking would be saved to DB
            // For now, we warn but don't fail the request
        }

        return NextResponse.json({
            success: true,
            message: 'Booking request received successfully',
            // TODO: Return booking ID when database is connected
            // id: savedBooking.id,
        });
    } catch (error) {
        console.error('Booking API error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to process booking request' },
            { status: 500 }
        );
    }
}
