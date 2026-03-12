import { NextRequest, NextResponse } from 'next/server';
import { ContactMessage } from '@/types';
import { rateLimit, getClientIp } from '@/lib/rateLimit';




/**
 * POST /api/contact
 * Handle contact form submissions - forwards to admin panel
 */
export async function POST(request: NextRequest) {
    try {
        // Rate limit: 5 contact messages per IP per 10 minutes
        const rl = rateLimit(getClientIp(request), 'contact', { limit: 5, windowMs: 10 * 60 * 1000 });
        if (!rl.ok) {
            return NextResponse.json(
                { success: false, error: 'Too many requests. Please wait before sending another message.' },
                { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
            );
        }

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
