import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

const getSystemPrompt = (userName?: string) => `You are Hello Kitty, the super cute and friendly AI assistant for Glitz & Glamour Studio in Vista/San Marcos, CA.
Your boss and the owner of the studio is JoJany. She is amazing!
${userName ? `You are currently talking to ${userName}. Use their name occasionally to be friendly!` : ''}
Always be polite, sweet, and helpful. Use emojis like 🎀, 💕, ✨, and 💅.

CRITICAL RULES FOR PRICING:
When a user asks about prices, you can give estimates based on typical salon prices, but you MUST CLEARLY STATE that your prices are "only an estimate" and "not final". All final pricing is discussed in person before the appointment begins. 

Here are some ESTIMATED base prices for Glitz & Glamour Studio:
- Acrylic Set: From $65
- Deep Cleansing Facial: From $85
- Balayage: From $380
- Jelly Foot Detox (Pedicure): From $75
- Eyebrow Wax: From $12

If a user asks about a service not listed here, tell them you don't have the exact price but to please book a consultation or ask JoJany!

Keep your answers relatively short and conversational. Remember, you are Hello Kitty!`;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, conversationId, guestName } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages format' }, { status: 400 });
    }

    const session = await auth();
    let dbUser = null;
    let finalUserName = guestName || null;

    if (session?.user?.email) {
      dbUser = await prisma.user.findUnique({ where: { email: session.user.email } });
      if (dbUser?.name) {
        finalUserName = dbUser.name.split(' ')[0];
      }
    }

    let currentConversationId = conversationId;

    // Create a new conversation if it doesn't exist
    if (!currentConversationId) {
      const newConv = await prisma.chatConversation.create({
        data: {
          userId: dbUser?.id || null,
          guestName: dbUser ? null : finalUserName,
        }
      });
      currentConversationId = newConv.id;
    }

    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      console.error('Missing GROQ_API_KEY environment variable.');
      return NextResponse.json({ error: 'Chatbot is currently offline.' }, { status: 500 });
    }

    const payload = {
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: getSystemPrompt(finalUserName) },
        ...messages.map((m: any) => ({ role: m.role, content: m.content }))
      ],
      temperature: 0.7,
      max_tokens: 500,
    };

    // Call Groq API
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Groq API Error:', data);
      return NextResponse.json({ error: 'Failed to communicate with AI provider.' }, { status: 502 });
    }

    const reply = data.choices[0].message.content;
    const latestUserMessage = messages[messages.length - 1];

    // Log the interaction if it's the user's latest prompt
    if (currentConversationId && latestUserMessage?.role === 'user') {
        await prisma.chatMessage.createMany({
            data: [
                { conversationId: currentConversationId, role: 'user', content: latestUserMessage.content },
                { conversationId: currentConversationId, role: 'assistant', content: reply },
            ]
        });
    }

    return NextResponse.json({ reply, conversationId: currentConversationId, userName: finalUserName });
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
