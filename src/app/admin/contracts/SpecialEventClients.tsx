'use client';

import { useCallback, useEffect, useState } from 'react';
import { Search, ExternalLink, ChevronDown, Users, Sparkles, FileText, Calendar, MapPin, DollarSign, Shield, Pen, Monitor } from 'lucide-react';
import styles from './contracts.module.css';

type ServiceLine = { description: string; price: string; notes: string };

type ExecutionRecord = {
    eventType: string | null;
    eventDate: string | null;
    startTime: string | null;
    venue: string | null;
    headcount: string | null;
    services: ServiceLine[];
    retainer: string | null;
    balance: string | null;
    travelEnabled: boolean;
    travelFee: string | null;
    travelDest: string | null;
    ppActive: string | null;
    minors: string | null;
    guardian: string | null;
    allergySelect: string | null;
    allergyDetail: string | null;
    skinSelect: string | null;
    skinDetail: string | null;
    photoValue: string | null;
    photoRestrict: string | null;
    clientPrintedName: string | null;
    clientSignDate: string | null;
    signatureMethod: string | null;
    adminPrintedName: string | null;
    adminSignDate: string | null;
    retainerReceived: boolean;
    // Audit / execution metadata
    clientIp: string | null;
    clientUserAgent: string | null;
    clientSignedAt: string | null;
    adminSignedAt: string | null;
};

type ClientContract = {
    linkId: string;
    inviteId: string;
    label: string | null;
    contractNumber: string | null;
    contractType: string | null;
    lifecycleStatus: string | null;
    pdfKey: string | null;
    clientSignedAt: string | null;
    adminSignedAt: string | null;
    sentAt: string | null;
    createdAt: string;
    execution: ExecutionRecord | null;
};

type SEClient = {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    linkedUserId: string | null;
    notes: string | null;
    createdAt: string;
    contracts: ClientContract[];
};

/* ── Parse user agent to readable format ── */
function parseUserAgent(ua: string): string {
    const parts: string[] = [];
    // Browser
    if (ua.includes('Edg/')) parts.push('Edge');
    else if (ua.includes('Chrome/')) parts.push('Chrome');
    else if (ua.includes('Firefox/')) parts.push('Firefox');
    else if (ua.includes('Safari/') && !ua.includes('Chrome')) parts.push('Safari');
    else parts.push('Unknown Browser');
    // OS
    if (ua.includes('Windows')) parts.push('Windows');
    else if (ua.includes('Macintosh') || ua.includes('Mac OS')) parts.push('macOS');
    else if (ua.includes('iPhone')) parts.push('iPhone');
    else if (ua.includes('iPad')) parts.push('iPad');
    else if (ua.includes('Android')) parts.push('Android');
    else if (ua.includes('Linux')) parts.push('Linux');
    // Mobile
    if (ua.includes('Mobile')) parts.push('Mobile');
    return parts.join(' · ');
}

/* ── Tiny helper for detail rows ── */
function DetailRow({ label, value }: { label: string; value: string | null | undefined }) {
    if (!value) return null;
    return (
        <div style={{ display: 'flex', gap: 10, padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <span style={{ color: '#666', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.3px', minWidth: 90, flexShrink: 0, fontFamily: 'Poppins, sans-serif' }}>{label}</span>
            <span style={{ color: '#ccc', fontSize: '13px', fontFamily: 'Poppins, sans-serif', wordBreak: 'break-word' }}>{value}</span>
        </div>
    );
}

/* ── Execution Record Panel ── */
function ExecutionPanel({ cc }: { cc: ClientContract }) {
    const ex = cc.execution;
    if (!ex) return <p style={{ color: '#555', fontSize: '12px', padding: '12px 0', fontFamily: 'Poppins, sans-serif' }}>No execution data available.</p>;

    const sectionHead: React.CSSProperties = { fontFamily: 'Poppins, sans-serif', fontSize: '11px', fontWeight: 700, color: '#FF6BA8', textTransform: 'uppercase', letterSpacing: '0.6px', marginTop: 16, marginBottom: 6 };
    const cardStyle: React.CSSProperties = { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '12px 14px', marginBottom: 8 };

    return (
        <div style={{ animation: 'fadeSlideIn 0.25s ease' }}>
            {/* Event Details */}
            <div style={sectionHead}><Calendar size={11} style={{ marginRight: 4, verticalAlign: -1 }} /> Event Details</div>
            <div style={cardStyle}>
                <DetailRow label="Event" value={ex.eventType} />
                <DetailRow label="Date" value={ex.eventDate} />
                <DetailRow label="Start" value={ex.startTime} />
                <DetailRow label="Venue" value={ex.venue} />
                <DetailRow label="Headcount" value={ex.headcount} />
                {ex.minors && ex.minors !== '0' && <DetailRow label="Minors" value={ex.minors} />}
                {ex.guardian && <DetailRow label="Guardian" value={ex.guardian} />}
            </div>

            {/* Services */}
            {ex.services.length > 0 && (
                <>
                    <div style={sectionHead}><FileText size={11} style={{ marginRight: 4, verticalAlign: -1 }} /> Services</div>
                    <div style={cardStyle}>
                        {ex.services.map((s, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, padding: '6px 0', borderBottom: i < ex.services.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                                <span style={{ color: '#ccc', fontSize: '13px', fontFamily: 'Poppins, sans-serif', flex: 1 }}>{s.description}</span>
                                <span style={{ color: '#FF6BA8', fontSize: '13px', fontFamily: 'Poppins, sans-serif', fontWeight: 600, flexShrink: 0 }}>
                                    {s.price ? `$${parseFloat(s.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—'}
                                </span>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Financial */}
            <div style={sectionHead}><DollarSign size={11} style={{ marginRight: 4, verticalAlign: -1 }} /> Financial</div>
            <div style={cardStyle}>
                <DetailRow label="Retainer" value={ex.retainer ? `$${ex.retainer}` : null} />
                <DetailRow label="Balance" value={ex.balance ? `$${ex.balance}` : null} />
                <DetailRow label="Payment" value={ex.ppActive === 'Yes' ? 'Payment plan active' : ex.ppActive === 'No' ? 'Full payment' : 'N/A'} />
                {ex.travelEnabled && (
                    <>
                        <DetailRow label="Travel To" value={ex.travelDest} />
                        <DetailRow label="Travel Fee" value={ex.travelFee ? `$${ex.travelFee}` : null} />
                    </>
                )}
            </div>

            {/* Client Disclosures */}
            {(ex.allergySelect || ex.photoValue) && (
                <>
                    <div style={sectionHead}><Shield size={11} style={{ marginRight: 4, verticalAlign: -1 }} /> Client Disclosures</div>
                    <div style={cardStyle}>
                        <DetailRow label="Allergies" value={ex.allergySelect === 'None' ? 'None' : ex.allergyDetail ? `${ex.allergySelect}: ${ex.allergyDetail}` : ex.allergySelect} />
                        <DetailRow label="Skin" value={ex.skinSelect === 'None' ? 'None' : ex.skinDetail ? `${ex.skinSelect}: ${ex.skinDetail}` : ex.skinSelect} />
                        <DetailRow label="Photo" value={ex.photoValue} />
                        {ex.photoRestrict && <DetailRow label="Restrictions" value={ex.photoRestrict} />}
                    </div>
                </>
            )}

            {/* Signatures */}
            <div style={sectionHead}><Pen size={11} style={{ marginRight: 4, verticalAlign: -1 }} /> Signatures</div>
            <div style={cardStyle}>
                <DetailRow label="Client" value={ex.clientPrintedName} />
                <DetailRow label="Client Date" value={ex.clientSignDate} />
                <DetailRow label="Method" value={ex.signatureMethod === 'type' ? 'Typed signature' : ex.signatureMethod === 'draw' ? 'Drawn signature' : null} />
                {ex.retainerReceived && (
                    <>
                        <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '8px 0' }} />
                        <DetailRow label="Studio" value={ex.adminPrintedName} />
                        <DetailRow label="Studio Date" value={ex.adminSignDate} />
                        <DetailRow label="Retainer" value="✓ Received" />
                    </>
                )}
            </div>

            {/* Execution Metadata */}
            <div style={sectionHead}><Monitor size={11} style={{ marginRight: 4, verticalAlign: -1 }} /> Execution Metadata</div>
            <div style={cardStyle}>
                <DetailRow label="Client IP" value={ex.clientIp} />
                <DetailRow label="Device" value={ex.clientUserAgent ? parseUserAgent(ex.clientUserAgent) : null} />
                <DetailRow label="Raw UA" value={ex.clientUserAgent} />
                <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '8px 0' }} />
                <DetailRow label="Created" value={new Date(cc.createdAt).toLocaleString()} />
                {cc.sentAt && <DetailRow label="Sent" value={new Date(cc.sentAt).toLocaleString()} />}
                {ex.clientSignedAt && <DetailRow label="Signed At" value={new Date(ex.clientSignedAt).toLocaleString()} />}
                {ex.adminSignedAt && <DetailRow label="Finalized" value={new Date(ex.adminSignedAt).toLocaleString()} />}
            </div>
        </div>
    );
}

export default function SpecialEventClients() {
    const [clients, setClients] = useState<SEClient[]>([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState('');
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [viewRecordId, setViewRecordId] = useState<string | null>(null); // inviteId of contract being viewed
    const [searchTimeout, setSearchTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

    const fetchClients = useCallback(async (q: string) => {
        setLoading(true);
        try {
            const params = q ? `?q=${encodeURIComponent(q)}` : '';
            const res = await fetch(`/api/admin/contracts/clients${params}`);
            if (res.ok) {
                const d = await res.json();
                setClients(d.clients || []);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchClients('');
    }, [fetchClients]);

    function handleSearch(val: string) {
        setQuery(val);
        if (searchTimeout) clearTimeout(searchTimeout);
        setSearchTimeout(setTimeout(() => fetchClients(val), 350));
    }

    return (
        <div>
            {/* Search */}
            <div className={styles.clientSearchWrap}>
                <Search size={16} className={styles.clientSearchIcon} />
                <input
                    className={styles.clientSearch}
                    placeholder="Search by name, email, or phone…"
                    value={query}
                    onChange={(e) => handleSearch(e.target.value)}
                />
            </div>

            {/* List */}
            {loading ? (
                <p style={{ color: '#666', fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}>Loading…</p>
            ) : clients.length === 0 ? (
                <div className={styles.clientEmpty}>
                    <Users size={32} style={{ marginBottom: 12, opacity: 0.3 }} />
                    <div>{query ? 'No clients match your search.' : 'No special event clients yet.'}</div>
                    <div style={{ fontSize: '12px', marginTop: 6, color: '#444' }}>
                        Clients are automatically created when a contract is finalized.
                    </div>
                </div>
            ) : (
                clients.map((c) => {
                    const isOpen = expandedId === c.id;
                    return (
                        <div key={c.id} className={styles.clientCard}>
                            <div
                                className={styles.clientCardHead}
                                onClick={() => { setExpandedId(isOpen ? null : c.id); setViewRecordId(null); }}
                            >
                                <div style={{ minWidth: 0, flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                        <span className={styles.clientName}>{c.name}</span>
                                        {c.linkedUserId && (
                                            <span className={styles.clientBadgeMember}>
                                                <Sparkles size={10} /> G&G Member
                                            </span>
                                        )}
                                        <span className={styles.clientBadgeContracts}>
                                            {c.contracts.length} contract{c.contracts.length !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                    <div className={styles.clientMeta}>
                                        {c.email && <span>{c.email}</span>}
                                        {c.phone && <span>{c.phone}</span>}
                                        <span>Since {new Date(c.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <ChevronDown
                                    size={18}
                                    className={`${styles.clientChevron} ${isOpen ? styles.clientChevronOpen : ''}`}
                                />
                            </div>

                            {isOpen && (
                                <div className={styles.clientExpandedBody}>
                                    {c.contracts.length === 0 ? (
                                        <p style={{ color: '#555', fontSize: '13px', padding: '12px 0' }}>
                                            No contracts linked.
                                        </p>
                                    ) : (
                                        c.contracts.map((cc) => (
                                            <div key={cc.linkId}>
                                                <div className={styles.clientContractRow}>
                                                    <div className={styles.clientContractInfo}>
                                                        <div className={styles.clientContractLabel}>
                                                            {cc.contractNumber || cc.label || 'Contract'}
                                                            {cc.contractType && (
                                                                <span style={{ color: '#888', fontWeight: 400, marginLeft: 8 }}>
                                                                    ({cc.contractType})
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className={styles.clientContractMeta}>
                                                            {cc.execution?.eventDate && <span>Event: {cc.execution.eventDate}</span>}
                                                            {cc.execution?.eventDate && cc.adminSignedAt && <span> · </span>}
                                                            {cc.adminSignedAt && (
                                                                <span>
                                                                    Signed:{' '}
                                                                    {new Date(cc.adminSignedAt).toLocaleDateString()}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className={styles.clientContractActions}>
                                                        {cc.execution && (
                                                            <button
                                                                type="button"
                                                                className={styles.clientPdfBtn}
                                                                onClick={() => setViewRecordId(viewRecordId === cc.inviteId ? null : cc.inviteId)}
                                                                style={viewRecordId === cc.inviteId ? { background: 'rgba(255,107,168,0.18)', borderColor: '#FF6BA8' } : {}}
                                                            >
                                                                <FileText size={12} /> {viewRecordId === cc.inviteId ? 'Hide' : 'Record'}
                                                            </button>
                                                        )}
                                                        {cc.pdfKey && (
                                                            <a
                                                                href={`/api/admin/contracts/${cc.inviteId}/pdf`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className={styles.clientPdfBtn}
                                                            >
                                                                <ExternalLink size={12} /> PDF
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                                {/* Execution Record Panel */}
                                                {viewRecordId === cc.inviteId && <ExecutionPanel cc={cc} />}
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })
            )}
        </div>
    );
}
