/**
 * Special Events Detailed Data & SEO Knowledge Base
 * Authoritative static dataset for high-speed SSG, Google Rich Snippets, and Local SEO
 * Locations targeted: San Marcos, CA (Headquarters), Vista (Previous home & ongoing clientele),
 * Carlsbad, Escondido, Oceanside, Encinitas, San Elijo Hills, Lake San Marcos, and all San Diego County.
 */

export type DetailedSpecialEvent = {
  slug: string;
  aliases: string[];
  name: string;
  tag: string;
  badge: string;
  heroImage: string;
  pills: string[];
  seoTitle: string;
  seoDescription: string;
  targetKeywords: string[];
  h1: string;
  shortDesc: string;
  overview: string[];
  servicesOffered: { title: string; desc: string }[];
  whatsIncluded: string[];
  timelineGuide: { step: string; title: string; desc: string }[];
  serviceAreas: {
    primary: string;
    cities: string[];
    venues: string[];
  };
  pricingNote: string;
  faqs: { q: string; a: string }[];
  relatedSlugs: string[];
};

export const SPECIAL_EVENTS_DETAILED: DetailedSpecialEvent[] = [
  {
    slug: 'weddings-bridal',
    aliases: ['wedding-hair-and-makeup', 'bridal-glam', 'bridal-makeup'],
    name: 'Weddings & Bridal Hair & Makeup',
    tag: 'Most Popular',
    badge: '#FF2D78',
    heroImage: '/special-events/ev-weddings.png',
    pills: ['Bridal Hair', 'HD Makeup', 'Lash Application', 'Bridal Trial', 'On-Location Available'],
    seoTitle: 'Bridal Hair & Makeup San Diego | Wedding Artist | Glitz & Glam',
    seoDescription: 'Top-rated wedding hair makeup artist in San Diego. Luxury bridal hair, airbrush makeup & bridal party styling in San Marcos, Vista, Carlsbad & La Jolla.',
    targetKeywords: [
      'wedding hair makeup artist',
      'bridal hair and makeup san diego',
      'wedding hair and makeup san diego',
      'bridal makeup and hair stylist',
      'professional wedding makeup artist',
      'wedding day makeup artist',
      'bridal hair makeup artist',
      'hmua wedding',
      'stylist wedding',
      'stylist for weddings',
      'stylist for wedding',
      'makeup artist for bridesmaids',
      'wedding makeup artist san diego',
      'hair and makeup wedding san diego',
      'bridal hair makeup san diego',
      'bridal hair and makeup san diego ca',
      'wedding hairstyles in san diego',
      'wedding hair and makeup prices',
      'wedding party hair prices',
      'bridal party hair prices',
      'bridal hair prices',
      'wedding hair makeup prices',
      'wedding makeup and hair prices',
      'wedding trial hair prices',
      'bridal hair and makeup san marcos ca',
      'wedding makeup artist san marcos',
      'twin oaks house and gardens wedding hair and makeup',
      'lake san marcos wedding makeup',
    ],
    h1: 'Bridal Hair and Makeup San Diego & North County Luxury Wedding Artists',
    shortDesc: 'Full wedding day glam tailored for the bride, bridesmaids, and wedding party. In-studio trials at our San Marcos salon or luxury on-location styling across Southern California.',
    overview: [
      'Your wedding day is one of the most photographed moments of your life. At Glitz & Glamour Studio, our team of professional wedding makeup artists and bridal hair stylists creates timeless, radiant bridal beauty that reflects your personal aesthetic. Whether you envision effortless romantic soft glam, modern boho textures, or a show-stopping full beat with sculpted Hollywood waves, we specialize in high-definition, camera-ready bridal makeup and long-lasting hair architecture designed to stay flawless from your morning first look through the final dance.',
      'Our flagship studio is located at 935 W San Marcos Blvd (Suite 101, San Marcos, CA 92078). Honoring our proud heritage and ongoing clientele from Vista, we serve brides across all of North County San Diego and beyond—including Carlsbad, Oceanside, Escondido, Encinitas, Del Mar, and La Jolla. For brides wanting the ultimate luxury and convenience on their wedding morning, our mobile beauty team travels on-location to your private estate, bridal suite, or resort venue throughout Southern California and Temecula wine country.',
      'We work frequently with brides celebrating at iconic Southern California wedding venues, including Twin Oaks House & Gardens, The Lakehouse Resort at Lake San Marcos, Green Gables Estate, The Vistonian in Vista, Leo Carrillo Ranch and Cape Rey in Carlsbad, Bandy Canyon Ranch in Escondido, and luxury beachfront settings like Darlington House and Scripps Seaside Forum in La Jolla. We understand venue lighting, outdoor ceremony elements, and coastal temperature variations, ensuring your bridal hair and makeup withstand humidity, happy tears, and high-definition photography.',
      'Every bridal experience begins with comprehensive consultation and optional in-studio preview trials where we experiment with hair accessories, veil placement, custom lash weights, and lip shades. On your wedding day, our lead stylists manage morning timelines meticulously so you and your bridal party relax, sip champagne, and savor every second.',
    ],
    servicesOffered: [
      {
        title: 'Bridal Preview & Trial Session',
        desc: 'A dedicated 2-hour preview session in our San Marcos studio to experiment with hair styles, airbrush-finish makeup, lash weights, and veil placement before your big day.',
      },
      {
        title: 'Day-Of Bridal Hair & Makeup',
        desc: 'Full-service luxury glam on your wedding day with high-end luxury cosmetics, waterproof eye makeup, customized faux mink lashes, and all-day setting techniques.',
      },
      {
        title: 'Dedicated Makeup Artist for Bridesmaids & Wedding Party',
        desc: 'Coordinated hair and makeup styling for bridesmaids, maid of honor, mothers, and grandmothers to create a cohesive, camera-ready wedding party aesthetic.',
      },
      {
        title: 'On-Location Touch-Up & Reception Veil Removal',
        desc: 'Artist accompaniment for post-ceremony photography touch-ups, veil removal, and an evening hair or lip refresh before your grand entrance.',
      },
      {
        title: 'Groom & Groomsmen Grooming',
        desc: 'Discreet camera-ready shine control, light skin prep, beard grooming, and hair styling for the groom to look crisp in professional wedding photography.',
      },
    ],
    whatsIncluded: [
      'Comprehensive aesthetic consultation and digital mood board styling',
      'Skin prep with luxury hydrating serums, under-eye masks, and lip conditioning',
      'Long-wear HD waterproof foundation tailored to your skin type and tone',
      'Custom luxury false lashes (strip or individual flare clusters)',
      'High-hold hair styling with thermal protection and humidity-resistant locking sprays',
      'Veil and bridal hair accessory placement with reinforced pinning',
      'Bridal touch-up kit including matching lip color sample, blotting sheets, and pins',
    ],
    timelineGuide: [
      { step: 'Step 1', title: 'Inquiry & Availability Check', desc: 'Submit your wedding date, venue location, and party size through our online questionnaire. We confirm availability within 24 to 48 hours.' },
      { step: 'Step 2', title: 'Consultation & Bridal Trial', desc: 'Book your trial 6 to 12 weeks before your wedding date at our San Marcos studio to finalize your exact signature look.' },
      { step: 'Step 3', title: 'Custom Proposal & Agreement', desc: 'Lock in your date with a transparent, itemized proposal and retainer. We coordinate an exact morning-of timeline for every member of your party.' },
      { step: 'Step 4', title: 'Wedding Day Magic', desc: 'Our mobile team arrives early at your venue or home with full professional lighting and kits. Relax and enjoy getting pampered!' },
    ],
    serviceAreas: {
      primary: 'San Marcos, CA (935 W San Marcos Blvd, Suite 101)',
      cities: ['San Marcos', 'Vista', 'Carlsbad', 'Escondido', 'Oceanside', 'Encinitas', 'La Jolla', 'San Elijo Hills', 'Rancho Santa Fe', 'Del Mar', 'Fallbrook', 'Temecula'],
      venues: ['Twin Oaks House & Gardens', 'The Lakehouse Resort', 'Green Gables Estate', 'The Vistonian', 'Leo Carrillo Ranch', 'Cape Rey Carlsbad', 'Darlington House La Jolla', 'Scripps Seaside Forum', 'Bandy Canyon Ranch', 'Shadowridge Golf Club'],
    },
    pricingNote: 'We provide transparent, all-inclusive custom quotes tailored to your bridal party size, styling preferences, and venue logistics. Every wedding is unique, so our itemized proposals guarantee you only invest in the exact services you need with zero surprise fees.',
    faqs: [
      {
        q: 'How much does wedding hair and makeup cost in San Diego?',
        a: 'In San Diego and Southern California, professional wedding hair and makeup prices vary depending on bridal party size, on-location travel distance, and whether trial runs are included. Because every wedding timeline and party scale is distinct, Glitz & Glamour Studio provides transparent, itemized custom quotes within 24 to 48 hours with zero surprise add-ons.',
      },
      {
        q: 'Do you charge per person for wedding party hair prices and bridesmaid makeup?',
        a: 'Yes. Bridal party hair and makeup prices are quoted on an itemized per-person basis. This allows brides to select hair-only, makeup-only, or full-glam packages for each bridesmaid, mother of the bride/groom, and attendee according to individual preferences.',
      },
      {
        q: 'Is a bridal trial included in the wedding hair and makeup price?',
        a: 'In-studio bridal preview trials can be bundled directly into your custom wedding package or booked independently at our San Marcos salon (935 W San Marcos Blvd). We strongly recommend scheduling your trial 2 to 3 months before your wedding date to experiment with veil placement and styles.',
      },
      {
        q: 'Do you travel on-location for wedding day hair and makeup across San Diego?',
        a: 'Yes! Our mobile bridal team travels on-location to bridal suites, private estates, and wedding venues throughout San Marcos, Vista, Carlsbad, Escondido, Oceanside, Encinitas, La Jolla, and greater San Diego County. Travel fees are calculated transparently based on venue mileage.',
      },
      {
        q: 'How far in advance should I book my wedding hair makeup artist?',
        a: 'We recommend reserving your date 6 to 12 months in advance, especially for peak Southern California wedding dates (spring through autumn). Weekends book quickly.',
      },
      {
        q: 'Can you accommodate large bridal parties of 8 or more people?',
        a: 'Yes, absolutely. For large bridal parties, we coordinate multiple professional artists and stylists to ensure everyone receives unhurried, luxury service and finishes ahead of photo schedules.',
      },
    ],
    relatedSlugs: ['bridal-showers-bachelorettes', 'on-location-hair-makeup', 'photo-video-shoots', 'prom-homecoming'],
  },
  {
    slug: 'quinceaneras',
    aliases: ['quinceanera-makeup', 'quinceanera-hair-and-makeup', 'quince-glam'],
    name: 'Quinceañeras Hair & Makeup',
    tag: 'Celebration',
    badge: '#a855f7',
    heroImage: '/special-events/ev-quinceaneras.png',
    pills: ['Tiara Styling', 'Full Glam', 'Updo & Curls', 'Damas Packages', 'Waterproof Setting'],
    seoTitle: 'Quinceañera Hair & Makeup San Marcos | Glitz & Glamour',
    seoDescription: 'Stunning quinceañera hair and makeup in San Marcos & North County San Diego. Tiara styling, waterproof camera-ready glam, and damas packages. Book your inquiry.',
    targetKeywords: [
      'quinceanera makeup artist san marcos ca',
      'quinceanera hair and makeup vista ca',
      'peinados y maquillaje para quinceanera san diego',
      'quinceanera makeup north county san diego',
      'tiara hair styling quinceanera san marcos',
      'escondido quinceanera hair and makeup',
      'quinceanera court of honor damas hair',
      'san marcos quinceanera beauty salon',
    ],
    h1: 'Quinceañera Hair & Makeup in San Marcos, CA & North County',
    shortDesc: 'Celebrate her 15th milestone with royalty-worthy curls, tiara styling, and flawless camera-ready makeup designed to last all day and through every waltz.',
    overview: [
      'A Quinceañera is a once-in-a-lifetime milestone celebration marking the transition into young adulthood. At Glitz & Glamour Studio, we treat every quinceañera like royalty. From dramatic cascading Hollywood curls that hold their bounce through the valse and surprise dance, to high-definition makeup that highlights natural beauty while looking extraordinary under church and ballroom lighting, our artistry is second to none.',
      'Now based in our modern studio at 935 W San Marcos Blvd in San Marcos, CA, we are centrally located to serve quinceañeras from Vista, Escondido, San Marcos, Oceanside, Fallbrook, and throughout North County San Diego. Whether you prefer to bring your court to our salon for a fun, private getting-ready party or have our team travel to your home or banquet hall, we ensure the morning is celebratory and seamless.',
      'We specialize in secure crown and tiara placement—anchoring heavy metal headpieces and veils with specialized cross-pinning techniques so you can dance, spin, and embrace family without worry. Our makeup application uses smudge-proof, sweat-resistant setting sprays and foundations that photograph flawlessly in both church portraits and energetic party video clips.',
      'We also offer coordinated styling for your Court of Honor (Damas), Chambelanes grooming, and glam for the mother of the quinceañera. Hablamos español y entendemos la importancia cultural y familiar de este gran día.',
    ],
    servicesOffered: [
      {
        title: 'The Quinceañera Royal Package',
        desc: 'Full HD glam makeup, false lashes, crown and tiara placement, high-volume curls or textured updo, and an emergency touch-up kit.',
      },
      {
        title: 'Quinceañera Trial Run',
        desc: 'In-studio preview in San Marcos where we test your hairstyle with your actual tiara and create your preferred makeup look with your dress color palette.',
      },
      {
        title: 'Court of Honor (Damas) Packages',
        desc: 'Coordinated hair and soft glam makeup for your damas so your entire court looks visually harmonious and photogenic.',
      },
      {
        title: 'Mom of the Quinceañera Styling',
        desc: 'Elegant, ageless hair styling and radiant makeup for the proud mother of the birthday girl.',
      },
    ],
    whatsIncluded: [
      'Personalized consultation matching glam to dress style and color theme',
      'Skin priming with pore-refining and oil-controlling serums for dancing longevity',
      'Full coverage or soft glam HD foundation that resists flash flashback',
      'Crown, tiara, and hair jewelry placement with reinforced zero-slip pinning',
      'Curling and styling using high-grade ceramic irons and heat protectors',
      'Faux mink lashes tailored to your eye shape',
      'Setting sprays tested to withstand 12+ hours of wear',
    ],
    timelineGuide: [
      { step: 'Step 1', title: 'Check Your Date', desc: 'Quinceañeras frequently fall on Saturdays. Submit our inquiry form 2 to 4 months in advance to reserve our team.' },
      { step: 'Step 2', title: 'Bring Your Tiara to Trial', desc: 'Schedule your trial at our San Marcos salon. Bring your crown, photos of your dress, and makeup inspiration.' },
      { step: 'Step 3', title: 'Coordinate the Damas', desc: 'We help you schedule time slots for yourself, your mom, and all damas so everyone is ready before church photo calls.' },
      { step: 'Step 4', title: 'Celebration Day', desc: 'Get ready at our studio or on-location. Step into your dress feeling confident, radiant, and ready to shine.' },
    ],
    serviceAreas: {
      primary: 'San Marcos, CA (935 W San Marcos Blvd, Suite 101)',
      cities: ['San Marcos', 'Vista', 'Escondido', 'Carlsbad', 'Oceanside', 'Valley Center', 'Fallbrook', 'Poway', 'San Diego'],
      venues: ['California Center for the Arts Escondido', 'Lakehouse Resort', 'Williams’ Barn', 'Bheau View Ranch', 'Local North County Banquet Halls'],
    },
    pricingNote: 'Custom quinceañera packages are designed according to party size. Damas group discounts apply when booking 4 or more attendants.',
    faqs: [
      {
        q: 'Will my tiara stay secure during dances and hugs?',
        a: 'Yes! We use specialized anchor braiding and interlocking bobby-pin techniques built into your hair structure so your tiara remains completely secure throughout the entire celebration.',
      },
      {
        q: 'Do you speak Spanish?',
        a: '¡Sí, hablamos español! We are delighted to communicate in either English or Spanish with the quinceañera, parents, and family members to ensure everyone feels comfortable and understood.',
      },
      {
        q: 'Can our damas get their hair and makeup done too?',
        a: 'Yes, we frequently style entire Courts of Honor. We establish a clear timeline so all damas are styled efficiently and look cohesive in group portraits.',
      },
      {
        q: 'How long does hair and makeup take for the quinceañera?',
        a: 'We allocate 1.5 to 2 hours for the quinceañera to ensure perfection on every hair curl, lash placement, and skin finish, with extra time for crown placement and dress reveal.',
      },
    ],
    relatedSlugs: ['sweet-16-birthdays', 'weddings-bridal', 'on-location-hair-makeup', 'prom-homecoming'],
  },
  {
    slug: 'prom-homecoming',
    aliases: ['prom-makeup', 'prom-hair-and-makeup', 'homecoming-glam', 'formal-dance'],
    name: 'Prom & Homecoming Hair & Makeup',
    tag: 'Red Carpet',
    badge: '#ec4899',
    heroImage: '/special-events/ev-prom.png',
    pills: ['TikTok / IG Trends', 'Hollywood Waves', 'Updos & Braids', 'Group Rates', 'All-Night Hold'],
    seoTitle: 'Prom Hair & Makeup San Marcos CA | Glitz & Glamour',
    seoDescription: 'Flawless prom and homecoming hair & makeup in San Marcos, CA. Trending Instagram & TikTok glam, Hollywood curls, and group rates for North County students.',
    targetKeywords: [
      'prom makeup artist san marcos ca',
      'prom hair styling san marcos',
      'homecoming hair and makeup north county san diego',
      'high school prom hair vista ca',
      'formal dance makeup artist san marcos',
      'mission hills high school prom makeup',
      'san marcos high school prom hair',
      'prom glam carlsbad escondido',
    ],
    h1: 'Prom & Homecoming Hair & Makeup in San Marcos, CA',
    shortDesc: 'Step onto the red carpet looking effortlessly stunning. Trend-forward glam, sleek updos, and voluminous curls designed for high school formals across North County.',
    overview: [
      'Prom and Homecoming are the premier social events of the school year. When you step out of the car and into photos with your date and best friends, you want to feel like a celebrity. At Glitz & Glamour Studio in San Marcos, CA, we specialize in high-impact, trend-conscious hair and makeup that translates the latest TikTok, red-carpet, and Pinterest aesthetic into a personalized look that flatters your features.',
      'Our newly upgraded salon at 935 W San Marcos Blvd is just minutes from Mission Hills High School, San Marcos High School, Vista High, Rancho Buena Vista, Carlsbad High, and Escondido High. We create an energetic, fun environment where you and your friends can get glam together before heading out for dinner and photos at Lake San Marcos or local parks.',
      'Whether you are craving glazed-donut dewy skin with a feline winged liner, a sultry smoky eye with fluffy lashes, or a sleek half-up textured ponytail with face-framing tendrils, our artists have the technical precision to execute it cleanly. All products are selected for long wear, sweat resistance, and zero flashback in flash photography.',
      'Appointments for prom and homecoming dates fill up quickly each spring and fall. We offer individual bookings as well as group sessions so friend groups can book back-to-back or simultaneous appointments.',
    ],
    servicesOffered: [
      {
        title: 'Full Prom Glam Makeup',
        desc: 'Airbrush-effect complexion, sculpted brows, custom eyeshadow blending, highlighter, contouring, and complimentary fluttery false lashes.',
      },
      {
        title: 'Formal Hair Styling & Updos',
        desc: 'Hollywood waves, textured boho braids, sleek snatched buns, romantic half-up styles, and bouncy curl sets with thermal hold.',
      },
      {
        title: 'Besties & Group Glam Sessions',
        desc: 'Coordinated back-to-back appointments for you and your friends with group photo opportunities in our aesthetic studio.',
      },
      {
        title: 'Express Touch & Glow',
        desc: 'Skin radiance prep, light contour, lip gloss bar, and curl refresh for students seeking a minimalist, clean-girl aesthetic.',
      },
    ],
    whatsIncluded: [
      'In-depth review of your dress neckline, color, and jewelry inspiration',
      'Light skincare hydration prep for a smooth, cake-free base',
      'Custom lash application tailored to your eye shape (natural to dramatic)',
      'Heat protection and pro-grade thermal iron styling for all-night curl memory',
      'Setting spray formulation designed to prevent shine on dance floors',
    ],
    timelineGuide: [
      { step: 'Step 1', title: 'Book Early', desc: 'Prom dates across North County schools often coincide. Secure your morning or afternoon time slot 4 to 8 weeks ahead.' },
      { step: 'Step 2', title: 'Save Your Inspo', desc: 'Save 2 to 3 photos of hair and makeup looks you love on people with similar hair length and skin tone.' },
      { step: 'Step 3', title: 'Appointment Day', desc: 'Arrive at our San Marcos studio with dry hair and a clean face. Wear a zip-up or loose top to protect your hair when changing.' },
    ],
    serviceAreas: {
      primary: 'San Marcos, CA (935 W San Marcos Blvd, Suite 101)',
      cities: ['San Marcos', 'Vista', 'Carlsbad', 'Escondido', 'Oceanside', 'Encinitas', 'San Elijo Hills'],
      venues: ['Mission Hills High School', 'San Marcos High School', 'Vista High', 'Rancho Buena Vista High', 'Carlsbad High', 'Escondido High'],
    },
    pricingNote: 'Transparent per-person student pricing. Group booking rates available for parties of 3 or more students.',
    faqs: [
      {
        q: 'Will my makeup look cakey or too heavy in daylight photos?',
        a: 'Never! We use finely milled, lightweight pigments and hydrating primers that look luminous and natural in direct outdoor sunlight, while still providing high-definition coverage for evening dance lighting.',
      },
      {
        q: 'Can my best friend and I get our glam done together?',
        a: 'Yes! We encourage group bookings. Let us know how many are in your party when inquiring, and we will schedule your time slots so you can get ready together.',
      },
      {
        q: 'What if my hair has trouble holding curls?',
        a: 'We use professional heat styling sprays, directional iron wrapping, and pin-curling setting methods to lock curls in place before releasing them, ensuring lasting volume.',
      },
      {
        q: 'Are false eyelashes included in prom makeup?',
        a: 'Yes, premium faux mink strip or cluster lashes are included with every full prom makeup application.',
      },
    ],
    relatedSlugs: ['sweet-16-birthdays', 'quinceaneras', 'on-location-hair-makeup', 'weddings-bridal'],
  },
  {
    slug: 'on-location-hair-makeup',
    aliases: ['mobile-hair-and-makeup', 'on-location-glam', 'traveling-makeup-artist'],
    name: 'On-Location & Mobile Event Glamour',
    tag: 'VIP Service',
    badge: '#3b82f6',
    heroImage: '/special-events/photo_5.jpg',
    pills: ['We Come to You', 'Venues & Hotels', 'San Diego County', 'Multi-Artist Teams', 'Full Kit Setup'],
    seoTitle: 'Mobile Hair & Makeup San Marcos & San Diego | Glitz',
    seoDescription: 'We bring the salon to you. On-location hair & makeup throughout San Marcos, Vista, Carlsbad, and all San Diego County. Stress-free glam for venues & hotels.',
    targetKeywords: [
      'mobile hair and makeup san marcos ca',
      'on location makeup artist north county san diego',
      'traveling wedding hair and makeup san diego',
      'on site event beauty services vista carlsbad',
      'hotel venue mobile hair stylist san diego county',
      'mobile bridal hair and makeup carlsbad ca',
      'on location quinceanera hair and makeup oceanside',
      'mobile glam squad san diego',
    ],
    h1: 'On-Location Mobile Hair & Makeup in San Marcos & San Diego County',
    shortDesc: 'Experience luxury beauty without leaving your bridal suite, hotel, or home. Our mobile glam team travels with professional lighting and chairs throughout Southern California.',
    overview: [
      'There is nothing more relaxing on a busy event morning than having the beauty salon come to you. At Glitz & Glamour Studio, our On-Location Mobile Event Team provides white-glove beauty service directly at your wedding venue, resort suite, private residence, or Airbnb anywhere in San Marcos, North County, and greater San Diego County.',
      'Eliminate the stress of driving in traffic, coordinating carpools, or hunting for parking on your special day. Our team arrives fully prepared with professional dimmable ring lights, director styling chairs, sanitation supplies, and an extensive kit of luxury cosmetics and professional hair tools.',
      'Headquartered at 935 W San Marcos Blvd in San Marcos, CA (having expanded from our original location in Vista), we frequently travel to premier destinations across Southern California. Whether you are staying at The Lakehouse Resort on Lake San Marcos, getting ready in a Carlsbad oceanfront villa, or staying at an estate in Rancho Santa Fe, Fallbrook, or Temecula, we bring the luxury salon experience straight to your doorstep.',
      'We accommodate solo VIP clients as well as large parties of 10+ requiring synchronized timelines. Every on-location booking includes custom timing schedules so your entire party is ready with time to spare for first-look photography.',
    ],
    servicesOffered: [
      {
        title: 'Venues & Bridal Suites Mobile Glam',
        desc: 'On-site glam set up directly in your venue dressing room or bridal suite with professional lighting and extension cords.',
      },
      {
        title: 'Hotel & Resort Luxury Services',
        desc: 'In-room pampering at San Diego luxury hotels and resorts, perfect for destination weddings, bachelorettes, and galas.',
      },
      {
        title: 'Private Home & Estate Bookings',
        desc: 'Transform your living room or master suite into a high-end beauty lounge with zero cleanup required on your part.',
      },
      {
        title: 'Full-Day On-Set Touch-Up Concierge',
        desc: 'Have a lead artist remain on-site for mid-day look transformations, veil removal, and touch-ups through photography sessions.',
      },
    ],
    whatsIncluded: [
      'Travel to your specified address, hotel, or venue',
      'Complete portable station setup: professional studio lighting, styling tools, and sanitized kits',
      'Precision hair styling and camera-ready HD makeup application',
      'Comprehensive timeline management to keep your day stress-free and punctual',
      'Full cleanup of our styling area before departure',
    ],
    timelineGuide: [
      { step: 'Step 1', title: 'Location & Party Inquiry', desc: 'Provide your event location address, ready-by time, and headcount. We confirm artist availability and mileage.' },
      { step: 'Step 2', title: 'Schedule Planning', desc: 'We build an optimized schedule allocating 35 to 45 minutes per service, prioritizing the guest of honor.' },
      { step: 'Step 3', title: 'Setup 15 Minutes Early', desc: 'Our mobile team arrives 15 minutes prior to start time to set up stations, lighting, and layout.' },
      { step: 'Step 4', title: 'Flawless Departure', desc: 'Final touch-ups, lip applications, and veil checks completed with plenty of buffer time for your photographer.' },
    ],
    serviceAreas: {
      primary: 'San Marcos, CA & Surrounding Cities (Travel radius across Southern California)',
      cities: ['San Marcos', 'Vista', 'Carlsbad', 'Oceanside', 'Escondido', 'Encinitas', 'Rancho Santa Fe', 'Del Mar', 'Solana Beach', 'Poway', 'Temecula'],
      venues: ['Lakehouse Resort', 'Twin Oaks House & Gardens', 'Omni La Costa Resort', 'Park Hyatt Aviara', 'The Vistonian', 'Rancho Bernardo Inn'],
    },
    pricingNote: 'A nominal travel fee is calculated based on round-trip mileage from our San Marcos studio. Custom quotes include all setup and kit fees.',
    faqs: [
      {
        q: 'What are the space and power requirements for on-location service?',
        a: 'We only need a clean table or counter space, a standard electrical outlet within 10–15 feet, and good access to natural light if possible. We bring our own studio lighting, extension cords, and styling chairs.',
      },
      {
        q: 'How far do you travel for special events?',
        a: 'We travel throughout all of San Diego County, Orange County, Riverside County, and Temecula wine country. Destination weddings outside Southern California are also accommodated upon request.',
      },
      {
        q: 'Is there a minimum number of people required for on-location bookings?',
        a: 'For Saturday peak wedding dates, we typically have a service minimum of 3 to 4 services, or an equivalent package rate. Weekdays and Sundays offer greater flexibility.',
      },
      {
        q: 'Do you charge travel fees per artist or per vehicle?',
        a: 'Travel fees are quoted transparently based on round-trip mileage from our San Marcos studio (935 W San Marcos Blvd) and are clearly itemized in your quote.',
      },
    ],
    relatedSlugs: ['weddings-bridal', 'quinceaneras', 'corporate-gala', 'bridal-showers-bachelorettes'],
  },
  {
    slug: 'bridal-showers-bachelorettes',
    aliases: ['bachelorette-hair-and-makeup', 'bridal-shower-glam', 'girls-night-out'],
    name: 'Bridal Showers & Bachelorettes',
    tag: 'Party',
    badge: '#06b6d4',
    heroImage: '/special-events/ev-bridal-shower.jpg',
    pills: ['Group Glam', 'Champagne Vibe', 'Beach Waves', 'Soft Glam', 'In-Studio or Mobile'],
    seoTitle: 'Bachelorette & Bridal Shower Glam San Marcos | Glitz',
    seoDescription: 'Group glam for bridal showers & bachelorette weekends in San Marcos & San Diego. In-studio pampering or mobile styling for your bride squad. Get a custom quote.',
    targetKeywords: [
      'bachelorette party hair and makeup san diego',
      'bridal shower glam san marcos ca',
      'group hair and makeup north county san diego',
      'bachelorette glam squad lake san marcos',
      'bridal party blowout and makeup vista ca',
      'carlsbad bachelorette hair and makeup',
      'mobile bachelorette glam airbnb san diego',
    ],
    h1: 'Bridal Shower & Bachelorette Hair & Makeup in San Marcos, CA',
    shortDesc: 'Pamper the bride-to-be and her besties with coordinated beauty. Enjoy private in-studio celebrations in San Marcos or mobile glam at your coastal rental or resort.',
    overview: [
      'Before the wedding day arrives, celebrate the journey with unforgettable bridal shower and bachelorette party glam. Whether you are hosting an elegant garden bridal shower at a San Marcos estate, heading out for wine tasting in Temecula, or getting ready for a night out in Gaslamp or Pacific Beach, Glitz & Glamour Studio makes getting ready the best part of the day.',
      'Our newly expanded studio at 935 W San Marcos Blvd in San Marcos, CA provides a chic, Instagrammable atmosphere where your bride squad can sip, laugh, and get pampered. We also offer mobile glam squads who travel directly to your Airbnb or resort anywhere in North County, Lake San Marcos, Carlsbad, or downtown San Diego.',
      'We tailor the vibe to your plans—from effortless beachy waves and bronzy soft glam for daytime celebrations, to sultry eyes, glowing highlighter, and voluminous updos for bachelorette nightlife. We ensure the bride stands out with extra attention while her friends look gorgeously coordinated.',
      'Group packages are designed for maximum fun and efficiency, ensuring everyone gets ready on time without rushing.',
    ],
    servicesOffered: [
      {
        title: 'The "Bride of Honor" Spotlight Glam',
        desc: 'Elevated makeup and styling designed to make the bride the undeniable star of her bridal shower or bachelorette festivities.',
      },
      {
        title: 'Bride Squad Express Hair & Makeup',
        desc: 'Coordinated beach waves, blowouts, and radiant soft glam for bridesmaids and friends, customized to each guest.',
      },
      {
        title: 'Private Studio Salon Takeover',
        desc: 'Reserve our San Marcos salon exclusively for your group with music, mirrors, and beauty stations dedicated solely to your squad.',
      },
      {
        title: 'Airbnb / Vacation Rental Mobile Glam',
        desc: 'Our beauty team arrives at your vacation rental with lighting and styling gear so you can get ready in your robes.',
      },
    ],
    whatsIncluded: [
      'Skin prep and radiance-boosting primer',
      'Soft glam or evening makeup with complimentary lash application',
      'Curling, waving, or textured hair styling with high-humidity hold',
      'Group timeline coordination so everyone finishes together for toasts and photos',
      'Complimentary touch-up lip gloss sample for the bride',
    ],
    timelineGuide: [
      { step: 'Step 1', title: 'Choose Your Setting', desc: 'Decide whether your party prefers our San Marcos salon or having our mobile team come to your Airbnb or hotel.' },
      { step: 'Step 2', title: 'Select Services', desc: 'Tell us how many guests want hair, makeup, or both. We build a personalized party estimate.' },
      { step: 'Step 3', title: 'Party & Glow', desc: 'Turn on the playlist, pour the refreshments, and let our artists elevate your look for the celebration.' },
    ],
    serviceAreas: {
      primary: 'San Marcos, CA (935 W San Marcos Blvd, Suite 101)',
      cities: ['San Marcos', 'Vista', 'Carlsbad', 'Encinitas', 'Oceanside', 'San Diego', 'Pacific Beach', 'Temecula'],
      venues: ['Lakehouse Resort Lake San Marcos', 'Omni La Costa', 'Local Airbnb Vacation Rentals', 'Coastal Beach Estates'],
    },
    pricingNote: 'Group tier pricing based on guest count. Full studio buyouts available for morning or afternoon private events.',
    faqs: [
      {
        q: 'Can we bring drinks and light snacks to the San Marcos studio?',
        a: 'Yes! For private group bookings at our San Marcos salon, you are welcome to bring champagne, mimosas, and finger foods to enjoy while getting ready.',
      },
      {
        q: 'Can we mix and match hair and makeup services among guests?',
        a: 'Absolutely. Some members of your squad may want only hair styling, while others want full makeup or both. We customize the package per person.',
      },
      {
        q: 'How long before our event should we schedule the styling?',
        a: 'We recommend timing the finish approximately 1 hour before you plan to depart for photos or reservations so you have plenty of buffer time.',
      },
    ],
    relatedSlugs: ['weddings-bridal', 'sweet-16-birthdays', 'on-location-hair-makeup', 'photo-video-shoots'],
  },
  {
    slug: 'baby-showers',
    aliases: ['baby-shower-makeup', 'maternity-glam', 'mom-to-be-styling'],
    name: 'Baby Showers & Maternity Glam',
    tag: 'Milestone',
    badge: '#f59e0b',
    heroImage: '/special-events/ev-baby-showers.png',
    pills: ['Mom-To-Be Glow', 'Hydrating Skin Prep', 'Gentle Products', 'Romantic Waves', 'In-Studio & Mobile'],
    seoTitle: 'Baby Shower & Maternity Glam San Marcos | Glitz',
    seoDescription: 'Luminous, gentle hair and makeup for expecting moms in San Marcos, CA. Ideal for baby showers and maternity photo sessions across San Diego County. Inquire now.',
    targetKeywords: [
      'baby shower makeup artist san marcos ca',
      'maternity photoshoot hair and makeup san diego',
      'glowy event makeup san marcos ca',
      'maternity portrait hair styling vista ca',
      'mom to be hair and makeup north county',
      'gentle maternity beauty salon san marcos',
    ],
    h1: 'Baby Shower & Maternity Hair & Makeup in San Marcos, CA',
    shortDesc: 'Celebrate your motherhood journey with luminous skin, soothing care, and romantic hair styling tailored for baby showers and maternity photography.',
    overview: [
      'Expecting a baby is a season filled with anticipation and love. When it comes to your baby shower or maternity photoshoot, you deserve to feel pampered, comfortable, and breathtakingly radiant. At Glitz & Glamour Studio in San Marcos, CA, we specialize in enhancing your natural pregnancy glow with lightweight, skin-loving products and soft, elegant hairstyles.',
      'Pregnancy can bring skin sensitivity and shifts in hydration. That is why our artists prioritize deeply hydrating, gentle skincare preparation, avoiding heavy fragrances or comedogenic formulas. We focus on creating a lit-from-within complexion with soft sculpting, bright eyes, and flattering lip tones that photograph beautifully outdoors or in studio light.',
      'For hair, whether you love relaxed, romantic waves that cascade down your shoulders or an airy half-up twist adorned with florals, our styling holds all day while staying soft to the touch. We ensure you feel completely comfortable throughout your appointment at our San Marcos salon or in the comfort of your own home.',
      'We welcome moms-to-be from across San Marcos, Vista, Carlsbad, Escondido, and surrounding North County communities. We also cater to grandmothers and close family members attending the celebration.',
    ],
    servicesOffered: [
      {
        title: 'The "Glow from Within" Maternity Package',
        desc: 'Hydration skincare prep, dewy HD makeup, soft eye enhancement, fluttery natural lashes, and romantic curl or wave styling.',
      },
      {
        title: 'Maternity Photoshoot Camera-Ready Glam',
        desc: 'Contoured lighting-optimized makeup designed specifically for golden-hour beach or park maternity portrait sessions.',
      },
      {
        title: 'Grandmother & Sister Glam',
        desc: 'Polished, age-flattering hair styling and natural makeup for the mom-to-be’s closest family members.',
      },
      {
        title: 'In-Home Maternity Pampering',
        desc: 'Our artists travel to your home so you can relax on your own couch and avoid unnecessary travel.',
      },
    ],
    whatsIncluded: [
      'Comfort-first consultation focusing on sensitive skin and gentle products',
      'Hyaluronic acid and antioxidant hydration skin prep',
      'Weightless, radiant foundation that breathes with your skin',
      'Feather-light faux lash application for opened, rested eyes',
      'Thermal-protected curling and hair styling designed for all-day comfort',
    ],
    timelineGuide: [
      { step: 'Step 1', title: 'Schedule with Buffer', desc: 'Book your service 3 to 4 weeks prior to your shower date or golden-hour photoshoot.' },
      { step: 'Step 2', title: 'Comfort First', desc: 'Let us know if you need frequent breaks or specific product preferences; your comfort is our top priority.' },
      { step: 'Step 3', title: 'Radiate & Celebrate', desc: 'Leave feeling refreshed, gorgeous, and ready to celebrate with your loved ones.' },
    ],
    serviceAreas: {
      primary: 'San Marcos, CA (935 W San Marcos Blvd, Suite 101)',
      cities: ['San Marcos', 'Vista', 'Carlsbad', 'Escondido', 'Oceanside', 'Encinitas', 'San Elijo Hills'],
      venues: ['Lakehouse Resort', 'Williams’ Barn', 'Twin Oaks Valley Winery', 'Local San Diego Parks & Beaches'],
    },
    pricingNote: 'Solo mom-to-be packages and multi-guest family bundles available. Inquire online for a personalized quote.',
    faqs: [
      {
        q: 'Are your products safe and gentle for pregnancy skin?',
        a: 'Yes. We choose gentle, dermatologically tested, high-grade beauty products and avoid harsh ingredients, ensuring a safe and comfortable experience for expecting mothers.',
      },
      {
        q: 'Can you travel to my house for my baby shower morning?',
        a: 'Yes! Many expecting mothers prefer the convenience of our on-location mobile service so they can get ready peacefully in their own home.',
      },
      {
        q: 'What hairstyle looks best for outdoor maternity photos?',
        a: 'Soft Hollywood waves, dimensional textured curls, or romantic boho half-up styles look breathtaking in outdoor natural light and withstand breezy coastal weather.',
      },
    ],
    relatedSlugs: ['photo-video-shoots', 'bridal-showers-bachelorettes', 'sweet-16-birthdays', 'weddings-bridal'],
  },
  {
    slug: 'sweet-16-birthdays',
    aliases: ['sweet-16-makeup', 'birthday-hair-and-makeup', 'milestone-birthday-glam'],
    name: 'Sweet 16 & Milestone Birthdays',
    tag: 'Sweet',
    badge: '#f472b6',
    heroImage: '/special-events/ev-sweet16.jpg',
    pills: ['Birthday Queen', 'Age-Appropriate Glam', 'Custom Curls', 'Nails & Lashes', 'Photo-Ready'],
    seoTitle: 'Sweet 16 & Birthday Glam San Marcos | Glitz & Glamour',
    seoDescription: 'Make your celebration unforgettable. Sweet 16 and milestone birthday hair & makeup in San Marcos, CA. Custom glam for parties and photo shoots. Inquire today.',
    targetKeywords: [
      'sweet 16 makeup artist san marcos ca',
      'birthday hair and makeup san marcos',
      'milestone birthday glam north county san diego',
      'birthday party makeup vista ca',
      'sweet 16 hair styling north county',
      'birthday glam squad san diego',
      '21st birthday hair and makeup san marcos',
    ],
    h1: 'Sweet 16 & Birthday Hair & Makeup in San Marcos, CA',
    shortDesc: 'Celebrate your special year in style. Age-appropriate glam, show-stopping hairstyles, and birthday queen beauty in our San Marcos studio or on-location.',
    overview: [
      'Whether you are celebrating your milestone Sweet 16, turning 21, or marking a monumental 30th, 40th, or 50th birthday, you deserve to feel celebrated, pampered, and stunning. At Glitz & Glamour Studio in San Marcos, CA, we tailor birthday beauty to your exact personality—from fresh, youthful, age-appropriate radiance for Sweet 16s to glamorous, red-carpet transformations for major milestone years.',
      'Located at 935 W San Marcos Blvd in San Marcos (conveniently serving Vista, Carlsbad, Escondido, and all North County), our studio is equipped for both private birthday pampering and fun squad appointments. If you are hosting a grand party at a banquet hall or local restaurant, our mobile team can also come straight to your location.',
      'For Sweet 16 celebrations, our artists strike the ideal balance of elevated glam that enhances youthful beauty without looking heavy or overdone. For adult milestone celebrations, we craft sophisticated eye makeup, flawless skin contouring, and signature hair styling that holds its luster through cocktails, dining, and dancing.',
      'Make your birthday entrance unforgettable with hair and makeup crafted by artists who care about every detail.',
    ],
    servicesOffered: [
      {
        title: 'Sweet 16 "Birthday Royalty" Glam',
        desc: 'Age-appropriate glowing complexion, soft shimmering eye makeup, custom lashes, and bouncy curls or chic updo styling.',
      },
      {
        title: 'Milestone 21st, 30th, 40th & 50th Glam',
        desc: 'Full-service red carpet makeup and elevated hair styling tailored to your outfit and party venue.',
      },
      {
        title: 'Birthday Squad Mini-Sessions',
        desc: 'Coordinated hair and makeup appointments for your friends or family members attending the party.',
      },
      {
        title: 'Full Glam & Nails Combination',
        desc: 'Pair your special event styling with our signature manicure or acrylic nail art in our San Marcos salon.',
      },
    ],
    whatsIncluded: [
      'Style consultation matching your birthday outfit, color scheme, and lighting',
      'Skincare prep with hydration balance for camera-ready perfection',
      'Custom lash application (natural clusters or full strip lashes)',
      'Precision thermal styling (curls, waves, sleek blowouts, or updos)',
      'Long-wear setting spray that keeps you glowing all night',
    ],
    timelineGuide: [
      { step: 'Step 1', title: 'Pick Your Look', desc: 'Gather your outfit photos and makeup inspiration. Inquire 3 to 6 weeks before your birthday.' },
      { step: 'Step 2', title: 'Get Styled', desc: 'Relax in our San Marcos studio with our team, or welcome us to your venue.' },
      { step: 'Step 3', title: 'Celebrate Your Year', desc: 'Snap your birthday photos with complete confidence and make lasting memories.' },
    ],
    serviceAreas: {
      primary: 'San Marcos, CA (935 W San Marcos Blvd, Suite 101)',
      cities: ['San Marcos', 'Vista', 'Carlsbad', 'Escondido', 'Oceanside', 'Encinitas', 'San Elijo Hills'],
      venues: ['Lakehouse Resort', 'Local North County Restaurants & Event Spaces', 'Private Home Venues'],
    },
    pricingNote: 'Custom birthday pricing based on look complexity and party size. Inquire online for immediate availability.',
    faqs: [
      {
        q: 'Is the Sweet 16 makeup too heavy for a 16-year-old?',
        a: 'Not at all. We specialize in enhancing youthful beauty with fresh skin, soft blush, and flattering eyes, ensuring you look like the best version of yourself, never over-mature.',
      },
      {
        q: 'Can I get my nails done at the same appointment?',
        a: 'Yes! As a full-service beauty studio, we can coordinate your nail appointment (Gel-X, Acrylics, or Manicure) with your hair and makeup on the same day.',
      },
      {
        q: 'Do you offer touch-up lip products for the party?',
        a: 'Yes, we provide sample touch-up containers of your lip color so you can reapply after eating and drinking throughout your party.',
      },
    ],
    relatedSlugs: ['quinceaneras', 'prom-homecoming', 'bridal-showers-bachelorettes', 'photo-video-shoots'],
  },
  {
    slug: 'corporate-gala',
    aliases: ['corporate-events', 'gala-makeup', 'awards-night-styling'],
    name: 'Corporate & Gala Events',
    tag: 'Professional',
    badge: '#3b82f6',
    heroImage: '/special-events/ev-corporate.jpg',
    pills: ['Polished Glam', 'Executive Hair', 'HD Stage Makeup', 'Invoice Billing', 'On-Location'],
    seoTitle: 'Corporate & Gala Hair & Makeup | San Marcos CA',
    seoDescription: 'Sophisticated hair styling & camera-ready makeup for galas, award dinners, and corporate events across San Marcos & San Diego County. Book your team glam today.',
    targetKeywords: [
      'corporate event makeup artist san diego',
      'gala hair and makeup north county san diego',
      'award ceremony hair and makeup san marcos',
      'executive headshot hair and makeup carlsbad',
      'professional event beauty styling san diego',
      'charity ball hair and makeup encinitas',
    ],
    h1: 'Corporate, Gala & Award Night Hair & Makeup in San Marcos & San Diego',
    shortDesc: 'Refined, elegant, and camera-ready. High-definition hair and makeup for charity galas, executive presentations, award dinners, and red carpet corporate events.',
    overview: [
      'Corporate galas, charity balls, and high-profile industry award nights require a distinct standard of beauty: refined, commanding, and polished to perfection. At Glitz & Glamour Studio, we specialize in sophisticated hair and makeup that enhances your presence under bright stage lighting, high-resolution photography, and intimate networking environments.',
      'Headquartered at 935 W San Marcos Blvd in San Marcos, CA, we cater to corporate executives, keynote speakers, event hosts, and gala attendees throughout North County and greater San Diego. We frequently provide mobile glam for events hosted at luxury venues like the Omni La Costa Resort in Carlsbad, The Park Hyatt Aviara, The Fairmont Grand Del Mar, and downtown San Diego convention centers.',
      'We understand that professional events often operate on tight, demanding schedules. Our artists work with speed and precision, delivering camera-ready HD makeup that controls shine under flash photography while remaining natural and elegant in person.',
      'We also support corporate event planners seeking on-site beauty lounges or multi-attendee styling packages with streamlined corporate invoicing and flexible scheduling.',
    ],
    servicesOffered: [
      {
        title: 'Keynote & Executive Stage Glam',
        desc: 'High-definition stage makeup that prevents glare under spotlights and clean, polished hair styling that stays impeccably in place.',
      },
      {
        title: 'Black-Tie Gala Red Carpet Styling',
        desc: 'Elegant formal updos, classic chignons, Hollywood waves, and sophisticated evening makeup for charity galas and balls.',
      },
      {
        title: 'Corporate On-Site Beauty Lounge',
        desc: 'Bring a mobile touch-up and styling bar to your corporate summit or awards dinner to pamper VIP guests and speakers.',
      },
      {
        title: 'Executive Headshot Grooming',
        desc: 'Natural, camera-tested grooming and light makeup for both men and women before corporate branding photo shoots.',
      },
    ],
    whatsIncluded: [
      'Consultation evaluating venue lighting, stage presence, and dress code',
      'Matte-balancing and oil-control skin priming for stage and flash lighting',
      'HD foundation with non-reflective minerals to eliminate flashback',
      'Professional hair finishing with anti-frizz barriers for humid evening receptions',
      'Corporate payment processing and itemized receipting for expense reporting',
    ],
    timelineGuide: [
      { step: 'Step 1', title: 'Event Details', desc: 'Provide date, venue, stage timeline, and number of executives or guests requiring services.' },
      { step: 'Step 2', title: 'Schedule Coordination', desc: 'We align beauty completion 45 minutes prior to VIP receptions or stage call times.' },
      { step: 'Step 3', title: 'Executive Polish', desc: 'Prompt, professional service executed with discreet efficiency and high aesthetic standards.' },
    ],
    serviceAreas: {
      primary: 'San Marcos, CA (935 W San Marcos Blvd, Suite 101)',
      cities: ['San Marcos', 'Carlsbad', 'Del Mar', 'La Jolla', 'San Diego', 'Encinitas', 'Rancho Santa Fe', 'Vista'],
      venues: ['Omni La Costa Resort', 'Park Hyatt Aviara', 'Fairmont Grand Del Mar', 'San Diego Convention Center', 'L’Auberge Del Mar'],
    },
    pricingNote: 'Corporate event packages and per-attendee rates available. Net-30 invoicing available for pre-approved corporate clients.',
    faqs: [
      {
        q: 'Do you provide on-site services at hotels and conference centers?',
        a: 'Yes, we regularly travel to hotels, resorts, and conference centers throughout San Diego County with full styling equipment.',
      },
      {
        q: 'Can you invoice our company directly for corporate event beauty?',
        a: 'Yes, we accommodate corporate invoicing and commercial credit card billing with itemized receipts for expense reconciliation.',
      },
      {
        q: 'How do you ensure makeup does not look shiny or washed out on stage?',
        a: 'We use non-reflective HD pigments, micro-milled powders, and professional setting sprays specifically calibrated for stage lighting and flash photography.',
      },
    ],
    relatedSlugs: ['photo-video-shoots', 'on-location-hair-makeup', 'weddings-bridal', 'sweet-16-birthdays'],
  },
  {
    slug: 'photo-video-shoots',
    aliases: ['photoshoot-makeup', 'editorial-hair-and-makeup', 'branding-shoot-glam'],
    name: 'Photo & Video Shoots',
    tag: 'Creative',
    badge: '#8b5cf6',
    heroImage: '/special-events/ev-photo-shoots.jpg',
    pills: ['Editorial Glam', 'HD Camera Ready', 'Flash Tested', 'Half / Full Day Rates', 'On-Set Touch-ups'],
    seoTitle: 'Photoshoot & Editorial Makeup San Marcos | Glitz',
    seoDescription: 'Camera-ready hair and makeup for editorial, commercial, and personal branding shoots in San Marcos & San Diego. Studio and on-location half/full-day rates.',
    targetKeywords: [
      'photoshoot makeup artist san marcos ca',
      'editorial hair and makeup san diego',
      'commercial photoshoot hair stylist north county',
      'headshot makeup artist san marcos ca',
      'branding shoot hair and makeup san diego',
      'content creator glam san marcos',
      'camera ready hd makeup vista ca',
    ],
    h1: 'Photo & Video Shoot Hair & Makeup in San Marcos, CA & San Diego',
    shortDesc: 'Editorial, commercial, and content creation glam that looks flawless in high-definition 4K video and photography under studio strobes or natural light.',
    overview: [
      'In high-definition photography and 4K digital video, every micro-detail counts. Lighting equipment, flash strobes, and high-resolution camera sensors capture skin texture, color balances, and stray hairs with unforgiving clarity. At Glitz & Glamour Studio, our artists are trained in professional photographic makeup artistry and camera-ready hair styling.',
      'Based in San Marcos, CA (relocated from our original Vista studio to 935 W San Marcos Blvd), we collaborate with commercial photographers, creative directors, modeling agencies, brand founders, and influencers across San Diego County and Southern California. Whether you are shooting in a North County photography studio, capturing golden hour at Carlsbad State Beach, or filming commercial video in an executive boardroom, our team delivers results.',
      'We understand how different lighting setups—continuous LED, flash strobes, warm natural sunlight, and cool overcast coastal light—interact with makeup pigments. We utilize color-correcting techniques, zero-flashback powders, and precise contouring to ensure your bone structure pops without unnatural lines.',
      'We offer convenient in-studio prep at our San Marcos salon as well as half-day and full-day on-set artist bookings where we stay by the monitor to adjust hair flyaways, blot shine, and execute quick wardrobe-inspired look changes.',
    ],
    servicesOffered: [
      {
        title: 'Personal Branding & Headshots',
        desc: 'Flawless, clean, professional hair styling and complexion makeup for entrepreneurs, realtors, executives, and creatives.',
      },
      {
        title: 'Editorial & Fashion Shoots',
        desc: 'Creative, high-fashion concepts, avant-garde styles, graphic liner, and editorial hair architecture for magazine publications.',
      },
      {
        title: 'Commercial & Advertising Video',
        desc: 'Long-wearing, sweat-resistant HD makeup for commercial actors, brand founders, and video productions with on-set continuity.',
      },
      {
        title: 'On-Set Half-Day / Full-Day Retainer',
        desc: 'Dedicated artist on-set for monitor watching, hair resets, shine control, and look transitions between scene changes.',
      },
    ],
    whatsIncluded: [
      'Lighting and camera consultation with photographer or director',
      'Color-correcting complexion prep and anti-shine primer',
      'Custom lash mapping designed specifically for camera angles',
      'Precision hair styling with zero-flyaway finishing products',
      'On-set emergency kit for immediate continuity touch-ups',
    ],
    timelineGuide: [
      { step: 'Step 1', title: 'Creative Brief & Call Sheet', desc: 'Share your mood board, call times, lighting style, and number of talent/looks.' },
      { step: 'Step 2', title: 'Talent Prep', desc: 'Arrive at our San Marcos salon or have our artist arrive on-set 1 hour before first camera roll.' },
      { step: 'Step 3', title: 'On-Set Excellence', desc: 'Stay by the monitors ensuring hair and makeup remain pristine for every single take.' },
    ],
    serviceAreas: {
      primary: 'San Marcos, CA & Greater San Diego County',
      cities: ['San Marcos', 'Vista', 'Carlsbad', 'Encinitas', 'Oceanside', 'San Diego', 'La Jolla', 'Downtown San Diego'],
      venues: ['North County Photo Studios', 'Carlsbad & Encinitas Coast', 'Local Commercial Production Locations'],
    },
    pricingNote: 'Per-look rates, half-day (up to 4 hours), and full-day (up to 8 hours) production rates available upon consultation.',
    faqs: [
      {
        q: 'How does photoshoot makeup differ from regular special event makeup?',
        a: 'Photoshoot makeup is formulated to withstand intense strobe flashes and continuous heat lights without separating, melting, or reflecting white flashback on camera sensors.',
      },
      {
        q: 'Can an artist stay on set for touch-ups between takes?',
        a: 'Yes, we offer half-day and full-day day rates where an artist remains on set to fix stray hairs, control shine, and assist with look changes.',
      },
      {
        q: 'Do you work with men for photo shoot grooming and headshots?',
        a: 'Yes, we provide grooming services for men including beard neatening, brow grooming, shine control, and subtle skin evening for professional headshots.',
      },
    ],
    relatedSlugs: ['corporate-gala', 'weddings-bridal', 'on-location-hair-makeup', 'sweet-16-birthdays'],
  },
];

/**
 * Slugs list for static path generation
 */
export const ALL_SPECIAL_EVENT_SLUGS = SPECIAL_EVENTS_DETAILED.map(e => e.slug);

/**
 * Retrieve special event detailed record by slug or alias
 */
export function getSpecialEventBySlug(slug: string): DetailedSpecialEvent | undefined {
  const clean = slug.toLowerCase().trim();
  return SPECIAL_EVENTS_DETAILED.find(
    e => e.slug.toLowerCase() === clean || e.aliases.some(a => a.toLowerCase() === clean)
  );
}
