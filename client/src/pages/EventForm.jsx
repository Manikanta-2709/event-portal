import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const categories = ['Music', 'Tech', 'Sports', 'Business', 'Arts', 'Food', 'Education', 'Other'];

const emptyForm = {
  title: '', description: '', category: 'Music', venue: '', city: '',
  date: '', time: '', ticketPrice: 0, maxSeats: 50, status: 'published',
};

// used for both Create Event and Edit Event, driven by presence of :id
const EventForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState(emptyForm);
  const [banner, setBanner] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      api.get(`/events/${id}`).then((res) => {
        const ev = res.data.event;
        setForm({
          title: ev.title,
          description: ev.description,
          category: ev.category,
          venue: ev.venue,
          city: ev.city,
          date: ev.date.slice(0, 10),
          time: ev.time,
          ticketPrice: ev.ticketPrice,
          maxSeats: ev.maxSeats,
          status: ev.status || 'published',
        });
      });
    }
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, v));
      if (banner) data.append('banner', banner);

      if (isEdit) {
        await api.put(`/events/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Event updated');
      } else {
        await api.post('/events', data, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Event created');
      }
      navigate('/dashboard/organizer');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (user?.role === 'organizer' && !user.isApproved) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="rounded-2xl border border-amber-300 bg-amber-50 px-6 py-5 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
          <h1 className="text-2xl font-bold mb-2">Approval pending</h1>
          <p>Your organizer account must be approved by an admin before you can create or edit events.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-8">{isEdit ? 'Edit Event' : 'Create Event'}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          required placeholder="Event title" value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent"
        />
        <textarea
          required placeholder="Description" rows={5} value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent"
        />
        <div className="grid grid-cols-2 gap-4">
          <select
            value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent"
          >
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <input
            required placeholder="City" value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            className="px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent"
          />
        </div>
        <input
          required placeholder="Venue" value={form.venue}
          onChange={(e) => setForm({ ...form, venue: e.target.value })}
          className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent"
        />
        <div className="grid grid-cols-2 gap-4">
          <input
            required type="date" value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent"
          />
          <input
            required type="time" value={form.time}
            onChange={(e) => setForm({ ...form, time: e.target.value })}
            className="px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <input
            required type="number" min={0} placeholder="Ticket price" value={form.ticketPrice}
            onChange={(e) => setForm({ ...form, ticketPrice: e.target.value })}
            className="px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent"
          />
          <input
            required type="number" min={1} placeholder="Maximum seats" value={form.maxSeats}
            onChange={(e) => setForm({ ...form, maxSeats: e.target.value })}
            className="px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <label className="text-sm text-slate-500 block mb-1">Publish status</label>
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
        <div>
          <label className="text-sm text-slate-500 block mb-1">Event banner</label>
          <input type="file" accept="image/*" onChange={(e) => setBanner(e.target.files[0])} />
        </div>
        <button
          disabled={loading}
          className="w-full py-2.5 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 disabled:opacity-60"
        >
          {loading ? 'Saving...' : isEdit ? 'Update Event' : 'Create Event'}
        </button>
      </form>
    </div>
  );
};

export default EventForm;
