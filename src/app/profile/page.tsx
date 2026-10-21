'use client';

import { useSession, signOut } from 'next-auth/react';
import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
    Calendar, CreditCard, Pencil, Check, X, LogOut,
    Phone, Camera, Clock, ChevronRight, Sparkles, Star, Cake,
    User, Gift, ShieldCheck, Crown, HeartHandshake
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
    PENDING: '#FFB700',
    CONFIRMED: '#00D478',
    COMPLETED: '#ff8ab8',
    CANCELLED: '#dfd2d9',
};
const STATUS_BG: Record<string, string> = {
    PENDING: 'rgba(255, 183, 0, 0.14)',
    CONFIRMED: 'rgba(0, 212, 120, 0.14)',
    COMPLETED: 'rgba(255, 45, 120, 0.16)',
    CANCELLED: 'rgba(255, 255, 255, 0.08)',
};

const PROFILE_STYLES = `
    .profile-shell {
        width: min(980px, calc(100% - 2rem));
        margin: 0 auto;
        padding: 28px 0 120px;
    }
    .profile-editorial-surface {
        position: relative;
        overflow: hidden;
        border-radius: 28px;
        background:
            radial-gradient(circle at 18% 0%, rgba(255, 45, 120, 0.16), transparent 52%),
            radial-gradient(circle at 86% 12%, rgba(226, 194, 134, 0.12), transparent 48%),
            linear-gradient(155deg, rgba(32, 15, 26, 0.92), rgba(14, 7, 12, 0.96));
        border: 1px solid rgba(255, 255, 255, 0.1);
        box-shadow: 0 24px 64px rgba(0, 0, 0, 0.55);
    }
    .profile-editorial-surface::before {
        content: '';
        position: absolute;
        top: 0;
        left: 8%;
        right: 8%;
        height: 1px;
        background: linear-gradient(90deg, transparent, rgba(255, 138, 184, 0.7), rgba(226, 194, 134, 0.6), transparent);
        pointer-events: none;
    }
    .profile-card {
        position: relative;
        overflow: hidden;
        border-radius: 22px;
        background: linear-gradient(155deg, rgba(32, 15, 26, 0.92), rgba(14, 7, 12, 0.96));
        border: 1px solid rgba(255, 255, 255, 0.1);
        box-shadow: 0 16px 40px rgba(0, 0, 0, 0.42);
        transition: transform 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease;
    }
    .profile-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 10%;
        right: 10%;
        height: 1px;
        background: linear-gradient(90deg, transparent, rgba(255, 138, 184, 0.45), rgba(226, 194, 134, 0.35), transparent);
        pointer-events: none;
    }
    .profile-perk-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 16px;
    }
    .profile-quick-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 14px;
    }
    .profile-stats-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 12px;
    }
    .quick-link {
        text-decoration: none;
        transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
    }
    .quick-link:hover {
        transform: translateY(-2px);
        border-color: rgba(255, 138, 184, 0.42);
        box-shadow: 0 18px 44px rgba(255, 45, 120, 0.14);
    }
    .booking-card {
        transition: transform 0.2s ease, border-color 0.2s ease;
    }
    .booking-card:hover {
        border-color: rgba(255, 138, 184, 0.32);
    }
    @media (max-width: 820px) {
        .profile-perk-grid {
            grid-template-columns: minmax(0, 1fr);
        }
    }
    @media (max-width: 560px) {
        .profile-shell {
            width: calc(100% - 1.5rem);
            padding: 20px 0 110px;
        }
        .profile-quick-grid {
            grid-template-columns: minmax(0, 1fr);
        }
        .profile-stats-grid {
            gap: 8px;
        }
    }
`;

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
                if (!pd.user.dateOfBirth && !sessionStorage.getItem('bdModalDismissed')) {
                    setShowBirthdayModal(true);
                }
            }
            setBookings(bd.bookings || []);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, [session]);

    // Render immediate SSR-friendly 2.0 Dark Glam Editorial Guest / Sign-In Concierge Preview when !session
    if (!session) {
        return (
            <div style={{ minHeight: '100vh', position: 'relative', zIndex: 1 }}>
                <style>{PROFILE_STYLES}</style>
                <div className="profile-shell">
                    {/* Hero Concierge Card */}
                    <section className="profile-editorial-surface" style={{ padding: 'clamp(28px, 4.5vw, 48px)', marginBottom: '24px', textAlign: 'center' }}>
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '6px 14px',
                            borderRadius: '999px',
                            background: 'rgba(255, 45, 120, 0.14)',
                            border: '1px solid rgba(255, 138, 184, 0.35)',
                            marginBottom: '16px',
                        }}>
                            <Sparkles size={13} color="#ff8ab8" aria-hidden="true" />
                            <span style={{
                                fontFamily: 'Poppins, sans-serif',
                                color: '#ff8ab8',
                                fontWeight: 700,
                                fontSize: '11px',
                                textTransform: 'uppercase',
                                letterSpacing: '2.2px',
                            }}>
                                Glitz &amp; Glamour Studio · Member Concierge
                            </span>
                        </div>

                        <div style={{
                            width: '68px',
                            height: '68px',
                            borderRadius: '50%',
                            margin: '0 auto 16px',
                            background: 'linear-gradient(135deg, rgba(255, 45, 120, 0.22), rgba(226, 194, 134, 0.14))',
                            border: '1.5px solid rgba(255, 138, 184, 0.45)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 12px 32px rgba(255, 45, 120, 0.22)',
                        }}>
                            <User size={30} color="#ff8ab8" strokeWidth={1.8} aria-hidden="true" />
                        </div>

                        <h1 style={{
                            fontFamily: 'Poppins, sans-serif',
                            color: '#fff',
                            fontSize: 'clamp(26px, 4vw, 38px)',
                            fontWeight: 800,
                            letterSpacing: '-0.6px',
                            lineHeight: 1.15,
                            marginBottom: '12px',
                        }}>
                            My Glam Profile
                        </h1>

                        <p style={{
                            fontFamily: 'Poppins, sans-serif',
                            color: '#e2d6dc',
                            fontSize: 'clamp(14px, 1.8vw, 16px)',
                            maxWidth: '620px',
                            margin: '0 auto 28px',
                            lineHeight: 1.65,
                        }}>
                            Sign in to your personal studio suite to manage upcoming nail, hair, waxing, and facial appointments, track your Glamutta digital loyalty stamps, and unlock annual birthday rewards.
                        </p>

                        <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '12px',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}>
                            <Link
                                href="/sign-in?callbackUrl=/profile"
                                className="btn-primary"
                                style={{ padding: '14px 28px', fontSize: '15px' }}
                            >
                                Sign In to Your Studio Account
                                <ChevronRight size={16} aria-hidden="true" />
                            </Link>
                            <Link
                                href="/book"
                                className="btn-outline"
                                style={{
                                    padding: '13px 26px',
                                    fontSize: '15px',
                                    color: '#ff8ab8',
                                    borderColor: 'rgba(255, 138, 184, 0.5)',
                                    background: 'rgba(255, 45, 120, 0.06)',
                                }}
                            >
                                Book an Appointment
                            </Link>
                        </div>
                    </section>

                    {/* Editorial Preview of Member Perks */}
                    <section aria-label="Studio Member Benefits" style={{ marginBottom: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
                            <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '18px', color: '#fff', margin: 0 }}>
                                Inside Your Studio Account
                            </h2>
                            <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', color: '#E2C286', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>
                                Complimentary Membership
                            </span>
                        </div>

                        <div className="profile-perk-grid">
                            <div className="profile-card" style={{ padding: '24px 20px' }}>
                                <div style={{
                                    width: '44px', height: '44px', borderRadius: '14px',
                                    background: 'rgba(255, 45, 120, 0.16)',
                                    border: '1px solid rgba(255, 138, 184, 0.35)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    marginBottom: '14px',
                                }}>
                                    <Calendar size={20} color="#ff8ab8" aria-hidden="true" />
                                </div>
                                <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '16px', color: '#fff', marginBottom: '6px' }}>
                                    Appointment Management
                                </h3>
                                <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13.5px', color: '#e2d6dc', lineHeight: 1.6, marginBottom: '14px' }}>
                                    View your upcoming reservations, check live studio confirmation status, and review your complete beauty service archive.
                                </p>
                                <Link href="/my-bookings" style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                                    fontFamily: 'Poppins, sans-serif', fontSize: '13px', fontWeight: 600,
                                    color: '#ff8ab8', textDecoration: 'none',
                                }}>
                                    Preview My Bookings <ChevronRight size={14} aria-hidden="true" />
                                </Link>
                            </div>

                            <div className="profile-card" style={{ padding: '24px 20px' }}>
                                <div style={{
                                    width: '44px', height: '44px', borderRadius: '14px',
                                    background: 'rgba(226, 194, 134, 0.14)',
                                    border: '1px solid rgba(226, 194, 134, 0.35)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    marginBottom: '14px',
                                }}>
                                    <CreditCard size={20} color="#E2C286" aria-hidden="true" />
                                </div>
                                <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '16px', color: '#fff', marginBottom: '6px' }}>
                                    10-Stamp Digital Card
                                </h3>
                                <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13.5px', color: '#e2d6dc', lineHeight: 1.6, marginBottom: '14px' }}>
                                    Earn 1 digital stamp every completed studio visit. Collect 10 stamps to redeem a complimentary full nail set.
                                </p>
                                <Link href="/card" style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                                    fontFamily: 'Poppins, sans-serif', fontSize: '13px', fontWeight: 600,
                                    color: '#E2C286', textDecoration: 'none',
                                }}>
                                    Explore Loyalty Card <ChevronRight size={14} aria-hidden="true" />
                                </Link>
                            </div>

                            <div className="profile-card" style={{ padding: '24px 20px' }}>
                                <div style={{
                                    width: '44px', height: '44px', borderRadius: '14px',
                                    background: 'rgba(255, 45, 120, 0.16)',
                                    border: '1px solid rgba(255, 138, 184, 0.35)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    marginBottom: '14px',
                                }}>
                                    <Gift size={20} color="#ff8ab8" aria-hidden="true" />
                                </div>
                                <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '16px', color: '#fff', marginBottom: '6px' }}>
                                    Birthday Spin &amp; Insider Tier
                                </h3>
                                <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13.5px', color: '#e2d6dc', lineHeight: 1.6, marginBottom: '14px' }}>
                                    Save your birthdate for an annual prize wheel spin and unlock invitations to our gold Glam Insider referral program.
                                </p>
                                <Link href="/loyalty" style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                                    fontFamily: 'Poppins, sans-serif', fontSize: '13px', fontWeight: 600,
                                    color: '#ff8ab8', textDecoration: 'none',
                                }}>
                                    View Loyalty Perks <ChevronRight size={14} aria-hidden="true" />
                                </Link>
                            </div>
                        </div>
                    </section>

                    {/* Studio Quick Navigation */}
                    <section className="profile-card" style={{ padding: '22px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Crown size={20} color="#E2C286" aria-hidden="true" />
                            <div>
                                <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#fff', fontSize: '14px', margin: 0 }}>
                                    New to Glitz &amp; Glamour Studio?
                                </p>
                                <p style={{ fontFamily: 'Poppins, sans-serif', color: '#dfd2d9', fontSize: '13px', margin: 0 }}>
                                    Create your free account in 30 seconds or browse our full service menu.
                                </p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <Link href="/sign-in?tab=signup" style={{
                                fontFamily: 'Poppins, sans-serif', fontSize: '13px', fontWeight: 600,
                                color: '#ff8ab8', textDecoration: 'none', padding: '8px 16px',
                                borderRadius: '999px', border: '1px solid rgba(255, 138, 184, 0.35)',
                                background: 'rgba(255, 45, 120, 0.1)',
                            }}>
                                Create Free Account
                            </Link>
                            <Link href="/services" style={{
                                fontFamily: 'Poppins, sans-serif', fontSize: '13px', fontWeight: 600,
                                color: '#f4eef1', textDecoration: 'none', padding: '8px 16px',
                                borderRadius: '999px', border: '1px solid rgba(255, 255, 255, 0.16)',
                                background: 'rgba(255, 255, 255, 0.05)',
                            }}>
                                Browse Services
                            </Link>
                        </div>
                    </section>
                </div>
            </div>
        );
    }

    const upcoming = bookings.filter(b => b.status === 'PENDING' || b.status === 'CONFIRMED');
    const past = bookings.filter(b => b.status === 'COMPLETED' || b.status === 'CANCELLED');
    const displayName = profile?.name || session.user?.name || 'Glam Member';
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
        <div style={{ minHeight: '100vh', position: 'relative', zIndex: 1 }}>
            <style>{PROFILE_STYLES}</style>
            <BirthdayModal
                isOpen={showBirthdayModal}
                userName={displayName}
                onSave={handleSaveBirthday}
                onClose={dismissBirthdayModal}
            />

            <div className="profile-shell" style={{ maxWidth: '680px' }}>
                {isUnverified && <UnverifiedBanner />}

                {/* ── Hero Header Card ── */}
                <section className="profile-editorial-surface" style={{
                    padding: '36px 24px 28px',
                    textAlign: 'center',
                    marginBottom: '22px',
                }}>
                    {/* Avatar */}
                    <div style={{ position: 'relative', display: 'inline-block', marginBottom: '14px' }}>
                        <div style={{
                            width: '92px', height: '92px', borderRadius: '50%',
                            border: '3px solid rgba(255, 138, 184, 0.55)',
                            boxShadow: '0 0 0 6px rgba(255, 45, 120, 0.1), 0 8px 32px rgba(0, 0, 0, 0.45)',
                            overflow: 'hidden', background: 'linear-gradient(135deg, #FF2D78, #7928CA)',
                            position: 'relative',
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
                        <button
                            type="button"
                            aria-label="Upload profile photo"
                            onClick={() => avatarInput.current?.click()}
                            disabled={uploadingAvatar}
                            style={{
                                position: 'absolute', bottom: 0, right: 0,
                                width: '32px', height: '32px', borderRadius: '50%',
                                background: 'linear-gradient(135deg, #FF2D78, #CC1E5A)',
                                border: '2px solid #0e070c', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
                            }}
                        >
                            <Camera size={14} color="#fff" strokeWidth={2.5} aria-hidden="true" />
                        </button>
                        <input
                            ref={avatarInput}
                            type="file"
                            aria-label="Upload profile photo file"
                            accept="image/*,.heic,.heif"
                            onChange={handleAvatarUpload}
                            style={{ display: 'none' }}
                        />
                    </div>

                    {/* Name & Profile Details */}
                    {editing ? (
                        <div style={{ maxWidth: '340px', margin: '0 auto', display: 'grid', gap: '10px' }}>
                            <input
                                aria-label="Display name"
                                value={editName}
                                onChange={e => setEditName(e.target.value)}
                                placeholder="Display name"
                                style={{
                                    background: 'rgba(255,255,255,0.06)',
                                    border: '1px solid rgba(255, 138, 184, 0.35)',
                                    borderRadius: '12px', padding: '11px 14px',
                                    fontFamily: 'Poppins, sans-serif', fontSize: '14px',
                                    color: '#fff', outline: 'none', textAlign: 'center',
                                }}
                            />
                            <input
                                aria-label="Phone number"
                                value={editPhone}
                                onChange={e => setEditPhone(e.target.value)}
                                placeholder="Phone number (optional)"
                                style={{
                                    background: 'rgba(255,255,255,0.06)',
                                    border: '1px solid rgba(255, 138, 184, 0.35)',
                                    borderRadius: '12px', padding: '11px 14px',
                                    fontFamily: 'Poppins, sans-serif', fontSize: '14px',
                                    color: '#fff', outline: 'none', textAlign: 'center',
                                }}
                            />
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="date"
                                    aria-label="Date of birth"
                                    value={editDob}
                                    onChange={e => setEditDob(e.target.value)}
                                    max={new Date(Date.now() - 13 * 365.25 * 24 * 3600 * 1000).toISOString().split('T')[0]}
                                    style={{
                                        background: 'rgba(255,255,255,0.06)',
                                        border: '1px solid rgba(255, 138, 184, 0.35)',
                                        borderRadius: '12px', padding: '11px 14px',
                                        fontFamily: 'Poppins, sans-serif', fontSize: '14px',
                                        color: '#fff', outline: 'none', textAlign: 'center',
                                        width: '100%', colorScheme: 'dark', boxSizing: 'border-box',
                                    }}
                                />
                                {!editDob && (
                                    <span style={{
                                        position: 'absolute', left: '50%', top: '50%',
                                        transform: 'translate(-50%,-50%)', pointerEvents: 'none',
                                        fontFamily: 'Poppins, sans-serif', fontSize: '13px', color: '#dfd2d9',
                                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                                    }}>
                                        <Cake size={13} color="#ff8ab8" aria-hidden="true" /> Date of birth (optional)
                                    </span>
                                )}
                            </div>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '4px' }}>
                                <button
                                    type="button"
                                    className="btn-primary"
                                    style={{ fontSize: '13px', padding: '9px 22px', display: 'flex', alignItems: 'center', gap: '5px' }}
                                    disabled={saving}
                                    onClick={handleSaveProfile}
                                >
                                    <Check size={14} aria-hidden="true" /> {saving ? 'Saving…' : 'Save'}
                                </button>
                                <button
                                    type="button"
                                    className="btn-outline"
                                    style={{ fontSize: '13px', padding: '8px 18px', display: 'flex', alignItems: 'center', gap: '5px', color: '#ff8ab8', borderColor: 'rgba(255, 138, 184, 0.45)' }}
                                    onClick={() => setEditing(false)}
                                >
                                    <X size={14} aria-hidden="true" /> Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '4px' }}>
                                <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: '24px', color: '#fff', margin: 0 }}>
                                    {displayName}
                                </h1>
                                <button
                                    type="button"
                                    aria-label="Edit profile"
                                    onClick={() => {
                                        setEditName(displayName);
                                        setEditPhone(profile?.phone || '');
                                        setEditDob(profile?.dateOfBirth ? profile.dateOfBirth.split('T')[0] : '');
                                        setEditing(true);
                                    }}
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.08)',
                                        border: '1px solid rgba(255, 255, 255, 0.16)',
                                        borderRadius: '8px', padding: '6px 8px',
                                        cursor: 'pointer', display: 'flex', alignItems: 'center',
                                    }}
                                >
                                    <Pencil size={13} color="#f4eef1" aria-hidden="true" />
                                </button>
                            </div>
                            <p style={{ fontFamily: 'Poppins, sans-serif', color: '#e2d6dc', fontSize: '13.5px', marginBottom: '4px' }}>
                                {profile?.email || session.user?.email}
                            </p>
                            {profile?.phone && (
                                <p style={{ fontFamily: 'Poppins, sans-serif', color: '#dfd2d9', fontSize: '12.5px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                                    <Phone size={12} color="#ff8ab8" aria-hidden="true" /> {profile.phone}
                                </p>
                            )}
                            {profile?.dateOfBirth && (
                                <p style={{ fontFamily: 'Poppins, sans-serif', color: '#dfd2d9', fontSize: '12.5px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', marginTop: '3px' }}>
                                    <Cake size={12} color="#E2C286" aria-hidden="true" /> {new Date(profile.dateOfBirth).toLocaleDateString(undefined, { day: 'numeric', month: 'long' })}
                                </p>
                            )}
                            {!profile?.dateOfBirth && (
                                <p style={{ fontFamily: 'Poppins, sans-serif', color: '#ff8ab8', fontSize: '12px', marginTop: '6px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                                    <Cake size={13} color="#ff8ab8" aria-hidden="true" /> Add your birthday to earn a free annual spin
                                </p>
                            )}
                        </>
                    )}

                    {/* Sign out */}
                    <div style={{ marginTop: '18px' }}>
                        <button
                            type="button"
                            onClick={() => signOut({ callbackUrl: '/' })}
                            style={{
                                background: 'rgba(255, 255, 255, 0.06)',
                                border: '1px solid rgba(255, 255, 255, 0.14)',
                                borderRadius: '50px', padding: '8px 18px',
                                cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px',
                                fontFamily: 'Poppins, sans-serif', color: '#e2d6dc', fontSize: '12.5px', fontWeight: 500,
                            }}
                        >
                            <LogOut size={13} color="#ff8ab8" aria-hidden="true" /> Sign out
                        </button>
                    </div>
                </section>

                {/* ── Stats row ── */}
                <div className="profile-stats-grid" style={{ marginBottom: '20px' }}>
                    {[
                        { label: 'Visits', value: bookings.filter(b => b.status === 'COMPLETED').length, Icon: Sparkles, color: '#ff8ab8' },
                        { label: 'Upcoming', value: upcoming.length, Icon: Calendar, color: '#E2C286' },
                        { label: 'Member', value: `Since ${new Date().getFullYear()}`, Icon: Star, color: '#ff8ab8', small: true },
                    ].map(s => (
                        <div key={s.label} className="profile-card" style={{ padding: '16px 12px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '6px' }}>
                                <s.Icon size={18} color={s.color} aria-hidden="true" />
                            </div>
                            <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#fff', fontSize: s.small ? '13px' : '20px' }}>
                                {s.value}
                            </div>
                            <div style={{ fontFamily: 'Poppins, sans-serif', color: '#dfd2d9', fontSize: '11.5px', marginTop: '2px' }}>
                                {s.label}
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Quick links ── */}
                <div className="profile-quick-grid" style={{ marginBottom: '24px' }}>
                    <Link href="/book" className="profile-card quick-link" style={{ padding: '20px 18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255, 45, 120, 0.16)', border: '1px solid rgba(255, 138, 184, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Calendar size={18} color="#ff8ab8" strokeWidth={1.8} aria-hidden="true" />
                        </div>
                        <div>
                            <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#fff', fontSize: '14px', marginBottom: '2px' }}>Book Now</p>
                            <p style={{ fontFamily: 'Poppins, sans-serif', color: '#dfd2d9', fontSize: '12px' }}>Schedule a studio visit</p>
                        </div>
                    </Link>

                    <Link href="/card" className="profile-card quick-link" style={{ padding: '20px 18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(226, 194, 134, 0.15)', border: '1px solid rgba(226, 194, 134, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <CreditCard size={18} color="#E2C286" strokeWidth={1.8} aria-hidden="true" />
                        </div>
                        <div>
                            <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#fff', fontSize: '14px', marginBottom: '2px' }}>Loyalty Card</p>
                            <p style={{ fontFamily: 'Poppins, sans-serif', color: '#dfd2d9', fontSize: '12px' }}>Stamps &amp; rewards</p>
                        </div>
                    </Link>

                    <Link href="/my-bookings" className="profile-card quick-link" style={{ padding: '20px 18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255, 45, 120, 0.16)', border: '1px solid rgba(255, 138, 184, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Clock size={18} color="#ff8ab8" strokeWidth={1.8} aria-hidden="true" />
                        </div>
                        <div>
                            <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#fff', fontSize: '14px', marginBottom: '2px' }}>My Bookings</p>
                            <p style={{ fontFamily: 'Poppins, sans-serif', color: '#dfd2d9', fontSize: '12px' }}>View all appointments</p>
                        </div>
                    </Link>

                    <Link href="/profile/health" className="profile-card quick-link" style={{ padding: '20px 18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(226, 194, 134, 0.15)', border: '1px solid rgba(226, 194, 134, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ShieldCheck size={18} color="#E2C286" strokeWidth={1.8} aria-hidden="true" />
                        </div>
                        <div>
                            <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#fff', fontSize: '14px', marginBottom: '2px' }}>Health Intake</p>
                            <p style={{ fontFamily: 'Poppins, sans-serif', color: '#dfd2d9', fontSize: '12px' }}>Safety &amp; care profile</p>
                        </div>
                    </Link>
                </div>

                {/* ── Upcoming appointments ── */}
                {upcoming.length > 0 && (
                    <section style={{ marginBottom: '22px' }}>
                        <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#fff', fontSize: '15px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Sparkles size={15} color="#ff8ab8" aria-hidden="true" /> Upcoming Appointments
                        </h2>
                        <div style={{ display: 'grid', gap: '10px' }}>
                            {upcoming.map(b => (
                                <div key={b.id} className="profile-card booking-card" style={{ padding: '16px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, color: '#fff', fontSize: '14px', marginBottom: '4px' }}>
                                            {b.service.name}
                                        </p>
                                        <p style={{ fontFamily: 'Poppins, sans-serif', color: '#dfd2d9', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <Clock size={12} color="#ff8ab8" aria-hidden="true" /> {b.preferredDate} · {b.preferredTime}
                                        </p>
                                    </div>
                                    <span style={{
                                        background: STATUS_BG[b.status] || 'rgba(255,255,255,0.08)',
                                        border: `1px solid ${(STATUS_COLOR[b.status] || '#dfd2d9')}50`,
                                        color: STATUS_COLOR[b.status] || '#dfd2d9',
                                        borderRadius: '50px', padding: '4px 12px',
                                        fontFamily: 'Poppins, sans-serif', fontSize: '11px',
                                        fontWeight: 600, textTransform: 'uppercase',
                                        whiteSpace: 'nowrap', flexShrink: 0,
                                    }}>
                                        {b.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* ── Past bookings ── */}
                {past.length > 0 && (
                    <section style={{ marginBottom: '22px' }}>
                        <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#fff', fontSize: '15px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Star size={15} color="#E2C286" aria-hidden="true" /> Service History
                        </h2>
                        <div style={{ display: 'grid', gap: '8px' }}>
                            {past.slice(0, 5).map(b => (
                                <div key={b.id} className="profile-card booking-card" style={{ padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                                    <div>
                                        <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, color: '#f4eef1', fontSize: '13.5px', marginBottom: '2px' }}>
                                            {b.service.name}
                                        </p>
                                        <p style={{ fontFamily: 'Poppins, sans-serif', color: '#dfd2d9', fontSize: '12px' }}>
                                            {b.preferredDate}
                                        </p>
                                    </div>
                                    <span style={{
                                        color: STATUS_COLOR[b.status] || '#dfd2d9',
                                        fontFamily: 'Poppins, sans-serif', fontSize: '11px',
                                        fontWeight: 600, textTransform: 'uppercase',
                                    }}>
                                        {b.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* ── Empty state ── */}
                {bookings.length === 0 && !loading && (
                    <div className="profile-editorial-surface" style={{ padding: '36px 24px', textAlign: 'center' }}>
                        <div style={{
                            width: '52px', height: '52px', borderRadius: '50%',
                            margin: '0 auto 12px',
                            background: 'rgba(255, 45, 120, 0.16)',
                            border: '1px solid rgba(255, 138, 184, 0.35)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <HeartHandshake size={24} color="#ff8ab8" aria-hidden="true" />
                        </div>
                        <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#fff', fontSize: '17px', marginBottom: '6px' }}>
                            Welcome, {firstName}!
                        </p>
                        <p style={{ fontFamily: 'Poppins, sans-serif', color: '#e2d6dc', fontSize: '13.5px', marginBottom: '20px', maxWidth: '420px', marginInline: 'auto' }}>
                            Ready for your first studio visit? Book now and start earning digital stamps toward a complimentary nail set.
                        </p>
                        <Link href="/book" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '14px' }}>
                            Book First Visit <ChevronRight size={15} aria-hidden="true" />
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
