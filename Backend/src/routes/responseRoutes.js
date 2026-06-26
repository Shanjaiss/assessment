const express = require('express');
const router = express.Router();
const {
  submitResponse,
  getResponses,
  getResponseById,
  getResponsesByAssessment,
} = require('../controllers/responseController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/').get(getResponses).post(submitResponse);
router.get('/assessment/:assessmentId', getResponsesByAssessment);
router.get('/:id', getResponseById);

module.exports = router;
