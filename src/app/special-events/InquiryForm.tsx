'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ChevronDown, Calendar, Clock as ClockIcon, Check } from 'lucide-react';

const EVENT_TYPES = ['Wedding / Bridal','Quinceañera','Prom / Homecoming','Bridal Shower / Bachelorette','Baby Shower','Sweet 16 / Birthday','Corporate / Gala','Photo / Video Shoot','Other Special Event'];
const GUEST_COUNTS = ['Just me (1)','2–3 people','4–6 people','7–10 people','11–15 people','16+ people'];
const BUDGETS = ['Under $200','$200 – $500','$500 – $1,000','$1,000 – $2,500','$2,500+','Flexible / Unsure'];
const REFERRALS = ['Instagram','Facebook','Yelp','Google','Friend / Family Referral','Returning Client','Other'];
const ON_LOC = ['Yes — come to my venue','No — we come to studio','Not sure yet'];
const INSPO = ['Yes — I\'ll share photos','No — open to expertise','Somewhat'];
const SVC_OPTS = [
  { v:'Hair Styling', l:'Hair Styling (blowout, curls, waves)' },
  { v:'Updo', l:'Updo / Special Occasion Hair' },
  { v:'Makeup', l:'Makeup Application' },
  { v:'Lashes', l:'Lash Application' },
  { v:'Hair Color', l:'Hair Color' },
  { v:'Not sure yet', l:"Not sure yet — I'd love a recommendation" },
];
const TIME_SLOTS = ['6:00 AM','6:30 AM','7:00 AM','7:30 AM','8:00 AM','8:30 AM','9:00 AM','9:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM','12:00 PM','12:30 PM','1:00 PM','1:30 PM','2:00 PM','2:30 PM','3:00 PM','3:30 PM','4:00 PM','4:30 PM','5:00 PM','5:30 PM','6:00 PM'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const glass = { background:'rgba(255,255,255,0.04)', backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)', border:'1px solid rgba(255,45,120,0.15)', borderRadius:'20px' };
const inputStyle: React.CSSProperties = { width:'100%', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'12px', color:'white', fontFamily:'Poppins, sans-serif', fontSize:'15px', padding:'13px 16px', outline:'none', transition:'all 0.3s' };
const labelSt: React.CSSProperties = { display:'block', fontSize:'12px', fontWeight:600, color:'#FF2D78', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'0.5px', fontFamily:'Poppins, sans-serif' };

function fmtPhone(v: string) {
  const d = v.replace(/\D/g,'').slice(0,10);
  if (d.length>6) return `(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`;
  if (d.length>3) return `(${d.slice(0,3)}) ${d.slice(3)}`;
  return d.length ? `(${d}` : '';
}

/* ─── Custom Dropdown ─── */
function CustomSelect({ label, placeholder, options, value, onChange, required, icon }: {
  label: string; placeholder: string; options: string[]; value: string;
  onChange: (v: string) => void; required?: boolean; icon?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} style={{ position:'relative' }}>
      <label style={labelSt}>{label}{required && ' *'}</label>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          ...inputStyle,
          display:'flex', alignItems:'center', justifyContent:'space-between', gap:'8px',
          cursor:'pointer', textAlign:'left',
          borderColor: open ? 'rgba(255,45,120,0.4)' : value ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.1)',
          boxShadow: open ? '0 0 16px rgba(255,45,120,0.1)' : 'none',
        }}
      >
        <span style={{ display:'flex', alignItems:'center', gap:'8px', flex:1, color: value ? '#fff' : '#777' }}>
          {icon && <span style={{ color:'#FF2D78', flexShrink:0, display:'flex' }}>{icon}</span>}
          {value || placeholder}
        </span>
        <ChevronDown size={16} style={{ color:'#FF2D78', transition:'transform 0.3s', transform: open ? 'rotate(180deg)' : 'rotate(0)', flexShrink:0 }} />
      </button>
      {open && (
        <div style={{
          position:'absolute', top:'100%', left:0, right:0, zIndex:50,
          marginTop:'6px', borderRadius:'14px', overflow:'hidden',
          background:'rgba(20,10,20,0.95)', backdropFilter:'blur(24px)',
          border:'1px solid rgba(255,45,120,0.2)',
          boxShadow:'0 16px 48px rgba(0,0,0,0.5), 0 0 20px rgba(255,45,120,0.08)',
          maxHeight:'240px', overflowY:'auto',
          animation:'dropIn 0.2s ease',
        }}>
          {options.map(opt => (
            <button
              key={opt}
              type="button"
              onClick={() => { onChange(opt); setOpen(false); }}
              style={{
                width:'100%', border:'none', background: opt === value ? 'rgba(255,45,120,0.12)' : 'transparent',
                color: opt === value ? '#FF2D78' : '#ccc',
                fontFamily:'Poppins, sans-serif', fontSize:'14px',
                padding:'12px 16px', textAlign:'left', cursor:'pointer',
                transition:'all 0.15s', display:'flex', alignItems:'center', justifyContent:'space-between',
                borderBottom:'1px solid rgba(255,255,255,0.04)',
              }}
              onMouseEnter={e => { e.currentTarget.style.background='rgba(255,45,120,0.08)'; e.currentTarget.style.color='#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background= opt === value ? 'rgba(255,45,120,0.12)' : 'transparent'; e.currentTarget.style.color= opt === value ? '#FF2D78' : '#ccc'; }}
            >
              {opt}
              {opt === value && <Check size={14} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Custom Date Picker ─── */
function CustomDatePicker({ label, value, onChange, required }: {
  label: string; value: string; onChange: (v: string) => void; required?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, () => null);

  const selectDate = (day: number) => {
    const m = String(viewMonth + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    onChange(`${viewYear}-${m}-${d}`);
    setOpen(false);
  };

  const isPast = (day: number) => {
    const dt = new Date(viewYear, viewMonth, day);
    return dt < new Date(today.getFullYear(), today.getMonth(), today.getDate());
  };

  const displayValue = value ? (() => {
    const [y, m, d] = value.split('-').map(Number);
    return `${MONTHS[m - 1]} ${d}, ${y}`;
  })() : '';

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
  };

  return (
    <div ref={ref} style={{ position:'relative' }}>
      <label style={labelSt}>{label}{required && ' *'}</label>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          ...inputStyle,
          display:'flex', alignItems:'center', justifyContent:'space-between', gap:'8px',
          cursor:'pointer', textAlign:'left',
          borderColor: open ? 'rgba(255,45,120,0.4)' : value ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.1)',
          boxShadow: open ? '0 0 16px rgba(255,45,120,0.1)' : 'none',
        }}
      >
        <span style={{ display:'flex', alignItems:'center', gap:'8px', flex:1, color: value ? '#fff' : '#777' }}>
          <Calendar size={15} style={{ color:'#FF2D78', flexShrink:0 }} />
          {displayValue || 'Select date'}
        </span>
        <ChevronDown size={16} style={{ color:'#FF2D78', transition:'transform 0.3s', transform: open ? 'rotate(180deg)' : 'rotate(0)', flexShrink:0 }} />
      </button>
      {open && (
        <div style={{
          position:'absolute', top:'100%', left:0, right:0, zIndex:50,
          marginTop:'6px', borderRadius:'16px', overflow:'hidden',
          background:'rgba(20,10,20,0.97)', backdropFilter:'blur(24px)',
          border:'1px solid rgba(255,45,120,0.2)',
          boxShadow:'0 16px 48px rgba(0,0,0,0.5), 0 0 20px rgba(255,45,120,0.08)',
          padding:'16px',
          animation:'dropIn 0.2s ease',
        }}>
          {/* Month/Year nav */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'14px' }}>
            <button type="button" onClick={prevMonth} style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', color:'#FF2D78', width:'32px', height:'32px', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', fontSize:'16px' }}>‹</button>
            <span style={{ fontFamily:'Poppins, sans-serif', fontWeight:600, color:'#fff', fontSize:'14px' }}>{MONTHS[viewMonth]} {viewYear}</span>
            <button type="button" onClick={nextMonth} style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', color:'#FF2D78', width:'32px', height:'32px', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', fontSize:'16px' }}>›</button>
          </div>
          {/* Day headers */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap:'2px', marginBottom:'4px' }}>
            {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
              <div key={d} style={{ textAlign:'center', fontFamily:'Poppins, sans-serif', fontSize:'10px', fontWeight:600, color:'#666', padding:'4px 0', textTransform:'uppercase', letterSpacing:'1px' }}>{d}</div>
            ))}
          </div>
          {/* Days grid */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap:'2px' }}>
            {blanks.map((_, i) => <div key={`b${i}`} />)}
            {days.map(day => {
              const selected = value === `${viewYear}-${String(viewMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
              const past = isPast(day);
              return (
                <button
                  key={day}
                  type="button"
                  disabled={past}
                  onClick={() => selectDate(day)}
                  style={{
                    border:'none', borderRadius:'10px',
                    background: selected ? 'linear-gradient(135deg, #FF2D78, #a855f7)' : 'transparent',
                    color: past ? '#444' : selected ? '#fff' : '#ccc',
                    fontFamily:'Poppins, sans-serif', fontSize:'13px', fontWeight: selected ? 700 : 400,
                    padding:'8px 0', cursor: past ? 'not-allowed' : 'pointer',
                    transition:'all 0.15s',
                    boxShadow: selected ? '0 4px 12px rgba(255,45,120,0.3)' : 'none',
                  }}
                  onMouseEnter={e => { if (!past && !selected) { e.currentTarget.style.background='rgba(255,45,120,0.15)'; e.currentTarget.style.color='#FF2D78'; }}}
                  onMouseLeave={e => { if (!past && !selected) { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#ccc'; }}}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Custom Toggle Checkbox ─── */
function GlamCheckbox({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <label style={{ display:'flex', alignItems:'center', gap:'10px', cursor:'pointer', fontSize:'14px', color: checked ? '#fff' : '#999', padding:'8px 12px', borderRadius:'10px', background: checked ? 'rgba(255,45,120,0.08)' : 'transparent', border: checked ? '1px solid rgba(255,45,120,0.2)' : '1px solid transparent', transition:'all 0.2s', fontFamily:'Poppins, sans-serif' }}
      onClick={(e) => { e.preventDefault(); onChange(); }}
    >
      <div style={{
        width:'20px', height:'20px', borderRadius:'6px', flexShrink:0,
        border: checked ? '2px solid #FF2D78' : '2px solid rgba(255,255,255,0.15)',
        background: checked ? 'linear-gradient(135deg, #FF2D78, #a855f7)' : 'transparent',
        display:'flex', alignItems:'center', justifyContent:'center',
        transition:'all 0.2s',
        boxShadow: checked ? '0 2px 8px rgba(255,45,120,0.3)' : 'none',
      }}>
        {checked && <Check size={13} color="#fff" strokeWidth={3} />}
      </div>
      {label}
    </label>
  );
}


export default function InquiryForm() {
  const [submitted, setSubmitted] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  /* form state */
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [eventType, setEventType] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [guestCount, setGuestCount] = useState('');
  const [location, setLocation] = useState('');
  const [services, setServices] = useState<string[]>([]);
  const [onLocation, setOnLocation] = useState('');
  const [inspiration, setInspiration] = useState('');
  const [budget, setBudget] = useState('');
  const [referral, setReferral] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  const toggleService = useCallback((v: string) => {
    setServices(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: string[] = [];
    if (!firstName.trim()) errs.push('firstName');
    if (!lastName.trim()) errs.push('lastName');
    if (!phone.trim()) errs.push('phone');
    if (!email.trim()) errs.push('email');
    if (!eventType) errs.push('eventType');
    if (!eventDate) errs.push('eventDate');
    if (!guestCount) errs.push('guestCount');
    if (!location.trim()) errs.push('location');
    if (!services.length) errs.push('services');
    if (!onLocation) errs.push('onLocation');
    setErrors(errs);
    if (errs.length) return;
    setSubmitted(true);
    wrapRef.current?.scrollIntoView({ behavior:'smooth', block:'center' });
  }

  if (submitted) {
    return (
      <div ref={wrapRef} style={{ ...glass, padding:'48px 32px', textAlign:'center', boxShadow:'0 8px 40px rgba(255,45,120,0.12)' }}>
        <div style={{ fontSize:'48px', marginBottom:'16px', animation:'spin-in 0.6s ease' }}>🌸</div>
        <h3 style={{ fontWeight:700, fontSize:'22px', marginBottom:'12px' }}>
          <span className="text-gradient">You&apos;re on our radar!</span>
        </h3>
        <p style={{ color:'#aaa', fontSize:'14px', lineHeight:1.7 }}>
          Your inquiry has been received. Expect a response within 48 hours.<br /><br />
          Follow us on Instagram <strong style={{ color:'#FF2D78' }}>@glitzandglamourstudio</strong> for inspo ✨
        </p>
        <Link href="/" className="btn-outline" style={{ marginTop:'24px', display:'inline-flex' }}>Back to Home</Link>
      </div>
    );
  }

  const errBorder = (field: string): React.CSSProperties =>
    errors.includes(field) ? { borderColor:'#FF2D78', boxShadow:'0 0 8px rgba(255,45,120,0.2)' } : {};

  return (
    <div ref={wrapRef} style={{ ...glass, padding:'32px 24px' }}>
      <style>{`
        @keyframes dropIn {
          from { opacity:0; transform: translateY(-8px) scale(0.97); }
          to   { opacity:1; transform: translateY(0) scale(1); }
        }
      `}</style>
      <form noValidate onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'20px' }}>
        {/* Name */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
          <div>
            <label style={labelSt}>First Name *</label>
            <input style={{ ...inputStyle, ...errBorder('firstName') }} value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Your first name" />
          </div>
          <div>
            <label style={labelSt}>Last Name *</label>
            <input style={{ ...inputStyle, ...errBorder('lastName') }} value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Your last name" />
          </div>
        </div>

        {/* Contact */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
          <div>
            <label style={labelSt}>Phone *</label>
            <input style={{ ...inputStyle, ...errBorder('phone') }} value={phone} onChange={e => setPhone(fmtPhone(e.target.value))} placeholder="(000) 000-0000" type="tel" maxLength={14} />
          </div>
          <div>
            <label style={labelSt}>Email *</label>
            <input style={{ ...inputStyle, ...errBorder('email') }} value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" type="email" />
          </div>
        </div>

        {/* Event Type + Date */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
          <CustomSelect label="Event Type" placeholder="Select event" options={EVENT_TYPES} value={eventType} onChange={setEventType} required />
          <CustomDatePicker label="Event Date" value={eventDate} onChange={setEventDate} required />
        </div>

        {/* Time + Guests */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
          <CustomSelect label="Start Time" placeholder="Select time" options={TIME_SLOTS} value={startTime} onChange={setStartTime} icon={<ClockIcon size={15} />} />
          <CustomSelect label="Guests Being Serviced" placeholder="Select" options={GUEST_COUNTS} value={guestCount} onChange={setGuestCount} required />
        </div>

        {/* Location */}
        <div>
          <label style={labelSt}>Event Location *</label>
          <input style={{ ...inputStyle, ...errBorder('location') }} value={location} onChange={e => setLocation(e.target.value)} placeholder="Venue name and city, or home address" />
        </div>

        {/* Services */}
        <div>
          <label style={{ ...labelSt, marginBottom:'10px' }}>Services Needed *</label>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'6px' }}>
            {SVC_OPTS.map(s => (
              <GlamCheckbox
                key={s.v}
                checked={services.includes(s.v)}
                onChange={() => toggleService(s.v)}
                label={s.l}
              />
            ))}
          </div>
          {errors.includes('services') && <p style={{ color:'#FF2D78', fontSize:'12px', marginTop:'6px' }}>Please select at least one service</p>}
        </div>

        {/* On-location + Inspiration */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
          <CustomSelect label="On-Location?" placeholder="Select" options={ON_LOC} value={onLocation} onChange={setOnLocation} required />
          <CustomSelect label="Inspiration Look?" placeholder="Select" options={INSPO} value={inspiration} onChange={setInspiration} />
        </div>

        {/* Budget + Referral */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
          <CustomSelect label="Budget Range" placeholder="Select" options={BUDGETS} value={budget} onChange={setBudget} />
          <CustomSelect label="How'd You Find Us?" placeholder="Select" options={REFERRALS} value={referral} onChange={setReferral} />
        </div>

        {/* Notes */}
        <div>
          <label style={labelSt}>Anything Else?</label>
          <textarea style={{ ...inputStyle, resize:'none' as const, minHeight:'72px' }} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Allergies, special requests, vibe..." rows={3} />
        </div>

        <button className="btn-primary" type="submit" style={{ width:'100%', padding:'16px', fontSize:'15px' }}>Send My Inquiry ✦</button>
        <p style={{ fontSize:'11px', color:'#666', lineHeight:1.6, textAlign:'center' }}>
          By submitting, you agree that Glitz &amp; Glamour Studio may contact you regarding your event inquiry. This form does not confirm or hold your date.
        </p>
      </form>
    </div>
  );
}
