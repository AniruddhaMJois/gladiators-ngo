import React, { useState, useEffect, useRef } from 'react';
import { Search, Send, Building2, User, Loader2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from 'react-router-dom';

const CollabHub = () => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadCounts, setUnreadCounts] = useState({});
  const location = useLocation();
  
  const messagesEndRef = useRef(null);

  // Fetch contacts (NGOs)
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/chat/contacts/${user.gcId}`);
        const data = await response.json();
        setContacts(data);
        setLoadingContacts(false);
      } catch (error) {
        console.error('Error fetching contacts:', error);
        setLoadingContacts(false);
      }
    };
    if (user?.gcId) {
      fetchContacts();
    }
  }, [user?.gcId]);

  // Handle navigation from NGO profile (direct connect)
  useEffect(() => {
    if (location.state?.contactId && contacts.length > 0) {
      const contactToSelect = contacts.find(c => c._id === location.state.contactId);
      if (contactToSelect) {
        setSelectedContact(contactToSelect);
        // Clear state so we don't re-select it on subsequent renders
        window.history.replaceState({}, document.title);
      } else {
        // If the contact isn't in the list (e.g., a new company chatting), we might need to fetch them
        // But the new backend logic includes all contacted users, so it should be there unless it's a completely new user who is not an NGO.
        // If they navigated from NGO profile, the target is an NGO, so it will be in the list.
        if (location.state.contactName) {
          setSelectedContact({ _id: location.state.contactId, name: location.state.contactName });
          window.history.replaceState({}, document.title);
        }
      }
    }
  }, [contacts, location.state]);

  // Fetch messages between current user and selected contact
  const fetchMessages = async (contactId, showLoader = false) => {
    if (!contactId) return;
    if (showLoader) setLoadingMessages(true);
    
    try {
      const response = await fetch(`http://localhost:5000/api/chat/messages?senderId=${user.gcId}&receiverId=${contactId}`);
      const data = await response.json();
      setMessages(data);
      if (showLoader) setLoadingMessages(false);
    } catch (error) {
      console.error('Error fetching messages:', error);
      if (showLoader) setLoadingMessages(false);
    }
  };

  const fetchUnreadCounts = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/chat/unread-counts?receiverId=${user.gcId}`);
      const data = await response.json();
      setUnreadCounts(data);
    } catch (error) {}
  };

  useEffect(() => {
    if (selectedContact) {
      fetchMessages(selectedContact._id, true);
      // Mark messages as read
      fetch('http://localhost:5000/api/chat/mark-read', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderId: selectedContact._id, receiverId: user.gcId })
      }).then(() => fetchUnreadCounts());
    }
  }, [selectedContact, user.gcId]);

  // Polling for new messages & unread counts
  useEffect(() => {
    fetchUnreadCounts();
    const interval = setInterval(() => {
      fetchUnreadCounts();
      if (selectedContact) {
        fetchMessages(selectedContact._id, false);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [selectedContact, user.gcId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedContact) return;

    const messageContent = newMessage.trim();
    setNewMessage(''); // optimistic clear

    try {
      const response = await fetch('http://localhost:5000/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: user.gcId,
          receiverId: selectedContact._id,
          content: messageContent
        })
      });
      
      const savedMessage = await response.json();
      // Optimistic update
      setMessages(prev => [...prev, savedMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.domain?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{
      display: 'flex', 
      height: 'calc(100vh - 200px)', 
      minHeight: '600px',
      background: 'var(--color-surface)', backdropFilter: 'blur(20px)',
      borderRadius: '1rem',
      overflow: 'hidden',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
      border: '1px solid var(--color-border)'
    }}>
      
      {/* Sidebar: Contacts List */}
      <div style={{
        width: '320px',
        borderRight: '1px solid #E2E8F0',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--color-surface)', backdropFilter: 'blur(20px)'
      }}>
        <div style={{ padding: '1.25rem', background: 'var(--color-surface)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--color-border)' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-text-primary)', margin: '0 0 1rem 0' }}>NGO Collab Hub</h2>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search NGOs..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%', padding: '0.6rem 1rem 0.6rem 2.25rem',
                border: '1px solid #CBD5E1', borderRadius: '2rem',
                fontSize: '0.85rem', outline: 'none'
              }}
            />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loadingContacts ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
              <Loader2 className="animate-spin" style={{ color: '#4A6741' }} />
            </div>
          ) : filteredContacts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
              No NGOs found.
            </div>
          ) : (
            filteredContacts.map(contact => (
              <div 
                key={contact._id}
                onClick={() => setSelectedContact(contact)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '1rem 1.25rem', borderBottom: '1px solid #F1F5F9',
                  cursor: 'pointer',
                  background: selectedContact?._id === contact._id ? '#E8F5E9' : 'transparent',
                  transition: 'background 0.2s ease'
                }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: '50%', background: '#E2E8F0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  overflow: 'hidden'
                }}>
                  {contact.profilePhoto ? (
                    <img src={contact.profilePhoto} alt={contact.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <Building2 size={20} style={{ color: 'var(--color-text-muted)' }} />
                  )}
                </div>
                <div style={{ overflow: 'hidden', flex: 1 }}>
                  <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {contact.name}
                  </h4>
                  <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {contact.domain} Focus
                  </p>
                </div>
                {unreadCounts[contact._id] > 0 && (
                  <div style={{
                    background: '#EF4444', color: 'white', borderRadius: '50%',
                    minWidth: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.7rem', fontWeight: 'bold', padding: '0 4px',
                    boxShadow: '0 2px 4px rgba(239, 68, 68, 0.3)'
                  }}>
                    {unreadCounts[contact._id] > 99 ? '99+' : unreadCounts[contact._id]}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#F0F2F5', position: 'relative' }}>
        {/* WhatsApp-style decorative background pattern */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.05, pointerEvents: 'none',
          backgroundImage: 'radial-gradient(#4A6741 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }} />

        {selectedContact ? (
          <>
            {/* Chat Header */}
            <div style={{
              padding: '1rem 1.5rem', background: 'var(--color-surface)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--color-border)',
              display: 'flex', alignItems: 'center', gap: '1rem', zIndex: 10
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%', background: '#E2E8F0',
                display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
              }}>
                {selectedContact.profilePhoto ? (
                  <img src={selectedContact.profilePhoto} alt={selectedContact.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <Building2 size={20} style={{ color: 'var(--color-text-muted)' }} />
                )}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>{selectedContact.name}</h3>
                <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                  {selectedContact.headquarters} • {selectedContact.domain}
                </p>
              </div>
            </div>

            {/* Chat Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', zIndex: 10 }}>
              {loadingMessages ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                  <Loader2 className="animate-spin" style={{ color: '#4A6741' }} />
                </div>
              ) : messages.length === 0 ? (
                <div style={{ textAlign: 'center', margin: 'auto', background: 'rgba(255,255,255,0.8)', padding: '0.75rem 1.25rem', borderRadius: '1rem', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                  No messages yet. Start the conversation!
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isMine = msg.senderId === user.gcId;
                  const time = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  
                  return (
                    <div key={msg._id || index} style={{
                      alignSelf: isMine ? 'flex-end' : 'flex-start',
                      maxWidth: '70%',
                      background: isMine ? '#DCF8C6' : '#FFFFFF',
                      padding: '0.65rem 1rem',
                      borderRadius: isMine ? '1rem 1rem 0 1rem' : '1rem 1rem 1rem 0',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                      position: 'relative'
                    }}>
                      <div style={{ fontSize: '0.95rem', color: 'var(--color-text-primary)', wordBreak: 'break-word', lineHeight: 1.4 }}>
                        {msg.content}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', textAlign: 'right', marginTop: '0.25rem' }}>
                        {time}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <div style={{ padding: '1rem 1.5rem', background: '#F0F2F5', zIndex: 10 }}>
              <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  style={{
                    flex: 1, padding: '0.85rem 1.25rem', border: 'none', borderRadius: '2rem',
                    fontSize: '0.95rem', outline: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}
                />
                <button 
                  type="submit"
                  disabled={!newMessage.trim()}
                  style={{
                    width: 44, height: 44, borderRadius: '50%', background: newMessage.trim() ? '#2E7D32' : '#CBD5E1',
                    color: '#FFFFFF', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: newMessage.trim() ? 'pointer' : 'not-allowed', transition: 'background 0.2s'
                  }}
                >
                  <Send size={18} style={{ marginLeft: '-2px' }} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', zIndex: 10 }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Building2 size={36} style={{ color: '#94A3B8' }} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-secondary)', margin: '0 0 0.5rem 0' }}>GladiConnect Web</h3>
            <p style={{ fontSize: '0.9rem', maxWidth: 300, textAlign: 'center', lineHeight: 1.5 }}>
              Select an NGO from the left sidebar to start collaborating and sharing resources.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollabHub;
