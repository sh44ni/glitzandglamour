export interface ServiceAreaVenue {
  name: string;
  type: string;
  neighborhood: string;
  description: string;
  hmuaTip: string;
}

export interface ServiceAreaFAQ {
  question: string;
  answer: string;
}

export interface ServiceAreaReview {
  quote: string;
  author: string;
  venue: string;
  role: string;
  rating: number;
}

export interface ServiceAreaItem {
  slug: string;
  city: string;
  state: string;
  region: string;
  heroTitle: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  heroImage: string;
  heroTagline: string;
  tagBadge: string;
  distanceFromStudio: string;
  travelTimeSnippet: string;
  introParagraphs: string[];
  valueProps: Array<{
    title: string;
    description: string;
  }>;
  venues: ServiceAreaVenue[];
  servicesProvided: Array<{
    title: string;
    description: string;
    deliverables: string[];
  }>;
  pricingGuide: {
    heading: string;
    subheading: string;
    explanation: string;
    drivers: Array<{
      title: string;
      description: string;
    }>;
  };
  reviews: ServiceAreaReview[];
  faqs: ServiceAreaFAQ[];
  geo: {
    latitude: number;
    longitude: number;
    radiusMiles: number;
  };
}

export const SERVICE_AREAS: Record<string, ServiceAreaItem> = {
  'san-marcos-ca': {
    slug: 'san-marcos-ca',
    city: 'San Marcos',
    state: 'CA',
    region: 'North County San Diego',
    tagBadge: 'Flagship Luxury Salon & Bridal Studio HQ',
    heroTitle: 'Premier Nail Salon, Hair Color & Bridal Artistry in San Marcos, CA',
    metaTitle: 'Nail, Hair & Bridal Salon in San Marcos CA | Glitz Studio',
    metaDescription:
      'Luxury nail salon (Gel-X, acrylics, detox pedicures), balayage, haircuts, facials, waxing & bridal HMUA at 935 W San Marcos Blvd, Suite 101, San Marcos.',
    keywords: [
      'nail salon san marcos ca',
      'hair salon san marcos ca',
      'gel x nails san marcos',
      'pedicure san marcos ca',
      'balayage san marcos ca',
      'facials san marcos ca',
      'brazilian wax san marcos',
      'wedding hair makeup artist san marcos',
      'bridal hair and makeup san diego',
      '935 w san marcos blvd salon'
    ],
    heroImage: '/special-events/ev-weddings.png',
    heroTagline:
      'Your flagship San Marcos destination for Gel-X nails, detox pedicures, dimensional balayage, custom facials, waxing, and on-location bridal hair & makeup.',
    distanceFromStudio: 'Flagship Studio Location',
    travelTimeSnippet: 'Studio HQ at 935 W San Marcos Blvd, Suite 101 • Immediate access across San Marcos & Twin Oaks Valley',
    introParagraphs: [
      'Welcome to Glitz & Glamour Studio, North County San Diego’s premier full-service beauty sanctuary and bridal headquarters located right in the heart of San Marcos at 935 W San Marcos Blvd, Suite 101. Led by master artist JoJany, our flagship studio brings together elite daily salon care—including Apres Gel-X extensions, sculpted acrylics, builder gel, soothing detox pedicures, custom dimensional balayage, precision haircuts, deep-cleansing facials, and gentle waxing—under one glamorous roof.',
      'Beyond everyday pampering for San Marcos residents and CSUSM students, our studio houses private, sun-drenched bridal preview suites where we design bespoke wedding hair and makeup looks. Whether you are walking down the aisle beneath the garden canopies of Twin Oaks House & Gardens or hosting a lakeside reception at Lakehouse Resort, our mobile bridal glam squad travels directly to your venue equipped with daylight ring lights, airbrush cosmetics, and humidity-proof styling essentials.',
      'We believe luxury beauty should be both accessible and transparent. For in-studio nail, hair, facial, and waxing appointments, you can browse our clear service menu and book online in seconds. For weddings, quinceañeras, and special events, we craft itemized custom quotes tailored to your exact headcount, timeline, and on-location requirements.'
    ],
    valueProps: [
      {
        title: 'Full-Service Flagship San Marcos Salon',
        description: 'One trusted local studio at 935 W San Marcos Blvd for Gel-X nails, spa pedicures, balayage, haircuts, facials, lash lifts, and waxing.'
      },
      {
        title: 'Preferred by Top San Marcos Venues',
        description: 'Deep familiarity with the layout, lighting conditions, and morning setup protocols of Twin Oaks Valley, St. Mark, and Lakehouse venues.'
      },
      {
        title: 'Hospital-Grade Sanitation & Luxury Products',
        description: 'Autoclave-sterilized nail implements, vegan gel systems, bond-building hair color, and waterproof 16-hour bridal airbrush formulas.'
      },
      {
        title: 'Easy Online Booking & Custom Bridal Quotes',
        description: 'Instant online scheduling for daily salon services plus itemized, zero-surprise proposals for bridal parties and special events.'
      }
    ],
    venues: [
      {
        name: 'Twin Oaks House & Gardens',
        type: 'Historic Garden & Victorian Estate',
        neighborhood: 'Twin Oaks Valley, San Marcos',
        description: 'A timeless turn-of-the-century estate surrounded by botanical gardens, antique pavilions, and fairy-lit tented dining.',
        hmuaTip: 'Garden lighting softens makeup tones; we use radiant satin airbrushing and secured updos that maintain volume in evening outdoor breezes.'
      },
      {
        name: 'Lakehouse Resort & Golf Club',
        type: 'Waterfront Resort & Marina Lawn',
        neighborhood: 'Lake San Marcos',
        description: 'Scenic lakeside pergolas, breezy marina views, and spacious resort bridal suites ideal for morning prep.',
        hmuaTip: 'Lakeside humidity calls for our silicone-based primers and hair texture sprays that lock down curl retention against coastal mist.'
      },
      {
        name: 'St. Mark Golf Club',
        type: 'Country Club & Fairway Pavilion',
        neighborhood: 'San Marcos Foothills',
        description: 'Sprawling fairway views, modern event banquet halls, and open terrace backdrops for sunset golden hour portraits.',
        hmuaTip: 'High-contrast golden hour photography requires seamless contour blending and non-flashback HD powders.'
      },
      {
        name: 'The Wood Shed by Booze Bros',
        type: 'Chic Industrial & Living Plant Space',
        neighborhood: 'San Marcos Artisan District',
        description: 'An intimate, modern industrial venue with rich wooden aesthetics, living plant walls, and atmospheric mood lighting.',
        hmuaTip: 'Dramatic venue textures pair gorgeously with polished modern Hollywood waves and sultry soft-matte bridal makeup.'
      }
    ],
    servicesProvided: [
      {
        title: 'Luxury Nails, Gel-X & Spa Pedicures',
        description: 'Flawless nail artistry inside our San Marcos studio featuring soft-gel extensions, structured builder gel, acrylic sets, and detox foot soaks.',
        deliverables: ['Apres Gel-X extensions & custom nail art', 'Sculpted acrylic full sets & rebalancing fills', 'Structure / builder gel overlays (BIAB)', 'Classic foot soak, detox & gel pedicures', 'Hospital-grade tool sterilization']
      },
      {
        title: 'Custom Balayage, Haircuts & Aesthetics',
        description: 'Lived-in dimensional hair color, keratin smoothing, custom corrective facials, lash lifts, and full-body waxing.',
        deliverables: ['Hand-painted balayage & foil highlights', 'Women’s & men’s precision haircuts', 'Keratin smoothing & gloss toners', 'Deep-cleansing & hydrating glow facials', 'Brazilian, brow sculpting & full waxing']
      },
      {
        title: 'Bridal Hair, Airbrush Makeup & Trials',
        description: 'Complete in-studio bridal preview trials and on-location wedding day hair and makeup across San Marcos and North County.',
        deliverables: ['Custom skin preparation & hydration mask', '16-hour waterproof airbrush or HD foundation', 'Bespoke lash design & veil placement', 'Bridesmaid & mother of the bride styling', 'Touch-up emergency kit included']
      }
    ],
    pricingGuide: {
      heading: 'San Marcos Salon & Bridal Pricing Guide',
      subheading: 'Transparent In-Studio Starting Rates & Bespoke Bridal Proposals',
      explanation: 'Whether you are visiting our San Marcos studio for a $40+ detox pedicure, $60+ Gel-X set, or $190+ custom balayage, our everyday salon pricing is completely transparent. For weddings and bridal parties, we formulate itemized proposals around clear cost drivers so you only pay for what your celebration truly needs.',
      drivers: [
        {
          title: 'Bridal Party Headcount',
          description: 'Larger bridal parties require additional lead artists to ensure every bridesmaid is completed smoothly without early 5:00 AM wake-up calls.'
        },
        {
          title: 'Studio Trial & Pre-Wedding Prep',
          description: 'Combine your in-studio bridal preview trial in San Marcos with pre-wedding gel nails, hair glossing, brow waxing, and hydrating facials.'
        },
        {
          title: 'Hair Extensions & Custom Accessories',
          description: 'Clip-in extension installation, blending, and intricate placement of florals, pearl pins, or heirloom veils.'
        },
        {
          title: 'Extended Touch-Up Service',
          description: 'Optional artist retention through post-ceremony photo sessions and first dances for seamless day-to-night look transitions.'
        }
      ]
    },
    reviews: [
      {
        quote: 'Glitz & Glamour did hair and makeup for myself and 7 bridesmaids at Twin Oaks House. The team arrived on time, kept us exactly on schedule, and everyone’s curls lasted through the final dance!',
        author: 'Jessica M.',
        venue: 'Twin Oaks House & Gardens',
        role: 'San Marcos Bride',
        rating: 5
      },
      {
        quote: 'Having their studio right on West San Marcos Blvd made getting my bridal trial, Gel-X wedding nails, and balayage refresh so effortless. JoJany and her team are unmatched!',
        author: 'Rachel T.',
        venue: 'Lakehouse Resort',
        role: 'San Marcos Client & Bride',
        rating: 5
      }
    ],
    faqs: [
      {
        question: 'What everyday salon services do you offer at your San Marcos studio?',
        answer: 'At 935 W San Marcos Blvd, Suite 101, we offer a full menu of nail, hair, skincare, and waxing services—including Gel-X extensions, acrylics, structure gel, detox and gel pedicures, balayage, highlights, women’s and men’s haircuts, keratin treatments, deep-cleansing facials, lash lifts, and Brazilian waxing.'
      },
      {
        question: 'Do you provide on-location wedding hair and makeup in San Marcos, or do we visit your studio?',
        answer: 'We provide both! Many brides hold their preview trials, pre-wedding nail appointments, and facials inside our San Marcos studio (Suite 101, 935 W San Marcos Blvd), and have our mobile glam team travel directly to their San Marcos bridal suite or venue on the wedding morning.'
      },
      {
        question: 'How do I book a nail, hair, or facial appointment vs. a wedding quote?',
        answer: 'For everyday salon services (nails, hair color, haircuts, facials, waxing), click "Book Now" to reserve your time slot online or call (760) 290-5910. For weddings, quinceañeras, and group events, submit our Custom Quote form and we will reply within 24–48 hours.'
      },
      {
        question: 'Can your team handle large bridal parties in San Marcos?',
        answer: 'Yes! We dispatch multiple experienced lead artists for large parties so that your morning flows gracefully without rushing or stressful early morning starts.'
      }
    ],
    geo: {
      latitude: 33.1434,
      longitude: -117.1856,
      radiusMiles: 25
    }
  },

  'vista-ca': {
    slug: 'vista-ca',
    city: 'Vista',
    state: 'CA',
    region: 'North County San Diego',
    tagBadge: 'Deep Vista Roots • Just 8 Mins Away in San Marcos',
    heroTitle: 'Premier Nail Salon, Hair Color & Bridal Artistry Serving Vista, CA',
    metaTitle: 'Nail, Hair & Bridal Salon Serving Vista CA | Glitz Studio',
    metaDescription:
      'Top nail salon (Gel-X, acrylics, pedicures), hair color, facials, waxing & bridal glam serving Vista, CA—just 8 mins from Vista at 935 W San Marcos Blvd.',
    keywords: [
      'nail salon vista ca',
      'hair salon vista ca',
      'pedicure vista ca',
      'gel x nails vista',
      'balayage vista ca',
      'facials vista ca',
      'waxing vista ca',
      'wedding hair and makeup vista ca',
      'bridal makeup and hair stylist vista',
      'glitz and glamour vista'
    ],
    heroImage: '/special-events/ev-weddings.png',
    heroTagline:
      'Formerly located on Frances Dr in Vista—now welcoming our loyal Vista nail, hair, facial, waxing, and bridal clients at our expanded flagship studio just 8 minutes away!',
    distanceFromStudio: '8 Minutes via W San Marcos Blvd',
    travelTimeSnippet: '8 mins from Vista • Former 812 Frances Dr Vista team now at 935 W San Marcos Blvd, Suite 101',
    introParagraphs: [
      'Glitz & Glamour Studio was born in Vista, California! Having proudly served thousands of clients from our former studio at 812 Frances Dr, Vista, CA 92083, we have expanded into our brand-new flagship luxury salon just 8 minutes down the road at 935 W San Marcos Blvd, Suite 101, San Marcos, CA 92078. We warmly welcome all of our loyal Vista nail, hair color, haircut, facial, waxing, and bridal clients to our upgraded sanctuary with easy parking and expanded treatment suites.',
      'Whether you live in Shadowridge, Historic Downtown Vista, or North Vista, our studio is right next door for your regular Gel-X extensions, sculpted acrylics, builder gel overlays, detox pedicures, lived-in balayage, precision haircuts, custom facials, lash lifts, and Brazilian waxing.',
      'Planning a Vista wedding or quinceañera? From the modern industrial charm of The Vistonian to the rolling greens of Shadowridge Golf Club and historic Rancho Guajome Adobe, our mobile bridal hair and makeup squad still travels directly to every Vista venue and home, bringing 16-hour waterproof glam right to your doorstep.'
    ],
    valueProps: [
      {
        title: 'Born in Vista (Formerly 812 Frances Dr)',
        description: 'Our roots began at 812 Frances Dr, Vista, CA 92083—bringing years of trusted relationships with Vista families, brides, and beauty regulars.'
      },
      {
        title: 'Only 8 Minutes to Our Expanded Flagship Studio',
        description: 'Visit us at 935 W San Marcos Blvd, Suite 101, San Marcos, CA 92078—right on the Vista/San Marcos border for nails, hair, facials, and waxing.'
      },
      {
        title: 'Complete Nail, Hair & Skin Menu',
        description: 'From $40+ detox pedicures and Gel-X sets to custom balayage, keratin smoothing, deep-cleansing facials, and gentle waxing.'
      },
      {
        title: 'Mobile Bridal Squad for All Vista Venues',
        description: 'Zero-hassle on-location wedding hair and makeup dispatch to The Vistonian, Shadowridge, Cal-a-Vie, and private Vista estates.'
      }
    ],
    venues: [
      {
        name: 'The Vistonian',
        type: 'Modern Industrial Chic Venue',
        neighborhood: 'Historic Downtown Vista',
        description: 'Exposed brick, soaring vaulted ceilings, and architectural metal details create an urban-chic sanctuary in North County.',
        hmuaTip: 'Industrial indoor lighting pairs exceptionally well with dimensional cheekbone contouring, sculpted brows, and textured modern chignons.'
      },
      {
        name: 'Shadowridge Golf Club',
        type: 'Scenic Private Country Club',
        neighborhood: 'Shadowridge, Vista',
        description: 'Surrounded by mature eucalyptus groves, manicured rolling greens, and panoramic fairway vistas.',
        hmuaTip: 'Outdoor breezes on the golf course require our wind-defying hair finishing formulas and dewy, non-powdery airbrush base.'
      },
      {
        name: 'Cal-a-Vie Health Spa Weddings',
        type: 'Provencal Luxury Estate',
        neighborhood: 'Vista Hills',
        description: 'Imported French chapels, antique stone fountains, and lavender hillsides providing a European destination wedding ambiance.',
        hmuaTip: 'French romanticism calls for soft romantic half-up hairstyles, whimsical tendrils, and luminous rose-gold bridal palettes.'
      },
      {
        name: 'Rancho Guajome Adobe',
        type: 'Historic California Rancho',
        neighborhood: 'North Vista',
        description: 'Authentic 19th-century Spanish colonial architecture, tiled courtyards, and heritage garden trees.',
        hmuaTip: 'Natural daylight courtyards require soft-focus HD foundation that looks completely natural up close and under direct sunshine.'
      }
    ],
    servicesProvided: [
      {
        title: 'Nails, Gel-X & Spa Pedicures for Vista Clients',
        description: 'Just 8 minutes from Vista, enjoy long-lasting Gel-X extensions, acrylics, builder gel, and relaxing detox pedicures in our sanitized luxury chairs.',
        deliverables: ['Apres Gel-X & custom hand-painted nail art', 'Acrylic full sets & 2–3 week fills', 'Structure / builder gel natural nail overlays', 'Detox foot soaks & gel pedicures', 'Express & luxury gel manicures']
      },
      {
        title: 'Hair Color, Cuts, Facials & Waxing',
        description: 'Keep your hair and skin glowing year-round with our master colorists and licensed estheticians right on the Vista border.',
        deliverables: ['Dimensional balayage & foil highlights', 'Women’s blowouts & men’s skin fades', 'Keratin frizz-smoothing treatments', 'Deep-cleansing extraction & glow facials', 'Brazilian waxing, brow shaping & lash lifts']
      },
      {
        title: 'Vista Bridal & Quinceañera Hair & Makeup',
        description: 'In-studio bridal preview trials at our San Marcos flagship plus full on-location mobile glam across all Vista venues.',
        deliverables: ['Custom skin prep & depuffing', 'Transfer-resistant airbrush foundation', 'Bespoke lash clusters & veil anchoring', 'Bridesmaid & mother of the bride glam', 'Quinceañera court & crown styling']
      }
    ],
    pricingGuide: {
      heading: 'Vista Salon & Bridal Pricing Guide',
      subheading: 'Transparent Everyday Salon Rates & Custom Bridal Quotes',
      explanation: 'Vista residents enjoy everyday luxury at honest prices—from $35+ gel manicures and $55+ haircuts to $190+ balayage transformations. For Vista weddings and quinceañeras, our proximity right down West San Marcos Blvd means minimal travel costs and flexible custom group packages.',
      drivers: [
        {
          title: 'Total Services Requested',
          description: 'Combining hair and makeup for both the bride and bridal party provides the most efficient timeline and consolidated custom quote.'
        },
        {
          title: 'Pre-Event Salon Prep',
          description: 'Bundle your bridal preview trial with pre-wedding Gel-X nails, pedicures, hair glossing, or a hydrating facial 8 minutes from Vista.'
        },
        {
          title: 'Early Morning Timing',
          description: 'For early morning ceremonies or extensive bridal party counts, we schedule our master team to guarantee zero rush.'
        },
        {
          title: 'On-Site Travel Radius',
          description: 'Because our studio sits right on the San Marcos / Vista border, on-location dispatch to any Vista venue is fast and seamless.'
        }
      ]
    },
    reviews: [
      {
        quote: 'I have been following JoJany since the 812 Frances Dr days in Vista! The new studio at 935 W San Marcos Blvd is only 8 minutes from my house in Shadowridge and is absolutely gorgeous.',
        author: 'Amanda K.',
        venue: 'The Vistonian & Studio Regular',
        role: 'Vista Client & Bride',
        rating: 5
      },
      {
        quote: 'Super convenient being less than 10 minutes from Vista for my monthly Gel-X nails, balayage, and my bridal trial. They made my entire wedding party at Shadowridge Golf Club look like royalty!',
        author: 'Elena R.',
        venue: 'Shadowridge Golf Club',
        role: 'Vista Bride',
        rating: 5
      }
    ],
    faqs: [
      {
        question: 'Did Glitz & Glamour Studio move from 812 Frances Dr in Vista?',
        answer: 'Yes! Glitz & Glamour Studio formerly operated at 812 Frances Dr, Vista, CA 92083 and has expanded to our flagship luxury salon just 8 minutes away at 935 W San Marcos Blvd, Suite 101, San Marcos, CA 92078. We continue to welcome all of our beloved Vista clients for nails, pedicures, hair color, haircuts, facials, waxing, and bridal glam!'
      },
      {
        question: 'How far is your new studio from Downtown Vista and Shadowridge?',
        answer: 'Our flagship salon at 935 W San Marcos Blvd, Suite 101 is only 8 minutes from Shadowridge and about 8–10 minutes from Historic Downtown Vista via Sycamore Ave and W San Marcos Blvd, with plenty of free, convenient parking.'
      },
      {
        question: 'Do you charge high travel fees for Vista weddings?',
        answer: 'No! Because our flagship salon is located right on the San Marcos / Vista border on West San Marcos Blvd, mobile bridal team travel to Vista venues like The Vistonian or Shadowridge Golf Club is brief, convenient, and cost-effective.'
      },
      {
        question: 'Can Vista clients book regular nail, hair, and facial appointments online?',
        answer: 'Absolutely! Vista residents can book Gel-X nails, acrylics, detox pedicures, balayage, haircuts, facials, and waxing directly through our online booking page or by calling (760) 290-5910.'
      }
    ],
    geo: {
      latitude: 33.2000,
      longitude: -117.2425,
      radiusMiles: 20
    }
  },

  'carlsbad-ca': {
    slug: 'carlsbad-ca',
    city: 'Carlsbad',
    state: 'CA',
    region: 'Coastal North County',
    tagBadge: 'Coastal Luxury Salon & Resort Wedding HMUA',
    heroTitle: 'Bridal Hair, Makeup & Luxury Salon Serving Carlsbad, CA',
    metaTitle: 'Wedding Hair & Makeup Artist Carlsbad CA | Glitz & Glamour',
    metaDescription:
      'Luxury wedding hair & makeup artist and full-service nail & hair salon near Carlsbad, CA. Serving Omni La Costa, Cape Rey & Leo Carrillo Ranch. Book now!',
    keywords: [
      'bridal hair and makeup carlsbad ca',
      'wedding hair and makeup san diego',
      'nail salon near carlsbad ca',
      'balayage near carlsbad ca',
      'wedding makeup artist carlsbad',
      'stylist for weddings carlsbad',
      'makeup artist for bridesmaids',
      'omni la costa wedding hair makeup'
    ],
    heroImage: '/special-events/ev-weddings.png',
    heroTagline:
      'Bespoke coastal wedding beauty for Carlsbad resorts plus flagship Gel-X nails, balayage, facials, and waxing just 15 minutes inland.',
    distanceFromStudio: '15 Minutes via Palomar Airport Rd / La Costa Ave',
    travelTimeSnippet: '15 mins from La Costa & Carlsbad • Dedicated resort on-location bridal teams',
    introParagraphs: [
      'Carlsbad, California is world-renowned for its scenic ocean bluffs, historic ranches, and Five-Star luxury golf resorts. From the peacock-graced hacienda grounds of Leo Carrillo Ranch to oceanfront vows at Cape Rey and European elegance at Omni La Costa and Park Hyatt Aviara, Carlsbad weddings require hair and makeup that can withstand coastal salt air while maintaining a luminous, couture finish.',
      'Glitz & Glamour Studio provides Carlsbad brides and residents with both specialized on-location bridal artistry and a full-service flagship salon just 15 minutes away at 935 W San Marcos Blvd, Suite 101. Many clients from La Costa, Aviara, and Bressi Ranch visit our studio regularly for Apres Gel-X nails, detox pedicures, dimensional balayage, keratin smoothing, custom facials, and waxing without paying inflated coastal resort prices.',
      'For your wedding day, our mobile glam squad travels directly to your Carlsbad hotel suite or venue dressing room equipped with humidity-resistant hair primers, thermal setting locks, and silicone-based airbrush foundations that prevent frizz or shine from your beachside ceremony through your twilight reception.'
    ],
    valueProps: [
      {
        title: 'Coastal Weather-Resistant Glamour',
        description: 'Formulas specifically selected to resist coastal marine layer dampness, beach breezes, and outdoor afternoon sunshine.'
      },
      {
        title: 'Experienced with Carlsbad Luxury Resorts',
        description: 'Familiar with loading protocols and bridal suite logistics at Omni La Costa, Park Hyatt Aviara, Cape Rey, and Leo Carrillo.'
      },
      {
        title: '15 Minutes from La Costa & Bressi Ranch',
        description: 'Visit our nearby San Marcos studio for Gel-X nails, spa pedicures, balayage, facials, waxing, and bridal preview trials.'
      },
      {
        title: 'Streamlined Bridal Party Timelines',
        description: 'Efficient multi-stylist dispatch guarantees large bridal parties get ready calmly with plenty of time for first look photos.'
      }
    ],
    venues: [
      {
        name: 'Leo Carrillo Ranch Historic Park',
        type: 'Historic California Hacienda & Botanical Sanctuary',
        neighborhood: 'East Carlsbad',
        description: 'Rustic adobe haciendas, free-roaming peacocks, bougainvillea blooms, and ancient pepper trees creating an organic romantic retreat.',
        hmuaTip: 'Rustic outdoor venues pair effortlessly with textured low updos, bohemian braids, and warm-toned terracotta bridal palettes.'
      },
      {
        name: 'Cape Rey Carlsbad Beach Resort (Hilton)',
        type: 'Oceanfront Luxury Resort',
        neighborhood: 'Carlsbad Coastal Bluffs',
        description: 'Unobstructed Pacific Ocean views, ocean-breeze ceremony lawns, and stylish contemporary ballroom spaces.',
        hmuaTip: 'Pacific breezes require deep structural hair pinning and flexible-hold setting sprays that let hair move naturally without flying away.'
      },
      {
        name: 'Omni La Costa Resort & Spa',
        type: 'Iconic Luxury Spanish Resort',
        neighborhood: 'La Costa, Carlsbad',
        description: 'Spanish colonial courtyards, whitewashed archways, lush golf fairways, and grand ballrooms.',
        hmuaTip: 'Classic resort luxury calls for sculpted glam: clean Hollywood waves, feline eyeliner flick, and velvety bridal lips.'
      },
      {
        name: 'Park Hyatt Aviara Resort & Golf Club',
        type: 'Five-Star Coastal Sanctuary',
        neighborhood: 'Batiquitos Lagoon, Carlsbad',
        description: 'Dramatic palm courtyards, lagoon panoramic views, and opulent terrace reception areas.',
        hmuaTip: 'High-end photography needs micro-fine finishing powder with zero silica flashback under camera flash.'
      }
    ],
    servicesProvided: [
      {
        title: 'Resort & On-Location Bridal Glam',
        description: 'Complete on-site bridal hair and makeup artistry brought directly to your Carlsbad resort suite, including luxury lashes and bridal touch-up kit.',
        deliverables: ['Custom long-wear airbrush application', 'Tailored bridal updo or Hollywood waves', 'Lash customization & lip seal', 'Veil & tiara placement', 'Comprehensive touch-up essentials']
      },
      {
        title: 'Bridal Party & Attendant Artistry',
        description: 'Individualized hair and makeup for each bridesmaid, maid of honor, and flower girl tailored to your chosen wedding color theme.',
        deliverables: ['Updo, half-up, or beach wave styling', 'Camera-ready full makeup with lashes', 'Coordinated aesthetic across the party', 'Punctual timeline delivery']
      },
      {
        title: 'In-Studio Nails, Balayage, Facials & Trials',
        description: 'Just 15 minutes from Carlsbad, visit our San Marcos studio for pre-wedding trials, Gel-X nails, detox pedicures, hair color, and facials.',
        deliverables: ['Bridal hair & makeup preview trials', 'Apres Gel-X, acrylics & gel pedicures', 'Custom balayage, highlights & keratin', 'Deep-cleansing facials & waxing']
      }
    ],
    pricingGuide: {
      heading: 'Carlsbad Wedding Hair and Makeup Pricing & Custom Quotes',
      subheading: 'Tailored Investment for Exceptional Resort & Coastal Weddings',
      explanation: 'Every Carlsbad wedding has its own cadence—from intimate coastal elopements to 10-person bridal parties getting ready in resort villas. We build transparent custom quotes so that you receive high-touch attention without paying for arbitrary package bloat.',
      drivers: [
        {
          title: 'Bridal Party Size',
          description: 'Determines the number of master artists dispatched to ensure your morning is seamless and unhurried.'
        },
        {
          title: 'Resort Getting-Ready Logistics',
          description: 'Setup and on-location travel to Carlsbad coastal hotels, private estates, or resort villas.'
        },
        {
          title: 'Preview Trial & Pre-Wedding Beauty',
          description: 'Schedule your preview trial, wedding nails, facial, and hair gloss at our flagship studio just 15 minutes inland.'
        },
        {
          title: 'Extended Day Services',
          description: 'On-site artist standby for ceremony touch-ups, veil removal, and evening reception hair changes.'
        }
      ]
    },
    reviews: [
      {
        quote: 'Our wedding was at Leo Carrillo Ranch and Glitz & Glamour was phenomenal! They made my 6 bridesmaids look like models, and my makeup looked freshly applied even after 10 hours of dancing.',
        author: 'Stephanie W.',
        venue: 'Leo Carrillo Ranch',
        role: 'Carlsbad Bride',
        rating: 5
      },
      {
        quote: 'Getting ready at Omni La Costa was a dream with this team. Plus, their San Marcos salon is right off San Marcos Blvd—only 12 minutes from La Costa for my nails and bridal trial!',
        author: 'Morgan C.',
        venue: 'Omni La Costa',
        role: 'Carlsbad Bride',
        rating: 5
      }
    ],
    faqs: [
      {
        question: 'Do you travel to Carlsbad hotels and wedding resorts?',
        answer: 'Yes! Our on-location mobile glam team regularly travels to Omni La Costa, Park Hyatt Aviara, Cape Rey, The Cassara, Leo Carrillo Ranch, and private beach villas across Carlsbad.'
      },
      {
        question: 'How far is your salon from Carlsbad for nail, hair, and facial appointments?',
        answer: 'Our flagship studio at 935 W San Marcos Blvd, Suite 101 is only 12–15 minutes east of La Costa, Bressi Ranch, and Carlsbad via Rancho Santa Fe Rd or Palomar Airport Rd.'
      },
      {
        question: 'How do you prevent ocean humidity from ruining my wedding hair?',
        answer: 'We prepare the hair cuticle with thermal humidity-blocking sealants, anti-frizz serums, and structural backcombing techniques that ensure curls retain memory and hold in coastal weather.'
      },
      {
        question: 'How do I obtain a custom price quote for my Carlsbad wedding?',
        answer: 'Fill out our inquiry form with your wedding date, venue, and bridal party count, or call (760) 290-5910. We will email you an itemized custom proposal within 24 to 48 hours.'
      }
    ],
    geo: {
      latitude: 33.1581,
      longitude: -117.3506,
      radiusMiles: 20
    }
  },

  'la-jolla-ca': {
    slug: 'la-jolla-ca',
    city: 'La Jolla',
    state: 'CA',
    region: 'Coastal San Diego',
    tagBadge: 'Oceanfront Couture & Luxury Wedding Styling',
    heroTitle: 'La Jolla Bridal Hair & Makeup Artist | Luxury On-Location Glam',
    metaTitle: 'La Jolla Bridal Hair & Makeup Artist | Glitz & Glamour',
    metaDescription:
      'Luxury wedding hair and makeup artist for La Jolla weddings & events. Serving Darlington House, Scripps Seaside Forum & oceanfront villas. Get a quote!',
    keywords: [
      'la jolla bridal hair and makeup',
      'makeup artist la jolla ca',
      'bridal makeup and hair stylist la jolla',
      'darlington house wedding hair makeup',
      'scripps seaside forum wedding makeup',
      'wedding hair makeup artist san diego',
      'luxury bridal hair san diego',
      'bridal hair and makeup san diego ca'
    ],
    heroImage: '/special-events/ev-weddings.png',
    heroTagline:
      'Couture bridal hair and red-carpet makeup for oceanfront villas, historic estates, and luxury coastal venues in La Jolla.',
    distanceFromStudio: '30–35 Minutes via I-5 South',
    travelTimeSnippet: 'Direct mobile glam team dispatch to La Jolla estates & seaside resorts • Studio trials in North County',
    introParagraphs: [
      'La Jolla, California is the crown jewel of Southern California coastlines—famed for dramatic cliffside views, historic Spanish and Moroccan villas, and chic modern architectural landmarks. Whether you are saying your vows in the romantic Andalusian courtyard of The Darlington House, overlooking rolling Pacific waves at Scripps Seaside Forum, or hosting an intimate dinner atop a La Jolla Cove rooftop, your wedding beauty deserves the highest echelon of artistry.',
      'Glitz & Glamour Studio provides discerning La Jolla brides with luxury on-location wedding hair and makeup services. We specialize in red-carpet level complexion work—combining luminous, breathable skin with precision contouring, custom cluster lashes, and architectural hair designs that stay impeccably intact in Pacific ocean air.',
      'Our senior stylists bring a calm, poised presence to your bridal suite, while our flagship North County studio at 935 W San Marcos Blvd offers a private retreat for your pre-wedding preview trials, custom hair color, Gel-X wedding nails, and hydrating glow facials.'
    ],
    valueProps: [
      {
        title: 'Couture Red-Carpet Quality',
        description: 'Techniques honed on commercial shoots, fashion editorials, and luxury bridal celebrations across Southern California.'
      },
      {
        title: 'Specialized in La Jolla Ocean Venues',
        description: 'Expert knowledge of marine layer lighting, seaside wind patterns, and photography conditions at Scripps, Darlington, and La Jolla Cove.'
      },
      {
        title: 'Complete Mobile Vanity Setup',
        description: 'We bring daylight-balanced LED lighting towers, professional director chairs, and sanitized beauty kits directly to your suite.'
      },
      {
        title: 'Concierge Custom Proposals',
        description: 'Bespoke estimates reflecting your bridal party size, look transformations, and on-site artist retention options.'
      }
    ],
    venues: [
      {
        name: 'The Darlington House',
        type: 'Historic Andalusian & Egyptian Villa',
        neighborhood: 'La Jolla Village / Lower Hermosa',
        description: 'Handcrafted Moroccan tiles, lush rose gardens, Roman courtyards, and charming Spanish architectural elegance.',
        hmuaTip: 'Old-world Mediterranean architecture is complemented by soft, romantic Hollywood waves and glowing champagne-toned eye artistry.'
      },
      {
        name: 'Scripps Seaside Forum',
        type: 'Modern Oceanfront Architectural Marvel',
        neighborhood: 'La Jolla Shores',
        description: 'Sweeping teak wood structures, floor-to-ceiling glass, and a pristine oceanfront lawn right along the sand.',
        hmuaTip: 'Direct ocean breeze demands secured updos or anti-humidity set curls, paired with water-resistant airbrush foundation.'
      },
      {
        name: 'Estancia La Jolla Hotel & Spa',
        type: 'Hacienda Resort & Secret Garden',
        neighborhood: 'Torrey Pines / La Jolla',
        description: 'Adobe brick courtyards, olive groves, secluded garden pathways, and luxury bridal suites.',
        hmuaTip: 'Romantic garden shadows require warm bronze undertones and carefully sculpted brow architecture for black-and-white portraits.'
      },
      {
        name: 'La Jolla Cove Rooftop & Hotels',
        type: 'Panoramic Ocean Bluff Venue',
        neighborhood: 'Downtown La Jolla Village',
        description: 'Spectacular 180-degree Pacific Ocean panoramas, vibrant sunsets, and open-air rooftop celebrations.',
        hmuaTip: 'Bright overhead coastal sunlight calls for matte-satin balance to prevent mid-day forehead glare in wedding portraits.'
      }
    ],
    servicesProvided: [
      {
        title: 'Couture Bridal Hair & High-Definition Makeup',
        description: 'The premier luxury bridal experience including custom airbrush skin preparation, precision contouring, bespoke lash clusters, and heirloom veil placement.',
        deliverables: ['Customized botanical skin prep', 'Waterproof luxury airbrush foundation', 'Bespoke lash design & lip contouring', 'Veil & hair jewelry placement', 'Deluxe bridal touch-up kit']
      },
      {
        title: 'Bridal Party & VIP Attendants',
        description: 'High-end styling for bridesmaids, mothers of the bride and groom, and VIP guests tailored to harmonize with your wedding vision.',
        deliverables: ['Custom hair styling (updo, half-up, or waves)', 'Lash application & HD camera makeup', 'Unified bridal party palette', 'Strict timeline adherence']
      },
      {
        title: 'Bridal Preview Trial & Pre-Wedding Beauty',
        description: 'An intimate 3-hour session at our flagship studio where we explore multiple hairstyles, test makeup, and prep your hair and nails.',
        deliverables: ['Look concept & mood board review', 'Dual hairstyle trial', 'Optional wedding Gel-X nails & facial prep', 'Digital photo log for wedding day reference']
      }
    ],
    pricingGuide: {
      heading: 'La Jolla Wedding Hair and Makeup Pricing & Custom Quotes',
      subheading: 'Tailored Investment for Discerning Oceanfront Weddings',
      explanation: 'Search terms such as "hair updos cost" or "la jolla bridal hair and makeup" often lead to generic menus that do not account for the personalized demands of luxury weddings. We provide transparent, itemized quotes reflecting your exact party numbers and on-location schedule.',
      drivers: [
        {
          title: 'Bridal Party Count',
          description: 'Determines the number of senior artists required to keep morning glam relaxed and stress-free.'
        },
        {
          title: 'On-Location Suite Setup',
          description: 'Mobile travel and complete studio equipment transport to your La Jolla hotel, private villa, or estate.'
        },
        {
          title: 'Bridal Trial Session',
          description: 'A comprehensive 3-hour trial session at our flagship studio to perfect your signature look before wedding week.'
        },
        {
          title: 'Day-to-Night Touch-Up Concierge',
          description: 'Optional artist retention through post-ceremony portraits and reception entrance for second-look styling.'
        }
      ]
    },
    reviews: [
      {
        quote: 'Glitz & Glamour styled my wedding at The Darlington House. They were so professional, calm, and talented. My makeup looked radiant all evening without needing a single touch-up!',
        author: 'Caroline S.',
        venue: 'The Darlington House',
        role: 'La Jolla Bride',
        rating: 5
      },
      {
        quote: 'The best wedding hair and makeup team in San Diego! My hair held up against the breezy ocean air at Scripps Seaside Forum without feeling stiff or crunchy.',
        author: 'Danielle P.',
        venue: 'Scripps Seaside Forum',
        role: 'La Jolla Bride',
        rating: 5
      }
    ],
    faqs: [
      {
        question: 'Do you travel to La Jolla private estates and wedding venues?',
        answer: 'Yes! Our mobile bridal team travels directly to all La Jolla venues including The Darlington House, Scripps Seaside Forum, Estancia La Jolla, and private oceanfront rentals.'
      },
      {
        question: 'Where do we perform the bridal trial?',
        answer: 'Preview trials take place at our flagship studio at 935 W San Marcos Blvd, Suite 101 in San Marcos, where we have private bridal suites, daylight-balanced lighting, and full nail, hair color, and facial services.'
      },
      {
        question: 'How do you price wedding hair and makeup for La Jolla weddings?',
        answer: 'We provide itemized custom quotes based on your party size, date, travel, and whether you require artist retention for evening reception changes. Contact us to receive your personalized quote.'
      }
    ],
    geo: {
      latitude: 32.8328,
      longitude: -117.2713,
      radiusMiles: 25
    }
  },

  'san-diego-ca': {
    slug: 'san-diego-ca',
    city: 'San Diego',
    state: 'CA',
    region: 'San Diego County',
    tagBadge: 'Premier Regional Bridal Authority & Mobile Glam Squad',
    heroTitle: 'Wedding Hair and Makeup San Diego, CA | Bridal Makeup Artist & Stylist',
    metaTitle: 'Wedding Hair & Makeup San Diego CA | Glitz & Glamour Studio',
    metaDescription:
      'Premier bridal hair and makeup artist in San Diego, CA. Top-rated wedding HMUA team for bridal parties, studio trials & mobile glam. Request a quote!',
    keywords: [
      'wedding hair and makeup san diego',
      'bridal hair and makeup san diego',
      'hair and makeup san diego',
      'makeup artist san diego',
      'makeup artist in san diego ca',
      'hair and makeup wedding san diego',
      'wedding makeup artist san diego',
      'bridal hair and makeup san diego ca',
      'wedding hairstyles in san diego'
    ],
    heroImage: '/special-events/ev-weddings.png',
    heroTagline:
      'County-wide bridal luxury: on-location glam squads serving Downtown, Balboa Park, Coronado, Point Loma, and all of San Diego.',
    distanceFromStudio: 'Serving all San Diego County',
    travelTimeSnippet: 'Mobile glam team dispatched county-wide • Flagship Studio HQ in San Marcos',
    introParagraphs: [
      'From the iconic Spanish arches of The Prado at Balboa Park to oceanfront majesty at Hotel del Coronado and the trendy urban warehouses of Downtown’s Gaslamp Quarter, San Diego is one of the premier wedding destinations in the world. At Glitz & Glamour Studio, we deliver elite-tier bridal hair and makeup artistry directly to brides and bridal parties across the entire San Diego metropolitan area.',
      'Our team is celebrated for crafting natural, luminous skin, timeless bridal updos, romantic bohemian half-up braids, and sleek red-carpet Hollywood waves. Plus, our flagship North County studio at 935 W San Marcos Blvd, Suite 101 serves as a full-service pre-wedding beauty hub where brides book their preview trials alongside Apres Gel-X nails, detox pedicures, dimensional balayage, custom facials, and waxing.',
      'Rather than using rigid package pricing that ignores your specific timeline and party requirements, we provide customized, itemized proposals. Discover why hundreds of Southern California brides trust Glitz & Glamour as their dedicated wedding HMUA team.'
    ],
    valueProps: [
      {
        title: 'Premier San Diego Bridal Authority',
        description: 'Years of expertise styling diverse hair textures, skin tones, and multicultural weddings across San Diego County.'
      },
      {
        title: 'Full Mobile Glam Squad',
        description: 'Multiple master artists equipped with ring lights, director chairs, and pro kits travel to your hotel or venue anywhere in the county.'
      },
      {
        title: 'Camera-Tested Waterproof Beauty',
        description: 'Airbrush cosmetics and thermal hair setting guaranteed to look flawless in direct California sunshine and under high-def cameras.'
      },
      {
        title: 'One-Stop Pre-Wedding Beauty Studio',
        description: 'Visit our North County flagship salon for bridal trials, wedding Gel-X nails, spa pedicures, balayage, facials, and waxing.'
      }
    ],
    venues: [
      {
        name: 'The Prado at Balboa Park',
        type: 'Historic Spanish Colonial Landmark',
        neighborhood: 'Balboa Park, Central San Diego',
        description: 'Historic Spanish architecture, courtyard fountains, lush garden terraces, and romantic grand ballrooms.',
        hmuaTip: 'Dramatic architectural backdrops look magnificent with classic polished updos, defined lash lines, and luminous satin complexion finishes.'
      },
      {
        name: 'Hotel del Coronado',
        type: 'Victorian Oceanfront Luxury Resort',
        neighborhood: 'Coronado Island',
        description: 'World-famous Victorian beachfront elegance, white sand ceremony lawns, and grand crystal chandeliers.',
        hmuaTip: 'Beachfront sea breezes require structured hair anchoring and waterproof eye makeup for emotional ocean vows.'
      },
      {
        name: 'Rancho Bernardo Inn',
        type: 'Rustic Luxury Resort & Golf Spa',
        neighborhood: 'Rancho Bernardo, North San Diego',
        description: 'Spanish tile walkways, historic olive trees, sunken gardens, and secluded bridal prep villas.',
        hmuaTip: 'Warm garden sunlight calls for golden champagne highlights and soft, touchable textured waves.'
      },
      {
        name: 'Brick at Liberty Station',
        type: 'Industrial Modern Urban Venue',
        neighborhood: 'Point Loma, San Diego',
        description: 'Historic red brick walls, market string lights, and expansive open-format urban spaces.',
        hmuaTip: 'Modern brick venues pair stunningly with bold lip colors, modern Hollywood waves, and architectural hair accessories.'
      }
    ],
    servicesProvided: [
      {
        title: 'On-Location Bridal Hair & Makeup',
        description: 'The complete bridal package brought to your San Diego suite: skin prep, luxury airbrush makeup, individual lashes, and couture hair design with veil placement.',
        deliverables: ['Custom botanical skin prep & depuffing', '16-hour waterproof airbrush foundation', 'Customized lash architecture', 'Veil & hair piece placement', 'Deluxe bridal touch-up kit']
      },
      {
        title: 'Bridal Party & Bridesmaid Glam Squad',
        description: 'Full hair and makeup services for your bridesmaids, maid of honor, and mothers, coordinated to ensure everyone looks and feels incredible.',
        deliverables: ['Custom updos, half-up styles, or blowouts', 'Full-face camera-ready makeup with lashes', 'Cohesive look matching wedding palette', 'Strict timeline adherence']
      },
      {
        title: 'In-Studio Trials, Nails, Hair & Facials',
        description: 'Visit our flagship North County studio to design your bridal aesthetic and complete your wedding week nails, hair color, and skincare.',
        deliverables: ['Comprehensive bridal hair & makeup trial', 'Wedding Gel-X extensions & spa pedicures', 'Balayage, glossing & keratin smoothing', 'Hydrating glow facials & brow waxing']
      }
    ],
    pricingGuide: {
      heading: 'San Diego Wedding Hair and Makeup Pricing & Custom Quotes',
      subheading: 'Clear, Transparent Proposals Built Around Your Exact Needs',
      explanation: 'Search terms like "hair and makeup san diego prices" and "bridal hair prices" often lead to rigid menus that do not fit real wedding mornings. We provide itemized custom quotes that detail exactly what goes into your bridal beauty investment.',
      drivers: [
        {
          title: 'Bridal Party Headcount',
          description: 'Determines the number of senior artists required to complete hair and makeup on schedule without early morning stress.'
        },
        {
          title: 'Trial Consultation Choice',
          description: 'Whether you complete a full in-studio preview trial at our North County salon or book on-site wedding day artistry only.'
        },
        {
          title: 'Getting-Ready Location & Travel',
          description: 'Travel to Downtown San Diego, Coronado, Point Loma, La Jolla, or East County venues.'
        },
        {
          title: 'Extended Artist Standby',
          description: 'Optional hourly artist retention for post-ceremony touch-ups and look transitions before your grand entrance.'
        }
      ]
    },
    reviews: [
      {
        quote: 'Glitz & Glamour handled hair and makeup for our wedding at The Prado. With 8 bridesmaids and two moms, they finished 30 minutes ahead of schedule and everyone was obsessed with their looks!',
        author: 'Megan B.',
        venue: 'The Prado at Balboa Park',
        role: 'San Diego Bride',
        rating: 5
      },
      {
        quote: 'They traveled to our bridal suite on Coronado Island. Our makeup held up through ocean winds, emotional vows, and a long night of dancing. Truly the best bridal team in San Diego!',
        author: 'Lauren K.',
        venue: 'Hotel del Coronado',
        role: 'San Diego Bride',
        rating: 5
      }
    ],
    faqs: [
      {
        question: 'Do your hair and makeup artists travel anywhere in San Diego County?',
        answer: 'Yes! Our on-location bridal team travels throughout the entire county, including Downtown San Diego, Balboa Park, Coronado Island, Point Loma, La Jolla, Del Mar, and North County.'
      },
      {
        question: 'How do you calculate wedding hair and makeup prices in San Diego?',
        answer: 'We provide itemized custom quotes based on the size of your bridal party, getting-ready location, and timing requirements. This ensures you only pay for what your party actually needs.'
      },
      {
        question: 'When should I schedule my bridal hair and makeup trial?',
        answer: 'We recommend scheduling your bridal preview trial 2 to 4 months before your wedding day at our San Marcos flagship studio, ideally timed with a dress fitting or engagement photo shoot.'
      },
      {
        question: 'Can you accommodate large bridal parties of 8 to 12+ people?',
        answer: 'Absolutely. We dispatch multiple experienced lead artists to ensure every guest receives attentive, unhurried glam while keeping your morning on schedule.'
      }
    ],
    geo: {
      latitude: 32.7157,
      longitude: -117.1611,
      radiusMiles: 35
    }
  },

  'escondido-ca': {
    slug: 'escondido-ca',
    city: 'Escondido',
    state: 'CA',
    region: 'North County Inland',
    tagBadge: 'Only 8–10 Mins West • Vineyard Bridal & Flagship Salon',
    heroTitle: 'Premier Nail Salon, Hair Color & Bridal Artistry Near Escondido, CA',
    metaTitle: 'Nail, Hair & Bridal Salon Near Escondido CA | Glitz Studio',
    metaDescription:
      'Luxury nail salon (Gel-X, acrylics, pedicures), balayage, facials & bridal hair and makeup 8 mins from Escondido at 935 W San Marcos Blvd. Book online!',
    keywords: [
      'nail salon near escondido ca',
      'hair salon escondido ca',
      'balayage escondido ca',
      'gel x nails escondido',
      'pedicure near escondido ca',
      'facials escondido ca',
      'wedding hair and makeup escondido ca',
      'orfila winery wedding hair makeup',
      'quinceanera hair and makeup escondido',
      'bridal makeup artist escondido'
    ],
    heroImage: '/special-events/ev-weddings.png',
    heroTagline:
      'Just 8–10 minutes west of Escondido for luxury Gel-X nails, detox pedicures, balayage, facials, waxing, and on-site vineyard wedding & quinceañera glam.',
    distanceFromStudio: '8–10 Minutes East via CA-78',
    travelTimeSnippet: '8–10 mins via CA-78 or Mission Rd • Fast mobile dispatch to San Pasqual Valley wineries',
    introParagraphs: [
      'Located just 8 to 10 minutes west of Escondido at 935 W San Marcos Blvd, Suite 101, Glitz & Glamour Studio is the preferred full-service beauty destination for Escondido residents, brides, and quinceañera families. A quick drive down CA-78 or Mission Road brings you directly to our luxury San Marcos studio, where master artist JoJany and our team deliver precision Apres Gel-X extensions, sculpted acrylics, structure gel manicures, detox pedicures, custom lived-in balayage, haircuts, facials, and full-body waxing.',
      'Escondido and the scenic San Pasqual Valley are home to some of Southern California’s most breathtaking winery and ranch wedding venues. Whether you are exchanging vows among the grapevines at Orfila Vineyards & Winery, celebrating on the sunlit hillside terrace of Cordiano Winery, or hosting a grand celebration at Rancho Guejito Vineyard, our mobile bridal hair and makeup squad brings studio-caliber lighting and heat-resistant artistry directly to your bridal suite.',
      'We also specialize in unforgettable Quinceañera hair, makeup, and nail packages for Escondido families—coordinating crown and tiara anchoring, court of honor styling, and dazzling custom nail sets so the birthday queen shines from mass to the final waltz.'
    ],
    valueProps: [
      {
        title: 'Just 8–10 Minutes from Escondido',
        description: 'Conveniently located at 935 W San Marcos Blvd, Suite 101—right off CA-78 with effortless parking for your regular nail, hair, and facial appointments.'
      },
      {
        title: 'San Pasqual Winery Wedding Specialists',
        description: 'Engineered for inland valley warmth with sweat-proof airbrush foundations and structured updos that stay flawless through vineyard golden hour.'
      },
      {
        title: 'Full Nail, Hair Color & Skincare Menu',
        description: 'Enjoy Gel-X extensions, acrylics, detox pedicures, dimensional balayage, keratin smoothing, deep-cleansing facials, and gentle waxing.'
      },
      {
        title: 'Bilingual Bridal & Quinceañera Experts',
        description: 'Warm, bilingual hospitality with custom packages for Escondido weddings, traditional quinceañeras, proms, and family celebrations.'
      }
    ],
    venues: [
      {
        name: 'Orfila Vineyards & Winery',
        type: 'Romantic Vineyard & Tasting Estate',
        neighborhood: 'San Pasqual Valley, Escondido',
        description: 'Lush rolling grapevine hills, rose-lined pergolas, Italianate fountains, and grand tented pavilion receptions.',
        hmuaTip: 'Warm inland valley afternoons call for our oil-controlling primers, waterproof airbrush base, and humidity-locked romantic curls.'
      },
      {
        name: 'Cordiano Winery',
        type: 'Hillside Panoramic Winery',
        neighborhood: 'Highland Valley, Escondido',
        description: 'Perched high on a rocky ridge offering sweeping 180-degree sunset views over the San Pasqual mountains and vineyards.',
        hmuaTip: 'Dramatic cliffside sunset portraits look incredible with warm bronze smoky eyes, luminous highlighter, and wind-secured half-up styles.'
      },
      {
        name: 'Rancho Guejito Vineyard',
        type: 'Historic Mexican Land Grant & Vineyard',
        neighborhood: 'East Escondido Valley',
        description: 'Expansive historic ranchlands, towering palms, vineyard rows, and rustic-luxe outdoor celebration spaces.',
        hmuaTip: 'All-outdoor ranch days benefit from featherlight HD makeup that breathes in the sun and intricately pinned boho braids.'
      },
      {
        name: 'Daley Ranch & Resort Estates',
        type: 'Historic Conservation Ranch & Lodge',
        neighborhood: 'North Escondido',
        description: 'Scenic oak woodlands, rustic lodge architecture, and tranquil natural backdrops for intimate North County weddings.',
        hmuaTip: 'Earthy, natural surroundings pair beautifully with soft-focus satin skin, defined brows, and textured low chignons.'
      }
    ],
    servicesProvided: [
      {
        title: 'Luxury Nails, Gel-X & Spa Pedicures',
        description: 'Escondido clients love our clean, relaxing studio for durable Gel-X extensions, sculpted acrylics, builder gel, and soothing detox pedicures.',
        deliverables: ['Apres Gel-X extensions & custom nail art', 'Acrylic full sets & precision fills', 'Structure / builder gel natural nail overlays', 'Classic foot soak, detox & gel pedicures', 'Strict autoclave tool sterilization']
      },
      {
        title: 'Balayage, Haircuts, Facials & Waxing',
        description: 'Transform your hair and skin just minutes from Escondido with custom dimensional color, precision cuts, and corrective facials.',
        deliverables: ['Hand-painted balayage & foil highlights', 'Women’s haircuts, blowouts & men’s fades', 'Keratin frizz-control smoothing treatments', 'Deep-cleansing extraction & glow facials', 'Brazilian waxing, brow shaping & lash lifts']
      },
      {
        title: 'Vineyard Bridal & Quinceañera Glam',
        description: 'On-location wedding hair and makeup across Escondido wineries plus in-studio trials and complete quinceañera styling.',
        deliverables: ['Heat-resistant airbrush bridal makeup', 'Custom bridal updos & Hollywood waves', 'Quinceañera tiara & hair piece anchoring', 'Bridesmaid, damas & mother styling', 'Full-day touch-up kit included']
      }
    ],
    pricingGuide: {
      heading: 'Escondido Salon & Bridal Pricing Guide',
      subheading: 'Everyday Luxury Salon Rates & Custom Winery Wedding Quotes',
      explanation: 'Whether you are driving 8 minutes from Escondido for a $60+ Gel-X set, $55+ haircut, or $190+ balayage, our studio menu is transparent and easy to book online. For Escondido weddings and quinceañeras, we provide custom itemized quotes with minimal local travel fees.',
      drivers: [
        {
          title: 'Party Size & Artist Count',
          description: 'We match the number of senior stylists to your bridal party or quinceañera court so everyone finishes right on time.'
        },
        {
          title: 'In-Studio Trial & Nail/Hair Prep',
          description: 'Visit our nearby San Marcos salon for your bridal preview trial, wedding Gel-X nails, hair gloss, and hydrating facial.'
        },
        {
          title: 'Winery & Ranch Location',
          description: 'Only 8–15 minutes from San Marcos HQ to Escondido and San Pasqual Valley venues, keeping travel logistics simple and affordable.'
        },
        {
          title: 'Crown, Veil & Extension Styling',
          description: 'Expert installation of clip-in extensions, cathedral veils, fresh vineyard florals, or quinceañera crowns.'
        }
      ]
    },
    reviews: [
      {
        quote: 'Glitz & Glamour came out to Orfila Winery for our wedding and did an incredible job! Even in 85-degree vineyard weather, my makeup and curls didn’t budge all night.',
        author: 'Valeria G.',
        venue: 'Orfila Vineyards & Winery',
        role: 'Escondido Bride',
        rating: 5
      },
      {
        quote: 'I drive 8 minutes from Escondido every three weeks for my Gel-X nails, pedicures, and balayage with JoJany. Best salon in North County by far!',
        author: 'Brianna L.',
        venue: 'San Marcos Flagship Studio',
        role: 'Escondido Salon Client',
        rating: 5
      }
    ],
    faqs: [
      {
        question: 'How far is Glitz & Glamour Studio from Escondido?',
        answer: 'Our flagship salon at 935 W San Marcos Blvd, Suite 101 in San Marcos is just 8 to 10 minutes west of Escondido via CA-78 W or W Mission Rd, with free parking right outside the door.'
      },
      {
        question: 'Do you travel to Escondido wineries like Orfila and Cordiano for weddings?',
        answer: 'Yes! Our mobile bridal hair and makeup team regularly travels to Orfila Vineyards, Cordiano Winery, Rancho Guejito, Daley Ranch, and private estates across Escondido.'
      },
      {
        question: 'Do you offer Quinceañera hair, makeup, and nail packages for Escondido families?',
        answer: 'Absolutely! We love styling Escondido quinceañeras—including crown placement, long-wear airbrush makeup, court of honor hair and makeup, and custom Gel-X or acrylic nail sets.'
      },
      {
        question: 'Can Escondido residents book regular nail, hair, and facial appointments online?',
        answer: 'Yes! You can book Gel-X nails, acrylics, pedicures, balayage, haircuts, facials, and waxing 24/7 through our online booking page or by calling (760) 290-5910.'
      }
    ],
    geo: {
      latitude: 33.1192,
      longitude: -117.0864,
      radiusMiles: 20
    }
  },

  'oceanside-ca': {
    slug: 'oceanside-ca',
    city: 'Oceanside',
    state: 'CA',
    region: 'Coastal North County',
    tagBadge: 'Coastal Beachfront Bridal & Full-Service North County Salon',
    heroTitle: 'Premier Nail Salon, Hair Color & Bridal Artistry Serving Oceanside, CA',
    metaTitle: 'Nail, Hair & Bridal Salon Near Oceanside CA | Glitz Studio',
    metaDescription:
      'Luxury nail salon (Gel-X, acrylics, pedicures), balayage, facials & coastal bridal hair and makeup serving Oceanside, CA—15 mins away in San Marcos!',
    keywords: [
      'nail salon near oceanside ca',
      'hair salon near oceanside ca',
      'balayage oceanside ca',
      'gel x nails oceanside',
      'wedding hair and makeup oceanside ca',
      'mission pacific wedding hair makeup',
      'the seabird resort bridal makeup',
      'bridal makeup artist oceanside ca',
      'pedicure near oceanside ca'
    ],
    heroImage: '/special-events/ev-weddings.png',
    heroTagline:
      'Coastal wind-proof bridal glam for Oceanside beachfront resorts plus flagship Gel-X nails, balayage, facials, and waxing just 15 minutes east.',
    distanceFromStudio: '15 Minutes West via CA-78',
    travelTimeSnippet: '15 mins via CA-78 • Direct on-location mobile glam to Oceanside pier & beachfront hotels',
    introParagraphs: [
      'Oceanside, California has transformed into one of Southern California’s most vibrant coastal wedding and lifestyle destinations—anchored by chic oceanfront resorts like Mission Pacific Beach Resort and The Seabird Ocean Resort & Spa, lush fairways at Arrowood Golf Course, and charming historic venues. Glitz & Glamour Studio proudly serves Oceanside residents and brides with both on-location coastal bridal artistry and our full-service flagship salon just 15 minutes east via CA-78 at 935 W San Marcos Blvd, Suite 101.',
      'For everyday beauty, Oceanside clients make the quick trip to our San Marcos studio for long-lasting Apres Gel-X extensions, sculpted acrylics, builder gel manicures, detox pedicures, sun-kissed coastal balayage, keratin smoothing treatments, hydrating glow facials, and Brazilian waxing.',
      'On your wedding day, our mobile HMUA team arrives directly at your Oceanside beachfront hotel suite or private coastal rental. We specialize in marine-layer and ocean-wind defense—using thermal anti-humidity hair sealants and waterproof airbrush foundations so your glam stays picture-perfect from breezy pier portraits to your late-night reception.'
    ],
    valueProps: [
      {
        title: 'Ocean-Breeze & Humidity Proof Artistry',
        description: 'Specialized coastal hair anchoring and waterproof airbrush skin prep engineered for Oceanside Pier winds and beachside vows.'
      },
      {
        title: 'Experienced at Mission Pacific & The Seabird',
        description: 'Seamless morning setup and familiarity with Oceanside’s premier oceanfront hotels, rooftop terraces, and golf clubs.'
      },
      {
        title: 'Only 15 Minutes East via CA-78',
        description: 'Easy highway access to our San Marcos flagship salon for Gel-X nails, spa pedicures, lived-in blonde balayage, facials, and waxing.'
      },
      {
        title: 'Custom Group & Bridal Party Quotes',
        description: 'Transparent, itemized proposals tailored to your exact bridal party headcount, timeline, and coastal getting-ready suite.'
      }
    ],
    venues: [
      {
        name: 'Mission Pacific Beach Resort',
        type: 'Modern Rooftop & Oceanfront Boutique Hotel',
        neighborhood: 'Downtown Oceanside Pier',
        description: 'Chic coastal architecture, ocean-view rooftop terraces, and contemporary ballrooms overlooking the iconic Oceanside Pier.',
        hmuaTip: 'Open-air ocean rooftops demand hidden structural pinning and flexible-hold anti-humidity sprays that keep Hollywood waves intact.'
      },
      {
        name: 'The Seabird Ocean Resort & Spa',
        type: 'Classic Coastal Luxury Resort',
        neighborhood: 'Oceanside Strand',
        description: 'Timeless seaside sophistication, grand ocean-view salons, and breezy veranda ceremony spaces steps from the sand.',
        hmuaTip: 'Bright coastal daylight pairs gorgeously with luminous satin airbrush foundation, soft peach blush, andwispy individual lashes.'
      },
      {
        name: 'Arrowood Golf Course',
        type: 'Championship Fairway & Sunset Terrace',
        neighborhood: 'Morro Hills / East Oceanside',
        description: 'Rolling hills, panoramic valley vistas, and elegant garden pergolas tucked away in Oceanside’s scenic agricultural hills.',
        hmuaTip: 'Golden hour hill portraits shine with warm champagne eye shimmer and touchable, voluminous half-up bridal curls.'
      },
      {
        name: 'Heritage Park Village & Museum',
        type: 'Historic Victorian Garden Venue',
        neighborhood: 'San Luis Rey, Oceanside',
        description: 'Charming 19th-century Victorian buildings, white gazebos, and shaded pepper trees offering vintage California romance.',
        hmuaTip: 'Vintage garden settings pair effortlessly with classic low chignons, pearl hair pins, and timeless rose-toned lip color.'
      }
    ],
    servicesProvided: [
      {
        title: 'Oceanside Beachfront Bridal Hair & Makeup',
        description: 'Full on-location bridal hair and makeup delivered to your Oceanside hotel suite or vacation rental with 16-hour coastal hold.',
        deliverables: ['Marine-layer resistant skin prep & airbrush base', 'Wind-proof bridal updos, braids, or waves', 'Custom lash cluster design', 'Veil & coastal floral hair placement', 'Emergency bridal touch-up kit']
      },
      {
        title: 'Bridal Party & VIP Guest Styling',
        description: 'Coordinated, camera-ready hair and makeup for bridesmaids, mothers of the bride and groom, and flower girls.',
        deliverables: ['Custom beach waves, half-up, or formal updos', 'Waterproof full-face makeup with lashes', 'Harmonized coastal color palette', 'Relaxed, on-schedule morning flow']
      },
      {
        title: 'Flagship Salon Nails, Balayage & Facials',
        description: 'Just 15 minutes from Oceanside at 935 W San Marcos Blvd, enjoy our full everyday salon menu and private bridal trial suites.',
        deliverables: ['Apres Gel-X, acrylic sets & detox pedicures', 'Coastal blonde balayage, highlights & keratin', 'Women’s & men’s haircuts and blowouts', 'Deep-cleansing facials, lash lifts & waxing']
      }
    ],
    pricingGuide: {
      heading: 'Oceanside Salon & Wedding Pricing Guide',
      subheading: 'Honest Everyday Salon Pricing & Custom Coastal Bridal Proposals',
      explanation: 'Oceanside clients visit our nearby San Marcos salon for everyday luxury—like $40+ detox pedicures, $60+ Gel-X extensions, and $190+ dimensional balayage. For Oceanside weddings, we provide itemized custom quotes tailored to your beachfront venue and party size.',
      drivers: [
        {
          title: 'Bridal Party Headcount',
          description: 'Determines the number of senior stylists dispatched to your Oceanside suite so everyone is ready on time for first-look photos.'
        },
        {
          title: 'In-Studio Trial & Pre-Wedding Beauty',
          description: 'Schedule your preview trial, wedding Gel-X nails, pedicure, and hydrating facial 15 minutes away at our San Marcos flagship.'
        },
        {
          title: 'Resort & Beachfront Logistics',
          description: 'Seamless travel and mobile lighting setup at Mission Pacific, The Seabird, Arrowood, or coastal vacation rentals.'
        },
        {
          title: 'Touch-Up & Second-Look Standby',
          description: 'Optional artist retention to transition your hair and makeup from a breezy beach ceremony to an indoor reception.'
        }
      ]
    },
    reviews: [
      {
        quote: 'We got ready at The Seabird Resort in Oceanside and Glitz & Glamour was incredible! Even after taking photos right on the windy pier, my hair and airbrush makeup looked flawless.',
        author: 'Hannah D.',
        venue: 'The Seabird Ocean Resort',
        role: 'Oceanside Bride',
        rating: 5
      },
      {
        quote: 'It’s only a 15-minute drive from South O to their salon in San Marcos, and it’s 100% worth it for their Gel-X nails, detox pedicures, and blonde balayage!',
        author: 'Kelsey M.',
        venue: 'San Marcos Flagship Studio',
        role: 'Oceanside Salon Client',
        rating: 5
      }
    ],
    faqs: [
      {
        question: 'Do you travel to Oceanside beachfront hotels like Mission Pacific and The Seabird?',
        answer: 'Yes! Our mobile bridal glam squad travels directly to Mission Pacific Beach Resort, The Seabird Ocean Resort & Spa, Arrowood Golf Course, and beachfront Airbnbs across Oceanside.'
      },
      {
        question: 'How far is your salon from Oceanside for nails, hair color, and facials?',
        answer: 'Our flagship studio at 935 W San Marcos Blvd, Suite 101 in San Marcos is just 15 minutes east of Oceanside via CA-78 E, with convenient free parking.'
      },
      {
        question: 'How do you keep wedding hair and makeup intact in Oceanside beach wind?',
        answer: 'We use thermal humidity-blocking primers, structural hidden pinning, and waterproof silicone airbrush foundations specifically chosen to withstand Pacific breezes and coastal mist.'
      },
      {
        question: 'How can I book a salon appointment or request an Oceanside wedding quote?',
        answer: 'Click "Book Now" to schedule in-studio nails, hair, facials, or waxing online, or use our "Request Custom Quote" button to receive an itemized bridal proposal within 24–48 hours.'
      }
    ],
    geo: {
      latitude: 33.1959,
      longitude: -117.3795,
      radiusMiles: 20
    }
  },

  'encinitas-ca': {
    slug: 'encinitas-ca',
    city: 'Encinitas',
    state: 'CA',
    region: 'Coastal North County',
    tagBadge: 'Botanic & Coastal Luxury Bridal + Flagship Salon',
    heroTitle: 'Premier Nail Salon, Hair Color & Bridal Artistry Serving Encinitas, CA',
    metaTitle: 'Nail, Hair & Bridal Salon Near Encinitas CA | Glitz Studio',
    metaDescription:
      'Premier nail salon (Gel-X, builder gel, pedicures), custom balayage, facials & bridal HMUA serving Encinitas, CA—just 14 mins via Rancho Santa Fe Rd.',
    keywords: [
      'nail salon near encinitas ca',
      'hair salon near encinitas ca',
      'balayage encinitas ca',
      'builder gel nails encinitas',
      'wedding hair and makeup encinitas ca',
      'san diego botanic garden wedding makeup',
      'alila marea wedding hair and makeup',
      'bridal makeup artist encinitas ca',
      'facials near encinitas ca'
    ],
    heroImage: '/special-events/ev-weddings.png',
    heroTagline:
      'Effortless coastal-luxe bridal beauty for Encinitas bluff & garden venues, plus flagship Gel-X nails, structure gel, balayage, and facials just 14 minutes inland.',
    distanceFromStudio: '14 Minutes via Rancho Santa Fe Rd',
    travelTimeSnippet: '14 mins via Rancho Santa Fe Rd • Direct mobile bridal dispatch to Encinitas & Leucadia',
    introParagraphs: [
      'From the lush subtropical rainforest pathways of the San Diego Botanic Garden to the dramatic oceanfront bluffs of Alila Marea Beach Resort in Leucadia and the rustic charm of Olivenhain, Encinitas embodies effortless coastal sophistication. Glitz & Glamour Studio serves Encinitas brides and residents with both elevated on-location wedding hair and makeup and a full-service flagship salon just 14 minutes away via Rancho Santa Fe Road at 935 W San Marcos Blvd, Suite 101.',
      'Many Encinitas, Leucadia, Cardiff, and Olivenhain residents choose our San Marcos studio for their ongoing beauty rituals—loving our meticulous Structure / Builder Gel (BIAB) overlays, Apres Gel-X extensions, detox foot soaks, lived-in sun-kissed balayage, keratin smoothing treatments, hydrating glow facials, and brow sculpting without coastal congestion or steep parking fees.',
      'For Encinitas weddings, our mobile bridal team arrives at your resort suite or private coastal estate to craft luminous, skin-first makeup and touchable, wind-resistant hairstyles that harmonize naturally with Encinitas’s golden coastal light.'
    ],
    valueProps: [
      {
        title: '14 Minutes via Scenic Rancho Santa Fe Rd',
        description: 'A quick, direct drive from Encinitas and Olivenhain to our San Marcos studio with complimentary doorstep parking.'
      },
      {
        title: 'Elevated Coastal & Editorial Aesthetic',
        description: 'Specializing in luminous "lit-from-within" skin, feathered brows, lived-in dimensional blondes, and effortless boho-luxe bridal hair.'
      },
      {
        title: 'Botanic Garden & Bluff Venue Expertise',
        description: 'Formulated for both the lush subtropical humidity of San Diego Botanic Garden and the ocean breezes of Alila Marea.'
      },
      {
        title: 'Clean Luxury Nails, Hair & Skincare',
        description: 'Structure builder gel, Gel-X extensions, detox pedicures, bond-protecting balayage, and botanical facials under one roof.'
      }
    ],
    venues: [
      {
        name: 'San Diego Botanic Garden',
        type: '37-Acre Subtropical Botanical Sanctuary',
        neighborhood: 'Quail Gardens, Encinitas',
        description: 'Bamboo groves, succulent gardens, ocean-view amphitheaters, and glass conservatory pavilions surrounded by exotic flora.',
        hmuaTip: 'Botanical garden microclimates call for breathable waterproof airbrush skin prep and humidity-sealed romantic braids or updos.'
      },
      {
        name: 'Alila Marea Beach Resort',
        type: 'Five-Star Oceanfront Bluff Resort',
        neighborhood: 'Leucadia / Ponto Beach, Encinitas',
        description: 'Dramatic coastal bluff architecture, panoramic Pacific Ocean terraces, and ultra-luxury oceanfront bridal suites.',
        hmuaTip: 'Cliffside ocean breezes pair beautifully with sculpted modern Hollywood waves anchored with invisible structural pins.'
      },
      {
        name: 'Olivenhain Meeting Hall & Estates',
        type: 'Historic Eucalyptus Grove & Rustic Hall',
        neighborhood: 'Olivenhain, Encinitas',
        description: 'A beloved 1895 historic hall nestled beneath towering eucalyptus trees with fairy-lit outdoor decks and equestrian charm.',
        hmuaTip: 'Dappled forest light looks magical with warm champagne eye tones, rosy cheeks, and loose, organic half-up curls.'
      },
      {
        name: 'La Paloma & Coastal Villas',
        type: 'Historic Coastal Village & Private Estates',
        neighborhood: 'Downtown Encinitas / Cardiff',
        description: 'Iconic coastal landmarks, ocean-view rooftop receptions, and private blufftop estates overlooking Swami’s and Cardiff Reef.',
        hmuaTip: 'Golden hour surfside portraits shine with zero-flashback HD finishing powder and long-wear satin lip stains.'
      }
    ],
    servicesProvided: [
      {
        title: 'Couture Coastal Bridal Hair & Makeup',
        description: 'Bespoke on-location wedding hair and makeup for Encinitas brides featuring luminous skin prep, custom lashes, and effortless coastal styling.',
        deliverables: ['Botanical hydration & airbrush or HD foundation', 'Custom individual lash mapping', 'Boho-luxe braids, updos, or coastal waves', 'Veil & fresh floral hair placement', 'Full-day bridal touch-up kit']
      },
      {
        title: 'Bridal Party & VIP Attendant Glam',
        description: 'Cohesive, natural-glam hair and makeup for bridesmaids, mothers of the bride and groom, and wedding guests.',
        deliverables: ['Textured updos, blowouts, or beach waves', 'Luminous waterproof makeup with lashes', 'Tailored to flatter every skin tone & age', 'Calm, punctual morning timeline']
      },
      {
        title: 'Structure Gel Nails, Balayage & Facials',
        description: 'Just 14 minutes up Rancho Santa Fe Rd, visit our flagship studio for everyday clean nail care, dimensional hair color, and skincare.',
        deliverables: ['Structure / builder gel (BIAB) & Gel-X nails', 'Detox foot soaks & gel pedicures', 'Lived-in coastal balayage & glossing', 'Hydrating glow facials, lash lifts & waxing']
      }
    ],
    pricingGuide: {
      heading: 'Encinitas Salon & Wedding Pricing Guide',
      subheading: 'Transparent Studio Menu & Bespoke Encinitas Bridal Proposals',
      explanation: 'Encinitas residents love visiting our nearby San Marcos salon for $55+ Structure Gel manicures, $40+ detox pedicures, and $190+ custom balayage. For Encinitas weddings at Alila Marea, San Diego Botanic Garden, or private estates, we craft itemized custom proposals.',
      drivers: [
        {
          title: 'Bridal Party Headcount',
          description: 'Determines the number of senior stylists dispatched to your Encinitas suite for an unhurried, champagne-filled morning.'
        },
        {
          title: 'In-Studio Trial & Pre-Wedding Glow',
          description: 'Book your bridal trial alongside a hydrating glow facial, Structure Gel manicure, and hair gloss 14 minutes away in San Marcos.'
        },
        {
          title: 'Coastal Resort or Estate Setup',
          description: 'Direct mobile travel with professional daylight lighting to Leucadia, Cardiff, Olivenhain, and Encinitas venues.'
        },
        {
          title: 'Ceremony-to-Reception Transitions',
          description: 'Optional on-site artist standby for blufftop wind touch-ups and evening reception hair changes.'
        }
      ]
    },
    reviews: [
      {
        quote: 'Glitz & Glamour styled my bridal party for our San Diego Botanic Garden wedding. Everyone looked so naturally glowing and effortless—never cakey or overdone!',
        author: 'Chloe R.',
        venue: 'San Diego Botanic Garden',
        role: 'Encinitas Bride',
        rating: 5
      },
      {
        quote: 'Just a 14-minute drive up Rancho Santa Fe Rd from Encinitas! I come here for my builder gel nails, detox pedicures, and blonde balayage. So much easier to park and relax.',
        author: 'Sienna T.',
        venue: 'San Marcos Flagship Studio',
        role: 'Encinitas Salon Client',
        rating: 5
      }
    ],
    faqs: [
      {
        question: 'How far is Glitz & Glamour Studio from Encinitas and Olivenhain?',
        answer: 'Our flagship salon at 935 W San Marcos Blvd, Suite 101 in San Marcos is just 14 minutes northeast of Encinitas and Olivenhain via Rancho Santa Fe Rd, with plenty of free doorstep parking.'
      },
      {
        question: 'Do you travel to Alila Marea and San Diego Botanic Garden for weddings?',
        answer: 'Yes! Our mobile bridal hair and makeup team regularly travels to Alila Marea Beach Resort, San Diego Botanic Garden, Olivenhain Meeting Hall, and private coastal estates across Encinitas, Leucadia, and Cardiff.'
      },
      {
        question: 'Do you offer Structure / Builder Gel (BIAB) and Gel-X nails for Encinitas clients?',
        answer: 'Yes! Structure Gel (builder gel) overlays and Apres Gel-X extensions are two of our most popular nail services for Encinitas clients seeking strong, natural-looking nails, paired with our detox pedicures.'
      },
      {
        question: 'How do I book an in-studio appointment or request an Encinitas bridal quote?',
        answer: 'You can book nails, hair color, haircuts, facials, and waxing online anytime via our Book Now page, or click "Request Custom Quote" for an itemized wedding hair and makeup proposal.'
      }
    ],
    geo: {
      latitude: 33.0370,
      longitude: -117.2920,
      radiusMiles: 20
    }
  }
};

export const ALL_SERVICE_AREA_SLUGS = Object.keys(SERVICE_AREAS);
