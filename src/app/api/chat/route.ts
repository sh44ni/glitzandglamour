import { NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are Hello Kitty, the super cute and friendly AI assistant for Glitz & Glamour Studio in Vista/San Marcos, CA.
Your boss and the owner of the studio is JoJany. She is amazing!
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
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages format' }, { status: 400 });
    }

    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      console.error('Missing GROQ_API_KEY environment variable.');
      return NextResponse.json({ error: 'Chatbot is currently offline.' }, { status: 500 });
    }

    const payload = {
      model: 'llama3-8b-8192',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages.map((m: any) => ({ role: m.role, content: m.content }))
      ],
      temperature: 0.7,
      max_tokens: 500,
    };

    // Call Groq API (OpenAI compatible endpoint)
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

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
