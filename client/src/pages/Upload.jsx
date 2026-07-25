// ============================================
// KhataSnap AI — Animated Upload Page with Sample Receipt
// ============================================

import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineUpload, HiOutlinePhotograph, HiOutlineCamera, HiOutlineX, HiOutlineSparkles, HiOutlineDocumentSearch } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { receiptAPI } from '../services/api';
import ReceiptEditor from '../components/ReceiptEditor';
import { ScannerAnimation } from '../components/LoadingStates';

export default function Upload() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [scanning, setScanning] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = (selectedFile) => {
    if (!selectedFile) return;
    const validTypes = ['image/png', 'image/jpg', 'image/jpeg'];
    if (!validTypes.includes(selectedFile.type)) {
      toast.error('Only PNG, JPG, and JPEG images are allowed');
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setExtractedData(null);
  };

  const loadSampleReceipt = async () => {
    try {
      const res = await fetch('/sample_receipt.png');
      const blob = await res.blob();
      const sampleFile = new File([blob], 'sample_grocery_receipt.png', { type: 'image/png' });
      setFile(sampleFile);
      setPreview('/sample_receipt.png');
      setExtractedData(null);
      toast.success('Sample receipt loaded! Click "Analyze with Groq AI" to test scanning.');
    } catch (err) {
      toast.error('Failed to load sample receipt image');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    handleFile(droppedFile);
  };

  const scanReceipt = async () => {
    if (!file) return;
    setScanning(true);
    try {
      const formData = new FormData();
      formData.append('receipt', file);
      const res = await receiptAPI.scan(formData);
      setExtractedData(res.data.data);
      toast.success('Receipt analyzed by Groq Cloud AI!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to scan receipt');
    } finally {
      setScanning(false);
    }
  };

  const saveReceipt = async (formData) => {
    setSaving(true);
    try {
      await receiptAPI.save(formData);
      toast.success('Receipt saved to ledger!');
      navigate('/receipts');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save receipt');
    } finally {
      setSaving(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreview('');
    setExtractedData(null);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text)' }}>Upload Receipt</h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
          Scan receipts using Groq Cloud Vision AI for instant itemized extraction
        </p>
      </div>

      {/* Upload Zone */}
      {!extractedData && !scanning && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card"
          style={{ padding: '36px', marginBottom: '24px' }}
        >
          {!file ? (
            <motion.div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              whileHover={{ scale: 1.01 }}
              style={{
                border: `2px dashed ${dragOver ? 'var(--primary)' : 'var(--border)'}`,
                borderRadius: 'var(--radius-lg)', padding: '56px 24px', textAlign: 'center',
                cursor: 'pointer', transition: 'var(--transition-spring)',
                background: dragOver ? 'var(--primary-light)' : 'rgba(253, 246, 237, 0.5)',
                boxShadow: dragOver ? '0 0 25px rgba(161, 188, 152, 0.4)' : 'none'
              }}
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <div style={{
                  width: '72px', height: '72px', borderRadius: '20px',
                  background: 'var(--primary-light)', color: 'var(--primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 20px', border: '1px solid var(--border)'
                }}>
                  <HiOutlineUpload size={36} />
                </div>
              </motion.div>
              <p style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px', color: 'var(--text)' }}>
                Drag & drop your receipt image here
              </p>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px' }}>
                Supports PNG, JPG, JPEG • Max 10MB
              </p>

              {/* Action Buttons including Sample Button */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  className="btn-primary"
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                >
                  <HiOutlinePhotograph size={18} /> Browse File
                </button>
                <button
                  className="btn-secondary"
                  onClick={(e) => { e.stopPropagation(); cameraInputRef.current?.click(); }}
                >
                  <HiOutlineCamera size={18} /> Camera
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ background: 'var(--secondary-light)', borderColor: 'var(--secondary)', color: '#485444' }}
                  onClick={(e) => { e.stopPropagation(); loadSampleReceipt(); }}
                >
                  <HiOutlineDocumentSearch size={18} /> 🧪 Try Sample Receipt
                </button>
              </div>

              <input ref={fileInputRef} type="file" accept="image/png,image/jpg,image/jpeg" hidden
                onChange={e => handleFile(e.target.files[0])} />
              <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" hidden
                onChange={e => handleFile(e.target.files[0])} />
            </motion.div>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Receipt Image Preview</h3>
                <button onClick={clearFile} style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '4px',
                  fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 600
                }}>
                  <HiOutlineX size={16} /> Change File
                </button>
              </div>
              <div style={{ textAlign: 'center', marginBottom: '24px', background: 'var(--background)', padding: '16px', borderRadius: 'var(--radius)' }}>
                <img src={preview} alt="Receipt preview"
                  style={{ maxHeight: '420px', maxWidth: '100%', borderRadius: '12px',
                    border: '1px solid var(--border)', objectFit: 'contain' }} />
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px', textAlign: 'center' }}>
                📄 {file.name} • {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={scanReceipt}
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '16px', borderRadius: 'var(--radius-sm)' }}
              >
                ✨ Analyze with Groq AI
              </motion.button>
            </div>
          )}
        </motion.div>
      )}

      {/* AI Scanning State */}
      {scanning && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <ScannerAnimation />
        </div>
      )}

      {/* Extracted Data Form */}
      {extractedData && !scanning && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            className="card" style={{ padding: '20px', position: 'sticky', top: '92px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <HiOutlineSparkles style={{ color: 'var(--primary)' }} />
              <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Scanned Document</h3>
            </div>
            <img src={preview} alt="Receipt"
              style={{ width: '100%', borderRadius: '12px', border: '1px solid var(--border)' }} />
          </motion.div>
          <ReceiptEditor data={extractedData} onSave={saveReceipt} loading={saving} />
        </div>
      )}
    </motion.div>
  );
}
