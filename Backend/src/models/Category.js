const mongoose = require('mongoose');
const FactorSchema = require('./Factor');

// Category is the top-level reusable building block.
// It is owned by a user and can be loaded ("Load Categories") into any
// assessment draft without losing its place in the shared library.
const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
    },
    factors: {
      type: [FactorSchema],
      default: [],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Category', CategorySchema);
