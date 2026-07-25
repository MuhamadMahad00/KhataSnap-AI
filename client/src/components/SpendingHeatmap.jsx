// ============================================
// KhataSnap AI — Spending Heatmap Component (Indigo SaaS Palette)
// ============================================

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function SpendingHeatmap({ data = [] }) {
  const [tooltip, setTooltip] = useState(null);

  const dataMap = {};
  data.forEach(d => {
    dataMap[d._id] = { total: d.total, count: d.count };
  });

  const maxSpending = Math.max(...data.map(d => d.total), 1);

  const days = [];
  const today = new Date();
  for (let i = 364; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    days.push({
      date: dateStr,
      day: date.getDay(),
      ...dataMap[dateStr]
    });
  }

  const weeks = [];
  let currentWeek = [];
  days.forEach((day, i) => {
    currentWeek.push(day);
    if (day.day === 6 || i === days.length - 1) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  // Color intensity gradient using palette:
  // Level 0: #E2E8F0 (Empty/Lightest)
  // Level 1: #C7D2FE (Soft Indigo)
  // Level 2: #818CF8 (Medium Indigo)
  // Level 3: #6366F1 (Vivid Indigo)
  // Level 4: #4F46E5 (Deep Indigo)
  const getColor = (total) => {
    if (!total || total === 0) return '#E2E8F0';
    const intensity = total / maxSpending;
    if (intensity < 0.25) return '#C7D2FE';
    if (intensity < 0.5) return '#818CF8';
    if (intensity < 0.75) return '#6366F1';
    return '#4F46E5';
  };

  const dayLabels = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
      style={{ padding: '24px', overflow: 'hidden' }}
    >
      <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', color: 'var(--text)' }}>
        Spending Heatmap
      </h3>

      <div style={{ overflowX: 'auto', position: 'relative' }}>
        <div style={{ display: 'flex', gap: '3px', minWidth: 'fit-content' }}>
          {/* Day labels */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginRight: '4px', paddingTop: '0' }}>
            {dayLabels.map((label, i) => (
              <div key={i} style={{
                width: '28px', height: '14px', fontSize: '10px',
                color: 'var(--text-light)', display: 'flex', alignItems: 'center'
              }}>
                {label}
              </div>
            ))}
          </div>

          {/* Heatmap grid */}
          {weeks.map((week, wi) => (
            <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {Array.from({ length: 7 }).map((_, di) => {
                const day = week.find(d => d.day === di);
                if (!day) return <div key={di} style={{ width: '14px', height: '14px' }} />;
                return (
                  <div
                    key={di}
                    onMouseEnter={(e) => setTooltip({
                      date: day.date, total: day.total || 0, count: day.count || 0,
                      x: e.clientX, y: e.clientY
                    })}
                    onMouseLeave={() => setTooltip(null)}
                    style={{
                      width: '14px', height: '14px',
                      borderRadius: '3px',
                      background: getColor(day.total),
                      cursor: 'pointer',
                      transition: 'transform 0.1s',
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '12px', justifyContent: 'flex-end' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-light)', marginRight: '4px' }}>Less</span>
          {['#E2E8F0', '#C7D2FE', '#818CF8', '#6366F1', '#4F46E5'].map((color, i) => (
            <div key={i} style={{ width: '14px', height: '14px', borderRadius: '3px', background: color }} />
          ))}
          <span style={{ fontSize: '11px', color: 'var(--text-light)', marginLeft: '4px' }}>More</span>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div style={{
          position: 'fixed', left: tooltip.x + 10, top: tooltip.y - 60,
          background: 'white', border: '1px solid var(--border)',
          borderRadius: '8px', padding: '8px 12px', fontSize: '12px',
          boxShadow: 'var(--shadow-lg)', zIndex: 100, pointerEvents: 'none'
        }}>
          <p style={{ fontWeight: 600, marginBottom: '2px' }}>{tooltip.date}</p>
          <p style={{ color: 'var(--text-muted)' }}>
            ${tooltip.total.toFixed(2)} • {tooltip.count} receipt{tooltip.count !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </motion.div>
  );
}
