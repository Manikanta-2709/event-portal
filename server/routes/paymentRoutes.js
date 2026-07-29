const express = require('express');
const Stripe = require('stripe');
const protect = require('../middleware/auth');

const router = express.Router();
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

router.post('/create-session', protect, async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({ success: false, message: 'Stripe is not configured' });
    }
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      currency: 'inr',
      payment_method_types: ['card'],
      line_items: [{ price_data: { currency: 'inr', product_data: { name: req.body.eventTitle || 'Event Ticket' }, unit_amount: Math.round(req.body.amount * 100) }, quantity: 1 }],
      success_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/bookings?payment=success`,
      cancel_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/events`,
    });

    res.json({ success: true, sessionId: session.id, url: session.url });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
