const QRCode = require('qrcode');
const Booking = require('../models/Booking');
const Event = require('../models/Event');
const Coupon = require('../models/Coupon');
const sendEmail = require('../utils/sendEmail');

const calculateDiscount = async (couponCode, subtotal) => {
  if (!couponCode) return { discountCode: undefined, discountAmount: 0 };

  const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), active: true });
  if (!coupon) {
    const err = new Error('Invalid coupon code');
    err.statusCode = 400;
    throw err;
  }

  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    const err = new Error('Coupon has expired');
    err.statusCode = 400;
    throw err;
  }

  if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
    const err = new Error('Coupon usage limit reached');
    err.statusCode = 400;
    throw err;
  }

  if (subtotal < coupon.minOrderValue) {
    const err = new Error(`Coupon requires minimum order value of ₹${coupon.minOrderValue}`);
    err.statusCode = 400;
    throw err;
  }

  const rawDiscount =
    coupon.discountType === 'percentage' ? (subtotal * coupon.discountValue) / 100 : coupon.discountValue;
  const cappedDiscount = coupon.maxDiscount > 0 ? Math.min(rawDiscount, coupon.maxDiscount) : rawDiscount;
  const discountAmount = Math.min(subtotal, Math.round(cappedDiscount));

  coupon.usedCount += 1;
  await coupon.save();

  return { discountCode: coupon.code, discountAmount };
};

const generateQRCode = async (ticketCode, title) => {
  try {
    return await QRCode.toDataURL(`EVENTRA|${ticketCode}|${title}`);
  } catch (error) {
    console.warn(`QR code generation failed: ${error.message}`);
    return '';
  }
};

// @route POST /api/bookings
exports.createBooking = async (req, res, next) => {
  try {
    const { eventId, numberOfTickets, couponCode, paymentProvider = 'demo', paymentReference } = req.body;
    const event = await Event.findById(eventId);

    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    if (event.registrationClosed) {
      return res.status(400).json({ success: false, message: 'Registration is closed for this event' });
    }
    if (new Date(event.date) < new Date()) {
      return res.status(400).json({ success: false, message: 'This event has already occurred' });
    }
    if (event.availableSeats < numberOfTickets) {
      return res.status(400).json({ success: false, message: 'Not enough seats available' });
    }

    const subtotal = event.ticketPrice * numberOfTickets;
    const { discountCode, discountAmount } = await calculateDiscount(couponCode, subtotal);
    const totalPrice = Math.max(0, subtotal - discountAmount);
    const finalPaymentReference = paymentReference || `${paymentProvider.toUpperCase()}-${Date.now()}`;

    const booking = await Booking.create({
      user: req.user._id,
      event: event._id,
      numberOfTickets,
      subtotal,
      discountCode,
      discountAmount,
      totalPrice,
      paymentProvider,
      paymentReference: finalPaymentReference,
    });

    const qrCodeData = await generateQRCode(booking.ticketCode, event.title);
    booking.qrCodeData = qrCodeData;
    await booking.save();

    event.availableSeats -= numberOfTickets;
    event.bookingsCount += 1;
    await event.save();

    const populated = await booking.populate('event', 'title date time venue city banner');

    try {
      await sendEmail({
        to: req.user.email,
        subject: `Booking confirmed: ${event.title}`,
        html: `
          <h2>Booking confirmed</h2>
          <p>Hi ${req.user.name}, your booking for <strong>${event.title}</strong> is confirmed.</p>
          <ul>
            <li><strong>Booking ID:</strong> ${booking._id}</li>
            <li><strong>Ticket code:</strong> ${booking.ticketCode}</li>
            <li><strong>Date:</strong> ${new Date(event.date).toLocaleDateString()} at ${event.time}</li>
            <li><strong>Venue:</strong> ${event.venue}, ${event.city}</li>
            <li><strong>Tickets:</strong> ${numberOfTickets}</li>
            ${discountAmount ? `<li><strong>Discount:</strong> ${discountCode} saved ₹${discountAmount}</li>` : ''}
            <li><strong>Total paid:</strong> ₹${totalPrice}</li>
            <li><strong>Payment provider:</strong> ${paymentProvider}</li>
          </ul>
          <p>Please keep this email as your booking confirmation.</p>
        `,
      });
    } catch (emailErr) {
      console.warn(`Booking confirmation email failed for ${booking._id}: ${emailErr.message}`);
    }

    res.status(201).json({ success: true, booking: populated });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/bookings/check-in
exports.checkInBooking = async (req, res, next) => {
  try {
    const ticketCode = String(req.body.ticketCode || '').trim().toUpperCase();
    const booking = await Booking.findOne({ ticketCode }).populate('event').populate('user', 'name email phone');

    if (!booking) return res.status(404).json({ success: false, message: 'Ticket not found' });
    if (booking.bookingStatus !== 'confirmed') {
      return res.status(400).json({ success: false, message: 'Ticket is not active' });
    }

    const isOwner = booking.event.organizer.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to check in this ticket' });
    }

    if (booking.checkedIn) {
      return res.status(400).json({ success: false, message: 'Ticket already checked in', booking });
    }

    booking.checkedIn = true;
    booking.checkedInAt = new Date();
    await booking.save();

    res.json({ success: true, message: 'Check-in successful', booking });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/bookings (current user's booking history)
exports.getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('event', 'title date time venue city banner ticketPrice')
      .sort({ createdAt: -1 });
    res.json({ success: true, bookings });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/bookings/:id
exports.getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('event').populate('user', 'name email');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    const isOwner = booking.user._id.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, booking });
  } catch (err) {
    next(err);
  }
};

// @route DELETE /api/bookings/:id (cancel booking)
exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this booking' });
    }
    if (booking.bookingStatus === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Booking already cancelled' });
    }

    booking.bookingStatus = 'cancelled';
    booking.paymentStatus = 'refunded';
    await booking.save();

    const event = await Event.findById(booking.event);
    if (event) {
      event.availableSeats += booking.numberOfTickets;
      event.bookingsCount = Math.max(0, event.bookingsCount - 1);
      await event.save();
    }

    res.json({ success: true, message: 'Booking cancelled', booking });
  } catch (err) {
    next(err);
  }
};
