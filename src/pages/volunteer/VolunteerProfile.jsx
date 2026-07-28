import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Calendar, Award, Heart, Edit3, ArrowLeft, Save, LogOut, Check, X } from 'lucide-react';
import ProfilePhotoUploader from '../../components/ProfilePhotoUploader';
import { jsPDF } from 'jspdf';

/* ─── Premium PDF Certificate Generator ─── */
const generateCertificate = (badge, userName) => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();

  let primaryColor = [46, 125, 50]; // emerald green for Gladiators NGO
  let accentColor = [245, 127, 23]; // golden amber
  let badgeLevel = badge.level;

  if (badgeLevel === 'Bronze') {
    primaryColor = [139, 69, 19];
    accentColor = [160, 82, 45];
  } else if (badgeLevel === 'Silver') {
    primaryColor = [112, 128, 144];
    accentColor = [192, 192, 192];
  } else if (badgeLevel === 'Gold') {
    primaryColor = [197, 160, 89];
    accentColor = [212, 175, 55];
  } else if (badgeLevel === 'Platinum') {
    primaryColor = [74, 20, 140];
    accentColor = [103, 58, 183];
  }

  // Borders
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setLineWidth(1.5);
  doc.rect(8, 8, width - 16, height - 16);

  doc.setDrawColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.setLineWidth(3);
  doc.rect(10, 10, width - 20, height - 20);

  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setLineWidth(0.5);
  doc.rect(14, 14, width - 28, height - 28);

  // Background tint
  doc.setFillColor(253, 253, 250);
  doc.rect(14.5, 14.5, width - 29, height - 29, 'F');

  // Decorative Corner Designs
  const drawCorner = (x, y, isRight, isBottom) => {
    doc.setDrawColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.setLineWidth(1);
    doc.line(x, y, x + (isRight ? -15 : 15), y);
    doc.line(x, y, x, y + (isBottom ? -15 : 15));
  };
  drawCorner(15, 15, false, false);
  drawCorner(width - 15, 15, true, false);
  drawCorner(15, height - 15, false, true);
  drawCorner(width - 15, height - 15, true, true);

  // Header Title
  doc.setTextColor(46, 125, 50);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(26);
  doc.text('GLADIATORS CONNECT', width / 2, 35, { align: 'center' });

  doc.setTextColor(100, 116, 139);
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('VERIFIED VOLUNTEER IMPACT PLATFORM', width / 2, 41, { align: 'center' });

  // Divider
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(1);
  doc.line(40, 48, width - 40, 48);

  // Certificate text
  doc.setTextColor(30, 41, 59);
  doc.setFont('Times-Roman', 'italic');
  doc.setFontSize(16);
  doc.text('This is proudly awarded to', width / 2, 62, { align: 'center' });

  // User Name
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(28);
  doc.text(userName.toUpperCase(), width / 2, 77, { align: 'center' });

  // Subtext
  doc.setTextColor(71, 85, 105);
  doc.setFont('Times-Roman', 'italic');
  doc.setFontSize(14);
  doc.text('in recognition of outstanding service and dedication as a verified volunteer,', width / 2, 90, { align: 'center' });
  doc.text('having reached the distinguished milestone and earned the credential of', width / 2, 97, { align: 'center' });

  // Badge Name
  doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(22);
  doc.text(`${badge.name} (${badge.level} Tier)`, width / 2, 112, { align: 'center' });

  // Badge Description
  doc.setTextColor(100, 116, 139);
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(11);
  doc.text(badge.description || '', width / 2, 120, { align: 'center' });

  // Date
  const dateStr = new Date(badge.earnedAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
  doc.setTextColor(71, 85, 105);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(`Date Earned: ${dateStr}`, width / 2, 135, { align: 'center' });

  // Bottom Elements
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.5);
  doc.line(40, 170, 95, 170);
  doc.setTextColor(100, 116, 139);
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Aniruddha M. Jois', 67.5, 175, { align: 'center' });
  doc.setFont('Helvetica', 'bold');
  doc.text('GLADIATORS FOUNDER', 67.5, 179, { align: 'center' });

  doc.line(width - 95, 170, width - 40, 170);
  doc.setTextColor(100, 116, 139);
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Verified via Platform Cryptography', width - 67.5, 175, { align: 'center' });
  doc.setFont('Helvetica', 'bold');
  doc.text('SYSTEM AUTHENTICATION', width - 67.5, 179, { align: 'center' });

  // Seal
  doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.circle(width / 2, 168, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('G', width / 2, 172, { align: 'center' });

  window.open(doc.output('bloburl'), '_blank');
};

const VolunteerProfile = () => {
  const { user, updateUserProfile, logout } = useAuth();
  const navigate = useNavigate();

  const [badgeData, setBadgeData] = useState({ badges: [], totalHours: 0, eventsCount: 0 });

  useEffect(() => {
    const id = user?._id || user?.gcId;
    if (!id) return;
    const fetchBadgesAndStats = async () => {
      try {
        const res = await fetch(`https://gladiators-ngo.onrender.com/api/auth/volunteer/${id}/badges`);
        if (res.ok) {
          const data = await res.json();
          setBadgeData(data);
        }
      } catch (e) {
        console.error("Error fetching badges in profile:", e);
      }
    };
    fetchBadgesAndStats();
  }, [user]);

  // Local state for editing form
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    age: user?.age || '',
    address: user?.address || user?.location || '', // fall back to location if address not defined yet
    interests: user?.interests || []
  });

  const [notification, setNotification] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [selectedBadgeModal, setSelectedBadgeModal] = useState(null);
  const [interestInput, setInterestInput] = useState('');

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

  const availableInterests = [
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
        <p style={{ margin: '1rem 0 2rem' }}>Please log in to view your volunteer profile page.</p>
        <button className="btn btn-primary" onClick={() => navigate('/login')}>Go to Login</button>
      </div>
    );
  }

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'age') {
      // Age must be digits only
      const digitsOnly = value.replace(/\D/g, '');
      setFormData(prev => ({ ...prev, [name]: digitsOnly }));
    } else if (name === 'phone') {
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

  // Add an interest tag
  const addInterest = (interest) => {
    if (interest && !formData.interests.includes(interest)) {
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, interest]
      }));
    }
  };

  // Remove an interest tag
  const removeInterest = (interestToRemove) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interestToRemove)
    }));
  };

  // Save changes
  const handleSave = (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      setNotification({ type: 'error', message: 'Name cannot be empty.' });
      return;
    }
    if (formData.phone.length !== 10) {
      setNotification({ type: 'error', message: 'Phone number must be exactly 10 digits.' });
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setNotification({ type: 'error', message: 'Please enter a valid email address.' });
      return;
    }
    if (!formData.age || parseInt(formData.age, 10) <= 0) {
      setNotification({ type: 'error', message: 'Please enter a valid age.' });
      return;
    }
    if (!formData.address.trim()) {
      setNotification({ type: 'error', message: 'Please enter your full address.' });
      return;
    }
    if (formData.email !== user?.email && !otpVerified) {
      setNotification({ type: 'error', message: 'Please verify your new email with OTP before saving.' });
      return;
    }

    // Update state in Context
    updateUserProfile({
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      age: formData.age,
      address: formData.address,
      interests: formData.interests,
      location: formData.address.split(',')[0] || formData.address // sync location for backwards-compatibility
    });

    setIsEditing(false);
    setNotification({ type: 'success', message: 'Profile updated successfully!' });
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem 1rem 3rem' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', cursor: 'pointer', color: 'var(--color-primary)', width: 'fit-content' }} onClick={() => navigate('/volunteer/dashboard')}>
        <ArrowLeft size={18} />
        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Back to Dashboard</span>
      </div>

      {/* Top Navigation / Breadcrumb */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '1.5rem' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
          Role: <span style={{ color: 'var(--color-primary)' }}>Volunteer</span>
        </span>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div style={{
          padding: '1rem',
          borderRadius: 'var(--radius-md)',
          background: notification.type === 'success' ? '#E8F5E9' : '#FFEBEE',
          border: `1.5px solid ${notification.type === 'success' ? '#81C784' : '#E57373'}`,
          color: notification.type === 'success' ? '#2E7D32' : '#C62828',
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

      {/* Main Grid Layout */}
      <div className="grid-md-3-custom">
        {/* Left Side: Summary Card (Redacts Sensitive Aadhaar/PIN) */}
        <div className="glass-card profile-sidebar" style={{ padding: '2rem' }}>
          <div className="profile-summary-container">
            
            {/* Group 1: Avatar + Name + ID */}
            <div className="profile-summary-info">
              {/* Avatar & Badges */}
              <div style={{ position: 'relative', flexShrink: 0, width: 120, height: 120 }}>
                <ProfilePhotoUploader 
                  currentPhoto={user.profilePhoto}
                  onPhotoUpdate={(base64) => updateUserProfile({ profilePhoto: base64 })}
                />
                <div style={{
                  position: 'absolute', bottom: 2, right: 2,
                  background: '#10B981', border: '2.5px solid #FFFFFF',
                  borderRadius: '50%', width: 26, height: 26,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#FFFFFF', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  <Check size={16} strokeWidth={3} />
                </div>
              </div>

              <div className="profile-summary-info-text">
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text-primary)', margin: '0 0 0.25rem' }}>{user.name}</h2>
                <div style={{ margin: '0.25rem 0' }}>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                    padding: '0.35rem 0.75rem', fontSize: '0.8rem', fontWeight: 700, borderRadius: '2rem',
                    background: 'linear-gradient(135deg, #E8F5E9, #C8E6C9)',
                    border: '1px solid #81C784', color: '#2E7D32',
                    boxShadow: '0 2px 4px rgba(46, 125, 50, 0.05)'
                  }}>
                    <Heart size={14} fill="#2E7D32" />
                    <span>GC-VLT Verified</span>
                  </div>
                </div>
                <div style={{ padding: '0.4rem 0.75rem', background: 'var(--color-surface)', backdropFilter: 'blur(20px)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text-primary)', fontFamily: 'monospace' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'block', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1.2, marginBottom: '0.15rem' }}>GladiConnect ID</span>
                  {user.gcId}
                </div>
              </div>
            </div>

            {/* Group 2: Stats Block */}
            <div className="profile-summary-stats">
              <div style={{ flex: 1, minWidth: '70px', padding: '0.75rem 0.5rem', background: '#E8F5E9', borderRadius: 'var(--radius-sm)', border: '1px solid #C8E6C9', textAlign: 'center' }}>
                <span style={{ display: 'block', fontSize: '1.25rem', fontWeight: 800, color: '#2E7D32' }}>{badgeData.totalHours}</span>
                <span style={{ fontSize: '0.7rem', color: '#2E7D32', fontWeight: 600 }}>Hours</span>
              </div>
              <div style={{ flex: 1, minWidth: '70px', padding: '0.75rem 0.5rem', background: '#FFF9C4', borderRadius: 'var(--radius-sm)', border: '1px solid #FFF59D', textAlign: 'center' }}>
                <span style={{ display: 'block', fontSize: '1.25rem', fontWeight: 800, color: '#F57F17' }}>{badgeData.badges.length}</span>
                <span style={{ fontSize: '0.7rem', color: '#F57F17', fontWeight: 600 }}>Badges</span>
              </div>
              <div style={{ flex: 1, minWidth: '70px', padding: '0.75rem 0.5rem', background: '#E3F2FD', borderRadius: 'var(--radius-sm)', border: '1px solid #BBDEFB', textAlign: 'center' }}>
                <span style={{ display: 'block', fontSize: '1.25rem', fontWeight: 800, color: '#1565C0' }}>{badgeData.eventsCount}</span>
                <span style={{ fontSize: '0.7rem', color: '#1565C0', fontWeight: 600 }}>Events</span>
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

        {/* Right Side: Professional Info Display (Redacts PIN & Aadhaar) */}
        <div>
          <div className="glass-card" style={{ padding: '2rem' }}>
            
            {/* Header section with toggle */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1.5px solid #E2E8F0', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-text-primary)', margin: 0, fontFamily: 'var(--font-title)' }}>
                {isEditing ? 'Modify Personal Records' : 'Professional Profile Record'}
              </h3>
              {!isEditing && (
                <button
                  onClick={() => {
                    setFormData({
                      name: user.name || '',
                      phone: user.phone || '',
                      email: user.email || '',
                      age: user.age || '',
                      address: user.address || user.location || '',
                      interests: user.interests || []
                    });
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

            {/* Display/Edit Form */}
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Profile Record Table (Styled elegantly) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                
                {/* Full Name */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Name (Government Records)</label>
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

                {/* Grid for Email & Phone */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="grid-sm-1">
                  
                  {/* Email */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Official Email Address</label>
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
                      <div style={{ padding: '0.75rem 1rem', background: 'var(--color-surface)', backdropFilter: 'blur(20px)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Mail size={15} style={{ color: 'var(--color-text-muted)' }} />
                        {user.email}
                      </div>
                    )}
                  </div>

                  {/* Phone */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Phone Number</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="phone"
                        required
                        className="form-input"
                        style={{ color: 'var(--color-text-primary)', background: 'var(--color-surface)', backdropFilter: 'blur(20px)', border: '1.5px solid var(--color-border)' }}
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="10-digit number"
                      />
                    ) : (
                      <div style={{ padding: '0.75rem 1rem', background: 'var(--color-surface)', backdropFilter: 'blur(20px)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Phone size={15} style={{ color: 'var(--color-text-muted)' }} />
                        +91 {user.phone}
                      </div>
                    )}
                  </div>

                </div>

                {/* Age & Sensitive Data Redaction Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="grid-sm-1">
                  
                  {/* Age */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Age (Digits only)</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="age"
                        required
                        className="form-input"
                        style={{ color: 'var(--color-text-primary)', background: 'var(--color-surface)', backdropFilter: 'blur(20px)', border: '1.5px solid var(--color-border)' }}
                        value={formData.age}
                        onChange={handleChange}
                      />
                    ) : (
                      <div style={{ padding: '0.75rem 1rem', background: 'var(--color-surface)', backdropFilter: 'blur(20px)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Calendar size={15} style={{ color: 'var(--color-text-muted)' }} />
                        {user.age} Years Old
                      </div>
                    )}
                  </div>

                  {/* Redacted Identity Verification (Aadhaar / PIN) */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#EF4444', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Aadhaar Number (Masked)</label>
                    <div style={{ padding: '0.75rem 1rem', background: '#FEF2F2', borderRadius: 'var(--radius-sm)', border: '1px dashed #FCA5A5', color: '#C62828', fontWeight: 600, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'monospace' }}>
                      <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#EF4444' }} />
                      {(() => {
                        const aadhaar = user.aadhaar || '123412341234';
                        const clean = aadhaar.replace(/\s/g, '');
                        return clean.slice(0, 2) + 'X'.repeat(Math.max(0, clean.length - 2));
                      })()}
                    </div>
                  </div>
                </div>

                {/* Full Address */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Full Delivery & Contact Address</label>
                  {isEditing ? (
                    <textarea
                      name="address"
                      required
                      className="form-input"
                      rows="3"
                      style={{ color: 'var(--color-text-primary)', background: 'var(--color-surface)', backdropFilter: 'blur(20px)', border: '1.5px solid var(--color-border)', minHeight: 80, resize: 'vertical', padding: '0.6rem 0.75rem' }}
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Enter house no, street address, locality, city, state"
                    />
                  ) : (
                    <div style={{ padding: '0.85rem 1rem', background: 'var(--color-surface)', backdropFilter: 'blur(20px)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)', fontWeight: 600, minHeight: 50, display: 'flex', alignItems: 'flex-start', gap: '0.5rem', lineHeight: 1.5 }}>
                      <MapPin size={16} style={{ color: 'var(--color-text-muted)', marginTop: '0.15rem', flexShrink: 0 }} />
                      <span style={{ whiteSpace: 'pre-wrap' }}>{user.address || user.location}</span>
                    </div>
                  )}
                </div>

                {/* Interests Tag Box */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Primary Social Impact Interests</label>
                  
                  {isEditing ? (
                    <div style={{ padding: '1rem', background: 'var(--color-surface)', backdropFilter: 'blur(20px)', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.75rem', minHeight: 38, alignItems: 'center' }}>
                        {formData.interests.length > 0 ? (
                          formData.interests.map((interest, idx) => (
                            <span key={idx} style={{
                              display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                              background: '#E2E8F0', color: 'var(--color-text-primary)', padding: '0.25rem 0.6rem',
                              borderRadius: '0.25rem', fontSize: '0.8rem', fontWeight: 600
                            }}>
                              {interest}
                              <button
                                type="button"
                                onClick={() => removeInterest(interest)}
                                style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', fontWeight: 'bold' }}
                              >
                                <X size={12} />
                              </button>
                            </span>
                          ))
                        ) : (
                          <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>Select interests from options below</span>
                        )}
                      </div>

                      {/* Options to add */}
                      <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Click to add focus areas:</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                          {availableInterests.map((interest) => {
                            const isAdded = formData.interests.includes(interest);
                            return (
                              <button
                                key={interest}
                                type="button"
                                disabled={isAdded}
                                onClick={() => addInterest(interest)}
                                style={{
                                  padding: '0.25rem 0.5rem',
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  borderRadius: '0.25rem',
                                  border: '1px solid',
                                  borderColor: isAdded ? '#CBD5E1' : '#81C784',
                                  background: isAdded ? '#F1F5F9' : '#E8F5E9',
                                  color: isAdded ? '#94A3B8' : '#2E7D32',
                                  cursor: isAdded ? 'default' : 'pointer',
                                  transition: 'all 0.1s'
                                }}
                              >
                                + {interest}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', padding: '0.5rem 0' }}>
                        {user.interests && user.interests.length > 0 ? (
                          user.interests.map((interest, idx) => (
                            <span key={idx} style={{
                              display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                              background: 'linear-gradient(135deg, #E8F5E9, #C8E6C9)',
                              border: '1px solid #81C784', color: '#2E7D32',
                              padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-sm)',
                              fontSize: '0.8rem', fontWeight: 700, boxShadow: '0 2px 4px rgba(46, 125, 50, 0.05)'
                            }}>
                              <Heart size={12} fill="#2E7D32" />
                              {interest}
                            </span>
                          ))
                        ) : (
                          <span style={{ fontStyle: 'italic', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>No social interests specified</span>
                        )}
                      </div>

                      {/* Earned Badges Box */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', borderTop: '1.5px solid #E2E8F0', paddingTop: '1.25rem', marginTop: '0.75rem' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Earned Badges & Achievements</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', padding: '0.5rem 0' }}>
                          {badgeData.badges && badgeData.badges.length > 0 ? (
                            badgeData.badges.map((badge, idx) => {
                              const imgMap = {
                                'Bronze': '/badges/bronze.png',
                                'Silver': '/badges/silver.png',
                                'Gold': '/badges/gold.png',
                                'Platinum': '/badges/platinum.png'
                              };
                              const colorMap = {
                                'Bronze': '#8B4513',
                                'Silver': '#475569',
                                'Gold': '#F57F17',
                                'Platinum': '#7C3AED'
                              };
                              return (
                                <span 
                                  key={idx} 
                                  onClick={() => setSelectedBadgeModal(badge)}
                                  style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                                    background: 'var(--color-surface)', backdropFilter: 'blur(20px)',
                                    border: `1.5px solid ${colorMap[badge.level]}44`, color: colorMap[badge.level],
                                    padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-sm)',
                                    fontSize: '0.8rem', fontWeight: 700, boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                                    cursor: 'pointer'
                                  }}
                                >
                                  <img src={imgMap[badge.level] || '/badges/bronze.png'} alt={badge.name} style={{ width: 16, height: 16, objectFit: 'contain' }} />
                                  {badge.name} ({badge.level})
                                </span>
                              );
                            })
                          ) : (
                            <span style={{ fontStyle: 'italic', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>No badges earned yet. Keep volunteering to earn awards!</span>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>

              </div>

              {/* Form Action Buttons (Save/Cancel) */}
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
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                  >
                    <Save size={16} /> Save Settings
                  </button>
                </div>
              )}

            </form>

          </div>
        </div>

      </div>

      {/* Logout Confirmation Modal Overlay */}
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
              Confirm Profile Logout
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

      {/* Badge Details & Certificate Modal */}
      {selectedBadgeModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 10000,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(12px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1rem'
        }}>
          {(() => {
            const badge = selectedBadgeModal;
            const imgMap = {
              'Bronze': '/badges/bronze.png',
              'Silver': '/badges/silver.png',
              'Gold': '/badges/gold.png',
              'Platinum': '/badges/platinum.png'
            };
            const colorMap = {
              'Bronze': 'linear-gradient(135deg, #A0522D, #8B4513)',
              'Silver': 'linear-gradient(135deg, #94A3B8, #475569)',
              'Gold': 'linear-gradient(135deg, #FCD34D, #F59E0B)',
              'Platinum': 'linear-gradient(135deg, #C084FC, #7C3AED)'
            };
            const tierColor = {
              'Bronze': '#8B4513',
              'Silver': '#475569',
              'Gold': '#F57F17',
              'Platinum': '#7C3AED'
            };

            return (
              <div 
                className="celebration-modal glass-card animate-fade-in" 
                style={{
                  width: '100%', maxWidth: 460,
                  padding: '2.5rem 2rem 2rem', textAlign: 'center',
                  background: 'var(--color-surface)', backdropFilter: 'blur(20px)',
                  borderRadius: '24px', border: `2.5px solid ${tierColor[badge.level]}`,
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
                  position: 'relative', overflow: 'hidden',
                  color: 'var(--color-text-primary)'
                }}
              >
                {/* Top Xmark button */}
                <button 
                  onClick={() => setSelectedBadgeModal(null)} 
                  style={{
                    position: 'absolute', top: 16, right: 16,
                    background: 'rgba(15, 23, 42, 0.05)', border: 'none',
                    color: 'var(--color-text-secondary)', width: 32, height: 32,
                    borderRadius: '50%', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(15, 23, 42, 0.1)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(15, 23, 42, 0.05)'}
                >
                  <X size={16} strokeWidth={2.5} />
                </button>

                {/* Badge Image Display */}
                <div 
                  className="pulsing-badge" 
                  style={{
                    width: 140, height: 140,
                    borderRadius: '50%',
                    background: colorMap[badge.level],
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 1.5rem',
                    border: '5px solid #FFFFFF',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                    padding: '16px'
                  }}
                >
                  <img 
                    src={imgMap[badge.level] || '/badges/bronze.png'} 
                    alt={badge.name} 
                    style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))' }} 
                  />
                </div>

                {/* Celebration Messages */}
                <span style={{
                  fontSize: '0.75rem', fontWeight: 800,
                  textTransform: 'uppercase', color: tierColor[badge.level],
                  letterSpacing: '0.15em', display: 'block', marginBottom: '0.5rem'
                }}>
                  Achievement Unlocked!
                </span>
                
                <h2 style={{
                  fontSize: '1.75rem', fontWeight: 900,
                  color: 'var(--color-primary)', margin: '0 0 0.5rem'
                }}>
                  Congratulations!
                </h2>

                <p style={{
                  fontSize: '0.95rem', color: 'var(--color-text-primary)',
                  lineHeight: 1.5, margin: '0 0 1.5rem',
                  padding: '0 0.5rem'
                }}>
                  You have earned the <strong style={{ color: tierColor[badge.level] }}>{badge.name}</strong> ({badge.level} Tier) for your tireless social impact and volunteer efforts! Thank you for being a Gladiator.
                </p>

                {/* Creative quote */}
                <div style={{
                  background: '#FFFBEB', border: '1.5px dashed #F59E0B',
                  borderRadius: '12px', padding: '0.85rem 1rem',
                  marginBottom: '1.75rem', color: '#B45309',
                  fontSize: '0.85rem', fontStyle: 'italic', fontWeight: 600,
                  lineHeight: 1.45
                }}>
                  "The smallest act of kindness is worth more than the grandest intention. Your contribution echoes in the hearts of the community!"
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <button 
                    onClick={() => generateCertificate(badge, user?.name || 'Volunteer')}
                    className="btn btn-primary"
                    style={{ 
                      width: '100%', padding: '0.8rem',
                      background: `linear-gradient(135deg, var(--color-primary), ${tierColor[badge.level]})`,
                      border: 'none', fontSize: '0.95rem', fontWeight: 800,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                      color: 'white'
                    }}
                  >
                    <Award size={18} /> Download Certificate (PDF)
                  </button>
                  <button 
                    onClick={() => setSelectedBadgeModal(null)}
                    className="btn btn-outline"
                    style={{ width: '100%', padding: '0.75rem', fontSize: '0.9rem', fontWeight: 700 }}
                  >
                    Close
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}

    </div>
  );
};

export default VolunteerProfile;
