'use client';

import { useState, useEffect } from 'react';
import { Trash2, AlertTriangle, User as UserIcon, MessageCircle } from 'lucide-react';

type ChatMessage = {
  id: string;
  role: string;
  content: string;
  createdAt: string;
};

type ChatConversation = {
  id: string;
  guestName: string | null;
  startedAt: string;
  updatedAt: string;
  user: { name: string; email: string } | null;
  messages: ChatMessage[];
};

export default function AdminChatsPage() {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      const res = await fetch('/api/admin/chats');
      const data = await res.json();
      if (res.ok) setConversations(data.conversations || []);
    } catch (error) {
      console.error('Failed to fetch chats', error);
      alert('Failed to load chats');
    } finally {
      setLoading(false);
    }
  };

  const deleteConversation = async (id: string) => {
    if (!confirm('Are you sure you want to delete this conversation?')) return;
    
    try {
      const res = await fetch('/api/admin/chats', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: id })
      });

      if (res.ok) {
        alert('Conversation deleted');
        setConversations(prev => prev.filter(c => c.id !== id));
      } else {
        alert('Failed to delete');
      }
    } catch (error) {
      alert('Failed to delete');
    }
  };

  if (loading) return <div style={{ color: '#fff' }}>Loading chats...</div>;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', fontFamily: 'Poppins, sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MessageCircle color="#FF2D78" /> Hello Kitty Logs
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(255, 183, 0, 0.1)', padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(255, 183, 0, 0.2)' }}>
          <AlertTriangle size={16} color="#ffb700" />
          <span style={{ fontSize: '12px', color: '#ffb700', fontWeight: 500 }}>Internal view only</span>
        </div>
      </div>

      {conversations.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.1)' }}>
          <p style={{ color: '#999', fontSize: '15px' }}>No conversations logged yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {conversations.map(conv => (
            <div key={conv.id} style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', overflow: 'hidden' }}>
              
              {/* Header */}
              <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: 'rgba(255,45,120,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FF2D78' }}>
                    <UserIcon size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>
                      {conv.user ? conv.user.name : (conv.guestName || 'Anonymous Guest')}
                      {conv.user && <span style={{ marginLeft: '8px', fontSize: '11px', color: '#888', fontWeight: 400 }}>{conv.user.email}</span>}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                      {new Date(conv.updatedAt).toLocaleString()}
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={() => deleteConversation(conv.id)}
                  style={{ background: 'rgba(255, 60, 60, 0.1)', border: 'none', color: '#ff4444', padding: '8px', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s' }}
                  title="Delete conversation"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Messages */}
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '400px', overflowY: 'auto' }}>
                {conv.messages.length === 0 ? (
                  <div style={{ color: '#555', fontSize: '13px', fontStyle: 'italic' }}>No messages recorded in this session.</div>
                ) : (
                  conv.messages.map(msg => (
                    <div key={msg.id} style={{ 
                      maxWidth: '85%', 
                      alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                      backgroundColor: msg.role === 'user' ? 'rgba(255,45,120,0.1)' : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${msg.role === 'user' ? 'rgba(255,45,120,0.2)' : 'rgba(255,255,255,0.05)'}`,
                      borderRadius: '12px',
                      borderBottomRightRadius: msg.role === 'user' ? '4px' : '12px',
                      borderBottomLeftRadius: msg.role === 'assistant' ? '4px' : '12px',
                      padding: '12px 16px'
                    }}>
                      <div style={{ fontSize: '10px', color: msg.role === 'user' ? '#FF2D78' : '#888', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>
                        {msg.role}
                      </div>
                      <div style={{ fontSize: '14px', color: '#eaeaea', lineHeight: 1.5 }}>
                        {msg.content}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
