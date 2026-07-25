// ============================================
// KhataSnap AI — Challenge Card Component
// ============================================
import { useState } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineTrash, HiOutlineLightningBolt } from 'react-icons/hi';
import { challengeAPI } from '../services/api';

export default function ChallengeCard({ challenge, onDelete, index = 0 }) {
  const [motivation, setMotivation] = useState('');
  const [loadingMotivation, setLoadingMotivation] = useState(false);

  const barColor = challenge.status === 'completed' ? 'var(--success)'
    : challenge.percentage >= 90 ? 'var(--danger)'
    : challenge.percentage >= 70 ? 'var(--warning)' : 'var(--primary)';

  const getMotivation = async () => {
    setLoadingMotivation(true);
    try {
      const res = await challengeAPI.getMotivation(challenge._id);
      setMotivation(res.data.data.message);
    } catch { setMotivation('Keep going! You can do it! 💪'); }
    finally { setLoadingMotivation(false); }
  };

  const daysLeft = Math.max(0, Math.ceil((new Date(challenge.endDate) - new Date()) / (1000 * 60 * 60 * 24)));

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }} className="card" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div>
          <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '4px' }}>{challenge.title}</h4>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            {challenge.category && `${challenge.category} • `}{daysLeft} days left
          </p>
        </div>
        <span className={`badge ${challenge.status === 'completed' ? 'badge-success' : challenge.status === 'failed' ? 'badge-danger' : 'badge-primary'}`}>
          {challenge.status}
        </span>
      </div>
      {/* Progress */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px', color: 'var(--text-muted)' }}>
        <span>${challenge.spent?.toFixed(2)} spent</span>
        <span>${challenge.targetAmount} target</span>
      </div>
      <div style={{ width: '100%', height: '8px', background: '#F1F5F9', borderRadius: '100px', overflow: 'hidden', marginBottom: '12px' }}>
        <motion.div initial={{ width: 0 }} animate={{ width: `${challenge.percentage}%` }}
          transition={{ duration: 0.8 }} style={{ height: '100%', background: barColor, borderRadius: '100px' }} />
      </div>
      {/* Actions */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={getMotivation} disabled={loadingMotivation}
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
            padding: '7px', borderRadius: '8px', border: '1px solid var(--border)',
            background: 'white', cursor: 'pointer', fontSize: '12px', fontWeight: 600,
            color: 'var(--primary)', fontFamily: 'Inter, sans-serif' }}>
          <HiOutlineLightningBolt size={14} /> {loadingMotivation ? '...' : 'Motivate Me'}
        </button>
        <button onClick={() => onDelete(challenge._id)}
          style={{ padding: '7px 12px', borderRadius: '8px', border: '1px solid var(--border)',
            background: 'white', cursor: 'pointer', color: 'var(--danger)' }}>
          <HiOutlineTrash size={14} />
        </button>
      </div>
      {motivation && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ marginTop: '12px', padding: '10px', background: 'var(--primary-light)',
            borderRadius: '8px', fontSize: '12px', color: 'var(--primary)', lineHeight: 1.5 }}>
          {motivation}
        </motion.p>
      )}
    </motion.div>
  );
}
