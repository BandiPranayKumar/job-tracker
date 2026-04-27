// middleware/errorMiddleware.js
// Global error handler - catches all errors thrown in route handlers
// Syllabus: Backend Unit II - Error Handling

// 404 Not Found handler - for routes that don't exist
const notFound = (req, res, next) => {
  const error = new Error(`Route Not Found: ${req.originalUrl}`);
  res.status(404);
  next(error); // Pass to the global error handler below
};

// Global error handler - always has 4 parameters (err, req, res, next)
const errorHandler = (err, req, res, next) => {
  // Sometimes Express sets status 200 even on errors; correct that
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  // Mongoose Duplicate Key Error (e.g., email already exists)
  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: 'A user with this email already exists.',
    });
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: messages.join('. '),
    });
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Invalid token.' });
  }

  // Default error response
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    // Only show stack trace in development mode
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
};

module.exports = { notFound, errorHandler };
