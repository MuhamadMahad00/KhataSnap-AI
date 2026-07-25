// ============================================
// KhataSnap AI — Receipts List Page
// ============================================
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineFilter, HiOutlineSearch } from 'react-icons/hi';
import { receiptAPI } from '../services/api';
import ReceiptCard from '../components/ReceiptCard';
import SmartSearch from '../components/SmartSearch';
import { SkeletonCard } from '../components/LoadingStates';

const CATEGORIES = ['All', 'Groceries', 'Food', 'Restaurant', 'Transport', 'Shopping', 'Medical',
  'Office', 'Education', 'Entertainment', 'Travel', 'Utilities', 'Electronics', 'Fuel', 'Personal', 'Business', 'Other'];

export default function Receipts() {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSmartSearch, setShowSmartSearch] = useState(false);
  const [filters, setFilters] = useState({ category: '', search: '', page: 1 });
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  useEffect(() => { loadReceipts(); }, [filters.category, filters.page]);

  const loadReceipts = async () => {
    setLoading(true);
    try {
      const params = { page: filters.page, limit: 12 };
      if (filters.category) params.category = filters.category;
      if (filters.search) params.search = filters.search;
      const res = await receiptAPI.getAll(params);
      setReceipts(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error('Failed to load receipts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadReceipts();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800 }}>My Receipts</h1>
        <button onClick={() => setShowSmartSearch(!showSmartSearch)}
          className={showSmartSearch ? 'btn-primary' : 'btn-secondary'}>
          ✨ {showSmartSearch ? 'Regular View' : 'Smart Search'}
        </button>
      </div>

      {/* Smart Search Mode */}
      {showSmartSearch ? (
        <SmartSearch />
      ) : (
        <>
          {/* Filters */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Search */}
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', flex: 1, minWidth: '200px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <HiOutlineSearch size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                <input className="input" style={{ paddingLeft: '36px' }}
                  value={filters.search} onChange={e => setFilters({ ...filters, search: e.target.value })}
                  placeholder="Search vendor, items, tags..." />
              </div>
              <button type="submit" className="btn-primary"><HiOutlineSearch size={16} /></button>
            </form>
            {/* Category filter */}
            <select className="input" style={{ width: 'auto', minWidth: '140px', cursor: 'pointer' }}
              value={filters.category} onChange={e => setFilters({ ...filters, category: e.target.value === 'All' ? '' : e.target.value, page: 1 })}>
              {CATEGORIES.map(c => <option key={c} value={c === 'All' ? '' : c}>{c}</option>)}
            </select>
          </div>

          {/* Receipt Grid */}
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
              <SkeletonCard count={6} />
            </div>
          ) : receipts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 24px' }}>
              <p style={{ fontSize: '48px', marginBottom: '16px' }}>📄</p>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>No receipts found</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Upload your first receipt to get started</p>
            </div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                {receipts.map((r, i) => <ReceiptCard key={r._id} receipt={r} index={i} />)}
              </div>
              {/* Pagination */}
              {pagination.pages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '24px' }}>
                  {Array.from({ length: pagination.pages }).map((_, i) => (
                    <button key={i} onClick={() => setFilters({ ...filters, page: i + 1 })}
                      style={{
                        width: '36px', height: '36px', borderRadius: '8px',
                        border: '1px solid var(--border)', cursor: 'pointer',
                        fontWeight: 600, fontSize: '13px', fontFamily: 'Inter, sans-serif',
                        background: filters.page === i + 1 ? 'var(--primary)' : 'white',
                        color: filters.page === i + 1 ? 'white' : 'var(--text)'
                      }}>{i + 1}</button>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}
    </motion.div>
  );
}
