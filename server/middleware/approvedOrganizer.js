const requireApprovedOrganizer = (req, res, next) => {
  if (req.user?.role === 'organizer' && !req.user.isApproved) {
    return res.status(403).json({
      success: false,
      message: 'Your organizer account is pending admin approval',
    });
  }

  next();
};

module.exports = requireApprovedOrganizer;
