const express = require('express');
const { generateSlots, getAvailableSlots, deleteSlot } = require('../controllers/slotController');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/generate', auth, adminAuth, generateSlots);
router.get('/', getAvailableSlots);
router.delete('/:id', auth, adminAuth, deleteSlot);

module.exports = router;
