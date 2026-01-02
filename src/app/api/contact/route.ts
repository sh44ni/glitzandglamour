import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, generateContactEmailHtml } from '@/lib/email';
import { ContactMessage } from '@/types';

/**
 * POST /api/contact
 * Handle contact form submissions
 * 
 * TODO: Database Integration
 * - Save contact messages to database for tracking
 * - Add: const message = await prisma.contactMessage.create({ data: contactData })
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate required fields
        if (!body.name || !body.email || !body.message) {
            return NextResponse.json(
                { success: false, error: 'Name, email, and message are required' },
                { status: 400 }
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(body.email)) {
            return NextResponse.json(
                { success: false, error: 'Invalid email format' },
                { status: 400 }
            );
        }

        // Validate message length
        if (body.message.length > 1000) {
            return NextResponse.json(
                { success: false, error: 'Message must not exceed 1000 characters' },
                { status: 400 }
            );
        }

        const contactData: ContactMessage = {
            name: body.name.trim(),
            email: body.email.trim().toLowerCase(),
            message: body.message.trim(),
            timestamp: body.timestamp || new Date().toISOString(),
        };

        // TODO: Save to database
        // const savedMessage = await prisma.contactMessage.create({ data: contactData });

        // Send email notification
        const contactEmail = process.env.CONTACT_EMAIL || 'glitzandglamourstudio@email.com';
        const emailResult = await sendEmail({
            to: contactEmail,
            subject: `New Contact Message from ${contactData.name}`,
            html: generateContactEmailHtml(contactData),
            replyTo: contactData.email,
        });

        if (!emailResult.success) {
            console.error('Failed to send contact email:', emailResult.error);
            // Still return success for better UX
        }

        return NextResponse.json({
            success: true,
            message: 'Message sent successfully',
        });
    } catch (error) {
        console.error('Contact API error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to send message' },
            { status: 500 }
        );
    }
}
