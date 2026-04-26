import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdminRequest } from '@/lib/adminAuth';

export async function GET(req: NextRequest) {
  try {
    const admin = await isAdminRequest(req);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const search = url.searchParams.get('q') || '';
    const labelFilter = url.searchParams.get('label') || '';
    const bookingOnly = url.searchParams.get('booking') === '1';
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
    const limit = 30;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    if (search) {
      where.OR = [
        { guestName: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }
    if (labelFilter) {
      where.label = { contains: labelFilter, mode: 'insensitive' };
    }
    if (bookingOnly) {
      where.hasBooking = true;
    }

    const [conversations, total] = await Promise.all([
      prisma.chatConversation.findMany({
        where,
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
          },
          user: { select: { name: true, email: true } },
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.chatConversation.count({ where }),
    ]);

    return NextResponse.json({
      conversations,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching chats:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const admin = await isAdminRequest(req);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { conversationId } = await req.json();
    if (!conversationId) {
      return NextResponse.json({ error: 'Conversation ID required' }, { status: 400 });
    }

    await prisma.chatConversation.delete({
      where: { id: conversationId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting chat:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
