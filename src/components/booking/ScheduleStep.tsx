'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Check, Calendar, Clock } from 'lucide-react';

type Service = { id: string; name: string; category: string; priceLabel: string };
type Schedule = { date: string; time: string };

const TIMES = ['8:30 AM','8:45 AM','9:00 AM','9:15 AM','9:30 AM','9:45 AM','10:00 AM','10:15 AM','10:30 AM','10:45 AM','11:00 AM','11:15 AM','11:30 AM','11:45 AM','12:00 PM','12:15 PM','12:30 PM','12:45 PM','1:00 PM','1:15 PM','1:30 PM','1:45 PM','2:00 PM','2:15 PM','2:30 PM','2:45 PM','3:00 PM','3:15 PM','3:30 PM','3:45 PM','4:00 PM','4:15 PM','4:30 PM','4:45 PM','5:00 PM','5:15 PM','5:30 PM','5:45 PM','6:00 PM','6:15 PM','6:30 PM','6:45 PM','7:00 PM'];

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

  const updateServiceSchedule = (serviceId: string, field: 'date' | 'time', value: string) => {
    onSchedulesChange({
      ...schedules,
      [serviceId]: { ...schedules[serviceId], [field]: value },
    });
  };

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
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ flex: '1 1 200px' }}>
            <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={13} /> Preferred Date
            </label>
            <input type="date" className="input" value={singleDate}
              onChange={e => onSingleDateChange(e.target.value)}
              min={today}
              style={{ fontFamily: 'Poppins, sans-serif', colorScheme: 'dark' }} />
          </div>
          <div style={{ flex: '1 1 200px' }}>
            <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={13} /> Preferred Time
            </label>
            <TimeDropdown value={singleTime} onChange={onSingleTimeChange} />
          </div>
        </div>
      ) : (
        /* Per-service schedules */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {selectedServices.map(svc => {
            const sched = schedules[svc.id] || { date: '', time: '' };
            return (
              <div key={svc.id} style={{
                padding: '16px', borderRadius: '16px',
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <div style={{
                    width: '8px', height: '8px', borderRadius: '50%',
                    background: (sched.date && sched.time) ? '#00D478' : '#FF2D78',
                    flexShrink: 0,
                  }} />
                  <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px', fontWeight: 600, color: '#fff' }}>
                    {svc.name}
                  </span>
                  <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: '#888' }}>
                    {svc.priceLabel}
                  </span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ flex: '1 1 160px' }}>
                    <label className="label" style={{ fontSize: '11px' }}>Date</label>
                    <input type="date" className="input" value={sched.date}
                      onChange={e => updateServiceSchedule(svc.id, 'date', e.target.value)}
                      min={today}
                      style={{ fontFamily: 'Poppins, sans-serif', colorScheme: 'dark', fontSize: '13px', padding: '10px 12px' }} />
                  </div>
                  <div style={{ flex: '1 1 160px' }}>
                    <label className="label" style={{ fontSize: '11px' }}>Time</label>
                    <TimeDropdown value={sched.time} onChange={t => updateServiceSchedule(svc.id, 'time', t)} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
