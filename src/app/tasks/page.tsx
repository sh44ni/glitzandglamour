'use client';

import { useEffect, useState, useRef } from 'react';

/* ─────────────────── Types ─────────────────── */
type Priority = 'LOW' | 'MEDIUM' | 'HIGH';
type Status = 'TODO' | 'IN_PROGRESS' | 'DONE';

type TaskUpdate = {
  id: string;
  note: string;
  createdAt: string;
};

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: Status;
  priority: Priority;
  createdAt: string;
  updatedAt: string;
  updates: TaskUpdate[];
};

/* ─────────────────── Helpers ─────────────────── */
const PRIORITY_META: Record<Priority, { label: string; color: string; bg: string }> = {
  LOW:    { label: 'Low',    color: '#4ADE80', bg: 'rgba(74,222,128,0.1)' },
  MEDIUM: { label: 'Medium', color: '#FBBF24', bg: 'rgba(251,191,36,0.1)' },
  HIGH:   { label: 'High',   color: '#FF2D78', bg: 'rgba(255,45,120,0.1)' },
};

const STATUS_META: Record<Status, { label: string; color: string; border: string; glow: string }> = {
  TODO:        { label: 'To Do',       color: '#94A3B8', border: 'rgba(148,163,184,0.2)', glow: 'rgba(148,163,184,0.1)' },
  IN_PROGRESS: { label: 'In Progress', color: '#FBBF24', border: 'rgba(251,191,36,0.2)',  glow: 'rgba(251,191,36,0.08)' },
  DONE:        { label: 'Done',        color: '#4ADE80', border: 'rgba(74,222,128,0.2)',  glow: 'rgba(74,222,128,0.08)' },
};

function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  });
}

const COLUMNS: { status: Status; icon: string }[] = [
  { status: 'TODO',        icon: '○' },
  { status: 'IN_PROGRESS', icon: '◑' },
  { status: 'DONE',        icon: '●' },
];

async function uploadMedia(file: File) {
  const fd = new FormData();
  fd.append('file', file);
  const r = await fetch('/api/upload', { method: 'POST', body: fd });
  if (!r.ok) throw new Error('Upload failed');
  const d = await r.json();
  return d.url;
}

function parseTextWithMedia(text: string) {
  const parts = text.split(/(\[MEDIA:\s*.*?\])/g);
  return parts.map((part, i) => {
    if (part.startsWith('[MEDIA:') && part.endsWith(']')) {
      const url = part.slice(7, -1).trim();
      return (
        <a key={i} href={url} target="_blank" rel="noopener noreferrer" style={{ display: 'block', margin: '8px 0' }} onClick={(e) => e.stopPropagation()}>
          <img src={url} alt="Attachment" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px', border: '1px solid rgba(255,45,120,0.1)' }} />
        </a>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

/* ─────────────────── Main Page ─────────────────── */
export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Task | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [panelAnim, setPanelAnim] = useState(false);

  // Add-task form state
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState<Priority>('MEDIUM');
  const [adding, setAdding] = useState(false);

  // Detail panel state
  const [noteText, setNoteText] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [changingStatus, setChangingStatus] = useState<Status | null>(null);
  const [deleting, setDeleting] = useState(false);
  const noteRef = useRef<HTMLTextAreaElement>(null);

  async function fetchTasks() {
    try {
      const r = await fetch('/api/tasks');
      const d = await r.json();
      setTasks(d.tasks || []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }

  useEffect(() => { fetchTasks(); }, []);

  // Open panel with animation
  function openTask(task: Task) {
    setSelected(task);
    setNoteText('');
    setPanelAnim(false);
    setTimeout(() => setPanelAnim(true), 10);
  }

  async function handleAddTask(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setAdding(true);
    try {
      const r = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle, description: newDesc, priority: newPriority }),
      });
      const d = await r.json();
      setTasks(prev => [d.task, ...prev]);
      setNewTitle(''); setNewDesc(''); setNewPriority('MEDIUM');
      setShowAdd(false);
    } finally { setAdding(false); }
  }

  async function handleStatusChange(task: Task, status: Status) {
    setChangingStatus(status);
    try {
      const r = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const d = await r.json();
      setTasks(prev => prev.map(t => t.id === d.task.id ? d.task : t));
      setSelected(d.task);
    } finally { setChangingStatus(null); }
  }

  async function handleAddNote(task: Task) {
    if (!noteText.trim()) return;
    setSavingNote(true);
    try {
      const r = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: noteText }),
      });
      const d = await r.json();
      setTasks(prev => prev.map(t => t.id === d.task.id ? d.task : t));
      setSelected(d.task);
      setNoteText('');
    } finally { setSavingNote(false); }
  }

  async function handleDelete(task: Task) {
    if (!confirm(`Delete "${task.title}"?`)) return;
    setDeleting(true);
    try {
      await fetch(`/api/tasks/${task.id}`, { method: 'DELETE' });
      setTasks(prev => prev.filter(t => t.id !== task.id));
      setSelected(null);
    } finally { setDeleting(false); }
  }

  const tasksByStatus = (status: Status) => tasks.filter(t => t.status === status);

  return (
    <div style={{ minHeight: '100dvh', background: '#080810', fontFamily: 'Poppins, system-ui, sans-serif', color: '#E2E8F0' }}>

      {/* Google font */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,45,120,0.3); border-radius: 4px; }

        .task-card {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          padding: 16px;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.175,0.885,0.32,1.1);
          position: relative;
          overflow: hidden;
        }
        .task-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 50% 0%, rgba(255,45,120,0.06), transparent 70%);
          opacity: 0;
          transition: opacity 0.3s;
        }
        .task-card:hover { transform: translateY(-3px); border-color: rgba(255,45,120,0.2); box-shadow: 0 12px 32px rgba(0,0,0,0.4); }
        .task-card:hover::before { opacity: 1; }
        .task-card.selected { border-color: rgba(255,45,120,0.35); box-shadow: 0 0 0 1px rgba(255,45,120,0.15), 0 16px 40px rgba(0,0,0,0.5); }

        .col-header {
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 16px; padding-bottom: 14px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .btn-primary {
          background: linear-gradient(135deg, #FF2D78, #FF6BA8);
          border: none; border-radius: 12px; color: #fff;
          font-family: Poppins, sans-serif; font-weight: 600; font-size: 13px;
          padding: 10px 18px; cursor: pointer;
          transition: all 0.2s; box-shadow: 0 4px 16px rgba(255,45,120,0.35);
          display: inline-flex; align-items: center; gap: 6px;
        }
        .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(255,45,120,0.45); }
        .btn-primary:disabled { opacity: 0.6; transform: none; cursor: not-allowed; }
        .btn-ghost {
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px; color: #94A3B8;
          font-family: Poppins, sans-serif; font-size: 13px; font-weight: 500;
          padding: 8px 14px; cursor: pointer; transition: all 0.2s;
        }
        .btn-ghost:hover { border-color: rgba(255,45,120,0.25); color: #FF2D78; }

        .status-btn {
          flex: 1; padding: 9px 8px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.03); font-family: Poppins, sans-serif;
          font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s;
          display: flex; align-items: center; justify-content: center; gap: 5px;
        }

        .inp {
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px; color: #E2E8F0; font-family: Poppins, sans-serif; font-size: 13px;
          padding: 11px 14px; outline: none; width: 100%; transition: border-color 0.2s;
        }
        .inp:focus { border-color: rgba(255,45,120,0.4); box-shadow: 0 0 0 3px rgba(255,45,120,0.08); }
        .inp::placeholder { color: #475569; }

        textarea.inp { resize: vertical; min-height: 80px; }

        .panel-slide {
          transform: translateX(100%); transition: transform 0.38s cubic-bezier(0.16,1,0.3,1);
        }
        .panel-slide.open { transform: translateX(0); }

        .modal-backdrop {
          position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(8px);
          z-index: 50; display: flex; align-items: center; justify-content: center; padding: 20px;
          animation: fadeIn 0.2s ease;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.94); } to { opacity: 1; transform: scale(1); } }

        .badge {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 600;
        }

        .log-dot {
          width: 8px; height: 8px; background: rgba(255,45,120,0.5);
          border-radius: 50%; flex-shrink: 0; margin-top: 6px;
          box-shadow: 0 0 6px rgba(255,45,120,0.4);
        }

        .priority-chip {
          padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 600;
          display: inline-flex; align-items: center; gap: 4px;
        }

        @media (max-width: 768px) {
          .board { grid-template-columns: 1fr !important; }
          .panel-wrap { width: 100% !important; }
        }
      `}</style>

      {/* ── Top Bar ── */}
      <header style={{
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        padding: '0 clamp(16px,4vw,32px)',
        height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(8,8,16,0.9)', backdropFilter: 'blur(20px)',
        position: 'sticky', top: 0, zIndex: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Logo mark */}
          <div style={{
            width: 32, height: 32, borderRadius: '10px',
            background: 'linear-gradient(135deg, #FF2D78, #FF6BA8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '16px', boxShadow: '0 4px 12px rgba(255,45,120,0.4)',
          }}>✦</div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#fff', letterSpacing: '-0.3px' }}>Task Board</div>
            <div style={{ fontSize: '10px', color: '#475569', fontWeight: 500, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Glitz &amp; Glamour Dev</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ fontSize: '12px', color: '#475569' }}>
            {tasks.length} task{tasks.length !== 1 ? 's' : ''}
          </div>
          <button className="btn-primary" onClick={() => setShowAdd(true)}>
            <span style={{ fontSize: '16px' }}>+</span> New Task
          </button>
        </div>
      </header>

      {/* ── Board + Panel ── */}
      <div style={{ display: 'flex', height: 'calc(100dvh - 60px)', overflow: 'hidden' }}>

        {/* Board */}
        <div style={{
          flex: 1, overflowY: 'auto', overflowX: 'hidden',
          padding: 'clamp(16px,3vw,28px)',
        }}>
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '20px' }}>
              {[0,1,2].map(i => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '20px', padding: '20px', height: '280px', animation: 'pulse 1.5s ease-in-out infinite' }} />
              ))}
            </div>
          ) : (
            <div className="board" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '20px', alignItems: 'start' }}>
              {COLUMNS.map(col => {
                const m = STATUS_META[col.status];
                const colTasks = tasksByStatus(col.status);
                return (
                  <div key={col.status} style={{
                    background: `rgba(255,255,255,0.015)`,
                    borderRadius: '20px', padding: '20px',
                    border: `1px solid ${m.border}`,
                    boxShadow: `inset 0 0 40px ${m.glow}`,
                    minHeight: '180px',
                  }}>
                    <div className="col-header">
                      <span style={{ fontSize: '18px', color: m.color }}>{col.icon}</span>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: m.color }}>{m.label}</span>
                      <span style={{
                        marginLeft: 'auto', background: m.glow, color: m.color,
                        border: `1px solid ${m.border}`, borderRadius: '999px',
                        padding: '1px 10px', fontSize: '11px', fontWeight: 700,
                      }}>{colTasks.length}</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {colTasks.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '30px 0', color: '#334155', fontSize: '13px' }}>
                          No tasks here
                        </div>
                      )}
                      {colTasks.map(task => {
                        const pm = PRIORITY_META[task.priority];
                        const isSelected = selected?.id === task.id;
                        return (
                          <div
                            key={task.id}
                            className={`task-card ${isSelected ? 'selected' : ''}`}
                            onClick={() => openTask(task)}
                          >
                            {/* Priority bar */}
                            <div style={{
                              position: 'absolute', left: 0, top: 0, bottom: 0,
                              width: '3px', background: pm.color, borderRadius: '16px 0 0 16px', opacity: 0.8,
                            }} />

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                              <h3 style={{
                                fontSize: '13px', fontWeight: 600, color: task.status === 'DONE' ? '#475569' : '#E2E8F0',
                                lineHeight: 1.4, flex: 1,
                                textDecoration: task.status === 'DONE' ? 'line-through' : 'none',
                              }}>{task.title}</h3>
                              <span className="priority-chip" style={{ color: pm.color, background: pm.bg, flexShrink: 0 }}>
                                {pm.label}
                              </span>
                            </div>

                            {task.description && (
                              <p style={{ fontSize: '12px', color: '#64748B', lineHeight: 1.5, marginBottom: '10px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', whiteSpace: 'pre-wrap' }}>
                                {task.description.replace(/\[MEDIA:\s*.*?\]/g, '📎 [Image Attachment]')}
                              </p>
                            )}

                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                              <span style={{ fontSize: '11px', color: '#334155' }}>🕐 {timeAgo(task.createdAt)}</span>
                              {task.updates.length > 0 && (
                                <span style={{ fontSize: '11px', color: '#FF2D78', background: 'rgba(255,45,120,0.08)', padding: '2px 8px', borderRadius: '999px' }}>
                                  {task.updates.length} update{task.updates.length !== 1 ? 's' : ''}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Quick-add in column */}
                    <button
                      onClick={() => { setNewPriority('MEDIUM'); setShowAdd(true); }}
                      style={{
                        marginTop: '12px', width: '100%', background: 'transparent',
                        border: '1px dashed rgba(255,255,255,0.06)', borderRadius: '12px',
                        padding: '10px', color: '#334155', fontSize: '12px', cursor: 'pointer',
                        transition: 'all 0.2s', fontFamily: 'Poppins, sans-serif',
                      }}
                      onMouseOver={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,45,120,0.2)'; (e.currentTarget as HTMLElement).style.color = '#FF2D78'; }}
                      onMouseOut={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLElement).style.color = '#334155'; }}
                    >+ Add task</button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Detail Panel ── */}
        {selected && (
          <div
            className="panel-wrap"
            style={{
              width: 'min(420px, 100vw)',
              borderLeft: '1px solid rgba(255,255,255,0.06)',
              background: '#0D0D1A',
              overflowY: 'auto',
              flexShrink: 0,
              position: 'relative',
            }}
          >
            <div className={`panel-slide ${panelAnim ? 'open' : ''}`} style={{ padding: '24px', minHeight: '100%' }}>
              {/* Panel Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div>
                  <div style={{ fontSize: '10px', color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' }}>Task Detail</div>
                  <h2 style={{
                    fontSize: '16px', fontWeight: 700, color: selected.status === 'DONE' ? '#475569' : '#F1F5F9',
                    lineHeight: 1.4, textDecoration: selected.status === 'DONE' ? 'line-through' : 'none',
                    maxWidth: '280px',
                  }}>{selected.title}</h2>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '8px', width: '30px', height: '30px', cursor: 'pointer', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                >✕</button>
              </div>

              {/* Meta chips */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
                {(() => { const pm = PRIORITY_META[selected.priority]; return (
                  <span className="badge" style={{ color: pm.color, background: pm.bg, border: `1px solid ${pm.color}33` }}>
                    ◆ {pm.label} Priority
                  </span>
                ); })()}
                {(() => { const sm = STATUS_META[selected.status]; return (
                  <span className="badge" style={{ color: sm.color, background: sm.glow, border: `1px solid ${sm.border}` }}>
                    {selected.status === 'DONE' ? '● ' : selected.status === 'IN_PROGRESS' ? '◑ ' : '○ '}{sm.label}
                  </span>
                ); })()}
              </div>

              {selected.description && (
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '14px', marginBottom: '20px' }}>
                  <div style={{ fontSize: '13px', color: '#94A3B8', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                    {parseTextWithMedia(selected.description)}
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div style={{ display: 'grid', gap: '6px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', gap: '8px', fontSize: '12px' }}>
                  <span style={{ color: '#334155', minWidth: '80px' }}>Created</span>
                  <span style={{ color: '#94A3B8' }}>{fmtDate(selected.createdAt)}</span>
                </div>
                <div style={{ display: 'flex', gap: '8px', fontSize: '12px' }}>
                  <span style={{ color: '#334155', minWidth: '80px' }}>Updated</span>
                  <span style={{ color: '#94A3B8' }}>{fmtDate(selected.updatedAt)}</span>
                </div>
              </div>

              {/* ── Status Switcher ── */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '11px', color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '10px' }}>Change Status</div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {COLUMNS.map(col => {
                    const m = STATUS_META[col.status];
                    const isActive = selected.status === col.status;
                    const isLoading = changingStatus === col.status;
                    return (
                      <button
                        key={col.status}
                        className="status-btn"
                        disabled={isActive || !!changingStatus}
                        onClick={() => handleStatusChange(selected, col.status)}
                        style={{
                          color: isActive ? m.color : '#475569',
                          background: isActive ? m.glow : 'rgba(255,255,255,0.02)',
                          borderColor: isActive ? m.border : 'rgba(255,255,255,0.06)',
                          opacity: (!!changingStatus && !isActive) ? 0.5 : 1,
                        }}
                      >
                        <span>{col.icon}</span>
                        {isLoading ? '…' : m.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── Add Update Note ── */}
              <div style={{ marginBottom: '28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '10px' }}>
                  <div style={{ fontSize: '11px', color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.6px' }}>Log an Update</div>
                  <label style={{ fontSize: '10px', color: '#FF2D78', cursor: 'pointer', fontWeight: 600 }}>
                      + Attach Media
                      <input type="file" accept="image/*, .heic, .heif" hidden onChange={async e => {
                        if (e.target.files?.[0]) {
                          try {
                            const url = await uploadMedia(e.target.files[0]);
                            setNoteText(prev => prev + (prev ? '\n' : '') + `[MEDIA: ${url}]`);
                          } catch (err) { alert('Upload failed'); }
                        }
                      }} />
                  </label>
                </div>
                <textarea
                  ref={noteRef}
                  className="inp"
                  rows={3}
                  placeholder="What changed? What's the progress?…"
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleAddNote(selected); }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                  <button
                    className="btn-primary"
                    onClick={() => handleAddNote(selected)}
                    disabled={savingNote || !noteText.trim()}
                    style={{ fontSize: '12px', padding: '8px 16px' }}
                  >{savingNote ? 'Logging…' : 'Log Update'}</button>
                </div>
              </div>

              {/* ── Update Timeline ── */}
              {selected.updates.length > 0 && (
                <div style={{ marginBottom: '28px' }}>
                  <div style={{ fontSize: '11px', color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '14px' }}>
                    Update Log · {selected.updates.length}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                    {selected.updates.map((upd, i) => (
                      <div key={upd.id} style={{ display: 'flex', gap: '12px', paddingBottom: i < selected.updates.length - 1 ? '18px' : '0', position: 'relative' }}>
                        {/* Timeline line */}
                        {i < selected.updates.length - 1 && (
                          <div style={{
                            position: 'absolute', left: '3px', top: '16px', bottom: 0,
                            width: '1px', background: 'linear-gradient(to bottom, rgba(255,45,120,0.3), transparent)',
                          }} />
                        )}
                        <div className="log-dot" />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '11px', color: '#475569', marginBottom: '4px' }}>
                            {fmtDate(upd.createdAt)} · <span style={{ color: '#334155' }}>{timeAgo(upd.createdAt)}</span>
                          </div>
                          <div style={{
                            fontSize: '13px', color: '#94A3B8', lineHeight: 1.55,
                            background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)',
                            borderRadius: '10px', padding: '10px 12px', whiteSpace: 'pre-wrap'
                          }}>
                            {parseTextWithMedia(upd.note)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Delete ── */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px' }}>
                <button
                  onClick={() => handleDelete(selected)}
                  disabled={deleting}
                  style={{
                    background: 'transparent', border: '1px solid rgba(255,60,60,0.2)',
                    color: '#ef4444', borderRadius: '10px', padding: '9px 16px',
                    fontFamily: 'Poppins, sans-serif', fontSize: '12px', fontWeight: 600,
                    cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '6px',
                  }}
                  onMouseOver={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.1)'; }}
                  onMouseOut={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  🗑 {deleting ? 'Deleting…' : 'Delete Task'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Add Task Modal ── */}
      {showAdd && (
        <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) setShowAdd(false); }}>
          <div style={{
            background: '#0D0D1A', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '24px', padding: '28px', width: '100%', maxWidth: '480px',
            animation: 'scaleIn 0.25s cubic-bezier(0.175,0.885,0.32,1.1)',
            boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,45,120,0.05)',
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#F1F5F9' }}>New Task</h2>
                <p style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>Track a new development task</p>
              </div>
              <button onClick={() => setShowAdd(false)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', color: '#64748B', fontSize: '16px' }}>✕</button>
            </div>

            <form onSubmit={handleAddTask}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.6px', display: 'block', marginBottom: '7px' }}>Title *</label>
                  <input
                    autoFocus
                    className="inp"
                    placeholder="What needs to be done?"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '7px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Description</label>
                    <label style={{ fontSize: '11px', color: '#FF2D78', cursor: 'pointer', fontWeight: 600 }}>
                      + Attach Media
                      <input type="file" accept="image/*, .heic, .heif" hidden onChange={async e => {
                        if (e.target.files?.[0]) {
                          try {
                            const url = await uploadMedia(e.target.files[0]);
                            setNewDesc(prev => prev + (prev ? '\n' : '') + `[MEDIA: ${url}]`);
                          } catch (err) { alert('Upload failed'); }
                        }
                      }} />
                    </label>
                  </div>
                  <textarea
                    className="inp"
                    placeholder="Any extra context or details…"
                    value={newDesc}
                    onChange={e => setNewDesc(e.target.value)}
                    rows={3}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.6px', display: 'block', marginBottom: '10px' }}>Priority</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {(['LOW', 'MEDIUM', 'HIGH'] as Priority[]).map(p => {
                      const pm = PRIORITY_META[p];
                      const active = newPriority === p;
                      return (
                        <button
                          key={p} type="button"
                          onClick={() => setNewPriority(p)}
                          style={{
                            flex: 1, padding: '9px', borderRadius: '10px', border: `1px solid ${active ? pm.color + '55' : 'rgba(255,255,255,0.07)'}`,
                            background: active ? pm.bg : 'rgba(255,255,255,0.02)',
                            color: active ? pm.color : '#475569',
                            fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '12px',
                            cursor: 'pointer', transition: 'all 0.2s',
                          }}
                        >{pm.label}</button>
                      );
                    })}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                  <button type="button" className="btn-ghost" onClick={() => setShowAdd(false)} style={{ flex: 1 }}>Cancel</button>
                  <button type="submit" className="btn-primary" disabled={adding || !newTitle.trim()} style={{ flex: 2 }}>
                    {adding ? 'Creating…' : '✦ Create Task'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
