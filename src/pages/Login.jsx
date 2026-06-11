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

      <div className="glass-card animate-fade-in prismatic-edge" style={{ 
        width: '100%', 
        maxWidth: 520, 
        padding: '3rem 2.5rem', 
        borderRadius: 'var(--radius-xl)'
      }}>
        {/* Floating circular glowing logo area */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem', position: 'relative' }}>
          {/* Decorative rotating aura */}
          <div style={{
            position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)',
            width: 120, height: 120, borderRadius: '50%',
            background: 'conic-gradient(from 0deg, var(--color-primary), var(--color-accent), var(--color-primary))',
            animation: 'spin 4s linear infinite', opacity: 0.15, filter: 'blur(12px)', zIndex: -1
          }} />
          <div style={{
            width: 100, height: 100, borderRadius: '50%', overflow: 'hidden',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--color-surface)', backdropFilter: 'blur(10px)',
            boxShadow: '0 0 0 4px var(--color-surface-hover), 0 10px 25px -5px rgba(0,0,0,0.1)',
            border: '1px solid var(--color-border)',
            marginBottom: '1.25rem',
            position: 'relative',
            zIndex: 1
          }}>
            <img src="/images/logo.png" alt="GladiConnect Logo" style={{ width: '65%', height: '65%', objectFit: 'contain' }} />
          </div>
          <h1 className="text-gradient" style={{ fontSize: '2rem', marginBottom: '0.5rem', fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
            Welcome Back
          </h1>
          <p style={{ fontSize: '0.95rem', color: 'var(--color-text-secondary)', margin: 0, fontWeight: 500 }}>
            Enter your credentials to access your <span style={{color: 'var(--color-primary)', fontWeight: 700, textTransform: 'capitalize'}}>{selectedRole}</span> portal
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="role-selector-container" style={{ marginBottom: '2.5rem' }}>
          {['volunteer', 'ngo', 'company'].map(role => {
            const isActive = selectedRole === role;
            let btnColor = 'var(--color-primary)';
            let btnBg = 'var(--color-primary)';
            let btnShadow = 'rgba(139, 92, 246, 0.4)';
            if (role === 'ngo') {
              btnColor = '#0EA5E9'; btnBg = '#0EA5E9'; btnShadow = 'rgba(14, 165, 233, 0.4)';
            }
            if (role === 'company') {
              btnColor = '#F59E0B'; btnBg = '#F59E0B'; btnShadow = 'rgba(245, 158, 11, 0.4)';
            }
            return (
              <button
                key={role}
                onClick={() => {
                  setSelectedRole(role);
                  setErrorMessage('');
                }}
                className={`role-btn ${isActive ? 'role-btn-active prismatic-edge' : 'role-btn-inactive'}`}
                style={{
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  ...(isActive ? {
                    borderColor: btnColor,
                    color: '#FFFFFF',
                    background: btnBg,
                    boxShadow: `0 4px 12px ${btnShadow}`,
                    fontWeight: 800
                  } : {
                    borderColor: 'transparent',
                    background: 'transparent',
                    boxShadow: 'none',
                    fontWeight: 700
                  })
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
            <label className="form-label" style={{ color: 'var(--color-text-secondary)', fontWeight: 700, fontSize: '0.8rem', transition: 'all 0.4s ease' }}>
              {'GC-ID *'.replace('GC-ID', `GC-${selectedRole.toUpperCase()} ID`)}
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{ 
                position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', 
                color: selectedRole === 'ngo' ? '#0EA5E9' : selectedRole === 'company' ? '#F59E0B' : 'var(--color-primary)',
                display: 'flex', alignItems: 'center',
                background: selectedRole === 'ngo' ? 'rgba(14, 165, 233, 0.1)' : selectedRole === 'company' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(139, 92, 246, 0.1)', 
                padding: '0.6rem', borderRadius: '0.5rem',
                boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
              }}>
                {selectedRole === 'volunteer' && <Users size={16} />}
                {selectedRole === 'ngo' && <Building2 size={16} />}
                {selectedRole === 'company' && <Briefcase size={16} />}
              </div>
              <input
                type="text"
                className="form-input"
                style={{ 
                  paddingLeft: '3.5rem', 
                  paddingRight: '1.5rem',
                  paddingTop: '1rem',
                  paddingBottom: '1rem',
                  borderColor: 'var(--color-border)', 
                  borderWidth: '2px', 
                  background: 'var(--color-surface)', 
                  color: 'var(--color-text-primary)',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  borderRadius: '0.75rem',
                  transition: 'all 0.3s ease',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)',
                  width: '100%'
                }}
                onFocus={e => { e.target.style.borderColor = 'var(--color-primary)'; e.target.style.boxShadow = '0 0 0 4px rgba(139, 92, 246, 0.1)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--color-border)'; e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.02)'; }}
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
              <div style={{ 
                position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', 
                color: selectedRole === 'ngo' ? '#0EA5E9' : selectedRole === 'company' ? '#F59E0B' : 'var(--color-primary)', 
                display: 'flex', alignItems: 'center',
                background: selectedRole === 'ngo' ? 'rgba(14, 165, 233, 0.1)' : selectedRole === 'company' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(139, 92, 246, 0.1)', 
                padding: '0.6rem', borderRadius: '0.5rem',
                boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
              }}>
                <KeyRound size={16} />
              </div>
              <input
                type="password"
                className="form-input"
                maxLength={6}
                style={{ 
                  paddingLeft: '3.5rem', 
                  paddingRight: '1.5rem',
                  paddingTop: '1rem',
                  paddingBottom: '1rem',
                  borderColor: 'var(--color-border)', 
                  borderWidth: '2px', 
                  background: 'var(--color-surface)', 
                  color: 'var(--color-text-primary)',
                  fontWeight: 700,
                  letterSpacing: '0.2em',
                  borderRadius: '0.75rem',
                  transition: 'all 0.3s ease',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)',
                  width: '100%'
                }}
                onFocus={e => { e.target.style.borderColor = 'var(--color-primary)'; e.target.style.boxShadow = '0 0 0 4px rgba(139, 92, 246, 0.1)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--color-border)'; e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.02)'; }}
                placeholder="••••••"
                value={pin}
                onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn prismatic-edge" 
            style={{ 
              width: '100%', marginTop: '1rem', padding: '1rem', 
              fontSize: '1.1rem', fontWeight: 800, letterSpacing: '0.02em',
              display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem',
              color: '#FFFFFF',
              background: selectedRole === 'ngo' ? '#0EA5E9' : selectedRole === 'company' ? '#F59E0B' : 'var(--color-primary)',
              boxShadow: `0 8px 20px -6px ${selectedRole === 'ngo' ? 'rgba(14, 165, 233, 0.6)' : selectedRole === 'company' ? 'rgba(245, 158, 11, 0.6)' : 'rgba(109, 40, 217, 0.5)'}`,
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            Access {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} Portal <ArrowRight size={18} />
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: 0 }}>
            Don't have an account?
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
          border: '1px solid var(--color-border)',
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
