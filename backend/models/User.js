// models/User.js
// Mongoose Schema + Model for User
// Syllabus: Backend Unit IV - Schema definition, Models
// Syllabus: Backend Unit III - Authentication and Security

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define the shape of a User document in MongoDB
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Never return password in queries by default
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// --- Mongoose Middleware (pre-save hook) ---
// Hash the password before saving to DB
userSchema.pre('save', async function (next) {
  // Only hash if password was modified (not on other updates)
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// --- Instance Method ---
// Compare entered password with hashed password in DB
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
