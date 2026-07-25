// ============================================
// KhataSnap AI — Loading States
// ============================================
// Skeleton loaders, spinners, and scanning animations.

import { motion } from 'framer-motion';

export function SkeletonCard({ count = 1 }) {
  return Array.from({ length: count }).map((_, i) => (
    <div key={i} className="card" style={{ padding: '24px' }}>
      <div className="skeleton" style={{ height: '14px', width: '40%', marginBottom: '12px' }} />
      <div className="skeleton" style={{ height: '28px', width: '60%', marginBottom: '8px' }} />
      <div className="skeleton" style={{ height: '12px', width: '30%' }} />
    </div>
  ));
}

export function SkeletonRow({ count = 3 }) {
  return Array.from({ length: count }).map((_, i) => (
    <div key={i} style={{ display: 'flex', gap: '16px', padding: '16px 0', borderBottom: '1px solid var(--border-light)' }}>
      <div className="skeleton" style={{ height: '16px', width: '25%' }} />
      <div className="skeleton" style={{ height: '16px', width: '20%' }} />
      <div className="skeleton" style={{ height: '16px', width: '15%' }} />
      <div className="skeleton" style={{ height: '16px', width: '10%' }} />
    </div>
  ));
}

export function Spinner({ size = 20, color = 'var(--primary)' }) {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      style={{
        width: size, height: size,
        border: `2.5px solid ${color}25`,
        borderTop: `2.5px solid ${color}`,
        borderRadius: '50%'
      }}
    />
  );
}

export function ButtonSpinner() {
  return (
    <Spinner size={16} color="white" />
  );
}

export function ScannerAnimation() {
  return (
    <motion.div
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', padding: '56px 24px', gap: '24px'
      }}
    >
      {/* Scanner Icon */}
      <div style={{ position: 'relative', width: '130px', height: '130px' }}>
        {/* Receipt outline */}
        <motion.div
          style={{
            width: '90px', height: '110px', border: '3px solid #778873',
            borderRadius: '14px', position: 'absolute',
            top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            background: 'rgba(255,255,255,0.8)'
          }}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        {/* Scanning line */}
        <motion.div
          style={{
            width: '80px', height: '3px', background: '#A1BC98',
            borderRadius: '100px', position: 'absolute',
            left: '50%', transform: 'translateX(-50%)',
            boxShadow: '0 0 14px rgba(161, 188, 152, 0.8)'
          }}
          animate={{ top: ['18%', '78%', '18%'] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Corner markers */}
        {[
          { top: '8px', left: '8px', borderTop: '3px solid #778873', borderLeft: '3px solid #778873' },
          { top: '8px', right: '8px', borderTop: '3px solid #778873', borderRight: '3px solid #778873' },
          { bottom: '8px', left: '8px', borderBottom: '3px solid #778873', borderLeft: '3px solid #778873' },
          { bottom: '8px', right: '8px', borderBottom: '3px solid #778873', borderRight: '3px solid #778873' }
        ].map((style, i) => (
          <motion.div
            key={i}
            style={{ position: 'absolute', width: '22px', height: '22px', borderRadius: '4px', ...style }}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>

      <div style={{ textAlign: 'center' }}>
        <motion.p
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ fontSize: '17px', fontWeight: 800, color: '#778873', marginBottom: '6px' }}
        >
          Groq Vision AI is analyzing receipt...
        </motion.p>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Extracting items, vendors, tax, totals & spending category
        </p>
      </div>
    </motion.div>
  );
}

export function PageLoader() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '60vh', flexDirection: 'column', gap: '16px'
    }}>
      <Spinner size={44} color="#778873" />
      <p style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 600 }}>Loading KhataSnap AI...</p>
    </div>
  );
}
