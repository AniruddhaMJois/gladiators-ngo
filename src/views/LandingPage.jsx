'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogIn, UserPlus } from 'lucide-react';

const roles = [
  {
    key: 'ngo',
    title: 'NGO',
    description: 'Manage, collaborate & grow',
    image: '/images/ngo_hero.png',
    loginPath: '/login?role=ngo',
    registerPath: '/ngo/onboarding?mode=register',
    onboardingPath: '/ngo/onboarding'
  },
  {
    key: 'volunteer',
    title: 'Volunteer',
    description: 'Discover & contribute',
    image: '/images/volunteer_hero.png',
    loginPath: '/login?role=volunteer',
    registerPath: '/volunteer/onboarding?mode=register',
    onboardingPath: '/volunteer/onboarding'
  },
  {
    key: 'company',
    title: 'Company',
    description: 'CSR & partnerships',
    image: '/images/company_hero.png',
    loginPath: '/login?role=company',
    registerPath: '/company/onboarding?mode=register',
    onboardingPath: '/company/onboarding'
  }
];

const LandingPage = () => {
  const router = useRouter();

  // Always scroll to top when landing page mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '8rem 1.5rem 4rem 1.5rem', position: 'relative', zIndex: 1 }}>
      
      {/* Hero Logo Area */}
      <div className="animate-fade-in" style={{
        position: 'relative', 
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '2rem'
      }}>
        <div style={{
          width: 'clamp(180px, 25vw, 250px)',
          height: 'clamp(180px, 25vw, 250px)',
          borderRadius: '50%',
          overflow: 'hidden',
          position: 'relative',
          filter: 'drop-shadow(0 0 40px rgba(16, 185, 129, 0.4))'
        }}>
          <img
            src="/images/logo.png"
            alt="GladiConnect Logo"
            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
          />
        </div>
      </div>

      {/* Hero Text */}
      <div style={{ textAlign: 'center', maxWidth: 900, marginBottom: '4rem' }} className="animate-fade-in">
        <h1 style={{
          fontSize: 'clamp(2rem, 5vw, 3.8rem)',
          fontWeight: 800,
          lineHeight: 1.05,
          marginBottom: '1.5rem',
          letterSpacing: '-0.04em',
          textShadow: '0 10px 30px rgba(0,0,0,0.5)'
        }}>
          [Title Placeholder]
        </h1>
        <p style={{
          fontSize: 'clamp(1.15rem, 2vw, 1.35rem)',
          lineHeight: 1.6,
          color: 'var(--color-text-secondary)',
          maxWidth: 650,
          margin: '0 auto 2.5rem auto',
          fontWeight: 500
        }}>
          [Description Placeholder - Enter your custom text here]
        </p>
      </div>

      {/* Role Cards - Bento Grid */}
      <div id="roles-section" className="bento-grid animate-fade-in" style={{
        width: '100%',
        maxWidth: 1100,
        marginBottom: '4rem'
      }}>
        {roles.map((role, idx) => (
          <div
            key={role.key}
            className="bento-item role-card prismatic-edge bento-col-4"
            style={{ 
                animationDelay: `${idx * 150}ms`,
                display: 'flex', flexDirection: 'column', height: '100%',
                padding: '1.25rem'
            }}
          >
            <div 
              onClick={() => router.push(role.onboardingPath)}
              style={{
                width: '100%', flex: 1, minHeight: 240, marginBottom: '1.25rem',
                borderRadius: 'var(--radius-md)', overflow: 'hidden', position: 'relative',
                cursor: 'pointer'
              }}
              title={`View ${role.title} overview`}
            >
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)', zIndex: 1 }} />
              <img src={role.image} alt={role.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', bottom: '1rem', left: '1rem', zIndex: 2, right: '1rem' }}>
                  <h3 style={{ fontSize: '1.75rem', marginBottom: '0.25rem', color: '#fff' }}>
                    {role.title}
                  </h3>
                  <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.7)', margin: 0, fontWeight: 500 }}>
                    {role.description}
                  </p>
              </div>
            </div>

            {/* Dedicated Role Actions: Login & Register for this specific role */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', zIndex: 2 }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(role.loginPath);
                }}
                style={{
                  padding: '0.65rem 0.5rem',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-primary)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <LogIn size={15} /> Login
              </button>
              <button
                type="button"
                className="btn btn-primary prismatic-edge"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(role.registerPath);
                }}
                style={{
                  padding: '0.65rem 0.5rem',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35rem',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer'
                }}
              >
                <UserPlus size={15} /> Register
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LandingPage;
