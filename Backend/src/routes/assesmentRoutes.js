const express = require('express');
const router = express.Router();
const {
  createAssessment,
  getAssessments,
  getAssessmentById,
  deleteAssessment,
} = require('../controllers/assessmentController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/').get(getAssessments).post(createAssessment);
router.route('/:id').get(getAssessmentById).delete(deleteAssessment);

module.exports = router;
