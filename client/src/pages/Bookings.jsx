import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../api/axios';

const statusColor = {
  confirmed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  cancelled: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
};

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = () => {
    setLoading(true);
    api.get('/bookings').then((res) => setBookings(res.data.bookings)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleCancel = async (id) => {
    if (!confirm('Cancel this booking?')) return;
    try {
      await api.delete(`/bookings/${id}`);
      toast.success('Booking cancelled');
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancel failed');
    }
  };

  const downloadConfirmation = (b) => {
    const content = `EVENTRA - BOOKING CONFIRMATION
--------------------------------
Booking ID: ${b._id}
Event: ${b.event?.title}
Venue: ${b.event?.venue}, ${b.event?.city}
Date: ${new Date(b.event?.date).toLocaleDateString()} at ${b.event?.time}
Tickets: ${b.numberOfTickets}
Total Paid: ₹${b.totalPrice}
Status: ${b.bookingStatus}
`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `booking-${b._id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-8">My Bookings</h1>

      {loading ? (
        <p className="text-slate-500">Loading...</p>
      ) : bookings.length === 0 ? (
        <p className="text-slate-500">No bookings yet.</p>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div key={b._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
              <div>
                <h3 className="font-semibold">{b.event?.title || 'Event removed'}</h3>
                <p className="text-sm text-slate-500">
                  {b.event && `${new Date(b.event.date).toLocaleDateString()} · ${b.event.venue}, ${b.event.city}`}
                </p>
                <p className="text-sm text-slate-500">{b.numberOfTickets} ticket(s) · ₹{b.totalPrice}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-semibold px-2 py-1 rounded-full capitalize ${statusColor[b.bookingStatus]}`}>
                  {b.bookingStatus}
                </span>
                <button onClick={() => downloadConfirmation(b)} className="text-sm px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700">
                  Download
                </button>
                {b.bookingStatus === 'confirmed' && (
                  <button onClick={() => handleCancel(b._id)} className="text-sm px-3 py-1.5 rounded-lg bg-rose-600 text-white">
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Bookings;
