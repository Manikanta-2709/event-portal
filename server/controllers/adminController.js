const User = require('../models/User');
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const { destroy } = require('../utils/cloudinaryUpload');

// @route GET /api/admin/stats
exports.getStats = async (req, res, next) => {
  try {
    const [totalUsers, totalOrganizers, totalEvents, bookings, recentUsers] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'organizer' }),
      Event.countDocuments(),
      Booking.find({ bookingStatus: 'confirmed' }),
      User.find().sort({ createdAt: -1 }).limit(5).select('name email role createdAt'),
    ]);

    const totalRevenue = bookings.reduce((sum, b) => sum + b.totalPrice, 0);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalOrganizers,
        totalEvents,
        totalBookings: bookings.length,
        totalRevenue,
      },
      recentUsers,
    });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/admin/users
exports.getUsers = async (req, res, next) => {
  try {
    const { role } = req.query;
    const filter = role ? { role } : {};
    const users = await User.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/admin/users/:id/block
exports.toggleBlockUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot block an admin' });
    }
    user.isBlocked = !user.isBlocked;
    await user.save();
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/admin/organizers/:id/approve
exports.approveOrganizer = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role !== 'organizer') {
      return res.status(404).json({ success: false, message: 'Organizer not found' });
    }
    user.isApproved = true;
    await user.save();
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/admin/events
exports.getAllEvents = async (req, res, next) => {
  try {
    const events = await Event.find().populate('organizer', 'name email').sort({ createdAt: -1 });
    res.json({ success: true, events });
  } catch (err) {
    next(err);
  }
};

// @route DELETE /api/admin/events/:id (remove inappropriate event)
exports.removeEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    if (event.banner?.public_id) await destroy(event.banner.public_id);
    await Booking.deleteMany({ event: event._id });
    await Review.deleteMany({ event: event._id });
    await event.deleteOne();
    res.json({ success: true, message: 'Event removed' });
  } catch (err) {
    next(err);
  }
};
