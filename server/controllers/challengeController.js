// ============================================
// KhataSnap AI — Challenge Controller
// ============================================
// Manage expense challenges with progress tracking and AI motivation.

const Challenge = require('../models/Challenge');
const Receipt = require('../models/Receipt');
const Groq = require('groq-sdk');
const mongoose = require('mongoose');

const groqInsights = new Groq({ apiKey: process.env.GROQ_API_KEY_INSIGHTS });
const CHAT_MODEL = process.env.GROQ_CHAT_MODEL || 'llama-3.1-8b-instant';

// ============================================
// POST /api/challenges — Create Challenge
// ============================================
exports.createChallenge = async (req, res) => {
  try {
    const { title, targetAmount, startDate, endDate, category } = req.body;

    if (!title || !targetAmount || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, target amount, and end date'
      });
    }

    const challenge = await Challenge.create({
      userId: req.user.id,
      title,
      targetAmount: parseFloat(targetAmount),
      startDate: startDate || new Date(),
      endDate,
      category: category || ''
    });

    res.status(201).json({ success: true, data: challenge });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create challenge'
    });
  }
};

// ============================================
// GET /api/challenges — List Challenges with Progress
// ============================================
exports.getChallenges = async (req, res) => {
  try {
    const uid = new mongoose.Types.ObjectId(req.user.id);
    const challenges = await Challenge.find({ userId: req.user.id }).sort({ createdAt: -1 });

    // Calculate progress for each challenge
    const challengesWithProgress = await Promise.all(
      challenges.map(async (challenge) => {
        const filter = {
          userId: uid,
          date: { $gte: challenge.startDate, $lte: challenge.endDate }
        };

        // If category-specific challenge, filter by category
        if (challenge.category) {
          filter.category = challenge.category;
        }

        const spending = await Receipt.aggregate([
          { $match: filter },
          { $group: { _id: null, total: { $sum: '$total' } } }
        ]);

        const spent = spending[0]?.total || 0;
        const percentage = Math.round((spent / challenge.targetAmount) * 100);
        const remaining = challenge.targetAmount - spent;

        // Auto-update status
        const now = new Date();
        let status = challenge.status;
        if (now > challenge.endDate && challenge.status === 'active') {
          status = spent <= challenge.targetAmount ? 'completed' : 'failed';
          await Challenge.findByIdAndUpdate(challenge._id, { status });
        }

        return {
          ...challenge.toObject(),
          spent: Math.round(spent * 100) / 100,
          remaining: Math.round(remaining * 100) / 100,
          percentage: Math.min(percentage, 100),
          status
        };
      })
    );

    res.json({ success: true, data: challengesWithProgress });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch challenges'
    });
  }
};

// ============================================
// DELETE /api/challenges/:id — Delete Challenge
// ============================================
exports.deleteChallenge = async (req, res) => {
  try {
    const challenge = await Challenge.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Challenge not found' });
    }

    res.json({ success: true, message: 'Challenge deleted' });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete challenge'
    });
  }
};

// ============================================
// GET /api/challenges/:id/motivation — AI Motivation Message
// ============================================
exports.getMotivation = async (req, res) => {
  try {
    const uid = new mongoose.Types.ObjectId(req.user.id);
    const challenge = await Challenge.findOne({ _id: req.params.id, userId: req.user.id });

    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Challenge not found' });
    }

    // Calculate progress
    const filter = {
      userId: uid,
      date: { $gte: challenge.startDate, $lte: challenge.endDate }
    };
    if (challenge.category) filter.category = challenge.category;

    const spending = await Receipt.aggregate([
      { $match: filter },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    const spent = spending[0]?.total || 0;
    const percentage = Math.round((spent / challenge.targetAmount) * 100);
    const daysLeft = Math.max(0, Math.ceil((new Date(challenge.endDate) - new Date()) / (1000 * 60 * 60 * 24)));

    const prompt = `Generate a short, motivational message for this spending challenge:
Challenge: "${challenge.title}"
Target: Spend under $${challenge.targetAmount}
Spent so far: $${spent.toFixed(2)} (${percentage}%)
Days remaining: ${daysLeft}
Status: ${challenge.status}

Keep the message under 50 words. Be encouraging and specific. Use an emoji.`;

    const completion = await groqInsights.chat.completions.create({
      model: CHAT_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
      max_completion_tokens: 100
    });

    res.json({
      success: true,
      data: {
        message: completion.choices[0].message.content,
        spent,
        percentage,
        daysLeft
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get motivation'
    });
  }
};
