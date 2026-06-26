const mongoose = require('mongoose');

// A single question inside a factor.
// "options" is only meaningful for multiple-choice questions but is kept
// generic so the schema works for every question type without branching models.
const QuestionSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: [true, 'Question text is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: [
        'multiple_choice',
        'rating',
        'yes_no',
        'short_text',
        'long_text',
        'checkbox',
      ],
      required: [true, 'Question type is required'],
    },
    options: {
      type: [String],
      default: undefined, // only populated for multiple_choice questions
    },
    ratingScale: {
      type: Number,
      default: 5, // used only when type === 'rating' (e.g. 1-5 or 1-10)
    },
  },
  { _id: true }
);

module.exports = QuestionSchema;
