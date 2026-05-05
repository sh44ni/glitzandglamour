import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Client polls this to check if a human agent has taken over + get new agent messages
export async function GET(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const conversationId = url.searchParams.get('conversationId');
        const since = url.searchParams.get('since'); // ISO timestamp

        if (!conversationId) {
            return NextResponse.json({ error: 'Missing conversationId' }, { status: 400 });
        }

        const conv = await prisma.chatConversation.findUnique({
            where: { id: conversationId },
            select: {
                isTakenOver: true,
                takenOverBy: true,
                takenOverAt: true,
            },
        });

        if (!conv) {
            return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
        }

        // Get new messages since the client last checked (agent + system messages)
        const whereClause: any = {
            conversationId,
            role: { in: ['agent', 'system'] },
        };
        if (since) {
            whereClause.createdAt = { gt: new Date(since) };
        }

        const newMessages = await prisma.chatMessage.findMany({
            where: whereClause,
            orderBy: { createdAt: 'asc' },
            select: {
                id: true,
                role: true,
                content: true,
                createdAt: true,
            },
        });

        return NextResponse.json({
            isTakenOver: conv.isTakenOver,
            agentName: conv.takenOverBy || null,
            takenOverAt: conv.takenOverAt?.toISOString() || null,
            newMessages: newMessages.map(m => ({
                id: m.id,
                role: m.role,
                content: m.content,
                createdAt: m.createdAt.toISOString(),
            })),
        });
    } catch (error) {
        console.error('[chat/status] Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
