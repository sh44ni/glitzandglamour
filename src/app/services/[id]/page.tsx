import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, Clock, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';
import { Metadata } from 'next';

// In Next.js 15+, params is a Promise
type PageProps = {
  params: Promise<{ id: string }>;
};

// Generate SEO Metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const service = await prisma.service.findUnique({ where: { id } });

  if (!service) return { title: 'Service Not Found | Glitz & Glamour Studio' };

  return {
    title: `${service.name} in Vista, CA | Glitz & Glamour Studio`,
    description: service.description?.slice(0, 160) || `Book a premium ${service.name} appointment at Glitz & Glamour Studio in Vista, CA. We specialize in ${service.category.toLowerCase()} services.`,
    openGraph: {
      title: `${service.name} | Glitz & Glamour Studio`,
      description: service.description || `Book a premium ${service.name} appointment at Glitz & Glamour Studio in Vista, CA.`,
      images: service.imageUrl ? [{ url: service.imageUrl }] : [],
    },
  };
}

export default async function ServiceDetailPage({ params }: PageProps) {
  const { id } = await params;
  const service = await prisma.service.findUnique({ where: { id } });

  if (!service) notFound();

  // Map category to a user-friendly label
  const catNames: Record<string, string> = {
    nails: 'Nail Services',
    pedicures: 'Pedicures',
    haircolor: 'Hair Color',
    haircuts: 'Haircuts',
    waxing: 'Waxing',
    facials: 'Facials',
  };
  const categoryLabel = catNames[service.category] || service.category;

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": service.name,
    "provider": {
      "@type": "BeautySalon",
      "name": "Glitz & Glamour Studio",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "812 Frances Dr",
        "addressLocality": "Vista",
        "addressRegion": "CA",
        "postalCode": "92084"
      }
    },
    "description": service.description || `Premium ${service.name} service in Vista, CA.`,
    "offers": {
      "@type": "Offer",
      "price": service.priceFrom,
      "priceCurrency": "USD",
      "url": `https://glitzandglamours.com/book?service=${service.id}`
    },
    "image": service.imageUrl || undefined
  };

  return (
    <div style={{ paddingBottom: '100px', background: '#0a0508', minHeight: '100vh' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      
      {/* Floating Back Button */}
      <Link href="/services" style={{
        position: 'absolute', top: '24px', left: '24px', zIndex: 30,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: '40px', height: '40px', borderRadius: '50%',
        background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.1)', color: '#fff'
      }}>
        <ChevronLeft size={20} />
      </Link>

      {/* Hero Header */}
      <div style={{ position: 'relative', width: '100%', height: '45vh', minHeight: '350px', maxHeight: '500px' }}>
        {service.imageUrl ? (
          <Image 
            src={service.imageUrl} 
            alt={service.name} 
            fill 
            priority
            style={{ objectFit: 'cover' }} 
          />
        ) : (
          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #1a0a12, #3a0f20)' }} />
        )}
        
        {/* Gradient overlays to blend into body */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(10,5,8,0.2) 0%, rgba(10,5,8,0.8) 70%, #0a0508 100%)' }} />
        
        {/* Title overlay */}
        <div style={{ position: 'absolute', bottom: '0', left: 0, right: 0, padding: '0 24px 24px', maxWidth: '800px', margin: '0 auto' }}>
          <span style={{ 
            display: 'inline-block', padding: '4px 12px', background: 'rgba(255,45,120,0.2)', 
            border: '1px solid rgba(255,45,120,0.4)', borderRadius: '20px', 
            color: '#FF2D78', fontSize: '12px', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase',
            marginBottom: '12px'
          }}>
            {categoryLabel}
          </span>
          <h1 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 'clamp(2rem, 6vw, 3.5rem)', fontWeight: 800, color: '#fff', lineHeight: 1.1, marginBottom: '8px', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
            {service.name}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px', fontWeight: 700, color: '#FFB700', textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
              {service.priceLabel}
            </span>
            <span style={{ fontSize: '13px', color: '#ccc' }}>· Starting price</span>
          </div>
        </div>
      </div>

      {/* Content Body */}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 24px' }}>
        
        {/* Main Description */}
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '20px', fontWeight: 600, color: '#fff', marginBottom: '16px' }}>About this service</h2>
          {service.description ? (
            <div style={{ color: '#eee', fontSize: '16px', lineHeight: 1.8, fontFamily: 'Poppins, sans-serif', fontWeight: 300 }} dangerouslySetInnerHTML={{ __html: service.description.replace(/\n/g, '<br/>') }} />
          ) : (
            <p style={{ color: '#eee', fontSize: '16px', lineHeight: 1.8, fontFamily: 'Poppins, sans-serif', fontWeight: 300 }}>
              Experience the finest {categoryLabel.toLowerCase()} treatment at Glitz & Glamour Studio. Our experts use high-quality products and precision techniques to ensure you look and feel your absolute best.
            </p>
          )}
        </div>

        {/* Value Props Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '40px' }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', padding: '20px', borderRadius: '16px' }}>
            <Sparkles size={24} color="#FF2D78" style={{ marginBottom: '12px' }} />
            <h3 style={{ color: '#fff', fontSize: '15px', fontWeight: 600, marginBottom: '6px' }}>Premium Quality</h3>
            <p style={{ color: '#aaa', fontSize: '13px', lineHeight: 1.5 }}>We use only top-tier products to ensure flawless and long-lasting results.</p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', padding: '20px', borderRadius: '16px' }}>
            <ShieldCheck size={24} color="#FF2D78" style={{ marginBottom: '12px' }} />
            <h3 style={{ color: '#fff', fontSize: '15px', fontWeight: 600, marginBottom: '6px' }}>Expert Care</h3>
            <p style={{ color: '#aaa', fontSize: '13px', lineHeight: 1.5 }}>Performed by skilled professionals dedicated to your safety and comfort.</p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', padding: '20px', borderRadius: '16px' }}>
            <Clock size={24} color="#FF2D78" style={{ marginBottom: '12px' }} />
            <h3 style={{ color: '#fff', fontSize: '15px', fontWeight: 600, marginBottom: '6px' }}>By Appointment</h3>
            <p style={{ color: '#aaa', fontSize: '13px', lineHeight: 1.5 }}>Dedicated time slots so you never feel rushed during your session.</p>
          </div>
        </div>

        {/* Pricing Note */}
        <div style={{ display: 'flex', gap: '12px', background: 'rgba(255,183,0,0.05)', border: '1px solid rgba(255,183,0,0.2)', padding: '20px', borderRadius: '16px' }}>
          <AlertCircle size={20} color="#FFB700" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h4 style={{ color: '#FFB700', fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>Pricing Consultation</h4>
            <p style={{ color: '#e0e0e0', fontSize: '13px', lineHeight: 1.6 }}>
              The exact final price may vary depending on hair length, nail intricate design requests, and product usage. We will always discuss and confirm the final price with you before beginning the service.
            </p>
          </div>
        </div>

      </div>

      {/* Action Bar (Sticky Bottom for Mobile) */}
      <div style={{ 
        position: 'fixed', bottom: 0, left: 0, right: 0, 
        background: 'rgba(10,5,8,0.85)', backdropFilter: 'blur(20px)', 
        borderTop: '1px solid rgba(255,255,255,0.1)',
        padding: '16px 24px', zIndex: 40,
        boxShadow: '0 -10px 40px rgba(0,0,0,0.5)'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <div style={{ display: 'none', '@media(minWidth: 600px)': { display: 'block' } } as React.CSSProperties}>
            <p style={{ color: '#fff', fontWeight: 600, fontSize: '16px', margin: 0 }}>{service.name}</p>
            <p style={{ color: '#FF2D78', fontWeight: 700, fontSize: '14px', margin: 0 }}>{service.priceLabel}</p>
          </div>
          <Link 
            href={`/book?service=${service.id}`} 
            className="btn-primary btn-pulse" 
            style={{ width: '100%', maxWidth: '400px', textAlign: 'center', padding: '16px', fontSize: '16px', fontWeight: 700 }}
          >
            Book Appointment
          </Link>
        </div>
      </div>
    </div>
  );
}
