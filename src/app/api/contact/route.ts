import { NextRequest, NextResponse } from 'next/server';
import { ContactMessage } from '@/types';

// Admin API URL for forwarding contact messages
const ADMIN_API_URL = process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:5000';

/**
 * POST /api/contact
 * Handle contact form submissions - forwards to admin panel
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

        // Forward to admin panel API
        try {
            await fetch(`${ADMIN_API_URL}/api/contacts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(contactData),
            });
        } catch (error) {
            console.warn('Could not forward to admin API:', error);
            // Continue anyway - contact is still valid
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
