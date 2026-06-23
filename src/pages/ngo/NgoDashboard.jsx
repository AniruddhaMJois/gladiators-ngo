import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Camera, Users, WifiOff, Wifi, IndianRupee, MessageSquare, Plus, Save, Building2, ChevronLeft, ChevronRight, X, Trash2, Edit3, Clock, Activity, FileText, Image as ImageIcon } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';
import NgoProfile from './NgoProfile';
import CollabHub from '../../components/chat/CollabHub';

/* ─── Impact Profile ─── */
const ImpactProfile = () => {
  const { user, updateUserProfile } = useAuth();
  const { showToast } = useToast();
  const { askConfirm } = useConfirm();
  const navigate = useNavigate();
  
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [selectedGalleryItem, setSelectedGalleryItem] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [galleryFormData, setGalleryFormData] = useState({ title: '', description: '', images: [], programId: '' });
  const [programs, setPrograms] = useState([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [ngoStats, setNgoStats] = useState({ volunteers: 0, hours: 0, campaigns: 0, activeCampaigns: 0, endedCampaigns: 0 });

  useEffect(() => {
    if (user?.gcId) {
      fetch(`http://localhost:5000/api/programs/ngo/${user.gcId}`)
        .then(res => res.json())
        .then(data => setPrograms(data))
        .catch(console.error);
        
      fetch(`http://localhost:5000/api/users/ngos/${user.gcId}/stats`)
        .then(res => res.json())
        .then(data => setNgoStats(data))
        .catch(console.error);
    }
  }, [user]);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (galleryFormData.images.length + files.length > 8) {
      showToast('You can only upload up to 8 images per activity.', 'error');
      return;
    }
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_SIZE = 800;
          let width = img.width;
          let height = img.height;
          if (width > height && width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          } else if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const base64 = canvas.toDataURL('image/jpeg', 0.7);
          setGalleryFormData(prev => ({ ...prev, images: [...prev.images, base64] }));
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSaveGalleryItem = async () => {
    if (!galleryFormData.title || !galleryFormData.description) {
      showToast('Title and description are required.', 'error');
      return;
    }
    const updatedGallery = [...(user.mediaGallery || []), galleryFormData];
    const res = await updateUserProfile({ mediaGallery: updatedGallery });
    if (res.success) {
      setIsGalleryModalOpen(false);
      showToast('Activity saved successfully!', 'success');
    } else {
      showToast('Failed to save activity.', 'error');
    }
  };

  const handleDeleteGalleryItem = async (itemToDelete) => {
    if (!(await askConfirm('Delete this entire gallery activity?'))) return;
    const updatedGallery = user.mediaGallery.filter(i => i !== itemToDelete && i._id !== itemToDelete._id);
    const res = await updateUserProfile({ mediaGallery: updatedGallery });
    if (res.success) {
      if (selectedGalleryItem && (selectedGalleryItem === itemToDelete || selectedGalleryItem._id === itemToDelete._id)) {
        setIsGalleryModalOpen(false);
      }
      showToast('Activity deleted.', 'info');
    } else {
      showToast('Failed to delete gallery item.', 'error');
    }
  };

  const handleDeletePhoto = async () => {
    if (!(await askConfirm('Delete this photo?'))) return;
    const updatedImages = selectedGalleryItem.images.filter((_, idx) => idx !== activeImageIndex);
    const updatedItem = { ...selectedGalleryItem, images: updatedImages };
    
    const itemIndex = user.mediaGallery.findIndex(i => i === selectedGalleryItem || i._id === selectedGalleryItem._id || i.title === selectedGalleryItem.title);
    if (itemIndex === -1) return;
    
    const updatedGallery = [...user.mediaGallery];
    updatedGallery[itemIndex] = updatedItem;
    
    const res = await updateUserProfile({ mediaGallery: updatedGallery });
    if (res.success) {
      setSelectedGalleryItem(updatedItem);
      if (activeImageIndex >= updatedImages.length && activeImageIndex > 0) {
        setActiveImageIndex(activeImageIndex - 1);
      }
      showToast('Photo deleted.', 'info');
    } else {
      showToast('Failed to delete photo.', 'error');
    }
  };

  const mediaGallery = user?.mediaGallery || [];

  return (
    <div className="animate-fade-in space-y-6">
      <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{
            width: 100, height: 100, borderRadius: '50%', background: 'var(--color-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            border: '3px solid white', boxShadow: 'var(--shadow-sm)', overflow: 'hidden'
          }}>
            {user?.profilePhoto ? (
              <img src={user.profilePhoto} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <Camera size={32} style={{ color: '#94A3B8' }} />
            )}
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '0.35rem', color: 'var(--color-primary)' }}>
              {user?.name || 'NGO Name'}
            </h2>
            <p style={{ fontSize: '0.9rem', marginBottom: '0.75rem', lineHeight: 1.6 }}>
              {user?.about || 'No about information provided.'}
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <span className="badge badge-primary">{user?.domain || 'Environment'}</span>
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
          <button 
            className="btn btn-outline" 
            style={{ alignSelf: 'flex-start' }}
            onClick={() => navigate('/ngo/profile')}
          >
            Edit Profile
          </button>
        </div>
        
        {/* Impact Stats */}
        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', borderTop: '1px dashed #E2E8F0', paddingTop: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 120px', textAlign: 'center', background: 'var(--color-surface)', backdropFilter: 'blur(20px)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
            <Users size={20} style={{ color: 'var(--color-secondary)', margin: '0 auto 0.5rem auto' }} />
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>{ngoStats.volunteers}</div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Volunteers</div>
          </div>
          <div style={{ flex: '1 1 120px', textAlign: 'center', background: 'var(--color-surface)', backdropFilter: 'blur(20px)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
            <Clock size={20} style={{ color: 'var(--color-secondary)', margin: '0 auto 0.5rem auto' }} />
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>{ngoStats.hours}</div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Hours Logged</div>
          </div>
          <div style={{ flex: '1 1 120px', textAlign: 'center', background: 'var(--color-surface)', backdropFilter: 'blur(20px)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
            <Activity size={20} style={{ color: '#3B82F6', margin: '0 auto 0.5rem auto' }} />
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>{ngoStats.activeCampaigns}</div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Active Campaigns</div>
          </div>
          <div style={{ flex: '1 1 120px', textAlign: 'center', background: 'var(--color-surface)', backdropFilter: 'blur(20px)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
            <Activity size={20} style={{ color: '#94A3B8', margin: '0 auto 0.5rem auto' }} />
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>{ngoStats.endedCampaigns}</div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Ended Campaigns</div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="section-title">Media Gallery</h3>
        <div className="grid grid-md-4">
          {[0, 1, 2, 3, 4, 5, 6, 7].map(i => {
            const item = mediaGallery[i];
            if (item) {
              const imgCount = Math.min(item.images?.length || 0, 3);
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', cursor: 'pointer', position: 'relative' }} onClick={() => { setSelectedGalleryItem(item); setActiveImageIndex(0); setEditMode(false); setIsGalleryModalOpen(true); }}>
                  <button onClick={(e) => { e.stopPropagation(); handleDeleteGalleryItem(item); }} style={{ position: 'absolute', top: 4, right: 4, background: 'var(--color-surface)', backdropFilter: 'blur(20px)', color: '#EF4444', border: 'none', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20, boxShadow: '0 2px 4px rgba(0,0,0,0.2)', cursor: 'pointer' }}>
                    <Trash2 size={14} />
                  </button>
                  <div style={{ position: 'relative', aspectRatio: '1', width: '100%', padding: '12px' }}>
                    {item.images && item.images.length > 0 ? (
                      item.images.slice(0, 3).reverse().map((img, idx) => {
                        const offset = (imgCount - 1 - idx) * 8;
                        return (
                          <div key={idx} style={{
                            position: 'absolute', top: offset, left: offset,
                            right: 24 - offset, bottom: 24 - offset,
                            background: '#fff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            backgroundImage: `url(${img})`, backgroundSize: 'cover', backgroundPosition: 'center',
                            zIndex: imgCount - idx,
                            border: '3px solid white'
                          }} />
                        );
                      })
                    ) : (
                      <div style={{ width: '100%', height: '100%', background: 'var(--color-border)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         <Camera size={24} style={{ color: '#94A3B8' }} />
                      </div>
                    )}
                  </div>
                  <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-primary)', textAlign: 'center', margin: 0, padding: '0 0.5rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.title}
                  </p>
                </div>
              );
            } else {
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div onClick={() => { setGalleryFormData({ title: '', description: '', images: [], programId: '' }); setEditMode(true); setIsGalleryModalOpen(true); }} style={{
                    aspectRatio: '1', background: 'var(--color-border)', borderRadius: '16px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', transition: 'all 0.2s', border: '3px dashed #CBD5E1',
                    margin: '12px', width: 'calc(100% - 24px)', height: 'calc(100% - 24px)'
                  }} onMouseEnter={(e) => e.currentTarget.style.background = '#F8FAFC'} onMouseLeave={(e) => e.currentTarget.style.background = 'var(--color-border)'}>
                    <Plus size={32} style={{ color: '#94A3B8' }} />
                  </div>
                </div>
              );
            }
          })}
        </div>
      </div>

      {isGalleryModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'relative', width: '90%', maxWidth: editMode ? 600 : 1000, height: editMode ? '85vh' : '90vh', display: 'flex', flexDirection: 'column', background: editMode ? '#fff' : 'transparent', borderRadius: editMode ? '16px' : '0' }}>
            {editMode && (
              <button onClick={() => setIsGalleryModalOpen(false)} style={{ position: 'absolute', top: 16, right: 16, background: 'var(--color-surface-hover)', backdropFilter: 'blur(12px)', border: 'none', color: 'var(--color-text-primary)', borderRadius: '50%', width: 40, height: 40, cursor: 'pointer', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={20} />
              </button>
            )}

            {editMode ? (
              <div className="glass-card" style={{ padding: '2.5rem', overflowY: 'auto', border: 'none', boxShadow: 'none' }}>
                <h3 className="section-title" style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Add Activity to Gallery</h3>
                
                <div className="form-group">
                  <label className="form-label">Import from Program</label>
                  <select className="form-input" value={galleryFormData.programId} onChange={(e) => {
                    const p = programs.find(x => x._id === e.target.value);
                    if(p) setGalleryFormData(prev => ({...prev, title: p.title, description: p.description, programId: p._id}));
                    else setGalleryFormData(prev => ({...prev, programId: e.target.value}));
                  }}>
                    <option value="">-- Start Fresh --</option>
                    {programs.map(p => <option key={p._id} value={p._id}>{p.title} ({p.status})</option>)}
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Title</label>
                  <input type="text" className="form-input" placeholder="e.g., Beach Cleanup 2026" value={galleryFormData.title} onChange={e => setGalleryFormData({...galleryFormData, title: e.target.value})} required />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-input" rows="4" placeholder="Share the impact and details..." value={galleryFormData.description} onChange={e => setGalleryFormData({...galleryFormData, description: e.target.value})} required />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Upload Photos (Max 8)</label>
                  <div style={{ border: '2px dashed #CBD5E1', padding: '1.5rem', borderRadius: '12px', textAlign: 'center', background: 'var(--color-surface)', backdropFilter: 'blur(20px)', marginBottom: '1rem', cursor: 'pointer' }} onClick={() => document.getElementById('gallery-upload').click()}>
                    <Plus size={24} style={{ color: 'var(--color-text-muted)', margin: '0 auto 0.5rem' }} />
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Click to browse images</p>
                  </div>
                  <input type="file" id="gallery-upload" multiple accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                  
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    {galleryFormData.images.map((img, idx) => (
                      <div key={idx} style={{ width: 80, height: 80, borderRadius: '8px', backgroundImage: `url(${img})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative', boxShadow: 'var(--shadow-sm)' }}>
                        <button type="button" onClick={() => setGalleryFormData(prev => ({...prev, images: prev.images.filter((_, i) => i !== idx)}))} style={{ position: 'absolute', top: -6, right: -6, background: '#EF4444', color: 'white', border: 'none', borderRadius: '50%', width: 22, height: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={14}/></button>
                      </div>
                    ))}
                  </div>
                </div>

                <button className="btn btn-primary" style={{ width: '100%', padding: '0.85rem' }} onClick={handleSaveGalleryItem}>Save Activity to Gallery</button>
              </div>
            ) : (
              selectedGalleryItem && (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', borderRadius: '16px' }}>
                  {selectedGalleryItem.images && selectedGalleryItem.images.length > 0 ? (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0f172a', padding: '1rem' }}>
                      <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginBottom: '1rem' }}>
                        <button onClick={handleDeletePhoto} style={{ background: 'var(--color-surface)', backdropFilter: 'blur(20px)', border: 'none', color: '#EF4444', borderRadius: '50%', width: 40, height: 40, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.5)', flexShrink: 0 }}>
                          <Trash2 size={18} />
                        </button>
                        <button onClick={() => setIsGalleryModalOpen(false)} style={{ background: 'var(--color-surface)', backdropFilter: 'blur(20px)', border: 'none', color: 'var(--color-text-primary)', cursor: 'pointer', width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', flexShrink: 0 }}>
                          <X size={20} />
                        </button>
                      </div>
                      <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', flex: 1, width: '100%' }}>
                        <img src={selectedGalleryItem.images[activeImageIndex]} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} alt="Activity" />
                      </div>
                    </div>
                  ) : (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#111', color: '#94A3B8' }}>
                      No photos available for this activity
                    </div>
                  )}

                  {selectedGalleryItem.images && selectedGalleryItem.images.length > 1 && (
                    <>
                      <button onClick={() => setActiveImageIndex(prev => prev > 0 ? prev - 1 : selectedGalleryItem.images.length - 1)} style={{ position: 'absolute', left: 24, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', border: '2px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: '50%', width: 56, height: 56, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.8)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.5)'}>
                        <ChevronLeft size={32} />
                      </button>
                      <button onClick={() => setActiveImageIndex(prev => prev < selectedGalleryItem.images.length - 1 ? prev + 1 : 0)} style={{ position: 'absolute', right: 24, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', border: '2px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: '50%', width: 56, height: 56, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.8)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.5)'}>
                        <ChevronRight size={32} />
                      </button>
                    </>
                  )}

            <div style={{ padding: '1.5rem', background: 'var(--color-surface)', backdropFilter: 'blur(20px)', color: 'var(--color-text-primary)', borderTop: '1px solid var(--color-border)', flexShrink: 0 }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 0.5rem', color: '#0f172a' }}>{selectedGalleryItem.title}</h3>
              <p style={{ fontSize: '1rem', lineHeight: 1.6, opacity: 0.9, margin: 0, color: 'var(--color-text-primary)' }}>{selectedGalleryItem.description}</p>
                    
                    {selectedGalleryItem.images && selectedGalleryItem.images.length > 1 && (
                      <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1rem', justifyContent: 'center' }}>
                        {selectedGalleryItem.images.map((_, idx) => (
                          <div key={idx} style={{ width: 10, height: 10, borderRadius: '50%', background: idx === activeImageIndex ? 'var(--color-primary)' : '#CBD5E1', cursor: 'pointer', transition: 'background 0.2s' }} onClick={() => setActiveImageIndex(idx)} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── Management Suite ─── */
const ManagementSuite = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { askConfirm } = useConfirm();
  
  const [programs, setPrograms] = useState([]);
  const [applications, setApplications] = useState([]);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '', rolesNeeded: '' });
  
  const [showEndCampaignModal, setShowEndCampaignModal] = useState(false);
  const [selectedCampaignForEnd, setSelectedCampaignForEnd] = useState(null);
  const [campaignHours, setCampaignHours] = useState('');
  const [attendanceState, setAttendanceState] = useState({});
  const [volunteerApps, setVolunteerApps] = useState([]);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [programToDelete, setProgramToDelete] = useState(null);
  
  useEffect(() => {
    const id = user?._id || user?.gcId;
    if (!id) return;
    fetchPrograms(id);
    fetchApplications(id);
  }, [user]);

  const fetchPrograms = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/programs/ngo/${id}`);
      const data = await res.json();
      setPrograms(data);
    } catch (e) { console.error(e); }
  };

  const fetchApplications = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/applications/ngo/${id}`);
      const data = await res.json();
      setApplications(data);
    } catch (e) { console.error(e); }
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    try {
      const rolesArray = formData.rolesNeeded.split(',').map(r => r.trim()).filter(Boolean);
      const id = user?._id || user?.gcId;
      await fetch('http://localhost:5000/api/programs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ngoId: id,
          title: formData.title,
          description: formData.description,
          rolesNeeded: rolesArray,
          location: formData.location
        })
      });
      setShowBroadcastModal(false);
      setFormData({ title: '', description: '', rolesNeeded: '', location: '' });
      fetchPrograms(id);
      showToast('Program broadcasted!', 'success');
    } catch (e) { console.error(e); showToast('Failed to broadcast.', 'error'); }
  };

  const handleApprove = async (appId) => {
    try {
      await fetch(`http://localhost:5000/api/applications/${appId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Approved' })
      });
      const id = user?._id || user?.gcId;
      fetchApplications(id);
      setShowProfileModal(false);
      showToast('Application approved.', 'success');
    } catch (e) { console.error(e); }
  };

  const handleReject = async (appId) => {
    try {
      await fetch(`http://localhost:5000/api/applications/${appId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Rejected' })
      });
      const id = user?._id || user?.gcId;
      fetchApplications(id);
      setShowProfileModal(false);
      showToast('Application rejected.', 'info');
    } catch (e) { console.error(e); }
  };

  const handleDeleteProgram = (program) => {
    setProgramToDelete(program);
    setShowDeleteConfirmModal(true);
  };

  const confirmDeleteProgram = async () => {
    if (!programToDelete) return;
    try {
      await fetch(`http://localhost:5000/api/programs/${programToDelete._id}`, {
        method: 'DELETE'
      });
      const id = user?._id || user?.gcId;
      fetchPrograms(id);
      setShowDeleteConfirmModal(false);
      setProgramToDelete(null);
      showToast('Program deleted.', 'info');
    } catch (e) { console.error(e); }
  };

  const handleEndCampaign = async (e) => {
    e.preventDefault();
    if (!selectedCampaignForEnd) return;
    try {
      const attendanceData = Object.keys(attendanceState).map(appId => ({
        applicationId: appId,
        volunteerId: attendanceState[appId].volunteerId,
        status: attendanceState[appId].status
      }));

      await fetch(`http://localhost:5000/api/programs/${selectedCampaignForEnd._id}/end`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hours: Number(campaignHours), attendanceData })
      });
      const id = user?._id || user?.gcId;
      fetchPrograms(id);
      setShowEndCampaignModal(false);
      setCampaignHours('');
      setAttendanceState({});
      setSelectedCampaignForEnd(null);
      showToast('Campaign ended successfully.', 'success');
    } catch (e) { console.error(e); }
  };

  const fetchVolunteerApps = async (volId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/applications/volunteer/${volId}`);
      const data = await res.json();
      setVolunteerApps(data);
    } catch (e) { console.error(e); }
  };

  const getStatLabelKey = (label) => {
    if (label === 'Total Volunteers') return 'total_volunteers';
    if (label === 'Active Campaigns') return 'active_campaigns';
    if (label === 'Total Hours Logged') return 'total_hours_logged';
    return label;
  };

  const getStatusTranslation = (status, lang) => {
    if (status === 'Approved' || status === 'Active') return lang === 'KN' ? 'ಸಕ್ರಿಯ' : lang === 'HI' ? 'सक्रिय' : 'Active';
    if (status === 'Pending') return lang === 'KN' ? 'ಬಾಕಿ ಇದೆ' : lang === 'HI' ? 'लंबित' : 'Pending';
    if (status === 'Rejected' || status === 'Inactive') return lang === 'KN' ? 'ನಿಷ್ಕ್ರಿಯ' : lang === 'HI' ? 'निष्क्रिय' : 'Inactive';
    return status;
  };

  const activeVolunteers = applications.filter(a => a.status === 'Approved').length;
  const activeCampaigns = programs.filter(p => p.status === 'Active').length;
  const realHours = programs.filter(p => p.status === 'Completed').reduce((acc, p) => acc + (p.hours || 0), 0);

  return (
    <div className="animate-fade-in space-y-6">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 className="section-title" style={{ marginBottom: 0 }}>Volunteer Management</h2>
        <button className="btn btn-primary" onClick={() => setShowBroadcastModal(true)}><Plus size={16} /> Broadcast Need</button>
      </div>

      <div className="bento-grid">
        {[
          { label: 'Total Volunteers', value: activeVolunteers.toString(), color: 'var(--color-primary)', bg: 'rgba(0, 0, 0, 0.05)' },
          { label: 'Active Campaigns', value: activeCampaigns.toString(), color: 'var(--color-secondary)', bg: 'rgba(0, 0, 0, 0.05)' },
          { label: 'Total Hours Logged', value: realHours.toString(), color: 'var(--color-warning)', bg: 'rgba(0, 0, 0, 0.05)' }
        ].map((s, i) => (
          <div key={i} className="bento-item bento-col-4 stat-card">
            <div className="stat-icon" style={{ background: s.bg }}><span style={{ color: s.color, fontWeight: 800 }}>●</span></div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <h3 className="section-title" style={{ marginTop: '2rem' }}>Broadcasted Programs</h3>
      <div className="bento-grid" style={{ marginBottom: '2rem' }}>
        {programs.length === 0 ? (
          <div className="bento-item bento-col-12" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
            No programs broadcasted yet. Click 'Broadcast Need' to start!
          </div>
        ) : programs.map(program => {
          const pApps = applications.filter(a => a.programId?._id === program._id || a.programId === program._id);
          const approved = pApps.filter(a => a.status === 'Approved').length;
          return (
            <div key={program._id} className="bento-item bento-col-6" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-primary)', margin: 0 }}>{program.title}</h4>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span className={`badge ${program.status === 'Active' ? 'badge-secondary' : program.status === 'Completed' ? 'badge-primary' : 'badge-warning'}`}>{program.status}</span>
                  {program.status === 'Active' && (
                    <button className="btn btn-outline" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }} onClick={() => { 
                      setSelectedCampaignForEnd(program);
                      const approved = applications.filter(a => (a.programId?._id === program._id || a.programId === program._id) && a.status === 'Approved');
                      const initialAttendance = {};
                      approved.forEach(a => {
                        initialAttendance[a._id] = { volunteerId: a.volunteerId?._id || a.volunteerId, status: 'Present' };
                      });
                      setAttendanceState(initialAttendance);
                      setShowEndCampaignModal(true); 
                    }}>
                      End Campaign
                    </button>
                  )}
                  <button className="btn btn-outline" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', color: '#EF4444', borderColor: '#EF4444' }} onClick={() => handleDeleteProgram(program)}>
                    <Trash2 size={12} style={{ display: 'inline', marginRight: '4px' }} /> Delete
                  </button>
                </div>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '1rem', flex: 1 }}>{program.description}</p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                {program.rolesNeeded.map((role, idx) => (
                  <span key={idx} className="badge badge-primary">{role}</span>
                ))}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-primary)', fontWeight: 500, paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
                {pApps.length} Applications ({approved} Approved)
              </div>
            </div>
          )
        })}
      </div>

      <h3 className="section-title">Volunteer Applications</h3>
      <div className="glass-card" style={{ overflow: 'hidden', padding: 0 }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>PROGRAM</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {applications.length === 0 ? (
              <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>No applications yet.</td></tr>
            ) : applications.map((app) => (
              <tr key={app._id} onClick={() => { 
                setSelectedApp(app); 
                setVolunteerApps([]); 
                fetchVolunteerApps(app.volunteerId?._id || app.volunteerId); 
                setShowProfileModal(true); 
              }} style={{ cursor: 'pointer' }}>
                <td style={{ fontWeight: 600 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span>{app.volunteerId?.name || 'Unknown'}</span>
                    {app.volunteerId?.badges && app.volunteerId.badges.length > 0 && (
                      <div style={{ display: 'flex', gap: '0.15rem', alignItems: 'center' }}>
                        {app.volunteerId.badges.map((badge, idx) => {
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
                              style={{ width: 14, height: 14, objectFit: 'contain' }} 
                            />
                          );
                        })}
                      </div>
                    )}
                  </div>
                </td>
                <td>{app.roleApplied}</td>
                <td>{app.programId?.title || 'Unknown'}</td>
                <td><span className={`badge ${app.status === 'Approved' ? 'badge-secondary' : app.status === 'Pending' ? 'badge-warning' : 'badge-primary'}`}>{getStatusTranslation(app.status, 'EN')}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showBroadcastModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-card" style={{ padding: '2rem', width: '100%', maxWidth: 500 }}>
            <h3 className="section-title">Broadcast Need</h3>
            <form onSubmit={handleBroadcast}>
              <div className="form-group">
                <label className="form-label">Program Title</label>
                <input className="form-input" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. Beach Cleanup Drive" />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-input" required rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Describe the program..."></textarea>
              </div>
              <div className="form-group">
                <label className="form-label">Roles Needed (comma separated)</label>
                <input className="form-input" required value={formData.rolesNeeded} onChange={e => setFormData({...formData, rolesNeeded: e.target.value})} placeholder="e.g. Field Coordinator, Content Creator" />
              </div>
              <div className="form-group">
                <label className="form-label">Location</label>
                <input className="form-input" required value={formData.location || ''} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="e.g. Cubbon Park, Bangalore" />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Broadcast</button>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowBroadcastModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEndCampaignModal && selectedCampaignForEnd && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-card" style={{ padding: '2rem', width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 className="section-title">End Campaign & Attendance</h3>
            <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>Enter the total hours volunteered. Mark absent volunteers to ensure accurate credit.</p>
            <form onSubmit={handleEndCampaign}>
              <div className="form-group">
                <label className="form-label">Total Hours</label>
                <input type="number" className="form-input" required min="1" value={campaignHours} onChange={e => setCampaignHours(e.target.value)} placeholder="e.g. 4" />
              </div>
              
              {Object.keys(attendanceState).length > 0 && (
                <div style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
                  <label className="form-label">Volunteer Attendance</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                    {applications.filter(a => (a.programId?._id === selectedCampaignForEnd._id || a.programId === selectedCampaignForEnd._id) && a.status === 'Approved').map(app => (
                      <div key={app._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'var(--color-surface)', backdropFilter: 'blur(20px)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          {app.volunteerId?.profilePhoto ? (
                            <img src={app.volunteerId.profilePhoto} alt="vol" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>
                              {app.volunteerId?.name?.charAt(0) || '?'}
                            </div>
                          )}
                          <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>{app.volunteerId?.name || 'Volunteer'}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button type="button" onClick={() => setAttendanceState(prev => ({ ...prev, [app._id]: { ...prev[app._id], status: 'Present' } }))} style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem', borderRadius: '20px', border: 'none', cursor: 'pointer', background: attendanceState[app._id]?.status === 'Present' ? '#10B981' : '#E2E8F0', color: attendanceState[app._id]?.status === 'Present' ? 'white' : '#64748B', fontWeight: 600, transition: 'all 0.2s' }}>Present</button>
                          <button type="button" onClick={() => setAttendanceState(prev => ({ ...prev, [app._id]: { ...prev[app._id], status: 'Absent' } }))} style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem', borderRadius: '20px', border: 'none', cursor: 'pointer', background: attendanceState[app._id]?.status === 'Absent' ? '#EF4444' : '#E2E8F0', color: attendanceState[app._id]?.status === 'Absent' ? 'white' : '#64748B', fontWeight: 600, transition: 'all 0.2s' }}>Absent</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Submit & End</button>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowEndCampaignModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteConfirmModal && programToDelete && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-card" style={{ padding: '2rem', width: '100%', maxWidth: 400 }}>
            <h3 className="section-title" style={{ color: '#EF4444' }}>Delete Program</h3>
            <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Are you sure you want to delete <strong>{programToDelete.title}</strong>? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn btn-outline" style={{ flex: 1, color: '#fff', background: '#EF4444', borderColor: '#EF4444' }} onClick={confirmDeleteProgram}>Delete</button>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowDeleteConfirmModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showProfileModal && selectedApp && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-card" style={{ padding: '2rem', width: '100%', maxWidth: 500 }}>
            <h3 className="section-title">Volunteer Profile</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#E2E8F0', overflow: 'hidden' }}>
                {selectedApp.volunteerId?.profilePhoto ? (
                  <img src={selectedApp.volunteerId.profilePhoto} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
                    <Users size={32} />
                  </div>
                )}
              </div>
              <div>
                <h4 style={{ fontSize: '1.25rem', margin: '0 0 0.25rem 0', color: 'var(--color-primary)' }}>{selectedApp.volunteerId?.name}</h4>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>{selectedApp.volunteerId?.location || 'Unknown Location'} • {selectedApp.volunteerId?.age ? selectedApp.volunteerId.age + ' yrs' : 'Age Unknown'}</p>
              </div>
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <h5 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>Applied For</h5>
              <p style={{ margin: 0, fontWeight: 600 }}>{selectedApp.programId?.title} - {selectedApp.roleApplied}</p>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <h5 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>Interests</h5>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {(selectedApp.volunteerId?.interests || []).map((interest, idx) => (
                  <span key={idx} className="badge badge-primary">{interest}</span>
                ))}
                {(!selectedApp.volunteerId?.interests || selectedApp.volunteerId?.interests.length === 0) && (
                  <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>No specific interests listed.</span>
                )}
              </div>
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <h5 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>Earned Badges</h5>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {selectedApp.volunteerId?.badges && selectedApp.volunteerId.badges.length > 0 ? (
                  selectedApp.volunteerId.badges.map((badge, idx) => {
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
                      <span key={idx} style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                        background: 'var(--color-surface)', backdropFilter: 'blur(20px)', border: `1px solid ${colorMap[badge.level]}44`,
                        color: colorMap[badge.level], padding: '0.25rem 0.5rem',
                        borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', fontWeight: 700
                      }}>
                        <img src={imgMap[badge.level] || '/badges/bronze.png'} alt={badge.name} style={{ width: 14, height: 14, objectFit: 'contain' }} />
                        {badge.name} ({badge.level})
                      </span>
                    );
                  })
                ) : (
                  <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>No badges earned yet.</span>
                )}
              </div>
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <h5 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>Volunteer Impact</h5>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ background: 'var(--color-border)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-primary)' }}>{volunteerApps.filter(a => a.status === 'Approved' && a.programId?.status === 'Completed').reduce((acc, a) => acc + (a.programId?.hours || 0), 0)}</span> <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Hours</span>
                </div>
                <div style={{ background: 'var(--color-border)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-primary)' }}>{volunteerApps.filter(a => a.status === 'Approved' && a.programId?.status === 'Completed').length}</span> <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Events</span>
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              {selectedApp.status === 'Pending' && (
                <>
                  <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => handleApprove(selectedApp._id)}>Approve</button>
                  <button className="btn btn-outline" style={{ flex: 1, borderColor: '#EF4444', color: '#EF4444' }} onClick={() => handleReject(selectedApp._id)}>Reject</button>
                </>
              )}
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowProfileModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── Offline Event Logger ─── */
const OfflineEventLogger = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { askConfirm } = useConfirm();
  const [events, setEvents] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [formData, setFormData] = useState({ _id: null, title: '', notes: '' });
  const [pendingActions, setPendingActions] = useState([]);

  const fetchLogs = async () => {
    if (!user?.gcId) return;
    try {
      const res = await fetch(`http://localhost:5000/api/logs/ngo/${user.gcId}`);
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      setEvents(data);
      localStorage.setItem('gladiconnect_cached_logs', JSON.stringify(data));
    } catch (e) {
      const stored = localStorage.getItem('gladiconnect_cached_logs');
      if (stored) setEvents(JSON.parse(stored));
    }
  };

  useEffect(() => {
    fetchLogs();
    const storedPending = localStorage.getItem('gladiconnect_pending_actions');
    if (storedPending) setPendingActions(JSON.parse(storedPending));

    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user?.gcId) return;

    const logData = { ngoId: user.gcId, title: formData.title, notes: formData.notes, date: new Date().toISOString() };
    
    if (formData._id && !formData._id.toString().startsWith('temp-')) {
      if (isOnline) {
        try {
          await fetch(`http://localhost:5000/api/logs/${formData._id}`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(logData)
          });
          fetchLogs();
        } catch (err) {
          queueAction({ type: 'UPDATE', id: formData._id, data: logData });
        }
      } else {
        queueAction({ type: 'UPDATE', id: formData._id, data: logData });
      }
    } else {
      if (isOnline) {
        try {
          await fetch('http://localhost:5000/api/logs', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(logData)
          });
          fetchLogs();
        } catch (err) {
          queueAction({ type: 'CREATE', id: `temp-${Date.now()}`, data: logData });
        }
      } else {
        queueAction({ type: 'CREATE', id: `temp-${Date.now()}`, data: logData });
      }
    }
    setFormData({ _id: null, title: '', notes: '' });
  };

  const queueAction = (action) => {
    const updatedActions = [...pendingActions, action];
    setPendingActions(updatedActions);
    localStorage.setItem('gladiconnect_pending_actions', JSON.stringify(updatedActions));
    
    let updatedEvents = [...events];
    if (action.type === 'CREATE') {
      updatedEvents.unshift({ _id: action.id, ...action.data });
    } else if (action.type === 'UPDATE') {
      updatedEvents = updatedEvents.map(e => e._id === action.id ? { ...e, ...action.data } : e);
    } else if (action.type === 'DELETE') {
      updatedEvents = updatedEvents.filter(e => e._id !== action.id);
    }
    setEvents(updatedEvents);
    localStorage.setItem('gladiconnect_cached_logs', JSON.stringify(updatedEvents));
  };

  const handleDelete = async (id) => {
    if (!(await askConfirm('Delete this log?'))) return;
    if (id.toString().startsWith('temp-')) {
      const updatedActions = pendingActions.filter(a => a.id !== id);
      setPendingActions(updatedActions);
      localStorage.setItem('gladiconnect_pending_actions', JSON.stringify(updatedActions));
      setEvents(events.filter(e => e._id !== id));
      localStorage.setItem('gladiconnect_cached_logs', JSON.stringify(events.filter(e => e._id !== id)));
      return;
    }

    if (isOnline) {
      try {
        await fetch(`http://localhost:5000/api/logs/${id}`, { method: 'DELETE' });
        fetchLogs();
      } catch (err) {
        queueAction({ type: 'DELETE', id });
      }
    } else {
      queueAction({ type: 'DELETE', id });
    }
  };

  const handleEdit = (log) => {
    setFormData({ _id: log._id, title: log.title, notes: log.notes });
  };

  const handleSync = async () => {
    if (!isOnline) return;
    let successCount = 0;
    
    for (const action of pendingActions) {
      try {
        if (action.type === 'CREATE') {
          await fetch('http://localhost:5000/api/logs', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(action.data)
          });
        } else if (action.type === 'UPDATE') {
          await fetch(`http://localhost:5000/api/logs/${action.id}`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(action.data)
          });
        } else if (action.type === 'DELETE') {
          await fetch(`http://localhost:5000/api/logs/${action.id}`, { method: 'DELETE' });
        }
        successCount++;
      } catch (e) {
        console.error('Failed to sync action', action, e);
      }
    }
    
    setPendingActions([]);
    localStorage.removeItem('gladiconnect_pending_actions');
    fetchLogs();
    if (successCount > 0) showToast(`Successfully synced ${successCount} items.`, 'success');
  };

  const unsyncedCount = pendingActions.length;

  return (
    <div className="animate-fade-in grid grid-md-2">
      {/* Form */}
      <div className="glass-card" style={{ padding: '1.5rem', alignSelf: 'start' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 className="section-title" style={{ marginBottom: 0 }}>{formData._id ? 'Edit Event Log' : 'Log New Event'}</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            {isOnline ? <Wifi size={14} style={{ color: 'var(--color-secondary)' }} /> : <WifiOff size={14} style={{ color: 'var(--color-warning)' }} />}
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: isOnline ? 'var(--color-secondary)' : 'var(--color-warning)' }}>
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">Event Title</label>
            <input type="text" className="form-input" placeholder="Program Title" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Notes / Description</label>
            <textarea className="form-input" rows="4" placeholder="Enter notes here..." required value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}><Save size={16} /> {formData._id ? 'Update Log' : 'Save Event'}</button>
            {formData._id && (
              <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setFormData({ _id: null, title: '', notes: '' })}>Cancel</button>
            )}
          </div>
        </form>
      </div>

      {/* Event List */}
      <div className="glass-card" style={{ padding: '1.5rem', alignSelf: 'start' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 className="section-title" style={{ marginBottom: 0 }}>Event Logs</h3>
          {isOnline && unsyncedCount > 0 && (
            <button onClick={handleSync} className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.9rem' }}>
              Sync items ({unsyncedCount})
            </button>
          )}
        </div>
        {events.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '3rem 0', fontSize: '0.9rem' }}>No event logs yet.</p>
        ) : (
          <div className="space-y-4" style={{ maxHeight: 500, overflowY: 'auto', paddingRight: '0.5rem' }}>
            {events.map(ev => {
              const isPending = pendingActions.some(a => a.id === ev._id);
              return (
                <div key={ev._id} className="list-item" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'flex-start', padding: '1rem' }}>
                  <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <p style={{ fontWeight: 700, color: 'var(--color-text-primary)', fontSize: '1.05rem', margin: 0 }}>{ev.title}</p>
                      <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem', marginBottom: 0 }}>
                        {new Date(ev.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span className={`badge ${isPending ? 'badge-warning' : 'badge-secondary'}`}>
                        {isPending ? 'Pending Sync' : 'Synced'}
                      </span>
                      <button onClick={() => handleEdit(ev)} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: '4px' }} title="Edit"><Edit3 size={16} /></button>
                      <button onClick={() => handleDelete(ev._id)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '4px' }} title="Delete"><Trash2 size={16} /></button>
                    </div>
                  </div>
                  {ev.notes && (
                    <div style={{ fontSize: '0.9rem', color: 'var(--color-text-primary)', width: '100%', whiteSpace: 'pre-wrap', background: 'rgba(0,0,0,0.02)', padding: '0.75rem', borderRadius: '8px', borderLeft: '3px solid var(--color-primary)' }}>
                      {ev.notes}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

/* ─── Finance Suite ─── */
const FinanceSuite = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { askConfirm } = useConfirm();
  
  const [activeSubTab, setActiveSubTab] = useState('expenses'); // expenses, donations
  const [campaigns, setCampaigns] = useState([]);
  const [expenses, setExpenses] = useState([]); // This stores the complex expense reports
  const [donations, setDonations] = useState([]);
  
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseForm, setExpenseForm] = useState({ title: '', campaignId: '', rows: [{ particulars: '', expense: '' }], bills: [] });

  useEffect(() => {
    if (user?.gcId) {
      fetchFinanceData();
    }
  }, [user]);

  const fetchFinanceData = async () => {
    try {
      const [campRes, expRes, donRes] = await Promise.all([
        fetch(`http://localhost:5000/api/finance/campaigns/${user.gcId}`),
        fetch(`http://localhost:5000/api/finance/reports/${user.gcId}`), // We use the reports endpoint for our new expense format
        fetch(`http://localhost:5000/api/finance/donations/${user.gcId}`)
      ]);
      setCampaigns(await campRes.json());
      setExpenses(await expRes.json());
      setDonations(await donRes.json());
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateExpense = async (e) => {
    e.preventDefault();
    try {
      const isEditing = !!expenseForm._id;
      const url = isEditing ? `http://localhost:5000/api/finance/reports/${expenseForm._id}` : 'http://localhost:5000/api/finance/reports';
      const method = isEditing ? 'PUT' : 'POST';
      
      const totalAmount = expenseForm.rows.reduce((acc, row) => acc + Number(row.expense || 0), 0);
      
      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...expenseForm, totalAmount, ngoId: user.gcId })
      });
      if (res.ok) {
        setShowExpenseModal(false);
        setExpenseForm({ title: '', campaignId: '', rows: [{ particulars: '', expense: '' }], bills: [] });
        fetchFinanceData();
        showToast(`Expense log ${isEditing ? 'updated' : 'added'} successfully!`, 'success');
      }
    } catch (err) {}
  };

  const handleEditExpense = (report) => {
    setExpenseForm({
      _id: report._id,
      title: report.title,
      campaignId: report.campaignId ? report.campaignId._id : '',
      rows: report.rows,
      bills: report.bills || []
    });
    setShowExpenseModal(true);
  };

  const handleDeleteExpense = async (id) => {
    if (!(await askConfirm('Are you sure you want to delete this expense report?'))) return;
    try {
      const res = await fetch(`http://localhost:5000/api/finance/reports/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        showToast('Expense report deleted successfully!', 'success');
        fetchFinanceData();
      }
    } catch (err) {}
  };

  const handleImportCampaignDetails = () => {
    const selected = campaigns.find(c => c._id === expenseForm.campaignId);
    if (selected) {
      setExpenseForm(prev => ({
        ...prev,
        title: `${selected.title} Expenses`
      }));
      showToast('Campaign details imported successfully!', 'success');
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const promises = files.map(file => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve({
          url: reader.result,
          name: file.name,
          fileType: file.type
        });
        reader.onerror = error => reject(error);
      });
    });
    Promise.all(promises).then(fileData => {
      setExpenseForm(prev => ({ ...prev, bills: [...prev.bills, ...fileData] }));
    });
  };

  return (
    <div className="animate-fade-in glass-card" style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 className="text-gradient-secondary" style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
          <IndianRupee size={24} /> Finance Suite
        </h2>
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
          <button onClick={() => setActiveSubTab('expenses')} className={`btn ${activeSubTab === 'expenses' ? 'btn-primary' : 'btn-outline'}`}>Expenses</button>
          <button onClick={() => setActiveSubTab('donations')} className={`btn ${activeSubTab === 'donations' ? 'btn-primary' : 'btn-outline'}`}>Donations</button>
        </div>
      </div>

      {activeSubTab === 'expenses' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <button onClick={() => setShowExpenseModal(true)} className="btn btn-secondary"><Plus size={16}/> Add Expense Log</button>
            <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>
              Grand Total Till Now: ₹{expenses.reduce((acc, r) => acc + r.totalAmount, 0)}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {expenses.map(r => (
              <div key={r._id} className="glass-card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.2rem' }}>{r.title}</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: '0.25rem 0 0 0' }}>{new Date(r.date).toLocaleDateString()}</p>
                    {r.campaignId && <p style={{ fontSize: '0.8rem', color: 'var(--color-primary)', margin: '0.25rem 0 0 0', fontWeight: 500 }}>Campaign: {r.campaignId.title}</p>}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#EF4444' }}>
                      Total: ₹{r.totalAmount}
                    </div>
                  </div>
                </div>
                
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'left' }}>
                      <th style={{ padding: '0.5rem', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>Particulars</th>
                      <th style={{ padding: '0.5rem', color: 'var(--color-text-secondary)', fontSize: '0.9rem', textAlign: 'right' }}>Expense (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {r.rows.map((row, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '0.5rem', fontSize: '0.9rem' }}>{row.particulars}</td>
                        <td style={{ padding: '0.5rem', fontSize: '0.9rem', textAlign: 'right' }}>₹{row.expense}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {r.bills && r.bills.length > 0 && (
                  <div>
                    <h5 style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>Uploaded Bills ({r.bills.length})</h5>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {r.bills.map((bill, bIdx) => {
                        const isObject = typeof bill === 'object' && bill !== null;
                        const url = isObject ? bill.url : bill;
                        const name = isObject ? bill.name : `Attached Bill ${bIdx + 1}`;
                        const type = isObject ? bill.fileType : (typeof url === 'string' && url.startsWith('data:application/pdf') ? 'application/pdf' : 'image/jpeg');
                        
                        return (
                          <a key={bIdx} href={url} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', border: '1px solid var(--color-border)', borderRadius: '6px', textDecoration: 'none', color: 'var(--color-text-primary)', background: 'var(--color-surface)', backdropFilter: 'blur(20px)' }}>
                            {type.includes('pdf') ? <FileText size={20} color="#EF4444" /> : <ImageIcon size={20} color="#3B82F6" />}
                            <span style={{ fontSize: '0.85rem', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                  <button onClick={() => handleEditExpense(r)} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'none', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 500, padding: '0.3rem 0.6rem', borderRadius: '4px', transition: 'all 0.2s' }} onMouseOver={e => {e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.color = '#334155'}} onMouseOut={e => {e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748B'}}>
                    <Edit3 size={14} /> Edit Log
                  </button>
                  <button onClick={() => handleDeleteExpense(r._id)} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'none', border: 'none', color: '#EF4444', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 500, padding: '0.3rem 0.6rem', borderRadius: '4px', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#FEE2E2'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                    <Trash2 size={14} /> Delete Log
                  </button>
                </div>
              </div>
            ))}
            {expenses.length === 0 && <p style={{ color: 'var(--color-text-muted)' }}>No expense logs created yet.</p>}
          </div>
        </div>
      )}

      {activeSubTab === 'donations' && (
        <div>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>Recent Donations Received</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {donations.map(d => (
              <div key={d._id} className="glass-card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: 0 }}>{d.donorName || 'Anonymous'}</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: '0.25rem 0 0 0' }}>{new Date(d.date).toLocaleDateString()}</p>
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#10B981' }}>+ ₹{d.amount}</div>
              </div>
            ))}
            {donations.length === 0 && <p style={{ color: 'var(--color-text-muted)' }}>No donations tracked yet.</p>}
          </div>
        </div>
      )}

      {/* Expense Modal (Using the complex report format) */}
      {showExpenseModal && (
        <div className="modal-overlay" onClick={() => setShowExpenseModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem' }}>
            <div className="modal-header">
              <h2>{expenseForm._id ? 'Edit Expense Log' : 'Add Expense Log'}</h2>
              <button className="icon-btn" onClick={() => {
                setShowExpenseModal(false);
                setExpenseForm({ title: '', campaignId: '', rows: [{ particulars: '', expense: '' }], bills: [] });
              }}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateExpense} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label>Report Title</label>
                <input type="text" className="form-input" required value={expenseForm.title} onChange={e => setExpenseForm({...expenseForm, title: e.target.value})} />
              </div>
              
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                  <label style={{ margin: 0 }}>Related Campaign (Optional)</label>
                  {expenseForm.campaignId && (
                    <button type="button" onClick={handleImportCampaignDetails} className="btn btn-outline" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>
                      Import Details
                    </button>
                  )}
                </div>
                <select className="form-input" value={expenseForm.campaignId} onChange={e => setExpenseForm({...expenseForm, campaignId: e.target.value})}>
                  <option value="">General / No Campaign</option>
                  {campaigns.map(c => <option key={c._id} value={c._id}>{c.title} {c.status === 'Completed' ? '(Ended)' : '(Active)'}</option>)}
                </select>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label style={{ margin: 0 }}>Particulars & Expenses</label>
                  <button type="button" onClick={() => setExpenseForm({...expenseForm, rows: [...expenseForm.rows, { particulars: '', expense: '' }]})} className="btn btn-outline" style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem' }}><Plus size={14}/> Add Row</button>
                </div>
                
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--color-surface-hover)', backdropFilter: 'blur(20px)' }}>
                      <th style={{ padding: '0.5rem', border: '1px solid var(--color-border)', textAlign: 'left', width: '60%' }}>Particulars</th>
                      <th style={{ padding: '0.5rem', border: '1px solid var(--color-border)', textAlign: 'left', width: '30%' }}>Expense (₹)</th>
                      <th style={{ padding: '0.5rem', border: '1px solid var(--color-border)', textAlign: 'center', width: '10%' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenseForm.rows.map((row, idx) => (
                      <tr key={idx}>
                        <td style={{ padding: '0.5rem', border: '1px solid var(--color-border)' }}>
                          <input type="text" required value={row.particulars} style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none' }} placeholder="E.g., Event Setup" onChange={(e) => {
                            const newRows = [...expenseForm.rows];
                            newRows[idx].particulars = e.target.value;
                            setExpenseForm({...expenseForm, rows: newRows});
                          }} />
                        </td>
                        <td style={{ padding: '0.5rem', border: '1px solid var(--color-border)' }}>
                          <input type="number" required value={row.expense} style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none' }} placeholder="Amount" onChange={(e) => {
                            const newRows = [...expenseForm.rows];
                            newRows[idx].expense = e.target.value;
                            setExpenseForm({...expenseForm, rows: newRows});
                          }} />
                        </td>
                        <td style={{ padding: '0.5rem', border: '1px solid var(--color-border)', textAlign: 'center' }}>
                          <button type="button" disabled={expenseForm.rows.length === 1} onClick={() => {
                            const newRows = expenseForm.rows.filter((_, rIdx) => rIdx !== idx);
                            setExpenseForm({...expenseForm, rows: newRows});
                          }} style={{ background: 'none', border: 'none', color: expenseForm.rows.length === 1 ? '#CBD5E1' : '#EF4444', cursor: expenseForm.rows.length === 1 ? 'not-allowed' : 'pointer' }}>
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td style={{ padding: '0.5rem', border: '1px solid var(--color-border)', fontWeight: 'bold', textAlign: 'right' }}>Grand Total:</td>
                      <td colSpan="2" style={{ padding: '0.5rem', border: '1px solid var(--color-border)', fontWeight: 'bold' }}>
                        ₹{expenseForm.rows.reduce((acc, row) => acc + Number(row.expense || 0), 0)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="form-group">
                <label>Upload Bills (Images/PDFs)</label>
                <input type="file" multiple accept="image/*,application/pdf" className="form-input" onChange={handleFileUpload} />
                {expenseForm.bills.length > 0 && (
                  <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    {expenseForm.bills.map((b, i) => {
                      const isObject = typeof b === 'object' && b !== null;
                      const name = isObject ? b.name : `Attached Bill ${i + 1}`;
                      const type = isObject ? b.fileType : (typeof b === 'string' && b.startsWith('data:application/pdf') ? 'application/pdf' : 'image/jpeg');
                      return (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--color-text-secondary)', background: 'var(--color-surface)', backdropFilter: 'blur(20px)', padding: '0.4rem 0.6rem', borderRadius: '4px' }}>
                          {type.includes('pdf') ? <FileText size={16} color="#EF4444"/> : <ImageIcon size={16} color="#3B82F6"/>}
                          <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
                          <button type="button" onClick={() => setExpenseForm(prev => ({...prev, bills: prev.bills.filter((_, idx) => idx !== i)}))} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: 0 }}>
                            <X size={14} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Submit Report</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── NGO Dashboard ─── */
const NgoDashboard = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { askConfirm } = useConfirm();
  const [activeTab, setActiveTab] = useState('impact');
  const [totalUnread, setTotalUnread] = useState(0);
  const [pendingReports, setPendingReports] = useState([]);
  const [showChecklist, setShowChecklist] = useState(true);

  useEffect(() => {
    if (!user?.gcId) return;
    
    const fetchTotalUnread = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/chat/unread-counts?receiverId=${user.gcId}`);
        const data = await response.json();
        const total = Object.values(data).reduce((acc, count) => acc + (typeof count === 'number' ? count : 0), 0);
        setTotalUnread(total);
      } catch (error) {}
    };

    const fetchPendingReports = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/finance/campaigns/${user.gcId}/pending-reports`);
        if (res.ok) {
          const data = await res.json();
          setPendingReports(data);
        }
      } catch (error) {}
    };

    fetchTotalUnread();
    fetchPendingReports();
    const interval = setInterval(fetchTotalUnread, 3000);
    return () => clearInterval(interval);
  }, [user?.gcId]);

  const handleGeneratePendingReport = async (campaignId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/finance/campaigns/${campaignId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportUrl: 'finance_report_' + Date.now() + '.pdf' })
      });
      if (res.ok) {
        showToast('Finance Report Generated Successfully!', 'success');
        setPendingReports(prev => prev.filter(c => c._id !== campaignId));
      }
    } catch (err) {}
  };

  const tabs = [
    { id: 'impact', label: 'Impact Profile', icon: <Camera size={16} /> },
    { id: 'management', label: 'Management', icon: <Users size={16} /> },
    { id: 'offline', label: 'Offline Logger', icon: <WifiOff size={16} /> },
    { id: 'finance', label: 'Finance', icon: <IndianRupee size={16} /> },
    { id: 'collab', label: 'Collab Hub', icon: <MessageSquare size={16} />, badge: totalUnread },
  ];

  return (
    <div>
      <div className="page-header">
        <h1 className="text-gradient">NGO Dashboard</h1>
        <p>Welcome back, <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{user?.name}</span></p>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', overflowX: 'auto', paddingTop: '0.5rem', paddingRight: '0.5rem', paddingBottom: '0.5rem' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`tab-btn ${activeTab === tab.id ? 'tab-btn-active' : 'tab-btn-inactive'}`}
            style={{ position: 'relative' }}
          >
            {tab.icon}
            {tab.label}
            {tab.badge > 0 && (
              <span style={{
                position: 'absolute', top: '-6px', right: '-6px',
                background: '#EF4444', color: 'white', fontSize: '0.7rem',
                fontWeight: 'bold', minWidth: '20px', height: '20px',
                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 4px rgba(239, 68, 68, 0.3)', border: '2px solid #F8FAFC',
                padding: '0 4px'
              }}>
                {tab.badge > 99 ? '99+' : tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      <div style={{ minHeight: 400 }}>
        {activeTab === 'impact' && <ImpactProfile />}
        {activeTab === 'management' && <ManagementSuite />}
        {activeTab === 'offline' && <OfflineEventLogger />}
        {activeTab === 'finance' && <FinanceSuite />}
        {activeTab === 'collab' && <CollabHub />}
      </div>

      {/* Floating Checklist Notification */}
      {showChecklist && pendingReports.length > 0 && (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', background: 'white', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)', width: '320px', padding: '1.5rem', zIndex: 1000, borderLeft: '4px solid var(--color-warning)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <IndianRupee size={18} style={{ color: 'var(--color-warning)' }} /> Pending Tasks
            </h3>
            <button className="icon-btn" onClick={() => setShowChecklist(false)} style={{ margin: '-0.5rem -0.5rem 0 0' }}><X size={16} /></button>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>You have ended campaigns that need a finance report for transparency.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {pendingReports.map(c => (
              <div key={c._id} style={{ background: 'var(--color-surface)', backdropFilter: 'blur(20px)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 500 }}>{c.title}</span>
                <button className="btn btn-outline" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }} onClick={() => handleGeneratePendingReport(c._id)}>Generate</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NgoDashboard;
