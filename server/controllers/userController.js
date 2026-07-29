const User = require('../models/User');
const Event = require('../models/Event');
const { uploadBuffer } = require('../utils/cloudinaryUpload');

// @route GET /api/users/profile
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('favorites');
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/users/profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (phone) user.phone = phone;

    if (req.file) {
      const result = await uploadBuffer(req.file.buffer, 'event-portal/avatars');
      user.avatar = { url: result.secure_url, public_id: result.public_id };
    }

    await user.save();
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/users/favorites/:eventId
exports.toggleFavorite = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const { eventId } = req.params;

    const idx = user.favorites.findIndex((id) => id.toString() === eventId);
    if (idx > -1) {
      user.favorites.splice(idx, 1);
    } else {
      const event = await Event.findById(eventId);
      if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
      user.favorites.push(eventId);
    }

    await user.save();
    res.json({ success: true, favorites: user.favorites });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/users/favorites
exports.getFavorites = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('favorites');
    res.json({ success: true, favorites: user.favorites });
  } catch (err) {
    next(err);
  }
};
