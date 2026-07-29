const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, maxlength: 600 },
  },
  { timestamps: true }
);

reviewSchema.index({ user: 1, event: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
