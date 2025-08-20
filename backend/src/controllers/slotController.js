const Slot = require('../models/Slot');
const Booking = require('../models/Booking');

// Generate slots for the next 7 days
const generateSlots = async (req, res) => {
  try {
    const slots = [];
    const now = new Date();
    const startDate = new Date(now);
    startDate.setHours(0, 0, 0, 0);
    
    // Generate for next 7 days
    for (let day = 0; day < 7; day++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + day);
      
      // Generate slots from 9 AM to 5 PM, 30-minute intervals
      for (let hour = 9; hour < 17; hour++) {
        for (let minute of [0, 30]) {
          const startTime = new Date(currentDate);
          startTime.setHours(hour, minute, 0, 0);
          
          const endTime = new Date(startTime);
          endTime.setMinutes(startTime.getMinutes() + 30);
          
          // Skip if slot is in the past
          if (startTime < now) continue;
          
          slots.push({
            startTime,
            endTime,
            isBooked: false
          });
        }
      }
    }
    
    // Remove existing slots and insert new ones
    await Slot.deleteMany({});
    const createdSlots = await Slot.insertMany(slots);
    
    res.status(201).json({
      message: 'Slots generated successfully',
      count: createdSlots.length,
      slots: createdSlots
    });
    
  } catch (error) {
    console.error('Generate slots error:', error);
    res.status(500).json({ 
      error: { 
        code: 'SLOT_GENERATION_ERROR', 
        message: 'Error generating slots' 
      } 
    });
  }
};

// Get available slots within date range
const getAvailableSlots = async (req, res) => {
  try {
    const { from, to } = req.query;
    
    if (!from || !to) {
      return res.status(400).json({ 
        error: { 
          code: 'MISSING_DATES', 
          message: 'Please provide both from and to dates' 
        } 
      });
    }
    
    const startDate = new Date(from);
    const endDate = new Date(to);
    
    // Find available slots within date range
    const slots = await Slot.find({
      startTime: { $gte: startDate, $lte: endDate },
      isBooked: false
    }).sort({ startTime: 1 });
    
    res.json(slots);
    
  } catch (error) {
    console.error('Get slots error:', error);
    res.status(500).json({ 
      error: { 
        code: 'GET_SLOTS_ERROR', 
        message: 'Error retrieving slots' 
      } 
    });
  }
};

module.exports = {
  generateSlots,
  getAvailableSlots
};
