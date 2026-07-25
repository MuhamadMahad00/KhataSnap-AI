// ============================================
// KhataSnap AI — Smart Search Component
// ============================================
import { useState } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineSearch, HiOutlineSparkles } from 'react-icons/hi';
import { aiAPI } from '../services/api';
import ReceiptCard from './ReceiptCard';
import { Spinner } from './LoadingStates';

export default function SmartSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await aiAPI.smartSearch(query);
      setResults(res.data);
    } catch (err) {
      setResults({ data: [], error: 'Search failed' });
    } finally {
      setLoading(false);
    }
  };

  const examples = ['Show grocery receipts', 'Receipts over $50', 'Last week purchases', 'Restaurant expenses'];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <HiOutlineSparkles size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
          <input value={query} onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Search naturally... e.g., 'grocery receipts from July'"
            className="input" style={{ paddingLeft: '40px' }} />
        </div>
        <button onClick={handleSearch} className="btn-primary" disabled={loading}>
          {loading ? <Spinner size={16} color="white" /> : <HiOutlineSearch size={18} />} Search
        </button>
      </div>
      {!results && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
          {examples.map((ex, i) => (
            <button key={i} onClick={() => setQuery(ex)} style={{
              background: 'var(--primary-light)', border: 'none', padding: '6px 12px',
              borderRadius: '100px', fontSize: '12px', color: 'var(--primary)',
              cursor: 'pointer', fontWeight: 500, fontFamily: 'Inter, sans-serif'
            }}>{ex}</button>
          ))}
        </div>
      )}
      {results && (
        <div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>
            Found {results.data?.length || 0} receipts for "{results.query}"
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '12px' }}>
            {results.data?.map((r, i) => <ReceiptCard key={r._id} receipt={r} index={i} />)}
          </div>
          {results.data?.length === 0 && (
            <p style={{ textAlign: 'center', padding: '32px', color: 'var(--text-light)' }}>No receipts match your search.</p>
          )}
        </div>
      )}
    </motion.div>
  );
}
