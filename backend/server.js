// server.js
// Main Express application entry point
// Syllabus: Backend Unit I - Node.js, npm, Core Modules
// Syllabus: Backend Unit II - Introducing Express, HTTP Services
// Syllabus: Backend Unit III - Creating middlewares, app.use(), Security headers

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file FIRST
dotenv.config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// --- Connect to MongoDB ---
connectDB();

const app = express();

// ─────────────────────────────────────────
//  MIDDLEWARE (applied to all routes)
// ─────────────────────────────────────────

// CORS: allow requests from our frontend origin
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://your-production-domain.com' 
    : [/^http:\/\/127\.0\.0\.1:\d+$/, /^http:\/\/localhost:\d+$/], // Allow any local port (5500, 5501, etc)
  credentials: true,
}));

// Parse incoming JSON request bodies
app.use(express.json());

// Parse URL-encoded bodies (form submissions)
app.use(express.urlencoded({ extended: true }));

// Cookie parser middleware (reads cookies from requests)
app.use(cookieParser());

// Basic security headers (manual, without helmet for learning purposes)
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  next();
});

// ─────────────────────────────────────────
//  ROUTES
// ─────────────────────────────────────────

// Health check route - useful for testing the server is running
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Job Tracker API is running!',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// Mount routers at specific paths
app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);

// ─────────────────────────────────────────
//  SERVE FRONTEND
// ─────────────────────────────────────────
app.use(express.static(path.join(__dirname, '../frontend')));

// ─────────────────────────────────────────
//  ERROR HANDLING MIDDLEWARE (must be last)
// ─────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─────────────────────────────────────────
//  START SERVER
// ─────────────────────────────────────────
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`📡 API available at: http://localhost:${PORT}/api`);
  console.log(`💻 Frontend available at: http://localhost:${PORT}`);
});
