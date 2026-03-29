import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY_REVIEWS });

const SYSTEM_PROMPT = `You are JoJany, the warm and bubbly owner of Glitz & Glamour nail studio in Vista, CA. 
You write short, heartfelt, genuine messages to your clients after their appointments.
Your voice is personal, warm, and uses emojis naturally (💗 🫶 ✨ 💕).
You always mention how much you appreciate the client and how much reviews help your small business grow.
Never sound corporate or generic. Write like you're texting a friend.`;

export async function generateReviewMessage(
    firstName: string,
    service: string,
    isFirstVisit: boolean
): Promise<{ sms: string; emailBody: string }> {
    const visitContext = isFirstVisit
        ? `This was their FIRST visit. Mention how excited you are they chose you, and remind them that leaving a review earns them $10 off their next service. The review link will be included separately — do NOT include a URL.`
        : `This is a returning client. Remind them how much their review helps your small business grow. The review link will be included separately — do NOT include a URL.`;

    const prompt = `Write a review request for a client named ${firstName} who just got a ${service}.
${visitContext}

Write TWO versions:
1. SMS: Short (under 130 chars, NO URL — it will be appended), warm, with 1-2 emojis. No URL placeholder.
2. Email: 3-5 sentences in JoJany's voice, warm and personal. Can use more emojis. No URL — there will be a button.

Return ONLY valid JSON: { "sms": "...", "emailBody": "..." }`;

    try {
        const chat = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: prompt },
            ],
            response_format: { type: 'json_object' },
            max_tokens: 500,
            temperature: 0.9, // more creative, less formulaic
        });

        const content = JSON.parse(chat.choices[0].message.content || '{}');
        return {
            sms: content.sms || `Hey ${firstName}! 💗 Thank you so much for your visit — it means everything. A review truly helps my small business grow 🫶 - JoJany`,
            emailBody: content.emailBody || `Hey ${firstName}! Thank you so much for trusting me with your look. It means the world 💗 If you have a moment, a review truly helps my small business grow and helps other beautiful clients find me 🫶`,
        };
    } catch (err) {
        console.error('[Review AI] Groq failed, using fallback:', err);
        // Graceful fallback — still JoJany's voice, not a corporate template
        const discount = isFirstVisit ? ' Plus, as a first-time client, you\'ll get $10 off your next visit!' : '';
        return {
            sms: `Hey ${firstName}! 💗 Thank you for your ${service} — you were such a vibe!${discount} A review truly helps me grow 🫶 - JoJany`,
            emailBody: `Hey ${firstName}! 💗 Thank you so much for your ${service} — I truly appreciate you choosing me! Your honest review means the world and helps other clients find their perfect beauty experience.${isFirstVisit ? ' And as a thank-you for your first visit, leave a review and get $10 off your next service! 🎉' : ''}`,
        };
    }
}

// Also export a version for the manual generator (no service name needed)
export async function generateManualReviewMessage(
    firstName: string,
    includeDiscount: boolean
): Promise<{ sms: string; emailBody: string }> {
    return generateReviewMessage(firstName, 'your service', includeDiscount);
}
