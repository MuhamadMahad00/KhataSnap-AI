// ============================================
// KhataSnap AI — Home Page (Indigo SaaS Palette)
// ============================================

import { useContext } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineUpload, HiOutlineChartBar, HiOutlineSparkles, HiOutlineShieldCheck, HiOutlineLightningBolt, HiOutlineChat } from 'react-icons/hi';
import { AuthContext } from '../App';

const features = [
  { icon: HiOutlineUpload, title: 'Smart Receipt Upload', desc: 'Simply upload a photo of your receipt. Qwen Vision AI does the rest.', color: '#4F46E5' },
  { icon: HiOutlineSparkles, title: 'AI Understanding', desc: 'Deep AI extraction of items, quantities, subtotal, tax, and categories.', color: '#7C3AED' },
  { icon: HiOutlineChartBar, title: 'Smart Dashboard', desc: 'Interactive charts, heatmaps, and financial scores powered by AI.', color: '#10B981' },
  { icon: HiOutlineLightningBolt, title: 'Budget & Challenges', desc: 'Set budgets, track limits, and conquer financial challenges.', color: '#F59E0B' },
  { icon: HiOutlineChat, title: 'AI Chat Assistant', desc: 'Ask anything about your expenses using natural conversation.', color: '#EC4899' },
  { icon: HiOutlineShieldCheck, title: 'Secure & Private', desc: 'Your data stays encrypted and fully private to your account.', color: '#0EA5E9' }
];

export default function Home() {
  const { user } = useContext(AuthContext);
  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
      {/* Navbar */}
      <nav style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '16px 32px', maxWidth: '1200px', margin: '0 auto'
      }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 800, fontSize: '16px'
          }}>K</div>
          <span style={{ fontWeight: 800, fontSize: '18px', color: 'var(--text)' }}>
            KhataSnap<span style={{ color: 'var(--primary)' }}> AI</span>
          </span>
        </Link>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link to="/login" className="btn-secondary">Login</Link>
          <Link to="/register" className="btn-primary" style={{ textDecoration: 'none' }}>Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ textAlign: 'center', padding: '80px 24px 60px', maxWidth: '800px', margin: '0 auto', position: 'relative' }}>
        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 8, repeat: Infinity }}
          style={{
            position: 'absolute', top: '-40px', left: '10%', width: '300px', height: '300px',
            borderRadius: '50%', background: 'radial-gradient(circle, #4F46E5, transparent)',
            filter: 'blur(80px)', pointerEvents: 'none'
          }} />
        <motion.div animate={{ scale: [1.2, 1, 1.2], opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 10, repeat: Infinity }}
          style={{
            position: 'absolute', top: '20px', right: '5%', width: '250px', height: '250px',
            borderRadius: '50%', background: 'radial-gradient(circle, #7C3AED, transparent)',
            filter: 'blur(80px)', pointerEvents: 'none'
          }} />

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }} style={{ position: 'relative', zIndex: 1 }}>
          <span className="badge badge-primary" style={{ marginBottom: '20px', fontSize: '13px', padding: '6px 14px' }}>
            ✨ AI-Powered Visual Ledger & SaaS
          </span>
          <h1 style={{
            fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 900, lineHeight: 1.1,
            marginBottom: '20px', color: 'var(--text)'
          }}>
            Snap Your Receipts.<br />
            <span className="gradient-text">Let AI Handle the Rest.</span>
          </h1>
          <p style={{ fontSize: '18px', color: 'var(--text-muted)', maxWidth: '560px', margin: '0 auto 32px', lineHeight: 1.7 }}>
            Upload a receipt photo and our AI instantly extracts every item, price, tax, and category.
            Track expenses, set budgets, and receive automated financial insights.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Link to="/register" className="btn-primary" style={{ textDecoration: 'none', padding: '14px 32px', fontSize: '16px', borderRadius: '12px' }}>
              Start Free →
            </Link>
            <Link to="/login" className="btn-secondary" style={{ textDecoration: 'none', padding: '14px 32px', fontSize: '16px', borderRadius: '12px' }}>
              Login
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px 80px' }}>
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '12px' }}>Everything You Need</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '16px' }}>Powerful features to manage your expenses effortlessly</p>
        </motion.div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {features.map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              whileHover={{ y: -4, boxShadow: '0 12px 30px rgba(79,70,229,0.12)' }}
              className="card" style={{ padding: '28px' }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '14px',
                background: 'var(--primary-light)', color: f.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px',
                border: '1px solid rgba(79,70,229,0.2)'
              }}>
                <f.icon size={24} />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>{f.title}</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6 }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '32px', borderTop: '1px solid var(--border)', color: 'var(--text-light)', fontSize: '13px' }}>
        © 2024 KhataSnap AI. Built with ❤️ for smart expense management.
      </footer>
    </div>
  );
}
