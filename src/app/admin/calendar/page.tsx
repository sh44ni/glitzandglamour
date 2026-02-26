'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BookingData } from '@/types';

interface BookingWithId extends BookingData {
    id: string;
}

function getDaysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
    return new Date(year, month, 1).getDay();
}

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function AdminCalendarPage() {
    const [bookings, setBookings] = useState<BookingWithId[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [today] = useState(new Date());
    const [viewYear, setViewYear] = useState(today.getFullYear());
    const [viewMonth, setViewMonth] = useState(today.getMonth());
    const router = useRouter();

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const res = await fetch('/api/admin/bookings');
            if (res.status === 401) {
                router.push('/admin');
                return;
            }
            if (res.ok) {
                const data = await res.json();
                setBookings(data);
            }
        } catch {
            console.error('Failed to fetch bookings');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        await fetch('/api/admin/auth', { method: 'DELETE' });
        router.push('/admin');
    };

    const daysInMonth = getDaysInMonth(viewYear, viewMonth);
    const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

    // Group bookings by date
    const bookingsByDate = bookings.reduce<Record<string, BookingWithId[]>>((acc, booking) => {
        const date = booking.date;
        if (!acc[date]) acc[date] = [];
        acc[date].push(booking);
        return acc;
    }, {});

    const selectedBookings = selectedDate ? (bookingsByDate[selectedDate] || []) : [];

    const prevMonth = () => {
        if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
        else setViewMonth(m => m - 1);
    };
    const nextMonth = () => {
        if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
        else setViewMonth(m => m + 1);
    };

    const formatDateKey = (year: number, month: number, day: number) => {
        return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    };

    const isToday = (day: number) => {
        return day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
    };

    return (
        <div className="min-h-screen bg-[#0A0A0A]">
            {/* Header */}
            <div className="glass-nav border-b border-white/10 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div>
                        <h1 className="text-white font-bold text-xl">
                            <span className="text-[#FF1493]">Glitz & Glamour</span> Admin
                        </h1>
                        <p className="text-gray-500 text-xs">Booking Calendar</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-gray-400 text-sm">{bookings.length} total bookings</span>
                        <button
                            onClick={handleLogout}
                            className="text-sm text-gray-400 hover:text-[#FF1493] transition-colors"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Calendar */}
                    <div className="lg:col-span-2">
                        <div className="glass-card rounded-2xl p-6">
                            {/* Month navigation */}
                            <div className="flex items-center justify-between mb-6">
                                <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-all">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <h2 className="text-white font-semibold text-lg">{MONTH_NAMES[viewMonth]} {viewYear}</h2>
                                <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-all">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>

                            {/* Day headers */}
                            <div className="grid grid-cols-7 mb-2">
                                {DAY_NAMES.map(d => (
                                    <div key={d} className="text-center text-xs text-gray-500 font-medium py-2">{d}</div>
                                ))}
                            </div>

                            {/* Calendar grid */}
                            <div className="grid grid-cols-7 gap-1">
                                {/* Empty cells for first day offset */}
                                {Array.from({ length: firstDay }).map((_, i) => (
                                    <div key={`empty-${i}`} />
                                ))}

                                {/* Day cells */}
                                {Array.from({ length: daysInMonth }).map((_, i) => {
                                    const day = i + 1;
                                    const dateKey = formatDateKey(viewYear, viewMonth, day);
                                    const dayBookings = bookingsByDate[dateKey] || [];
                                    const isSelected = selectedDate === dateKey;
                                    const todayCell = isToday(day);

                                    return (
                                        <button
                                            key={day}
                                            onClick={() => setSelectedDate(isSelected ? null : dateKey)}
                                            className={`relative aspect-square rounded-xl flex flex-col items-center justify-start p-1 transition-all text-sm font-medium
                                                ${isSelected ? 'bg-[#FF1493] text-white' : todayCell ? 'bg-[#FF1493]/20 text-[#FF1493]' : 'hover:bg-white/5 text-gray-300'}
                                            `}
                                        >
                                            <span className="text-xs mt-1">{day}</span>
                                            {dayBookings.length > 0 && (
                                                <span className={`text-[10px] font-semibold mt-0.5 ${isSelected ? 'text-white/80' : 'text-[#FF1493]'}`}>
                                                    {dayBookings.length}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Booking details panel */}
                    <div>
                        <div className="glass-card rounded-2xl p-6">
                            {selectedDate ? (
                                <>
                                    <h3 className="text-white font-semibold mb-4">
                                        {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                                    </h3>
                                    {selectedBookings.length === 0 ? (
                                        <p className="text-gray-500 text-sm">No bookings on this day.</p>
                                    ) : (
                                        <div className="space-y-4">
                                            {selectedBookings.map((booking) => (
                                                <div key={booking.id} className="bg-black/30 rounded-xl p-4 border border-white/5">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div>
                                                            <p className="text-white font-medium">{booking.name}</p>
                                                            <p className="text-[#FF1493] text-sm">{booking.time}</p>
                                                        </div>
                                                        <span className={`text-xs px-2 py-1 rounded-full ${booking.status === 'confirmed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                                            {booking.status || 'pending'}
                                                        </span>
                                                    </div>
                                                    <p className="text-gray-400 text-sm mb-3">{booking.service}</p>
                                                    {booking.notes && (
                                                        <p className="text-gray-500 text-xs mb-3 italic">&ldquo;{booking.notes}&rdquo;</p>
                                                    )}
                                                    <div className="flex gap-2 flex-wrap">
                                                        <a href={`tel:${booking.phone}`} className="text-xs px-3 py-1.5 rounded-full bg-[#FF1493]/10 text-[#FF1493] hover:bg-[#FF1493]/20 transition-colors">
                                                            Call
                                                        </a>
                                                        <a href={`sms:${booking.phone}`} className="text-xs px-3 py-1.5 rounded-full bg-[#FF1493]/10 text-[#FF1493] hover:bg-[#FF1493]/20 transition-colors">
                                                            Text
                                                        </a>
                                                        <a href={`mailto:${booking.email}`} className="text-xs px-3 py-1.5 rounded-full bg-[#FF1493]/10 text-[#FF1493] hover:bg-[#FF1493]/20 transition-colors">
                                                            Email
                                                        </a>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-8">
                                    {isLoading ? (
                                        <p className="text-gray-500 text-sm">Loading bookings...</p>
                                    ) : (
                                        <>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-gray-700 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <p className="text-gray-500 text-sm">Select a date to view bookings</p>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Quick stats */}
                        <div className="mt-4 grid grid-cols-2 gap-4">
                            <div className="glass-card rounded-xl p-4 text-center">
                                <p className="text-2xl font-bold text-[#FF1493]">{bookings.length}</p>
                                <p className="text-gray-500 text-xs">Total</p>
                            </div>
                            <div className="glass-card rounded-xl p-4 text-center">
                                <p className="text-2xl font-bold text-[#FF1493]">
                                    {bookings.filter(b => b.date === formatDateKey(today.getFullYear(), today.getMonth(), today.getDate())).length}
                                </p>
                                <p className="text-gray-500 text-xs">Today</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
