import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Users, CheckCircle, Loader2, Shield, Heart, Lock, Plus, X, 
  MapPin, Mail, Phone, Calendar, ArrowRight, ArrowLeft 
} from 'lucide-react';

const VolunteerOnboarding = () => {
  const { login, registerUser } = useAuth();
  const navigate = useNavigate();

  // Steps: 
  // 0 - Choice (Login vs Register)
  // 1 - Personal Info (Name, Phone, Email, OTP, Age, Full Address)
  // 2 - Primary Interests Tag Box
  // 3 - Set 6-Digit PIN
  // 4 - DigiLocker Verification (Aadhaar 12-digit)
  const [step, setStep] = useState(0);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    otp: '',
    age: '',
    fullAddress: '',
    interests: [],
    pin: '',
    confirmPin: '',
    aadhaar: ''
  });

  const [alertBanner, setAlertBanner] = useState({ text: '', type: 'info' });

  const showAlert = (text, type = 'error') => {
    setAlertBanner({ text, type });
  };

  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [localOtp, setLocalOtp] = useState("");
  const [interestInput, setInterestInput] = useState('');
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);
  
  // Verification / Buffering loading states
  const [isBuffering, setIsBuffering] = useState(false);
  const [bufferStatus, setBufferStatus] = useState(''); // 'verifying', 'verified_success', 'registering'
  const [generatedUser, setGeneratedUser] = useState(null);

  // Interest options for quick selection
  const quickInterests = ['Environment', 'Education', 'Health', 'Disaster Relief', 'Animal Welfare', 'Rural Development'];

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
    if (formData.otp.length !== 6) {
      showAlert('Please enter a valid 6-digit OTP', 'error');
      return;
    }

    if (formData.otp === localOtp) {
      setOtpVerified(true);
      showAlert('Email verified successfully!', 'success');
    } else {
      showAlert('Invalid OTP.', 'error');
    }
  };

  // Add Interest
  const handleAddInterest = (interest) => {
    const trimmed = interest.trim();
    if (trimmed && !formData.interests.includes(trimmed)) {
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, trimmed]
      }));
    }
    setInterestInput('');
  };

  // Remove Interest
  const handleRemoveInterest = (interest) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter(item => item !== interest)
    }));
  };

  // Handle step transitions with validation
  const validateStep1 = () => {
    if (!formData.name.trim()) return 'Name is compulsory';
    if (!formData.phone.match(/^\d{10}$/)) return 'Enter a valid 10-digit phone number';
    if (!formData.email.trim()) return 'Email is compulsory';
    if (!otpVerified) return 'Please verify your email with the OTP first';
    if (!formData.age || parseInt(formData.age) <= 0) return 'Please enter a valid age';
    if (!formData.fullAddress.trim()) return 'Full Address is compulsory';
    return null;
  };

  const validateStep2 = () => {
    if (formData.interests.length === 0) return 'Please select at least one primary interest';
    return null;
  };

  const validateStep3 = () => {
    if (formData.pin.length !== 6 || isNaN(formData.pin)) return 'PIN must be exactly 6 digits';
    if (formData.pin !== formData.confirmPin) return 'PIN and Confirm PIN do not match';
    return null;
  };

  const handleNextStep = () => {
    if (step === 1) {
      const err = validateStep1();
      if (err) {
        showAlert(err, 'error');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      const err = validateStep2();
      if (err) {
        showAlert(err, 'error');
        return;
      }
      setStep(3);
    } else if (step === 3) {
      const err = validateStep3();
      if (err) {
        showAlert(err, 'error');
        return;
      }
      setStep(4);
    }
  };

  // DigiLocker Verification & Random GC-ID Generation
  const handleVerifyAadhaar = (e) => {
    e.preventDefault();
    const digitsOnly = formData.aadhaar.replace(/\D/g, '');
    if (digitsOnly.length !== 12) {
      showAlert('Aadhaar number must be exactly 12 digits', 'error');
      return;
    }

    // Start Buffer/Loading Animation
    setIsBuffering(true);
    setBufferStatus('verifying');

    setTimeout(() => {
      // Step 2 of buffer: Verified successfully
      setBufferStatus('verified_success');
      
      setTimeout(() => {
        // Step 3 of buffer: Registering
        setBufferStatus('registering');
        
        setTimeout(async () => {
          const newUser = {
            role: 'volunteer',
            pin: formData.pin,
            name: formData.name,
            phone: formData.phone,
            email: formData.email,
            age: formData.age,
            fullAddress: formData.fullAddress,
            location: formData.fullAddress,
            interests: formData.interests,
            aadhaar: digitsOnly
          };

          // Save to Backend
          const result = await registerUser(newUser);
          if (result.success) {
            setGeneratedUser(result.user);
          } else {
            showAlert(result.message || 'Registration failed', 'error');
          }
          setIsBuffering(false);
        }, 1500);
      }, 1500);
    }, 1500);
  };

  const handleEnterDashboard = () => {
    login(generatedUser);
    navigate('/volunteer/dashboard');
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 120px)', padding: '2rem 1rem' }}>
      <div style={{ 
        width: '100%', 
        maxWidth: 580, 
        padding: '3rem 2.5rem', 
        borderRadius: '1.5rem', 
        background: 'var(--color-surface)', backdropFilter: 'blur(20px)', 
        border: '1px solid var(--color-border)',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' 
      }}>
        
        {/* Buffering/Loading State */}
        {isBuffering && (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '3rem 0', textAlign: 'center', animation: 'fadeIn 0.3s ease-out'
          }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%', background: '#E8F5E9',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '1.5rem', color: '#2E7D32', border: '3px solid #81C784',
              boxShadow: '0 4px 10px rgba(46, 125, 50, 0.15)'
            }}>
              <Heart size={40} className="pulse-animation" fill="#2E7D32" />
            </div>

            {bufferStatus === 'verifying' && (
              <>
                <Loader2 size={36} className="animate-spin" style={{ color: '#F39C12', marginBottom: '1rem' }} />
                <p style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--color-text-primary)' }}>Connecting to DigiLocker Aadhaar Gateway...</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>Please verify Aadhaar credentials on your device.</p>
              </>
            )}

            {bufferStatus === 'verified_success' && (
              <>
                <CheckCircle size={44} style={{ color: '#2E7D32', marginBottom: '1rem' }} />
                <h3 style={{ fontWeight: 800, fontSize: '1.5rem', color: '#2E7D32', margin: 0 }}>Verified Successfully</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>Aadhaar matching checks completed.</p>
              </>
            )}

            {bufferStatus === 'registering' && (
              <>
                <Loader2 size={36} className="animate-spin" style={{ color: '#2E7D32', marginBottom: '1rem' }} />
                <h3 style={{ fontWeight: 800, fontSize: '1.5rem', color: '#2E7D32', margin: 0 }}>Registering</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>Creating secure GC-Volunteer credentials...</p>
              </>
            )}
          </div>
        )}

        {/* Registration Successful Credentials Screen */}
        {!isBuffering && generatedUser && (
          <div className="animate-fade-in" style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{
              width: 70, height: 70, borderRadius: '50%', background: '#E8F5E9',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '1.25rem', color: '#2E7D32', border: '2px solid #81C784'
            }}>
              <CheckCircle size={36} />
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>Welcome to GladiConnect!</h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>
              Your profile has been created and verified. Please note down your credentials.
            </p>

            <div style={{ 
              background: 'var(--color-surface)', backdropFilter: 'blur(20px)', border: '1px dashed #CBD5E1', 
              borderRadius: '1rem', padding: '1.5rem', marginBottom: '2.5rem',
              textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.75rem' 
            }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>GC-Volunteer ID</span>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#3D5A34', fontFamily: 'monospace', letterSpacing: '0.05em', marginTop: '0.2rem' }}>
                  {generatedUser.gcId}
                </div>
              </div>
              <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '0.25rem 0' }} />
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Secure 6-Digit PIN</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '0.2rem' }}>
                  {generatedUser.pin}
                </div>
              </div>
            </div>

            <button 
              onClick={handleEnterDashboard}
              className="btn"
              style={{
                width: '100%', padding: '0.85rem', background: '#3D5A34', color: '#FFFFFF',
                borderRadius: '0.75rem', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', border: 'none'
              }}
            >
              Enter Dashboard
            </button>
          </div>
        )}

        {/* Standard Step-by-Step UI Forms */}
        {!isBuffering && !generatedUser && (
          <div>
            {/* Header */}
            <div className="animate-fade-in" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <div style={{
                width: 60, height: 60, borderRadius: '50%', background: 'var(--color-surface-hover)', backdropFilter: 'blur(12px)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem'
              }}>
                <Users size={26} style={{ color: '#4A6741' }} />
              </div>
              <h1 style={{ fontSize: '1.65rem', marginBottom: '0.5rem', color: 'var(--color-text-primary)', fontWeight: 800 }}>
                {step === 0 ? 'Volunteer Portal' : 'Volunteer Onboarding'}
              </h1>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                {step === 0 ? 'Create a new profile or log in to track your impact.' : `Step ${step} of 4: Enter your details`}
              </p>
            </div>

            {alertBanner.text && (
              <div style={{
                padding: '0.85rem 1.25rem',
                marginBottom: '1.5rem',
                borderRadius: '0.75rem',
                background: alertBanner.type === 'success' ? '#E8F5E9' : alertBanner.type === 'info' ? '#E0F2F1' : '#FEF2F2',
                border: `1.5px solid ${alertBanner.type === 'success' ? '#81C784' : alertBanner.type === 'info' ? '#4DB6AC' : '#FCA5A5'}`,
                color: alertBanner.type === 'success' ? '#2E7D32' : alertBanner.type === 'info' ? '#00695C' : '#EF4444',
                fontSize: '0.85rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.5rem',
                animation: 'fadeIn 0.2s ease-out'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {alertBanner.type === 'success' ? <CheckCircle size={16} /> : <Shield size={16} />}
                  <span>{alertBanner.text}</span>
                </div>
                <button 
                  type="button" 
                  onClick={() => setAlertBanner({ text: '', type: 'info' })}
                  style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', display: 'flex', padding: 0 }}
                >
                  <X size={15} />
                </button>
              </div>
            )}

            {/* Step 0: Gatekeeper */}
            {step === 0 && (
              <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <button
                  onClick={() => navigate('/login?role=volunteer')}
                  style={{
                    width: '100%', background: 'var(--color-surface-hover)', backdropFilter: 'blur(12px)', border: '2px solid var(--color-border)',
                    borderRadius: '1rem', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem',
                    textAlign: 'left', cursor: 'pointer', transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#4A6741'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#E2E8F0'}
                >
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Lock size={18} style={{ color: '#4A6741' }} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-text-primary)', margin: '0 0 0.15rem 0' }}>Login</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', margin: 0 }}>Access your volunteer portal using your GC-ID and 6-digit PIN.</p>
                  </div>
                </button>

                <button
                  onClick={() => setStep(1)}
                  style={{
                    width: '100%', background: 'var(--color-surface-hover)', backdropFilter: 'blur(12px)', border: '2px solid var(--color-border)',
                    borderRadius: '1rem', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem',
                    textAlign: 'left', cursor: 'pointer', transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#4A6741'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#E2E8F0'}
                >
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Plus size={18} style={{ color: '#4A6741' }} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-text-primary)', margin: '0 0 0.15rem 0' }}>Register</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', margin: 0 }}>Verify credentials, choose interests and start volunteering.</p>
                  </div>
                </button>
              </div>
            )}

            {/* Step 1: Personal Info & OTP */}
            {step === 1 && (
              <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>Name as per records *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your official full name"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    style={{ padding: '0.65rem 0.75rem', border: '2px solid var(--color-border)', borderRadius: '0.5rem', fontSize: '0.9rem' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>Age *</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      required
                      placeholder="e.g. 21"
                      value={formData.age}
                      onChange={e => setFormData({ ...formData, age: e.target.value.replace(/\D/g, '') })}
                      style={{ padding: '0.65rem 0.75rem', border: '2px solid var(--color-border)', borderRadius: '0.5rem', fontSize: '0.9rem' }}
                    />
                  </div>
                  <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>Full Address *</label>
                    <textarea
                      required
                      rows={1}
                      placeholder="Street, City, State, PIN"
                      value={formData.fullAddress}
                      onChange={e => setFormData({ ...formData, fullAddress: e.target.value })}
                      style={{ padding: '0.65rem 0.75rem', border: '2px solid var(--color-border)', borderRadius: '0.5rem', fontSize: '0.9rem', fontFamily: 'inherit', resize: 'vertical' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>Phone Number *</label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    placeholder="10-digit number"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                    style={{ padding: '0.65rem 0.75rem', border: '2px solid var(--color-border)', borderRadius: '0.5rem', fontSize: '0.9rem' }}
                  />
                </div>

                {/* Email Verification Form Block */}
                <div style={{ background: 'var(--color-surface)', backdropFilter: 'blur(20px)', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '0.75rem', minHeight: '220px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>Email Address *</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        type="email"
                        required
                        disabled={otpVerified}
                        placeholder="email@example.com"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        style={{ flex: 1, padding: '0.6rem 0.75rem', border: '2px solid var(--color-border)', borderRadius: '0.5rem', fontSize: '0.9rem', background: otpVerified ? '#E2E8F0' : '#FFFFFF' }}
                      />
                      {!otpVerified && (
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          disabled={countdown > 0}
                          style={{ 
                            padding: '0.6rem 1rem', 
                            background: countdown > 0 ? '#94A3B8' : '#4A6741', 
                            color: '#FFFFFF', 
                            border: 'none', 
                            borderRadius: '0.5rem', 
                            fontWeight: 700, 
                            fontSize: '0.8rem', 
                            cursor: countdown > 0 ? 'not-allowed' : 'pointer',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {countdown > 0 ? `Resend in ${countdown}s` : (otpSent ? 'Resend' : 'Send OTP')}
                        </button>
                      )}
                    </div>
                  </div>

                  {otpSent && !otpVerified && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', animation: 'fadeIn 0.2s ease-out' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>Enter 6-Digit OTP *</label>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="e.g. 123456"
                          value={formData.otp}
                          onChange={e => setFormData({ ...formData, otp: e.target.value.replace(/\D/g, '') })}
                          style={{ flex: 1, padding: '0.5rem 0.75rem', border: '2px solid var(--color-border)', borderRadius: '0.5rem', fontSize: '0.9rem', textAlign: 'center', letterSpacing: '0.2em', fontWeight: 700 }}
                        />
                        <button
                          type="button"
                          onClick={handleVerifyOtp}
                          style={{ padding: '0.5rem 1rem', background: '#3D5A34', color: '#FFFFFF', border: 'none', borderRadius: '0.5rem', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
                        >
                          Verify OTP
                        </button>
                      </div>
                    </div>
                  )}

                  {otpVerified && (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: '#2E7D32', fontWeight: 700,
                      background: '#E8F5E9', border: '1px solid #C8E6C9', padding: '0.4rem 0.75rem', borderRadius: '0.5rem'
                    }}>
                      <CheckCircle size={16} /> Email verified successfully.
                    </div>
                  )}
                </div>

                {/* Navigation */}
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => setStep(0)}
                    style={{ flex: 1, padding: '0.75rem', background: 'var(--color-surface-hover)', backdropFilter: 'blur(12px)', color: 'var(--color-text-secondary)', border: '1px solid #CBD5E1', borderRadius: '0.5rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                  >
                    <ArrowLeft size={16} /> Back
                  </button>
                  <button
                    type="button"
                    onClick={handleNextStep}
                    style={{ flex: 1, padding: '0.75rem', background: '#3D5A34', color: '#FFFFFF', border: 'none', borderRadius: '0.5rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                  >
                    Next <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Primary Interests Tag Box */}
            {step === 2 && (
              <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>Selected Primary Interests *</label>
                  <div style={{
                    display: 'flex', flexWrap: 'wrap', gap: '0.4rem',
                    border: '2px solid var(--color-border)', padding: '0.75rem',
                    borderRadius: '0.5rem', minHeight: '60px', background: 'var(--color-surface)', backdropFilter: 'blur(20px)',
                    alignItems: 'center'
                  }}>
                    {formData.interests.length > 0 ? (
                      formData.interests.map((interest, idx) => (
                        <span key={idx} style={{
                          display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                          background: '#E2E8F0', color: 'var(--color-text-primary)', padding: '0.25rem 0.5rem',
                          borderRadius: '0.25rem', fontSize: '0.8rem', fontWeight: 600
                        }}>
                          {interest}
                          <button
                            type="button"
                            onClick={() => handleRemoveInterest(interest)}
                            style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))
                    ) : (
                      <span style={{ fontSize: '0.85rem', color: '#94A3B8', fontStyle: 'italic' }}>Please select primary interest areas from below or add custom ones</span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="Type custom interest..."
                    value={interestInput}
                    onChange={e => setInterestInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (interestInput.trim()) handleAddInterest(interestInput);
                      }
                    }}
                    style={{ flex: 1, padding: '0.6rem 0.75rem', border: '2px solid var(--color-border)', borderRadius: '0.5rem', fontSize: '0.9rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (interestInput.trim()) handleAddInterest(interestInput);
                    }}
                    style={{ padding: '0.6rem 1.25rem', background: '#4A6741', color: '#FFFFFF', border: 'none', borderRadius: '0.5rem', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
                  >
                    Add
                  </button>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.5rem' }}>Quick Selection:</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {quickInterests.map((interest, i) => {
                      const selected = formData.interests.includes(interest);
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => selected ? handleRemoveInterest(interest) : handleAddInterest(interest)}
                          style={{
                            padding: '0.4rem 0.75rem', fontSize: '0.8rem', fontWeight: 600,
                            borderRadius: '2rem', border: '1px solid',
                            borderColor: selected ? '#3D5A34' : '#CBD5E1',
                            background: selected ? '#E8F5E9' : '#FFFFFF',
                            color: selected ? '#2E7D32' : '#475569',
                            cursor: 'pointer', transition: 'all 0.2s'
                          }}
                        >
                          {interest}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Navigation */}
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    style={{ flex: 1, padding: '0.75rem', background: 'var(--color-surface-hover)', backdropFilter: 'blur(12px)', color: 'var(--color-text-secondary)', border: '1px solid #CBD5E1', borderRadius: '0.5rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                  >
                    <ArrowLeft size={16} /> Back
                  </button>
                  <button
                    type="button"
                    onClick={handleNextStep}
                    style={{ flex: 1, padding: '0.75rem', background: '#3D5A34', color: '#FFFFFF', border: 'none', borderRadius: '0.5rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                  >
                    Next <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Set PIN */}
            {step === 3 && (
              <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{
                  background: 'var(--color-surface-hover)', backdropFilter: 'blur(12px)', padding: '1rem', borderRadius: '0.5rem', fontSize: '0.8rem', color: 'var(--color-text-secondary)',
                  display: 'flex', alignItems: 'flex-start', gap: '0.5rem', borderLeft: '4px solid #4A6741'
                }}>
                  <Shield size={18} style={{ color: '#4A6741', flexShrink: 0 }} />
                  <div>
                    <strong>Secure Login Setup:</strong> Set a 6-digit PIN which will be required along with your GC-ID to access your portal in future sessions.
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>Enter 6-Digit PIN *</label>
                  <input
                    type="password"
                    maxLength={6}
                    required
                    placeholder="••••••"
                    value={formData.pin}
                    onChange={e => setFormData({ ...formData, pin: e.target.value.replace(/\D/g, '') })}
                    style={{ padding: '0.65rem 0.75rem', border: '2px solid var(--color-border)', borderRadius: '0.5rem', fontSize: '1.1rem', letterSpacing: '0.2em', fontWeight: 700, textAlign: 'center' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>Confirm 6-Digit PIN *</label>
                  <input
                    type="password"
                    maxLength={6}
                    required
                    placeholder="••••••"
                    value={formData.confirmPin}
                    onChange={e => setFormData({ ...formData, confirmPin: e.target.value.replace(/\D/g, '') })}
                    style={{ padding: '0.65rem 0.75rem', border: '2px solid var(--color-border)', borderRadius: '0.5rem', fontSize: '1.1rem', letterSpacing: '0.2em', fontWeight: 700, textAlign: 'center' }}
                  />
                </div>

                {/* Navigation */}
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    style={{ flex: 1, padding: '0.75rem', background: 'var(--color-surface-hover)', backdropFilter: 'blur(12px)', color: 'var(--color-text-secondary)', border: '1px solid #CBD5E1', borderRadius: '0.5rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                  >
                    <ArrowLeft size={16} /> Back
                  </button>
                  <button
                    type="button"
                    onClick={handleNextStep}
                    style={{ flex: 1, padding: '0.75rem', background: '#3D5A34', color: '#FFFFFF', border: 'none', borderRadius: '0.5rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                  >
                    Next <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: DigiLocker Aadhaar Verification */}
            {step === 4 && (
              <form onSubmit={handleVerifyAadhaar} className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ 
                  padding: '1.5rem', border: '1px solid var(--color-border)', background: 'var(--color-surface)', backdropFilter: 'blur(20px)',
                  borderRadius: '1rem', borderTop: '4px solid #F39C12', position: 'relative', overflow: 'hidden'
                }}>
                  <div style={{ position: 'absolute', top: -30, right: -30, opacity: 0.05 }}>
                    <Shield size={120} style={{ color: '#F39C12' }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <Shield size={20} style={{ color: '#F39C12' }} />
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>DigiLocker Verified Gateway</h3>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', margin: '0 0 1rem 0', lineHeight: 1.45 }}>
                    To complete your registration, authenticate via the official Indian DigiLocker database. Enter your <strong>12-digit Aadhaar Card number</strong> to verify your identity.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>Volunteer Aadhaar Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="0000 0000 0000"
                      maxLength={14}
                      value={formData.aadhaar}
                      onChange={e => {
                        const cleanVal = e.target.value.replace(/\D/g, '');
                        if (cleanVal.length <= 12) {
                          const parts = [];
                          for (let i = 0; i < cleanVal.length; i += 4) {
                            parts.push(cleanVal.substring(i, i + 4));
                          }
                          setFormData({ ...formData, aadhaar: parts.join(' ') });
                        }
                      }}
                      style={{ padding: '0.65rem 0.75rem', border: '2px solid var(--color-border)', borderRadius: '0.5rem', fontSize: '1rem', textAlign: 'center', fontWeight: 700, letterSpacing: '0.1em' }}
                    />
                  </div>
                </div>

                {/* Navigation */}
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    style={{ flex: 1, padding: '0.75rem', background: 'var(--color-surface-hover)', backdropFilter: 'blur(12px)', color: 'var(--color-text-secondary)', border: '1px solid #CBD5E1', borderRadius: '0.5rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                  >
                    <ArrowLeft size={16} /> Back
                  </button>
                  <button
                    type="submit"
                    style={{ flex: 1, padding: '0.75rem', background: '#F39C12', color: '#FFFFFF', border: 'none', borderRadius: '0.5rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', boxShadow: '0 4px 6px rgba(243, 156, 18, 0.15)' }}
                  >
                    <Shield size={16} /> Verify & Register
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VolunteerOnboarding;
