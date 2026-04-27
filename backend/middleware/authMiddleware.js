// middleware/authMiddleware.js
// Protects routes by verifying JWT tokens
// Syllabus: Backend Unit III - JWT implementation, Creating middlewares, app.use()

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// This middleware runs BEFORE protected route handlers
const protect = async (req, res, next) => {
  let token;

  // JWT is sent in the Authorization header as "Bearer <token>"
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized. No token provided.',
    });
  }

  try {
    // Verify the token using our secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the user to the request object (available in all next handlers)
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not found. Token may be invalid.',
      });
    }

    next(); // Move to the actual route handler
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized. Token failed.',
    });
  }
};

module.exports = { protect };
