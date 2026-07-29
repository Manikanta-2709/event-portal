import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const StatCard = ({ label, value }) => (
  <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
    <p className="text-sm text-slate-500">{label}</p>
    <p className="text-3xl font-bold mt-1">{value}</p>
  </div>
);

const OrganizerDashboard = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [revenue, setRevenue] = useState(null);
  const isPendingApproval = user?.role === 'organizer' && !user.isApproved;

  const fetchData = () => {
    api.get('/events/organizer/mine').then((res) => setEvents(res.data.events));
    api.get('/events/organizer/revenue').then((res) => setRevenue(res.data));
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this event permanently?')) return;
    try {
      await api.delete(`/events/${id}`);
      toast.success('Event deleted');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleClose = async (id) => {
    try {
      await api.put(`/events/${id}/close-registration`);
      toast.success('Registrations closed');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const handleDuplicate = async (id) => {
    try {
      const res = await api.post(`/events/${id}/duplicate`);
      toast.success('Event duplicated as draft');
      if (res.data.event?._id) window.location.href = `/events/${res.data.event._id}/edit`;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Duplicate failed');
    }
  };

  const handleExport = async (id) => {
    try {
      const res = await api.get(`/events/${id}/attendees/export`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attendees-${id}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Export failed');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Organizer Dashboard</h1>
        {isPendingApproval ? (
          <span className="px-5 py-2.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 font-medium">
            Approval pending
          </span>
        ) : (
          <Link to="/events/create" className="px-5 py-2.5 rounded-full bg-primary-600 text-white font-medium hover:bg-primary-700">
            + Create Event
          </Link>
        )}
      </div>

      {isPendingApproval && (
        <div className="mb-8 rounded-2xl border border-amber-300 bg-amber-50 px-5 py-4 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
          Your organizer account is waiting for admin approval. You can view your dashboard, but event changes are locked until approval.
        </div>
      )}

      <div className="grid sm:grid-cols-3 gap-4 mb-10">
        <StatCard label="Total Events" value={revenue?.totalEvents ?? '—'} />
        <StatCard label="Total Bookings" value={revenue?.totalBookings ?? '—'} />
        <StatCard label="Revenue" value={revenue ? `₹${revenue.totalRevenue}` : '—'} />
      </div>

      {revenue?.byEvent?.length > 0 && (
        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-5 mb-10 h-80">
          <h2 className="font-semibold mb-4">Revenue by Event</h2>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={revenue.byEvent}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="title" tick={{ fontSize: 11 }} hide={revenue.byEvent.length > 6} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="revenue" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <h2 className="text-xl font-bold mb-4">My Events</h2>
      <div className="space-y-3">
        {events.map((ev) => (
          <div key={ev._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
            <div>
              <p className="font-semibold">{ev.title}</p>
              <p className="text-sm text-slate-500">
                {new Date(ev.date).toLocaleDateString()} · {ev.availableSeats}/{ev.maxSeats} seats left
                {ev.registrationClosed && ' · Closed'}
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Link to={`/events/${ev._id}`} className="text-sm px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700">View</Link>
              <Link to={`/events/${ev._id}/edit`} className="text-sm px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700">Edit</Link>
              <Link to={`/events/${ev._id}/attendees`} className="text-sm px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700">Attendees</Link>
              <button onClick={() => handleExport(ev._id)} className="text-sm px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700">Export</button>
              <button onClick={() => handleDuplicate(ev._id)} className="text-sm px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700">Duplicate</button>
              {!ev.registrationClosed && (
                <button onClick={() => handleClose(ev._id)} className="text-sm px-3 py-1.5 rounded-lg border border-amber-400 text-amber-600">Close Reg.</button>
              )}
              <button onClick={() => handleDelete(ev._id)} className="text-sm px-3 py-1.5 rounded-lg bg-rose-600 text-white">Delete</button>
            </div>
          </div>
        ))}
        {events.length === 0 && <p className="text-slate-500">No events created yet.</p>}
      </div>
    </div>
  );
};

export default OrganizerDashboard;
