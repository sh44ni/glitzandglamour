import Link from 'next/link';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import StarRating from '@/components/StarRating';
import { ReviewData } from '@/types';

// Sample reviews for the homepage
const sampleReviews: ReviewData[] = [
  {
    id: '1',
    name: 'Sarah M.',
    rating: 5,
    reviewText: 'Absolutely love my nails! Jolany is so talented and professional. The studio has such a relaxing atmosphere.',
    date: '2025-12-15',
    approved: true,
    timestamp: '2025-12-15T14:30:00Z',
  },
  {
    id: '2',
    name: 'Jessica L.',
    rating: 5,
    reviewText: 'Best nail salon in Oceanside! My GelX nails lasted over 3 weeks. Will definitely be back!',
    date: '2025-12-10',
    approved: true,
    timestamp: '2025-12-10T11:00:00Z',
  },
  {
    id: '3',
    name: 'Michelle R.',
    rating: 5,
    reviewText: 'The deep cleansing facial was amazing. My skin has never felt so refreshed. Highly recommend!',
    date: '2025-12-05',
    approved: true,
    timestamp: '2025-12-05T16:45:00Z',
  },
];

// Featured services with images
const featuredServices = [
  {
    title: 'Full Set / GelX',
    price: 'From $55',
    image: '/services/Full Set  GelX.jpeg',
    href: '/services#nails',
  },
  {
    title: 'Deep Cleansing Facial',
    price: 'From $85',
    image: '/services/Deep Cleansing + Extraction Facial.jpeg',
    href: '/services#facials',
  },
  {
    title: 'Nail Art & Design',
    price: 'From $15',
    image: '/services/Nail Design  New Design.jpeg',
    href: '/services#nails',
  },
];

export default function HomePage() {
  return (
    <div className="animate-fade-in bg-[#0A0A0A]">
      {/* Hero Section with Background Image */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <Image
            src="/herobg.jpeg"
            alt="Glitz & Glamour Studio"
            fill
            className="object-cover"
            priority
          />
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/60" />
        </div>

        {/* Decorative bow elements */}
        <div className="absolute top-20 left-10 opacity-10 animate-float z-10">
          <svg width="80" height="48" viewBox="0 0 40 24" fill="#FF1493">
            <ellipse cx="10" cy="12" rx="10" ry="8" />
            <ellipse cx="30" cy="12" rx="10" ry="8" />
            <circle cx="20" cy="12" r="5" />
          </svg>
        </div>
        <div className="absolute bottom-40 right-10 opacity-10 animate-float z-10" style={{ animationDelay: '1s' }}>
          <svg width="60" height="36" viewBox="0 0 40 24" fill="#FF1493">
            <ellipse cx="10" cy="12" rx="10" ry="8" />
            <ellipse cx="30" cy="12" rx="10" ry="8" />
            <circle cx="20" cy="12" r="5" />
          </svg>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20 z-10">
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
            Elegant Nails & Beauty in Oceanside
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
      <section className="py-20 bg-[#1A1A1A]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Welcome to <span className="text-[#FF1493]">Glitz & Glamour</span>
          </h2>
          <p className="text-lg text-gray-400 leading-relaxed">
            Located in beautiful Oceanside, CA, Glitz & Glamour Studio by Jolany Lavalle
            offers a personalized beauty experience. From stunning nail designs to
            rejuvenating facials, we&apos;re dedicated to making you feel glamorous and confident.
          </p>
        </div>
      </section>

      {/* Featured Services with Image Cards */}
      <section className="py-20 bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Our Services
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Discover our range of premium beauty services designed to pamper you
            </p>
          </div>

          {/* Service Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredServices.map((service, index) => (
              <Link key={index} href={service.href} className="group">
                <div className="bg-[#1A1A1A] rounded-2xl overflow-hidden border border-gray-800 hover:border-[#FF1493]/30 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                  {/* Image Container */}
                  <div className="relative h-64 overflow-hidden">
                    <Image
                      src={service.image}
                      alt={service.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Gradient overlay at bottom */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] via-transparent to-transparent" />
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
      <section className="py-20 bg-[#1A1A1A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              What Our Clients Say
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              We take pride in making our clients feel beautiful
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {sampleReviews.map((review) => (
              <Card key={review.id}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-[#FF1493] rounded-full flex items-center justify-center text-white font-semibold">
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
        {/* Decorative bow */}
        <div className="absolute top-5 right-10 opacity-20">
          <svg width="60" height="36" viewBox="0 0 40 24" fill="white">
            <ellipse cx="10" cy="12" rx="10" ry="8" />
            <ellipse cx="30" cy="12" rx="10" ry="8" />
            <circle cx="20" cy="12" r="5" />
          </svg>
        </div>
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
