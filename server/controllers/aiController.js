// ============================================
// KhataSnap AI — AI Controller
// ============================================
// Handles AI-powered features: Chat Assistant, Smart Search,
// Financial Insights, Financial Score, and Monthly Comparison.
// Uses separate Groq API keys for different features.

const Receipt = require('../models/Receipt');
const Budget = require('../models/Budget');
const Groq = require('groq-sdk');
const mongoose = require('mongoose');

// Separate Groq clients for different AI features
const groqChat = new Groq({ apiKey: process.env.GROQ_API_KEY_CHAT });
const groqInsights = new Groq({ apiKey: process.env.GROQ_API_KEY_INSIGHTS });

const CHAT_MODEL = process.env.GROQ_CHAT_MODEL || 'llama-3.1-8b-instant';

// ============================================
// Helper: Get user's financial summary for AI context
// ============================================
async function getUserFinancialContext(userId) {
  const uid = new mongoose.Types.ObjectId(userId);
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const [
    totalStats,
    monthlyStats,
    lastMonthStats,
    weeklyStats,
    categoryStats,
    vendorStats,
    recentReceipts,
    budget
  ] = await Promise.all([
    Receipt.aggregate([
      { $match: { userId: uid } },
      { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 }, avg: { $avg: '$total' } } }
    ]),
    Receipt.aggregate([
      { $match: { userId: uid, date: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } }
    ]),
    Receipt.aggregate([
      { $match: { userId: uid, date: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
      { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } }
    ]),
    Receipt.aggregate([
      { $match: { userId: uid, date: { $gte: startOfWeek } } },
      { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } }
    ]),
    Receipt.aggregate([
      { $match: { userId: uid } },
      { $group: { _id: '$category', total: { $sum: '$total' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
      { $limit: 8 }
    ]),
    Receipt.aggregate([
      { $match: { userId: uid } },
      { $group: { _id: '$vendor', total: { $sum: '$total' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
      { $limit: 5 }
    ]),
    Receipt.find({ userId: uid }).sort({ date: -1 }).limit(10).lean(),
    Budget.findOne({ userId: uid, month: now.getMonth() + 1, year: now.getFullYear() })
  ]);

  return {
    totalSpent: totalStats[0]?.total || 0,
    totalReceipts: totalStats[0]?.count || 0,
    averageReceipt: Math.round((totalStats[0]?.avg || 0) * 100) / 100,
    monthlySpent: monthlyStats[0]?.total || 0,
    monthlyReceipts: monthlyStats[0]?.count || 0,
    lastMonthSpent: lastMonthStats[0]?.total || 0,
    lastMonthReceipts: lastMonthStats[0]?.count || 0,
    weeklySpent: weeklyStats[0]?.total || 0,
    weeklyReceipts: weeklyStats[0]?.count || 0,
    topCategories: categoryStats.map(c => ({ category: c._id, total: c.total, count: c.count })),
    topVendors: vendorStats.map(v => ({ vendor: v._id, total: v.total, count: v.count })),
    recentReceipts: recentReceipts.map(r => ({
      vendor: r.vendor, total: r.total, category: r.category,
      date: r.date, items: r.items?.length || 0
    })),
    budget: budget ? { amount: budget.amount } : null,
    currentMonth: now.toLocaleString('default', { month: 'long', year: 'numeric' })
  };
}

// ============================================
// POST /api/ai/chat — AI Chat Assistant
// ============================================
exports.chatAssistant = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: 'Please provide a message' });
    }

    // Get user's financial data for context
    const context = await getUserFinancialContext(req.user.id);

    const systemPrompt = `You are KhataSnap AI Assistant — a friendly, helpful financial advisor.
You have access to the user's expense data. Answer questions naturally and concisely.
Keep responses under 150 words. Use simple language. Be encouraging about saving money.

USER'S FINANCIAL DATA:
- Total spent (all time): $${context.totalSpent.toFixed(2)} across ${context.totalReceipts} receipts
- This month (${context.currentMonth}): $${context.monthlySpent.toFixed(2)} (${context.monthlyReceipts} receipts)
- Last month: $${context.lastMonthSpent.toFixed(2)} (${context.lastMonthReceipts} receipts)
- This week: $${context.weeklySpent.toFixed(2)} (${context.weeklyReceipts} receipts)
- Average receipt: $${context.averageReceipt}
- Monthly budget: ${context.budget ? '$' + context.budget.amount : 'Not set'}
- Top categories: ${context.topCategories.map(c => `${c.category}: $${c.total.toFixed(2)}`).join(', ')}
- Top vendors: ${context.topVendors.map(v => `${v.vendor}: $${v.total.toFixed(2)}`).join(', ')}
- Recent receipts: ${context.recentReceipts.map(r => `${r.vendor} $${r.total} (${r.category}) on ${new Date(r.date).toLocaleDateString()}`).join(', ')}`;

    const completion = await groqChat.chat.completions.create({
      model: CHAT_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      temperature: 0.7,
      max_completion_tokens: 500
    });

    res.json({
      success: true,
      data: {
        response: completion.choices[0].message.content,
        context: {
          monthlySpent: context.monthlySpent,
          budget: context.budget?.amount
        }
      }
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ success: false, message: 'AI chat failed. Please try again.' });
  }
};

// ============================================
// POST /api/ai/smart-search — Natural Language Search
// ============================================
exports.smartSearch = async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ success: false, message: 'Please provide a search query' });
    }

    // Ask Groq to convert natural language to MongoDB filter
    const prompt = `Convert this natural language search to a MongoDB filter object for an expense receipts collection.
The collection has fields: vendor (string), category (string enum: Groceries, Food, Restaurant, Transport, Shopping, Medical, Office, Education, Entertainment, Travel, Utilities, Electronics, Fuel, Personal, Business, Other), total (number), date (Date), tags (string array), items (array of {name, quantity, price}).

User query: "${query}"
Today's date: ${new Date().toISOString().split('T')[0]}

Return ONLY a valid JSON object with the MongoDB filter. Examples:
- "grocery receipts" → {"category": "Groceries"}
- "receipts over $50" → {"total": {"$gte": 50}}
- "walmart receipts" → {"vendor": {"$regex": "walmart", "$options": "i"}}
- "last week" → {"date": {"$gte": "<7 days ago ISO>"}}
- "july receipts" → {"date": {"$gte": "<july 1 ISO>", "$lte": "<july 31 ISO>"}}

Return ONLY the JSON filter object, nothing else.`;

    const completion = await groqInsights.chat.completions.create({
      model: CHAT_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      max_completion_tokens: 300
    });

    let filter;
    const responseText = completion.choices[0].message.content.trim();

    try {
      filter = JSON.parse(responseText);
    } catch {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      filter = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    }

    // Add userId to filter
    filter.userId = new mongoose.Types.ObjectId(req.user.id);

    // Execute the query
    const receipts = await Receipt.find(filter).sort({ date: -1 }).limit(50);

    res.json({
      success: true,
      data: receipts,
      filter,
      query
    });
  } catch (error) {
    console.error('Smart search error:', error);
    res.status(500).json({ success: false, message: 'Smart search failed' });
  }
};

// ============================================
// GET /api/ai/insights — AI Financial Insights
// ============================================
exports.getInsights = async (req, res) => {
  try {
    const context = await getUserFinancialContext(req.user.id);

    if (context.totalReceipts === 0) {
      return res.json({
        success: true,
        data: {
          summary: 'No expense data yet. Upload your first receipt to get started!',
          tips: ['Start by uploading a receipt to track your expenses.'],
          analysis: 'Upload receipts to see spending analysis here.'
        }
      });
    }

    const prompt = `Based on this user's financial data, generate insights.

DATA:
- Total spent: $${context.totalSpent.toFixed(2)} (${context.totalReceipts} receipts)
- This month: $${context.monthlySpent.toFixed(2)}
- Last month: $${context.lastMonthSpent.toFixed(2)}
- This week: $${context.weeklySpent.toFixed(2)}
- Average receipt: $${context.averageReceipt}
- Budget: ${context.budget ? '$' + context.budget.amount : 'Not set'}
- Top categories: ${JSON.stringify(context.topCategories)}
- Top vendors: ${JSON.stringify(context.topVendors)}

Return ONLY valid JSON:
{
  "summary": "Brief monthly summary (2-3 sentences)",
  "weeklySummary": "Brief weekly summary (1-2 sentences)",
  "tips": ["tip1", "tip2", "tip3"],
  "budgetAdvice": "Budget advice (1-2 sentences)",
  "categoryAnalysis": "Which categories cost most and why (1-2 sentences)",
  "vendorAnalysis": "Vendor spending pattern (1-2 sentences)",
  "savingSuggestions": ["suggestion1", "suggestion2"]
}`;

    const completion = await groqInsights.chat.completions.create({
      model: CHAT_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_completion_tokens: 600
    });

    let insights;
    const responseText = completion.choices[0].message.content.trim();

    try {
      insights = JSON.parse(responseText);
    } catch {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      insights = jsonMatch ? JSON.parse(jsonMatch[0]) : {
        summary: 'Unable to generate insights at this time.',
        tips: [],
        analysis: ''
      };
    }

    res.json({ success: true, data: insights });
  } catch (error) {
    console.error('Insights error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate insights' });
  }
};

// ============================================
// GET /api/ai/financial-score — Weekly Financial Score (0-100)
// ============================================
exports.getFinancialScore = async (req, res) => {
  try {
    const context = await getUserFinancialContext(req.user.id);

    if (context.totalReceipts === 0) {
      return res.json({
        success: true,
        data: { score: 0, status: 'No Data', explanation: 'Upload receipts to get your financial score.', tips: [] }
      });
    }

    // Calculate dynamic score from receipts, budget, categories, and spending patterns
    let score = 65; // Base starting score

    // 1. Activity & Receipt Logging Consistency (Up to +15 pts)
    if (context.totalReceipts > 0) {
      score += Math.min(15, context.totalReceipts * 3);
    }

    // 2. Budget Adherence (Up to +/- 20 pts)
    if (context.budget && context.budget.amount > 0) {
      const budgetUsage = context.monthlySpent / context.budget.amount;
      if (budgetUsage <= 0.5) score += 20;
      else if (budgetUsage <= 0.75) score += 15;
      else if (budgetUsage <= 0.9) score += 10;
      else if (budgetUsage <= 1.0) score += 5;
      else if (budgetUsage <= 1.25) score -= 10;
      else score -= 20;
    } else {
      // Slight penalty to encourage budget creation
      score -= 5;
    }

    // 3. Category Diversification & Balance (Up to +10 pts)
    if (context.topCategories && context.topCategories.length > 1) {
      const highestCatTotal = context.topCategories[0]?.total || 0;
      const catRatio = highestCatTotal / (context.totalSpent || 1);
      if (catRatio < 0.6) score += 10; // Balanced spending
      else if (catRatio < 0.8) score += 5;
    }

    // 4. Month-over-Month Spending Trend (Up to +/- 10 pts)
    if (context.lastMonthSpent > 0) {
      const monthChange = (context.monthlySpent - context.lastMonthSpent) / context.lastMonthSpent;
      if (monthChange <= -0.15) score += 10;
      else if (monthChange <= 0) score += 5;
      else if (monthChange > 0.25) score -= 10;
    } else if (context.monthlySpent > 0 && context.monthlySpent < 500) {
      score += 5;
    }

    // Clamp score to 15-98 range
    const calculatedScore = Math.max(15, Math.min(98, score));

    // Get AI explanation
    const prompt = `The user's financial score is ${calculatedScore}/100.

Data:
- Monthly spent: $${context.monthlySpent.toFixed(2)}
- Last month: $${context.lastMonthSpent.toFixed(2)}
- Budget: ${context.budget ? '$' + context.budget.amount : 'Not set'}
- Top category: ${context.topCategories[0]?.category || 'N/A'} ($${context.topCategories[0]?.total?.toFixed(2) || 0})

Return ONLY valid JSON:
{
  "status": "Excellent/Good/Average/Needs Improvement (based on score)",
  "explanation": "Why this score (2-3 sentences)",
  "tips": ["improvement tip 1", "improvement tip 2", "improvement tip 3"]
}`;

    const completion = await groqInsights.chat.completions.create({
      model: CHAT_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_completion_tokens: 300
    });

    let aiResponse;
    try {
      aiResponse = JSON.parse(completion.choices[0].message.content.trim());
    } catch {
      const match = completion.choices[0].message.content.match(/\{[\s\S]*\}/);
      aiResponse = match ? JSON.parse(match[0]) : {
        status: calculatedScore >= 80 ? 'Excellent' : calculatedScore >= 60 ? 'Good' : calculatedScore >= 40 ? 'Average' : 'Needs Improvement',
        explanation: 'Your financial health is being tracked.',
        tips: ['Keep tracking your expenses!']
      };
    }

    res.json({
      success: true,
      data: {
        score: calculatedScore,
        ...aiResponse
      }
    });
  } catch (error) {
    console.error('Financial score error:', error);
    res.status(500).json({ success: false, message: 'Failed to calculate financial score' });
  }
};

// ============================================
// GET /api/ai/monthly-comparison — Monthly AI Comparison
// ============================================
exports.getMonthlyComparison = async (req, res) => {
  try {
    const uid = new mongoose.Types.ObjectId(req.user.id);
    const now = new Date();

    // Current month
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // Previous month
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const [currentMonth, previousMonth, currentCategories, previousCategories] = await Promise.all([
      Receipt.aggregate([
        { $match: { userId: uid, date: { $gte: currentMonthStart, $lte: currentMonthEnd } } },
        { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 }, avg: { $avg: '$total' } } }
      ]),
      Receipt.aggregate([
        { $match: { userId: uid, date: { $gte: prevMonthStart, $lte: prevMonthEnd } } },
        { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 }, avg: { $avg: '$total' } } }
      ]),
      Receipt.aggregate([
        { $match: { userId: uid, date: { $gte: currentMonthStart, $lte: currentMonthEnd } } },
        { $group: { _id: '$category', total: { $sum: '$total' } } },
        { $sort: { total: -1 } }
      ]),
      Receipt.aggregate([
        { $match: { userId: uid, date: { $gte: prevMonthStart, $lte: prevMonthEnd } } },
        { $group: { _id: '$category', total: { $sum: '$total' } } },
        { $sort: { total: -1 } }
      ])
    ]);

    const currentTotal = currentMonth[0]?.total || 0;
    const previousTotal = previousMonth[0]?.total || 0;
    const percentChange = previousTotal > 0
      ? Math.round(((currentTotal - previousTotal) / previousTotal) * 100)
      : 0;

    const currentMonthName = now.toLocaleString('default', { month: 'long' });
    const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthName = prevDate.toLocaleString('default', { month: 'long' });

    // Get AI analysis
    let aiAnalysis = '';
    if (currentTotal > 0 || previousTotal > 0) {
      const prompt = `Compare these two months of spending:

${currentMonthName}: $${currentTotal.toFixed(2)} (${currentMonth[0]?.count || 0} receipts)
Categories: ${currentCategories.map(c => `${c._id}: $${c.total.toFixed(2)}`).join(', ')}

${prevMonthName}: $${previousTotal.toFixed(2)} (${previousMonth[0]?.count || 0} receipts)
Categories: ${previousCategories.map(c => `${c._id}: $${c.total.toFixed(2)}`).join(', ')}

Change: ${percentChange}% ${percentChange > 0 ? 'increase' : 'decrease'}

Provide a brief analysis (3-4 sentences) and 2 specific recommendations. Keep under 100 words.`;

      const completion = await groqInsights.chat.completions.create({
        model: CHAT_MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_completion_tokens: 300
      });
      aiAnalysis = completion.choices[0].message.content;
    }

    res.json({
      success: true,
      data: {
        currentMonth: {
          name: currentMonthName,
          total: currentTotal,
          receipts: currentMonth[0]?.count || 0,
          average: Math.round((currentMonth[0]?.avg || 0) * 100) / 100,
          categories: currentCategories
        },
        previousMonth: {
          name: prevMonthName,
          total: previousTotal,
          receipts: previousMonth[0]?.count || 0,
          average: Math.round((previousMonth[0]?.avg || 0) * 100) / 100,
          categories: previousCategories
        },
        percentChange,
        aiAnalysis
      }
    });
  } catch (error) {
    console.error('Monthly comparison error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate comparison' });
  }
};
