import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { toast } from 'react-toastify';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState(1);
  const [booking, setBooking] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [paymentMode, setPaymentMode] = useState('demo');
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannerMessage, setScannerMessage] = useState('');

  const fetchEvent = () => {
    setLoading(true);
    api
      .get(`/events/${id}`)
      .then((res) => {
        setEvent(res.data.event);
        setReviews(res.data.reviews || []);
      })
      .catch(() => toast.error('Event not found'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchEvent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (user) {
      api.get('/users/favorites').then((res) => {
        setIsFavorite(res.data.favorites.some((f) => f._id === id));
      });
    }
  }, [user, id]);

  useEffect(() => {
    if (!scannerOpen) return;
    const scanner = new Html5QrcodeScanner('qr-reader', { fps: 10, qrbox: 250 }, false);
    scanner.render(async (decodedText) => {
      try {
        const res = await api.post('/bookings/check-in', { ticketCode: decodedText });
        setScannerMessage(res.data.message || 'Check-in successful');
        scanner.clear();
        setScannerOpen(false);
      } catch (error) {
        setScannerMessage(error.response?.data?.message || 'Scan failed');
      }
    });

    return () => scanner.clear().catch(() => {});
  }, [scannerOpen]);

  const handleBook = async () => {
    if (!user) return navigate('/login');
    setBooking(true);
    try {
      const payload = { eventId: id, numberOfTickets: tickets, couponCode, paymentProvider: paymentMode };
      if (paymentMode === 'stripe') {
        const paymentRes = await api.post('/payments/create-session', { eventTitle: event.title, amount: event.ticketPrice * tickets });
        window.location.href = paymentRes.data.url;
        return;
      }
      await api.post('/bookings', payload);
      toast.success('Booking confirmed!');
      fetchEvent();
      navigate('/bookings');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setBooking(false);
    }
  };

  const toggleFavorite = async () => {
    if (!user) return navigate('/login');
    const res = await api.post(`/users/favorites/${id}`);
    setIsFavorite(res.data.favorites.some((f) => f === id || f._id === id));
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    setSubmittingReview(true);
    try {
      const res = await api.post(`/events/${id}/reviews`, reviewForm);
      setEvent(res.data.event);
      toast.success('Thanks for your review!');
      setReviewForm({ rating: 5, comment: '' });
      fetchEvent();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Review failed');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <div className="max-w-5xl mx-auto px-6 py-16 text-center">Loading...</div>;
  if (!event) return <div className="max-w-5xl mx-auto px-6 py-16 text-center">Event not found.</div>;

  const soldOut = event.availableSeats <= 0;
  const past = new Date(event.date) < new Date();
  const ratingSummary = event.reviewsCount > 0
    ? `★ ${event.averageRating} from ${event.reviewsCount} review${event.reviewsCount === 1 ? '' : 's'}`
    : 'No reviews yet';

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="rounded-2xl overflow-hidden h-72 bg-slate-200 dark:bg-slate-800 mb-8">
        {event.banner?.url && <img src={event.banner.url} alt={event.title} className="w-full h-full object-cover" />}
      </div>

      <div className="grid md:grid-cols-3 gap-10">
        <div className="md:col-span-2">
          <span className="text-xs font-semibold uppercase text-primary-600">{event.category}</span>
          <h1 className="text-3xl font-bold mt-1 mb-4">{event.title}</h1>
          <p className="mb-4 text-sm font-semibold text-amber-500">{ratingSummary}</p>
          <p className="text-slate-600 dark:text-slate-300 whitespace-pre-line">{event.description}</p>

          <div className="grid sm:grid-cols-2 gap-4 mt-8 text-sm">
            <div><span className="text-slate-500">Venue: </span>{event.venue}</div>
            <div><span className="text-slate-500">City: </span>{event.city}</div>
            <div><span className="text-slate-500">Date: </span>{new Date(event.date).toLocaleDateString()}</div>
            <div><span className="text-slate-500">Time: </span>{event.time}</div>
            <div><span className="text-slate-500">Organizer: </span>{event.organizer?.name}</div>
            <div><span className="text-slate-500">Available seats: </span>{event.availableSeats} / {event.maxSeats}</div>
          </div>
        </div>

        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-6 h-fit sticky top-24">
          <p className="text-3xl font-bold mb-4">{event.ticketPrice === 0 ? 'Free' : `₹${event.ticketPrice}`}</p>

          {event.registrationClosed || soldOut || past ? (
            <button disabled className="w-full py-2.5 rounded-lg bg-slate-300 dark:bg-slate-700 text-slate-500 font-medium">
              {past ? 'Event ended' : event.registrationClosed ? 'Registration closed' : 'Sold out'}
            </button>
          ) : (
            <>
              <label className="text-sm text-slate-500 block mb-1">Number of tickets</label>
              <input
                type="number"
                min={1}
                max={event.availableSeats}
                value={tickets}
                onChange={(e) => setTickets(Math.max(1, Math.min(event.availableSeats, Number(e.target.value))))}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent mb-4"
              />
              <label className="text-sm text-slate-500 block mb-1">Coupon code</label>
              <input
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Optional"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent mb-3"
              />
              <label className="text-sm text-slate-500 block mb-1">Payment method</label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent mb-4"
              >
                <option value="demo">Demo</option>
                <option value="stripe">Stripe</option>
              </select>
              <button
                onClick={handleBook}
                disabled={booking}
                className="w-full py-2.5 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 disabled:opacity-60"
              >
                {booking ? 'Booking...' : `Book · ₹${event.ticketPrice * tickets}`}
              </button>
            </>
          )}

          <button
            onClick={() => {
              navigator.share?.({ title: event.title, text: `Join ${event.title}`, url: window.location.href });
            }}
            className="w-full py-2.5 mt-3 rounded-lg border border-slate-300 dark:border-slate-700 font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Share event
          </button>
          {(user?.role === 'organizer' || user?.role === 'admin') && (
            <button
              onClick={() => setScannerOpen(true)}
              className="w-full py-2.5 mt-3 rounded-lg border border-slate-300 dark:border-slate-700 font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Scan ticket QR
            </button>
          )}
          <button
            onClick={toggleFavorite}
            className="w-full py-2.5 mt-3 rounded-lg border border-slate-300 dark:border-slate-700 font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {isFavorite ? '♥ Saved' : '♡ Save to favorites'}
          </button>
        </div>
      </div>

      {scannerOpen && (
        <div className="mt-8 rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold">Check-in scanner</h2>
            <button onClick={() => setScannerOpen(false)} className="text-sm text-primary-600">Close</button>
          </div>
          <div id="qr-reader" className="w-full max-w-md mx-auto" />
          {scannerMessage && <p className="mt-3 text-sm text-emerald-600">{scannerMessage}</p>}
        </div>
      )}

      <div className="mt-12 grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <h2 className="text-2xl font-bold mb-4">Customer Reviews</h2>
          {reviews.length === 0 ? (
            <p className="text-slate-500">No reviews yet. Book the event and be the first to share feedback.</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review._id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold">{review.user?.name || 'Attendee'}</p>
                    <span className="text-sm font-semibold text-amber-500">★ {review.rating}</span>
                  </div>
                  {review.comment && <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{review.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </div>

        <form onSubmit={handleReviewSubmit} className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800 h-fit">
          <h3 className="font-bold mb-3">Add your review</h3>
          <p className="text-sm text-slate-500 mb-4">Only confirmed attendees can post reviews.</p>
          <label className="text-sm text-slate-500 block mb-1">Rating</label>
          <select
            value={reviewForm.rating}
            onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent mb-4"
          >
            {[5, 4, 3, 2, 1].map((rating) => (
              <option key={rating} value={rating}>{rating} star{rating === 1 ? '' : 's'}</option>
            ))}
          </select>
          <textarea
            value={reviewForm.comment}
            onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
            maxLength={600}
            rows={4}
            placeholder="What did you like about this event?"
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent mb-4"
          />
          <button
            disabled={submittingReview}
            className="w-full py-2.5 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 disabled:opacity-60"
          >
            {submittingReview ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EventDetails;
