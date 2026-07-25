// ============================================
// KhataSnap AI — Budget Tracker Component
// ============================================
// Displays current month's budget with progress bar and warnings.

import { motion } from 'framer-motion';
import { HiOutlineExclamation, HiOutlineCheckCircle } from 'react-icons/hi';

export default function BudgetTracker({ budget = 0, spent = 0, remaining = 0, percentage = 0, isOverBudget = false }) {
  if (budget === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
        style={{ padding: '24px', textAlign: 'center' }}
      >
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '12px' }}>
          No budget set for this month
        </p>
        <p style={{ fontSize: '12px', color: 'var(--text-light)' }}>
          Go to Settings to set your monthly budget
        </p>
      </motion.div>
    );
  }

  const barColor = isOverBudget ? 'var(--danger)' : percentage > 80 ? 'var(--warning)' : 'var(--primary)';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
      style={{ padding: '24px' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)' }}>
          Monthly Budget
        </h3>
        {isOverBudget ? (
          <span className="badge badge-danger">
            <HiOutlineExclamation size={14} /> Over Budget
          </span>
        ) : percentage >= 80 ? (
          <span className="badge badge-warning">
            <HiOutlineExclamation size={14} /> Almost There
          </span>
        ) : (
          <span className="badge badge-success">
            <HiOutlineCheckCircle size={14} /> On Track
          </span>
        )}
      </div>

      {/* Budget Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
        <div>
          <p style={{ fontSize: '11px', color: 'var(--text-light)', fontWeight: 500, marginBottom: '2px' }}>Budget</p>
          <p style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text)' }}>${budget.toFixed(2)}</p>
        </div>
        <div>
          <p style={{ fontSize: '11px', color: 'var(--text-light)', fontWeight: 500, marginBottom: '2px' }}>Spent</p>
          <p style={{ fontSize: '18px', fontWeight: 800, color: barColor }}>${spent.toFixed(2)}</p>
        </div>
        <div>
          <p style={{ fontSize: '11px', color: 'var(--text-light)', fontWeight: 500, marginBottom: '2px' }}>Remaining</p>
          <p style={{ fontSize: '18px', fontWeight: 800, color: isOverBudget ? 'var(--danger)' : 'var(--success)' }}>
            ${Math.abs(remaining).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{
        width: '100%', height: '10px', background: '#F1F5F9',
        borderRadius: '100px', overflow: 'hidden'
      }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(percentage, 100)}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{
            height: '100%', background: barColor,
            borderRadius: '100px'
          }}
        />
      </div>
      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px', textAlign: 'right' }}>
        {percentage}% used
      </p>
    </motion.div>
  );
}
