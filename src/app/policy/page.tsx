'use client';

import Link from 'next/link';
import {
    ChevronLeft,
    ChevronRight,
    CalendarX,
    Clock,
    CreditCard,
    AlertTriangle,
    CheckCircle,
    MapPin,
    Sparkles,
    Scissors,
    Droplets,
    Eye,
    Sun,
    Camera,
    Ban,
    Users,
    FileText,
    ShieldCheck,
    Scale,
    Lock,
    HelpCircle,
    Calendar,
} from 'lucide-react';

const CROSS_POLICY_LINKS = [
    { href: '/policy', label: 'Studio Policies', active: true },
    { href: '/waiver', label: 'Liability Waiver', active: false },
    { href: '/terms', label: 'Terms & Conditions', active: false },
    { href: '/privacy', label: 'Privacy Policy', active: false },
    { href: '/image-policy', label: 'Image Release Policy', active: false },
];

export default function PolicyPage() {
    return (
        <main
            style={{
                minHeight: '100vh',
                padding: '32px 16px 120px',
                position: 'relative',
                zIndex: 1,
                overflowX: 'hidden',
            }}
        >
            <style>{`
                .policy-shell {
                    max-width: 960px;
                    margin: 0 auto;
                }
                .policy-pill-bar {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;
                    margin-bottom: 32px;
                }
                .policy-nav-pill {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 16px;
                    border-radius: 999px;
                    font-family: 'Poppins', sans-serif;
                    font-size: 13px;
                    font-weight: 600;
                    text-decoration: none;
                    transition: all 0.2s ease;
                    min-height: 42px;
                }
                .policy-card-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 16px;
                }
                .policy-clause-card {
                    background: linear-gradient(155deg, rgba(32, 15, 26, 0.92), rgba(14, 7, 12, 0.96));
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 20px;
                    padding: 24px;
                    display: flex;
                    gap: 16px;
                    position: relative;
                    overflow: hidden;
                    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35);
                    transition: transform 0.2s ease, border-color 0.2s ease;
                }
                .policy-clause-card:hover {
                    transform: translateY(-2px);
                    border-color: rgba(255, 138, 184, 0.32);
                }
                .policy-footer-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(175px, 1fr));
                    gap: 12px;
                    margin-bottom: 26px;
                }
                .policy-footer-link {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    padding: 13px 16px;
                    border-radius: 14px;
                    background: rgba(255, 255, 255, 0.04);
                    border: 1px solid rgba(255, 255, 255, 0.12);
                    color: #f4eef1;
                    font-family: 'Poppins', sans-serif;
                    font-size: 13.5px;
                    font-weight: 600;
                    text-decoration: none;
                    transition: all 0.2s ease;
                    min-height: 46px;
                }
                .policy-footer-link:hover {
                    background: rgba(255, 45, 120, 0.12);
                    border-color: rgba(255, 138, 184, 0.4);
                    color: #ffffff;
                }
                @media (max-width: 720px) {
                    .policy-card-grid {
                        grid-template-columns: 1fr;
                    }
                    .policy-hero-card {
                        padding: 26px 20px !important;
                    }
                }
            `}</style>

            {/* Ambient radial glows */}
            <div
                aria-hidden="true"
                style={{
                    position: 'absolute',
                    top: '8%',
                    left: '4%',
                    width: '300px',
                    height: '300px',
                    background: 'radial-gradient(circle, rgba(255, 45, 120, 0.08) 0%, transparent 70%)',
                    borderRadius: '50%',
                    pointerEvents: 'none',
                    zIndex: -1,
                }}
            />
            <div
                aria-hidden="true"
                style={{
                    position: 'absolute',
                    bottom: '18%',
                    right: '4%',
                    width: '360px',
                    height: '360px',
                    background: 'radial-gradient(circle, rgba(226, 194, 134, 0.06) 0%, transparent 70%)',
                    borderRadius: '50%',
                    pointerEvents: 'none',
                    zIndex: -1,
                }}
            />

            <div className="policy-shell">
                {/* Breadcrumb & Back Bar */}
                <nav
                    aria-label="Breadcrumb"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '12px',
                        marginBottom: '22px',
                    }}
                >
                    <Link
                        href="/"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            color: '#dfd2d9',
                            textDecoration: 'none',
                            fontSize: '13.5px',
                            fontWeight: 500,
                            fontFamily: 'Poppins, sans-serif',
                            padding: '8px 14px',
                            borderRadius: '999px',
                            background: 'rgba(255, 255, 255, 0.04)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                        }}
                    >
                        <ChevronLeft size={15} color="#ff8ab8" /> Back to Home
                    </Link>

                    <div
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontFamily: 'Poppins, sans-serif',
                            fontSize: '12.5px',
                            color: '#c8b8c2',
                        }}
                    >
                        <Link href="/" style={{ color: '#dfd2d9', textDecoration: 'none' }}>
                            Home
                        </Link>
                        <ChevronRight size={13} color="#c8b8c2" />
                        <span style={{ color: '#ff8ab8', fontWeight: 600 }}>Studio Policies</span>
                    </div>
                </nav>

                {/* Cross-Policy Navigation Pills */}
                <nav className="policy-pill-bar" aria-label="Legal and studio policy pages">
                    {CROSS_POLICY_LINKS.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            aria-current={item.active ? 'page' : undefined}
                            className="policy-nav-pill"
                            style={{
                                background: item.active
                                    ? 'linear-gradient(135deg, rgba(255, 45, 120, 0.28), rgba(226, 194, 134, 0.18))'
                                    : 'rgba(255, 255, 255, 0.04)',
                                border: item.active
                                    ? '1px solid rgba(255, 138, 184, 0.5)'
                                    : '1px solid rgba(255, 255, 255, 0.1)',
                                color: item.active ? '#ffffff' : '#dfd2d9',
                            }}
                        >
                            <ShieldCheck size={14} color={item.active ? '#ff8ab8' : '#c8b8c2'} />
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </nav>

                {/* Editorial Hero Card */}
                <header
                    className="policy-hero-card"
                    style={{
                        background: 'linear-gradient(155deg, rgba(32, 15, 26, 0.92), rgba(14, 7, 12, 0.96))',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '26px',
                        padding: '38px 36px',
                        marginBottom: '36px',
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.45)',
                    }}
                >
                    <div
                        aria-hidden="true"
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: '24px',
                            right: '24px',
                            height: '1px',
                            background:
                                'linear-gradient(90deg, transparent, rgba(255, 138, 184, 0.6), rgba(226, 194, 134, 0.5), transparent)',
                        }}
                    />

                    <div
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '6px 14px',
                            borderRadius: '999px',
                            background: 'rgba(255, 45, 120, 0.12)',
                            border: '1px solid rgba(255, 138, 184, 0.3)',
                            marginBottom: '16px',
                        }}
                    >
                        <ShieldCheck size={14} color="#ff8ab8" />
                        <span
                            style={{
                                fontFamily: 'Poppins, sans-serif',
                                fontSize: '11.5px',
                                fontWeight: 700,
                                letterSpacing: '1.2px',
                                textTransform: 'uppercase',
                                color: '#ff8ab8',
                            }}
                        >
                            Appointment Guidelines &amp; Studio Standards
                        </span>
                    </div>

                    <h1
                        style={{
                            fontFamily: 'Poppins, sans-serif',
                            fontWeight: 800,
                            fontSize: 'clamp(2.1rem, 4.5vw, 3.2rem)',
                            letterSpacing: '-0.8px',
                            marginBottom: '14px',
                            lineHeight: 1.12,
                            color: '#ffffff',
                        }}
                    >
                        Studio{' '}
                        <span
                            style={{
                                background: 'linear-gradient(135deg, #ff8ab8 0%, #E2C286 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}
                        >
                            Policies
                        </span>
                    </h1>

                    <p
                        style={{
                            fontFamily: 'Poppins, sans-serif',
                            color: '#e2d6dc',
                            fontSize: '15.5px',
                            lineHeight: 1.65,
                            maxWidth: '680px',
                            margin: '0 0 14px',
                        }}
                    >
                        These Studio Policies apply to regular website bookings and routine non-event appointments with
                        Glitz &amp; Glamour Studio for services such as nails, hair, waxing, lashes, brows, facials,
                        pedicures, and similar beauty services.
                    </p>

                    <p
                        style={{
                            fontFamily: 'Poppins, sans-serif',
                            color: '#dfd2d9',
                            fontSize: '13px',
                            fontWeight: 600,
                            margin: '0 0 18px',
                        }}
                    >
                        Last Updated: April 2026 · Glitz &amp; Glamour Studio
                    </p>

                    <div
                        style={{
                            display: 'grid',
                            gap: '10px',
                            paddingTop: '16px',
                            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                        }}
                    >
                        <p
                            style={{
                                fontFamily: 'Poppins, sans-serif',
                                color: '#dfd2d9',
                                fontSize: '13.5px',
                                margin: 0,
                                maxWidth: '720px',
                                lineHeight: 1.65,
                                borderLeft: '2px solid rgba(255, 138, 184, 0.45)',
                                paddingLeft: '14px',
                            }}
                        >
                            These policies are for regular website bookings only. Separate event inquiries, bridal
                            bookings, and Beauty Events Agreements are handled outside this website booking flow and are
                            governed separately.
                        </p>
                        <p
                            style={{
                                fontFamily: 'Poppins, sans-serif',
                                color: '#dfd2d9',
                                fontSize: '13.5px',
                                margin: 0,
                                maxWidth: '720px',
                                lineHeight: 1.65,
                                borderLeft: '2px solid rgba(226, 194, 134, 0.45)',
                                paddingLeft: '14px',
                            }}
                        >
                            By booking or receiving services, you agree to these Studio Policies in addition to the{' '}
                            <Link href="/terms" style={{ color: '#ff8ab8', textDecoration: 'underline', fontWeight: 600 }}>
                                Terms &amp; Conditions
                            </Link>
                            ,{' '}
                            <Link
                                href="/privacy"
                                style={{ color: '#ff8ab8', textDecoration: 'underline', fontWeight: 600 }}
                            >
                                Privacy Policy
                            </Link>
                            , and{' '}
                            <Link
                                href="/waiver"
                                style={{ color: '#ff8ab8', textDecoration: 'underline', fontWeight: 600 }}
                            >
                                Liability Waiver
                            </Link>{' '}
                            applicable to regular website service bookings.
                        </p>
                    </div>
                </header>

                <div style={{ display: 'grid', gap: '40px' }}>
                    {/* 01. GENERAL POLICIES SECTION */}
                    <section aria-labelledby="sec-general">
                        <SectionHeader
                            num="01"
                            id="sec-general"
                            icon={<AlertTriangle size={20} color="#ff8ab8" />}
                            title="General Policies"
                        />

                        <div className="policy-card-grid">
                            <PolicyCard
                                num="01.1"
                                icon={<CalendarX size={18} color="#E2C286" />}
                                title="No-Shows"
                                text="No-Shows may be charged and may be blocked from future bookings."
                            />
                            <PolicyCard
                                num="01.2"
                                icon={<AlertTriangle size={18} color="#ff8ab8" />}
                                title="Right To Refuse Service"
                                text="We reserve the right to refuse service for inappropriate behavior or safety concerns."
                            />
                            <PolicyCard
                                num="01.3"
                                icon={<CheckCircle size={18} color="#6ef2b8" />}
                                title="Results"
                                text="Results may vary and are not guaranteed."
                            />
                        </div>
                    </section>

                    {/* 02. NAIL SERVICES SECTION */}
                    <section aria-labelledby="sec-nails">
                        <SectionHeader
                            num="02"
                            id="sec-nails"
                            icon={<Sparkles size={20} color="#ff8ab8" />}
                            title="Nail Services"
                        />

                        <div className="policy-card-grid">
                            <PolicyCard
                                num="02.1"
                                icon={<CalendarX size={18} color="#E2C286" />}
                                title="Appointments"
                                text="A retainer is required to secure your appointment. Walk-ins are not available at this time. Please note that the retainer is non-refundable; however, it will be applied toward your total service amount."
                            />
                            <PolicyCard
                                num="02.2"
                                icon={<AlertTriangle size={18} color="#ff8ab8" />}
                                title="Cancellations & Rescheduling"
                                text="24-hour notice is required to transfer your retainer. No-shows forfeit the retainer and may be required to prepay in full for future bookings."
                            />
                            <PolicyCard
                                num="02.3"
                                icon={<Clock size={18} color="#6ef2b8" />}
                                title="Late Policy"
                                text="A 10-minute grace period is allowed. After that, a $10 late fee applies. Beyond 15 minutes, your appointment may be canceled."
                            />
                            <PolicyCard
                                num="02.4"
                                icon={<CreditCard size={18} color="#E2C286" />}
                                title="Payment"
                                text="Cash, Cash App, and Apple Pay accepted. No refunds once the service is completed."
                            />
                            <PolicyCard
                                num="02.5"
                                icon={<CheckCircle size={18} color="#ff8ab8" />}
                                title="Fixes"
                                text="Must be requested within 48 hours. Fixes due to personal nail care or accidents will have a fee."
                            />
                        </div>
                    </section>

                    {/* 03. HAIRSTYLING & MAKEUP SECTION */}
                    <section aria-labelledby="sec-hair">
                        <SectionHeader
                            num="03"
                            id="sec-hair"
                            icon={<Scissors size={20} color="#ff8ab8" />}
                            title="Hairstyling & Makeup"
                        />

                        <div className="policy-card-grid">
                            <PolicyCard
                                num="03.1"
                                icon={<MapPin size={18} color="#6ef2b8" />}
                                title="Location"
                                text="Mobile services based in Oceanside. Travel fees may apply outside the area."
                            />
                            <PolicyCard
                                num="03.2"
                                icon={<CalendarX size={18} color="#E2C286" />}
                                title="Booking"
                                text="A non-refundable retainer is required to secure your appointment. The remaining balance is due on the day of service."
                            />
                            <PolicyCard
                                num="03.3"
                                icon={<AlertTriangle size={18} color="#ff8ab8" />}
                                title="Cancellations"
                                text="Must be made at least 48 hours in advance to transfer your retainer to a future appointment. Last-minute cancellations or no-shows will forfeit the retainer."
                            />
                            <PolicyCard
                                num="03.4"
                                icon={<Clock size={18} color="#E2C286" />}
                                title="Late Policy"
                                text="A 10-minute grace period is allowed. After that, a $15 late fee applies. Beyond 20 minutes, your appointment may be canceled."
                            />
                            <PolicyCard
                                num="03.5"
                                icon={<CheckCircle size={18} color="#ff8ab8" />}
                                title="Prep"
                                text="Please arrive with clean, dry hair and a makeup-free face. A prep fee may apply if additional work is needed."
                            />
                            <PolicyCard
                                num="03.6"
                                icon={<CreditCard size={18} color="#6ef2b8" />}
                                title="Payment"
                                text="Cash, Cash App, and Apple Pay accepted. No refunds once the service is completed."
                            />
                        </div>
                    </section>

                    {/* 04. FACIALS SECTION */}
                    <section aria-labelledby="sec-facials">
                        <SectionHeader
                            num="04"
                            id="sec-facials"
                            icon={<Droplets size={20} color="#ff8ab8" />}
                            title="Facials & Skincare"
                        />

                        <div className="policy-card-grid">
                            <PolicyCard
                                num="04.1"
                                icon={<AlertTriangle size={18} color="#E2C286" />}
                                title="Contraindications"
                                text="Please arrive with a clean face if possible. Discontinue use of retinoids, AHAs, BHAs, and avoid excessive sun exposure at least 3-5 days prior to your facial. We cannot perform certain peels if you are currently using Accutane."
                            />
                            <PolicyCard
                                num="04.2"
                                icon={<CheckCircle size={18} color="#6ef2b8" />}
                                title="Aftercare"
                                text="Avoid direct sunlight, saunas, and strenuous exercise for 24-48 hours after treatment. Always apply SPF daily as instructed."
                            />
                        </div>
                    </section>

                    {/* 05. LASHES SECTION */}
                    <section aria-labelledby="sec-lashes">
                        <SectionHeader
                            num="05"
                            id="sec-lashes"
                            icon={<Eye size={20} color="#ff8ab8" />}
                            title="Lash Services"
                        />

                        <div className="policy-card-grid">
                            <PolicyCard
                                num="05.1"
                                icon={<Sparkles size={18} color="#E2C286" />}
                                title="Preparation"
                                text="Arrive with completely clean lashes—no mascara, eyeliner, or oils. A $15 makeup removal fee will apply if deep cleaning is required before your set."
                            />
                            <PolicyCard
                                num="05.2"
                                icon={<Clock size={18} color="#6ef2b8" />}
                                title="Fills vs. Full Sets"
                                text="You must have at least 40% of your extensions remaining to be considered a fill. If less than 40% remain, you will be charged for a new full set."
                            />
                            <PolicyCard
                                num="05.3"
                                icon={<AlertTriangle size={18} color="#ff8ab8" />}
                                title="Aftercare & Fixes"
                                text="Do not wet lashes for the first 24 hours. Avoid oil-based products around the eyes. We offer a 48-hour grace period for complimentary fixes related to application issues (not poor aftercare). Fixes requested after 48 hours will incur a fee."
                            />
                        </div>
                    </section>

                    {/* 06. WAXING SECTION */}
                    <section aria-labelledby="sec-waxing">
                        <SectionHeader
                            num="06"
                            id="sec-waxing"
                            icon={<Sun size={20} color="#E2C286" />}
                            title="Waxing"
                        />

                        <div className="policy-card-grid">
                            <PolicyCard
                                num="06.1"
                                icon={<Scissors size={18} color="#ff8ab8" />}
                                title="Hair Length"
                                text="Hair must be at least 1/4 inch long (about the size of a grain of rice) for effective waxing. Please do not trim prior to your appointment."
                            />
                            <PolicyCard
                                num="06.2"
                                icon={<AlertTriangle size={18} color="#E2C286" />}
                                title="Contraindications"
                                text="We cannot wax clients using Accutane, Retin-A, or other thinning medications. Please inform us of any prescription skincare routines beforehand."
                            />
                            <PolicyCard
                                num="06.3"
                                icon={<Sun size={18} color="#6ef2b8" />}
                                title="Aftercare"
                                text="Avoid sun exposure, tight clothing, heavy exercise, saunas, and hot baths for at least 24 hours post-wax to prevent irritation or breakouts."
                            />
                        </div>
                    </section>

                    {/* 07. PHOTO & IMAGE POLICY SECTION */}
                    <section aria-labelledby="sec-photo">
                        <SectionHeader
                            num="07"
                            id="sec-photo"
                            icon={<Camera size={20} color="#ff8ab8" />}
                            title="Photo & Image Policy"
                        />

                        <p
                            style={{
                                fontFamily: 'Poppins, sans-serif',
                                color: '#e2d6dc',
                                fontSize: '14.5px',
                                lineHeight: 1.7,
                                margin: '0 0 18px',
                                paddingLeft: '4px',
                            }}
                        >
                            At Glitz &amp; Glamour Studio, we may photograph or record service results, such as nails,
                            hair, makeup, lashes, brows, or other beauty work, only when you have provided separate
                            optional consent.
                        </p>

                        <div className="policy-card-grid">
                            <PolicyCard
                                num="07.1"
                                icon={<Camera size={18} color="#ff8ab8" />}
                                title="Optional Consent"
                                text="Photo and video consent is not required to book or receive services. If you choose to opt in, your consent and image usage rights are governed by our separate Image Usage & Release Policy."
                            />
                            <PolicyCard
                                num="07.2"
                                icon={<Ban size={18} color="#E2C286" />}
                                title="No Effect on Services"
                                text="Declining photo or video consent will not affect your appointment or service experience."
                            />
                            <PolicyCard
                                num="07.3"
                                icon={<Users size={18} color="#6ef2b8" />}
                                title="Minors"
                                text="If a minor is receiving a service, a parent or legal guardian must provide consent before any identifiable photo or video is captured or used."
                            />
                            <PolicyCard
                                num="07.4"
                                icon={<FileText size={18} color="#ff8ab8" />}
                                title="Separate Policy"
                                text="For full details about capture, use, editing, withdrawal, and restrictions, please review our Image Usage & Release Policy."
                            />
                        </div>
                    </section>
                </div>

                {/* Cross-Policy Footer Card */}
                <section
                    style={{
                        marginTop: '52px',
                        padding: '36px 28px',
                        background: 'linear-gradient(155deg, rgba(32, 15, 26, 0.92), rgba(14, 7, 12, 0.96))',
                        borderRadius: '26px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        position: 'relative',
                        overflow: 'hidden',
                    }}
                >
                    <div
                        aria-hidden="true"
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: '24px',
                            right: '24px',
                            height: '1px',
                            background:
                                'linear-gradient(90deg, transparent, rgba(255, 138, 184, 0.55), rgba(226, 194, 134, 0.45), transparent)',
                        }}
                    />

                    <h2
                        style={{
                            fontFamily: 'Poppins, sans-serif',
                            fontWeight: 700,
                            fontSize: '20px',
                            color: '#ffffff',
                            margin: '0 0 8px',
                            textAlign: 'center',
                        }}
                    >
                        More Studio Policies
                    </h2>
                    <p
                        style={{
                            fontFamily: 'Poppins, sans-serif',
                            color: '#e2d6dc',
                            fontSize: '14px',
                            margin: '0 0 24px',
                            textAlign: 'center',
                        }}
                    >
                        Explore our other policies and guidelines below, or book your appointment today.
                    </p>

                    <div className="policy-footer-grid">
                        <Link href="/faq" className="policy-footer-link">
                            <HelpCircle size={16} color="#ff8ab8" />
                            <span>FAQ</span>
                        </Link>
                        <Link href="/waiver" className="policy-footer-link">
                            <FileText size={16} color="#E2C286" />
                            <span>Liability Waiver</span>
                        </Link>
                        <Link href="/terms" className="policy-footer-link">
                            <Scale size={16} color="#ff8ab8" />
                            <span>Terms &amp; Conditions</span>
                        </Link>
                        <Link href="/privacy" className="policy-footer-link">
                            <Lock size={16} color="#E2C286" />
                            <span>Privacy Policy</span>
                        </Link>
                        <Link href="/image-policy" className="policy-footer-link">
                            <Camera size={16} color="#ff8ab8" />
                            <span>Image Release Policy</span>
                        </Link>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                        <Link
                            href="/book"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '14px 32px',
                                borderRadius: '999px',
                                background: 'linear-gradient(135deg, #FF2D78 0%, #c9185b 100%)',
                                color: '#ffffff',
                                fontFamily: 'Poppins, sans-serif',
                                fontSize: '14px',
                                fontWeight: 700,
                                textDecoration: 'none',
                                boxShadow: '0 10px 28px rgba(255, 45, 120, 0.35)',
                            }}
                        >
                            <Calendar size={16} /> Book Appointment
                        </Link>
                    </div>
                </section>
            </div>
        </main>
    );
}

function SectionHeader({
    num,
    id,
    icon,
    title,
}: {
    num: string;
    id: string;
    icon: React.ReactNode;
    title: string;
}) {
    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                marginBottom: '20px',
                paddingBottom: '12px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            }}
        >
            <div
                style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '13px',
                    background: 'rgba(255, 45, 120, 0.12)',
                    border: '1px solid rgba(255, 138, 184, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                }}
            >
                {icon}
            </div>
            <div>
                <span
                    style={{
                        display: 'block',
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '11px',
                        fontWeight: 700,
                        letterSpacing: '1.2px',
                        textTransform: 'uppercase',
                        color: '#ff8ab8',
                    }}
                >
                    Section {num}
                </span>
                <h2
                    id={id}
                    style={{
                        fontFamily: 'Poppins, sans-serif',
                        fontWeight: 700,
                        fontSize: 'clamp(1.25rem, 2.5vw, 1.5rem)',
                        color: '#ffffff',
                        margin: 0,
                    }}
                >
                    {title}
                </h2>
            </div>
        </div>
    );
}

function PolicyCard({
    num,
    icon,
    title,
    text,
}: {
    num: string;
    icon: React.ReactNode;
    title: string;
    text: string;
}) {
    return (
        <div className="policy-clause-card">
            <div
                aria-hidden="true"
                style={{
                    position: 'absolute',
                    top: 0,
                    left: '16px',
                    right: '16px',
                    height: '1px',
                    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.16), transparent)',
                }}
            />
            <div
                style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '11px',
                    flexShrink: 0,
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                {icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span
                        style={{
                            fontFamily: 'Poppins, sans-serif',
                            fontSize: '11px',
                            fontWeight: 700,
                            color: '#ff8ab8',
                            padding: '2px 8px',
                            borderRadius: '999px',
                            background: 'rgba(255, 45, 120, 0.14)',
                            border: '1px solid rgba(255, 138, 184, 0.3)',
                        }}
                    >
                        {num}
                    </span>
                    <h3
                        style={{
                            fontFamily: 'Poppins, sans-serif',
                            fontWeight: 600,
                            fontSize: '16px',
                            color: '#ffffff',
                            margin: 0,
                        }}
                    >
                        {title}
                    </h3>
                </div>
                <p
                    style={{
                        fontFamily: 'Poppins, sans-serif',
                        color: '#e2d6dc',
                        fontSize: '14px',
                        lineHeight: 1.65,
                        margin: 0,
                    }}
                >
                    {text}
                </p>
            </div>
        </div>
    );
}
