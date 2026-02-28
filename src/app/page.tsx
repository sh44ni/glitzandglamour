'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Star, ChevronRight, MapPin, Calendar, Award, Lock } from 'lucide-react';

const reviews = [
  { name: 'Guadalupe Lopez', text: 'Amazing nails experience! JoJany is incredibly talented and made sure I was happy with every detail. My nails came out perfect. Highly recommend!', date: 'Nov 2025' },
  { name: 'Kaylee', text: 'She gave me the most beautiful Barbie beach girl look! Exactly what I envisioned. JoJany is a true artist. I won\'t go anywhere else!', date: 'Oct 2025' },
  { name: 'Olivia Tate', text: 'She exceeded all my expectations! I came in with a reference photo and she matched it perfectly. The quality of her work is outstanding. Book her now!', date: 'Sep 2025' },
  { name: 'Janet D', text: 'Total vibe, she never disappoints! Every single visit is better than the last. The studio atmosphere is amazing and her work is always flawless.', date: 'Oct 2025' },
  { name: 'Gloria Jimenez', text: 'She goes above and beyond every time! JoJany truly cares about her clients and it shows in her work. My nails have never looked this good!', date: 'Oct 2025' },
];

const featuredServices = [
  { name: 'Acrylic Set', price: 'From $65', image: '/services/Full Set  GelX.jpeg', href: '/services#nails', wide: true },
  { name: 'Deep Cleansing Facial', price: 'From $85', image: '/services/Deep Cleansing + Extraction Facial.jpeg', href: '/services#facials' },
  { name: 'Balayage', price: 'From $380', image: '/services/Elegant_beauty_spa_202601022049.jpeg', href: '/services#haircolor' },
  { name: 'Jelly Foot Detox', price: 'From $75', image: '/services/Jelly Hydrating Foot Detox.jpeg', href: '/services#pedicures' },
  { name: 'Eyebrow Wax', price: 'From $12', image: '/services/Clean_professional_waxing_202601022049.jpeg', href: '/services#waxing' },
];

const STAMP_TOTAL = 10;

export default function HomePage() {
  const { data: session } = useSession();
  const [reviewIdx, setReviewIdx] = useState(0);
  const [reviewVisible, setReviewVisible] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [loyaltyCount, setLoyaltyCount] = useState(0);

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
    if (sliderImages.length > 1) {
      const id = setInterval(() => {
        setSliderIdx(i => (i + 1) % sliderImages.length);
      }, 5000);
      return () => clearInterval(id);
    }
  }, [sliderImages]);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setReviewVisible(false);
      setTimeout(() => {
        setReviewIdx(i => (i + 1) % reviews.length);
        setReviewVisible(true);
      }, 400);
    }, 4500);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  useEffect(() => {
    if (session) {
      fetch('/api/loyalty')
        .then(r => r.json())
        .then(d => {
          if (d.loyaltyCard) setLoyaltyCount(d.loyaltyCard.currentStamps);
        })
        .catch(console.error);
    }
  }, [session]);

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
          /* Mobile: taller so HTML text fits */
          min-height: 480px;
        }
        @media (min-width: 768px) {
          .hero-banner {
            aspect-ratio: 16/9;
            min-height: auto;
            max-height: 600px;
          }
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
                812 Frances Dr, Vista, CA 92083 · By Appointment
              </span>
            </div>

            <h1 style={{
              fontFamily: 'Poppins, sans-serif', fontWeight: 800, lineHeight: 1.05,
              fontSize: 'clamp(2.4rem, 7vw, 4.5rem)', letterSpacing: '-1.5px',
              marginBottom: '16px',
            }}>
              <span className="text-gradient">Nails.</span>{' '}
              <span style={{ color: 'white' }}>Hair.</span>{' '}
              <span className="text-gradient">Beauty.</span>
            </h1>

            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 'clamp(14px, 2vw, 16px)', color: '#eee', marginBottom: '32px', lineHeight: 1.6, fontWeight: 400 }}>
              I'll make you feel glamorous and confident.<br />Let's create something beautiful together.
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

      {/* ============ REVIEWS STRIP ============ */}
      <section style={{ padding: '0 24px', marginTop: '16px', position: 'relative', zIndex: 2 }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>

          {/* Rating header card */}
          <div className="glass" style={{ padding: '16px 24px', borderRadius: '16px', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '2px' }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={15} fill="#FFB700" color="#FFB700" />
                ))}
              </div>
              <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#fff', fontSize: '14px' }}>5.0</span>
              <span style={{ fontFamily: 'Poppins, sans-serif', color: '#ccc', fontSize: '13px' }}>· 116+ reviews on Setmore</span>
            </div>
            <Link href="https://glitzandglamourstudio.setmore.com/?source=instagram&instant_experiences_enabled=true#reviews" target="_blank" rel="noopener" style={{ fontFamily: 'Poppins, sans-serif', color: '#FF2D78', fontSize: '13px', fontWeight: 500, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
              See all <ChevronRight size={14} />
            </Link>
          </div>

          {/* Cycling review — properly contained */}
          <div className="glass" style={{ padding: '24px', borderRadius: '16px' }}>
            <div style={{
              opacity: reviewVisible ? 1 : 0,
              transform: reviewVisible ? 'translateY(0)' : 'translateY(6px)',
              transition: 'opacity 0.35s ease, transform 0.35s ease',
              minHeight: '80px',
            }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                {/* Avatar */}
                <div style={{
                  width: '38px', height: '38px', borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg, #FF2D78, #7928CA)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#fff', fontSize: '15px',
                }}>
                  {reviews[reviewIdx].name.charAt(0)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, color: '#fff', fontSize: '14px' }}>
                      {reviews[reviewIdx].name}
                    </span>
                    <div style={{ display: 'flex', gap: '1px' }}>
                      {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={11} fill="#FFB700" color="#FFB700" />)}
                    </div>
                    <span style={{ fontFamily: 'Poppins, sans-serif', color: '#aaa', fontSize: '12px' }}>
                      {reviews[reviewIdx].date}
                    </span>
                  </div>
                  <p style={{ fontFamily: 'Poppins, sans-serif', color: '#eee', fontSize: '14px', lineHeight: 1.65, fontStyle: 'italic' }}>
                    &ldquo;{reviews[reviewIdx].text}&rdquo;
                  </p>
                </div>
              </div>
            </div>

            {/* Dot indicators */}
            <div style={{ display: 'flex', gap: '5px', justifyContent: 'center', marginTop: '16px' }}>
              {reviews.map((_, i) => (
                <button key={i}
                  onClick={() => { setReviewIdx(i); setReviewVisible(true); }}
                  style={{
                    width: i === reviewIdx ? '18px' : '5px', height: '5px',
                    borderRadius: '3px', border: 'none', cursor: 'pointer',
                    background: i === reviewIdx ? '#FF2D78' : 'rgba(255,45,120,0.25)',
                    transition: 'all 0.3s ease', padding: 0,
                  }}
                />
              ))}
            </div>

            {/* View all / Leave review CTA */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginTop: '20px', flexWrap: 'wrap' }}>
              <Link href="/reviews" style={{ fontFamily: 'Poppins, sans-serif', color: '#bbb', fontSize: '13px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                View all reviews <ChevronRight size={14} />
              </Link>
              <span style={{ color: '#aaa', fontSize: '13px' }}>·</span>
              <Link href="/reviews" className="btn-outline" style={{ fontSize: '12px', padding: '7px 18px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <Star size={13} strokeWidth={1.75} /> Leave a Review
              </Link>
            </div>
          </div>
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
              What I Do
            </p>
            <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', color: '#fff', letterSpacing: '-0.5px', marginBottom: '8px' }}>
              Premium Beauty Services
            </h2>
            <p style={{ fontFamily: 'Poppins, sans-serif', color: '#bbb', fontSize: '14px' }}>
              Every price is a starting point — I'll discuss your look and finalize everything before confirming.
            </p>
          </div>

          {/* Bento grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {featuredServices.map((service, i) => (
              <Link key={i} href={service.href} style={{ textDecoration: 'none', gridColumn: i === 0 ? 'span 2' : 'span 1', display: 'block' }}>
                <div style={{
                  position: 'relative', overflow: 'hidden',
                  height: i === 0 ? '240px' : '170px',
                  borderRadius: '14px', cursor: 'pointer',
                  border: '1px solid rgba(255,255,255,0.06)',
                  transition: 'all 0.4s ease',
                }}>
                  <Image src={service.image} alt={service.name} fill
                    style={{ objectFit: 'cover', transition: 'transform 0.5s ease' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)' }} />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px 18px' }}>
                    <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, color: '#fff', fontSize: '15px', marginBottom: '3px' }}>
                      {service.name}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span style={{ fontFamily: 'Poppins, sans-serif', color: '#FF2D78', fontWeight: 700, fontSize: '13px' }}>
                        {service.price}
                      </span>
                      <div className="tooltip-container">
                        <span style={{ color: '#aaa', cursor: 'help', border: '1px solid #aaa', borderRadius: '50%', width: '14px', height: '14px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px' }}>i</span>
                        <div className="tooltip">Final price is discussed before I confirm your appointment</div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
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
        <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.06)', margin: '10px auto 40px', maxWidth: '1040px' }} />
      </div>
      <section style={{ padding: '0 24px 48px' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <div className="glass" style={{ padding: '40px 32px', borderColor: 'rgba(255,45,120,0.2)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(255,45,120,0.04) 0%, transparent 60%)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative', textAlign: 'center' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(255,45,120,0.1)', border: '1px solid rgba(255,45,120,0.2)', marginBottom: '16px' }}>
                <Award size={22} color="#FF2D78" strokeWidth={1.75} />
              </div>
              <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 'clamp(18px, 4vw, 24px)', color: '#fff', marginBottom: '10px' }}>
                Earn Stamps. Get Rewarded.
              </h2>
              <p style={{ fontFamily: 'Poppins, sans-serif', color: '#ccc', fontSize: '14px', marginBottom: '28px', lineHeight: 1.7, maxWidth: '420px', margin: '0 auto 28px' }}>
                Sign up and earn a stamp every visit. Collect 10 and earn a free spin at the wheel — redeemable in person.
              </p>

              {/* Stamp card preview */}
              <div style={{
                background: 'rgba(255,45,120,0.04)', border: '1px solid rgba(255,45,120,0.15)',
                borderRadius: '12px', padding: '18px 20px', marginBottom: '24px',
                position: 'relative', filter: session ? 'none' : 'blur(1.5px)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, color: '#FF2D78', fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase' }}>Glitz & Glamour Studio</span>
                  <span style={{ fontFamily: 'Poppins, sans-serif', color: '#bbb', fontSize: '12px' }}>{loyaltyCount} / {STAMP_TOTAL}</span>
                </div>
                {/* Stamp dots */}
                <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  {Array.from({ length: STAMP_TOTAL }).map((_, i) => {
                    const isFilled = i < loyaltyCount;
                    return (
                      <div key={i} style={{
                        width: '28px', height: '28px', borderRadius: '50%',
                        border: isFilled ? 'none' : '1.5px dashed rgba(255,45,120,0.25)',
                        background: isFilled ? 'linear-gradient(135deg, #FF2D78, #FF6BA8)' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: isFilled ? '0 0 10px rgba(255,45,120,0.3)' : 'none',
                      }}>
                        {isFilled && <Award size={14} color="#fff" strokeWidth={2} />}
                      </div>
                    );
                  })}
                </div>
                {!session && (
                  <div style={{
                    position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(10,10,10,0.55)', borderRadius: '12px', backdropFilter: 'blur(2px)',
                    gap: '6px',
                  }}>
                    <Lock size={13} color="#FF2D78" strokeWidth={2} />
                    <span style={{ fontFamily: 'Poppins, sans-serif', color: '#FF2D78', fontWeight: 500, fontSize: '13px' }}>
                      Sign up to unlock
                    </span>
                  </div>
                )}
              </div>

              {session ? (
                <Link href="/card" className="btn-primary">View My Card <ChevronRight size={15} /></Link>
              ) : (
                <Link href="/sign-in" className="btn-primary">Get Started Free <ChevronRight size={15} /></Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '56px 24px 8px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '40px', marginBottom: '40px' }}>
            {/* Brand */}
            <div>
              <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: '20px', background: 'linear-gradient(135deg, #FF2D78, #FF6BA8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: '8px' }}>
                Glitz & Glamour
              </div>
              <p style={{ fontFamily: 'Poppins, sans-serif', color: '#aaa', fontSize: '13px', lineHeight: 1.7 }}>
                Premium beauty studio<br />at 812 Frances Dr, Vista, CA 92083 · By JoJany Lavalle
              </p>
            </div>

            {/* Nav */}
            <div>
              <h4 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, color: '#fff', fontSize: '13px', marginBottom: '14px', letterSpacing: '0.5px' }}>Navigate</h4>
              {[['/', 'Home'], ['/services', 'Services'], ['/book', 'Book Appointment'], ['/reviews', 'Reviews'], ['/policy', 'Policies']].map(([href, label]) => (
                <Link key={href} href={href} style={{ display: 'block', color: '#aaa', fontSize: '13px', marginBottom: '8px', textDecoration: 'none', fontFamily: 'Poppins, sans-serif', transition: 'color 0.2s' }}
                  onMouseOver={e => { (e.currentTarget as HTMLElement).style.color = '#FF2D78'; }}
                  onMouseOut={e => { (e.currentTarget as HTMLElement).style.color = '#aaa'; }}>
                  {label}
                </Link>
              ))}
            </div>

            {/* Contact */}
            <div style={{ paddingBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
              <h4 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, color: '#fff', fontSize: '13px', marginBottom: '14px', letterSpacing: '0.5px' }}>Contact</h4>
              <div style={{ fontFamily: 'Poppins, sans-serif', color: '#aaa', fontSize: '13px', lineHeight: 2.1 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                  <MapPin size={14} color="#FF2D78" style={{ marginTop: '3px', flexShrink: 0 }} />
                  <span style={{ color: '#ccc', lineHeight: 1.6 }}>812 Frances Dr,<br />Vista, CA 92083</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <Calendar size={14} color="#FF2D78" />
                  <a href="tel:+17602905910" style={{ color: '#ccc', textDecoration: 'none', transition: 'color 0.2s' }}
                    onMouseOver={e => { (e.currentTarget as HTMLElement).style.color = '#FF2D78'; }}
                    onMouseOut={e => { (e.currentTarget as HTMLElement).style.color = '#ccc'; }}>
                    +1 (760) 290-5910
                  </a>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FF2D78" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                  <a href="mailto:info@glitzandglamours.com" style={{ color: '#ccc', textDecoration: 'none', transition: 'color 0.2s' }}
                    onMouseOver={e => { (e.currentTarget as HTMLElement).style.color = '#FF2D78'; }}
                    onMouseOut={e => { (e.currentTarget as HTMLElement).style.color = '#ccc'; }}>
                    info@glitzandglamours.com
                  </a>
                </div>
              </div>
            </div>

            {/* Payment */}
            <div style={{ paddingTop: '8px' }}>
              <h4 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, color: '#fff', fontSize: '13px', marginBottom: '14px', letterSpacing: '0.5px' }}>We Accept</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>

                {/* Cash */}
                <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '6px', height: '32px', padding: '0 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00D478" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"></rect><circle cx="12" cy="12" r="2"></circle><path d="M6 12h.01M18 12h.01"></path></svg>
                  <span style={{ fontFamily: 'Poppins, sans-serif', color: '#bbb', fontSize: '12px', fontWeight: 500 }}>Cash</span>
                </div>

                {/* Venmo */}
                <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '6px', height: '32px', padding: '0 12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="48" height="14" viewBox="0 0 512 512" fill="#008CFF" xmlns="http://www.w3.org/2000/svg">
                    <path d="M444.17,32H70.28C49.85,32,32,46.7,32,66.89V441.6C32,461.91,49.85,480,70.28,480H444.06C464.6,480,480,461.8,480,441.61V66.89C480.12,46.7,464.6,32,444.17,32ZM278,387H174.32L132.75,138.44l90.75-8.62,22,176.87c20.53-33.45,45.88-86,45.88-121.87,0-19.62-3.36-33-8.61-44L365.4,124.1c9.56,15.78,13.86,32,13.86,52.57C379.25,242.17,323.34,327.26,278,387Z" />
                  </svg>
                </div>

                {/* Zelle */}
                <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '6px', height: '32px', padding: '0 12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="34" height="24" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                    <path fill="#752EE1" d="M35,42H13c-3.866,0-7-3.134-7-7V13c0-3.866,3.134-7,7-7h22c3.866,0,7,3.134,7,7v22 C42,38.866,38.866,42,35,42z"></path><path fill="#fff" d="M17.5,18.5h14c0.552,0,1-0.448,1-1V15c0-0.552-0.448-1-1-1h-14c-0.552,0-1,0.448-1,1v2.5	C16.5,18.052,16.948,18.5,17.5,18.5z"></path><path fill="#fff" d="M17,34.5h14.5c0.552,0,1-0.448,1-1V31c0-0.552-0.448-1-1-1H17c-0.552,0-1,0.448-1,1v2.5	C16,34.052,16.448,34.5,17,34.5z"></path><path fill="#fff" d="M22.25,11v6c0,0.276,0.224,0.5,0.5,0.5h3.5c0.276,0,0.5-0.224,0.5-0.5v-6c0-0.276-0.224-0.5-0.5-0.5	h-3.5C22.474,10.5,22.25,10.724,22.25,11z"></path><path fill="#fff" d="M22.25,32v6c0,0.276,0.224,0.5,0.5,0.5h3.5c0.276,0,0.5-0.224,0.5-0.5v-6c0-0.276-0.224-0.5-0.5-0.5	h-3.5C22.474,31.5,22.25,31.724,22.25,32z"></path><path fill="#fff" d="M16.578,30.938H22l10.294-12.839c0.178-0.222,0.019-0.552-0.266-0.552H26.5L16.275,30.298	C16.065,30.553,16.247,30.938,16.578,30.938z"></path>
                  </svg>
                </div>

                {/* Cash App */}
                <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '6px', height: '32px', padding: '0 10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="22" height="22" viewBox="0 0 32 32" fill="#00D632" xmlns="http://www.w3.org/2000/svg">
                    <path d="M31.453 4.625c-0.688-1.891-2.177-3.375-4.068-4.063-1.745-0.563-3.333-0.563-6.557-0.563h-9.682c-3.198 0-4.813 0-6.531 0.531-1.896 0.693-3.385 2.188-4.068 4.083-0.547 1.734-0.547 3.333-0.547 6.531v9.693c0 3.214 0 4.802 0.531 6.536 0.688 1.891 2.177 3.375 4.068 4.063 1.734 0.547 3.333 0.547 6.536 0.547h9.703c3.214 0 4.813 0 6.536-0.531 1.896-0.688 3.391-2.182 4.078-4.078 0.547-1.734 0.547-3.333 0.547-6.536v-9.667c0-3.214 0-4.813-0.547-6.547zM23.229 10.802l-1.245 1.24c-0.25 0.229-0.635 0.234-0.891 0.010-1.203-1.010-2.724-1.568-4.292-1.573-1.297 0-2.589 0.427-2.589 1.615 0 1.198 1.385 1.599 2.984 2.198 2.802 0.938 5.12 2.109 5.12 4.854 0 2.99-2.318 5.042-6.104 5.266l-0.349 1.604c-0.063 0.302-0.328 0.516-0.635 0.516h-2.391l-0.12-0.010c-0.354-0.078-0.578-0.432-0.505-0.786l0.375-1.693c-1.438-0.359-2.76-1.083-3.844-2.094v-0.016c-0.25-0.25-0.25-0.656 0-0.906l1.333-1.292c0.255-0.234 0.646-0.234 0.896 0 1.214 1.146 2.839 1.786 4.521 1.76 1.734 0 2.891-0.734 2.891-1.896s-1.172-1.464-3.385-2.292c-2.349-0.839-4.573-2.026-4.573-4.802 0-3.224 2.677-4.797 5.854-4.943l0.333-1.641c0.063-0.302 0.333-0.516 0.641-0.51h2.37l0.135 0.016c0.344 0.078 0.573 0.411 0.495 0.76l-0.359 1.828c1.198 0.396 2.333 1.026 3.302 1.849l0.031 0.031c0.25 0.266 0.25 0.667 0 0.906z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <p style={{ fontFamily: 'Poppins, sans-serif', color: '#aaa', fontSize: '12px' }}>
              © 2026 Glitz & Glamour Studio · 812 Frances Dr, Vista, CA 92083
            </p>
            <p style={{ fontFamily: 'Poppins, sans-serif', color: '#aaa', fontSize: '12px' }}>
              Powered by <a href="https://projekts.pk" rel="noopener" target="_blank" style={{ color: '#FF2D78', textDecoration: 'none' }}>projekts.pk</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
