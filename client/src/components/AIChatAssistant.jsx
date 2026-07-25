// ============================================
// KhataSnap AI — AI Chat Assistant Component (Indigo SaaS Palette)
// ============================================

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineChat, HiOutlineX, HiOutlinePaperAirplane } from 'react-icons/hi';
import { aiAPI } from '../services/api';
import { Spinner } from './LoadingStates';

export default function AIChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm your KhataSnap AI assistant. Ask me anything about your expenses! 💡" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEnd = useRef(null);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const res = await aiAPI.chat(userMessage);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: res.data.data.response
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Sorry, I couldn't process that. Please try again."
      }]);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    'How much did I spend this month?',
    "What's my top spending category?",
    'How can I save more money?'
  ];

  return (
    <>
      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed', bottom: '24px', right: '24px',
          width: '56px', height: '56px', borderRadius: '16px',
          background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
          color: 'white', border: 'none', cursor: 'pointer',
          boxShadow: '0 8px 25px rgba(79, 70, 229, 0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 50
        }}
      >
        {isOpen ? <HiOutlineX size={24} /> : <HiOutlineChat size={24} />}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed', bottom: '92px', right: '24px',
              width: '380px', maxWidth: 'calc(100vw - 48px)',
              height: '500px', maxHeight: 'calc(100vh - 140px)',
              background: 'white', borderRadius: '16px',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-lg)',
              display: 'flex', flexDirection: 'column',
              overflow: 'hidden', zIndex: 50
            }}
          >
            {/* Header */}
            <div style={{
              padding: '16px 20px',
              background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
              color: 'white'
            }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '2px' }}>
                🤖 KhataSnap AI
              </h3>
              <p style={{ fontSize: '12px', opacity: 0.9 }}>Ask about your expenses</p>
            </div>

            {/* Messages */}
            <div style={{
              flex: 1, overflowY: 'auto', padding: '16px',
              display: 'flex', flexDirection: 'column', gap: '12px'
            }}>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    maxWidth: '85%',
                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    padding: '10px 14px',
                    borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                    background: msg.role === 'user' ? 'var(--primary)' : 'var(--background)',
                    color: msg.role === 'user' ? 'white' : 'var(--text)',
                    border: msg.role === 'user' ? 'none' : '1px solid var(--border-light)',
                    fontSize: '13px', lineHeight: 1.5,
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  {msg.content}
                </motion.div>
              ))}

              {loading && (
                <div style={{ alignSelf: 'flex-start', padding: '10px 14px' }}>
                  <Spinner size={16} color="var(--primary)" />
                </div>
              )}

              {messages.length <= 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
                  <p style={{ fontSize: '11px', color: 'var(--text-light)', fontWeight: 500 }}>Try asking:</p>
                  {suggestions.map((q, i) => (
                    <button key={i} onClick={() => setInput(q)}
                      style={{
                        background: 'var(--primary-light)', border: '1px solid var(--border)',
                        padding: '8px 12px', borderRadius: '8px',
                        fontSize: '12px', color: 'var(--primary)',
                        cursor: 'pointer', textAlign: 'left',
                        fontFamily: 'Inter, sans-serif', fontWeight: 500
                      }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              <div ref={messagesEnd} />
            </div>

            {/* Input */}
            <div style={{
              padding: '12px 16px', borderTop: '1px solid var(--border)',
              display: 'flex', gap: '8px'
            }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder="Ask about your expenses..."
                style={{
                  flex: 1, padding: '10px 14px', border: '1.5px solid var(--border)',
                  borderRadius: '10px', fontSize: '13px', outline: 'none',
                  fontFamily: 'Inter, sans-serif'
                }}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                style={{
                  width: '40px', height: '40px', borderRadius: '10px',
                  background: input.trim() ? 'var(--primary)' : 'var(--border)',
                  color: 'white', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'var(--transition)'
                }}
              >
                <HiOutlinePaperAirplane size={18} style={{ transform: 'rotate(90deg)' }} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
