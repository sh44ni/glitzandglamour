'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Copy,
    CheckCircle,
    Clock,
    ExternalLink,
    Plus,
    Send,
    FileSignature,
    Users,
    Layout,
    Bell,
    ArrowLeft,
    Search,
    ShieldAlert,
    Archive,
    RotateCcw,
    Calendar,
    Phone,
    Mail,
    RefreshCw,
    X,
    Filter,
    FileText,
    Sparkles,
    ChevronRight,
    AlertTriangle,
} from 'lucide-react';
import styles from './contracts.module.css';
import SpecialEventAdminForm from './SpecialEventAdminForm';
import FinalizeStudioPanel from './FinalizeStudioPanel';
import SpecialEventClients from './SpecialEventClients';
import SpecialEventPageContent from './SpecialEventPageContent';
import SpecialEventInquiries from './SpecialEventInquiries';
import VoidContractModal from '@/components/admin/contracts/VoidContractModal';
import ArchiveContractModal from '@/components/admin/contracts/ArchiveContractModal';

type Lifecycle = 'DRAFT' | 'SENT' | 'CLIENT_SIGNED' | 'SIGNED';

type InviteRow = {
    id: string;
    token: string;
    label: string | null;
    clientHintName: string | null;
    clientHintEmail: string | null;
    clientPhone: string | null;
    eventDate: string | null;
    contractType: string | null;
    expiresAt: string;
    status: 'PENDING' | 'COMPLETED';
    lifecycleStatus: Lifecycle;
    isExpired: boolean;
    completedAt: string | null;
    referenceCode: string | null;
    pdfKey: string | null;
    createdAt: string;
    isSpecialEvent: boolean;
    contractNumber: string | null;
    sentAt: string | null;
    clientSignedAt: string | null;
    adminSignedAt: string | null;
    retainerReceived: boolean;
    isVoided: boolean;
    voidedAt: string | null;
    voidReasonInternal: string | null;
    voidNoteClient: string | null;
    isArchived: boolean;
    archivedAt: string | null;
    archiveReason: string | null;
};

/* ── Status Pill ── */
function StatusBadge({ row }: { row: InviteRow }) {
    if (row.isVoided) {
        return (
            <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '11px',
                fontWeight: 700,
                color: '#ff6b6b',
                background: 'rgba(255, 60, 60, 0.12)',
                border: '1px solid rgba(255, 60, 60, 0.35)',
                borderRadius: '50px',
                padding: '3px 10px',
                letterSpacing: '0.4px',
            }}>
                <ShieldAlert size={11} /> VOIDED
            </span>
        );
    }
    if (row.isArchived) {
        return (
            <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '11px',
                fontWeight: 700,
                color: '#FFB700',
                background: 'rgba(255, 183, 0, 0.12)',
                border: '1px solid rgba(255, 183, 0, 0.35)',
                borderRadius: '50px',
                padding: '3px 10px',
                letterSpacing: '0.4px',
            }}>
                <Archive size={11} /> ARCHIVED
            </span>
        );
    }
    if (row.isSpecialEvent) {
        const ls = row.lifecycleStatus;
        if (ls === 'SIGNED') {
            return (
                <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#00D478',
                    background: 'rgba(0, 212, 120, 0.12)',
                    border: '1px solid rgba(0, 212, 120, 0.35)',
                    borderRadius: '50px',
                    padding: '3px 10px',
                    letterSpacing: '0.4px',
                }}>
                    <CheckCircle size={11} /> EXECUTED
                </span>
            );
        }
        if (ls === 'CLIENT_SIGNED') {
            return (
                <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#5c9ded',
                    background: 'rgba(92, 157, 237, 0.12)',
                    border: '1px solid rgba(92, 157, 237, 0.35)',
                    borderRadius: '50px',
                    padding: '3px 10px',
                    letterSpacing: '0.4px',
                }}>
                    <Clock size={11} /> Client Signed
                </span>
            );
        }
        if (ls === 'DRAFT') {
            return (
                <span style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#c9a227',
                    background: 'rgba(201, 162, 39, 0.12)',
                    border: '1px solid rgba(201, 162, 39, 0.35)',
                    borderRadius: '50px',
                    padding: '3px 10px',
                    letterSpacing: '0.4px',
                }}>
                    Draft
                </span>
            );
        }
        if (ls === 'SENT') {
            return (
                <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#FF6BA8',
                    background: 'rgba(255, 45, 120, 0.1)',
                    border: '1px solid rgba(255, 45, 120, 0.28)',
                    borderRadius: '50px',
                    padding: '3px 10px',
                    letterSpacing: '0.4px',
                }}>
                    <Send size={11} /> Sent
                </span>
            );
        }
    }
    if (row.status === 'COMPLETED') {
        return (
            <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '11px',
                fontWeight: 700,
                color: '#00D478',
                background: 'rgba(0, 212, 120, 0.12)',
                border: '1px solid rgba(0, 212, 120, 0.35)',
                borderRadius: '50px',
                padding: '3px 10px',
                letterSpacing: '0.4px',
            }}>
                <CheckCircle size={11} /> Signed
            </span>
        );
    }
    if (row.isExpired) {
        return (
            <span style={{
                fontSize: '11px',
                fontWeight: 600,
                color: '#888',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '50px',
                padding: '3px 10px',
            }}>
                Expired
            </span>
        );
    }
    return (
        <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            fontSize: '11px',
            fontWeight: 700,
            color: '#FF6BA8',
            background: 'rgba(255, 45, 120, 0.1)',
            border: '1px solid rgba(255, 45, 120, 0.28)',
            borderRadius: '50px',
            padding: '3px 10px',
        }}>
            <Clock size={11} /> Awaiting Client
        </span>
    );
}

/** Formats dates nicely */
function fmtDate(iso: string) {
    if (!iso) return '—';
    const d = new Date(iso);
    return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
}

export default function AdminContractsPage() {
    const [invites, setInvites] = useState<InviteRow[]>([]);
    const [origin, setOrigin] = useState('');
    const [loading, setLoading] = useState(true);
    const [finalizeId, setFinalizeId] = useState<string | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'contracts' | 'inquiries' | 'clients' | 'content'>('contracts');
    const [contractsView, setContractsView] = useState<'list' | 'create'>('list');
    const [contractFilter, setContractFilter] = useState<'all' | 'pending' | 'signed' | 'voided' | 'archived'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Modal triggers
    const [voidingContract, setVoidingContract] = useState<InviteRow | null>(null);
    const [archivingContract, setArchivingContract] = useState<InviteRow | null>(null);
    const [unarchivingId, setUnarchivingId] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/contracts');
            if (res.ok) {
                const d = await res.json();
                setInvites(d.invites || []);
                setOrigin(d.origin || (typeof window !== 'undefined' ? window.location.origin : ''));
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    // Unarchive handler
    async function handleUnarchive(id: string) {
        setUnarchivingId(id);
        try {
            const res = await fetch(`/api/admin/contracts/${id}/unarchive`, { method: 'POST' });
            if (res.ok) {
                await load();
            }
        } finally {
            setUnarchivingId(null);
        }
    }

    function signUrlForToken(t: string) {
        const base = origin || (typeof window !== 'undefined' ? window.location.origin : '');
        return `${base}/sign/${t}`;
    }

    async function copyText(text: string, id: string) {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        } catch {
            /* ignore */
        }
    }

    // Counts for KPIs & Filter Badges
    const counts = useMemo(() => {
        const total = invites.length;
        const voided = invites.filter((r) => r.isVoided).length;
        const archived = invites.filter((r) => r.isArchived && !r.isVoided).length;
        const active = invites.filter((r) => !r.isVoided && !r.isArchived);
        const signed = active.filter((r) =>
            r.isSpecialEvent ? r.lifecycleStatus === 'SIGNED' : r.status === 'COMPLETED'
        ).length;
        const pending = active.filter((r) =>
            r.isSpecialEvent
                ? r.lifecycleStatus === 'SENT' || r.lifecycleStatus === 'CLIENT_SIGNED' || r.lifecycleStatus === 'DRAFT'
                : r.status === 'PENDING' && !r.isExpired
        ).length;
        return { total, active: active.length, pending, signed, voided, archived };
    }, [invites]);

    // Filtered rows based on current active segmented filter & search
    const filteredInvites = useMemo(() => {
        let list = invites;

        // Apply tab filter
        if (contractFilter === 'all') {
            list = list.filter((r) => !r.isVoided && !r.isArchived);
        } else if (contractFilter === 'pending') {
            list = list.filter((r) =>
                !r.isVoided &&
                !r.isArchived &&
                (r.isSpecialEvent
                    ? r.lifecycleStatus === 'SENT' || r.lifecycleStatus === 'CLIENT_SIGNED' || r.lifecycleStatus === 'DRAFT'
                    : r.status === 'PENDING' && !r.isExpired)
            );
        } else if (contractFilter === 'signed') {
            list = list.filter((r) =>
                !r.isVoided &&
                !r.isArchived &&
                (r.isSpecialEvent ? r.lifecycleStatus === 'SIGNED' : r.status === 'COMPLETED')
            );
        } else if (contractFilter === 'voided') {
            list = list.filter((r) => r.isVoided);
        } else if (contractFilter === 'archived') {
            list = list.filter((r) => r.isArchived && !r.isVoided);
        }

        // Apply search query
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            list = list.filter((r) =>
                (r.label && r.label.toLowerCase().includes(q)) ||
                (r.clientHintName && r.clientHintName.toLowerCase().includes(q)) ||
                (r.clientHintEmail && r.clientHintEmail.toLowerCase().includes(q)) ||
                (r.clientPhone && r.clientPhone.toLowerCase().includes(q)) ||
                (r.contractNumber && r.contractNumber.toLowerCase().includes(q)) ||
                (r.referenceCode && r.referenceCode.toLowerCase().includes(q)) ||
                (r.voidReasonInternal && r.voidReasonInternal.toLowerCase().includes(q)) ||
                (r.archiveReason && r.archiveReason.toLowerCase().includes(q))
            );
        }

        return list;
    }, [invites, contractFilter, searchQuery]);

    return (
        <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 8px 48px' }}>
            {/* ── Executive Command Header ── */}
            <div style={{
                marginBottom: '28px',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
            }}>
                <div>
                    <h1 style={{
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: 'clamp(24px, 4vw, 32px)',
                        fontWeight: 800,
                        background: 'linear-gradient(135deg, #FF2D78 0%, #FF6BA8 50%, #c084fc 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        margin: 0,
                        letterSpacing: '-0.4px',
                    }}>
                        Special Events &amp; Contracts
                    </h1>
                    <p style={{
                        color: '#888',
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '13px',
                        margin: '4px 0 0',
                    }}>
                        Executive management deck for high-value bookings, contracts, inquiries, and client rosters
                    </p>
                </div>

                {/* Header Action Toolbar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                        type="button"
                        onClick={load}
                        disabled={loading}
                        style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '12px',
                            padding: '10px 14px',
                            color: '#ccc',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '12px',
                            fontWeight: 600,
                            fontFamily: 'Poppins, sans-serif',
                            transition: 'all 0.2s ease',
                        }}
                    >
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                        Refresh
                    </button>

                    {activeTab === 'contracts' && contractsView === 'list' && (
                        <button
                            type="button"
                            onClick={() => setContractsView('create')}
                            style={{
                                background: 'linear-gradient(135deg, #FF2D78 0%, #E0005E 100%)',
                                border: '1px solid rgba(255, 45, 120, 0.4)',
                                borderRadius: '12px',
                                padding: '10px 18px',
                                color: '#fff',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontSize: '13px',
                                fontWeight: 700,
                                fontFamily: 'Poppins, sans-serif',
                                boxShadow: '0 4px 18px rgba(255, 45, 120, 0.35)',
                                transition: 'all 0.2s ease',
                            }}
                        >
                            <Plus size={16} /> New Contract
                        </button>
                    )}
                </div>
            </div>

            {/* ── Apple Segmented Main Tab Bar ── */}
            <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.07)',
                borderRadius: '16px',
                padding: '6px',
                display: 'inline-flex',
                gap: '6px',
                marginBottom: '28px',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                flexWrap: 'wrap',
            }}>
                <button
                    type="button"
                    onClick={() => setActiveTab('contracts')}
                    style={{
                        background: activeTab === 'contracts' ? 'rgba(255, 45, 120, 0.18)' : 'transparent',
                        border: activeTab === 'contracts' ? '1px solid rgba(255, 45, 120, 0.4)' : '1px solid transparent',
                        borderRadius: '11px',
                        padding: '9px 18px',
                        color: activeTab === 'contracts' ? '#fff' : '#888',
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '13px',
                        fontWeight: activeTab === 'contracts' ? 700 : 500,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.2s ease',
                    }}
                >
                    <FileSignature size={15} color={activeTab === 'contracts' ? '#FF2D78' : '#888'} />
                    Contracts
                    <span style={{
                        background: activeTab === 'contracts' ? 'rgba(255, 45, 120, 0.3)' : 'rgba(255, 255, 255, 0.06)',
                        color: activeTab === 'contracts' ? '#FF6BA8' : '#777',
                        padding: '1px 7px',
                        borderRadius: '50px',
                        fontSize: '11px',
                        fontWeight: 700,
                    }}>
                        {counts.total}
                    </span>
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab('inquiries')}
                    style={{
                        background: activeTab === 'inquiries' ? 'rgba(255, 45, 120, 0.18)' : 'transparent',
                        border: activeTab === 'inquiries' ? '1px solid rgba(255, 45, 120, 0.4)' : '1px solid transparent',
                        borderRadius: '11px',
                        padding: '9px 18px',
                        color: activeTab === 'inquiries' ? '#fff' : '#888',
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '13px',
                        fontWeight: activeTab === 'inquiries' ? 700 : 500,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.2s ease',
                    }}
                >
                    <Bell size={15} color={activeTab === 'inquiries' ? '#FF2D78' : '#888'} />
                    Inquiries
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab('clients')}
                    style={{
                        background: activeTab === 'clients' ? 'rgba(255, 45, 120, 0.18)' : 'transparent',
                        border: activeTab === 'clients' ? '1px solid rgba(255, 45, 120, 0.4)' : '1px solid transparent',
                        borderRadius: '11px',
                        padding: '9px 18px',
                        color: activeTab === 'clients' ? '#fff' : '#888',
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '13px',
                        fontWeight: activeTab === 'clients' ? 700 : 500,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.2s ease',
                    }}
                >
                    <Users size={15} color={activeTab === 'clients' ? '#FF2D78' : '#888'} />
                    Clients
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab('content')}
                    style={{
                        background: activeTab === 'content' ? 'rgba(255, 45, 120, 0.18)' : 'transparent',
                        border: activeTab === 'content' ? '1px solid rgba(255, 45, 120, 0.4)' : '1px solid transparent',
                        borderRadius: '11px',
                        padding: '9px 18px',
                        color: activeTab === 'content' ? '#fff' : '#888',
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '13px',
                        fontWeight: activeTab === 'content' ? 700 : 500,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.2s ease',
                    }}
                >
                    <Layout size={15} color={activeTab === 'content' ? '#FF2D78' : '#888'} />
                    Page Content
                </button>
            </div>

            {/* ── Finalize Studio Panel Overlay (if triggered) ── */}
            {finalizeId && (() => {
                const row = invites.find((r) => r.id === finalizeId);
                return (
                    <FinalizeStudioPanel
                        inviteId={finalizeId}
                        summary={{
                            label: row?.label ?? null,
                            contractNumber: row?.contractNumber ?? null,
                            clientName: row?.clientHintName ?? null,
                            clientEmail: row?.clientHintEmail ?? null,
                            clientSignedAt: row?.clientSignedAt ?? null,
                        }}
                        onDone={() => { setFinalizeId(null); load(); }}
                        onCancel={() => setFinalizeId(null)}
                    />
                );
            })()}

            {/* ── Void Contract Modal ── */}
            {voidingContract && (
                <VoidContractModal
                    contract={{
                        id: voidingContract.id,
                        contractNumber: voidingContract.contractNumber,
                        label: voidingContract.label,
                        clientName: voidingContract.clientHintName,
                        clientEmail: voidingContract.clientHintEmail,
                        clientPhone: voidingContract.clientPhone,
                        eventDate: voidingContract.eventDate,
                    }}
                    onClose={() => setVoidingContract(null)}
                    onVoided={() => {
                        setVoidingContract(null);
                        setContractFilter('voided');
                        load();
                    }}
                />
            )}

            {/* ── Archive Contract Modal ── */}
            {archivingContract && (
                <ArchiveContractModal
                    contract={{
                        id: archivingContract.id,
                        contractNumber: archivingContract.contractNumber,
                        label: archivingContract.label,
                        clientName: archivingContract.clientHintName,
                    }}
                    onClose={() => setArchivingContract(null)}
                    onArchived={() => {
                        setArchivingContract(null);
                        setContractFilter('archived');
                        load();
                    }}
                />
            )}

            {/* ════════════════════════════════════════════════════════════
               TAB 1: CONTRACTS DECK
               ════════════════════════════════════════════════════════════ */}
            {activeTab === 'contracts' && (
                <>
                    {contractsView === 'create' ? (
                        /* ── CREATE VIEW (SpecialEventAdminForm) ── */
                        <div>
                            <button
                                type="button"
                                onClick={() => setContractsView('list')}
                                style={{
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '12px',
                                    padding: '10px 18px',
                                    color: '#ccc',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    fontFamily: 'Poppins, sans-serif',
                                    marginBottom: '20px',
                                }}
                            >
                                <ArrowLeft size={16} /> Back to Contracts List
                            </button>
                            <SpecialEventAdminForm onCreated={() => { load(); setContractsView('list'); }} />
                        </div>
                    ) : (
                        /* ── LIST VIEW (Apple Liquid Luxury Cards) ── */
                        <div>
                            {/* KPI Metrics Chips */}
                            {!loading && (
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                                    gap: '14px',
                                    marginBottom: '24px',
                                }}>
                                    <div style={{
                                        background: 'rgba(255, 255, 255, 0.03)',
                                        border: '1px solid rgba(255, 255, 255, 0.07)',
                                        borderRadius: '18px',
                                        padding: '18px 20px',
                                        backdropFilter: 'blur(16px)',
                                    }}>
                                        <div style={{ fontSize: '11px', fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.4px', fontFamily: 'Poppins, sans-serif' }}>
                                            Total Contracts
                                        </div>
                                        <div style={{ fontSize: '26px', fontWeight: 800, color: '#fff', marginTop: '6px', fontFamily: 'Poppins, sans-serif' }}>
                                            {counts.total}
                                        </div>
                                    </div>

                                    <div style={{
                                        background: 'rgba(255, 45, 120, 0.04)',
                                        border: '1px solid rgba(255, 45, 120, 0.18)',
                                        borderRadius: '18px',
                                        padding: '18px 20px',
                                        backdropFilter: 'blur(16px)',
                                    }}>
                                        <div style={{ fontSize: '11px', fontWeight: 600, color: '#FF6BA8', textTransform: 'uppercase', letterSpacing: '0.4px', fontFamily: 'Poppins, sans-serif' }}>
                                            Pending Client
                                        </div>
                                        <div style={{ fontSize: '26px', fontWeight: 800, color: '#FF6BA8', marginTop: '6px', fontFamily: 'Poppins, sans-serif' }}>
                                            {counts.pending}
                                        </div>
                                    </div>

                                    <div style={{
                                        background: 'rgba(0, 212, 120, 0.04)',
                                        border: '1px solid rgba(0, 212, 120, 0.18)',
                                        borderRadius: '18px',
                                        padding: '18px 20px',
                                        backdropFilter: 'blur(16px)',
                                    }}>
                                        <div style={{ fontSize: '11px', fontWeight: 600, color: '#00D478', textTransform: 'uppercase', letterSpacing: '0.4px', fontFamily: 'Poppins, sans-serif' }}>
                                            Fully Executed
                                        </div>
                                        <div style={{ fontSize: '26px', fontWeight: 800, color: '#00D478', marginTop: '6px', fontFamily: 'Poppins, sans-serif' }}>
                                            {counts.signed}
                                        </div>
                                    </div>

                                    <div style={{
                                        background: 'rgba(255, 60, 60, 0.04)',
                                        border: '1px solid rgba(255, 60, 60, 0.2)',
                                        borderRadius: '18px',
                                        padding: '18px 20px',
                                        backdropFilter: 'blur(16px)',
                                    }}>
                                        <div style={{ fontSize: '11px', fontWeight: 600, color: '#ff6b6b', textTransform: 'uppercase', letterSpacing: '0.4px', fontFamily: 'Poppins, sans-serif' }}>
                                            Voided Contracts
                                        </div>
                                        <div style={{ fontSize: '26px', fontWeight: 800, color: '#ff6b6b', marginTop: '6px', fontFamily: 'Poppins, sans-serif' }}>
                                            {counts.voided}
                                        </div>
                                    </div>

                                    <div style={{
                                        background: 'rgba(255, 183, 0, 0.04)',
                                        border: '1px solid rgba(255, 183, 0, 0.2)',
                                        borderRadius: '18px',
                                        padding: '18px 20px',
                                        backdropFilter: 'blur(16px)',
                                    }}>
                                        <div style={{ fontSize: '11px', fontWeight: 600, color: '#FFB700', textTransform: 'uppercase', letterSpacing: '0.4px', fontFamily: 'Poppins, sans-serif' }}>
                                            Archived
                                        </div>
                                        <div style={{ fontSize: '26px', fontWeight: 800, color: '#FFB700', marginTop: '6px', fontFamily: 'Poppins, sans-serif' }}>
                                            {counts.archived}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Segmented Status Filter Bar & Search Input */}
                            <div style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '14px',
                                marginBottom: '22px',
                            }}>
                                {/* Segmented Filter Capsules */}
                                <div style={{
                                    display: 'flex',
                                    gap: '6px',
                                    flexWrap: 'wrap',
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    padding: '5px',
                                    borderRadius: '14px',
                                    border: '1px solid rgba(255, 255, 255, 0.06)',
                                }}>
                                    <button
                                        type="button"
                                        onClick={() => setContractFilter('all')}
                                        style={{
                                            padding: '7px 14px',
                                            borderRadius: '10px',
                                            fontSize: '12px',
                                            fontWeight: 600,
                                            fontFamily: 'Poppins, sans-serif',
                                            cursor: 'pointer',
                                            background: contractFilter === 'all' ? 'rgba(255, 45, 120, 0.2)' : 'transparent',
                                            border: contractFilter === 'all' ? '1px solid rgba(255, 45, 120, 0.4)' : '1px solid transparent',
                                            color: contractFilter === 'all' ? '#fff' : '#888',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                        }}
                                    >
                                        Active
                                        <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '50px', background: 'rgba(255, 255, 255, 0.08)' }}>
                                            {counts.active}
                                        </span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setContractFilter('pending')}
                                        style={{
                                            padding: '7px 14px',
                                            borderRadius: '10px',
                                            fontSize: '12px',
                                            fontWeight: 600,
                                            fontFamily: 'Poppins, sans-serif',
                                            cursor: 'pointer',
                                            background: contractFilter === 'pending' ? 'rgba(255, 45, 120, 0.2)' : 'transparent',
                                            border: contractFilter === 'pending' ? '1px solid rgba(255, 45, 120, 0.4)' : '1px solid transparent',
                                            color: contractFilter === 'pending' ? '#fff' : '#888',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                        }}
                                    >
                                        Pending
                                        <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '50px', background: 'rgba(255, 255, 255, 0.08)' }}>
                                            {counts.pending}
                                        </span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setContractFilter('signed')}
                                        style={{
                                            padding: '7px 14px',
                                            borderRadius: '10px',
                                            fontSize: '12px',
                                            fontWeight: 600,
                                            fontFamily: 'Poppins, sans-serif',
                                            cursor: 'pointer',
                                            background: contractFilter === 'signed' ? 'rgba(0, 212, 120, 0.18)' : 'transparent',
                                            border: contractFilter === 'signed' ? '1px solid rgba(0, 212, 120, 0.4)' : '1px solid transparent',
                                            color: contractFilter === 'signed' ? '#00D478' : '#888',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                        }}
                                    >
                                        Executed
                                        <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '50px', background: 'rgba(255, 255, 255, 0.08)' }}>
                                            {counts.signed}
                                        </span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setContractFilter('voided')}
                                        style={{
                                            padding: '7px 14px',
                                            borderRadius: '10px',
                                            fontSize: '12px',
                                            fontWeight: 600,
                                            fontFamily: 'Poppins, sans-serif',
                                            cursor: 'pointer',
                                            background: contractFilter === 'voided' ? 'rgba(255, 60, 60, 0.18)' : 'transparent',
                                            border: contractFilter === 'voided' ? '1px solid rgba(255, 60, 60, 0.4)' : '1px solid transparent',
                                            color: contractFilter === 'voided' ? '#ff6b6b' : '#888',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                        }}
                                    >
                                        <ShieldAlert size={13} />
                                        Voided
                                        <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '50px', background: 'rgba(255, 60, 60, 0.2)' }}>
                                            {counts.voided}
                                        </span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setContractFilter('archived')}
                                        style={{
                                            padding: '7px 14px',
                                            borderRadius: '10px',
                                            fontSize: '12px',
                                            fontWeight: 600,
                                            fontFamily: 'Poppins, sans-serif',
                                            cursor: 'pointer',
                                            background: contractFilter === 'archived' ? 'rgba(255, 183, 0, 0.18)' : 'transparent',
                                            border: contractFilter === 'archived' ? '1px solid rgba(255, 183, 0, 0.4)' : '1px solid transparent',
                                            color: contractFilter === 'archived' ? '#FFB700' : '#888',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                        }}
                                    >
                                        <Archive size={13} />
                                        Archived
                                        <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '50px', background: 'rgba(255, 183, 0, 0.2)' }}>
                                            {counts.archived}
                                        </span>
                                    </button>
                                </div>

                                {/* Search Bar */}
                                <div style={{
                                    position: 'relative',
                                    minWidth: '280px',
                                    flex: '1',
                                    maxWidth: '380px',
                                }}>
                                    <Search size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                                    <input
                                        type="text"
                                        placeholder="Search by client, contract #, email, phone..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        style={{
                                            width: '100%',
                                            boxSizing: 'border-box',
                                            background: 'rgba(255, 255, 255, 0.04)',
                                            border: '1px solid rgba(255, 255, 255, 0.09)',
                                            borderRadius: '12px',
                                            padding: '10px 38px 10px 38px',
                                            color: '#fff',
                                            fontSize: '13px',
                                            fontFamily: 'Poppins, sans-serif',
                                            outline: 'none',
                                        }}
                                    />
                                    {searchQuery && (
                                        <button
                                            type="button"
                                            onClick={() => setSearchQuery('')}
                                            style={{
                                                position: 'absolute',
                                                right: '10px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                background: 'transparent',
                                                border: 'none',
                                                color: '#888',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Contract Cards Stack */}
                            {loading ? (
                                <div style={{ textAlign: 'center', padding: '80px 20px', color: '#666', fontFamily: 'Poppins, sans-serif' }}>
                                    <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                                    <p>Loading contracts…</p>
                                </div>
                            ) : filteredInvites.length === 0 ? (
                                <div style={{
                                    textAlign: 'center',
                                    padding: '70px 20px',
                                    background: 'rgba(255, 255, 255, 0.02)',
                                    border: '1px dashed rgba(255, 255, 255, 0.08)',
                                    borderRadius: '20px',
                                    color: '#666',
                                    fontFamily: 'Poppins, sans-serif',
                                }}>
                                    <FileSignature size={40} style={{ margin: '0 auto 14px', opacity: 0.25, color: '#FF6BA8' }} />
                                    <h3 style={{ color: '#ccc', fontSize: '16px', fontWeight: 600, margin: '0 0 6px' }}>
                                        No contracts found
                                    </h3>
                                    <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>
                                        {searchQuery
                                            ? `No results match "${searchQuery}" in this view.`
                                            : contractFilter === 'voided'
                                            ? 'No voided contracts on record.'
                                            : contractFilter === 'archived'
                                            ? 'No archived contracts on record.'
                                            : 'Click "New Contract" above to generate a special events agreement.'}
                                    </p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                    {filteredInvites.map((row) => {
                                        const initials = (row.clientHintName || row.label || 'G')
                                            .trim()
                                            .split(' ')
                                            .slice(0, 2)
                                            .map((s) => s[0])
                                            .join('')
                                            .toUpperCase();

                                        const typeLabel = row.contractType
                                            ? row.contractType.replace('-es', ' (ES)').toUpperCase()
                                            : row.isSpecialEvent
                                            ? 'SPECIAL EVENT'
                                            : 'SIGNING LINK';

                                        return (
                                            <div
                                                key={row.id}
                                                style={{
                                                    background: row.isVoided
                                                        ? 'linear-gradient(135deg, rgba(35, 14, 20, 0.65), rgba(18, 14, 18, 0.75))'
                                                        : row.isArchived
                                                        ? 'linear-gradient(135deg, rgba(28, 24, 14, 0.65), rgba(18, 18, 16, 0.75))'
                                                        : 'rgba(255, 255, 255, 0.025)',
                                                    border: `1px solid ${
                                                        row.isVoided
                                                            ? 'rgba(255, 60, 60, 0.25)'
                                                            : row.isArchived
                                                            ? 'rgba(255, 183, 0, 0.22)'
                                                            : 'rgba(255, 255, 255, 0.07)'
                                                    }`,
                                                    borderRadius: '20px',
                                                    padding: '22px 24px',
                                                    backdropFilter: 'blur(16px)',
                                                    WebkitBackdropFilter: 'blur(16px)',
                                                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)',
                                                    transition: 'all 0.2s ease',
                                                }}
                                            >
                                                {/* Top Row: Client Info, Contract Type & Status */}
                                                <div style={{
                                                    display: 'flex',
                                                    flexWrap: 'wrap',
                                                    alignItems: 'flex-start',
                                                    justifyContent: 'space-between',
                                                    gap: '14px',
                                                    marginBottom: '16px',
                                                }}>
                                                    {/* Monogram Avatar & Client Identifiers */}
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                                        <div style={{
                                                            width: '46px',
                                                            height: '46px',
                                                            borderRadius: '14px',
                                                            background: row.isVoided
                                                                ? 'linear-gradient(135deg, #7f1d1d, #450a0a)'
                                                                : row.isArchived
                                                                ? 'linear-gradient(135deg, #78350f, #451a03)'
                                                                : 'linear-gradient(135deg, #FF2D78, #be185d)',
                                                            border: '1px solid rgba(255, 255, 255, 0.15)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            color: '#fff',
                                                            fontFamily: 'Poppins, sans-serif',
                                                            fontWeight: 800,
                                                            fontSize: '16px',
                                                            flexShrink: 0,
                                                            boxShadow: row.isVoided
                                                                ? 'none'
                                                                : '0 4px 14px rgba(255, 45, 120, 0.3)',
                                                        }}>
                                                            {initials}
                                                        </div>

                                                        <div>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                                                <span style={{
                                                                    fontFamily: 'Poppins, sans-serif',
                                                                    fontSize: '16px',
                                                                    fontWeight: 700,
                                                                    color: '#fff',
                                                                }}>
                                                                    {row.clientHintName || row.label || 'Client Agreement'}
                                                                </span>

                                                                {row.contractNumber && (
                                                                    <span style={{
                                                                        fontSize: '11px',
                                                                        fontWeight: 700,
                                                                        color: '#FF6BA8',
                                                                        background: 'rgba(255, 45, 120, 0.1)',
                                                                        border: '1px solid rgba(255, 45, 120, 0.25)',
                                                                        borderRadius: '50px',
                                                                        padding: '2px 9px',
                                                                        fontFamily: 'monospace',
                                                                    }}>
                                                                        #{row.contractNumber}
                                                                    </span>
                                                                )}

                                                                <span style={{
                                                                    fontSize: '10px',
                                                                    fontWeight: 700,
                                                                    letterSpacing: '0.4px',
                                                                    color: '#aaa',
                                                                    background: 'rgba(255, 255, 255, 0.05)',
                                                                    border: '1px solid rgba(255, 255, 255, 0.08)',
                                                                    borderRadius: '50px',
                                                                    padding: '2px 8px',
                                                                    fontFamily: 'Poppins, sans-serif',
                                                                }}>
                                                                    {typeLabel}
                                                                </span>
                                                            </div>

                                                            {/* Contact Details */}
                                                            <div style={{
                                                                display: 'flex',
                                                                gap: '12px',
                                                                alignItems: 'center',
                                                                flexWrap: 'wrap',
                                                                marginTop: '4px',
                                                                fontSize: '12px',
                                                                color: '#888',
                                                                fontFamily: 'Poppins, sans-serif',
                                                            }}>
                                                                {row.clientHintEmail && (
                                                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                                                        <Mail size={12} color="#777" /> {row.clientHintEmail}
                                                                    </span>
                                                                )}
                                                                {row.clientPhone && (
                                                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                                                        <Phone size={12} color="#777" /> {row.clientPhone}
                                                                    </span>
                                                                )}
                                                                {row.referenceCode && (
                                                                    <span style={{ color: '#FF6BA8' }}>
                                                                        Ref: {row.referenceCode}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Status Badge */}
                                                    <div>
                                                        <StatusBadge row={row} />
                                                    </div>
                                                </div>

                                                {/* Middle: Event Date, Expiry, or Void/Archive Details */}
                                                <div style={{
                                                    background: 'rgba(0, 0, 0, 0.25)',
                                                    border: '1px solid rgba(255, 255, 255, 0.04)',
                                                    borderRadius: '12px',
                                                    padding: '12px 16px',
                                                    marginBottom: '16px',
                                                    display: 'flex',
                                                    flexWrap: 'wrap',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    gap: '12px',
                                                    fontSize: '12px',
                                                    fontFamily: 'Poppins, sans-serif',
                                                }}>
                                                    {row.isVoided ? (
                                                        <div style={{ width: '100%' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ff6b6b', fontWeight: 600, marginBottom: '6px' }}>
                                                                <ShieldAlert size={14} />
                                                                Voided on {row.voidedAt ? new Date(row.voidedAt).toLocaleDateString() : '—'}
                                                            </div>
                                                            {row.voidReasonInternal && (
                                                                <div style={{ color: '#aaa', marginBottom: '4px' }}>
                                                                    <strong style={{ color: '#ddd' }}>Internal Reason:</strong> {row.voidReasonInternal}
                                                                </div>
                                                            )}
                                                            {row.voidNoteClient && (
                                                                <div style={{ color: '#aaa' }}>
                                                                    <strong style={{ color: '#ddd' }}>Client Note:</strong> {row.voidNoteClient}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : row.isArchived ? (
                                                        <div style={{ width: '100%' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#FFB700', fontWeight: 600, marginBottom: '4px' }}>
                                                                <Archive size={14} />
                                                                Archived on {row.archivedAt ? new Date(row.archivedAt).toLocaleDateString() : '—'}
                                                            </div>
                                                            {row.archiveReason && (
                                                                <div style={{ color: '#aaa' }}>
                                                                    <strong style={{ color: '#ddd' }}>Reason:</strong> {row.archiveReason}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flexWrap: 'wrap' }}>
                                                                {row.eventDate && (
                                                                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#ddd' }}>
                                                                        <Calendar size={13} color="#FF6BA8" />
                                                                        <span>Event Date: <strong>{row.eventDate}</strong></span>
                                                                    </div>
                                                                )}
                                                                <div style={{ color: '#999' }}>
                                                                    Expires: <strong style={{ color: '#ccc' }}>{fmtDate(row.expiresAt)}</strong>
                                                                </div>
                                                                {row.completedAt && (
                                                                    <div style={{ color: '#999' }}>
                                                                        Signed: <strong style={{ color: '#00D478' }}>{new Date(row.completedAt).toLocaleDateString()}</strong>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <div style={{ color: '#666', fontSize: '11px' }}>
                                                                Created {new Date(row.createdAt).toLocaleDateString()}
                                                            </div>
                                                        </>
                                                    )}
                                                </div>

                                                {/* Bottom Row: Action Toolbar */}
                                                <div style={{
                                                    display: 'flex',
                                                    flexWrap: 'wrap',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    gap: '10px',
                                                }}>
                                                    {/* Left Actions: Copy Link & Open PDF */}
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                                        {!row.isVoided && (
                                                            <button
                                                                type="button"
                                                                onClick={() => copyText(signUrlForToken(row.token), row.id)}
                                                                style={{
                                                                    background: 'rgba(255, 45, 120, 0.1)',
                                                                    border: '1px solid rgba(255, 45, 120, 0.25)',
                                                                    borderRadius: '10px',
                                                                    padding: '7px 12px',
                                                                    color: '#FF6BA8',
                                                                    cursor: 'pointer',
                                                                    fontSize: '12px',
                                                                    fontFamily: 'Poppins, sans-serif',
                                                                    fontWeight: 600,
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    gap: '6px',
                                                                }}
                                                            >
                                                                {copiedId === row.id ? <CheckCircle size={13} /> : <Copy size={13} />}
                                                                {copiedId === row.id ? 'Copied' : 'Copy Sign Link'}
                                                            </button>
                                                        )}

                                                        {row.pdfKey && (
                                                            <a
                                                                href={row.isSpecialEvent ? `/api/admin/contracts/${row.id}/pdf` : `/api/images/${row.pdfKey}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                style={{
                                                                    background: 'rgba(255, 255, 255, 0.04)',
                                                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                                                    borderRadius: '10px',
                                                                    padding: '7px 12px',
                                                                    color: '#ddd',
                                                                    textDecoration: 'none',
                                                                    fontSize: '12px',
                                                                    fontFamily: 'Poppins, sans-serif',
                                                                    fontWeight: 600,
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    gap: '6px',
                                                                }}
                                                            >
                                                                <ExternalLink size={13} /> Open PDF
                                                            </a>
                                                        )}

                                                        {/* Finalize Button (when client has signed and needs studio countersignature) */}
                                                        {row.isSpecialEvent && row.lifecycleStatus === 'CLIENT_SIGNED' && !row.isVoided && !row.isArchived && (
                                                            <button
                                                                type="button"
                                                                onClick={() => setFinalizeId(row.id)}
                                                                style={{
                                                                    background: 'linear-gradient(135deg, #00D478, #059669)',
                                                                    border: '1px solid rgba(0, 212, 120, 0.4)',
                                                                    borderRadius: '10px',
                                                                    padding: '7px 14px',
                                                                    color: '#fff',
                                                                    fontSize: '12px',
                                                                    fontWeight: 700,
                                                                    fontFamily: 'Poppins, sans-serif',
                                                                    cursor: 'pointer',
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    gap: '6px',
                                                                    boxShadow: '0 2px 10px rgba(0, 212, 120, 0.3)',
                                                                }}
                                                            >
                                                                <CheckCircle size={13} /> Finalize (Countersign)
                                                            </button>
                                                        )}
                                                    </div>

                                                    {/* Right Actions: Void & Archive Buttons */}
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        {/* Void Contract Button (if not already voided) */}
                                                        {!row.isVoided && (
                                                            <button
                                                                type="button"
                                                                onClick={() => setVoidingContract(row)}
                                                                style={{
                                                                    background: 'rgba(255, 60, 60, 0.08)',
                                                                    border: '1px solid rgba(255, 60, 60, 0.25)',
                                                                    borderRadius: '10px',
                                                                    padding: '7px 12px',
                                                                    color: '#ff6b6b',
                                                                    fontSize: '12px',
                                                                    fontWeight: 600,
                                                                    fontFamily: 'Poppins, sans-serif',
                                                                    cursor: 'pointer',
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    gap: '6px',
                                                                    transition: 'all 0.15s ease',
                                                                }}
                                                            >
                                                                <ShieldAlert size={13} /> Void Contract
                                                            </button>
                                                        )}

                                                        {/* Archive or Unarchive Button */}
                                                        {row.isArchived ? (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleUnarchive(row.id)}
                                                                disabled={unarchivingId === row.id}
                                                                style={{
                                                                    background: 'rgba(255, 183, 0, 0.1)',
                                                                    border: '1px solid rgba(255, 183, 0, 0.3)',
                                                                    borderRadius: '10px',
                                                                    padding: '7px 12px',
                                                                    color: '#FFB700',
                                                                    fontSize: '12px',
                                                                    fontWeight: 600,
                                                                    fontFamily: 'Poppins, sans-serif',
                                                                    cursor: 'pointer',
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    gap: '6px',
                                                                }}
                                                            >
                                                                <RotateCcw size={13} className={unarchivingId === row.id ? 'animate-spin' : ''} />
                                                                Restore / Unarchive
                                                            </button>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                onClick={() => setArchivingContract(row)}
                                                                style={{
                                                                    background: 'rgba(255, 255, 255, 0.04)',
                                                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                                                    borderRadius: '10px',
                                                                    padding: '7px 12px',
                                                                    color: '#aaa',
                                                                    fontSize: '12px',
                                                                    fontWeight: 600,
                                                                    fontFamily: 'Poppins, sans-serif',
                                                                    cursor: 'pointer',
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    gap: '6px',
                                                                }}
                                                            >
                                                                <Archive size={13} /> Archive
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}

            {/* ════════════════════════════════════════════════════════════
               TAB 2: INQUIRIES
               ════════════════════════════════════════════════════════════ */}
            {activeTab === 'inquiries' && <SpecialEventInquiries />}

            {/* ════════════════════════════════════════════════════════════
               TAB 3: CLIENTS
               ════════════════════════════════════════════════════════════ */}
            {activeTab === 'clients' && <SpecialEventClients />}

            {/* ════════════════════════════════════════════════════════════
               TAB 4: PAGE CONTENT (Bento Gallery SEO Photos)
               ════════════════════════════════════════════════════════════ */}
            {activeTab === 'content' && <SpecialEventPageContent />}
        </div>
    );
}
