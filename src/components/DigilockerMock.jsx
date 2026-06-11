import React, { useState } from 'react';
import { Shield, CheckCircle, Loader2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const LABELS = {
  ngo: 'Government Registration ID',
  company: 'CIN / Company Registration ID',
  volunteer: 'Aadhaar Number'
};

const DigilockerMock = ({ onVerify, entityType, isLogin }) => {
  const { showToast } = useToast();
  const [step, setStep] = useState(1);
  const [idValue, setIdValue] = useState('');
  const handleIdChange = (e) => {
    const rawVal = e.target.value;
    if (entityType === 'volunteer') {
      const cleanVal = rawVal.replace(/\D/g, ''); // Keep only digits
      if (cleanVal.length <= 12) {
        // Format with space every 4 digits
        const parts = [];
        for (let i = 0; i < cleanVal.length; i += 4) {
          parts.push(cleanVal.substring(i, i + 4));
        }
        setIdValue(parts.join(' '));
      }
    } else {
      setIdValue(rawVal);
    }
  };

  const handleVerify = (e) => {
    e.preventDefault();
    if (!idValue) return;

    if (entityType === 'volunteer') {
      const digitsOnly = idValue.replace(/\D/g, '');
      if (digitsOnly.length !== 12) {
        showToast('Please enter a valid 12-digit Aadhaar number.', 'error');
        return;
      }
    }

    setStep(2);
    setTimeout(() => {
      if (isLogin) {
        setStep('error');
      } else {
        setStep(3);
        setTimeout(() => {
          onVerify({ verifiedId: idValue });
        }, 1500);
      }
    }, 2000);
  };

  return (
    <div style={{ 
      maxWidth: 420, margin: '0 auto', padding: '2rem', 
      borderTop: '3px solid #F39C12', position: 'relative', overflow: 'hidden',
      background: 'var(--color-surface)', backdropFilter: 'blur(20px)', borderRadius: '1rem', border: '1px solid var(--color-border)'
    }}>
      {/* Background decoration */}
      <div style={{ position: 'absolute', top: -40, right: -40, opacity: 0.06 }}>
        <Shield size={160} style={{ color: '#F39C12' }} />
      </div>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', position: 'relative', zIndex: 1 }}>
        <div style={{ 
          width: 40, height: 40, borderRadius: '50%', 
          background: 'rgba(243, 156, 18, 0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center' 
        }}>
          <Shield size={20} style={{ color: '#F39C12' }} />
        </div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#0F172A' }}>DigiLocker Verification</h3>
      </div>

      {step === 1 && (
        <form onSubmit={handleVerify} className="animate-fade-in" style={{ position: 'relative', zIndex: 1 }}>
          <div className="form-group">
            <label className="form-label" style={{ color: 'var(--color-text-primary)', fontWeight: 700 }}>
              {entityType === 'ngo' ? 'Government Registration ID' : (entityType === 'company' ? 'CIN Registration ID' : 'Aadhaar Number')}
            </label>
            <input
              type="text"
              className="form-input"
              style={{ background: 'var(--color-surface)', backdropFilter: 'blur(20px)', color: '#0F172A', borderColor: 'var(--color-border)', borderWidth: '2px' }}
              placeholder={entityType === 'volunteer' ? 'XXXX XXXX XXXX' : 'Enter your ID for verification'}
              value={idValue}
              onChange={handleIdChange}
              required
            />
          </div>
          <button type="submit" className="btn btn-secondary" style={{ width: '100%', background: '#F39C12', color: '#FFFFFF', fontWeight: 700 }}>
            <Shield size={16} /> Verify with DigiLocker
          </button>
        </form>
      )}

      {step === 2 && (
        <div className="animate-fade-in" style={{ 
          display: 'flex', flexDirection: 'column', alignItems: 'center', 
          padding: '2.5rem 0', position: 'relative', zIndex: 1 
        }}>
          <Loader2 size={40} className="animate-spin" style={{ color: '#F39C12', marginBottom: '1rem' }} />
          <p style={{ fontWeight: 600, fontSize: '0.95rem', color: '#0F172A' }}>Connecting to Government Databases...</p>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>Please wait</p>
        </div>
      )}

      {step === 3 && (
        <div className="animate-fade-in" style={{ 
          display: 'flex', flexDirection: 'column', alignItems: 'center', 
          padding: '2.5rem 0', position: 'relative', zIndex: 1 
        }}>
          <CheckCircle size={44} style={{ color: '#27AE60', marginBottom: '0.75rem' }} />
          <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#27AE60' }}>Verification Successful!</p>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>Redirecting to next step...</p>
        </div>
      )}

      {step === 'error' && (
        <div className="animate-fade-in" style={{ 
          display: 'flex', flexDirection: 'column', alignItems: 'center', 
          padding: '2rem 0', position: 'relative', zIndex: 1, textAlign: 'center' 
        }}>
          <span style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>⚠️</span>
          <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#E74C3C', margin: '0 0 0.5rem 0' }}>Verification Failed</p>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: 1.5, margin: '0 0 1.5rem 0' }}>
            DigiLocker verification is temporarily offline. Please use direct login or registration forms.
          </p>
          <button 
            type="button" 
            className="btn btn-outline" 
            style={{ padding: '0.5rem 1.5rem', fontSize: '0.85rem', color: 'var(--color-text-muted)', borderColor: 'var(--color-border)' }}
            onClick={() => {
              setIdValue('');
              setStep(1);
            }}
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
};

export default DigilockerMock;
