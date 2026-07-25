// ============================================
// KhataSnap AI — Settings Page
// ============================================
import { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineUser, HiOutlineCurrencyDollar, HiOutlineLightningBolt, HiOutlinePlus } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { AuthContext } from '../App';
import { budgetAPI, challengeAPI } from '../services/api';
import ChallengeCard from '../components/ChallengeCard';
import { Spinner } from '../components/LoadingStates';

export default function Settings() {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('profile');
  const [budget, setBudget] = useState({ month: new Date().getMonth() + 1, year: new Date().getFullYear(), amount: '' });
  const [currentBudget, setCurrentBudget] = useState(null);
  const [challenges, setChallenges] = useState([]);
  const [newChallenge, setNewChallenge] = useState({ title: '', targetAmount: '', endDate: '', category: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    budgetAPI.getCurrent().then(res => setCurrentBudget(res.data.data)).catch(() => {});
    challengeAPI.getAll().then(res => setChallenges(res.data.data)).catch(() => {});
  }, []);

  const saveBudget = async () => {
    if (!budget.amount) return toast.error('Enter budget amount');
    setLoading(true);
    try {
      await budgetAPI.set(budget);
      const res = await budgetAPI.getCurrent();
      setCurrentBudget(res.data.data);
      toast.success('Budget updated!');
    } catch (err) { toast.error('Failed to save budget'); }
    finally { setLoading(false); }
  };

  const createChallenge = async () => {
    if (!newChallenge.title || !newChallenge.targetAmount || !newChallenge.endDate) {
      return toast.error('Fill in title, target, and end date');
    }
    try {
      await challengeAPI.create(newChallenge);
      const res = await challengeAPI.getAll();
      setChallenges(res.data.data);
      setNewChallenge({ title: '', targetAmount: '', endDate: '', category: '' });
      toast.success('Challenge created!');
    } catch (err) { toast.error('Failed to create challenge'); }
  };

  const deleteChallenge = async (id) => {
    try {
      await challengeAPI.delete(id);
      setChallenges(prev => prev.filter(c => c._id !== id));
      toast.success('Challenge deleted');
    } catch (err) { toast.error('Failed to delete'); }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: HiOutlineUser },
    { id: 'budget', label: 'Budget', icon: HiOutlineCurrencyDollar },
    { id: 'challenges', label: 'Challenges', icon: HiOutlineLightningBolt }
  ];

  const inputStyle = {
    width: '100%', padding: '10px 14px', border: '1.5px solid var(--border)',
    borderRadius: '8px', fontSize: '13px', fontFamily: 'Inter, sans-serif',
    color: 'var(--text)', outline: 'none'
  };

  const labelStyle = { fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px', display: 'block' };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '24px' }}>Settings</h1>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', background: '#F1F5F9', borderRadius: '10px', padding: '4px' }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
              fontSize: '13px', fontWeight: 600, fontFamily: 'Inter, sans-serif',
              background: activeTab === tab.id ? 'white' : 'transparent',
              color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-muted)',
              boxShadow: activeTab === tab.id ? 'var(--shadow-sm)' : 'none',
              transition: 'var(--transition)'
            }}>
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ padding: '28px', maxWidth: '500px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px' }}>Profile Information</h3>
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Name</label>
            <input style={inputStyle} value={user?.name || ''} disabled />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Email</label>
            <input style={inputStyle} value={user?.email || ''} disabled />
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-light)' }}>
            Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
          </p>
        </motion.div>
      )}

      {/* Budget Tab */}
      {activeTab === 'budget' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {/* Current Budget */}
          {currentBudget && currentBudget.budget > 0 && (
            <div className="card" style={{ padding: '24px', marginBottom: '20px', maxWidth: '500px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px' }}>Current Month's Budget</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div><p style={{ fontSize: '11px', color: 'var(--text-light)' }}>Budget</p><p style={{ fontWeight: 800, fontSize: '20px' }}>${currentBudget.budget.toFixed(2)}</p></div>
                <div><p style={{ fontSize: '11px', color: 'var(--text-light)' }}>Spent</p><p style={{ fontWeight: 800, fontSize: '20px', color: currentBudget.isOverBudget ? 'var(--danger)' : 'var(--text)' }}>${currentBudget.spent.toFixed(2)}</p></div>
                <div><p style={{ fontSize: '11px', color: 'var(--text-light)' }}>Remaining</p><p style={{ fontWeight: 800, fontSize: '20px', color: currentBudget.isOverBudget ? 'var(--danger)' : 'var(--success)' }}>${Math.abs(currentBudget.remaining).toFixed(2)}</p></div>
              </div>
            </div>
          )}
          {/* Set Budget */}
          <div className="card" style={{ padding: '24px', maxWidth: '500px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px' }}>Set Monthly Budget</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={labelStyle}>Month</label>
                <select style={{ ...inputStyle, cursor: 'pointer' }} value={budget.month}
                  onChange={e => setBudget({ ...budget, month: parseInt(e.target.value) })}>
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>{new Date(2024, i).toLocaleString('default', { month: 'long' })}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Year</label>
                <input style={inputStyle} type="number" value={budget.year}
                  onChange={e => setBudget({ ...budget, year: parseInt(e.target.value) })} />
              </div>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Budget Amount ($)</label>
              <input style={inputStyle} type="number" value={budget.amount} placeholder="500"
                onChange={e => setBudget({ ...budget, amount: e.target.value })} />
            </div>
            <button onClick={saveBudget} className="btn-primary" disabled={loading}>
              {loading ? <Spinner size={16} color="white" /> : '💰'} Save Budget
            </button>
          </div>
        </motion.div>
      )}

      {/* Challenges Tab */}
      {activeTab === 'challenges' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {/* Create Challenge */}
          <div className="card" style={{ padding: '24px', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px' }}>
              <HiOutlinePlus size={16} style={{ display: 'inline', verticalAlign: 'middle' }} /> Create Challenge
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={labelStyle}>Title</label>
                <input style={inputStyle} value={newChallenge.title}
                  onChange={e => setNewChallenge({ ...newChallenge, title: e.target.value })}
                  placeholder="e.g., Spend under $400" />
              </div>
              <div>
                <label style={labelStyle}>Target Amount ($)</label>
                <input style={inputStyle} type="number" value={newChallenge.targetAmount}
                  onChange={e => setNewChallenge({ ...newChallenge, targetAmount: e.target.value })}
                  placeholder="400" />
              </div>
              <div>
                <label style={labelStyle}>End Date</label>
                <input style={inputStyle} type="date" value={newChallenge.endDate}
                  onChange={e => setNewChallenge({ ...newChallenge, endDate: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Category (optional)</label>
                <input style={inputStyle} value={newChallenge.category}
                  onChange={e => setNewChallenge({ ...newChallenge, category: e.target.value })}
                  placeholder="e.g., Restaurant" />
              </div>
            </div>
            <button onClick={createChallenge} className="btn-primary">🎯 Create Challenge</button>
          </div>

          {/* Challenge List */}
          {challenges.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '36px', marginBottom: '12px' }}>🎯</p>
              <p>No challenges yet. Create your first spending challenge!</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
              {challenges.map((c, i) => (
                <ChallengeCard key={c._id} challenge={c} onDelete={deleteChallenge} index={i} />
              ))}
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
