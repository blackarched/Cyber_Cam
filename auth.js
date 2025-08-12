const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

// Public route for user login
router.post('/login', authController.login);

// Public route for new user registration
router.post('/register', authController.register);

module.exports = router;