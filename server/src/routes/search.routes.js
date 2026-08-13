const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const searchController = require('../controllers/search.controller');

router.use(authenticate, authorize('buyer'));

router.post('/ai', searchController.aiSearch);
router.get('/history', searchController.getSearchHistory);
router.get('/default', searchController.getDefaultVendors);

module.exports = router;