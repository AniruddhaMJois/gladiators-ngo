import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageSquare, X, Send, Bot, User, HelpCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const BAD_WORDS = ['fuck', 'shit', 'ass', 'bitch', 'crap', 'damn', 'hell'];

const faqs = [
  "How can I register as a Volunteer?",
  "What is the NGO verification process?",
  "How do companies connect with NGOs?",
  "Who built this platform?"
];

const GlobalChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm GladiAssist. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const location = useLocation();
  const [previousPath, setPreviousPath] = useState(location.pathname);
  const { user } = useAuth();
  const messagesEndRef = useRef(null);

  // Track previous path
  useEffect(() => {
    if (location.pathname !== previousPath) {
      setPreviousPath(location.pathname);
    }
  }, [location.pathname, previousPath]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const containsProfanity = (text) => {
    const lowerText = text.toLowerCase();
    return BAD_WORDS.some(word => lowerText.includes(word));
  };

  const handleSend = async (text) => {
    const messageText = text || input;
    if (!messageText.trim()) return;

    if (containsProfanity(messageText)) {
      setMessages(prev => [
        ...prev,
        { role: 'user', content: messageText },
        { role: 'assistant', content: 'Please maintain a respectful tone. Foul language is not permitted on this platform.' }
      ]);
      setInput('');
      return;
    }

    const newMessages = [...messages, { role: 'user', content: messageText }];
    
    // Limit memory to last 10 messages (5 pairs) + system prompt (if any, though handled in backend)
    const limitedMessages = newMessages.slice(-10);
    
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: limitedMessages,
          context: {
            currentPath: location.pathname,
            previousPath: previousPath,
            role: user?.role || 'guest'
          }
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: "I'm having trouble connecting right now. Please try again later." }]);
      }
    } catch (error) {
      console.error("Chatbot Error:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Network error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          zIndex: 9999,
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
          color: 'white',
          border: 'none',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 0.2s ease',
          transform: isOpen ? 'scale(0)' : 'scale(1)',
          opacity: isOpen ? 0 : 1
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = isOpen ? 'scale(0)' : 'scale(1)'}
      >
        <MessageSquare size={24} />
      </button>

      {/* Chat Window */}
      <div
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          zIndex: 10000,
          width: '350px',
          height: '500px',
          background: 'var(--color-bg-card)',
          borderRadius: '1rem',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          transform: isOpen ? 'scale(1) translateY(0)' : 'scale(0.8) translateY(20px)',
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          border: '1px solid rgba(226, 232, 240, 0.5)'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '1rem',
          background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-light))',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ background: 'white', padding: '0.3rem', borderRadius: '50%', display: 'flex' }}>
              <Bot size={20} style={{ color: 'var(--color-primary)' }} />
            </div>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>GladiAssist</div>
              <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>AI Support</div>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              padding: '0.2rem'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          background: 'rgba(0,0,0,0.01)'
        }}>
          {messages.map((msg, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                gap: '0.5rem',
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                maxWidth: '85%'
              }}
            >
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: msg.role === 'user' ? 'var(--color-accent)' : 'var(--color-primary-light)',
                color: msg.role === 'user' ? 'white' : 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div style={{
                background: msg.role === 'user' ? 'var(--color-accent)' : 'var(--color-bg-card)',
                color: msg.role === 'user' ? 'white' : 'var(--color-text-primary)',
                padding: '0.6rem 0.8rem',
                borderRadius: '1rem',
                borderTopRightRadius: msg.role === 'user' ? 0 : '1rem',
                borderTopLeftRadius: msg.role === 'user' ? '1rem' : 0,
                fontSize: '0.9rem',
                lineHeight: 1.4,
                boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                border: msg.role === 'user' ? 'none' : '1px solid #E2E8F0'
              }}>
                {msg.content}
              </div>
            </div>
          ))}

          {/* FAQs section */}
          {messages.length === 1 && (
            <div style={{ marginTop: '0.5rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <HelpCircle size={14} /> Frequently Asked
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {faqs.map((faq, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(faq)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.5)',
                      border: '1px solid var(--color-primary-light)',
                      color: 'var(--color-primary)',
                      padding: '0.5rem 0.8rem',
                      borderRadius: '0.5rem',
                      fontSize: '0.8rem',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-primary-light)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.5)'}
                  >
                    {faq}
                  </button>
                ))}
              </div>
            </div>
          )}

          {isLoading && (
            <div style={{ alignSelf: 'flex-start', display: 'flex', gap: '0.5rem' }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%', background: 'var(--color-primary-light)',
                color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Bot size={16} />
              </div>
              <div style={{
                background: 'var(--color-bg-card)', padding: '0.6rem 1rem', borderRadius: '1rem',
                borderTopLeftRadius: 0, fontSize: '0.9rem', border: '1px solid #E2E8F0'
              }}>
                <span className="dot-pulse">typing...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div style={{
          padding: '0.8rem',
          borderTop: '1px solid #E2E8F0',
          background: 'var(--color-bg-card)',
          display: 'flex',
          gap: '0.5rem'
        }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            style={{
              flex: 1,
              padding: '0.6rem 1rem',
              borderRadius: '2rem',
              border: '1px solid #E2E8F0',
              outline: 'none',
              fontSize: '0.9rem',
              fontFamily: 'inherit'
            }}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            style={{
              background: input.trim() && !isLoading ? 'var(--color-primary)' : '#E2E8F0',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
              transition: 'background 0.2s'
            }}
          >
            <Send size={18} style={{ marginLeft: '2px' }} />
          </button>
        </div>
      </div>
    </>
  );
};

export default GlobalChatbot;
