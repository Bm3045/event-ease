const Booking = require('../models/Booking');
const Event = require('../models/Event');
const { generateBookingId } = require('../utils/generateIds');
const moment = require('moment');

exports.createBooking = async (req, res) => {
  try {
    const { eventId, seats } = req.body;
    
    // Validate seats
    if (!seats || seats < 1 || seats > 2) {
      return res.status(400).json({
        success: false,
        message: 'You can book only 1 or 2 seats per event'
      });
    }
    
    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    // Check if event is in past
    if (moment().isAfter(moment(event.date))) {
      return res.status(400).json({
        success: false,
        message: 'Cannot book for past events'
      });
    }
    
    // Check available seats
    const existingBookings = await Booking.find({ 
      event: eventId, 
      status: 'confirmed' 
    });
    
    const bookedSeats = existingBookings.reduce((sum, booking) => sum + booking.seats, 0);
    const availableSeats = event.capacity - bookedSeats;
    
    if (availableSeats < seats) {
      return res.status(400).json({
        success: false,
        message: `Only ${availableSeats} seats available`
      });
    }
    
    // Check if user already booked this event
    const existingUserBooking = await Booking.findOne({
      user: req.user.id,
      event: eventId,
      status: 'confirmed'
    });
    
    if (existingUserBooking) {
      return res.status(400).json({
        success: false,
        message: 'You have already booked this event'
      });
    }
    
    // Calculate total amount
    const totalAmount = event.price * seats;
    
    // Create booking
    const booking = await Booking.create({
      bookingId: generateBookingId(),
      user: req.user.id,
      event: eventId,
      seats,
      totalAmount
    });
    
    await booking.populate('event');
    await booking.populate('user', 'name email');
    
    res.status(201).json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate('event')
      .sort({ bookedAt: -1 });
    
    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('event');
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Check if user owns the booking
    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking'
      });
    }
    
    // Check if booking can be cancelled
    if (!booking.canBeCancelled()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel booking after event has started'
      });
    }
    
    // Check if already cancelled
    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled'
      });
    }
    
    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    await booking.save();
    
    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('event')
      .populate('user', 'name email');
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Check if user owns the booking or is admin
    if (booking.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking'
      });
    }
    
    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};