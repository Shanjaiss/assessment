const mongoose = require('mongoose');

// One answer to one specific question, identified by its embedded _id
// inside the assessment snapshot (category/factor/question path).
const AnswerSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    questionText: {
      type: String,
      required: true,
    },
    categoryName: {
      type: String,
      required: true,
    },
    factorName: {
      type: String,
      required: true,
    },
    questionType: {
      type: String,
      enum: [
        'multiple_choice',
        'rating',
        'yes_no',
        'short_text',
        'long_text',
        'checkbox',
      ],
      required: true,
    },
    answer: {
      type: mongoose.Schema.Types.Mixed, // string, number, or boolean depending on type
      required: false,
      default: null,
    },
  },
  { _id: false }
);

const ResponseSchema = new mongoose.Schema(
  {
    assessment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assessment',
      required: true,
    },
    assessmentTitle: {
      type: String,
      required: true, // denormalized for fast display on Reports page
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    answers: {
      type: [AnswerSchema],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Response', ResponseSchema);
