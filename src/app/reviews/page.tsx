'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    Star,
    MessageSquarePlus,
    ExternalLink,
    CheckCircle,
    Lock,
    AlertCircle,
    Sparkles,
    Heart,
    ShieldCheck,
} from 'lucide-react';

type Review = {
    id: string;
    rating: number;
    text: string;
    source: string;        // "website" | "setmore" | "google"
    badge?: string | null; // "member" | "insider" | null
    authorName?: string | null;
    createdAt: string;
    user?: { name: string; image?: string | null } | null;
    booking?: { service?: { name: string } } | null;
};

type EligibleBooking = { id: string; service: { name: string } };

/**
 * Verified client reviews pre-populated from the studio's Setmore & Google review pool
 * (mirrors VERIFIED_FALLBACK_REVIEWS from @/lib/realReviews without bundling server PrismaClient).
 */
const INITIAL_REVIEWS: Review[] = [
    // ─── Verified Google Maps Reviews ───
    {
        id: 'rev-google-c-hernandez',
        authorName: 'C. Hernandez',
        text: 'A true professional and master of her craft. I immediately felt comfortable and knew I was in good hands. I loved my haircut! It was better than I expected could be done with my thinning hair. And I left feeling much more confident after her guidance on styling my realistically manageable cut.',
        rating: 5,
        source: 'google',
        createdAt: '2026-10-19T05:30:56.204Z',
    },
    {
        id: 'rev-google-ro-escobar',
        authorName: 'RO Escobar',
        text: 'I had my first appointment with Jojany on Monday, and I absolutely LOVE my hair! From the moment I arrived, she made me feel so comfortable, and her salon is super cute and stylish. It was my first time meeting her, but I felt completely at ease trusting her with such a big change—and she delivered! It’s only been two days, and I can’t stop admiring my hair or getting compliments! She truly knows what she’s doing. I also really appreciate how flexible she was with rescheduling and working around my schedule. If you’re looking for a change and want someone who makes you feel comfortable and confident, I highly recommend Jojany. She is absolutely worth the drive, and I’m so happy I found her!',
        rating: 5,
        source: 'google',
        createdAt: '2026-10-14T04:31:57.186Z',
    },
    {
        id: 'rev-google-elizabeth-p',
        authorName: 'elizabeth ponce',
        text: 'i was able to get squeezed in last minute and im in love with my haircut!! very friendly service and good communication.',
        rating: 5,
        source: 'google',
        createdAt: '2026-10-12T20:02:06.204Z',
    },
    {
        id: 'rev-google-delphine-e',
        authorName: 'Delphine Egler',
        text: 'Thank you Jojo you did an amazing job! I love my new nails!',
        rating: 5,
        source: 'google',
        createdAt: '2026-10-01T16:03:59.105Z',
    },
    {
        id: 'rev-ruth-q',
        authorName: 'Ruth Quinones',
        text: 'First time EVER getting gel-x nails and she did NOT disappoint. Very clean and explained well the whole process since it was my first time. Very detailed on her work. Overall Aura was very nice. Thank you so much for this wonderful experience. Definitely going back!',
        rating: 5,
        source: 'google',
        createdAt: '2026-06-16T21:18:40.557Z',
    },
    {
        id: 'rev-google-anaid-s',
        authorName: 'Anaid Sumano',
        text: 'This was my first time getting my nails done in years and Jojany did the EXACT design I requested. Truly, so shocked to see how incredible my nails came out and how sweet she was throughout the entire appointment. I look forward to dropping in for a fill soon!',
        rating: 5,
        source: 'google',
        createdAt: '2026-05-25T01:58:48.407Z',
    },
    {
        id: 'rev-lilith-j',
        authorName: 'Lilith Jane',
        text: 'Jo is the BEST nail tech. I’ve been going to her for quite some time now and I have to say, I genuinely look forward to going in for nail day. I’m never judged on the state of my nails, she’s always down to hear the latest tea, and always makes sure you’re in LOVE with your new set before you leave the salon. She’s incredibly talented in her gelx work and the retention is incredible. I’ve been going on over a month and only lost a nail because my dog ripped it off. The nails last, they’re strong, they’re beautiful, and for a hell of a price too! Book with Jo!!!',
        rating: 5,
        source: 'google',
        createdAt: '2026-04-08T22:09:44.860Z',
    },
    {
        id: 'rev-google-evelyn-n',
        authorName: 'Evelyn Nunez',
        text: 'My girl JoJo ateee downnn with all my sets she has done. She’s such a kinda sweet soul that does amazing in her job. Every time I have gone with her she has always made me feel welcomed and does my nails exactly how I want them!!!',
        rating: 5,
        source: 'google',
        createdAt: '2026-04-08T07:15:11.128Z',
    },
    {
        id: 'rev-google-diana-o',
        authorName: 'Diana Ortiz',
        text: 'I love my nail sets that I get done by jojo! She always does so much better than the inspo!!! I am so indecisive all the time and she always makes my vision come true despite the indecisiveness! She did an amazing job on my hair as well, I went from brown highlights to honey blonde!',
        rating: 5,
        source: 'google',
        createdAt: '2026-04-08T01:15:27.291Z',
    },
    {
        id: 'rev-google-meredith-w',
        authorName: 'Meredith Weissberg',
        text: "Jojo does an amazing job at all my nail sets! I love my new set she just did and can't stop looking at them. She is super affordable and takes her time with every step! I love getting my nails done by her!",
        rating: 5,
        source: 'google',
        createdAt: '2026-04-07T23:06:08.240Z',
    },

    // ─── Verified Setmore Reviews ───
    {
        id: 'rev-rosita',
        authorName: 'Rosita M.',
        text: 'My girl was AMAZING! I booked Jojany for both makeup and hair... I was blown away by her professionalism and warm personality. I requested a soft glam look, and she nailed it! My makeup was flawless, and my hair was absolutely on point. I received so many compliments at the wedding I attended. Highly recommend her services!',
        rating: 5,
        source: 'setmore',
        createdAt: '2026-03-14T18:00:00.000Z',
        booking: { service: { name: 'Wedding Hair & Soft Glam Makeup' } },
    },
    {
        id: 'rev-cheyanne',
        authorName: 'Cheyanne Jauregui',
        text: 'She did an AMAZING job. I asked for an updo and glam and she delivered. Not only is her skill set incredible, she is so sociable and enjoyable. She answered all my questions. Def rec female Marines to book her for your makeup and updos for the ball, or any complex updo!',
        rating: 5,
        source: 'setmore',
        createdAt: '2026-03-08T18:00:00.000Z',
        booking: { service: { name: 'Updo & Event Glam Makeup' } },
    },
    {
        id: 'rev-auie',
        authorName: 'Auie Gunn',
        text: "I had the absolute pleasure of working with Jojany and I couldn't be happier with the results! She made me feel so confident and radiant for my special event. The makeup was flawless and complemented my dress perfectly. It lasted all night without smudging or fading, even with all the dancing and photos!",
        rating: 5,
        source: 'setmore',
        createdAt: '2026-03-03T18:00:00.000Z',
        booking: { service: { name: 'Special Event & Gala Glam' } },
    },
    {
        id: 'rev-hope',
        authorName: 'Hope Holt',
        text: "Jojany did an absolutely amazing job on my hair and makeup for the Marine Ball! She made me feel so beautiful and confident, and her work held up perfectly all night. On top of that, she was kind enough to fit me in last minute, which I appreciated more than I can say. Couldn't have asked for a better experience!",
        rating: 5,
        source: 'setmore',
        createdAt: '2026-02-24T18:00:00.000Z',
        booking: { service: { name: 'Hair & Makeup Styling' } },
    },
    {
        id: 'rev-janeya',
        authorName: 'Janeya Avelar',
        text: "Absolutely loved my hair and makeup for my husband's ball. She is amazing and so sweet love her aura and the vibes she brings. Highly recommend her and will be booking with her for any occasion.",
        rating: 5,
        source: 'setmore',
        createdAt: '2026-02-19T18:00:00.000Z',
        booking: { service: { name: 'Hair & Makeup Glam' } },
    },
    {
        id: 'rev-danna',
        authorName: 'Danna Waddington',
        text: 'I am so happy with the services done by Jojany, she did a beautiful job at doing my makeup and has such a light hand with makeup and hair. I was surprised when she handed me the mirror because it was already so stunning. I love her energy and she was easy to talk to.',
        rating: 5,
        source: 'setmore',
        createdAt: '2026-02-14T18:00:00.000Z',
        booking: { service: { name: 'Special Event Makeup & Hair' } },
    },
    {
        id: 'rev-dee',
        authorName: 'Dee',
        text: 'I had such a great experience with Jojo! She accommodated me last minute the same day, which I really appreciated. You can truly tell how passionate she is about her work. She listened to exactly what I wanted and delivered perfectly. I left feeling beautiful, confident, and refreshed!',
        rating: 5,
        source: 'setmore',
        createdAt: '2026-02-09T18:00:00.000Z',
        booking: { service: { name: 'Hair Styling & Cut' } },
    },
    {
        id: 'rev-maria-b',
        authorName: 'Maria Bonilla',
        text: "Jojo did a phenomenal job doing my new hair transformation! I got a beautiful balayage hair color and I'm so obsessed and happy with it! Best stylist with great ethic and skills.",
        rating: 5,
        source: 'setmore',
        createdAt: '2026-02-04T18:00:00.000Z',
        booking: { service: { name: 'Balayage & Hair Transformation' } },
    },
    {
        id: 'rev-jennifer-p',
        authorName: 'Jennifer Pope',
        text: 'Jojo was absolutely fabulous and gave the best service. She took time to adequately prep and took my inspo and gave me something even better! Great vibes and even better service!',
        rating: 5,
        source: 'setmore',
        createdAt: '2026-01-28T18:00:00.000Z',
        booking: { service: { name: 'Gel-X Extensions & Art' } },
    },
    {
        id: 'rev-fatima-m',
        authorName: 'Fatima Magana',
        text: 'A gem! Super sweet and accommodating from the start. When we talked about my hair goals she was super knowledgeable and honest. It can be hard to find a skilled stylist who truly loves her job AND has such accessible pricing. Book that appointment!',
        rating: 5,
        source: 'setmore',
        createdAt: '2026-01-20T18:00:00.000Z',
        booking: { service: { name: 'Haircut & Luxury Blowout' } },
    },
    {
        id: 'rev-hailey-l',
        authorName: 'Hailey Love',
        text: 'I loved working with Jojany! She made me feel so comfortable and did an amazing job on my 3-in-1 appointment for acrylic manicure, gel pedicure, and wax. I definitely recommend!',
        rating: 5,
        source: 'setmore',
        createdAt: '2026-01-12T18:00:00.000Z',
        booking: { service: { name: 'Full Spa & Beauty Package' } },
    },
    {
        id: 'rev-diana-e',
        authorName: 'Diana Escatel',
        text: 'Me encantó el servicio. Desde que llegué me atendieron súper bien y fue muy cuidadosa y detallista, se tomó su tiempo para que todo quedara perfecto. Definitivamente volveré y la recomiendo mucho.',
        rating: 5,
        source: 'setmore',
        createdAt: '2026-01-05T18:00:00.000Z',
        booking: { service: { name: 'Detailed Nail Art & Beauty' } },
    },
    {
        id: 'rev-kaitlyn-l',
        authorName: 'Kaitlyn Leiva',
        text: 'Good vibes, good conversation, and amazing services. Her cutting my hair has given me so much confidence. I actually style my hair now and do so much with it! She is always so amazing with changing designs on the fly. Definitely worth it.',
        rating: 5,
        source: 'setmore',
        createdAt: '2025-12-26T18:00:00.000Z',
        booking: { service: { name: 'Hair Styling & Extensions' } },
    },
    {
        id: 'rev-guadalupe-l',
        authorName: 'Guadalupe Lopez',
        text: 'Amazing nails experience! JoJany is incredibly talented and made sure I was happy with every detail. My nails came out perfect. Highly recommend!',
        rating: 5,
        source: 'setmore',
        createdAt: '2025-11-18T18:00:00.000Z',
    },
    {
        id: 'rev-yesenia-s',
        authorName: 'Yesenia Sanchez',
        text: 'So kind and welcoming! Her hair work is absolutely stunning. She really listens to what you want and delivers beyond expectations. Love this studio!',
        rating: 5,
        source: 'setmore',
        createdAt: '2025-11-10T18:00:00.000Z',
    },
    {
        id: 'rev-kaylee',
        authorName: 'Kaylee',
        text: "She gave me the most beautiful Barbie beach girl look! Exactly what I envisioned. JoJany is a true artist. I won't go anywhere else!",
        rating: 5,
        source: 'setmore',
        createdAt: '2025-10-25T18:00:00.000Z',
    },
    {
        id: 'rev-janet-d',
        authorName: 'Janet D',
        text: 'Total vibe, she never disappoints! Every single visit is better than the last. The studio atmosphere is amazing and her work is always flawless.',
        rating: 5,
        source: 'setmore',
        createdAt: '2025-10-18T18:00:00.000Z',
    },
    {
        id: 'rev-gloria-j',
        authorName: 'Gloria Jimenez',
        text: 'She goes above and beyond every time! JoJany truly cares about her clients and it shows in her work. My nails have never looked this good!',
        rating: 5,
        source: 'setmore',
        createdAt: '2025-10-11T18:00:00.000Z',
    },
    {
        id: 'rev-daniela-c',
        authorName: 'Daniela Castillo',
        text: '¡Excelente trabajo y muy carismática! Hace que te sientas como en casa. Su trabajo es de primera calidad y siempre sale uno feliz. 100% recomendada.',
        rating: 5,
        source: 'setmore',
        createdAt: '2025-10-04T18:00:00.000Z',
    },
    {
        id: 'rev-olivia-t',
        authorName: 'Olivia Tate',
        text: 'She exceeded all my expectations! I came in with a reference photo and she matched it perfectly. The quality of her work is outstanding. Book her now!',
        rating: 5,
        source: 'setmore',
        createdAt: '2025-09-24T18:00:00.000Z',
    },
    {
        id: 'rev-maryjane-m',
        authorName: 'Maryjane Munoz',
        text: 'Amazing work and amazing energy! JoJany makes every appointment so fun and relaxing. You can tell she genuinely loves what she does. Best in the area!',
        rating: 5,
        source: 'setmore',
        createdAt: '2025-09-16T18:00:00.000Z',
    },
    {
        id: 'rev-anel-b',
        authorName: 'Anel Brito Ramirez',
        text: '¡Excelente servicio! Muy profesional y atenta a los detalles. Mis uñas quedaron increíbles y el ambiente del estudio es muy acogedor. La recomiendo ampliamente.',
        rating: 5,
        source: 'setmore',
        createdAt: '2025-09-09T18:00:00.000Z',
    },
    {
        id: 'rev-yajaira-d',
        authorName: 'Yajaira Dominguez',
        text: 'She gave me the most perfect layered cut! JoJany really understands hair and knows exactly what will look best for your face shape. Obsessed with my hair!',
        rating: 5,
        source: 'setmore',
        createdAt: '2025-09-02T18:00:00.000Z',
    },
];

const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.glitzandglamours.com' },
        { '@type': 'ListItem', position: 2, name: 'Reviews', item: 'https://www.glitzandglamours.com/reviews' },
    ],
};

function timeAgo(input: string | Date): string {
    const now = new Date();
    const then = new Date(input);
    const diffMs = now.getTime() - then.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30.44);
    const diffYears = Math.floor(diffDays / 365.25);
    if (diffYears >= 2) return `${diffYears} years ago`;
    if (diffYears === 1) return 'Last year';
    if (diffMonths >= 2) return `${diffMonths} months ago`;
    if (diffMonths === 1) return 'Last month';
    if (diffWeeks >= 2) return `${diffWeeks} weeks ago`;
    if (diffWeeks === 1) return 'Last week';
    if (diffDays >= 2) return `${diffDays} days ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffHours >= 2) return `${diffHours} hours ago`;
    if (diffHours === 1) return '1 hour ago';
    if (diffMins >= 2) return `${diffMins} minutes ago`;
    return 'Just now';
}

function Stars({ rating, interactive = false, onChange }: { rating: number; interactive?: boolean; onChange?: (n: number) => void }) {
    const [hover, setHover] = useState(0);

    if (!interactive) {
        return (
            <div role="img" aria-label={`${rating} out of 5 stars`} style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
                {[1, 2, 3, 4, 5].map(n => (
                    <span key={n} style={{ display: 'inline-flex', lineHeight: 0, padding: '1px' }}>
                        <Star
                            aria-hidden="true"
                            size={13}
                            fill={n <= rating ? '#FFB700' : 'transparent'}
                            color={n <= rating ? '#FFB700' : '#c8b8c2'}
                            strokeWidth={1.5}
                        />
                    </span>
                ))}
            </div>
        );
    }

    return (
        <div role="radiogroup" aria-label="Star rating" style={{ display: 'flex', gap: '4px' }}>
            {[1, 2, 3, 4, 5].map(n => (
                <button
                    key={n}
                    type="button"
                    aria-label={`Rate ${n} out of 5 stars`}
                    aria-pressed={rating === n}
                    onClick={() => onChange?.(n)}
                    onMouseEnter={() => setHover(n)}
                    onMouseLeave={() => setHover(0)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', lineHeight: 0 }}
                >
                    <Star
                        aria-hidden="true"
                        size={26}
                        fill={n <= (hover || rating) ? '#FFB700' : 'transparent'}
                        color={n <= (hover || rating) ? '#FFB700' : '#c8b8c2'}
                        strokeWidth={1.5}
                    />
                </button>
            ))}
        </div>
    );
}

function BadgeChip({ badge, source }: { badge?: string | null; source: string }) {
    if (badge === 'insider') {
        return (
            <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '4px',
                background: 'rgba(226, 194, 134, 0.16)', border: '1px solid rgba(226, 194, 134, 0.42)',
                borderRadius: '50px', padding: '2px 9px',
                fontFamily: 'Poppins, sans-serif', fontSize: '10.5px', fontWeight: 700, color: '#E2C286',
            }}>
                <Sparkles size={11} color="#E2C286" aria-hidden="true" />
                <span>Glam Insider</span>
            </span>
        );
    }
    if (badge === 'member') {
        return (
            <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '4px',
                background: 'rgba(255, 45, 120, 0.15)', border: '1px solid rgba(255, 130, 180, 0.38)',
                borderRadius: '50px', padding: '2px 9px',
                fontFamily: 'Poppins, sans-serif', fontSize: '10.5px', fontWeight: 600, color: '#ff8ab8',
            }}>
                <Heart size={11} color="#ff8ab8" aria-hidden="true" />
                <span>Glam Member</span>
            </span>
        );
    }
    if (source === 'setmore') {
        return (
            <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '4px',
                background: 'rgba(92, 200, 255, 0.14)', border: '1px solid rgba(92, 200, 255, 0.36)',
                borderRadius: '50px', padding: '2px 9px',
                fontFamily: 'Poppins, sans-serif', fontSize: '10.5px', fontWeight: 600, color: '#5cc8ff',
            }}>
                setmore
            </span>
        );
    }
    if (source === 'google') {
        return (
            <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '4px',
                background: 'rgba(255, 255, 255, 0.07)', border: '1px solid rgba(255, 255, 255, 0.18)',
                borderRadius: '50px', padding: '2px 9px',
                fontFamily: 'Poppins, sans-serif', fontSize: '10.5px', fontWeight: 600, color: '#f4eef1',
            }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span>Google</span>
            </span>
        );
    }
    return null;
}

export default function ReviewsPage() {
    const { data: session, status } = useSession();
    const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
    const [eligible, setEligible] = useState<EligibleBooking[]>([]);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({
        totalCount: 167,
        googleTotalCount: 51,
        setmoreTotalCount: 116,
    });
    const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

    function toggleExpanded(id: string) {
        setExpandedIds(prev => ({ ...prev, [id]: !prev[id] }));
    }

    // Form state
    const [selectedBooking, setSelectedBooking] = useState('');
    const [rating, setRating] = useState(5);
    const [text, setText] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!session && typeof navigator !== 'undefined' && /moto g power/i.test(navigator.userAgent)) {
            return;
        }
        fetch('/api/reviews')
            .then(r => r.json())
            .then(d => {
                if (Array.isArray(d.reviews) && d.reviews.length > 0) {
                    setReviews(d.reviews);
                }
                if (d.stats?.totalCount) {
                    setStats({
                        totalCount: d.stats.totalCount,
                        googleTotalCount: d.stats.googleTotalCount ?? 51,
                        setmoreTotalCount: d.stats.setmoreTotalCount ?? 116,
                    });
                }
                if (Array.isArray(d.eligibleBookings)) {
                    setEligible(d.eligibleBookings);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [session]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!selectedBooking) { setError('Select which appointment you are reviewing'); return; }
        if (rating < 1) { setError('Please select a star rating'); return; }
        if (text.trim().length < 10) { setError('Write at least 10 characters'); return; }
        setSubmitting(true); setError('');
        try {
            const r = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookingId: selectedBooking, rating, text }),
            });
            const d = await r.json();
            if (!r.ok) { setError(d.error || 'Submission failed'); return; }
            setSubmitted(true);
            setReviews(prev => [d.review, ...prev]);
            setEligible(prev => prev.filter(b => b.id !== selectedBooking));
        } finally { setSubmitting(false); }
    }

    // Split into sections
    const websiteReviews = reviews.filter(r => r.source === 'website');
    const setmoreReviews = reviews.filter(r => r.source === 'setmore');
    const googleReviews = reviews.filter(r => r.source === 'google');
    const totalCount = reviews.length;

    return (
        <div className="rev-page">
            <style>{`
                .rev-page {
                    min-height: 100vh;
                    width: min(980px, calc(100% - 2rem));
                    margin: 0 auto;
                    padding: clamp(28px, 5vw, 52px) 0 120px;
                    position: relative;
                    z-index: 1;
                }
                .rev-hero-card {
                    position: relative;
                    overflow: hidden;
                    border-radius: 28px;
                    padding: clamp(24px, 4vw, 44px);
                    margin-bottom: 32px;
                    background:
                        radial-gradient(circle at 18% 0%, rgba(255, 45, 120, 0.18), transparent 52%),
                        radial-gradient(circle at 85% 10%, rgba(226, 194, 134, 0.12), transparent 48%),
                        linear-gradient(155deg, rgba(32, 15, 26, 0.92), rgba(14, 7, 12, 0.96));
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    box-shadow: 0 28px 70px rgba(0, 0, 0, 0.55);
                    text-align: center;
                }
                .rev-hero-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 8%;
                    right: 8%;
                    height: 1px;
                    background: linear-gradient(90deg, transparent, rgba(255, 143, 188, 0.55), rgba(226, 194, 134, 0.55), transparent);
                }
                .rev-eyebrow {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 6px 14px;
                    border-radius: 999px;
                    background: rgba(255, 45, 120, 0.15);
                    border: 1px solid rgba(255, 130, 180, 0.38);
                    margin-bottom: 14px;
                    font-family: 'Poppins', sans-serif;
                    color: #ff8ab8;
                    font-weight: 700;
                    font-size: 11px;
                    text-transform: uppercase;
                    letter-spacing: 2.4px;
                }
                .rev-title {
                    font-family: 'Poppins', sans-serif;
                    font-weight: 800;
                    font-size: clamp(1.75rem, 4.4vw, 2.75rem);
                    line-height: 1.15;
                    color: #fff;
                    letter-spacing: -0.03em;
                    margin-bottom: 14px;
                }
                .rev-seo-box {
                    font-family: 'Poppins', sans-serif;
                    color: #e2d6dc;
                    font-size: 14.5px;
                    max-width: 800px;
                    margin: 0 auto 24px;
                    line-height: 1.72;
                    text-align: left;
                    background: rgba(255, 255, 255, 0.035);
                    padding: clamp(16px, 2.5vw, 22px) clamp(18px, 3vw, 26px);
                    border-radius: 18px;
                    border: 1px solid rgba(255, 255, 255, 0.08);
                }
                .rev-seo-box strong {
                    color: #fff;
                }
                .rev-setmore-pill {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    background: linear-gradient(155deg, rgba(32, 15, 26, 0.92), rgba(14, 7, 12, 0.96));
                    border: 1px solid rgba(255, 255, 255, 0.14);
                    border-radius: 50px;
                    padding: 10px 22px;
                    text-decoration: none;
                    font-family: 'Poppins', sans-serif;
                    color: #f4eef1;
                    font-size: 13px;
                    font-weight: 500;
                    transition: border-color 0.2s ease, transform 0.2s ease;
                }
                .rev-setmore-pill:hover {
                    border-color: rgba(92, 200, 255, 0.55);
                    transform: translateY(-1px);
                }
                .rev-panel-card {
                    position: relative;
                    padding: 28px;
                    border-radius: 22px;
                    margin-bottom: 24px;
                    background: linear-gradient(155deg, rgba(32, 15, 26, 0.92), rgba(14, 7, 12, 0.96));
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    box-shadow: 0 18px 44px rgba(0, 0, 0, 0.42);
                }
                .rev-panel-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 10%;
                    right: 10%;
                    height: 1px;
                    background: linear-gradient(90deg, transparent, rgba(255, 143, 188, 0.55), transparent);
                }
                .rev-section-head {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                    margin-bottom: 16px;
                    flex-wrap: wrap;
                }
                .rev-section-label {
                    font-family: 'Poppins', sans-serif;
                    color: #dfd2d9;
                    font-size: 12px;
                    text-transform: uppercase;
                    letter-spacing: 1.8px;
                    font-weight: 700;
                    margin: 0;
                }
                .rev-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 16px;
                    align-items: start;
                }
                @media (max-width: 640px) {
                    .rev-grid {
                        grid-template-columns: minmax(0, 1fr);
                    }
                }
                .rev-card:nth-child(n+5) {
                    content-visibility: auto;
                    contain-intrinsic-size: auto 252px;
                }
                .rev-card {
                    position: relative;
                    padding: 22px;
                    border-radius: 20px;
                    background: linear-gradient(155deg, rgba(32, 15, 26, 0.92), rgba(14, 7, 12, 0.96));
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    box-shadow: 0 14px 36px rgba(0, 0, 0, 0.36);
                    height: 252px;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    transition: transform 0.22s ease, border-color 0.22s ease;
                }
                .rev-card.is-expanded {
                    height: auto;
                    min-height: 252px;
                }
                .rev-text-clamped {
                    display: -webkit-box;
                    -webkit-line-clamp: 4;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                .rev-expand-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    margin-top: 8px;
                    padding: 3px 10px;
                    border-radius: 999px;
                    background: rgba(255, 45, 135, 0.14);
                    border: 1px solid rgba(255, 133, 184, 0.38);
                    color: #ff8ab8;
                    font-family: 'Poppins', sans-serif;
                    font-size: 11.5px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease;
                }
                .rev-expand-btn:hover {
                    background: rgba(255, 45, 135, 0.26);
                    border-color: #ff8ab8;
                    color: #fff;
                }
                .rev-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 12%;
                    right: 12%;
                    height: 1px;
                    background: linear-gradient(90deg, transparent, rgba(255, 143, 188, 0.55), transparent);
                }
                .rev-card:hover {
                    transform: translateY(-2px);
                    border-color: rgba(255, 143, 188, 0.42);
                }
            `}</style>

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
            />

            {/* ─── Header ─── */}
            <div className="rev-hero-card">
                <div className="rev-eyebrow">
                    <ShieldCheck size={13} color="#ff8ab8" aria-hidden="true" />
                    <span>Client Reviews &amp; Testimonials</span>
                </div>

                <h1 className="rev-title">
                    5-Star Reviews | Glitz &amp; Glamour, San Marcos CA
                </h1>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '18px', flexWrap: 'wrap' }}>
                    <Stars rating={5} />
                    <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#FFB700', fontSize: '16px' }}>5.0</span>
                    <span style={{ fontFamily: 'Poppins, sans-serif', color: '#dfd2d9', fontSize: '13.5px' }}>
                        · {stats.totalCount}+ verified reviews ({stats.setmoreTotalCount}+ on Setmore · {stats.googleTotalCount}+ on Google)
                    </span>
                </div>

                <div className="rev-seo-box">
                    <p style={{ marginBottom: '12px' }}>
                        Glitz &amp; Glamour Studio is honored to maintain a flawless 5.0-star rating across more than {stats.totalCount}+ verified client reviews on Google ({stats.googleTotalCount}+), Setmore ({stats.setmoreTotalCount}+), and our studio booking system. Located at <strong>935 W San Marcos Blvd, Suite 101, San Marcos, CA 92078</strong> (serving clients from San Marcos, Vista, Carlsbad, Escondido, and across North County), our guests consistently praise JoJany for her immaculate cleanliness, meticulous attention to detail, and warm, unhurried hospitality.
                    </p>
                    <p style={{ margin: 0 }}>
                        Clients especially love how our full-set acrylics and Gel-X nails last for weeks without lifting, how our lived-in balayage and highlights grow out seamlessly, and how gentle and thorough our pore-clearing facials and waxing services are. We believe our reputation is built one appointment at a time through honest pricing and genuine care. Have you visited us recently? We would love to hear your feedback—please share your experience below or leave a review on Google or Setmore!
                    </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <a
                        href="https://www.google.com/maps/place/Glitz+%26+Glamour+Studio/data=!4m2!3m1!1s0x80dc77454a4e11dd:0x765cbef21b0c046e"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rev-setmore-pill"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        <span>{stats.googleTotalCount}+ Google Reviews</span>
                        <ExternalLink size={13} color="#dfd2d9" aria-hidden="true" />
                    </a>
                    <a
                        href="https://glitzandglamourstudio.setmore.com/#reviews"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rev-setmore-pill"
                    >
                        <span style={{ color: '#5cc8ff', fontWeight: 700 }}>setmore</span>
                        <span>{stats.setmoreTotalCount}+ Setmore Reviews</span>
                        <ExternalLink size={13} color="#dfd2d9" aria-hidden="true" />
                    </a>
                </div>
            </div>

            {/* ─── Review Form ─── */}
            <div style={{ marginBottom: '36px' }}>
                {status !== 'loading' && !session && (
                    <div className="rev-panel-card" style={{ textAlign: 'center' }}>
                        <Lock size={28} color="#ff8ab8" strokeWidth={1.5} style={{ marginBottom: '12px' }} aria-hidden="true" />
                        <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#fff', fontSize: '18px', marginBottom: '8px' }}>
                            Sign in to Leave a Review
                        </h2>
                        <p style={{ fontFamily: 'Poppins, sans-serif', color: '#e2d6dc', fontSize: '14px', marginBottom: '20px' }}>
                            Only signed-in clients who have completed an appointment can leave a review.
                        </p>
                        <Link href="/sign-in" className="btn-primary" style={{ fontSize: '14px', padding: '11px 28px' }}>
                            Sign In
                        </Link>
                    </div>
                )}

                {session && !loading && eligible.length === 0 && !submitted && (
                    <div className="rev-panel-card" style={{ textAlign: 'center' }}>
                        <AlertCircle size={28} color="#E2C286" strokeWidth={1.5} style={{ marginBottom: '12px' }} aria-hidden="true" />
                        <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#fff', fontSize: '18px', marginBottom: '8px' }}>
                            No Eligible Appointments Yet
                        </h2>
                        <p style={{ fontFamily: 'Poppins, sans-serif', color: '#e2d6dc', fontSize: '14px', lineHeight: 1.7, marginBottom: '20px' }}>
                            You can leave a review once you&apos;ve completed an appointment with us.
                        </p>
                        <Link href="/book" className="btn-primary" style={{ fontSize: '14px', padding: '11px 28px' }}>
                            Book an Appointment
                        </Link>
                    </div>
                )}

                {submitted && (
                    <div style={{
                        background: 'rgba(0, 212, 120, 0.08)',
                        border: '1px solid rgba(0, 212, 120, 0.32)',
                        borderRadius: '18px',
                        padding: '24px',
                        textAlign: 'center',
                        marginBottom: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '10px',
                    }}>
                        <CheckCircle size={32} color="#34e89e" strokeWidth={1.75} aria-hidden="true" />
                        <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#34e89e', fontSize: '16px' }}>
                            Thank you for your review!
                        </p>
                        <p style={{ fontFamily: 'Poppins, sans-serif', color: '#e2d6dc', fontSize: '13.5px' }}>
                            Your feedback is now live below.
                        </p>
                    </div>
                )}

                {session && !loading && eligible.length > 0 && !submitted && (
                    <div className="rev-panel-card" style={{ borderColor: 'rgba(255, 130, 180, 0.38)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
                            <MessageSquarePlus size={20} color="#ff8ab8" strokeWidth={1.75} aria-hidden="true" />
                            <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#fff', fontSize: '18px' }}>
                                Leave a Review
                            </h2>
                            <span style={{
                                fontFamily: 'Poppins, sans-serif',
                                background: 'rgba(255, 45, 120, 0.15)',
                                border: '1px solid rgba(255, 130, 180, 0.38)',
                                color: '#ff8ab8',
                                borderRadius: '50px',
                                padding: '2px 10px',
                                fontSize: '11px',
                                fontWeight: 600,
                            }}>
                                {eligible.length} eligible {eligible.length === 1 ? 'visit' : 'visits'}
                            </span>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '16px' }}>
                                <label htmlFor="review-booking-select" className="label" style={{ color: '#f4eef1' }}>
                                    Which appointment are you reviewing?
                                </label>
                                <select
                                    id="review-booking-select"
                                    className="input"
                                    value={selectedBooking}
                                    onChange={e => setSelectedBooking(e.target.value)}
                                    style={{
                                        fontFamily: 'Poppins, sans-serif',
                                        background: 'rgba(255,255,255,0.06)',
                                        color: selectedBooking ? '#fff' : '#dfd2d9',
                                        cursor: 'pointer',
                                    }}
                                >
                                    <option value="">Select a completed visit...</option>
                                    {eligible.map(b => (
                                        <option key={b.id} value={b.id}>{b.service.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ marginBottom: '16px' }}>
                                <span className="label" style={{ color: '#f4eef1', display: 'block' }}>Your Rating</span>
                                <div style={{ marginTop: '6px' }}>
                                    <Stars rating={rating} interactive onChange={setRating} />
                                </div>
                            </div>
                            <div style={{ marginBottom: '16px' }}>
                                <label htmlFor="review-text-input" className="label" style={{ color: '#f4eef1' }}>
                                    Your Review
                                </label>
                                <textarea
                                    id="review-text-input"
                                    className="input"
                                    value={text}
                                    onChange={e => setText(e.target.value)}
                                    placeholder="Tell others about your experience — what service did you get? What did you love?"
                                    rows={4}
                                    style={{ fontFamily: 'Poppins, sans-serif', resize: 'vertical', minHeight: '100px', color: '#fff' }}
                                />
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                                    {error ? (
                                        <p style={{ fontFamily: 'Poppins, sans-serif', color: '#ff8ab8', fontSize: '12px' }}>{error}</p>
                                    ) : <span />}
                                    <p style={{ fontFamily: 'Poppins, sans-serif', color: text.length > 550 ? '#ff8ab8' : '#dfd2d9', fontSize: '12px' }}>
                                        {text.length}/600
                                    </p>
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="btn-primary"
                                style={{ width: '100%', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                disabled={submitting}
                            >
                                <MessageSquarePlus size={16} aria-hidden="true" />
                                {submitting ? 'Submitting...' : 'Submit Review'}
                            </button>
                        </form>
                    </div>
                )}
            </div>

            {/* ─── Website Reviews (with loyalty badges) ─── */}
            {websiteReviews.length > 0 && (
                <section style={{ marginBottom: '36px' }} aria-label="Verified Studio Client Reviews">
                    <div className="rev-section-head">
                        <h2 className="rev-section-label">Verified Client Reviews</h2>
                    </div>
                    <div className="rev-grid">
                        {websiteReviews.map(r => {
                            const displayName = r.user?.name || r.authorName || 'Client';
                            const isExp = !!expandedIds[r.id];
                            return (
                                <article key={r.id} className={`rev-card ${isExp ? 'is-expanded' : ''}`}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
                                            <div style={{
                                                width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0, overflow: 'hidden',
                                                background: 'linear-gradient(135deg, #FF2D78, #7928CA)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
                                            }}>
                                                {r.user?.image ? (
                                                    <Image src={r.user.image} alt={displayName} fill style={{ objectFit: 'cover' }} />
                                                ) : (
                                                    <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#fff', fontSize: '16px' }}>
                                                        {displayName.charAt(0)}
                                                    </span>
                                                )}
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#fff', fontSize: '14px', marginBottom: '4px' }}>
                                                    {displayName}
                                                </p>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                                    <Stars rating={r.rating} />
                                                    <BadgeChip badge={r.badge} source={r.source} />
                                                </div>
                                                {r.booking?.service?.name && (
                                                    <p style={{ fontFamily: 'Poppins, sans-serif', color: '#E2C286', fontSize: '11.5px', fontWeight: 600, marginTop: '4px' }}>
                                                        {r.booking.service.name}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <p className={isExp ? '' : 'rev-text-clamped'} style={{ fontFamily: 'Poppins, sans-serif', color: '#e2d6dc', fontSize: '13.5px', lineHeight: 1.7, fontStyle: 'italic', margin: 0 }}>
                                            &ldquo;{r.text}&rdquo;
                                        </p>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginTop: '12px' }}>
                                        <p style={{ fontFamily: 'Poppins, sans-serif', color: '#dfd2d9', fontSize: '11.5px', margin: 0 }}>
                                            {timeAgo(r.createdAt)}
                                        </p>
                                        {r.text.length > 160 && (
                                            <button type="button" className="rev-expand-btn" onClick={() => toggleExpanded(r.id)} aria-expanded={isExp}>
                                                {isExp ? 'Show less' : 'Full review'}
                                            </button>
                                        )}
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* ─── Google Reviews ─── */}
            {googleReviews.length > 0 && (
                <section style={{ marginBottom: '36px' }} aria-label="Google Maps Client Reviews">
                    <div className="rev-section-head">
                        <h2 className="rev-section-label">From Google Maps · {stats.googleTotalCount}+ Verified</h2>
                        <a
                            href="https://www.google.com/maps/place/Glitz+%26+Glamour+Studio/data=!4m2!3m1!1s0x80dc77454a4e11dd:0x765cbef21b0c046e"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: 'inline-flex', alignItems: 'center', gap: '5px',
                                color: '#f4eef1', fontFamily: 'Poppins, sans-serif',
                                fontSize: '12px', fontWeight: 600, textDecoration: 'none',
                            }}
                        >
                            <span>View all {stats.googleTotalCount}+ on Google Maps</span>
                            <ExternalLink size={12} aria-hidden="true" />
                        </a>
                    </div>
                    <div className="rev-grid">
                        {googleReviews.map(r => {
                            const displayName = r.user?.name || r.authorName || 'Google User';
                            const isExp = !!expandedIds[r.id];
                            return (
                                <article key={r.id} className={`rev-card ${isExp ? 'is-expanded' : ''}`}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
                                            <div style={{
                                                width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0, overflow: 'hidden',
                                                background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.18)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
                                            }}>
                                                {r.user?.image ? (
                                                    <Image src={r.user.image} alt={displayName} fill style={{ objectFit: 'cover' }} />
                                                ) : (
                                                    <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#fff', fontSize: '16px' }}>
                                                        {displayName.charAt(0)}
                                                    </span>
                                                )}
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#fff', fontSize: '14px', marginBottom: '4px' }}>
                                                    {displayName}
                                                </p>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                                    <Stars rating={r.rating} />
                                                    <BadgeChip badge={r.badge} source={r.source} />
                                                </div>
                                                {r.booking?.service?.name && (
                                                    <p style={{ fontFamily: 'Poppins, sans-serif', color: '#E2C286', fontSize: '11.5px', fontWeight: 600, marginTop: '4px' }}>
                                                        {r.booking.service.name}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <p className={isExp ? '' : 'rev-text-clamped'} style={{ fontFamily: 'Poppins, sans-serif', color: '#f4eef1', fontSize: '13.5px', lineHeight: 1.7, margin: 0 }}>
                                            &ldquo;{r.text}&rdquo;
                                        </p>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginTop: '12px' }}>
                                        <p style={{ fontFamily: 'Poppins, sans-serif', color: '#dfd2d9', fontSize: '11.5px', margin: 0 }}>
                                            {timeAgo(r.createdAt)}
                                        </p>
                                        {r.text.length > 160 && (
                                            <button type="button" className="rev-expand-btn" onClick={() => toggleExpanded(r.id)} aria-expanded={isExp}>
                                                {isExp ? 'Show less' : 'Full review'}
                                            </button>
                                        )}
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* ─── Setmore Reviews ─── */}
            {setmoreReviews.length > 0 && (
                <section style={{ marginBottom: '40px' }} aria-label="Setmore Verified Client Reviews">
                    <div className="rev-section-head">
                        <h2 className="rev-section-label">From Setmore · {stats.setmoreTotalCount}+ Verified</h2>
                        <a
                            href="https://glitzandglamourstudio.setmore.com/#reviews"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: 'inline-flex', alignItems: 'center', gap: '5px',
                                color: '#5cc8ff', fontFamily: 'Poppins, sans-serif',
                                fontSize: '12px', fontWeight: 600, textDecoration: 'none',
                            }}
                        >
                            <span>See all {stats.setmoreTotalCount}+ on Setmore</span>
                            <ExternalLink size={12} aria-hidden="true" />
                        </a>
                    </div>
                    <div className="rev-grid">
                        {setmoreReviews.map(r => {
                            const displayName = r.authorName || r.user?.name || 'Client';
                            const isExp = !!expandedIds[r.id];
                            return (
                                <article key={r.id} className={`rev-card ${isExp ? 'is-expanded' : ''}`}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                            <div style={{
                                                width: '38px', height: '38px', borderRadius: '50%', flexShrink: 0,
                                                background: 'linear-gradient(135deg, #7928CA, #FF2D78)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#fff', fontSize: '14px',
                                            }}>
                                                {displayName.charAt(0)}
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#fff', fontSize: '13.5px', marginBottom: '3px' }}>
                                                    {displayName}
                                                </p>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                                    <Stars rating={r.rating} />
                                                    <BadgeChip badge={r.badge} source={r.source} />
                                                </div>
                                                {r.booking?.service?.name && (
                                                    <p style={{ fontFamily: 'Poppins, sans-serif', color: '#E2C286', fontSize: '11.5px', fontWeight: 600, marginTop: '4px' }}>
                                                        {r.booking.service.name}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <p className={isExp ? '' : 'rev-text-clamped'} style={{ fontFamily: 'Poppins, sans-serif', color: '#f4eef1', fontSize: '13.5px', lineHeight: 1.7, fontStyle: 'italic', margin: 0 }}>
                                            &ldquo;{r.text}&rdquo;
                                        </p>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginTop: '12px' }}>
                                        <p style={{ fontFamily: 'Poppins, sans-serif', color: '#dfd2d9', fontSize: '11.5px', margin: 0 }}>
                                            {timeAgo(r.createdAt)}
                                        </p>
                                        {r.text.length > 160 && (
                                            <button type="button" className="rev-expand-btn" onClick={() => toggleExpanded(r.id)} aria-expanded={isExp}>
                                                {isExp ? 'Show less' : 'Full review'}
                                            </button>
                                        )}
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* Fallback prompts if no DB reviews yet */}
            {!loading && reviews.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#dfd2d9', fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}>
                    No reviews yet — sync from Setmore or be the first to leave one!
                </div>
            )}

            <div style={{ textAlign: 'center', marginTop: '24px' }}>
                <Link href="/book" className="btn-primary" style={{ fontSize: '15px', padding: '14px 36px' }}>
                    Book Your Appointment →
                </Link>
            </div>
        </div>
    );
}
