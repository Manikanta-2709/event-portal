const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: ['Music', 'Tech', 'Sports', 'Business', 'Arts', 'Food', 'Education', 'Other'],
    },
    venue: { type: String, required: true },
    city: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    ticketPrice: { type: Number, required: true, min: 0 },
    maxSeats: { type: Number, required: true, min: 1 },
    availableSeats: { type: Number, required: true },
    banner: {
      url: { type: String, default: '' },
      public_id: { type: String, default: '' },
    },
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['draft', 'published'], default: 'published' },
    registrationClosed: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    viewsCount: { type: Number, default: 0 },
    bookingsCount: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    reviewsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

eventSchema.index({ title: 'text', description: 'text', city: 'text' });

module.exports = mongoose.model('Event', eventSchema);
