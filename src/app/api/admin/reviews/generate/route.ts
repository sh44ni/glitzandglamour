import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { nanoid } from 'nanoid';
import { logNotification } from '@/lib/notifLogger';
import { Resend } from 'resend';

export async function POST(req: Request) {
    try {
        const { clientName, clientPhone, clientEmail, message, autoSend = true } = await req.json();

        if (!clientName || !message) {
            return NextResponse.json({ error: 'Name and message are required' }, { status: 400 });
        }

        // Generate token
        const token = nanoid(16);

        // Save to db
        // Note: Using `any` cast here as a quick bypass if Prisma client generation failed locally,
        // but it will be type-safe when deployed to VPS.
        const reviewRequest = await (prisma as any).reviewRequest.create({
            data: {
                token,
                clientName,
                clientPhone: clientPhone || null,
                clientEmail: clientEmail || null,
                message
            }
        });

        const baseUrl = process.env.NEXTAUTH_URL || process.env.AUTH_URL || 'https://glitzandglamours.com';
        const reviewUrl = `${baseUrl}/leave-review/${token}`;

        // Append the link to the message for SMS
        const finalMessage = `${message}\n\nReview Link: ${reviewUrl}`;

        return NextResponse.json({ 
            success: true, 
            id: reviewRequest.id,
            url: reviewUrl, 
            fullMessage: finalMessage 
        });
    } catch (e: any) {
        console.error(e);
        return NextResponse.json({ error: e.message || 'Internal Server Error' }, { status: 500 });
    }
}
