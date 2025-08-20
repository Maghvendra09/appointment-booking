const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  slot: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Slot',
    required: true,
    unique: true
  },
  status: { 
    type: String, 
    enum: ['confirmed', 'cancelled'],
    default: 'confirmed'
  }
}, { timestamps: true });

bookingSchema.index({ user: 1, slot: 1 }, { unique: true });

// Slot updates are handled in the controller to prevent race conditions

module.exports = mongoose.model('Booking', bookingSchema);
