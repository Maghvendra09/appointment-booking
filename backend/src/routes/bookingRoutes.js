const express = require('express');
const { 
  bookSlot, 
  getMyBookings, 
  getAllBookings,
  cancelBooking 
} = require('../controllers/bookingController');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.post('/', bookSlot);

router.get('/my-bookings', getMyBookings);

router.put('/:bookingId/cancel', cancelBooking);

router.get('/all', adminAuth, getAllBookings);

module.exports = router;
