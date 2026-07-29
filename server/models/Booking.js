const crypto = require('crypto');
const mongoose = require('mongoose');

const generateTicketCode = () => `EVT-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    numberOfTickets: { type: Number, required: true, min: 1 },
    subtotal: { type: Number, default: 0 },
    discountCode: { type: String, trim: true, uppercase: true },
    discountAmount: { type: Number, default: 0, min: 0 },
    totalPrice: { type: Number, required: true },
    ticketCode: {
      type: String,
      unique: true,
      sparse: true,
      default: generateTicketCode,
    },
    bookingStatus: {
      type: String,
      enum: ['confirmed', 'cancelled'],
      default: 'confirmed',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'paid',
    },
    paymentProvider: { type: String, enum: ['demo', 'razorpay', 'stripe'], default: 'demo' },
    paymentReference: { type: String, trim: true },
    qrCodeData: { type: String, default: '' },
    reminderSent: { type: Boolean, default: false },
    checkedIn: { type: Boolean, default: false },
    checkedInAt: Date,
    bookingDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

bookingSchema.pre('validate', function (next) {
  if (!this.ticketCode) this.ticketCode = generateTicketCode();
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
