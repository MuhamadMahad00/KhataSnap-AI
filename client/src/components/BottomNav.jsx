// ============================================
// KhataSnap AI — Mobile Bottom Navigation Bar
// ============================================
// Provides quick thumb-friendly navigation on mobile devices (< 768px).

import { NavLink, useLocation } from 'react-router-dom';
import {
  HiOutlineChartPie,
  HiOutlineUpload,
  HiOutlineDocumentText,
  HiOutlineCog
} from 'react-icons/hi';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: HiOutlineChartPie },
  { path: '/upload', label: 'Scan', icon: HiOutlineUpload, isAction: true },
  { path: '/receipts', label: 'Receipts', icon: HiOutlineDocumentText },
  { path: '/settings', label: 'Settings', icon: HiOutlineCog }
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="mobile-bottom-nav">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        if (item.isAction) {
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className="bottom-nav-action-btn"
              aria-label={item.label}
            >
              <div className="action-circle">
                <item.icon size={22} />
              </div>
              <span className="bottom-nav-label">{item.label}</span>
            </NavLink>
          );
        }

        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={`bottom-nav-item ${isActive ? 'active' : ''}`}
          >
            <item.icon size={20} />
            <span className="bottom-nav-label">{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
