import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { 
  MapPin, 
  Sparkles, 
  Calendar, 
  Phone, 
  CheckCircle2, 
  HelpCircle, 
  Star, 
  ChevronRight, 
  Car, 
  ShieldCheck, 
  HeartHandshake, 
  DollarSign, 
  ArrowRight 
} from 'lucide-react';
import { SERVICE_AREAS, ALL_SERVICE_AREA_SLUGS } from '@/data/serviceAreas';

interface PageProps {
  params: Promise<{ city: string }>;
}

export const revalidate = 3600;

export async function generateStaticParams() {
  return ALL_SERVICE_AREA_SLUGS.map((slug) => ({
    city: slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { city } = await params;
  const area = SERVICE_AREAS[city];

  if (!area) {
    return {
      title: 'Service Area Not Found | Glitz & Glamour Studio',
    };
  }

  const canonicalUrl = `https://www.glitzandglamours.com/service-areas/${city}`;

  return {
    title: `${area.metaTitle} | Glitz & Glamour`,
    description: area.metaDescription,
    keywords: area.keywords.join(', '),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${area.metaTitle} | Glitz & Glamour Studio`,
      description: area.metaDescription,
      url: canonicalUrl,
      type: 'website',
      images: [
        {
          url: `https://www.glitzandglamours.com${area.heroImage}`,
          width: 1200,
          height: 630,
          alt: `${area.heroTitle} - Glitz & Glamour Studio`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: area.metaTitle,
      description: area.metaDescription,
      images: [`https://www.glitzandglamours.com${area.heroImage}`],
    },
  };
}

export default async function ServiceAreaPage({ params }: PageProps) {
  const { city } = await params;
  const area = SERVICE_AREAS[city];

  if (!area) {
    notFound();
  }

  // Schema.org Structured Data
  const jsonLdLocalBusiness = {
    '@context': 'https://schema.org',
    '@type': 'BeautySalon',
    name: 'Glitz & Glamour Studio',
    image: `https://www.glitzandglamours.com${area.heroImage}`,
    '@id': `https://www.glitzandglamours.com/service-areas/${area.slug}#salon`,
    url: `https://www.glitzandglamours.com/service-areas/${area.slug}`,
    telephone: '+1-760-290-5910',
    priceRange: '$$$',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '935 W San Marcos Blvd, Suite 101',
      addressLocality: 'San Marcos',
      addressRegion: 'CA',
      postalCode: '92078',
      addressCountry: 'US',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: area.geo.latitude,
      longitude: area.geo.longitude,
    },
    areaServed: {
      '@type': 'City',
      name: `${area.city}, CA`,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '09:00',
        closes: '18:00',
      },
    ],
  };

  const jsonLdFAQ = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: area.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  const jsonLdBreadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://www.glitzandglamours.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Special Events',
        item: 'https://www.glitzandglamours.com/special-events',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Weddings & Bridal',
        item: 'https://www.glitzandglamours.com/special-events/weddings-bridal',
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: `${area.city}, CA`,
        item: `https://www.glitzandglamours.com/service-areas/${area.slug}`,
      },
    ],
  };

  const otherServiceAreas = ALL_SERVICE_AREA_SLUGS.filter((s) => s !== area.slug);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdLocalBusiness) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFAQ) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }}
      />

      <div className="min-h-screen bg-stone-950 text-stone-100">
        {/* Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumb"
          className="border-b border-stone-800/80 bg-stone-900/60 backdrop-blur-sm"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <ol className="flex items-center space-x-2 text-xs sm:text-sm text-stone-400">
              <li>
                <Link href="/" className="hover:text-amber-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <ChevronRight className="w-3.5 h-3.5 text-stone-600" />
              </li>
              <li>
                <Link href="/special-events" className="hover:text-amber-400 transition-colors">
                  Special Events
                </Link>
              </li>
              <li>
                <ChevronRight className="w-3.5 h-3.5 text-stone-600" />
              </li>
              <li>
                <Link
                  href="/special-events/weddings-bridal"
                  className="hover:text-amber-400 transition-colors"
                >
                  Weddings & Bridal
                </Link>
              </li>
              <li>
                <ChevronRight className="w-3.5 h-3.5 text-stone-600" />
              </li>
              <li className="text-amber-400 font-medium truncate" aria-current="page">
                {area.city}, CA
              </li>
            </ol>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 lg:py-24 border-b border-stone-800">
          <div className="absolute inset-0 z-0">
            <Image
              src={area.heroImage}
              alt={`${area.heroTitle} wedding hair and makeup`}
              fill
              className="object-cover object-center opacity-25"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/80 to-stone-950/40" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-amber-400/10 text-amber-300 border border-amber-400/30 tracking-wide uppercase mb-4">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                {area.tagBadge}
              </span>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white tracking-tight leading-tight mb-5">
                {area.heroTitle}
              </h1>

              <p className="text-lg sm:text-xl text-stone-300 mb-8 leading-relaxed">
                {area.heroTagline}
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link
                  href="/special-events/weddings-bridal#pricing"
                  className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-semibold shadow-lg hover:from-amber-400 hover:to-amber-500 transition-all duration-200"
                >
                  <DollarSign className="w-4 h-4" />
                  Request Custom Wedding Quote
                </Link>

                <a
                  href="tel:7602905910"
                  className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-lg bg-stone-900 border border-stone-700 text-stone-200 font-medium hover:bg-stone-800 hover:text-white transition-all"
                >
                  <Phone className="w-4 h-4 text-amber-400" />
                  Call (760) 290-5910
                </a>
              </div>

              {/* Studio & Proximity Pill */}
              <div className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-lg bg-stone-900/90 border border-stone-800 text-xs sm:text-sm text-stone-300">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  <strong>Flagship Studio:</strong> 935 W San Marcos Blvd, Suite 101, San Marcos, CA 92078
                  <span className="hidden sm:inline text-stone-500 mx-2">|</span>
                  <span className="text-amber-300 font-medium">{area.distanceFromStudio}</span>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Content Section: Detailed Intro & Story */}
        <section className="py-16 bg-stone-900/40 border-b border-stone-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              <div className="lg:col-span-8 space-y-6">
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
                  Premier Wedding Hair & Makeup Artistry in {area.city}, California
                </h2>
                {area.introParagraphs.map((paragraph, index) => (
                  <p key={index} className="text-stone-300 leading-relaxed text-base sm:text-lg">
                    {paragraph}
                  </p>
                ))}

                {/* Key Benefits Grid */}
                <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {area.valueProps.map((prop, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-xl bg-stone-900/80 border border-stone-800 hover:border-amber-500/30 transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <h3 className="font-semibold text-white text-base mb-1">{prop.title}</h3>
                          <p className="text-sm text-stone-400 leading-relaxed">{prop.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sidebar Quick Booking Box */}
              <div className="lg:col-span-4">
                <div className="sticky top-24 rounded-2xl bg-gradient-to-b from-stone-900 to-stone-950 p-6 border border-stone-800 shadow-xl space-y-6">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-amber-400 font-semibold">
                      Booking Information
                    </span>
                    <h3 className="text-xl font-serif font-bold text-white mt-1">
                      {area.city} Wedding Inquiries
                    </h3>
                  </div>

                  <div className="space-y-3 text-sm text-stone-300 border-y border-stone-800/80 py-4">
                    <div className="flex items-center justify-between">
                      <span className="text-stone-400">Location Served:</span>
                      <span className="font-medium text-white">{area.city}, CA</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-stone-400">HQ Studio Distance:</span>
                      <span className="font-medium text-amber-400">{area.distanceFromStudio}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-stone-400">On-Location Travel:</span>
                      <span className="font-medium text-white">Full Mobile Glam Team</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-stone-400">Pricing Model:</span>
                      <span className="font-medium text-amber-300">Itemized Custom Quote</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Link
                      href="/special-events/weddings-bridal#pricing"
                      className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold transition-all text-center"
                    >
                      <Calendar className="w-4 h-4" />
                      Get Your Custom Proposal
                    </Link>
                    <Link
                      href="/book"
                      className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-stone-800 hover:bg-stone-700 text-white font-medium transition-all text-center"
                    >
                      Book In-Studio Trial
                    </Link>
                  </div>

                  <p className="text-xs text-stone-500 text-center">
                    Appointments subject to availability. Peak dates fill up 6–12 months in advance.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Local Venues */}
        <section className="py-16 border-b border-stone-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <span className="text-xs uppercase tracking-wider text-amber-400 font-semibold">
                Local Venue Spotlight
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-2">
                Top Wedding Venues We Love in {area.city}
              </h2>
              <p className="text-stone-400 text-sm sm:text-base mt-2">
                Our mobile bridal team is experienced with venue layouts, natural lighting conditions, and morning setup logistics across {area.city}.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {area.venues.map((venue, idx) => (
                <div
                  key={idx}
                  className="rounded-xl bg-stone-900/60 border border-stone-800 p-6 hover:border-stone-700 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs px-2.5 py-1 rounded bg-amber-400/10 text-amber-300 font-medium">
                        {venue.type}
                      </span>
                      <span className="text-xs text-stone-400 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-stone-500" />
                        {venue.neighborhood}
                      </span>
                    </div>

                    <h3 className="text-xl font-serif font-bold text-white mb-2">{venue.name}</h3>
                    <p className="text-stone-300 text-sm mb-4 leading-relaxed">{venue.description}</p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-stone-800/80 bg-stone-950/40 -mx-6 -mb-6 p-4 rounded-b-xl">
                    <p className="text-xs text-amber-300/90 leading-relaxed">
                      <strong className="text-amber-400">Stylist Note:</strong> {venue.hmuaTip}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Services Provided Section */}
        <section className="py-16 bg-stone-900/40 border-b border-stone-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <span className="text-xs uppercase tracking-wider text-amber-400 font-semibold">
                Bridal Services
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-2">
                Tailored Wedding Hair & Makeup for {area.city} Couples
              </h2>
              <p className="text-stone-400 text-sm sm:text-base mt-2">
                Whether you need in-studio preparations or on-location bridal team dispatch, we deliver picture-perfect beauty for every member of your wedding party.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {area.servicesProvided.map((service, idx) => (
                <div
                  key={idx}
                  className="rounded-xl bg-stone-900/80 border border-stone-800 p-6 flex flex-col justify-between"
                >
                  <div>
                    <h3 className="text-xl font-serif font-bold text-white mb-3">{service.title}</h3>
                    <p className="text-sm text-stone-300 leading-relaxed mb-6">{service.description}</p>
                  </div>

                  <div>
                    <span className="text-xs font-semibold uppercase text-amber-400 tracking-wider block mb-2">
                      Included Highlights:
                    </span>
                    <ul className="space-y-2">
                      {service.deliverables.map((item, itemIdx) => (
                        <li key={itemIdx} className="text-xs text-stone-300 flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Transparent Pricing Guide (Cost Drivers) */}
        <section className="py-16 border-b border-stone-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <span className="text-xs uppercase tracking-wider text-amber-400 font-semibold">
                Bespoke Proposals
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-2">
                {area.pricingGuide.heading}
              </h2>
              <p className="text-amber-300 font-medium text-sm sm:text-base mt-2">
                {area.pricingGuide.subheading}
              </p>
              <p className="text-stone-400 text-sm mt-3 leading-relaxed">
                {area.pricingGuide.explanation}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {area.pricingGuide.drivers.map((driver, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-xl bg-stone-900/50 border border-stone-800 hover:border-amber-500/20 transition-all text-center"
                >
                  <div className="w-10 h-10 rounded-full bg-amber-400/10 text-amber-400 flex items-center justify-center mx-auto mb-4 font-serif font-bold">
                    0{idx + 1}
                  </div>
                  <h3 className="font-semibold text-white text-base mb-2">{driver.title}</h3>
                  <p className="text-xs text-stone-400 leading-relaxed">{driver.description}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent border border-amber-500/20 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h4 className="text-lg font-serif font-bold text-white">
                  Ready for your personalized {area.city} wedding proposal?
                </h4>
                <p className="text-sm text-stone-400 mt-1">
                  Tell us about your date, venue, and party size. We provide complete, transparent estimates with zero obligation.
                </p>
              </div>
              <Link
                href="/special-events/weddings-bridal#pricing"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold shrink-0 transition-all"
              >
                Request Quote
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Real Bride Testimonials */}
        <section className="py-16 bg-stone-900/40 border-b border-stone-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <span className="text-xs uppercase tracking-wider text-amber-400 font-semibold">
                Client Love
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-2">
                What {area.city} Brides Say
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {area.reviews.map((rev, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-xl bg-stone-900/80 border border-stone-800 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-1 mb-3">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-stone-300 text-sm italic leading-relaxed mb-4">
                      &ldquo;{rev.quote}&rdquo;
                    </p>
                  </div>
                  <div className="border-t border-stone-800/80 pt-3">
                    <p className="font-semibold text-white text-sm">{rev.author}</p>
                    <p className="text-xs text-amber-400/90">
                      {rev.role} • {rev.venue}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-16 border-b border-stone-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="text-xs uppercase tracking-wider text-amber-400 font-semibold">
                Answers & Insights
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-2">
                Frequently Asked Questions — {area.city} Weddings
              </h2>
            </div>

            <div className="space-y-4">
              {area.faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="rounded-xl bg-stone-900/60 border border-stone-800 p-6 transition-all"
                >
                  <h3 className="font-semibold text-white text-base sm:text-lg mb-2 flex items-start gap-2.5">
                    <HelpCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <span>{faq.question}</span>
                  </h3>
                  <p className="text-sm text-stone-300 leading-relaxed pl-7.5">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Cross-Linking Hub: Other San Diego Service Areas */}
        <section className="py-16 bg-stone-900/60 border-b border-stone-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-10">
              <span className="text-xs uppercase tracking-wider text-amber-400 font-semibold">
                San Diego Service Network
              </span>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-white mt-2">
                Explore Bridal Hair & Makeup Services Across San Diego County
              </h2>
              <p className="text-stone-400 text-sm mt-2">
                We travel throughout Southern California to bring couture bridal beauty directly to your bridal suite.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {ALL_SERVICE_AREA_SLUGS.map((slug) => {
                const item = SERVICE_AREAS[slug];
                const isCurrent = slug === area.slug;
                return (
                  <Link
                    key={slug}
                    href={`/service-areas/${slug}`}
                    className={`p-3.5 rounded-lg border text-center transition-all ${
                      isCurrent
                        ? 'bg-amber-400/10 border-amber-400/50 text-amber-300 font-semibold pointer-events-none'
                        : 'bg-stone-900 border-stone-800 text-stone-300 hover:border-stone-700 hover:text-white'
                    }`}
                  >
                    <p className="text-sm">{item.city}, CA</p>
                    <p className="text-xs text-stone-400 mt-1">{item.region}</p>
                  </Link>
                );
              })}
            </div>

            <div className="text-center mt-8">
              <Link
                href="/special-events/weddings-bridal"
                className="inline-flex items-center gap-2 text-sm text-amber-400 hover:text-amber-300 font-medium"
              >
                <span>View Full San Diego Weddings & Bridal Services Page</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Bottom Banner CTA */}
        <section className="py-16 bg-gradient-to-b from-stone-950 to-stone-900">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white">
              Reserve Your {area.city} Wedding Date
            </h2>
            <p className="text-stone-300 max-w-2xl mx-auto text-base sm:text-lg">
              Let us curate a morning of relaxation, champagne, and picture-perfect bridal glam for you and your closest friends and family.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/special-events/weddings-bridal#pricing"
                className="w-full sm:w-auto px-8 py-3.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold transition-all shadow-lg"
              >
                Request Custom Quote
              </Link>
              <Link
                href="/book"
                className="w-full sm:w-auto px-8 py-3.5 rounded-lg bg-stone-900 border border-stone-700 text-white font-medium hover:bg-stone-800 transition-all"
              >
                Schedule Preview Trial
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
