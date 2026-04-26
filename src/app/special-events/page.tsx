'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { ChevronRight, Sparkles, MapPin, Phone, Mail, Instagram } from 'lucide-react';

// Fallback data used when DB is empty
const FALLBACK_EVENTS = [
  { id:'f1', tag:'Bridal', name:'Weddings & Bridal', description:'Full glam for the bride, bridesmaids, and wedding party.', pills:'Hair,Makeup,Lashes', wide:true, gradient:'linear-gradient(135deg, #2d0f1e, #1A0A10)', imageUrl:null, isActive:true, displayOrder:0 },
  { id:'f2', tag:'Quinceañera', name:'Quinceañeras', description:'Celebrate her big day with flawless curls and bold lips.', pills:'Updo,Makeup,Nails', wide:false, gradient:'linear-gradient(135deg, #3a1525, #1A0A10)', imageUrl:null, isActive:true, displayOrder:1 },
  { id:'f3', tag:'Prom', name:'Prom & Homecoming', description:'Red-carpet glam for your biggest night.', pills:'Hair,Makeup', wide:false, gradient:'linear-gradient(135deg, #4a2035, #200d18)', imageUrl:null, isActive:true, displayOrder:2 },
  { id:'f4', tag:'Parties', name:'Showers & Parties', description:'Bachelorette, baby shower, birthday — picture-perfect.', pills:'Group Glam,Hair', wide:false, gradient:'linear-gradient(135deg, #2d1520, #1A0A10)', imageUrl:null, isActive:true, displayOrder:3 },
  { id:'f5', tag:'Corporate', name:'Corporate & Galas', description:'Professional looks for formal events.', pills:'Styling,Makeup', wide:true, gradient:'linear-gradient(135deg, #1a0f1e, #0d0810)', imageUrl:null, isActive:true, displayOrder:4 },
];
const FALLBACK_SERVICES = [
  { id:'s1', icon:'💇‍♀️', title:'Hair Styling', description:'Blowouts, waves, curls, and sleek finishes.' },
  { id:'s2', icon:'💄', title:'Full Glam Makeup', description:'Flawless, long-lasting makeup for photos.' },
  { id:'s3', icon:'✨', title:'Updos & Formal Hair', description:'Elegant updos for every occasion.' },
  { id:'s4', icon:'💅', title:'On-Location Service', description:'We come to your venue or home.' },
];

const STEPS = [
  { n:'1', t:'Submit Your Inquiry', d:'Fill out the form below — takes under 2 minutes.' },
  { n:'2', t:'Receive a Quote', d:'We respond within 48 hours with pricing.' },
  { n:'3', t:'Sign & Secure', d:'Review contract, sign, pay retainer.' },
  { n:'4', t:'Look Stunning', d:'Our team arrives. You relax.' },
];

const EVENT_TYPES = ['Wedding / Bridal','Quinceañera','Prom / Homecoming','Bridal Shower / Bachelorette','Baby Shower','Sweet 16 / Birthday','Corporate / Gala','Photo / Video Shoot','Other Special Event'];
const GUEST_COUNTS = ['Just me (1)','2–3 people','4–6 people','7–10 people','11–15 people','16+ people'];
const BUDGETS = ['Under $200','$200 – $500','$500 – $1,000','$1,000 – $2,500','$2,500+','Flexible / Unsure'];
const REFERRALS = ['Instagram','Facebook','Yelp','Google','Friend / Family Referral','Returning Client','Other'];
const SVC_OPTS = [
  { v:'Hair Styling', l:'Hair Styling (blowout, curls, waves)' },
  { v:'Updo', l:'Updo / Special Occasion Hair' },
  { v:'Makeup', l:'Makeup Application' },
  { v:'Lashes', l:'Lash Application' },
  { v:'Hair Color', l:'Hair Color' },
  { v:'Not sure yet', l:"Not sure yet — I'd love a recommendation" },
];

const glass = { background:'rgba(255,255,255,0.04)', backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)', border:'1px solid rgba(255,45,120,0.15)', borderRadius:'20px' };
const sectionLabel: React.CSSProperties = { fontFamily:'Poppins, sans-serif', color:'#FF2D78', fontWeight:600, fontSize:'11px', textTransform:'uppercase', letterSpacing:'3px', marginBottom:'10px' };
const sectionHeading: React.CSSProperties = { fontFamily:'Poppins, sans-serif', fontWeight:700, fontSize:'clamp(1.6rem, 4vw, 2.4rem)', color:'#fff', letterSpacing:'-0.5px', marginBottom:'8px' };
const inputStyle: React.CSSProperties = { width:'100%', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'12px', color:'white', fontFamily:'Poppins, sans-serif', fontSize:'15px', padding:'13px 16px', outline:'none', transition:'all 0.3s' };
const labelSt: React.CSSProperties = { display:'block', fontSize:'12px', fontWeight:600, color:'#FF2D78', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'0.5px', fontFamily:'Poppins, sans-serif' };

function fmtPhone(v: string) {
  const d = v.replace(/\D/g,'').slice(0,10);
  if (d.length>6) return `(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`;
  if (d.length>3) return `(${d.slice(0,3)}) ${d.slice(3)}`;
  return d.length ? `(${d}` : '';
}

type CatType = { id:string; tag:string; name:string; slug?:string|null; description:string; imageUrl:string|null; pills:string; wide:boolean; gradient:string };
type SvcType = { id:string; icon:string; title:string; description:string };
type HeroType = { eyebrow:string; headline:string; subtext:string; imageUrl:string|null } | null;
type HeroImgType = { id:string; url:string; order:number };

export default function SpecialEventsPage() {
  const [submitted, setSubmitted] = useState(false);
  const [events, setEvents] = useState<CatType[]>([]);
  const [services, setServices] = useState<SvcType[]>([]);
  const [hero, setHero] = useState<HeroType>(null);
  const [heroImages, setHeroImages] = useState<HeroImgType[]>([]);
  const [sliderIdx, setSliderIdx] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const inquireRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = 'Special Events — Glitz & Glamour Studio ✨';
    fetch('/api/special-events-content').then(r => r.json()).then(d => {
      setEvents(d.categories?.length ? d.categories : FALLBACK_EVENTS);
      setServices(d.services?.length ? d.services : FALLBACK_SERVICES);
      setHero(d.hero || null);
      setHeroImages(d.heroImages || []);
      setLoaded(true);
    }).catch(() => { setEvents(FALLBACK_EVENTS); setServices(FALLBACK_SERVICES); setLoaded(true); });
  }, []);

  // Hero slider crossfade timer
  useEffect(() => {
    if (heroImages.length > 1) {
      const id = setInterval(() => setSliderIdx(i => (i + 1) % heroImages.length), 5000);
      return () => clearInterval(id);
    }
  }, [heroImages]);

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior:'smooth' });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const form = formRef.current;
    if (!form) return;
    let ok = true;
    form.querySelectorAll<HTMLInputElement|HTMLSelectElement>('[required]').forEach(el => {
      if (!el.value.trim()) { el.style.borderColor='#FF2D78'; ok=false; } else { el.style.borderColor=''; }
    });
    if (!form.querySelectorAll<HTMLInputElement>('input[name="services"]:checked').length) ok=false;
    if (!ok) return;
    setSubmitted(true);
    inquireRef.current?.scrollIntoView({ behavior:'smooth', block:'center' });
  }

  const heroEyebrow = hero?.eyebrow || 'Vista, CA · Special Events';
  const heroHeadline = hero?.headline || 'Your most beautiful moments, made unforgettable.';
  const heroSubtext = hero?.subtext || 'Bridal parties, quinceañeras, proms, and every celebration in between. On-location glamour tailored to you.';

  return (
    <div style={{ position:'relative', zIndex:1 }}>

      {/* ══════ HERO ══════ */}
      <section style={{ padding:'0 24px', marginTop:'24px', display:'flex', justifyContent:'center' }}>
        <div style={{ width:'100%', maxWidth:'1200px', borderRadius:'32px', overflow:'hidden', position:'relative', minHeight:'480px', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 20px 40px rgba(0,0,0,0.5)' }}>
          {/* Hero slider / fallback gradient */}
          <div style={{ position:'absolute', inset:0, zIndex:0, backgroundColor:'#111' }}>
            {heroImages.length > 0 ? heroImages.map((img, i) => (
              <div key={img.id} style={{ position:'absolute', inset:0, opacity: i === sliderIdx ? 1 : 0, transition:'opacity 1s ease-in-out' }}>
                <Image src={img.url} alt="Special Events" fill priority={i === 0} style={{ objectFit:'cover', objectPosition:'center 30%' }} />
              </div>
            )) : (
              <div style={{ position:'absolute', inset:0, background:'linear-gradient(135deg, #2d0f1e 0%, #1A0A10 40%, #0d050a 100%)' }} />
            )}
            <div style={{ position:'absolute', inset:0, background:'linear-gradient(180deg, rgba(10,10,10,0.3) 0%, rgba(10,10,10,0.7) 60%, rgba(10,10,10,0.9) 100%)' }} />
          </div>
          <div style={{ position:'relative', zIndex:2, textAlign:'center', maxWidth:'640px', padding:'48px 24px' }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:'6px', background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.2)', backdropFilter:'blur(10px)', borderRadius:'50px', padding:'6px 14px', marginBottom:'20px' }}>
              <MapPin size={13} color="#FF2D78" strokeWidth={2.5} />
              <span style={{ fontFamily:'Poppins, sans-serif', fontSize:'13px', color:'#fff', fontWeight:500 }}>{heroEyebrow}</span>
            </div>
            <h1 style={{ fontFamily:'Poppins, sans-serif', fontWeight:800, fontSize:'clamp(2rem, 6vw, 3.5rem)', lineHeight:1.1, letterSpacing:'-1px', marginBottom:'16px' }}>
              <span className="text-gradient">{heroHeadline.split(',')[0]},</span>{' '}
              <span style={{ color:'#fff' }}>{heroHeadline.split(',').slice(1).join(',') || ''}</span>
            </h1>
            <p style={{ fontFamily:'Poppins, sans-serif', fontSize:'clamp(14px, 2vw, 16px)', color:'#ccc', marginBottom:'32px', lineHeight:1.7 }}>{heroSubtext}</p>
            <div style={{ display:'flex', gap:'12px', justifyContent:'center', flexWrap:'wrap' }}>
              <button className="btn-primary btn-pulse" onClick={() => scrollTo('inquire')} style={{ fontSize:'14px', padding:'12px 28px' }}>Start Your Inquiry <ChevronRight size={16} /></button>
              <button className="btn-outline" onClick={() => scrollTo('events')} style={{ fontSize:'14px', padding:'12px 28px', background:'rgba(255,255,255,0.05)', color:'#fff', borderColor:'rgba(255,255,255,0.3)' }}>View Events ↓</button>
            </div>
          </div>
        </div>
      </section>

      {/* ══════ EVENTS GRID ══════ */}
      <div style={{ padding:'0 24px' }}><hr style={{ border:'none', borderTop:'1px solid rgba(255,255,255,0.06)', margin:'40px auto 10px', maxWidth:'1040px' }} /></div>
      <section id="events" style={{ padding:'40px 24px' }}>
        <div style={{ maxWidth:'1040px', margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:'36px' }}>
            <p style={sectionLabel}><Sparkles size={14} style={{ display:'inline', marginRight:6 }} />What We Celebrate</p>
            <h2 style={sectionHeading}>Events We <span className="text-gradient">Love</span></h2>
            <p style={{ fontFamily:'Poppins, sans-serif', color:'#888', fontSize:'14px' }}>No matter the occasion, our team brings the perfect blend of artistry and attention.</p>
          </div>
          {!loaded ? (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:'10px' }}>
              {[1,2,3,4,5].map(i => <div key={i} className="skeleton" style={{ height:'200px', borderRadius:'14px' }} />)}
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:'10px' }}>
              {events.map((ev, i) => (
                <div key={ev.id || i} style={{ gridColumn:ev.wide?'span 2':'span 1', position:'relative', overflow:'hidden', borderRadius:'14px', border:'1px solid rgba(255,255,255,0.06)', height:ev.wide?'240px':'200px', cursor:'pointer', transition:'all 0.4s' }}>
                  {ev.imageUrl ? (
                    <div style={{ position:'absolute', inset:0, backgroundImage:`url(${ev.imageUrl})`, backgroundSize:'cover', backgroundPosition:'center', transition:'transform 0.7s' }} />
                  ) : (
                    <div style={{ position:'absolute', inset:0, background:ev.gradient, transition:'transform 0.7s' }} />
                  )}
                  <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)', zIndex:1 }} />
                  <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:'20px', zIndex:2 }}>
                    <span style={{ display:'inline-block', fontSize:'10px', fontWeight:700, letterSpacing:'1.5px', textTransform:'uppercase', background:'#FF2D78', color:'#fff', padding:'3px 10px', borderRadius:'50px', marginBottom:'8px', fontFamily:'Poppins, sans-serif' }}>{ev.tag}</span>
                    <p style={{ fontFamily:'Poppins, sans-serif', fontWeight:700, color:'#fff', fontSize:ev.wide?'20px':'16px', marginBottom:'4px' }}>{ev.name}</p>
                    <p style={{ fontFamily:'Poppins, sans-serif', color:'rgba(255,255,255,0.6)', fontSize:'12px', marginBottom:'8px' }}>{ev.description}</p>
                    <div style={{ display:'flex', gap:'6px', flexWrap:'wrap', alignItems:'center' }}>
                      {ev.pills.split(',').filter(Boolean).map(p => (
                        <span key={p} style={{ fontSize:'10px', letterSpacing:'0.5px', textTransform:'uppercase', border:'1px solid rgba(255,255,255,0.25)', color:'rgba(255,255,255,0.7)', padding:'2px 8px', borderRadius:'50px', fontFamily:'Poppins, sans-serif' }}>{p.trim()}</span>
                      ))}
                      {ev.slug && (
                        <Link href={`/special-events/${ev.slug}`} style={{ fontSize:'10px', fontWeight:700, letterSpacing:'0.5px', textTransform:'uppercase', background:'rgba(255,45,120,0.2)', border:'1px solid rgba(255,45,120,0.4)', color:'#FF6BA8', padding:'3px 12px', borderRadius:'50px', fontFamily:'Poppins, sans-serif', textDecoration:'none', marginLeft:'auto', transition:'all 0.2s' }}>View →</Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ══════ SERVICES BAR ══════ */}
      <section style={{ padding:'40px 24px' }}>
        <div style={{ maxWidth:'1040px', margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap:'12px' }}>
          {(loaded ? services : FALLBACK_SERVICES).map((s, i) => (
            <div key={s.id || i} style={{ ...glass, padding:'24px', transition:'all 0.3s' }}>
              <div style={{ fontSize:'28px', marginBottom:'12px' }}>{s.icon}</div>
              <h3 style={{ fontFamily:'Poppins, sans-serif', fontWeight:600, color:'#fff', fontSize:'15px', marginBottom:'6px' }}>{s.title}</h3>
              <p style={{ fontFamily:'Poppins, sans-serif', color:'#777', fontSize:'13px', lineHeight:1.6 }}>{s.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════ HOW IT WORKS ══════ */}
      <div style={{ padding:'0 24px' }}><hr style={{ border:'none', borderTop:'1px solid rgba(255,255,255,0.06)', margin:'0 auto 10px', maxWidth:'1040px' }} /></div>
      <section style={{ padding:'40px 24px 60px' }}>
        <div style={{ maxWidth:'1040px', margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:'36px' }}>
            <p style={sectionLabel}>How It Works</p>
            <h2 style={sectionHeading}>From <span className="text-gradient">Inquiry</span> to Event Day</h2>
            <p style={{ fontFamily:'Poppins, sans-serif', color:'#888', fontSize:'14px' }}>A simple, stress-free process so you can focus on celebrating.</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:'16px' }}>
            {STEPS.map((s,i) => (
              <div key={i} style={{ ...glass, padding:'28px 20px', textAlign:'center' }}>
                <div style={{ width:'48px', height:'48px', borderRadius:'50%', border:'2px solid #FF2D78', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', fontFamily:'Poppins, sans-serif', fontWeight:700, fontSize:'18px', color:'#FF2D78', background:'rgba(255,45,120,0.08)' }}>{s.n}</div>
                <h4 style={{ fontFamily:'Poppins, sans-serif', fontWeight:600, color:'#fff', fontSize:'14px', marginBottom:'6px' }}>{s.t}</h4>
                <p style={{ fontFamily:'Poppins, sans-serif', color:'#777', fontSize:'13px', lineHeight:1.6 }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ INQUIRY FORM ══════ */}
      <div style={{ padding:'0 24px' }}><hr style={{ border:'none', borderTop:'1px solid rgba(255,255,255,0.06)', margin:'0 auto 10px', maxWidth:'1040px' }} /></div>
      <section id="inquire" ref={inquireRef} style={{ padding:'40px 24px 80px' }}>
        <div style={{ maxWidth:'720px', margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:'32px' }}>
            <p style={sectionLabel}>Get Started</p>
            <h2 style={sectionHeading}>Tell Us About Your <span className="text-gradient">Event</span></h2>
            <p style={{ fontFamily:'Poppins, sans-serif', color:'#888', fontSize:'14px', maxWidth:'500px', margin:'0 auto 16px' }}>Fill out this short questionnaire and we&apos;ll reach out within 48 hours. No commitment required.</p>
            <div style={{ ...glass, padding:'12px 16px', display:'inline-flex', alignItems:'center', gap:'8px', fontSize:'13px', color:'#ccc', fontFamily:'Poppins, sans-serif' }}>
              <Sparkles size={14} color="#FF2D78" /> This is an inquiry, not a booking.
            </div>
          </div>
          <div style={{ display:'flex', gap:'8px', flexWrap:'wrap', justifyContent:'center', marginBottom:'32px' }}>
            {[
              { icon:<Phone size={13} />, text:'(760) 290-5910', href:'tel:+17602905910' },
              { icon:<Mail size={13} />, text:'info@glitzandglamours.com', href:'mailto:info@glitzandglamours.com' },
              { icon:<Instagram size={13} />, text:'@glitzandglamourstudio', href:'https://instagram.com/glitzandglamourstudio' },
            ].map((c,i) => (
              <a key={i} href={c.href} target="_blank" rel="noopener noreferrer" style={{ display:'inline-flex', alignItems:'center', gap:'6px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'50px', padding:'6px 14px', fontSize:'12px', color:'#aaa', textDecoration:'none', fontFamily:'Poppins, sans-serif', transition:'all 0.2s' }}>
                <span style={{ color:'#FF2D78' }}>{c.icon}</span> {c.text}
              </a>
            ))}
          </div>

          {!submitted ? (
            <div style={{ ...glass, padding:'32px 24px' }}>
              <form ref={formRef} noValidate onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'20px' }}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                  <div><label style={labelSt}>First Name *</label><input style={inputStyle} name="firstName" placeholder="Your first name" required /></div>
                  <div><label style={labelSt}>Last Name *</label><input style={inputStyle} name="lastName" placeholder="Your last name" required /></div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                  <div><label style={labelSt}>Phone *</label><input style={inputStyle} name="phone" placeholder="(000) 000-0000" required type="tel" maxLength={14} onChange={e => { e.target.value = fmtPhone(e.target.value); }} /></div>
                  <div><label style={labelSt}>Email *</label><input style={inputStyle} name="email" placeholder="you@email.com" required type="email" /></div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                  <div><label style={labelSt}>Event Type *</label><select style={{ ...inputStyle, appearance:'none' as const }} name="eventType" required defaultValue=""><option disabled value="">Select event</option>{EVENT_TYPES.map(t => <option key={t}>{t}</option>)}</select></div>
                  <div><label style={labelSt}>Event Date *</label><input style={inputStyle} name="eventDate" required type="date" /></div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                  <div><label style={labelSt}>Start Time</label><input style={inputStyle} name="startTime" type="time" /></div>
                  <div><label style={labelSt}>Guests Being Serviced *</label><select style={{ ...inputStyle, appearance:'none' as const }} name="guestCount" required defaultValue=""><option disabled value="">Select</option>{GUEST_COUNTS.map(g => <option key={g}>{g}</option>)}</select></div>
                </div>
                <div><label style={labelSt}>Event Location *</label><input style={inputStyle} name="location" placeholder="Venue name and city, or home address" required /></div>
                <div>
                  <label style={labelSt}>Services Needed *</label>
                  <div style={{ display:'flex', flexDirection:'column', gap:'8px', marginTop:'4px' }}>
                    {SVC_OPTS.map(s => (
                      <label key={s.v} style={{ display:'flex', alignItems:'center', gap:'10px', cursor:'pointer', fontFamily:'Poppins, sans-serif', fontSize:'14px', color:'#ccc', padding:'6px 0' }}>
                        <input name="services" type="checkbox" value={s.v} style={{ width:'18px', height:'18px', accentColor:'#FF2D78' }} /> {s.l}
                      </label>
                    ))}
                  </div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                  <div><label style={labelSt}>On-Location? *</label><select style={{ ...inputStyle, appearance:'none' as const }} name="onLocation" required defaultValue=""><option disabled value="">Select</option><option>Yes — come to my venue</option><option>No — we come to studio</option><option>Not sure yet</option></select></div>
                  <div><label style={labelSt}>Inspiration Look?</label><select style={{ ...inputStyle, appearance:'none' as const }} name="inspiration" defaultValue=""><option disabled value="">Select</option><option>Yes — I&apos;ll share photos</option><option>No — open to expertise</option><option>Somewhat</option></select></div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                  <div><label style={labelSt}>Budget Range</label><select style={{ ...inputStyle, appearance:'none' as const }} name="budget" defaultValue=""><option disabled value="">Select</option>{BUDGETS.map(b => <option key={b}>{b}</option>)}</select></div>
                  <div><label style={labelSt}>How&apos;d You Find Us?</label><select style={{ ...inputStyle, appearance:'none' as const }} name="referral" defaultValue=""><option disabled value="">Select</option>{REFERRALS.map(r => <option key={r}>{r}</option>)}</select></div>
                </div>
                <div><label style={labelSt}>Anything Else?</label><textarea style={{ ...inputStyle, resize:'none' as const, minHeight:'72px' }} name="notes" placeholder="Allergies, special requests, vibe..." rows={3} /></div>
                <button className="btn-primary" type="submit" style={{ width:'100%', padding:'16px', fontSize:'15px' }}>Send My Inquiry ✦</button>
                <p style={{ fontFamily:'Poppins, sans-serif', fontSize:'11px', color:'#666', lineHeight:1.6, textAlign:'center' }}>
                  By submitting, you agree that Glitz &amp; Glamour Studio may contact you regarding your event inquiry. This form does not confirm or hold your date.
                </p>
              </form>
            </div>
          ) : (
            <div style={{ ...glass, padding:'48px 32px', textAlign:'center', boxShadow:'0 8px 40px rgba(255,45,120,0.12)' }}>
              <div style={{ fontSize:'48px', marginBottom:'16px', animation:'spin-in 0.6s ease' }}>🌸</div>
              <h3 style={{ fontFamily:'Poppins, sans-serif', fontWeight:700, fontSize:'22px', marginBottom:'12px' }}>
                <span className="text-gradient">You&apos;re on our radar!</span>
              </h3>
              <p style={{ fontFamily:'Poppins, sans-serif', color:'#aaa', fontSize:'14px', lineHeight:1.7 }}>
                Your inquiry has been received. Expect a response within 48 hours.<br /><br />
                Follow us on Instagram <strong style={{ color:'#FF2D78' }}>@glitzandglamourstudio</strong> for inspo ✨
              </p>
              <Link href="/" className="btn-outline" style={{ marginTop:'24px', display:'inline-flex' }}>Back to Home</Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
