// ============================================
// KhataSnap AI — Receipt Editor Component
// ============================================
// Editable form for AI-extracted receipt data before saving.

import { useState } from 'react';
import { motion } from 'framer-motion';
import { HiOutlinePlus, HiOutlineTrash } from 'react-icons/hi';

const CATEGORIES = [
  'Groceries', 'Food', 'Restaurant', 'Transport', 'Shopping',
  'Medical', 'Office', 'Education', 'Entertainment', 'Travel',
  'Utilities', 'Electronics', 'Fuel', 'Personal', 'Business', 'Other'
];

export default function ReceiptEditor({ data, onSave, loading }) {
  const [form, setForm] = useState({
    vendor: data?.vendor || '',
    date: data?.date || new Date().toISOString().split('T')[0],
    currency: data?.currency || 'USD',
    receiptNumber: data?.receiptNumber || '',
    items: data?.items || [{ name: '', quantity: 1, price: 0, discount: 0 }],
    subtotal: data?.subtotal || 0,
    tax: data?.tax || 0,
    discount: data?.discount || 0,
    total: data?.total || 0,
    paymentMethod: data?.paymentMethod || '',
    category: data?.category || 'Other',
    tags: data?.tags || [],
    confidenceScore: data?.confidenceScore || 0,
    imagePath: data?.imagePath || '',
    notes: ''
  });

  const [tagInput, setTagInput] = useState('');

  const updateField = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const updateItem = (index, field, value) => {
    const items = [...form.items];
    items[index] = { ...items[index], [field]: field === 'name' ? value : parseFloat(value) || 0 };
    setForm(prev => ({ ...prev, items }));
  };

  const addItem = () => {
    setForm(prev => ({
      ...prev,
      items: [...prev.items, { name: '', quantity: 1, price: 0, discount: 0 }]
    }));
  };

  const removeItem = (index) => {
    setForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const addTag = () => {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
      setForm(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
      setTagInput('');
    }
  };

  const removeTag = (tag) => {
    setForm(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  const inputStyle = {
    width: '100%', padding: '8px 12px', border: '1.5px solid var(--border)',
    borderRadius: '8px', fontSize: '13px', fontFamily: 'Inter, sans-serif',
    color: 'var(--text)', outline: 'none', transition: 'var(--transition)'
  };

  const labelStyle = {
    fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)',
    marginBottom: '4px', display: 'block'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
      style={{ padding: '28px' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Review & Edit Receipt</h3>
        {form.confidenceScore > 0 && (
          <span className="badge badge-primary">
            {form.confidenceScore}% Confidence
          </span>
        )}
      </div>

      {/* Vendor & Date Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <div>
          <label style={labelStyle}>Vendor</label>
          <input style={inputStyle} value={form.vendor}
            onChange={e => updateField('vendor', e.target.value)} placeholder="Store name" />
        </div>
        <div>
          <label style={labelStyle}>Date</label>
          <input style={inputStyle} type="date" value={form.date}
            onChange={e => updateField('date', e.target.value)} />
        </div>
      </div>

      {/* Currency, Receipt#, Payment, Category Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <div>
          <label style={labelStyle}>Currency</label>
          <input style={inputStyle} value={form.currency}
            onChange={e => updateField('currency', e.target.value)} placeholder="USD" />
        </div>
        <div>
          <label style={labelStyle}>Receipt #</label>
          <input style={inputStyle} value={form.receiptNumber}
            onChange={e => updateField('receiptNumber', e.target.value)} placeholder="Optional" />
        </div>
        <div>
          <label style={labelStyle}>Payment Method</label>
          <input style={inputStyle} value={form.paymentMethod}
            onChange={e => updateField('paymentMethod', e.target.value)} placeholder="Cash/Card" />
        </div>
        <div>
          <label style={labelStyle}>Category</label>
          <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.category}
            onChange={e => updateField('category', e.target.value)}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Items Table */}
      <div style={{ marginBottom: '16px' }}>
        <label style={labelStyle}>Items</label>
        <div style={{ border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
          {/* Header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 40px',
            gap: '8px', padding: '10px 14px', background: '#F8FAFC',
            fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)'
          }}>
            <span>Item Name</span>
            <span>Qty</span>
            <span>Price</span>
            <span>Discount</span>
            <span></span>
          </div>
          {/* Rows */}
          {form.items.map((item, i) => (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 40px',
              gap: '8px', padding: '8px 14px', borderTop: '1px solid var(--border-light)',
              alignItems: 'center'
            }}>
              <input style={{ ...inputStyle, padding: '6px 8px' }} value={item.name}
                onChange={e => updateItem(i, 'name', e.target.value)} placeholder="Item name" />
              <input style={{ ...inputStyle, padding: '6px 8px' }} type="number" value={item.quantity}
                onChange={e => updateItem(i, 'quantity', e.target.value)} min="1" />
              <input style={{ ...inputStyle, padding: '6px 8px' }} type="number" value={item.price}
                onChange={e => updateItem(i, 'price', e.target.value)} step="0.01" />
              <input style={{ ...inputStyle, padding: '6px 8px' }} type="number" value={item.discount}
                onChange={e => updateItem(i, 'discount', e.target.value)} step="0.01" />
              <button onClick={() => removeItem(i)} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--danger)', padding: '4px'
              }}>
                <HiOutlineTrash size={16} />
              </button>
            </div>
          ))}
        </div>
        <button onClick={addItem} style={{
          display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px',
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--primary)', fontSize: '13px', fontWeight: 600,
          fontFamily: 'Inter, sans-serif'
        }}>
          <HiOutlinePlus size={16} /> Add Item
        </button>
      </div>

      {/* Totals */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <div>
          <label style={labelStyle}>Subtotal</label>
          <input style={inputStyle} type="number" value={form.subtotal}
            onChange={e => updateField('subtotal', parseFloat(e.target.value) || 0)} step="0.01" />
        </div>
        <div>
          <label style={labelStyle}>Tax</label>
          <input style={inputStyle} type="number" value={form.tax}
            onChange={e => updateField('tax', parseFloat(e.target.value) || 0)} step="0.01" />
        </div>
        <div>
          <label style={labelStyle}>Discount</label>
          <input style={inputStyle} type="number" value={form.discount}
            onChange={e => updateField('discount', parseFloat(e.target.value) || 0)} step="0.01" />
        </div>
        <div>
          <label style={labelStyle}>Total</label>
          <input style={{ ...inputStyle, fontWeight: 700, fontSize: '15px' }} type="number" value={form.total}
            onChange={e => updateField('total', parseFloat(e.target.value) || 0)} step="0.01" />
        </div>
      </div>

      {/* Tags */}
      <div style={{ marginBottom: '20px' }}>
        <label style={labelStyle}>Tags</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
          {form.tags.map((tag, i) => (
            <span key={i} className="badge badge-primary" style={{ cursor: 'pointer' }} onClick={() => removeTag(tag)}>
              {tag} ×
            </span>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input style={{ ...inputStyle, flex: 1 }} value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
            placeholder="Add a tag and press Enter" />
        </div>
      </div>

      {/* Notes */}
      <div style={{ marginBottom: '20px' }}>
        <label style={labelStyle}>Notes (optional)</label>
        <textarea style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }} value={form.notes}
          onChange={e => updateField('notes', e.target.value)} placeholder="Add any notes..." />
      </div>

      {/* Save Button */}
      <button
        onClick={() => onSave(form)}
        disabled={loading}
        className="btn-primary"
        style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '15px' }}
      >
        {loading ? 'Saving...' : '💾 Save Receipt'}
      </button>
    </motion.div>
  );
}
