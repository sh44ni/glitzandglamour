import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY_REVIEWS });

const SYSTEM_PROMPT = `You are JoJany, the warm and bubbly owner of Glitz & Glamour nail studio in Vista, CA.
You write heartfelt, genuine, and exciting personal messages to your clients after their appointments.
Your voice is enthusiastic, fun, and uses emojis naturally (💅 💗 ✨ 💕 🌟 🎀 🫶).
You celebrate the client and how amazing they looked. You make them feel like a star.
NEVER use phrases like "help me grow", "help us grow", "helps my business", "small business" — it sounds desperate.
Instead, appeal to their vanity and excitement: their opinion matters, they deserve to share their gorgeous look with the world.
Always include [REVIEW_LINK] exactly as written — this is where the review link will appear.`;

export async function generateReviewMessage(
    firstName: string,
    service: string,
    isFirstVisit: boolean
): Promise<{ sms: string; emailBody: string }> {
    const visitContext = isFirstVisit
        ? `This was their FIRST visit! Make them feel like a VIP. Mention they earned $10 OFF their next visit as a first-timer reward for dropping a review. Make them feel special and excited.`
        : `This is a returning client you adore. Tell them their opinion matters and the world needs to see their gorgeous results. Make it feel like bragging rights, not a favour.`;

    const prompt = `Write a review request message for a client named ${firstName} who just got ${service || 'a service'} at Glitz & Glamour.
${visitContext}

Write TWO versions:
1. SMS: Fun, personal, and exciting — 2-4 sentences, 3-5 emojis. Must include [REVIEW_LINK] naturally (e.g. "Drop it here 👉 [REVIEW_LINK]"). Target ~220-280 chars total including [REVIEW_LINK]. NEVER say "help me grow" or "small business".
2. Email: 3-5 warm, enthusiastic sentences. Must include [REVIEW_LINK] naturally as a clickable moment. NEVER say "help me grow" or "small business".

Return ONLY valid JSON with no markdown: { "sms": "...", "emailBody": "..." }`;

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
        const smsRaw = content.sms || '';
        const emailRaw = content.emailBody || '';
        // Ensure [REVIEW_LINK] is present — append if AI forgot
        const ensureLink = (msg: string) =>
            msg.includes('[REVIEW_LINK]') ? msg : `${msg} \ud83d\udc49 [REVIEW_LINK]`;
        return {
            sms: ensureLink(smsRaw) || `Hey ${firstName}! \ud83d\udc97 We loved having you at Glitz & Glamour! You'd make my day by leaving a quick review \u2728 Tap here \ud83d\udc49 [REVIEW_LINK] — JoJany`,
            emailBody: ensureLink(emailRaw) || `Hey ${firstName}! \ud83d\udc97 Thank you so much for trusting me with your look. It truly means the world! If you have a moment, I'd love for you to share your experience: [REVIEW_LINK] \ud83e\udef6 — JoJany`,
        };
    } catch (err) {
        console.error('[Review AI] Groq failed, using fallback:', err);
        const discount = isFirstVisit ? ' Plus you get $10 OFF your next visit as a first-timer gift! 🎀' : '';
        return {
            sms: `${firstName}!! 💅✨ You looked STUNNING after your ${service || 'appointment'} — seriously!${discount} The world needs to see your gorgeous look, drop a quick review here 👉 [REVIEW_LINK] 💗 - JoJany`,
            emailBody: `${firstName}! 💗✨ I'm still thinking about how incredible you looked after your ${service || 'appointment'}! Your experience deserves to be shared — your honest review lets other clients know what to expect from a real VIP visit.${isFirstVisit ? ' And as a thank-you for your first visit, you get $10 OFF your next service! 🎉' : ''} Share your gorgeous experience here: [REVIEW_LINK] - JoJany`,
        };
    }
}

// Also export a version for the manual generator (no service name needed)
export async function generateManualReviewMessage(
    firstName: string,
    includeDiscount: boolean,
    service?: string
): Promise<{ sms: string; emailBody: string }> {
    return generateReviewMessage(firstName, service || 'your nails', includeDiscount);
}
