export interface OriginBadgeConfig {
    label: string;
    emoji: string;
    bg: string;
    border: string;
    color: string;
    raw: string;
}

export const ORIGIN_PRESETS = [
    { key: 'Instagram', label: 'Instagram', emoji: '📸' },
    { key: 'TikTok', label: 'TikTok', emoji: '🎵' },
    { key: 'Google', label: 'Google Search', emoji: '🔍' },
    { key: 'Word of Mouth', label: 'Friend / Word of Mouth', emoji: '💕' },
    { key: 'Walked / Drove By', label: 'Walked / Drove By', emoji: '🚶‍♀️' },
    { key: 'Yelp', label: 'Yelp', emoji: '⭐' },
    { key: 'Facebook', label: 'Facebook', emoji: '🌐' },
] as const;

export function getOriginBadgeConfig(source?: string | null): OriginBadgeConfig | null {
    if (!source || !source.trim()) return null;
    const clean = source.trim();
    const lower = clean.toLowerCase();

    if (lower.includes('instagram') || lower.includes('ig') || lower.includes('insta')) {
        return {
            label: 'Instagram',
            emoji: '📸',
            bg: 'rgba(255, 45, 120, 0.14)',
            border: 'rgba(255, 45, 120, 0.35)',
            color: '#FF6BA8',
            raw: clean,
        };
    }
    if (lower.includes('tiktok') || lower.includes('tik tok')) {
        return {
            label: 'TikTok',
            emoji: '🎵',
            bg: 'rgba(0, 242, 234, 0.12)',
            border: 'rgba(0, 242, 234, 0.35)',
            color: '#00F2EA',
            raw: clean,
        };
    }
    if (lower.includes('google') || lower.includes('search') || lower.includes('seo')) {
        return {
            label: 'Google',
            emoji: '🔍',
            bg: 'rgba(66, 133, 244, 0.14)',
            border: 'rgba(66, 133, 244, 0.35)',
            color: '#60A5FA',
            raw: clean,
        };
    }
    if (lower.includes('friend') || lower.includes('word') || lower.includes('mouth') || lower.includes('referral') || lower.includes('family') || lower.includes('sister') || lower.includes('mom')) {
        return {
            label: 'Word of Mouth',
            emoji: '💕',
            bg: 'rgba(244, 63, 94, 0.14)',
            border: 'rgba(244, 63, 94, 0.35)',
            color: '#FB7185',
            raw: clean,
        };
    }
    if (lower.includes('walk') || lower.includes('drove') || lower.includes('drive') || lower.includes('street') || lower.includes('plaza') || lower.includes('passed')) {
        return {
            label: 'Walked / Drove By',
            emoji: '🚶‍♀️',
            bg: 'rgba(16, 185, 129, 0.14)',
            border: 'rgba(16, 185, 129, 0.35)',
            color: '#34D399',
            raw: clean,
        };
    }
    if (lower.includes('yelp')) {
        return {
            label: 'Yelp',
            emoji: '⭐',
            bg: 'rgba(245, 158, 11, 0.14)',
            border: 'rgba(245, 158, 11, 0.35)',
            color: '#FBBF24',
            raw: clean,
        };
    }
    if (lower.includes('facebook') || lower.includes('fb')) {
        return {
            label: 'Facebook',
            emoji: '🌐',
            bg: 'rgba(59, 130, 246, 0.14)',
            border: 'rgba(59, 130, 246, 0.35)',
            color: '#93C5FD',
            raw: clean,
        };
    }

    // Custom write-in source (e.g. Bridal show, Flyer, Event, etc.)
    return {
        label: clean.length > 20 ? clean.substring(0, 18) + '…' : clean,
        emoji: '📍',
        bg: 'rgba(168, 85, 247, 0.14)',
        border: 'rgba(168, 85, 247, 0.35)',
        color: '#C084FC',
        raw: clean,
    };
}
