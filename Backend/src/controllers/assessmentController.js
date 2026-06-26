const Assessment = require('../models/Assessment');
const Category = require('../models/Category');
const { asyncHandler } = require('../middleware/errorvalidation');

// Basic structural validation for the builder payload before it hits the DB.
// Keeps bad data (empty categories, questions without text/type) out of saved assessments.
const validateAssessmentPayload = (title, categories) => {
  const errors = [];

  if (!title || !title.trim()) {
    errors.push('Assessment title is required');
  }

  if (!Array.isArray(categories) || categories.length === 0) {
    errors.push('At least one category is required');
    return errors; // no point checking deeper if there are no categories
  }

  categories.forEach((cat, ci) => {
    if (!cat.name || !cat.name.trim()) {
      errors.push(`Category #${ci + 1} is missing a name`);
    }
    if (!Array.isArray(cat.factors) || cat.factors.length === 0) {
      errors.push(
        `Category "${cat.name || ci + 1}" must have at least one factor`
      );
      return;
    }
    cat.factors.forEach((factor, fi) => {
      if (!factor.name || !factor.name.trim()) {
        errors.push(
          `Factor #${fi + 1} in category "${cat.name}" is missing a name`
        );
      }
      if (!Array.isArray(factor.questions) || factor.questions.length === 0) {
        errors.push(
          `Factor "${factor.name || fi + 1}" must have at least one question`
        );
        return;
      }
      factor.questions.forEach((q, qi) => {
        if (!q.text || !q.text.trim()) {
          errors.push(
            `Question #${qi + 1} in factor "${factor.name}" is missing text`
          );
        }
        if (
          ![
            'multiple_choice',
            'rating',
            'yes_no',
            'short_text',
            'long_text',
            'checkbox',
          ].includes(q.type)
        ) {
          errors.push(
            `Question #${qi + 1} in factor "${factor.name}" has an invalid type`
          );
        }
        if (
          (q.type === 'multiple_choice' || q.type === 'checkbox') &&
          (!Array.isArray(q.options) || q.options.length < 2)
        ) {
          errors.push(
            `Question "${q.text || qi + 1}" needs at least 2 options`
          );
        }
      });
    });
  });

  return errors;
};

// @route  POST /api/assessments
// @desc   Save the Builder draft as a new Assessment (snapshot).
//         Also upserts each category into the reusable Category library so
//         future builder sessions can "Load Categories" to reuse this work.
// @access Private
const createAssessment = asyncHandler(async (req, res) => {
  const { title, description, categories } = req.body;

  const errors = validateAssessmentPayload(title, categories);
  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  // Sync each builder category into the user's reusable library.
  // If a category came from the library (sourceCategory set) and still exists, update it.
  // Otherwise, create a new library category so it becomes available next time.
  const categoriesWithSource = await Promise.all(
    categories.map(async (cat) => {
      let sourceCategory = cat.sourceCategory || null;

      if (sourceCategory) {
        const existing = await Category.findOne({
          _id: sourceCategory,
          createdBy: req.user._id,
        });
        if (existing) {
          existing.factors = cat.factors;
          existing.name = cat.name.trim();
          await existing.save();
        } else {
          sourceCategory = null; // stale reference, fall through to create below
        }
      }

      if (!sourceCategory) {
        const newLibraryCategory = await Category.create({
          name: cat.name.trim(),
          factors: cat.factors,
          createdBy: req.user._id,
        });
        sourceCategory = newLibraryCategory._id;
      }

      return {
        name: cat.name.trim(),
        sourceCategory,
        factors: cat.factors,
      };
    })
  );

  const assessment = await Assessment.create({
    title: title.trim(),
    description: description ? description.trim() : '',
    categories: categoriesWithSource,
    createdBy: req.user._id,
  });

  res.status(201).json({ assessment });
});

// @route  GET /api/assessments
// @desc   List all assessments created by the logged-in user (Assessments page)
// @access Private
const getAssessments = asyncHandler(async (req, res) => {
  const assessments = await Assessment.find({ createdBy: req.user._id })
    .select('title description status createdAt categories')
    .sort({ createdAt: -1 });

  // Include a lightweight question count per assessment for display purposes
  const withCounts = assessments.map((a) => {
    const factorCount = a.categories.reduce((catSum, cat) => {
      return catSum + (cat.factors?.length || 0);
    }, 0);
    const questionCount = a.categories.reduce((catSum, cat) => {
      return (
        catSum +
        cat.factors.reduce((facSum, fac) => facSum + fac.questions.length, 0)
      );
    }, 0);
    const categoryCount = a.categories.length;
    return {
      _id: a._id,
      title: a.title,
      description: a.description,
      status: a.status,
      createdAt: a.createdAt,
      categoryCount,
      factorCount,
      questionCount,
    };
  });

  res.status(200).json({ assessments: withCounts });
});

// @route  GET /api/assessments/:id
// @desc   Get full assessment detail (used by Launch Pad to render all questions)
// @access Private
const getAssessmentById = asyncHandler(async (req, res) => {
  const assessment = await Assessment.findOne({
    _id: req.params.id,
    createdBy: req.user._id,
  });
  if (!assessment) {
    return res.status(404).json({ message: 'Assessment not found' });
  }
  res.status(200).json({ assessment });
});

// @route  DELETE /api/assessments/:id
// @access Private
const deleteAssessment = asyncHandler(async (req, res) => {
  const assessment = await Assessment.findOneAndDelete({
    _id: req.params.id,
    createdBy: req.user._id,
  });
  if (!assessment) {
    return res.status(404).json({ message: 'Assessment not found' });
  }
  res.status(200).json({ message: 'Assessment deleted successfully' });
});

module.exports = {
  createAssessment,
  getAssessments,
  getAssessmentById,
  deleteAssessment,
};
