'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Star, ChevronRight, MapPin, Calendar, Award, Lock, ChevronLeft } from 'lucide-react';

const reviews = [
  { name: 'Guadalupe Lopez', text: 'Amazing nails experience! JoJany is incredibly talented and made sure I was happy with every detail. My nails came out perfect. Highly recommend!', date: 'Nov 2025', initial: 'G' },
  { name: 'Kaylee', text: 'She gave me the most beautiful Barbie beach girl look! Exactly what I envisioned. JoJany is a true artist. I won\'t go anywhere else!', date: 'Oct 2025', initial: 'K' },
  { name: 'Olivia Tate', text: 'She exceeded all my expectations! I came in with a reference photo and she matched it perfectly. The quality of her work is outstanding. Book her now!', date: 'Sep 2025', initial: 'O' },
  { name: 'Janet D', text: 'Total vibe, she never disappoints! Every single visit is better than the last. The studio atmosphere is amazing and her work is always flawless.', date: 'Oct 2025', initial: 'J' },
  { name: 'Gloria Jimenez', text: 'She goes above and beyond every time! JoJany truly cares about her clients and it shows in her work. My nails have never looked this good!', date: 'Oct 2025', initial: 'G' },
];

const INITIAL_FEATURED = [
  { name: 'Acrylic Set', price: 'From $65', image: '/services/Full_Set_GelX.jpeg', href: '/services#nails', wide: true, dbName: 'Acrylic Set', id: '' },
  { name: 'Deep Cleansing Facial', price: 'From $85', image: '/services/Deep_Cleansing_and_Extraction_Facial.jpeg', href: '/services#facials', dbName: 'Deep Cleansing + Extraction Facial', id: '' },
  { name: 'Balayage', price: 'From $380', image: '/services/Elegant_beauty_spa_202601022049.jpeg', href: '/services#haircolor', dbName: 'Balayage', id: '' },
  { name: 'Jelly Foot Detox', price: 'From $75', image: '/services/Jelly_Hydrating_Foot_Detox.jpeg', href: '/services#pedicures', dbName: 'Jelly Hydrating Foot Detox', id: '' },
  { name: 'Eyebrow Wax', price: 'From $12', image: '/services/Clean_professional_waxing_202601022049.jpeg', href: '/services#waxing', dbName: 'Eyebrow Wax', id: '' },
];

const STAMP_TOTAL = 10;

export default function HomePage() {
  const { data: session } = useSession();
  const [loyaltyCount, setLoyaltyCount] = useState(0);
  const [spinAvailable, setSpinAvailable] = useState(false);
  const [featuredServices, setFeaturedServices] = useState(INITIAL_FEATURED);

  // Slider state
  const [sliderImages, setSliderImages] = useState<{ id: string, url: string }[]>([]);
  const [sliderIdx, setSliderIdx] = useState(0);

  useEffect(() => {
    fetch('/api/admin/slider')
      .then(r => r.json())
      .then(d => {
        if (d.images && d.images.length > 0) {
          setSliderImages(d.images);
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetch('/api/services')
      .then(r => r.json())
      .then(d => {
        if (d.services) {
          setFeaturedServices(prev => prev.map(item => {
            const dbMatch = d.services.find((s: any) => s.name === item.dbName);
            if (dbMatch) {
              return {
                ...item,
                ...(dbMatch.imageUrl ? { image: dbMatch.imageUrl } : {}),
                price: dbMatch.priceLabel || item.price,
                id: dbMatch.id
              };
            }
            return item;
          }));
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (sliderImages.length > 1) {
      const id = setInterval(() => {
        setSliderIdx(i => (i + 1) % sliderImages.length);
      }, 5000);
      return () => clearInterval(id);
    }
  }, [sliderImages]);



  useEffect(() => {
    if (session) {
      fetch('/api/loyalty')
        .then(r => r.json())
        .then(d => {
          if (d.loyaltyCard) {
            setLoyaltyCount(d.loyaltyCard.currentStamps);
            setSpinAvailable(!!d.loyaltyCard.spinAvailable);
          }
        })
        .catch(console.error);
    }
  }, [session]);

  const [reviewIdx, setReviewIdx] = useState(0);
  const [reviewAnim, setReviewAnim] = useState<'in' | 'out'>('in');
  const reviewTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartX = useRef<number | null>(null);

  const goToReview = (next: number) => {
    setReviewAnim('out');
    setTimeout(() => {
      setReviewIdx((next + reviews.length) % reviews.length);
      setReviewAnim('in');
    }, 280);
  };

  const startReviewTimer = () => {
    if (reviewTimerRef.current) clearInterval(reviewTimerRef.current);
    reviewTimerRef.current = setInterval(() => {
      setReviewAnim('out');
      setTimeout(() => {
        setReviewIdx(i => (i + 1) % reviews.length);
        setReviewAnim('in');
      }, 280);
    }, 4500);
  };

  useEffect(() => {
    startReviewTimer();
    return () => { if (reviewTimerRef.current) clearInterval(reviewTimerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ position: 'relative', zIndex: 1 }}>
      <style>{`
        .hero-banner {
          width: 100%;
          max-width: 1200px;
          border-radius: 32px;
          overflow: hidden;
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          box-shadow: 0 20px 40px rgba(0,0,0,0.5);
          min-height: 480px;
        }
        /* ===== TESTIMONIAL CAROUSEL ===== */
        .tc-wrapper {
          position: relative;
          padding: 0 20px;
          max-width: 520px;
          margin: 0 auto;
        }
        .tc-card {
          position: relative;
          border-radius: 24px;
          padding: 32px 28px 28px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          backdrop-filter: blur(20px);
          box-shadow: 0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.07);
          overflow: hidden;
          transition: opacity 0.28s ease, transform 0.28s ease;
          min-height: 230px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          cursor: grab;
          user-select: none;
          touch-action: pan-y;
        }
        .tc-card.anim-out {
          opacity: 0;
          transform: scale(0.96) translateY(6px);
        }
        .tc-card.anim-in {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
        .tc-card-border {
          position: absolute;
          inset: 0;
          border-radius: 24px;
          padding: 1px;
          background: linear-gradient(135deg, rgba(255,45,120,0.5) 0%, rgba(121,40,202,0.35) 50%, transparent 100%);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }
        .tc-quote-mark {
          font-family: Georgia, 'Times New Roman', serif;
          font-size: 96px;
          line-height: 0.7;
          background: linear-gradient(135deg, rgba(255,45,120,0.25), rgba(121,40,202,0.15));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          position: absolute;
          top: 18px;
          left: 22px;
          pointer-events: none;
          z-index: 0;
          font-weight: 900;
        }
        .tc-text {
          font-family: 'Poppins', sans-serif;
          color: #e8e8e8;
          font-size: 15px;
          line-height: 1.7;
          position: relative;
          z-index: 1;
          padding-top: 36px;
          margin-bottom: 24px;
        }
        .tc-author {
          display: flex;
          align-items: center;
          gap: 12px;
          position: relative;
          z-index: 1;
        }
        .tc-avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: linear-gradient(135deg, #FF2D78, #7928CA);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Poppins', sans-serif;
          font-weight: 700;
          color: #fff;
          font-size: 16px;
          flex-shrink: 0;
          box-shadow: 0 4px 14px rgba(255,45,120,0.35);
        }
        .tc-name {
          font-family: 'Poppins', sans-serif;
          font-weight: 600;
          color: #fff;
          font-size: 14px;
          margin-bottom: 4px;
        }
        .tc-meta {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .tc-stars {
          display: flex;
          gap: 2px;
        }
        .tc-date {
          font-family: 'Poppins', sans-serif;
          color: #888;
          font-size: 11px;
        }
        .tc-dots {
          display: flex;
          justify-content: center;
          gap: 7px;
          margin-bottom: -15px; /* SHIFT DOTS DOWN TO FIX HEIGHT DRIFT */
          margin-top: 5px;
        }
        .tc-dot {
          height: 6px;
          border-radius: 3px;
          background: rgba(255,255,255,0.18);
          transition: width 0.35s ease, background 0.35s ease;
          width: 6px;
        }
        .tc-dot.active {
          width: 22px;
          background: linear-gradient(90deg, #FF2D78, #FF6BA8);
        }
        .tc-nav-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #fff;
          backdrop-filter: blur(8px);
          z-index: 10;
          transition: all 0.2s ease;
        }
        .tc-nav-btn:hover {
          background: rgba(255,45,120,0.2);
          border-color: rgba(255,45,120,0.4);
        }
        .tc-nav-left { left: -14px; }
        .tc-nav-right { right: -14px; }
        .tc-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: linear-gradient(135deg, rgba(255,183,0,0.12), rgba(255,45,120,0.08));
          border: 1px solid rgba(255,183,0,0.25);
          border-radius: 50px;
          padding: 6px 14px;
          margin-bottom: 20px;
        }
        .tc-setmore-badge {
          position: absolute;
          top: 14px;
          right: 16px;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 50px;
          padding: 4px 10px;
          z-index: 2;
        }
        .tc-setmore-badge span {
          font-family: 'Poppins', sans-serif;
          font-size: 10px;
          font-weight: 500;
          color: #aaa;
          letter-spacing: 0.2px;
        }
        .tc-setmore-badge span b {
          color: #fff;
          font-weight: 700;
        }
      `}</style>

      {/* ============ HERO BANNER ============ */}
      <section style={{ padding: '0px 24px', marginTop: '24px', display: 'flex', justifyContent: 'center' }}>
        <div className="hero-banner">
          {/* Banner Image Slider */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 0, backgroundColor: '#111' }}>
            {sliderImages.map((img, i) => (
              <div key={img.id} style={{
                position: 'absolute', inset: 0,
                opacity: i === sliderIdx ? 1 : 0,
                transition: 'opacity 1s ease-in-out'
              }}>
                <Image src={img.url} alt="Glitz & Glamour Studio banner" fill priority={i === 0} style={{ objectFit: 'cover', objectPosition: 'center 30%' }} />
              </div>
            ))}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(10,10,10,0.3) 0%, rgba(10,10,10,0.7) 60%, rgba(10,10,10,0.9) 100%)' }} />
          </div>

          <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: '640px', width: '100%', padding: '24px' }}>
            {/* Location pill */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)',
              borderRadius: '50px', padding: '6px 14px', marginBottom: '20px',
            }}>
              <MapPin size={13} color="#FF2D78" strokeWidth={2.5} />
              <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', color: '#fff', fontWeight: 500 }}>
                Licensed Professional · By Appointment
              </span>
            </div>

            <h1 className="sr-only">
              Glitz &amp; Glamour Studio - Premium Nail, Hair &amp; Beauty Salon in Vista, CA
            </h1>

            <div style={{
              fontFamily: 'Poppins, sans-serif', fontWeight: 800, lineHeight: 1.05,
              fontSize: 'clamp(2.4rem, 7vw, 4.5rem)', letterSpacing: '-1.5px',
              marginBottom: '16px',
            }}>
              <span className="text-gradient">Nails.</span>{' '}
              <span style={{ color: 'white' }}>Hair.</span>{' '}
              <span className="text-gradient">Beauty.</span>
            </div>

            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 'clamp(14px, 2vw, 16px)', color: '#eee', marginBottom: '32px', lineHeight: 1.6, fontWeight: 400 }}>
              We'll make you feel glamorous and confident.<br />Let's create something beautiful together.
            </p>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/book" className="btn-primary btn-pulse" style={{ fontSize: '14px', padding: '12px 28px', gap: '8px' }}>
                Book Now <ChevronRight size={16} />
              </Link>
              <Link href="/services" className="btn-outline" style={{ fontSize: '14px', padding: '12px 28px', background: 'rgba(255,255,255,0.05)', color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}>
                View Services
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============ REVIEWS CAROUSEL ============ */}
      <section style={{ marginTop: '32px', marginBottom: '24px', position: 'relative', zIndex: 2 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px', padding: '0 24px' }}>
          <p style={{ fontFamily: 'Poppins, sans-serif', color: '#FF2D78', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '10px' }}>
            Testimonials
          </p>
          <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', color: '#fff', letterSpacing: '-0.5px', marginBottom: '16px' }}>
            Loved by our clients
          </h2>
          {/* Rating badge */}
          <div className="tc-badge">
            <div style={{ display: 'flex', gap: '3px' }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={14} fill="#FFB700" color="#FFB700" />
              ))}
            </div>
            <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#FFB700', fontSize: '14px' }}>5.0</span>
            <span style={{ fontFamily: 'Poppins, sans-serif', color: '#ccc', fontSize: '13px' }}>· 116+ reviews on Setmore</span>
          </div>
        </div>

        {/* Carousel */}
        <div className="tc-wrapper">
          {/* Prev button */}
          <button
            className="tc-nav-btn tc-nav-left"
            aria-label="Previous review"
            onClick={() => { goToReview(reviewIdx - 1); startReviewTimer(); }}
          >
            <ChevronLeft size={16} />
          </button>

          {/* Card */}
          <div
            className={`tc-card ${reviewAnim === 'out' ? 'anim-out' : 'anim-in'}`}
            onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
            onTouchEnd={(e) => {
              if (touchStartX.current === null) return;
              const diff = touchStartX.current - e.changedTouches[0].clientX;
              if (Math.abs(diff) > 40) {
                goToReview(diff > 0 ? reviewIdx + 1 : reviewIdx - 1);
                startReviewTimer();
              }
              touchStartX.current = null;
            }}
          >
            {/* Gradient border overlay */}
            <div className="tc-card-border" />

            {/* Setmore source badge */}
            <div className="tc-setmore-badge">
              <svg width="12" height="12" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="40" height="40" rx="8" fill="#0060FF" />
                <path d="M20 8C13.37 8 8 13.37 8 20C8 26.63 13.37 32 20 32C26.63 32 32 26.63 32 20C32 13.37 26.63 8 20 8ZM24.5 22.5C24.5 23.88 23.38 25 22 25H14V23H22C22.28 23 22.5 22.78 22.5 22.5V19.5C22.5 19.22 22.28 19 22 19H18C16.62 19 15.5 17.88 15.5 16.5V15.5C15.5 14.12 16.62 13 18 13H26V15H18C17.72 15 17.5 15.22 17.5 15.5V16.5C17.5 16.78 17.72 17 18 17H22C23.38 17 24.5 18.12 24.5 19.5V22.5Z" fill="white" />
              </svg>
              <span>from <b>Setmore</b></span>
            </div>

            {/* Big quote mark */}
            <span className="tc-quote-mark">&ldquo;</span>

            {/* Review text */}
            <p className="tc-text">
              {reviews[reviewIdx].text}
            </p>

            {/* Author */}
            <div className="tc-author">
              <div className="tc-avatar">
                {reviews[reviewIdx].initial}
              </div>
              <div>
                <div className="tc-name">{reviews[reviewIdx].name}</div>
                <div className="tc-meta">
                  <div className="tc-stars">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} size={11} fill="#FFB700" color="#FFB700" />
                    ))}
                  </div>
                  <span className="tc-date">· {reviews[reviewIdx].date}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Next button */}
          <button
            className="tc-nav-btn tc-nav-right"
            aria-label="Next review"
            onClick={() => { goToReview(reviewIdx + 1); startReviewTimer(); }}
          >
            <ChevronRight size={16} />
          </button>

          {/* Dot indicators */}
          <div className="tc-dots">
            {reviews.map((_, i) => (
              <div
                key={i}
                className={`tc-dot${i === reviewIdx ? ' active' : ''}`}
                onClick={() => { goToReview(i); startReviewTimer(); }}
                style={{ cursor: 'pointer' }}
              />
            ))}
          </div>
        </div>

        {/* CTA buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginTop: '28px', flexWrap: 'wrap', padding: '0 24px' }}>
          <Link href="/reviews" className="btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '14px', padding: '12px 24px', borderColor: 'rgba(255,255,255,0.15)', color: '#fff' }}>
            View all reviews <ChevronRight size={14} />
          </Link>
          <Link href="/reviews" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '14px', padding: '12px 24px' }}>
            <Star size={15} strokeWidth={2} fill="currentColor" /> Leave a Review
          </Link>
        </div>
      </section>

      {/* ============ SERVICES BENTO ============ */}
      <div style={{ padding: '0 24px' }}>
        <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.06)', margin: '40px auto 10px', maxWidth: '1040px' }} />
      </div>
      <section style={{ padding: '40px 24px' }}>
        <div style={{ maxWidth: '1040px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <p style={{ fontFamily: 'Poppins, sans-serif', color: '#FF2D78', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '10px' }}>
              What We Do
            </p>
            <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', color: '#fff', letterSpacing: '-0.5px', marginBottom: '8px' }}>
              Premium Beauty Services
            </h2>
            <p style={{ fontFamily: 'Poppins, sans-serif', color: '#bbb', fontSize: '14px' }}>
              Every price is a starting point — we'll discuss your look and finalize everything before confirming.
            </p>
          </div>

          {/* Bento grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {featuredServices.map((service, i) => (
              <div key={i} style={{ gridColumn: i === 0 ? 'span 2' : 'span 1', display: 'flex', flexDirection: 'column' }}>
                <div style={{
                  position: 'relative', overflow: 'hidden',
                  height: i === 0 ? '240px' : '190px',
                  borderRadius: '14px',
                  border: '1px solid rgba(255,255,255,0.06)',
                  transition: 'all 0.4s ease',
                  display: 'flex', flexDirection: 'column',
                }}>
                  <Image src={service.image} alt={service.name} fill
                    style={{ objectFit: 'cover', transition: 'transform 0.5s ease', zIndex: 0 }} />
                  <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 40%, transparent 100%)' }} />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: i === 0 ? '20px' : '14px', zIndex: 2 }}>

                    {/* Title & Price Row */}
                    <div style={{ display: 'flex', flexDirection: i === 0 ? 'row' : 'column', justifyContent: 'space-between', alignItems: i === 0 ? 'flex-end' : 'flex-start', gap: '8px', marginBottom: '12px' }}>
                      <div>
                        <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#fff', fontSize: i === 0 ? '20px' : '15px', marginBottom: '2px', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                          {service.name}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <span style={{ fontFamily: 'Poppins, sans-serif', color: '#FF2D78', fontWeight: 600, fontSize: i === 0 ? '14px' : '12px' }}>
                            {service.price}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div style={{ display: 'flex', gap: '6px', marginTop: i === 0 ? 0 : '4px' }}>
                        <Link
                          href={service.id ? `/services/${service.id}` : service.href}
                          style={{
                            fontSize: '11px', padding: '6px 12px', borderRadius: '50px',
                            border: '1px solid rgba(255,255,255,0.2)', color: '#fff',
                            background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(4px)',
                            textDecoration: 'none', fontWeight: 500
                          }}
                        >
                          Details
                        </Link>
                        <Link
                          href={service.id ? `/book?service=${service.id}` : '/book'}
                          style={{
                            fontSize: '11px', padding: '6px 12px', borderRadius: '50px',
                            background: '#FF2D78', color: '#fff',
                            textDecoration: 'none', fontWeight: 600
                          }}
                        >
                          Book
                        </Link>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '28px', display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/services" className="btn-outline">Browse All Services</Link>
            <Link href="/book" className="btn-primary">Book Appointment <ChevronRight size={15} /></Link>
          </div>
        </div>
      </section>

      {/* ============ LOYALTY TEASER ============ */}
      <div style={{ padding: '0 24px' }}>
        <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.06)', margin: '0 auto 24px', maxWidth: '1040px' }} />
      </div>
      <section style={{ padding: '0 24px 24px' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <style>{`
            @keyframes bowFloat { 0%,100%{transform:translateY(0) rotate(-4deg);} 50%{transform:translateY(-5px) rotate(4deg);} }
            @keyframes bowPulse { 0%,100%{transform:scale(1) rotate(3deg);opacity:.75;} 50%{transform:scale(1.12) rotate(-3deg);opacity:1;} }
          `}</style>

          {/* Section label */}
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: '#FF2D78' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <img src="/new_bowdesign.svg" alt="Bow" width={18} height={18} style={{ objectFit: 'contain' }} /> Loyalty Card
              </span>
            </span>
            <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 'clamp(20px, 4vw, 28px)', color: '#fff', margin: '8px 0 6px' }}>
              Earn Stamps. Get Rewarded.
            </h2>
            <p style={{ fontFamily: 'Poppins, sans-serif', color: '#666', fontSize: '14px', maxWidth: '400px', margin: '0 auto', lineHeight: 1.7 }}>
              Collect 10 Hello Kitties and unlock a free spin at the wheel — redeemable in person 🎡
            </p>
          </div>

          {/* The mini loyalty card */}
          <div style={{
            position: 'relative',
            borderRadius: '24px', overflow: 'hidden',
            background: 'linear-gradient(145deg, #1a0a12 0%, #200d1a 50%, #160818 100%)',
            border: spinAvailable
              ? '1.5px solid rgba(255,215,0,0.5)'
              : '1.5px solid rgba(255,45,120,0.2)',
            boxShadow: spinAvailable
              ? '0 0 48px rgba(255,215,0,0.12), 0 16px 48px rgba(0,0,0,0.6)'
              : '0 16px 48px rgba(0,0,0,0.6), 0 0 30px rgba(255,45,120,0.06)',
            padding: '28px 24px',
            marginBottom: '20px',
          }}>
            {/* Top shimmer line */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, #FF2D78 40%, #FF6BA8 60%, transparent)' }} />

            {/* Sparkle dots */}
            {[...Array(8)].map((_, i) => (
              <div key={i} style={{
                position: 'absolute', pointerEvents: 'none',
                left: `${10 + (i % 4) * 25}%`, top: `${20 + Math.floor(i / 4) * 55}%`,
                width: '2px', height: '2px', borderRadius: '50%',
                background: i % 2 === 0 ? 'rgba(255,45,120,0.35)' : 'rgba(255,255,255,0.06)',
              }} />
            ))}

            {/* Card header: bows + title + bows */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              {/* Left bow */}
              <img src="/new_bowdesign.svg" alt="Bow" width={32} height={32} style={{ display: 'inline-block', animation: 'bowFloat 3.5s ease-in-out infinite', userSelect: 'none', objectFit: 'contain' }} />

              <div style={{ textAlign: 'center', flex: 1 }}>
                <p style={{ fontFamily: 'Poppins, sans-serif', color: '#FF2D78', fontSize: '10px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '2px' }}>
                  Glitz &amp; Glamour Studio
                </p>
                <p style={{ fontFamily: 'Poppins, sans-serif', color: '#fff', fontSize: '14px', fontWeight: 600 }}>
                  {session ? `Welcome back, ${session.user?.name?.split(' ')[0]} 💅` : 'Loyalty Card'}
                </p>
                <p style={{ fontFamily: 'Poppins, sans-serif', color: '#555', fontSize: '11px', marginTop: '2px' }}>
                  {loyaltyCount} / {STAMP_TOTAL} stamps collected
                </p>
              </div>

              {/* Right bow */}
              <img src="/new_bowdesign.svg" alt="Bow" width={32} height={32} style={{ display: 'inline-block', animation: 'bowPulse 2.8s ease-in-out infinite 0.4s', userSelect: 'none', objectFit: 'contain' }} />
            </div>

            {/* Hello Kitty stamp dots */}
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '16px' }}>
                {Array.from({ length: STAMP_TOTAL }).map((_, i) => {
                  const filled = i < loyaltyCount;
                  const isLast = i === STAMP_TOTAL - 1;
                  return (
                    <div key={i} style={{
                      width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
                      border: filled
                        ? isLast ? '2px solid rgba(255,215,0,0.6)' : '2px solid rgba(255,45,120,0.5)'
                        : '1.5px dashed rgba(255,255,255,0.1)',
                      background: filled
                        ? isLast ? 'linear-gradient(135deg, #FFD700, #FFA500)' : 'linear-gradient(135deg, #FF2D78, #FF6BA8)'
                        : 'rgba(255,255,255,0.02)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: filled
                        ? isLast ? '0 0 14px rgba(255,215,0,0.4)' : '0 0 10px rgba(255,45,120,0.35)'
                        : 'none',
                      transition: 'all 0.3s ease',
                    }}>
                      {filled ? (
                        isLast ? (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" fill="rgba(255,255,255,0.9)" />
                          </svg>
                        ) : (
                          <svg width="24" height="22" viewBox="0 0 60 55" fill="none">
                            <ellipse cx="30" cy="26" rx="24" ry="22" fill="white" />
                            <ellipse cx="10" cy="9" rx="7" ry="7" fill="white" />
                            <ellipse cx="50" cy="9" rx="7" ry="7" fill="white" />
                            <path d="M42 6 C42 6 50 2 52 6 C50 10 42 6 42 6z" fill="#FF2D78" opacity="0.9" />
                            <path d="M52 6 C52 6 60 2 60 6 C58 10 52 6 52 6z" fill="#FF6BA8" opacity="0.9" />
                            <circle cx="52" cy="6" r="2.5" fill="#FF2D78" />
                            <ellipse cx="22" cy="26" rx="3.5" ry="4" fill="#222" />
                            <ellipse cx="38" cy="26" rx="3.5" ry="4" fill="#222" />
                            <circle cx="23.5" cy="24" r="1.2" fill="white" />
                            <circle cx="39.5" cy="24" r="1.2" fill="white" />
                            <ellipse cx="30" cy="32" rx="2" ry="1.5" fill="#FF9BAD" />
                            <line x1="4" y1="30" x2="22" y2="32" stroke="#ddd" strokeWidth="1.5" strokeLinecap="round" />
                            <line x1="4" y1="35" x2="22" y2="34" stroke="#ddd" strokeWidth="1.5" strokeLinecap="round" />
                            <line x1="38" y1="32" x2="56" y2="30" stroke="#ddd" strokeWidth="1.5" strokeLinecap="round" />
                            <line x1="38" y1="34" x2="56" y2="35" stroke="#ddd" strokeWidth="1.5" strokeLinecap="round" />
                          </svg>
                        )
                      ) : (
                        <span style={{ fontSize: isLast ? '14px' : '12px', opacity: 0.18 }}>{isLast ? '★' : '✦'}</span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Blurred lock overlay for guests */}
              {!session && (
                <div style={{
                  position: 'absolute', inset: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(10,5,10,0.6)', borderRadius: '12px', backdropFilter: 'blur(3px)',
                  gap: '8px',
                }}>
                  <Lock size={14} color="#FF2D78" strokeWidth={2} />
                  <span style={{ fontFamily: 'Poppins, sans-serif', color: '#FF2D78', fontWeight: 600, fontSize: '13px' }}>
                    Sign up to start collecting
                  </span>
                </div>
              )}
            </div>

            {/* Progress bar */}
            <div style={{ height: '5px', background: 'rgba(255,255,255,0.04)', borderRadius: '3px', overflow: 'hidden', marginBottom: '10px' }}>
              <div style={{
                height: '100%',
                width: `${Math.min((loyaltyCount / STAMP_TOTAL) * 100, 100)}%`,
                background: spinAvailable
                  ? 'linear-gradient(90deg, #FFD700, #FFA500)'
                  : 'linear-gradient(90deg, #FF2D78, #FF6BA8)',
                borderRadius: '3px',
                transition: 'width 1.2s cubic-bezier(0.4,0,0.2,1)',
                boxShadow: spinAvailable ? '0 0 6px rgba(255,215,0,0.5)' : '0 0 5px rgba(255,45,120,0.4)',
              }} />
            </div>
            <p style={{ fontFamily: 'Poppins, sans-serif', color: spinAvailable ? '#FFD700' : '#555', fontSize: '12px', textAlign: 'center', fontWeight: spinAvailable ? 600 : 400 }}>
              {spinAvailable
                ? '🌟 Free spin ready — visit to redeem!'
                : session
                  ? `${STAMP_TOTAL - loyaltyCount} more visit${STAMP_TOTAL - loyaltyCount === 1 ? '' : 's'} until your free spin`
                  : 'Earn a stamp on every visit'}
            </p>
          </div>

          {/* CTA */}
          <div style={{ textAlign: 'center' }}>
            {session ? (
              <Link href="/card" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <img src="/new_bowdesign.svg" alt="Bow" width={20} height={20} style={{ objectFit: 'contain' }} /> View Our Card <ChevronRight size={15} />
                </span>
              </Link>
            ) : (
              <Link href="/sign-in" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                Get Started Free <ChevronRight size={15} />
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

