// ============================================
// KhataSnap AI — Monthly Comparison Component
// ============================================
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineArrowUp, HiOutlineArrowDown } from 'react-icons/hi';
import { aiAPI } from '../services/api';
import { Spinner } from './LoadingStates';

export default function MonthlyComparison() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    aiAPI.getMonthlyComparison().then(res => setData(res.data.data))
      .catch(() => setData(null)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="card" style={{ padding: '24px', textAlign: 'center' }}><Spinner size={24} /></div>;
  if (!data) return null;

  const isUp = data.percentChange > 0;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="card" style={{ padding: '24px' }}>
      <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '20px', color: 'var(--text)' }}>Monthly Comparison</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
        {/* Previous Month */}
        <div style={{ textAlign: 'center', padding: '16px', background: 'var(--background)', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>{data.previousMonth.name}</p>
          <p style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text)' }}>${data.previousMonth.total.toFixed(2)}</p>
          <p style={{ fontSize: '11px', color: 'var(--text-light)' }}>{data.previousMonth.receipts} receipts</p>
        </div>
        {/* Arrow */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '50%',
            background: isUp ? 'var(--danger-light)' : 'var(--success-light)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: isUp ? 'var(--danger)' : 'var(--success)'
          }}>
            {isUp ? <HiOutlineArrowUp size={20} /> : <HiOutlineArrowDown size={20} />}
          </div>
          <p style={{ fontSize: '14px', fontWeight: 700, marginTop: '4px',
            color: isUp ? 'var(--danger)' : 'var(--success)' }}>
            {Math.abs(data.percentChange)}%
          </p>
        </div>
        {/* Current Month */}
        <div style={{ textAlign: 'center', padding: '16px', background: 'var(--primary-light)', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <p style={{ fontSize: '12px', color: 'var(--primary)', marginBottom: '4px' }}>{data.currentMonth.name}</p>
          <p style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary)' }}>${data.currentMonth.total.toFixed(2)}</p>
          <p style={{ fontSize: '11px', color: 'var(--text-light)' }}>{data.currentMonth.receipts} receipts</p>
        </div>
      </div>
      {/* AI Analysis */}
      {data.aiAnalysis && (
        <div style={{ background: 'var(--background)', borderRadius: '10px', padding: '14px', marginTop: '8px', border: '1px solid var(--border-light)' }}>
          <p style={{ fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: 'var(--text)' }}>🤖 AI Analysis</p>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{data.aiAnalysis}</p>
        </div>
      )}
    </motion.div>
  );
}
