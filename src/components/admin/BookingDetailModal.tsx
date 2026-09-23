'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    X, Phone, Mail, MessageSquare, Copy, Check, Calendar, Clock,
    AlertCircle, Sparkles, ShieldCheck, HeartPulse, FileText, Globe,
    ChevronRight, Trash2, User, ExternalLink, MapPin, Laptop, Tag,
    AlertTriangle, CheckCircle2, ChevronDown, Eye
} from 'lucide-react';
import ImageLightbox from '@/components/ImageLightbox';
import SmsComposerModal from '@/components/admin/SmsComposerModal';
import { format12h } from '@/lib/formatTime';

export type BookingDetailItem = {
    id: string;
    userId?: string | null;
    user?: {
        name: string;
        email: string;
        phone?: string;
        image?: string | null;
        totalVisits?: number;
    } | null;
    guestName?: string | null;
    guestEmail?: string | null;
    guestPhone?: string | null;
    serviceId?: string;
    service: {
        id?: string;
        name: string;
        priceLabel?: string;
        duration?: number;
        category?: string;
    };
    preferredDate: string;
    preferredTime: string;
    status: string;
    notes?: string | null;
    isPromoBooking?: boolean;
    promoPrice?: number | null;
    additionalServiceIds?: string | null;
    inspoImageUrls?: string[] | null;
    createdAt?: string;
    updatedAt?: string;
    bookingIp?: string | null;
    bookingUserAgent?: string | null;
    bookingCountry?: string | null;
    bookingRegion?: string | null;
    bookingCity?: string | null;
    bookingLatitude?: string | null;
    bookingLongitude?: string | null;
    healthIntake?: {
        skinTypes?: string[];
        healthQ?: Record<string, 'yes' | 'no'>;
        healthQuestions?: { key: string; question: string; answer: 'yes' | 'no' }[];
        medications?: string;
        allergies?: string[];
        allergyNotes?: string;
        emergencyName?: string;
        emergencyPhone?: string;
        emergencyRelation?: string;
    } | null;
    staffLogs?: { id: string; label: string; text: string; createdAt: string }[];
};

type ClientNote = {
    id: string;
    text: string;
    imageUrl?: string | null;
    createdAt: string;
};

type StaffLogHistoryItem = {
    id: string;
    label: string;
    text: string;
    createdAt: string;
    bookingId: string;
    booking: {
        id: string;
        preferredDate: string;
        preferredTime: string;
        status: string;
        createdAt: string;
    };
};

const PRESET_STAFF_LABELS = [
    'VIP',
    'FOLLOW-UP',
    'DEPOSIT PAID',
    'CALLED & CONFIRMED',
    'LEFT VOICEMAIL',
    'LATE SHOW',
    'NO-SHOW',
    'RESCHEDULED',
    'CANCELLED BY CLIENT',
    'CANCELLED BY US',
    'PAYMENT ISSUE',
    'SPECIAL REQUEST',
    'ALLERGY ALERT',
] as const;

const CLIENT_NOTE_QUICK_TAGS = [
    'VIP CLIENT',
    'REQUIRE PREPAY',
    'NO-SHOW RISK',
    'NO RESPONSE',
    'MULTIPLE CANCELLATIONS',
    'CANCELLED BY US',
    'BLACKLIST CANDIDATE',
];

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
    PENDING: { label: 'Pending', color: '#FFB700', bg: 'rgba(255, 183, 0, 0.12)', border: 'rgba(255, 183, 0, 0.3)' },
    CONTACTED: { label: 'Contacted', color: '#FF8C42', bg: 'rgba(255, 140, 66, 0.12)', border: 'rgba(255, 140, 66, 0.3)' },
    IN_TALKS: { label: 'In Talks', color: '#38BDF8', bg: 'rgba(56, 189, 248, 0.12)', border: 'rgba(56, 189, 248, 0.3)' },
    CONFIRMED: { label: 'Confirmed', color: '#00D478', bg: 'rgba(0, 212, 120, 0.12)', border: 'rgba(0, 212, 120, 0.3)' },
    COMPLETED: { label: 'Completed', color: '#FF2D78', bg: 'rgba(255, 45, 120, 0.12)', border: 'rgba(255, 45, 120, 0.3)' },
    CANCELLED: { label: 'Cancelled', color: '#888888', bg: 'rgba(255, 255, 255, 0.05)', border: 'rgba(255, 255, 255, 0.1)' },
};

const LEGACY_HEALTH_MAP: Record<string, string> = {
    pregnant: 'Pregnant or breastfeeding?',
    accutane: 'Used Accutane / isotretinoin in the past 12 months?',
    retinoids: 'Using retinoids, Retin-A, or exfoliating acids (AHA/BHA)?',
    botox: 'Had Botox, fillers, or injections in the past 2 weeks?',
    surgery: 'Had surgery or medical procedures in the past 6 months?',
    infections: 'Any active skin infections, open wounds, or cold sores?',
    autoimmune: 'Any autoimmune conditions, diabetes, or circulatory issues?',
    hsv: 'History of cold sores (HSV)?',
    pacemaker: 'Pacemaker or implanted medical device?',
};


function formatDate(dateStr: string): string {
    if (!dateStr) return '';
    try {
        const [year, month, day] = dateStr.split('-').map(Number);
        if (year && month && day) {
            const d = new Date(year, month - 1, day);
            return d.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
            });
        }
    } catch { }
    return dateStr;
}

interface BookingDetailModalProps {
    booking: BookingDetailItem;
    onClose: () => void;
    onBookingUpdated?: (updatedBooking: BookingDetailItem) => void;
    onStatusChange?: (bookingId: string, newStatus: string) => Promise<void>;
    onConfirmAppointment?: (bookingId: string, date: string, time: string) => Promise<void>;
    onCompleteAppointment?: (booking: BookingDetailItem) => void;
}

export default function BookingDetailModal({
    booking,
    onClose,
    onBookingUpdated,
    onStatusChange,
    onConfirmAppointment,
    onCompleteAppointment,
}: BookingDetailModalProps) {
    const [activeTab, setActiveTab] = useState<'overview' | 'health' | 'notes' | 'origin'>('overview');
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

    // Client Notes State (Customer Account Level)
    const [clientNotes, setClientNotes] = useState<ClientNote[]>([]);
    const [loadingClientNotes, setLoadingClientNotes] = useState(false);
    const [clientNoteText, setClientNoteText] = useState('');
    const [savingClientNote, setSavingClientNote] = useState(false);
    const [deletingClientNoteId, setDeletingClientNoteId] = useState<string | null>(null);

    // Staff Log State (Current Booking Level)
    const [staffLabelMode, setStaffLabelMode] = useState<'preset' | 'custom'>('preset');
    const [selectedStaffPreset, setSelectedStaffPreset] = useState<string>(PRESET_STAFF_LABELS[0]);
    const [customStaffLabel, setCustomStaffLabel] = useState('');
    const [staffLogText, setStaffLogText] = useState('');
    const [savingStaffLog, setSavingStaffLog] = useState(false);
    const [deletingStaffLogId, setDeletingStaffLogId] = useState<string | null>(null);

    // Historical Staff Logs State (Across previous bookings)
    const [historyLogs, setHistoryLogs] = useState<StaffLogHistoryItem[]>([]);
    const [loadingHistoryLogs, setLoadingHistoryLogs] = useState(false);

    // Inline Reschedule / Confirm Stage Panel State
    const [showConfirmPanel, setShowConfirmPanel] = useState(false);
    const [customDate, setCustomDate] = useState(booking.preferredDate);
    const [customTime, setCustomTime] = useState(booking.preferredTime);
    const [confirmBusy, setConfirmBusy] = useState(false);
    const [smsComposerOpen, setSmsComposerOpen] = useState(false);

    const customerName = booking.user?.name || booking.guestName || 'Guest';
    const customerEmail = booking.user?.email || booking.guestEmail || '';
    const customerPhone = booking.user?.phone || booking.guestPhone || '';
    const isRegistered = Boolean(booking.userId);
    const statusCfg = STATUS_CONFIG[booking.status] || STATUS_CONFIG.PENDING;

    // Fetch account notes if registered client
    const fetchClientNotes = useCallback(async () => {
        if (!booking.userId) return;
        setLoadingClientNotes(true);
        try {
            const res = await fetch(`/api/admin/customers/${booking.userId}/notes`);
            if (res.ok) {
                const data = await res.json();
                setClientNotes(data.notes || []);
            }
        } catch { } finally {
            setLoadingClientNotes(false);
        }
    }, [booking.userId]);

    useEffect(() => {
        fetchClientNotes();
    }, [fetchClientNotes]);

    // Fetch previous appointment staff logs
    const fetchHistoryLogs = useCallback(async () => {
        setLoadingHistoryLogs(true);
        try {
            const res = await fetch(`/api/admin/bookings/staff-log-history?bookingId=${encodeURIComponent(booking.id)}`);
            if (res.ok) {
                const data = await res.json();
                const all = (data.logs || []) as StaffLogHistoryItem[];
                setHistoryLogs(all.filter(l => l.bookingId !== booking.id));
            }
        } catch { } finally {
            setLoadingHistoryLogs(false);
        }
    }, [booking.id]);

    useEffect(() => {
        fetchHistoryLogs();
    }, [fetchHistoryLogs]);

    const copyToClipboard = async (text: string, fieldName: string) => {
        if (!text) return;
        try {
            await navigator.clipboard.writeText(text);
            setCopiedField(fieldName);
            setTimeout(() => setCopiedField(null), 2000);
        } catch { }
    };

    const copyAllClientInfo = async () => {
        const text = `Glitz & Glamour Studio Booking
Client: ${customerName}
Phone: ${customerPhone || 'N/A'}
Email: ${customerEmail || 'N/A'}
Service: ${booking.service.name} (${booking.service.priceLabel || '$' + (booking.promoPrice || 0)})
Date: ${formatDate(booking.preferredDate)} at ${format12h(booking.preferredTime)}
Status: ${statusCfg.label}
ID: ${booking.id}`;
        copyToClipboard(text, 'all');
    };

    // Staff Log Actions
    const handleAddStaffLog = async () => {
        if (!staffLogText.trim()) return;
        const label = staffLabelMode === 'custom'
            ? (customStaffLabel.trim() || 'CUSTOM')
            : selectedStaffPreset;
        setSavingStaffLog(true);
        try {
            const res = await fetch('/api/admin/bookings/staff-log', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookingId: booking.id, label, text: staffLogText.trim() }),
            });
            const d = await res.json();
            if (res.ok && d.booking) {
                onBookingUpdated?.(d.booking);
                setStaffLogText('');
            } else {
                alert(d.error || 'Failed to save staff log');
            }
        } catch (e: any) {
            alert(e?.message || 'Error saving staff log');
        } finally {
            setSavingStaffLog(false);
        }
    };

    const handleDeleteStaffLog = async (logId: string) => {
        if (!confirm('Are you sure you want to delete this staff log note?')) return;
        setDeletingStaffLogId(logId);
        try {
            const res = await fetch(
                `/api/admin/bookings/staff-log?logId=${encodeURIComponent(logId)}&bookingId=${encodeURIComponent(booking.id)}`,
                { method: 'DELETE' }
            );
            const d = await res.json();
            if (res.ok && d.booking) {
                onBookingUpdated?.(d.booking);
            } else {
                alert(d.error || 'Failed to delete staff log');
            }
        } catch (e: any) {
            alert(e?.message || 'Error deleting log');
        } finally {
            setDeletingStaffLogId(null);
        }
    };

    // Client Account Notes Actions
    const handleAddClientNote = async () => {
        if (!booking.userId || !clientNoteText.trim()) return;
        setSavingClientNote(true);
        try {
            const res = await fetch('/api/admin/customers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerId: booking.userId,
                    action: 'add-note',
                    noteText: clientNoteText.trim(),
                }),
            });
            if (res.ok) {
                setClientNoteText('');
                await fetchClientNotes();
            } else {
                const d = await res.json().catch(() => ({}));
                alert(d.error || 'Failed to save client note');
            }
        } catch (e: any) {
            alert(e?.message || 'Error saving client note');
        } finally {
            setSavingClientNote(false);
        }
    };

    const handleDeleteClientNote = async (noteId: string) => {
        if (!booking.userId) return;
        if (!confirm('Are you sure you want to delete this client account note?')) return;
        setDeletingClientNoteId(noteId);
        try {
            const res = await fetch('/api/admin/customers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerId: booking.userId,
                    action: 'delete-note',
                    noteId,
                }),
            });
            if (res.ok) {
                await fetchClientNotes();
            }
        } catch { } finally {
            setDeletingClientNoteId(null);
        }
    };

    // Status Change
    const handleSetStatus = async (targetStatus: string) => {
        if (targetStatus === 'CONFIRMED') {
            setShowConfirmPanel(true);
            return;
        }
        if (targetStatus === 'COMPLETED' && onCompleteAppointment) {
            onCompleteAppointment(booking);
            return;
        }
        if (onStatusChange) {
            await onStatusChange(booking.id, targetStatus);
            return;
        }
        // Direct fallback patch
        try {
            const res = await fetch('/api/admin/bookings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookingId: booking.id, status: targetStatus }),
            });
            const d = await res.json();
            if (res.ok && d.booking) {
                onBookingUpdated?.(d.booking);
            }
        } catch { }
    };

    const handleConfirmAppointmentAction = async () => {
        setConfirmBusy(true);
        try {
            if (onConfirmAppointment) {
                await onConfirmAppointment(booking.id, customDate, customTime);
            } else {
                const res = await fetch('/api/admin/bookings', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        bookingId: booking.id,
                        status: 'CONFIRMED',
                        newDate: customDate,
                        newTime: customTime,
                    }),
                });
                const d = await res.json();
                if (res.ok && d.booking) {
                    onBookingUpdated?.(d.booking);
                }
            }
            setShowConfirmPanel(false);
        } catch (e: any) {
            alert(e?.message || 'Failed to confirm appointment');
        } finally {
            setConfirmBusy(false);
        }
    };

    // Intake questions parser
    const healthQuestions = useMemo(() => {
        if (!booking.healthIntake) return [];
        if (booking.healthIntake.healthQuestions && booking.healthIntake.healthQuestions.length > 0) {
            return booking.healthIntake.healthQuestions;
        }
        if (booking.healthIntake.healthQ && Object.keys(booking.healthIntake.healthQ).length > 0) {
            return Object.entries(booking.healthIntake.healthQ).map(([key, val]) => ({
                key,
                question: LEGACY_HEALTH_MAP[key] || key,
                answer: val,
            }));
        }
        return [];
    }, [booking.healthIntake]);

    const totalStaffLogsCount = (booking.staffLogs?.length || 0) + (historyLogs.length || 0);

    return (
        <div
            className="bdm-backdrop-overlay"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 250,
                background: 'rgba(4, 4, 8, 0.82)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
                animation: 'adminModalFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
        >
            <style>{`
                @media (max-width: 767px) {
                    .bdm-backdrop-overlay {
                        padding: 6px !important;
                    }
                    .bdm-dialog-card {
                        border-radius: 20px !important;
                        max-height: 96vh !important;
                        margin: 0 !important;
                        width: 100% !important;
                    }
                    .bdm-header {
                        padding: 14px 14px 10px !important;
                    }
                    .bdm-desktop-actions {
                        display: none !important;
                    }
                    .bdm-mobile-close {
                        display: flex !important;
                    }
                    .bdm-mobile-thumb-actions {
                        display: flex !important;
                    }
                    .bdm-tab-label-full {
                        display: none !important;
                    }
                    .bdm-tab-label-short {
                        display: inline !important;
                    }
                    .bdm-tabs-bar {
                        gap: 4px !important;
                        padding: 3px !important;
                        margin-top: 10px !important;
                        width: 100% !important;
                    }
                    .bdm-tab-btn {
                        flex: 1 1 0% !important;
                        min-width: 0 !important;
                        padding: 7px 4px !important;
                        font-size: 11px !important;
                        justify-content: center !important;
                        gap: 4px !important;
                    }
                    .bdm-body {
                        padding: 16px 14px !important;
                    }
                    .bdm-modal-footer {
                        padding: 12px 14px 14px !important;
                    }
                }
                @media (min-width: 768px) {
                    .bdm-desktop-actions {
                        display: flex !important;
                    }
                    .bdm-mobile-close {
                        display: none !important;
                    }
                    .bdm-mobile-thumb-actions {
                        display: none !important;
                    }
                    .bdm-tab-label-full {
                        display: inline !important;
                    }
                    .bdm-tab-label-short {
                        display: none !important;
                    }
                }
                .bdm-thumb-btn {
                    flex: 1;
                    min-width: 0;
                    height: 40px;
                    border-radius: 10px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 5px;
                    font-family: Poppins, sans-serif;
                    font-size: 11.5px;
                    font-weight: 600;
                    text-decoration: none;
                    cursor: pointer;
                    transition: all 0.18s ease;
                    padding: 0 6px;
                    white-space: nowrap;
                }
                .bdm-thumb-call {
                    background: rgba(0, 212, 120, 0.12);
                    border: 1px solid rgba(0, 212, 120, 0.28);
                    color: #00D478;
                }
                .bdm-thumb-call:active {
                    background: rgba(0, 212, 120, 0.25);
                    transform: scale(0.97);
                }
                .bdm-thumb-sms {
                    background: rgba(56, 189, 248, 0.12);
                    border: 1px solid rgba(56, 189, 248, 0.28);
                    color: #38BDF8;
                }
                .bdm-thumb-sms:active {
                    background: rgba(56, 189, 248, 0.25);
                    transform: scale(0.97);
                }
                .bdm-thumb-email {
                    background: rgba(255, 45, 120, 0.12);
                    border: 1px solid rgba(255, 45, 120, 0.28);
                    color: #FF2D78;
                }
                .bdm-thumb-email:active {
                    background: rgba(255, 45, 120, 0.25);
                    transform: scale(0.97);
                }
                .bdm-thumb-copy {
                    background: rgba(255, 255, 255, 0.08);
                    border: 1px solid rgba(255, 255, 255, 0.14);
                    color: #eee;
                }
                .bdm-thumb-copy:active {
                    background: rgba(255, 255, 255, 0.16);
                    transform: scale(0.97);
                }
                .bdm-tabs-bar {
                    scrollbar-width: none;
                    -ms-overflow-style: none;
                }
                .bdm-tabs-bar::-webkit-scrollbar {
                    display: none;
                }
            `}</style>

            <div
                className="bdm-dialog-card"
                style={{
                    background: 'rgba(16, 16, 22, 0.94)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '24px',
                    width: '100%',
                    maxWidth: '840px',
                    maxHeight: '92vh',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 32px 80px rgba(0, 0, 0, 0.8), 0 0 1px rgba(255, 45, 120, 0.3)',
                    overflow: 'hidden',
                    animation: 'adminModalScaleIn 0.24s cubic-bezier(0.16, 1, 0.3, 1)',
                    position: 'relative',
                }}
            >
                {/* Background Ambient Pink Aura */}
                <div
                    style={{
                        position: 'absolute',
                        top: '-60px',
                        right: '5%',
                        width: '260px',
                        height: '160px',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(255,45,120,0.18) 0%, transparent 70%)',
                        filter: 'blur(40px)',
                        pointerEvents: 'none',
                        zIndex: 0,
                    }}
                />

                {/* ─── STICKY HEADER ────────────────────────────────────────── */}
                <div
                    className="bdm-header"
                    style={{
                        padding: '22px 26px 16px',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                        background: 'rgba(20, 20, 28, 0.7)',
                        backdropFilter: 'blur(16px)',
                        position: 'relative',
                        zIndex: 2,
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                        {/* Client Identity & Title */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                            <div
                                style={{
                                    width: '44px',
                                    height: '44px',
                                    borderRadius: '14px',
                                    background: 'linear-gradient(135deg, rgba(255,45,120,0.25) 0%, rgba(255,107,168,0.1) 100%)',
                                    border: '1px solid rgba(255, 45, 120, 0.35)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#FF2D78',
                                    fontFamily: 'Poppins, sans-serif',
                                    fontWeight: 700,
                                    fontSize: '18px',
                                    boxShadow: '0 4px 16px rgba(255,45,120,0.2)',
                                    flexShrink: 0,
                                }}
                            >
                                {customerName.charAt(0).toUpperCase()}
                            </div>

                            <div style={{ minWidth: 0, flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                    <h2
                                        style={{
                                            fontFamily: 'Poppins, sans-serif',
                                            fontWeight: 700,
                                            color: '#fff',
                                            fontSize: '18px',
                                            margin: 0,
                                            lineHeight: 1.2,
                                        }}
                                    >
                                        {customerName}
                                    </h2>

                                    {/* Member vs Guest Pill */}
                                    <span
                                        style={{
                                            fontFamily: 'Poppins, sans-serif',
                                            fontSize: '10px',
                                            fontWeight: 600,
                                            padding: '2px 7px',
                                            borderRadius: '6px',
                                            background: isRegistered ? 'rgba(0, 212, 120, 0.12)' : 'rgba(255, 255, 255, 0.06)',
                                            border: `1px solid ${isRegistered ? 'rgba(0, 212, 120, 0.25)' : 'rgba(255, 255, 255, 0.08)'}`,
                                            color: isRegistered ? '#00D478' : '#888',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        {isRegistered ? 'Verified Client' : 'Guest Booking'}
                                    </span>

                                    {/* Status Badge */}
                                    <span
                                        style={{
                                            fontFamily: 'Poppins, sans-serif',
                                            fontSize: '10px',
                                            fontWeight: 700,
                                            letterSpacing: '0.4px',
                                            padding: '2px 8px',
                                            borderRadius: '6px',
                                            background: statusCfg.bg,
                                            border: `1px solid ${statusCfg.border}`,
                                            color: statusCfg.color,
                                            textTransform: 'uppercase',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        {statusCfg.label}
                                    </span>
                                </div>

                                <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '11px', color: '#777', margin: '3px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    ID: <span style={{ fontFamily: 'monospace', color: '#aaa' }}>{booking.id.slice(0, 10)}…</span>
                                    {booking.createdAt && (
                                        <span> · Created {new Date(booking.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                    )}
                                </p>
                            </div>
                        </div>

                        {/* Top Right: Quick Communication Pills & Close (Desktop View) */}
                        <div className="bdm-desktop-actions" style={{ alignItems: 'center', gap: '8px', flexWrap: 'wrap', flexShrink: 0 }}>
                            {customerPhone && (
                                <>
                                    <a
                                        href={`tel:${customerPhone}`}
                                        style={{
                                            padding: '7px 12px',
                                            borderRadius: '10px',
                                            background: 'rgba(0, 212, 120, 0.1)',
                                            border: '1px solid rgba(0, 212, 120, 0.22)',
                                            color: '#00D478',
                                            textDecoration: 'none',
                                            fontFamily: 'Poppins, sans-serif',
                                            fontSize: '12px',
                                            fontWeight: 600,
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '5px',
                                            transition: 'all 0.18s ease',
                                        }}
                                    >
                                        <Phone size={13} /> Call
                                    </a>
                                    <button
                                        type="button"
                                        onClick={() => setSmsComposerOpen(true)}
                                        title="Compose and send SMS via Pingram"
                                        style={{
                                            padding: '7px 12px',
                                            borderRadius: '10px',
                                            background: 'rgba(56, 189, 248, 0.1)',
                                            border: '1px solid rgba(56, 189, 248, 0.22)',
                                            color: '#38BDF8',
                                            cursor: 'pointer',
                                            fontFamily: 'Poppins, sans-serif',
                                            fontSize: '12px',
                                            fontWeight: 600,
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '5px',
                                            transition: 'all 0.18s ease',
                                        }}
                                        onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(56, 189, 248, 0.18)')}
                                        onMouseOut={(e) => (e.currentTarget.style.background = 'rgba(56, 189, 248, 0.1)')}
                                    >
                                        <MessageSquare size={13} /> SMS
                                    </button>
                                </>
                            )}

                            {customerEmail && (
                                <a
                                    href={`mailto:${customerEmail}`}
                                    style={{
                                        padding: '7px 12px',
                                        borderRadius: '10px',
                                        background: 'rgba(255, 45, 120, 0.1)',
                                        border: '1px solid rgba(255, 45, 120, 0.22)',
                                        color: '#FF2D78',
                                        textDecoration: 'none',
                                        fontFamily: 'Poppins, sans-serif',
                                        fontSize: '12px',
                                        fontWeight: 600,
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '5px',
                                        transition: 'all 0.18s ease',
                                    }}
                                >
                                    <Mail size={13} /> Email
                                </a>
                            )}

                            <button
                                onClick={copyAllClientInfo}
                                title="Copy all details to clipboard"
                                style={{
                                    padding: '7px 12px',
                                    borderRadius: '10px',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    color: copiedField === 'all' ? '#00D478' : '#bbb',
                                    cursor: 'pointer',
                                    fontFamily: 'Poppins, sans-serif',
                                    fontSize: '12px',
                                    fontWeight: 500,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    transition: 'all 0.18s ease',
                                }}
                            >
                                {copiedField === 'all' ? <Check size={13} /> : <Copy size={13} />}
                                {copiedField === 'all' ? 'Copied' : 'Copy'}
                            </button>

                            <button
                                onClick={onClose}
                                style={{
                                    background: 'rgba(255, 255, 255, 0.07)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '50%',
                                    width: '34px',
                                    height: '34px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    color: '#ccc',
                                    transition: 'all 0.2s',
                                    marginLeft: '4px',
                                }}
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Top Right: Mobile-Only Close Button */}
                        <button
                            type="button"
                            onClick={onClose}
                            className="bdm-mobile-close"
                            aria-label="Close modal"
                            style={{
                                background: 'rgba(255, 255, 255, 0.08)',
                                border: '1px solid rgba(255, 255, 255, 0.12)',
                                borderRadius: '50%',
                                width: '34px',
                                height: '34px',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                color: '#ccc',
                                flexShrink: 0,
                            }}
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {/* ─── APPLE SEGMENTED TABS BAR ──────────────────────────── */}
                    <div
                        className="bdm-tabs-bar"
                        style={{
                            display: 'flex',
                            gap: '8px',
                            marginTop: '16px',
                            background: 'rgba(0, 0, 0, 0.35)',
                            padding: '4px',
                            borderRadius: '14px',
                            border: '1px solid rgba(255, 255, 255, 0.06)',
                            overflowX: 'auto',
                        }}
                    >
                        {[
                            { id: 'overview', label: 'Overview & Service', shortLabel: 'Overview', icon: Sparkles, count: undefined },
                            {
                                id: 'health',
                                label: 'Health & Intake',
                                shortLabel: 'Health',
                                icon: HeartPulse,
                                count: booking.healthIntake ? (healthQuestions.length > 0 ? healthQuestions.length : '✓') : undefined,
                            },
                            {
                                id: 'notes',
                                label: 'Staff & Notes',
                                shortLabel: 'Notes',
                                icon: FileText,
                                count: totalStaffLogsCount > 0 ? totalStaffLogsCount : undefined,
                            },
                            { id: 'origin', label: 'Origin & Audit', shortLabel: 'Audit', icon: Globe, count: undefined },
                        ].map((t) => {
                            const active = activeTab === t.id;
                            const Icon = t.icon;
                            return (
                                <button
                                    key={t.id}
                                    onClick={() => setActiveTab(t.id as any)}
                                    className="bdm-tab-btn"
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '7px',
                                        padding: '7px 14px',
                                        borderRadius: '10px',
                                        border: active ? '1px solid rgba(255, 45, 120, 0.35)' : '1px solid transparent',
                                        background: active
                                            ? 'linear-gradient(135deg, rgba(255, 45, 120, 0.22) 0%, rgba(255, 45, 120, 0.08) 100%)'
                                            : 'transparent',
                                        color: active ? '#FF2D78' : '#888',
                                        fontFamily: 'Poppins, sans-serif',
                                        fontSize: '12px',
                                        fontWeight: active ? 600 : 500,
                                        cursor: 'pointer',
                                        whiteSpace: 'nowrap',
                                        transition: 'all 0.18s ease',
                                    }}
                                >
                                    <Icon size={14} color={active ? '#FF2D78' : '#777'} style={{ flexShrink: 0 }} />
                                    <span className="bdm-tab-label-full">{t.label}</span>
                                    <span className="bdm-tab-label-short">{t.shortLabel}</span>
                                    {t.count !== undefined && (
                                        <span
                                            style={{
                                                fontSize: '10px',
                                                padding: '1px 6px',
                                                borderRadius: '8px',
                                                background: active ? '#FF2D78' : 'rgba(255,255,255,0.08)',
                                                color: active ? '#fff' : '#aaa',
                                                fontWeight: 700,
                                                flexShrink: 0,
                                            }}
                                        >
                                            {t.count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* ─── MODAL BODY SCROLL CANVAS ─────────────────────────────── */}
                <div
                    className="bdm-body"
                    style={{
                        padding: '24px 26px',
                        overflowY: 'auto',
                        flex: 1,
                        position: 'relative',
                        zIndex: 1,
                    }}
                >
                    {/* ══════════════════════════════════════════════════════════
                        TAB 1: OVERVIEW & SERVICE
                       ══════════════════════════════════════════════════════════ */}
                    {activeTab === 'overview' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {/* Two-Column Top Bento Deck */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                                {/* Left: Service & Appointment Card */}
                                <div
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.025)',
                                        border: '1px solid rgba(255, 255, 255, 0.08)',
                                        borderRadius: '18px',
                                        padding: '18px',
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                        <span style={{ fontSize: '11px', fontFamily: 'Poppins, sans-serif', color: '#777', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            Booked Service
                                        </span>
                                        {booking.service.category && (
                                            <span style={{ fontSize: '11px', color: '#FF6BA8', background: 'rgba(255,45,120,0.1)', padding: '2px 8px', borderRadius: '6px', border: '1px solid rgba(255,45,120,0.2)' }}>
                                                {booking.service.category}
                                            </span>
                                        )}
                                    </div>

                                    <h3
                                        style={{
                                            fontFamily: 'Poppins, sans-serif',
                                            fontSize: '18px',
                                            fontWeight: 700,
                                            color: '#fff',
                                            margin: '0 0 10px',
                                            background: 'linear-gradient(135deg, #fff 40%, #FF6BA8 100%)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                        }}
                                    >
                                        {booking.service.name}
                                    </h3>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ddd', fontSize: '13px', fontFamily: 'Poppins, sans-serif' }}>
                                            <Calendar size={14} color="#FF2D78" />
                                            <span style={{ fontWeight: 600 }}>{formatDate(booking.preferredDate)}</span>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ddd', fontSize: '13px', fontFamily: 'Poppins, sans-serif' }}>
                                            <Clock size={14} color="#00D478" />
                                            <span style={{ fontWeight: 600 }}>{format12h(booking.preferredTime)}</span>
                                            {booking.service.duration && (
                                                <span style={{ color: '#777', fontSize: '12px' }}>({booking.service.duration} mins)</span>
                                            )}
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                            <Tag size={13} color="#B76E79" />
                                            {booking.isPromoBooking || booking.promoPrice ? (
                                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                                    <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px', fontWeight: 800, color: '#00D478' }}>
                                                        ${booking.promoPrice || 0}
                                                    </span>
                                                    <span style={{ fontSize: '10px', color: '#FF2D78', background: 'rgba(255,45,120,0.12)', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(255,45,120,0.25)', fontWeight: 600 }}>
                                                        PROMO LOCKED
                                                    </span>
                                                </div>
                                            ) : (
                                                <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px', fontWeight: 700, color: '#fff' }}>
                                                    {booking.service.priceLabel || 'Custom Quote'}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Client Contact Specs */}
                                <div
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.025)',
                                        border: '1px solid rgba(255, 255, 255, 0.08)',
                                        borderRadius: '18px',
                                        padding: '18px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                    }}
                                >
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                            <span style={{ fontSize: '11px', fontFamily: 'Poppins, sans-serif', color: '#777', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                Contact & Dispatch
                                            </span>
                                            {booking.user?.totalVisits !== undefined && (
                                                <span style={{ fontSize: '11px', color: '#00D478', background: 'rgba(0,212,120,0.1)', padding: '2px 8px', borderRadius: '6px', border: '1px solid rgba(0,212,120,0.2)' }}>
                                                    {booking.user.totalVisits} lifetime visits
                                                </span>
                                            )}
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.25)', padding: '8px 12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.04)' }}>
                                                <div style={{ minWidth: 0 }}>
                                                    <span style={{ fontSize: '10px', color: '#666', textTransform: 'uppercase' }}>Phone</span>
                                                    <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', color: '#fff', margin: 0, fontWeight: 500 }}>
                                                        {customerPhone || 'None provided'}
                                                    </p>
                                                </div>
                                                {customerPhone && (
                                                    <button
                                                        onClick={() => copyToClipboard(customerPhone, 'phone')}
                                                        title="Copy phone"
                                                        style={{ background: 'none', border: 'none', color: copiedField === 'phone' ? '#00D478' : '#888', cursor: 'pointer', padding: '4px' }}
                                                    >
                                                        {copiedField === 'phone' ? <Check size={14} /> : <Copy size={14} />}
                                                    </button>
                                                )}
                                            </div>

                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.25)', padding: '8px 12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.04)' }}>
                                                <div style={{ minWidth: 0, overflow: 'hidden' }}>
                                                    <span style={{ fontSize: '10px', color: '#666', textTransform: 'uppercase' }}>Email</span>
                                                    <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', color: '#fff', margin: 0, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {customerEmail || 'None provided'}
                                                    </p>
                                                </div>
                                                {customerEmail && (
                                                    <button
                                                        onClick={() => copyToClipboard(customerEmail, 'email')}
                                                        title="Copy email"
                                                        style={{ background: 'none', border: 'none', color: copiedField === 'email' ? '#00D478' : '#888', cursor: 'pointer', padding: '4px' }}
                                                    >
                                                        {copiedField === 'email' ? <Check size={14} /> : <Copy size={14} />}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Client Message / Booking Note Quote */}
                            <div
                                style={{
                                    background: 'rgba(255, 255, 255, 0.025)',
                                    border: '1px solid rgba(255, 255, 255, 0.08)',
                                    borderRadius: '18px',
                                    padding: '18px',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                    <MessageSquare size={14} color="#FF2D78" />
                                    <span style={{ fontSize: '11px', fontFamily: 'Poppins, sans-serif', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
                                        Client Submission Note
                                    </span>
                                </div>
                                {booking.notes?.trim() ? (
                                    <div
                                        style={{
                                            background: 'rgba(0, 0, 0, 0.3)',
                                            borderLeft: '3px solid #FF2D78',
                                            borderRadius: '0 12px 12px 0',
                                            padding: '12px 16px',
                                        }}
                                    >
                                        <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', color: '#eee', margin: 0, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                                            "{booking.notes.trim()}"
                                        </p>
                                    </div>
                                ) : (
                                    <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#666', fontStyle: 'italic', margin: 0 }}>
                                        No special requests or message provided by the client during online booking.
                                    </p>
                                )}
                            </div>

                            {/* Inspiration Photo Gallery */}
                            <div
                                style={{
                                    background: 'rgba(255, 255, 255, 0.025)',
                                    border: '1px solid rgba(255, 255, 255, 0.08)',
                                    borderRadius: '18px',
                                    padding: '18px',
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                    <span style={{ fontSize: '11px', fontFamily: 'Poppins, sans-serif', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
                                        Inspiration Photos ({booking.inspoImageUrls?.length || 0})
                                    </span>
                                    {booking.inspoImageUrls && booking.inspoImageUrls.length > 0 && (
                                        <span style={{ fontSize: '11px', color: '#aaa' }}>Tap photo to zoom & inspect</span>
                                    )}
                                </div>

                                {booking.inspoImageUrls && booking.inspoImageUrls.length > 0 ? (
                                    <>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '10px' }}>
                                            {booking.inspoImageUrls.map((url, idx) => (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    onClick={() => setLightboxIndex(idx)}
                                                    style={{
                                                        aspectRatio: '1/1',
                                                        borderRadius: '12px',
                                                        overflow: 'hidden',
                                                        border: '1px solid rgba(255, 255, 255, 0.12)',
                                                        background: '#09090c',
                                                        position: 'relative',
                                                        padding: 0,
                                                        cursor: 'zoom-in',
                                                        transition: 'transform 0.18s, border-color 0.18s',
                                                    }}
                                                    onMouseOver={(e) => {
                                                        e.currentTarget.style.transform = 'scale(1.03)';
                                                        e.currentTarget.style.borderColor = '#FF2D78';
                                                    }}
                                                    onMouseOut={(e) => {
                                                        e.currentTarget.style.transform = 'scale(1)';
                                                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                                                    }}
                                                >
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img
                                                        src={url}
                                                        alt={`Inspo photo ${idx + 1}`}
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    />
                                                    <div
                                                        style={{
                                                            position: 'absolute',
                                                            bottom: '6px',
                                                            right: '6px',
                                                            background: 'rgba(0,0,0,0.6)',
                                                            borderRadius: '6px',
                                                            padding: '2px 4px',
                                                            display: 'flex',
                                                        }}
                                                    >
                                                        <Eye size={12} color="#fff" />
                                                    </div>
                                                </button>
                                            ))}
                                        </div>

                                        {lightboxIndex !== null && (
                                            <ImageLightbox
                                                images={booking.inspoImageUrls}
                                                startIndex={lightboxIndex}
                                                onClose={() => setLightboxIndex(null)}
                                            />
                                        )}
                                    </>
                                ) : (
                                    <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#666', fontStyle: 'italic', margin: 0 }}>
                                        No inspiration photos attached to this appointment.
                                    </p>
                                )}
                            </div>

                            {/* Pipeline Stage Controller */}
                            <div
                                style={{
                                    background: 'rgba(255, 255, 255, 0.025)',
                                    border: '1px solid rgba(255, 255, 255, 0.08)',
                                    borderRadius: '18px',
                                    padding: '18px',
                                }}
                            >
                                <span style={{ fontSize: '11px', fontFamily: 'Poppins, sans-serif', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600, display: 'block', marginBottom: '10px' }}>
                                    Manage Booking Pipeline Stage
                                </span>

                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {['PENDING', 'CONTACTED', 'IN_TALKS', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((st) => {
                                        const cfg = STATUS_CONFIG[st];
                                        const isCurrent = booking.status === st;
                                        return (
                                            <button
                                                key={st}
                                                type="button"
                                                onClick={() => handleSetStatus(st)}
                                                style={{
                                                    padding: '7px 14px',
                                                    borderRadius: '10px',
                                                    border: `1px solid ${isCurrent ? cfg.color : 'rgba(255, 255, 255, 0.08)'}`,
                                                    background: isCurrent ? cfg.bg : 'rgba(255, 255, 255, 0.03)',
                                                    color: isCurrent ? cfg.color : '#888',
                                                    fontFamily: 'Poppins, sans-serif',
                                                    fontSize: '12px',
                                                    fontWeight: isCurrent ? 700 : 500,
                                                    cursor: 'pointer',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '5px',
                                                    transition: 'all 0.18s ease',
                                                }}
                                            >
                                                {isCurrent && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: cfg.color }} />}
                                                {cfg.label}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Inline Confirm / Reschedule Date & Time Panel */}
                                {showConfirmPanel && (
                                    <div
                                        style={{
                                            marginTop: '14px',
                                            padding: '16px',
                                            borderRadius: '14px',
                                            background: 'rgba(0, 212, 120, 0.06)',
                                            border: '1px solid rgba(0, 212, 120, 0.25)',
                                            animation: 'adminModalScaleIn 0.2s ease',
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                            <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', color: '#00D478', fontWeight: 600 }}>
                                                📅 Lock in Date & Time for Confirmation
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPanel(false)}
                                                style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '11px' }}
                                            >
                                                Cancel
                                            </button>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginBottom: '12px' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '10px', color: '#888', textTransform: 'uppercase', marginBottom: '4px' }}>Date</label>
                                                <input
                                                    type="date"
                                                    value={customDate}
                                                    onChange={(e) => setCustomDate(e.target.value)}
                                                    style={{
                                                        width: '100%',
                                                        padding: '8px 10px',
                                                        borderRadius: '8px',
                                                        background: 'rgba(0,0,0,0.5)',
                                                        border: '1px solid rgba(255,255,255,0.12)',
                                                        color: '#fff',
                                                        fontSize: '12px',
                                                        fontFamily: 'Poppins, sans-serif',
                                                        outline: 'none',
                                                    }}
                                                />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '10px', color: '#888', textTransform: 'uppercase', marginBottom: '4px' }}>Time (12h or 24h format)</label>
                                                <input
                                                    type="time"
                                                    value={customTime}
                                                    onChange={(e) => setCustomTime(e.target.value)}
                                                    style={{
                                                        width: '100%',
                                                        padding: '8px 10px',
                                                        borderRadius: '8px',
                                                        background: 'rgba(0,0,0,0.5)',
                                                        border: '1px solid rgba(255,255,255,0.12)',
                                                        color: '#fff',
                                                        fontSize: '12px',
                                                        fontFamily: 'Poppins, sans-serif',
                                                        outline: 'none',
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={handleConfirmAppointmentAction}
                                            disabled={confirmBusy}
                                            style={{
                                                width: '100%',
                                                padding: '10px',
                                                borderRadius: '10px',
                                                background: 'linear-gradient(135deg, #00D478, #00A85A)',
                                                border: 'none',
                                                color: '#000',
                                                fontWeight: 700,
                                                fontFamily: 'Poppins, sans-serif',
                                                fontSize: '13px',
                                                cursor: confirmBusy ? 'not-allowed' : 'pointer',
                                                opacity: confirmBusy ? 0.7 : 1,
                                                boxShadow: '0 4px 16px rgba(0,212,120,0.3)',
                                            }}
                                        >
                                            {confirmBusy ? 'Locking Appointment…' : 'Confirm Appointment & Send Client Notifications ✓'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ══════════════════════════════════════════════════════════
                        TAB 2: HEALTH & INTAKE
                       ══════════════════════════════════════════════════════════ */}
                    {activeTab === 'health' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {booking.healthIntake ? (
                                <>
                                    {/* Top Status & Skin Types Banner */}
                                    <div
                                        style={{
                                            background: 'rgba(255, 255, 255, 0.025)',
                                            border: '1px solid rgba(255, 255, 255, 0.08)',
                                            borderRadius: '18px',
                                            padding: '18px',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            flexWrap: 'wrap',
                                            gap: '12px',
                                        }}
                                    >
                                        <div>
                                            <span style={{ fontSize: '11px', fontFamily: 'Poppins, sans-serif', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
                                                Skin Types & Concerns
                                            </span>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                                                {booking.healthIntake.skinTypes && booking.healthIntake.skinTypes.length > 0 ? (
                                                    booking.healthIntake.skinTypes.map((t) => (
                                                        <span
                                                            key={t}
                                                            style={{
                                                                fontFamily: 'Poppins, sans-serif',
                                                                fontSize: '12px',
                                                                color: '#ddd',
                                                                background: 'rgba(255, 45, 120, 0.1)',
                                                                border: '1px solid rgba(255, 45, 120, 0.25)',
                                                                borderRadius: '50px',
                                                                padding: '3px 12px',
                                                                fontWeight: 500,
                                                            }}
                                                        >
                                                            {t}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span style={{ fontSize: '12px', color: '#666', fontStyle: 'italic' }}>None indicated</span>
                                                )}
                                            </div>
                                        </div>

                                        <div
                                            style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                background: 'rgba(0,212,120,0.1)',
                                                border: '1px solid rgba(0,212,120,0.25)',
                                                borderRadius: '50px',
                                                padding: '6px 14px',
                                            }}
                                        >
                                            <Check size={14} color="#00D478" />
                                            <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#00D478', fontWeight: 600 }}>
                                                Consent Signed & Verified
                                            </span>
                                        </div>
                                    </div>

                                    {/* Allergies & Medications Alerts */}
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                                        {/* Allergies */}
                                        <div
                                            style={{
                                                background: booking.healthIntake.allergies && booking.healthIntake.allergies.length > 0
                                                    ? 'rgba(255, 80, 80, 0.08)'
                                                    : 'rgba(255, 255, 255, 0.025)',
                                                border: `1px solid ${booking.healthIntake.allergies && booking.healthIntake.allergies.length > 0 ? 'rgba(255, 80, 80, 0.25)' : 'rgba(255, 255, 255, 0.08)'}`,
                                                borderRadius: '18px',
                                                padding: '18px',
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                                <AlertTriangle size={15} color={booking.healthIntake.allergies && booking.healthIntake.allergies.length > 0 ? '#ff8888' : '#888'} />
                                                <span style={{ fontSize: '11px', fontFamily: 'Poppins, sans-serif', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
                                                    Allergies / Reactions
                                                </span>
                                            </div>

                                            {booking.healthIntake.allergies && booking.healthIntake.allergies.length > 0 ? (
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: booking.healthIntake.allergyNotes ? '8px' : 0 }}>
                                                    {booking.healthIntake.allergies.map((a) => (
                                                        <span
                                                            key={a}
                                                            style={{
                                                                fontFamily: 'Poppins, sans-serif',
                                                                fontSize: '12px',
                                                                color: '#ffaa88',
                                                                background: 'rgba(255, 100, 50, 0.15)',
                                                                border: '1px solid rgba(255, 100, 50, 0.3)',
                                                                borderRadius: '50px',
                                                                padding: '3px 10px',
                                                                fontWeight: 600,
                                                            }}
                                                        >
                                                            ⚠️ {a}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#00D478', margin: 0 }}>
                                                    ✓ No allergies reported by client
                                                </p>
                                            )}

                                            {booking.healthIntake.allergyNotes && (
                                                <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#ddd', fontStyle: 'italic', margin: '8px 0 0', background: 'rgba(0,0,0,0.25)', padding: '8px 10px', borderRadius: '8px' }}>
                                                    Notes: {booking.healthIntake.allergyNotes}
                                                </p>
                                            )}
                                        </div>

                                        {/* Current Medications */}
                                        <div
                                            style={{
                                                background: 'rgba(255, 255, 255, 0.025)',
                                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                                borderRadius: '18px',
                                                padding: '18px',
                                            }}
                                        >
                                            <span style={{ fontSize: '11px', fontFamily: 'Poppins, sans-serif', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                                                Current Medications
                                            </span>
                                            {booking.healthIntake.medications ? (
                                                <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', color: '#fff', fontStyle: 'italic', margin: 0, background: 'rgba(0,0,0,0.25)', padding: '10px 12px', borderRadius: '10px' }}>
                                                    {booking.healthIntake.medications}
                                                </p>
                                            ) : (
                                                <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#666', fontStyle: 'italic', margin: 0 }}>
                                                    None reported
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Emergency Contact */}
                                    {booking.healthIntake.emergencyName && (
                                        <div
                                            style={{
                                                background: 'rgba(255, 255, 255, 0.025)',
                                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                                borderRadius: '18px',
                                                padding: '18px',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                flexWrap: 'wrap',
                                                gap: '12px',
                                            }}
                                        >
                                            <div>
                                                <span style={{ fontSize: '11px', fontFamily: 'Poppins, sans-serif', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
                                                    Emergency Contact
                                                </span>
                                                <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px', color: '#fff', fontWeight: 600, margin: '4px 0 0' }}>
                                                    {booking.healthIntake.emergencyName}
                                                    {booking.healthIntake.emergencyRelation && (
                                                        <span style={{ color: '#888', fontWeight: 400 }}> ({booking.healthIntake.emergencyRelation})</span>
                                                    )}
                                                </p>
                                            </div>

                                            {booking.healthIntake.emergencyPhone && (
                                                <a
                                                    href={`tel:${booking.healthIntake.emergencyPhone}`}
                                                    style={{
                                                        padding: '7px 14px',
                                                        borderRadius: '10px',
                                                        background: 'rgba(255, 45, 120, 0.12)',
                                                        border: '1px solid rgba(255, 45, 120, 0.3)',
                                                        color: '#FF2D78',
                                                        textDecoration: 'none',
                                                        fontFamily: 'Poppins, sans-serif',
                                                        fontSize: '12px',
                                                        fontWeight: 600,
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                    }}
                                                >
                                                    <Phone size={13} /> {booking.healthIntake.emergencyPhone}
                                                </a>
                                            )}
                                        </div>
                                    )}

                                    {/* Health Screening Questionnaire Table */}
                                    <div
                                        style={{
                                            background: 'rgba(255, 255, 255, 0.025)',
                                            border: '1px solid rgba(255, 255, 255, 0.08)',
                                            borderRadius: '18px',
                                            padding: '18px',
                                        }}
                                    >
                                        <span style={{ fontSize: '11px', fontFamily: 'Poppins, sans-serif', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600, display: 'block', marginBottom: '12px' }}>
                                            Health Questionnaire Screening Matrix
                                        </span>

                                        {healthQuestions.length > 0 ? (
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '8px' }}>
                                                {healthQuestions.map((q) => {
                                                    const isYes = q.answer === 'yes';
                                                    return (
                                                        <div
                                                            key={q.key}
                                                            style={{
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                alignItems: 'center',
                                                                padding: '9px 12px',
                                                                borderRadius: '10px',
                                                                background: isYes ? 'rgba(255, 80, 80, 0.08)' : 'rgba(0, 0, 0, 0.25)',
                                                                border: `1px solid ${isYes ? 'rgba(255, 80, 80, 0.25)' : 'rgba(255, 255, 255, 0.04)'}`,
                                                            }}
                                                        >
                                                            <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#ddd', flex: 1, paddingRight: '12px' }}>
                                                                {q.question}
                                                            </span>
                                                            <span
                                                                style={{
                                                                    fontFamily: 'Poppins, sans-serif',
                                                                    fontSize: '11px',
                                                                    fontWeight: 700,
                                                                    color: isYes ? '#ff8888' : '#00D478',
                                                                    background: isYes ? 'rgba(255, 80, 80, 0.15)' : 'rgba(0, 212, 120, 0.12)',
                                                                    border: `1px solid ${isYes ? 'rgba(255, 80, 80, 0.3)' : 'rgba(0, 212, 120, 0.25)'}`,
                                                                    padding: '2px 8px',
                                                                    borderRadius: '6px',
                                                                    textTransform: 'uppercase',
                                                                    flexShrink: 0,
                                                                }}
                                                            >
                                                                {isYes ? 'YES ⚠️' : 'NO ✓'}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#666', fontStyle: 'italic', margin: 0 }}>
                                                No specific medical questions recorded.
                                            </p>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div
                                    style={{
                                        padding: '40px 20px',
                                        textAlign: 'center',
                                        background: 'rgba(255, 255, 255, 0.02)',
                                        borderRadius: '18px',
                                        border: '1px solid rgba(255, 255, 255, 0.06)',
                                    }}
                                >
                                    <HeartPulse size={32} color="#666" style={{ margin: '0 auto 12px' }} />
                                    <h4 style={{ fontFamily: 'Poppins, sans-serif', color: '#fff', fontSize: '16px', margin: '0 0 6px' }}>
                                        No Health Intake Submitted
                                    </h4>
                                    <p style={{ fontFamily: 'Poppins, sans-serif', color: '#777', fontSize: '13px', margin: 0, maxWidth: '420px', marginInline: 'auto' }}>
                                        This client did not complete an online health intake form during booking. You can take their health intake in person at the studio.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ══════════════════════════════════════════════════════════
                        TAB 3: STAFF & NOTES
                       ══════════════════════════════════════════════════════════ */}
                    {activeTab === 'notes' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                            {/* SECTION A: Appointment Staff Log */}
                            <div
                                style={{
                                    background: 'rgba(255, 255, 255, 0.025)',
                                    border: '1px solid rgba(255, 255, 255, 0.08)',
                                    borderRadius: '18px',
                                    padding: '18px',
                                }}
                            >
                                <span style={{ fontSize: '11px', fontFamily: 'Poppins, sans-serif', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                                    Staff Log For This Appointment <span style={{ color: '#555', fontWeight: 400 }}>(Studio internal only)</span>
                                </span>

                                {/* Preset Label Chips */}
                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
                                    {PRESET_STAFF_LABELS.map((tag) => {
                                        const active = staffLabelMode === 'preset' && selectedStaffPreset === tag;
                                        return (
                                            <button
                                                key={tag}
                                                type="button"
                                                onClick={() => {
                                                    setStaffLabelMode('preset');
                                                    setSelectedStaffPreset(tag);
                                                }}
                                                style={{
                                                    background: active ? 'rgba(255,45,120,0.2)' : 'rgba(255,255,255,0.04)',
                                                    border: `1px solid ${active ? 'rgba(255,45,120,0.45)' : 'rgba(255,255,255,0.08)'}`,
                                                    color: active ? '#FF2D78' : '#888',
                                                    borderRadius: '999px',
                                                    padding: '4px 10px',
                                                    cursor: 'pointer',
                                                    fontFamily: 'Poppins, sans-serif',
                                                    fontSize: '11px',
                                                    fontWeight: 600,
                                                    transition: 'all 0.15s ease',
                                                }}
                                            >
                                                {tag}
                                            </button>
                                        );
                                    })}
                                    <button
                                        type="button"
                                        onClick={() => setStaffLabelMode('custom')}
                                        style={{
                                            background: staffLabelMode === 'custom' ? 'rgba(255,45,120,0.2)' : 'rgba(255,255,255,0.04)',
                                            border: `1px solid ${staffLabelMode === 'custom' ? 'rgba(255,45,120,0.45)' : 'rgba(255,255,255,0.08)'}`,
                                            color: staffLabelMode === 'custom' ? '#FF2D78' : '#888',
                                            borderRadius: '999px',
                                            padding: '4px 10px',
                                            cursor: 'pointer',
                                            fontFamily: 'Poppins, sans-serif',
                                            fontSize: '11px',
                                            fontWeight: 600,
                                        }}
                                    >
                                        Custom Label
                                    </button>
                                </div>

                                {staffLabelMode === 'custom' && (
                                    <input
                                        type="text"
                                        value={customStaffLabel}
                                        onChange={(e) => setCustomStaffLabel(e.target.value)}
                                        placeholder="Type a custom label (e.g. SPECIAL POLISH, SENSITIVE NAILS)…"
                                        style={{
                                            width: '100%',
                                            background: 'rgba(0,0,0,0.3)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '10px',
                                            color: '#fff',
                                            fontFamily: 'Poppins, sans-serif',
                                            fontSize: '12px',
                                            padding: '8px 12px',
                                            outline: 'none',
                                            marginBottom: '10px',
                                        }}
                                    />
                                )}

                                <textarea
                                    value={staffLogText}
                                    onChange={(e) => setStaffLogText(e.target.value)}
                                    placeholder="Write appointment log (e.g. client requested square short, paid deposit, will be 5 mins late)…"
                                    rows={2}
                                    style={{
                                        width: '100%',
                                        background: 'rgba(0,0,0,0.3)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '12px',
                                        color: '#fff',
                                        fontFamily: 'Poppins, sans-serif',
                                        fontSize: '13px',
                                        padding: '10px 12px',
                                        outline: 'none',
                                        resize: 'vertical',
                                        marginBottom: '10px',
                                    }}
                                />

                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '14px' }}>
                                    <button
                                        type="button"
                                        onClick={handleAddStaffLog}
                                        disabled={!staffLogText.trim() || savingStaffLog}
                                        style={{
                                            background: staffLogText.trim() ? 'linear-gradient(135deg, #FF2D78, #CC1E5A)' : 'rgba(255,255,255,0.06)',
                                            border: 'none',
                                            borderRadius: '10px',
                                            padding: '8px 16px',
                                            cursor: !staffLogText.trim() || savingStaffLog ? 'not-allowed' : 'pointer',
                                            fontFamily: 'Poppins, sans-serif',
                                            fontSize: '12px',
                                            fontWeight: 700,
                                            color: staffLogText.trim() ? '#fff' : '#555',
                                            opacity: savingStaffLog ? 0.7 : 1,
                                            boxShadow: staffLogText.trim() ? '0 4px 14px rgba(255,45,120,0.25)' : 'none',
                                            transition: 'all 0.15s ease',
                                        }}
                                    >
                                        {savingStaffLog ? 'Saving…' : 'Log Note'}
                                    </button>
                                </div>

                                {/* Active logs list */}
                                {(booking.staffLogs?.length ?? 0) === 0 ? (
                                    <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#666', fontStyle: 'italic', margin: 0 }}>
                                        No staff logs recorded for this appointment yet.
                                    </p>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {(booking.staffLogs || []).map((log) => (
                                            <div
                                                key={log.id}
                                                style={{
                                                    background: 'rgba(0,0,0,0.3)',
                                                    border: '1px solid rgba(255,255,255,0.06)',
                                                    borderRadius: '12px',
                                                    padding: '12px 14px',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'flex-start',
                                                    gap: '12px',
                                                }}
                                            >
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    {log.label && (
                                                        <span
                                                            style={{
                                                                display: 'inline-block',
                                                                marginBottom: '4px',
                                                                fontFamily: 'Poppins, sans-serif',
                                                                fontSize: '10px',
                                                                fontWeight: 700,
                                                                letterSpacing: '0.4px',
                                                                color: '#FF2D78',
                                                                background: 'rgba(255,45,120,0.12)',
                                                                border: '1px solid rgba(255,45,120,0.25)',
                                                                borderRadius: '6px',
                                                                padding: '2px 8px',
                                                            }}
                                                        >
                                                            {log.label}
                                                        </span>
                                                    )}
                                                    <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', color: '#eee', margin: '2px 0 4px', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                                                        {log.text}
                                                    </p>
                                                    <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '10px', color: '#666', margin: 0 }}>
                                                        {new Date(log.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteStaffLog(log.id)}
                                                    disabled={deletingStaffLogId === log.id}
                                                    title="Delete staff note"
                                                    style={{
                                                        background: 'rgba(255, 60, 60, 0.08)',
                                                        border: '1px solid rgba(255, 60, 60, 0.2)',
                                                        borderRadius: '8px',
                                                        padding: '6px 8px',
                                                        cursor: 'pointer',
                                                        color: '#ff6b6b',
                                                        flexShrink: 0,
                                                    }}
                                                >
                                                    {deletingStaffLogId === log.id ? '…' : <Trash2 size={13} />}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* SECTION B: Historical Notes (Cross-Booking Client History) */}
                            <div
                                style={{
                                    background: 'rgba(255, 255, 255, 0.025)',
                                    border: '1px solid rgba(255, 255, 255, 0.08)',
                                    borderRadius: '18px',
                                    padding: '18px',
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                    <span style={{ fontSize: '11px', fontFamily: 'Poppins, sans-serif', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
                                        Client History Notes <span style={{ color: '#555', fontWeight: 400 }}>(From past appointments)</span>
                                    </span>
                                    <span style={{ fontSize: '11px', color: '#666' }}>{historyLogs.length} previous logs</span>
                                </div>

                                {loadingHistoryLogs ? (
                                    <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#666' }}>Loading past records…</p>
                                ) : historyLogs.length === 0 ? (
                                    <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#666', fontStyle: 'italic', margin: 0 }}>
                                        No prior booking notes on file for this client.
                                    </p>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {historyLogs.slice(0, 6).map((log) => (
                                            <div
                                                key={log.id}
                                                style={{
                                                    background: 'rgba(0,0,0,0.25)',
                                                    border: '1px solid rgba(255,255,255,0.05)',
                                                    borderRadius: '12px',
                                                    padding: '10px 14px',
                                                }}
                                            >
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                                    {log.label ? (
                                                        <span style={{ fontSize: '10px', color: '#38BDF8', background: 'rgba(56,189,248,0.1)', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                                                            {log.label}
                                                        </span>
                                                    ) : <span />}
                                                    <span style={{ fontSize: '10px', color: '#666' }}>
                                                        {formatDate(log.booking.preferredDate)} · {format12h(log.booking.preferredTime)} ({log.booking.status})
                                                    </span>
                                                </div>
                                                <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#ccc', margin: 0, lineHeight: 1.5 }}>
                                                    {log.text}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* SECTION C: Client Profile Notes (Permanent Account-Level) */}
                            {isRegistered && (
                                <div
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.025)',
                                        border: '1px solid rgba(255, 255, 255, 0.08)',
                                        borderRadius: '18px',
                                        padding: '18px',
                                    }}
                                >
                                    <span style={{ fontSize: '11px', fontFamily: 'Poppins, sans-serif', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                                        Client Account Profile Notes <span style={{ color: '#555', fontWeight: 400 }}>(Permanent on their profile)</span>
                                    </span>

                                    {/* Quick Tag Badges */}
                                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
                                        {CLIENT_NOTE_QUICK_TAGS.map((tag) => (
                                            <button
                                                key={tag}
                                                type="button"
                                                onClick={() => setClientNoteText((prev) => (prev ? `${prev}\n${tag}: ` : `${tag}: `))}
                                                style={{
                                                    background: 'rgba(255,45,120,0.08)',
                                                    border: '1px solid rgba(255,45,120,0.2)',
                                                    color: '#FF2D78',
                                                    borderRadius: '999px',
                                                    padding: '3px 10px',
                                                    cursor: 'pointer',
                                                    fontFamily: 'Poppins, sans-serif',
                                                    fontSize: '11px',
                                                    fontWeight: 600,
                                                }}
                                            >
                                                + {tag}
                                            </button>
                                        ))}
                                    </div>

                                    <textarea
                                        value={clientNoteText}
                                        onChange={(e) => setClientNoteText(e.target.value)}
                                        placeholder="Add an account note (e.g. VIP client, preferred nail tech, allergy caveats, payment terms)…"
                                        rows={2}
                                        style={{
                                            width: '100%',
                                            background: 'rgba(0,0,0,0.3)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '12px',
                                            color: '#fff',
                                            fontFamily: 'Poppins, sans-serif',
                                            fontSize: '13px',
                                            padding: '10px 12px',
                                            outline: 'none',
                                            resize: 'vertical',
                                            marginBottom: '10px',
                                        }}
                                    />

                                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '14px' }}>
                                        <button
                                            type="button"
                                            onClick={handleAddClientNote}
                                            disabled={!clientNoteText.trim() || savingClientNote}
                                            style={{
                                                background: clientNoteText.trim() ? 'linear-gradient(135deg, #FF2D78, #7928CA)' : 'rgba(255,255,255,0.06)',
                                                border: 'none',
                                                borderRadius: '10px',
                                                padding: '8px 16px',
                                                cursor: !clientNoteText.trim() || savingClientNote ? 'not-allowed' : 'pointer',
                                                fontFamily: 'Poppins, sans-serif',
                                                fontSize: '12px',
                                                fontWeight: 700,
                                                color: clientNoteText.trim() ? '#fff' : '#555',
                                                opacity: savingClientNote ? 0.7 : 1,
                                            }}
                                        >
                                            {savingClientNote ? 'Saving…' : 'Save Account Note'}
                                        </button>
                                    </div>

                                    {/* Account Notes List */}
                                    {loadingClientNotes ? (
                                        <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#666' }}>Loading client notes…</p>
                                    ) : clientNotes.length === 0 ? (
                                        <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#666', fontStyle: 'italic', margin: 0 }}>
                                            No account notes attached to this client profile yet.
                                        </p>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            {clientNotes.map((n) => (
                                                <div
                                                    key={n.id}
                                                    style={{
                                                        background: 'rgba(0,0,0,0.3)',
                                                        border: '1px solid rgba(255,255,255,0.06)',
                                                        borderRadius: '12px',
                                                        padding: '12px 14px',
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'flex-start',
                                                        gap: '12px',
                                                    }}
                                                >
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', color: '#ddd', margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                                                            {n.text}
                                                        </p>
                                                        <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '10px', color: '#666', margin: '4px 0 0' }}>
                                                            {new Date(n.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteClientNote(n.id)}
                                                        disabled={deletingClientNoteId === n.id}
                                                        title="Delete client account note"
                                                        style={{
                                                            background: 'rgba(255, 60, 60, 0.08)',
                                                            border: '1px solid rgba(255, 60, 60, 0.2)',
                                                            borderRadius: '8px',
                                                            padding: '6px 8px',
                                                            cursor: 'pointer',
                                                            color: '#ff6b6b',
                                                        }}
                                                    >
                                                        {deletingClientNoteId === n.id ? '…' : <Trash2 size={13} />}
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ══════════════════════════════════════════════════════════
                        TAB 4: ORIGIN & AUDIT
                       ══════════════════════════════════════════════════════════ */}
                    {activeTab === 'origin' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {/* Geo Location Card */}
                            <div
                                style={{
                                    background: 'rgba(255, 255, 255, 0.025)',
                                    border: '1px solid rgba(255, 255, 255, 0.08)',
                                    borderRadius: '18px',
                                    padding: '18px',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                    <MapPin size={15} color="#FF2D78" />
                                    <span style={{ fontSize: '11px', fontFamily: 'Poppins, sans-serif', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
                                        Geographic Origin
                                    </span>
                                </div>

                                <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '15px', color: '#fff', fontWeight: 600, margin: '0 0 4px' }}>
                                    {[booking.bookingCity, booking.bookingRegion, booking.bookingCountry].filter(Boolean).join(', ') || 'Location data unavailable'}
                                </p>

                                {(booking.bookingLatitude || booking.bookingLongitude) && (
                                    <p style={{ fontFamily: 'monospace', fontSize: '11px', color: '#777', margin: 0 }}>
                                        Coordinates: {booking.bookingLatitude || '—'}, {booking.bookingLongitude || '—'}
                                    </p>
                                )}
                            </div>

                            {/* IP Address Card */}
                            <div
                                style={{
                                    background: 'rgba(255, 255, 255, 0.025)',
                                    border: '1px solid rgba(255, 255, 255, 0.08)',
                                    borderRadius: '18px',
                                    padding: '18px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                }}
                            >
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                        <Globe size={15} color="#00D478" />
                                        <span style={{ fontSize: '11px', fontFamily: 'Poppins, sans-serif', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
                                            Client IP Address
                                        </span>
                                    </div>
                                    <p style={{ fontFamily: 'monospace', fontSize: '14px', color: '#fff', margin: 0 }}>
                                        {booking.bookingIp || 'No IP recorded'}
                                    </p>
                                </div>

                                {booking.bookingIp && (
                                    <button
                                        type="button"
                                        onClick={() => copyToClipboard(booking.bookingIp!, 'ip')}
                                        style={{
                                            padding: '6px 12px',
                                            borderRadius: '8px',
                                            background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            color: copiedField === 'ip' ? '#00D478' : '#bbb',
                                            cursor: 'pointer',
                                            fontFamily: 'Poppins, sans-serif',
                                            fontSize: '11px',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '5px',
                                        }}
                                    >
                                        {copiedField === 'ip' ? <Check size={12} /> : <Copy size={12} />}
                                        {copiedField === 'ip' ? 'Copied' : 'Copy IP'}
                                    </button>
                                )}
                            </div>

                            {/* Device & User Agent Card */}
                            <div
                                style={{
                                    background: 'rgba(255, 255, 255, 0.025)',
                                    border: '1px solid rgba(255, 255, 255, 0.08)',
                                    borderRadius: '18px',
                                    padding: '18px',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                    <Laptop size={15} color="#38BDF8" />
                                    <span style={{ fontSize: '11px', fontFamily: 'Poppins, sans-serif', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
                                        User Agent / Browser Footprint
                                    </span>
                                </div>
                                <p style={{ fontFamily: 'monospace', fontSize: '12px', color: '#aaa', margin: 0, wordBreak: 'break-all', lineHeight: 1.5, background: 'rgba(0,0,0,0.3)', padding: '10px 12px', borderRadius: '10px' }}>
                                    {booking.bookingUserAgent || 'No user agent captured.'}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* ─── MODAL FOOTER ─────────────────────────────────────────── */}
                <div
                    className="bdm-modal-footer"
                    style={{
                        padding: '14px 26px',
                        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                        background: 'rgba(12, 12, 18, 0.85)',
                        backdropFilter: 'blur(16px)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                        position: 'relative',
                        zIndex: 2,
                    }}
                >
                    {/* Mobile Thumb Action Row (Hidden on Desktop, Visible on Mobile) */}
                    <div
                        className="bdm-mobile-thumb-actions"
                        style={{
                            alignItems: 'center',
                            gap: '8px',
                            width: '100%',
                        }}
                    >
                        {customerPhone && (
                            <a
                                href={`tel:${customerPhone}`}
                                className="bdm-thumb-btn bdm-thumb-call"
                                title="Call customer"
                            >
                                <Phone size={14} /> <span>Call</span>
                            </a>
                        )}
                        {customerPhone && (
                            <button
                                type="button"
                                onClick={() => setSmsComposerOpen(true)}
                                className="bdm-thumb-btn bdm-thumb-sms"
                                title="Compose and send SMS via Pingram"
                            >
                                <MessageSquare size={14} /> <span>SMS</span>
                            </button>
                        )}
                        {customerEmail && (
                            <a
                                href={`mailto:${customerEmail}`}
                                className="bdm-thumb-btn bdm-thumb-email"
                                title="Send Email"
                            >
                                <Mail size={14} /> <span>Email</span>
                            </a>
                        )}
                        <button
                            type="button"
                            onClick={copyAllClientInfo}
                            className="bdm-thumb-btn bdm-thumb-copy"
                            title="Copy customer details"
                        >
                            {copiedField === 'all' ? <Check size={14} color="#00D478" /> : <Copy size={14} />}
                            <span>{copiedField === 'all' ? 'Copied' : 'Copy'}</span>
                        </button>
                    </div>

                    {/* Footer Nav & Close Row */}
                    <div
                        className="bdm-footer-bottom-row"
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            width: '100%',
                        }}
                    >
                        <a
                            href="/admin/bookings"
                            style={{
                                fontFamily: 'Poppins, sans-serif',
                                fontSize: '12px',
                                color: '#888',
                                textDecoration: 'none',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                transition: 'color 0.18s ease',
                            }}
                            onMouseOver={(e) => (e.currentTarget.style.color = '#FF2D78')}
                            onMouseOut={(e) => (e.currentTarget.style.color = '#888')}
                        >
                            Open Full Bookings Manager <ExternalLink size={12} />
                        </a>

                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                padding: '8px 20px',
                                borderRadius: '10px',
                                background: 'rgba(255, 255, 255, 0.08)',
                                border: '1px solid rgba(255, 255, 255, 0.14)',
                                color: '#fff',
                                fontFamily: 'Poppins, sans-serif',
                                fontSize: '12px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.18s ease',
                            }}
                            onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
                            onMouseOut={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>

            {smsComposerOpen && (
                <SmsComposerModal
                    isOpen={smsComposerOpen}
                    onClose={() => setSmsComposerOpen(false)}
                    recipientName={customerName}
                    recipientPhone={customerPhone || ''}
                    bookingId={booking.id}
                    serviceName={booking.service?.name}
                    appointmentDate={formatDate(booking.preferredDate)}
                    appointmentTime={format12h(booking.preferredTime)}
                    onSmsSent={(result) => {
                        if (result.booking) {
                            onBookingUpdated?.(result.booking);
                        }
                    }}
                />
            )}
        </div>
    );
}
