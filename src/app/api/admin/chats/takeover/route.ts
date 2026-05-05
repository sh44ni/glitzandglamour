import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdminRequest } from '@/lib/adminAuth';

// POST: Agent takes over a chat
export async function POST(req: NextRequest) {
    try {
        const admin = await isAdminRequest(req);
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { conversationId, agentName } = await req.json();
        if (!conversationId || !agentName) {
            return NextResponse.json({ error: 'Missing conversationId or agentName' }, { status: 400 });
        }

        // Mark conversation as taken over
        await prisma.chatConversation.update({
            where: { id: conversationId },
            data: {
                isTakenOver: true,
                takenOverBy: agentName,
                takenOverAt: new Date(),
            },
        });

        // Insert system message so it appears in the chat
        await prisma.chatMessage.create({
            data: {
                conversationId,
                role: 'system',
                content: `🟢 ${agentName} has joined the chat`,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[takeover] POST error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// DELETE: Agent releases chat back to Kitty
export async function DELETE(req: NextRequest) {
    try {
        const admin = await isAdminRequest(req);
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { conversationId } = await req.json();
        if (!conversationId) {
            return NextResponse.json({ error: 'Missing conversationId' }, { status: 400 });
        }

        const conv = await prisma.chatConversation.findUnique({
            where: { id: conversationId },
            select: { takenOverBy: true },
        });

        // Release the takeover
        await prisma.chatConversation.update({
            where: { id: conversationId },
            data: {
                isTakenOver: false,
                takenOverBy: null,
                takenOverAt: null,
                label: null, // Clear the 🚨 transfer label
            },
        });

        // Insert system message
        await prisma.chatMessage.create({
            data: {
                conversationId,
                role: 'system',
                content: `👋 ${conv?.takenOverBy || 'Agent'} has left the chat. 🐱 Kitty is back! How can I help?`,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[takeover] DELETE error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
