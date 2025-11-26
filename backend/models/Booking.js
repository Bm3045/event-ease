const mongoose = require('mongoose');
const moment = require('moment');

const bookingSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    unique: true,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  seats: {
    type: Number,
    required: [true, 'Please specify number of seats'],
    min: [1, 'At least 1 seat required'],
    max: [2, 'Maximum 2 seats per booking']
  },
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['confirmed', 'cancelled'],
    default: 'confirmed'
  },
  bookedAt: {
    type: Date,
    default: Date.now
  },
  cancelledAt: {
    type: Date
  }
});

// Check if booking can be cancelled
bookingSchema.methods.canBeCancelled = function() {
  const eventDate = moment(this.event.date);
  return moment().isBefore(eventDate);
};

// Virtual for formatted dates
bookingSchema.virtual('formattedBookedAt').get(function() {
  return moment(this.bookedAt).format('DD-MMM-YYYY');
});

bookingSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Booking', bookingSchema);