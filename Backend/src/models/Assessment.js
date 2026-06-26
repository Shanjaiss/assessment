const mongoose = require('mongoose');
const FactorSchema = require('./Factor');

// An Assessment is a snapshot taken when the Builder is saved.
// It embeds a copy of categories -> factors -> questions at save time.
// This is intentional: later edits to the shared Category library should
// NOT silently change an assessment that has already been published.
const AssessmentCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    sourceCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null, // reference to the library category this was copied from, if any
    },
    factors: {
      type: [FactorSchema],
      default: [],
    },
  },
  { _id: true }
);

const AssessmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Assessment title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    categories: {
      type: [AssessmentCategorySchema],
      default: [],
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'published',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Assessment', AssessmentSchema);
