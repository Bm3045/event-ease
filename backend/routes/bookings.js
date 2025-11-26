const express = require('express');
const {
  createBooking,
  getUserBookings,
  cancelBooking,
  getBooking
} = require('../controllers/bookings');
const { protect } = require('../middleware/auth');
const bookingLogger = require('../middleware/bookingLogger');

const router = express.Router();

// Apply booking logger middleware to all routes
router.use(bookingLogger);

router.post('/', protect, createBooking);
router.get('/my-bookings', protect, getUserBookings);
router.get('/:id', protect, getBooking);
router.put('/:id/cancel', protect, cancelBooking);

module.exports = router;