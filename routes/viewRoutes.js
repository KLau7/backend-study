const express = require('express');

const router = express.Router();

const {
  getOverview,
  getTour,
  getTourDetail,
} = require('../controllers/viewController');

router.get('/', getOverview);

router.get('/tours/:slug', getTour);
// router.get('/tour/:slug', getTourDetail);

module.exports = router;
