const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  isBooked: { type: Boolean, default: false },
  bookedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    default: null
  }
}, { timestamps: true });

// Index for faster querying
slotSchema.index({ startTime: 1, endTime: 1 }, { unique: true });

// Prevent double booking
slotSchema.pre('save', function(next) {
  if (this.isModified('isBooked') && this.isBooked && !this.bookedBy) {
    const err = new Error('Cannot book slot without user');
    return next(err);
  }
  next();
});

module.exports = mongoose.model('Slot', slotSchema);
