const express = require('express');
const { body } = require('express-validator');
const {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  checkInBooking,
} = require('../controllers/bookingController');
const authorize = require('../middleware/role');
const protect = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.post(
  '/',
  protect,
  [
    body('eventId').notEmpty().withMessage('Event ID is required'),
    body('numberOfTickets').isInt({ min: 1 }).withMessage('At least 1 ticket is required'),
    body('couponCode').optional({ checkFalsy: true }).trim(),
    body('paymentProvider').optional().isIn(['demo', 'razorpay', 'stripe']).withMessage('Unsupported payment provider'),
  ],
  validate,
  createBooking
);

router.get('/', protect, getMyBookings);
router.post(
  '/check-in',
  protect,
  authorize('organizer', 'admin'),
  [body('ticketCode').notEmpty().withMessage('Ticket code is required')],
  validate,
  checkInBooking
);
router.get('/:id', protect, getBookingById);
router.delete('/:id', protect, cancelBooking);

module.exports = router;
