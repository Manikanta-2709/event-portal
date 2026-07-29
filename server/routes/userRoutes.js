const express = require('express');
const {
  getProfile,
  updateProfile,
  toggleFavorite,
  getFavorites,
} = require('../controllers/userController');
const protect = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.get('/profile', protect, getProfile);
router.put('/profile', protect, upload.single('avatar'), updateProfile);
router.get('/favorites', protect, getFavorites);
router.post('/favorites/:eventId', protect, toggleFavorite);

module.exports = router;
