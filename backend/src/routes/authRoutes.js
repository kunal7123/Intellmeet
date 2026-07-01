const express = require('express');
const router = express.Router();
const { signup, login, getProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const rateLimit = require('express-rate-limit');

// Rate limiting — brute force attacks se bachao
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // sirf 10 attempts allowed
  message: { message: 'Bahut zyada attempts! 15 minute baad try karo.' }
});

// Routes
router.post('/signup', authLimiter, signup);
router.post('/login', authLimiter, login);
router.get('/profile', protect, getProfile);

module.exports = router;