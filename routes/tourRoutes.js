const express = require('express');
const { protect, restrictTo } = require('../controllers/authController');
const {
  getAllTours,
  createTour,
  getTourById,
  updateTour,
  deleteTour,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan,
  getToursWithin,
  getDistances,
} = require('../controllers/tourController');

const reviewRouter = require('./reviewRoutes');

const router = express.Router();

router.route('/within/:distance/center/:latlng/unit/:unit').get(getToursWithin);
router.route('/distances/:latlng/unit/:unit').get(getDistances);

router.use('/:tourId/reviews', reviewRouter);

router.route('/top-5').get(aliasTopTours, getAllTours);
router.route('/stats').get(getTourStats);
router.route('/monthly-plan/:year').get(getMonthlyPlan);

router
  .route('/')
  .get(protect, getAllTours)
  .post(protect, restrictTo('admin', 'lead-guide'), createTour);
router
  .route('/:id')
  .get(getTourById)
  .patch(updateTour)
  .delete(protect, restrictTo('admin'), deleteTour);

module.exports = router;
