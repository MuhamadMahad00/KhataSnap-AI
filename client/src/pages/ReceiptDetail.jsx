// ============================================
// KhataSnap AI — Receipt Detail Page
// ============================================
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlinePencil, HiOutlineTrash, HiOutlineArrowLeft, HiOutlineTag, HiOutlineCalendar } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { receiptAPI } from '../services/api';
import ReceiptEditor from '../components/ReceiptEditor';
import { PageLoader } from '../components/LoadingStates';

export default function ReceiptDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    receiptAPI.getById(id).then(res => setReceipt(res.data.data))
      .catch(() => { toast.error('Receipt not found'); navigate('/receipts'); })
      .finally(() => setLoading(false));
  }, [id]);

  const handleUpdate = async (formData) => {
    setSaving(true);
    try {
      const res = await receiptAPI.update(id, formData);
      setReceipt(res.data.data);
      setEditing(false);
      toast.success('Receipt updated!');
    } catch (err) {
      toast.error('Failed to update receipt');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this receipt? This cannot be undone.')) return;
    try {
      await receiptAPI.delete(id);
      toast.success('Receipt deleted');
      navigate('/receipts');
    } catch (err) {
      toast.error('Failed to delete receipt');
    }
  };

  if (loading) return <PageLoader />;
  if (!receipt) return null;

  const date = new Date(receipt.date).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  if (editing) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <button onClick={() => setEditing(false)} className="btn-secondary" style={{ marginBottom: '16px' }}>
          <HiOutlineArrowLeft size={16} /> Cancel Edit
        </button>
        <ReceiptEditor data={receipt} onSave={handleUpdate} loading={saving} />
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <button onClick={() => navigate('/receipts')} className="btn-secondary">
          <HiOutlineArrowLeft size={16} /> Back
        </button>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setEditing(true)} className="btn-secondary">
            <HiOutlinePencil size={16} /> Edit
          </button>
          <button onClick={handleDelete} className="btn-danger">
            <HiOutlineTrash size={16} /> Delete
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: receipt.imagePath ? '1fr 1.5fr' : '1fr', gap: '24px', alignItems: 'start' }}>
        {/* Receipt Image */}
        {receipt.imagePath && (
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            className="card" style={{ padding: '20px', position: 'sticky', top: '88px' }}>
            <img src={receipt.imagePath} alt="Receipt"
              style={{ width: '100%', borderRadius: '10px', border: '1px solid var(--border)' }} />
          </motion.div>
        )}

        {/* Receipt Details */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="card" style={{ padding: '28px' }}>
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '8px' }}>{receipt.vendor}</h2>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: 'var(--text-muted)' }}>
                <HiOutlineCalendar size={14} /> {date}
              </span>
              <span className="badge badge-primary">{receipt.category}</span>
              {receipt.confidenceScore > 0 && <span className="badge badge-success">{receipt.confidenceScore}% confidence</span>}
            </div>
          </div>

          {/* Items Table */}
          {receipt.items?.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}>Items</h4>
              <div style={{ border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', padding: '10px 14px', background: '#F8FAFC', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>
                  <span>Item</span><span>Qty</span><span>Price</span><span>Discount</span>
                </div>
                {receipt.items.map((item, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', padding: '10px 14px', borderTop: '1px solid var(--border-light)', fontSize: '13px' }}>
                    <span style={{ fontWeight: 500 }}>{item.name}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{item.quantity}</span>
                    <span>${item.price?.toFixed(2)}</span>
                    <span style={{ color: 'var(--text-muted)' }}>${item.discount?.toFixed(2) || '0.00'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Totals */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px', marginBottom: '20px', padding: '16px', background: '#F8FAFC', borderRadius: '10px' }}>
            <div><p style={{ fontSize: '11px', color: 'var(--text-light)' }}>Subtotal</p><p style={{ fontWeight: 700 }}>${receipt.subtotal?.toFixed(2)}</p></div>
            <div><p style={{ fontSize: '11px', color: 'var(--text-light)' }}>Tax</p><p style={{ fontWeight: 700 }}>${receipt.tax?.toFixed(2)}</p></div>
            <div><p style={{ fontSize: '11px', color: 'var(--text-light)' }}>Discount</p><p style={{ fontWeight: 700 }}>${receipt.discount?.toFixed(2)}</p></div>
            <div><p style={{ fontSize: '11px', color: 'var(--text-light)' }}>Total</p><p style={{ fontWeight: 800, fontSize: '18px', color: 'var(--primary)' }}>{receipt.currency} {receipt.total?.toFixed(2)}</p></div>
          </div>

          {/* Meta */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
            {receipt.receiptNumber && <div><p style={{ fontSize: '11px', color: 'var(--text-light)' }}>Receipt #</p><p style={{ fontSize: '13px', fontWeight: 600 }}>{receipt.receiptNumber}</p></div>}
            {receipt.paymentMethod && <div><p style={{ fontSize: '11px', color: 'var(--text-light)' }}>Payment</p><p style={{ fontSize: '13px', fontWeight: 600 }}>{receipt.paymentMethod}</p></div>}
            <div><p style={{ fontSize: '11px', color: 'var(--text-light)' }}>Currency</p><p style={{ fontSize: '13px', fontWeight: 600 }}>{receipt.currency}</p></div>
          </div>

          {/* Tags */}
          {receipt.tags?.length > 0 && (
            <div>
              <p style={{ fontSize: '11px', color: 'var(--text-light)', marginBottom: '8px' }}>Tags</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {receipt.tags.map((tag, i) => (
                  <span key={i} className="badge badge-primary"><HiOutlineTag size={10} /> {tag}</span>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
