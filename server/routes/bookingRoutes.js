const express = require('express');
const { body } = require('express-validator');
const {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
} = require('../controllers/bookingController');
const protect = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.post(
  '/',
  protect,
  [
    body('eventId').notEmpty().withMessage('Event ID is required'),
    body('numberOfTickets').isInt({ min: 1 }).withMessage('At least 1 ticket is required'),
  ],
  validate,
  createBooking
);

router.get('/', protect, getMyBookings);
router.get('/:id', protect, getBookingById);
router.delete('/:id', protect, cancelBooking);

module.exports = router;
