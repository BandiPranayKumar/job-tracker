// controllers/applicationController.js
// Business logic for all job application CRUD operations
// Syllabus: Backend Unit II - GET, POST, PUT, DELETE
// Syllabus: Backend Unit IV - CRUD operations, Pagination
// Syllabus: Backend Unit I - async/await, Promises

const { validationResult } = require('express-validator');
const Application = require('../models/Application');

// @desc    Get all applications for the logged-in user (with search, filter, sort, pagination)
// @route   GET /api/applications
// @access  Private
const getApplications = async (req, res, next) => {
  try {
    // --- Query Parameters ---
    const {
      search = '',
      status = 'All',
      sort = 'date-desc',
      page = 1,
      limit = 10,
    } = req.query;

    // --- Build the Mongoose filter object ---
    const filter = { user: req.user._id }; // Always filter by current user

    // If a search term is provided, use a case-insensitive regex on company OR role
    if (search.trim()) {
      filter.$or = [
        { company: { $regex: search.trim(), $options: 'i' } },
        { role: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    // Filter by status
    if (status !== 'All') {
      filter.status = status;
    }

    // --- Build the sort object ---
    const sortOptions = {
      'date-desc': { date: -1 },
      'date-asc': { date: 1 },
      'status': { status: 1 },
      'company': { company: 1 },
    };
    const sortQuery = sortOptions[sort] || { date: -1 };

    // --- Pagination ---
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Run both the data query and count query in parallel for efficiency
    const [applications, total] = await Promise.all([
      Application.find(filter).sort(sortQuery).skip(skip).limit(limitNum),
      Application.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: applications.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      data: applications,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single application by ID
// @route   GET /api/applications/:id
// @access  Private
const getApplicationById = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    // Authorization: make sure this application belongs to the logged-in user
    if (application.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this.' });
    }

    res.status(200).json({ success: true, data: application });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new application
// @route   POST /api/applications
// @access  Private
const createApplication = async (req, res, next) => {
  // Check express-validator errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg });
  }

  try {
    const { company, role, status, date, notes } = req.body;

    const application = await Application.create({
      user: req.user._id, // Link to logged-in user
      company,
      role,
      status,
      date,
      notes,
    });

    res.status(201).json({
      success: true,
      message: 'Application added successfully.',
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an existing application
// @route   PUT /api/applications/:id
// @access  Private
const updateApplication = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg });
  }

  try {
    let application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    // Authorization check
    if (application.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this.' });
    }

    const { company, role, status, date, notes } = req.body;

    // Update only provided fields
    application = await Application.findByIdAndUpdate(
      req.params.id,
      { company, role, status, date, notes },
      { new: true, runValidators: true } // new: return updated doc; runValidators: apply schema rules
    );

    res.status(200).json({
      success: true,
      message: 'Application updated successfully.',
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an application
// @route   DELETE /api/applications/:id
// @access  Private
const deleteApplication = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    // Authorization check
    if (application.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this.' });
    }

    await application.deleteOne();

    res.status(200).json({ success: true, message: 'Application deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard statistics for the logged-in user
// @route   GET /api/applications/stats
// @access  Private
const getStats = async (req, res, next) => {
  try {
    // MongoDB Aggregation Pipeline: groups documents and counts by status
    const stats = await Application.aggregate([
      { $match: { user: req.user._id } }, // Filter by user
      {
        $group: {
          _id: '$status',           // Group by status field
          count: { $sum: 1 },       // Count documents in each group
        },
      },
    ]);

    // Convert array of { _id: 'Applied', count: 3 } → { Applied: 3, ... }
    const result = { Applied: 0, Interview: 0, Offer: 0, Rejected: 0, Total: 0 };
    stats.forEach(({ _id, count }) => {
      if (result.hasOwnProperty(_id)) {
        result[_id] = count;
        result.Total += count;
      }
    });

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getApplications,
  getApplicationById,
  createApplication,
  updateApplication,
  deleteApplication,
  getStats,
};
