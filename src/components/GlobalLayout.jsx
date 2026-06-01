import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  UserCircle, Phone, Globe, LogOut, ChevronDown, X, Heart, Building2,
  Briefcase, ShieldCheck, Check, Edit3, Save, User, MapPin, Hash, UserCheck, Trash2, Home, ArrowLeft, Award
} from 'lucide-react';

const taglines = {
  EN: [
    "Bridge the Gap. Amplify Impact.",
    "Unity. Purpose. Impact.",
    "Connecting Hearts, Empowering Communities.",
    "Bridging Action. Creating Change.",
    "Empowering Voices, Elevating Action."
  ],
  HI: [
    "खाई को पाटें। प्रभाव को बढ़ाएं।",
    "एकता। उद्देश्य। प्रभाव।",
    "दिलों को जोड़ना, समुदायों को सशक्त बनाना।",
    "कार्रवाई का सेतु। बदलाव का सृजन।",
    "आवाज को सशक्त बनाना, कार्रवाई को ऊंचा उठाना।"
  ],
  KN: [
    "ಅಂತರವನ್ನು ಕಡಿಮೆ ಮಾಡಿ. ಪ್ರಭಾವವನ್ನು ಹೆಚ್ಚಿಸಿ.",
    "ಏಕತೆ. ಉದ್ದೇಶ. ಪ್ರಭಾವ.",
    "ಹೃದಯಗಳನ್ನು ಜೋಡಿಸುವುದು, ಸಮುದಾಯಗಳನ್ನು ಸಬಲೀಕರಿಸುವುದು.",
    "ಸೇವಾ ಸೇತುವೆ. ಬದಲಾವಣೆಯ ಸೃಷ್ಟಿ.",
    "ಧ್ವನಿಗಳನ್ನು ಸಬಲೀಕರಿಸುವುದು, ಸೇವೆಯನ್ನು ಎತ್ತರಿಸುವುದು."
  ]
};

const GlobalLayout = () => {
  const { user, logout, isAuthenticated, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [interestInput, setInterestInput] = useState('');
  const [csrFocusInput, setCsrFocusInput] = useState('');
  
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  
  const getInitialLang = () => {
    const match = document.cookie.match(/googtrans=\/en\/([a-z]{2})/);
    const code = match ? match[1] : 'en';
    const langObj = [
      { code: 'en', label: 'English' },
      { code: 'hi', label: 'हिंदी' },
      { code: 'kn', label: 'ಕನ್ನಡ' }
    ].find(l => l.code === code);
    return langObj ? langObj.label : 'English';
  };
  
  const [activeLang, setActiveLang] = useState(getInitialLang());

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिंदी' },
    { code: 'kn', label: 'ಕನ್ನಡ' }
  ];

  const handleLanguageSelect = (lang) => {
    setActiveLang(lang.label);
    setShowLangDropdown(false);
    
    // Find the hidden Google Translate select element
    const select = document.querySelector('.goog-te-combo');
    if (select) {
      select.value = lang.code;
      select.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      // Fallback: set cookie and reload if widget hasn't loaded yet
      document.cookie = `googtrans=/en/${lang.code}; path=/;`;
      window.location.reload();
    }
  };

  const [badgeData, setBadgeData] = useState({ badges: [], totalHours: 0, eventsCount: 0 });
  const [newBadges, setNewBadges] = useState([]);

  const fetchBadgesAndStats = async () => {
    if (!user || user.role !== 'volunteer') return;
    const id = user._id || user.gcId;
    try {
      const res = await fetch(`http://localhost:5000/api/auth/volunteer/${id}/badges`);
      if (res.ok) {
        const data = await res.json();
        setBadgeData(data);
        
        // Find unread badges
        const unread = data.badges.filter(b => b.notified === false);
        if (unread.length > 0) {
          setNewBadges(unread);
        }
      }
    } catch (e) {
      console.error("Error fetching badges globally:", e);
    }
  };

  useEffect(() => {
    fetchBadgesAndStats();
    // Poll for new badges every 8 seconds
    const interval = setInterval(fetchBadgesAndStats, 8000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const addGoogleTranslateScript = () => {
      if (!document.querySelector('#google-translate-script')) {
        window.googleTranslateElementInit = () => {
          if (window.google && window.google.translate) {
            new window.google.translate.TranslateElement({
              pageLanguage: 'en',
              includedLanguages: 'en,hi,kn',
              layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
              autoDisplay: false
            }, 'google_translate_element');
          }
        };
        const script = document.createElement('script');
        script.id = 'google-translate-script';
        script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
        script.async = true;
        document.body.appendChild(script);
      }
    };
    addGoogleTranslateScript();
  }, []);

  const handleCloseCelebration = async () => {
    if (!user || newBadges.length === 0) return;
    const currentBadge = newBadges[0];
    const id = user._id || user.gcId;
    try {
      const res = await fetch(`http://localhost:5000/api/auth/volunteer/${id}/badges/mark-notified`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level: currentBadge.level })
      });
      if (res.ok) {
        setNewBadges(prev => prev.slice(1));
        fetchBadgesAndStats();
      }
    } catch (e) {
      console.error("Error marking badge notified globally:", e);
      setNewBadges(prev => prev.slice(1));
    }
  };

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
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(26);
    doc.text('GLADIATORS CONNECT', width / 2, 35, { align: 'center' });

    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('VERIFIED VOLUNTEER IMPACT PLATFORM', width / 2, 41, { align: 'center' });

    // Divider
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(1);
    doc.line(40, 48, width - 40, 48);

    // Certificate text
    doc.setTextColor(30, 41, 59);
    doc.setFont('times', 'italic');
    doc.setFontSize(16);
    doc.text('This is proudly awarded to', width / 2, 62, { align: 'center' });

    // User Name
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    doc.text(userName.toUpperCase(), width / 2, 77, { align: 'center' });

    // Subtext
    doc.setTextColor(71, 85, 105);
    doc.setFont('times', 'italic');
    doc.setFontSize(14);
    doc.text('in recognition of outstanding service and dedication as a verified volunteer,', width / 2, 90, { align: 'center' });
    doc.text('having reached the distinguished milestone and earned the credential of', width / 2, 97, { align: 'center' });

    // Badge Name
    doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text(`${badge.name} (${badge.level} Tier)`, width / 2, 112, { align: 'center' });

    // Badge Description
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text(badge.description || '', width / 2, 120, { align: 'center' });

    // Date
    const dateStr = new Date(badge.earnedAt).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(`Date Earned: ${dateStr}`, width / 2, 135, { align: 'center' });

    // Bottom Elements
    doc.setDrawColor(148, 163, 184);
    doc.setLineWidth(0.5);
    doc.line(40, 170, 95, 170);
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Aniruddha M. Jois', 67.5, 175, { align: 'center' });
    doc.setFont('helvetica', 'bold');
    doc.text('GLADIATORS FOUNDER', 67.5, 179, { align: 'center' });

    doc.line(width - 95, 170, width - 40, 170);
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Verified via Platform Cryptography', width - 67.5, 175, { align: 'center' });
    doc.setFont('helvetica', 'bold');
    doc.text('SYSTEM AUTHENTICATION', width - 67.5, 179, { align: 'center' });

    // Seal
    doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.circle(width / 2, 168, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('G', width / 2, 172, { align: 'center' });

    window.open(doc.output('bloburl'), '_blank');
  };

  React.useEffect(() => {
    if (user) {
      setEditFormData({ ...user });
    }
  }, [user, showEditProfileModal]);

  const [currentTaglineIndex, setCurrentTaglineIndex] = useState(0);
  const [fadeState, setFadeState] = useState('fade-in');

  const currentLanguageTaglines = taglines.EN;

  React.useEffect(() => {
    const interval = setInterval(() => {
      setFadeState('fade-out');
      setTimeout(() => {
        setCurrentTaglineIndex((prev) => (prev + 1) % currentLanguageTaglines.length);
        setFadeState('fade-in');
      }, 500);
    }, 4000);

    return () => clearInterval(interval);
  }, [currentLanguageTaglines.length]);

  const isLandingPage = location.pathname === '/';

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    navigate('/');
  };

  const handleLogoClick = () => {
    if (isAuthenticated && user?.role) {
      navigate(`/${user.role}/dashboard`);
    } else {
      if (location.pathname === '/') {
        const heroSection = document.querySelector('.hero-section');
        if (heroSection) {
          heroSection.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } else {
        navigate('/');
      }
    }
  };

  const handleBack = () => {
    if (isAuthenticated && user?.role && location.pathname.startsWith(`/${user.role}/dashboard`)) {
      setShowLogoutConfirm(true);
    } else {
      navigate(-1);
    }
  };

  const handleHome = () => {
    if (isAuthenticated && user?.role) {
      navigate(`/${user.role}/dashboard`);
    } else {
      navigate('/');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <nav className="glass-panel" style={{
        position: 'fixed', top: '1rem', left: '1.5rem', right: '1.5rem', zIndex: 50,
        padding: '0.75rem 1.5rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'transparent',
        border: '1px solid #E2E8F0',
        boxShadow: 'var(--shadow-md)',
        borderRadius: 'var(--radius-xl)'
      }}>
        {/* Left side: Logo */}
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
          onClick={handleLogoClick}
        >
          <img src="/images/logo.png" alt="GladiConnect Logo" style={{ width: 38, height: 38, objectFit: 'contain', borderRadius: '50%' }} />
          <span style={{
            fontWeight: 800, fontSize: '1.15rem',
            color: 'var(--color-text-primary)',
            letterSpacing: '-0.01em'
          }}>
            GladiConnect
          </span>
        </div>

        {/* Middle: Creative Tagline Slider */}
        <div className="hidden-mobile" style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          padding: '0 1.5rem',
          pointerEvents: 'none'
        }}>
          <span style={{
            fontSize: '0.9rem',
            fontWeight: 700,
            fontStyle: 'italic',
            letterSpacing: '0.03em',
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: 'inline-block',
            opacity: fadeState === 'fade-in' ? 1 : 0,
            transform: fadeState === 'fade-in' ? 'translateY(0)' : 'translateY(-6px)',
            transition: 'opacity 0.5s ease-in-out, transform 0.5s ease-in-out',
          }}>
            "{currentLanguageTaglines[currentTaglineIndex]}"
          </span>
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={handleBack}
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem',
              background: 'transparent', color: 'var(--color-text-secondary)', border: '1px solid #E2E8F0',
              borderRadius: 'var(--radius-md)', padding: '0.5rem 0.9rem', fontWeight: 600, fontSize: '0.8rem',
              cursor: 'pointer', transition: 'all 0.2s ease', outline: 'none'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'; e.currentTarget.style.color = 'var(--color-text-primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-text-secondary)'; }}
            title="Back"
          >
            <ArrowLeft size={15} />
            <span className="hidden-mobile">Back</span>
          </button>

          <button
            onClick={handleHome}
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem',
              background: 'rgba(255, 255, 255, 0.03)', color: 'var(--color-text-primary)', border: '1px solid #E2E8F0',
              borderRadius: 'var(--radius-md)', padding: '0.5rem 0.9rem', fontWeight: 600, fontSize: '0.8rem',
              cursor: 'pointer', transition: 'all 0.2s ease', outline: 'none'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'}
            title="Home"
          >
            <Home size={15} />
            <span className="hidden-mobile">Home</span>
          </button>

          {isAuthenticated && (
            <button
              onClick={() => setShowLogoutConfirm(true)}
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                background: '#EF4444', color: 'transparent', border: 'none',
                borderRadius: '9999px', padding: '0.5rem 1.25rem', fontWeight: 700, fontSize: '0.85rem',
                cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.2)',
                transition: 'all 0.2s ease', outline: 'none'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#DC2626'}
              onMouseLeave={e => e.currentTarget.style.background = '#EF4444'}
              title="Logout"
            >
              <LogOut size={15} />
              <span>Logout</span>
            </button>
          )}

          <button className="btn-ghost hidden-mobile" style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            border: '1px solid #E2E8F0',
            borderRadius: 'var(--radius-md)',
            padding: '0.5rem 1rem',
            background: 'rgba(255, 255, 255, 0.03)',
            cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, fontSize: '0.8rem'
          }}>
            <Phone size={15} style={{ color: 'var(--color-primary)' }} className="pulse-animation" />
            <span style={{ color: 'var(--color-text-secondary)' }}>24/7 Helpline</span>
          </button>

          {/* Custom Language Dropdown that controls hidden Google Translate */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowLangDropdown(!showLangDropdown)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.5rem 1rem', fontSize: '0.8rem', fontWeight: 600,
                borderRadius: 'var(--radius-md)', border: '1px solid #E2E8F0', cursor: 'pointer',
                fontFamily: 'inherit',
                background: 'rgba(255, 255, 255, 0.03)',
                color: 'var(--color-text-primary)',
                transition: 'all var(--transition-fast)'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'; }}
            >
              <Globe size={14} style={{ color: 'var(--color-text-secondary)' }} />
              {activeLang}
              <ChevronDown size={14} style={{ color: 'var(--color-text-secondary)', transform: showLangDropdown ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>
            
            {showLangDropdown && (
              <>
                <div onClick={() => setShowLangDropdown(false)} style={{ position: 'fixed', inset: 0, zIndex: 998 }} />
                <div style={{
                  position: 'absolute', top: 'calc(100% + 0.5rem)', right: 0, zIndex: 999,
                  background: 'transparent', border: '1px solid #E2E8F0', borderRadius: '0.5rem',
                  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', overflow: 'hidden', minWidth: '120px'
                }}>
                  {languages.map((lang) => (
                    <div
                      key={lang.code}
                      onClick={() => handleLanguageSelect(lang)}
                      style={{
                        padding: '0.6rem 1rem', fontSize: '0.85rem', fontWeight: 500,
                        cursor: 'pointer', color: activeLang === lang.label ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                        background: activeLang === lang.label ? 'rgba(255, 255, 255, 0.06)' : 'transparent',
                        borderBottom: '1px solid #F1F5F9',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'}
                      onMouseLeave={e => e.currentTarget.style.background = activeLang === lang.label ? 'rgba(255, 255, 255, 0.06)' : 'transparent'}
                    >
                      {lang.label}
                      {activeLang === lang.label && <Check size={14} color="#4A6741" />}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <div id="google_translate_element" style={{ opacity: 0, position: 'absolute', pointerEvents: 'none', zIndex: -1 }}></div>
        </div>
      </nav>

      {/* Hide the top Google Translate frame that gets injected */}
      <style>{`
        body { top: 0 !important; }
        .skiptranslate, #goog-gt-tt { display: none !important; }
      `}</style>

      {/* Click-away overlay for dropdown */}
      {showDropdown && (
        <div
          onClick={() => setShowDropdown(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 49 }}
        />
      )}

      {/* Left-Side Profile Widget */}
      {isAuthenticated && user && !isLandingPage && (
        <div style={{
          position: 'fixed', left: '1.5rem', top: '7.5rem', zIndex: 900,
          background: 'transparent',
          borderRadius: '1.25rem',
          padding: '1rem 1.25rem',
          boxShadow: 'var(--shadow-lg)',
          borderLeft: `8px solid ${
            user.role === 'volunteer' ? 'var(--color-primary)' :
            user.role === 'ngo' ? 'var(--color-primary)' : 'var(--color-accent)'
          }`,
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          animation: 'fadeIn 0.3s ease-out',
          cursor: 'pointer'
        }}
        onClick={() => navigate(`/${user.role}/profile`)}>
          {/* Left Column: Avatar */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => navigate(`/${user.role}/profile`)}
              style={{
                width: 60, height: 60, borderRadius: '50%',
                background: user.role === 'volunteer' ? 'linear-gradient(135deg, var(--color-primary-light), var(--color-primary))' :
                            user.role === 'ngo' ? 'linear-gradient(135deg, var(--color-primary-light), var(--color-primary))' :
                            'linear-gradient(135deg, var(--color-accent-light), var(--color-accent))',
                border: '2px solid #FFFFFF', color: 'transparent',
                fontSize: '1.5rem', fontWeight: 800, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: 'var(--shadow-md)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                outline: 'none',
                overflow: 'hidden'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              title="View Profile Details"
            >
              {user.profilePhoto ? (
                <img src={user.profilePhoto} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                user.name ? user.name.charAt(0).toUpperCase() : 'U'
              )}
            </button>
            {/* Check mark badge overlay on bottom right */}
            <div style={{
              position: 'absolute', bottom: -2, right: -2,
              background: '#10B981', border: '2px solid #FFFFFF',
              borderRadius: '50%', width: 20, height: 20,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'transparent', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <Check size={12} strokeWidth={3} />
            </div>
          </div>

          {/* Right Column: Name, Badge, ID */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'flex-start' }}>
            {/* Name */}
            <span style={{
              fontSize: '1.2rem',
              fontWeight: 800,
              color: 'var(--color-text-primary)',
              fontFamily: '"Outfit", "Inter", sans-serif',
              lineHeight: 1
            }}>
              {user.name}
            </span>

            {/* Verified Badge */}
            {(() => {
              const logoSize = 14;
              const iconSize = 10;
              const padding = '0.2rem 0.5rem';
              const fontSize = '0.7rem';

              if (user.role === 'volunteer') {
                return (
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                    padding, fontSize, fontWeight: 700, borderRadius: '2rem',
                    background: 'linear-gradient(135deg, #E8F5E9, #C8E6C9)',
                    border: '1px solid #81C784', color: '#2E7D32',
                    boxShadow: '0 2px 4px rgba(46, 125, 50, 0.05)'
                  }}>
                    <Heart size={iconSize} fill="#2E7D32" />
                    <span>GC-VLT Verified</span>
                  </div>
                );
              }
              if (user.role === 'ngo') {
                return (
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                    padding, fontSize, fontWeight: 700, borderRadius: '2rem',
                    background: 'linear-gradient(135deg, #E0F2F1, #B2DFDB)',
                    border: '1px solid #4DB6AC', color: 'var(--color-primary)',
                    boxShadow: '0 2px 4px rgba(0, 105, 92, 0.05)'
                  }}>
                    <Building2 size={iconSize} />
                    <span>GC-NGO Verified</span>
                  </div>
                );
              }
              if (user.role === 'company') {
                return (
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                    padding, fontSize, fontWeight: 700, borderRadius: '2rem',
                    background: 'linear-gradient(135deg, #FFF9C4, #FFF59D)',
                    border: '1px solid #FBC02D', color: '#F57F17',
                    boxShadow: '0 2px 4px rgba(245, 127, 23, 0.05)'
                  }}>
                    <Briefcase size={iconSize} />
                    <span>GC-CPY Verified</span>
                  </div>
                );
              }
            })()}

            {/* Earned Badges in Left-Side Profile Widget */}
            {user.role === 'volunteer' && badgeData.badges && badgeData.badges.length > 0 && (
              <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', margin: '0.1rem 0' }}>
                {badgeData.badges.map((badge, idx) => {
                  const imgMap = {
                    'Bronze': '/badges/bronze.png',
                    'Silver': '/badges/silver.png',
                    'Gold': '/badges/gold.png',
                    'Platinum': '/badges/platinum.png'
                  };
                  return (
                    <img 
                      key={idx} 
                      src={imgMap[badge.level]} 
                      alt={badge.name} 
                      title={`${badge.name} (${badge.level} Tier)`} 
                      style={{ width: 18, height: 18, objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }} 
                    />
                  );
                })}
              </div>
            )}

            {/* GladiConnect ID Box */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid #E2E8F0',
              borderRadius: '0.5rem',
              padding: '0.25rem 0.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '0.1rem',
              width: '100%',
              boxSizing: 'border-box'
            }}>
              <span style={{
                fontSize: '0.6rem',
                fontWeight: 700,
                color: 'var(--color-text-secondary)',
                letterSpacing: '0.05em',
                lineHeight: 1
              }}>
                GLADICONNECT ID
              </span>
              <span style={{
                fontSize: '0.85rem',
                fontWeight: 800,
                color: 'var(--color-text-primary)',
                fontFamily: 'monospace',
                lineHeight: 1
              }}>
                {user.gcId}
              </span>
            </div>
          </div>

          {/* Dropdown panel */}
          {showProfileDropdown && (
            <>
              {/* Click away layer */}
              <div 
                onClick={() => setShowProfileDropdown(false)} 
                style={{ position: 'fixed', inset: 0, zIndex: 899, background: 'transparent' }} 
              />
              <div className="glass-card animate-fade-in" style={{
                position: 'absolute', left: 0, top: '3.75rem', zIndex: 900,
                width: 320, padding: '1.5rem',
                background: 'transparent',
                border: '1px solid rgba(226, 232, 240, 0.8)',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.08)',
                borderRadius: '1.25rem'
              }}>
                {/* Header */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '1.25rem' }}>
                  <div style={{
                    width: 60, height: 60, borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--color-primary-light), var(--color-primary))',
                    color: 'transparent', fontSize: '1.5rem', fontWeight: 800,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '0.75rem', border: '3px solid #E2E8F0'
                  }}>
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>{user.name}</h4>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: 600, marginTop: '0.15rem' }}>
                    ID: {user.gcId}
                  </div>
                  <div style={{ marginTop: '0.6rem' }}>
                    {(() => {
                      const logoSize = 22;
                      const iconSize = 15;
                      const padding = '0.4rem 0.8rem';
                      const fontSize = '0.8rem';

                      if (user.role === 'volunteer') {
                        return (
                          <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                            padding, fontSize, fontWeight: 700, borderRadius: '2rem',
                            background: 'linear-gradient(135deg, #E8F5E9, #C8E6C9)',
                            border: '1px solid #81C784', color: '#2E7D32',
                            boxShadow: '0 2px 4px rgba(46, 125, 50, 0.1)'
                          }}>
                            <img src="/images/logo.png" alt="" style={{ width: logoSize, height: logoSize, borderRadius: '50%' }} />
                            <Heart size={iconSize} fill="#2E7D32" />
                            <span>GC-VLT Verified</span>
                          </div>
                        );
                      }
                      if (user.role === 'ngo') {
                        return (
                          <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                            padding, fontSize, fontWeight: 700, borderRadius: '2rem',
                            background: 'linear-gradient(135deg, #E0F2F1, #B2DFDB)',
                            border: '1px solid #4DB6AC', color: 'var(--color-primary)',
                            boxShadow: '0 2px 4px rgba(0, 105, 92, 0.1)'
                          }}>
                            <img src="/images/logo.png" alt="" style={{ width: logoSize, height: logoSize, borderRadius: '50%' }} />
                            <Building2 size={iconSize} />
                            <span>GC-NGO Verified</span>
                          </div>
                        );
                      }
                      if (user.role === 'company') {
                        return (
                          <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                            padding, fontSize, fontWeight: 700, borderRadius: '2rem',
                            background: 'linear-gradient(135deg, #FFF9C4, #FFF59D)',
                            border: '1px solid #FBC02D', color: '#F57F17',
                            boxShadow: '0 2px 4px rgba(245, 127, 23, 0.1)'
                          }}>
                            <img src="/images/logo.png" alt="" style={{ width: logoSize, height: logoSize, borderRadius: '50%' }} />
                            <Briefcase size={iconSize} />
                            <span>GC-CPY Verified</span>
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid #E2E8F0', margin: '0.75rem 0' }} />

                {/* User Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '1.25rem' }}>
                  {user.role === 'volunteer' && (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MapPin size={14} /> <span>{user.location || 'Bangalore'}</span></div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><User size={14} /> <span>Age: {user.age}</span></div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Phone size={14} /> <span>{user.phone}</span></div>
                      <div style={{ marginTop: '0.5rem' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--color-text-primary)', marginBottom: '0.25rem' }}>Interests:</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                          {user.interests?.map((interest, i) => (
                            <span key={i} style={{ background: 'rgba(255, 255, 255, 0.06)', color: 'var(--color-text-secondary)', padding: '0.15rem 0.4rem', borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: 600 }}>{interest}</span>
                          )) || <span style={{ fontStyle: 'italic' }}>None specified</span>}
                        </div>
                      </div>
                    </>
                  )}
                  {user.role === 'ngo' && (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MapPin size={14} /> <span>HQ: {user.headquarters || 'Bangalore'}</span></div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Globe size={14} /> <a href={user.website} target="_blank" rel="noreferrer" style={{ color: 'var(--color-primary-dark)', textDecoration: 'none', fontWeight: 600 }}>{user.website ? user.website.replace(/^https?:\/\//, '') : 'Website'}</a></div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><User size={14} /> <span>POC: {user.pocName} ({user.pocDesignation})</span></div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Phone size={14} /> <span>{user.pocPhone}</span></div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Hash size={14} /> <span style={{ fontSize: '0.75rem', wordBreak: 'break-all' }}>Darpan ID: {user.ngoDarpanId}</span></div>
                    </>
                  )}
                  {user.role === 'company' && (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MapPin size={14} /> <span>HQ: {user.headquarters || 'Mumbai'}</span></div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Globe size={14} /> <a href={user.website} target="_blank" rel="noreferrer" style={{ color: 'var(--color-primary-dark)', textDecoration: 'none', fontWeight: 600 }}>{user.website ? user.website.replace(/^https?:\/\//, '') : 'Website'}</a></div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><User size={14} /> <span>POC: {user.pocName} ({user.pocDesignation})</span></div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Phone size={14} /> <span>{user.pocPhone}</span></div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Hash size={14} /> <span style={{ fontSize: '0.75rem', wordBreak: 'break-all' }}>CIN: {user.cin}</span></div>
                      <div style={{ marginTop: '0.5rem' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--color-text-primary)', marginBottom: '0.25rem' }}>Preferred CSR Focus:</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                          {user.csrFocus?.map((focus, i) => (
                            <span key={i} style={{ background: '#FFF9C4', color: '#F57F17', padding: '0.15rem 0.4rem', borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: 600 }}>{focus}</span>
                          )) || <span style={{ fontStyle: 'italic' }}>None specified</span>}
                        </div>
                      </div>
                    </>
                  )}
                </div>
                {/* Action Buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <button
                    onClick={() => {
                      setShowProfileDropdown(false);
                      setShowEditProfileModal(true);
                    }}
                    style={{
                      width: '100%', padding: '0.6rem', background: 'rgba(255, 255, 255, 0.06)', color: 'var(--color-text-primary)',
                      border: '1px solid #CBD5E1', borderRadius: '0.5rem', fontWeight: 700,
                      fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem'
                    }}
                  >
                    <Edit3 size={15} /> Edit Profile
                  </button>
                  <button
                    onClick={() => {
                      setShowProfileDropdown(false);
                      setShowLogoutConfirm(true);
                    }}
                    style={{
                      width: '100%', padding: '0.6rem 1.25rem', background: '#EF4444', color: 'transparent',
                      border: 'none', borderRadius: '9999px', fontWeight: 700,
                      fontSize: '0.85rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                      transition: 'all 0.2s ease', outline: 'none', boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.2)'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#DC2626'}
                    onMouseLeave={e => e.currentTarget.style.background = '#EF4444'}
                  >
                    <LogOut size={15} /> Logout
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Main Content */}
      <main className={isLandingPage ? '' : `container ${isAuthenticated ? 'dashboard-content-shifted' : ''}`} style={{ flex: 1, paddingTop: isLandingPage ? 0 : '7.5rem', paddingBottom: isLandingPage ? 0 : '1.5rem' }}>
        <Outlet />
      </main>

      <footer style={{
        textAlign: 'center',
        padding: '1rem',
        color: 'transparent',
        fontSize: '0.9rem',
        fontWeight: 600,
        letterSpacing: '0.02em',
        background: 'transparent'
      }}>
        Made for the world by Gladiators
      </footer>

      {/* Edit Profile Modal */}
      {showEditProfileModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(8px)',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div className="glass-card animate-fade-in" style={{
            width: '90%', maxWidth: 500, padding: '2rem',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            background: 'transparent', borderRadius: '1.25rem',
            color: 'var(--color-text-primary)', maxHeight: '90vh', overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                <Edit3 size={20} style={{ color: 'var(--color-primary)' }} /> Edit Profile Details
              </h3>
              <button
                onClick={() => setShowEditProfileModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', padding: 0 }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              updateUserProfile(editFormData);
              setShowEditProfileModal(false);
            }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              {/* Common fields based on role */}
              {editFormData.role === 'volunteer' && (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>Name as per records</label>
                    <input
                      type="text"
                      required
                      value={editFormData.name || ''}
                      onChange={e => setEditFormData({ ...editFormData, name: e.target.value })}
                      style={{ padding: '0.6rem 0.75rem', border: '1px solid #CBD5E1', borderRadius: '0.375rem', fontSize: '0.9rem' }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>Phone Number</label>
                      <input
                        type="text"
                        required
                        value={editFormData.phone || ''}
                        onChange={e => setEditFormData({ ...editFormData, phone: e.target.value })}
                        style={{ padding: '0.6rem 0.75rem', border: '1px solid #CBD5E1', borderRadius: '0.375rem', fontSize: '0.9rem' }}
                      />
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>Age</label>
                      <input
                        type="number"
                        required
                        value={editFormData.age || ''}
                        onChange={e => setEditFormData({ ...editFormData, age: e.target.value })}
                        style={{ padding: '0.6rem 0.75rem', border: '1px solid #CBD5E1', borderRadius: '0.375rem', fontSize: '0.9rem' }}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>Email</label>
                      <input
                        type="email"
                        required
                        value={editFormData.email || ''}
                        onChange={e => setEditFormData({ ...editFormData, email: e.target.value })}
                        style={{ padding: '0.6rem 0.75rem', border: '1px solid #CBD5E1', borderRadius: '0.375rem', fontSize: '0.9rem' }}
                      />
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>Location</label>
                      <input
                        type="text"
                        required
                        value={editFormData.location || ''}
                        onChange={e => setEditFormData({ ...editFormData, location: e.target.value })}
                        style={{ padding: '0.6rem 0.75rem', border: '1px solid #CBD5E1', borderRadius: '0.375rem', fontSize: '0.9rem' }}
                      />
                    </div>
                  </div>

                  {/* Volunteer Tag Interests */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>Primary Interests</label>
                    <div style={{
                      display: 'flex', flexWrap: 'wrap', gap: '0.4rem',
                      border: '1px solid #E2E8F0', padding: '0.5rem',
                      borderRadius: '0.375rem', minHeight: '45px', background: 'rgba(255, 255, 255, 0.03)',
                      alignItems: 'center'
                    }}>
                      {editFormData.interests && editFormData.interests.length > 0 ? (
                        editFormData.interests.map((interest, idx) => (
                          <span key={idx} style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                            background: 'var(--color-border)', color: 'var(--color-text-primary)', padding: '0.2rem 0.5rem',
                            borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: 600
                          }}>
                            {interest}
                            <button
                              type="button"
                              onClick={() => {
                                setEditFormData(prev => ({
                                  ...prev,
                                  interests: prev.interests.filter(item => item !== interest)
                                }));
                              }}
                              style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
                            >
                              <X size={12} />
                            </button>
                          </span>
                        ))
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>No interests selected yet</span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                      <input
                        type="text"
                        placeholder="Add an interest..."
                        value={interestInput}
                        onChange={e => setInterestInput(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (interestInput.trim() && !editFormData.interests?.includes(interestInput.trim())) {
                              setEditFormData(prev => ({
                                ...prev,
                                interests: [...(prev.interests || []), interestInput.trim()]
                              }));
                              setInterestInput('');
                            }
                          }
                        }}
                        style={{ flex: 1, padding: '0.5rem 0.75rem', border: '1px solid #CBD5E1', borderRadius: '0.375rem', fontSize: '0.85rem' }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (interestInput.trim() && !editFormData.interests?.includes(interestInput.trim())) {
                            setEditFormData(prev => ({
                              ...prev,
                              interests: [...(prev.interests || []), interestInput.trim()]
                            }));
                            setInterestInput('');
                          }
                        }}
                        style={{ padding: '0.5rem 1rem', background: 'var(--color-primary-dark)', color: 'transparent', border: 'none', borderRadius: '0.375rem', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </>
              )}

              {editFormData.role === 'ngo' && (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>Name of the NGO</label>
                    <input
                      type="text"
                      required
                      value={editFormData.name || ''}
                      onChange={e => setEditFormData({ ...editFormData, name: e.target.value })}
                      style={{ padding: '0.6rem 0.75rem', border: '1px solid #CBD5E1', borderRadius: '0.375rem', fontSize: '0.9rem' }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>Official Email ID</label>
                      <input
                        type="email"
                        required
                        value={editFormData.email || ''}
                        onChange={e => setEditFormData({ ...editFormData, email: e.target.value })}
                        style={{ padding: '0.6rem 0.75rem', border: '1px solid #CBD5E1', borderRadius: '0.375rem', fontSize: '0.9rem' }}
                      />
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>Official Website URL</label>
                      <input
                        type="url"
                        required
                        value={editFormData.website || ''}
                        onChange={e => setEditFormData({ ...editFormData, website: e.target.value })}
                        style={{ padding: '0.6rem 0.75rem', border: '1px solid #CBD5E1', borderRadius: '0.375rem', fontSize: '0.9rem' }}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>Headquarters Address</label>
                    <input
                      type="text"
                      required
                      value={editFormData.headquarters || ''}
                      onChange={e => setEditFormData({ ...editFormData, headquarters: e.target.value })}
                      style={{ padding: '0.6rem 0.75rem', border: '1px solid #CBD5E1', borderRadius: '0.375rem', fontSize: '0.9rem' }}
                    />
                  </div>

                  <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #E2E8F0', marginTop: '0.5rem' }}>
                    <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>Primary Point of Contact Details</h4>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem' }}>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>Full Name</label>
                        <input
                          type="text"
                          required
                          value={editFormData.pocName || ''}
                          onChange={e => setEditFormData({ ...editFormData, pocName: e.target.value })}
                          style={{ padding: '0.5rem 0.6rem', border: '1px solid #CBD5E1', borderRadius: '0.375rem', fontSize: '0.85rem' }}
                        />
                      </div>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>Phone Number</label>
                        <input
                          type="text"
                          required
                          value={editFormData.pocPhone || ''}
                          onChange={e => setEditFormData({ ...editFormData, pocPhone: e.target.value })}
                          style={{ padding: '0.5rem 0.6rem', border: '1px solid #CBD5E1', borderRadius: '0.375rem', fontSize: '0.85rem' }}
                        />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>Designation</label>
                        <input
                          type="text"
                          required
                          value={editFormData.pocDesignation || ''}
                          onChange={e => setEditFormData({ ...editFormData, pocDesignation: e.target.value })}
                          style={{ padding: '0.5rem 0.6rem', border: '1px solid #CBD5E1', borderRadius: '0.375rem', fontSize: '0.85rem' }}
                        />
                      </div>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>Professional Email ID</label>
                        <input
                          type="email"
                          required
                          value={editFormData.pocEmail || ''}
                          onChange={e => setEditFormData({ ...editFormData, pocEmail: e.target.value })}
                          style={{ padding: '0.5rem 0.6rem', border: '1px solid #CBD5E1', borderRadius: '0.375rem', fontSize: '0.85rem' }}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {editFormData.role === 'company' && (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>Name of the Company</label>
                    <input
                      type="text"
                      required
                      value={editFormData.name || ''}
                      onChange={e => setEditFormData({ ...editFormData, name: e.target.value })}
                      style={{ padding: '0.6rem 0.75rem', border: '1px solid #CBD5E1', borderRadius: '0.375rem', fontSize: '0.9rem' }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>Official Email ID</label>
                      <input
                        type="email"
                        required
                        value={editFormData.email || ''}
                        onChange={e => setEditFormData({ ...editFormData, email: e.target.value })}
                        style={{ padding: '0.6rem 0.75rem', border: '1px solid #CBD5E1', borderRadius: '0.375rem', fontSize: '0.9rem' }}
                      />
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>Website URL</label>
                      <input
                        type="url"
                        required
                        value={editFormData.website || ''}
                        onChange={e => setEditFormData({ ...editFormData, website: e.target.value })}
                        style={{ padding: '0.6rem 0.75rem', border: '1px solid #CBD5E1', borderRadius: '0.375rem', fontSize: '0.9rem' }}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>Headquarters Address</label>
                      <input
                        type="text"
                        required
                        value={editFormData.headquarters || ''}
                        onChange={e => setEditFormData({ ...editFormData, headquarters: e.target.value })}
                        style={{ padding: '0.6rem 0.75rem', border: '1px solid #CBD5E1', borderRadius: '0.375rem', fontSize: '0.9rem' }}
                      />
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>Industry Sector</label>
                      <input
                        type="text"
                        required
                        value={editFormData.industrySector || ''}
                        onChange={e => setEditFormData({ ...editFormData, industrySector: e.target.value })}
                        style={{ padding: '0.6rem 0.75rem', border: '1px solid #CBD5E1', borderRadius: '0.375rem', fontSize: '0.9rem' }}
                      />
                    </div>
                  </div>

                  {/* Company Tag CSR Areas */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>Preferred CSR Focus Areas</label>
                    <div style={{
                      display: 'flex', flexWrap: 'wrap', gap: '0.4rem',
                      border: '1px solid #E2E8F0', padding: '0.5rem',
                      borderRadius: '0.375rem', minHeight: '45px', background: 'rgba(255, 255, 255, 0.03)',
                      alignItems: 'center'
                    }}>
                      {editFormData.csrFocus && editFormData.csrFocus.length > 0 ? (
                        editFormData.csrFocus.map((focus, idx) => (
                          <span key={idx} style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                            background: '#FFF9C4', color: '#F57F17', padding: '0.2rem 0.5rem',
                            borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: 600, border: '1px solid #FBC02D'
                          }}>
                            {focus}
                            <button
                              type="button"
                              onClick={() => {
                                setEditFormData(prev => ({
                                  ...prev,
                                  csrFocus: prev.csrFocus.filter(item => item !== focus)
                                }));
                              }}
                              style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
                            >
                              <X size={12} />
                            </button>
                          </span>
                        ))
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>No CSR areas selected yet</span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                      <input
                        type="text"
                        placeholder="Add CSR area..."
                        value={csrFocusInput}
                        onChange={e => setCsrFocusInput(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (csrFocusInput.trim() && !editFormData.csrFocus?.includes(csrFocusInput.trim())) {
                              setEditFormData(prev => ({
                                ...prev,
                                csrFocus: [...(prev.csrFocus || []), csrFocusInput.trim()]
                              }));
                              setCsrFocusInput('');
                            }
                          }
                        }}
                        style={{ flex: 1, padding: '0.5rem 0.75rem', border: '1px solid #CBD5E1', borderRadius: '0.375rem', fontSize: '0.85rem' }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (csrFocusInput.trim() && !editFormData.csrFocus?.includes(csrFocusInput.trim())) {
                            setEditFormData(prev => ({
                              ...prev,
                              csrFocus: [...(prev.csrFocus || []), csrFocusInput.trim()]
                            }));
                            setCsrFocusInput('');
                          }
                        }}
                        style={{ padding: '0.5rem 1rem', background: 'var(--color-primary-dark)', color: 'transparent', border: 'none', borderRadius: '0.375rem', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #E2E8F0', marginTop: '0.5rem' }}>
                    <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>Primary Point of Contact Details</h4>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem' }}>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>Full Name</label>
                        <input
                          type="text"
                          required
                          value={editFormData.pocName || ''}
                          onChange={e => setEditFormData({ ...editFormData, pocName: e.target.value })}
                          style={{ padding: '0.5rem 0.6rem', border: '1px solid #CBD5E1', borderRadius: '0.375rem', fontSize: '0.85rem' }}
                        />
                      </div>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>Phone Number</label>
                        <input
                          type="text"
                          required
                          value={editFormData.pocPhone || ''}
                          onChange={e => setEditFormData({ ...editFormData, pocPhone: e.target.value })}
                          style={{ padding: '0.5rem 0.6rem', border: '1px solid #CBD5E1', borderRadius: '0.375rem', fontSize: '0.85rem' }}
                        />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>Designation</label>
                        <input
                          type="text"
                          required
                          value={editFormData.pocDesignation || ''}
                          onChange={e => setEditFormData({ ...editFormData, pocDesignation: e.target.value })}
                          style={{ padding: '0.5rem 0.6rem', border: '1px solid #CBD5E1', borderRadius: '0.375rem', fontSize: '0.85rem' }}
                        />
                      </div>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>Professional Email ID</label>
                        <input
                          type="email"
                          required
                          value={editFormData.pocEmail || ''}
                          onChange={e => setEditFormData({ ...editFormData, pocEmail: e.target.value })}
                          style={{ padding: '0.5rem 0.6rem', border: '1px solid #CBD5E1', borderRadius: '0.375rem', fontSize: '0.85rem' }}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setShowEditProfileModal(false)}
                  style={{
                    flex: 1, padding: '0.75rem', background: 'rgba(255, 255, 255, 0.06)', color: 'var(--color-text-secondary)',
                    border: '1px solid #CBD5E1', borderRadius: '0.5rem', fontWeight: 700, cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1, padding: '0.75rem', background: 'var(--color-primary-dark)', color: 'transparent',
                    border: 'none', borderRadius: '0.5rem', fontWeight: 700, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                  }}
                >
                  <Save size={18} /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
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
            background: 'transparent', borderRadius: '1.25rem',
            color: 'var(--color-text-primary)'
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%', background: '#FEF2F2',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.25rem', color: '#EF4444'
            }}>
              <LogOut size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '0.5rem', fontFamily: 'inherit' }}>
              Confirm Logout
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '1.75rem', lineHeight: 1.5 }}>
              Do you want to logout? Any unsaved session changes will be cleared.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="btn"
                style={{
                  flex: 1, padding: '0.75rem', background: 'rgba(255, 255, 255, 0.06)', color: 'var(--color-text-secondary)',
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
                  flex: 1, padding: '0.75rem 1.5rem', background: '#EF4444', color: 'transparent',
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

      {/* Global Congratulations Modal Celebration */}
      {newBadges.length > 0 && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 10000,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(12px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1rem'
        }}>
          {(() => {
            const badge = newBadges[0];
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
              'Silver': 'var(--color-text-secondary)',
              'Gold': '#F57F17',
              'Platinum': '#7C3AED'
            };

            return (
              <div 
                className="celebration-modal glass-card animate-fade-in" 
                style={{
                  width: '100%', maxWidth: 460,
                  padding: '2.5rem 2rem 2rem', textAlign: 'center',
                  background: 'transparent',
                  borderRadius: '24px', border: `2.5px solid ${tierColor[badge.level]}`,
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
                  position: 'relative', overflow: 'hidden',
                  color: 'var(--color-text-primary)'
                }}
              >
                {/* Top Xmark button */}
                <button 
                  onClick={handleCloseCelebration} 
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
                    src={imgMap[badge.level]} 
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
                  New Achievement Unlocked!
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
                    onClick={handleCloseCelebration}
                    className="btn btn-outline"
                    style={{ width: '100%', padding: '0.75rem', fontSize: '0.9rem', fontWeight: 700 }}
                  >
                    Awesome, thanks!
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

export default GlobalLayout;
