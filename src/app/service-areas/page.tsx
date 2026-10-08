import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Sparkles, ChevronRight, Phone, Calendar } from 'lucide-react';
import { SERVICE_AREAS, ALL_SERVICE_AREA_SLUGS } from '@/data/serviceAreas';

export const metadata: Metadata = {
  title: 'San Diego Service Areas | Wedding Hair & Makeup | Glitz & Glamour',
  description:
    'Explore bridal hair and makeup service areas across San Diego County by Glitz & Glamour Studio. In-studio trials in San Marcos and on-location glam across Vista, Carlsbad, La Jolla, and San Diego.',
  alternates: {
    canonical: 'https://www.glitzandglamours.com/service-areas',
  },
};

export default function ServiceAreasIndexPage() {
  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="border-b border-stone-800/80 bg-stone-900/60">
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
            <li className="text-amber-400 font-medium" aria-current="page">
              Service Areas
            </li>
          </ol>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative py-16 sm:py-24 border-b border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-amber-400/10 text-amber-300 border border-amber-400/30 uppercase tracking-wide mb-4">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Southern California Bridal Coverage
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight mb-6">
            San Diego Wedding Hair & Makeup Service Areas
          </h1>
          <p className="text-stone-300 text-base sm:text-lg leading-relaxed">
            Headquartered at our flagship luxury salon in San Marcos, Glitz & Glamour Studio provides in-studio preview trials and mobile, on-location wedding hair and makeup artistry throughout North County and greater San Diego.
          </p>

          <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-stone-900 border border-stone-800 text-xs sm:text-sm text-stone-300">
            <MapPin className="w-4 h-4 text-amber-400" />
            <span>
              <strong>Flagship Studio:</strong> 935 W San Marcos Blvd, Suite 101, San Marcos, CA 92078
            </span>
          </div>
        </div>
      </section>

      {/* City Directory Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {ALL_SERVICE_AREA_SLUGS.map((slug) => {
              const area = SERVICE_AREAS[slug];
              return (
                <div
                  key={slug}
                  className="rounded-2xl bg-stone-900/60 border border-stone-800 overflow-hidden flex flex-col justify-between hover:border-amber-500/40 transition-all duration-300 group"
                >
                  <div className="relative h-48 w-full overflow-hidden">
                    <Image
                      src={area.heroImage}
                      alt={area.heroTitle}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-70"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />
                    <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                      <span className="text-xs px-2.5 py-1 rounded bg-amber-400/20 backdrop-blur-sm text-amber-300 font-semibold border border-amber-400/30">
                        {area.region}
                      </span>
                      <span className="text-xs text-stone-300 bg-stone-900/80 px-2 py-1 rounded">
                        {area.distanceFromStudio}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h2 className="text-xl font-serif font-bold text-white group-hover:text-amber-400 transition-colors mb-2">
                        {area.city}, CA
                      </h2>
                      <p className="text-sm text-stone-300 mb-4 line-clamp-3">
                        {area.heroTagline}
                      </p>

                      <div className="mb-4">
                        <span className="text-xs uppercase font-semibold text-stone-400 block mb-1">
                          Key Venues Served:
                        </span>
                        <p className="text-xs text-stone-400 line-clamp-2">
                          {area.venues.map((v) => v.name).join(' • ')}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-stone-800 flex items-center justify-between">
                      <Link
                        href={`/service-areas/${slug}`}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-400 hover:text-amber-300 group-hover:translate-x-1 transition-all"
                      >
                        Explore {area.city}
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Direct Call to Action */}
      <section className="py-16 bg-stone-900/40 border-t border-stone-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
            Getting Married in Southern California?
          </h2>
          <p className="text-stone-300 text-sm sm:text-base max-w-xl mx-auto">
            Contact us with your date and venue location to receive an itemized, transparent custom quote for bridal party hair and makeup.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/special-events/weddings-bridal#pricing"
              className="px-6 py-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold transition-all"
            >
              Request Custom Quote
            </Link>
            <a
              href="tel:7602905910"
              className="px-6 py-3 rounded-lg bg-stone-900 border border-stone-700 text-stone-200 font-medium hover:bg-stone-800 transition-all flex items-center gap-2"
            >
              <Phone className="w-4 h-4 text-amber-400" />
              (760) 290-5910
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
