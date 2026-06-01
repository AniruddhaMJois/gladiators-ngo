import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const roles = [
  {
    key: 'ngo',
    path: '/ngo/onboarding',
    image: '/images/ngo_hero.png',
    title: 'NGO',
    description: 'Manage, collaborate & grow',
  },
  {
    key: 'volunteer',
    path: '/volunteer/onboarding',
    image: '/images/volunteer_hero.png',
    title: 'Volunteer',
    description: 'Discover & contribute',
  },
  {
    key: 'company',
    path: '/company/onboarding',
    image: '/images/company_hero.png',
    title: 'Company',
    description: 'CSR & partnerships',
  }
];

const LandingPage = () => {
  const navigate = useNavigate();

  // Always scroll to top when landing page mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '4rem 1.5rem', position: 'relative', zIndex: 1 }}>
      
      {/* SDG Badge */}
      <div className="sdg-badge animate-fade-in" style={{ marginBottom: '2.5rem' }}>
        <span>✨</span>
        <span>SDG 16 &amp; 17 · GLADICONNECT</span>
      </div>

      {/* Hero Logo Area */}
      <div className="animate-fade-in" style={{
        position: 'relative', 
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '2rem'
      }}>
        <div style={{
          width: 'clamp(200px, 30vw, 320px)',
          height: 'clamp(200px, 30vw, 320px)',
          borderRadius: '50%',
          overflow: 'hidden',
          position: 'relative',
          filter: 'drop-shadow(0 0 40px rgba(16, 185, 129, 0.4))'
        }}>
          <img
            src="/images/logo.png"
            alt="GladiConnect Logo"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      </div>

      {/* Hero Text */}
      <div style={{ textAlign: 'center', maxWidth: 800, marginBottom: '4rem' }} className="animate-fade-in">
        <h1 style={{
          fontSize: 'clamp(3rem, 8vw, 6rem)',
          fontWeight: 800,
          lineHeight: 1.1,
          marginBottom: '1rem',
          letterSpacing: '-0.04em'
        }}>
          Bridge the <span className="text-gradient">Gap.</span><br />
          Amplify <span className="text-gradient-secondary">Impact.</span>
        </h1>
        <p style={{
          fontSize: 'clamp(1.1rem, 2vw, 1.25rem)',
          lineHeight: 1.6,
          color: 'var(--color-text-secondary)',
          maxWidth: 600,
          margin: '0 auto 2rem auto'
        }}>
          The state-of-the-art platform connecting NGOs, volunteers, and companies to drive collective, measurable social impact.
        </p>
      </div>

      {/* Role Cards */}
      <div className="animate-fade-in" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '2rem',
        width: '100%',
        maxWidth: 1000,
        marginBottom: '4rem'
      }}>
        {roles.map(role => (
          <div
            key={role.key}
            className="role-card"
            onClick={() => navigate(role.path)}
          >
            <div style={{
              width: '100%', height: 200, marginBottom: '1.5rem',
              borderRadius: 'var(--radius-lg)', overflow: 'hidden'
            }}>
              <img src={role.image} alt={role.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
              {role.title}
            </h3>
            <p style={{ fontSize: '1rem', color: 'var(--color-text-secondary)', margin: 0 }}>
              {role.description}
            </p>
          </div>
        ))}
      </div>

      {/* SDG Footer Tags */}
      <div className="animate-fade-in" style={{
        display: 'flex', alignItems: 'center', gap: '1rem',
        flexWrap: 'wrap', justifyContent: 'center'
      }}>
        <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
          Aligned with Goals:
        </span>
        {[
          'SDG 16 — Peace & Justice',
          'SDG 17 — Partnerships',
          'SDG 4 — Education',
          'SDG 13 — Climate Action'
        ].map((tag, i) => (
          <span key={i} className="sdg-tag">{tag}</span>
        ))}
      </div>
    </div>
  );
};

export default LandingPage;
