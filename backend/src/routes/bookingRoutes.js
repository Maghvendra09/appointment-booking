const express = require('express');
const { 
  bookSlot, 
  getMyBookings, 
  getAllBookings,
  cancelBooking 
} = require('../controllers/bookingController');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Protected routes (require authentication)
router.use(auth);

// Book a slot
router.post('/', bookSlot);

// Get user's bookings
router.get('/my-bookings', getMyBookings);

// Cancel a booking
router.put('/:bookingId/cancel', cancelBooking);

// Admin only route to get all bookings
router.get('/all', adminAuth, getAllBookings);

module.exports = router;
