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

// Ensure one user can't book same slot multiple times
bookingSchema.index({ user: 1, slot: 1 }, { unique: true });

// Update slot status when booking is created
bookingSchema.post('save', async function(doc) {
  const Slot = mongoose.model('Slot');
  await Slot.findByIdAndUpdate(doc.slot, { 
    isBooked: true,
    bookedBy: doc.user
  });
});

// Update slot status when booking is cancelled
bookingSchema.post('findOneAndUpdate', async function(doc) {
  if (doc && doc.status === 'cancelled') {
    const Slot = mongoose.model('Slot');
    await Slot.findByIdAndUpdate(doc.slot, { 
      isBooked: false,
      bookedBy: null
    });
  }
});

module.exports = mongoose.model('Booking', bookingSchema);
