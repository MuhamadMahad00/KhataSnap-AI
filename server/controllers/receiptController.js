// ============================================
// KhataSnap AI — Receipt Controller
// ============================================
// Core feature: Groq Vision AI receipt understanding + CRUD operations.
// Uses GROQ_API_KEY_VISION for receipt scanning.

const Receipt = require('../models/Receipt');
const Groq = require('groq-sdk');
const fs = require('fs');
const path = require('path');

// Initialize Groq client with Vision API key
const groqVision = new Groq({ apiKey: process.env.GROQ_API_KEY_VISION });

// ============================================
// POST /api/receipts/scan — AI Receipt Understanding
// ============================================
// Upload a receipt image → Groq Vision AI extracts structured data.
exports.scanReceipt = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a receipt image'
      });
    }

    // Read the uploaded image and convert to base64
    const imagePath = req.file.path;
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    const mimeType = req.file.mimetype;

    // Groq Vision AI prompt — deep understanding, not just OCR
    const prompt = `You are an expert receipt analyzer. Analyze this receipt image thoroughly.
Do NOT just perform OCR. UNDERSTAND the receipt structure, context, and meaning.

Extract the following information and return ONLY valid JSON (no markdown, no explanation):

{
  "vendor": "Store/Business name",
  "date": "YYYY-MM-DD format (best guess if unclear)",
  "currency": "Currency code like USD, PKR, EUR, GBP, INR",
  "receiptNumber": "Receipt/Invoice number if visible, empty string if not",
  "items": [
    {
      "name": "Item name",
      "quantity": 1,
      "price": 0.00,
      "discount": 0.00
    }
  ],
  "subtotal": 0.00,
  "tax": 0.00,
  "discount": 0.00,
  "total": 0.00,
  "paymentMethod": "Cash/Card/Digital or empty string if unknown",
  "category": "One of: Groceries, Food, Restaurant, Transport, Shopping, Medical, Office, Education, Entertainment, Travel, Utilities, Electronics, Fuel, Personal, Business, Other",
  "tags": ["tag1", "tag2", "tag3"],
  "confidenceScore": 85
}

Rules:
- If a field is not visible, make a reasonable inference based on context
- The "category" should be intelligently determined from the items and vendor
- "tags" should be auto-generated relevant keywords (3-6 tags)
- "confidenceScore" is your confidence in the extraction accuracy (0-100)
- All prices must be numbers, not strings
- Date must be YYYY-MM-DD format
- Return ONLY the JSON object, nothing else`;

    // Call Groq Vision API
    const completion = await groqVision.chat.completions.create({
      model: process.env.GROQ_VISION_MODEL || 'qwen/qwen3.6-27b',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`
              }
            }
          ]
        }
      ],
      temperature: 0.1, // Low temperature for accurate extraction
      max_completion_tokens: 2048
    });

    // Parse the AI response
    let extractedData;
    const responseText = completion.choices[0].message.content.trim();

    try {
      // Try to parse JSON directly
      extractedData = JSON.parse(responseText);
    } catch {
      // If response has markdown code blocks, extract the JSON
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        extractedData = JSON.parse(jsonMatch[1].trim());
      } else {
        // Last resort: find JSON object in response
        const jsonStart = responseText.indexOf('{');
        const jsonEnd = responseText.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1) {
          extractedData = JSON.parse(responseText.substring(jsonStart, jsonEnd + 1));
        } else {
          throw new Error('Could not parse AI response as JSON');
        }
      }
    }

    // Add the image path and ensure valid recent date
    extractedData.imagePath = `/uploads/${req.file.filename}`;
    const todayStr = new Date().toISOString().split('T')[0];
    if (!extractedData.date || extractedData.date < '2025-01-01') {
      extractedData.date = todayStr;
    }

    res.json({
      success: true,
      data: extractedData
    });
  } catch (error) {
    console.error('Receipt scan error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to scan receipt'
    });
  }
};

// ============================================
// POST /api/receipts — Save Receipt to Database
// ============================================
exports.saveReceipt = async (req, res) => {
  try {
    const receiptData = {
      ...req.body,
      userId: req.user.id
    };

    const receipt = await Receipt.create(receiptData);

    res.status(201).json({
      success: true,
      data: receipt
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to save receipt'
    });
  }
};

// ============================================
// GET /api/receipts — List Receipts with Filters
// ============================================
exports.getReceipts = async (req, res) => {
  try {
    const { category, vendor, month, year, minAmount, maxAmount, tag, search, page = 1, limit = 20 } = req.query;

    // Build filter query
    const filter = { userId: req.user.id };

    if (category) filter.category = category;
    if (vendor) filter.vendor = { $regex: vendor, $options: 'i' };
    if (tag) filter.tags = { $in: [tag] };

    // Date range filter (month/year)
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      filter.date = { $gte: startDate, $lte: endDate };
    } else if (year) {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31, 23, 59, 59);
      filter.date = { $gte: startDate, $lte: endDate };
    }

    // Amount range filter
    if (minAmount || maxAmount) {
      filter.total = {};
      if (minAmount) filter.total.$gte = parseFloat(minAmount);
      if (maxAmount) filter.total.$lte = parseFloat(maxAmount);
    }

    // Text search across vendor and items
    if (search) {
      filter.$or = [
        { vendor: { $regex: search, $options: 'i' } },
        { 'items.name': { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Receipt.countDocuments(filter);

    const receipts = await Receipt.find(filter)
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: receipts,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch receipts'
    });
  }
};

// ============================================
// GET /api/receipts/stats — Dashboard Statistics
// ============================================
exports.getStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const mongoose = require('mongoose');
    const uid = new mongoose.Types.ObjectId(userId);

    // Run all aggregations in parallel
    const [
      totalExpenses,
      monthlyExpenses,
      weeklyExpenses,
      todayExpenses,
      receiptCount,
      categoryBreakdown,
      vendorBreakdown,
      monthlyTrend,
      recentReceipts
    ] = await Promise.all([
      // Total all-time expenses
      Receipt.aggregate([
        { $match: { userId: uid } },
        { $group: { _id: null, total: { $sum: '$total' }, avgReceipt: { $avg: '$total' } } }
      ]),
      // This month's expenses
      Receipt.aggregate([
        { $match: { userId: uid, date: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),
      // This week's expenses
      Receipt.aggregate([
        { $match: { userId: uid, date: { $gte: startOfWeek } } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),
      // Today's expenses
      Receipt.aggregate([
        { $match: { userId: uid, date: { $gte: startOfDay } } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),
      // Total receipt count
      Receipt.countDocuments({ userId: uid }),
      // Category breakdown
      Receipt.aggregate([
        { $match: { userId: uid } },
        { $group: { _id: '$category', total: { $sum: '$total' }, count: { $sum: 1 } } },
        { $sort: { total: -1 } }
      ]),
      // Vendor breakdown (top 10)
      Receipt.aggregate([
        { $match: { userId: uid } },
        { $group: { _id: '$vendor', total: { $sum: '$total' }, count: { $sum: 1 } } },
        { $sort: { total: -1 } },
        { $limit: 10 }
      ]),
      // Monthly trend (last 6 months)
      Receipt.aggregate([
        { $match: { userId: uid, date: { $gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) } } },
        {
          $group: {
            _id: { year: { $year: '$date' }, month: { $month: '$date' } },
            total: { $sum: '$total' },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]),
      // Recent receipts (last 5)
      Receipt.find({ userId: uid }).sort({ date: -1 }).limit(5)
    ]);

    // Find top vendor and top category
    const topVendor = vendorBreakdown.length > 0 ? vendorBreakdown[0]._id : 'N/A';
    const topCategory = categoryBreakdown.length > 0 ? categoryBreakdown[0]._id : 'N/A';

    // Build full 6-month trend structure for continuous line chart display
    const fullMonthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const found = monthlyTrend.find(m => m._id.year === year && m._id.month === month);
      fullMonthlyTrend.push({
        _id: { year, month },
        total: found ? found.total : 0,
        count: found ? found.count : 0
      });
    }

    res.json({
      success: true,
      data: {
        totalExpenses: totalExpenses[0]?.total || 0,
        averageReceipt: Math.round((totalExpenses[0]?.avgReceipt || 0) * 100) / 100,
        monthlyExpenses: monthlyExpenses[0]?.total || 0,
        weeklyExpenses: weeklyExpenses[0]?.total || 0,
        todayExpenses: todayExpenses[0]?.total || 0,
        receiptCount,
        topVendor,
        topCategory,
        categoryBreakdown,
        vendorBreakdown,
        monthlyTrend: fullMonthlyTrend,
        recentReceipts
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch stats'
    });
  }
};

// ============================================
// GET /api/receipts/heatmap — Spending Heatmap Data
// ============================================
exports.getHeatmapData = async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const uid = new mongoose.Types.ObjectId(req.user.id);

    // Get daily spending for the last 365 days
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const heatmapData = await Receipt.aggregate([
      { $match: { userId: uid, date: { $gte: oneYearAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          total: { $sum: '$total' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: heatmapData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch heatmap data'
    });
  }
};

// ============================================
// GET /api/receipts/:id — Single Receipt Detail
// ============================================
exports.getReceiptById = async (req, res) => {
  try {
    const receipt = await Receipt.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!receipt) {
      return res.status(404).json({
        success: false,
        message: 'Receipt not found'
      });
    }

    res.json({ success: true, data: receipt });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch receipt'
    });
  }
};

// ============================================
// PUT /api/receipts/:id — Update Receipt
// ============================================
exports.updateReceipt = async (req, res) => {
  try {
    const receipt = await Receipt.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!receipt) {
      return res.status(404).json({
        success: false,
        message: 'Receipt not found'
      });
    }

    res.json({ success: true, data: receipt });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update receipt'
    });
  }
};

// ============================================
// DELETE /api/receipts/:id — Delete Receipt
// ============================================
exports.deleteReceipt = async (req, res) => {
  try {
    const receipt = await Receipt.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!receipt) {
      return res.status(404).json({
        success: false,
        message: 'Receipt not found'
      });
    }

    // Delete the uploaded image file
    if (receipt.imagePath) {
      const fullPath = path.join(__dirname, '..', receipt.imagePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }

    res.json({ success: true, message: 'Receipt deleted successfully' });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete receipt'
    });
  }
};
