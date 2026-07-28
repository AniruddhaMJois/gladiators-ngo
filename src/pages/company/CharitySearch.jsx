import React, { useState, useEffect } from 'react';
import { Search, MapPin, Target, ChevronRight, X, IndianRupee } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CharitySearch = () => {
  const [ngosList, setNgosList] = useState([]);
  const [searchParams, setSearchParams] = useState({ location: '', domain: '' });
  const [availableLocations, setAvailableLocations] = useState([]);
  const [availableDomains, setAvailableDomains] = useState([]);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const res = await fetch(`https://gladiators-ngo.onrender.com/api/users/ngos/search?`);
      const data = await res.json();
      setNgosList(data);
      
      const locs = [...new Set(data.map(ngo => ngo.headquarters).filter(Boolean))].sort();
      const doms = [...new Set(data.map(ngo => ngo.domain).filter(Boolean))].sort();
      setAvailableLocations(locs);
      setAvailableDomains(doms);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchNgos = async () => {
    try {
      const query = new URLSearchParams(searchParams).toString();
      const res = await fetch(`https://gladiators-ngo.onrender.com/api/users/ngos/search?${query}`);
      const data = await res.json();
      setNgosList(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchNgos();
  };

  const handleSelectNgo = (ngo) => {
    navigate(`/company/ngo/${ngo._id}`);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="text-gradient">Charity Search Engine</h1>
        <p>Find and verify NGOs. Transparently view their impact and financials before you donate.</p>
      </div>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        {/* Search Sidebar */}
        <div className="glass-card" style={{ flex: '1 1 300px', maxWidth: '350px', height: 'fit-content', padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Filters</h3>
          <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label>Location</label>
              <div style={{ position: 'relative' }}>
                <MapPin size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94A3B8', pointerEvents: 'none' }} />
                <select 
                  className="form-input" 
                  style={{ paddingLeft: '40px', cursor: 'pointer', appearance: 'auto' }}
                  value={searchParams.location}
                  onChange={(e) => setSearchParams({...searchParams, location: e.target.value})}
                >
                  <option value="">All Locations</option>
                  {availableLocations.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Domain/Cause</label>
              <div style={{ position: 'relative' }}>
                <Target size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94A3B8', pointerEvents: 'none' }} />
                <select 
                  className="form-input" 
                  style={{ paddingLeft: '40px', cursor: 'pointer', appearance: 'auto' }}
                  value={searchParams.domain}
                  onChange={(e) => setSearchParams({...searchParams, domain: e.target.value})}
                >
                  <option value="">All Domains/Causes</option>
                  {availableDomains.map(dom => (
                    <option key={dom} value={dom}>{dom}</option>
                  ))}
                </select>
              </div>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
              <Search size={16} /> Search
            </button>
          </form>
        </div>

        {/* Results Grid */}
        <div style={{ flex: '3 1 600px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {ngosList.map(ngo => (
              <div key={ngo._id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', cursor: 'pointer', transition: 'transform 0.2s' }} onClick={() => handleSelectNgo(ngo)} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  {ngo.profilePhoto ? (
                    <img src={ngo.profilePhoto} alt={ngo.name} style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                      {ngo.name?.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{ngo.name}</h3>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-primary)' }}>{ngo.domain || 'General'}</p>
                  </div>
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', flex: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {ngo.about || 'No description available.'}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={14}/> {ngo.headquarters || 'Unknown'}
                  </span>
                  <ChevronRight size={18} style={{ color: 'var(--color-primary)' }} />
                </div>
              </div>
            ))}
            {ngosList.length === 0 && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                No NGOs found matching your criteria.
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default CharitySearch;
