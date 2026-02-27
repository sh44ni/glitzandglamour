'use client';

import { useEffect, useState, useMemo } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X, Clock, Edit2 } from 'lucide-react';

type Booking = {
    id: string; guestName?: string; guestEmail?: string; guestPhone?: string;
    preferredDate: string; preferredTime: string; status: string;
    user?: { name: string; email: string; phone?: string; image?: string | null; };
    service: { name: string; priceLabel: string; };
};

export default function AdminCalendarPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    useEffect(() => {
        fetch('/api/admin/bookings')
            .then(r => r.json())
            .then(d => {
                setBookings(d.bookings || []);
                setLoading(false);
            });
    }, []);

    // Calendar generation
    const { daysInMonth, emptySlots, monthName, year } = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const monthName = currentDate.toLocaleString('default', { month: 'long' });

        // Let's assume week starts on Sunday (0)
        return { daysInMonth, emptySlots: firstDay, monthName, year, month };
    }, [currentDate]);

    // Group bookings by date (YYYY-MM-DD string matching)
    const bookingsByDate = useMemo(() => {
        const map: Record<string, Booking[]> = {};
        bookings.forEach(b => {
            if (!map[b.preferredDate]) map[b.preferredDate] = [];
            map[b.preferredDate].push(b);
        });
        return map;
    }, [bookings]);

    const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

    const selectedBookings = selectedDate ? (bookingsByDate[selectedDate] || []) : [];

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#fff', fontSize: '22px', marginBottom: '4px' }}>Calendar</h1>
                <p style={{ fontFamily: 'Poppins, sans-serif', color: '#555', fontSize: '13px' }}>Manage bookings by date and reschedule appointments.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
                {/* Calendar View */}
                <div className="glass" style={{ padding: '24px', borderRadius: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h2 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '18px', fontWeight: 600, color: '#fff' }}>
                            {monthName} {year}
                        </h2>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={handlePrevMonth} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '6px', cursor: 'pointer' }}>
                                <ChevronLeft size={18} color="#fff" />
                            </button>
                            <button onClick={handleNextMonth} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '6px', cursor: 'pointer' }}>
                                <ChevronRight size={18} color="#fff" />
                            </button>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', marginBottom: '8px' }}>
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                            <div key={d} style={{ textAlign: 'center', fontFamily: 'Poppins, sans-serif', fontSize: '11px', fontWeight: 600, color: '#666', paddingBottom: '8px' }}>
                                {d}
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
                        {Array.from({ length: emptySlots }).map((_, i) => (
                            <div key={`empty-${i}`} style={{ minHeight: '80px', background: 'rgba(255,255,255,0.01)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.03)' }} />
                        ))}

                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1;
                            const monthStr = String(currentDate.getMonth() + 1).padStart(2, '0');
                            const dayStr = String(day).padStart(2, '0');
                            const dateString = `${year}-${monthStr}-${dayStr}`;

                            const dayBookings = bookingsByDate[dateString] || [];
                            const pendingCount = dayBookings.filter(b => b.status === 'PENDING').length;
                            const confirmedCount = dayBookings.filter(b => b.status === 'CONFIRMED').length;
                            const isSelected = selectedDate === dateString;

                            return (
                                <div key={dateString}
                                    onClick={() => setSelectedDate(dateString)}
                                    style={{
                                        minHeight: '80px', borderRadius: '12px', padding: '8px', cursor: 'pointer',
                                        background: isSelected ? 'rgba(255,45,120,0.1)' : 'rgba(255,255,255,0.03)',
                                        border: isSelected ? '1px solid #FF2D78' : '1px solid rgba(255,255,255,0.05)',
                                        transition: 'all 0.2s'
                                    }}>
                                    <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px', fontWeight: 600, color: isSelected ? '#FF2D78' : '#ddd', marginBottom: '8px' }}>
                                        {day}
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        {confirmedCount > 0 && (
                                            <div style={{ fontSize: '10px', background: 'rgba(0, 212, 120, 0.1)', color: '#00D478', padding: '2px 6px', borderRadius: '4px', fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>
                                                {confirmedCount} Confirmed
                                            </div>
                                        )}
                                        {pendingCount > 0 && (
                                            <div style={{ fontSize: '10px', background: 'rgba(255, 183, 0, 0.1)', color: '#FFB700', padding: '2px 6px', borderRadius: '4px', fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>
                                                {pendingCount} Pending
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
                    <div className="glass" style={{ padding: '24px', borderRadius: '20px' }}>
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
                                    <BookingRow key={b.id} booking={b} onRescheduled={() => {
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

function BookingRow({ booking, onRescheduled }: { booking: Booking, onRescheduled: () => void }) {
    const [isRescheduling, setIsRescheduling] = useState(false);
    const [newDate, setNewDate] = useState(booking.preferredDate);
    const [newTime, setNewTime] = useState(booking.preferredTime);
    const [saving, setSaving] = useState(false);

    const customerName = booking.user?.name || booking.guestName || 'Guest';

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
                        {booking.service.name}
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
