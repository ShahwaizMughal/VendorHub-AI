const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const searchController = require('../controllers/search.controller');

/**
 * GET /api/dashboard/buyer — SRS §3.2. Previously wired directly in
 * server.js behind `fakeAuth` (a hardcoded fake user id) as a temporary
 * measure before Developer 1's auth existed. Auth is real now, so this
 * moves into its own route file with real `authenticate`/`authorize`.
 */
router.get('/buyer', authenticate, authorize('buyer'), searchController.getBuyerDashboard);

module.exports = router;
