// models/Application.js
// Mongoose Schema + Model for Job Applications
// Syllabus: Backend Unit IV - Schema definition, Models, CRUD operations, Pagination

const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    // Each application belongs to a user (foreign key relationship)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: [100, 'Company name too long'],
    },
    role: {
      type: String,
      required: [true, 'Job role is required'],
      trim: true,
      maxlength: [100, 'Role name too long'],
    },
    status: {
      type: String,
      enum: ['Applied', 'Interview', 'Offer', 'Rejected'], // Only these values allowed
      default: 'Applied',
    },
    date: {
      type: Date,
      required: [true, 'Application date is required'],
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes too long'],
      default: '',
    },
  },
  {
    timestamps: true, // createdAt + updatedAt auto fields
  }
);

// --- Index for faster queries ---
// Compound index: when we query by user AND sort by date
applicationSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('Application', applicationSchema);
