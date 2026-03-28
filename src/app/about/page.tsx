import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Phone, Sparkles, Star, CalendarHeart, Car, HeartHandshake } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Glitz & Glamour Studio | Beauty Salon in Vista, CA',
  description: 'Welcome to Glitz & Glamour Studio, a full-service beauty salon in Vista, CA offering haircuts, color, makeup, nails, and mobile beauty services across San Diego County.',
  openGraph: {
    title: 'About Glitz & Glamour Studio | Vista, CA',
    description: 'Professional haircuts, color, make-up, nails, waxing, and mobile event services throughout San Diego County. Book today!',
    type: 'profile',
    images: ['/services/Elegant_beauty_spa_202601022049.jpeg'],
  },
};

export default function AboutPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BeautySalon",
    "name": "Glitz & Glamour Studio",
    "image": "https://glitzandglamours.com/services/Elegant_beauty_spa_202601022049.jpeg",
    "url": "https://glitzandglamours.com/about",
    "telephone": "760-290-5910",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "812 Frances Dr",
      "addressLocality": "Vista",
      "addressRegion": "CA",
      "postalCode": "92084",
      "addressCountry": "US"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 33.2001,
      "longitude": -117.2425
    },
    "description": "A full-service beauty salon located in Vista, CA, offering professional haircuts, color, make-up, nails, waxing, and mobile beauty services throughout San Diego County.",
    "priceRange": "$$"
  };

  return (
    <div style={{ background: '#0a0508', minHeight: '100vh', paddingBottom: '80px' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero Section */}
      <section style={{ position: 'relative', height: '60vh', minHeight: '400px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '40px 24px', overflow: 'hidden' }}>
        <Image 
          src="/services/Elegant_beauty_spa_202601022049.jpeg" 
          alt="Glitz & Glamour Studio in Vista CA"
          fill
          priority
          style={{ objectFit: 'cover', transform: 'scale(1.05)' }} 
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,5,8,1) 0%, rgba(10,5,8,0.7) 40%, rgba(10,5,8,0.3) 100%)' }} />
        
        <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', maxWidth: '800px', width: '100%' }}>
          <span style={{ 
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '6px 14px', background: 'rgba(255,45,120,0.15)', 
            border: '1px solid rgba(255,45,120,0.3)', borderRadius: '50px', 
            color: '#FF2D78', fontSize: '12px', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase',
            marginBottom: '16px'
          }}>
            <Sparkles size={14} /> Your Beauty Destination
          </span>
          <h1 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 800, color: '#fff', lineHeight: 1.1, marginBottom: '16px', textShadow: '0 4px 20px rgba(0,0,0,0.6)' }}>
            About <span className="text-gradient">Glitz &amp; Glamour</span>
          </h1>
          <p style={{ color: '#ccc', fontSize: 'clamp(16px, 2vw, 18px)', lineHeight: 1.6, maxWidth: '600px', margin: '0 auto 20px' }}>
            Where beauty, confidence, and convenience meet. Trusted local beauty services in Vista, CA and all of San Diego County.
          </p>
        </div>
      </section>

      {/* Main Content Areas */}
      <div style={{ maxWidth: '900px', margin: '-40px auto 0', position: 'relative', zIndex: 20, padding: '0 24px' }}>
        
        {/* Intro Card */}
        <div style={{
          background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px',
          padding: '40px', marginBottom: '40px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
        }}>
          <h2 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '24px', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>
            Welcome to the Studio 👋
          </h2>
          <p style={{ color: '#eee', fontSize: '16px', lineHeight: 1.8, marginBottom: '20px', fontFamily: 'Inter, sans-serif', fontWeight: 300 }}>
            Welcome to <strong>Glitz & Glamour Studio</strong>, your trusted destination for local beauty services in Vista, CA. We’re a full-service beauty salon offering professional haircuts, color, make-up, nails, and waxing — plus convenient mobile beauty services throughout San Diego County.
          </p>
          <p style={{ color: '#eee', fontSize: '16px', lineHeight: 1.8, fontFamily: 'Inter, sans-serif', fontWeight: 300 }}>
            At our salon located at <strong>812 Frances Dr, Vista, CA 92084</strong>, you’ll enjoy personalized care in a relaxing environment. Our team of expert local hairstylists, nail techs, and make-up artists deliver flawless results that fit your unique style.
          </p>
        </div>

        {/* Feature Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '50px' }}>
          
          {/* Card 1: Special Events */}
          <div style={{
            background: 'linear-gradient(145deg, rgba(255,45,120,0.05) 0%, rgba(121,40,202,0.05) 100%)',
            border: '1px solid rgba(255,45,120,0.15)', borderRadius: '20px', padding: '32px',
            position: 'relative', overflow: 'hidden',
          }}>
            <CalendarHeart size={36} color="#FF2D78" style={{ marginBottom: '16px' }} />
            <h3 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '20px', fontWeight: 600, color: '#fff', marginBottom: '12px' }}>
              Unforgettable Events
            </h3>
            <p style={{ color: '#ccc', fontSize: '15px', lineHeight: 1.6 }}>
              From everyday glam to the biggest moments of your life. We specialize in stunning transformations for weddings, quinceañeras, proms, and graduations. Let us make your special day perfect.
            </p>
          </div>

          {/* Card 2: Mobile Services */}
          <div style={{
            background: 'linear-gradient(145deg, rgba(255,183,0,0.05) 0%, rgba(255,45,120,0.05) 100%)',
            border: '1px solid rgba(255,183,0,0.15)', borderRadius: '20px', padding: '32px',
            position: 'relative', overflow: 'hidden',
          }}>
            <Car size={36} color="#FFB700" style={{ marginBottom: '16px' }} />
            <h3 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '20px', fontWeight: 600, color: '#fff', marginBottom: '12px' }}>
              Mobile Beauty Team
            </h3>
            <p style={{ color: '#ccc', fontSize: '15px', lineHeight: 1.6 }}>
              Prefer we come to you? Our highly requested mobile beauty team brings the same professional, luxury salon touch right to your home, hotel, or event venue anywhere in San Diego County.
            </p>
          </div>

        </div>

        {/* CTA Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #FF2D78 0%, #7928CA 100%)',
          borderRadius: '24px', padding: '40px', textAlign: 'center',
          boxShadow: '0 20px 40px rgba(255,45,120,0.3)'
        }}>
          <HeartHandshake size={48} color="#fff" style={{ margin: '0 auto 20px', opacity: 0.9 }} />
          <h2 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 800, color: '#fff', marginBottom: '16px', letterSpacing: '-0.5px' }}>
            Ready for your glow up?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '16px', marginBottom: '32px', maxWidth: '500px', margin: '0 auto 32px' }}>
            Book an appointment today and experience the difference of working with Vista's premier beauty specialists.
          </p>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center' }}>
            <Link 
              href="/book" 
              className="btn-pulse"
              style={{
                background: '#fff', color: '#B30047', fontFamily: 'Poppins, sans-serif', 
                fontWeight: 700, fontSize: '15px', padding: '14px 32px', borderRadius: '50px',
                display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none'
              }}
            >
              <Star size={18} fill="currentColor" /> Book Your Appointment
            </Link>
            
            <a 
              href="tel:760-290-5910"
              className="btn-outline"
              style={{
                fontFamily: 'Poppins, sans-serif', 
                fontWeight: 600, fontSize: '15px', padding: '14px 28px', borderRadius: '50px',
                backdropFilter: 'blur(5px)',
                display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none',
              }}
            >
              <Phone size={18} /> Call 760-290-5910
            </a>
          </div>
        </div>

        {/* Location Info Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '40px', color: '#888' }}>
          <MapPin size={16} />
          <span style={{ fontSize: '14px', fontFamily: 'Inter, sans-serif' }}>812 Frances Dr, Vista, CA 92084</span>
        </div>

      </div>
    </div>
  );
}
