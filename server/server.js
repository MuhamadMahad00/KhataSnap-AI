// ============================================
// KhataSnap AI — Main Server Entry Point
// ============================================
// Express server with MongoDB, JWT auth, file uploads, and Groq AI integration.

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const mongoSanitize = require('express-mongo-sanitize');
require('dotenv').config();

const app = express();

// ============================================
// Middleware
// ============================================

// Enable CORS for frontend
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// Parse JSON bodies
app.use(express.json({ limit: '10mb' }));

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Sanitize MongoDB queries to prevent injection
app.use(mongoSanitize());

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ============================================
// Routes
// ============================================

const authRoutes = require('./routes/authRoutes');
const receiptRoutes = require('./routes/receiptRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const challengeRoutes = require('./routes/challengeRoutes');
const aiRoutes = require('./routes/aiRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/receipts', receiptRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/ai', aiRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'KhataSnap AI Server is running' });
});

// ============================================
// Global Error Handler
// ============================================

app.use((err, req, res, next) => {
  console.error('Server Error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// ============================================
// MongoDB Connection & Server Start
// ============================================

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected Successfully');
    app.listen(PORT, () => {
      console.log(`🚀 KhataSnap AI Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Failed:', err.message);
    process.exit(1);
  });
