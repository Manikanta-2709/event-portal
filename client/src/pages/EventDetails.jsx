import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

  const fetchEvent = () => {
    setLoading(true);
    api
      .get(`/events/${id}`)
      .then((res) => setEvent(res.data.event))
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

  const handleBook = async () => {
    if (!user) return navigate('/login');
    setBooking(true);
    try {
      await api.post('/bookings', { eventId: id, numberOfTickets: tickets });
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

  if (loading) return <div className="max-w-5xl mx-auto px-6 py-16 text-center">Loading...</div>;
  if (!event) return <div className="max-w-5xl mx-auto px-6 py-16 text-center">Event not found.</div>;

  const soldOut = event.availableSeats <= 0;
  const past = new Date(event.date) < new Date();

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="rounded-2xl overflow-hidden h-72 bg-slate-200 dark:bg-slate-800 mb-8">
        {event.banner?.url && <img src={event.banner.url} alt={event.title} className="w-full h-full object-cover" />}
      </div>

      <div className="grid md:grid-cols-3 gap-10">
        <div className="md:col-span-2">
          <span className="text-xs font-semibold uppercase text-primary-600">{event.category}</span>
          <h1 className="text-3xl font-bold mt-1 mb-4">{event.title}</h1>
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
            onClick={toggleFavorite}
            className="w-full py-2.5 mt-3 rounded-lg border border-slate-300 dark:border-slate-700 font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {isFavorite ? '♥ Saved' : '♡ Save to favorites'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
