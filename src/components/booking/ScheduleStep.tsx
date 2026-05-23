'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, Check, Calendar, Clock, Sparkles } from 'lucide-react';

type Service = { id: string; name: string; category: string; priceLabel: string };
type Schedule = { date: string; time: string };

const TIMES = ['8:30 AM','8:45 AM','9:00 AM','9:15 AM','9:30 AM','9:45 AM','10:00 AM','10:15 AM','10:30 AM','10:45 AM','11:00 AM','11:15 AM','11:30 AM','11:45 AM','12:00 PM','12:15 PM','12:30 PM','12:45 PM','1:00 PM','1:15 PM','1:30 PM','1:45 PM','2:00 PM','2:15 PM','2:30 PM','2:45 PM','3:00 PM','3:15 PM','3:30 PM','3:45 PM','4:00 PM','4:15 PM','4:30 PM','4:45 PM','5:00 PM','5:15 PM','5:30 PM','5:45 PM','6:00 PM','6:15 PM','6:30 PM','6:45 PM','7:00 PM'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = ['Su','Mo','Tu','We','Th','Fr','Sa'];

/* ─── Custom Date Picker ─── */
function DatePicker({ value, onChange, minDate, blockedDates = [] }: { value: string; onChange: (d: string) => void; minDate: string; blockedDates?: string[] }) {
  const blockedSet = new Set(blockedDates);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Parse value or default to today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selected = value ? new Date(value + 'T00:00:00') : null;
  const min = minDate ? new Date(minDate + 'T00:00:00') : today;

  const [viewYear, setViewYear] = useState(selected?.getFullYear() || today.getFullYear());
  const [viewMonth, setViewMonth] = useState(selected?.getMonth() ?? today.getMonth());

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Sync view when value changes externally
  useEffect(() => {
    if (selected) {
      setViewYear(selected.getFullYear());
      setViewMonth(selected.getMonth());
    }
  }, [value]);

  // Calendar grid generation
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();

  const cells: { day: number; month: number; year: number; isCurrentMonth: boolean }[] = [];
  // Previous month fill
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    const m = viewMonth === 0 ? 11 : viewMonth - 1;
    const y = viewMonth === 0 ? viewYear - 1 : viewYear;
    cells.push({ day: d, month: m, year: y, isCurrentMonth: false });
  }
  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, month: viewMonth, year: viewYear, isCurrentMonth: true });
  }
  // Next month fill (to complete 6 rows max)
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    const m = viewMonth === 11 ? 0 : viewMonth + 1;
    const y = viewMonth === 11 ? viewYear + 1 : viewYear;
    cells.push({ day: d, month: m, year: y, isCurrentMonth: false });
  }

  const goToPrevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const goToNextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const isBlocked = (cell: typeof cells[0]) => {
    const mm = String(cell.month + 1).padStart(2, '0');
    const dd = String(cell.day).padStart(2, '0');
    return blockedSet.has(`${cell.year}-${mm}-${dd}`);
  };

  const isDisabled = (cell: typeof cells[0]) => {
    const d = new Date(cell.year, cell.month, cell.day);
    d.setHours(0, 0, 0, 0);
    return d < min || isBlocked(cell);
  };

  const isSelected = (cell: typeof cells[0]) => {
    if (!selected) return false;
    return cell.day === selected.getDate() && cell.month === selected.getMonth() && cell.year === selected.getFullYear();
  };

  const isToday = (cell: typeof cells[0]) => {
    return cell.day === today.getDate() && cell.month === today.getMonth() && cell.year === today.getFullYear();
  };

  const handleSelect = (cell: typeof cells[0]) => {
    if (isDisabled(cell)) return;
    const mm = String(cell.month + 1).padStart(2, '0');
    const dd = String(cell.day).padStart(2, '0');
    onChange(`${cell.year}-${mm}-${dd}`);
    setOpen(false);
  };

  // Format the display value
  const formatDisplay = () => {
    if (!value || !selected) return 'Select date…';
    return `${MONTHS[selected.getMonth()].slice(0, 3)} ${selected.getDate()}, ${selected.getFullYear()}`;
  };

  // Check if we can go to previous month
  const canGoPrev = () => {
    const prevEnd = new Date(viewYear, viewMonth, 0);
    return prevEnd >= min;
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button type="button" onClick={() => setOpen(o => !o)} style={{
        width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'rgba(255,255,255,0.05)', border: `1px solid ${open ? '#FF2D78' : 'rgba(255,255,255,0.1)'}`,
        borderRadius: '10px', padding: '12px 14px', cursor: 'pointer',
        fontFamily: 'Poppins, sans-serif', fontSize: '14px',
        color: value ? '#fff' : '#888', transition: 'border-color 0.2s',
      }}>
        <span>{formatDisplay()}</span>
        <ChevronDown size={16} color="#666" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 10,
          background: '#181818', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '14px', overflow: 'hidden', boxShadow: '0 20px 48px rgba(0,0,0,0.8)',
          padding: '14px',
          minWidth: '280px',
        }}>
          {/* Month/Year header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <button type="button" onClick={goToPrevMonth} disabled={!canGoPrev()} style={{
              width: '30px', height: '30px', borderRadius: '8px', border: 'none',
              background: canGoPrev() ? 'rgba(255,255,255,0.06)' : 'transparent',
              cursor: canGoPrev() ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: canGoPrev() ? 1 : 0.25,
            }}>
              <ChevronLeft size={16} color="#fff" />
            </button>
            <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px', fontWeight: 600, color: '#fff' }}>
              {MONTHS[viewMonth]} {viewYear}
            </span>
            <button type="button" onClick={goToNextMonth} style={{
              width: '30px', height: '30px', borderRadius: '8px', border: 'none',
              background: 'rgba(255,255,255,0.06)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <ChevronRight size={16} color="#fff" />
            </button>
          </div>

          {/* Day headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', marginBottom: '4px' }}>
            {DAYS.map(d => (
              <div key={d} style={{
                textAlign: 'center', fontFamily: 'Poppins, sans-serif', fontSize: '10px',
                fontWeight: 700, color: '#666', padding: '4px 0', textTransform: 'uppercase',
              }}>{d}</div>
            ))}
          </div>

          {/* Date grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
            {cells.map((cell, i) => {
              const blocked = isBlocked(cell);
              const disabled = isDisabled(cell);
              const sel = isSelected(cell);
              const td = isToday(cell);
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelect(cell)}
                  disabled={disabled}
                  style={{
                    width: '100%', aspectRatio: '1', borderRadius: '10px', border: 'none',
                    cursor: disabled ? 'default' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'Poppins, sans-serif', fontSize: '13px', fontWeight: sel ? 700 : 500,
                    transition: 'all 0.15s', position: 'relative',
                    background: sel ? '#FF2D78' : 'transparent',
                    color: sel ? '#fff' : disabled ? (blocked ? '#553' : '#333') : !cell.isCurrentMonth ? '#444' : td ? '#FF2D78' : '#ddd',
                    boxShadow: sel ? '0 2px 10px rgba(255,45,120,0.4)' : 'none',
                    textDecoration: blocked ? 'line-through' : 'none',
                    opacity: blocked ? 0.5 : 1,
                  }}
                  onMouseOver={e => {
                    if (!disabled && !sel) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)';
                  }}
                  onMouseOut={e => {
                    if (!disabled && !sel) (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                  }}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>

          {/* Today shortcut */}
          <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'center' }}>
            <button type="button" onClick={() => {
              const mm = String(today.getMonth() + 1).padStart(2, '0');
              const dd = String(today.getDate()).padStart(2, '0');
              onChange(`${today.getFullYear()}-${mm}-${dd}`);
              setViewMonth(today.getMonth());
              setViewYear(today.getFullYear());
              setOpen(false);
            }} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: 'Poppins, sans-serif', fontSize: '11px', fontWeight: 600,
              color: '#FF2D78', padding: '4px 8px',
            }}>
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Custom Time Dropdown ─── */
function TimeDropdown({ value, onChange }: { value: string; onChange: (t: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button type="button" onClick={() => setOpen(o => !o)} style={{
        width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'rgba(255,255,255,0.05)', border: `1px solid ${open ? '#FF2D78' : 'rgba(255,255,255,0.1)'}`,
        borderRadius: '10px', padding: '12px 14px', cursor: 'pointer',
        fontFamily: 'Poppins, sans-serif', fontSize: '14px',
        color: value ? '#fff' : '#888', transition: 'border-color 0.2s',
      }}>
        <span>{value || 'Select time…'}</span>
        <ChevronDown size={16} color="#666" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 10,
          background: '#181818', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '14px', overflow: 'hidden', boxShadow: '0 20px 48px rgba(0,0,0,0.8)',
          maxHeight: '240px', overflowY: 'auto',
        }}>
          {TIMES.map(t => {
            const isSelected = value === t;
            return (
              <button key={t} type="button" onClick={() => { onChange(t); setOpen(false); }} style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 14px', background: isSelected ? 'rgba(255,45,120,0.1)' : 'transparent',
                border: 'none', cursor: 'pointer', textAlign: 'left',
                borderBottom: '1px solid rgba(255,255,255,0.03)',
                fontFamily: 'Poppins, sans-serif', fontSize: '13px',
                color: isSelected ? '#FF2D78' : '#ddd', fontWeight: isSelected ? 600 : 400,
              }}
                onMouseOver={e => { if (!isSelected) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)'; }}
                onMouseOut={e => { if (!isSelected) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
              >
                {t}
                {isSelected && <Check size={13} color="#FF2D78" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── Fully Booked Card ─── */
const FULLY_BOOKED_MESSAGES = [
  "This day is fully booked — you're clearly not the only one with great taste! 💅",
  "All spots are taken for this day — beauty waits for no one! ✨",
  "Oops! This day's schedule is packed with glam sessions! 💖",
  "This date is spoken for — let's find your perfect day! 🌸",
  "Looks like everyone wants to glow up on this day! 🔥",
];

function FullyBookedCard({ date, onTryNextDay }: { date: string; onTryNextDay: () => void }) {
  const [msgIdx] = useState(() => Math.floor(Math.random() * FULLY_BOOKED_MESSAGES.length));
  const msg = FULLY_BOOKED_MESSAGES[msgIdx];

  // Format the date nicely
  const formatted = (() => {
    if (!date) return '';
    const d = new Date(date + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  })();

  return (
    <div style={{
      textAlign: 'center',
      padding: '32px 24px',
      borderRadius: '20px',
      background: 'linear-gradient(145deg, rgba(255,45,120,0.06) 0%, rgba(139,0,67,0.1) 50%, rgba(255,45,120,0.04) 100%)',
      border: '1px solid rgba(255,45,120,0.2)',
      position: 'relative',
      overflow: 'hidden',
      animation: 'fullyBookedFadeIn 0.4s ease-out',
    }}>
      {/* Animated sparkle background */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: '4px', height: '4px', borderRadius: '50%',
            background: '#FF2D78',
            opacity: 0.3,
            left: `${15 + i * 15}%`,
            top: `${20 + (i % 3) * 25}%`,
            animation: `sparkleFloat ${2 + i * 0.3}s ease-in-out infinite`,
            animationDelay: `${i * 0.2}s`,
          }} />
        ))}
      </div>

      {/* Icon */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: '64px', height: '64px', borderRadius: '20px',
        background: 'linear-gradient(135deg, rgba(255,45,120,0.2) 0%, rgba(255,126,179,0.15) 100%)',
        border: '1px solid rgba(255,45,120,0.3)',
        marginBottom: '20px',
        animation: 'iconPulse 2s ease-in-out infinite',
      }}>
        <Sparkles size={28} color="#FF2D78" strokeWidth={1.75} />
      </div>

      {/* Title */}
      <h4 style={{
        fontFamily: 'Poppins, sans-serif', fontWeight: 700,
        fontSize: '20px', color: '#fff',
        marginBottom: '6px', letterSpacing: '-0.3px',
      }}>Fully Booked!</h4>

      {/* Date badge */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        padding: '5px 14px', borderRadius: '50px',
        background: 'rgba(255,45,120,0.1)', border: '1px solid rgba(255,45,120,0.25)',
        marginBottom: '16px',
      }}>
        <Calendar size={13} color="#FF2D78" />
        <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', fontWeight: 600, color: '#FF2D78' }}>
          {formatted}
        </span>
      </div>

      {/* Fun message */}
      <p style={{
        fontFamily: 'Poppins, sans-serif', color: '#ccc',
        fontSize: '14px', lineHeight: 1.6,
        marginBottom: '28px', maxWidth: '320px', margin: '0 auto 28px',
      }}>{msg}</p>

      {/* Next day button */}
      <button
        type="button"
        onClick={onTryNextDay}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          padding: '14px 28px', borderRadius: '14px',
          background: 'linear-gradient(135deg, #FF2D78 0%, #FF7EB3 100%)',
          border: 'none', cursor: 'pointer',
          fontFamily: 'Poppins, sans-serif', fontSize: '14px', fontWeight: 600,
          color: '#fff', letterSpacing: '0.2px',
          boxShadow: '0 4px 20px rgba(255,45,120,0.35), 0 0 0 1px rgba(255,45,120,0.2)',
          transition: 'all 0.2s ease',
        }}
        onMouseOver={e => {
          (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
          (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 30px rgba(255,45,120,0.45), 0 0 0 1px rgba(255,45,120,0.3)';
        }}
        onMouseOut={e => {
          (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
          (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 20px rgba(255,45,120,0.35), 0 0 0 1px rgba(255,45,120,0.2)';
        }}
      >
        Try Next Available Day
        <ChevronRight size={16} />
      </button>

      {/* Animations */}
      <style>{`
        @keyframes fullyBookedFadeIn {
          0% { opacity: 0; transform: translateY(12px) scale(0.97); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes sparkleFloat {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.2; }
          50% { transform: translateY(-8px) scale(1.5); opacity: 0.5; }
        }
        @keyframes iconPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}

/* ─── Main ScheduleStep ─── */
export default function ScheduleStep({
  selectedServices,
  schedules,
  onSchedulesChange,
  singleDate,
  singleTime,
  onSingleDateChange,
  onSingleTimeChange,
  perService,
  onPerServiceToggle,
}: {
  selectedServices: Service[];
  schedules: Record<string, Schedule>;
  onSchedulesChange: (s: Record<string, Schedule>) => void;
  singleDate: string;
  singleTime: string;
  onSingleDateChange: (d: string) => void;
  onSingleTimeChange: (t: string) => void;
  perService: boolean;
  onPerServiceToggle: (v: boolean) => void;
}) {
  const today = new Date().toISOString().split('T')[0];
  const [blockedDates, setBlockedDates] = useState<string[]>([]);

  // Fetch blocked dates on mount
  useEffect(() => {
    fetch('/api/admin/blocked-dates')
      .then(r => r.json())
      .then(d => {
        const dates = (d.blockedDates || []).map((b: { date: string }) => b.date);
        setBlockedDates(dates);
      })
      .catch(() => {});
  }, []);

  const blockedSet = new Set(blockedDates);
  const isDateBlocked = useCallback((date: string) => blockedSet.has(date), [blockedDates]);

  // Find next available day from a given date
  const findNextAvailable = useCallback((fromDate: string) => {
    const d = new Date(fromDate + 'T00:00:00');
    for (let i = 0; i < 365; i++) {
      d.setDate(d.getDate() + 1);
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const candidate = `${d.getFullYear()}-${mm}-${dd}`;
      if (!blockedSet.has(candidate)) return candidate;
    }
    // Fallback: just go to next day
    const fallback = new Date(fromDate + 'T00:00:00');
    fallback.setDate(fallback.getDate() + 1);
    const mm = String(fallback.getMonth() + 1).padStart(2, '0');
    const dd = String(fallback.getDate()).padStart(2, '0');
    return `${fallback.getFullYear()}-${mm}-${dd}`;
  }, [blockedDates]);

  const updateServiceSchedule = (serviceId: string, field: 'date' | 'time', value: string) => {
    onSchedulesChange({
      ...schedules,
      [serviceId]: { ...schedules[serviceId], [field]: value },
    });
  };

  // Check if the current single date is blocked
  const singleDateBlocked = singleDate && isDateBlocked(singleDate);

  return (
    <div>
      {/* Cute scheduling tip */}
      {selectedServices.length > 1 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '12px 16px', borderRadius: '14px', marginBottom: '16px',
          background: 'linear-gradient(135deg, rgba(139,0,67,0.08), rgba(255,45,120,0.06))',
          border: '1px solid rgba(255,45,120,0.15)',
        }}>
          <span style={{ fontSize: '22px', flexShrink: 0 }}>📅</span>
          <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12.5px', color: '#eee', lineHeight: 1.5, margin: 0 }}>
            <strong style={{ color: '#FF2D78' }}>Pro tip!</strong> You can schedule all services on the <strong style={{ color: '#fff' }}>same day</strong> or pick <strong style={{ color: '#fff' }}>different dates</strong> for each — your choice! ✨
          </p>
        </div>
      )}
      {/* Toggle */}
      {selectedServices.length > 1 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px',
          padding: '14px 16px', borderRadius: '14px',
          background: perService ? 'rgba(255,45,120,0.06)' : 'rgba(255,255,255,0.03)',
          border: `1px solid ${perService ? 'rgba(255,45,120,0.2)' : 'rgba(255,255,255,0.06)'}`,
          cursor: 'pointer', transition: 'all 0.2s',
        }} onClick={() => onPerServiceToggle(!perService)}>
          <div style={{
            width: '44px', height: '24px', borderRadius: '12px', padding: '2px',
            background: perService ? '#FF2D78' : 'rgba(255,255,255,0.15)',
            transition: 'background 0.2s', flexShrink: 0,
          }}>
            <div style={{
              width: '20px', height: '20px', borderRadius: '50%', background: '#fff',
              transform: perService ? 'translateX(20px)' : 'translateX(0)',
              transition: 'transform 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
            }} />
          </div>
          <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', color: perService ? '#FF2D78' : '#bbb', fontWeight: 500 }}>
            Different date/time for each service
          </span>
        </div>
      )}

      {!perService ? (
        /* Single schedule */
        <>
          <style>{`
            .schedule-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 12px;
            }
            @media (max-width: 480px) {
              .schedule-grid {
                grid-template-columns: 1fr;
              }
            }
          `}</style>
          <div className="schedule-grid">
            <div>
              <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={13} /> Preferred Date
              </label>
              <DatePicker value={singleDate} onChange={onSingleDateChange} minDate={today} blockedDates={blockedDates} />
            </div>
            <div>
              <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={13} /> Preferred Time
              </label>
              <TimeDropdown value={singleTime} onChange={onSingleTimeChange} />
            </div>
          </div>

          {/* Fully Booked message for single schedule */}
          {singleDateBlocked && (
            <div style={{ marginTop: '20px' }}>
              <FullyBookedCard
                date={singleDate}
                onTryNextDay={() => {
                  const next = findNextAvailable(singleDate);
                  onSingleDateChange(next);
                }}
              />
            </div>
          )}
        </>
      ) : (
        /* Per-service schedules */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {selectedServices.map(svc => {
            const sched = schedules[svc.id] || { date: '', time: '' };
            const serviceBlocked = sched.date && isDateBlocked(sched.date);
            return (
              <div key={svc.id} style={{
                padding: '16px', borderRadius: '16px',
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <div style={{
                    width: '8px', height: '8px', borderRadius: '50%',
                    background: (sched.date && sched.time && !serviceBlocked) ? '#00D478' : '#FF2D78',
                    flexShrink: 0,
                  }} />
                  <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px', fontWeight: 600, color: '#fff' }}>
                    {svc.name}
                  </span>
                  <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: '#888' }}>
                    {svc.priceLabel}
                  </span>
                </div>
                <div className="schedule-grid">
                  <div>
                    <label className="label" style={{ fontSize: '11px' }}>Date</label>
                    <DatePicker value={sched.date} onChange={d => updateServiceSchedule(svc.id, 'date', d)} minDate={today} blockedDates={blockedDates} />
                  </div>
                  <div>
                    <label className="label" style={{ fontSize: '11px' }}>Time</label>
                    <TimeDropdown value={sched.time} onChange={t => updateServiceSchedule(svc.id, 'time', t)} />
                  </div>
                </div>

                {/* Fully Booked message for this service */}
                {serviceBlocked && (
                  <div style={{ marginTop: '14px' }}>
                    <FullyBookedCard
                      date={sched.date}
                      onTryNextDay={() => {
                        const next = findNextAvailable(sched.date);
                        updateServiceSchedule(svc.id, 'date', next);
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
