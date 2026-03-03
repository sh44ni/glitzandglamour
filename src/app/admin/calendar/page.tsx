'use client';

import { useEffect, useState, useMemo } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X, Clock, Edit2 } from 'lucide-react';

type Booking = {
    id: string; guestName?: string; preferredDate: string; preferredTime: string; status: string;
    userId?: string | null;
    user?: { name: string; image?: string | null; };
    service: { name: string; };
    additionalServiceIds?: string | null;
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
                .cal-container { padding: clamp(16px, 4vw, 24px); border-radius: 20px; width: 100%; box-sizing: border-box; }
                .cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; text-align: center; }
                .cal-day-box {
                    display: flex; flex-direction: column; align-items: center; justify-content: flex-start;
                    cursor: pointer; transition: all 0.2s; border: none; background: transparent; position: relative;
                    min-height: 52px; padding-top: 6px; border-radius: 8px;
                }
                .cal-day-bg {
                    position: absolute; top: 1px; left: 50%; transform: translateX(-50%); width: 34px; height: 34px; border-radius: 50%; z-index: 0; background: transparent; transition: all 0.2s;
                }
                .cal-day-box.selected .cal-day-bg { background: #FF2D78; box-shadow: 0 4px 12px rgba(255,45,120,0.4); }
                .cal-day-num { font-family: Poppins, sans-serif; font-size: 15px; font-weight: 500; color: #ddd; z-index: 1; position: relative; line-height: 24px; }
                .cal-day-box.selected .cal-day-num { color: #fff; font-weight: 700; }
                .cal-inds { display: flex; gap: 4px; justify-content: center; margin-top: 10px; z-index: 1; }
                .cal-ind { display: flex; align-items: center; justify-content: center; }
                .cal-ind-dot { width: 5px; height: 5px; border-radius: 50%; display: block; }
                .cal-ind-text { display: none; }
                
                @media (min-width: 700px) {
                    .cal-layout-split { grid-template-columns: 1fr 1fr !important; }
                    .cal-grid { gap: 8px; }
                    .cal-day-box { padding: 8px; aspect-ratio: 1; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); background: rgba(255,255,255,0.02); min-height: auto; }
                    .cal-day-bg { display: none; }
                    .cal-day-box.selected { background: rgba(255,45,120,0.1); border-color: #FF2D78; }
                    .cal-day-box.selected .cal-day-num { color: #FF2D78; }
                    .cal-day-num { font-size: 14px; margin-bottom: 6px; line-height: normal; }
                    .cal-inds { flex-direction: column; width: 100%; gap: 4px; margin-top: 0; }
                    .cal-ind { padding: 2px 6px; border-radius: 4px; width: 100%; }
                    .cal-ind.conf { background: rgba(0, 212, 120, 0.1); color: #00D478; }
                    .cal-ind.pend { background: rgba(255, 183, 0, 0.1); color: #FFB700; }
                    .cal-ind-dot { display: none; }
                    .cal-ind-text { display: block; font-size: 10px; font-weight: 600; font-family: Poppins, sans-serif; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
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

                            return (
                                <div key={i}
                                    onClick={() => setSelectedDate(dateStr)}
                                    className={`cal-day-box ${isSelected ? 'selected' : ''}`}
                                >
                                    <div className="cal-day-bg" />
                                    <div className="cal-day-num">{day}</div>
                                    <div className="cal-inds">
                                        {confirmedCount > 0 && (
                                            <div className="cal-ind conf">
                                                <span className="cal-ind-dot" style={{ backgroundColor: '#00D478' }}></span>
                                                <span className="cal-ind-text">{confirmedCount} Confirmed</span>
                                            </div>
                                        )}
                                        {pendingCount > 0 && (
                                            <div className="cal-ind pend">
                                                <span className="cal-ind-dot" style={{ backgroundColor: '#FFB700' }}></span>
                                                <span className="cal-ind-text">{pendingCount} Pending</span>
                                            </div>
                                        )}
                                    </div>
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

                        <Clock size={12} /> {booking.preferredTime}
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
