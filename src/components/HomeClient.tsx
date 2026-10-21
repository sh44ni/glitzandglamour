'use client';

import { useState, useEffect, useRef } from 'react';
import { Star, ChevronRight, MapPin, Award, Lock, ChevronLeft, Sparkles, Gift, Smartphone, Cake, Wallet } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

const EMPTY_PIXEL = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

function resolveOptimizedHeroUrl(url: string, idx: number): string {
  if (idx === 0 && (url === '/hero-slider/slide-1.webp' || url === '/hero-slider/slide-1-hero.webp')) {
    return '/hero-slider/slide-1-hero.webp';
  }
  const m = url.match(/^\/hero-slider\/slide-([2-7])\.webp$/);
  if (m) return `/hero-slider/slide-${m[1]}-sm.webp`;
  return url;
}

const INITIAL_REVIEWS: ReviewItem[] = [
  { name: 'C. Hernandez', text: 'A true professional and master of her craft. I immediately felt comfortable and knew I was in good hands. I loved my haircut! It was better than I expected could be done with my thinning hair. And I left feeling much more confident after her guidance on styling my realistically manageable cut.', date: 'Oct 2026', initial: 'C', rating: 5, source: 'google' },
  { name: 'RO Escobar', text: 'I had my first appointment with Jojany on Monday, and I absolutely LOVE my hair! From the moment I arrived, she made me feel so comfortable, and her salon is super cute and stylish. If you’re looking for a change and want someone who makes you feel comfortable and confident, I highly recommend Jojany!', date: 'Oct 2026', initial: 'R', rating: 5, source: 'google' },
  { name: 'elizabeth ponce', text: 'i was able to get squeezed in last minute and im in love with my haircut!! very friendly service and good communication.', date: 'Oct 2026', initial: 'E', rating: 5, source: 'google' },
  { name: 'Delphine Egler', text: 'Thank you Jojo you did an amazing job! I love my new nails!', date: 'Oct 2026', initial: 'D', rating: 5, source: 'google' },
  { name: 'Ruth Quinones', text: 'First time EVER getting gel-x nails and she did NOT disappoint. Very clean and explained well the whole process since it was my first time. Very detailed on her work. Overall Aura was very nice. Thank you so much for this wonderful experience. Definitely going back!', date: 'Jun 2026', initial: 'R', rating: 5, source: 'google' },
  { name: 'Anaid Sumano', text: 'This was my first time getting my nails done in years and Jojany did the EXACT design I requested. Truly, so shocked to see how incredible my nails came out and how sweet she was throughout the entire appointment. I look forward to dropping in for a fill soon!', date: 'May 2026', initial: 'A', rating: 5, source: 'google' },
  { name: 'Lilith Jane', text: 'Jo is the BEST nail tech. She’s incredibly talented in her gelx work and the retention is incredible. The nails last, they’re strong, they’re beautiful, and for a hell of a price too! Book with Jo!!!', date: 'Apr 2026', initial: 'L', rating: 5, source: 'google' },
  { name: 'Evelyn Nunez', text: 'My girl JoJo ateee downnn with all my sets she has done. She’s such a kinda sweet soul that does amazing in her job. Every time I have gone with her she has always made me feel welcomed and does my nails exactly how I want them!!!', date: 'Apr 2026', initial: 'E', rating: 5, source: 'google' },
  { name: 'Diana Ortiz', text: 'I love my nail sets that I get done by jojo! She always does so much better than the inspo!!! She did an amazing job on my hair as well, I went from brown highlights to honey blonde!', date: 'Apr 2026', initial: 'D', rating: 5, source: 'google' },
  { name: 'Meredith Weissberg', text: 'Jojo does an amazing job at all my nail sets! I love my new set she just did and can\'t stop looking at them. She is super affordable and takes her time with every step! I love getting my nails done by her!', date: 'Apr 2026', initial: 'M', rating: 5, source: 'google' },
  { name: 'Rosita M.', text: 'My girl was AMAZING! I booked Jojany for both makeup and hair... I requested a soft glam look, and she nailed it! My makeup was flawless, and my hair was absolutely on point. Highly recommend her services!', date: 'Mar 2026', initial: 'R', rating: 5, source: 'setmore' },
  { name: 'Cheyanne Jauregui', text: 'She did an AMAZING job. I asked for an updo and glam and she delivered. Not only is her skill set incredible, she is so sociable and enjoyable. Def rec female Marines to book her for your makeup and updos for the ball!', date: 'Mar 2026', initial: 'C', rating: 5, source: 'setmore' },
  { name: 'Auie Gunn', text: 'I had the absolute pleasure of working with Jojany and I couldn\'t be happier with the results! She made me feel so confident and radiant for my special event. The makeup was flawless and lasted all night!', date: 'Mar 2026', initial: 'A', rating: 5, source: 'setmore' },
  { name: 'Hope Holt', text: 'Jojany did an absolutely amazing job on my hair and makeup for the Marine Ball! She made me feel so beautiful and confident, and her work held up perfectly all night.', date: 'Feb 2026', initial: 'H', rating: 5, source: 'setmore' },
  { name: 'Janeya Avelar', text: 'Absolutely loved my hair and makeup for my husband\'s ball. She is amazing and so sweet love her aura and the vibes she brings. Highly recommend her and will be booking with her for any occasion.', date: 'Feb 2026', initial: 'J', rating: 5, source: 'setmore' },
  { name: 'Danna Waddington', text: 'I am so happy with the services done by Jojany, she did a beautiful job at doing my makeup and has such a light hand with makeup and hair. I love her energy and she was easy to talk to.', date: 'Feb 2026', initial: 'D', rating: 5, source: 'setmore' },
  { name: 'Dee', text: 'I had such a great experience with Jojo! She accommodated me last minute the same day, which I really appreciated. She listened to exactly what I wanted and delivered perfectly.', date: 'Feb 2026', initial: 'D', rating: 5, source: 'setmore' },
  { name: 'Maria Bonilla', text: 'Jojo did a phenomenal job doing my new hair transformation! I got a beautiful balayage hair color and I\'m so obsessed and happy with it! Best stylist with great ethic and skills.', date: 'Feb 2026', initial: 'M', rating: 5, source: 'setmore' },
  { name: 'Jennifer Pope', text: 'Jojo was absolutely fabulous and gave the best service. She took time to adequately prep and took my inspo and gave me something even better! Great vibes and even better service!', date: 'Jan 2026', initial: 'J', rating: 5, source: 'setmore' },
  { name: 'Fatima Magana', text: 'A gem! Super sweet and accommodating from the start. When we talked about my hair goals she was super knowledgeable and honest. Book that appointment!', date: 'Jan 2026', initial: 'F', rating: 5, source: 'setmore' },
  { name: 'Hailey Love', text: 'I loved working with Jojany! She made me feel so comfortable and did an amazing job on my 3-in-1 appointment for acrylic manicure, gel pedicure, and wax. I definitely recommend!', date: 'Jan 2026', initial: 'H', rating: 5, source: 'setmore' },
  { name: 'Diana Escatel', text: 'Me encantó el servicio. Desde que llegué me atendieron súper bien y fue muy cuidadosa y detallista, se tomó su tiempo para que todo quedara perfecto. Definitivamente volveré y la recomiendo mucho.', date: 'Jan 2026', initial: 'D', rating: 5, source: 'setmore' },
  { name: 'Kaitlyn Leiva', text: 'Good vibes, good conversation, and amazing services. Her cutting my hair has given me so much confidence. She is always so amazing with changing designs on the fly. Definitely worth it.', date: 'Dec 2025', initial: 'K', rating: 5, source: 'setmore' },
  { name: 'Guadalupe Lopez', text: 'Amazing nails experience! JoJany is incredibly talented and made sure I was happy with every detail. My nails came out perfect. Highly recommend!', date: 'Nov 2025', initial: 'G', rating: 5, source: 'setmore' },
  { name: 'Yesenia Sanchez', text: 'So kind and welcoming! Her hair work is absolutely stunning. She really listens to what you want and delivers beyond expectations. Love this studio!', date: 'Nov 2025', initial: 'Y', rating: 5, source: 'setmore' },
  { name: 'Kaylee', text: 'She gave me the most beautiful Barbie beach girl look! Exactly what I envisioned. JoJany is a true artist. I won\'t go anywhere else!', date: 'Oct 2025', initial: 'K', rating: 5, source: 'setmore' },
  { name: 'Janet D', text: 'Total vibe, she never disappoints! Every single visit is better than the last. The studio atmosphere is amazing and her work is always flawless.', date: 'Oct 2025', initial: 'J', rating: 5, source: 'setmore' },
  { name: 'Gloria Jimenez', text: 'She goes above and beyond every time! JoJany truly cares about her clients and it shows in her work. My nails have never looked this good!', date: 'Oct 2025', initial: 'G', rating: 5, source: 'setmore' },
  { name: 'Daniela Castillo', text: '¡Excelente trabajo y muy carismática! Hace que te sientas como en casa. Su trabajo es de primera calidad y siempre sale uno feliz. 100% recomendada.', date: 'Oct 2025', initial: 'D', rating: 5, source: 'setmore' },
  { name: 'Olivia Tate', text: 'She exceeded all my expectations! I came in with a reference photo and she matched it perfectly. The quality of her work is outstanding. Book her now!', date: 'Sep 2025', initial: 'O', rating: 5, source: 'setmore' },
  { name: 'Maryjane Munoz', text: 'Amazing work and amazing energy! JoJany makes every appointment so fun and relaxing. You can tell she genuinely loves what she does. Best in the area!', date: 'Sep 2025', initial: 'M', rating: 5, source: 'setmore' },
  { name: 'Anel Brito Ramirez', text: '¡Excelente servicio! Muy profesional y atenta a los detalles. Mis uñas quedaron increíbles y el ambiente del estudio es muy acogedor. La recomiendo ampliamente.', date: 'Sep 2025', initial: 'A', rating: 5, source: 'setmore' },
  { name: 'Yajaira Dominguez', text: 'She gave me the most perfect layered cut! JoJany really understands hair and knows exactly what will look best for your face shape. Obsessed with my hair!', date: 'Sep 2025', initial: 'Y', rating: 5, source: 'setmore' }
];

const INITIAL_FEATURED: FeaturedService[] = [
  // Original 5 signature services first
  { name: 'Acrylic Set', price: 'From $65', image: '/services/catalog/acrylic-set.webp', href: '/services#nails', wide: true, dbName: 'Acrylic Set', id: 'acrylic-set', category: 'nails', categoryLabel: 'Nail Services' },
  { name: 'Deep Cleansing Facial', price: 'From $85', image: '/services/catalog/deep-cleansing-extraction-facial.webp', href: '/services#facials', dbName: 'Deep Cleansing + Extraction Facial', id: 'deep-cleansing-extraction-facial', category: 'facials', categoryLabel: 'Facials' },
  { name: 'Balayage', price: 'From $380', image: '/services/catalog/balayage.webp', href: '/services#haircolor', dbName: 'Balayage', id: 'balayage', category: 'haircolor', categoryLabel: 'Hair Color' },
  { name: 'Jelly Foot Detox', price: 'From $75', image: '/services/catalog/jelly-hydrating-foot-detox.webp', href: '/services#pedicures', dbName: 'Jelly Hydrating Foot Detox', id: 'jelly-hydrating-foot-detox', category: 'pedicures', categoryLabel: 'Pedicures' },
  { name: 'Eyebrow Wax', price: 'From $12', image: '/services/catalog/eyebrow-wax.webp', href: '/services#waxing', dbName: 'Eyebrow Wax', id: 'eyebrow-wax', category: 'waxing', categoryLabel: 'Waxing' },
  // Remaining 24 studio services across all 6 categories (all 29 total indexed in DOM)
  { name: 'Gel-X Nail Extensions', price: 'From $60', image: '/services/catalog/gelx.webp', href: '/services#nails', dbName: 'GelX', id: 'gelx', category: 'nails', categoryLabel: 'Nail Services' },
  { name: 'Acrylic Nail Fill', price: 'From $35', image: '/services/catalog/fill.webp', href: '/services#nails', dbName: 'Fill', id: 'fill', category: 'nails', categoryLabel: 'Nail Services' },
  { name: 'Acrylic Nail Rebalance', price: 'From $55', image: '/services/catalog/rebalance.webp', href: '/services#nails', dbName: 'Rebalance', id: 'rebalance', category: 'nails', categoryLabel: 'Nail Services' },
  { name: 'Classic & Gel Manicure', price: 'From $40', image: '/services/catalog/manicure.webp', href: '/services#nails', dbName: 'Manicure', id: 'manicure', category: 'nails', categoryLabel: 'Nail Services' },
  { name: 'Safe Nail Soak-Off (My Work)', price: 'From $30', image: '/services/catalog/soak-off-my-work.webp', href: '/services#nails', dbName: 'Soak Off (My Work)', id: 'soak-off-my-work', category: 'nails', categoryLabel: 'Nail Services' },
  { name: 'Foreign Nail Soak-Off', price: 'From $50', image: '/services/catalog/foreign-soak-off.webp', href: '/services#nails', dbName: 'Foreign Soak Off', id: 'foreign-soak-off', category: 'nails', categoryLabel: 'Nail Services' },
  { name: 'Classic Foot Soak Detox Pedicure', price: 'From $65', image: '/services/catalog/classic-foot-soak-detox.webp', href: '/services#pedicures', dbName: 'Classic Foot Soak Detox', id: 'classic-foot-soak-detox', category: 'pedicures', categoryLabel: 'Pedicures' },
  { name: 'Full Set Acrylic Toes', price: 'From $45', image: '/services/catalog/acrylic-toes.webp', href: '/services#pedicures', dbName: 'Acrylic Toes', id: 'acrylic-toes', category: 'pedicures', categoryLabel: 'Pedicures' },
  { name: 'Dimensional Foil Highlights', price: 'From $380', image: '/services/catalog/highlights.webp', href: '/services#haircolor', dbName: 'Highlights', id: 'highlights', category: 'haircolor', categoryLabel: 'Hair Color' },
  { name: 'Solid One-Tone Hair Color', price: 'From $120', image: '/services/catalog/solid-one-tone.webp', href: '/services#haircolor', dbName: 'Solid One Tone', id: 'solid-one-tone', category: 'haircolor', categoryLabel: 'Hair Color' },
  { name: 'Hair Gloss & Toner Refresh', price: 'From $65', image: '/services/catalog/gloss.webp', href: '/services#haircolor', dbName: 'Gloss', id: 'gloss', category: 'haircolor', categoryLabel: 'Hair Color' },
  { name: 'Vivid & Fashion Hair Color', price: 'From $380', image: '/services/catalog/vivids.webp', href: '/services#haircolor', dbName: 'Vivids', id: 'vivids', category: 'haircolor', categoryLabel: 'Hair Color' },
  { name: 'Creative Color & Color Melt', price: 'From $150', image: '/services/catalog/creative-color.webp', href: '/services#haircolor', dbName: 'Creative Color', id: 'creative-color', category: 'haircolor', categoryLabel: 'Hair Color' },
  { name: "Women's Haircut & Blowout", price: 'From $65', image: '/services/catalog/womens-haircut.webp', href: '/services#haircuts', dbName: "Women's Haircut", id: 'womens-haircut', category: 'haircuts', categoryLabel: 'Haircuts' },
  { name: "Men's Haircut & Grooming", price: 'From $45', image: '/services/catalog/mens-haircut.webp', href: '/services#haircuts', dbName: "Men's Haircut", id: 'mens-haircut', category: 'haircuts', categoryLabel: 'Haircuts' },
  { name: 'Kids Haircut (Girls)', price: 'From $35', image: '/services/catalog/kids-haircut-girls.webp', href: '/services#haircuts', dbName: 'Kids Haircut (Girls)', id: 'kids-haircut-girls', category: 'haircuts', categoryLabel: 'Haircuts' },
  { name: 'Kids Haircut (Boys)', price: 'From $35', image: '/services/catalog/kids-haircut-boys.webp', href: '/services#haircuts', dbName: 'Kids Haircut (Boys)', id: 'kids-haircut-boys', category: 'haircuts', categoryLabel: 'Haircuts' },
  { name: 'Anti-Aging & Enzyme Facial', price: 'From $100', image: '/services/catalog/anti-aging-and-enzyme-facial.webp', href: '/services#facials', dbName: 'Anti-Aging & Enzyme Facial', id: 'anti-aging-and-enzyme-facial', category: 'facials', categoryLabel: 'Facials' },
  { name: 'Custom Nourishing Facial', price: 'From $75', image: '/services/catalog/basic-facial.webp', href: '/services#facials', dbName: 'Basic Facial', id: 'basic-facial', category: 'facials', categoryLabel: 'Facials' },
  { name: 'Express Mini Facial (30 Min)', price: 'From $30', image: '/services/catalog/mini-facial.webp', href: '/services#facials', dbName: 'Mini Facial', id: 'mini-facial', category: 'facials', categoryLabel: 'Facials' },
  { name: 'Female Brazilian Wax', price: 'From $60', image: '/services/catalog/brazilian.webp', href: '/services#waxing', dbName: 'Brazilian', id: 'brazilian', category: 'waxing', categoryLabel: 'Waxing' },
  { name: 'Underarm Wax', price: 'From $20', image: '/services/catalog/underarm.webp', href: '/services#waxing', dbName: 'Underarm', id: 'underarm', category: 'waxing', categoryLabel: 'Waxing' },
  { name: 'Sideburns Wax', price: 'From $15', image: '/services/catalog/sideburns.webp', href: '/services#waxing', dbName: 'Sideburns', id: 'sideburns', category: 'waxing', categoryLabel: 'Waxing' },
  { name: 'Upper Lip Wax', price: 'From $10', image: '/services/catalog/upper-lip.webp', href: '/services#waxing', dbName: 'Upper Lip', id: 'upper-lip', category: 'waxing', categoryLabel: 'Waxing' },
];

const SERVICE_CATEGORIES = [
  { id: 'all', label: 'All Services (29)' },
  { id: 'nails', label: 'Nails (7)' },
  { id: 'pedicures', label: 'Pedicures (3)' },
  { id: 'haircolor', label: 'Hair Color (6)' },
  { id: 'haircuts', label: 'Haircuts (4)' },
  { id: 'facials', label: 'Facials (4)' },
  { id: 'waxing', label: 'Waxing (5)' },
] as const;

const DEFAULT_SLIDER_IMAGES = [
  { id: 'slide-1', url: '/hero-slider/slide-1-hero.webp' },
  { id: 'slide-2', url: '/hero-slider/slide-2-sm.webp' },
  { id: 'slide-3', url: '/hero-slider/slide-3-sm.webp' },
  { id: 'slide-4', url: '/hero-slider/slide-4-sm.webp' },
  { id: 'slide-5', url: '/hero-slider/slide-5-sm.webp' },
  { id: 'slide-6', url: '/hero-slider/slide-6-sm.webp' },
  { id: 'slide-7', url: '/hero-slider/slide-7-sm.webp' },
];

const STAMP_TOTAL = 10;
const PREVIEW_STAMPS = 7;

/** Returns days until next birthday (0 = today, 1-364 = future) */
function daysUntilBirthday(dob: Date): number {
  const now = new Date();
  const next = new Date(now.getFullYear(), dob.getMonth(), dob.getDate());
  if (next < new Date(now.getFullYear(), now.getMonth(), now.getDate())) {
    next.setFullYear(now.getFullYear() + 1);
  }
  const diff = next.getTime() - new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return Math.round(diff / (1000 * 60 * 60 * 24));
}

/** 0-100 progress of the year toward next birthday */
function birthdayProgress(dob: Date): number {
  const days = daysUntilBirthday(dob);
  return Math.max(8, Math.round(((365 - days) / 365) * 100));
}

interface ReviewItem { name: string; text: string; date: string; initial: string; rating?: number; source?: string; }
interface FeaturedService { name: string; price: string; image: string; href: string; wide?: boolean; dbName: string; id: string; bookId?: string; category?: string; categoryLabel?: string; }
interface SliderImage { id: string; url: string; }

interface HomeClientProps {
  initialSliderImages?: SliderImage[];
  initialFeaturedServices?: FeaturedService[];
  initialReviews?: ReviewItem[];
  initialReviewStats?: {
    rating?: number;
    totalCount: number;
    googleTotalCount: number;
    setmoreTotalCount: number;
  };
}

export default function HomeClient({ initialSliderImages, initialFeaturedServices, initialReviews, initialReviewStats }: HomeClientProps = {}) {
  const [session, setSession] = useState<{ user?: { name?: string | null; email?: string | null } } | null>(null);
  const { t } = useTranslation();
  const [loyaltyCount, setLoyaltyCount] = useState(0);
  const [spinAvailable, setSpinAvailable] = useState(false);
  const [isInsider, setIsInsider] = useState(false);
  const [userDob, setUserDob] = useState<Date | null>(null);
  const [userToggledPreview, setUserToggledPreview] = useState(false);
  const [featuredServices] = useState<FeaturedService[]>(
    initialFeaturedServices && initialFeaturedServices.length >= 29
      ? initialFeaturedServices
      : INITIAL_FEATURED
  );
  const [activeServiceCat, setActiveServiceCat] = useState<string>('all');
  const servicesScrollerRef = useRef<HTMLDivElement | null>(null);

  const scrollServicesBy = (dir: -1 | 1) => {
    if (!servicesScrollerRef.current) return;
    servicesScrollerRef.current.scrollBy({ left: dir * 640, behavior: 'smooth' });
  };

  // Slider state — defaults to the 7 studio slideshow photos
  const [sliderImages] = useState<SliderImage[]>(
    initialSliderImages && initialSliderImages.length > 0
      ? initialSliderImages
      : DEFAULT_SLIDER_IMAGES
  );
  const [sliderIdx, setSliderIdx] = useState(0);
  const sliderTouchStartX = useRef<number | null>(null);

  // Reviews state
  const [reviewsList, setReviewsList] = useState<ReviewItem[]>(
    initialReviews && initialReviews.length >= 15 ? initialReviews : INITIAL_REVIEWS
  );
  const [reviewStats, setReviewStats] = useState<{ totalCount: number; googleTotalCount: number; setmoreTotalCount: number }>(
    initialReviewStats ?? { totalCount: 167, googleTotalCount: 51, setmoreTotalCount: 116 }
  );

  // Loyalty card scroll-in, interactive preview stamps, and 3D tilt state
  const loyaltyCardRef = useRef<HTMLDivElement | null>(null);
  const introGridRef = useRef<HTMLDivElement | null>(null);
  const [loyaltyInView, setLoyaltyInView] = useState(true);
  const [previewStamps, setPreviewStamps] = useState<number>(PREVIEW_STAMPS);
  const [belowFoldReady, setBelowFoldReady] = useState(false);

  // Unlock below-the-fold images on first user interaction or scroll
  useEffect(() => {
    if (belowFoldReady) return;
    let done = false;
    const unlock = () => {
      if (done) return;
      done = true;
      setBelowFoldReady(true);
    };
    const events = ['scroll', 'wheel', 'pointermove', 'pointerdown', 'touchstart', 'keydown'] as const;
    events.forEach(ev => window.addEventListener(ev, unlock, { once: true, passive: true }));

    return () => {
      events.forEach(ev => window.removeEventListener(ev, unlock));
    };
  }, [belowFoldReady]);

  // Hydrate live loyalty card & birthday data on first user interaction
  useEffect(() => {
    let triggered = false;
    const loadSessionData = () => {
      if (triggered) return;
      triggered = true;
      fetch('/api/reviews')
        .then(r => (r.ok ? r.json() : null))
        .then(d => {
          if (d?.stats?.totalCount) {
            setReviewStats({
              totalCount: d.stats.totalCount,
              googleTotalCount: d.stats.googleTotalCount ?? 51,
              setmoreTotalCount: d.stats.setmoreTotalCount ?? 116,
            });
          }
          if (Array.isArray(d?.reviews) && d.reviews.length >= 15) {
            setReviewsList(
              d.reviews.map((r: any) => ({
                name: r.user?.name || r.authorName || 'Client',
                text: r.text,
                date: new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
                initial: (r.user?.name || r.authorName || 'C').charAt(0).toUpperCase(),
                rating: r.rating || 5,
                source: r.source || undefined,
              }))
            );
          }
        })
        .catch(() => {});

      fetch('/api/auth/session')
        .then(r => (r.ok ? r.json() : null))
        .then(s => {
          if (!s?.user) return;
          setSession(s);
          fetch('/api/loyalty')
            .then(r => (r.ok ? r.json() : null))
            .then(d => {
              if (d?.loyaltyCard) {
                setLoyaltyCount(d.loyaltyCard.currentStamps ?? 0);
                setSpinAvailable(!!d.loyaltyCard.spinAvailable);
                setIsInsider(!!d.loyaltyCard.isInsider);
              }
            })
            .catch(() => {});

          fetch('/api/profile')
            .then(r => (r.ok ? r.json() : null))
            .then(d => {
              if (d?.user?.dateOfBirth) {
                setUserDob(new Date(d.user.dateOfBirth));
              }
            })
            .catch(() => {});
        })
        .catch(() => {});
    };
    const events = ['pointerdown', 'touchstart', 'wheel', 'keydown', 'scroll'] as const;
    events.forEach(ev => window.addEventListener(ev, loadSessionData, { once: true, passive: true }));
    return () => {
      events.forEach(ev => window.removeEventListener(ev, loadSessionData));
    };
  }, []);

  // Slider auto-advance (starts after first user interaction so initial LCP paint is never interrupted)
  useEffect(() => {
    if (sliderImages.length <= 1) return;
    let intervalId: ReturnType<typeof setInterval> | null = null;
    const startSlider = () => {
      if (intervalId) return;
      intervalId = setInterval(() => {
        setSliderIdx(i => (i + 1) % sliderImages.length);
      }, 5000);
    };
    const events = ['pointerdown', 'touchstart', 'wheel', 'keydown'] as const;
    events.forEach(ev => window.addEventListener(ev, startSlider, { once: true, passive: true }));
    return () => {
      events.forEach(ev => window.removeEventListener(ev, startSlider));
      if (intervalId) clearInterval(intervalId);
    };
  }, [sliderImages]);

  const [reviewIdx, setReviewIdx] = useState(0);
  const [reviewAnim, setReviewAnim] = useState<'in' | 'out'>('in');
  const [reviewExpanded, setReviewExpanded] = useState(false);
  const reviewTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartX = useRef<number | null>(null);

  const goToReview = (next: number) => {
    setReviewAnim('out');
    setTimeout(() => {
      setReviewExpanded(false);
      setReviewIdx((next + reviewsList.length) % reviewsList.length);
      setReviewAnim('in');
    }, 220);
  };

  const startReviewTimer = () => {
    if (reviewTimerRef.current) clearInterval(reviewTimerRef.current);
    reviewTimerRef.current = setInterval(() => {
      setReviewAnim('out');
      setTimeout(() => {
        setReviewExpanded(false);
        setReviewIdx(i => (i + 1) % reviewsList.length);
        setReviewAnim('in');
      }, 220);
    }, 5000);
  };

  useEffect(() => {
    const onInteract = () => startReviewTimer();
    const events = ['pointerdown', 'touchstart', 'wheel', 'keydown'] as const;
    events.forEach(ev => window.addEventListener(ev, onInteract, { once: true, passive: true }));
    return () => {
      events.forEach(ev => window.removeEventListener(ev, onInteract));
      if (reviewTimerRef.current) clearInterval(reviewTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 3D pointer tilt for loyalty card (up to 8deg)
  const handleCardPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!loyaltyCardRef.current) return;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rect = loyaltyCardRef.current.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    const rotateY = xPct * 16; // -8deg to +8deg
    const rotateX = -yPct * 16; // -8deg to +8deg
    loyaltyCardRef.current.style.transform = `rotateY(${rotateY.toFixed(2)}deg) rotateX(${rotateX.toFixed(2)}deg)`;
  };

  const handleCardPointerLeave = () => {
    if (!loyaltyCardRef.current) return;
    loyaltyCardRef.current.style.transform = '';
  };

  // Display user's actual stamp count when logged in (unless they clicked to test stamps), or interactive preview stamps
  const visualStampCount = userToggledPreview ? previewStamps : (session?.user ? loyaltyCount : previewStamps);
  const isRewardReady = spinAvailable || visualStampCount >= STAMP_TOTAL;

  return (
    <div className="home-v2-root" style={{ position: 'relative', zIndex: 1, overflowX: 'hidden' }}>
      <style>{`
        /* ============================================
           SHARED TOKENS & BUTTONS (DARK GLAM BRAND)
           ============================================ */
        .home-v2-root {
          --brand-pink: #ff2d87;
          --brand-pink-deep: #d10f67;
          --brand-pink-light: #FF6BA8;
          --brand-star: #ffb800;
          --brand-glass: rgba(255, 255, 255, 0.05);
          --brand-border: rgba(255, 255, 255, 0.2);
          --brand-border-pink: rgba(255, 45, 135, 0.5);
        }

        .eyebrow-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: 'Poppins', sans-serif;
          font-weight: 800;
          font-size: 11.5px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #ff6ba8;
          background: rgba(255, 45, 135, 0.12);
          border: 1.5px solid rgba(255, 45, 135, 0.38);
          padding: 6px 16px;
          border-radius: 999px;
          margin-bottom: 18px;
        }

        .eyebrow-pill.eyebrow-pink {
          background: linear-gradient(135deg, #ff2d87 0%, #d10f67 100%);
          color: #ffffff;
          border-color: rgba(255, 255, 255, 0.25);
        }

        .section-h2 {
          font-family: 'Poppins', sans-serif;
          font-weight: 800;
          font-size: clamp(1.85rem, 3.6vw, 2.85rem);
          line-height: 1.12;
          letter-spacing: -0.03em;
          color: #ffffff;
          margin: 0 0 22px;
        }

        .pop-btn-primary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 48px;
          padding: 13px 28px;
          border-radius: 999px;
          background: linear-gradient(135deg, #ff2d87 0%, #d10f67 100%);
          border: 1.5px solid rgba(255, 255, 255, 0.25);
          color: #ffffff;
          font-family: 'Poppins', sans-serif;
          font-weight: 700;
          font-size: 14.5px;
          text-decoration: none;
          cursor: pointer;
          transition: transform 0.18s ease, box-shadow 0.18s ease;
          white-space: nowrap;
        }

        .pop-btn-primary:hover {
          transform: translate(-3px, -3px);
          box-shadow: 6px 6px 0 #ff2d87;
        }

        .pop-btn-outline {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 48px;
          padding: 13px 28px;
          border-radius: 999px;
          background: rgba(24, 14, 20, 0.88);
          border: 1.5px solid rgba(255, 255, 255, 0.22);
          color: #ffffff;
          font-family: 'Poppins', sans-serif;
          font-weight: 700;
          font-size: 14.5px;
          text-decoration: none;
          cursor: pointer;
          transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
          white-space: nowrap;
        }

        .pop-btn-outline:hover {
          border-color: #ff2d87;
          transform: translate(-3px, -3px);
          box-shadow: 6px 6px 0 #ff2d87;
        }

        /* ============================================
           2. HERO (CLEAN SPLIT + LIVE SLIDESHOW)
           ============================================ */
        .hero-fullbleed {
          position: relative;
          width: 100%;
          margin-top: -76px;
          padding: clamp(118px, 13vw, 152px) clamp(18px, 5vw, 64px) clamp(76px, 8vw, 108px);
          overflow: hidden;
          border-radius: 0 0 44px 44px;
          border-bottom: 1.5px solid rgba(255, 45, 135, 0.35);
          background: #0a0a0a;
        }

        .hero-bg-layer {
          position: absolute;
          inset: 0;
          z-index: 0;
          background-color: #0a0a0a;
        }

        .hero-bg-overlay {
          position: absolute;
          inset: 0;
          background: transparent;
        }

        html.anim-ready .hero-bg-overlay {
          background:
            radial-gradient(circle at 82% 42%, rgba(255, 45, 135, 0.24) 0%, transparent 55%),
            linear-gradient(90deg, rgba(10, 10, 10, 0.94) 0%, rgba(12, 8, 12, 0.86) 55%, rgba(14, 8, 13, 0.72) 100%),
            linear-gradient(180deg, rgba(10, 10, 10, 0.65) 0%, rgba(10, 10, 10, 0.35) 50%, rgba(10, 10, 10, 0.92) 100%);
        }

        .hero-inner {
          position: relative;
          z-index: 2;
          max-width: 1180px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: clamp(28px, 4.5vw, 56px);
          align-items: center;
        }

        @media (max-width: 920px) {
          .hero-inner {
            grid-template-columns: 1fr;
            text-align: center;
          }
        }

        .hero-copy-col {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        @media (max-width: 920px) {
          .hero-copy-col {
            align-items: center;
          }
        }

        .hero-sticker-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(38, 12, 26, 0.9);
          border: 1.5px solid rgba(255, 45, 135, 0.45);
          border-radius: 999px;
          padding: 7px 16px;
          box-shadow: 0 4px 20px rgba(255, 45, 135, 0.2);
          margin-bottom: 20px;
        }

        .hero-h1 {
          font-family: 'Poppins', sans-serif;
          font-weight: 800;
          font-size: clamp(2.1rem, 4.1vw, 3.55rem);
          line-height: 1.12;
          letter-spacing: -0.03em;
          color: #ffffff;
          margin: 0 0 18px;
          max-width: 15.5em;
        }

        .hero-hl-chip {
          display: inline;
          background: linear-gradient(135deg, #ff2d87 0%, #ff6ba8 55%, #ffb3d1 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-decoration: underline;
          text-decoration-color: rgba(255, 45, 135, 0.55);
          text-decoration-thickness: 3px;
          text-underline-offset: 6px;
        }

        .hero-addr-line {
          display: inline-block;
          font-family: 'Poppins', sans-serif;
          font-weight: 700;
          font-size: clamp(11.5px, 1.15vw, 13px);
          color: #ff7eb3;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          line-height: 1.55;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 14px;
          padding: 10px 16px;
          margin: 0 0 20px;
        }

        .hero-tagline {
          font-family: 'Poppins', sans-serif;
          font-size: clamp(15.5px, 1.5vw, 18.5px);
          font-weight: 400;
          color: #e8dce3;
          max-width: 36ch;
          line-height: 1.55;
          margin: 0 0 28px;
        }

        .hero-actions {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
          align-items: center;
        }

        @media (max-width: 920px) {
          .hero-actions {
            justify-content: center;
          }
        }

        /* Framed Right-Column Slideshow Stage */
        .hero-slider-stage {
          position: relative;
          width: 100%;
          max-width: 440px;
          margin: 0 auto;
        }

        .hero-slider-frame {
          position: relative;
          width: 100%;
          aspect-ratio: 4 / 5;
          border-radius: 28px;
          overflow: hidden;
          background: #141013;
          border: 1.5px solid rgba(255, 255, 255, 0.24);
          box-shadow: 6px 6px 0 #ff2d87, 0 24px 60px rgba(0, 0, 0, 0.65);
          user-select: none;
          touch-action: pan-y;
        }

        .hero-slide-item {
          position: absolute;
          inset: 0;
          opacity: 0;
          transform: scale(1.04);
          transition: opacity 0.85s ease-in-out, transform 1.2s ease-out;
          pointer-events: none;
        }

        .hero-slide-item.is-active {
          opacity: 1;
          transform: scale(1);
          pointer-events: auto;
        }

        .hero-slider-vignette {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(10, 10, 10, 0.12) 0%, transparent 35%, transparent 65%, rgba(10, 10, 10, 0.78) 100%);
          pointer-events: none;
          z-index: 1;
        }

        .hero-slider-controls {
          position: absolute;
          left: 16px;
          right: 16px;
          bottom: 16px;
          z-index: 3;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .hero-slider-dots {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(10, 10, 10, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.16);
          padding: 7px 12px;
          border-radius: 999px;
        }

        .hero-slider-dot {
          width: 8px;
          height: 8px;
          border-radius: 999px;
          border: none;
          padding: 0;
          background: rgba(255, 255, 255, 0.32);
          cursor: pointer;
          transition: width 0.25s ease, background-color 0.25s ease;
        }

        .hero-slider-dot.is-active {
          width: 24px;
          background: #ff2d87;
        }

        .hero-slider-arrows {
          display: flex;
          gap: 8px;
        }

        .hero-slider-arrow {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: rgba(10, 10, 10, 0.86);
          border: 1.5px solid rgba(255, 255, 255, 0.22);
          color: #ffffff;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background-color 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
        }

        .hero-slider-arrow:hover {
          background: #ff2d87;
          border-color: #ffffff;
          transform: translateY(-2px);
        }

        .hero-big-star {
          position: absolute;
          right: -2vw;
          bottom: -6vw;
          font-size: clamp(180px, 28vw, 380px);
          line-height: 1;
          color: #ff2d87;
          opacity: 0.1;
          pointer-events: none;
          user-select: none;
          z-index: 1;
          animation: heroStarSpin 40s linear infinite;
        }

        @keyframes heroStarSpin {
          to { transform: rotate(360deg); }
        }

        /* ============================================
           3. TICKER MARQUEE
           ============================================ */
        .ticker-bar {
          background: linear-gradient(90deg, #14060e 0%, #1f0815 50%, #14060e 100%);
          color: #ff2d87;
          overflow: hidden;
          margin-top: -24px;
          position: relative;
          z-index: 3;
          transform: rotate(-1.2deg);
          border-top: 1.5px solid rgba(255, 45, 135, 0.55);
          border-bottom: 1.5px solid rgba(255, 45, 135, 0.55);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.55);
        }

        .ticker-track {
          display: flex;
          width: max-content;
          animation: tickerScroll 26s linear infinite;
          font-family: 'Poppins', sans-serif;
          font-weight: 800;
          font-size: clamp(15px, 1.8vw, 18px);
          letter-spacing: 0.08em;
          padding: 14px 0;
          white-space: nowrap;
        }

        .ticker-track span {
          padding-right: 3rem;
          color: #ff6ba8;
        }

        @keyframes tickerScroll {
          to { transform: translateX(-50%); }
        }

        /* ============================================
           4. WELCOME / INTRO (ASYMMETRIC PHOTO BENTO)
           ============================================ */
        .section-shell {
          padding: clamp(64px, 8vw, 108px) clamp(18px, 5vw, 64px);
          content-visibility: auto;
          contain-intrinsic-size: auto 850px;
        }

        .intro-editorial {
          content-visibility: visible;
          contain-intrinsic-size: auto;
        }

        .section-wrap {
          max-width: 1180px;
          margin: 0 auto;
        }

        .intro-header {
          text-align: center;
          max-width: 780px;
          margin: 0 auto 42px;
        }

        .intro-bento-grid {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          gap: 22px;
        }

        .intro-photo-card {
          position: relative;
          border-radius: 28px;
          overflow: hidden;
          background: linear-gradient(165deg, rgba(26, 14, 22, 0.92) 0%, rgba(14, 10, 13, 0.96) 100%);
          border: 1.5px solid rgba(255, 255, 255, 0.14);
          box-shadow: 0 18px 44px rgba(0, 0, 0, 0.5);
          display: flex;
          flex-direction: column;
          transition: transform 0.28s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.28s ease, box-shadow 0.28s ease;
        }

        .intro-photo-card:hover {
          transform: translate(-3px, -4px);
          border-color: #ff2d87;
          box-shadow: 6px 6px 0 #ff2d87, 0 24px 54px rgba(255, 45, 135, 0.2);
        }

        /* Asymmetric 7:5 + 5:7 magazine rhythm on desktop */
        .intro-photo-card.card-span-7 {
          grid-column: span 7;
          display: grid;
          grid-template-columns: 0.44fr 0.56fr;
          align-items: stretch;
        }

        .intro-photo-card.card-span-7.card-reverse {
          grid-template-columns: 0.56fr 0.44fr;
        }

        .intro-photo-card.card-span-5 {
          grid-column: span 5;
        }

        @media (max-width: 980px) {
          .intro-photo-card.card-span-7,
          .intro-photo-card.card-span-7.card-reverse,
          .intro-photo-card.card-span-5 {
            grid-column: span 12;
            display: flex;
            flex-direction: column;
          }
        }

        .intro-card-media {
          position: relative;
          min-height: 220px;
          overflow: hidden;
          background: #120a0f;
        }

        .intro-photo-card.card-span-7 .intro-card-media {
          min-height: 100%;
        }

        @media (max-width: 980px) {
          .intro-photo-card.card-span-7 .intro-card-media {
            min-height: 230px;
            order: -1;
          }
        }

        .intro-card-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 28%;
          transition: transform 0.65s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .intro-photo-card:hover .intro-card-img {
          transform: scale(1.07);
        }

        /* Gradient melt between photo and dark glass body */
        .intro-card-media-fade {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(14, 10, 13, 0.08) 0%, rgba(14, 10, 13, 0.25) 55%, rgba(18, 11, 16, 0.96) 100%);
          pointer-events: none;
        }

        @media (min-width: 981px) {
          .intro-photo-card.card-span-7:not(.card-reverse) .intro-card-media-fade {
            background: linear-gradient(90deg, rgba(14, 10, 13, 0.05) 0%, rgba(14, 10, 13, 0.2) 55%, rgba(20, 12, 17, 0.96) 100%);
          }
          .intro-photo-card.card-span-7.card-reverse .intro-card-media-fade {
            background: linear-gradient(270deg, rgba(14, 10, 13, 0.05) 0%, rgba(14, 10, 13, 0.2) 55%, rgba(20, 12, 17, 0.96) 100%);
          }
        }

        .intro-card-num {
          position: absolute;
          top: 16px;
          left: 16px;
          z-index: 2;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: rgba(12, 8, 11, 0.88);
          border: 1.5px solid rgba(255, 45, 135, 0.55);
          color: #ffffff;
          font-family: 'Poppins', sans-serif;
          font-weight: 800;
          font-size: 12px;
          letter-spacing: 0.04em;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.45);
        }

        .intro-card-body {
          display: flex;
          align-items: center;
          padding: clamp(22px, 2.6vw, 32px);
          position: relative;
          z-index: 2;
        }

        .intro-editorial p.intro-p {
          font-family: 'Poppins', sans-serif;
          color: #ded6dc;
          font-size: clamp(14.5px, 1.1vw, 15.5px);
          line-height: 1.78;
          margin: 0;
        }

        .intro-editorial p.intro-p strong {
          color: #ff7eb3;
          font-weight: 600;
        }

        .rvl {
          opacity: 1;
          transform: none;
          transition: opacity 0.65s ease, transform 0.65s ease;
        }

        .rvl.in {
          opacity: 1;
          transform: none;
        }

        /* ============================================
           5. TESTIMONIALS (LUXURY SCORE MONUMENT + STAGE)
           ============================================ */
        .reviews-section {
          position: relative;
          background: #0e0a0d;
          border-top: 1.5px solid rgba(255, 255, 255, 0.1);
          border-bottom: 1.5px solid rgba(255, 255, 255, 0.1);
        }

        html.anim-ready .reviews-section {
          background:
            radial-gradient(circle at 18% 50%, rgba(255, 45, 135, 0.09) 0%, transparent 55%),
            rgba(255, 255, 255, 0.018);
        }

        .reviews-split {
          display: grid;
          grid-template-columns: 0.88fr 1.32fr;
          gap: clamp(28px, 4.5vw, 52px);
          align-items: start;
        }

        @media (max-width: 920px) {
          .reviews-split {
            grid-template-columns: 1fr;
          }
        }

        .reviews-left-col {
          min-width: 0;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .reviews-score-panel {
          position: relative;
          overflow: hidden;
          min-height: 332px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: flex-start;
          margin-top: 8px;
          padding: 32px 28px 28px;
          border-radius: 28px;
          background:
            radial-gradient(circle at 0% 0%, rgba(255, 184, 0, 0.14) 0%, transparent 55%),
            radial-gradient(circle at 100% 100%, rgba(255, 45, 135, 0.18) 0%, transparent 60%),
            linear-gradient(160deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%);
          border: 1.5px solid rgba(255, 255, 255, 0.16);
          box-shadow: 0 18px 44px rgba(0, 0, 0, 0.45);
        }

        .reviews-score-bg-photo {
          position: absolute;
          right: -12px;
          bottom: -12px;
          width: 170px;
          height: 170px;
          border-radius: 24px;
          overflow: hidden;
          opacity: 0.22;
          pointer-events: none;
          transform: rotate(-6deg);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .reviews-giant-score {
          font-family: 'Poppins', sans-serif;
          font-weight: 900;
          font-size: clamp(72px, 9vw, 118px);
          line-height: 0.92;
          letter-spacing: -0.05em;
          background: linear-gradient(135deg, #ffffff 0%, #ffe6f2 55%, #ff6ba8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          filter: drop-shadow(4px 4px 0 rgba(255, 45, 135, 0.38));
          margin: 0 0 14px;
        }

        .reviews-verified-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: 'Poppins', sans-serif;
          background: rgba(10, 10, 10, 0.55);
          border: 1px solid rgba(255, 184, 0, 0.35);
          border-radius: 999px;
          padding: 7px 14px;
          margin-top: 4px;
        }

        .reviews-note-stage {
          position: relative;
          min-width: 0;
          width: 100%;
          max-width: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .tc-card {
          position: relative;
          width: 100%;
          box-sizing: border-box;
          border-radius: 28px;
          padding: clamp(24px, 3vw, 32px);
          background:
            radial-gradient(circle at 0% 0%, rgba(255, 45, 135, 0.16) 0%, transparent 55%),
            linear-gradient(165deg, rgba(28, 15, 24, 0.96) 0%, rgba(14, 10, 14, 0.98) 100%);
          border: 1.5px solid rgba(255, 45, 135, 0.52);
          box-shadow: 6px 6px 0 #ff2d87, 0 22px 52px rgba(0, 0, 0, 0.55);
          transition: opacity 0.22s ease, transform 0.22s ease, box-shadow 0.22s ease;
          height: 304px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          cursor: grab;
          user-select: none;
          touch-action: pan-y;
        }

        .tc-card.is-expanded {
          height: auto;
          min-height: 304px;
        }

        @media (max-width: 640px) {
          .tc-card {
            height: 326px;
          }
          .tc-card.is-expanded {
            height: auto;
            min-height: 326px;
          }
        }

        .tc-card:hover {
          box-shadow: 8px 8px 0 #ff2d87, 0 26px 60px rgba(255, 45, 135, 0.24);
        }

        .tc-card.anim-out {
          opacity: 0;
          transform: scale(0.98) translateY(6px);
        }

        .tc-card.anim-in {
          opacity: 1;
          transform: scale(1) translateY(0);
        }

        .tc-quote-mark {
          font-family: Georgia, 'Times New Roman', serif;
          font-size: 88px;
          line-height: 0.75;
          color: rgba(255, 45, 135, 0.32);
          position: absolute;
          top: 22px;
          left: 26px;
          pointer-events: none;
          z-index: 0;
          font-weight: 900;
        }

        .tc-text-wrap {
          position: relative;
          z-index: 1;
          padding-top: 28px;
          margin-bottom: 14px;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          align-items: flex-start;
        }

        .tc-text {
          font-family: 'Poppins', sans-serif;
          color: #f7f2f5;
          font-size: clamp(15px, 1.38vw, 17px);
          line-height: 1.65;
          margin: 0;
        }

        .tc-text.is-clamped {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .tc-expand-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          margin-top: 10px;
          padding: 4px 12px;
          border-radius: 999px;
          background: rgba(255, 45, 135, 0.14);
          border: 1px solid rgba(255, 133, 184, 0.38);
          color: #ff8ab8;
          font-family: 'Poppins', sans-serif;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease;
        }

        .tc-expand-btn:hover {
          background: rgba(255, 45, 135, 0.26);
          border-color: #ff8ab8;
          color: #fff;
        }

        .tc-author {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
          position: relative;
          z-index: 1;
          padding-top: 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .tc-author-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .tc-avatar {
          width: 46px;
          height: 46px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ff2d87, #7928CA);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Poppins', sans-serif;
          font-weight: 800;
          color: #fff;
          font-size: 16px;
          flex-shrink: 0;
          border: 1.5px solid rgba(255, 255, 255, 0.32);
          box-shadow: 0 6px 16px rgba(255, 45, 135, 0.35);
        }

        .tc-name {
          font-family: 'Poppins', sans-serif;
          font-weight: 700;
          color: #fff;
          font-size: 15.5px;
          margin-bottom: 3px;
        }

        .tc-meta {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .tc-stars {
          display: flex;
          gap: 2px;
        }

        .tc-date {
          font-family: 'Poppins', sans-serif;
          color: #c4bcc0;
          font-size: 12px;
        }

        .tc-controls {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .tc-counter {
          font-family: 'Poppins', sans-serif;
          font-size: 12px;
          font-weight: 700;
          color: #ff85b8;
          background: rgba(255, 45, 135, 0.12);
          border: 1px solid rgba(255, 45, 135, 0.3);
          padding: 5px 11px;
          border-radius: 999px;
          margin-right: 4px;
        }

        .tc-nav-btn {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.08);
          border: 1.5px solid rgba(255, 255, 255, 0.22);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #fff;
          transition: all 0.2s ease;
        }

        .tc-nav-btn:hover {
          background: #ff2d87;
          border-color: #fff;
          transform: translateY(-2px);
          box-shadow: 3px 3px 0 rgba(255, 45, 135, 0.5);
        }

        .tc-setmore-badge,
        .tc-google-badge {
          position: absolute;
          top: 18px;
          right: 22px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.18);
          border-radius: 999px;
          padding: 5px 12px;
          z-index: 2;
        }

        .tc-setmore-badge span,
        .tc-google-badge span {
          font-family: 'Poppins', sans-serif;
          font-size: 10.5px;
          font-weight: 500;
          color: #d8d8d8;
          letter-spacing: 0.2px;
        }

        .tc-setmore-badge span b,
        .tc-google-badge span b {
          color: #fff;
          font-weight: 700;
        }

        /* Horizontal marquee of review sticker notes — strictly contained */
        .reviews-marquee-wrap {
          width: 100%;
          max-width: 100%;
          margin-top: 22px;
          overflow: hidden;
          padding: 8px 0 12px;
          mask-image: linear-gradient(90deg, transparent 0%, #000 7%, #000 93%, transparent 100%);
          -webkit-mask-image: linear-gradient(90deg, transparent 0%, #000 7%, #000 93%, transparent 100%);
        }

        .reviews-marquee-track {
          display: flex;
          gap: 14px;
          width: max-content;
          animation: reviewsNotesScroll 38s linear infinite;
        }

        .reviews-marquee-wrap:hover .reviews-marquee-track {
          animation-play-state: paused;
        }

        @keyframes reviewsNotesScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .mini-note-card {
          width: 248px;
          flex-shrink: 0;
          background: linear-gradient(160deg, rgba(28, 18, 24, 0.95) 0%, rgba(18, 12, 16, 0.95) 100%);
          border: 1.5px solid rgba(255, 255, 255, 0.14);
          border-radius: 18px;
          padding: 14px 16px;
          cursor: pointer;
          text-align: left;
          color: #fff;
          transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .mini-note-card:hover,
        .mini-note-card.is-current {
          border-color: #ff2d87;
          background: linear-gradient(160deg, rgba(255, 45, 135, 0.16) 0%, rgba(255, 255, 255, 0.04) 100%);
          transform: translateY(-3px);
          box-shadow: 4px 4px 0 #ff2d87;
        }

        /* ============================================
           6. PREMIUM BEAUTY SERVICES (29-SERVICE SEO SLIDER)
           ============================================ */
        .services-top-bar {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 24px;
          flex-wrap: wrap;
          margin-bottom: 22px;
        }

        .services-filter-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
          margin-top: 22px;
        }

        .services-cat-pills {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .services-cat-pill {
          font-family: 'Poppins', sans-serif;
          font-size: 12.5px;
          font-weight: 700;
          color: #dcd4da;
          background: rgba(255, 255, 255, 0.04);
          border: 1.5px solid rgba(255, 255, 255, 0.14);
          border-radius: 999px;
          padding: 8px 16px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .services-cat-pill:hover {
          border-color: rgba(255, 45, 135, 0.6);
          color: #ffffff;
        }

        .services-cat-pill.is-active {
          background: linear-gradient(135deg, #ff2d87 0%, #d10f67 100%);
          border-color: rgba(255, 255, 255, 0.35);
          color: #ffffff;
          box-shadow: 3px 3px 0 rgba(255, 45, 135, 0.45);
        }

        .services-nav-arrows {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .services-scroller {
          display: flex;
          gap: 20px;
          overflow-x: auto;
          scroll-behavior: smooth;
          padding: 20px clamp(18px, 5vw, 64px) 40px;
          margin: 0 calc(-1 * clamp(18px, 5vw, 64px));
          scrollbar-width: none;
        }

        .services-scroller::-webkit-scrollbar {
          display: none;
        }

        .poster-card {
          flex: 0 0 min(78vw, 310px);
          height: 430px;
          position: relative;
          overflow: hidden;
          border-radius: 28px;
          border: 1.5px solid rgba(255, 255, 255, 0.18);
          background: #141013;
          box-shadow: 0 16px 38px rgba(0, 0, 0, 0.55);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 20px 22px 22px;
          transition: transform 0.26s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.26s ease, border-color 0.26s ease;
        }

        /* CSS-only category filtering keeps all 29 service cards mounted in DOM for 100% Google indexing */
        .poster-card.is-hidden-cat {
          display: none;
        }

        .poster-card:hover {
          transform: translate(-3px, -8px);
          border-color: #ff2d87;
          box-shadow: 6px 6px 0 #ff2d87, 0 22px 48px rgba(255, 45, 135, 0.24);
        }

        .poster-card-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          z-index: 0;
          transition: transform 0.65s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .poster-card:hover .poster-card-img {
          transform: scale(1.07);
        }

        .poster-card-overlay {
          position: absolute;
          inset: 0;
          z-index: 1;
          background: linear-gradient(
            180deg,
            rgba(10, 10, 10, 0.38) 0%,
            rgba(10, 10, 10, 0.08) 34%,
            rgba(18, 6, 14, 0.68) 64%,
            rgba(10, 10, 10, 0.96) 100%
          );
        }

        .poster-card-top {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }

        .poster-cat-badge {
          font-family: 'Poppins', sans-serif;
          font-size: 10.5px;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #ffffff;
          background: rgba(12, 8, 11, 0.86);
          border: 1px solid rgba(255, 255, 255, 0.22);
          padding: 5px 11px;
          border-radius: 999px;
        }

        .poster-price-pill {
          font-family: 'Poppins', sans-serif;
          font-size: 12px;
          font-weight: 800;
          color: #ffffff;
          background: linear-gradient(135deg, #ff2d87 0%, #d10f67 100%);
          border: 1px solid rgba(255, 255, 255, 0.28);
          padding: 5px 12px;
          border-radius: 999px;
          box-shadow: 0 4px 14px rgba(255, 45, 135, 0.4);
        }

        .poster-card-content {
          position: relative;
          z-index: 2;
        }

        .poster-title {
          font-family: 'Poppins', sans-serif;
          font-weight: 800;
          font-size: 21px;
          line-height: 1.18;
          letter-spacing: -0.02em;
          color: #ffffff;
          margin: 0 0 6px;
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.8);
        }

        .poster-price {
          display: block;
          font-family: 'Poppins', sans-serif;
          font-weight: 700;
          font-size: 14.5px;
          color: #ff7eb3;
          margin: 0 0 14px;
        }

        .poster-actions {
          display: flex;
          gap: 10px;
        }

        .poster-btn-details {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 44px;
          padding: 8px 18px;
          border-radius: 999px;
          border: 1.5px solid rgba(255, 255, 255, 0.28);
          background: rgba(20, 12, 17, 0.85);
          color: #ffffff;
          font-family: 'Poppins', sans-serif;
          font-weight: 600;
          font-size: 13px;
          text-decoration: none;
          transition: all 0.18s ease;
        }

        .poster-btn-details:hover {
          border-color: #ff2d87;
          background: rgba(255, 45, 135, 0.18);
        }

        .poster-btn-book {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 44px;
          padding: 8px 20px;
          border-radius: 999px;
          border: 1.5px solid rgba(255, 255, 255, 0.22);
          background: linear-gradient(135deg, #ff2d87 0%, #d10f67 100%);
          color: #ffffff;
          font-family: 'Poppins', sans-serif;
          font-weight: 700;
          font-size: 13px;
          text-decoration: none;
          transition: all 0.18s ease;
        }

        .poster-btn-book:hover {
          transform: translate(-2px, -2px);
          box-shadow: 4px 4px 0 #ffffff;
        }

        /* ============================================
           7 & 8. COMPLETE SALON MENU PANEL & DIRECTORY
           ============================================ */
        .menu-dark-panel {
          position: relative;
          background: #140b11;
          border: 1.5px solid rgba(255, 255, 255, 0.16);
          border-radius: 40px;
          margin: 0 clamp(8px, 2vw, 24px);
          padding: clamp(44px, 7vw, 88px) clamp(16px, 4.5vw, 56px);
          box-shadow: 0 28px 72px rgba(0, 0, 0, 0.65), inset 0 1px 0 rgba(255, 255, 255, 0.12);
          overflow: hidden;
          content-visibility: auto;
          contain-intrinsic-size: auto 2400px;
        }

        html.anim-ready .menu-dark-panel {
          background:
            radial-gradient(circle at 12% 8%, rgba(255, 45, 135, 0.16) 0%, transparent 45%),
            radial-gradient(circle at 88% 92%, rgba(255, 107, 168, 0.12) 0%, transparent 45%),
            linear-gradient(165deg, rgba(24, 12, 20, 0.96) 0%, rgba(12, 8, 12, 0.98) 100%);
        }

        .menu-header-block {
          margin-bottom: 36px;
        }

        .menu-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 7px 16px;
          border-radius: 999px;
          background: rgba(255, 45, 135, 0.14);
          border: 1px solid rgba(255, 45, 135, 0.45);
          color: #ff85bc;
          font-family: 'Poppins', sans-serif;
          font-weight: 700;
          font-size: 11.5px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          line-height: 1.4;
          margin: 0 0 16px;
        }

        .menu-accordions-stack {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .menu-accordion {
          background: rgba(255, 255, 255, 0.03);
          border: 1.5px solid rgba(255, 255, 255, 0.12);
          border-radius: 26px;
          padding: 0 clamp(16px, 3vw, 28px);
          transition: border-color 0.25s ease, background 0.25s ease, box-shadow 0.25s ease;
        }

        .menu-accordion[open] {
          background: rgba(255, 255, 255, 0.045);
          border-color: rgba(255, 45, 135, 0.48);
          box-shadow: 0 18px 44px rgba(0, 0, 0, 0.42), 0 0 28px rgba(255, 45, 135, 0.1);
        }

        .menu-summary {
          list-style: none;
          cursor: pointer;
          padding: clamp(18px, 2.5vw, 26px) 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          user-select: none;
        }

        .menu-summary::-webkit-details-marker {
          display: none;
        }

        .menu-summary-left {
          display: flex;
          align-items: center;
          gap: 14px;
          min-width: 0;
          flex-wrap: wrap;
        }

        .menu-cat-num {
          width: 36px;
          height: 36px;
          border-radius: 11px;
          background: rgba(255, 45, 135, 0.16);
          border: 1px solid rgba(255, 45, 135, 0.45);
          color: #ff7eb3;
          font-family: 'Poppins', sans-serif;
          font-weight: 800;
          font-size: 13px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .menu-accordion[open] .menu-cat-num {
          background: linear-gradient(135deg, #ff2d87 0%, #d10f67 100%);
          border-color: rgba(255, 255, 255, 0.35);
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(255, 45, 135, 0.4);
        }

        .menu-summary h3 {
          font-family: 'Poppins', sans-serif;
          font-weight: 800;
          font-size: clamp(20px, 3.2vw, 32px);
          line-height: 1.15;
          letter-spacing: -0.03em;
          color: #ffffff;
          margin: 0;
          transition: color 0.2s ease;
        }

        .menu-accordion[open] .menu-summary h3 {
          color: #ff85bc;
        }

        .menu-cat-count {
          display: inline-flex;
          align-items: center;
          padding: 4px 11px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.14);
          font-family: 'Poppins', sans-serif;
          font-weight: 700;
          font-size: 11.5px;
          color: #d6c5cf;
          white-space: nowrap;
        }

        .menu-summary-plus {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.06);
          border: 1.5px solid rgba(255, 255, 255, 0.18);
          font-family: 'Poppins', sans-serif;
          font-weight: 700;
          font-size: 24px;
          line-height: 1;
          color: #ffffff;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.25s ease, background 0.2s ease, border-color 0.2s ease;
          flex-shrink: 0;
        }

        .menu-accordion[open] .menu-summary-plus {
          transform: rotate(45deg);
          background: #ff2d87;
          border-color: rgba(255, 255, 255, 0.4);
        }

        .menu-list {
          list-style: none;
          padding: 4px 0 24px;
          margin: 0;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
        }

        @media (max-width: 860px) {
          .menu-list {
            grid-template-columns: 1fr;
          }
        }

        .menu-row-link {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          min-height: 62px;
          padding: 10px 14px 10px 10px;
          border-radius: 16px;
          background: rgba(10, 6, 10, 0.48);
          border: 1px solid rgba(255, 255, 255, 0.09);
          font-family: 'Poppins', sans-serif;
          font-size: clamp(14.5px, 1.5vw, 16px);
          font-weight: 600;
          color: #f4eef2;
          text-decoration: none;
          transition: background 0.2s ease, transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .menu-row-link:hover {
          background: rgba(255, 45, 135, 0.16);
          border-color: #ff2d87;
          color: #ffffff;
          transform: translateY(-2px);
          box-shadow: 4px 4px 0 #ff2d87;
        }

        .menu-row-left {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }

        .menu-row-thumb {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          object-fit: cover;
          border: 1px solid rgba(255, 255, 255, 0.22);
          flex-shrink: 0;
          background: #1a0f16;
        }

        .menu-row-name {
          line-height: 1.3;
          overflow-wrap: break-word;
        }

        .menu-row-right {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }

        .menu-row-right::after {
          content: '›';
          color: #ff85bc;
          font-size: 19px;
          font-weight: 700;
          line-height: 1;
        }

        .menu-row-price {
          font-family: 'Poppins', sans-serif;
          font-weight: 800;
          font-size: 13px;
          color: #ff85bc;
          background: rgba(255, 45, 135, 0.14);
          border: 1px solid rgba(255, 45, 135, 0.35);
          padding: 5px 11px;
          border-radius: 999px;
          white-space: nowrap;
          transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
        }

        .menu-row-link:hover .menu-row-price {
          background: #ff2d87;
          border-color: #ffffff;
          color: #ffffff;
        }

        .menu-two-col {
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: 22px;
          margin-top: 32px;
        }

        @media (max-width: 880px) {
          .menu-two-col {
            grid-template-columns: 1fr;
          }
        }

        .menu-subcol {
          background: rgba(255, 255, 255, 0.035);
          border: 1.5px solid rgba(255, 255, 255, 0.13);
          border-radius: 26px;
          padding: clamp(22px, 3.5vw, 32px);
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.35);
        }

        .menu-subcol h3 {
          font-family: 'Poppins', sans-serif;
          font-weight: 800;
          font-size: clamp(19px, 2.2vw, 23px);
          letter-spacing: -0.02em;
          color: #ffffff;
          margin: 0 0 12px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .sticker-chip-group {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 16px;
        }

        .sticker-chip {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          min-height: 42px;
          padding: 9px 16px;
          border-radius: 999px;
          border: 1.5px solid rgba(255, 255, 255, 0.16);
          background: rgba(15, 9, 14, 0.65);
          color: #f5ebf0;
          font-family: 'Poppins', sans-serif;
          font-weight: 600;
          font-size: 13.5px;
          text-decoration: none;
          transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease, background 0.18s ease, color 0.18s ease;
        }

        .sticker-chip::before {
          content: '•';
          color: #ff2d87;
          font-size: 13px;
          line-height: 1;
        }

        .sticker-chip:hover {
          background: linear-gradient(135deg, #ff2d87 0%, #d10f67 100%);
          border-color: rgba(255, 255, 255, 0.4);
          color: #ffffff;
          transform: translate(-2px, -2px);
          box-shadow: 4px 4px 0 #ffffff;
        }

        .sticker-chip:hover::before {
          color: #ffffff;
        }

        /* ============================================
           9. LOYALTY CARD (2-COLUMN VIP CLUB SHOWCASE + REAL HELLO KITTY STAMPS)
           ============================================ */
        .loyalty-showcase-shell {
          position: relative;
          padding-top: clamp(44px, 5vw, 64px);
          padding-bottom: clamp(44px, 5vw, 64px);
          content-visibility: auto;
          contain-intrinsic-size: auto 760px;
        }

        .bridal-authority-shell {
          padding-top: clamp(44px, 5vw, 64px);
          padding-bottom: clamp(48px, 6vw, 76px);
        }

        .editorial-section-divider {
          max-width: 1180px;
          margin: 0 auto;
          padding: 0 clamp(18px, 5vw, 64px);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          pointer-events: none;
          user-select: none;
        }

        .editorial-divider-line {
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.12) 50%, rgba(255, 45, 135, 0.32) 100%);
        }

        .editorial-divider-line.is-right {
          background: linear-gradient(90deg, rgba(255, 45, 135, 0.32) 0%, rgba(255, 255, 255, 0.12) 50%, transparent 100%);
        }

        .editorial-divider-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: rgba(255, 45, 135, 0.55);
          box-shadow: 0 0 10px rgba(255, 45, 135, 0.5);
          flex-shrink: 0;
        }

        .loyalty-split {
          display: grid;
          grid-template-columns: 1.05fr 0.95fr;
          gap: clamp(32px, 5vw, 64px);
          align-items: center;
          background: #140910;
          border: 1.5px solid rgba(255, 45, 120, 0.28);
          border-radius: 38px;
          padding: clamp(32px, 5vw, 56px);
          box-shadow: 0 28px 72px rgba(0, 0, 0, 0.68), inset 0 1px 0 rgba(255, 255, 255, 0.1);
          position: relative;
          overflow: hidden;
        }

        html.anim-ready .loyalty-split {
          background:
            radial-gradient(circle at 82% 24%, rgba(255, 45, 120, 0.16) 0%, transparent 48%),
            radial-gradient(circle at 14% 84%, rgba(212, 175, 55, 0.1) 0%, transparent 45%),
            linear-gradient(155deg, rgba(26, 11, 20, 0.86) 0%, rgba(12, 7, 12, 0.94) 100%);
        }

        @media (max-width: 960px) {
          .loyalty-split {
            grid-template-columns: 1fr;
            padding: 28px 20px 32px;
          }
        }

        .loyalty-pitch-col {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
          min-width: 0;
        }

        .loyalty-perks-stack {
          display: flex;
          flex-direction: column;
          gap: 12px;
          width: 100%;
          margin: 24px 0 28px;
        }

        .loyalty-perk-card {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 15px 18px;
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.035);
          border: 1px solid rgba(255, 255, 255, 0.11);
          transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease;
        }

        .loyalty-perk-card:hover {
          transform: translateX(4px);
          border-color: rgba(255, 45, 120, 0.45);
          background: rgba(255, 45, 120, 0.08);
        }

        .loyalty-perk-icon {
          width: 42px;
          height: 42px;
          border-radius: 13px;
          background: linear-gradient(135deg, rgba(255, 45, 120, 0.22), rgba(255, 107, 168, 0.1));
          border: 1px solid rgba(255, 45, 120, 0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 19px;
          flex-shrink: 0;
        }

        .loyalty-perk-icon.is-gold {
          background: linear-gradient(135deg, rgba(212, 175, 55, 0.24), rgba(255, 215, 0, 0.08));
          border-color: rgba(212, 175, 55, 0.55);
        }

        .loyalty-perk-title {
          font-family: 'Poppins', sans-serif;
          font-weight: 800;
          font-size: 15px;
          color: #ffffff;
          margin: 0 0 3px;
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .loyalty-perk-tag {
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          padding: 2px 8px;
          border-radius: 999px;
          background: rgba(255, 45, 120, 0.2);
          color: #ff85bc;
          border: 1px solid rgba(255, 45, 120, 0.4);
        }

        .loyalty-perk-tag.is-gold {
          background: rgba(212, 175, 55, 0.2);
          color: #FFD700;
          border-color: rgba(212, 175, 55, 0.45);
        }

        .loyalty-perk-desc {
          font-family: 'Poppins', sans-serif;
          font-size: 13px;
          line-height: 1.5;
          color: #cbbbc4;
          margin: 0;
        }

        .loyalty-cta-row {
          display: flex;
          align-items: center;
          gap: 14px;
          flex-wrap: wrap;
        }

        .loyalty-wallet-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          border-radius: 999px;
          background: rgba(10, 6, 10, 0.72);
          border: 1px solid rgba(255, 255, 255, 0.16);
          font-family: 'Poppins', sans-serif;
          font-size: 12px;
          font-weight: 600;
          color: #e2d4dc;
        }

        .loyalty-perspective {
          position: relative;
          padding-top: 22px;
        }
        .loyalty-perspective:hover {
          perspective: 1100px;
        }

        .loyalty-ambient-glow {
          position: absolute;
          inset: -32px;
          background: radial-gradient(circle at 50% 50%, rgba(255, 45, 120, 0.24) 0%, rgba(212, 175, 55, 0.1) 42%, transparent 72%);
          pointer-events: none;
          z-index: 0;
        }

        /* Peeking 24k Gold Glam Insider Card behind the main card */
        .loyalty-insider-peek {
          position: absolute;
          top: 0;
          right: -8px;
          left: 24px;
          height: 110px;
          border-radius: 26px;
          background: linear-gradient(145deg, #161108 0%, #241b09 50%, #120d05 100%);
          border: 1.5px solid rgba(212, 175, 55, 0.55);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.65), 0 0 24px rgba(212, 175, 55, 0.18);
          transform: rotate(3.2deg) translateY(-6px);
          padding: 12px 20px;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          pointer-events: none;
          z-index: 1;
        }

        @media (max-width: 560px) {
          .loyalty-insider-peek {
            right: 0;
            left: 12px;
            transform: rotate(2deg) translateY(-6px);
          }
        }

        .loyalty-card-physical {
          position: relative;
          z-index: 2;
          max-width: 470px;
          margin: 0 auto;
          border-radius: 28px;
          background: linear-gradient(145deg, #1a0a12 0%, #220d1b 45%, #150716 100%);
          border: 1.5px solid rgba(255, 45, 120, 0.42);
          padding: 24px 22px 20px;
          box-shadow:
            0 26px 68px rgba(0, 0, 0, 0.78),
            0 0 44px rgba(255, 45, 120, 0.18),
            inset 0 1px 0 rgba(255, 255, 255, 0.12);
          transition: transform 0.16s ease-out, border-color 0.3s ease, box-shadow 0.3s ease;
          overflow: hidden;
          text-align: center;
        }

        .loyalty-card-physical.is-gold-ready {
          border-color: rgba(255, 215, 0, 0.65);
          box-shadow:
            0 26px 68px rgba(0, 0, 0, 0.78),
            0 0 56px rgba(255, 215, 0, 0.26),
            inset 0 1px 0 rgba(255, 215, 0, 0.25);
        }

        .loyalty-top-glow-line {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2.5px;
          background: linear-gradient(90deg, transparent, #FF2D78 35%, #FF6BA8 50%, #FFD700 65%, transparent);
          z-index: 3;
        }

        .loyalty-shimmer-sweep {
          position: absolute;
          top: 0;
          left: 0;
          width: 50%;
          height: 100%;
          background: linear-gradient(105deg, transparent 25%, rgba(255, 255, 255, 0.06) 50%, transparent 75%);
          pointer-events: none;
          z-index: 2;
          transform: translateX(60%);
        }
        .loyalty-card-physical:hover .loyalty-shimmer-sweep {
          animation: cardShimmerSweep 2.4s ease-in-out infinite;
        }

        @keyframes cardShimmerSweep {
          0%, 55% { transform: translateX(-160%); }
          100% { transform: translateX(300%); }
        }

        .loyalty-hk-watermark {
          position: absolute;
          bottom: -12px;
          right: -10px;
          width: 138px;
          height: 138px;
          opacity: 0.14;
          pointer-events: none;
          user-select: none;
          z-index: 0;
        }

        .loyalty-stamps-grid {
          position: relative;
          z-index: 2;
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 10px 8px;
          max-width: 360px;
          margin: 14px auto 14px;
          justify-items: center;
        }

        @media (max-width: 440px) {
          .loyalty-stamps-grid {
            gap: 8px 5px;
          }
        }

        .stamp-slot {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
        }

        .stamp-circle {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          transform: scale(1);
          opacity: 1;
          position: relative;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .stamp-slot:hover .stamp-circle {
          transform: scale(1.08) !important;
        }

        @media (max-width: 440px) {
          .stamp-circle {
            width: 42px;
            height: 42px;
          }
        }

        .stamp-circle.is-filled {
          background: linear-gradient(135deg, #FF2D78 0%, #FF6BA8 100%);
          border: 2px solid rgba(255, 133, 188, 0.78);
          box-shadow: 0 0 16px rgba(255, 45, 120, 0.45), 0 4px 10px rgba(0, 0, 0, 0.38);
        }

        .stamp-circle.is-filled.is-last-earned {
          background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
          border: 2px solid rgba(255, 255, 255, 0.85);
          box-shadow: 0 0 20px rgba(255, 215, 0, 0.65), 0 4px 12px rgba(0, 0, 0, 0.45);
        }

        .stamp-circle.is-dashed {
          background: rgba(255, 255, 255, 0.035);
          border: 1.5px dashed rgba(255, 255, 255, 0.2);
          color: rgba(255, 255, 255, 0.28);
        }

        .stamp-circle.is-last-slot {
          background: rgba(255, 215, 0, 0.07);
          border: 1.5px dashed rgba(255, 215, 0, 0.48);
          color: #FFD700;
          box-shadow: 0 0 14px rgba(255, 215, 0, 0.14);
        }

        .stamp-num-label {
          font-family: 'Poppins', sans-serif;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.03em;
          color: rgba(255, 255, 255, 0.32);
        }

        .stamp-slot.is-earned .stamp-num-label {
          color: #ff6ba8;
        }

        .stamp-slot.is-reward .stamp-num-label {
          color: #FFD700;
        }

        .loyalty-card-physical.go .stamp-circle {
          transform: scale(1);
          opacity: 1;
        }

        @keyframes stampPopIn {
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        .loyalty-footer-bar {
          position: relative;
          z-index: 2;
          border-top: 1px solid rgba(255, 45, 120, 0.16);
          margin-top: 14px;
          padding-top: 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          text-align: left;
        }

        @keyframes bowFloat { 0%,100%{transform:translateY(0) rotate(-4deg);} 50%{transform:translateY(-5px) rotate(4deg);} }
        @keyframes bowPulse { 0%,100%{transform:scale(1) rotate(3deg);opacity:.85;} 50%{transform:scale(1.12) rotate(-3deg);opacity:1;} }

        /* ============================================
           10. BRIDAL / AUTHORITY (EDITORIAL PHOTO CARDS + AREA PILLS)
           ============================================ */
        .bridal-showcase-panel {
          position: relative;
          border-radius: 40px;
          max-width: 1180px;
          margin: 0 auto;
          padding: clamp(48px, 7vw, 88px) clamp(18px, 4.5vw, 56px);
          background: #130910;
          border: 1.5px solid rgba(255, 45, 135, 0.36);
          box-shadow: 0 28px 72px rgba(0, 0, 0, 0.68), inset 0 1px 0 rgba(255, 255, 255, 0.12);
          overflow: hidden;
        }

        html.anim-ready .bridal-showcase-panel {
          background:
            radial-gradient(circle at 50% 0%, rgba(255, 45, 135, 0.2) 0%, transparent 52%),
            radial-gradient(circle at 85% 90%, rgba(212, 175, 55, 0.12) 0%, transparent 48%),
            linear-gradient(165deg, rgba(24, 11, 19, 0.94) 0%, rgba(11, 7, 11, 0.97) 100%);
        }

        .bridal-bg-ambient {
          position: absolute;
          inset: 0;
          opacity: 0.11;
          pointer-events: none;
          z-index: 0;
        }

        .bridal-tri-grid {
          position: relative;
          z-index: 2;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          margin: 44px 0 48px;
          text-align: left;
          align-items: stretch;
        }

        .bridal-glass-card {
          position: relative;
          display: flex;
          flex-direction: column;
          background: rgba(18, 10, 16, 0.94);
          border: 1.5px solid rgba(255, 255, 255, 0.15);
          border-radius: 28px;
          overflow: hidden;
          box-shadow: 0 20px 48px rgba(0, 0, 0, 0.55);
          transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
        }

        .bridal-glass-card:hover {
          transform: translateY(-6px);
          border-color: #ff2d87;
          box-shadow: 6px 6px 0 #ff2d87, 0 24px 56px rgba(0, 0, 0, 0.65);
        }

        .bridal-glass-card.is-middle {
          transform: translateY(-12px);
          background: linear-gradient(165deg, rgba(42, 14, 29, 0.95) 0%, rgba(20, 9, 16, 0.96) 100%);
          border-color: rgba(255, 45, 135, 0.58);
          box-shadow: 6px 6px 0 #ff2d87, 0 24px 60px rgba(255, 45, 135, 0.24);
        }

        .bridal-glass-card.is-middle:hover {
          transform: translateY(-16px);
          border-color: #ff6ba8;
          box-shadow: 8px 8px 0 #ff2d87, 0 28px 64px rgba(255, 45, 135, 0.32);
        }

        .bridal-card-media {
          position: relative;
          width: 100%;
          height: 220px;
          overflow: hidden;
          background: #160c12;
          flex-shrink: 0;
        }

        .bridal-card-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 22%;
          transition: transform 0.55s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .bridal-glass-card:hover .bridal-card-img {
          transform: scale(1.06);
        }

        .bridal-card-media-fade {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(10, 6, 9, 0.25) 0%, transparent 40%, rgba(18, 10, 16, 0.96) 100%);
          pointer-events: none;
        }

        .bridal-glass-card.is-middle .bridal-card-media-fade {
          background: linear-gradient(180deg, rgba(10, 6, 9, 0.2) 0%, transparent 40%, rgba(36, 12, 25, 0.96) 100%);
        }

        .bridal-card-badge {
          position: absolute;
          top: 14px;
          left: 14px;
          z-index: 2;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 12px;
          border-radius: 999px;
          background: rgba(12, 7, 11, 0.9);
          border: 1px solid rgba(255, 255, 255, 0.22);
          font-family: 'Poppins', sans-serif;
          font-size: 10.5px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #ffffff;
        }

        .bridal-glass-card.is-middle .bridal-card-badge {
          background: linear-gradient(135deg, #ff2d87 0%, #d10f67 100%);
          border-color: rgba(255, 255, 255, 0.45);
          box-shadow: 0 4px 14px rgba(255, 45, 135, 0.45);
        }

        .bridal-card-body {
          padding: 22px 24px 26px;
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .bridal-glass-card h3 {
          font-family: 'Poppins', sans-serif;
          font-weight: 800;
          font-size: 20px;
          line-height: 1.25;
          letter-spacing: -0.02em;
          color: #ffffff;
          margin: 0 0 10px;
        }

        .bridal-glass-card p {
          font-family: 'Poppins', sans-serif;
          font-size: 14.5px;
          line-height: 1.65;
          color: #d8ccd3;
          margin: 0;
        }

        .bridal-glass-card.is-middle p {
          color: #f4e8ef;
        }

        .bridal-areas-box {
          position: relative;
          z-index: 2;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.11);
          border-radius: 26px;
          padding: 24px 22px;
          margin-bottom: 36px;
        }

        .bridal-area-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          justify-content: center;
        }

        .bridal-area-chip {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          min-height: 44px;
          padding: 8px 16px 8px 10px;
          border-radius: 999px;
          border: 1.5px solid rgba(255, 255, 255, 0.16);
          background: rgba(14, 8, 13, 0.78);
          color: #f5ebf0;
          font-family: 'Poppins', sans-serif;
          font-weight: 600;
          font-size: 13.5px;
          text-decoration: none;
          transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease, background 0.18s ease, color 0.18s ease;
        }

        .bridal-area-pin {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: rgba(255, 45, 135, 0.16);
          border: 1px solid rgba(255, 45, 135, 0.42);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: background 0.18s ease, border-color 0.18s ease;
        }

        .bridal-area-chip:hover {
          background: linear-gradient(135deg, #ff2d87 0%, #d10f67 100%);
          border-color: rgba(255, 255, 255, 0.45);
          color: #ffffff;
          transform: translate(-2px, -2px);
          box-shadow: 4px 4px 0 #ffffff;
        }

        .bridal-area-chip:hover .bridal-area-pin {
          background: rgba(255, 255, 255, 0.22);
          border-color: rgba(255, 255, 255, 0.6);
        }

        @media (max-width: 920px) {
          .bridal-tri-grid {
            grid-template-columns: 1fr;
            margin: 32px 0 36px;
          }
          .bridal-glass-card.is-middle {
            transform: none;
          }
          .bridal-glass-card.is-middle:hover {
            transform: translateY(-4px);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .rvl,
          .stamp-circle {
            opacity: 1 !important;
            transform: none !important;
            animation: none !important;
          }
          .hero-big-star,
          .ticker-track,
          .reviews-marquee-track {
            animation: none !important;
          }
        }
      `}</style>

      {/* ============ 2. HERO BANNER (FULL-BLEED) ============ */}
      <section className="hero-fullbleed">
        <div className="hero-bg-layer" aria-hidden="true">
          <div className="hero-bg-overlay" />
        </div>

        <div className="hero-inner">
          {/* Left Column: All Hero Copy & CTAs (exact wording preserved) */}
          <div className="hero-copy-col">
            <div className="hero-sticker-badge">
              <MapPin size={14} color="#ff2d87" strokeWidth={2.5} />
              <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', color: '#fff', fontWeight: 700 }}>
                {t('home.locationPill')}
              </span>
            </div>

            <h1 className="hero-h1">
              Nail Salon, Hair Color &amp; Bridal Studio in{' '}
              <span className="hero-hl-chip">San Marcos &amp; Vista, CA</span>
            </h1>

            <p className="hero-addr-line">
              935 W San Marcos Blvd, Suite 101 · Gel-X &amp; Acrylic Nails · Pedicures · Balayage · Bridal HMUA
            </p>

            <p className="hero-tagline">
              {t('home.heroTagline').split('\n').map((line, i) => (
                <span key={i}>{line}{i === 0 && <br />}</span>
              ))}
            </p>

            <div className="hero-actions">
              <a href="/book" className="pop-btn-primary btn-pulse">
                {t('common.bookNow')} <ChevronRight size={16} />
              </a>
              <a href="/services" className="pop-btn-outline">
                {t('common.viewServices')}
              </a>
            </div>
          </div>

          {/* Right Column: Live Interactive Slideshow Showcase */}
          <div className="hero-slider-stage" aria-hidden="true">
            <div
              className="hero-slider-frame"
              onTouchStart={e => { sliderTouchStartX.current = e.touches[0].clientX; }}
              onTouchEnd={e => {
                if (sliderTouchStartX.current === null) return;
                const diff = sliderTouchStartX.current - e.changedTouches[0].clientX;
                if (Math.abs(diff) > 36) {
                  setSliderIdx(prev => (prev + (diff > 0 ? 1 : -1) + sliderImages.length) % sliderImages.length);
                }
                sliderTouchStartX.current = null;
              }}
            >
              {sliderImages.map((img, i) => (
                <div
                  key={`stage-${img.id}`}
                  className={`hero-slide-item ${i === sliderIdx ? 'is-active' : ''}`}
                >
                  {(i === 0 || i === sliderIdx) && (
                    <img
                      src={resolveOptimizedHeroUrl(img.url, i)}
                      alt=""
                      decoding={i === 0 ? 'sync' : 'async'}
                      loading={i === 0 ? 'eager' : 'lazy'}
                      fetchPriority={i === 0 ? 'high' : 'auto'}
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center center' }}
                    />
                  )}
                </div>
              ))}
              <div className="hero-slider-vignette" />

              {sliderImages.length > 1 && (
                <div className="hero-slider-controls">
                  <div className="hero-slider-dots">
                    {sliderImages.map((img, idx) => (
                      <button
                        key={`dot-${img.id}`}
                        type="button"
                        tabIndex={-1}
                        className={`hero-slider-dot ${idx === sliderIdx ? 'is-active' : ''}`}
                        onClick={() => setSliderIdx(idx)}
                      />
                    ))}
                  </div>
                  <div className="hero-slider-arrows">
                    <button
                      type="button"
                      tabIndex={-1}
                      className="hero-slider-arrow"
                      onClick={() => setSliderIdx(prev => (prev - 1 + sliderImages.length) % sliderImages.length)}
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      type="button"
                      tabIndex={-1}
                      className="hero-slider-arrow"
                      onClick={() => setSliderIdx(prev => (prev + 1) % sliderImages.length)}
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="hero-big-star" aria-hidden="true">
          <svg width="260" height="260" viewBox="0 0 100 100" fill="currentColor" style={{ width: '1em', height: '1em', display: 'block' }}>
            <path d="M50 0C54 36 64 46 100 50C64 54 54 64 50 100C46 64 36 54 0 50C36 46 46 36 50 0Z" />
          </svg>
        </div>
      </section>

      {/* ============ 3. SLANTED MARQUEE TICKER (DECORATIVE) ============ */}
      <div className="ticker-bar" aria-hidden="true">
        <div className="ticker-track">
          <span>NAIL SALON &bull; HAIR COLOR &bull; BRIDAL STUDIO &bull; SAN MARCOS &amp; VISTA, CA &bull;</span>
          <span>NAIL SALON &bull; HAIR COLOR &bull; BRIDAL STUDIO &bull; SAN MARCOS &amp; VISTA, CA &bull;</span>
          <span>NAIL SALON &bull; HAIR COLOR &bull; BRIDAL STUDIO &bull; SAN MARCOS &amp; VISTA, CA &bull;</span>
          <span>NAIL SALON &bull; HAIR COLOR &bull; BRIDAL STUDIO &bull; SAN MARCOS &amp; VISTA, CA &bull;</span>
        </div>
      </div>

      {/* ============ 4. STUDIO ABOUT / OVERVIEW (LUXURY BENTO EDITORIAL) ============ */}
      <section className="section-shell intro-editorial">
        <div className="section-wrap">
          <div className="intro-header">
            <p className="eyebrow-pill">
              Welcome to Glitz &amp; Glamour
            </p>
            <h2 className="section-h2">
              San Diego&apos;s Boutique Destination for Nails, Hair &amp; Skin
            </h2>
          </div>

          <div className="intro-bento-grid" ref={introGridRef}>
            {/* Card 01: Wide Horizontal Split (Photo Left + Copy Right) */}
            <article className="intro-photo-card card-span-7">
              <div className="intro-card-media" aria-hidden="true">
                {belowFoldReady && (
                  <img
                    src="/hero-slider/slide-7-sm.webp"
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="intro-card-img"
                  />
                )}
                <div className="intro-card-media-fade" />
                <span className="intro-card-num">01</span>
              </div>
              <div className="intro-card-body">
                <p className="intro-p rvl">
                  Welcome to <strong>Glitz &amp; Glamour Studio</strong>, North County San Diego&apos;s premier boutique salon specializing in luxury nails, precision hair coloring, tailored haircuts, gentle waxing, and therapeutic facials. Located at <strong>935 W San Marcos Blvd, Suite 101, San Marcos, CA 92078</strong> and proudly serving guests across San Marcos, Vista, Oceanside, Carlsbad, Escondido, and greater San Diego County, our private studio is led by master stylist and esthetician JoJany.
                </p>
              </div>
            </article>

            {/* Card 02: Vertical Portrait Photo Header + Copy */}
            <article className="intro-photo-card card-span-5">
              <div className="intro-card-media" aria-hidden="true">
                {belowFoldReady && (
                  <img
                    src="/hero-slider/slide-4-sm.webp"
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="intro-card-img"
                  />
                )}
                <div className="intro-card-media-fade" />
                <span className="intro-card-num">02</span>
              </div>
              <div className="intro-card-body">
                <p className="intro-p rvl">
                  If you are searching for exceptional <strong>san diego hair</strong> or exploring top-rated <strong>hair salons in san marcos ca</strong>, Glitz &amp; Glamour Studio provides an elevated alternative to crowded, rushed franchise salons. We believe beauty services should never feel like an assembly line. When you sit in our chair, you receive dedicated one-on-one attention, thoughtful consultations, and custom-blended formulations tailored precisely to your facial symmetry, hair porosity, and daily lifestyle.
                </p>
              </div>
            </article>

            {/* Card 03: Vertical Portrait Photo Header + Copy */}
            <article className="intro-photo-card card-span-5">
              <div className="intro-card-media" aria-hidden="true">
                {belowFoldReady && (
                  <img
                    src="/hero-slider/slide-5-sm.webp"
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="intro-card-img"
                  />
                )}
                <div className="intro-card-media-fade" />
                <span className="intro-card-num">03</span>
              </div>
              <div className="intro-card-body">
                <p className="intro-p rvl">
                  Our specialty menu includes sculpted full sets of <strong>acrylic nails</strong>, lightweight <strong>Gel-X extensions</strong>, Russian-style cuticle manicures, and indulgent jelly detox pedicures. On the hair side, we are renowned for seamless hand-painted <strong>balayage</strong>, brilliant dimensional highlights, radiant single-process color, and precision women&apos;s and men&apos;s haircuts that grow out gracefully. For complete skincare and wellness, our menu extends to professional pore-clearing facials, anti-aging enzyme resurfacing, and hygienic, gentle Brazilian waxing.
                </p>
              </div>
            </article>

            {/* Card 04: Wide Horizontal Split Reversed (Copy Left + Photo Right) */}
            <article className="intro-photo-card card-span-7 card-reverse">
              <div className="intro-card-body">
                <p className="intro-p rvl">
                  What sets our <strong>nail salon san marcos ca</strong> and <strong>hair salon san marcos ca</strong> apart is our uncompromising standard for health, safety, and transparent pricing. We use only premium, non-damaging products, maintain hospital-grade sanitation protocols, and communicate all service options upfront before we begin. Experience why clients across San Marcos, Vista, and North County award us 5-star reviews — reserve your appointment online with Glitz &amp; Glamour Studio today.
                </p>
              </div>
              <div className="intro-card-media" aria-hidden="true">
                {belowFoldReady && (
                  <img
                    src="/hero-slider/slide-2-sm.webp"
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="intro-card-img"
                  />
                )}
                <div className="intro-card-media-fade" />
                <span className="intro-card-num">04</span>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* ============ 5. REVIEWS (TWO-COLUMN SPLIT + LUXURY STAGE) ============ */}
      <section className="section-shell reviews-section" id="reviews">
        <div className="section-wrap reviews-split">
          {/* Left Column: Eyebrow, H2, Sculpted 5.0 Score Panel */}
          <div className="reviews-left-col">
            <div>
              <p className="eyebrow-pill">
                {t('home.testimonialsLabel')}
              </p>
              <h2 className="section-h2">
                {t('home.testimonialsHeading')}
              </h2>
            </div>

            <div className="reviews-score-panel">
              {belowFoldReady && (
                <div className="reviews-score-bg-photo" aria-hidden="true">
                  <img
                    src="/hero-slider/slide-3-sm.webp"
                    alt=""
                    loading="lazy"
                    decoding="async"
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              )}
              <div className="reviews-giant-score">5.0</div>
              <div style={{ display: 'flex', gap: '6px', marginBottom: '14px' }} aria-hidden="true">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={24} fill="#ffb800" color="#ffb800" />
                ))}
              </div>
              <div className="reviews-verified-pill">
                <span style={{ fontWeight: 800, color: '#ffb800', fontSize: '15px' }}>5.0</span>
                <span style={{ color: '#e8e0e5', fontSize: '14px', fontWeight: 600 }}>
                  {t('home.ratingSuffix', { count: reviewStats.totalCount })}
                </span>
              </div>
              <div style={{ marginTop: '10px', fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#dfd2d9', fontWeight: 600, letterSpacing: '0.2px' }}>
                {reviewStats.setmoreTotalCount}+ on Setmore · {reviewStats.googleTotalCount}+ on Google
              </div>
            </div>
          </div>

          {/* Right Column: Spotlight Review Card + Contained Marquee + CTAs */}
          <div className="reviews-note-stage">
            <div
              className={`tc-card ${reviewAnim === 'out' ? 'anim-out' : 'anim-in'} ${reviewExpanded ? 'is-expanded' : ''}`}
              onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
              onTouchEnd={(e) => {
                if (touchStartX.current === null) return;
                const diff = touchStartX.current - e.changedTouches[0].clientX;
                if (Math.abs(diff) > 40) {
                  goToReview(diff > 0 ? reviewIdx + 1 : reviewIdx - 1);
                  startReviewTimer();
                }
                touchStartX.current = null;
              }}
            >
              {/* Dynamic Source badge (defaults to Setmore verified badge) */}
              {reviewsList[reviewIdx].source === 'google' ? (
                <div className="tc-google-badge">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span>from <b>Google</b></span>
                </div>
              ) : (
                <div className="tc-setmore-badge">
                  <svg width="12" height="12" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="40" height="40" rx="8" fill="#0060FF" />
                    <path d="M20 8C13.37 8 8 13.37 8 20C8 26.63 13.37 32 20 32C26.63 32 32 26.63 32 20C32 13.37 26.63 8 20 8ZM24.5 22.5C24.5 23.88 23.38 25 22 25H14V23H22C22.28 23 22.5 22.78 22.5 22.5V19.5C22.5 19.22 22.28 19 22 19H18C16.62 19 15.5 17.88 15.5 16.5V15.5C15.5 14.12 16.62 13 18 13H26V15H18C17.72 15 17.5 15.22 17.5 15.5V16.5C17.5 16.78 17.72 17 18 17H22C23.38 17 24.5 18.12 24.5 19.5V22.5Z" fill="white" />
                  </svg>
                  <span>from <b>Setmore</b></span>
                </div>
              )}

              {/* Big quote mark */}
              <span className="tc-quote-mark" aria-hidden="true">&ldquo;</span>

              {/* Review text + Full review expand toggle */}
              <div className="tc-text-wrap">
                <p className={`tc-text ${reviewExpanded ? '' : 'is-clamped'}`}>
                  {reviewsList[reviewIdx].text}
                </p>
                {reviewsList[reviewIdx].text.length > 150 && (
                  <button
                    type="button"
                    className="tc-expand-btn"
                    aria-expanded={reviewExpanded}
                    onClick={() => {
                      const nextExpanded = !reviewExpanded;
                      setReviewExpanded(nextExpanded);
                      if (nextExpanded) {
                        if (reviewTimerRef.current) clearInterval(reviewTimerRef.current);
                      } else {
                        startReviewTimer();
                      }
                    }}
                  >
                    <span>{reviewExpanded ? 'Show less' : 'Full review'}</span>
                    <ChevronRight
                      size={13}
                      style={{
                        transform: reviewExpanded ? 'rotate(-90deg)' : 'rotate(90deg)',
                        transition: 'transform 0.2s ease',
                      }}
                    />
                  </button>
                )}
              </div>

              {/* Author + Prev/Next */}
              <div className="tc-author">
                <div className="tc-author-left">
                  <div className="tc-avatar">
                    {reviewsList[reviewIdx].initial}
                  </div>
                  <div>
                    <div className="tc-name">{reviewsList[reviewIdx].name}</div>
                    <div className="tc-meta">
                      <div className="tc-stars">
                        {Array.from({ length: reviewsList[reviewIdx].rating || 5 }).map((_, j) => (
                          <Star key={j} size={12} fill="#ffb800" color="#ffb800" />
                        ))}
                      </div>
                      <span className="tc-date">· {reviewsList[reviewIdx].date}</span>
                    </div>
                  </div>
                </div>

                <div className="tc-controls">
                  <span className="tc-counter" aria-hidden="true">
                    {String(reviewIdx + 1).padStart(2, '0')} / {String(reviewsList.length).padStart(2, '0')}
                  </span>
                  <button
                    type="button"
                    className="tc-nav-btn"
                    aria-label="Previous review"
                    onClick={() => { goToReview(reviewIdx - 1); startReviewTimer(); }}
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    type="button"
                    className="tc-nav-btn"
                    aria-label="Next review"
                    onClick={() => { goToReview(reviewIdx + 1); startReviewTimer(); }}
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* Horizontal marquee of additional review sticker notes (aria-hidden decoration to avoid duplicating DOM screen-reader text) */}
            {belowFoldReady && reviewsList.length > 1 && (
              <div className="reviews-marquee-wrap" aria-hidden="true">
                <div className="reviews-marquee-track">
                  {[...reviewsList, ...reviewsList].map((rev, idx) => {
                    const realIdx = idx % reviewsList.length;
                    return (
                      <button
                        key={`${rev.name}-${idx}`}
                        type="button"
                        tabIndex={-1}
                        className={`mini-note-card ${realIdx === reviewIdx ? 'is-current' : ''}`}
                        onClick={() => { goToReview(realIdx); startReviewTimer(); }}
                      >
                        <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#e5e5e5', lineHeight: 1.45, marginBottom: '8px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          &ldquo;{rev.text}&rdquo;
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', fontFamily: 'Poppins, sans-serif' }}>
                          <strong style={{ color: '#fff' }}>{rev.name}</strong>
                          <span style={{ color: '#ffb800', letterSpacing: '1px', fontWeight: 800 }}>5.0 / 5</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Centered CTA buttons below both columns */}
        <div className="section-wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', marginTop: '36px', flexWrap: 'wrap' }}>
          <a href="/reviews" className="pop-btn-outline">
            {t('common.viewAllReviews')} <ChevronRight size={15} />
          </a>
          <a href="/reviews" className="pop-btn-primary">
            <Star size={15} strokeWidth={2} fill="currentColor" /> {t('common.leaveReview')}
          </a>
        </div>
      </section>

      {/* ============ 6. PREMIUM BEAUTY SERVICES (ALL 29 SERVICES IN SEO SLIDER) ============ */}
      <section className="section-shell" id="services">
        <div className="section-wrap">
          <div className="services-top-bar">
            <div>
              <p className="eyebrow-pill">
                {t('home.whatWeDoLabel')}
              </p>
              <h2 className="section-h2">
                {t('home.servicesHeading')}
              </h2>
              <p style={{ fontFamily: 'Poppins, sans-serif', color: '#cccccc', fontSize: 'clamp(15px, 1.8vw, 18px)', maxWidth: '38em', lineHeight: 1.6 }}>
                {t('home.servicesSubtext')}
              </p>
            </div>
          </div>

          {/* Interactive Category Filter Pills + Prev/Next Carousel Controls */}
          <div className="services-filter-bar" aria-label="Filter services by category">
            <div className="services-cat-pills">
              {SERVICE_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  className={`services-cat-pill ${activeServiceCat === cat.id ? 'is-active' : ''}`}
                  onClick={() => {
                    setActiveServiceCat(cat.id);
                    if (servicesScrollerRef.current) {
                      servicesScrollerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
                    }
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="services-nav-arrows">
              <button
                type="button"
                className="tc-nav-btn"
                aria-label="Scroll services left"
                onClick={() => scrollServicesBy(-1)}
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                className="tc-nav-btn"
                aria-label="Scroll services right"
                onClick={() => scrollServicesBy(1)}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Full-bleed horizontal scroll-snap row of service poster cards */}
        <div className="services-scroller" ref={servicesScrollerRef}>
          {(belowFoldReady ? featuredServices : featuredServices.slice(0, 6)).map((service, i) => {
            const hiddenByCat = activeServiceCat !== 'all' && service.category && service.category !== activeServiceCat;
            return (
              <article
                key={service.id || i}
                className={`poster-card ${hiddenByCat ? 'is-hidden-cat' : ''}`}
                data-category={service.category || 'all'}
              >
                {belowFoldReady && (
                  <img
                    src={service.image}
                    alt={service.name}
                    loading="lazy"
                    decoding="async"
                    className="poster-card-img"
                  />
                )}
                <div className="poster-card-overlay" />

                <div className="poster-card-top" aria-hidden="true">
                  <span className="poster-cat-badge">{service.categoryLabel || 'Salon Service'}</span>
                  <span className="poster-price-pill">{service.price}</span>
                </div>

                <div className="poster-card-content">
                  <p className="poster-title">{service.name}</p>
                  <span className="poster-price">{service.price}</span>
                  <div className="poster-actions">
                    <a
                      href={service.id ? `/services/${service.id}` : service.href}
                      className="poster-btn-details"
                    >
                      {t('common.details')}
                    </a>
                    <a
                      href={service.bookId || service.id ? `/book?service=${service.bookId || service.id}` : '/book'}
                      aria-label={`Book ${service.name}`}
                      className="poster-btn-book"
                    >
                      {t('common.book')}
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="section-wrap" style={{ textAlign: 'center', marginTop: '12px', display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="/services" className="pop-btn-outline">{t('common.browseAllServices')}</a>
          <a href="/book" className="pop-btn-primary">{t('common.bookAppointment')} <ChevronRight size={15} /></a>
        </div>
      </section>

      {/* ============ 7 & 8. COMPLETE SALON MENU (ACCORDIONS) + EVENT PACKAGES & AREAS (LUXURY DIRECTORY) ============ */}
      <section className="menu-dark-panel" id="menu">
        <div className="section-wrap">
          <div className="menu-header-block">
            <p className="menu-eyebrow">
              <MapPin size={14} color="#ff2d87" strokeWidth={2.5} aria-hidden="true" />
              Full Service Directory · 935 W San Marcos Blvd, Suite 101
            </p>
            <h2 className="section-h2">
              Complete Salon Menu &amp; Starting Prices (San Marcos &amp; Vista, CA)
            </h2>
            <p style={{ fontFamily: 'Poppins, sans-serif', color: '#cccccc', fontSize: 'clamp(15px, 1.8vw, 18px)', maxWidth: '42em', margin: 0, lineHeight: 1.6 }}>
              Explore all 29 salon treatments and 9 special event packages available at our San Marcos flagship studio (just minutes from Vista, CA). Select any service for full details, FAQs, and instant online booking.
            </p>
          </div>

          <div className="menu-accordions-stack">
            {/* Accordion 1: Nails & Pedicures (Open by default) */}
            <details className="menu-accordion" open>
              <summary className="menu-summary">
                <div className="menu-summary-left">
                  <span className="menu-cat-num" aria-hidden="true">01</span>
                  <h3>Nails &amp; Pedicures</h3>
                  <span className="menu-cat-count" aria-hidden="true">10 Services</span>
                </div>
                <span className="menu-summary-plus" aria-hidden="true">+</span>
              </summary>
              <ul className="menu-list">
                {[
                  { slug: 'acrylic-set', name: 'Acrylic Full Set', price: 'From $65' },
                  { slug: 'gelx', name: 'Gel-X Nail Extensions', price: 'From $60' },
                  { slug: 'fill', name: 'Acrylic Nail Fill', price: 'From $35' },
                  { slug: 'rebalance', name: 'Acrylic Nail Rebalance', price: 'From $55' },
                  { slug: 'manicure', name: 'Classic & Gel Manicure', price: 'From $40' },
                  { slug: 'soak-off-my-work', name: 'Safe Nail Soak-Off (My Work)', price: 'From $30' },
                  { slug: 'foreign-soak-off', name: 'Foreign Nail Soak-Off', price: 'From $50' },
                  { slug: 'classic-foot-soak-detox', name: 'Classic Foot Soak Detox Pedicure', price: 'From $65' },
                  { slug: 'jelly-hydrating-foot-detox', name: 'Jelly Hydrating Foot Detox Pedicure', price: 'From $75' },
                  { slug: 'acrylic-toes', name: 'Full Set Acrylic Toes', price: 'From $45' },
                ].map(item => {
                  const liveSvc = featuredServices.find(s => s.id === item.slug);
                  return (
                    <li key={item.slug}>
                      <a href={`/services/${item.slug}`} className="menu-row-link">
                        <span className="menu-row-left">
                          {belowFoldReady && (
                            <img
                              src={liveSvc?.image || `/services/catalog/${item.slug}.webp`}
                              alt=""
                              aria-hidden="true"
                              loading="lazy"
                              decoding="async"
                              className="menu-row-thumb"
                            />
                          )}
                          <span className="menu-row-name">{item.name}</span>
                        </span>
                        <span className="menu-row-right">
                          <span className="menu-row-price">{liveSvc?.price || item.price}</span>
                        </span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </details>

            {/* Accordion 2: Haircuts & Color */}
            <details className="menu-accordion">
              <summary className="menu-summary">
                <div className="menu-summary-left">
                  <span className="menu-cat-num" aria-hidden="true">02</span>
                  <h3>Haircuts &amp; Color</h3>
                  <span className="menu-cat-count" aria-hidden="true">10 Services</span>
                </div>
                <span className="menu-summary-plus" aria-hidden="true">+</span>
              </summary>
              <ul className="menu-list">
                {[
                  { slug: 'balayage', name: 'Custom Lived-In Balayage', price: 'From $380' },
                  { slug: 'highlights', name: 'Dimensional Foil Highlights', price: 'From $380' },
                  { slug: 'solid-one-tone', name: 'Solid One-Tone Hair Color', price: 'From $120' },
                  { slug: 'gloss', name: 'Hair Gloss & Toner Refresh', price: 'From $65' },
                  { slug: 'vivids', name: 'Vivid & Fashion Hair Color', price: 'From $380' },
                  { slug: 'creative-color', name: 'Creative Color & Color Melt', price: 'From $150' },
                  { slug: 'womens-haircut', name: "Women's Haircut & Blowout", price: 'From $65' },
                  { slug: 'mens-haircut', name: "Men's Haircut & Grooming", price: 'From $45' },
                  { slug: 'kids-haircut-girls', name: 'Kids Haircut (Girls)', price: 'From $35' },
                  { slug: 'kids-haircut-boys', name: 'Kids Haircut (Boys)', price: 'From $35' },
                ].map(item => {
                  const liveSvc = featuredServices.find(s => s.id === item.slug);
                  return (
                    <li key={item.slug}>
                      <a href={`/services/${item.slug}`} className="menu-row-link">
                        <span className="menu-row-left">
                          {belowFoldReady && (
                            <img
                              src={liveSvc?.image || `/services/catalog/${item.slug}.webp`}
                              alt=""
                              aria-hidden="true"
                              loading="lazy"
                              decoding="async"
                              className="menu-row-thumb"
                            />
                          )}
                          <span className="menu-row-name">{item.name}</span>
                        </span>
                        <span className="menu-row-right">
                          <span className="menu-row-price">{liveSvc?.price || item.price}</span>
                        </span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </details>

            {/* Accordion 3: Facials, Waxing & Lashes */}
            <details className="menu-accordion">
              <summary className="menu-summary">
                <div className="menu-summary-left">
                  <span className="menu-cat-num" aria-hidden="true">03</span>
                  <h3>Facials, Waxing &amp; Lashes</h3>
                  <span className="menu-cat-count" aria-hidden="true">9 Services</span>
                </div>
                <span className="menu-summary-plus" aria-hidden="true">+</span>
              </summary>
              <ul className="menu-list">
                {[
                  { slug: 'mini-facial', name: 'Express Mini Facial (30 Min)', price: 'From $30' },
                  { slug: 'basic-facial', name: 'Custom Nourishing Facial', price: 'From $75' },
                  { slug: 'deep-cleansing-extraction-facial', name: 'Deep Cleansing + Extraction Facial', price: 'From $85' },
                  { slug: 'anti-aging-and-enzyme-facial', name: 'Anti-Aging & Enzyme Facial', price: 'From $100' },
                  { slug: 'brazilian', name: 'Female Brazilian Wax', price: 'From $60' },
                  { slug: 'eyebrow-wax', name: 'Eyebrow Wax & Arch Shaping', price: 'From $12' },
                  { slug: 'underarm', name: 'Underarm Wax', price: 'From $20' },
                  { slug: 'sideburns', name: 'Sideburns Wax', price: 'From $15' },
                  { slug: 'upper-lip', name: 'Upper Lip Wax', price: 'From $10' },
                ].map(item => {
                  const liveSvc = featuredServices.find(s => s.id === item.slug);
                  return (
                    <li key={item.slug}>
                      <a href={`/services/${item.slug}`} className="menu-row-link">
                        <span className="menu-row-left">
                          {belowFoldReady && (
                            <img
                              src={liveSvc?.image || `/services/catalog/${item.slug}.webp`}
                              alt=""
                              aria-hidden="true"
                              loading="lazy"
                              decoding="async"
                              className="menu-row-thumb"
                            />
                          )}
                          <span className="menu-row-name">{item.name}</span>
                        </span>
                        <span className="menu-row-right">
                          <span className="menu-row-price">{liveSvc?.price || item.price}</span>
                        </span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </details>
          </div>

          {/* 8. All 9 Special Events & Bridal Packages + North County Service Areas */}
          <div className="menu-two-col">
            <div className="menu-subcol">
              <h3>Bridal &amp; Special Event Hair &amp; Makeup</h3>
              <div className="sticker-chip-group">
                {[
                  { slug: 'weddings-bridal', name: 'Weddings & Bridal HMUA' },
                  { slug: 'quinceaneras', name: 'Quinceañeras' },
                  { slug: 'prom-homecoming', name: 'Prom & Homecoming' },
                  { slug: 'on-location-hair-makeup', name: 'On-Location Mobile Glam' },
                  { slug: 'baby-showers', name: 'Baby Showers & Maternity' },
                  { slug: 'corporate-gala', name: 'Corporate & Gala Events' },
                  { slug: 'bridal-showers-bachelorettes', name: 'Bridal Showers & Bachelorettes' },
                  { slug: 'sweet-16-birthdays', name: 'Sweet 16 & Birthdays' },
                  { slug: 'photo-video-shoots', name: 'Photo & Video Shoots' },
                ].map(ev => (
                  <a
                    key={ev.slug}
                    href={`/special-events/${ev.slug}`}
                    className="sticker-chip"
                  >
                    {ev.name}
                  </a>
                ))}
              </div>
            </div>

            <div className="menu-subcol">
              <h3>Serving San Marcos, Vista &amp; North County</h3>
              <p style={{ fontFamily: 'Poppins, sans-serif', color: '#cccccc', fontSize: '15px', lineHeight: 1.6, marginBottom: '12px' }}>
                Visit our flagship studio at 935 W San Marcos Blvd, Suite 101, or explore our local neighborhood beauty guides across North County San Diego:
              </p>
              <div className="sticker-chip-group">
                {[
                  { href: '/service-areas/san-marcos-ca', label: 'San Marcos, CA' },
                  { href: '/service-areas/vista-ca', label: 'Vista, CA' },
                  { href: '/service-areas/escondido-ca', label: 'Escondido, CA' },
                  { href: '/service-areas/carlsbad-ca', label: 'Carlsbad, CA' },
                  { href: '/service-areas/oceanside-ca', label: 'Oceanside, CA' },
                  { href: '/service-areas/encinitas-ca', label: 'Encinitas, CA' },
                ].map(loc => (
                  <a
                    key={loc.href}
                    href={loc.href}
                    className="sticker-chip"
                  >
                    {loc.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Minimal Hairline Divider */}
      <div className="editorial-section-divider" aria-hidden="true" style={{ marginTop: 'clamp(44px, 5vw, 64px)' }}>
        <span className="editorial-divider-line" />
        <span className="editorial-divider-dot" />
        <span className="editorial-divider-line is-right" />
      </div>

      {/* ============ 9. LOYALTY CARD (2-COLUMN VIP CLUB SHOWCASE + REAL HELLO KITTY STAMPS) ============ */}
      <section className="section-shell loyalty-showcase-shell">
        <div className="section-wrap">
          <div className="loyalty-split">
            {/* Left Column: VIP Club Pitch, 3 Tangible Perks & Primary CTA */}
            <div className="loyalty-pitch-col">
              <span className="eyebrow-pill">
                {belowFoldReady && (
                  <img src="/new_bowdesign.svg" alt="Bow" width={18} height={18} loading="lazy" style={{ objectFit: 'contain' }} />
                )}
                {t('home.loyaltyLabel')}
              </span>
              <h2 className="section-h2" style={{ marginBottom: '12px' }}>
                {t('home.loyaltyHeading')}
              </h2>
              <p style={{ fontFamily: 'Poppins, sans-serif', color: '#dcd0d6', fontSize: 'clamp(15px, 1.6vw, 17.5px)', maxWidth: '480px', margin: 0, lineHeight: 1.65 }}>
                {t('home.loyaltySubtext')}
              </p>

              {/* 3 Tangible Program Pillars (visual showcase, aria-hidden so SEO copy stays untouched) */}
              <div className="loyalty-perks-stack" aria-hidden="true">
                <div className="loyalty-perk-card">
                  <div className="loyalty-perk-icon">
                    <Sparkles size={20} color="#ff85bc" strokeWidth={2.2} />
                  </div>
                  <div>
                    <p className="loyalty-perk-title">
                      10 Hello Kitty Stamps = Free Nail Set
                      <span className="loyalty-perk-tag">Automatic Stamp</span>
                    </p>
                    <p className="loyalty-perk-desc">
                      Stamps are issued automatically to your account as soon as your booking is marked complete. Collect 10 stamps to unlock a complimentary full nail set.
                    </p>
                  </div>
                </div>

                <div className="loyalty-perk-card">
                  <div className="loyalty-perk-icon is-gold">
                    <Gift size={20} color="#FFD700" strokeWidth={2.2} />
                  </div>
                  <div>
                    <p className="loyalty-perk-title">
                      Birthday Spin-the-Wheel on Us
                      <span className="loyalty-perk-tag is-gold">Annual Gift</span>
                    </p>
                    <p className="loyalty-perk-desc">
                      Add your birthday to your member profile and unlock a free spin at our studio prize wheel on your special day.
                    </p>
                  </div>
                </div>

                <div className="loyalty-perk-card">
                  <div className="loyalty-perk-icon">
                    <Smartphone size={20} color="#ff85bc" strokeWidth={2.2} />
                  </div>
                  <div>
                    <p className="loyalty-perk-title">
                      Apple Wallet, Google Wallet &amp; Gold Tier
                      <span className="loyalty-perk-tag">2-Tier VIP</span>
                    </p>
                    <p className="loyalty-perk-desc">
                      Save your live stamp card to your phone&apos;s lock screen and refer friends to unlock the 24k Gold Glam Insider card.
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA + Wallet Pass Badge */}
              <div className="loyalty-cta-row">
                {session ? (
                  <a href="/card" className="pop-btn-primary">
                    {belowFoldReady && (
                      <img src="/new_bowdesign.svg" alt="Bow" width={20} height={20} loading="lazy" style={{ objectFit: 'contain' }} />
                    )} {t('common.viewOurCard')} <ChevronRight size={15} />
                  </a>
                ) : (
                  <a href="/sign-in" className="pop-btn-primary">
                    {t('common.getStartedFree')} <ChevronRight size={15} />
                  </a>
                )}

                <div className="loyalty-wallet-badge" aria-hidden="true">
                  <Wallet size={14} color="#FF2D78" strokeWidth={2.2} />
                  <span>Works with <strong>Apple Wallet</strong> &amp; <strong>Google Wallet</strong></span>
                </div>
              </div>
            </div>

            {/* Right Column: Layered 2-Card Interactive VIP Pass Stage */}
            <div
              className="loyalty-perspective"
              onPointerMove={handleCardPointerMove}
              onPointerLeave={handleCardPointerLeave}
            >
              <div className="loyalty-ambient-glow" aria-hidden="true" />

              {/* Peeking 24k Gold Glam Insider Card behind the main card */}
              <div className="loyalty-insider-peek" aria-hidden="true">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {belowFoldReady && (
                    <img
                      src="/new_bowdesign.svg"
                      alt=""
                      width={18}
                      height={18}
                      loading="lazy"
                      style={{ objectFit: 'contain', filter: 'sepia(1) saturate(2) hue-rotate(8deg) brightness(1.25)' }}
                    />
                  )}
                  <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '10px', fontWeight: 800, letterSpacing: '1.8px', textTransform: 'uppercase', color: '#FFD700' }}>
                    Glam Insider · Gold Referral Card
                  </span>
                </div>
                <span style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '9.5px',
                  fontWeight: 800,
                  color: '#161108',
                  background: 'linear-gradient(135deg, #FFD700, #D4AF37)',
                  padding: '2px 9px',
                  borderRadius: '999px',
                  letterSpacing: '0.5px',
                }}>
                  TIER 2 VIP
                </span>
              </div>

              {/* Front Interactive Glam Member Card */}
              <div
                ref={loyaltyCardRef}
                className={`loyalty-card-physical ${loyaltyInView ? 'go' : ''} ${isRewardReady ? 'is-gold-ready' : ''}`}
              >
                {/* Top shimmer line & diagonal sweep */}
                <div className="loyalty-top-glow-line" aria-hidden="true" />
                <div className="loyalty-shimmer-sweep" aria-hidden="true" />

                {/* Subtle sparkle dots */}
                {belowFoldReady && Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    aria-hidden="true"
                    style={{
                      position: 'absolute',
                      pointerEvents: 'none',
                      left: `${10 + (i % 5) * 20}%`,
                      top: `${16 + Math.floor(i / 5) * 58}%`,
                      width: '2.5px',
                      height: '2.5px',
                      borderRadius: '50%',
                      background: i % 2 === 0 ? 'rgba(255, 45, 120, 0.42)' : 'rgba(255, 255, 255, 0.08)',
                    }}
                  />
                ))}

                {/* Real Hello Kitty watermark in bottom-right corner */}
                {belowFoldReady && (
                  <img
                    src="/hellokitty-new.svg"
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    className="loyalty-hk-watermark"
                  />
                )}

                {/* Card header: double bows + glowing avatar + title + double bows (matching MVP /card) */}
                <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'center', minWidth: '28px' }}>
                    {belowFoldReady && (
                      <>
                        <img src="/new_bowdesign.svg" alt="Bow" width={28} height={28} loading="lazy" style={{ display: 'inline-block', userSelect: 'none', objectFit: 'contain' }} />
                        <img src="/new_bowdesign.svg" alt="" aria-hidden="true" width={18} height={18} loading="lazy" style={{ display: 'inline-block', userSelect: 'none', objectFit: 'contain' }} />
                      </>
                    )}
                  </div>

                  <div style={{ textAlign: 'center', flex: 1 }}>
                    <p style={{ fontFamily: 'Poppins, sans-serif', color: '#FF2D78', fontSize: '10px', fontWeight: 800, letterSpacing: '2.2px', textTransform: 'uppercase', marginBottom: '3px' }}>
                      Glitz &amp; Glamour Studio
                    </p>
                    <p style={{ fontFamily: 'Poppins, sans-serif', color: '#ffffff', fontSize: '18px', fontWeight: 800, letterSpacing: '-0.01em', margin: 0 }}>
                      {session ? `${session.user?.name?.split(' ')[0] ? t('home.welcomeBack', { name: session.user?.name?.split(' ')[0] || '' }) : t('home.loyaltyLabel')}` : t('home.loyaltyLabel')}
                    </p>
                    <span
                      aria-hidden="true"
                      style={{
                        display: 'inline-block',
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '9.5px',
                        fontWeight: 800,
                        color: isInsider ? '#FFD700' : '#ff85bc',
                        letterSpacing: '1.6px',
                        textTransform: 'uppercase',
                        marginTop: '2px',
                      }}
                    >
                      {session?.user
                        ? (isInsider ? 'Glam Insider · Active VIP Pass' : 'Glam Member · Active VIP Pass')
                        : 'Glam Member · Interactive Preview'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'center', minWidth: '28px' }}>
                    {belowFoldReady && (
                      <>
                        <img src="/new_bowdesign.svg" alt="Bow" width={28} height={28} loading="lazy" style={{ display: 'inline-block', userSelect: 'none', objectFit: 'contain' }} />
                        <img src="/new_bowdesign.svg" alt="" aria-hidden="true" width={18} height={18} loading="lazy" style={{ display: 'inline-block', userSelect: 'none', objectFit: 'contain' }} />
                      </>
                    )}
                  </div>
                </div>

                {/* Subtle pink divider */}
                <div aria-hidden="true" style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,45,120,0.28), transparent)', marginBottom: '12px' }} />

                {/* Big Stamp Counter Row (matching loyaltydesktop.png + Interactive Tap Hint) */}
                <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 6px', marginBottom: '6px' }}>
                  <div style={{ textAlign: 'left' }}>
                    <p style={{ fontFamily: 'Poppins, sans-serif', color: '#a896a0', fontSize: '10px', fontWeight: 700, letterSpacing: '1.4px', textTransform: 'uppercase', margin: 0 }}>
                      {loyaltyCount} / {STAMP_TOTAL} {t('home.stampProgress', { count: loyaltyCount, total: STAMP_TOTAL }).replace(`${loyaltyCount} / ${STAMP_TOTAL} `, '')}
                    </p>
                    <span aria-hidden="true" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: '#ff85bc', fontWeight: 600 }}>
                      {session?.user && !userToggledPreview ? 'Your live stamp balance · Tap to preview' : 'Tap any circle below to test stamps'}
                    </span>
                  </div>
                  <div aria-hidden="true" style={{ display: 'flex', alignItems: 'baseline', gap: '3px' }}>
                    <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 900, fontSize: '32px', color: isRewardReady ? '#FFD700' : '#FF2D78', lineHeight: 1 }}>
                      {visualStampCount}
                    </span>
                    <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '16px', color: '#9e8f97' }}>
                      / {STAMP_TOTAL}
                    </span>
                  </div>
                </div>

                {/* 10 Interactive Stamp Circles (5x2 grid with real /hellokitty-new.svg stamps) */}
                <div className="loyalty-stamps-grid">
                  {Array.from({ length: STAMP_TOTAL }).map((_, i) => {
                    const filled = i < visualStampCount;
                    const isLast = i === STAMP_TOTAL - 1;
                    return (
                      <button
                        key={i}
                        type="button"
                        aria-label={`Preview ${i + 1} stamps`}
                        onClick={() => {
                          setUserToggledPreview(true);
                          setPreviewStamps(i + 1 === visualStampCount && i >= 1 ? i : i + 1);
                        }}
                        className={`stamp-slot ${filled ? 'is-earned' : ''} ${isLast ? 'is-reward' : ''}`}
                      >
                        <div
                          className={`stamp-circle ${filled ? `is-filled ${isLast ? 'is-last-earned' : ''}` : isLast ? 'is-last-slot' : 'is-dashed'}`}
                          style={{ ['--i' as string]: i }}
                        >
                          {filled ? (
                            belowFoldReady ? (
                              <img
                                src="/hellokitty-new.svg"
                                alt=""
                                aria-hidden="true"
                                loading="lazy"
                                width={32}
                                height={32}
                                style={{ display: 'block', objectFit: 'contain', filter: 'drop-shadow(0 1px 4px rgba(0,0,0,0.35))' }}
                              />
                            ) : (
                              <span style={{ fontSize: '14px', color: '#fff', fontWeight: 800 }}>&bull;</span>
                            )
                          ) : (
                            <span style={{ fontSize: isLast ? '14px' : '13px', opacity: isLast ? 0.9 : 0.45, fontWeight: 800 }}>&bull;</span>
                          )}
                        </div>
                        <span className="stamp-num-label" aria-hidden="true" style={{ display: 'inline-flex', alignItems: 'center' }}>
                          {isLast ? <Gift size={11} color="#FFD700" strokeWidth={2.5} /> : i + 1}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Progress bar that fills dynamically as stamps are clicked */}
                <div style={{ position: 'relative', zIndex: 2, height: '7px', background: 'rgba(255, 255, 255, 0.07)', borderRadius: '999px', overflow: 'hidden', marginBottom: '10px' }}>
                  <div style={{
                    height: '100%',
                    width: loyaltyInView ? `${Math.min((visualStampCount / STAMP_TOTAL) * 100, 100)}%` : '0%',
                    background: isRewardReady
                      ? 'linear-gradient(90deg, #FFD700, #FFA500)'
                      : 'linear-gradient(90deg, #FF2D78, #FF6BA8)',
                    borderRadius: '999px',
                    transition: 'width 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    boxShadow: isRewardReady ? '0 0 10px rgba(255,215,0,0.65)' : '0 0 8px rgba(255,45,120,0.55)',
                  }} />
                </div>

                <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                  <p style={{ fontFamily: 'Poppins, sans-serif', color: isRewardReady ? '#FFD700' : '#d6c5cf', fontSize: '12px', fontWeight: 600, margin: 0, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <Sparkles size={13} color={isRewardReady ? '#FFD700' : '#FF2D78'} strokeWidth={2.2} aria-hidden="true" />
                    <span>
                      {isRewardReady
                        ? t('home.spinReady')
                        : session
                          ? t('home.visitsUntilSpin', { count: STAMP_TOTAL - loyaltyCount, plural: STAMP_TOTAL - loyaltyCount === 1 ? '' : 's' })
                          : t('home.earnStamp')}
                    </span>
                  </p>

                  {!session && (
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      background: 'rgba(255, 45, 120, 0.12)',
                      border: '1px solid rgba(255, 45, 120, 0.35)',
                      borderRadius: '999px',
                      padding: '3px 10px',
                    }}>
                      <Lock size={11} color="#FF2D78" strokeWidth={2.2} />
                      <span style={{ fontFamily: 'Poppins, sans-serif', color: '#ff85bc', fontWeight: 600, fontSize: '11px' }}>
                        {t('home.signUpToCollect')}
                      </span>
                    </span>
                  )}
                </div>

                {/* Birthday Reward Progress Strip (matching loyaltydesktop.png + Live DOB Countdown) */}
                <div
                  aria-hidden="true"
                  style={{
                    position: 'relative',
                    zIndex: 2,
                    borderTop: '1px solid rgba(255, 45, 120, 0.14)',
                    marginTop: '12px',
                    paddingTop: '10px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                    <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '10px', color: '#ff85bc', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                      <Cake size={12} color="#ff85bc" strokeWidth={2.2} />
                      Birthday Reward · Free Spin on Us
                    </span>
                    <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '10px', color: '#FFD700', fontWeight: 700 }}>
                      {userDob
                        ? (daysUntilBirthday(userDob) === 0 ? 'Today!' : `${daysUntilBirthday(userDob)}d`)
                        : 'Annual Perk'}
                    </span>
                  </div>
                  <div style={{ height: '4px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${userDob ? birthdayProgress(userDob) : 65}%`,
                      background: 'linear-gradient(90deg, #FF2D78, #FFD700)',
                      borderRadius: '999px',
                    }} />
                  </div>
                </div>

                {/* VIP Member Card Footer Bar */}
                <div className="loyalty-footer-bar" aria-hidden="true">
                  <div>
                    <p style={{ fontFamily: 'Poppins, sans-serif', color: '#a896a0', fontSize: '9.5px', fontWeight: 700, letterSpacing: '2px', margin: 0 }}>
                      GLITZ &amp; GLAMOUR · VIP PASS
                    </p>
                    <p style={{ fontFamily: '"Courier New", monospace', color: '#7a6872', fontSize: '11px', letterSpacing: '3px', margin: '2px 0 0' }}>
                      •••• •••• •••• {session?.user?.email ? session.user.email.slice(-4).toUpperCase() : 'GLAM'}
                    </p>
                  </div>
                  {belowFoldReady && (
                    <img src="/new_bowdesign.svg" alt="" width={22} height={22} loading="lazy" style={{ objectFit: 'contain', opacity: 0.85 }} />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Minimal Hairline Divider */}
      <div className="editorial-section-divider" aria-hidden="true">
        <span className="editorial-divider-line" />
        <span className="editorial-divider-dot" />
        <span className="editorial-divider-line is-right" />
      </div>

      {/* ============ 10. SAN DIEGO & NORTH COUNTY BRIDAL / REGIONAL AUTHORITY ============ */}
      <section className="section-shell bridal-authority-shell">
        <div className="bridal-showcase-panel">
          <div className="bridal-bg-ambient" aria-hidden="true" />

          <div className="section-wrap" style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
            <span className="eyebrow-pill">
              <Award size={14} color="#ff2d87" />
              San Diego &amp; North County Beauty Authority
            </span>
            <h2 className="section-h2">
              Premier Hair and Makeup Artist in San Diego &amp; San Marcos, CA
            </h2>
            <p style={{
              fontFamily: 'Poppins, sans-serif',
              color: '#dcd0d6',
              fontSize: 'clamp(15.5px, 1.8vw, 19px)',
              lineHeight: 1.65,
              maxWidth: '44em',
              margin: '0 auto',
            }}>
              From our flagship bridal sanctuary at <strong>935 W San Marcos Blvd</strong> to on-location weddings and special events across San Diego County, our master stylists deliver red-carpet glam, waterproof airbrush makeup, and bespoke bridal hair designed to last from first looks to the final dance.
            </p>

            {/* 3 Luxury Editorial Bridal Photo Cards */}
            <div className="bridal-tri-grid">
              <article className="bridal-glass-card">
                <div className="bridal-card-media" aria-hidden="true">
                  {belowFoldReady && (
                    <img
                      src="/special-events/ev-bridal-shower.webp"
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="bridal-card-img"
                    />
                  )}
                  <div className="bridal-card-media-fade" />
                  <span className="bridal-card-badge">
                    <Sparkles size={12} color="#ff85bc" />
                    01 · Mobile Glam
                  </span>
                </div>
                <div className="bridal-card-body">
                  <h3>On-Location Mobile Glam Squad</h3>
                  <p>
                    Full mobile team traveling directly to your bridal suite or venue across San Diego, La Jolla, Carlsbad, and Vista with daylight vanity lighting.
                  </p>
                </div>
              </article>

              <article className="bridal-glass-card is-middle">
                <div className="bridal-card-media" aria-hidden="true">
                  {belowFoldReady && (
                    <img
                      src="/special-events/ev-weddings.webp"
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="bridal-card-img"
                    />
                  )}
                  <div className="bridal-card-media-fade" />
                  <span className="bridal-card-badge">
                    <Award size={12} color="#ffffff" />
                    02 · Flagship Studio
                  </span>
                </div>
                <div className="bridal-card-body">
                  <h3>Flagship Studio Preview Trials</h3>
                  <p>
                    Relax in our San Marcos studio for dedicated 3-hour hair &amp; makeup trials, luxury facials, Gel-X nails, and balayage prep.
                  </p>
                </div>
              </article>

              <article className="bridal-glass-card">
                <div className="bridal-card-media" aria-hidden="true">
                  {belowFoldReady && (
                    <img
                      src="/special-events/ev-photo-shoots.webp"
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="bridal-card-img"
                    />
                  )}
                  <div className="bridal-card-media-fade" />
                  <span className="bridal-card-badge">
                    <Star size={12} color="#FFD700" fill="#FFD700" />
                    03 · Bespoke Quotes
                  </span>
                </div>
                <div className="bridal-card-body">
                  <h3>Transparent Custom Quotes</h3>
                  <p>
                    Clear, itemized proposals based on your party size and timeline constraints—no rigid tiers or unexpected fees.
                  </p>
                </div>
              </article>
            </div>

            {/* Service Area Luxury Pills (single clean MapPin icon, no duplicate ::before) */}
            <div className="bridal-areas-box">
              <p style={{
                fontFamily: 'Poppins, sans-serif',
                color: '#ff85bc',
                fontSize: '11.5px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                textAlign: 'center',
                margin: '0 0 16px',
              }}>
                Featured Bridal &amp; Event Service Areas
              </p>
              <div className="bridal-area-chips">
                {[
                  { city: 'San Marcos, CA (Flagship Studio)', href: '/service-areas/san-marcos-ca' },
                  { city: 'Vista, CA (Heritage Salon)', href: '/service-areas/vista-ca' },
                  { city: 'Carlsbad, CA (Coastal Resorts)', href: '/service-areas/carlsbad-ca' },
                  { city: 'La Jolla, CA (Oceanfront Glam)', href: '/service-areas/la-jolla-ca' },
                  { city: 'San Diego, CA (County-Wide)', href: '/service-areas/san-diego-ca' },
                ].map(area => (
                  <a
                    key={area.href}
                    href={area.href}
                    className="bridal-area-chip"
                  >
                    <span className="bridal-area-pin" aria-hidden="true">
                      <MapPin size={14} color="#ff2d87" strokeWidth={2.3} />
                    </span>
                    <span>{area.city}</span>
                    <ChevronRight size={14} color="#ff85bc" aria-hidden="true" />
                  </a>
                ))}
              </div>
            </div>

            {/* Centered Action CTAs */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', justifyContent: 'center' }}>
              <a href="/special-events/weddings-bridal" className="pop-btn-primary">
                Explore Weddings &amp; Bridal <ChevronRight size={15} />
              </a>
              <a href="/service-areas" className="pop-btn-outline">
                All Service Areas
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
