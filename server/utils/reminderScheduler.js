const cron = require('node-cron');
const Booking = require('../models/Booking');
const Event = require('../models/Event');
const sendEmail = require('./sendEmail');

const startReminderScheduler = () => {
  cron.schedule('0 9 * * *', async () => {
    try {
      const now = new Date();
      const upcoming = await Booking.find({ bookingStatus: 'confirmed', reminderSent: false }).populate('event').populate('user', 'name email');

      for (const booking of upcoming) {
        if (!booking.event || !booking.event.date) continue;
        const eventDate = new Date(booking.event.date);
        const hoursUntil = (eventDate - now) / (1000 * 60 * 60);

        if (hoursUntil <= 24 && hoursUntil > 0) {
          await sendEmail({
            to: booking.user?.email,
            subject: `Reminder: ${booking.event.title} starts soon`,
            html: `<p>Hi ${booking.user?.name || 'there'}, your event <strong>${booking.event.title}</strong> is coming up soon. Please arrive 15 minutes early.</p>`,
          });
          booking.reminderSent = true;
          await booking.save();
        }
      }
    } catch (error) {
      console.warn('Reminder scheduler failed:', error.message);
    }
  });
};

module.exports = { startReminderScheduler };
