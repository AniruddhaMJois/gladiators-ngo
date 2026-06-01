import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Users, Shield, KeyRound, Lock, ArrowRight, AlertCircle, Building2, Briefcase } from 'lucide-react';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Selected role tab: defaults to URL query parameter or 'volunteer'
  const [selectedRole, setSelectedRole] = useState(searchParams.get('role') || 'volunteer');
  
  // Login input fields
  const [gcId, setGcId] = useState('');
  const [pin, setPin] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Scroll to top when page is opened
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // Update selected role state if query param changes
  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam && ['volunteer', 'ngo', 'company'].includes(roleParam)) {
      setSelectedRole(roleParam);
      setErrorMessage('');
    }
  }, [searchParams]);

  // Handle standard submit using GC-ID and PIN
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const formattedId = gcId.trim().toUpperCase();
    const cleanPin = pin.trim();

    // Validate inputs
    if (!formattedId) {
      setErrorMessage('Please enter your GC-ID.');
      return;
    }
    if (cleanPin.length !== 6 || isNaN(cleanPin)) {
      setErrorMessage('PIN must be a 6-digit number.');
      return;
    }

    const result = await login({ gcId: formattedId, pin: cleanPin, role: selectedRole });

    if (!result.success) {
      setErrorMessage(result.message || 'Login failed.');
      return;
    }

    // Redirect to respective dashboard
    if (selectedRole === 'volunteer') {
      navigate('/volunteer/dashboard');
    } else if (selectedRole === 'ngo') {
      navigate('/ngo/dashboard');
    } else if (selectedRole === 'company') {
      navigate('/company/dashboard');
    }
  };

  const getPrefix = () => {
    if (selectedRole === 'volunteer') return 'VLT';
    if (selectedRole === 'ngo') return 'NGO';
    return 'CPY';
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 120px)', padding: '3rem 1rem', position: 'relative', overflow: 'hidden' }}>
      {/* Dynamic Background decor */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(circle at 50% 50%, rgba(107, 143, 94, 0.15) 0%, transparent 60%)',
        pointerEvents: 'none'
      }} />

      <div className="glass-card animate-fade-in" style={{ 
        width: '100%', 
        maxWidth: 520, 
        padding: '3rem 2.5rem', 
        border: '1px solid rgba(255, 255, 255, 0.15)',
        background: 'transparent',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        borderRadius: '1.5rem'
      }}>
        {/* Floating circular glowing logo area */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 100, height: 100, borderRadius: '50%', overflow: 'hidden',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(255, 255, 255, 0.05)',
            boxShadow: '0 0 24px rgba(107,143,94,0.3)',
            border: '2px solid rgba(74, 103, 69, 0.1)',
            marginBottom: '1rem'
          }}>
            <img src="/images/logo.png" alt="GladiConnect Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <h1 className="text-gradient" style={{ fontSize: '1.75rem', marginBottom: '0.4rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
            Access Your Account
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', margin: 0 }}>
            Enter your GC-ID and 6-digit PIN to access your portal
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div style={{ 
          display: 'flex', 
          gap: '0.35rem', 
          background: 'rgba(255, 255, 255, 0.06)', 
          padding: '0.3rem', 
          borderRadius: '0.75rem', 
          marginBottom: '2rem',
          border: '1px solid #E2E8F0'
        }}>
          {['volunteer', 'ngo', 'company'].map(role => {
            const isActive = selectedRole === role;
            return (
              <button
                key={role}
                onClick={() => {
                  setSelectedRole(role);
                  setErrorMessage('');
                }}
                style={{
                  flex: 1,
                  padding: '0.5rem 0',
                  fontSize: '0.8rem',
                  fontWeight: isActive ? 800 : 600,
                  textTransform: 'capitalize',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  background: isActive ? 'var(--color-primary-dark)' : 'transparent',
                  color: isActive ? 'transparent' : 'var(--color-text-secondary)',
                  transition: 'all 0.2s ease-out'
                }}
              >
                {role}
              </button>
            );
          })}
        </div>

        {errorMessage && (
          <div style={{
            background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '0.75rem',
            padding: '0.75rem 1rem', fontSize: '0.825rem', color: '#B91C1C', fontWeight: 600,
            display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '1.5rem',
            lineHeight: '1.45'
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '0.1rem' }} />
            <div>{errorMessage}</div>
          </div>
        )}

        <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label className="form-label" style={{ color: 'var(--color-text-secondary)', fontWeight: 700, fontSize: '0.8rem' }}>
              {'GC-ID *'.replace('GC-ID', `GC-${selectedRole.toUpperCase()} ID`)}
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{ 
                position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', 
                color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center'
              }}>
                {selectedRole === 'volunteer' && <Users size={18} />}
                {selectedRole === 'ngo' && <Building2 size={18} />}
                {selectedRole === 'company' && <Briefcase size={18} />}
              </div>
              <input
                type="text"
                className="form-input"
                style={{ 
                  paddingLeft: '2.5rem', 
                  paddingRight: '2.5rem',
                  borderColor: '#CBD5E1', 
                  borderWidth: '2px', 
                  background: 'transparent', 
                  color: 'var(--color-text-primary)',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  textAlign: 'center'
                }}
                placeholder={`e.g. ${getPrefix()}123456`}
                value={gcId}
                onChange={e => setGcId(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label className="form-label" style={{ color: 'var(--color-text-secondary)', fontWeight: 700, fontSize: '0.8rem' }}>
              6-Digit Secure PIN *
            </label>
            <div style={{ position: 'relative' }}>
              <KeyRound size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
              <input
                type="password"
                className="form-input"
                maxLength={6}
                style={{ 
                  paddingLeft: '2.5rem', 
                  paddingRight: '2.5rem',
                  borderColor: '#CBD5E1', 
                  borderWidth: '2px', 
                  background: 'transparent', 
                  color: 'var(--color-text-primary)',
                  fontWeight: 700,
                  letterSpacing: '0.2em',
                  textAlign: 'center'
                }}
                placeholder="••••••"
                value={pin}
                onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ 
              width: '100%', 
              padding: '0.85rem', 
              background: 'var(--color-primary-dark)', 
              color: 'transparent', 
              fontWeight: 800,
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              border: 'none',
              cursor: 'pointer',
              marginTop: '0.5rem',
              borderRadius: '0.75rem'
            }}
          >
            Access CSR Portal <ArrowRight size={18} />
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: 0 }}>
            Don\
          </p>
          <button
            onClick={() => {
              if (selectedRole === 'volunteer') navigate('/volunteer/onboarding');
              else if (selectedRole === 'ngo') navigate('/ngo/onboarding');
              else if (selectedRole === 'company') navigate('/company/onboarding');
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-primary-dark)',
              fontWeight: 800,
              cursor: 'pointer',
              fontSize: '0.85rem',
              marginTop: '0.35rem',
              textDecoration: 'underline'
            }}
          >
            {'Register a new profile here'.replace('profile', `${selectedRole} profile`)}
          </button>
        </div>

        {/* In-memory notice */}
        <div style={{
          marginTop: '2rem',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid #E2E8F0',
          borderRadius: '0.75rem',
          padding: '0.75rem',
          fontSize: '0.75rem',
          color: 'var(--color-text-secondary)',
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.35rem'
        }}>
          <Lock size={12} /> Live Session: Refreshing will wipe all registered details.
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
