import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    if (!(await isAdminRequest(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { text, type } = await req.json();
        // type: 'slug' | 'excerpt' | 'image-alt'

        if (!text) return NextResponse.json({ error: 'No text provided' }, { status: 400 });

        let prompt = '';
        if (type === 'slug') {
            prompt = `Generate a single SEO-optimized URL slug for this blog title: "${text}". ONLY output the slug (e.g. this-is-a-slug). No quotes, no intro.`;
        } else if (type === 'excerpt') {
            prompt = `Generate a compelling, SEO-rich meta description (max 150 characters) for a blog about: "${text}". ONLY output the description itself.`;
        } else if (type === 'image-alt') {
            prompt = `Write a descriptive, SEO-optimized image alt text for an image in a beauty salon blog that relates to: "${text}". ONLY output the alt text.`;
        } else {
            prompt = `Optimize this for SEO: ${text}`;
        }

        const apiKey = process.env.OPEN_AI_API_KEY || process.env.OPENAI_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: 'OpenAI API key is not configured. Please set OPEN_AI_API_KEY in your environment variables.' },
                { status: 500 }
            );
        }

        // Call OpenAI (gpt-4o-mini)
        const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.5,
                max_tokens: 150
            })
        });

        const openaiData = await openaiRes.json();
        
        if (!openaiRes.ok) {
            console.error('OpenAI returned an error:', openaiData);
            return NextResponse.json({ error: openaiData.error?.message || 'Failed to communicate with OpenAI model' }, { status: 500 });
        }

        let result = openaiData.choices?.[0]?.message?.content?.trim() || '';
        
        // Final cleanup heuristics tailored by type
        if (type === 'slug') {
            result = result.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        } else if (type === 'excerpt' || type === 'image-alt') {
            // Remove lingering outer quotes if AI returns them
            if (result.startsWith('"') && result.endsWith('"')) {
                result = result.slice(1, -1);
            }
        }

        return NextResponse.json({ result });
    } catch (error) {
        console.error('OpenAI SEO Error:', error);
        return NextResponse.json({ error: 'AI generation failed' }, { status: 500 });
    }
}
