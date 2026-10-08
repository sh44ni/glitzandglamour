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
    tagBadge: 'Flagship Luxury Studio & On-Location Team',
    heroTitle: 'Wedding Hair and Makeup Artist in San Marcos, CA',
    metaTitle: 'Wedding Hair and Makeup San Marcos CA | Glitz & Glamour Studio',
    metaDescription: 'Premier bridal hair and makeup artist in San Marcos CA. Flagship luxury salon at 935 W San Marcos Blvd. On-location wedding glam across North County. Request a custom quote.',
    keywords: [
      'wedding hair makeup artist',
      'bridal hair and makeup san diego',
      'bridal hair makeup artist',
      'hmua wedding',
      'wedding hairstyles in san diego',
      'wedding hair and makeup prices',
      'bridal hair prices',
      'wedding day makeup artist'
    ],
    heroImage: '/special-events/ev-weddings.png',
    heroTagline: 'Luxury in-studio bridal preview trials & on-site wedding day glam across Twin Oaks Valley and San Marcos.',
    distanceFromStudio: 'Flagship Studio Location',
    travelTimeSnippet: 'Studio HQ on West San Marcos Blvd • Immediate travel access to all North County venues',
    introParagraphs: [
      'Welcome to Glitz & Glamour Studio, North County San Diego’s dedicated bridal sanctuary located right here in San Marcos at 935 W San Marcos Blvd, Suite 101. Whether you are walking down the aisle beneath the lush garden canopies of Twin Oaks House & Gardens or hosting an elegant lakeside reception at Lakehouse Resort, our master bridal hair and makeup artists ensure you and your bridal party look radiant, camera-ready, and effortlessly stunning.',
      'Our San Marcos studio offers private, sun-drenched bridal trial suites where we craft your customized wedding day vision months before you step into your dress. On your big day, we bring our full mobile glam squad directly to your bridal suite or hotel, arriving fully equipped with ring lights, sanitation stations, high-performance airbrush cosmetics, and weather-resistant styling essentials.',
      'We recognize that every wedding party is unique. Rather than offering one-size-fits-all packages, we provide transparent, itemized custom quotes tailored precisely to your bridal party size, timeline constraints, veil placement needs, and on-location touch-up requirements.'
    ],
    valueProps: [
      {
        title: 'Flagship San Marcos Bridal Studio',
        description: 'Enjoy high-touch in-studio preview trials with professional daylight mirrors, specialty lighting, and champagne hospitality just minutes from home.'
      },
      {
        title: 'Preferred by Top San Marcos Venues',
        description: 'Deep familiarity with the layout, lighting conditions, and morning setup protocols of Twin Oaks Valley, St. Mark, and Lakehouse venues.'
      },
      {
        title: 'Waterproof & 16-Hour Longevity',
        description: 'Formulations engineered to resist microclimate heat, tears of joy, and high-definition photography throughout dinner, toasts, and dancing.'
      },
      {
        title: 'Customized Quotes with Zero Surprises',
        description: 'Clear, itemized proposals reflecting your exact party count, travel distance, and styling preferences with no hidden upcharges.'
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
        title: 'Bridal Hair & High-Definition Makeup',
        description: 'The complete couture bridal package including luxury skin prep, custom airbrush or luminous foundation, bespoke individual lashes, and architectural bridal styling with veil placement.',
        deliverables: ['Custom skin preparation & hydration mask', 'Airbrush or liquid luxury foundation', 'Individual lash design & eyebrow sculpting', 'Veil & hair accessory placement', 'Touch-up emergency kit included']
      },
      {
        title: 'Bridal Party Hair & Makeup',
        description: 'Cohesive, photo-ready glam for bridesmaids, maid of honor, mothers of the bride and groom, and junior attendants.',
        deliverables: ['Custom updo, half-up, or textured blowout', 'Full-face waterproof makeup with lashes', 'Cohesive aesthetic matching the wedding palette', 'Strict timeline adherence per guest']
      },
      {
        title: 'In-Studio Bridal Preview Trial',
        description: 'A comprehensive 2.5 to 3-hour consultation at our San Marcos salon where we test multiple hairstyles, refine lip shades, and capture reference photos.',
        deliverables: ['Detailed timeline consultation', 'Dual hairstyle exploration', 'Skin sensitivity patch check', 'High-res reference portfolio for wedding day']
      }
    ],
    pricingGuide: {
      heading: 'San Marcos Wedding Hair and Makeup Pricing & Custom Quotes',
      subheading: 'Why We Provide Bespoke Estimates Instead of Rigid Package Numbers',
      explanation: 'Search terms like "wedding hair and makeup prices" often lead brides to rigid menus that fail to account for unique party sizes, timeline speeds, and on-location travel requirements. At Glitz & Glamour, we formulate your proposal around transparent cost drivers so you only pay for what your bridal party actually needs.',
      drivers: [
        {
          title: 'Bridal Party Headcount',
          description: 'Larger bridal parties require additional lead artists to ensure every bridesmaid is completed smoothly without early 5:00 AM wake-up calls.'
        },
        {
          title: 'Studio Trial vs. Day-Of Only',
          description: 'Whether you choose a full 3-hour in-studio preview consultation in San Marcos or book on-site wedding day service only.'
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
        quote: 'Having their studio right in San Marcos made my bridal trial so effortless. On wedding morning at Lakehouse Resort, they created the exact glowy, timeless look I dreamed of.',
        author: 'Rachel T.',
        venue: 'Lakehouse Resort',
        role: 'San Marcos Bride',
        rating: 5
      }
    ],
    faqs: [
      {
        question: 'Do you provide on-location wedding hair and makeup in San Marcos, or do we visit your studio?',
        answer: 'We provide both! Many brides prefer holding their preview trials inside our relaxing San Marcos studio (Suite 101, 935 W San Marcos Blvd), and having our mobile glam team travel directly to their San Marcos bridal suite or venue on the wedding morning.'
      },
      {
        question: 'How do I get a wedding hair and makeup price quote for my San Marcos wedding?',
        answer: 'Simply submit our quick online inquiry form or call (760) 290-5910. We review your date, venue, getting-ready location, and headcount to send an itemized, custom quote within 24 to 48 hours.'
      },
      {
        question: 'How early should I book my San Marcos wedding date?',
        answer: 'Peak Southern California wedding dates (April through November) book out 6 to 12 months in advance. We recommend securing your date as soon as your venue is reserved.'
      },
      {
        question: 'Can your team handle large bridal parties?',
        answer: 'Yes! We dispatch multiple experienced lead artists for large parties so that your morning flows gracefully without rushing or stressful early morning starts.'
      }
    ],
    geo: {
      latitude: 33.1434,
      longitude: -117.1661,
      radiusMiles: 25
    }
  },

  'vista-ca': {
    slug: 'vista-ca',
    city: 'Vista',
    state: 'CA',
    region: 'North County San Diego',
    tagBadge: 'Heritage Bridal Excellence & Trusted Local Artistry',
    heroTitle: 'Wedding Hair & Makeup Artist in Vista, CA',
    metaTitle: 'Wedding Hair & Makeup Artist Vista CA | Glitz & Glamour',
    metaDescription: 'Award-winning bridal hair and makeup artists serving Vista CA. Luxury bridal party glam, in-studio trials 10 mins away in San Marcos. Request your custom wedding quote.',
    keywords: [
      'wedding hair and makeup',
      'bridal makeup and hair stylist',
      'professional wedding makeup artist',
      'wedding day makeup artist',
      'stylist wedding',
      'stylist for weddings',
      'wedding party hair prices',
      'bridal party hair prices'
    ],
    heroImage: '/special-events/ev-weddings.png',
    heroTagline: 'Honoring years of dedicated bridal service to Vista brides with luxury on-location wedding styling.',
    distanceFromStudio: '8–12 Minutes from Studio HQ',
    travelTimeSnippet: 'Immediate travel dispatch to all Vista venues • Seamless access for in-studio trials',
    introParagraphs: [
      'For years, Glitz & Glamour has had the privilege of styling brides, bridal parties, and families throughout Vista, California. From the modern industrial charm of The Vistonian in Downtown Vista to the rolling hills of Shadowridge Golf Club and the serene historic grounds of Rancho Guajome Adobe, our connection to the Vista wedding community runs deep.',
      'Our newly expanded flagship studio is located just 8 to 10 minutes down the road at 935 W San Marcos Blvd, providing Vista brides with a luxurious, close-by destination for pre-wedding trials, hair color prep, lash extensions, and facial treatments before the big day.',
      'On your wedding morning, our on-location HMUA squad arrives at your Vista bridal suite with complete professional setups, ensuring your morning is completely relaxed, fun, and on schedule. We specialize in long-lasting, camera-ready bridal makeup and bespoke wedding hairstyles that endure from your first look to the late-night dance party.'
    ],
    valueProps: [
      {
        title: 'Deep Vista Heritage & Trust',
        description: 'A trusted local reputation built on dozens of successful weddings, bridal showers, and special celebrations across Vista.'
      },
      {
        title: 'Only 8–10 Minutes to Studio HQ',
        description: 'Take advantage of convenient in-studio trials and beauty appointments right next door in San Marcos.'
      },
      {
        title: 'Expert Venue Lighting Adaptability',
        description: 'From rustic barn aesthetics to modern industrial brick spaces, we tailor your makeup tones to flatter Vista venue lighting.'
      },
      {
        title: 'Complete Bridal Party Coordination',
        description: 'Comprehensive hair and makeup services for your bridesmaids, mothers, and flower girls delivered smoothly.'
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
        title: 'Bridal Hair & Airbrush Makeup',
        description: 'Tailored specifically for the Vista bride, featuring long-wearing airbrush skin perfection, customized lash enhancements, and architectural styling.',
        deliverables: ['Custom skin prep & depuffing', 'Transfer-resistant airbrush foundation', 'Bespoke lash clusters', 'Heirloom veil anchoring', 'Full-day touch-up kit']
      },
      {
        title: 'Bridal Party & Bridesmaid Glam',
        description: 'Synchronized hair styling and full makeup for bridesmaids and bridal parties at competitive custom group rates.',
        deliverables: ['Structured or loose updos & waves', 'Long-wear makeup with lashes included', 'Uniform bridal party aesthetic', 'On-time schedule execution']
      },
      {
        title: 'Mother of the Bride & Groom Styling',
        description: 'Sophisticated, age-embracing makeup and elegant hair design that highlights natural beauty without settling into fine lines.',
        deliverables: ['Hydrating, peptide-rich skin prep', 'Featherweight liquid or airbrush base', 'Soft eye lifting techniques', 'Volumizing blowout or updo']
      }
    ],
    pricingGuide: {
      heading: 'Vista Bridal Hair and Makeup Pricing & Custom Quotes',
      subheading: 'Transparent Value Built Around Your Specific Celebration',
      explanation: 'Brides looking for "wedding party hair prices" and "bridal hair prices" in Vista deserve honest answers without rigid constraints. Because we are based just minutes away in San Marcos, Vista brides enjoy minimal travel costs and maximum schedule flexibility.',
      drivers: [
        {
          title: 'Total Services Requested',
          description: 'Combining hair and makeup for both the bride and bridal party provides the most efficient timeline and consolidated custom quote.'
        },
        {
          title: 'Bridal Trial Consultation',
          description: 'Enjoy a dedicated 3-hour trial session at our studio right next door before the wedding day.'
        },
        {
          title: 'Early Morning Timing',
          description: 'For early morning ceremonies or extensive bridal party counts, we schedule our master team to guarantee zero rush.'
        },
        {
          title: 'On-Site Travel Radius',
          description: 'Our proximity to Vista allows us to offer swift, punctual on-location bridal team dispatch.'
        }
      ]
    },
    reviews: [
      {
        quote: 'I live in Vista and got married at The Vistonian. Glitz & Glamour came directly to our Airbnb suite. My hair and makeup stayed flawless all night despite lots of crying and dancing!',
        author: 'Amanda K.',
        venue: 'The Vistonian',
        role: 'Vista Bride',
        rating: 5
      },
      {
        quote: 'Super convenient being just 10 minutes from their San Marcos salon for my trial. The artists are so talented and made my entire bridal party look like royalty.',
        author: 'Elena R.',
        venue: 'Shadowridge Golf Club',
        role: 'Vista Bride',
        rating: 5
      }
    ],
    faqs: [
      {
        question: 'Do you charge high travel fees for Vista weddings?',
        answer: 'No! Because our flagship salon is located right on the San Marcos / Vista border on West San Marcos Blvd, travel to Vista venues is brief, convenient, and cost-effective.'
      },
      {
        question: 'Can I do my bridal hair and makeup trial at your salon?',
        answer: 'Yes, we encourage it! Our San Marcos studio is equipped with professional daylight-balanced lighting, comfortable styling chairs, and an extensive product bar to test your dream bridal look.'
      },
      {
        question: 'How do you calculate wedding party hair prices for bridesmaids?',
        answer: 'We provide itemized custom quotes based on the exact number of bridesmaids, desired styles (updos vs blowouts), and whether makeup is bundled. Contact us for a personalized breakdown.'
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
    tagBadge: 'Coastal Luxury & Resort Wedding HMUA',
    heroTitle: 'Bridal Hair and Makeup Artist in Carlsbad, CA',
    metaTitle: 'Bridal Hair and Makeup Artist Carlsbad CA | Luxury Wedding HMUA',
    metaDescription: 'Luxury wedding hair and makeup artist for Carlsbad, CA coastal weddings. Serving Leo Carrillo Ranch, Cape Rey & Omni La Costa. In-studio trials & on-site glam.',
    keywords: [
      'bridal hair and makeup san diego',
      'wedding hair and makeup san diego',
      'bridal hair makeup san diego',
      'wedding makeup artist san diego',
      'stylist for weddings',
      'stylist for wedding',
      'makeup artist for bridesmaids',
      'wedding trial hair prices'
    ],
    heroImage: '/special-events/ev-weddings.png',
    heroTagline: 'Bespoke coastal wedding beauty engineered for ocean breezes, warm sunshine, and luxury resort celebrations.',
    distanceFromStudio: '15–20 Minutes from Studio HQ',
    travelTimeSnippet: 'Seamless coastal highway transit • Dedicated resort on-location teams',
    introParagraphs: [
      'Carlsbad, California is world-renowned for its scenic ocean bluffs, historic ranches, and Five-Star luxury golf resorts. From the peacock-graced hacienda grounds of Leo Carrillo Ranch to oceanfront vows at Cape Rey and European elegance at Omni La Costa and Park Hyatt Aviara, Carlsbad weddings require hair and makeup that can withstand coastal salt air while maintaining a luminous, couture finish.',
      'Glitz & Glamour Studio provides Carlsbad brides with specialized coastal bridal artistry. We utilize humidity-resistant hair primers, thermal setting locks, and silicone-based airbrush foundations that prevent frizz, shine, or melting, ensuring you look breathtaking in bright coastal sunshine and dramatic twilight receptions alike.',
      'Our team is based just 15 minutes inland in San Marcos, making it simple to visit our studio for detailed preview trials or pre-wedding bridal pampering, while our mobile squad travels directly to your Carlsbad hotel suite or venue dressing room on the big day.'
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
        title: 'Flawless Airbrush Complexion',
        description: 'Lightweight, feather-thin layers that provide full photo coverage without masking your skin’s natural radiance.'
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
        title: 'Bridal Hair & Makeup Preview Trial',
        description: 'A 2.5 to 3-hour collaborative session at our nearby San Marcos studio to craft and test your wedding day look.',
        deliverables: ['In-depth style & venue consultation', 'Two distinct hair variations tested', 'Custom foundation matching', 'Detailed photographic log for wedding day']
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
          title: 'Preview Trial Inclusion',
          description: 'A dedicated consultation session at our nearby flagship studio to finalize your dream aesthetic.'
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
        quote: 'Getting ready at Omni La Costa was a dream with this team. They showed up early, set up professional lights and chairs, and kept us laughing and calm all morning.',
        author: 'Morgan C.',
        venue: 'Omni La Costa',
        role: 'Carlsbad Bride',
        rating: 5
      }
    ],
    faqs: [
      {
        question: 'Do you travel to Carlsbad hotels and wedding resorts?',
        answer: 'Yes! Our on-location mobile glam team regularly travels to Omni La Costa, Park Hyatt Aviara, Cape Rey, The Cassara, and private beach villas across Carlsbad.'
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
    heroTitle: 'La Jolla Hair and Makeup Salon & Bridal Stylist',
    metaTitle: 'La Jolla Hair and Makeup Salon & Bridal Stylist | Glitz & Glamour',
    metaDescription: 'Luxury wedding hair and makeup artist for La Jolla weddings and events. Serving Darlington House, Scripps Seaside Forum, & oceanfront villas. Bespoke bridal quotes.',
    keywords: [
      'la jolla hair and makeup salon',
      'makeup artist san diego',
      'bridal makeup and hair stylist',
      'best wedding hair',
      'best bridal hair',
      'wedding hair makeup artist',
      'hair updos cost',
      'bridal hair and makeup san diego ca'
    ],
    heroImage: '/special-events/ev-weddings.png',
    heroTagline: 'Couture bridal hair and red-carpet makeup for oceanfront villas, historic estates, and luxury coastal venues in La Jolla.',
    distanceFromStudio: '30–35 Minutes via I-5 South',
    travelTimeSnippet: 'Direct mobile glam team dispatch to La Jolla estates and seaside resorts',
    introParagraphs: [
      'La Jolla, California is the crown jewel of Southern California coastlines—famed for dramatic cliffside views, historic Spanish and Moroccan villas, and chic modern architectural landmarks. Whether you are saying your vows in the romantic Andalusian courtyard of The Darlington House, overlooking rolling Pacific waves at Scripps Seaside Forum, or hosting an intimate dinner atop a La Jolla Cove rooftop, your wedding beauty deserves the highest echelon of artistry.',
      'Glitz & Glamour Studio provides discerning La Jolla brides with luxury on-location wedding hair and makeup services. We specialize in red-carpet level complexion work—combining luminous, breathable skin with precision contouring, custom cluster lashes, and architectural hair designs that stay impeccably intact in Pacific ocean air.',
      'Our senior stylists bring a calm, poised presence to your bridal suite. We coordinate closely with your wedding planner and photography team, ensuring a seamless timeline so you can savor every glass of champagne before walking down the aisle.'
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
        title: 'Bridal Preview Trial Consultation',
        description: 'An intimate 3-hour session at our flagship studio where we explore multiple hairstyles and fine-tune your makeup to perfection.',
        deliverables: ['Look concept & mood board review', 'Dual hairstyle trial', 'Detailed skin profile assessment', 'Digital photo log for wedding day reference']
      }
    ],
    pricingGuide: {
      heading: 'La Jolla Wedding Hair and Makeup Pricing & Custom Quotes',
      subheading: 'Tailored Investment for Discerning Oceanfront Weddings',
      explanation: 'Search terms such as "hair updos cost" or "la jolla hair and makeup salon" often lead to generic menus that do not account for the personalized demands of luxury weddings. We provide transparent, itemized quotes reflecting your exact party numbers and on-location schedule.',
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
        answer: 'Preview trials take place at our flagship studio at 935 W San Marcos Blvd in San Marcos, where we have private bridal suites and daylight-balanced lighting.'
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
    metaTitle: 'Wedding Hair and Makeup San Diego CA | Bridal Makeup Artist & Stylist',
    metaDescription: 'Premier bridal hair and makeup artist in San Diego CA. Top-rated wedding day HMUA team for bridal parties, trials & mobile on-location glam. Get a custom quote.',
    keywords: [
      'wedding hair and makeup san diego',
      'bridal hair and makeup san diego',
      'hair and makeup san diego',
      'makeup artist san diego',
      'makeup artist in san diego ca',
      'makeup artists san diego ca',
      'hair and makeup wedding san diego',
      'wedding makeup artist san diego',
      'bridal hair and makeup san diego ca',
      'wedding hairstyles in san diego'
    ],
    heroImage: '/special-events/ev-weddings.png',
    heroTagline: 'County-wide bridal luxury: on-location glam squads serving Downtown, Balboa Park, Coronado, Point Loma, and all of San Diego.',
    distanceFromStudio: 'Serving all San Diego County',
    travelTimeSnippet: 'Mobile glam team dispatched county-wide • Studio HQ in North County',
    introParagraphs: [
      'From the iconic Spanish arches of The Prado at Balboa Park to oceanfront majesty at Hotel del Coronado and the trendy urban warehouses of Downtown’s Gaslamp Quarter, San Diego is one of the premier wedding destinations in the world. At Glitz & Glamour Studio, we deliver elite-tier bridal hair and makeup artistry directly to brides and bridal parties across the entire San Diego metropolitan area.',
      'Our team is celebrated for crafting natural, luminous skin, timeless bridal updos, romantic bohemian half-up braids, and sleek red-carpet Hollywood waves. Whether your wedding vibe is barefoot coastal elegance or black-tie ballroom luxury, we bring the expertise, high-end products, and punctual workflow needed to make your morning completely effortless.',
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
        title: 'Custom Proposals with Clear Breakdown',
        description: 'Transparent pricing customized around your exact party count, timing, and travel logistics.'
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
        title: 'In-Studio Preview Trial in San Marcos',
        description: 'A 2.5 to 3-hour private consultation at our flagship North County studio to design and test your dream bridal aesthetic before the wedding.',
        deliverables: ['Comprehensive style & dress consultation', 'Two distinct hairstyles tested', 'Skin undertone analysis & custom blending', 'Photo portfolio for day-of reference']
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
        answer: 'We recommend scheduling your bridal preview trial 2 to 4 months before your wedding day, ideally timed with a dress fitting or engagement photo shoot.'
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
  }
};

export const ALL_SERVICE_AREA_SLUGS = Object.keys(SERVICE_AREAS);
