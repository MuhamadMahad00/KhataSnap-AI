// ============================================
// KhataSnap AI — Sidebar Component (Indigo SaaS Palette)
// ============================================

import { useContext } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiOutlineChartPie, HiOutlineUpload, HiOutlineDocumentText,
  HiOutlineCog, HiOutlineSparkles, HiOutlineX
} from 'react-icons/hi';
import { AuthContext } from '../App';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: HiOutlineChartPie },
  { path: '/upload', label: 'Upload Receipt', icon: HiOutlineUpload },
  { path: '/receipts', label: 'My Receipts', icon: HiOutlineDocumentText },
  { path: '/settings', label: 'Settings & Budget', icon: HiOutlineCog }
];

export default function Sidebar({ isOpen, setIsOpen }) {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  if (!user) return null;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)',
            backdropFilter: 'blur(4px)', zIndex: 35
          }}
        />
      )}

      {/* Sidebar Container */}
      <motion.aside
        initial={false}
        animate={{ x: isOpen ? 0 : 0 }}
        style={{
          position: 'fixed', top: 0, left: 0, bottom: 0,
          width: '260px',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderRight: '1px solid var(--border)',
          zIndex: 40, padding: '24px 16px',
          display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between'
        }}
        className={`sidebar ${isOpen ? 'open' : ''}`}
      >
        <div>
          {/* Logo */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: '32px', padding: '0 8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '38px', height: '38px', borderRadius: '12px',
                background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: 800, fontSize: '18px',
                boxShadow: '0 4px 14px rgba(79, 70, 229, 0.35)'
              }}>
                K
              </div>
              <span style={{ fontWeight: 800, fontSize: '19px', color: 'var(--text)' }}>
                KhataSnap<span style={{ color: 'var(--primary)' }}> AI</span>
              </span>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="md:hidden"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-muted)', padding: '4px'
              }}
            >
              <HiOutlineX size={20} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  style={{ textDecoration: 'none', position: 'relative' }}
                >
                  <motion.div
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '12px 16px', borderRadius: 'var(--radius-sm)',
                      fontWeight: isActive ? 700 : 500,
                      fontSize: '14px',
                      color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                      background: isActive ? 'var(--primary-light)' : 'transparent',
                      transition: 'var(--transition-fast)',
                      position: 'relative'
                    }}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        style={{
                          position: 'absolute', left: 0, top: '15%', bottom: '15%',
                          width: '4px', background: 'var(--primary)',
                          borderRadius: '0 4px 4px 0'
                        }}
                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                      />
                    )}
                    <item.icon size={20} style={{ color: isActive ? 'var(--primary)' : 'var(--text-light)' }} />
                    {item.label}
                  </motion.div>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* AI Mini Banner */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.08), rgba(124, 58, 237, 0.12))',
          borderRadius: 'var(--radius-sm)',
          padding: '16px',
          border: '1px solid rgba(79, 70, 229, 0.2)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <HiOutlineSparkles size={18} style={{ color: 'var(--primary)' }} />
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>AI Ledger</span>
          </div>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
            Groq Vision AI (Qwen 27B) categorizes your receipts automatically.
          </p>
        </div>
      </motion.aside>

      <style>{`
        @media (max-width: 768px) {
          .sidebar {
            transform: translateX(-100%);
            transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          }
          .sidebar.open {
            transform: translateX(0);
          }
          .md\\:hidden {
            display: block !important;
          }
        }
        @media (min-width: 769px) {
          .md\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}
