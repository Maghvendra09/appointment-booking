const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Slot = require('../models/Slot');

const bookSlot = async (req, res) => {
  console.log('Booking request received:', req.body);
  
  if (!req.body.slotId) {
    return res.status(400).json({
      error: {
        code: 'MISSING_SLOT_ID',
        message: 'Slot ID is required in the request body'
      }
    });
  }
  
  const MAX_RETRIES = 3;
  let retryCount = 0;
  let lastError;
  
  while (retryCount < MAX_RETRIES) {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      const { slotId } = req.body;
      const userId = req.user?._id;
      
      if (!userId) {
        throw new Error('User not authenticated');
      }
      
      console.log(`Processing booking - User: ${userId}, Slot: ${slotId}`);
      
      // Check for existing booking first
      const existingBooking = await Booking.findOne({ slot: slotId , status: 'confirmed' })
        .session(session);
        
      console.log('Existing booking check:', existingBooking ? 'Found' : 'Not found');
      
      if (existingBooking) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ 
          error: { 
            code: 'SLOT_ALREADY_BOOKED', 
            message: 'This slot is already booked' 
          } 
        });
      }
      
      // Find and lock the slot
      const slot = await Slot.findById(slotId)
        .session(session)
        .select('+isBooked +bookedBy')
        .lean();
      
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
      
      // Create booking and update slot in a single transaction
      const [booking] = await Promise.all([
        Booking.create([{
          user: userId,
          slot: slotId,
          status: 'confirmed'
        }], { session }),
        
        Slot.findByIdAndUpdate(
          slotId,
          { 
            $set: { 
              isBooked: true,
              bookedBy: userId 
            } 
          },
          { session, new: true }
        )
      ]);
    
      await session.commitTransaction();
      session.endSession();
      
      return res.status(201).json({
        message: 'Slot booked successfully',
        booking
      });
      
    } catch (error) {
      try {
        await session.abortTransaction();
      } catch (abortError) {
        console.error('Error aborting transaction:', abortError);
      } finally {
        session.endSession();
      }
      
      // Log the error for debugging
      console.error('Booking error (attempt', retryCount + 1, '):', error);
      lastError = error;
      
      // If it's not a write conflict or we've exceeded retries, return the error
      if (error.code !== 112 || retryCount >= MAX_RETRIES - 1) {
        const statusCode = error.code === 11000 ? 409 : 500;
        return res.status(statusCode).json({ 
          error: { 
            code: error.code || 'BOOKING_ERROR',
            message: error.code === 11000 
              ? 'This slot has already been booked by another user' 
              : error.message || 'Error processing booking'
          } 
        });
      }
      
      // Exponential backoff before retry
      const delay = Math.pow(2, retryCount) * 100;
      await new Promise(resolve => setTimeout(resolve, delay));
      retryCount++;
      console.log(`Retry ${retryCount} for booking slot...`);
    }
  }
};

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

const cancelBooking = async (req, res) => {
  const session = await Booking.startSession();
  session.startTransaction();
  
  try {
    const { bookingId } = req.params;
    const userId = req.user._id;
    
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
    
    const slot = await Slot.findById(booking.slot).session(session);
    if (slot) {
      slot.isBooked = false;
      slot.bookedBy = null;
      await slot.save({ session });
    }
    
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
