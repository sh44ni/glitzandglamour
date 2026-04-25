'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Lock, Bold, Italic, Link as LinkIcon, CheckCircle2, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function NoremailComposerPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [error, setError] = useState('');
  
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [html, setHtml] = useState('');
  
  const [activeTab, setActiveTab] = useState<'source'|'preview'>('source');
  
  const [isSending, setIsSending] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Check admin session on load
  useEffect(() => {
    fetch('/api/admin/auth', { method: 'GET' })
      .then(r => {
        // Admin auth GET doesn't exist — check by attempting to load an admin-only resource
        // We'll check the admin_session cookie exists (the API will validate it)
        setIsAuthenticated(document.cookie.includes('admin_session'));
        setIsChecking(false);
      })
      .catch(() => {
        setIsAuthenticated(document.cookie.includes('admin_session'));
        setIsChecking(false);
      });
  }, []);

  const insertTag = (openTag: string, closeTag: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = html.substring(start, end);
    const newText = html.substring(0, start) + openTag + selectedText + closeTag + html.substring(end);
    
    setHtml(newText);
    
    // Reset focus and selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + openTag.length, end + openTag.length);
    }, 0);
  };

  const handleInsertLink = () => {
    const url = prompt('Enter the full URL (e.g., https://google.com):');
    if (url) {
      insertTag(`<a href="${url}" style="color: #FF2D78; text-decoration: underline;">`, '</a>');
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!to || !subject || !html) {
      setError('Please fill out all fields.');
      return;
    }

    setIsSending(true);
    setError('');
    setSuccessMessage('');

    try {
      const res = await fetch('/api/noremail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, subject, html })
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMessage('Email sent successfully! 📧');
        setTo('');
        setSubject('');
        setHtml('');
      } else {
        setError(data.error || 'Failed to send email.');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setIsSending(false);
    }
  };


  const inputStyle = {
    width: '100%', padding: '14px', borderRadius: '12px',
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,45,120,0.3)',
    color: '#fff', outline: 'none', fontFamily: 'Poppins, sans-serif', fontSize: '14px',
    marginBottom: '16px'
  };

  if (isChecking) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'Poppins, sans-serif' }}>
        <p style={{ color: '#888' }}>Checking authentication…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'Poppins, sans-serif' }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '40px 30px', borderRadius: '24px', border: '1px solid rgba(255,45,120,0.2)', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #FF2D78, #CC1E5A)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <Lock size={28} color="#fff" />
          </div>
          <h1 style={{ color: '#fff', fontSize: '24px', fontWeight: 700, margin: '0 0 8px' }}>Admin Access Required</h1>
          <p style={{ color: '#888', fontSize: '13px', margin: '0 0 24px' }}>You must be logged in as admin to access the email composer.</p>
          <a href="/admin/login" className="btn-primary" style={{ display: 'block', width: '100%', padding: '14px', fontSize: '15px', textDecoration: 'none', textAlign: 'center' }}>
            Go to Admin Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', padding: '40px 20px', fontFamily: 'Poppins, sans-serif' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', padding: '32px' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '24px' }}>
          <div>
            <Link href="/" style={{ color: '#888', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', marginBottom: '8px' }}>
              <ChevronLeft size={14} /> Back to Site
            </Link>
            <h1 style={{ color: '#fff', fontSize: '28px', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Send color="#FF2D78" /> Email Composer
            </h1>
            <p style={{ color: '#bbb', fontSize: '13px', margin: '4px 0 0' }}>Sending strictly from: <b>pakvisa.noreply@glitzandglamours.com</b></p>
          </div>
        </div>

        {successMessage && (
          <div style={{ background: 'rgba(0, 212, 120, 0.1)', border: '1px solid rgba(0, 212, 120, 0.3)', color: '#00D478', padding: '16px', borderRadius: '12px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
            <CheckCircle2 size={18} /> {successMessage}
          </div>
        )}

        {error && (
          <div style={{ background: 'rgba(255, 60, 60, 0.1)', border: '1px solid rgba(255, 60, 60, 0.3)', color: '#ff4444', padding: '16px', borderRadius: '12px', marginBottom: '24px', fontSize: '14px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSend}>
          <div style={{ display: 'grid', gap: '4px' }}>
            <label style={{ fontSize: '13px', color: '#888', fontWeight: 600, marginLeft: '4px' }}>To (comma separated for multiple)</label>
            <input 
              type="text" 
              placeholder="recipient@example.com" 
              value={to} 
              onChange={e => setTo(e.target.value)} 
              style={inputStyle} 
            />
          </div>

          <div style={{ display: 'grid', gap: '4px' }}>
            <label style={{ fontSize: '13px', color: '#888', fontWeight: 600, marginLeft: '4px' }}>Subject</label>
            <input 
              type="text" 
              placeholder="Email Subject" 
              value={subject} 
              onChange={e => setSubject(e.target.value)} 
              style={inputStyle} 
            />
          </div>

          <div style={{ display: 'grid', gap: '4px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontSize: '13px', color: '#888', fontWeight: 600, marginLeft: '4px' }}>Message Body (HTML Supported)</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="button" onClick={() => setActiveTab('source')} style={{ background: activeTab === 'source' ? 'rgba(255,45,120,0.2)' : 'rgba(255,255,255,0.05)', color: activeTab === 'source' ? '#FF2D78' : '#888', border: '1px solid', borderColor: activeTab === 'source' ? 'rgba(255,45,120,0.3)' : 'transparent', borderRadius: '8px', padding: '4px 12px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>Source Code</button>
                <button type="button" onClick={() => setActiveTab('preview')} style={{ background: activeTab === 'preview' ? 'rgba(255,45,120,0.2)' : 'rgba(255,255,255,0.05)', color: activeTab === 'preview' ? '#FF2D78' : '#888', border: '1px solid', borderColor: activeTab === 'preview' ? 'rgba(255,45,120,0.3)' : 'transparent', borderRadius: '8px', padding: '4px 12px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>Live Preview</button>
              </div>
            </div>
            
            <div style={{ border: '1px solid rgba(255,45,120,0.3)', borderRadius: '12px', overflow: 'hidden' }}>
              {/* Toolbar */}
              <div style={{ background: 'rgba(255,45,120,0.1)', padding: '8px', borderBottom: '1px solid rgba(255,45,120,0.2)', display: 'flex', gap: '8px' }}>
                <button type="button" onClick={() => insertTag('<b>', '</b>')} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', width: '32px', height: '32px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Bold">
                  <Bold size={16} />
                </button>
                <button type="button" onClick={() => insertTag('<i>', '</i>')} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', width: '32px', height: '32px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Italic">
                  <Italic size={16} />
                </button>
                <button type="button" onClick={handleInsertLink} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', gap: '4px', padding: '0 12px', height: '32px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Insert Link">
                  <LinkIcon size={14} /> Link
                </button>
                <button type="button" onClick={() => insertTag('<br/>', '')} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', fontSize: '12px', fontWeight: 700, padding: '0 10px', height: '32px', borderRadius: '6px', cursor: 'pointer' }} title="Line Break">
                  &lt;br&gt;
                </button>
              </div>
              
              {activeTab === 'source' ? (
                <textarea 
                  ref={textareaRef}
                  placeholder="Paste your raw HTML here... It will send exactly as is."
                  value={html}
                  onChange={e => setHtml(e.target.value)}
                  style={{ ...inputStyle, border: 'none', borderRadius: '0', margin: 0, minHeight: '300px', resize: 'vertical', background: 'rgba(0,0,0,0.2)' }}
                />
              ) : (
                <div 
                  style={{ minHeight: '300px', padding: '16px', background: '#fff', color: '#000', overflowY: 'auto' }}
                  dangerouslySetInnerHTML={{ __html: html || '<p style="color: #888; text-align: center; margin-top: 40px;">Live preview of your HTML will render here.</p>' }}
                />
              )}
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSending}
            className="btn-primary" 
            style={{ width: '100%', padding: '16px', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', opacity: isSending ? 0.7 : 1 }}
          >
            {isSending ? 'Sending Email...' : <>Send Email <Send size={18} /></>}
          </button>
        </form>
      </div>
    </div>
  );
}
