// routes/authRoutes.js
// Defines all authentication-related API endpoints
// Syllabus: Backend Unit II - express.Router, express-validator

const express = require('express');
const { body } = require('express-validator');
const { registerUser, loginUser, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// --- Validation Rules ---
// express-validator: define rules, controller checks them with validationResult()

const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
];

const loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

// --- Route Definitions ---
// POST /api/auth/register
router.post('/register', registerValidation, registerUser);

// POST /api/auth/login
router.post('/login', loginValidation, loginUser);

// GET /api/auth/me  → Protected: must send valid JWT
router.get('/me', protect, getMe);

module.exports = router;
