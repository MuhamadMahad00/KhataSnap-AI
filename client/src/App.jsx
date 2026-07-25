// ============================================
// KhataSnap AI — Main App Component
// ============================================
// React Router setup, auth context, and layout management.

import { useState, useEffect, createContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Receipts from './pages/Receipts';
import ReceiptDetail from './pages/ReceiptDetail';
import Settings from './pages/Settings';

// Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import AIChatAssistant from './components/AIChatAssistant';

// ============================================
// Auth Context — Global authentication state
// ============================================
export const AuthContext = createContext(null);

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

import React from 'react';

function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('khatasnap_user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = (userData) => {
    localStorage.setItem('khatasnap_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('khatasnap_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ============================================
// Protected Route Wrapper
// ============================================
function ProtectedRoute({ children }) {
  const { user } = React.useContext(AuthContext);
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

// ============================================
// App Layout — Navbar + Sidebar for authenticated pages
// ============================================
function AppLayout({ children }) {
  const { user } = React.useContext(AuthContext);
  const location = useLocation();
  const isPublicPage = ['/', '/login', '/register'].includes(location.pathname);

  if (isPublicPage || !user) {
    return children;
  }

  return (
    <>
      <Navbar />
      <div className="page-wrapper">
        <Sidebar />
        <main className="main-content">
          {children}
        </main>
      </div>
      <AIChatAssistant />
    </>
  );
}

// ============================================
// App Component
// ============================================
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            className: 'toast-custom',
            style: {
              background: '#FFFFFF',
              color: '#1E293B',
              border: '1px solid #E2E8F0',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              padding: '12px 16px',
              fontSize: '14px',
              fontFamily: 'Inter, sans-serif'
            },
            success: {
              iconTheme: { primary: '#10B981', secondary: '#FFFFFF' }
            },
            error: {
              iconTheme: { primary: '#EF4444', secondary: '#FFFFFF' }
            }
          }}
        />
        <AppLayout>
          <AnimatePresence mode="wait">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Routes */}
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
              <Route path="/receipts" element={<ProtectedRoute><Receipts /></ProtectedRoute>} />
              <Route path="/receipts/:id" element={<ProtectedRoute><ReceiptDetail /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

              {/* Catch all — redirect to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AnimatePresence>
        </AppLayout>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
