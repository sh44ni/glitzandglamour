import Link from 'next/link';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import StarRating from '@/components/StarRating';
import HeroCarousel from '@/components/HeroCarousel';
import { ReviewData } from '@/types';

// Real client reviews for the homepage (first 3)
const sampleReviews: ReviewData[] = [
  {
    id: 'real-1',
    name: 'Guadalupe Lopez',
    rating: 5,
    reviewText: 'Amazing nails experience! JoJany is incredibly talented and made sure I was happy with every detail. My nails came out perfect. Highly recommend!',
    date: '2025-11-10',
    approved: true,
    timestamp: '2025-11-10T14:00:00Z',
  },
  {
    id: 'real-3',
    name: 'Kaylee',
    rating: 5,
    reviewText: 'She gave me the most beautiful Barbie beach girl look! Exactly what I envisioned. JoJany is a true artist. I won\'t go anywhere else!',
    date: '2025-10-28',
    approved: true,
    timestamp: '2025-10-28T15:00:00Z',
  },
  {
    id: 'real-7',
    name: 'Olivia Tate',
    rating: 5,
    reviewText: 'She exceeded all my expectations! I came in with a reference photo and she matched it perfectly. The quality of her work is outstanding. Book her now!',
    date: '2025-09-30',
    approved: true,
    timestamp: '2025-09-30T14:30:00Z',
  },
];

// Hero carousel slides
const heroSlides = [
  { src: '/herobg.jpeg', alt: 'Glitz & Glamour Studio' },
  { src: '/services/Full Set  GelX.jpeg', alt: 'Acrylic Nail Set' },
  { src: '/services/Deep Cleansing + Extraction Facial.jpeg', alt: 'Facial Services' },
];

// Featured services with images
const featuredServices = [
  {
    title: 'Acrylic Set',
    price: 'From $65',
    image: '/services/Full Set  GelX.jpeg',
    href: '/services#nails',
  },
  {
    title: 'Hair Color',
    price: 'From $65',
    image: '/services/Deep Cleansing + Extraction Facial.jpeg',
    href: '/services#haircolor',
  },
  {
    title: 'Deep Cleansing Facial',
    price: 'From $85',
    image: '/services/Deep Cleansing + Extraction Facial.jpeg',
    href: '/services#facials',
  },
];

export default function HomePage() {
  return (
    <div className="animate-fade-in bg-[#0A0A0A]">
      {/* Hero Section with Carousel */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        {/* Background Carousel */}
        <div className="absolute inset-0">
          <HeroCarousel slides={heroSlides} autoPlayInterval={5000} />
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/60 z-10" />
        </div>

        {/* Gradient orbs */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-[#FF1493]/20 rounded-full blur-3xl z-10 pointer-events-none" />
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-[#C71185]/20 rounded-full blur-3xl z-10 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20 z-20">
          {/* Logo/Title */}
          <div className="mb-8">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              <span className="text-[#FF1493]">Glitz</span>
              <span className="text-white"> & </span>
              <span className="text-[#FF1493]">Glamour</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mt-2">Studio</p>
          </div>

          {/* Tagline */}
          <p className="text-xl md:text-2xl text-[#FF1493] mb-4 italic">
            &ldquo;Unleash the Glitz, Embrace the Glamour&rdquo;
          </p>
          <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Nails, Hair & Beauty in Vista, CA
          </p>

          {/* CTA Button */}
          <Link href="/book">
            <Button variant="primary" size="lg">
              Book Appointment
            </Button>
          </Link>
        </div>
      </section>

      {/* Intro Section */}
      <section className="py-20 bg-[#1A1A1A] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF1493]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Welcome to <span className="text-[#FF1493]">Glitz & Glamour</span>
          </h2>
          <p className="text-lg text-gray-400 leading-relaxed">
            Located in Vista, CA, Glitz & Glamour Studio by JoJany Lavalle
            offers a personalized beauty experience. From stunning nail designs and hair color to
            rejuvenating facials, I&apos;m dedicated to making you feel glamorous and confident.
          </p>
        </div>
      </section>

      {/* Featured Services with Image Cards */}
      <section className="py-20 bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              My Services
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Discover my range of premium beauty services designed to pamper you
            </p>
          </div>

          {/* Service Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredServices.map((service, index) => (
              <Link key={index} href={service.href} className="group">
                <div className="glass-card rounded-2xl overflow-hidden hover:glow-pink-hover transition-all duration-300 hover:-translate-y-2">
                  {/* Image Container */}
                  <div className="relative h-64 overflow-hidden">
                    <Image
                      src={service.image}
                      alt={service.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Gradient overlay at bottom */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  </div>
                  {/* Content */}
                  <div className="p-6 -mt-8 relative">
                    <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-[#FF1493] transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-[#FF1493] font-bold text-lg">
                      {service.price}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-12">
            <Link href="/services">
              <Button variant="outline" size="lg">
                View All Services
              </Button>
            </Link>
            <Link href="/book">
              <Button variant="primary" size="lg">
                Book Appointment
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-20 bg-[#1A1A1A] relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#FF1493]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Real Client Reviews
            </h2>
            <div className="flex items-center justify-center gap-2 mb-3">
              <StarRating rating={5} readonly size="sm" />
              <span className="text-[#FF1493] font-semibold text-sm">5.0</span>
              <span className="text-gray-500 text-sm">· 116 Reviews on Setmore</span>
            </div>
            <p className="text-gray-400 max-w-2xl mx-auto">
              I take pride in making every client feel beautiful
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {sampleReviews.map((review) => (
              <Card key={review.id}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-[#FF1493] rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">{review.name}</h4>
                    <StarRating rating={review.rating} readonly size="sm" />
                  </div>
                </div>
                <p className="text-gray-400 italic">&ldquo;{review.reviewText}&rdquo;</p>
              </Card>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link href="/reviews">
              <Button variant="outline">Read More Reviews</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-[#FF1493] to-[#C71185] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Feel Glamorous?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Book your appointment today and experience the Glitz & Glamour difference.
          </p>
          <Link href="/book">
            <Button
              variant="secondary"
              size="lg"
            >
              Book Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
