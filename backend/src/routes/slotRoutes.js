const express = require('express');
const { generateSlots, getAvailableSlots } = require('../controllers/slotController');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Admin only route to generate slots
router.post('/generate', auth, adminAuth, generateSlots);

// Public route to get available slots
router.get('/', getAvailableSlots);

module.exports = router;
