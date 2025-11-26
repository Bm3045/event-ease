const Event = require('../models/Event');
const Booking = require('../models/Booking');
const { generateEventId } = require('../utils/generateIds');
const moment = require('moment');

exports.getAllEvents = async (req, res) => {
  try {
    const { category, locationType, date, page = 1, limit = 10 } = req.query;
    
    let query = {};
    
    // Filter by category
    if (category && category !== 'all') {
      query.category = category;
    }
    
    // Filter by location type
    if (locationType && locationType !== 'all') {
      query.locationType = locationType;
    }
    
    // Filter by date range
    if (date) {
      const startDate = moment(date).startOf('day');
      const endDate = moment(date).endOf('day');
      query.date = { $gte: startDate, $lte: endDate };
    }
    
    const events = await Event.find(query)
      .populate('createdBy', 'name email')
      .sort({ date: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Event.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: events.length,
      total,
      pagination: {
        page: Number(page),
        pages: Math.ceil(total / limit)
      },
      data: events
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('createdBy', 'name email');
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    // Get booked seats count
    const bookedSeats = await Booking.aggregate([
      { $match: { event: event._id, status: 'confirmed' } },
      { $group: { _id: null, totalSeats: { $sum: '$seats' } } }
    ]);
    
    const availableSeats = event.capacity - (bookedSeats[0]?.totalSeats || 0);
    
    res.status(200).json({
      success: true,
      data: {
        ...event.toObject(),
        availableSeats
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const eventData = {
      ...req.body,
      eventId: generateEventId(),
      createdBy: req.user.id
    };
    
    const event = await Event.create(eventData);
    
    await event.populate('createdBy', 'name email');
    
    res.status(201).json({
      success: true,
      data: event
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    let event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    // Check if user is event creator or admin
    if (event.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this event'
      });
    }
    
    event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('createdBy', 'name email');
    
    res.status(200).json({
      success: true,
      data: event
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    // Check if user is event creator or admin
    if (event.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this event'
      });
    }
    
    // Check if there are any bookings for this event
    const bookingsCount = await Booking.countDocuments({ event: event._id });
    if (bookingsCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete event with existing bookings'
      });
    }
    
    await Event.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.getEventAttendees = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    const attendees = await Booking.find({ event: event._id, status: 'confirmed' })
      .populate('user', 'name email')
      .select('user seats bookedAt');
    
    res.status(200).json({
      success: true,
      data: {
        event: event.title,
        totalAttendees: attendees.reduce((sum, booking) => sum + booking.seats, 0),
        attendees
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};