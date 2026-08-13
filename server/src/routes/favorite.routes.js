const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const favoriteController = require('../controllers/favorite.controller');

router.use(authenticate, authorize('buyer'));

router.post('/:vendorId', favoriteController.toggleFavorite);
router.get('/', favoriteController.listFavorites);

module.exports = router;