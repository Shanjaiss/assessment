const Response = require('../models/Response');
const Assessment = require('../models/Assessment');
const { asyncHandler } = require('../middleware/errorvalidation');

// Flattens an assessment's category->factor->question tree into a lookup map
// keyed by questionId, so submitted answers can be validated against the
// real question definitions (type, options) rather than trusting the client.
const buildQuestionLookup = (assessment) => {
  const lookup = new Map();
  assessment.categories.forEach((cat) => {
    cat.factors.forEach((factor) => {
      factor.questions.forEach((q) => {
        lookup.set(String(q._id), {
          questionId: q._id,
          questionText: q.text,
          categoryName: cat.name,
          factorName: factor.name,
          questionType: q.type,
          options: q.options,
        });
      });
    });
  });
  return lookup;
};

// @route  POST /api/responses
// @desc   Submit answers for a given assessment (Launch Pad)
// @access Private
const submitResponse = asyncHandler(async (req, res) => {
  const { assessmentId, answers, respondentName } = req.body;

  if (!assessmentId) {
    return res.status(400).json({ message: 'assessmentId is required' });
  }
  if (!Array.isArray(answers) || answers.length === 0) {
    return res.status(400).json({ message: 'At least one answer is required' });
  }

  const assessment = await Assessment.findOne({
    _id: assessmentId,
    createdBy: req.user._id,
  });
  if (!assessment) {
    return res.status(404).json({ message: 'Assessment not found' });
  }

  const lookup = buildQuestionLookup(assessment);
  const validatedAnswers = [];
  const errors = [];

  answers.forEach((ans) => {
    const ref = lookup.get(String(ans.questionId));
    if (!ref) {
      errors.push(
        `Question ${ans.questionId} does not belong to this assessment`
      );
      return;
    }

    // Basic per-type validation so bad client data doesn't get persisted silently
    if (
      ref.questionType === 'multiple_choice' &&
      ans.answer &&
      !ref.options.includes(ans.answer)
    ) {
      errors.push(
        `"${ans.answer}" is not a valid option for question "${ref.questionText}"`
      );
      return;
    }
    if (
      ref.questionType === 'rating' &&
      ans.answer !== null &&
      ans.answer !== undefined
    ) {
      const num = Number(ans.answer);
      if (Number.isNaN(num) || num < 1) {
        errors.push(
          `Rating answer for "${ref.questionText}" must be a positive number`
        );
        return;
      }
    }

    validatedAnswers.push({
      questionId: ref.questionId,
      questionText: ref.questionText,
      categoryName: ref.categoryName,
      factorName: ref.factorName,
      questionType: ref.questionType,
      answer: ans.answer ?? null,
    });
  });

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  const response = await Response.create({
    assessment: assessment._id,
    assessmentTitle: assessment.title,
    submittedBy: req.user._id,
    answers: validatedAnswers,
    respondentName: respondentName?.trim() || 'Anonymous',
  });

  res.status(201).json({ response });
});

// @route  GET /api/responses
// @desc   List all submitted responses for the logged-in user (Reports page)
// @access Private
const getResponses = asyncHandler(async (req, res) => {
  const responses = await Response.find({ submittedBy: req.user._id })
    .sort({ createdAt: -1 })
    .populate('assessment', 'title')
    .populate('submittedBy', 'name email');
  res.status(200).json({ responses });
});

// @route  GET /api/responses/:id
// @desc   Get a single response in full detail
// @access Private
const getResponseById = asyncHandler(async (req, res) => {
  const response = await Response.findOne({
    _id: req.params.id,
    submittedBy: req.user._id,
  });
  if (!response) {
    return res.status(404).json({ message: 'Response not found' });
  }
  res.status(200).json({ response });
});

// @route  GET /api/responses/assessment/:assessmentId
// @desc   Get all responses for one specific assessment (Reports filtered view)
// @access Private
const getResponsesByAssessment = asyncHandler(async (req, res) => {
  const responses = await Response.find({
    assessment: req.params.assessmentId,
    submittedBy: req.user._id,
  }).sort({ createdAt: -1 });
  res.status(200).json({ responses });
});

module.exports = {
  submitResponse,
  getResponses,
  getResponseById,
  getResponsesByAssessment,
};
