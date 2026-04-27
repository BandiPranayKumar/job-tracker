// routes/applicationRoutes.js
// Defines all job application API endpoints
// Syllabus: Backend Unit II - GET, POST, PUT, DELETE, express.Router

const express = require('express');
const { body } = require('express-validator');
const {
  getApplications,
  getApplicationById,
  createApplication,
  updateApplication,
  deleteApplication,
  getStats,
} = require('../controllers/applicationController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes below require a valid JWT (protect middleware applied at router level)
router.use(protect);

// --- Validation Rules ---
const applicationValidation = [
  body('company').trim().notEmpty().withMessage('Company name is required'),
  body('role').trim().notEmpty().withMessage('Job role is required'),
  body('status')
    .isIn(['Applied', 'Interview', 'Offer', 'Rejected'])
    .withMessage('Invalid status value'),
  body('date').isISO8601().withMessage('Valid date is required'),
];

// --- Route Definitions ---

// GET  /api/applications/stats  → Dashboard summary counts
router.get('/stats', getStats);

// GET  /api/applications         → Get all (supports ?search=, ?status=, ?sort=, ?page=, ?limit=)
// POST /api/applications         → Create new application
router
  .route('/')
  .get(getApplications)
  .post(applicationValidation, createApplication);

// GET    /api/applications/:id  → Get single application
// PUT    /api/applications/:id  → Update application
// DELETE /api/applications/:id  → Delete application
router
  .route('/:id')
  .get(getApplicationById)
  .put(applicationValidation, updateApplication)
  .delete(deleteApplication);

module.exports = router;
