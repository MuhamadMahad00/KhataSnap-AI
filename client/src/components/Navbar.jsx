// ============================================
// KhataSnap AI — Navbar Component (Indigo SaaS Palette)
// ============================================

import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineUser, HiOutlineLogout } from 'react-icons/hi';
import { AuthContext } from '../App';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        height: '64px',
        background: 'rgba(255, 255, 255, 0.88)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px'
      }}
    >
      {/* Logo */}
      <Link to="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '10px',
          background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontWeight: 800, fontSize: '16px',
          boxShadow: '0 4px 14px rgba(79, 70, 229, 0.35)'
        }}>
          K
        </div>
        <span style={{ fontWeight: 800, fontSize: '18px', color: 'var(--text)' }}>
          KhataSnap<span style={{ color: 'var(--primary)' }}> AI</span>
        </span>
      </Link>

      {/* Right Side User Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border)',
              background: 'white', cursor: 'pointer', transition: 'var(--transition)',
              fontFamily: 'Inter, sans-serif'
            }}
          >
            <div style={{
              width: '28px', height: '28px', borderRadius: '8px',
              background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontSize: '12px', fontWeight: 700
            }}>
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>
              {user?.name || 'User'}
            </span>
          </button>

          {/* Dropdown Menu */}
          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                style={{
                  position: 'absolute', top: '100%', right: 0, marginTop: '8px',
                  background: 'white', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)', boxShadow: 'var(--shadow-lg)',
                  minWidth: '180px', overflow: 'hidden', zIndex: 100
                }}
              >
                <Link
                  to="/settings"
                  onClick={() => setShowMenu(false)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '10px 16px', textDecoration: 'none', color: 'var(--text)',
                    fontSize: '13px', fontWeight: 500, borderBottom: '1px solid var(--border-light)'
                  }}
                >
                  <HiOutlineUser size={16} /> Profile & Settings
                </Link>
                <button
                  onClick={handleLogout}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
                    padding: '10px 16px', background: 'none', border: 'none',
                    color: 'var(--danger)', fontSize: '13px', fontWeight: 500,
                    cursor: 'pointer', fontFamily: 'Inter, sans-serif'
                  }}
                >
                  <HiOutlineLogout size={16} /> Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.nav>
  );
}
