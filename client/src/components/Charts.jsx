// ============================================
// KhataSnap AI — Charts Component (Indigo Modern SaaS Palette)
// ============================================

import { motion } from 'framer-motion';
import {
  LineChart, Line, PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const COLORS = [
  '#4F46E5', // Indigo Primary
  '#10B981', // Emerald Green
  '#7C3AED', // Vivid Violet
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#0EA5E9', // Sky Blue
  '#8B5CF6', // Purple
  '#6366F1'  // Soft Indigo
];

const tooltipStyle = {
  background: '#FFFFFF',
  border: '1px solid #E2E8F0',
  borderRadius: '12px',
  padding: '12px 16px',
  boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)',
  fontSize: '13px',
  fontFamily: 'Inter, sans-serif'
};

export function MonthlyLineChart({ data = [] }) {
  const chartData = data.map(d => ({
    name: new Date(d._id.year, d._id.month - 1).toLocaleString('default', { month: 'short' }),
    amount: Math.round(d.total * 100) / 100,
    receipts: d.count
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
      style={{ padding: '24px' }}
    >
      <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px', color: 'var(--text)' }}>
        Monthly Expenses
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
          <XAxis dataKey="name" fontSize={12} tick={{ fill: '#64748B' }} />
          <YAxis fontSize={12} tick={{ fill: '#64748B' }} tickFormatter={v => `$${v}`} />
          <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`$${v}`, 'Amount']} />
          <Line type="monotone" dataKey="amount" stroke="#4F46E5" strokeWidth={3.5}
            dot={{ fill: '#4F46E5', r: 5, strokeWidth: 2, stroke: 'white' }}
            activeDot={{ r: 8, fill: '#7C3AED' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

export function CategoryPieChart({ data = [] }) {
  const chartData = data.map(d => ({
    name: d._id, value: Math.round(d.total * 100) / 100
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
      style={{ padding: '24px' }}
    >
      <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px', color: 'var(--text)' }}>
        Spending by Category
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie data={chartData} cx="50%" cy="50%" innerRadius={65} outerRadius={100}
            dataKey="value" paddingAngle={4} stroke="none"
          >
            {chartData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} formatter={(v) => `$${v}`} />
          <Legend iconType="circle" iconSize={8}
            formatter={(value) => <span style={{ fontSize: '12px', color: '#64748B' }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

export function VendorBarChart({ data = [] }) {
  const chartData = data.slice(0, 8).map(d => ({
    name: d._id?.length > 12 ? d._id.substring(0, 12) + '...' : d._id,
    amount: Math.round(d.total * 100) / 100
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
      style={{ padding: '24px' }}
    >
      <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px', color: 'var(--text)' }}>
        Top Vendors
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
          <XAxis type="number" fontSize={12} tick={{ fill: '#64748B' }} tickFormatter={v => `$${v}`} />
          <YAxis type="category" dataKey="name" fontSize={12} tick={{ fill: '#64748B' }} width={100} />
          <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`$${v}`, 'Spent']} />
          <Bar dataKey="amount" fill="#4F46E5" radius={[0, 8, 8, 0]} barSize={22} />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

export function BudgetProgressChart({ budget = 0, spent = 0 }) {
  const percentage = budget > 0 ? Math.min(Math.round((spent / budget) * 100), 100) : 0;
  const remaining = Math.max(budget - spent, 0);
  const isOver = spent > budget && budget > 0;

  const data = [
    { name: 'Spent', value: Math.min(spent, budget) },
    { name: 'Remaining', value: remaining }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
      style={{ padding: '24px', textAlign: 'center' }}
    >
      <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', color: 'var(--text)' }}>
        Budget Progress
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={65} outerRadius={85}
            dataKey="value" startAngle={90} endAngle={-270} stroke="none"
          >
            <Cell fill={isOver ? '#EF4444' : '#4F46E5'} />
            <Cell fill="#E2E8F0" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div style={{ marginTop: '-120px', position: 'relative', zIndex: 1 }}>
        <p style={{ fontSize: '32px', fontWeight: 800, color: isOver ? 'var(--danger)' : 'var(--text)' }}>
          {percentage}%
        </p>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          ${spent.toFixed(2)} of ${budget.toFixed(2)}
        </p>
      </div>
    </motion.div>
  );
}
