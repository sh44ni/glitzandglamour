'use client';
import { useState, useEffect, useMemo } from 'react';
import { X, Search, CheckSquare, Square, AlertTriangle, Send, Users, MessageSquare, ChevronRight, ChevronLeft } from 'lucide-react';

const S = { fontFamily: 'Poppins, sans-serif' } as const;

type Contact = { id: string; name: string; email: string | null; phone: string; hasConsent: boolean; isGuest: boolean };

type Props = { onClose: () => void; onCreated: () => void };

export default function CampaignCreator({ onClose, onCreated }: Props) {
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [name, setName] = useState('');
    const [message, setMessage] = useState('');
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loadingContacts, setLoadingContacts] = useState(false);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [search, setSearch] = useState('');
    const [audienceFilter, setAudienceFilter] = useState<'consented' | 'all' | 'guests'>('consented');
    const [sending, setSending] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);

    useEffect(() => {
        if (step === 2 && contacts.length === 0) {
            setLoadingContacts(true);
            fetch('/api/admin/campaigns/recipients')
                .then(r => r.json())
                .then(d => { setContacts(d.contacts || []); setLoadingContacts(false); });
        }
    }, [step, contacts.length]);

    const filtered = useMemo(() => {
        let list = contacts;
        if (audienceFilter === 'consented') list = list.filter(c => c.hasConsent);
        else if (audienceFilter === 'guests') list = list.filter(c => c.isGuest);
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(c => c.name.toLowerCase().includes(q) || c.phone.includes(q) || (c.email || '').toLowerCase().includes(q));
        }
        return list;
    }, [contacts, audienceFilter, search]);

    const selectedContacts = contacts.filter(c => selected.has(c.id));
    const nonConsentedSelected = selectedContacts.filter(c => !c.hasConsent);
    const chars = message.length;
    const segments = Math.ceil(chars / 160) || 1;

    function toggleAll() {
        if (filtered.every(c => selected.has(c.id))) {
            setSelected(s => { const n = new Set(s); filtered.forEach(c => n.delete(c.id)); return n; });
        } else {
            setSelected(s => { const n = new Set(s); filtered.forEach(c => n.add(c.id)); return n; });
        }
    }

    function toggle(id: string) {
        setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
    }

    async function doCreate() {
        setSending(true);
        const recipients = selectedContacts.map(c => ({ phone: c.phone, name: c.name, email: c.email, hasConsent: c.hasConsent }));
        const res = await fetch('/api/admin/campaigns', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: name.trim(), message: message.trim(), recipients }),
        });
        const { campaign } = await res.json();
        if (!campaign?.id) { setSending(false); return; }
        // Immediately send
        await fetch('/api/admin/campaigns/send', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ campaignId: campaign.id }),
        });
        setSending(false);
        onCreated();
        onClose();
    }

    const allFilteredSelected = filtered.length > 0 && filtered.every(c => selected.has(c.id));

    return (
        <div onClick={e => e.target === e.currentTarget && onClose()} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
            <div style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, width: '100%', maxWidth: 560, maxHeight: '92vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 56px rgba(0,0,0,0.7)' }}>
                {/* Header */}
                <div style={{ padding: '20px 20px 0', flexShrink: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <div>
                            <h2 style={{ ...S, fontWeight: 700, color: '#fff', fontSize: 17, margin: 0 }}>New Campaign</h2>
                            <p style={{ ...S, color: '#555', fontSize: 12, marginTop: 2 }}>Step {step} of 3 — {step === 1 ? 'Compose' : step === 2 ? 'Pick Audience' : 'Review & Send'}</p>
                        </div>
                        <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#888' }}><X size={15} /></button>
                    </div>
                    {/* Step dots */}
                    <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
                        {[1, 2, 3].map(n => <div key={n} style={{ height: 3, flex: 1, borderRadius: 2, background: step >= n ? 'linear-gradient(90deg,#FF2D78,#7928CA)' : 'rgba(255,255,255,0.08)', transition: 'background 0.3s' }} />)}
                    </div>
                </div>

                {/* Body */}
                <div style={{ overflowY: 'auto', flex: 1, padding: '0 20px' }}>

                    {/* STEP 1 — Compose */}
                    {step === 1 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingBottom: 20 }}>
                            <div>
                                <label style={{ ...S, color: '#888', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 6 }}>Campaign Name</label>
                                <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. May Promo, Holiday Sale…" style={{ ...S, width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 12px', color: '#fff', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                            </div>
                            <div>
                                <label style={{ ...S, color: '#888', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 6 }}>Message</label>
                                <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Hi [Name]! 💅 Don't miss our…" rows={5} style={{ ...S, width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 12px', color: '#fff', fontSize: 13, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                                    <span style={{ ...S, fontSize: 11, color: chars > 320 ? '#FF2D78' : '#555' }}>{chars} chars · {segments} SMS segment{segments > 1 ? 's' : ''}</span>
                                    <span style={{ ...S, fontSize: 11, color: '#333' }}>160 chars = 1 segment</span>
                                </div>
                            </div>
                            {/* Message preview bubble */}
                            {message && (
                                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 14 }}>
                                    <p style={{ ...S, fontSize: 10, color: '#555', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Preview</p>
                                    <div style={{ background: 'rgba(255,45,120,0.1)', border: '1px solid rgba(255,45,120,0.2)', borderRadius: '16px 16px 4px 16px', padding: '10px 14px', display: 'inline-block', maxWidth: '85%' }}>
                                        <p style={{ ...S, fontSize: 13, color: '#eee', lineHeight: 1.5, margin: 0, whiteSpace: 'pre-wrap' }}>{message}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* STEP 2 — Audience */}
                    {step === 2 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 20 }}>
                            {/* Filter tabs */}
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                {([['consented', '✅ Consented'], ['all', '👥 All'], ['guests', '👤 Guests']] as const).map(([key, label]) => (
                                    <button key={key} onClick={() => setAudienceFilter(key)} style={{ ...S, fontSize: 11, fontWeight: 600, padding: '6px 12px', borderRadius: 50, cursor: 'pointer', border: 'none', background: audienceFilter === key ? 'linear-gradient(135deg,#FF2D78,#7928CA)' : 'rgba(255,255,255,0.06)', color: audienceFilter === key ? '#fff' : '#666' }}>
                                        {label}
                                    </button>
                                ))}
                                <span style={{ ...S, fontSize: 11, color: '#444', marginLeft: 'auto', alignSelf: 'center' }}>{selected.size} selected</span>
                            </div>
                            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, phone, email…" style={{ ...S, width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '9px 12px', color: '#fff', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                            {/* Select all */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <button onClick={toggleAll} style={{ ...S, fontSize: 12, fontWeight: 600, color: '#FF2D78', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                                    {allFilteredSelected ? <CheckSquare size={13} /> : <Square size={13} />}
                                    {allFilteredSelected ? 'Deselect All' : `Select All (${filtered.length})`}
                                </button>
                                <span style={{ ...S, fontSize: 11, color: '#444' }}>{filtered.length} shown</span>
                            </div>
                            {/* Contact list */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 300, overflowY: 'auto' }}>
                                {loadingContacts ? (
                                    Array.from({ length: 5 }).map((_, i) => <div key={i} style={{ height: 52, borderRadius: 10, background: 'rgba(255,255,255,0.04)', animation: 'pulse 1.5s infinite' }} />)
                                ) : filtered.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '30px 0' }}>
                                        <Users size={28} color="#2a2a2a" />
                                        <p style={{ ...S, color: '#333', fontSize: 13, marginTop: 8 }}>No contacts found</p>
                                    </div>
                                ) : filtered.map(c => {
                                    const isSelected = selected.has(c.id);
                                    return (
                                        <button key={c.id} onClick={() => toggle(c.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, border: `1px solid ${isSelected ? 'rgba(255,45,120,0.3)' : 'rgba(255,255,255,0.06)'}`, background: isSelected ? 'rgba(255,45,120,0.07)' : 'rgba(255,255,255,0.02)', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}>
                                            <div style={{ color: isSelected ? '#FF2D78' : '#444', flexShrink: 0 }}>{isSelected ? <CheckSquare size={15} /> : <Square size={15} />}</div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <p style={{ ...S, fontWeight: 600, color: '#ddd', fontSize: 13, margin: 0 }}>{c.name}</p>
                                                <p style={{ ...S, color: '#555', fontSize: 11, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.phone}{c.email ? ` · ${c.email}` : ''}</p>
                                            </div>
                                            <span style={{ ...S, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 50, flexShrink: 0, background: c.hasConsent ? 'rgba(0,212,120,0.12)' : 'rgba(255,183,0,0.1)', color: c.hasConsent ? '#00D478' : '#FFB700', border: `1px solid ${c.hasConsent ? 'rgba(0,212,120,0.3)' : 'rgba(255,183,0,0.25)'}` }}>
                                                {c.hasConsent ? 'Consented' : 'No consent'}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                            {/* Non-consented warning */}
                            {nonConsentedSelected.length > 0 && (
                                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', background: 'rgba(255,183,0,0.07)', border: '1px solid rgba(255,183,0,0.25)', borderRadius: 10, padding: '10px 12px' }}>
                                    <AlertTriangle size={14} color="#FFB700" style={{ flexShrink: 0, marginTop: 1 }} />
                                    <p style={{ ...S, fontSize: 12, color: '#FFB700', margin: 0 }}><strong>{nonConsentedSelected.length}</strong> recipient{nonConsentedSelected.length > 1 ? 's' : ''} have not given SMS marketing consent. You are responsible for compliance.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* STEP 3 — Review */}
                    {step === 3 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 20 }}>
                            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 14 }}>
                                <p style={{ ...S, fontSize: 10, color: '#555', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Campaign</p>
                                <p style={{ ...S, fontWeight: 700, color: '#fff', fontSize: 15, margin: 0 }}>{name}</p>
                            </div>
                            <div style={{ background: 'rgba(255,45,120,0.06)', border: '1px solid rgba(255,45,120,0.15)', borderRadius: 12, padding: 14 }}>
                                <p style={{ ...S, fontSize: 10, color: '#FF2D78', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>Message ({chars} chars · {segments} segment{segments > 1 ? 's' : ''})</p>
                                <p style={{ ...S, fontSize: 13, color: '#ddd', lineHeight: 1.55, margin: 0, whiteSpace: 'pre-wrap' }}>{message}</p>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                {[
                                    { label: 'Total Recipients', val: selectedContacts.length, color: '#fff' },
                                    { label: 'SMS Consented', val: selectedContacts.filter(c => c.hasConsent).length, color: '#00D478' },
                                    { label: 'No Consent', val: nonConsentedSelected.length, color: nonConsentedSelected.length > 0 ? '#FFB700' : '#555' },
                                    { label: 'Est. Segments', val: segments * selectedContacts.length, color: '#888' },
                                ].map(({ label, val, color }) => (
                                    <div key={label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '12px 14px' }}>
                                        <p style={{ ...S, color: '#555', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 4 }}>{label}</p>
                                        <p style={{ ...S, fontWeight: 700, color, fontSize: 22, margin: 0 }}>{val}</p>
                                    </div>
                                ))}
                            </div>
                            {nonConsentedSelected.length > 0 && (
                                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', background: 'rgba(255,183,0,0.07)', border: '1px solid rgba(255,183,0,0.25)', borderRadius: 10, padding: '10px 12px' }}>
                                    <AlertTriangle size={14} color="#FFB700" style={{ flexShrink: 0, marginTop: 1 }} />
                                    <p style={{ ...S, fontSize: 12, color: '#FFB700', margin: 0 }}>Sending to <strong>{nonConsentedSelected.length}</strong> non-consented recipient{nonConsentedSelected.length > 1 ? 's' : ''}. Ensure you have a lawful basis to contact them.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer nav */}
                <div style={{ padding: '14px 20px 20px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 8, flexShrink: 0 }}>
                    {step > 1 && (
                        <button onClick={() => setStep(s => (s - 1) as any)} style={{ ...S, flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '11px', cursor: 'pointer', color: '#888', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                            <ChevronLeft size={14} /> Back
                        </button>
                    )}
                    {step < 3 ? (
                        <button
                            disabled={step === 1 ? (!name.trim() || !message.trim()) : selected.size === 0}
                            onClick={() => setStep(s => (s + 1) as any)}
                            style={{ ...S, flex: 2, background: (step === 1 ? (!name.trim() || !message.trim()) : selected.size === 0) ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg,#FF2D78,#7928CA)', border: 'none', borderRadius: 10, padding: '11px', cursor: (step === 1 ? (!name.trim() || !message.trim()) : selected.size === 0) ? 'not-allowed' : 'pointer', color: (step === 1 ? (!name.trim() || !message.trim()) : selected.size === 0) ? '#444' : '#fff', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all 0.2s' }}>
                            Next <ChevronRight size={14} />
                        </button>
                    ) : (
                        <button onClick={doCreate} disabled={sending} style={{ ...S, flex: 2, background: sending ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg,#FF2D78,#7928CA)', border: 'none', borderRadius: 10, padding: '11px', cursor: sending ? 'not-allowed' : 'pointer', color: sending ? '#444' : '#fff', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                            <Send size={14} /> {sending ? 'Sending…' : `Send to ${selectedContacts.length} people`}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
