'use client';

import { useState } from 'react';
import { Cake, Sparkles, X, Check } from 'lucide-react';

type BirthdayModalProps = {
  isOpen: boolean;
  onSave: (dob: string) => Promise<void>;
  onClose: () => void;
  userName: string;
};

export default function BirthdayModal({ isOpen, onSave, onClose, userName }: BirthdayModalProps) {
  const [dob, setDob] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!dob) {
      alert('Please enter your birthdate!');
      return;
    }
    
    // Check age logic
    const dobDate = new Date(dob);
    const ageDiff = Date.now() - dobDate.getTime();
    const age = new Date(ageDiff).getUTCFullYear() - 1970;
    
    if (age < 13) {
      alert('You must be at least 13 years old.');
      return;
    }

    setIsSaving(true);
    try {
      await onSave(dob);
    } catch (error) {
      alert('Failed to save birthday. Try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <style>{`
        .bd-overlay {
          position: fixed;
          inset: 0;
          z-index: 1000;
          background: rgba(10, 10, 10, 0.85);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          animation: bdFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .bd-modal {
          background: linear-gradient(180deg, rgba(22, 8, 24, 0.95), rgba(10, 10, 10, 0.95));
          border: 1px solid rgba(255, 45, 120, 0.4);
          border-radius: 28px;
          padding: 36px 24px;
          width: 100%;
          max-width: 400px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.6), 0 0 30px rgba(255,45,120,0.15);
          text-align: center;
          position: relative;
          overflow: hidden;
          animation: bdSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .bd-modal::before {
          content: '';
          position: absolute;
          top: -50px; left: -50px; right: -50px; height: 150px;
          background: radial-gradient(circle, rgba(255,45,120,0.15) 0%, transparent 70%);
          z-index: 0;
          pointer-events: none;
        }
        
        .bd-content { position: relative; z-index: 1; display: flex; flex-direction: column; gap: 16px; }
        
        @keyframes bdFadeIn { from{opacity:0} to{opacity:1} }
        @keyframes bdSlideUp { from{opacity:0;transform:translateY(30px) scale(0.95)} to{opacity:1;transform:translateY(0) scale(1)} }
        
        .bd-icon {
          width: 64px; height: 64px; border-radius: 50%;
          background: linear-gradient(135deg, #FF2D78, #CC1E5A);
          display: flex; align-items: center; justify-content: center; margin: 0 auto;
          box-shadow: 0 8px 20px rgba(255,45,120,0.4);
          position: relative;
        }
        .bd-icon::after {
          content: '✨'; position: absolute; top: -5px; right: -5px; font-size: 18px;
        }

        .bd-close {
          position: absolute; top: 16px; right: 16px; width: 32px; height: 32px;
          border-radius: 50%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
          color: #888; display: flex; align-items: center; justify-content: center;
          cursor: pointer; z-index: 10; transition: all 0.2s;
        }
        .bd-close:hover { background: rgba(255,255,255,0.1); color: #fff; transform: scale(1.05); }

        .bd-input-wrapper {
          position: relative; margin-top: 12px;
        }
        .bd-input {
          width: 100%; box-sizing: border-box; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,45,120,0.3);
          border-radius: 16px; padding: 16px 16px 16px 48px; color: #fff; font-family: 'Poppins', sans-serif;
          font-size: 15px; outline: none; transition: border-color 0.2s; color-scheme: dark;
        }
        .bd-input:focus { border-color: #FF2D78; box-shadow: 0 0 0 3px rgba(255,45,120,0.1); }
      `}</style>

      <div className="bd-overlay">
        <div className="bd-modal">
          <button className="bd-close" onClick={onClose}><X size={16} strokeWidth={2.5} /></button>
          
          <div className="bd-content">
            <div className="bd-icon">
              <Cake size={32} color="#fff" strokeWidth={2} />
            </div>

            <div style={{ marginTop: '8px' }}>
              <h2 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '22px', fontWeight: 800, color: '#fff', margin: '0 0 6px' }}>
                Welcome, {userName.split(' ')[0]}!
              </h2>
              <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px', color: '#bbb', margin: 0, lineHeight: 1.5 }}>
                When is your birthday? We need your birthdate so we can assign a <b>free spin the wheel</b> reward for you on your special day! 🎁
              </p>
            </div>

            <div className="bd-input-wrapper">
              <Cake size={18} color="#FF2D78" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="date"
                value={dob}
                onChange={e => setDob(e.target.value)}
                max={new Date(Date.now() - 13 * 365.25 * 24 * 3600 * 1000).toISOString().split('T')[0]}
                className="bd-input"
              />
              {!dob && <span style={{ position: 'absolute', left: '48px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', fontFamily: 'Poppins, sans-serif', fontSize: '15px', color: '#666' }}>Select your birthdate</span>}
            </div>

            <button 
              onClick={handleSave} 
              disabled={isSaving || !dob}
              className="btn-primary" 
              style={{ width: '100%', padding: '16px', fontSize: '15px', marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              {isSaving ? 'Saving...' : 'Save Birthday'} <Sparkles size={16} />
            </button>
            
            <button 
              onClick={onClose}
              style={{ background: 'none', border: 'none', color: '#777', fontFamily: 'Poppins, sans-serif', fontSize: '13px', cursor: 'pointer', marginTop: '4px', textDecoration: 'underline' }}
            >
              Skip for now
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
