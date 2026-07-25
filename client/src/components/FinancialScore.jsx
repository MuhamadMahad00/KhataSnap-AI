// ============================================
// KhataSnap AI — Financial Score Component
// ============================================
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { aiAPI } from '../services/api';
import { Spinner } from './LoadingStates';

export default function FinancialScore() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    aiAPI.getFinancialScore().then(res => setData(res.data.data))
      .catch(() => setData(null)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="card" style={{ padding: '24px', textAlign: 'center' }}><Spinner size={24} /></div>;
  if (!data) return null;

  const scoreColor = data.score >= 80 ? '#4A5F56' : data.score >= 60 ? '#7D8D86' : '#B84A39';

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="card" style={{ padding: '24px', textAlign: 'center' }}>
      <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '20px', color: 'var(--text)' }}>Financial Score</h3>
      {/* Circular Score */}
      <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 16px' }}>
        <svg width="120" height="120" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="52" fill="none" stroke="var(--border-light)" strokeWidth="10" />
          <motion.circle cx="60" cy="60" r="52" fill="none" stroke={scoreColor} strokeWidth="10"
            strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 52}`}
            initial={{ strokeDashoffset: 2 * Math.PI * 52 }}
            animate={{ strokeDashoffset: 2 * Math.PI * 52 * (1 - data.score / 100) }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            transform="rotate(-90 60 60)" />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '32px', fontWeight: 800, color: scoreColor }}>{data.score}</span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>/ 100</span>
        </div>
      </div>
      <span className={`badge ${data.score >= 80 ? 'badge-success' : data.score >= 60 ? 'badge-warning' : 'badge-danger'}`}
        style={{ marginBottom: '12px' }}>{data.status}</span>
      <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, marginTop: '8px' }}>{data.explanation}</p>
      {data.tips?.length > 0 && (
        <div style={{ marginTop: '16px', textAlign: 'left', background: 'var(--background)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
          <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)', marginBottom: '8px' }}>Tips:</p>
          {data.tips.map((tip, i) => (
            <p key={i} style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px', paddingLeft: '8px' }}>• {tip}</p>
          ))}
        </div>
      )}
    </motion.div>
  );
}
