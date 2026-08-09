const express = require('express');
const router = express.Router();
const fakeAuth = require('../middleware/fakeAuth');
const searchController = require('../controllers/search.controller');

router.use(fakeAuth); // TEMPORARY - remove once real auth is ready

router.post('/ai', searchController.aiSearch);
router.get('/history', searchController.getSearchHistory);
router.get('/default', searchController.getDefaultVendors);

module.exports = router;