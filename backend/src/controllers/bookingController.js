const Booking = require('../models/Booking');
const Slot = require('../models/Slot');

// Book a slot
const bookSlot = async (req, res) => {
  const session = await Booking.startSession();
  session.startTransaction();
  
  try {
    const { slotId } = req.body;
    const userId = req.user._id;
    
    // Check if slot exists and is available
    const slot = await Slot.findById(slotId).session(session);
    
    if (!slot) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ 
        error: { 
          code: 'SLOT_NOT_FOUND', 
          message: 'Slot not found' 
        } 
      });
    }
    
    if (slot.isBooked) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ 
        error: { 
          code: 'SLOT_ALREADY_BOOKED', 
          message: 'This slot is already booked' 
        } 
      });
    }
    
    // Create booking
    const booking = new Booking({
      user: userId,
      slot: slotId,
      status: 'confirmed'
    });
    
    // Mark slot as booked
    slot.isBooked = true;
    slot.bookedBy = userId;
    
    // Save both in a transaction
    await booking.save({ session });
    await slot.save({ session });
    
    await session.commitTransaction();
    session.endSession();
    
    res.status(201).json({
      message: 'Slot booked successfully',
      booking
    });
    
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    console.error('Booking error:', error);
    res.status(500).json({ 
      error: { 
        code: 'BOOKING_ERROR', 
        message: 'Error booking slot' 
      } 
    });
  }
};

// Get user's bookings
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('slot', 'startTime endTime')
      .sort({ createdAt: -1 });
      
    res.json(bookings);
    
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ 
      error: { 
        code: 'GET_BOOKINGS_ERROR', 
        message: 'Error retrieving bookings' 
      } 
    });
  }
};

// Get all bookings (admin only)
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'name email')
      .populate('slot', 'startTime endTime')
      .sort({ createdAt: -1 });
      
    res.json(bookings);
    
  } catch (error) {
    console.error('Get all bookings error:', error);
    res.status(500).json({ 
      error: { 
        code: 'GET_ALL_BOOKINGS_ERROR', 
        message: 'Error retrieving all bookings' 
      } 
    });
  }
};

// Cancel a booking
const cancelBooking = async (req, res) => {
  const session = await Booking.startSession();
  session.startTransaction();
  
  try {
    const { bookingId } = req.params;
    const userId = req.user._id;
    
    // Find booking
    const booking = await Booking.findOne({
      _id: bookingId,
      user: userId,
      status: 'confirmed'
    }).session(session);
    
    if (!booking) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ 
        error: { 
          code: 'BOOKING_NOT_FOUND', 
          message: 'Booking not found or already cancelled' 
        } 
      });
    }
    
    // Find and update slot
    const slot = await Slot.findById(booking.slot).session(session);
    if (slot) {
      slot.isBooked = false;
      slot.bookedBy = null;
      await slot.save({ session });
    }
    
    // Update booking status
    booking.status = 'cancelled';
    await booking.save({ session });
    
    await session.commitTransaction();
    session.endSession();
    
    res.json({ 
      message: 'Booking cancelled successfully',
      booking
    });
    
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    console.error('Cancel booking error:', error);
    res.status(500).json({ 
      error: { 
        code: 'CANCEL_BOOKING_ERROR', 
        message: 'Error cancelling booking' 
      } 
    });
  }
};

module.exports = {
  bookSlot,
  getMyBookings,
  getAllBookings,
  cancelBooking
};
