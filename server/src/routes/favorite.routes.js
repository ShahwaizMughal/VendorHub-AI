const express = require('express');
const router = express.Router();
const fakeAuth = require('../middleware/fakeAuth');
const favoriteController = require('../controllers/favorite.controller');

router.use(fakeAuth); // TEMPORARY - remove once real auth is ready

router.post('/:vendorId', favoriteController.toggleFavorite);
router.get('/', favoriteController.listFavorites);

module.exports = router;