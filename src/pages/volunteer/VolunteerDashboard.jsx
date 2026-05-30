import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Search, MapPin, Target, Calendar, Award, Clock, Users, Activity, X, Building2, Camera, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { jsPDF } from 'jspdf';

/* ─── Program Feed ─── */
const DirectorySearch = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [programs, setPrograms] = useState([]);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [applyMessage, setApplyMessage] = useState('');
  const [ngoStats, setNgoStats] = useState({ volunteers: 0, hours: 0, campaigns: 0, activeCampaigns: 0, endedCampaigns: 0 });

  useEffect(() => {
    if (selectedProgram) {
      const ngoId = selectedProgram.ngoId?._id || selectedProgram.ngoId;
      if (ngoId) {
        fetch(`http://localhost:5000/api/users/ngos/${ngoId}/stats`)
          .then(res => res.json())
          .then(data => setNgoStats(data))
          .catch(console.error);
      }
    }
  }, [selectedProgram]);

  const [userApplications, setUserApplications] = useState([]);

  const getInitialDomain = () => {
    const interests = Array.isArray(user?.interests)
      ? user.interests
      : (typeof user?.interests === 'string' && user.interests ? [user.interests] : []);
    if (interests.length > 0) {
      return interests[0];
    }
    return 'All';
  };
  const [domainFilter, setDomainFilter] = useState(getInitialDomain());

  useEffect(() => {
    fetchPrograms();
    if (user?._id || user?.gcId) {
      fetchUserApplications();
    }
  }, [user]);

  const fetchPrograms = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/programs');
      const data = await res.json();
      setPrograms(data);
    } catch (e) { console.error(e); }
  };

  const fetchUserApplications = async () => {
    try {
      const id = user?._id || user?.gcId;
      const res = await fetch(`http://localhost:5000/api/applications/volunteer/${id}`);
      const data = await res.json();
      setUserApplications(data);
    } catch (e) { console.error(e); }
  };

  const getDomainTranslationKey = (domain) => {
    if (domain === 'Environment') return 'filter_env';
    if (domain === 'Education') return 'filter_edu';
    if (domain === 'Health') return 'filter_health';
    if (domain === 'Disaster Relief') return 'filter_relief';
    if (domain === 'Animal Welfare') return 'filter_animal';
    if (domain === 'Rural Development') return 'filter_rural';
    return domain;
  };

  const filtered = programs.filter(program => {
    const ngo = program.ngoId;
    if (!ngo) return false;
    const matchesSearch = program.title.toLowerCase().includes(searchTerm.toLowerCase()) || ngo.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (domainFilter === 'All') return matchesSearch;
    
    if (domainFilter === 'My Interests') {
      const interests = Array.isArray(user?.interests) 
        ? user.interests 
        : (typeof user?.interests === 'string' && user.interests ? [user.interests] : []);
      return interests.includes(ngo.domain) && matchesSearch;
    }
    return ngo.domain === domainFilter && matchesSearch;
  });

  const handleApply = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          programId: selectedProgram._id,
          ngoId: selectedProgram.ngoId._id || selectedProgram.ngoId,
          volunteerId: user?._id || user?.gcId,
          roleApplied: selectedRole
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setApplyMessage(data.message || 'Error applying');
      } else {
        setApplyMessage('Application submitted successfully!');
        const id = user?._id || user?.gcId;
        fetchUserApplications(); // Refresh to show new status
        setTimeout(() => {
          setShowApplyModal(false);
          setApplyMessage('');
          setSelectedRole('');
        }, 1500);
      }
    } catch (e) {
      setApplyMessage('Network error');
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Search Bar */}
      <div className="glass-card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 240, position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="Search NGOs by name..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="form-input"
            style={{ width: 'auto', minWidth: 160 }}
            value={domainFilter}
            onChange={e => setDomainFilter(e.target.value)}
          >
            <option style={{ color: '#1E293B', background: '#FFFFFF' }} value="All">All Domains</option>
            {((Array.isArray(user?.interests) && user.interests.length > 0) || (typeof user?.interests === 'string' && user?.interests)) && (
              <option style={{ color: '#1E293B', background: '#FFFFFF' }} value="My Interests">My Interests</option>
            )}
            <option style={{ color: '#1E293B', background: '#FFFFFF' }} value="Environment">Environment</option>
            <option style={{ color: '#1E293B', background: '#FFFFFF' }} value="Education">Education</option>
            <option style={{ color: '#1E293B', background: '#FFFFFF' }} value="Health">Health</option>
            <option style={{ color: '#1E293B', background: '#FFFFFF' }} value="Disaster Relief">Disaster Relief</option>
            <option style={{ color: '#1E293B', background: '#FFFFFF' }} value="Animal Welfare">Animal Welfare</option>
            <option style={{ color: '#1E293B', background: '#FFFFFF' }} value="Rural Development">Rural Development</option>
          </select>
        </div>
      </div>

      {/* Program Cards */}
      <div className="grid grid-md-3">
        {filtered.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--color-text-secondary)' }}>
            No programs available at the moment.
          </div>
        ) : filtered.map(program => (
          <div key={program._id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-primary)', lineHeight: 1.3, margin: 0 }}>{program.title}</h3>
            </div>
            
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '1rem', flex: 1 }}>
              {program.description}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--color-text-primary)', marginBottom: '0.35rem', fontWeight: 600 }}>
              <Award size={14} /> {program.ngoId?.name}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '0.35rem' }}>
              <Target size={14} /> {program.ngoId?.domain || 'Unknown'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '0.35rem' }}>
              <MapPin size={14} /> {program.location || (program.ngoId?.location === 'Bangalore' ? (language === 'KN' ? 'ಬೆಂಗಳೂರು' : language === 'HI' ? 'बेंगलुरु' : 'Bangalore') : (program.ngoId?.location || program.ngoId?.headquarters || 'Location TBD'))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#10B981', fontWeight: 600, marginBottom: '1.25rem' }}>
              <Users size={14} /> {program.volunteerCount || 0} Volunteers
            </div>
            <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--color-border)', display: 'flex', gap: '0.5rem' }}>
              {(() => {
                const app = userApplications.find(a => (a.programId?._id === program._id || a.programId === program._id));
                if (app) {
                  return (
                    <div style={{ flex: 1, textAlign: 'center', padding: '0.5rem', background: 'var(--color-border)', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem', fontWeight: 600 }}>
                      {app.status === 'Approved' ? 'Active' : app.status}
                    </div>
                  );
                }
                return (
                  <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => { setSelectedProgram(program); setSelectedRole(''); setApplyMessage(''); setShowApplyModal(true); }}>
                    Connect
                  </button>
                );
              })()}
            </div>
          </div>
        ))}
      </div>

      {showApplyModal && selectedProgram && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-card" style={{ padding: '2rem', width: '100%', maxWidth: 600, maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
               <h3 className="section-title" style={{ margin: 0, fontSize: '1.5rem', color: 'var(--color-primary)', paddingRight: '2rem' }}>{selectedProgram.title}</h3>
               <button type="button" onClick={() => setShowApplyModal(false)} style={{ background: '#F1F5F9', border: 'none', color: '#334155', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'absolute', top: '1.5rem', right: '1.5rem' }}>
                 <X size={16} />
               </button>
            </div>
            
            <div style={{ background: '#F8FAFC', padding: '1.25rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid #E2E8F0' }}>
               <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', color: '#334155' }}>Program Description</h4>
               <p style={{ fontSize: '0.95rem', color: '#475569', margin: '0 0 1.25rem 0', lineHeight: 1.6 }}>
                 {selectedProgram.description}
               </p>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: '#64748B', borderTop: '1px solid #E2E8F0', paddingTop: '1rem' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Award size={16} style={{ color: 'var(--color-secondary)' }} />
                    <span style={{ fontWeight: 600, color: '#334155' }}>Hosted by:</span> {selectedProgram.ngoId?.name}
                 </div>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MapPin size={16} style={{ color: 'var(--color-secondary)' }} />
                    <span style={{ fontWeight: 600, color: '#334155' }}>Location:</span> {selectedProgram.location || selectedProgram.ngoId?.location || selectedProgram.ngoId?.headquarters || 'TBD'}
                 </div>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 600, color: '#334155' }}>Roles Needed:</span> 
                    {selectedProgram.rolesNeeded.map((role, i) => (
                      <span key={i} className="badge badge-primary" style={{ padding: '0.15rem 0.4rem', fontSize: '0.75rem' }}>{role}</span>
                    ))}
                 </div>
               </div>
            </div>

            <div style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #E2E8F0' }}>
               <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', color: '#334155' }}>About the NGO</h4>
               <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '0 0 1rem 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                 {selectedProgram.ngoId?.about || 'No description provided by the NGO.'}
               </p>
               <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.85rem', color: 'var(--color-primary)' }}>
                 <span style={{ display: 'flex', alignItems: 'center' }}>
                   <Target size={14} style={{ marginRight: '6px' }} />
                   <span style={{ fontWeight: 600, color: '#334155', marginRight: '4px' }}>Domain:</span> 
                   {selectedProgram.ngoId?.domain}
                 </span>
               </div>
               <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', borderTop: '1px dashed #E2E8F0', paddingTop: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ flex: '1 1 100px', textAlign: 'center', background: '#F8FAFC', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    <Users size={16} style={{ color: 'var(--color-secondary)', margin: '0 auto 0.25rem auto' }} />
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#334155' }}>{ngoStats.volunteers}</div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Volunteers</div>
                  </div>
                  <div style={{ flex: '1 1 100px', textAlign: 'center', background: '#F8FAFC', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    <Clock size={16} style={{ color: 'var(--color-secondary)', margin: '0 auto 0.25rem auto' }} />
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#334155' }}>{ngoStats.hours}</div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Hours Logged</div>
                  </div>
                  <div style={{ flex: '1 1 100px', textAlign: 'center', background: '#F8FAFC', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    <Activity size={16} style={{ color: '#3B82F6', margin: '0 auto 0.25rem auto' }} />
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#334155' }}>{ngoStats.activeCampaigns}</div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Active</div>
                  </div>
                  <div style={{ flex: '1 1 100px', textAlign: 'center', background: '#F8FAFC', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    <Activity size={16} style={{ color: '#94A3B8', margin: '0 auto 0.25rem auto' }} />
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#334155' }}>{ngoStats.endedCampaigns}</div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Ended</div>
                  </div>
               </div>
            </div>
            
            <form onSubmit={handleApply}>
              <div className="form-group">
                <label className="form-label">Select Role to Apply</label>
                <select className="form-input" required value={selectedRole} onChange={e => setSelectedRole(e.target.value)}>
                  <option value="" disabled>Select a role...</option>
                  {selectedProgram.rolesNeeded.map((role, idx) => (
                    <option key={idx} value={role}>{role}</option>
                  ))}
                </select>
              </div>

              {applyMessage && (
                <div style={{ padding: '0.75rem', background: applyMessage.includes('error') || applyMessage.includes('already') ? '#FEE2E2' : '#DCFCE7', color: applyMessage.includes('error') || applyMessage.includes('already') ? '#991B1B' : '#166534', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem', fontWeight: 600 }}>
                  {applyMessage}
                </div>
              )}
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Submit Application</button>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowApplyModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
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

/* ─── Premium PDF Program Certificate Generator ─── */
const generateProgramCertificate = (act, userName) => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();

  const primaryColor = [46, 125, 50]; // emerald green
  const accentColor = [245, 127, 23]; // golden amber

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
  doc.text('CERTIFICATE OF VOLUNTEERING', width / 2, 35, { align: 'center' });

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
  doc.text('in recognition of their valuable contribution to', width / 2, 90, { align: 'center' });
  
  // Program Name
  doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text(act.programId?.title || 'Volunteer Program', width / 2, 105, { align: 'center' });

  // NGO Name
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.text(`Hosted by: ${act.ngoId?.name || 'Partner NGO'}`, width / 2, 115, { align: 'center' });

  // Date & Hours
  const dateStr = new Date(act.updatedAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(`Date: ${dateStr}   |   Hours Logged: ${act.programId?.hours || 0}`, width / 2, 135, { align: 'center' });

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

/* ─── Impact Dashboard ─── */
const ImpactDashboard = ({ badgeData, fetchBadgesAndStats }) => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    const id = user?._id || user?.gcId;
    if (!id) return;
    const fetchApps = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/applications/volunteer/${id}`);
        const data = await res.json();
        setApplications(data);
      } catch (e) { console.error(e); }
    };
    fetchApps();
    if (fetchBadgesAndStats) fetchBadgesAndStats();
  }, [user]);

  const completedApps = applications.filter(a => a.status === 'Approved' && a.programId?.status === 'Completed' && a.attendance !== 'Absent');
  const eventsAttended = badgeData?.eventsCount ?? completedApps.length;
  const hoursVolunteered = badgeData?.totalHours ?? completedApps.reduce((acc, a) => acc + (a.programId?.hours || 0), 0);
  const badgesCount = badgeData?.badges?.length ?? 0;

  const getStatLabelTranslationKey = (label) => {
    if (label === 'Hours Volunteered') return 'stat_hours';
    if (label === 'Badges Earned') return 'stat_badges';
    if (label === 'Events Attended') return 'stat_events';
    return label;
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="grid grid-md-3">
        {[
          { icon: Clock, label: 'Hours Volunteered', value: hoursVolunteered.toString(), color: 'var(--color-primary)', bg: 'rgba(0, 0, 0, 0.05)' },
          { icon: Award, label: 'Badges Earned', value: badgesCount.toString(), color: 'var(--color-secondary)', bg: 'rgba(0, 0, 0, 0.05)' },
          { icon: Calendar, label: 'Events Attended', value: eventsAttended.toString(), color: 'var(--color-warning)', bg: 'rgba(0, 0, 0, 0.05)' }
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg }}>
              <s.icon size={20} style={{ color: s.color }} />
            </div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Earned Badges Section */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <Award size={20} style={{ color: 'var(--color-secondary)' }} />
          Earned Badges & Certificates
        </h3>
        {!badgeData?.badges || badgeData.badges.length === 0 ? (
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', margin: 0 }}>You haven't earned any badges yet. Keep volunteering to unlock achievements!</p>
        ) : (
          <div className="grid grid-md-4" style={{ gap: '1.5rem' }}>
            {badgeData.badges.map((badge, idx) => {
              const imgMap = {
                'Bronze': '/badges/bronze.png',
                'Silver': '/badges/silver.png',
                'Gold': '/badges/gold.png',
                'Platinum': '/badges/platinum.png'
              };
              const colorMap = {
                'Bronze': '#8B4513',
                'Silver': '#708090',
                'Gold': '#F57F17',
                'Platinum': '#4A148C'
              };
              return (
                <div key={idx} className="glass-card card-hover animate-fade-in" style={{ padding: '1.25rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', border: `1.5px solid ${colorMap[badge.level] || 'var(--color-secondary)'}33` }}>
                  <img src={imgMap[badge.level] || '/badges/bronze.png'} alt={badge.name} style={{ width: 72, height: 72, objectFit: 'contain', marginBottom: '0.75rem', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))' }} />
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, margin: '0 0 0.15rem 0', color: 'var(--color-text-primary)' }}>{badge.name}</h4>
                  <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 700, color: colorMap[badge.level], letterSpacing: '0.05em', display: 'block', marginBottom: '0.5rem' }}>{badge.level} Tier</span>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', margin: '0 0 1rem 0', flex: 1, lineHeight: 1.4 }}>{badge.description}</p>
                  <button onClick={() => generateCertificate(badge, user?.name || 'Gladiators Volunteer')} className="btn btn-outline" style={{ fontSize: '0.75rem', padding: '0.35rem 0.5rem', width: '100%', borderColor: colorMap[badge.level], color: colorMap[badge.level] }}>
                    Download Certificate
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <h3 className="section-title">Recent Activity</h3>
        <div className="space-y-4">
          {completedApps.length === 0 ? (
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', margin: 0 }}>No completed activities yet.</p>
          ) : completedApps.map((act, i) => (
            <div key={i} className="list-item">
              <div>
                <p style={{ fontWeight: 600, color: 'var(--color-text-primary)', fontSize: '0.9rem', margin: 0 }}>{act.programId?.title}</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', margin: 0 }}>{act.ngoId?.name} · {new Date(act.updatedAt).toLocaleDateString()}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span className="badge badge-primary">+{act.programId?.hours} hrs</span>
                <button className="btn btn-outline" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }} onClick={() => generateProgramCertificate(act, user?.name || 'Gladiators Volunteer')}>
                  Download Certificate
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ─── NGO Directory View ─── */
const NgoDirectoryView = ({ onSelectNgo }) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [ngos, setNgos] = useState([]);
  
  const getInitialDomain = () => {
    const interests = Array.isArray(user?.interests)
      ? user.interests
      : (typeof user?.interests === 'string' && user.interests ? [user.interests] : []);
    if (interests.length > 0) {
      return interests[0];
    }
    return 'All';
  };
  const [domainFilter, setDomainFilter] = useState(getInitialDomain());

  useEffect(() => {
    fetchNgos();
  }, []);

  const fetchNgos = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/ngos');
      const data = await res.json();
      setNgos(data);
    } catch (e) { console.error(e); }
  };

  const filtered = ngos.filter(ngo => {
    const matchesSearch = ngo.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (domainFilter === 'All') return matchesSearch;
    
    if (domainFilter === 'My Interests') {
      const interests = Array.isArray(user?.interests) 
        ? user.interests 
        : (typeof user?.interests === 'string' && user.interests ? [user.interests] : []);
      return interests.includes(ngo.domain) && matchesSearch;
    }
    return ngo.domain === domainFilter && matchesSearch;
  });

  return (
    <div className="animate-fade-in space-y-6">
      <div className="glass-card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 240, position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="Search NGOs by name..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="form-input"
            style={{ width: 'auto', minWidth: 160 }}
            value={domainFilter}
            onChange={e => setDomainFilter(e.target.value)}
          >
            <option style={{ color: '#1E293B', background: '#FFFFFF' }} value="All">All Domains</option>
            {((Array.isArray(user?.interests) && user.interests.length > 0) || (typeof user?.interests === 'string' && user?.interests)) && (
              <option style={{ color: '#1E293B', background: '#FFFFFF' }} value="My Interests">My Interests</option>
            )}
            <option style={{ color: '#1E293B', background: '#FFFFFF' }} value="Environment">Environment</option>
            <option style={{ color: '#1E293B', background: '#FFFFFF' }} value="Education">Education</option>
            <option style={{ color: '#1E293B', background: '#FFFFFF' }} value="Health">Health</option>
            <option style={{ color: '#1E293B', background: '#FFFFFF' }} value="Disaster Relief">Disaster Relief</option>
            <option style={{ color: '#1E293B', background: '#FFFFFF' }} value="Animal Welfare">Animal Welfare</option>
            <option style={{ color: '#1E293B', background: '#FFFFFF' }} value="Rural Development">Rural Development</option>
          </select>
        </div>
      </div>

      <div className="grid grid-md-3">
        {filtered.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--color-text-secondary)' }}>
            No NGOs found for this domain.
          </div>
        ) : filtered.map(ngo => (
          <div 
            key={ngo._id} 
            className="glass-card card-hover" 
            style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', cursor: 'pointer' }}
            onClick={() => onSelectNgo(ngo)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-primary)', lineHeight: 1.3, margin: 0 }}>{ngo.name}</h3>
            </div>
            
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '1rem', flex: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {ngo.about || 'This NGO is focused on making a profound impact in their dedicated domain.'}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--color-text-primary)', marginBottom: '0.35rem', fontWeight: 600 }}>
              <Target size={14} /> Domain: {ngo.domain || 'N/A'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
              <MapPin size={14} /> {ngo.location || ngo.headquarters || 'Location not specified'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─── Volunteer NGO Profile View ─── */
const VolunteerNgoProfileView = ({ ngo, onBack }) => {
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [selectedGalleryItem, setSelectedGalleryItem] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const mediaGallery = ngo?.mediaGallery || [];

  return (
    <div className="animate-fade-in space-y-6">
      <button 
        onClick={onBack}
        className="btn btn-outline"
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', border: 'none', background: 'var(--color-border)', color: 'var(--color-text-primary)' }}
      >
        <ArrowLeft size={16} /> Back to Directory
      </button>

      {/* NGO Header (Impact Profile Style) */}
      <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{
            width: 100, height: 100, borderRadius: '50%', background: 'var(--color-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            border: '3px solid white', boxShadow: 'var(--shadow-sm)', overflow: 'hidden'
          }}>
            {ngo?.profilePhoto ? (
              <img src={ngo.profilePhoto} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <Camera size={32} style={{ color: '#94A3B8' }} />
            )}
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '0.35rem', color: 'var(--color-primary)' }}>
              {ngo?.name || 'NGO Name'}
            </h2>
            <p style={{ fontSize: '0.9rem', marginBottom: '0.75rem', lineHeight: 1.6 }}>
              {ngo?.about || 'No about information provided.'}
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <span className="badge badge-primary">{ngo?.domain || 'Environment'}</span>
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
          </div>
        </div>
      </div>

      {/* Impact Gallery (Read-Only) */}
      <h3 className="section-title" style={{ marginTop: '2rem' }}>Impact Gallery</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {mediaGallery.length === 0 ? (
          <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)', gridColumn: '1 / -1' }}>
            This NGO hasn\
          </div>
        ) : mediaGallery.map((item, idx) => (
          <div key={item._id || idx} className="glass-card card-hover" style={{ overflow: 'hidden', cursor: 'pointer' }} onClick={() => { setSelectedGalleryItem(item); setActiveImageIndex(0); setIsGalleryModalOpen(true); }}>
            <div style={{ aspectRatio: '1 / 1', background: 'var(--color-border)', position: 'relative' }}>
              {item.images && item.images.length > 0 ? (
                <img src={item.images[0]} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>
                  <Camera size={32} />
                </div>
              )}
              {item.images && item.images.length > 1 && (
                <div style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(0,0,0,0.6)', color: 'white', fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '1rem', fontWeight: 600 }}>
                  +{item.images.length - 1} photos
                </div>
              )}
            </div>
            <div style={{ padding: '1rem' }}>
              <h4 style={{ fontWeight: 700, color: 'var(--color-primary)', marginBottom: '0.25rem', fontSize: '1rem' }}>{item.title}</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Gallery Slideshow Modal (Read-Only) */}
      {isGalleryModalOpen && selectedGalleryItem && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'rgba(0, 0, 0, 0.75)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', borderRadius: '16px', background: '#ffffff', width: '100%', maxWidth: '1000px', maxHeight: '90vh' }}>
            {selectedGalleryItem.images && selectedGalleryItem.images.length > 0 ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0f172a', padding: '1rem' }}>
                <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginBottom: '1rem' }}>
                  <button onClick={() => setIsGalleryModalOpen(false)} style={{ background: '#FFFFFF', border: 'none', color: '#334155', cursor: 'pointer', width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', flexShrink: 0 }}>
                    <X size={20} />
                  </button>
                </div>
                <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', flex: 1, width: '100%', minHeight: '300px' }}>
                  <img src={selectedGalleryItem.images[activeImageIndex]} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} alt="Activity" />
                
                  {selectedGalleryItem.images.length > 1 && (
                    <>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setActiveImageIndex(prev => prev > 0 ? prev - 1 : selectedGalleryItem.images.length - 1); }}
                        style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                      >
                        <ChevronLeft size={24} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setActiveImageIndex(prev => prev < selectedGalleryItem.images.length - 1 ? prev + 1 : 0); }}
                        style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                      >
                        <ChevronRight size={24} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#111', color: '#94A3B8', minHeight: '300px' }}>
                No photos available for this activity
              </div>
            )}

            <div style={{ padding: '1.5rem', background: '#ffffff', color: '#334155', borderTop: '1px solid #e2e8f0', flexShrink: 0 }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 0.5rem', color: '#0f172a' }}>{selectedGalleryItem.title}</h3>
              <p style={{ fontSize: '1rem', lineHeight: 1.6, opacity: 0.9, margin: 0, color: '#334155' }}>{selectedGalleryItem.description}</p>
              
              {selectedGalleryItem.images && selectedGalleryItem.images.length > 1 && (
                <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1rem', justifyContent: 'center' }}>
                  {selectedGalleryItem.images.map((_, idx) => (
                    <div key={idx} style={{ width: 10, height: 10, borderRadius: '50%', background: idx === activeImageIndex ? 'var(--color-primary)' : '#CBD5E1', cursor: 'pointer', transition: 'background 0.2s' }} onClick={() => setActiveImageIndex(idx)} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const VolunteerInbox = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  
  useEffect(() => {
    const id = user?._id || user?.gcId;
    if (id) {
      fetch(`http://localhost:5000/api/chat/inbox/${id}`)
        .then(res => res.json())
        .then(data => {
          setMessages(data);
          // Mark all as read
          fetch(`http://localhost:5000/api/chat/inbox/read/${id}`, { method: 'PUT' }).catch(console.error);
        })
        .catch(console.error);
    }
  }, [user]);

  return (
    <div className="animate-fade-in space-y-6">
      <h2 className="section-title">My Inbox</h2>
      {messages.length === 0 ? (
        <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
          No messages in your inbox.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {messages.map(msg => (
            <div key={msg._id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-start', borderLeft: msg.read ? 'none' : '4px solid var(--color-primary)' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{msg.senderId?.name || 'NGO'}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{new Date(msg.createdAt).toLocaleString()}</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.5, color: 'var(--color-text-primary)' }}>{msg.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ─── Volunteer Dashboard ─── */
const VolunteerDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('ngos');
  const [selectedNgoProfile, setSelectedNgoProfile] = useState(null);

  // Volunteer Badges and Stats states
  const [badgeData, setBadgeData] = useState({ badges: [], totalHours: 0, eventsCount: 0 });

  const fetchBadgesAndStats = async () => {
    const id = user?._id || user?.gcId;
    if (!id) return;
    try {
      const res = await fetch(`http://localhost:5000/api/auth/volunteer/${id}/badges`);
      if (res.ok) {
        const data = await res.json();
        setBadgeData(data);
      }
    } catch (e) {
      console.error("Error fetching badges:", e);
    }
  };

  useEffect(() => {
    fetchBadgesAndStats();
  }, [user]);

  const tabs = [
    { id: 'ngos', label: 'NGO Directory' },
    { id: 'broadcasts', label: 'Broadcasts' },
    { id: 'impact', label: 'My Impact' },
    { id: 'inbox', label: 'Inbox' }
  ];

  return (
    <div>
      <div className="page-header">
        <h1 className="text-gradient">Volunteer Dashboard</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
          <p style={{ margin: 0 }}>
            Make an impact, <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{user?.name}</span>
          </p>
          {badgeData.badges && badgeData.badges.length > 0 && (
            <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center', marginLeft: '0.5rem' }}>
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
                    style={{ width: 22, height: 22, objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }} 
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Sleek Gamified Badges Progress Banner */}
      <div className="glass-card animate-fade-in" style={{ 
        padding: '1.25rem 1.5rem', 
        marginBottom: '1.5rem', 
        borderRadius: '16px', 
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0.45))',
        border: '1.5px solid rgba(255, 255, 255, 0.6)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.04)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: '1 1 300px' }}>
          <div style={{ 
            background: 'linear-gradient(135deg, var(--color-primary), #1B5E20)',
            borderRadius: '12px',
            width: '48px',
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            boxShadow: '0 4px 12px rgba(46, 125, 50, 0.25)'
          }}>
            <Award size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--color-text-primary)' }}>
              {badgeData.badges && badgeData.badges.length > 0 
                ? `${badgeData.badges[badgeData.badges.length - 1].name} (${badgeData.badges[badgeData.badges.length - 1].level} Tier)`
                : 'GladiConnect Volunteer'}
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', margin: '0.1rem 0 0 0' }}>
              Total Volunteer Hours: <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{badgeData.totalHours || 0} hrs</span>
            </p>
          </div>
        </div>

        {/* Badges Display Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {['Bronze', 'Silver', 'Gold', 'Platinum'].map(level => {
            const hasBadge = badgeData.badges && badgeData.badges.some(b => b.level === level);
            const imgMap = {
              'Bronze': '/badges/bronze.png',
              'Silver': '/badges/silver.png',
              'Gold': '/badges/gold.png',
              'Platinum': '/badges/platinum.png'
            };
            const labelMap = {
              'Bronze': 'Green Horn (5h)',
              'Silver': 'Earth Champion (15h)',
              'Gold': 'Gladiator Hero (30h)',
              'Platinum': 'Eco Vanguard (50h)'
            };
            return (
              <div 
                key={level} 
                title={labelMap[level]}
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  opacity: hasBadge ? 1 : 0.25,
                  transform: hasBadge ? 'scale(1)' : 'scale(0.9)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
              >
                <img 
                  src={imgMap[level]} 
                  alt={level} 
                  style={{ 
                    width: '38px', 
                    height: '38px', 
                    objectFit: 'contain', 
                    filter: hasBadge ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))' : 'grayscale(100%)' 
                  }} 
                />
                <span style={{ fontSize: '0.65rem', fontWeight: 700, marginTop: '0.25rem', color: 'var(--color-text-secondary)' }}>
                  {level}
                </span>
              </div>
            );
          })}
        </div>

        {/* Dynamic Next Badge Target Progress */}
        {(() => {
          const totalHours = badgeData.totalHours || 0;
          let nextLevel = 'Bronze';
          let nextLimit = 5;
          let prevLimit = 0;

          if (totalHours >= 50) {
            return (
              <div style={{ flex: '1 1 200px', textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)', display: 'block' }}>
                  🎉 Max Tier Reached!
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>
                  You are a certified Eco Vanguard!
                </span>
              </div>
            );
          } else if (totalHours >= 30) {
            nextLevel = 'Platinum';
            nextLimit = 50;
            prevLimit = 30;
          } else if (totalHours >= 15) {
            nextLevel = 'Gold';
            nextLimit = 30;
            prevLimit = 15;
          } else if (totalHours >= 5) {
            nextLevel = 'Silver';
            nextLimit = 15;
            prevLimit = 5;
          }

          const progressPercent = Math.min(100, Math.max(0, ((totalHours - prevLimit) / (nextLimit - prevLimit)) * 100));

          return (
            <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontWeight: 600 }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Next: {nextLevel} Badge</span>
                <span style={{ color: 'var(--color-primary)' }}>{totalHours} / {nextLimit} hrs</span>
              </div>
              <div style={{ width: '100%', height: '6px', background: 'rgba(0,0,0,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ 
                  width: `${progressPercent}%`, 
                  height: '100%', 
                  background: 'linear-gradient(90deg, var(--color-primary), #4CAF50)', 
                  borderRadius: '3px',
                  transition: 'width 0.5s ease-out'
                }} />
              </div>
            </div>
          );
        })()}
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setSelectedNgoProfile(null); }}
            className={`tab-btn ${activeTab === tab.id ? 'tab-btn-active' : 'tab-btn-inactive'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ minHeight: 400 }}>
        {activeTab === 'ngos' && (
          selectedNgoProfile ? (
            <VolunteerNgoProfileView ngo={selectedNgoProfile} onBack={() => setSelectedNgoProfile(null)} />
          ) : (
            <NgoDirectoryView onSelectNgo={setSelectedNgoProfile} />
          )
        )}
        {activeTab === 'broadcasts' && <DirectorySearch />}
        {activeTab === 'impact' && (
          <ImpactDashboard badgeData={badgeData} fetchBadgesAndStats={fetchBadgesAndStats} />
        )}
        {activeTab === 'inbox' && <VolunteerInbox />}
      </div>
    </div>
  );
};

export default VolunteerDashboard;
