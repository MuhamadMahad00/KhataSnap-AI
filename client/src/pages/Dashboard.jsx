// ============================================
// KhataSnap AI — Dashboard Page (Indigo Modern SaaS Palette)
// ============================================

import { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  HiOutlineCurrencyDollar, HiOutlineCalendar, HiOutlineClipboardList,
  HiOutlineTrendingUp, HiOutlineShoppingCart, HiOutlineTag,
  HiOutlineChartBar, HiOutlineClock, HiOutlineUpload, HiOutlineSparkles
} from 'react-icons/hi';
import { AuthContext } from '../App';
import { receiptAPI, budgetAPI, aiAPI } from '../services/api';
import StatCard from '../components/StatCard';
import BudgetTracker from '../components/BudgetTracker';
import { MonthlyLineChart, CategoryPieChart, VendorBarChart } from '../components/Charts';
import SpendingHeatmap from '../components/SpendingHeatmap';
import FinancialScore from '../components/FinancialScore';
import MonthlyComparison from '../components/MonthlyComparison';
import { SkeletonCard } from '../components/LoadingStates';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06
    }
  }
};

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [budget, setBudget] = useState(null);
  const [heatmap, setHeatmap] = useState([]);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [statsRes, budgetRes, heatmapRes] = await Promise.all([
        receiptAPI.getStats(),
        budgetAPI.getCurrent(),
        receiptAPI.getHeatmap()
      ]);
      setStats(statsRes.data.data);
      setBudget(budgetRes.data.data);
      setHeatmap(heatmapRes.data.data);

      aiAPI.getInsights().then(res => setInsights(res.data.data)).catch(() => {});
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '8px' }}>
        <div style={{ height: '140px', background: 'var(--border-light)', borderRadius: 'var(--radius)', marginBottom: '24px' }} className="skeleton" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
          <SkeletonCard count={8} />
        </div>
      </div>
    );
  }

  const statCards = [
    { title: 'Total Expenses', value: `$${(stats?.totalExpenses || 0).toFixed(2)}`, icon: HiOutlineCurrencyDollar, color: '#4F46E5' },
    { title: 'This Month', value: `$${(stats?.monthlyExpenses || 0).toFixed(2)}`, icon: HiOutlineCalendar, color: '#7C3AED' },
    { title: "Today's Spending", value: `$${(stats?.todayExpenses || 0).toFixed(2)}`, icon: HiOutlineClock, color: '#10B981' },
    { title: 'This Week', value: `$${(stats?.weeklyExpenses || 0).toFixed(2)}`, icon: HiOutlineTrendingUp, color: '#F59E0B' },
    { title: 'Total Receipts', value: stats?.receiptCount || 0, icon: HiOutlineClipboardList, color: '#4F46E5' },
    { title: 'Avg Receipt', value: `$${(stats?.averageReceipt || 0).toFixed(2)}`, icon: HiOutlineChartBar, color: '#7C3AED' },
    { title: 'Top Vendor', value: stats?.topVendor || 'N/A', icon: HiOutlineShoppingCart, color: '#EC4899' },
    { title: 'Top Category', value: stats?.topCategory || 'N/A', icon: HiOutlineTag, color: '#0EA5E9' }
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 50%, #4338CA 100%)',
          borderRadius: 'var(--radius-lg)',
          padding: '32px 36px',
          marginBottom: '28px',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 16px 36px rgba(15, 23, 42, 0.25)'
        }}
      >
        <div style={{
          position: 'absolute', top: '-40%', right: '-10%',
          width: '350px', height: '350px', borderRadius: '50%',
          background: 'rgba(124, 58, 237, 0.3)', filter: 'blur(60px)', pointerEvents: 'none'
        }} />

        <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '4px 14px', borderRadius: '100px',
              background: 'rgba(255, 255, 255, 0.15)', fontSize: '12px',
              fontWeight: 600, marginBottom: '12px', backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.25)'
            }}>
              <HiOutlineSparkles size={14} /> AI Financial Ledger
            </span>
            <h1 style={{ fontSize: '28px', fontWeight: 800, lineHeight: 1.2, marginBottom: '6px' }}>
              Welcome back, {user?.name || 'User'} 👋
            </h1>
            <p style={{ fontSize: '14px', opacity: 0.9, maxWidth: '520px' }}>
              Here is your expense overview. Upload a receipt or let AI summarize your monthly budget.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link to="/upload" style={{ textDecoration: 'none' }}>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.96 }}
                style={{
                  background: 'white', color: 'var(--primary)', border: 'none',
                  padding: '12px 22px', borderRadius: 'var(--radius-sm)',
                  fontWeight: 700, fontSize: '14px', cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.15)', fontFamily: 'Inter, sans-serif'
                }}
              >
                <HiOutlineUpload size={18} /> Quick Upload
              </motion.button>
            </Link>
            <Link to="/receipts" style={{ textDecoration: 'none' }}>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.96 }}
                style={{
                  background: 'rgba(255, 255, 255, 0.18)', color: 'white', border: '1px solid rgba(255, 255, 255, 0.35)',
                  padding: '12px 22px', borderRadius: 'var(--radius-sm)',
                  fontWeight: 600, fontSize: '14px', cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  backdropFilter: 'blur(8px)', fontFamily: 'Inter, sans-serif'
                }}
              >
                <HiOutlineSparkles size={18} /> Smart Search
              </motion.button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        {statCards.map((card, i) => (
          <StatCard key={i} {...card} index={i} />
        ))}
      </div>

      {/* Budget Tracker */}
      {budget && (
        <div style={{ marginBottom: '28px' }}>
          <BudgetTracker {...budget} />
        </div>
      )}

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        <MonthlyLineChart data={stats?.monthlyTrend || []} />
        <CategoryPieChart data={stats?.categoryBreakdown || []} />
      </div>

      {/* Vendor Chart + Financial Score */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        <VendorBarChart data={stats?.vendorBreakdown || []} />
        <FinancialScore />
      </div>

      {/* Monthly Comparison */}
      <div style={{ marginBottom: '28px' }}>
        <MonthlyComparison />
      </div>

      {/* Spending Heatmap */}
      <div style={{ marginBottom: '28px' }}>
        <SpendingHeatmap data={heatmap} />
      </div>

      {/* AI Insights Card */}
      {insights && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
          style={{ padding: '28px', marginBottom: '28px', borderLeft: '4px solid var(--primary)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'var(--primary-light)', color: 'var(--primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <HiOutlineSparkles size={20} />
            </div>
            <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text)' }}>🤖 AI Financial Insights</h3>
          </div>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '20px' }}>
            {insights.summary}
          </p>
          {insights.tips?.length > 0 && (
            <div style={{ marginBottom: '16px', background: 'var(--primary-light)', padding: '16px', borderRadius: 'var(--radius-sm)' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, marginBottom: '10px', color: 'var(--primary)' }}>💡 Key Tips</p>
              {insights.tips.map((tip, i) => (
                <p key={i} style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px', paddingLeft: '8px' }}>• {tip}</p>
              ))}
            </div>
          )}
          {insights.savingSuggestions?.length > 0 && (
            <div style={{ background: 'var(--background)', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, marginBottom: '10px', color: 'var(--text)' }}>💰 Saving Opportunities</p>
              {insights.savingSuggestions.map((s, i) => (
                <p key={i} style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px', paddingLeft: '8px' }}>• {s}</p>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
