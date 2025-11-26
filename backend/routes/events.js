const express = require('express');
const {
  getAllEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventAttendees
} = require('../controllers/events');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', getAllEvents);
router.get('/:id', getEvent);

// Protected routes
router.post('/', protect, authorize('admin'), createEvent);
router.put('/:id', protect, updateEvent);
router.delete('/:id', protect, deleteEvent);

// Admin only routes
router.get('/:id/attendees', protect, authorize('admin'), getEventAttendees);

module.exports = router;