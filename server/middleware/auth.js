// ============================================
// KhataSnap AI — JWT Authentication Middleware
// ============================================
// Verifies the JWT token from the Authorization header.
// Attaches the user's ID to req.user for use in controllers.

const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    // Get token from header: "Bearer <token>"
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided. Access denied.'
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id };
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token. Please login again.'
    });
  }
};

module.exports = auth;
