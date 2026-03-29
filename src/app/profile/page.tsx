'use client';

import { useSession, signOut } from 'next-auth/react';
import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
    Calendar, CreditCard, Pencil, Check, X, LogOut,
    Phone, Mail, Camera, Clock, ChevronRight, Sparkles, Star, Cake
} from 'lucide-react';
import UnverifiedBanner from '@/components/UnverifiedBanner';
import BirthdayModal from '@/components/BirthdayModal';

type Booking = {
    id: string; preferredDate: string; preferredTime: string;
    status: string; createdAt: string;
    service: { name: string; priceLabel: string };
};
type UserProfile = {
    id: string; name: string; email: string; phone?: string | null; image?: string | null;
    dateOfBirth?: string | null;
};

const STATUS_COLOR: Record<string, string> = {
    PENDING: '#FFB700', CONFIRMED: '#00D478', COMPLETED: '#FF2D78', CANCELLED: '#555',
};
const STATUS_BG: Record<string, string> = {
    PENDING: 'rgba(255,183,0,0.1)', CONFIRMED: 'rgba(0,212,120,0.1)', COMPLETED: 'rgba(255,45,120,0.1)', CANCELLED: 'rgba(255,255,255,0.05)',
};

export default function ProfilePage() {
    const { data: session, status, update: updateSession } = useSession();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [editName, setEditName] = useState('');
    const [editPhone, setEditPhone] = useState('');
    const [editDob, setEditDob] = useState('');
    const [saving, setSaving] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);

    // Birthday Modal
    const [showBirthdayModal, setShowBirthdayModal] = useState(false);

    const avatarInput = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!session) return;
        Promise.all([
            fetch('/api/profile').then(r => r.json()),
            fetch('/api/bookings').then(r => r.json()).catch(() => ({ bookings: [] })),
        ]).then(([pd, bd]) => {
            if (pd.user) {
                setProfile(pd.user);
                // Check if they need a birthday added immediately (only once per session)
                if (!pd.user.dateOfBirth && !sessionStorage.getItem('bdModalDismissed')) {
                    setShowBirthdayModal(true);
                }
            }
            setBookings(bd.bookings || []);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, [session]);

    if (status === 'loading' || (status === 'authenticated' && loading)) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1, position: 'relative' }}>
            <div className="skeleton" style={{ width: '340px', height: '200px', borderRadius: '24px' }} />
        </div>
    );

    if (!session) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', zIndex: 1, position: 'relative' }}>
            <div className="glass" style={{ maxWidth: '360px', width: '100%', padding: '40px', textAlign: 'center' }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>👤</div>
                <h2 style={{ fontFamily: 'Poppins, sans-serif', color: '#fff', fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>Your Profile</h2>
                <p style={{ fontFamily: 'Poppins, sans-serif', color: '#666', fontSize: '13px', marginBottom: '20px' }}>Sign in to view your appointments, loyalty card & more.</p>
                <Link href="/sign-in" className="btn-primary" style={{ display: 'block', textAlign: 'center' }}>Sign In</Link>
            </div>
        </div>
    );

    const upcoming = bookings.filter(b => b.status === 'PENDING' || b.status === 'CONFIRMED');
    const past = bookings.filter(b => b.status === 'COMPLETED' || b.status === 'CANCELLED');
    const displayName = profile?.name || session.user?.name || '';
    const firstName = displayName.split(' ')[0];
    const avatarUrl = profile?.image || session.user?.image;
    const isUnverified = session && !(session.user as { emailVerified?: string | null })?.emailVerified;

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
            const r = await fetch('/api/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: editName, phone: editPhone, dateOfBirth: editDob || undefined }) });
            const d = await r.json();
            if (d.user) { setProfile(d.user); await updateSession({ name: d.user.name }); }
            setEditing(false);
        } catch { alert('Save failed. Try again.'); }
        finally { setSaving(false); }
    }

    async function handleSaveBirthday(dob: string) {
        const r = await fetch('/api/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ dateOfBirth: dob }) });
        const d = await r.json();
        if (d.user) setProfile(d.user);
        setShowBirthdayModal(false);
        sessionStorage.setItem('bdModalDismissed', 'true');
    }

    const dismissBirthdayModal = () => {
        setShowBirthdayModal(false);
        sessionStorage.setItem('bdModalDismissed', 'true');
    };

    return (
        <div style={{ minHeight: '100vh', paddingBottom: '120px', position: 'relative', zIndex: 1 }}>
            <BirthdayModal
                isOpen={showBirthdayModal}
                userName={displayName}
                onSave={handleSaveBirthday}
                onClose={dismissBirthdayModal}
            />
            <style>{`
                @keyframes avatarPop { 0%{transform:scale(0.8);opacity:0} 100%{transform:scale(1);opacity:1} }
                @keyframes heroSlide { 0%{opacity:0;transform:translateY(-12px)} 100%{opacity:1;transform:translateY(0)} }
                .profile-hero { animation: heroSlide 0.4s ease both; }
                .booking-card { transition: all 0.2s; }
                .booking-card:active { transform: scale(0.98); }
                .quick-link { transition: all 0.2s; text-decoration:none; }
                .quick-link:active { transform: scale(0.96); }
            `}</style>

            {isUnverified && <UnverifiedBanner />}

            {/* ── Hero Header ── */}
            <div className="profile-hero" style={{
                background: 'linear-gradient(180deg, rgba(255,45,120,0.12) 0%, transparent 100%)',
                padding: '40px 20px 28px',
                textAlign: 'center',
                position: 'relative',
            }}>
                {/* Avatar */}
                <div style={{ position: 'relative', display: 'inline-block', marginBottom: '14px' }}>
                    <div style={{
                        width: '90px', height: '90px', borderRadius: '50%',
                        border: '3px solid rgba(255,45,120,0.5)',
                        boxShadow: '0 0 0 6px rgba(255,45,120,0.08), 0 8px 32px rgba(0,0,0,0.4)',
                        overflow: 'hidden', background: 'linear-gradient(135deg, #FF2D78, #7928CA)',
                        position: 'relative',
                        animation: 'avatarPop 0.5s cubic-bezier(0.34,1.56,0.64,1) both',
                    }}>
                        {avatarUrl ? (
                            <Image src={avatarUrl} alt={displayName} fill style={{ objectFit: 'cover' }} referrerPolicy="no-referrer" />
                        ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Poppins, sans-serif', fontWeight: 800, color: '#fff', fontSize: '34px' }}>
                                {displayName.charAt(0)}
                            </div>
                        )}
                    </div>
                    {/* Camera button */}
                    <button onClick={() => avatarInput.current?.click()} disabled={uploadingAvatar}
                        style={{ position: 'absolute', bottom: 2, right: 2, width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg,#FF2D78,#CC1E5A)', border: '2px solid #0A0A0A', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
                        <Camera size={13} color="#fff" strokeWidth={2.5} />
                    </button>
                    <input ref={avatarInput} type="file" accept="image/*,.heic,.heif" onChange={handleAvatarUpload} style={{ display: 'none' }} />
                </div>

                {/* Name */}
                {editing ? (
                    <div style={{ maxWidth: '320px', margin: '0 auto', display: 'grid', gap: '10px' }}>
                        <input value={editName} onChange={e => setEditName(e.target.value)} placeholder="Display name"
                            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,45,120,0.3)', borderRadius: '12px', padding: '10px 14px', fontFamily: 'Poppins, sans-serif', fontSize: '14px', color: '#fff', outline: 'none', textAlign: 'center' }} />
                        <input value={editPhone} onChange={e => setEditPhone(e.target.value)} placeholder="Phone number (optional)"
                            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,45,120,0.3)', borderRadius: '12px', padding: '10px 14px', fontFamily: 'Poppins, sans-serif', fontSize: '14px', color: '#fff', outline: 'none', textAlign: 'center' }} />
                        <div style={{ position: 'relative' }}>
                            <input type="date" value={editDob} onChange={e => setEditDob(e.target.value)}
                                max={new Date(Date.now() - 13 * 365.25 * 24 * 3600 * 1000).toISOString().split('T')[0]}
                                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,45,120,0.3)', borderRadius: '12px', padding: '10px 14px', fontFamily: 'Poppins, sans-serif', fontSize: '14px', color: '#fff', outline: 'none', textAlign: 'center', width: '100%', colorScheme: 'dark', boxSizing: 'border-box' }} />
                            {!editDob && <span style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none', fontFamily: 'Poppins, sans-serif', fontSize: '13px', color: '#555' }}>🎂 Date of birth (optional)</span>}
                        </div>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <button className="btn-primary" style={{ fontSize: '13px', padding: '8px 20px', display: 'flex', alignItems: 'center', gap: '5px' }} disabled={saving} onClick={handleSaveProfile}>
                                <Check size={13} /> {saving ? 'Saving…' : 'Save'}
                            </button>
                            <button className="btn-outline" style={{ fontSize: '13px', padding: '7px 16px', display: 'flex', alignItems: 'center', gap: '5px' }} onClick={() => setEditing(false)}>
                                <X size={13} /> Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '4px' }}>
                            <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: '22px', color: '#fff', margin: 0 }}>{displayName}</h1>
                            <button onClick={() => { setEditName(displayName); setEditPhone(profile?.phone || ''); setEditDob(profile?.dateOfBirth ? profile.dateOfBirth.split('T')[0] : ''); setEditing(true); }}
                                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '5px 7px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                                <Pencil size={12} color="#aaa" />
                            </button>
                        </div>
                        <p style={{ fontFamily: 'Poppins, sans-serif', color: '#888', fontSize: '13px', marginBottom: '4px' }}>{profile?.email || session.user?.email}</p>
                        {profile?.phone && <p style={{ fontFamily: 'Poppins, sans-serif', color: '#555', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}><Phone size={11} color="#aaa" /> {profile.phone}</p>}
                        {profile?.dateOfBirth && (
                            <p style={{ fontFamily: 'Poppins, sans-serif', color: '#555', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginTop: '2px' }}>
                                <Cake size={11} color="#aaa" /> {new Date(profile.dateOfBirth).toLocaleDateString(undefined, { day: 'numeric', month: 'long' })}
                            </p>
                        )}
                        {!profile?.dateOfBirth && (
                            <p style={{ fontFamily: 'Poppins, sans-serif', color: '#FF2D78', fontSize: '11px', marginTop: '4px', opacity: 0.8 }}>
                                🎂 Add your birthday to earn a free annual spin
                            </p>
                        )}
                    </>
                )}

                {/* Sign out */}
                <button onClick={() => signOut({ callbackUrl: '/' })}
                    style={{ marginTop: '16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '50px', padding: '8px 18px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: 'Poppins, sans-serif', color: '#888', fontSize: '12px' }}>
                    <LogOut size={12} /> Sign out
                </button>
            </div>

            <div style={{ padding: '0 16px', maxWidth: '600px', margin: '0 auto' }}>

                {/* ── Stats row ── */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px', marginBottom: '20px' }}>
                    {[
                        { label: 'Visits', value: bookings.filter(b => b.status === 'COMPLETED').length, icon: '💅' },
                        { label: 'Upcoming', value: upcoming.length, icon: '📅' },
                        { label: 'Member', value: `Since ${new Date(session.user?.email ? Date.now() : Date.now()).getFullYear()}`, icon: '⭐', small: true },
                    ].map(s => (
                        <div key={s.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '14px 10px', textAlign: 'center' }}>
                            <div style={{ fontSize: '20px', marginBottom: '4px' }}>{s.icon}</div>
                            <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#fff', fontSize: s.small ? '11px' : '20px' }}>{s.value}</div>
                            <div style={{ fontFamily: 'Poppins, sans-serif', color: '#555', fontSize: '11px', marginTop: '2px' }}>{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* ── Quick links ── */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '24px' }}>
                    <Link href="/book" className="quick-link" style={{
                        background: 'linear-gradient(135deg, rgba(255,45,120,0.12) 0%, rgba(255,45,120,0.04) 100%)',
                        border: '1px solid rgba(255,45,120,0.2)', borderRadius: '18px', padding: '20px 16px',
                        display: 'flex', flexDirection: 'column', gap: '10px',
                    }}>
                        <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'rgba(255,45,120,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Calendar size={18} color="#FF2D78" strokeWidth={1.75} />
                        </div>
                        <div>
                            <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#fff', fontSize: '13px', marginBottom: '2px' }}>Book Now</p>
                            <p style={{ fontFamily: 'Poppins, sans-serif', color: '#888', fontSize: '11px' }}>Schedule a visit</p>
                        </div>
                    </Link>
                    <Link href="/card" className="quick-link" style={{
                        background: 'linear-gradient(135deg, rgba(121,40,202,0.15) 0%, rgba(121,40,202,0.04) 100%)',
                        border: '1px solid rgba(121,40,202,0.2)', borderRadius: '18px', padding: '20px 16px',
                        display: 'flex', flexDirection: 'column', gap: '10px',
                    }}>
                        <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'rgba(121,40,202,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <CreditCard size={18} color="#9F67FF" strokeWidth={1.75} />
                        </div>
                        <div>
                            <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#fff', fontSize: '13px', marginBottom: '2px' }}>Loyalty Card</p>
                            <p style={{ fontFamily: 'Poppins, sans-serif', color: '#888', fontSize: '11px' }}>Stamps &amp; rewards</p>
                        </div>
                    </Link>
                </div>

                {/* ── Upcoming appointments ── */}
                {upcoming.length > 0 && (
                    <div style={{ marginBottom: '20px' }}>
                        <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#fff', fontSize: '14px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Sparkles size={14} color="#FF2D78" /> Upcoming
                        </h2>
                        <div style={{ display: 'grid', gap: '8px' }}>
                            {upcoming.map(b => (
                                <div key={b.id} className="booking-card" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, color: '#e0e0e0', fontSize: '14px', marginBottom: '4px' }}>{b.service.name}</p>
                                        <p style={{ fontFamily: 'Poppins, sans-serif', color: '#888', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Clock size={11} color="#aaa" /> {b.preferredDate} · {b.preferredTime}
                                        </p>
                                    </div>
                                    <span style={{ background: STATUS_BG[b.status], border: `1px solid ${STATUS_COLOR[b.status]}40`, color: STATUS_COLOR[b.status], borderRadius: '50px', padding: '4px 12px', fontFamily: 'Poppins, sans-serif', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', whiteSpace: 'nowrap', flexShrink: 0 }}>
                                        {b.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Past bookings ── */}
                {past.length > 0 && (
                    <div style={{ marginBottom: '20px' }}>
                        <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#fff', fontSize: '14px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Star size={14} color="#888" /> History
                        </h2>
                        <div style={{ display: 'grid', gap: '6px' }}>
                            {past.slice(0, 5).map(b => (
                                <div key={b.id} className="booking-card" style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '14px', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', opacity: 0.7 }}>
                                    <div>
                                        <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 400, color: '#bbb', fontSize: '13px', marginBottom: '2px' }}>{b.service.name}</p>
                                        <p style={{ fontFamily: 'Poppins, sans-serif', color: '#555', fontSize: '12px' }}>{b.preferredDate}</p>
                                    </div>
                                    <span style={{ color: STATUS_COLOR[b.status], fontFamily: 'Poppins, sans-serif', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>{b.status}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Empty state ── */}
                {bookings.length === 0 && !loading && (
                    <div style={{ background: 'linear-gradient(135deg, rgba(255,45,120,0.06) 0%, rgba(121,40,202,0.06) 100%)', border: '1px solid rgba(255,45,120,0.12)', borderRadius: '20px', padding: '36px 24px', textAlign: 'center' }}>
                        <div style={{ fontSize: '36px', marginBottom: '12px' }}>💅</div>
                        <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#fff', fontSize: '16px', marginBottom: '6px' }}>
                            Welcome, {firstName}!
                        </p>
                        <p style={{ fontFamily: 'Poppins, sans-serif', color: '#666', fontSize: '13px', marginBottom: '20px' }}>
                            Ready for your first visit? Book now and start earning stamps.
                        </p>
                        <Link href="/book" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '14px' }}>
                            Book First Visit <ChevronRight size={15} />
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
