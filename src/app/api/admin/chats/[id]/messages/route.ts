import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdminRequest } from '@/lib/adminAuth';

// GET: Fetch messages for a conversation (agent polling)
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const admin = await isAdminRequest(req);
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const url = new URL(req.url);
        const since = url.searchParams.get('since');

        const whereClause: any = { conversationId: id };
        if (since) {
            whereClause.createdAt = { gt: new Date(since) };
        }

        const messages = await prisma.chatMessage.findMany({
            where: whereClause,
            orderBy: { createdAt: 'asc' },
            select: {
                id: true,
                role: true,
                content: true,
                createdAt: true,
            },
        });

        // Also return conversation metadata
        const conv = await prisma.chatConversation.findUnique({
            where: { id },
            select: {
                isTakenOver: true,
                takenOverBy: true,
                guestName: true,
                user: { select: { name: true, email: true } },
            },
        });

        return NextResponse.json({
            messages: messages.map(m => ({
                id: m.id,
                role: m.role,
                content: m.content,
                createdAt: m.createdAt.toISOString(),
            })),
            isTakenOver: conv?.isTakenOver || false,
            takenOverBy: conv?.takenOverBy || null,
            clientName: conv?.user?.name || conv?.guestName || 'Guest',
        });
    } catch (error) {
        console.error('[admin/chats/messages] GET error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// POST: Agent sends a message
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const admin = await isAdminRequest(req);
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const { content, agentName } = await req.json();

        if (!content?.trim()) {
            return NextResponse.json({ error: 'Empty message' }, { status: 400 });
        }

        // Verify conversation exists and is taken over
        const conv = await prisma.chatConversation.findUnique({
            where: { id },
            select: { isTakenOver: true },
        });

        if (!conv) {
            return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
        }

        if (!conv.isTakenOver) {
            return NextResponse.json({ error: 'Chat is not in takeover mode' }, { status: 400 });
        }

        // Create the agent message
        const message = await prisma.chatMessage.create({
            data: {
                conversationId: id,
                role: 'agent',
                content: content.trim(),
            },
        });

        return NextResponse.json({
            success: true,
            message: {
                id: message.id,
                role: message.role,
                content: message.content,
                createdAt: message.createdAt.toISOString(),
                agentName: agentName || 'Team Member',
            },
        });
    } catch (error) {
        console.error('[admin/chats/messages] POST error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
