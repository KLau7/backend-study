const express = require('express');
const { restrictTo, protect } = require('../controllers/authController');
const {
  getReviews,
  setTourUserIds,
  createReview,
  deleteReview,
  updateReview,
  getReview,
} = require('../controllers/reviewController');

const router = express.Router({ mergeParams: true });

router.use(protect);

router
  .route('/')
  .get(getReviews)
  .post(restrictTo('user', 'admin'), setTourUserIds, createReview);

router.route('/:id').get(getReview).patch(updateReview).delete(deleteReview);

module.exports = router;
