const mongoose = require('mongoose');
const moment = require('moment');

const eventSchema = new mongoose.Schema({
  eventId: {
    type: String,
    unique: true,
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please provide event title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide event description'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Please provide event category'],
    enum: ['Music', 'Tech', 'Business', 'Arts', 'Sports', 'Education', 'Other']
  },
  location: {
    type: String,
    required: [true, 'Please provide event location']
  },
  locationType: {
    type: String,
    enum: ['Online', 'In-Person'],
    required: [true, 'Please specify location type']
  },
  date: {
    type: Date,
    required: [true, 'Please provide event date']
  },
  startTime: {
    type: String,
    required: [true, 'Please provide start time']
  },
  endTime: {
    type: String,
    required: [true, 'Please provide end time']
  },
  capacity: {
    type: Number,
    required: [true, 'Please provide event capacity'],
    min: [1, 'Capacity must be at least 1']
  },
  price: {
    type: Number,
    default: 0,
    min: [0, 'Price cannot be negative']
  },
  image: {
    type: String,
    default: ''
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Virtual for event status
eventSchema.virtual('status').get(function() {
  const today = moment().startOf('day');
  const eventDate = moment(this.date).startOf('day');
  
  if (eventDate.isBefore(today)) return 'Completed';
  if (eventDate.isSame(today)) return 'Ongoing';
  return 'Upcoming';
});

// Ensure virtual fields are serialized
eventSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Event', eventSchema);