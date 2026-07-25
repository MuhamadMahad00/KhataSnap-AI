// ============================================
// KhataSnap AI — Enhanced StatCard Component
// ============================================
// Animated statistic card with spring motion & visual glow.

import { motion } from 'framer-motion';

export default function StatCard({ title, value, subtitle, icon: Icon, color = '#778873', index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay: index * 0.04,
        type: 'spring',
        stiffness: 260,
        damping: 20
      }}
      whileHover={{
        y: -5,
        scale: 1.02,
        boxShadow: '0 12px 30px -5px rgba(119, 136, 115, 0.18)'
      }}
      style={{
        background: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(12px)',
        borderRadius: 'var(--radius)',
        padding: '24px',
        border: '1px solid var(--border-light)',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Decorative background glow circle */}
      <div style={{
        position: 'absolute',
        top: '-20px',
        right: '-20px',
        width: '90px',
        height: '90px',
        borderRadius: '50%',
        background: `${color}15`,
        filter: 'blur(20px)',
        pointerEvents: 'none'
      }} />

      <div>
        <p style={{
          fontSize: '12px',
          fontWeight: 600,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginBottom: '8px'
        }}>
          {title}
        </p>
        <p style={{
          fontSize: '28px',
          fontWeight: 800,
          color: 'var(--text)',
          lineHeight: 1.1,
          fontFeatureSettings: '"cv02", "cv03", "cv04"'
        }}>
          {value}
        </p>
        {subtitle && (
          <p style={{
            fontSize: '12px',
            fontWeight: 500,
            color: 'var(--text-light)',
            marginTop: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            {subtitle}
          </p>
        )}
      </div>

      {Icon && (
        <motion.div
          whileHover={{ rotate: 10, scale: 1.1 }}
          transition={{ type: 'spring', stiffness: 300 }}
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            background: `linear-gradient(135deg, ${color}20, ${color}10)`,
            border: `1px solid ${color}30`,
            color: color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: `0 4px 14px ${color}20`
          }}
        >
          <Icon size={24} />
        </motion.div>
      )}
    </motion.div>
  );
}
