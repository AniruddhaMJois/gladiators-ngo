import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Building2, Mail, Phone, MapPin, Globe, User, Shield, Hash, ArrowLeft, Save, Edit3, LogOut, Check, X, Briefcase } from 'lucide-react';
import ProfilePhotoUploader from '../../components/ProfilePhotoUploader';

const NgoProfile = () => {
  const { user, updateUserProfile, logout } = useAuth();
  const navigate = useNavigate();

  // Local state for editing form
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    website: user?.website || '',
    headquarters: user?.headquarters || '',
    domain: user?.domain || 'Environment',
    customDomain: '',
    pocName: user?.pocName || '',
    pocPhone: user?.pocPhone || '',
    pocDesignation: user?.pocDesignation || '',
    pocEmail: user?.pocEmail || '',
    about: user?.about || ''
  });

  const [isCustomDomain, setIsCustomDomain] = useState(
    user?.domain && !['Environment', 'Education', 'Health', 'Disaster Relief', 'SDG 16', 'SDG 17'].includes(user?.domain)
  );

  const [notification, setNotification] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Email Change OTP States
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [localOtp, setLocalOtp] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [otp, setOtp] = useState('');

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const standardDomains = [
    'Environment',
    'Education',
    'Health',
    'Disaster Relief',
    'SDG 16',
    'SDG 17'
  ];

  if (!user) {
    return (
      <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', maxWidth: 500, margin: '4rem auto' }}>
        <h2 style={{ color: 'var(--color-primary)' }}>Access Denied</h2>
        <p style={{ margin: '1rem 0 2rem' }}>Please log in to view your NGO profile page.</p>
        <button className="btn btn-primary" onClick={() => navigate('/login')}>Go to Login</button>
      </div>
    );
  }

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'pocPhone') {
      const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({ ...prev, [name]: digitsOnly }));
    } else if (name === 'email') {
      setFormData(prev => ({ ...prev, [name]: value }));
      if (value !== user?.email) {
        setOtpVerified(false);
        setOtpSent(false);
        setOtp('');
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSendOtp = async () => {
    if (!formData.email || !formData.email.includes('@')) {
      showAlert('Please enter a valid email address', 'error');
      return;
    }
    
    // Generate a 6-digit OTP locally
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setLocalOtp(generatedOtp);
    
    try {
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: 'service_kfkq6bm',
          template_id: 'template_psqbnic',
          user_id: 'vpDAX82eAyKf8yWHU',
          template_params: {
            email: formData.email,
            passcode: generatedOtp,
            time: new Date(Date.now() + 15 * 60000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
          }
        })
      });
      
      if (response.ok) {
        setOtpSent(true);
        setCountdown(60);
        showAlert('Email sent successfully!', 'success');
      } else {
        const errText = await response.text();
        showAlert('Failed to send OTP.', 'error');
      }
    } catch (err) {
      console.error(err);
      showAlert('Error while sending OTP.', 'error');
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      setNotification({ type: 'error', message: 'Please enter a valid 6-digit OTP' });
      return;
    }

    try {
      const response = await fetch('https://gladiators-ngo.onrender.com/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp })
      });
      const data = await response.json();
      
      if (response.ok) {
        setOtpVerified(true);
        setNotification({ type: 'success', message: 'Email verified successfully!' });
      } else {
        setNotification({ type: 'error', message: data.message || 'Invalid OTP.' });
      }
    } catch (err) {
      console.error(err);
      setNotification({ type: 'error', message: 'Server error while verifying OTP.' });
    }
  };

  // Handle domain dropdown changes
  const handleDomainChange = (e) => {
    const value = e.target.value;
    if (value === 'Other') {
      setIsCustomDomain(true);
      setFormData(prev => ({ ...prev, domain: 'Other' }));
    } else {
      setIsCustomDomain(false);
      setFormData(prev => ({ ...prev, domain: value, customDomain: '' }));
    }
  };

  // Save changes
  const handleSave = (e) => {
    e.preventDefault();

    // Validations
    if (!formData.name.trim()) {
      setNotification({ type: 'error', message: 'Organization name cannot be empty.' });
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setNotification({ type: 'error', message: 'Please enter a valid NGO contact email.' });
      return;
    }
    if (!formData.headquarters.trim()) {
      setNotification({ type: 'error', message: 'Please enter NGO headquarters address.' });
      return;
    }
    if (formData.email !== user?.email && !otpVerified) {
      setNotification({ type: 'error', message: 'Please verify your new NGO email with OTP before saving.' });
      return;
    }
    
    // POC Validations
    if (!formData.pocName.trim()) {
      setNotification({ type: 'error', message: 'Point of Contact name cannot be empty.' });
      return;
    }
    if (formData.pocPhone.length !== 10) {
      setNotification({ type: 'error', message: 'Point of Contact phone must be exactly 10 digits.' });
      return;
    }
    if (!formData.pocEmail.trim() || !formData.pocEmail.includes('@')) {
      setNotification({ type: 'error', message: 'Please enter a valid Point of Contact email.' });
      return;
    }

    const finalDomain = isCustomDomain ? (formData.customDomain.trim() || 'Other Focus') : formData.domain;

    // Update in Auth Context
    updateUserProfile({
      name: formData.name,
      email: formData.email,
      website: formData.website,
      headquarters: formData.headquarters,
      domain: finalDomain,
      pocName: formData.pocName,
      pocPhone: formData.pocPhone,
      pocDesignation: formData.pocDesignation,
      pocEmail: formData.pocEmail,
      about: formData.about
    });

    setIsEditing(false);
    setNotification({ type: 'success', message: 'NGO profile settings saved successfully!' });
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem 1rem 3rem' }}>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', cursor: 'pointer', color: 'var(--color-primary)', width: 'fit-content' }} onClick={() => navigate('/ngo/dashboard')}>
        <ArrowLeft size={18} />
        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Back to Dashboard</span>
      </div>
      
      {/* Top Breadcrumbs */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '1.5rem' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
          Role: <span style={{ color: 'var(--color-primary)' }}>NGO Portal</span>
        </span>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div style={{
          padding: '1rem',
          borderRadius: 'var(--radius-md)',
          background: notification.type === 'success' ? '#E0F2F1' : '#FFEBEE',
          border: `1.5px solid ${notification.type === 'success' ? '#4DB6AC' : '#E57373'}`,
          color: notification.type === 'success' ? '#00695C' : '#C62828',
          fontWeight: 600,
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: 'var(--shadow-sm)',
          animation: 'fadeIn 0.3s ease'
        }}>
          <span>{notification.message}</span>
          <button 
            onClick={() => setNotification(null)}
            style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontWeight: 'bold' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid-md-3-custom">
        
        {/* Left Summary Card */}
        <div className="glass-card profile-sidebar" style={{ padding: '2rem' }}>
          <div className="profile-summary-container">
            
            {/* Group 1: Avatar + Name + ID */}
            <div className="profile-summary-info">
              {/* Avatar Icon */}
              <div style={{ position: 'relative', flexShrink: 0, width: 120, height: 120 }}>
                <ProfilePhotoUploader 
                  currentPhoto={user.profilePhoto}
                  onPhotoUpdate={(base64) => updateUserProfile({ profilePhoto: base64 })}
                />
                <div style={{
                  position: 'absolute', bottom: 2, right: 2,
                  background: '#009688', border: '2.5px solid #FFFFFF',
                  borderRadius: '50%', width: 26, height: 26,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#FFFFFF', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  <Check size={16} strokeWidth={3} />
                </div>
              </div>

              <div className="profile-summary-info-text">
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-text-primary)', margin: '0 0 0.25rem', lineHeight: 1.3 }}>{user.name}</h2>
                <div style={{ margin: '0.25rem 0' }}>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                    padding: '0.35rem 0.75rem', fontSize: '0.8rem', fontWeight: 700, borderRadius: '2rem',
                    background: 'linear-gradient(135deg, #E0F2F1, #B2DFDB)',
                    border: '1px solid #4DB6AC', color: '#00695C',
                    boxShadow: '0 2px 4px rgba(0, 105, 92, 0.05)'
                  }}>
                    <Building2 size={14} />
                    <span>GC-NGO Verified</span>
                  </div>
                </div>
                <div style={{ padding: '0.4rem 0.75rem', background: 'var(--color-surface)', backdropFilter: 'blur(20px)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text-primary)', fontFamily: 'monospace' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'block', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1.2, marginBottom: '0.15rem' }}>NGO Darpan ID</span>
                  {(() => {
                    const darpan = user.ngoDarpanId || '';
                    const clean = darpan.replace(/\s/g, '');
                    return clean.slice(0, 2) + 'X'.repeat(Math.max(0, clean.length - 2));
                  })()}
                </div>
              </div>
            </div>

            {/* Group 2: Sector focus display */}
            <div className="profile-summary-stats" style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{ width: '100%', maxWidth: '240px', padding: '0.75rem 1rem', background: '#E0F2F1', borderRadius: 'var(--radius-sm)', border: '1px solid #B2DFDB', textAlign: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: '#00695C', fontWeight: 600, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.15rem' }}>Primary focus domain</span>
                <span style={{ fontSize: '1rem', fontWeight: 700, color: '#004D40' }}>{user.domain}</span>
              </div>
            </div>

            {/* Group 3: Logout Action */}
            <div className="profile-summary-actions">
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="btn"
                style={{
                  width: '100%', padding: '0.75rem 1.5rem', background: '#EF4444', color: '#FFFFFF',
                  border: 'none', borderRadius: '9999px', fontWeight: 700,
                  fontSize: '0.9rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  transition: 'all 0.2s', boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.2)'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#DC2626';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = '#EF4444';
                }}
              >
                <LogOut size={16} /> Logout
              </button>
            </div>

          </div>
        </div>

        {/* Right Info Display */}
        <div>
          <div className="glass-card" style={{ padding: '2rem' }}>
            
            {/* Header toggle */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1.5px solid #E2E8F0', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-text-primary)', margin: 0, fontFamily: 'var(--font-title)' }}>
                {isEditing ? 'Modify NGO Records' : 'NGO Verification Registry'}
              </h3>
              {!isEditing && (
                <button
                  onClick={() => {
                    setFormData({
                      name: user.name || '',
                      email: user.email || '',
                      website: user.website || '',
                      headquarters: user.headquarters || '',
                      domain: standardDomains.includes(user.domain) ? user.domain : 'Other',
                      customDomain: standardDomains.includes(user.domain) ? '' : user.domain,
                      pocName: user.pocName || '',
                      pocPhone: user.pocPhone || '',
                      pocDesignation: user.pocDesignation || '',
                      pocEmail: user.pocEmail || '',
                      about: user.about || ''
                    });
                    setIsCustomDomain(!standardDomains.includes(user.domain));
                    setOtpSent(false);
                    setOtpVerified(false);
                    setCountdown(0);
                    setOtp('');
                    setIsEditing(true);
                  }}
                  className="btn btn-outline"
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Edit3 size={14} /> Edit Details
                </button>
              )}
            </div>

            {/* Display/Edit form */}
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                
                {/* NGO Name */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Organization Registered Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      required
                      className="form-input"
                      style={{ color: 'var(--color-text-primary)', background: 'var(--color-surface)', backdropFilter: 'blur(20px)', border: '1.5px solid var(--color-border)' }}
                      value={formData.name}
                      onChange={handleChange}
                    />
                  ) : (
                    <div style={{ padding: '0.75rem 1rem', background: 'var(--color-surface)', backdropFilter: 'blur(20px)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)', fontWeight: 600 }}>
                      {user.name}
                    </div>
                  )}
                </div>

                {/* Grid for Email & Website */}
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  
                  {/* Official Email */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Official NGO Email ID</label>
                    {isEditing ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <input
                            type="email"
                            name="email"
                            required
                            disabled={otpVerified && formData.email !== user?.email}
                            className="form-input"
                            style={{ flex: 1, color: 'var(--color-text-primary)', background: (otpVerified && formData.email !== user?.email) ? '#E2E8F0' : '#FFFFFF', border: '1.5px solid var(--color-border)' }}
                            value={formData.email}
                            onChange={handleChange}
                          />
                          {formData.email !== user?.email && !otpVerified && (
                            <button
                              type="button"
                              onClick={handleSendOtp}
                              disabled={countdown > 0}
                              style={{ padding: '0.6rem 1rem', background: countdown > 0 ? '#94A3B8' : '#4A6741', color: '#FFFFFF', border: 'none', borderRadius: '0.5rem', fontWeight: 700, fontSize: '0.8rem', cursor: countdown > 0 ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}
                            >
                              {countdown > 0 ? `Resend in ${countdown}s` : (otpSent ? 'Resend' : 'Send OTP')}
                            </button>
                          )}
                        </div>
                        {formData.email !== user?.email && otpSent && !otpVerified && (
                          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                            <input
                              type="text"
                              maxLength={6}
                              placeholder="Enter 6-digit OTP"
                              value={otp}
                              onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                              style={{ flex: 1, padding: '0.5rem 0.75rem', border: '1.5px solid var(--color-border)', borderRadius: '0.5rem', fontSize: '0.9rem', textAlign: 'center', letterSpacing: '0.2em', fontWeight: 700 }}
                            />
                            <button
                              type="button"
                              onClick={handleVerifyOtp}
                              style={{ padding: '0.5rem 1rem', background: '#3D5A34', color: '#FFFFFF', border: 'none', borderRadius: '0.5rem', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', whiteSpace: 'nowrap' }}
                            >
                              Verify OTP
                            </button>
                          </div>
                        )}
                        {formData.email !== user?.email && otpVerified && (
                          <div style={{ fontSize: '0.8rem', color: '#2E7D32', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <Check size={14} /> New email verified successfully.
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{ padding: '0.75rem 1rem', background: 'var(--color-surface)', backdropFilter: 'blur(20px)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)', fontWeight: 600, display: "flex", alignItems: "center", gap: "0.5rem", wordBreak: "break-all" }}>
                        <Mail size={15} style={{ color: 'var(--color-text-muted)' }} />
                        {user.email}
                      </div>
                    )}
                  </div>

                  {/* Website */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Website / Web Portal</label>
                    {isEditing ? (
                      <input
                        type="url"
                        name="website"
                        className="form-input"
                        style={{ color: 'var(--color-text-primary)', background: 'var(--color-surface)', backdropFilter: 'blur(20px)', border: '1.5px solid var(--color-border)' }}
                        value={formData.website}
                        onChange={handleChange}
                        placeholder="https://example.org"
                      />
                    ) : (
                      <div style={{ padding: '0.75rem 1rem', background: 'var(--color-surface)', backdropFilter: 'blur(20px)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Globe size={15} style={{ color: 'var(--color-text-muted)' }} />
                        {user.website ? (
                          <a href={user.website} target="_blank" rel="noopener noreferrer" style={{ color: '#00695C', textDecoration: 'underline' }}>
                            {user.website}
                          </a>
                        ) : (
                          <span style={{ color: '#94A3B8', fontStyle: 'italic' }}>Not provided</span>
                        )}
                      </div>
                    )}
                  </div>

                </div>

                {/* HQ Headquarters Address */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Headquarters Address</label>
                  {isEditing ? (
                    <textarea
                      name="headquarters"
                      required
                      className="form-input"
                      rows="3"
                      style={{ color: 'var(--color-text-primary)', background: 'var(--color-surface)', backdropFilter: 'blur(20px)', border: '1.5px solid var(--color-border)', minHeight: 80, resize: 'vertical', padding: '0.6rem 0.75rem' }}
                      value={formData.headquarters}
                      onChange={handleChange}
                      placeholder="Full official office headquarters address"
                    />
                  ) : (
                    <div style={{ padding: '0.85rem 1rem', background: 'var(--color-surface)', backdropFilter: 'blur(20px)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)', fontWeight: 600, display: 'flex', alignItems: 'flex-start', gap: '0.5rem', lineHeight: 1.5 }}>
                      <MapPin size={16} style={{ color: 'var(--color-text-muted)', marginTop: '0.15rem', flexShrink: 0 }} />
                      <span style={{ whiteSpace: 'pre-wrap' }}>{user.headquarters}</span>
                    </div>
                  )}
                </div>

                {/* About NGO */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>About NGO</label>
                  {isEditing ? (
                    <textarea
                      name="about"
                      className="form-input"
                      rows="3"
                      style={{ color: 'var(--color-text-primary)', background: 'var(--color-surface)', backdropFilter: 'blur(20px)', border: '1.5px solid var(--color-border)', minHeight: 80, resize: 'vertical', padding: '0.6rem 0.75rem' }}
                      value={formData.about}
                      onChange={handleChange}
                      placeholder="Write about your NGO..."
                    />
                  ) : (
                    <div style={{ padding: '0.85rem 1rem', background: 'var(--color-surface)', backdropFilter: 'blur(20px)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)', fontWeight: 600, display: 'flex', alignItems: 'flex-start', gap: '0.5rem', lineHeight: 1.5 }}>
                      <span style={{ whiteSpace: 'pre-wrap' }}>{user.about || 'No information provided.'}</span>
                    </div>
                  )}
                </div>

                {/* Focus Domain & REDACT PIN / sensitive row */}
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  
                  {/* Focus Domain Select */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>NGO Core Focus Domain</label>
                    {isEditing ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <select
                          className="form-input"
                          style={{ color: 'var(--color-text-primary)', background: 'var(--color-surface)', backdropFilter: 'blur(20px)', border: '1.5px solid var(--color-border)' }}
                          value={formData.domain}
                          onChange={handleDomainChange}
                        >
                          {standardDomains.map(dom => (
                            <option key={dom} value={dom}>{dom}</option>
                          ))}
                          <option value="Other">Other Focus Domain</option>
                        </select>
                        {isCustomDomain && (
                          <input
                            type="text"
                            name="customDomain"
                            required
                            placeholder="Specify custom focus domain"
                            className="form-input animate-fade-in"
                            style={{ color: 'var(--color-text-primary)', background: 'var(--color-surface)', backdropFilter: 'blur(20px)', border: '1.5px solid var(--color-border)' }}
                            value={formData.customDomain}
                            onChange={handleChange}
                          />
                        )}
                      </div>
                    ) : (
                      <div style={{ padding: '0.75rem 1rem', background: 'var(--color-surface)', backdropFilter: 'blur(20px)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Shield size={15} style={{ color: 'var(--color-text-muted)' }} />
                        {user.domain} Focus
                      </div>
                    )}
                  </div>

                  {/* Redacted PIN Data */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#EF4444', textTransform: 'uppercase', letterSpacing: '0.04em' }}>NGO Security Pin</label>
                    <div style={{ padding: '0.75rem 1rem', background: '#FEF2F2', borderRadius: 'var(--radius-sm)', border: '1px dashed #FCA5A5', color: '#C62828', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#EF4444' }} />
                      Verification PIN Redacted (Security Protocol)
                    </div>
                  </div>

                </div>

                {/* Sub-Section: Point of Contact (POC) Records */}
                <div style={{ borderTop: '1px solid var(--color-border)', marginTop: '1rem', paddingTop: '1rem' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <User size={16} style={{ color: '#00695C' }} /> Point of Contact (POC) Details
                  </h4>

                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    
                    {/* POC Name */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>POC Full Name</label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="pocName"
                          required
                          className="form-input"
                          style={{ color: 'var(--color-text-primary)', background: 'var(--color-surface)', backdropFilter: 'blur(20px)', border: '1.5px solid var(--color-border)' }}
                          value={formData.pocName}
                          onChange={handleChange}
                        />
                      ) : (
                        <div style={{ padding: '0.75rem 1rem', background: 'var(--color-surface)', backdropFilter: 'blur(20px)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)', fontWeight: 600 }}>
                          {user.pocName}
                        </div>
                      )}
                    </div>

                    {/* POC Designation */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>POC Designation</label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="pocDesignation"
                          required
                          className="form-input"
                          style={{ color: 'var(--color-text-primary)', background: 'var(--color-surface)', backdropFilter: 'blur(20px)', border: '1.5px solid var(--color-border)' }}
                          value={formData.pocDesignation}
                          onChange={handleChange}
                        />
                      ) : (
                        <div style={{ padding: '0.75rem 1rem', background: 'var(--color-surface)', backdropFilter: 'blur(20px)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)', fontWeight: 600 }}>
                          {user.pocDesignation || 'Director'}
                        </div>
                      )}
                    </div>

                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
                    
                    {/* POC Phone */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>POC Phone Number</label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="pocPhone"
                          required
                          className="form-input"
                          style={{ color: 'var(--color-text-primary)', background: 'var(--color-surface)', backdropFilter: 'blur(20px)', border: '1.5px solid var(--color-border)' }}
                          value={formData.pocPhone}
                          onChange={handleChange}
                          placeholder="10-digit number"
                        />
                      ) : (
                        <div style={{ padding: '0.75rem 1rem', background: 'var(--color-surface)', backdropFilter: 'blur(20px)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Phone size={14} style={{ color: 'var(--color-text-muted)' }} />
                          +91 {user.pocPhone}
                        </div>
                      )}
                    </div>

                    {/* POC Email */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>POC Official Email</label>
                      {isEditing ? (
                        <input
                          type="email"
                          name="pocEmail"
                          required
                          className="form-input"
                          style={{ color: 'var(--color-text-primary)', background: 'var(--color-surface)', backdropFilter: 'blur(20px)', border: '1.5px solid var(--color-border)' }}
                          value={formData.pocEmail}
                          onChange={handleChange}
                        />
                      ) : (
                        <div style={{ padding: '0.75rem 1rem', background: 'var(--color-surface)', backdropFilter: 'blur(20px)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Mail size={14} style={{ color: 'var(--color-text-muted)' }} />
                          {user.pocEmail}
                        </div>
                      )}
                    </div>

                  </div>

                </div>

              </div>

              {/* Action Save/Discard buttons */}
              {isEditing && (
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', borderTop: '1px solid var(--color-border)', paddingTop: '1.25rem' }}>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="btn btn-outline"
                    style={{ flex: 1 }}
                  >
                    Discard Changes
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'linear-gradient(135deg, #00695C, #4DB6AC)' }}
                  >
                    <Save size={16} /> Save Settings
                  </button>
                </div>
              )}

            </form>

          </div>
        </div>

      </div>

      {/* Logout modal */}
      {showLogoutConfirm && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(8px)',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div className="glass-card animate-fade-in" style={{
            width: '90%', maxWidth: 400, padding: '2rem',
            textAlign: 'center', border: '1px solid rgba(255, 255, 255, 0.25)',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            background: 'var(--color-surface)', backdropFilter: 'blur(20px)', borderRadius: '1.25rem',
            color: 'var(--color-text-primary)'
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%', background: '#FEF2F2',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.25rem', color: '#EF4444'
            }}>
              <LogOut size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>
              Confirm NGO Logout
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '1.75rem', lineHeight: 1.5 }}>
              Do you want to logout? Any unsaved changes in your session will be cleared.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="btn"
                style={{
                  flex: 1, padding: '0.75rem', background: 'var(--color-surface-hover)', backdropFilter: 'blur(12px)', color: 'var(--color-text-secondary)',
                  border: '1px solid #CBD5E1', borderRadius: '0.5rem', fontWeight: 600, cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowLogoutConfirm(false);
                  logout();
                  navigate('/');
                }}
                className="btn"
                style={{
                  flex: 1, padding: '0.75rem 1.5rem', background: '#EF4444', color: '#FFFFFF',
                  border: 'none', borderRadius: '9999px', fontWeight: 700, cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  transition: 'all 0.2s ease', outline: 'none', boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.2)'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#DC2626'}
                onMouseLeave={e => e.currentTarget.style.background = '#EF4444'}
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default NgoProfile;
