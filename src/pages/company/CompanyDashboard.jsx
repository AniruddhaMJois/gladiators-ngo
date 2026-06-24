import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { IndianRupee, FileText, Target, TrendingUp, Search, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/* ─── Impact Tracker ─── */
const ImpactTracker = () => {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [expandedDonationId, setExpandedDonationId] = useState(null);
  const [donationExpenses, setDonationExpenses] = useState({});

  useEffect(() => {
    // In a real scenario, fetch donations where donorId = user.gcId
    // For demo purposes, we fetch all donations and filter locally, or mock if none exist.
    fetch(`http://localhost:5000/api/finance/donations/demo-will-fail-if-no-ngo`)
      .catch(() => {});
      
    // Mocking donations for the tracker since donor query isn't fully implemented in backend API yet
    setDonations([
      { _id: '1', ngoName: 'Global Green Initiative', amount: 500000, date: new Date().toISOString(), campaignTitle: 'Plant 10,000 Trees', ngoId: 'ngo1' },
      { _id: '2', ngoName: 'EduCare Foundation', amount: 250000, date: new Date(Date.now() - 86400000*5).toISOString(), campaignTitle: 'Rural School Supplies', ngoId: 'ngo2' }
    ]);
  }, [user]);

  const toggleExpand = async (donation) => {
    if (expandedDonationId === donation._id) {
      setExpandedDonationId(null);
      return;
    }
    setExpandedDonationId(donation._id);
    
    // Fetch expenses for this NGO to show transparency
    if (!donationExpenses[donation._id]) {
      try {
        const res = await fetch(`http://localhost:5000/api/finance/reports/${donation.ngoId}`);
        if (res.ok) {
          const data = await res.json();
          setDonationExpenses(prev => ({...prev, [donation._id]: data}));
        } else {
          // Mock data if NGO doesn't exist
          setDonationExpenses(prev => ({...prev, [donation._id]: [
            { _id: 'e1', title: 'Saplings Purchase', totalAmount: 120000, date: new Date().toISOString(), campaignId: { title: 'Materials' } },
            { _id: 'e2', title: 'Labor for Planting', totalAmount: 80000, date: new Date().toISOString(), campaignId: { title: 'Labor' } }
          ]}));
        }
      } catch (err) {
        setDonationExpenses(prev => ({...prev, [donation._id]: []}));
      }
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 className="section-title">Impact & Receipt Tracker</h3>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {donations.map(d => (
          <div key={d._id} className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
            <div 
              style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', background: expandedDonationId === d._id ? 'rgba(0,0,0,0.02)' : 'transparent' }}
              onClick={() => toggleExpand(d)}
            >
              <div>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>{d.campaignTitle}</h4>
                <p style={{ margin: 0, color: 'var(--color-text-muted)', fontWeight: 500 }}>Supported NGO: {d.ngoName}</p>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#94A3B8' }}>Donated on {new Date(d.date).toLocaleDateString()}</p>
              </div>
              <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>₹{d.amount.toLocaleString()}</div>
                {expandedDonationId === d._id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
            </div>
            
            {expandedDonationId === d._id && (
              <div style={{ padding: '1.5rem', borderTop: '1px solid var(--color-border)', background: 'var(--color-surface)', backdropFilter: 'blur(20px)' }}>
                <h5 style={{ margin: '0 0 1rem 0', color: 'var(--color-text-secondary)' }}>Expense Logs & Receipts</h5>
                {(donationExpenses[d._id] || []).length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {donationExpenses[d._id].map(exp => (
                      <div key={exp._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'var(--color-surface)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                        <div>
                          <p style={{ margin: 0, fontWeight: 500 }}>{exp.title} <span className="badge badge-secondary">{exp.campaignId?.title || 'General'}</span></p>
                          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{new Date(exp.date).toLocaleDateString()}</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <span style={{ fontWeight: 'bold', color: '#EF4444' }}>- ₹{(exp.totalAmount || 0).toLocaleString()}</span>
                          <button className="icon-btn" style={{ background: 'var(--color-surface-hover)', backdropFilter: 'blur(12px)' }} title="View Receipt"><FileText size={16} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: '#94A3B8', fontSize: '0.9rem' }}>Loading expenses or no expenses logged yet.</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─── Company Dashboard ─── */
const CompanyDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('impact');

  const tabs = [
    { id: 'impact', label: 'Impact Tracker' },
    { id: 'reports', label: 'CSR Reports' }
  ];

  return (
    <div>
      <div className="page-header">
        <h1 className="text-gradient">Company Dashboard</h1>
        <p>Manage your CSR impact, verify NGOs, and track every dollar.</p>
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
        <button className="btn btn-primary" onClick={() => navigate('/company/search')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1rem' }}>
          <Search size={20} /> Charity Search Engine
        </button>
        <button className="btn btn-secondary" onClick={() => navigate('/messages')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1rem' }}>
          <MessageSquare size={20} /> Direct Connect
        </button>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`tab-btn ${activeTab === tab.id ? 'tab-btn-active' : 'tab-btn-inactive'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ minHeight: 400 }}>
        {activeTab === 'impact' && <ImpactTracker />}
        {activeTab === 'reports' && (
          <div className="animate-fade-in glass-card" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(0, 0, 0, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
              <FileText size={32} style={{ color: 'var(--color-primary)' }} />
            </div>
            <h2 className="text-gradient" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Impact & CSR Reports</h2>
            <p style={{ fontSize: '0.95rem', maxWidth: 480, margin: '0 auto 1.5rem' }}>
              Generate comprehensive, transparent reports formatted for compliance and stakeholder reviews.
            </p>
            <button className="btn btn-primary"><TrendingUp size={16} /> Generate Q3 Report</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyDashboard;
