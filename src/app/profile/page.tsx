'use client';

import { useSession, signOut } from 'next-auth/react';
import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
    Calendar, CreditCard, Pencil, Check, X, LogOut,
    Phone, Mail, Camera, Clock, ChevronRight
} from 'lucide-react';

type Booking = {
    id: string; preferredDate: string; preferredTime: string;
    status: string; createdAt: string;
    service: { name: string; priceLabel: string };
};

type UserProfile = {
    id: string; name: string; email: string; phone?: string | null; image?: string | null;
};

const STATUS_COLOR: Record<string, string> = {
    PENDING: '#FFB700', CONFIRMED: '#00D478', COMPLETED: '#FF2D78', CANCELLED: '#aaa',
};

export default function ProfilePage() {
    const { data: session, status, update: updateSession } = useSession();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [editName, setEditName] = useState('');
    const [editPhone, setEditPhone] = useState('');
    const [saving, setSaving] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const avatarInput = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!session) return;
        Promise.all([
            fetch('/api/profile').then(r => r.json()),
            fetch('/api/bookings').then(r => r.json()).catch(() => ({ bookings: [] })),
        ]).then(([pd, bd]) => {
            if (pd.user) setProfile(pd.user);
            setBookings(bd.bookings || []);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, [session]);

    if (status === 'loading' || loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1, position: 'relative' }}>
            <div className="skeleton" style={{ width: '340px', height: '140px', borderRadius: '20px' }} />
        </div>
    );

    if (!session) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', zIndex: 1, position: 'relative' }}>
            <div className="glass" style={{ maxWidth: '360px', width: '100%', padding: '40px', textAlign: 'center' }}>
                <h2 style={{ fontFamily: 'Poppins, sans-serif', color: '#fff', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>Sign in to view profile</h2>
                <Link href="/sign-in" className="btn-primary" style={{ display: 'block', textAlign: 'center' }}>Sign In</Link>
            </div>
        </div>
    );

    const upcoming = bookings.filter(b => b.status === 'PENDING' || b.status === 'CONFIRMED');
    const past = bookings.filter(b => b.status === 'COMPLETED' || b.status === 'CANCELLED');
    const displayName = profile?.name || session.user?.name || '';
    const avatarUrl = profile?.image || session.user?.image;

    async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingAvatar(true);
        try {
            const fd = new FormData();
            fd.append('file', file);
            const r = await fetch('/api/upload', { method: 'POST', body: fd });
            if (!r.ok) throw new Error('Upload failed');
            const { url } = await r.json();
            await fetch('/api/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ image: url }) });
            setProfile(p => p ? { ...p, image: url } : p);
        } catch { alert('Avatar upload failed'); }
        finally { setUploadingAvatar(false); }
    }

    async function handleSaveProfile() {
        setSaving(true);
        try {
            const r = await fetch('/api/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: editName, phone: editPhone }),
            });
            const d = await r.json();
            if (d.user) {
                setProfile(d.user);
                await updateSession({ name: d.user.name }); // Update NextAuth session
            }
            setEditing(false);
        } catch { alert('Save failed. Try again.'); }
        finally { setSaving(false); }
    }

    return (
        <div style={{ minHeight: '100vh', padding: '40px 20px 120px', maxWidth: '640px', margin: '0 auto', position: 'relative', zIndex: 1 }}>

            {/* ─── Profile card ─── */}
            <div className="glass" style={{ padding: '28px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '18px', flexWrap: 'wrap' }}>
                    {/* Avatar */}
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                        <div style={{ width: '68px', height: '68px', borderRadius: '50%', overflow: 'hidden', background: 'linear-gradient(135deg, #FF2D78, #7928CA)', position: 'relative', border: '2px solid rgba(255,45,120,0.3)' }}>
                            {avatarUrl ? (
                                <Image src={avatarUrl} alt={displayName} fill style={{ objectFit: 'cover' }} />
                            ) : (
                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#fff', fontSize: '26px' }}>
                                    {displayName.charAt(0)}
                                </div>
                            )}
                        </div>
                        {/* Camera overlay */}
                        <button
                            onClick={() => avatarInput.current?.click()}
                            disabled={uploadingAvatar}
                            style={{
                                position: 'absolute', bottom: 0, right: 0,
                                width: '24px', height: '24px', borderRadius: '50%',
                                background: '#FF2D78', border: 'none', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                            }}>
                            <Camera size={12} color="#fff" strokeWidth={2.5} />
                        </button>
                        <input ref={avatarInput} type="file" accept="image/*,.heic,.heif" onChange={handleAvatarUpload} style={{ display: 'none' }} />
                    </div>

                    {/* Name / email & Sign out block */}
                    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {editing ? (
                            <div style={{ display: 'grid', gap: '10px' }}>
                                <div>
                                    <label className="label" style={{ marginBottom: '4px' }}>Display Name</label>
                                    <input className="input" value={editName} onChange={e => setEditName(e.target.value)}
                                        style={{ fontFamily: 'Poppins, sans-serif', padding: '10px 14px', fontSize: '14px' }} />
                                </div>
                                <div>
                                    <label className="label" style={{ marginBottom: '4px' }}>Phone Number</label>
                                    <input className="input" value={editPhone} onChange={e => setEditPhone(e.target.value)}
                                        placeholder="+1 (760) 000-0000"
                                        style={{ fontFamily: 'Poppins, sans-serif', padding: '10px 14px', fontSize: '14px' }} />
                                </div>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    <button className="btn-primary" style={{ fontSize: '13px', padding: '8px 18px', display: 'flex', alignItems: 'center', gap: '5px' }}
                                        disabled={saving} onClick={handleSaveProfile}>
                                        <Check size={14} /> {saving ? 'Saving...' : 'Save'}
                                    </button>
                                    <button className="btn-outline" style={{ fontSize: '13px', padding: '7px 16px', display: 'flex', alignItems: 'center', gap: '5px' }}
                                        onClick={() => setEditing(false)}>
                                        <X size={14} /> Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                        <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#fff', fontSize: '18px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{displayName}</p>
                                        <button onClick={() => { setEditName(displayName); setEditPhone(profile?.phone || ''); setEditing(true); }}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: '6px', flexShrink: 0 }}>
                                            <Pencil size={13} color="#bbb" />
                                        </button>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                                        <Mail size={12} color="#aaa" style={{ flexShrink: 0 }} />
                                        <p style={{ fontFamily: 'Poppins, sans-serif', color: '#bbb', fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{profile?.email || session.user?.email}</p>
                                    </div>
                                    {profile?.phone && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Phone size={12} color="#aaa" style={{ flexShrink: 0 }} />
                                            <p style={{ fontFamily: 'Poppins, sans-serif', color: '#bbb', fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{profile.phone}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Sign out */}
                                <button onClick={() => signOut({ callbackUrl: '/' })}
                                    style={{ background: 'none', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '8px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'Poppins, sans-serif', color: '#bbb', fontSize: '13px', flexShrink: 0 }}>
                                    <LogOut size={13} /> Sign out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ─── Quick links ─── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '24px' }}>
                <Link href="/book" style={{
                    textDecoration: 'none', background: 'rgba(255,45,120,0.05)', border: '1px solid rgba(255,45,120,0.15)',
                    borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px',
                    transition: 'border-color 0.2s',
                }}>
                    <Calendar size={20} color="#FF2D78" strokeWidth={1.75} />
                    <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, color: '#fff', fontSize: '13px' }}>Book Appointment</p>
                    <p style={{ fontFamily: 'Poppins, sans-serif', color: '#aaa', fontSize: '12px' }}>Schedule a visit</p>
                </Link>
                <Link href="/card" style={{
                    textDecoration: 'none', background: 'rgba(121,40,202,0.06)', border: '1px solid rgba(121,40,202,0.15)',
                    borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px',
                    transition: 'border-color 0.2s',
                }}>
                    <CreditCard size={20} color="#9F67FF" strokeWidth={1.75} />
                    <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, color: '#fff', fontSize: '13px' }}>Loyalty Card</p>
                    <p style={{ fontFamily: 'Poppins, sans-serif', color: '#aaa', fontSize: '12px' }}>Your stamps & rewards</p>
                </Link>
            </div>

            {/* ─── Upcoming ─── */}
            {upcoming.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                    <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, color: '#fff', fontSize: '14px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={14} color="#bbb" /> Upcoming Appointments
                    </h2>
                    <div style={{ display: 'grid', gap: '8px' }}>
                        {upcoming.map(b => (
                            <div key={b.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '16px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                                <div>
                                    <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 500, color: '#e0e0e0', fontSize: '14px' }}>{b.service.name}</p>
                                    <p style={{ fontFamily: 'Poppins, sans-serif', color: '#bbb', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px' }}>
                                        <Clock size={11} color="#aaa" /> {b.preferredDate} at {b.preferredTime}
                                    </p>
                                </div>
                                <span style={{ background: `${STATUS_COLOR[b.status]}18`, border: `1px solid ${STATUS_COLOR[b.status]}40`, color: STATUS_COLOR[b.status], borderRadius: '50px', padding: '4px 10px', fontFamily: 'Poppins, sans-serif', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                                    {b.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ─── Past ─── */}
            {past.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                    <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, color: '#fff', fontSize: '14px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={14} color="#bbb" /> Booking History
                    </h2>
                    <div style={{ display: 'grid', gap: '8px' }}>
                        {past.slice(0, 5).map(b => (
                            <div key={b.id} style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '12px', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', opacity: 0.75 }}>
                                <div>
                                    <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 400, color: '#bbb', fontSize: '13px' }}>{b.service.name}</p>
                                    <p style={{ fontFamily: 'Poppins, sans-serif', color: '#aaa', fontSize: '12px', marginTop: '2px' }}>{b.preferredDate}</p>
                                </div>
                                <span style={{ color: STATUS_COLOR[b.status], fontFamily: 'Poppins, sans-serif', fontSize: '11px', fontWeight: 600 }}>{b.status}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ─── Empty state ─── */}
            {bookings.length === 0 && !loading && (
                <div className="glass" style={{ padding: '32px', textAlign: 'center', borderRadius: '16px' }}>
                    <Calendar size={28} color="#aaa" strokeWidth={1.5} style={{ marginBottom: '12px' }} />
                    <p style={{ fontFamily: 'Poppins, sans-serif', color: '#bbb', fontSize: '14px', marginBottom: '16px' }}>
                        No appointments yet. Book your first visit!
                    </p>
                    <Link href="/book" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        Book Now <ChevronRight size={15} />
                    </Link>
                </div>
            )}
        </div>
    );
}
