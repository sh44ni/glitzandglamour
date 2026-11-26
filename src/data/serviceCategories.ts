import type { DetailedService } from './servicesDetailed';

export type ServiceCategorySlug = 'nails' | 'pedicures' | 'hair' | 'waxing' | 'facials';

export type ServiceCategoryHub = {
  slug: ServiceCategorySlug;
  name: string;
  badge: string;
  seoTitle: string;
  seoDescription: string;
  targetKeywords: string[];
  h1: string;
  heroImage: string;
  priceRangeLabel: string;
  startingAtPrice: number;
  childCategories: DetailedService['category'][];
  overview: string[];
  highlights: string[];
  faqs: { q: string; a: string }[];
  relatedBlogs: { slug: string; title: string }[];
  selectionGuide?: {
    title: string;
    intro: string;
    options: { slug: string; title: string; description: string }[];
    note: string;
  };
};

export const CATEGORY_HUB_BY_SERVICE_CATEGORY: Record<
  DetailedService['category'],
  { slug: ServiceCategorySlug; label: string }
> = {
  nails: { slug: 'nails', label: 'Nail Salon' },
  pedicures: { slug: 'pedicures', label: 'Spa Pedicures' },
  haircolor: { slug: 'hair', label: 'Hair Salon' },
  haircuts: { slug: 'hair', label: 'Hair Salon' },
  waxing: { slug: 'waxing', label: 'Waxing Studio' },
  facials: { slug: 'facials', label: 'Facials & Skin Care' },
};

export const SERVICE_CATEGORIES: ServiceCategoryHub[] = [
  {
    slug: 'nails',
    name: 'Nail Salon',
    badge: 'Nail Artistry & Extensions',
    seoTitle: 'Nail Salon in San Marcos, CA | Gel-X, Acrylics & BIAB',
    seoDescription:
      'Private nail salon in San Marcos, CA offering Gel-X ($60+), acrylic sets ($65+), fills ($35+) & structured gel manicures ($40+). Book online today!',
    targetKeywords: [
      'nail salon san marcos ca',
      'nails san marcos ca',
      'gel x nails san marcos ca',
      'acrylic nails san marcos ca',
      'structured gel manicure san marcos',
      'builder gel nails san marcos ca',
      'biab nails san marcos',
      'private nail studio san marcos',
    ],
    h1: 'Nail Salon in San Marcos, CA — Gel-X, Acrylics & Structured Gel',
    selectionGuide: {
      title: 'Which nail service should I book?',
      intro: 'Start with whether you want to keep your natural length or add extensions. Our San Marcos nail salon welcomes Vista and North County clients for both, with maintenance and removal available as separate services.',
      options: [
        { slug: 'manicure', title: 'Keep your natural nail length', description: 'Explore a structured gel (BIAB) or classic manicure when you want a polished finish on your own nails. Share your current nail condition and the finish you have in mind before choosing your service.' },
        { slug: 'gelx', title: 'Add soft-gel extensions', description: 'Choose Gel-X nail extensions for added length with pre-shaped soft-gel tips. Bring a shape or design reference and tell us whether an existing set needs to be removed.' },
        { slug: 'acrylic-set', title: 'Book a new acrylic full set', description: 'Choose sculpted acrylic nails when you want a new set with a tailored shape and length. If you already wear acrylics, check the fill or rebalance options before booking a full set.' },
      ],
      note: 'A fill refreshes an existing set; a rebalance addresses grown-out structure. Removal of our work and removal of a foreign set are separate menu options. Include those details when booking so the appointment matches the work required.',
    },
    heroImage: '/services/catalog/gelx.webp',
    priceRangeLabel: 'From $30 – $65+',
    startingAtPrice: 30,
    childCategories: ['nails'],
    overview: [
      'Welcome to Glitz & Glamour Studio, a private one-on-one nail salon at 935 W San Marcos Blvd, Suite 101, San Marcos, CA 92078. Unlike rushed walk-in nail bars, every appointment with licensed artist Jojo is unhurried, hygienic, and tailored to your natural nail anatomy—from feather-light Gel-X extensions ($60+) and sculpted acrylic full sets ($65+) to structured rubber-base gel manicures / BIAB ($40+).',
      'Every nail service begins with meticulous dry cuticle prep, proper apex placement to prevent lifting or breakage, and hospital-grade disinfection. Whether you maintain your set with 2-to-3-week fills ($35+), reset grown-out architecture with a structural rebalance ($55+), or transition cleanly with a gentle soak-off ($30+ for studio work, $50+ for foreign sets), your natural nail health always comes first.',
      'Conveniently located on West San Marcos Blvd with free doorstep parking, our private suite welcomes nail clients from San Marcos, CSUSM, Lake San Marcos, Vista, Carlsbad, Escondido, and Oceanside seven days a week by appointment.',
    ],
    highlights: [
      'One-on-one private nail suite with Jojo — never rushed and never passed between technicians',
      'Full menu of Gel-X soft-gel extensions, sculpted EMA acrylics, structured gel (BIAB) manicures, fills, rebalances, and gentle soak-offs',
      'Custom shapes (almond, coffin, stiletto, squoval, square) plus French tips, chrome glazes, ombré, and hand-painted nail art',
      'Transparent starting prices confirmed in person before your service begins',
    ],
    faqs: [
      {
        q: 'Should I book Gel-X, Acrylics, or a Structured Gel (BIAB) Manicure?',
        a: 'Choose our Manicure ($40+) with structured rubber-base / builder gel if you want strength on your natural nail length; Gel-X ($60+) for lightweight, odor-free soft-gel length that soaks off cleanly; or an Acrylic Set ($65+) for maximum structural strength, extra-long shapes, and 2-to-3-week fills ($35+).',
      },
      {
        q: 'Do you accept walk-ins at your San Marcos nail salon?',
        a: 'Walk-ins are not available at this time; every nail appointment is reserved one-on-one in advance through our online booking page so you receive unhurried private care.',
      },
      {
        q: 'What is your cancellation, late-arrival, and nail fix policy?',
        a: 'A non-refundable retainer (applied toward your service total) secures your appointment. Nail services require 24-hour notice to transfer your retainer to a new date. We offer a 10-minute grace period, after which a $10 late fee applies, and arrivals beyond 15 minutes may be canceled. Nail fixes for application issues must be requested within 48 hours.',
      },
      {
        q: 'What payment methods do you accept and where do I park?',
        a: 'We accept Cash, Cash App, and Apple Pay. Free on-site parking is available directly in front of our building at 935 W San Marcos Blvd, Suite 101, San Marcos, CA 92078.',
      },
    ],
    relatedBlogs: [
      {
        slug: 'gel-x-vs-acrylic-nails-which-is-better-vista-ca',
        title: 'Gel-X vs. Acrylic Nails in San Marcos, CA: Full Guide',
      },
      {
        slug: 'builder-gel-biab-vs-gel-x-vs-acrylic-nails-guide',
        title: 'Builder Gel (BIAB) vs. Gel-X vs. Acrylics | San Marcos',
      },
      {
        slug: 'nail-salon-prices-san-marcos-vista-ca-guide',
        title: 'Nail Salon Prices in San Marcos, CA (2026 Menu Guide)',
      },
      {
        slug: 'spring-summer-2026-nail-trends-vista-ca',
        title: '2026 Nail Trends in San Marcos, CA: Gel-X & Chrome',
      },
    ],
  },
  {
    slug: 'pedicures',
    name: 'Spa Pedicures',
    badge: 'Detox & Jelly Foot Care',
    seoTitle: 'Spa Pedicures in San Marcos, CA | Detox & Jelly Soaks',
    seoDescription:
      'Relaxing spa pedicures in San Marcos, CA: Classic Foot Soak Detox ($65+), Jelly Hydrating Detox ($75+) & Acrylic Toes ($45+). Book your visit online!',
    targetKeywords: [
      'pedicure san marcos ca',
      'spa pedicure san marcos ca',
      'jelly pedicure san marcos ca',
      'foot soak detox san marcos',
      'acrylic toes san marcos ca',
      'private pedicure san marcos',
    ],
    h1: 'Spa Pedicures in San Marcos, CA — Detox & Jelly Foot Soaks',
    selectionGuide: {
      title: 'Compare our pedicure and acrylic toe options',
      intro: 'Choose by the service you want rather than the lowest starting price. A full pedicure and acrylic toe enhancements are different appointments on our San Marcos menu.',
      options: [
        { slug: 'classic-foot-soak-detox', title: 'Classic foot soak and pedicure', description: 'Choose the Classic Foot Soak Detox for a warm soak, nail and cuticle care, exfoliation and a finishing massage. Open the service details to check the included steps and appointment time.' },
        { slug: 'jelly-hydrating-foot-detox', title: 'A cushioned jelly soak', description: 'Choose the Jelly Hydrating Foot Detox when you prefer a jelly-textured soak as part of your pedicure. Compare its included care with the classic option before deciding.' },
        { slug: 'acrylic-toes', title: 'Acrylic toe shape and length', description: 'Choose Acrylic Toes for a sculpted enhancement. This starting price describes the enhancement service, rather than a full soak-and-pedicure appointment.' },
      ],
      note: 'If you want both acrylic toes and a pedicure, tell us when booking so the correct services and time can be arranged. Vista and North County guests visit our studio at 935 W San Marcos Blvd, Suite 101.',
    },
    heroImage: '/services/catalog/jelly-hydrating-foot-detox.webp',
    priceRangeLabel: 'From $45 – $75+',
    startingAtPrice: 45,
    childCategories: ['pedicures'],
    overview: [
      'Unwind in complete privacy with restorative spa pedicures in San Marcos, CA at Glitz & Glamour Studio (935 W San Marcos Blvd, Suite 101). Every pedicure is performed one-on-one by Jojo in a quiet, spotless suite—never in a crowded row of noisy massage chairs—using hospital-grade disinfection and single-use buffers.',
      'Choose our Classic Foot Soak Detox ($65+) for a warm botanical mineral soak, straight-across nail shaping, cuticle refinement, heel callus smoothing, sugar scrub exfoliation, and hydrating massage, or upgrade to our signature Jelly Hydrating Foot Detox ($75+), where warm translucent plant-extract jelly retains heat four times longer to deeply soften cracked heels and tired feet.',
      'Looking for crisp symmetry or toenail reconstruction for sandal season and vacations? Our Acrylic Toes ($45+) sculpt clean, durable square shapes and French finishes that pair seamlessly with any detox soak.',
    ],
    highlights: [
      'Quiet, private one-on-one pedicure suite with hospital-grade sanitation between every guest',
      'Mineral-rich Classic Foot Soak Detox ($65+) and thermal Jelly Hydrating Foot Detox ($75+)',
      'Sculpted Acrylic Toes ($45+) for uniform shape, broken-nail repair, and chip-free beach wear',
      'Easy pairing with Gel-X, acrylic sets, or structured gel manicures in one appointment',
    ],
    faqs: [
      {
        q: 'What is the difference between the Classic Foot Soak Detox and the Jelly Hydrating Foot Detox?',
        a: 'Our Classic Foot Soak Detox ($65+) uses a warm mineral and herbal salt bath with callus care, sugar scrub, and massage. The Jelly Hydrating Foot Detox ($75+) transforms the water into a thick, cushioned thermal gel infused with plant oils and humectants that holds warmth longer for severely dry heels and tired muscles.',
      },
      {
        q: 'Can I pair Acrylic Toes with a detox pedicure?',
        a: 'Yes! Many clients book Acrylic Toes ($45+) alongside a Classic or Jelly Detox soak, or combine a spa pedicure with their Gel-X or structured gel manicure during the same visit.',
      },
      {
        q: 'How are your pedicure baths sanitized?',
        a: 'Every foot basin and stainless tool undergoes hospital-grade disinfection between guests, paired with fresh single-use files and buffers so your foot care is hygienic and worry-free.',
      },
      {
        q: 'Are pedicures by appointment only, and what payment types do you take?',
        a: 'Yes—walk-ins are not available at this time, and all pedicures require 24-hour notice to transfer your retainer. We accept Cash, Cash App, and Apple Pay, with free parking right outside Suite 101.',
      },
    ],
    relatedBlogs: [
      {
        slug: 'nail-salon-prices-san-marcos-vista-ca-guide',
        title: 'Nail Salon Prices in San Marcos, CA (2026 Menu Guide)',
      },
      {
        slug: 'spring-summer-2026-nail-trends-vista-ca',
        title: '2026 Nail Trends in San Marcos, CA: Gel-X & Chrome',
      },
    ],
  },
  {
    slug: 'hair',
    name: 'Hair Salon',
    badge: 'Dimensional Color & Precision Cuts',
    seoTitle: 'Hair Salon in San Marcos, CA | Balayage, Color & Cuts',
    seoDescription:
      'Boutique hair salon in San Marcos, CA for lived-in balayage, highlights, solid color ($120+), gloss ($65+), women’s ($65+) & kids’ haircuts ($35+).',
    targetKeywords: [
      'hair salon san marcos ca',
      'balayage san marcos ca',
      'hair highlights san marcos ca',
      'hair color san marcos ca',
      'womens haircut san marcos ca',
      'hair stylist san marcos ca',
      'kids haircut san marcos ca',
      'vivid hair color san marcos',
    ],
    h1: 'Hair Salon in San Marcos, CA — Balayage, Highlights & Haircuts',
    heroImage: '/services/catalog/balayage.webp',
    priceRangeLabel: 'From $35 – $380+',
    startingAtPrice: 35,
    childCategories: ['haircolor', 'haircuts'],
    overview: [
      'Experience personalized hair color and precision haircutting at Glitz & Glamour Studio, a private boutique hair salon at 935 W San Marcos Blvd, Suite 101 in San Marcos, CA. Licensed stylist Jojo works with one guest at a time—meaning your color formulation, foil placement, and cut receive undivided attention from consultation through your final round-brush blowout.',
      'Our hair color menu covers every dimensional goal: seamless hand-painted Balayage ($380+) with soft root-melt grow-out, bright full or dimensional Highlights ($380+) with bond-building protection, rich Solid One-Tone root-to-end color ($120+), multi-tonal Creative Color melts ($150+), bold double-process Vivids ($380+), and shine-sealing Hair Gloss & Toner refreshes ($65+).',
      'For haircuts, we offer tailored Women’s Haircuts & Blowouts ($65+)—including curtain bangs, butterfly layers, and textured bobs—alongside calm, patient Kids’ Haircuts for girls ($35+) and boys ($35+) aged 12 and under in a quiet, crowd-free room.',
    ],
    highlights: [
      'Bond-building lighteners, custom root shadows, and acidic demi-permanent toners included on dimensional blonding sessions',
      'Private one-chair studio experience in San Marcos—ideal for multi-hour balayage, vivid transformations, and sensory-friendly kids’ cuts',
      'Full hair menu: Balayage ($380+), Highlights ($380+), Vivids ($380+), Creative Color ($150+), Solid One Tone ($120+), Gloss ($65+), Women’s Cut ($65+), and Kids’ Cuts ($35+)',
      'Clear consultation and price confirmation before any bowl of color is mixed',
    ],
    faqs: [
      {
        q: 'Should I book Balayage, Highlights, or Solid One-Tone Color?',
        a: 'Book Balayage ($380+) for hand-painted, low-maintenance dimension that grows out softly for 4–6 months; Highlights ($380+) if you want brightness lifted right from the root; Solid One Tone ($120+) for 100% gray coverage or rich all-over brunette, copper, or black; or a Gloss ($65+) to banish brassiness and restore mirror shine between blonding visits.',
      },
      {
        q: 'How should I prepare my hair before my appointment?',
        a: 'Please arrive with clean, dry hair free of heavy oils or root-concealer sprays so color and lightener absorb evenly (a prep fee may apply if additional detangling or cleansing prep is needed beforehand). Bring 2–3 inspiration photos so we can tailor placement to your hair history.',
      },
      {
        q: 'Do you offer men’s haircuts?',
        a: 'Our haircut menu focuses on Women’s Haircuts & Blowouts ($65+) and Kids’ Haircuts for girls ($35+) and boys ($35+, ages 12 and under). Adult men’s barbering is not on our online menu.',
      },
      {
        q: 'What is your hair appointment retainer and cancellation policy?',
        a: 'A non-refundable retainer applied toward your total secures your time slot. Hair services require at least 48 hours advance notice to transfer your retainer to a future appointment. We allow a 10-minute grace period, after which a $15 late fee applies (appointments may be canceled beyond 20 minutes late). Payment is accepted via Cash, Cash App, and Apple Pay.',
      },
    ],
    relatedBlogs: [
      {
        slug: 'balayage-vs-highlights-which-is-right-for-you',
        title: 'Balayage vs. Highlights: San Marcos Hair Color Guide',
      },
      {
        slug: 'balayage-hair-color-cost-care-guide-san-marcos-vista',
        title: 'Balayage & Hair Color Prices in San Marcos, CA (2026)',
      },
      {
        slug: 'how-to-make-your-blowout-last-all-week-humid-weather',
        title: 'How to Make Your Salon Blowout Last All Week | Glitz',
      },
    ],
  },
  {
    slug: 'waxing',
    name: 'Waxing Studio',
    badge: 'Private Elastic Hard-Wax Care',
    seoTitle: 'Waxing in San Marcos, CA | Brazilian, Bikini & Brows',
    seoDescription:
      'Private waxing studio in San Marcos, CA: female Brazilian & bikini waxing ($60+), underarms ($20+), eyebrows ($12+) & upper lip ($10+). Book online!',
    targetKeywords: [
      'waxing san marcos ca',
      'brazilian wax san marcos ca',
      'bikini wax san marcos ca',
      'eyebrow wax san marcos ca',
      'facial waxing san marcos ca',
      'underarm wax san marcos ca',
      'waxing studio near me',
    ],
    h1: 'Female Brazilian, Bikini & Facial Waxing in San Marcos, CA',
    selectionGuide: {
      title: 'Choose the area you want waxed',
      intro: 'Book the actual treatment area so there is time for the service you need. Our San Marcos waxing studio offers individual facial areas alongside underarm and female Brazilian or bikini options.',
      options: [
        { slug: 'waxing-services', title: 'Female Brazilian or bikini waxing', description: 'Open the body-waxing service to review the available options. Explain which area and finish you want when booking; a broad category starting price is not a quote for every combination.' },
        { slug: 'eyebrow-wax', title: 'Eyebrow waxing and shaping', description: 'Choose the dedicated eyebrow appointment for brow shaping. Let Jojo know your preferred shape and whether you want to maintain your current brow line.' },
        { slug: 'underarm', title: 'Underarm waxing', description: 'Choose the underarm service for this specific area. Upper lip and sideburn waxing have their own menu entries if you want to combine facial areas.' },
      ],
      note: 'Share any skin sensitivities or relevant skincare use with Jojo before your appointment. If you are unsure which service or combination to select, call or text (760) 290-5910 before booking.',
    },
    heroImage: '/services/catalog/waxing-services.webp',
    priceRangeLabel: 'From $10 – $60+',
    startingAtPrice: 10,
    childCategories: ['waxing'],
    overview: [
      'Enjoy discreet, gentle hair removal at Glitz & Glamour Studio, a private one-on-one waxing studio at 935 W San Marcos Blvd, Suite 101 in San Marcos, CA. Every waxing appointment is performed privately by Jojo using skin-friendly elastic hard wax that shrink-wraps hair rather than tugging delicate skin—paired with strict single-use spatulas (zero double-dipping), medical gloves, and soothing botanical post-wax care.',
      'Our waxing menu is clear and easy to combine in a single visit: Waxing Services for women—including Female Brazilian & Bikini Waxing—starts at $60+, Underarm Waxing at $20+, Precision Eyebrow Wax & Shaping at $12+, Sideburns at $15+, and Upper Lip Waxing at $10+.',
      'Open seven days a week from 9:00 AM to 7:00 PM by appointment with free parking right in front of Suite 101, we serve women and facial-waxing guests across San Marcos, Vista, Carlsbad, Escondido, and Oceanside.',
    ],
    highlights: [
      '100% private suite with Jojo — calm, respectful care for first-time Brazilian waxers and monthly regulars alike',
      'Low-temperature elastic hard wax, pre-wax cleansing barrier, soothing post-wax balm, and zero double-dipping',
      'Complete menu: Female Brazilian & Bikini ($60+), Underarm ($20+), Sideburns ($15+), Eyebrow Shaping ($12+), and Upper Lip ($10+)',
      'Open Monday–Sunday 9 AM–7 PM by appointment in San Marcos, CA',
    ],
    faqs: [
      {
        q: 'How long should hair be before my Brazilian, bikini, or underarm wax?',
        a: 'Hair must be at least 1/4 inch long (about the size of a grain of rice, or roughly 2–3 weeks of growth after shaving). Please do not trim beforehand so the hard wax can grip every strand cleanly from the root.',
      },
      {
        q: 'Can I get waxed if I use Retin-A, Accutane, or prescription skincare?',
        a: 'We cannot wax clients using Accutane, Retin-A, or other skin-thinning medications because waxing can lift sensitized skin. Please tell Jojo about all prescription skincare before your visit.',
      },
      {
        q: 'What should I avoid during the first 24 hours after waxing?',
        a: 'For 24 hours after waxing, avoid direct sun exposure, tight clothing, heavy exercise, saunas, and hot baths to keep freshly open follicles calm and bump-free.',
      },
      {
        q: 'How do I book, what payment methods are accepted, and who do I contact with policy questions?',
        a: 'Every waxing visit is by appointment online (walk-ins are not available), and we accept Cash, Cash App, and Apple Pay. For specific waxing rescheduling or policy questions, please reach Jojo directly at (760) 290-5910.',
      },
    ],
    relatedBlogs: [
      {
        slug: 'post-wax-care-guide-smooth-bump-free-skin',
        title: 'Brazilian & Facial Waxing Aftercare Guide | San Marcos',
      },
    ],
  },
  {
    slug: 'facials',
    name: 'Facials & Skin Care',
    badge: 'Corrective & Hydrating Esthetics',
    seoTitle: 'Facials in San Marcos, CA | Deep Pore & Enzyme Care',
    seoDescription:
      'Custom facials in San Marcos, CA: Mini Facial ($30+), Basic ($75+), Deep Cleansing + Extractions ($85+) & Anti-Aging Enzyme ($100+). Book online!',
    targetKeywords: [
      'facials san marcos ca',
      'facial spa san marcos ca',
      'deep cleansing facial san marcos',
      'facial extractions san marcos ca',
      'anti aging facial san marcos ca',
      'custom facial san marcos',
      'esthetician san marcos ca',
    ],
    h1: 'Custom Facials & Skin Care in San Marcos, CA',
    selectionGuide: {
      title: 'Which facial fits the appointment you want?',
      intro: 'Compare our four facial services by their included care and time, then discuss your skin goals with Jojo. Each option is available at the San Marcos studio for local and visiting Vista clients.',
      options: [
        { slug: 'mini-facial', title: 'A shorter facial appointment', description: 'Review the Express Mini Facial when you want a shorter skin-care visit. Check its included steps rather than assuming it contains the same care as a longer service.' },
        { slug: 'basic-facial', title: 'Routine facial care', description: 'Explore the Custom Nourishing Facial for a regular cleansing and hydration appointment. Share what you want from the visit so the care can be discussed before it starts.' },
        { slug: 'deep-cleansing-extraction-facial', title: 'A cleansing and extraction focus', description: 'Review the Deep Cleansing and Extraction Facial if extractions are the part of the service you want to discuss. Jojo can explain the appointment and suitability for your current skin.' },
        { slug: 'anti-aging-and-enzyme-facial', title: 'An enzyme-focused facial', description: 'Explore the Anti-Aging and Enzyme Facial for the enzyme-care option on our menu. Read the included treatment steps and share your current skincare routine before booking.' },
      ],
      note: 'The service details show current starting prices and appointment times. If you are uncertain which facial to choose, contact the studio before reserving; do not assume every treatment includes the same products or steps.',
    },
    heroImage: '/services/catalog/deep-cleansing-extraction-facial.webp',
    priceRangeLabel: 'From $30 – $100+',
    startingAtPrice: 30,
    childCategories: ['facials'],
    overview: [
      'Reset, clarify, and hydrate your complexion with personalized facials in San Marcos, CA at Glitz & Glamour Studio (935 W San Marcos Blvd, Suite 101). In a quiet, private treatment room, Jojo tailors every cleanser, enzyme, mask, and serum to your skin barrier—whether you are clearing stubborn congestion, calming dryness, or prepping luminous skin ahead of a wedding or milestone event.',
      'Our four-tier skincare menu fits every schedule and goal: a 30-minute Express Mini Facial ($30+) for instant lunch-break radiance, a 60-minute Custom Basic Facial ($75+) with warm steam and lymphatic massage, a 75-minute Deep Cleansing + Extraction Facial ($85+) with ultrasonic scrubbing and antibacterial high-frequency therapy, and a 75-minute Anti-Aging & Enzyme Facial ($100+) with fruit enzymes, firming peptides, and red-light LED rejuvenation.',
      'Located minutes from CSUSM, Lake San Marcos, Vista, Escondido, and Carlsbad with free front-door parking, our studio makes monthly skin maintenance calm, clean, and transparent.',
    ],
    highlights: [
      'Four targeted treatments from $30+ express glow resets to $85+ pore extractions and $100+ enzyme resurfacing',
      'Customized to oily, acne-prone, dry, mature, combination, and sensitive skin types',
      'Ultrasonic pore cleansing, gentle manual extractions, high-frequency therapy, and red LED options',
      'Private one-on-one room at 935 W San Marcos Blvd, Suite 101 — by appointment 7 days a week',
    ],
    faqs: [
      {
        q: 'Which facial should I book for clogged pores vs. dry or aging skin?',
        a: 'Choose the Deep Cleansing + Extraction Facial ($85+) for blackheads, congestion, and breakout-prone skin; the Basic Facial ($75+) for monthly hydration and lymphatic massage; the Anti-Aging & Enzyme Facial ($100+) for fine lines, dullness, and collagen support; or the 30-minute Mini Facial ($30+) for a quick glow with zero downtime.',
      },
      {
        q: 'How should I prepare my skin before a facial appointment?',
        a: 'Arrive with a clean face if possible, pause retinoids, AHAs, and BHAs, and avoid excessive sun exposure for 3–5 days beforehand. Certain peels and active enzymes cannot be performed on clients taking Accutane—please share any prescription skincare with Jojo prior to treatment.',
      },
      {
        q: 'What aftercare should I follow after my facial?',
        a: 'For 24–48 hours after your facial, avoid direct sun exposure, saunas, and strenuous exercise, keep your skin hydrated with gentle barrier creams, and wear broad-spectrum SPF daily.',
      },
      {
        q: 'Are facials by appointment only and what payments do you accept?',
        a: 'Yes, all facials are booked by appointment (walk-ins are not available), and we accept Cash, Cash App, and Apple Pay. For any facial rescheduling or policy questions, call or text Jojo at (760) 290-5910.',
      },
    ],
    relatedBlogs: [
      {
        slug: 'bridal-quinceanera-hair-makeup-prep-timeline-north-county',
        title: 'Bridal & Quinceañera Beauty Prep Timeline | North County',
      },
    ],
  },
];

export const ALL_SERVICE_CATEGORY_SLUGS: ServiceCategorySlug[] = SERVICE_CATEGORIES.map((c) => c.slug);

export function getServiceCategoryBySlug(slug: string): ServiceCategoryHub | undefined {
  if (!slug) return undefined;
  const clean = slug.toLowerCase().trim();
  return SERVICE_CATEGORIES.find((c) => c.slug === clean);
}
