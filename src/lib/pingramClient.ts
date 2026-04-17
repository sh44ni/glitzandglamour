import type { Pingram as PingramType } from 'pingram';

export async function buildPingram(): Promise<PingramType | null> {
    const apiKey = process.env.PINGRAM_API_KEY;
    if (!apiKey || apiKey === 'placeholder') return null;
    const { Pingram } = await import('pingram');
    return new Pingram({ apiKey, baseUrl: process.env.PINGRAM_BASE_URL || 'https://api.pingram.io' });
}
