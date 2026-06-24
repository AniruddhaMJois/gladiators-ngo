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
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '8rem 1.5rem 4rem 1.5rem', position: 'relative', zIndex: 1 }}>
      
      {/* SDG Badge */}
      <div className="badge badge-primary prismatic-edge animate-fade-in" style={{ marginBottom: '2.5rem', padding: '0.6rem 1.5rem', gap: '0.5rem' }}>
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
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
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
          Bridge the <span className="text-gradient">Gap.</span><br />
          Amplify <span className="text-gradient-secondary">Impact.</span>
        </h1>
        <p style={{
          fontSize: 'clamp(1.15rem, 2vw, 1.35rem)',
          lineHeight: 1.6,
          color: 'var(--color-text-secondary)',
          maxWidth: 650,
          margin: '0 auto 2.5rem auto',
          fontWeight: 500
        }}>
          The state-of-the-art platform connecting NGOs, volunteers, and companies to drive collective, measurable social impact.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => navigate('/volunteer/onboarding')} style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>Get Started <ArrowRight size={18} /></button>
            <button className="btn btn-outline" onClick={() => {
                document.getElementById('roles-section')?.scrollIntoView({ behavior: 'smooth' });
            }} style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>Explore Roles</button>
        </div>
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
            onClick={() => navigate(role.path)}
            style={{ 
                animationDelay: `${idx * 150}ms`,
                display: 'flex', flexDirection: 'column', height: '100%',
                padding: '1.25rem'
            }}
          >
            <div style={{
              width: '100%', flex: 1, minHeight: 240, marginBottom: '1.25rem',
              borderRadius: 'var(--radius-md)', overflow: 'hidden', position: 'relative'
            }}>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)', zIndex: 1 }} />
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--color-primary)', padding: '0 0.5rem' }}>
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Join as {role.title}</span>
                <ArrowRight size={18} />
            </div>
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
          <span key={i} className="badge badge-secondary prismatic-edge" style={{ fontWeight: 800 }}>{tag}</span>
        ))}
      </div>
    </div>
  );
};

export default LandingPage;
