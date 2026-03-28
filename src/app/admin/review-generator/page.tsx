'use client';

import { useState } from 'react';
import { Copy, CheckCircle, Send, PlusCircle, Smartphone, Mail, Loader2 } from 'lucide-react';

const MESSAGE_OPTIONS = [
    {
        title: 'Original Sweet Message',
        content: `Thank you so much for booking with me, beautiful 💗\n\nI truly appreciate you and I hope I met (or exceeded 😉) your expectations. You were such a whole vibe and made the appointment so fun ✨ I can't wait to see you again!\n\nIf you ever need anything — hair, nails, or a little self-care moment — I'm always here for you 💕\n\nAnd if you have a minute to leave me a review, I'd appreciate it so much. It really helps my small business grow and also helps me continue improving to make sure you always feel comfortable, confident, and taken care of 🫶💗\n\nGiving a review gives you $10 off your next service 💗`
    },
    {
        title: 'Short & Appreciative',
        content: `Hey beautiful! Thank you so much for coming in today 💅\n\nI loved having you in the studio and I hope you love your new look! If you have a quick minute, I'd be so grateful if you could leave a review. Your feedback helps my small business grow so much 💖\n\nAs a thank you, enjoy $10 off your next appointment! Can't wait to see you again ✨`
    },
    {
        title: 'Friendly Catch-up',
        content: `It was so great catching up with you today! 💗\n\nThank you for trusting me with your beauty needs. I'm always striving to give my clients the best experience possible. If you enjoyed your visit, a quick review would mean the world to me 🫶\n\nBonus: you'll get $10 off your next service for leaving one! See you next time 💕`
    },
    {
        title: 'Vibe Check',
        content: `You always bring the best vibes to the studio! ✨\n\nThank you for being such an amazing client. I absolutely loved what we created today. If you're loving it too, could you take a second to leave a review? \n\nEvery review helps out my small business, and to say thanks, your next service is $10 off! 💗💅`
    },
    {
        title: 'Quick & Direct',
        content: `Thank you for your visit to Glitz & Glamour Studio! 🌸\n\nIf you enjoyed your service, please consider leaving a review. It helps me improve and helps other beautiful clients find me. \n\nGet $10 off your next appointment when you leave a review today! 💖`
    },
    {
        title: 'Hair Focus',
        content: `Hey beautiful! Your hair looks absolutely stunning 💁‍♀️✨\n\nThank you for letting me work my magic. I'd love to hear your thoughts on your experience today! If you have a minute to leave a review, I'd be incredibly grateful.\n\nEnjoy $10 off your next booking as my thank you! 💕`
    },
    {
        title: 'Nails Focus',
        content: `Look at those nails! 😍💅\n\nThank you for coming in and letting me get creative today. I appreciate you so much! If you love your set, leaving a quick review would help my business tremendously.\n\nLeave a review and take $10 off your next fill or full set! 🫶💗`
    },
    {
        title: 'First-Time Client',
        content: `It was so wonderful meeting you today! 💗\n\nThank you for choosing Glitz & Glamour Studio for the first time. I hope you felt completely taken care of. Feedback from new clients is so helpful to me—if you have a moment, I'd love a quick review!\n\nAs a welcome and a thank you, you get $10 off your next service! ✨`
    },
    {
        title: 'Loyal Client',
        content: `You're the best! 💖\n\nThank you for always supporting me and my studio. Clients like you are the reason I love what I do. If you haven't already, I would be so thankful if you left a review sharing your experiences with me.\n\nTake $10 off your next visit as my token of appreciation! 💅🫶`
    },
    {
        title: 'Heartfelt Gratitude',
        content: `My heart is so full after today's appointment! 💕\n\nThank you for your trust and for letting me pamper you. This small business is my dream, and your support makes it possible. If you could leave a review, it would truly make my day.\n\nEnjoy $10 off your next service. Sending you love! 🌸✨`
    }
];

export default function ReviewGeneratorAdmin() {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [selectedMsgIndex, setSelectedMsgIndex] = useState(0);
    const [customMessage, setCustomMessage] = useState(MESSAGE_OPTIONS[0].content);
    
    const [autoSend, setAutoSend] = useState(true);
    
    const [loading, setLoading] = useState(false);
    const [generatedUrl, setGeneratedUrl] = useState('');
    const [generatedMessage, setGeneratedMessage] = useState('');
    const [copied, setCopied] = useState(false);
    const [statusLogs, setStatusLogs] = useState<{sms: string, email: string} | null>(null);

    const handleSelectMessage = (idx: number) => {
        setSelectedMsgIndex(idx);
        setCustomMessage(MESSAGE_OPTIONS[idx].content);
    };

    const handleGenerate = async () => {
        if (!name.trim()) return alert('Client name is required');
        
        setLoading(true);
        setGeneratedUrl('');
        setGeneratedMessage('');
        setStatusLogs(null);
        setCopied(false);

        try {
            const res = await fetch('/api/admin/reviews/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    clientName: name,
                    clientPhone: phone || undefined,
                    clientEmail: email || undefined,
                    message: customMessage,
                    autoSend
                })
            });

            const data = await res.json();
            if (data.success) {
                setGeneratedUrl(data.url);
                setGeneratedMessage(data.fullMessage);
                setStatusLogs({
                    sms: data.smsStatus,
                    email: data.emailStatus
                });
                
                // Reset form fields lightly
                setName('');
                setPhone('');
                setEmail('');
            } else {
                alert(data.error || 'Failed to generate review request');
            }
        } catch (err) {
            console.error(err);
            alert('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        if (!generatedUrl) return;
        navigator.clipboard.writeText(generatedUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', color: '#fff' }}>
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '24px', fontWeight: 700, margin: '0 0 8px', color: '#FF2D78' }}>
                    Review Link Generator
                </h1>
                <p style={{ color: '#aaa', fontSize: '14px', margin: 0 }}>
                    Create unique, one-time use review links for your clients and send them via SMS or Email.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
                
                {/* FORM SECTION */}
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,45,120,0.15)', borderRadius: '16px', padding: '24px' }}>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#FF2D78', marginBottom: '6px' }}>Client Name <span style={{ color: '#ff4444' }}>*</span></label>
                            <input 
                                value={name} 
                                onChange={e => setName(e.target.value)} 
                                placeholder="e.g. Sarah Johnson"
                                style={{
                                    width: '100%', padding: '12px 16px', borderRadius: '10px',
                                    background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)',
                                    color: '#fff', outline: 'none', fontFamily: 'inherit'
                                }}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#FF2D78', marginBottom: '6px' }}>
                                    <Smartphone size={14} /> Phone Number
                                </label>
                                <input 
                                    value={phone} 
                                    onChange={e => setPhone(e.target.value)} 
                                    placeholder="+1 760 123 4567"
                                    style={{
                                        width: '100%', padding: '12px 16px', borderRadius: '10px',
                                        background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)',
                                        color: '#fff', outline: 'none', fontFamily: 'inherit'
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#FF2D78', marginBottom: '6px' }}>
                                    <Mail size={14} /> Email Address
                                </label>
                                <input 
                                    value={email} 
                                    onChange={e => setEmail(e.target.value)} 
                                    placeholder="sarah@example.com"
                                    style={{
                                        width: '100%', padding: '12px 16px', borderRadius: '10px',
                                        background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)',
                                        color: '#fff', outline: 'none', fontFamily: 'inherit'
                                    }}
                                />
                            </div>
                        </div>

                        {/* SEND OPTION TOGGLE */}
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', marginTop: '-4px' }}>
                            <input 
                                type="checkbox" 
                                checked={autoSend} 
                                onChange={e => setAutoSend(e.target.checked)} 
                                style={{ width: '16px', height: '16px', accentColor: '#FF2D78', cursor: 'pointer' }}
                            />
                            Automatically send via SMS / Email
                        </label>

                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#FF2D78', marginBottom: '6px' }}>Select a Template</label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                                {MESSAGE_OPTIONS.map((opt, i) => (
                                    <button 
                                        key={i} 
                                        onClick={() => handleSelectMessage(i)}
                                        style={{
                                            padding: '6px 12px', borderRadius: '50px', fontSize: '12px', fontWeight: 500,
                                            background: selectedMsgIndex === i ? 'rgba(255,45,120,0.2)' : 'rgba(255,255,255,0.05)',
                                            border: `1px solid ${selectedMsgIndex === i ? '#FF2D78' : 'rgba(255,255,255,0.1)'}`,
                                            color: selectedMsgIndex === i ? '#FF2D78' : '#aaa',
                                            cursor: 'pointer', transition: 'all 0.2s'
                                        }}
                                    >
                                        {opt.title}
                                    </button>
                                ))}
                            </div>
                            
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#FF2D78', marginBottom: '6px' }}>Message Body (Editable)</label>
                            <textarea
                                value={customMessage}
                                onChange={e => setCustomMessage(e.target.value)}
                                rows={8}
                                style={{
                                    width: '100%', padding: '16px', borderRadius: '12px',
                                    background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)',
                                    color: '#eee', outline: 'none', fontFamily: 'inherit', resize: 'vertical',
                                    lineHeight: '1.5'
                                }}
                            />
                            <p style={{ fontSize: '11px', color: '#888', marginTop: '6px' }}>
                                The unique review link will be automatically appended to the end of this message.
                            </p>
                        </div>

                        <button 
                            onClick={handleGenerate}
                            disabled={loading || !name.trim()}
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                width: '100%', padding: '14px', borderRadius: '12px',
                                background: loading || !name.trim() ? '#444' : 'linear-gradient(135deg, #FF2D78, #FF6BA8)',
                                color: '#fff', border: 'none', fontSize: '15px', fontWeight: 600,
                                cursor: loading || !name.trim() ? 'not-allowed' : 'pointer',
                                marginTop: '10px', transition: 'all 0.2s'
                            }}
                        >
                            {loading ? <Loader2 size={18} className="spin" /> : (autoSend ? <Send size={18} /> : <PlusCircle size={18} />)}
                            {loading ? 'Generating...' : (autoSend ? 'Generate Review Link & Send' : 'Generate Link Only')}
                        </button>
                    </div>
                </div>

                {/* RESULT SECTION */}
                {generatedUrl && (
                    <div style={{ 
                        background: 'rgba(45,255,120,0.05)', 
                        border: '1px solid rgba(45,255,120,0.2)', 
                        borderRadius: '16px', padding: '24px',
                        animation: 'fadeIn 0.4s ease'
                    }}>
                        <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
                        <h3 style={{ color: '#2df878', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px' }}>
                            <CheckCircle size={20} /> Success! Link Generated
                        </h3>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <label style={{ fontSize: '13px', fontWeight: 600, color: '#aaa' }}>Full Copiable Message</label>
                            <textarea
                                readOnly
                                value={generatedMessage}
                                rows={7}
                                style={{
                                    width: '100%', padding: '16px', borderRadius: '12px',
                                    background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)',
                                    color: '#fff', outline: 'none', fontFamily: 'inherit', resize: 'vertical',
                                    lineHeight: '1.5'
                                }}
                            />
                            <button 
                                onClick={() => {
                                    if (!generatedMessage) return;
                                    navigator.clipboard.writeText(generatedMessage);
                                    setCopied(true);
                                    setTimeout(() => setCopied(false), 2000);
                                }}
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                                    width: '100%', padding: '12px', borderRadius: '8px',
                                    background: copied ? '#2df878' : 'rgba(255,45,120,0.1)',
                                    color: copied ? '#000' : '#FF2D78', border: `1px solid ${copied ? '#2df878' : '#FF2D78'}`,
                                    cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s'
                                }}
                            >
                                {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                                {copied ? 'Message Copied!' : 'Copy Full Message & Link'}
                            </button>
                        </div>

                        {statusLogs && autoSend && (
                            <div style={{ marginTop: '20px', display: 'flex', gap: '16px', fontSize: '13px', background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px' }}>
                                <div>
                                    <span style={{ color: '#aaa', display: 'block', marginBottom: '4px' }}>SMS Delivery</span>
                                    <span style={{ 
                                        color: statusLogs.sms === 'sent' ? '#2df878' : statusLogs.sms.includes('failed') ? '#ff4444' : '#aaa',
                                        fontWeight: 600
                                    }}>
                                        {statusLogs.sms.toUpperCase().replace('_', ' ')}
                                    </span>
                                </div>
                                <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '16px' }}>
                                    <span style={{ color: '#aaa', display: 'block', marginBottom: '4px' }}>Email Delivery</span>
                                    <span style={{ 
                                        color: statusLogs.email === 'sent' ? '#2df878' : statusLogs.email.includes('failed') ? '#ff4444' : '#aaa',
                                        fontWeight: 600
                                    }}>
                                        {statusLogs.email.toUpperCase().replace('_', ' ')}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
            {/* Global spinner style */}
            <style>{`
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
