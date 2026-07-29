const Event = require('../models/Event');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const { uploadBuffer, destroy } = require('../utils/cloudinaryUpload');

const refreshEventRating = async (eventId) => {
  const [stats] = await Review.aggregate([
    { $match: { event: eventId } },
    { $group: { _id: '$event', averageRating: { $avg: '$rating' }, reviewsCount: { $sum: 1 } } },
  ]);

  await Event.findByIdAndUpdate(eventId, {
    averageRating: stats ? Number(stats.averageRating.toFixed(1)) : 0,
    reviewsCount: stats?.reviewsCount || 0,
  });
};

// @route GET /api/events
// supports search, filter (category, date, city, price range), sort, pagination
exports.getEvents = async (req, res, next) => {
  try {
    const {
      search,
      category,
      city,
      date,
      minPrice,
      maxPrice,
      sortBy = 'date',
      order = 'asc',
      page = 1,
      limit = 9,
    } = req.query;

    const filter = { isApproved: true };

    if (search) filter.$text = { $search: search };
    if (category) filter.category = category;
    if (city) filter.city = new RegExp(city, 'i');
    if (date) filter.date = { $gte: new Date(date), $lt: new Date(new Date(date).setDate(new Date(date).getDate() + 1)) };
    if (minPrice || maxPrice) {
      filter.ticketPrice = {};
      if (minPrice) filter.ticketPrice.$gte = Number(minPrice);
      if (maxPrice) filter.ticketPrice.$lte = Number(maxPrice);
    }

    const sortField = sortBy === 'popularity' ? 'bookingsCount' : sortBy === 'price' ? 'ticketPrice' : 'date';
    const sortOrder = order === 'desc' ? -1 : 1;

    const skip = (Number(page) - 1) * Number(limit);

    const [events, total] = await Promise.all([
      Event.find(filter)
        .populate('organizer', 'name email')
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(Number(limit)),
      Event.countDocuments(filter),
    ]);

    res.json({
      success: true,
      events,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      totalEvents: total,
    });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/events/:id
exports.getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id).populate('organizer', 'name email phone');
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    const reviews = await Review.find({ event: event._id })
      .populate('user', 'name avatar')
      .sort({ updatedAt: -1 })
      .limit(20);

    res.json({ success: true, event, reviews });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/events (organizer)
exports.createEvent = async (req, res, next) => {
  try {
    const { title, description, category, venue, city, date, time, ticketPrice, maxSeats } = req.body;

    let banner = { url: '', public_id: '' };
    if (req.file) {
      const result = await uploadBuffer(req.file.buffer, 'event-portal/banners');
      banner = { url: result.secure_url, public_id: result.public_id };
    }

    const event = await Event.create({
      title,
      description,
      category,
      venue,
      city,
      date,
      time,
      ticketPrice,
      maxSeats,
      availableSeats: maxSeats,
      banner,
      organizer: req.user._id,
    });

    res.status(201).json({ success: true, event });
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/events/:id (organizer who owns it, or admin)
exports.updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this event' });
    }

    const fields = ['title', 'description', 'category', 'venue', 'city', 'date', 'time', 'ticketPrice'];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) event[f] = req.body[f];
    });

    if (req.body.maxSeats !== undefined) {
      const diff = Number(req.body.maxSeats) - event.maxSeats;
      event.maxSeats = Number(req.body.maxSeats);
      event.availableSeats = Math.max(0, event.availableSeats + diff);
    }

    if (req.file) {
      if (event.banner.public_id) await destroy(event.banner.public_id);
      const result = await uploadBuffer(req.file.buffer, 'event-portal/banners');
      event.banner = { url: result.secure_url, public_id: result.public_id };
    }

    await event.save();
    res.json({ success: true, event });
  } catch (err) {
    next(err);
  }
};

// @route DELETE /api/events/:id (organizer who owns it, or admin)
exports.deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this event' });
    }

    if (event.banner.public_id) await destroy(event.banner.public_id);
    await Booking.deleteMany({ event: event._id });
    await Review.deleteMany({ event: event._id });
    await event.deleteOne();

    res.json({ success: true, message: 'Event deleted' });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/events/:id/reviews
exports.createOrUpdateReview = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    const booking = await Booking.findOne({
      event: event._id,
      user: req.user._id,
      bookingStatus: 'confirmed',
    });

    if (!booking) {
      return res.status(403).json({
        success: false,
        message: 'Only confirmed attendees can review this event',
      });
    }

    const review = await Review.findOneAndUpdate(
      { event: event._id, user: req.user._id },
      {
        rating: Number(req.body.rating),
        comment: req.body.comment || '',
      },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    ).populate('user', 'name avatar');

    await refreshEventRating(event._id);
    const updatedEvent = await Event.findById(event._id).populate('organizer', 'name email phone');

    res.status(201).json({ success: true, event: updatedEvent, review });
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/events/:id/close-registration (organizer)
exports.closeRegistration = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    event.registrationClosed = true;
    await event.save();
    res.json({ success: true, event });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/events/organizer/mine (organizer)
exports.getMyEvents = async (req, res, next) => {
  try {
    const events = await Event.find({ organizer: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, events });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/events/:id/attendees (organizer who owns it, or admin)
exports.getEventAttendees = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const bookings = await Booking.find({ event: event._id, bookingStatus: 'confirmed' }).populate(
      'user',
      'name email phone'
    );

    res.json({ success: true, attendees: bookings });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/events/organizer/revenue (organizer)
exports.getOrganizerRevenue = async (req, res, next) => {
  try {
    const events = await Event.find({ organizer: req.user._id }).select('_id title');
    const eventIds = events.map((e) => e._id);

    const bookings = await Booking.find({
      event: { $in: eventIds },
      bookingStatus: 'confirmed',
    });

    const totalRevenue = bookings.reduce((sum, b) => sum + b.totalPrice, 0);
    const totalBookings = bookings.length;

    const byEvent = events.map((event) => {
      const eventBookings = bookings.filter((b) => b.event.toString() === event._id.toString());
      return {
        eventId: event._id,
        title: event.title,
        revenue: eventBookings.reduce((sum, b) => sum + b.totalPrice, 0),
        bookings: eventBookings.length,
      };
    });

    res.json({
      success: true,
      totalRevenue,
      totalBookings,
      totalEvents: events.length,
      byEvent,
    });
  } catch (err) {
    next(err);
  }
};
