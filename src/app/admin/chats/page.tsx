'use client';

import { useState, useEffect, useRef } from 'react';
import { Trash2, AlertTriangle, User as UserIcon, MessageCircle, Search, ArrowLeft, Calendar, Tag, Filter } from 'lucide-react';

type ChatMessage = {
  id: string;
  role: string;
  content: string;
  createdAt: string;
};

type ChatConversation = {
  id: string;
  guestName: string | null;
  label: string | null;
  hasBooking: boolean;
  startedAt: string;
  updatedAt: string;
  user: { name: string; email: string } | null;
  messages: ChatMessage[];
};

export default function AdminChatsPage() {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterBooking, setFilterBooking] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const threadEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fetchChats(); }, [page, filterBooking]);

  const fetchChats = async (q?: string) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set('page', String(page));
      if (q ?? search) params.set('q', q ?? search);
      if (filterBooking) params.set('booking', '1');
      const res = await fetch(`/api/admin/chats?${params}`);
      const data = await res.json();
      if (res.ok) {
        setConversations(data.conversations || []);
        setTotalPages(data.totalPages || 1);
      }
    } catch { alert('Failed to load chats'); }
    finally { setLoading(false); }
  };

  const handleSearch = () => { setPage(1); fetchChats(search); };

  const deleteConversation = async (id: string) => {
    if (!confirm('Delete this conversation?')) return;
    try {
      const res = await fetch('/api/admin/chats', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: id }),
      });
      if (res.ok) {
        setConversations(prev => prev.filter(c => c.id !== id));
        if (selectedId === id) setSelectedId(null);
      } else alert('Failed to delete');
    } catch { alert('Failed to delete'); }
  };

  const selected = conversations.find(c => c.id === selectedId);

  useEffect(() => {
    if (selected) threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedId, selected]);

  const getName = (c: ChatConversation) => c.user?.name || c.guestName || 'Anonymous Guest';
  const getPreview = (c: ChatConversation) => {
    const last = c.messages[c.messages.length - 1];
    if (!last) return 'No messages';
    const prefix = last.role === 'user' ? 'You: ' : '';
    const text = last.content.length > 60 ? last.content.slice(0, 60) + '…' : last.content;
    return prefix + text;
  };

  const relTime = (d: string) => {
    const diff = (Date.now() - new Date(d).getTime()) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const fmtFull = (d: string) => new Date(d).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
  });

  // ── Styles ─────────────────────────────────────────────────────────
  const S = {
    wrap: { display: 'flex', height: 'calc(100vh - 100px)', fontFamily: 'Poppins, sans-serif', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' } as React.CSSProperties,
    listPanel: { width: '340px', flexShrink: 0, borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', background: 'rgba(0,0,0,0.15)' } as React.CSSProperties,
    listHeader: { padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)' } as React.CSSProperties,
    searchWrap: { display: 'flex', gap: '6px', marginTop: '12px' } as React.CSSProperties,
    searchInput: { flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '8px 12px', color: '#fff', fontSize: '13px', fontFamily: 'Poppins, sans-serif', outline: 'none' } as React.CSSProperties,
    searchBtn: { background: 'rgba(255,45,120,0.1)', border: '1px solid rgba(255,45,120,0.2)', borderRadius: '10px', padding: '8px', cursor: 'pointer', color: '#FF2D78', display: 'flex', alignItems: 'center' } as React.CSSProperties,
    filterBtn: (active: boolean) => ({ background: active ? 'rgba(255,45,120,0.15)' : 'rgba(255,255,255,0.04)', border: `1px solid ${active ? 'rgba(255,45,120,0.3)' : 'rgba(255,255,255,0.08)'}`, borderRadius: '8px', padding: '6px 10px', cursor: 'pointer', color: active ? '#FF2D78' : '#888', fontSize: '11px', fontFamily: 'Poppins, sans-serif', fontWeight: active ? 600 : 400, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px' }) as React.CSSProperties,
    list: { flex: 1, overflowY: 'auto' } as React.CSSProperties,
    convItem: (active: boolean) => ({ display: 'flex', gap: '10px', padding: '14px 16px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.04)', background: active ? 'rgba(255,45,120,0.08)' : 'transparent', borderLeft: active ? '3px solid #FF2D78' : '3px solid transparent', transition: 'all .15s' }) as React.CSSProperties,
    avatar: { width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,45,120,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#FF2D78' } as React.CSSProperties,
    convName: { fontSize: '13px', fontWeight: 600, color: '#fff', margin: 0 } as React.CSSProperties,
    convPreview: { fontSize: '12px', color: '#666', margin: '2px 0 0', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' } as React.CSSProperties,
    convTime: { fontSize: '10px', color: '#555', marginLeft: 'auto', flexShrink: 0, whiteSpace: 'nowrap' } as React.CSSProperties,
    label: { fontSize: '10px', background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)', padding: '1px 8px', borderRadius: '10px', fontWeight: 600, marginTop: '4px', display: 'inline-block' } as React.CSSProperties,
    threadPanel: { flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 } as React.CSSProperties,
    threadHeader: { padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)' } as React.CSSProperties,
    threadBody: { flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' } as React.CSSProperties,
    msgBubble: (isUser: boolean) => ({ maxWidth: '75%', alignSelf: isUser ? 'flex-end' : 'flex-start', background: isUser ? 'rgba(255,45,120,0.12)' : 'rgba(255,255,255,0.05)', border: `1px solid ${isUser ? 'rgba(255,45,120,0.2)' : 'rgba(255,255,255,0.06)'}`, borderRadius: '14px', borderBottomRightRadius: isUser ? '4px' : '14px', borderBottomLeftRadius: isUser ? '14px' : '4px', padding: '10px 14px' }) as React.CSSProperties,
    msgRole: (isUser: boolean) => ({ fontSize: '10px', color: isUser ? '#FF2D78' : '#888', marginBottom: '3px', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px' }) as React.CSSProperties,
    msgText: { fontSize: '13.5px', color: '#eaeaea', lineHeight: 1.55, whiteSpace: 'pre-wrap', wordBreak: 'break-word' } as React.CSSProperties,
    msgTime: { fontSize: '10px', color: '#444', marginTop: '4px' } as React.CSSProperties,
    empty: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', fontSize: '14px', flexDirection: 'column', gap: '12px' } as React.CSSProperties,
    delBtn: { background: 'rgba(255,60,60,0.1)', border: 'none', color: '#ff4444', padding: '8px', borderRadius: '8px', cursor: 'pointer' } as React.CSSProperties,
    pager: { display: 'flex', justifyContent: 'center', gap: '8px', padding: '12px', borderTop: '1px solid rgba(255,255,255,0.06)' } as React.CSSProperties,
    pageBtn: (disabled: boolean) => ({ background: disabled ? 'rgba(255,255,255,0.02)' : 'rgba(255,45,120,0.1)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '6px 14px', cursor: disabled ? 'default' : 'pointer', color: disabled ? '#444' : '#FF2D78', fontSize: '12px', fontFamily: 'Poppins, sans-serif', fontWeight: 500 }) as React.CSSProperties,
  };

  // ── Mobile: if a conversation is selected, show thread only ────────
  const mobileSelected = typeof window !== 'undefined' && window.innerWidth < 768 && selectedId;

  return (
    <>
      <style>{`
        @media(max-width:767px){
          .ac-list-panel{width:100%!important;border-right:none!important;display:${mobileSelected ? 'none' : 'flex'}!important}
          .ac-thread-panel{display:${mobileSelected ? 'flex' : 'none'}!important}
          .ac-wrap{height:calc(100vh - 80px)!important}
          .ac-back-btn{display:flex!important}
        }
        @media(min-width:768px){.ac-back-btn{display:none!important}}
      `}</style>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 600, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'Poppins, sans-serif' }}>
          <MessageCircle color="#FF2D78" size={22} /> Hello Kitty Logs
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(255,183,0,0.1)', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(255,183,0,0.2)' }}>
          <AlertTriangle size={14} color="#ffb700" />
          <span style={{ fontSize: '11px', color: '#ffb700', fontWeight: 500, fontFamily: 'Poppins, sans-serif' }}>Internal only</span>
        </div>
      </div>

      <div className="ac-wrap" style={S.wrap}>
        {/* ── Left: Conversation List ── */}
        <div className="ac-list-panel" style={S.listPanel}>
          <div style={S.listHeader}>
            <div style={S.searchWrap}>
              <input
                style={S.searchInput}
                placeholder="Search by name or email…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
              />
              <button style={S.searchBtn} onClick={handleSearch}><Search size={16} /></button>
            </div>
            <button style={S.filterBtn(filterBooking)} onClick={() => { setFilterBooking(!filterBooking); setPage(1); }}>
              <Filter size={12} /> {filterBooking ? 'Showing bookings only' : 'Filter: has booking'}
            </button>
          </div>

          <div style={S.list}>
            {loading ? (
              <div style={{ ...S.empty, height: '200px' } as React.CSSProperties}>Loading…</div>
            ) : conversations.length === 0 ? (
              <div style={{ ...S.empty, height: '200px' } as React.CSSProperties}>
                <MessageCircle size={32} color="#333" />
                No conversations found
              </div>
            ) : (
              conversations.map(c => (
                <div key={c.id} style={S.convItem(selectedId === c.id)} onClick={() => setSelectedId(c.id)}>
                  <div style={S.avatar}><UserIcon size={18} /></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <p style={S.convName}>{getName(c)}</p>
                      {c.hasBooking && <span style={{ fontSize: '10px', color: '#22c55e' }}>🎯</span>}
                    </div>
                    <p style={S.convPreview as React.CSSProperties}>{getPreview(c)}</p>
                    {c.label && <span style={S.label}><Tag size={9} style={{ marginRight: '3px' }} />{c.label}</span>}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    <span style={S.convTime as React.CSSProperties}>{relTime(c.updatedAt)}</span>
                    <span style={{ fontSize: '10px', color: '#444' }}>{c.messages.length} msg</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {totalPages > 1 && (
            <div style={S.pager}>
              <button style={S.pageBtn(page <= 1)} onClick={() => page > 1 && setPage(page - 1)} disabled={page <= 1}>← Prev</button>
              <span style={{ fontSize: '12px', color: '#666', alignSelf: 'center', fontFamily: 'Poppins, sans-serif' }}>{page}/{totalPages}</span>
              <button style={S.pageBtn(page >= totalPages)} onClick={() => page < totalPages && setPage(page + 1)} disabled={page >= totalPages}>Next →</button>
            </div>
          )}
        </div>

        {/* ── Right: Thread View ── */}
        <div className="ac-thread-panel" style={S.threadPanel}>
          {!selected ? (
            <div style={S.empty as React.CSSProperties}>
              <MessageCircle size={48} color="#222" />
              <span>Select a conversation</span>
            </div>
          ) : (
            <>
              <div style={S.threadHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button className="ac-back-btn" onClick={() => setSelectedId(null)} style={{ background: 'none', border: 'none', color: '#FF2D78', cursor: 'pointer', padding: '4px' }}>
                    <ArrowLeft size={20} />
                  </button>
                  <div style={S.avatar}><UserIcon size={18} /></div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>
                      {getName(selected)}
                      {selected.user && <span style={{ marginLeft: '8px', fontSize: '11px', color: '#666', fontWeight: 400 }}>{selected.user.email}</span>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#555', marginTop: '2px' }}>
                      <Calendar size={11} /> {fmtFull(selected.startedAt)}
                      {selected.label && <span style={{ ...S.label, marginTop: 0 }}>{selected.label}</span>}
                    </div>
                  </div>
                </div>
                <button style={S.delBtn} onClick={() => deleteConversation(selected.id)} title="Delete">
                  <Trash2 size={16} />
                </button>
              </div>

              <div style={S.threadBody as React.CSSProperties}>
                {selected.messages.length === 0 ? (
                  <div style={{ color: '#555', fontSize: '13px', fontStyle: 'italic', textAlign: 'center', marginTop: '40px' }}>No messages recorded</div>
                ) : (
                  selected.messages.map(msg => {
                    const isUser = msg.role === 'user';
                    return (
                      <div key={msg.id} style={S.msgBubble(isUser)}>
                        <div style={S.msgRole(isUser) as React.CSSProperties}>{msg.role}</div>
                        <div style={S.msgText as React.CSSProperties}>{msg.content}</div>
                        <div style={S.msgTime}>{fmtFull(msg.createdAt)}</div>
                      </div>
                    );
                  })
                )}
                <div ref={threadEndRef} />
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
