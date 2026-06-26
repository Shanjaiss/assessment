const mongoose = require('mongoose');
const QuestionSchema = require('./Questions');

// A Factor lives inside a Category and holds a list of Questions.
const FactorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Factor name is required'],
      trim: true,
    },
    questions: {
      type: [QuestionSchema],
      default: [],
    },
  },
  { _id: true }
);

module.exports = FactorSchema;
