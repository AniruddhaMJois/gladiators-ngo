'use client';

import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { API_BASE } from '@/lib/api';
import {
  UserCircle, Phone, Globe, LogOut, X, Heart, Building2,
  Briefcase, Check, Edit3, Save, Trash2, Home, Award, Moon, Sun,
  LayoutDashboard, MessageSquare
} from 'lucide-react';
import GlobalChatbot from './chat/GlobalChatbot';

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

const GlobalLayout = ({ children }) => {
  const { user, logout, isAuthenticated, updateUserProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [interestInput, setInterestInput] = useState('');
  const [csrFocusInput, setCsrFocusInput] = useState('');
  
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  
  const getInitialLang = () => {
    if (typeof document === 'undefined') return 'English';
    const match = document.cookie.match(/googtrans=\/en\/([a-z]{2})/);
    const code = match ? match[1] : 'en';
    const langObj = [
      { code: 'en', label: 'English' },
      { code: 'hi', label: 'हिंदी' },
      { code: 'kn', label: 'ಕನ್ನಡ' }
    ].find(l => l.code === code);
    return langObj ? langObj.label : 'English';
  };
  
  const [activeLang, setActiveLang] = useState('English');

  useEffect(() => {
    setActiveLang(getInitialLang());
  }, []);

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
      const res = await fetch(`${API_BASE}/api/auth/volunteer/${id}/badges`);
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
        script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
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
      const res = await fetch(`${API_BASE}/api/auth/volunteer/${id}/badges/mark-notified`, {
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
    const dateStr = (badge.earnedAt ? new Date(badge.earnedAt) : new Date()).toLocaleDateString('en-US', {
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

  const isLandingPage = pathname === '/';

  const handleLogoClick = () => {
    if (isAuthenticated && user?.role) {
      router.push(`/${user.role}/dashboard`);
    } else {
      if (pathname === '/') {
        const heroSection = document.querySelector('.hero-section');
        if (heroSection) {
          heroSection.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } else {
        router.push('/');
      }
    }
  };

  const handleHome = () => {
    if (isAuthenticated && user?.role) {
      window.location.href = `/${user.role}/dashboard`;
    } else {
      router.push('/');
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
      {/* Floating Tagline Box in the Middle of the Whole Screen */}
      <div className="screen-center-tagline" suppressHydrationWarning style={{
        position: 'fixed',
        top: '1.25rem',
        left: 0,
        right: 0,
        marginLeft: 'auto',
        marginRight: 'auto',
        width: 'fit-content',
        zIndex: 90,
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0.65rem 1.75rem',
        background: 'rgba(10, 15, 30, 0.75)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '14px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4)',
        maxWidth: '90vw'
      }}>
        <span style={{
          fontSize: '0.95rem',
          fontWeight: 700,
          fontStyle: 'italic',
          letterSpacing: '0.02em',
          color: '#FFFFFF',
          whiteSpace: 'nowrap',
          opacity: fadeState === 'fade-in' ? 1 : 0,
          transform: fadeState === 'fade-in' ? 'translateY(0)' : 'translateY(-4px)',
          transition: 'opacity 0.5s ease-in-out, transform 0.5s ease-in-out',
        }}>
          "{currentLanguageTaglines[currentTaglineIndex]}"
        </span>
      </div>

      <nav className="nav-island">
        {/* Top: Brand Logo */}
        <div
          className="nav-brand"
          onClick={handleLogoClick}
          title="GladiConnect"
        >
          <div className="nav-icon-wrapper">
            <img src="/images/logo.png" alt="GladiConnect Logo" style={{ width: 34, height: 34, objectFit: 'contain', borderRadius: '50%' }} />
          </div>
          <span className="nav-btn-text" style={{
            fontSize: '1.15rem',
            letterSpacing: '-0.01em'
          }}>
            GladiConnect
          </span>
        </div>

        {/* Profile Card in Left Navbar */}
        {isAuthenticated && user && (() => {
          const roleColor = user.role === 'volunteer' ? '#0EA5E9' : user.role === 'ngo' ? '#8B5CF6' : '#F59E0B';
          const roleColorLight = user.role === 'volunteer' ? '#38BDF8' : user.role === 'ngo' ? '#A78BFA' : '#FBBF24';
          return (
            <div
              className="nav-profile-card"
              onClick={() => router.push(`/${user.role}/profile`)}
              title={`View ${user.name || 'Profile'} (${user.gcId || ''})`}
              style={{
                '--profile-accent': roleColor,
                '--profile-accent-light': roleColorLight,
              }}
            >
              <div className="nav-profile-card-inner">
                {/* Avatar with White Ring & Green Check Badge */}
                <div className="nav-profile-avatar-wrap">
                  <div
                    className="nav-profile-avatar"
                    style={{
                      background: `linear-gradient(135deg, ${roleColorLight}, ${roleColor})`
                    }}
                  >
                    {user.profilePhoto ? (
                      <img src={user.profilePhoto} alt={user.name || 'Profile'} />
                    ) : (
                      user.name ? user.name.charAt(0).toUpperCase() : 'U'
                    )}
                  </div>
                  <div className="nav-profile-check-badge">
                    <Check size={11} strokeWidth={3.5} />
                  </div>
                </div>

                {/* Expanded Details on Hover: Name, Role Verified Badge, GC ID Box */}
                <div className="nav-profile-details">
                  <div className="nav-profile-name" title={user.name}>
                    {user.name}
                  </div>

                  {/* Role Verified Badge Pill */}
                  {user.role === 'volunteer' && (
                    <div
                      className="nav-profile-verified-badge"
                      style={{
                        background: '#D1FAE5',
                        color: '#059669',
                        border: '1px solid #A7F3D0'
                      }}
                    >
                      <Heart size={12} fill="#059669" color="#059669" />
                      <span>GC-VLT Verified</span>
                    </div>
                  )}
                  {user.role === 'ngo' && (
                    <div
                      className="nav-profile-verified-badge"
                      style={{
                        background: '#B2F5EA',
                        color: '#7C3AED',
                        border: '1px solid #80E5D3'
                      }}
                    >
                      <Building2 size={12} color="#7C3AED" />
                      <span>GC-NGO Verified</span>
                    </div>
                  )}
                  {user.role === 'company' && (
                    <div
                      className="nav-profile-verified-badge"
                      style={{
                        background: '#FEF3C7',
                        color: '#D97706',
                        border: '1px solid #FDE68A'
                      }}
                    >
                      <Briefcase size={12} color="#D97706" />
                      <span>GC-CPY Verified</span>
                    </div>
                  )}

                  {/* Volunteer Badges if available */}
                  {user.role === 'volunteer' && badgeData.badges && badgeData.badges.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', justifyContent: 'center', margin: '0.1rem 0' }}>
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
                            style={{ width: 16, height: 16, objectFit: 'contain' }} 
                          />
                        );
                      })}
                    </div>
                  )}

                  {/* GladiConnect ID Box */}
                  <div className="nav-profile-id-box">
                    <span className="nav-profile-id-label">GLADICONNECT ID</span>
                    <span className="nav-profile-id-val">{user.gcId}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Navigation Items */}
        <div className="nav-island-actions">
          <button
            onClick={handleHome}
            className="nav-action-btn"
            title="Home"
          >
            <div className="nav-icon-wrapper"><Home size={22} /></div>
            <span className="nav-btn-text">Home</span>
          </button>

          {isAuthenticated && user && (
            <>
              <button
                onClick={() => router.push(`/${user.role}/dashboard`)}
                className="nav-action-btn"
                title="Dashboard"
              >
                <div className="nav-icon-wrapper"><LayoutDashboard size={22} /></div>
                <span className="nav-btn-text">Dashboard</span>
              </button>

              <button
                onClick={() => router.push(`/${user.role}/profile`)}
                className="nav-action-btn"
                title="Profile"
              >
                <div className="nav-icon-wrapper"><UserCircle size={22} /></div>
                <span className="nav-btn-text">Profile</span>
              </button>

              <button
                onClick={() => router.push('/messages')}
                className="nav-action-btn"
                title="Messages"
              >
                <div className="nav-icon-wrapper"><MessageSquare size={22} /></div>
                <span className="nav-btn-text">Messages</span>
              </button>
            </>
          )}

          <button className="nav-action-btn helpline-btn" title="24/7 Helpline">
            <div className="nav-icon-wrapper"><Phone size={22} className="pulse-animation" /></div>
            <span className="nav-btn-text">24/7 Helpline</span>
          </button>
        </div>

        {/* Bottom Tools & Logout */}
        <div className="nav-island-bottom">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="nav-action-btn nav-tool-btn"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            <div className="nav-icon-wrapper">
              {theme === 'light' ? <Moon size={22} /> : <Sun size={22} />}
            </div>
            <span className="nav-btn-text">{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
          </button>

          {isAuthenticated && (
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="nav-action-btn nav-logout-btn"
              title="Logout"
            >
              <div className="nav-icon-wrapper"><LogOut size={22} /></div>
              <span className="nav-btn-text">Logout</span>
            </button>
          )}

          <div id="google_translate_element" style={{ opacity: 0, position: 'absolute', pointerEvents: 'none', zIndex: -1 }}></div>
        </div>
      </nav>

      {/* Top Right Corner: Circular Language Selector */}
      <div className="top-right-lang-widget" style={{
        position: 'fixed',
        top: '1.25rem',
        right: '1.5rem',
        zIndex: 100
      }}>
        <button
          onClick={() => setShowLangDropdown(!showLangDropdown)}
          className="lang-circle-btn"
          title={`Language: ${activeLang}`}
        >
          <Globe size={20} />
        </button>

        {showLangDropdown && (
          <>
            <div onClick={() => setShowLangDropdown(false)} style={{ position: 'fixed', inset: 0, zIndex: 998 }} />
            <div className="lang-circle-dropdown animate-fade-in" style={{
              position: 'absolute',
              top: 'calc(100% + 0.6rem)',
              right: 0,
              zIndex: 999,
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '0.75rem',
              boxShadow: '0 12px 25px -4px rgba(0, 0, 0, 0.35)',
              overflow: 'hidden',
              minWidth: '140px'
            }}>
              {languages.map((lang) => (
                <div
                  key={lang.code}
                  onClick={() => handleLanguageSelect(lang)}
                  style={{
                    padding: '0.65rem 1rem',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    color: activeLang === lang.label ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                    background: activeLang === lang.label ? 'var(--color-nav-btn-hover)' : 'transparent',
                    borderBottom: '1px solid var(--color-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--color-nav-btn-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = activeLang === lang.label ? 'var(--color-nav-btn-hover)' : 'transparent'}
                >
                  <span>{lang.label}</span>
                  {activeLang === lang.label && <Check size={16} color="#10B981" />}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

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

      {/* Main Content Layout Wrapper */}
      <div className="app-main-layout" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', minWidth: 0 }}>
        {/* Main Content */}
        <main className={isLandingPage ? '' : 'container'} style={{ flex: 1, paddingTop: isLandingPage ? 0 : '3rem', paddingBottom: '2rem' }}>
          {children}
        </main>

        <footer style={{
          textAlign: 'center',
          padding: '1.25rem',
          color: 'var(--color-text-secondary)',
          fontSize: '0.85rem',
          fontWeight: 600,
          letterSpacing: '0.02em',
          background: 'var(--color-surface)',
          borderTop: '1px solid var(--color-border)',
          marginTop: 'auto'
        }}>
          Made for the world by Gladiators
        </footer>
      </div>

      {/* Edit Profile Modal */}
      {showEditProfileModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(4px)',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div className="glass-card animate-scale-up" style={{
            width: '90%', maxWidth: 500, padding: '2rem',
            border: '1px solid var(--color-border)',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            background: 'var(--color-surface)', borderRadius: '1.25rem',
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
                      style={{ padding: '0.6rem 0.75rem', border: '1px solid var(--color-border)', borderRadius: '0.375rem', fontSize: '0.9rem' }}
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
                        style={{ padding: '0.6rem 0.75rem', border: '1px solid var(--color-border)', borderRadius: '0.375rem', fontSize: '0.9rem' }}
                      />
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>Age</label>
                      <input
                        type="number"
                        required
                        value={editFormData.age || ''}
                        onChange={e => setEditFormData({ ...editFormData, age: e.target.value })}
                        style={{ padding: '0.6rem 0.75rem', border: '1px solid var(--color-border)', borderRadius: '0.375rem', fontSize: '0.9rem' }}
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
                        style={{ padding: '0.6rem 0.75rem', border: '1px solid var(--color-border)', borderRadius: '0.375rem', fontSize: '0.9rem' }}
                      />
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>Location</label>
                      <input
                        type="text"
                        required
                        value={editFormData.location || ''}
                        onChange={e => setEditFormData({ ...editFormData, location: e.target.value })}
                        style={{ padding: '0.6rem 0.75rem', border: '1px solid var(--color-border)', borderRadius: '0.375rem', fontSize: '0.9rem' }}
                      />
                    </div>
                  </div>

                  {/* Volunteer Tag Interests */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>Primary Interests</label>
                    <div style={{
                      display: 'flex', flexWrap: 'wrap', gap: '0.4rem',
                      border: '1px solid var(--color-border)', padding: '0.5rem',
                      borderRadius: '0.375rem', minHeight: '45px', background: 'var(--color-surface)',
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
                        style={{ flex: 1, padding: '0.5rem 0.75rem', border: '1px solid var(--color-border)', borderRadius: '0.375rem', fontSize: '0.85rem' }}
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
                        style={{ padding: '0.5rem 1rem', background: 'var(--color-primary-dark)', color: '#FFFFFF', border: 'none', borderRadius: '0.375rem', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
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
                      style={{ padding: '0.6rem 0.75rem', border: '1px solid var(--color-border)', borderRadius: '0.375rem', fontSize: '0.9rem' }}
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
                        style={{ padding: '0.6rem 0.75rem', border: '1px solid var(--color-border)', borderRadius: '0.375rem', fontSize: '0.9rem' }}
                      />
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>Official Website URL</label>
                      <input
                        type="url"
                        required
                        value={editFormData.website || ''}
                        onChange={e => setEditFormData({ ...editFormData, website: e.target.value })}
                        style={{ padding: '0.6rem 0.75rem', border: '1px solid var(--color-border)', borderRadius: '0.375rem', fontSize: '0.9rem' }}
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
                      style={{ padding: '0.6rem 0.75rem', border: '1px solid var(--color-border)', borderRadius: '0.375rem', fontSize: '0.9rem' }}
                    />
                  </div>

                  <div style={{ background: 'var(--color-surface)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--color-border)', marginTop: '0.5rem' }}>
                    <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>Primary Point of Contact Details</h4>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem' }}>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>Full Name</label>
                        <input
                          type="text"
                          required
                          value={editFormData.pocName || ''}
                          onChange={e => setEditFormData({ ...editFormData, pocName: e.target.value })}
                          style={{ padding: '0.5rem 0.6rem', border: '1px solid var(--color-border)', borderRadius: '0.375rem', fontSize: '0.85rem' }}
                        />
                      </div>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>Phone Number</label>
                        <input
                          type="text"
                          required
                          value={editFormData.pocPhone || ''}
                          onChange={e => setEditFormData({ ...editFormData, pocPhone: e.target.value })}
                          style={{ padding: '0.5rem 0.6rem', border: '1px solid var(--color-border)', borderRadius: '0.375rem', fontSize: '0.85rem' }}
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
                          style={{ padding: '0.5rem 0.6rem', border: '1px solid var(--color-border)', borderRadius: '0.375rem', fontSize: '0.85rem' }}
                        />
                      </div>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>Professional Email ID</label>
                        <input
                          type="email"
                          required
                          value={editFormData.pocEmail || ''}
                          onChange={e => setEditFormData({ ...editFormData, pocEmail: e.target.value })}
                          style={{ padding: '0.5rem 0.6rem', border: '1px solid var(--color-border)', borderRadius: '0.375rem', fontSize: '0.85rem' }}
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
                      style={{ padding: '0.6rem 0.75rem', border: '1px solid var(--color-border)', borderRadius: '0.375rem', fontSize: '0.9rem' }}
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
                        style={{ padding: '0.6rem 0.75rem', border: '1px solid var(--color-border)', borderRadius: '0.375rem', fontSize: '0.9rem' }}
                      />
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>Website URL</label>
                      <input
                        type="url"
                        required
                        value={editFormData.website || ''}
                        onChange={e => setEditFormData({ ...editFormData, website: e.target.value })}
                        style={{ padding: '0.6rem 0.75rem', border: '1px solid var(--color-border)', borderRadius: '0.375rem', fontSize: '0.9rem' }}
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
                        style={{ padding: '0.6rem 0.75rem', border: '1px solid var(--color-border)', borderRadius: '0.375rem', fontSize: '0.9rem' }}
                      />
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>Industry Sector</label>
                      <input
                        type="text"
                        required
                        value={editFormData.industrySector || ''}
                        onChange={e => setEditFormData({ ...editFormData, industrySector: e.target.value })}
                        style={{ padding: '0.6rem 0.75rem', border: '1px solid var(--color-border)', borderRadius: '0.375rem', fontSize: '0.9rem' }}
                      />
                    </div>
                  </div>

                  {/* Company Tag CSR Areas */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>Preferred CSR Focus Areas</label>
                    <div style={{
                      display: 'flex', flexWrap: 'wrap', gap: '0.4rem',
                      border: '1px solid var(--color-border)', padding: '0.5rem',
                      borderRadius: '0.375rem', minHeight: '45px', background: 'var(--color-surface)',
                      alignItems: 'center'
                    }}>
                      {editFormData.csrFocus && editFormData.csrFocus.length > 0 ? (
                        editFormData.csrFocus.map((focus, idx) => (
                          <span key={idx} style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                            background: 'var(--color-border)', color: 'var(--color-text-primary)', padding: '0.2rem 0.5rem',
                            borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: 600, border: '1px solid var(--color-border)'
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
                        style={{ flex: 1, padding: '0.5rem 0.75rem', border: '1px solid var(--color-border)', borderRadius: '0.375rem', fontSize: '0.85rem' }}
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
                        style={{ padding: '0.5rem 1rem', background: 'var(--color-primary-dark)', color: '#FFFFFF', border: 'none', borderRadius: '0.375rem', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  <div style={{ background: 'var(--color-surface)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--color-border)', marginTop: '0.5rem' }}>
                    <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>Primary Point of Contact Details</h4>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem' }}>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>Full Name</label>
                        <input
                          type="text"
                          required
                          value={editFormData.pocName || ''}
                          onChange={e => setEditFormData({ ...editFormData, pocName: e.target.value })}
                          style={{ padding: '0.5rem 0.6rem', border: '1px solid var(--color-border)', borderRadius: '0.375rem', fontSize: '0.85rem' }}
                        />
                      </div>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>Phone Number</label>
                        <input
                          type="text"
                          required
                          value={editFormData.pocPhone || ''}
                          onChange={e => setEditFormData({ ...editFormData, pocPhone: e.target.value })}
                          style={{ padding: '0.5rem 0.6rem', border: '1px solid var(--color-border)', borderRadius: '0.375rem', fontSize: '0.85rem' }}
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
                          style={{ padding: '0.5rem 0.6rem', border: '1px solid var(--color-border)', borderRadius: '0.375rem', fontSize: '0.85rem' }}
                        />
                      </div>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>Professional Email ID</label>
                        <input
                          type="email"
                          required
                          value={editFormData.pocEmail || ''}
                          onChange={e => setEditFormData({ ...editFormData, pocEmail: e.target.value })}
                          style={{ padding: '0.5rem 0.6rem', border: '1px solid var(--color-border)', borderRadius: '0.375rem', fontSize: '0.85rem' }}
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
                    flex: 1, padding: '0.75rem', background: 'var(--color-border)', color: 'var(--color-text-secondary)',
                    border: '1px solid var(--color-border)', borderRadius: '0.5rem', fontWeight: 700, cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1, padding: '0.75rem', background: 'var(--color-primary-dark)', color: '#FFFFFF',
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
          background: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(4px)',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div className="glass-card animate-fade-in" style={{
            width: '90%', maxWidth: 400, padding: '2rem',
            textAlign: 'center', border: '1px solid var(--color-border)',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            background: 'var(--color-surface)', borderRadius: '1.25rem',
            color: 'var(--color-text-primary)'
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%', background: 'var(--color-border)',
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
                  flex: 1, padding: '0.75rem', background: 'var(--color-border)', color: 'var(--color-text-secondary)',
                  border: '1px solid var(--color-border)', borderRadius: '0.5rem', fontWeight: 600, cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowLogoutConfirm(false);
                  logout();
                  router.push('/');
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

      {/* Global Congratulations Modal Celebration */}
      {newBadges.length > 0 && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 10000,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(8px)',
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
                  background: 'rgba(255,255,255,0.05)',
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
      
      <GlobalChatbot />
    </div>
  );
};

export default GlobalLayout;
