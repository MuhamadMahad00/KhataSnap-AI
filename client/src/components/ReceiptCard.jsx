// ============================================
// KhataSnap AI — ReceiptCard Component (Indigo SaaS Palette)
// ============================================

import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HiOutlineCalendar, HiOutlineTag } from 'react-icons/hi';

export default function ReceiptCard({ receipt, index = 0 }) {
  const date = new Date(receipt.date).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });

  const categoryColors = {
    Groceries: '#10B981', Food: '#F59E0B', Restaurant: '#7C3AED',
    Transport: '#0EA5E9', Shopping: '#EC4899', Medical: '#EF4444',
    Office: '#4F46E5', Education: '#8B5CF6', Entertainment: '#F59E0B',
    Travel: '#0EA5E9', Utilities: '#6366F1', Electronics: '#4F46E5',
    Fuel: '#F59E0B', Personal: '#EC4899', Business: '#4F46E5', Other: '#64748B'
  };

  const catColor = categoryColors[receipt.category] || '#4F46E5';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      whileHover={{ y: -3, boxShadow: 'var(--shadow-md)' }}
    >
      <Link
        to={`/receipts/${receipt._id}`}
        style={{
          display: 'block', textDecoration: 'none', color: 'inherit',
          background: 'white', borderRadius: 'var(--radius)',
          padding: '20px', border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-sm)', transition: 'var(--transition-spring)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>
              {receipt.vendor || 'Unknown Vendor'}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '12px' }}>
              <HiOutlineCalendar size={14} />
              {date}
            </div>
          </div>
          <span style={{
            fontSize: '18px', fontWeight: 800, color: 'var(--primary)',
            background: 'var(--primary-light)', padding: '4px 10px',
            borderRadius: '8px', border: '1px solid rgba(79, 70, 229, 0.2)'
          }}>
            {receipt.currency || '$'}{receipt.total?.toFixed(2)}
          </span>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            padding: '3px 10px', borderRadius: '100px',
            background: `${catColor}15`, color: catColor,
            fontSize: '11px', fontWeight: 600, border: `1px solid ${catColor}30`
          }}>
            {receipt.category || 'Other'}
          </span>
          {receipt.tags?.slice(0, 3).map((tag, i) => (
            <span key={i} style={{
              display: 'inline-flex', alignItems: 'center', gap: '3px',
              padding: '3px 8px', borderRadius: '100px',
              background: 'var(--background)', color: 'var(--text-muted)',
              fontSize: '11px', fontWeight: 500, border: '1px solid var(--border-light)'
            }}>
              <HiOutlineTag size={10} />{tag}
            </span>
          ))}
        </div>

        <p style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '10px' }}>
          {receipt.items?.length || 0} items • {receipt.confidenceScore || 0}% confidence
        </p>
      </Link>
    </motion.div>
  );
}
