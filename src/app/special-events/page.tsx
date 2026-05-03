'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronRight, Sparkles, MapPin, Phone, Mail, Instagram, Heart, Star, Clock, Users, Car, Crown, Gift, Camera, ChevronDown, HelpCircle, X } from 'lucide-react';
import InquiryForm from './InquiryForm';
import SpecialEventPopup, { EventCountdownStrip } from '@/components/SpecialEventPopup';

type GalleryPhoto = { id: string; url: string; title: string; description: string; order: number };

/* ─── photo mapping ─── */
const HERO_SLIDES = [
  '/special-events/photo_5.jpg',
  '/special-events/photo_17.jpg',
  '/special-events/photo_20.jpg',
  '/special-events/photo_9.jpg',
];

const EVENTS = [
  { tag: 'Most Popular', badge: '#FF2D78', name: 'Weddings & Bridal', desc: 'Full glam for the bride, bridesmaids, and the entire wedding party. Hair, makeup, lashes — we do it all.', img: '/special-events/ev-weddings.png', pills: ['Hair', 'Makeup', 'Lashes', 'Updo'] },
  { tag: 'Celebration', badge: '#a855f7', name: 'Quinceañeras', desc: 'Celebrate her big day with show-stopping curls, flawless makeup, and the perfect tiara-ready look.', img: '/special-events/ev-quinceaneras.png', pills: ['Updo', 'Makeup', 'Nails'] },
  { tag: 'Milestone', badge: '#f59e0b', name: 'Baby Showers', desc: 'Radiant looks for the mom-to-be and her closest loved ones. Glow from the inside out.', img: '/special-events/ev-baby-showers.png', pills: ['Makeup', 'Hair', 'Glow'] },
  { tag: 'Red Carpet', badge: '#ec4899', name: 'Prom & Homecoming', desc: 'Hollywood-ready glam for prom night, homecoming, and every formal occasion that calls for perfection.', img: '/special-events/ev-prom.png', pills: ['Hair', 'Makeup', 'Styling'] },
  { tag: 'Professional', badge: '#3b82f6', name: 'Corporate & Gala Events', desc: 'Polished, refined looks for award nights, galas, networking events, and company celebrations.', img: '/special-events/ev-corporate.jpg', pills: ['Polished Glam', 'Hair', 'Makeup'] },
  { tag: 'Party', badge: '#06b6d4', name: 'Bridal Showers & Bachelorettes', desc: 'Pamper the bride-to-be and her girls with coordinated glam — from soft & romantic to full beat.', img: '/special-events/ev-bridal-shower.jpg', pills: ['Group Glam', 'Hair', 'Makeup'] },
  { tag: 'Sweet', badge: '#f472b6', name: 'Sweet 16 & Birthdays', desc: 'Make her 16th birthday legendary with age-appropriate glam that steals every photo.', img: '/special-events/ev-sweet16.jpg', pills: ['Makeup', 'Hair', 'Nails'] },
  { tag: 'Creative', badge: '#8b5cf6', name: 'Photo & Video Shoots', desc: 'Editorial, lifestyle, or content — we create camera-ready looks that pop in every frame.', img: '/special-events/ev-photo-shoots.jpg', pills: ['Editorial', 'HD Makeup', 'Styling'] },
];

const SERVICES = [
  { icon: <Star size={22} />, title: 'Full Glam Makeup', desc: 'HD, natural, and editorial — every finish, every skin tone, every occasion.' },
  { icon: <Crown size={22} />, title: 'Hair Styling', desc: 'Updos, blowouts, braids, curls, and extensions. Precision work that lasts all night.' },
  { icon: <Car size={22} />, title: 'On-Location Service', desc: 'We come to your venue, hotel, or home — no travel stress on your big day.' },
  { icon: <Users size={22} />, title: 'Group Packages', desc: 'Coordinated timelines for bridal parties, courts, and groups of any size.' },
];

const STEPS = [
  { n: '01', t: 'Submit Your Inquiry', d: 'Fill out the questionnaire below with your event details. Takes less than 2 minutes.' },
  { n: '02', t: 'Receive a Quote', d: 'We will review your details and reach out within 48 hours with pricing and availability.' },
  { n: '03', t: 'Sign & Secure', d: 'Review your contract, sign, and pay your retainer to lock in your date.' },
  { n: '04', t: 'Look Stunning', d: 'Our team arrives ready. You relax and let the magic happen.' },
];


/* ─── FAQ data for SEO ─── */
const FAQS = [
  { q: 'How far in advance should I book for my event?', a: 'We recommend booking at least 4–6 weeks in advance for most events. For weddings, quinceañeras, and large bridal parties, we suggest securing your date 2–3 months ahead to guarantee availability.' },
  { q: 'Do you offer on-location services?', a: 'Absolutely! We travel to your venue, hotel, home, or any location of your choice throughout Vista, Oceanside, San Diego County, and surrounding areas. Travel is not limited to San Diego County, and a travel fee may apply depending on the location.' },
  { q: 'How many people can you accommodate in one event?', a: 'Our team can accommodate events of different sizes — from solo glam sessions to larger bridal parties and special events. If needed, we will coordinate multiple artists to make sure everyone is camera-ready on time.' },
  { q: 'What is included in a bridal/event package?', a: 'Bridal and event packages can be customized based on your needs, service location, timeline, and party size. Packages may include hair styling, makeup application, false lashes, a trial run for weddings, on-location services, and coordination for your event day. A custom quote will be provided based on the services requested.' },
  { q: 'Do you provide trial sessions before the event?', a: 'Yes! We highly recommend trial sessions for weddings and quinceañeras. This ensures you love your final look and gives us time to perfect every detail before the big day.' },
  { q: 'What brands and products do you use?', a: 'We use a variety of professional, high-quality products selected for long wear, photography, and a flawless finish. Our kit may include brands such as Charlotte Tilbury, MAC, NARS, Anastasia Beverly Hills, Morphe, Too Faced, NYX, and other trusted beauty brands. Products are chosen based on your skin type, tone, desired look, and the needs of your event.' },
  { q: 'What is your cancellation and refund policy?', a: 'A non-refundable retainer is required to reserve your event date and secure our team\'s availability. Cancellation, rescheduling, and payment details will be outlined in your personalized agreement after your consultation.' },
  { q: 'Can you work with specific themes or color palettes?', a: 'Of course! We love collaborating on themed events. Share your mood board, color palette, or Pinterest inspiration and we will tailor every look to match your vision perfectly.' },
];

export default function SpecialEventsPage() {
  const [sliderIdx, setSliderIdx] = useState(0);
  const [activeEvent, setActiveEvent] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [galleryPhotos, setGalleryPhotos] = useState<GalleryPhoto[]>([]);
  const [openPhoto, setOpenPhoto] = useState<GalleryPhoto | null>(null);
  const [showOffer, setShowOffer] = useState(false);

  // Lock body scroll & add ESC key handler when gallery popup is open
  useEffect(() => {
    if (!openPhoto) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpenPhoto(null); };
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', handleKey);
    };
  }, [openPhoto]);

  useEffect(() => {
    document.title = 'Special Events — Glitz & Glamour Studio ✨';
    const id = setInterval(() => setSliderIdx(i => (i + 1) % HERO_SLIDES.length), 5000);
    fetch('/api/admin/gallery-photos')
      .then(r => r.ok ? r.json() : { photos: [] })
      .then(d => { if (d.photos?.length) setGalleryPhotos(d.photos); })
      .catch(() => {});
    return () => clearInterval(id);
  }, []);

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div style={{ position: 'relative', zIndex: 1 }}>

      {/* Special Event Popup — only on this page, once per session */}
      <SpecialEventPopup forceOpen={showOffer} onClose={() => setShowOffer(false)} />

      {/* ══════════════ HERO ══════════════ */}
      <section style={{ padding: '0 20px', marginTop: '20px' }}>
        <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', borderRadius: '28px', overflow: 'hidden', position: 'relative', minHeight: '520px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 24px 60px rgba(0,0,0,0.6)' }}>
          {/* Slider */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
            {HERO_SLIDES.map((src, i) => (
              <div key={i} style={{ position: 'absolute', inset: 0, opacity: i === sliderIdx ? 1 : 0, transition: 'opacity 1.2s ease-in-out' }}>
                <Image src={src} alt="Special Events" fill priority={i === 0} style={{ objectFit: 'cover', objectPosition: 'center 25%' }} sizes="100vw" />
              </div>
            ))}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(10,10,10,0.25) 0%, rgba(10,10,10,0.6) 50%, rgba(10,10,10,0.92) 100%)' }} />
          </div>
          {/* Dots */}
          <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '8px', zIndex: 5 }}>
            {HERO_SLIDES.map((_, i) => (
              <button key={i} onClick={() => setSliderIdx(i)} style={{ width: i === sliderIdx ? '24px' : '8px', height: '8px', borderRadius: '4px', border: 'none', background: i === sliderIdx ? '#FF2D78' : 'rgba(255,255,255,0.4)', transition: 'all 0.3s', cursor: 'pointer' }} />
            ))}
          </div>
          {/* Content */}
          <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: '660px', padding: '56px 24px 64px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', borderRadius: '50px', padding: '6px 16px', marginBottom: '20px' }}>
              <MapPin size={13} color="#FF2D78" strokeWidth={2.5} />
              <span style={{ fontSize: '13px', color: '#fff', fontWeight: 500 }}>Vista, CA · Glitz & Glamour Studio</span>
            </div>
            <h1 style={{ fontWeight: 800, fontSize: 'clamp(2rem,6vw,3.5rem)', lineHeight: 1.08, letterSpacing: '-1px', marginBottom: '16px' }}>
              <span className="text-gradient">Your most <em style={{ fontStyle: 'italic' }}>beautiful</em> moments,</span>{' '}
              <span style={{ color: '#fff' }}>made unforgettable.</span>
            </h1>
            <p style={{ fontSize: 'clamp(14px,2vw,16px)', color: '#ccc', marginBottom: '32px', lineHeight: 1.7 }}>
              Bridal parties, quinceañeras, proms, and every celebration in between. On-location glamour tailored to you — by Glitz & Glamour Studio.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn-primary btn-pulse" onClick={() => scrollTo('inquire')} style={{ fontSize: '14px', padding: '13px 28px' }}>Start Your Inquiry <ChevronRight size={16} /></button>
              <button className="btn-outline" onClick={() => scrollTo('events')} style={{ fontSize: '14px', padding: '13px 28px', background: 'rgba(255,255,255,0.05)', color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}>View Events ↓</button>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════ URGENCY COUNTDOWN STRIP ══════════════ */}
      <div style={{ padding: '32px 0 0' }}>
        <EventCountdownStrip onLearnMore={() => setShowOffer(true)} />
      </div>

      {/* ══════════════ EVENTS ══════════════ */}
      <div style={{ padding: '0 20px' }}><hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.06)', margin: '48px auto 0', maxWidth: '1100px' }} /></div>
      <section id="events" style={{ padding: '48px 20px 56px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <p style={{ color: '#FF2D78', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '10px' }}><Sparkles size={14} style={{ display: 'inline', marginRight: 6 }} />What We Celebrate</p>
            <h2 style={{ fontWeight: 700, fontSize: 'clamp(1.6rem,4vw,2.4rem)', letterSpacing: '-0.5px', marginBottom: '8px' }}>Events We <span className="text-gradient">Love</span></h2>
            <p style={{ color: '#888', fontSize: '14px', maxWidth: '500px', margin: '0 auto' }}>No matter the occasion, our team brings artistry and attention to every detail.</p>
          </div>

          {/* Event Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            {EVENTS.map((ev, i) => (
              <div key={i} onClick={() => setActiveEvent(i)} style={{ position: 'relative', overflow: 'hidden', borderRadius: '20px', border: i === activeEvent ? '1px solid rgba(255,45,120,0.5)' : '1px solid rgba(255,255,255,0.06)', height: '340px', cursor: 'pointer', transition: 'all 0.4s', boxShadow: i === activeEvent ? '0 12px 40px rgba(255,45,120,0.15)' : 'none' }}>
                <Image src={ev.img} alt={ev.name} fill style={{ objectFit: 'cover', objectPosition: 'center 20%', transition: 'transform 0.7s' }} sizes="(max-width:768px) 100vw, 25vw" />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.35) 50%, transparent 100%)', zIndex: 1 }} />
                <div style={{ position: 'absolute', top: '16px', left: '16px', zIndex: 3 }}>
                  <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', background: ev.badge, color: '#fff', padding: '4px 12px', borderRadius: '50px' }}>{ev.tag}</span>
                </div>
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px', zIndex: 2 }}>
                  <h3 style={{ fontWeight: 700, color: '#fff', fontSize: '18px', marginBottom: '6px' }}>{ev.name}</h3>
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', lineHeight: 1.6, marginBottom: '10px' }}>{ev.desc}</p>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {ev.pills.map(p => (
                      <span key={p} style={{ fontSize: '10px', letterSpacing: '0.5px', textTransform: 'uppercase', border: '1px solid rgba(255,255,255,0.25)', color: 'rgba(255,255,255,0.7)', padding: '2px 10px', borderRadius: '50px' }}>{p}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ SERVICES BAR ══════════════ */}
      <section style={{ padding: '0 20px 56px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '12px' }}>
          {SERVICES.map((s, i) => (
            <div key={i} className="glass-card" style={{ padding: '28px 20px', transition: 'all 0.3s' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(255,45,120,0.1)', border: '1px solid rgba(255,45,120,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FF2D78', marginBottom: '14px' }}>{s.icon}</div>
              <h3 style={{ fontWeight: 600, color: '#fff', fontSize: '15px', marginBottom: '6px' }}>{s.title}</h3>
              <p style={{ color: '#777', fontSize: '13px', lineHeight: 1.6 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════ GALLERY — BENTO MASONRY ══════════════ */}
      <div style={{ padding: '0 20px' }}><hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.06)', margin: '0 auto', maxWidth: '1100px' }} /></div>
      <section style={{ padding: '48px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <p style={{ color: '#FF2D78', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '10px' }}><Heart size={14} style={{ display: 'inline', marginRight: 6 }} />Our Work</p>
            <h2 style={{ fontWeight: 700, fontSize: 'clamp(1.6rem,4vw,2.4rem)', letterSpacing: '-0.5px', marginBottom: '8px' }}>Moments We&apos;ve <span className="text-gradient">Created</span></h2>
            <p style={{ color: '#888', fontSize: '14px', maxWidth: '440px', margin: '0 auto' }}>Every look, every detail, every unforgettable moment — crafted by our team.</p>
          </div>

          {/* Bento masonry grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gridAutoRows: '160px',
            gap: '10px',
          }}>
{galleryPhotos.length === 0 ? (
              <div style={{ gridColumn: 'span 4', textAlign: 'center', padding: '60px 20px', color: '#444', fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}>
                Gallery photos coming soon.
              </div>
            ) : galleryPhotos.map((g, i) => (
              <div
                key={g.id}
                className="gallery-cell"
                onClick={() => setOpenPhoto(g)}
                style={{
                  gridColumn: `span ${i % 3 === 0 ? 2 : 1}`,
                  gridRow: `span ${i % 5 === 0 ? 2 : 1}`,
                  position: 'relative',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  border: '1px solid rgba(255,255,255,0.06)',
                  cursor: 'pointer',
                  animationDelay: `${i * 80}ms`,
                }}
              >
                <Image
                  src={g.url}
                  alt={g.title || `Gallery photo ${i + 1}`}
                  fill
                  style={{ objectFit: 'cover', objectPosition: 'center 20%', transition: 'transform 0.6s cubic-bezier(0.23,1,0.32,1)' }}
                  sizes="(max-width:768px) 50vw, 25vw"
                />
                <div className="gallery-overlay" style={{
                  position: 'absolute', inset: 0, zIndex: 2,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(255,45,120,0.08) 50%, transparent 100%)',
                  opacity: 0, transition: 'opacity 0.4s',
                  display: 'flex', alignItems: 'flex-end', padding: '20px',
                }}>
                  <div>
                    <span style={{ display: 'inline-block', fontSize: '10px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', background: '#FF2D78', color: '#fff', padding: '3px 10px', borderRadius: '50px', marginBottom: '6px' }}>
                      <Sparkles size={10} style={{ display: 'inline', marginRight: 4 }} />Glam
                    </span>
                    <p style={{ color: '#fff', fontWeight: 600, fontSize: '15px', margin: 0 }}>{g.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA below gallery */}
          <div style={{ textAlign: 'center', marginTop: '32px' }}>
            <a href="https://instagram.com/glitzandglamourstudio" target="_blank" rel="noopener noreferrer" style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: 'rgba(255,45,120,0.08)', border: '1px solid rgba(255,45,120,0.25)',
              borderRadius: '50px', padding: '10px 24px',
              color: '#FF2D78', fontWeight: 600, fontSize: '13px',
              textDecoration: 'none', transition: 'all 0.3s',
              letterSpacing: '0.3px',
            }}>
              <Instagram size={16} /> See more on Instagram
            </a>
          </div>
        </div>
      </section>

      {/* ── Gallery Photo Popup (portaled to body to escape stacking context) ── */}
      {openPhoto && createPortal(
        <div
          onClick={() => setOpenPhoto(null)}
          style={{ position: 'fixed', inset: 0, zIndex: 1050, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', overscrollBehavior: 'contain' } as React.CSSProperties}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '560px', width: '100%', background: 'linear-gradient(135deg, rgba(30,10,20,0.98), rgba(20,5,15,0.98))', border: '1px solid rgba(255,45,120,0.25)', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.7)' }}
          >
            <div style={{ position: 'relative', height: '300px', width: '100%' }}>
              <Image src={openPhoto.url} alt={openPhoto.title || 'Gallery photo'} fill style={{ objectFit: 'cover' }} sizes="560px" />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(20,5,15,0.9) 0%, transparent 60%)' }} />
              <button
                onClick={() => setOpenPhoto(null)}
                style={{ position: 'absolute', top: '14px', right: '14px', width: '34px', height: '34px', borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}
              >
                <X size={16} />
              </button>
              <div style={{ position: 'absolute', bottom: '16px', left: '20px' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '10px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', background: '#FF2D78', color: '#fff', padding: '4px 12px', borderRadius: '50px' }}>
                  <Sparkles size={10} />Glam
                </span>
              </div>
            </div>
            <div style={{ padding: '24px 28px 28px' }}>
              {openPhoto.title && (
                <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '22px', color: '#fff', marginBottom: '10px', lineHeight: 1.2 }}>
                  {openPhoto.title}
                </h3>
              )}
              {openPhoto.description && (
                <p style={{ fontFamily: 'Poppins, sans-serif', color: '#aaa', fontSize: '14px', lineHeight: 1.7, margin: 0 }}>
                  {openPhoto.description}
                </p>
              )}
              <button
                onClick={() => setOpenPhoto(null)}
                style={{ marginTop: '20px', width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(255,45,120,0.1)', border: '1px solid rgba(255,45,120,0.25)', color: '#FF2D78', fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Gallery hover + animation styles */}
      <style jsx>{`
        .gallery-cell {
          animation: galFadeIn 0.6s ease both;
        }
        .gallery-cell:hover img {
          transform: scale(1.08);
        }
        .gallery-cell:hover .gallery-overlay {
          opacity: 1 !important;
        }
        .gallery-cell:hover {
          box-shadow: 0 0 24px rgba(255,45,120,0.2), 0 8px 32px rgba(0,0,0,0.3);
          border-color: rgba(255,45,120,0.3) !important;
        }
        @keyframes galFadeIn {
          from { opacity:0; transform: translateY(20px) scale(0.97); }
          to   { opacity:1; transform: translateY(0) scale(1); }
        }
        @media (max-width: 768px) {
          .gallery-cell {
            grid-column: span 2 !important;
          }
        }
        @media (max-width: 480px) {
          .gallery-cell {
            grid-column: span 2 !important;
            grid-row: span 1 !important;
          }
        }
      `}</style>

      {/* ══════════════ HOW IT WORKS ══════════════ */}
      <div style={{ padding: '0 20px' }}><hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.06)', margin: '0 auto', maxWidth: '1100px' }} /></div>
      <section style={{ padding: '48px 20px 64px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <p style={{ color: '#FF2D78', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '10px' }}><Clock size={14} style={{ display: 'inline', marginRight: 6 }} />How It Works</p>
            <h2 style={{ fontWeight: 700, fontSize: 'clamp(1.6rem,4vw,2.4rem)', letterSpacing: '-0.5px', marginBottom: '8px' }}>From <span className="text-gradient">Inquiry</span> to Event Day</h2>
            <p style={{ color: '#888', fontSize: '14px' }}>A simple, stress-free process so you can focus on celebrating.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            {STEPS.map((s, i) => (
              <div key={i} className="glass-card" style={{ padding: '32px 20px', textAlign: 'center', position: 'relative' }}>
                {i < STEPS.length - 1 && <div style={{ position: 'absolute', top: '42px', right: '-8px', width: '16px', height: '2px', background: 'rgba(255,45,120,0.3)', display: 'none' }} className="step-line" />}
                <div style={{ width: '52px', height: '52px', borderRadius: '50%', border: '2px solid #FF2D78', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontWeight: 700, fontSize: '16px', color: '#FF2D78', background: 'rgba(255,45,120,0.08)' }}>{s.n}</div>
                <h4 style={{ fontWeight: 600, color: '#fff', fontSize: '15px', marginBottom: '8px' }}>{s.t}</h4>
                <p style={{ color: '#777', fontSize: '13px', lineHeight: 1.6 }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ FAQ — SEO BEAST ══════════════ */}
      <div style={{ padding: '0 20px' }}><hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.06)', margin: '0 auto', maxWidth: '1100px' }} /></div>
      <section id="faq" style={{ padding: '48px 20px 64px' }} aria-label="Frequently Asked Questions">
        <div style={{ maxWidth: '780px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <p style={{ color: '#FF2D78', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '10px' }}><HelpCircle size={14} style={{ display: 'inline', marginRight: 6 }} />FAQ</p>
            <h2 style={{ fontWeight: 700, fontSize: 'clamp(1.6rem,4vw,2.4rem)', letterSpacing: '-0.5px', marginBottom: '8px' }}>Frequently Asked <span className="text-gradient">Questions</span></h2>
            <p style={{ color: '#888', fontSize: '14px', maxWidth: '500px', margin: '0 auto' }}>Everything you need to know about booking your special event glam with us.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {FAQS.map((faq, i) => (
              <details
                key={i}
                open={openFaq === i}
                onToggle={(e) => {
                  if ((e.target as HTMLDetailsElement).open) setOpenFaq(i);
                  else if (openFaq === i) setOpenFaq(null);
                }}
                className="glass-card"
                style={{ padding: 0, overflow: 'hidden', cursor: 'pointer', transition: 'all 0.3s' }}
              >
                <summary
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', fontSize: '15px', fontWeight: 600, color: '#fff', listStyle: 'none', userSelect: 'none', gap: '12px' }}
                >
                  <span style={{ flex: 1 }}>{faq.q}</span>
                  <ChevronDown size={18} style={{ color: '#FF2D78', transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.3s', flexShrink: 0 }} />
                </summary>
                <div style={{ padding: '0 22px 20px', color: '#999', fontSize: '14px', lineHeight: 1.8 }}>
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* JSON-LD FAQ Schema for rich snippets */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: FAQS.map(f => ({
                '@type': 'Question',
                name: f.q,
                acceptedAnswer: { '@type': 'Answer', text: f.a }
              }))
            })
          }}
        />
      </section>

      {/* ══════════════ INQUIRY FORM ══════════════ */}
      <div style={{ padding: '0 20px' }}><hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.06)', margin: '0 auto', maxWidth: '1100px' }} /></div>
      <section id="inquire" style={{ padding: '48px 20px 80px' }}>
        <div style={{ maxWidth: '780px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <p style={{ color: '#FF2D78', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '10px' }}>Get Started</p>
            <h2 style={{ fontWeight: 700, fontSize: 'clamp(1.6rem,4vw,2.4rem)', letterSpacing: '-0.5px', marginBottom: '8px' }}>Tell Us About Your <span className="text-gradient">Event</span></h2>
            <p style={{ color: '#888', fontSize: '14px', maxWidth: '500px', margin: '0 auto 16px' }}>Fill out this short questionnaire and we&apos;ll reach out within 48 hours. No commitment required.</p>
            <div className="glass-card" style={{ padding: '10px 16px', display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#ccc', borderRadius: '50px' }}>
              <Sparkles size={14} color="#FF2D78" /> This is an inquiry, not a booking.
            </div>
          </div>
          {/* Contact pills */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '32px' }}>
            {[
              { icon: <Phone size={13} />, text: '(760) 290-5910', href: 'tel:+17602905910' },
              { icon: <Mail size={13} />, text: 'info@glitzandglamours.com', href: 'mailto:info@glitzandglamours.com' },
              { icon: <Instagram size={13} />, text: '@glitzandglamourstudio', href: 'https://instagram.com/glitzandglamourstudio' },
            ].map((c, i) => (
              <a key={i} href={c.href} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '50px', padding: '6px 14px', fontSize: '12px', color: '#aaa', textDecoration: 'none', transition: 'all 0.2s' }}>
                <span style={{ color: '#FF2D78' }}>{c.icon}</span> {c.text}
              </a>
            ))}
          </div>
          <InquiryForm />
        </div>
      </section>
    </div>
  );
}

