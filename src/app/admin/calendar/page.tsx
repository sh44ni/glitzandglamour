'use client';

import { useEffect, useState, useMemo } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X, Clock, Edit2 } from 'lucide-react';

type Booking = {
    id: string; guestName?: string; preferredDate: string; preferredTime: string; status: string;
    userId?: string | null;
    user?: { name: string; image?: string | null; };
    service: { name: string; };
    additionalServiceIds?: string | null;
    inspoImageUrls?: string[];
    notes?: string | null;
};

export default function AdminCalendarPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [services, setServices] = useState<{ id: string; name: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    useEffect(() => {
        Promise.all([
            fetch('/api/admin/bookings').then(r => r.json()),
            fetch('/api/services').then(r => r.json())
        ]).then(([bData, sData]) => {
            setBookings(bData.bookings || []);
            setServices(sData.services || []);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    // ... calendar logic
    const monthYear = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayIndex = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

    const days = useMemo(() => {
        const arr = [];
        for (let i = 0; i < firstDayIndex; i++) arr.push(null);
        for (let i = 1; i <= daysInMonth; i++) arr.push(i);
        return arr;
    }, [daysInMonth, firstDayIndex]);

    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

    const selectedBookings = selectedDate ? bookings.filter(b => b.preferredDate === selectedDate) : [];

    if (loading) return (
        <div style={{ padding: '40px', textAlign: 'center' }}>
            <div className="skeleton" style={{ width: '100%', height: '400px', borderRadius: '20px' }}></div>
        </div>
    );

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <style>{`
                .cal-layout { display: grid; gap: 24px; grid-template-columns: 1fr; }
                .cal-container { padding: clamp(16px, 4vw, 24px); border-radius: 20px; width: 100%; box-sizing: border-box; background: rgba(20,20,20,0.6); border: 1px solid rgba(255,255,255,0.05); }
                .cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; text-align: center; }
                
                .cal-day-box {
                    position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center;
                    cursor: pointer; transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    border: 1px solid rgba(255,255,255,0.03); background: rgba(255,255,255,0.015);
                    aspect-ratio: 0.85; border-radius: 14px; overflow: hidden;
                }
                .cal-day-box.has-bookings {
                    border-color: rgba(255,45,120,0.15);
                    background: linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,45,120,0.06) 100%);
                }
                .cal-day-bg {
                    position: absolute; inset: 0; background: linear-gradient(135deg, #FF2D78 0%, #FF6B9E 100%);
                    opacity: 0; transition: opacity 0.3s; z-index: 0;
                }
                .cal-day-box.selected {
                    transform: translateY(-2px); border-color: #FF2D78;
                    box-shadow: 0 8px 20px rgba(255,45,120,0.25);
                }
                .cal-day-box.selected .cal-day-bg { opacity: 1; }
                
                .cal-day-num { 
                    font-family: Poppins, sans-serif; font-size: 16px; font-weight: 500; color: #ccc; 
                    z-index: 1; position: relative; margin-bottom: 4px; transition: all 0.3s;
                }
                .cal-day-box.has-bookings .cal-day-num { color: #fff; font-weight: 600; }
                .cal-day-box.selected .cal-day-num { color: #fff; font-weight: 800; font-size: 18px; transform: scale(1.05); }
                
                .cal-day-badges {
                    display: flex; gap: 3px; z-index: 1; position: relative; padding: 0 2px;
                }
                .cal-badge {
                    min-width: 16px; height: 16px; border-radius: 8px;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 10px; font-weight: 700; color: #fff;
                    padding: 0 4px; box-sizing: border-box; font-family: Poppins, sans-serif;
                }
                .cal-badge.conf { background: rgba(0, 212, 120, 0.9); box-shadow: 0 2px 4px rgba(0,212,120,0.3); }
                .cal-badge.pend { background: rgba(255, 183, 0, 0.9); box-shadow: 0 2px 4px rgba(255,183,0,0.3); }
                .cal-day-box.selected .cal-badge { box-shadow: 0 2px 4px rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.3); }
                .cal-ind-text { display: none; }
                
                @media (min-width: 700px) {
                    .cal-layout-split { grid-template-columns: 1fr 1fr !important; }
                    .cal-grid { gap: 10px; }
                    .cal-day-box { aspect-ratio: 1; padding: 8px; justify-content: flex-start; border-radius: 16px; border: 1px solid rgba(255,255,255,0.06); background: rgba(255,255,255,0.02); min-height: auto; }
                    .cal-day-num { margin-bottom: 8px; font-size: 15px; font-weight: 600; }
                    .cal-day-box.selected .cal-day-num { font-size: 17px; }
                    .cal-day-badges { flex-direction: column; width: 100%; gap: 4px; align-items: stretch; margin-top: auto; }
                    .cal-badge { width: 100%; justify-content: flex-start; padding: 4px 8px; font-size: 10px; border-radius: 6px; }
                    .cal-ind-text { display: inline; margin-left: 4px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: inherit; }
                    .cal-badge.conf { background: rgba(0, 212, 120, 0.1); color: #00D478; box-shadow: none; }
                    .cal-badge.pend { background: rgba(255, 183, 0, 0.1); color: #FFB700; box-shadow: none; }
                    .cal-day-box.selected .cal-badge { border: none; box-shadow: none; background: rgba(255,255,255,0.2); color: #fff; }
                }
            `}</style>
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#fff', fontSize: '22px', marginBottom: '4px' }}>Calendar</h1>
                <p style={{ fontFamily: 'Poppins, sans-serif', color: '#555', fontSize: '13px' }}>Manage bookings by date and reschedule appointments.</p>
            </div>

            <div className={`cal-layout${selectedDate ? ' cal-layout-split' : ''}`}>
                {/* Calendar View */}
                <div className="glass cal-container">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h2 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '18px', fontWeight: 700 }}>{monthYear}</h2>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={prevMonth} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer', color: '#fff' }}><ChevronLeft size={18} /></button>
                            <button onClick={nextMonth} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer', color: '#fff' }}><ChevronRight size={18} /></button>
                        </div>
                    </div>

                    <div className="cal-grid" style={{ marginBottom: '8px' }}>
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                            <div key={d} style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', fontWeight: 600, color: '#666' }}>{d}</div>
                        ))}
                    </div>

                    <div className="cal-grid">
                        {days.map((day, i) => {
                            if (!day) return <div key={i} />;
                            const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                            const dayBookings = bookings.filter(b => b.preferredDate === dateStr);
                            const pendingCount = dayBookings.filter(b => b.status === 'PENDING').length;
                            const confirmedCount = dayBookings.filter(b => b.status === 'CONFIRMED').length;
                            const isSelected = selectedDate === dateStr;
                            const hasBookings = confirmedCount > 0 || pendingCount > 0;

                            return (
                                <div key={i}
                                    onClick={() => setSelectedDate(dateStr)}
                                    className={`cal-day-box ${isSelected ? 'selected' : ''} ${hasBookings ? 'has-bookings' : ''}`}
                                >
                                    <div className="cal-day-bg" />
                                    <div className="cal-day-num">{day}</div>
                                    {hasBookings && (
                                        <div className="cal-day-badges">
                                            {confirmedCount > 0 && (
                                                <div className="cal-badge conf">
                                                    <span>{confirmedCount}</span>
                                                    <span className="cal-ind-text"> Confirmed</span>
                                                </div>
                                            )}
                                            {pendingCount > 0 && (
                                                <div className="cal-badge pend">
                                                    <span>{pendingCount}</span>
                                                    <span className="cal-ind-text"> Pending</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Selected Date Panel */}
                {selectedDate && (
                    <div className="glass cal-container">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '16px', fontWeight: 700, color: '#fff' }}>
                                Bookings for {selectedDate}
                            </h3>
                            <button onClick={() => setSelectedDate(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                <X size={18} color="#aaa" />
                            </button>
                        </div>

                        {selectedBookings.length === 0 ? (
                            <p style={{ fontFamily: 'Poppins, sans-serif', color: '#666', fontSize: '13px' }}>No bookings on this date.</p>
                        ) : (
                            <div style={{ display: 'grid', gap: '12px' }}>
                                {selectedBookings.map(b => (
                                    <BookingRow key={b.id} booking={b} services={services} onRescheduled={() => {
                                        fetch('/api/admin/bookings').then(r => r.json()).then(d => setBookings(d.bookings || []));
                                    }} />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
function format12h(time24: string) {
    if (!time24) return '';
    const [h, m] = time24.split(':');
    let hours = parseInt(h, 10);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${m} ${ampm}`;
}

function BookingRow({ booking, services, onRescheduled }: { booking: Booking, services: { id: string; name: string }[], onRescheduled: () => void }) {
    const [isRescheduling, setIsRescheduling] = useState(false);
    const [newDate, setNewDate] = useState(booking.preferredDate);
    const [newTime, setNewTime] = useState(booking.preferredTime);
    const [saving, setSaving] = useState(false);

    const customerName = booking.user?.name || booking.guestName || 'Guest';

    const additionalIds = booking.additionalServiceIds ? booking.additionalServiceIds.split(',') : [];
    const extraServices = additionalIds.map(id => services.find(s => s.id === id)).filter(Boolean) as { id: string; name: string }[];
    const allServiceNames = [booking.service.name, ...extraServices.map(s => s.name)].join(', ');

    async function handleReschedule() {
        setSaving(true);
        try {
            await fetch('/api/admin/bookings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookingId: booking.id, status: booking.status, newDate, newTime })
            });
            setIsRescheduling(false);
            onRescheduled();
        } catch (e) {
            console.error(e);
            alert('Failed to reschedule.');
        } finally {
            setSaving(false);
        }
    }

    return (
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h4 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px', fontWeight: 600, color: '#fff', marginBottom: '2px' }}>
                        {customerName}
                    </h4>
                    <p style={{ fontFamily: 'Poppins, sans-serif', color: '#aaa', fontSize: '13px', marginBottom: '6px' }}>
                        {allServiceNames}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#FF2D78', fontSize: '12px', fontFamily: 'Poppins, sans-serif', fontWeight: 500 }}>

                        <Clock size={12} /> {format12h(booking.preferredTime)}
                        <span style={{ color: '#666', margin: '0 4px' }}>•</span>
                        <span style={{
                            color: booking.status === 'CONFIRMED' ? '#00D478' : booking.status === 'PENDING' ? '#FFB700' : '#888'
                        }}>
                            {booking.status}
                        </span>
                    </div>
                </div>

                {booking.status === 'CONFIRMED' && !isRescheduling && (
                    <button onClick={() => setIsRescheduling(true)} style={{
                        background: 'rgba(255,45,120,0.1)', border: '1px solid rgba(255,45,120,0.2)', color: '#FF2D78',
                        padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                        fontFamily: 'Poppins, sans-serif', fontSize: '12px', fontWeight: 600
                    }}>
                        <Edit2 size={12} /> Reschedule
                    </button>
                )}
            </div>

            {booking.notes && (
                <div style={{ marginTop: '12px', padding: '10px 12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', borderLeft: '2px solid #FF2D78' }}>
                    <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#ccc', fontStyle: 'italic', margin: 0 }}>
                        "{booking.notes}"
                    </p>
                </div>
            )}

            {booking.inspoImageUrls && booking.inspoImageUrls.length > 0 && (
                <div style={{ marginTop: '14px' }}>
                    <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: '#888', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Inspiration Photos</p>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {booking.inspoImageUrls.map((url, idx) => (
                            <a key={idx} href={url} target="_blank" rel="noopener noreferrer" style={{ display: 'block', width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={url} alt="Inspo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </a>
                        ))}
                    </div>
                </div>
            )}

            {isRescheduling && (
                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px dashed rgba(255,255,255,0.1)' }}>
                    <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#bbb', marginBottom: '12px' }}>
                        Change date and time. This will automatically notify the customer via email.
                    </p>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <input type="date" className="input" style={{ flex: 1, minWidth: '140px', fontSize: '13px', padding: '8px 12px' }} value={newDate} onChange={e => setNewDate(e.target.value)} />
                        <input type="time" className="input" style={{ flex: 1, minWidth: '140px', fontSize: '13px', padding: '8px 12px' }} value={newTime} onChange={e => setNewTime(e.target.value)} />
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                        <button className="btn-primary" onClick={handleReschedule} disabled={saving} style={{ fontSize: '12px', padding: '8px 16px' }}>
                            {saving ? 'Saving...' : 'Confirm'}
                        </button>
                        <button className="btn-outline" onClick={() => setIsRescheduling(false)} style={{ fontSize: '12px', padding: '8px 16px' }}>
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
